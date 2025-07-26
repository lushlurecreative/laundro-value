import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper logging function for debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[AI-DEAL-ANALYSIS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) throw new Error('OPENAI_API_KEY is not set');
    logStep("OpenAI API key verified");

    // Use the service role key to perform writes (upsert) in Supabase
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Parse request body
    const { dealData, analysisType = 'comprehensive' } = await req.json();
    if (!dealData) throw new Error("Deal data is required");
    logStep("Request parsed", { analysisType, dealName: dealData.dealName });

    // Prepare deal summary for AI analysis
    const dealSummary = {
      dealName: dealData.dealName || 'Unnamed Deal',
      askingPrice: dealData.askingPrice || 0,
      grossIncomeAnnual: dealData.grossIncomeAnnual || 0,
      noi: dealData.noi || 0,
      capRate: dealData.capRate || 0,
      coCROI: dealData.coCROI || 0,
      dscr: dealData.dscr || 0,
      propertyAddress: dealData.propertyAddress || 'Not specified',
      facilitySizeSqft: dealData.facilitySizeSqft || 0,
      isRealEstateIncluded: dealData.isRealEstateIncluded || false,
      machineCount: dealData.machineCount || 0,
      totalOperatingExpenses: dealData.totalOperatingExpenses || 0,
      loanAmount: dealData.loanAmount || 0,
      downPaymentPercent: dealData.downPaymentPercent || 0,
      loanInterestRatePercent: dealData.loanInterestRatePercent || 0,
      loanTermYears: dealData.loanTermYears || 0,
      // Additional analysis data
      expenseRatio: dealData.totalOperatingExpenses && dealData.grossIncomeAnnual 
        ? (dealData.totalOperatingExpenses / dealData.grossIncomeAnnual * 100).toFixed(1)
        : 'N/A',
      revenuePerSqft: dealData.grossIncomeAnnual && dealData.facilitySizeSqft
        ? (dealData.grossIncomeAnnual / dealData.facilitySizeSqft).toFixed(2)
        : 'N/A',
      revenuePerMachine: dealData.grossIncomeAnnual && dealData.machineCount
        ? (dealData.grossIncomeAnnual / dealData.machineCount).toFixed(0)
        : 'N/A'
    };

    let systemPrompt = '';
    let userPrompt = '';

    switch (analysisType) {
      case 'comprehensive':
        systemPrompt = `You are an expert laundromat investment analyst with 20+ years of experience in commercial real estate and business acquisitions. You provide detailed, professional investment analysis with specific insights and actionable recommendations.

Key Analysis Areas:
1. Financial Performance Assessment
2. Market Position & Competitive Analysis
3. Risk Assessment & Mitigation
4. Value-Add Opportunities
5. Investment Recommendation (Buy/Hold/Pass)

Provide analysis in a structured, professional format suitable for serious investors and lenders.`;

        userPrompt = `Analyze this laundromat investment opportunity:

**DEAL OVERVIEW:**
- Property: ${dealSummary.dealName} at ${dealSummary.propertyAddress}
- Asking Price: $${dealSummary.askingPrice?.toLocaleString()}
- Gross Annual Income: $${dealSummary.grossIncomeAnnual?.toLocaleString()}
- Net Operating Income: $${dealSummary.noi?.toLocaleString()}
- Facility Size: ${dealSummary.facilitySizeSqft?.toLocaleString()} sq ft
- Machine Count: ${dealSummary.machineCount}
- Real Estate Included: ${dealSummary.isRealEstateIncluded ? 'Yes' : 'No'}

**KEY METRICS:**
- Cap Rate: ${dealSummary.capRate}%
- Cash-on-Cash ROI: ${dealSummary.coCROI}%
- DSCR: ${dealSummary.dscr}
- Operating Expense Ratio: ${dealSummary.expenseRatio}%
- Revenue/Sq Ft: $${dealSummary.revenuePerSqft}
- Revenue/Machine: $${dealSummary.revenuePerMachine}

**FINANCING:**
- Down Payment: ${dealSummary.downPaymentPercent}%
- Loan Amount: $${dealSummary.loanAmount?.toLocaleString()}
- Interest Rate: ${dealSummary.loanInterestRatePercent}%
- Loan Term: ${dealSummary.loanTermYears} years

Provide comprehensive analysis covering financial strength, market position, risks, opportunities, and clear investment recommendation with supporting rationale.`;
        break;

      case 'risk_assessment':
        systemPrompt = `You are a commercial real estate risk assessment specialist focused on laundromat investments. Identify and analyze potential risks, provide risk mitigation strategies, and assign risk scores.`;
        
        userPrompt = `Conduct a risk assessment for this laundromat investment:

Deal: ${dealSummary.dealName}
Price: $${dealSummary.askingPrice?.toLocaleString()}
Cap Rate: ${dealSummary.capRate}%
DSCR: ${dealSummary.dscr}
Location: ${dealSummary.propertyAddress}
Real Estate: ${dealSummary.isRealEstateIncluded ? 'Included' : 'Lease Only'}

Analyze risks in these categories:
1. Financial Risks (cash flow, debt service, market conditions)
2. Operational Risks (equipment, management, competition)
3. Market Risks (location, demographics, economic factors)
4. Legal/Regulatory Risks (zoning, permits, compliance)

Provide risk scores (1-10), mitigation strategies, and overall risk assessment.`;
        break;

      case 'market_insights':
        systemPrompt = `You are a market research analyst specializing in laundromat and service business investments. Provide insights on market trends, competitive positioning, and growth opportunities.`;
        
        userPrompt = `Provide market insights for this laundromat investment:

Property: ${dealSummary.dealName}
Location: ${dealSummary.propertyAddress}
Revenue/Sq Ft: $${dealSummary.revenuePerSqft}
Revenue/Machine: $${dealSummary.revenuePerMachine}
Facility Size: ${dealSummary.facilitySizeSqft?.toLocaleString()} sq ft

Analyze:
1. Market positioning vs. industry benchmarks
2. Revenue optimization opportunities
3. Competitive advantages/disadvantages
4. Growth potential and expansion possibilities
5. Industry trends affecting value`;
        break;

      case 'valuation':
        systemPrompt = `You are a certified business appraiser specializing in service businesses and commercial real estate. Provide detailed valuation analysis using multiple approaches.`;
        
        userPrompt = `Provide valuation analysis for this laundromat:

Current Asking Price: $${dealSummary.askingPrice?.toLocaleString()}
NOI: $${dealSummary.noi?.toLocaleString()}
Current Cap Rate: ${dealSummary.capRate}%
Gross Income: $${dealSummary.grossIncomeAnnual?.toLocaleString()}
Real Estate: ${dealSummary.isRealEstateIncluded ? 'Included' : 'Business Only'}

Provide valuation using:
1. Income Approach (Cap Rate Method)
2. Market Approach (Comparable Sales)
3. Asset-Based Approach (if applicable)
4. Recommended fair market value range
5. Price negotiation recommendations`;
        break;

      default:
        throw new Error(`Unknown analysis type: ${analysisType}`);
    }

    logStep("Calling OpenAI API", { systemPrompt: systemPrompt.substring(0, 100) + '...' });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;
    logStep("OpenAI analysis completed");

    // Track usage
    await supabaseClient.from('usage_tracking').insert({
      user_id: user.id,
      action_type: 'ai_analysis_generated',
      metadata: {
        analysisType,
        dealName: dealSummary.dealName,
        tokensUsed: data.usage?.total_tokens || 0
      }
    });

    logStep("Usage tracked successfully");

    return new Response(JSON.stringify({
      analysis,
      analysisType,
      dealName: dealSummary.dealName,
      timestamp: new Date().toISOString(),
      tokensUsed: data.usage?.total_tokens || 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in ai-deal-analysis", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
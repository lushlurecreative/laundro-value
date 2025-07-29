import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DealData {
  askingPrice?: number;
  grossIncomeAnnual?: number;
  annualNet?: number;
  facilitySizeSqft?: number;
  propertyAddress?: string;
  lease?: any;
  expenses?: any[];
  equipment?: any;
  machineInventory?: any[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { dealData, dealId, userId } = await req.json();
    const supabase = createClient(supabaseUrl!, supabaseKey!);

    console.log('🔍 Starting comprehensive AI analysis for deal:', dealId);

    // 1. Market Analysis
    const marketAnalysis = await performMarketAnalysis(dealData);
    
    // 2. Financial Analysis 
    const financialAnalysis = await performFinancialAnalysis(dealData);
    
    // 3. Risk Assessment
    const riskAssessment = await performRiskAssessment(dealData);
    
    // 4. Revenue Optimization
    const revenueOptimization = await performRevenueOptimization(dealData);
    
    // 5. Expense Validation
    const expenseValidation = await performExpenseValidation(dealData);
    
    // 6. Generate Recommendations
    const recommendations = await generateRecommendations(dealData, {
      market: marketAnalysis,
      financial: financialAnalysis,
      risk: riskAssessment,
      revenue: revenueOptimization
    });

    // Store all results in database
    const backgroundTasks = [
      storeDealAnalysis(supabase, dealId, userId, {
        market: marketAnalysis,
        financial: financialAnalysis,
        risk: riskAssessment,
        overall: calculateOverallScore(marketAnalysis, financialAnalysis, riskAssessment)
      }),
      storeMarketData(supabase, dealData.propertyAddress, marketAnalysis),
      storeExpenseAnalysis(supabase, dealId, userId, expenseValidation),
      storeRevenueProjections(supabase, dealId, userId, revenueOptimization),
      storeRiskAssessment(supabase, dealId, userId, riskAssessment),
      storeRecommendations(supabase, dealId, userId, recommendations)
    ];

    // Execute background tasks
    EdgeRuntime.waitUntil(Promise.all(backgroundTasks));

    return new Response(JSON.stringify({
      success: true,
      analysis: {
        market: marketAnalysis,
        financial: financialAnalysis,
        risk: riskAssessment,
        revenue: revenueOptimization,
        expenses: expenseValidation,
        recommendations: recommendations,
        overall: calculateOverallScore(marketAnalysis, financialAnalysis, riskAssessment)
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in comprehensive AI analyzer:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function performMarketAnalysis(dealData: DealData) {
  const prompt = `Analyze this laundromat market opportunity:
  
Address: ${dealData.propertyAddress}
Facility Size: ${dealData.facilitySizeSqft} sq ft
Asking Price: $${dealData.askingPrice?.toLocaleString()}
Annual Revenue: $${dealData.grossIncomeAnnual?.toLocaleString()}

Provide market analysis including:
1. Location quality assessment (0-100)
2. Competition level analysis
3. Demographic fit for laundromat
4. Market saturation assessment
5. Growth potential
6. Rent reasonableness vs market

Return JSON format with scores and detailed insights.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-2025-04-14',
      messages: [
        { role: 'system', content: 'You are an expert laundromat investment analyst. Provide detailed, data-driven market analysis.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
    }),
  });

  const data = await response.json();
  const analysis = data.choices[0].message.content;
  
  try {
    return JSON.parse(analysis);
  } catch {
    return { 
      score: 50, 
      insights: analysis,
      demographic_score: 50,
      competition_score: 50,
      location_quality: 50 
    };
  }
}

async function performFinancialAnalysis(dealData: DealData) {
  const prompt = `Analyze these laundromat financials:
  
Asking Price: $${dealData.askingPrice?.toLocaleString()}
Gross Revenue: $${dealData.grossIncomeAnnual?.toLocaleString()}
Net Income: $${dealData.annualNet?.toLocaleString()}
Expenses: ${JSON.stringify(dealData.expenses)}

Calculate and analyze:
1. Cap rate analysis
2. Cash-on-cash return potential
3. Revenue per square foot
4. Expense reasonableness
5. Financial red flags
6. Value assessment (overpriced/fair/underpriced)
7. Break-even analysis

Return JSON with scores and detailed financial metrics.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-2025-04-14',
      messages: [
        { role: 'system', content: 'You are a financial expert specializing in laundromat investments. Provide thorough financial analysis.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2,
    }),
  });

  const data = await response.json();
  const analysis = data.choices[0].message.content;
  
  try {
    return JSON.parse(analysis);
  } catch {
    return { 
      score: 50, 
      insights: analysis,
      cap_rate: 0,
      cash_on_cash: 0,
      value_assessment: 'unknown' 
    };
  }
}

async function performRiskAssessment(dealData: DealData) {
  const prompt = `Assess investment risks for this laundromat:
  
Property: ${dealData.propertyAddress}
Price: $${dealData.askingPrice?.toLocaleString()}
Revenue: $${dealData.grossIncomeAnnual?.toLocaleString()}
Lease: ${JSON.stringify(dealData.lease)}
Equipment: ${JSON.stringify(dealData.equipment)}

Analyze risks:
1. Market risks (competition, demographics)
2. Financial risks (cash flow, expenses)
3. Operational risks (equipment, management)
4. Lease risks (terms, increases)
5. Exit risks (resale potential)

Provide risk scores (0-100, higher = more risky) and mitigation strategies.
Return JSON format.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-2025-04-14',
      messages: [
        { role: 'system', content: 'You are a risk assessment specialist for real estate investments. Focus on identifying and quantifying risks.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
    }),
  });

  const data = await response.json();
  const analysis = data.choices[0].message.content;
  
  try {
    return JSON.parse(analysis);
  } catch {
    return { 
      overall_risk: 50, 
      insights: analysis,
      financial_risk: 50,
      market_risk: 50,
      operational_risk: 50 
    };
  }
}

async function performRevenueOptimization(dealData: DealData) {
  const prompt = `Analyze revenue optimization opportunities for this laundromat:
  
Current Revenue: $${dealData.grossIncomeAnnual?.toLocaleString()}
Facility Size: ${dealData.facilitySizeSqft} sq ft
Equipment: ${JSON.stringify(dealData.equipment)}
Machines: ${JSON.stringify(dealData.machineInventory)}

Identify:
1. Revenue per sq ft analysis
2. Equipment optimization opportunities
3. Pricing optimization potential
4. Additional service opportunities
5. Operational efficiency improvements
6. Timeline and investment required
7. Projected revenue increases

Return JSON with specific recommendations and projections.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-2025-04-14',
      messages: [
        { role: 'system', content: 'You are a laundromat operations expert focused on revenue optimization and business growth.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.4,
    }),
  });

  const data = await response.json();
  const analysis = data.choices[0].message.content;
  
  try {
    return JSON.parse(analysis);
  } catch {
    return { 
      current_revenue: dealData.grossIncomeAnnual || 0,
      projected_revenue: (dealData.grossIncomeAnnual || 0) * 1.1,
      opportunities: [analysis] 
    };
  }
}

async function performExpenseValidation(dealData: DealData) {
  if (!dealData.expenses || !Array.isArray(dealData.expenses)) {
    return [];
  }

  const validations = [];
  
  for (const expense of dealData.expenses) {
    const prompt = `Validate this laundromat expense:
    
Expense: ${expense.expenseName}
Amount: $${expense.amountAnnual?.toLocaleString()}
Revenue: $${dealData.grossIncomeAnnual?.toLocaleString()}
Facility Size: ${dealData.facilitySizeSqft} sq ft

Is this expense reasonable? What's the typical range for this category?
Provide percentage of revenue this should be and red flags to watch for.
Return JSON with validation and suggestions.`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4.1-2025-04-14',
          messages: [
            { role: 'system', content: 'You are an expert in laundromat operating expenses and cost validation.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.2,
        }),
      });

      const data = await response.json();
      let validation;
      
      try {
        validation = JSON.parse(data.choices[0].message.content);
      } catch {
        validation = {
          is_reasonable: true,
          notes: data.choices[0].message.content,
          confidence: 50
        };
      }

      validations.push({
        expense_name: expense.expenseName,
        reported_amount: expense.amountAnnual,
        ...validation
      });

    } catch (error) {
      console.error('Error validating expense:', expense.expenseName, error);
      validations.push({
        expense_name: expense.expenseName,
        reported_amount: expense.amountAnnual,
        is_reasonable: true,
        notes: 'Unable to validate',
        confidence: 0
      });
    }
  }

  return validations;
}

async function generateRecommendations(dealData: DealData, analyses: any) {
  const prompt = `Based on this comprehensive analysis, generate actionable recommendations:
  
Deal Summary:
- Price: $${dealData.askingPrice?.toLocaleString()}
- Revenue: $${dealData.grossIncomeAnnual?.toLocaleString()}
- Address: ${dealData.propertyAddress}

Analysis Results:
- Market Score: ${analyses.market.score}/100
- Financial Score: ${analyses.financial.score}/100
- Risk Score: ${analyses.risk.overall_risk}/100

Generate 5-10 prioritized recommendations covering:
1. Negotiation strategies
2. Financing optimization
3. Operational improvements
4. Risk mitigation
5. Exit planning

Each recommendation should include:
- Category (financing/negotiation/operation/exit)
- Priority (1-5)
- Impact score (0-100)
- Implementation difficulty (1-5)
- Estimated benefit ($)
- Timeframe

Return JSON array of recommendations.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-2025-04-14',
      messages: [
        { role: 'system', content: 'You are a strategic advisor for laundromat investments. Provide specific, actionable recommendations.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.5,
    }),
  });

  const data = await response.json();
  const recommendations = data.choices[0].message.content;
  
  try {
    return JSON.parse(recommendations);
  } catch {
    return [{
      category: 'analysis',
      priority: 3,
      title: 'Review Analysis',
      description: recommendations,
      impact_score: 50,
      implementation_difficulty: 2,
      timeframe: 'immediate'
    }];
  }
}

function calculateOverallScore(market: any, financial: any, risk: any) {
  const marketScore = market.score || 50;
  const financialScore = financial.score || 50;
  const riskScore = 100 - (risk.overall_risk || 50); // Invert risk score
  
  return Math.round((marketScore * 0.3 + financialScore * 0.5 + riskScore * 0.2));
}

// Database storage functions
async function storeDealAnalysis(supabase: any, dealId: string, userId: string, analysis: any) {
  const { error } = await supabase
    .from('deal_analysis')
    .upsert({
      deal_id: dealId,
      user_id: userId,
      overall_score: analysis.overall,
      market_score: analysis.market.score,
      financial_score: analysis.financial.score,
      risk_score: analysis.risk.overall_risk,
      key_insights: analysis,
      confidence_level: 85,
      analysis_summary: `Overall Score: ${analysis.overall}/100`,
      recommendation: analysis.market.insights || 'Analysis complete'
    });
  
  if (error) console.error('Error storing deal analysis:', error);
}

async function storeMarketData(supabase: any, address: string, marketData: any) {
  if (!address) return;
  
  const locationKey = address.toLowerCase().replace(/\s+/g, '-');
  
  const { error } = await supabase
    .from('market_data')
    .upsert({
      location_key: locationKey,
      address: address,
      demographic_score: marketData.demographic_score || 50,
      competition_score: marketData.competition_score || 50,
      market_opportunity_score: marketData.score || 50,
      population_data: marketData.demographics || {},
      competition_data: marketData.competition || {},
      market_trends: marketData.trends || {}
    });
    
  if (error) console.error('Error storing market data:', error);
}

async function storeExpenseAnalysis(supabase: any, dealId: string, userId: string, validations: any[]) {
  for (const validation of validations) {
    const { error } = await supabase
      .from('expense_analysis')
      .insert({
        deal_id: dealId,
        user_id: userId,
        expense_name: validation.expense_name,
        reported_amount: validation.reported_amount,
        is_reasonable: validation.is_reasonable,
        validation_notes: validation.notes,
        confidence_level: validation.confidence || 50
      });
      
    if (error) console.error('Error storing expense analysis:', error);
  }
}

async function storeRevenueProjections(supabase: any, dealId: string, userId: string, revenue: any) {
  const { error } = await supabase
    .from('revenue_projections')
    .upsert({
      deal_id: dealId,
      user_id: userId,
      current_revenue: revenue.current_revenue,
      projected_revenue: revenue.projected_revenue,
      optimization_opportunities: revenue.opportunities || [],
      confidence_level: 75,
      timeline_months: 12
    });
    
  if (error) console.error('Error storing revenue projections:', error);
}

async function storeRiskAssessment(supabase: any, dealId: string, userId: string, risk: any) {
  const { error } = await supabase
    .from('risk_assessments')
    .upsert({
      deal_id: dealId,
      user_id: userId,
      overall_risk_score: risk.overall_risk || 50,
      financial_risk_score: risk.financial_risk || 50,
      market_risk_score: risk.market_risk || 50,
      operational_risk_score: risk.operational_risk || 50,
      risk_factors: risk.factors || {},
      success_probability: 100 - (risk.overall_risk || 50)
    });
    
  if (error) console.error('Error storing risk assessment:', error);
}

async function storeRecommendations(supabase: any, dealId: string, userId: string, recommendations: any[]) {
  for (const rec of recommendations) {
    const { error } = await supabase
      .from('ai_recommendations')
      .insert({
        deal_id: dealId,
        user_id: userId,
        category: rec.category || 'general',
        priority: rec.priority || 3,
        title: rec.title || 'Recommendation',
        description: rec.description,
        impact_score: rec.impact_score || 50,
        implementation_difficulty: rec.implementation_difficulty || 3,
        estimated_benefit: rec.estimated_benefit,
        timeframe: rec.timeframe || 'TBD'
      });
      
    if (error) console.error('Error storing recommendation:', error);
  }
}
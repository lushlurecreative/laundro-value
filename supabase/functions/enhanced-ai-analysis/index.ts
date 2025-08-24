import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { dealData, userInput, analysisType } = await req.json();

    const systemPrompt = `You are an expert laundromat business analyst and investment advisor with 20+ years of experience. 
    You analyze deals comprehensively using current market data, industry standards, and financial modeling.
    
    Your analysis should be:
    - Data-driven and specific with numbers
    - Realistic about market conditions
    - Include both opportunities and risks
    - Reference current industry standards and trends
    - Consider local market factors when possible
    
    Always format currency as $X,XXX.XX and percentages as X.X%.`;

    let userPrompt = '';
    
    if (analysisType === 'comprehensive') {
      userPrompt = `Analyze this complete laundromat deal comprehensively:
      
      DEAL DATA:
      ${JSON.stringify(dealData, null, 2)}
      
      USER NOTES/QUESTIONS:
      ${userInput || 'General analysis requested'}
      
      Provide a comprehensive analysis covering:
      1. Financial performance and key metrics
      2. Market positioning and competitive analysis  
      3. Equipment assessment and replacement planning
      4. Income optimization opportunities
      5. Risk assessment and mitigation strategies
      6. Investment recommendation with reasoning
      7. Financing structure evaluation
      8. Exit strategy considerations
      
      Use current industry standards and market data in your analysis. Be specific with numbers and projections.`;
      
    } else if (analysisType === 'market-comparison') {
      userPrompt = `Compare this laundromat deal to current market standards:
      
      DEAL DATA:
      ${JSON.stringify(dealData, null, 2)}
      
      Analyze:
      1. How does this deal compare to industry benchmarks?
      2. Is the pricing competitive for the market?
      3. What are the key strengths and weaknesses?
      4. Market trends affecting this type of investment
      5. Specific recommendations for this deal
      
      Reference current industry data and comparable sales when possible.`;
      
    } else if (analysisType === 'risk-assessment') {
      userPrompt = `Conduct a thorough risk assessment for this laundromat investment:
      
      DEAL DATA:
      ${JSON.stringify(dealData, null, 2)}
      
      Identify and analyze:
      1. Financial risks (cash flow, debt service, market conditions)
      2. Operational risks (equipment, management, competition)
      3. Market risks (demographic changes, economic factors)
      4. Regulatory and compliance risks
      5. Risk mitigation strategies
      6. Worst-case scenario analysis
      7. Recommended contingency planning
      
      Provide specific, actionable risk management recommendations.`;
      
    } else {
      userPrompt = `Analyze this laundromat deal data:
      
      ${JSON.stringify(dealData, null, 2)}
      
      User request: ${userInput}
      
      Provide detailed insights based on current industry standards and best practices.`;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_completion_tokens: 4000,
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }

    const analysis = data.choices[0].message.content;

    return new Response(JSON.stringify({ 
      analysis,
      analysisType,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Enhanced AI Analysis error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      fallback: "AI analysis is temporarily unavailable. Please review your deal manually using industry standards."
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { dealData, analysisType } = await req.json();
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    let systemPrompt = '';
    switch (analysisType) {
      case 'field-extraction':
        systemPrompt = `You are an expert data extraction specialist for laundromat investment deals. Extract ALL relevant information from the provided text and return it in this JSON format:
        {
          "price": number (asking price or purchase price in dollars),
          "income": number (annual gross income in dollars),
          "rent": number (monthly rent in dollars),
          "size": number (facility size in square feet),
          "machines": number (number of machines),
          "hours": number (owner weekly hours),
          "expenses": {
            "rent": number (annual rent),
            "water": number (annual water costs),
            "gas": number (annual gas costs),
            "electricity": number (annual electricity costs),
            "insurance": number (annual insurance),
            "maintenance": number (annual maintenance),
            "supplies": number (annual supplies),
            "staff": number (annual staff salaries),
            "other": number (other annual expenses)
          },
          "lease": {
            "monthlyRent": number,
            "leaseTerm": number (years),
            "renewalOptions": number,
            "leaseType": string
          },
          "equipment": {
            "washers": number,
            "dryers": number,
            "avgAge": number,
            "avgCondition": number (1-5 scale)
          },
          "ancillary": {
            "vending": number (annual),
            "wdf": {
              "active": boolean,
              "pricePerLb": number,
              "volumeWeekly": number
            },
            "other": number (annual)
          }
        }
        Extract ALL available information. Only include fields you can confidently extract. Return valid JSON only.`;
        break;
      case 'deal-analysis':
        systemPrompt = `You are an expert laundromat investment analyst. Analyze the provided deal data and provide:
        1. Investment viability score (1-10)
        2. Key risks and opportunities
        3. Recommendations for improvement
        4. Market positioning insights
        5. Financial optimization suggestions`;
        break;
      case 'market-insights':
        systemPrompt = `You are a commercial real estate market expert specializing in laundromat businesses. Provide market insights for the location and deal type.`;
        break;
      case 'risk-assessment':
        systemPrompt = `You are a risk assessment specialist for laundromat investments. Identify and analyze all potential risks.`;
        break;
      default:
        systemPrompt = `You are a laundromat investment expert. Provide comprehensive analysis of the deal.`;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Analyze this laundromat deal: ${JSON.stringify(dealData)}` }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in openai-analysis function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
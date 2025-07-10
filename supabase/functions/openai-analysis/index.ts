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

    // Preprocess the input text to handle messy formatting
    const preprocessText = (text: string): string => {
      return text
        // Clean HTML entities
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        // Normalize whitespace and tabs
        .replace(/\t+/g, ' ')
        .replace(/\s{2,}/g, ' ')
        // Clean up line breaks
        .replace(/\n{3,}/g, '\n\n')
        // Standardize currency formats
        .replace(/\$([0-9,]+)K/gi, (match, num) => `$${parseInt(num.replace(/,/g, '')) * 1000}`)
        .replace(/\$([0-9,]+)M/gi, (match, num) => `$${parseInt(num.replace(/,/g, '')) * 1000000}`)
        // Normalize ranges
        .replace(/\$([0-9,]+)\s*[-–—]\s*\$?([0-9,]+)/g, '$1-$2')
        .trim();
    };

    let systemPrompt = '';
    switch (analysisType) {
      case 'field-extraction':
        systemPrompt = `Your task is to extract key information from the following text about a laundromat business for sale. Your response MUST be a single, valid JSON object and nothing else. Do not include any explanatory text, comments, or markdown formatting like \`\`\`json.

The JSON object must conform to the following schema. If a value for a field cannot be found in the text, either omit the key entirely or set its value to null. Do not invent or guess data. All currency values should be numbers without symbols or commas.

JSON Schema:

{
  "askingPrice": Number,
  "grossIncome": Number,
  "totalSqft": Number,
  "propertyAddress": "String",
  "lease": {
    "monthlyRent": Number,
    "remainingTermYears": Number,
    "renewalOptionsCount": Number
  },
  "equipment": {
    "washers": Number,
    "dryers": Number,
    "avgAge": Number
  },
  "expenses": {
    "rent": Number,
    "water": Number,
    "gas": Number,
    "electricity": Number,
    "insurance": Number,
    "maintenance": Number,
    "payroll": Number
  }
}`;
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
          { role: 'user', content: `Analyze this laundromat deal data (may contain messy formatting from spreadsheets): ${preprocessText(JSON.stringify(dealData))}` }
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
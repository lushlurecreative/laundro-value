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
        systemPrompt = `You are an expert data extraction specialist for laundromat investment deals. You must handle messy, real-world data including spreadsheet pastes, HTML artifacts, and inconsistent formatting.

CRITICAL INSTRUCTIONS:
1. Handle various price formats: "129k", "$129,000", "only $125,000", "Business Sell Price - $125,000"
2. Parse tabular data (equipment lists, expense tables) intelligently
3. For ranges like "$166-172K" or "$30-44K", extract the midpoint value
4. Count equipment from detailed tables - sum all washers and dryers separately
5. Map expense categories flexibly: "WATER & SEWER" → water, "REPAIRS & MAINT" → maintenance
6. Extract addresses from various formats including partial addresses
7. Identify revenue vs expenses vs asking price correctly
8. Handle mixed annual/monthly values - convert monthly to annual when appropriate

REAL-WORLD EXAMPLES TO HANDLE:
- "RENT $72,999" (annual rent expense)
- "Annual Revenue – $166 –172K" (use midpoint: 169000)
- "Business Sell Price - $125,000" (asking price)
- "25 washers of varied ages & sizes; 34 gas-fired dryers" (equipment counts)
- "footprint - 3000 sq ft" (size)
- Equipment tables with multiple rows and columns

Return ONLY valid JSON in this exact format:
{
  "price": number (asking/sell price in dollars - NOT revenue),
  "income": number (annual gross revenue/income in dollars),
  "rent": number (monthly rent in dollars, if property rent mentioned),
  "size": number (facility size in square feet),
  "machines": number (total machines = washers + dryers),
  "address": string (property address if mentioned),
  "expenses": {
    "rent": number (annual rent expense),
    "water": number (annual water & sewer costs),
    "gas": number (annual gas costs),
    "electricity": number (annual electric costs),
    "insurance": number (annual insurance),
    "maintenance": number (annual repairs & maintenance),
    "supplies": number (annual supplies),
    "other": number (other annual expenses like trash, permits, etc.)
  },
  "equipment": {
    "washers": number (total washer count),
    "dryers": number (total dryer count),
    "avgAge": number (estimated average age in years),
    "avgCondition": number (1-5 scale, estimate from equipment info)
  },
  "ancillary": {
    "vending": number (annual vending income if mentioned),
    "other": number (other ancillary income)
  }
}

VALIDATION RULES:
- Price should be asking/selling price (NOT revenue)
- Income should be annual revenue
- All expenses should be annual amounts
- Equipment counts must be integers
- Only include fields you can confidently extract
- Return valid JSON only - no explanations`;
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
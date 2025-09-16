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
    
    console.log('OpenAI Analysis - dealData:', dealData);
    console.log('OpenAI Analysis - analysisType:', analysisType);
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error('OPENAI_API_KEY is not set');
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
      case 'comprehensive-field-extraction':
        systemPrompt = `You are an expert data extraction AI for a laundromat analysis application. Your sole function is to parse unstructured text from a business listing and convert it into a structured JSON object.

Analyze the text provided after the "---" separator. Extract the following fields according to the specified data types.

**Required Fields:**
- \`asking_price\` (Number, do not include commas or currency symbols. If a range is given, use the highest number.)
- \`total_income\` (Number, annual unless specified otherwise.)
- \`net_income\` (Number, annual unless specified otherwise.)
- \`cash_flow_ebitda\` (Number, annual unless specified otherwise.)
- \`rent_monthly\` (Number, calculate from annual if necessary.)
- \`square_footage\` (Number)
- \`address_street\` (String)
- \`address_city\` (String)
- \`address_state\` (String)
- \`address_zip\` (String)
- \`equipment_issues\` (Array of Strings. List all broken, non-working, or explicitly mentioned "needed" items.)
- \`real_estate_included\` (Boolean, true if the property is included in the sale, false if it is a lease.)

**Rules of Extraction:**
1.  If a value for a specific field is not mentioned or cannot be found in the text, you MUST use the JSON value \`null\`. Do not omit the field.
2.  Do not make up, infer, or calculate any values unless explicitly instructed to (e.g., calculating monthly rent from an annual figure). Only extract data that is stated in the text.
3.  Your final response MUST be a single, valid JSON object.
4.  Do not include any introductory text, apologies, explanations, or any text whatsoever before the opening \`{\` or after the closing \`}\` of the JSON object.

---`;
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

    const requestBody = {
      model: 'gpt-5-2025-08-07',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Analyze this laundromat deal data (may contain messy formatting from spreadsheets): ${preprocessText(dealData.text || JSON.stringify(dealData))}` }
      ],
      max_completion_tokens: 2000,
    };

    console.log('Making OpenAI API request with model:', requestBody.model);
    console.log('Request body preview:', JSON.stringify(requestBody).substring(0, 500) + '...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('OpenAI API response status:', response.status);
    console.log('OpenAI API response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error response:', errorText);
      throw new Error(`OpenAI API error: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('OpenAI API response data:', data);
    
    const analysis = data.choices[0]?.message?.content;
    console.log('Extracted analysis:', analysis);

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
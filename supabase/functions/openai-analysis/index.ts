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
2. Parse tabular data (equipment lists, expense tables, lease tables) intelligently
3. For ranges like "$166-172K" or "$30-44K", extract the midpoint value
4. Count equipment from detailed tables - sum all washers and dryers separately
5. Map expense categories flexibly: "WATER & SEWER" → water, "REPAIRS & MAINT" → maintenance
6. Extract addresses from various formats including partial addresses
7. Identify revenue vs expenses vs asking price correctly
8. Handle mixed annual/monthly values - convert monthly to annual when appropriate
9. PARSE LEASE TERMS: "Ten Years" → 10, "Two (2) five (5) year renewal terms" → renewals: 2, length: 5
10. EXTRACT RENT INCREASES: "increase by 2.25% annually" → 2.25
11. PARSE EQUIPMENT TABLES: Extract individual machines from tabular data with Size, Qty, Type, Brand, Model, Year columns

LEASE DATA EXAMPLES TO HANDLE:
- "Term: Ten Years" → 10 years
- "Two (2) five (5) year renewal terms" → 2 renewals of 5 years each
- "rent to increase by 2.25% annually" → 2.25% increase
- "Monthly Base Rent Year 1: $3,998.00" → $3998 monthly rent
- Rent schedules with year-by-year breakdowns

EQUIPMENT TABLE EXAMPLES:
- "Washer	12#	5	Top Loader	Speedqueen	SWT521	2009" → 5 washers
- "Dryer	30#	28	Doublestack	Speedqueen	STT30	2014/15" → 28 dryers
- Sum all equipment quantities from detailed tables

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
  "lease": {
    "monthlyRent": number (monthly rent from lease schedule),
    "leaseTerm": number (total lease term in years),
    "remainingTermYears": number (remaining lease term in years),
    "renewalOptionsCount": number (number of renewal options),
    "renewalOptionLengthYears": number (length of each renewal option in years),
    "annualRentIncreasePercent": number (annual rent increase percentage),
    "leaseType": string (NNN, Modified Gross, Full Service, etc.)
  },
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
    "washers": number (total washer count from detailed tables),
    "dryers": number (total dryer count from detailed tables),
    "avgAge": number (estimated average age in years),
    "avgCondition": number (1-5 scale, estimate from equipment info),
    "detailedInventory": [
      {
        "type": string (Washer/Dryer),
        "size": string (capacity),
        "quantity": number,
        "brand": string,
        "model": string,
        "year": number
      }
    ]
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
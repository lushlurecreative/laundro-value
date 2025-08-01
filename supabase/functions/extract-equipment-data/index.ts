import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { equipmentText } = await req.json();
    
    if (!equipmentText || typeof equipmentText !== 'string') {
      return new Response(JSON.stringify({ error: 'Equipment text is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Processing equipment text:', equipmentText);

    const systemPrompt = `You are a data extraction expert specializing in laundromat equipment inventory. Your task is to parse unstructured equipment descriptions into structured JSON data.

IMPORTANT FORMATTING RULES:
1. Extract equipment name, quantity, capacity (weight), brand, and condition
2. Parse capacity from indicators like "35#", "50#", "20lb", "25 lb" etc.
3. Identify condition from parenthetical notes like "(NOT WORKING)", "(BROKEN)", "(NEEDS REPAIR)"
4. Extract brand names like "Speed Queen", "Maytag", "Dexter", "Huebsch", etc.
5. Handle variations like "32- 35# SPEED QUEEN DRYER POCKETS" = 32 units, 35lb capacity

REQUIRED JSON SCHEMA - Return ONLY valid JSON array:
[{
  "name": "string - equipment name without quantity/capacity",
  "quantity": number - count of units,
  "capacity": number - capacity in pounds (extract from #, lb indicators),
  "brand": "string - manufacturer brand if identifiable",
  "condition": "string - working/not working/needs repair based on notes"
}]

EXAMPLES:
Input: "32- 35# SPEED QUEEN DRYER POCKETS"
Output: [{"name": "Dryer Pockets", "quantity": 32, "capacity": 35, "brand": "Speed Queen", "condition": "working"}]

Input: "5 - 50# SPEED QUEEN WASHERS (NOT WORKING)"
Output: [{"name": "Washers", "quantity": 5, "capacity": 50, "brand": "Speed Queen", "condition": "not working"}]`;

    const userPrompt = `Extract the equipment details from the following text and return ONLY a JSON array following the exact schema specified:

${equipmentText}`;

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
        temperature: 0.1,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const extractedContent = data.choices[0].message.content;

    console.log('Raw OpenAI response:', extractedContent);

    // Parse the JSON response
    let parsedEquipment;
    try {
      // Clean the response to extract just the JSON array
      const jsonMatch = extractedContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        parsedEquipment = JSON.parse(jsonMatch[0]);
      } else {
        parsedEquipment = JSON.parse(extractedContent);
      }
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      throw new Error('Failed to parse equipment data from AI response');
    }

    // Validate the parsed data
    if (!Array.isArray(parsedEquipment)) {
      throw new Error('AI response is not a valid array');
    }

    // Validate each equipment item
    const validatedEquipment = parsedEquipment.map((item, index) => {
      if (!item.name || typeof item.name !== 'string') {
        throw new Error(`Equipment item ${index + 1} missing valid name`);
      }
      if (!item.quantity || typeof item.quantity !== 'number' || item.quantity < 1) {
        throw new Error(`Equipment item ${index + 1} missing valid quantity`);
      }
      
      return {
        name: item.name.trim(),
        quantity: Math.floor(item.quantity),
        capacity: item.capacity && typeof item.capacity === 'number' ? item.capacity : 0,
        brand: item.brand && typeof item.brand === 'string' ? item.brand.trim() : '',
        condition: item.condition && typeof item.condition === 'string' ? item.condition.trim() : 'working'
      };
    });

    console.log('Successfully parsed equipment:', validatedEquipment);

    return new Response(JSON.stringify({ 
      success: true, 
      equipment: validatedEquipment,
      originalText: equipmentText
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Equipment extraction error:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message || 'Failed to extract equipment data'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
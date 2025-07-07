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
    const { state, zipCode } = await req.json();
    
    const eiaKey = Deno.env.get('EIA_API_KEY');

    let results = {};

    if (eiaKey) {
      try {
        // Get electricity prices by state
        const electricityResponse = await fetch(
          `https://api.eia.gov/v2/electricity/retail-sales/data/?frequency=annual&data[0]=customers&data[1]=price&data[2]=revenue&data[3]=sales&facets[stateid][]=${state}&sort[0][column]=period&sort[0][direction]=desc&offset=0&length=5000&api_key=${eiaKey}`
        );
        
        if (electricityResponse.ok) {
          const electricityData = await electricityResponse.json();
          results = { ...results, electricityRates: electricityData };
        }

        // Get natural gas prices
        const gasResponse = await fetch(
          `https://api.eia.gov/v2/natural-gas/pri/sum/data/?frequency=annual&data[0]=value&facets[duoarea][]=${state}&sort[0][column]=period&sort[0][direction]=desc&offset=0&length=5000&api_key=${eiaKey}`
        );
        
        if (gasResponse.ok) {
          const gasData = await gasResponse.json();
          results = { ...results, gasRates: gasData };
        }

      } catch (error) {
        console.error('EIA API error:', error);
      }
    }

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in energy-analysis function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
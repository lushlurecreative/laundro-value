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
    const { zipCode, city, state } = await req.json();
    
    const censusKey = Deno.env.get('CENSUS_API_KEY');
    const dataGovKey = Deno.env.get('DATA_GOV_API_KEY');

    let results = {};

    // Get census demographic data
    if (censusKey && zipCode) {
      try {
        const censusResponse = await fetch(
          `https://api.census.gov/data/2019/acs/acs5?get=B01001_001E,B19013_001E,B25001_001E,B08303_001E&for=zip%20code%20tabulation%20area:${zipCode}&key=${censusKey}`
        );
        
        if (censusResponse.ok) {
          const censusData = await censusResponse.json();
          const demographics = {
            population: censusData[1]?.[0] || 'N/A',
            medianIncome: censusData[1]?.[1] || 'N/A',
            housingUnits: censusData[1]?.[2] || 'N/A',
            commuteTime: censusData[1]?.[3] || 'N/A'
          };
          results = { ...results, demographics };
        }
      } catch (error) {
        console.error('Census API error:', error);
      }
    }

    // Get additional government data from Data.gov
    if (dataGovKey && city && state) {
      try {
        const dataGovResponse = await fetch(
          `https://api.data.gov/ed/collegescorecard/v1/schools.json?school.city=${encodeURIComponent(city)}&school.state=${state}&api_key=${dataGovKey}&_per_page=5`
        );
        
        if (dataGovResponse.ok) {
          const educationData = await dataGovResponse.json();
          results = { ...results, educationData };
        }
      } catch (error) {
        console.error('Data.gov API error:', error);
      }
    }

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in demographics-analysis function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
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
    const { address, type } = await req.json();
    
    const alphaVantageKey = Deno.env.get('ALPHAVANTAGE_API_KEY');
    const rentcastKey = Deno.env.get('RENTCAST_API_KEY');
    const googlePlacesKey = Deno.env.get('GOOGLE_PLACES_API_KEY');
    const serpApiKey = Deno.env.get('SERPAPI_KEY');

    let results = {};

    // Get rental market data from RentCast
    if (rentcastKey && address) {
      try {
        const rentcastResponse = await fetch(
          `https://api.rentcast.io/v1/avm/rent/long-term?address=${encodeURIComponent(address)}`,
          {
            headers: {
              'X-Api-Key': rentcastKey,
            },
          }
        );
        
        if (rentcastResponse.ok) {
          const rentData = await rentcastResponse.json();
          results = { ...results, rentalData: rentData };
        }
      } catch (error) {
        console.error('RentCast API error:', error);
      }
    }

    // Get location data from Google Places
    if (googlePlacesKey && address) {
      try {
        const placesResponse = await fetch(
          `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(address)}&key=${googlePlacesKey}`
        );
        
        if (placesResponse.ok) {
          const placesData = await placesResponse.json();
          results = { ...results, locationData: placesData };
        }
      } catch (error) {
        console.error('Google Places API error:', error);
      }
    }

    // Get local business insights from SerpAPI
    if (serpApiKey && address) {
      try {
        const serpResponse = await fetch(
          `https://serpapi.com/search.json?engine=google_local&q=laundromat+near+${encodeURIComponent(address)}&api_key=${serpApiKey}`
        );
        
        if (serpResponse.ok) {
          const serpData = await serpResponse.json();
          results = { ...results, competitorData: serpData };
        }
      } catch (error) {
        console.error('SerpAPI error:', error);
      }
    }

    // Get financial market indicators from Alpha Vantage
    if (alphaVantageKey) {
      try {
        const financeResponse = await fetch(
          `https://www.alphavantage.co/query?function=REAL_GDP&interval=annual&apikey=${alphaVantageKey}`
        );
        
        if (financeResponse.ok) {
          const financeData = await financeResponse.json();
          results = { ...results, economicData: financeData };
        }
      } catch (error) {
        console.error('Alpha Vantage API error:', error);
      }
    }

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in market-data function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
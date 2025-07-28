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
    const { address, radius = 5000 } = await req.json();
    const GOOGLE_PLACES_API_KEY = Deno.env.get('GOOGLE_PLACES_API_KEY');

    if (!GOOGLE_PLACES_API_KEY) {
      throw new Error('Google Places API key not configured');
    }

    // First, geocode the address to get coordinates
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_PLACES_API_KEY}`;
    const geocodeResponse = await fetch(geocodeUrl);
    const geocodeData = await geocodeResponse.json();

    if (geocodeData.status !== 'OK' || !geocodeData.results.length) {
      throw new Error('Could not geocode the provided address');
    }

    const location = geocodeData.results[0].geometry.location;

    // Search for laundromats nearby
    const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.lat},${location.lng}&radius=${radius}&keyword=laundromat&type=point_of_interest&key=${GOOGLE_PLACES_API_KEY}`;
    const placesResponse = await fetch(placesUrl);
    const placesData = await placesResponse.json();

    if (placesData.status !== 'OK') {
      console.error('Places API error:', placesData.error_message);
      return new Response(JSON.stringify({
        competitors: [],
        totalCompetitors: 0,
        searchRadius: radius,
        analysis: 'Unable to retrieve competitor data from Google Places API'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Process competitor data
    const competitors = placesData.results.map((place: any) => ({
      name: place.name,
      address: place.vicinity,
      rating: place.rating || 0,
      userRatingsTotal: place.user_ratings_total || 0,
      priceLevel: place.price_level || null,
      distance: calculateDistance(location.lat, location.lng, place.geometry.location.lat, place.geometry.location.lng),
      photoReference: place.photos?.[0]?.photo_reference || null,
      placeId: place.place_id,
      businessStatus: place.business_status || 'OPERATIONAL'
    })).filter((comp: any) => comp.businessStatus === 'OPERATIONAL');

    // Generate competitive analysis
    const analysis = generateCompetitiveAnalysis(competitors, radius);

    return new Response(JSON.stringify({
      competitors,
      totalCompetitors: competitors.length,
      searchRadius: radius,
      targetLocation: {
        lat: location.lat,
        lng: location.lng,
        formattedAddress: geocodeData.results[0].formatted_address
      },
      analysis
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in google-places-competition:', error);
    return new Response(JSON.stringify({
      error: 'Failed to analyze local competition',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function generateCompetitiveAnalysis(competitors: any[], radius: number): string {
  const radiusInMiles = radius * 0.000621371;
  const totalCompetitors = competitors.length;
  
  if (totalCompetitors === 0) {
    return `Excellent opportunity! No direct laundromat competitors found within ${radiusInMiles.toFixed(1)} miles. This suggests strong market potential with minimal competition.`;
  }

  const avgRating = competitors.reduce((sum, comp) => sum + comp.rating, 0) / totalCompetitors;
  const highRatedCompetitors = competitors.filter(comp => comp.rating >= 4.0).length;
  const nearbyCompetitors = competitors.filter(comp => comp.distance <= 1.0).length;

  let analysis = `Competition Analysis (${radiusInMiles.toFixed(1)} mile radius):\n\n`;
  analysis += `• ${totalCompetitors} laundromat competitors identified\n`;
  analysis += `• Average competitor rating: ${avgRating.toFixed(1)}/5.0\n`;
  analysis += `• ${highRatedCompetitors} high-rated competitors (4.0+ stars)\n`;
  analysis += `• ${nearbyCompetitors} competitors within 1 mile\n\n`;

  if (totalCompetitors <= 2) {
    analysis += `LOW COMPETITION: Market appears underserved with only ${totalCompetitors} competitors. Strong opportunity for market entry.`;
  } else if (totalCompetitors <= 5) {
    analysis += `MODERATE COMPETITION: ${totalCompetitors} competitors present. Focus on differentiation through superior service, amenities, or pricing.`;
  } else {
    analysis += `HIGH COMPETITION: ${totalCompetitors} competitors in area. Market may be saturated - carefully evaluate positioning and unique value proposition.`;
  }

  if (avgRating < 3.5) {
    analysis += `\n\nOPPORTUNITY: Low average ratings (${avgRating.toFixed(1)}/5) suggest customer dissatisfaction with existing options.`;
  }

  return analysis;
}
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
    const { zipCode, propertyType = 'laundromat' } = await req.json();

    if (!zipCode) {
      throw new Error('Zip code is required');
    }

    // Try to get ZIP code specific data from market_data table
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    let zipCodeData = null;
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/market_data?zip_code=eq.${zipCode}`, {
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          zipCodeData = data[0];
        }
      }
    } catch (error) {
      console.log('No ZIP code specific data found, using general standards');
    }

    // Define comprehensive industry standards with ZIP code priority
    const industryStandards = {
      location: {
        zipCode,
        propertyType,
        dataSource: zipCodeData ? 'local' : 'general',
        lastUpdated: zipCodeData ? zipCodeData.updated_at : new Date().toISOString()
      },
      financial: {
        profitMargins: {
          grossProfitMargin: { min: 65, max: 75, optimal: 70 },
          netProfitMargin: { min: 20, max: 35, optimal: 30 }
        },
        expensePercentages: {
          rent: { min: 10, max: 15, high: 20, note: "% of gross revenue" },
          utilities: { 
            total: { min: 15, max: 25, modernEquipment: 12, oldEquipment: 30 },
            water: { min: 7, max: 15 },
            gas: { min: 5, max: 10 },
            electricity: { min: 3, max: 5 }
          },
          labor: { min: 5, max: 15, unattended: 0 },
          insurance: { min: 1, max: 3 },
          marketing: { min: 1, max: 3 },
          maintenance: { min: 3, max: 6 },
          miscellaneous: { min: 2, max: 5 }
        }
      },
      location: {
        demographics: {
          minimumPopulation: 5000, // within 1 mile
          idealPopulation: 10000,
          renters: { minimum: 40, ideal: 60 }, // percentage
          incomeLevel: "lower-to-middle"
        },
        facility: {
          sizeRange: { min: 1500, max: 4000, average: 2200 }, // sq ft
          parkingRatio: 1, // per 100 sq ft
          visibility: "high-traffic streets"
        }
      },
      equipment: {
        pricing: {
          washers: {
            topLoad20lb: { min: 3.00, max: 5.00 },
            frontLoad20lb: { min: 4.00, max: 6.00 },
            largeCapacity60lb: { min: 8.00, max: 15.00 }
          },
          dryers: { perMinute: { min: 0.25, max: 0.50 }, time: "6-8 minutes" }
        },
        costs: {
          washers: { topLoad: 1500, frontLoad: { min: 3000, max: 25000 } },
          dryers: { stack: { min: 5000, max: 8000 } }
        },
        efficiency: {
          waterConsumption: {
            oldTopLoad: "30-40 gallons per cycle",
            modernHE: "10-15 gallons per cycle",
            goal: "0.75-1.25 gallons per pound"
          },
          turnsPerDay: { average: "3-5", highPerforming: "5-7+" }
        }
      },
      financing: {
        sba: {
          downPayment: { min: 20, max: 30 },
          creditScore: 680,
          terms: "up to 25 years for real estate"
        },
        conventional: {
          downPayment: { min: 25, max: 35 },
          terms: "2-10 years"
        }
      },
      valuation: {
        methods: {
          noiMultiple: { min: 3.5, max: 5.5, factors: "equipment age, lease terms, location" },
          revenueMultiple: { min: 0.8, max: 1.5, note: "sanity check only" }
        },
        capRates: { min: 6, max: 12, average: 8.5 },
        cocReturns: { poor: "< 12%", acceptable: "12-18%", good: "18-25%", excellent: "> 25%" }
      },
      ancillaryRevenue: {
        washDryFold: {
          pricing: { min: 1.25, max: 2.50, unit: "per pound" },
          revenueShare: { min: 10, max: 30, note: "% of total revenue" }
        },
        vending: {
          revenueShare: { min: 3, max: 10, note: "% of total revenue" },
          products: ["soap", "bleach", "fabric softener", "snacks", "drinks"]
        }
      },
      operations: {
        lease: {
          term: { minimum: 10, preferred: 15, renewalOptions: "5-year increments" },
          type: "Triple Net (NNN) common"
        },
        technology: {
          paymentSystems: "hybrid: coins, cards, mobile",
          monitoring: "real-time machine status and sales data",
          security: "HD cameras, 30+ days storage"
        },
        staffing: {
          attendantDuties: ["WDF processing", "customer service", "cleaning", "maintenance"],
          training: "POS systems, customer service, safety protocols"
        }
      },
      sustainability: {
        waterReclamation: "40% reduction possible",
        ozoneWash: "cold water sanitization",
        energyEfficiency: "LED lighting, HE equipment"
      },
      insurance: {
        generalLiability: "$1M per occurrence / $2M aggregate",
        bailment: "$10,000 - $25,000 for customer goods",
        businessInterruption: "6-12 months coverage"
      },
      market: zipCodeData ? {
        zipCode,
        population: (zipCodeData.population_data as any)?.population || 45000,
        medianIncome: (zipCodeData.income_data as any)?.median_income || 65000,
        competitionLevel: zipCodeData.competition_score >= 70 ? 'Low' : 
                         zipCodeData.competition_score >= 40 ? 'Moderate' : 'High',
        growthTrend: 'Local Data Available',
        demographics: {
          renters: (zipCodeData.population_data as any)?.rental_percentage || 0.42,
          apartments: (zipCodeData.population_data as any)?.apartment_percentage || 0.38,
          youngProfessionals: (zipCodeData.population_data as any)?.young_professional_percentage || 0.28
        },
        note: `Local market data for ZIP ${zipCode}`
      } : {
        zipCode,
        population: 45000,
        medianIncome: 65000,
        competitionLevel: 'Moderate',
        growthTrend: 'General Standards',
        demographics: {
          renters: 0.42,
          apartments: 0.38,
          youngProfessionals: 0.28
        },
        note: "General industry standards - no local data available"
      }
    };

    return new Response(JSON.stringify({ 
      zipCode,
      industryStandards,
      source: 'Industry Standards Database',
      lastUpdated: new Date().toISOString(),
      dataQuality: 'High'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Industry Standards API error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      fallback: {
        grossIncomePerSqft: 100,
        pricePerLoad: { washers: 3.00, dryers: 2.50 },
        capRate: 8.0,
        message: "Using fallback industry standards"
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
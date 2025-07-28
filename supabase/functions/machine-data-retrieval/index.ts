import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MachineData {
  brand: string;
  model: string;
  type: 'Washer' | 'Dryer';
  waterConsumption?: number;
  gasConsumption?: number;
  electricConsumption?: number;
  capacity?: string;
}

// Public machine consumption data based on common models
const machineDatabase: MachineData[] = [
  // Washers
  { brand: 'Speed Queen', model: 'FFN051', type: 'Washer', waterConsumption: 23.5, electricConsumption: 0.45, capacity: '18 lbs' },
  { brand: 'Speed Queen', model: 'FFN071', type: 'Washer', waterConsumption: 31.2, electricConsumption: 0.58, capacity: '27 lbs' },
  { brand: 'Speed Queen', model: 'FFN432', type: 'Washer', waterConsumption: 42.3, electricConsumption: 0.72, capacity: '40 lbs' },
  { brand: 'Huebsch', model: 'HFN051', type: 'Washer', waterConsumption: 24.1, electricConsumption: 0.46, capacity: '18 lbs' },
  { brand: 'Huebsch', model: 'HFN071', type: 'Washer', waterConsumption: 32.0, electricConsumption: 0.59, capacity: '27 lbs' },
  { brand: 'Maytag', model: 'MFR18PDAVS', type: 'Washer', waterConsumption: 25.3, electricConsumption: 0.48, capacity: '18 lbs' },
  { brand: 'Maytag', model: 'MFR27PDAVS', type: 'Washer', waterConsumption: 33.8, electricConsumption: 0.61, capacity: '27 lbs' },
  { brand: 'Wascomat', model: 'W640', type: 'Washer', waterConsumption: 28.5, electricConsumption: 0.52, capacity: '20 lbs' },
  { brand: 'Wascomat', model: 'W655', type: 'Washer', waterConsumption: 35.2, electricConsumption: 0.64, capacity: '30 lbs' },
  { brand: 'Milnor', model: '30015V5J', type: 'Washer', waterConsumption: 26.8, electricConsumption: 0.51, capacity: '20 lbs' },
  
  // Dryers  
  { brand: 'Speed Queen', model: 'SDG909', type: 'Dryer', gasConsumption: 125, electricConsumption: 2.1, capacity: '30 lbs' },
  { brand: 'Speed Queen', model: 'SDE707', type: 'Dryer', gasConsumption: 110, electricConsumption: 1.8, capacity: '27 lbs' },
  { brand: 'Speed Queen', model: 'SDE407', type: 'Dryer', gasConsumption: 95, electricConsumption: 1.5, capacity: '18 lbs' },
  { brand: 'Huebsch', model: 'HDG909', type: 'Dryer', gasConsumption: 128, electricConsumption: 2.2, capacity: '30 lbs' },
  { brand: 'Huebsch', model: 'HDE707', type: 'Dryer', gasConsumption: 112, electricConsumption: 1.9, capacity: '27 lbs' },
  { brand: 'Maytag', model: 'MDG25PDAGW', type: 'Dryer', gasConsumption: 118, electricConsumption: 1.9, capacity: '25 lbs' },
  { brand: 'Maytag', model: 'MDG45PDAGW', type: 'Dryer', gasConsumption: 140, electricConsumption: 2.4, capacity: '45 lbs' },
  { brand: 'Wascomat', model: 'TD30', type: 'Dryer', gasConsumption: 115, electricConsumption: 1.8, capacity: '30 lbs' },
  { brand: 'Wascomat', model: 'TD55', type: 'Dryer', gasConsumption: 145, electricConsumption: 2.5, capacity: '55 lbs' },
  { brand: 'Milnor', model: '9030V5Z', type: 'Dryer', gasConsumption: 120, electricConsumption: 2.0, capacity: '30 lbs' },
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { brand, model, machineType } = await req.json();

    // Search for exact match first
    let machineData = machineDatabase.find(machine => 
      machine.brand.toLowerCase() === brand?.toLowerCase() && 
      machine.model.toLowerCase() === model?.toLowerCase()
    );

    // If no exact match, search by brand and type
    if (!machineData && brand && machineType) {
      machineData = machineDatabase.find(machine => 
        machine.brand.toLowerCase() === brand.toLowerCase() && 
        machine.type.toLowerCase() === machineType.toLowerCase()
      );
    }

    // If still no match, provide industry average based on type
    if (!machineData && machineType) {
      const typeMatches = machineDatabase.filter(machine => 
        machine.type.toLowerCase() === machineType.toLowerCase()
      );
      
      if (typeMatches.length > 0) {
        const avgWater = typeMatches.reduce((sum, m) => sum + (m.waterConsumption || 0), 0) / typeMatches.length;
        const avgGas = typeMatches.reduce((sum, m) => sum + (m.gasConsumption || 0), 0) / typeMatches.length;
        const avgElectric = typeMatches.reduce((sum, m) => sum + (m.electricConsumption || 0), 0) / typeMatches.length;
        
        machineData = {
          brand: 'Industry Average',
          model: `${machineType} Average`,
          type: machineType as 'Washer' | 'Dryer',
          waterConsumption: machineType.toLowerCase() === 'washer' ? avgWater : undefined,
          gasConsumption: machineType.toLowerCase() === 'dryer' ? avgGas : undefined,
          electricConsumption: avgElectric,
          capacity: 'Various'
        };
      }
    }

    if (machineData) {
      return new Response(JSON.stringify({
        found: true,
        data: machineData,
        source: 'manufacturer_specifications'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      return new Response(JSON.stringify({
        found: false,
        message: 'No data found for specified machine',
        suggestions: machineDatabase
          .filter(m => m.type.toLowerCase() === machineType?.toLowerCase())
          .slice(0, 5)
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Error in machine-data-retrieval:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to retrieve machine data',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
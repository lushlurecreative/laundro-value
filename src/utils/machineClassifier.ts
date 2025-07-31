import { MachineInventory } from '@/types/deal';

// Standard machine categories with common variations
const MACHINE_CATEGORIES = {
  'Front-Load Washer': ['front load', 'front-load', 'frontload', 'front loader', 'horizontal axis', 'washers', 'washer'],
  'Top-Load Washer': ['top load', 'top-load', 'topload', 'top loader', 'vertical axis'],
  'Stacked Washer/Dryer': ['stack', 'stacked', 'combo', 'combination', 'washer dryer combo'],
  'Single Dryer': ['dryer', 'dryers', 'single dryer', 'stand alone dryer', 'individual dryer'],
  'Stacked Dryer': ['stack dryer', 'stacked dryer', 'double stack', 'triple stack'],
  'Other': ['other', 'misc', 'miscellaneous', 'unknown']
};

// Brand standardization
const BRAND_MAPPINGS = {
  'Speed Queen': ['speed queen', 'speedqueen', 'sq'],
  'Continental Girbau': ['continental', 'girbau', 'continental girbau'],
  'Dexter': ['dexter', 'dexter laundry'],
  'Huebsch': ['huebsch', 'alliance'],
  'Maytag Commercial': ['maytag', 'maytag commercial'],
  'Milnor': ['milnor'],
  'UniMac': ['unimac', 'uni-mac'],
  'Wascomat': ['wascomat'],
  'Whirlpool Commercial': ['whirlpool', 'whirlpool commercial'],
  'Other': ['other', 'unknown', 'misc']
};

// Calculate similarity score between two strings
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

// Levenshtein distance calculation
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }
  
  return matrix[str2.length][str1.length];
}

// Clean and normalize machine names/brands
function normalizeName(name: string): string {
  return name.toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove special chars
    .replace(/\s+/g, ' ')
    .trim();
}

// Classify machine type
export function classifyMachineType(machineDescription: string): {
  type: string;
  confidence: number;
} {
  console.log(`🔍 Classifying machine type: "${machineDescription}"`);
  const normalized = normalizeName(machineDescription);
  console.log(`🧹 Normalized to: "${normalized}"`);
  
  // Check for exact or high similarity matches
  for (const [category, variations] of Object.entries(MACHINE_CATEGORIES)) {
    for (const variation of variations) {
      const similarity = calculateSimilarity(normalized, variation);
      if (similarity > 0.7 || normalized.includes(variation) || variation.includes(normalized)) {
        console.log(`✅ Machine type match: "${machineDescription}" → "${category}" (${similarity.toFixed(2)})`);
        return {
          type: category,
          confidence: Math.max(similarity, 0.8)
        };
      }
    }
  }
  
  // Default fallback
  console.log(`🆕 Using default machine type: "${machineDescription}" → "Other"`);
  return {
    type: 'Other',
    confidence: 0.5
  };
}

// Classify brand
export function classifyBrand(brandDescription: string): {
  brand: string;
  confidence: number;
} {
  console.log(`🔍 Classifying brand: "${brandDescription}"`);
  const normalized = normalizeName(brandDescription);
  console.log(`🧹 Normalized to: "${normalized}"`);
  
  // Check for exact or high similarity matches
  for (const [standardBrand, variations] of Object.entries(BRAND_MAPPINGS)) {
    for (const variation of variations) {
      const similarity = calculateSimilarity(normalized, variation);
      if (similarity > 0.7 || normalized.includes(variation) || variation.includes(normalized)) {
        console.log(`✅ Brand match: "${brandDescription}" → "${standardBrand}" (${similarity.toFixed(2)})`);
        return {
          brand: standardBrand,
          confidence: Math.max(similarity, 0.8)
        };
      }
    }
  }
  
  // Preserve original brand with proper formatting
  const properBrand = brandDescription
    .trim()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
  
  console.log(`🆕 Creating new brand: "${brandDescription}" → "${properBrand}"`);
  
  return {
    brand: properBrand,
    confidence: 0.6
  };
}

// Parse and classify machines from AI-extracted data
export function parseAndClassifyMachines(machines: Record<string, any>): MachineInventory[] {
  const classifiedMachines: MachineInventory[] = [];
  
  console.log('🔍 Classifying machines:', machines);
  
  Object.entries(machines).forEach(([key, data]) => {
    // Handle simple number format: {washers: 29, dryers: 32}
    if (typeof data === 'number' && data > 0) {
      console.log(`🔢 Processing simple format: ${key} = ${data}`);
      
      const typeClassification = classifyMachineType(key);
      const brandClassification = classifyBrand('Speed Queen'); // Default brand
      
      console.log(`📋 "${key}" → Type: "${typeClassification.type}", Brand: "${brandClassification.brand}"`);
      
      // Default values based on machine type
      const defaults = getDefaultsByType(typeClassification.type);
      
      const machineItem: MachineInventory = {
        machineId: crypto.randomUUID(),
        dealId: '', // Will be set by the context
        machineType: typeClassification.type as any,
        brand: brandClassification.brand,
        model: '',
        quantity: data,
        ageYears: 5,
        capacityLbs: defaults.capacity,
        vendPricePerUse: defaults.price,
        conditionRating: 3,
        waterConsumptionGalPerCycle: defaults.waterUsage,
        electricConsumptionKwh: undefined,
        gasConsumptionBtu: undefined,
        purchaseValue: 0,
        currentValue: 0,
        maintenanceCostAnnual: 0,
        isCardOperated: true,
        isCoinOperated: false,
        isOutOfOrder: false
      };
      
      classifiedMachines.push(machineItem);
    }
    // Handle detailed object format
    else if (data && typeof data === 'object') {
      // Handle various machine data formats
      const quantity = data.quantity || data.count || 1;
      const machineDescription = data.type || data.machineType || key;
      const brandDescription = data.brand || 'Speed Queen'; // Default brand
      
      const typeClassification = classifyMachineType(machineDescription);
      const brandClassification = classifyBrand(brandDescription);
      
      console.log(`📋 "${machineDescription}" → Type: "${typeClassification.type}", Brand: "${brandClassification.brand}"`);
      
      // Default values based on machine type
      const defaults = getDefaultsByType(typeClassification.type);
      
      const machineItem: MachineInventory = {
        machineId: crypto.randomUUID(),
        dealId: '', // Will be set by the context
        machineType: typeClassification.type as any,
        brand: brandClassification.brand,
        model: data.model || '',
        quantity: quantity,
        ageYears: data.age || data.ageYears || 5,
        capacityLbs: data.capacity || data.capacityLbs || defaults.capacity,
        vendPricePerUse: data.price || data.vendPricePerUse || defaults.price,
        conditionRating: data.condition || data.conditionRating || 3,
        waterConsumptionGalPerCycle: data.waterUsage || data.waterConsumptionGalPerCycle || defaults.waterUsage,
        electricConsumptionKwh: data.electricUsage || undefined,
        gasConsumptionBtu: data.gasUsage || undefined,
        purchaseValue: data.purchaseValue || 0,
        currentValue: data.currentValue || 0,
        maintenanceCostAnnual: data.maintenanceCost || 0,
        isCardOperated: data.isCardOperated ?? true,
        isCoinOperated: data.isCoinOperated ?? false,
        isOutOfOrder: data.isOutOfOrder ?? false
      };
      
      classifiedMachines.push(machineItem);
    }
  });
  
  return classifiedMachines;
}

// Get default values based on machine type
function getDefaultsByType(machineType: string) {
  const defaults: { [key: string]: { capacity: number; price: number; waterUsage?: number } } = {
    'Top-Load Washer': { capacity: 20, price: 2.50, waterUsage: 30 },
    'Front-Load Washer': { capacity: 35, price: 3.50, waterUsage: 22 },
    'Stacked Washer/Dryer': { capacity: 25, price: 3.00, waterUsage: 25 },
    'Single Dryer': { capacity: 35, price: 2.50 },
    'Stacked Dryer': { capacity: 30, price: 2.25 },
    'Other': { capacity: 25, price: 2.50 }
  };
  
  return defaults[machineType] || defaults['Other'];
}
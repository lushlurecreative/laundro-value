// Equipment data parser for handling various equipment formats
export interface ParsedEquipment {
  totalWashers: number;
  totalDryers: number;
  equipmentList: Array<{
    type: string;
    brand?: string;
    quantity: number;
    capacity?: number;
    age?: number;
    price?: number;
    condition?: number;
  }>;
}

export const parseEquipmentText = (text: string): ParsedEquipment => {
  const result: ParsedEquipment = {
    totalWashers: 0,
    totalDryers: 0,
    equipmentList: []
  };

  // Clean the text
  const cleanText = text
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .trim();

  // Albany Park format: "12 Washers (Continental Girbau 25 lb 2018 3.75) 14 Dryers (Continental Girbau 50 lb 2018 2.50)"
  const albanyPattern = /(\d+)\s+washers?\s*\(([^)]+)\)|(\d+)\s+dryers?\s*\(([^)]+)\)/gi;
  let match;
  
  while ((match = albanyPattern.exec(cleanText)) !== null) {
    if (match[1]) {
      // Washer match
      const quantity = parseInt(match[1]);
      result.totalWashers += quantity;
      
      const details = match[2];
      const equipment = parseEquipmentDetails(details, 'washer', quantity);
      result.equipmentList.push(equipment);
    } else if (match[3]) {
      // Dryer match
      const quantity = parseInt(match[3]);
      result.totalDryers += quantity;
      
      const details = match[4];
      const equipment = parseEquipmentDetails(details, 'dryer', quantity);
      result.equipmentList.push(equipment);
    }
  }

  // Fallback: Simple number extraction
  if (result.totalWashers === 0 && result.totalDryers === 0) {
    const washerMatch = cleanText.match(/(\d+)\s*(?:front[- ]?load|top[- ]?load|standard)?\s*washer/i);
    const dryerMatch = cleanText.match(/(\d+)\s*(?:single|double|triple)?\s*dryer/i);
    
    if (washerMatch) result.totalWashers = parseInt(washerMatch[1]);
    if (dryerMatch) result.totalDryers = parseInt(dryerMatch[1]);
  }

  return result;
};

const parseEquipmentDetails = (details: string, type: string, quantity: number) => {
  const equipment = {
    type: type === 'washer' ? 'Front-Load Washer' : 'Single Dryer',
    quantity,
    brand: undefined as string | undefined,
    capacity: undefined as number | undefined,
    age: undefined as number | undefined,
    price: undefined as number | undefined,
    condition: 3 as number
  };

  // Extract brand
  const brands = ['continental girbau', 'dexter', 'huebsch', 'maytag', 'speed queen', 'unimac', 'wascomat'];
  const foundBrand = brands.find(brand => details.toLowerCase().includes(brand));
  if (foundBrand) {
    equipment.brand = foundBrand.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  // Extract capacity (lbs)
  const capacityMatch = details.match(/(\d+)\s*lb/i);
  if (capacityMatch) {
    equipment.capacity = parseInt(capacityMatch[1]);
  }

  // Extract year and calculate age
  const yearMatch = details.match(/20\d{2}/);
  if (yearMatch) {
    const year = parseInt(yearMatch[0]);
    equipment.age = new Date().getFullYear() - year;
  }

  // Extract price
  const priceMatch = details.match(/(\d+\.?\d*)/);
  if (priceMatch) {
    equipment.price = parseFloat(priceMatch[1]);
  }

  return equipment;
};

export const formatEquipmentSummary = (parsed: ParsedEquipment): string => {
  return `${parsed.totalWashers} washers, ${parsed.totalDryers} dryers (${parsed.equipmentList.length} equipment items)`;
};
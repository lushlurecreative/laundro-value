
// aiResponseParser.ts

// Helper function to safely parse numbers from strings like "$1,234.56"
const parseCurrency = (value: string | number): number => {
  if (!value) return 0;
  if (typeof value === 'number') return value;
  return Number(String(value).replace(/[^0-9.-]+/g, '')) || 0;
};

// Main function to parse the AI's response
export const parseAIResponse = (response: string): Record<string, any> => {
  console.log('Raw AI response:', response);
  
  // First, try to find and parse a clean JSON object, which is the preferred method.
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      let jsonStr = jsonMatch[0]
        .replace(/,\s*([}\]])/g, '$1') // Fix trailing commas
        .replace(/([{,]\s*)(\w+):/g, '$1"$2":'); // Quote unquoted keys
      
      const jsonData = JSON.parse(jsonStr);
      console.log('Parsed JSON data:', jsonData);
      
      // Normalize the parsed data to ensure numbers are properly converted
      const normalizedData: Record<string, any> = {};
      
      if (jsonData.askingPrice) normalizedData.askingPrice = parseCurrency(jsonData.askingPrice);
      if (jsonData.grossIncome) normalizedData.grossIncome = parseCurrency(jsonData.grossIncome);
      if (jsonData.totalSqft) normalizedData.totalSqft = parseCurrency(jsonData.totalSqft);
      if (jsonData.propertyAddress) normalizedData.propertyAddress = jsonData.propertyAddress;
      
      // Handle lease object
      if (jsonData.lease && typeof jsonData.lease === 'object') {
        normalizedData.lease = {};
        if (jsonData.lease.monthlyRent) normalizedData.lease.monthlyRent = parseCurrency(jsonData.lease.monthlyRent);
        if (jsonData.lease.remainingTermYears) normalizedData.lease.remainingTermYears = parseCurrency(jsonData.lease.remainingTermYears);
        if (jsonData.lease.renewalOptionsCount) normalizedData.lease.renewalOptionsCount = parseCurrency(jsonData.lease.renewalOptionsCount);
        if (jsonData.lease.annualRentIncreasePercent) normalizedData.lease.annualRentIncreasePercent = parseCurrency(jsonData.lease.annualRentIncreasePercent);
      }
      
      // Handle equipment object
      if (jsonData.equipment && typeof jsonData.equipment === 'object') {
        normalizedData.equipment = {};
        if (jsonData.equipment.washers) normalizedData.equipment.washers = parseCurrency(jsonData.equipment.washers);
        if (jsonData.equipment.dryers) normalizedData.equipment.dryers = parseCurrency(jsonData.equipment.dryers);
        if (jsonData.equipment.avgAge) normalizedData.equipment.avgAge = parseCurrency(jsonData.equipment.avgAge);
      }
      
      // Handle expenses object
      if (jsonData.expenses && typeof jsonData.expenses === 'object') {
        normalizedData.expenses = {};
        Object.entries(jsonData.expenses).forEach(([key, value]) => {
          if (value) normalizedData.expenses[key] = parseCurrency(value as string | number);
        });
      }
      
      console.log('Normalized data:', normalizedData);
      return normalizedData;
    }
  } catch (error) {
    console.warn('AI did not return a valid JSON object. Falling back to pattern matching.', error);
  }

  // --- Fallback to Regex Pattern Matching if JSON fails ---
  console.log('Falling back to pattern matching for AI response.');
  
  const fields: Record<string, any> = {};

  // More comprehensive patterns for extracting deal information
  const patterns = {
    askingPrice: /(?:asking\s+(?:only\s+)?\$?([\d,]+)|sell\s+price|business\s+price|price)[:\s]*\$?([\d,]+)/i,
    grossIncome: /(?:total\s+income|gross\s+income|washers?\s*[&\+]?\s*dryers?)[:\s]*\$?([\d,]+)/i,
    totalSqft: /(?:footprint|sq\s*ft|square\s+feet)[:\s]*(\d[\d,]*)/i,
    propertyAddress: /(?:premises\s+address|address|location)[:\s]*([^\n,]+(?:,[^,\n]+)*)/i,
    monthlyRent: /(?:year\s+\d+|monthly\s+base\s+rent|monthly\s+rent|base\s+rent)[:\s]*\$?([\d,]+(?:\.\d{2})?)/i,
    leaseTerm: /(?:term|lease\s+term)[:\s]*(\d+)\s*years?/i,
    renewalOptions: /(?:renewal\s+options|options)[:\s]*(?:two\s*\(2\)\s*|\btwo\b|\b2\b|\d+)/i,
    renewalOptionsCount: /(?:two\s*\(\s*(\d+)\s*\)|(\d+)\s+(?:option|renewal))/i,
    rentIncrease: /(?:increase\s+by|to\s+increase\s+by)[:\s]*([\d.]+)%/i,
    washers: /(\d+)\s+(?:washers?|dual\s+stack\s+dryers)/i,
    dryers: /(\d+)\s+(?:dual\s*stack\s+)?dryers?/i,
    vendingIncome: /vending[:\s]*\$?([\d,]+)/i,
  };

  // Extract simple key-value pairs
  for (const [key, regex] of Object.entries(patterns)) {
    const match = response.match(regex);
    if (match) {
      if (key.includes('Address')) {
        fields[key] = match[1].trim();
      } else {
        fields[key] = parseCurrency(match[1]);
      }
    }
  }

  // Enhanced expense parsing with more categories
  const expenseCategories = {
    'rent': /rent[:\s]*\$?([\d,]+)/i,
    'gas': /gas[:\s]*\$?([\d,]+)/i,
    'electricity': /(?:electric|electricity)[:\s]*\$?([\d,]+)/i,
    'water': /(?:water\s*&?\s*sewer|water)[:\s]*\$?([\d,]+)/i,
    'maintenance': /(?:repairs?\s*&?\s*maint|maintenance)[:\s]*\$?([\d,]+)/i,
    'insurance': /insurance[:\s]*\$?([\d,]+)/i,
    'trash': /trash[:\s]*\$?([\d,]+)/i,
    'licenses': /(?:license\s*&?\s*permits?|licenses?)[:\s]*\$?([\d,]+)/i,
    'supplies': /(?:cost\s+of\s+goods\s+sold|supplies)[:\s]*\$?([\d,]+)/i,
    'internet': /internet[:\s]*\$?([\d,]+)/i
  };

  // Enhanced equipment parsing for detailed inventory
  const equipmentPatterns = {
    totalWashers: /(\d+)\s+washers?/i,
    totalDryers: /(\d+)\s+(?:dual\s*stack\s+)?dryers?/i,
    changers: /(\d+)\s+coin[\s-]?(?:bill\s+)?changers?/i,
    vending: /(\d+)\s+(?:soap\s+)?vending/i,
  };

  const expenses: { [key: string]: number } = {};
  
  Object.entries(expenseCategories).forEach(([category, regex]) => {
    const match = response.match(regex);
    if (match) {
      expenses[category] = parseCurrency(match[1]);
    }
  });
  
  // Consolidate extracted fields into the expected structure
  const finalFields: Record<string, any> = {};
  
  if (fields.askingPrice) finalFields.askingPrice = fields.askingPrice;
  if (fields.grossIncome) finalFields.grossIncome = fields.grossIncome;
  if (fields.totalSqft) finalFields.totalSqft = fields.totalSqft;
  if (fields.propertyAddress) finalFields.propertyAddress = fields.propertyAddress;

  const lease: Record<string, any> = {};
  if (fields.monthlyRent) lease.monthlyRent = fields.monthlyRent;
  if (fields.leaseTerm) lease.remainingTermYears = fields.leaseTerm;
  if (fields.renewalOptions) {
    // Parse renewal options - handle "Two (2)" format
    const renewalMatch = response.match(/(?:two\s*\(\s*(\d+)\s*\)|(\d+)\s+(?:option|renewal))/i);
    if (renewalMatch) {
      lease.renewalOptionsCount = parseInt(renewalMatch[1] || renewalMatch[2]) || 2;
    } else {
      lease.renewalOptionsCount = fields.renewalOptions;
    }
  }
  if (fields.renewalOptionsCount) lease.renewalOptionsCount = fields.renewalOptionsCount;
  if (fields.rentIncrease) lease.annualRentIncreasePercent = fields.rentIncrease;
  if (Object.keys(lease).length > 0) finalFields.lease = lease;

  // Extract equipment details
  const equipmentData: { [key: string]: number } = {};
  Object.entries(equipmentPatterns).forEach(([category, regex]) => {
    const match = response.match(regex);
    if (match) {
      equipmentData[category] = parseCurrency(match[1]);
    }
  });

  const equipment: Record<string, any> = {};
  if (fields.washers) equipment.washers = fields.washers;
  if (fields.dryers) equipment.dryers = fields.dryers;
  if (equipmentData.totalWashers) equipment.washers = equipmentData.totalWashers;
  if (equipmentData.totalDryers) equipment.dryers = equipmentData.totalDryers;
  if (Object.keys(equipment).length > 0) finalFields.equipment = equipment;

  // Extract ancillary income
  const ancillary: Record<string, any> = {};
  if (fields.vendingIncome) ancillary.vending = fields.vendingIncome;
  if (Object.keys(ancillary).length > 0) finalFields.ancillary = ancillary;
  
  if (Object.keys(expenses).length > 0) finalFields.expenses = expenses;

  console.log('Pattern matching result:', finalFields);
  return finalFields;
};

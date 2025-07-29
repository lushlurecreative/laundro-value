
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
      if (jsonData.grossIncome) normalizedData.grossIncomeAnnual = parseCurrency(jsonData.grossIncome);
      if (jsonData.totalSqft) normalizedData.facilitySizeSqft = parseCurrency(jsonData.totalSqft);
      if (jsonData.facilitySizeSqft) normalizedData.facilitySizeSqft = parseCurrency(jsonData.facilitySizeSqft);
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
      
      // Handle expenses - new array format or legacy object format
      if (jsonData.expenses) {
        if (Array.isArray(jsonData.expenses)) {
          // New array format
          normalizedData.expenseArray = jsonData.expenses.map((exp: any) => ({
            name: exp.name || '',
            amount: parseCurrency(exp.amount || 0)
          }));
          
          // Also convert to individual fields for backward compatibility
          jsonData.expenses.forEach((exp: any) => {
            if (exp.name && exp.amount) {
              const normalizedName = exp.name.toLowerCase()
                .replace(/\s+/g, '')
                .replace(/[^a-z]/g, '');
              normalizedData[normalizedName] = parseCurrency(exp.amount);
            }
          });
        } else if (typeof jsonData.expenses === 'object') {
          // Legacy object format
          normalizedData.expenses = {};
          Object.entries(jsonData.expenses).forEach(([key, value]) => {
            if (value) normalizedData.expenses[key] = parseCurrency(value as string | number);
          });
        }
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

  // Enhanced patterns for the Albany Park laundromat format and similar data
  const patterns = {
    askingPrice: /(?:asking\s+\$?([\d,]+)|price\s*(?:reduced)?\s*\$?([\d,]+)|offer\s*\$?([\d,]+))/i,
    grossIncome: /(?:total\s+income|gross\s+income)[:\s]*\$?([\d,]+(?:\.\d{2})?)/i,
    machineIncome: /machines?[:\s]*\$?([\d,]+(?:\.\d{2})?)/i,
    dropOffIncome: /drop[-\s]?off\s+laundry[:\s]*\$?([\d,]+(?:\.\d{2})?)/i,
    totalSqft: /(?:(\d+)\s*sf|(\d+)\s*sq\s*ft|(\d+)\s*square\s+feet)/i,
    propertyAddress: /(?:(\d+\s+[NSEW]?\s*[^\n,]+(?:ave|avenue|st|street|rd|road|blvd|boulevard)[^\n,]*(?:,[^,\n]+)*)|address[:\s]*([^\n,]+(?:,[^,\n]+)*))/i,
    monthlyRent: /(?:rent[:\s]*\$?([\d,]+(?:\.\d{2})?)|(\$[\d,]+)\/mo)/i,
    leaseTerm: /(?:term[:\s]*(\d+)\s*years?|long\s+term)/i,
    washers: /(\d+)\s*[-\s]*(\d+#|\d+)\s*(?:speed\s+queen\s+)?washers?/i,
    dryers: /(\d+)\s*[-\s]*(\d+#|\d+)\s*(?:speed\s+queen\s+)?dryers?/i,
    vendingIncome: /vending[:\s]*\$?([\d,]+)/i,
    netIncome: /net\s+income[:\s]*\$?([\d,]+(?:\.\d{2})?)/i,
    ebitda: /(?:ebitda|estimated\s+actual\s+cash\s+flow)[:\s]*\$?([\d,]+(?:\.\d{2})?)/i,
    businessName: /([A-Z\s]+(?:COIN\s+)?LAUNDRY(?:MAT)?)/i,
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

  // Dynamic expense parsing - extract ALL expenses regardless of name
  const expenseCategories = {
    'costOfGoodsSold': /(?:cost\s+of\s+goods\s+sold|cogs)[:\s]*\$?([\d,]+(?:\.\d{2})?)/i,
    'autoExpense': /auto\s+expense[:\s]*\$?([\d,]+(?:\.\d{2})?)/i,
    'bankCharges': /bank\s+charges[:\s]*\$?([\d,]+(?:\.\d{2})?)/i,
    'depreciationExpense': /depreciation\s+expense[:\s]*\$?([\d,]+(?:\.\d{2})?)/i,
    'insurance': /insurance[:\s]*\$?([\d,]+(?:\.\d{2})?)/i,
    'meals': /meals[:\s]*\$?([\d,]+(?:\.\d{2})?)/i,
    'internet': /internet[:\s]*\$?([\d,]+(?:\.\d{2})?)/i,
    'alarm': /alarm[:\s]*\$?([\d,]+(?:\.\d{2})?)/i,
    'office': /office[:\s]*\$?([\d,]+(?:\.\d{2})?)/i,
    'payroll': /payroll[:\s]*\$?([\d,]+(?:\.\d{2})?)/i,
    'accounting': /accounting[:\s]*\$?([\d,]+(?:\.\d{2})?)/i,
    'rent': /rent[:\s]*\$?([\d,]+(?:\.\d{2})?)/i,
    'repairs': /repairs?[:\s]*\$?([\d,]+(?:\.\d{2})?)/i,
    'wasteRemoval': /waste\s+removal[:\s]*\$?([\d,]+(?:\.\d{2})?)/i,
    'electric': /electric[:\s]*\$?([\d,]+(?:\.\d{2})?)/i,
    'gas': /gas[:\s]*\$?([\d,]+(?:\.\d{2})?)/i,
    'water': /water[:\s]*\$?([\d,]+(?:\.\d{2})?)/i,
    // Additional fallback patterns
    'maintenance': /(?:repairs?\s*&?\s*maint|maintenance)[:\s]*\$?([\d,]+(?:\.\d{2})?)/i,
    'electricity': /electricity[:\s]*\$?([\d,]+(?:\.\d{2})?)/i,
    'trash': /trash[:\s]*\$?([\d,]+(?:\.\d{2})?)/i,
    'licenses': /(?:license\s*&?\s*permits?|licenses?)[:\s]*\$?([\d,]+(?:\.\d{2})?)/i,
    'supplies': /supplies[:\s]*\$?([\d,]+(?:\.\d{2})?)/i
  };

  // Enhanced equipment parsing for Albany Park format
  const equipmentPatterns = {
    washers50lb: /(\d+)\s*[-\s]*\s*50#?\s*(?:speed\s+queen\s+)?washers?/i,
    washers35lb: /(\d+)\s*[-\s]*\s*35#?\s*(?:speed\s+queen\s+)?washers?/i,
    washers18lb: /(\d+)\s*[-\s]*\s*18#?\s*(?:speed\s+queen\s+)?washers?/i,
    dryerPockets: /(\d+)\s*[-\s]*\s*35#?\s*(?:speed\s+queen\s+)?dryer\s+pockets?/i,
    totalWashers: /total.*?(\d+)\s+washers?/i,
    totalDryers: /(\d+)\s+(?:dual\s*stack\s+)?dryers?/i,
    carts: /(\d+)\s*[-\s]*\s*laundry\s+carts?/i,
    tables: /(\d+)\s*[-\s]*\s*folding\s+tables?/i,
    changers: /(\d+)\s*[-\s]*\s*(?:bill\s+)?coin\s+changers?/i,
    chairs: /(\d+)\s*[-\s]*\s*chairs?/i,
    stools: /(\d+)\s*[-\s]*\s*stools?/i
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
  if (fields.grossIncome) finalFields.grossIncomeAnnual = fields.grossIncome;
  if (fields.machineIncome) finalFields.machineIncome = fields.machineIncome;
  if (fields.dropOffIncome) finalFields.dropOffIncome = fields.dropOffIncome;
  if (fields.vendingIncome) finalFields.vendingIncome = fields.vendingIncome;
  if (fields.totalSqft) finalFields.facilitySizeSqft = fields.totalSqft;
  if (fields.propertyAddress) finalFields.propertyAddress = fields.propertyAddress;
  if (fields.netIncome) finalFields.annualNet = fields.netIncome;
  if (fields.ebitda) finalFields.ebitda = fields.ebitda;
  if (fields.businessName) finalFields.businessName = fields.businessName;

  const lease: Record<string, any> = {};
  if (fields.monthlyRent) lease.monthlyRent = fields.monthlyRent;
  if (fields.leaseTerm) lease.remainingLeaseTermYears = fields.leaseTerm;
  if (fields.renewalOptions || fields.renewalOptionsCount) {
    // Enhanced parsing for "Two (2) five (5) year renewal" format
    const renewalMatch = response.match(/(?:two\s*\(\s*(\d+)\s*\)|(\d+))\s*(?:five\s*\(\s*(\d+)\s*\)|(\d+))\s*year/i);
    if (renewalMatch) {
      lease.renewalOptionsCount = parseInt(renewalMatch[1] || renewalMatch[2]) || 2;
      lease.renewalOptionLengthYears = parseInt(renewalMatch[3] || renewalMatch[4]) || 5;
    } else {
      lease.renewalOptionsCount = fields.renewalOptionsCount || 2;
      lease.renewalOptionLengthYears = 5;
    }
  }
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
  
  // Add specific washer sizes to equipment object for detailed parsing
  if (equipmentData.washers50lb) equipment.washers50lb = equipmentData.washers50lb;
  if (equipmentData.washers35lb) equipment.washers35lb = equipmentData.washers35lb;
  if (equipmentData.washers18lb) equipment.washers18lb = equipmentData.washers18lb;
  if (equipmentData.dryerPockets) equipment.dryerPockets = equipmentData.dryerPockets;
  
  // Calculate total washers from different sizes
  let totalWashers = 0;
  if (equipmentData.washers50lb) totalWashers += equipmentData.washers50lb;
  if (equipmentData.washers35lb) totalWashers += equipmentData.washers35lb;
  if (equipmentData.washers18lb) totalWashers += equipmentData.washers18lb;
  if (fields.washers) totalWashers = fields.washers;
  if (equipmentData.totalWashers) totalWashers = equipmentData.totalWashers;
  
  if (totalWashers > 0) equipment.washers = totalWashers;
  if (fields.dryers || equipmentData.dryerPockets || equipmentData.totalDryers) {
    equipment.dryers = fields.dryers || equipmentData.dryerPockets || equipmentData.totalDryers;
  }
  
  // Add detailed equipment info
  if (equipmentData.carts) equipment.carts = equipmentData.carts;
  if (equipmentData.tables) equipment.tables = equipmentData.tables;
  if (equipmentData.changers) equipment.changers = equipmentData.changers;
  
  if (Object.keys(equipment).length > 0) finalFields.equipment = equipment;

  // Extract ancillary income
  const ancillary: Record<string, any> = {};
  if (fields.vendingIncome) ancillary.vending = fields.vendingIncome;
  if (Object.keys(ancillary).length > 0) finalFields.ancillary = ancillary;
  
  if (Object.keys(expenses).length > 0) finalFields.expenses = expenses;

  console.log('Pattern matching result:', finalFields);
  return finalFields;
};

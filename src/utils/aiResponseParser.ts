// aiResponseParser.ts

// Helper function to safely parse numbers from strings like "$1,234.56"
const parseCurrency = (value: string): number => {
  if (!value) return 0;
  return Number(String(value).replace(/[^0-9.-]+/g, '')) || 0;
};

// Main function to parse the AI's response
export const parseAIResponse = (response: string): Record<string, any> => {
  // First, try to find and parse a clean JSON object, which is the preferred method.
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      let jsonStr = jsonMatch[0].replace(/,\s*([}\]])/g, '$1'); // Fix trailing commas
      const jsonData = JSON.parse(jsonStr);
      // If we get valid JSON, we can assume it's structured correctly and return it.
      // Add any necessary transformations here if the AI's JSON schema differs from the app's.
      return jsonData;
    }
  } catch (error) {
    console.warn('AI did not return a valid JSON object. Falling back to pattern matching.', error);
  }

  // --- Fallback to Regex Pattern Matching if JSON fails ---
  console.log('Falling back to pattern matching for AI response.');
  
  const fields: Record<string, any> = {};
  const lowerCaseResponse = response.toLowerCase();

  const patterns = {
    askingPrice: /asking\s+price:?\s*\$?([\d,]+)/i,
    grossIncome: /(?:annual|gross)\s+(?:revenue|income):?\s*\$?([\d,]+)/i,
    totalSqft: /(\d[\d,]*)\s*sq\.?\s*ft/i,
    propertyAddress: /(\d+\s+[\w\s.-]+(?:street|st|avenue|ave|road|rd|drive|dr|lane|ln|blvd)[.,\s\w]+(?:[A-Z]{2}\s*\d{5}))/i,
    monthlyRent: /monthly\s+rent:?\s*\$?([\d,]+)/i,
    leaseTerm: /(\d+)\s*-?\s*year\s+(?:lease|term)/i,
    renewalOptions: /(\d+)\s*(?:renewal\s+option|option\s+to\s+renew)/i,
    washers: /(\d+)\s+(?:washers|washing\s+machines)/i,
    dryers: /(\d+)\s+(?:dryers|drying\s+machines)/i,
  };

  // Extract simple key-value pairs
  for (const [key, regex] of Object.entries(patterns)) {
    const match = response.match(regex);
    if (match) {
      fields[key] = key.includes('Address') ? match[1].trim() : parseCurrency(match[1]);
    }
  }

  // More robust expense parsing
  const expenseKeywords = ['rent', 'utilities', 'water', 'gas', 'electric', 'insurance', 'maintenance', 'repairs', 'supplies', 'payroll', 'salaries', 'taxes', 'marketing'];
  const expenses: { [key: string]: number } = {};
  const expenseRegex = new RegExp(`(?:${expenseKeywords.join('|')})\\s*[:\\-]?\\s*\\$?([\\d,.]+)`, 'gi');
  let expenseMatch;
  while ((expenseMatch = expenseRegex.exec(response)) !== null) {
      // Find which keyword was matched to use as the key
      const matchedKeyword = expenseKeywords.find(keyword => new RegExp(keyword, 'i').test(expenseMatch[0]));
      if (matchedKeyword) {
          expenses[matchedKeyword] = parseCurrency(expenseMatch[1]);
      }
  }
  if (Object.keys(expenses).length > 0) {
    fields.expenses = expenses;
  }
  
  // Consolidate extracted fields into the nested structure the app expects
  const finalFields: Record<string, any> = {};
  if (fields.askingPrice) finalFields.askingPrice = fields.askingPrice;
  if (fields.grossIncome) finalFields.grossIncome = fields.grossIncome;
  if (fields.totalSqft) finalFields.totalSqft = fields.totalSqft;
  if (fields.propertyAddress) finalFields.propertyAddress = fields.propertyAddress;

  const lease: Record<string, any> = {};
  if (fields.monthlyRent) lease.monthlyRent = fields.monthlyRent;
  if (fields.leaseTerm) lease.remainingTermYears = fields.leaseTerm;
  if (fields.renewalOptions) lease.renewalOptionsCount = fields.renewalOptions;
  if (Object.keys(lease).length > 0) finalFields.lease = lease;

  const equipment: Record<string, any> = {};
  if (fields.washers) equipment.washers = fields.washers;
  if (fields.dryers) equipment.dryers = fields.dryers;
  if (Object.keys(equipment).length > 0) finalFields.equipment = equipment;
  
  if (fields.expenses) finalFields.expenses = fields.expenses;

  return finalFields;
};
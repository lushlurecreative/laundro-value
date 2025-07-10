// AI response parsing utilities for OpenAI analysis
export const parseAIResponse = (response: string, type: 'notes' | 'lease'): Record<string, any> => {
  console.log('Raw AI Response:', response);
  
  try {
    // Enhanced JSON extraction with better error handling
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      let jsonStr = jsonMatch[0];
      
      // Clean up common JSON formatting issues
      jsonStr = jsonStr
        .replace(/,\s*}/g, '}') // Remove trailing commas
        .replace(/,\s*]/g, ']') // Remove trailing commas in arrays
        .replace(/^\s*```json\s*/i, '') // Remove markdown json blocks
        .replace(/\s*```\s*$/i, '')
        .trim();
        
      console.log('Cleaned JSON string:', jsonStr);
      
      const jsonData = JSON.parse(jsonStr);
      console.log('Parsed JSON data:', jsonData);
      
      // Enhanced field mapping with validation
      const flatFields: Record<string, any> = {};
      
      // Basic fields with validation
      if (jsonData.price && typeof jsonData.price === 'number' && jsonData.price > 0) {
        flatFields.askingPrice = jsonData.price;
      }
      if (jsonData.income && typeof jsonData.income === 'number' && jsonData.income > 0) {
        flatFields.grossIncome = jsonData.income;
      }
      if (jsonData.rent && typeof jsonData.rent === 'number' && jsonData.rent > 0) {
        flatFields.monthlyRent = jsonData.rent;
      }
      if (jsonData.size && typeof jsonData.size === 'number' && jsonData.size > 0) {
        flatFields.totalSqft = jsonData.size;
      }
      if (jsonData.machines && typeof jsonData.machines === 'number' && jsonData.machines > 0) {
        flatFields.totalMachines = jsonData.machines;
      }
      if (jsonData.address && typeof jsonData.address === 'string') {
        flatFields.propertyAddress = jsonData.address.trim();
      }
      
      // Enhanced expense mapping with comprehensive categories
      if (jsonData.expenses && typeof jsonData.expenses === 'object') {
        const expenseMapping: Record<string, string> = {
          rent: 'rent',
          water: 'water',
          gas: 'gas', 
          electricity: 'electricity',
          electric: 'electricity',
          insurance: 'insurance',
          maintenance: 'maintenance',
          repairs: 'maintenance',
          supplies: 'supplies',
          staff: 'staff',
          other: 'other',
          trash: 'other',
          permits: 'other',
          license: 'other'
        };
        
        const processedExpenses: Record<string, number> = {};
        
        Object.entries(jsonData.expenses).forEach(([key, value]) => {
          if (typeof value === 'number' && value > 0) {
            const mappedKey = expenseMapping[key.toLowerCase()] || 'other';
            processedExpenses[mappedKey] = (processedExpenses[mappedKey] || 0) + value;
          }
        });
        
        if (Object.keys(processedExpenses).length > 0) {
          flatFields.expenses = processedExpenses;
        }
      }
      
      // Enhanced lease details mapping with validation
      if (jsonData.lease && typeof jsonData.lease === 'object') {
        const lease: Record<string, any> = {};
        
        if (jsonData.lease.monthlyRent && typeof jsonData.lease.monthlyRent === 'number' && jsonData.lease.monthlyRent > 0) {
          lease.monthlyRent = jsonData.lease.monthlyRent;
        }
        if (jsonData.lease.leaseTerm && typeof jsonData.lease.leaseTerm === 'number' && jsonData.lease.leaseTerm > 0) {
          lease.leaseTerm = jsonData.lease.leaseTerm;
          lease.remainingTermYears = jsonData.lease.leaseTerm; // Map to expected field
        }
        if (jsonData.lease.remainingTermYears && typeof jsonData.lease.remainingTermYears === 'number' && jsonData.lease.remainingTermYears > 0) {
          lease.remainingTermYears = jsonData.lease.remainingTermYears;
        }
        if (jsonData.lease.renewalOptionsCount && typeof jsonData.lease.renewalOptionsCount === 'number' && jsonData.lease.renewalOptionsCount >= 0) {
          lease.renewalOptionsCount = jsonData.lease.renewalOptionsCount;
        }
        if (jsonData.lease.renewalOptionLengthYears && typeof jsonData.lease.renewalOptionLengthYears === 'number' && jsonData.lease.renewalOptionLengthYears > 0) {
          lease.renewalOptionLengthYears = jsonData.lease.renewalOptionLengthYears;
        }
        if (jsonData.lease.annualRentIncreasePercent && typeof jsonData.lease.annualRentIncreasePercent === 'number') {
          lease.annualRentIncreasePercent = jsonData.lease.annualRentIncreasePercent;
        }
        if (jsonData.lease.leaseType && typeof jsonData.lease.leaseType === 'string') {
          lease.leaseType = jsonData.lease.leaseType.trim();
        }
        
        if (Object.keys(lease).length > 0) {
          flatFields.lease = lease;
        }
      }

      // Enhanced equipment parsing with detailed validation and table processing
      if (jsonData.equipment && typeof jsonData.equipment === 'object') {
        const equipment: any = {
          washers: Math.max(0, Number(jsonData.equipment.washers) || 0),
          dryers: Math.max(0, Number(jsonData.equipment.dryers) || 0),
          avgAge: Math.max(0, Number(jsonData.equipment.avgAge) || 0),
          avgCondition: Math.min(5, Math.max(1, Number(jsonData.equipment.avgCondition) || 3))
        };
        
        // Process detailed inventory if available
        if (jsonData.equipment.detailedInventory && Array.isArray(jsonData.equipment.detailedInventory)) {
          equipment.detailedInventory = jsonData.equipment.detailedInventory;
          
          // Recalculate totals from detailed inventory
          let totalWashers = 0;
          let totalDryers = 0;
          let totalAge = 0;
          let machineCount = 0;
          
          jsonData.equipment.detailedInventory.forEach((item: any) => {
            const qty = Number(item.quantity) || 1;
            machineCount += qty;
            
            if (item.type && item.type.toLowerCase().includes('washer')) {
              totalWashers += qty;
            } else if (item.type && item.type.toLowerCase().includes('dryer')) {
              totalDryers += qty;
            }
            
            if (item.year && !isNaN(Number(item.year))) {
              const age = new Date().getFullYear() - Number(item.year);
              totalAge += age * qty;
            }
          });
          
          if (totalWashers > 0) equipment.washers = totalWashers;
          if (totalDryers > 0) equipment.dryers = totalDryers;
          if (machineCount > 0 && totalAge > 0) {
            equipment.avgAge = Math.round(totalAge / machineCount);
          }
        }
        
        if (equipment.washers > 0 || equipment.dryers > 0) {
          flatFields.equipment = equipment;
          // Update total machines if not already set
          if (!flatFields.totalMachines) {
            flatFields.totalMachines = equipment.washers + equipment.dryers;
          }
        }
      }
      
      // Ancillary income with validation
      if (jsonData.ancillary && typeof jsonData.ancillary === 'object') {
        const ancillary: Record<string, any> = {};
        
        if (jsonData.ancillary.vending && typeof jsonData.ancillary.vending === 'number' && jsonData.ancillary.vending > 0) {
          ancillary.vending = jsonData.ancillary.vending;
        }
        
        if (jsonData.ancillary.other && typeof jsonData.ancillary.other === 'number' && jsonData.ancillary.other > 0) {
          ancillary.other = jsonData.ancillary.other;
        }
        
        if (jsonData.ancillary.wdf && typeof jsonData.ancillary.wdf === 'object') {
          ancillary.wdf = jsonData.ancillary.wdf;
        }
        
        if (Object.keys(ancillary).length > 0) {
          flatFields.ancillary = ancillary;
        }
      }
      
      console.log('Extracted fields:', flatFields);
      return flatFields;
    }
  } catch (error) {
    console.warn('Failed to parse JSON response:', error);
    console.log('Response that failed to parse:', response);
  }
  
  // Enhanced fallback pattern matching for unstructured responses
  console.log('Falling back to pattern matching');
  
  // Import pattern matching function
  return parseWithPatternMatching(response);
};

// Pattern matching fallback function
const parseWithPatternMatching = (response: string): Record<string, any> => {
  const fields: Record<string, any> = {};
  
  // Enhanced patterns to handle various formats including lease terms
  const patterns = {
    // Price patterns (asking/selling price)
    askingPrice: [
      /(?:asking|sell|sale|business\s+sell)\s*price[:\s-]*\$?([0-9,]+)(?:k|000)?/gi,
      /price[:\s-]*\$?([0-9,]+)(?:k|000)?/gi
    ],
    // Revenue/income patterns - Simplified, skip problematic em-dash ranges
    grossIncome: [
      /(?:annual\s+)?revenue[:\s-]*\$?([0-9,]+)(?:k|K|000)?/gi,
      /(?:annual\s+)?income[:\s-]*\$?([0-9,]+)(?:k|K|000)?/gi
    ],
    // Size patterns
    totalSqft: [
      /footprint[:\s-]*([0-9,]+)\s*sq\.?\s*ft/gi,
      /([0-9,]+)\s*sq\.?\s*ft/gi,
      /([0-9,]+)\s*square\s*feet/gi
    ],
    // Equipment patterns with table parsing
    washers: [
      /([0-9]+)\s*washers?/gi,
      /washers?[:\s]*([0-9]+)/gi
    ],
    dryers: [
      /([0-9]+)\s*(?:gas-fired\s+)?dryers?/gi,
      /dryers?[:\s]*([0-9]+)/gi
    ],
    // Address patterns with premises prefix support and periods
    propertyAddress: [
      /(?:premises\s+address:\s*)?([0-9]+\s+[^,\n]*(?:street|st\.?|avenue|ave\.?|road|rd\.?|drive|dr\.?|lane|ln\.?|blvd\.?|boulevard)[^,\n]*(?:,\s*suite\s*[^,\n]*)?(?:,\s*[^,\n]*,\s*[A-Z]{2}\s*[0-9]{5})?)/gi,
      /([0-9]+\s+[^,\n]*(?:street|st\.?|avenue|ave\.?|road|rd\.?|drive|dr\.?|lane|ln\.?|blvd\.?|boulevard)[^,\n]*,\s*[^,\n]*,\s*[A-Z]{2})/gi,
      /([0-9]+\s+[^,\n]*\s+(?:street|st\.?|avenue|ave\.?|road|rd\.?|drive|dr\.?|lane|ln\.?|blvd\.?|boulevard))/gi
    ],
    // Lease term patterns - Enhanced for "Ten Years"
    leaseTerm: [
      /term[:\s]*(?:ten|10)\s*years?/gi,
      /term[:\s]*([0-9]+)\s*years?/gi,
      /(?:ten|10)\s*years?\s*(?:lease|term)/gi,
      /([0-9]+)[-\s]*year\s*lease/gi
    ],
    // Renewal patterns - Enhanced for "Two (2) five (5) year renewal terms"
    renewalOptions: [
      /(?:two|2)\s*\([0-9]+\)\s*(?:five|5)\s*\([0-9]+\)\s*year\s*renewal/gi,
      /([0-9]+)\s*(?:\([0-9]+\))?\s*(?:five|5)[-\s]*year\s*renewal/gi,
      /([0-9]+)\s*renewal\s*options?/gi
    ],
    // Renewal length patterns
    renewalLength: [
      /(?:five|5)\s*\([0-9]+\)\s*year\s*renewal/gi,
      /renewal.*?([0-9]+)\s*years?/gi
    ],
    // Rent increase patterns - Enhanced for "2.25% annually"
    rentIncrease: [
      /increase\s*by\s*([0-9.]+)%\s*annually/gi,
      /([0-9.]+)%\s*annual(?:ly)?/gi
    ],
    // Monthly rent patterns - Enhanced for schedule format
    monthlyRent: [
      /monthly\s*(?:base\s*)?rent[:\s]*\$?([0-9,]+)/gi,
      /year\s*1[:\s]*\$?([0-9,]+)\.?[0-9]*/gi,
      /month\s*1[:\s]*\$?([0-9,]+)/gi
    ],
    // Expense line patterns - NEW
    expenseLines: [
      /^([A-Z\s&]+?)\s+\$([0-9,]+)/gm,
      /([A-Z\s&]+?)\s+\$([0-9,]+)/gi
    ]
  };

  // Process each pattern type
  Object.entries(patterns).forEach(([fieldName, patternArray]) => {
    for (const pattern of patternArray) {
      const matches = [...response.matchAll(pattern)];
      if (matches.length > 0) {
        // Skip revenue range processing since we removed those patterns
        {
          const value = parseInt(matches[0][1].replace(/,/g, ''));
          if (!isNaN(value)) {
            if (fieldName === 'askingPrice' || fieldName === 'grossIncome') {
              // Handle k suffix
              fields[fieldName] = value * (matches[0][0].toLowerCase().includes('k') ? 1000 : 1);
            } else if (fieldName === 'propertyAddress') {
              fields[fieldName] = matches[0][1].trim();
            } else if (fieldName === 'leaseTerm') {
              // Handle "Ten Years" conversion
              const termText = matches[0][0].toLowerCase();
              if (termText.includes('ten')) {
                fields[fieldName] = 10;
              } else {
                fields[fieldName] = value;
              }
            } else if (fieldName === 'expenseLines') {
              // Handle expense parsing
              const expenseName = matches[0][1].trim().toLowerCase();
              const expenseValue = parseInt(matches[0][2].replace(/,/g, ''));
              if (!fields.expenses) fields.expenses = {};
              
              // Map expense categories
              if (expenseName.includes('rent')) {
                fields.expenses.rent = expenseValue;
              } else if (expenseName.includes('water') || expenseName.includes('sewer')) {
                fields.expenses.water = expenseValue;
              } else if (expenseName.includes('gas')) {
                fields.expenses.gas = expenseValue;
              } else if (expenseName.includes('electric')) {
                fields.expenses.electricity = expenseValue;
              } else if (expenseName.includes('insurance')) {
                fields.expenses.insurance = expenseValue;
              } else if (expenseName.includes('repair') || expenseName.includes('maint')) {
                fields.expenses.maintenance = expenseValue;
              } else if (expenseName.includes('supplies')) {
                fields.expenses.supplies = expenseValue;
              } else {
                fields.expenses.other = (fields.expenses.other || 0) + expenseValue;
              }
            } else {
              fields[fieldName] = value;
            }
            break;
          }
        }
      }
    }
  });

  // Extract equipment totals and parse equipment tables
  if (fields.washers || fields.dryers) {
    const equipment = {
      washers: fields.washers || 0,
      dryers: fields.dryers || 0,
      avgAge: 10, // Default estimate
      avgCondition: 3 // Default estimate
    };
    fields.equipment = equipment;
    fields.totalMachines = equipment.washers + equipment.dryers;
    delete fields.washers;
    delete fields.dryers;
  }

  // Parse equipment tables from text - handle actual tab characters
  const equipmentTablePattern = /(washer|dryer)\t+([0-9#]+)\t+([0-9]+)\t+([^\t\n]+)\t+([^\t\n]+)\t+([^\t\n]+)\t+([0-9]{4}(?:\/[0-9]{2,4})?)/gi;
  const equipmentMatches = [...response.matchAll(equipmentTablePattern)];
  
  if (equipmentMatches.length > 0) {
    let totalWashers = 0;
    let totalDryers = 0;
    let totalAge = 0;
    let machineCount = 0;
    
    equipmentMatches.forEach(match => {
      const type = match[1].toLowerCase();
      const quantity = parseInt(match[3]) || 1;
      const year = parseInt(match[7]) || new Date().getFullYear();
      const age = new Date().getFullYear() - year;
      
      if (type.includes('washer')) {
        totalWashers += quantity;
      } else if (type.includes('dryer')) {
        totalDryers += quantity;
      }
      
      totalAge += age * quantity;
      machineCount += quantity;
    });
    
    if (totalWashers > 0 || totalDryers > 0) {
      fields.equipment = {
        washers: totalWashers,
        dryers: totalDryers,
        avgAge: machineCount > 0 ? Math.round(totalAge / machineCount) : 10,
        avgCondition: 3
      };
      fields.totalMachines = totalWashers + totalDryers;
    }
  }

  // Extract lease details from patterns
  if (fields.leaseTerm || fields.renewalOptions || fields.renewalLength || fields.rentIncrease || fields.monthlyRent) {
    const lease: Record<string, any> = {};
    
    if (fields.leaseTerm) lease.leaseTerm = fields.leaseTerm;
    if (fields.remainingTermYears) lease.remainingTermYears = fields.remainingTermYears;
    if (fields.renewalOptions) lease.renewalOptionsCount = fields.renewalOptions;
    if (fields.renewalLength) lease.renewalOptionLengthYears = fields.renewalLength;
    if (fields.rentIncrease) lease.annualRentIncreasePercent = fields.rentIncrease;
    if (fields.monthlyRent) lease.monthlyRent = fields.monthlyRent;
    
    // Special handling for "Two (2) five (5) year renewal terms"
    const renewalPattern = /(?:two|2)\s*\([0-9]+\)\s*(?:five|5)\s*\([0-9]+\)\s*year\s*renewal/gi;
    const renewalMatch = response.match(renewalPattern);
    if (renewalMatch) {
      lease.renewalOptionsCount = 2;
      lease.renewalOptionLengthYears = 5;
    }
    
    fields.lease = lease;
    
    // Clean up individual lease fields
    delete fields.leaseTerm;
    delete fields.renewalOptions;
    delete fields.renewalLength;
    delete fields.rentIncrease;
    delete fields.monthlyRent;
  }

  console.log('Pattern matching extracted fields:', fields);

  return fields;
};
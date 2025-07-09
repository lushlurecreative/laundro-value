import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface UseOpenAIAnalysisProps {
  onFieldsPopulated?: (fields: Record<string, any>) => void;
}

export const useOpenAIAnalysis = ({ onFieldsPopulated }: UseOpenAIAnalysisProps = {}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const analyzeText = async (text: string, analysisType: 'notes' | 'lease' = 'notes') => {
    if (!text.trim()) return;

    setIsAnalyzing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('openai-analysis', {
        body: {
          dealData: {
            text,
            analysisType: analysisType === 'lease' ? 'lease-extraction' : 'note-extraction'
          },
          analysisType: 'field-extraction'
        }
      });

      if (error) {
        throw error;
      }

      // Parse the AI response to extract structured data
      const extractedFields = parseAIResponse(data.analysis, analysisType);
      
      if (extractedFields && Object.keys(extractedFields).length > 0) {
        onFieldsPopulated?.(extractedFields);
        
        toast({
          title: "AI Analysis Complete",
          description: `Auto-populated fields from your text`,
        });
      } else {
        toast({
          title: "Analysis Complete",
          description: "No specific data fields were found to auto-populate. Please review and enter data manually.",
        });
      }

    } catch (error) {
      console.error('AI Analysis error:', error);
      toast({
        title: "AI Analysis Unavailable",
        description: "Unable to analyze text. Please fill fields manually.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const parseAIResponse = (response: string, type: 'notes' | 'lease'): Record<string, any> => {
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
        
        // Enhanced equipment parsing with detailed validation
        if (jsonData.equipment && typeof jsonData.equipment === 'object') {
          const equipment = {
            washers: Math.max(0, Number(jsonData.equipment.washers) || 0),
            dryers: Math.max(0, Number(jsonData.equipment.dryers) || 0),
            avgAge: Math.max(0, Number(jsonData.equipment.avgAge) || 0),
            avgCondition: Math.min(5, Math.max(1, Number(jsonData.equipment.avgCondition) || 3))
          };
          
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
    const fields: Record<string, any> = {};
    
    // Enhanced patterns to handle various formats
    const patterns = {
      // Price patterns (asking/selling price)
      askingPrice: [
        /(?:asking|sell|sale|business\s+sell)\s*price[:\s-]*\$?([0-9,]+)(?:k|000)?/gi,
        /price[:\s-]*\$?([0-9,]+)(?:k|000)?/gi
      ],
      // Revenue/income patterns  
      grossIncome: [
        /(?:annual\s+)?revenue[:\s-]*\$?([0-9,]+)(?:k|000)?/gi,
        /(?:annual\s+)?income[:\s-]*\$?([0-9,]+)(?:k|000)?/gi,
        /\$([0-9,]+)(?:k|000)?\s*[-–—]\s*\$?([0-9,]+)(?:k|000)?\s*(?:revenue|income)/gi
      ],
      // Size patterns
      totalSqft: [
        /footprint[:\s-]*([0-9,]+)\s*sq\.?\s*ft/gi,
        /([0-9,]+)\s*sq\.?\s*ft/gi,
        /([0-9,]+)\s*square\s*feet/gi
      ],
      // Equipment patterns
      washers: [
        /([0-9]+)\s*washers?/gi,
        /washers?[:\s]*([0-9]+)/gi
      ],
      dryers: [
        /([0-9]+)\s*(?:gas-fired\s+)?dryers?/gi,
        /dryers?[:\s]*([0-9]+)/gi
      ],
      // Address patterns
      propertyAddress: [
        /([0-9]+\s+[^,\n]*(?:street|st|avenue|ave|road|rd|drive|dr|lane|ln|blvd|boulevard)[^,\n]*,\s*[^,\n]*,\s*[A-Z]{2})/gi,
        /([0-9]+\s+[^,\n]*\s+(?:street|st|avenue|ave|road|rd|drive|dr|lane|ln|blvd|boulevard))/gi
      ]
    };

    // Process each pattern type
    Object.entries(patterns).forEach(([fieldName, patternArray]) => {
      for (const pattern of patternArray) {
        const matches = [...response.matchAll(pattern)];
        if (matches.length > 0) {
          if (fieldName === 'grossIncome' && matches[0][2]) {
            // Handle revenue ranges - take midpoint
            const val1 = parseInt(matches[0][1].replace(/,/g, ''));
            const val2 = parseInt(matches[0][2].replace(/,/g, ''));
            if (!isNaN(val1) && !isNaN(val2)) {
              fields[fieldName] = Math.round((val1 + val2) / 2) * (matches[0][0].includes('k') || matches[0][0].includes('K') ? 1000 : 1);
              break;
            }
          } else {
            const value = parseInt(matches[0][1].replace(/,/g, ''));
            if (!isNaN(value)) {
              if (fieldName === 'askingPrice' || fieldName === 'grossIncome') {
                // Handle k suffix
                fields[fieldName] = value * (matches[0][0].toLowerCase().includes('k') ? 1000 : 1);
              } else if (fieldName === 'propertyAddress') {
                fields[fieldName] = matches[0][1].trim();
              } else {
                fields[fieldName] = value;
              }
              break;
            }
          }
        }
      }
    });

    // Extract equipment totals
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

    console.log('Pattern matching extracted fields:', fields);

    return fields;
  };

  return {
    analyzeText,
    isAnalyzing
  };
};
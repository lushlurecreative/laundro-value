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
    try {
      // Try to parse as JSON first (for field-extraction responses)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonData = JSON.parse(jsonMatch[0]);
        
        // Flatten the structured response for easier field population
        const flatFields: Record<string, any> = {};
        
        // Basic fields
        if (jsonData.price) flatFields.price = jsonData.price;
        if (jsonData.income) flatFields.income = jsonData.income;
        if (jsonData.rent) flatFields.rent = jsonData.rent;
        if (jsonData.size) flatFields.size = jsonData.size;
        if (jsonData.machines) flatFields.machines = jsonData.machines;
        if (jsonData.hours) flatFields.hours = jsonData.hours;
        if (jsonData.address) flatFields.address = jsonData.address;
        
        // Lease information
        if (jsonData.lease) {
          flatFields.lease = jsonData.lease;
        }
        
        // Expenses - improved mapping and validation
        if (jsonData.expenses) {
          const processedExpenses: Record<string, any> = {};
          Object.entries(jsonData.expenses).forEach(([key, value]) => {
            if (typeof value === 'number' && value > 0) {
              // Convert monthly values to annual if they seem too small for annual amounts
              let annualValue = value;
              if (key === 'rent' && value < 10000) {
                annualValue = value * 12; // Convert monthly to annual
              }
              processedExpenses[key] = annualValue;
            }
          });
          flatFields.expenses = processedExpenses;
        }
        
        // Equipment - improved parsing for machine inventory
        if (jsonData.equipment) {
          flatFields.equipment = {
            washers: Number(jsonData.equipment.washers) || 0,
            dryers: Number(jsonData.equipment.dryers) || 0,
            avgAge: Number(jsonData.equipment.avgAge) || 0,
            avgCondition: Number(jsonData.equipment.avgCondition) || 3
          };
        }
        
        // Ancillary income
        if (jsonData.ancillary) {
          flatFields.ancillary = jsonData.ancillary;
        }
        
        return flatFields;
      }
    } catch (error) {
      console.warn('Failed to parse JSON response, falling back to pattern matching');
    }
    
    // Fallback to pattern matching for unstructured responses
    const fields: Record<string, any> = {};
    const patterns = {
      rent: /rent[:\s]*\$?([0-9,]+)/i,
      price: /price[:\s]*\$?([0-9,]+)/i,
      income: /income[:\s]*\$?([0-9,]+)/i,
      size: /([0-9,]+)\s*sq\.?\s*ft|square\s*feet/i,
      machines: /([0-9]+)\s*machine/i,
      hours: /([0-9]+)\s*hour/i,
      washers: /([0-9]+)\s*washer/i,
      dryers: /([0-9]+)\s*dryer/i,
      address: /(?:address|location|property)[:\s]*([^\n\r]+?)(?:\s*,\s*[A-Z]{2}\s*\d{5}|\s*$)/i
    };

    Object.entries(patterns).forEach(([key, pattern]) => {
      const match = response.match(pattern);
      if (match) {
        const value = parseInt(match[1].replace(/,/g, ''));
        if (!isNaN(value)) {
          if (key === 'washers' || key === 'dryers') {
            if (!fields.equipment) fields.equipment = {};
            fields.equipment[key] = value;
          } else {
            fields[key] = value;
          }
        }
      }
    });

    return fields;
  };

  return {
    analyzeText,
    isAnalyzing
  };
};
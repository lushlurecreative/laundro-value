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
          description: `Auto-populated ${Object.keys(extractedFields).length} fields from your text`,
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
    const fields: Record<string, any> = {};
    
    // Simple pattern matching to extract common fields
    // This would be enhanced with better AI prompting in production
    
    const patterns = {
      rent: /rent[:\s]*\$?([0-9,]+)/i,
      price: /price[:\s]*\$?([0-9,]+)/i,
      income: /income[:\s]*\$?([0-9,]+)/i,
      size: /([0-9,]+)\s*sq\.?\s*ft|square\s*feet/i,
      machines: /([0-9]+)\s*machine/i,
      hours: /([0-9]+)\s*hour/i
    };

    Object.entries(patterns).forEach(([key, pattern]) => {
      const match = response.match(pattern);
      if (match) {
        const value = parseInt(match[1].replace(/,/g, ''));
        if (!isNaN(value)) {
          fields[key] = value;
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
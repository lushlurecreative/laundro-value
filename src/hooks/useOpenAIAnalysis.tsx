import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { parseAIResponse } from '@/utils/aiResponseParser';

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

      let extractedFields = null;

      // Try to parse AI response first
      if (!error && data?.analysis) {
        try {
          extractedFields = parseAIResponse(data.analysis);
        } catch (parseError) {
          console.warn('Failed to parse AI response:', parseError);
        }
      }

      // Fallback to local extraction if AI fails or returns empty
      if (!extractedFields || Object.keys(extractedFields).length === 0) {
        console.log('AI analysis failed or empty, using local extraction fallback');
        extractedFields = parseAIResponse(text);
        
        if (extractedFields && Object.keys(extractedFields).length > 0) {
          toast({
            title: "Local Extraction Complete",
            description: `Extracted ${Object.keys(extractedFields).length} fields using local parsing`,
          });
        } else {
          toast({
            title: "Analysis Complete",
            description: "No specific data fields were found to auto-populate. Please review and enter data manually.",
          });
          return;
        }
      } else {
        toast({
          title: "AI Analysis Complete",
          description: `Auto-populated ${Object.keys(extractedFields).length} fields from your text`,
        });
      }
      
      // Handle new expense array format
      if (extractedFields.expenses && Array.isArray(extractedFields.expenses)) {
        console.log('Processing expense array:', extractedFields.expenses);
        // Convert expense array to individual fields for backward compatibility
        extractedFields.expenses.forEach((exp: any) => {
          if (exp.name && exp.amount) {
            const normalizedName = exp.name.toLowerCase().replace(/[^a-z]/g, '');
            extractedFields[normalizedName] = exp.amount;
          }
        });
      }
      
      onFieldsPopulated?.(extractedFields);

    } catch (error) {
      console.error('AI Analysis error:', error);
      
      // Final fallback to local extraction
      try {
        const fallbackFields = parseAIResponse(text);
        if (fallbackFields && Object.keys(fallbackFields).length > 0) {
          onFieldsPopulated?.(fallbackFields);
          toast({
            title: "Local Extraction Complete",
            description: `Used local parsing to extract ${Object.keys(fallbackFields).length} fields`,
          });
        } else {
          throw new Error('No extraction possible');
        }
      } catch (fallbackError) {
        toast({
          title: "Analysis Unavailable",
          description: "Unable to analyze text. Please fill fields manually.",
          variant: "destructive"
        });
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeAllFields = async (dealData: any) => {
    setIsAnalyzing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('openai-analysis', {
        body: {
          dealData,
          analysisType: 'comprehensive-field-extraction'
        }
      });

      if (error) {
        throw error;
      }

      const extractedFields = parseAIResponse(data.analysis);
      
      if (extractedFields && Object.keys(extractedFields).length > 0) {
        onFieldsPopulated?.(extractedFields);
        
        toast({
          title: "Comprehensive AI Analysis Complete",
          description: `Analyzed all available data and populated ${Object.keys(extractedFields).length} fields`,
        });
      }

    } catch (error) {
      console.error('Comprehensive AI Analysis error:', error);
      toast({
        title: "Analysis Error",
        description: "Unable to perform comprehensive analysis.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    analyzeText,
    analyzeAllFields,
    isAnalyzing
  };
};
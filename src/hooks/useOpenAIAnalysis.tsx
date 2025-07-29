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

      if (error) {
        throw error;
      }

      // Parse the AI response to extract structured data
      const extractedFields = parseAIResponse(data.analysis);
      
      if (extractedFields && Object.keys(extractedFields).length > 0) {
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
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Brain, TrendingUp, AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useDeal } from '@/contexts/DealContext';

export const AIAnalysisPanel: React.FC = () => {
  const { deal } = useDeal();
  const { toast } = useToast();
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [analysisType, setAnalysisType] = useState<'deal-analysis' | 'market-insights' | 'risk-assessment'>('deal-analysis');

  const runAnalysis = async () => {
    if (!deal) {
      toast({
        title: "No Deal Data",
        description: "Please enter deal information first",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('openai-analysis', {
        body: {
          dealData: deal,
          analysisType: analysisType
        }
      });

      if (error) throw error;

      setAnalysis(data.analysis);
      toast({
        title: "Analysis Complete",
        description: "AI analysis has been generated successfully",
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to generate AI analysis",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          AI Deal Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={analysisType === 'deal-analysis' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAnalysisType('deal-analysis')}
          >
            <TrendingUp className="h-4 w-4 mr-1" />
            Deal Analysis
          </Button>
          <Button
            variant={analysisType === 'market-insights' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAnalysisType('market-insights')}
          >
            Market Insights
          </Button>
          <Button
            variant={analysisType === 'risk-assessment' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAnalysisType('risk-assessment')}
          >
            <AlertTriangle className="h-4 w-4 mr-1" />
            Risk Assessment
          </Button>
        </div>

        <Button
          onClick={runAnalysis}
          disabled={loading || !deal}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            'Generate AI Analysis'
          )}
        </Button>

        {analysis && (
          <div className="mt-4 p-4 bg-gradient-subtle rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">AI Insights</Badge>
            </div>
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap text-sm">{analysis}</pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
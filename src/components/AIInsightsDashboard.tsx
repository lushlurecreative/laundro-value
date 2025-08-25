import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Target,
  DollarSign,
  BarChart3,
  MapPin,
  Lightbulb,
  TrendingDown
} from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";

interface AIInsightsProps {
  dealId: string;
  dealData: any;
  onRunAnalysis: () => void;
}

interface AnalysisResults {
  dealAnalysis?: any;
  marketData?: any;
  expenseAnalysis?: any[];
  revenueProjections?: any;
  riskAssessment?: any;
  recommendations?: any[];
}

export const AIInsightsDashboard: React.FC<AIInsightsProps> = ({ 
  dealId, 
  dealData, 
  onRunAnalysis 
}) => {
  const user = { id: 'test-user' }; // Mock user for testing
  const [analysisResults, setAnalysisResults] = useState<AnalysisResults>({});
  const [isLoading, setIsLoading] = useState(false);
  const [lastAnalyzed, setLastAnalyzed] = useState<string | null>(null);

  useEffect(() => {
    if (dealId && user) {
      loadExistingAnalysis();
    }
  }, [dealId, user]);

  const loadExistingAnalysis = async () => {
    try {
      // Load all analysis data
      const [
        dealAnalysisRes,
        expenseAnalysisRes,
        revenueProjectionsRes,
        riskAssessmentRes,
        recommendationsRes
      ] = await Promise.all([
        supabase.from('deal_analysis').select('*').eq('deal_id', dealId).single(),
        supabase.from('expense_analysis').select('*').eq('deal_id', dealId),
        supabase.from('revenue_projections').select('*').eq('deal_id', dealId).single(),
        supabase.from('risk_assessments').select('*').eq('deal_id', dealId).single(),
        supabase.from('ai_recommendations').select('*').eq('deal_id', dealId).order('priority')
      ]);

      setAnalysisResults({
        dealAnalysis: dealAnalysisRes.data,
        expenseAnalysis: expenseAnalysisRes.data || [],
        revenueProjections: revenueProjectionsRes.data,
        riskAssessment: riskAssessmentRes.data,
        recommendations: recommendationsRes.data || []
      });

      if (dealAnalysisRes.data) {
        setLastAnalyzed(new Date(dealAnalysisRes.data.created_at).toLocaleString());
      }

    } catch (error) {
      console.error('Error loading analysis:', error);
    }
  };

  const runComprehensiveAnalysis = async () => {
    if (!dealData || !user) return;
    
    setIsLoading(true);
    
    try {
      const response = await supabase.functions.invoke('comprehensive-ai-analyzer', {
        body: {
          dealData,
          dealId,
          userId: user.id
        }
      });

      if (response.error) throw response.error;

      // Reload analysis data
      await loadExistingAnalysis();
      setLastAnalyzed(new Date().toLocaleString());
      
    } catch (error) {
      console.error('Error running analysis:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPriorityColor = (priority: number) => {
    if (priority === 1) return 'destructive';
    if (priority === 2) return 'secondary';
    return 'outline';
  };

  if (!analysisResults.dealAnalysis && !isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            AI Intelligence Dashboard
          </CardTitle>
          <CardDescription>
            Run comprehensive AI analysis to get insights, recommendations, and risk assessment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={runComprehensiveAnalysis}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Analyzing...' : 'Run AI Analysis'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                AI Intelligence Dashboard
              </CardTitle>
              <CardDescription>
                Last analyzed: {lastAnalyzed || 'Never'}
              </CardDescription>
            </div>
            <Button 
              onClick={runComprehensiveAnalysis}
              disabled={isLoading}
              variant="outline"
            >
              {isLoading ? 'Analyzing...' : 'Refresh Analysis'}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Overall Scores */}
      {analysisResults.dealAnalysis && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Overall Score</p>
                  <p className={`text-2xl font-bold ${getScoreColor(analysisResults.dealAnalysis.overall_score)}`}>
                    {analysisResults.dealAnalysis.overall_score}/100
                  </p>
                </div>
                <Target className="h-8 w-8 text-muted-foreground" />
              </div>
              <Progress value={analysisResults.dealAnalysis.overall_score} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Market Score</p>
                  <p className={`text-2xl font-bold ${getScoreColor(analysisResults.dealAnalysis.market_score)}`}>
                    {analysisResults.dealAnalysis.market_score}/100
                  </p>
                </div>
                <MapPin className="h-8 w-8 text-muted-foreground" />
              </div>
              <Progress value={analysisResults.dealAnalysis.market_score} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Financial Score</p>
                  <p className={`text-2xl font-bold ${getScoreColor(analysisResults.dealAnalysis.financial_score)}`}>
                    {analysisResults.dealAnalysis.financial_score}/100
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-muted-foreground" />
              </div>
              <Progress value={analysisResults.dealAnalysis.financial_score} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Risk Level</p>
                  <p className={`text-2xl font-bold ${getScoreColor(100 - analysisResults.dealAnalysis.risk_score)}`}>
                    {analysisResults.dealAnalysis.risk_score}/100
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-muted-foreground" />
              </div>
              <Progress value={analysisResults.dealAnalysis.risk_score} className="mt-2" />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Analysis Tabs */}
      <Tabs defaultValue="recommendations" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="risk">Risk</TabsTrigger>
          <TabsTrigger value="market">Market</TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                AI Recommendations
              </CardTitle>
              <CardDescription>
                Prioritized action items based on comprehensive analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analysisResults.recommendations?.length ? (
                <div className="space-y-4">
                  {analysisResults.recommendations.map((rec, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={getPriorityColor(rec.priority)}>
                            Priority {rec.priority}
                          </Badge>
                          <Badge variant="outline">{rec.category}</Badge>
                        </div>
                        {rec.estimated_benefit && (
                          <span className="text-sm font-medium text-green-600">
                            ${rec.estimated_benefit.toLocaleString()} benefit
                          </span>
                        )}
                      </div>
                      <h4 className="font-semibold mb-1">{rec.title}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{rec.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Impact: {rec.impact_score}/100</span>
                        <span>Difficulty: {rec.implementation_difficulty}/5</span>
                        <span>Timeframe: {rec.timeframe}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No recommendations available. Run analysis first.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Revenue Optimization
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analysisResults.revenueProjections ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Current vs Projected</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Current Revenue:</span>
                        <span className="font-medium">
                          ${Number(analysisResults.revenueProjections.current_revenue || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Projected Revenue:</span>
                        <span className="font-medium text-green-600">
                          ${Number(analysisResults.revenueProjections.projected_revenue || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span>Potential Increase:</span>
                        <span className="font-medium text-green-600">
                          ${(Number(analysisResults.revenueProjections.projected_revenue || 0) - 
                             Number(analysisResults.revenueProjections.current_revenue || 0)).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Optimization Opportunities</h4>
                    <div className="space-y-2">
                      {analysisResults.revenueProjections.optimization_opportunities?.map((opp: string, index: number) => (
                        <div key={index} className="text-sm p-2 bg-muted rounded">
                          {opp}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No revenue projections available. Run analysis first.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5" />
                Expense Validation
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analysisResults.expenseAnalysis?.length ? (
                <div className="space-y-3">
                  {analysisResults.expenseAnalysis.map((expense, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <h4 className="font-medium">{expense.expense_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          ${Number(expense.reported_amount || 0).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={expense.is_reasonable ? 'default' : 'destructive'}>
                          {expense.is_reasonable ? 'Reasonable' : 'Review Needed'}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {expense.confidence_level}% confidence
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No expense analysis available. Run analysis first.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Risk Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analysisResults.riskAssessment ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-4">Risk Breakdown</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Financial Risk</span>
                          <span className="text-sm font-medium">
                            {analysisResults.riskAssessment.financial_risk_score}/100
                          </span>
                        </div>
                        <Progress value={analysisResults.riskAssessment.financial_risk_score} />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Market Risk</span>
                          <span className="text-sm font-medium">
                            {analysisResults.riskAssessment.market_risk_score}/100
                          </span>
                        </div>
                        <Progress value={analysisResults.riskAssessment.market_risk_score} />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Operational Risk</span>
                          <span className="text-sm font-medium">
                            {analysisResults.riskAssessment.operational_risk_score}/100
                          </span>
                        </div>
                        <Progress value={analysisResults.riskAssessment.operational_risk_score} />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-4">Success Probability</h4>
                    <div className="text-center">
                      <div className={`text-4xl font-bold ${getScoreColor(analysisResults.riskAssessment.success_probability)}`}>
                        {Math.round(analysisResults.riskAssessment.success_probability)}%
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Likelihood of meeting investment targets
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No risk assessment available. Run analysis first.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="market" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Market Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analysisResults.dealAnalysis?.key_insights ? (
                <div className="space-y-4">
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Market analysis insights based on location, demographics, and competition data.
                    </AlertDescription>
                  </Alert>
                  <div className="prose max-w-none">
                    <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded">
                      {JSON.stringify(analysisResults.dealAnalysis.key_insights, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No market analysis available. Run analysis first.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
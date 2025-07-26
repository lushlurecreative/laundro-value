import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDeal } from '@/contexts/useDeal';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { calculateMetrics } from '@/utils/calculations';
import { supabase } from '@/integrations/supabase/client';
import { Brain, TrendingUp, Shield, DollarSign, MapPin, Crown, Lock, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface AIAnalysisResult {
  analysis: string;
  analysisType: string;
  dealName: string;
  timestamp: string;
  tokensUsed: number;
}

export const AIInsights: React.FC = () => {
  const { deal, leaseDetails, expenseItems, machineInventory, ancillaryIncome, utilityAnalysis } = useDeal();
  const { canPerformAction, trackUsage, getRemainingUsage, subscription, createCheckoutSession } = useSubscription();
  
  const [aiResults, setAiResults] = useState<Record<string, AIAnalysisResult>>({});
  const [loadingTypes, setLoadingTypes] = useState<Set<string>>(new Set());
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const metrics = calculateMetrics(
    deal, leaseDetails, expenseItems, machineInventory, ancillaryIncome, utilityAnalysis
  );

  const analysisTypes = [
    {
      key: 'comprehensive',
      title: 'Comprehensive Analysis',
      description: 'Complete investment analysis with recommendations',
      icon: Brain,
      premium: false
    },
    {
      key: 'risk_assessment',
      title: 'Risk Assessment',
      description: 'Detailed risk analysis and mitigation strategies',
      icon: Shield,
      premium: true
    },
    {
      key: 'market_insights',
      title: 'Market Insights',
      description: 'Market positioning and competitive analysis',
      icon: MapPin,
      premium: true
    },
    {
      key: 'valuation',
      title: 'Valuation Analysis',
      description: 'Professional valuation using multiple approaches',
      icon: DollarSign,
      premium: true
    }
  ];

  const handleUpgradeClick = async () => {
    try {
      setCheckoutLoading(true);
      await createCheckoutSession('professional', 'monthly');
      toast({
        title: "Redirecting to checkout",
        description: "You'll be redirected to upgrade your subscription.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start checkout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCheckoutLoading(false);
    }
  };

  const runAIAnalysis = async (analysisType: string) => {
    if (!deal) {
      toast({
        title: "No deal data",
        description: "Please enter deal information first",
        variant: "destructive",
      });
      return;
    }

    if (!canPerformAction('create_analysis')) {
      toast({
        title: "Usage limit reached",
        description: "You've reached your analysis limit this month. Upgrade for unlimited analyses.",
        variant: "destructive",
      });
      return;
    }

    // Check if premium analysis is allowed
    const analysisConfig = analysisTypes.find(t => t.key === analysisType);
    if (analysisConfig?.premium && subscription?.subscription_tier === 'free') {
      toast({
        title: "Premium feature",
        description: "This analysis type requires a premium subscription.",
        variant: "destructive",
      });
      return;
    }

    setLoadingTypes(prev => new Set(prev).add(analysisType));

    try {
      // Prepare comprehensive deal data for AI analysis
      const dealData = {
        dealName: deal.dealName,
        askingPrice: deal.askingPrice,
        grossIncomeAnnual: deal.grossIncomeAnnual,
        noi: metrics.noi,
        capRate: metrics.capRate,
        coCROI: metrics.coCROI,
        dscr: metrics.dscr,
        propertyAddress: deal.propertyAddress,
        facilitySizeSqft: deal.facilitySizeSqft,
        isRealEstateIncluded: deal.isRealEstateIncluded,
        machineCount: machineInventory.length,
        totalOperatingExpenses: metrics.totalOperatingExpenses,
        loanAmount: metrics.loanAmount,
        downPaymentPercent: deal.downPaymentPercent,
        loanInterestRatePercent: deal.loanInterestRatePercent,
        loanTermYears: deal.loanTermYears,
        annualCashFlow: metrics.annualCashFlow,
        totalGrossIncome: metrics.totalGrossIncome
      };

      const { data, error } = await supabase.functions.invoke('ai-deal-analysis', {
        body: { dealData, analysisType }
      });

      if (error) throw error;

      setAiResults(prev => ({
        ...prev,
        [analysisType]: data
      }));

      // Track usage
      await trackUsage('ai_analysis_generated', deal.dealId, { 
        analysisType,
        tokensUsed: data.tokensUsed 
      });

      toast({
        title: "Analysis complete",
        description: `${analysisConfig?.title} has been generated.`,
      });

    } catch (error) {
      console.error('AI Analysis error:', error);
      toast({
        title: "Analysis failed",
        description: "Failed to generate AI analysis. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingTypes(prev => {
        const newSet = new Set(prev);
        newSet.delete(analysisType);
        return newSet;
      });
    }
  };

  const remainingAnalyses = getRemainingUsage('analyses_per_month');
  const isFreeTier = subscription?.subscription_tier === 'free';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">AI-Powered Insights</h2>
        <p className="text-muted-foreground">
          Get intelligent analysis and recommendations powered by advanced AI
        </p>
      </div>

      {/* Usage Alert for Free Tier */}
      {isFreeTier && (
        <Alert className="border-warning">
          <Crown className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              AI analyses remaining this month: <strong>{remainingAnalyses}</strong>
              {remainingAnalyses === 0 && " - Upgrade for unlimited AI insights"}
            </span>
            {remainingAnalyses <= 1 && (
              <Button 
                size="sm" 
                onClick={handleUpgradeClick}
                disabled={checkoutLoading}
              >
                {checkoutLoading ? 'Processing...' : 'Upgrade'}
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

      {!deal && (
        <Card className="border-dashed border-2 border-muted">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <Brain className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Deal Data</h3>
              <p className="text-muted-foreground mb-4">
                Enter deal information first to access AI-powered insights.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {deal && (
        <>
          {/* Analysis Type Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysisTypes.map((analysisType) => {
              const Icon = analysisType.icon;
              const isLoading = loadingTypes.has(analysisType.key);
              const hasResult = aiResults[analysisType.key];
              const isPremiumLocked = analysisType.premium && isFreeTier;
              const canRun = canPerformAction('create_analysis') && !isPremiumLocked;

              return (
                <Card key={analysisType.key} className="relative">
                  {analysisType.premium && (
                    <Badge 
                      variant={isFreeTier ? "secondary" : "default"} 
                      className="absolute top-2 right-2 flex items-center gap-1"
                    >
                      <Crown className="w-3 h-3" />
                      Premium
                    </Badge>
                  )}
                  
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon className="w-5 h-5" />
                      {analysisType.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {analysisType.description}
                    </p>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {hasResult && (
                          <Badge variant="outline" className="text-xs">
                            Generated {new Date(hasResult.timestamp).toLocaleTimeString()}
                          </Badge>
                        )}
                      </div>
                      
                      <Button
                        onClick={() => runAIAnalysis(analysisType.key)}
                        disabled={!canRun || isLoading}
                        size="sm"
                        variant={hasResult ? "outline" : "default"}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Analyzing...
                          </>
                        ) : isPremiumLocked ? (
                          <>
                            <Lock className="w-4 h-4 mr-2" />
                            Upgrade Required
                          </>
                        ) : hasResult ? (
                          'Regenerate'
                        ) : (
                          'Analyze'
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Results Display */}
          {Object.keys(aiResults).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  AI Analysis Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue={Object.keys(aiResults)[0]} className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    {Object.keys(aiResults).map((key) => {
                      const analysisType = analysisTypes.find(t => t.key === key);
                      return (
                        <TabsTrigger key={key} value={key} className="text-xs">
                          {analysisType?.title || key}
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>
                  
                  {Object.entries(aiResults).map(([key, result]) => (
                    <TabsContent key={key} value={key} className="mt-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold">{result.dealName}</h3>
                          <Badge variant="outline">
                            {new Date(result.timestamp).toLocaleString()}
                          </Badge>
                        </div>
                        
                        <div className="prose prose-sm max-w-none">
                          <div className="whitespace-pre-wrap bg-muted/50 rounded-lg p-4">
                            {result.analysis}
                          </div>
                        </div>
                        
                        <div className="text-xs text-muted-foreground">
                          Tokens used: {result.tokensUsed?.toLocaleString() || 'N/A'}
                        </div>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default AIInsights;
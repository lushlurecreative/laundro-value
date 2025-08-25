import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useDeal } from '@/contexts/useDeal';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { calculateMetrics, formatCurrency, formatPercentage, calculateWaterBasedIncome, calculateCollectionBasedIncome } from '@/utils/calculations';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Crown, Lock, TrendingUp } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { HelpTooltip } from '@/components/ui/help-tooltip';
import { ScenarioComparison } from './ScenarioComparison';
import { BreakevenAnalysis } from './BreakevenAnalysis';
import { ComprehensiveAIAnalysis } from './ComprehensiveAIAnalysis';
import { MissingDataAnalysis } from './MissingDataAnalysis';
import { SavedDealsSelector } from './SavedDealsSelector';

export const AnalysisScenarios: React.FC = () => {
  const { deal, leaseDetails, expenseItems, machineInventory, ancillaryIncome, utilityAnalysis } = useDeal();
  const { canPerformAction, trackUsage, getRemainingUsage, subscription, createCheckoutSession } = useSubscription();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  
  // Sensitivity analysis sliders
  const [vendPriceAdjustment, setVendPriceAdjustment] = useState([0]);
  const [utilityCostAdjustment, setUtilityCostAdjustment] = useState([0]);
  const [turnsPerDayAdjustment, setTurnsPerDayAdjustment] = useState([0]);
  const [interestRateAdjustment, setInterestRateAdjustment] = useState([0]);
  const [downPaymentAdjustment, setDownPaymentAdjustment] = useState([0]);

  // Calculate baseline metrics
  const baselineMetrics = calculateMetrics(
    deal, leaseDetails, expenseItems, machineInventory, ancillaryIncome, utilityAnalysis
  );

  const handleUpgradeClick = async () => {
    try {
      setCheckoutLoading(true);
      await createCheckoutSession('professional', 'monthly');
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

  const remainingAnalyses = getRemainingUsage('analyses_per_month');
  const isFreeTier = subscription?.subscription_tier === 'free';

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold">Analysis & Scenarios</h2>
          <p className="text-muted-foreground">
            Comprehensive analysis tools including sensitivity analysis, breakeven calculations, and scenario comparison.
          </p>
        </div>

        <Tabs defaultValue="sensitivity" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="sensitivity">Sensitivity Analysis</TabsTrigger>
            <TabsTrigger value="comprehensive">AI Analysis</TabsTrigger>
            <TabsTrigger value="missing">Missing Data</TabsTrigger>
            <TabsTrigger value="breakeven">Breakeven Analysis</TabsTrigger>
            <TabsTrigger value="comparison">Scenario Comparison</TabsTrigger>
          </TabsList>

          <TabsContent value="sensitivity" className="space-y-6">
            {isFreeTier && (
              <Alert className="border-warning">
                <Crown className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>
                    Analyses remaining this month: <strong>{remainingAnalyses}</strong>
                    {remainingAnalyses === 0 && " - Upgrade for unlimited analyses"}
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
                    <h3 className="text-lg font-semibold mb-2">No Deal Data</h3>
                    <p className="text-muted-foreground mb-4">
                      Enter deal information first to access analysis tools.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {deal && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Sensitivity Analysis
                    <HelpTooltip content="This tool allows you to see how changes to key variables like rent, utility costs, and vend prices would impact your deal's profitability in real-time." />
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Test how changes in key variables affect your investment returns.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <TrendingUp className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Sensitivity Analysis</h3>
                    <p className="text-muted-foreground">
                      Advanced sensitivity analysis tools coming soon.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="comprehensive" className="space-y-6">
            <ComprehensiveAIAnalysis />
          </TabsContent>

          <TabsContent value="missing" className="space-y-6">
            <MissingDataAnalysis />
          </TabsContent>

          <TabsContent value="breakeven" className="space-y-6">
            <BreakevenAnalysis />
          </TabsContent>

          <TabsContent value="comparison" className="space-y-6">
            <ScenarioComparison />
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
};
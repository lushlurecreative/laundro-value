import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

  // Calculate adjusted metrics based on sensitivity sliders
  const getAdjustedMetrics = () => {
    if (!deal) return baselineMetrics;

    // Create adjusted deal object
    const adjustedDeal = {
      ...deal,
      grossIncomeAnnual: deal.grossIncomeAnnual * (1 + turnsPerDayAdjustment[0] / 100),
      loanInterestRatePercent: Math.max(0.1, deal.loanInterestRatePercent + interestRateAdjustment[0]),
      downPaymentPercent: Math.max(5, Math.min(50, deal.downPaymentPercent + downPaymentAdjustment[0])),
      // Apply revenue adjustment to value-added services too
      valueAddedServices: deal.valueAddedServices?.map(service => ({
        ...service,
        potentialRevenue: service.potentialRevenue * (1 + turnsPerDayAdjustment[0] / 100)
      })) || []
    };

    // Adjust machine vend prices
    const adjustedMachines = machineInventory.map(machine => ({
      ...machine,
      vendPricePerUse: machine.vendPricePerUse * (1 + vendPriceAdjustment[0] / 100)
    }));

    // Adjust utility expenses
    const adjustedExpenses = expenseItems.map(expense => {
      if (['Water/Sewer', 'Gas', 'Electricity'].includes(expense.expenseName)) {
        return {
          ...expense,
          amountAnnual: expense.amountAnnual * (1 + utilityCostAdjustment[0] / 100)
        };
      }
      return expense;
    });

    return calculateMetrics(
      adjustedDeal, leaseDetails, adjustedExpenses, adjustedMachines, ancillaryIncome, utilityAnalysis
    );
  };

  const adjustedMetrics = getAdjustedMetrics();

  // Income verification calculations
  const waterBasedIncome = calculateWaterBasedIncome(utilityAnalysis, machineInventory);
  const collectionBasedIncome = calculateCollectionBasedIncome(utilityAnalysis);
  const sellerReported = deal?.grossIncomeAnnual || 0;

  const calculateVariance = (val1: number, val2: number) => {
    if (val2 === 0) return 0;
    return ((val1 - val2) / val2) * 100;
  };

  const getVerificationScore = () => {
    if (sellerReported === 0 || waterBasedIncome === 0 || collectionBasedIncome === 0) return 0;
    
    const variance1 = Math.abs(calculateVariance(waterBasedIncome, sellerReported));
    const variance2 = Math.abs(calculateVariance(collectionBasedIncome, sellerReported));
    const variance3 = Math.abs(calculateVariance(collectionBasedIncome, waterBasedIncome));
    
    const avgVariance = (variance1 + variance2 + variance3) / 3;
    
    if (avgVariance < 2) return 100;
    if (avgVariance < 5) return 90;
    if (avgVariance < 10) return 75;
    if (avgVariance < 15) return 60;
    if (avgVariance < 25) return 40;
    return 20;
  };

  const verificationScore = getVerificationScore();

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-danger';
  };

  const getVarianceColor = (variance: number) => {
    const absVariance = Math.abs(variance);
    if (absVariance <= 5) return 'text-success';
    if (absVariance <= 15) return 'text-warning';
    return 'text-danger';
  };

  // Industry benchmarks 
  const industryBenchmarks = [
    { category: 'Rent as % of Gross Income', benchmark: '15-25%', actual: deal ? ((leaseDetails?.monthlyRent || 0) * 12 / baselineMetrics.totalGrossIncome * 100).toFixed(1) + '%' : 'N/A' },
    { category: 'Utilities as % of Gross Income', benchmark: '20-30%', actual: deal ? ((expenseItems.filter(e => ['Water/Sewer', 'Gas', 'Electricity'].includes(e.expenseName)).reduce((sum, e) => sum + e.amountAnnual, 0) / baselineMetrics.totalGrossIncome * 100).toFixed(1) + '%') : 'N/A' },
    { category: 'Operating Expenses as % of Gross', benchmark: '65-75%', actual: deal ? (baselineMetrics.totalOperatingExpenses / baselineMetrics.totalGrossIncome * 100).toFixed(1) + '%' : 'N/A' },
    { category: 'Cap Rate', benchmark: '6-12%', actual: formatPercentage(baselineMetrics.capRate) },
    { category: 'Cash-on-Cash ROI', benchmark: '12-20%', actual: formatPercentage(baselineMetrics.coCROI) }
  ];

  const isOutOfRange = (category: string, actual: string) => {
    if (actual === 'N/A') return false;
    const actualNum = parseFloat(actual.replace('%', ''));
    
    switch (category) {
      case 'Rent as % of Gross Income':
        return actualNum < 15 || actualNum > 25;
      case 'Utilities as % of Gross Income':
        return actualNum < 20 || actualNum > 30;
      case 'Operating Expenses as % of Gross':
        return actualNum < 65 || actualNum > 75;
      case 'Cap Rate':
        return actualNum < 6 || actualNum > 12;
      case 'Cash-on-Cash ROI':
        return actualNum < 12 || actualNum > 20;
      default:
        return false;
    }
  };

  const handleRunAnalysis = async () => {
    if (!canPerformAction('create_analysis')) {
      toast({
        title: "Usage limit reached",
        description: "You've reached your analysis limit this month. Upgrade to run more analyses.",
        variant: "destructive",
      });
      return;
    }
    
    await trackUsage('analysis_created', deal?.dealId, { analysisType: 'sensitivity' });
    toast({
      title: "Analysis completed",
      description: "Sensitivity analysis has been generated.",
    });
  };

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

  const remainingAnalyses = getRemainingUsage('analyses_per_month');
  const isFreeTier = subscription?.subscription_tier === 'free';

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Usage Alert for Free Tier */}
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

      <div>
        <h2 className="text-3xl font-bold">Analysis & Scenarios</h2>
        <p className="text-muted-foreground">
          Sensitivity analysis helps you understand how changes in key variables affect your investment returns. 
          Use the sliders below to test different scenarios and see real-time impact on your KPIs.
        </p>
      </div>

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
        <>
          {/* Sensitivity Analysis */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CardTitle>Sensitivity Analysis</CardTitle>
                    <Tooltip>
                      <TooltipTrigger>
                        <span className="text-xs bg-muted px-2 py-1 rounded">?</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Test how changes in key variables (revenue, interest rates, down payment) affect your investment returns. Use sliders to model different scenarios and understand deal sensitivity to market changes.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <strong>What is Sensitivity Analysis?</strong> This powerful tool shows how changes in key variables affect your investment returns. 
                    Use the sliders below to test "what-if" scenarios - like increasing prices, reducing costs, or changing financing terms. 
                    This helps you understand which factors most impact profitability and assess deal risk under different conditions.
                  </p>
                  {!canPerformAction('create_analysis') && (
                    <Alert>
                      <Lock className="h-4 w-4" />
                      <AlertDescription className="flex items-center justify-between">
                        <span>Advanced analysis features require a premium subscription</span>
                        <Button 
                          size="sm" 
                          onClick={handleUpgradeClick}
                          disabled={checkoutLoading}
                        >
                          Upgrade
                        </Button>
                      </AlertDescription>
                    </Alert>
                  )}
                </CardHeader>
            <CardContent className="space-y-6">
              {canPerformAction('create_analysis') ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium">Vend Price Adjustment</label>
                      <Badge variant="outline">{vendPriceAdjustment[0] > 0 ? '+' : ''}{vendPriceAdjustment[0]}%</Badge>
                    </div>
                    <Slider
                      value={vendPriceAdjustment}
                      onValueChange={setVendPriceAdjustment}
                      max={50}
                      min={-50}
                      step={5}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium">Utility Cost Adjustment</label>
                      <Badge variant="outline">{utilityCostAdjustment[0] > 0 ? '+' : ''}{utilityCostAdjustment[0]}%</Badge>
                    </div>
                    <Slider
                      value={utilityCostAdjustment}
                      onValueChange={setUtilityCostAdjustment}
                      max={50}
                      min={-50}
                      step={5}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium">Revenue Adjustment</label>
                      <Badge variant="outline">{turnsPerDayAdjustment[0] > 0 ? '+' : ''}{turnsPerDayAdjustment[0]}%</Badge>
                    </div>
                    <Slider
                      value={turnsPerDayAdjustment}
                      onValueChange={setTurnsPerDayAdjustment}
                      max={30}
                      min={-30}
                      step={5}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium">Interest Rate Adjustment</label>
                      <Badge variant="outline">{interestRateAdjustment[0] > 0 ? '+' : ''}{interestRateAdjustment[0]}%</Badge>
                    </div>
                    <Slider
                      value={interestRateAdjustment}
                      onValueChange={setInterestRateAdjustment}
                      max={5}
                      min={-3}
                      step={0.25}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium">Down Payment Adjustment</label>
                      <Badge variant="outline">{downPaymentAdjustment[0] > 0 ? '+' : ''}{downPaymentAdjustment[0]}%</Badge>
                    </div>
                    <Slider
                      value={downPaymentAdjustment}
                      onValueChange={setDownPaymentAdjustment}
                      max={25}
                      min={-20}
                      step={5}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <h4 className="text-lg font-semibold">Adjusted KPIs</h4>
                    <Tooltip>
                      <TooltipTrigger>
                        <span className="text-xs bg-muted px-2 py-1 rounded cursor-help">?</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Real-time KPI calculations showing how your scenario adjustments impact key investment metrics compared to baseline values</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gradient-subtle rounded-lg">
                      <div className="flex items-center gap-1">
                        <p className="text-sm text-muted-foreground">Cap Rate</p>
                        <Tooltip>
                          <TooltipTrigger>
                            <span className="text-xs bg-muted px-1 py-0.5 rounded cursor-help">?</span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Net Operating Income ÷ Purchase Price - shows your adjusted return on total investment</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <p className="text-xl font-bold">{formatPercentage(adjustedMetrics.capRate)}</p>
                      <p className="text-xs text-muted-foreground">
                        ({adjustedMetrics.capRate > baselineMetrics.capRate ? '+' : ''}{(adjustedMetrics.capRate - baselineMetrics.capRate).toFixed(1)}%)
                      </p>
                    </div>
                    <div className="p-4 bg-gradient-subtle rounded-lg">
                      <div className="flex items-center gap-1">
                        <p className="text-sm text-muted-foreground">Cash-on-Cash ROI</p>
                        <Tooltip>
                          <TooltipTrigger>
                            <span className="text-xs bg-muted px-1 py-0.5 rounded cursor-help">?</span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Annual Cash Flow ÷ Initial Cash Investment - measures your adjusted cash return on cash invested</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <p className="text-xl font-bold">{formatPercentage(adjustedMetrics.coCROI)}</p>
                      <p className="text-xs text-muted-foreground">
                        ({adjustedMetrics.coCROI > baselineMetrics.coCROI ? '+' : ''}{(adjustedMetrics.coCROI - baselineMetrics.coCROI).toFixed(1)}%)
                      </p>
                    </div>
                    <div className="p-4 bg-gradient-subtle rounded-lg">
                      <div className="flex items-center gap-1">
                        <p className="text-sm text-muted-foreground">Annual Cash Flow</p>
                        <Tooltip>
                          <TooltipTrigger>
                            <span className="text-xs bg-muted px-1 py-0.5 rounded cursor-help">?</span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Net Operating Income - Debt Service - actual cash you'll receive annually after all expenses and loan payments</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <p className="text-xl font-bold">{formatCurrency(adjustedMetrics.annualCashFlow)}</p>
                      <p className="text-xs text-muted-foreground">
                        ({adjustedMetrics.annualCashFlow > baselineMetrics.annualCashFlow ? '+' : ''}{formatCurrency(adjustedMetrics.annualCashFlow - baselineMetrics.annualCashFlow)})
                      </p>
                    </div>
                    <div className="p-4 bg-gradient-subtle rounded-lg">
                      <div className="flex items-center gap-1">
                        <p className="text-sm text-muted-foreground">DSCR</p>
                        <Tooltip>
                          <TooltipTrigger>
                            <span className="text-xs bg-muted px-1 py-0.5 rounded cursor-help">?</span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Debt Service Coverage Ratio - NOI ÷ Annual Debt Payments. Shows ability to service debt (1.25+ is healthy)</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <p className="text-xl font-bold">{adjustedMetrics.dscr.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">
                        ({adjustedMetrics.dscr > baselineMetrics.dscr ? '+' : ''}{(adjustedMetrics.dscr - baselineMetrics.dscr).toFixed(2)})
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              ) : (
                <div className="text-center py-12">
                  <Lock className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Premium Analysis Required</h3>
                  <p className="text-muted-foreground mb-4">
                    Unlock advanced sensitivity analysis and scenario modeling
                  </p>
                  <Button onClick={handleUpgradeClick} disabled={checkoutLoading}>
                    <Crown className="w-4 h-4 mr-2" />
                    {checkoutLoading ? 'Processing...' : 'Upgrade to Professional'}
                  </Button>
                </div>
              )}
              
              <div className="flex justify-center pt-4">
                <Button 
                  onClick={handleRunAnalysis}
                  disabled={!canPerformAction('create_analysis')}
                  className="flex items-center gap-2"
                >
                  <TrendingUp className="w-4 h-4" />
                  Run Analysis
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Expansion Potential Analysis */}
          <Card className="shadow-elegant">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>Expansion Potential Analysis</CardTitle>
                <Tooltip>
                  <TooltipTrigger>
                    <span className="text-xs bg-muted px-2 py-1 rounded">?</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Analyze physical space and infrastructure capacity for adding more equipment. This helps estimate future growth potential and required capital investment.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="text-sm text-muted-foreground">
                Evaluate the potential for adding machines to grow revenue and calculate ROI on expansion investment
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {deal?.expansionPotential && (deal.expansionPotential.additionalMachines > 0 || deal.expansionPotential.expansionCost > 0) ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Additional Machines</h4>
                    <p className="text-2xl font-bold text-primary">{deal.expansionPotential.additionalMachines}</p>
                    <p className="text-xs text-muted-foreground mt-1">Machines that can be added</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Expansion Cost</h4>
                    <p className="text-2xl font-bold text-primary">{formatCurrency(deal.expansionPotential.expansionCost)}</p>
                    <p className="text-xs text-muted-foreground mt-1">Total investment required</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Potential Additional Income</h4>
                    <p className="text-2xl font-bold text-primary">{formatCurrency(deal.expansionPotential.potentialAdditionalIncome || 0)}</p>
                    <p className="text-xs text-muted-foreground mt-1">Estimated annual revenue increase</p>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <p>No expansion potential data entered yet.</p>
                  <p className="text-sm mt-1">Go to Deal Inputs to add expansion information.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Income Verification Analysis */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle>Income Verification Analysis</CardTitle>
              <p className="text-sm text-muted-foreground">
                Compare different income calculation methods to verify deal accuracy
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">1. Seller Reported</h4>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(sellerReported)}</p>
                  <p className="text-xs text-muted-foreground mt-1">As provided by seller</p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">2. Water-Based Estimate</h4>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(waterBasedIncome)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Based on water usage data</p>
                  {sellerReported > 0 && (
                    <p className={`text-sm mt-1 ${getVarianceColor(calculateVariance(waterBasedIncome, sellerReported))}`}>
                      {calculateVariance(waterBasedIncome, sellerReported) > 0 ? '+' : ''}{calculateVariance(waterBasedIncome, sellerReported).toFixed(1)}% vs. seller
                    </p>
                  )}
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">3. Collection-Based Estimate</h4>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(collectionBasedIncome)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Based on collection data</p>
                  {sellerReported > 0 && (
                    <p className={`text-sm mt-1 ${getVarianceColor(calculateVariance(collectionBasedIncome, sellerReported))}`}>
                      {calculateVariance(collectionBasedIncome, sellerReported) > 0 ? '+' : ''}{calculateVariance(collectionBasedIncome, sellerReported).toFixed(1)}% vs. seller
                    </p>
                  )}
                </div>
              </div>

              <Separator />

              <div className="text-center">
                <div className="inline-flex items-center space-x-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Verification Confidence Score</p>
                    <p className={`text-3xl font-bold ${getScoreColor(verificationScore)}`}>
                      {verificationScore}/100
                    </p>
                  </div>
                  <div className="w-px h-12 bg-border"></div>
                  <div className="text-left">
                    <p className="text-xs text-muted-foreground">Score Guide:</p>
                    <p className="text-xs">90-100: High confidence</p>
                    <p className="text-xs">60-89: Moderate confidence</p>
                    <p className="text-xs">Below 60: Low confidence</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Expense Benchmark Analysis */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle>Expense Benchmark Analysis</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Compare your deal metrics against industry standards
                </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {industryBenchmarks.map((benchmark, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{benchmark.category}</p>
                      <p className="text-sm text-muted-foreground">Industry Standard: {benchmark.benchmark}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${isOutOfRange(benchmark.category, benchmark.actual) ? 'text-danger' : 'text-success'}`}>
                        {benchmark.actual}
                      </p>
                      {isOutOfRange(benchmark.category, benchmark.actual) && (
                        <Badge variant="destructive" className="text-xs">
                          Outside Range
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
    </TooltipProvider>
  );
};

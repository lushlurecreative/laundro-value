import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useDeal } from '@/contexts/DealContext';
import { calculateMetrics, formatCurrency, formatPercentage, calculateWaterBasedIncome, calculateCollectionBasedIncome } from '@/utils/calculations';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export const AnalysisScenarios: React.FC = () => {
  const { deal, leaseDetails, expenseItems, machineInventory, ancillaryIncome, utilityAnalysis } = useDeal();
  
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
      downPaymentPercent: Math.max(5, Math.min(50, deal.downPaymentPercent + downPaymentAdjustment[0]))
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

  return (
    <TooltipProvider>
      <div className="space-y-6">
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
                </CardHeader>
            <CardContent className="space-y-6">
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
                  <h4 className="text-lg font-semibold">Adjusted KPIs</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gradient-subtle rounded-lg">
                      <p className="text-sm text-muted-foreground">Cap Rate</p>
                      <p className="text-xl font-bold">{formatPercentage(adjustedMetrics.capRate)}</p>
                      <p className="text-xs text-muted-foreground">
                        ({adjustedMetrics.capRate > baselineMetrics.capRate ? '+' : ''}{(adjustedMetrics.capRate - baselineMetrics.capRate).toFixed(1)}%)
                      </p>
                    </div>
                    <div className="p-4 bg-gradient-subtle rounded-lg">
                      <p className="text-sm text-muted-foreground">Cash-on-Cash ROI</p>
                      <p className="text-xl font-bold">{formatPercentage(adjustedMetrics.coCROI)}</p>
                      <p className="text-xs text-muted-foreground">
                        ({adjustedMetrics.coCROI > baselineMetrics.coCROI ? '+' : ''}{(adjustedMetrics.coCROI - baselineMetrics.coCROI).toFixed(1)}%)
                      </p>
                    </div>
                    <div className="p-4 bg-gradient-subtle rounded-lg">
                      <p className="text-sm text-muted-foreground">Annual Cash Flow</p>
                      <p className="text-xl font-bold">{formatCurrency(adjustedMetrics.annualCashFlow)}</p>
                      <p className="text-xs text-muted-foreground">
                        ({adjustedMetrics.annualCashFlow > baselineMetrics.annualCashFlow ? '+' : ''}{formatCurrency(adjustedMetrics.annualCashFlow - baselineMetrics.annualCashFlow)})
                      </p>
                    </div>
                    <div className="p-4 bg-gradient-subtle rounded-lg">
                      <p className="text-sm text-muted-foreground">DSCR</p>
                      <p className="text-xl font-bold">{adjustedMetrics.dscr.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">
                        ({adjustedMetrics.dscr > baselineMetrics.dscr ? '+' : ''}{(adjustedMetrics.dscr - baselineMetrics.dscr).toFixed(2)})
                      </p>
                    </div>
                  </div>
                </div>
              </div>
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

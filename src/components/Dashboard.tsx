import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDeal } from '@/contexts/DealContext';
import { calculateMetrics, formatCurrency, formatPercentage } from '@/utils/calculations';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export const Dashboard: React.FC = () => {
  const { deal, leaseDetails, expenseItems, machineInventory, ancillaryIncome, utilityAnalysis } = useDeal();
  
  const metrics = calculateMetrics(
    deal, leaseDetails, expenseItems, machineInventory, ancillaryIncome, utilityAnalysis
  );

  const getKPITooltip = (title: string): string => {
    switch (title) {
      case 'Suggested Valuation':
        return 'Estimated fair market value range based on income multiples and comparable sales';
      case 'Cap Rate':
        return 'Net Operating Income divided by purchase price - measures return on investment';
      case 'Cash-on-Cash ROI':
        return 'Annual cash flow divided by initial cash investment - measures cash-on-cash return';
      case 'Annual Cash Flow':
        return 'Net Operating Income minus debt service - the actual cash generated annually';
      case 'DSCR':
        return 'Debt Service Coverage Ratio - NOI divided by annual debt payments (1.25+ is healthy)';
      default:
        return 'Key performance indicator for investment analysis';
    }
  };

  const getKPIStatus = (actual: number, target: number, isPercentage: boolean = false) => {
    const threshold = isPercentage ? 1 : 0.1;
    if (actual >= target - threshold) return 'success';
    if (actual >= target * 0.8) return 'warning';
    return 'danger';
  };

  const kpis = [
    {
      title: 'Suggested Valuation',
      value: `${formatCurrency(metrics.suggestedValuationLow)} - ${formatCurrency(metrics.suggestedValuationHigh)}`,
      status: deal?.askingPrice ? 
        (deal.askingPrice >= metrics.suggestedValuationLow && deal.askingPrice <= metrics.suggestedValuationHigh ? 'success' : 'warning') : 
        'muted'
    },
    {
      title: 'Cap Rate',
      value: formatPercentage(metrics.capRate),
      target: deal?.targetCapRatePercent || 8,
      status: deal?.targetCapRatePercent ? getKPIStatus(metrics.capRate, deal.targetCapRatePercent, true) : 'muted'
    },
    {
      title: 'Cash-on-Cash ROI',
      value: formatPercentage(metrics.coCROI),
      target: deal?.targetCoCROIPercent || 15,
      status: deal?.targetCoCROIPercent ? getKPIStatus(metrics.coCROI, deal.targetCoCROIPercent, true) : 'muted'
    },
    {
      title: 'Annual Cash Flow',
      value: formatCurrency(metrics.annualCashFlow),
      status: metrics.annualCashFlow > 0 ? 'success' : 'danger'
    },
    {
      title: 'DSCR',
      value: metrics.dscr.toFixed(2),
      status: metrics.dscr >= 1.25 ? 'success' : metrics.dscr >= 1.0 ? 'warning' : 'danger'
    },
    {
      title: 'Valuation Multiple',
      value: `${metrics.valuationMultiplier.toFixed(1)}x`,
      status: 'muted'
    }
  ];

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'success': return 'default';
      case 'warning': return 'secondary';
      case 'danger': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'success': return 'text-success';
      case 'warning': return 'text-warning';
      case 'danger': return 'text-danger';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Dashboard</h2>
          <p className="text-muted-foreground">
            {deal?.dealName || 'No deal selected'} - Investment Analysis Overview
          </p>
        </div>
        {deal && (
          <Badge variant="outline" className="px-3 py-1">
            {deal.propertyAddress || 'Address not set'}
          </Badge>
        )}
      </div>

      {!deal && (
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
                AI Laundromat Deal Analyzer
              </h1>
              <p className="text-xl text-muted-foreground mb-2">
                Transform complex data into clear, actionable insights
              </p>
              <p className="text-lg text-muted-foreground">
                This tool helps prospective buyers analyze, value, and assess the risk of purchasing an existing laundromat with precision and confidence.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-xl font-semibold mb-4 text-primary">What This Tool Does For You:</h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span><strong>Calculate Key Financials:</strong> Instantly see critical metrics like Net Operating Income (NOI), Cap Rate, Cash-on-Cash ROI, and total cash flow</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span><strong>Generate AI-Powered Valuation:</strong> Receive a suggested purchase price based on financials, equipment condition, and market analysis</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span><strong>Assess Investment Risk:</strong> Get a clear deal recommendation backed by detailed analysis of strengths and weaknesses</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span><strong>Professional Reporting:</strong> Generate comprehensive reports for financing and decision-making</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-4 text-primary">How to Get Started:</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">1</div>
                    <div>
                      <h4 className="font-semibold mb-1">Enter Deal Information</h4>
                      <p className="text-sm text-muted-foreground">Navigate to "Deal Inputs" and fill in property details, financials, and equipment information. The more data you provide, the more accurate your analysis.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">2</div>
                    <div>
                      <h4 className="font-semibold mb-1">Review Analysis</h4>
                      <p className="text-sm text-muted-foreground">Our AI processes your information, compares it to industry benchmarks, and provides comprehensive analysis and scenarios.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">3</div>
                    <div>
                      <h4 className="font-semibold mb-1">Generate Reports</h4>
                      <p className="text-sm text-muted-foreground">View detailed breakdowns, financial projections, and generate professional reports for financing or decision-making.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground">
                <strong>Disclaimer:</strong> This tool provides AI-driven analysis for informational purposes only. 
                All data and calculations should be independently verified. We are not financial advisors.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {deal && (
        <>
          {/* KPI Scorecard */}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-semibold mb-4">KPI Scorecard</h3>
              <Tooltip>
                <TooltipTrigger>
                  <span className="text-xs bg-muted px-2 py-1 rounded cursor-help">?</span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Key Performance Indicators showing investment metrics with target comparisons and status indicators</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {kpis.map((kpi, index) => (
                <Card key={index} className="shadow-card hover:shadow-elegant transition-smooth">
                  <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">{kpi.title}</span>
                    <Tooltip>
                      <TooltipTrigger>
                        <span className="text-xs bg-muted px-1 py-0.5 rounded cursor-help">?</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{getKPITooltip(kpi.title)}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className={`text-2xl font-bold ${getStatusColor(kpi.status)}`}>
                        {kpi.value}
                      </span>
                      <Badge variant={getStatusVariant(kpi.status)} className="ml-2">
                        {kpi.status === 'success' ? '✓' : 
                         kpi.status === 'warning' ? '⚠' : 
                         kpi.status === 'danger' ? '✗' : ''}
                      </Badge>
                    </div>
                    {'target' in kpi && kpi.target && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Target: {formatPercentage(kpi.target)}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Financial Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Income & Expenses</CardTitle>
              <Tooltip>
                <TooltipTrigger>
                  <span className="text-xs bg-muted px-2 py-1 rounded cursor-help">?</span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Breakdown of gross income, operating expenses, and net operating income</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Gross Income</span>
                  <span className="font-semibold text-success">{formatCurrency(metrics.totalGrossIncome)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Operating Expenses</span>
                  <span className="font-semibold text-danger">-{formatCurrency(metrics.totalOperatingExpenses)}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Net Operating Income</span>
                    <span className="font-bold text-lg">{formatCurrency(metrics.noi)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle>Financing Details</CardTitle>
                  <Tooltip>
                    <TooltipTrigger>
                      <span className="text-xs bg-muted px-2 py-1 rounded cursor-help">?</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Purchase price, financing structure, and debt service requirements</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Asking Price</span>
                  <span className="font-semibold">{formatCurrency(deal.askingPrice)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Down Payment ({formatPercentage(deal.downPaymentPercent)})</span>
                  <span className="font-semibold">{formatCurrency(deal.askingPrice * deal.downPaymentPercent / 100)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Loan Amount</span>
                  <span className="font-semibold">{formatCurrency(metrics.loanAmount)}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Annual Debt Service</span>
                    <span className="font-bold text-lg text-danger">-{formatCurrency(metrics.annualDebtService)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analysis Commentary */}
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>Investment Analysis Summary</CardTitle>
                <Tooltip>
                  <TooltipTrigger>
                    <span className="text-xs bg-muted px-2 py-1 rounded cursor-help">?</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>AI-generated analysis summary highlighting key investment characteristics and recommendations</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none text-sm">
                <p>
                  Based on the financial analysis, this laundromat investment shows a{' '}
                  <span className={getStatusColor(getKPIStatus(metrics.capRate, deal.targetCapRatePercent || 8, true))}>
                    {formatPercentage(metrics.capRate)} cap rate
                  </span>{' '}
                  and{' '}
                  <span className={getStatusColor(getKPIStatus(metrics.coCROI, deal.targetCoCROIPercent || 15, true))}>
                    {formatPercentage(metrics.coCROI)} cash-on-cash return
                  </span>.
                  The deal generates {formatCurrency(metrics.annualCashFlow)} in annual cash flow
                  with a DSCR of {metrics.dscr.toFixed(2)}.
                </p>
                <p className="mt-2">
                  The suggested valuation range of {formatCurrency(metrics.suggestedValuationLow)} to{' '}
                  {formatCurrency(metrics.suggestedValuationHigh)} is based on a {metrics.valuationMultiplier.toFixed(1)}x
                  multiple of NOI, adjusted for property and operational factors.
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
    </TooltipProvider>
  );
};
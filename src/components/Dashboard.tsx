import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDeal } from '@/contexts/DealContext';
import { calculateMetrics, formatCurrency, formatPercentage } from '@/utils/calculations';

export const Dashboard: React.FC = () => {
  const { deal, leaseDetails, expenseItems, machineInventory, ancillaryIncome, incomeVerification } = useDeal();
  
  const metrics = calculateMetrics(
    deal, leaseDetails, expenseItems, machineInventory, ancillaryIncome, incomeVerification
  );

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
      status: deal?.purchasePrice ? 
        (deal.purchasePrice >= metrics.suggestedValuationLow && deal.purchasePrice <= metrics.suggestedValuationHigh ? 'success' : 'warning') : 
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
        <Card className="border-dashed border-2 border-muted">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">No Deal Data</h3>
              <p className="text-muted-foreground mb-4">
                Get started by entering your deal information in the Deal Inputs section.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {deal && (
        <>
          {/* KPI Scorecard */}
          <div>
            <h3 className="text-xl font-semibold mb-4">KPI Scorecard</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {kpis.map((kpi, index) => (
                <Card key={index} className="shadow-card hover:shadow-elegant transition-smooth">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {kpi.title}
                    </CardTitle>
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
                <CardTitle>Income & Expenses</CardTitle>
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
                <CardTitle>Financing Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Purchase Price</span>
                  <span className="font-semibold">{formatCurrency(deal.purchasePrice)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Down Payment ({formatPercentage(deal.downPaymentPercent)})</span>
                  <span className="font-semibold">{formatCurrency(deal.purchasePrice * deal.downPaymentPercent / 100)}</span>
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
              <CardTitle>Investment Analysis Summary</CardTitle>
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
  );
};
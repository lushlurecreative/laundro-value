import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDeal } from '@/contexts/DealContext';
import { calculateTenYearProjection, calculateROI, calculateIRR } from '@/utils/projections';
import { formatCurrency, formatPercentage } from '@/utils/calculations';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Bar, BarChart, Legend } from 'recharts';

export const TenYearProjection: React.FC = () => {
  const { deal, leaseDetails, expenseItems, machineInventory, ancillaryIncome } = useDeal();
  
  if (!deal) {
    return (
      <Card className="border-dashed border-2 border-muted">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">No Deal Data</h3>
            <p className="text-muted-foreground mb-4">
              Enter deal information to view 10-year projections.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const projections = calculateTenYearProjection(
    deal, leaseDetails, expenseItems, machineInventory, ancillaryIncome
  );

  const initialInvestment = deal.purchasePrice * (deal.downPaymentPercent / 100);
  const totalROI = calculateROI(projections, initialInvestment);
  const irr = calculateIRR(projections, initialInvestment);

  const chartData = projections.map(p => ({
    year: `Year ${p.year}`,
    'Cash Flow': p.cashFlow,
    'NOI': p.noi,
    'CapEx': -p.capEx,
    'Cumulative Cash Flow': p.cumulativeCashFlow
  }));

  const summaryMetrics = {
    totalCashFlow: projections.reduce((sum, p) => sum + p.cashFlow, 0),
    totalCapEx: projections.reduce((sum, p) => sum + p.capEx, 0),
    avgAnnualCashFlow: projections.reduce((sum, p) => sum + p.cashFlow, 0) / 10,
    finalCumulativeCashFlow: projections[projections.length - 1]?.cumulativeCashFlow || 0
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold">10-Year Financial Projection</h3>
        <p className="text-muted-foreground">Long-term cash flow analysis with CapEx forecasting</p>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total 10-Year Cash Flow</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">{formatCurrency(summaryMetrics.totalCashFlow)}</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total ROI</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-success">{formatPercentage(totalROI)}</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">IRR</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">{formatPercentage(irr)}</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total CapEx</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-danger">{formatCurrency(summaryMetrics.totalCapEx)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Cash Flow Chart */}
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle>Cash Flow Projection</CardTitle>
          <p className="text-sm text-muted-foreground">
            Annual and cumulative cash flow over 10 years (includes CapEx impacts)
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="year" />
                <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), '']}
                  labelFormatter={(label) => label}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="Cash Flow" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="Cumulative Cash Flow" 
                  stroke="hsl(var(--success))" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: 'hsl(var(--success))', strokeWidth: 2, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* NOI vs Cash Flow Comparison */}
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle>NOI vs Cash Flow Analysis</CardTitle>
          <p className="text-sm text-muted-foreground">
            Comparison showing impact of debt service and capital expenditures
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="year" />
                <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), '']}
                  labelFormatter={(label) => label}
                />
                <Legend />
                <Bar dataKey="NOI" fill="hsl(var(--primary))" />
                <Bar dataKey="Cash Flow" fill="hsl(var(--success))" />
                <Bar dataKey="CapEx" fill="hsl(var(--danger))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Projection Table */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Detailed Annual Projections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Year</th>
                  <th className="text-right p-2">Gross Income</th>
                  <th className="text-right p-2">Operating Expenses</th>
                  <th className="text-right p-2">NOI</th>
                  <th className="text-right p-2">Debt Service</th>
                  <th className="text-right p-2">CapEx</th>
                  <th className="text-right p-2">Cash Flow</th>
                  <th className="text-right p-2">Cumulative</th>
                </tr>
              </thead>
              <tbody>
                {projections.map((projection) => (
                  <tr key={projection.year} className="border-b hover:bg-muted/50">
                    <td className="p-2 font-medium">Year {projection.year}</td>
                    <td className="p-2 text-right">{formatCurrency(projection.grossIncome)}</td>
                    <td className="p-2 text-right text-danger">-{formatCurrency(projection.operatingExpenses)}</td>
                    <td className="p-2 text-right font-medium">{formatCurrency(projection.noi)}</td>
                    <td className="p-2 text-right text-danger">-{formatCurrency(projection.debtService)}</td>
                    <td className="p-2 text-right">
                      {projection.capEx > 0 ? (
                        <Badge variant="destructive" className="text-xs">
                          -{formatCurrency(projection.capEx)}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className={`p-2 text-right font-bold ${projection.cashFlow >= 0 ? 'text-success' : 'text-danger'}`}>
                      {formatCurrency(projection.cashFlow)}
                    </td>
                    <td className={`p-2 text-right font-medium ${projection.cumulativeCashFlow >= 0 ? 'text-success' : 'text-danger'}`}>
                      {formatCurrency(projection.cumulativeCashFlow)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Key Insights */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Key Investment Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Cash Flow Analysis</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Average annual cash flow: {formatCurrency(summaryMetrics.avgAnnualCashFlow)}</li>
                <li>• Payback period: ~{(initialInvestment / summaryMetrics.avgAnnualCashFlow).toFixed(1)} years</li>
                <li>• Cash-on-cash return: {formatPercentage((summaryMetrics.avgAnnualCashFlow / initialInvestment) * 100)}</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Capital Requirements</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Initial investment: {formatCurrency(initialInvestment)}</li>
                <li>• Total CapEx over 10 years: {formatCurrency(summaryMetrics.totalCapEx)}</li>
                <li>• Total capital required: {formatCurrency(initialInvestment + summaryMetrics.totalCapEx)}</li>
              </ul>
            </div>
          </div>

          <div className="p-4 bg-gradient-subtle rounded-lg">
            <h4 className="font-semibold mb-2">Investment Recommendation</h4>
            <p className="text-sm">
              {irr >= 15 && totalROI >= 100 
                ? "🟢 Strong investment opportunity with excellent returns and manageable capital requirements."
                : irr >= 10 && totalROI >= 50
                ? "🟡 Moderate investment opportunity with acceptable returns. Consider negotiating purchase price."
                : "🔴 Investment shows below-target returns. Significant improvements needed to justify investment."
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
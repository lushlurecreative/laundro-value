import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useDeal } from '@/contexts/useDeal';
import { calculateBreakevenAnalysis, formatCurrency, formatPercentage } from '@/utils/calculations';
import { TrendingUp, Calendar, DollarSign, Target } from 'lucide-react';

export const BreakevenAnalysis: React.FC = () => {
  const { deal, expenseItems, ancillaryIncome } = useDeal();
  
  const breakevenData = calculateBreakevenAnalysis(deal, expenseItems, ancillaryIncome);
  
  if (!deal) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Breakeven Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Please enter deal information to perform breakeven analysis.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const currentMonthlyRevenue = deal.grossIncomeAnnual / 12;
  const occupancyStatus = breakevenData.breakevenOccupancy <= 100 ? 'profitable' : 'unprofitable';
  const occupancyColor = occupancyStatus === 'profitable' ? 'text-green-600' : 'text-red-600';

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Breakeven Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Monthly Breakeven Revenue */}
            <div className="space-y-3">
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-primary" />
                <h3 className="font-semibold">Monthly Breakeven</h3>
              </div>
              <div className="text-2xl font-bold">
                {formatCurrency(breakevenData.monthlyBreakevenRevenue)}
              </div>
              <div className="text-sm text-muted-foreground">
                Revenue needed to cover all expenses
              </div>
              {currentMonthlyRevenue > 0 && (
                <div className={`text-sm ${
                  currentMonthlyRevenue >= breakevenData.monthlyBreakevenRevenue 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  Current: {formatCurrency(currentMonthlyRevenue)}
                  <br />
                  {currentMonthlyRevenue >= breakevenData.monthlyBreakevenRevenue 
                    ? `+${formatCurrency(currentMonthlyRevenue - breakevenData.monthlyBreakevenRevenue)} above breakeven`
                    : `-${formatCurrency(breakevenData.monthlyBreakevenRevenue - currentMonthlyRevenue)} below breakeven`
                  }
                </div>
              )}
            </div>

            {/* Occupancy Rate */}
            <div className="space-y-3">
              <div className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                <h3 className="font-semibold">Breakeven Occupancy</h3>
              </div>
              <div className={`text-2xl font-bold ${occupancyColor}`}>
                {formatPercentage(breakevenData.breakevenOccupancy)}
              </div>
              <div className="space-y-2">
                <Progress 
                  value={Math.min(breakevenData.breakevenOccupancy, 100)} 
                  className="h-2"
                />
                <div className="text-sm text-muted-foreground">
                  {occupancyStatus === 'profitable' 
                    ? 'Business operates profitably at current revenue levels'
                    : 'Revenue must increase to achieve profitability'
                  }
                </div>
              </div>
            </div>

            {/* Months to Breakeven */}
            <div className="space-y-3">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-primary" />
                <h3 className="font-semibold">Investment Recovery</h3>
              </div>
              <div className="text-2xl font-bold">
                {breakevenData.monthsToBreakeven > 0 && breakevenData.monthsToBreakeven < 1000
                  ? `${breakevenData.monthsToBreakeven.toFixed(1)} months`
                  : 'Not profitable'
                }
              </div>
              <div className="text-sm text-muted-foreground">
                Time to recover initial investment
              </div>
              {breakevenData.monthsToBreakeven > 0 && breakevenData.monthsToBreakeven < 1000 && (
                <div className="text-sm">
                  ≈ {(breakevenData.monthsToBreakeven / 12).toFixed(1)} years
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis and Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Breakeven Analysis Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {occupancyStatus === 'profitable' ? (
              <Alert className="border-green-200 bg-green-50">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>Profitable Operation:</strong> The business generates sufficient revenue to cover all operating expenses and debt service. 
                  Current operations exceed breakeven requirements by {formatPercentage(100 - breakevenData.breakevenOccupancy)} occupancy.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">
                  <strong>Below Breakeven:</strong> Current revenue is insufficient to cover expenses. 
                  Revenue must increase by {formatPercentage(breakevenData.breakevenOccupancy - 100)} to achieve profitability.
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Strategies to Improve Breakeven</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Increase machine pricing strategically</li>
                  <li>• Add value-added services (WDF, vending)</li>
                  <li>• Optimize operating hours</li>
                  <li>• Reduce utility costs through efficiency</li>
                  <li>• Negotiate lower rent or expense reductions</li>
                </ul>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">Key Financial Metrics</h4>
                <div className="text-sm text-green-800 space-y-1">
                  <div>Monthly Operating Expenses: {formatCurrency((expenseItems.reduce((sum, exp) => sum + exp.amountAnnual, 0)) / 12)}</div>
                  <div>Monthly Debt Service: {formatCurrency(breakevenData.monthlyBreakevenRevenue - (expenseItems.reduce((sum, exp) => sum + exp.amountAnnual, 0)) / 12)}</div>
                  <div>Total Monthly Obligations: {formatCurrency(breakevenData.monthlyBreakevenRevenue)}</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
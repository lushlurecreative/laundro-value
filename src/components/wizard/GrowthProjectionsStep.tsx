import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDeal } from '@/contexts/useDeal';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Trash2 } from 'lucide-react';
import { HelpTooltip } from '@/components/ui/help-tooltip';

const GrowthProjectionsSchema = z.object({
  incomeGrowthRatePercent: z.number().min(0).max(100, "Income growth rate must be between 0-100%"),
  expenseGrowthRatePercent: z.number().min(0).max(100, "Expense growth rate must be between 0-100%"),
});

type GrowthProjectionsData = z.infer<typeof GrowthProjectionsSchema>;

export const GrowthProjectionsStep: React.FC = () => {
  const { deal, updateDeal } = useDeal();

  const form = useForm<GrowthProjectionsData>({
    resolver: zodResolver(GrowthProjectionsSchema),
    defaultValues: {
      incomeGrowthRatePercent: deal?.incomeGrowthRatePercent || 2.0,
      expenseGrowthRatePercent: deal?.expenseGrowthRatePercent || 3.0,
    },
  });

  useEffect(() => {
    if (deal) {
      form.setValue('incomeGrowthRatePercent', deal.incomeGrowthRatePercent || 2.0);
      form.setValue('expenseGrowthRatePercent', deal.expenseGrowthRatePercent || 3.0);
    }
  }, [deal, form]);

  const handleFieldChange = (field: string, value: any) => {
    updateDeal({ [field]: value });
  };

  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  // Calculate projected values
  const currentGrossIncome = deal?.grossIncomeAnnual || 0;
  const incomeGrowthRate = form.watch('incomeGrowthRatePercent') || 0;
  const expenseGrowthRate = form.watch('expenseGrowthRatePercent') || 0;

  const projectedIncomeYear2 = currentGrossIncome * (1 + incomeGrowthRate / 100);
  const projectedIncomeYear3 = projectedIncomeYear2 * (1 + incomeGrowthRate / 100);
  const projectedIncomeYear5 = currentGrossIncome * Math.pow(1 + incomeGrowthRate / 100, 4);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <Alert>
        <TrendingUp className="h-4 w-4" />
        <AlertDescription>
          Set realistic growth projections for your business. These rates will be used for long-term financial modeling and investment analysis.
        </AlertDescription>
      </Alert>

      <Form {...form}>
        {/* Growth Rate Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Growth Rate Projections
            </CardTitle>
            <CardDescription>
              Expected annual growth rates for financial projections
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="incomeGrowthRatePercent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      Income Growth Rate (%)
                      <HelpTooltip content="Expected annual increase in gross income. Consider market conditions, rent increases, and pricing adjustments." />
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        field.onChange(0);
                        handleFieldChange('incomeGrowthRatePercent', 0);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="2.0"
                      value={field.value === 0 ? '' : field.value}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : parseFloat(e.target.value) || 0;
                        field.onChange(value);
                        handleFieldChange('incomeGrowthRatePercent', value);
                      }}
                    />
                  </FormControl>
                  <p className="text-sm text-muted-foreground">
                    Industry standard: 1.5-3.0% annually
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="expenseGrowthRatePercent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      Expense Growth Rate (%)
                      <HelpTooltip content="Expected annual increase in operating expenses. Typically higher than income growth due to inflation and rising costs." />
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        field.onChange(0);
                        handleFieldChange('expenseGrowthRatePercent', 0);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="3.0"
                      value={field.value === 0 ? '' : field.value}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : parseFloat(e.target.value) || 0;
                        field.onChange(value);
                        handleFieldChange('expenseGrowthRatePercent', value);
                      }}
                    />
                  </FormControl>
                  <p className="text-sm text-muted-foreground">
                    Industry standard: 2.0-4.0% annually
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Projected Income Summary */}
        {currentGrossIncome > 0 && incomeGrowthRate > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Income Growth Projections</CardTitle>
              <CardDescription>
                Projected gross income based on your growth rate assumptions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Current (Year 1)</p>
                  <p className="text-lg font-semibold">{formatCurrency(currentGrossIncome)}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Year 2</p>
                  <p className="text-lg font-semibold">{formatCurrency(projectedIncomeYear2)}</p>
                  <p className="text-xs text-green-600">+{formatPercentage(incomeGrowthRate)}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Year 3</p>
                  <p className="text-lg font-semibold">{formatCurrency(projectedIncomeYear3)}</p>
                  <p className="text-xs text-green-600">+{formatPercentage(incomeGrowthRate)}</p>
                </div>
                <div className="text-center p-4 bg-primary/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">Year 5</p>
                  <p className="text-lg font-bold text-primary">{formatCurrency(projectedIncomeYear5)}</p>
                  <p className="text-xs text-green-600">+{formatPercentage((projectedIncomeYear5 - currentGrossIncome) / currentGrossIncome * 100)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Growth Strategy Considerations */}
        <Card>
          <CardHeader>
            <CardTitle>Growth Strategy Considerations</CardTitle>
            <CardDescription>
              Factors that can influence your growth projections
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-green-600">Income Growth Drivers</h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Price increases (typically 2-5% annually)</li>
                  <li>• Equipment upgrades (larger capacity machines)</li>
                  <li>• New service offerings (wash & fold, pickup/delivery)</li>
                  <li>• Extended operating hours</li>
                  <li>• Improved marketing and customer retention</li>
                  <li>• Neighborhood demographic improvements</li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-red-600">Expense Growth Factors</h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Utility cost inflation (electricity, gas, water)</li>
                  <li>• Rent increases per lease terms</li>
                  <li>• Labor cost increases (minimum wage, benefits)</li>
                  <li>• Equipment maintenance and repairs</li>
                  <li>• Insurance premium increases</li>
                  <li>• General inflation on supplies and services</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </Form>
    </div>
  );
};
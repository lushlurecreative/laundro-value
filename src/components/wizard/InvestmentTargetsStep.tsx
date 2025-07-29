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
import { InfoIcon, Target, TrendingUp, Trash2 } from 'lucide-react';

const InvestmentTargetsSchema = z.object({
  targetCapRatePercent: z.number().min(0).max(50, "Cap rate must be between 0-50%"),
  targetCoCROIPercent: z.number().min(0).max(100, "Cash-on-Cash ROI must be between 0-100%"),
});

type InvestmentTargetsData = z.infer<typeof InvestmentTargetsSchema>;

export const InvestmentTargetsStep: React.FC = () => {
  const { deal, updateDeal } = useDeal();

  const form = useForm<InvestmentTargetsData>({
    resolver: zodResolver(InvestmentTargetsSchema),
    defaultValues: {
      targetCapRatePercent: deal?.targetCapRatePercent || 8,
      targetCoCROIPercent: deal?.targetCoCROIPercent || 15,
    },
  });

  useEffect(() => {
    if (deal) {
      form.setValue('targetCapRatePercent', deal.targetCapRatePercent || 8);
      form.setValue('targetCoCROIPercent', deal.targetCoCROIPercent || 15);
    }
  }, [deal, form]);

  const handleFieldChange = (field: keyof InvestmentTargetsData, value: any) => {
    updateDeal({ [field]: value });
  };

  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  // Get market context for targets
  const getCapRateContext = (capRate: number) => {
    if (capRate < 6) return { level: 'Low', description: 'Conservative - Premium markets, newer equipment', color: 'text-blue-600' };
    if (capRate < 8) return { level: 'Moderate', description: 'Average - Typical market rates', color: 'text-green-600' };
    if (capRate < 10) return { level: 'Good', description: 'Above average - Good value opportunity', color: 'text-yellow-600' };
    return { level: 'High', description: 'Aggressive - Higher risk/higher reward', color: 'text-red-600' };
  };

  const getCoCROIContext = (cocRoi: number) => {
    if (cocRoi < 15) return { level: 'Moderate', description: 'Balanced risk/return', color: 'text-green-600' };
    if (cocRoi < 20) return { level: 'Good', description: 'Strong returns', color: 'text-yellow-600' };
    return { level: 'Aggressive', description: 'High returns target', color: 'text-red-600' };
  };

  const capRateContext = getCapRateContext(form.watch('targetCapRatePercent') || 0);
  const cocRoiContext = getCoCROIContext(form.watch('targetCoCROIPercent') || 0);

  return (
    <div className="space-y-6">
      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertDescription>
          Set your investment goals and desired returns for this deal. These targets will be used to evaluate 
          if the deal meets your investment criteria. Industry benchmarks marked with * are provided for reference.
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Investment Goals */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Investment Targets/Goals
              </CardTitle>
              <CardDescription>
                Define your desired investment returns and performance metrics for this deal
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Target Cap Rate */}
              <FormField
                control={form.control}
                name="targetCapRatePercent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center justify-between">
                      Target Capitalization Rate (%)
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          field.onChange(null);
                          handleFieldChange('targetCapRatePercent', null);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="50"
                        placeholder="8.0"
                        value={field.value === null || field.value === 0 ? '' : field.value}
                        onChange={(e) => {
                          const value = e.target.value === '' ? null : parseFloat(e.target.value) || null;
                          field.onChange(value);
                          handleFieldChange('targetCapRatePercent', value);
                        }}
                      />
                    </FormControl>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Industry range: 6-12% for laundromats *
                      </p>
                      <p className={`text-sm font-medium ${capRateContext.color}`}>
                        {capRateContext.level}: {capRateContext.description}
                      </p>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Target Cash-on-Cash ROI */}
              <FormField
                control={form.control}
                name="targetCoCROIPercent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center justify-between">
                      Target Cash-on-Cash ROI (%)
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          field.onChange(null);
                          handleFieldChange('targetCoCROIPercent', null);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        placeholder="15.0"
                        value={field.value === null || field.value === 0 ? '' : field.value}
                        onChange={(e) => {
                          const value = e.target.value === '' ? null : parseFloat(e.target.value) || null;
                          field.onChange(value);
                          handleFieldChange('targetCoCROIPercent', value);
                        }}
                      />
                    </FormControl>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Industry range: 12-25% for laundromats *
                      </p>
                      <p className={`text-sm font-medium ${cocRoiContext.color}`}>
                        {cocRoiContext.level}: {cocRoiContext.description}
                      </p>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Metrics Explanation */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Understanding Investment Metrics
              </CardTitle>
              <CardDescription>
                Key performance indicators for laundromat investments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold">Capitalization Rate (Cap Rate)</h4>
                  <p className="text-sm text-muted-foreground">
                    Measures the property's ability to generate income relative to its purchase price. 
                    Calculated as Net Operating Income ÷ Purchase Price.
                  </p>
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-sm">
                      <strong>Your Target:</strong> {formatPercentage(form.watch('targetCapRatePercent') || 0)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      This means you want the property to generate {formatPercentage(form.watch('targetCapRatePercent') || 0)} 
                      of its purchase price in net operating income annually.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Cash-on-Cash ROI</h4>
                  <p className="text-sm text-muted-foreground">
                    Measures the annual return on your actual cash invested (down payment + closing costs). 
                    Calculated as Annual Cash Flow ÷ Total Cash Invested.
                  </p>
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-sm">
                      <strong>Your Target:</strong> {formatPercentage(form.watch('targetCoCROIPercent') || 0)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      This means you want to earn {formatPercentage(form.watch('targetCoCROIPercent') || 0)} 
                      annually on the cash you put into the deal.
                    </p>
                  </div>
                </div>
              </div>

              <Alert>
                <InfoIcon className="h-4 w-4" />
                <AlertDescription>
                  <strong>Pro Tip:</strong> Consider setting different targets based on market conditions, 
                  property condition, and your risk tolerance. Conservative investors might target lower returns 
                  with stable properties, while aggressive investors seek higher returns with value-add opportunities.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Target Summary */}
          <Card className="md:col-span-2 bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle>Your Investment Targets Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Target Cap Rate</p>
                  <p className="text-3xl font-bold text-primary">
                    {formatPercentage(form.watch('targetCapRatePercent') || 0)}
                  </p>
                  <p className={`text-sm font-medium ${capRateContext.color}`}>
                    {capRateContext.level} Target
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Target Cash-on-Cash ROI</p>
                  <p className="text-3xl font-bold text-primary">
                    {formatPercentage(form.watch('targetCoCROIPercent') || 0)}
                  </p>
                  <p className={`text-sm font-medium ${cocRoiContext.color}`}>
                    {cocRoiContext.level} Target
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Form>
    </div>
  );
};
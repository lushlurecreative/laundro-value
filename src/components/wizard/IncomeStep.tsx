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
import { CurrencyInput } from "@/components/ui/currency-input";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoIcon, TrendingUp } from 'lucide-react';

const IncomeSchema = z.object({
  grossIncomeAnnual: z.number().min(0, "Gross income must be positive"),
  annualNet: z.number().min(0, "Annual net must be positive"),
  incomeGrowthRatePercent: z.number().min(0).max(100, "Growth rate must be between 0-100%"),
  vendingIncomeAnnual: z.number().min(0, "Vending income must be positive"),
  otherIncomeAnnual: z.number().min(0, "Other income must be positive"),
});

type IncomeData = z.infer<typeof IncomeSchema>;

export const IncomeStep: React.FC = () => {
  const { deal, updateDeal, ancillaryIncome, updateAncillaryIncome } = useDeal();

  const form = useForm<IncomeData>({
    resolver: zodResolver(IncomeSchema),
    defaultValues: {
      grossIncomeAnnual: deal?.grossIncomeAnnual || 0,
      annualNet: deal?.annualNet || 0,
      incomeGrowthRatePercent: deal?.incomeGrowthRatePercent || 2.0,
      vendingIncomeAnnual: ancillaryIncome?.vendingIncomeAnnual || 0,
      otherIncomeAnnual: ancillaryIncome?.otherIncomeAnnual || 0,
    },
  });

  // Update form when deal data changes
  useEffect(() => {
    if (deal) {
      form.setValue('grossIncomeAnnual', deal.grossIncomeAnnual || 0);
      form.setValue('annualNet', deal.annualNet || 0);
      form.setValue('incomeGrowthRatePercent', deal.incomeGrowthRatePercent || 2.0);
    }
    if (ancillaryIncome) {
      form.setValue('vendingIncomeAnnual', ancillaryIncome.vendingIncomeAnnual || 0);
      form.setValue('otherIncomeAnnual', ancillaryIncome.otherIncomeAnnual || 0);
    }
  }, [deal, ancillaryIncome, form]);

  const handleFieldChange = (field: string, value: any) => {
    if (field === 'vendingIncomeAnnual' || field === 'otherIncomeAnnual') {
      updateAncillaryIncome({ [field]: value });
    } else {
      updateDeal({ [field]: value });
    }
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const totalIncome = (form.watch('grossIncomeAnnual') || 0) + 
                     (form.watch('vendingIncomeAnnual') || 0) + 
                     (form.watch('otherIncomeAnnual') || 0);

  return (
    <div className="space-y-6">
      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertDescription>
          Enter all sources of income for the laundromat. Fields marked with * are pre-filled with 
          industry standards and should be verified for accuracy.
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Primary Income */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Primary Income Sources
              </CardTitle>
              <CardDescription>
                Main revenue streams from laundromat operations
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Gross Income */}
              <FormField
                control={form.control}
                name="grossIncomeAnnual"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gross Income (Annual)</FormLabel>
                    <FormControl>
                      <CurrencyInput
                        placeholder="$200,000.00"
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleFieldChange('grossIncomeAnnual', value);
                        }}
                      />
                    </FormControl>
                    <p className="text-sm text-muted-foreground">
                      Industry standard: $100,000-$300,000 annually
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Annual Net */}
              <FormField
                control={form.control}
                name="annualNet"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Annual Net Income (NOI)</FormLabel>
                    <FormControl>
                      <CurrencyInput
                        placeholder="$50,000.00"
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleFieldChange('annualNet', value);
                        }}
                      />
                    </FormControl>
                    <p className="text-sm text-muted-foreground">
                      Typically 25-35% of gross income
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Ancillary Income */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Additional Income Sources</CardTitle>
              <CardDescription>
                Secondary revenue streams and ancillary services
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Vending Income */}
              <FormField
                control={form.control}
                name="vendingIncomeAnnual"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vending Income (Annual)</FormLabel>
                    <FormControl>
                      <CurrencyInput
                        placeholder="$3,000.00"
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleFieldChange('vendingIncomeAnnual', value);
                        }}
                      />
                    </FormControl>
                    <p className="text-sm text-muted-foreground">
                      Soap, snacks, drinks: $2,000-$8,000 annually
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Other Income */}
              <FormField
                control={form.control}
                name="otherIncomeAnnual"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Other Income (Annual)</FormLabel>
                    <FormControl>
                      <CurrencyInput
                        placeholder="$1,000.00"
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleFieldChange('otherIncomeAnnual', value);
                        }}
                      />
                    </FormControl>
                    <p className="text-sm text-muted-foreground">
                      ATM, coin exchange, dry cleaning, etc.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Growth Projections */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Income Growth Projections</CardTitle>
              <CardDescription>
                Expected annual growth rates for financial projections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="incomeGrowthRatePercent"
                render={({ field }) => (
                  <FormItem className="max-w-md">
                    <FormLabel>Income Growth Rate (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="2.0"
                        {...field}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0;
                          field.onChange(value);
                          handleFieldChange('incomeGrowthRatePercent', value);
                        }}
                      />
                    </FormControl>
                    <p className="text-sm text-muted-foreground">
                      Industry standard: 1.5-3.0% annually *
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Income Summary */}
          <Card className="md:col-span-2 bg-muted/50">
            <CardHeader>
              <CardTitle>Total Annual Income Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-sm text-muted-foreground">Primary Income</p>
                  <p className="text-lg font-semibold">{formatCurrency(form.watch('grossIncomeAnnual') || 0)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Vending Income</p>
                  <p className="text-lg font-semibold">{formatCurrency(form.watch('vendingIncomeAnnual') || 0)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Other Income</p>
                  <p className="text-lg font-semibold">{formatCurrency(form.watch('otherIncomeAnnual') || 0)}</p>
                </div>
                <div className="bg-primary/10 rounded-lg p-3">
                  <p className="text-sm text-muted-foreground">Total Income</p>
                  <p className="text-xl font-bold text-primary">{formatCurrency(totalIncome)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Form>
    </div>
  );
};

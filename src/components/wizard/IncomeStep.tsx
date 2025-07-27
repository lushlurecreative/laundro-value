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
  vendingIncomeAnnual: z.number().min(0, "Vending income must be positive"),
  otherIncomeAnnual: z.number().min(0, "Other income must be positive"),
  projectedAdditionalMonthlyRevenue: z.number().min(0, "Projected revenue must be positive").optional(),
});

type IncomeData = z.infer<typeof IncomeSchema>;

export const IncomeStep: React.FC = () => {
  const { deal, updateDeal, ancillaryIncome, updateAncillaryIncome } = useDeal();

  const form = useForm<IncomeData>({
    resolver: zodResolver(IncomeSchema),
    defaultValues: {
      grossIncomeAnnual: deal?.grossIncomeAnnual || 0,
      annualNet: deal?.annualNet || 0,
      vendingIncomeAnnual: ancillaryIncome?.vendingIncomeAnnual || 0,
      otherIncomeAnnual: ancillaryIncome?.otherIncomeAnnual || 0,
      projectedAdditionalMonthlyRevenue: deal?.projectedAdditionalMonthlyRevenue || 0,
    },
  });

  // Update form when deal data changes
  useEffect(() => {
    if (deal) {
      form.setValue('grossIncomeAnnual', deal.grossIncomeAnnual || 0);
      form.setValue('annualNet', deal.annualNet || 0);
      form.setValue('projectedAdditionalMonthlyRevenue', deal.projectedAdditionalMonthlyRevenue || 0);
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
          Enter all sources of income for the laundromat. If you don't have specific information, leave fields blank. Industry standards are provided for reference.
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
                        onChange={(value) => {
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
                        onChange={(value) => {
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
                 Secondary revenue streams and ancillary services. Consider machine expansion opportunities.
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
                        onChange={(value) => {
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
                         onChange={(value) => {
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

           {/* Income Improvement Potential */}
           <Card className="md:col-span-2">
             <CardHeader>
               <CardTitle>Income Improvement Strategy</CardTitle>
               <CardDescription>
                 Project additional monthly revenue opportunities
               </CardDescription>
             </CardHeader>
             <CardContent className="space-y-4">
               <FormField
                 control={form.control}
                 name="projectedAdditionalMonthlyRevenue"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel>Projected Additional Monthly Revenue</FormLabel>
                     <FormControl>
                       <CurrencyInput
                         placeholder="$2,500.00"
                         value={field.value || 0}
                         onChange={(value) => {
                           field.onChange(value);
                           handleFieldChange('projectedAdditionalMonthlyRevenue', value);
                         }}
                       />
                     </FormControl>
                     <p className="text-sm text-muted-foreground">
                       Potential monthly revenue increase from expansions, improvements, or operational changes
                     </p>
                     <FormMessage />
                   </FormItem>
                 )}
               />
               <Alert>
                 <InfoIcon className="h-4 w-4" />
                 <AlertDescription>
                   <strong>Ideas:</strong> Equipment additions, service improvements, pricing optimization, new revenue streams
                 </AlertDescription>
               </Alert>
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

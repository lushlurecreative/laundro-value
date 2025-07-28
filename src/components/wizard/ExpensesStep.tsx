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
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoIcon, TrendingDown, Plus, Trash2 } from 'lucide-react';

const ExpensesSchema = z.object({
  incomeGrowthRatePercent: z.number().min(0).max(100, "Income growth rate must be between 0-100%"),
  expenseGrowthRatePercent: z.number().min(0).max(100, "Expense growth rate must be between 0-100%"),
  otherExpenseAmount: z.number().min(0, "Other expense must be positive"),
});

type ExpensesData = z.infer<typeof ExpensesSchema>;

export const ExpensesStep: React.FC = () => {
  const { deal, updateDeal, expenseItems, updateExpenseItem, addExpenseItem, removeExpenseItem } = useDeal();

  const form = useForm<ExpensesData>({
    resolver: zodResolver(ExpensesSchema),
    defaultValues: {
      incomeGrowthRatePercent: deal?.incomeGrowthRatePercent || 2.0,
      expenseGrowthRatePercent: deal?.expenseGrowthRatePercent || 3.0,
      otherExpenseAmount: 0,
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

  const handleAddOtherExpense = () => {
    const otherAmount = form.watch('otherExpenseAmount');
    if (otherAmount > 0) {
      addExpenseItem({
        expenseId: `expense-other-${Date.now()}`,
        dealId: deal?.dealId || 'deal-1',
        expenseName: 'Other',
        amountAnnual: otherAmount,
        expenseType: 'Fixed' as const,
      });
      form.setValue('otherExpenseAmount', 0);
    }
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const totalExpenses = expenseItems.reduce((sum, expense) => sum + expense.amountAnnual, 0);

  // Standard expense categories with industry averages
  const standardExpenses = [
    { name: 'Rent', industry: '$40,000-80,000', description: 'Monthly lease payments' },
    { name: 'Utilities - Gas', industry: '$8,000-15,000', description: 'Heating and hot water' },
    { name: 'Utilities - Electric', industry: '$10,000-20,000', description: 'Lighting and equipment power' },
    { name: 'Water & Sewer', industry: '$15,000-30,000', description: 'Water usage and sewer fees' },
    { name: 'Maintenance & Repairs', industry: '$5,000-12,000', description: 'Equipment repairs and facility maintenance' },
    { name: 'Insurance', industry: '$2,500-5,000', description: 'General liability and property insurance' },
    { name: 'Trash', industry: '$1,200-2,500', description: 'Waste disposal services' },
    { name: 'Licenses & Permits', industry: '$500-2,000', description: 'Business licenses and permits' },
    { name: 'Supplies', industry: '$2,000-5,000', description: 'Cleaning supplies, soap, etc.' },
    { name: 'Internet', industry: '$500-1,200', description: 'Internet and phone services' },
    { name: 'Payroll', industry: '$30,000-70,000', description: 'Employee wages and benefits' },
  ];

  // Ensure all standard expenses exist
  const ensureStandardExpenses = () => {
    standardExpenses.forEach(stdExpense => {
      const exists = expenseItems.find(item => item.expenseName === stdExpense.name);
      if (!exists) {
        addExpenseItem({
          expenseId: `expense-${stdExpense.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`,
          dealId: deal?.dealId || 'deal-1',
          expenseName: stdExpense.name,
          amountAnnual: 0,
          expenseType: 'Fixed' as const,
        });
      }
    });
  };

  // Initialize standard expenses on component mount
  useEffect(() => {
    if (expenseItems.length === 0) {
      ensureStandardExpenses();
    }
  }, []);

  return (
    <div className="space-y-6">
      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertDescription>
          Enter all operating expenses for the laundromat. If you don't have specific information, leave fields blank. Industry standard ANNUAL ranges are provided for reference.
        </AlertDescription>
      </Alert>

      <Form {...form}>
        {/* Operating Expenses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5" />
              Operating Expenses
            </CardTitle>
            <CardDescription>
              Regular monthly and annual operating costs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {standardExpenses.map(stdExpense => {
              const expense = expenseItems.find(item => item.expenseName === stdExpense.name);
              return (
                <div key={stdExpense.name} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end p-4 border rounded-lg">
                  <div>
                    <FormLabel>{stdExpense.name}</FormLabel>
                    <p className="text-sm text-muted-foreground">{stdExpense.description}</p>
                  </div>
                  <div>
                    <CurrencyInput
                      placeholder="$0.00"
                      value={expense?.amountAnnual || 0}
                      onChange={(value) => {
                        if (expense) {
                          updateExpenseItem(expense.expenseId, { amountAnnual: value });
                        }
                      }}
                    />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      ANNUAL industry range: {stdExpense.industry}
                    </p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Additional Expenses */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Expenses</CardTitle>
            <CardDescription>
              Add any other expenses not covered above
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Other expenses that aren't in standard list */}
            {expenseItems
              .filter(expense => !standardExpenses.some(std => std.name === expense.expenseName))
              .map(expense => (
                <div key={expense.expenseId} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center p-4 border rounded-lg">
                  <div>
                    <FormLabel>{expense.expenseName}</FormLabel>
                  </div>
                  <div>
                    <CurrencyInput
                      value={expense.amountAnnual}
                      onChange={(value) => {
                        updateExpenseItem(expense.expenseId, { amountAnnual: value });
                      }}
                    />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Custom expense</p>
                  </div>
                  <div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeExpenseItem(expense.expenseId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

            {/* Add new other expense */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end p-4 border-2 border-dashed rounded-lg">
              <div>
                <FormLabel>Add Other Expense</FormLabel>
              </div>
              <div>
                <FormField
                  control={form.control}
                  name="otherExpenseAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <CurrencyInput
                          placeholder="$0.00"
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Enter amount</p>
              </div>
              <div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddOtherExpense}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Growth Projections */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Growth Projections
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  form.setValue('incomeGrowthRatePercent', 0);
                  form.setValue('expenseGrowthRatePercent', 0);
                  handleFieldChange('incomeGrowthRatePercent', 0);
                  handleFieldChange('expenseGrowthRatePercent', 0);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardTitle>
            <CardDescription>
              Expected annual growth rates for financial projections (deletable fields)
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="incomeGrowthRatePercent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center justify-between">
                    Income Growth Rate (%)
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
                     ANNUAL industry standard: 1.5-3.0%
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
                    Expense Growth Rate (%)
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
                     ANNUAL industry standard: 2.5-4.0%
                   </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Expense Summary */}
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle>Total Annual Expenses Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total Operating Expenses</p>
              <p className="text-2xl font-bold text-destructive">{formatCurrency(totalExpenses)}</p>
              <p className="text-sm text-muted-foreground mt-2">
                {expenseItems.length} expense categories
              </p>
            </div>
          </CardContent>
        </Card>
      </Form>
    </div>
  );
};

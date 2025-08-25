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
import { HelpTooltip } from '@/components/ui/help-tooltip';

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

  // Standard expense categories with industry averages (as percentage of gross income)
  const standardExpenses = [
    { name: 'Rent', industryPercent: '25-35%', description: 'Monthly lease payments' },
    { name: 'Utilities - Electric', industryPercent: '4-8%', description: 'Lighting and equipment power' },
    { name: 'Utilities - Gas', industryPercent: '3-6%', description: 'Heating and hot water' },
    { name: 'Water & Sewer', industryPercent: '6-12%', description: 'Water usage and sewer fees' },
    { name: 'Insurance', industryPercent: '1-3%', description: 'General liability and property insurance' },
    { name: 'Repairs & Maintenance', industryPercent: '2-5%', description: 'Equipment repairs and facility maintenance' },
    { name: 'Waste Removal', industryPercent: '0.5-2%', description: 'Waste disposal services' },
    { name: 'Internet', industryPercent: '0.2-1%', description: 'Internet and phone services' },
    { name: 'Payroll', industryPercent: '12-25%', description: 'Employee wages and benefits' },
    { name: 'Accounting', industryPercent: '0.5-2%', description: 'Bookkeeping and tax preparation' },
    { name: 'Bank Charges', industryPercent: '0.2-1%', description: 'Banking and transaction fees' },
    { name: 'Office Supplies', industryPercent: '0.5-1.5%', description: 'Supplies and materials' },
    { name: 'Security', industryPercent: '0.5-2%', description: 'Alarm and monitoring services' },
    { name: 'Property Tax', industryPercent: '2-5%', description: 'Real estate taxes' },
    { name: 'CAM Charges', industryPercent: '2-6%', description: 'Common area maintenance (if applicable)' },
  ];

  // Helper function to get industry standard percentage for an expense
  const getIndustryStandardPercent = (expenseName: string): string | null => {
    const expense = standardExpenses.find(e => e.name === expenseName);
    if (expense) return expense.industryPercent.replace('%', '');
    
    // Only return documented industry standards for known categories
    const documentedMappings: { [key: string]: string } = {
      'Electric': '4-8',
      'Electricity': '4-8',
      'Gas': '3-6',
      'Water': '6-12',
      'Sewer': '6-12',
      'Trash': '0.5-2',
      'Garbage': '0.5-2',
      'Phone': '0.2-1',
      'Telecommunications': '0.2-1',
    };
    
    for (const [key, value] of Object.entries(documentedMappings)) {
      if (expenseName.toLowerCase().includes(key.toLowerCase())) {
        return value;
      }
    }
    
    return null; // No industry standard available
  };

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

  // No longer auto-populate standard expenses - let AI create them dynamically

  return (
    <div className="space-y-6">
      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertDescription>
          <strong>Important:</strong> The goal is to run the deal accurately for <strong>YOUR</strong> operation. While seller-reported expenses are important reference points, analyze how <strong>YOU</strong> would run this business. Consider whether expenses like meals, travel, excessive cleaning costs, or personal vehicle insurance are reasonable for your operation. Run the numbers based on Industry Standards and your business plan.
        </AlertDescription>
      </Alert>

      <Form {...form}>
        {/* Reported Expenses */}
        {expenseItems.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5" />
                Reported Expenses
              </CardTitle>
              <CardDescription>
                Expenses extracted from your data analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {expenseItems.map(expense => {
                const percentOfGrossIncome = deal?.grossIncomeAnnual ? (expense.amountAnnual / deal.grossIncomeAnnual * 100) : 0;
                const industryStandardPercent = getIndustryStandardPercent(expense.expenseName);
                
                return (
                  <div key={expense.expenseId} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center p-4 border rounded-lg">
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
                      {industryStandardPercent ? (
                        <>
                          <p className="text-sm text-muted-foreground">
                            Industry: {industryStandardPercent}% of gross income
                          </p>
                           {(() => {
                            // Parse the industry range to get min/max values
                            const rangeMatch = industryStandardPercent.match(/(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?)/);
                            let industryMin = 0, industryMax = 100;
                            if (rangeMatch) {
                              industryMin = parseFloat(rangeMatch[1]);
                              industryMax = parseFloat(rangeMatch[2]);
                            }
                            
                            // Fixed logic: expenses ABOVE range are bad (red), WITHIN or BELOW range are good (green)
                            const isAboveRange = percentOfGrossIncome > industryMax;
                            
                            return (
                              <p className={`text-sm font-medium ${
                                isAboveRange ? 'text-red-600' : 'text-green-600'
                              }`}>
                                Current: {percentOfGrossIncome.toFixed(1)}% of gross income
                              </p>
                            );
                          })()}
                        </>
                       ) : (
                         <p className="text-sm text-muted-foreground">
                           Current: {percentOfGrossIncome < 0.1 ? percentOfGrossIncome.toFixed(2) : percentOfGrossIncome.toFixed(1)}% of gross income
                         </p>
                       )}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Annual amount</p>
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
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Additional Recommended Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5" />
              Recommended Additional Categories
            </CardTitle>
            <CardDescription>
              Missing standard expense categories that should be considered for accurate analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {standardExpenses.map(stdExpense => {
              // Only show if not already populated by AI
              const alreadyExists = expenseItems.find(item => item.expenseName === stdExpense.name);
              if (alreadyExists) return null;
              
              return (
                <div key={stdExpense.name} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end p-4 border-2 border-dashed rounded-lg">
                  <div>
                    <FormLabel>{stdExpense.name}</FormLabel>
                    <p className="text-sm text-muted-foreground">{stdExpense.description}</p>
                  </div>
                  <div>
                    <CurrencyInput
                      placeholder="$0.00"
                      value={0}
                      onChange={(value) => {
                        if (value > 0) {
                          addExpenseItem({
                            expenseId: `expense-${stdExpense.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`,
                            dealId: deal?.dealId || 'deal-1',
                            expenseName: stdExpense.name,
                            amountAnnual: value,
                            expenseType: 'Fixed' as const,
                          });
                        }
                      }}
                    />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Industry: {stdExpense.industryPercent} of gross income
                    </p>
                  </div>
                  <div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        addExpenseItem({
                          expenseId: `expense-${stdExpense.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`,
                          dealId: deal?.dealId || 'deal-1',
                          expenseName: stdExpense.name,
                          amountAnnual: 0,
                          expenseType: 'Fixed' as const,
                        });
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Custom Expenses */}
        <Card>
          <CardHeader>
            <CardTitle>Custom Expenses</CardTitle>
            <CardDescription>
              Add any other expenses not covered above
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add new other expense */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end p-4 border-2 border-dashed rounded-lg">
              <div>
                <FormLabel>Add Custom Expense</FormLabel>
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

        {/* Note: Growth Projections moved to dedicated tab */}

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

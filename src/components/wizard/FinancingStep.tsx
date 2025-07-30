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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoIcon, Calculator, DollarSign } from 'lucide-react';
import { HelpTooltip } from '@/components/ui/help-tooltip';

const FinancingSchema = z.object({
  downPaymentPercent: z.number().min(0).max(100, "Down payment must be between 0-100%"),
  loanInterestRatePercent: z.number().min(0).max(50, "Interest rate must be between 0-50%"),
  loanTermYears: z.number().min(1).max(30, "Loan term must be between 1-30 years"),
  loanType: z.string().min(1, "Loan type is required"),
});

type FinancingData = z.infer<typeof FinancingSchema>;

const loanTypes = [
  { value: 'Business Line of Credit', label: 'Business Line of Credit', rates: '8.0% - 15.0%', terms: 'Revolving credit', description: 'Flexible credit line for business needs', downPayment: 0, interestRate: 12.0, term: 0 },
  { value: 'Cash', label: 'Cash', rates: 'N/A', terms: 'Immediate ownership', description: 'Full cash payment', downPayment: 100, interestRate: 0, term: 0 },
  { value: 'Commercial Real Estate Loan', label: 'Commercial Real Estate Loan', rates: '6.0% - 9.0%', terms: '10-25 years', description: 'For real estate purchase', downPayment: 25, interestRate: 7.5, term: 20 },
  { value: 'Conventional', label: 'Conventional', rates: '7.0% - 12.0%', terms: '5-15 years typical', description: 'Traditional business loan from banks', downPayment: 25, interestRate: 9.0, term: 10 },
  { value: 'Custom', label: 'Custom', rates: 'Varies', terms: 'Varies', description: 'Custom financing option', downPayment: 20, interestRate: 8.0, term: 10 },
  { value: 'Equipment Financing', label: 'Equipment Financing', rates: '5.0% - 12.0%', terms: '3-7 years', description: 'Financing for equipment purchase', downPayment: 10, interestRate: 8.0, term: 5 },
  { value: 'Invoice Financing', label: 'Invoice Financing', rates: '10.0% - 30.0%', terms: '30-90 days', description: 'Short-term financing against invoices', downPayment: 0, interestRate: 20.0, term: 1 },
  { value: 'Merchant Cash Advance', label: 'Merchant Cash Advance', rates: '20.0% - 50.0%', terms: '3-24 months', description: 'Advance against future sales', downPayment: 0, interestRate: 35.0, term: 1 },
  { value: 'SBA 504 Loan', label: 'SBA 504 Loan', rates: '5.5% - 8.5%', terms: '10-20 years', description: 'SBA loan for real estate and equipment', downPayment: 10, interestRate: 7.0, term: 20 },
  { value: 'SBA 7(a) Loan', label: 'SBA 7(a) Loan', rates: '6.5% - 10.5%', terms: 'Up to 10 years for business acquisition', description: 'Most common SBA loan for business purchases', downPayment: 10, interestRate: 8.5, term: 10 },
  { value: 'SBA Microloan', label: 'SBA Microloan', rates: '8.0% - 13.0%', terms: 'Up to 6 years', description: 'Small SBA loan up to $50,000', downPayment: 10, interestRate: 10.5, term: 6 },
  { value: 'Short-Term Loan', label: 'Short-Term Loan', rates: '15.0% - 35.0%', terms: '3-24 months', description: 'Quick funding for short-term needs', downPayment: 0, interestRate: 25.0, term: 2 },
];

export const FinancingStep: React.FC = () => {
  const { deal, updateDeal } = useDeal();

  const form = useForm<FinancingData>({
    resolver: zodResolver(FinancingSchema),
    defaultValues: {
      downPaymentPercent: deal?.downPaymentPercent || 25,
      loanInterestRatePercent: deal?.loanInterestRatePercent || 7.5,
      loanTermYears: deal?.loanTermYears || 10,
      loanType: deal?.loanType || 'SBA 7(a) Loan',
    },
  });

  useEffect(() => {
    if (deal) {
      form.setValue('downPaymentPercent', deal.downPaymentPercent || 25);
      form.setValue('loanInterestRatePercent', deal.loanInterestRatePercent || 7.5);
      form.setValue('loanTermYears', deal.loanTermYears || 10);
      form.setValue('loanType', deal.loanType || 'SBA 7(a) Loan');
    }
  }, [deal, form]);

  const handleFieldChange = (field: keyof FinancingData, value: any) => {
    updateDeal({ [field]: value });
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number): string => {
    return `${value.toFixed(2)}%`;
  };

  // Calculate financing details
  const askingPrice = deal?.askingPrice || 0;
  const downPaymentPercent = form.watch('downPaymentPercent') || 0;
  const interestRate = form.watch('loanInterestRatePercent') || 0;
  const termYears = form.watch('loanTermYears') || 0;

  const downPaymentAmount = askingPrice * (downPaymentPercent / 100);
  const loanAmount = askingPrice - downPaymentAmount;
  
  // Monthly payment calculation
  const monthlyRate = interestRate / 100 / 12;
  const numPayments = termYears * 12;
  let monthlyPayment = 0;
  
  if (monthlyRate > 0 && numPayments > 0) {
    monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                     (Math.pow(1 + monthlyRate, numPayments) - 1);
  } else if (numPayments > 0) {
    monthlyPayment = loanAmount / numPayments;
  }

  const annualDebtService = monthlyPayment * 12;

  const selectedLoanType = loanTypes.find(lt => lt.value === form.watch('loanType')) || loanTypes[0];

  return (
    <div className="space-y-6">
      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertDescription>
          Enter your financing details. If you don't have specific information, leave fields blank. Interest rates and terms shown are industry standards.
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Loan Structure */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Loan Structure
              </CardTitle>
              <CardDescription>
                Basic financing parameters for your deal
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {/* Loan Type */}
               <FormField
                 control={form.control}
                 name="loanType"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel className="flex items-center gap-2">
                       Loan Type
                       <HelpTooltip content="Choose the type of financing. Different loan types have different requirements, rates, and terms. SBA loans typically offer the best rates for business purchases." />
                     </FormLabel>
                       <Select 
                         value={field.value} 
                         onValueChange={(value) => {
                           field.onChange(value);
                           handleFieldChange('loanType', value);
                           
                           // Auto-fill loan parameters based on selection
                           const selectedType = loanTypes.find(lt => lt.value === value);
                           if (selectedType) {
                             form.setValue('downPaymentPercent', selectedType.downPayment);
                             form.setValue('loanInterestRatePercent', selectedType.interestRate);
                             form.setValue('loanTermYears', selectedType.term);
                             handleFieldChange('downPaymentPercent', selectedType.downPayment);
                             handleFieldChange('loanInterestRatePercent', selectedType.interestRate);
                             handleFieldChange('loanTermYears', selectedType.term);
                           }
                         }}
                      >
                       <FormControl>
                         <SelectTrigger>
                           <SelectValue placeholder="Select loan type" />
                         </SelectTrigger>
                       </FormControl>
                        <SelectContent>
                          {loanTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                          ))}
                        </SelectContent>
                     </Select>
                      <p className="text-sm text-muted-foreground">
                        {selectedLoanType.description}
                      </p>
                     <FormMessage />
                   </FormItem>
                 )}
               />

              {/* Down Payment Percent */}
              <FormField
                control={form.control}
                name="downPaymentPercent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Down Payment (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        placeholder="25"
                        value={field.value || ''}
                        onChange={(e) => {
                          const value = e.target.value === '' ? 0 : parseFloat(e.target.value) || 0;
                          field.onChange(value);
                          handleFieldChange('downPaymentPercent', value);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Delete' || e.key === 'Backspace') {
                            const target = e.target as HTMLInputElement;
                            if (target.value === field.value.toString()) {
                              e.preventDefault();
                              field.onChange(0);
                              handleFieldChange('downPaymentPercent', 0);
                            }
                          }
                        }}
                      />
                    </FormControl>
                     <p className="text-sm text-muted-foreground">
                       SBA typical: 10-15%, Conventional: 20-30%
                     </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Interest Rate */}
              <FormField
                control={form.control}
                name="loanInterestRatePercent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Interest Rate (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="50"
                        placeholder="7.5"
                        value={field.value || ''}
                        onChange={(e) => {
                          const value = e.target.value === '' ? 0 : parseFloat(e.target.value) || 0;
                          field.onChange(value);
                          handleFieldChange('loanInterestRatePercent', value);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Delete' || e.key === 'Backspace') {
                            const target = e.target as HTMLInputElement;
                            if (target.value === field.value.toString()) {
                              e.preventDefault();
                              field.onChange(0);
                              handleFieldChange('loanInterestRatePercent', 0);
                            }
                          }
                        }}
                      />
                    </FormControl>
                     <p className="text-sm text-muted-foreground">
                       {selectedLoanType.rates}
                     </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Loan Term */}
              <FormField
                control={form.control}
                name="loanTermYears"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loan Term (Years)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="30"
                        placeholder="10"
                        value={field.value || ''}
                        onChange={(e) => {
                          const value = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
                          field.onChange(value);
                          handleFieldChange('loanTermYears', value);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Delete' || e.key === 'Backspace') {
                            const target = e.target as HTMLInputElement;
                            if (target.value === field.value.toString()) {
                              e.preventDefault();
                              field.onChange(0);
                              handleFieldChange('loanTermYears', 0);
                            }
                          }
                        }}
                      />
                    </FormControl>
                     <p className="text-sm text-muted-foreground">
                       {selectedLoanType.terms}
                     </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

             </CardContent>
           </Card>

          {/* Financing Calculator */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Financing Calculator
              </CardTitle>
              <CardDescription>
                Calculated based on your financing parameters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Purchase Price</p>
                  <p className="text-lg font-semibold">{formatCurrency(askingPrice)}</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Down Payment</p>
                  <p className="text-lg font-semibold">{formatCurrency(downPaymentAmount)}</p>
                  <p className="text-xs text-muted-foreground">{formatPercentage(downPaymentPercent)}</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Loan Amount</p>
                  <p className="text-lg font-semibold">{formatCurrency(loanAmount)}</p>
                </div>
                <div className="p-4 bg-primary/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">Monthly Payment</p>
                  <p className="text-lg font-bold text-primary">{formatCurrency(monthlyPayment)}</p>
                  <p className="text-xs text-muted-foreground">{formatCurrency(annualDebtService)}/year</p>
                </div>
              </div>
            </CardContent>
          </Card>


          {/* Financing Information */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Financing Options Guide</CardTitle>
              <CardDescription>
                Understanding your financing options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">Cash Purchase</h4>
                  <p className="text-sm text-muted-foreground">
                    • No financing delays
                    • Immediate ownership
                    • Stronger negotiating position
                    • No debt service obligations
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">SBA 7(a) Loan</h4>
                  <p className="text-sm text-muted-foreground">
                    • 10% down payment
                    • 6.5%-10.5% interest rates
                    • Up to 10 years for business acquisition
                    • Government backing reduces lender risk
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">SBA 504 Loan</h4>
                  <p className="text-sm text-muted-foreground">
                    • 10% down payment
                    • 5.5%-8.5% interest rates
                    • 10-20 year terms
                    • For real estate and equipment
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">SBA Microloan</h4>
                  <p className="text-sm text-muted-foreground">
                    • Up to $50,000
                    • 8.0%-13.0% interest rates
                    • Up to 6 years
                    • Good for smaller purchases
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Conventional Bank Loan</h4>
                  <p className="text-sm text-muted-foreground">
                    • 20-30% down payment
                    • 7.0%-12.0% interest rates
                    • Faster approval process
                    • Good for strong borrowers
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Equipment Financing</h4>
                  <p className="text-sm text-muted-foreground">
                    • 10% down payment
                    • 5.0%-12.0% interest rates
                    • 3-7 year terms
                    • Equipment as collateral
                  </p>
                </div>
              </div>
              
              <Alert>
                <InfoIcon className="h-4 w-4" />
                <AlertDescription>
                  <strong>Pro Tip:</strong> Consider working with an SBA preferred lender for faster processing. 
                  Equipment financing may also be available for newer machines with competitive rates.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </Form>
    </div>
  );
};
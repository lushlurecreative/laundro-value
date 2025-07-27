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

const FinancingSchema = z.object({
  downPaymentPercent: z.number().min(0).max(100, "Down payment must be between 0-100%"),
  loanInterestRatePercent: z.number().min(0).max(50, "Interest rate must be between 0-50%"),
  loanTermYears: z.number().min(1).max(30, "Loan term must be between 1-30 years"),
  loanType: z.string().min(1, "Loan type is required"),
});

type FinancingData = z.infer<typeof FinancingSchema>;

const loanTypes = [
  'SBA 7(a) Loan',
  'SBA 504 Loan', 
  'Conventional Bank Loan',
  'Equipment Financing',
  'Seller Financing',
  'Asset-Based Loan',
  'Business Line of Credit',
  'Personal Loan',
  'Cash Purchase',
  'Other'
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

  // Get loan type information
  const getLoanTypeInfo = (type: string) => {
    const loanInfo: { [key: string]: { description: string; rates: string; terms: string } } = {
      'SBA 7(a) Loan': {
        description: 'Most common SBA loan for business purchases',
        rates: '6.5% - 10.5% *',
        terms: 'Up to 10 years for business acquisition'
      },
      'SBA 504 Loan': {
        description: 'For real estate and equipment purchases',
        rates: '5.5% - 9.5% *',
        terms: 'Up to 20 years for real estate'
      },
      'Conventional Bank Loan': {
        description: 'Traditional business loan from banks',
        rates: '7.0% - 12.0% *',
        terms: '5-15 years typical'
      },
      'Equipment Financing': {
        description: 'Secured by the equipment being purchased',
        rates: '6.0% - 15.0% *',
        terms: '3-10 years'
      },
      'Seller Financing': {
        description: 'Owner finances part of the purchase',
        rates: '5.0% - 10.0% *',
        terms: 'Negotiable, typically 5-10 years'
      }
    };
    
    return loanInfo[type] || { description: 'Custom financing option', rates: 'Varies', terms: 'Varies' };
  };

  const selectedLoanInfo = getLoanTypeInfo(form.watch('loanType') || '');

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
                        {...field}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0;
                          field.onChange(value);
                          handleFieldChange('downPaymentPercent', value);
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
                        {...field}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0;
                          field.onChange(value);
                          handleFieldChange('loanInterestRatePercent', value);
                        }}
                      />
                    </FormControl>
                    <p className="text-sm text-muted-foreground">
                      {selectedLoanInfo.rates}
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
                        {...field}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          field.onChange(value);
                          handleFieldChange('loanTermYears', value);
                        }}
                      />
                    </FormControl>
                    <p className="text-sm text-muted-foreground">
                      {selectedLoanInfo.terms}
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Loan Type */}
              <FormField
                control={form.control}
                name="loanType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loan Type</FormLabel>
                    <Select 
                      value={field.value} 
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleFieldChange('loanType', value);
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select loan type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {loanTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      {selectedLoanInfo.description}
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

          {/* Other Financing Details */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Other Financing Details</CardTitle>
              <CardDescription>
                Additional financing information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="loanType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Other Financing Details</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter other financing information..."
                        value={field.value === 'Other' ? field.value : ''}
                        onChange={(e) => {
                          field.onChange(e.target.value || 'Other');
                          handleFieldChange('loanType', e.target.value || 'Other');
                        }}
                        disabled={field.value !== 'Other'}
                      />
                    </FormControl>
                    <p className="text-sm text-muted-foreground">
                      Only enabled when "Other" is selected above
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">SBA Loans (Recommended)</h4>
                  <p className="text-sm text-muted-foreground">
                    • Lower down payments (10-15%)
                    • Competitive interest rates
                    • Longer repayment terms
                    • Government backing reduces lender risk
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Conventional Loans</h4>
                  <p className="text-sm text-muted-foreground">
                    • Higher down payments (20-30%)
                    • Faster approval process
                    • More flexible terms
                    • Good for strong borrowers
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
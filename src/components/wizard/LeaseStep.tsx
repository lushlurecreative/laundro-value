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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoIcon, FileText, AlertTriangle } from 'lucide-react';
import { HelpTooltip } from '@/components/ui/help-tooltip';

const LeaseSchema = z.object({
  monthlyRent: z.number().min(0, "Monthly rent must be positive"),
  annualRentIncreasePercent: z.number().min(0).max(20, "Rent increase must be between 0-20%"),
  camCostAnnual: z.number().min(0, "CAM cost must be positive"),
  remainingLeaseTermYears: z.number().min(0).max(50, "Lease term must be between 0-50 years"),
  renewalOptionsCount: z.number().min(0).max(10, "Renewal options must be between 0-10"),
  renewalOptionLengthYears: z.number().min(0).max(20, "Renewal length must be between 0-20 years"),
  leaseType: z.enum(['Triple Net (NNN)', 'Modified Gross', 'Gross Lease', 'Other']),
  leaseTerms: z.string().optional(),
});

type LeaseData = z.infer<typeof LeaseSchema>;

const leaseTypes = [
  'Triple Net (NNN)',
  'Modified Gross', 
  'Gross Lease',
  'Other'
];

export const LeaseStep: React.FC = () => {
  const { deal, leaseDetails, updateLeaseDetails } = useDeal();

  // Only show this step if real estate is NOT included
  if (deal?.isRealEstateIncluded) {
    return (
      <div className="space-y-6">
        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>
            Since real estate is included in this purchase, lease information is not required.
            You can skip this step or go back to modify the real estate setting in Property Information.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const form = useForm<LeaseData>({
    resolver: zodResolver(LeaseSchema),
    defaultValues: {
      monthlyRent: leaseDetails?.monthlyRent || 0,
      annualRentIncreasePercent: leaseDetails?.annualRentIncreasePercent || 2.25,
      camCostAnnual: leaseDetails?.camCostAnnual || 0,
      remainingLeaseTermYears: leaseDetails?.remainingLeaseTermYears || 0,
      renewalOptionsCount: leaseDetails?.renewalOptionsCount || 0,
      renewalOptionLengthYears: leaseDetails?.renewalOptionLengthYears || 5,
      leaseType: leaseDetails?.leaseType || 'Triple Net (NNN)',
      leaseTerms: leaseDetails?.leaseTerms || '',
    },
  });

  useEffect(() => {
    if (leaseDetails) {
      // Only update if the value is actually different to avoid loops
      if (form.getValues('monthlyRent') !== (leaseDetails.monthlyRent || 0)) {
        form.setValue('monthlyRent', leaseDetails.monthlyRent || 0);
      }
      if (form.getValues('annualRentIncreasePercent') !== (leaseDetails.annualRentIncreasePercent || 2.25)) {
        form.setValue('annualRentIncreasePercent', leaseDetails.annualRentIncreasePercent || 2.25);
      }
      if (form.getValues('camCostAnnual') !== (leaseDetails.camCostAnnual || 0)) {
        form.setValue('camCostAnnual', leaseDetails.camCostAnnual || 0);
      }
      if (form.getValues('remainingLeaseTermYears') !== (leaseDetails.remainingLeaseTermYears || 0)) {
        form.setValue('remainingLeaseTermYears', leaseDetails.remainingLeaseTermYears || 0);
      }
      if (form.getValues('renewalOptionsCount') !== (leaseDetails.renewalOptionsCount || 0)) {
        form.setValue('renewalOptionsCount', leaseDetails.renewalOptionsCount || 0);
      }
      if (form.getValues('renewalOptionLengthYears') !== (leaseDetails.renewalOptionLengthYears || 5)) {
        form.setValue('renewalOptionLengthYears', leaseDetails.renewalOptionLengthYears || 5);
      }
      if (form.getValues('leaseType') !== (leaseDetails.leaseType || 'Triple Net (NNN)')) {
        form.setValue('leaseType', leaseDetails.leaseType || 'Triple Net (NNN)');
      }
      if (form.getValues('leaseTerms') !== (leaseDetails.leaseTerms || '')) {
        form.setValue('leaseTerms', leaseDetails.leaseTerms || '');
      }
    }
  }, [leaseDetails, form]);

  const handleFieldChange = (field: keyof LeaseData, value: any) => {
    updateLeaseDetails({ [field]: value });
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  // Calculate lease summary
  const monthlyRent = form.watch('monthlyRent') || 0;
  const annualRent = monthlyRent * 12;
  const camCost = form.watch('camCostAnnual') || 0;
  const totalAnnualRent = annualRent + camCost;
  const rentIncreasePercent = form.watch('annualRentIncreasePercent') || 0;

  // Calculate rent over time
  const year2Rent = annualRent * (1 + rentIncreasePercent / 100);
  const year3Rent = year2Rent * (1 + rentIncreasePercent / 100);

  return (
    <div className="space-y-6">
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Important:</strong> Since real estate is not included in this purchase, lease terms are critical to your deal analysis. 
          All information marked with * represents industry standards and should be verified with the actual lease agreement.
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Lease Terms */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Basic Lease Terms
              </CardTitle>
              <CardDescription>
                Core lease information and financial terms
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Monthly Rent */}
              <FormField
                control={form.control}
                name="monthlyRent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Monthly Base Rent
                      <HelpTooltip content="The base monthly rent amount before any additional charges. This is the core lease payment amount." />
                    </FormLabel>
                    <FormControl>
                      <CurrencyInput
                        placeholder="$5,000.00"
                        value={field.value}
                        onChange={(value) => {
                          field.onChange(value);
                          handleFieldChange('monthlyRent', value);
                        }}
                      />
                    </FormControl>
                     <p className="text-sm text-muted-foreground">
                       Typical: $3-8 per sq ft annually *
                     </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* CAM Costs */}
              <FormField
                control={form.control}
                name="camCostAnnual"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      CAM Costs (Annual)
                      <HelpTooltip content="Common Area Maintenance charges - costs for maintaining shared areas like parking lots, lobbies, and landscaping." />
                    </FormLabel>
                    <FormControl>
                      <CurrencyInput
                        placeholder="$2,000.00"
                        value={field.value}
                        onChange={(value) => {
                          field.onChange(value);
                          handleFieldChange('camCostAnnual', value);
                        }}
                      />
                    </FormControl>
                    <p className="text-sm text-muted-foreground">
                      Common Area Maintenance charges *
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Remaining Lease Term */}
              <FormField
                control={form.control}
                name="remainingLeaseTermYears"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Remaining Lease Term (Years)
                      <HelpTooltip content="How many years are left on the current lease agreement. Minimum 5-7 years is preferred for financing purposes." />
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        placeholder="8"
                        {...field}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0;
                          field.onChange(value);
                          handleFieldChange('remainingLeaseTermYears', value);
                        }}
                      />
                    </FormControl>
                    <p className="text-sm text-muted-foreground">
                      Minimum 5-7 years preferred for financing *
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Annual Rent Increase */}
              <FormField
                control={form.control}
                name="annualRentIncreasePercent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Annual Rent Increase (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="20"
                        placeholder="2.25"
                        {...field}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0;
                          field.onChange(value);
                          handleFieldChange('annualRentIncreasePercent', value);
                        }}
                      />
                    </FormControl>
                    <p className="text-sm text-muted-foreground">
                      Typical: 2-3% annually or CPI *
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Renewal Options */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Renewal Options</CardTitle>
              <CardDescription>
                Options to extend the lease beyond the initial term
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Renewal Options Count */}
              <FormField
                control={form.control}
                name="renewalOptionsCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Renewal Options</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="10"
                        placeholder="2"
                        {...field}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          field.onChange(value);
                          handleFieldChange('renewalOptionsCount', value);
                        }}
                      />
                    </FormControl>
                    <p className="text-sm text-muted-foreground">
                      e.g., "Two (2) five (5) year terms"
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Renewal Option Length */}
              <FormField
                control={form.control}
                name="renewalOptionLengthYears"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Length of Each Option (Years)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="20"
                        placeholder="5"
                        {...field}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          field.onChange(value);
                          handleFieldChange('renewalOptionLengthYears', value);
                        }}
                      />
                    </FormControl>
                    <p className="text-sm text-muted-foreground">
                      Typical: 5-10 years per option
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Lease Type */}
              <FormField
                control={form.control}
                name="leaseType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lease Type</FormLabel>
                    <Select 
                      value={field.value} 
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleFieldChange('leaseType', value);
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select lease type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {leaseTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      NNN most common for retail
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Lease Terms Details */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Additional Lease Terms</CardTitle>
              <CardDescription>
                Important clauses, conditions, and special terms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="leaseTerms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lease Terms & Conditions</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter specific lease terms, conditions, important clauses, tenant improvement allowances, maintenance responsibilities, etc."
                        className="min-h-[100px]"
                        {...field}
                        onBlur={(e) => {
                          field.onBlur();
                          handleFieldChange('leaseTerms', e.target.value);
                        }}
                      />
                    </FormControl>
                    <p className="text-sm text-muted-foreground">
                      Include: Assignment rights, subletting, improvements, maintenance, insurance requirements
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Lease Summary */}
          <Card className="md:col-span-2 bg-muted/50">
            <CardHeader>
              <CardTitle>Lease Cost Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-sm text-muted-foreground">Year 1 Rent</p>
                  <p className="text-lg font-semibold">{formatCurrency(annualRent)}</p>
                  <p className="text-xs text-muted-foreground">{formatCurrency(monthlyRent)}/month</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">CAM Costs</p>
                  <p className="text-lg font-semibold">{formatCurrency(camCost)}</p>
                  <p className="text-xs text-muted-foreground">Annual</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Year 1</p>
                  <p className="text-lg font-bold text-primary">{formatCurrency(totalAnnualRent)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Year 2 Rent</p>
                  <p className="text-lg font-semibold">{formatCurrency(year2Rent)}</p>
                  <p className="text-xs text-muted-foreground">+{rentIncreasePercent}%</p>
                </div>
              </div>
              
              {form.watch('renewalOptionsCount') > 0 && (
                <Alert className="mt-4">
                  <InfoIcon className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Renewal Options:</strong> {form.watch('renewalOptionsCount')} option(s) of {form.watch('renewalOptionLengthYears')} years each. 
                    Total potential lease term: {(form.watch('remainingLeaseTermYears') || 0) + (form.watch('renewalOptionsCount') || 0) * (form.watch('renewalOptionLengthYears') || 0)} years.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </Form>
    </div>
  );
};
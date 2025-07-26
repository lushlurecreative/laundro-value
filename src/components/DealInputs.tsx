import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DealSchema } from '@/schemas/dealSchema';
import { Deal, LeaseDetails, AncillaryIncome } from '@/types/deal';
import { useDeal } from '@/contexts/useDeal';
import { useSubscription } from '@/contexts/SubscriptionContext';
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useOpenAIAnalysis } from '@/hooks/useOpenAIAnalysis';
import { Crown, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const DealInputs = () => {
  const { deal, updateDeal, updateLeaseDetails, expenseItems, updateExpenseItem, addMachine, clearMachineInventory, updateAncillaryIncome, saveAndStartNew } = useDeal();
  const { canPerformAction, trackUsage, getRemainingUsage, subscription, createCheckoutSession } = useSubscription();
  const [isRealEstateIncluded, setIsRealEstateIncluded] = useState(deal?.isRealEstateIncluded || false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    if (deal) {
      setIsRealEstateIncluded(deal.isRealEstateIncluded);
    }
  }, [deal]);

  const form = useForm<Deal>({
    resolver: zodResolver(DealSchema),
    defaultValues: {
      dealId: deal?.dealId || 'deal-1',
      dealName: deal?.dealName || 'New Laundromat Deal',
      userId: deal?.userId || 'user-1',
      propertyAddress: deal?.propertyAddress || '',
      askingPrice: deal?.askingPrice || 0,
      facilitySizeSqft: deal?.facilitySizeSqft || 0,
      isRealEstateIncluded: deal?.isRealEstateIncluded || false,
      grossIncomeAnnual: deal?.grossIncomeAnnual || 0,
      annualNet: deal?.annualNet || 0,
      fullTimeStaffCount: deal?.fullTimeStaffCount || 0,
      partTimeStaffCount: deal?.partTimeStaffCount || 0,
      payrollCost: deal?.payrollCost || 0,
      downPaymentPercent: deal?.downPaymentPercent || 25,
      loanInterestRatePercent: deal?.loanInterestRatePercent || 7.5,
      loanTermYears: deal?.loanTermYears || 10,
      loanType: deal?.loanType || 'Conventional',
      targetCapRatePercent: deal?.targetCapRatePercent || 8,
      targetCoCROIPercent: deal?.targetCoCROIPercent || 15,
      ownerWeeklyHours: deal?.ownerWeeklyHours || 0,
      leaseHistory: deal?.leaseHistory || '',
      notes: deal?.notes || '',
      incomeGrowthRatePercent: deal?.incomeGrowthRatePercent || 2.0,
      expenseGrowthRatePercent: deal?.expenseGrowthRatePercent || 3.0,
      expansionPotential: deal?.expansionPotential || {
        additionalMachines: 0,
        expansionCost: 0,
        potentialAdditionalIncome: 0
      },
      valueAddedServices: deal?.valueAddedServices || [],
    },
    mode: "onBlur"
  });

  const { analyzeText, isAnalyzing } = useOpenAIAnalysis({
    onFieldsPopulated: (fields) => {
      console.log('AI Analysis Fields:', fields);

      // Create update objects
      const dealUpdates: Partial<Deal> = {};
      const leaseUpdates: Partial<LeaseDetails> = {};
      const ancillaryUpdates: Partial<AncillaryIncome> = {};

      // 1. Handle Top-level deal fields
      if (fields.askingPrice) dealUpdates.askingPrice = fields.askingPrice;
      if (fields.grossIncome) dealUpdates.grossIncomeAnnual = fields.grossIncome;
      if (fields.totalSqft) dealUpdates.facilitySizeSqft = fields.totalSqft;
      if (fields.propertyAddress) dealUpdates.propertyAddress = fields.propertyAddress;

      // 2. Handle nested lease object
      if (fields.lease) {
        if (fields.lease.monthlyRent) leaseUpdates.monthlyRent = fields.lease.monthlyRent;
        if (fields.lease.remainingTermYears) leaseUpdates.remainingLeaseTermYears = fields.lease.remainingTermYears;
        if (fields.lease.renewalOptionsCount) leaseUpdates.renewalOptionsCount = fields.lease.renewalOptionsCount;
        if (fields.lease.annualRentIncreasePercent) leaseUpdates.annualRentIncreasePercent = fields.lease.annualRentIncreasePercent;
      }

      // 3. Handle nested expenses object with expanded categories
      if (fields.expenses) {
        const expenseMapping: { [key: string]: string } = {
          'rent': 'Rent',
          'gas': 'Gas',
          'electricity': 'Electricity',
          'electric': 'Electricity',
          'water': 'Water & Sewer',
          'maintenance': 'Maintenance & Repairs',
          'insurance': 'Insurance',
          'trash': 'Trash',
          'licenses': 'Licenses & Permits',
          'supplies': 'Supplies',
          'internet': 'Internet'
        };

        Object.entries(fields.expenses).forEach(([expenseKey, value]) => {
          const mappedName = expenseMapping[expenseKey.toLowerCase()] || expenseKey;
          const existingExpense = expenseItems.find(exp => 
            exp.expenseName.toLowerCase().includes(expenseKey.toLowerCase()) ||
            mappedName.toLowerCase().includes(exp.expenseName.toLowerCase())
          );
          
          if (existingExpense && typeof value === 'number' && value > 0) {
            updateExpenseItem(existingExpense.expenseId, { amountAnnual: value });
          }
        });
      }

      // 4. Handle nested ancillary income
      if (fields.ancillary) {
        if (fields.ancillary.vending) ancillaryUpdates.vendingIncomeAnnual = fields.ancillary.vending;
        if (fields.ancillary.other) ancillaryUpdates.otherIncomeAnnual = fields.ancillary.other;
      }
      
      // 5. Handle nested equipment object
      if (fields.equipment) {
        // Clear existing inventory
        clearMachineInventory();

        // Use setTimeout to ensure state has cleared
        setTimeout(() => {
          // Add washers summary
          if (fields.equipment.washers > 0) {
            addMachine({
              machineId: `machine-washers-${Date.now()}`,
              dealId: deal?.dealId || 'deal-1',
              machineType: 'Front-Load Washer',
              brand: 'Various',
              quantity: fields.equipment.washers,
              ageYears: fields.equipment.avgAge || 10,
              conditionRating: 3,
              vendPricePerUse: 3.50,
              capacityLbs: 35,
              isCardOperated: true,
              isCoinOperated: true,
              isOutOfOrder: false,
              purchaseValue: 0,
              currentValue: 0,
              maintenanceCostAnnual: 0,
            });
          }
          
          // Add dryers summary
          if (fields.equipment.dryers > 0) {
            addMachine({
              machineId: `machine-dryers-${Date.now()}`,
              dealId: deal?.dealId || 'deal-1',
              machineType: 'Single Dryer',
              brand: 'Various',
              quantity: fields.equipment.dryers,
              ageYears: fields.equipment.avgAge || 10,
              conditionRating: 3,
              vendPricePerUse: 2.00,
              capacityLbs: 30,
              isCardOperated: true,
              isCoinOperated: true,
              isOutOfOrder: false,
              purchaseValue: 0,
              currentValue: 0,
              maintenanceCostAnnual: 0,
            });
          }
        }, 100);
      }

      // 6. Apply all state updates
      if (Object.keys(dealUpdates).length > 0) {
        console.log('Updating deal with:', dealUpdates);
        updateDeal(dealUpdates);
      }
      if (Object.keys(leaseUpdates).length > 0) {
        console.log('Updating lease with:', leaseUpdates);
        updateLeaseDetails(leaseUpdates);
      }
      if (Object.keys(ancillaryUpdates).length > 0) {
        console.log('Updating ancillary income with:', ancillaryUpdates);
        updateAncillaryIncome(ancillaryUpdates);
      }
    }
  });

  const onSubmit = async (data: Deal) => {
    console.log('Form data:', data);
    updateDeal(data);
    
    // Track deal save usage
    if (canPerformAction('save_deal')) {
      await trackUsage('deal_saved', deal?.dealId, { dealName: data.dealName });
      toast({
        title: "Deal saved",
        description: "Your deal has been saved successfully.",
      });
    }
  };

  const handleStartNewDeal = async () => {
    if (!canPerformAction('save_deal')) {
      const remaining = getRemainingUsage('saved_deals');
      if (remaining === 0) {
        toast({
          title: "Usage limit reached",
          description: "You've reached your saved deals limit. Upgrade to save more deals.",
          variant: "destructive",
        });
        return;
      }
    }
    
    await saveAndStartNew();
    if (canPerformAction('save_deal')) {
      await trackUsage('deal_saved', 'new-deal', { action: 'new_deal_started' });
    }
  };

  const handleUpgradeClick = async () => {
    try {
      setCheckoutLoading(true);
      await createCheckoutSession('professional', 'monthly');
      toast({
        title: "Redirecting to checkout",
        description: "You'll be redirected to upgrade your subscription.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start checkout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCheckoutLoading(false);
    }
  };

  const remainingSavedDeals = getRemainingUsage('saved_deals');
  const isFreeTier = subscription?.subscription_tier === 'free';

  return (
    <div className="space-y-6">
      {/* Usage Warning for Free Tier */}
      {isFreeTier && (
        <Alert className="border-warning">
          <Crown className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              Saved deals remaining: <strong>{remainingSavedDeals}</strong> 
              {remainingSavedDeals === 0 && " - Upgrade to save more deals"}
            </span>
            {remainingSavedDeals <= 1 && (
              <Button 
                size="sm" 
                onClick={handleUpgradeClick}
                disabled={checkoutLoading}
              >
                {checkoutLoading ? 'Processing...' : 'Upgrade'}
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-2 gap-4">
          {/* Deal Name */}
          <FormField
            control={form.control}
            name="dealName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Deal Name</FormLabel>
                <FormControl>
                  <Input placeholder="The Spin Cycle" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Property Address */}
          <FormField
            control={form.control}
            name="propertyAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Property Address</FormLabel>
                <FormControl>
                  <Input placeholder="123 Main St" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Asking Price */}
          <FormField
            control={form.control}
            name="askingPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Asking Price</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="150000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Facility Size */}
          <FormField
            control={form.control}
            name="facilitySizeSqft"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Facility Size (Sqft)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="2000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Gross Income */}
          <FormField
            control={form.control}
            name="grossIncomeAnnual"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gross Income (Annual)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="200000" {...field} />
                </FormControl>
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
                <FormLabel>Annual Net (NOI)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="50000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Is Real Estate Included */}
          <FormField
            control={form.control}
            name="isRealEstateIncluded"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-md border p-4">
                <div className="space-y-0.5">
                  <FormLabel>Real Estate Included?</FormLabel>
                  {/* <FormDescription>
                    Whether the real estate is included in the deal.
                  </FormDescription> */}
                </div>
                <FormControl>
                  <Switch
                    checked={isRealEstateIncluded}
                    onCheckedChange={(checked) => {
                      setIsRealEstateIncluded(checked);
                      form.setValue("isRealEstateIncluded", checked);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          {/* Full Time Staff Count */}
          <FormField
            control={form.control}
            name="fullTimeStaffCount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Time Staff</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="2" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Part Time Staff Count */}
          <FormField
            control={form.control}
            name="partTimeStaffCount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Part Time Staff</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="3" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Payroll Cost */}
          <FormField
            control={form.control}
            name="payrollCost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payroll Cost</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="75000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          {/* Down Payment Percent */}
          <FormField
            control={form.control}
            name="downPaymentPercent"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Down Payment (%)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="25" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Loan Interest Rate Percent */}
          <FormField
            control={form.control}
            name="loanInterestRatePercent"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Interest Rate (%)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="7.5" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Loan Term Years */}
          <FormField
            control={form.control}
            name="loanTermYears"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Loan Term (Years)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="10" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          {/* Target Cap Rate Percent */}
          <FormField
            control={form.control}
            name="targetCapRatePercent"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target Cap Rate (%)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="8" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Target CoC ROI Percent */}
          <FormField
            control={form.control}
            name="targetCoCROIPercent"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target CoC ROI (%)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="15" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Owner Weekly Hours */}
          <FormField
            control={form.control}
            name="ownerWeeklyHours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Owner Hours (Weekly)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="10" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Lease History */}
          <FormField
            control={form.control}
            name="leaseHistory"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lease History</FormLabel>
                <FormControl>
                  <Textarea placeholder="Previous lease terms..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Notes */}
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea placeholder="Additional notes..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Income Growth Rate */}
          <FormField
            control={form.control}
            name="incomeGrowthRatePercent"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Income Growth Rate (%)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="2.0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Expense Growth Rate */}
          <FormField
            control={form.control}
            name="expenseGrowthRatePercent"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expense Growth Rate (%)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="3.0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* AI Analysis Button */}
        <div>
          <Label htmlFor="deal-notes">Deal Notes for AI Analysis</Label>
          <Textarea
            id="deal-notes"
            placeholder="Paste deal notes here..."
            className="mt-2"
            onBlur={(e) => analyzeText(e.target.value)}
          />
          {isAnalyzing && <p className="text-sm text-muted-foreground">Analyzing...</p>}
        </div>

        <div className="flex gap-4 pt-6 border-t">
          <Button type="submit" disabled={!canPerformAction('save_deal')}>
            Save Deal
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleStartNewDeal}
            disabled={!canPerformAction('save_deal')}
          >
            Save & Start New
          </Button>
          {!canPerformAction('save_deal') && (
            <Alert className="flex-1">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                You've reached your saved deals limit. 
                <Button 
                  variant="link" 
                  size="sm" 
                  onClick={handleUpgradeClick}
                  disabled={checkoutLoading}
                  className="px-1"
                >
                  Upgrade to save more
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </form>
    </Form>
    </div>
  );
};

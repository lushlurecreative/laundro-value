import React from 'react';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useOpenAIAnalysis } from '@/hooks/useOpenAIAnalysis';
import { useDeal } from '@/contexts/useDeal';
import { InfoIcon, Lightbulb } from 'lucide-react';
import { Deal, LeaseDetails, AncillaryIncome } from '@/types/deal';

export const AIAnalysisStep: React.FC = () => {
  const { deal, updateDeal, updateLeaseDetails, updateAncillaryIncome, updateExpenseItem, expenseItems, addMachine, clearMachineInventory } = useDeal();

  const { analyzeText, isAnalyzing } = useOpenAIAnalysis({
    onFieldsPopulated: (fields) => {
      console.log('AI Analysis Fields:', fields);

      // Create update objects
      const dealUpdates: Partial<Deal> = {};
      const leaseUpdates: Partial<LeaseDetails> = {};
      const ancillaryUpdates: Partial<AncillaryIncome> = {};

      // Handle top-level deal fields
      if (fields.askingPrice) dealUpdates.askingPrice = fields.askingPrice;
      if (fields.grossIncome) dealUpdates.grossIncomeAnnual = fields.grossIncome;
      if (fields.totalSqft) dealUpdates.facilitySizeSqft = fields.totalSqft;
      if (fields.propertyAddress) dealUpdates.propertyAddress = fields.propertyAddress;

      // Handle lease object
      if (fields.lease) {
        if (fields.lease.monthlyRent) leaseUpdates.monthlyRent = fields.lease.monthlyRent;
        if (fields.lease.remainingTermYears) leaseUpdates.remainingLeaseTermYears = fields.lease.remainingTermYears;
        if (fields.lease.renewalOptionsCount) leaseUpdates.renewalOptionsCount = fields.lease.renewalOptionsCount;
        if (fields.lease.annualRentIncreasePercent) leaseUpdates.annualRentIncreasePercent = fields.lease.annualRentIncreasePercent;
      }

      // Handle expenses
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

      // Handle ancillary income
      if (fields.ancillary) {
        if (fields.ancillary.vending) ancillaryUpdates.vendingIncomeAnnual = fields.ancillary.vending;
        if (fields.ancillary.other) ancillaryUpdates.otherIncomeAnnual = fields.ancillary.other;
      }
      
      // Handle equipment
      if (fields.equipment) {
        clearMachineInventory();

        setTimeout(() => {
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

      // Apply updates
      if (Object.keys(dealUpdates).length > 0) {
        updateDeal(dealUpdates);
      }
      if (Object.keys(leaseUpdates).length > 0) {
        updateLeaseDetails(leaseUpdates);
      }
      if (Object.keys(ancillaryUpdates).length > 0) {
        updateAncillaryIncome(ancillaryUpdates);
      }
    }
  });

  return (
    <div className="space-y-6">
      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertDescription>
          <strong>AI-Powered Analysis:</strong> Paste any deal information, lease summaries, or property listings here. 
          Our AI will automatically extract and populate relevant fields throughout the wizard. This uses industry standards 
          and should be verified for accuracy.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <div>
          <Label htmlFor="deal-notes" className="text-base font-medium">
            Deal Notes for AI Analysis
          </Label>
          <p className="text-sm text-muted-foreground mb-2">
            Paste deal notes, lease summaries, property listings, financial statements, or any deal-related information
          </p>
          <Textarea
            id="deal-notes"
            placeholder="Example: 'LEASE SUMMARY - Premises Address: 123 Main St, Rent: $5,000/month, Term: 10 years...' or property listings with equipment details and financial information."
            className="min-h-[200px]"
            onBlur={(e) => analyzeText(e.target.value)}
          />
          {isAnalyzing && (
            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span>Analyzing and populating fields...</span>
            </div>
          )}
        </div>

        <Alert>
          <Lightbulb className="h-4 w-4" />
          <AlertDescription>
            <strong>Pro Tip:</strong> For best results, include property addresses, financial details, equipment lists, 
            lease terms, and any specific business information. The AI will automatically detect and categorize this information.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};
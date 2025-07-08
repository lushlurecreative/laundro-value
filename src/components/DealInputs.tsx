import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useDeal } from '@/contexts/DealContext';
import { formatCurrency } from '@/utils/calculations';
import { CurrencyInput } from '@/components/ui/currency-input';
import { useOpenAIAnalysis } from '@/hooks/useOpenAIAnalysis';
import { Plus, X } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export const DealInputs: React.FC = () => {
  const {
    deal,
    leaseDetails,
    expenseItems,
    machineInventory,
    ancillaryIncome,
    utilityAnalysis,
    updateDeal,
    updateLeaseDetails,
    updateExpenseItem,
    addExpenseItem,
    removeExpenseItem,
    addMachine,
    updateMachine,
    removeMachine,
    updateAncillaryIncome,
    updateUtilityAnalysis
  } = useDeal();

  const { analyzeText, isAnalyzing } = useOpenAIAnalysis({
    onFieldsPopulated: (fields) => {
      console.log('AI Analysis Fields:', fields);
      
      // Update deal fields based on AI analysis
      const dealUpdates: any = {};
      const leaseUpdates: any = {};
      const ancillaryUpdates: any = {};
      
      // Basic deal fields
      if (fields.price) dealUpdates.askingPrice = fields.price;
      if (fields.income) dealUpdates.grossIncomeAnnual = fields.income;
      if (fields.size) dealUpdates.facilitySizeSqft = fields.size;
      if (fields.machines) dealUpdates.numberOfMachines = fields.machines;
      if (fields.hours) dealUpdates.ownerWeeklyHours = fields.hours;
      if (fields.rent) leaseUpdates.monthlyRent = fields.rent;
      
      // Lease details
      if (fields.lease) {
        if (fields.lease.monthlyRent) leaseUpdates.monthlyRent = fields.lease.monthlyRent;
        if (fields.lease.leaseTerm) leaseUpdates.remainingLeaseTermYears = fields.lease.leaseTerm;
        if (fields.lease.renewalOptions) leaseUpdates.renewalOptionsCount = fields.lease.renewalOptions;
        if (fields.lease.leaseType) leaseUpdates.leaseType = fields.lease.leaseType;
      }
      
      // Expense fields with improved mapping
      if (fields.expenses) {
        Object.entries(fields.expenses).forEach(([expenseKey, value]) => {
          const expenseMapping: Record<string, string> = {
            rent: 'Rent',
            water: 'Water/Sewer',
            gas: 'Gas',
            electricity: 'Electricity',
            insurance: 'Insurance',
            maintenance: 'Maintenance',
            supplies: 'Supplies',
            staff: 'Staff Salaries',
            other: 'Marketing'
          };
          
          const expenseName = expenseMapping[expenseKey];
          if (expenseName && typeof value === 'number' && value > 0) {
            const existingExpense = expenseItems.find(exp => exp.expenseName === expenseName);
            if (existingExpense) {
              updateExpenseItem(existingExpense.expenseId, { amountAnnual: value });
            }
          }
        });
      }
      
      // Equipment inventory auto-population
      if (fields.equipment && (fields.equipment.washers > 0 || fields.equipment.dryers > 0)) {
        // Add washers
        if (fields.equipment.washers > 0) {
          for (let i = 0; i < fields.equipment.washers; i++) {
            addMachine({
              machineId: `machine-washer-${Date.now()}-${i}`,
              dealId: deal?.dealId || 'deal-1',
              machineType: 'Front-Load Washer',
              brand: '',
              model: '',
              quantity: 1,
              ageYears: fields.equipment.avgAge || 0,
              capacityLbs: 35,
              vendPricePerUse: 2.50,
              conditionRating: fields.equipment.avgCondition || 3,
              waterConsumptionGalPerCycle: 40,
              electricConsumptionKwh: 0,
              gasConsumptionBtu: 0,
              purchaseValue: 0,
              currentValue: 0,
              maintenanceCostAnnual: 0,
              isCardOperated: false,
              isCoinOperated: true,
              isOutOfOrder: false
            });
          }
        }
        
        // Add dryers
        if (fields.equipment.dryers > 0) {
          for (let i = 0; i < fields.equipment.dryers; i++) {
            addMachine({
              machineId: `machine-dryer-${Date.now()}-${i}`,
              dealId: deal?.dealId || 'deal-1',
              machineType: 'Single Dryer',
              brand: '',
              model: '',
              quantity: 1,
              ageYears: fields.equipment.avgAge || 0,
              capacityLbs: 35,
              vendPricePerUse: 2.00,
              conditionRating: fields.equipment.avgCondition || 3,
              waterConsumptionGalPerCycle: 0,
              electricConsumptionKwh: 2.5,
              gasConsumptionBtu: 0,
              purchaseValue: 0,
              currentValue: 0,
              maintenanceCostAnnual: 0,
              isCardOperated: false,
              isCoinOperated: true,
              isOutOfOrder: false
            });
          }
        }
      }
      
      // Ancillary income
      if (fields.ancillary) {
        if (fields.ancillary.vending) ancillaryUpdates.vendingIncomeAnnual = fields.ancillary.vending;
        if (fields.ancillary.other) ancillaryUpdates.otherIncomeAnnual = fields.ancillary.other;
        if (fields.ancillary.wdf) {
          ancillaryUpdates.isWDFActive = fields.ancillary.wdf.active || false;
          if (fields.ancillary.wdf.pricePerLb) ancillaryUpdates.wdfPricePerLb = fields.ancillary.wdf.pricePerLb;
          if (fields.ancillary.wdf.volumeWeekly) ancillaryUpdates.wdfVolumeLbsPerWeek = fields.ancillary.wdf.volumeWeekly;
        }
      }
      
      // Apply updates
      if (Object.keys(dealUpdates).length > 0) updateDeal(dealUpdates);
      if (Object.keys(leaseUpdates).length > 0) updateLeaseDetails(leaseUpdates);
      if (Object.keys(ancillaryUpdates).length > 0) updateAncillaryIncome(ancillaryUpdates);
    }
  });

  const [activeTab, setActiveTab] = useState('property');

  const financingPresets = [
    {
      name: 'SBA 7(a) Loan',
      downPayment: 10,
      interestRate: 7.5,
      termYears: 10,
      loanType: 'SBA 7(a)'
    },
    {
      name: 'SBA 504 Loan',
      downPayment: 10,
      interestRate: 6.5,
      termYears: 20,
      loanType: 'SBA 504'
    },
    {
      name: 'Conventional Bank',
      downPayment: 25,
      interestRate: 8.0,
      termYears: 10,
      loanType: 'Conventional'
    },
    {
      name: 'Portfolio Lender',
      downPayment: 20,
      interestRate: 7.75,
      termYears: 15,
      loanType: 'Portfolio'
    },
    {
      name: 'Equipment Financing',
      downPayment: 15,
      interestRate: 9.0,
      termYears: 7,
      loanType: 'Equipment'
    },
    {
      name: 'Seller Financing',
      downPayment: 15,
      interestRate: 6.0,
      termYears: 15,
      loanType: 'Seller'
    }
  ];

  const handleFinancingPreset = (preset: typeof financingPresets[0]) => {
    updateDeal({
      downPaymentPercent: preset.downPayment,
      loanInterestRatePercent: preset.interestRate,
      loanTermYears: preset.termYears,
      loanType: preset.loanType
    });
  };

  const addNewExpense = () => {
    const newExpense = {
      expenseId: `expense-${Date.now()}`,
      dealId: deal?.dealId || 'deal-1',
      expenseName: 'New Expense',
      amountAnnual: 0,
      expenseType: 'Variable' as const
    };
    addExpenseItem(newExpense);
  };

  const addNewMachine = () => {
    const newMachine = {
      machineId: `machine-${Date.now()}`,
      dealId: deal?.dealId || 'deal-1',
      machineType: 'Top-Load Washer' as const,
      brand: '',
      model: '',
      quantity: 1,
      ageYears: 0,
      capacityLbs: 35,
      vendPricePerUse: 2.50,
      conditionRating: 3,
      waterConsumptionGalPerCycle: 40,
      electricConsumptionKwh: 0,
      gasConsumptionBtu: 0,
      purchaseValue: 0,
      currentValue: 0,
      maintenanceCostAnnual: 0,
      isCardOperated: false,
      isCoinOperated: true,
      isOutOfOrder: false
    };
    addMachine(newMachine);
  };

  const addValueAddedService = () => {
    const currentServices = deal?.valueAddedServices || [];
    const newService = {
      description: '',
      potentialRevenue: 0
    };
    updateDeal({
      valueAddedServices: [...currentServices, newService]
    });
  };

  const updateValueAddedService = (index: number, field: 'description' | 'potentialRevenue', value: string | number) => {
    const currentServices = deal?.valueAddedServices || [];
    const updatedServices = currentServices.map((service, i) => 
      i === index ? { ...service, [field]: value } : service
    );
    updateDeal({ valueAddedServices: updatedServices });
  };

  const removeValueAddedService = (index: number) => {
    const currentServices = deal?.valueAddedServices || [];
    const updatedServices = currentServices.filter((_, i) => i !== index);
    updateDeal({ valueAddedServices: updatedServices });
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold">Deal Inputs</h2>
          <p className="text-muted-foreground">
            Enter information if known, otherwise estimate or leave blank. Required fields: Deal Name*, Property Address*, Asking Price*
          </p>
          <div className="mt-3 p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              📋 <strong>Key Instructions:</strong> Leave fields blank or enter 0 if unknown. The app will auto-calculate metrics and analyze market data based on the property address you enter.
            </p>
          </div>
        </div>

      <Card className="shadow-elegant">
        <Tabs value={activeTab} onValueChange={(value) => {
          // Skip lease tab if real estate is included
          if (value === 'lease' && deal?.isRealEstateIncluded) {
            return;
          }
          setActiveTab(value);
        }}>
          <TabsList className={`grid w-full ${deal?.isRealEstateIncluded ? 'grid-cols-6' : 'grid-cols-7'}`}>
            <TabsTrigger value="property">Property & Deal</TabsTrigger>
            {!deal?.isRealEstateIncluded && (
              <TabsTrigger value="lease">Lease</TabsTrigger>
            )}
            <TabsTrigger value="income">Income</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="equipment">Equipment</TabsTrigger>
            <TabsTrigger value="growth">Growth Assumptions</TabsTrigger>
            <TabsTrigger value="financing">Financing & Goals</TabsTrigger>
          </TabsList>

          <TabsContent value="property" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Property & Deal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dealName">Deal Name *</Label>
                    <Input
                      id="dealName"
                      value={deal?.dealName || ''}
                      onChange={(e) => updateDeal({ dealName: e.target.value })}
                      placeholder="e.g., 123 Main St Laundromat"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="propertyAddress">Property Address *</Label>
                    <Input
                      id="propertyAddress"
                      value={deal?.propertyAddress || ''}
                      onChange={(e) => updateDeal({ propertyAddress: e.target.value })}
                      placeholder="Full property address"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="askingPrice">Asking Price *</Label>
                     <CurrencyInput
                       id="askingPrice"
                       value={deal?.askingPrice || 0}
                       onChange={(value) => updateDeal({ askingPrice: value })}
                       placeholder="Purchase price"
                       required
                     />
                  </div>
                  <div>
                    <Label htmlFor="facilitySizeSqft">Facility Size (sq ft)</Label>
                     <Input
                       id="facilitySizeSqft"
                       type="number"
                       min="0"
                       value={deal?.facilitySizeSqft === 0 ? '' : deal?.facilitySizeSqft || ''}
                       onChange={(e) => updateDeal({ facilitySizeSqft: Number(e.target.value) || 0 })}
                       placeholder="Square footage"
                     />
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <Switch
                      id="isRealEstateIncluded"
                      checked={deal?.isRealEstateIncluded || false}
                      onCheckedChange={(checked) => {
                        updateDeal({ isRealEstateIncluded: checked });
                        // Switch to a different tab if currently on lease tab
                        if (checked && activeTab === 'lease') {
                          setActiveTab('property');
                        }
                      }}
                    />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Label htmlFor="isRealEstateIncluded" className="cursor-help">
                          Real Estate Included
                        </Label>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Check this if you're purchasing the real estate along with the business. When enabled, lease details become unnecessary.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ownerWeeklyHours">Owner Weekly Hours</Label>
                       <Input
                         id="ownerWeeklyHours"
                         type="number"
                         min="0"
                         max="168"
                         value={deal?.ownerWeeklyHours === 0 ? '' : deal?.ownerWeeklyHours || ''}
                         onChange={(e) => updateDeal({ ownerWeeklyHours: Number(e.target.value) || 0 })}
                         placeholder="Hours per week"
                       />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Notes & Observations</Label>
                  <Textarea
                    id="notes"
                    value={deal?.notes || ''}
                    onChange={(e) => updateDeal({ notes: e.target.value })}
                    placeholder="🤖 COMPREHENSIVE AI AUTO-FILL: Paste ANY and ALL deal information here (lease agreements, financial statements, property listings, notes, etc.) and our AI will automatically populate ALL relevant fields throughout the entire app including property details, lease terms, income, expenses, equipment details, and more..."
                    rows={4}
                  />
                  {deal?.notes && deal.notes.trim().length > 0 && (
                    <Button
                      onClick={() => analyzeText(deal.notes)}
                      disabled={isAnalyzing}
                      variant="default"
                      className="w-full mt-2 bg-gradient-primary shadow-button"
                    >
                      {isAnalyzing ? '🔄 Analyzing & Auto-Filling Fields...' : '🤖 Auto-Fill ALL Fields from Deal Information'}
                    </Button>
                  )}
                  <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">
                      <strong>💡 AI AUTO-FILL INSTRUCTIONS:</strong><br/>
                      • Paste deal listings, financial statements, lease agreements, broker packages, etc.<br/>
                      • AI will extract and populate: property details, lease terms, income/expenses, equipment info<br/>
                      • Works with ANY text format - the more detail you provide, the better the results<br/>
                      • Review and adjust auto-filled values as needed
                    </p>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button 
                    onClick={() => setActiveTab(deal?.isRealEstateIncluded ? 'income' : 'lease')}
                    className="bg-success hover:bg-success/90"
                  >
                    {deal?.isRealEstateIncluded ? 'Next: Income Information' : 'Next: Lease Information'}
                  </Button>
                </div>

              </CardContent>
            </Card>
          </TabsContent>

          {!deal?.isRealEstateIncluded && (
            <TabsContent value="lease" className="mt-6">
                <Card>
                <CardHeader>
                  <CardTitle>Lease Information</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Enter lease terms and conditions for the property rental
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="monthlyRent">Monthly Rent</Label>
                      <CurrencyInput
                        id="monthlyRent"
                        value={leaseDetails?.monthlyRent || 0}
                        onChange={(value) => updateLeaseDetails({ monthlyRent: value })}
                        placeholder="Monthly rent amount"
                      />
                    </div>
                    <div>
                      <Label htmlFor="annualRentIncrease">Annual Rent Increase (%)</Label>
                      <Input
                        id="annualRentIncrease"
                        type="number"
                        step="0.1"
                        value={leaseDetails?.annualRentIncreasePercent || ''}
                        onChange={(e) => updateLeaseDetails({ annualRentIncreasePercent: Number(e.target.value) })}
                        placeholder="3.0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="camCost">CAM Cost (Annual)</Label>
                      <CurrencyInput
                        id="camCost"
                        value={leaseDetails?.camCostAnnual || 0}
                        onChange={(value) => updateLeaseDetails({ camCostAnnual: value })}
                        placeholder="Common area maintenance"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="remainingLeaseTerm">Remaining Lease Term (Years)</Label>
                      <Input
                        id="remainingLeaseTerm"
                        type="number"
                        value={leaseDetails?.remainingLeaseTermYears || ''}
                        onChange={(e) => updateLeaseDetails({ remainingLeaseTermYears: Number(e.target.value) })}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="renewalOptionsCount">Renewal Options Count</Label>
                      <Input
                        id="renewalOptionsCount"
                        type="number"
                        value={leaseDetails?.renewalOptionsCount || ''}
                        onChange={(e) => updateLeaseDetails({ renewalOptionsCount: Number(e.target.value) })}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="renewalOptionLength">Renewal Option Length (Years)</Label>
                      <Input
                        id="renewalOptionLength"
                        type="number"
                        value={leaseDetails?.renewalOptionLengthYears || ''}
                        onChange={(e) => updateLeaseDetails({ renewalOptionLengthYears: Number(e.target.value) })}
                        placeholder="5"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="leaseType">Lease Type</Label>
                    <Select
                      value={leaseDetails?.leaseType || 'Triple Net (NNN)'}
                      onValueChange={(value) => updateLeaseDetails({ leaseType: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Triple Net (NNN)">Triple Net (NNN)</SelectItem>
                        <SelectItem value="Modified Gross">Modified Gross</SelectItem>
                        <SelectItem value="Gross Lease">Gross Lease</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="leaseHistory">Additional Lease Information (Optional)</Label>
                    <Textarea
                      id="leaseHistory"
                      value={deal?.leaseHistory || ''}
                      onChange={(e) => updateDeal({ leaseHistory: e.target.value })}
                      placeholder="Additional lease details or supplementary information (Note: Main AI analysis is done in the Notes & Observations section)"
                      rows={2}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      💡 For comprehensive auto-fill, use the "Notes & Observations" section in Property & Deal tab
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex justify-end pt-4">
                <Button 
                  onClick={() => setActiveTab('income')}
                  className="bg-success hover:bg-success/90"
                >
                  Next: Income Information
                </Button>
              </div>
              {deal?.dealName && deal?.propertyAddress && deal?.askingPrice && (
                <div className="flex justify-end mt-6">
                  <Button 
                    onClick={() => setActiveTab(!deal?.isRealEstateIncluded ? 'lease' : 'income')}
                    className="bg-success hover:bg-success/90 text-success-foreground"
                  >
                    Next: {!deal?.isRealEstateIncluded ? 'Lease Details' : 'Income Information'} →
                  </Button>
                </div>
              )}
            </TabsContent>
          )}

          {!deal?.isRealEstateIncluded && (
            <TabsContent value="lease" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Lease Details</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Enter lease terms and conditions for the property rental
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="monthlyRent">Monthly Rent</Label>
                      <CurrencyInput
                        id="monthlyRent"
                        value={leaseDetails?.monthlyRent || 0}
                        onChange={(value) => updateLeaseDetails({ monthlyRent: value })}
                        placeholder="Monthly rent amount"
                      />
                    </div>
                    <div>
                      <Label htmlFor="annualRentIncrease">Annual Rent Increase (%)</Label>
                      <Input
                        id="annualRentIncrease"
                        type="number"
                        step="0.1"
                        min="0"
                        value={leaseDetails?.annualRentIncreasePercent === 0 ? '' : leaseDetails?.annualRentIncreasePercent || ''}
                        onChange={(e) => updateLeaseDetails({ annualRentIncreasePercent: Number(e.target.value) || 0 })}
                        placeholder="3.0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="camCost">CAM Cost (Annual)</Label>
                      <CurrencyInput
                        id="camCost"
                        value={leaseDetails?.camCostAnnual || 0}
                        onChange={(value) => updateLeaseDetails({ camCostAnnual: value })}
                        placeholder="Common area maintenance"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="remainingLeaseTerm">Remaining Lease Term (Years)</Label>
                      <Input
                        id="remainingLeaseTerm"
                        type="number"
                        min="0"
                        value={leaseDetails?.remainingLeaseTermYears === 0 ? '' : leaseDetails?.remainingLeaseTermYears || ''}
                        onChange={(e) => updateLeaseDetails({ remainingLeaseTermYears: Number(e.target.value) || 0 })}
                        placeholder="Years remaining"
                      />
                    </div>
                    <div>
                      <Label htmlFor="renewalOptionsCount">Renewal Options Count</Label>
                      <Input
                        id="renewalOptionsCount"
                        type="number"
                        min="0"
                        value={leaseDetails?.renewalOptionsCount === 0 ? '' : leaseDetails?.renewalOptionsCount || ''}
                        onChange={(e) => updateLeaseDetails({ renewalOptionsCount: Number(e.target.value) || 0 })}
                        placeholder="Number of renewals"
                      />
                    </div>
                    <div>
                      <Label htmlFor="renewalOptionLength">Renewal Option Length (Years)</Label>
                      <Input
                        id="renewalOptionLength"
                        type="number"
                        min="0"
                        value={leaseDetails?.renewalOptionLengthYears === 0 ? '' : leaseDetails?.renewalOptionLengthYears || ''}
                        onChange={(e) => updateLeaseDetails({ renewalOptionLengthYears: Number(e.target.value) || 0 })}
                        placeholder="5"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="leaseInformation">Lease Information</Label>
                    <Textarea
                      id="leaseInformation"
                      value={deal?.leaseHistory || ''}
                      onChange={(e) => updateDeal({ leaseHistory: e.target.value })}
                      placeholder="Paste lease information here and our AI will auto-populate relevant fields..."
                      rows={4}
                    />
                    {deal?.leaseHistory && deal.leaseHistory.trim().length > 0 && (
                      <Button
                        onClick={() => analyzeText(deal.leaseHistory, 'lease')}
                        disabled={isAnalyzing}
                        variant="outline"
                        className="w-full mt-2"
                      >
                        {isAnalyzing ? 'Analyzing...' : '🤖 Auto-Fill Lease Fields'}
                      </Button>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      💡 Paste lease information and click analyze to auto-populate fields
                    </p>
                  </div>

              <div className="flex justify-end pt-4">
                <Button 
                  onClick={() => setActiveTab('expenses')}
                  className="bg-success hover:bg-success/90"
                >
                  Next: Expenses Information
                </Button>
              </div>
                  
                  <div>
                    <Label htmlFor="leaseHistory">Lease Information</Label>
                    <Textarea
                      id="leaseHistory"
                      value={deal?.leaseHistory || ''}
                      onChange={(e) => updateDeal({ leaseHistory: e.target.value })}
                      placeholder="Paste lease information here - our AI will auto-populate relevant fields..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
              
              {/* Next Button */}
              <div className="flex justify-end mt-6">
                <Button 
                  onClick={() => setActiveTab('income')}
                  className="bg-success hover:bg-success/90 text-success-foreground"
                >
                  Next: Income Information →
                </Button>
              </div>
            </TabsContent>
          )}

          <TabsContent value="income" className="mt-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Annual Income</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="grossIncomeAnnual">Gross Income</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <span className="text-xs bg-muted px-2 py-1 rounded cursor-help">?</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Total annual revenue from all machines and services before any expenses</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <CurrencyInput
                      id="grossIncomeAnnual"
                      value={deal?.grossIncomeAnnual || 0}
                      onChange={(value) => updateDeal({ grossIncomeAnnual: value })}
                      placeholder="Annual gross income"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="annualNet">Annual Net</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <span className="text-xs bg-muted px-2 py-1 rounded cursor-help">?</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Net income after operating expenses but before debt service and taxes</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      id="annualNet"
                      type="number"
                      min="0"
                      value={deal?.annualNet === 0 ? '' : deal?.annualNet || ''}
                      onChange={(e) => updateDeal({ annualNet: Number(e.target.value) || 0 })}
                      placeholder="Auto-calculated from income/expenses"
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor="fullTimeStaffCount">Full-Time Staff Count</Label>
                        <Tooltip>
                          <TooltipTrigger>
                            <span className="text-xs bg-muted px-2 py-1 rounded cursor-help">?</span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Number of full-time employees currently working at the laundromat</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                       <Input
                         id="fullTimeStaffCount"
                         type="number"
                         min="0"
                         value={deal?.fullTimeStaffCount === 0 ? '' : deal?.fullTimeStaffCount || ''}
                         onChange={(e) => updateDeal({ fullTimeStaffCount: Number(e.target.value) || 0 })}
                         placeholder="Number of full-time staff"
                       />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor="partTimeStaffCount">Part-Time Staff Count</Label>
                        <Tooltip>
                          <TooltipTrigger>
                            <span className="text-xs bg-muted px-2 py-1 rounded cursor-help">?</span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Number of part-time employees currently working at the laundromat</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                       <Input
                         id="partTimeStaffCount"
                         type="number"
                         min="0"
                         value={deal?.partTimeStaffCount === 0 ? '' : deal?.partTimeStaffCount || ''}
                         onChange={(e) => updateDeal({ partTimeStaffCount: Number(e.target.value) || 0 })}
                         placeholder="Number of part-time staff"
                       />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor="payrollCost">Payroll Cost (Annual)</Label>
                        <Tooltip>
                          <TooltipTrigger>
                            <span className="text-xs bg-muted px-2 py-1 rounded cursor-help">?</span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Total annual payroll expenses including wages, benefits, and taxes</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                       <Input
                         id="payrollCost"
                         type="number"
                         min="0"
                         value={deal?.payrollCost === 0 ? '' : deal?.payrollCost || ''}
                         onChange={(e) => updateDeal({ payrollCost: Number(e.target.value) || 0 })}
                         placeholder="Annual payroll costs"
                       />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ancillary Income</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isWDFActive"
                      checked={ancillaryIncome?.isWDFActive || false}
                      onCheckedChange={(checked) => updateAncillaryIncome({ isWDFActive: checked })}
                    />
                    <Label htmlFor="isWDFActive">Wash-Dry-Fold Service Active</Label>
                  </div>

                  {ancillaryIncome?.isWDFActive && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="wdfPrice">WDF Price per Lb</Label>
                           <CurrencyInput
                              id="wdfPrice"
                              value={ancillaryIncome?.wdfPricePerLb || 0}
                              onChange={(value) => updateAncillaryIncome({ wdfPricePerLb: value })}
                              placeholder="Price per pound"
                            />
                        </div>
                        <div>
                          <Label htmlFor="wdfVolume">WDF Volume (Lbs per Week)</Label>
                           <Input
                             id="wdfVolume"
                             type="number"
                             min="0"
                             value={ancillaryIncome?.wdfVolumeLbsPerWeek === 0 ? '' : ancillaryIncome?.wdfVolumeLbsPerWeek || ''}
                             onChange={(e) => updateAncillaryIncome({ wdfVolumeLbsPerWeek: Number(e.target.value) || 0 })}
                             placeholder="Pounds per week"
                           />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="wdfProcessStatus">WDF Process Status</Label>
                        <Select
                          value={ancillaryIncome?.wdfProcessStatus || ''}
                          onValueChange={(value) => updateAncillaryIncome({ wdfProcessStatus: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Planning">Planning</SelectItem>
                            <SelectItem value="Setup">Setup</SelectItem>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Expanding">Expanding</SelectItem>
                            <SelectItem value="Paused">Paused</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}


                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor="vendingIncome">Vending Income (Annual)</Label>
                        <Tooltip>
                          <TooltipTrigger>
                            <span className="text-xs bg-muted px-2 py-1 rounded cursor-help">?</span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Annual revenue from vending machines (snacks, drinks, detergent, etc.)</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                       <CurrencyInput
                          id="vendingIncome"
                          value={ancillaryIncome?.vendingIncomeAnnual || 0}
                          onChange={(value) => updateAncillaryIncome({ vendingIncomeAnnual: value })}
                          placeholder="Annual vending revenue"
                        />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor="otherIncome">Other Income (Annual)</Label>
                        <Tooltip>
                          <TooltipTrigger>
                            <span className="text-xs bg-muted px-2 py-1 rounded cursor-help">?</span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Any other sources of annual income (drop-off fees, bulk contracts, etc.)</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                       <CurrencyInput
                          id="otherIncome"
                          value={ancillaryIncome?.otherIncomeAnnual || 0}
                          onChange={(value) => updateAncillaryIncome({ otherIncomeAnnual: value })}
                          placeholder="Other income sources"
                        />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CardTitle>Value-Added Services</CardTitle>
                    <Tooltip>
                      <TooltipTrigger>
                        <span className="text-xs bg-muted px-2 py-1 rounded">?</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Additional services that can increase revenue and customer retention while differentiating your business from competitors.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Add services that generate additional revenue beyond basic laundry operations
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(deal?.valueAddedServices || []).map((service, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end p-4 border rounded-lg">
                      <div>
                        <Label>Service Description</Label>
                        <Input
                          value={service.description}
                          onChange={(e) => updateValueAddedService(index, 'description', e.target.value)}
                          placeholder="e.g., Coffee vending machine"
                        />
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <Label>Annual Revenue Potential</Label>
                          <Input
                            type="number"
                            min="0"
                            value={service.potentialRevenue === 0 ? '' : service.potentialRevenue}
                            onChange={(e) => updateValueAddedService(index, 'potentialRevenue', Number(e.target.value) || 0)}
                            placeholder="Expected annual revenue"
                          />
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeValueAddedService(index)}
                          className="mt-6"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  <Button onClick={addValueAddedService} variant="outline" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Value-Added Service
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CardTitle>Utility Analysis</CardTitle>
                    <Tooltip>
                      <TooltipTrigger>
                        <span className="text-xs bg-muted px-2 py-1 rounded">?</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Analyze utility costs by comparing actual collection amounts with utility bills. This helps verify the accuracy of income statements and identify potential cost-saving opportunities.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Verify income accuracy by analyzing utility consumption patterns
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="collectionPeriod">Collection Period (Weeks)</Label>
                       <Input
                         id="collectionPeriod"
                         type="number"
                         min="0"
                         value={utilityAnalysis?.collectionPeriodWeeks === 0 ? '' : utilityAnalysis?.collectionPeriodWeeks || ''}
                         onChange={(e) => updateUtilityAnalysis({ collectionPeriodWeeks: Number(e.target.value) || 0 })}
                         placeholder="Number of weeks"
                       />
                    </div>
                    <div>
                      <Label htmlFor="totalCollected">Total Collected Amount</Label>
                       <Input
                         id="totalCollected"
                         type="number"
                         min="0"
                         value={utilityAnalysis?.totalCollectedAmount === 0 ? '' : utilityAnalysis?.totalCollectedAmount || ''}
                         onChange={(e) => updateUtilityAnalysis({ totalCollectedAmount: Number(e.target.value) || 0 })}
                         placeholder="Total dollar amount"
                       />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="waterBillGallons">Water Bill Total Gallons</Label>
                      <Input
                        id="waterBillGallons"
                        type="number"
                        value={utilityAnalysis?.waterBillTotalGallons || ''}
                        onChange={(e) => updateUtilityAnalysis({ waterBillTotalGallons: Number(e.target.value) })}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="waterBillPeriod">Water Bill Period (Months)</Label>
                      <Input
                        id="waterBillPeriod"
                        type="number"
                        value={utilityAnalysis?.waterBillPeriodMonths || ''}
                        onChange={(e) => updateUtilityAnalysis({ waterBillPeriodMonths: Number(e.target.value) })}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="waterSewerCost">Water/Sewer Cost per Gallon</Label>
                      <Input
                        id="waterSewerCost"
                        type="number"
                        step="0.001"
                        value={utilityAnalysis?.waterSewerCostPerGallon || ''}
                        onChange={(e) => updateUtilityAnalysis({ waterSewerCostPerGallon: Number(e.target.value) })}
                        placeholder="0.000"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="analysisNotes">Analysis Notes</Label>
                    <Textarea
                      id="analysisNotes"
                      value={utilityAnalysis?.notes || ''}
                      onChange={(e) => updateUtilityAnalysis({ notes: e.target.value })}
                      placeholder="Notes about utility analysis..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="flex justify-end pt-4">
              <Button 
                onClick={() => setActiveTab('expenses')}
                className="bg-success hover:bg-success/90"
              >
                Next: Operating Expenses
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="expenses" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Operating Expenses</CardTitle>
                <Button onClick={addNewExpense} size="sm" className="shadow-button">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Expense
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {expenseItems.map((expense) => (
                    <div key={expense.expenseId} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end p-4 border rounded-lg">
                      <div>
                        <Label>Expense Name</Label>
                        <Input
                          value={expense.expenseName}
                          onChange={(e) => updateExpenseItem(expense.expenseId, { expenseName: e.target.value })}
                          placeholder="Expense name"
                        />
                      </div>
                      <div>
                        <Label>Annual Amount</Label>
                        <Input
                          type="number"
                          value={expense.amountAnnual}
                          onChange={(e) => updateExpenseItem(expense.expenseId, { amountAnnual: Number(e.target.value) })}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label>Type</Label>
                        <Select
                          value={expense.expenseType}
                          onValueChange={(value) => updateExpenseItem(expense.expenseId, { expenseType: value as any })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Fixed">Fixed</SelectItem>
                            <SelectItem value="Variable">Variable</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeExpenseItem(expense.expenseId)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-gradient-subtle rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total Annual Expenses:</span>
                    <span className="text-lg font-bold">
                      {formatCurrency(expenseItems.reduce((sum, expense) => sum + expense.amountAnnual, 0))}
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-end pt-4">
                  <Button 
                    onClick={() => setActiveTab('equipment')}
                    className="bg-success hover:bg-success/90"
                  >
                    Next: Equipment Inventory
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="equipment" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle>Equipment Inventory</CardTitle>
                    <Tooltip>
                      <TooltipTrigger>
                        <span className="text-xs bg-muted px-2 py-1 rounded cursor-help">?</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Complete inventory of all washing machines, dryers, and other equipment including condition and specifications</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Button onClick={addNewMachine} size="sm" className="shadow-button">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Machine
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {machineInventory.map((machine) => (
                    <div key={machine.machineId} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center mb-4">
                        <Badge variant="outline">{machine.machineType}</Badge>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeMachine(machine.machineId)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Label>Machine Type</Label>
                        <Tooltip>
                          <TooltipTrigger>
                            <span className="text-xs bg-muted px-1 py-0.5 rounded cursor-help">?</span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Type of laundry equipment (washers, dryers, or combination units)</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Select
                        value={machine.machineType}
                        onValueChange={(value) => updateMachine(machine.machineId, { machineType: value as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Top-Load Washer">Top-Load Washer</SelectItem>
                          <SelectItem value="Front-Load Washer">Front-Load Washer</SelectItem>
                          <SelectItem value="Stacked Washer/Dryer">Stacked Washer/Dryer</SelectItem>
                          <SelectItem value="Single Dryer">Single Dryer</SelectItem>
                          <SelectItem value="Stacked Dryer">Stacked Dryer</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                        <div>
                          <Label>Brand</Label>
                          <Input
                            value={machine.brand}
                            onChange={(e) => updateMachine(machine.machineId, { brand: e.target.value })}
                            placeholder="Brand name"
                          />
                        </div>
                        <div>
                          <Label>Model</Label>
                          <Input
                            value={machine.model || ''}
                            onChange={(e) => updateMachine(machine.machineId, { model: e.target.value })}
                            placeholder="Model number"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                        <div>
                          <Label>Quantity</Label>
                          <Input
                            type="number"
                            value={machine.quantity}
                            onChange={(e) => updateMachine(machine.machineId, { quantity: Number(e.target.value) })}
                            placeholder="1"
                          />
                        </div>
                        <div>
                          <Label>Age (Years)</Label>
                          <Input
                            type="number"
                            value={machine.ageYears}
                            onChange={(e) => updateMachine(machine.machineId, { ageYears: Number(e.target.value) })}
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <Label>Capacity (Lbs)</Label>
                          <Input
                            type="number"
                            value={machine.capacityLbs}
                            onChange={(e) => updateMachine(machine.machineId, { capacityLbs: Number(e.target.value) })}
                            placeholder="35"
                          />
                        </div>
                        <div>
                          <Label>Vend Price per Use</Label>
                          <Input
                            type="number"
                            step="0.25"
                            value={machine.vendPricePerUse}
                            onChange={(e) => updateMachine(machine.machineId, { vendPricePerUse: Number(e.target.value) })}
                            placeholder="2.50"
                          />
                        </div>
                        <div>
                          <Label>Condition (1-5)</Label>
                          <Input
                            type="number"
                            min="1"
                            max="5"
                            value={machine.conditionRating}
                            onChange={(e) => updateMachine(machine.machineId, { conditionRating: Number(e.target.value) })}
                            placeholder="3"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div>
                          <Label>Purchase Value</Label>
                          <Input
                            type="number"
                            value={machine.purchaseValue}
                            onChange={(e) => updateMachine(machine.machineId, { purchaseValue: Number(e.target.value) })}
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <Label>Current Value</Label>
                          <Input
                            type="number"
                            value={machine.currentValue}
                            onChange={(e) => updateMachine(machine.machineId, { currentValue: Number(e.target.value) })}
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <Label>Annual Maintenance Cost</Label>
                          <Input
                            type="number"
                            value={machine.maintenanceCostAnnual}
                            onChange={(e) => updateMachine(machine.machineId, { maintenanceCostAnnual: Number(e.target.value) })}
                            placeholder="0"
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-6 mt-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={machine.isCardOperated}
                            onCheckedChange={(checked) => updateMachine(machine.machineId, { isCardOperated: checked })}
                          />
                          <Label>Card Operated</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={machine.isCoinOperated}
                            onCheckedChange={(checked) => updateMachine(machine.machineId, { isCoinOperated: checked })}
                          />
                          <Label>Coin Operated</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={machine.isOutOfOrder}
                            onCheckedChange={(checked) => updateMachine(machine.machineId, { isOutOfOrder: checked })}
                          />
                          <Label>Out of Order</Label>
                        </div>
                      </div>

                      {machine.machineType.includes('Washer') && (
                        <div className="mt-4">
                          <Label>Water Consumption (Gallons per Cycle)</Label>
                          <Input
                            type="number"
                            value={machine.waterConsumptionGalPerCycle || ''}
                            onChange={(e) => updateMachine(machine.machineId, { waterConsumptionGalPerCycle: Number(e.target.value) })}
                            placeholder="40"
                            className="max-w-xs"
                          />
                        </div>
                      )}
                    </div>
                  ))}

                  {machineInventory.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No machines added yet. Click "Add Machine" to get started.</p>
                    </div>
                  )}
                </div>
                
                 <div className="flex justify-end pt-4">
                  <Button 
                    onClick={() => setActiveTab('growth')}
                    className="bg-success hover:bg-success/90"
                  >
                    Next: Growth Assumptions
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="growth" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Growth Assumptions</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Set annual growth rates for income and expenses used in 10-year projections
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <div className="flex items-start gap-2">
                    <span className="text-amber-600 dark:text-amber-400 font-semibold">⚠️ Important:</span>
                    <div className="text-sm text-amber-800 dark:text-amber-200">
                      <p className="font-medium">These growth rates directly impact your 10-year financial projections.</p>
                      <p className="mt-1">Business value increases come from your active improvements, not just time passing.</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Label htmlFor="incomeGrowthRate">Annual Income Growth Rate (%)</Label>
                        <Tooltip>
                          <TooltipTrigger>
                            <span className="text-xs bg-muted px-2 py-1 rounded cursor-help">?</span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Annual percentage increase in gross income. Consider inflation, market growth, and business improvements.</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Input
                        id="incomeGrowthRate"
                        type="number"
                        step="0.1"
                        min="-5"
                        max="15"
                        value={deal?.incomeGrowthRatePercent || ''}
                        onChange={(e) => updateDeal({ incomeGrowthRatePercent: Number(e.target.value) })}
                        placeholder="2.0"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Typical range: 0% to 5% annually. Higher rates require specific improvement plans.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Income Growth Scenarios:</h4>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div><strong>0-1%:</strong> Conservative, inflation-only</div>
                        <div><strong>2-3%:</strong> Market growth, minor improvements</div>
                        <div><strong>4-6%:</strong> Active management, new services</div>
                        <div><strong>7%+:</strong> Requires major business transformation</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Label htmlFor="expenseGrowthRate">Annual Expense Growth Rate (%)</Label>
                        <Tooltip>
                          <TooltipTrigger>
                            <span className="text-xs bg-muted px-2 py-1 rounded cursor-help">?</span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Annual percentage increase in operating expenses. Usually driven by inflation and labor costs.</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Input
                        id="expenseGrowthRate"
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={deal?.expenseGrowthRatePercent || ''}
                        onChange={(e) => updateDeal({ expenseGrowthRatePercent: Number(e.target.value) })}
                        placeholder="3.0"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Typical range: 2% to 4% annually, tracking with inflation and wage growth.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Expense Growth Factors:</h4>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div><strong>2-3%:</strong> General inflation</div>
                        <div><strong>3-4%:</strong> Inflation + labor cost increases</div>
                        <div><strong>4%+:</strong> High inflation periods, wage pressures</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    variant="outline" 
                    onClick={() => updateDeal({ incomeGrowthRatePercent: 1.0, expenseGrowthRatePercent: 2.5 })}
                    className="text-sm"
                  >
                    Conservative (1%/2.5%)
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => updateDeal({ incomeGrowthRatePercent: 2.5, expenseGrowthRatePercent: 3.0 })}
                    className="text-sm"
                  >
                    Moderate (2.5%/3%)
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => updateDeal({ incomeGrowthRatePercent: 4.0, expenseGrowthRatePercent: 3.5 })}
                    className="text-sm"
                  >
                    Aggressive (4%/3.5%)
                  </Button>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="text-sm">
                    <p className="font-medium text-blue-900 dark:text-blue-100 mb-2">💡 Growth Assumption Tips:</p>
                    <ul className="space-y-1 text-blue-800 dark:text-blue-200 text-xs">
                      <li>• Conservative projections help avoid overoptimistic valuations</li>
                      <li>• Income growth above 3% should be tied to specific improvement plans</li>
                      <li>• Consider local market conditions and competition</li>
                      <li>• Factor in your management experience and time commitment</li>
                    </ul>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <Button 
                    onClick={() => setActiveTab('equipment')}
                    variant="outline"
                  >
                    Back: Equipment
                  </Button>
                  <Button 
                    onClick={() => setActiveTab('financing')}
                    className="bg-success hover:bg-success/90"
                  >
                    Next: Financing & Goals
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financing" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Financing & Investment Goals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-wrap gap-2 justify-end">
                  {financingPresets.map((preset) => (
                    <Button 
                      key={preset.name}
                      onClick={() => handleFinancingPreset(preset)} 
                      variant="outline" 
                      size="sm"
                      className="shadow-button"
                    >
                      {preset.name}
                    </Button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="downPayment">Down Payment (%)</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <span className="text-xs bg-muted px-2 py-1 rounded cursor-help">?</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Percentage of purchase price you plan to pay as down payment</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      id="downPayment"
                      type="number"
                      step="0.1"
                      value={deal?.downPaymentPercent || ''}
                      onChange={(e) => updateDeal({ downPaymentPercent: Number(e.target.value) })}
                      placeholder="25.0"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="loanInterestRate">Loan Interest Rate (%)</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <span className="text-xs bg-muted px-2 py-1 rounded cursor-help">?</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Annual interest rate for your loan (SBA loans typically 7-11%)</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      id="loanInterestRate"
                      type="number"
                      step="0.1"
                      value={deal?.loanInterestRatePercent || ''}
                      onChange={(e) => updateDeal({ loanInterestRatePercent: Number(e.target.value) })}
                      placeholder="7.5"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="loanTerm">Loan Term (Years)</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <span className="text-xs bg-muted px-2 py-1 rounded cursor-help">?</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Length of loan in years (SBA loans typically 7-25 years)</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      id="loanTerm"
                      type="number"
                      value={deal?.loanTermYears || ''}
                      onChange={(e) => updateDeal({ loanTermYears: Number(e.target.value) })}
                      placeholder="10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="targetCapRate">Target Cap Rate (%)</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <span className="text-xs bg-muted px-2 py-1 rounded cursor-help">?</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Your minimum acceptable capitalization rate for this investment (typically 6-12% for laundromats)</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      id="targetCapRate"
                      type="number"
                      step="0.1"
                      value={deal?.targetCapRatePercent || ''}
                      onChange={(e) => updateDeal({ targetCapRatePercent: Number(e.target.value) })}
                      placeholder="8.0"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="targetCoCROI">Target Cash-on-Cash ROI (%)</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <span className="text-xs bg-muted px-2 py-1 rounded cursor-help">?</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Your minimum acceptable cash-on-cash return on investment (typically 12-20%)</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      id="targetCoCROI"
                      type="number"
                      step="0.1"
                      value={deal?.targetCoCROIPercent || ''}
                      onChange={(e) => updateDeal({ targetCoCROIPercent: Number(e.target.value) })}
                      placeholder="15.0"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end pt-4">
                  <Button 
                    onClick={() => {
                      // Navigate to analysis tab in main app
                      const event = new CustomEvent('navigateToAnalysis');
                      window.dispatchEvent(event);
                    }}
                    className="bg-success hover:bg-success/90"
                  >
                    Complete Setup - View Analysis
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </Card>
      </div>
    </TooltipProvider>
  );
};
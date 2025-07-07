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

  const [activeTab, setActiveTab] = useState('property');

  const handleSBAPreset = () => {
    updateDeal({
      downPaymentPercent: 10,
      loanInterestRatePercent: 7.5,
      loanTermYears: 10,
      loanType: 'SBA'
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

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold">Deal Inputs</h2>
          <p className="text-muted-foreground">
            Enter information if known, otherwise estimate or leave blank. Required fields: Deal Name*, Property Address*, Asking Price*
          </p>
        </div>

      <Card className="shadow-elegant">
        <Tabs value={activeTab} onValueChange={(value) => {
          // Skip lease tab if real estate is included
          if (value === 'lease' && deal?.isRealEstateIncluded) {
            return;
          }
          setActiveTab(value);
        }}>
          <TabsList className={`grid w-full ${deal?.isRealEstateIncluded ? 'grid-cols-5' : 'grid-cols-6'}`}>
            <TabsTrigger value="property">Property & Deal</TabsTrigger>
            {!deal?.isRealEstateIncluded && (
              <TabsTrigger value="lease">Lease</TabsTrigger>
            )}
            <TabsTrigger value="income">Income</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="equipment">Equipment</TabsTrigger>
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
                    <Input
                      id="askingPrice"
                      type="number"
                      value={deal?.askingPrice || ''}
                      onChange={(e) => updateDeal({ askingPrice: Number(e.target.value) })}
                      placeholder="0"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="facilitySizeSqft">Facility Size (sq ft)</Label>
                    <Input
                      id="facilitySizeSqft"
                      type="number"
                      value={deal?.facilitySizeSqft || ''}
                      onChange={(e) => updateDeal({ facilitySizeSqft: Number(e.target.value) })}
                      placeholder="0"
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
                      value={deal?.ownerWeeklyHours || ''}
                      onChange={(e) => updateDeal({ ownerWeeklyHours: Number(e.target.value) })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="replacementLaborCost">Replacement Labor Cost (Hourly)</Label>
                    <Input
                      id="replacementLaborCost"
                      type="number"
                      step="0.01"
                      value={deal?.replacementLaborCostHourly || ''}
                      onChange={(e) => updateDeal({ replacementLaborCostHourly: Number(e.target.value) })}
                      placeholder="15.00"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Notes & Observations</Label>
                  <Textarea
                    id="notes"
                    value={deal?.notes || ''}
                    onChange={(e) => updateDeal({ notes: e.target.value })}
                    placeholder="Additional notes about the deal, paste any information here and our AI will auto-populate relevant fields..."
                    rows={3}
                  />
                </div>

                <Card className="mt-6">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <CardTitle>Expansion Potential</CardTitle>
                      <Tooltip>
                        <TooltipTrigger>
                          <span className="text-xs bg-muted px-2 py-1 rounded">?</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Analyze physical space and infrastructure capacity for adding more equipment. This helps estimate future growth potential and required capital.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Analyze the potential for adding machines to grow revenue
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="additionalMachines">Additional Machines Possible</Label>
                        <Input
                          id="additionalMachines"
                          type="number"
                          value={deal?.expansionPotential?.additionalMachines || ''}
                          onChange={(e) => updateDeal({ 
                            expansionPotential: { 
                              ...deal?.expansionPotential, 
                              additionalMachines: Number(e.target.value) 
                            } 
                          })}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="expansionCost">Estimated Expansion Cost</Label>
                        <Input
                          id="expansionCost"
                          type="number"
                          value={deal?.expansionPotential?.expansionCost || ''}
                          onChange={(e) => updateDeal({ 
                            expansionPotential: { 
                              ...deal?.expansionPotential, 
                              expansionCost: Number(e.target.value) 
                            } 
                          })}
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>

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
                      <Input
                        id="monthlyRent"
                        type="number"
                        value={leaseDetails?.monthlyRent || ''}
                        onChange={(e) => updateLeaseDetails({ monthlyRent: Number(e.target.value) })}
                        placeholder="0"
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
                      <Input
                        id="camCost"
                        type="number"
                        value={leaseDetails?.camCostAnnual || ''}
                        onChange={(e) => updateLeaseDetails({ camCostAnnual: Number(e.target.value) })}
                        placeholder="0"
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
                    <Label htmlFor="leaseHistory">Lease History</Label>
                    <Textarea
                      id="leaseHistory"
                      value={deal?.leaseHistory || ''}
                      onChange={(e) => updateDeal({ leaseHistory: e.target.value })}
                      placeholder="Enter lease history and any relevant notes..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
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
                    <Input
                      id="grossIncomeAnnual"
                      type="number"
                      value={deal?.grossIncomeAnnual || ''}
                      onChange={(e) => updateDeal({ grossIncomeAnnual: Number(e.target.value) })}
                      placeholder="0"
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
                      value={deal?.annualNet || ''}
                      onChange={(e) => updateDeal({ annualNet: Number(e.target.value) })}
                      placeholder="0"
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
                        value={deal?.fullTimeStaffCount || ''}
                        onChange={(e) => updateDeal({ fullTimeStaffCount: Number(e.target.value) })}
                        placeholder="0"
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
                        value={deal?.partTimeStaffCount || ''}
                        onChange={(e) => updateDeal({ partTimeStaffCount: Number(e.target.value) })}
                        placeholder="0"
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
                        value={deal?.payrollCost || ''}
                        onChange={(e) => updateDeal({ payrollCost: Number(e.target.value) })}
                        placeholder="0"
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
                          <Input
                            id="wdfPrice"
                            type="number"
                            step="0.01"
                            value={ancillaryIncome?.wdfPricePerLb || ''}
                            onChange={(e) => updateAncillaryIncome({ wdfPricePerLb: Number(e.target.value) })}
                            placeholder="0.00"
                          />
                        </div>
                        <div>
                          <Label htmlFor="wdfVolume">WDF Volume (Lbs per Week)</Label>
                          <Input
                            id="wdfVolume"
                            type="number"
                            value={ancillaryIncome?.wdfVolumeLbsPerWeek || ''}
                            onChange={(e) => updateAncillaryIncome({ wdfVolumeLbsPerWeek: Number(e.target.value) })}
                            placeholder="0"
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
                      <Input
                        id="vendingIncome"
                        type="number"
                        value={ancillaryIncome?.vendingIncomeAnnual || ''}
                        onChange={(e) => updateAncillaryIncome({ vendingIncomeAnnual: Number(e.target.value) })}
                        placeholder="0"
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
                      <Input
                        id="otherIncome"
                        type="number"
                        value={ancillaryIncome?.otherIncomeAnnual || ''}
                        onChange={(e) => updateAncillaryIncome({ otherIncomeAnnual: Number(e.target.value) })}
                        placeholder="0"
                      />
                    </div>
                  </div>
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
                        value={utilityAnalysis?.collectionPeriodWeeks || ''}
                        onChange={(e) => updateUtilityAnalysis({ collectionPeriodWeeks: Number(e.target.value) })}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="totalCollected">Total Collected Amount</Label>
                      <Input
                        id="totalCollected"
                        type="number"
                        value={utilityAnalysis?.totalCollectedAmount || ''}
                        onChange={(e) => updateUtilityAnalysis({ totalCollectedAmount: Number(e.target.value) })}
                        placeholder="0"
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financing" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Financing & Investment Goals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-end">
                  <Button onClick={handleSBAPreset} variant="outline" className="shadow-button">
                    Apply SBA 7(a) Loan Preset
                  </Button>
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
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </Card>
      </div>
    </TooltipProvider>
  );
};
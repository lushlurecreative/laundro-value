import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { Deal, LeaseDetails, ExpenseItem, MachineInventory, AncillaryIncome, UtilityAnalysis } from '@/types/deal';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useMarketData } from '@/hooks/useMarketData';
import { DealContextType } from './types';
import { defaultExpenses } from './constants';

export const DealContext = createContext<DealContextType | undefined>(undefined);

export const DealProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [deal, setDeal] = useState<Deal | null>(null);
  const [leaseDetails, setLeaseDetails] = useState<LeaseDetails | null>(null);
  const [expenseItems, setExpenseItems] = useState<ExpenseItem[]>([]);
  const [machineInventory, setMachineInventory] = useState<MachineInventory[]>([]);
  const [ancillaryIncome, setAncillaryIncome] = useState<AncillaryIncome | null>(null);
  const [utilityAnalysis, setUtilityAnalysis] = useState<UtilityAnalysis | null>(null);
  const [lastSaved, setLastSaved] = useState<string>('');

  // Automatically fetch market data when property address changes
  const marketData = useMarketData(deal?.propertyAddress || '');

  // Auto-save all deal data to localStorage
  const dealData = {
    deal,
    leaseDetails,
    expenseItems,
    machineInventory,
    ancillaryIncome,
    utilityAnalysis
  };

  useAutoSave({
    data: dealData,
    onSave: (data) => {
      try {
        localStorage.setItem('laundromat-deal-data', JSON.stringify(data));
        setLastSaved(new Date().toLocaleTimeString());
      } catch (error) {
        console.error('Failed to save deal data:', error);
      }
    },
    delay: 2000 // Save after 2 seconds of inactivity
  });

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('laundromat-deal-data');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        if (parsedData.deal) setDeal(parsedData.deal);
        if (parsedData.leaseDetails) setLeaseDetails(parsedData.leaseDetails);
        if (parsedData.expenseItems) setExpenseItems(parsedData.expenseItems);
        if (parsedData.machineInventory) setMachineInventory(parsedData.machineInventory);
        if (parsedData.ancillaryIncome) setAncillaryIncome(parsedData.ancillaryIncome);
        if (parsedData.utilityAnalysis) setUtilityAnalysis(parsedData.utilityAnalysis);
        setLastSaved('Loaded from browser');
      }
    } catch (error) {
      console.error('Failed to load saved deal data:', error);
    }
  }, []);

  const updateDeal = (dealUpdate: Partial<Deal>) => {
    if (!deal) {
      const newDeal: Deal = {
        dealId: 'deal-1',
        dealName: 'New Laundromat Deal',
        userId: 'user-1',
        propertyAddress: '',
        askingPrice: 0,
        facilitySizeSqft: 0,
        isRealEstateIncluded: false,
        grossIncomeAnnual: 0,
        annualNet: 0,
        fullTimeStaffCount: 0,
        partTimeStaffCount: 0,
        payrollCost: 0,
        downPaymentPercent: 25,
        loanInterestRatePercent: 7.5,
        loanTermYears: 10,
        loanType: 'Conventional',
        targetCapRatePercent: 8,
        targetCoCROIPercent: 15,
        ownerWeeklyHours: 0,
        leaseHistory: '',
        notes: '',
        // Default growth assumptions
        incomeGrowthRatePercent: 2.0,
        expenseGrowthRatePercent: 3.0,
        expansionPotential: {
          additionalMachines: 0,
          expansionCost: 0,
          potentialAdditionalIncome: 0
        },
        valueAddedServices: [],
        ...dealUpdate
      };
      setDeal(newDeal);
      
      // Initialize default expenses
      const defaultExpenseItems = defaultExpenses.map((expense, index) => ({
        ...expense,
        expenseId: `expense-${index + 1}`,
        dealId: newDeal.dealId
      }));
      setExpenseItems(defaultExpenseItems);
      
      // Initialize ancillary income
      setAncillaryIncome({
        ancillaryId: 'ancillary-1',
        dealId: newDeal.dealId,
        isWDFActive: false,
        wdfPricePerLb: 0,
        wdfVolumeLbsPerWeek: 0,
        wdfProcessStatus: '',
        vendingIncomeAnnual: 0,
        otherIncomeAnnual: 0,
        lastVentCleaningDate: '',
        ventCleaningFrequency: 'Monthly',
        automationLevel: [],
        securityMeasures: []
      });
      
      // Initialize utility analysis
      setUtilityAnalysis({
        analysisId: 'analysis-1',
        dealId: newDeal.dealId,
        collectionPeriodWeeks: 0,
        totalCollectedAmount: 0,
        waterBillTotalGallons: 0,
        waterBillPeriodMonths: 0,
        waterSewerCostPerGallon: 0,
        notes: ''
      });
    } else {
      const updatedDeal = { ...deal, ...dealUpdate };
      
      // Clear lease details if real estate is now included
      if (dealUpdate.isRealEstateIncluded === true && !deal.isRealEstateIncluded) {
        setLeaseDetails(null);
      }
      
      // Auto-calculate annual net (NOI) if expenses exist and user hasn't manually set it
      if (expenseItems.length > 0 && (!updatedDeal.annualNet || updatedDeal.annualNet === 0)) {
        const totalOperatingExpenses = expenseItems.reduce((sum, expense) => sum + expense.amountAnnual, 0);
        let totalGrossIncome = updatedDeal.grossIncomeAnnual;
        
        // Add ancillary income
        if (ancillaryIncome) {
          if (ancillaryIncome.isWDFActive) {
            totalGrossIncome += ancillaryIncome.wdfPricePerLb * ancillaryIncome.wdfVolumeLbsPerWeek * 52;
          }
          totalGrossIncome += ancillaryIncome.vendingIncomeAnnual + ancillaryIncome.otherIncomeAnnual;
        }
        
        // Add value-added services income
        if (updatedDeal.valueAddedServices) {
          totalGrossIncome += updatedDeal.valueAddedServices.reduce((sum, service) => sum + service.potentialRevenue, 0);
        }
        
        updatedDeal.annualNet = Math.max(0, totalGrossIncome - totalOperatingExpenses);
      }
      
      setDeal(updatedDeal);
    }
  };

  const updateLeaseDetails = (leaseUpdate: Partial<LeaseDetails>) => {
    if (!leaseDetails && deal) {
      setLeaseDetails({
        leaseId: 'lease-1',
        dealId: deal.dealId,
        monthlyRent: 0,
        annualRentIncreasePercent: 3,
        camCostAnnual: 0,
        remainingLeaseTermYears: 0,
        renewalOptionsCount: 0,
        renewalOptionLengthYears: 5,
        leaseType: 'Triple Net (NNN)',
        ...leaseUpdate
      });
    } else if (leaseDetails) {
      setLeaseDetails({ ...leaseDetails, ...leaseUpdate });
    }
  };

  const addExpenseItem = (expense: ExpenseItem) => {
    console.log(`🏪 DealContext.addExpenseItem called with:`, expense);
    console.log(`📊 Current expense items count: ${expenseItems.length}`);
    setExpenseItems(prev => {
      const newItems = [...prev, expense];
      console.log(`📈 New expense items count: ${newItems.length}`);
      console.log(`📋 All expense items:`, newItems.map(item => `${item.expenseName}: $${item.amountAnnual}`));
      return newItems;
    });
  };

  const updateExpenseItem = (expenseId: string, expenseUpdate: Partial<ExpenseItem>) => {
    setExpenseItems(items =>
      items.map(item =>
        item.expenseId === expenseId ? { ...item, ...expenseUpdate } : item
      )
    );
  };

  const removeExpenseItem = (expenseId: string) => {
    setExpenseItems(items => items.filter(item => item.expenseId !== expenseId));
  };

  const addMachine = (machine: MachineInventory) => {
    setMachineInventory([...machineInventory, machine]);
  };

  const updateMachine = (machineId: string, machineUpdate: Partial<MachineInventory>) => {
    setMachineInventory(machines =>
      machines.map(machine =>
        machine.machineId === machineId ? { ...machine, ...machineUpdate } : machine
      )
    );
  };

  const removeMachine = (machineId: string) => {
    setMachineInventory(machines => machines.filter(machine => machine.machineId !== machineId));
  };

  const clearMachineInventory = () => {
    setMachineInventory([]);
  };

  const updateAncillaryIncome = (incomeUpdate: Partial<AncillaryIncome>) => {
    if (ancillaryIncome) {
      setAncillaryIncome({ ...ancillaryIncome, ...incomeUpdate });
    }
  };

  const updateUtilityAnalysis = (analysisUpdate: Partial<UtilityAnalysis>) => {
    if (utilityAnalysis) {
      setUtilityAnalysis({ ...utilityAnalysis, ...analysisUpdate });
    }
  };

  const clearAllData = () => {
    setDeal(null);
    setLeaseDetails(null);
    setExpenseItems([]);
    setMachineInventory([]);
    setAncillaryIncome(null);
    setUtilityAnalysis(null);
    try {
      localStorage.removeItem('laundromat-deal-data');
      setLastSaved('Data cleared');
    } catch (error) {
      console.error('Failed to clear data:', error);
    }
  };

  const saveAndStartNew = () => {
    try {
      // Save current data with timestamp
      const timestamp = new Date().toISOString();
      const currentData = {
        deal,
        leaseDetails,
        expenseItems,
        machineInventory,
        ancillaryIncome,
        utilityAnalysis,
        savedAt: timestamp
      };
      
      // Save to a backup with timestamp
      localStorage.setItem(`laundromat-deal-backup-${timestamp}`, JSON.stringify(currentData));
      
      // Clear current data for new deal
      clearAllData();
      setLastSaved('Saved and started new deal');
    } catch (error) {
      console.error('Failed to save and start new:', error);
    }
  };

  return (
    <DealContext.Provider value={{
      deal,
      leaseDetails,
      expenseItems,
      machineInventory,
      ancillaryIncome,
      utilityAnalysis,
      marketData,
      updateDeal,
      updateLeaseDetails,
      addExpenseItem,
      updateExpenseItem,
      removeExpenseItem,
      addMachine,
      updateMachine,
      removeMachine,
      clearMachineInventory,
      updateAncillaryIncome,
      updateUtilityAnalysis,
      clearAllData,
      saveAndStartNew
    }}>
      {children}
      {lastSaved && (
        <div className="fixed bottom-4 right-4 bg-muted/80 text-xs px-3 py-1 rounded-md border backdrop-blur-sm">
          Auto-saved: {lastSaved}
        </div>
      )}
    </DealContext.Provider>
  );
};

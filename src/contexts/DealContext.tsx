import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Deal, LeaseDetails, ExpenseItem, MachineInventory, AncillaryIncome, UtilityAnalysis } from '@/types/deal';

interface DealContextType {
  deal: Deal | null;
  leaseDetails: LeaseDetails | null;
  expenseItems: ExpenseItem[];
  machineInventory: MachineInventory[];
  ancillaryIncome: AncillaryIncome | null;
  utilityAnalysis: UtilityAnalysis | null;
  updateDeal: (deal: Partial<Deal>) => void;
  updateLeaseDetails: (lease: Partial<LeaseDetails>) => void;
  addExpenseItem: (expense: ExpenseItem) => void;
  updateExpenseItem: (expenseId: string, expense: Partial<ExpenseItem>) => void;
  removeExpenseItem: (expenseId: string) => void;
  addMachine: (machine: MachineInventory) => void;
  updateMachine: (machineId: string, machine: Partial<MachineInventory>) => void;
  removeMachine: (machineId: string) => void;
  updateAncillaryIncome: (income: Partial<AncillaryIncome>) => void;
  updateUtilityAnalysis: (analysis: Partial<UtilityAnalysis>) => void;
}

const DealContext = createContext<DealContextType | undefined>(undefined);

const defaultExpenses: Omit<ExpenseItem, 'expenseId' | 'dealId'>[] = [
  { expenseName: 'Rent', amountAnnual: 0, expenseType: 'Fixed' },
  { expenseName: 'Water/Sewer', amountAnnual: 0, expenseType: 'Variable' },
  { expenseName: 'Gas', amountAnnual: 0, expenseType: 'Variable' },
  { expenseName: 'Electricity', amountAnnual: 0, expenseType: 'Variable' },
  { expenseName: 'Insurance', amountAnnual: 0, expenseType: 'Fixed' },
  { expenseName: 'Maintenance', amountAnnual: 0, expenseType: 'Variable' },
  { expenseName: 'Supplies', amountAnnual: 0, expenseType: 'Variable' },
  { expenseName: 'Staff Salaries', amountAnnual: 0, expenseType: 'Fixed' },
  { expenseName: 'Payroll Taxes', amountAnnual: 0, expenseType: 'Fixed' },
  { expenseName: 'Unemployment Insurance', amountAnnual: 0, expenseType: 'Fixed' },
  { expenseName: 'Disability Insurance', amountAnnual: 0, expenseType: 'Fixed' },
  { expenseName: 'Vent Cleaning', amountAnnual: 0, expenseType: 'Fixed' },
  { expenseName: 'Marketing', amountAnnual: 0, expenseType: 'Variable' },
  { expenseName: 'Security', amountAnnual: 0, expenseType: 'Fixed' },
];

export const DealProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [deal, setDeal] = useState<Deal | null>(null);
  const [leaseDetails, setLeaseDetails] = useState<LeaseDetails | null>(null);
  const [expenseItems, setExpenseItems] = useState<ExpenseItem[]>([]);
  const [machineInventory, setMachineInventory] = useState<MachineInventory[]>([]);
  const [ancillaryIncome, setAncillaryIncome] = useState<AncillaryIncome | null>(null);
  const [utilityAnalysis, setUtilityAnalysis] = useState<UtilityAnalysis | null>(null);

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
        replacementLaborCostHourly: 15,
        leaseHistory: '',
        notes: '',
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
    setExpenseItems([...expenseItems, expense]);
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

  return (
    <DealContext.Provider value={{
      deal,
      leaseDetails,
      expenseItems,
      machineInventory,
      ancillaryIncome,
      utilityAnalysis,
      updateDeal,
      updateLeaseDetails,
      addExpenseItem,
      updateExpenseItem,
      removeExpenseItem,
      addMachine,
      updateMachine,
      removeMachine,
      updateAncillaryIncome,
      updateUtilityAnalysis
    }}>
      {children}
    </DealContext.Provider>
  );
};

export const useDeal = () => {
  const context = useContext(DealContext);
  if (context === undefined) {
    throw new Error('useDeal must be used within a DealProvider');
  }
  return context;
};
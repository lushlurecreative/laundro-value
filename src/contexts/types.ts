import { Deal, LeaseDetails, ExpenseItem, MachineInventory, AncillaryIncome, UtilityAnalysis } from '@/types/deal';

export interface DealContextType {
  deal: Deal | null;
  leaseDetails: LeaseDetails | null;
  expenseItems: ExpenseItem[];
  machineInventory: MachineInventory[];
  ancillaryIncome: AncillaryIncome | null;
  utilityAnalysis: UtilityAnalysis | null;
  marketData: any;
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
  clearAllData: () => void;
  saveAndStartNew: () => void;
}
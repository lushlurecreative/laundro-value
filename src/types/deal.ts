export interface Deal {
  dealId: string;
  dealName: string;
  userId: string;
  propertyAddress: string;
  askingPrice: number;
  facilitySizeSqft: number;
  isRealEstateIncluded: boolean;
  grossIncomeAnnual: number;
  annualNet: number;
  fullTimeStaffCount: number;
  partTimeStaffCount: number;
  payrollCost: number;
  downPaymentPercent: number;
  loanInterestRatePercent: number;
  loanTermYears: number;
  loanType: string;
  targetCapRatePercent: number;
  targetCoCROIPercent: number;
  ownerWeeklyHours: number;
  leaseHistory: string;
  notes: string;
  // Growth assumptions for projections
  incomeGrowthRatePercent: number;
  expenseGrowthRatePercent: number;
  expansionPotential: {
    additionalMachines: number;
    expansionCost: number;
    potentialAdditionalIncome: number;
  };
  valueAddedServices: {
    description: string;
    potentialRevenue: number;
  }[];
}

export interface LeaseDetails {
  leaseId: string;
  dealId: string;
  monthlyRent: number;
  annualRentIncreasePercent: number;
  camCostAnnual: number;
  remainingLeaseTermYears: number;
  renewalOptionsCount: number;
  renewalOptionLengthYears: number;
  leaseType: 'Triple Net (NNN)' | 'Modified Gross' | 'Gross Lease' | 'Other';
  leaseTerms?: string;
}

export interface ExpenseItem {
  expenseId: string;
  dealId: string;
  expenseName: string;
  amountAnnual: number;
  expenseType: 'Fixed' | 'Variable';
}

export interface MachineInventory {
  machineId: string;
  dealId: string;
  machineType: 'Top-Load Washer' | 'Front-Load Washer' | 'Stacked Washer/Dryer' | 'Single Dryer' | 'Stacked Dryer' | 'Other';
  brand: string;
  model?: string;
  quantity: number;
  ageYears: number;
  capacityLbs: number;
  vendPricePerUse: number;
  conditionRating: number; // 1-5 scale
  waterConsumptionGalPerCycle?: number; // for washers only
  electricConsumptionKwh?: number;
  gasConsumptionBtu?: number;
  purchaseValue: number;
  currentValue: number;
  maintenanceCostAnnual: number;
  isCardOperated: boolean;
  isCoinOperated: boolean;
  isOutOfOrder: boolean;
}

export interface AncillaryIncome {
  ancillaryId: string;
  dealId: string;
  isWDFActive: boolean;
  wdfPricePerLb: number;
  wdfVolumeLbsPerWeek: number;
  wdfProcessStatus: string;
  vendingIncomeAnnual: number;
  otherIncomeAnnual: number;
  lastVentCleaningDate: string;
  ventCleaningFrequency: string;
  automationLevel: string[];
  securityMeasures: string[];
}

export interface UtilityAnalysis {
  analysisId: string;
  dealId: string;
  collectionPeriodWeeks: number;
  totalCollectedAmount: number;
  waterBillTotalGallons: number;
  waterBillPeriodMonths: number;
  waterSewerCostPerGallon: number;
  notes: string;
}

export interface CalculatedMetrics {
  totalGrossIncome: number;
  totalOperatingExpenses: number;
  noi: number;
  loanAmount: number;
  annualDebtService: number;
  annualCashFlow: number;
  coCROI: number;
  capRate: number;
  dscr: number;
  suggestedValuationLow: number;
  suggestedValuationHigh: number;
  valuationMultiplier: number;
}
export interface Deal {
  dealId: string;
  dealName: string;
  userId: string;
  propertyAddress: string;
  purchasePrice: number;
  facilitySizeSqft: number;
  isRealEstateIncluded: boolean;
  reportedGrossIncomeAnnual: number;
  downPaymentPercent: number;
  loanInterestRatePercent: number;
  loanTermYears: number;
  targetCapRatePercent: number;
  targetCoCROIPercent: number;
  ownerWeeklyHours: number;
  replacementLaborCostHourly: number;
  notes: string;
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
  machineType: 'Top-Load Washer' | 'Front-Load Washer' | 'Stacked Washer/Dryer' | 'Single Dryer' | 'Stacked Dryer';
  brand: string;
  quantity: number;
  ageYears: number;
  capacityLbs: number;
  vendPricePerUse: number;
  conditionRating: number; // 1-5 scale
  waterConsumptionGalPerCycle?: number; // for washers only
}

export interface AncillaryIncome {
  ancillaryId: string;
  dealId: string;
  isWDFActive: boolean;
  wdfPricePerLb: number;
  wdfVolumeLbsPerWeek: number;
  vendingIncomeAnnual: number;
  otherIncomeAnnual: number;
}

export interface IncomeVerification {
  verificationId: string;
  dealId: string;
  collectionPeriodWeeks: number;
  totalCollectedAmount: number;
  waterBillTotalGallons: number;
  waterBillPeriodMonths: number;
  waterSewerCostPerGallon: number;
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
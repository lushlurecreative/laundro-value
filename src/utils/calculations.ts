import { Deal, LeaseDetails, ExpenseItem, MachineInventory, AncillaryIncome, UtilityAnalysis, CalculatedMetrics } from '@/types/deal';

export const calculateMetrics = (
  deal: Deal | null,
  leaseDetails: LeaseDetails | null,
  expenseItems: ExpenseItem[],
  machineInventory: MachineInventory[],
  ancillaryIncome: AncillaryIncome | null,
  utilityAnalysis: UtilityAnalysis | null
): CalculatedMetrics => {
  if (!deal) {
    return {
      totalGrossIncome: 0,
      totalOperatingExpenses: 0,
      noi: 0,
      loanAmount: 0,
      annualDebtService: 0,
      annualCashFlow: 0,
      coCROI: 0,
      capRate: 0,
      dscr: 0,
      suggestedValuationLow: 0,
      suggestedValuationHigh: 0,
      valuationMultiplier: 4.0
    };
  }

  // Calculate Total Gross Income
  let totalGrossIncome = deal.grossIncomeAnnual;
  if (ancillaryIncome) {
    if (ancillaryIncome.isWDFActive) {
      totalGrossIncome += ancillaryIncome.wdfPricePerLb * ancillaryIncome.wdfVolumeLbsPerWeek * 52;
    }
    totalGrossIncome += ancillaryIncome.vendingIncomeAnnual + ancillaryIncome.otherIncomeAnnual;
  }
  
  // Add value-added services income
  if (deal.valueAddedServices) {
    totalGrossIncome += deal.valueAddedServices.reduce((sum, service) => sum + service.potentialRevenue, 0);
  }

  // Calculate Total Operating Expenses
  const totalOperatingExpenses = expenseItems.reduce((sum, expense) => sum + expense.amountAnnual, 0);

  // Calculate NOI
  const noi = totalGrossIncome - totalOperatingExpenses;

  // Calculate Loan Metrics
  const downPaymentAmount = deal.askingPrice * (deal.downPaymentPercent / 100);
  const loanAmount = deal.askingPrice - downPaymentAmount;
  
  // Calculate Annual Debt Service using PMT formula
  const monthlyRate = deal.loanInterestRatePercent / 100 / 12;
  const numberOfPayments = deal.loanTermYears * 12;
  let monthlyPayment = 0;
  
  if (loanAmount > 0 && monthlyRate > 0) {
    monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
                    (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  }
  
  const annualDebtService = monthlyPayment * 12;

  // Calculate Cash Flow and Returns
  const annualCashFlow = noi - annualDebtService;
  const coCROI = downPaymentAmount > 0 ? (annualCashFlow / downPaymentAmount) * 100 : 0;
  const capRate = deal.askingPrice > 0 ? (noi / deal.askingPrice) * 100 : 0;
  const dscr = annualDebtService > 0 ? noi / annualDebtService : 0;

  // Calculate Dynamic Valuation Multiplier
  let valuationMultiplier = 4.0;

  // Machine age adjustment
  if (machineInventory.length > 0) {
    const avgAge = machineInventory.reduce((sum, machine) => sum + machine.ageYears, 0) / machineInventory.length;
    if (avgAge <= 5) valuationMultiplier += 0.75;
    else if (avgAge <= 10) valuationMultiplier += 0.25;
    else if (avgAge > 15) valuationMultiplier -= 0.5;
  }

  // Lease term adjustment
  if (leaseDetails) {
    const totalLeaseTerm = leaseDetails.remainingLeaseTermYears + 
                          (leaseDetails.renewalOptionsCount * leaseDetails.renewalOptionLengthYears);
    if (totalLeaseTerm >= 15) valuationMultiplier += 0.5;
    else if (totalLeaseTerm < 5) valuationMultiplier -= 0.75;

    // Rent burden adjustment
    const annualRent = leaseDetails.monthlyRent * 12;
    const rentRatio = totalGrossIncome > 0 ? annualRent / totalGrossIncome : 0;
    if (rentRatio >= 0.33) valuationMultiplier -= 0.5;
    else if (rentRatio <= 0.15) valuationMultiplier += 0.25;
  }

  // Cap rate adjustment
  if (capRate >= 10) valuationMultiplier += 0.25;
  else if (capRate < 6) valuationMultiplier -= 0.5;

  // Machine condition adjustment
  if (machineInventory.length > 0) {
    const avgCondition = machineInventory.reduce((sum, machine) => sum + machine.conditionRating, 0) / machineInventory.length;
    if (avgCondition >= 4) valuationMultiplier += 0.25;
    else if (avgCondition <= 2) valuationMultiplier -= 0.5;
  }

  // Ensure multiplier stays within reasonable bounds
  valuationMultiplier = Math.max(2.5, Math.min(6.0, valuationMultiplier));

  // Calculate suggested valuation range
  const suggestedValuationLow = noi * (valuationMultiplier - 0.15);
  const suggestedValuationHigh = noi * (valuationMultiplier + 0.15);

  return {
    totalGrossIncome,
    totalOperatingExpenses,
    noi,
    loanAmount,
    annualDebtService,
    annualCashFlow,
    coCROI,
    capRate,
    dscr,
    suggestedValuationLow,
    suggestedValuationHigh,
    valuationMultiplier
  };
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

export const calculateWaterBasedIncome = (
  utilityAnalysis: UtilityAnalysis | null,
  machineInventory: MachineInventory[]
): number => {
  if (!utilityAnalysis || machineInventory.length === 0) return 0;

  const washers = machineInventory.filter(machine => 
    machine.machineType.includes('Washer') && machine.waterConsumptionGalPerCycle
  );

  if (washers.length === 0) return 0;

  const avgWaterPerCycle = washers.reduce((sum, washer) => 
    sum + (washer.waterConsumptionGalPerCycle || 0) * washer.quantity, 0
  ) / washers.reduce((sum, washer) => sum + washer.quantity, 0);

  const monthlyGallons = utilityAnalysis.waterBillTotalGallons / utilityAnalysis.waterBillPeriodMonths;
  const estimatedCyclesPerMonth = monthlyGallons / avgWaterPerCycle;
  
  const avgVendPrice = washers.reduce((sum, washer) => sum + washer.vendPricePerUse, 0) / washers.length;
  
  return estimatedCyclesPerMonth * avgVendPrice * 12;
};

export const calculateCollectionBasedIncome = (
  utilityAnalysis: UtilityAnalysis | null
): number => {
  if (!utilityAnalysis || utilityAnalysis.collectionPeriodWeeks === 0) return 0;
  
  return (utilityAnalysis.totalCollectedAmount / utilityAnalysis.collectionPeriodWeeks) * 52;
};

export const calculateBreakevenAnalysis = (
  deal: Deal | null,
  expenseItems: ExpenseItem[],
  ancillaryIncome: AncillaryIncome | null
): {
  monthlyBreakevenRevenue: number;
  breakevenOccupancy: number;
  monthsToBreakeven: number;
} => {
  if (!deal) {
    return {
      monthlyBreakevenRevenue: 0,
      breakevenOccupancy: 0,
      monthsToBreakeven: 0
    };
  }

  const monthlyExpenses = expenseItems.reduce((sum, expense) => sum + expense.amountAnnual, 0) / 12;
  const monthlyDebtService = deal.askingPrice > 0 ? 
    ((deal.askingPrice - (deal.askingPrice * deal.downPaymentPercent / 100)) * 
     (deal.loanInterestRatePercent / 100 / 12) * 
     Math.pow(1 + deal.loanInterestRatePercent / 100 / 12, deal.loanTermYears * 12)) / 
    (Math.pow(1 + deal.loanInterestRatePercent / 100 / 12, deal.loanTermYears * 12) - 1) : 0;

  const monthlyBreakevenRevenue = monthlyExpenses + monthlyDebtService;
  
  const currentMonthlyRevenue = deal.grossIncomeAnnual / 12;
  const breakevenOccupancy = currentMonthlyRevenue > 0 ? (monthlyBreakevenRevenue / currentMonthlyRevenue) * 100 : 0;
  
  const initialInvestment = deal.askingPrice * deal.downPaymentPercent / 100;
  const monthlyProfit = currentMonthlyRevenue - monthlyBreakevenRevenue;
  const monthsToBreakeven = monthlyProfit > 0 ? initialInvestment / monthlyProfit : 0;

  return {
    monthlyBreakevenRevenue,
    breakevenOccupancy,
    monthsToBreakeven
  };
};
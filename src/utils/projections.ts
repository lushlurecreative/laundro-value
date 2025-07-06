import { Deal, LeaseDetails, ExpenseItem, MachineInventory, AncillaryIncome } from '@/types/deal';

interface YearlyProjection {
  year: number;
  grossIncome: number;
  operatingExpenses: number;
  noi: number;
  debtService: number;
  cashFlow: number;
  capEx: number;
  cumulativeCashFlow: number;
}

interface EquipmentReplacementCost {
  machineType: string;
  averageLifespan: number;
  replacementCost: number;
}

const equipmentReplacementData: EquipmentReplacementCost[] = [
  { machineType: 'Top-Load Washer', averageLifespan: 12, replacementCost: 800 },
  { machineType: 'Front-Load Washer', averageLifespan: 15, replacementCost: 1200 },
  { machineType: 'Stacked Washer/Dryer', averageLifespan: 12, replacementCost: 1500 },
  { machineType: 'Single Dryer', averageLifespan: 15, replacementCost: 900 },
  { machineType: 'Stacked Dryer', averageLifespan: 15, replacementCost: 1100 }
];

export const calculateTenYearProjection = (
  deal: Deal,
  leaseDetails: LeaseDetails | null,
  expenseItems: ExpenseItem[],
  machineInventory: MachineInventory[],
  ancillaryIncome: AncillaryIncome | null
): YearlyProjection[] => {
  const projections: YearlyProjection[] = [];
  
  // Starting values
  let currentGrossIncome = deal.reportedGrossIncomeAnnual;
  if (ancillaryIncome) {
    if (ancillaryIncome.isWDFActive) {
      currentGrossIncome += ancillaryIncome.wdfPricePerLb * ancillaryIncome.wdfVolumeLbsPerWeek * 52;
    }
    currentGrossIncome += ancillaryIncome.vendingIncomeAnnual + ancillaryIncome.otherIncomeAnnual;
  }
  
  let currentOperatingExpenses = expenseItems.reduce((sum, expense) => sum + expense.amountAnnual, 0);
  
  // Calculate annual debt service
  const downPaymentAmount = deal.purchasePrice * (deal.downPaymentPercent / 100);
  const loanAmount = deal.purchasePrice - downPaymentAmount;
  const monthlyRate = deal.loanInterestRatePercent / 100 / 12;
  const numberOfPayments = deal.loanTermYears * 12;
  
  let monthlyPayment = 0;
  if (loanAmount > 0 && monthlyRate > 0) {
    monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
                    (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  }
  const annualDebtService = monthlyPayment * 12;
  
  // Growth assumptions
  const incomeGrowthRate = 0.02; // 2% annual income growth
  const expenseGrowthRate = 0.03; // 3% annual expense growth
  const rentGrowthRate = leaseDetails?.annualRentIncreasePercent / 100 || 0.03;
  
  let cumulativeCashFlow = 0;
  
  for (let year = 1; year <= 10; year++) {
    // Calculate projected income with growth
    const projectedGrossIncome = currentGrossIncome * Math.pow(1 + incomeGrowthRate, year - 1);
    
    // Calculate projected expenses with growth
    let projectedOperatingExpenses = 0;
    expenseItems.forEach(expense => {
      if (expense.expenseName === 'Rent' && leaseDetails) {
        // Apply rent escalation
        const projectedRent = (leaseDetails.monthlyRent * 12) * Math.pow(1 + rentGrowthRate, year - 1);
        projectedOperatingExpenses += projectedRent;
      } else {
        // Apply general expense growth
        projectedOperatingExpenses += expense.amountAnnual * Math.pow(1 + expenseGrowthRate, year - 1);
      }
    });
    
    const noi = projectedGrossIncome - projectedOperatingExpenses;
    
    // Calculate CapEx for this year
    const capEx = calculateCapExForYear(machineInventory, year);
    
    // Calculate cash flow (subtract debt service only if within loan term)
    const debtService = year <= deal.loanTermYears ? annualDebtService : 0;
    const cashFlow = noi - debtService - capEx;
    
    cumulativeCashFlow += cashFlow;
    
    projections.push({
      year,
      grossIncome: projectedGrossIncome,
      operatingExpenses: projectedOperatingExpenses,
      noi,
      debtService,
      cashFlow,
      capEx,
      cumulativeCashFlow
    });
  }
  
  return projections;
};

const calculateCapExForYear = (machineInventory: MachineInventory[], year: number): number => {
  let totalCapEx = 0;
  
  machineInventory.forEach(machine => {
    const equipmentData = equipmentReplacementData.find(
      data => data.machineType === machine.machineType
    );
    
    if (equipmentData) {
      const yearsUntilReplacement = equipmentData.averageLifespan - machine.ageYears;
      
      // Check if replacement is needed this year
      if (yearsUntilReplacement === year) {
        totalCapEx += equipmentData.replacementCost * machine.quantity;
      }
      
      // Check for subsequent replacements (every lifespan years)
      const replacementYears = [];
      let nextReplacement = yearsUntilReplacement;
      while (nextReplacement <= 10) {
        if (nextReplacement > 0) {
          replacementYears.push(nextReplacement);
        }
        nextReplacement += equipmentData.averageLifespan;
      }
      
      if (replacementYears.includes(year)) {
        totalCapEx += equipmentData.replacementCost * machine.quantity;
      }
    }
  });
  
  return totalCapEx;
};

export const calculateROI = (projections: YearlyProjection[], initialInvestment: number) => {
  const totalCashFlow = projections.reduce((sum, year) => sum + year.cashFlow, 0);
  const roi = (totalCashFlow / initialInvestment) * 100;
  return roi;
};

export const calculateIRR = (projections: YearlyProjection[], initialInvestment: number): number => {
  // Simplified IRR calculation - for a more accurate calculation, you'd use a financial library
  const cashFlows = [-initialInvestment, ...projections.map(p => p.cashFlow)];
  
  // Use Newton-Raphson method for IRR calculation
  let irr = 0.1; // Initial guess of 10%
  let tolerance = 0.0001;
  let maxIterations = 100;
  
  for (let i = 0; i < maxIterations; i++) {
    let npv = 0;
    let derivative = 0;
    
    for (let j = 0; j < cashFlows.length; j++) {
      npv += cashFlows[j] / Math.pow(1 + irr, j);
      if (j > 0) {
        derivative -= j * cashFlows[j] / Math.pow(1 + irr, j + 1);
      }
    }
    
    if (Math.abs(npv) < tolerance) {
      break;
    }
    
    irr = irr - npv / derivative;
  }
  
  return irr * 100; // Return as percentage
};
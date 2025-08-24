// Data validation utilities for financial analysis
export interface ValidationResult {
  isValid: boolean;
  warnings: string[];
  errors: string[];
  suggestions: string[];
}

export const validateFinancialData = (deal: any, expenses: any[], equipment: any[]): ValidationResult => {
  const result: ValidationResult = {
    isValid: true,
    warnings: [],
    errors: [],
    suggestions: []
  };

  // Income validation
  if (deal?.grossIncomeAnnual) {
    const grossIncome = deal.grossIncomeAnnual;
    
    // Validate income per square foot
    if (deal.totalSqft && grossIncome / deal.totalSqft < 50) {
      result.warnings.push(`Income per sq ft ($${(grossIncome / deal.totalSqft).toFixed(2)}) is below industry standard ($50-150/sq ft)`);
    }
    
    // Validate NOI margin
    if (deal.annualNet) {
      const noiMargin = (deal.annualNet / grossIncome) * 100;
      if (noiMargin < 25) {
        result.warnings.push(`NOI margin (${noiMargin.toFixed(1)}%) is below industry standard (25-35%)`);
      } else if (noiMargin > 50) {
        result.warnings.push(`NOI margin (${noiMargin.toFixed(1)}%) seems unusually high - verify expenses are complete`);
      }
    }
  }

  // Expense validation
  const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amountAnnual || 0), 0);
  
  if (deal?.grossIncomeAnnual && totalExpenses) {
    const expenseRatio = (totalExpenses / deal.grossIncomeAnnual) * 100;
    
    if (expenseRatio < 30) {
      result.warnings.push(`Total expense ratio (${expenseRatio.toFixed(1)}%) seems low - ensure all expenses are included`);
    } else if (expenseRatio > 75) {
      result.warnings.push(`Total expense ratio (${expenseRatio.toFixed(1)}%) is very high - verify expense amounts`);
    }
  }

  // Required expense categories
  const requiredExpenses = ['rent', 'utilities', 'insurance', 'maintenance'];
  const expenseNames = expenses.map(exp => exp.category?.toLowerCase() || '');
  
  requiredExpenses.forEach(required => {
    if (!expenseNames.some(name => name.includes(required))) {
      result.suggestions.push(`Consider adding ${required} expense if not already included`);
    }
  });

  // Equipment validation
  if (equipment.length > 0) {
    const avgAge = equipment.reduce((sum, eq) => sum + (eq.ageYears || 0), 0) / equipment.length;
    
    if (avgAge > 15) {
      result.warnings.push(`Average equipment age (${avgAge.toFixed(1)} years) indicates potential major replacement costs`);
    }
    
    const avgCondition = equipment.reduce((sum, eq) => sum + (eq.conditionRating || 3), 0) / equipment.length;
    if (avgCondition < 2.5) {
      result.warnings.push(`Poor average equipment condition may require immediate repairs/replacements`);
    }
  }

  // Cap rate validation
  if (deal?.askingPrice && deal?.annualNet) {
    const capRate = (deal.annualNet / deal.askingPrice) * 100;
    
    if (capRate < 6) {
      result.warnings.push(`Cap rate (${capRate.toFixed(1)}%) is below typical laundromat range (8-12%)`);
    } else if (capRate > 15) {
      result.warnings.push(`Cap rate (${capRate.toFixed(1)}%) is unusually high - verify all data is accurate`);
    }
  }

  // Set overall validity
  result.isValid = result.errors.length === 0;

  return result;
};

export const generateDataQualityReport = (validation: ValidationResult): string => {
  let report = "## Data Quality Assessment\n\n";
  
  if (validation.isValid) {
    report += "✅ **Overall Status**: Data appears valid for analysis\n\n";
  } else {
    report += "❌ **Overall Status**: Critical issues found that need attention\n\n";
  }
  
  if (validation.errors.length > 0) {
    report += "### ❌ Errors (Must Fix)\n";
    validation.errors.forEach(error => {
      report += `- ${error}\n`;
    });
    report += "\n";
  }
  
  if (validation.warnings.length > 0) {
    report += "### ⚠️ Warnings (Review Recommended)\n";
    validation.warnings.forEach(warning => {
      report += `- ${warning}\n`;
    });
    report += "\n";
  }
  
  if (validation.suggestions.length > 0) {
    report += "### 💡 Suggestions (Optional Improvements)\n";
    validation.suggestions.forEach(suggestion => {
      report += `- ${suggestion}\n`;
    });
    report += "\n";
  }
  
  return report;
};
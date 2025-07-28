import { ExpenseItem } from '@/types/deal';

// Standard expense categories with common variations
const EXPENSE_CATEGORIES = {
  'Utilities - Electric': ['electric', 'electricity', 'power', 'electrical'],
  'Utilities - Gas': ['gas', 'natural gas', 'heating', 'fuel'],
  'Water & Sewer': ['water', 'sewer', 'wastewater', 'water & sewer', 'water/sewer', 'water and sewer'],
  'Rent': ['rent', 'rental', 'lease payment', 'base rent'],
  'Insurance': ['insurance', 'liability', 'property insurance', 'general liability'],
  'Payroll': ['payroll', 'wages', 'salary', 'salaries', 'staff salaries', 'labor'],
  'Repairs & Maintenance': ['repairs', 'maintenance', 'repair', 'upkeep', 'repairs & maintenance'],
  'Internet': ['internet', 'phone', 'telecommunications', 'wifi', 'communication'],
  'Waste Removal': ['waste', 'trash', 'garbage', 'waste removal', 'disposal'],
  'Accounting': ['accounting', 'bookkeeping', 'cpa', 'tax prep', 'professional fees'],
  'Bank Charges': ['bank', 'banking', 'bank charges', 'service fees', 'transaction fees'],
  'Depreciation': ['depreciation', 'depreciation expense'],
  'Office Supplies': ['office', 'supplies', 'office supplies', 'materials'],
  'Security': ['alarm', 'security', 'monitoring', 'surveillance'],
  'Property Tax': ['property tax', 'taxes', 'real estate tax'],
  'CAM Charges': ['cam', 'common area', 'cam charges', 'common area maintenance']
};

// Calculate similarity score between two strings
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

// Levenshtein distance calculation
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }
  
  return matrix[str2.length][str1.length];
}

// Clean and normalize expense names
function normalizeExpenseName(name: string): string {
  return name.toLowerCase()
    .replace(/[^\w\s&]/g, '') // Remove special chars except &
    .replace(/\s+/g, ' ')
    .trim();
}

// Classify expense and return best match
export function classifyExpense(expenseName: string): {
  category: string;
  confidence: number;
  isNewCategory: boolean;
} {
  const normalized = normalizeExpenseName(expenseName);
  
  // Check for exact or high similarity matches
  for (const [category, variations] of Object.entries(EXPENSE_CATEGORIES)) {
    for (const variation of variations) {
      const similarity = calculateSimilarity(normalized, variation);
      if (similarity > 0.8) {
        return {
          category,
          confidence: similarity,
          isNewCategory: false
        };
      }
    }
  }
  
  // Check for partial matches (contains keyword)
  for (const [category, variations] of Object.entries(EXPENSE_CATEGORIES)) {
    for (const variation of variations) {
      if (normalized.includes(variation) || variation.includes(normalized)) {
        return {
          category,
          confidence: 0.7,
          isNewCategory: false
        };
      }
    }
  }
  
  // Create new category if no good match found
  const newCategory = expenseName
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
  
  return {
    category: newCategory,
    confidence: 0.5,
    isNewCategory: true
  };
}

// Parse AI-extracted expenses and classify them
export function parseAndClassifyExpenses(expenses: Record<string, number>): ExpenseItem[] {
  const classifiedExpenses: ExpenseItem[] = [];
  
  console.log('🔍 Classifying expenses:', expenses);
  
  Object.entries(expenses).forEach(([name, amount]) => {
    if (amount && amount > 0) {
      const classification = classifyExpense(name);
      
      console.log(`📋 "${name}" → "${classification.category}" (confidence: ${classification.confidence.toFixed(2)}, new: ${classification.isNewCategory})`);
      
      const expenseItem: ExpenseItem = {
        expenseId: crypto.randomUUID(),
        dealId: '', // Will be set by the context
        expenseName: classification.category,
        amountAnnual: amount,
        expenseType: 'Fixed' // Default to Fixed, can be changed by user
      };
      
      classifiedExpenses.push(expenseItem);
    }
  });
  
  return classifiedExpenses;
}

// Get expense suggestions for manual categorization
export function getExpenseSuggestions(expenseName: string, limit: number = 5): string[] {
  const normalized = normalizeExpenseName(expenseName);
  const suggestions: Array<{ category: string; score: number }> = [];
  
  for (const category of Object.keys(EXPENSE_CATEGORIES)) {
    const score = calculateSimilarity(normalized, normalizeExpenseName(category));
    suggestions.push({ category, score });
  }
  
  return suggestions
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(s => s.category);
}
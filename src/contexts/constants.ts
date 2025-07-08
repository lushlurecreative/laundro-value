import { ExpenseItem } from '@/types/deal';

export const defaultExpenses: Omit<ExpenseItem, 'expenseId' | 'dealId'>[] = [
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
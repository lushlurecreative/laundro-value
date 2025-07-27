import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useDeal } from '@/contexts/useDeal';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

export const MissingDataAnalysis = () => {
  const { deal, leaseDetails, expenseItems, machineInventory } = useDeal();

  const criticalMissing: string[] = [];
  const importantMissing: string[] = [];
  const suggestions: string[] = [];

  // Critical missing data
  if (!deal?.askingPrice) criticalMissing.push("Asking Price");
  if (!deal?.grossIncomeAnnual) criticalMissing.push("Annual Gross Income");
  if (!deal?.facilitySizeSqft) criticalMissing.push("Facility Size (Sq Ft)");
  if (!deal?.propertyAddress) criticalMissing.push("Property Address");

  // Important missing data
  if (!leaseDetails?.monthlyRent) importantMissing.push("Monthly Rent");
  if (!leaseDetails?.remainingLeaseTermYears) importantMissing.push("Remaining Lease Term");
  if (!leaseDetails?.renewalOptionsCount) importantMissing.push("Lease Renewal Options");

  // Equipment analysis
  if (!machineInventory || machineInventory.length === 0) {
    criticalMissing.push("Equipment Inventory");
  } else {
    const washers = machineInventory.filter(m => m.machineType.includes('Washer'));
    const dryers = machineInventory.filter(m => m.machineType.includes('Dryer'));
    if (washers.length === 0) importantMissing.push("Washer Details");
    if (dryers.length === 0) importantMissing.push("Dryer Details");
  }

  // Expense analysis
  if (!expenseItems || expenseItems.length === 0) {
    criticalMissing.push("Operating Expenses");
  } else {
    const hasRent = expenseItems.some(e => e.expenseName.toLowerCase().includes('rent'));
    const hasUtilities = expenseItems.some(e => 
      e.expenseName.toLowerCase().includes('electric') || 
      e.expenseName.toLowerCase().includes('gas') || 
      e.expenseName.toLowerCase().includes('water')
    );
    if (!hasRent) importantMissing.push("Rent Expense");
    if (!hasUtilities) importantMissing.push("Utility Expenses (Electric, Gas, Water)");
  }

  // Generate suggestions for seller questions
  if (criticalMissing.length > 0 || importantMissing.length > 0) {
    suggestions.push("Request complete financial statements for the last 3 years");
    suggestions.push("Ask for detailed equipment list with ages and conditions");
    suggestions.push("Obtain copy of current lease agreement");
    suggestions.push("Request utility bills for the past 12 months");
    suggestions.push("Ask for detailed operating expense breakdown");
    suggestions.push("Request proof of income documentation");
    suggestions.push("Ask about any deferred maintenance or upcoming capital expenditures");
    suggestions.push("Inquire about customer count and usage patterns");
    suggestions.push("Request information on local competition");
    suggestions.push("Ask about any pending rent increases or lease negotiations");
  }

  if (criticalMissing.length === 0 && importantMissing.length === 0) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <CheckCircle className="h-5 w-5" />
            Deal Analysis Complete
          </CardTitle>
          <CardDescription className="text-green-600">
            All critical information has been provided. Your deal is ready for comprehensive analysis.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {criticalMissing.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong className="text-red-800">Critical Missing Information:</strong>
            <div className="mt-2 flex flex-wrap gap-1">
              {criticalMissing.map((item, index) => (
                <Badge key={index} variant="destructive" className="text-xs">
                  {item}
                </Badge>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {importantMissing.length > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong className="text-yellow-800">Important Missing Information:</strong>
            <div className="mt-2 flex flex-wrap gap-1">
              {importantMissing.map((item, index) => (
                <Badge key={index} variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                  {item}
                </Badge>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Questions to Ask the Seller</CardTitle>
            <CardDescription>
              To complete your due diligence, consider asking the seller for the following information:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {suggestions.slice(0, 8).map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-muted-foreground">•</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
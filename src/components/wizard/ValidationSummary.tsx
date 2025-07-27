import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useDeal } from '@/contexts/useDeal';
import { AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';

export const ValidationSummary = () => {
  const { deal, leaseDetails, expenseItems, machineInventory } = useDeal();

  // Validation logic
  const validations = [
    {
      category: 'Basic Information',
      checks: [
        { field: 'Property Address', valid: !!deal.propertyAddress, required: true },
        { field: 'Asking Price', valid: !!deal.askingPrice && deal.askingPrice > 0, required: true },
        { field: 'Gross Income', valid: !!deal.grossIncomeAnnual && deal.grossIncomeAnnual > 0, required: true },
        { field: 'Total Square Feet', valid: !!deal.facilitySizeSqft && deal.facilitySizeSqft > 0, required: false }
      ]
    },
    {
      category: 'Financial Details',
      checks: [
        { field: 'Down Payment', valid: !!deal.downPaymentPercent && deal.downPaymentPercent > 0, required: true },
        { field: 'Interest Rate', valid: !!deal.loanInterestRatePercent && deal.loanInterestRatePercent > 0, required: true },
        { field: 'Loan Term', valid: !!deal.loanTermYears && deal.loanTermYears > 0, required: true },
        { field: 'Target ROI', valid: !!deal.targetCoCROIPercent && deal.targetCoCROIPercent > 0, required: false }
      ]
    },
    {
      category: 'Lease Information',
      checks: [
        { field: 'Monthly Rent', valid: !!leaseDetails.monthlyRent && leaseDetails.monthlyRent > 0, required: true },
        { field: 'Remaining Term', valid: !!leaseDetails.remainingLeaseTermYears && leaseDetails.remainingLeaseTermYears > 0, required: true },
        { field: 'Lease Type', valid: !!leaseDetails.leaseType, required: true },
        { field: 'Renewal Options', valid: leaseDetails.renewalOptionsCount !== undefined, required: false }
      ]
    },
    {
      category: 'Operations',
      checks: [
        { field: 'Equipment Inventory', valid: machineInventory.length > 0, required: true },
        { field: 'Operating Expenses', valid: expenseItems.length > 0, required: true },
        { field: 'Machine Revenue', valid: machineInventory.some(m => m.vendPricePerUse > 0), required: false }
      ]
    }
  ];

  const getOverallCompleteness = () => {
    const allChecks = validations.flatMap(v => v.checks);
    const requiredChecks = allChecks.filter(c => c.required);
    const completedRequired = requiredChecks.filter(c => c.valid).length;
    const optionalChecks = allChecks.filter(c => !c.required);
    const completedOptional = optionalChecks.filter(c => c.valid).length;
    
    const requiredScore = (completedRequired / requiredChecks.length) * 80; // 80% weight for required
    const optionalScore = (completedOptional / optionalChecks.length) * 20; // 20% weight for optional
    
    return Math.round(requiredScore + optionalScore);
  };

  const getCompletionStatus = (percentage: number) => {
    if (percentage >= 90) return { label: 'Excellent', color: 'text-green-600', icon: CheckCircle };
    if (percentage >= 70) return { label: 'Good', color: 'text-blue-600', icon: Info };
    if (percentage >= 50) return { label: 'Fair', color: 'text-yellow-600', icon: AlertTriangle };
    return { label: 'Needs Work', color: 'text-red-600', icon: XCircle };
  };

  const overallPercentage = getOverallCompleteness();
  const status = getCompletionStatus(overallPercentage);
  const StatusIcon = status.icon;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <StatusIcon className={`h-5 w-5 ${status.color}`} />
            Deal Completion Summary
          </CardTitle>
          <CardDescription>
            Review your deal data completeness and accuracy before final analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Overall Completion</span>
              <Badge variant="secondary" className={status.color}>
                {status.label} ({overallPercentage}%)
              </Badge>
            </div>
            <Progress value={overallPercentage} className="h-2" />
          </div>

          {overallPercentage < 70 && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Recommendation:</strong> Complete more required fields for a more accurate analysis. 
                Focus on the missing items highlighted below.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {validations.map((validation, index) => {
          const categoryChecks = validation.checks;
          const completedChecks = categoryChecks.filter(c => c.valid).length;
          const categoryPercentage = Math.round((completedChecks / categoryChecks.length) * 100);
          
          return (
            <Card key={index}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">{validation.category}</CardTitle>
                  <Badge variant="outline">
                    {completedChecks}/{categoryChecks.length} Complete
                  </Badge>
                </div>
                <Progress value={categoryPercentage} className="h-1" />
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  {categoryChecks.map((check, checkIndex) => (
                    <div key={checkIndex} className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-2">
                        {check.valid ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className={`text-sm ${check.valid ? 'text-green-700' : 'text-red-700'}`}>
                          {check.field}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        {check.required && (
                          <Badge variant="destructive" className="text-xs">Required</Badge>
                        )}
                        {!check.required && (
                          <Badge variant="secondary" className="text-xs">Optional</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {overallPercentage >= 70 && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Ready for Analysis!</strong> Your deal data is sufficiently complete for accurate 
            financial analysis and projections.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
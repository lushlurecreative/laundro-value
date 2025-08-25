import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { HelpTooltip } from "@/components/ui/help-tooltip";
import { useDeal } from '@/contexts/useDeal';
import { InfoIcon, CheckCircle, FileText, Calculator } from 'lucide-react';

export const IncomeVerification: React.FC = () => {
  const { deal } = useDeal();

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const verificationMethods = [
    {
      method: 'Financial Statements',
      description: 'Review P&L statements for the last 2-3 years',
      importance: 'Critical',
      documents: ['Profit & Loss Statements', 'Tax Returns', 'Bank Statements']
    },
    {
      method: 'Machine Revenue Reports',
      description: 'Analyze individual machine performance and collection data',
      importance: 'High',
      documents: ['Machine Collection Reports', 'Vend Price Sheets', 'Usage Logs']
    },
    {
      method: 'Utility Analysis',
      description: 'Verify income through water usage and utility costs correlation',
      importance: 'High',
      documents: ['Water Bills', 'Electric Bills', 'Usage Calculations'],
      tooltip: 'This section helps you verify the seller\'s reported income by comparing it to industry-standard utility usage. It can flag discrepancies that may indicate inflated revenue claims.'
    },
    {
      method: 'Third-Party Verification',
      description: 'Independent verification through distributor or route operators',
      importance: 'Medium',
      documents: ['Distributor Reports', 'Route Collection Data', 'Service Records']
    },
    {
      method: 'Physical Count',
      description: 'Observe operations and count transactions during peak times',
      importance: 'Medium',
      documents: ['Observation Notes', 'Transaction Counts', 'Time Studies']
    }
  ];

  const redFlags = [
    'Incomplete or missing financial records',
    'Large discrepancies between reported and calculated income',
    'Unusual seasonal variations without explanation',
    'High percentage of cash transactions without documentation',
    'Seller reluctance to provide verification documents',
    'Machine counts that don\'t match revenue claims',
    'Utility usage that doesn\'t correlate with reported volume'
  ];

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'Critical': return 'bg-red-100 text-red-800';
      case 'High': return 'bg-yellow-100 text-yellow-800';
      case 'Medium': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertDescription>
          <strong>Income Verification:</strong> This section helps you understand how to verify the income claims 
          for your laundromat deal. Proper income verification is critical for making an informed investment decision.
        </AlertDescription>
      </Alert>

      {/* What is Income Verification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            What is Income Verification?
            <HelpTooltip content="Learn the fundamentals of verifying laundromat income claims" />
          </CardTitle>
          <CardDescription>
            Understanding the process and importance of verifying income claims
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="prose prose-sm max-w-none">
            <p>
              Income verification is the process of independently confirming that the income claimed by the seller 
              is accurate and sustainable. In laundromat transactions, sellers may overstate income or present 
              temporary peak performance as normal operations.
            </p>
            
            <h4 className="font-semibold mt-4 mb-2">Why is it Important?</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Laundromat values are typically based on income multiples (3-5x annual net income)</li>
              <li>Small income discrepancies can result in major overpayment</li>
              <li>Banks require verified income for financing approval</li>
              <li>Helps identify seasonal trends and growth potential</li>
              <li>Protects against fraud and misrepresentation</li>
            </ul>

            <h4 className="font-semibold mt-4 mb-2">Common Income Verification Challenges:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Cash-heavy business with limited paper trail</li>
              <li>Seasonal and daily usage variations</li>
              <li>Multiple revenue streams (machines, vending, services)</li>
              <li>Owner-operated businesses with mixed personal/business expenses</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Current Deal Income Summary */}
      {deal && (
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Your Deal Income Summary
              <HelpTooltip content="Summary of income data for your current deal that needs verification" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground">Claimed Gross Income</p>
                <p className="text-xl font-bold">{formatCurrency(deal.grossIncomeAnnual || 0)}</p>
                <p className="text-xs text-muted-foreground">Requires verification</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Claimed Net Income</p>
                <p className="text-xl font-bold">{formatCurrency(deal.annualNet || 0)}</p>
                <p className="text-xs text-muted-foreground">Requires verification</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Asking Price</p>
                <p className="text-xl font-bold">{formatCurrency(deal.askingPrice || 0)}</p>
                <p className="text-xs text-muted-foreground">
                  {deal.annualNet > 0 ? `${(deal.askingPrice / deal.annualNet).toFixed(1)}x` : 'N/A'} multiple
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Verification Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Income Verification Methods
            <HelpTooltip content="Different approaches to verify laundromat income claims" />
          </CardTitle>
          <CardDescription>
            Step-by-step approaches to verify income claims
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {verificationMethods.map((method, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold">{method.method}</h4>
                  <Badge variant="secondary" className={getImportanceColor(method.importance)}>
                    {method.importance}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">{method.description}</p>
                
                <div>
                  <p className="text-sm font-medium mb-1">Required Documents:</p>
                  <div className="flex flex-wrap gap-1">
                    {method.documents.map((doc, docIndex) => (
                      <Badge key={docIndex} variant="outline" className="text-xs">
                        {doc}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Red Flags */}
      <Card className="border-destructive/20 bg-destructive/5">
        <CardHeader>
          <CardTitle className="text-destructive">Income Verification Red Flags</CardTitle>
          <CardDescription>
            Warning signs that require additional scrutiny or may indicate problems
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {redFlags.map((flag, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="w-2 h-2 bg-destructive rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm">{flag}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* How to Use This Information */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use This Information</CardTitle>
          <CardDescription>
            Practical steps for implementing income verification in your deal
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">During Due Diligence:</h4>
              <ul className="text-sm space-y-1">
                <li>• Request 2-3 years of financial statements</li>
                <li>• Analyze monthly trends and seasonality</li>
                <li>• Cross-reference multiple verification methods</li>
                <li>• Calculate income per machine and compare to Industry Standards</li>
                <li>• Verify utility usage correlates with claimed volume</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Before Closing:</h4>
              <ul className="text-sm space-y-1">
                <li>• Conduct final walk-through during peak hours</li>
                <li>• Verify all machines are operational</li>
                <li>• Confirm pricing matches projections</li>
                <li>• Review most recent collection reports</li>
                <li>• Document any discrepancies for price negotiation</li>
              </ul>
            </div>
          </div>

          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertDescription>
              <strong>Professional Tip:</strong> Consider hiring a laundromat consultant or accountant experienced 
              with laundromat transactions to review financials. The cost ($500-2,000) is minimal compared to 
              potential overpayment from unverified income claims.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useDeal } from '@/contexts/useDeal';
import { FileText, Download, DollarSign, Calculator, TrendingUp, Building2 } from 'lucide-react';

export const PremiumReports: React.FC = () => {
  const { deal, leaseDetails, expenseItems, machineInventory } = useDeal();

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const generateFinancingPackage = () => {
    const packageData = {
      deal,
      leaseDetails,
      expenseItems,
      machineInventory,
      projections: {
        year1: deal?.grossIncomeAnnual || 0,
        year2: (deal?.grossIncomeAnnual || 0) * 1.03,
        year3: (deal?.grossIncomeAnnual || 0) * 1.06,
        year5: (deal?.grossIncomeAnnual || 0) * 1.13,
      },
      metrics: {
        capRate: deal?.annualNet && deal?.askingPrice ? (deal.annualNet / deal.askingPrice) * 100 : 0,
        dscr: 1.35, // Example calculation
        ltv: deal?.downPaymentPercent ? 100 - deal.downPaymentPercent : 75,
      }
    };

    // In a real app, this would generate a PDF
    console.log('Generating financing package:', packageData);
    alert('Financing package generated! In production, this would download a comprehensive PDF report.');
  };

  const reportTypes = [
    {
      title: 'Bank Financing Package',
      description: 'Complete loan application package for SBA and conventional lenders',
      icon: Building2,
      includes: [
        'Executive Summary',
        'Financial Projections (5-year)',
        'Market Analysis',
        'Equipment Valuation',
        'Personal Financial Statement Template',
        'Business Plan Summary',
        'Risk Assessment',
        'Loan Request Letter Template'
      ],
      premium: true
    },
    {
      title: 'Investment Analysis Report',
      description: 'Comprehensive deal analysis with AI insights and recommendations',
      icon: Calculator,
      includes: [
        'Financial Performance Analysis',
        'Market Comparison Study',
        'ROI Projections',
        'Risk Analysis',
        'Exit Strategy Planning',
        'Industry Benchmarking',
        'AI-Powered Insights'
      ],
      premium: true
    },
    {
      title: 'Due Diligence Checklist',
      description: 'Professional checklist for thorough deal evaluation',
      icon: FileText,
      includes: [
        'Financial Verification Steps',
        'Legal Review Checklist',
        'Equipment Inspection Guide',
        'Market Research Template',
        'Negotiation Strategies',
        'Closing Process Guide'
      ],
      premium: false
    },
    {
      title: 'Operational Improvement Plan',
      description: 'Strategies to maximize income and efficiency post-acquisition',
      icon: TrendingUp,
      includes: [
        'Revenue Optimization Strategies',
        'Cost Reduction Opportunities',
        'Technology Upgrade Plan',
        'Marketing Recommendations',
        'Operational Efficiency Improvements',
        'Customer Experience Enhancements'
      ],
      premium: true
    }
  ];

  return (
    <div className="space-y-6">
      <Alert>
        <FileText className="h-4 w-4" />
        <AlertDescription>
          <strong>Premium Reports:</strong> Generate professional reports and financing packages 
          that you can print and provide to banks, investors, or advisors.
        </AlertDescription>
      </Alert>

      {/* Current Deal Summary */}
      {deal && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle>Your Deal Summary</CardTitle>
            <CardDescription>
              Report data based on your current deal analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground">Property</p>
                <p className="font-semibold">{deal.propertyAddress || 'Address not set'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Asking Price</p>
                <p className="font-semibold">{formatCurrency(deal.askingPrice || 0)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Annual Income</p>
                <p className="font-semibold">{formatCurrency(deal.grossIncomeAnnual || 0)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Equipment Count</p>
                <p className="font-semibold">{machineInventory.length} machines</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportTypes.map((report, index) => {
          const IconComponent = report.icon;
          
          return (
            <Card key={index} className={report.premium ? 'border-primary/20' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <IconComponent className="h-5 w-5" />
                    <CardTitle className="text-lg">{report.title}</CardTitle>
                  </div>
                  {report.premium && (
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      Premium
                    </Badge>
                  )}
                </div>
                <CardDescription>{report.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Includes:</p>
                  <div className="grid grid-cols-1 gap-1">
                    {report.includes.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0"></div>
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Button 
                  className="w-full flex items-center gap-2"
                  variant={report.premium ? "default" : "outline"}
                  onClick={() => {
                    if (report.title === 'Bank Financing Package') {
                      generateFinancingPackage();
                    } else {
                      alert(`${report.title} generation coming soon!`);
                    }
                  }}
                  disabled={!deal && report.premium}
                >
                  <Download className="h-4 w-4" />
                  {report.premium ? 'Generate Report' : 'Download Template'}
                </Button>
                
                {report.premium && !deal && (
                  <p className="text-xs text-muted-foreground text-center">
                    Complete deal analysis to generate this report
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Bank Financing Package Details */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <DollarSign className="h-5 w-5" />
            Bank Financing Package - What Lenders Want
          </CardTitle>
          <CardDescription className="text-green-600">
            Professional package that significantly improves your loan approval chances
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">SBA Lenders Look For:</h4>
              <ul className="text-sm space-y-1">
                <li>• Detailed financial projections</li>
                <li>• Industry experience or training plan</li>
                <li>• Strong personal credit (700+)</li>
                <li>• 10-15% down payment</li>
                <li>• Debt Service Coverage Ratio 1.25+</li>
                <li>• Comprehensive business plan</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Conventional Lenders Look For:</h4>
              <ul className="text-sm space-y-1">
                <li>• 20-30% down payment</li>
                <li>• Proven business cash flow</li>
                <li>• Strong personal financials</li>
                <li>• Local market knowledge</li>
                <li>• Equipment collateral value</li>
                <li>• Lease assignment capability</li>
              </ul>
            </div>
          </div>

          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription>
              <strong>Pro Tip:</strong> Having a professional financing package can reduce approval 
              time by 2-4 weeks and increase your negotiating power with lenders. Many successful 
              buyers report this as the key factor in securing favorable loan terms.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};
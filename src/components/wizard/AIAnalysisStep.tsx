import React, { useState, useEffect } from 'react';
import { useDeal } from '@/contexts/useDeal';
import { useAuth } from '@/contexts/AuthContext';
import { AIInsightsDashboard } from '@/components/AIInsightsDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Zap,
  BarChart3
} from 'lucide-react';

export const AIAnalysisStep: React.FC = () => {
  const { deal, expenseItems, machineInventory, leaseDetails } = useDeal();
  const { user } = useAuth();
  const [analysisReadiness, setAnalysisReadiness] = useState(0);
  const [missingData, setMissingData] = useState<string[]>([]);

  useEffect(() => {
    calculateReadiness();
  }, [deal, expenseItems, machineInventory, leaseDetails]);

  const calculateReadiness = () => {
    const checks = [
      { name: 'Asking Price', value: deal?.askingPrice },
      { name: 'Gross Income', value: deal?.grossIncomeAnnual },
      { name: 'Property Address', value: deal?.propertyAddress },
      { name: 'Facility Size', value: deal?.facilitySizeSqft },
      { name: 'Lease Details', value: leaseDetails?.monthlyRent },
      { name: 'Expenses', value: expenseItems?.length > 0 },
      { name: 'Equipment Info', value: machineInventory?.length > 0 }
    ];

    const passedChecks = checks.filter(check => check.value).length;
    const readinessPercent = Math.round((passedChecks / checks.length) * 100);
    
    const missing = checks
      .filter(check => !check.value)
      .map(check => check.name);

    setAnalysisReadiness(readinessPercent);
    setMissingData(missing);
  };

  const getReadinessBadge = () => {
    if (analysisReadiness >= 85) return { variant: 'default' as const, text: 'Ready for Analysis', icon: CheckCircle };
    if (analysisReadiness >= 60) return { variant: 'secondary' as const, text: 'Mostly Ready', icon: Clock };
    return { variant: 'destructive' as const, text: 'Needs More Data', icon: AlertTriangle };
  };

  const dealId = deal?.dealId || `deal-${Date.now()}`;
  const readinessBadge = getReadinessBadge();

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-blue-600" />
            AI Intelligence Analysis
          </CardTitle>
          <CardDescription>
            Comprehensive AI-powered analysis of your laundromat investment opportunity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Analysis Readiness</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Data Completeness</span>
                  <Badge variant={readinessBadge.variant}>
                    <readinessBadge.icon className="h-3 w-3 mr-1" />
                    {readinessBadge.text}
                  </Badge>
                </div>
                <Progress value={analysisReadiness} className="h-2" />
                <p className="text-sm text-muted-foreground">
                  {analysisReadiness}% complete - {analysisReadiness >= 85 ? 'Ready for comprehensive analysis' : 'Add more data for better insights'}
                </p>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">AI Capabilities</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <Zap className="h-3 w-3 text-green-500" />
                  <span>Market Analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-3 w-3 text-green-500" />
                  <span>Financial Scoring</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-3 w-3 text-green-500" />
                  <span>Risk Assessment</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-3 w-3 text-green-500" />
                  <span>Revenue Optimization</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-3 w-3 text-green-500" />
                  <span>Expense Validation</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-3 w-3 text-green-500" />
                  <span>Smart Recommendations</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Missing Data Alert */}
      {missingData.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Missing Data:</strong> {missingData.join(', ')}. 
            Complete these fields for more accurate AI analysis.
          </AlertDescription>
        </Alert>
      )}

      {/* Analysis Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <BarChart3 className="h-6 w-6 text-blue-500" />
              <h3 className="font-semibold">Market Intelligence</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Location analysis, demographic scoring, competition assessment, and market opportunity evaluation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="h-6 w-6 text-green-500" />
              <h3 className="font-semibold">Financial Analysis</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              ROI calculations, expense validation, revenue optimization, and value assessment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className="h-6 w-6 text-orange-500" />
              <h3 className="font-semibold">Risk Assessment</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Comprehensive risk scoring, success probability, and mitigation strategies
            </p>
          </CardContent>
        </Card>
      </div>

      {/* AI Dashboard */}
      <AIInsightsDashboard 
        dealId={dealId}
        dealData={{
          askingPrice: deal?.askingPrice,
          grossIncomeAnnual: deal?.grossIncomeAnnual,
          annualNet: deal?.annualNet,
          facilitySizeSqft: deal?.facilitySizeSqft,
          propertyAddress: deal?.propertyAddress,
          lease: leaseDetails,
          expenses: expenseItems,
          equipment: null, // Derived from machineInventory
          machineInventory: machineInventory
        }}
        onRunAnalysis={() => {}}
      />

      {/* Pro Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">💡 Pro Tips for Better AI Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Data Quality Matters</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Provide accurate expense breakdowns</li>
                <li>• Include detailed equipment information</li>
                <li>• Complete lease terms and conditions</li>
                <li>• Verify income and expense figures</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Maximize AI Insights</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Run analysis after each major data update</li>
                <li>• Review recommendations carefully</li>
                <li>• Use market insights for negotiation</li>
                <li>• Consider risk factors in decision making</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
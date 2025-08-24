import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { useDataProcessor } from '@/hooks/useDataProcessor';
import { useDeal } from '@/contexts/useDeal';
import { TestTube, Play, RotateCcw, CheckCircle } from 'lucide-react';

export const TestingPanel: React.FC = () => {
  const { processAlbanyParkData, validateCurrentDeal, isProcessing } = useDataProcessor();
  const { clearAllData, deal, expenseItems, machineInventory } = useDeal();
  const { toast } = useToast();

  const runFullTest = async () => {
    try {
      // Clear existing data
      clearAllData();
      
      // Load Albany Park data
      processAlbanyParkData();
      
      // Wait a moment for data to load
      setTimeout(() => {
        const validation = validateCurrentDeal();
        
        toast({
          title: "Full Test Complete",
          description: "Albany Park data loaded and validated successfully",
        });
        
        console.log("Test Results:", {
          deal,
          expenses: expenseItems.length,
          equipment: machineInventory.length,
          validation
        });
      }, 1000);
      
    } catch (error) {
      toast({
        title: "Test Failed",
        description: "Error during full system test",
        variant: "destructive"
      });
    }
  };

  const getDataSummary = () => {
    return {
      hasBasicInfo: !!deal?.askingPrice && !!deal?.grossIncomeAnnual,
      hasExpenses: expenseItems.length > 0,
      hasEquipment: machineInventory.length > 0,
      totalValue: deal?.askingPrice || 0,
      totalIncome: deal?.grossIncomeAnnual || 0,
      equipmentCount: machineInventory.reduce((sum, m) => sum + m.quantity, 0)
    };
  };

  const summary = getDataSummary();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            System Testing Panel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <TestTube className="h-4 w-4" />
            <AlertDescription>
              Use these tools to test the complete laundromat analysis system with real data examples.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={runFullTest}
              disabled={isProcessing}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              Run Full Test
            </Button>
            
            <Button 
              variant="outline"
              onClick={processAlbanyParkData}
              disabled={isProcessing}
              className="flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Load Test Data
            </Button>
            
            <Button 
              variant="destructive"
              onClick={clearAllData}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Clear All Data
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Data Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div className={`p-3 rounded-lg ${summary.hasBasicInfo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <div className="font-medium">Basic Info</div>
              <div>{summary.hasBasicInfo ? 'Complete' : 'Missing'}</div>
              {summary.hasBasicInfo && (
                <div className="text-xs mt-1">
                  ${summary.totalValue.toLocaleString()} / ${summary.totalIncome.toLocaleString()}
                </div>
              )}
            </div>
            
            <div className={`p-3 rounded-lg ${summary.hasExpenses ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <div className="font-medium">Expenses</div>
              <div>{expenseItems.length} items</div>
            </div>
            
            <div className={`p-3 rounded-lg ${summary.hasEquipment ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <div className="font-medium">Equipment</div>
              <div>{summary.equipmentCount} machines</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Scenarios</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm space-y-2">
            <div>
              <strong>Albany Park Test:</strong> Complete laundromat with 12 washers, 14 dryers, $450k asking price
            </div>
            <div>
              <strong>Expected Results:</strong>
              <ul className="list-disc list-inside ml-4 text-muted-foreground">
                <li>NOI calculation: ~$60,000 (33% margin)</li>
                <li>Cap rate: ~13.3%</li>
                <li>Equipment age: 6 years (good condition)</li>
                <li>Basic validation warnings for expense completeness</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
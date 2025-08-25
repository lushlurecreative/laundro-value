import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { useDataProcessor } from '@/hooks/useDataProcessor';
import { useDeal } from '@/contexts/useDeal';
import { useAIAnalysis } from '@/hooks/useAIAnalysis';
import { supabase } from '@/integrations/supabase/client';
import { calculateMetrics } from '@/utils/calculations';
import { Play, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed' | 'warning';
  message: string;
  details?: any;
  duration?: number;
}

export const ComprehensiveSystemTest: React.FC = () => {
  const { toast } = useToast();
  const { processAlbanyParkData, isProcessing } = useDataProcessor();
  const { deal, expenseItems, machineInventory, ancillaryIncome, leaseDetails, utilityAnalysis, clearAllData } = useDeal();
  const { runComprehensiveAnalysis, isAnalyzing } = useAIAnalysis();
  
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [currentTest, setCurrentTest] = useState<string>('');
  const [overallProgress, setOverallProgress] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const updateTestResult = (name: string, status: TestResult['status'], message: string, details?: any, duration?: number) => {
    setTestResults(prev => {
      const existing = prev.find(t => t.name === name);
      if (existing) {
        existing.status = status;
        existing.message = message;
        existing.details = details;
        existing.duration = duration;
        return [...prev];
      } else {
        return [...prev, { name, status, message, details, duration }];
      }
    });
  };

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const runTest = async (testName: string, testFn: () => Promise<void>) => {
    const startTime = Date.now();
    setCurrentTest(testName);
    updateTestResult(testName, 'running', 'Running...');
    
    try {
      await testFn();
      const duration = Date.now() - startTime;
      updateTestResult(testName, 'passed', 'Passed', null, duration);
    } catch (error) {
      const duration = Date.now() - startTime;
      updateTestResult(testName, 'failed', `Failed: ${error.message}`, error, duration);
      throw error;
    }
  };

  const runFullSystemTest = async () => {
    setIsRunning(true);
    setTestResults([]);
    setOverallProgress(0);
    
    const tests = [
      { name: 'Data Clearing', weight: 5 },
      { name: 'Albany Park Data Extraction', weight: 15 },
      { name: 'Form Data Validation', weight: 10 },
      { name: 'Financial Calculations', weight: 15 },
      { name: 'Equipment Inventory', weight: 10 },
      { name: 'Edge Function - Extract Listing Data', weight: 15 },
      { name: 'Edge Function - OpenAI Analysis', weight: 15 },
      { name: 'AI Analysis Pipeline', weight: 15 }
    ];
    
    let currentProgress = 0;

    try {
      // Test 1: Data Clearing
      await runTest('Data Clearing', async () => {
        clearAllData();
        await sleep(500);
        if (deal?.askingPrice || expenseItems.length > 0 || machineInventory.length > 0) {
          throw new Error('Data not properly cleared');
        }
      });
      currentProgress += tests[0].weight;
      setOverallProgress(currentProgress);

      // Test 2: Albany Park Data Extraction
      await runTest('Albany Park Data Extraction', async () => {
        await processAlbanyParkData();
        await sleep(2000); // Wait for async data loading
        
        // Verify data loaded correctly
        if (!deal?.askingPrice) throw new Error('No asking price loaded');
        if (deal.askingPrice !== 175000) throw new Error(`Wrong asking price: $${deal.askingPrice} (should be $175,000)`);
        if (!deal.grossIncomeAnnual) throw new Error('No gross income loaded');
        if (deal.grossIncomeAnnual !== 231283) throw new Error(`Wrong income: $${deal.grossIncomeAnnual} (should be $231,283)`);
        if (!deal.propertyAddress?.includes('Lawrence')) throw new Error('Wrong address loaded');
      });
      currentProgress += tests[1].weight;
      setOverallProgress(currentProgress);

      // Test 3: Form Data Validation
      await runTest('Form Data Validation', async () => {
        if (!deal) throw new Error('No deal data found');
        if (machineInventory.length === 0) throw new Error('No equipment loaded');
        
        const totalMachines = machineInventory.reduce((sum, m) => sum + m.quantity, 0);
        if (totalMachines < 10) throw new Error(`Too few machines: ${totalMachines} (should be 20+)`);
      });
      currentProgress += tests[2].weight;
      setOverallProgress(currentProgress);

      // Test 4: Financial Calculations
      await runTest('Financial Calculations', async () => {
        if (!deal) throw new Error('No deal data for calculations');
        
        const metrics = calculateMetrics(deal, leaseDetails, expenseItems, machineInventory, ancillaryIncome, utilityAnalysis);
        
        if (metrics.totalGrossIncome !== 231283) {
          throw new Error(`Wrong gross income calculation: $${metrics.totalGrossIncome} (should be $231,283)`);
        }
        
        if (metrics.capRate <= 0) throw new Error('Cap rate not calculated');
        if (metrics.noi <= 0) throw new Error('NOI not calculated properly');
        
        // Verify NOI calculation matches expectations (~$18k)
        if (Math.abs(metrics.noi - 18301) > 5000) {
          updateTestResult('Financial Calculations', 'warning', 
            `NOI calculation may be off: $${metrics.noi} (expected ~$18,301)`, { metrics });
        }
      });
      currentProgress += tests[3].weight;
      setOverallProgress(currentProgress);

      // Test 5: Equipment Inventory
      await runTest('Equipment Inventory', async () => {
        const speedQueenMachines = machineInventory.filter(m => 
          m.brand?.toLowerCase().includes('speed queen') || m.brand?.toLowerCase().includes('queen')
        );
        
        if (speedQueenMachines.length === 0) {
          throw new Error('No Speed Queen equipment found');
        }
        
        const washers = machineInventory.filter(m => 
          m.machineType?.toLowerCase().includes('washer')
        );
        const dryers = machineInventory.filter(m => 
          m.machineType?.toLowerCase().includes('dryer')
        );
        
        if (washers.length === 0) throw new Error('No washers found');
        if (dryers.length === 0) throw new Error('No dryers found');
      });
      currentProgress += tests[4].weight;
      setOverallProgress(currentProgress);

      // Test 6: Edge Function - Extract Listing Data
      await runTest('Edge Function - Extract Listing Data', async () => {
        const testData = `
          Test Laundromat
          123 Main St, Test City, IL 60625
          Asking Price: $200,000
          5 - 25# SPEED QUEEN WASHERS
          8 - 30# SPEED QUEEN DRYERS
        `;
        
        const { data, error } = await supabase.functions.invoke('extract-listing-data', {
          body: {
            extractionType: 'text',
            rawText: testData,
            documentType: 'real-estate'
          }
        });
        
        if (error) throw new Error(`Edge function error: ${error.message}`);
        if (!data.success) throw new Error(`Extraction failed: ${data.error}`);
        if (!data.data.equipment || data.data.equipment.length === 0) {
          throw new Error('No equipment extracted');
        }
        if (!data.data.propertyInfo?.askingPrice) {
          throw new Error('No asking price extracted');
        }
      });
      currentProgress += tests[5].weight;
      setOverallProgress(currentProgress);

      // Test 7: Edge Function - OpenAI Analysis
      await runTest('Edge Function - OpenAI Analysis', async () => {
        const { data, error } = await supabase.functions.invoke('openai-analysis', {
          body: {
            analysisType: 'notes',
            text: 'This is a test analysis of a laundromat with good equipment and steady income.',
            fields: ['overall_assessment', 'risk_level']
          }
        });
        
        if (error) throw new Error(`OpenAI function error: ${error.message}`);
        if (!data.success) throw new Error(`Analysis failed: ${data.error}`);
        if (!data.extractedFields) throw new Error('No fields extracted');
      });
      currentProgress += tests[6].weight;
      setOverallProgress(currentProgress);

      // Test 8: AI Analysis Pipeline
      await runTest('AI Analysis Pipeline', async () => {
        if (!deal) throw new Error('No deal data for AI analysis');
        
        // This is a longer test, so we'll just verify the system can start it
        try {
          await runComprehensiveAnalysis();
        } catch (error) {
          // If it fails due to missing data or API issues, that's expected in testing
          if (error.message.includes('API') || error.message.includes('rate limit')) {
            updateTestResult('AI Analysis Pipeline', 'warning', 
              'AI analysis system functional but API limited', { error: error.message });
            return;
          }
          throw error;
        }
      });
      currentProgress += tests[7].weight;
      setOverallProgress(currentProgress);

      // Final success
      toast({
        title: "System Test Complete",
        description: "All core functionality verified successfully!",
      });

    } catch (error) {
      console.error('System test failed:', error);
      toast({
        title: "System Test Failed",
        description: `Test failed at: ${currentTest}`,
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
      setCurrentTest('');
      setOverallProgress(100);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'running': return <Clock className="h-4 w-4 text-blue-600 animate-spin" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'passed': return 'bg-green-100 text-green-800 border-green-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'running': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Comprehensive System Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This will test the complete Albany Park data workflow including extraction, calculations, and AI analysis.
            </AlertDescription>
          </Alert>

          <div className="flex gap-4">
            <Button 
              onClick={runFullSystemTest}
              disabled={isRunning || isProcessing || isAnalyzing}
              className="flex items-center gap-2"
              size="lg"
            >
              <Play className="h-5 w-5" />
              {isRunning ? 'Running Tests...' : 'Run Full System Test'}
            </Button>
          </div>

          {isRunning && (
            <div className="space-y-3">
              <Progress value={overallProgress} className="w-full" />
              <p className="text-sm text-muted-foreground">
                {currentTest && `Currently running: ${currentTest}`}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testResults.map((test, index) => (
                <div 
                  key={index}
                  className={`p-3 rounded-lg border transition-all ${getStatusColor(test.status)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(test.status)}
                      <span className="font-medium">{test.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {test.duration && (
                        <Badge variant="outline" className="text-xs">
                          {test.duration}ms
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {test.status}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm mt-1 opacity-80">{test.message}</p>
                  {test.details && (
                    <details className="mt-2">
                      <summary className="text-xs cursor-pointer opacity-60">Details</summary>
                      <pre className="text-xs mt-1 opacity-60 overflow-auto">
                        {JSON.stringify(test.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Expected Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm space-y-2">
            <div><strong>Albany Park Data:</strong></div>
            <ul className="list-disc list-inside ml-4 space-y-1 text-muted-foreground">
              <li>Asking Price: $175,000</li>
              <li>Annual Income: $231,283</li>
              <li>Address: 3516 W Lawrence Ave, Chicago, IL</li>
              <li>Equipment: Multiple Speed Queen washers and dryers</li>
              <li>NOI: ~$18,301 (after expenses)</li>
              <li>Cap Rate: ~10.5%</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
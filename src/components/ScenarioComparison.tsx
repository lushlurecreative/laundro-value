import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useDeal } from '@/contexts/useDeal';
import { calculateMetrics, formatCurrency, formatPercentage, calculateBreakevenAnalysis } from '@/utils/calculations';
import { Trash2, Plus, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface SavedScenario {
  id: string;
  name: string;
  dealData: any;
  leaseData: any;
  expenses: any[];
  inventory: any[];
  ancillaryIncome: any;
  savedAt: string;
}

export const ScenarioComparison: React.FC = () => {
  const { deal, leaseDetails, expenseItems, machineInventory, ancillaryIncome, utilityAnalysis } = useDeal();
  const { toast } = useToast();
  const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>([]);
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([]);
  const [scenarioName, setScenarioName] = useState('');

  useEffect(() => {
    loadSavedScenarios();
  }, []);

  const loadSavedScenarios = () => {
    const saved = localStorage.getItem('savedScenarios');
    if (saved) {
      setSavedScenarios(JSON.parse(saved));
    }
  };

  const saveCurrentScenario = () => {
    if (!scenarioName.trim()) {
      toast({
        title: "Scenario Name Required",
        description: "Please enter a name for this scenario",
        variant: "destructive"
      });
      return;
    }

    const newScenario: SavedScenario = {
      id: Date.now().toString(),
      name: scenarioName.trim(),
      dealData: deal,
      leaseData: leaseDetails,
      expenses: expenseItems,
      inventory: machineInventory,
      ancillaryIncome,
      savedAt: new Date().toISOString()
    };

    const updatedScenarios = [...savedScenarios, newScenario];
    setSavedScenarios(updatedScenarios);
    localStorage.setItem('savedScenarios', JSON.stringify(updatedScenarios));
    setScenarioName('');

    toast({
      title: "Scenario Saved",
      description: `"${newScenario.name}" has been saved for comparison`,
    });
  };

  const deleteScenario = (scenarioId: string) => {
    const updatedScenarios = savedScenarios.filter(s => s.id !== scenarioId);
    setSavedScenarios(updatedScenarios);
    localStorage.setItem('savedScenarios', JSON.stringify(updatedScenarios));
    setSelectedScenarios(selectedScenarios.filter(id => id !== scenarioId));
  };

  const toggleScenarioSelection = (scenarioId: string) => {
    if (selectedScenarios.includes(scenarioId)) {
      setSelectedScenarios(selectedScenarios.filter(id => id !== scenarioId));
    } else if (selectedScenarios.length < 3) {
      setSelectedScenarios([...selectedScenarios, scenarioId]);
    } else {
      toast({
        title: "Maximum Scenarios",
        description: "You can compare up to 3 scenarios at once",
        variant: "destructive"
      });
    }
  };

  const getScenarioMetrics = (scenario: SavedScenario) => {
    return calculateMetrics(
      scenario.dealData,
      scenario.leaseData,
      scenario.expenses,
      scenario.inventory,
      scenario.ancillaryIncome,
      null
    );
  };

  const currentMetrics = calculateMetrics(deal, leaseDetails, expenseItems, machineInventory, ancillaryIncome, utilityAnalysis);
  const currentBreakeven = calculateBreakevenAnalysis(deal, expenseItems, ancillaryIncome);

  const compareValue = (current: number, other: number, isPercentage = false) => {
    const diff = current - other;
    const percentDiff = other !== 0 ? (diff / Math.abs(other)) * 100 : 0;
    
    if (Math.abs(diff) < 0.01) {
      return <span className="text-muted-foreground flex items-center"><Minus className="h-3 w-3 mr-1" />Same</span>;
    }
    
    const isPositive = diff > 0;
    const icon = isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />;
    const color = isPositive ? 'text-green-600' : 'text-red-600';
    
    return (
      <span className={`${color} flex items-center text-sm`}>
        {icon}
        {isPercentage ? formatPercentage(Math.abs(percentDiff)) : formatCurrency(Math.abs(diff))}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Save Current Scenario */}
      <Card>
        <CardHeader>
          <CardTitle>Save Current Scenario</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Enter scenario name..."
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-md"
            />
            <Button onClick={saveCurrentScenario}>
              <Plus className="h-4 w-4 mr-2" />
              Save Scenario
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Scenario Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Saved Scenarios ({savedScenarios.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedScenarios.map((scenario) => (
              <div
                key={scenario.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedScenarios.includes(scenario.id)
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => toggleScenarioSelection(scenario.id)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">{scenario.name}</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteScenario(scenario.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Saved: {new Date(scenario.savedAt).toLocaleDateString()}
                </p>
                <div className="space-y-1 text-sm">
                  <div>Asking Price: {formatCurrency(scenario.dealData?.askingPrice || 0)}</div>
                  <div>Gross Income: {formatCurrency(scenario.dealData?.grossIncomeAnnual || 0)}</div>
                </div>
                {selectedScenarios.includes(scenario.id) && (
                  <Badge className="mt-2">Selected</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comparison Table */}
      {selectedScenarios.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Scenario Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Metric</th>
                    <th className="text-left p-3">Current</th>
                    {selectedScenarios.map((scenarioId) => {
                      const scenario = savedScenarios.find(s => s.id === scenarioId);
                      return (
                        <th key={scenarioId} className="text-left p-3">
                          {scenario?.name || 'Unknown'}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: 'Asking Price', key: 'askingPrice', isPrice: true },
                    { label: 'NOI', key: 'noi', isPrice: true },
                    { label: 'Cash Flow', key: 'annualCashFlow', isPrice: true },
                    { label: 'Cap Rate', key: 'capRate', isPercent: true },
                    { label: 'CoC ROI', key: 'coCROI', isPercent: true },
                    { label: 'DSCR', key: 'dscr', isRatio: true },
                  ].map((metric) => (
                    <tr key={metric.key} className="border-b">
                      <td className="p-3 font-medium">{metric.label}</td>
                      <td className="p-3">
                        {metric.isPrice && formatCurrency(currentMetrics[metric.key as keyof typeof currentMetrics] as number)}
                        {metric.isPercent && formatPercentage(currentMetrics[metric.key as keyof typeof currentMetrics] as number)}
                        {metric.isRatio && (currentMetrics[metric.key as keyof typeof currentMetrics] as number).toFixed(2)}
                      </td>
                      {selectedScenarios.map((scenarioId) => {
                        const scenario = savedScenarios.find(s => s.id === scenarioId);
                        if (!scenario) return <td key={scenarioId} className="p-3">-</td>;
                        
                        const scenarioMetrics = getScenarioMetrics(scenario);
                        const currentValue = currentMetrics[metric.key as keyof typeof currentMetrics] as number;
                        const scenarioValue = scenarioMetrics[metric.key as keyof typeof scenarioMetrics] as number;
                        
                        return (
                          <td key={scenarioId} className="p-3">
                            <div className="space-y-1">
                              <div>
                                {metric.isPrice && formatCurrency(scenarioValue)}
                                {metric.isPercent && formatPercentage(scenarioValue)}
                                {metric.isRatio && scenarioValue.toFixed(2)}
                              </div>
                              {compareValue(currentValue, scenarioValue)}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { HelpTooltip } from "@/components/ui/help-tooltip";
import { useDeal } from '@/contexts/useDeal';
import { Plus, TrendingUp, Lightbulb, DollarSign } from 'lucide-react';

interface FutureIncomeItem {
  id: string;
  description: string;
  strategy: string;
  currentRevenue: number;
  projectedRevenue: number;
  timeframe: string;
  implementationCost: number;
}

export const FutureIncomeAnalysis: React.FC = () => {
  const { deal, updateDeal } = useDeal();
  const [futureIncomeItems, setFutureIncomeItems] = useState<FutureIncomeItem[]>([]);
  const [newItem, setNewItem] = useState<Partial<FutureIncomeItem>>({
    description: '',
    strategy: '',
    currentRevenue: 0,
    projectedRevenue: 0,
    timeframe: '6 months',
    implementationCost: 0,
  });

  const incomeStrategies = [
    'Raise vend prices',
    'Extend operating hours',
    'Add vending machines',
    'Install card payment systems',
    'Add wash-dry-fold service',
    'Add drop-off service',
    'Install security cameras (customer appeal)',
    'Improve lighting and ambiance',
    'Add free WiFi',
    'Install larger capacity machines',
    'Add specialty services (comforters, etc.)',
    'Partner with local businesses',
    'Add coin exchange machine',
    'Install change machines',
    'Add snack/drink vending',
    'Implement loyalty program',
    'Other'
  ];

  const timeframes = [
    '3 months',
    '6 months',
    '1 year',
    '2 years',
    '3+ years'
  ];

  const addFutureIncomeItem = () => {
    if (newItem.description && newItem.strategy) {
      const item: FutureIncomeItem = {
        id: `future-income-${Date.now()}`,
        description: newItem.description || '',
        strategy: newItem.strategy || '',
        currentRevenue: newItem.currentRevenue || 0,
        projectedRevenue: newItem.projectedRevenue || 0,
        timeframe: newItem.timeframe || '6 months',
        implementationCost: newItem.implementationCost || 0,
      };

      setFutureIncomeItems([...futureIncomeItems, item]);
      setNewItem({
        description: '',
        strategy: '',
        currentRevenue: 0,
        projectedRevenue: 0,
        timeframe: '6 months',
        implementationCost: 0,
      });
    }
  };

  const removeFutureIncomeItem = (id: string) => {
    setFutureIncomeItems(futureIncomeItems.filter(item => item.id !== id));
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const calculateTotalProjectedIncrease = () => {
    return futureIncomeItems.reduce((total, item) => {
      return total + (item.projectedRevenue - item.currentRevenue);
    }, 0);
  };

  const calculateTotalImplementationCost = () => {
    return futureIncomeItems.reduce((total, item) => total + item.implementationCost, 0);
  };

  const getStrategyDescription = (strategy: string) => {
    const descriptions: { [key: string]: string } = {
      'Raise vend prices': 'Increase machine pricing to market rates. Typical increases: $0.25-0.50 per load.',
      'Extend operating hours': 'Keep facility open longer. Each additional hour can increase revenue 3-8%.',
      'Add vending machines': 'Soap, snacks, drinks. Typical revenue: $2,000-8,000 annually per machine.',
      'Install card payment systems': 'Increase convenience, typical revenue increase: 15-25%.',
      'Add wash-dry-fold service': 'Premium service. Typical rates: $1.50-3.00 per pound.',
      'Add drop-off service': 'Convenience service. Can add $20,000-50,000 annually.',
      'Install larger capacity machines': 'Premium pricing for larger loads. 20-40% higher rates.',
      'Add specialty services (comforters, etc.)': 'Premium pricing for oversized items.',
      'Implement loyalty program': 'Increase customer retention and frequency. 5-15% revenue increase.',
    };
    return descriptions[strategy] || 'Custom income improvement strategy.';
  };

  return (
    <div className="space-y-6">
      <Alert>
        <TrendingUp className="h-4 w-4" />
        <AlertDescription>
          <strong>Future Income Analysis:</strong> Plan potential income improvements and calculate their financial impact. 
          This analysis will be included in your AI deal evaluation and projections.
        </AlertDescription>
      </Alert>

      {/* Add New Future Income Item */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Add Income Improvement Strategy
          </CardTitle>
          <CardDescription>
            Identify opportunities to increase revenue and calculate their potential impact
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strategy Selection */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Improvement Strategy
                <HelpTooltip content="Select the type of income improvement you're considering" />
              </Label>
              <Select 
                value={newItem.strategy || ''} 
                onValueChange={(value) => setNewItem({...newItem, strategy: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select strategy" />
                </SelectTrigger>
                <SelectContent>
                  {incomeStrategies.map(strategy => (
                    <SelectItem key={strategy} value={strategy}>{strategy}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {newItem.strategy && (
                <p className="text-sm text-muted-foreground">
                  {getStrategyDescription(newItem.strategy)}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Description
                <HelpTooltip content="Describe the specific implementation details" />
              </Label>
              <Input
                placeholder="e.g., Increase washer price from $2.50 to $3.00"
                value={newItem.description || ''}
                onChange={(e) => setNewItem({...newItem, description: e.target.value})}
              />
            </div>

            {/* Current Revenue */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Current Annual Revenue
                <HelpTooltip content="Current annual revenue from this source (if any)" />
              </Label>
              <CurrencyInput
                value={newItem.currentRevenue || 0}
                onChange={(value) => setNewItem({...newItem, currentRevenue: value})}
              />
            </div>

            {/* Projected Revenue */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Projected Annual Revenue
                <HelpTooltip content="Expected annual revenue after implementing this strategy" />
              </Label>
              <CurrencyInput
                value={newItem.projectedRevenue || 0}
                onChange={(value) => setNewItem({...newItem, projectedRevenue: value})}
              />
            </div>

            {/* Implementation Cost */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Implementation Cost
                <HelpTooltip content="One-time cost to implement this strategy" />
              </Label>
              <CurrencyInput
                value={newItem.implementationCost || 0}
                onChange={(value) => setNewItem({...newItem, implementationCost: value})}
              />
            </div>

            {/* Timeframe */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Implementation Timeframe
                <HelpTooltip content="How long to fully implement and see results" />
              </Label>
              <Select 
                value={newItem.timeframe || '6 months'} 
                onValueChange={(value) => setNewItem({...newItem, timeframe: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  {timeframes.map(timeframe => (
                    <SelectItem key={timeframe} value={timeframe}>{timeframe}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={addFutureIncomeItem} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Strategy
          </Button>
        </CardContent>
      </Card>

      {/* Future Income Items List */}
      {futureIncomeItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Income Improvement Plan</CardTitle>
            <CardDescription>
              Your planned income enhancement strategies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {futureIncomeItems.map((item) => {
                const netIncrease = item.projectedRevenue - item.currentRevenue;
                const roi = item.implementationCost > 0 ? (netIncrease / item.implementationCost) * 100 : 0;
                
                return (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold">{item.strategy}</h4>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeFutureIncomeItem(item.id)}
                      >
                        Remove
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Current Revenue</p>
                        <p className="font-semibold">{formatCurrency(item.currentRevenue)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Projected Revenue</p>
                        <p className="font-semibold">{formatCurrency(item.projectedRevenue)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Net Increase</p>
                        <p className="font-semibold text-green-600">{formatCurrency(netIncrease)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Implementation Cost</p>
                        <p className="font-semibold">{formatCurrency(item.implementationCost)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">ROI / Timeframe</p>
                        <p className="font-semibold">{roi.toFixed(1)}% / {item.timeframe}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      {futureIncomeItems.length > 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle>Future Income Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground">Total Projected Increase</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(calculateTotalProjectedIncrease())}
                </p>
                <p className="text-sm text-muted-foreground">Annual</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Implementation Cost</p>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(calculateTotalImplementationCost())}
                </p>
                <p className="text-sm text-muted-foreground">One-time</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Overall ROI</p>
                <p className="text-2xl font-bold text-blue-600">
                  {calculateTotalImplementationCost() > 0 
                    ? ((calculateTotalProjectedIncrease() / calculateTotalImplementationCost()) * 100).toFixed(1)
                    : '∞'
                  }%
                </p>
                <p className="text-sm text-muted-foreground">Annual Return</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Alert>
        <Lightbulb className="h-4 w-4" />
        <AlertDescription>
          <strong>Pro Tip:</strong> Start with low-cost, high-impact strategies like price increases and extended hours. 
          These data points will be incorporated into your AI analysis and financial projections to show the deal's true potential.
        </AlertDescription>
      </Alert>
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDeal } from '@/contexts/useDeal';
import { ExpansionItem } from '@/types/deal';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { HelpTooltip } from "@/components/ui/help-tooltip";
import { Plus, Trash2, Coffee, Monitor, Car, Shield, Wifi, ShoppingCart, InfoIcon } from 'lucide-react';

const ExpansionItemSchema = z.object({
  id: z.string(),
  type: z.enum(['vending', 'coffee', 'wifi_lounge', 'shoe_cleaning', 'dry_cleaning', 'wash_fold', 'equipment_upgrade', 'extended_hours', 'other']),
  description: z.string().min(1, "Description is required"),
  estimatedMonthlyRevenue: z.number().min(0, "Revenue must be positive"),
  initialInvestment: z.number().min(0, "Investment must be positive"),
  monthlyOperatingCost: z.number().min(0, "Operating cost must be positive"),
});

const ExpansionSchema = z.object({
  expansionItems: z.array(ExpansionItemSchema),
});

type ExpansionData = z.infer<typeof ExpansionSchema>;

const expansionTypes = [
  { value: 'vending', label: 'Vending Machines', icon: <ShoppingCart className="h-4 w-4" />, description: 'Snacks, drinks, laundry supplies' },
  { value: 'coffee', label: 'Coffee Service', icon: <Coffee className="h-4 w-4" />, description: 'Coffee bar or premium coffee machines' },
  { value: 'wifi_lounge', label: 'WiFi Lounge', icon: <Wifi className="h-4 w-4" />, description: 'Premium seating with charging stations' },
  { value: 'shoe_cleaning', label: 'Shoe Cleaning', icon: <Car className="h-4 w-4" />, description: 'Professional shoe cleaning services' },
  { value: 'dry_cleaning', label: 'Dry Cleaning', icon: <Shield className="h-4 w-4" />, description: 'Partner or in-house dry cleaning' },
  { value: 'wash_fold', label: 'Wash & Fold Service', icon: <Monitor className="h-4 w-4" />, description: 'Full-service laundry for customers' },
  { value: 'equipment_upgrade', label: 'Equipment Upgrade', icon: <Monitor className="h-4 w-4" />, description: 'High-efficiency or larger capacity machines' },
  { value: 'extended_hours', label: 'Extended Hours', icon: <Monitor className="h-4 w-4" />, description: 'Earlier/later hours or 24/7 operation' },
  { value: 'other', label: 'Other', icon: <Plus className="h-4 w-4" />, description: 'Custom expansion opportunity' },
];

export const ExpansionPotentialStep: React.FC = () => {
  const { deal, updateDeal } = useDeal();
  
  const form = useForm<ExpansionData>({
    resolver: zodResolver(ExpansionSchema),
    defaultValues: {
      expansionItems: deal?.expansionItems || [],
    },
  });

  const [expansionItems, setExpansionItems] = useState<ExpansionItem[]>(deal?.expansionItems || []);

  useEffect(() => {
    if (deal?.expansionItems) {
      setExpansionItems(deal.expansionItems);
      form.setValue('expansionItems', deal.expansionItems);
    }
  }, [deal, form]);

  const addExpansionItem = () => {
    const newItem: ExpansionItem = {
      id: Date.now().toString(),
      type: 'vending',
      description: '',
      estimatedMonthlyRevenue: 0,
      initialInvestment: 0,
      monthlyOperatingCost: 0,
    };
    
    const updatedItems = [...expansionItems, newItem];
    setExpansionItems(updatedItems);
    form.setValue('expansionItems', updatedItems);
    updateDeal({ expansionItems: updatedItems });
  };

  const removeExpansionItem = (id: string) => {
    const updatedItems = expansionItems.filter(item => item.id !== id);
    setExpansionItems(updatedItems);
    form.setValue('expansionItems', updatedItems);
    updateDeal({ expansionItems: updatedItems });
  };

  const updateExpansionItem = (id: string, field: keyof ExpansionItem, value: any) => {
    const updatedItems = expansionItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    );
    setExpansionItems(updatedItems);
    form.setValue('expansionItems', updatedItems);
    updateDeal({ expansionItems: updatedItems });
  };

  const getTypeInfo = (type: string) => {
    return expansionTypes.find(t => t.value === type) || expansionTypes[0];
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  // Calculate totals
  const totalMonthlyRevenue = expansionItems.reduce((sum, item) => sum + (item.estimatedMonthlyRevenue || 0), 0);
  const totalInitialInvestment = expansionItems.reduce((sum, item) => sum + (item.initialInvestment || 0), 0);
  const totalMonthlyCosts = expansionItems.reduce((sum, item) => sum + (item.monthlyOperatingCost || 0), 0);
  const netMonthlyRevenue = totalMonthlyRevenue - totalMonthlyCosts;

  return (
    <div className="space-y-6">
      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertDescription>
          <strong>Expansion Potential Analysis:</strong> Add potential revenue-generating opportunities to see their impact on your deal. 
          These projections help evaluate the upside potential and can be included in your business plan for financing.
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <div className="space-y-6">
          {/* Expansion Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Revenue Enhancement Opportunities</span>
                <Button type="button" onClick={addExpansionItem} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Opportunity
                </Button>
              </CardTitle>
              <CardDescription>
                Identify and quantify potential additional revenue streams for this location
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {expansionItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Plus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No expansion opportunities added yet.</p>
                  <p className="text-sm">Click "Add Opportunity" to get started.</p>
                </div>
              ) : (
                expansionItems.map((item, index) => {
                  const typeInfo = getTypeInfo(item.type);
                  return (
                    <Card key={item.id} className="border-2">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {typeInfo.icon}
                            <span className="font-semibold">Opportunity #{index + 1}</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeExpansionItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Type Selection */}
                          <div>
                            <FormLabel className="flex items-center gap-2">
                              Type
                              <HelpTooltip content="Select the type of expansion opportunity. Each type has typical industry benchmarks." />
                            </FormLabel>
                            <Select
                              value={item.type}
                              onValueChange={(value) => updateExpansionItem(item.id, 'type', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {expansionTypes.map((type) => (
                                  <SelectItem key={type.value} value={type.value}>
                                    <div className="flex items-center gap-2">
                                      {type.icon}
                                      <span>{type.label}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground mt-1">
                              {typeInfo.description}
                            </p>
                          </div>

                          {/* Description */}
                          <div>
                            <FormLabel className="flex items-center gap-2">
                              Description
                              <HelpTooltip content="Detailed description of this specific opportunity and how it would be implemented." />
                            </FormLabel>
                            <Input
                              placeholder="e.g., 3 vending machines with snacks and drinks"
                              value={item.description}
                              onChange={(e) => updateExpansionItem(item.id, 'description', e.target.value)}
                            />
                          </div>

                          {/* Monthly Revenue */}
                          <div>
                            <FormLabel className="flex items-center gap-2">
                              Estimated Monthly Revenue
                              <HelpTooltip content="Conservative estimate of monthly revenue this opportunity could generate." />
                            </FormLabel>
                            <CurrencyInput
                              placeholder="$500.00"
                              value={item.estimatedMonthlyRevenue}
                              onChange={(value) => updateExpansionItem(item.id, 'estimatedMonthlyRevenue', value)}
                            />
                          </div>

                          {/* Initial Investment */}
                          <div>
                            <FormLabel className="flex items-center gap-2">
                              Initial Investment Required
                              <HelpTooltip content="One-time cost to implement this opportunity (equipment, setup, etc.)." />
                            </FormLabel>
                            <CurrencyInput
                              placeholder="$2,000.00"
                              value={item.initialInvestment}
                              onChange={(value) => updateExpansionItem(item.id, 'initialInvestment', value)}
                            />
                          </div>

                          {/* Monthly Operating Cost */}
                          <div className="md:col-span-2">
                            <FormLabel className="flex items-center gap-2">
                              Monthly Operating Cost
                              <HelpTooltip content="Ongoing monthly costs to maintain this revenue stream (supplies, maintenance, etc.)." />
                            </FormLabel>
                            <CurrencyInput
                              placeholder="$100.00"
                              value={item.monthlyOperatingCost}
                              onChange={(value) => updateExpansionItem(item.id, 'monthlyOperatingCost', value)}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Net Monthly Revenue: {formatCurrency((item.estimatedMonthlyRevenue || 0) - (item.monthlyOperatingCost || 0))}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Summary */}
          {expansionItems.length > 0 && (
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle>Expansion Summary</CardTitle>
                <CardDescription>
                  Financial impact of all expansion opportunities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Monthly Revenue</p>
                    <p className="text-lg font-bold text-primary">{formatCurrency(totalMonthlyRevenue)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Operating Costs</p>
                    <p className="text-lg font-semibold">{formatCurrency(totalMonthlyCosts)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Net Monthly Revenue</p>
                    <p className="text-lg font-bold text-primary">{formatCurrency(netMonthlyRevenue)}</p>
                    <p className="text-xs text-muted-foreground">{formatCurrency(netMonthlyRevenue * 12)}/year</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Initial Investment</p>
                    <p className="text-lg font-semibold">{formatCurrency(totalInitialInvestment)}</p>
                    <p className="text-xs text-muted-foreground">
                      {netMonthlyRevenue > 0 ? `${(totalInitialInvestment / netMonthlyRevenue).toFixed(1)} month payback` : 'N/A'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </Form>
    </div>
  );
};
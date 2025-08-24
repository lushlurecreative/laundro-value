import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDeal } from '@/contexts/useDeal';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpTooltip } from "@/components/ui/help-tooltip";
import { InfoIcon, Wrench, Plus, Trash2, Upload } from 'lucide-react';


const EquipmentSchema = z.object({
  machineType: z.string().optional(),
  brand: z.string().optional(),
  quantity: z.number().min(0).optional(),
  ageYears: z.number().min(0).optional(),
  capacityLbs: z.number().min(0).optional(),
  waterUsagePerCycle: z.number().min(0).optional(),
  vendPricePerUse: z.number().min(0).optional(),
  conditionRating: z.number().min(1).max(5).optional(),
  currentValue: z.number().min(0).optional(),
  purchaseValue: z.number().min(0).optional(),
  isCoinOperated: z.boolean().optional(),
  isCardOperated: z.boolean().optional(),
  otherEquipment: z.string().optional(),
});

type EquipmentData = z.infer<typeof EquipmentSchema>;

const machineTypes = [
  'Top-Load Washer',
  'Front-Load Washer',
  'Stacked Washer/Dryer',
  'Single Dryer',
  'Stacked Dryer',
  'Double Stack Dryer',
  'Triple Stack Dryer',
  'Other'
];

const popularBrands = [
  'Continental Girbau',
  'Dexter',
  'Huebsch',
  'Maytag Commercial',
  'Milnor',
  'Other',
  'Speed Queen',
  'UniMac',
  'Wascomat',
  'Whirlpool Commercial'
];

const conditionOptions = [
  { value: 1, label: '1 - Poor (Needs major repairs)' },
  { value: 2, label: '2 - Fair (Minor repairs needed)' },
  { value: 3, label: '3 - Good (Functional, some wear)' },
  { value: 4, label: '4 - Very Good (Minor wear)' },
  { value: 5, label: '5 - Excellent (Like new)' }
];

export const EquipmentStep: React.FC = () => {
  const { machineInventory, addMachine, updateMachine, removeMachine, clearMachineInventory } = useDeal();
  const [editingMachine, setEditingMachine] = useState<string | null>(null);
  

  const form = useForm<EquipmentData>({
    resolver: zodResolver(EquipmentSchema),
    defaultValues: {
      machineType: '',
      brand: '',
      quantity: undefined,
      ageYears: undefined,
      capacityLbs: undefined,
      waterUsagePerCycle: undefined,
      vendPricePerUse: undefined,
      conditionRating: 3,
      currentValue: undefined,
      purchaseValue: undefined,
      isCoinOperated: true,
      isCardOperated: false,
      otherEquipment: '',
    },
  });

  const handleAddMachine = (data: EquipmentData) => {
    // Validate required fields
    if (!data.machineType || !data.quantity || data.quantity < 1) {
      return;
    }
    
    const newMachine = {
      machineId: `machine-${Date.now()}`,
      dealId: '',
      machineType: data.machineType as any,
      brand: data.brand || 'Unknown',
      model: '',
      quantity: data.quantity || 1,
      ageYears: data.ageYears || 0,
      capacityLbs: data.capacityLbs || 25,
      vendPricePerUse: data.vendPricePerUse || 3.00,
      conditionRating: data.conditionRating || 3,
      waterConsumptionGalPerCycle: data.waterUsagePerCycle || 20,
      electricConsumptionKwh: undefined,
      gasConsumptionBtu: undefined,
      purchaseValue: data.purchaseValue || 0,
      currentValue: data.currentValue || 0,
      maintenanceCostAnnual: 0,
      isCardOperated: data.isCardOperated || false,
      isCoinOperated: data.isCoinOperated !== false,
      isOutOfOrder: false
    };

    addMachine(newMachine);
    form.reset();
  };

  const handleEditMachine = (machineId: string) => {
    const machine = machineInventory.find(m => m.machineId === machineId);
    if (machine) {
      form.setValue('machineType', machine.machineType);
      form.setValue('brand', machine.brand);
      form.setValue('quantity', machine.quantity);
      form.setValue('ageYears', machine.ageYears);
      form.setValue('capacityLbs', machine.capacityLbs);
      form.setValue('vendPricePerUse', machine.vendPricePerUse);
      form.setValue('conditionRating', machine.conditionRating);
      form.setValue('waterUsagePerCycle', machine.waterConsumptionGalPerCycle);
      form.setValue('currentValue', machine.currentValue);
      form.setValue('purchaseValue', machine.purchaseValue);
      form.setValue('isCoinOperated', machine.isCoinOperated);
      form.setValue('isCardOperated', machine.isCardOperated);
      setEditingMachine(machineId);
    }
  };

  const handleUpdateMachine = (data: EquipmentData) => {
    if (editingMachine) {
      updateMachine(editingMachine, {
        machineType: data.machineType as any,
        brand: data.brand,
        quantity: data.quantity,
        ageYears: data.ageYears,
        capacityLbs: data.capacityLbs,
        vendPricePerUse: data.vendPricePerUse,
        conditionRating: data.conditionRating,
        waterConsumptionGalPerCycle: data.waterUsagePerCycle,
        currentValue: data.currentValue || 0,
        purchaseValue: data.purchaseValue || 0,
        isCoinOperated: data.isCoinOperated || false,
        isCardOperated: data.isCardOperated || false,
      });
      form.reset();
      setEditingMachine(null);
    }
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const onSubmit = (data: EquipmentData) => {
    if (editingMachine) {
      handleUpdateMachine(data);
    } else {
      handleAddMachine(data);
    }
  };

  const getIndustryStandards = (machineType: string) => {
    const standards: { [key: string]: { capacity: string; price: string; life: string } } = {
      'Top-Load Washer': { capacity: '20-25 lbs', price: '$2.50-3.50', life: '10-15 years' },
      'Front-Load Washer': { capacity: '25-40 lbs', price: '$3.00-4.50', life: '15-20 years' },
      'Single Dryer': { capacity: '30-50 lbs', price: '$2.00-3.00', life: '15-20 years' },
      'Double Stack Dryer': { capacity: '30-45 lbs each', price: '$1.75-2.50', life: '15-20 years' },
    };
    return standards[machineType] || { capacity: 'Varies', price: 'Varies', life: 'Varies' };
  };


  return (
    <div className="space-y-6">
      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertDescription>
          Add all equipment in your laundromat manually. Leave fields blank if unknown. 
          If you don't know the condition, assume "Fair" (3/5) or "Poor" (2/5) condition.
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Add/Edit Equipment Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                {editingMachine ? 'Edit Equipment' : 'Add Equipment'}
              </CardTitle>
              <CardDescription>
                Enter details for each piece of equipment in the laundromat
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Machine Type */}
              <FormField
                control={form.control}
                name="machineType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Type
                      <HelpTooltip content="Select the type of laundry equipment" />
                    </FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {machineTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Brand */}
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Brand
                      <HelpTooltip content="Equipment manufacturer brand" />
                    </FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select brand" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {popularBrands.map(brand => (
                          <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Quantity */}
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Quantity
                      <HelpTooltip content="Number of identical machines" />
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        value={field.value || ''}
                        onChange={(e) => {
                          const value = e.target.value === '' ? undefined : parseInt(e.target.value) || undefined;
                          field.onChange(value);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Delete' || e.key === 'Backspace') {
                            const target = e.target as HTMLInputElement;
                            if (target.selectionStart === 0 && target.selectionEnd === target.value.length) {
                              e.preventDefault();
                              field.onChange(undefined);
                            }
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Age */}
              <FormField
                control={form.control}
                name="ageYears"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Age (Years)
                      <HelpTooltip content="Age of the equipment in years" />
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.5"
                        value={field.value || ''}
                        onChange={(e) => {
                          const value = e.target.value === '' ? undefined : parseFloat(e.target.value) || undefined;
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <p className="text-sm text-muted-foreground">
                      {form.watch('machineType') && getIndustryStandards(form.watch('machineType')).life} lifespan *
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Capacity */}
              <FormField
                control={form.control}
                name="capacityLbs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Size/Capacity (lbs)
                      <HelpTooltip content="Load capacity in pounds" />
                    </FormLabel>
                    <Select 
                      value={field.value ? field.value.toString() : ''} 
                      onValueChange={(value) => field.onChange(parseInt(value))}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select capacity" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="18">18 lbs (Small)</SelectItem>
                        <SelectItem value="20">20 lbs (Standard)</SelectItem>
                        <SelectItem value="25">25 lbs (Medium)</SelectItem>
                        <SelectItem value="30">30 lbs (Large)</SelectItem>
                        <SelectItem value="35">35 lbs (Extra Large)</SelectItem>
                        <SelectItem value="40">40 lbs (Commercial)</SelectItem>
                        <SelectItem value="50">50 lbs (Super Size)</SelectItem>
                        <SelectItem value="60">60 lbs (Mega)</SelectItem>
                        <SelectItem value="80">80 lbs (Industrial)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      {form.watch('machineType') && getIndustryStandards(form.watch('machineType')).capacity} typical *
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Water Usage */}
              <FormField
                control={form.control}
                name="waterUsagePerCycle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Water Usage per Cycle (gal)
                      <HelpTooltip content="Water consumption per wash cycle in gallons (if known)" />
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.1"
                        placeholder="Optional"
                        value={field.value || ''}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                      />
                    </FormControl>
                    <p className="text-sm text-muted-foreground">
                      Top-load: 25-40 gal, Front-load: 15-25 gal *
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Price per Load */}
              <FormField
                control={form.control}
                name="vendPricePerUse"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Price per Load
                      <HelpTooltip content="Customer price per use in dollars" />
                    </FormLabel>
                    <FormControl>
                      <CurrencyInput
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <p className="text-sm text-muted-foreground">
                      {form.watch('machineType') && getIndustryStandards(form.watch('machineType')).price} range *
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Condition */}
              <FormField
                control={form.control}
                name="conditionRating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Condition
                      <HelpTooltip content="Rate the equipment condition from 1 (poor) to 5 (excellent)" />
                    </FormLabel>
                    <Select 
                      value={field.value ? field.value.toString() : '3'} 
                      onValueChange={(value) => field.onChange(parseInt(value))}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {conditionOptions.map(option => (
                          <SelectItem key={option.value} value={option.value.toString()}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Current Value */}
              <FormField
                control={form.control}
                name="currentValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Current Value
                      <HelpTooltip content="Estimated current market value (if known)" />
                    </FormLabel>
                    <FormControl>
                      <CurrencyInput
                        placeholder="Optional"
                        value={field.value || 0}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <p className="text-sm text-muted-foreground">Current resale value</p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Replacement Cost */}
              <FormField
                control={form.control}
                name="purchaseValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Replacement Cost
                      <HelpTooltip content="Cost to replace with new equipment (if known)" />
                    </FormLabel>
                    <FormControl>
                      <CurrencyInput
                        placeholder="Optional"
                        value={field.value || 0}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <p className="text-sm text-muted-foreground">New equipment cost</p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Payment Type */}
              <div className="md:col-span-3 space-y-3">
                <FormLabel>Payment Type</FormLabel>
                <div className="flex gap-4">
                  <FormField
                    control={form.control}
                    name="isCoinOperated"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value || false}
                            onChange={(e) => field.onChange(e.target.checked)}
                            className="rounded"
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">Coin Operated</FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="isCardOperated"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value || false}
                            onChange={(e) => field.onChange(e.target.checked)}
                            className="rounded"
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">Card Operated</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
            <div className="px-6 pb-6">
              <div className="flex gap-2">
                <Button type="submit" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  {editingMachine ? 'Update Equipment' : 'Add Equipment'}
                </Button>
                {editingMachine && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingMachine(null);
                      form.reset();
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </form>
      </Form>

      {/* Equipment Inventory List */}
      {machineInventory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Equipment Inventory</CardTitle>
            <CardDescription>
              Current equipment in the laundromat
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {machineInventory.map((machine) => (
                <div key={machine.machineId} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
                    <div>
                      <p className="font-medium">{machine.machineType}</p>
                      <p className="text-sm text-muted-foreground">{machine.brand}</p>
                    </div>
                    <div className="text-sm">
                      <p>Qty: {machine.quantity}</p>
                      <p>Age: {machine.ageYears} years</p>
                      <p>Capacity: {machine.capacityLbs} lbs</p>
                    </div>
                    <div className="text-sm">
                      <p>Price: {formatCurrency(machine.vendPricePerUse)}</p>
                      <p>Condition: {machine.conditionRating}/5</p>
                      <p>Payment: {machine.isCoinOperated && machine.isCardOperated ? 'Coin & Card' : machine.isCoinOperated ? 'Coin' : machine.isCardOperated ? 'Card' : 'N/A'}</p>
                    </div>
                    <div className="text-sm">
                      {machine.currentValue > 0 && <p>Value: {formatCurrency(machine.currentValue)}</p>}
                      {machine.purchaseValue > 0 && <p>Replace: {formatCurrency(machine.purchaseValue)}</p>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditMachine(machine.machineId)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeMachine(machine.machineId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Other Equipment Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Other Equipment
          </CardTitle>
          <CardDescription>
            List any other equipment like soap machines, change machines, carts, tables, etc.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <FormField
              control={form.control}
              name="otherEquipment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Other Equipment Description</FormLabel>
                  <FormControl>
                    <textarea
                      className="w-full p-3 border border-input rounded-md resize-none"
                      rows={4}
                      placeholder="Example: 2 soap dispensers, 1 change machine, 3 folding tables, 5 laundry carts..."
                      value={field.value || ''}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <p className="text-sm text-muted-foreground">
                    Describe any additional equipment not listed above
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Form>
        </CardContent>
      </Card>

    </div>
  );
};
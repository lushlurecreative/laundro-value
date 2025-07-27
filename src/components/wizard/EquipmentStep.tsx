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
import { InfoIcon, Wrench, Plus, Trash2 } from 'lucide-react';

const EquipmentSchema = z.object({
  machineType: z.string().min(1, "Machine type is required"),
  brand: z.string().min(1, "Brand is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  ageYears: z.number().min(0, "Age cannot be negative"),
  capacityLbs: z.number().min(1, "Capacity must be at least 1"),
  waterUsagePerCycle: z.number().min(0, "Water usage cannot be negative").optional(),
  vendPricePerUse: z.number().min(0, "Price per load cannot be negative"),
  conditionRating: z.number().min(1).max(5, "Condition must be 1-5"),
  currentValue: z.number().min(0, "Current value cannot be negative").optional(),
  purchaseValue: z.number().min(0, "Replacement cost cannot be negative").optional(),
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
  'Speed Queen',
  'Wascomat',
  'Maytag Commercial',
  'Whirlpool Commercial',
  'Huebsch',
  'Continental Girbau',
  'UniMac',
  'Dexter',
  'Milnor',
  'Other'
];

const conditionOptions = [
  { value: 1, label: '1 - Poor (Needs major repairs)' },
  { value: 2, label: '2 - Fair (Minor repairs needed)' },
  { value: 3, label: '3 - Good (Functional, some wear)' },
  { value: 4, label: '4 - Very Good (Minor wear)' },
  { value: 5, label: '5 - Excellent (Like new)' }
];

export const EquipmentStep: React.FC = () => {
  const { machineInventory, addMachine, updateMachine, removeMachine } = useDeal();
  const [editingMachine, setEditingMachine] = useState<string | null>(null);

  const form = useForm<EquipmentData>({
    resolver: zodResolver(EquipmentSchema),
    defaultValues: {
      machineType: '',
      brand: '',
      quantity: 1,
      ageYears: 5,
      capacityLbs: 20,
      waterUsagePerCycle: undefined,
      vendPricePerUse: 2.50,
      conditionRating: 3,
      currentValue: undefined,
      purchaseValue: undefined,
    },
  });

  const handleAddMachine = (data: EquipmentData) => {
    const newMachine = {
      machineId: `machine-${Date.now()}`,
      dealId: '',
      machineType: data.machineType as any,
      brand: data.brand,
      model: '',
      quantity: data.quantity,
      ageYears: data.ageYears,
      capacityLbs: data.capacityLbs,
      vendPricePerUse: data.vendPricePerUse,
      conditionRating: data.conditionRating,
      waterConsumptionGalPerCycle: data.waterUsagePerCycle,
      electricConsumptionKwh: undefined,
      gasConsumptionBtu: undefined,
      purchaseValue: data.purchaseValue || 0,
      currentValue: data.currentValue || 0,
      maintenanceCostAnnual: 0,
      isCardOperated: false,
      isCoinOperated: true,
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
          Add all equipment in your laundromat. Industry standards marked with * are provided for reference 
          based on current market data and should be verified for your specific market.
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
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
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
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
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
                      value={field.value.toString()} 
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
    </div>
  );
};
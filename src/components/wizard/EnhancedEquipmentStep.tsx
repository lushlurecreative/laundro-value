import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDeal } from '@/contexts/useDeal';
import { parseAndClassifyMachines } from '@/utils/machineClassifier';
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
import { InfoIcon, Wrench, Plus, Trash2, Wand2 } from 'lucide-react';
import type { MachineInventory } from '@/types/deal';

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
  isCoinOperated: z.boolean().optional(),
  isCardOperated: z.boolean().optional(),
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

export const EnhancedEquipmentStep: React.FC = () => {
  const { machineInventory, addMachine, updateMachine, removeMachine, clearMachineInventory } = useDeal();
  const [editingMachine, setEditingMachine] = useState<string | null>(null);
  const [isAutoFilling, setIsAutoFilling] = useState(false);

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
      isCoinOperated: true,
      isCardOperated: false,
    },
  });

  // Enhanced auto-fill functionality
  const handleAutoFillEquipment = () => {
    setIsAutoFilling(true);
    
    // Create sample equipment data based on typical laundromat setup
    const sampleEquipment = {
      "washers": [
        { type: "Front-Load Washer", brand: "Speed Queen", quantity: 8, capacity: 25, price: 3.50, age: 3 },
        { type: "Top-Load Washer", brand: "Speed Queen", quantity: 4, capacity: 20, price: 3.00, age: 5 },
        { type: "Front-Load Washer", brand: "Dexter", quantity: 2, capacity: 40, price: 5.00, age: 2 }
      ],
      "dryers": [
        { type: "Single Dryer", brand: "Speed Queen", quantity: 10, capacity: 30, price: 2.50, age: 3 },
        { type: "Double Stack Dryer", brand: "Dexter", quantity: 4, capacity: 35, price: 2.75, age: 4 }
      ]
    };

    // Clear existing equipment first
    clearMachineInventory();

    setTimeout(() => {
      // Add washers
      sampleEquipment.washers.forEach((washer, index) => {
        const machine: MachineInventory = {
          machineId: `auto-washer-${index}-${Date.now()}`,
          dealId: '',
          machineType: washer.type as any,
          brand: washer.brand,
          model: '',
          quantity: washer.quantity,
          ageYears: washer.age,
          capacityLbs: washer.capacity,
          vendPricePerUse: washer.price,
          conditionRating: 4,
          waterConsumptionGalPerCycle: washer.capacity * 1.2, // Estimate
          electricConsumptionKwh: undefined,
          gasConsumptionBtu: undefined,
          purchaseValue: washer.capacity * 150, // Estimate
          currentValue: washer.capacity * 100, // Estimate
          maintenanceCostAnnual: 0,
          isCardOperated: true,
          isCoinOperated: false,
          isOutOfOrder: false
        };
        addMachine(machine);
      });

      // Add dryers
      sampleEquipment.dryers.forEach((dryer, index) => {
        const machine: MachineInventory = {
          machineId: `auto-dryer-${index}-${Date.now()}`,
          dealId: '',
          machineType: dryer.type as any,
          brand: dryer.brand,
          model: '',
          quantity: dryer.quantity,
          ageYears: dryer.age,
          capacityLbs: dryer.capacity,
          vendPricePerUse: dryer.price,
          conditionRating: 4,
          waterConsumptionGalPerCycle: undefined,
          electricConsumptionKwh: dryer.capacity * 0.3, // Estimate
          gasConsumptionBtu: dryer.capacity * 1000, // Estimate
          purchaseValue: dryer.capacity * 120, // Estimate
          currentValue: dryer.capacity * 80, // Estimate
          maintenanceCostAnnual: 0,
          isCardOperated: true,
          isCoinOperated: false,
          isOutOfOrder: false
        };
        addMachine(machine);
      });

      setIsAutoFilling(false);
    }, 1000);
  };

  const handleAddMachine = (data: EquipmentData) => {
    const newMachine: MachineInventory = {
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
      isCardOperated: data.isCardOperated || false,
      isCoinOperated: data.isCoinOperated || true,
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
          Add all equipment in your laundromat. Use the Auto-Fill feature for a quick start with typical equipment, 
          or add machines manually. If you don't have specific information, leave fields blank.
        </AlertDescription>
      </Alert>

      {/* Auto-Fill Equipment Button */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            Quick Equipment Setup
          </CardTitle>
          <CardDescription>
            Auto-populate with a typical laundromat equipment setup to get started quickly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleAutoFillEquipment}
            disabled={isAutoFilling}
            variant="outline"
            className="w-full"
          >
            {isAutoFilling ? (
              <>
                <Wand2 className="mr-2 h-4 w-4 animate-spin" />
                Setting up equipment...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Auto-Fill Typical Equipment
              </>
            )}
          </Button>
          {machineInventory.length > 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              Current inventory: {machineInventory.length} machines
            </p>
          )}
        </CardContent>
      </Card>

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
                    <Select 
                      value={field.value.toString()} 
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Purchase Value */}
              <FormField
                control={form.control}
                name="purchaseValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Replacement Cost
                      <HelpTooltip content="Cost to replace this equipment new" />
                    </FormLabel>
                    <FormControl>
                      <CurrencyInput
                        placeholder="Optional"
                        value={field.value || 0}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            
            <CardContent className="pt-0">
              <div className="flex gap-4 justify-end">
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
                <Button type="submit">
                  {editingMachine ? 'Update Machine' : 'Add Machine'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>

      {/* Equipment Inventory Display */}
      {machineInventory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Equipment Inventory
              <span className="text-sm font-normal text-muted-foreground">
                {machineInventory.reduce((sum, machine) => sum + machine.quantity, 0)} total machines
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {machineInventory.map(machine => (
                <div key={machine.machineId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">
                      {machine.quantity}x {machine.machineType} - {machine.brand}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {machine.capacityLbs} lbs • {formatCurrency(machine.vendPricePerUse)}/load • {machine.ageYears} years old
                    </p>
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
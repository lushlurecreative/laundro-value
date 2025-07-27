import React, { useState } from 'react';
import { useDeal } from '@/contexts/useDeal';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CurrencyInput } from "@/components/ui/currency-input";
import { InfoIcon, Plus, Settings, Trash2 } from 'lucide-react';
import { MachineInventory } from '@/types/deal';

const machineTypes = [
  'Top-Load Washer',
  'Front-Load Washer', 
  'Stacked Washer/Dryer',
  'Single Dryer',
  'Stacked Dryer',
  'Other'
];

const popularBrands = [
  'Speed Queen',
  'Dexter',
  'IPSO',
  'Huebsch',
  'Wascomat',
  'Continental',
  'Milnor',
  'Alliance',
  'Various',
  'Other'
];

const conditionOptions = [
  { value: 1, label: 'Poor (Needs major repairs)' },
  { value: 2, label: 'Fair (Some repairs needed)' },
  { value: 3, label: 'Good (Working condition)' },
  { value: 4, label: 'Very Good (Well maintained)' },
  { value: 5, label: 'Excellent (Like new)' }
];

export const EquipmentStep: React.FC = () => {
  const { deal, machineInventory, addMachine, updateMachine, removeMachine } = useDeal();
  
  const [newMachine, setNewMachine] = useState<Partial<MachineInventory>>({
    machineType: 'Front-Load Washer',
    brand: 'Speed Queen',
    quantity: 1,
    ageYears: 0,
    capacityLbs: 35,
    vendPricePerUse: 3.50,
    conditionRating: 3,
    waterConsumptionGalPerCycle: 0,
    electricConsumptionKwh: 0,
    gasConsumptionBtu: 0,
    purchaseValue: 0,
    currentValue: 0,
    maintenanceCostAnnual: 0,
    isCardOperated: true,
    isCoinOperated: true,
    isOutOfOrder: false,
  });

  const handleAddMachine = () => {
    if (newMachine.machineType && newMachine.brand && newMachine.quantity && newMachine.quantity > 0) {
      addMachine({
        machineId: `machine-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        dealId: deal?.dealId || 'deal-1',
        machineType: newMachine.machineType as any,
        brand: newMachine.brand,
        model: newMachine.model || '',
        quantity: newMachine.quantity,
        ageYears: newMachine.ageYears || 0,
        capacityLbs: newMachine.capacityLbs || 35,
        vendPricePerUse: newMachine.vendPricePerUse || 3.50,
        conditionRating: newMachine.conditionRating || 3,
        waterConsumptionGalPerCycle: newMachine.waterConsumptionGalPerCycle,
        electricConsumptionKwh: newMachine.electricConsumptionKwh,
        gasConsumptionBtu: newMachine.gasConsumptionBtu,
        purchaseValue: newMachine.purchaseValue || 0,
        currentValue: newMachine.currentValue || 0,
        maintenanceCostAnnual: newMachine.maintenanceCostAnnual || 0,
        isCardOperated: newMachine.isCardOperated || false,
        isCoinOperated: newMachine.isCoinOperated || false,
        isOutOfOrder: newMachine.isOutOfOrder || false,
      });
      
      // Reset form
      setNewMachine({
        machineType: 'Front-Load Washer',
        brand: 'Speed Queen',
        quantity: 1,
        ageYears: 0,
        capacityLbs: 35,
        vendPricePerUse: 3.50,
        conditionRating: 3,
        waterConsumptionGalPerCycle: 0,
        electricConsumptionKwh: 0,
        gasConsumptionBtu: 0,
        purchaseValue: 0,
        currentValue: 0,
        maintenanceCostAnnual: 0,
        isCardOperated: true,
        isCoinOperated: true,
        isOutOfOrder: false,
      });
    }
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const totalMachines = machineInventory.reduce((sum, machine) => sum + machine.quantity, 0);
  const totalValue = machineInventory.reduce((sum, machine) => sum + (machine.currentValue * machine.quantity), 0);

  return (
    <div className="space-y-6">
      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertDescription>
          Add all equipment in your laundromat. Include washers, dryers, and any other machinery. 
          Values marked with * are industry standards that should be verified.
        </AlertDescription>
      </Alert>

      {/* Add New Equipment Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Equipment
          </CardTitle>
          <CardDescription>
            Enter details for each piece of equipment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Machine Type */}
            <div>
              <Label>Machine Type *</Label>
              <Select 
                value={newMachine.machineType} 
                onValueChange={(value) => setNewMachine({...newMachine, machineType: value as any})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {machineTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Brand */}
            <div>
              <Label>Brand *</Label>
              <Select 
                value={newMachine.brand} 
                onValueChange={(value) => setNewMachine({...newMachine, brand: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select brand" />
                </SelectTrigger>
                <SelectContent>
                  {popularBrands.map(brand => (
                    <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quantity */}
            <div>
              <Label>Quantity *</Label>
              <Input
                type="number"
                min="1"
                value={newMachine.quantity || ''}
                onChange={(e) => setNewMachine({...newMachine, quantity: parseInt(e.target.value) || 1})}
                placeholder="1"
              />
            </div>

            {/* Age */}
            <div>
              <Label>Age (Years)</Label>
              <Input
                type="number"
                min="0"
                value={newMachine.ageYears || ''}
                onChange={(e) => setNewMachine({...newMachine, ageYears: parseInt(e.target.value) || 0})}
                placeholder="5"
              />
            </div>

            {/* Capacity */}
            <div>
              <Label>Capacity (lbs)</Label>
              <Input
                type="number"
                min="0"
                value={newMachine.capacityLbs || ''}
                onChange={(e) => setNewMachine({...newMachine, capacityLbs: parseInt(e.target.value) || 35})}
                placeholder="35"
              />
              <p className="text-xs text-muted-foreground">Standard: 20-60 lbs *</p>
            </div>

            {/* Water Usage (if applicable) */}
            {newMachine.machineType?.includes('Washer') && (
              <div>
                <Label>Water Usage per Cycle (gal)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  value={newMachine.waterConsumptionGalPerCycle || ''}
                  onChange={(e) => setNewMachine({...newMachine, waterConsumptionGalPerCycle: parseFloat(e.target.value) || 0})}
                  placeholder="25"
                />
                <p className="text-xs text-muted-foreground">Standard: 20-40 gal *</p>
              </div>
            )}

            {/* Price per Load */}
            <div>
              <Label>Price per Load</Label>
              <CurrencyInput
                value={newMachine.vendPricePerUse || 0}
                onChange={(value) => setNewMachine({...newMachine, vendPricePerUse: value})}
                placeholder="$3.50"
              />
              <p className="text-xs text-muted-foreground">Washers: $2.50-5.00, Dryers: $1.50-3.00 *</p>
            </div>

            {/* Condition */}
            <div>
              <Label>Condition Rating</Label>
              <Select 
                value={newMachine.conditionRating?.toString()} 
                onValueChange={(value) => setNewMachine({...newMachine, conditionRating: parseInt(value)})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  {conditionOptions.map(option => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.value} - {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Current Value */}
            <div>
              <Label>Current Value (if known)</Label>
              <CurrencyInput
                value={newMachine.currentValue || 0}
                onChange={(value) => setNewMachine({...newMachine, currentValue: value})}
                placeholder="$0.00"
              />
            </div>

            {/* Replacement Cost */}
            <div>
              <Label>Replacement Cost (if known)</Label>
              <CurrencyInput
                value={newMachine.purchaseValue || 0}
                onChange={(value) => setNewMachine({...newMachine, purchaseValue: value})}
                placeholder="$0.00"
              />
            </div>
          </div>

          <Button onClick={handleAddMachine} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Equipment
          </Button>
        </CardContent>
      </Card>

      {/* Equipment Inventory List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Equipment Inventory
          </CardTitle>
          <CardDescription>
            Current equipment in the laundromat
          </CardDescription>
        </CardHeader>
        <CardContent>
          {machineInventory.length > 0 ? (
            <div className="space-y-4">
              {machineInventory.map((machine) => (
                <div key={machine.machineId} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center p-4 border rounded-lg">
                  <div>
                    <Label className="text-xs text-muted-foreground">Type & Brand</Label>
                    <p className="font-medium">{machine.machineType}</p>
                    <p className="text-sm text-muted-foreground">{machine.brand}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Qty & Age</Label>
                    <p>{machine.quantity} units</p>
                    <p className="text-sm text-muted-foreground">{machine.ageYears} years old</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Capacity</Label>
                    <p>{machine.capacityLbs} lbs</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Price/Use</Label>
                    <p>{formatCurrency(machine.vendPricePerUse)}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Condition</Label>
                    <p>{machine.conditionRating}/5</p>
                    <p className="text-sm text-muted-foreground">
                      {conditionOptions.find(opt => opt.value === machine.conditionRating)?.label.split(' ')[0]}
                    </p>
                  </div>
                  <div className="flex gap-2">
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
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No equipment added yet.</p>
              <p className="text-sm">Add your first piece of equipment above.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Equipment Summary */}
      {machineInventory.length > 0 && (
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle>Equipment Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground">Total Machines</p>
                <p className="text-2xl font-bold">{totalMachines}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Washers</p>
                <p className="text-xl font-semibold">
                  {machineInventory.filter(m => m.machineType.includes('Washer')).reduce((sum, m) => sum + m.quantity, 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Dryers</p>
                <p className="text-xl font-semibold">
                  {machineInventory.filter(m => m.machineType.includes('Dryer')).reduce((sum, m) => sum + m.quantity, 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-xl font-bold text-primary">{formatCurrency(totalValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
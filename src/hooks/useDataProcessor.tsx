import { useState } from 'react';
import { useDeal } from '@/contexts/useDeal';
import { useToast } from '@/components/ui/use-toast';
import { parseEquipmentText } from '@/utils/equipmentParser';
import { validateFinancialData } from '@/utils/dataValidator';

export const useDataProcessor = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { deal, updateDeal, addMachine, addExpenseItem, expenseItems, machineInventory } = useDeal();
  const { toast } = useToast();

  const processAlbanyParkData = () => {
    setIsProcessing(true);
    
    try {
      // Albany Park Coin Laundry sample data
      updateDeal({
        dealName: 'Albany Park Coin Laundry',
        askingPrice: 450000,
        grossIncomeAnnual: 180000,
        facilitySizeSqft: 2400,
        propertyAddress: '4627 N Kedzie Ave, Chicago, IL 60625'
      });

      // Process equipment: 12 Washers, 14 Dryers
      addMachine({
        machineId: `washers-${Date.now()}`,
        dealId: '',
        machineType: 'Front-Load Washer',
        brand: 'Continental Girbau',
        model: '25 lb',
        quantity: 12,
        ageYears: 6, // 2018 machines
        capacityLbs: 25,
        vendPricePerUse: 3.75,
        conditionRating: 3,
        waterConsumptionGalPerCycle: 20,
        electricConsumptionKwh: undefined,
        gasConsumptionBtu: undefined,
        purchaseValue: 0,
        currentValue: 0,
        maintenanceCostAnnual: 0,
        isCardOperated: false,
        isCoinOperated: true,
        isOutOfOrder: false
      });

      addMachine({
        machineId: `dryers-${Date.now()}`,
        dealId: '',
        machineType: 'Single Dryer',
        brand: 'Continental Girbau',
        model: '50 lb',
        quantity: 14,
        ageYears: 6, // 2018 machines
        capacityLbs: 50,
        vendPricePerUse: 2.50,
        conditionRating: 3,
        waterConsumptionGalPerCycle: 0,
        electricConsumptionKwh: undefined,
        gasConsumptionBtu: undefined,
        purchaseValue: 0,
        currentValue: 0,
        maintenanceCostAnnual: 0,
        isCardOperated: false,
        isCoinOperated: true,
        isOutOfOrder: false
      });

      // Add estimated expenses
      const sampleExpenses = [
        { name: 'Rent', amountAnnual: 84000 }, // $7,000/month
        { name: 'Utilities', amountAnnual: 18000 },
        { name: 'Insurance', amountAnnual: 6000 },
        { name: 'Maintenance', amountAnnual: 9000 },
        { name: 'Supplies', amountAnnual: 3600 }
      ];

      sampleExpenses.forEach(expense => {
        addExpenseItem({
          expenseId: `expense-${expense.name}-${Date.now()}`,
          dealId: '',
          expenseName: expense.name,
          expenseType: 'Fixed',
          amountAnnual: expense.amountAnnual
        });
      });

      toast({
        title: "Albany Park Data Loaded",
        description: "Sample deal data has been populated for testing",
      });

    } catch (error) {
      toast({
        title: "Data Processing Error",
        description: "Failed to process Albany Park data",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const validateCurrentDeal = () => {
    if (!deal) {
      toast({
        title: "No Deal Data",
        description: "Please enter deal information first",
        variant: "destructive"
      });
      return;
    }

    const validation = validateFinancialData(deal, expenseItems, machineInventory);
    
    toast({
      title: validation.isValid ? "Data Validation Passed" : "Data Issues Found",
      description: `${validation.warnings.length} warnings, ${validation.errors.length} errors found`,
    });

    return validation;
  };

  const processEquipmentString = (equipmentText: string) => {
    const parsed = parseEquipmentText(equipmentText);
    
    if (parsed.equipmentList.length > 0) {
      parsed.equipmentList.forEach((equipment, index) => {
        addMachine({
          machineId: `parsed-${Date.now()}-${index}`,
          dealId: '',
          machineType: equipment.type as any,
          brand: equipment.brand || 'Unknown',
          model: '',
          quantity: equipment.quantity,
          ageYears: equipment.age || 0,
          capacityLbs: equipment.capacity || 25,
          vendPricePerUse: equipment.price || 3.00,
          conditionRating: equipment.condition || 3,
          waterConsumptionGalPerCycle: 20,
          electricConsumptionKwh: undefined,
          gasConsumptionBtu: undefined,
          purchaseValue: 0,
          currentValue: 0,
          maintenanceCostAnnual: 0,
          isCardOperated: false,
          isCoinOperated: true,
          isOutOfOrder: false
        });
      });

      toast({
        title: "Equipment Processed",
        description: `Added ${parsed.equipmentList.length} equipment items (${parsed.totalWashers} washers, ${parsed.totalDryers} dryers)`,
      });
    }
  };

  return {
    processAlbanyParkData,
    validateCurrentDeal,
    processEquipmentString,
    isProcessing
  };
};
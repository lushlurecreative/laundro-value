import { useState } from 'react';
import { useDeal } from '@/contexts/useDeal';
import { useToast } from '@/components/ui/use-toast';
import { parseEquipmentText } from '@/utils/equipmentParser';
import { validateFinancialData } from '@/utils/dataValidator';

export const useDataProcessor = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { deal, updateDeal, addMachine, addExpenseItem, expenseItems, machineInventory } = useDeal();
  const { toast } = useToast();

  const processAlbanyParkData = async () => {
    setIsProcessing(true);
    
    try {
      // Use the actual Albany Park equipment list to test real extraction
      const albanyParkData = `
        Albany Park Coin Laundry
        3516 W Lawrence Ave, Chicago, IL 60625
        Asking Price: $175,000
        
        EQUIPMENT:
        5 - 50# SPEED QUEEN WASHERS
        4 - 40# SPEED QUEEN WASHERS  
        3 - 35# SPEED QUEEN WASHERS
        12 - 75# SPEED QUEEN DRYERS
        8 - 50# SPEED QUEEN DRYERS
        6 - 30# SPEED QUEEN DRYERS
        32- 35# SPEED QUEEN DRYER POCKETS
        24- LAUNDRY CARTS
        1 - WATER HEATER (NOT WORKING)
        
        2024 INCOME: $231,283
        Total Annual Expenses: $212,982
        Net Operating Income: $18,301
      `;

      // Use the working extract-listing-data function
      const { supabase } = await import('@/integrations/supabase/client');
      const { data: result, error } = await supabase.functions.invoke('extract-listing-data', {
        body: {
          extractionType: 'text',
          rawText: albanyParkData,
          documentType: 'real-estate'
        }
      });

      if (error) throw error;

      if (result.success && result.data) {
        const extractedData = result.data;
        
        // Apply the extracted data using the working logic
        if (extractedData.propertyInfo) {
          updateDeal({
            dealName: 'Albany Park Coin Laundry',
            propertyAddress: extractedData.propertyInfo.address || '3516 W Lawrence Ave, Chicago, IL 60625',
            askingPrice: extractedData.propertyInfo.askingPrice || 175000,
            facilitySizeSqft: extractedData.propertyInfo.squareFootage,
            grossIncomeAnnual: 231283 // From the actual P&L
          });
        }

        // Apply equipment using the working extraction logic
        if (extractedData.equipment) {
          extractedData.equipment.forEach(equipment => {
            addMachine({
              machineId: crypto.randomUUID(),
              dealId: '',
              machineType: equipment.type as any,
              brand: equipment.brand || 'Speed Queen',
              model: equipment.model || '',
              quantity: equipment.quantity,
              ageYears: 5,
              capacityLbs: parseInt(equipment.capacity?.replace('#', '') || '35'),
              vendPricePerUse: equipment.type.toLowerCase().includes('washer') ? 4.50 : 3.50,
              conditionRating: 3,
              waterConsumptionGalPerCycle: equipment.type.toLowerCase().includes('washer') ? 25 : 0,
              electricConsumptionKwh: undefined,
              gasConsumptionBtu: undefined,
              purchaseValue: 0,
              currentValue: 0,
              maintenanceCostAnnual: 0,
              isCardOperated: true,
              isCoinOperated: false,
              isOutOfOrder: false
            });
          });
        }

        toast({
          title: "Albany Park Data Extracted",
          description: `Successfully loaded real data: $${extractedData.propertyInfo?.askingPrice?.toLocaleString()} asking price with ${extractedData.equipment?.length || 0} equipment items`,
        });
      } else {
        throw new Error('Data extraction failed');
      }

    } catch (error) {
      console.error('Albany Park data processing error:', error);
      toast({
        title: "Data Processing Error",
        description: "Failed to process Albany Park data using extraction system",
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
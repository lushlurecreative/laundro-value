import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { useDeal } from '@/contexts/useDeal';
import { useOpenAIAnalysis } from '@/hooks/useOpenAIAnalysis';
import { parseEquipmentText, formatEquipmentSummary } from '@/utils/equipmentParser';
import { validateFinancialData, generateDataQualityReport } from '@/utils/dataValidator';
import { FileUp, Zap, CheckCircle, AlertTriangle } from 'lucide-react';

export const DataImportTools: React.FC = () => {
  const [importText, setImportText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { deal, expenseItems, machineInventory, updateDeal, addMachine } = useDeal();
  const { analyzeText, isAnalyzing } = useOpenAIAnalysis({
    onFieldsPopulated: (fields) => {
      processExtractedData(fields);
    }
  });
  const { toast } = useToast();

  const processExtractedData = (extractedData: any) => {
    let updatedFields = 0;

    // Process basic deal data
    if (extractedData.askingPrice) {
      updateDeal({ askingPrice: extractedData.askingPrice });
      updatedFields++;
    }

    if (extractedData.grossIncome) {
      updateDeal({ grossIncomeAnnual: extractedData.grossIncome });
      updatedFields++;
    }

    if (extractedData.totalSqft) {
      updateDeal({ facilitySizeSqft: extractedData.totalSqft });
      updatedFields++;
    }

    if (extractedData.propertyAddress) {
      updateDeal({ propertyAddress: extractedData.propertyAddress });
      updatedFields++;
    }

    // Process equipment data with enhanced parsing
    if (extractedData.totalWashers || extractedData.totalDryers) {
      const equipmentSummary = `${extractedData.totalWashers || 0} washers, ${extractedData.totalDryers || 0} dryers`;
      
      // Add sample equipment based on totals
      if (extractedData.totalWashers > 0) {
        addMachine({
          machineId: `auto-washers-${Date.now()}`,
          dealId: '',
          machineType: 'Front-Load Washer',
          brand: 'Continental Girbau',
          model: '',
          quantity: extractedData.totalWashers,
          ageYears: extractedData.avgEquipmentAge || 5,
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
      }

      if (extractedData.totalDryers > 0) {
        addMachine({
          machineId: `auto-dryers-${Date.now()}`,
          dealId: '',
          machineType: 'Single Dryer',
          brand: 'Continental Girbau',
          model: '',
          quantity: extractedData.totalDryers,
          ageYears: extractedData.avgEquipmentAge || 5,
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
      }
      
      updatedFields += 2;
    }

    toast({
      title: "Data Import Complete",
      description: `Successfully populated ${updatedFields} fields from the imported data.`,
    });
  };

  const handleQuickImport = async () => {
    if (!importText.trim()) {
      toast({
        title: "No Data to Import",
        description: "Please paste some text to analyze and import.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // Use AI analysis for intelligent data extraction
      await analyzeText(importText, 'notes');
      
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "Unable to process the imported data. Please check the format and try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const validateCurrentData = () => {
    const validation = validateFinancialData(deal, expenseItems, machineInventory);
    const report = generateDataQualityReport(validation);
    
    toast({
      title: validation.isValid ? "Data Quality: Good" : "Data Quality: Issues Found",
      description: `${validation.warnings.length} warnings, ${validation.errors.length} errors, ${validation.suggestions.length} suggestions`,
    });

    // Log detailed report to console for debugging
    console.log("Data Quality Report:", report);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileUp className="h-5 w-5" />
            Quick Data Import
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <FileUp className="h-4 w-4" />
            <AlertDescription>
              Paste listing data, financial statements, or equipment lists. AI will extract and populate relevant fields automatically.
            </AlertDescription>
          </Alert>

          <Textarea
            placeholder="Paste your data here... 

Examples:
- Listing descriptions
- Equipment lists: '12 Washers (Continental Girbau 25 lb 2018 3.75) 14 Dryers...'
- Financial summaries
- Lease information"
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            className="min-h-[120px]"
          />

          <div className="flex gap-3">
            <Button 
              onClick={handleQuickImport}
              disabled={!importText.trim() || isProcessing || isAnalyzing}
              className="flex-1"
            >
              <Zap className="h-4 w-4 mr-2" />
              {isProcessing || isAnalyzing ? 'Processing...' : 'Import & Analyze'}
            </Button>
            
            <Button 
              variant="outline"
              onClick={validateCurrentData}
              disabled={!deal}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Validate Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sample Data Examples */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Sample Import Formats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>
              <strong>Equipment Format:</strong>
              <code className="block bg-muted p-2 mt-1 rounded text-xs">
                12 Washers (Continental Girbau 25 lb 2018 3.75) 14 Dryers (Continental Girbau 50 lb 2018 2.50)
              </code>
            </div>
            
            <div>
              <strong>Financial Format:</strong>
              <code className="block bg-muted p-2 mt-1 rounded text-xs">
                Asking Price: $450,000 | Annual Revenue: $180,000 | Square Feet: 2,400
              </code>
            </div>

            <div>
              <strong>Albany Park Example:</strong>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setImportText(`Albany Park Coin Laundry
Asking Price: $450,000
Annual Revenue: $180,000
Square Feet: 2,400 sq ft
Address: 4627 N Kedzie Ave, Chicago, IL

Equipment: 12 Washers (Continental Girbau 25 lb 2018 3.75) 14 Dryers (Continental Girbau 50 lb 2018 2.50)

Current lease through October 2027 with 2 five-year renewal options
Monthly rent: $7,000
Annual rent increases: 3%`)}
              >
                Load Sample Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
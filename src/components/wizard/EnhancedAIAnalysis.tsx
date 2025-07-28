import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDeal } from '@/contexts/useDeal';
import { useOpenAIAnalysis } from '@/hooks/useOpenAIAnalysis';
import { Lightbulb, FileText, Building2, DollarSign, Loader2, CheckCircle, Upload } from 'lucide-react';
import { FormLoadingSkeleton, AnalysisLoadingSkeleton } from './LoadingStates';

export const EnhancedAIAnalysis = () => {
  const { deal, updateDeal, updateLeaseDetails, addExpenseItem, addMachine, machineInventory, ancillaryIncome, updateAncillaryIncome, expenseItems, removeExpenseItem, removeMachine } = useDeal();
  const [text, setText] = useState(deal?.pastedInformation || '');
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [confidenceScores, setConfidenceScores] = useState<Record<string, number>>({});
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const { analyzeText, isAnalyzing } = useOpenAIAnalysis({
    onFieldsPopulated: (fields) => {
      console.log('AI fields populated:', fields);
      setAnalysisResults(fields);
      
      // Clear existing auto-generated data before updating to avoid duplication
      if (expenseItems.length > 0) {
        expenseItems.forEach(expense => {
          if (expense.expenseId) {
            removeExpenseItem(expense.expenseId);
          }
        });
      }
      
      if (machineInventory.length > 0) {
        machineInventory.forEach(machine => {
          if (machine.machineId) {
            removeMachine(machine.machineId);
          }
        });
      }
      
      // Calculate confidence scores based on data completeness
      const scores: Record<string, number> = {};
      if (fields.askingPrice) scores.pricing = 95;
      if (fields.grossIncomeAnnual || fields.grossIncome) scores.income = 90;
      if (fields.lease?.monthlyRent) scores.lease = 85;
      if (fields.equipment?.washers && fields.equipment?.dryers) scores.equipment = 88;
      if (fields.expenses && Object.keys(fields.expenses).length > 0) scores.expenses = 75;
      
      setConfidenceScores(scores);

      // Extract business name from text for deal name
      const businessNameMatch = text.match(/([A-Z\s]+(?:COIN\s+)?LAUNDRY(?:MAT)?)/i);
      const businessName = businessNameMatch ? businessNameMatch[1].trim() : '';

      // Auto-populate main deal fields with enhanced mapping
      const dealUpdate: any = { pastedInformation: text };
      if (fields.askingPrice) dealUpdate.askingPrice = fields.askingPrice;
      if (fields.grossIncomeAnnual) dealUpdate.grossIncomeAnnual = fields.grossIncomeAnnual;
      if (fields.grossIncome) dealUpdate.grossIncomeAnnual = fields.grossIncome;
      if (fields.facilitySizeSqft) dealUpdate.facilitySizeSqft = fields.facilitySizeSqft;
      if (fields.propertyAddress) dealUpdate.propertyAddress = fields.propertyAddress;
      if (fields.annualNet) dealUpdate.annualNet = fields.annualNet;
      if (fields.ebitda) dealUpdate.ebitda = fields.ebitda;
      if (businessName) dealUpdate.dealName = businessName;
      
      updateDeal(dealUpdate);

      // Enhanced income mapping - handle the specific income types from the data
      if (fields.machineIncome || fields.dropOffIncome || fields.vendingIncome) {
        const incomeUpdate: any = { ...ancillaryIncome };
        
        // Machine income goes to main gross income if not already set
        if (fields.machineIncome && !dealUpdate.grossIncomeAnnual) {
          updateDeal({ ...dealUpdate, grossIncomeAnnual: fields.machineIncome });
        }
        
        // Drop-off and vending are ancillary income
        if (fields.dropOffIncome) incomeUpdate.washAndFold = fields.dropOffIncome;
        if (fields.vendingIncome) incomeUpdate.vending = fields.vendingIncome;
        
        if (Object.keys(incomeUpdate).length > 0) {
          updateAncillaryIncome(incomeUpdate);
        }
      }

      // Enhanced lease handling with proper monthly to annual conversion
      if (fields.lease) {
        const leaseUpdate: any = {};
        if (fields.lease.monthlyRent) leaseUpdate.monthlyRent = fields.lease.monthlyRent;
        if (fields.lease.remainingTermYears) leaseUpdate.remainingLeaseTermYears = fields.lease.remainingTermYears;
        if (fields.lease.remainingLeaseTermYears) leaseUpdate.remainingLeaseTermYears = fields.lease.remainingLeaseTermYears;
        if (fields.lease.renewalOptionsCount) leaseUpdate.renewalOptionsCount = fields.lease.renewalOptionsCount;
        if (fields.lease.renewalOptionLengthYears) leaseUpdate.renewalOptionLengthYears = fields.lease.renewalOptionLengthYears;
        if (fields.lease.annualRentIncreasePercent) leaseUpdate.annualRentIncreasePercent = fields.lease.annualRentIncreasePercent;
        
        if (Object.keys(leaseUpdate).length > 0) {
          updateLeaseDetails(leaseUpdate);
        }
      }

      // Enhanced equipment handling with delay to ensure clearing is complete
      setTimeout(() => {
        if (fields.equipment) {
          // Add washers of different sizes
          if (fields.equipment.washers50lb) {
            addMachine({
              machineId: `washer-50lb-${Date.now()}-${Math.random()}`,
              dealId: '',
              machineType: 'Front-Load Washer',
              brand: 'Speed Queen',
              model: '',
              quantity: fields.equipment.washers50lb,
              ageYears: 5,
              capacityLbs: 50,
              vendPricePerUse: 4.50,
              conditionRating: 3,
              waterConsumptionGalPerCycle: 25,
              electricConsumptionKwh: undefined,
              gasConsumptionBtu: undefined,
              purchaseValue: 0,
              currentValue: 0,
              maintenanceCostAnnual: 0,
              isCardOperated: true,
              isCoinOperated: false,
              isOutOfOrder: false
            });
          }
          if (fields.equipment.washers35lb) {
            addMachine({
              machineId: `washer-35lb-${Date.now()}-${Math.random()}`,
              dealId: '',
              machineType: 'Front-Load Washer',
              brand: 'Speed Queen',
              model: '',
              quantity: fields.equipment.washers35lb,
              ageYears: 5,
              capacityLbs: 35,
              vendPricePerUse: 3.50,
              conditionRating: 3,
              waterConsumptionGalPerCycle: 22,
              electricConsumptionKwh: undefined,
              gasConsumptionBtu: undefined,
              purchaseValue: 0,
              currentValue: 0,
              maintenanceCostAnnual: 0,
              isCardOperated: true,
              isCoinOperated: false,
              isOutOfOrder: false
            });
          }
          if (fields.equipment.washers18lb) {
            addMachine({
              machineId: `washer-18lb-${Date.now()}-${Math.random()}`,
              dealId: '',
              machineType: 'Top-Load Washer',
              brand: 'Speed Queen',
              model: '',
              quantity: fields.equipment.washers18lb,
              ageYears: 5,
              capacityLbs: 18,
              vendPricePerUse: 2.50,
              conditionRating: 3,
              waterConsumptionGalPerCycle: 30,
              electricConsumptionKwh: undefined,
              gasConsumptionBtu: undefined,
              purchaseValue: 0,
              currentValue: 0,
              maintenanceCostAnnual: 0,
              isCardOperated: true,
              isCoinOperated: false,
              isOutOfOrder: false
            });
          }
          if (fields.equipment.dryerPockets) {
            addMachine({
              machineId: `dryer-pockets-${Date.now()}-${Math.random()}`,
              dealId: '',
              machineType: 'Single Dryer',
              brand: 'Speed Queen',
              model: '',
              quantity: fields.equipment.dryerPockets,
              ageYears: 5,
              capacityLbs: 35,
              vendPricePerUse: 2.50,
              conditionRating: 3,
              waterConsumptionGalPerCycle: undefined,
              electricConsumptionKwh: undefined,
              gasConsumptionBtu: undefined,
              purchaseValue: 0,
              currentValue: 0,
              maintenanceCostAnnual: 0,
              isCardOperated: true,
              isCoinOperated: false,
              isOutOfOrder: false
            });
          }
          // Generic washer/dryer fallback
          if (fields.equipment.washers && !fields.equipment.washers50lb && !fields.equipment.washers35lb && !fields.equipment.washers18lb) {
            addMachine({
              machineId: `washer-generic-${Date.now()}-${Math.random()}`,
              dealId: '',
              machineType: 'Front-Load Washer',
              brand: 'Speed Queen',
              model: '',
              quantity: fields.equipment.washers,
              ageYears: 5,
              capacityLbs: 25,
              vendPricePerUse: 3.00,
              conditionRating: 3,
              waterConsumptionGalPerCycle: 25,
              electricConsumptionKwh: undefined,
              gasConsumptionBtu: undefined,
              purchaseValue: 0,
              currentValue: 0,
              maintenanceCostAnnual: 0,
              isCardOperated: true,
              isCoinOperated: false,
              isOutOfOrder: false
            });
          }
          if (fields.equipment.dryers && !fields.equipment.dryerPockets) {
            addMachine({
              machineId: `dryer-generic-${Date.now()}-${Math.random()}`,
              dealId: '',
              machineType: 'Single Dryer',
              brand: 'Speed Queen',
              model: '',
              quantity: fields.equipment.dryers,
              ageYears: 5,
              capacityLbs: 35,
              vendPricePerUse: 2.50,
              conditionRating: 3,
              waterConsumptionGalPerCycle: undefined,
              electricConsumptionKwh: undefined,
              gasConsumptionBtu: undefined,
              purchaseValue: 0,
              currentValue: 0,
              maintenanceCostAnnual: 0,
              isCardOperated: true,
              isCoinOperated: false,
              isOutOfOrder: false
            });
          }
        }
      }, 150);  // Slightly longer delay to ensure clearing is complete

      // Enhanced expense handling with delay to ensure clearing is complete
      setTimeout(() => {
        if (fields.expenses) {
          const expenseMapping = {
            rent: 'Rent',
            electricity: 'Electricity',
            electric: 'Electricity',
            gas: 'Gas',
            water: 'Water & Sewer',
            maintenance: 'Repairs & Maintenance',
            repairs: 'Repairs & Maintenance',
            insurance: 'Insurance',
            trash: 'Trash & Waste Removal',
            'waste removal': 'Trash & Waste Removal',
            licenses: 'Licenses & Permits',
            supplies: 'Supplies',
            'cost of goods sold': 'Supplies',
            internet: 'Internet',
            payroll: 'Payroll',
            accounting: 'Accounting',
            alarm: 'Security & Alarm',
            depreciation: 'Depreciation',
            auto: 'Auto Expense',
            'auto expense': 'Auto Expense',
            bank: 'Bank Charges',
            'bank charges': 'Bank Charges',
            meals: 'Meals & Entertainment',
            office: 'Office Expenses'
          };

          Object.entries(fields.expenses).forEach(([key, value]) => {
            const displayName = expenseMapping[key.toLowerCase() as keyof typeof expenseMapping] || 
                                key.charAt(0).toUpperCase() + key.slice(1);
            addExpenseItem({
              expenseId: `${key}-${Date.now()}-${Math.random()}`,
              dealId: '',
              expenseName: displayName,
              amountAnnual: value as number,
              expenseType: key.toLowerCase().includes('payroll') ? 'Variable' : 'Fixed'
            });
          });
        }
      }, 100);

      // Enhanced ancillary income handling
      if (fields.ancillary) {
        const updates: any = { ...ancillaryIncome };
        if (fields.ancillary.vending) updates.vending = fields.ancillary.vending;
        if (fields.ancillary.dropOff) updates.washAndFold = fields.ancillary.dropOff;
        
        if (Object.keys(updates).length > 0) {
          updateAncillaryIncome(updates);
        }
      }
    }
  });

  const handleAnalysis = (analysisType: 'notes' | 'lease' = 'notes') => {
    if (text.trim()) {
      // Save the pasted text to deal context
      updateDeal({ pastedInformation: text });
      analyzeText(text, analysisType);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
    
    // Process files and extract text for analysis
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setText(prev => prev + '\n\n' + content);
      };
      reader.readAsText(file);
    });
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const ConfidenceBadge = ({ score, label }: { score: number; label: string }) => {
    const color = score >= 90 ? 'bg-green-100 text-green-800' : 
                  score >= 75 ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-red-100 text-red-800';
    
    return (
      <Badge variant="secondary" className={color}>
        {label}: {score}% confident
      </Badge>
    );
  };

  if (isAnalyzing) {
    return <AnalysisLoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      <Alert className="border-primary bg-primary/5">
        <Lightbulb className="h-4 w-4" />
        <AlertDescription>
          <strong>Enhanced AI Analysis:</strong> Paste any deal information below. Our AI will intelligently extract and populate relevant fields with confidence scoring.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">General Notes</TabsTrigger>
          <TabsTrigger value="lease">Lease Documents</TabsTrigger>
          <TabsTrigger value="listing">Property Listing</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                General Deal Information
              </CardTitle>
              <CardDescription>
                Paste general notes, emails, or any deal-related text
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Paste your deal notes, emails, or any text containing deal information..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[150px]"
              />
              
              <div className="space-y-2">
                <label htmlFor="file-upload" className="block text-sm font-medium">
                  Or upload documents (PDF, TXT, DOC)
                </label>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  accept=".pdf,.txt,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('file-upload')?.click()}
                  className="w-full"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Documents
                </Button>
                
                {uploadedFiles.length > 0 && (
                  <div className="space-y-1">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                        <span>{file.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button 
                onClick={() => handleAnalysis('notes')} 
                disabled={!text.trim() || isAnalyzing}
                className="w-full"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Analyze General Information
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lease" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Lease Document Analysis
              </CardTitle>
              <CardDescription>
                Paste lease agreements or rental documents for detailed extraction
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Paste lease agreement text, rental terms, or property management documents..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[150px]"
              />
              <Button 
                onClick={() => handleAnalysis('lease')} 
                disabled={!text.trim() || isAnalyzing}
                className="w-full"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Building2 className="mr-2 h-4 w-4" />
                    Analyze Lease Document
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="listing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Property Listing Analysis
              </CardTitle>
              <CardDescription>
                Paste property listings, broker sheets, or sales materials
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Paste property listing, broker marketing sheet, or sales information..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[150px]"
              />
              <Button 
                onClick={() => handleAnalysis('notes')} 
                disabled={!text.trim() || isAnalyzing}
                className="w-full"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <DollarSign className="mr-2 h-4 w-4" />
                    Analyze Property Listing
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {analysisResults && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              Analysis Complete
            </CardTitle>
            <CardDescription className="text-green-600">
              AI has extracted and populated the following information:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(confidenceScores).map(([category, score]) => (
                <ConfidenceBadge key={category} score={score} label={category} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Alert>
        <Lightbulb className="h-4 w-4" />
        <AlertDescription>
          <strong>Pro Tips:</strong>
          <ul className="mt-2 list-disc list-inside space-y-1">
            <li>Include specific numbers for better accuracy (rent amounts, machine counts, etc.)</li>
            <li>Paste multiple sources of information for comprehensive analysis</li>
            <li>Review auto-populated fields and adjust as needed</li>
            <li>Use different tabs for specialized document types</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
};
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
  const { deal, updateDeal, updateLeaseDetails, addExpenseItem, addMachine, machineInventory, ancillaryIncome, updateAncillaryIncome } = useDeal();
  const [text, setText] = useState(deal?.pastedInformation || '');
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [confidenceScores, setConfidenceScores] = useState<Record<string, number>>({});
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const { analyzeText, isAnalyzing } = useOpenAIAnalysis({
    onFieldsPopulated: (fields) => {
      setAnalysisResults(fields);
      
      // Calculate confidence scores based on data completeness
      const scores: Record<string, number> = {};
      if (fields.askingPrice) scores.pricing = 95;
      if (fields.grossIncome) scores.income = 90;
      if (fields.lease?.monthlyRent) scores.lease = 85;
      if (fields.equipment?.washers && fields.equipment?.dryers) scores.equipment = 88;
      if (fields.expenses && Object.keys(fields.expenses).length > 0) scores.expenses = 75;
      
      setConfidenceScores(scores);

      // Auto-populate fields with enhanced mapping and save pasted info
      const dealUpdate: any = { pastedInformation: text };
      if (fields.askingPrice) dealUpdate.askingPrice = fields.askingPrice;
      if (fields.grossIncomeAnnual) dealUpdate.grossIncomeAnnual = fields.grossIncomeAnnual;
      if (fields.facilitySizeSqft) dealUpdate.facilitySizeSqft = fields.facilitySizeSqft;
      if (fields.propertyAddress) dealUpdate.propertyAddress = fields.propertyAddress;
      updateDeal(dealUpdate);

      // Enhanced lease handling
      if (fields.lease) {
        const leaseUpdate: any = {};
        if (fields.lease.monthlyRent) leaseUpdate.monthlyRent = fields.lease.monthlyRent;
        if (fields.lease.remainingTermYears) leaseUpdate.remainingLeaseTermYears = fields.lease.remainingTermYears;
        if (fields.lease.renewalOptionsCount) leaseUpdate.renewalOptionsCount = fields.lease.renewalOptionsCount;
        if (fields.lease.annualRentIncreasePercent) leaseUpdate.annualRentIncreasePercent = fields.lease.annualRentIncreasePercent;
        
        if (Object.keys(leaseUpdate).length > 0) {
          updateLeaseDetails(leaseUpdate);
        }
      }

      // Enhanced equipment handling
      if (fields.equipment) {
        if (fields.equipment.washers) {
          addMachine({
            machineId: `washer-${Date.now()}`,
            dealId: '',
            machineType: 'Top-Load Washer',
            brand: '',
            quantity: fields.equipment.washers,
            ageYears: fields.equipment.avgAge || 5,
            capacityLbs: 20,
            vendPricePerUse: 2.50,
            conditionRating: 3,
            purchaseValue: 0,
            currentValue: 0,
            maintenanceCostAnnual: 0,
            isCardOperated: false,
            isCoinOperated: true,
            isOutOfOrder: false
          });
        }
        if (fields.equipment.dryers) {
          addMachine({
            machineId: `dryer-${Date.now()}`,
            dealId: '',
            machineType: 'Single Dryer',
            brand: '',
            quantity: fields.equipment.dryers,
            ageYears: fields.equipment.avgAge || 5,
            capacityLbs: 45,
            vendPricePerUse: 2.00,
            conditionRating: 3,
            purchaseValue: 0,
            currentValue: 0,
            maintenanceCostAnnual: 0,
            isCardOperated: false,
            isCoinOperated: true,
            isOutOfOrder: false
          });
        }
      }

      // Enhanced expense handling with common categories
      if (fields.expenses) {
        const expenseMapping = {
          rent: 'Rent',
          electricity: 'Electricity',
          gas: 'Gas',
          water: 'Water & Sewer',
          maintenance: 'Maintenance & Repairs',
          insurance: 'Insurance',
          trash: 'Trash Removal',
          licenses: 'Licenses & Permits',
          supplies: 'Supplies & COGS',
          internet: 'Internet'
        };

        Object.entries(fields.expenses).forEach(([key, value]) => {
          const displayName = expenseMapping[key as keyof typeof expenseMapping] || key;
          addExpenseItem({
            expenseId: `${key}-${Date.now()}`,
            dealId: '',
            expenseName: displayName,
            amountAnnual: (value as number) * 12,
            expenseType: 'Fixed'
          });
        });
      }

      // Enhanced ancillary income
      if (fields.ancillary) {
        const updates: any = { ...ancillaryIncome };
        if (fields.ancillary.vending) updates.vending = fields.ancillary.vending;
        updateAncillaryIncome(updates);
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
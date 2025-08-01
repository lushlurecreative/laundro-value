import { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Link, FileText, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useDeal } from "@/contexts/useDeal";
import { MachineInventory, ExpenseItem } from "@/types/deal";

interface ExtractedData {
  propertyInfo?: {
    address?: string;
    askingPrice?: number;
    squareFootage?: number;
    yearBuilt?: number;
  };
  leaseInfo?: {
    monthlyRent?: number;
    leaseTermYears?: number;
    securityDeposit?: number;
    renewalOptions?: string;
  };
  equipment?: Array<{
    quantity: number;
    type: string;
    brand?: string;
    capacity?: string;
    model?: string;
  }>;
  expenses?: Record<string, number>;
  income?: {
    grossIncome?: number;
    ancillaryIncome?: Record<string, number>;
  };
  utilities?: {
    electricity?: number;
    water?: number;
    gas?: number;
    sewer?: number;
  };
}

export const DataExtractionForm = () => {
  const { toast } = useToast();
  const { updateDeal, updateLeaseDetails, addMachine, addExpenseItem } = useDeal();
  
  const [url, setUrl] = useState('');
  const [rawText, setRawText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('url');

  const processExtraction = async (extractionType: 'url' | 'text', data: string) => {
    setIsProcessing(true);
    setProgress(10);
    
    try {
      const requestData = {
        extractionType,
        [extractionType === 'url' ? 'url' : 'rawText']: data,
        documentType: 'real-estate'
      };
      
      setProgress(30);
      
      const { data: result, error } = await supabase.functions.invoke('extract-listing-data', {
        body: requestData
      });
      
      setProgress(60);
      
      if (error) {
        throw error;
      }
      
      if (result.success) {
        setExtractedData(result.data);
        setProgress(100);
        
        toast({
          title: "Data Extraction Complete",
          description: "Successfully extracted and parsed property data",
        });
      } else {
        throw new Error(result.error || 'Extraction failed');
      }
      
    } catch (error) {
      console.error('Extraction error:', error);
      toast({
        title: "Extraction Failed",
        description: error.message || "Unable to extract data from the provided source",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUrlExtraction = async () => {
    if (!url.trim()) return;
    await processExtraction('url', url);
  };

  const handleTextExtraction = async () => {
    if (!rawText.trim()) return;
    await processExtraction('text', rawText);
  };

  const applyExtractedData = () => {
    if (!extractedData) return;
    
    try {
      // Apply property info
      if (extractedData.propertyInfo) {
        updateDeal({
          propertyAddress: extractedData.propertyInfo.address,
          askingPrice: extractedData.propertyInfo.askingPrice,
          facilitySizeSqft: extractedData.propertyInfo.squareFootage
        });
      }
      
      // Apply lease info
      if (extractedData.leaseInfo) {
        updateLeaseDetails({
          monthlyRent: extractedData.leaseInfo.monthlyRent,
          remainingLeaseTermYears: extractedData.leaseInfo.leaseTermYears,
          leaseTerms: extractedData.leaseInfo.renewalOptions
        });
      }
      
      // Apply equipment data
      if (extractedData.equipment) {
        extractedData.equipment.forEach(equipment => {
          const machineData: Partial<MachineInventory> = {
            machineId: crypto.randomUUID(),
            machineType: equipment.type as any,
            brand: equipment.brand || 'Unknown',
            model: equipment.model || '',
            quantity: equipment.quantity,
            ageYears: 5, // Default
            capacityLbs: parseInt(equipment.capacity?.replace('#', '') || '35'),
            vendPricePerUse: equipment.type.toLowerCase().includes('washer') ? 4.50 : 3.50,
            conditionRating: 3,
            waterConsumptionGalPerCycle: equipment.type.toLowerCase().includes('washer') ? 25 : 0,
            isCardOperated: true,
            isCoinOperated: false,
            isOutOfOrder: false
          };
          
          addMachine(machineData as MachineInventory);
        });
      }
      
      // Apply expenses
      if (extractedData.expenses) {
        Object.entries(extractedData.expenses).forEach(([name, amount]) => {
          const expenseData: ExpenseItem = {
            expenseId: crypto.randomUUID(),
            dealId: '',
            expenseType: 'Fixed' as any,
            expenseName: name,
            amountAnnual: amount * 12
          };
          
          addExpenseItem(expenseData);
        });
      }
      
      // Apply income data
      if (extractedData.income?.grossIncome) {
        updateDeal({
          grossIncomeAnnual: extractedData.income.grossIncome * 12
        });
      }
      
      toast({
        title: "Data Applied Successfully",
        description: "All extracted data has been populated into the form fields",
      });
      
      setExtractedData(null);
      
    } catch (error) {
      console.error('Error applying data:', error);
      toast({
        title: "Error Applying Data",
        description: "Some data could not be applied to the form",
        variant: "destructive"
      });
    }
  };

  const renderExtractedDataPreview = () => {
    if (!extractedData) return null;
    
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Extracted Data Preview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {extractedData.propertyInfo && (
            <div>
              <h4 className="font-semibold mb-2">Property Information</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {extractedData.propertyInfo.address && (
                  <Badge variant="outline">Address: {extractedData.propertyInfo.address}</Badge>
                )}
                {extractedData.propertyInfo.askingPrice && (
                  <Badge variant="outline">Price: ${extractedData.propertyInfo.askingPrice.toLocaleString()}</Badge>
                )}
                {extractedData.propertyInfo.squareFootage && (
                  <Badge variant="outline">{extractedData.propertyInfo.squareFootage} sq ft</Badge>
                )}
              </div>
            </div>
          )}
          
          {extractedData.equipment && extractedData.equipment.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Equipment ({extractedData.equipment.length} items)</h4>
              <div className="space-y-1">
                {extractedData.equipment.map((item, index) => (
                  <Badge key={index} variant="secondary" className="mr-2 mb-1">
                    {item.quantity}x {item.brand} {item.type} {item.capacity && `(${item.capacity})`}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {extractedData.leaseInfo && (
            <div>
              <h4 className="font-semibold mb-2">Lease Information</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {extractedData.leaseInfo.monthlyRent && (
                  <Badge variant="outline">Rent: ${extractedData.leaseInfo.monthlyRent}/month</Badge>
                )}
                {extractedData.leaseInfo.leaseTermYears && (
                  <Badge variant="outline">Term: {extractedData.leaseInfo.leaseTermYears} years</Badge>
                )}
              </div>
            </div>
          )}
          
          <div className="flex gap-2 pt-4">
            <Button onClick={applyExtractedData} className="flex-1">
              Apply All Data to Form
            </Button>
            <Button variant="outline" onClick={() => setExtractedData(null)}>
              Discard
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Advanced Data Extraction
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="url" className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              URL
            </TabsTrigger>
            <TabsTrigger value="text" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Raw Text
            </TabsTrigger>
            <TabsTrigger value="file" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="url" className="space-y-4">
            <div>
              <label className="text-sm font-medium">Property Listing URL</label>
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/property-listing"
                className="mt-1"
              />
            </div>
            <Button 
              onClick={handleUrlExtraction}
              disabled={!url.trim() || isProcessing}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Extracting Data...
                </>
              ) : (
                'Extract from URL'
              )}
            </Button>
          </TabsContent>
          
          <TabsContent value="text" className="space-y-4">
            <div>
              <label className="text-sm font-medium">Raw Property Data</label>
              <Textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Paste equipment list, property details, financial information..."
                className="mt-1 min-h-[200px]"
              />
            </div>
            <Button 
              onClick={handleTextExtraction}
              disabled={!rawText.trim() || isProcessing}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing Text...
                </>
              ) : (
                'Extract from Text'
              )}
            </Button>
          </TabsContent>
          
          <TabsContent value="file" className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                File upload functionality will be available in the next update. For now, copy and paste the document content into the Raw Text tab.
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>
        
        {isProcessing && (
          <div className="mt-4">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground mt-2">
              Processing your data... This may take a few moments.
            </p>
          </div>
        )}
        
        {renderExtractedDataPreview()}
        
        <Alert className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Pro Tip:</strong> This system can parse equipment lists like "5 - 50# SPEED QUEEN WASHERS" 
            and automatically populate all relevant fields with accurate data.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
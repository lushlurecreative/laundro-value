import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, FileText, Plus, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ParsedEquipment {
  name: string;
  quantity: number;
  capacity: number;
  brand: string;
  condition: string;
}

interface EquipmentParserProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (equipment: ParsedEquipment[]) => void;
}

export const EquipmentParser: React.FC<EquipmentParserProps> = ({
  isOpen,
  onClose,
  onImport
}) => {
  const [equipmentText, setEquipmentText] = useState('');
  const [parsedEquipment, setParsedEquipment] = useState<ParsedEquipment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const { toast } = useToast();

  const handleParse = async () => {
    if (!equipmentText.trim()) {
      setError('Please enter equipment text to parse');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const { data, error: supabaseError } = await supabase.functions.invoke('extract-equipment-data', {
        body: { equipmentText: equipmentText.trim() }
      });

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to parse equipment');
      }

      setParsedEquipment(data.equipment);
      toast({
        title: "Equipment Parsed Successfully",
        description: `Found ${data.equipment.length} equipment items`,
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to parse equipment';
      setError(errorMessage);
      toast({
        title: "Parsing Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = () => {
    if (parsedEquipment.length === 0) {
      toast({
        title: "No Equipment to Import",
        description: "Please parse equipment text first",
        variant: "destructive"
      });
      return;
    }

    onImport(parsedEquipment);
    toast({
      title: "Equipment Imported",
      description: `Successfully imported ${parsedEquipment.length} equipment items`,
    });
    
    // Reset state
    setEquipmentText('');
    setParsedEquipment([]);
    setError('');
    onClose();
  };

  const handleClear = () => {
    setEquipmentText('');
    setParsedEquipment([]);
    setError('');
  };

  const getConditionBadge = (condition: string) => {
    const variant = condition.toLowerCase().includes('not working') || condition.toLowerCase().includes('broken') 
      ? 'destructive' 
      : condition.toLowerCase().includes('repair')
      ? 'secondary'
      : 'default';
    
    return <Badge variant={variant}>{condition}</Badge>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Equipment List Parser
          </DialogTitle>
          <DialogDescription>
            Paste your equipment list and automatically extract structured data
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Input Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Equipment Text Input</CardTitle>
              <CardDescription>
                Paste equipment listings in any format (e.g., "32- 35# SPEED QUEEN DRYER POCKETS")
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Paste your equipment list here...
Example:
32- 35# SPEED QUEEN DRYER POCKETS
5 - 50# SPEED QUEEN WASHERS (NOT WORKING)
10 - 20lb MAYTAG TOP LOAD WASHERS"
                value={equipmentText}
                onChange={(e) => setEquipmentText(e.target.value)}
                rows={8}
                className="resize-none"
              />
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleParse} 
                  disabled={isLoading || !equipmentText.trim()}
                  className="flex items-center gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  {isLoading ? 'Parsing...' : 'Parse Equipment'}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={handleClear}
                  disabled={isLoading}
                >
                  Clear
                </Button>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Results Section */}
          {parsedEquipment.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  Parsed Equipment ({parsedEquipment.length} items)
                </CardTitle>
                <CardDescription>
                  Review the extracted equipment data before importing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Equipment</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Capacity (lbs)</TableHead>
                        <TableHead>Brand</TableHead>
                        <TableHead>Condition</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parsedEquipment.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{item.capacity || 'N/A'}</TableCell>
                          <TableCell>{item.brand || 'Unknown'}</TableCell>
                          <TableCell>{getConditionBadge(item.condition)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex justify-between items-center mt-4">
                  <p className="text-sm text-muted-foreground">
                    {parsedEquipment.length} equipment items ready to import
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button onClick={handleImport} className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Import All Equipment
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
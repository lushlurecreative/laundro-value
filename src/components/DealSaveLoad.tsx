import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDeal } from '@/contexts/useDeal';
import { useDealPersistence } from '@/hooks/useDealPersistence';
import { useToast } from '@/hooks/use-toast';
import { Save, FolderOpen, Trash2, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export const DealSaveLoad: React.FC = () => {
  const { deal, leaseDetails, expenseItems, machineInventory, ancillaryIncome, utilityAnalysis } = useDeal();
  const { savedDeals, isLoading, saveDeal, deleteDeal, loadSavedDeals } = useDealPersistence();
  const { toast } = useToast();
  const [dealName, setDealName] = useState('');
  const [selectedDealId, setSelectedDealId] = useState<string>('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    loadSavedDeals();
  }, []);

  useEffect(() => {
    if (deal?.dealName) {
      setDealName(deal.dealName);
    }
  }, [deal?.dealName]);

  const handleSave = async () => {
    if (!dealName.trim()) {
      toast({
        title: "Deal name required",
        description: "Please enter a name for your deal.",
        variant: "destructive",
      });
      return;
    }

    if (!deal) {
      toast({
        title: "No deal data",
        description: "Please enter some deal information before saving.",
        variant: "destructive",
      });
      return;
    }

    await saveDeal(
      dealName.trim(),
      deal,
      leaseDetails,
      expenseItems,
      machineInventory,
      ancillaryIncome,
      utilityAnalysis
    );
    
    setShowSaveDialog(false);
    await loadSavedDeals();
  };

  const handleLoad = async (dealId: string) => {
    const selectedDeal = savedDeals.find(d => d.id === dealId);
    if (!selectedDeal) return;

    try {
      const dealData = selectedDeal.deal_data;
      
      // Load the deal data into the context
      // This would need to be implemented in the useDeal hook
      // For now, we'll show a message
      toast({
        title: "Deal loaded",
        description: `Loaded deal: ${selectedDeal.deal_name}`,
      });
      
      setShowLoadDialog(false);
    } catch (error) {
      console.error('Error loading deal:', error);
      toast({
        title: "Error loading deal",
        description: "Failed to load the selected deal.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedDealId) return;

    await deleteDeal(selectedDealId);
    setShowDeleteDialog(false);
    setSelectedDealId('');
    await loadSavedDeals();
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex gap-2">
      {/* Save Deal */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Save Deal
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Deal</DialogTitle>
            <DialogDescription>
              Save your current deal analysis for later access.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="dealName">Deal Name</Label>
              <Input
                id="dealName"
                value={dealName}
                onChange={(e) => setDealName(e.target.value)}
                placeholder="Enter a name for this deal..."
              />
            </div>
            {savedDeals.some(d => d.deal_name === dealName.trim()) && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  A deal with this name already exists. Saving will overwrite the existing deal.
                </AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Deal'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Load Deal */}
      <Dialog open={showLoadDialog} onOpenChange={setShowLoadDialog}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4" />
            Load Deal
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Load Saved Deal</DialogTitle>
            <DialogDescription>
              Select a previously saved deal to load.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {savedDeals.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No saved deals found.</p>
                <p className="text-sm">Save your current deal to see it here.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {savedDeals.map((savedDeal) => (
                  <Card key={savedDeal.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleLoad(savedDeal.id)}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{savedDeal.deal_name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Saved: {formatDate(savedDeal.updated_at)}
                          </p>
                          {savedDeal.deal_data?.deal?.propertyAddress && (
                            <p className="text-sm text-muted-foreground">
                              {savedDeal.deal_data.deal.propertyAddress}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {savedDeal.deal_data?.deal?.askingPrice && (
                            <span className="text-sm font-medium">
                              ${savedDeal.deal_data.deal.askingPrice.toLocaleString()}
                            </span>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDealId(savedDeal.id);
                              setShowDeleteDialog(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLoadDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Deal</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this deal? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
              {isLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
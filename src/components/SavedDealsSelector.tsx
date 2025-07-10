import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Download, Calendar } from 'lucide-react';
import { useDeal } from '@/contexts/useDeal';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { formatCurrency } from '@/utils/calculations';

interface SavedDeal {
  timestamp: string;
  deal: any;
  leaseDetails: any;
  expenseItems: any[];
  machineInventory: any[];
  ancillaryIncome: any;
  utilityAnalysis: any;
  savedAt: string;
}

export const SavedDealsSelector: React.FC = () => {
  const [savedDeals, setSavedDeals] = useState<SavedDeal[]>([]);
  const { updateDeal, updateLeaseDetails, addExpenseItem, addMachine, updateAncillaryIncome, updateUtilityAnalysis, clearAllData } = useDeal();

  useEffect(() => {
    loadSavedDeals();
  }, []);

  const loadSavedDeals = () => {
    const deals: SavedDeal[] = [];
    const keys = Object.keys(localStorage);
    
    keys.forEach(key => {
      if (key.startsWith('laundromat-deal-backup-')) {
        try {
          const dealData = JSON.parse(localStorage.getItem(key) || '');
          if (dealData.deal) {
            deals.push({
              timestamp: key.replace('laundromat-deal-backup-', ''),
              ...dealData
            });
          }
        } catch (error) {
          console.error('Failed to parse saved deal:', error);
        }
      }
    });

    // Sort by most recent first
    deals.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setSavedDeals(deals);
  };

  const loadDeal = (savedDeal: SavedDeal) => {
    // Clear current data first
    clearAllData();
    
    // Load the saved deal data
    setTimeout(() => {
      if (savedDeal.deal) updateDeal(savedDeal.deal);
      if (savedDeal.leaseDetails) updateLeaseDetails(savedDeal.leaseDetails);
      if (savedDeal.ancillaryIncome) updateAncillaryIncome(savedDeal.ancillaryIncome);
      if (savedDeal.utilityAnalysis) updateUtilityAnalysis(savedDeal.utilityAnalysis);
      
      // Add expense items
      if (savedDeal.expenseItems) {
        savedDeal.expenseItems.forEach(expense => addExpenseItem(expense));
      }
      
      // Add machines
      if (savedDeal.machineInventory) {
        savedDeal.machineInventory.forEach(machine => addMachine(machine));
      }
    }, 100);
  };

  const deleteSavedDeal = (timestamp: string) => {
    localStorage.removeItem(`laundromat-deal-backup-${timestamp}`);
    loadSavedDeals();
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString() + ' ' + new Date(timestamp).toLocaleTimeString();
  };

  if (savedDeals.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground text-center">No saved deals found. Use "New Deal Analysis" button to save current deals.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Previously Saved Deals ({savedDeals.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {savedDeals.map((savedDeal, index) => (
          <div key={savedDeal.timestamp} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex-1">
              <div className="font-medium">{savedDeal.deal?.dealName || 'Unnamed Deal'}</div>
              <div className="text-sm text-muted-foreground">{savedDeal.deal?.propertyAddress || 'No address'}</div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  <Calendar className="h-3 w-3 mr-1" />
                  {formatDate(savedDeal.timestamp)}
                </Badge>
                {savedDeal.deal?.askingPrice && (
                 <Badge variant="secondary" className="text-xs">
                   {formatCurrency(savedDeal.deal.askingPrice)}
                 </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => loadDeal(savedDeal)}
                className="bg-success hover:bg-success/90"
              >
                Load Deal
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Saved Deal</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to permanently delete "{savedDeal.deal?.dealName || 'Unnamed Deal'}"? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => deleteSavedDeal(savedDeal.timestamp)}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
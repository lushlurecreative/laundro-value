import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Deal, LeaseDetails, ExpenseItem, MachineInventory, AncillaryIncome, UtilityAnalysis } from '@/types/deal';
import { useToast } from '@/hooks/use-toast';

interface SavedDeal {
  id: string;
  deal_name: string;
  deal_data: any; // Use any to handle database Json type
  created_at: string;
  updated_at: string;
}

export const useDealPersistence = () => {
  const [savedDeals, setSavedDeals] = useState<SavedDeal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const loadSavedDeals = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // If not authenticated, try to load from localStorage
        const localDeals = localStorage.getItem('localSavedDeals');
        if (localDeals) {
          setSavedDeals(JSON.parse(localDeals));
        }
        return;
      }

      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      setSavedDeals(data || []);
    } catch (error) {
      console.error('Error loading saved deals:', error);
      toast({
        title: "Error loading deals",
        description: "Failed to load your saved deals. They may still be available locally.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveDeal = async (
    dealName: string,
    deal: Deal,
    leaseDetails: LeaseDetails | null,
    expenseItems: ExpenseItem[],
    machineInventory: MachineInventory[],
    ancillaryIncome: AncillaryIncome | null,
    utilityAnalysis: UtilityAnalysis | null
  ) => {
    try {
      setIsLoading(true);
      const dealData = {
        deal,
        leaseDetails,
        expenseItems,
        machineInventory,
        ancillaryIncome,
        utilityAnalysis,
      };

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // Save to localStorage if not authenticated
        const localDeals = JSON.parse(localStorage.getItem('localSavedDeals') || '[]');
        const newDeal = {
          id: `local-${Date.now()}`,
          deal_name: dealName,
          deal_data: dealData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        localDeals.push(newDeal);
        localStorage.setItem('localSavedDeals', JSON.stringify(localDeals));
        setSavedDeals(localDeals);
        
        toast({
          title: "Deal saved locally",
          description: "Your deal has been saved to your browser. Sign in to save to the cloud.",
        });
        return;
      }

      const { error } = await supabase
        .from('deals')
        .insert({
          user_id: user.id,
          deal_name: dealName,
          deal_data: dealData as any, // Cast to any for Json compatibility
        });

      if (error) throw error;

      await loadSavedDeals();
      
      toast({
        title: "Deal saved",
        description: "Your deal has been saved successfully.",
      });
    } catch (error) {
      console.error('Error saving deal:', error);
      toast({
        title: "Error saving deal",
        description: "Failed to save your deal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteDeal = async (dealId: string) => {
    try {
      setIsLoading(true);
      
      if (dealId.startsWith('local-')) {
        // Delete from localStorage
        const localDeals = JSON.parse(localStorage.getItem('localSavedDeals') || '[]');
        const updatedDeals = localDeals.filter((deal: SavedDeal) => deal.id !== dealId);
        localStorage.setItem('localSavedDeals', JSON.stringify(updatedDeals));
        setSavedDeals(updatedDeals);
        
        toast({
          title: "Deal deleted",
          description: "Your deal has been deleted from local storage.",
        });
        return;
      }

      const { error } = await supabase
        .from('deals')
        .delete()
        .eq('id', dealId);

      if (error) throw error;

      await loadSavedDeals();
      
      toast({
        title: "Deal deleted",
        description: "Your deal has been deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting deal:', error);
      toast({
        title: "Error deleting deal",
        description: "Failed to delete your deal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSavedDeals();
  }, []);

  return {
    savedDeals,
    isLoading,
    saveDeal,
    deleteDeal,
    loadSavedDeals,
  };
};
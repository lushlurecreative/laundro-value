import { useState, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useDeal } from "@/contexts/useDeal";

export const useAIAnalysis = () => {
  const { user } = useAuth();
  const { deal, leaseDetails, expenseItems, machineInventory } = useDeal();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);

  const runComprehensiveAnalysis = useCallback(async () => {
    if (!deal || !user) {
      throw new Error('Deal data and user authentication required');
    }

    setIsAnalyzing(true);

    try {
      // Prepare deal data for analysis - get additional data from context
      const dealData = {
        askingPrice: deal.askingPrice,
        grossIncomeAnnual: deal.grossIncomeAnnual,
        annualNet: deal.annualNet,
        facilitySizeSqft: deal.facilitySizeSqft,
        propertyAddress: deal.propertyAddress,
        lease: leaseDetails,
        expenses: expenseItems,
        equipment: null, // Will be derived from machineInventory
        machineInventory: machineInventory
      };

      const dealId = deal.dealId || `deal-${Date.now()}`;

      console.log('🔍 Running comprehensive AI analysis for deal:', dealId);

      const response = await supabase.functions.invoke('comprehensive-ai-analyzer', {
        body: {
          dealData,
          dealId,
          userId: user.id
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      setAnalysisResults(response.data.analysis);
      return response.data.analysis;

    } catch (error) {
      console.error('Error running AI analysis:', error);
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  }, [deal, user, leaseDetails, expenseItems, machineInventory]);

  const getAnalysisForDeal = useCallback(async (dealId: string) => {
    if (!user) return null;

    try {
      const { data: dealAnalysis } = await supabase
        .from('deal_analysis')
        .select('*')
        .eq('deal_id', dealId)
        .eq('user_id', user.id)
        .single();

      const { data: recommendations } = await supabase
        .from('ai_recommendations')
        .select('*')
        .eq('deal_id', dealId)
        .eq('user_id', user.id)
        .order('priority');

      const { data: riskAssessment } = await supabase
        .from('risk_assessments')
        .select('*')
        .eq('deal_id', dealId)
        .eq('user_id', user.id)
        .single();

      return {
        dealAnalysis,
        recommendations: recommendations || [],
        riskAssessment
      };

    } catch (error) {
      console.error('Error fetching analysis:', error);
      return null;
    }
  }, [user]);

  const validateExpense = useCallback(async (expenseName: string, amount: number, grossIncome: number) => {
    try {
      const response = await supabase.functions.invoke('comprehensive-ai-analyzer', {
        body: {
          action: 'validate_expense',
          expenseName,
          amount,
          grossIncome
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error validating expense:', error);
      return null;
    }
  }, []);

  const getMarketInsights = useCallback(async (address: string) => {
    try {
      const locationKey = address.toLowerCase().replace(/\s+/g, '-');
      
      const { data: marketData } = await supabase
        .from('market_data')
        .select('*')
        .eq('location_key', locationKey)
        .single();

      return marketData;
    } catch (error) {
      console.error('Error fetching market insights:', error);
      return null;
    }
  }, []);

  const getRevenueOptimization = useCallback(async (dealId: string) => {
    if (!user) return null;

    try {
      const { data } = await supabase
        .from('revenue_projections')
        .select('*')
        .eq('deal_id', dealId)
        .eq('user_id', user.id)
        .single();

      return data;
    } catch (error) {
      console.error('Error fetching revenue optimization:', error);
      return null;
    }
  }, [user]);

  const updateRecommendationStatus = useCallback(async (recommendationId: string, status: 'implemented' | 'rejected' | 'pending') => {
    try {
      const { error } = await supabase
        .from('ai_recommendations')
        .update({ status })
        .eq('id', recommendationId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating recommendation status:', error);
      return false;
    }
  }, []);

  return {
    isAnalyzing,
    analysisResults,
    runComprehensiveAnalysis,
    getAnalysisForDeal,
    validateExpense,
    getMarketInsights,
    getRevenueOptimization,
    updateRecommendationStatus
  };
};
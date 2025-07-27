import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface SubscriptionPlan {
  id: string;
  plan_id: string;
  name: string;
  description: string | null;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  limits: Record<string, any>;
  is_active: boolean;
}

export interface UserSubscription {
  subscribed: boolean;
  subscription_tier: string;
  subscription_end: string | null;
  stripe_customer_id: string | null;
}

export interface UserRole {
  role: 'free' | 'basic' | 'professional' | 'enterprise' | 'admin';
}

export interface UsageStats {
  analyses_this_month: number;
  reports_this_month: number;
  saved_deals: number;
}

interface SubscriptionContextType {
  subscription: UserSubscription | null;
  role: UserRole | null;
  plans: SubscriptionPlan[];
  usage: UsageStats | null;
  loading: boolean;
  refreshSubscription: () => Promise<void>;
  createCheckoutSession: (planId: string, billingCycle?: 'monthly' | 'yearly') => Promise<any>;
  openCustomerPortal: () => Promise<any>;
  trackUsage: (actionType: string, resourceId?: string, metadata?: any) => Promise<void>;
  canPerformAction: (action: string) => boolean;
  getUsageLimit: (limitType: string) => number;
  getRemainingUsage: (limitType: string) => number;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSubscriptionPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price_monthly', { ascending: true });
      
      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedPlans: SubscriptionPlan[] = (data || []).map(plan => ({
        id: plan.id,
        plan_id: plan.plan_id,
        name: plan.name,
        description: plan.description,
        price_monthly: plan.price_monthly || 0,
        price_yearly: plan.price_yearly || 0,
        features: Array.isArray(plan.features) 
          ? (plan.features as any[]).filter(f => typeof f === 'string')
          : [],
        limits: typeof plan.limits === 'object' && plan.limits !== null 
          ? plan.limits as Record<string, any> 
          : {},
        is_active: plan.is_active
      }));
      
      setPlans(transformedPlans);
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
    }
  };

  const fetchUserSubscription = async () => {
    if (!user) return;
    
    try {
      // First sync with Stripe to get latest subscription data
      const { data: syncData, error: syncError } = await supabase.functions.invoke('check-subscription');
      
      if (syncError) {
        console.error('Error syncing subscription:', syncError);
      }
      
      // Then fetch the updated subscription data
      const { data, error } = await supabase
        .from('subscribers')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
      
      setSubscription(data || {
        subscribed: false,
        subscription_tier: 'free',
        subscription_end: null,
        stripe_customer_id: null
      });
    } catch (error) {
      console.error('Error fetching user subscription:', error);
    }
  };

  const fetchUserRole = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      setRole(data || { role: 'free' });
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  const fetchUsageStats = async () => {
    if (!user) return;
    
    try {
      const currentMonth = new Date();
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      
      // Get usage counts for current month
      const { data: usageData, error: usageError } = await supabase
        .from('usage_tracking')
        .select('action_type')
        .eq('user_id', user.id)
        .gte('created_at', startOfMonth.toISOString());
      
      if (usageError) throw usageError;
      
      const analyses = usageData?.filter(u => u.action_type === 'analysis_created').length || 0;
      const reports = usageData?.filter(u => u.action_type === 'report_generated').length || 0;
      
      // Get total saved deals (not time-limited)
      const { data: dealsData, error: dealsError } = await supabase
        .from('usage_tracking')
        .select('action_type')
        .eq('user_id', user.id)
        .eq('action_type', 'deal_saved');
      
      if (dealsError) throw dealsError;
      
      const savedDeals = dealsData?.length || 0;
      
      setUsage({
        analyses_this_month: analyses,
        reports_this_month: reports,
        saved_deals: savedDeals
      });
    } catch (error) {
      console.error('Error fetching usage stats:', error);
    }
  };

  const refreshSubscription = async () => {
    setLoading(true);
    await Promise.all([
      fetchUserSubscription(),
      fetchUserRole(),
      fetchUsageStats(),
    ]);
    setLoading(false);
  };

  const trackUsage = async (actionType: string, resourceId?: string, metadata?: any) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('usage_tracking')
        .insert({
          user_id: user.id,
          action_type: actionType,
          resource_id: resourceId,
          metadata: metadata
        });
      
      if (error) throw error;
      
      // Refresh usage stats after tracking
      await fetchUsageStats();
    } catch (error) {
      console.error('Error tracking usage:', error);
    }
  };

  const getUsageLimit = (limitType: string): number => {
    if (!subscription || !plans.length) return 0;
    
    const currentPlan = plans.find(p => p.plan_id === subscription.subscription_tier);
    if (!currentPlan) return 0;
    
    const limit = currentPlan.limits[limitType];
    return limit === -1 ? Infinity : (limit || 0);
  };

  const getRemainingUsage = (limitType: string): number => {
    if (!usage) return 0;
    
    const limit = getUsageLimit(limitType);
    if (limit === Infinity) return Infinity;
    
    let used = 0;
    switch (limitType) {
      case 'analyses_per_month':
        used = usage.analyses_this_month;
        break;
      case 'reports_per_month':
        used = usage.reports_this_month;
        break;
      case 'saved_deals':
        used = usage.saved_deals;
        break;
    }
    
    return Math.max(0, limit - used);
  };

  const canPerformAction = (action: string): boolean => {
    // Enable all actions for testing during development
    return true;
    
    // Original logic (commented out for testing):
    // if (!subscription || !usage) return false;
    // 
    // switch (action) {
    //   case 'create_analysis':
    //     return getRemainingUsage('analyses_per_month') > 0;
    //   case 'generate_report':
    //     return getRemainingUsage('reports_per_month') > 0;
    //   case 'save_deal':
    //     return getRemainingUsage('saved_deals') > 0;
    //   case 'export_pdf':
    //     return subscription.subscription_tier !== 'free';
    //   case 'access_market_data':
    //     return ['professional', 'enterprise'].includes(subscription.subscription_tier);
    //   default:
    //     return true;
    // }
  };

  useEffect(() => {
    fetchSubscriptionPlans();
  }, []);

  useEffect(() => {
    if (user) {
      refreshSubscription();
    } else {
      setSubscription(null);
      setRole(null);
      setUsage(null);
      setLoading(false);
    }
  }, [user]);

  const createCheckoutSession = async (planId: string, billingCycle: 'monthly' | 'yearly' = 'monthly') => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan_id: planId, billing_cycle: billingCycle }
      });
      
      if (error) throw error;
      
      // Open Stripe checkout in a new tab
      if (data?.url) {
        window.open(data.url, '_blank');
        // Refresh subscription after a delay to check for updates
        setTimeout(() => {
          refreshSubscription();
        }, 2000);
      }
      
      return data;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  };

  const openCustomerPortal = async () => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      
      // Open customer portal in a new tab
      if (data?.url) {
        window.open(data.url, '_blank');
      }
      
      return data;
    } catch (error) {
      console.error('Error opening customer portal:', error);
      throw error;
    }
  };

  const value: SubscriptionContextType = {
    subscription,
    role,
    plans,
    usage,
    loading,
    refreshSubscription,
    createCheckoutSession,
    openCustomerPortal,
    trackUsage,
    canPerformAction,
    getUsageLimit,
    getRemainingUsage
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};
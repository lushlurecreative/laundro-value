import React, { useState } from 'react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Crown, Zap, Calendar, TrendingUp, Settings, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import SubscriptionPlans from './SubscriptionPlans';

const SubscriptionDashboard: React.FC = () => {
  const { 
    subscription, 
    plans, 
    usage, 
    loading,
    refreshSubscription,
    getUsageLimit,
    getRemainingUsage,
    createCheckoutSession,
    openCustomerPortal
  } = useSubscription();
  
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showPlans, setShowPlans] = useState(false);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-8 bg-muted rounded"></div>
            <div className="h-20 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentPlan = plans.find(p => p.plan_id === subscription?.subscription_tier);
  const isPremium = subscription?.subscription_tier !== 'free';

  const handleUpgrade = async (planId: string) => {
    try {
      setCheckoutLoading(planId);
      await createCheckoutSession(planId, 'monthly');
      toast({
        title: "Redirecting to checkout",
        description: "You'll be redirected to Stripe to complete your subscription.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create checkout session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    try {
      await openCustomerPortal();
      toast({
        title: "Opening customer portal",
        description: "You'll be redirected to manage your subscription.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to open customer portal. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await refreshSubscription();
      toast({
        title: "Subscription refreshed",
        description: "Your subscription status has been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  if (showPlans) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Subscription Plans</h1>
          <Button variant="outline" onClick={() => setShowPlans(false)}>
            Back to Dashboard
          </Button>
        </div>
        <SubscriptionPlans showCurrentPlan={true} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Subscription Management</h1>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setShowPlans(true)}>
            View All Plans
          </Button>
        </div>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isPremium ? <Crown className="h-5 w-5 text-yellow-500" /> : <Zap className="h-5 w-5" />}
            Current Plan: {currentPlan?.name || 'Free'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Badge variant={isPremium ? "default" : "secondary"}>
                {subscription?.subscription_tier?.toUpperCase()}
              </Badge>
              {subscription?.subscription_end && (
                <p className="text-sm text-muted-foreground mt-1">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Renews: {new Date(subscription.subscription_end).toLocaleDateString()}
                </p>
              )}
            </div>
            <div className="flex items-center gap-4">
              {isPremium && (
                <Button variant="outline" size="sm" onClick={handleManageSubscription}>
                  <Settings className="h-4 w-4 mr-2" />
                  Manage
                </Button>
              )}
              <div className="text-right">
                {currentPlan && (
                  <div>
                    <p className="text-2xl font-bold">
                      ${(currentPlan.price_monthly / 100).toFixed(0)}
                      <span className="text-sm text-muted-foreground">/mo</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {currentPlan?.description && (
            <p className="text-sm text-muted-foreground">{currentPlan.description}</p>
          )}

          {!isPremium && (
            <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg dark:border-yellow-800 dark:bg-yellow-900/20">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-200">
                    Upgrade for Advanced Features
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    Get unlimited AI analysis, advanced market insights, PDF exports, and more with a premium plan.
                  </p>
                  <Button 
                    size="sm" 
                    className="mt-3"
                    onClick={() => setShowPlans(true)}
                  >
                    View Plans
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Usage This Month
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Analyses */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Deal Analyses</span>
              <span>
                {usage?.analyses_this_month || 0} / {
                  getUsageLimit('analyses_per_month') === Infinity 
                    ? '∞' 
                    : getUsageLimit('analyses_per_month')
                }
              </span>
            </div>
            {getUsageLimit('analyses_per_month') !== Infinity && (
              <Progress
                value={((usage?.analyses_this_month || 0) / getUsageLimit('analyses_per_month')) * 100}
                className="h-2"
              />
            )}
          </div>

          {/* Reports */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Reports Generated</span>
              <span>
                {usage?.reports_this_month || 0} / {
                  getUsageLimit('reports_per_month') === Infinity 
                    ? '∞' 
                    : getUsageLimit('reports_per_month')
                }
              </span>
            </div>
            {getUsageLimit('reports_per_month') !== Infinity && (
              <Progress
                value={((usage?.reports_this_month || 0) / getUsageLimit('reports_per_month')) * 100}
                className="h-2"
              />
            )}
          </div>

          {/* Saved Deals */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Saved Deals</span>
              <span>
                {usage?.saved_deals || 0} / {
                  getUsageLimit('saved_deals') === Infinity 
                    ? '∞' 
                    : getUsageLimit('saved_deals')
                }
              </span>
            </div>
            {getUsageLimit('saved_deals') !== Infinity && (
              <Progress
                value={((usage?.saved_deals || 0) / getUsageLimit('saved_deals')) * 100}
                className="h-2"
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Upgrade Options */}
      {!isPremium && (
        <Card>
          <CardHeader>
            <CardTitle>Upgrade Your Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {plans.filter(p => p.plan_id !== 'free').slice(0, 2).map((plan) => (
                <div
                  key={plan.id}
                  className="p-4 border rounded-lg hover:border-primary transition-colors"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{plan.name}</h3>
                      {plan.plan_id === 'professional' && (
                        <Badge>Popular</Badge>
                      )}
                    </div>
                    <div className="text-2xl font-bold">
                      ${(plan.price_monthly / 100).toFixed(0)}
                      <span className="text-sm text-muted-foreground">/mo</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                    
                    <Button
                      variant={plan.plan_id === 'professional' ? 'default' : 'outline'}
                      size="sm"
                      className="w-full"
                      disabled={checkoutLoading === plan.plan_id}
                      onClick={() => handleUpgrade(plan.plan_id)}
                    >
                      {checkoutLoading === plan.plan_id ? 'Processing...' : 'Upgrade'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 text-center">
              <Button variant="outline" onClick={() => setShowPlans(true)}>
                View All Plans & Features
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SubscriptionDashboard;
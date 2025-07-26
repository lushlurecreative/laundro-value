import React, { useState } from 'react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Crown, Zap, Calendar, TrendingUp, Settings } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const SubscriptionDashboard: React.FC = () => {
  const { 
    subscription, 
    plans, 
    usage, 
    loading,
    getUsageLimit,
    getRemainingUsage,
    createCheckoutSession,
    openCustomerPortal
  } = useSubscription();
  
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

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

  return (
    <div className="space-y-6">
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

      {/* Available Plans */}
      <Card>
        <CardHeader>
          <CardTitle>Available Plans</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {plans.map((plan) => {
              const isCurrent = plan.plan_id === subscription?.subscription_tier;
              
              return (
                <div
                  key={plan.id}
                  className={`p-4 border rounded-lg ${
                    isCurrent ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                >
                  <div className="text-center space-y-2">
                    <h3 className="font-semibold">{plan.name}</h3>
                    <div className="text-2xl font-bold">
                      ${(plan.price_monthly / 100).toFixed(0)}
                      <span className="text-sm text-muted-foreground">/mo</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                    
                    <div className="text-left space-y-1 mt-4">
                      {plan.features.slice(0, 3).map((feature, idx) => (
                        <p key={idx} className="text-xs text-muted-foreground">
                          ✓ {feature}
                        </p>
                      ))}
                    </div>
                    
                    <Button
                      variant={isCurrent ? "secondary" : "default"}
                      size="sm"
                      className="w-full mt-4"
                      disabled={isCurrent || checkoutLoading === plan.plan_id}
                      onClick={() => !isCurrent && handleUpgrade(plan.plan_id)}
                    >
                      {checkoutLoading === plan.plan_id 
                        ? 'Processing...' 
                        : isCurrent 
                          ? 'Current Plan' 
                          : 'Upgrade'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionDashboard;
import React, { useState } from 'react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Crown, Star, Zap, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface SubscriptionPlansProps {
  showCurrentPlan?: boolean;
  onPlanSelected?: (planId: string) => void;
}

export const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({ 
  showCurrentPlan = true,
  onPlanSelected 
}) => {
  const { 
    subscription, 
    plans, 
    loading,
    createCheckoutSession
  } = useSubscription();
  
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const handleSelectPlan = async (planId: string) => {
    if (onPlanSelected) {
      onPlanSelected(planId);
      return;
    }

    try {
      setCheckoutLoading(planId);
      await createCheckoutSession(planId, billingCycle);
      toast({
        title: "Redirecting to checkout",
        description: "You'll be redirected to complete your subscription.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start checkout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCheckoutLoading(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getPrice = (plan: any) => {
    return billingCycle === 'yearly' ? plan.price_yearly : plan.price_monthly;
  };

  const getIconForPlan = (planId: string) => {
    switch (planId) {
      case 'free':
        return <Zap className="h-6 w-6" />;
      case 'basic':
      case 'professional':
        return <Star className="h-6 w-6" />;
      case 'enterprise':
        return <Crown className="h-6 w-6" />;
      default:
        return <Zap className="h-6 w-6" />;
    }
  };

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case 'professional':
        return 'border-primary';
      case 'enterprise':
        return 'border-yellow-500';
      default:
        return 'border-border';
    }
  };

  const isMostPopular = (planId: string) => planId === 'professional';

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">Choose Your Plan</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Unlock powerful features for comprehensive laundromat investment analysis. 
          Start with our free tier or upgrade for advanced capabilities.
        </p>
        
        {/* Billing Cycle Toggle */}
        <div className="flex items-center justify-center gap-4 p-1 bg-muted rounded-lg w-fit mx-auto">
          <Button
            variant={billingCycle === 'monthly' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setBillingCycle('monthly')}
          >
            Monthly
          </Button>
          <Button
            variant={billingCycle === 'yearly' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setBillingCycle('yearly')}
            className="relative"
          >
            Yearly
            <Badge variant="secondary" className="ml-2 text-xs">
              Save 20%
            </Badge>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 max-w-6xl mx-auto">
        {plans.map((plan) => {
          const price = getPrice(plan);
          const isCurrentPlan = showCurrentPlan && plan.plan_id === subscription?.subscription_tier;
          const isPopular = isMostPopular(plan.plan_id);
          
          return (
            <Card 
              key={plan.id} 
              className={`relative ${getPlanColor(plan.plan_id)} ${
                isPopular ? 'ring-2 ring-primary' : ''
              }`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center space-y-2">
                <div className="mx-auto p-3 bg-gradient-subtle rounded-full w-fit">
                  {getIconForPlan(plan.plan_id)}
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="space-y-1">
                  <div className="text-3xl font-bold">
                    ${(price / 100).toFixed(0)}
                    <span className="text-lg text-muted-foreground">
                      /{billingCycle === 'yearly' ? 'year' : 'month'}
                    </span>
                  </div>
                  {billingCycle === 'yearly' && plan.price_monthly > 0 && (
                    <p className="text-sm text-muted-foreground">
                      <span className="line-through">
                        ${((plan.price_monthly * 12) / 100).toFixed(0)}/year
                      </span>
                      {' '}Save 20%
                    </p>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Button
                  variant={isCurrentPlan ? "secondary" : isPopular ? "default" : "outline"}
                  size="lg"
                  className="w-full"
                  disabled={isCurrentPlan || checkoutLoading === plan.plan_id}
                  onClick={() => handleSelectPlan(plan.plan_id)}
                >
                  {checkoutLoading === plan.plan_id ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : isCurrentPlan ? (
                    'Current Plan'
                  ) : plan.plan_id === 'free' ? (
                    'Get Started'
                  ) : (
                    'Upgrade Now'
                  )}
                </Button>
                
                {isCurrentPlan && (
                  <div className="text-center">
                    <Badge variant="outline" className="text-xs">
                      ✓ Active Plan
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      <div className="text-center space-y-4 max-w-4xl mx-auto">
        <div className="grid gap-4 md:grid-cols-3 text-sm text-muted-foreground">
          <div className="space-y-2">
            <h4 className="font-medium text-foreground">✓ All Plans Include</h4>
            <ul className="space-y-1">
              <li>Deal input & basic analysis</li>
              <li>Financial calculations</li>
              <li>Projection modeling</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-foreground">✓ Professional & Above</h4>
            <ul className="space-y-1">
              <li>Unlimited AI analysis</li>
              <li>Advanced market insights</li>
              <li>PDF report exports</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-foreground">✓ Enterprise Features</h4>
            <ul className="space-y-1">
              <li>Priority support</li>
              <li>Custom integrations</li>
              <li>White-label options</li>
            </ul>
          </div>
        </div>
        
        <p className="text-xs text-muted-foreground">
          All plans include a 14-day free trial. Cancel anytime. No setup fees.
        </p>
      </div>
    </div>
  );
};

export default SubscriptionPlans;
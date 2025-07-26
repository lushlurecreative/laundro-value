-- Create subscribers table to track subscription information
CREATE TABLE public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  subscribed BOOLEAN NOT NULL DEFAULT false,
  subscription_tier TEXT,
  subscription_id TEXT,
  subscription_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Create policies for subscribers table
CREATE POLICY "Users can view their own subscription" 
ON public.subscribers 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own subscription" 
ON public.subscribers 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Edge functions can insert subscriptions" 
ON public.subscribers 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Edge functions can update subscriptions" 
ON public.subscribers 
FOR UPDATE 
USING (true);

-- Create user roles enum
CREATE TYPE public.user_role AS ENUM ('free', 'basic', 'professional', 'enterprise', 'admin');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'free',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create policies for user_roles
CREATE POLICY "Users can view their own role" 
ON public.user_roles 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Edge functions can insert user roles" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Edge functions can update user roles" 
ON public.user_roles 
FOR UPDATE 
USING (true);

-- Create usage tracking table
CREATE TABLE public.usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- 'analysis_created', 'report_generated', 'deal_saved', etc.
  resource_id UUID, -- Reference to deal, report, etc.
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on usage_tracking
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;

-- Create policies for usage_tracking
CREATE POLICY "Users can view their own usage" 
ON public.usage_tracking 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own usage" 
ON public.usage_tracking 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Edge functions can insert usage tracking" 
ON public.usage_tracking 
FOR INSERT 
WITH CHECK (true);

-- Create subscription plans table
CREATE TABLE public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  price_monthly INTEGER, -- in cents
  price_yearly INTEGER, -- in cents
  features JSONB NOT NULL DEFAULT '[]',
  limits JSONB NOT NULL DEFAULT '{}', -- e.g., {"analyses_per_month": 10, "reports_per_month": 5}
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on subscription_plans (public read access)
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access to plans
CREATE POLICY "Anyone can view active subscription plans" 
ON public.subscription_plans 
FOR SELECT 
USING (is_active = true);

-- Insert default subscription plans
INSERT INTO public.subscription_plans (plan_id, name, description, price_monthly, price_yearly, features, limits) VALUES
('free', 'Free', 'Get started with basic analysis tools', 0, 0, 
 '["Basic deal analysis", "2 analyses per month", "Standard reports"]',
 '{"analyses_per_month": 2, "reports_per_month": 2, "saved_deals": 3}'
),
('professional', 'Professional', 'Advanced analysis for serious investors', 2999, 29988, 
 '["Unlimited analyses", "Advanced AI insights", "PDF reports", "Market data integration", "Priority support"]',
 '{"analyses_per_month": -1, "reports_per_month": -1, "saved_deals": -1, "pdf_exports": true, "market_data": true}'
),
('enterprise', 'Enterprise', 'Complete solution for investment firms', 9999, 99988,
 '["Everything in Professional", "White-label options", "API access", "Custom integrations", "Dedicated support"]',
 '{"analyses_per_month": -1, "reports_per_month": -1, "saved_deals": -1, "pdf_exports": true, "market_data": true, "white_label": true, "api_access": true}'
);

-- Create security definer function to check user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role AS $$
  SELECT COALESCE(
    (SELECT role FROM public.user_roles WHERE user_id = auth.uid()),
    'free'::user_role
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create security definer function to check subscription status
CREATE OR REPLACE FUNCTION public.get_current_user_subscription()
RETURNS RECORD AS $$
  SELECT 
    COALESCE(s.subscribed, false) as subscribed,
    COALESCE(s.subscription_tier, 'free') as tier,
    s.subscription_end
  FROM public.subscribers s 
  WHERE s.user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create function to handle new user subscription setup
CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert default role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'free');
  
  -- Insert default subscription record
  INSERT INTO public.subscribers (user_id, email, subscribed, subscription_tier)
  VALUES (NEW.id, NEW.email, false, 'free');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to set up subscription data for new users
CREATE TRIGGER on_auth_user_created_subscription
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_subscription();

-- Add timestamps trigger to all new tables
CREATE TRIGGER update_subscribers_updated_at
BEFORE UPDATE ON public.subscribers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_roles_updated_at
BEFORE UPDATE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscription_plans_updated_at
BEFORE UPDATE ON public.subscription_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
-- Create comprehensive AI analysis tables

-- Table for storing comprehensive deal analysis results
CREATE TABLE public.deal_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id TEXT NOT NULL,
  user_id UUID,
  overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
  market_score INTEGER CHECK (market_score >= 0 AND market_score <= 100),
  financial_score INTEGER CHECK (financial_score >= 0 AND financial_score <= 100),
  risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
  recommendation TEXT,
  key_insights JSONB,
  red_flags TEXT[],
  opportunities TEXT[],
  analysis_summary TEXT,
  confidence_level INTEGER CHECK (confidence_level >= 0 AND confidence_level <= 100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for market analysis data
CREATE TABLE public.market_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  location_key TEXT NOT NULL UNIQUE, -- Address hash or similar
  address TEXT NOT NULL,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  population_data JSONB,
  income_data JSONB,
  competition_data JSONB,
  market_trends JSONB,
  rent_analysis JSONB,
  demographic_score INTEGER CHECK (demographic_score >= 0 AND demographic_score <= 100),
  competition_score INTEGER CHECK (competition_score >= 0 AND competition_score <= 100),
  market_opportunity_score INTEGER CHECK (market_opportunity_score >= 0 AND market_opportunity_score <= 100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for expense validation results
CREATE TABLE public.expense_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id TEXT NOT NULL,
  user_id UUID,
  expense_name TEXT NOT NULL,
  reported_amount DECIMAL(15,2),
  market_average DECIMAL(15,2),
  variance_percentage DECIMAL(5,2),
  is_reasonable BOOLEAN,
  validation_notes TEXT,
  suggestions TEXT[],
  confidence_level INTEGER CHECK (confidence_level >= 0 AND confidence_level <= 100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for revenue projections and optimization
CREATE TABLE public.revenue_projections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id TEXT NOT NULL,
  user_id UUID,
  current_revenue DECIMAL(15,2),
  projected_revenue DECIMAL(15,2),
  optimization_opportunities JSONB,
  pricing_recommendations JSONB,
  equipment_recommendations JSONB,
  service_recommendations JSONB,
  timeline_months INTEGER,
  confidence_level INTEGER CHECK (confidence_level >= 0 AND confidence_level <= 100),
  roi_projection DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for risk assessments
CREATE TABLE public.risk_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id TEXT NOT NULL,
  user_id UUID,
  overall_risk_score INTEGER CHECK (overall_risk_score >= 0 AND overall_risk_score <= 100),
  financial_risk_score INTEGER CHECK (financial_risk_score >= 0 AND financial_risk_score <= 100),
  market_risk_score INTEGER CHECK (market_risk_score >= 0 AND market_risk_score <= 100),
  operational_risk_score INTEGER CHECK (operational_risk_score >= 0 AND operational_risk_score <= 100),
  risk_factors JSONB,
  mitigation_strategies JSONB,
  success_probability DECIMAL(5,2),
  break_even_analysis JSONB,
  exit_strategy_projection JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for AI recommendations
CREATE TABLE public.ai_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id TEXT NOT NULL,
  user_id UUID,
  category TEXT NOT NULL, -- 'financing', 'negotiation', 'operation', 'exit'
  priority INTEGER CHECK (priority >= 1 AND priority <= 5),
  title TEXT NOT NULL,
  description TEXT,
  impact_score INTEGER CHECK (impact_score >= 0 AND impact_score <= 100),
  implementation_difficulty INTEGER CHECK (implementation_difficulty >= 1 AND implementation_difficulty <= 5),
  estimated_benefit DECIMAL(15,2),
  timeframe TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'implemented', 'rejected'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.deal_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_projections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_recommendations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for deal_analysis
CREATE POLICY "Users can view their own deal analysis" 
ON public.deal_analysis 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own deal analysis" 
ON public.deal_analysis 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own deal analysis" 
ON public.deal_analysis 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create RLS policies for market_data (publicly readable but only system can insert)
CREATE POLICY "Market data is publicly readable" 
ON public.market_data 
FOR SELECT 
USING (true);

CREATE POLICY "System can manage market data" 
ON public.market_data 
FOR ALL 
USING (auth.uid() IS NULL); -- Allow system/edge functions to manage

-- Create RLS policies for expense_analysis
CREATE POLICY "Users can view their own expense analysis" 
ON public.expense_analysis 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own expense analysis" 
ON public.expense_analysis 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for revenue_projections
CREATE POLICY "Users can view their own revenue projections" 
ON public.revenue_projections 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own revenue projections" 
ON public.revenue_projections 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for risk_assessments
CREATE POLICY "Users can view their own risk assessments" 
ON public.risk_assessments 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own risk assessments" 
ON public.risk_assessments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for ai_recommendations
CREATE POLICY "Users can view their own recommendations" 
ON public.ai_recommendations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own recommendations" 
ON public.ai_recommendations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recommendations" 
ON public.ai_recommendations 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_deal_analysis_updated_at
  BEFORE UPDATE ON public.deal_analysis
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_market_data_updated_at
  BEFORE UPDATE ON public.market_data
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_deal_analysis_deal_id ON public.deal_analysis(deal_id);
CREATE INDEX idx_deal_analysis_user_id ON public.deal_analysis(user_id);
CREATE INDEX idx_market_data_location_key ON public.market_data(location_key);
CREATE INDEX idx_expense_analysis_deal_id ON public.expense_analysis(deal_id);
CREATE INDEX idx_revenue_projections_deal_id ON public.revenue_projections(deal_id);
CREATE INDEX idx_risk_assessments_deal_id ON public.risk_assessments(deal_id);
CREATE INDEX idx_ai_recommendations_deal_id ON public.ai_recommendations(deal_id);
CREATE INDEX idx_ai_recommendations_category ON public.ai_recommendations(category);
CREATE INDEX idx_ai_recommendations_priority ON public.ai_recommendations(priority);
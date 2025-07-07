import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface MarketData {
  demographics?: any;
  marketAnalysis?: any;
  energyAnalysis?: any;
  aiAnalysis?: string;
  loading: boolean;
  error?: string;
}

export const useMarketData = (propertyAddress: string) => {
  const [marketData, setMarketData] = useState<MarketData>({ loading: false });
  const { toast } = useToast();

  useEffect(() => {
    if (!propertyAddress || propertyAddress.length < 10) {
      setMarketData({ loading: false });
      return;
    }

    const fetchMarketData = async () => {
      setMarketData({ loading: true });
      
      try {
        // Extract ZIP code and state from address for demographics
        const zipMatch = propertyAddress.match(/\b\d{5}\b/);
        const stateMatch = propertyAddress.match(/\b([A-Z]{2})\b/);
        const zipCode = zipMatch ? zipMatch[0] : '';
        const state = stateMatch ? stateMatch[1] : '';

        // Run all API calls in parallel
        const [demographicsResult, marketResult, energyResult] = await Promise.allSettled([
          // Demographics analysis
          zipCode ? supabase.functions.invoke('demographics-analysis', {
            body: { zipCode, state }
          }) : Promise.resolve({ data: null }),
          
          // Market analysis
          supabase.functions.invoke('market-data', {
            body: { address: propertyAddress, type: 'laundromat' }
          }),
          
          // Energy analysis
          state ? supabase.functions.invoke('energy-analysis', {
            body: { state }
          }) : Promise.resolve({ data: null })
        ]);

        const newMarketData: MarketData = { loading: false };

        // Process demographics
        if (demographicsResult.status === 'fulfilled' && demographicsResult.value.data) {
          newMarketData.demographics = demographicsResult.value.data;
        }

        // Process market analysis
        if (marketResult.status === 'fulfilled' && marketResult.value.data) {
          newMarketData.marketAnalysis = marketResult.value.data;
        }

        // Process energy analysis
        if (energyResult.status === 'fulfilled' && energyResult.value.data) {
          newMarketData.energyAnalysis = energyResult.value.data;
        }

        setMarketData(newMarketData);

        // Show success toast only if we got some data
        if (newMarketData.demographics || newMarketData.marketAnalysis || newMarketData.energyAnalysis) {
          toast({
            title: "Market Analysis Complete",
            description: "Location data has been automatically analyzed and integrated",
          });
        }

      } catch (error) {
        console.error('Market data fetch error:', error);
        setMarketData({ 
          loading: false, 
          error: 'Failed to fetch market data' 
        });
      }
    };

    // Debounce the API calls - wait 2 seconds after user stops typing
    const timeoutId = setTimeout(fetchMarketData, 2000);
    return () => clearTimeout(timeoutId);
  }, [propertyAddress, toast]);

  return marketData;
};
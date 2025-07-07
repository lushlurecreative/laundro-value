import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, MapPin, TrendingUp, Building } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const MarketAnalysisPanel: React.FC = () => {
  const { toast } = useToast();
  const [address, setAddress] = useState('');
  const [marketData, setMarketData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const analyzeMarket = async () => {
    if (!address.trim()) {
      toast({
        title: "Address Required",
        description: "Please enter a property address",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('market-data', {
        body: {
          address: address,
          type: 'laundromat'
        }
      });

      if (error) throw error;

      setMarketData(data);
      toast({
        title: "Market Analysis Complete",
        description: "Market data has been retrieved successfully",
      });
    } catch (error) {
      console.error('Market analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to retrieve market data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Market Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Enter property address..."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="flex-1"
          />
          <Button
            onClick={analyzeMarket}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Analyze'
            )}
          </Button>
        </div>

        {marketData && (
          <div className="space-y-4">
            {marketData.rentalData && (
              <div className="p-4 bg-gradient-subtle rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4" />
                  <Badge variant="secondary">Rental Market Data</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Estimated Rent: ${marketData.rentalData.rent?.toLocaleString() || 'N/A'}</div>
                  <div>Rent Range: ${marketData.rentalData.rentRangeLow || 'N/A'} - ${marketData.rentalData.rentRangeHigh || 'N/A'}</div>
                </div>
              </div>
            )}

            {marketData.locationData && marketData.locationData.results?.[0] && (
              <div className="p-4 bg-gradient-subtle rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4" />
                  <Badge variant="secondary">Location Data</Badge>
                </div>
                <div className="text-sm">
                  <div>Rating: {marketData.locationData.results[0].rating || 'N/A'} ⭐</div>
                  <div>Price Level: {marketData.locationData.results[0].price_level || 'N/A'}</div>
                </div>
              </div>
            )}

            {marketData.competitorData && marketData.competitorData.local_results && (
              <div className="p-4 bg-gradient-subtle rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Building className="h-4 w-4" />
                  <Badge variant="secondary">Competitor Analysis</Badge>
                </div>
                <div className="text-sm">
                  <div>Nearby Laundromats: {marketData.competitorData.local_results.length}</div>
                  {marketData.competitorData.local_results.slice(0, 3).map((competitor: any, index: number) => (
                    <div key={index} className="mt-2 p-2 bg-white/50 rounded">
                      <div className="font-medium">{competitor.title}</div>
                      <div className="text-xs text-muted-foreground">
                        Rating: {competitor.rating || 'N/A'} | Reviews: {competitor.reviews || 'N/A'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
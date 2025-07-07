import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Zap, Flame } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const EnergyAnalysisPanel: React.FC = () => {
  const { toast } = useToast();
  const [state, setState] = useState('');
  const [energyData, setEnergyData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const analyzeEnergy = async () => {
    if (!state.trim()) {
      toast({
        title: "State Required",
        description: "Please enter a state code (e.g., CA, NY, TX)",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('energy-analysis', {
        body: {
          state: state.toUpperCase()
        }
      });

      if (error) throw error;

      setEnergyData(data);
      toast({
        title: "Energy Analysis Complete",
        description: "Energy cost data has been retrieved successfully",
      });
    } catch (error) {
      console.error('Energy analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to retrieve energy data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatEnergyData = (data: any) => {
    if (!data?.response?.data) return null;
    
    const latestData = data.response.data.find((item: any) => 
      item.sectorName === 'commercial' || item.sectorName === 'Commercial'
    );
    
    return latestData;
  };

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Energy Cost Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Enter state code (e.g., CA, NY, TX)..."
            value={state}
            onChange={(e) => setState(e.target.value.toUpperCase())}
            maxLength={2}
            className="flex-1"
          />
          <Button
            onClick={analyzeEnergy}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Analyze'
            )}
          </Button>
        </div>

        {energyData && (
          <div className="space-y-4">
            {energyData.electricityRates && (
              <div className="p-4 bg-gradient-subtle rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4" />
                  <Badge variant="secondary">Electricity Rates</Badge>
                </div>
                <div className="text-sm">
                  {formatEnergyData(energyData.electricityRates) ? (
                    <div className="space-y-1">
                      <div>Commercial Rate: {formatEnergyData(energyData.electricityRates)?.price?.toFixed(2) || 'N/A'} ¢/kWh</div>
                      <div>Period: {formatEnergyData(energyData.electricityRates)?.period || 'N/A'}</div>
                    </div>
                  ) : (
                    <div>Energy rate data available for {state}</div>
                  )}
                </div>
              </div>
            )}

            {energyData.gasRates && (
              <div className="p-4 bg-gradient-subtle rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Flame className="h-4 w-4" />
                  <Badge variant="secondary">Natural Gas Rates</Badge>
                </div>
                <div className="text-sm">
                  {energyData.gasRates.response?.data?.[0] ? (
                    <div className="space-y-1">
                      <div>Price: ${energyData.gasRates.response.data[0].value?.toFixed(2) || 'N/A'} per unit</div>
                      <div>Period: {energyData.gasRates.response.data[0].period || 'N/A'}</div>
                    </div>
                  ) : (
                    <div>Gas rate data available for {state}</div>
                  )}
                </div>
              </div>
            )}

            <div className="p-4 bg-primary/10 rounded-lg">
              <h4 className="font-semibold mb-2">Energy Cost Impact</h4>
              <div className="text-sm text-muted-foreground">
                Energy costs typically represent 15-25% of laundromat operating expenses. 
                Higher energy rates in {state} may impact profitability and should be factored into your analysis.
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Users, GraduationCap, Home } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const DemographicsPanel: React.FC = () => {
  const { toast } = useToast();
  const [zipCode, setZipCode] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [demographicsData, setDemographicsData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const analyzeDemographics = async () => {
    if (!zipCode.trim()) {
      toast({
        title: "ZIP Code Required",
        description: "Please enter a ZIP code",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('demographics-analysis', {
        body: {
          zipCode: zipCode,
          city: city,
          state: state
        }
      });

      if (error) throw error;

      setDemographicsData(data);
      toast({
        title: "Demographics Analysis Complete",
        description: "Demographic data has been retrieved successfully",
      });
    } catch (error) {
      console.error('Demographics analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to retrieve demographic data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseInt(value) : value;
    return num ? `$${num.toLocaleString()}` : 'N/A';
  };

  const formatNumber = (value: string | number) => {
    const num = typeof value === 'string' ? parseInt(value) : value;
    return num ? num.toLocaleString() : 'N/A';
  };

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Demographics Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <Input
            placeholder="ZIP Code"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
          />
          <Input
            placeholder="City (optional)"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <Input
            placeholder="State (optional)"
            value={state}
            onChange={(e) => setState(e.target.value)}
          />
        </div>

        <Button
          onClick={analyzeDemographics}
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analyzing Demographics...
            </>
          ) : (
            'Analyze Demographics'
          )}
        </Button>

        {demographicsData && (
          <div className="space-y-4">
            {demographicsData.demographics && (
              <div className="p-4 bg-gradient-subtle rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="h-4 w-4" />
                  <Badge variant="secondary">Census Data</Badge>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-3 w-3" />
                    <span>Population: {formatNumber(demographicsData.demographics.population)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Home className="h-3 w-3" />
                    <span>Housing Units: {formatNumber(demographicsData.demographics.housingUnits)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>💰</span>
                    <span>Median Income: {formatCurrency(demographicsData.demographics.medianIncome)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>🚗</span>
                    <span>Avg Commute: {demographicsData.demographics.commuteTime} min</span>
                  </div>
                </div>
              </div>
            )}

            {demographicsData.educationData && demographicsData.educationData.results && (
              <div className="p-4 bg-gradient-subtle rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <GraduationCap className="h-4 w-4" />
                  <Badge variant="secondary">Education Data</Badge>
                </div>
                <div className="text-sm">
                  <div>Educational Institutions: {demographicsData.educationData.results.length}</div>
                  {demographicsData.educationData.results.slice(0, 3).map((school: any, index: number) => (
                    <div key={index} className="mt-2 p-2 bg-white/50 rounded">
                      <div className="font-medium">{school['school.name']}</div>
                      <div className="text-xs text-muted-foreground">
                        Students: {school['latest.student.size'] || 'N/A'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="p-4 bg-primary/10 rounded-lg">
              <h4 className="font-semibold mb-2">Market Insights</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                {demographicsData.demographics?.medianIncome && (
                  <div>
                    • {parseInt(demographicsData.demographics.medianIncome) > 50000 
                      ? 'Higher income area - premium services may be viable'
                      : 'Lower income area - focus on value pricing'}
                  </div>
                )}
                {demographicsData.demographics?.population && (
                  <div>
                    • {parseInt(demographicsData.demographics.population) > 20000 
                      ? 'Dense population supports laundromat business'
                      : 'Lower population - consider service area expansion'}
                  </div>
                )}
                <div>• Consider proximity to colleges and apartment complexes for optimal location</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
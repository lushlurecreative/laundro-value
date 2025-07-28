import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, MapPin, Star, Users, TrendingUp, AlertTriangle } from 'lucide-react';
import { useDeal } from '@/contexts/useDeal';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface Competitor {
  name: string;
  address: string;
  rating: number;
  userRatingsTotal: number;
  priceLevel: number | null;
  distance: number;
  businessStatus: string;
}

interface CompetitionData {
  competitors: Competitor[];
  totalCompetitors: number;
  searchRadius: number;
  targetLocation: {
    lat: number;
    lng: number;
    formattedAddress: string;
  };
  analysis: string;
}

export const CompetitionAnalysis: React.FC = () => {
  const { deal } = useDeal();
  const { toast } = useToast();
  const [competitionData, setCompetitionData] = useState<CompetitionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [radius, setRadius] = useState(5000); // meters

  const analyzeCompetition = async () => {
    if (!deal?.propertyAddress) {
      toast({
        title: "Address Required",
        description: "Please enter a property address to analyze local competition",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('google-places-competition', {
        body: {
          address: deal.propertyAddress,
          radius
        }
      });

      if (error) throw error;

      setCompetitionData(data);
      
      toast({
        title: "Competition Analysis Complete",
        description: `Found ${data.totalCompetitors} competitors within ${(radius * 0.000621371).toFixed(1)} miles`,
      });

    } catch (error) {
      console.error('Competition analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: "Unable to analyze local competition. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getCompetitionLevel = (total: number) => {
    if (total === 0) return { level: 'None', color: 'bg-green-500', icon: TrendingUp };
    if (total <= 2) return { level: 'Low', color: 'bg-green-400', icon: TrendingUp };
    if (total <= 5) return { level: 'Moderate', color: 'bg-yellow-500', icon: AlertTriangle };
    return { level: 'High', color: 'bg-red-500', icon: AlertTriangle };
  };

  const radiusInMiles = radius * 0.000621371;
  const competition = competitionData ? getCompetitionLevel(competitionData.totalCompetitors) : null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Local Competition Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Search Radius:</label>
                <select
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                  className="px-3 py-1 border rounded-md text-sm"
                >
                  <option value={3218}>2 miles</option>
                  <option value={5000}>3.1 miles</option>
                  <option value={8047}>5 miles</option>
                  <option value={16093}>10 miles</option>
                </select>
              </div>
              <Button onClick={analyzeCompetition} disabled={loading || !deal?.propertyAddress}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <MapPin className="h-4 w-4 mr-2" />
                    Analyze Competition
                  </>
                )}
              </Button>
            </div>

            {!deal?.propertyAddress && (
              <Alert>
                <AlertDescription>
                  Enter a property address in the Deal Inputs section to analyze local competition.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {competitionData && (
        <>
          {/* Competition Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Competition Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold">{competitionData.totalCompetitors}</div>
                  <div className="text-sm text-muted-foreground">Total Competitors</div>
                  <Badge className={`mt-2 ${competition?.color} text-white`}>
                    {competition?.level} Competition
                  </Badge>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold">{radiusInMiles.toFixed(1)}</div>
                  <div className="text-sm text-muted-foreground">Mile Radius</div>
                </div>
                
                {competitionData.competitors.length > 0 && (
                  <>
                    <div className="text-center">
                      <div className="text-3xl font-bold">
                        {(competitionData.competitors.reduce((sum, comp) => sum + comp.rating, 0) / competitionData.competitors.length).toFixed(1)}
                      </div>
                      <div className="text-sm text-muted-foreground">Avg Rating</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-3xl font-bold">
                        {competitionData.competitors.filter(comp => comp.distance <= 1.0).length}
                      </div>
                      <div className="text-sm text-muted-foreground">Within 1 Mile</div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* AI Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Market Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-line text-sm leading-relaxed">
                {competitionData.analysis}
              </div>
            </CardContent>
          </Card>

          {/* Competitor Details */}
          {competitionData.competitors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Competitor Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {competitionData.competitors
                    .sort((a, b) => a.distance - b.distance)
                    .map((competitor, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold">{competitor.name}</h4>
                          <Badge variant="outline">{competitor.distance.toFixed(1)} mi</Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">{competitor.address}</p>
                        
                        <div className="flex items-center gap-4 text-sm">
                          {competitor.rating > 0 && (
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-yellow-500 mr-1" />
                              {competitor.rating.toFixed(1)}
                              {competitor.userRatingsTotal > 0 && (
                                <span className="text-muted-foreground ml-1">
                                  ({competitor.userRatingsTotal} reviews)
                                </span>
                              )}
                            </div>
                          )}
                          
                          {competitor.priceLevel && (
                            <div className="flex items-center">
                              <span className="text-muted-foreground mr-1">Price:</span>
                              {'$'.repeat(competitor.priceLevel)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};
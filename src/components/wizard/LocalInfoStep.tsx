import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeal } from '@/contexts/useDeal';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, Users, DollarSign, TrendingUp, Building2, Car, AlertTriangle, RefreshCw } from 'lucide-react';

interface LocalData {
  zipCode: string;
  population: number;
  medianIncome: number;
  demographics: {
    ageGroups: Record<string, number>;
    ethnicGroups: Record<string, number>;
  };
  economicFactors: {
    unemploymentRate: number;
    costOfLiving: number;
    householdSize: number;
  };
  competition: {
    laundromats: number;
    drycleaners: number;
    distance: string;
  };
  marketFactors: {
    rentedHousing: number;
    walkability: number;
    parkingAvailability: string;
  };
}

export const LocalInfoStep: React.FC = () => {
  const { deal } = useDeal();
  const [localData, setLocalData] = useState<LocalData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extractZipCode = (address: string): string | null => {
    const zipMatch = address.match(/\b\d{5}(-\d{4})?\b/);
    return zipMatch ? zipMatch[0].split('-')[0] : null;
  };

  const fetchLocalData = async (zipCode: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch market data from our database
      const { data: marketData, error: marketError } = await supabase
        .from('market_data')
        .select('*')
        .eq('zip_code', zipCode)
        .single();

      if (marketError && marketError.code !== 'PGRST116') {
        throw marketError;
      }

      // If no local data, call demographics analysis function
      if (!marketData) {
        const { data: demoData, error: demoError } = await supabase.functions.invoke('demographics-analysis', {
          body: { zipCode, propertyType: 'laundromat' }
        });

        if (demoError) {
          throw demoError;
        }

        setLocalData(demoData);
      } else {
        // Transform market data to our format - use any type to handle JSON fields
        const data = marketData as any;
        const demographicData = data.demographic_data || {};
        const competitionData = data.competition_data || {};
        const incomeData = data.income_data || {};
        
        setLocalData({
          zipCode: marketData.zip_code,
          population: demographicData.population || 0,
          medianIncome: incomeData.median_income || 0,
          demographics: {
            ageGroups: demographicData.age_groups || {},
            ethnicGroups: demographicData.ethnic_groups || {}
          },
          economicFactors: {
            unemploymentRate: incomeData.unemployment_rate || 0,
            costOfLiving: incomeData.cost_of_living_index || 100,
            householdSize: demographicData.avg_household_size || 2.5
          },
          competition: {
            laundromats: competitionData.laundromat_count || 0,
            drycleaners: competitionData.drycleaner_count || 0,
            distance: competitionData.avg_distance || 'Unknown'
          },
          marketFactors: {
            rentedHousing: demographicData.rental_percentage || 0,
            walkability: demographicData.walkability_score || 0,
            parkingAvailability: competitionData.parking_availability || 'Unknown'
          }
        });
      }
    } catch (err) {
      console.error('Error fetching local data:', err);
      setError('Failed to fetch local market data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (deal?.propertyAddress) {
      const zipCode = extractZipCode(deal.propertyAddress);
      if (zipCode) {
        fetchLocalData(zipCode);
      }
    }
  }, [deal?.propertyAddress]);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  const getCompetitionLevel = (count: number): { level: string; color: string; icon: React.ReactNode } => {
    if (count === 0) return { level: 'No Competition', color: 'text-green-600', icon: <TrendingUp className="h-4 w-4" /> };
    if (count <= 2) return { level: 'Low Competition', color: 'text-green-500', icon: <TrendingUp className="h-4 w-4" /> };
    if (count <= 5) return { level: 'Moderate Competition', color: 'text-yellow-500', icon: <Building2 className="h-4 w-4" /> };
    return { level: 'High Competition', color: 'text-red-500', icon: <AlertTriangle className="h-4 w-4" /> };
  };

  const zipCode = deal?.propertyAddress ? extractZipCode(deal.propertyAddress) : null;

  if (!deal?.propertyAddress) {
    return (
      <div className="space-y-6">
        <Alert>
          <MapPin className="h-4 w-4" />
          <AlertDescription>
            Enter a property address in the Property Info step to view local market data and demographics.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!zipCode) {
    return (
      <div className="space-y-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Could not extract ZIP code from the property address. Please ensure the address includes a valid ZIP code.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Alert>
        <MapPin className="h-4 w-4" />
        <AlertDescription>
          Local market analysis for ZIP code <strong>{zipCode}</strong> based on current demographics, competition, and economic factors.
        </AlertDescription>
      </Alert>

      {isLoading ? (
        <div className="space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-6 w-32" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card>
          <CardContent className="p-6">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                {error}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => fetchLocalData(zipCode)}
                  className="ml-4"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      ) : localData ? (
        <>
          {/* Demographics Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Demographics Overview
              </CardTitle>
              <CardDescription>
                Population and demographic data for ZIP code {localData.zipCode}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Population</p>
                  <p className="text-2xl font-bold">{localData.population.toLocaleString()}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Median Income</p>
                  <p className="text-2xl font-bold">{formatCurrency(localData.medianIncome)}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Unemployment Rate</p>
                  <p className="text-2xl font-bold">{formatPercentage(localData.economicFactors.unemploymentRate)}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Avg Household Size</p>
                  <p className="text-2xl font-bold">{localData.economicFactors.householdSize}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Competition Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Competition Analysis
              </CardTitle>
              <CardDescription>
                Competitive landscape in the local area
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    {getCompetitionLevel(localData.competition.laundromats).icon}
                    <h4 className="font-semibold">Laundromats</h4>
                  </div>
                  <p className="text-2xl font-bold mb-1">{localData.competition.laundromats}</p>
                  <p className={`text-sm font-medium ${getCompetitionLevel(localData.competition.laundromats).color}`}>
                    {getCompetitionLevel(localData.competition.laundromats).level}
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="h-4 w-4" />
                    <h4 className="font-semibold">Dry Cleaners</h4>
                  </div>
                  <p className="text-2xl font-bold mb-1">{localData.competition.drycleaners}</p>
                  <p className="text-sm text-muted-foreground">Additional services</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4" />
                    <h4 className="font-semibold">Avg Distance</h4>
                  </div>
                  <p className="text-2xl font-bold mb-1">{localData.competition.distance}</p>
                  <p className="text-sm text-muted-foreground">To competitors</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Market Factors */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Market Factors
              </CardTitle>
              <CardDescription>
                Key indicators for laundromat success
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="h-4 w-4" />
                    <h4 className="font-semibold">Rental Housing</h4>
                  </div>
                  <p className="text-2xl font-bold mb-1">{formatPercentage(localData.marketFactors.rentedHousing)}</p>
                  <p className={`text-sm font-medium ${
                    localData.marketFactors.rentedHousing > 50 ? 'text-green-600' : 
                    localData.marketFactors.rentedHousing > 30 ? 'text-yellow-500' : 'text-red-500'
                  }`}>
                    {localData.marketFactors.rentedHousing > 50 ? 'Excellent' : 
                     localData.marketFactors.rentedHousing > 30 ? 'Good' : 'Poor'} for laundromats
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4" />
                    <h4 className="font-semibold">Walkability Score</h4>
                  </div>
                  <p className="text-2xl font-bold mb-1">{localData.marketFactors.walkability}/100</p>
                  <p className={`text-sm font-medium ${
                    localData.marketFactors.walkability > 70 ? 'text-green-600' : 
                    localData.marketFactors.walkability > 50 ? 'text-yellow-500' : 'text-red-500'
                  }`}>
                    {localData.marketFactors.walkability > 70 ? 'Very Walkable' : 
                     localData.marketFactors.walkability > 50 ? 'Somewhat Walkable' : 'Car-Dependent'}
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Car className="h-4 w-4" />
                    <h4 className="font-semibold">Parking</h4>
                  </div>
                  <p className="text-lg font-bold mb-1">{localData.marketFactors.parkingAvailability}</p>
                  <p className="text-sm text-muted-foreground">Availability</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Age Demographics */}
          {Object.keys(localData.demographics.ageGroups).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Age Demographics</CardTitle>
                <CardDescription>
                  Age distribution in the area
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(localData.demographics.ageGroups).map(([age, percentage]) => (
                    <div key={age} className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">{age}</p>
                      <p className="text-lg font-semibold">{formatPercentage(percentage)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No local data available for this area.</p>
            <Button 
              variant="outline" 
              onClick={() => fetchLocalData(zipCode)}
              className="mt-4"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Load Data
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
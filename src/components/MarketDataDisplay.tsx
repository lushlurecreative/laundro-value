import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, MapPin, Zap, TrendingUp, Building, Loader2 } from 'lucide-react';

interface MarketDataDisplayProps {
  marketData: any;
}

export const MarketDataDisplay: React.FC<MarketDataDisplayProps> = ({ marketData }) => {
  if (!marketData || (!marketData.demographics && !marketData.marketAnalysis && !marketData.energyAnalysis)) {
    return null;
  }

  if (marketData.loading) {
    return (
      <Card className="shadow-elegant">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Analyzing location data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseInt(value) : value;
    return num ? `$${num.toLocaleString()}` : 'N/A';
  };

  const formatNumber = (value: string | number) => {
    const num = typeof value === 'string' ? parseInt(value) : value;
    return num ? num.toLocaleString() : 'N/A';
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-3">Market Intelligence</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Automatically analyzed location data to inform your investment decision
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Demographics */}
        {marketData.demographics?.demographics && (
          <Card className="shadow-elegant">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4 text-primary" />
                Demographics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm">
                <div>Population: {formatNumber(marketData.demographics.demographics.population)}</div>
                <div>Median Income: {formatCurrency(marketData.demographics.demographics.medianIncome)}</div>
                <div>Housing Units: {formatNumber(marketData.demographics.demographics.housingUnits)}</div>
              </div>
              {marketData.demographics.demographics.medianIncome && (
                <Badge variant={parseInt(marketData.demographics.demographics.medianIncome) > 50000 ? "default" : "secondary"} className="text-xs">
                  {parseInt(marketData.demographics.demographics.medianIncome) > 50000 ? 'Higher Income Area' : 'Lower Income Area'}
                </Badge>
              )}
            </CardContent>
          </Card>
        )}

        {/* Market Analysis */}
        {marketData.marketAnalysis && (
          <Card className="shadow-elegant">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="h-4 w-4 text-primary" />
                Market Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {marketData.marketAnalysis.rentalData && (
                <div className="text-sm">
                  <div>Est. Rent: {formatCurrency(marketData.marketAnalysis.rentalData.rent)}</div>
                </div>
              )}
              {marketData.marketAnalysis.competitorData?.local_results && (
                <div className="text-sm">
                  <div>Nearby Laundromats: {marketData.marketAnalysis.competitorData.local_results.length}</div>
                </div>
              )}
              <Badge variant="outline" className="text-xs">Market Analysis</Badge>
            </CardContent>
          </Card>
        )}

        {/* Energy Analysis */}
        {marketData.energyAnalysis && (
          <Card className="shadow-elegant">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Zap className="h-4 w-4 text-primary" />
                Energy Costs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm">
                {marketData.energyAnalysis.electricityRates && (
                  <div>Energy rates available for analysis</div>
                )}
              </div>
              <Badge variant="outline" className="text-xs">Utility Analysis</Badge>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Market Insights */}
      <Card className="shadow-elegant">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4 text-primary" />
            Market Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground space-y-1">
            {marketData.demographics?.demographics?.medianIncome && (
              <div>
                • {parseInt(marketData.demographics.demographics.medianIncome) > 50000 
                  ? 'Higher income area supports premium pricing and services'
                  : 'Lower income area - focus on competitive pricing and value'}
              </div>
            )}
            {marketData.demographics?.demographics?.population && (
              <div>
                • {parseInt(marketData.demographics.demographics.population) > 20000 
                  ? 'Dense population supports laundromat demand'
                  : 'Lower population - consider service area expansion'}
              </div>
            )}
            {marketData.marketAnalysis?.competitorData?.local_results && (
              <div>
                • {marketData.marketAnalysis.competitorData.local_results.length > 3 
                  ? 'High competition - differentiation will be key'
                  : 'Moderate competition - good market opportunity'}
              </div>
            )}
            <div>• Location data integrated into financial projections</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
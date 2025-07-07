import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AIAnalysisPanel } from './AIAnalysisPanel';
import { MarketAnalysisPanel } from './MarketAnalysisPanel';
import { EnergyAnalysisPanel } from './EnergyAnalysisPanel';
import { DemographicsPanel } from './DemographicsPanel';
import { WebScrapperPanel } from './WebScraperPanel';

export const APIIntegrationHub: React.FC = () => {
  return (
    <div className="w-full space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Market Intelligence Hub</h2>
        <p className="text-muted-foreground">AI-powered analysis using integrated market data APIs</p>
      </div>

      <Tabs defaultValue="ai-analysis" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="ai-analysis">AI Analysis</TabsTrigger>
          <TabsTrigger value="market">Market Data</TabsTrigger>
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
          <TabsTrigger value="energy">Energy Costs</TabsTrigger>
          <TabsTrigger value="web-intel">Web Intel</TabsTrigger>
        </TabsList>

        <TabsContent value="ai-analysis" className="mt-6">
          <AIAnalysisPanel />
        </TabsContent>

        <TabsContent value="market" className="mt-6">
          <MarketAnalysisPanel />
        </TabsContent>

        <TabsContent value="demographics" className="mt-6">
          <DemographicsPanel />
        </TabsContent>

        <TabsContent value="energy" className="mt-6">
          <EnergyAnalysisPanel />
        </TabsContent>

        <TabsContent value="web-intel" className="mt-6">
          <WebScrapperPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};
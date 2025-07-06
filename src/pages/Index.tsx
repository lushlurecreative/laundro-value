import React, { useState } from 'react';
import { DealProvider } from '@/contexts/DealContext';
import { Navigation } from '@/components/Navigation';
import { Dashboard } from '@/components/Dashboard';
import { DealInputs } from '@/components/DealInputs';
import { AnalysisScenarios } from '@/components/AnalysisScenarios';
import { DueDiligence } from '@/components/DueDiligence';
import { Reports } from '@/components/Reports';
import { TenYearProjection } from '@/components/TenYearProjection';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'deal-inputs':
        return <DealInputs />;
      case 'analysis':
        return <AnalysisScenarios />;
      case 'projections':
        return <TenYearProjection />;
      case 'due-diligence':
        return <DueDiligence />;
      case 'reports':
        return <Reports />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <DealProvider>
      <div className="min-h-screen bg-gradient-subtle">
        <div className="flex h-screen">
          {/* Sidebar Navigation */}
          <div className="w-80 p-4">
            <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
          
          {/* Main Content */}
          <div className="flex-1 p-6 overflow-auto">
            <div className="max-w-7xl mx-auto">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </DealProvider>
  );
};

export default Index;

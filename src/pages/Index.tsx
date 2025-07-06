import React, { useState } from 'react';
import { DealProvider } from '@/contexts/DealContext';
import { Navigation } from '@/components/Navigation';
import { Dashboard } from '@/components/Dashboard';
import { DealInputs } from '@/components/DealInputs';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'deal-inputs':
        return <DealInputs />;
      case 'analysis':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Analysis & Scenarios</h2>
            <p className="text-muted-foreground">Sensitivity analysis and verification tools coming soon.</p>
          </div>
        );
      case 'due-diligence':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Due Diligence Checklists</h2>
            <p className="text-muted-foreground">Interactive checklists for comprehensive due diligence coming soon.</p>
          </div>
        );
      case 'reports':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Reports</h2>
            <p className="text-muted-foreground">PDF report generation coming soon.</p>
          </div>
        );
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

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DealProvider } from '@/contexts/DealContext';
import { Navigation } from '@/components/Navigation';
import { Dashboard } from '@/components/Dashboard';
import { DealInputs } from '@/components/DealInputs';
import { AnalysisScenarios } from '@/components/AnalysisScenarios';
import { AIInsights } from '@/components/AIInsights';
import { Resources } from '@/components/Resources';
import { DueDiligence } from '@/components/DueDiligence';
import { Reports } from '@/components/Reports';
import { TenYearProjection } from '@/components/TenYearProjection';
import UserProfile from '@/components/UserProfile';
import SubscriptionDashboard from '@/components/SubscriptionDashboard';
import { Button } from '@/components/ui/button';
import { Loader2, User } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Listen for navigation events from DealInputs
  useEffect(() => {
    const handleNavigateToAnalysis = () => {
      setActiveTab('analysis');
    };

    window.addEventListener('navigateToAnalysis', handleNavigateToAnalysis);
    return () => window.removeEventListener('navigateToAnalysis', handleNavigateToAnalysis);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'deal-inputs':
        return <DealInputs />;
      case 'analysis':
        return <AnalysisScenarios />;
      case 'ai-insights':
        return <AIInsights />;
      case 'projections':
        return <TenYearProjection />;
      case 'resources':
        return <Resources />;
      case 'due-diligence':
        return <DueDiligence />;
      case 'reports':
        return <Reports />;
      case 'profile':
        return <UserProfile />;
      case 'subscription':
        return <SubscriptionDashboard />;
      default:
        return <Dashboard />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

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

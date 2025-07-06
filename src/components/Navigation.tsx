import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'deal-inputs', label: 'Deal Inputs', icon: '📝' },
  { id: 'analysis', label: 'Analysis & Scenarios', icon: '📈' },
  { id: 'projections', label: '10-Year Projections', icon: '📅' },
  { id: 'due-diligence', label: 'Due Diligence', icon: '✅' },
  { id: 'reports', label: 'Reports', icon: '📋' }
];

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  return (
    <Card className="h-full shadow-elegant bg-gradient-card border-0">
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Laundromat Deal Analyzer
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Professional Investment Analysis Tool
          </p>
        </div>
        
        <nav className="space-y-2">
          {navigationItems.map((item) => (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "default" : "ghost"}
              className={cn(
                "w-full justify-start text-left h-auto py-3 px-4 font-medium transition-smooth",
                activeTab === item.id 
                  ? "bg-gradient-primary text-primary-foreground shadow-button" 
                  : "hover:bg-accent hover:text-accent-foreground"
              )}
              onClick={() => onTabChange(item.id)}
            >
              <span className="text-lg mr-3">{item.icon}</span>
              <span>{item.label}</span>
            </Button>
          ))}
        </nav>
        
        <div className="mt-8 p-4 bg-gradient-subtle rounded-lg border">
          <p className="text-xs text-muted-foreground">
            Professional-grade analysis tool for laundromat investment evaluation
          </p>
        </div>
      </div>
    </Card>
  );
};
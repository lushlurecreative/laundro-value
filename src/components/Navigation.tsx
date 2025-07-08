import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useDeal } from '@/contexts/useDeal';
import { Trash2, Plus } from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'deal-inputs', label: 'Deal Inputs', icon: '📝' },
  { id: 'analysis', label: 'Analysis & Scenarios', icon: '📈' },
  { id: 'projections', label: '10-Year Projections', icon: '📅' },
  { id: 'resources', label: 'Resources', icon: '💡' },
  { id: 'due-diligence', label: 'Due Diligence', icon: '✅' },
  { id: 'reports', label: 'Reports', icon: '📋' }
];

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const { clearAllData, saveAndStartNew } = useDeal();
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
        
        <div className="mt-8 space-y-3">
          {/* New Deal Analysis Button */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="default" 
                size="sm" 
                className="w-full bg-gradient-primary text-primary-foreground shadow-button hover:bg-gradient-primary/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Deal Analysis
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Start New Deal Analysis</AlertDialogTitle>
                <AlertDialogDescription>
                  This will save your current deal data and start a fresh analysis. Your current work will be automatically backed up and can be retrieved later.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => {
                    saveAndStartNew();
                    onTabChange('deal-inputs');
                  }}
                  className="bg-primary hover:bg-primary/90"
                >
                  Save & Start New
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          <div className="p-4 bg-gradient-subtle rounded-lg border">
            <p className="text-xs text-muted-foreground mb-3">
              Professional-grade analysis tool for laundromat investment evaluation
            </p>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full text-xs">
                  <Trash2 className="h-3 w-3 mr-1" />
                  Clear All Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear All Data</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all deal information, including property details, financials, equipment inventory, and analysis data. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={clearAllData} className="bg-destructive hover:bg-destructive/90">
                    Clear All Data
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </Card>
  );
};
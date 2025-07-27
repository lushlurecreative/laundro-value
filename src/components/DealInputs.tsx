import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from 'lucide-react';
import { DealWizard } from './DealWizard';

export const DealInputs = () => {
  return (
    <div className="space-y-6">
      {/* Critical Disclaimer */}
      <Alert className="border-destructive bg-destructive/5">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>IMPORTANT DISCLAIMER:</strong> All information and analysis provided by this AI-powered application should be independently verified. 
          AI-generated content may contain errors and should not be relied upon as the sole basis for financial decisions. 
          Always consult with qualified professionals, verify all data with independent sources, and conduct your own due diligence before making investment decisions.
        </AlertDescription>
      </Alert>

      {/* Existing Disclaimer */}
      <Alert className="border-warning bg-warning/5">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Important Disclaimer:</strong> All information and analysis provided by this application should be verified independently. 
          AI-generated content may contain errors and should not be relied upon as the sole basis for financial decisions. 
          Always consult with qualified professionals and verify all data before making investment decisions.
        </AlertDescription>
      </Alert>

      <DealWizard />
    </div>
  );
};

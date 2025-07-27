import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from 'lucide-react';
import { DealWizard } from './DealWizard';

export const DealInputs = () => {
  return (
    <div className="space-y-6">
      {/* Simple Disclaimer */}
      <Alert className="border-muted bg-muted/5">
        <AlertDescription className="text-sm text-muted-foreground">
          <strong>Note:</strong> AI-generated analysis should be verified independently. Always consult professionals before making investment decisions.
        </AlertDescription>
      </Alert>

      <DealWizard />
    </div>
  );
};

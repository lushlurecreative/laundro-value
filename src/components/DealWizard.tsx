import React, { Suspense } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { PropertyInfoStep } from './wizard/PropertyInfoStep';
import { IncomeStep } from './wizard/IncomeStep';
import { ExpensesStep } from './wizard/ExpensesStep';
import { EquipmentStep } from './wizard/EquipmentStep';
import { FinancingStep } from './wizard/FinancingStep';
import { LeaseStep } from './wizard/LeaseStep';
import { InvestmentTargetsStep } from './wizard/InvestmentTargetsStep';
import { EnhancedAIAnalysis } from './wizard/EnhancedAIAnalysis';
import { MissingDataAnalysis } from './MissingDataAnalysis';
import { ValidationSummary } from './wizard/ValidationSummary';
import { IncomeVerification } from './IncomeVerification';
import { ComprehensiveAIAnalysis } from './ComprehensiveAIAnalysis';
import { PremiumReports } from './PremiumReports';
import { FormLoadingSkeleton } from './wizard/LoadingStates';
import { DealSaveLoad } from './DealSaveLoad';
import { useState } from 'react';

interface DealWizardProps {
  onComplete?: () => void;
}

const steps = [
  { id: 'ai-analysis', title: 'AI Analysis', component: EnhancedAIAnalysis },
  { id: 'property', title: 'Property Info', component: PropertyInfoStep },
  { id: 'lease', title: 'Lease Info', component: LeaseStep },
  { id: 'income', title: 'Income', component: IncomeStep },
  { id: 'expenses', title: 'Expenses', component: ExpensesStep },
  { id: 'equipment', title: 'Equipment', component: EquipmentStep },
  { id: 'financing', title: 'Financing', component: FinancingStep },
  { id: 'targets', title: 'Investment Targets', component: InvestmentTargetsStep },
  { id: 'income-verification', title: 'Income Verification', component: IncomeVerification },
  { id: 'comprehensive-ai', title: 'AI Deal Analysis', component: ComprehensiveAIAnalysis },
  { id: 'premium-reports', title: 'Premium Reports', component: PremiumReports },
  { id: 'validation', title: 'Review & Validate', component: ValidationSummary },
  { id: 'missing-data', title: 'Missing Data Analysis', component: MissingDataAnalysis },
];

export const DealWizard: React.FC<DealWizardProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      setCurrentStep(currentStep + 1);
    } else {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      onComplete?.();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  const isStepCompleted = (stepIndex: number) => {
    return completedSteps.has(stepIndex);
  };

  const progress = ((currentStep) / (steps.length - 1)) * 100;
  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-center flex-1">Deal Analysis Wizard</CardTitle>
            <DealSaveLoad />
          </div>
          <div className="space-y-4">
            <Progress value={progress} className="w-full" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Step {currentStep + 1} of {steps.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Step Navigation */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            {steps.map((step, index) => (
              <Button
                key={step.id}
                variant={index === currentStep ? "default" : isStepCompleted(index) ? "secondary" : "outline"}
                size="sm"
                onClick={() => goToStep(index)}
                className="flex items-center gap-2"
                disabled={index > currentStep && !isStepCompleted(index)}
              >
                {isStepCompleted(index) && <CheckCircle className="h-3 w-3" />}
                <span className="hidden sm:inline">{step.title}</span>
                <span className="sm:hidden">{index + 1}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep].title}</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<FormLoadingSkeleton />}>
            <CurrentStepComponent />
          </Suspense>
        </CardContent>
      </Card>

      {/* Navigation Footer */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        
        <Button
          onClick={handleNext}
          className="flex items-center gap-2"
        >
          {currentStep === steps.length - 1 ? 'Complete Analysis' : 'Next'}
          {currentStep !== steps.length - 1 && <ChevronRight className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
};
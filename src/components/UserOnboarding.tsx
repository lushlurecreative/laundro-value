import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CheckCircle, User } from 'lucide-react';

interface UserOnboardingProps {
  onComplete: () => void;
}

export const UserOnboarding: React.FC<UserOnboardingProps> = ({ onComplete }) => {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Welcome to Testing Mode
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Authentication has been disabled for testing. You can skip the onboarding process.
            </AlertDescription>
          </Alert>
          
          <Button onClick={onComplete} className="w-full">
            Continue to Application
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
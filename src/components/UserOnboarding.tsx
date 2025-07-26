import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, ArrowRight, ArrowLeft, User, Building, Target, Sparkles } from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Laundromat Analyzer',
    description: 'Let\'s get you started with your investment analysis journey',
    icon: <Sparkles className="h-6 w-6" />
  },
  {
    id: 'profile',
    title: 'Complete Your Profile',
    description: 'Tell us about yourself to personalize your experience',
    icon: <User className="h-6 w-6" />
  },
  {
    id: 'business',
    title: 'Business Information',
    description: 'Share details about your investment focus',
    icon: <Building className="h-6 w-6" />
  },
  {
    id: 'goals',
    title: 'Investment Goals',
    description: 'Define your investment criteria and targets',
    icon: <Target className="h-6 w-6" />
  }
];

interface UserOnboardingProps {
  onComplete: () => void;
}

export const UserOnboarding: React.FC<UserOnboardingProps> = ({ onComplete }) => {
  const { updateProfile } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    jobTitle: '',
    company: '',
    location: '',
    bio: '',
    experienceLevel: '',
    investmentFocus: '',
    targetCapRate: '',
    targetCashOnCash: '',
    maxInvestment: '',
    preferredMarkets: '',
    riskTolerance: ''
  });

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      await updateProfile({
        full_name: formData.fullName,
        job_title: formData.jobTitle,
        company: formData.company,
        location: formData.location,
        bio: formData.bio,
        onboarding_completed: true
      });

      toast({
        title: "Welcome aboard!",
        description: "Your profile has been set up successfully.",
      });
      
      onComplete();
    } catch (error) {
      toast({
        title: "Setup failed",
        description: "Failed to complete setup. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const progress = ((currentStep + 1) / onboardingSteps.length) * 100;

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold">Welcome to Laundromat Analyzer!</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                You're about to unlock powerful tools for analyzing laundromat investments. 
                Let's take a few minutes to personalize your experience.
              </p>
            </div>
            <div className="grid gap-3 text-sm text-left max-w-md mx-auto">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Comprehensive deal analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>AI-powered insights and recommendations</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Professional reporting and PDF exports</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Market data and comparables</span>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold">Tell us about yourself</h3>
              <p className="text-muted-foreground">
                This helps us personalize your experience and recommendations
              </p>
            </div>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input
                    id="jobTitle"
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    placeholder="e.g. Real Estate Investor"
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="company">Company (Optional)</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Your company"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="City, State"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="experienceLevel">Experience Level</Label>
                <Select 
                  value={formData.experienceLevel} 
                  onValueChange={(value) => setFormData({ ...formData, experienceLevel: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner (0-1 years)</SelectItem>
                    <SelectItem value="intermediate">Intermediate (2-5 years)</SelectItem>
                    <SelectItem value="experienced">Experienced (5+ years)</SelectItem>
                    <SelectItem value="expert">Expert (10+ years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold">Business Focus</h3>
              <p className="text-muted-foreground">
                Help us understand your investment approach
              </p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="investmentFocus">Primary Investment Focus</Label>
                <Select 
                  value={formData.investmentFocus} 
                  onValueChange={(value) => setFormData({ ...formData, investmentFocus: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="What's your main focus?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash-flow">Cash Flow Generation</SelectItem>
                    <SelectItem value="appreciation">Property Appreciation</SelectItem>
                    <SelectItem value="value-add">Value-Add Opportunities</SelectItem>
                    <SelectItem value="passive-income">Passive Income</SelectItem>
                    <SelectItem value="portfolio-building">Portfolio Building</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="riskTolerance">Risk Tolerance</Label>
                <Select 
                  value={formData.riskTolerance} 
                  onValueChange={(value) => setFormData({ ...formData, riskTolerance: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="How much risk are you comfortable with?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conservative">Conservative - Stable, predictable returns</SelectItem>
                    <SelectItem value="moderate">Moderate - Balanced risk/return</SelectItem>
                    <SelectItem value="aggressive">Aggressive - Higher risk for higher returns</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="preferredMarkets">Preferred Markets</Label>
                <Input
                  id="preferredMarkets"
                  value={formData.preferredMarkets}
                  onChange={(e) => setFormData({ ...formData, preferredMarkets: e.target.value })}
                  placeholder="e.g. California, Texas, Southeast US"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">About You (Optional)</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell us about your investment background and goals..."
                  rows={3}
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold">Investment Targets</h3>
              <p className="text-muted-foreground">
                Set your financial criteria to get personalized recommendations
              </p>
            </div>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="targetCapRate">Target Cap Rate (%)</Label>
                  <Input
                    id="targetCapRate"
                    type="number"
                    step="0.1"
                    value={formData.targetCapRate}
                    onChange={(e) => setFormData({ ...formData, targetCapRate: e.target.value })}
                    placeholder="8.0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetCashOnCash">Target Cash-on-Cash ROI (%)</Label>
                  <Input
                    id="targetCashOnCash"
                    type="number"
                    step="0.1"
                    value={formData.targetCashOnCash}
                    onChange={(e) => setFormData({ ...formData, targetCashOnCash: e.target.value })}
                    placeholder="15.0"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxInvestment">Maximum Investment Budget</Label>
                <Select 
                  value={formData.maxInvestment} 
                  onValueChange={(value) => setFormData({ ...formData, maxInvestment: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your budget range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="under-100k">Under $100K</SelectItem>
                    <SelectItem value="100k-250k">$100K - $250K</SelectItem>
                    <SelectItem value="250k-500k">$250K - $500K</SelectItem>
                    <SelectItem value="500k-1m">$500K - $1M</SelectItem>
                    <SelectItem value="1m-plus">$1M+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">You're all set! 🎉</h4>
                <p className="text-sm text-muted-foreground">
                  We'll use these preferences to provide personalized deal recommendations 
                  and highlight opportunities that match your criteria.
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-between mb-4">
            <Badge variant="outline">
              Step {currentStep + 1} of {onboardingSteps.length}
            </Badge>
            <div className="text-sm text-muted-foreground">
              {Math.round(progress)}% Complete
            </div>
          </div>
          <Progress value={progress} className="mb-4" />
          <CardTitle className="flex items-center justify-center gap-2">
            {onboardingSteps[currentStep].icon}
            {onboardingSteps[currentStep].title}
          </CardTitle>
          <p className="text-muted-foreground">
            {onboardingSteps[currentStep].description}
          </p>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
          
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            <Button
              onClick={handleNext}
              disabled={isLoading || (currentStep === 1 && !formData.fullName)}
            >
              {isLoading ? (
                'Setting up...'
              ) : currentStep === onboardingSteps.length - 1 ? (
                'Complete Setup'
              ) : (
                <>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserOnboarding;
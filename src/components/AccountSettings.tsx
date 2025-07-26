import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Settings, 
  Shield, 
  Smartphone, 
  Mail, 
  Key, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Lock,
  Loader2
} from 'lucide-react';

export const AccountSettings: React.FC = () => {
  const { user, profile } = useAuth();
  const { subscription } = useSubscription();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    loginAlerts: true,
    passwordChanged: false,
    sessionTimeout: '30',
    ipWhitelist: '',
    apiKeyGenerated: false
  });

  const [privacySettings, setPrivacySettings] = useState({
    profileVisible: true,
    shareAnalytics: false,
    marketingEmails: false,
    dataRetention: '2-years',
    cookieConsent: true
  });

  const handleEnable2FA = async () => {
    setIsLoading(true);
    try {
      // In a real app, this would initiate 2FA setup
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSecuritySettings({ ...securitySettings, twoFactorEnabled: true });
      toast({
        title: "2FA Enabled",
        description: "Two-factor authentication has been enabled for your account.",
      });
    } catch (error) {
      toast({
        title: "Failed to enable 2FA",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setIsLoading(true);
    try {
      // In a real app, this would send a password reset email
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Password reset email sent",
        description: "Check your email for password reset instructions.",
      });
    } catch (error) {
      toast({
        title: "Failed to send reset email",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateApiKey = async () => {
    setIsLoading(true);
    try {
      // In a real app, this would generate an API key
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSecuritySettings({ ...securitySettings, apiKeyGenerated: true });
      toast({
        title: "API Key Generated",
        description: "Your new API key has been created. Store it securely.",
      });
    } catch (error) {
      toast({
        title: "Failed to generate API key",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getSecurityScore = () => {
    let score = 0;
    if (securitySettings.twoFactorEnabled) score += 30;
    if (securitySettings.passwordChanged) score += 20;
    if (securitySettings.loginAlerts) score += 15;
    if (securitySettings.ipWhitelist) score += 15;
    if (user?.email_confirmed_at) score += 20;
    return Math.min(score, 100);
  };

  const securityScore = getSecurityScore();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Account Settings</h2>
          <p className="text-muted-foreground">Manage your security and privacy preferences</p>
        </div>
      </div>

      {/* Security Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-1">
              <div className="text-2xl font-bold">{securityScore}/100</div>
              <p className="text-sm text-muted-foreground">
                {securityScore >= 80 ? 'Excellent' : 
                 securityScore >= 60 ? 'Good' : 
                 securityScore >= 40 ? 'Fair' : 'Poor'} security
              </p>
            </div>
            <div className={`text-3xl ${
              securityScore >= 80 ? 'text-green-500' : 
              securityScore >= 60 ? 'text-yellow-500' : 'text-red-500'
            }`}>
              {securityScore >= 80 ? '🛡️' : securityScore >= 60 ? '⚠️' : '🔓'}
            </div>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                securityScore >= 80 ? 'bg-green-500' : 
                securityScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${securityScore}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Email Verification */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Verification</Label>
                <p className="text-sm text-muted-foreground">Confirm your email address</p>
              </div>
              <Badge variant={user?.email_confirmed_at ? "default" : "secondary"}>
                {user?.email_confirmed_at ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Unverified
                  </>
                )}
              </Badge>
            </div>

            <Separator />

            {/* Two-Factor Authentication */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                </div>
                <Switch
                  checked={securitySettings.twoFactorEnabled}
                  onCheckedChange={() => {
                    if (!securitySettings.twoFactorEnabled) {
                      handleEnable2FA();
                    }
                  }}
                  disabled={isLoading}
                />
              </div>
              {!securitySettings.twoFactorEnabled && (
                <Alert>
                  <Smartphone className="h-4 w-4" />
                  <AlertDescription>
                    Enable 2FA to significantly improve your account security.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <Separator />

            {/* Password */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Password</Label>
                  <p className="text-sm text-muted-foreground">Change your password</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleChangePassword}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Key className="h-4 w-4 mr-2" />
                      Change
                    </>
                  )}
                </Button>
              </div>
            </div>

            <Separator />

            {/* Session Settings */}
            <div className="space-y-3">
              <Label>Session Timeout</Label>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  value={securitySettings.sessionTimeout}
                  onChange={(e) => setSecuritySettings({ 
                    ...securitySettings, 
                    sessionTimeout: e.target.value 
                  })}
                  className="w-20"
                />
                <span className="text-sm text-muted-foreground">minutes</span>
              </div>
            </div>

            <Separator />

            {/* Login Alerts */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Login Alerts</Label>
                <p className="text-sm text-muted-foreground">Get notified of new logins</p>
              </div>
              <Switch
                checked={securitySettings.loginAlerts}
                onCheckedChange={(checked) => 
                  setSecuritySettings({ ...securitySettings, loginAlerts: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Privacy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Visibility */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Profile Visibility</Label>
                <p className="text-sm text-muted-foreground">Make profile visible to others</p>
              </div>
              <Switch
                checked={privacySettings.profileVisible}
                onCheckedChange={(checked) => 
                  setPrivacySettings({ ...privacySettings, profileVisible: checked })
                }
              />
            </div>

            <Separator />

            {/* Analytics Sharing */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Analytics Sharing</Label>
                <p className="text-sm text-muted-foreground">Help improve our service</p>
              </div>
              <Switch
                checked={privacySettings.shareAnalytics}
                onCheckedChange={(checked) => 
                  setPrivacySettings({ ...privacySettings, shareAnalytics: checked })
                }
              />
            </div>

            <Separator />

            {/* Marketing Emails */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Marketing Emails</Label>
                <p className="text-sm text-muted-foreground">Receive product updates</p>
              </div>
              <Switch
                checked={privacySettings.marketingEmails}
                onCheckedChange={(checked) => 
                  setPrivacySettings({ ...privacySettings, marketingEmails: checked })
                }
              />
            </div>

            <Separator />

            {/* Data Retention */}
            <div className="space-y-2">
              <Label>Data Retention</Label>
              <div className="grid gap-2">
                {['1-year', '2-years', '5-years', 'indefinite'].map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id={option}
                      name="dataRetention"
                      value={option}
                      checked={privacySettings.dataRetention === option}
                      onChange={(e) => 
                        setPrivacySettings({ ...privacySettings, dataRetention: e.target.value })
                      }
                      className="w-4 h-4"
                    />
                    <Label htmlFor={option} className="text-sm capitalize">
                      {option.replace('-', ' ')}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Cookie Consent */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Cookie Consent</Label>
                <p className="text-sm text-muted-foreground">Allow functional cookies</p>
              </div>
              <Switch
                checked={privacySettings.cookieConsent}
                onCheckedChange={(checked) => 
                  setPrivacySettings({ ...privacySettings, cookieConsent: checked })
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* API Access */}
      {subscription?.subscription_tier !== 'free' && (
        <Card>
          <CardHeader>
            <CardTitle>API Access</CardTitle>
            <p className="text-sm text-muted-foreground">
              Generate API keys for programmatic access to your data
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">API Key</h4>
                <p className="text-sm text-muted-foreground">
                  {securitySettings.apiKeyGenerated 
                    ? 'API key generated and ready to use' 
                    : 'No API key generated yet'
                  }
                </p>
              </div>
              <Button 
                variant="outline"
                onClick={generateApiKey}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  securitySettings.apiKeyGenerated ? 'Regenerate' : 'Generate'
                )}
              </Button>
            </div>
            
            {securitySettings.apiKeyGenerated && (
              <Alert>
                <Key className="h-4 w-4" />
                <AlertDescription>
                  Store your API key securely. It won't be shown again for security reasons.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Account Status */}
      <Card>
        <CardHeader>
          <CardTitle>Account Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Account Type:</span>
              <Badge variant={subscription?.subscribed ? "default" : "secondary"}>
                {subscription?.subscription_tier?.toUpperCase() || 'FREE'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Member Since:</span>
              <span>{profile ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Login:</span>
              <span>{user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Account Status:</span>
              <Badge variant="outline" className="text-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Active
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountSettings;
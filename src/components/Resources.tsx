import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useDeal } from '@/contexts/useDeal';
import { Plus, X, Lightbulb, Coffee, Car, Shield, Wifi, DollarSign, TrendingUp, Users, MapPin, Building, FileText, ExternalLink, BookOpen } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { LaundromatsGuide } from './LaundromatsGuide';
import { LaundromatsLegacyProgram } from './LaundromatsLegacyProgram';

export const Resources: React.FC = () => {
  const { deal, updateDeal } = useDeal();
  const [currentView, setCurrentView] = useState<'main' | 'guide' | 'legacy'>('main');

  if (currentView === 'guide') {
    return <LaundromatsGuide onBack={() => setCurrentView('main')} />;
  }

  if (currentView === 'legacy') {
    return <LaundromatsLegacyProgram onBack={() => setCurrentView('main')} />;
  }


  const suggestedServices = [
    {
      icon: <Coffee className="h-5 w-5" />,
      title: "Coffee & Snacks",
      description: "Vending machines or small cafe area for waiting customers",
      estimatedRevenue: "$200-500/month"
    },
    {
      icon: <Car className="h-5 w-5" />,
      title: "Shoe Cleaning",
      description: "Professional shoe cleaning and shine services",
      estimatedRevenue: "$300-800/month"
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: "Dry Cleaning",
      description: "Partner with or add dry cleaning services",
      estimatedRevenue: "$500-1500/month"
    },
    {
      icon: <Wifi className="h-5 w-5" />,
      title: "Free WiFi Lounge",
      description: "Create a comfortable waiting area with premium WiFi and charge stations",
      estimatedRevenue: "$100-300/month (customer retention)"
    }
  ];

  const businessImprovementTips = [
    {
      category: "Customer Experience",
      tips: [
        "Install security cameras and improve lighting for customer safety",
        "Add comfortable seating and charging stations",
        "Implement mobile payment options and loyalty programs",
        "Provide change machines and bill breakers"
      ]
    },
    {
      category: "Revenue Optimization",
      tips: [
        "Optimize pricing based on local market analysis",
        "Add wash-dry-fold services for busy professionals",
        "Partner with local businesses for bulk laundry contracts",
        "Install newer, energy-efficient machines to reduce costs"
      ]
    },
    {
      category: "Operational Efficiency",
      tips: [
        "Implement remote monitoring systems for equipment",
        "Schedule maintenance during off-peak hours",
        "Use energy-efficient lighting and HVAC systems",
        "Consider attended vs unattended hours optimization"
      ]
    }
  ];

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold">Resources & Growth Opportunities</h2>
          <p className="text-muted-foreground">
            Explore ways to add value, improve operations, and grow your laundromat business
          </p>
        </div>

        {/* Comprehensive Laundromat Guides */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Free Guide */}
          <Card className="shadow-elegant bg-gradient-subtle border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Laundromats 101</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Complete journey from idea to business
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  The complete "Laundromats 101" guide covers everything from hunting for deals to operations.
                </p>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-2 bg-background rounded-lg border">
                    <div className="text-lg font-bold text-primary">5</div>
                    <div className="text-xs text-muted-foreground">Phases</div>
                  </div>
                  <div className="p-2 bg-background rounded-lg border">
                    <div className="text-lg font-bold text-primary">R.A.P.I.D</div>
                    <div className="text-xs text-muted-foreground">Location</div>
                  </div>
                </div>
                <Button 
                  onClick={() => setCurrentView('guide')}
                  className="w-full"
                  variant="outline"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Read Guide
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Premium Guide */}
          <Card className="shadow-elegant bg-gradient-primary/5 border-primary/30">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/20 rounded-lg">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    Legacy Program
                    <Badge className="bg-gradient-primary text-white text-xs">Premium</Badge>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Complete A-Z blueprint with worksheets
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  The ultimate 7-module blueprint with detailed worksheets, checklists, and templates.
                </p>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-2 bg-background rounded-lg border">
                    <div className="text-lg font-bold text-primary">7</div>
                    <div className="text-xs text-muted-foreground">Modules</div>
                  </div>
                  <div className="p-2 bg-background rounded-lg border">
                    <div className="text-lg font-bold text-primary">A-Z</div>
                    <div className="text-xs text-muted-foreground">Complete</div>
                  </div>
                </div>
                <Button 
                  onClick={() => setCurrentView('legacy')}
                  className="w-full bg-gradient-primary text-white"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  View Blueprint
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Business Growth Ideas */}
        <Card className="shadow-elegant">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Business Growth Ideas</CardTitle>
              <Tooltip>
                <TooltipTrigger>
                  <Lightbulb className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Ideas for growing your laundromat business beyond basic operations. Add specific services in the Deal Inputs Income section.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <p className="text-sm text-muted-foreground">
              Popular service ideas to increase revenue (configure actual services in Deal Inputs)
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Suggested Services */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Service Ideas</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {suggestedServices.map((service, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        {service.icon}
                      </div>
                      <div className="flex-1">
                        <h5 className="font-semibold">{service.title}</h5>
                        <p className="text-sm text-muted-foreground mb-2">{service.description}</p>
                        <Badge variant="secondary" className="text-xs">
                          {service.estimatedRevenue}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  💡 <strong>Tip:</strong> To add these services to your financial analysis, go to <strong>Deal Inputs → Income → Value-Added Services</strong> section.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Improvement Tips */}
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle>Business Improvement Strategies</CardTitle>
            <p className="text-sm text-muted-foreground">
              Proven strategies to optimize operations and increase profitability
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {businessImprovementTips.map((category, index) => (
                <div key={index}>
                  <h4 className="text-lg font-semibold mb-3 text-primary">{category.category}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {category.tips.map((tip, tipIndex) => (
                      <div key={tipIndex} className="flex items-start gap-2 text-sm">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                        <p>{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Industry News & Market Data */}
        <Card className="shadow-elegant">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Industry News & Market Intelligence</CardTitle>
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">
              Stay informed about laundromat industry trends and local market conditions
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Industry Resources
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Coin Laundry Association</p>
                      <p className="text-sm text-muted-foreground">Industry Standards & best practices</p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">American Coin-Op Magazine</p>
                      <p className="text-sm text-muted-foreground">Industry news & equipment updates</p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Laundromat Resource Forums</p>
                      <p className="text-sm text-muted-foreground">Community discussions & tips</p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location-Based Data
                </h4>
                <div className="space-y-3">
                  {deal?.propertyAddress && (
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm font-medium">Market Analysis for:</p>
                      <p className="text-sm text-muted-foreground">{deal.propertyAddress}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        * Data sourced from census, demographic, and market research APIs
                      </p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 border rounded-lg">
                      <p className="text-lg font-bold text-primary">N/A</p>
                      <p className="text-xs text-muted-foreground">Avg Household Income</p>
                    </div>
                    <div className="text-center p-3 border rounded-lg">
                      <p className="text-lg font-bold text-primary">N/A</p>
                      <p className="text-xs text-muted-foreground">Population Density</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financing Resources */}
        <Card className="shadow-elegant">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Financing Resources & Standards</CardTitle>
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">
              Financing options and Industry Standards for laundromat acquisitions
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Typical Financing Terms</h4>
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Down Payment</span>
                      <span className="text-primary font-semibold">20-30%</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Industry standard for established businesses</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Loan Term</span>
                      <span className="text-primary font-semibold">7-10 years</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Typical SBA and conventional loans</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Interest Rate</span>
                      <span className="text-primary font-semibold">6-12%</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Varies by credit and loan type</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Financing Sources</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">SBA Loans</p>
                      <p className="text-sm text-muted-foreground">7(a) and 504 programs</p>
                    </div>
                    <Badge variant="secondary">Popular</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Equipment Financing</p>
                      <p className="text-sm text-muted-foreground">For equipment-heavy deals</p>
                    </div>
                    <Badge variant="outline">Specialized</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Business Lines of Credit</p>
                      <p className="text-sm text-muted-foreground">For working capital</p>
                    </div>
                    <Badge variant="outline">Flexible</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Seller Financing</p>
                      <p className="text-sm text-muted-foreground">Owner-backed deals</p>
                    </div>
                    <Badge variant="secondary">Common</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Maintenance & Operations */}
        <Card className="shadow-elegant">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Maintenance & Operations Guide</CardTitle>
              <Building className="h-5 w-5 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">
              Essential maintenance tasks and operational best practices
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Daily Tasks</h4>
                <ul className="space-y-2 text-sm">
                  <li>• Clean lint from dryer vents and filters</li>
                  <li>• Empty coin boxes and check bill changers</li>
                  <li>• Clean and sanitize surfaces</li>
                  <li>• Check for out-of-order machines</li>
                  <li>• Restock supplies (detergent, fabric softener)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Weekly Tasks</h4>
                <ul className="space-y-2 text-sm">
                  <li>• Deep clean facility and equipment</li>
                  <li>• Check water temperature and pressure</li>
                  <li>• Inspect electrical connections</li>
                  <li>• Review security camera footage</li>
                  <li>• Update social media and signage</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Monthly Tasks</h4>
                <ul className="space-y-2 text-sm">
                  <li>• Professional vent cleaning</li>
                  <li>• Equipment maintenance inspection</li>
                  <li>• Review utility bills and usage</li>
                  <li>• Analyze revenue and expense trends</li>
                  <li>• Update business insurance</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Quarterly Tasks</h4>
                <ul className="space-y-2 text-sm">
                  <li>• Equipment service and calibration</li>
                  <li>• Review pricing strategy</li>
                  <li>• Assess competition and market</li>
                  <li>• Plan capital improvements</li>
                  <li>• Review lease and contracts</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Legal & Compliance */}
        <Card className="shadow-elegant">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Legal & Compliance Resources</CardTitle>
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">
              Important legal and regulatory considerations for laundromat operations
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Required Licenses & Permits</h4>
                <ul className="space-y-2 text-sm">
                  <li>• Business license and tax registration</li>
                  <li>• Water and wastewater discharge permits</li>
                  <li>• Fire department safety inspections</li>
                  <li>• ADA compliance certification</li>
                  <li>• Workers' compensation insurance</li>
                  <li>• Commercial liability insurance</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Regulatory Compliance</h4>
                <ul className="space-y-2 text-sm">
                  <li>• Environmental regulations (water/chemical use)</li>
                  <li>• OSHA safety standards</li>
                  <li>• Local zoning and signage requirements</li>
                  <li>• Health department regulations</li>
                  <li>• Energy efficiency standards</li>
                  <li>• Privacy laws for security cameras</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
};
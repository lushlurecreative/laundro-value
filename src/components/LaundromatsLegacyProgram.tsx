import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { 
  ArrowLeft, 
  Lock, 
  Crown, 
  BookOpen, 
  Target, 
  Search, 
  FileText, 
  DollarSign, 
  Settings, 
  TrendingUp, 
  Shield,
  CheckCircle,
  AlertTriangle,
  Star
} from 'lucide-react';

interface LaundromatsLegacyProgramProps {
  onBack: () => void;
}

export const LaundromatsLegacyProgram: React.FC<LaundromatsLegacyProgramProps> = ({ onBack }) => {
  const { subscription, role } = useSubscription();
  const [activeModule, setActiveModule] = useState<number | null>(null);
  
  const isPremium = subscription?.subscription_tier === 'premium' || role?.role === 'professional' || role?.role === 'enterprise';

  const modules = [
    {
      id: 0,
      title: "Foundation & Mindset",
      subtitle: "Is This Business Actually For You?",
      icon: <Target className="h-6 w-6" />,
      color: "bg-red-500/10 text-red-700",
      sections: [
        {
          title: "The Unvarnished Truth",
          content: [
            "This is NOT a passive investment. It is a semi-passive business. In the beginning, it is an active, hands-on job.",
            "This is a high-capital, high-fixed-cost business. You are buying $200,000 to $1,000,000+ worth of heavy machinery.",
            "This is a customer service business. Your product isn't just clean clothes; it's a clean, safe, and efficient experience."
          ]
        },
        {
          title: "The Ideal Owner Profile",
          content: [
            "Mechanically Inclined (or willing to learn): Being able to perform simple repairs will save you thousands of dollars.",
            "Financially Literate: You must be comfortable reading financial statements and managing cash flow.",
            "Patient & Detail-Oriented: Due diligence is a long, tedious process. If you rush it, you will lose your investment.",
            "A 'People Person': You will interact with customers from all walks of life. A calm, friendly demeanor is essential."
          ]
        }
      ]
    },
    {
      id: 1,
      title: "The Hunt",
      subtitle: "Market Analysis & Deal Sourcing",
      icon: <Search className="h-6 w-6" />,
      color: "bg-blue-500/10 text-blue-700",
      sections: [
        {
          title: "Macro-Level Market Selection",
          content: [
            "The Ideal Customer Avatar: A renter in a multi-family building with low-to-middle household income",
            "Renter Percentage: Aim for > 40%. The higher, the better.",
            "Population Density: Aim for > 5,000 people per square mile.",
            "Median Household Income: Look for areas at or slightly below the county median."
          ]
        },
        {
          title: "Deal Sourcing Strategies",
          content: [
            "Level 1 (Public Listings): BizBuySell.com, LoopNet.com",
            "Level 2 (Brokers): Find brokers who specialize in laundromats",
            "Level 3 (Direct Outreach): Create a list of every laundromat in your target area and send professional letters"
          ]
        }
      ]
    },
    {
      id: 2,
      title: "The Gauntlet",
      subtitle: "Ultimate Due Diligence",
      icon: <FileText className="h-6 w-6" />,
      color: "bg-purple-500/10 text-purple-700",
      sections: [
        {
          title: "Initial Screening & The 'Napkin Test'",
          content: [
            "Calculate the Valuation Multiple: Asking Price / Annual NOI. If it's over 6x, it's likely overpriced.",
            "Calculate the Net Profit Margin: Annual NOI / Gross Revenue. If it's over 40%, be skeptical.",
            "The industry average is 20-35%."
          ]
        },
        {
          title: "The Document Request",
          content: [
            "3 years of Profit & Loss (P&L) Statements",
            "3 years of Federal Business Tax Returns",
            "24 consecutive months of ALL utility bills (Water/Sewer, Gas, Electric)",
            "Complete list of all equipment (make, model, age, purchase price)",
            "Current lease agreement and any amendments"
          ]
        },
        {
          title: "The Water Bill Audit",
          content: [
            "Total Gallons Used / Avg. Gallons per Wash Cycle = Estimated Number of Washes",
            "Estimated Washes × Avg. Price Per Wash = Estimated Monthly Income",
            "This is your baseline truth - sellers can lie about income but not water usage"
          ]
        }
      ]
    },
    {
      id: 3,
      title: "The Deal",
      subtitle: "Valuation, Negotiation & Financing",
      icon: <DollarSign className="h-6 w-6" />,
      color: "bg-green-500/10 text-green-700",
      sections: [
        {
          title: "Final Valuation",
          content: [
            "3.5x - 3.9x: Old equipment (>10 yrs), short lease (<7 yrs), needs renovation",
            "4.0x - 4.9x: Good equipment (5-10 yrs), 10+ year lease, good location (Industry Average)",
            "5.0x - 5.5x: New equipment (<5 yrs), 15+ year lease, perfect location, documented growth"
          ]
        },
        {
          title: "Financing Options",
          content: [
            "SBA 7(a) Loan: Most common option. Requires excellent credit (700+), 20-30% down payment",
            "Equipment Financing: Loan secured by equipment itself. Higher rates but less down payment",
            "Seller Financing: Very flexible on terms and down payment"
          ]
        }
      ]
    },
    {
      id: 4,
      title: "The Takeover",
      subtitle: "Closing & The First 120 Days",
      icon: <Settings className="h-6 w-6" />,
      color: "bg-orange-500/10 text-orange-700",
      sections: [
        {
          title: "The First 120-Day Action Plan",
          content: [
            "Phase 1 (Days 1-30): Secure & Stabilize - Transfer utilities, change locks, meet staff",
            "Phase 2 (Days 31-90): Improve & Repair - Deep clean, upgrade lighting, repair all machines",
            "Phase 3 (Days 91-120): Market & Grow - Digital presence, promotions, ancillary services"
          ]
        }
      ]
    },
    {
      id: 5,
      title: "The Operation",
      subtitle: "Systems for Sustainable Profit",
      icon: <Shield className="h-6 w-6" />,
      color: "bg-indigo-500/10 text-indigo-700",
      sections: [
        {
          title: "The Maintenance System",
          content: [
            "Reactive Maintenance: Something breaks, you fix it. Minimize this.",
            "Preventative Maintenance: Fix problems before they happen. This is how you win.",
            "Daily: Wipe down machines, check coin jams, test machines",
            "Weekly: Clean lint traps, soap dispensers, deep clean bathroom"
          ]
        },
        {
          title: "The Financial System",
          content: [
            "Use QuickBooks Online or Xero from day one",
            "Track KPIs every Monday: Gross Revenue, Turns Per Day, Utility Costs, Google Reviews",
            "Cash Management: Collect at irregular times, never be predictable"
          ]
        }
      ]
    },
    {
      id: 6,
      title: "The Apex",
      subtitle: "Optimization & Growth",
      icon: <TrendingUp className="h-6 w-6" />,
      color: "bg-emerald-500/10 text-emerald-700",
      sections: [
        {
          title: "Wash-Dry-Fold (WDF) & Pickup/Delivery",
          content: [
            "This is the single biggest growth opportunity",
            "WDF In-Store: $1.50/lb with 15lb minimum",
            "PUD Delivery: $1.95/lb to cover fuel and labor",
            "Use dedicated software like Cents or CleanCloud"
          ]
        },
        {
          title: "Commercial Accounts",
          content: [
            "Target: Local inns, B&Bs, restaurants, spas, gyms",
            "Offer slightly lower per-pound pricing for guaranteed weekly volume",
            "Net-30 billing terms for steady, predictable revenue"
          ]
        }
      ]
    },
    {
      id: 7,
      title: "The Exit",
      subtitle: "Preparing & Executing a Profitable Sale",
      icon: <Star className="h-6 w-6" />,
      color: "bg-yellow-500/10 text-yellow-700",
      sections: [
        {
          title: "24-Month Pre-Sale Optimization",
          content: [
            "24 Months Out: Clean up financials, pay down debt, plan equipment replacement",
            "18 Months Out: Renegotiate lease (need 10+ years remaining), implement WDF/PUD",
            "12 Months Out: Stop personal expenses through business, document procedures",
            "6 Months Out: Assemble data room, get professional valuation, select broker"
          ]
        }
      ]
    }
  ];

  if (!isPremium) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Resources
          </Button>
        </div>

        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-4 bg-gradient-primary rounded-full">
              <Crown className="h-12 w-12 text-white" />
            </div>
          </div>
          
          <div>
            <h1 className="text-4xl font-bold mb-4">The Laundromat Legacy Program</h1>
            <p className="text-xl text-muted-foreground mb-6">
              Your Complete A-Z Blueprint for Laundromat Success
            </p>
            <Badge variant="outline" className="text-primary border-primary">
              <Crown className="h-4 w-4 mr-2" />
              Premium Resource
            </Badge>
          </div>

          <Alert className="max-w-2xl mx-auto">
            <Lock className="h-4 w-4" />
            <AlertDescription>
              This comprehensive 7-module blueprint is available exclusively to premium subscribers. 
              Upgrade your subscription to access the complete A-Z guide for building a profitable laundromat business.
            </AlertDescription>
          </Alert>

          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                What's Included in the Legacy Program
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {modules.map((module) => (
                  <div key={module.id} className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg opacity-60">
                    <div className={`p-2 rounded-lg ${module.color} flex-shrink-0`}>
                      {module.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">Module {module.id}: {module.title}</h4>
                      <p className="text-xs text-muted-foreground">{module.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-gradient-primary text-white">
              <Crown className="h-4 w-4 mr-2" />
              Upgrade to Premium
            </Button>
            <Button variant="outline" onClick={onBack}>
              View Free Resources
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Resources
        </Button>
      </div>

      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-4 bg-gradient-primary rounded-full">
            <Crown className="h-12 w-12 text-white" />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          The Laundromat Legacy Program
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Your Complete A-Z Blueprint for Building a Profitable Laundromat Business
        </p>
        
        <div className="p-6 bg-gradient-subtle rounded-lg border max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4">From Simple Idea to Profitable Business</h2>
          <p className="text-muted-foreground mb-4">
            This is the most comprehensive strategic framework and operational playbook possible. 
            Its purpose is to provide an aspiring owner with the critical knowledge of what to do, 
            when to do it, what to look for, and how to analyze it at every stage of the process.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="p-4 bg-green-500/10 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-700 mb-2">What This Blueprint Provides:</h3>
              <p className="text-green-600">Complete set of questions, checklists, and formulas so you don't miss critical steps, get locked into bad leases, or overpay for a business.</p>
            </div>
            <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-200">
              <h3 className="font-semibold text-amber-700 mb-2">What Experience Provides:</h3>
              <p className="text-amber-600">The intuition, negotiation skills, and hands-on knowledge that can only come from actually running the business.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Module Overview */}
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            7 Complete Modules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            {modules.map((module, index) => (
              <div key={module.id}>
                <button
                  onClick={() => setActiveModule(activeModule === module.id ? null : module.id)}
                  className="w-full flex items-center gap-4 p-4 bg-muted/30 hover:bg-muted/50 rounded-lg transition-colors"
                >
                  <div className={`p-3 rounded-lg ${module.color}`}>
                    {module.icon}
                  </div>
                  <div className="text-left flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">Module {module.id}</Badge>
                      <h3 className="font-semibold">{module.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{module.subtitle}</p>
                  </div>
                  <CheckCircle className="h-5 w-5 text-muted-foreground" />
                </button>
                
                {activeModule === module.id && (
                  <div className="mt-4 ml-4 space-y-4">
                    {module.sections.map((section, sectionIndex) => (
                      <div key={sectionIndex} className="border-l-4 border-primary/20 pl-6">
                        <h4 className="font-semibold mb-3 text-primary">{section.title}</h4>
                        <div className="space-y-2">
                          {section.content.map((item, itemIndex) => (
                            <div key={itemIndex} className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 bg-primary/60 rounded-full mt-2 flex-shrink-0" />
                              <p className="text-sm text-muted-foreground">{item}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    {index < modules.length - 1 && <Separator className="mt-6" />}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resource Hub */}
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            Ultimate Resource Hub
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Industry Associations</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Coin Laundry Association (CLA)</li>
                <li>• PlanetLaundry Magazine</li>
                <li>• American Coin-Op Magazine</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Technology & Software</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Card Concepts Inc. (CCI)</li>
                <li>• PayRange & SpyderWash</li>
                <li>• Cents & CleanCloud</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Equipment Manufacturers</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Speed Queen</li>
                <li>• Dexter Laundry</li>
                <li>• Maytag Commercial</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Professional Team</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Business Transaction Attorney</li>
                <li>• Certified Public Accountant</li>
                <li>• Commercial Insurance Agent</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Final Message */}
      <Card className="shadow-elegant bg-gradient-subtle border-primary/20">
        <CardContent className="p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-primary/10 rounded-full">
              <Crown className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-4">The Complete Flight Manual</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            This blueprint is the complete flight manual for the aircraft. It teaches you every control, 
            every procedure, and every emergency checklist. It ensures you know how the plane works and 
            how to avoid crashing due to pilot error. But it cannot replace the experience of actually 
            flying the plane through turbulence.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
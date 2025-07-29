import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Search, DollarSign, Building, TrendingUp, Shield, Users, MapPin, FileText, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

interface LaundromatsGuideProps {
  onBack: () => void;
}

export const LaundromatsGuide: React.FC<LaundromatsGuideProps> = ({ onBack }) => {
  const phases = [
    {
      phase: 1,
      title: "The Hunt — Finding Your Diamond in the Suds",
      icon: <Search className="h-6 w-6" />,
      color: "bg-blue-500/10 text-blue-700",
      sections: [
        {
          title: "Where to Look",
          content: [
            {
              subtitle: "Online Marketplaces",
              description: "Websites like BizBuySell and LoopNet are the public square. This is where most people start. You'll find plenty of listings, but also plenty of competition."
            },
            {
              subtitle: "Business Brokers", 
              description: "These are real estate agents for businesses. A good broker who specializes in laundromats can bring you deals before they go public."
            },
            {
              subtitle: "The Pro Move (Direct Mail)",
              description: "Find all the laundromats in your target area, get the owners' mailing addresses, and send them a simple letter: 'I'm interested in buying a laundromat in the area. If you've ever considered selling, I'd love to have a confidential conversation.' You'll be surprised how many 'not for sale' owners are willing to talk."
            }
          ]
        },
        {
          title: "The R.A.P.I.D. Location Factors",
          content: [
            {
              subtitle: "Renters",
              description: "What percentage of people in a 1-mile radius rent their homes? The higher, the better. Renters are your core customers. Aim for areas with 40%+ renters."
            },
            {
              subtitle: "Access",
              description: "Is it easy to get into and out of the parking lot? Is it on a busy street where people see it every day?"
            },
            {
              subtitle: "Parking",
              description: "Is there enough dedicated parking? If customers have to circle the block, they'll go somewhere else."
            },
            {
              subtitle: "Income Level",
              description: "Lower-to-middle income areas are often the sweet spot. High-income households have their own machines."
            },
            {
              subtitle: "Density", 
              description: "How many people live within that 1-mile radius? More people = more potential customers."
            }
          ]
        }
      ]
    },
    {
      phase: 2,
      title: "The Detective Work — How to Not Buy a Lemon",
      icon: <FileText className="h-6 w-6" />,
      color: "bg-purple-500/10 text-purple-700",
      sections: [
        {
          title: "4-Week Deep Dive Plan",
          content: [
            {
              subtitle: "Week 1: The Stakeout",
              description: "Go to the laundromat. Don't talk to anyone. Just sit in your car or at a folding table and observe. Count customers at different times. Watch which machines customers use. Check the competition within a 2-mile radius."
            },
            {
              subtitle: "Week 2: The Paper Trail",
              description: "Ask for P&L statements for the last 3 years, tax returns for the last 3 years (trust the tax return if P&L doesn't match), all utility bills for 24 months, and the lease agreement. No documents, no deal."
            },
            {
              subtitle: "Week 3: The Lie Detector (Water Bill)",
              description: "Find total gallons used from water bills. Find gallons per cycle for each washer model. Formula: (Total Gallons) ÷ (Avg. Gallons Per Cycle) = Estimated Washes. Then: (Estimated Washes) × (Avg. Price Per Wash) = Estimated Monthly Income."
            },
            {
              subtitle: "Week 4: Meet the Machines",
              description: "Hire a professional service technician to inspect every machine. Check age, condition, brands (look for Speed Queen, Dexter, Maytag, Continental Girbau), and payment systems."
            }
          ]
        }
      ]
    },
    {
      phase: 3,
      title: "The Deal — Valuing, Financing, and Closing",
      icon: <DollarSign className="h-6 w-6" />,
      color: "bg-green-500/10 text-green-700",
      sections: [
        {
          title: "How to Value the Business",
          content: [
            {
              subtitle: "Industry Standard Multiplier",
              description: "A laundromat is worth 3.5 to 5.5 times its annual Net Operating Income (NOI). A 3.5x multiplier for older stores with short leases, 5.5x for beautiful stores with new machines and great leases."
            },
            {
              subtitle: "Example Valuation",
              description: "If the laundromat has proven profit (NOI) of $50,000 per year and is in decent shape with a good lease, it might be worth 4x that profit, or $200,000."
            }
          ]
        },
        {
          title: "Financing Options",
          content: [
            {
              subtitle: "SBA Loan",
              description: "Most common path. The Small Business Administration guarantees part of the loan. You'll typically need 20-30% down payment and good credit score (680+)."
            },
            {
              subtitle: "Seller Financing",
              description: "The owner acts as the bank. You pay them a down payment and they receive monthly payments from you. This can be very flexible."
            }
          ]
        },
        {
          title: "The Lease is Your Lifeline",
          content: [
            {
              subtitle: "Minimum Requirements",
              description: "Demand a lease of at least 10 years, with options to renew for another 5-10 years. Never buy with only 3 years left unless the landlord guarantees a new long-term deal in writing."
            }
          ]
        }
      ]
    },
    {
      phase: 4,
      title: "Running the Show",
      icon: <Building className="h-6 w-6" />,
      color: "bg-orange-500/10 text-orange-700",
      sections: [
        {
          title: "Your First 100 Days",
          content: [
            {
              subtitle: "Clean & Bright",
              description: "Make it the cleanest, brightest, and safest place to do laundry in town. Clean every machine, fix every broken light, and paint the walls."
            },
            {
              subtitle: "Add Value",
              description: "Install Wi-Fi. Add a modern card payment system. Put in a new vending machine for soap."
            },
            {
              subtitle: "Listen",
              description: "Talk to your customers. What do they want? More big machines? A better snack selection?"
            }
          ]
        }
      ]
    },
    {
      phase: 5,
      title: "The Exit Strategy",
      icon: <TrendingUp className="h-6 w-6" />,
      color: "bg-indigo-500/10 text-indigo-700",
      sections: [
        {
          title: "Selling Your Laundromat",
          content: [
            {
              subtitle: "The Full Circle",
              description: "Years from now, when you're ready to sell, the process is just the reverse. A buyer will do the same detective work on you."
            },
            {
              subtitle: "Maximizing Value",
              description: "If you keep clean financial records, maintain your machines, hold a valuable long-term lease, and show stable or growing profit, you'll command that top-dollar 5.5x multiplier."
            }
          ]
        }
      ]
    }
  ];

  const keyTakeaways = [
    {
      icon: <MapPin className="h-5 w-5" />,
      title: "Location is EVERYTHING",
      description: "A C-grade laundromat in an A+ location will make more money than an A+ laundromat in a C-grade location."
    },
    {
      icon: <AlertTriangle className="h-5 w-5" />,
      title: "Verify EVERYTHING",
      description: "Assume the seller is exaggerating until you prove otherwise. Use the water bill trick to verify actual usage."
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: "Protect Your Investment",
      description: "Secure a long-term lease of at least 10 years. Your business is worthless without a good lease."
    },
    {
      icon: <CheckCircle className="h-5 w-5" />,
      title: "It's a Real Business",
      description: "Not a set-it-and-forget-it ATM. But get it right, and it can be one of the most rewarding ventures you'll ever undertake."
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Resources
        </Button>
      </div>

      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Laundromats 101
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          The complete journey from a simple idea into a profitable business. No jargon, no fluff.
        </p>
        <div className="p-6 bg-gradient-subtle rounded-lg border max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4">So, You Want to Buy a Box of Money Machines?</h2>
          <p className="text-muted-foreground mb-4">
            That's the dream, right? A cash-pumping, recession-resistant business that practically runs itself.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="p-4 bg-green-500/10 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-700 mb-2">The Good News:</h3>
              <p className="text-green-600">That dream can be real. Laundromats serve a basic human need, people pay in cash (or with cards instantly), and you don't have to worry about inventory spoiling.</p>
            </div>
            <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-200">
              <h3 className="font-semibold text-amber-700 mb-2">The Reality Check:</h3>
              <p className="text-amber-600">It's not a set-it-and-forget-it ATM. It's a real business that requires a big upfront investment and some serious detective work before you buy.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Takeaways */}
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            Key Takeaways
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {keyTakeaways.map((takeaway, index) => (
              <div key={index} className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                  {takeaway.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-sm">{takeaway.title}</h4>
                  <p className="text-xs text-muted-foreground">{takeaway.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Phases */}
      <div className="space-y-8">
        {phases.map((phase) => (
          <Card key={phase.phase} className="shadow-elegant">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${phase.color}`}>
                  {phase.icon}
                </div>
                <div>
                  <Badge variant="outline" className="mb-2">Phase {phase.phase}</Badge>
                  <CardTitle className="text-xl">{phase.title}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {phase.sections.map((section, sectionIndex) => (
                <div key={sectionIndex}>
                  <h3 className="text-lg font-semibold mb-4 text-primary">{section.title}</h3>
                  <div className="space-y-4">
                    {section.content.map((item, itemIndex) => (
                      <div key={itemIndex} className="border-l-4 border-primary/20 pl-4">
                        <h4 className="font-semibold text-sm mb-2">{item.subtitle}</h4>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    ))}
                  </div>
                  {sectionIndex < phase.sections.length - 1 && <Separator className="mt-6" />}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Final Message */}
      <Card className="shadow-elegant bg-gradient-subtle border-primary/20">
        <CardContent className="p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-primary/10 rounded-full">
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-4">Get It Right, and You've Got a Cash-Flow Machine</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Get it wrong, and you've bought a rusty, leaking money pit. This guide is your map to getting it right. 
            It's a real business, not a hobby. But get it right, and it can be one of the most rewarding ventures you'll ever undertake.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
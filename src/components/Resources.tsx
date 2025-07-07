import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useDeal } from '@/contexts/DealContext';
import { Plus, X, Lightbulb, Coffee, Car, Shield, Wifi } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export const Resources: React.FC = () => {
  const { deal, updateDeal } = useDeal();

  const addValueAddedService = () => {
    const currentServices = deal?.valueAddedServices || [];
    const newService = {
      description: '',
      potentialRevenue: 0
    };
    updateDeal({
      valueAddedServices: [...currentServices, newService]
    });
  };

  const updateValueAddedService = (index: number, field: 'description' | 'potentialRevenue', value: string | number) => {
    const currentServices = deal?.valueAddedServices || [];
    const updatedServices = currentServices.map((service, i) => 
      i === index ? { ...service, [field]: value } : service
    );
    updateDeal({ valueAddedServices: updatedServices });
  };

  const removeValueAddedService = (index: number) => {
    const currentServices = deal?.valueAddedServices || [];
    const updatedServices = currentServices.filter((_, i) => i !== index);
    updateDeal({ valueAddedServices: updatedServices });
  };

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

        {/* Value-Added Services */}
        <Card className="shadow-elegant">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Value-Added Services</CardTitle>
              <Tooltip>
                <TooltipTrigger>
                  <Lightbulb className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Additional services that can increase revenue and customer retention while differentiating your business from competitors.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <p className="text-sm text-muted-foreground">
              Consider these services to increase revenue and customer retention
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current Services */}
            <div className="space-y-4">
              {(deal?.valueAddedServices || []).map((service, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end p-4 border rounded-lg">
                  <div>
                    <Label>Service Description</Label>
                    <Input
                      value={service.description}
                      onChange={(e) => updateValueAddedService(index, 'description', e.target.value)}
                      placeholder="e.g., Coffee vending machine"
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Label>Potential Annual Revenue</Label>
                      <Input
                        type="number"
                        value={service.potentialRevenue}
                        onChange={(e) => updateValueAddedService(index, 'potentialRevenue', Number(e.target.value))}
                        placeholder="0"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeValueAddedService(index)}
                      className="mt-6"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
              <Button onClick={addValueAddedService} variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Value-Added Service
              </Button>
            </div>

            <Separator />

            {/* Suggested Services */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Suggested Services</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {suggestedServices.map((service, index) => (
                  <Card key={index} className="p-4 hover:shadow-md transition-shadow cursor-pointer" 
                        onClick={() => {
                          const currentServices = deal?.valueAddedServices || [];
                          updateDeal({
                            valueAddedServices: [...currentServices, {
                              description: service.title,
                              potentialRevenue: 0
                            }]
                          });
                        }}>
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

        {/* Maintenance & Operations */}
        <Card className="shadow-elegant">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Maintenance & Operations Guide</CardTitle>
              <Tooltip>
                <TooltipTrigger>
                  <Lightbulb className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Essential maintenance tasks and operational best practices to keep your laundromat running efficiently and profitably.</p>
                </TooltipContent>
              </Tooltip>
            </div>
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
      </div>
    </TooltipProvider>
  );
};
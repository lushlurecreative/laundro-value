import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Plus, X, Upload, Eye } from 'lucide-react';

interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
  notes: string;
  documents: string[];
}

interface ChecklistSection {
  id: string;
  title: string;
  description: string;
  items: ChecklistItem[];
}

export const DueDiligence: React.FC = () => {
  const [checklist, setChecklist] = useState<ChecklistSection[]>([
    {
      id: 'financial',
      title: 'Financial Review',
      description: 'Analyze all financial documentation and records',
      items: [
        { id: 'f1', title: 'Review 3 years of profit & loss statements', completed: false, notes: '', documents: [] },
        { id: 'f2', title: 'Verify tax returns and business filings', completed: false, notes: '', documents: [] },
        { id: 'f3', title: 'Analyze cash flow patterns and seasonality', completed: false, notes: '', documents: [] },
        { id: 'f4', title: 'Review bank statements and deposit records', completed: false, notes: '', documents: [] },
        { id: 'f5', title: 'Verify accounts payable and receivable', completed: false, notes: '', documents: [] },
        { id: 'f6', title: 'Review equipment financing and leases', completed: false, notes: '', documents: [] },
        { id: 'f7', title: 'Analyze utility bills and usage patterns', completed: false, notes: '', documents: [] },
        { id: 'f8', title: 'Review insurance policies and claims history', completed: false, notes: '', documents: [] }
      ]
    },
    {
      id: 'lease-property',
      title: 'Lease & Property',
      description: 'Examine lease terms and property conditions',
      items: [
        { id: 'lp1', title: 'Review lease agreement and terms', completed: false, notes: '', documents: [] },
        { id: 'lp2', title: 'Verify rent escalation clauses', completed: false, notes: '', documents: [] },
        { id: 'lp3', title: 'Check renewal options and terms', completed: false, notes: '', documents: [] },
        { id: 'lp4', title: 'Review CAM charges and responsibilities', completed: false, notes: '', documents: [] },
        { id: 'lp5', title: 'Inspect property condition and maintenance needs', completed: false, notes: '', documents: [] },
        { id: 'lp6', title: 'Review property taxes and assessments', completed: false, notes: '', documents: [] },
        { id: 'lp7', title: 'Check zoning compliance and restrictions', completed: false, notes: '', documents: [] },
        { id: 'lp8', title: 'Review environmental assessments', completed: false, notes: '', documents: [] }
      ]
    },
    {
      id: 'operational',
      title: 'Operational',
      description: 'Evaluate business operations and equipment',
      items: [
        { id: 'o1', title: 'Inventory and condition assessment of all equipment', completed: false, notes: '', documents: [] },
        { id: 'o2', title: 'Review maintenance records and schedules', completed: false, notes: '', documents: [] },
        { id: 'o3', title: 'Analyze customer patterns and peak hours', completed: false, notes: '', documents: [] },
        { id: 'o4', title: 'Review staffing requirements and costs', completed: false, notes: '', documents: [] },
        { id: 'o5', title: 'Evaluate security systems and procedures', completed: false, notes: '', documents: [] },
        { id: 'o6', title: 'Review supplier contracts and relationships', completed: false, notes: '', documents: [] },
        { id: 'o7', title: 'Analyze pricing strategy and competition', completed: false, notes: '', documents: [] },
        { id: 'o8', title: 'Review business systems and software', completed: false, notes: '', documents: [] }
      ]
    },
    {
      id: 'legal-regulatory',
      title: 'Legal & Regulatory',
      description: 'Ensure compliance and legal standing',
      items: [
        { id: 'lr1', title: 'Verify business licenses and permits', completed: false, notes: '', documents: [] },
        { id: 'lr2', title: 'Review compliance with health department regulations', completed: false, notes: '', documents: [] },
        { id: 'lr3', title: 'Check fire department approvals and safety compliance', completed: false, notes: '', documents: [] },
        { id: 'lr4', title: 'Review employment law compliance', completed: false, notes: '', documents: [] },
        { id: 'lr5', title: 'Verify workers compensation and insurance coverage', completed: false, notes: '', documents: [] },
        { id: 'lr6', title: 'Review any pending litigation or claims', completed: false, notes: '', documents: [] },
        { id: 'lr7', title: 'Check ADA compliance and accessibility', completed: false, notes: '', documents: [] },
        { id: 'lr8', title: 'Review water and sewer permits', completed: false, notes: '', documents: [] }
      ]
    },
    {
      id: 'market',
      title: 'Market Analysis',
      description: 'Evaluate market conditions and competition',
      items: [
        { id: 'm1', title: 'Analyze local demographics and population trends', completed: false, notes: '', documents: [] },
        { id: 'm2', title: 'Survey competing laundromats within 2-mile radius', completed: false, notes: '', documents: [] },
        { id: 'm3', title: 'Review local economic indicators and employment', completed: false, notes: '', documents: [] },
        { id: 'm4', title: 'Analyze housing density and rental rates in area', completed: false, notes: '', documents: [] },
        { id: 'm5', title: 'Review foot traffic and visibility factors', completed: false, notes: '', documents: [] },
        { id: 'm6', title: 'Evaluate parking availability and accessibility', completed: false, notes: '', documents: [] },
        { id: 'm7', title: 'Research planned developments or changes in area', completed: false, notes: '', documents: [] },
        { id: 'm8', title: 'Analyze public transportation access', completed: false, notes: '', documents: [] }
      ]
    }
  ]);

  const updateItemCompletion = (sectionId: string, itemId: string, completed: boolean) => {
    setChecklist(prev => prev.map(section => 
      section.id === sectionId 
        ? {
            ...section,
            items: section.items.map(item => 
              item.id === itemId ? { ...item, completed } : item
            )
          }
        : section
    ));
  };

  const updateItemNotes = (sectionId: string, itemId: string, notes: string) => {
    setChecklist(prev => prev.map(section => 
      section.id === sectionId 
        ? {
            ...section,
            items: section.items.map(item => 
              item.id === itemId ? { ...item, notes } : item
            )
          }
        : section
    ));
  };

  const addDocument = (sectionId: string, itemId: string, document: string) => {
    setChecklist(prev => prev.map(section => 
      section.id === sectionId 
        ? {
            ...section,
            items: section.items.map(item => 
              item.id === itemId 
                ? { ...item, documents: [...item.documents, document] }
                : item
            )
          }
        : section
    ));
  };

  const removeDocument = (sectionId: string, itemId: string, docIndex: number) => {
    setChecklist(prev => prev.map(section => 
      section.id === sectionId 
        ? {
            ...section,
            items: section.items.map(item => 
              item.id === itemId 
                ? { 
                    ...item, 
                    documents: item.documents.filter((_, index) => index !== docIndex) 
                  }
                : item
            )
          }
        : section
    ));
  };

  const getSectionProgress = (section: ChecklistSection) => {
    const completedItems = section.items.filter(item => item.completed).length;
    return (completedItems / section.items.length) * 100;
  };

  const getOverallProgress = () => {
    const totalItems = checklist.reduce((sum, section) => sum + section.items.length, 0);
    const completedItems = checklist.reduce((sum, section) => 
      sum + section.items.filter(item => item.completed).length, 0
    );
    return totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'text-success';
    if (progress >= 50) return 'text-warning';
    return 'text-danger';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Due Diligence Checklists</h2>
          <p className="text-muted-foreground">
            This interactive checklist guides you through the critical steps of a laundromat acquisition. Complete each section to ensure a thorough review of the deal's financials, lease, legal status, and operations. Use the notes field for any comments and the document upload to attach relevant files.
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Overall Progress</p>
          <p className={`text-2xl font-bold ${getProgressColor(getOverallProgress())}`}>
            {getOverallProgress().toFixed(0)}%
          </p>
        </div>
      </div>

      {/* Due Diligence Instructions */}
      <Card className="shadow-card mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            How to Use This Checklist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">How to Complete:</h4>
              <ul className="text-sm space-y-1">
                <li>• Click checkboxes to mark items as complete</li>
                <li>• Add detailed notes for each section</li>
                <li>• Upload supporting documents when available</li>
                <li>• Review all sections before finalizing</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Best Practices:</h4>
              <ul className="text-sm space-y-1">
                <li>• Work through items systematically</li>
                <li>• Don't skip sections - all are important</li>
                <li>• Get professional help for complex items</li>
                <li>• Document everything for future reference</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-elegant">
        <CardContent className="p-6">
          <div className="mb-6">
            <Progress value={getOverallProgress()} className="h-3" />
          </div>
          
          <Accordion type="multiple" defaultValue={['financial']} className="space-y-4">
            {checklist.map((section) => (
              <AccordionItem key={section.id} value={section.id} className="border rounded-lg">
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex items-center justify-between w-full mr-4">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className="text-xs">
                        {section.items.filter(item => item.completed).length}/{section.items.length}
                      </Badge>
                      <div className="text-left">
                        <h3 className="font-semibold">{section.title}</h3>
                        <p className="text-sm text-muted-foreground">{section.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={getSectionProgress(section)} className="w-16 h-2" />
                      <span className={`text-sm font-medium ${getProgressColor(getSectionProgress(section))}`}>
                        {getSectionProgress(section).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </AccordionTrigger>
                
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-4">
                    {section.items.map((item) => (
                      <div key={item.id} className="border-l-2 border-muted pl-4 space-y-3">
                        <div className="flex items-start space-x-3">
                          <Checkbox
                            id={item.id}
                            checked={item.completed}
                            onCheckedChange={(checked) => 
                              updateItemCompletion(section.id, item.id, checked === true)
                            }
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <label 
                              htmlFor={item.id}
                              className={`text-sm font-medium cursor-pointer ${
                                item.completed ? 'line-through text-muted-foreground' : ''
                              }`}
                            >
                              {item.title}
                            </label>
                          </div>
                        </div>
                        
                        <div className="ml-6 space-y-2">
                          <Textarea
                            placeholder="Add notes or observations..."
                            value={item.notes}
                            onChange={(e) => updateItemNotes(section.id, item.id, e.target.value)}
                            className="text-sm"
                            rows={2}
                          />
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-muted-foreground">Documents</p>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const filename = prompt('Enter document name:');
                                  if (filename) {
                                    addDocument(section.id, item.id, filename);
                                  }
                                }}
                                className="h-6 px-2 text-xs"
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Add
                              </Button>
                            </div>
                            
                            {item.documents.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {item.documents.map((doc, docIndex) => (
                                  <Badge key={docIndex} variant="secondary" className="text-xs py-1">
                                    <Upload className="h-3 w-3 mr-1" />
                                    {doc}
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => removeDocument(section.id, item.id, docIndex)}
                                      className="h-auto p-0 ml-1 hover:bg-transparent"
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Summary Card */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Due Diligence Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gradient-subtle rounded-lg">
              <p className="text-2xl font-bold text-success">
                {checklist.reduce((sum, section) => sum + section.items.filter(item => item.completed).length, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Items Completed</p>
            </div>
            <div className="text-center p-4 bg-gradient-subtle rounded-lg">
              <p className="text-2xl font-bold text-warning">
                {checklist.reduce((sum, section) => sum + section.items.filter(item => !item.completed).length, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Items Remaining</p>
            </div>
            <div className="text-center p-4 bg-gradient-subtle rounded-lg">
              <p className="text-2xl font-bold text-primary">
                {checklist.reduce((sum, section) => sum + section.items.filter(item => item.documents.length > 0).length, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Items with Documents</p>
            </div>
          </div>
          
          <div className="mt-6 p-4 border rounded-lg">
            <h4 className="font-semibold mb-2">Next Steps</h4>
            <div className="space-y-1 text-sm">
              {checklist.map(section => {
                const incompleteItems = section.items.filter(item => !item.completed);
                if (incompleteItems.length > 0) {
                  return (
                    <p key={section.id}>
                      <span className="font-medium">{section.title}:</span> {incompleteItems.length} items remaining
                    </p>
                  );
                }
                return null;
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
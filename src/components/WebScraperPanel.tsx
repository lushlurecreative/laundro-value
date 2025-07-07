import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Globe, Building2, Search } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const WebScrapperPanel: React.FC = () => {
  const { toast } = useToast();
  const [url, setUrl] = useState('');
  const [scrapeType, setScrapeType] = useState<'real-estate' | 'competition' | 'general'>('general');
  const [scrapedData, setScrapedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const scrapeWebsite = async () => {
    if (!url.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a website URL to scrape",
        variant: "destructive",
      });
      return;
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid website URL",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('web-scraper', {
        body: {
          url: url,
          scrapeType: scrapeType
        }
      });

      if (error) throw error;

      setScrapedData(data);
      toast({
        title: "Scraping Complete",
        description: "Website data has been extracted successfully",
      });
    } catch (error) {
      console.error('Web scraping error:', error);
      toast({
        title: "Scraping Failed",
        description: "Failed to scrape website data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          Web Intelligence
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Input
            placeholder="Enter website URL to analyze..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          
          <Select value={scrapeType} onValueChange={(value: any) => setScrapeType(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select analysis type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="real-estate">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Real Estate Listings
                </div>
              </SelectItem>
              <SelectItem value="competition">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Competitor Analysis
                </div>
              </SelectItem>
              <SelectItem value="general">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  General Market Info
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={scrapeWebsite}
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Scraping Website...
            </>
          ) : (
            'Analyze Website'
          )}
        </Button>

        {scrapedData && (
          <div className="space-y-4">
            <div className="p-4 bg-gradient-subtle rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="h-4 w-4" />
                <Badge variant="secondary">Scraped Content</Badge>
              </div>
              
              {scrapedData.data?.content && (
                <div className="text-sm space-y-2">
                  <div className="font-medium">Page Title:</div>
                  <div className="bg-white/50 p-2 rounded">
                    {scrapedData.data.metadata?.title || 'No title found'}
                  </div>
                  
                  <div className="font-medium">Description:</div>
                  <div className="bg-white/50 p-2 rounded">
                    {scrapedData.data.metadata?.description || 'No description found'}
                  </div>
                  
                  {scrapedData.data.llm_extraction && (
                    <>
                      <div className="font-medium">Extracted Information:</div>
                      <div className="bg-white/50 p-2 rounded max-h-40 overflow-y-auto">
                        <pre className="text-xs whitespace-pre-wrap">
                          {JSON.stringify(scrapedData.data.llm_extraction, null, 2)}
                        </pre>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 bg-primary/10 rounded-lg">
              <h4 className="font-semibold mb-2">Analysis Tips</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                {scrapeType === 'real-estate' && (
                  <div>• Look for pricing trends, square footage, and location features</div>
                )}
                {scrapeType === 'competition' && (
                  <div>• Review competitor services, pricing, and customer feedback</div>
                )}
                {scrapeType === 'general' && (
                  <div>• Extract relevant market data and business intelligence</div>
                )}
                <div>• Always verify scraped data with additional sources</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
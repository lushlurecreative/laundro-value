import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExtractionRequest {
  url?: string;
  rawText?: string;
  extractionType: 'url' | 'text' | 'document';
  documentType?: 'real-estate' | 'equipment' | 'financial' | 'general';
}

interface MachineData {
  quantity: number;
  type: string;
  brand?: string;
  capacity?: string;
  model?: string;
}

interface ExtractedData {
  propertyInfo?: {
    address?: string;
    askingPrice?: number;
    squareFootage?: number;
    yearBuilt?: number;
  };
  leaseInfo?: {
    monthlyRent?: number;
    leaseTermYears?: number;
    securityDeposit?: number;
    renewalOptions?: string;
  };
  equipment?: MachineData[];
  expenses?: Record<string, number>;
  income?: {
    grossIncome?: number;
    ancillaryIncome?: Record<string, number>;
  };
  utilities?: {
    electricity?: number;
    water?: number;
    gas?: number;
    sewer?: number;
  };
}

// Enhanced equipment parsing patterns
const EQUIPMENT_PATTERNS = {
  // Pattern: "5 - 50# SPEED QUEEN WASHERS"
  detailed: /(\d+)\s*[-–]\s*(\d+)#?\s*([A-Z\s]+?)\s*(WASHER|DRYER|STACK)[S]?/gi,
  // Pattern: "32- 35# SPEED QUEEN DRYER POCKETS"
  pockets: /(\d+)[-–]\s*(\d+)#?\s*([A-Z\s]+?)\s*(DRYER\s*POCKET)[S]?/gi,
  // Pattern: "24- LAUNDRY CARTS"
  accessories: /(\d+)[-–]\s*([A-Z\s]+?(?:CART|TABLE|STOOL|CHAIR|CHANGER))[S]?/gi,
  // Pattern: "1 - WATER HEATER (NOT WORKING)"
  utilities: /(\d+)\s*[-–]\s*([A-Z\s]+?(?:HEATER|HVAC|UNIT))[S]?\s*(?:\([^)]+\))?/gi
};

// Financial data patterns
const FINANCIAL_PATTERNS = {
  askingPrice: /(?:asking|price|list)[\s:]*\$?([\d,]+)/gi,
  monthlyRent: /(?:rent|monthly)[\s:]*\$?([\d,]+)/gi,
  grossIncome: /(?:gross|total)[\s\w]*income[\s:]*\$?([\d,]+)/gi,
  expenses: /(?:expense|cost)[\s\w]*[\s:]*\$?([\d,]+)/gi
};

function parseEquipmentFromText(text: string): MachineData[] {
  console.log('🔧 Parsing equipment from text:', text);
  const equipment: MachineData[] = [];
  
  // Parse detailed equipment (washers/dryers with capacity)
  let match;
  while ((match = EQUIPMENT_PATTERNS.detailed.exec(text)) !== null) {
    const [, quantity, capacity, brand, type] = match;
    equipment.push({
      quantity: parseInt(quantity),
      type: type.toLowerCase().includes('washer') ? 'Front-Load Washer' : 'Single Dryer',
      brand: brand.trim(),
      capacity: `${capacity}#`,
      model: ''
    });
  }
  
  // Parse dryer pockets
  while ((match = EQUIPMENT_PATTERNS.pockets.exec(text)) !== null) {
    const [, quantity, capacity, brand] = match;
    equipment.push({
      quantity: parseInt(quantity),
      type: 'Single Dryer',
      brand: brand.trim(),
      capacity: `${capacity}#`,
      model: 'Pocket Style'
    });
  }
  
  // Parse accessories
  while ((match = EQUIPMENT_PATTERNS.accessories.exec(text)) !== null) {
    const [, quantity, itemType] = match;
    equipment.push({
      quantity: parseInt(quantity),
      type: 'Other',
      brand: itemType.trim(),
      capacity: '',
      model: ''
    });
  }
  
  // Parse utilities/equipment
  while ((match = EQUIPMENT_PATTERNS.utilities.exec(text)) !== null) {
    const [, quantity, itemType] = match;
    equipment.push({
      quantity: parseInt(quantity),
      type: 'Other',
      brand: itemType.trim(),
      capacity: '',
      model: ''
    });
  }
  
  console.log('✅ Parsed equipment:', equipment);
  return equipment;
}

function parseFinancialData(text: string): Partial<ExtractedData> {
  const data: Partial<ExtractedData> = {
    propertyInfo: {},
    leaseInfo: {},
    income: { ancillaryIncome: {} },
    expenses: {},
    utilities: {}
  };
  
  // Extract asking price
  const priceMatch = text.match(/\$?([\d,]+)(?:\s*(?:asking|price|list))?/gi);
  if (priceMatch) {
    const price = parseInt(priceMatch[0].replace(/[$,]/g, ''));
    if (price > 10000) { // Reasonable asking price threshold
      data.propertyInfo!.askingPrice = price;
    }
  }
  
  // Extract address patterns
  const addressMatch = text.match(/\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Boulevard|Blvd)/i);
  if (addressMatch) {
    data.propertyInfo!.address = addressMatch[0];
  }
  
  return data;
}

async function scrapeUrl(url: string): Promise<string> {
  const scrapingBeeKey = Deno.env.get('SCRAPINGBEE_API_KEY');
  
  if (!scrapingBeeKey) {
    throw new Error('SCRAPINGBEE_API_KEY is not configured');
  }
  
  console.log('🕷️ Scraping URL:', url);
  
  const params = new URLSearchParams({
    api_key: scrapingBeeKey,
    url: url,
    render_js: 'true',
    premium_proxy: 'true',
    country_code: 'us'
  });
  
  const response = await fetch(`https://app.scrapingbee.com/api/v1/?${params}`, {
    method: 'GET',
    headers: {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
    }
  });
  
  if (!response.ok) {
    throw new Error(`ScrapingBee API error: ${response.status} ${response.statusText}`);
  }
  
  const html = await response.text();
  console.log('✅ Successfully scraped content, length:', html.length);
  
  return html;
}

function extractStructuredData(content: string, extractionType: string): ExtractedData {
  console.log('📊 Extracting structured data, type:', extractionType);
  
  const extractedData: ExtractedData = {};
  
  // Parse equipment data
  const equipment = parseEquipmentFromText(content);
  if (equipment.length > 0) {
    extractedData.equipment = equipment;
  }
  
  // Parse financial data
  const financialData = parseFinancialData(content);
  Object.assign(extractedData, financialData);
  
  // Extract square footage
  const sqftMatch = content.match(/(\d+(?:,\d+)?)\s*(?:sq\.?\s*ft\.?|square\s*feet)/gi);
  if (sqftMatch) {
    const sqft = parseInt(sqftMatch[0].replace(/[,\s]/g, ''));
    extractedData.propertyInfo = extractedData.propertyInfo || {};
    extractedData.propertyInfo.squareFootage = sqft;
  }
  
  console.log('✅ Extracted data:', extractedData);
  return extractedData;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const requestData: ExtractionRequest = await req.json();
    console.log('📥 Received extraction request:', requestData);
    
    let content = '';
    
    if (requestData.extractionType === 'url' && requestData.url) {
      content = await scrapeUrl(requestData.url);
    } else if (requestData.extractionType === 'text' && requestData.rawText) {
      content = requestData.rawText;
    } else {
      throw new Error('Invalid extraction request: missing URL or text data');
    }
    
    const extractedData = extractStructuredData(content, requestData.documentType || 'general');
    
    return new Response(JSON.stringify({
      success: true,
      data: extractedData,
      metadata: {
        extractionType: requestData.extractionType,
        documentType: requestData.documentType,
        contentLength: content.length,
        timestamp: new Date().toISOString()
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('❌ Error in extract-listing-data function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
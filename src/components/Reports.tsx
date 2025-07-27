import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useDeal } from '@/contexts/useDeal';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { calculateMetrics, formatCurrency, formatPercentage } from '@/utils/calculations';
import { calculateTenYearProjection } from '@/utils/projections';
import { FileText, Download, Building, TrendingUp, DollarSign, Calendar, Crown, Lock, Share2, Printer, Mail } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const Reports: React.FC = () => {
  const { deal, leaseDetails, expenseItems, machineInventory, ancillaryIncome, utilityAnalysis } = useDeal();
  const { canPerformAction, trackUsage, getRemainingUsage, subscription, createCheckoutSession } = useSubscription();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [reportSettings, setReportSettings] = useState({
    companyName: '',
    preparedBy: '',
    executiveSummary: '',
    includeProjections: true,
    includeSensitivity: true,
    includeComparables: false,
    logoUrl: '',
    reportTemplate: 'professional',
    includeCharts: true,
    includeRiskAnalysis: true,
    includeMarketData: false,
    includePhotos: false
  });
  
  const [activeTab, setActiveTab] = useState('settings');
  const [generateLoading, setGenerateLoading] = useState<string | null>(null);

  const metrics = calculateMetrics(
    deal, leaseDetails, expenseItems, machineInventory, ancillaryIncome, utilityAnalysis
  );

  const tenYearProjection = deal ? calculateTenYearProjection(
    deal, leaseDetails, expenseItems, machineInventory, ancillaryIncome
  ) : [];

  const generatePDFReport = async (reportType: string) => {
    if (!deal) {
      toast({
        title: "No deal data",
        description: "Please enter deal information first",
        variant: "destructive",
      });
      return;
    }

    if (!canPerformAction('generate_report')) {
      toast({
        title: "Usage limit reached",
        description: `You've reached your report generation limit this month. Upgrade to generate more reports.`,
        variant: "destructive",
      });
      return;
    }

    try {
      setGenerateLoading(reportType);
      
      // Create a temporary div for PDF generation
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '-9999px';
      tempDiv.style.width = '210mm'; // A4 width
      tempDiv.style.background = 'white';
      tempDiv.style.padding = '20mm';
      tempDiv.style.fontFamily = 'Arial, sans-serif';
      tempDiv.innerHTML = generateReportHTML(reportType);
      
      document.body.appendChild(tempDiv);
      
      // Generate PDF using html2canvas and jsPDF
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${deal.dealName.replace(/\s+/g, '_')}_${reportType}_Report.pdf`);
      document.body.removeChild(tempDiv);
      
      await trackUsage('report_generated', deal.dealId, { reportType });
      
      toast({
        title: "PDF generated successfully",
        description: `${reportType} report has been downloaded as PDF.`,
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: "PDF generation failed",
        description: "There was an error generating the PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGenerateLoading(null);
    }
  };

  const generateReportHTML = (reportType: string): string => {
    const baseStyles = `
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; color: #333; line-height: 1.5; }
        .header { text-align: center; border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
        .logo { max-height: 60px; margin-bottom: 15px; }
        .section { margin-bottom: 30px; page-break-inside: avoid; }
        .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 20px 0; }
        .kpi-card { border: 2px solid #e5e7eb; padding: 15px; border-radius: 8px; text-align: center; background: #f9fafb; }
        .table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        .table th, .table td { border: 1px solid #d1d5db; padding: 10px; text-align: left; }
        .table th { background-color: #f3f4f6; font-weight: bold; }
        .highlight { color: #2563eb; font-weight: bold; }
        .success { color: #16a34a; font-weight: bold; }
        .danger { color: #dc2626; font-weight: bold; }
        .chart-placeholder { height: 200px; border: 1px solid #ddd; display: flex; align-items: center; justify-content: center; background: #f9fafb; margin: 15px 0; }
        h1 { color: #1f2937; font-size: 2em; margin-bottom: 10px; }
        h2 { color: #374151; font-size: 1.5em; margin-bottom: 15px; }
        h3 { color: #4b5563; font-size: 1.2em; margin-bottom: 10px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; }
        .executive-summary { background: #f0f9ff; border-left: 4px solid #2563eb; padding: 20px; margin: 20px 0; }
        .risk-matrix { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
        .risk-item { padding: 10px; border-radius: 5px; border-left: 4px solid #fbbf24; background: #fffbeb; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 0.9em; color: #6b7280; }
      </style>
    `;

    const headerSection = `
      <div class="header">
        ${reportSettings.logoUrl ? `<img src="${reportSettings.logoUrl}" alt="Logo" class="logo" />` : ''}
        <h1>${reportType === 'investment' ? 'Investment Analysis Report' : 
             reportType === 'financing' ? 'Bank Financing Package' : 
             reportType === 'comprehensive' ? 'Comprehensive Deal Analysis' :
             'Deal Comparison Report'}</h1>
        <h2>${deal.dealName}</h2>
        <p><strong>Property Address:</strong> ${deal.propertyAddress}</p>
        <p><strong>Report Date:</strong> ${new Date().toLocaleDateString()}</p>
        ${reportSettings.companyName ? `<p><strong>Prepared for:</strong> ${reportSettings.companyName}</p>` : ''}
        ${reportSettings.preparedBy ? `<p><strong>Prepared by:</strong> ${reportSettings.preparedBy}</p>` : ''}
      </div>
    `;

    const executiveSummarySection = `
      <div class="section">
        <h3>Executive Summary</h3>
        <div class="executive-summary">
          ${reportSettings.executiveSummary || generateAIExecutiveSummary()}
        </div>
      </div>
    `;

    const kpiSection = `
      <div class="section">
        <h3>Key Performance Indicators</h3>
        <div class="kpi-grid">
          <div class="kpi-card">
            <h4>Cap Rate</h4>
            <p class="highlight">${formatPercentage(metrics.capRate)}</p>
          </div>
          <div class="kpi-card">
            <h4>Cash-on-Cash ROI</h4>
            <p class="highlight">${formatPercentage(metrics.coCROI)}</p>
          </div>
          <div class="kpi-card">
            <h4>Annual Cash Flow</h4>
            <p class="highlight">${formatCurrency(metrics.annualCashFlow)}</p>
          </div>
          <div class="kpi-card">
            <h4>DSCR</h4>
            <p class="${metrics.dscr >= 1.25 ? 'success' : 'danger'}">${metrics.dscr.toFixed(2)}</p>
          </div>
          <div class="kpi-card">
            <h4>NOI</h4>
            <p class="highlight">${formatCurrency(metrics.noi)}</p>
          </div>
          <div class="kpi-card">
            <h4>Expense Ratio</h4>
            <p class="highlight">${formatPercentage((metrics.totalOperatingExpenses / metrics.totalGrossIncome) * 100)}</p>
          </div>
        </div>
      </div>
    `;

    const financialSection = `
      <div class="section">
        <h3>Financial Analysis</h3>
        <table class="table">
          <tr><th>Item</th><th>Amount</th><th>Notes</th></tr>
          <tr><td>Asking Price</td><td class="highlight">${formatCurrency(deal.askingPrice)}</td><td>Purchase price</td></tr>
          <tr><td>Down Payment</td><td>${formatCurrency(deal.askingPrice * deal.downPaymentPercent / 100)}</td><td>${formatPercentage(deal.downPaymentPercent)} of purchase</td></tr>
          <tr><td>Loan Amount</td><td>${formatCurrency(metrics.loanAmount)}</td><td>${deal.loanTermYears} years @ ${formatPercentage(deal.loanInterestRatePercent)}</td></tr>
          <tr><td>Gross Income</td><td class="highlight">${formatCurrency(metrics.totalGrossIncome)}</td><td>Annual gross revenue</td></tr>
          <tr><td>Operating Expenses</td><td>${formatCurrency(metrics.totalOperatingExpenses)}</td><td>Annual operating costs</td></tr>
          <tr><td>Net Operating Income</td><td class="highlight">${formatCurrency(metrics.noi)}</td><td>After all operating expenses</td></tr>
          <tr><td>Annual Debt Service</td><td>${formatCurrency(metrics.annualDebtService)}</td><td>Loan payments</td></tr>
          <tr><td>Cash Flow Before Tax</td><td class="highlight">${formatCurrency(metrics.annualCashFlow)}</td><td>Available for owner</td></tr>
        </table>
      </div>
    `;

    const projectionSection = reportSettings.includeProjections && tenYearProjection.length > 0 ? `
      <div class="section">
        <h3>10-Year Cash Flow Projection</h3>
        <table class="table">
          <tr>
            <th>Year</th>
            <th>Gross Income</th>
            <th>NOI</th>
            <th>Cash Flow</th>
            <th>CapEx</th>
            <th>ROI</th>
          </tr>
          ${tenYearProjection.slice(0, 10).map((year, index) => `
          <tr>
            <td><strong>${index + 1}</strong></td>
            <td>${formatCurrency(year.grossIncome)}</td>
            <td>${formatCurrency(year.noi)}</td>
            <td class="${year.cashFlow < 0 ? 'danger' : 'success'}">${formatCurrency(year.cashFlow)}</td>
            <td>${formatCurrency(year.capEx)}</td>
            <td>${formatPercentage((year.cashFlow / (deal.askingPrice * deal.downPaymentPercent / 100)) * 100)}</td>
          </tr>
          `).join('')}
        </table>
        ${reportSettings.includeCharts ? '<div class="chart-placeholder">10-Year Projection Chart would appear here</div>' : ''}
      </div>
    ` : '';

    const riskSection = reportSettings.includeRiskAnalysis ? `
      <div class="section">
        <h3>Risk Analysis</h3>
        <div class="risk-matrix">
          <div class="risk-item">
            <h4>Market Risk</h4>
            <p>Local competition and demographic changes</p>
          </div>
          <div class="risk-item">
            <h4>Equipment Risk</h4>
            <p>Aging equipment requires ongoing maintenance</p>
          </div>
          <div class="risk-item">
            <h4>Lease Risk</h4>
            <p>Lease terms and renewal conditions</p>
          </div>
          <div class="risk-item">
            <h4>Financial Risk</h4>
            <p>DSCR of ${metrics.dscr.toFixed(2)} ${metrics.dscr >= 1.25 ? '(Strong)' : '(Requires attention)'}</p>
          </div>
        </div>
      </div>
    ` : '';

    const recommendationSection = `
      <div class="section">
        <h3>Investment Recommendation</h3>
        <p><strong>Overall Assessment:</strong> This investment ${
          metrics.capRate >= (deal.targetCapRatePercent || 8) && metrics.coCROI >= (deal.targetCoCROIPercent || 15) 
            ? '<span class="success">MEETS target criteria</span>' 
            : '<span class="danger">DOES NOT MEET target criteria</span>'
        } based on the financial analysis.</p>
        
        <p><strong>Next Steps:</strong></p>
        <ul>
          <li>Complete comprehensive due diligence</li>
          <li>Verify all financial statements and tax returns</li>
          <li>Inspect all equipment and assess replacement needs</li>
          <li>Review lease terms and renewal options</li>
          <li>Analyze local market conditions and competition</li>
        </ul>
      </div>
    `;

    const footerSection = `
      <div class="footer">
        <p><em>This report is for informational purposes only and should not be considered as financial advice. 
        Please consult with qualified professionals before making investment decisions.</em></p>
        <p>Generated by Laundromat Investment Analyzer on ${new Date().toLocaleDateString()}</p>
      </div>
    `;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${reportType} Report - ${deal.dealName}</title>
        ${baseStyles}
      </head>
      <body>
        ${headerSection}
        ${executiveSummarySection}
        ${kpiSection}
        ${financialSection}
        ${projectionSection}
        ${riskSection}
        ${recommendationSection}
        ${footerSection}
      </body>
      </html>
    `;
  };

  const generateInvestmentSummary = async () => {
    if (!deal) {
      toast({
        title: "No deal data",
        description: "Please enter deal information first",
        variant: "destructive",
      });
      return;
    }

    if (!canPerformAction('generate_report')) {
      toast({
        title: "Usage limit reached",
        description: "You've reached your report generation limit this month. Upgrade to generate more reports.",
        variant: "destructive",
      });
      return;
    }

    await trackUsage('report_generated', deal.dealId, { reportType: 'investment_summary' });

    // This would typically generate a PDF
    // For now, we'll create a downloadable HTML report
    const reportContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Investment Summary - ${deal.dealName}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
        .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
        .section { margin-bottom: 30px; }
        .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 20px 0; }
        .kpi-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; text-align: center; }
        .table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .table th { background-color: #f8f9fa; }
        .highlight { color: #2563eb; font-weight: bold; }
        .danger { color: #dc2626; }
        .success { color: #16a34a; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Laundromat Investment Analysis</h1>
        <h2>${deal.dealName}</h2>
        <p>${deal.propertyAddress}</p>
        <p>Report Date: ${new Date().toLocaleDateString()}</p>
        ${reportSettings.companyName && `<p>Prepared for: ${reportSettings.companyName}</p>`}
        ${reportSettings.preparedBy && `<p>Prepared by: ${reportSettings.preparedBy}</p>`}
    </div>

    <div class="section">
        <h3>Executive Summary</h3>
        ${reportSettings.executiveSummary || 
          `<div>
            <p><strong>Investment Overview:</strong> This analysis evaluates the acquisition of ${deal.dealName} for ${formatCurrency(deal.askingPrice)}.</p>
            <p><strong>Financial Performance:</strong> The property generates an estimated ${formatCurrency(metrics.noi)} in Net Operating Income, resulting in a ${formatPercentage(metrics.capRate)} cap rate and ${formatPercentage(metrics.coCROI)} cash-on-cash return.</p>
            <p><strong>Key Highlights:</strong> ${metrics.dscr >= 1.25 ? 'Strong debt service coverage indicates healthy cash flow.' : 'Debt service coverage may require attention.'} ${metrics.coCROI >= 15 ? 'Excellent cash-on-cash returns exceed typical market expectations.' : 'Returns are moderate and should be carefully evaluated.'}</p>
            <p><strong>Recommendation:</strong> ${metrics.capRate >= (deal.targetCapRatePercent || 8) && metrics.coCROI >= (deal.targetCoCROIPercent || 15) ? 'This investment meets target criteria and appears financially sound.' : 'Consider negotiating purchase price or identifying value-add opportunities to improve returns.'}</p>
          </div>`
        }
    </div>

    <div class="section">
        <h3>Key Performance Indicators</h3>
        <div class="kpi-grid">
            <div class="kpi-card">
                <h4>Cap Rate</h4>
                <p class="highlight">${formatPercentage(metrics.capRate)}</p>
            </div>
            <div class="kpi-card">
                <h4>Cash-on-Cash ROI</h4>
                <p class="highlight">${formatPercentage(metrics.coCROI)}</p>
            </div>
            <div class="kpi-card">
                <h4>Annual Cash Flow</h4>
                <p class="highlight">${formatCurrency(metrics.annualCashFlow)}</p>
            </div>
            <div class="kpi-card">
                <h4>DSCR</h4>
                <p class="${metrics.dscr >= 1.25 ? 'success' : 'danger'}">${metrics.dscr.toFixed(2)}</p>
            </div>
            <div class="kpi-card">
                <h4>Valuation Range</h4>
                <p class="highlight">${formatCurrency(metrics.suggestedValuationLow)} - ${formatCurrency(metrics.suggestedValuationHigh)}</p>
            </div>
            <div class="kpi-card">
                <h4>NOI</h4>
                <p class="highlight">${formatCurrency(metrics.noi)}</p>
            </div>
        </div>
    </div>

    <div class="section">
        <h3>Financial Summary</h3>
        <table class="table">
            <tr><th>Item</th><th>Amount</th></tr>
            <tr><td>Asking Price</td><td>${formatCurrency(deal.askingPrice)}</td></tr>
            <tr><td>Down Payment (${formatPercentage(deal.downPaymentPercent)})</td><td>${formatCurrency(deal.askingPrice * deal.downPaymentPercent / 100)}</td></tr>
            <tr><td>Loan Amount</td><td>${formatCurrency(metrics.loanAmount)}</td></tr>
            <tr><td>Gross Income</td><td>${formatCurrency(metrics.totalGrossIncome)}</td></tr>
            <tr><td>Operating Expenses</td><td>${formatCurrency(metrics.totalOperatingExpenses)}</td></tr>
            <tr><td>Net Operating Income</td><td class="highlight">${formatCurrency(metrics.noi)}</td></tr>
            <tr><td>Annual Debt Service</td><td>${formatCurrency(metrics.annualDebtService)}</td></tr>
            <tr><td>Cash Flow Before Tax</td><td class="highlight">${formatCurrency(metrics.annualCashFlow)}</td></tr>
        </table>
    </div>

    ${reportSettings.includeProjections && tenYearProjection.length > 0 ? `
    <div class="section">
        <h3>10-Year Cash Flow Projection</h3>
        <table class="table">
            <tr>
                <th>Year</th>
                <th>Gross Income</th>
                <th>NOI</th>
                <th>Cash Flow</th>
                <th>CapEx</th>
            </tr>
            ${tenYearProjection.map((year, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${formatCurrency(year.grossIncome)}</td>
                <td>${formatCurrency(year.noi)}</td>
                <td>${formatCurrency(year.cashFlow)}</td>
                <td>${formatCurrency(year.capEx)}</td>
            </tr>
            `).join('')}
        </table>
    </div>` : ''}

    <div class="section">
        <h3>Investment Recommendation</h3>
        <p>Based on the financial analysis, this investment ${
          metrics.capRate >= (deal.targetCapRatePercent || 8) && metrics.coCROI >= (deal.targetCoCROIPercent || 15) 
            ? '<strong class="success">MEETS</strong>' 
            : '<strong class="danger">DOES NOT MEET</strong>'
        } the target investment criteria.</p>
    </div>

    <div class="section">
        <p><em>This report is for informational purposes only and should not be considered as financial advice. 
        Please consult with qualified professionals before making investment decisions.</em></p>
    </div>
</body>
</html>`;

    // Create and download the report
    const blob = new Blob([reportContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${deal.dealName.replace(/\s+/g, '_')}_Investment_Summary.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Report generated",
      description: "Investment summary report has been downloaded.",
    });
  };

  const handleUpgrade = async () => {
    try {
      setCheckoutLoading(true);
      await createCheckoutSession('professional', 'monthly');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start checkout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCheckoutLoading(false);
    }
  };

  const generateAIExecutiveSummary = () => {
    if (!deal) return '';
    
    const strongPoints = [];
    const concerns = [];
    
    if (metrics.capRate >= (deal.targetCapRatePercent || 8)) {
      strongPoints.push(`Strong cap rate of ${formatPercentage(metrics.capRate)} meets investment criteria`);
    } else {
      concerns.push(`Cap rate of ${formatPercentage(metrics.capRate)} below target of ${formatPercentage(deal.targetCapRatePercent || 8)}`);
    }
    
    if (metrics.coCROI >= (deal.targetCoCROIPercent || 15)) {
      strongPoints.push(`Excellent cash-on-cash return of ${formatPercentage(metrics.coCROI)}`);
    } else {
      concerns.push(`Cash-on-cash return of ${formatPercentage(metrics.coCROI)} below target`);
    }
    
    if (metrics.dscr >= 1.25) {
      strongPoints.push(`Healthy debt service coverage ratio of ${metrics.dscr.toFixed(2)}`);
    } else {
      concerns.push(`Debt service coverage ratio of ${metrics.dscr.toFixed(2)} indicates tight cash flow`);
    }
    
    const summary = `
**EXECUTIVE SUMMARY**

**Investment Overview:** This analysis evaluates the acquisition of ${deal.dealName} located at ${deal.propertyAddress} for an asking price of ${formatCurrency(deal.askingPrice)}.

**Financial Performance:** The laundromat generates approximately ${formatCurrency(metrics.totalGrossIncome)} in gross annual income with operating expenses of ${formatCurrency(metrics.totalOperatingExpenses)}, resulting in a net operating income of ${formatCurrency(metrics.noi)}.

**Key Investment Metrics:**
- Cap Rate: ${formatPercentage(metrics.capRate)}
- Cash-on-Cash ROI: ${formatPercentage(metrics.coCROI)}
- Annual Cash Flow: ${formatCurrency(metrics.annualCashFlow)}
- DSCR: ${metrics.dscr.toFixed(2)}

**Investment Strengths:**
${strongPoints.map(point => `• ${point}`).join('\n')}

${concerns.length > 0 ? `**Areas of Concern:**
${concerns.map(concern => `• ${concern}`).join('\n')}` : ''}

**Recommendation:** ${
  strongPoints.length > concerns.length 
    ? 'This investment demonstrates solid fundamentals and meets key investment criteria. Recommend proceeding with due diligence.'
    : 'This investment has mixed performance indicators. Consider negotiating purchase price or identifying value-add opportunities before proceeding.'
}

**Next Steps:** Complete comprehensive due diligence including equipment inspection, lease review, financial verification, and market analysis before finalizing investment decision.
    `;
    
    return summary.trim();
  };

  const generateBankFinancingReport = async () => {
    if (!deal) {
      toast({
        title: "No deal data",
        description: "Please enter deal information first",
        variant: "destructive",
      });
      return;
    }

    if (!canPerformAction('generate_report')) {
      toast({
        title: "Usage limit reached",
        description: "You've reached your report generation limit this month. Upgrade to generate more reports.",
        variant: "destructive",
      });
      return;
    }

    await trackUsage('report_generated', deal.dealId, { reportType: 'bank_financing' });

    const reportContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Bank Financing Package - ${deal.dealName}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; color: #333; line-height: 1.4; }
        .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
        .section { margin-bottom: 25px; }
        .table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .table th { background-color: #f8f9fa; font-weight: bold; }
        .highlight { color: #2563eb; font-weight: bold; }
        .success { color: #16a34a; font-weight: bold; }
        .key-metric { font-size: 1.2em; font-weight: bold; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Financing Package</h1>
        <h2>${deal.dealName}</h2>
        <p>Business Acquisition Loan Application</p>
        <p>Report Date: ${new Date().toLocaleDateString()}</p>
    </div>

    <div class="section">
        <h3>Executive Summary</h3>
        <p>This financing package supports the acquisition of ${deal.dealName}, an established laundromat business 
        located at ${deal.propertyAddress}. The business generates strong cash flow with a proven operating history.</p>
        
        <div class="key-metric">
            <p>DSCR: <span class="${metrics.dscr >= 1.25 ? 'success' : 'highlight'}">${metrics.dscr.toFixed(2)}</span></p>
            <p>Debt Coverage: <span class="success">${metrics.dscr >= 1.25 ? 'STRONG' : 'ADEQUATE'}</span></p>
        </div>
    </div>

    <div class="section">
        <h3>Loan Request Summary</h3>
        <table class="table">
            <tr><th>Item</th><th>Amount</th></tr>
            <tr><td>Total Asking Price</td><td class="highlight">${formatCurrency(deal.askingPrice)}</td></tr>
            <tr><td>Down Payment (${formatPercentage(deal.downPaymentPercent)})</td><td>${formatCurrency(deal.askingPrice * deal.downPaymentPercent / 100)}</td></tr>
            <tr><td>Requested Loan Amount</td><td class="highlight">${formatCurrency(metrics.loanAmount)}</td></tr>
            <tr><td>Loan-to-Value Ratio</td><td>${formatPercentage(100 - deal.downPaymentPercent)}</td></tr>
        </table>
    </div>

    <div class="section">
        <h3>Cash Flow Analysis</h3>
        <table class="table">
            <tr><th>Income/Expense Item</th><th>Annual Amount</th></tr>
            <tr><td><strong>Gross Income</strong></td><td class="highlight">${formatCurrency(metrics.totalGrossIncome)}</td></tr>
            <tr><td>Less: Operating Expenses</td><td>(${formatCurrency(metrics.totalOperatingExpenses)})</td></tr>
            <tr><td><strong>Net Operating Income</strong></td><td class="highlight">${formatCurrency(metrics.noi)}</td></tr>
            <tr><td>Less: Proposed Debt Service</td><td>(${formatCurrency(metrics.annualDebtService)})</td></tr>
            <tr><td><strong>Cash Flow Before Tax</strong></td><td class="highlight">${formatCurrency(metrics.annualCashFlow)}</td></tr>
        </table>
    </div>

    <div class="section">
        <h3>Debt Service Coverage Analysis</h3>
        <p class="key-metric">
            Debt Service Coverage Ratio: <span class="${metrics.dscr >= 1.25 ? 'success' : 'highlight'}">${metrics.dscr.toFixed(2)}x</span>
        </p>
        <p>The business generates <strong>${formatCurrency(metrics.noi)}</strong> in Net Operating Income annually, 
        providing <strong>${metrics.dscr.toFixed(2)}x</strong> coverage of the proposed debt service of 
        <strong>${formatCurrency(metrics.annualDebtService)}</strong>.</p>
        
        ${metrics.dscr >= 1.25 
          ? '<p class="success">✓ Exceeds typical lender requirement of 1.25x DSCR</p>'
          : '<p style="color: #dc2626;">⚠ Below typical lender requirement of 1.25x DSCR</p>'
        }
    </div>

    <div class="section">
        <h3>Business Overview</h3>
        <table class="table">
            <tr><th>Property Details</th><th>Information</th></tr>
            <tr><td>Address</td><td>${deal.propertyAddress}</td></tr>
            <tr><td>Facility Size</td><td>${deal.facilitySizeSqft?.toLocaleString() || 'N/A'} sq ft</td></tr>
            <tr><td>Real Estate Included</td><td>${deal.isRealEstateIncluded ? 'Yes' : 'No'}</td></tr>
            <tr><td>Equipment Count</td><td>${machineInventory.length} machines</td></tr>
        </table>
    </div>

    <div class="section">
        <h3>Loan Terms Requested</h3>
        <table class="table">
            <tr><th>Term</th><th>Details</th></tr>
            <tr><td>Interest Rate</td><td>${formatPercentage(deal.loanInterestRatePercent)}</td></tr>
            <tr><td>Loan Term</td><td>${deal.loanTermYears} years</td></tr>
            <tr><td>Monthly Payment</td><td>${formatCurrency(metrics.annualDebtService / 12)}</td></tr>
            <tr><td>Annual Debt Service</td><td>${formatCurrency(metrics.annualDebtService)}</td></tr>
        </table>
    </div>

    <div class="section">
        <h3>Risk Assessment</h3>
        <ul>
            <li><strong>Industry:</strong> Laundromat businesses typically have stable, recession-resistant cash flows</li>
            <li><strong>Location:</strong> ${deal.propertyAddress} provides established customer base</li>
            <li><strong>Equipment:</strong> ${machineInventory.length} machines with mixed age profile</li>
            <li><strong>Lease:</strong> ${leaseDetails ? `${leaseDetails.remainingLeaseTermYears + (leaseDetails.renewalOptionsCount * leaseDetails.renewalOptionLengthYears)} years total term` : 'Under review'}</li>
        </ul>
    </div>

    <div class="section">
        <h3>Recommendation</h3>
        <p>This loan request presents a ${metrics.dscr >= 1.25 ? 'low to moderate' : 'moderate to high'} risk profile 
        with ${metrics.dscr >= 1.25 ? 'strong' : 'adequate'} debt service coverage. The established business model 
        and stable cash flow characteristics support the requested financing.</p>
    </div>

    <div class="section">
        <p><em>This financing package is submitted for lender review and underwriting. 
        All financial projections are estimates based on available information.</em></p>
    </div>
</body>
</html>`;

    const blob = new Blob([reportContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${deal.dealName.replace(/\s+/g, '_')}_Bank_Financing_Package.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Report generated",
      description: "Bank financing package has been downloaded.",
    });
  };

  const handleUpgradeClick = async () => {
    try {
      setCheckoutLoading(true);
      await createCheckoutSession('professional', 'monthly');
      toast({
        title: "Redirecting to checkout",
        description: "You'll be redirected to upgrade your subscription.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start checkout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCheckoutLoading(false);
    }
  };

  const remainingReports = getRemainingUsage('reports_per_month');
  const isFreeTier = subscription?.subscription_tier === 'free';
  const canGeneratePDF = subscription?.subscription_tier !== 'free';

  return (
    <div className="space-y-6">
      {/* Usage Alert for Free Tier */}
      {isFreeTier && (
        <Alert className="border-warning">
          <Crown className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              Reports remaining this month: <strong>{remainingReports}</strong>
              {remainingReports === 0 && " - Upgrade for unlimited reports"}
            </span>
            {remainingReports <= 1 && (
              <Button 
                size="sm" 
                onClick={handleUpgradeClick}
                disabled={checkoutLoading}
              >
                {checkoutLoading ? 'Processing...' : 'Upgrade'}
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

      <div>
        <h2 className="text-3xl font-bold">Reports</h2>
        <p className="text-muted-foreground">Generate professional investment and financing reports</p>
      </div>

      {!deal && (
        <Card className="border-dashed border-2 border-muted">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">No Deal Data</h3>
              <p className="text-muted-foreground mb-4">
                Enter deal information first to generate reports.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {deal && (
        <>
          {/* Report Settings */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle>Report Configuration</CardTitle>
              <p className="text-sm text-muted-foreground">
                Customize your professional reports and analysis
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyName">Company/Investor Name</Label>
                  <Input
                    id="companyName"
                    value={reportSettings.companyName}
                    onChange={(e) => setReportSettings(prev => ({ ...prev, companyName: e.target.value }))}
                    placeholder="Your company name"
                  />
                </div>
                <div>
                  <Label htmlFor="preparedBy">Prepared By</Label>
                  <Input
                    id="preparedBy"
                    value={reportSettings.preparedBy}
                    onChange={(e) => setReportSettings(prev => ({ ...prev, preparedBy: e.target.value }))}
                    placeholder="Your name"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="executiveSummary">Executive Summary (Optional)</Label>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setReportSettings(prev => ({ ...prev, executiveSummary: generateAIExecutiveSummary() }))}
                    variant="outline"
                    size="sm"
                    className="flex-shrink-0"
                  >
                    Generate AI Summary
                  </Button>
                </div>
                <Textarea
                  id="executiveSummary"
                  value={reportSettings.executiveSummary}
                  onChange={(e) => setReportSettings(prev => ({ ...prev, executiveSummary: e.target.value }))}
                  placeholder="Add a custom executive summary for your reports..."
                  rows={6}
                />
              </div>
            </CardContent>
          </Card>

          {/* Report Generation */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-card hover:shadow-elegant transition-smooth">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-primary rounded-lg">
                    <FileText className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <CardTitle>Investment Summary Report</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Comprehensive analysis for investors and stakeholders
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Includes:</span>
                  </div>
                  <ul className="text-sm space-y-1 text-muted-foreground ml-4">
                    <li>• Executive summary and key metrics</li>
                    <li>• Financial analysis and projections</li>
                    <li>• Investment recommendation</li>
                    <li>• 10-year cash flow forecast</li>
                    <li>• Valuation analysis</li>
                  </ul>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span>Cap Rate: {formatPercentage(metrics.capRate)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-success" />
                    <span>Cash Flow: {formatCurrency(metrics.annualCashFlow)}</span>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    onClick={generateInvestmentSummary}
                    disabled={!canPerformAction('generate_report')}
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Generate Report
                  </Button>
                  {!canGeneratePDF && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      HTML Only
                    </Badge>
                  )}
                  {canGeneratePDF && (
                    <Badge variant="default" className="flex items-center gap-1">
                      <Crown className="w-3 h-3" />
                      PDF Available
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-elegant transition-smooth">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-primary rounded-lg">
                    <Building className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <CardTitle>Bank Financing Package</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Lender-focused report for loan applications
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Includes:</span>
                  </div>
                  <ul className="text-sm space-y-1 text-muted-foreground ml-4">
                    <li>• Executive summary</li>
                    <li>• Debt service coverage analysis</li>
                    <li>• Cash flow projections</li>
                    <li>• Business overview</li>
                    <li>• Risk assessment</li>
                  </ul>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Badge variant={metrics.dscr >= 1.25 ? "default" : "destructive"} className="text-xs">
                      DSCR: {metrics.dscr.toFixed(2)}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>Loan: {formatCurrency(metrics.loanAmount)}</span>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    onClick={generateBankFinancingReport}
                    disabled={!canPerformAction('generate_report')}
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Generate Package
                  </Button>
                  {!canGeneratePDF && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      HTML Only
                    </Badge>
                  )}
                  {canGeneratePDF && (
                    <Badge variant="default" className="flex items-center gap-1">
                      <Crown className="w-3 h-3" />
                      PDF Available
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Report Preview */}
          {deal && (
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Report Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-subtle rounded-lg">
                    <h4 className="font-semibold mb-2">Deal Overview</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Property</p>
                        <p className="font-medium">{deal.dealName}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Asking Price</p>
                        <p className="font-medium">{formatCurrency(deal.askingPrice)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Report Date</p>
                        <p className="font-medium">{new Date().toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="p-3 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Cap Rate</p>
                      <p className="text-lg font-bold text-primary">{formatPercentage(metrics.capRate)}</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <p className="text-sm text-muted-foreground">CoC ROI</p>
                      <p className="text-lg font-bold text-primary">{formatPercentage(metrics.coCROI)}</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Cash Flow</p>
                      <p className="text-lg font-bold text-primary">{formatCurrency(metrics.annualCashFlow)}</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <p className="text-sm text-muted-foreground">DSCR</p>
                      <p className={`text-lg font-bold ${metrics.dscr >= 1.25 ? 'text-success' : 'text-warning'}`}>
                        {metrics.dscr.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};
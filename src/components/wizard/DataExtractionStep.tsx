import { DataExtractionForm } from "@/components/DataExtractionForm";

export const DataExtractionStep = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Import Deal Data</h2>
        <p className="text-muted-foreground mt-2">
          Upload documents, paste URLs, or enter raw data to automatically populate your deal information.
        </p>
      </div>
      
      <DataExtractionForm />
      
      <div className="bg-muted/50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Supported Data Sources</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Real estate listing websites (LoopNet, CREXi, etc.)</li>
          <li>• Equipment inventory lists with format: "5 - 50# SPEED QUEEN WASHERS"</li>
          <li>• Financial statements and P&L documents</li>
          <li>• Lease agreements and property information</li>
          <li>• Raw text data from any source</li>
        </ul>
      </div>
    </div>
  );
};
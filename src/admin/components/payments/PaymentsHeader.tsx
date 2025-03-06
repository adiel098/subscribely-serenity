
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface PaymentsHeaderProps {
  onExportReport: () => void;
}

export const PaymentsHeader = ({ onExportReport }: PaymentsHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
        <p className="text-muted-foreground">
          Manage and track all platform payments 💰
        </p>
      </div>
      <Button 
        className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2"
        onClick={onExportReport}
      >
        <Download className="h-4 w-4" />
        Export Report
      </Button>
    </div>
  );
};

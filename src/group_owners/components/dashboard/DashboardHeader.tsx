
import { ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { BarChart2, Users, Calendar, LayoutDashboard } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface DashboardHeaderProps {
  timeRange: string;
  setTimeRange: (timeRange: string) => void;
  timeRangeLabel: string;
  isProject?: boolean;
}

export const DashboardHeader = ({
  timeRange,
  setTimeRange,
  timeRangeLabel,
  isProject = false
}: DashboardHeaderProps) => {
  const navigate = useNavigate();

  const handleTimeRangeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTimeRange(e.target.value);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div className="bg-gradient-to-r from-blue-100 to-blue-50 rounded-lg p-2 shadow-sm">
            {isProject ? (
              <LayoutDashboard className="h-5 w-5 text-blue-600" />
            ) : (
              <BarChart2 className="h-5 w-5 text-blue-600" />
            )}
          </div>
          <h1 className="text-xl font-semibold">
            {isProject ? "Project Dashboard" : "Community Dashboard"}
          </h1>
        </div>
        
        <div className="flex-1 space-y-1">
          <RadioGroup
            defaultValue={timeRange}
            className="flex flex-wrap gap-1"
            onValueChange={setTimeRange}
          >
            <div className="flex items-center space-x-2 rounded-md border border-slate-200 px-3 py-1.5 bg-white shadow-sm">
              <RadioGroupItem value="7days" id="7days" />
              <Label htmlFor="7days" className="text-xs cursor-pointer">
                7 days
              </Label>
            </div>
            <div className="flex items-center space-x-2 rounded-md border border-slate-200 px-3 py-1.5 bg-white shadow-sm">
              <RadioGroupItem value="30days" id="30days" />
              <Label htmlFor="30days" className="text-xs cursor-pointer">
                30 days
              </Label>
            </div>
            <div className="flex items-center space-x-2 rounded-md border border-slate-200 px-3 py-1.5 bg-white shadow-sm">
              <RadioGroupItem value="90days" id="90days" />
              <Label htmlFor="90days" className="text-xs cursor-pointer">
                90 days
              </Label>
            </div>
            <div className="flex items-center space-x-2 rounded-md border border-slate-200 px-3 py-1.5 bg-white shadow-sm">
              <RadioGroupItem value="year" id="year" />
              <Label htmlFor="year" className="text-xs cursor-pointer">
                Year
              </Label>
            </div>
            <div className="flex items-center space-x-2 rounded-md border border-slate-200 px-3 py-1.5 bg-white shadow-sm">
              <RadioGroupItem value="all" id="all" />
              <Label htmlFor="all" className="text-xs cursor-pointer">
                All time
              </Label>
            </div>
          </RadioGroup>
          <p className="text-xs text-slate-500 pl-1">
            Showing data for the last {timeRangeLabel}
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1.5 shadow-sm bg-white"
          onClick={() => navigate("/subscribers")}
        >
          <Users className="w-4 h-4" />
          <span>View Subscribers</span>
        </Button>
      </div>
    </div>
  );
};


import { format, addDays } from "date-fns";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface DurationSelectorProps {
  durationType: "1m" | "3m" | "6m" | "1y" | "custom";
  onDurationChange: (value: "1m" | "3m" | "6m" | "1y" | "custom") => void;
  onCustomDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  endDate: Date;
}

export const DurationSelector = ({
  durationType,
  onDurationChange,
  onCustomDateChange,
  endDate
}: DurationSelectorProps) => {
  return (
    <div className="space-y-3">
      <Label>Subscription Duration</Label>
      <RadioGroup 
        value={durationType} 
        onValueChange={(val) => onDurationChange(val as "1m" | "3m" | "6m" | "1y" | "custom")}
        className="grid grid-cols-5 gap-3"
      >
        <div>
          <RadioGroupItem value="1m" id="duration-1m" className="peer sr-only" />
          <Label
            htmlFor="duration-1m"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
          >
            <span className="text-xs font-medium">1 Month</span>
          </Label>
        </div>
        <div>
          <RadioGroupItem value="3m" id="duration-3m" className="peer sr-only" />
          <Label
            htmlFor="duration-3m"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
          >
            <span className="text-xs font-medium">3 Months</span>
          </Label>
        </div>
        <div>
          <RadioGroupItem value="6m" id="duration-6m" className="peer sr-only" />
          <Label
            htmlFor="duration-6m"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
          >
            <span className="text-xs font-medium">6 Months</span>
          </Label>
        </div>
        <div>
          <RadioGroupItem value="1y" id="duration-1y" className="peer sr-only" />
          <Label
            htmlFor="duration-1y"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
          >
            <span className="text-xs font-medium">1 Year</span>
          </Label>
        </div>
        <div>
          <RadioGroupItem value="custom" id="duration-custom" className="peer sr-only" />
          <Label
            htmlFor="duration-custom"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
          >
            <span className="text-xs font-medium">Custom</span>
          </Label>
        </div>
      </RadioGroup>
      
      {durationType === "custom" && (
        <div className="pt-2">
          <Label htmlFor="custom-date">End Date</Label>
          <input
            type="date"
            id="custom-date"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            min={format(addDays(new Date(), 1), "yyyy-MM-dd")}
            value={format(endDate, "yyyy-MM-dd")}
            onChange={onCustomDateChange}
          />
        </div>
      )}
    </div>
  );
};

import { format, addDays } from "date-fns";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DurationSelectorProps {
  durationType: string;
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
  const isMobile = useIsMobile();

  const durations = [
    { value: "1m", label: isMobile ? "1M" : "1 Month" },
    { value: "3m", label: isMobile ? "3M" : "3 Months" },
    { value: "6m", label: isMobile ? "6M" : "6 Months" },
    { value: "1y", label: isMobile ? "1Y" : "1 Year" },
    { value: "custom", label: "Custom" }
  ];
  
  const selectedDuration = durations.find(d => d.value === durationType);
  
  return (
    <div className={isMobile ? 'space-y-2' : 'space-y-3'}>
      <Label className={isMobile ? 'text-xs' : ''}>Subscription Duration</Label>
      <Select value={durationType} onValueChange={(value) => onDurationChange(value as "1m" | "3m" | "6m" | "1y" | "custom")}>
        <SelectTrigger className={isMobile ? 'h-8 text-xs' : ''}>
          <SelectValue placeholder="Select duration">
            {selectedDuration?.label || 'Select duration'}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {durations.map(({ value, label }) => (
            <SelectItem 
              key={value} 
              value={value}
              className={isMobile ? 'text-xs h-8' : ''}
            >
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {durationType === "custom" && (
        <div className={`mt-2 ${isMobile ? 'text-xs' : ''}`}>
          <Label className={isMobile ? 'text-xs' : ''}>End Date</Label>
          <Input 
            type="date" 
            value={format(endDate, "yyyy-MM-dd")} 
            onChange={onCustomDateChange}
            className={isMobile ? 'h-8 text-xs mt-1' : 'mt-2'}
          />
        </div>
      )}
    </div>
  );
};

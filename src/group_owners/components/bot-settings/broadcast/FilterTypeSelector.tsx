
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterTypeSelectorProps {
  filterType: "all" | "active" | "expired" | "plan";
  setFilterType: (value: "all" | "active" | "expired" | "plan") => void;
  plans?: any[];
  selectedPlanId: string;
  setSelectedPlanId: (value: string) => void;
}

export const FilterTypeSelector = ({
  filterType,
  setFilterType,
  plans,
  selectedPlanId,
  setSelectedPlanId,
}: FilterTypeSelectorProps) => {
  return (
    <div className="space-y-2">
      <Select
        value={filterType}
        onValueChange={(value: "all" | "active" | "expired" | "plan") => {
          setFilterType(value);
          if (value !== 'plan') {
            setSelectedPlanId("");
          }
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select recipients" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Members</SelectItem>
          <SelectItem value="active">Active Subscribers</SelectItem>
          <SelectItem value="expired">Expired Subscribers</SelectItem>
          <SelectItem value="plan">Specific Plan</SelectItem>
        </SelectContent>
      </Select>

      {filterType === 'plan' && plans && (
        <Select
          value={selectedPlanId}
          onValueChange={setSelectedPlanId}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select subscription plan" />
          </SelectTrigger>
          <SelectContent>
            {plans.map((plan) => (
              <SelectItem key={plan.id} value={plan.id}>
                {plan.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
};

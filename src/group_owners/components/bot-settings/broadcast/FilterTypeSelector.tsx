
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useState } from "react";

type FilterType = 'all' | 'active' | 'expired' | 'plan';

interface SubscriptionPlan {
  id: string;
  name: string;
}

interface FilterTypeSelectorProps {
  value: FilterType;
  onChange: (value: FilterType) => void;
  entityId: string;
  entityType: 'community' | 'group';
}

export const FilterTypeSelector = ({ value, onChange, entityId, entityType }: FilterTypeSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | undefined>();

  const { data: plans, isLoading } = useQuery({
    queryKey: ['subscription-plans', entityId],
    queryFn: async () => {
      const query = supabase
        .from('subscription_plans')
        .select('id, name')
        .eq('is_active', true);
        
      if (entityType === 'community') {
        query.eq('community_id', entityId);
      } else {
        // For groups, we need to find the community they belong to
        const { data: group } = await supabase
          .from('community_groups')
          .select('id, community_members(community_id)')
          .eq('id', entityId)
          .single();
        
        if (group?.community_members?.[0]?.community_id) {
          query.eq('community_id', group.community_members[0].community_id);
        }
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching subscription plans:', error);
        return [];
      }
      
      return data || [];
    },
    enabled: Boolean(entityId),
  });

  // Labels for filter types
  const filterTypeLabels: Record<FilterType, string> = {
    all: 'All Subscribers',
    active: 'Active Subscriptions Only',
    expired: 'Expired Subscriptions Only',
    plan: selectedPlanId 
      ? `Plan: ${plans?.find(p => p.id === selectedPlanId)?.name || 'Selected Plan'}`
      : 'Select a Plan',
  };

  // Handle filter type change
  const handleFilterChange = (newType: FilterType, planId?: string) => {
    onChange(newType);
    if (newType === 'plan' && planId) {
      setSelectedPlanId(planId);
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {filterTypeLabels[value]}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search filter type..." />
          <CommandEmpty>No filter type found.</CommandEmpty>
          <CommandGroup>
            <CommandItem
              value="all"
              onSelect={() => handleFilterChange('all')}
              className={cn(
                "cursor-pointer",
                value === 'all' && "bg-primary/10"
              )}
            >
              <Check
                className={cn(
                  "mr-2 h-4 w-4",
                  value === 'all' ? "opacity-100" : "opacity-0"
                )}
              />
              All Subscribers
            </CommandItem>
            <CommandItem
              value="active"
              onSelect={() => handleFilterChange('active')}
              className={cn(
                "cursor-pointer",
                value === 'active' && "bg-primary/10"
              )}
            >
              <Check
                className={cn(
                  "mr-2 h-4 w-4",
                  value === 'active' ? "opacity-100" : "opacity-0"
                )}
              />
              Active Subscriptions Only
            </CommandItem>
            <CommandItem
              value="expired"
              onSelect={() => handleFilterChange('expired')}
              className={cn(
                "cursor-pointer",
                value === 'expired' && "bg-primary/10"
              )}
            >
              <Check
                className={cn(
                  "mr-2 h-4 w-4",
                  value === 'expired' ? "opacity-100" : "opacity-0"
                )}
              />
              Expired Subscriptions Only
            </CommandItem>
          </CommandGroup>
          
          {plans && plans.length > 0 && (
            <CommandGroup heading="Specific Plan">
              {plans.map((plan) => (
                <CommandItem
                  key={plan.id}
                  value={`plan-${plan.id}`}
                  onSelect={() => handleFilterChange('plan', plan.id)}
                  className={cn(
                    "cursor-pointer",
                    value === 'plan' && selectedPlanId === plan.id && "bg-primary/10"
                  )}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === 'plan' && selectedPlanId === plan.id
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {plan.name}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
};

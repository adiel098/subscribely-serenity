
import { useCommunityContext } from "@/contexts/CommunityContext";
import { useCommunityRequirements } from "@/group_owners/hooks/useCommunityRequirements";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export const CommunityRequirementsBanner = () => {
  const { selectedCommunityId, selectedProjectId } = useCommunityContext();
  const { hasActivePlan, hasActivePaymentMethod } = useCommunityRequirements(selectedCommunityId);
  
  // Don't show for projects or if everything is set up
  if (selectedProjectId || (hasActivePlan && hasActivePaymentMethod)) {
    return null;
  }

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg px-3 py-1.5 flex items-center gap-1.5 shadow-sm"
    >
      <Sparkles className="h-3.5 w-3.5 text-amber-500" />
      {!hasActivePlan && !hasActivePaymentMethod && (
        <span className="text-xs text-amber-700 font-medium">
          Set up plans and payment methods!
        </span>
      )}
      {!hasActivePlan && hasActivePaymentMethod && (
        <span className="text-xs text-amber-700 font-medium">
          Add subscription plans!
        </span>
      )}
      {hasActivePlan && !hasActivePaymentMethod && (
        <span className="text-xs text-amber-700 font-medium">
          Add payment methods!
        </span>
      )}
    </motion.div>
  );
};

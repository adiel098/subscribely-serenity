
import { motion } from "framer-motion";
import { Shield, Lock } from "lucide-react";

interface SecurityBadgeProps {
  type: "stripe" | "paypal" | "crypto";
}

export const SecurityBadge = ({ type }: SecurityBadgeProps) => {
  const getColors = () => {
    switch (type) {
      case "stripe":
        return {
          bg: "bg-gradient-to-r from-indigo-50 to-purple-50",
          border: "border-indigo-200",
          text: "text-indigo-700"
        };
      case "paypal":
        return {
          bg: "bg-gradient-to-r from-blue-50 to-cyan-50",
          border: "border-blue-200",
          text: "text-blue-700"
        };
      case "crypto":
        return {
          bg: "bg-gradient-to-r from-amber-50 to-yellow-50",
          border: "border-amber-200",
          text: "text-amber-700"
        };
      default:
        return {
          bg: "bg-gradient-to-r from-gray-50 to-slate-50",
          border: "border-gray-200",
          text: "text-gray-700"
        };
    }
  };

  const colors = getColors();

  return (
    <motion.div
      className={`px-3 py-2 rounded-lg ${colors.bg} border ${colors.border} flex items-center gap-2 shadow-sm`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={`rounded-full p-1 bg-white/80 ${colors.text}`}>
        {type === "stripe" ? (
          <Lock className="h-3.5 w-3.5" />
        ) : (
          <Shield className="h-3.5 w-3.5" />
        )}
      </div>
      <span className={`text-xs font-medium ${colors.text}`}>
        {type === "stripe" && "Secure payments"}
        {type === "paypal" && "Buyer protection"}
        {type === "crypto" && "Decentralized security"}
      </span>
    </motion.div>
  );
};

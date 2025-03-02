
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";

interface EmailInputProps {
  email: string;
  setEmail: (email: string) => void;
  error: string | null;
}

export const EmailInput: React.FC<EmailInputProps> = ({ email, setEmail, error }) => {
  const inputVariants = {
    focus: { scale: 1.02, boxShadow: "0 0 0 2px rgba(124, 58, 237, 0.2)" },
    tap: { scale: 0.98 }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="email" className="text-gray-700">Email address</Label>
      <motion.div
        whileFocus="focus"
        whileTap="tap"
        variants={inputVariants}
      >
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={`w-full border-purple-200 focus:border-purple-500 focus:ring-purple-500/20 ${error ? 'border-red-300' : ''}`}
        />
      </motion.div>
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
};

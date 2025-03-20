
import React from "react";
import { motion } from "framer-motion";

export const MembifySettingsHeader = () => {
  return (
    <header className="mb-6">
      <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-500 text-transparent bg-clip-text">
        Membify Settings
      </h1>
      <p className="text-gray-600 mt-1">
        Configure your Membify platform settings and preferences
      </p>
    </header>
  );
};

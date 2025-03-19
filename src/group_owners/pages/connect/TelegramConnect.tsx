
import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useTelegramConnect } from "@/group_owners/hooks/connect/useTelegramConnect";
import { TelegramConnectHeader } from "@/group_owners/components/connect/TelegramConnectHeader";
import { TelegramStepOne } from "@/group_owners/components/connect/TelegramStepOne";
import { TelegramStepTwo } from "@/group_owners/components/connect/TelegramStepTwo";
import { TelegramStepThree } from "@/group_owners/components/connect/TelegramStepThree";
import { TelegramSuccessDialog } from "@/group_owners/components/connect/TelegramSuccessDialog";

const TelegramConnect = () => {
  const {
    isVerifying,
    verificationCode,
    showSuccessDialog,
    setShowSuccessDialog,
    copyToClipboard,
    verifyConnection,
    goBack
  } = useTelegramConnect();

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-blue-50 to-indigo-50 flex justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl">
        <TelegramConnectHeader />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Button 
            onClick={goBack} 
            variant="outline" 
            className="mb-4 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 flex items-center gap-2 transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Button>
          
          <Card className="p-8 bg-white/90 backdrop-blur-sm shadow-xl border border-indigo-100 rounded-xl overflow-hidden">
            <div className="space-y-10">
              <TelegramStepOne />
              <TelegramStepTwo 
                verificationCode={verificationCode}
                copyToClipboard={copyToClipboard}
              />
              <TelegramStepThree 
                isVerifying={isVerifying}
                verifyConnection={verifyConnection}
              />
            </div>
          </Card>
        </motion.div>
      </div>

      <TelegramSuccessDialog 
        showSuccessDialog={showSuccessDialog}
        setShowSuccessDialog={setShowSuccessDialog}
      />
    </div>
  );
};

export default TelegramConnect;

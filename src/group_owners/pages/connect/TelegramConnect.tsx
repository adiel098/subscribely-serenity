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
    <div className="min-h-screen w-full bg-gradient-to-b from-blue-50 to-indigo-50 py-4 md:py-12 px-3 md:px-6 lg:px-8">
      <div className="w-full max-w-4xl mx-auto relative">
        {/* Back Button - Positioned at the top */}
        <Button 
          onClick={goBack} 
          variant="ghost" 
          size="sm"
          className="absolute -top-2 left-0 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50/80 h-8 md:h-9 text-xs md:text-sm flex items-center gap-1 md:gap-1.5 px-2 md:px-3 backdrop-blur-sm"
        >
          <ArrowLeft className="h-3.5 w-3.5 md:h-4 md:w-4" />
          Back
        </Button>

        <TelegramConnectHeader />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="p-4 md:p-8 bg-white/90 backdrop-blur-sm shadow-md md:shadow-xl border border-indigo-100 rounded-xl overflow-hidden">
            <div className="space-y-6 md:space-y-10">
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

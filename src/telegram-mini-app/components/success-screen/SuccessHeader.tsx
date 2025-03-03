
import { Check, PartyPopper } from "lucide-react";

export const SuccessHeader = () => {
  return (
    <>
      <div className="relative">
        <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center shadow-sm">
          <Check className="w-10 h-10 text-green-600" />
        </div>
        <div className="absolute -top-2 -right-2">
          <PartyPopper className="w-8 h-8 text-primary" />
        </div>
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
        Payment Successful! 🎉
      </h2>
      
      <div className="space-y-2 max-w-sm">
        <p className="text-gray-600">
          Your payment has been processed successfully. You can now join the community.
        </p>
        <p className="text-sm text-gray-500">
          A confirmation has been sent to your Telegram account.
        </p>
      </div>
    </>
  );
};

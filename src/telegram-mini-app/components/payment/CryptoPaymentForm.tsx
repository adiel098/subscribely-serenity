
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import QRCode from "react-qr-code";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface CryptoPaymentFormProps {
  communityId: string;
  onSuccess: () => void;
  price: number;
  telegramUserId?: string;
  telegramUsername?: string;
  firstName?: string;
  lastName?: string;
  planId?: string;
  inviteLink?: string;
}

export default function CryptoPaymentForm({
  communityId,
  onSuccess,
  price,
  telegramUserId,
  telegramUsername,
  firstName,
  lastName,
  planId,
  inviteLink
}: CryptoPaymentFormProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cryptoConfig, setCryptoConfig] = useState<any>(null);
  const [transactionData, setTransactionData] = useState<any>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<string>("BTC");
  const [isProcessing, setIsProcessing] = useState(false);

  // Load crypto payment configuration
  useEffect(() => {
    const loadCryptoConfig = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log("[CryptoPaymentForm] Loading crypto configuration for community:", communityId);
        
        // Fetch the crypto payment method for this community
        const { data, error } = await supabase.rpc(
          "get_available_payment_methods",
          { community_id_param: communityId }
        );
        
        if (error) throw error;
        
        const cryptoMethod = data.find((method) => method.provider === "crypto" && method.is_active);
        
        if (!cryptoMethod) {
          throw new Error("Crypto payment method not available for this community");
        }
        
        console.log("[CryptoPaymentForm] Crypto payment method found:", cryptoMethod);
        setCryptoConfig(cryptoMethod.config);
        
        // Set default currency if specified in config
        if (cryptoMethod.config.currency) {
          setSelectedCurrency(cryptoMethod.config.currency);
        }
      } catch (err) {
        console.error("[CryptoPaymentForm] Error loading crypto config:", err);
        setError(err.message || "Failed to load payment configuration");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCryptoConfig();
  }, [communityId]);

  // Handle manual payment creation
  const handleManualPayment = async () => {
    setIsProcessing(true);
    
    try {
      // For manual payments, we will create a payment record directly
      const { data, error } = await supabase
        .from("subscription_payments")
        .insert({
          community_id: communityId,
          telegram_user_id: telegramUserId,
          amount: price,
          payment_method: "crypto",
          status: "pending", // Will be marked complete after manual verification
          telegram_username: telegramUsername,
          first_name: firstName,
          last_name: lastName,
          plan_id: planId,
          invite_link: inviteLink
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Set dummy transaction data
      setTransactionData({
        manual: true,
        wallet_address: cryptoConfig.wallet_address,
        currency: cryptoConfig.currency,
        amount: price,
        payment_id: data.id
      });
      
      toast.success("Please send the exact amount to the wallet address shown");
    } catch (err) {
      console.error("[CryptoPaymentForm] Error creating manual payment:", err);
      setError(err.message || "Failed to process payment");
      toast.error("Failed to create payment");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle CoinPayments transaction creation
  const handleCoinPaymentsTransaction = async () => {
    setIsProcessing(true);
    
    try {
      if (cryptoConfig.provider_type !== "coinpayments") {
        throw new Error("CoinPayments is not configured");
      }
      
      console.log("[CryptoPaymentForm] Creating CoinPayments transaction");
      
      // Call our edge function to create a transaction
      const { data, error } = await supabase.functions.invoke("coinpayments-api", {
        body: {
          action: "create_transaction",
          merchantId: cryptoConfig.merchant_id,
          apiKey: cryptoConfig.api_key,
          apiSecret: cryptoConfig.api_secret,
          paymentData: {
            amount: price.toString(),
            currency: selectedCurrency,
            buyerEmail: "",
            itemName: `Community Subscription: ${communityId}`,
            communityId,
            telegramUserId,
            telegramUsername,
            firstName,
            lastName,
            planId,
            inviteLink
          }
        }
      });
      
      if (error) throw error;
      if (!data.success || !data.transaction) {
        throw new Error("Failed to create transaction");
      }
      
      console.log("[CryptoPaymentForm] Transaction created:", data.transaction);
      setTransactionData(data.transaction);
    } catch (err) {
      console.error("[CryptoPaymentForm] Error creating CoinPayments transaction:", err);
      setError(err.message || "Failed to create transaction");
      toast.error("Failed to create transaction");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle form submission
  const handleCreatePayment = async () => {
    if (cryptoConfig?.provider_type === "coinpayments") {
      await handleCoinPaymentsTransaction();
    } else {
      await handleManualPayment();
    }
  };

  // Handle completion
  const handlePaymentComplete = () => {
    toast.success("Payment recorded! Please wait for confirmation.");
    onSuccess();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
        <p className="font-medium">Error loading payment configuration</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  if (!cryptoConfig) {
    return (
      <div className="bg-amber-50 border border-amber-200 text-amber-700 p-4 rounded-lg">
        <p className="font-medium">Crypto payment not available</p>
        <p className="text-sm mt-1">Please try a different payment method.</p>
      </div>
    );
  }

  // Show transaction details if we have them
  if (transactionData) {
    // CoinPayments transaction
    if (!transactionData.manual) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 border rounded-lg bg-indigo-50 border-indigo-100 space-y-4"
        >
          <div className="text-center space-y-2">
            <h3 className="font-semibold text-indigo-800">Payment Required</h3>
            <p className="text-indigo-600">
              Please send exactly <span className="font-bold">{transactionData.amount} {transactionData.coin}</span> to complete your subscription
            </p>
          </div>

          <div className="flex justify-center my-4">
            <div className="bg-white p-3 rounded-lg">
              <QRCode value={transactionData.address} size={180} />
            </div>
          </div>

          <div className="bg-white p-3 rounded border border-indigo-100 break-all">
            <p className="text-xs text-gray-500 mb-1">Payment Address:</p>
            <p className="font-mono text-sm">{transactionData.address}</p>
          </div>

          {transactionData.status_url && (
            <div className="flex justify-center mt-4">
              <Button
                onClick={() => window.open(transactionData.status_url, "_blank")}
                variant="outline"
                className="gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                View Payment Status
              </Button>
            </div>
          )}

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600 mb-4">
              Transaction will be confirmed automatically after payment is received.
            </p>
            <Button onClick={handlePaymentComplete} className="w-full">
              I've Made The Payment
            </Button>
          </div>
        </motion.div>
      );
    }
    
    // Manual wallet transaction
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 border rounded-lg bg-indigo-50 border-indigo-100 space-y-4"
      >
        <div className="text-center space-y-2">
          <h3 className="font-semibold text-indigo-800">Payment Required</h3>
          <p className="text-indigo-600">
            Please send exactly <span className="font-bold">{price} USD</span> worth of {transactionData.currency} to complete your subscription
          </p>
        </div>

        <div className="flex justify-center my-4">
          <div className="bg-white p-3 rounded-lg">
            <QRCode value={transactionData.wallet_address} size={180} />
          </div>
        </div>

        <div className="bg-white p-3 rounded border border-indigo-100 break-all">
          <p className="text-xs text-gray-500 mb-1">Payment Address:</p>
          <p className="font-mono text-sm">{transactionData.wallet_address}</p>
        </div>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600 mb-4">
            After sending payment, please contact the group owner to verify your payment.
          </p>
          <Button onClick={handlePaymentComplete} className="w-full">
            I've Made The Payment
          </Button>
        </div>
      </motion.div>
    );
  }

  // Initial payment form
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 border rounded-lg bg-indigo-50 border-indigo-100"
    >
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="font-semibold text-indigo-800">Crypto Payment</h3>
          <p className="text-indigo-600 text-sm mt-1">
            Pay with cryptocurrency to access this community
          </p>
        </div>

        {cryptoConfig.provider_type === "coinpayments" && (
          <div className="bg-white p-3 rounded-lg border border-indigo-100">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Cryptocurrency
            </label>
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="BTC">Bitcoin (BTC)</option>
              <option value="ETH">Ethereum (ETH)</option>
              <option value="USDT">Tether (USDT)</option>
              <option value="USDC">USD Coin (USDC)</option>
              <option value="LTC">Litecoin (LTC)</option>
              <option value="DOGE">Dogecoin (DOGE)</option>
            </select>
          </div>
        )}

        <div className="bg-white p-3 rounded-lg border border-indigo-100">
          <p className="text-sm font-medium text-gray-700 mb-1">Amount</p>
          <p className="text-lg font-semibold">${price.toFixed(2)} USD</p>
        </div>

        <Button
          onClick={handleCreatePayment}
          disabled={isProcessing}
          className="w-full mt-4 gap-2"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              Proceed to Pay
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}

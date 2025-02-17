
interface PaymentMethodsProps {
  selectedPlan: any;
  selectedPaymentMethod: string | null;
  onPaymentMethodSelect: (method: string) => void;
  onCompletePurchase: () => void;
  communityInviteLink: string | null;
  showSuccess: boolean;
}

export const PaymentMethods = ({
  selectedPlan,
  selectedPaymentMethod,
  onPaymentMethodSelect,
  onCompletePurchase,
  communityInviteLink,
  showSuccess
}: PaymentMethodsProps) => {
  return (
    <div id="payment-methods" className="space-y-4">
      <h2 className="text-xl font-semibold">Select Payment Method</h2>
      <TelegramPaymentOption
        isSelected={selectedPaymentMethod === 'telegram'}
        onSelect={() => onPaymentMethodSelect('telegram')}
      />
    </div>
  );
};

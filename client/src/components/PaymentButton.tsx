import { Button } from "@/components/ui/button";
import { CreditCard, Loader2 } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

interface PaymentButtonProps {
  type: "booking" | "product" | "subscription" | "donation";
  entityId: number;
  amount: string;
  currency?: string;
  provider?: "stripe" | "paypal" | "other";
  onSuccess?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export function PaymentButton({
  type,
  entityId,
  amount,
  currency = "GBP",
  provider = "stripe",
  onSuccess,
  className,
  children,
}: PaymentButtonProps) {
  const { isAuthenticated } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const createPayment = trpc.payments.create.useMutation();

  const handlePayment = async () => {
    if (!isAuthenticated) {
      toast.error("Please log in to make a payment");
      return;
    }

    setIsProcessing(true);
    try {
      const transaction = await createPayment.mutateAsync({
        type,
        entityId,
        amount,
        currency,
        provider,
      });

      // In production, this would redirect to Stripe/PayPal checkout
      if (provider === "stripe") {
        // Redirect to Stripe Checkout
        toast.info("Redirecting to payment...");
        // window.location.href = `/api/payments/stripe/checkout?transactionId=${transaction.id}`;
      } else if (provider === "paypal") {
        // Redirect to PayPal
        toast.info("Redirecting to PayPal...");
        // window.location.href = `/api/payments/paypal/checkout?transactionId=${transaction.id}`;
      } else {
        toast.success("Payment initiated");
        onSuccess?.();
      }
    } catch (error) {
      toast.error("Payment failed. Please try again.");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={isProcessing}
      className={className}
    >
      {isProcessing ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <CreditCard className="w-4 h-4 mr-2" />
          {children || `Pay ${amount} ${currency}`}
        </>
      )}
    </Button>
  );
}

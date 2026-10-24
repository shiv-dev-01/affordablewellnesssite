import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ExpressCheckoutElement,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { buildReturnUrl } from "@/lib/stripeCheckoutSession";
import type { StripeBillingDefaults } from "@/lib/stripe";

function buildConfirmParams(billingDefaults?: StripeBillingDefaults) {
  const address = {
    country: "US",
    ...(billingDefaults?.addressLine1
      ? { line1: billingDefaults.addressLine1 }
      : {}),
    ...(billingDefaults?.addressLine2
      ? { line2: billingDefaults.addressLine2 }
      : {}),
    ...(billingDefaults?.city ? { city: billingDefaults.city } : {}),
    ...(billingDefaults?.state ? { state: billingDefaults.state } : {}),
    ...(billingDefaults?.postalCode
      ? { postal_code: billingDefaults.postalCode }
      : {}),
  };

  return {
    return_url: buildReturnUrl(),
    payment_method_data: {
      billing_details: {
        ...(billingDefaults?.email ? { email: billingDefaults.email } : {}),
        ...(billingDefaults?.name ? { name: billingDefaults.name } : {}),
        ...(billingDefaults?.phone ? { phone: billingDefaults.phone } : {}),
        address,
      },
    },
  };
}

export type StripeCheckoutFormHandle = {
  resumePayment: () => Promise<void>;
  capturePaymentMethod: () => Promise<string | null>;
};

type StripeCheckoutFormProps = {
  amountInCents: number;
  billingDefaults?: StripeBillingDefaults;
  onValidateBilling?: () => boolean;
  onPersistCheckoutSnapshot?: () => void;
  onPaymentSuccess: (
    paymentToken: string,
    clientSecret: string,
  ) => void | Promise<void>;
  onExpressPaymentSuccess?: (
    paymentToken: string,
    clientSecret: string,
  ) => void | Promise<void>;
  disabled?: boolean;
};

const StripeCheckoutForm = forwardRef<
  StripeCheckoutFormHandle,
  StripeCheckoutFormProps
>(function StripeCheckoutForm(
  {
    amountInCents,
    billingDefaults,
    onValidateBilling,
    onPersistCheckoutSnapshot,
    onPaymentSuccess,
    onExpressPaymentSuccess,
    disabled,
  },
  ref,
) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [expressAvailable, setExpressAvailable] = useState(false);
  const errorRef = useRef<HTMLDivElement | null>(null);

  const paymentElementOptions = useMemo(() => {
    const address = {
      country: "US",
      ...(billingDefaults?.addressLine1
        ? { line1: billingDefaults.addressLine1 }
        : {}),
      ...(billingDefaults?.addressLine2
        ? { line2: billingDefaults.addressLine2 }
        : {}),
      ...(billingDefaults?.city ? { city: billingDefaults.city } : {}),
      ...(billingDefaults?.state ? { state: billingDefaults.state } : {}),
      ...(billingDefaults?.postalCode
        ? { postal_code: billingDefaults.postalCode }
        : {}),
    };

    return {
      layout: {
        type: "accordion" as const,
        defaultCollapsed: false,
        radios: "always" as const,
        spacedAccordionItems: true,
      },
      wallets: {
        applePay: "never" as const,
        googlePay: "never" as const,
        link: "never" as const,
      },
      paymentMethodOrder: ["card"],
      defaultValues: {
        billingDetails: {
          ...(billingDefaults?.email ? { email: billingDefaults.email } : {}),
          ...(billingDefaults?.name ? { name: billingDefaults.name } : {}),
          ...(billingDefaults?.phone ? { phone: billingDefaults.phone } : {}),
          address: {
            ...address,
            country: "US",
          },
        },
      },
      fields: {
        billingDetails: {
          address: {
            country: "never" as const,
          },
        },
      },
    };
  }, [billingDefaults]);

  useEffect(() => {
    if (errorMessage && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [errorMessage]);

  const handleExpressConfirm = async () => {
    if (!stripe || !elements || disabled) return;

    setErrorMessage(null);
    onPersistCheckoutSnapshot?.();

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: buildConfirmParams(billingDefaults),
      redirect: "if_required",
    });

    if (error) {
      setErrorMessage(error.message || "Express payment failed.");
      return;
    }

    if (paymentIntent?.status === "succeeded" && onExpressPaymentSuccess) {
      await onExpressPaymentSuccess(
        paymentIntent.id,
        paymentIntent.client_secret || "",
      );
    }
  };

  const processPayment = async (skipBillingGate = false) => {
    if (!stripe || !elements || disabled) return;

    if (!skipBillingGate) {
      const billingOk = onValidateBilling?.();
      if (billingOk === false) return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    onPersistCheckoutSnapshot?.();

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setErrorMessage(
          submitError.message || "Please check your payment details.",
        );
        return;
      }

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: buildConfirmParams(billingDefaults),
        redirect: "if_required",
      });

      if (error) {
        setErrorMessage(error.message || "Payment failed. Please try again.");
        return;
      }

      if (!paymentIntent?.id || paymentIntent.status !== "succeeded") {
        setErrorMessage(
          paymentIntent?.status
            ? `Payment status: ${paymentIntent.status}. Please try again.`
            : "Payment confirmation failed.",
        );
        return;
      }

      await onPaymentSuccess(
        paymentIntent.id,
        paymentIntent.client_secret || "",
      );
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "An unexpected error occurred.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await processPayment(false);
  };

  useImperativeHandle(ref, () => ({
    resumePayment: () => processPayment(true),
    capturePaymentMethod: async () => {
      if (!stripe || !elements) return null;
      setErrorMessage(null);
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setErrorMessage(
          submitError.message || "Please check your payment details.",
        );
        return null;
      }
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        elements,
      });
      if (error || !paymentMethod?.id) {
        setErrorMessage(
          error?.message || "Could not save payment details. Please try again.",
        );
        return null;
      }
      return paymentMethod.id;
    },
  }));

  const displayAmount =
    amountInCents > 0 ? (amountInCents / 100).toFixed(2) : "0.00";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {stripe && elements && (
        <ExpressCheckoutElement
          onConfirm={handleExpressConfirm}
          onClick={(event) => event.resolve()}
          onReady={({ availablePaymentMethods }) => {
            setExpressAvailable(
              !!availablePaymentMethods &&
                Object.values(availablePaymentMethods).some(Boolean),
            );
          }}
          options={{
            paymentMethods: {
              applePay: "always",
              googlePay: "always",
              amazonPay: "auto",
              link: "auto",
              paypal: "never",
              klarna: "auto",
            },
            buttonType: {
              applePay: "plain",
              googlePay: "plain",
            },
            buttonTheme: {
              applePay: "black",
              googlePay: "black",
            },
          }}
        />
      )}

      {expressAvailable && (
        <div className="flex items-center gap-3 py-1">
          <div className="h-px flex-grow bg-slate-200" />
          <span className="text-xs uppercase tracking-wider text-slate-500">
            or pay with
          </span>
          <div className="h-px flex-grow bg-slate-200" />
        </div>
      )}

      {stripe && elements ? (
        <PaymentElement
          key={JSON.stringify(billingDefaults ?? {})}
          options={paymentElementOptions}
        />
      ) : (
        <p className="text-sm text-slate-600 py-4 text-center">
          Loading payment form…
        </p>
      )}

      {errorMessage && (
        <div ref={errorRef} className="text-sm text-red-500">
          {errorMessage}
        </div>
      )}

      <Button
        type="submit"
        className="mx-auto flex w-full max-w-[350px] h-auto py-5 px-5 text-base font-semibold rounded-full bg-[#2D476F] text-white shadow-md hover:bg-[#243247] active:scale-[0.98]"
        disabled={!stripe || !elements || isProcessing || disabled}
      >
        {isProcessing
          ? "Processing..."
          : `Complete Secure Checkout — $${displayAmount}`}
      </Button>
    </form>
  );
});

export default StripeCheckoutForm;

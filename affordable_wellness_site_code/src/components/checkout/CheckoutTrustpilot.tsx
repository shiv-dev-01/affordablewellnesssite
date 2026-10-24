import { Star } from "lucide-react";

const CheckoutTrustpilot = () => {
  return (
    <div className="flex flex-col items-center gap-1.5 py-2 text-center">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-primary">Trustpilot</span>
        <span className="flex gap-0.5" aria-hidden>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className="h-3.5 w-3.5 fill-primary stroke-primary"
            />
          ))}
        </span>
      </div>
      <p className="text-xs text-muted-foreground">
        5.0 based on 12K+ reviews
      </p>
    </div>
  );
};

export default CheckoutTrustpilot;

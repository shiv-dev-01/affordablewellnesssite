import CheckOutHeader from "@/components/CheckOutHeader";
import CheckoutReservedTimer from "@/components/checkout/CheckoutReservedTimer";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useLocation, useNavigate } from "react-router-dom";
import { mergeAffiliateIntoSearch } from "@/lib/affiliateTracking";
import axios from "axios";
import { filterSelectableStates, isExcludedState } from "@/lib/checkoutHelpers";
import { useCheckoutFlow } from "@/context/CheckoutFlowContext";
import CheckoutFooter from "./questions/checkout-footer";
import fedExIcon from "@/assets/fedex_icon.svg";

const Shipping = () => {
  const shippingAddressRef = useRef<HTMLInputElement>(null);
  const billingAddressRef = useRef<HTMLInputElement>(null);
  const [statesList, setStatesList] = useState<
    Array<{ name: string; state_code: string }>
  >([]);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const shippingAutocompleteRef = useRef<unknown>(null);
  const billingAutocompleteRef = useRef<unknown>(null);
  const bootOnce = useRef(false);

  const navigate = useNavigate();
  const { search } = useLocation();
  const {
    isHydrated,
    tryRestoreFromStorage,
    errors,
    setErrors,
    addressLine1,
    setAddressLine1,
    addressLine2,
    setAddressLine2,
    city,
    setCity,
    state,
    setState,
    zipCode,
    setZipCode,
    differentBilling,
    setDifferentBilling,
    billingAddressLine1,
    setBillingAddressLine1,
    billingAddressLine2,
    setBillingAddressLine2,
    billingCity,
    setBillingCity,
    billingState,
    setBillingState,
    billingZipCode,
    setBillingZipCode,
    validateShippingForm,
  } = useCheckoutFlow();

  const fetchStates = async () => {
    try {
      const res = await axios.post(
        "https://countriesnow.space/api/v0.1/countries/states",
        { country: "United States" },
      );
      setStatesList(filterSelectableStates(res.data.data.states));
    } catch (err) {
      console.error("Error fetching states:", err);
    }
  };

  useEffect(() => {
    fetchStates();
  }, []);

  useEffect(() => {
    if (bootOnce.current) return;
    bootOnce.current = true;
    if (!isHydrated) {
      if (!tryRestoreFromStorage()) {
        navigate(`/questionnaire${mergeAffiliateIntoSearch(search)}`);
      }
    }
  }, [isHydrated, tryRestoreFromStorage, navigate, search]);

  const parseAddressComponents = (place: {
    address_components?: Array<{
      long_name: string;
      short_name: string;
      types: string[];
    }>;
  }) => {
    let stateCode = "";
    let cityVal = "";
    let postalCode = "";
    place.address_components?.forEach((component) => {
      const types = component.types;
      if (types.includes("administrative_area_level_1")) {
        stateCode = component.short_name || "";
      }
      if (types.includes("locality")) {
        cityVal = component.long_name || "";
      }
      if (types.includes("postal_code")) {
        postalCode = component.long_name || "";
      }
    });
    return { stateCode, city: cityVal, postalCode };
  };

  const cleanAddress = (formattedAddress: string) => {
    return formattedAddress.split(",")[0].trim();
  };

  const initializeAutocomplete = () => {
    if (!window.google?.maps?.places) return;

    if (shippingAddressRef.current && !shippingAutocompleteRef.current) {
      const autocomplete = new window.google.maps.places.Autocomplete(
        shippingAddressRef.current,
        { types: ["address"], componentRestrictions: { country: "us" } },
      );
      shippingAutocompleteRef.current = autocomplete;
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (place.formatted_address) {
          const { stateCode, city: c, postalCode } =
            parseAddressComponents(place);
          setAddressLine1(cleanAddress(place.formatted_address));
          if (c) setCity(c);
          if (stateCode) {
            if (isExcludedState(stateCode)) {
              setState("");
              setErrors((prev) => ({
                ...prev,
                state: "We are not currently available in this state.",
              }));
            } else {
              setState(stateCode);
            }
          }
          if (postalCode) setZipCode(postalCode);
          setErrors((prev) => ({
            ...prev,
            addressLine1: "",
            city: "",
            state: "",
            zipCode: "",
          }));
        }
      });
    }

    if (
      billingAddressRef.current &&
      differentBilling &&
      !billingAutocompleteRef.current
    ) {
      const autocomplete = new window.google.maps.places.Autocomplete(
        billingAddressRef.current,
        { types: ["address"], componentRestrictions: { country: "us" } },
      );
      billingAutocompleteRef.current = autocomplete;
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (place.formatted_address) {
          const { stateCode, city: c, postalCode } =
            parseAddressComponents(place);
          setBillingAddressLine1(cleanAddress(place.formatted_address));
          if (c) setBillingCity(c);
          if (stateCode) {
            if (isExcludedState(stateCode)) {
              setBillingState("");
              setErrors((prev) => ({
                ...prev,
                billingState: "We are not currently available in this state.",
              }));
            } else {
              setBillingState(stateCode);
            }
          }
          if (postalCode) setBillingZipCode(postalCode);
          setErrors((prev) => ({
            ...prev,
            billingAddressLine1: "",
            billingCity: "",
            billingState: "",
            billingZipCode: "",
          }));
        }
      });
    }

    if (!differentBilling && billingAutocompleteRef.current) {
      billingAutocompleteRef.current = null;
    }
  };

  useEffect(() => {
    const loadGoogleMapsScript = () => {
      if (window.google?.maps?.places) {
        setIsGoogleMapsLoaded(true);
        initializeAutocomplete();
        return;
      }
      const existingScript = document.querySelector(
        'script[src*="maps.googleapis.com/maps/api/js"]',
      );
      if (existingScript) {
        existingScript.addEventListener("load", () => {
          setIsGoogleMapsLoaded(true);
          initializeAutocomplete();
        });
        return;
      }
      const script = document.createElement("script");
      script.src =
        "https://maps.googleapis.com/maps/api/js?key=AIzaSyDqypMXRxstlMdPZ-LUGWb4w36I0ENsu9U&libraries=places";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setIsGoogleMapsLoaded(true);
        initializeAutocomplete();
      };
      document.head.appendChild(script);
    };
    loadGoogleMapsScript();
  }, []);

  useEffect(() => {
    if (isGoogleMapsLoaded && shippingAddressRef.current) {
      const timer = setTimeout(() => initializeAutocomplete(), 100);
      return () => clearTimeout(timer);
    }
  }, [isGoogleMapsLoaded]);

  useEffect(() => {
    if (isGoogleMapsLoaded) {
      const timer = setTimeout(() => initializeAutocomplete(), 100);
      return () => clearTimeout(timer);
    }
  }, [differentBilling, isGoogleMapsLoaded]);

  const handleSubmit = () => {
    if (validateShippingForm()) {
      navigate(`/payment${mergeAffiliateIntoSearch(search)}`);
    }
  };

  if (!isHydrated) return null;

  return (
    <div className="checkout-flow flex min-h-screen flex-col">
      <CheckOutHeader />
      <main
        id="main-content"
        role="main"
        className="mx-auto w-full max-w-xl flex-1 px-4 py-8 md:px-6"
      >
        <section className="w-full mb-6">
          <div className="mx-auto mb-4">
            <div className="flex items-center justify-between text-xs md:text-sm font-semibold font-heading">
              <div className="flex-1 text-center">
                <p className="text-primary">Approval</p>
                <div className="mt-1 h-[4px] bg-primary" />
              </div>
              <div className="flex-1 text-center">
                <p className="text-primary">Shipping</p>
                <div className="mt-1 h-[4px] bg-primary" />
              </div>
              <div className="flex-1 text-center">
                <p className="text-muted-foreground">Payment</p>
                <div className="mt-1 h-[4px] bg-border" />
              </div>
            </div>
          </div>
          <CheckoutReservedTimer />
        </section>

        <h3 className="font-heading text-2xl font-semibold text-primary mb-4">
          Shipping Address
        </h3>
        <Card className="rounded-[2rem] border border-border bg-card p-5 md:p-6">
          <div className="pt-2 space-y-1">
            <div>
              <Label
                htmlFor="addressLine1"
                className="text-base font-medium mb-1 block text-slate-900 ms-2"
              >
                Street Address
              </Label>
              <Input
                ref={shippingAddressRef}
                id="addressLine1"
                placeholder="Enter your address"
                value={addressLine1}
                onChange={(e) => {
                  setAddressLine1(e.target.value);
                  if (errors.addressLine1) {
                    setErrors((prev) => ({ ...prev, addressLine1: "" }));
                  }
                }}
                className={`h-14 text-base focus:ring-2 focus:ring-primary/20 ${
                  errors.addressLine1 ? "border-red-500" : ""
                }`}
              />
              {errors.addressLine1 && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.addressLine1}
                </p>
              )}
            </div>
            <div>
              <Label
                htmlFor="addressLine2"
                className="text-base font-medium mb-1 block text-slate-900 ms-2"
              >
                Apartment, Suite, etc. (Optional)
              </Label>
              <Input
                id="addressLine2"
                placeholder="Apt 4B"
                value={addressLine2}
                onChange={(e) => setAddressLine2(e.target.value)}
                className="h-14 text-base focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="city"
                  className="text-base font-medium mb-1 block text-slate-900 ms-2"
                >
                  City
                </Label>
                <Input
                  id="city"
                  placeholder="New York"
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    if (errors.city) {
                      setErrors((prev) => ({ ...prev, city: "" }));
                    }
                  }}
                  className={`h-14 text-base focus:ring-2 focus:ring-primary/20 ${
                    errors.city ? "border-red-500" : ""
                  }`}
                />
                {errors.city && (
                  <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                )}
              </div>
              <div>
                <Label
                  htmlFor="state"
                  className="text-base font-medium mb-1 block text-slate-900 ms-2"
                >
                  State
                </Label>
                <Select
                  value={state}
                  onValueChange={(value) => {
                    setState(value);
                    if (errors.state) {
                      setErrors((prev) => ({ ...prev, state: "" }));
                    }
                  }}
                >
                  <SelectTrigger
                    className={`h-14 text-base ${
                      errors.state ? "border-red-500" : ""
                    }`}
                  >
                    <SelectValue placeholder="State" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {statesList.map((usState) => (
                      <SelectItem
                        key={usState.state_code}
                        value={usState.state_code}
                        className="text-base py-2"
                      >
                        {usState.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.state && (
                  <p className="text-red-500 text-sm mt-1">{errors.state}</p>
                )}
              </div>
            </div>
            <div>
              <Label
                htmlFor="zipCode"
                className="text-base font-medium mb-1 block text-slate-900 ms-2"
              >
                ZIP Code
              </Label>
              <Input
                id="zipCode"
                placeholder="10001"
                value={zipCode}
                onChange={(e) => {
                  setZipCode(e.target.value.replace(/\D/g, ""));
                  if (errors.zipCode) {
                    setErrors((prev) => ({ ...prev, zipCode: "" }));
                  }
                }}
                maxLength={5}
                className={`h-14 text-base focus:ring-2 focus:ring-primary/20 ${
                  errors.zipCode ? "border-red-500" : ""
                }`}
              />
              {errors.zipCode && (
                <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>
              )}
            </div>
          </div>
          <div className="pt-4 flex items-center space-x-3">
            <Checkbox
              id="differentBilling"
              checked={differentBilling}
              onCheckedChange={(checked) =>
                setDifferentBilling(checked === true)
              }
            />
            <Label
              htmlFor="differentBilling"
              className="text-base font-medium cursor-pointer text-slate-600"
            >
              Use different billing address
            </Label>
          </div>
        </Card>

        {differentBilling && (
          <div className="pt-2 mt-4 p-4 md:p-4 border-2 md:border-2 border-y-2 border-x-2 md:border-x-2 border-primary/30 bg-secondary/50 rounded-xl md:rounded-xl">
            <h3 className="text-base font-extrabold pt-1 text-slate-900 ms-2">
              Billing Address
            </h3>
            <div>
              <Label
                htmlFor="billingAddressLine1"
                className="text-base font-medium mb-1 block text-slate-900 ms-2"
              >
                Street Address
              </Label>
              <Input
                ref={billingAddressRef}
                id="billingAddressLine1"
                placeholder="Enter your address"
                value={billingAddressLine1}
                onChange={(e) => {
                  setBillingAddressLine1(e.target.value);
                  if (errors.billingAddressLine1) {
                    setErrors((prev) => ({
                      ...prev,
                      billingAddressLine1: "",
                    }));
                  }
                }}
                className={`h-14 text-base focus:ring-2 focus:ring-primary/20 ${
                  errors.billingAddressLine1 ? "border-red-500" : ""
                }`}
              />
              {errors.billingAddressLine1 && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.billingAddressLine1}
                </p>
              )}
            </div>
            <div>
              <Label
                htmlFor="billingAddressLine2"
                className="text-base font-medium mb-1 block text-slate-900 ms-2"
              >
                Apartment, Suite, etc. (Optional)
              </Label>
              <Input
                id="billingAddressLine2"
                placeholder="Apt 4B"
                value={billingAddressLine2}
                onChange={(e) => setBillingAddressLine2(e.target.value)}
                className="h-14 text-base focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="billingCity"
                  className="text-base font-medium mb-1 block text-slate-900 ms-2"
                >
                  City
                </Label>
                <Input
                  id="billingCity"
                  placeholder="New York"
                  value={billingCity}
                  onChange={(e) => {
                    setBillingCity(e.target.value);
                    if (errors.billingCity) {
                      setErrors((prev) => ({ ...prev, billingCity: "" }));
                    }
                  }}
                  className={`h-14 text-base focus:ring-2 focus:ring-primary/20 ${
                    errors.billingCity ? "border-red-500" : ""
                  }`}
                />
                {errors.billingCity && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.billingCity}
                  </p>
                )}
              </div>
              <div>
                <Label
                  htmlFor="billingState"
                  className="text-base font-medium mb-1 block text-slate-900 ms-2"
                >
                  State
                </Label>
                <Select
                  value={billingState}
                  onValueChange={(value) => {
                    setBillingState(value);
                    if (errors.billingState) {
                      setErrors((prev) => ({ ...prev, billingState: "" }));
                    }
                  }}
                >
                  <SelectTrigger
                    className={`h-14 text-base ${
                      errors.billingState ? "border-red-500" : ""
                    }`}
                  >
                    <SelectValue placeholder="State" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {statesList.map((usState) => (
                      <SelectItem
                        key={usState.state_code}
                        value={usState.state_code}
                        className="text-base py-2"
                      >
                        {usState.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.billingState && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.billingState}
                  </p>
                )}
              </div>
            </div>
            <div>
              <Label
                htmlFor="billingZipCode"
                className="text-base font-medium mb-1 block text-slate-900 ms-2"
              >
                ZIP Code
              </Label>
              <Input
                id="billingZipCode"
                placeholder="10001"
                value={billingZipCode}
                onChange={(e) => {
                  setBillingZipCode(e.target.value.replace(/\D/g, ""));
                  if (errors.billingZipCode) {
                    setErrors((prev) => ({
                      ...prev,
                      billingZipCode: "",
                    }));
                  }
                }}
                maxLength={5}
                className={`h-14 text-base focus:ring-2 focus:ring-primary/20 ${
                  errors.billingZipCode ? "border-red-500" : ""
                }`}
              />
              {errors.billingZipCode && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.billingZipCode}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="py-4">
          <div className="pb-2 flex justify-center items-center gap-1 text-xs md:text-sm">
            <img
              src={fedExIcon}
              alt="FedEx"
              className="h-50 w-auto md:h-50 object-contain"
            />
            <span className="text-slate-900 mr-1">Express Delivery</span>
          </div>
          <p className="text-center gap-1 text-xs md:text-sm">
            All approved orders are processed within 24 hours. Total estimated
            delivery time is 1-5 business days from prescription approval.
          </p>
        </div>

        <div className="pt-4">
          <Button
            variant="checkout"
            type="button"
            size="lg"
            onClick={handleSubmit}
            className="w-full min-h-12 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Continue to Checkout
          </Button>
        </div>
      </main>
      <CheckoutFooter />
    </div>
  );
};

export default Shipping;

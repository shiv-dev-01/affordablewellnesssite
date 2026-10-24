import Navbar from "@/components/Navbar";
import React, { useEffect } from "react";
import Footer from "@/components/Footer";
import { SITE_PHONE_DISPLAY, SITE_PHONE_TEL } from "@/lib/contactInfo";

const ReturnsAndRefund = () => {
     useEffect(() => {
        window.scrollTo(0, 0);
      }, []);
  return (
    <div>
    <Navbar/>
    <div className="mx-auto pt-[80.8px] ">
        <div className="py-6  px-2 bg-[#eaebf5] mb-8">
            <h2 className="text-3xl lg:text-6xl sm:text-4xl md:text-3xl font-bold  text-primary container mx-auto text-center md:text-left">
                Returns & Refund Policy
            </h2>
        </div>
    <div className="container px-3 sm:px-3 md:px-4 lg:px-8 mx-auto">
      <p className="mb-6 leading-relaxed text-lg">
        At <span className="font-bold">Affordable Wellness</span> we strive to provide the highest level of quality healthcare which includes frictionless access to medical providers and medications at prices that are affordable and accessible.  We also make every effort to provide the highest level of patient care before and after the sale.  If you have an issue with your order or your product, please reach out to our patient care team:{" "}
        <a href={`tel:${SITE_PHONE_TEL}`} className="text-[#2D476F] hover:underline underline">
         {SITE_PHONE_DISPLAY}
        </a>{" "}
        or{" "}
        <a
          href="mailto:support@affordablewellness.com"
          className="text-[#2D476F] hover:underline underline"
        >
          support@affordablewellness.com
        </a>.
        <br />
        <br />
        Below are our categories and how we can help you after the sale:
      </p>

      {/* PRESCRIPTION MEDICATIONS */}
      <h3 className="text-2xl text-primary font-bold mt-8 mb-3">
        PRESCRIPTION MEDICATIONS:
      </h3>
      <p className="mb-6 leading-relaxed text-lg">
        State and Federal regulations do not allow the return of prescription medications after being dispensed by the pharmacy.   Once your method of payment has been charged and your package has been handed over to the carrier (USPS, FedEx, UPS), all sales are final.  You can always login to your{" "}
        <span className="font-bold">affordablewellness.com</span> account before your products ship to change your address, method of payment or to cancel your subscription.  If your prescription medication arrives damaged or is lost during transit, please contact our patient care team:{" "}
        <a href={`tel:${SITE_PHONE_TEL}`} className="text-[#2D476F] hover:underline underline">
         {SITE_PHONE_DISPLAY}
        </a>{" "}
        or email us,{" "}
        <a
          href="mailto:support@affordablewellness.com"
          className="text-[#2D476F] hover:underline underline"
        >
          support@affordablewellness.com
        </a>.
      </p>

      {/* NON-PRESCRIPTION PRODUCTS */}
      <h3 className="text-2xl text-primary font-bold mt-8 mb-3">
        NON-PRESCRIPTION (OVER THE COUNTER) PRODUCTS:
      </h3>
      <p className="mb-6 leading-relaxed text-lg">
        Affordable Wellness may accept returns on unopened, non-prescription items up to 30 days after the sale. You will be responsible to pay the return shipping cost and we do not accept COD returns.  If you need to return an item, please contact our patient care team:{" "}
        <a href={`tel:${SITE_PHONE_TEL}`} className="text-[#2D476F] hover:underline underline">
        {SITE_PHONE_DISPLAY}
        </a>{" "}
        or email us,{" "}
        <a
          href="mailto:support@affordablewellness.com"
          className="text-[#2D476F] hover:underline underline"
        >
          support@affordablewellness.com
        </a>.  Include your order number, reason for the return along with the product name.  Affordable Wellness reserves the right to deny a return that does not arrive in the original condition it was shipped or if the products appear to be tampered with or opened.  After we receive the returned product and it is approved by our Affordable Wellness team, your purchase price will be refunded to your original method of payment.
      </p>

      {/* ADDRESS */}
      <h3 className="text-2xl text-primary font-bold mt-8 mb-3">
        Address for Returns:
      </h3>
      <div className="mb-6 leading-relaxed text-lg">
        <p>Affordable Wellness LLC/Manifest Pharmacy</p>
        <p>1018 S. Batesville Road,</p>
        <p>Greer, SC 29650</p>
      </div>

      {/* LOST PACKAGES */}
      <h3 className="text-2xl text-primary font-bold mt-8 mb-3">
        LOST PACKAGES:
      </h3>
      <p className="leading-relaxed text-lg mb-8">
        In the rare case your package is lost in transit, Affordable Wellness will reship your prescription or non-prescription order.  We will work with your carrier (USPS, FedEx, UPS) to locate your package first and have it redirected if needed.  Sometimes weather may delay your package delivery time.  Since we currently do not ship refrigerated products, your product will not be affected by increased transit time.  If your package is lost in transit or does not arrive at the shipping address you provided, please contact our patient care team:{" "}
        <a href={`tel:${SITE_PHONE_TEL}`} className="text-[#2D476F] hover:underline underline">
         {SITE_PHONE_DISPLAY}
        </a>{" "}
        or email us,{" "}
        <a
          href="mailto:support@affordablewellness.com"
          className="text-[#2D476F] hover:underline underline"
        >
          support@affordablewellness.com
        </a>.
      </p>
      </div>
    </div>
    <Footer/>
    </div>
  );
};

export default ReturnsAndRefund;

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { SITE_PHONE_DISPLAY, SITE_PHONE_TEL } from "@/lib/contactInfo";
import React, { useEffect } from "react";
import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div>
      <Navbar />
      <div className="mx-auto pt-[80.8px] mb-8">
        <div className="py-6 px-4 bg-[#eaebf5] mb-8">
          <h2 className="text-3xl lg:text-6xl sm:text-4xl md:text-3xl font-bold text-primary container mx-auto text-center md:text-left">
            Privacy Policy
          </h2>
        </div>
        {/* CONTENT SECTION */}
        <div className="container px-3 sm:px-3 md:px-4 lg:px-8 mx-auto">
          <p className="text-lg leading-relaxed mb-6">
            This privacy policy ("<b>Privacy Policy</b>") describes how Affordable Wellness and/or our owners and/or affiliates (collectively "<b>Company</b>," "<b>our</b>," "<b>we</b>," or "<b>us</b>") collect, use, disclose, and protect information about you provide through the affordablewellness website located at{" "}
            <a href="https://www.affordablewellness.com" className="text-[#2D476F] hover:underline underline">
              affordablewellness.com
            </a>. (together, the "<b>Site</b>"). This Privacy Policy applies only to information that is collected in connection with your use of the Site. It does not apply to any other offerings, products or services. If you do not want us to collect, use or disclose information about you and your use of the Site as described in this Privacy Policy, then you should not use the Site. By using the Site, you are accepting the practices set out in this Privacy Policy and our Terms of Use.
          </p>

          <p className="text-lg leading-relaxed mb-6">
            If you are a resident of California, please see our California Privacy Notice available{" "}
            <Link to={"/ccpa"} className="text-[#2D476F] hover:underline underline">
              here
            </Link>.
          </p>

          <h2 className="text-lg font-bold mb-4">About the Site</h2>
          <p className="mb-4 text-lg leading-relaxed">
            The Site gathers several types of information from and about users of the Site, including medication information, geographic location and user preferences. Among other things, this allows the Site to:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2 text-lg leading-relaxed">
            <li>Check the prices of your medication at multiple pharmacies near you;</li>
            <li>Show you comparable prices for your medication using information received from third parties;</li>
            <li>Send you a discount card if requested; and</li>
            <li>Provide coupons for your use at the pharmacy of your choice.</li>
          </ul>

          <h2 className="text-lg font-bold mb-4">Categories of Information We Collect</h2>
          <p className="mb-4 text-lg leading-relaxed">
            The information we collect from or about you allows us to provide our services and helps us personalize and improve your experience on the Site. You may print or download a discount card to use our service without registering with us or creating an account. Depending on how you use the Site, we may collect the following categories of information directly from you:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2 text-lg leading-relaxed">
            <li>Information about medications you are seeking to fill (such as medication names and dosage) and your preferred pharmacy.</li>
            <li>Information about your purchase transactions, including purchases using our discount card, including drug name and pharmacy location.</li>
            <li>Geographic location information from you or your device, including your geolocation data, zip code, region, city, street address, time zone, latitude and longitude information. Please note that we will not access precise geo-location information from your device, unless you grant the Site permission to do so.</li>
            <li>User preferences.</li>
            <li>Technical data and related information, such as information about your device, system and application software, peripherals and other data related to your interactions with the Site.</li>
            <li>Metadata and other information associated with or stored on your device.</li>
          </ul>
          <p className="mb-4 text-lg leading-relaxed">
            We may also collect information directly from you outside of the Site if you provide it to us, for example, if you send Customer Service a request or email.
          </p>
          <p className="mb-4 text-lg leading-relaxed">
            When you use the Site, we automatically collect some categories of information from you, such as information about your use of the Site (e.g., features used, content viewed, dates and times of interactions) and technical data about your device, such as operating system, model, device identifier, and IP address.
          </p>
          <p className="mb-4 text-lg leading-relaxed">
            We may also automatically collect certain technical information relating to you, which your web browser automatically sends whenever you visit a website on the Internet, or which is collected when you use a mobile application (see the section "Cookies and Similar Tools" below for more information). For example, we use Google Analytics, a web analytics service provided by Google, Inc. ("Google") to collect information relating to your use of the Site. Google Analytics uses "cookies", which are text files placed on your device, to help us analyze how you use our Site. You can find out more about how Google uses data by visiting "How Google uses information from sites or apps that use our services", located at{" "}
            <a href="https://policies.google.com/technologies/partner-sites" className="text-[#2D476F] hover:underline underline" target="_blank" rel="noopener noreferrer">
              https://policies.google.com/technologies/partner-sites
            </a>.
          </p>

          <h2 className="text-lg font-bold mb-4">How We Use the Information We Collect</h2>
          <p className="mb-4 text-lg leading-relaxed">Information we collect about you may be used for the following purposes:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2 text-lg leading-relaxed">
            <li>Operating the Site, including to provide you the Service features.</li>
            <li>To provide you the information and services you request when you use the Site.</li>
            <li>To customize your experience when you use the Site, for example to provide you with interactive or personalized elements or provide you with content based on your interests, requests, and location.</li>
            <li>Improve the Site and other Company products or services, including by developing new products and services, perform quality control activities, and conduct data analytics.</li>
            <li>Provide account management, patient care, customer service, and engaging in system maintenance.</li>
            <li>Deliver marketing communications, such as promotional materials or advertisements, including materials and advertisements for services offered by us and/or third parties that might be of interest to you, either directly to you or through third party apps or websites.</li>
            <li>Communicate service-related or required notices about the Site to you, which may include communications by email or by text messages (i.e., SMS) at the mobile device number you provide us.</li>
            <li>Detect, prevent, and respond to suspected fraud, intellectual property infringement, violations of our Terms of Use, violations of law, or other misuse of the Site.</li>
            <li>Perform data analytics, including to compile, synthesize, generate and analyze anonymous usage and other aggregated statistics and information.</li>
            <li>Monitor your use of the BIN/PCN/RXGroup/Member ID or other information we provide to you.</li>
          </ul>
          <p className="mb-4 text-lg leading-relaxed">When permitted by applicable law, we may also:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2 text-lg leading-relaxed">
            <li>Combine the information you provide us, or that we collect from third parties, with other information maintained by us, and use that combined information for any of the above purposes.</li>
            <li>De-identify your information by removing information typically used to identify you and use that de-identified information for any purpose permitted by law.</li>
          </ul>

          <h2 className="text-lg font-bold mb-4">How We Share Information We Collect</h2>
          <p className="mb-4 text-lg leading-relaxed">Your information may be disclosed to the following third parties:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2 text-lg leading-relaxed">
            <li>Pharmacies and other partners who help us provide the services available through the Site to you.</li>
            <li>Business partners, who may deliver marketing communications, promotional markets, advertisements, or other information, including about other services offered by us and/or third parties, that may be of interest to you. You will be given the option to opt out of marketing messages. If required to do so by law or if we have a good faith belief that disclosure is necessary to (1) comply with the law or with legal process served on us; (2) protect and defend our rights or property; or (3) to protect someone's safety.</li>
            <li>Advisors, potential transactional partners, or other third parties related to the consideration, negotiation, or completion of a corporate change of control resulting from, for example, a sale to, or merger with another entity. If all or substantially all our assets or stock is acquired by a third party, whether by merger, acquisition, reorganization or otherwise, we may transfer our user database, including personal information contained in it, to the third party.</li>
            <li>Service providers who work on our behalf or partner with us to provide or improve the Site or related products or services or carry out activities on our behalf. Our service providers are required to agree to protect your personal information consistent with this Privacy Policy.</li>
          </ul>
          <p className="mb-4 text-lg leading-relaxed">
            <b>Note: All other use case categories exclude text messaging origination opt-in data and consent; this information will not be shared with any third parties.</b>
          </p>
          <p className="mb-4 text-lg leading-relaxed">
            We and our service providers may share reports on user demographics and traffic patterns that do not identify you, as well as other information that does not identify you with third parties.
          </p>

          <h2 className="text-lg font-bold mb-4">Information Security</h2>
          <p className="mb-4 text-lg leading-relaxed">
            We take reasonable steps to protect your personal information, which is any information that identifies you or could reasonably be linked to you. We also use encryption technology, called Secure Sockets Layer (SSL), to help protect personal information in certain areas of our Site during transport across the Internet. The presence of SSL encryption may be indicated by https in the browser URL or the image of a closed lock or solid key in the browser window. These indications may not be present in mobile services that use SSL.
          </p>
          <p className="mb-4 text-lg leading-relaxed">
            Unfortunately, there is always some risk that an unauthorized third party may find a way around our security measures. We cannot guarantee that the Internet or any other technical system will be 100% secure or error-free. We are not responsible for the security of information you transmit over networks that we do not control, including the Internet and wireless networks. Please note that e-mails and other communications you send to us are not encrypted, and by communicating with us by email you accept the risk that any personal information contained in the email may be intercepted or accessed by unauthorized parties.
          </p>

          <h2 className="text-lg font-bold mb-4">Your Choices</h2>
          <p className="mb-4 text-lg leading-relaxed">
            You may opt out of receiving marketing emails by using the unsubscribe information available in any marketing email, or by emailing us at{" "}
            <a href="mailto:support@affordablewellness.com" className="text-[#2D476F] hover:underline underline">
              support@affordablewellness.com
            </a>. To the extent that you use the Site, there are certain messages you may not opt out of receiving, such as non-promotional email messages about programs or services you have registered for or certain administrative, technical, or safety notices about the Site or our products or services.
          </p>
          <p className="mb-4 text-lg leading-relaxed">
            The Site does not currently respond to "do not track" signals or other mechanisms that provide a method to opt out of the collection of information over time and across websites and online services you may use. If we do so in the future, we will describe how we do so in this Privacy Policy. Visit the following website, for more information on this developing area.{" "}
            <a href="https://www.allaboutdnt.org" className="text-[#2D476F] hover:underline underline" target="_blank" rel="noopener noreferrer">
              www.allaboutdnt.org
            </a>
          </p>

          <h2 className="text-lg font-bold mb-4">Information About Minors</h2>
          <p className="mb-4 text-lg leading-relaxed">
            The Site is intended for adults only and are not directed to, nor do we knowingly collect information from, individuals under the age of 18. If you become aware that your child or any individual under your care who is under the age of 18 has provided us with information without your consent, please contact us at the contact information listed below.
          </p>

          <h2 className="text-lg font-bold mb-4">California Residents</h2>
          <p className="mb-4 text-lg leading-relaxed">
            Pursuant to California Civil Code Section 1798.83, if you are a California resident, you have the right to request information about how and to whom we disclose certain categories of your personal information for their direct marketing purposes, once per calendar year. You can make this request to us via email at:{" "}
            <a href="mailto:support@affordablewellness.com" className="text-[#2D476F] hover:underline underline">
              support@affordablewellness.com
            </a>{" "}
            or by calling toll-free at{" "}
            <a href={`tel:${SITE_PHONE_TEL}`} className="text-[#2D476F] hover:underline underline">
             {SITE_PHONE_DISPLAY}
            </a>.
          </p>
          <p className="mb-4 text-lg leading-relaxed">
            If you are a resident of California, please see our California Privacy Notice for additional provisions that apply to you.
          </p>

          <h2 className="text-lg font-bold mb-4">Links to Other Websites</h2>
          <p className="mb-4 text-lg leading-relaxed">
            Our Site may include links to external third-party websites and online services that are not under our control. We are not responsible for the collection, use, and disclosure of your information on those websites and other online services provided by those third parties. We encourage you to review the privacy policies and terms of use of each website and other online service you visit. The inclusion of links to external third-party websites and online services does not imply endorsement of, or association with, such websites and online services by us, or any warranty of any kind, either express or implied.
          </p>

          <h2 className="text-lg font-bold mb-4">Cookies and Similar Tools</h2>
          <p className="mb-4 text-lg leading-relaxed">
            We use cookies to collect, store and sometimes track information from your computer or mobile device automatically for statistical purposes to improve the Site. If you use our Site, we will use a cookie, web beacons and other similar technologies on our website to save your settings and to provide customizable and personalized services. A cookie is a unique numeric code that we transfer to your computer that lets us know your location, the information visited while on our website and the third-party websites you visited before accessing our website. Web beacons are small pieces of code placed on our website that allow us to obtain information about website usage. We retain the information we receive from the cookies we place on your computer. These cookies do not enable third parties to access any of your personal information. If you prefer not to receive cookies from the Site, then set your browser to refuse all cookies from any websites that you may visit. This will provide you with more control over the acceptance of cookies on your computer. However, it is possibility that some portions of the Site will not function properly or may perform more slowly. By using our Site and not disabling cookies, you consent to their use. Please note that other tracking technologies may still function.
          </p>

          <h2 className="text-lg font-bold mb-4">Retention</h2>
          <p className="mb-4 text-lg leading-relaxed">
            We will retain your personal information in accordance with our record retention policies and as permitted by applicable law unless you instruct us to remove it by contact us at{" "}
            <a href="mailto:support@affordablewellness.com" className="text-[#2D476F] hover:underline underline">
              support@affordablewellness.com
            </a>. We will also retain your personal information as necessary to comply with legal obligations, resolve disputes, and enforce our agreements. You can update the personal information you have provided to us at any time by writing to the program administrator at  Affordable Wellness/Manifest Pharmacy. Attn: Privacy Team/Regulatory Compliance,
          </p>

          <h2 className="text-lg font-bold mb-4">Access from Outside the United States</h2>
          <p className="mb-4 text-lg leading-relaxed">
            If you access the Site from outside the United States, please be aware that personal information may be transferred to, stored in, and processed in the United States. Certain governmental authorities may not consider the level of protection of personal information in the United States to be equivalent to that required by the in other jurisdictions.
          </p>

          <h2 className="text-lg font-bold mb-4">Changes and Updates</h2>
          <p className="mb-4 text-lg leading-relaxed">
            We may make changes to our Privacy Policy from time to time. When we do so, we will post the revised Privacy Policy on our Site and change the "last updated" date. Please check the "last updated" date at the top of this page to determine if the policy has been modified since you last reviewed it. Your continued use of the Site after that date means you agree to this Privacy Policy and any updates.
          </p>

          <h2 className="text-lg font-bold mb-4">Contact Information</h2>
          <p className='mb-4 leading-relaxed text-lg'>If you have any questions about this Privacy Policy, please send them to <span className="text-[#2D476F] hover:underline underline">support@affordablewellness.com </span> or you may call us at <a href={`tel:${SITE_PHONE_TEL}`} className="text-[#2D476F] hover:underline underline">{SITE_PHONE_DISPLAY}</a>. You may also write to us in care of our administrator at:Attn: Privacy Team/Regulatory Compliance</p>
          <p className='mb-4 leading-relaxed text-lg'>
          Affordable Wellness LLC
          </p>
          <p className='leading-relaxed text-lg'>Address: South Carolina, P.O. Box 1493, <br /> Loris SC 29569</p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;

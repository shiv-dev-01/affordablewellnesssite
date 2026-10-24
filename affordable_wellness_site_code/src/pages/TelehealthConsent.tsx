import Navbar from "@/components/Navbar";
import React, { useEffect } from "react";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";

const TelehealthConsent = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div>
      <Navbar />
      <div className="mx-auto pt-[80.8px]">
        <div className="py-6 px-4 bg-[#eaebf5] mb-8">
          <h2 className="text-3xl lg:text-6xl sm:text-4xl md:text-3xl font-bold text-primary container mx-auto text-center md:text-left">
            Telehealth Consent
          </h2>
        </div>

        <div className="container px-3 sm:px-3 md:px-4 lg:px-8 mx-auto mb-12">
          <p className="text-lg mb-6 leading-relaxed font-bold uppercase">
            DO NOT USE THIS SERVICE FOR EMERGENCY MEDICAL CONDITIONS OR NEEDS. IF
            YOU ARE CURRENTLY EXPERIENCING A MENTAL HEALTH OR OTHER MEDICAL
            EMERGENCY, IMMEDIATELY CALL 911.
          </p>
          <p className="text-lg mb-6 leading-relaxed">
            If you are considering suicide or thinking about taking an action that
            may cause harm or danger to you or to others, you must immediately call
            911. If you are considering suicide, we urge you to call the National
            Suicide Prevention Hotline at 1-800-273-TALK (8255).
          </p>

          <p className="text-lg mb-6 leading-relaxed">
            Only use our service if you&apos;ve read this information and
            subsequently made an informed decision that our service is right for
            you. If you have any questions, please send us a message through our
            help center at{" "}
            <a
              href="mailto:support@affordablewellness.com"
              className="text-[#2D476F] hover:underline underline"
            >
              support@affordablewellness.com
            </a>
            .
          </p>

          <p className="text-lg mb-6 leading-relaxed">
            By signing and/or opting to agree to this form, I understand and agree
            with the following:
          </p>

          <p className="text-lg mb-6 leading-relaxed">
            Telehealth/Telemedicine (&ldquo;telehealth&rdquo;) involves the use of
            electronic communications to enable Authorized Providers at different
            locations to share individual patient medical information for the
            purpose of improving patient care. I consent to receive treatment via
            telehealth from Affordable Wellness LLC Authorized Providers.
            Authorized Providers may include primary care practitioners,
            specialists and/or subspecialists, nurse practitioners, registered
            nurses, medical assistants, and other healthcare providers who are
            part of my clinical care team. In addition to myself and the members of
            my clinical care team, I may choose to have my family members,
            caregivers, or other legal representatives or guardians join and
            participate in the telehealth service, and I may agree to share my
            personal information with such family members, caregivers, legal
            representatives, or guardians if I choose to have them join in my
            telehealth services. The information may be used for diagnosis,
            therapy, follow-up and/or education.
          </p>

          <p className="text-lg mb-4 leading-relaxed">
            Telehealth/Telemedicine requires transmission, via Internet or
            tele-communication device, of health information, which may include:
          </p>
          <ul className="list-disc pl-8 mb-6 text-lg leading-relaxed space-y-2">
            <li>
              Progress reports, assessments, or other intervention-related
              documents; and
            </li>
            <li>
              Videos, pictures, text messages, audio, and any digital form of data
            </li>
          </ul>

          <p className="text-lg mb-6 leading-relaxed">
            The laws that protect the privacy and confidentiality of health and
            care information also apply to telehealth. Information obtained during
            telehealth services that identify me will only be provided to someone
            with consent, except for purposes of treatment and healthcare
            operations. By agreeing to use the telehealth services, I am
            consenting to the sharing of my protected health information with
            certain third parties as more fully described in Affordable
            Wellness&apos;s{" "}
            <Link
              to="/privacypolicy"
              className="text-[#2D476F] hover:underline underline"
            >
              Privacy Policy
            </Link>
            . I understand and expressly consent to Affordable Wellness LLC
            obtaining, using, storing, and disseminating to necessary third
            parties, information about me, as necessary to provide the telehealth
            services and as specified in the Privacy Policy.
          </p>

          <p className="text-lg mb-6 leading-relaxed">
            I understand that I must check the Website for messages because this is
            the way that the Authorized Provider will communicate important
            information to me. I understand that if I do not check the Website
            regularly, then my care may be delayed.
          </p>

          <p className="text-lg mb-6 leading-relaxed">
            I understand that if I have any questions relating to my care that are
            not urgent, I can message the Authorized Provider through the Website.
            I understand that the Authorized Provider may not review and respond to
            my messages until the next business day depending on when the message
            was sent.
          </p>

          <p className="text-lg mb-6 leading-relaxed">
            Telehealth sessions may not always be possible. Disruptions of signals
            or problems with the Internet&apos;s infrastructure may cause broadcast
            and reception problems (e.g., poor picture or sound quality, dropped
            connections, audio interference) that prevent effective interaction
            between the Authorized Provider, participant, patient, or care team.
          </p>

          <p className="text-lg mb-6 leading-relaxed">
            I hereby release and hold harmless Affordable Wellness and all members
            of my care team from any loss of data or information due to technical
            failures associated with the telehealth service. I understand and agree
            that the health information I provide at the time of my telehealth
            service may be the only source of health information used by the
            Authorized Provider during my evaluation and treatment at the time of
            my telehealth visit, and that such Authorized Provider may not have
            access to my full medical record or information.
          </p>

          <p className="text-lg mb-6 leading-relaxed">
            For more details about how Affordable Wellness protects and uses your
            health information see our{" "}
            <Link
              to="/privacypolicy"
              className="text-[#2D476F] hover:underline underline"
            >
              Privacy Policy
            </Link>
            .
          </p>

          <p className="text-lg mb-6 leading-relaxed">
            I understand that I will be given information about tests, treatments,
            and procedures, as applicable, including the benefits, risks, possible
            problems or complications, and alternate choices for my medical care
            through the telehealth visit.
          </p>

          <p className="text-lg mb-6 leading-relaxed">
            I have the right to withhold or withdraw consent to the use of
            telehealth services at any time and revert to traditional in-person
            clinic services. I understand that if I withdraw my consent for
            telehealth, it will not affect any future services or care benefits to
            which I am entitled.
          </p>

          <p className="text-lg mb-6 leading-relaxed">
            I hereby consent to the use of telehealth in the provision of care and
            the above terms and conditions.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TelehealthConsent;

import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import React, { useEffect } from 'react'

const CCPA = () => {
         useEffect(() => {
            window.scrollTo(0, 0);
          }, []);
  return (
    <div>
        <Navbar/>
        <div className="mx-auto pt-[80.8px] mb-8">
            <div className="py-6  px-4 bg-[#eaebf5] mb-8">
                <h2 className="text-3xl lg:text-6xl sm:text-4xl md:text-3xl font-bold  text-primary container mx-auto text-center md:text-left">
                    California Privacy Act
                </h2>
            </div>
            <div className="container px-3 sm:px-3 md:px-4 lg:px-8 mx-auto">
                <p className="mb-6 leading-relaxed text-lg">
                    This California Privacy Notice ("Notice") is in addition to, and
                    incorporated into, the Privacy Policy of Affordable Wellness and
                    its owners and affiliates (collectively, "we," "us," or "our") and
                    applies to personal information that we collect online or offline from
                    California residents ("consumers" or "you" or "your").
                </p>
                <h2 className='text-lg font-bold mt-10 mb-4'>Information We Collect</h2>
                <p className="mb-6 leading-relaxed text-lg">
                    We have collected the following categories of personal information from
                    consumers within the last twelve (12) months:
                </p>

                {/* Table Section */}
                <div className="overflow-x-auto mb-8 leading-relaxed text-lg">
                    <table className="w-full border border-gray-300 text-left border-collapse">
                    <thead className="">
                        <tr>
                        <th className="border border-gray-300 px-4 py-2">Category</th>
                        <th className="border border-gray-300 px-4 py-2">Examples</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                        <td className="border border-gray-300 px-4 py-2">A. Identifiers and Contact Information.</td>
                        <td className="border border-gray-300 px-4 py-2">Your name, postal address, telephone number or email address.</td>
                        </tr>
                        <tr>
                        <td className="border border-gray-300 px-4 py-2">B. Medical and financial Information.</td>
                        <td className="border border-gray-300 px-4 py-2">Your credit card, debit card or health plan.</td>
                        </tr>
                        <tr>
                        <td className="border border-gray-300 px-4 py-2">C. Protected classifications</td>
                        <td className="border border-gray-300 px-4 py-2">Age, gender, race, medical condition, disability.</td>
                        </tr>
                        <tr>
                        <td className="border border-gray-300 px-4 py-2">D. Commercial information.</td>
                        <td className="border border-gray-300 px-4 py-2">Records of products or services you have purchased.</td>
                        </tr>
                        <tr>
                        <td className="border border-gray-300 px-4 py-2">E. Internet or other similar network activity.</td>
                        <td className="border border-gray-300 px-4 py-2">Browsing history, search history, or your interaction with the Website.</td>
                        </tr>
                        <tr>
                        <td className="border border-gray-300 px-4 py-2">F. Geolocation data.</td>
                        <td className="border border-gray-300 px-4 py-2">Your physical location or movements.</td>
                        </tr>
                    </tbody>
                    </table>
                </div>

                <h2 className="text-lg font-bold mb-4">Use of Personal Information</h2>
                <p className="mb-4 leading-relaxed text-lg">We use this personal information for one or more of the following business purposes:</p>
                <ul className="list-disc pl-6 mb-6 space-y-2 leading-relaxed text-lg">
                    <li>To provide our products and services, such as to process drug claims and, for fulfilling orders.</li>
                    <li>To provide patient care, customer service, such as to respond to inquiries and requests, verify your identity, and, to maintain your Account.</li>
                    <li>To analyze use of our products and services as well as customize and improve them.</li>
                    <li>For marketing, such as to provide you with email alerts about products or services offered by us and/or third parties that may be of interest to you.</li>
                    <li>To maintain the security of our products, services and systems, such as detecting security breaches or fraudulent activity.</li>
                    <li>To keep our website and other functioning properly, such as debugging and fixing errors.</li>
                    <li>To comply with our legal obligations.</li>
                    <li>To protect our rights, property, and safety or the rights, property, and safety of others.</li>
                </ul>

                <p className="mb-6 leading-relaxed text-lg">
                    We do not sell your personal information.
                </p>

                <h2 className="text-lg font-bold mb-4">Sharing of Personal Information</h2>
                <p className="mb- leading-relaxed text-lg">
                    We may share personal information we collect with third parties for a business purpose, such as to pharmacies to fill your prescription, marketing partners, advertising networks, clients that sponsor discount cards, and service providers that helps us operate or provide our services, including but not limited to data storage companies and internet service providers. When we share personal information with our service providers, we require that they agree to protect the personal information and use and disclose it only to provide their services to us and for limited business purposes, such as to detect security breaches and comply with their legal obligations.
                </p>
                <p className="mb-4 leading-relaxed text-lg">In the past twelve (12) months, we have shared the following categories of personal information for a business purpose with the following categories of third parties:</p>

                <div className="overflow-x-auto mb-8 leading-relaxed text-lg">
                    <table className="w-full border border-gray-300 text-left border-collapse">
                    <thead className="">
                        <tr>
                        <th className="border border-gray-300 px-4 py-2">Category</th>
                        <th className="border border-gray-300 px-4 py-2">Third Parties</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                        <td className="border border-gray-300 px-4 py-2">A. Identifiers and Contact Information.</td>
                        <td className="border border-gray-300 px-4 py-2">Service providers; Pharmacies and other health care providers; Product providers and distributors; Operating systems and platforms; Social networks; Marketing partners; Clients</td>
                        </tr>
                        <tr>
                        <td className="border border-gray-300 px-4 py-2">B. Medical and financial Information.</td>
                        <td className="border border-gray-300 px-4 py-2">Service providers; Pharmacies and other health care providers; Product providers and distributors; Operating systems and platforms; Social networks; Marketing partners; Clients</td>
                        </tr>
                        <tr>
                        <td className="border border-gray-300 px-4 py-2">C. Protected classifications</td>
                        <td className="border border-gray-300 px-4 py-2">Service providers; Pharmacies and other health care providers; Product providers and distributors; Operating systems and platforms; Social networks; Marketing partners; Clients</td>
                        </tr>
                        <tr>
                        <td className="border border-gray-300 px-4 py-2">D. Commercial information.</td>
                        <td className="border border-gray-300 px-4 py-2">Service providers</td>
                        </tr>
                        <tr>
                        <td className="border border-gray-300 px-4 py-2">E. Internet or other similar network activity.</td>
                        <td className="border border-gray-300 px-4 py-2">Service providers</td>
                        </tr>
                        <tr>
                        <td className="border border-gray-300 px-4 py-2">F. Geolocation data.</td>
                        <td className="border border-gray-300 px-4 py-2">Service providers</td>
                        </tr>
                    </tbody>
                    </table>
                </div>

                <h2 className="text-lg font-bold mb-4">Your Rights and Choices</h2>
                <p className="mb-4 leading-relaxed text-lg">This section describes your privacy rights and explains how to exercise them.</p>
                <p className="mb-4 leading-relaxed text-lg italic">Right to Know</p>
                <p className="mb-4 leading-relaxed text-lg">You have the right to know, subject to certain exceptions, the following about the personal information we collected about you over the past 12 months:</p>
                <ul className="list-disc pl-6 space-y-2 mb-4 leading-relaxed text-lg">
                    <li>The categories of the personal information;</li>
                    <li>The categories of sources of the personal information;</li>
                    <li>The business or commercial purpose for collecting that personal information;</li>
                    <li>The categories of personal information shared for a business purpose; and</li>
                    <li>The categories of third parties with whom the personal information is shared.</li>
                </ul>

                <p className="mb-4 leading-relaxed text-lg italic">Right to Delete</p>
                <p className="mb-4 leading-relaxed text-lg">You have the right to request that we delete the personal information that we collected from you, subject to certain exceptions.</p>

                <p className="mb-4 leading-relaxed text-lg italic">Right to Opt-Out of the Sale of Personal Information</p>
                <p className="mb-4 leading-relaxed text-lg">You have the right to opt-out of the sale of your personal information. We do not sell personal information.</p>

                <p className="mb-4 leading-relaxed text-lg italic">The Right to Non-Discrimination.</p>
                <p className="mb-4 leading-relaxed text-lg">You have the right not to be discriminated against for exercising these rights.</p>

                <p className="mb-4 leading-relaxed text-lg italic">Submitting Requests to Know and Delete Personal Information</p>
                <p className="mb-4 leading-relaxed text-lg">You may submit a request to know or delete by submitting a request to us by either:</p>
                <ul className="list-disc pl-6 space-y-2 mb-4 leading-relaxed text-lg">
                    <li>Emailing us{" "}
                    <a
                    href="mailto:support@affordablewellness.com"
                    className="text-[#2D476F] hover:underline underline"
                    >
                    support@affordablewellness.com
                    </a></li>
                    <li>Visiting our website at the and contacting us at link on{" "}
                    <a href="https://www.affordablewellness.com/contact-us/" className="text-[#2D476F] hover:underline underline" target="_blank" rel="noopener noreferrer">
                    affordablewellness.com/contact-us
                    </a></li>
                </ul>
                <p className="mb-4 leading-relaxed text-lg">To process your request, we must be able to verify your identity i.e., confirm that the person making the request is the person about whom we collected the personal information, or is someone authorized to act as the authorized agent on that person’s behalf. We will verify your identity by asking that you provide certain information to us that will allow us to confirm you are who you say you are, such as contact information, Account information and/or health information.</p>
                <p className='mb-4 leading-relaxed text-lg'>You may designate an authorized agent to make a request on your behalf. When you use an authorized agent to submit a request for access or deletion, you must provide the authorized agent with written permission to do so, and, in certain circumstances, we may ask you to verify your own identity directly with us. We may deny a request from an authorized agent that does not submit proof that they have been authorized by you to act on your behalf.</p>
                <p className='mb-4 leading-relaxed text-lg'>Only a parent or legal guardian may submit a request to know or delete the personal information of a child under the age of 13. We may ask a requestor on behalf of a child under 13 to sign a consent form under penalty of perjury or to speak by telephone to trained personnel to confirm that the requestor is the parent or legal guardian of the child.</p>
                <p className='mb-4 leading-relaxed text-lg'>You may only make a request to know or delete your personal information twice within a 12-month period.</p>

                <p className="mb-4 leading-relaxed text-lg italic">Response Timing and Format</p>
                <p className='mb-4 leading-relaxed text-lg'>We will confirm receipt of your request to know or delete within 10 business days and will provide information on how we will process your request, including our verification process and when you can expect a response.</p>

                <h2 className="text-lg font-bold mb-4">Changes to Our Privacy Notice</h2>
                <p className="mb-4 leading-relaxed text-lg">
                   We may change this Notice at any time, but we will not use personal information that we have already collected for a new purpose that is materially different from those stated in our Notice at the time that personal information was collected without first obtaining your explicit consent to use it for the new purpose.
                </p>

                <h2 className="text-lg font-bold mb-4">Contact Information</h2>
                <p className='mb-4 leading-relaxed text-lg'>If you have any questions or concerns about this Privacy Notice, our privacy policies and practices, you may contact us at:</p>
                <p className='mb-4 leading-relaxed text-lg'>
                    Email:{" "}
                    <a
                    href="mailto:support@affordablewellness.com"
                    className="text-[#2D476F] hover:underline underline"
                    >
                    support@affordablewellness.com
                    </a>{" "}
                   Affordable Wellness LLC
                </p>

                <p className='mb-4 leading-relaxed text-lg' >South Carolina, P.O. Box 1493, <br /> Loris SC 29569</p>
                  

            </div>
        </div>
        <Footer/>
    </div>
  )
}

export default CCPA
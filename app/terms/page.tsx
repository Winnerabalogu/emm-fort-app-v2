import React from 'react';
import { FileText, Users, Shield, AlertTriangle, Scale, Globe, Mail, Phone } from 'lucide-react';

const TermsOfService = () => {
  const lastUpdated = "August 19, 2025";

  const sections = [
    {
      id: "acceptance",
      title: "Acceptance of Terms",
      icon: <FileText className="h-5 w-5" />,
      content: `By accessing and using any EMM-Fort Group websites, services, or products, you accept and agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not access or use our services.

These Terms apply to all subsidiaries of EMM-Fort Group, including but not limited to:
• EMM-Fort Nigeria
• EMM-Fort Logistics  
• EMM-Fort Realty
• EMM-Fort Events
• EMM-Fort Consulting
• EMM-Fort Affiliate Sales`
    },
    {
      id: "definitions",
      title: "Definitions",
      icon: <FileText className="h-5 w-5" />,
      content: `"Services" refers to all websites, applications, products, and services provided by EMM-Fort Group and its subsidiaries.

"User," "you," and "your" refer to any individual or entity accessing or using our Services.

"Content" includes all text, images, videos, software, and other materials available through our Services.

"Account" refers to any registered user account created to access our Services.`
    },
    {
      id: "eligibility",
      title: "Eligibility and Registration",
      icon: <Users className="h-5 w-5" />,
      content: `You must be at least 18 years old to use our Services or have parental consent if you are between 13-17 years old.

When creating an account, you must:
• Provide accurate and complete information
• Maintain the security of your account credentials
• Be responsible for all activity under your account
• Notify us immediately of any unauthorized access

You may only maintain one account per service unless explicitly authorized otherwise.`
    },
    {
      id: "use-of-services",
      title: "Permitted Use of Services",
      icon: <Shield className="h-5 w-5" />,
      content: `You may use our Services for lawful purposes only. You agree not to:

• Violate any applicable laws or regulations
• Infringe upon intellectual property rights
• Transmit harmful, offensive, or inappropriate content
• Attempt to gain unauthorized access to our systems
• Use our Services for fraudulent or deceptive purposes
• Interfere with or disrupt our Services
• Collect user information without consent
• Engage in any form of harassment or abuse`
    },
    {
      id: "payments-refunds",
      title: "Payments and Refunds",
      icon: <Scale className="h-5 w-5" />,
      content: `Payment terms vary by service and will be clearly communicated at the time of purchase.

General refund policy:
• Refund eligibility depends on the specific service purchased
• Requests must be submitted within the specified timeframe
• Processing may take 5-10 business days
• Some services may have no-refund policies (clearly indicated at purchase)

For EMM-Fort Affiliate Sales specifically:
• All registration and upgrade fees are non-refundable
• This applies regardless of account activity or performance
• Please review terms carefully before payment`
    },
    {
      id: "intellectual-property",
      title: "Intellectual Property",
      icon: <Shield className="h-5 w-5" />,
      content: `All content, trademarks, logos, and intellectual property on our Services are owned by EMM-Fort Group or licensed to us. You may not:

• Copy, modify, or distribute our content without permission
• Use our trademarks or logos without authorization
• Create derivative works based on our Services
• Remove or alter any proprietary notices

Any content you submit to our Services remains your property, but you grant us a license to use it in connection with our Services.`
    },
    {
      id: "privacy-data",
      title: "Privacy and Data Protection",
      icon: <Shield className="h-5 w-5" />,
      content: `Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference.

By using our Services, you consent to:
• Collection and processing of your personal data as described in our Privacy Policy
• Transfer of data to service providers and partners as necessary
• Use of cookies and tracking technologies to improve our Services

You have rights regarding your personal data as outlined in our Privacy Policy.`
    },
    {
      id: "disclaimers",
      title: "Disclaimers and Limitations",
      icon: <AlertTriangle className="h-5 w-5" />,
      content: `Our Services are provided "as is" without warranties of any kind. We disclaim all warranties, express or implied, including but not limited to:

• Merchantability and fitness for a particular purpose
• Uninterrupted or error-free operation
• Accuracy or reliability of content
• Security of data transmission

We are not liable for:
• Indirect, incidental, or consequential damages
• Loss of profits, data, or business opportunities  
• Third-party content or services
• Service interruptions or technical issues

Our total liability is limited to the amount paid by you for our Services in the 12 months preceding the claim.`
    },
    {
      id: "indemnification",
      title: "Indemnification",
      icon: <Scale className="h-5 w-5" />,
      content: `You agree to indemnify and hold harmless EMM-Fort Group, its subsidiaries, officers, directors, employees, and agents from any claims, damages, losses, or expenses arising from:

• Your use of our Services
• Violation of these Terms
• Infringement of third-party rights
• Your content or conduct

This indemnification survives termination of these Terms.`
    },
    {
      id: "termination",
      title: "Termination",
      icon: <AlertTriangle className="h-5 w-5" />,
      content: `We may terminate or suspend your access to our Services at any time, with or without cause, including for:

• Violation of these Terms
• Fraudulent or illegal activity
• Extended inactivity
• Non-payment of fees

Upon termination:
• Your right to use our Services ceases immediately
• You remain liable for any outstanding obligations
• Provisions regarding liability, indemnification, and dispute resolution survive

You may terminate your account at any time by contacting us.`
    },
    {
      id: "governing-law",
      title: "Governing Law and Disputes",
      icon: <Globe className="h-5 w-5" />,
      content: `These Terms are governed by the laws of Nigeria without regard to conflict of law principles.

Any disputes arising from these Terms or our Services shall be resolved through:
• Good faith negotiation first
• Binding arbitration in Lagos, Nigeria if negotiation fails
• Nigerian courts for disputes not subject to arbitration

You agree to resolve disputes individually and waive any right to class action proceedings.`
    },
    {
      id: "changes",
      title: "Changes to Terms",
      icon: <FileText className="h-5 w-5" />,
      content: `We may modify these Terms at any time. Material changes will be communicated through:

• Email notification to registered users
• Prominent notice on our website
• Updated "Last Modified" date

Continued use of our Services after changes constitutes acceptance of the updated Terms. If you disagree with changes, you must stop using our Services.`
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-black text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <FileText className="h-16 w-16 mx-auto mb-6 text-orange-500" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
            <p className="text-xl text-gray-300 mb-6">
              Please read these terms carefully before using any EMM-Fort Group services.
            </p>
            <div className="inline-flex items-center bg-orange-600/20 px-4 py-2 rounded-full">
              <span className="text-orange-300">Last updated: {lastUpdated}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Important Notice */}
      <div className="bg-red-50 border-l-4 border-red-500 p-6 mx-4 mt-8 rounded-r-lg">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start">
            <AlertTriangle className="h-6 w-6 text-red-500 flex-shrink-0 mt-1 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-red-800 mb-2">Important Legal Agreement</h3>
              <p className="text-red-700">
                These Terms of Service constitute a legally binding agreement between you and EMM-Fort Group. 
                By using our services, you acknowledge that you have read, understood, and agreed to these terms.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Table of Contents */}
          <div className="bg-gray-50 p-6 rounded-2xl mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Table of Contents</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sections.map((section, index) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-white transition-colors group"
                >
                  <div className="text-orange-600 group-hover:text-orange-700">
                    {section.icon}
                  </div>
                  <span className="text-gray-700 group-hover:text-gray-900 font-medium">
                    {index + 1}. {section.title}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-12">
            {sections.map((section, index) => (
              <section key={section.id} id={section.id} className="scroll-mt-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center justify-center w-12 h-12 bg-orange-600 text-white rounded-xl">
                    {section.icon}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {index + 1}. {section.title}
                    </h2>
                  </div>
                </div>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                    {section.content}
                  </p>
                </div>
              </section>
            ))}
          </div>

          {/* Contact Information */}
          <div className="mt-16 bg-gradient-to-r from-orange-600 to-red-600 text-white p-8 rounded-2xl">
            <h2 className="text-2xl font-bold mb-6">Questions About These Terms?</h2>
            <p className="mb-6">
              If you have any questions about these Terms of Service, please contact our legal team:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Email</p>
                  <a href="mailto:legal@emmfortgroup.com" className="hover:text-orange-200 transition-colors">
                    legal@emmfortgroup.com
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Phone</p>
                  <a href="tel:+2347036082070" className="hover:text-orange-200 transition-colors">
                    +234 (7) 036 082 070
                  </a>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-white/20">
              <p className="text-sm text-orange-100">
                <strong>EMM-Fort Group</strong><br />
                Lagos, Nigeria
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
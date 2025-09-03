import React from 'react';
import { Shield, Eye, Database, Lock, Users, Globe, Mail, Phone } from 'lucide-react';

const PrivacyPolicy = () => {
  const lastUpdated = "August 19, 2025";

  const sections = [
    {
      id: "introduction",
      title: "Introduction",
      icon: <Shield className="h-5 w-5" />,
      content: `EMM-Fort Group ("we," "our," or "us") is committed to protecting and respecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website at https://emmfortgroup.com or engage with any of our subsidiary companies and services.`
    },
    {
      id: "information-we-collect",
      title: "Information We Collect",
      icon: <Database className="h-5 w-5" />,
      content: `We collect information you provide directly to us, such as when you create an account, make a purchase, subscribe to our newsletter, or contact us. This may include:
      
• Personal identifiers (name, email address, phone number, postal address)
• Professional information (company name, job title, industry)
• Financial information (payment details, billing information)
• Communication preferences and marketing consents
• Device and usage information when you interact with our websites and services`
    },
    {
      id: "how-we-use-information",
      title: "How We Use Your Information",
      icon: <Eye className="h-5 w-5" />,
      content: `We use the information we collect to:

• Provide, maintain, and improve our services across all EMM-Fort Group companies
• Process transactions and send related information
• Send marketing communications (with your consent)
• Respond to your comments, questions, and customer service requests
• Monitor and analyze usage patterns to improve user experience
• Detect, prevent, and address technical issues and fraudulent activity
• Comply with legal obligations and enforce our terms`
    },
    {
      id: "information-sharing",
      title: "Information Sharing and Disclosure",
      icon: <Users className="h-5 w-5" />,
      content: `We may share your information in the following situations:

• With EMM-Fort Group subsidiary companies to provide integrated services
• With trusted service providers who assist us in operating our business
• When required by law, regulation, or legal process
• To protect the rights, property, or safety of EMM-Fort Group, our users, or others
• In connection with a business transaction (merger, acquisition, or sale)
• With your explicit consent for specific purposes`
    },
    {
      id: "data-security",
      title: "Data Security",
      icon: <Lock className="h-5 w-5" />,
      content: `We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no internet transmission is completely secure, and we cannot guarantee absolute security.`
    },
    {
      id: "international-transfers",
      title: "International Data Transfers",
      icon: <Globe className="h-5 w-5" />,
      content: `As a Nigerian-based company with international operations, your information may be transferred to and processed in countries other than Nigeria. We ensure appropriate safeguards are in place for such transfers in accordance with applicable data protection laws.`
    },
    {
      id: "your-rights",
      title: "Your Rights",
      icon: <Shield className="h-5 w-5" />,
      content: `Depending on your location, you may have the following rights regarding your personal information:

• Right to access and receive a copy of your personal data
• Right to rectify inaccurate or incomplete information
• Right to erase your personal data in certain circumstances
• Right to restrict or object to processing of your data
• Right to data portability
• Right to withdraw consent (where processing is based on consent)

To exercise these rights, please contact us using the information provided below.`
    },
    {
      id: "cookies-tracking",
      title: "Cookies and Tracking Technologies",
      icon: <Database className="h-5 w-5" />,
      content: `We use cookies and similar tracking technologies to enhance your browsing experience. For detailed information about our use of cookies, please refer to our Cookie Policy. You can manage your cookie preferences through your browser settings.`
    },
    {
      id: "third-party-links",
      title: "Third-Party Links",
      icon: <Globe className="h-5 w-5" />,
      content: `Our websites may contain links to third-party websites. We are not responsible for the privacy practices of these external sites. We encourage you to read the privacy policies of any third-party websites you visit.`
    },
    {
      id: "children-privacy",
      title: "Children's Privacy",
      icon: <Shield className="h-5 w-5" />,
      content: `Our services are not intended for children under 18 years of age. We do not knowingly collect personal information from children under 18. If we become aware that we have collected such information, we will take steps to delete it promptly.`
    },
    {
      id: "changes",
      title: "Changes to This Privacy Policy",
      icon: <Eye className="h-5 w-5" />,
      content: `We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on our website and updating the "Last Updated" date. Your continued use of our services after such changes constitutes acceptance of the updated policy.`
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-black text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Shield className="h-16 w-16 mx-auto mb-6 text-orange-500" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-xl text-gray-300 mb-6">
              Your privacy is important to us. Learn how we collect, use, and protect your information.
            </p>
            <div className="inline-flex items-center bg-orange-600/20 px-4 py-2 rounded-full">
              <span className="text-orange-300">Last updated: {lastUpdated}</span>
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
            <h2 className="text-2xl font-bold mb-6">Contact Us</h2>
            <p className="mb-6">
              If you have any questions about this Privacy Policy or our privacy practices, please contact us:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Email</p>
                  <a href="mailto:privacy@emmfortgroup.com" className="hover:text-orange-200 transition-colors">
                    privacy@emmfortgroup.com
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

export default PrivacyPolicy;
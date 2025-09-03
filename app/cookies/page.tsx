"use client"
import React, { useState } from 'react';
import { Cookie, Settings, Shield, BarChart3, Target, Globe, Mail, Phone, ChevronDown, ChevronRight } from 'lucide-react';

const CookiePolicy = () => {
  const lastUpdated = "August 19, 2025";
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const cookieTypes = [
    {
      id: "essential",
      title: "Essential Cookies",
      icon: <Shield className="h-5 w-5" />,
      description: "These cookies are necessary for the website to function and cannot be switched off.",
      examples: [
        "Authentication tokens to keep you logged in",
        "Security cookies to prevent cross-site request forgery",
        "Session cookies to maintain your preferences during your visit",
        "Load balancing cookies to distribute traffic across servers"
      ],
      canDisable: false,
      retention: "Session or up to 24 hours"
    },
    {
      id: "functional",
      title: "Functional Cookies",
      icon: <Settings className="h-5 w-5" />,
      description: "These cookies enable enhanced functionality and personalization.",
      examples: [
        "Language and region preferences",
        "Font size and accessibility settings",
        "Form data to prevent loss during completion",
        "Chat widget preferences and history"
      ],
      canDisable: true,
      retention: "Up to 1 year"
    },
    {
      id: "analytics",
      title: "Analytics Cookies",
      icon: <BarChart3 className="h-5 w-5" />,
      description: "These cookies help us understand how visitors interact with our website.",
      examples: [
        "Google Analytics for traffic analysis",
        "Page view counts and popular content tracking",
        "User journey and behavior analysis",
        "Performance metrics and error tracking"
      ],
      canDisable: true,
      retention: "Up to 2 years"
    },
    {
      id: "marketing",
      title: "Marketing Cookies",
      icon: <Target className="h-5 w-5" />,
      description: "These cookies are used to deliver relevant advertisements and track campaign effectiveness.",
      examples: [
        "Social media integration and sharing",
        "Remarketing pixels for targeted advertising",
        "Conversion tracking for marketing campaigns",
        "Third-party advertising platform cookies"
      ],
      canDisable: true,
      retention: "Up to 2 years"
    }
  ];

  const sections = [
    {
      id: "what-are-cookies",
      title: "What Are Cookies?",
      icon: <Cookie className="h-5 w-5" />,
      content: `Cookies are small text files that are stored on your device (computer, smartphone, or tablet) when you visit a website. They contain information that helps websites remember your preferences, login status, and other details about your visit.

Cookies can be:
• First-party cookies: Set directly by EMM-Fort Group websites
• Third-party cookies: Set by external services we use (analytics, advertising, etc.)
• Session cookies: Deleted when you close your browser
• Persistent cookies: Remain on your device for a specified period`
    },
    {
      id: "why-we-use-cookies",
      title: "Why We Use Cookies",
      icon: <Settings className="h-5 w-5" />,
      content: `We use cookies to:

• Ensure our websites function properly and securely
• Remember your preferences and settings
• Analyze how you use our websites to improve user experience
• Provide personalized content and recommendations
• Deliver relevant marketing messages
• Measure the effectiveness of our advertising campaigns
• Integrate with social media platforms
• Provide customer support through chat widgets`
    },
    {
      id: "managing-cookies",
      title: "Managing Your Cookie Preferences",
      icon: <Settings className="h-5 w-5" />,
      content: `You have several options for managing cookies:

Browser Settings:
• Most browsers allow you to view, delete, and block cookies
• You can usually find these settings in your browser's privacy or security section
• Note that blocking essential cookies may affect website functionality

Cookie Consent Tool:
• When you first visit our website, you'll see a cookie consent banner
• You can accept all cookies, reject non-essential cookies, or customize your preferences
• You can change your preferences at any time by clicking the cookie settings link in our footer

Opt-out Tools:
• Google Analytics: Use Google's opt-out browser add-on
• Advertising cookies: Visit www.aboutads.info/choices or www.youronlinechoices.eu`
    },
    {
      id: "third-party-cookies",
      title: "Third-Party Cookies",
      icon: <Globe className="h-5 w-5" />,
      content: `We work with trusted third-party services that may set their own cookies:

Analytics Services:
• Google Analytics - Web traffic analysis
• Microsoft Clarity - User behavior analytics
• Facebook Pixel - Social media integration

Marketing Platforms:
• Google Ads - Advertising and remarketing
• Facebook Ads - Social media advertising
• LinkedIn Marketing - Professional network advertising

Other Services:
• YouTube - Video content embedding
• Typeform - Survey and form functionality
• Intercom - Customer support chat

Each third-party service has its own privacy policy and cookie practices. We encourage you to review their policies for more information.`
    },
    {
      id: "cookie-retention",
      title: "Cookie Retention Periods",
      icon: <Shield className="h-5 w-5" />,
      content: `Different cookies have different retention periods:

Session Cookies:
• Automatically deleted when you close your browser
• Used for essential functionality during your visit

Short-term Cookies (up to 30 days):
• Authentication and security cookies
• Temporary preferences and settings

Medium-term Cookies (30 days to 1 year):
• User preferences and personalization
• Some analytics and performance cookies

Long-term Cookies (up to 2 years):
• Marketing and advertising cookies
• Comprehensive analytics data

You can delete cookies at any time through your browser settings, and we regularly review and clean up unnecessary cookie data.`
    },
    {
      id: "updates",
      title: "Updates to This Policy",
      icon: <Cookie className="h-5 w-5" />,
      content: `We may update this Cookie Policy periodically to reflect:

• Changes in our cookie usage
• New third-party services we integrate
• Updates to data protection regulations
• Improvements to our privacy practices

When we make significant changes, we will:
• Update the "Last Updated" date at the top of this policy
• Notify users through our website banner or email
• Request new consent where required by law

We encourage you to review this policy periodically to stay informed about our cookie practices.`
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-black text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Cookie className="h-16 w-16 mx-auto mb-6 text-orange-500" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Cookie Policy</h1>
            <p className="text-xl text-gray-300 mb-6">
              Learn about how we use cookies and how you can manage your preferences.
            </p>
            <div className="inline-flex items-center bg-orange-600/20 px-4 py-2 rounded-full">
              <span className="text-orange-300">Last updated: {lastUpdated}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cookie Types Overview */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Types of Cookies We Use</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            {cookieTypes.map((cookie) => (
              <div key={cookie.id} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-orange-600 text-white rounded-xl">
                    {cookie.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{cookie.title}</h3>
                    <p className="text-sm text-gray-500">Retention: {cookie.retention}</p>
                  </div>
                  <div className="ml-auto">
                    {cookie.canDisable ? (
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        Optional
                      </span>
                    ) : (
                      <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        Required
                      </span>
                    )}
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4">{cookie.description}</p>
                
                <div className="space-y-2">
                  <button
                    onClick={() => toggleSection(cookie.id)}
                    className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium"
                  >
                    {expandedSections[cookie.id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    View Examples
                  </button>
                  
                  {expandedSections[cookie.id] && (
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 pl-6">
                      {cookie.examples.map((example, index) => (
                        <li key={index}>{example}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Sections */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Table of Contents */}
            <div className="bg-white p-6 rounded-2xl mb-12 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Additional Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {sections.map((section, index) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
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
                <section key={section.id} id={section.id} className="bg-white p-8 rounded-2xl shadow-sm scroll-mt-8">
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
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-gray-900 to-black text-white p-8 rounded-2xl">
            <h2 className="text-2xl font-bold mb-6">Questions About Cookies?</h2>
            <p className="mb-6">
              If you have any questions about our use of cookies or this Cookie Policy, please contact us:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Email</p>
                  <a href="mailto:privacy@emmfortgroup.com" className="hover:text-orange-300 transition-colors">
                    admin@emmfortgroup.com
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Phone</p>
                  <a href="tel:+2347036082070" className="hover:text-orange-300 transition-colors">
                   +234 (7) 036 082 070
                  </a>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-700">
              <p className="text-sm text-gray-300">
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

export default CookiePolicy;
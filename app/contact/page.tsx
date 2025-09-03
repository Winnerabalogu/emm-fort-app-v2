// app/contact/page.tsx
import { Metadata } from 'next';
import ContactForm from '@/components/ContactForm';
import CompanyHeader from '@/components/company/CompanyHeader';
import CompanyFooter from '@/components/company/CompanyFooter';
import { Mail, Phone, MapPin, Clock, MessageSquare, Users } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Contact Us | EMM-Fort Group',
  description: 'Get in touch with EMM-Fort Group. We\'re here to help with your questions about our companies, services, and opportunities.',
  openGraph: {
    title: 'Contact EMM-Fort Group',
    description: 'Get in touch with us for questions about our companies and services.',
    type: 'website',
  },
};

const ContactPage = () => {
  const contactInfo = [
    {
      icon: Mail,
      title: 'Email Us',
      details: 'admin@emmfortgroup.com',
      description: 'Send us an email and we\'ll respond within 24 hours',
      href: 'mailto:admin@emmfortgroup.com'
    },
    {
      icon: Phone,
      title: 'Call Us',
      details: '+234 (7) 036 082 070',
      description: 'Available Monday to Friday, 9 AM - 6 PM WAT',
      href: 'tel:+2347036082070'
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      details: '21, Americana Street, Ikotun Lagos',
      description: 'Our headquarters in the heart of Lagos',
      href: 'https://maps.google.com'
    },
    {
      icon: Clock,
      title: 'Business Hours',
      details: 'Mon - Fri: 9 AM - 6 PM',
      description: 'Saturday: 10 AM - 4 PM | Sunday: Closed',
      href: null
    }
  ];

  const faqs = [
    {
      question: 'How quickly do you respond to inquiries?',
      answer: 'We typically respond to all inquiries within 24 hours during business days. For urgent matters, please call us directly.'
    },
    {
      question: 'Which company should I contact for my specific need?',
      answer: 'You can use this general contact form for any inquiry. We\'ll route your message to the appropriate company within our group.'
    },
    {
      question: 'Do you offer consultations?',
      answer: 'Yes! EMM-Fort Consulting offers professional consultations. Mention this in your message and we\'ll connect you with our consulting team.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <CompanyHeader 
        logoUrl="/logos/og-logo.png"
        companyName="EMM-Fort Group"
        showBackButton={true}
      />
      
      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="container mx-auto px-4 text-center mb-16">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <MessageSquare className="h-4 w-4" />
              <span>Get In Touch</span>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              Let&apos;s Start a <span className="text-orange-600">Conversation</span>
            </h1>
            
            <p className="text-xl text-gray-600 leading-relaxed">
              Whether you have a question about our services, need support, or want to explore partnership opportunities, 
              we&apos;re here to help. Our team is ready to assist you.
            </p>
          </div>
        </section>

        {/* Contact Methods */}
        <section className="container mx-auto px-4 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => {
              const Icon = info.icon;
              const content = (
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 h-full group hover:-translate-y-1">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-orange-200 transition-colors">
                    <Icon className="h-6 w-6 text-orange-600" />
                  </div>
                  
                  <h3 className="font-bold text-gray-900 mb-2">{info.title}</h3>
                  <p className="font-semibold text-gray-800 mb-1">{info.details}</p>
                  <p className="text-gray-600 text-sm">{info.description}</p>
                </div>
              );

              return info.href ? (
                <a key={index} href={info.href} className="block">
                  {content}
                </a>
              ) : (
                <div key={index}>
                  {content}
                </div>
              );
            })}
          </div>
        </section>

        {/* Contact Form Section */}
        <section className="container mx-auto px-4 mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            
            {/* Form */}
            <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Send Us a Message</h2>
                <p className="text-gray-600">
                  Fill out the form below and we&apos;ll get back to you as soon as possible. 
                  All fields marked with * are required.
                </p>
              </div>
              
              <ContactForm />
            </div>

            {/* Additional Info */}
            <div className="space-y-8">
              {/* Why Contact Us */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-8 rounded-3xl border border-orange-200">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="h-6 w-6 text-orange-600" />
                  <h3 className="text-xl font-bold text-gray-900">Why Contact EMM-Fort?</h3>
                </div>
                
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Expert guidance across multiple industries</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Comprehensive business solutions under one group</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Personalized service tailored to your needs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Quick response times and professional support</span>
                  </li>
                </ul>
              </div>

              {/* FAQs */}
              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h3>
                
                <div className="space-y-6">
                  {faqs.map((faq, index) => (
                    <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                      <h4 className="font-semibold text-gray-900 mb-2">{faq.question}</h4>
                      <p className="text-gray-600 text-sm">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-gray-900 to-black rounded-3xl p-8 lg:p-12 text-center text-white">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Ready to Grow Your Business?
            </h2>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              Discover how EMM-Fort Group&apos;s diverse portfolio of companies can help 
              accelerate your success across multiple industries.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/#companies" 
                className="bg-white text-gray-900 font-semibold px-8 py-3 rounded-full hover:bg-gray-100 transition-colors"
              >
                Explore Our Companies
              </Link>
              <a 
                href="tel:+2347036082070" 
                className="border-2 border-white text-white font-semibold px-8 py-3 rounded-full hover:bg-white hover:text-gray-900 transition-colors"
              >
                Call Us Now
              </a>
            </div>
          </div>
        </section>
      </main>
      
      <CompanyFooter />
    </div>
  );
};

export default ContactPage;
// components/NewsletterFooter.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useInView } from 'react-intersection-observer';
import { Mail, ArrowRight, Play } from 'lucide-react';

const NewsletterFooter = () => {
  const [email, setEmail] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Newsletter signup:', email);
    setEmail('');
    setIsSubmitting(false);
  };

  return (
    <div className="relative z-40">
      {/* Spacer to prevent overlap with previous components */}
      <div className="h-24 md:h-32"></div>
      
      <footer 
        ref={ref}
        className="bg-gradient-to-br from-gray-900 via-black to-gray-800 relative overflow-visible pt-16 md:pt-20"
      >    
      {/* Newsletter Section - Positioned to overlap */}      
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-6xl px-4 z-20">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl py-8 md:py-12 shadow-2xl">
          <div className="container mx-auto px-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 lg:gap-8">
              <div className="flex-1 lg:max-w-2xl">
                <h3 className="text-l md:text-xl lg:text-2xl font-bold text-white mb-2 text-balance">
                  Join our creator community and get the latest updates on earning opportunities.
                </h3>
              </div>
              <div className="w-full lg:flex-1 lg:max-w-md">
                {/* Newsletter Form */}
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <div className="flex-1 relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full px-6 py-4 rounded-full border-none bg-white text-gray-900 placeholder-gray-500 outline-none focus:ring-2 focus:ring-white/50 transition-all duration-300"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-black hover:bg-gray-800 disabled:bg-gray-600 text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105 shadow-lg group whitespace-nowrap"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Mail className="w-5 h-5" />
                        Sign Up
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Content */}
      <div className="py-16 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-16">
            
            {/* Company Info */}
            <div 
              className={`
                md:col-span-2
                transition-all duration-1000 ease-out
                ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
              `}
            >
              <div className="mb-6">
                 <div className="flex items-center space-x-2 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-sm flex items-center justify-center">
                    <Play className="w-4 h-4 text-white fill-current" />
                  </div>
                  <span className="text-xl text-white font-bold">EMM-Fort</span>
                </div>
                <p className="text-gray-400 leading-relaxed max-w-md">
                  Empowering content creators worldwide with innovative tools, community support, and monetization opportunities. Build your brand, grow your audience, and turn your passion into profit.
                </p>
              </div>
              
              <div className="text-gray-400">
                <p className="mb-1">J21, Americana Street,</p>
                <p className="mb-4"> Ikotun Lagos-Nigeria</p>
                <div className="flex flex-wrap gap-4">
                  <a href="mailto:hello@emm-fort.com" className="text-red-400 hover:text-red-300 transition-colors">
                    admin@emmfortgroup.com
                  </a>
                  <span className="text-gray-600">•</span>
                  <a href="tel:+2347036082070" className="text-red-400 hover:text-red-300 transition-colors">
                    +234 (7) 036 082 070
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Section */}
            <div 
              className={`
                transition-all duration-1000 ease-out
                ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
              `}
              style={{ transitionDelay: inView ? '200ms' : '0ms' }}
            >
              <h6 className="text-white font-bold text-lg mb-6 uppercase tracking-wide">Contact Us</h6>
              <div className="space-y-4">
                <div>
                  <div className="text-white text-xl font-bold mb-2">+234 (7) 036 082 070</div>
                  <p className="text-gray-400 text-sm mb-3">Available 24/7 for support</p>
                </div>
                <Link 
                  href="/contact"
                  className="inline-flex items-center bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-full transition-colors gap-2 group font-semibold"
                >
                  General Inquiries
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Business Manager Section */}
            <div 
              className={`
                transition-all duration-1000 ease-out
                ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
              `}
              style={{ transitionDelay: inView ? '400ms' : '0ms' }}
            >
              <h6 className="text-white font-bold text-lg mb-6 uppercase tracking-wide">Business Manager</h6>
              <div className="space-y-4">
                <div>
                  <div className="text-white text-xl font-bold mb-2">Moreen</div>
                  <p className="text-gray-400 text-sm mb-3">Partnership & Business Development</p>
                </div>
                <Link 
                  href="/creator/contact"
                  className="inline-flex items-center bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-full transition-colors gap-2 group font-semibold"
                >
                  Let&apos;s Talk
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Section */}
      <div className="border-t border-white/10 py-8 relative z-10">
        <div className="container mx-auto px-4">
          <div 
            className={`
              flex flex-col md:flex-row justify-between items-center gap-6 text-gray-400
              transition-all duration-1000 ease-out
              ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
            `}
            style={{ transitionDelay: inView ? '600ms' : '0ms' }}
          >
            <p className="text-sm">
              Copyright © 2024 Emm-fort, All rights reserved. Powered by{''}
              <span className="text-red-400"> Nerdwave</span>.
            </p>
            <div className="flex flex-wrap gap-6 text-sm">
              <Link href="/terms" className="hover:text-white transition-colors">Terms of Use</Link>
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="cookies" className="hover:text-white transition-colors">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
    </div>
  );
};

export default NewsletterFooter;
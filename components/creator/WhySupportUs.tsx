/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { TrendingUp, Award, Users, ExternalLink, CheckCircle } from 'lucide-react';
import InfoModal from '../modals/InfoModal';
import Link from 'next/link';
import { useSession } from 'next-auth/react';


export default function WhySupportUs() {
    const { data: session, status } = useSession();
    const isCreator = session?.user?.isCreator;
    const isLoading = status === "loading";
  const { ref: leftRef, inView: leftInView } = useInView({ triggerOnce: true, threshold: 0.1 })
  const { ref: rightRef, inView: rightInView } = useInView({ triggerOnce: true, threshold: 0.1 })
  const [showModal, setShowModal] = useState(false)

  const features = [
    {
      icon: TrendingUp,
      title: 'Business Growth & Scale Up',
      description: 'Strategic guidance to scale your creator business and maximize revenue potential through proven growth strategies.',
      delay: '0ms'
    },
    {
      icon: Award,
      title: 'Premium Brand Partnerships',
      description: 'Access to exclusive brand collaborations that align with your values and provide exceptional earning opportunities.',
      delay: '100ms'
    },
    {
      icon: Users,
      title: 'Community Success Network',
      description: 'Join a thriving community of successful creators sharing insights, strategies, and collaborative opportunities.',
      delay: '200ms'
    }
  ]

  return (
    <>
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div 
              ref={leftRef}
              className={`transition-all duration-1000 ease-out
                ${leftInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}
              `}
            >
              <h6 className="text-orange-500 text-sm font-semibold uppercase tracking-wide mb-2">
                Why supporting us
              </h6>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                The ultimate social media experience.
              </h2>
              <p className="text-gray-600 text-lg mb-8">
                Transform your digital presence with our comprehensive creator ecosystem. We provide the tools, 
                support, and opportunities you need to build a sustainable and profitable creator business that 
                stands out in today's competitive landscape.
              </p>
              <button 
                onClick={() => setShowModal(true)}
                className="inline-flex items-center border-2 border-orange-500 text-orange-500 font-semibold py-3 px-8 rounded-full hover:bg-orange-500 hover:text-white transition-all duration-300 group"
              >
                Learn more 
                <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div 
              ref={rightRef}
              className="bg-gray-50 rounded-3xl p-8"
            >
              <div className="space-y-8">
                {features.map((feature) => (
                  <div
                    key={feature.title}
                    className={`flex items-start space-x-4 group
                      transition-all duration-1000 ease-out
                      ${rightInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}
                    `}
                    style={{ transitionDelay: rightInView ? feature.delay : '0ms' }}
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-500 transition-colors duration-300">
                        {feature.title}
                      </h4>
                      <p className="text-gray-600">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <InfoModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Ultimate Social Media Experience"
        icon={TrendingUp}
      >
        <div className="space-y-6">
          <p className="text-lg">Experience the difference of working with a platform that truly understands creators. Our comprehensive ecosystem provides everything you need to build, grow, and monetize your social media presence effectively.</p>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Platform Advantages
            </h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                Advanced analytics and performance tracking
              </li>
              <li className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                Direct brand partnership opportunities
              </li>
              <li className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                Automated payment processing
              </li>
              <li className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                24/7 creator support team
              </li>
            </ul>
          </div>

          <div className="bg-gray-50 p-4 rounded-2xl">
            <h4 className="font-semibold text-gray-900 mb-2">Success Metrics</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-500">10K+</div>
                <div className="text-gray-600">Active Creators</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-500">$2M+</div>
                <div className="text-gray-600">Paid Out</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-2xl">
            <p className="font-semibold text-gray-900 text-center text-sm">
              Join the platform that's helping creators build sustainable businesses and achieve financial freedom.
            </p>
          </div>
          {/* Dynamic button based on auth state */}
            {!isLoading && (
              <>
                {isCreator ? (
                  <Link href="/creator/dashboard">
                    <button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 px-8 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
                      Go to Dashboard
                    </button>
                  </Link>
                ) : (
              <Link href="/creator/auth/login">
              <button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center gap-2">
                Join Our Platform
                <ExternalLink className="w-4 h-4" />
                
              </button>
              </Link>
                )}
                  </>
                )}
                
            {isLoading && (
              <button disabled className="bg-gray-400 text-white font-semibold py-3 px-8 rounded-full">
                Loading...
              </button>
            )}
        </div>
      </InfoModal>
    </>
  )
}
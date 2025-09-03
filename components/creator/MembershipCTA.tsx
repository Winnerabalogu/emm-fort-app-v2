"use client"
import React, { useState } from 'react';
import { useInView } from 'react-intersection-observer';
import {ChartBar,TargetIcon,RocketIcon,DollarSignIcon} from 'lucide-react'
import Link from 'next/link';
import { useSession } from 'next-auth/react';

const MembershipCTA = () => {
   const { data: session, status } = useSession();
      const isCreator = session?.user?.isCreator;
      const isLoading = status === "loading";
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [activeStep, setActiveStep] = useState(1);

  const benefits = [
    {
      icon: DollarSignIcon,
      title: 'High Commission Rates',
      description: 'Earn up to 30% commission on every successful referral with our competitive rates.',
      color: 'from-green-400 to-emerald-500'
    },
    {
      icon: ChartBar,
      title: 'Real-time Analytics',
      description: 'Track your performance with detailed analytics and insights dashboard.',
      color: 'from-blue-400 to-cyan-500'
    },
    {
      icon: TargetIcon,
      title: 'Targeted Campaigns',
      description: 'Access exclusive campaigns tailored to your audience and niche.',
      color: 'from-purple-400 to-pink-500'
    },
    {
      icon: RocketIcon,
      title: 'Growth Support',
      description: 'Get dedicated support and resources to accelerate your creator journey.',
      color: 'from-orange-400 to-red-500'
    }
  ];

  const steps = [
    { number: 1, title: 'Apply', description: 'Submit your creator application' },
    { number: 2, title: 'Review', description: 'We review your profile and content' },
    { number: 3, title: 'Approve', description: 'Get approved and start earning' }
  ];

  return (
    <section ref={ref} className="py-16 md:py-24 relative overflow-hidden bg-slate-50">                
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Main CTA Section */}
        <div 
          className={`
            text-center mb-16
            transition-all duration-1000 ease-out
            ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
          `}
        >                  
          <h2 className="text-4xl md:text-6xl font-bold text-gray-700 mb-6">
            Join our membership now to<br />
            <span className="bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">
              support the talents
            </span>
          </h2>
          
          <p className="text-gray-700/80 text-lg mb-8 max-w-2xl mx-auto">
            Become part of an exclusive creator community and unlock premium opportunities 
            that will transform your content creation journey.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
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
                        <button className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold py-4 px-10 rounded-full transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 group">
                          <span className="flex items-center gap-2">
                            Join Now - It&apos;s Free
                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </span>
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
            
            <button className="items-center border-2 border-orange-500 text-orange-500 font-semibold py-3 px-8 rounded-full hover:bg-orange-500 hover:text-white transition-all duration-300 group"
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                Watch How It Works
              </span>
            </button>
          </div>
        </div>

        {/* Benefits Grid */}
        <div 
          className={`
            grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16
            transition-all duration-1000 ease-out
            ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
          `}
          style={{ transitionDelay: inView ? '400ms' : '0ms' }}
        >
          {benefits.map((benefit, index) => {
            const IconComponent = benefit.icon
            return(
            <div
              key={benefit.title}
              className="group"
              style={{ transitionDelay: inView ? `${(index + 1) * 150}ms` : '0ms' }}
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 hover:scale-105 border border-white/20">
                <div className={`w-14 h-14 bg-gradient-to-br ${benefit.color} rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-gray-700 text-xl font-bold mb-2">{benefit.title}</h3>
                <p className="text-gray-700/70 text-sm">{benefit.description}</p>
              </div>
            </div>
            )
          })}
        </div>

        {/* Process Steps */}
        <div 
          className={`
            transition-all duration-1000 ease-out
            ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
          `}
          style={{ transitionDelay: inView ? '600ms' : '0ms' }}
        >
          <h3 className="text-2xl md:text-3xl font-bold text-gray-700 text-center mb-12">
            How to get started
          </h3>
          
          <div className="flex flex-col md:flex-row justify-center items-center gap-8 max-w-4xl mx-auto">
            {steps.map((step, index) => (
              <div key={step.number} className="flex flex-col items-center text-center group">
                <div 
                  className={`
                    w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold mb-4 cursor-pointer transition-all duration-300
                    ${activeStep === step.number 
                      ? 'bg-gradient-to-br from-orange-500 to-pink-500 text-gray-700 scale-110' 
                      : 'bg-white/20 text-gray-700 hover:bg-white/30'
                    }
                  `}
                  onClick={() => setActiveStep(step.number)}
                >
                  {step.number}
                </div>
                <h4 className="text-gray-700 font-bold text-lg mb-2">{step.title}</h4>
                <p className="text-gray-700/70 text-sm max-w-32">{step.description}</p>
                
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute w-24 h-0.5 bg-white/20 top-8 left-full transform translate-x-8"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div 
          className={`
            grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 text-center
            transition-all duration-1000 ease-out
            ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
          `}
          style={{ transitionDelay: inView ? '800ms' : '0ms' }}
        >
          <div className="group">
            <div className="text-4xl md:text-5xl font-bold text-gray-700 mb-2 group-hover:scale-110 transition-transform duration-300">
              10K+
            </div>
            <div className="text-gray-700/70">Active Creators</div>
          </div>
          <div className="group">
            <div className="text-4xl md:text-5xl font-bold text-gray-700 mb-2 group-hover:scale-110 transition-transform duration-300">
              $2M+
            </div>
            <div className="text-gray-700/70">Total Payouts</div>
          </div>
          <div className="group">
            <div className="text-4xl md:text-5xl font-bold text-gray-700 mb-2 group-hover:scale-110 transition-transform duration-300">
              98%
            </div>
            <div className="text-gray-700/70">Satisfaction Rate</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MembershipCTA;
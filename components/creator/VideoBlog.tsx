/* eslint-disable react/no-unescaped-entities */
// components/creator/VideoBlog.tsx
"use client";

import React, { useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { Play, Heart, ArrowRight, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import InfoModal from '../modals/InfoModal';

export default function VideoBlog() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 })
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [showSupportModal, setShowSupportModal] = useState(false)

  const topEarners = [
    { rank: 1, name: "Sarah Thompson", earnings: "$3,200/month" },
    { rank: 2, name: "Marcus Rivera", earnings: "$2,850/month" },
    { rank: 3, name: "Emily Chen", earnings: "$2,500/month" },
    { rank: 4, name: "Jordan Bailey", earnings: "$2,100/month" },
    { rank: 5, name: "Alex Morgan", earnings: "$1,900/month" }
  ]

  return (
    <>
      <section ref={ref} className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div className="lg:col-span-2">
              <div 
                className={`
                  transition-all duration-1000 ease-out
                  ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
                `}
              >
                <div className="relative aspect-video rounded-2xl overflow-hidden mb-6 group cursor-pointer">
                  <Image 
                    src="/creator-bg-webp/about-value.webp" 
                    alt="Grocery Haul Creator Video"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    fill
                  />
                  
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-all duration-300" />
                  
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <Play className="w-8 h-8 text-orange-500 ml-1" />
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-red-500 text-sm font-medium"># groceryhaul</span>
                  <span className="text-red-500 text-sm font-medium"># budgetgroceries</span>
                  <span className="text-red-500 text-sm font-medium"># mealprep</span>
                </div>

                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  How To Create Viral Grocery Haul Content
                </h2>

                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  Learn how to turn your weekly grocery shopping into engaging TikTok content that earns you 5% commission on every order. Discover the proven formats that grocery creators use to build their audience and generate consistent income through authentic haul videos.
                </p>

                <button 
                  onClick={() => setShowVideoModal(true)}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 hover:scale-105 shadow-lg flex items-center gap-2 group"
                >
                  Watch Tutorial
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-bold mb-4">Top Monthly Earners</h3>
                <div className="space-y-3">
                  {topEarners.map((creator) => (
                    <div key={creator.rank} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-white/80 font-medium">#{creator.rank}.</span>
                        <span className="text-white font-medium">{creator.name}</span>
                      </div>
                      <span className="text-white/90 text-sm font-semibold">{creator.earnings}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-900 text-white rounded-2xl p-6 shadow-lg">
                <div className="text-orange-400 text-sm font-semibold uppercase tracking-wide mb-3">
                  JOIN PROGRAM
                </div>
                <h3 className="text-2xl font-bold mb-4 leading-tight">
                  Ready to start earning 5%?
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed mb-6">
                  Join thousands of creators earning commission on grocery content. Free signup, bi-weekly payouts, and unlimited earning potential through authentic grocery hauls.
                </p>
                <button 
                  onClick={() => setShowSupportModal(true)}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 hover:scale-105 w-full flex items-center justify-center gap-2"
                >
                  <Heart className="w-5 h-5" />
                  Start Earning
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Modal */}
      <InfoModal
        isOpen={showVideoModal}
        onClose={() => setShowVideoModal(false)}
        title="Grocery Haul Content Mastery"
        icon={Play}
      >
        <div className="space-y-6">
          <p className="text-lg">Master the art of creating engaging grocery haul content that drives sales. Learn from top-earning creators who make $2,000+ monthly through authentic shopping content and strategic product placement.</p>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              What You'll Learn
            </h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                TikTok-optimized filming techniques for grocery hauls
              </li>
              <li className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                How to naturally incorporate your referral code
              </li>
              <li className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                Budget-friendly shopping strategies that engage viewers
              </li>
              <li className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                Meal prep content that converts to grocery sales
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-2xl">
            <p className="font-semibold text-gray-900 text-center text-sm">
              Our creators using these techniques average $2,500/month in commission earnings with consistent posting.
            </p>
          </div>
          
          <button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center gap-2">
            <Play className="w-4 h-4" />
            Watch Full Tutorial
          </button>
        </div>
      </InfoModal>

      {/* Support Modal */}
      <InfoModal
        isOpen={showSupportModal}
        onClose={() => setShowSupportModal(false)}
        title="Join EMM-FORT Creator Program"
        icon={Heart}
      >
        <div className="space-y-6">
          <p className="text-lg">Start earning 5% commission on every grocery order made through your content. Free signup with no upfront costs - just create authentic grocery hauls and lifestyle content you already love.</p>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Program Benefits
            </h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                5% commission on all grocery orders with your code
              </li>
              <li className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                Bi-weekly payouts with no minimum threshold
              </li>
              <li className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                Featured opportunities on EMM-Fort's TikTok & Instagram
              </li>
              <li className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                Access to exclusive content kits and product previews
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-2xl">
            <p className="font-semibold text-gray-900 text-center text-sm">
              Over 10,000 creators have joined our program and earned $2M+ in commissions through authentic grocery content.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 px-4 rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg text-sm">
              Sign Up Free
            </button>
            <button className="border-2 border-orange-500 text-orange-500 font-semibold py-3 px-4 rounded-2xl hover:bg-orange-50 transition-colors text-sm">
              Learn More
            </button>
          </div>
        </div>
      </InfoModal>
    </>
  )
}
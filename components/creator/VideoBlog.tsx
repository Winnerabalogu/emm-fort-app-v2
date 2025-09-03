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

  const topDonators = [
    { rank: 1, name: "George Thomson" },
    { rank: 2, name: "Alisha Richardson" },
    { rank: 3, name: "Coraline Wagner" },
    { rank: 4, name: "Bailey Gallagher" },
    { rank: 5, name: "Owen Houghton" }
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
                    alt="Content Creator Video"
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
                  <span className="text-red-500 text-sm font-medium"># creatorlife</span>
                  <span className="text-red-500 text-sm font-medium"># contentcreator</span>
                  <span className="text-red-500 text-sm font-medium"># buildyourbrand</span>
                </div>

                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  How To Build A Successful Creator Brand
                </h2>

                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  Learn the essential strategies to build your personal brand as a content creator. From defining your niche to engaging with your audience, discover the proven methods that successful creators use to grow their following and monetize their content.
                </p>

                <button 
                  onClick={() => setShowVideoModal(true)}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 hover:scale-105 shadow-lg flex items-center gap-2 group"
                >
                  Learn more
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-bold mb-4">Top Supporters</h3>
                <div className="space-y-3">
                  {topDonators.map((donor) => (
                    <div key={donor.rank} className="flex items-center gap-3">
                      <span className="text-white/80 font-medium">#{donor.rank}.</span>
                      <span className="text-white font-medium">{donor.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-900 text-white rounded-2xl p-6 shadow-lg">
                <div className="text-orange-400 text-sm font-semibold uppercase tracking-wide mb-3">
                  SUPPORT
                </div>
                <h3 className="text-2xl font-bold mb-4 leading-tight">
                  Want to become top supporter?
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed mb-6">
                  Join our community and help support quality content creation. Your contribution helps us create better content and reach more people.
                </p>
                <button 
                  onClick={() => setShowSupportModal(true)}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 hover:scale-105 w-full flex items-center justify-center gap-2"
                >
                  <Heart className="w-5 h-5" />
                  Learn more
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
        title="Building A Creator Brand"
        icon={Play}
      >
        <div className="space-y-6">
          <p className="text-lg">This comprehensive video guide covers everything you need to know about building a successful creator brand. Learn from industry experts and successful creators who have built million-dollar personal brands.</p>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              What You&apos;ll Learn
            </h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                How to define your unique value proposition
              </li>
              <li className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                Content strategies that build brand authority
              </li>
              <li className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                Monetization techniques for sustainable income
              </li>
              <li className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                Community building and engagement tactics
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-2xl">
            <p className="font-semibold text-gray-900 text-center text-sm">
              Over 50,000 creators have used these strategies to build successful brands and achieve financial independence.
            </p>
          </div>
          
          <button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center gap-2">
            <Play className="w-4 h-4" />
            Watch Full Video
          </button>
        </div>
      </InfoModal>

      {/* Support Modal */}
      <InfoModal
        isOpen={showSupportModal}
        onClose={() => setShowSupportModal(false)}
        title="Support Our Community"
        icon={Heart}
      >
        <div className="space-y-6">
          <p className="text-lg">Your support helps us continue creating valuable content and building tools that empower creators worldwide. Join our community of supporters and help us make a difference in the creator economy.</p>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Support Benefits
            </h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                Recognition as a top community supporter
              </li>
              <li className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                Early access to new features and content
              </li>
              <li className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                Direct input on future platform developments
              </li>
              <li className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                Exclusive supporter-only events and meetups
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-2xl">
            <p className="font-semibold text-gray-900 text-center text-sm">
              Every contribution, no matter the size, helps us build better tools and create more valuable content for the entire creator community.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 px-4 rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg text-sm">
              Monthly Support
            </button>
            <button className="border-2 border-orange-500 text-orange-500 font-semibold py-3 px-4 rounded-2xl hover:bg-orange-50 transition-colors text-sm">
              One-time Gift
            </button>
          </div>
        </div>
      </InfoModal>
    </>
  )
  }
// components/creator/CreativeIdeas.tsx
"use client";

import { Heart, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { useInView } from 'react-intersection-observer';
import InfoModal from '../modals/InfoModal';


export default function CreativeIdeas() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 })
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <section 
        ref={ref}
        className="relative py-24 md:py-32"
        style={{
          backgroundImage: 'url("/creator-bg-webp/content-creator-2.webp")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundBlendMode: 'overlay'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/60 via-black/40 to-orange-900/60"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h2 
              className={`text-white text-4xl md:text-5xl font-bold mb-6
                transition-all duration-1000 ease-out
                ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
              `}
            >
              Creative ideas that will help your brand soar.
            </h2>
            <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
              Transform your grocery shopping into engaging content. From haul videos to cooking tutorials, turn your
              everyday purchases into earning opportunities with authentic storytelling.
            </p>
            <button 
              onClick={() => setShowModal(true)}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-4 px-8 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              Discover more
            </button>
          </div>
        </div>
      </section>

      <InfoModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Membership Benefits"
        icon={Heart}
      >
        <div className="space-y-6">
          <p className="text-lg">Our membership program is designed to give back to the community that supports us. Enjoy exclusive perks, priority access, and special discounts as a valued member of our creator family.</p>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Membership Perks
            </h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                Access to premium video tutorials and masterclasses
              </li>
              <li className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                20% discount on all branded merchandise
              </li>
              <li className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                Priority booking for events and workshops
              </li>
              <li className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                Monthly exclusive live streams with top creators
              </li>
            </ul>
          </div>

          <div className="bg-gray-50 p-4 rounded-2xl">
            <h4 className="font-semibold text-gray-900 mb-2">Member Statistics</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-500">5K+</div>
                <div className="text-gray-600">Premium Members</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-500">99%</div>
                <div className="text-gray-600">Renewal Rate</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-2xl">
            <p className="font-semibold text-gray-900 text-center text-sm">
              Join thousands of satisfied members who enjoy exclusive benefits and priority access to everything we offer.
            </p>
          </div>
          
          <button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center gap-2">
            Become a Member
            <Heart className="w-4 h-4" />
          </button>
        </div>
      </InfoModal>
    </>
  )
}
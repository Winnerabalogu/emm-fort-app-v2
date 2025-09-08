"use client"
import { useInView } from "react-intersection-observer"
import { Camera, CheckCircle, ExternalLink, DollarSign, ChartBar, Rocket, Target} from 'lucide-react'
import InfoModal from "@/components/modals/InfoModal"
import { useState } from "react"

export default function MembershipBenefits() {
  const { ref: benefitsRef, inView: benefitsInView } = useInView({ triggerOnce: true, threshold: 0.1 })
  const [showModal, setShowModal] = useState(false)

 const benefits = [
    {
      icon: DollarSign,
      title: '5% Commission Rate',
      description: 'Earn 5% commission on every grocery order made through your unique referral code.',
      color: 'from-green-400 to-emerald-500'
    },
    {
      icon: ChartBar,
      title: 'Real-time Tracking',
      description: 'Track your earnings and performance with detailed analytics dashboard and insights.',
      color: 'from-blue-400 to-cyan-500'
    },
    {
      icon: Target,
      title: 'Featured Creator Opportunities',
      description: 'Get featured on EMM-Fort\'s official TikTok and Instagram reaching millions of viewers.',
      color: 'from-purple-400 to-pink-500'
    },
    {
      icon: Rocket,
      title: 'Bi-weekly Payouts',
      description: 'Fast bi-weekly payments with no minimum threshold and multiple payment options.',
      color: 'from-orange-400 to-red-500'
    }
  ];

  return (
    <>
      <section ref={benefitsRef} className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div
              className={`transition-all duration-1000 ease-out
                ${benefitsInView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}
              `}
            >
              <h6 className="text-orange-500 text-sm font-semibold uppercase tracking-wide mb-2">PROGRAM BENEFITS</h6>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Everything you need to succeed as a grocery content creator!
              </h2>
              <p className="text-gray-600 text-lg mb-8">
                Join our thriving community of grocery content creators earning through authentic hauls, unboxing videos, and lifestyle content. We provide all the tools, support, and opportunities you need to turn your grocery shopping into a profitable content strategy.
              </p>
              <button 
                onClick={() => setShowModal(true)}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-4 px-8 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                See All Benefits
              </button>
            </div>

            <div
              className={`space-y-6
                transition-all duration-1000 ease-out
                ${benefitsInView ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}
              `}
            >
              {benefits.map((benefit, index) => {
                const IconComponent = benefit.icon
                return (
                  <div
                    key={benefit.title}
                    className="flex items-start space-x-4 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors duration-300"
                    style={{ transitionDelay: benefitsInView ? `${index * 150}ms` : "0ms" }}
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 mb-2">{benefit.title}</h4>
                      <p className="text-gray-600">{benefit.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>
       <InfoModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Complete Program Benefits"
        icon={Camera}
      >
        <div className="space-y-6">
          <p className="text-lg">Get everything you need to succeed as a grocery content creator. From earning opportunities to professional support, our comprehensive program helps you build a sustainable income through authentic grocery content.</p>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Earning Benefits
            </h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                5% commission on all grocery orders with your code
              </li>
              <li className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                Bi-weekly guaranteed payouts with no minimum
              </li>
              <li className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                Performance bonuses for top creators
              </li>
              <li className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                Featured creator spotlight opportunities
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Camera className="w-5 h-5 text-blue-500" />
              Creator Support
            </h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Professional content creation guidelines
              </li>
              <li className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Free access to product images and video templates
              </li>
              <li className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Weekly trending hashtag research and tips
              </li>
              <li className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                24/7 creator support team assistance
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-2xl">
            <p className="font-semibold text-gray-900 text-center text-sm">
              Our creators earn an average of $2,500/month creating content they already love, with our top earners making $5,000+ monthly.
            </p>
          </div>
          
          <button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center gap-2">
            Join Free Today
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </InfoModal>
    </>
  )
}
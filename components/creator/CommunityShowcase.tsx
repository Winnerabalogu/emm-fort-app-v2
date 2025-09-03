"use client"

import { useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { X, Users, Camera, DollarSign, CheckCircle, ArrowRight, ExternalLink } from "lucide-react"

// Reusable Modal Component (same as before)
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  icon?: React.ComponentType<{ className?: string }>
}

const InfoModal = ({ isOpen, onClose, title, children, icon: Icon }: ModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-100 to-red-100 rounded-full blur-3xl opacity-30 -translate-y-8 translate-x-8"></div>
            
            <div className="relative">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  {Icon && (
                    <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center">
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                  )}
                  <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="text-gray-600 leading-relaxed">
                {children}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const showcaseData = [
  {
    src: "/creator-bg-webp/creator-hands.webp",
    title: "Creator Community",
    icon: Users,
    description: "Join thousands of grocery content creators earning 5% commission through authentic storytelling and lifestyle content.",
    details: {
      overview: "Become part of a thriving community of over 10,000 active creators who are transforming their grocery shopping into profitable content. Our creators come from diverse backgrounds and niches, all united by their passion for authentic storytelling.",
      benefits: [
        "Access to exclusive creator Discord community",
        "Monthly virtual meetups and networking events",
        "Peer mentorship and collaboration opportunities",
        "Shared resources and best practice guides"
      ],
      stats: [
        "10,000+ active creators",
        "Average earning: $2,500/month",
        "98% creator satisfaction rate"
      ],
      cta: "Join our community and start building meaningful connections with fellow creators today."
    }
  },
  {
    src: "/creator-bg-webp/creator-cam.webp",
    title: "Content Support",
    icon: Camera,
    description: "Access professional resources, content kits, and mentorship to create engaging grocery hauls and cooking content.",
    details: {
      overview: "Get everything you need to create professional-quality content. From filming equipment recommendations to editing software tutorials, we provide comprehensive support to help you produce engaging grocery and lifestyle content.",
      benefits: [
        "Professional content creation guidelines",
        "Free access to premium editing software",
        "Lighting and filming setup recommendations",
        "One-on-one mentorship sessions"
      ],
      stats: [
        "500+ tutorial videos available",
        "24/7 creative support team",
        "Average 300% engagement boost"
      ],
      cta: "Access our complete content creation toolkit and elevate your videos to professional quality."
    }
  },
  {
    src: "/creator-bg-webp/content-creator-4.webp",
    title: "Earning Opportunities",
    icon: DollarSign,
    description: "Transform your grocery shopping into income with bi-weekly payouts and unlimited earning potential through our affiliate program.",
    details: {
      overview: "Our affiliate program offers one of the highest commission rates in the industry. With bi-weekly payouts, performance bonuses, and unlimited earning potential, you can turn your content creation into a sustainable income stream.",
      benefits: [
        "5% commission on all referred sales",
        "Bi-weekly guaranteed payouts",
        "Performance bonuses up to 30%",
        "No minimum payout threshold"
      ],
      stats: [
        "$2M+ paid to creators",
        "Bi-weekly payout guarantee",
        "Up to 30% bonus commission"
      ],
      cta: "Start earning today with our industry-leading affiliate program and flexible payout options."
    }
  },
]

export default function CommunityShowcase() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [selectedItem, setSelectedItem] = useState<(typeof showcaseData)[0] | null>(null)

  return (
    <>
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {showcaseData.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="relative overflow-hidden rounded-2xl group cursor-pointer h-80 shadow-lg hover:shadow-2xl transition-shadow duration-500"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className="relative h-full w-full">
                  <Image
                    src={item.src || "/creator-bg-webp/content-creator-3.webp"}
                    alt={item.title}
                    className={`w-full h-full object-cover transition-transform duration-500 ease-out ${
                      hoveredIndex === index ? "transform -translate-y-16 scale-110" : ""
                    }`}
                    fill
                  />

                  {/* Overlay content that slides up on hover */}
                  <div
                    className={`absolute bottom-0 left-0 right-0 bg-white p-6 transform transition-all duration-500 ease-out ${
                      hoveredIndex === index ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                        <item.icon className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="text-gray-900 font-bold text-xl">{item.title}</h3>
                    </div>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.description}</p>                
                    <button 
                      onClick={() => setSelectedItem(item)}
                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2"
                    >
                      Learn more
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Info Modal */}
      <InfoModal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title={selectedItem?.title || ""}
        icon={selectedItem?.icon}
      >
        {selectedItem && (
          <div className="space-y-6">
            <p className="text-lg">{selectedItem.details.overview}</p>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                What You Get
              </h4>
              <ul className="space-y-2">
                {selectedItem.details.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl">
              <h4 className="font-semibold text-gray-900 mb-2">Key Statistics</h4>
              <div className="grid grid-cols-1 gap-2">
                {selectedItem.details.stats.map((stat, index) => (
                  <div key={index} className="text-sm text-gray-600 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    {stat}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-2xl">
              <p className="font-semibold text-gray-900 text-center text-sm">
                {selectedItem.details.cta}
              </p>
            </div>
            
            <button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center gap-2">
              Get Started Now
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        )}
      </InfoModal>
    </>
  )
}
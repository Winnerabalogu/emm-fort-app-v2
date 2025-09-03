"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { X, Users, Target, Camera, Share2, Heart, Palette, BarChart3, Gift, ExternalLink, CheckCircle, ArrowRight, Star } from "lucide-react"

// Reusable Modal Component
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
            {/* Decorative background */}
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

// Enhanced Platform Services Component
const services = [
  {
    icon: Users,
    title: "Creator Onboarding",
    description: "Free sign-up process with no upfront costs",
    details: {
      overview: "Join our creator program instantly with a simple registration process. No hidden fees, no upfront costs - just start creating and earning immediately.",
      benefits: [
        "Instant account activation",
        "Free creator toolkit",
        "Personal account manager",
        "24/7 support access"
      ],
      cta: "Start your creator journey today and begin earning within 24 hours."
    }
  },
  {
    icon: Target,
    title: "Campaign Strategy",
    description: "Strategic content planning for maximum engagement",
    details: {
      overview: "Get access to proven content strategies that drive grocery sales. Our team provides guidance on trending formats, optimal posting times, and audience targeting.",
      benefits: [
        "Personalized content calendar",
        "Trending hashtag research",
        "Audience analytics insights",
        "Performance optimization tips"
      ],
      cta: "Boost your engagement rates by up to 300% with our proven strategies."
    }
  },
  {
    icon: Camera,
    title: "Content Creation",
    description: "Authentic grocery hauls and unboxing content",
    details: {
      overview: "Create engaging grocery haul videos, unboxing content, and lifestyle posts that resonate with your audience while promoting EMM-Fort products naturally.",
      benefits: [
        "Professional filming guidelines",
        "Content templates and scripts",
        "Product placement strategies",
        "Editing software recommendations"
      ],
      cta: "Turn your grocery shopping into compelling content that converts."
    }
  },
  {
    icon: Share2,
    title: "Social Media Management",
    description: "Cross-platform content optimization",
    details: {
      overview: "Optimize your content for TikTok, Instagram, and other platforms. Get featured on EMM-Fort's official social media channels for maximum exposure.",
      benefits: [
        "Multi-platform posting scheduler",
        "Platform-specific optimization",
        "Featured creator opportunities",
        "Cross-promotion campaigns"
      ],
      cta: "Reach millions of potential customers across all major platforms."
    }
  },
  {
    icon: Heart,
    title: "Creator Support",
    description: "Dedicated support from the EMM-Fort team",
    details: {
      overview: "Receive ongoing support, content ideas, and marketing materials. Our team is here to help you succeed and grow your creator business.",
      benefits: [
        "Dedicated account manager",
        "Weekly strategy calls",
        "Content brainstorming sessions",
        "Technical support"
      ],
      cta: "Get the support you need to build a sustainable creator business."
    }
  },
  {
    icon: Palette,
    title: "Creative Resources",
    description: "Access to content kits and creative assets",
    details: {
      overview: "Get exclusive access to high-quality images, video templates, caption ideas, and branded assets to enhance your content creation process.",
      benefits: [
        "Professional photo library",
        "Video template collection",
        "Branded asset library",
        "Caption and copy templates"
      ],
      cta: "Access thousands of premium resources to elevate your content."
    }
  },
  {
    icon: BarChart3,
    title: "Performance Analytics",
    description: "Track your earnings and campaign performance",
    details: {
      overview: "Monitor your referral performance with detailed analytics. Track clicks, conversions, and earnings through your personalized creator dashboard.",
      benefits: [
        "Real-time earnings tracking",
        "Conversion rate analytics",
        "Audience demographic insights",
        "Performance comparison tools"
      ],
      cta: "Make data-driven decisions to maximize your earning potential."
    }
  },
  {
    icon: Gift,
    title: "Reward Program",
    description: "Recognition and bonuses for top creators",
    details: {
      overview: "Top-performing creators get featured prominently, receive bonus payments, and gain access to exclusive product launches and special campaigns.",
      benefits: [
        "Monthly performance bonuses",
        "Exclusive product previews",
        "Featured creator spotlights",
        "VIP event invitations"
      ],
      cta: "Join our elite creator community and unlock exclusive rewards."
    }
  },
]

export default function PlatformServices() {
  const [selectedService, setSelectedService] = useState<(typeof services)[0] | null>(null)

  return (
    <>
      <section className="py-20 md:py-28 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        {/* Enhanced background decoration */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-orange-200/30 to-red-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-purple-200/20 to-pink-200/20 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-600 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Star className="w-4 h-4" />
              CREATOR BENEFITS
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              What Will We Give You?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Everything you need to start earning <span className="font-bold text-orange-600">5% commission</span> on grocery orders through your authentic content creation journey.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 group relative overflow-hidden"
              >
                {/* Card background decoration */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-100/50 to-red-100/50 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative">
                  <div className="mb-6">
                    <div className="w-18 h-18 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-lg">
                      <service.icon className="w-9 h-9 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors duration-300">{service.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{service.description}</p>
                  </div>
                  
                  <button
                    onClick={() => setSelectedService(service)}
                    className="text-orange-600 font-semibold text-sm hover:text-red-600 transition-all duration-300 flex items-center gap-2 group-hover:gap-3"
                  >
                    LEARN MORE
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Modal */}
      <InfoModal
        isOpen={!!selectedService}
        onClose={() => setSelectedService(null)}
        title={selectedService?.title || ""}
        icon={selectedService?.icon}
      >
        {selectedService && (
          <div className="space-y-6">
            <p className="text-lg">{selectedService.details.overview}</p>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Key Benefits
              </h4>
              <ul className="space-y-2">
                {selectedService.details.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-2xl">
              <p className="font-semibold text-gray-900 text-center">
                {selectedService.details.cta}
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
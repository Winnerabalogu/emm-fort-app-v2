"use client"
import { motion } from "framer-motion"
import { ShoppingCart, Package, ChefHat, Star, CheckCircle, ExternalLink } from "lucide-react"
import { useState } from "react"
import InfoModal from "../modals/InfoModal"
import Link from "next/link"
import { useSession } from "next-auth/react"


export default function FeaturedContent() {
    const { data: session, status } = useSession();
    const isCreator = session?.user?.isCreator;
    const isLoading = status === "loading";
  const [selectedCategory, setSelectedCategory] = useState<(typeof contentCategories)[0] | null>(null)

  const contentCategories = [
    {
      title: "Grocery Hauls",
      description: "Weekly grocery shopping videos showcasing fresh products and budget-friendly finds",
      icon: ShoppingCart,
      details: {
        overview: "Grocery haul content is the highest-performing format for food and lifestyle creators. Learn how to create compelling shopping videos that naturally integrate your referral code and drive affiliate sales.",
        benefits: [
          "Weekly content format with consistent engagement",
          "Easy to film with minimal equipment needed",
          "Natural product placement opportunities",
          "High conversion rates for affiliate links"
        ],
        tips: [
          "Film in good lighting to showcase product quality",
          "Share prices and savings for transparency",
          "Include variety in your product selections",
          "Add personality with authentic shopping commentary"
        ],
        cta: "Start creating grocery haul content that converts viewers into customers earning you 5% commission."
      }
    },
    {
      title: "Unboxing Videos",
      description: "Exciting unboxing content featuring grocery deliveries and product reveals",
      icon: Package,
      details: {
        overview: "Unboxing videos create anticipation and excitement around grocery deliveries. Perfect for showcasing product quality and freshness while building trust with your audience and driving first-time orders.",
        benefits: [
          "High engagement and shareability on TikTok",
          "Showcases product quality and packaging",
          "Creates excitement around grocery deliveries",
          "Great for first impressions and honest reviews"
        ],
        tips: [
          "Create suspense with thoughtful product reveals",
          "Comment on packaging quality and freshness",
          "Share genuine first impressions and reactions",
          "Include close-ups of featured products"
        ],
        cta: "Master unboxing content that builds trust and drives grocery orders with your affiliate code."
      }
    },
    {
      title: "Cooking Content",
      description: "Recipe videos and meal prep content using groceries from our partner stores",
      icon: ChefHat,
      details: {
        overview: "Cooking content allows you to showcase grocery products in action while providing valuable recipes to your audience. From quick meals to meal prep, food content drives high engagement and affiliate conversions.",
        benefits: [
          "Shows grocery products in use and context",
          "Provides educational value to viewers",
          "High retention rates and engagement",
          "Multiple opportunities for natural code placement"
        ],
        tips: [
          "Keep recipes simple and achievable for viewers",
          "Highlight featured grocery ingredients clearly",
          "Show the complete cooking process step by step",
          "Include final presentation and taste reactions"
        ],
        cta: "Turn your kitchen into a content studio and create recipes that drive grocery sales."
      }
    },
    {
      title: "Lifestyle Posts",
      description: "Authentic lifestyle content featuring grocery shopping and healthy living",
      icon: Star,
      details: {
        overview: "Lifestyle content integrates grocery shopping and food products naturally into your daily routine, creating authentic touchpoints that resonate with your audience and drive consistent affiliate earnings.",
        benefits: [
          "Authentic and relatable content format",
          "Natural product integration opportunities",
          "Builds personal connection with audience",
          "Versatile content opportunities across platforms"
        ],
        tips: [
          "Share genuine moments and daily experiences",
          "Include family and friends when appropriate",
          "Show grocery products in real-life situations",
          "Maintain authenticity while promoting your code"
        ],
        cta: "Create lifestyle content that feels natural while driving meaningful affiliate commissions."
      }
    },
  ]


  return (
    <>
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Featured Content Categories</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Create authentic content around grocery shopping and earn 5% commission on every order made through your
              referral code.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contentCategories.map((category, index) => {
              const IconComponent = category.icon
              return (
                <motion.div 
                  key={index} 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center group"
                >
                  <div className="bg-gray-50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 group-hover:bg-red-50 transition-all duration-300 group-hover:scale-110">
                    <IconComponent className="w-10 h-10 text-orange-500 group-hover:text-red-500 transition-colors" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{category.title}</h3>
                  <p className="text-gray-600 mb-6">{category.description}</p>
                  <button 
                    onClick={() => setSelectedCategory(category)}
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 px-8 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    Learn More
                  </button>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      <InfoModal
        isOpen={!!selectedCategory}
        onClose={() => setSelectedCategory(null)}
        title={selectedCategory?.title || ""}
        icon={selectedCategory?.icon}
      >
        {selectedCategory && (
          <div className="space-y-6">
            <p className="text-lg">{selectedCategory.details.overview}</p>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Key Benefits
              </h4>
              <ul className="space-y-2">
                {selectedCategory.details.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Pro Tips
              </h4>
              <ul className="space-y-2">
                {selectedCategory.details.tips.map((tip, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-2xl">
              <p className="font-semibold text-gray-900 text-center text-sm">
                {selectedCategory.details.cta}
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
                      Start Creating
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
        )}
      </InfoModal>
    </>
  )
}
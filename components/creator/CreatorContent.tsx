/* eslint-disable react/no-unescaped-entities */
"use client"

import Image from "next/image"
import { useState } from "react"
import { motion } from "framer-motion"
import { Play, CheckCircle } from "lucide-react"
import InfoModal from "../modals/InfoModal"


export default function LatestVideos() {
  const [selectedVideo, setSelectedVideo] = useState<(typeof videos)[0] | null>(null)

 const videos = [
    {
      title: "Weekly Grocery Haul - $50 Budget Challenge",
      description: "Watch me shop smart and save money with my weekly grocery haul using code EMMA50 for 5% off",
      thumbnail: "/creator-bg-webp/content-creator-1.webp",
      details: {
        overview: "Learn how to create engaging budget grocery haul content that drives affiliate sales. This comprehensive guide covers strategic shopping, natural code placement, and audience engagement techniques.",
        benefits: [
          "Budget grocery haul content strategies",
          "Natural referral code integration techniques",
          "TikTok-optimized filming and editing tips",
          "Engagement tactics that convert viewers to customers"
        ],
        cta: "Master budget haul content and start earning commission on every grocery order."
      }
    },
    {
      title: "Grocery Unboxing - Fresh Delivery Surprise",
      description: "Unboxing my latest grocery delivery with fresh produce and pantry essentials - use my code for savings!",
      thumbnail: "/creator-bg-webp/content-creator-2.webp",
      details: {
        overview: "Discover how to create exciting grocery delivery unboxing content that showcases product quality while driving affiliate sales. Perfect for building trust and encouraging first-time orders.",
        benefits: [
          "Professional unboxing techniques for groceries",
          "Product presentation and storytelling tips",
          "Camera angles and lighting for fresh produce",
          "Call-to-action strategies that convert"
        ],
        cta: "Create compelling unboxing content that drives grocery sales and builds audience trust."
      }
    },
    {
      title: "Healthy Meal Prep with Budget Groceries",
      description: "Creating 5 healthy meals from affordable grocery finds - use my code SARAH10 for 5% off your order",
      thumbnail: "/creator-bg-webp/content-creator-3.webp",
      details: {
        overview: "Transform grocery haul products into engaging meal prep content. This format combines practical value with affiliate marketing, showing products in action while providing educational content.",
        benefits: [
          "5 complete meal prep recipes using haul products",
          "Cost breakdown and savings calculations",
          "Natural product placement and code integration",
          "Nutritional information and storage tips"
        ],
        cta: "Master meal prep content that turns grocery hauls into multiple revenue streams."
      }
    },
    {
      title: "Budget Grocery Shopping Tips & Tricks",
      description: "My top secrets for saving money on groceries while discovering amazing products - code BUDGET5 saves you more!",
      thumbnail: "/creator-bg-webp/content-creator-4.webp",
      details: {
        overview: "Create valuable educational content that positions you as a trusted grocery advisor. Share money-saving tips while naturally promoting your affiliate program and building audience loyalty.",
        benefits: [
          "25+ proven grocery money-saving techniques",
          "Store comparison strategies and seasonal tips",
          "Generic vs brand name analysis for better savings",
          "Educational content that builds trust and drives affiliate sales"
        ],
        cta: "Become the go-to source for grocery savings advice while earning commission on every order."
      }
    },
  ]

  return (
    <>
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Latest Grocery Content</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {videos.map((video, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <div className="relative">
                  <Image
                    src={video.thumbnail || "/placeholder.svg"}
                    alt={video.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    width={384}
                    height={192}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                      <Play className="w-6 h-6 text-red-500 ml-1" />
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{video.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{video.description}</p>            
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setSelectedVideo(video)}
                      className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 hover:scale-105"
                    >
                      Learn More
                    </button>
                    <button className="px-4 py-2 border border-orange-500 text-orange-500 rounded-full text-sm hover:bg-orange-50 transition-colors">
                      Watch
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <InfoModal
        isOpen={!!selectedVideo}
        onClose={() => setSelectedVideo(null)}
        title={selectedVideo?.title}
        icon={Play}
      >
        {selectedVideo && (
          <div className="space-y-6">
            <p className="text-lg">{selectedVideo.details.overview}</p>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                What You'll Learn
              </h4>
              <ul className="space-y-2">
                {selectedVideo.details.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-2xl">
              <p className="font-semibold text-gray-900 text-center text-sm">
                {selectedVideo.details.cta}
              </p>
            </div>
            
            <div className="flex gap-3">
              <button className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center gap-2">
                <Play className="w-4 h-4" />
                Watch Video
              </button>
              <button className="px-6 py-3 border-2 border-orange-500 text-orange-500 rounded-2xl hover:bg-orange-50 transition-colors font-semibold">
                Save
              </button>
            </div>
          </div>
        )}
      </InfoModal>
    </>
  )
}
/* eslint-disable react/no-unescaped-entities */
"use client"

import Image from "next/image"
import { useState } from "react"
import Link from 'next/link'

const imageData = [
  {
    src: "/creator-bg-webp/creator-hands.webp",
    title: "Grocery Creator Community",
    description: "Join thousands of creators earning through authentic grocery hauls and lifestyle content sharing.",
  },
  {
    src: "/creator-bg-webp/creator-podcast.webp",
    title: "Content Creation Support",
    description:
      "Learn from successful grocery creators who share haul`s, cooking tips, and lifestyle content that converts to sales.",
  },
  {
    src: "/creator-bg-webp/content-creator-3.webp",
    title: "Authentic Grocery Storytelling",
    description:
      "Create genuine content around your grocery shopping, meal prep, and lifestyle that resonates with your audience and drives affiliate sales.",
  },
]

export default function WhySupportUs() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div>
            <p className="text-red-500 font-medium text-sm uppercase tracking-wide mb-2">JOIN CREATOR PROGRAM</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6 text-balance">
              Turn Your Grocery Content Into Steady Income
            </h2>
            <p className="text-gray-600 mb-8">
              Join EMM-Fort&apos;s Creator Program and start earning 5% commission on every grocery order made through your
              referral code. Create authentic content around grocery hauls, unboxing videos, and lifestyle posts while
              building a sustainable income stream. It's free to join and you'll get paid every two weeks.
            </p>           
             <Link 
              href="#"
              className="inline-block bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-4 px-8 rounded-full hover:bg-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
               Start Earning Today →
            </Link>
          </div>

          {/* Right Content - Images */}
          <div className="grid grid-cols-1 gap-6">
            {imageData.map((item, index) => (
              <div
                key={index}
                className="relative overflow-hidden rounded-lg group cursor-pointer"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className="relative h-64 w-full">
                  <Image
                    src={item.src || "/placeholder.svg"}
                    alt={item.title}
                    className={`w-full h-full object-cover transition-transform duration-500 ease-out ${
                      hoveredIndex === index ? "transform -translate-y-12 scale-110" : ""
                    }`}
                    fill
                  />

                  {/* Overlay content that slides up */}
                  <div
                    className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 transform transition-all duration-500 ease-out ${
                      hoveredIndex === index ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
                    }`}
                  >
                    <h3 className="text-white font-bold text-xl mb-2">{item.title}</h3>
                    <p className="text-white/90 text-sm">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>       
      </div>
    </section>
  )
}

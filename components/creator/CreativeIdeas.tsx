/* eslint-disable react/no-unescaped-entities */
"use client"
import InfoModal from "@/components/modals/InfoModal"
import { CheckCircle, ExternalLink, ShoppingCart } from "lucide-react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useState } from "react"
import { useInView } from "react-intersection-observer"

export function CreativeIdeasCTA() {
   const { data: session, status } = useSession();
    const isCreator = session?.user?.isCreator;
    const isLoading = status === "loading";
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 })
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <section
        ref={ref}
        className="relative py-24 md:py-32 bg-gradient-to-r from-blue-900 to-purple-900"
        style={{
          backgroundImage: 'url("/creator-bg-webp/creator-cam.webp")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundBlendMode: "overlay",
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h2
              className={`text-white text-4xl md:text-5xl font-bold mb-6
                transition-all duration-1000 ease-out
                ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
              `}
            >
              Turn Your Grocery Shopping Into Viral TikTok Content
            </h2>
            <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
              Join 10,000+ creators earning 5% commission through authentic grocery hauls, unboxing videos, and meal prep content. Free to start, unlimited earning potential.
            </p>
            <button 
              onClick={() => setShowModal(true)}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-4 px-8 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              Get Content Ideas
            </button>
          </div>
        </div>
      </section>

      <InfoModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Viral Grocery Content Ideas"
        icon={ShoppingCart}
      >
        <div className="space-y-6">
          <p className="text-lg">Transform your weekly grocery shopping into engaging TikTok content that drives sales and builds your audience. These proven content formats help creators earn $2,000+ monthly through authentic grocery content.</p>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              High-Converting Content Ideas
            </h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                Weekly grocery haul videos with budget breakdowns
              </li>
              <li className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                Grocery delivery unboxing and first impressions
              </li>
              <li className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                Meal prep using your grocery haul products
              </li>
              <li className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                Budget grocery challenges and money-saving tips
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-blue-500" />
              TikTok-Optimized Formats
            </h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                15-30 second grocery haul highlights with trending audio
              </li>
              <li className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Price comparison videos ("grocery prices then vs now")
              </li>
              <li className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Quick recipe tutorials using featured products
              </li>
              <li className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                "Use my code [YOURCODE]" integrated naturally in content
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-2xl">
            <p className="font-semibold text-gray-900 text-center text-sm">
              Creators following these content strategies see 400% higher engagement and earn an average of $2,500/month in commissions.
            </p>
          </div> {/* Dynamic button based on auth state */}
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
            Start Creating Today
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
      </InfoModal>
    </>
  )
}
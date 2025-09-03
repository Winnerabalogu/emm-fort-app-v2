"use client"
import InfoModal from "@/components/modals/InfoModal"
import { CheckCircle, ExternalLink, Star } from "lucide-react"
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
              Creative ideas that will help your brand soar.
            </h2>
            <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
              Ready to take your content to the next level? Join thousands of creators who are already building their
              brand with us.
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
        title="Brand Building Ideas"
        icon={Star}
      >
        <div className="space-y-6">
          <p className="text-lg">Building a strong personal brand requires creativity, consistency, and authenticity. Our proven strategies help creators establish themselves as trusted authorities in their niche while growing their audience and revenue.</p>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Brand Building Strategies
            </h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                Develop a unique visual identity and color palette
              </li>
              <li className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                Create consistent messaging across all platforms
              </li>
              <li className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                Share behind-the-scenes content to build authenticity
              </li>
              <li className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                Collaborate with other creators in your niche
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Creative Content Ideas
            </h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                &quot;Day in the life&quot; vlogs featuring your routine
              </li>
              <li className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                Educational tutorials in your area of expertise
              </li>
              <li className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                Q&A sessions with your community
              </li>
              <li className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                Challenge videos and trend participation
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-2xl">
            <p className="font-semibold text-gray-900 text-center text-sm">
              Our creators who follow these brand-building strategies see an average 250% increase in follower growth and engagement rates.
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
            Access Brand Kit
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

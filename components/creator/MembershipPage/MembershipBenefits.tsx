"use client"
import { useInView } from "react-intersection-observer"
import { Camera, CheckCircle, ExternalLink, ShoppingBag, Ticket, Tv2} from 'lucide-react'
import InfoModal from "@/components/modals/InfoModal"
import { useState } from "react"

export default function MembershipBenefits() {
  const { ref: benefitsRef, inView: benefitsInView } = useInView({ triggerOnce: true, threshold: 0.1 })
  const [showModal, setShowModal] = useState(false)

  const benefits = [
    {
      icon: Tv2,
      title: "Exclusive Content",
      description: "Get access to premium tutorials, behind-the-scenes content, and exclusive member-only materials.",
    },
    {
      icon: ShoppingBag,
      title: "Discounts on Merch",
      description: "Enjoy special discounts on branded merchandise and creator tools from our partner network.",
    },
    {
      icon: Ticket,
      title: "Priority Tickets",
      description: "Get early access and priority booking for events, workshops, and exclusive meet-and-greets.",
    },
  ]

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
              <h6 className="text-orange-500 text-sm font-semibold uppercase tracking-wide mb-2">OUR MEMBERSHIP</h6>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                You inspire us and give us energy each and every night!
              </h2>
              <p className="text-gray-600 text-lg mb-8">
                Join our vibrant community of creators and supporters. Together, we&apos;re building something
                extraordinary - a platform where creativity meets opportunity, and where every creator has the chance to
                thrive and make a meaningful impact.
              </p>
              <button 
                onClick={() => setShowModal(true)}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-4 px-8 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                Learn more
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
        onClose={() => setShowModal}
          title="Creative Content Ideas"
            icon={Camera}
      >
        <div className="space-y-6">
          <p className="text-lg">Transform your everyday grocery shopping into compelling content that resonates with your audience and drives sales. Our creative team has developed proven content formats that consistently perform well.</p>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Content Ideas That Convert
            </h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                Weekly grocery haul videos with product highlights
              </li>
              <li className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                Budget-friendly meal prep using featured products
              </li>
              <li className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                Product unboxing and first impression reviews
              </li>
              <li className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                Behind-the-scenes grocery shopping vlogs
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-2xl">
            <p className="font-semibold text-gray-900 text-center text-sm">
              Our creators see an average 400% increase in engagement with our proven content formats.
            </p>
          </div>
          
          <button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center gap-2">
            Access Content Library
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </InfoModal>
    </>
  )
}
"use client"
import { useInView } from "react-intersection-observer"

export default function MembershipHero() {
  const { ref: heroRef, inView: heroInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  return (
    <section ref={heroRef} className="py-12 bg-gradient-to-br from-purple-400/50 via-white to-orange-200">
      <div className="container mx-auto pt-32 pb-16 text-center">
        <h1
          className={`text-4xl md:text-5xl font-bold text-gray-900 mb-6
            transition-all duration-1000 ease-out
            ${heroInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
          `}
        >
          Creator Program
        </h1>
        <p
          className={`text-xl text-gray-600 max-w-3xl mx-auto
            transition-all duration-1000 ease-out
            ${heroInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
          `}
          style={{ transitionDelay: heroInView ? "200ms" : "0ms" }}
        >
          Join EMM-Fort Creator Program to earn 5% commission on grocery orders. Create authentic content you love and
          get paid for it - completely free to join!
        </p>
      </div>
    </section>
  )
}

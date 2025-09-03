"use client"

import { motion } from "framer-motion"

export default function PlatformHero() {
  return (
    <section className="py-12 bg-gradient-to-br from-purple-400/50 via-white to-orange-200">
      <div className="container mx-auto pt-32 pb-16 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">Platform</h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Discover our comprehensive creator program platform designed to help you earn 5% commission creating content
            you already love.
          </p>
        </motion.div>
      </div>
    </section>
  )
}

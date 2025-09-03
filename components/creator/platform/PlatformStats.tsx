"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

export default function PlatformStats() {
  const [yearsCount, setYearsCount] = useState(0)
  const [successCount, setSuccessCount] = useState(0)

  useEffect(() => {
    const timer1 = setInterval(() => {
      setYearsCount((prev) => {
        if (prev < 5) {
          return prev + 1
        }
        clearInterval(timer1)
        return 5
      })
    }, 200)

    const timer2 = setInterval(() => {
      setSuccessCount((prev) => {
        if (prev < 98) {
          return prev + 2
        }
        clearInterval(timer2)
        return 98
      })
    }, 50)

    return () => {
      clearInterval(timer1)
      clearInterval(timer2)
    }
  }, [])

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              We Are Ready To Make A Difference
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Join our growing community of successful creators who are earning consistent income through authentic
              grocery content. Start your journey today and become part of our success story.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-8"
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                className="text-5xl md:text-6xl font-bold text-orange-500 mb-2"
              >
                {yearsCount}+
              </motion.div>
              <p className="text-gray-600 font-semibold">Years Experience</p>
            </div>
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true }}
                className="text-5xl md:text-6xl font-bold text-orange-500 mb-2"
              >
                {successCount}%
              </motion.div>
              <p className="text-gray-600 font-semibold">Creator Success Rate</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

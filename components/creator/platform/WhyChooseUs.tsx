"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { Megaphone, Users, TrendingUp } from "lucide-react"
import Image from "next/image"

export default function WhyChooseUs() {
  const [count1, setCount1] = useState(0)
  const [count2, setCount2] = useState(0)

  useEffect(() => {
    const timer1 = setInterval(() => {
      setCount1((prev) => {
        if (prev < 19878) {
          return prev + 150
        }
        clearInterval(timer1)
        return 19878
      })
    }, 20)

    const timer2 = setInterval(() => {
      setCount2((prev) => {
        if (prev < 25432) {
          return prev + 200
        }
        clearInterval(timer2)
        return 25432
      })
    }, 20)

    return () => {
      clearInterval(timer1)
      clearInterval(timer2)
    }
  }, [])

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm rounded-xl p-3">
                <div className="text-white text-sm font-semibold">Active Creators</div>
                <div className="text-white text-2xl font-bold">{count1.toLocaleString()}</div>
              </div>

              <div className="absolute bottom-4 right-4 bg-white rounded-xl p-4 shadow-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Monthly Growth</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{count2.toLocaleString()}</div>
              </div>

              <div className="flex items-center justify-center h-64">
                <Image
                  src="/creator-bg-webp/creator-phone.webp"
                  alt="Happy creator with groceries"
                  className="w-48 h-60 object-cover rounded-2xl"
                  width={192}
                  height={240}
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">Why Choose EMM-Fort?</h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Join thousands of creators who are already earning 5% commission on grocery orders. We grow together, you
              earn as we grow.
            </p>

            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="flex items-start gap-4"
              >
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Megaphone className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Promote Your Favorite Products</h3>
                  <p className="text-gray-600">
                    Create authentic content featuring grocery items you actually use and love, making your promotions
                    genuine and effective.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
                className="flex items-start gap-4"
              >
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Professional Creator Support</h3>
                  <p className="text-gray-600">
                    Get dedicated support, content ideas, and marketing materials from our experienced team to maximize
                    your earning potential.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                viewport={{ once: true }}
                className="flex items-start gap-4"
              >
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Successful Campaign Results</h3>
                  <p className="text-gray-600">
                    Join creators who consistently earn through our proven system with fast bi-weekly payouts and
                    transparent tracking.
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

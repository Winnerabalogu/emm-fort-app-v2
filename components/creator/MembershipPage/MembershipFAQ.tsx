"use client"
import { useState } from "react"

export default function MembershipFAQ() {
  const [activeQuestion, setActiveQuestion] = useState<number | null>(null)

  const faqQuestions = [
    {
      question: "How does EMM-FORT Creator Program work?",
      answer:
        "Sign up for free and get your unique referral code. Create grocery hauls, unboxing videos, and lifestyle content featuring your code. Earn 5% commission on every grocery order made through your content with bi-weekly payouts.",
    },
    {
      question: "Do I need thousands of followers to join?",
      answer:
        "Not at all! We welcome creators of all sizes. Whether you have 100 or 100K followers, what matters most is your creativity, authenticity, and passion for creating engaging grocery content.",
    },
    {
      question: "How much commission can I earn?",
      answer:
        "You earn 5% commission on every grocery order made with your referral code. Our top creators earn $5,000+ monthly, with the average active creator earning around $2,500/month through consistent posting.",
    },
    {
      question: "When do I receive payments?",
      answer:
        "Payments are processed bi-weekly with no minimum payout threshold. We support various payment methods including direct deposit, PayPal, and digital wallets for your convenience.",
    },
    {
      question: "Can I use my referral code on other platforms?",
      answer:
        "Absolutely! Your referral code works across all social media platforms. Whether you're posting on TikTok, Instagram, YouTube, or your blog, you'll earn commission on orders made through your code.",
    },
    {
      question: "What support do you provide to creators?",
      answer:
        "We offer comprehensive support including content creation guidelines, trending hashtag research, professional product images, video templates, and 24/7 creator support team assistance.",
    },
  ]

  const toggleQuestion = (index: number) => {
    setActiveQuestion(activeQuestion === index ? null : index)
  }

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h6 className="text-orange-500 text-sm font-semibold uppercase tracking-wide mb-2">COMMON QUESTIONS</h6>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Most Popular Questions</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {faqQuestions.map((faq, index) => (
            <div key={index} className="bg-gray-50 rounded-2xl p-6 hover:bg-gray-100 transition-colors duration-300">
              <button
                onClick={() => toggleQuestion(index)}
                className="w-full text-left flex items-start justify-between group"
              >
                <h4 className="text-lg font-bold text-gray-900 pr-4 group-hover:text-orange-600 transition-colors duration-300">
                  {faq.question}
                </h4>
                <div
                  className={`flex-shrink-0 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center transition-all duration-300 group-hover:bg-orange-600 ${
                    activeQuestion === index ? "rotate-45 bg-orange-600" : ""
                  }`}
                >
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              </button>
              <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  activeQuestion === index ? "max-h-48 opacity-100 mt-4" : "max-h-0 opacity-0"
                }`}
              >
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

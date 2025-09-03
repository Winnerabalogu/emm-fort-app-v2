"use client"
import { useState } from "react"

export default function MembershipFAQ() {
  const [activeQuestion, setActiveQuestion] = useState<number | null>(null)

  const faqQuestions = [
    {
      question: "How does EMM-FORT Creator Program work?",
      answer:
        "Our creator program connects talented content creators with brands and opportunities. You create content, we provide the platform, resources, and partnerships to help you monetize your creativity effectively.",
    },
    {
      question: "What are the requirements to join?",
      answer:
        "We welcome creators of all sizes! Whether you have 1K or 1M followers, what matters most is your creativity, engagement, and passion for creating authentic content.",
    },
    {
      question: "How much commission can I earn?",
      answer:
        "Commission rates vary by campaign and your performance tier, ranging from 15% to 30%. Top performers can earn additional bonuses and exclusive high-paying opportunities.",
    },
    {
      question: "When do I receive payments?",
      answer:
        "Payments are processed monthly, typically within the first week of each month. We support various payment methods including bank transfers and digital wallets.",
    },
    {
      question: "Can I promote multiple brands simultaneously?",
      answer:
        "Yes! You can work with multiple non-competing brands simultaneously. Our platform helps you manage multiple campaigns and track performance across all partnerships.",
    },
    {
      question: "What support do you provide to creators?",
      answer:
        "We offer comprehensive support including content strategy guidance, technical assistance, marketing resources, and dedicated account management for our top-tier creators.",
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

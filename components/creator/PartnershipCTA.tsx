import Link from "next/link"

export default function PartnershipCTA() {
  return (
    <section className="py-20 bg-gradient-to-br from-purple-400/40 via-white to-orange-200">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
          Ready to earn 5% commission on every grocery order?
        </h2>
        <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
          Join thousands of creators who are already earning through authentic grocery content. Free signup, fast
          bi-weekly payouts, and unlimited earning potential await you.
        </p>       
          <Link 
              href="#"
              className="inline-block items-center border-2 border-orange-500 text-orange-500 font-semibold py-3 px-8 rounded-full hover:bg-orange-500 hover:text-white transition-all duration-300 group"            
            >
               Join Creator Program →
            </Link>
      </div>
    </section>
  )
}

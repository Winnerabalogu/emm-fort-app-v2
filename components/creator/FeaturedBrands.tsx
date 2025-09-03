import Image from "next/image"



const brands = [
  { name: "Zoo TV", logo: "/creator-logos-webp/zoo-tv.png" },
  { name: "Velocity 9", logo: "/creator-logos-webp/velocity-9.png" },
  { name: "Treva", logo: "/creator-logos-webp/treva.png" },
  { name: "Muzica", logo: "/creator-logos-webp/muzica.png" },
  { name: "Fox Hub", logo: "/creator-logos-webp/fox-hub.png" },
  { name: "Asgardia", logo: "/creator-logos-webp/asgardia.png" },
  { name: "Earth 2.0", logo: "/creator-logos-webp/earth-2.0.png" },
  { name: "Code Lab", logo: "/creator-logos-webp/code-lab.png" },
]

export default function FeaturedBrands() {
  
  return (
    <section className="py-16 bg-gradient-to-br from-orange-50 via-white to-red-50">
      <div className="container mx-auto">
        {/* Section Title */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">Our Partners</h2>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Collaborating with amazing brands and creators to build something extraordinary together.
          </p>
        </div>

        {/* Two Images Side by Side with Diagonal Layout */}
        <div className="relative mb-20">
          <div className="flex items-start gap-2">
            <div className="flex-[7] relative overflow-hidden">
              <Image
                src="/creator-bg-webp/creator-hands.webp"
                alt="Happy content creators celebrating"
                className="w-full h-96 object-cover transition-transform duration-500 group-hover:scale-105"
                width={700}
                height={500}
              />
            </div>
            <div className="flex-[3] relative overflow-hidden">
              <Image
                src="/creator-bg-webp/content-creator-4.webp"
                alt="Female podcaster recording content"
                className="w-full h-96 object-cover transition-transform duration-500 group-hover:scale-105"
                width={300}
                height={500}
              />
            </div>
          </div>
        </div>

        {/* Text Section */}
        <div className="text-center mb-16">
          <p className="text-red-500 font-medium text-sm uppercase tracking-wide mb-4">FEATURED BRANDS</p>
          <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 max-w-4xl mx-auto">
            Thank you for supporting our talents.
          </h2>
        </div>

        {/* Brand Logos Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 lg:gap-16">
          {brands.map((brand, index) => (
            <div key={index} className="flex items-center justify-center group">
              <div className="relative w-full h-16 flex items-center justify-center">
                <Image
                  src={brand.logo}
                  alt={brand.name}
                  className="max-w-full max-h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300 opacity-60 group-hover:opacity-100"
                  width={120}
                  height={60}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
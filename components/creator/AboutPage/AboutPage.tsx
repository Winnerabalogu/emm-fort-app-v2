"use client"
import Image from "next/image"
import { useInView } from "react-intersection-observer"
import { CameraIcon, MicIcon, BookOpenIcon, Music2Icon } from "lucide-react"

const AboutPageComponent = () => {
  const { ref: heroRef, inView: heroInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const { ref: introRef, inView: introInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const { ref: categoriesRef, inView: categoriesInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const { ref: visionRef, inView: visionInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const categories = [
    {
      icon:CameraIcon,
      title: "Daily Vlog",
      description:
        "Share your daily adventures and connect with audiences through authentic storytelling and behind-the-scenes content.",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: MicIcon,
      title: "Podcast",
      description:
        "Create engaging audio content that educates, entertains, and builds meaningful conversations with your community.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: BookOpenIcon,
      title: "Story Teller",
      description:
        "Craft compelling narratives that captivate audiences and bring brands to life through powerful storytelling.",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Music2Icon,
      title: "Music",
      description:
        "Share your musical talents and create soundtracks that resonate with audiences and enhance brand experiences.",
      color: "from-orange-500 to-red-500",
    },
  ]

  return (
    <>      
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section ref={heroRef} className="py-16   bg-gradient-to-br from-blue-400 via-white to-orange-200">
          <div className="container pt-32 pb-16  mx-auto px-4 text-center">
            <h1
              className={`text-4xl md:text-5xl font-bold text-gray-900 mb-4 transition-all duration-1000 ease-out ${heroInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              About us
            </h1>
            <p
              className={`text-xl text-gray-600 max-w-2xl mx-auto transition-all duration-1000 ease-out ${heroInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: heroInView ? "200ms" : "0ms" }}
            >
              Creative and innovative at the same time.
            </p>
          </div>
        </section>

        {/* Introduction Section */}
        <section ref={introRef} className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div
                className={`transition-all duration-1000 ease-out ${introInView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}
              >
                <h6 className="text-orange-500 text-sm font-semibold uppercase tracking-wide mb-2">INTRODUCING</h6>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  Hello, I&apos;m Sarah Chen.
                  <br />
                  Your favorite content creator.
                </h2>
                <p className="text-gray-600 text-lg mb-8">
                  Welcome to EMM-FORT Creator Program, where creativity meets opportunity. I&apos;ve been creating
                  content for over 5 years, helping brands connect with their audiences through authentic storytelling
                  and innovative campaigns. Our mission is to empower creators like you to build sustainable careers
                  while making a meaningful impact.
                </p>
                <button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-4 px-8 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
                  Learn more
                </button>
              </div>

              {/* Right Image */}
              <div
                className={`relative transition-all duration-1000 ease-out ${introInView ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}
              >
                <div className="relative max-w-md mx-auto">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl transform rotate-6"></div>
                  <div className="relative bg-white rounded-3xl p-6 shadow-xl overflow-hidden">
                    <div className="w-full h-96 rounded-2xl overflow-hidden">
                      <Image
                        src="/creator-webp/1img_5.webp"
                        alt="Sarah Chen - Content Creator"
                        className="w-full h-full object-cover"
                        width={384}
                        height={384}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Content Categories */}
        <section ref={categoriesRef} className="py-16 md:py-24 bg-gray-50">
          <div className="container mx-auto px-4">
            <div
              className={`text-center mb-16 transition-all duration-1000 ease-out ${categoriesInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Featured Content Categories</h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Discover the diverse range of content categories we support, each designed to help you showcase your
                unique talents.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((category, index) => {
                  const IconComponent = category.icon
                  return(
                <div
                  key={category.title}
                  className={`group cursor-pointer transition-all duration-1000 ease-out ${categoriesInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                  style={{ transitionDelay: categoriesInView ? `${index * 150}ms` : "0ms" }}
                >
                  <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-500 h-full flex flex-col items-center text-center group-hover:scale-105">
                    <div
                      className={`w-16 h-16 bg-gradient-to-br ${category.color} rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <IconComponent className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{category.title}</h3>
                    <p className="text-gray-600 text-sm flex-grow">{category.description}</p>
                    <button className="mt-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-2 px-6 rounded-full transition-all duration-300 text-sm opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0">
                      Learn More
                    </button>
                  </div>
                </div>
               )
          })}
            </div>
          </div>
        </section>

        {/* Vision & Mission Section */}
        <section ref={visionRef} className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div
                className={`transition-all duration-1000 ease-out ${visionInView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}
              >
                <h6 className="text-orange-500 text-sm font-semibold uppercase tracking-wide mb-2">VALUES</h6>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
                  Making your everyday watching worthwhile.
                </h2>
                <p className="text-gray-600 text-lg mb-12">
                  We believe that great content has the power to inspire, educate, and transform lives. Our platform is
                  built on the foundation of authenticity, creativity, and community.
                </p>

                {/* Vision & Mission */}
                <div className="space-y-8">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 mb-2">Our vision</h4>
                      <p className="text-gray-600">
                        To create a global ecosystem where every creator has the opportunity to thrive, connecting
                        authentic voices with engaged communities worldwide.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 mb-2">Our mission</h4>
                      <p className="text-gray-600">
                        To empower content creators with the tools, resources, and partnerships they need to build
                        sustainable careers while creating meaningful impact.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Image */}
              <div
                className={`transition-all duration-1000 ease-out ${visionInView ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}
              >
                <div className="relative">
                  <Image
                    src="/creator-bg-webp/about-value.webp"
                    alt="Creator Vision"
                    className="w-full h-96 object-cover rounded-2xl shadow-xl"
                    width={484}
                    height={216}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Community Images */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="aspect-video rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 group">
                <Image
                  src="/creator-bg-webp/content-creator-1.webp"
                  alt="Creator Community"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  width={384}
                  height={216}
                />
              </div>
              <div className="aspect-video rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 group">
                <Image
                  src="/creator-bg-webp/content-creator-2.webp"
                  alt="Creator Workshop"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  width={384}
                  height={216}
                />
              </div>
              <div className="aspect-video rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 group">
                <Image
                  src="/creator-bg-webp/content-creator-3.webp"
                  alt="Creator Event"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  width={384}
                  height={216}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Partnership CTA */}
         <section className="py-20 bg-gray-100">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
          Ready to start earning commission on every grocery order?
        </h2>
        <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
          Join thousands of creators who are already earning through authentic grocery content. Free signup, fast
          bi-weekly payouts, and unlimited earning potential await you.
        </p>
       <button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-4 px-8 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
          Join Creator Program →
        </button>
      </div>
    </section>
      </div>      
    </>
  )
}

export default AboutPageComponent

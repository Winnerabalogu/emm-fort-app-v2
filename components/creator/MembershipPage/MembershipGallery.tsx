import Image from "next/image"

export default function MembershipGallery() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="aspect-video rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
            <Image
              src="/creator-bg-webp/content-creator-1.webp"
              alt="Creator Community"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              width={384}
              height={216}
            />
          </div>
          <div className="aspect-video rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
            <Image
              src="/creator-bg-webp/content-creator-2.webp"
              alt="Creator Workshop"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              width={450}
              height={216}
            />
          </div>
          <div className="aspect-video rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
            <Image
              src="/creator-bg-webp/content-creator-3.webp"
              alt="Creator Event"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              width={384}
              height={216}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

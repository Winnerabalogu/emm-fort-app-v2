import Link from 'next/link';

const Hero = () => {
  return (
    <section className="min-h-screen flex items-center justify-center text-center bg-dark-bg pt-24 pb-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4 text-white">
          Introducing EMM-Fort Group of Companies
        </h1>
        <h2 className="text-3xl md:text-4xl lg:text-6xl font-bold text-brand-orange mb-6">
          A Global Conglomerate Driving Innovation and Growth
        </h2>
        <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-8">
          Our diverse portfolio of companies is transforming industries and improving lives worldwide. Meet our dynamic subsidiaries.
        </p>
        <Link href="/" className="bg-white text-black font-semibold py-3 px-8 rounded-full text-lg hover:bg-brand-orange hover:text-white transition-colors">
          Ask Me
        </Link>
      </div>
    </section>
  );
};

export default Hero;
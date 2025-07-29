import Header from '@/components/Header';
import Hero from '@/components/landing/Hero';
import Subsidiaries from '@/components/landing/Subsidiaries';
import Footer from '@/components/Footer';

export default function HomePage() {
  return (
    <div className="relative">
      <Header />
      <main>
        <Hero />
        <Subsidiaries id="companies" />
      </main>
      <Footer />
    </div>
  );
}
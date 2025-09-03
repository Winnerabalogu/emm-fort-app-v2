// app/creator/page.tsx
import NewsletterFooter from '@/components/creator/NewsletterFooter';
import { Header } from '@/components/creator/header';
import AboutPageComponent from '@/components/creator/AboutPage/AboutPage';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50">
       <Header />
      <main>
       <AboutPageComponent/>
      </main>
      <NewsletterFooter />
    </div>
  );
}
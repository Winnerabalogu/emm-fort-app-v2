// app/creator/page.tsx
import NewsletterFooter from '@/components/creator/NewsletterFooter';
import { Header } from '@/components/creator/header';
import ContactPageComponent from '@/components/creator/ContactPage/ContactPagecomponent';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-50">
       <Header />
      <main>       
        <ContactPageComponent/>
      </main>
      <NewsletterFooter />
    </div>
  );
}
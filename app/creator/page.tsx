// app/creator/page.tsx
import CreatorHero from '@/components/creator/CreatorHero';
import FeaturedBrands from '@/components/creator/FeaturedBrands';
import CreativeIdeas from '@/components/creator/CreativeIdeas';
import WhySupportUs from '@/components/creator/WhySupportUs';
import PartnershipCTA from '@/components/creator/PartnershipCTA';
import NewsletterFooter from '@/components/creator/NewsletterFooter';
import { Header } from '@/components/creator/header';
import FeaturedContent from '@/components/creator/FeaturedContent';
import VideoContentSection from '@/components/creator/VideoContentSection';
import MembershipCTA from '@/components/creator/MembershipCTA';
import CreatorContent from '@/components/creator/CreatorContent';
import VideoBlog from '@/components/creator/VideoBlog';
import CommunityShowcase from '@/components/creator/CommunityShowcase';

export default function CreatorProgramPage() {
  return (
     <div className="min-h-screen bg-slate-50">
      <Header />
      <main>
        <CreatorHero />
        <FeaturedContent />
        <CommunityShowcase />
        <CreatorContent/>       
        <CreativeIdeas />   
        <VideoBlog/>
        <VideoContentSection />
        <FeaturedBrands />
         <WhySupportUs />
        <PartnershipCTA />
         <MembershipCTA />                     
      </main>
      <NewsletterFooter />
    </div>
  );
}
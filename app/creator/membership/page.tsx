"use client"
import MembershipHero from "@/components/creator/MembershipPage/MembershipHero"
import MembershipBenefits from "@/components/creator/MembershipPage/MembershipBenefits"
import MembershipGallery from "@/components/creator/MembershipPage/MembershipGallery"
import MembershipForm from "@/components/creator/MembershipPage/MembershipForm"
import { CreativeIdeasCTA } from "@/components/creator/MembershipPage/CreativeIdeasCTA"
import MembershipFAQ from "@/components/creator/MembershipPage/MembershipFAQ"
import { Header } from "@/components/creator/header"
import NewsletterFooter from "@/components/creator/NewsletterFooter"
import CommunityShowcase from "@/components/creator/CommunityShowcase"

export default function MembershipPage() {
  return (    
    <div className="min-h-screen bg-slate-50">
        <Header />
        <main>
          <MembershipHero />
          <MembershipBenefits />
          <CommunityShowcase />
          <MembershipForm />
          <CreativeIdeasCTA />        
          <MembershipFAQ />
          <MembershipGallery/>
        </main>
        <NewsletterFooter />
    </div>    
  );
}

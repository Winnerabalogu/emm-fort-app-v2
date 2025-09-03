import PlatformHero from "@/components/creator/platform/PlatformHero"
import PlatformServices from "@/components/creator/platform/PlatformServices"
import WhyChooseUs from "@/components/creator/platform/WhyChooseUs"
import PlatformStats from "@/components/creator/platform/PlatformStats"
import { Header } from "@/components/creator/header"
import NewsletterFooter from "@/components/creator/NewsletterFooter"

export default function PlatformPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main>
        <PlatformHero />
        <WhyChooseUs />     
        <PlatformStats />           
        <PlatformServices />
      </main>
      <NewsletterFooter/>
    </div>
  )
}

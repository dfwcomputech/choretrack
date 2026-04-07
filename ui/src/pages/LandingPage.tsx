import Navbar from '../components/Navbar'
import HeroSection from '../sections/HeroSection'
import FeaturesSection from '../sections/FeaturesSection'
import HowItWorksSection from '../sections/HowItWorksSection'
import RewardsSection from '../sections/RewardsSection'
import BenefitsSection from '../sections/BenefitsSection'
import PricingSection from '../sections/PricingSection'
import FAQSection from '../sections/FAQSection'
import CTASection from '../sections/CTASection'
import Footer from '../sections/Footer'

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <RewardsSection />
        <BenefitsSection />
        <PricingSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}

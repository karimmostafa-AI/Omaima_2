import { MainLayout } from "@/components/layout/main-layout"
import { HeroSection } from "@/components/sections/hero-section"
import { FeaturesSection } from "@/components/sections/features-section"
import { FeaturedProductsSection } from "@/components/sections/featured-products-section"
import { ServicesSection } from "@/components/sections/services-section"
import { TestimonialsSection } from "@/components/sections/testimonials-section"
import { NewsletterSection } from "@/components/sections/newsletter-section"

export default function Home() {
  return (
    <MainLayout>
      <HeroSection />
      <FeaturesSection />
      <FeaturedProductsSection />
      <ServicesSection />
      <TestimonialsSection />
      <NewsletterSection />
    </MainLayout>
  )
}

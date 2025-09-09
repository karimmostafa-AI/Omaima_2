import { MainLayout } from "@/components/layout/main-layout"
import { HeroSection } from "@/components/sections/hero-section"
import { CategoriesSection } from "@/components/sections/categories-section"
import { StaticFeaturedProducts } from "@/components/sections/static-featured-products"
import { ServicesSection } from "@/components/sections/services-section"
import { TestimonialsSection } from "@/components/sections/testimonials-section"
import { NewsletterSection } from "@/components/sections/newsletter-section"

export default function Home() {
  return (
    <MainLayout>
      <HeroSection />
      <CategoriesSection />
      <StaticFeaturedProducts />
      <ServicesSection />
      <TestimonialsSection />
      <NewsletterSection />
    </MainLayout>
  )
}

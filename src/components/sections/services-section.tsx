import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"

export function ServicesSection() {
  const services = [
    {
      title: "Personal Styling",
      description: "Work with our expert stylists to create a wardrobe that reflects your professional goals and personal style.",
      features: ["Style consultation", "Wardrobe audit", "Personal shopping", "Seasonal updates"],
      icon: "💄"
    },
    {
      title: "Corporate Uniforms",
      description: "Complete uniform solutions for businesses, including design, manufacturing, and ongoing support.",
      features: ["Custom design", "Brand integration", "Bulk ordering", "Size management"],
      icon: "🏢"
    },
    {
      title: "Alteration Services",
      description: "Professional alterations and repairs to ensure your garments always fit perfectly and look their best.",
      features: ["Expert tailoring", "Quick turnaround", "Satisfaction guarantee", "Maintenance tips"],
      icon: "📐"
    }
  ]

  return (
    <section className="py-20 bg-gradient-to-br from-muted/20 to-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="font-serif text-3xl lg:text-4xl font-bold text-foreground">
                Professional Services
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Beyond our premium products, we offer comprehensive services designed to support your professional image and business needs. Our expert team is committed to delivering exceptional results that exceed your expectations.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mt-1">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">25+ Years Experience</h3>
                  <p className="text-sm text-muted-foreground">Trusted by professionals across various industries</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mt-1">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Satisfaction Guarantee</h3>
                  <p className="text-sm text-muted-foreground">100% satisfaction or we'll make it right</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mt-1">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Expert Consultations</h3>
                  <p className="text-sm text-muted-foreground">Personal guidance from style professionals</p>
                </div>
              </div>
            </div>

            <Button asChild size="lg">
              <Link href="/contact">Schedule Consultation</Link>
            </Button>
          </div>

          <div className="space-y-6">
            {services.map((service, index) => (
              <Card key={index} className="p-6 border-0 bg-background/70 backdrop-blur-sm hover:bg-background/90 transition-all duration-300 group">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <span className="text-2xl">{service.icon}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-foreground mb-2">
                      {service.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-3">
                      {service.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {service.features.map((feature, featureIndex) => (
                        <span key={featureIndex} className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
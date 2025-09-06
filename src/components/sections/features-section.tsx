import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

export function FeaturesSection() {
  const features = [
    {
      icon: "✂️",
      title: "Expert Tailoring",
      description: "Our master tailors bring decades of experience to create the perfect fit for your professional wardrobe.",
      badge: "Craftmanship"
    },
    {
      icon: "🧵",
      title: "Premium Fabrics",
      description: "Sourced from renowned mills worldwide, our fabrics combine durability with elegance for lasting style.",
      badge: "Quality"
    },
    {
      icon: "📏",
      title: "Custom Measurements",
      description: "Precise measurements and fittings ensure every piece complements your unique silhouette perfectly.",
      badge: "Personalized"
    },
    {
      icon: "🚚",
      title: "Fast Delivery",
      description: "Professional timeline with express delivery options to meet your business and event schedules.",
      badge: "Efficiency"
    },
    {
      icon: "🔄",
      title: "Easy Alterations",
      description: "Complimentary alterations within 30 days to ensure your satisfaction with the perfect fit.",
      badge: "Service"
    },
    {
      icon: "💼",
      title: "Corporate Solutions",
      description: "Bulk ordering and team uniform solutions for businesses seeking professional consistency.",
      badge: "Business"
    }
  ]

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Why Choose Omaima
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience the difference of true craftsmanship with our comprehensive suite of professional services designed for the modern woman.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 border-0 bg-background/50 backdrop-blur-sm hover:bg-background/80 transition-all duration-300 group">
              <div className="mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                  <span className="text-2xl">{feature.icon}</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {feature.badge}
                </Badge>
              </div>
              <h3 className="font-semibold text-xl text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
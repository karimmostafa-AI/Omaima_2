import { Avatar } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"

export function TestimonialsSection() {
  const testimonials = [
    {
      name: "Sarah Williams",
      role: "Corporate Executive",
      company: "TechCorp International",
      content: "Omaima transformed my professional wardrobe completely. The quality and fit are exceptional, and I always feel confident in meetings. Their custom tailoring service is unmatched.",
      rating: 5,
      avatar: "SW"
    },
    {
      name: "Jennifer Chen",
      role: "Senior Manager",
      company: "Global Finance Ltd",
      content: "The attention to detail and customer service exceeded my expectations. My team uniforms look professional and cohesive, which has positively impacted our brand image.",
      rating: 5,
      avatar: "JC"
    },
    {
      name: "Maria Rodriguez",
      role: "Business Owner",
      company: "Boutique Consulting",
      content: "Working with Omaima has been a game-changer for my business image. Their styling consultation helped me create a signature look that clients remember and respect.",
      rating: 5,
      avatar: "MR"
    },
    {
      name: "Amanda Thompson",
      role: "Legal Director",
      company: "Thompson & Associates",
      content: "The professionalism and craftsmanship are evident in every piece. From the initial consultation to the final fitting, the experience was seamless and enjoyable.",
      rating: 5,
      avatar: "AT"
    }
  ]

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl lg:text-4xl font-bold text-foreground mb-4">
            What Our Clients Say
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover why hundreds of professional women trust Omaima for their wardrobe needs and business image.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="p-8 border-0 bg-background/70 backdrop-blur-sm hover:bg-background/90 transition-all duration-300 group">
              <div className="mb-6">
                <div className="flex text-primary mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-lg">★</span>
                  ))}
                </div>
                <p className="text-muted-foreground leading-relaxed italic">
                  "{testimonial.content}"
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <Avatar className="w-12 h-12 bg-primary/10 border border-primary/20">
                  <div className="w-full h-full flex items-center justify-center text-primary font-semibold">
                    {testimonial.avatar}
                  </div>
                </Avatar>
                <div>
                  <div className="font-semibold text-foreground">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {testimonial.role}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {testimonial.company}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="flex items-center justify-center space-x-8 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <div className="text-2xl text-primary">⭐</div>
              <div>
                <div className="font-semibold text-foreground">4.9/5</div>
                <div>Average Rating</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-2xl text-primary">👥</div>
              <div>
                <div className="font-semibold text-foreground">500+</div>
                <div>Happy Clients</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-2xl text-primary">🏆</div>
              <div>
                <div className="font-semibold text-foreground">10+</div>
                <div>Years Excellence</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
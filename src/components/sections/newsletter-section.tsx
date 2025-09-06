"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useState } from "react"

export function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setIsSubmitted(true)
    setIsSubmitting(false)
    setEmail('')
    setName('')
    
    // Reset success message after 3 seconds
    setTimeout(() => setIsSubmitted(false), 3000)
  }
  return (
    <section className="py-20 bg-gradient-to-br from-primary/5 to-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 lg:p-12 border-0 bg-background/80 backdrop-blur-sm shadow-xl">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h2 className="font-serif text-3xl lg:text-4xl font-bold text-foreground">
                    Stay Updated
                  </h2>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Join our exclusive newsletter to receive styling tips, new collection previews, and special offers designed for the professional woman.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm text-muted-foreground">Early access to new collections</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm text-muted-foreground">Exclusive styling tips and trends</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm text-muted-foreground">Special member-only discounts</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm text-muted-foreground">Professional wardrobe insights</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-muted/30 rounded-lg p-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-xl text-foreground">
                      Get 15% Off Your First Order
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Subscribe to our newsletter and receive an exclusive welcome discount plus free shipping on your first purchase.
                    </p>
                    
                    <form className="space-y-3" onSubmit={handleSubmit}>
                      <div className="space-y-2">
                        <Input 
                          type="email" 
                          placeholder="Enter your email address"
                          className="bg-background"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                        <Input 
                          type="text" 
                          placeholder="Your name (optional)"
                          className="bg-background"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full" 
                        size="lg"
                        disabled={isSubmitting || !email}
                      >
                        {isSubmitting ? 'Subscribing...' : isSubmitted ? 'Successfully Subscribed!' : 'Subscribe & Save 15%'}
                      </Button>
                    </form>
                    
                    <p className="text-xs text-muted-foreground text-center">
                      By subscribing, you agree to our privacy policy. Unsubscribe at any time.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-center space-x-6 text-xs text-muted-foreground">
                  <div className="text-center">
                    <div className="text-lg font-bold text-primary">2K+</div>
                    <div>Subscribers</div>
                  </div>
                  <div className="w-px h-8 bg-border"></div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-primary">98%</div>
                    <div>Satisfaction</div>
                  </div>
                  <div className="w-px h-8 bg-border"></div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-primary">Weekly</div>
                    <div>Updates</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}
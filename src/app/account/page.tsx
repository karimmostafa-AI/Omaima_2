"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { withCustomerAuth } from "@/components/auth/auth-wrapper"
import { useAuthStore } from "@/store/auth-store"
import { User, ShoppingBag, Heart, Settings } from "lucide-react"

function AccountPage() {
  const { user } = useAuthStore()

  if (!user) return null

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Account</h1>
            <p className="text-muted-foreground">
              Welcome back, {user.firstName} {user.lastName}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center p-6">
                <User className="h-8 w-8 text-primary mr-4" />
                <div>
                  <h3 className="font-semibold">Profile</h3>
                  <p className="text-sm text-muted-foreground">Update your details</p>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center p-6">
                <ShoppingBag className="h-8 w-8 text-primary mr-4" />
                <div>
                  <h3 className="font-semibold">Orders</h3>
                  <p className="text-sm text-muted-foreground">View order history</p>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center p-6">
                <Heart className="h-8 w-8 text-primary mr-4" />
                <div>
                  <h3 className="font-semibold">Saved Designs</h3>
                  <p className="text-sm text-muted-foreground">Your custom designs</p>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center p-6">
                <Settings className="h-8 w-8 text-primary mr-4" />
                <div>
                  <h3 className="font-semibold">Settings</h3>
                  <p className="text-sm text-muted-foreground">Account preferences</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Account Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Account Overview</CardTitle>
                <CardDescription>Your account details and status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Name</p>
                    <p className="text-sm text-muted-foreground">
                      {user.firstName} {user.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Account Status</p>
                    <p className="text-sm text-green-600">Active</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Member Since</p>
                    <p className="text-sm text-muted-foreground">January 2024</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  Edit Profile
                </Button>
              </CardContent>
            </Card>

            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Your latest purchases</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">#OM-2024-001</p>
                      <p className="text-sm text-muted-foreground">Navy Business Suit</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">$299.99</p>
                      <p className="text-xs text-green-600">Delivered</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">#OM-2024-002</p>
                      <p className="text-sm text-muted-foreground">Custom Blazer</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">$189.99</p>
                      <p className="text-xs text-blue-600">In Production</p>
                    </div>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-4">
                  View All Orders
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Saved Designs */}
          <Card>
            <CardHeader>
              <CardTitle>Your Saved Designs</CardTitle>
              <CardDescription>
                Custom suit designs you've created and saved for later
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="border rounded-lg p-4 space-y-2">
                  <div className="aspect-square bg-muted rounded-md flex items-center justify-center">
                    <span className="text-2xl">👔</span>
                  </div>
                  <h4 className="font-medium">Classic Navy Suit</h4>
                  <p className="text-sm text-muted-foreground">Premium wool, single-breasted</p>
                  <p className="text-sm font-medium">$459.99</p>
                  <Button size="sm" className="w-full">Add to Cart</Button>
                </div>
                
                <div className="border rounded-lg p-4 space-y-2">
                  <div className="aspect-square bg-muted rounded-md flex items-center justify-center">
                    <span className="text-2xl">👗</span>
                  </div>
                  <h4 className="font-medium">Executive Dress</h4>
                  <p className="text-sm text-muted-foreground">Charcoal grey, professional fit</p>
                  <p className="text-sm font-medium">$329.99</p>
                  <Button size="sm" className="w-full">Add to Cart</Button>
                </div>
                
                <div className="border rounded-lg p-4 space-y-2">
                  <div className="aspect-square bg-muted rounded-md flex items-center justify-center">
                    <span className="text-2xl">🧥</span>
                  </div>
                  <h4 className="font-medium">Modern Blazer</h4>
                  <p className="text-sm text-muted-foreground">Black wool blend, slim fit</p>
                  <p className="text-sm font-medium">$289.99</p>
                  <Button size="sm" className="w-full">Add to Cart</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}

export default withCustomerAuth(AccountPage)

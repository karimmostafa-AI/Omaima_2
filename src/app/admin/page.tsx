"use client"

import { AdminLayout } from "@/components/admin/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingBag, Users, Package, TrendingUp } from "lucide-react"
import { withAdminAuth } from "@/components/auth/auth-wrapper"

function AdminDashboard() {
  const stats = [
    {
      title: "Total Orders",
      value: "156",
      description: "12 new orders today",
      icon: ShoppingBag,
      change: "+12%",
    },
    {
      title: "Active Customers", 
      value: "342",
      description: "23 new customers this week",
      icon: Users,
      change: "+8%",
    },
    {
      title: "Products",
      value: "89",
      description: "5 new products added",
      icon: Package,
      change: "+3%",
    },
    {
      title: "Revenue",
      value: "$12,345",
      description: "This month's earnings",
      icon: TrendingUp,
      change: "+15%",
    },
  ]

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your Omaima store.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
                <div className="text-xs text-green-600 mt-1">
                  {stat.change} from last month
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>
                Your latest customer orders requiring attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">#OM-2024-001</p>
                    <p className="text-sm text-muted-foreground">Sarah Johnson</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">$299.99</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">#OM-2024-002</p>
                    <p className="text-sm text-muted-foreground">Maria Garcia</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">$459.99</p>
                    <p className="text-xs text-muted-foreground">4 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">#OM-2024-003</p>
                    <p className="text-sm text-muted-foreground">Jennifer Chen</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">$329.99</p>
                    <p className="text-xs text-muted-foreground">6 hours ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks to manage your store
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <button className="text-left p-3 rounded-md hover:bg-muted transition-colors">
                  <p className="font-medium">Add New Product</p>
                  <p className="text-sm text-muted-foreground">Create a new product listing</p>
                </button>
                <button className="text-left p-3 rounded-md hover:bg-muted transition-colors">
                  <p className="font-medium">Process Orders</p>
                  <p className="text-sm text-muted-foreground">Review and fulfill pending orders</p>
                </button>
                <button className="text-left p-3 rounded-md hover:bg-muted transition-colors">
                  <p className="font-medium">Update Inventory</p>
                  <p className="text-sm text-muted-foreground">Manage product stock levels</p>
                </button>
                <button className="text-left p-3 rounded-md hover:bg-muted transition-colors">
                  <p className="font-medium">View Analytics</p>
                  <p className="text-sm text-muted-foreground">Check store performance metrics</p>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}

export default withAdminAuth(AdminDashboard)

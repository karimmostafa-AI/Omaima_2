"use client"

import { AdminLayout } from "@/components/layout/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { formatPrice, formatDate, formatRelativeTime } from "@/lib/utils"
import {
  ShoppingBag,
  Users,
  Package,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Eye,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock,
  Star,
} from "lucide-react"
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

// Mock data
const recentOrders = [
  {
    id: 'OM-2024-001',
    customer: 'Sarah Johnson',
    avatar: '/avatars/sarah.jpg',
    amount: 299.99,
    status: 'processing',
    date: '2024-01-15T10:30:00Z',
    items: 2,
  },
  {
    id: 'OM-2024-002',
    customer: 'Maria Garcia',
    avatar: '/avatars/maria.jpg',
    amount: 459.99,
    status: 'shipped',
    date: '2024-01-14T15:45:00Z',
    items: 1,
  },
  {
    id: 'OM-2024-003',
    customer: 'Jennifer Chen',
    avatar: '/avatars/jennifer.jpg',
    amount: 329.99,
    status: 'delivered',
    date: '2024-01-14T09:20:00Z',
    items: 3,
  },
  {
    id: 'OM-2024-004',
    customer: 'Lisa Thompson',
    avatar: '/avatars/lisa.jpg',
    amount: 189.99,
    status: 'cancelled',
    date: '2024-01-13T14:20:00Z',
    items: 1,
  },
]

const topProducts = [
  {
    id: '1',
    name: 'Professional Blazer Set',
    image: '/products/blazer.jpg',
    sold: 156,
    revenue: 31200,
    trend: 'up',
    rating: 4.8,
  },
  {
    id: '2',
    name: 'Executive Pants',
    image: '/products/pants.jpg',
    sold: 89,
    revenue: 17800,
    trend: 'up',
    rating: 4.6,
  },
  {
    id: '3',
    name: 'Business Skirt',
    image: '/products/skirt.jpg',
    sold: 67,
    revenue: 13400,
    trend: 'down',
    rating: 4.3,
  },
  {
    id: '4',
    name: 'Classic Dress',
    image: '/products/dress.jpg',
    sold: 45,
    revenue: 9000,
    trend: 'up',
    rating: 4.7,
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case 'processing':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    case 'shipped':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
    case 'delivered':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    case 'cancelled':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'processing':
      return <Clock className="h-3 w-3" />
    case 'shipped':
      return <AlertCircle className="h-3 w-3" />
    case 'delivered':
      return <CheckCircle className="h-3 w-3" />
    case 'cancelled':
      return <XCircle className="h-3 w-3" />
    default:
      return <AlertCircle className="h-3 w-3" />
  }
}

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          router.push('/auth/direct-login')
          return
        }

        const userRole = session.user?.user_metadata?.role
        if (userRole !== 'ADMIN') {
          router.push('/auth/direct-login')
          return
        }

        setUser(session.user)
      } catch (error) {
        console.error('Auth check error:', error)
        router.push('/auth/direct-login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }
  const stats = [
    {
      title: "Total Revenue",
      value: formatPrice(331000),
      description: "This month's earnings",
      icon: DollarSign,
      change: "+20.1%",
      trend: 'up',
      progress: 75,
    },
    {
      title: "Total Orders",
      value: "1,234",
      description: "12 new orders today",
      icon: ShoppingBag,
      change: "+15.3%",
      trend: 'up',
      progress: 68,
    },
    {
      title: "Products",
      value: "892",
      description: "5 new products added",
      icon: Package,
      change: "-2.4%",
      trend: 'down',
      progress: 45,
    },
    {
      title: "Active Customers", 
      value: "2,350",
      description: "23 new customers this week",
      icon: Users,
      change: "+8.2%",
      trend: 'up',
      progress: 82,
    },
  ]

  return (
    <AdminLayout 
      title="Dashboard" 
      subtitle="Welcome back! Here's what's happening with your Omaima store."
    >
      <div className="space-y-6">

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${
                  stat.trend === 'up' 
                    ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-200' 
                    : 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-200'
                }`}>
                  <stat.icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mb-2">
                  {stat.description}
                </p>
                <div className="flex items-center justify-between mb-2">
                  <div className={`flex items-center text-xs ${
                    stat.trend === 'up' 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {stat.trend === 'up' ? (
                      <TrendingUp className="mr-1 h-3 w-3" />
                    ) : (
                      <TrendingDown className="mr-1 h-3 w-3" />
                    )}
                    {stat.change} from last month
                  </div>
                </div>
                <Progress value={stat.progress} className="h-2" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {/* Recent Orders */}
          <Card className="col-span-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Orders</CardTitle>
                  <CardDescription>
                    Your latest customer orders requiring attention
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={order.avatar} alt={order.customer} />
                        <AvatarFallback>
                          {order.customer.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium leading-none mb-1">
                          {order.customer}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Order #{order.id}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {order.items} item{order.items > 1 ? 's' : ''} • {formatRelativeTime(order.date)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={`mb-2 ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1 capitalize">{order.status}</span>
                      </Badge>
                      <p className="text-sm font-medium">{formatPrice(order.amount)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Top Products</CardTitle>
              <CardDescription>
                Best performing products this month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={product.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        <div className="text-sm font-bold text-muted-foreground w-6">
                          #{index + 1}
                        </div>
                      </div>
                      <Avatar className="h-10 w-10 rounded-md">
                        <AvatarImage src={product.image} alt={product.name} className="object-cover" />
                        <AvatarFallback className="rounded-md">IMG</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium leading-none mb-1 truncate">
                          {product.name}
                        </p>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-muted-foreground">
                            {product.sold} sold
                          </p>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs text-muted-foreground">{product.rating}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 mb-1">
                        {product.trend === 'up' ? (
                          <TrendingUp className="h-3 w-3 text-green-500" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-500" />
                        )}
                      </div>
                      <p className="text-sm font-medium">
                        {formatPrice(product.revenue)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks to manage your Omaima store efficiently
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Button className="h-20 flex-col gap-2 group" size="lg">
                <Package className="h-6 w-6 group-hover:scale-110 transition-transform" />
                <span>Add Product</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2 group" size="lg">
                <Users className="h-6 w-6 group-hover:scale-110 transition-transform" />
                <span>View Customers</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2 group" size="lg">
                <ShoppingBag className="h-6 w-6 group-hover:scale-110 transition-transform" />
                <span>Process Orders</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2 group" size="lg">
                <Eye className="h-6 w-6 group-hover:scale-110 transition-transform" />
                <span>View Reports</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}


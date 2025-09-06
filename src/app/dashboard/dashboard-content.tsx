'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Shirt, ShoppingBag, User, Settings } from 'lucide-react';
import { AuthUser } from '@/lib/auth';

interface DashboardContentProps {
  user: AuthUser;
}

export default function DashboardContent({ user }: DashboardContentProps) {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.firstName}!
          </h1>
          <p className="mt-2 text-gray-600">
            Manage your custom garments and orders from your dashboard.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Custom Garment</CardTitle>
              <Shirt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Start</div>
              <p className="text-xs text-muted-foreground">
                Create your custom professional attire
              </p>
              <Button asChild className="mt-4 w-full">
                <Link href="/customize">Start Customizing</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Orders</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">View</div>
              <p className="text-xs text-muted-foreground">
                Track your current and past orders
              </p>
              <Button asChild variant="outline" className="mt-4 w-full">
                <Link href="/orders">View Orders</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saved Designs</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Browse</div>
              <p className="text-xs text-muted-foreground">
                Access your saved custom designs
              </p>
              <Button asChild variant="outline" className="mt-4 w-full">
                <Link href="/designs">My Designs</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profile</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Manage</div>
              <p className="text-xs text-muted-foreground">
                Update your account settings
              </p>
              <Button asChild variant="outline" className="mt-4 w-full">
                <Link href="/profile">Edit Profile</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>
                Your latest order activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No orders yet
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Start customizing your first garment to place an order.
                </p>
                <div className="mt-6">
                  <Button asChild>
                    <Link href="/customize">Start Customizing</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Saved Designs</CardTitle>
              <CardDescription>
                Your custom design library
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <Shirt className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No saved designs
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Save your custom designs to quickly reorder or modify them later.
                </p>
                <div className="mt-6">
                  <Button asChild variant="outline">
                    <Link href="/customize">Create Design</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
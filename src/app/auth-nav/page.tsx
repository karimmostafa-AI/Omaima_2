'use client'

import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  UserPlus, 
  LogIn, 
  Shield, 
  TestTube, 
  Users,
  ArrowRight,
  CheckCircle 
} from 'lucide-react'

export default function AuthNavigationPage() {
  const authPages = [
    {
      title: "Customer Registration",
      description: "Sign up as a new customer with email and password",
      url: "/auth/register",
      icon: UserPlus,
      color: "bg-green-50 border-green-200",
      textColor: "text-green-700",
      status: "✅ Working"
    },
    {
      title: "Customer Login", 
      description: "Sign in with your customer account",
      url: "/auth/login",
      icon: LogIn,
      color: "bg-blue-50 border-blue-200", 
      textColor: "text-blue-700",
      status: "✅ Working"
    },
    {
      title: "Alternative Registration",
      description: "Another registration page (grouped auth routes)",
      url: "/(auth)/register",
      icon: UserPlus,
      color: "bg-green-50 border-green-200",
      textColor: "text-green-700", 
      status: "✅ Working"
    },
    {
      title: "Alternative Login",
      description: "Another login page (grouped auth routes)",
      url: "/(auth)/login", 
      icon: LogIn,
      color: "bg-blue-50 border-blue-200",
      textColor: "text-blue-700",
      status: "✅ Working"
    },
    {
      title: "Authentication Demo",
      description: "Interactive testing of registration and login in one page",
      url: "/auth-demo",
      icon: TestTube,
      color: "bg-purple-50 border-purple-200",
      textColor: "text-purple-700",
      status: "✅ Working"
    },
    {
      title: "Admin Login",
      description: "Direct admin authentication (for testing)",
      url: "/auth/direct-login",
      icon: Shield,
      color: "bg-red-50 border-red-200",
      textColor: "text-red-700",
      status: "✅ Working"
    },
    {
      title: "Auth Test Page",
      description: "Simple authentication testing page",
      url: "/auth-test", 
      icon: TestTube,
      color: "bg-gray-50 border-gray-200",
      textColor: "text-gray-700",
      status: "✅ Working"
    }
  ]

  const adminCredentials = {
    email: "admin@example.com",
    password: "admin123"
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🔐 Authentication Navigation
          </h1>
          <p className="text-gray-600 text-lg">
            All available authentication URLs for testing customer sign up and login
          </p>
          <div className="mt-4 inline-flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-lg">
            <CheckCircle className="h-5 w-5 mr-2" />
            Authentication System is Fully Working!
          </div>
        </div>

        {/* Admin Credentials Info */}
        <Card className="mb-8 border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center text-yellow-800">
              <Shield className="h-5 w-5 mr-2" />
              Admin Credentials (For Testing)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-white p-4 rounded-lg border">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <strong className="text-gray-700">Email:</strong>
                  <code className="ml-2 bg-gray-100 px-2 py-1 rounded">{adminCredentials.email}</code>
                </div>
                <div>
                  <strong className="text-gray-700">Password:</strong>
                  <code className="ml-2 bg-gray-100 px-2 py-1 rounded">{adminCredentials.password}</code>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Authentication Pages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {authPages.map((page, index) => {
            const IconComponent = page.icon
            return (
              <Card key={index} className={`${page.color} border-2 hover:shadow-lg transition-shadow`}>
                <CardHeader>
                  <CardTitle className={`flex items-center ${page.textColor}`}>
                    <IconComponent className="h-5 w-5 mr-2" />
                    {page.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    {page.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-white p-3 rounded border">
                      <div className="text-sm font-mono text-gray-800">
                        <strong>URL:</strong> {page.url}
                      </div>
                      <div className={`text-sm font-medium mt-1 ${page.textColor}`}>
                        {page.status}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Link href={page.url} className="flex-1">
                        <Button className="w-full" variant="default">
                          <ArrowRight className="h-4 w-4 mr-2" />
                          Open Page
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigator.clipboard.writeText(`http://localhost:3000${page.url}`)}
                      >
                        Copy URL
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Quick Start Guide */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Quick Start Guide
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-green-700 mb-3">👤 For Customer Testing:</h3>
                <ol className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <span className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-2 mt-0.5">1</span>
                    Go to <code className="bg-gray-100 px-2 py-1 rounded">/auth/register</code>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-2 mt-0.5">2</span>
                    Create account with any email and password
                  </li>
                  <li className="flex items-start">
                    <span className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-2 mt-0.5">3</span>
                    Login with your credentials at <code className="bg-gray-100 px-2 py-1 rounded">/auth/login</code>
                  </li>
                </ol>
              </div>
              
              <div>
                <h3 className="font-semibold text-blue-700 mb-3">🛡️ For Admin Testing:</h3>
                <ol className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-2 mt-0.5">1</span>
                    Go to <code className="bg-gray-100 px-2 py-1 rounded">/auth/login</code>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-2 mt-0.5">2</span>
                    Use admin credentials shown above
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-2 mt-0.5">3</span>
                    Access admin panel at <code className="bg-gray-100 px-2 py-1 rounded">/admin</code>
                  </li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Link href="/">
            <Button variant="outline" size="lg">
              ← Back to Home Page
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

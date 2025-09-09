'use client'

import React, { useState, useEffect } from 'react'
import { useAppStore } from '@/store/app'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, User, Mail, Shield } from 'lucide-react'

export default function AuthDemoPage() {
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    authError, 
    login, 
    register, 
    logout 
  } = useAppStore()

  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [registerForm, setRegisterForm] = useState({ email: '', password: '', name: '' })
  const [message, setMessage] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    try {
      await login(loginForm.email, loginForm.password)
      setMessage('Login successful!')
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    try {
      await register(registerForm.email, registerForm.password, registerForm.name)
      setMessage('Registration successful!')
    } catch (error) {
      console.error('Registration failed:', error)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      setMessage('Logged out successfully!')
      setLoginForm({ email: '', password: '' })
      setRegisterForm({ email: '', password: '', name: '' })
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Authentication Demo</h1>
          <p className="text-gray-600 mt-2">Test customer registration and login functionality</p>
        </div>

        {/* Current User Status */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Current User Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className={`w-3 h-3 rounded-full ${isAuthenticated ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className={`font-medium ${isAuthenticated ? 'text-green-700' : 'text-red-700'}`}>
                  {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
                </span>
              </div>
              
              {user && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">User Information:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-500" />
                      <span>Email: {user.email}</span>
                    </div>
                    {user.name && (
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-gray-500" />
                        <span>Name: {user.name}</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 mr-2 text-gray-500" />
                      <span>Role: {user.role}</span>
                    </div>
                  </div>
                </div>
              )}

              {isAuthenticated && (
                <Button 
                  onClick={handleLogout} 
                  variant="destructive"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Logout
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Messages */}
        {message && (
          <Alert className="mb-6">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {authError && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{authError}</AlertDescription>
          </Alert>
        )}

        {/* Authentication Forms */}
        {!isAuthenticated && (
          <Card>
            <CardHeader>
              <CardTitle>Authentication</CardTitle>
              <CardDescription>
                Login with existing account or register as a new customer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="space-y-4">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="Enter your email"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                        disabled={isLoading}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="Enter your password"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                        disabled={isLoading}
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Login
                    </Button>
                  </form>

                  <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
                    <strong>Admin Credentials:</strong><br />
                    Email: admin@example.com<br />
                    Password: admin123
                  </div>
                </TabsContent>

                <TabsContent value="register" className="space-y-4">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-name">Full Name</Label>
                      <Input
                        id="register-name"
                        type="text"
                        placeholder="Enter your full name"
                        value={registerForm.name}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, name: e.target.value }))}
                        disabled={isLoading}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-email">Email</Label>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="Enter your email"
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                        disabled={isLoading}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Password</Label>
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="Enter your password (min 6 characters)"
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                        disabled={isLoading}
                        required
                        minLength={6}
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Register as Customer
                    </Button>
                  </form>

                  <div className="text-sm text-gray-600 bg-green-50 p-3 rounded">
                    <strong>Customer Registration:</strong><br />
                    Create a new customer account with any email and password.
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Success Message for Authenticated Users */}
        {isAuthenticated && (
          <Card>
            <CardHeader>
              <CardTitle className="text-green-700">✅ Authentication Working!</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-700">
                  You are successfully logged in as a <strong>{user?.role?.toLowerCase()}</strong>.
                </p>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">What works:</h4>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>✅ Customer registration with password hashing</li>
                    <li>✅ Customer and admin login</li>
                    <li>✅ Session management with cookies</li>
                    <li>✅ Password validation and security</li>
                    <li>✅ Database storage with Prisma + SQLite</li>
                    <li>✅ Role-based authentication (ADMIN/CUSTOMER)</li>
                  </ul>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Button 
                    onClick={() => window.location.href = user?.role === 'ADMIN' ? '/admin' : '/dashboard'}
                    className="w-full"
                  >
                    Go to {user?.role === 'ADMIN' ? 'Admin Panel' : 'Dashboard'}
                  </Button>
                  <Button 
                    onClick={() => window.location.href = '/products'}
                    variant="outline"
                    className="w-full"
                  >
                    Browse Products
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

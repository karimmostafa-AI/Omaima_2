"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Shield, CheckCircle } from "lucide-react"
import { useRouter } from 'next/navigation'

export default function AdminSetupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()

  const setupAdmin = async () => {
    setIsLoading(true)
    setMessage('')
    
    try {
      const response = await fetch('/api/setup-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@omaima.com',
          password: 'admin123'
        }),
      })

      const data = await response.json()
      
      if (response.ok) {
        setIsSuccess(true)
        setMessage(data.message)
      } else {
        setMessage(data.error || 'Failed to create admin user')
      }
    } catch (error) {
      setMessage('An error occurred while setting up admin user')
    } finally {
      setIsLoading(false)
    }
  }

  const goToLogin = () => {
    router.push('/auth/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Admin Setup
          </CardTitle>
          <CardDescription>
            Create an administrator account for Omaima
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {message && (
            <Alert variant={isSuccess ? "default" : "destructive"}>
              <AlertDescription className="flex items-center gap-2">
                {isSuccess && <CheckCircle className="h-4 w-4" />}
                {message}
              </AlertDescription>
            </Alert>
          )}

          {!isSuccess ? (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground space-y-2">
                <p><strong>Email:</strong> admin@omaima.com</p>
                <p><strong>Password:</strong> admin123</p>
                <p className="text-xs bg-yellow-50 p-2 rounded border">
                  ⚠️ This is a temporary setup. Change the password after first login.
                </p>
              </div>

              <Button 
                onClick={setupAdmin}
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Admin User...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Create Admin User
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                <h3 className="font-medium text-green-700">Admin User Ready!</h3>
                <p className="text-sm text-muted-foreground">
                  You can now log in with the admin credentials
                </p>
              </div>

              <Button 
                onClick={goToLogin}
                className="w-full"
                variant="default"
              >
                Go to Login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
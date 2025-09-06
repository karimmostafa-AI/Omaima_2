'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'

export default function TestAdminPage() {
  const [email, setEmail] = useState('admin@omaima.com')
  const [password, setPassword] = useState('admin123')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const testLogin = async () => {
    setLoading(true)
    setResult('')
    
    try {
      console.log('Testing login with:', { email, password })
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setResult(`❌ Login failed: ${error.message}`)
        console.error('Supabase error:', error)
        return
      }

      if (data.user) {
        setResult(`✅ Login successful! 
User ID: ${data.user.id}
Email: ${data.user.email}
Role: ${data.user.user_metadata?.role || 'No role set'}
Email confirmed: ${data.user.email_confirmed_at ? 'Yes' : 'No'}
Session: ${data.session ? 'Active' : 'None'}`)
        
        console.log('Login success:', data)
        
        // Check if admin role
        if (data.user.user_metadata?.role === 'ADMIN') {
          setTimeout(() => {
            window.location.href = '/admin'
          }, 2000)
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setResult(`❌ Error: ${errorMessage}`)
      console.error('Login error:', err)
    } finally {
      setLoading(false)
    }
  }

  const createUser = async () => {
    setLoading(true)
    setResult('')
    
    try {
      const response = await fetch('/api/setup-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setResult(`✅ User created: ${data.message}`)
      } else {
        setResult(`❌ Creation failed: ${data.error}`)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setResult(`❌ Error: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin Login Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email:</label>
            <Input 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Password:</label>
            <Input 
              type="password"
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={createUser} 
              disabled={loading}
              variant="outline"
              className="flex-1"
            >
              {loading ? 'Creating...' : 'Create User'}
            </Button>
            
            <Button 
              onClick={testLogin} 
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Testing...' : 'Test Login'}
            </Button>
          </div>
          
          {result && (
            <div className="mt-4 p-3 bg-gray-100 rounded-md">
              <pre className="text-xs whitespace-pre-wrap">{result}</pre>
            </div>
          )}
          
          <div className="text-xs text-gray-500 mt-4">
            <p><strong>Instructions:</strong></p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Click "Create User" first</li>
              <li>Click "Test Login" to authenticate</li>
              <li>If successful, you'll be redirected to admin dashboard</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

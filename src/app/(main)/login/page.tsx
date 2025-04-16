'use client'

import { signIn } from 'next-auth/react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, registerSchema, type LoginInput, type RegisterInput } from '@/lib/auth'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')

  const loginForm = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const registerForm = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  })

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true)
      const result = await signIn('google', {
        callbackUrl: '/',
        redirect: false,
      })
      
      if (result?.error) {
        toast.error('Sign in failed')
      } else if (result?.url) {
        router.push(result.url)
      }
    } catch (error) {
      toast.error('Sign in failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailSignIn = async (data: LoginInput) => {
    try {
      setIsLoading(true)
      const result = await signIn('credentials', {
        ...data,
        redirect: false,
      })
  
      if (result?.error) {
        if (result.error === "user-does-not-exist") {
          window.alert("User does not exist")
        } else if (result.error === "credentials-do-not-match") {
          window.alert("Credentials do not match")
        } else {
          window.alert("Invalid credentials")
        }
      } else {
        router.push('/')
      }
    } catch (error) {
      window.alert('Sign in failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (data: RegisterInput) => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        window.alert('Registration successful! Please log in.')
        registerForm.reset()
        setActiveTab('login')
      } else {
        const error = await res.json()
        if (error.error === 'User already exists') {
          window.alert('User already exists. Please sign in instead.')
        } else {
          window.alert(error.message || 'Registration failed')
        }
      }
    } catch (error) {
      window.alert('Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto flex flex-col items-center justify-center min-h-[80vh] gap-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome Back</CardTitle>
          <CardDescription>Sign in to your account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={v => setActiveTab(v as 'login' | 'register')} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={loginForm.handleSubmit(handleEmailSignIn)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    {...loginForm.register('email')}
                    type="email"
                    placeholder="Enter your email"
                  />
                  {loginForm.formState.errors.email && (
                    <p className="text-sm text-red-500">{loginForm.formState.errors.email.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    {...loginForm.register('password')}
                    type="password"
                    placeholder="Enter your password"
                  />
                  {loginForm.formState.errors.password && (
                    <p className="text-sm text-red-500">{loginForm.formState.errors.password.message}</p>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    {...registerForm.register('name')}
                    placeholder="Enter your name"
                  />
                  {registerForm.formState.errors.name && (
                    <p className="text-sm text-red-500">{registerForm.formState.errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    {...registerForm.register('email')}
                    type="email"
                    placeholder="Enter your email"
                  />
                  {registerForm.formState.errors.email && (
                    <p className="text-sm text-red-500">{registerForm.formState.errors.email.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    {...registerForm.register('password')}
                    type="password"
                    placeholder="Create a password"
                  />
                  {registerForm.formState.errors.password && (
                    <p className="text-sm text-red-500">{registerForm.formState.errors.password.message}</p>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Creating account...' : 'Create account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <div className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full flex items-center gap-2"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <Image 
                src="/google.svg" 
                alt="Google logo" 
                width={20} 
                height={20} 
              />
              Sign in with Google
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 
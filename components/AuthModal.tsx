'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { EyeIcon, EyeOffIcon } from 'lucide-react'
import { apiClient } from '@/lib/api/client'

import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'

import LogoSvg from '@/assets/svg/logo'
import AuthBackgroundShape from '@/assets/svg/auth-background-shape'

/* ── Logo Component ──────────────────────────────────────────────── */
const WeMongoliaLogo = ({ className }: { className?: string }) => (
  <div className={`flex items-center gap-2.5 ${className ?? ''}`}>
    <LogoSvg className='size-8' />
    <span className='text-xl font-semibold'>We Mongolia</span>
  </div>
)

/* ── Auth Modal ──────────────────────────────────────────────────── */
interface AuthModalProps {
  defaultTab?: 'login' | 'register'
  trigger?: React.ReactNode
}

export function AuthModal({ defaultTab = 'login', trigger }: AuthModalProps) {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<string>(defaultTab)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant='outline' size='sm'>
            Sign in
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className='sm:max-w-lg p-0 gap-0 overflow-hidden border-0 shadow-xl' style={{ backgroundColor: '#ffffff' }}>
        <div className='relative flex items-center justify-center overflow-hidden px-4 py-8 sm:px-6' style={{ backgroundColor: '#ffffff' }}>
          {/* Background decoration */}
          <div className='pointer-events-none absolute -top-20 -right-24 opacity-60'>
            <AuthBackgroundShape className='w-72 h-72' />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full z-10'>
            <Card className='w-full border-none shadow-none' style={{ backgroundColor: '#ffffff' }}>
              <CardHeader className='gap-5 pb-4'>
                <WeMongoliaLogo />
                <div>
                  <CardTitle className='mb-1 text-2xl'>
                    {activeTab === 'login' ? 'Sign in to We Mongolia' : 'Create an account'}
                  </CardTitle>
                  <CardDescription className='text-base'>
                    {activeTab === 'login'
                      ? 'Discover authentic Mongolian experiences.'
                      : 'Start your journey with We Mongolia.'}
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className='space-y-4'>
                {/* Tab switcher */}
                <TabsList className='w-full rounded-lg h-10 bg-muted'>
                  <TabsTrigger value='login' className='flex-1 rounded-md text-sm font-medium'>
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger value='register' className='flex-1 rounded-md text-sm font-medium'>
                    Register
                  </TabsTrigger>
                </TabsList>

                <TabsContent value='login' className='mt-0 space-y-4'>
                  <LoginPanel
                    onSuccess={() => setOpen(false)}
                    onSwitchToRegister={() => setActiveTab('register')}
                  />
                </TabsContent>

                <TabsContent value='register' className='mt-0 space-y-4'>
                  <RegisterPanel
                    onSuccess={() => setOpen(false)}
                    onSwitchToLogin={() => setActiveTab('login')}
                  />
                </TabsContent>
              </CardContent>
            </Card>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* ─────────────────────────── LOGIN PANEL ─────────────────────────── */
function LoginPanel({
  onSuccess,
  onSwitchToRegister,
}: {
  onSuccess: () => void
  onSwitchToRegister: () => void
}) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isVisible, setIsVisible] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', { email, password, redirect: false })

      if (result?.error) {
        setError('Invalid email or password. Please try again.')
      } else {
        router.refresh()
        onSuccess()
      }
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form className='space-y-4' onSubmit={handleSubmit}>
      {error && (
        <div className='p-3 bg-destructive/10 border border-destructive/20 rounded-lg'>
          <p className='text-sm text-destructive'>{error}</p>
        </div>
      )}

     

      

      {/* Email */}
      <div className='space-y-1'>
        <Label htmlFor='login-email' className='leading-5'>
          Email address*
        </Label>
        <Input
          id='login-email'
          type='email'
          placeholder='Enter your email address'
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      {/* Password */}
      <div className='w-full space-y-1'>
        <Label htmlFor='login-password' className='leading-5'>
          Password*
        </Label>
        <div className='relative'>
          <Input
            id='login-password'
            type={isVisible ? 'text' : 'password'}
            placeholder='••••••••••••••••'
            className='pr-9'
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
          <Button
            type='button'
            variant='ghost'
            size='icon'
            onClick={() => setIsVisible(prev => !prev)}
            className='text-muted-foreground focus-visible:ring-ring/50 absolute inset-y-0 right-0 rounded-l-none hover:bg-transparent'
          >
            {isVisible ? <EyeOffIcon className='w-4 h-4' /> : <EyeIcon className='w-4 h-4' />}
            <span className='sr-only'>{isVisible ? 'Hide password' : 'Show password'}</span>
          </Button>
        </div>
      </div>

      {/* Remember Me & Forgot Password */}
      <div className='flex items-center justify-between gap-y-2'>
        <div className='flex items-center gap-3'>
          <Checkbox
            id='rememberMe'
            className='size-5'
            checked={rememberMe}
            onCheckedChange={v => setRememberMe(!!v)}
          />
          <Label htmlFor='rememberMe' className='text-muted-foreground font-normal cursor-pointer'>
            Remember Me
          </Label>
        </div>
        <Link href='/auth/forgot-password' className='text-sm hover:underline'>
          Forgot Password?
        </Link>
      </div>

      <Button className='w-full' type='submit' disabled={isLoading}>
        {isLoading ? 'Signing in…' : 'Sign in to We Mongolia'}
      </Button>

      <p className='text-muted-foreground text-center text-sm'>
        New on our platform?{' '}
        <button
          type='button'
          onClick={onSwitchToRegister}
          className='text-foreground font-medium hover:underline'
        >
          Create an account
        </button>
      </p>

      <div className='flex items-center gap-4'>
        <Separator className='flex-1' />
        <p className='text-sm text-muted-foreground'>or</p>
        <Separator className='flex-1' />
      </div>

      <Button variant='outline' className='w-full' type='button'>
        Sign in with Google
      </Button>
    </form>
  )
}

/* ────────────────────────── REGISTER PANEL ──────────────────────── */
function RegisterPanel({
  onSuccess,
  onSwitchToLogin,
}: {
  onSuccess: () => void
  onSwitchToLogin: () => void
}) {
  const router = useRouter()
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.')
      setIsLoading(false)
      return
    }

    try {
      const fullName = formData.name.trim().replace(/\s+/g, ' ')
      const [firstName, ...rest] = fullName.split(' ')
      const lastName = rest.join(' ').trim() || 'User'

      await apiClient.post('/auth/register', {
        firstName,
        lastName,
        email: formData.email,
        password: formData.password,
        role: 'traveler',
      })

      // Auto-login after successful registration
      const loginResult = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (loginResult?.error) {
        // Registration OK but auto-login failed — switch to login tab
        setSuccess(true)
        setTimeout(() => {
          setSuccess(false)
          onSwitchToLogin()
        }, 1500)
      } else {
        router.refresh()
        onSuccess()
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form className='space-y-4' onSubmit={handleSubmit}>
      {error && (
        <div className='p-3 bg-destructive/10 border border-destructive/20 rounded-lg'>
          <p className='text-sm text-destructive'>{error}</p>
        </div>
      )}
      {success && (
        <div className='p-3 bg-green-50 border border-green-200 rounded-lg'>
          <p className='text-sm text-green-700'>Account created! Switching to sign in…</p>
        </div>
      )}

      {/* Full Name */}
      <div className='space-y-1'>
        <Label htmlFor='reg-name' className='leading-5'>Full Name*</Label>
        <Input
          id='reg-name'
          name='name'
          type='text'
          placeholder='Enter your full name'
          value={formData.name}
          onChange={handleChange}
          required
          disabled={isLoading}
        />
      </div>

      {/* Email */}
      <div className='space-y-1'>
        <Label htmlFor='reg-email' className='leading-5'>Email address*</Label>
        <Input
          id='reg-email'
          name='email'
          type='email'
          placeholder='Enter your email address'
          value={formData.email}
          onChange={handleChange}
          required
          disabled={isLoading}
        />
      </div>

      {/* Password */}
      <div className='w-full space-y-1'>
        <Label htmlFor='reg-password' className='leading-5'>Password*</Label>
        <div className='relative'>
          <Input
            id='reg-password'
            name='password'
            type={showPassword ? 'text' : 'password'}
            placeholder='••••••••••••••••'
            className='pr-9'
            value={formData.password}
            onChange={handleChange}
            required
            disabled={isLoading}
            minLength={8}
          />
          <Button
            type='button'
            variant='ghost'
            size='icon'
            onClick={() => setShowPassword(prev => !prev)}
            className='text-muted-foreground absolute inset-y-0 right-0 rounded-l-none hover:bg-transparent'
          >
            {showPassword ? <EyeOffIcon className='w-4 h-4' /> : <EyeIcon className='w-4 h-4' />}
            <span className='sr-only'>{showPassword ? 'Hide password' : 'Show password'}</span>
          </Button>
        </div>
      </div>

      {/* Confirm Password */}
      <div className='w-full space-y-1'>
        <Label htmlFor='reg-confirm' className='leading-5'>Confirm Password*</Label>
        <div className='relative'>
          <Input
            id='reg-confirm'
            name='confirmPassword'
            type={showConfirm ? 'text' : 'password'}
            placeholder='••••••••••••••••'
            className='pr-9'
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            disabled={isLoading}
            minLength={8}
          />
          <Button
            type='button'
            variant='ghost'
            size='icon'
            onClick={() => setShowConfirm(prev => !prev)}
            className='text-muted-foreground absolute inset-y-0 right-0 rounded-l-none hover:bg-transparent'
          >
            {showConfirm ? <EyeOffIcon className='w-4 h-4' /> : <EyeIcon className='w-4 h-4' />}
            <span className='sr-only'>{showConfirm ? 'Hide password' : 'Show password'}</span>
          </Button>
        </div>
      </div>

      <Button className='w-full' type='submit' disabled={isLoading}>
        {isLoading ? 'Creating account…' : 'Create Account'}
      </Button>

      <p className='text-muted-foreground text-center text-sm'>
        Already have an account?{' '}
        <button
          type='button'
          onClick={onSwitchToLogin}
          className='text-foreground font-medium hover:underline'
        >
          Sign in
        </button>
      </p>

      <p className='text-center text-xs text-muted-foreground'>
        By registering you agree to our{' '}
        <a href='#' className='hover:underline'>Terms of Service</a>
        {' '}and{' '}
        <a href='#' className='hover:underline'>Privacy Policy</a>.
      </p>
    </form>
  )
}

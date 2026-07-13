import { zodResolver } from '@hookform/resolvers/zod'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { loginSchema, type LoginValues } from '@/features/auth/auth-schema'
import { useLogin } from '@/features/auth/use-login'
import { hasSupabaseEnv } from '@/supabase/client'

export function LoginForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useLogin()
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const redirectPath = (location.state as { from?: string } | null)?.from ?? '/trips'

  async function onSubmit(values: LoginValues) {
    try {
      await login.mutateAsync(values)
      toast.success('Welcome back to Voyage Hub.')
      navigate(redirectPath)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to sign in right now.'
      toast.error(message)
    }
  }

  return (
    <Card className="glass-panel">
      <CardContent className="p-8">
        <div className="mb-8 space-y-2">
          <p className="text-sm uppercase tracking-[0.3em] text-primary">Sign in</p>
          <h1 className="font-serif text-4xl">Travel plans, all in one place</h1>
          <p className="text-sm text-muted-foreground">
            Secure access for trips, itinerary planning, documents, and budgets.
          </p>
        </div>

        {!hasSupabaseEnv && (
          <div className="mb-6 flex gap-3 rounded-2xl border border-accent/30 bg-accent/10 p-4 text-sm">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-accent" />
            <p>
              Add your Supabase URL and anon key to enable authentication. The
              UI is ready, but sign-in will stay disabled until then.
            </p>
          </div>
        )}

        <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="you@example.com"
              {...form.register('email')}
            />
            <FieldError message={form.formState.errors.email?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              {...form.register('password')}
            />
            <FieldError message={form.formState.errors.password?.message} />
          </div>

          <Button
            className="w-full"
            type="submit"
            disabled={login.isPending || !hasSupabaseEnv}
          >
            {login.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Signing in
              </>
            ) : (
              'Sign in securely'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null
  }

  return <p className="text-sm text-destructive">{message}</p>
}

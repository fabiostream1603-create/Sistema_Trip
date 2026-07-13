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
import { useSignUp } from '@/features/auth/use-sign-up'
import { hasSupabaseEnv } from '@/supabase/client'

export function LoginForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useLogin()
  const signUp = useSignUp()
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
      toast.success('Bem-vindo de volta ao Voyage Hub.')
      navigate(redirectPath)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Nao foi possivel entrar agora.'
      toast.error(message)
    }
  }

  async function onCreateAccount() {
    const isValid = await form.trigger()

    if (!isValid) {
      return
    }

    try {
      const values = form.getValues()
      const data = await signUp.mutateAsync(values)

      if (data.session) {
        toast.success('Conta criada com sucesso. Voce ja entrou no app.')
        navigate('/trips')
        return
      }

      toast.success('Conta criada. Confira seu e-mail para confirmar o acesso.')
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Nao foi possivel criar sua conta agora.'
      toast.error(message)
    }
  }

  return (
    <Card className="glass-panel">
      <CardContent className="p-8">
        <div className="mb-8 space-y-2">
          <p className="text-sm uppercase tracking-[0.3em] text-primary">Entrar</p>
          <h1 className="font-serif text-4xl">Sua viagem inteira em um so lugar</h1>
          <p className="text-sm text-muted-foreground">
            Acesse viagens, roteiro, documentos e gastos com seguranca.
          </p>
        </div>

        {!hasSupabaseEnv && (
          <div className="mb-6 flex gap-3 rounded-2xl border border-accent/30 bg-accent/10 p-4 text-sm">
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-accent" />
              <p>
              Adicione a URL e a chave anonima do Supabase para habilitar a
              autenticacao. A interface ja esta pronta, mas o login fica
              desabilitado ate isso ser configurado.
              </p>
            </div>
        )}

        <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="voce@exemplo.com"
              {...form.register('email')}
            />
            <FieldError message={form.formState.errors.email?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="Digite sua senha"
              {...form.register('password')}
            />
            <FieldError message={form.formState.errors.password?.message} />
          </div>

          <Button
            className="w-full"
            type="submit"
            disabled={login.isPending || signUp.isPending || !hasSupabaseEnv}
          >
            {login.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Entrando
              </>
            ) : (
              'Entrar com seguranca'
            )}
          </Button>

          <Button
            className="w-full"
            type="button"
            variant="outline"
            onClick={onCreateAccount}
            disabled={login.isPending || signUp.isPending || !hasSupabaseEnv}
          >
            {signUp.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Criando conta
              </>
            ) : (
              'Criar conta'
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

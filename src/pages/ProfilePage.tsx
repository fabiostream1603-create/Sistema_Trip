import { zodResolver } from '@hookform/resolvers/zod'
import { useTheme } from 'next-themes'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/features/auth/AuthProvider'
import {
  profileSettingsSchema,
  type ProfileSettingsInputValues,
  type ProfileSettingsValues,
} from '@/features/settings/profile-schema'
import { useProfileSettings } from '@/features/settings/use-profile-settings'
import { useUpdateProfileSettings } from '@/features/settings/use-update-profile-settings'
import { hasSupabaseEnv } from '@/supabase/client'

export function ProfilePage() {
  const { setTheme } = useTheme()
  const { session } = useAuth()
  const userId = session?.user.id ?? ''
  const profileQuery = useProfileSettings(userId)
  const updateProfileMutation = useUpdateProfileSettings(userId)

  const form = useForm<ProfileSettingsInputValues, undefined, ProfileSettingsValues>({
    resolver: zodResolver(profileSettingsSchema),
    defaultValues: {
      avatar_url: '',
      full_name: '',
      locale: 'pt-BR',
      preferred_currency: 'EUR',
      preferred_navigation_app: 'google_maps',
      theme: 'system',
      timezone: 'America/Sao_Paulo',
    },
  })

  useEffect(() => {
    if (!profileQuery.data) {
      return
    }

    form.reset({
      avatar_url: profileQuery.data.avatar_url ?? '',
      full_name: profileQuery.data.full_name ?? '',
      locale: profileQuery.data.locale,
      preferred_currency: profileQuery.data.preferred_currency,
      preferred_navigation_app: profileQuery.data.preferred_navigation_app,
      theme: profileQuery.data.theme,
      timezone: profileQuery.data.timezone,
    })
  }, [form, profileQuery.data])

  async function onSubmit(values: ProfileSettingsValues) {
    await updateProfileMutation.mutateAsync({
      avatar_url: values.avatar_url || null,
      full_name: values.full_name,
      locale: values.locale,
      preferred_currency: values.preferred_currency,
      preferred_navigation_app: values.preferred_navigation_app,
      theme: values.theme,
      timezone: values.timezone,
    })

    setTheme(values.theme)
    toast.success('Perfil salvo com sucesso.')
  }

  if (!hasSupabaseEnv) {
    return <StateCard title="Conexao com Supabase obrigatoria" body="Configure as variaveis do ambiente e rode as migrations antes de editar seu perfil." />
  }

  if (profileQuery.isLoading) {
    return <div className="h-80 animate-pulse rounded-[2rem] border bg-muted/50" />
  }

  if (profileQuery.isError || !profileQuery.data) {
    return (
      <StateCard
        title="Nao foi possivel carregar seu perfil"
        body={
          profileQuery.error instanceof Error
            ? profileQuery.error.message
            : 'Os dados do perfil nao puderam ser carregados.'
        }
      />
    )
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border bg-[linear-gradient(145deg,rgba(18,92,86,0.97),rgba(23,54,77,0.94),rgba(227,132,93,0.78))] px-6 py-8 text-white shadow-[var(--shadow-card)]">
        <p className="text-sm uppercase tracking-[0.35em] text-white/75">Perfil</p>
        <h1 className="mt-4 max-w-2xl font-serif text-4xl leading-tight">
          Suas preferencias pessoais de tema, moeda, idioma e navegacao
        </h1>
        <p className="mt-3 text-sm text-white/80">
          Logado como {session?.user.email ?? 'usuario atual'}.
        </p>
      </section>

      <Card>
        <CardContent className="space-y-6 p-6">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-primary">Preferencias</p>
            <h2 className="mt-2 font-serif text-3xl">Configuracao padrao de viagem</h2>
          </div>

          <form className="grid gap-5 md:grid-cols-2" onSubmit={form.handleSubmit(onSubmit)}>
            <Field>
              <Label htmlFor="full_name">Nome de exibicao</Label>
              <Input id="full_name" {...form.register('full_name')} />
              <ErrorText message={form.formState.errors.full_name?.message} />
            </Field>

            <Field>
              <Label htmlFor="avatar_url">URL do avatar</Label>
              <Input id="avatar_url" placeholder="https://exemplo.com/avatar.jpg" {...form.register('avatar_url')} />
              <ErrorText message={form.formState.errors.avatar_url?.message} />
            </Field>

            <Field>
              <Label htmlFor="preferred_currency">Moeda preferida</Label>
              <select
                className="h-12 rounded-2xl border border-border bg-background px-4 text-sm outline-none"
                id="preferred_currency"
                {...form.register('preferred_currency')}
              >
                <option value="EUR">EUR</option>
                <option value="BRL">BRL</option>
              </select>
            </Field>

            <Field>
              <Label htmlFor="preferred_navigation_app">App de navegacao</Label>
              <select
                className="h-12 rounded-2xl border border-border bg-background px-4 text-sm outline-none"
                id="preferred_navigation_app"
                {...form.register('preferred_navigation_app')}
              >
                <option value="google_maps">Google Maps</option>
                <option value="apple_maps">Apple Maps</option>
                <option value="waze">Waze</option>
              </select>
            </Field>

            <Field>
              <Label htmlFor="locale">Idioma e regiao</Label>
              <Input id="locale" {...form.register('locale')} />
              <ErrorText message={form.formState.errors.locale?.message} />
            </Field>

            <Field>
              <Label htmlFor="timezone">Fuso horario</Label>
              <Input id="timezone" {...form.register('timezone')} />
              <ErrorText message={form.formState.errors.timezone?.message} />
            </Field>

            <Field>
              <Label htmlFor="theme">Tema</Label>
              <select
                className="h-12 rounded-2xl border border-border bg-background px-4 text-sm outline-none"
                id="theme"
                {...form.register('theme')}
              >
                <option value="system">Sistema</option>
                <option value="light">Claro</option>
                <option value="dark">Escuro</option>
              </select>
            </Field>

            <div className="md:col-span-2 flex justify-end">
              <Button disabled={updateProfileMutation.isPending} type="submit">
                Salvar perfil
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

function Field({ children }: { children: React.ReactNode }) {
  return <div className="space-y-2">{children}</div>
}

function ErrorText({ message }: { message?: string }) {
  return message ? <p className="text-sm text-destructive">{message}</p> : null
}

function StateCard({ body, title }: { body: string; title: string }) {
  return (
    <Card>
      <CardContent className="space-y-3 p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-primary">Perfil</p>
        <h1 className="font-serif text-4xl">{title}</h1>
        <p className="max-w-2xl text-muted-foreground">{body}</p>
      </CardContent>
    </Card>
  )
}

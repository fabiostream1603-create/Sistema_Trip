import { zodResolver } from '@hookform/resolvers/zod'
import { Pencil, Trash2, UserRoundPlus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  travelerFormSchema,
  type TravelerFormInputValues,
  type TravelerFormValues,
} from '@/features/travelers/traveler-schema'
import { useCreateTraveler } from '@/features/travelers/use-create-traveler'
import { useDeleteTraveler } from '@/features/travelers/use-delete-traveler'
import { useTripTravelers } from '@/features/travelers/use-trip-travelers'
import { useUpdateTraveler } from '@/features/travelers/use-update-traveler'
import { hasSupabaseEnv } from '@/supabase/client'
import type { TravelerRecord } from '@/types/travelers'

export function TripTravelersPage() {
  const { tripId = '' } = useParams()
  const travelersQuery = useTripTravelers(tripId)
  const createTravelerMutation = useCreateTraveler(tripId)
  const updateTravelerMutation = useUpdateTraveler(tripId)
  const deleteTravelerMutation = useDeleteTraveler(tripId)
  const [editingTraveler, setEditingTraveler] = useState<TravelerRecord | null>(null)

  const form = useForm<TravelerFormInputValues, undefined, TravelerFormValues>({
    resolver: zodResolver(travelerFormSchema),
    defaultValues: {
      avatar_url: '',
      color_identifier: 'mediterranean-blue',
      email: '',
      linked_user_id: '',
      name: '',
    },
  })

  useEffect(() => {
    form.reset({
      avatar_url: editingTraveler?.avatar_url ?? '',
      color_identifier: editingTraveler?.color_identifier ?? 'mediterranean-blue',
      email: editingTraveler?.email ?? '',
      linked_user_id: editingTraveler?.linked_user_id ?? '',
      name: editingTraveler?.name ?? '',
    })
  }, [editingTraveler, form])

  async function onSubmit(values: TravelerFormValues) {
    const payload = {
      avatar_url: values.avatar_url,
      color_identifier: values.color_identifier,
      email: values.email,
      linked_user_id: values.linked_user_id || null,
      name: values.name,
      trip_id: tripId,
    }

    if (editingTraveler) {
      await updateTravelerMutation.mutateAsync({ ...payload, id: editingTraveler.id })
      toast.success('Viajante atualizado.')
    } else {
      await createTravelerMutation.mutateAsync(payload)
      toast.success('Viajante adicionado.')
    }

    setEditingTraveler(null)
    form.reset({
      avatar_url: '',
      color_identifier: 'mediterranean-blue',
      email: '',
      linked_user_id: '',
      name: '',
    })
  }

  async function handleDelete(travelerId: string) {
    await deleteTravelerMutation.mutateAsync(travelerId)
    if (editingTraveler?.id === travelerId) {
      setEditingTraveler(null)
    }
    toast.success('Viajante removido.')
  }

  if (!hasSupabaseEnv) {
    return <StateCard title="Conexao com Supabase obrigatoria" body="Configure as variaveis do ambiente e rode as migrations antes de usar os viajantes." />
  }

  if (travelersQuery.isLoading) {
    return <div className="h-80 animate-pulse rounded-[2rem] border bg-muted/50" />
  }

  if (travelersQuery.isError || !travelersQuery.data) {
    return (
      <StateCard
        title="Nao foi possivel carregar os viajantes"
        body={
          travelersQuery.error instanceof Error
            ? travelersQuery.error.message
            : 'Os dados de viajantes nao puderam ser carregados.'
        }
      />
    )
  }

  const { members, travelers } = travelersQuery.data

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border bg-[linear-gradient(145deg,rgba(16,98,90,0.96),rgba(17,46,74,0.95),rgba(231,136,99,0.8))] px-6 py-8 text-white shadow-[var(--shadow-card)]">
        <p className="text-sm uppercase tracking-[0.35em] text-white/75">Viajantes</p>
        <h1 className="mt-4 max-w-2xl font-serif text-4xl leading-tight">
          Gerencie os viajantes reais usados em gastos, checklists e planejamento compartilhado
        </h1>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Perfis de viajantes" value={String(travelers.length)} />
        <MetricCard label="Membros aceitos" value={String(members.filter((member) => member.invitation_status === 'accepted').length)} />
        <MetricCard label="Contas vinculadas" value={String(travelers.filter((traveler) => traveler.linked_user_id).length)} />
      </section>

      <Card>
        <CardContent className="space-y-6 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-2 text-primary">
              <UserRoundPlus className="size-5" />
            </div>
            <div>
              <h2 className="font-serif text-2xl">
                {editingTraveler ? 'Editar viajante' : 'Adicionar viajante'}
              </h2>
              <p className="text-sm text-muted-foreground">
                Os viajantes sao usados nos gastos, na atribuicao de checklists e nos documentos.
              </p>
            </div>
          </div>

          <form className="grid gap-5 md:grid-cols-2" onSubmit={form.handleSubmit(onSubmit)}>
            <Field>
              <Label htmlFor="name">Nome</Label>
              <Input id="name" {...form.register('name')} />
              <ErrorText message={form.formState.errors.name?.message} />
            </Field>

            <Field>
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" {...form.register('email')} />
              <ErrorText message={form.formState.errors.email?.message} />
            </Field>

            <Field>
              <Label htmlFor="linked_user_id">Membro vinculado</Label>
              <select
                className="h-12 rounded-2xl border border-border bg-background px-4 text-sm outline-none"
                id="linked_user_id"
                {...form.register('linked_user_id')}
              >
                <option value="">Nenhum membro vinculado</option>
                {members.map((member) => (
                  <option key={member.user_id} value={member.user_id}>
                    {(member.full_name ?? member.user_id.slice(0, 8))} ({member.role})
                  </option>
                ))}
              </select>
            </Field>

            <Field>
              <Label htmlFor="color_identifier">Identificador de cor</Label>
              <Input id="color_identifier" {...form.register('color_identifier')} />
              <ErrorText message={form.formState.errors.color_identifier?.message} />
            </Field>

            <div className="md:col-span-2">
              <Field>
                <Label htmlFor="avatar_url">URL do avatar</Label>
                <Input id="avatar_url" placeholder="https://exemplo.com/avatar.jpg" {...form.register('avatar_url')} />
                <ErrorText message={form.formState.errors.avatar_url?.message} />
              </Field>
            </div>

            <div className="md:col-span-2 flex justify-end gap-3">
              {editingTraveler ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingTraveler(null)}
                >
                  Cancelar
                </Button>
              ) : null}
              <Button
                disabled={createTravelerMutation.isPending || updateTravelerMutation.isPending}
                type="submit"
              >
                {editingTraveler ? 'Salvar alteracoes' : 'Adicionar viajante'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-6">
          <div>
            <h2 className="font-serif text-2xl">Lista de viajantes</h2>
            <p className="text-sm text-muted-foreground">
              Esses registros alimentam divisao de gastos, saldos e identificacao dentro do app.
            </p>
          </div>

          {travelers.length > 0 ? (
            <div className="space-y-3">
              {travelers.map((traveler) => (
                <div
                  key={traveler.id}
                  className="flex flex-col gap-4 rounded-[1.5rem] border px-4 py-4 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{traveler.name}</p>
                      <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                        {traveler.color_identifier}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {traveler.email ?? 'Sem e-mail vinculado'}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {traveler.linked_user_id
                        ? `Vinculado ao membro ${traveler.linked_user_id.slice(0, 8)}`
                        : 'Viajante independente'}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => setEditingTraveler(traveler)}>
                      <Pencil className="size-4" />
                      Editar
                    </Button>
                    <Button type="button" variant="outline" onClick={() => handleDelete(traveler.id)}>
                      <Trash2 className="size-4" />
                      Excluir
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-[1.5rem] border border-dashed px-5 py-8 text-sm text-muted-foreground">
              Nenhum viajante cadastrado ainda. Adicione o primeiro para dividir gastos e organizar a preparacao da viagem.
            </div>
          )}
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

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="space-y-2 p-6">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-serif text-3xl">{value}</p>
      </CardContent>
    </Card>
  )
}

function StateCard({ body, title }: { body: string; title: string }) {
  return (
    <Card>
      <CardContent className="space-y-3 p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-primary">Viajantes</p>
        <h1 className="font-serif text-4xl">{title}</h1>
        <p className="max-w-2xl text-muted-foreground">{body}</p>
      </CardContent>
    </Card>
  )
}

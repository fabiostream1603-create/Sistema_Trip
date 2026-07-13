import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { Upload } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useAuth } from '@/features/auth/AuthProvider'
import {
  documentFormSchema,
  type DocumentFormInputValues,
  type DocumentFormValues,
} from '@/features/documents/document-schema'
import { useUploadDocument } from '@/features/documents/use-upload-document'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getTripExpensesData } from '@/services/expenses/expenses-service'

export function DocumentUploader({ tripId }: { tripId: string }) {
  const { session } = useAuth()
  const uploadDocument = useUploadDocument(tripId)
  const [file, setFile] = useState<File | null>(null)
  const [progress, setProgress] = useState<number>(0)
  const supportQuery = useQuery({
    queryKey: ['trip-document-support', tripId],
    queryFn: () => getTripExpensesData(tripId),
  })

  const form = useForm<DocumentFormInputValues, undefined, DocumentFormValues>({
    resolver: zodResolver(documentFormSchema),
    defaultValues: {
      category: 'other',
      description: '',
      expiration_date: '',
      is_favorite: false,
      issue_date: '',
      offline_priority: false,
      title: '',
      traveler_id: '',
    },
  })

  async function onSubmit(values: DocumentFormValues) {
    if (!file || !session?.user.id) {
      toast.error('Choose a file before uploading.')
      return
    }

    await uploadDocument.mutateAsync({
      ...values,
      file,
      trip_id: tripId,
      uploaded_by: session.user.id,
      onProgress: setProgress,
      traveler_id: values.traveler_id || undefined,
    })

    toast.success('Document uploaded securely.')
    setFile(null)
    setProgress(0)
    form.reset()
  }

  return (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit(onSubmit)}>
      <Field>
        <Label htmlFor="title">Title</Label>
        <Input id="title" {...form.register('title')} />
        <ErrorText message={form.formState.errors.title?.message} />
      </Field>

      <Field>
        <Label htmlFor="category">Category</Label>
        <select
          className="h-12 rounded-2xl border border-border bg-background px-4 text-sm outline-none"
          id="category"
          {...form.register('category')}
        >
          <option value="passport">Passport</option>
          <option value="ticket">Ticket</option>
          <option value="booking">Booking</option>
          <option value="insurance">Insurance</option>
          <option value="receipt">Receipt</option>
          <option value="identity">Identity</option>
          <option value="health">Health</option>
          <option value="other">Other</option>
        </select>
      </Field>

      <Field>
        <Label htmlFor="traveler_id">Traveler</Label>
        <select
          className="h-12 rounded-2xl border border-border bg-background px-4 text-sm outline-none"
          id="traveler_id"
          {...form.register('traveler_id')}
        >
          <option value="">No traveler link</option>
          {(supportQuery.data?.travelers ?? []).map((traveler) => (
            <option key={traveler.id} value={traveler.id}>
              {traveler.name}
            </option>
          ))}
        </select>
      </Field>

      <Field>
        <Label htmlFor="file">File</Label>
        <Input
          id="file"
          type="file"
          accept="application/pdf,image/jpeg,image/png,image/webp"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        />
      </Field>

      <Field>
        <Label htmlFor="issue_date">Issue date</Label>
        <Input id="issue_date" type="date" {...form.register('issue_date')} />
      </Field>

      <Field>
        <Label htmlFor="expiration_date">Expiration date</Label>
        <Input id="expiration_date" type="date" {...form.register('expiration_date')} />
      </Field>

      <div className="md:col-span-2 space-y-2">
        <Label htmlFor="description">Description</Label>
        <textarea
          className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none"
          id="description"
          {...form.register('description')}
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" {...form.register('is_favorite')} />
        Favorite
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" {...form.register('offline_priority')} />
        Prepare for offline access later
      </label>

      <div className="md:col-span-2">
        <div className="mb-3 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <Button disabled={uploadDocument.isPending} type="submit">
          <Upload className="size-4" />
          Upload document
        </Button>
      </div>
    </form>
  )
}

function Field({ children }: { children: React.ReactNode }) {
  return <div className="space-y-2">{children}</div>
}

function ErrorText({ message }: { message?: string }) {
  return message ? <p className="text-sm text-destructive">{message}</p> : null
}

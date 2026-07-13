import { FileText, ShieldCheck, Star, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { DocumentUploader } from '@/components/documents/DocumentUploader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useDeleteDocument } from '@/features/documents/use-delete-document'
import { useTripDocuments } from '@/features/documents/use-trip-documents'
import { isImageMimeType, isPdfMimeType } from '@/lib/documents/files'
import { hasSupabaseEnv } from '@/supabase/client'
import { useParams } from 'react-router-dom'

export function TripDocumentsPage() {
  const { tripId = '' } = useParams()
  const documentsQuery = useTripDocuments(tripId)
  const deleteDocumentMutation = useDeleteDocument(tripId)

  async function handleDelete(documentId: string) {
    const document = documentsQuery.data?.find((entry) => entry.id === documentId)
    if (!document) {
      return
    }

    await deleteDocumentMutation.mutateAsync(document)
    toast.success('Document removed.')
  }

  if (!hasSupabaseEnv) {
    return <StateCard title="Supabase connection required" body="Configure the env values and run the migrations before using documents." />
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border bg-[linear-gradient(140deg,rgba(15,118,110,0.95),rgba(23,60,83,0.92),rgba(240,139,111,0.78))] px-6 py-8 text-white shadow-[var(--shadow-card)]">
        <p className="text-sm uppercase tracking-[0.35em] text-white/75">Documents</p>
        <h1 className="mt-4 max-w-2xl font-serif text-4xl leading-tight">
          Private travel documents with temporary access links
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-white/80">
          Files stay in a private Supabase bucket and are exposed only through short-lived signed URLs.
        </p>
      </section>

      <Card>
        <CardContent className="space-y-5 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-2 text-primary">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <h2 className="font-serif text-2xl">Upload securely</h2>
              <p className="text-sm text-muted-foreground">
                Accepted types: PDF, JPEG, PNG, WebP. Max 10MB.
              </p>
            </div>
          </div>
          <DocumentUploader tripId={tripId} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-2 text-primary">
              <FileText className="size-5" />
            </div>
            <div>
              <h2 className="font-serif text-2xl">Document vault</h2>
              <p className="text-sm text-muted-foreground">
                Temporary previews and downloads for trip members only.
              </p>
            </div>
          </div>

          {documentsQuery.isLoading ? (
            <div className="h-56 animate-pulse rounded-[2rem] border bg-muted/50" />
          ) : documentsQuery.isError ? (
            <p className="text-sm text-muted-foreground">
              {documentsQuery.error instanceof Error
                ? documentsQuery.error.message
                : 'Unable to load documents.'}
            </p>
          ) : documentsQuery.data && documentsQuery.data.length > 0 ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {documentsQuery.data.map((document) => (
                <div
                  key={document.id}
                  className="rounded-[1.5rem] border bg-background p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{document.title}</p>
                        {document.is_favorite ? (
                          <Star className="size-4 fill-current text-accent" />
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {document.category} • {document.traveler_name ?? 'No traveler'}
                      </p>
                    </div>
                    <Button
                      size="icon"
                      type="button"
                      variant="ghost"
                      onClick={() => handleDelete(document.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>

                  {document.description ? (
                    <p className="mt-3 text-sm text-muted-foreground">
                      {document.description}
                    </p>
                  ) : null}

                  <div className="mt-4 overflow-hidden rounded-2xl border bg-muted/40">
                    {document.signed_url && isImageMimeType(document.mime_type) ? (
                      <img
                        alt={document.title}
                        className="h-56 w-full object-cover"
                        src={document.signed_url}
                      />
                    ) : document.signed_url && isPdfMimeType(document.mime_type) ? (
                      <iframe
                        className="h-72 w-full"
                        src={document.signed_url}
                        title={document.title}
                      />
                    ) : (
                      <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
                        Preview unavailable
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {document.signed_url ? (
                      <>
                        <Button asChild size="sm" variant="outline">
                          <a href={document.signed_url} rel="noreferrer" target="_blank">
                            Open temporary link
                          </a>
                        </Button>
                        <Button asChild size="sm">
                          <a
                            href={document.signed_url}
                            download={document.original_filename}
                            rel="noreferrer"
                            target="_blank"
                          >
                            Download
                          </a>
                        </Button>
                      </>
                    ) : null}
                    {document.offline_priority ? (
                      <div className="rounded-full bg-secondary px-3 py-2 text-xs font-medium text-secondary-foreground">
                        Offline priority
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function StateCard({ body, title }: { body: string; title: string }) {
  return (
    <Card>
      <CardContent className="space-y-3 p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-primary">Documents</p>
        <h1 className="font-serif text-4xl">{title}</h1>
        <p className="max-w-2xl text-muted-foreground">{body}</p>
      </CardContent>
    </Card>
  )
}

import { env } from '@/lib/env'
import { DOCUMENT_BUCKET } from '@/lib/documents/config'
import { sanitizeFilename, validateDocumentFile } from '@/lib/documents/files'
import { supabase } from '@/supabase/client'
import type { CreateDocumentInput, TripDocument } from '@/types/documents'

function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase credentials are missing.')
  }

  return supabase
}

export async function listTripDocuments(tripId: string): Promise<TripDocument[]> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('documents')
    .select('*, travelers(name)')
    .eq('trip_id', tripId)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  const documents = (data ?? []).map((document) => ({
    ...(document as TripDocument),
    traveler_name: (document.travelers as { name: string } | null)?.name ?? null,
  }))

  const signedDocuments = await Promise.all(
    documents.map(async (document) => ({
      ...document,
      signed_url: await createTemporaryDocumentUrl(document.storage_path),
    })),
  )

  return signedDocuments
}

export async function createTemporaryDocumentUrl(storagePath: string) {
  const client = requireSupabase()
  const { data, error } = await client.storage
    .from(DOCUMENT_BUCKET)
    .createSignedUrl(storagePath, 60 * 15)

  if (error) {
    throw error
  }

  return data.signedUrl
}

export async function deleteDocument(document: TripDocument) {
  const client = requireSupabase()

  const { error: storageError } = await client.storage
    .from(DOCUMENT_BUCKET)
    .remove([document.storage_path])

  if (storageError) {
    throw storageError
  }

  const { error: metadataError } = await client
    .from('documents')
    .delete()
    .eq('id', document.id)

  if (metadataError) {
    throw metadataError
  }
}

export async function uploadTripDocument(
  input: CreateDocumentInput,
  onProgress?: (value: number) => void,
) {
  const client = requireSupabase()
  validateDocumentFile(input.file)

  const safeFilename = sanitizeFilename(input.file.name)

  const { data: documentRow, error: insertError } = await client
    .from('documents')
    .insert({
      trip_id: input.trip_id,
      uploaded_by: input.uploaded_by,
      traveler_id: input.traveler_id ?? null,
      category: input.category,
      title: input.title,
      description: input.description,
      storage_path: `${input.trip_id}/pending/${safeFilename}`,
      original_filename: input.file.name,
      mime_type: input.file.type,
      file_size: input.file.size,
      issue_date: input.issue_date || null,
      expiration_date: input.expiration_date || null,
      is_favorite: input.is_favorite,
      offline_priority: input.offline_priority,
    })
    .select('*')
    .single()

  if (insertError) {
    throw insertError
  }

  const finalStoragePath = `${input.trip_id}/${documentRow.id}/${safeFilename}`

  await uploadWithProgress(finalStoragePath, input.file, onProgress)

  const { data: updatedDocument, error: updateError } = await client
    .from('documents')
    .update({ storage_path: finalStoragePath })
    .eq('id', documentRow.id)
    .select('*')
    .single()

  if (updateError) {
    throw updateError
  }

  return updatedDocument as TripDocument
}

async function uploadWithProgress(
  storagePath: string,
  file: File,
  onProgress?: (value: number) => void,
) {
  const client = requireSupabase()
  const sessionResult = await client.auth.getSession()
  const accessToken = sessionResult.data.session?.access_token

  if (!accessToken) {
    throw new Error('No authenticated session available for document upload.')
  }

  await new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest()
    request.open(
      'POST',
      `${env.VITE_SUPABASE_URL}/storage/v1/object/${DOCUMENT_BUCKET}/${storagePath}`,
    )
    request.setRequestHeader('Authorization', `Bearer ${accessToken}`)
    request.setRequestHeader('x-upsert', 'true')
    request.setRequestHeader('Content-Type', file.type)

    request.upload.onprogress = (event) => {
      if (!event.lengthComputable || !onProgress) {
        return
      }

      onProgress(Math.round((event.loaded / event.total) * 100))
    }

    request.onload = () => {
      if (request.status >= 200 && request.status < 300) {
        onProgress?.(100)
        resolve()
        return
      }

      reject(new Error('Unable to upload the document to private storage.'))
    }

    request.onerror = () => {
      reject(new Error('Document upload failed.'))
    }

    request.send(file)
  })
}

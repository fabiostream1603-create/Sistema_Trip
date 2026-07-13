export type DocumentCategory =
  | 'passport'
  | 'ticket'
  | 'booking'
  | 'insurance'
  | 'receipt'
  | 'identity'
  | 'health'
  | 'other'

export type TripDocument = {
  id: string
  trip_id: string
  uploaded_by: string
  traveler_id: string | null
  itinerary_item_id: string | null
  category: DocumentCategory
  title: string
  description: string | null
  storage_path: string
  original_filename: string
  mime_type: string
  file_size: number
  issue_date: string | null
  expiration_date: string | null
  is_favorite: boolean
  offline_priority: boolean
  created_at: string
  updated_at: string
  signed_url?: string | null
  traveler_name?: string | null
}

export type CreateDocumentInput = {
  category: DocumentCategory
  description?: string
  expiration_date?: string
  file: File
  is_favorite: boolean
  issue_date?: string
  offline_priority: boolean
  title: string
  traveler_id?: string
  trip_id: string
  uploaded_by: string
}

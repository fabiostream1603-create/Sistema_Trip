export type Checklist = {
  id: string
  trip_id: string
  title: string
  category: 'packing' | 'documents' | 'health' | 'shopping' | 'general'
  traveler_id: string | null
  position: number
  created_at: string
  traveler_name?: string | null
}

export type ChecklistItem = {
  id: string
  checklist_id: string
  title: string
  description: string | null
  is_completed: boolean
  completed_by: string | null
  completed_at: string | null
  priority: 'low' | 'medium' | 'high'
  quantity: number
  position: number
}

export type ChecklistWithItems = {
  checklist: Checklist
  items: ChecklistItem[]
  progress: number
}

import { supabase } from '@/supabase/client'
import type { Checklist, ChecklistItem, ChecklistWithItems } from '@/types/checklists'

function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase credentials are missing.')
  }

  return supabase
}

export async function getTripChecklists(tripId: string): Promise<ChecklistWithItems[]> {
  const client = requireSupabase()
  const { data: checklists, error: checklistsError } = await client
    .from('checklists')
    .select('*, travelers(name)')
    .eq('trip_id', tripId)
    .order('position', { ascending: true })

  if (checklistsError) {
    throw checklistsError
  }

  const checklistIds = (checklists ?? []).map((checklist) => checklist.id)

  const { data: items, error: itemsError } = await client
    .from('checklist_items')
    .select('*')
    .in('checklist_id', checklistIds.length > 0 ? checklistIds : ['00000000-0000-0000-0000-000000000000'])
    .order('position', { ascending: true })

  if (itemsError) {
    throw itemsError
  }

  const itemsByChecklist = new Map<string, ChecklistItem[]>()
  for (const item of items ?? []) {
    const list = itemsByChecklist.get(item.checklist_id) ?? []
    list.push(item as ChecklistItem)
    itemsByChecklist.set(item.checklist_id, list)
  }

  return (checklists ?? []).map((checklist) => {
    const checklistItems = itemsByChecklist.get(checklist.id) ?? []
    const completedCount = checklistItems.filter((item) => item.is_completed).length
    const progress =
      checklistItems.length > 0
        ? Math.round((completedCount / checklistItems.length) * 100)
        : 0

    return {
      checklist: {
        ...(checklist as Checklist),
        traveler_name: (checklist.travelers as { name: string } | null)?.name ?? null,
      },
      items: checklistItems,
      progress,
    }
  })
}

export async function toggleChecklistItem({
  checklistItemId,
  completedBy,
  isCompleted,
}: {
  checklistItemId: string
  completedBy: string
  isCompleted: boolean
}) {
  const client = requireSupabase()
  const { error } = await client
    .from('checklist_items')
    .update({
      is_completed: isCompleted,
      completed_at: isCompleted ? new Date().toISOString() : null,
      completed_by: isCompleted ? completedBy : null,
    })
    .eq('id', checklistItemId)

  if (error) {
    throw error
  }
}

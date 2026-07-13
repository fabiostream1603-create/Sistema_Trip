import { toggleChecklistItem } from '@/services/checklists/checklists-service'
import { createExpense } from '@/services/expenses/expenses-service'
import type { CreateExpenseInput } from '@/types/expenses'

const STORAGE_KEY = 'voyage-hub-offline-mutation-queue'
const EVENT_NAME = 'voyage-hub-offline-mutation-queue:changed'

export type OfflineMutation =
  | {
      id: string
      createdAt: string
      payload: {
        checklistItemId: string
        completedBy: string
        isCompleted: boolean
      }
      type: 'checklist.toggle'
    }
  | {
      id: string
      createdAt: string
      payload: CreateExpenseInput
      type: 'expense.create'
    }

type OfflineMutationInput =
  | {
      payload: {
        checklistItemId: string
        completedBy: string
        isCompleted: boolean
      }
      type: 'checklist.toggle'
    }
  | {
      payload: CreateExpenseInput
      type: 'expense.create'
    }

function isBrowser() {
  return typeof window !== 'undefined'
}

function readQueue(): OfflineMutation[] {
  if (!isBrowser()) {
    return []
  }

  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return []
  }

  try {
    return JSON.parse(raw) as OfflineMutation[]
  } catch {
    return []
  }
}

function writeQueue(queue: OfflineMutation[]) {
  if (!isBrowser()) {
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(queue))
  window.dispatchEvent(new Event(EVENT_NAME))
}

export function getOfflineMutationQueueCount() {
  return readQueue().length
}

export function subscribeToOfflineMutationQueue(listener: () => void) {
  if (!isBrowser()) {
    return () => undefined
  }

  window.addEventListener(EVENT_NAME, listener)
  return () => window.removeEventListener(EVENT_NAME, listener)
}

export function enqueueOfflineMutation(
  input: OfflineMutationInput,
) {
  const id =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`
  const createdAt = new Date().toISOString()
  const mutation: OfflineMutation =
    input.type === 'checklist.toggle'
      ? {
          createdAt,
          id,
          payload: input.payload,
          type: 'checklist.toggle',
        }
      : {
          createdAt,
          id,
          payload: input.payload,
          type: 'expense.create',
        }

  writeQueue([...readQueue(), mutation])
  return mutation
}

export function shouldQueueOfflineMutation(error: unknown) {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return true
  }

  if (!(error instanceof Error)) {
    return false
  }

  const message = error.message.toLowerCase()
  return (
    message.includes('failed to fetch') ||
    message.includes('networkerror') ||
    message.includes('load failed') ||
    message.includes('fetch')
  )
}

export async function runOrQueueOfflineMutation<T>({
  execute,
  mutation,
}: {
  execute: () => Promise<T>
  mutation: OfflineMutationInput
}): Promise<{ data?: T; queued: boolean }> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    enqueueOfflineMutation(mutation)
    return { queued: true }
  }

  try {
    const data = await execute()
    return { data, queued: false }
  } catch (error) {
    if (shouldQueueOfflineMutation(error)) {
      enqueueOfflineMutation(mutation)
      return { queued: true }
    }

    throw error
  }
}

let isProcessing = false

export async function processOfflineMutationQueue() {
  if (isProcessing || (typeof navigator !== 'undefined' && !navigator.onLine)) {
    return [] as OfflineMutation[]
  }

  isProcessing = true

  try {
    const queue = readQueue()
    const processed: OfflineMutation[] = []

    for (const mutation of queue) {
      try {
        await executeOfflineMutation(mutation)
        processed.push(mutation)
      } catch (error) {
        if (shouldQueueOfflineMutation(error)) {
          break
        }

        throw error
      }
    }

    if (processed.length > 0) {
      const processedIds = new Set(processed.map((mutation) => mutation.id))
      writeQueue(queue.filter((mutation) => !processedIds.has(mutation.id)))
    }

    return processed
  } finally {
    isProcessing = false
  }
}

async function executeOfflineMutation(mutation: OfflineMutation) {
  switch (mutation.type) {
    case 'checklist.toggle': {
      return toggleChecklistItem(mutation.payload)
    }
    case 'expense.create': {
      return createExpense(mutation.payload)
    }
    default:
      return undefined
  }
}

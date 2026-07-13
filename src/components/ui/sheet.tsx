import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export {
  Root as Sheet,
  Trigger as SheetTrigger,
  Close as SheetClose,
} from '@radix-ui/react-dialog'

export const SheetPortal = Dialog.Portal

export function SheetOverlay({
  className,
  ...props
}: Dialog.DialogOverlayProps) {
  return (
    <Dialog.Overlay
      className={cn('fixed inset-0 z-50 bg-black/40 backdrop-blur-sm', className)}
      {...props}
    />
  )
}

export function SheetContent({
  className,
  children,
  side = 'bottom',
  ...props
}: Dialog.DialogContentProps & { side?: 'bottom' | 'right'; children: ReactNode }) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <Dialog.Content
        className={cn(
          'fixed z-50 border bg-card p-6 shadow-[var(--shadow-card)] focus:outline-none',
          side === 'bottom'
            ? 'inset-x-0 bottom-0 rounded-t-[2rem]'
            : 'right-0 top-0 h-full w-full max-w-md rounded-l-[2rem]',
          className,
        )}
        {...props}
      >
        {children}
        <Dialog.Close className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground transition hover:bg-muted">
          <X className="size-4" />
        </Dialog.Close>
      </Dialog.Content>
    </SheetPortal>
  )
}

export const SheetTitle = Dialog.Title
export const SheetDescription = Dialog.Description

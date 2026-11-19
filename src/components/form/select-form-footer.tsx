import { PlusCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'

import type { SelectFormFooterProps } from '@/types/components/select'

export function SelectFormFooter({ href, onAdd, onClose, label }: SelectFormFooterProps) {
  const content = (
    <>
      <PlusCircle className="size-3.5" />
      <span className="truncate">{label}</span>
    </>
  )
  const classes = 'text-primary hover:text-primary hover:bg-muted/70 w-full cursor-pointer justify-start gap-2 text-xs font-medium'
  return (
    <div className="border-border bg-card/95 sticky bottom-0 z-10 shrink-0 border-t p-1.5 shadow-xs backdrop-blur-xs">
      {href ? (
        <Button variant="ghost" className={classes} asChild>
          <Link href={href} onClick={onClose}>
            {content}
          </Link>
        </Button>
      ) : (
        <Button
          type="button"
          variant="ghost"
          className={classes}
          onClick={() => {
            onClose()
            onAdd?.()
          }}
        >
          {content}
        </Button>
      )}
    </div>
  )
}

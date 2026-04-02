import { Minus, Plus, ShoppingBag } from 'lucide-react'
import { toast } from 'sonner'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import {
  addToCart,
  guestCartAdd,
  guestCartRemove,
  guestCartSetQuantity,
  removeCartItem,
  updateCartItem,
} from '../features/cart/cartSlice'
import type { GuestCartSnapshot } from '../types'

export interface CartQuantityStepperProps {
  productId: string
  quantity: number
  maxStock: number
  layout?: 'card' | 'inline'
  disabled?: boolean
  /** Required for guest first add / from product pages. */
  guestSnapshot?: GuestCartSnapshot
}

export default function CartQuantityStepper({
  productId,
  quantity,
  maxStock,
  layout = 'card',
  disabled = false,
  guestSnapshot,
}: CartQuantityStepperProps) {
  const dispatch = useAppDispatch()
  const isAuthed = useAppSelector((s) => !!s.auth.token)
  const mutationBusy = useAppSelector((s) => s.cart.mutationStatus === 'loading')
  const d = disabled || (isAuthed && mutationBusy)

  const stop = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const onDec = (e: React.MouseEvent) => {
    stop(e)
    if (d || quantity <= 0) return
    if (isAuthed) {
      if (quantity <= 1) void dispatch(removeCartItem(productId))
      else void dispatch(updateCartItem({ productId, quantity: quantity - 1 }))
    } else {
      if (quantity <= 1) dispatch(guestCartRemove(productId))
      else dispatch(guestCartSetQuantity({ productId, quantity: quantity - 1 }))
    }
  }

  const onInc = (e: React.MouseEvent) => {
    stop(e)
    if (d) return
    if (quantity >= maxStock) return
    if (isAuthed) {
      if (quantity === 0) {
        void (async () => {
          try {
            await dispatch(addToCart({ productId, quantity: 1 })).unwrap()
            toast.success('Added to cart')
          } catch (err) {
            toast.error(String(err))
          }
        })()
      } else void dispatch(updateCartItem({ productId, quantity: quantity + 1 }))
    } else {
      if (!guestSnapshot) return
      if (quantity === 0) {
        dispatch(guestCartAdd({ productId, quantity: 1, snapshot: guestSnapshot }))
        toast.success('Added to cart')
      } else dispatch(guestCartSetQuantity({ productId, quantity: quantity + 1 }))
    }
  }

  const onAdd = (e: React.MouseEvent) => {
    stop(e)
    if (d || maxStock <= 0) return
    if (isAuthed) {
      void (async () => {
        try {
          await dispatch(addToCart({ productId, quantity: 1 })).unwrap()
          toast.success('Added to cart')
        } catch (err) {
          toast.error(String(err))
        }
      })()
    } else if (guestSnapshot) {
      dispatch(guestCartAdd({ productId, quantity: 1, snapshot: guestSnapshot }))
      toast.success('Added to cart')
    }
  }

  const baseBtn =
    'flex h-full min-h-[2.75rem] flex-1 items-center justify-center text-white transition hover:bg-primary-dark disabled:opacity-40 disabled:hover:bg-transparent'
  const iconPad = 'min-w-[2.75rem] flex-none'

  if (quantity <= 0) {
    return (
      <button
        type="button"
        onClick={onAdd}
        disabled={d || maxStock <= 0 || (!isAuthed && !guestSnapshot)}
        className={
          layout === 'card'
            ? 'inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50'
            : 'inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50'
        }
      >
        <ShoppingBag className="h-4 w-4 shrink-0" aria-hidden />
        {maxStock <= 0 ? 'Out of stock' : 'Add to cart'}
      </button>
    )
  }

  return (
    <div
      role="group"
      aria-label="Quantity in cart"
      onClick={stop}
      className={
        layout === 'card'
          ? 'flex h-12 w-full overflow-hidden rounded-xl bg-primary text-white shadow-sm'
          : 'flex h-10 min-w-[9rem] overflow-hidden rounded-xl bg-primary text-white shadow-sm'
      }
    >
      <button
        type="button"
        onClick={onDec}
        disabled={d}
        className={`${baseBtn} ${iconPad} border-r border-white/20`}
        aria-label="Decrease quantity"
      >
        <Minus className="h-5 w-5" strokeWidth={2.5} />
      </button>
      <span className="flex min-w-[2rem] flex-1 items-center justify-center text-base font-bold tabular-nums">
        {quantity}
      </span>
      <button
        type="button"
        onClick={onInc}
        disabled={d || quantity >= maxStock}
        className={`${baseBtn} ${iconPad} border-l border-white/20`}
        aria-label="Increase quantity"
      >
        <Plus className="h-5 w-5" strokeWidth={2.5} />
      </button>
    </div>
  )
}

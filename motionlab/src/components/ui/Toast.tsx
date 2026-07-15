import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'
import { registerGlobalToast } from '@/lib/globalToast'
import { cn } from '@/lib/utils'

type ToastVariant = 'success' | 'warning' | 'error'
interface ToastItem { id: number; message: string; variant: ToastVariant }

interface ToastContextValue {
  showToast: (message: string, variant?: ToastVariant) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const VARIANT_STYLE: Record<ToastVariant, { icon: typeof CheckCircle2; color: string; border: string }> = {
  success: { icon: CheckCircle2, color: '#8a9c4a', border: 'rgba(96,108,56,0.4)' },
  warning: { icon: AlertTriangle, color: '#F5C542', border: 'rgba(245,197,66,0.4)' },
  error: { icon: XCircle, color: '#FF6B6B', border: 'rgba(255,107,107,0.4)' },
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const showToast = useCallback((message: string, variant: ToastVariant = 'error') => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, variant }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }, [])

  useEffect(() => {
    registerGlobalToast(showToast)
  }, [showToast])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pb-safe">
        {toasts.map(t => {
          const { icon: Icon, color, border } = VARIANT_STYLE[t.variant]
          return (
            <div
              key={t.id}
              className={cn('flex items-center gap-2.5 px-4 py-3 rounded-[10px] text-sm font-medium text-white/85 shadow-lg max-w-sm animate-in fade-in slide-in-from-bottom-2')}
              style={{ background: '#0D1420', border: `1px solid ${border}` }}
            >
              <Icon size={16} style={{ color }} className="shrink-0" />
              {t.message}
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

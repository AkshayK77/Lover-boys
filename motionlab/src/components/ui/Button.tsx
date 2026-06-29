import { cn } from '@/lib/utils'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  fullWidth?: boolean
  children: ReactNode
}

const variants: Record<Variant, string> = {
  primary: 'bg-[#264653] text-white hover:bg-[#1D3557] active:scale-[0.98]',
  secondary: 'bg-[#606C38] text-white hover:bg-[#4a5229] active:scale-[0.98]',
  outline: 'border border-[#264653] text-[#264653] hover:bg-[#264653] hover:text-white active:scale-[0.98]',
  ghost: 'text-[#264653] hover:bg-[#F3F4F6] active:scale-[0.98]',
  danger: 'bg-[#6D071A] text-white hover:bg-[#5a0616] active:scale-[0.98]',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm rounded-[8px]',
  md: 'h-11 px-6 text-sm rounded-[8px] min-h-[44px]',
  lg: 'h-13 px-8 text-base rounded-[8px] min-h-[44px]',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-medium transition-all duration-150 cursor-pointer select-none',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
        'focus-visible:outline-2 focus-visible:outline-[#4A6FA5] focus-visible:outline-offset-2',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {children}
        </span>
      ) : children}
    </button>
  )
}

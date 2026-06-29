import { cn } from '@/lib/utils'
import type { InputHTMLAttributes, ReactNode } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

export function Input({ label, error, hint, leftIcon, rightIcon, className, id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-[#1F2937]">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]">{leftIcon}</span>
        )}
        <input
          id={inputId}
          className={cn(
            'w-full h-11 min-h-[44px] rounded-[8px] border border-[#E5E7EB] bg-white px-3 text-sm text-[#1F2937]',
            'placeholder:text-[#9CA3AF]',
            'focus:outline-none focus:border-[#4A6FA5] focus:ring-2 focus:ring-[#4A6FA5]/20',
            'disabled:opacity-50 disabled:bg-[#F3F4F6] disabled:cursor-not-allowed',
            'transition-colors duration-150',
            error && 'border-[#6D071A] focus:border-[#6D071A] focus:ring-[#6D071A]/20',
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            className,
          )}
          {...props}
        />
        {rightIcon && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280]">{rightIcon}</span>
        )}
      </div>
      {error && <p className="text-xs text-[#6D071A]">{error}</p>}
      {hint && !error && <p className="text-xs text-[#6B7280]">{hint}</p>}
    </div>
  )
}

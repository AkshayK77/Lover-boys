import { cn } from '@/lib/utils'
import type { HTMLAttributes, ReactNode } from 'react'

type BadgeVariant = 'green' | 'navy' | 'olive' | 'slate' | 'maroon' | 'gray'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  children: ReactNode
}

const variants: Record<BadgeVariant, string> = {
  green: 'bg-[#264653]/10 text-[#264653]',
  navy: 'bg-[#1D3557]/10 text-[#1D3557]',
  olive: 'bg-[#606C38]/10 text-[#606C38]',
  slate: 'bg-[#4A6FA5]/10 text-[#4A6FA5]',
  maroon: 'bg-[#6D071A]/10 text-[#6D071A]',
  gray: 'bg-[#E5E7EB] text-[#6B7280]',
}

export function Badge({ variant = 'gray', className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium',
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}

import { cn } from '@/lib/utils'
import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  glass?: boolean
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const paddings = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

export function Card({ children, glass, hover, padding = 'md', className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-[10px] border border-[#E5E7EB]',
        glass
          ? 'bg-white/70 backdrop-blur-md shadow-[0_0_24px_rgba(0,0,0,0.06)]'
          : 'bg-white shadow-[0_0_24px_rgba(0,0,0,0.06)]',
        hover && 'cursor-pointer hover:shadow-[0_4px_24px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 transition-all duration-200',
        paddings[padding],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

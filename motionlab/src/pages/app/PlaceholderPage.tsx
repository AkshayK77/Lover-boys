import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Link } from 'react-router-dom'
import { Construction } from 'lucide-react'

interface PlaceholderPageProps {
  title: string
  description: string
  phase: 2 | 3
  cta?: { label: string; to: string }
}

export function PlaceholderPage({ title, description, phase, cta }: PlaceholderPageProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <Card padding="lg" className="max-w-md w-full">
        <div className="w-14 h-14 rounded-full bg-[#264653]/8 flex items-center justify-center mx-auto mb-4">
          <Construction size={24} className="text-[#264653]" />
        </div>
        <Badge variant="navy" className="mb-3">Phase {phase}</Badge>
        <h1 className="text-2xl font-bold text-[#1D3557] mb-2">{title}</h1>
        <p className="text-sm text-[#6B7280] leading-relaxed mb-6">{description}</p>
        {cta && (
          <Link to={cta.to}>
            <Button variant="outline" fullWidth>{cta.label}</Button>
          </Link>
        )}
        {!cta && (
          <Link to="/dashboard">
            <Button variant="outline" fullWidth>← Back to Dashboard</Button>
          </Link>
        )}
      </Card>
    </div>
  )
}

import { useState, useEffect, useRef } from 'react'
import { MapPin, Search, Navigation, Phone, Clock, Star } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Skeleton'
import { NodeLine, PillTag, FuturisticCard } from '@/components/ui/FuturisticElements'

const MOCK_GYMS = [
  { id: '1', name: 'Gold\'s Gym Indiranagar', address: '100 Feet Rd, Indiranagar, Bangalore', distance: '0.8 km', rating: 4.3, hours: '6am–11pm', phone: '+91 80 4567 8901', type: 'Premium Gym' },
  { id: '2', name: 'Fitness First Koramangala', address: '5th Block, Koramangala, Bangalore', distance: '1.4 km', rating: 4.1, hours: '5:30am–11pm', phone: '+91 80 2345 6789', type: 'Fitness Club' },
  { id: '3', name: 'Cult.fit HSR Layout', address: 'Sector 1, HSR Layout, Bangalore', distance: '2.1 km', rating: 4.5, hours: '6am–10pm', phone: '+91 80 3456 7890', type: 'Group Fitness' },
  { id: '4', name: 'Anytime Fitness BTM', address: 'BTM 2nd Stage, Bangalore', distance: '2.8 km', rating: 4.0, hours: '24 hours', phone: '+91 80 5678 9012', type: 'Gym Chain' },
]

export default function GymFinderPage() {
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [gyms] = useState(MOCK_GYMS)
  const [selectedGym, setSelectedGym] = useState<string | null>(null)
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  const filtered = gyms.filter(g =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.address.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div style={{ background: '#080C14', minHeight: '100vh' }}>
      {/* Header */}
      <section className="relative overflow-hidden pt-16 pb-10 lg:pt-20">
        <div className="absolute inset-0 grid-overlay pointer-events-none" />
        <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <MapPin size={20} className="text-[#8a9c4a]" />
            <PillTag>Gym Finder</PillTag>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-2">
            Find gyms <span className="text-gradient-olive">near you</span>
          </h1>
          <p className="text-white/40 text-sm">Locate gyms, fitness centres, and sports facilities close to your location.</p>
        </div>
        <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <NodeLine />
        </div>
      </section>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Left: search + list */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search gyms or area..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                leftIcon={<Search size={15} className="text-white/40" />}
                className="flex-1 bg-[#0D1420]/80 border-[#606C38]/20 text-white placeholder-white/20"
              />
              <Button variant="secondary" className="shrink-0 border-[#606C38]/20 text-white/50"
                style={{ background: 'rgba(13,20,32,0.8)', border: '1px solid rgba(96,108,56,0.2)' }}>
                <Navigation size={15} />
              </Button>
            </div>

            <p className="font-mono text-[10px] text-white/25 uppercase tracking-wider">
              {filtered.length} gyms found near you
            </p>

            <div className="flex flex-col gap-3 max-h-[calc(100svh-320px)] overflow-y-auto pb-safe">
              {loading ? (
                [1, 2, 3].map(i => <Skeleton key={i} className="h-28 rounded-[10px]" />)
              ) : filtered.map(gym => (
                <div
                  key={gym.id}
                  onClick={() => setSelectedGym(s => s === gym.id ? null : gym.id)}
                  className={`cursor-pointer rounded-xl border p-4 transition-all duration-150 ${
                    selectedGym === gym.id
                      ? 'border-[#606C38]/50 bg-[#606C38]/8'
                      : 'border-[#606C38]/12 bg-[#0D1420]/60 hover:border-[#606C38]/25'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-white/85 text-sm leading-snug flex-1">{gym.name}</h3>
                    <span className="font-mono text-[9px] text-[#8a9c4a] ml-2 shrink-0 mt-0.5">{gym.distance}</span>
                  </div>
                  <div className="flex items-center gap-1 mb-1.5">
                    <Star size={10} className="fill-[#606C38] text-[#606C38]" />
                    <span className="text-xs text-white/60">{gym.rating}</span>
                    <span className="text-xs text-white/25 ml-1">· {gym.type}</span>
                  </div>
                  <p className="text-xs text-white/35 mb-1.5 flex items-center gap-1">
                    <MapPin size={10} className="shrink-0 text-[#606C38]/60" /> {gym.address}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-white/25">
                    <span className="flex items-center gap-1"><Clock size={10} /> {gym.hours}</span>
                    <span className="flex items-center gap-1"><Phone size={10} /> {gym.phone}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: map placeholder */}
          <div className="lg:col-span-3">
            <div
              ref={mapRef}
              className="w-full h-[380px] lg:h-[calc(100svh-240px)] rounded-xl overflow-hidden relative"
              style={{ border: '1px solid rgba(96,108,56,0.2)', background: '#0D1420' }}
            >
              {loading ? (
                <Skeleton className="w-full h-full rounded-xl" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-5 relative">
                  {/* Grid overlay */}
                  <div className="absolute inset-0 grid-overlay-fine opacity-60 pointer-events-none" />
                  {/* Corner brackets */}
                  <span className="absolute top-3 left-3 w-6 h-6 border-t border-l border-[#606C38]/30" />
                  <span className="absolute bottom-3 right-3 w-6 h-6 border-b border-r border-[#606C38]/30" />

                  <div className="relative z-10 text-center">
                    <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                      style={{ border: '1px solid rgba(96,108,56,0.3)', background: 'rgba(96,108,56,0.08)' }}>
                      <MapPin size={28} className="text-[#8a9c4a]" />
                    </div>
                    <p className="font-bold text-white/80 mb-1">Interactive Map</p>
                    <p className="text-sm text-white/35 max-w-xs text-center leading-relaxed">
                      Leaflet + OpenStreetMap integration live in the deployed build. Enable location access to see gyms near you.
                    </p>
                  </div>

                  <Button size="sm" className="relative z-10 text-white/60 hover:text-white"
                    style={{ border: '1px solid rgba(96,108,56,0.25)', background: 'rgba(96,108,56,0.08)' }}>
                    <Navigation size={14} className="mr-1.5 text-[#8a9c4a]" /> Use My Location
                  </Button>

                  {/* Dot grid accent */}
                  <div className="absolute inset-0 dot-grid pointer-events-none opacity-30" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

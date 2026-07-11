import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, ChevronLeft, Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { upsertProfile } from '@/lib/profiles'
import { calcNutrition } from '@/lib/workoutPlan'
import type { Profile } from '@/types'

const TOTAL_STEPS = 6
const STEP_LABELS = ['Profile', 'Goals', 'Equipment', 'Sports', 'Nutrition', 'Your Plan']

const EQUIPMENT_OPTIONS = [
  'Barbell', 'Dumbbells', 'Kettlebell', 'Pull-up bar', 'Resistance bands',
  'Cable machine', 'Bench', 'Smith machine', 'Leg press', 'Full gym access',
  'Bodyweight only', 'Home gym',
]

const SPORTS_OPTIONS = [
  { slug: 'table_tennis', name: 'Table Tennis', emoji: '🏓' },
  { slug: 'football', name: 'Football', emoji: '⚽' },
  { slug: 'basketball', name: 'Basketball', emoji: '🏀' },
  { slug: 'badminton', name: 'Badminton', emoji: '🏸' },
  { slug: 'running', name: 'Running', emoji: '🏃' },
  { slug: 'tennis', name: 'Tennis', emoji: '🎾' },
  { slug: 'cycling', name: 'Cycling', emoji: '🚴' },
  { slug: 'swimming', name: 'Swimming', emoji: '🏊' },
  { slug: 'none', name: 'None / Gym only', emoji: '💪' },
]

function DarkInput({ label, hint, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-white/60">{label}</label>
      <input
        {...props}
        className="w-full h-11 px-3 rounded-[8px] text-sm text-white placeholder-white/20 focus:outline-none transition-colors"
        style={{ background: 'rgba(8,12,20,0.8)', border: '1px solid rgba(96,108,56,0.2)' }}
        onFocus={e => (e.currentTarget.style.borderColor = 'rgba(96,108,56,0.5)')}
        onBlur={e => (e.currentTarget.style.borderColor = 'rgba(96,108,56,0.2)')}
      />
      {hint && <p className="text-xs text-white/25">{hint}</p>}
    </div>
  )
}

function ToggleChip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-150 min-h-[44px] border',
        selected
          ? 'text-white border-[#606C38]'
          : 'text-white/40 border-[#606C38]/15 hover:border-[#606C38]/35 hover:text-white/60',
      )}
      style={selected ? { background: '#606C38' } : {}}
    >
      {label}
    </button>
  )
}

function SelectCard({ label, description, selected, onClick }: { label: string; description?: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full flex items-start gap-3 p-4 rounded-[10px] border text-left transition-all duration-150 min-h-[44px]',
        selected
          ? 'border-[#606C38]/60'
          : 'border-[#606C38]/10 hover:border-[#606C38]/25',
      )}
      style={selected ? { background: 'rgba(96,108,56,0.08)' } : { background: 'rgba(8,12,20,0.5)' }}
    >
      <div className={cn(
        'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all',
        selected ? 'border-[#606C38]' : 'border-white/15',
      )}
        style={selected ? { background: '#606C38' } : {}}>
        {selected && <Check size={11} className="text-white" />}
      </div>
      <div>
        <p className={cn('text-sm font-medium', selected ? 'text-[#8a9c4a]' : 'text-white/70')}>{label}</p>
        {description && <p className="text-xs text-white/35 mt-0.5">{description}</p>}
      </div>
    </button>
  )
}

export default function OnboardingPage() {
  const { user, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)

  const [data, setData] = useState<Partial<Profile>>({
    sports: [],
    equipment: [],
    learning_goals: [],
    sport_frequency: {},
  })

  useEffect(() => {
    const saved = localStorage.getItem('ml_onboarding')
    if (saved) {
      const parsed = JSON.parse(saved) as { step: number; data: Partial<Profile> }
      setStep(parsed.step)
      setData(parsed.data)
    }
  }, [])

  async function saveStep(nextStep: number) {
    if (!user) return
    setSaving(true)
    try {
      await upsertProfile(user.id, data)
      localStorage.setItem('ml_onboarding', JSON.stringify({ step: nextStep, data }))
    } finally {
      setSaving(false)
    }
  }

  async function goNext() {
    const next = step + 1
    await saveStep(next)
    setStep(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function goBack() {
    const prev = step - 1
    setStep(prev)
    localStorage.setItem('ml_onboarding', JSON.stringify({ step: prev, data }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function finish() {
    if (!user) return
    setGenerating(true)
    try {
      // Auto-fill blank macro targets via Mifflin-St Jeor (never overwrite
      // a value the user typed).
      const macroFill: Partial<Profile> = {}
      const nut = calcNutrition({ ...data } as Profile)
      if (!data.calorie_target && nut.calories) macroFill.calorie_target = nut.calories
      if (!data.protein_target && nut.protein) macroFill.protein_target = nut.protein

      await upsertProfile(user.id, { ...data, ...macroFill, onboarding_complete: true })
      await new Promise(r => setTimeout(r, 2000))
      localStorage.removeItem('ml_onboarding')
      await refreshProfile()
      navigate('/dashboard', { replace: true })
    } finally {
      setGenerating(false)
    }
  }

  function toggle<T>(arr: T[], val: T): T[] {
    return arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]
  }

  function setField<K extends keyof Profile>(key: K, val: Profile[K]) {
    setData(d => ({ ...d, [key]: val }))
  }

  const pct = Math.round((step / TOTAL_STEPS) * 100)

  return (
    <div className="min-h-screen flex flex-col items-center justify-start py-8 px-4" style={{ background: '#080C14' }}>
      {/* Grid overlay */}
      <div className="fixed inset-0 grid-overlay pointer-events-none opacity-50" />

      <div className="relative w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-[8px] flex items-center justify-center font-black text-sm text-white"
            style={{ background: 'linear-gradient(135deg, #264653, #606C38)', border: '1px solid rgba(96,108,56,0.4)' }}>
            ML
          </div>
          <span className="font-bold text-white text-lg tracking-tight">MotionLab</span>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[10px] text-white/30 uppercase tracking-wider">Step {step} of {TOTAL_STEPS}</span>
            <span className="font-mono text-[10px] text-[#8a9c4a] uppercase tracking-wider">{pct}% complete</span>
          </div>
          {/* Track */}
          <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(96,108,56,0.12)' }}>
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #264653, #606C38)' }}
            />
          </div>
          {/* Step dots */}
          <div className="flex items-center gap-1.5 mt-3 overflow-x-auto">
            {STEP_LABELS.map((label, i) => {
              const done = i + 1 < step
              const active = i + 1 === step
              return (
                <div key={label} className="flex items-center gap-1.5 shrink-0">
                  <div className={cn(
                    'w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold transition-all border',
                    done ? 'border-[#606C38] text-white' : active ? 'border-[#8a9c4a] text-[#8a9c4a]' : 'border-white/10 text-white/20',
                  )}
                    style={done ? { background: '#606C38' } : active ? { background: 'rgba(96,108,56,0.1)' } : {}}>
                    {done ? <Check size={9} /> : i + 1}
                  </div>
                  <span className={cn('text-[9px] font-mono uppercase tracking-wider hidden sm:block', active ? 'text-[#8a9c4a]' : 'text-white/20')}>
                    {label}
                  </span>
                  {i < TOTAL_STEPS - 1 && (
                    <div className="w-4 h-px" style={{ background: 'rgba(96,108,56,0.15)' }} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Step card */}
        <div className="rounded-2xl p-6 sm:p-8" style={{ background: '#0D1420', border: '1px solid rgba(96,108,56,0.15)' }}>
          {/* Corner brackets */}
          <span className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[#606C38]/30" />
          <span className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[#606C38]/30" />

          {/* ── Step 1: Profile ── */}
          {step === 1 && (
            <div>
              <div className="step-badge mb-4">01</div>
              <h2 className="text-2xl font-black text-white mb-1">Tell us about yourself</h2>
              <p className="text-sm text-white/35 mb-6">This personalises your training plan and AI recommendations.</p>
              <div className="flex flex-col gap-4">
                <DarkInput label="Full name" placeholder="Aditya Saiprasad" value={data.name ?? ''} onChange={e => setField('name', e.target.value)} />
                <DarkInput label="Age" type="number" placeholder="25" value={data.age ?? ''} onChange={e => setField('age', parseInt(e.target.value) || undefined as unknown as number)} />
                <div className="grid grid-cols-2 gap-3">
                  <DarkInput label="Weight (kg)" type="number" placeholder="70" value={data.weight_kg ?? ''} onChange={e => setField('weight_kg', parseFloat(e.target.value) || undefined as unknown as number)} />
                  <DarkInput label="Height (cm)" type="number" placeholder="175" value={data.height_cm ?? ''} onChange={e => setField('height_cm', parseFloat(e.target.value) || undefined as unknown as number)} />
                </div>
              </div>
            </div>
          )}

          {/* ── Step 2: Fitness Goals ── */}
          {step === 2 && (
            <div>
              <div className="step-badge mb-4">02</div>
              <h2 className="text-2xl font-black text-white mb-1">Fitness goals</h2>
              <p className="text-sm text-white/35 mb-6">This determines how your training plan is structured.</p>
              <div className="flex flex-col gap-3 mb-6">
                {[
                  { val: 'muscle_gain', label: 'Muscle Gain', desc: 'Build strength and muscle mass with progressive overload' },
                  { val: 'fat_loss', label: 'Fat Loss', desc: 'Lose body fat while preserving lean muscle' },
                  { val: 'general_fitness', label: 'General Fitness', desc: 'Improve overall health, stamina, and movement quality' },
                ].map(opt => (
                  <SelectCard
                    key={opt.val}
                    label={opt.label}
                    description={opt.desc}
                    selected={data.fitness_goal === opt.val}
                    onClick={() => setField('fitness_goal', opt.val as Profile['fitness_goal'])}
                  />
                ))}
              </div>

              <p className="text-sm font-medium text-white/60 mb-3">Experience level</p>
              <div className="flex flex-col gap-3 mb-6">
                {[
                  { val: 'beginner', label: 'Beginner', desc: 'Less than 1 year of consistent training' },
                  { val: 'intermediate', label: 'Intermediate', desc: '1–3 years of consistent training' },
                  { val: 'advanced', label: 'Advanced', desc: '3+ years, comfortable with complex movements' },
                ].map(opt => (
                  <SelectCard key={opt.val} label={opt.label} description={opt.desc} selected={data.experience_level === opt.val} onClick={() => setField('experience_level', opt.val as Profile['experience_level'])} />
                ))}
              </div>

              <p className="text-sm font-medium text-white/60 mb-3">Gym sessions per week</p>
              <div className="flex flex-wrap gap-2">
                {[2, 3, 4, 5, 6].map(n => (
                  <ToggleChip key={n} label={`${n} days`} selected={data.sessions_per_week === n} onClick={() => setField('sessions_per_week', n)} />
                ))}
              </div>
            </div>
          )}

          {/* ── Step 3: Equipment ── */}
          {step === 3 && (
            <div>
              <div className="step-badge mb-4">03</div>
              <h2 className="text-2xl font-black text-white mb-1">Equipment access</h2>
              <p className="text-sm text-white/35 mb-6">We'll only suggest exercises you can actually do.</p>
              <div className="flex flex-wrap gap-2 mb-6">
                {EQUIPMENT_OPTIONS.map(eq => (
                  <ToggleChip
                    key={eq}
                    label={eq}
                    selected={(data.equipment ?? []).includes(eq)}
                    onClick={() => setField('equipment', toggle(data.equipment ?? [], eq))}
                  />
                ))}
              </div>
              <p className="text-sm font-medium text-white/60 mb-2">Injuries or movement limitations?</p>
              <textarea
                className="w-full rounded-[8px] px-3 py-2.5 text-sm text-white/80 placeholder-white/20 resize-none focus:outline-none min-h-[80px]"
                style={{ background: 'rgba(8,12,20,0.8)', border: '1px solid rgba(96,108,56,0.2)', colorScheme: 'dark' }}
                placeholder="e.g. Lower back pain, right knee instability, shoulder impingement..."
                value={data.injuries ?? ''}
                onChange={e => setField('injuries', e.target.value)}
              />
              <p className="text-xs text-white/25 mt-1.5">Helps us avoid exercises that could aggravate existing conditions.</p>
            </div>
          )}

          {/* ── Step 4: Sports ── */}
          {step === 4 && (
            <div>
              <div className="step-badge mb-4">04</div>
              <h2 className="text-2xl font-black text-white mb-1">Which sports do you play?</h2>
              <p className="text-sm text-white/35 mb-6">Personalises warmup protocols, sport-supplementary training, and education content.</p>
              <div className="grid grid-cols-3 gap-2.5">
                {SPORTS_OPTIONS.map(sport => {
                  const selected = (data.sports ?? []).includes(sport.slug)
                  return (
                    <button
                      key={sport.slug}
                      type="button"
                      onClick={() => setField('sports', toggle(data.sports ?? [], sport.slug))}
                      className={cn(
                        'flex flex-col items-center gap-2 p-4 rounded-[10px] border text-xs font-medium transition-all duration-150 min-h-[80px]',
                        selected
                          ? 'border-[#606C38]/60 text-[#8a9c4a]'
                          : 'border-[#606C38]/10 text-white/40 hover:border-[#606C38]/25 hover:text-white/60',
                      )}
                      style={selected ? { background: 'rgba(96,108,56,0.08)' } : { background: 'rgba(8,12,20,0.5)' }}
                    >
                      <span className="text-2xl">{sport.emoji}</span>
                      <span className="text-center leading-tight">{sport.name}</span>
                      {selected && <Check size={12} className="text-[#8a9c4a]" />}
                    </button>
                  )
                })}
              </div>

              {(data.sports ?? []).filter(s => s !== 'none').length > 0 && (
                <div className="mt-6 flex flex-col gap-4">
                  <p className="text-sm font-medium text-white/60">How often do you play each sport?</p>
                  {(data.sports ?? []).filter(s => s !== 'none').map(slug => {
                    const sport = SPORTS_OPTIONS.find(s => s.slug === slug)
                    const freq = data.sport_frequency ?? {}
                    return (
                      <div key={slug}>
                        <p className="text-xs text-white/40 mb-2">{sport?.emoji} {sport?.name}</p>
                        <div className="flex flex-wrap gap-2">
                          {[1, 2, 3, 4, 5].map(n => (
                            <ToggleChip
                              key={n}
                              label={n === 5 ? '5+ / week' : `${n}x / week`}
                              selected={freq[slug] === n}
                              onClick={() => setField('sport_frequency', { ...freq, [slug]: n })}
                            />
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              <div className="mt-6">
                <p className="text-sm font-medium text-white/60 mb-1">How active is your day-to-day lifestyle?</p>
                <p className="text-xs text-white/25 mb-3">Outside of the gym and sport sessions above — helps the AI size your nutrition targets correctly.</p>
                <div className="flex flex-col gap-3">
                  {[
                    { val: 'sedentary', label: 'Sedentary', desc: 'Desk job, mostly sitting, little daily movement' },
                    { val: 'lightly_active', label: 'Lightly active', desc: 'Some walking or light movement most days' },
                    { val: 'moderately_active', label: 'Moderately active', desc: 'On your feet often, regular daily movement' },
                    { val: 'very_active', label: 'Very active', desc: 'Physically demanding job or daily intense activity' },
                  ].map(opt => (
                    <SelectCard
                      key={opt.val}
                      label={opt.label}
                      description={opt.desc}
                      selected={data.activity_level === opt.val}
                      onClick={() => setField('activity_level', opt.val as Profile['activity_level'])}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Step 5: Nutrition ── */}
          {step === 5 && (
            <div>
              <div className="step-badge mb-4">05</div>
              <h2 className="text-2xl font-black text-white mb-1">Nutrition targets</h2>
              <p className="text-sm text-white/35 mb-6">Sets macro targets and filters the food database to your preferences.</p>
              <div className="flex flex-col gap-4">
                <DarkInput
                  label="Daily calorie target (kcal)"
                  type="number"
                  placeholder="Leave blank for AI to calculate"
                  hint="Leave blank and the AI will calculate this from your goals, sports, sport frequency, and activity level"
                  value={data.calorie_target ?? ''}
                  onChange={e => setField('calorie_target', parseInt(e.target.value) || undefined as unknown as number)}
                />
                <DarkInput
                  label="Daily protein target (g)"
                  type="number"
                  placeholder="Leave blank for AI to calculate"
                  hint="Leave blank and the AI will calculate this the same way"
                  value={data.protein_target ?? ''}
                  onChange={e => setField('protein_target', parseInt(e.target.value) || undefined as unknown as number)}
                />
                <div>
                  <p className="text-sm font-medium text-white/60 mb-3">Dietary preference</p>
                  <div className="flex flex-wrap gap-2">
                    {['No preference', 'Vegetarian', 'Vegan', 'Jain', 'Gluten-free', 'Keto'].map(pref => (
                      <ToggleChip
                        key={pref}
                        label={pref}
                        selected={data.dietary_preference === pref}
                        onClick={() => setField('dietary_preference', pref)}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-white/60 mb-2">Allergies or other dietary restrictions?</p>
                  <textarea
                    className="w-full rounded-[8px] px-3 py-2.5 text-sm text-white/80 placeholder-white/20 resize-none focus:outline-none min-h-[80px]"
                    style={{ background: 'rgba(8,12,20,0.8)', border: '1px solid rgba(96,108,56,0.2)', colorScheme: 'dark' }}
                    placeholder="e.g. Peanut allergy, lactose intolerant, no red meat..."
                    value={data.dietary_notes ?? ''}
                    onChange={e => setField('dietary_notes', e.target.value)}
                  />
                  <p className="text-xs text-white/25 mt-1.5">In addition to the preference above — filters food suggestions and recipes.</p>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 6: Plan Generation ── */}
          {step === 6 && (
            <div className="text-center">
              <div className="step-badge mx-auto mb-4">06</div>
              <h2 className="text-2xl font-black text-white mb-3">Ready to generate your plan</h2>
              <p className="text-sm text-white/35 mb-8 max-w-sm mx-auto">
                MotionLab's AI is about to build your first workout plan and sport warmup protocol based on everything you've told us.
              </p>

              {generating ? (
                <div className="flex flex-col items-center gap-6 py-6">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center"
                    style={{ border: '1px solid rgba(96,108,56,0.3)', background: 'rgba(96,108,56,0.08)' }}>
                    <Loader2 size={24} className="text-[#8a9c4a] animate-spin" />
                  </div>
                  <div className="flex flex-col gap-3 w-full max-w-xs text-left">
                    {[
                      'Analysing your goals and equipment...',
                      'Building sport-supplementary training plan...',
                      'Generating warmup protocols...',
                      'Preparing your Dashboard...',
                    ].map((msg, i) => (
                      <div key={msg} className="flex items-center gap-3 text-sm text-white/40">
                        <div className={cn(
                          'w-5 h-5 rounded-full flex items-center justify-center shrink-0 border',
                          i < 2 ? 'border-[#606C38]' : 'border-white/10',
                        )}
                          style={i < 2 ? { background: '#606C38' } : {}}>
                          {i < 2
                            ? <Check size={10} className="text-white" />
                            : <Loader2 size={10} className="text-white/20 animate-spin" />}
                        </div>
                        {msg}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4 items-center">
                  <div className="w-full rounded-xl p-4 text-left space-y-2" style={{ background: 'rgba(8,12,20,0.6)', border: '1px solid rgba(96,108,56,0.12)' }}>
                    <p className="text-xs font-mono text-white/30 uppercase tracking-wider mb-3">Your plan summary</p>
                    <p className="text-sm text-white/60"><span className="text-white/35">Goal</span> <span className="text-[#8a9c4a] ml-2">{data.fitness_goal?.replace('_', ' ') ?? 'General fitness'}</span></p>
                    <p className="text-sm text-white/60"><span className="text-white/35">Level</span> <span className="text-[#8a9c4a] ml-2">{data.experience_level ?? 'Beginner'}</span></p>
                    <p className="text-sm text-white/60"><span className="text-white/35">Training</span> <span className="text-[#8a9c4a] ml-2">{data.sessions_per_week ?? 3} sessions/week</span></p>
                    <p className="text-sm text-white/60"><span className="text-white/35">Sports</span> <span className="text-[#8a9c4a] ml-2">{(data.sports ?? []).length > 0 ? data.sports!.join(', ') : 'Gym only'}</span></p>
                  </div>
                  <Button onClick={finish} size="lg" fullWidth className="font-bold text-white mt-2"
                    style={{ background: '#606C38', border: '1px solid rgba(96,108,56,0.5)' }}>
                    Generate My Plan & Go to Dashboard
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          {step < 6 && (
            <div className="flex items-center justify-between mt-8 pt-6" style={{ borderTop: '1px solid rgba(96,108,56,0.1)' }}>
              <Button
                variant="ghost"
                onClick={goBack}
                disabled={step === 1 || saving}
                className={cn('text-white/40 hover:text-white/70', step === 1 && 'invisible')}
              >
                <ChevronLeft size={16} className="mr-1" /> Back
              </Button>
              <Button
                onClick={goNext}
                loading={saving}
                className="font-semibold text-white"
                style={{ background: '#606C38', border: '1px solid rgba(96,108,56,0.5)' }}
              >
                {step === 5 ? 'Review Plan' : 'Continue'} <ChevronRight size={16} className="ml-1" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

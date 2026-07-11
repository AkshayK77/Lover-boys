import { createContext, useContext, useState, useCallback } from 'react'
import type { ReactNode } from 'react'

// A single exercise the AI drawer can inject into the active session.
export interface WorkoutUpdateExercise {
  exerciseName: string
  sets?: number
  repRange?: string
}

export interface WorkoutUpdate {
  exercises: WorkoutUpdateExercise[]
}

interface WorkoutContextValue {
  // AI drawer → WorkoutPage channel (used when the coach edits the live session)
  workoutUpdate: WorkoutUpdate | null
  setWorkoutUpdate: (u: WorkoutUpdate | null) => void
  // WorkoutPage → AI drawer: names of exercises in the current session
  activeSessionExercises: string[]
  setActiveSessionExercises: (names: string[]) => void
  // Bump to force the dashboard muscle heatmap to reload volume
  heatmapRefreshKey: number
  triggerHeatmapRefresh: () => void
}

const WorkoutContext = createContext<WorkoutContextValue | null>(null)

export function WorkoutProvider({ children }: { children: ReactNode }) {
  const [workoutUpdate, setWorkoutUpdate] = useState<WorkoutUpdate | null>(null)
  const [activeSessionExercises, setActiveSessionExercises] = useState<string[]>([])
  const [heatmapRefreshKey, setHeatmapRefreshKey] = useState(0)

  const triggerHeatmapRefresh = useCallback(() => setHeatmapRefreshKey(k => k + 1), [])

  return (
    <WorkoutContext value={{
      workoutUpdate, setWorkoutUpdate,
      activeSessionExercises, setActiveSessionExercises,
      heatmapRefreshKey, triggerHeatmapRefresh,
    }}>
      {children}
    </WorkoutContext>
  )
}

export function useWorkout() {
  const ctx = useContext(WorkoutContext)
  if (!ctx) throw new Error('useWorkout must be used inside WorkoutProvider')
  return ctx
}

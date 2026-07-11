// ─── Auth / Profile ────────────────────────────────────────────────────────

export interface Profile {
  id: string
  name: string
  email: string
  avatar_url: string | null
  age: number | null
  weight_kg: number | null
  height_cm: number | null
  fitness_goal: 'muscle_gain' | 'fat_loss' | 'general_fitness' | null
  experience_level: 'beginner' | 'intermediate' | 'advanced' | null
  sessions_per_week: number | null
  equipment: string[]
  injuries: string | null
  calorie_target: number | null
  protein_target: number | null
  dietary_preference: string | null
  sports: string[]
  sport_frequency: Record<string, number>
  activity_level: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | null
  learning_goals: string[]
  dietary_notes: string | null
  onboarding_complete: boolean
  deload_suggested_at: string | null
  created_at: string
}

export interface UserRole {
  id: string
  user_id: string
  role: 'admin' | 'expert' | 'user'
}

// ─── Training ───────────────────────────────────────────────────────────────

export interface Exercise {
  id: string
  name: string
  muscle_groups: string[]
  equipment: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  instructions: string
  category: string
}

export interface WorkoutPlan {
  id: string
  user_id: string
  title: string
  plan_type: string
  sessions_per_week: number
  is_active: boolean
  created_at: string
}

export interface PlanDay {
  id: string
  plan_id: string
  day_of_week: number
  focus: string
  exercises: PlanExercise[]
}

export interface PlanExercise {
  exercise_id: string
  sets: number
  reps: string
  rest_seconds: number
  notes: string | null
}

export interface Session {
  id: string
  user_id: string
  plan_day_id: string | null
  date: string
  duration_minutes: number | null
  notes: string | null
  sport_warmup_sport: string | null
}

export interface SessionSet {
  id: string
  session_id: string
  exercise_id: string
  set_number: number
  reps: number
  weight_kg: number
  rpe: number | null
  is_pr: boolean
  timestamp: string
}

export interface MuscleVolumeLog {
  id: string
  user_id: string
  week_start: string
  muscle_group: string
  volume: number
}

export interface Measurement {
  id: string
  user_id: string
  date: string
  weight_kg: number | null
  chest_cm: number | null
  waist_cm: number | null
  hips_cm: number | null
  arms_cm: number | null
  thighs_cm: number | null
}

export interface MealEntry {
  id: string
  user_id: string
  date: string
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  food_name: string
  quantity_g: number
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
}

// ─── Education ──────────────────────────────────────────────────────────────

export interface Sport {
  id: string
  name: string
  slug: string
  description: string
  icon_url: string | null
  active: boolean
}

export interface LearningPath {
  id: string
  sport_id: string
  title: string
  level: 'beginner' | 'intermediate' | 'advanced'
  description: string
}

export interface Module {
  id: string
  learning_path_id: string
  title: string
  order: number
  description: string
}

export interface Lesson {
  id: string
  module_id: string
  title: string
  content_body: string
  content_type: 'text' | 'video' | 'interactive'
  visual_url: string | null
  sport_tags: string[]
  topic_tags: string[]
  duration_minutes: number
  expert_id: string | null
  published: boolean
}

export interface LessonProgress {
  id: string
  user_id: string
  lesson_id: string
  completed: boolean
  completion_date: string | null
}

export interface Expert {
  id: string
  name: string
  title: string
  bio: string
  photo_url: string | null
  credentials: string
  specialisation: string[]
  verified: boolean
  user_id: string | null
}

export interface Article {
  id: string
  title: string
  body: string
  author_id: string
  sport_tags: string[]
  topic_tags: string[]
  published_at: string
}

// ─── Community ──────────────────────────────────────────────────────────────

export type PostType = 'text' | 'image' | 'link'
export type PostFlair = 'Technique' | 'Injury Question' | 'Progress' | 'Recovery' | 'General'

export interface Discussion {
  id: string
  user_id: string
  sport_tag: string
  flair: PostFlair | null
  post_type: PostType
  title: string
  body: string | null
  image_urls: string[]
  link_url: string | null
  link_preview: Record<string, string> | null
  upvotes: number
  downvotes: number
  created_at: string
  author?: { name: string; avatar_url: string | null }
}

export interface Comment {
  id: string
  discussion_id: string
  parent_comment_id: string | null
  user_id: string
  body: string
  upvotes: number
  downvotes: number
  created_at: string
  author?: { name: string; avatar_url: string | null }
}

// ─── Platform ───────────────────────────────────────────────────────────────

export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  body: string
  read: boolean
  action_url: string | null
  created_at: string
}

export interface Bookmark {
  id: string
  user_id: string
  content_type: 'lesson' | 'article' | 'plan'
  content_id: string
  created_at: string
}

export interface SportSchedule {
  id: string
  user_id: string
  sport: string
  day_of_week: number
  time: string
  active: boolean
}

export interface CoachConversation {
  id: string
  user_id: string
  title: string
  created_at: string
}

export interface CoachMessage {
  id: string
  conversation_id: string
  role: 'user' | 'assistant'
  content: string
  mode: string | null
  created_at: string
}

// ─── Onboarding ─────────────────────────────────────────────────────────────

export interface OnboardingState {
  step: number
  profile: Partial<Profile>
}

// ─── AI ─────────────────────────────────────────────────────────────────────

export type AIMode =
  | 'default'
  | 'flags'
  | 'recipe'
  | 'workout'
  | 'warmup'
  | 'grocery'
  | 'sport_warmup'
  | 'injury_check'
  | 'learning_rec'

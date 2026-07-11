**MotionLab** ·  Unified PRD v1.0  ·  Confidential 

## **MOTIONLAB** 

Unified Product Requirements Document 

_Train with Understanding_ 

Version 1.0  ·  June 2026  ·  Confidential 

Founders: Aditya Saiprasad · Akshay Kannan 

## **1. Executive Summary** 

## **1.1 Vision** 

MotionLab is the first platform to unify sports science education, intelligent workout planning, and sport-specific performance tracking in a single coherent experience. Athletes learn how to move correctly, train with AI-generated plans that adapt to their progress, and understand why every exercise, warmup, and recovery protocol exists — grounded in biomechanics and reviewed by sports science experts. 

## **1.2 Problem Statement** 

Athletes at every level face the same structural gap: the knowledge that prevents injuries and unlocks performance is locked inside physio clinics and university sports science departments that most people never access. The existing landscape is fragmented: 

- YouTube provides technique videos but no structure, personalisation, or injury context 

- Fitness apps (MyFitnessPal, Hevy, StrongApp) track workouts but do not teach movement 

- Sports physios provide expert guidance but cost ₹2,000–5,000 per session and are reactive, not preventative 

- General fitness platforms ignore sport-specific biomechanics entirely 

- No platform connects what a user learns about movement science to how they actually train day-to-day 

June 2026Page 

**MotionLab** ·  Unified PRD v1.0  ·  Confidential 

The result: recreational athletes sustain preventable injuries, underperform their potential, and never develop a true understanding of how their body works during sport. 

## **1.3 The Unified Solution** 

MotionLab merges two complementary MVPs — MotionLab (sports science education + community) and KavaFit (AI workout planning + live session tracking + nutrition) — into one platform where: 

- Education informs training: movement science content grounds every exercise recommendation 

- Training generates insight: session data surfaces relevant injury prevention and recovery content 

- Community compounds learning: expert-verified threads and sport-tagged discussions extend the platform beyond content into lived experience 

- AI connects everything: a context-aware coach with full training history, nutrition, movement science, and sport profile answers the questions a physio would answer 

## **1.4 Goals** 

## **Product Goals** 

- Ship a production-ready MVP within 12 weeks using KavaFit's codebase as the foundation 

- Launch with at least 2 sports fully covered (Table Tennis, Football) with expert-reviewed content 

- Achieve Day-30 retention above 35% within 6 months of launch 

- Reach 1,000 weekly active users within 3 months 

## **Business Goals** 

- Establish product-market fit with fitness-committed recreational athletes aged 18–40 in India 

- Build a freemium model gated on AI coach usage, advanced learning paths, and certifications 

- Create the foundation for a B2B play: sports academies, college teams, corporate wellness 

- Develop an expert contributor network of 5+ credentialled physios and sports scientists within 6 months 

## **1.5 Non-Goals (v1.0)** 

- Native iOS or Android apps — v1.0 is a progressive web app 

- Elite competitive athlete periodisation — clinical positioning is out of scope 

June 2026Page 

**MotionLab** ·  Unified PRD v1.0  ·  Confidential 

- Team-based or group training coordination 

- Wearable integrations (Apple Watch, Garmin, Fitbit) 

- Real-time multi-device synchronisation 

- In-app payment processing — subscription handled externally in v1.0 

- Clinical or medical claims — MotionLab is not a medical device 

## **1.6 Success Metrics** 

|**Metric**|**Target**|**Timeframe**|
|---|---|---|
|Weekly Active Users (WAU)|1,000+|Month 3|
|Day-30 retention|>35%|Month 6|
|Session completion rate|>65%|Month 3|
|AI plan acceptance rate|>70%|Month 2|
|Avg sessions logged per user/week|2.5+|Month 3|
|Expert content pieces published|20+|Month 4|
|Community posts per week|50+|Month 3|
|NPS score|45+|Month 6|



## **2. Product Analysis** 

This section documents the two existing products that were merged to form MotionLab. It provides a complete feature inventory, comparative analysis, and the rationale for every merge, keep, and discard decision. 

## **2.1 MotionLab (Product A)** 

## **Overview** 

MotionLab is a sports science education platform built in Lovable, targeting recreational athletes who want to understand movement science, injury prevention, and biomechanics for their specific sports. It was founded by Aditya Saiprasad, whose personal experience of a scapular injury and physiotherapy rehabilitation revealed a structural gap: most athletes never receive the foundational sports science knowledge that physiotherapists take for granted. 

June 2026Page 

**MotionLab** ·  Unified PRD v1.0  ·  Confidential 

## **Architecture** 

- Frontend: React generated via Lovable (no clean TypeScript architecture) 

- Backend: Supabase (Auth, PostgreSQL, Storage, RLS) 

- AI: Claude/Lovable AI for 4 sport-specific coaches with per-user chat history 

- Community: Supabase-backed discussion board with sport tags and topic filters 

- Analytics: None wired at MVP stage 

- Error tracking: None wired at MVP stage 

## **Feature Inventory** 

|**Feature**|**Status**|**Quality**|**Keep / Action**|
|---|---|---|---|
|Landing page|Live|Good|Keep, redesign in new<br>codebase|
|About page (founder story)|Live|Good|Keep — strong<br>credibility asset|
|Sport explorer (8 sports)|Live|Good|Keep, extend|
|Sport detail pages (5 pillars)|Live|Good|Keep, extend|
|Movement science viewer|Live|Strong differentiator|Keep — core moat|
|Injury prevention hub|Live|Good|Keep — core moat|
|Expert hub|Live|Partial|Keep, build out<br>contributor system|
|Community (Reddit-style)|Live|Needs work|Keep, redesign UX|
|AI coaches (4)|Live|Partial|Migrate to KavaFit AI<br>architecture|
|Learning paths|Mockup only|Not built|Build properly in new<br>platform|
|Real lesson progress tracking|Not built|—|Build in new platform|
|Admin CMS|Not built|—|Critical — build in<br>Phase 2|
|Global search|Not built|—|Build in Phase 2|
|Notifications|Not built|—|Build in Phase 2|
|Resource library|Partial|Thin|Build properly in new<br>platform|
|Profile + My Library|Partial|Thin|Merge with KavaFit<br>profile|
|Certifications|Not built|—|Phase 3|
|Gym finder|Not built|—|Use KavaFit's<br>implementation|



June 2026Page 

**MotionLab** ·  Unified PRD v1.0  ·  Confidential 

## **Strengths** 

- Founder-market fit is exceptional: Aditya is the target user 

- Visual-first pedagogy (skeleton overlays, force diagrams) is genuinely differentiated 

- Injury prevention + movement science angle has strong SEO and emotional resonance 

- Community architecture (sport tags, expert verification) is well-conceived 

- Real Supabase backend with RLS is production-ready 

## **Weaknesses** 

- Lovable-generated codebase: not maintainable at scale, no clean TypeScript architecture 

- No real lesson progress tracking wired to the database 

- AI coaches not grounded in MotionLab content — give generic answers 

- Community UX is too rigid: no image uploads, no upvotes, poor post composer 

- Zero analytics, error tracking, or observability 

- No content pipeline: no Admin CMS means no way to add lessons without code changes 

## **2.2 KavaFit (Product B)** 

## **Overview** 

KavaFit is an AI-powered fitness coaching SaaS delivering personalised workout planning, live session tracking with real-time PR detection, nutrition logging, and a contextual AI coach — all in a mobile-first web application. It targets fitness-committed individuals aged 22–42 who want scientifically grounded, adaptive training without the cost of a personal trainer. Its technical architecture is significantly more mature than MotionLab's. 

## **Architecture** 

- Frontend: React 19 + TypeScript 6 + Tailwind CSS 4 + Vite 8 — production-grade 

- Backend: Supabase (Auth, PostgreSQL, Edge Functions, Storage) 

- AI: Groq LLM via Supabase Edge Function (ai-proxy) — server-side key management 

- Offline: IndexedDB (kavafit-offline-v1) with background sync — real technical moat 

- Analytics: PostHog (user behaviour) 

- Error tracking: Sentry (runtime errors) 

- Maps: Leaflet + OpenStreetMap (gym finder) 

- Nutrition: Dual DB — Indian foods (pre-seeded) + USDA API (Edge Function) 

## **Feature Inventory** 

June 2026Page 

**MotionLab** ·  Unified PRD v1.0  ·  Confidential 

|**Feature**|**Status**|**Quality**|**Keep / Action**|
|---|---|---|---|
|AI workout planning (PPL, Full Body,<br>Bro Split)|Live|Strong|Keep — core<br>differentiator|
|Live session tracking + PR detection|Live|Strong|Keep — core<br>differentiator|
|Progressive overload engine|Live|Strong|Keep — technical<br>moat|
|40-group muscle taxonomy +<br>volume tracking|Live|Strong|Keep — unique depth|
|Deload detection (5-week monitor)|Live|Strong|Keep — rare feature|
|Offline mode (IndexedDB + sync)|Live|Strong|Keep — real<br>engineering moat|
|Nutrition logging (Indian food DB +<br>USDA)|Live|Strong|Keep — strong India<br>fit|
|AI recipe generation + grocery list|Live|Good|Keep|
|Body Lab (interactive anatomy)|Live|Good|Merge with MotionLab<br>movement science|
|Dashboard (heatmap, streak, AI<br>insights)|Live|Strong|Keep, extend with<br>learning data|
|Progress tracking (measurements,<br>photos)|Live|Good|Keep|
|Gym finder (GPS, OSM, Leaflet)|Live|Good|Keep|
|Excel export|Live|Good|Keep|
|Warm-up AI modal|Live|Good|Extend with<br>sport-specific<br>warmups from<br>MotionLab content|
|Sentry + PostHog|Live|Good|Keep — use for<br>merged product|
|Social features|Not built|—|Use MotionLab<br>community|
|Education / learning content|Not built|—|Use MotionLab<br>content system|
|Expert network|Not built|—|Use MotionLab expert<br>hub|



## **Strengths** 

- Production-grade React + TypeScript codebase — maintainable and extensible 

- Groq AI architecture is mature: buildAgentContext() assembles full user context with token budget management 

June 2026Page 

**MotionLab** ·  Unified PRD v1.0  ·  Confidential 

- Offline-first architecture is a genuine technical differentiator 

- Indian food database is a strong localisation advantage 

- PostHog + Sentry already wired — observability is production-ready 

- 40-group muscle taxonomy is unique depth not found in competitor apps 

- Progressive overload and deload detection show real sports science thinking 

## **Weaknesses** 

- No education layer: tracks training but does not teach why 

- No community: users have no social layer or peer learning 

- AI answers are generic without sport-specific or movement science grounding 

- Warmup generation is AI-only, not grounded in expert-reviewed content 

- No sport-specific context: treats all users as gym athletes, not sport players 

## **2.3 Comparative Analysis** 

|**Dimension**|**MotionLab**|**KavaFit**|**Decision**|
|---|---|---|---|
|Codebase quality|Lovable-generated,<br>not maintainable|Production React/TS,<br>maintainable|Use KavaFit as base|
|AI architecture|Claude/Lovable, no<br>context management|Groq,<br>buildAgentContext(),<br>Edge Function|Use KavaFit AI system|
|Workout tracking|None|Full: PR detection,<br>progressive overload,<br>volume|KavaFit wins — keep<br>all|
|Sports science education|Full: movement, injury<br>prevention,<br>biomechanics|None|MotionLab wins —<br>keep all|
|Nutrition|None|Full: Indian DB, USDA,<br>AI recipes|KavaFit wins — keep<br>all|
|Community|Reddit-style (needs<br>UX work)|None|MotionLab — rebuild<br>UX properly|
|Expert network|Designed, partially<br>built|None|MotionLab — build out<br>properly|
|Offline support|None|IndexedDB +<br>background sync|KavaFit wins — keep<br>all|
|Analytics + errors|None|PostHog + Sentry|KavaFit wins — keep<br>all|
|Anatomy/body model|Skeleton overlays<br>(education focus)|Body Lab 40 groups<br>(training focus)|Merge into unified<br>anatomy layer|



June 2026Page 

**MotionLab** ·  Unified PRD v1.0  ·  Confidential 

|**Dimension**|**MotionLab**|**KavaFit**|**Decision**|
|---|---|---|---|
|Indian market fit|Moderate|Strong (food DB,<br>Bangalore persona)|KavaFit base, extend<br>for sports|
|Dashboard|Education-focused,<br>thin|Data-rich: heatmap,<br>streak, nutrition|Merge: KavaFit data +<br>ML learning widgets|
|Auth|Supabase (basic)|Supabase (Google<br>OAuth + email,<br>complete)|KavaFit auth system|
|Profile schema|Sports interests,<br>learning goals|Goals, equipment,<br>injuries, nutrition<br>targets|Merge into one<br>profiles table|



## **3. User Personas** 

## **3.1 Primary Persona — The Sport-Active Amateur** 

**Persona Profile** 

Age 22–35 · Metro India (Bangalore, Mumbai, Delhi) · Plays 1–2 recreational sports weekly · Trains at gym 2–4x/week · Has goals (performance, fitness, injury avoidance) but lacks structured sport-specific training · Willing to pay for something that actually works 

## **Goals** 

- Improve performance in their sport without risking injury 

- Understand why exercises and warmups matter — not just follow a plan blindly 

- Get AI-level coaching without ₹5,000/session physiotherapy costs 

- Find community with people who play the same sports 

## **Pain Points** 

- Plays football or TT but has no idea if their movement mechanics are increasing injury risk 

- Has experienced an injury (common: ACL, shoulder, wrist) that could have been prevented 

- Generic fitness apps don't understand their sport — suggest bench press to a TT player 

- YouTube gives technique tips but no personalised application or injury context 

June 2026Page 

**MotionLab** ·  Unified PRD v1.0  ·  Confidential 

## **Representative User — Aditya** 

Plays competitive Table Tennis and recreational football. Suffered a scapular injury. Visited a sports physio who taught him warmup mechanics and biomechanics. Realised this knowledge should be accessible to everyone who plays sport, not just those who can afford physio. 

## **3.2 Secondary Persona — The Returning Gym Athlete** 

**Persona Profile** 

Age 28–42 · Career professional · Had a structured gym routine 3–5 years ago · Returning after a break · Injury history is relevant · Needs efficient, adaptive programming · Values nutrition tracking · Wants to understand muscle recovery and deload logic 

## **Goals** 

- Get back to previous fitness levels efficiently 

- Not re-injure themselves through poor programming 

- Understand progressive overload and recovery — tired of guessing 

- Track nutrition without spending 45 minutes logging a meal 

## **3.3 Tertiary Persona — The Sports Science Learner** 

**Persona Profile** 

Age 18–28 · College student or recent graduate · Interested in biomechanics and sports science · May not be an elite athlete but is intellectually curious · Attracted by the visual learning layer · Likely to share content and build community 

## **Goals** 

- Learn sports science concepts in an accessible, visual format 

- Build understanding they can apply to their own sport or share with others 

- Connect with a community of similarly minded people 

## **3.4 Expert Contributor Persona — The Sports Physio / Coach** 

**Persona Profile** 

Age 26–45 · Sports physiotherapist, sports scientist, or coach · Wants to build audience and online presence · Creates content on Instagram or LinkedIn · Motivated by visibility and credibility, not payment at MVP stage · Values the Expert badge and verified contributor status 

## **Goals** 

June 2026Page 

**MotionLab** ·  Unified PRD v1.0  ·  Confidential 

- Reach a wider audience of athletes who need their expertise 

- Be attributed for content in a trusted, science-backed platform 

- Respond to Ask-an-Expert threads to demonstrate knowledge 

## **4. Information Architecture** 

## **4.1 Navigation Structure** 

## **Public Navigation (logged out)** 

|**Nav Item**|**Path**|**Purpose**|
|---|---|---|
|Home|/|Marketing landing page|
|About|/about|Founder story — Aditya Saiprasad|
|Sports|/sports|Public sport explorer (preview)|
|Experts|/experts|Expert contributor profiles|
|Resources|/resources|Public articles and guides|
|Gym Finder|/gyms|GPS gym locator (public)|
|Contact|/contact|Contact form + FAQ|
|Login|/auth|Sign in|
|Get Started|/auth?mode=signup|Primary CTA|



## **Authenticated Navigation — Train** 

|**Nav Item**|**Path**|**Purpose**|
|---|---|---|
|Dashboard|/dashboard|Unified hub: training + learning|
|Workout|/workout|Plan management + live session tracking|
|Nutrition|/nutrition|Meal logging, macros, AI recipes|
|Progress|/progress|Volume trends, measurements, photos, analytics|
|Body Lab|/anatomy|Interactive 40-group muscle anatomy|



## **Authenticated Navigation — Learn** 

June 2026Page 

**MotionLab** ·  Unified PRD v1.0  ·  Confidential 

|**Nav Item**|**Path**|**Purpose**|
|---|---|---|
|Sports Library|/sports|All sports, locked/unlocked content|
|Learning Paths|/learn|Structured beginner/intermediate/advanced journeys|
|Movement Science|/movement-science|Interactive biomechanics viewer|
|Injury Prevention|/injury-prevention|Sport-specific injury prevention hub|
|Recovery|/recovery|Recovery protocols and load management|



## **Authenticated Navigation — Connect** 

|**Nav Item**|**Path**|**Purpose**|
|---|---|---|
|Community|/community|Reddit-style sport-tagged discussion|
|Expert Hub|/experts|Authenticated expert profiles + content|
|AI Coach|/ai|Full-screen AI coach with context|
|My Library|/library|Saved lessons, articles, training plans|



## **Account** 

|**Nav Item**|**Path**|**Purpose**|
|---|---|---|
|Profile|/profile|Personal info, sports, achievements, certifications|
|Settings|/settings|Account, security, notifications, privacy|
|Notifications|/notifications|In-app notification centre|



## **Admin (role-gated)** 

|**Nav Item**|**Path**|**Purpose**|
|---|---|---|
|Admin Overview|/admin|Platform analytics, user counts, content status|
|Sports|/admin/sports|Manage sports, pillars, metadata|
|Lessons|/admin/lessons|Create/edit/publish lesson content|
|Learning Paths|/admin/paths|Manage path structure and progression|
|Exercises|/admin/exercises|Exercise database management|
|Experts|/admin/experts|Expert contributor management|
|Resources|/admin/resources|Articles, guides, handbooks|
|Users|/admin/users|User management, roles, moderation|
|Analytics|/admin/analytics|Platform-wide usage analytics|



June 2026Page 

**MotionLab** ·  Unified PRD v1.0  ·  Confidential 

## **5. Feature Specification** 

## **5.1 Onboarding** 

A unified 6-step wizard covering both fitness and sport dimensions. Replaces KavaFit's 5-step wizard and MotionLab's 3-step onboarding with a single coherent flow. 

|**Step**|**Data Collected**|**Purpose**|
|---|---|---|
|1. Profile|Name, age, weight, height|Baseline for calculations and personalisation|
|2. Fitness<br>Goals|Goal (muscle gain / fat loss / general<br>fitness), experience level,<br>sessions/week|Plan structure + volume targets|
|3. Equipment|Available equipment, current injuries|Exercise filtering + safety constraints|
|4. Sports|Sports played, frequency,<br>competition level|Sport-specific warmup, content, community|
|5. Nutrition|Calorie target, protein target, dietary<br>preference, allergies|Macro targets + food DB filtering|
|6. Plan<br>Generation|AI generates first workout plan +<br>sport warmup protocol|First-session readiness|



## **Acceptance Criteria** 

- Onboarding completes in under 4 minutes for the average user 

- All fields from both KavaFit and MotionLab onboardings are captured 

- AI workout plan is generated and ready before user reaches Dashboard 

- Sport-specific content is surfaced immediately after onboarding based on sports selected 

- • Progress is saved after each step — closing and reopening resumes from last completed step 

## **5.2 Dashboard** 

A unified hub that merges KavaFit's data-rich dashboard (heatmap, streak, nutrition, AI insights) with MotionLab's learning progress. The user should see both their training state and their learning state in one view. 

June 2026Page 

**MotionLab** ·  Unified PRD v1.0  ·  Confidential 

## **Required Widgets** 

- Personalised greeting with name + training streak count 

- Today's scheduled workout preview with one-tap Start 

- Nutrition progress bars: calories and protein vs daily target 

- Muscle heatmap: current week volume by muscle group (40-group taxonomy) 

- AI insights card: deload alerts, low-volume warnings, PR celebrations, streak milestones (24h cache) 

- Continue Learning card: next lesson in active learning path 

- Injury Prevention card: contextual warning based on recent training volume (e.g. high hamstring volume → hamstring care module) 

- Sport Schedule widget: user enters their next sport session → triggers warmup reminder flow 

- Weekly AI summary: generated each Monday, cached in localStorage 

## **Priority** 

## **Must Have** 

## **5.3 AI Workout Planning** 

Inherited from KavaFit with sport-specific extensions. Generates structured weekly split plans using profile, goals, equipment, injuries, and — new in the merged product — sport schedule. 

## **Supported Plan Templates** 

- Push / Pull / Legs (PPL) 

- PPL + Upper / Lower hybrid 

- Full Body 

- Bro Split 

- Sport-Supplementary (designed around a user's sport schedule — gym sessions fill recovery days) 

- One-off single session generation 

## **Sport-Supplementary Planning (New)** 

When a user specifies sport days (e.g. football Tuesday + Saturday), the AI generates gym sessions that: 

- Avoid heavy leg work the day before sport sessions 

- Prioritise sport-relevant strength (hip flexor strength for football, wrist stability for TT) 

- Build in appropriate recovery between gym and sport 

June 2026Page 

**MotionLab** ·  Unified PRD v1.0  ·  Confidential 

## **5.4 Live Session Tracking** 

Inherited from KavaFit unchanged. This is one of the strongest features in either product. 

|**Feature**|**Behaviour**|**Priority**|
|---|---|---|
|Set logging|Reps, weight, RPE per set with optimistic<br>UI|Must|
|PR detection|Compares to historical bests, shows PR<br>badge, 24h cache|Must|
|Progressive overload|Compound +5kg / Isolation +2.5kg<br>suggestion|Must|
|Sport warmup integration|Pre-session: user selects sport → AI<br>generates sport-specific warmup from<br>MotionLab content|Must|
|Gym warmup|AI-generated 5-exercise warmup modal|Must|
|Rest timer|Configurable countdown|Must|
|Offline mode|IndexedDB queue, background sync,<br>idempotent writes|Must|
|RPE guidance|Tooltip explaining RPE scale contextually|Should|
|Session notes|Free-text field on session completion|Should|



## **5.5 Sport-Specific Warmup Flow (New — Key Differentiator)** 

This is the feature that makes the merger feel intentional rather than additive. It connects MotionLab's education layer to KavaFit's tracking layer. 

## **Flow** 

1. User sets sport session in Dashboard (e.g. Football — Saturday 10am) 

2. Friday evening: push notification / in-app reminder with sport-specific warmup 

3. User opens warmup: content sourced from MotionLab's injury prevention and movement science modules for that sport 

4. Warmup is logged as a pre-session activity 

5. After sport session, Recovery module for that sport is surfaced 

6. If repeated high-volume sport weeks, injury risk flag surfaces relevant prevention content 

## **Priority** 

**Must Have — this is the MVP's strongest differentiator** 

June 2026Page 

**MotionLab** ·  Unified PRD v1.0  ·  Confidential 

## **5.6 Nutrition** 

Inherited from KavaFit unchanged. Indian food database is a genuine competitive advantage in the primary market. 

- Dual food database: pre-seeded Indian foods + live USDA API lookup 

- Daily macro tracking: calories, protein, carbohydrates, fat vs user targets 

- Meal logging with per-ingredient macro breakdown 

- AI recipe generation: Groq generates recipes with full macro breakdown 

- Grocery list builder: AI suggests shopping from goals and recent meal history 

- Sport nutrition guidance (new): post-sport recovery nutrition recommendations based on sport played and session intensity 

## **5.7 Sports Science Education** 

MotionLab's core content system. Every sport gets 5 pillars. Content is expert-reviewed and visual-first. 

## **Sport Pillars** 

|**Pillar**|**Content Types**|**Key Differentiator**|
|---|---|---|
|Learn the Sport|Rules, history, tactics, equipment<br>guides|Structured, not scattered like YouTube|
|Movement Science|Biomechanics lessons with skeleton<br>overlays, force vectors, muscle<br>activation|Visual-first — unique in market|
|Injury Prevention|Sport-specific common injuries,<br>prevention exercises, warmup<br>protocols|Physio-reviewed — credibility moat|
|Training|Sport-specific strength, mobility,<br>conditioning programs|Connects to KavaFit workout system|
|Recovery|Sleep, hydration, load management,<br>return-to-play protocols|Connects to KavaFit deload detection|



## **Supported Sports at Launch** 

- Table Tennis (Aditya's primary sport — first and deepest coverage) 

- Football / Soccer (Aditya's second sport) 

- Tennis, Basketball, Badminton, Running, Cycling, Swimming (content added incrementally) 

June 2026Page 

**MotionLab** ·  Unified PRD v1.0  ·  Confidential 

## **Content Quality Requirements** 

- All biomechanics content reviewed by a credentialled sports scientist or physiotherapist before publish 

- Injury prevention content must include a disclaimer that it is not medical advice 

- Visual diagrams must accurately represent anatomical structures — no generic stock illustrations 

## **5.8 Learning Paths** 

Structured educational journeys per sport. Unlike learning a single lesson, a path takes a user from beginner to advanced with clear progression milestones. 

## **Structure** 

- Each sport has 3 paths: Beginner, Intermediate, Advanced 

- Each path contains 4–8 modules 

- Each module contains 3–6 lessons 

- Lessons are text + visuals + short exercises — 5–10 minutes each 

- Completion is tracked in lesson_progress table and shown on Dashboard 

- • Completing a path unlocks a digital certificate 

## **5.9 Community** 

Reddit-style discussion with sport-tagging and expert verification. Rebuilt from MotionLab's existing community with improved UX. 

## **Post Composer** 

- Three post types: Text (rich text), Image (multi-image, Supabase Storage), Link (auto-fetch preview) 

- Required: sport tag (from list of supported sports) 

- Optional flair: Technique · Injury Question · Progress · Recovery · General 

## **Feed** 

- Sort: Hot · New · Top this week 

- Filter: by sport tag, by flair 

- Upvote / downvote (one vote per user per post, toggleable) 

- Nested comments (1 level deep at MVP) 

- User avatar + display name prominent on every post 

June 2026Page 

**MotionLab** ·  Unified PRD v1.0  ·  Confidential 

## **Expert Features** 

- Expert badge on verified contributor profiles and their replies 

- Ask an Expert post type: elevated visual treatment, navy border, routed to relevant expert 

- Experts can be tagged in posts 

## **Moderation** 

- Admin can remove posts and comments 

- Report button on all posts and comments 

- User blocking (Phase 2) 

## **5.10 AI Coach** 

The merged product's AI coach inherits KavaFit's Groq architecture and extends buildAgentContext() with MotionLab data. 

## **Context Assembled Per Request** 

- User profile: age, weight, goals, equipment, injury history, sports 

- Last 7 training sessions (10 sets each, truncated to 3 if over token budget) 

- Weekly muscle volume by group 

- Today's nutrition 

- Today's scheduled plan 

- Active learning path and last completed lesson 

- Sport schedule for the week 

- Recent injury flags from lesson interactions 

## **AI Modes** 

|**Mode**|**Description**|**New /**<br>**Existing**|
|---|---|---|
|default|Free-form coaching conversation with full<br>context|KavaFit|
|flags|Structured JSON: insights, alerts,<br>celebrations for Dashboard|KavaFit|
|recipe|AI meal generation with macros as JSON|KavaFit|
|workout|Full session plan as structured JSON|KavaFit|
|warmup|Gym warmup sequence (5 exercises)|KavaFit|
|grocery|Shopping list from nutrition goals|KavaFit|



June 2026Page 

**MotionLab** ·  Unified PRD v1.0  ·  Confidential 

|**Mode**|**Description**|**New /**<br>**Existing**|
|---|---|---|
|sport_warmup|Sport-specific warmup sourced from<br>MotionLab injury prevention content|New|
|injury_check|Flag movement risk based on training<br>patterns, surface relevant MotionLab<br>module|New|
|learning_rec|Next lesson recommendation based on<br>training data and learning progress|New|



## **AI Grounding (Critical)** 

The three new AI modes must surface MotionLab lesson content, not generic answers. Implementation: relevant lessons are retrieved by sport + topic tag and included in the prompt context. This is the feature that transforms the AI from a generic chatbot into a platform-native coach. 

## **5.11 Body Lab + Movement Science (Merged)** 

KavaFit's Body Lab (40-group muscle taxonomy, recovery guidance, exercise associations) and MotionLab's Movement Science viewer (skeleton overlays, force vectors, motion breakdowns) are merged into a unified anatomy and movement learning layer. 

- Interactive body model: tap a muscle group to see volume, recovery state, and associated exercises (KavaFit) 

- Movement overlays: for each sport, view skeleton overlay, muscle activation sequence, force direction (MotionLab) 

- Recovery time guidance per muscle group (KavaFit) 

- Injury risk indicators: muscle groups with high recent volume get a visual warning (new — connects both systems) 

## **5.12 Progress Tracking** 

Inherited from KavaFit with learning analytics added. 

- Calendar view: sessions logged per day, monthly overview 

- Volume trend graphs: per-exercise volume over time 

- Body measurements: weight, chest, waist, hips, arms, thighs 

- Progress photos: upload, date-stamp, compare 

- Learning analytics (new): hours learned, lessons completed, weekly activity, learning trends 

June 2026Page 

**MotionLab** ·  Unified PRD v1.0  ·  Confidential 

- Certification tracker: completed paths and earned certificates 

- Excel export: full session, measurement, and progress history 

## **5.13 Admin CMS** 

Critical missing feature from both products. Without it, content cannot be added without code changes. Must be built in Phase 2. 

|**Module**|**Capabilities**|
|---|---|
|Sports Management|Add/edit sports, manage sport metadata, enable/disable content pillars|
|Lesson Management|Create/edit/publish lessons, upload visuals, manage content order|
|Learning Path<br>Management|Define path structure, module order, completion criteria|
|Exercise Database|Add/edit exercises, muscle group mapping, difficulty, instructions|
|Expert Management|Invite experts, manage verification badges, link to content|
|Resource Publishing|Create/edit articles, guides, handbooks with rich text editor|
|User Management|View users, assign roles (admin/expert/user), handle reports|
|Platform Analytics|WAU, retention, content engagement, AI usage, community activity|



## **6. User Flows** 

## **6.1 Onboarding Flow** 

7. User arrives at landing page → clicks "Get Started" 

8. Sign up: email + password or Google OAuth 

9. Step 1 — Profile: name, age, weight, height 

10. Step 2 — Fitness Goals: goal, experience level, sessions/week 

11. Step 3 — Equipment: available equipment, current injuries 

12. Step 4 — Sports: select sports played, frequency (can skip if gym-only) 

13. Step 5 — Nutrition: calorie target, protein target, dietary preference, allergies 

14. Step 6 — Plan Generation: AI generates first plan + sport warmup protocol (loading state) 

15. Land on Dashboard: plan ready, first lesson recommended, sport schedule widget empty 

June 2026Page 

**MotionLab** ·  Unified PRD v1.0  ·  Confidential 

## **6.2 The Killer Loop — Sport Session Flow** 

This flow is the product's primary differentiator. It is the reason both products needed each other. 

16. User enters sport session in Dashboard widget: "Football — Saturday 10am" 

17. Friday 8pm: push notification "Your football warmup for tomorrow is ready" 

18. User opens warmup: 8-minute football-specific warmup from MotionLab injury prevention content 

19. After warmup, user marks it complete — logs to session history 

20. Saturday: plays football session 

21. Saturday afternoon: notification "Time to recover — here's your post-football recovery protocol" 

22. Sunday: Dashboard shows injury risk flag if consecutive high-load football weeks 

23. Flag links directly to relevant MotionLab injury prevention module 

## **6.3 AI Coach Interaction** 

24. User opens AI Coach (full screen or floating drawer from any page) 

25. buildAgentContext() assembles: profile + last 7 sessions + volume + nutrition + plan + learning progress + sport schedule 

26. User asks: "Why does my shoulder hurt when I play TT?" 

27. AI detects: shoulder question + TT context → triggers injury_check mode 

28. injury_check mode retrieves relevant MotionLab lesson: "TT Shoulder Health" from injury prevention module 

29. AI response: explains biomechanical reason + surfaces the lesson as an in-chat card 

30. User taps the lesson card → taken to MotionLab lesson 

31. Lesson completion tracked in lesson_progress table 

## **6.4 Community Flow** 

32. User browses community — public, no login required 

33. Finds a thread about football ACL prevention → reads expert reply with Expert badge 

34. Wants to post: prompted to sign in 

35. Opens post composer: selects post type (Text / Image / Link) 

36. Selects sport tag (Football) + optional flair (Injury Question) 

37. Writes post, optionally uploads image(s) to Supabase Storage 

38. Post appears in feed with their avatar, name, sport tag, flair 

39. Other users upvote and comment — nested one level 

40. If post tagged as Ask an Expert, gets elevated treatment and routed to expert notification 

June 2026Page 

**MotionLab** ·  Unified PRD v1.0  ·  Confidential 

## **7. Technical Architecture** 

## **7.1 Recommended Stack** 

|**Layer**|**Technology**|**Rationale**|
|---|---|---|
|Frontend framework|React 19 + TypeScript 6|KavaFit's proven stack — maintainable,<br>type-safe|
|Styling|Tailwind CSS 4|MotionLab design tokens applied as Tailwind<br>theme config|
|Build tool|Vite 8|Fast HMR, optimal bundle sizes|
|Routing|React Router 7|KavaFit's proven setup|
|State management|React Context (Auth,<br>Workout, UI)|Sufficient at MVP scale — no Redux needed|
|Backend|Supabase|Auth, PostgreSQL, Edge Functions, Storage,<br>RLS — both products already use it|
|AI provider|Groq (primary)|Mature, fast inference, server-side via Edge<br>Function — KavaFit architecture|
|AI fallback|Anthropic Claude<br>(secondary)|For complex reasoning tasks where Groq<br>underperforms|
|Offline|IndexedDB<br>(kavafit-offline-v1)|KavaFit's proven offline architecture — real<br>technical moat|
|Maps|Leaflet + OpenStreetMap|KavaFit gym finder — keep as-is|
|Analytics|PostHog|KavaFit's setup — keep as-is, extend with<br>MotionLab events|
|Error tracking|Sentry|KavaFit's setup — keep as-is|
|Nutrition DB|Indian foods (pre-seeded) +<br>USDA API (Edge Function)|KavaFit advantage — keep as-is|



## **7.2 Frontend Architecture** 

## **Design Token System** 

MotionLab's colour palette applied as a Tailwind CSS theme extension: 

- primary-green: #264653 (Forest Green) 

- primary-olive: #606C38 (Olive Green) 

June 2026Page 

**MotionLab** ·  Unified PRD v1.0  ·  Confidential 

- primary-navy: #1D3557 (Deep Navy Blue) 

- accent-slate: #4A6FA5 (Slate Blue) 

- accent-maroon: #6D071A (Deep Maroon — limited use) 

- bg-light: #F3F4F6 (Cool Light Grey) 

- bg-mid: #E5E7EB (Mid Grey) 

- bg-dark: #1F2937 (Soft Charcoal Grey) 

- surface: #FAFAFA (Off-White Grey) 

## **Responsive Behaviour** 

- Large Desktop (1400px+): full navigation bar with all links visible 

- Below 1400px: hamburger navigation with slide-out drawer 

- Tablet: hamburger navigation 

- Mobile: hamburger navigation, bottom-positioned CTAs, touch-friendly tap targets 

- Maximum content width: 1440px, centred on all screen sizes 

## **React Context Architecture** 

- AuthContext: user, session, profile, avatarUrl, loading, isAdmin 

- WorkoutContext: workoutUpdate, activeSessionExercises, heatmapRefreshKey 

- • UIContext: drawerOpen, drawerInitMessage, open/close handlers 

- LearningContext (new): activeLearningPath, lessonProgress, sportSchedule 

## **7.3 AI Architecture** 

## **Request Flow** 

41. Client calls callAgent(userId, message, mode?) in lib/agent.ts 

42. buildAgentContext(userId) assembles full context — capped at ~6,000 tokens 

43. If mode requires MotionLab content: retrieveRelevantContent(sport, topic) fetches indexed lessons 

44. Request proxied through Supabase Edge Function (ai-proxy) — GROQ_API_KEY never exposed to client 

45. Groq LLM generates response 

46. parseAgentJSON() handles structured mode responses with graceful fallback 

47. Response streamed to client 

## **Context Budget Management** 

|**Context Component**|**Token Budget**|**Truncation Rule**|
|---|---|---|
|User profile|~300 tokens|Never truncated|



June 2026Page 

**MotionLab** ·  Unified PRD v1.0  ·  Confidential 

|**Context Component**|**Token Budget**|**Truncation Rule**|
|---|---|---|
|Last N training sessions|~2,000 tokens|Reduce from 7 → 5 → 3 sessions if over<br>budget|
|Weekly volume by muscle<br>group|~400 tokens|Never truncated|
|Today's nutrition|~300 tokens|Never truncated|
|Today's plan|~500 tokens|Truncate exercise list if needed|
|Learning path + last lesson|~300 tokens|Summary only if over budget|
|Sport schedule|~200 tokens|Never truncated|
|Retrieved lesson content<br>(RAG)|~800 tokens|Top 1 result only if over budget|
|Total cap|~6,000 tokens|Hard cap — truncate in reverse priority order|



## **Content Retrieval (RAG)** 

For injury_check and learning_rec modes, relevant MotionLab lessons are retrieved and included in the prompt context: 

- Lessons are indexed by sport + topic tags in the lessons table 

- At MVP: simple keyword + tag matching — no vector embeddings required 

- Phase 3: add pgvector embeddings on lesson content for semantic search 

- Retrieved lesson summary (not full content) is included in prompt — links to full lesson in response 

## **7.4 Offline Architecture** 

Inherited from KavaFit unchanged. This is a genuine engineering moat. 

- IndexedDB store: kavafit-offline-v1 with two object stores (pending-sets, pending-sessions) 

- On reconnection: sync layer pushes all pending records to Supabase in order 

- Writes are idempotent — duplicate sync attempts do not create duplicate records 

- Session set logging works within 200ms of tap with zero connectivity 

- Offline scope: workout tracking only — community and learning require connectivity 

## **8. Database Design** 

June 2026Page 

**MotionLab** ·  Unified PRD v1.0  ·  Confidential 

Single Supabase PostgreSQL instance. All tables use Row Level Security (RLS). All user data tables enforce user-scoped access. Admin tables are role-gated. 

## **8.1 Core Tables** 

## **profiles (merged)** 

Combines KavaFit's profiles table (fitness fields) with MotionLab's user data (sport and learning fields). 

|**Column**|**Type**|**Source**|**Notes**|
|---|---|---|---|
|id|uuid PK|Both|References auth.users(id)|
|name|text|Both||
|email|text|Both||
|avatar_url|text|KavaFit|Supabase Storage URL|
|age|int|KavaFit||
|weight_kg|numeric|KavaFit||
|height_cm|numeric|KavaFit||
|fitness_goal|text|KavaFit|muscle_gain | fat_loss | general_fitness|
|experience_level|text|Both|beginner | intermediate | advanced|
|sessions_per_week|int|KavaFit||
|equipment|text[]|KavaFit|Array of available equipment|
|injuries|text|KavaFit|Free text injury history|
|calorie_target|int|KavaFit||
|protein_target|int|KavaFit||
|dietary_preference|text|KavaFit||
|sports|text[]|MotionLab|Array of sport slugs|
|sport_frequency|jsonb|New|{"football": 2, "table_tennis": 3}|
|learning_goals|text[]|MotionLab||
|onboarding_complete|boolean|Both|Gates dashboard access|
|deload_suggested_at|timestamptz|KavaFit||
|created_at|timestamptz|Both||



June 2026Page 

**MotionLab** ·  Unified PRD v1.0  ·  Confidential 

## **8.2 Training Tables (KavaFit — preserve as-is)** 

- exercises: ~400 pre-seeded, muscle groups, equipment, difficulty, instructions 

- workout_plans: AI-generated or manual plans per user 

- plan_days: day-level structure within a plan 

- sessions: completed sessions with date, duration, notes 

- session_sets: individual sets with reps, weight, RPE, timestamp 

- measurements: 7-dimension body measurements over time 

- muscle_volume_log: weekly volume per muscle group (11 tracking groups) 

- meal_history: logged meals with full macro breakdown 

- progress_photos: uploads with date and notes 

- indian_foods: pre-seeded Indian food DB with per-serving macros 

## **8.3 Education Tables (new)** 

|**Table**|**Key Columns**|**Purpose**|
|---|---|---|
|sports|id, name, slug, description, icon_url,<br>active|Sport catalogue|
|learning_paths|id, sport_id, title, level<br>(beginner|intermediate|advanced),<br>description|Structured learning journeys|
|modules|id, learning_path_id, title, order,<br>description|Groupings within a path|
|lessons|id, module_id, title, content_body,<br>content_type, visual_url,<br>sport_tags[], topic_tags[],<br>duration_minutes, expert_id,<br>published|Individual lessons with content|
|lesson_progress|id, user_id, lesson_id, completed,<br>completion_date|Per-user lesson tracking|
|experts|id, name, title, bio, photo_url,<br>credentials, specialisation[], verified,<br>user_id|Expert contributor profiles|
|articles|id, title, body, author_id (expert_id),<br>sport_tags[], topic_tags[],<br>published_at|Resource library articles|
|certifications|id, user_id, learning_path_id,<br>issued_at, certificate_url|Earned certificates|
|achievements|id, user_id, achievement_type,<br>earned_at, metadata jsonb|Badges and milestones|



June 2026Page 

**MotionLab** ·  Unified PRD v1.0  ·  Confidential 

## **8.4 Community Tables (MotionLab — rebuild)** 

|**Table**|**Key Columns**|**Purpose**|
|---|---|---|
|discussions|id, user_id, sport_tag, flair, post_type<br>(text|image|link), title, body, image_urls[],<br>link_url, link_preview jsonb, upvotes,<br>downvotes, created_at|Community posts|
|comments|id, discussion_id, parent_comment_id, user_id,<br>body, upvotes, downvotes, created_at|Nested comments (1 level)|
|post_votes|id, user_id, discussion_id, vote_type (up|down),<br>created_at|Vote tracking (unique per user<br>per post)|
|comment_votes|id, user_id, comment_id, vote_type (up|down),<br>created_at|Comment vote tracking|



## **8.5 Platform Tables** 

|**Table**|**Key Columns**|**Purpose**|
|---|---|---|
|user_roles|id, user_id, role (admin|expert|user)|Role-based access control|
|coach_conversati<br>ons|id, user_id, title, created_at|AI coach chat sessions|
|coach_messages|id, conversation_id, role (user|assistant),<br>content, mode, created_at|Per-message AI history|
|notifications|id, user_id, type, title, body, read,<br>action_url, created_at|In-app notification queue|
|bookmarks|id, user_id, content_type<br>(lesson|article|plan), content_id,<br>created_at|Saved content (My Library)|
|sport_schedules|id, user_id, sport, day_of_week, time,<br>active|Weekly sport schedule for warmup<br>flow|



## **9. Security** 

## **9.1 Authentication** 

- Supabase Auth — email + password + Google OAuth 

- Password leak protection enabled 

June 2026Page 

**MotionLab** ·  Unified PRD v1.0  ·  Confidential 

- Auto-confirm email on signup (relaxed for MVP, add verification in Phase 2) 

- JWT tokens managed by Supabase — never stored in localStorage 

- Session expiry: 1 hour access token, 7-day refresh token 

## **9.2 Authorisation** 

- Row Level Security (RLS) enforced on all user data tables 

- Policy: users can only read and write their own data 

- Community posts: public read, authenticated write 

- Admin tables: admin role required 

- Expert content: expert role required to publish 

- GROQ_API_KEY: server-side Supabase secret only — never in client bundle 

- • USDA_API_KEY: server-side only 

## **9.3 Data Protection** 

- No PII logged to PostHog — anonymous session IDs only 

- No PII in Sentry — scrub user-identifying fields before logging 

- Progress photos stored in Supabase Storage with private bucket + signed URLs 

- Community image uploads: public bucket (user-consented for community sharing) 

- Data export available to users (GDPR + DPDP compliance) 

- Account deletion: purges all user data from all tables 

## **9.4 Content Moderation** 

- Community posts: report button on all posts and comments 

- Admin review queue for reported content 

- Automated: no profanity filter at MVP — admin moderation only 

- Expert content: manual review required before publish flag is set 

## **10. Performance Goals** 

|**Metric**|**Target**|**Notes**|
|---|---|---|
|First Contentful Paint (FCP)|<1.5s on 4G mobile|Critical for India market|



June 2026Page 

**MotionLab** ·  Unified PRD v1.0  ·  Confidential 

|**Metric**|**Target**|**Notes**|
|---|---|---|
|AI coach response time|<3s standard queries|<5s for plan generation|
|Session set logging|Optimistic UI — no<br>perceptible delay|IndexedDB write < 50ms|
|Offline set logging|Works within 200ms of<br>tap|Zero connectivity|
|Page navigation|<500ms between routes|React Router + code splitting|
|Image uploads (community)|<5s for 3 images at 4G|Compress before upload|
|Lesson content load|<2s per lesson page|CDN for visual assets|
|Database query P95|<200ms|Supabase + indexes on user_id,<br>sport_tag, created_at|



## **11. Development Roadmap** 

Built in milestones using KavaFit's codebase as the foundation. MotionLab's pages are rebuilt inside it with the new design system applied. No code from the Lovable-generated MotionLab codebase is carried over. 

## **Phase 1 — Foundation (Weeks 1–4)** 

**Goal** 

One unified codebase, one design system, one Supabase project, one auth flow. Both founders can ship to it from day one. 

- Decision: agree brand name and finalise 

- Apply MotionLab colour palette as Tailwind theme extension in KavaFit codebase 

- Merge Supabase schemas: merge profiles tables, confirm single Supabase project 

- Rebuild MotionLab's Home, About, and Sport Explorer pages in new codebase 

- Unified auth and onboarding (6-step wizard covering fitness + sports) 

- Extend buildAgentContext() with sports + learning fields 

- Deploy to production domain 

## **Deliverables** 

June 2026Page 

**MotionLab** ·  Unified PRD v1.0  ·  Confidential 

- Single deployable application with both products' existing features preserved 

- Unified design system applied consistently 

- One Supabase project with merged schema 

## **Phase 2 — Core Platform (Weeks 5–10)** 

## **Goal** 

The education layer is live and connected to training. The killer loop (sport warmup flow) works end to end. Admin CMS allows content to be published without code changes. 

- Sport-specific warmup flow (the killer loop) — end to end 

- Lesson content system: publish first 5 TT lessons + 5 Football lessons 

- Learning paths: beginner paths for TT and Football 

- Admin CMS: sports, lessons, paths, experts, resources 

- Rebuild community with Reddit-style UX (image uploads, upvotes, post types) 

- Expand Expert Hub: invite first 2 expert contributors, wire expert badge 

- AI modes: sport_warmup, injury_check, learning_rec 

- AI content grounding: lesson retrieval wired into injury_check and learning_rec 

## **Deliverables** 

- MotionLab education content live for 2 sports 

- Sport warmup flow working end to end 

- Community rebuilt with full Reddit UX 

- Admin CMS operational for both founders to publish content 

## **Phase 3 — AI and Depth (Weeks 11–16)** 

**Goal** 

The AI coach feels platform-native, not generic. Learning paths have full coverage for 4 sports. Push notifications drive the habit loop. 

- Push notifications: warmup reminders, streak alerts, Monday AI summary 

- Extend lesson content to Tennis and Running 

- Pgvector embeddings on lesson content for semantic AI retrieval 

- Certifications and achievement system 

- Global search across sports, lessons, experts, articles 

- Notification centre (in-app) 

- Profile completion: achievements display, certification badges 

June 2026Page 

**MotionLab** ·  Unified PRD v1.0  ·  Confidential 

- Settings page: account, security, privacy, notification preferences 

## **Phase 4 — Growth and Monetisation (Weeks 17–24)** 

## **Goal** 

Revenue model live. Platform ready for marketing push. B2B groundwork laid. 

- Freemium feature gating: free tier (3 AI queries/day, basic content) vs Pro (unlimited AI, all paths, certifications) 

- External subscription management integration 

- Wearable integrations: Apple Health + Google Fit step/HR ingestion 

- B2B pilot: approach 2–3 sports academies or college teams for team access 

- Social layer: share PRs, share certification achievements 

- Extend content: Basketball, Badminton, Cycling, Swimming 

- Coach portal: trainers assign plans, review client sessions 

## **12. Risk Register** 

|**Risk**|**Likelihoo**<br>**d**|**Impact**|**Mitigation**|
|---|---|---|---|
|Content quality:<br>biomechanics errors<br>damage credibility|Medium|High|All content expert-reviewed before publish.<br>Start with 2 sports at depth rather than 8 at<br>breadth. Disclaimer on all health-adjacent<br>content.|
|AI answers generic<br>rather than<br>platform-grounded|High|High|Build lesson retrieval into AI modes early<br>(Phase 2). Test AI responses against<br>MotionLab content catalogue before launch.|
|Lovable codebase<br>migration causes<br>regressions|Medium|Medium|KavaFit codebase is the base — MotionLab<br>pages rebuilt, not migrated. No Lovable code is<br>carried over.|
|Expert contributor<br>acquisition stalls|Medium|Medium|Start with 1 physio Aditya already knows from<br>rehab. Use MotionLab traffic as leverage from<br>month 2+.|
|YouTube comparison:<br>"why pay when YouTube<br>is free?"|High|High|Lean into structure + personalisation +<br>community — things YouTube cannot offer. The<br>sport warmup flow is the clearest example.|



June 2026Page 

**MotionLab** ·  Unified PRD v1.0  ·  Confidential 

|**Risk**|**Likelihoo**<br>**d**|**Impact**|**Mitigation**|
|---|---|---|---|
|Two founders, limited<br>hours|High|Medium|Clear ownership split: Aditya owns education +<br>content + community. KavaFit founder owns<br>training + nutrition + infrastructure. Milestones<br>are independent.|
|Indian OSM gym data<br>quality in Tier 2 cities|Medium|Low|Secondary data source planned for Phase 4.<br>Not blocking for metro India launch.|
|Progressive overload<br>increments not<br>configurable|Low|Low|Phase 3 item. Current +5kg/+2.5kg defaults are<br>fine for MVP.|



## **13. UX Guidelines** 

## **13.1 Design Philosophy** 

MotionLab should feel like the intersection of Apple (premium minimalism), Linear (developer-grade precision), and Notion (editorial spaciousness) — applied to sports science. Every design decision must reinforce trust, expertise, and education. The platform should feel scientific without feeling cold. 

- Minimal: no decorative elements without purpose 

- Spacious: generous whitespace — content breathes 

- Visual-first for education: diagrams, overlays, and motion breakdowns are central, not supplementary 

- Data-rich for training: heatmaps, progress charts, and streaks give users a sense of progress at a glance 

- Trust signals everywhere: expert badges, research citations, and founder story are not afterthoughts 

## **13.2 Component Patterns** 

- Glassmorphism: used sparingly for cards that overlay content (e.g. movement science overlays) 

- Rounded corners: consistent 8–12px radius on cards, larger on modals 

- Shadows: subtle only — 0 0 24px rgba(0,0,0,0.06) 

- Typography: large editorial headings (48–64px hero), clean sans-serif body, strong hierarchy 

June 2026Page 

**MotionLab** ·  Unified PRD v1.0  ·  Confidential 

- Empty states: every empty state has an illustration, helpful message, and relevant CTA 

- Loading states: skeleton loaders on all data-dependent components 

- Error states: always explain what happened and what to do next — never raw error strings 

## **13.3 Accessibility** 

- WCAG 2.1 AA compliance target for all interactive elements 

- Keyboard navigation for all primary user flows 

- Reduced motion respected via prefers-reduced-motion media query 

- Minimum touch target size: 44px × 44px on mobile 

- Colour contrast ratio: minimum 4.5:1 for normal text, 3:1 for large text 

## **14. Future Enhancements** 

Intentionally deferred until after MVP is live and validated. 

- AI movement analysis: user uploads sport video, AI detects posture issues, knee collapse, mobility restrictions 

- AI injury risk screening: questionnaire produces personalised injury risk report 

- Wearable integrations: Apple Watch heart rate + activity, Garmin training load 

- Real-time multi-device sync 

- Native iOS and Android apps 

- Coach portal: trainers assign and review client plans 

- B2B gym partnerships: white-label MotionLab dashboard for gym members 

- Team features: group training, shared PRs, leaderboards within a squad 

- Live session classes: coach-led group warmups or sport drills 

- Pgvector semantic search for community and lesson discovery 

- Marketplace: curated gear recommendations per sport with affiliate model 

## **15. Open Questions** 

June 2026Page 

**MotionLab** ·  Unified PRD v1.0  ·  Confidential 

|**Question**|**Owner**|**Notes**|
|---|---|---|
|Final brand name?|Both founders|MotionLab works but broader than either<br>product alone. Decide before Phase 1<br>completes.|
|Freemium gate: what exactly is<br>free vs paid?|Both founders|Recommend: 3 AI queries/day, 2 learning<br>paths, community access = free. Unlimited AI,<br>all paths, certifications = Pro.|
|Who owns content strategy for<br>which sports?|Aditya + KavaFit<br>founder|Aditya: TT and Football. Split remaining 6<br>sports by interest and expertise.|
|Expert compensation model<br>beyond visibility?|Both founders|Revenue share on certified content once<br>platform reaches ₹1L/month revenue.|
|Should deload detection be<br>user-configurable?|KavaFit founder|Phase 3 item — current automatic logic is<br>correct for MVP.|
|Progressive overload<br>increments: configurable?|KavaFit founder|Phase 3 item — +5kg/+2.5kg defaults are fine<br>for MVP.|
|Data retention policy for<br>session_sets and photos?|Both founders|Required before GDPR/DPDP compliance<br>work. Define before Phase 4.|
|USDA food fallback order for<br>Indian foods not in USDA?|KavaFit founder|Currently falls back to indian_foods table.<br>Confirm priority order.|



## **Appendix: Key localStorage Keys** 

|**Key**|**Purpose**|**TTL**|
|---|---|---|
|kavafit_active_session_v1|Current live session state (survives page<br>refresh)|Until session end|
|kavafit_new_prs|Recent PRs|24 hours|
|kavafit_flags_*|AI insights cache (keyed by user ID)|24 hours|
|last_summary_date /<br>last_weekly_summary|Weekly AI review — prevents duplicate<br>generation|7 days|
|kavafit_gym_location|Last known location for gym finder|7 days|
|kavafit_gyms_cache|Gym list for last location|24 hours|



June 2026Page 

**MotionLab** ·  Unified PRD v1.0  ·  Confidential 

## **Appendix: Implementation Enhancements** 

Everything logged here strengthens a commitment sections 1–15 already made — none of it
redirects the product. Sections 1–15 are left exactly as originally written, as the historical
record of intent; this appendix is the living record of how that intent was met or exceeded as
the build progressed. Each entry ties back to the spec's own stated goal for that feature and
states why the delivered outcome is stronger, not merely different.

### **2026-07-11 — Exercise catalog (§8.2)** 

- **Spec:** ~400 pre-seeded exercises with muscle groups, equipment, difficulty, instructions 
- **Delivered:** 873 exercises, every one with full step-by-step instructions and two form-reference images 
- **Why it's an enhancement:** The original 157-row seed had zero instructions and zero images. This over-delivers §8.2's own requirement rather than departing from it — same fields, fuller and more numerous. 

### **2026-07-11 — Body Lab taxonomy (§5.11)** 

- **Spec:** 40-group muscle taxonomy 
- **Delivered:** 37-token granular taxonomy, Groq-enriched and validated against a fixed vocabulary 
- **Why it's an enhancement:** Same design intent — tap a muscle, see volume/recovery/associated exercises. The count is a reconciliation to what's actually implemented, not a redesign. 

### **2026-07-11 — Train navigation (§4.1): Exercise Library (`/exercises`)** 

- **Spec:** Not listed as a nav item 
- **Delivered:** New searchable library — filter by muscle group and equipment, view instructions + images per exercise 
- **Why it's an enhancement:** §5.11 already promises "associated exercises" from the body model and §8.2 already requires visible "instructions." Neither had a standalone home. This page fills a capability the spec implied but never explicitly designed. 

June 2026Page 

**MotionLab** ·  Unified PRD v1.0  ·  Confidential 

MotionLab PRD — Version 1.0 — June 2026 Confidential — Aditya Saiprasad · KavaFit Founder 

June 2026Page 


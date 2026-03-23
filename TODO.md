# Teacher Platform — PRD Implementation TODO

> Based on [`teacher-platform-prd.md`](./teacher-platform-prd.md)
> Tracks all work needed to transform the platform from a passive analytics dashboard into an **AI-Powered Placement Management System**.

---

## Current Codebase Baseline

The existing platform is a **Next.js** app with:

| Layer | What Exists |
|-------|-------------|
| **Pages** | Login, Dashboard Overview, Students list, Teachers list, Traffic & Visitors |
| **Components** | Sidebar (4 nav links), Header, StatCard, ThemeToggle, charts (Area, Donut, Bar) |
| **API layer** | `lib/api.ts` — login, university analytics, students, teachers, traffic, AI usage |
| **Types** | University, Student, Teacher, UniversityAnalytics, AnalyticsSummary, AdminDashboard, Session, Visitor, AuthUser |

---

## Phase 1 — Class Creation System (PRD §6.1) ✅

### 1.1 Backend (NestJS Core)
- [x] Design `Class` MongoDB schema (name, department, semester, classCode, inviteLink, teacherId, universityId, students[], createdAt)
- [x] Create `ClassesModule` — controller + service
- [x] `POST /classes` — Create a class (auto-generate class code & invite link)
- [x] `GET /classes` — List classes for the logged-in teacher
- [x] `GET /classes/:id` — Get class details with student roster
- [x] `POST /classes/:id/enroll` — Enroll student(s) via code, link, or CSV
- [x] `DELETE /classes/:id` — Delete / archive a class
- [x] `PATCH /classes/:id` — Update class metadata
- [ ] Add CSV bulk-upload endpoint (multipart/form-data)
- [ ] Write unit tests for ClassesService
- [ ] Write e2e tests for Class endpoints

### 1.2 Frontend (Next.js — ai-interview-teacher)
- [x] Add `Class` type to `types/index.ts`
- [x] Add class API methods to `lib/api.ts` (createClass, getClasses, getClass, enrollStudents, deleteClass, updateClass)
- [x] Create `/dashboard/classes` page — list all classes with stats
- [x] Create `/dashboard/classes/new` page — class creation form (name, department, semester)
- [x] Create `/dashboard/classes/[id]` page — class detail dashboard
  - [x] Show total students, active vs inactive ratio
  - [ ] Show assignment completion rate (once Phase 2 done)
  - [x] Show student roster table with enrollment actions
- [x] Add class code display + copy button + shareable invite link
- [ ] Add CSV upload UI for bulk student enrollment
- [x] Add "Classes" nav item to `Sidebar.tsx` (with `School` icon)
- [x] Add empty-state illustrations for no classes / no students

---

## Phase 2 — Interview Assignment System (PRD §6.2)

### 2.1 Backend (NestJS Core)
- [x] Design `Assignment` MongoDB schema (title, classId, teacherId, topic, difficulty, numInterviews, deadline, assignedTo[], status, createdAt)
- [x] Design `StudentAssignment` schema (assignmentId, studentId, status [Assigned → In Progress → Completed → Evaluated], score, completedAt)
- [x] Create `AssignmentsModule` — controller + service
- [x] `POST /assignments` — Create assignment (topic, difficulty, count, deadline, class or student list)
- [x] `GET /assignments` — List assignments for teacher (with filters)
- [x] `GET /assignments/:id` — Assignment detail with per-student progress
- [x] `PATCH /assignments/:id` — Update assignment (extend deadline, etc.)
- [x] `DELETE /assignments/:id` — Cancel/delete assignment
- [x] Implement assignment lifecycle state machine (Assigned → In Progress → Completed → Evaluated)
- [ ] Integrate with AI Backend (FastAPI) to auto-evaluate and score on interview completion
- [ ] Write unit tests for AssignmentsService
- [ ] Write e2e tests for Assignment endpoints

### 2.2 Frontend (Next.js — ai-interview-teacher)
- [x] Add `Assignment`, `StudentAssignment` types to `types/index.ts`
- [x] Add assignment API methods to `lib/api.ts`
- [x] Create `/dashboard/assignments` page — list all assignments with status/completion %
- [x] Create `/dashboard/assignments/new` page — assignment creation form
  - [x] Topic selector (DSA, DBMS, OS, HR, etc.)
  - [x] Difficulty level selector
  - [x] Number of interviews input
  - [x] Deadline date picker
  - [x] Class / individual student selector
- [x] Create `/dashboard/assignments/[id]` page — assignment tracking dashboard
  - [x] Completion % progress bar
  - [x] Average score display
  - [x] Weak topics breakdown
  - [x] Per-student status table (Assigned / In Progress / Completed / Evaluated)
- [x] Add "Assignments" nav item to `Sidebar.tsx`

### 2.3 Student-Side (Candidate Portal)
- [x] Show pending assignments on student dashboard
- [x] Show assignment deadlines & countdown
- [x] Show assignment results & AI score after evaluation
- [x] Link assignment interviews to assignment tracking
- [x] Build `/student/assignments` dashboard for candidates

---

## Phase 3 — Intelligent Alert System (PRD §6.3)

### 3.1 Backend (NestJS Core)
- [x] Design `Alert` MongoDB schema (type, category [Engagement/Performance/Risk/Usage], message, teacherId, universityId, studentIds[], isRead, createdAt)
- [x] Create `AlertsModule` — controller + service
- [x] `GET /alerts` — Fetch alerts for teacher (with pagination + filters)
- [x] `PATCH /alerts/:id/read` — Mark alert as read
- [x] Implement alert generation triggers:
  - [x] Engagement: "X students inactive for 7+ days"
  - [x] Engagement: Activity drop detection
  - [x] Performance: Weak topic identification
  - [x] Performance: Low score alerts
  - [x] Risk: At-risk student detection (low activity + low score)
  - [x] Usage: Near-quota exhaustion warnings
- [x] Implement alert delivery (integrated with backend alerts system)
- [x] Manual trigger for alert checks via `POST /alerts/trigger-checks`
- [ ] Write unit tests for AlertsService

### 3.2 Frontend (Next.js — ai-interview-teacher)
- [x] Add `Alert` type to `types/index.ts`
- [x] Add alert API methods to `lib/api.ts`
- [x] Create notification bell icon in `Header.tsx` with unread count badge
- [x] Create notification center page (`/dashboard/alerts`)
  - [x] Alert cards grouped by category (Engagement, Performance, Risk, Usage)
  - [x] Mark-as-read functionality
  - [x] Click-through to affected students
- [x] Add "Alerts" nav item to `Sidebar.tsx` (with `Bell` icon + unread badge)

---

## Phase 4: Feedback Layer (Mentorship) ✅
- [x] **Backend (NestJS)**
    - [x] Create `Feedback` schema (teacherId, studentId, type, content, rating, suggestions).
    - [x] Create `FeedbackModule` with controller and service.
    - [x] Implement CRUD endpoints for feedback.
- [x] **Teacher Portal (Next.js)**
    - [x] Add `Feedback` types and API integration (`lib/api.ts`).
    - [x] Build `FeedbackModal` component with modern UI.
    - [x] Add "Give Feedback" actions to class and assignment roster tables.
    - [x] Build `/dashboard/feedback` history page for teachers.
- [x] **Student Portal (React/Vite)**
    - [x] Add `Feedback` types and API integration.
    - [x] Build Feedback Inbox / Page to view mentor guidance.
    - [x] Add "New Feedback" notification/indicator on student dashboard.
- [ ] Write unit tests for FeedbackService

### 4.2 Frontend — Teacher Side (ai-interview-teacher)
- [x] Add `Feedback` type to `types/index.ts`
- [x] Add feedback API methods to `lib/api.ts`
  - [x] Text input for feedback content
  - [x] Optional star/numeric rating
  - [x] Feedback type selector (Interview / Resume / General)
- [x] Create `/dashboard/feedback` page — list all feedback given by teacher
- [x] Add ability to add feedback from assignment evaluation view
- [x] Add "Feedback" nav item to `Sidebar.tsx` (with `MessageSquare` icon)

### 4.3 Frontend — Student Side (Candidate Portal)
- [x] Create feedback inbox on student dashboard
- [x] Link feedback to relevant interview/resume/assignment
- [x] Show actionable suggestions per feedback entry

---

## Phase 5 — AI-Generated Insights (PRD §6.5) ✅

### 5.1 Backend — NestJS (Aggregation Pipelines)
- [x] Implement weakness detection aggregation across interviews in `AnalyticsService`
- [x] Implement improvement trajectory calculation
- [x] Implement risk detection model (low activity + low score → at-risk)
- [x] Implement high-potential / placement-ready detection
- [x] Generate natural-language insight summaries (e.g., "Top 5 Weaknesses")
- [x] Build endpoint `GET /analytics/teacher-insights` to fetch aggregate reports

### 5.2 Frontend (Next.js — ai-interview-teacher)
- [x] Add insight types to `types/index.ts`
- [x] Add insight API methods to `lib/api.ts`
- [x] Create `/dashboard/insights` page — AI insight dashboard
  - [x] Top 5 capability gaps / weak subjects
  - [x] Risk detection list (at-risk students)
  - [x] High-potential / placement-ready students list
- [x] Add "Insights" nav item to `Sidebar.tsx` (with `Brain` icon)

---

## Phase 6 — Scoring Evolution (PRD §8)

- [ ] Design `PlacementReadinessScore` model incorporating:
  - [ ] Interview performance weight
  - [ ] Consistency metric
  - [ ] Assignment completion rate
  - [ ] Resume quality score
- [ ] Replace/augment existing usage-based leaderboard score
- [ ] Backend endpoint to calculate and return readiness score per student
- [ ] Display readiness score on student profiles and leaderboard
- [ ] Display readiness score breakdown on class dashboard

---

## Phase 7 — Cross-Cutting Concerns

### 7.1 Navigation & Layout
- [ ] Update `Sidebar.tsx` to include all new nav items (Classes, Assignments, Alerts, Feedback, Insights)
- [ ] Add collapsible sidebar sections (Analytics | Management | AI)
- [ ] Ensure responsive mobile navigation

### 7.2 Types & API Layer
- [ ] Ensure all new types are properly defined in `types/index.ts`
- [ ] Ensure all new API endpoints are added to `lib/api.ts`
- [ ] Add proper error handling and loading states to all new pages

### 7.3 Shared Components
- [ ] Build reusable data table component (sorting, filtering, pagination)
- [ ] Build reusable form components (inputs, selects, date pickers)
- [ ] Build reusable modal/dialog component
- [ ] Build reusable empty-state component
- [ ] Build reusable notification toast component

### 7.4 Export & Reporting
- [ ] Extend existing `.xlsx` export to include class/assignment data
- [ ] Add PDF report generation for class progress
- [ ] Add email report triggers for new modules

---

## Implementation Priority (Suggested Order)

| Priority | Feature | Reason |
|----------|---------|--------|
| **P0** | Phase 1 — Class System | Foundation for all other features |
| **P1** | Phase 2 — Assignments | Core value prop — structured practice |
| **P1** | Phase 7.3 — Shared Components | Needed by all feature pages |
| **P2** | Phase 3 — Alerts | Enables proactive intervention |
| **P2** | Phase 4 — Feedback | Human mentorship layer |
| **P3** | Phase 5 — AI Insights | Requires data from Phases 1-4 |
| **P3** | Phase 6 — Scoring Evolution | Requires data from all modules |
| **P4** | Phase 7 — Cross-Cutting | Polish & refinement |

---

> **Total estimated items: ~100+ tasks across frontend, NestJS backend, and FastAPI AI backend.**

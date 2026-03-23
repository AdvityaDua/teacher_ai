# Teacher Platform (Institute Faculty Portal)
## AI Career Operating System

---

## 1. 📌 Context

The **Teacher Platform** (`ai-interview-teacher`) is a core module in the AI Career ecosystem, which includes:

- **Candidate Portal** → Students practice AI interviews & build resumes
- **Core Backend (NestJS)** → Handles authentication, institutions, analytics
- **AI Backend (FastAPI)** → Performs interview evaluation, scoring, insights

The Teacher Platform acts as a **control + intelligence layer** for universities, enabling faculty to manage placement readiness at scale.

---

## 2. 🎯 Product Vision

Transform the platform from:

> ❌ Passive analytics dashboard → ✅ AI-Powered Placement Management System

Teachers should be able to:

- Assign structured interview practice
- Monitor student performance in real time
- Receive AI-driven insights
- Intervene proactively

---

## 3. 👥 Users

**Primary User: Teachers / Faculty**
- Manage classes and students
- Improve placement readiness

**Secondary Users:**
- Admins (institution-level monitoring)
- Students (receive assignments, feedback, guidance)

---

## 4. 🧱 Existing Features (Baseline)

### 4.1 Institute Analytics
- Sessions, traffic, device distribution
- Geographic insights
- Topic trends

### 4.2 Student Tracking
- Leaderboard (usage-based score)
- Interview + resume usage
- Active / inactive segmentation
- Near-limit tracking

### 4.3 Reporting
- Export `.xlsx` reports
- Email summaries

---

## 5. 🚨 Problem Statement

Current system limitations:

- Focuses on **monitoring, not action**
- Teachers cannot:
  - Assign structured tasks
  - Provide systematic guidance
  - Intervene effectively

> **Result: Low control over outcomes**

---

## 6. 🚀 Feature Enhancements

---

### 6.1 📚 Class Creation System

**Objective:** Enable structured grouping of students into classes/batches.

#### Class Creation
- Class name (e.g., "CSE 4th Year A")
- Department
- Semester
- Auto-generated class code & invite link

#### Student Enrollment
- Join via class code, invite link, or bulk CSV upload

#### Class Dashboard
- Total students
- Active vs inactive ratio
- Average interview score
- Assignment completion rate

**Impact:** Organized management, batch-level control, and the foundation for all future features.

---

### 6.2 🎯 Interview Assignment System

**Objective:** Introduce structured, goal-driven interview practice.

#### Assignment Creation

Teacher selects:
- Topic (DSA, DBMS, OS, HR)
- Difficulty level
- Number of interviews
- Deadline
- Assign to entire class or selected students

#### Assignment Lifecycle
`Assigned` → `In Progress` → `Completed` → `Evaluated (AI score generated)`

#### Tracking Dashboard

| View | Details |
|------|---------|
| **Teacher** | Completion %, average score, weak topics |
| **Student** | Pending assignments, deadlines, results & performance |

**Future Scope:** AI-generated assignments, adaptive difficulty.

---

### 6.3 🚨 Intelligent Alert System

**Objective:** Enable real-time intervention using system + AI signals.

#### Alert Types

| Category | Examples |
|----------|---------|
| **Engagement** | "X students inactive for 7 days", activity drop |
| **Performance** | Weak topics, low scores |
| **Risk** | At-risk students |
| **Usage** | Near quota exhaustion |

#### Delivery
- Dashboard notifications
- Email alerts

#### Teacher Actions
- Assign new tasks
- Send reminders
- View affected students

**Impact:** Prevents disengagement, enables timely intervention.

---

### 6.4 🧑‍🏫 Feedback Layer

**Objective:** Introduce human mentorship over AI evaluation.

#### Feedback Types
- Interview feedback
- Resume feedback
- General performance

#### Teacher Interface
- Comment on assignments and student profiles
- Add text feedback with optional rating

#### Student Interface
- Feedback inbox linked to performance
- Actionable suggestions

**Impact:** Builds trust, improves the learning loop, adds personalization.

---

### 6.5 🤖 AI-Generated Insights

**Objective:** Convert raw data into actionable intelligence.

#### Data Sources
- Interview scores (AI backend)
- Usage patterns
- Assignment data

#### Insight Types

| Level | Insights |
|-------|---------|
| **Class-Level** | Weak subject areas, engagement trends |
| **Student-Level** | Strengths & weaknesses, improvement trajectory |
| **Risk Detection** | Low activity + low score students |
| **High Potential** | Placement-ready students |

#### Output Channels
- Dashboard insight cards
- Weekly reports

#### Example Insights
- *"30% students weak in DBMS"*
- *"Assign OS interviews to improve class performance"*
- *"Top 10 students ready for placement"*

**Impact:** Reduces teacher cognitive load, enables data-driven decisions.

---

## 7. 🔄 End-to-End Workflow

### Teacher Flow
1. Create class
2. Add students
3. Assign interviews
4. Monitor progress
5. Receive insights
6. Provide feedback
7. Act on alerts

### System Flow
1. Student performs interview
2. AI evaluates (FastAPI)
3. Data stored (MongoDB via NestJS)
4. Analytics generated
5. Dashboard updates
6. Alerts & insights triggered

---

## 8. 📊 Scoring Evolution

| Current | Future |
|---------|--------|
| Usage-based score | **Placement Readiness Score** |
| | Interview performance |
| | Consistency |
| | Assignment completion |
| | Resume quality |

---

## 9. 🧩 Technical Requirements

### Frontend (Next.js)
- Class module UI
- Assignment interface
- Notification center
- Feedback system
- Insight dashboard

### Backend (NestJS)
- Class APIs
- Assignment engine
- Alert system
- Feedback storage
- Aggregation pipelines

### AI Backend (FastAPI)
- Interview scoring
- Weakness detection
- Insight generation

---

## 10. 🚀 Future Enhancements

- Placement prediction per student
- Cross-class comparison
- Recruiter integration
- University benchmarking

---

## 11. 🏁 Final Positioning

> **👉 AI Placement Command Center for Universities**

Teachers evolve into **Mentors**, **Analysts**, and **Placement Strategists**.

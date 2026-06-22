# 🐾 Dog Training Web App — Functional Specification (v1)

## 1. Product Overview
A gamified dog‑training companion app that helps owners build consistent habits, track progress, and collaborate with a partner. The app focuses on walks, training sessions, behaviour tracking, and guided milestones, with an RPG‑style progression system.

Target users:
- New dog owners
- Puppy owners
- Couples/families sharing dog responsibilities

Platforms:
- Web app (mobile‑first)
- Optional PWA support later

---

## 2. Core Features

### 2.1 Authentication & Accounts
- Google Login via Firebase Authentication
- Each user has a profile
- Users can join a shared dog profile via invite link or code
- A dog profile can have multiple owners (max 2 for v1)

**User Data:**
- User ID  
- Email  
- Display name  
- Linked dog profiles  

---

### 2.2 Dog Profile
Each dog has:
- Name, breed, age, photo
- Training level (XP system)
- Behaviour tags (e.g., anxious, excitable, reactive)
- Custom goals (e.g., “stop pulling on lead”)

---

### 2.3 Walk Tracking
Two modes:

#### Manual Logging
- Duration
- Distance (optional)
- Notes
- Timestamp
- Optional weather tag (future)

#### Gamification
- Walks give XP
- Streaks for daily walks
- Achievements (e.g., “5 days in a row”, “10km week”)

---

### 2.4 Training Sessions
Users can log structured training sessions.

**Session Types:**
- Sit / Stay / Recall
- Loose‑lead walking
- Crate training
- Custom sessions

**Session Data:**
- Date
- Duration
- Difficulty
- Success rating (1–5)
- Notes
- XP gained

**Guided Training:**
- Step‑by‑step guides
- Suggested frequency
- Optional videos/illustrations (future)

---

### 2.5 Milestones & Progression
A milestone system that feels like levelling up a character.

**Examples:**
- Loose lead for 5 minutes
- Recall from 10m
- Calm settle for 2 minutes
- Walk past another dog calmly

Each milestone:
- Has a checklist
- Awards XP
- Unlocks next milestone in the chain

---

### 2.6 Behaviour Tracking
Quick‑tap behaviours:
- Barking
- Reactivity
- Anxiety
- Pulling
- Jumping
- Calmness / focus / recall success

**Stored as:**
- Timestamp
- Behaviour type
- Optional note

Used for:
- Weekly behaviour trends
- Suggestions

---

### 2.7 Suggestions & Insights
Based on:
- Walk frequency
- Training logs
- Behaviour patterns
- Missed milestones

Examples:
- “You haven’t practiced recall in 5 days.”
- “Pulling increased this week.”
- “Great job keeping a 7‑day walk streak.”

---

### 2.8 Shared Ownership
- Both owners can log walks, training, behaviours
- Activity feed shows who did what
- Shared goals
- Optional notifications later

---

## 3. Gamification System

### 3.1 XP Sources
- Walks
- Training sessions
- Completing milestones
- Streaks
- Behaviour improvements

### 3.2 Levels
- Dog levels up (cosmetic + motivational)
- Unlocks badges
- Unlocks new milestone chains

### 3.3 Badges
Examples:
- Explorer — 50 walks
- Calm Pup — 10 calm logs in a week
- Recall Rookie — first recall milestone

---

## 4. Technical Architecture

### 4.1 Frontend
- React / Next.js
- TailwindCSS or Material UI
- Optional PWA support

### 4.2 Backend
- Firebase Authentication
- Firestore for all data
- Firebase Storage for dog photos
- Optional Cloud Functions for:
  - Insights generation
  - Cleanup tasks
  - Notifications

---

## 5. Firestore Data Model (v1)

### `users/{userId}`
- name  
- email  
- dogs: [dogId]  

### `dogs/{dogId}`
- name  
- breed  
- age  
- owners: [userId]  
- xp  
- level  
- createdAt  

### `dogs/{dogId}/walks/{walkId}`
- duration  
- distance  
- notes  
- timestamp  
- userId  

### `dogs/{dogId}/training/{sessionId}`
- type  
- duration  
- rating  
- notes  
- timestamp  
- xp  

### `dogs/{dogId}/behaviours/{behaviourId}`
- type  
- timestamp  
- note  

### `dogs/{dogId}/milestones/{milestoneId}`
- name  
- completed  
- completedAt  

---

## 6. Roadmap

### MVP
- Google login
- Create dog profile
- Log walks
- Log training sessions
- Basic XP + levelling
- Shared ownership
- Behaviour logs
- Simple insights

### Phase 2
- Milestone chains
- Achievements
- Weekly summaries
- Better insights
- PWA offline mode

### Phase 3
- GPS walk tracking
- Video guides
- AI‑generated suggestions
- Community features

---

## 7. Non‑Functional Requirements
- Mobile‑first
- Fast load (<1s repeat visits)
- Secure (Firestore rules)
- Accessible (WCAG AA)
- Scalable (Firestore auto‑scales)

---

## 8. Branding & Tone
Friendly, encouraging, non‑judgmental.  
Think: “Duolingo for dog training” but without the guilt trips.

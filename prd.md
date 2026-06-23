# Lesson 1: Princess Outfits

## MVP Outline

---

### Screen 0: Princess Registry (Authentication & Onboarding)

#### Student Instructions

**Heading 1:** 🏰 Welcome to the Kingdom!

**Text:** Create your secret princess keys to step into the castle dressing room!

#### Account Creation Form

| Field | Label |
|-------|-------|
| Input Box 1 | Choose a Username |
| Input Box 2 | Choose a Password |
| Input Box 3 | What Princess Name would you like to be called? *(e.g., Princess Sarah, Princess Maya)* |

**Button:** `[ Create Account & Enter 🔑 ]`

---

### Screen 1: The Princess Dressing Room (Exercise 1)

#### Student Instructions

**Heading 1:** 👑 Dress Up the Princess!

**Text:** Welcome, `{Chosen Princess Name}`! Tap different items in the princess closet to change the princess's outfit. See how many unique styles you can design!

#### Princess Closet Setup

**Category 1: Sparkly Crowns**
- 👑 Gold Tiara
- 💎 Diamond Crown

**Category 2: Princess Gowns**
- 👗 Pink Ballgown
- 🟣 Purple Dress
- 🟢 Emerald Gown

#### Interaction Logging
*(App updates this as kids try outfits)*

**Text:** Unique Princess Looks Found:

> Show combinations here as they are tried, e.g., 👑 + 👗

**Text:** Total Unique Found: `0 / 6`

#### Challenge Question

**Text:** How many completely unique princess looks can you make in total? *(An outfit is 1 crown and 1 dress)*

**Input Box:** `[ ]`

**Button:** `[ Submit ]`

#### Answer Feedback

- **If Correct (6):** *"Magical, {Chosen Princess Name}! You found all 6 combinations perfectly. Let's look at a the trick to see why that works."*
- **If Incorrect:** *"Not quite, {Chosen Princess Name}! Let's jump into a secret palace trick to see how to easily count them all without losing track."*

---

### Screen 2: The Explanatory Lesson (Step-by-Step Animation)

#### Step 1: Clear the Slate

**Lesson Text:** When you were dressing up our princess, did you lose track of your choices? Let's start with a clean slate and use the **Anchor Trick**!

**Stick Figure Visual:** Bare princess figure. Empty outfit log.

#### Step 2: The First Anchor

**Lesson Text:** **Step 1:** Place the Gold Tiara 👑 on the princess and **LOCK 🔒** it there! We won't touch it or change it yet.

**Stick Figure Visual:** Princess wearing the Gold Tiara with a little padlock icon over it.

#### Step 3: Cycling the Gowns

**Lesson Text:** **Step 2:** While keeping the Gold Tiara locked, try every single dress one by one.

- Gold Tiara + Pink Ballgown 👗
- Gold Tiara + Purple Dress 🟣
- Gold Tiara + Emerald Gown 🟢

That makes **3 beautiful outfits** just for the Gold Tiara!

**Stick Figure Visual:** Princess quickly switches through the 3 dresses.

**Tree Diagram / Log Visual:**

```
👑 Gold Tiara ─── 👗 Pink Gown
              ─── 🟣 Purple Dress
              ─── 🟢 Emerald Gown
```

#### Step 4: The Second Anchor

**Lesson Text:** **Step 3:** Now, swap the top to the Diamond Crown 💎 and lock it! Do the exact same thing with the dresses.

- Diamond Crown + Pink Ballgown 👗
- Diamond Crown + Purple Dress 🟣
- Diamond Crown + Emerald Gown 🟢

That's another **3 beautiful outfits**!

**Tree Diagram / Log Visual:**

```
👑 Gold Tiara     ─── 👗 Pink, 🟣 Purple, 🟢 Emerald (3)
💎 Diamond Crown  ─── 👗 Pink, 🟣 Purple, 🟢 Emerald (3)
```

#### Step 5: Summary

**Lesson Text:** Look at that! 3 outfits from the Gold Tiara plus 3 outfits from the Diamond Crown equals **6 total princess styles**!

**Button:** `[ Try the Princess Challenge! 🔥 ]`

---

### Screen 3: Adding the Glass Slippers! (Harder Exercise)

#### Student Instructions

**Heading 1:** 🥿 Complete the Princess Look!

**Text:** Let's make it tougher, `{Chosen Princess Name}`. Before the princess goes to the ball, she needs a pair of shoes!

#### Princess Closet Setup (Expanded)

| Category | Options |
|----------|---------|
| **Crowns** | 👑 Gold Tiara, 💎 Diamond Crown |
| **Dresses** | 👗 Pink, 🟣 Purple, 🟢 Emerald |
| **Shoes** | 🥿 Glass Slippers, 🥾 Riding Boots |

#### Challenge Question

**Text:** How many total variations can you make now using 2 crowns, 3 dresses, and 2 pairs of shoes? *(An outfit must include 1 crown, 1 dress, and 1 pair of shoes)*

**Input Box:** `[ ]`

**Button:** `[ Submit ]`

#### Answer Feedback

- **If Correct (12):** *"Spectacular, {Chosen Princess Name}! 12 unique outfits is exactly right! You're ready for the grand finale shortcut."*
- **If Incorrect:** *"Close! Think about it, {Chosen Princess Name}: Every one of your original 6 outfits now gets 2 options of shoes (Glass Slippers or Riding Boots). That doubles your total count! Try entering 12."*

---

### Screen 4: Final Summary & Review

**Heading 1:** 🏆 Princess Designer Confirmed!

**Text:** Excellent work, `{Chosen Princess Name}`! You successfully discovered how choices stack up without needing to count every single one by hand.

#### 💥 The Ultimate Multiplication Shortcut

**Text:** Instead of sketching tree diagrams or dragging items out of a digital closet every single time, you can just **multiply your total number of choices inside each category together**!

#### The Princess Master Equation

$$\text{2 Crowns} \times \text{3 Dresses} \times \text{2 Shoes} = \text{12 Total Outfits}$$

**Text:** Multiplying your options is the ultimate mathematical superpower shortcut for counting choices. You've completed Lesson 1!

**Button:** `[ Finish Lesson Complete! 🎉 ]`

---

## User Persona & User Stories

### 👑 Part 1: User Persona

#### "Princess" (Dynamic Profile)

> *"I want to sign up with my own secret password, pick my own princess title, and design the most beautiful princess outfits for the Royal Ball!"*

#### Profile Overview

| Attribute | Detail |
|-----------|--------|
| **Age** | 8 years old (3rd Grade) |
| **Target Math Level** | Beginner Combinatorics / Early Probability |
| **Core Interest** | Fairy tales, dress-up games, creative design, and princesses |

#### Psychographics & Behaviors

- **Learning Style:** Heavily visual and narrative-driven. She learns concepts much faster if they are wrapped inside a story rather than presented as abstract rules or plain numbers.
- **App Familiarity:** She expects immediate visual responses when she taps on things and is used to having her own user profile.
- **Patience Threshold:** Low for walls of text, but high for experimentation if she feels in control of a creative sandbox.

#### Motivations & Triggers

- **What Drives Her:** Feeling ownership over her profile (having the app call her by her custom name), completing collections, aesthetic satisfaction, and earning direct praise.
- **The Math Hook:** Instead of seeing math as a scary sheet of multiplication problems, she views this app as a game where she is styling a character for a special princess event.

#### Pain Points & Frustrations in Traditional Math

- **Formula Fatigue:** Becomes completely disengaged when presented with raw formulas without context.
- **Disorganization:** When asked to count possibilities manually on paper, she easily loses track of which options she has already tried, leading to frustration and random guessing.
- **Lack of Identity:** Standard math software treats students like a standard ID number; she engages more when her identity is integrated directly into the gameplay loop.

---

### 📝 Part 2: User Stories (For the MVP Development Backlog)

#### Epic: Core MVP Lesson Flow

**User Story 0: Secure Authentication & Personalization**

> **As a** student entering the application,  
> **I want to** create an account with a unique username, password, and custom princess display name,  
> **So that** my data remains private and the app addresses me by my chosen title throughout the journey.

**User Story 1: The Interactive Sandbox**

> **As a** creative 3rd grader using the app,  
> **I want to** tap on different crowns and dresses in a digital closet to instantly see them appear on a princess character,  
> **So that** I can experiment and explore all the combinations playfully before guessing the answer.

**User Story 2: Unique Outfit Tracking**

> **As a** visual learner,  
> **I want** the app to log my outfit variations automatically in a list as soon as I make a new pairing,  
> **So that** I can see how many unique styles I've found so far without losing track of my progress.

**User Story 3: Explanatory Step-Through**

> **As a** student who might struggle to get the right number at first,  
> **I want** the lesson script to animate the clothes on the character step-by-step when I click "Next,"  
> **So that** I can easily visualize the trick of locking one item in place to count things systematically.

**User Story 4: The 3-Category Challenge**

> **As a** student advancing through the app,  
> **I want to** face a tougher level that introduces a third option category (shoes),  
> **So that** I can test if my new tracking strategy works on a larger problem.

**User Story 5: Immediate Feedback and Reward**

> **As an** elementary school student,  
> **I want to** see clear, positive messages featuring my custom name when I guess correctly and a helpful math shortcut summary at the end,  
> **So that** I feel proud of completing the lesson and understand the faster way to solve it next time.

---

## 🛠️ Technical Stack Architecture & Specifications

This MVP is built using a **single-page frontend application architecture**, leveraging a serverless **Backend-as-a-Service (BaaS)** approach.

```
[ Frontend ]                       [ Backend / Serverless ]
React + Vite Client   ────────────>     Firebase Spark Plan (Free Tier)
(State, Closet & Auth Interface)          (Auth Engine, Firestore Database & Hosting)
```

### Frontend Client (React + Vite)

The frontend acts as an interactive dress-up canvas, managing login sessions, responsive viewing configurations, and the state of the princess closet entirely inside the user's browser for an instant, game-like response.

| Component | Specification |
|-----------|---------------|
| **Scaffolding & Build Tool** | Vite scaffolds the React single-page architecture and compiles optimized client asset bundles. |
| **Component Styling & Mobile Responsiveness** | Standard CSS and inline styles handle all visual layout. The interface is engineered for mobile using adaptive flex containers (`display: flex`, `flexDirection: column`) and media queries — closet and princess canvas stack vertically on phones, side-by-side on tablets/desktops. |
| **Asset Alignment Layout** | Absolute CSS positioning (`position: absolute`) layers wardrobe pieces (Crowns, Dresses, Shoes) onto the princess silhouette using percentages for flawless alignment on any screen size. |
| **State Management Engine** | Native React state (`useState`) plus custom initialization hooks handle credentials, the dynamic profile moniker, and multi-screen lesson progression. |
| **Combination Tracking Logic** | React's `useEffect` listens to garment changes in real time, compares current choices against an internal tracking array, and updates the unique looks log dynamically. |

### Backend & Infrastructure (Firebase Ecosystem)

To eliminate deployment costs and meet storage criteria, the application relies entirely on the **Firebase Free Tier (Spark Plan)** — production-grade data verification, asset delivery, and remote persistence without a dedicated server.

| Service | Role |
|---------|------|
| **Firebase Authentication** | Handles user record lookups and token handling. Registration data (username, hashed password, custom title) is processed securely client-side via the Firebase Web SDK. |
| **Cloud Firestore (NoSQL)** | Persistent progress tracking. State is written to a `users/{uid}` document per student. On login, the app restores their previous screen and lesson state. |
| **Firebase Hosting** | Delivers compiled React assets globally via Firebase's CDN, with free custom domain mapping and automatic SSL. |
| **Scalability & Free Tier Limits** | Operates within free tier thresholds — a tiny fraction of the 10 GB storage cap and 360 MB/day data transfer, plenty for classroom testing. |

### Local Development & Cloud Deployment (Node.js & CLI)

| Component | Detail |
|-----------|--------|
| **Runtime Environment** | Node.js runs local compilation, `npm` dependency management, and background bundling. |
| **Firebase CLI** | Terminal commands (e.g. `firebase deploy --only hosting,firestore:rules`) bundle, compile, and push code from the editor to live URLs in under 30 seconds. |

---

## 📦 Data Schema

This section defines what data is stored, where it lives, and what must persist across sessions.

### Design Principles

| Principle | Detail |
|-----------|--------|
| **Auth vs profile** | Firebase Auth stores credentials (hashed password). Firestore stores the princess display name and lesson progress. |
| **Static vs dynamic** | Closet items, lesson copy, correct answers, and animations live in frontend code. Firestore only stores per-student state. |
| **Resume on login** | When a student returns, the app reads `users/{uid}` and restores their screen, discovered outfits, and submitted answers. |

### What Must Persist

| Data | Source | Persisted? |
|------|--------|------------|
| Username & password | Screen 0 signup form | Auth only (password hashed by Firebase) |
| Princess display name | Screen 0 signup form | Firestore (`princessName`) |
| Current screen (0–4) | Lesson navigation | Firestore (`lesson.currentScreen`) |
| Discovered outfit combos | Screens 1 & 3 closet | Firestore (`lesson.screen1/3.discoveredOutfits`) |
| Challenge answers | Screens 1 & 3 submit | Firestore (`answer`, `isCorrect`) |
| Explanation step | Screen 2 animation | Firestore (`lesson.screen2.currentStep`) |
| Lesson completion | Screen 4 finish | Firestore (`lesson.completed`) |
| Closet catalog (crowns, dresses, shoes) | Hardcoded in app | No — static content |
| Feedback messages & tree diagrams | Hardcoded in app | No — static content |

### Layer 1: Firebase Authentication

The PRD asks for **username + password** signup. Firebase Auth uses email/password, so usernames map to synthetic emails:

```
{username}@brilliant-clone.local
```

| Stored in | Field | Example |
|-----------|-------|---------|
| Firebase Auth | `email` | `sarah@brilliant-clone.local` |
| Firebase Auth | `password` | *(hashed by Firebase — never stored in Firestore)* |
| Firestore | `username` | `sarah` |
| Firestore | `princessName` | `Princess Sarah` |

### Layer 2: Firestore Collections

#### `users/{uid}` — Profile & lesson progress

One document per student. Document ID = Firebase Auth `uid`.

```json
{
  "username": "sarah",
  "princessName": "Princess Sarah",
  "createdAt": "<Timestamp>",
  "updatedAt": "<Timestamp>",

  "lesson": {
    "lessonId": "lesson-1-princess-outfits",
    "currentScreen": 2,
    "completed": false,

    "screen1": {
      "discoveredOutfits": [
        { "crownId": "gold-tiara", "dressId": "pink-gown" },
        { "crownId": "diamond-crown", "dressId": "purple-dress" }
      ],
      "answer": 6,
      "isCorrect": true
    },

    "screen2": {
      "currentStep": 3
    },

    "screen3": {
      "discoveredOutfits": [
        {
          "crownId": "gold-tiara",
          "dressId": "pink-gown",
          "shoeId": "glass-slippers"
        }
      ],
      "answer": 12,
      "isCorrect": true
    }
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `username` | `string` | Login username (lowercase, unique) |
| `princessName` | `string` | Display name used in all lesson copy |
| `lesson.currentScreen` | `number` | `0` = auth, `1` = dressing room, `2` = explanation, `3` = shoes, `4` = summary |
| `lesson.completed` | `boolean` | `true` after Screen 4 finish |
| `lesson.screen1.discoveredOutfits` | `array` | Unique crown + dress pairs the student has tried |
| `lesson.screen1.answer` | `number \| null` | Submitted total for Exercise 1 (`6` is correct) |
| `lesson.screen1.isCorrect` | `boolean \| null` | Set on submit |
| `lesson.screen2.currentStep` | `number` | Anchor-trick animation step (`1`–`5`) |
| `lesson.screen3.discoveredOutfits` | `array` | Unique crown + dress + shoe triples |
| `lesson.screen3.answer` | `number \| null` | Submitted total for Exercise 2 (`12` is correct) |
| `lesson.screen3.isCorrect` | `boolean \| null` | Set on submit |

**Outfit dedup keys** (client-side before writing to Firestore):

```
Screen 1: {crownId}_{dressId}              → max 6 unique combos
Screen 3: {crownId}_{dressId}_{shoeId}      → max 12 unique combos
```

#### `usernames/{username}` — Username uniqueness (optional)

Used at signup to prevent duplicate usernames.

```json
{
  "uid": "<firebase-auth-uid>",
  "createdAt": "<Timestamp>"
}
```

**Signup flow:**
1. Check `usernames/{username}` does not exist
2. Create Firebase Auth user with `{username}@brilliant-clone.local`
3. Batch-write `users/{uid}` and `usernames/{username}`

### Layer 3: Static Catalog (Frontend Code)

Closet items and correct answers are **not** stored in Firestore. Define once in `src/data/lesson1.ts`:

| Category | ID | Label |
|----------|-----|-------|
| **Crowns** | `gold-tiara` | 👑 Gold Tiara |
| | `diamond-crown` | 💎 Diamond Crown |
| **Dresses** | `pink-gown` | 👗 Pink Ballgown |
| | `purple-dress` | 🟣 Purple Dress |
| | `emerald-gown` | 🟢 Emerald Gown |
| **Shoes** | `glass-slippers` | 🥿 Glass Slippers |
| | `riding-boots` | 🥾 Riding Boots |

| Exercise | Correct answer | Formula |
|----------|----------------|---------|
| Screen 1 | `6` | 2 crowns × 3 dresses |
| Screen 3 | `12` | 2 crowns × 3 dresses × 2 shoes |

### Client State vs Persisted State

| React only (instant UI) | Synced to Firestore |
|-------------------------|---------------------|
| Currently selected crown / dress / shoes | `discoveredOutfits` when a new unique combo is found |
| Live form input before Submit | `answer` + `isCorrect` on Submit |
| Animation frames | `currentScreen` and `screen2.currentStep` on navigation |

**Write triggers:**
- Signup → create `users/{uid}`
- New unique outfit → append to `discoveredOutfits`
- Challenge Submit → save `answer` + `isCorrect`
- Screen change / lesson finish → update `currentScreen`, `completed`

### Security Rules

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null
        && request.auth.uid == userId;
    }
    match /usernames/{username} {
      allow read: if request.auth != null;
      allow create: if request.auth != null
        && request.resource.data.uid == request.auth.uid;
    }
  }
}
```

### Indexes

No composite indexes required for MVP — all reads are by document ID (`users/{uid}`, `usernames/{username}`).

---

## Project Requirements to Pass

To pass, you need:

- [ ] A **chosen subject**, stated clearly, with the whole app built for a specific user persona
- [ ] **One interactive lesson** on a real concept in that subject, built around hands-on problems — not a video or a wall of text
- [ ] At least **one problem the learner manipulates directly** (drag, tap, adjust a slider, plot a point, reorder steps)
- [ ] A **visual element they can interact with** (a diagram, simulation, or chart that responds), appropriate to your subject
- [ ] **Instant, specific feedback** on each answer, right or wrong, with a short explanation — written by you, not generated
- [ ] **Progress that persists:** finish part of a lesson, come back, pick up where you left off
- [ ] **Accounts and names** (auth)
- [ ] **Works on mobile** screen sizes
- [ ] **Deployed and public**

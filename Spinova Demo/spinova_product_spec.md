# Spinova Basketball — Product Spec, User Flows & Demo Data
> Version 1.0 · April 2026 · Pass this file to Cursor alongside `spinova_brand_guidelines.md` to build the full HTML demo. This file defines every page, every screen, every state, and every user.

---

## 1. Platform Overview

Spinova Basketball is a role-gated analytics platform. Three user roles control what each person can see and do. The admin team operates the engine — players and coaches only see the finished, approved output.

**The core principle:** Nothing is ever visible to a player or coach until an Admin explicitly approves and publishes it. Every AI-generated item passes through a human review gate.

### Architecture Summary
- **1 Sport:** Basketball (Phase 1)
- **3 User Roles:** Admin, Coach, Player
- **2 Profile Types:** Player Profile, Coach Profile
- **1 AI Pipeline:** YouTube URL → Whisper transcription → Claude analysis → Report draft → Admin review → Publish
- **1 Approval Workflow:** All profiles and reports require Admin approval before visibility

---

## 2. Demo Login Credentials

Build a login page at `/login` (or `login.html`) with email + password fields. The following users must work in the demo with hardcoded credential checks. Each card below represents a demo user.

---

### 🔴 Admin User

| Field | Value |
|-------|-------|
| **Email** | `admin@spinova.app` |
| **Password** | `Admin2026!` |
| **Name** | Khalid Al-Mansouri |
| **Role** | Admin |
| **After login → redirect to** | `/admin/dashboard` |

**What this user sees:**
- Full Admin Panel with sidebar navigation
- Dashboard with pending counts: 2 pending profiles, 1 pending report
- All 10 admin screens (Reports, Profiles, Users, Settings)
- Pre-populated demo data: 3 players, 2 coaches, 4 reports (mix of published/pending)
- Can invite users, approve/reject profiles, create new report jobs

---

### 🟠 Coach User

| Field | Value |
|-------|-------|
| **Email** | `coach@spinova.app` |
| **Password** | `Coach2026!` |
| **Name** | Omar Salah |
| **Role** | Coach |
| **After login → redirect to** | `/coach/dashboard` |

**What this user sees:**
- Coach dashboard with their own published profile
- Coaching credentials: FIBA Level 2, 8 years experience, Riyadh
- Their team: "Falcon U18 Elite" — 3 linked players
- 2 published match reports for their team
- Can request a new report from admin
- Cannot see admin screens, other coaches, or unapproved content

---

### 🔵 Player User

| Field | Value |
|-------|-------|
| **Email** | `player@spinova.app` |
| **Password** | `Player2026!` |
| **Name** | Ahmed Al-Rashidi |
| **Role** | Player |
| **After login → redirect to** | `/player/dashboard` |

**What this user sees:**
- Player dashboard with their published profile
- Position: Point Guard · Team: Falcon U18 Elite
- Stats: 28.4 PPG · 7.2 APG · 87% FT
- 2 approved match reports shared with them
- AI-generated narrative bio (visible)
- Can request a new report from admin
- Cannot see other players, coach-only content, or admin screens

---

## 3. Pre-populated Demo Data

Use this data across all pages for a realistic, consistent demo.

### Players (3 total)

**Player 1 — Ahmed Al-Rashidi** *(linked to login)*
- Position: PG · Secondary: SG
- Height: 183cm · Weight: 78kg · Age: 19
- Level: Competitive · Dominant Hand: Right
- Team: Falcon U18 Elite
- Coach: Omar Salah
- Stats: PPG 28.4 · APG 7.2 · FT% 87
- Profile Status: **Published** ✅
- Reports: 2 published

**Player 2 — Youssef Samir**
- Position: SF · Secondary: PF
- Height: 196cm · Weight: 90kg · Age: 20
- Level: Elite · Dominant Hand: Right
- Team: Falcon U18 Elite
- Profile Status: **Published** ✅
- Reports: 1 published

**Player 3 — Kareem Mostafa**
- Position: C
- Height: 208cm · Weight: 110kg · Age: 17
- Level: Competitive
- Team: (none yet)
- Profile Status: **Pending Approval** 🟠 ← appears in Admin pending queue

### Coaches (2 total)

**Coach 1 — Omar Salah** *(linked to login)*
- Experience: 8 years
- Certification: FIBA Level 2
- Specialization: U16–U18, Competitive
- Status: Academy-based (Falcon Academy, Riyadh)
- Active Students: 12
- Team: Falcon U18 Elite
- Profile Status: **Published** ✅

**Coach 2 — Hassan Al-Zahrawi**
- Experience: 14 years
- Certification: FIBA Level 3
- Specialization: Seniors, Elite
- Status: Independent
- Profile Status: **Pending Approval** 🟠 ← appears in Admin pending queue

### Reports (4 total)

| # | Title | Teams | Date | Status |
|---|-------|-------|------|--------|
| R01 | Falcon U18 vs Al-Nassr Youth | Falcon U18 · Al-Nassr Youth | Apr 10, 2026 | Published ✅ |
| R02 | Falcon U18 vs Al-Ahly Youth | Falcon U18 · Al-Ahly Youth | Apr 3, 2026 | Published ✅ |
| R03 | Saudi U20 Championship — Match 7 | National U20 · Riyadh Stars | Apr 15, 2026 | Pending Approval 🟠 |
| R04 | Falcon U18 vs Jeddah Eagles | Falcon U18 · Jeddah Eagles | Apr 17, 2026 | Processing ⚙️ |

---

## 4. Page Map — All Pages Required

### Authentication (No sidebar)
| Page | Route | Description |
|------|-------|-------------|
| Login | `/login` | Email + password, role-aware redirect |
| Onboarding Form — Player | `/onboarding/player?token=demo` | 6-section form, EN/AR toggle |
| Onboarding Form — Coach | `/onboarding/coach?token=demo` | 6-section form, EN/AR toggle |
| Onboarding Confirmation | `/onboarding/complete` | Success screen after form submit |

### Admin Pages (Sidebar nav required)
| Page | Route | Sidebar Section |
|------|-------|-----------------|
| Admin Dashboard | `/admin/dashboard` | Overview |
| Reports — All Reports | `/admin/reports` | Reports |
| Reports — New Report | `/admin/reports/new` | Reports |
| Reports — Pending Approval | `/admin/reports/pending` | Reports |
| Profiles — All Players | `/admin/profiles/players` | Profiles |
| Profiles — All Coaches | `/admin/profiles/coaches` | Profiles |
| Profiles — Pending Approval | `/admin/profiles/pending` | Profiles |
| Users — All Users | `/admin/users` | Users |
| Users — Invite User | `/admin/users/invite` | Users |
| Settings | `/admin/settings` | Settings |

### Coach Pages (Sidebar nav required)
| Page | Route | Sidebar Section |
|------|-------|-----------------|
| Coach Dashboard | `/coach/dashboard` | Overview |
| My Profile | `/coach/profile` | Profile |
| Team & Players | `/coach/team` | Team |
| Match Reports | `/coach/reports` | Reports |

### Player Pages (Sidebar nav required)
| Page | Route | Sidebar Section |
|------|-------|-----------------|
| Player Dashboard | `/player/dashboard` | Overview |
| My Profile | `/player/profile` | Profile |
| My Reports | `/player/reports` | Reports |
| Request Report | `/player/reports/request` | Reports |

---

## 5. Login Page Spec

**Layout:** Centered card on dark navy + ambient gradient background (same as hero)

**Left side (or top on mobile):** Spinova branding — logo, tagline "Basketball Analytics Platform", 3 role chips (Admin · Coach · Player)

**Right side (or bottom):** White card with:
- Section eyebrow: "PLATFORM LOGIN"
- h2: "Welcome Back"
- Email input (label: "Email Address")
- Password input (label: "Password") with show/hide toggle
- Primary CTA button: "Sign In →" (court orange, full width)
- Below CTA: small text "Demo credentials — see your role card below"

**Demo Credentials Display** (below the login card):
- 3 cards side by side (one per role) showing email, password, and "what you'll see"
- Admin card: dark navy background, court orange accent top
- Coach card: court orange background, white text
- Player card: blue background, white text

**On successful login:** redirect based on role (see Section 2)
**On failed login:** inline error below the password field — "Incorrect email or password"

---

## 6. Admin Pages — Detailed Spec

### 6A. Admin Dashboard (`/admin/dashboard`)

**Hero:** Dark navy, title "Admin Dashboard", sub "Platform Overview · April 2026"

**KPI Row (4 stat boxes):**
- Pending Profiles: **2** (orange)
- Pending Reports: **1** (orange)
- Total Players: **3** (blue)
- Total Coaches: **2** (blue)

**Section 1 — Pending Approvals** (callout orange box at top):
- Header: "Action Required — 2 items need your review"
- List item 1: "Kareem Mostafa — Player Profile — Submitted Apr 16" → [Review] button
- List item 2: "Hassan Al-Zahrawi — Coach Profile — Submitted Apr 14" → [Review] button

**Section 2 — Recent Reports** (table):
- Shows last 4 reports (R01–R04) with status badges
- Columns: Report Title · Teams · Date · Status · Action
- R04 (Processing) shows a spinner badge — no action button
- R03 (Pending) shows [Review] button

**Section 3 — Quick Actions** (3 cards):
- "Invite New User" → links to `/admin/users/invite`
- "Submit New Report" → links to `/admin/reports/new`
- "View All Profiles" → links to `/admin/profiles/players`

---

### 6B. Reports — All Reports (`/admin/reports`)

**Page header:** "All Reports" · filter row: All / Published / Pending / Processing / Draft

**Table columns:** Title · Teams · Date Submitted · Status · Linked Players · Action

**Show all 4 reports.** Status badges:
- Published: `badge-green`
- Pending Approval: `badge-orange`
- Processing: `badge-blue` with spinner icon

---

### 6C. Reports — New Report (`/admin/reports/new`) ← Full UI required

**Page header:** "New Match Report" · sub: "Submit a YouTube match for AI analysis"

**Step indicator** (3 steps across top):
1. Match Details ← current step (highlighted in court orange)
2. Processing
3. Review & Approve

**Form fields:**

**Section A — YouTube Link**
- Label: "YouTube Match URL"
- Input: full-width URL input with placeholder `https://youtube.com/watch?v=...`
- Below input: callout (blue) — "Spinova will transcribe the audio, extract play-by-play events, and generate a structured match report. Processing takes 2–5 minutes."

**Section B — Match Information**
- Match Title (text input) — placeholder: "Falcon U18 vs Al-Nassr Youth · Apr 2026"
- Match Date (date picker)
- Competition / League (text input) — placeholder: "Saudi U18 Championship"
- Match Venue (text input) — placeholder: "King Fahd Sports City, Riyadh"

**Section C — Teams**
- Team A (dropdown or text) — pre-filled options: Falcon U18 Elite, Al-Nassr Youth, Al-Ahly Youth, Jeddah Eagles, Riyadh Stars, National U20
- Team B (same dropdown)
- Final Score Team A (number) · Final Score Team B (number)

**Section D — Player Tagging**
- Label: "Tag Players in This Match (optional)"
- Multi-select checkboxes: Ahmed Al-Rashidi · Youssef Samir · Kareem Mostafa
- Note: "Tagged players will have this report appear on their profile once published"

**Section E — Report Notes for AI**
- Textarea — placeholder: "Any context for the AI analyst (optional): key moments to highlight, player to focus on, coaching observations..."

**Submit Button:** "Submit for Processing →" (primary, court orange, full width)

**Status Tracker Panel** (right sidebar or below form on mobile):
- Title: "Processing Status"
- Step 1: "YouTube URL Validated" ✅ (shows green once URL is entered)
- Step 2: "Audio Transcription" ⚙️ (pending)
- Step 3: "AI Analysis" ⚙️ (pending)
- Step 4: "Report Draft Ready" ⚙️ (pending)
- Step 5: "Awaiting Admin Review" ⚙️ (pending)
- Note: "You'll receive a notification when the draft is ready for review"

---

### 6D. Reports — Pending Approval (`/admin/reports/pending`)

**Page header:** "Pending Report Approval" · badge: "1 awaiting review"

**Report card for R03:**
- Title, teams, date
- Two-panel layout:
  - Left: "AI-Generated Report Preview" — show a realistic mock report with match narrative (2 paragraphs), key events timeline, player highlights section for Ahmed Al-Rashidi and Youssef Samir
  - Right: "Raw Match Data" — show the YouTube URL, transcript excerpt (2–3 lines), and tagged players
- Action row: [Edit Report] (ghost button) · [Reject] (danger button) · [Approve & Publish] (lime button)

---

### 6E. Profiles — All Players (`/admin/profiles/players`)

**Page header:** "All Players" · search input · filter: All / Published / Pending

**Table columns:** Name · Position · Team · Level · Coach · Profile Status · Action

Show all 3 players. Kareem Mostafa shows `badge-orange` "Pending" status.

---

### 6F. Profiles — All Coaches (`/admin/profiles/coaches`)

**Table columns:** Name · Certification · Status · Active Students · Profile Status · Action

Show both coaches. Hassan Al-Zahrawi shows `badge-orange` "Pending" status.

---

### 6G. Profiles — Pending Approval (`/admin/profiles/pending`)

**Page header:** "Pending Profile Approvals" · badge: "2 items"

**Profile card 1 — Kareem Mostafa (Player):**
- Two-panel layout:
  - Left panel: "Form Answers" — display a condensed version of his form answers (position: C, height: 208cm, team: none, level: Competitive, goal: Compete Nationally)
  - Right panel: "AI-Generated Profile Preview" — show the AI-drafted profile with bio paragraph, playing style section, development section
- Action row: [Edit] · [Reject] · [Approve & Publish]

**Profile card 2 — Hassan Al-Zahrawi (Coach):**
- Same two-panel layout for coach form answers vs AI-generated coach profile
- Action row: [Edit] · [Reject] · [Approve & Publish]

---

### 6H. Users — All Users (`/admin/users`)

**Table columns:** Name · Email · Role · Status · Joined · Action

Show all 5 users (Khalid Admin, Omar Coach, Ahmed Player, Youssef Player, Kareem Player — note Kareem is pending). Status badges: Active / Pending.

Action options per row: [View] · [Deactivate]

---

### 6I. Users — Invite User (`/admin/users/invite`)

**Page header:** "Invite a New User"

**Form:**
- Role selector: two large cards — "Player" (blue accent) · "Coach" (court orange accent) — click to select
- First Name (text)
- Last Name (text)
- Email Address (email input)
- Personal Message (textarea, optional) — placeholder: "Add a personal note to the invite email..."
- Preview of the invite email (collapsible) — shows a simplified email mockup with the Spinova header, invite message, and CTA button "Complete Your Profile →"
- Submit button: "Send Invite Email →" (primary, court orange)

**After submit:** success callout — "Invite sent to [email]. They'll receive a personalized onboarding link."

---

### 6J. Settings (`/admin/settings`)

Three sections:

**Section A — Teams Registry**
- List of teams with add/edit/remove
- Pre-filled: Falcon U18 Elite, Al-Nassr Youth, Al-Ahly Youth, Jeddah Eagles, Riyadh Stars, National U20
- [+ Add Team] button

**Section B — AI Prompt Templates**
- Two collapsible cards: "Player Profile Prompt" · "Match Report Prompt"
- Show a shortened version of each prompt in a code-style textarea (read-only)
- [Edit Prompt] button on each

**Section C — Notifications**
- Toggle switches for: "Email on new profile submission" · "Email on report ready for review" · "Email on profile approved" · "Email on report published"
- All toggles ON by default

---

## 7. Coach Pages — Detailed Spec

### 7A. Coach Dashboard (`/coach/dashboard`)

**Hero:** Dark navy, "Welcome back, Omar." · sub: "Coach · Falcon U18 Elite · Riyadh"

**KPI Row (3 stat boxes):**
- Active Players: **3** (blue)
- Published Reports: **2** (green)
- Team Record: **4W–2L** (court orange — made up for demo)

**Section 1 — My Profile Summary** (card with Approve-style preview):
- Photo placeholder (grey circle with "OS" initials)
- Name, certification badge (FIBA Level 2), years experience
- Short AI-generated philosophy paragraph: *"Omar brings an analytical, player-first approach to coaching. With 8 years developing competitive youth athletes in Riyadh, his expertise in pick-and-roll systems and defensive rotations has produced measurable results at the U18 level."*
- [View Full Profile →] button

**Section 2 — Team Roster** (compact table):
- Columns: Player · Position · Level · Reports
- Ahmed Al-Rashidi · PG · Competitive · 2 reports
- Youssef Samir · SF · Elite · 1 report
- Kareem Mostafa · C · Competitive · 0 reports (Pending label)

**Section 3 — Recent Reports** (2 cards):
- R01: Falcon U18 vs Al-Nassr Youth · Apr 10 · Published → [View]
- R02: Falcon U18 vs Al-Ahly Youth · Apr 3 · Published → [View]

**Section 4 — Request a Report** (callout orange):
- Text: "Need a match analysed? Submit a request to the admin team."
- [Request New Report →] button → links to a simple request form

---

### 7B. My Profile (`/coach/profile`)

**Full published coach profile page:**

**Header block (dark navy):**
- Photo placeholder + initials "OS"
- Name: Omar Salah
- Badges: FIBA Level 2 · 8 Years Experience · Riyadh, KSA
- Languages: Arabic + English

**Profile Sections (cards):**

1. **Identity & Credentials** — name, photo, location, certifications, languages
2. **Coaching Specialization** — age groups (U16, U18), level coached (Competitive), offensive expertise (Pick & Roll, Motion Offense), defensive approach (Zone + Man-to-Man)
3. **Achievements** — top achievement: "Led Falcon U18 to Saudi Regional Championship Finals 2025", active students: 12, coaching comp/pro players: Yes
4. **AI-Generated Philosophy** (green header card) — 2-paragraph coaching philosophy written by AI, labeled "AI-Generated · Admin Reviewed"
5. **Contact & Social** — LinkedIn link placeholder, website placeholder
6. **Linked Reports & Players** — shows R01 + R02 with dates and player tags

---

### 7C. Team & Players (`/coach/team`)

**Page header:** "Falcon U18 Elite · My Team"

**Team summary card:** team name, total players (3), active reports (2), coach name

**Player cards (3):** one card per player showing name, position, level, report count, and [View Reports] button. Kareem shows "Pending Profile" badge in grey.

---

### 7D. Match Reports (`/coach/reports`)

**Page header:** "Match Reports · My Team"

**Filter tabs:** All · Published · Requested

**Show R01 and R02 as full report preview cards:**

Each card shows:
- Match title + date
- Teams + score
- 1-paragraph AI narrative excerpt
- Player Highlights section: 2–3 bullet points about Ahmed/Youssef performance
- [View Full Report] expander or link

---

## 8. Player Pages — Detailed Spec

### 8A. Player Dashboard (`/player/dashboard`)

**Hero:** Dark navy, "Welcome back, Ahmed." · sub: "Point Guard · Falcon U18 Elite"

**KPI Row (3 stat boxes):**
- PPG: **28.4** (court orange)
- APG: **7.2** (blue)
- FT%: **87%** (lime)

**Section 1 — My Profile Summary** (card):
- Photo placeholder (grey circle "AR" initials)
- Position badge: PG · Team: Falcon U18 Elite · Level: Competitive
- Short AI bio excerpt: *"Ahmed is a dynamic point guard with an elite court vision and a relentless first step. His ability to both score from the perimeter and create for teammates makes him one of the most versatile guards in the Riyadh U18 circuit."*
- [View Full Profile →] button

**Section 2 — My Reports** (2 report cards):
- R01: Falcon U18 vs Al-Nassr Youth · Apr 10 · Published → [View]
- R02: Falcon U18 vs Al-Ahly Youth · Apr 3 · Published → [View]

**Section 3 — Request a Report** (callout orange):
- Text: "Want a match analysed? Your coach or admin can request an AI report for any game."
- [Request New Report →] button

---

### 8B. My Profile (`/player/profile`)

**Full published player profile page:**

**Header block (dark navy):**
- Photo placeholder + "AR" initials
- Ahmed Al-Rashidi
- Badges: PG · Competitive · Falcon U18 Elite · Riyadh, KSA
- Physical: 183cm · 78kg · Right-handed

**Profile Sections (cards):**

1. **Personal Identity** — name, DOB (Jan 5, 2007), nationality (Saudi), city (Riyadh), position (PG/SG), dominant hand, height, weight, team
2. **Playing Style & Strengths** (court orange header) — AI narrative about playmaking style, offensive: 3-point shooting + pick & roll, defensive intensity: 8/10, court vision: 9/10, pace: Fast
3. **Training & Development** (blue header) — 7 years playing, 5 years structured training, 4x/week training, current coach: Omar Salah (linked), academy: Falcon Academy
4. **Achievements & Exposure** (lime header) — Tournament: Saudi U18 Regional Championship 2025, Achievement: "Top scorer in Riyadh U18 League 2024", Instagram: placeholder link, public directory: Yes
5. **Connected Match Reports** (navy header) — R01 + R02 cards with date, teams, brief stat mention
6. **AI-Generated Narrative Bio** (green header) — full 2-paragraph bio, labeled "AI-Generated · Admin Reviewed"

---

### 8C. My Reports (`/player/reports`)

**Page header:** "My Match Reports"

**Filter tabs:** All · Published

**Show R01 and R02 as expanded report cards:**

Each card:
- Match details header (title, date, teams, score: 78–65 for R01, 91–80 for R02)
- AI Match Narrative (2 paragraphs)
- Player Highlights — Ahmed-specific section: points, assists, key moments
  - R01: "32 points on 12/18 shooting. 8 assists. Led the fourth-quarter comeback."
  - R02: "24 points on 9/15 shooting. 7 assists. Set a season-high 4 steals."
- [Download PDF] button (ghost, non-functional in demo) · [Share Profile] button (ghost)

---

### 8D. Request Report (`/player/reports/request`)

**Page header:** "Request a Match Report"

**Form:**
- Match Name / Opponent (text)
- Match Date (date)
- YouTube Link (URL input — optional)
- Notes for Admin (textarea) — placeholder: "Any context that might help — match details, which players to focus on..."
- Submit: "Send Request →" (primary button)

**After submit:** success callout green — "Request sent. Admin will review and process your match."

---

## 9. Onboarding Forms — Bilingual Spec

Both forms share the same layout. Accessed via invite link only — no login required.

### Form Layout
- No sidebar
- Full-width, max-width 900px centered
- Topbar: Spinova logo + "Complete Your Profile" label
- **Language toggle** (top-right of form area): pill buttons `[EN] [AR]`
  - EN = default, LTR, English labels and placeholders
  - AR = RTL, Arabic labels and placeholders, `dir="rtl"` on form
- Progress bar at top: shows which of 6 sections is active
- Each section = a `form-section-card` (see brand guidelines)
- "Next Section →" button advances; "← Back" goes back
- Final screen: "Submit Profile →" primary button

---

### Player Onboarding Form — 6 Sections, ~30 Fields

**Section 1 — Personal Information**

| Field | Type | EN Label | AR Label |
|-------|------|----------|----------|
| Full Name | text | Full Name | الاسم الكامل |
| Date of Birth | date | Date of Birth | تاريخ الميلاد |
| Nationality | text | Nationality | الجنسية |
| City of Residence | text | City of Residence | مدينة الإقامة |
| Phone Number | tel | Phone Number | رقم الجوال |
| Email Address | email | Email Address | البريد الإلكتروني |
| Parent/Guardian Email (if under 18) | email | Parent/Guardian Email (under 18) | بريد ولي الأمر (للقاصرين) |

**Section 2 — Basketball Profile**

| Field | Type | EN Label | AR Label |
|-------|------|----------|----------|
| Primary Position | select (PG/SG/SF/PF/C) | Primary Position | المركز الأساسي |
| Secondary Position | select | Secondary Position | المركز الثانوي |
| Dominant Hand | select (Right/Left/Both) | Dominant Hand | اليد المفضلة |
| Height (cm) | number | Height (cm) | الطول (سم) |
| Weight (kg) | number | Weight (kg) | الوزن (كيلو) |
| Years Playing Basketball | number | Years Playing Basketball | سنوات ممارسة كرة السلة |
| Current Playing Level | select (Recreational/Competitive/Elite/Professional) | Current Level | المستوى الحالي |

**Section 3 — Playing Style & Strengths**

| Field | Type | EN Label | AR Label |
|-------|------|----------|----------|
| Preferred Offensive Style | text | Preferred Offensive Style | أسلوب الهجوم المفضل |
| Defensive Intensity (1–10) | number | Defensive Intensity | شدة الدفاع |
| Court Vision (1–10) | number | Court Vision | رؤية الملعب |
| Preferred Team Role | text | Preferred Team Role | دورك المفضل في الفريق |
| Strongest Physical Attributes | textarea | Strongest Physical Attributes | أقوى صفاتك البدنية |
| Pace of Play Preference | select (Fast/Balanced/Controlled) | Pace of Play | إيقاع اللعب المفضل |

**Section 4 — Training & Academy**

| Field | Type | EN Label | AR Label |
|-------|------|----------|----------|
| Weekly Training Frequency | number | Weekly Training Sessions | جلسات التدريب الأسبوعية |
| Current Coach Status | select (Yes/No) | Do you have a coach? | هل لديك مدرب؟ |
| Current Academy or Club | text | Current Academy/Club | الأكاديمية أو النادي الحالي |
| Previous Academies | textarea | Previous Academies | الأكاديميات السابقة |
| Years of Structured Training | number | Years of Structured Training | سنوات التدريب المنظم |

**Section 5 — Goals & Achievements**

| Field | Type | EN Label | AR Label |
|-------|------|----------|----------|
| Main Basketball Goals | checkbox multi-select | Main Goals | الأهداف الرئيسية |
| → Compete Nationally | checkbox | Compete Nationally | المنافسة على المستوى الوطني |
| → Go Professional | checkbox | Go Professional | الاحتراف |
| → Improve Fitness | checkbox | Improve Fitness | تحسين اللياقة البدنية |
| → Join Top Academy | checkbox | Join Top Academy | الانضمام لأكاديمية متقدمة |
| Timeline to Main Goal | text | Timeline | الجدول الزمني |
| Tournament History | textarea | Tournament History | تاريخ البطولات |
| Top Career Achievement | textarea | Top Achievement | أبرز إنجاز في مسيرتك |
| Awards / Recognition | textarea | Awards / Recognition | الجوائز والتكريمات |

**Section 6 — Visibility & Media**

| Field | Type | EN Label | AR Label |
|-------|------|----------|----------|
| Public Scouting Directory | select (Yes/No) | Public Scouting Visibility | الظهور في دليل الكشافة العامة |
| Profile Photo Upload | file | Profile Photo | صورة الملف الشخصي |
| Instagram Link | url | Instagram Link | رابط انستغرام |
| YouTube Highlights Link | url | YouTube Highlights (optional) | روابط يوتيوب (اختياري) |
| How did you hear about Spinova? | text | How did you hear about us? | كيف عرفت عن سبينوفا؟ |

---

### Coach Onboarding Form — 6 Sections, ~27 Fields

**Section 1 — Personal Information**

| Field | Type | EN Label | AR Label |
|-------|------|----------|----------|
| Full Name | text | Full Name | الاسم الكامل |
| Date of Birth | date | Date of Birth | تاريخ الميلاد |
| Country | text | Country | الدولة |
| City | text | City | المدينة |
| Phone Number | tel | Phone Number | رقم الجوال |
| Email Address | email | Email Address | البريد الإلكتروني |

**Section 2 — Coaching Profile**

| Field | Type | EN Label | AR Label |
|-------|------|----------|----------|
| Years of Coaching Experience | number | Years of Experience | سنوات الخبرة |
| Highest Coaching Certification | text | Highest Certification | أعلى شهادة تدريبية |
| Other Certifications | textarea | Other Certifications | شهادات أخرى |
| Age Groups Specialized In | checkbox multi (U10–U18, Seniors) | Age Groups | الفئات العمرية |
| Playing Level Coached | select (Recreational/Competitive/Elite/Professional) | Level Coached | مستوى التدريب |
| Coaching Languages | select (English/Arabic/Both/Other) | Coaching Languages | لغات التدريس |

**Section 3 — Current Status & Students**

| Field | Type | EN Label | AR Label |
|-------|------|----------|----------|
| Current Status | select (Independent/Academy-based) | Current Status | الوضع الحالي |
| Academy or Club Name | text | Academy/Club | الأكاديمية أو النادي |
| Current Active Students | number | Active Students | الطلاب النشطون |
| Coached Competitive/Pro Players | select (Yes/No) | Coached Competitive Players? | هل دربت لاعبين محترفين؟ |
| Personal Playing Background | textarea | Personal Playing Background | خلفيتك كلاعب |

**Section 4 — Coaching Philosophy & Style**

| Field | Type | EN Label | AR Label |
|-------|------|----------|----------|
| Offensive System Expertise | text | Offensive System | نظام الهجوم |
| Defensive Approach | textarea | Defensive Approach | أسلوب الدفاع |
| Player Development Focus | select (Technical/Tactical/Physical/Mental/Mixed) | Development Focus | محور التطوير |
| Top Coaching Achievement | textarea | Top Achievement | أبرز إنجاز تدريبي |
| Describe Your Coaching Style | textarea | Coaching Style | وصف أسلوبك التدريبي |

**Section 5 — Media & Discovery**

| Field | Type | EN Label | AR Label |
|-------|------|----------|----------|
| LinkedIn Profile | url | LinkedIn Profile | رابط لينكدإن |
| Website / Social Media | url | Website / Social | الموقع الإلكتروني |
| Professional Profile Photo | file | Profile Photo | الصورة الشخصية |
| Certifications Document (optional) | file | Certifications Document | وثيقة الشهادات |
| How did you hear about Spinova? | text | How did you hear about us? | كيف عرفت عن سبينوفا؟ |

**Section 6 — Team Selection**

| Field | Type | EN Label | AR Label |
|-------|------|----------|----------|
| Select Players for Team | multi-select list | Select Your Players | اختر لاعبيك |
| Team Name | text | Team Name | اسم الفريق |
| Team Training Notes | textarea | Notes for Admin (optional) | ملاحظات للمشرف |

---

### Onboarding Confirmation Screen

After submit — no sidebar, no topbar nav links:
- Green checkmark icon (large)
- h2: "Profile Submitted!"
- Body: "Your information has been received. Our team will review and publish your profile shortly. You'll receive an email with your published profile link."
- Sub note: "This process typically takes 1–2 business days."
- No further action button — just the Spinova logo and footer

---

## 10. Navigation & Routing Logic

### Admin Sidebar Structure
```
OVERVIEW
  → Dashboard

REPORTS
  → All Reports
  → New Report
  → Pending Approval

PROFILES
  → All Players
  → All Coaches
  → Pending Approval

USERS
  → All Users
  → Invite User

SETTINGS
  → Settings
```

### Coach Sidebar Structure
```
OVERVIEW
  → Dashboard

MY PROFILE
  → View Profile

TEAM
  → Team & Players

REPORTS
  → Match Reports
```

### Player Sidebar Structure
```
OVERVIEW
  → Dashboard

MY PROFILE
  → View Profile

REPORTS
  → My Reports
  → Request Report
```

---

## 11. State & Permission Matrix

| Action | Admin | Coach | Player |
|--------|-------|-------|--------|
| View own profile | ✅ | ✅ | ✅ |
| View other profiles | ✅ | ✅ team only | ❌ |
| View match reports | ✅ all | ✅ team only | ✅ own only |
| Request new report | ✅ create | ✅ request | ✅ request |
| Submit YouTube for analysis | ✅ | ❌ | ❌ |
| Approve profiles | ✅ | ❌ | ❌ |
| Approve reports | ✅ | ❌ | ❌ |
| Invite users | ✅ | ❌ | ❌ |
| Deactivate users | ✅ | ❌ | ❌ |
| See pending/draft content | ✅ | ❌ | ❌ |
| Edit AI-generated content | ✅ before publish | ❌ | ❌ |
| See admin panel | ✅ | ❌ | ❌ |
| See other coaches | ✅ | ❌ | ❌ |
| See other players | ✅ | ✅ own team | ❌ |

---

## 12. AI-Generated Content — Demo Placeholder Text

Use these exact texts in the demo where AI-generated content appears.

### Ahmed Al-Rashidi — AI Narrative Bio
> *Ahmed Al-Rashidi is a dynamic and highly instinctive point guard operating out of Riyadh's competitive U18 circuit. With an elite court vision rating and a first step that creates consistent separation at the arc, Ahmed excels as both a primary scoring threat and a genuine playmaker for the Falcon U18 Elite roster.*
>
> *His 7 years of structured development, combined with consistent high-frequency training under Coach Omar Salah, has built a technical foundation that is rare for his age group. Ahmed's ambition to compete at the national level and ultimately pursue a professional career reflects the discipline and clarity of purpose that defines his approach to the game.*

### Ahmed Al-Rashidi — Playing Style Assessment (AI)
> *Offensive strengths: perimeter shooting, pick-and-roll execution, isolation scoring. Defensive engagement: high intensity with active hands in the passing lanes. Areas to develop: physicality in the paint and consistency in late-shot-clock situations. Preferred role: primary ball-handler and lead decision-maker.*

### Omar Salah — AI Coaching Philosophy
> *Omar Salah brings an analytical, player-first philosophy to every session. His FIBA Level 2 credentials and 8 years of hands-on development work with competitive youth in Riyadh have shaped a coaching identity built around precision, accountability, and long-term athlete growth.*
>
> *Omar's expertise in pick-and-roll systems and structured defensive rotations has produced a recognisable team identity at the U18 level. His bilingual coaching ability in Arabic and English allows him to connect deeply with players from diverse backgrounds, building trust through clear, direct communication and consistent technical feedback.*

### Match Report — R01 Narrative (AI)
> *Falcon U18 Elite delivered a commanding second-half performance to defeat Al-Nassr Youth 78–65 in a tightly contested Saudi U18 matchup. After trailing by 4 at halftime, Falcon's adjusted defensive scheme under Coach Omar Salah produced six consecutive forced turnovers to open the third quarter — a run that proved decisive.*
>
> *Ahmed Al-Rashidi was the fulcrum of every offensive set, finishing with 32 points on 12-of-18 shooting and 8 assists. His ability to attack the zone defence with timely mid-range pull-ups and distribute under pressure was the difference between the teams in the final 8 minutes.*

### Match Report — R02 Narrative (AI)
> *Falcon U18 Elite recorded a dominant 91–80 victory over Al-Ahly Youth in what was a high-tempo affair throughout. Both teams pushed pace aggressively, but Falcon's transition defence and offensive rebounding advantage — 14 second-chance points — proved the decisive margin.*
>
> *Ahmed Al-Rashidi posted 24 points on 9-of-15 shooting and matched a season-high with 4 steals. Youssef Samir contributed 18 points and 9 rebounds, providing an interior presence that Al-Ahly struggled to neutralise consistently across four quarters.*

---

## 13. Error & Empty States

| State | Where | Message |
|-------|-------|---------|
| No reports yet | Player Reports page | "No reports have been shared with you yet. Your admin will add reports as they are approved." |
| No team yet | Coach Team page | "Your team hasn't been confirmed yet. Admin will link players after your profile is approved." |
| Pending profile | Player/Coach Dashboard | Orange callout: "Your profile is under review. You'll receive an email once it goes live." |
| Report processing | Report card | Blue badge "Processing" + spinner + "AI analysis in progress — check back in a few minutes." |
| Failed login | Login page | "Incorrect email or password. Check your credentials and try again." |
| Form incomplete | Onboarding form | Red border on empty required fields + callout: "Please complete all required fields to continue." |

---

## 14. File Structure Recommendation for Cursor

```
/spinova-demo/
├── index.html              → redirects to login
├── login.html
├── onboarding/
│   ├── player.html
│   ├── coach.html
│   └── complete.html
├── admin/
│   ├── dashboard.html
│   ├── reports.html
│   ├── reports-new.html
│   ├── reports-pending.html
│   ├── profiles-players.html
│   ├── profiles-coaches.html
│   ├── profiles-pending.html
│   ├── users.html
│   ├── users-invite.html
│   └── settings.html
├── coach/
│   ├── dashboard.html
│   ├── profile.html
│   ├── team.html
│   └── reports.html
├── player/
│   ├── dashboard.html
│   ├── profile.html
│   ├── reports.html
│   └── reports-request.html
├── assets/
│   ├── styles.css          → brand variables + global styles
│   └── nav.js              → shared sidebar + routing logic
```

**Shared JS logic needed:**
- `nav.js`: reads `localStorage.getItem('spinova_user')` to determine role and highlight active nav item
- `login.html`: on submit, checks hardcoded credentials → sets `localStorage.setItem('spinova_user', JSON.stringify({role, name, email}))` → redirects
- Every protected page: checks `localStorage` on load — if no user, redirect to `/login.html`
- Logout button (in topbar): clears localStorage → redirects to login

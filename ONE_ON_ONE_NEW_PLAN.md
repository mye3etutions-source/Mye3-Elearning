# 🎯 1-on-1 Personal Sessions — Final Implementation Plan
> Status: **Ready to Implement** — Latest decisions included

---

## 🆕 Final Design Decisions (From Discussion)

### 1. Registration Form — Separate Sections (Toggle/Radio)
Register form లో Board dropdown లో 1-on-1 ఉండదు. రెండు separate sections ఉంటాయి:

```
● Normal Tuition          ← Select చేస్తే
    Select Board: [AP Board ▼]
    Select Class: [Class 6  ▼]

○ 1-on-1 Personal Class   ← Select చేస్తే
    Select Class: [Music   ▼]   ← Admin add చేసిన classes మాత్రమే
                  [Art      ]
                  [Class 6  ]
                  [Dance    ]
```

### 2. Admin — 1-on-1 Class Types Manage చేయాలి
Admin panel లో admin ఏ class types add చేస్తే అవి register form లో కనబడతాయి.
- Music, Art, Dance, Degree, Class 6, Class 10 — admin decide చేస్తాడు
- ప్రతి class type కి వేరే pricing (Monthly/Quarterly/Half-Yearly/Annual)

### 3. Student Dashboard — Class-specific Pricing
Student register అయిన తర్వాత dashboard లో వాళ్ళ class type కి admin set చేసిన pricing కనబడుతుంది.

---

## ✅ Already Done (Present Code Lo Unnaivi)

### Backend
| Feature | File | Status |
|---|---|---|
| `PersonalSession.js` model | `backend/src/models/PersonalSession.js` | ✅ Complete |
| `Payout.js` — `personalSessionIds` | `backend/src/models/Payout.js` | ✅ Complete |
| Admin: All sessions API | `personalSessionController.js` | ✅ Complete |
| Admin: Assign teacher + schedule (conflict check) | `personalSessionController.js` | ✅ Complete |
| Student: Get my sessions API | `personalSessionController.js` | ✅ Complete |
| Student: Pay API (mock) | `personalSessionController.js` | ✅ Complete |
| Teacher: Get/Mark personal sessions | `personalSessionController.js` | ✅ Complete |
| All routes wired | `personalSessionRoutes.js` | ✅ Complete |
| `getTeacherPayroll` — 1-on-1 earnings included | `adminController.js` | ✅ Complete |
| `settleTeacherPayment` — personal sessions settle | `adminController.js` | ✅ Complete |

### Frontend
| Feature | File | Status |
|---|---|---|
| Admin: `AdminPersonalSessions.jsx` (New + All tabs) | `pages/admin/` | ✅ Complete |
| Admin: `AssignPersonalSessionModal.jsx` | `components/admin/` | ✅ Complete |
| Teacher: `MyPersonalSessions.jsx` | `pages/teacher/` | ✅ Complete |
| Teacher Payouts — Group + 1-on-1 breakdown | `TeacherPayouts.jsx` | ✅ Complete |
| Routes added in `App.jsx` | `App.jsx` | ✅ Complete |

---

## ❌ Missing / Bugs — Ivi Fix Cheyali

---

### 🔴 Phase 1 — New Model: `OneOnOneCategory`
**File**: `backend/src/models/OneOnOneCategory.js` (NEW FILE)

Admin ఏ 1-on-1 class types manage చేస్తాడో అందుకు కొత్త model:
```js
{
  name: String,          // "Music", "Art", "Class 6"
  description: String,
  pricing: {
    oneMonth: Number,
    threeMonths: Number,
    sixMonths: Number,
    twelveMonths: Number
  },
  isActive: Boolean
}
```

---

### 🔴 Phase 2 — User Model Update
**File**: `backend/src/models/User.js`

- `board` enum నుండి `'1-on-1'` తీసేయాలి
- కొత్త fields add చేయాలి:
  - `isOneOnOne: { type: Boolean, default: false }`
  - `oneOnOneCategory: { type: ObjectId, ref: 'OneOnOneCategory' }` ← ఏ class type select చేసాడో

---

### 🔴 Phase 3 — Admin: 1-on-1 Categories Manage
**Files**: `adminController.js`, `adminRoutes.js`, `AdminPersonalSessions.jsx`

Admin panel లో 1-on-1 categories add/edit/delete చేయాలి:
- `POST /admin/1on1-categories` — new class type add
- `GET /admin/1on1-categories` — list
- `PUT /admin/1on1-categories/:id` — pricing update
- `DELETE /admin/1on1-categories/:id` — delete

---

### 🔴 Phase 4 — Register Form Redesign
**File**: `frontend/src/pages/Register.jsx`

Radio/Toggle తో రెండు sections:
- **Normal Tuition**: Board dropdown + Class dropdown (existing logic)
- **1-on-1 Personal Class**: API call `/admin/1on1-categories` → admin created class types dropdown
- Submit చేస్తే backend కి `isOneOnOne: true` + `oneOnOneCategory: <id>` పంపాలి

**File**: `backend/src/controllers/authController.js`
- Register లో `isOneOnOne` true ఉంటే → admin కి socket notification పంపాలి

---

### 🔴 Phase 5 — Fix Assign Flow Status
**File**: `backend/src/controllers/personalSessionController.js`

- `assignSession`: status `'active'` బదులు `'assigned'` set చేయాలి
- `planType` + `price` + `expiryDate` request body నుండి accept చేయాలి

**File**: `frontend/src/pages/admin/AdminPersonalSessions.jsx`

**Tab 1 — NEW STUDENTS:**
- `isOneOnOne === true` students మాత్రమే చూపించాలి
- Student's Class Type column add చేయాలి
- Actions: "Awaiting Payment" → **"Assign Teacher & Schedule"** button (always enabled, no payment gate)

**Tab 2 — ALL ASSIGNED SESSIONS:**
- ~~SLOTS~~ column తీసేయాలి
- New column order: `STUDENT | CLASS TYPE | TEACHER | PLAN | PLAN EXPIRY | STATUS | ACTIONS`
- Status badges:
  - `pending` → 🟠 "Pending Assignment"
  - `assigned` → 🔵 "Awaiting Payment"
  - `active` → 🟢 "Active"
  - `expired` → 🔴 "Expired"
- Plan Expiry color coding:
  - 🟢 Green: > 14 days remaining
  - 🟡 Yellow: 7–14 days remaining
  - 🔴 Red: < 7 days or expired

---

### 🔴 Phase 6 — Assign Modal: Auto Plan Type & Price + Teacher Filter
**File**: `frontend/src/components/admin/AssignPersonalSessionModal.jsx`

- **Plan Type dropdown**: Monthly / Quarterly / Half-Yearly / Annually
- **Price auto-fill**: Student's `oneOnOneCategory` pricing నుండి selected plan type price auto-fill (admin edit చేయొచ్చు)
- **Subject Name**: Student's OneOnOneCategory name నుండి auto-fill
- **Teacher Dropdown — Smart Filter**:
  - Student category class-based (Class 6, Class 10 etc.) అయితే:
    - Teacher's `assignedSubjects` లో same classLevel ఉన్న teachers మాత్రమే చూపించు (board ముఖ్యం కాదు!)
    - Display: `Mr. Kumar — Class 10 (Maths, Science)`
  - Student category skill-based (Music, Art etc.) అయితే:
    - All teachers చూపించు → admin manually pick చేస్తాడు
- **Repeat field**: "Until End of Month" → **"Until Plan Expiry Date"** (plan end date వరకు auto-generate slots)

---

### 🔴 Phase 7 — Student Dashboard: Pay Now Modal
**File**: `frontend/src/pages/student/StudentDashboard.jsx`

- 1-on-1 student dashboard లో వాళ్ళ category + pricing చూపించాలి
- Status `'assigned'` అయితే → **"Pay Now"** button show
- Pay Now click:
  1. `GET /student/personal-sessions/my` → **backend నుండి latest price fetch** (cache trust చేయకూడదు!)
  2. Modal open: Plan type + Amount (backend data చూపించు)
  3. Student confirm → `POST /student/personal-sessions/:id/pay`
  4. Success → status `'active'` → slots visible

---

### 🔴 Phase 8 — Plan Expiry Alerts
**File**: `backend/src/controllers/adminController.js`

`getDashboardStats` లో add:
```js
totalOneOnOneStudents: User count where isOneOnOne = true
pendingAssignment: PersonalSession count where status = 'pending'
expiringThisWeek: PersonalSession count where expiryDate < 7 days from now
```

**File**: `frontend/src/pages/AdminDashboard.jsx`
- Total 1-on-1 Students count widget
- ⚠️ Pending Assignments count (action needed badge)
- ⚠️ Plans expiring this week alert

---

### 🟡 Phase 9 — Teacher Dashboard Widget
**File**: `frontend/src/pages/teacher/TeacherDashboard.jsx`

- Upcoming 1-on-1 sessions widget
- Next session: student name + subject + date/time

---

### 🟡 Phase 10 — Student Store Block
**File**: `frontend/src/pages/student/StudentStore.jsx`

```jsx
if (userInfo?.isOneOnOne) {
  return <message>Group classes not available. Your 1-on-1 sessions are managed by admin.</message>
}
```

---

## 🗂️ Files Summary

### NEW Files
- `backend/src/models/OneOnOneCategory.js`

### Backend Changes
- `backend/src/models/User.js` — Phase 2
- `backend/src/controllers/adminController.js` — Phase 3
- `backend/src/routes/adminRoutes.js` — Phase 3
- `backend/src/controllers/personalSessionController.js` — Phase 5
- `backend/src/controllers/authController.js` — Phase 4

### Frontend Changes
- `frontend/src/pages/Register.jsx` — Phase 4
- `frontend/src/pages/admin/AdminPersonalSessions.jsx` — Phase 5
- `frontend/src/components/admin/AssignPersonalSessionModal.jsx` — Phase 6
- `frontend/src/pages/student/StudentDashboard.jsx` — Phase 7
- `frontend/src/pages/AdminDashboard.jsx` — Phase 8
- `frontend/src/pages/teacher/TeacherDashboard.jsx` — Phase 9
- `frontend/src/pages/student/StudentStore.jsx` — Phase 10

---

> **Status: Plan Finalized — Phase 1 నుండి implement చేద్దాం.**

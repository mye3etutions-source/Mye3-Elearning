# 🎯 1-on-1 Personal Training — Implementation Plan
> Status: **Approved & Ready to Implement** — All decisions finalized via discussion

---

## Overview

Students ki currently only group live classes + recorded content unnai. Ee feature tho:
- Student register chesappudu **"1-on-1 Personal Class"** select chestadu
- Admin ki notification vastundi → Admin student tho discuss chesi (outside app) → Teacher + Schedule + Pricing assign chestadu
- Student **payment** chestadu (Monthly / Quarterly / Half-Yearly / Annually plans)
- Teacher **meet link** add chestadu before session
- Session complete → Teacher earnings lo count avutundi

---

## ✅ All Finalized Design Decisions

| Decision | Final Choice |
|----------|-------------|
| **Register lo Board option** | `TS Board / AP Board / CBSE / ICSE / 1-on-1 Personal Class` |
| **1-on-1 select → Class dropdown** | **Hide** cheyali — class avasaram ledu |
| **DB lo board field** | `"1-on-1"` ga store avutundi |
| **Student register details** | Name, Email, Mobile, Password only |
| **Admin notification** | New 1-on-1 student joined → Admin ki alert |
| **Group class access** | ❌ 1-on-1 students ki group classes access ledu |
| **Pricing location** | **Fees Control page lo** (PricingManagement.jsx) — "1-on-1 Personal Training" section add |
| **Pricing plans** | Monthly / Quarterly / Half-Yearly / Annually — existing same pattern |
| **Admin 1-on-1 page** | **Admin Sidebar lo separate** "1-on-1 Training" page |
| **Conflict check** | Teacher ki group class + personal session both check → conflict unte block |
| **Meet link** | Teacher dashboard lo add chestadu session mundu |

---

## 📌 Complete User Flow

```
STEP 1 — STUDENT (Register)
  Register page → Board dropdown lo "1-on-1 Personal Class" select
  → Class dropdown hide avutundi
  → Basic details: Name, Email, Mobile, Password → Register
  → DB lo board: "1-on-1" store avutundi
  → Admin ki notification: "New 1-on-1 student joined — [Name, Mobile]"

STEP 2 — ADMIN (Discuss & Assign)
  Admin sidebar → "1-on-1 Training" page
  → New student notification chusi student details chustadu
  → Student tho outside app (phone/WhatsApp) discuss chestadu:
      - Which subject kavali
      - Preferred timings
      - Any specific requirements
  → App lo: Student select → Teacher select → Schedule add
      (conflict check automatic: group class + existing 1-on-1 check)
  → Pricing plan set chestadu

STEP 3 — STUDENT (Payment)
  Student dashboard lo status: "Session Assigned — Pay Now"
  → Monthly / Quarterly / Half-Yearly / Annually plan select
  → Razorpay/Mock payment → Confirmed

STEP 4 — ADMIN (Meet Link Add)
  Admin → 1-on-1 session assign chestappudey → Meet link add chestadu (mandatory field)
  → Exactly like old Live Class lo admin link ivvadaniki same
  → Student ki link + timing immediately visible avutundi

STEP 5 — SESSION + COMPLETION
  Session time lo → Student + Teacher both "Join" button active (link from admin)
  → Session ends → Admin/Teacher "Mark Completed"
  → Teacher 1-on-1 earnings lo count avutundi (group class earnings separate)
```

---

## 🗄️ Backend Changes

### Database Models

#### [MODIFY] `User.js`
```js
// Board field enum lo "1-on-1" add cheyali
board: { type: String, enum: ['CBSE', 'ICSE', 'TS Board', 'AP Board', '1-on-1'] }

// Teacher ki oneOnOneRate field add
oneOnOneRate: { type: Number, default: 0 }
```

#### [NEW] `PersonalSession.js`
```js
{
  studentId: ObjectId → User,
  teacherId: ObjectId → User,         // Admin assign chesaka set avutundi
  subjectName: String,
  scheduledSlots: [                   // Array of session dates+times
    {
      startTime: Date,
      endTime: Date,
      meetingLink: String,            // Admin adds this when assigning (mandatory)
      platform: enum ['Zoom', 'Google Meet', 'Teams'],
      status: enum ['upcoming', 'completed', 'missed']
    }
  ],
  planType: enum ['oneMonth', 'threeMonths', 'sixMonths', 'twelveMonths'],
  price: Number,                      // Total plan price set by admin
  paymentStatus: enum ['pending', 'paid'],
  razorpayOrderId: String,
  razorpayPaymentId: String,
  status: enum [
    'pending',      // Student registered, admin yet to assign
    'assigned',     // Admin assigned teacher + schedule, student yet to pay
    'active',       // Payment done, sessions running
    'completed',    // All sessions finished
    'cancelled'
  ],
  teacherNote: String,
  payoutStatus: enum ['unpaid', 'paid'],
  payoutId: ObjectId → Payout
}
```

#### [MODIFY] `ClassBundle.js` / Pricing Model
1-on-1 pricing separately store cheyali — new document or existing pricing model lo "1-on-1" section.

---

### API Routes

#### [NEW] `personalSessionRoutes.js`

| Method | Endpoint | Who | Action |
|--------|----------|-----|--------|
| `GET` | `/admin/personal-sessions/students` | Admin | 1-on-1 registered students list |
| `GET` | `/admin/personal-sessions` | Admin | All sessions list |
| `PUT` | `/admin/personal-sessions/:id/assign` | Admin | Teacher + schedule + price assign |
| `GET` | `/admin/personal-sessions/conflict-check` | Admin | Teacher free check |
| `POST` | `/student/personal-sessions/:id/pay` | Student | Payment initiate |
| `POST` | `/student/personal-sessions/:id/verify-payment` | Student | Payment verify |
| `GET` | `/student/personal-sessions` | Student | My sessions list |
| `GET` | `/teacher/personal-sessions` | Teacher | Assigned sessions list |
| `PUT` | `/teacher/personal-sessions/:id/add-link` | Teacher | Add meet link to a slot |
| `PUT` | `/teacher/personal-sessions/:id/complete` | Teacher | Mark session completed |
| `GET` | `/admin/personal-sessions/pricing` | Admin | Get 1-on-1 pricing plans |
| `PUT` | `/admin/personal-sessions/pricing` | Admin | Update 1-on-1 pricing plans |

---

### Controller Logic

#### Conflict Check Logic
```
Input: teacherId + proposedStartTime + proposedEndTime

Check 1: LiveSession model lo teacherId match +
         time overlap (proposedStart < existingEnd && proposedEnd > existingStart)
         → Group class conflict → ❌ Block

Check 2: PersonalSession model lo teacherId match +
         status in ['active'] + scheduledSlots lo same time overlap
         → Another 1-on-1 conflict → ❌ Block

Result: { hasConflict: true/false, conflictDetails: [...] }
```

---

## 🖥️ Frontend Changes

### [MODIFY] `Register.jsx`
- Board dropdown lo **"1-on-1 Personal Class"** option add
- "1-on-1 Personal Class" select chesaka **Class dropdown hide** avutundi
- Submit → `board: "1-on-1"`, `className: ""` ga register

### [MODIFY] `PricingManagement.jsx` (Fees Control page)
- Page bottom lo **"1-on-1 Personal Training"** section add
- Same design pattern: Monthly / Quarterly / Half-Yearly / Annually pricing inputs
- Save button → DB lo 1-on-1 pricing plans store avutundi

### [NEW] `AdminPersonalSessions.jsx` (Admin Sidebar — "1-on-1 Training")
**Two tabs:**
1. **New Students** tab (board = "1-on-1", no session assigned yet):
   - Student name, Mobile, Registered date
   - "Assign Teacher & Schedule" button → Assignment modal
2. **All Sessions** tab:
   - Table: Student | Teacher | Plan | Status | Payment
   - Filters: status, date

### [NEW] `AssignPersonalSessionModal.jsx`
- Student info display (name, mobile)
- Teacher select dropdown
- Schedule add: Date + Time inputs (recurring days possible)
- Conflict check → show result (✅ or ❌ warning with details)
- **Meet Link field** (mandatory — same as LiveMonitor lo link field)
- **Platform** select: Zoom / Google Meet / Teams
- Plan type: Monthly / Quarterly / Half-Yearly / Annually (auto-fill from Fees Control pricing, editable)
- "Assign & Notify Student" button

### [MODIFY] `StudentDashboard.jsx`
- Personal Sessions widget:
  - Status: Pending / Assigned (Pay Now) / Active / Completed
  - "Pay Now" button if status = `assigned`
  - Upcoming session card: Teacher name + Date + Time + "Join" button (15 min before)

### [NEW] `MyPersonalSessions.jsx` (Teacher page — `/teacher/personal-sessions`)
- **Upcoming Sessions** list
  - Each slot: Student name, Subject, Date/Time, "Add Meet Link" button
- **Completed Sessions** + earnings tracking
  - Total 1-on-1 earnings this month (separate from group class earnings)

---

## 🗺️ Navigation Updates

### Admin Sidebar — NEW ITEM
```
+ 1-on-1 Training   → /admin/personal-sessions
```

### Student Dashboard
```
Personal Sessions widget → Pay Now / Join buttons
```

### Teacher Sidebar
```
+ Personal Sessions  → /teacher/personal-sessions
```

---

## 📁 New Files to Create

| File | Type | Location |
|------|------|----------|
| `PersonalSession.js` | DB Model | `backend/src/models/` |
| `personalSessionController.js` | Controller | `backend/src/controllers/` |
| `personalSessionRoutes.js` | Routes | `backend/src/routes/` |
| `AdminPersonalSessions.jsx` | Admin Page | `frontend/src/pages/admin/` |
| `AssignPersonalSessionModal.jsx` | Component | `frontend/src/components/admin/` |
| `MyPersonalSessions.jsx` | Teacher Page | `frontend/src/pages/teacher/` |

---

## 📋 Files to Modify

| File | Change |
|------|--------|
| `backend/src/models/User.js` | `board` enum lo `"1-on-1"` add + `oneOnOneRate` field |
| `backend/src/models/Payout.js` | `liveSessionIds` + `personalSessionIds` separate arrays (both types track cheyyadam) |
| `frontend/src/pages/Register.jsx` | Board dropdown lo "1-on-1 Personal Class" + class hide logic |
| `frontend/src/pages/admin/PricingManagement.jsx` | "1-on-1 Personal Training" pricing section add |
| `frontend/src/pages/admin/TeacherPayouts.jsx` | 1-on-1 earnings row separately show (Group + Personal breakdown) — same Settle button |
| `frontend/src/pages/AdminDashboard.jsx` | 1-on-1 students count widget |
| `frontend/src/pages/student/StudentDashboard.jsx` | Personal sessions widget |
| `frontend/src/pages/teacher/TeacherDashboard.jsx` | Personal sessions widget |
| `frontend/src/components/admin/AdminLayout.jsx` | Sidebar: "1-on-1 Training" menu item |
| `frontend/src/components/teacher/TeacherLayout.jsx` | Sidebar: "Personal Sessions" menu item |
| `frontend/src/App.jsx` | New routes add |
| `backend/src/routes/adminRoutes.js` | Personal session routes connect |
| `backend/src/routes/studentRoutes.js` | Personal session routes connect |
| `backend/src/routes/teacherRoutes.js` | Personal session routes connect |

---

## 💰 Teacher Pay — 1-on-1 Earnings

Existing `TeacherPayouts.jsx` page lo ne — 1-on-1 earnings kuda show avutundi:

```
Teacher Ravi — Teacher Payroll page:
  Group Classes:     ₹2,400  (8 sessions ended)
  1-on-1 Personal:  ₹3,000  (3 sessions completed)   ← NEW
  ─────────────────────────────────────────────
  Total Unpaid:      ₹5,400
  [Settle Payment] button → same modal (Online/Cash/Transaction ID)
```

**Payout.js model change:**
```js
// Old:
sessionIds: [{ type: ObjectId, ref: 'LiveSession' }]

// New:
liveSessionIds:     [{ type: ObjectId, ref: 'LiveSession' }],      // group classes
personalSessionIds: [{ type: ObjectId, ref: 'PersonalSession' }],  // 1-on-1 sessions
```

**Rate source:** `PersonalSession.price` field (admin assign chestappudu set chesindi) — per session rate kadu, total plan price. Sessions complete avvaganee payoutStatus: 'unpaid' → teacher payroll lo count avutundi.

---

## ⚡ Phase-wise Execution Plan

| Phase | Work |
|-------|------|
| **Phase 1** | Backend: `PersonalSession.js` model + `User.js` update + `Payout.js` update |
| **Phase 2** | Backend: `personalSessionController.js` (all CRUD + conflict check) + routes wiring |
| **Phase 3** | Frontend: Register page — "1-on-1 Personal Class" option + class dropdown hide |
| **Phase 4** | Frontend: Fees Control page — "1-on-1 Personal Training" pricing section |
| **Phase 5** | Frontend: Admin — `AdminPersonalSessions.jsx` + `AssignPersonalSessionModal.jsx` + Sidebar item |
| **Phase 6** | Frontend: Teacher Payouts — 1-on-1 earnings breakdown row add |
| **Phase 7** | Frontend: Student Dashboard — Personal Sessions widget + Pay Now + Join button |
| **Phase 8** | Payment integration (student pay after admin assigns) |
| **Phase 9** | Socket.io notifications (student notify when assigned, teacher notify when confirmed) |
| **Phase 10** | Testing + Polish |

---

> **Status: PLAN FULLY APPROVED — Implement cheyyadam start avutundi.**
> Anni decisions finalized. No more changes to plan.

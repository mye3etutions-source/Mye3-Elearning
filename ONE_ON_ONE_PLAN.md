# 🎯 1-on-1 Personal Training — Implementation Plan
> Status: **Pending Approval** — changes cheyyadam ledu, plan only

---

## Overview

Students ki currently only group live classes + recorded content unnai. Ee feature tho:
- Student oka **personal session request** pampudu (subject, time, notes)
- Admin **teacher assign** chestadu + **time slot confirm** chestadu (conflict check tho)
- Student **payment** chestadu (admin assign chesaka)
- Teacher **meet link** add chestadu before session
- Session complete → Teacher earnings lo count avutundi

---

## ✅ Confirmed Design Decisions

| Decision | Choice |
|----------|--------|
| **Pricing** | Teacher profile lo 2 rates: `dailyClassRate` (existing) + `oneOnOneRate` (new). Admin assign appudu override cheyagaladu |
| **Conflict Check** | Admin teacher + time assign chese appudu — teacher's existing LiveSessions tho check |
| **Payment Timing** | Admin assign chesaka → student notified → student pays → confirmed |
| **Refund Policy** | Not needed this phase |
| **Recurring** | Single session only this phase |

---

## 📌 Complete User Flow

```
STEP 1 — STUDENT (Request)
  Login → Student Dashboard → "Request Personal Class" button
  → Form: Subject | Class Level | Preferred Date & Time | Notes
  → Submit → Status: "Pending Review" (no payment yet)

STEP 2 — ADMIN (Assign)
  Admin Dashboard → "1-on-1 Requests" tab (new requests visible)
  → Student request open chestadu
  → Teacher select chestadu
  → Time slot enter chestadu → System conflict check runs
      ✅ Free unte → proceed
      ❌ Conflict unte → "Teacher ki already 6PM-7PM Class 10 Maths session undi" warning
  → Amount enter chestadu (teacher's oneOnOneRate auto-fill, override possible)
  → "Assign & Notify Student" click
  → Student ki notification: "Teacher assigned! Pay ₹500 to confirm"

STEP 3 — STUDENT (Payment)
  Dashboard lo status: "Teacher Assigned — Pay Now"
  → Pay button → Razorpay/Mock payment
  → Payment success → Status: "Confirmed"

STEP 4 — TEACHER (Session Prep)
  Teacher Dashboard → "Personal Sessions" section
  → Session 1 day mundu → Meet link add chestadu
  → Student ki link visible avutundi

STEP 5 — SESSION + COMPLETION
  Session time lo → Both sides "Join" button active
  → Session ends → Teacher/Admin "Mark Completed"
  → Teacher 1-on-1 earnings lo count avutundi (separately from group classes)
```

---

## 🗄️ Backend Changes

### Database Models

#### [MODIFY] `User.js`
Teacher profile lo new field add:
```js
oneOnOneRate: { type: Number, default: 0 }
// (existing pricePerClass = group class rate, already untundi)
```

#### [NEW] `PersonalSession.js`
```js
{
  studentId: ObjectId → User,
  teacherId: ObjectId → User,         // Admin assign chesaka set avutundi
  subjectName: String,
  classLevel: String,
  board: String,
  studentNote: String,                // "Quadratic equations lo doubt undi"
  preferredSlot: Date,                // Student requested time
  confirmedSlot: Date,                // Admin confirmed time
  durationMinutes: Number,            // 60 (default)
  status: enum [
    'pending',      // Student submitted, admin yet to assign
    'assigned',     // Admin assigned teacher, student yet to pay
    'confirmed',    // Payment done
    'completed',    // Session finished
    'cancelled'
  ],
  meetingLink: String,                // Teacher adds before session
  platform: enum ['Zoom', 'Google Meet', 'Teams'],
  price: Number,                      // Set by admin during assignment
  paymentStatus: enum ['pending', 'paid'],
  razorpayOrderId: String,
  razorpayPaymentId: String,
  teacherNote: String,                // Teacher's note to student
  payoutStatus: enum ['unpaid', 'paid'],
  payoutId: ObjectId → Payout
}
```

---

### API Routes

#### [NEW] `personalSessionRoutes.js`

| Method | Endpoint | Who | Action |
|--------|----------|-----|--------|
| `POST` | `/student/personal-sessions/request` | Student | New request submit |
| `GET` | `/student/personal-sessions` | Student | My sessions list |
| `POST` | `/student/personal-sessions/:id/pay` | Student | Payment initiate |
| `POST` | `/student/personal-sessions/:id/verify-payment` | Student | Payment verify |
| `GET` | `/teacher/personal-sessions` | Teacher | My assigned sessions |
| `PUT` | `/teacher/personal-sessions/:id/add-link` | Teacher | Add meet link |
| `PUT` | `/teacher/personal-sessions/:id/complete` | Teacher | Mark completed |
| `GET` | `/admin/personal-sessions` | Admin | All requests list |
| `PUT` | `/admin/personal-sessions/:id/assign` | Admin | Assign teacher + time + price |
| `GET` | `/admin/personal-sessions/conflict-check` | Admin | Check teacher free or not |

---

### Controller Logic

#### Conflict Check Logic
```
Input: teacherId + proposedStartTime + proposedEndTime (= start + 60 min)

Check 1: LiveSession model lo teacherId match +
         (proposedStart < existingEnd && proposedEnd > existingStart)
         → Group class conflict

Check 2: PersonalSession model lo teacherId match +
         status in ['confirmed'] +
         same time overlap
         → Another 1-on-1 conflict

Result: { hasConflict: true/false, conflictDetails: [...] }
```

---

## 🖥️ Frontend Changes

### [MODIFY] Student Dashboard (`StudentDashboard.jsx`)
- New widget: "Personal Sessions" section
  - Status counts: Pending / Confirmed / Completed
  - "Request New Session" button → redirect to `/student/personal-training`
  - Latest session card tho status + pay button (if `assigned` status)

### [NEW] `PersonalTraining.jsx` (Student page — `/student/personal-training`)
**Two tabs:**
1. **Request Session** tab:
   - Form: Subject (dropdown), Class Level (auto-filled from profile), Preferred Date + Time (date picker), Notes textarea
   - Submit button
2. **My Sessions** tab:
   - Session cards: Status badge + Teacher name + Date/Time + Subject + Price
   - "Pay Now" button → if status = `assigned`
   - "Join Session" button → if status = `confirmed` + meetingLink present + within 15 min of start time

### [NEW] `MyPersonalSessions.jsx` (Teacher page — `/teacher/personal-sessions`)
- **Upcoming Sessions** list (status: confirmed)
  - Each card: Student name, Subject, Date/Time, "Add Meet Link" button
- **Completed Sessions** (earnings tracking)
  - Total 1-on-1 earnings this month

### [NEW] `AdminPersonalSessions.jsx` (Admin page — `/admin/personal-sessions`)
**Two sections:**
1. **New Requests** (status: pending) — needs admin action
   - Student name, Subject, Class Level, Preferred Time, Notes
   - "Assign Teacher" button → opens assignment modal
2. **All Sessions** table with filters (status, date, teacher)

### [NEW] `AssignTeacherModal.jsx` (Admin component)
- Step 1: Teacher dropdown (teachers who teach this subject)
- Step 2: Confirmed Date + Time input
- Step 3: Conflict check runs → show result (green tick or red warning)
- Step 4: Amount field (auto-fill from teacher's `oneOnOneRate`, editable)
- "Assign & Notify Student" button

---

## 🗺️ Navigation Updates

### Student Sidebar
```
+ 1-on-1 Sessions    → /student/personal-training
```

### Teacher Sidebar
```
+ Personal Sessions  → /teacher/personal-sessions
```

### Admin Sidebar
```
+ 1-on-1 Sessions   → /admin/personal-sessions
```

---

## 📁 New Files to Create

| File | Type | Location |
|------|------|----------|
| `PersonalSession.js` | DB Model | `backend/src/models/` |
| `personalSessionController.js` | Controller | `backend/src/controllers/` |
| `personalSessionRoutes.js` | Routes | `backend/src/routes/` |
| `PersonalTraining.jsx` | Student Page | `frontend/src/pages/student/` |
| `MyPersonalSessions.jsx` | Teacher Page | `frontend/src/pages/teacher/` |
| `AdminPersonalSessions.jsx` | Admin Page | `frontend/src/pages/admin/` |
| `AssignTeacherModal.jsx` | Component | `frontend/src/components/admin/` |

---

## 📋 Files to Modify

| File | Change |
|------|--------|
| `backend/src/models/User.js` | `oneOnOneRate` field add (teacher profile) |
| `frontend/src/App.jsx` | New routes add |
| `frontend/src/pages/student/StudentDashboard.jsx` | Personal sessions widget add |
| `frontend/src/pages/teacher/TeacherDashboard.jsx` | Personal sessions widget add |
| `frontend/src/components/student/StudentLayout.jsx` | Sidebar menu item add |
| `frontend/src/components/teacher/TeacherLayout.jsx` | Sidebar menu item add |
| `frontend/src/components/admin/AdminLayout.jsx` | Sidebar menu item add |
| `backend/src/routes/teacherRoutes.js` | Personal session routes connect |
| `backend/src/routes/studentRoutes.js` | Personal session routes connect |
| `backend/src/routes/adminRoutes.js` | Personal session routes connect |

---

## ⚡ Phase-wise Execution Plan

| Phase | Work |
|-------|------|
| **Phase 1** | Backend: `PersonalSession.js` model + `User.js` update (`oneOnOneRate` field) |
| **Phase 2** | Backend: `personalSessionController.js` (all CRUD + conflict check logic) + routes wiring |
| **Phase 3** | Frontend: Student — `PersonalTraining.jsx` (request form + my sessions tabs) |
| **Phase 4** | Frontend: Admin — `AdminPersonalSessions.jsx` + `AssignTeacherModal.jsx` |
| **Phase 5** | Frontend: Teacher — `MyPersonalSessions.jsx` + meet link flow |
| **Phase 6** | Payment integration (student pay after admin assigns) |
| **Phase 7** | Dashboard widgets (Student + Teacher dashboards) + Navigation (sidebars) |
| **Phase 8** | Socket.io notifications (student notify when assigned, teacher notify when paid) |
| **Phase 9** | Testing + Polish |

---

> **Next Step:** Ee plan review chesaka "Proceed" cheppu — appudu Phase 1 nunchi implement chestamu.
> Inka ema change kavali ante cheppu — code touch cheyanu.

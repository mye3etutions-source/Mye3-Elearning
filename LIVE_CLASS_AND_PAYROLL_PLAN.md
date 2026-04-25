# 🚀 Live Class System & Teacher Payroll - End-to-End Plan

This document provides a clear, detailed overview of the entire project to implement advanced life class scheduling and a professional teacher payroll system.

---

## 📅 Part 1: Advanced Live Class Management

### 1.1 Scheduling with End-Times
- **Current:** Only has a start time.
- **New:** Every class will have an **End Time**. 
- **Control:** The "Join" or "Start" buttons will automatically disappear exactly when the class time is up. This prevents students or teachers from entering old links.

### 1.2 Multi-Week Navigation
- **View:** The Admin and Teacher dashboards will show a 7-day timetable.
- **Navigation:** I will add **"Next Week"** and **"Previous Week"** buttons. This allows the Admin to schedule classes for the entire month ahead of time.
- **Recurring Classes:** You can select a class slot and "Repeat it for 4 weeks" to quickly fill the calendar.

### 1.3 Conflict Prevention (No Double Booking)
The system will automatically block scheduling if:
1.  **Teacher Conflict:** A teacher is already teaching another class during that time.
2.  **Classroom Conflict:** The same Class Level (e.g., 6th Class) already has a session during that time.

---

## 💰 Part 2: Teacher Payroll System

### 2.1 Automated Session Tracking
- Every teacher's payout is calculated only from classes marked as **"Ended"**. 
- If a class is scheduled but the teacher doesn't take it, it won't be counted for pay.

### 2.2 Teacher-Specific Pricing
Each teacher will have their own rates saved in their profile:
- **Rate A:** For Classes 6 to 10.
- **Rate B:** For Inter 1st & 2nd Year.
*Example: Teacher Ravi might get ₹500 for Class 10, while Teacher Kiran might get ₹600.*

### 2.3 Monthly Payouts
- **Calculations:** Always from the **1st to the end of the month**.
- **Admin View:** A clear table showing: 
    - `Teacher Name` | `Total Completed Classes` | `Total Amount` | `Status (Paid/Pending)`
- **Teacher View:** Each teacher sees their own "Earnings" dashboard so there is 100% transparency.

### 2.4 Payment Confirmation
When the Admin pays the teacher outside the app (e.g., PhonePe, GPay, Bank Transfer):
1.  Admin enters the **Transaction ID** into the system.
2.  Admin marks it as **"Paid"**.
3.  The status updates instantly for the Teacher to see.

---

## ⚡ Part 3: Real-Time Experience (Socket.io)

No one needs to refresh their browser anymore:
- When a Teacher clicks **"Go Live"**, the **"Join Now"** button appears instantly on the Student's screen.
- When an Admin adds or deletes a class, it updates on the Teacher's screen instantly.

---

## 🛠️ Technical Breakdown (The "Under the Hood" Stuff)

- **Database:** 
    - Update `User` model for `payRates`.
    - Update `LiveSession` model for `endTime`.
    - New `Payout` model for monthly tracking.
- **Backend:** 
    - New routes for `/admin/payroll` and `/teacher/earnings`.
    - Improved validation for scheduling overlaps.
- **Frontend:** 
    - New `TeacherPayroll.jsx` (Admin).
    - New `MyEarnings.jsx` (Teacher).
    - Updated `LiveMonitor.jsx` with navigation & end-times.

---

## ✅ Phase-by-Phase Execution
1.  **Phase 1:** Update Database & Backend validation (End times + Conflicts).
2.  **Phase 2:** Implement Real-time updates (Socket.io) in Student/Teacher pages.
3.  **Phase 3:** Build the UI for Multi-week navigation and End-time selection.
4.  **Phase 4:** Build the Teacher Payroll system (Calculation + Admin/Teacher views).
5.  **Phase 5:** Final Testing & Verification.

---

> [!NOTE]
> This plan has been created and approved for implementation.

## ✨ Phase 6: Teacher Management & Payroll Integration (Redesign)
- [x] **Sidebar UI Update:** Remove "Teacher Payroll" route, rename "Teachers" to "Teacher Management".
- [x] **Teacher Management API & Models:** 
   - Ensure Admin can fetch completed/upcoming classes per teacher.
   - Payout model integration to mark payments as 'Settled'.
- [x] **Card View UI (`TeacherManagement.jsx`):**
   - Display a highly polished, interactive grid of Teacher Cards.
- [x] **Detailed Teacher View:**
   - Clicking a card opens a dedicated component showing performance, sessions (past, live, upcoming), assigned subjects, and session-wise payment.
- [x] **Class Live Flow Integration:**
   - Tracking connection and marking a class `ended` so payment calculations trigger.

---

## 💸 Teacher Payment Calculation Workflow (For Discussion)

As discussed, we need a clear and transparent way to calculate exactly how much a teacher should be paid every month. Here is the proposed logic for discussion:

### 1. How we count "Attempted" (Conducted) Classes
- We will **ONLY** count classes where the status is successfully marked as `ended` (meaning the teacher joined and completed the session).
- **Missed or Cancelled Classes:** If a class was scheduled but the teacher never joined (status remained `upcoming` until time passed), it is automatically marked as **Missed** and will **NOT** be added to the month's total.

### 2. Pricing per Class (Class-batti Pricing)
Every teacher will have fixed rates configured in their profile by the Admin:
- **Category A Rate:** Price per class for lower classes (e.g., Classes 6 to 10). Example: ₹400/class.
- **Category B Rate:** Price per class for higher classes (e.g., Inter 1st & 2nd Year). Example: ₹600/class.

### 3. Monthly Total Calculation Formula
At the end of every month (or when the Admin opens the Payouts page), the system will calculate the total like this:
1. **Find all `ended` sessions** for Teacher X in the given month (e.g., April).
2. Separate them into Category A classes and Category B classes.
3. Multiply the count by the respective rates.

> **Example Calculation for Teacher Ravi in April:**
> - Conducted **10 classes** for 10th Standard (Category A @ ₹400) = ₹4,000
> - Conducted **5 classes** for Inter 1st Year (Category B @ ₹600) = ₹3,000
> - **Total April Payout** = ₹7,000

### 4. Admin Action (Payout Settlement Options)
When the Admin is ready to pay the teacher (e.g., the ₹7,000 pending amount), they click **"Settle Payment"**. A popup will appear asking for the **Payment Mode**:

**Option A: Online Payment (UPI / Bank Transfer)**
- Admin selects "Online".
- Admin enters the **Transaction ID** (Required).
- Admin can optionally upload a **Proof of Payment** (e.g., screenshot of the PhonePe success screen).

**Option B: Cash Payment**
- Admin selects "Cash".
- The Transaction ID is not required, but the Admin can leave a small **Note** (e.g., "Handed over cash directly on 3rd May").
- No proof image is required.

Once submitted, the status changes to **"Settled"** and the Teacher can immediately see the Transaction ID / Note / Proof in their own dashboard, ensuring zero confusion!

**Are you okay with this calculation method and these payment settlement options? Check the plan file to see the details.**

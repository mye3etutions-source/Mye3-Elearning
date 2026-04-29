# Mye3-Elearning: Deep Logic Fix & System Architecture Plan

This document outlines the core logic issues currently affecting the project and provides a step-by-step roadmap to fix them WITHOUT automatic hardcoded seeding.

---

## 1. The "Seeding" Problem (Deep Logic)
**Issue:** Current `server.js` calls `seedData()` on every start.
- **Logic Failure:** It checks if "Class 6" exists. If not, it creates it with `board: "TS Board"` and hardcoded prices (999).
- **Conflict:** When you try to add "Class 6 AP Board", the system already has a "Class 6" (TS) and gets confused or duplicates data.
- **Solution:** 
  1. **Disable Seeding:** Remove `seedData()` from `server.js` entirely.
  2. **Manual Control:** All classes (Junior or Senior) must be added ONLY via Admin Dashboard.

---

## 2. Universal Admin Control (Junior + Senior)
**Objective:** Admin should manage 1st to 12th classes in one place.
- **Logic:** 
  - Admin Dashboard -> "Manage Classes" section.
  - **Junior Classes (6-10):** Default them in the UI, but allow adding others (like 5th).
  - **Fields required per class:**
    - `className` (e.g., Class 6)
    - `board` (Select: AP / TS / CBSE)
    - `isBundle` (True for Junior)
    - `totalPrice` (The 999 or any custom price)
- **Subject Management:** Allow adding subjects to these classes dynamically.

---

## 3. Student Dashboard Real-Time Stats
**Issue:** "Attended Classes: 12" and "Notes: 45" are fake numbers in the UI code.
- **Logic Fix:**
  - **Enrolled Subjects:** Count from `userInfo.activeSubscriptions.length`.
  - **Active Classes:** Fetch live/upcoming sessions matching student's class & board from `LiveSession` model.
  - **Notes Available:** Count files in `Material` model matching the student's enrolled subjects.
  - **Total Topics:** Sum of all subjects inside the student's active bundles.

---

## 4. The "₹1" and "Pricing Not Available" Fix
- **Matching Logic:** 
  - Instead of strict board match, if a course board is empty in DB, treat it as "Global" (available for all boards).
  - Use `pricing.oneMonth` if exists, otherwise fallback to base `price`. Never use hardcoded fallback like `200` or `1`.

---

## 5. Implementation Roadmap (Only after User Approval)
1. **Phase 1:** Cleanup `server.js` (Stop Seeding).
2. **Phase 2:** Update `StudentDashboard.jsx` to fetch real counts instead of fake strings.
3. **Phase 3:** Expand Admin UI to allow adding/editing Junior classes with custom boards and prices.
4. **Phase 4:** Final validation with a real "Class 6 AP" test user.
5. **Phase 5:** Payment System Fix - Verify Razorpay integration and restart server to apply `.env` changes.

---

## 6. Payment System (Mock vs Real) Fix
**Issue:** Even after setting `ENABLE_REAL_PAYMENT=true` in `.env`, the system processes a mock payment.
**Root Cause:** 
1. **Hardcoded Mock in Dashboard:** In `StudentDashboard.jsx`, the `handlePayment` function is **100% hardcoded to Mock Payment** (`axios.post('/student/mock-payment-success')`). It doesn't even check `ENABLE_REAL_PAYMENT`.
2. **Node.js Environment Cache:** Changes to `.env` files are not automatically picked up by running Node.js servers. The server must be completely restarted to load the new `ENABLE_REAL_PAYMENT` value into `process.env`.
3. **Frontend VITE_API_URL Build:** If testing locally, the frontend `.env` points to `mye3etutions.com/api` instead of `localhost`. Also, Vite env variables are baked during build, so changing frontend `.env` on live requires a rebuild.

**Solution / Action Plan:**
1. Copy the Real Razorpay logic from `StudentStore.jsx` and implement it in `StudentDashboard.jsx`.
2. Ensure both files correctly check `ENABLE_REAL_PAYMENT` before deciding which flow to execute.
3. Restart the Node.js backend server after making `.env` changes.

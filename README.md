# Vilarci Study – Student & Parent Portal Prototype

A premium, front-end only sales and demo prototype for tuition and coaching centers, built using pure **HTML5, CSS3, and vanilla JavaScript** with zero external libraries or build tools. Works directly from `file://` or local static servers.

---

## 🚀 How to Run the Prototype

### Option 1: Direct File Launch (No server required)
Simply double-click `index.html` or drag it into any modern web browser (Chrome, Edge, Firefox, Safari).

### Option 2: Local Static Server (Recommended for simulation iframes)
If you prefer running via HTTP:
```bash
# Using Node.js npx serve
npx serve "C:\Users\sukri\Documents\GitFirst\Vilarci Study"

# Or using Python
python -m http.server 3000 --directory "C:\Users\sukri\Documents\GitFirst\Vilarci Study"
```
Then visit `http://localhost:3000` or `http://localhost:5000` in your browser.

---

## 📁 File Structure

```
Vilarci Study/
├── index.html         # Application shell with 13 section views, modals, toasts, nav
├── css/
│   └── styles.css     # Design tokens (CSS vars), component styles, dark mode, print CSS
├── js/
│   ├── data.js        # Relational demo dataset (students, fees, attendance, syllabus, etc.)
│   └── main.js        # Hash router, localStorage manager, UI controllers, SVG charts
└── README.md          # Project guide, architecture, and React/Supabase roadmap
```

---

## 🎨 Design System Overview

- **Color Palette**:
  - Primary: `#4F46E5` (Indigo) — calm, authoritative, trustworthy
  - Accent: `#10B981` (Emerald Green) — positive action, completed syllabus, success
  - Warning / Attention: `#F59E0B` (Amber)
  - Neutral Canvas: `#F8F9FC` (Light) / `#0F172A` (Dark Mode)
- **Typography**: Inter (system fallback: `-apple-system`, `Segoe UI`, `sans-serif`)
- **Responsive Layout**: Designed mobile-first for `390px` viewport with seamless desktop scaling (`1024px+`)
- **Printing**: Integrated `@media print` styles for issuing paper marksheets and certificate PDFs directly via browser print (`Ctrl + P`).

---

## 🗺️ React Component & Supabase Migration Roadmap

Every view and data model has been structured as isolated components and normalized relational tables to ensure effortless porting into React + Next.js + Supabase:

| Prototype View / Section | Future React Component | Underlying Supabase Table |
|---|---|---|
| Dashboard (`#home`) | `<DashboardView />` | `students`, `batches`, `attendance`, `fees` |
| Attendance Log (`#attendance`) | `<AttendanceCalendar />` | `attendance` |
| Fee Ledger (`#fees`) | `<FeeLedger />` & `<PaymentModal />` | `fees`, `invoices`, `payments` |
| Timetable (`#timetable`) | `<TimetableGrid />` | `timetable` |
| Syllabus Tracker (`#timetable`) | `<SyllabusTracker />` | `syllabus_topics`, `student_revisions` |
| Focus Study (`#focus`) | `<FocusStudyPlayer />` | `focus_sessions`, `video_notes` |
| Interactive Labs (`#labs`) | `<SimulationViewer />` | `simulations` |
| Curated Videos (`#videos`) | `<VideoLibrary />` | `curated_videos` |
| Tests & Quizzes (`#tests`) | `<TestReports />` & `<QuizModal />` | `tests`, `mcq_questions`, `test_scores` |
| Points & Rewards (`#points`) | `<PointsLeaderboard />` | `points_history`, `badges`, `leaderboard_view` |
| Marksheet & Certs (`#marksheet`) | `<DocumentViewer />` | `issued_documents`, `document_marks` |
| Verification (`#verify`) | `<VerifyDocumentPublic />` | `issued_documents` (public RLS read-only) |
| Settings (`#settings`) | `<StudentSettings />` | `student_profiles`, `user_preferences` |

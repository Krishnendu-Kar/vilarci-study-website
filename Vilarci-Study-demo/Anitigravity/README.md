# Vilarci Study – Student & Parent Learning Portal Prototype

An ultra-polished, front-end only sales and demo prototype for tuition and coaching academies. Built with pure **HTML5, CSS3, and modern Vanilla JavaScript** with zero external libraries or build steps. Operates directly via `file://` or local static servers.

---

## 📁 Project Structure

```
Anitigravity/
├── index.html         # Application shell with 13 section views, modals, toasts, nav
├── css/
│   └── styles.css     # Design tokens, Plus Jakarta Sans typography, high-contrast dark mode, print CSS
├── js/
│   ├── data.js        # Relational demo dataset (students, fees, attendance, timetable, syllabus, tests, simulations)
│   └── main.js        # Hash router, localStorage manager, UI controllers, SVG charts, focus timers
└── README.md          # Architecture overview, Git instructions, and React/Supabase roadmap
```

---

## 🚀 How to Run the Prototype

### Option 1: Direct File Launch (No server required)
Simply double-click `index.html` or drag it into any modern web browser (Google Chrome, Microsoft Edge, Mozilla Firefox, Apple Safari).

### Option 2: Local Static Server
```bash
# Using Node.js npx serve
npx serve "C:\Users\sukri\Documents\GitFirst\vilarci-study-website\Vilarci-Study-demo\Anitigravity"

# Or using Python 3
python -m http.server 3000 --directory "C:\Users\sukri\Documents\GitFirst\vilarci-study-website\Vilarci-Study-demo\Anitigravity"
```
Visit `http://localhost:3000` in your browser.

---

## 🔗 Connecting to GitHub (Dual-Account SSH Setup)

Per the machine setup in `C:\Users\sukri\Documents\GitFirst\GIT_SETUP_GUIDE.md`, this laptop has two isolated GitHub accounts configured via SSH aliases:
- **Personal Account**: `Krishnendu-Kar` (`sukrish14369@gmail.com`) using SSH alias `github-krishnenedu`
- **Target Repo**: `git@github.com:Krishnendu-Kar/vilarci-study-website.git`

### Recommended Git Commands:

To connect and push from your repository root (`C:\Users\sukri\Documents\GitFirst\vilarci-study-website`):

```bash
cd "C:\Users\sukri\Documents\GitFirst\vilarci-study-website"

# 1. Initialize git if not already initialized
git init

# 2. Set local identity for this repo (prevents conflict with CarsVilla account)
git config --local user.name "LocalRapid"
git config --local user.email "sukrish14369@gmail.com"

# 3. Add remote using the dedicated SSH alias 'github-krishnenedu'
# NOTE: Replace 'github.com' with 'github-krishnenedu'
git remote add origin git@github-krishnenedu:Krishnendu-Kar/vilarci-study-website.git

# Or if remote already exists, update its URL:
git remote set-url origin git@github-krishnenedu:Krishnendu-Kar/vilarci-study-website.git

# 4. Stage, commit, and push to main
git add .
git commit -m "feat: Add professional Vilarci Study prototype"
git branch -M main
git push -u origin main
```

---

## 🗺️ React & Supabase Migration Roadmap

| Prototype Feature | Future React Component | Supabase Table / Service |
|---|---|---|
| Dashboard (`#home`) | `<DashboardView />` | `students`, `batches`, `attendance`, `fees` |
| Attendance Log (`#attendance`) | `<AttendanceCalendar />` | `attendance` (date, student_id, status) |
| Fee Ledger (`#fees`) | `<FeeLedger />` & `<PaymentModal />` | `fees`, `invoices`, `payments` |
| Timetable (`#timetable`) | `<TimetableGrid />` | `timetable` (day, slot, teacher, room) |
| Syllabus Tracker (`#timetable`) | `<SyllabusTracker />` | `syllabus_topics`, `student_revisions` |
| Focus Study (`#focus`) | `<FocusStudyPlayer />` | `focus_sessions`, `video_notes` |
| Interactive STEM Labs (`#labs`) | `<SimulationViewer />` | `simulations` |
| Video Library (`#videos`) | `<VideoLibrary />` | `curated_videos` |
| Tests & Analytics (`#tests`) | `<TestReports />` & `<PracticeQuiz />` | `tests`, `mcq_questions`, `test_scores` |
| Points & Rewards (`#points`) | `<PointsLeaderboard />` | `points_history`, `badges`, `leaderboard_view` |
| Marksheet & Certs (`#marksheet`) | `<DocumentViewer />` | `issued_documents`, `document_marks` |
| Credential Lookup (`#verify`) | `<VerifyDocumentPublic />` | `issued_documents` (public RLS read-only) |
| Settings & Profile (`#settings`) | `<StudentSettings />` | `student_profiles`, `user_preferences` |

# Vilarci Study – Multi-Coaching & Tuition Platform (Demo v2.0 Maroon Edition)

An ultra-polished, front-end only prototype for a **Multi-Coaching and Independent Tuition Portal**. Built with pure **HTML5, CSS3 (Maroon Edition Design Tokens), and modern Vanilla JavaScript** with zero external libraries or build steps. Works seamlessly via `file://` or local static servers.

---

## 🌟 What's New in Version 2.0 (Maroon Edition)

1. **Multi-Coaching & Teacher Linking Architecture**:
   - Rather than a single coaching or school dashboard, students can link with **multiple independent teachers or coaching institutes** (e.g. *Stellar Academy*, *Apex Chemistry*, *Zenith Biology*, *Horizon English Studio*).
   - Switch active teacher/center from the sidebar or select **"🌟 All Enrolled Centers"** for a unified aggregate view.
   - Join new coaching centers using 6-character invite codes (e.g., `STLR10`, `APEX99`, `ZEN77`, `HORIZ5`) with instant live faculty preview.

2. **Multi-Student Profiles (Up to 5 Students per Household Account)**:
   - Households can manage up to 5 student profiles (e.g. siblings in different grades).
   - Includes interactive **"+ Add Student Profile"** modal with custom class, academic board, and initial center enrollment.
   - Instant profile switching from the sidebar and from the dedicated **Parent Household Overview**.

3. **Center-Specific Academic Modules**:
   - **Fees & Invoices**: Filtered by teacher/coaching with colorful badges. Unified view calculates total outstanding fees across all faculties. Simulated payment generates authentic vouchers stamped by the specific coaching institute.
   - **Timetable & Topics**: Weekly schedule and curriculum progression curated by each teacher.
   - **Attendance Log**: Per-faculty attendance calendar with instant simulated QR check-in (+10 pts).
   - **Faculty Videos**: Curated lessons and masterclasses recorded by each center's faculty.
   - **Tests & Analytics**: Center-conducted assessments, pure SVG score charts, weak topic diagnostics, and 5-MCQ interactive practice quizzes.
   - **Academic Marksheets**: Branded credentials issued by each academy with director signatures and verification refs.

4. **Universal Generic Modules (Accessible to All)**:
   - **Interactive STEM Simulation Labs**: High-performance PhET virtual experiments (Physics, Chemistry, Biology) open to all students across all faculties.
   - **Independent Focus Study Room**: YouTube nocookie distraction-free player, customizable Pomodoro timer, and autosaved scratchpad notes.
   - **Credential Verification Engine**: Registry lookup for official credentials.

5. **Regal Maroon Palette**:
   - Authoritative Scholarly Maroon (`#800020`) primary with warm Golden Amber (`#D97706`) accents.
   - High-contrast Deep Velvet Wine / Obsidian Dark Mode (`#12070A`, `#1E0E14`).

---

## 📁 Project Structure

```
Anitigravity/
├── index.html         # Application shell with 13 section views, modals, toasts, nav
├── css/
│   └── styles.css     # Maroon Edition tokens, teacher hero banners, student cards, print CSS
├── js/
│   ├── data.js        # Relational dataset (centers, students, fees, attendance, timetable, syllabus, tests, simulations)
│   └── main.js        # Multi-center switcher, multi-student manager, hash router, localStorage manager
└── README.md          # Architecture overview, Git instructions, and React/Supabase roadmap
```

---

## 🚀 How to Run the Prototype

### Option 1: Direct File Launch (No server required)
Simply double-click `index.html` or drag it into any modern web browser (Google Chrome, Microsoft Edge, Mozilla Firefox, Apple Safari).

### Option 2: Local Static Server
```bash
# Using Python 3
python -m http.server 3000 --directory "C:\Users\sukri\Documents\GitFirst\vilarci-study-website\Vilarci-Study-demo\Anitigravity"
```
Visit `http://localhost:3000` in your browser.

---

## 🔗 Connecting to GitHub (Dual-Account SSH Setup)

Per the machine setup in `C:\Users\sukri\Documents\GitFirst\GIT_SETUP_GUIDE.md`:
- **Personal Account**: `Krishnendu-Kar` (`sukrish14369@gmail.com`) using SSH alias `github-krishnenedu`
- **Target Repo**: `git@github.com:Krishnendu-Kar/vilarci-study-website.git`

```bash
cd "C:\Users\sukri\Documents\GitFirst\vilarci-study-website"

git add .
git commit -m "feat: upgrade to Vilarci Study v2.0 (Maroon Edition, Multi-Coaching, Multi-Student)"
git push origin main
```

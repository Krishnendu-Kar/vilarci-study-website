// js/data.js — Vilarci Study: All Demo Data
// Structure mirrors future Supabase tables (ids, foreign keys).
// Loaded via <script> tag — no import/export. Attaches to window.DATA.

window.DATA = {

  // ─── TABLE: center ───────────────────────────────────────────────────────
  center: {
    id: 'center-1',
    name: 'Stellar Academy',
    tagline: 'Ignite. Learn. Excel.',
    address: '42, Orbit Lane, Science Nagar, Pune – 411021',
    phone: '+91 98765 43210',
    email: 'hello@stellaracademy.in',
    logo_text: 'SA',
    established: 2018
  },

  // ─── TABLE: batches ──────────────────────────────────────────────────────
  batches: [
    {
      id: 'batch-1',
      name: 'Class 10 – Morning Batch',
      class: '10',
      subjects: ['Maths', 'Physics', 'Chemistry', 'Biology', 'English'],
      year: 2025,
      schedule: 'Mon–Sat, 9:00 AM – 11:00 AM'
    }
  ],

  // ─── TABLE: students ─────────────────────────────────────────────────────
  students: [
    {
      id: 'student-1',
      name: 'Aryan Mehta',
      roll: 'SA-101',
      batch_id: 'batch-1',
      dob: '2010-03-14',
      phone: '+91 99887 76655',
      parent_name: 'Sunita Mehta',
      parent_phone: '+91 98765 11223',
      photo_initials: 'AM',
      points: 1240,
      streak: 12,
      color: '#4F46E5'
    },
    {
      id: 'student-2',
      name: 'Priya Mehta',
      roll: 'SA-102',
      batch_id: 'batch-1',
      dob: '2011-07-22',
      phone: '+91 99887 76656',
      parent_name: 'Sunita Mehta',
      parent_phone: '+91 98765 11223',
      photo_initials: 'PM',
      points: 980,
      streak: 7,
      color: '#EC4899'
    }
  ],

  // ─── TABLE: attendance ───────────────────────────────────────────────────
  // 3 months × 5 subjects × school days. status: 'present'|'absent'|'late'
  attendance: (function () {
    var records = [];
    var id = 1;
    var subjects = ['Maths', 'Physics', 'Chemistry', 'Biology', 'English'];
    // Each school day has 2 subjects from the timetable pattern
    // For simplicity, we assign one status per day per student (same for all subjects that day)
    // Map: 0=Sun,1=Mon,2=Tue,3=Wed,4=Thu,5=Fri,6=Sat

    function addMonth(year, month, student_id, presentRate, absentRate) {
      var daysInMonth = new Date(year, month, 0).getDate();
      for (var d = 1; d <= daysInMonth; d++) {
        var date = new Date(year, month - 1, d);
        var dow = date.getDay(); // 0=Sun
        if (dow === 0) continue; // skip Sunday
        var rand = Math.random();
        var status;
        if (rand < presentRate) status = 'present';
        else if (rand < presentRate + 0.05) status = 'late';
        else status = 'absent';

        // Each day: 2 subjects scheduled
        var daySubjects = [
          ['Maths', 'Physics'],      // Mon
          ['Chemistry', 'Biology'],  // Tue
          ['English', 'Maths'],      // Wed
          ['Physics', 'Chemistry'],  // Thu
          ['Biology', 'English'],    // Fri
          ['Maths', 'Physics']       // Sat (revision counts as Maths+Physics)
        ][dow - 1] || ['Maths'];

        daySubjects.forEach(function (subj) {
          var dateStr = year + '-' + String(month).padStart(2, '0') + '-' + String(d).padStart(2, '0');
          records.push({
            id: 'att-' + (id++),
            student_id: student_id,
            date: dateStr,
            status: status,
            subject: subj
          });
        });
      }
    }

    // Student 1: Aug ~88% present, Sep ~85%, Oct ~90%
    Math.seedrandom ? Math.seedrandom('s1') : null;
    // Use deterministic-ish values by fixing seed pattern
    addMonth(2025, 8, 'student-1', 0.88, 0.06);
    addMonth(2025, 9, 'student-1', 0.85, 0.08);
    addMonth(2025, 10, 'student-1', 0.90, 0.05);

    // Student 2: slightly lower attendance
    addMonth(2025, 8, 'student-2', 0.80, 0.10);
    addMonth(2025, 9, 'student-2', 0.78, 0.12);
    addMonth(2025, 10, 'student-2', 0.83, 0.08);

    return records;
  }()),

  // ─── TABLE: fees ─────────────────────────────────────────────────────────
  fees: [
    // Student 1
    { id: 'fee-1', student_id: 'student-1', month: 'August 2025',    amount: 3500, due_date: '2025-08-05', paid_date: '2025-08-03', status: 'paid',    mode: 'UPI',           receipt_no: 'RCP-2025-081' },
    { id: 'fee-2', student_id: 'student-1', month: 'September 2025', amount: 3500, due_date: '2025-09-05', paid_date: '2025-09-04', status: 'paid',    mode: 'Bank Transfer', receipt_no: 'RCP-2025-091' },
    { id: 'fee-3', student_id: 'student-1', month: 'October 2025',   amount: 3500, due_date: '2025-10-05', paid_date: '2025-10-02', status: 'paid',    mode: 'Cash',          receipt_no: 'RCP-2025-101' },
    { id: 'fee-4', student_id: 'student-1', month: 'November 2025',  amount: 3500, due_date: '2025-11-05', paid_date: null,         status: 'pending', mode: null,            receipt_no: null },
    // Student 2
    { id: 'fee-5', student_id: 'student-2', month: 'August 2025',    amount: 3500, due_date: '2025-08-05', paid_date: '2025-08-06', status: 'paid',    mode: 'UPI',           receipt_no: 'RCP-2025-082' },
    { id: 'fee-6', student_id: 'student-2', month: 'September 2025', amount: 3500, due_date: '2025-09-05', paid_date: '2025-09-07', status: 'paid',    mode: 'UPI',           receipt_no: 'RCP-2025-092' },
    { id: 'fee-7', student_id: 'student-2', month: 'October 2025',   amount: 3500, due_date: '2025-10-05', paid_date: '2025-10-08', status: 'paid',    mode: 'Cash',          receipt_no: 'RCP-2025-102' },
    { id: 'fee-8', student_id: 'student-2', month: 'November 2025',  amount: 3500, due_date: '2025-11-05', paid_date: null,         status: 'pending', mode: null,            receipt_no: null }
  ],

  // ─── TABLE: timetable ────────────────────────────────────────────────────
  timetable: [
    { id: 'tt-1',  batch_id: 'batch-1', day_of_week: 'Mon', subject: 'Maths',     start_time: '09:00', end_time: '10:00', teacher: 'Mr. Ramesh Iyer' },
    { id: 'tt-2',  batch_id: 'batch-1', day_of_week: 'Mon', subject: 'Physics',   start_time: '10:00', end_time: '11:00', teacher: 'Ms. Deepa Nair' },
    { id: 'tt-3',  batch_id: 'batch-1', day_of_week: 'Tue', subject: 'Chemistry', start_time: '09:00', end_time: '10:00', teacher: 'Mr. Arvind Kulkarni' },
    { id: 'tt-4',  batch_id: 'batch-1', day_of_week: 'Tue', subject: 'Biology',   start_time: '10:00', end_time: '11:00', teacher: 'Ms. Kavitha Reddy' },
    { id: 'tt-5',  batch_id: 'batch-1', day_of_week: 'Wed', subject: 'English',   start_time: '09:00', end_time: '10:00', teacher: 'Ms. Fiona D\'Souza' },
    { id: 'tt-6',  batch_id: 'batch-1', day_of_week: 'Wed', subject: 'Maths',     start_time: '10:00', end_time: '11:00', teacher: 'Mr. Ramesh Iyer' },
    { id: 'tt-7',  batch_id: 'batch-1', day_of_week: 'Thu', subject: 'Physics',   start_time: '09:00', end_time: '10:00', teacher: 'Ms. Deepa Nair' },
    { id: 'tt-8',  batch_id: 'batch-1', day_of_week: 'Thu', subject: 'Chemistry', start_time: '10:00', end_time: '11:00', teacher: 'Mr. Arvind Kulkarni' },
    { id: 'tt-9',  batch_id: 'batch-1', day_of_week: 'Fri', subject: 'Biology',   start_time: '09:00', end_time: '10:00', teacher: 'Ms. Kavitha Reddy' },
    { id: 'tt-10', batch_id: 'batch-1', day_of_week: 'Fri', subject: 'English',   start_time: '10:00', end_time: '11:00', teacher: 'Ms. Fiona D\'Souza' },
    { id: 'tt-11', batch_id: 'batch-1', day_of_week: 'Sat', subject: 'Maths',     start_time: '09:00', end_time: '10:00', teacher: 'Mr. Ramesh Iyer' },
    { id: 'tt-12', batch_id: 'batch-1', day_of_week: 'Sat', subject: 'Physics',   start_time: '10:00', end_time: '11:00', teacher: 'Ms. Deepa Nair' }
  ],

  // ─── TABLE: syllabus ─────────────────────────────────────────────────────
  syllabus: [
    // Maths
    { id: 'syl-1',  batch_id: 'batch-1', subject: 'Maths',     chapter: 'Real Numbers',         topic: 'Euclid\'s Division Lemma',         planned_date: '2025-08-04', covered_date: '2025-08-04', status: 'covered',  revised_by_student: true  },
    { id: 'syl-2',  batch_id: 'batch-1', subject: 'Maths',     chapter: 'Real Numbers',         topic: 'Fundamental Theorem of Arithmetic', planned_date: '2025-08-11', covered_date: '2025-08-11', status: 'covered',  revised_by_student: true  },
    { id: 'syl-3',  batch_id: 'batch-1', subject: 'Maths',     chapter: 'Polynomials',          topic: 'Zeros of a Polynomial',            planned_date: '2025-08-18', covered_date: '2025-08-18', status: 'covered',  revised_by_student: false },
    { id: 'syl-4',  batch_id: 'batch-1', subject: 'Maths',     chapter: 'Polynomials',          topic: 'Division Algorithm',               planned_date: '2025-09-01', covered_date: '2025-09-01', status: 'partial',  revised_by_student: false },
    { id: 'syl-5',  batch_id: 'batch-1', subject: 'Maths',     chapter: 'Quadratic Equations',  topic: 'Solving by Factorisation',         planned_date: '2025-09-15', covered_date: null,         status: 'upcoming', revised_by_student: false },
    // Physics
    { id: 'syl-6',  batch_id: 'batch-1', subject: 'Physics',   chapter: 'Light – Reflection',   topic: 'Laws of Reflection',               planned_date: '2025-08-05', covered_date: '2025-08-05', status: 'covered',  revised_by_student: true  },
    { id: 'syl-7',  batch_id: 'batch-1', subject: 'Physics',   chapter: 'Light – Reflection',   topic: 'Image Formation by Mirrors',       planned_date: '2025-08-12', covered_date: '2025-08-12', status: 'covered',  revised_by_student: true  },
    { id: 'syl-8',  batch_id: 'batch-1', subject: 'Physics',   chapter: 'Light – Refraction',   topic: 'Snell\'s Law',                     planned_date: '2025-09-02', covered_date: '2025-09-02', status: 'covered',  revised_by_student: false },
    { id: 'syl-9',  batch_id: 'batch-1', subject: 'Physics',   chapter: 'Electricity',          topic: 'Ohm\'s Law & Resistance',          planned_date: '2025-09-16', covered_date: null,         status: 'skipped',  revised_by_student: false },
    { id: 'syl-10', batch_id: 'batch-1', subject: 'Physics',   chapter: 'Electricity',          topic: 'Series & Parallel Circuits',       planned_date: '2025-10-06', covered_date: null,         status: 'upcoming', revised_by_student: false },
    // Chemistry
    { id: 'syl-11', batch_id: 'batch-1', subject: 'Chemistry', chapter: 'Chemical Reactions',   topic: 'Types of Chemical Reactions',      planned_date: '2025-08-06', covered_date: '2025-08-06', status: 'covered',  revised_by_student: true  },
    { id: 'syl-12', batch_id: 'batch-1', subject: 'Chemistry', chapter: 'Chemical Reactions',   topic: 'Oxidation & Reduction',            planned_date: '2025-08-13', covered_date: '2025-08-13', status: 'covered',  revised_by_student: true  },
    { id: 'syl-13', batch_id: 'batch-1', subject: 'Chemistry', chapter: 'Acids, Bases & Salts', topic: 'Properties of Acids and Bases',    planned_date: '2025-09-03', covered_date: '2025-09-03', status: 'covered',  revised_by_student: false },
    { id: 'syl-14', batch_id: 'batch-1', subject: 'Chemistry', chapter: 'Acids, Bases & Salts', topic: 'pH Scale',                         planned_date: '2025-09-17', covered_date: '2025-09-18', status: 'partial',  revised_by_student: false },
    { id: 'syl-15', batch_id: 'batch-1', subject: 'Chemistry', chapter: 'Metals & Non-metals',  topic: 'Properties of Metals',             planned_date: '2025-10-07', covered_date: null,         status: 'upcoming', revised_by_student: false },
    // Biology
    { id: 'syl-16', batch_id: 'batch-1', subject: 'Biology',   chapter: 'Life Processes',       topic: 'Nutrition in Plants',              planned_date: '2025-08-07', covered_date: '2025-08-07', status: 'covered',  revised_by_student: true  },
    { id: 'syl-17', batch_id: 'batch-1', subject: 'Biology',   chapter: 'Life Processes',       topic: 'Respiration',                      planned_date: '2025-08-14', covered_date: '2025-08-14', status: 'covered',  revised_by_student: false },
    { id: 'syl-18', batch_id: 'batch-1', subject: 'Biology',   chapter: 'Control & Coordination','topic': 'Nervous System',                planned_date: '2025-09-04', covered_date: '2025-09-05', status: 'partial',  revised_by_student: false },
    { id: 'syl-19', batch_id: 'batch-1', subject: 'Biology',   chapter: 'Control & Coordination','topic': 'Hormones',                      planned_date: '2025-09-18', covered_date: null,         status: 'upcoming', revised_by_student: false },
    { id: 'syl-20', batch_id: 'batch-1', subject: 'Biology',   chapter: 'Reproduction',         topic: 'Sexual Reproduction in Flowering Plants', planned_date: '2025-10-08', covered_date: null, status: 'upcoming', revised_by_student: false },
    // English
    { id: 'syl-21', batch_id: 'batch-1', subject: 'English',   chapter: 'Prose – First Flight', topic: 'A Letter to God',                  planned_date: '2025-08-08', covered_date: '2025-08-08', status: 'covered',  revised_by_student: true  },
    { id: 'syl-22', batch_id: 'batch-1', subject: 'English',   chapter: 'Prose – First Flight', topic: 'Nelson Mandela: Long Walk to Freedom', planned_date: '2025-08-15', covered_date: '2025-08-15', status: 'covered', revised_by_student: true },
    { id: 'syl-23', batch_id: 'batch-1', subject: 'English',   chapter: 'Grammar',              topic: 'Reported Speech',                  planned_date: '2025-09-05', covered_date: '2025-09-05', status: 'covered',  revised_by_student: false },
    { id: 'syl-24', batch_id: 'batch-1', subject: 'English',   chapter: 'Grammar',              topic: 'Tenses – Advanced',                planned_date: '2025-09-19', covered_date: null,         status: 'skipped',  revised_by_student: false },
    { id: 'syl-25', batch_id: 'batch-1', subject: 'English',   chapter: 'Writing Skills',       topic: 'Formal Letter Writing',            planned_date: '2025-10-09', covered_date: null,         status: 'upcoming', revised_by_student: false }
  ],

  // ─── TABLE: tests ────────────────────────────────────────────────────────
  tests: [
    {
      id: 'test-1',
      student_id: 'student-1',
      batch_id: 'batch-1',
      name: 'Unit Test 1',
      subject: 'Maths',
      date: '2025-09-06',
      total_marks: 25,
      marks_obtained: 22,
      duration_min: 60,
      topics_tested: ['Euclid\'s Division Lemma', 'Fundamental Theorem of Arithmetic', 'Zeros of a Polynomial'],
      weak_topics: ['Division Algorithm']
    },
    {
      id: 'test-2',
      student_id: 'student-1',
      batch_id: 'batch-1',
      name: 'Unit Test 2',
      subject: 'Physics',
      date: '2025-09-20',
      total_marks: 25,
      marks_obtained: 18,
      duration_min: 60,
      topics_tested: ['Laws of Reflection', 'Image Formation by Mirrors', 'Snell\'s Law'],
      weak_topics: ['Snell\'s Law', 'Mirror formula derivation']
    },
    {
      id: 'test-3',
      student_id: 'student-1',
      batch_id: 'batch-1',
      name: 'Mid Term',
      subject: 'All Subjects',
      date: '2025-10-04',
      total_marks: 100,
      marks_obtained: 81,
      duration_min: 180,
      topics_tested: ['All topics Aug–Sep'],
      weak_topics: ['Ohm\'s Law', 'pH Scale', 'Division Algorithm']
    },
    {
      id: 'test-4',
      student_id: 'student-1',
      batch_id: 'batch-1',
      name: 'Weekly Quiz – Chemistry',
      subject: 'Chemistry',
      date: '2025-10-11',
      total_marks: 20,
      marks_obtained: 17,
      duration_min: 30,
      topics_tested: ['Types of Chemical Reactions', 'Oxidation & Reduction', 'Properties of Acids and Bases'],
      weak_topics: ['Balancing equations']
    }
  ],

  // ─── TABLE: leaderboard ──────────────────────────────────────────────────
  leaderboard: [
    { rank: 1,  student_name: 'Rahul Sharma',    points: 1840, badge: '🥇' },
    { rank: 2,  student_name: 'Ananya Patel',    points: 1780, badge: '🥈' },
    { rank: 3,  student_name: 'Ishaan Verma',    points: 1650, badge: '🥉' },
    { rank: 4,  student_name: 'Meera Joshi',     points: 1520, badge: '⭐' },
    { rank: 5,  student_name: 'Vivek Gupta',     points: 1490, badge: '⭐' },
    { rank: 6,  student_name: 'Tanvi Desai',     points: 1380, badge: '⭐' },
    { rank: 7,  student_name: 'Aryan Mehta',     points: 1240, badge: '⭐', is_self: true },
    { rank: 8,  student_name: 'Riya Kapoor',     points: 1190, badge: '⭐' },
    { rank: 9,  student_name: 'Aditya Singh',    points: 1120, badge: '⭐' },
    { rank: 10, student_name: 'Simran Kaur',     points: 1050, badge: '⭐' },
    { rank: 11, student_name: 'Nikhil Tiwari',   points: 980,  badge: '⭐' },
    { rank: 12, student_name: 'Pooja Rao',       points: 920,  badge: '⭐' },
    { rank: 13, student_name: 'Karan Malhotra',  points: 870,  badge: '⭐' },
    { rank: 14, student_name: 'Shreya Bhatt',    points: 810,  badge: '⭐' },
    { rank: 15, student_name: 'Dev Mishra',      points: 760,  badge: '⭐' }
  ],

  // ─── TABLE: simulations ──────────────────────────────────────────────────
  simulations: [
    {
      id: 'sim-1',
      title: 'Projectile Motion',
      subject: 'Physics',
      class: '10',
      description: 'Explore how the angle and speed of a launch affects the trajectory of a projectile.',
      phet_url: 'https://phet.colorado.edu/sims/html/projectile-motion/latest/projectile-motion_en.html',
      thumbnail_emoji: '🚀'
    },
    {
      id: 'sim-2',
      title: 'Wave on a String',
      subject: 'Physics',
      class: '10',
      description: 'Wiggle the end of the string and make waves, or adjust the frequency and amplitude.',
      phet_url: 'https://phet.colorado.edu/sims/html/wave-on-a-string/latest/wave-on-a-string_en.html',
      thumbnail_emoji: '〰️'
    },
    {
      id: 'sim-3',
      title: 'Build an Atom',
      subject: 'Chemistry',
      class: '10',
      description: 'Build an atom from protons, neutrons and electrons and see how it changes element and charge.',
      phet_url: 'https://phet.colorado.edu/sims/html/build-an-atom/latest/build-an-atom_en.html',
      thumbnail_emoji: '⚛️'
    },
    {
      id: 'sim-4',
      title: 'Acid–Base Solutions',
      subject: 'Chemistry',
      class: '10',
      description: 'How do strong and weak acids differ? Use litmus paper, pH meter and conductivity tester.',
      phet_url: 'https://phet.colorado.edu/sims/html/acid-base-solutions/latest/acid-base-solutions_en.html',
      thumbnail_emoji: '🧪'
    },
    {
      id: 'sim-5',
      title: 'Molecule Shapes',
      subject: 'Chemistry',
      class: '10',
      description: 'Explore molecule shapes by building molecules in 3D and connecting atoms together.',
      phet_url: 'https://phet.colorado.edu/sims/html/molecule-shapes/latest/molecule-shapes_en.html',
      thumbnail_emoji: '🔬'
    },
    {
      id: 'sim-6',
      title: 'Natural Selection',
      subject: 'Biology',
      class: '10',
      description: 'Add bunnies, wolves and food to see how traits evolve through natural selection.',
      phet_url: 'https://phet.colorado.edu/sims/html/natural-selection/latest/natural-selection_en.html',
      thumbnail_emoji: '🐇'
    }
  ],

  // ─── TABLE: videos ───────────────────────────────────────────────────────
  videos: [
    { id: 'vid-1', title: 'Quadratic Equations – Full Concept',    subject: 'Maths',     chapter: 'Quadratic Equations',  youtube_id: 'IWigcMGGMIs', duration: '18:24', description: 'Step-by-step explanation of factorisation, completing the square and quadratic formula.' },
    { id: 'vid-2', title: 'Introduction to Trigonometry',          subject: 'Maths',     chapter: 'Trigonometry',         youtube_id: 'F21S9Wpi0y8', duration: '22:10', description: 'Sin, cos, tan ratios with real-world examples and practice problems.' },
    { id: 'vid-3', title: 'Laws of Motion – Newton\'s 3 Laws',    subject: 'Physics',   chapter: 'Force & Motion',       youtube_id: 'ZM8ECpBuQYE', duration: '15:44', description: 'Clear visual explanation of Newton\'s laws with animations.' },
    { id: 'vid-4', title: 'Electricity & Circuits',                subject: 'Physics',   chapter: 'Electricity',          youtube_id: 'BLbHC7elJAM', duration: '20:30', description: 'From Ohm\'s law to complex circuits – explained simply.' },
    { id: 'vid-5', title: 'Atomic Structure',                      subject: 'Chemistry', chapter: 'Structure of Atom',    youtube_id: 'FSyAehMdpyQ', duration: '16:52', description: 'Bohr\'s model, electronic configuration and the periodic table.' },
    { id: 'vid-6', title: 'Chemical Reactions & Equations',        subject: 'Chemistry', chapter: 'Chemical Reactions',   youtube_id: 'vt8pvLByTfQ', duration: '19:05', description: 'Balancing equations, types of reactions with mnemonics.' },
    { id: 'vid-7', title: 'Cell: The Unit of Life',                subject: 'Biology',   chapter: 'The Cell',             youtube_id: '8IlzKri08kQ', duration: '24:18', description: 'Plant vs animal cells, organelles and their functions.' },
    { id: 'vid-8', title: 'English Grammar: Reported Speech',      subject: 'English',   chapter: 'Grammar',              youtube_id: 'Dqjb_mdvhM4', duration: '12:00', description: 'Direct to indirect speech conversion rules with examples.' }
  ],

  // ─── TABLE: documents ────────────────────────────────────────────────────
  documents: [
    {
      id: 'doc-1',
      student_id: 'student-1',
      type: 'marksheet',
      title: 'Mid Term Marksheet – 2025',
      issue_date: '2025-10-10',
      code: 'VS2025-A1B2',
      status: 'valid',
      exam_name: 'Stellar Academy Mid Term Examination 2025',
      subject_marks: [
        { subject: 'Maths',     max: 25, obtained: 22 },
        { subject: 'Physics',   max: 25, obtained: 18 },
        { subject: 'Chemistry', max: 25, obtained: 20 },
        { subject: 'Biology',   max: 15, obtained: 13 },
        { subject: 'English',   max: 10, obtained: 8  }
      ],
      total_max: 100,
      total_obtained: 81,
      percentage: 81.0,
      grade: 'A',
      attendance_percent: 88.5
    },
    {
      id: 'doc-2',
      student_id: 'student-1',
      type: 'marksheet',
      title: 'Unit Test 1 Marksheet',
      issue_date: '2025-09-10',
      code: 'VS2025-X9Y8',
      status: 'revoked',
      exam_name: 'Stellar Academy Unit Test 1 – Maths',
      subject_marks: [
        { subject: 'Maths', max: 25, obtained: 22 }
      ],
      total_max: 25,
      total_obtained: 22,
      percentage: 88.0,
      grade: 'A+',
      attendance_percent: 87.0
    },
    {
      id: 'doc-3',
      student_id: 'student-1',
      type: 'certificate',
      title: 'Certificate of Merit – Science',
      issue_date: '2025-10-12',
      code: 'VS2025-C3D4',
      status: 'valid',
      exam_name: 'Science Excellence Programme 2025',
      subject_marks: [
        { subject: 'Physics',   max: 25, obtained: 23 },
        { subject: 'Chemistry', max: 25, obtained: 22 },
        { subject: 'Biology',   max: 25, obtained: 21 }
      ],
      total_max: 75,
      total_obtained: 66,
      percentage: 88.0,
      grade: 'A+',
      attendance_percent: 91.0
    }
  ],

  // ─── TABLE: mcqs ─────────────────────────────────────────────────────────
  mcqs: [
    {
      id: 'mcq-1',
      subject: 'Maths',
      question: 'If p(x) = x² – 3x + 2, what are its zeros?',
      options: { a: '1 and 2', b: '–1 and –2', c: '–1 and 2', d: '1 and –2' },
      correct: 'a',
      explanation: 'Factoring: (x–1)(x–2) = 0, so x = 1 or x = 2.'
    },
    {
      id: 'mcq-2',
      subject: 'Physics',
      question: 'Which mirror is used in the headlights of vehicles?',
      options: { a: 'Plane mirror', b: 'Concave mirror', c: 'Convex mirror', d: 'Parabolic mirror' },
      correct: 'd',
      explanation: 'Parabolic (or concave) mirrors converge light into a strong parallel beam.'
    },
    {
      id: 'mcq-3',
      subject: 'Chemistry',
      question: 'What is the pH of pure water at 25°C?',
      options: { a: '0', b: '5', c: '7', d: '14' },
      correct: 'c',
      explanation: 'Pure water is neutral with a pH of exactly 7 at 25°C.'
    },
    {
      id: 'mcq-4',
      subject: 'Biology',
      question: 'Which organelle is called the "powerhouse of the cell"?',
      options: { a: 'Nucleus', b: 'Ribosome', c: 'Mitochondria', d: 'Chloroplast' },
      correct: 'c',
      explanation: 'Mitochondria produce ATP via cellular respiration.'
    },
    {
      id: 'mcq-5',
      subject: 'Maths',
      question: 'The HCF of 26 and 91 is:',
      options: { a: '13', b: '7', c: '26', d: '91' },
      correct: 'a',
      explanation: '91 = 3×26 + 13; 26 = 2×13 + 0; so HCF = 13.'
    }
  ],

  // ─── TABLE: points_history ───────────────────────────────────────────────
  points_history: [
    { id: 'ph-1',  student_id: 'student-1', date: '2025-10-17', action: 'focus_session',   points: 50,  description: '45-min focus session completed' },
    { id: 'ph-2',  student_id: 'student-1', date: '2025-10-16', action: 'attendance',      points: 10,  description: 'Attendance marked – present' },
    { id: 'ph-3',  student_id: 'student-1', date: '2025-10-15', action: 'test_score',      points: 81,  description: 'Mid Term: 81/100 scored' },
    { id: 'ph-4',  student_id: 'student-1', date: '2025-10-14', action: 'topic_revised',   points: 15,  description: 'Revised: Zeros of a Polynomial' },
    { id: 'ph-5',  student_id: 'student-1', date: '2025-10-13', action: 'attendance',      points: 10,  description: 'Attendance marked – present' },
    { id: 'ph-6',  student_id: 'student-1', date: '2025-10-12', action: 'streak_bonus',    points: 25,  description: '10-day streak bonus!' },
    { id: 'ph-7',  student_id: 'student-1', date: '2025-10-11', action: 'focus_session',   points: 50,  description: '25-min focus session completed' },
    { id: 'ph-8',  student_id: 'student-1', date: '2025-10-10', action: 'topic_done',      points: 20,  description: 'Marked topic done: Laws of Reflection' },
    { id: 'ph-9',  student_id: 'student-1', date: '2025-10-09', action: 'attendance',      points: 10,  description: 'Attendance marked – present' },
    { id: 'ph-10', student_id: 'student-1', date: '2025-10-08', action: 'quiz_completed',  points: 30,  description: 'Weekly Quiz – Chemistry: 17/20' }
  ],

  // ─── TABLE: badges ───────────────────────────────────────────────────────
  badges: [
    { id: 'badge-1', name: 'First Step',       description: 'Logged in for the first time',               icon_emoji: '👣', earned: true,  earned_date: '2025-08-01' },
    { id: 'badge-2', name: '7-Day Streak',     description: 'Studied for 7 consecutive days',              icon_emoji: '🔥', earned: true,  earned_date: '2025-08-08' },
    { id: 'badge-3', name: 'Test Topper',      description: 'Scored above 85% in any test',               icon_emoji: '🏆', earned: true,  earned_date: '2025-09-06' },
    { id: 'badge-4', name: 'Focus Master',     description: 'Completed 10 focus sessions',                 icon_emoji: '🎯', earned: false, earned_date: null },
    { id: 'badge-5', name: 'Fees Champion',    description: 'Paid all fees on time for 3 months',          icon_emoji: '💎', earned: true,  earned_date: '2025-10-02' },
    { id: 'badge-6', name: 'Perfect Month',    description: '100% attendance for a full month',            icon_emoji: '🌟', earned: false, earned_date: null }
  ]

}; // end window.DATA

// js/data.js — Vilarci Study: All Demo Data
// Normalized schema mirroring future Supabase PostgreSQL tables (IDs, Foreign Keys).
// Loaded via classic <script> tag — Attaches globally to window.DATA.

window.DATA = {

  // ─── TABLE: center ───────────────────────────────────────────────────────
  center: {
    id: 'center-1',
    name: 'Stellar Academy',
    tagline: 'Ignite Curiosity. Master Concepts. Excel in Life.',
    address: '42, Orbit Lane, Science Nagar, Pune – 411021',
    phone: '+91 98765 43210',
    email: 'contact@stellaracademy.edu.in',
    logo_text: 'SA',
    established: 2018,
    accreditation: 'Affiliated Coaching & STEM Learning Partner'
  },

  // ─── TABLE: batches ──────────────────────────────────────────────────────
  batches: [
    {
      id: 'batch-1',
      name: 'Class 10 – Science & Maths Morning Batch',
      class: '10',
      subjects: ['Maths', 'Physics', 'Chemistry', 'Biology', 'English'],
      year: 2025,
      schedule: 'Mon–Sat, 09:00 AM – 11:00 AM'
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
      avatar_bg: 'linear-gradient(135deg, #4F46E5, #6366F1)',
      points: 1240,
      streak: 12
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
      avatar_bg: 'linear-gradient(135deg, #EC4899, #F43F5E)',
      points: 980,
      streak: 7
    }
  ],

  // ─── TABLE: attendance ───────────────────────────────────────────────────
  // 3 months (Aug, Sep, Oct 2025) of realistic records for both students
  attendance: (function () {
    var records = [];
    var recId = 1;

    function generateMonthRecords(year, month, studentId, presentProbability, lateProbability) {
      var daysInMonth = new Date(year, month, 0).getDate();
      for (var d = 1; d <= daysInMonth; d++) {
        var dateObj = new Date(year, month - 1, d);
        var dayOfWeek = dateObj.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
        if (dayOfWeek === 0) continue; // Sunday off

        var rand = Math.sin(d * 17 + month * 31 + (studentId === 'student-1' ? 7 : 13));
        var normalizedRand = (rand + 1) / 2; // [0, 1]

        var status = 'present';
        if (normalizedRand > presentProbability) {
          status = (normalizedRand > presentProbability + lateProbability) ? 'absent' : 'late';
        }

        var timetableSchedule = [
          ['Maths', 'Physics'],      // Mon
          ['Chemistry', 'Biology'],  // Tue
          ['English', 'Maths'],      // Wed
          ['Physics', 'Chemistry'],  // Thu
          ['Biology', 'English'],    // Fri
          ['Maths', 'Physics']       // Sat (Revision)
        ][dayOfWeek - 1] || ['Maths'];

        var dateString = year + '-' + String(month).padStart(2, '0') + '-' + String(d).padStart(2, '0');

        timetableSchedule.forEach(function (subject) {
          records.push({
            id: 'att-' + (recId++),
            student_id: studentId,
            date: dateString,
            status: status,
            subject: subject
          });
        });
      }
    }

    // Student 1: High consistency (~88% present)
    generateMonthRecords(2025, 8, 'student-1', 0.88, 0.06);
    generateMonthRecords(2025, 9, 'student-1', 0.86, 0.08);
    generateMonthRecords(2025, 10, 'student-1', 0.90, 0.05);

    // Student 2: Slightly lower (~82% present)
    generateMonthRecords(2025, 8, 'student-2', 0.82, 0.08);
    generateMonthRecords(2025, 9, 'student-2', 0.80, 0.10);
    generateMonthRecords(2025, 10, 'student-2', 0.84, 0.07);

    return records;
  })(),

  // ─── TABLE: fees ─────────────────────────────────────────────────────────
  fees: [
    { id: 'fee-1', student_id: 'student-1', month: 'August 2025',    amount: 3500, due_date: '2025-08-05', paid_date: '2025-08-03', status: 'paid',    mode: 'Instant UPI',   receipt_no: 'RCP-2025-081' },
    { id: 'fee-2', student_id: 'student-1', month: 'September 2025', amount: 3500, due_date: '2025-09-05', paid_date: '2025-09-04', status: 'paid',    mode: 'Net Banking',   receipt_no: 'RCP-2025-091' },
    { id: 'fee-3', student_id: 'student-1', month: 'October 2025',   amount: 3500, due_date: '2025-10-05', paid_date: '2025-10-02', status: 'paid',    mode: 'Debit Card',    receipt_no: 'RCP-2025-101' },
    { id: 'fee-4', student_id: 'student-1', month: 'November 2025',  amount: 3500, due_date: '2025-11-05', paid_date: null,         status: 'pending', mode: null,            receipt_no: null },

    { id: 'fee-5', student_id: 'student-2', month: 'August 2025',    amount: 3500, due_date: '2025-08-05', paid_date: '2025-08-06', status: 'paid',    mode: 'Instant UPI',   receipt_no: 'RCP-2025-082' },
    { id: 'fee-6', student_id: 'student-2', month: 'September 2025', amount: 3500, due_date: '2025-09-05', paid_date: '2025-09-07', status: 'paid',    mode: 'Instant UPI',   receipt_no: 'RCP-2025-092' },
    { id: 'fee-7', student_id: 'student-2', month: 'October 2025',   amount: 3500, due_date: '2025-10-05', paid_date: '2025-10-04', status: 'paid',    mode: 'Cash Voucher',  receipt_no: 'RCP-2025-102' },
    { id: 'fee-8', student_id: 'student-2', month: 'November 2025',  amount: 3500, due_date: '2025-11-05', paid_date: null,         status: 'pending', mode: null,            receipt_no: null }
  ],

  // ─── TABLE: timetable ────────────────────────────────────────────────────
  timetable: [
    { id: 'tt-1',  batch_id: 'batch-1', day_of_week: 'Mon', subject: 'Maths',     start_time: '09:00', end_time: '10:00', teacher: 'Prof. Ramesh Iyer',   room: 'Lab 2' },
    { id: 'tt-2',  batch_id: 'batch-1', day_of_week: 'Mon', subject: 'Physics',   start_time: '10:00', end_time: '11:00', teacher: 'Dr. Deepa Nair',      room: 'Room 101' },
    { id: 'tt-3',  batch_id: 'batch-1', day_of_week: 'Tue', subject: 'Chemistry', start_time: '09:00', end_time: '10:00', teacher: 'Dr. Arvind Kulkarni', room: 'Chem Lab' },
    { id: 'tt-4',  batch_id: 'batch-1', day_of_week: 'Tue', subject: 'Biology',   start_time: '10:00', end_time: '11:00', teacher: 'Ms. Kavitha Reddy',    room: 'Bio Lab' },
    { id: 'tt-5',  batch_id: 'batch-1', day_of_week: 'Wed', subject: 'English',   start_time: '09:00', end_time: '10:00', teacher: 'Ms. Fiona D\'Souza',   room: 'Seminar Hall' },
    { id: 'tt-6',  batch_id: 'batch-1', day_of_week: 'Wed', subject: 'Maths',     start_time: '10:00', end_time: '11:00', teacher: 'Prof. Ramesh Iyer',   room: 'Lab 2' },
    { id: 'tt-7',  batch_id: 'batch-1', day_of_week: 'Thu', subject: 'Physics',   start_time: '09:00', end_time: '10:00', teacher: 'Dr. Deepa Nair',      room: 'Physics Lab' },
    { id: 'tt-8',  batch_id: 'batch-1', day_of_week: 'Thu', subject: 'Chemistry', start_time: '10:00', end_time: '11:00', teacher: 'Dr. Arvind Kulkarni', room: 'Chem Lab' },
    { id: 'tt-9',  batch_id: 'batch-1', day_of_week: 'Fri', subject: 'Biology',   start_time: '09:00', end_time: '10:00', teacher: 'Ms. Kavitha Reddy',    room: 'Bio Lab' },
    { id: 'tt-10', batch_id: 'batch-1', day_of_week: 'Fri', subject: 'English',   start_time: '10:00', end_time: '11:00', teacher: 'Ms. Fiona D\'Souza',   room: 'Room 101' },
    { id: 'tt-11', batch_id: 'batch-1', day_of_week: 'Sat', subject: 'Maths',     start_time: '09:00', end_time: '10:00', teacher: 'Prof. Ramesh Iyer',   room: 'Lab 2' },
    { id: 'tt-12', batch_id: 'batch-1', day_of_week: 'Sat', subject: 'Physics',   start_time: '10:00', end_time: '11:00', teacher: 'Dr. Deepa Nair',      room: 'Physics Lab' }
  ],

  // ─── TABLE: syllabus ─────────────────────────────────────────────────────
  syllabus: [
    // Maths
    { id: 'syl-1',  batch_id: 'batch-1', subject: 'Maths',     chapter: 'Real Numbers',          topic: 'Euclid\'s Division Lemma',          planned_date: '2025-08-04', covered_date: '2025-08-04', status: 'covered',  revised_by_student: true  },
    { id: 'syl-2',  batch_id: 'batch-1', subject: 'Maths',     chapter: 'Real Numbers',          topic: 'Fundamental Theorem of Arithmetic',  planned_date: '2025-08-11', covered_date: '2025-08-11', status: 'covered',  revised_by_student: true  },
    { id: 'syl-3',  batch_id: 'batch-1', subject: 'Maths',     chapter: 'Polynomials',           topic: 'Geometrical Meaning of Zeros',      planned_date: '2025-08-18', covered_date: '2025-08-18', status: 'covered',  revised_by_student: true  },
    { id: 'syl-4',  batch_id: 'batch-1', subject: 'Maths',     chapter: 'Polynomials',           topic: 'Division Algorithm & Remainder',     planned_date: '2025-09-01', covered_date: '2025-09-02', status: 'partial',  revised_by_student: false },
    { id: 'syl-5',  batch_id: 'batch-1', subject: 'Maths',     chapter: 'Quadratic Equations',   topic: 'Solving by Factorisation Method',    planned_date: '2025-09-15', covered_date: null,         status: 'upcoming', revised_by_student: false },
    // Physics
    { id: 'syl-6',  batch_id: 'batch-1', subject: 'Physics',   chapter: 'Light – Reflection',    topic: 'Laws of Reflection & Curved Mirrors', planned_date: '2025-08-05', covered_date: '2025-08-05', status: 'covered',  revised_by_student: true  },
    { id: 'syl-7',  batch_id: 'batch-1', subject: 'Physics',   chapter: 'Light – Reflection',    topic: 'Image Formation by Concave/Convex', planned_date: '2025-08-12', covered_date: '2025-08-12', status: 'covered',  revised_by_student: true  },
    { id: 'syl-8',  batch_id: 'batch-1', subject: 'Physics',   chapter: 'Light – Refraction',    topic: 'Snell\'s Law and Refractive Index',  planned_date: '2025-09-02', covered_date: '2025-09-02', status: 'covered',  revised_by_student: false },
    { id: 'syl-9',  batch_id: 'batch-1', subject: 'Physics',   chapter: 'Electricity',           topic: 'Ohm\'s Law, Potential & Resistance', planned_date: '2025-09-16', covered_date: null,         status: 'skipped',  revised_by_student: false },
    { id: 'syl-10', batch_id: 'batch-1', subject: 'Physics',   chapter: 'Electricity',           topic: 'Combination of Resistors (Series/||)',planned_date: '2025-10-06', covered_date: null,        status: 'upcoming', revised_by_student: false },
    // Chemistry
    { id: 'syl-11', batch_id: 'batch-1', subject: 'Chemistry', chapter: 'Chemical Reactions',    topic: 'Balancing Chemical Equations',       planned_date: '2025-08-06', covered_date: '2025-08-06', status: 'covered',  revised_by_student: true  },
    { id: 'syl-12', batch_id: 'batch-1', subject: 'Chemistry', chapter: 'Chemical Reactions',    topic: 'Types of Reactions (Redox & Precip)',planned_date: '2025-08-13', covered_date: '2025-08-13', status: 'covered',  revised_by_student: true  },
    { id: 'syl-13', batch_id: 'batch-1', subject: 'Chemistry', chapter: 'Acids, Bases & Salts',  topic: 'Chemical Properties of Acids & Bases',planned_date: '2025-09-03', covered_date: '2025-09-03', status: 'covered',  revised_by_student: false },
    { id: 'syl-14', batch_id: 'batch-1', subject: 'Chemistry', chapter: 'Acids, Bases & Salts',  topic: 'Importance of pH in Everyday Life',  planned_date: '2025-09-17', covered_date: '2025-09-18', status: 'partial',  revised_by_student: false },
    { id: 'syl-15', batch_id: 'batch-1', subject: 'Chemistry', chapter: 'Metals & Non-metals',   topic: 'Reactivity Series of Metals',        planned_date: '2025-10-07', covered_date: null,         status: 'upcoming', revised_by_student: false },
    // Biology
    { id: 'syl-16', batch_id: 'batch-1', subject: 'Biology',   chapter: 'Life Processes',        topic: 'Autotrophic & Heterotrophic Nutrition', planned_date: '2025-08-07', covered_date: '2025-08-07', status: 'covered', revised_by_student: true  },
    { id: 'syl-17', batch_id: 'batch-1', subject: 'Biology',   chapter: 'Life Processes',        topic: 'Respiration & Aerobic Breakdown',   planned_date: '2025-08-14', covered_date: '2025-08-14', status: 'covered',  revised_by_student: false },
    { id: 'syl-18', batch_id: 'batch-1', subject: 'Biology',   chapter: 'Control & Coordination',topic: 'Human Nervous System & Reflex Arc',  planned_date: '2025-09-04', covered_date: '2025-09-05', status: 'partial',  revised_by_student: false },
    { id: 'syl-19', batch_id: 'batch-1', subject: 'Biology',   chapter: 'Control & Coordination',topic: 'Endocrine Glands & Hormones in Animals', planned_date: '2025-09-18', covered_date: null,     status: 'upcoming', revised_by_student: false },
    { id: 'syl-20', batch_id: 'batch-1', subject: 'Biology',   chapter: 'How Organisms Reproduce',topic: 'Modes of Reproduction by Single Cells', planned_date: '2025-10-08', covered_date: null,    status: 'upcoming', revised_by_student: false },
    // English
    { id: 'syl-21', batch_id: 'batch-1', subject: 'English',   chapter: 'First Flight',          topic: 'A Letter to God (G.L. Fuentes)',     planned_date: '2025-08-08', covered_date: '2025-08-08', status: 'covered',  revised_by_student: true  },
    { id: 'syl-22', batch_id: 'batch-1', subject: 'English',   chapter: 'First Flight',          topic: 'Nelson Mandela: Long Walk to Freedom', planned_date: '2025-08-15', covered_date: '2025-08-15', status: 'covered', revised_by_student: true },
    { id: 'syl-23', batch_id: 'batch-1', subject: 'English',   chapter: 'Grammar & Usage',       topic: 'Reported Speech (Direct to Indirect)',planned_date: '2025-09-05', covered_date: '2025-09-05', status: 'covered',  revised_by_student: false },
    { id: 'syl-24', batch_id: 'batch-1', subject: 'English',   chapter: 'Grammar & Usage',       topic: 'Conditionals & Modals',              planned_date: '2025-09-19', covered_date: null,         status: 'skipped',  revised_by_student: false },
    { id: 'syl-25', batch_id: 'batch-1', subject: 'English',   chapter: 'Writing Skills',        topic: 'Analytical Paragraph & Formal Letter', planned_date: '2025-10-09', covered_date: null,      status: 'upcoming', revised_by_student: false }
  ],

  // ─── TABLE: tests ────────────────────────────────────────────────────────
  tests: [
    {
      id: 'test-1',
      student_id: 'student-1',
      batch_id: 'batch-1',
      name: 'Unit Assessment 1 – Maths',
      subject: 'Maths',
      date: '2025-09-06',
      total_marks: 25,
      marks_obtained: 22,
      duration_min: 60,
      topics_tested: ['Real Numbers', 'Polynomials'],
      weak_topics: ['Division Algorithm']
    },
    {
      id: 'test-2',
      student_id: 'student-1',
      batch_id: 'batch-1',
      name: 'Unit Assessment 2 – Physics',
      subject: 'Physics',
      date: '2025-09-20',
      total_marks: 25,
      marks_obtained: 18,
      duration_min: 60,
      topics_tested: ['Reflection & Refraction'],
      weak_topics: ['Snell\'s Law', 'Mirror formula signs']
    },
    {
      id: 'test-3',
      student_id: 'student-1',
      batch_id: 'batch-1',
      name: 'Mid Term Comprehensive Exam',
      subject: 'Science & Maths',
      date: '2025-10-04',
      total_marks: 100,
      marks_obtained: 81,
      duration_min: 180,
      topics_tested: ['Term 1 Full Curriculum'],
      weak_topics: ['Ohm\'s Law', 'pH Scale calculations']
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
      topics_tested: ['Acids, Bases & Salts'],
      weak_topics: ['Balancing precipitation equations']
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
      description: 'Explore kinematic trajectory, launch angle, drag coefficients, and gravitational acceleration.',
      phet_url: 'https://phet.colorado.edu/sims/html/projectile-motion/latest/projectile-motion_en.html',
      thumbnail_emoji: '🚀'
    },
    {
      id: 'sim-2',
      title: 'Wave on a String',
      subject: 'Physics',
      class: '10',
      description: 'Adjust frequency, amplitude, and tension to observe wave interference and standing nodes.',
      phet_url: 'https://phet.colorado.edu/sims/html/wave-on-a-string/latest/wave-on-a-string_en.html',
      thumbnail_emoji: '〰️'
    },
    {
      id: 'sim-3',
      title: 'Build an Atom',
      subject: 'Chemistry',
      class: '10',
      description: 'Construct stable isotopes using protons, neutrons, and electron shells. Observe atomic mass.',
      phet_url: 'https://phet.colorado.edu/sims/html/build-an-atom/latest/build-an-atom_en.html',
      thumbnail_emoji: '⚛️'
    },
    {
      id: 'sim-4',
      title: 'Acid–Base Solutions',
      subject: 'Chemistry',
      class: '10',
      description: 'Test conductivity, litmus paper indicators, and pH levels across strong and weak acids.',
      phet_url: 'https://phet.colorado.edu/sims/html/acid-base-solutions/latest/acid-base-solutions_en.html',
      thumbnail_emoji: '🧪'
    },
    {
      id: 'sim-5',
      title: 'Molecule Shapes (3D VSEPR)',
      subject: 'Chemistry',
      class: '10',
      description: 'Rotate and build 3D geometry of covalent molecules with bonding and lone pair electron repulsion.',
      phet_url: 'https://phet.colorado.edu/sims/html/molecule-shapes/latest/molecule-shapes_en.html',
      thumbnail_emoji: '🔬'
    },
    {
      id: 'sim-6',
      title: 'Natural Selection Simulation',
      subject: 'Biology',
      class: '10',
      description: 'Introduce environmental selective pressures (fur mutation, predators) to witness genetic evolution.',
      phet_url: 'https://phet.colorado.edu/sims/html/natural-selection/latest/natural-selection_en.html',
      thumbnail_emoji: '🐇'
    }
  ],

  // ─── TABLE: videos ───────────────────────────────────────────────────────
  videos: [
    { id: 'vid-1', title: 'Quadratic Equations Masterclass',      subject: 'Maths',     chapter: 'Quadratic Equations',  youtube_id: 'IWigcMGGMIs', duration: '18:24', description: 'Step-by-step breakdown of factorisation, completing square, and the quadratic formula.' },
    { id: 'vid-2', title: 'Trigonometry Ratios & Values',         subject: 'Maths',     chapter: 'Trigonometry',         youtube_id: 'F21S9Wpi0y8', duration: '22:10', description: 'Visual intuition behind Sine, Cosine, Tangent and standard angle identities.' },
    { id: 'vid-3', title: 'Newton\'s Laws of Motion in Action',  subject: 'Physics',   chapter: 'Force & Laws of Motion',youtube_id: 'ZM8ECpBuQYE', duration: '15:44', description: 'Inertia, momentum vectors, and action-reaction pairs illustrated with animations.' },
    { id: 'vid-4', title: 'Current Electricity & Circuit Diagrams',subject: 'Physics', chapter: 'Electricity',          youtube_id: 'BLbHC7elJAM', duration: '20:30', description: 'Potential difference, Ohm\'s Law, and equivalent resistance calculations.' },
    { id: 'vid-5', title: 'Bohr\'s Model of the Atom',            subject: 'Chemistry', chapter: 'Structure of the Atom',youtube_id: 'FSyAehMdpyQ', duration: '16:52', description: 'Electronic configurations, valency electrons, and modern atomic structure.' },
    { id: 'vid-6', title: 'Chemical Reactions & Equations',       subject: 'Chemistry', chapter: 'Chemical Reactions',   youtube_id: 'vt8pvLByTfQ', duration: '19:05', description: 'Balancing coefficients, oxidation states, and precipitation reactions.' },
    { id: 'vid-7', title: 'Cell Structure and Organelles',        subject: 'Biology',   chapter: 'Life Processes',       youtube_id: '8IlzKri08kQ', duration: '24:18', description: 'Detailed walkthrough of cellular machinery: mitochondria, ribosomes, ER, and nucleus.' },
    { id: 'vid-8', title: 'Reported Speech & Direct Indirect',    subject: 'English',   chapter: 'Grammar & Usage',      youtube_id: 'Dqjb_mdvhM4', duration: '12:00', description: 'Tense backshifting rules, modal changes, and pronoun transformations.' }
  ],

  // ─── TABLE: documents ────────────────────────────────────────────────────
  documents: [
    {
      id: 'doc-1',
      student_id: 'student-1',
      type: 'marksheet',
      title: 'Mid Term Official Marksheet – 2025',
      issue_date: '2025-10-10',
      code: 'VS2025-A1B2',
      status: 'valid',
      exam_name: 'Stellar Academy Class 10 Mid Term Examination 2025',
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
      title: 'Unit Test 1 Archive Record',
      issue_date: '2025-09-10',
      code: 'VS2025-X9Y8',
      status: 'revoked',
      exam_name: 'Stellar Academy Unit Assessment 1 (Superseded by Mid Term)',
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
      title: 'Certificate of Academic Distinction',
      issue_date: '2025-10-12',
      code: 'VS2025-C3D4',
      status: 'valid',
      exam_name: 'Stellar STEM Talent Search & Evaluation 2025',
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
      question: 'If p(x) = x² – 3x + 2, what are the zeros of the polynomial?',
      options: { a: '1 and 2', b: '–1 and –2', c: '–1 and 2', d: '1 and –2' },
      correct: 'a',
      explanation: 'Factoring gives (x – 1)(x – 2) = 0, which yields roots x = 1 and x = 2.'
    },
    {
      id: 'mcq-2',
      subject: 'Physics',
      question: 'Which type of optical mirror is utilized in automobile headlights to produce a strong parallel beam?',
      options: { a: 'Plane mirror', b: 'Convex mirror', c: 'Concave mirror', d: 'Cylindrical mirror' },
      correct: 'c',
      explanation: 'When a light source is placed at the principal focus of a concave mirror, reflected rays emerge as a concentrated parallel beam.'
    },
    {
      id: 'mcq-3',
      subject: 'Chemistry',
      question: 'What is the theoretical pH value of pure neutral water at standard room temperature (25°C)?',
      options: { a: '0', b: '5.5', c: '7.0', d: '14.0' },
      correct: 'c',
      explanation: 'In pure water at 25°C, [H⁺] = [OH⁻] = 1.0 × 10⁻⁷ M, so pH = –log(10⁻⁷) = 7.0.'
    },
    {
      id: 'mcq-4',
      subject: 'Biology',
      question: 'Which subcellular organelle is designated as the cellular "powerhouse" due to aerobic ATP generation?',
      options: { a: 'Endoplasmic Reticulum', b: 'Ribosome', c: 'Mitochondrion', d: 'Golgi Apparatus' },
      correct: 'c',
      explanation: 'Mitochondria carry out the Krebs cycle and oxidative phosphorylation to synthesize ATP molecules.'
    },
    {
      id: 'mcq-5',
      subject: 'Maths',
      question: 'Applying Euclid\'s Division Algorithm, what is the Highest Common Factor (HCF) of 26 and 91?',
      options: { a: '13', b: '7', c: '26', d: '2' },
      correct: 'a',
      explanation: '91 = 26 × 3 + 13. Next step: 26 = 13 × 2 + 0. Since the remainder is zero, the divisor 13 is the HCF.'
    }
  ],

  // ─── TABLE: points_history ───────────────────────────────────────────────
  points_history: [
    { id: 'ph-1',  student_id: 'student-1', date: '2025-10-17', action: 'focus_session',   points: 50,  description: '45-minute distraction-free focus study completed' },
    { id: 'ph-2',  student_id: 'student-1', date: '2025-10-16', action: 'attendance',      points: 10,  description: 'Daily QR attendance marked on schedule' },
    { id: 'ph-3',  student_id: 'student-1', date: '2025-10-15', action: 'test_score',      points: 81,  description: 'Mid Term Comprehensive: 81/100 points credited' },
    { id: 'ph-4',  student_id: 'student-1', date: '2025-10-14', action: 'topic_revised',   points: 15,  description: 'Self-revision confirmed: Zeros of Polynomials' },
    { id: 'ph-5',  student_id: 'student-1', date: '2025-10-13', action: 'attendance',      points: 10,  description: 'Daily QR attendance marked on schedule' },
    { id: 'ph-6',  student_id: 'student-1', date: '2025-10-12', action: 'streak_bonus',    points: 25,  description: '10-Day continuous study streak milestone bonus!' },
    { id: 'ph-7',  student_id: 'student-1', date: '2025-10-11', action: 'focus_session',   points: 50,  description: '25-minute Pomodoro study sprint completed' },
    { id: 'ph-8',  student_id: 'student-1', date: '2025-10-10', action: 'topic_done',      points: 20,  description: 'Topic mastery checked: Laws of Reflection' },
    { id: 'ph-9',  student_id: 'student-1', date: '2025-10-09', action: 'attendance',      points: 10,  description: 'Daily QR attendance marked on schedule' },
    { id: 'ph-10', student_id: 'student-1', date: '2025-10-08', action: 'quiz_completed',  points: 30,  description: 'Chemistry Weekly Practice Quiz score: 17/20' }
  ],

  // ─── TABLE: badges ───────────────────────────────────────────────────────
  badges: [
    { id: 'badge-1', name: 'First Milestone',   description: 'Initiated first learning session',              icon_emoji: '👣', earned: true,  earned_date: '2025-08-01' },
    { id: 'badge-2', name: '7-Day Flame',       description: 'Active learning streak of 7 continuous days',   icon_emoji: '🔥', earned: true,  earned_date: '2025-08-08' },
    { id: 'badge-3', name: 'Honor Roll',        description: 'Scored above 85% in any formal assessment',     icon_emoji: '🏆', earned: true,  earned_date: '2025-09-06' },
    { id: 'badge-4', name: 'Deep Focus Pro',    description: 'Finished 10 verified timer focus sessions',      icon_emoji: '🎯', earned: false, earned_date: null },
    { id: 'badge-5', name: 'On-Time Scholar',   description: 'All term fees cleared prior to due dates',      icon_emoji: '💎', earned: true,  earned_date: '2025-10-02' },
    { id: 'badge-6', name: 'Perfect Month',     description: '100% flawless attendance across 30 days',       icon_emoji: '🌟', earned: false, earned_date: null }
  ]

}; // end window.DATA

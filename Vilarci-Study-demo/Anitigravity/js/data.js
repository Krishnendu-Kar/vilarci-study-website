// js/data.js — Vilarci Study: Multi-Coaching & Tuition Platform (Demo v2.0 - Maroon Edition)
// Normalized relational data supporting multiple coaching centers/teachers, up to 5 student profiles,
// and center-specific records (fees, timetable, syllabus, attendance, videos, marksheets, tests).

window.DATA = {

  // ─── 1. TABLE: centers (Multiple Coaching Centers & Independent Tuitions) ───
  centers: [
    {
      id: 'center-1',
      name: 'Stellar Academy',
      type: 'Coaching Institute',
      tagline: 'Master Concepts. Excel in Board & Competitive Science & Maths.',
      teacher_name: 'Er. Alok Sharma (Ex-IIT Delhi)',
      subjects: ['Maths', 'Physics'],
      code: 'STLR10',
      logo_text: 'SA',
      established: 2018,
      phone: '+91 98765 43210',
      email: 'contact@stellaracademy.edu.in',
      address: '42, Orbit Lane, Science Nagar, Pune – 411021',
      color: '#800020',
      monthly_fee: 2500,
      active_batch: 'Class 10 Science & Maths Morning'
    },
    {
      id: 'center-2',
      name: 'Apex Chemistry Institute',
      type: 'Specialist Tuition Center',
      tagline: 'Organic, Inorganic & Physical Chemistry Mastery for Boards & NEET.',
      teacher_name: 'Dr. Rashmi Verma (PhD Chemistry)',
      subjects: ['Chemistry'],
      code: 'APEX99',
      logo_text: 'AC',
      established: 2019,
      phone: '+91 98220 12345',
      email: 'verma.chem@apexchem.in',
      address: 'Shop 12, Crystal Heights, FC Road, Pune – 411005',
      color: '#0284C7',
      monthly_fee: 1800,
      active_batch: 'Class 10 Board Excellence Batch'
    },
    {
      id: 'center-3',
      name: 'Zenith Biology Tuitions',
      type: 'Private Medical & Board Tuition',
      tagline: 'Cell Biology, Genetics & Human Physiology Conceptual Immersion.',
      teacher_name: 'Prof. Arindam Sen (M.Sc, Gold Medalist)',
      subjects: ['Biology'],
      code: 'ZEN77',
      logo_text: 'ZB',
      established: 2020,
      phone: '+91 97330 54321',
      email: 'arindam.bio@zenithtuitions.com',
      address: 'Green Meadows Wing B, Kothrud, Pune – 411038',
      color: '#059669',
      monthly_fee: 1600,
      active_batch: 'Pre-Medical & High School Biology'
    },
    {
      id: 'center-4',
      name: 'Horizon English Studio',
      type: 'Language & Humanities Hub',
      tagline: 'Board English Core, Literature Analysis & Critical Writing.',
      teacher_name: 'Mrs. Kavita Roy (MA English Lit)',
      subjects: ['English'],
      code: 'HORIZ5',
      logo_text: 'HE',
      established: 2021,
      phone: '+91 98110 99887',
      email: 'kavita.roy@horizonstudio.org',
      address: '302, Knowledge Park, Camp, Pune – 411001',
      color: '#7C3AED',
      monthly_fee: 1200,
      active_batch: 'Class 8-10 English Literature Club'
    }
  ],

  // ─── 2. TABLE: students (Up to 5 profiles supported per account) ─────────────
  students: [
    {
      id: 'student-1',
      name: 'Aryan Mehta',
      roll: 'SA-101',
      class: 'Class 10',
      board: 'CBSE',
      dob: '2010-03-14',
      phone: '+91 99887 76655',
      parent_name: 'Sunita Mehta',
      parent_phone: '+91 98765 11223',
      photo_initials: 'AM',
      avatar_bg: 'linear-gradient(135deg, #800020, #B45309)',
      enrolled_centers: ['center-1', 'center-2', 'center-3'],
      points: 1420,
      streak: 14
    },
    {
      id: 'student-2',
      name: 'Priya Mehta',
      roll: 'SA-102',
      class: 'Class 8',
      board: 'ICSE',
      dob: '2012-07-22',
      phone: '+91 99887 76656',
      parent_name: 'Sunita Mehta',
      parent_phone: '+91 98765 11223',
      photo_initials: 'PM',
      avatar_bg: 'linear-gradient(135deg, #991B1B, #D97706)',
      enrolled_centers: ['center-1', 'center-4'],
      points: 980,
      streak: 8
    },
    {
      id: 'student-3',
      name: 'Kabir Mehta',
      roll: 'SA-103',
      class: 'Class 12',
      board: 'CBSE Science',
      dob: '2008-11-05',
      phone: '+91 99887 76657',
      parent_name: 'Sunita Mehta',
      parent_phone: '+91 98765 11223',
      photo_initials: 'KM',
      avatar_bg: 'linear-gradient(135deg, #4C0519, #800020)',
      enrolled_centers: ['center-1', 'center-2'],
      points: 1850,
      streak: 21
    }
  ],

  // ─── 3. TABLE: attendance (Linked to student_id and center_id) ───────────────
  attendance: (function () {
    var records = [];
    var recId = 1;

    function generateMonthRecords(year, month, studentId, centerId, subject, presentProb) {
      var daysInMonth = new Date(year, month, 0).getDate();
      for (var d = 1; d <= daysInMonth; d++) {
        var dateObj = new Date(year, month - 1, d);
        var dayOfWeek = dateObj.getDay();
        if (dayOfWeek === 0) continue; // Sunday off

        var rand = Math.sin(d * 19 + month * 29 + (studentId === 'student-1' ? 5 : 11));
        var val = (rand + 1) / 2;

        var status = 'present';
        if (val > presentProb) {
          status = (val > presentProb + 0.08) ? 'absent' : 'late';
        }

        var dateString = year + '-' + String(month).padStart(2, '0') + '-' + String(d).padStart(2, '0');

        records.push({
          id: 'att-' + (recId++),
          student_id: studentId,
          center_id: centerId,
          date: dateString,
          status: status,
          subject: subject
        });
      }
    }

    // Aryan Mehta (Class 10) enrolled in 3 centers:
    // Center 1 (Stellar Academy - Maths & Physics)
    generateMonthRecords(2025, 8, 'student-1', 'center-1', 'Maths & Physics', 0.90);
    generateMonthRecords(2025, 9, 'student-1', 'center-1', 'Maths & Physics', 0.88);
    generateMonthRecords(2025, 10, 'student-1', 'center-1', 'Maths & Physics', 0.92);

    // Center 2 (Apex Chemistry)
    generateMonthRecords(2025, 8, 'student-1', 'center-2', 'Chemistry', 0.86);
    generateMonthRecords(2025, 9, 'student-1', 'center-2', 'Chemistry', 0.85);
    generateMonthRecords(2025, 10, 'student-1', 'center-2', 'Chemistry', 0.89);

    // Center 3 (Zenith Biology)
    generateMonthRecords(2025, 8, 'student-1', 'center-3', 'Biology', 0.87);
    generateMonthRecords(2025, 9, 'student-1', 'center-3', 'Biology', 0.84);
    generateMonthRecords(2025, 10, 'student-1', 'center-3', 'Biology', 0.88);

    // Priya Mehta (Class 8) enrolled in Center 1 and Center 4:
    generateMonthRecords(2025, 9, 'student-2', 'center-1', 'Science & Maths', 0.85);
    generateMonthRecords(2025, 10, 'student-2', 'center-1', 'Science & Maths', 0.86);
    generateMonthRecords(2025, 9, 'student-2', 'center-4', 'English Studio', 0.92);
    generateMonthRecords(2025, 10, 'student-2', 'center-4', 'English Studio', 0.94);

    return records;
  })(),

  // ─── 4. TABLE: fees (Linked to student_id and center_id) ───────────────────
  fees: [
    // Aryan Mehta (Student 1) - Stellar Academy (₹2,500/mo)
    { id: 'fee-1', student_id: 'student-1', center_id: 'center-1', month: 'August 2025',    amount: 2500, due_date: '2025-08-05', paid_date: '2025-08-03', status: 'paid',    mode: 'UPI AutoPay',  receipt_no: 'STLR-2025-081' },
    { id: 'fee-2', student_id: 'student-1', center_id: 'center-1', month: 'September 2025', amount: 2500, due_date: '2025-09-05', paid_date: '2025-09-04', status: 'paid',    mode: 'Net Banking',  receipt_no: 'STLR-2025-091' },
    { id: 'fee-3', student_id: 'student-1', center_id: 'center-1', month: 'October 2025',   amount: 2500, due_date: '2025-10-05', paid_date: '2025-10-02', status: 'paid',    mode: 'Debit Card',   receipt_no: 'STLR-2025-101' },
    { id: 'fee-4', student_id: 'student-1', center_id: 'center-1', month: 'November 2025',  amount: 2500, due_date: '2025-11-05', paid_date: null,         status: 'pending', mode: null,           receipt_no: null },

    // Aryan Mehta - Apex Chemistry (₹1,800/mo)
    { id: 'fee-5', student_id: 'student-1', center_id: 'center-2', month: 'September 2025', amount: 1800, due_date: '2025-09-07', paid_date: '2025-09-06', status: 'paid',    mode: 'Google Pay',   receipt_no: 'APEX-2025-094' },
    { id: 'fee-6', student_id: 'student-1', center_id: 'center-2', month: 'October 2025',   amount: 1800, due_date: '2025-10-07', paid_date: '2025-10-05', status: 'paid',    mode: 'UPI',          receipt_no: 'APEX-2025-104' },
    { id: 'fee-7', student_id: 'student-1', center_id: 'center-2', month: 'November 2025',  amount: 1800, due_date: '2025-11-07', paid_date: null,         status: 'pending', mode: null,           receipt_no: null },

    // Aryan Mehta - Zenith Biology (₹1,600/mo)
    { id: 'fee-8', student_id: 'student-1', center_id: 'center-3', month: 'September 2025', amount: 1600, due_date: '2025-09-10', paid_date: '2025-09-09', status: 'paid',    mode: 'PhonePe',      receipt_no: 'ZEN-2025-098' },
    { id: 'fee-9', student_id: 'student-1', center_id: 'center-3', month: 'October 2025',   amount: 1600, due_date: '2025-10-10', paid_date: '2025-10-08', status: 'paid',    mode: 'UPI',          receipt_no: 'ZEN-2025-108' },
    { id: 'fee-10', student_id: 'student-1', center_id: 'center-3', month: 'November 2025', amount: 1600, due_date: '2025-11-10', paid_date: null,        status: 'pending', mode: null,           receipt_no: null },

    // Priya Mehta (Student 2) - Stellar Academy (₹2,200/mo)
    { id: 'fee-11', student_id: 'student-2', center_id: 'center-1', month: 'October 2025',  amount: 2200, due_date: '2025-10-05', paid_date: '2025-10-03', status: 'paid',    mode: 'UPI',          receipt_no: 'STLR-2025-P10' },
    { id: 'fee-12', student_id: 'student-2', center_id: 'center-1', month: 'November 2025', amount: 2200, due_date: '2025-11-05', paid_date: null,        status: 'pending', mode: null,           receipt_no: null },

    // Priya Mehta - Horizon English Studio (₹1,200/mo)
    { id: 'fee-13', student_id: 'student-2', center_id: 'center-4', month: 'October 2025',  amount: 1200, due_date: '2025-10-10', paid_date: '2025-10-08', status: 'paid',    mode: 'Bank Transfer', receipt_no: 'HOR-2025-P10' },
    { id: 'fee-14', student_id: 'student-2', center_id: 'center-4', month: 'November 2025', amount: 1200, due_date: '2025-11-10', paid_date: null,        status: 'pending', mode: null,           receipt_no: null }
  ],

  // ─── 5. TABLE: timetable (Teacher-Specific & Center-Linked Schedules) ────────
  timetable: [
    // Center 1: Stellar Academy (Er. Alok Sharma & Dr. Deepa Nair)
    { id: 'tt-1',  center_id: 'center-1', day_of_week: 'Mon', subject: 'Maths',     start_time: '08:30', end_time: '09:45', teacher: 'Er. Alok Sharma',    room: 'Hall A (Maths Studio)' },
    { id: 'tt-2',  center_id: 'center-1', day_of_week: 'Mon', subject: 'Physics',   start_time: '10:00', end_time: '11:15', teacher: 'Dr. Deepa Nair',     room: 'Physics Lab 1' },
    { id: 'tt-3',  center_id: 'center-1', day_of_week: 'Wed', subject: 'Maths',     start_time: '08:30', end_time: '09:45', teacher: 'Er. Alok Sharma',    room: 'Hall A (Maths Studio)' },
    { id: 'tt-4',  center_id: 'center-1', day_of_week: 'Wed', subject: 'Physics',   start_time: '10:00', end_time: '11:15', teacher: 'Dr. Deepa Nair',     room: 'Physics Lab 1' },
    { id: 'tt-5',  center_id: 'center-1', day_of_week: 'Fri', subject: 'Maths',     start_time: '08:30', end_time: '09:45', teacher: 'Er. Alok Sharma',    room: 'Hall A (Problem Solving)' },
    { id: 'tt-6',  center_id: 'center-1', day_of_week: 'Sat', subject: 'Physics',   start_time: '09:00', end_time: '11:00', teacher: 'Dr. Deepa Nair',     room: 'Numerical Workshop' },

    // Center 2: Apex Chemistry Institute (Dr. Rashmi Verma)
    { id: 'tt-7',  center_id: 'center-2', day_of_week: 'Tue', subject: 'Chemistry', start_time: '16:00', end_time: '17:30', teacher: 'Dr. Rashmi Verma',  room: 'Organic Chemistry Room' },
    { id: 'tt-8',  center_id: 'center-2', day_of_week: 'Thu', subject: 'Chemistry', start_time: '16:00', end_time: '17:30', teacher: 'Dr. Rashmi Verma',  room: 'Inorganic Analysis Lab' },
    { id: 'tt-9',  center_id: 'center-2', day_of_week: 'Sat', subject: 'Chemistry', start_time: '15:00', end_time: '17:00', teacher: 'Dr. Rashmi Verma',  room: 'Board Question Bank Revision' },

    // Center 3: Zenith Biology Tuitions (Prof. Arindam Sen)
    { id: 'tt-10', center_id: 'center-3', day_of_week: 'Tue', subject: 'Biology',   start_time: '18:00', end_time: '19:15', teacher: 'Prof. Arindam Sen',  room: 'Microscopy Suite' },
    { id: 'tt-11', center_id: 'center-3', day_of_week: 'Thu', subject: 'Biology',   start_time: '18:00', end_time: '19:15', teacher: 'Prof. Arindam Sen',  room: 'Physiology Lecture Hall' },
    { id: 'tt-12', center_id: 'center-3', day_of_week: 'Sun', subject: 'Biology',   start_time: '10:00', end_time: '11:30', teacher: 'Prof. Arindam Sen',  room: 'Doubt Clearing & Diagram Drill' },

    // Center 4: Horizon English Studio (Mrs. Kavita Roy)
    { id: 'tt-13', center_id: 'center-4', day_of_week: 'Wed', subject: 'English',   start_time: '17:00', end_time: '18:15', teacher: 'Mrs. Kavita Roy',    room: 'Creative Writing Chamber' },
    { id: 'tt-14', center_id: 'center-4', day_of_week: 'Fri', subject: 'English',   start_time: '17:00', end_time: '18:15', teacher: 'Mrs. Kavita Roy',    room: 'Literature & Drama Studio' }
  ],

  // ─── 6. TABLE: syllabus (Teacher & Center Curated Topic Plan) ────────────────
  syllabus: [
    // Center 1: Stellar Academy (Maths & Physics)
    { id: 'syl-1',  center_id: 'center-1', subject: 'Maths',   chapter: 'Real Numbers',          topic: 'Euclid\'s Division Lemma & HCF',    planned_date: '2025-08-04', covered_date: '2025-08-04', status: 'covered',  revised_by_student: true  },
    { id: 'syl-2',  center_id: 'center-1', subject: 'Maths',   chapter: 'Real Numbers',          topic: 'Fundamental Theorem of Arithmetic',  planned_date: '2025-08-11', covered_date: '2025-08-11', status: 'covered',  revised_by_student: true  },
    { id: 'syl-3',  center_id: 'center-1', subject: 'Maths',   chapter: 'Polynomials',           topic: 'Geometrical Meaning of Zeros',      planned_date: '2025-08-18', covered_date: '2025-08-18', status: 'covered',  revised_by_student: true  },
    { id: 'syl-4',  center_id: 'center-1', subject: 'Maths',   chapter: 'Polynomials',           topic: 'Division Algorithm & Remainder',     planned_date: '2025-09-01', covered_date: '2025-09-02', status: 'partial',  revised_by_student: false },
    { id: 'syl-5',  center_id: 'center-1', subject: 'Maths',   chapter: 'Quadratic Equations',   topic: 'Solving by Factorisation Method',    planned_date: '2025-09-15', covered_date: '2025-09-15', status: 'covered',  revised_by_student: true  },
    { id: 'syl-6',  center_id: 'center-1', subject: 'Physics', chapter: 'Light – Reflection',    topic: 'Laws of Reflection & Curved Mirrors', planned_date: '2025-08-05', covered_date: '2025-08-05', status: 'covered',  revised_by_student: true  },
    { id: 'syl-7',  center_id: 'center-1', subject: 'Physics', chapter: 'Light – Reflection',    topic: 'Ray Diagrams for Concave & Convex',  planned_date: '2025-08-12', covered_date: '2025-08-12', status: 'covered',  revised_by_student: true  },
    { id: 'syl-8',  center_id: 'center-1', subject: 'Physics', chapter: 'Light – Refraction',    topic: 'Snell\'s Law and Refractive Index',  planned_date: '2025-09-02', covered_date: '2025-09-02', status: 'covered',  revised_by_student: false },
    { id: 'syl-9',  center_id: 'center-1', subject: 'Physics', chapter: 'Electricity',           topic: 'Ohm\'s Law & Resistance Factors',    planned_date: '2025-09-16', covered_date: null,         status: 'skipped',  revised_by_student: false },
    { id: 'syl-10', center_id: 'center-1', subject: 'Physics', chapter: 'Electricity',           topic: 'Combination of Resistors (Series/||)',planned_date: '2025-10-06', covered_date: '2025-10-07', status: 'covered',  revised_by_student: true  },

    // Center 2: Apex Chemistry Institute (Dr. Rashmi Verma)
    { id: 'syl-11', center_id: 'center-2', subject: 'Chemistry', chapter: 'Chemical Reactions',    topic: 'Balancing Chemical Equations',       planned_date: '2025-08-06', covered_date: '2025-08-06', status: 'covered',  revised_by_student: true  },
    { id: 'syl-12', center_id: 'center-2', subject: 'Chemistry', chapter: 'Chemical Reactions',    topic: 'Types of Reactions (Redox & Precip)',planned_date: '2025-08-13', covered_date: '2025-08-13', status: 'covered',  revised_by_student: true  },
    { id: 'syl-13', center_id: 'center-2', subject: 'Chemistry', chapter: 'Acids, Bases & Salts',  topic: 'Properties of Acids & Bases',        planned_date: '2025-09-03', covered_date: '2025-09-03', status: 'covered',  revised_by_student: false },
    { id: 'syl-14', center_id: 'center-2', subject: 'Chemistry', chapter: 'Acids, Bases & Salts',  topic: 'Importance of pH Scale & Indicators',planned_date: '2025-09-17', covered_date: '2025-09-18', status: 'partial',  revised_by_student: false },
    { id: 'syl-15', center_id: 'center-2', subject: 'Chemistry', chapter: 'Metals & Non-metals',   topic: 'Reactivity Series of Metals',        planned_date: '2025-10-07', covered_date: '2025-10-07', status: 'covered',  revised_by_student: true  },

    // Center 3: Zenith Biology Tuitions (Prof. Arindam Sen)
    { id: 'syl-16', center_id: 'center-3', subject: 'Biology',   chapter: 'Life Processes',        topic: 'Autotrophic & Heterotrophic Nutrition', planned_date: '2025-08-07', covered_date: '2025-08-07', status: 'covered', revised_by_student: true  },
    { id: 'syl-17', center_id: 'center-3', subject: 'Biology',   chapter: 'Life Processes',        topic: 'Aerobic & Anaerobic Cellular Respiration', planned_date: '2025-08-14', covered_date: '2025-08-14', status: 'covered', revised_by_student: false },
    { id: 'syl-18', center_id: 'center-3', subject: 'Biology',   chapter: 'Control & Coordination',topic: 'Human Nervous System & Reflex Arc',  planned_date: '2025-09-04', covered_date: '2025-09-05', status: 'partial',  revised_by_student: false },
    { id: 'syl-19', center_id: 'center-3', subject: 'Biology',   chapter: 'Control & Coordination',topic: 'Endocrine Glands & Hormones in Animals', planned_date: '2025-09-18', covered_date: '2025-09-18', status: 'covered', revised_by_student: true },
    { id: 'syl-20', center_id: 'center-3', subject: 'Biology',   chapter: 'How Organisms Reproduce',topic: 'Modes of Reproduction by Single Cells', planned_date: '2025-10-08', covered_date: null,    status: 'upcoming', revised_by_student: false },

    // Center 4: Horizon English Studio (Mrs. Kavita Roy)
    { id: 'syl-21', center_id: 'center-4', subject: 'English',   chapter: 'First Flight Prose',    topic: 'A Letter to God (Thematic Analysis)', planned_date: '2025-08-08', covered_date: '2025-08-08', status: 'covered',  revised_by_student: true  },
    { id: 'syl-22', center_id: 'center-4', subject: 'English',   chapter: 'First Flight Prose',    topic: 'Nelson Mandela: Long Walk to Freedom', planned_date: '2025-08-15', covered_date: '2025-08-15', status: 'covered', revised_by_student: true },
    { id: 'syl-23', center_id: 'center-4', subject: 'English',   chapter: 'Grammar & Usage',       topic: 'Reported Speech (Direct to Indirect)',planned_date: '2025-09-05', covered_date: '2025-09-05', status: 'covered',  revised_by_student: false },
    { id: 'syl-24', center_id: 'center-4', subject: 'English',   chapter: 'Grammar & Usage',       topic: 'Conditionals & Modal Auxiliaries',   planned_date: '2025-09-19', covered_date: null,         status: 'skipped',  revised_by_student: false },
    { id: 'syl-25', center_id: 'center-4', subject: 'English',   chapter: 'Writing Skills',        topic: 'Analytical Paragraph & Formal Letter', planned_date: '2025-10-09', covered_date: '2025-10-09', status: 'covered',  revised_by_student: true  }
  ],

  // ─── 7. TABLE: videos (Teacher's Own Videos & Curated Lessons per Center) ───
  videos: [
    // Center 1: Stellar Academy (Er. Alok Sharma & Dr. Deepa Nair)
    { id: 'vid-1', center_id: 'center-1', teacher_name: 'Er. Alok Sharma',  title: 'Quadratic Equations Masterclass',      subject: 'Maths',     chapter: 'Quadratic Equations',  youtube_id: 'IWigcMGGMIs', duration: '18:24', description: 'Step-by-step breakdown of factorisation, completing square, and the quadratic formula.' },
    { id: 'vid-2', center_id: 'center-1', teacher_name: 'Er. Alok Sharma',  title: 'Trigonometry Ratios & Values',         subject: 'Maths',     chapter: 'Trigonometry',         youtube_id: 'F21S9Wpi0y8', duration: '22:10', description: 'Visual intuition behind Sine, Cosine, Tangent and standard angle identities.' },
    { id: 'vid-3', center_id: 'center-1', teacher_name: 'Dr. Deepa Nair',   title: 'Newton\'s Laws of Motion in Action',  subject: 'Physics',   chapter: 'Force & Laws of Motion',youtube_id: 'ZM8ECpBuQYE', duration: '15:44', description: 'Inertia, momentum vectors, and action-reaction pairs illustrated with animations.' },
    { id: 'vid-4', center_id: 'center-1', teacher_name: 'Dr. Deepa Nair',   title: 'Current Electricity & Circuit Diagrams',subject: 'Physics', chapter: 'Electricity',          youtube_id: 'BLbHC7elJAM', duration: '20:30', description: 'Potential difference, Ohm\'s Law, and equivalent resistance calculations.' },

    // Center 2: Apex Chemistry Institute (Dr. Rashmi Verma)
    { id: 'vid-5', center_id: 'center-2', teacher_name: 'Dr. Rashmi Verma', title: 'Bohr\'s Model of the Atom',            subject: 'Chemistry', chapter: 'Structure of the Atom',youtube_id: 'FSyAehMdpyQ', duration: '16:52', description: 'Electronic configurations, valency electrons, and modern atomic structure.' },
    { id: 'vid-6', center_id: 'center-2', teacher_name: 'Dr. Rashmi Verma', title: 'Chemical Reactions & Equations',       subject: 'Chemistry', chapter: 'Chemical Reactions',   youtube_id: 'vt8pvLByTfQ', duration: '19:05', description: 'Balancing coefficients, oxidation states, and precipitation reactions.' },

    // Center 3: Zenith Biology Tuitions (Prof. Arindam Sen)
    { id: 'vid-7', center_id: 'center-3', teacher_name: 'Prof. Arindam Sen', title: 'Cell Structure and Organelles',        subject: 'Biology',   chapter: 'Life Processes',       youtube_id: '8IlzKri08kQ', duration: '24:18', description: 'Detailed walkthrough of cellular machinery: mitochondria, ribosomes, ER, and nucleus.' },

    // Center 4: Horizon English Studio (Mrs. Kavita Roy)
    { id: 'vid-8', center_id: 'center-4', teacher_name: 'Mrs. Kavita Roy',  title: 'Reported Speech & Direct Indirect',    subject: 'English',   chapter: 'Grammar & Usage',      youtube_id: 'Dqjb_mdvhM4', duration: '12:00', description: 'Tense backshifting rules, modal changes, and pronoun transformations.' }
  ],

  // ─── 8. TABLE: tests (Conducted by Specific Centers / Teachers) ─────────────
  tests: [
    // Center 1: Stellar Academy
    {
      id: 'test-1',
      student_id: 'student-1',
      center_id: 'center-1',
      name: 'Unit Assessment 1 – Maths (Algebra)',
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
      center_id: 'center-1',
      name: 'Stellar Physics Evaluation – Optics',
      subject: 'Physics',
      date: '2025-09-20',
      total_marks: 25,
      marks_obtained: 19,
      duration_min: 60,
      topics_tested: ['Reflection & Refraction'],
      weak_topics: ['Snell\'s Law sign conventions']
    },
    {
      id: 'test-3',
      student_id: 'student-1',
      center_id: 'center-1',
      name: 'Mid Term Comprehensive (Maths & Physics)',
      subject: 'Maths & Physics',
      date: '2025-10-04',
      total_marks: 80,
      marks_obtained: 69,
      duration_min: 150,
      topics_tested: ['Term 1 Full Curriculum'],
      weak_topics: ['Ohm\'s Law circuits', 'Quadratic word problems']
    },

    // Center 2: Apex Chemistry Institute
    {
      id: 'test-4',
      student_id: 'student-1',
      center_id: 'center-2',
      name: 'Apex Chemistry Weekly Challenge',
      subject: 'Chemistry',
      date: '2025-10-11',
      total_marks: 20,
      marks_obtained: 18,
      duration_min: 30,
      topics_tested: ['Acids, Bases & Salts'],
      weak_topics: ['Balancing precipitation equations']
    },

    // Center 3: Zenith Biology Tuitions
    {
      id: 'test-5',
      student_id: 'student-1',
      center_id: 'center-3',
      name: 'Zenith Biology Cell & Respiration Test',
      subject: 'Biology',
      date: '2025-10-14',
      total_marks: 25,
      marks_obtained: 23,
      duration_min: 45,
      topics_tested: ['Cellular Respiration', 'Nutrition in Animals'],
      weak_topics: ['Anaerobic yeast breakdown equations']
    }
  ],

  // ─── 9. TABLE: documents (Official Marksheets & Certificates per Center) ───
  documents: [
    {
      id: 'doc-1',
      student_id: 'student-1',
      center_id: 'center-1',
      type: 'marksheet',
      title: 'Mid Term Official Marksheet – 2025',
      issue_date: '2025-10-10',
      code: 'VS2025-A1B2',
      status: 'valid',
      exam_name: 'Stellar Academy Class 10 Mid Term Examination 2025',
      center_name: 'Stellar Academy',
      director_name: 'Er. Alok Sharma (Director)',
      subject_marks: [
        { subject: 'Maths',     max: 40, obtained: 36 },
        { subject: 'Physics',   max: 40, obtained: 33 }
      ],
      total_max: 80,
      total_obtained: 69,
      percentage: 86.25,
      grade: 'A+',
      attendance_percent: 90.0
    },
    {
      id: 'doc-2',
      student_id: 'student-1',
      center_id: 'center-2',
      type: 'marksheet',
      title: 'Chemistry Term 1 Performance Card',
      issue_date: '2025-10-12',
      code: 'APEX-2025-C1',
      status: 'valid',
      exam_name: 'Apex Chemistry Mid Term Evaluation & Lab Quiz',
      center_name: 'Apex Chemistry Institute',
      director_name: 'Dr. Rashmi Verma (Academic Head)',
      subject_marks: [
        { subject: 'Organic Chemistry',   max: 20, obtained: 18 },
        { subject: 'Inorganic Chemistry', max: 20, obtained: 19 },
        { subject: 'Physical Chemistry',  max: 10, obtained: 9  }
      ],
      total_max: 50,
      total_obtained: 46,
      percentage: 92.0,
      grade: 'A+',
      attendance_percent: 88.0
    },
    {
      id: 'doc-3',
      student_id: 'student-1',
      center_id: 'center-1',
      type: 'certificate',
      title: 'Certificate of Academic Distinction',
      issue_date: '2025-10-14',
      code: 'VS2025-C3D4',
      status: 'valid',
      exam_name: 'Stellar STEM Talent Search & Evaluation 2025',
      center_name: 'Stellar Academy',
      director_name: 'Er. Alok Sharma (Director)',
      subject_marks: [
        { subject: 'Physics', max: 25, obtained: 23 },
        { subject: 'Maths',   max: 25, obtained: 24 }
      ],
      total_max: 50,
      total_obtained: 47,
      percentage: 94.0,
      grade: 'A+',
      attendance_percent: 92.0
    },
    {
      id: 'doc-4',
      student_id: 'student-1',
      center_id: 'center-3',
      type: 'marksheet',
      title: 'Unit Test 1 Archive Record',
      issue_date: '2025-09-10',
      code: 'VS2025-X9Y8',
      status: 'revoked',
      exam_name: 'Zenith Biology Unit Test 1 (Superseded by Retest)',
      center_name: 'Zenith Biology Tuitions',
      director_name: 'Prof. Arindam Sen',
      subject_marks: [
        { subject: 'Cell Biology', max: 25, obtained: 19 }
      ],
      total_max: 25,
      total_obtained: 19,
      percentage: 76.0,
      grade: 'B+',
      attendance_percent: 85.0
    }
  ],

  // ─── 10. TABLE: simulations (Generic STEM Labs – Universal for All Students) ─
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

  // ─── 11. TABLE: leaderboard ────────────────────────────────────────────────
  leaderboard: [
    { rank: 1,  student_name: 'Rahul Sharma',    points: 1840, badge: '🥇', center: 'Stellar Academy' },
    { rank: 2,  student_name: 'Ananya Patel',    points: 1780, badge: '🥈', center: 'Apex Chemistry' },
    { rank: 3,  student_name: 'Kabir Mehta',     points: 1650, badge: '🥉', center: 'Stellar Academy' },
    { rank: 4,  student_name: 'Meera Joshi',     points: 1520, badge: '⭐', center: 'Zenith Biology' },
    { rank: 5,  student_name: 'Vivek Gupta',     points: 1490, badge: '⭐', center: 'Horizon English' },
    { rank: 6,  student_name: 'Aryan Mehta',     points: 1420, badge: '⭐', center: 'Stellar Academy', is_self: true },
    { rank: 7,  student_name: 'Tanvi Desai',     points: 1380, badge: '⭐', center: 'Stellar Academy' },
    { rank: 8,  student_name: 'Riya Kapoor',     points: 1190, badge: '⭐', center: 'Apex Chemistry' }
  ],

  // ─── 12. TABLE: mcqs ───────────────────────────────────────────────────────
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

  // ─── 13. TABLE: points_history ─────────────────────────────────────────────
  points_history: [
    { id: 'ph-1',  student_id: 'student-1', date: '2025-10-17', action: 'focus_session',   points: 50,  description: '45-minute distraction-free focus study completed' },
    { id: 'ph-2',  student_id: 'student-1', date: '2025-10-16', action: 'attendance',      points: 10,  description: 'Daily QR attendance marked at Stellar Academy' },
    { id: 'ph-3',  student_id: 'student-1', date: '2025-10-15', action: 'test_score',      points: 80,  description: 'Apex Chemistry Weekly Challenge: 18/20 points' },
    { id: 'ph-4',  student_id: 'student-1', date: '2025-10-14', action: 'topic_revised',   points: 15,  description: 'Self-revision confirmed: Zeros of Polynomials' },
    { id: 'ph-5',  student_id: 'student-1', date: '2025-10-13', action: 'attendance',      points: 10,  description: 'Daily QR attendance marked at Zenith Biology' },
    { id: 'ph-6',  student_id: 'student-1', date: '2025-10-12', action: 'streak_bonus',    points: 25,  description: '10-Day continuous study streak milestone bonus!' },
    { id: 'ph-7',  student_id: 'student-1', date: '2025-10-11', action: 'focus_session',   points: 50,  description: '25-minute Pomodoro study sprint completed' },
    { id: 'ph-8',  student_id: 'student-1', date: '2025-10-10', action: 'topic_done',      points: 20,  description: 'Topic mastery checked: Laws of Reflection' }
  ],

  // ─── 14. TABLE: badges ─────────────────────────────────────────────────────
  badges: [
    { id: 'badge-1', name: 'Multi-Center Scholar', description: 'Enrolled and actively learning across multiple coaching faculties', icon_emoji: '🏛️', earned: true,  earned_date: '2025-08-01' },
    { id: 'badge-2', name: '7-Day Flame',          description: 'Active learning streak of 7 continuous days',                      icon_emoji: '🔥', earned: true,  earned_date: '2025-08-08' },
    { id: 'badge-3', name: 'Honor Roll',           description: 'Scored above 85% in any formal assessment across any faculty',      icon_emoji: '🏆', earned: true,  earned_date: '2025-09-06' },
    { id: 'badge-4', name: 'Deep Focus Pro',       description: 'Finished 10 verified timer focus sessions in the study room',       icon_emoji: '🎯', earned: false, earned_date: null },
    { id: 'badge-5', name: 'On-Time Scholar',      description: 'All term fees cleared prior to due dates across all coaching centers',icon_emoji: '💎', earned: true,  earned_date: '2025-10-02' },
    { id: 'badge-6', name: 'STEM Explorer',        description: 'Completed 5 interactive virtual laboratory simulations',            icon_emoji: '🧪', earned: true,  earned_date: '2025-10-12' }
  ]

}; // end window.DATA

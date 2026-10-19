// ============================================================================
// js/main.js — Vilarci Study: Multi-Coaching & Tuition Platform
// Demo v2.0 (Maroon Edition) — Full Vanilla JavaScript Application Controller
// Supports multiple coaching centers/teachers, up to 5 student profiles,
// center-specific academic records (fees, syllabus, attendance, videos, marksheets),
// and universal STEM simulations & focus room. Zero external dependencies.
// ============================================================================

(function () {
  'use strict';

  // ─── 1. GLOBAL STATE & CONFIGURATION ───────────────────────────────────────
  var DATA = window.DATA || {};
  var currentStudentId = 'student-1';
  var currentCenterId = 'all'; // 'all' or specific center ID e.g. 'center-1'
  var isParentMode = false;
  var currentMonthIndex = 9; // October (0-indexed: 7=Aug, 8=Sep, 9=Oct 2025)
  var currentYear = 2025;
  var timerInterval = null;
  var timerRemainingSeconds = 25 * 60;
  var timerIsRunning = false;
  var currentFocusVideoId = 'IWigcMGGMIs';
  var currentDocViewing = null;
  var activeQuizIndex = 0;
  var quizScore = 0;
  var quizAnswered = false;

  // ─── 2. LOCAL STORAGE HELPERS ──────────────────────────────────────────────
  var Store = {
    get: function (key, fallback) {
      try {
        var val = localStorage.getItem(key);
        return val ? JSON.parse(val) : fallback;
      } catch (e) {
        console.warn('Storage read failed for', key, e);
        return fallback;
      }
    },
    set: function (key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        console.warn('Storage write failed for', key, e);
      }
    },
    remove: function (key) {
      try {
        localStorage.removeItem(key);
      } catch (e) {}
    },
    reset: function () {
      try {
        localStorage.clear();
      } catch (e) {}
    }
  };

  // Application State
  var STATE = {};

  function initState() {
    STATE = {
      students: Store.get('vs_students', DATA.students || []),
      centers: Store.get('vs_centers', DATA.centers || []),
      attendance: Store.get('vs_attendance', DATA.attendance || []),
      fees: Store.get('vs_fees', DATA.fees || []),
      syllabus: Store.get('vs_syllabus', DATA.syllabus || []),
      tests: Store.get('vs_tests', DATA.tests || []),
      videos: Store.get('vs_videos', DATA.videos || []),
      documents: Store.get('vs_documents', DATA.documents || []),
      points: Store.get('vs_points', 1420),
      streak: Store.get('vs_streak', 14),
      focus_sessions: Store.get('vs_focus_sessions', []),
      video_notes: Store.get('vs_video_notes', {}),
      theme: Store.get('vs_theme', 'light'),
      leaderboard: Store.get('vs_leaderboard', DATA.leaderboard || []),
      points_history: Store.get('vs_points_history', DATA.points_history || []),
      badges: Store.get('vs_badges', DATA.badges || [])
    };
  }

  // ─── 3. MODEL LOOKUPS & HELPERS ───────────────────────────────────────────
  function getActiveStudent() {
    var list = (STATE.students && STATE.students.length > 0) ? STATE.students : (DATA.students || []);
    return list.find(function (s) {
      return s.id === currentStudentId;
    }) || list[0] || {
      id: 'student-1',
      name: 'Aryan Mehta',
      roll: 'SA-101',
      class: 'Class 10',
      board: 'CBSE',
      parent_name: 'Sunita Mehta',
      photo_initials: 'AM',
      enrolled_centers: ['center-1', 'center-2', 'center-3'],
      points: STATE.points || 1420,
      streak: STATE.streak || 14
    };
  }

  function getActiveCenter() {
    if (currentCenterId === 'all') return null;
    var list = (STATE.centers && STATE.centers.length > 0) ? STATE.centers : (DATA.centers || []);
    return list.find(function (c) {
      return c.id === currentCenterId;
    }) || null;
  }

  function getCenterById(centerId) {
    var list = (STATE.centers && STATE.centers.length > 0) ? STATE.centers : (DATA.centers || []);
    return list.find(function (c) {
      return c.id === centerId;
    }) || {
      id: centerId,
      name: 'Independent Faculty',
      color: '#800020',
      logo_text: 'VS',
      type: 'Coaching',
      teacher_name: 'Faculty Instructor'
    };
  }

  function getStudentEnrolledCenters(studentId) {
    var student = (STATE.students || []).find(function (s) { return s.id === studentId; });
    var allCenters = STATE.centers || DATA.centers || [];
    if (!student || !student.enrolled_centers) return allCenters;
    return allCenters.filter(function (c) {
      return student.enrolled_centers.indexOf(c.id) !== -1;
    });
  }

  function getSubjectColor(subject) {
    var s = (subject || '').toLowerCase();
    if (s.indexOf('math') !== -1) return 'var(--color-maths)';
    if (s.indexOf('phys') !== -1) return 'var(--color-physics)';
    if (s.indexOf('chem') !== -1) return 'var(--color-chemistry)';
    if (s.indexOf('bio') !== -1) return 'var(--color-biology)';
    if (s.indexOf('eng') !== -1) return 'var(--color-english)';
    return 'var(--primary)';
  }

  function getSubjectBadgeClass(subject) {
    var s = (subject || '').toLowerCase();
    if (s.indexOf('math') !== -1) return 'badge-maths';
    if (s.indexOf('phys') !== -1) return 'badge-physics';
    if (s.indexOf('chem') !== -1) return 'badge-chemistry';
    if (s.indexOf('bio') !== -1) return 'badge-biology';
    if (s.indexOf('eng') !== -1) return 'badge-english';
    return 'badge-primary';
  }

  function generateQrSvg(code) {
    code = code || 'VS2025';
    var sum = 0;
    for (var i = 0; i < code.length; i++) sum += code.charCodeAt(i);
    var rects = '';
    var cells = [
      [1,1,1,1,1,1,1,0,1],
      [1,0,0,0,0,0,1,0,0],
      [1,0,1,1,1,0,1,0,1],
      [1,0,1,1,1,0,1,0,0],
      [1,0,0,0,0,0,1,1,1],
      [1,1,1,1,1,1,1,0,1],
      [0,0,0,0,0,0,0,1,0],
      [1,1,0,1,0,1,1,0,1],
      [1,0,1,0,1,0,0,1,1]
    ];
    for (var r = 0; r < 9; r++) {
      for (var c = 0; c < 9; c++) {
        var isFilled = cells[r][c] || ((sum + r * 7 + c * 3) % 3 === 0);
        if ((r < 3 && c < 3) || (r < 3 && c > 5) || (r > 5 && c < 3)) {
          isFilled = cells[r][c];
        }
        if (isFilled) {
          rects += '<rect x="' + (c * 6) + '" y="' + (r * 6) + '" width="5.2" height="5.2" rx="0.8" fill="#1F0D12"/>';
        }
      }
    }
    return '<svg viewBox="0 0 54 54" class="doc-qr-svg" role="img" aria-label="Verification QR code">' + rects + '</svg>';
  }

  // ─── 4. TOAST SYSTEM ───────────────────────────────────────────────────────
  function showToast(message, type, duration) {
    type = type || 'info';
    duration = duration || 3200;

    var container = document.getElementById('toastContainer');
    if (!container) return;

    var toast = document.createElement('div');
    toast.className = 'toast toast-' + type;

    var iconSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';
    if (type === 'success') {
      iconSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';
    } else if (type === 'error') {
      iconSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
    } else if (type === 'warning') {
      iconSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';
    }

    toast.innerHTML =
      '<div class="toast-icon">' + iconSvg + '</div>' +
      '<div class="toast-msg">' + message + '</div>' +
      '<button type="button" class="toast-close" aria-label="Close">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
      '</button>';

    var closeBtn = toast.querySelector('.toast-close');
    var removeToast = function () {
      toast.classList.add('hiding');
      setTimeout(function () {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 250);
    };

    closeBtn.addEventListener('click', removeToast);
    container.appendChild(toast);
    setTimeout(removeToast, duration);
  }

  // ─── 5. MODAL SYSTEM ───────────────────────────────────────────────────────
  function openModal(options) {
    var container = document.getElementById('modalContainer');
    if (!container) return;

    var overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');

    overlay.innerHTML =
      '<div class="modal">' +
        '<div class="modal-header">' +
          '<h3 class="modal-title">' + (options.title || 'Notice') + '</h3>' +
          '<button type="button" class="modal-close" aria-label="Close dialog">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
          '</button>' +
        '</div>' +
        '<div class="modal-body">' + (options.body || '') + '</div>' +
        (options.footer ? '<div class="modal-footer">' + options.footer + '</div>' : '') +
      '</div>';

    var close = function () {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      if (typeof options.onClose === 'function') options.onClose();
    };

    overlay.querySelector('.modal-close').addEventListener('click', close);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) close();
    });

    container.appendChild(overlay);

    if (typeof options.onReady === 'function') {
      options.onReady(overlay, close);
    }
    return close;
  }

  // ─── 6. THEME SYSTEM ───────────────────────────────────────────────────────
  function applyTheme(theme) {
    STATE.theme = theme;
    Store.set('vs_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);

    var sunIcon = document.getElementById('themeIconSun');
    var moonIcon = document.getElementById('themeIconMoon');
    var settingsToggle = document.getElementById('settingsThemeToggle');

    if (theme === 'dark') {
      if (sunIcon) sunIcon.style.display = 'block';
      if (moonIcon) moonIcon.style.display = 'none';
      if (settingsToggle) settingsToggle.checked = true;
    } else {
      if (sunIcon) sunIcon.style.display = 'none';
      if (moonIcon) moonIcon.style.display = 'block';
      if (settingsToggle) settingsToggle.checked = false;
    }
  }

  function toggleTheme() {
    var newTheme = STATE.theme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
    showToast('Switched to ' + (newTheme === 'dark' ? 'Deep Wine Dark' : 'Maroon Light') + ' mode', 'info', 2000);
  }

  function toggleParentMode() {
    isParentMode = !isParentMode;
    var toggleBtn = document.getElementById('modeToggle');
    var toggleLabel = document.getElementById('modeToggleLabel');

    if (isParentMode) {
      if (toggleBtn) toggleBtn.classList.add('parent-active');
      if (toggleLabel) toggleLabel.textContent = 'Parent Mode';
      showToast('Switched to Parent Dashboard (Household Overview)', 'info', 2500);
    } else {
      if (toggleBtn) toggleBtn.classList.remove('parent-active');
      if (toggleLabel) toggleLabel.textContent = 'Student';
      showToast('Switched to Student Portal View', 'info', 2500);
    }

    handleRouting();
  }

  // ─── 7. MULTI-STUDENT PROFILE MANAGEMENT (Up to 5 profiles) ────────────────
  function openSwitchProfileModal() {
    var students = STATE.students || DATA.students || [];
    var profilesHtml = students.map(function (s) {
      var isCurrent = (s.id === currentStudentId);
      var enrolled = getStudentEnrolledCenters(s.id);
      return '<div class="student-profile-select-item' + (isCurrent ? ' selected' : '') + '" data-student-id="' + s.id + '" style="display:flex; align-items:center; gap:14px; padding:12px 14px; border-radius:var(--radius-md); border:1.5px solid ' + (isCurrent ? 'var(--primary)' : 'var(--border)') + '; background:' + (isCurrent ? 'var(--primary-subtle)' : 'var(--surface)') + '; cursor:pointer; transition:all 0.18s ease;">' +
        '<div class="sidebar-avatar" style="width:40px; height:40px; font-size:14px; background:' + (s.avatar_bg || 'linear-gradient(135deg, var(--primary), var(--accent))') + ';">' + (s.photo_initials || 'ST') + '</div>' +
        '<div style="flex:1; overflow:hidden;">' +
          '<div style="display:flex; align-items:center; gap:8px;">' +
            '<strong style="font-size:14px; color:var(--text-main);">' + s.name + '</strong>' +
            (isCurrent ? '<span class="badge badge-primary" style="font-size:10px;">Active</span>' : '') +
          '</div>' +
          '<div class="text-xs text-muted" style="margin-top:2px;">Roll: ' + s.roll + ' &bull; ' + s.class + ' (' + (s.board || 'CBSE') + ') &bull; ' + enrolled.length + ' Enrolled Centers</div>' +
        '</div>' +
        (isCurrent ? '<svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2.5" style="width:20px; height:20px;"><polyline points="20 6 9 17 4 12"/></svg>' : '<span class="text-xs text-secondary" style="font-weight:600;">Switch &rarr;</span>') +
      '</div>';
    }).join('');

    var modalHtml =
      '<div style="display:flex; flex-direction:column; gap:12px;">' +
        '<p class="text-xs text-secondary">' +
          'Select an active student profile to inspect classes, test scores, attendance, and fee invoices.' +
        '</p>' +
        '<div style="display:flex; flex-direction:column; gap:8px; margin:4px 0 10px;">' +
          profilesHtml +
        '</div>' +
        '<div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border); padding-top:14px;">' +
          '<span class="text-xs text-muted">' + students.length + ' of 5 profiles used</span>' +
          '<button type="button" class="btn btn-secondary btn-sm" id="btnAddNewFromSwitchModal">' +
            '+ Add New Student Profile' +
          '</button>' +
        '</div>' +
      '</div>';

    var closeModal = openModal({
      title: 'Switch Student Profile',
      body: modalHtml,
      onReady: function (overlay) {
        var items = overlay.querySelectorAll('.student-profile-select-item');
        items.forEach(function (item) {
          item.onclick = function () {
            var sId = this.getAttribute('data-student-id');
            closeModal();
            setStudent(sId);
          };
        });

        var addBtn = overlay.querySelector('#btnAddNewFromSwitchModal');
        if (addBtn) {
          addBtn.onclick = function () {
            closeModal();
            openAddStudentModal();
          };
        }
      }
    });
  }

  function renderStudentSelector() {
    var sidebarSelect = document.getElementById('sidebarStudentSelect');
    var childSelect = document.getElementById('childSelect');
    var students = STATE.students || DATA.students || [];

    var optionsHtml = students.map(function (s) {
      return '<option value="' + s.id + '"' + (s.id === currentStudentId ? ' selected' : '') + '>' +
        s.name + ' (' + s.class + ')' +
      '</option>';
    }).join('');

    if (sidebarSelect) {
      sidebarSelect.innerHTML = optionsHtml;
      sidebarSelect.onchange = function () {
        setStudent(this.value);
      };
    }

    if (childSelect) {
      childSelect.innerHTML = optionsHtml;
      childSelect.onchange = function () {
        setStudent(this.value);
      };
    }
  }

  function setStudent(studentId) {
    currentStudentId = studentId;
    var student = getActiveStudent();

    // If current center is not enrolled by this student, revert to 'all'
    if (currentCenterId !== 'all' && (student.enrolled_centers || []).indexOf(currentCenterId) === -1) {
      currentCenterId = 'all';
    }

    updateSidebarProfile();
    renderStudentSelector();
    renderCenterSelector();
    showToast('Active profile set to ' + student.name, 'info', 2000);
    handleRouting();
  }

  function openAddStudentModal() {
    var students = STATE.students || [];
    if (students.length >= 5) {
      showToast('Maximum 5 student profiles reached for this household account.', 'warning', 3500);
      return;
    }

    var centers = STATE.centers || [];
    var centerCheckboxes = centers.map(function (c) {
      return '<label style="display:flex; align-items:center; gap:8px; font-size:13px; cursor:pointer;">' +
        '<input type="checkbox" name="addStudentCenters" value="' + c.id + '" checked style="accent-color:var(--primary);">' +
        '<span><strong>' + c.name + '</strong> (' + c.subjects.join(', ') + ')</span>' +
      '</label>';
    }).join('');

    var modalHtml =
      '<form id="formAddStudent" style="display:flex; flex-direction:column; gap:14px;">' +
        '<div>' +
          '<label class="form-label">Student Full Name *</label>' +
          '<input type="text" id="addStudentName" class="form-input" required placeholder="e.g. Kabir Mehta">' +
        '</div>' +
        '<div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">' +
          '<div>' +
            '<label class="form-label">Grade / Class *</label>' +
            '<select id="addStudentClass" class="form-input" required>' +
              '<option value="Class 8">Class 8</option>' +
              '<option value="Class 9">Class 9</option>' +
              '<option value="Class 10" selected>Class 10</option>' +
              '<option value="Class 11">Class 11</option>' +
              '<option value="Class 12">Class 12</option>' +
            '</select>' +
          '</div>' +
          '<div>' +
            '<label class="form-label">Academic Board</label>' +
            '<select id="addStudentBoard" class="form-input">' +
              '<option value="CBSE">CBSE</option>' +
              '<option value="ICSE">ICSE</option>' +
              '<option value="State Board">State Board</option>' +
            '</select>' +
          '</div>' +
        '</div>' +
        '<div>' +
          '<label class="form-label">Link Initial Coaching Centers &amp; Faculties:</label>' +
          '<div style="display:flex; flex-direction:column; gap:8px; background:var(--surface-muted); padding:10px 14px; border-radius:var(--radius-sm); border:1px solid var(--border);">' +
            centerCheckboxes +
          '</div>' +
        '</div>' +
        '<div style="display:flex; justify-content:flex-end; gap:10px; margin-top:8px;">' +
          '<button type="button" class="btn btn-secondary" id="btnCancelAddStudent">Cancel</button>' +
          '<button type="submit" class="btn btn-primary">Create Profile (' + (students.length + 1) + '/5)</button>' +
        '</div>' +
      '</form>';

    var closeModal = openModal({
      title: 'Add Student Profile (Profile ' + (students.length + 1) + ' of 5)',
      body: modalHtml,
      onReady: function (overlay) {
        var form = overlay.querySelector('#formAddStudent');
        var cancel = overlay.querySelector('#btnCancelAddStudent');
        if (cancel) cancel.onclick = closeModal;

        if (form) {
          form.onsubmit = function (e) {
            e.preventDefault();
            var name = document.getElementById('addStudentName').value.trim();
            var cls = document.getElementById('addStudentClass').value;
            var board = document.getElementById('addStudentBoard').value;

            var checkedBoxes = overlay.querySelectorAll('input[name="addStudentCenters"]:checked');
            var selectedCenterIds = [];
            checkedBoxes.forEach(function (cb) { selectedCenterIds.push(cb.value); });
            if (selectedCenterIds.length === 0) selectedCenterIds = ['center-1'];

            var initials = name.split(' ').map(function (w) { return w[0]; }).join('').substring(0, 2).toUpperCase() || 'ST';
            var newId = 'student-' + Date.now();
            var rollNum = 'SA-' + (100 + STATE.students.length + 1);

            var newStudent = {
              id: newId,
              name: name,
              roll: rollNum,
              class: cls,
              board: board,
              dob: '2011-05-18',
              phone: '+91 99887 00000',
              parent_name: 'Sunita Mehta',
              parent_phone: '+91 98765 11223',
              photo_initials: initials,
              avatar_bg: 'linear-gradient(135deg, #800020, #D97706)',
              enrolled_centers: selectedCenterIds,
              points: 100,
              streak: 1
            };

            STATE.students.push(newStudent);
            Store.set('vs_students', STATE.students);
            closeModal();
            showToast('🎉 Student profile created for ' + name + '!', 'success', 3500);
            setStudent(newId);
          };
        }
      }
    });
  }

  // ─── 8. MULTI-COACHING & TEACHER SWITCHING + JOINING ────────────────────────
  function renderCenterSelector() {
    var select = document.getElementById('sidebarCenterSelect');
    if (!select) return;

    var student = getActiveStudent();
    var enrolled = getStudentEnrolledCenters(student.id);

    var html = '<option value="all"' + (currentCenterId === 'all' ? ' selected' : '') + '>🌟 All Enrolled Centers (' + enrolled.length + ')</option>';
    enrolled.forEach(function (c) {
      html += '<option value="' + c.id + '"' + (c.id === currentCenterId ? ' selected' : '') + '>🏛️ ' + c.name + ' (' + c.subjects.join(', ') + ')</option>';
    });

    select.innerHTML = html;
    select.onchange = function () {
      currentCenterId = this.value;
      showToast(currentCenterId === 'all' ? 'Showing unified view across all enrolled centers' : 'Filtered to ' + getActiveCenter().name, 'info', 2000);
      handleRouting();
    };
  }

  function openJoinCenterModal() {
    var student = getActiveStudent();
    var centers = STATE.centers || [];

    var codePillsHtml = centers.map(function (c) {
      return '<button type="button" class="code-pill" data-code="' + c.code + '">' +
        '<span>' + c.logo_text + '</span> <strong>' + c.code + '</strong> ' +
        '<span class="text-xs text-muted">(' + c.name.split(' ')[0] + ')</span>' +
      '</button>';
    }).join(' ');

    var modalHtml =
      '<div style="display:flex; flex-direction:column; gap:14px;">' +
        '<p class="text-sm text-secondary">' +
          'Enter the 6-character Teacher or Coaching Center Code to link <strong>' + student.name + '</strong> with their curriculum, timetable, attendance, and fee ledger.' +
        '</p>' +
        '<div>' +
          '<label class="form-label">Available Demo Faculty / Academy Codes (Click to auto-fill):</label>' +
          '<div style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:12px;">' +
            codePillsHtml +
          '</div>' +
        '</div>' +
        '<form id="formJoinCenter">' +
          '<div style="display:flex; gap:10px; margin-bottom:12px;">' +
            '<input type="text" id="joinCenterCodeInput" class="form-input" placeholder="e.g. STLR10, APEX99, ZEN77" maxlength="10" style="font-family:var(--font-mono); font-weight:700; text-transform:uppercase;" required>' +
            '<button type="button" class="btn btn-secondary" id="btnPreviewCode">Preview</button>' +
          '</div>' +
          '<div id="joinCodePreviewContainer" style="display:none; background:var(--surface-muted); border:1px solid var(--border); border-radius:var(--radius-sm); padding:12px; margin-bottom:14px;"></div>' +
          '<div style="display:flex; justify-content:flex-end; gap:10px;">' +
            '<button type="button" class="btn btn-secondary" id="btnCancelJoinCenter">Cancel</button>' +
            '<button type="submit" class="btn btn-primary">Join Teacher / Center</button>' +
          '</div>' +
        '</form>' +
      '</div>';

    var closeModal = openModal({
      title: 'Join a Teacher or Coaching Center',
      body: modalHtml,
      onReady: function (overlay) {
        var input = overlay.querySelector('#joinCenterCodeInput');
        var previewBox = overlay.querySelector('#joinCodePreviewContainer');
        var form = overlay.querySelector('#formJoinCenter');
        var cancel = overlay.querySelector('#btnCancelJoinCenter');
        if (cancel) cancel.onclick = closeModal;

        var updatePreview = function (code) {
          code = (code || '').trim().toUpperCase();
          var found = centers.find(function (c) { return c.code.toUpperCase() === code; });
          if (found) {
            previewBox.style.display = 'block';
            var isAlready = (student.enrolled_centers || []).indexOf(found.id) !== -1;
            previewBox.innerHTML =
              '<div style="display:flex; align-items:center; gap:12px;">' +
                '<div class="teacher-logo-badge" style="background:' + found.color + '; width:38px; height:38px; font-size:13px;">' + found.logo_text + '</div>' +
                '<div style="flex:1;">' +
                  '<div class="fw-700 text-sm">' + found.name + ' (' + found.type + ')</div>' +
                  '<div class="text-xs text-secondary">' + found.teacher_name + ' &bull; ' + found.subjects.join(', ') + ' &bull; ₹' + found.monthly_fee + '/mo</div>' +
                '</div>' +
                (isAlready ? '<span class="badge badge-success">Already Linked</span>' : '<span class="badge badge-accent">Ready to Join</span>') +
              '</div>';
          } else {
            previewBox.style.display = 'none';
          }
        };

        var pills = overlay.querySelectorAll('.code-pill');
        pills.forEach(function (pill) {
          pill.onclick = function () {
            var code = this.getAttribute('data-code');
            if (input) {
              input.value = code;
              updatePreview(code);
            }
          };
        });

        if (input) {
          input.oninput = function () { updatePreview(this.value); };
        }

        var previewBtn = overlay.querySelector('#btnPreviewCode');
        if (previewBtn) {
          previewBtn.onclick = function () { updatePreview(input ? input.value : ''); };
        }

        if (form) {
          form.onsubmit = function (e) {
            e.preventDefault();
            var code = input.value.trim().toUpperCase();
            var found = centers.find(function (c) { return c.code.toUpperCase() === code; });
            if (!found) {
              showToast('Invalid faculty code. Click one of the demo chips above.', 'error', 3500);
              return;
            }

            if (!student.enrolled_centers) student.enrolled_centers = [];
            if (student.enrolled_centers.indexOf(found.id) !== -1) {
              showToast(student.name + ' is already enrolled in ' + found.name, 'info', 3000);
              currentCenterId = found.id;
              closeModal();
              renderCenterSelector();
              handleRouting();
              return;
            }

            student.enrolled_centers.push(found.id);
            Store.set('vs_students', STATE.students);
            currentCenterId = found.id;
            closeModal();
            showToast('🎉 Successfully linked with ' + found.name + '!', 'success', 3500);
            renderCenterSelector();
            handleRouting();
          };
        }
      }
    });
  }

  // ─── 9. TEACHER & COACHING HERO CARD COMPONENT ─────────────────────────────
  function renderTeacherHeroCard(containerId, extraHtml) {
    var el = document.getElementById(containerId);
    if (!el) return;

    var activeCenter = getActiveCenter();
    var student = getActiveStudent();
    var enrolled = getStudentEnrolledCenters(student.id);

    if (!activeCenter) {
      // Unified Multi-Coaching Hub View
      var centerPills = enrolled.map(function (c) {
        return '<span class="center-tag" style="border-color:' + c.color + '; color:' + c.color + ';">🏛️ ' + c.name + '</span>';
      }).join(' ');

      el.innerHTML =
        '<div class="teacher-hero-card" style="border-left-color: var(--accent);">' +
          '<div class="teacher-hero-info">' +
            '<div class="teacher-logo-badge" style="background: linear-gradient(135deg, var(--accent), #B45309);">🌟</div>' +
            '<div>' +
              '<div class="teacher-hero-title">Unified Multi-Coaching Academic Hub</div>' +
              '<div class="teacher-hero-sub">' +
                '<span>Linked with <strong>' + enrolled.length + ' Faculties &amp; Academies</strong></span> &bull; ' +
                '<span>Student: <strong>' + student.name + ' (' + student.class + ')</strong></span>' +
              '</div>' +
              '<div style="display:flex; flex-wrap:wrap; gap:6px; margin-top:8px;">' + centerPills + '</div>' +
            '</div>' +
          '</div>' +
          '<div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">' +
            (extraHtml || '') +
            '<button type="button" class="btn btn-secondary btn-sm" id="btnHeroJoinCenter">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px; height:14px;"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>' +
              'Join Teacher / Center' +
            '</button>' +
          '</div>' +
        '</div>';

      var joinBtn = el.querySelector('#btnHeroJoinCenter');
      if (joinBtn) joinBtn.onclick = openJoinCenterModal;

    } else {
      // Specific Teacher / Coaching Center View
      el.innerHTML =
        '<div class="teacher-hero-card" style="border-left-color:' + (activeCenter.color || 'var(--primary)') + ';">' +
          '<div class="teacher-hero-info">' +
            '<div class="teacher-logo-badge" style="background:' + (activeCenter.color || 'var(--primary)') + ';">' + (activeCenter.logo_text || 'VS') + '</div>' +
            '<div>' +
              '<div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">' +
                '<span class="teacher-hero-title">' + activeCenter.name + '</span>' +
                '<span class="badge badge-primary" style="font-size:10px;">' + activeCenter.type + '</span>' +
                '<span class="badge badge-neutral" style="font-size:10px; font-family:var(--font-mono);">Code: ' + activeCenter.code + '</span>' +
              '</div>' +
              '<div class="teacher-hero-sub">' +
                '<span>Faculty Head: <strong>' + activeCenter.teacher_name + '</strong></span> &bull; ' +
                '<span>Subjects: <strong>' + activeCenter.subjects.join(', ') + '</strong></span> &bull; ' +
                '<span>Fee: <strong>₹' + activeCenter.monthly_fee.toLocaleString() + '/mo</strong></span>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">' +
            (extraHtml || '') +
            '<button type="button" class="btn btn-secondary btn-sm" id="btnHeroViewAll">View All Centers</button>' +
          '</div>' +
        '</div>';

      var viewAllBtn = el.querySelector('#btnHeroViewAll');
      if (viewAllBtn) {
        viewAllBtn.onclick = function () {
          currentCenterId = 'all';
          renderCenterSelector();
          handleRouting();
        };
      }
    }
  }

  // ─── 10. ROUTER & ACTIVE LINK HIGHLIGHTS ──────────────────────────────────
  var validRoutes = [
    'home', 'attendance', 'fees', 'timetable', 'focus',
    'labs', 'videos', 'tests', 'points', 'marksheet', 'verify', 'settings'
  ];

  function handleRouting() {
    var hash = window.location.hash.replace(/^#\/?/, '').trim();
    var route = 'home';
    var param = '';

    if (hash.indexOf('verify/') === 0) {
      route = 'verify';
      param = hash.replace('verify/', '');
    } else if (hash) {
      route = hash.split('/')[0];
    }

    // Dismiss mobile drawer if open
    var appSidebar = document.getElementById('appSidebar');
    var sidebarBackdrop = document.getElementById('sidebarBackdrop');
    var hamburger = document.getElementById('hamburger');
    if (appSidebar) appSidebar.classList.remove('open');
    if (sidebarBackdrop) sidebarBackdrop.classList.remove('active');
    if (hamburger) hamburger.setAttribute('aria-expanded', 'false');

    // Hide all view panels
    var views = document.querySelectorAll('.view');
    views.forEach(function (v) {
      v.classList.remove('active');
    });

    var targetViewId = 'view-' + route;
    var targetView = document.getElementById(targetViewId);

    if (!targetView || validRoutes.indexOf(route) === -1) {
      var notFoundView = document.getElementById('view-404');
      if (notFoundView) notFoundView.classList.add('active');
      updateNavActiveState('404');
      return;
    }

    targetView.classList.add('active');
    updateNavActiveState(route);
    window.scrollTo(0, 0);

    // Call page-specific controller
    switch (route) {
      case 'home':
        renderHomeView();
        break;
      case 'attendance':
        renderAttendanceView();
        break;
      case 'fees':
        renderFeesView();
        break;
      case 'timetable':
        renderTimetableView();
        break;
      case 'focus':
        renderFocusView();
        break;
      case 'labs':
        renderLabsView();
        break;
      case 'videos':
        renderVideosView();
        break;
      case 'tests':
        renderTestsView();
        break;
      case 'points':
        renderPointsView();
        break;
      case 'marksheet':
        renderMarksheetView();
        break;
      case 'verify':
        renderVerifyView(param);
        break;
      case 'settings':
        renderSettingsView();
        break;
    }
  }

  function updateNavActiveState(route) {
    var links = document.querySelectorAll('.sidebar-nav-item, .nav-link, .nav-mobile-link');
    links.forEach(function (link) {
      var r = link.getAttribute('data-route');
      if (r === route) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  function updateSidebarProfile() {
    var student = getActiveStudent();
    var avatar = document.getElementById('sidebarAvatar');
    var name = document.getElementById('sidebarStudentName');
    var roll = document.getElementById('sidebarStudentRoll');
    var feeBadge = document.getElementById('sidebarFeeBadge');

    if (avatar) avatar.textContent = student.photo_initials || 'ST';
    if (name) name.textContent = student.name;
    if (roll) roll.textContent = 'Roll: ' + student.roll + ' • ' + (student.class || 'Class 10');

    if (feeBadge) {
      var studentFees = (STATE.fees || []).filter(function (f) {
        var matchStudent = f.student_id === currentStudentId;
        var matchCenter = currentCenterId === 'all'
          ? (student.enrolled_centers || []).indexOf(f.center_id) !== -1
          : f.center_id === currentCenterId;
        return matchStudent && matchCenter;
      });

      var hasPending = studentFees.some(function (f) { return f.status === 'pending'; });
      if (hasPending) {
        feeBadge.style.display = 'inline-block';
        feeBadge.className = 'badge badge-warning';
        feeBadge.textContent = 'Due';
      } else {
        feeBadge.style.display = 'inline-block';
        feeBadge.className = 'badge badge-success';
        feeBadge.textContent = 'Paid';
      }
    }
  }

  // ─── 11. PAGE: HOME / DASHBOARD ────────────────────────────────────────────
  function renderHomeView() {
    var student = getActiveStudent();
    updateSidebarProfile();
    renderStudentSelector();
    renderCenterSelector();
    renderTeacherHeroCard('homeTeacherHeroContainer');

    var parentBanner = document.getElementById('parentBanner');
    var studentHeader = document.getElementById('studentHeader');
    var homeStatsGrid = document.getElementById('homeStatsGrid');
    var homeDashboardGrid = document.getElementById('homeDashboardGrid');
    var homeParentChildrenView = document.getElementById('homeParentChildrenView');

    if (isParentMode) {
      if (parentBanner) parentBanner.style.display = 'flex';
      var parentBannerText = document.getElementById('parentBannerText');
      if (parentBannerText) {
        parentBannerText.textContent = 'Welcome, ' + student.parent_name + '. Monitoring household academic progress across multiple tuitions.';
      }
    } else {
      if (parentBanner) parentBanner.style.display = 'none';
    }

    // Dynamic greeting based on current hour
    var hour = new Date().getHours();
    var greetingWord = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    var greetingEl = document.getElementById('homeGreeting');
    if (greetingEl) {
      greetingEl.textContent = isParentMode ? 'Parent Overview: ' + student.name : greetingWord + ', ' + student.name.split(' ')[0] + '!';
    }

    var dateSubtitleEl = document.getElementById('homeDateSubtitle');
    if (dateSubtitleEl) {
      var dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
      var centerTitle = currentCenterId === 'all' ? 'Multi-Coaching Hub (' + (student.enrolled_centers || []).length + ' Joined Faculties)' : getActiveCenter().name;
      dateSubtitleEl.textContent = dateStr + ' • ' + (student.class || 'Class 10') + ' (' + (student.board || 'CBSE') + ') • ' + centerTitle;
    }

    // Calculate Attendance % this month (October 2025)
    var studentAtt = (STATE.attendance || []).filter(function (a) {
      var matchStudent = a.student_id === currentStudentId;
      var matchCenter = currentCenterId === 'all' ? (student.enrolled_centers || []).indexOf(a.center_id) !== -1 : a.center_id === currentCenterId;
      return matchStudent && matchCenter && a.date.indexOf('2025-10') === 0;
    });

    var presentCount = studentAtt.filter(function (a) { return a.status === 'present' || a.status === 'late'; }).length;
    var attPct = studentAtt.length > 0 ? Math.round((presentCount / studentAtt.length) * 100) : 89;

    var attPctEl = document.getElementById('homeAttPct');
    var attBarEl = document.getElementById('homeAttBar');
    if (attPctEl) attPctEl.textContent = attPct + '%';
    if (attBarEl) attBarEl.style.width = attPct + '%';

    // Pending Tuition Fees calculation
    var relevantFees = (STATE.fees || []).filter(function (f) {
      var matchStudent = f.student_id === currentStudentId;
      var matchCenter = currentCenterId === 'all' ? (student.enrolled_centers || []).indexOf(f.center_id) !== -1 : f.center_id === currentCenterId;
      return matchStudent && matchCenter && f.status === 'pending';
    });

    var totalPending = relevantFees.reduce(function (sum, item) { return sum + item.amount; }, 0);
    var homeFeeStatus = document.getElementById('homeFeeStatus');
    var homeFeeLabel = document.getElementById('homeFeeLabel');
    var homeFeeBadge = document.getElementById('homeFeeBadge');

    if (totalPending > 0) {
      if (homeFeeStatus) homeFeeStatus.textContent = '₹' + totalPending.toLocaleString();
      if (homeFeeLabel) homeFeeLabel.textContent = currentCenterId === 'all' ? 'Due Across ' + relevantFees.length + ' Centers' : relevantFees[0].month + ' Due';
      if (homeFeeBadge) {
        homeFeeBadge.className = 'badge badge-warning';
        homeFeeBadge.textContent = 'Due Nov 2025';
      }
    } else {
      if (homeFeeStatus) homeFeeStatus.textContent = '₹0';
      if (homeFeeLabel) homeFeeLabel.textContent = 'All Tuition Dues Cleared';
      if (homeFeeBadge) {
        homeFeeBadge.className = 'badge badge-success';
        homeFeeBadge.textContent = 'Fully Paid';
      }
    }

    // Streak & Points
    var streakEl = document.getElementById('homeStreak');
    if (streakEl) streakEl.textContent = (student.streak || STATE.streak) + ' Days';
    var pointsEl = document.getElementById('homePoints');
    if (pointsEl) pointsEl.textContent = (student.points || STATE.points).toLocaleString();

    // Today's classes from timetable
    var classesList = document.getElementById('homeClassesList');
    if (classesList) {
      var dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      var todayDay = dayNames[new Date().getDay()];
      if (todayDay === 'Sun') todayDay = 'Mon'; // Sunday fallback for rich demo schedule

      var todayBadge = document.getElementById('homeTodayDayBadge');
      if (todayBadge) todayBadge.textContent = todayDay + ' Schedule';

      var todaysSchedule = (DATA.timetable || []).filter(function (t) {
        var matchCenter = currentCenterId === 'all' ? (student.enrolled_centers || []).indexOf(t.center_id) !== -1 : t.center_id === currentCenterId;
        return t.day_of_week === todayDay && matchCenter;
      });

      if (todaysSchedule.length === 0) {
        classesList.innerHTML = '<div class="text-sm text-secondary p-12">No classes scheduled for today from enrolled faculties. Take time for independent revision!</div>';
      } else {
        classesList.innerHTML = todaysSchedule.map(function (c) {
          var centerObj = getCenterById(c.center_id);
          var subBadgeClass = getSubjectBadgeClass(c.subject);
          return (
            '<div class="class-item">' +
              '<div class="class-time">' +
                '<span class="class-time-start">' + c.start_time + '</span>' +
                '<span class="class-time-sep">to</span>' +
                '<span class="class-time-end">' + c.end_time + '</span>' +
              '</div>' +
              '<div class="class-details">' +
                '<div class="class-top-row">' +
                  '<span class="badge ' + subBadgeClass + '">' + c.subject + '</span>' +
                  '<span class="center-tag" style="border-color:' + centerObj.color + '; color:' + centerObj.color + ';">🏛️ ' + centerObj.name + '</span>' +
                '</div>' +
                '<div class="class-teacher">' + c.teacher + ' &bull; Room: ' + c.room + '</div>' +
              '</div>' +
            '</div>'
          );
        }).join('');
      }
    }

    // Next assessment
    var nextTestContainer = document.getElementById('homeNextTestContainer');
    if (nextTestContainer) {
      var upcomingTests = (STATE.tests || []).filter(function (t) {
        var matchStudent = t.student_id === currentStudentId;
        var matchCenter = currentCenterId === 'all' ? (student.enrolled_centers || []).indexOf(t.center_id) !== -1 : t.center_id === currentCenterId;
        return matchStudent && matchCenter;
      });

      var nextTest = upcomingTests[upcomingTests.length - 1];
      if (nextTest) {
        var tCenter = getCenterById(nextTest.center_id);
        var subBadge = getSubjectBadgeClass(nextTest.subject);
        nextTestContainer.innerHTML =
          '<div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">' +
            '<div>' +
              '<h3 class="text-base fw-700" style="color:var(--text-main);">' + nextTest.name + '</h3>' +
              '<div style="display:flex; align-items:center; gap:6px; margin-top:4px;">' +
                '<span class="badge ' + subBadge + '" style="font-size:10px;">' + nextTest.subject + '</span>' +
                '<span class="text-xs text-muted">&bull; ' + tCenter.name + '</span>' +
              '</div>' +
            '</div>' +
            '<span class="badge badge-accent">Recent: ' + nextTest.marks_obtained + '/' + nextTest.total_marks + ' pts</span>' +
          '</div>' +
          '<div class="text-xs text-secondary mb-12">Topics Evaluated: ' + nextTest.topics_tested.join(', ') + '</div>' +
          '<a href="#tests" class="btn btn-secondary btn-sm" style="width:100%;">Take New Practice Challenge</a>';
      } else {
        nextTestContainer.innerHTML = '<div class="text-sm text-secondary">No assessments recorded for this faculty yet.</div>';
      }
    }

    // Syllabus Completion Progress Rings
    var ringsContainer = document.getElementById('homeSubjectRings');
    if (ringsContainer) {
      var activeTopics = (STATE.syllabus || []).filter(function (s) {
        return currentCenterId === 'all' ? (student.enrolled_centers || []).indexOf(s.center_id) !== -1 : s.center_id === currentCenterId;
      });

      var subjectsList = [];
      activeTopics.forEach(function (s) {
        if (subjectsList.indexOf(s.subject) === -1) subjectsList.push(s.subject);
      });
      if (subjectsList.length === 0) subjectsList = ['Maths', 'Physics', 'Chemistry'];

      ringsContainer.innerHTML = subjectsList.map(function (sub) {
        var subTopics = activeTopics.filter(function (t) { return t.subject === sub; });
        var coveredCount = subTopics.filter(function (t) { return t.status === 'covered'; }).length;
        var pct = subTopics.length > 0 ? Math.round((coveredCount / subTopics.length) * 100) : 75;
        var subColor = getSubjectColor(sub);

        var radius = 28;
        var circum = 2 * Math.PI * radius;
        var offset = circum - (pct / 100) * circum;

        return (
          '<div class="progress-ring-card">' +
            '<div class="progress-ring-wrapper">' +
              '<svg class="progress-ring" width="70" height="70">' +
                '<circle class="progress-ring-circle-bg" stroke="var(--border)" stroke-width="6" fill="transparent" r="' + radius + '" cx="35" cy="35"/>' +
                '<circle class="progress-ring-circle" stroke="' + subColor + '" stroke-width="6" fill="transparent" r="' + radius + '" cx="35" cy="35" style="stroke-dasharray:' + circum + '; stroke-dashoffset:' + offset + '; stroke-linecap:round;"/>' +
              '</svg>' +
              '<span class="progress-ring-text">' + pct + '%</span>' +
            '</div>' +
            '<span class="progress-ring-label">' + sub + '</span>' +
          '</div>'
        );
      }).join('');
    }

    // Parent Mode: Multi-Child Household Overview
    if (homeParentChildrenView) {
      if (isParentMode) {
        homeParentChildrenView.classList.add('visible');
        var allStudents = STATE.students || DATA.students || [];

        var childCardsHtml = allStudents.map(function (child) {
          var isCurrent = child.id === currentStudentId;
          var childEnrolled = getStudentEnrolledCenters(child.id);

          var pendingChildFees = (STATE.fees || []).filter(function (f) {
            return f.student_id === child.id && f.status === 'pending';
          });
          var totalChildPending = pendingChildFees.reduce(function (acc, f) { return acc + f.amount; }, 0);

          var childAtt = (STATE.attendance || []).filter(function (a) {
            return a.student_id === child.id && a.date.indexOf('2025-10') === 0;
          });
          var pCount = childAtt.filter(function (a) { return a.status === 'present' || a.status === 'late'; }).length;
          var childAttPct = childAtt.length > 0 ? Math.round((pCount / childAtt.length) * 100) : 88;

          var facultyBadges = childEnrolled.map(function (c) {
            return '<span class="center-tag" style="border-color:' + c.color + '; color:' + c.color + '; font-size:10px;">🏛️ ' + c.name + '</span>';
          }).join(' ');

          return (
            '<div class="student-summary-card ' + (isCurrent ? 'active' : '') + '" data-child-id="' + child.id + '">' +
              '<div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">' +
                '<div style="display:flex; align-items:center; gap:12px;">' +
                  '<div class="sidebar-avatar" style="background:' + (child.avatar_bg || 'var(--primary)') + '; width:40px; height:40px; font-size:14px;">' + (child.photo_initials || 'ST') + '</div>' +
                  '<div>' +
                    '<h3 class="text-base fw-700">' + child.name + '</h3>' +
                    '<span class="text-xs text-muted">Roll: ' + child.roll + ' &bull; ' + child.class + ' (' + (child.board || 'CBSE') + ')</span>' +
                  '</div>' +
                '</div>' +
                (isCurrent ? '<span class="badge badge-primary">Active Profile</span>' : '<button type="button" class="btn btn-secondary btn-xs btn-switch-child" data-child-id="' + child.id + '">Select</button>') +
              '</div>' +
              '<div style="margin-bottom:12px;">' +
                '<div class="text-xs text-muted fw-700 uppercase mb-4">Enrolled Faculties &amp; Tuitions:</div>' +
                '<div style="display:flex; flex-wrap:wrap; gap:5px;">' + facultyBadges + '</div>' +
              '</div>' +
              '<div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; padding:10px; background:var(--surface-muted); border-radius:var(--radius-sm);">' +
                '<div>' +
                  '<div class="text-xs text-muted uppercase">Attendance</div>' +
                  '<div class="text-base fw-800" style="color:var(--accent);">' + childAttPct + '%</div>' +
                '</div>' +
                '<div>' +
                  '<div class="text-xs text-muted uppercase">Pending Fees</div>' +
                  '<div class="text-base fw-800" style="color:' + (totalChildPending > 0 ? 'var(--error)' : 'var(--accent)') + ';">' + (totalChildPending > 0 ? '₹' + totalChildPending.toLocaleString() : '₹0 (Paid)') + '</div>' +
                '</div>' +
              '</div>' +
            '</div>'
          );
        }).join('');

        // If fewer than 5 students, add a card to add another student profile
        var addStudentCard = '';
        if (allStudents.length < 5) {
          addStudentCard =
            '<div class="student-summary-card" style="border-style:dashed; display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:160px; text-align:center;" id="btnParentAddStudent">' +
              '<div style="font-size:32px; margin-bottom:8px;">➕</div>' +
              '<h3 class="text-sm fw-700">Add Another Student Profile</h3>' +
              '<p class="text-xs text-muted mb-12">Household account supports up to 5 children profiles.</p>' +
              '<button type="button" class="btn btn-primary btn-sm">+ Create Student Profile (' + (allStudents.length + 1) + '/5)</button>' +
            '</div>';
        }

        homeParentChildrenView.innerHTML =
          '<div style="grid-column: 1 / -1; margin-bottom: 8px;">' +
            '<h2 class="text-base fw-800" style="color:var(--text-main);">Household Children Academics &amp; Coaching Overview</h2>' +
            '<p class="text-xs text-muted">Manage progress across all children and their joined tuition centers from one family account.</p>' +
          '</div>' +
          childCardsHtml + addStudentCard;

        var childSelectBtns = homeParentChildrenView.querySelectorAll('.btn-switch-child, .student-summary-card[data-child-id]');
        childSelectBtns.forEach(function (btn) {
          btn.addEventListener('click', function (e) {
            var cid = this.getAttribute('data-child-id');
            if (cid && cid !== currentStudentId) {
              setStudent(cid);
            }
          });
        });

        var parentAddBtn = document.getElementById('btnParentAddStudent');
        if (parentAddBtn) {
          parentAddBtn.onclick = openAddStudentModal;
        }

      } else {
        homeParentChildrenView.classList.remove('visible');
      }
    }
  }

  // ─── 12. PAGE: ATTENDANCE ──────────────────────────────────────────────────
  function renderAttendanceView() {
    var student = getActiveStudent();
    renderTeacherHeroCard('attTeacherHeroContainer');

    var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var monthLabel = document.getElementById('calMonthLabel');
    if (monthLabel) {
      monthLabel.textContent = monthNames[currentMonthIndex] + ' ' + currentYear;
    }

    var grid = document.getElementById('attendanceCalendarGrid');
    if (!grid) return;

    var daysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();
    var firstDayOfWeek = new Date(currentYear, currentMonthIndex, 1).getDay();

    var html = '';
    var dHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dHeaders.forEach(function (d) {
      html += '<div class="cal-day-header">' + d + '</div>';
    });

    for (var i = 0; i < firstDayOfWeek; i++) {
      html += '<div class="cal-day cal-day-empty"></div>';
    }

    var monthStr = String(currentMonthIndex + 1).padStart(2, '0');
    var presentCount = 0;
    var lateCount = 0;
    var absentCount = 0;
    var totalDays = 0;

    for (var d = 1; d <= daysInMonth; d++) {
      var dateKey = currentYear + '-' + monthStr + '-' + String(d).padStart(2, '0');
      var checkDate = new Date(currentYear, currentMonthIndex, d);
      var isSunday = checkDate.getDay() === 0;

      var dayRecords = (STATE.attendance || []).filter(function (a) {
        var matchStudent = a.student_id === currentStudentId;
        var matchCenter = currentCenterId === 'all'
          ? (student.enrolled_centers || []).indexOf(a.center_id) !== -1
          : a.center_id === currentCenterId;
        return matchStudent && matchCenter && a.date === dateKey;
      });

      var dayClass = 'cal-day';

      if (isSunday) {
        dayClass += ' cal-day-noclass';
      } else if (dayRecords.length > 0) {
        totalDays++;
        var status = dayRecords[0].status;
        if (status === 'present') {
          dayClass += ' cal-day-present';
          presentCount++;
        } else if (status === 'late') {
          dayClass += ' cal-day-late';
          lateCount++;
        } else if (status === 'absent') {
          dayClass += ' cal-day-absent';
          absentCount++;
        }
      } else {
        dayClass += ' cal-day-future';
      }

      var now = new Date();
      if (now.getDate() === d && now.getMonth() === currentMonthIndex && now.getFullYear() === currentYear) {
        dayClass += ' cal-day-today';
      }

      html += '<div class="' + dayClass + '" title="' + dateKey + (dayRecords[0] ? ' - ' + dayRecords[0].status : '') + '">' + d + '</div>';
    }

    grid.innerHTML = html;

    var summaryBadge = document.getElementById('calSummaryBadge');
    var rate = totalDays > 0 ? Math.round(((presentCount + lateCount) / totalDays) * 100) : 90;
    if (summaryBadge) summaryBadge.textContent = rate + '% Attendance';

    // Subject breakdown
    var subjectListContainer = document.getElementById('subjectAttList');
    if (subjectListContainer) {
      var filteredAtt = (STATE.attendance || []).filter(function (a) {
        var matchStudent = a.student_id === currentStudentId;
        var matchCenter = currentCenterId === 'all'
          ? (student.enrolled_centers || []).indexOf(a.center_id) !== -1
          : a.center_id === currentCenterId;
        return matchStudent && matchCenter && a.date.indexOf(currentYear + '-' + monthStr) === 0;
      });

      var subCounts = {};
      filteredAtt.forEach(function (a) {
        if (!subCounts[a.subject]) subCounts[a.subject] = { total: 0, attended: 0, center_id: a.center_id };
        subCounts[a.subject].total++;
        if (a.status === 'present' || a.status === 'late') subCounts[a.subject].attended++;
      });

      var subKeys = Object.keys(subCounts);
      if (subKeys.length === 0) {
        subjectListContainer.innerHTML = '<div class="text-sm text-secondary">No subject attendance recorded for this month.</div>';
      } else {
        subjectListContainer.innerHTML = subKeys.map(function (sub) {
          var item = subCounts[sub];
          var pct = Math.round((item.attended / item.total) * 100);
          var centerObj = getCenterById(item.center_id);
          return (
            '<div class="subject-att-item">' +
              '<div class="subject-att-header">' +
                '<span class="subject-att-name">' + sub + ' <small class="text-muted">(' + centerObj.name + ')</small></span>' +
                '<span class="subject-att-pct">' + pct + '% (' + item.attended + '/' + item.total + ')</span>' +
              '</div>' +
              '<div class="progress-bar-track">' +
                '<div class="progress-bar-fill ' + (pct >= 85 ? 'accent' : 'warning') + '" style="width:' + pct + '%;"></div>' +
              '</div>' +
            '</div>'
          );
        }).join('');
      }
    }

    // Attendance summary metrics
    var metricsEl = document.getElementById('attendanceSummaryMetrics');
    if (metricsEl) {
      metricsEl.innerHTML =
        '<h3 class="text-sm fw-700 uppercase text-muted mb-12">Monthly Attendance Summary</h3>' +
        '<div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:10px; text-align:center;">' +
          '<div style="background:var(--surface-muted); padding:10px; border-radius:var(--radius-sm);">' +
            '<div class="text-2xl fw-800" style="color:var(--accent);">' + presentCount + '</div>' +
            '<div class="text-xs text-muted">Present</div>' +
          '</div>' +
          '<div style="background:var(--surface-muted); padding:10px; border-radius:var(--radius-sm);">' +
            '<div class="text-2xl fw-800" style="color:var(--warning);">' + lateCount + '</div>' +
            '<div class="text-xs text-muted">Late</div>' +
          '</div>' +
          '<div style="background:var(--surface-muted); padding:10px; border-radius:var(--radius-sm);">' +
            '<div class="text-2xl fw-800" style="color:var(--error);">' + absentCount + '</div>' +
            '<div class="text-xs text-muted">Absent</div>' +
          '</div>' +
        '</div>';
    }

    // Month navigation
    var prevBtn = document.getElementById('calPrevMonth');
    var nextBtn = document.getElementById('calNextMonth');
    if (prevBtn) {
      prevBtn.onclick = function () {
        currentMonthIndex = (currentMonthIndex - 1 + 12) % 12;
        renderAttendanceView();
      };
    }
    if (nextBtn) {
      nextBtn.onclick = function () {
        currentMonthIndex = (currentMonthIndex + 1) % 12;
        renderAttendanceView();
      };
    }

    // Simulate QR Check-In
    var qrBtn = document.getElementById('btnQrScan');
    if (qrBtn) {
      qrBtn.onclick = function () {
        var todayStr = currentYear + '-10-18';
        var targetCenterId = currentCenterId !== 'all' ? currentCenterId : ((student.enrolled_centers && student.enrolled_centers[0]) ? student.enrolled_centers[0] : 'center-1');
        var centerObj = getCenterById(targetCenterId);

        STATE.attendance.push({
          id: 'att-qr-' + Date.now(),
          student_id: currentStudentId,
          center_id: targetCenterId,
          date: todayStr,
          status: 'present',
          subject: (centerObj.subjects && centerObj.subjects[0]) ? centerObj.subjects[0] : 'General'
        });

        STATE.points += 10;
        STATE.points_history.unshift({
          id: 'ph-qr-' + Date.now(),
          student_id: currentStudentId,
          date: todayStr,
          action: 'attendance_qr',
          points: 10,
          description: 'QR attendance checked in at ' + centerObj.name
        });

        Store.set('vs_attendance', STATE.attendance);
        Store.set('vs_points', STATE.points);
        Store.set('vs_points_history', STATE.points_history);

        showToast('✅ QR Attendance Confirmed at ' + centerObj.name + '! (+10 pts)', 'success', 3500);
        renderAttendanceView();
      };
    }
  }

  // ─── 13. PAGE: FEES & PAYMENTS ─────────────────────────────────────────────
  function renderFeesView() {
    var student = getActiveStudent();
    renderTeacherHeroCard('feesTeacherHeroContainer');

    var tbody = document.getElementById('feesTableBody');
    var pendingDisplay = document.getElementById('feesPendingAmount');
    var pendingNotice = document.getElementById('feesPendingNotice');
    var btnPayPending = document.getElementById('btnPayPending');

    var studentFees = (STATE.fees || []).filter(function (f) {
      var matchStudent = f.student_id === currentStudentId;
      var matchCenter = currentCenterId === 'all'
        ? (student.enrolled_centers || []).indexOf(f.center_id) !== -1
        : f.center_id === currentCenterId;
      return matchStudent && matchCenter;
    });

    var pendingFees = studentFees.filter(function (f) { return f.status === 'pending'; });
    var totalPending = pendingFees.reduce(function (acc, f) { return acc + f.amount; }, 0);

    if (pendingDisplay) {
      pendingDisplay.textContent = totalPending > 0 ? '₹' + totalPending.toLocaleString() : '₹0';
      pendingDisplay.style.color = totalPending > 0 ? 'var(--error)' : 'var(--accent)';
    }

    if (pendingNotice) {
      if (totalPending > 0) {
        pendingNotice.textContent = currentCenterId === 'all'
          ? 'Outstanding balance across ' + pendingFees.length + ' coaching faculties due Nov 2025'
          : 'Pending installment for ' + pendingFees[0].month + ' due by ' + pendingFees[0].due_date;
      } else {
        pendingNotice.textContent = 'All tuition fees are fully settled. No outstanding dues!';
      }
    }

    if (btnPayPending) {
      if (totalPending > 0) {
        btnPayPending.disabled = false;
        btnPayPending.textContent = currentCenterId === 'all' ? 'Pay Next Due (₹' + pendingFees[0].amount.toLocaleString() + ')' : 'Pay Outstanding Fees';
        btnPayPending.onclick = function () {
          openPaymentModal(pendingFees[0]);
        };
      } else {
        btnPayPending.disabled = true;
        btnPayPending.textContent = 'All Fees Settled';
      }
    }

    if (!tbody) return;

    if (studentFees.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted p-24">No fee records found for this coaching selection.</td></tr>';
      return;
    }

    tbody.innerHTML = studentFees.map(function (fee) {
      var isPending = fee.status === 'pending';
      var centerObj = getCenterById(fee.center_id);
      var statusBadge = isPending
        ? '<span class="badge badge-error">Pending</span>'
        : '<span class="badge badge-success">Settled</span>';

      return (
        '<tr class="' + (isPending ? 'table-row-highlight' : '') + '">' +
          '<td><span class="center-tag" style="border-color:' + centerObj.color + '; color:' + centerObj.color + ';">🏛️ ' + centerObj.name + '</span></td>' +
          '<td class="fw-700">' + fee.month + '</td>' +
          '<td>' + fee.due_date + '</td>' +
          '<td class="fw-800">₹' + fee.amount.toLocaleString() + '</td>' +
          '<td>' + statusBadge + '</td>' +
          '<td>' + (fee.mode || '<span class="text-muted">—</span>') + '</td>' +
          '<td>' + (fee.receipt_no ? '<code>' + fee.receipt_no + '</code>' : '<span class="text-muted">—</span>') + '</td>' +
          '<td style="text-align:right;">' +
            (isPending
              ? '<button type="button" class="btn btn-sm btn-primary btn-pay-row" data-fee-id="' + fee.id + '">Pay Now</button>'
              : '<button type="button" class="btn btn-sm btn-secondary btn-view-receipt" data-fee-id="' + fee.id + '">Voucher</button>'
            ) +
          '</td>' +
        '</tr>'
      );
    }).join('');

    var payBtns = tbody.querySelectorAll('.btn-pay-row');
    payBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var fid = this.getAttribute('data-fee-id');
        var fee = studentFees.find(function (f) { return f.id === fid; });
        if (fee) openPaymentModal(fee);
      });
    });

    var receiptBtns = tbody.querySelectorAll('.btn-view-receipt');
    receiptBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var fid = this.getAttribute('data-fee-id');
        var fee = studentFees.find(function (f) { return f.id === fid; });
        if (fee) showReceiptModal(fee);
      });
    });
  }

  function openPaymentModal(feeItem) {
    var student = getActiveStudent();
    var centerObj = getCenterById(feeItem.center_id);

    var bodyHtml =
      '<div style="display:flex; flex-direction:column; gap:16px;">' +
        '<div style="background:var(--surface-muted); padding:14px; border-radius:var(--radius-sm); border:1px solid var(--border);">' +
          '<div style="display:flex; justify-content:space-between; margin-bottom:6px;">' +
            '<span class="text-xs text-muted uppercase">Coaching / Faculty:</span>' +
            '<span class="fw-700 text-sm" style="color:' + centerObj.color + ';">' + centerObj.name + '</span>' +
          '</div>' +
          '<div style="display:flex; justify-content:space-between; margin-bottom:6px;">' +
            '<span class="text-xs text-muted uppercase">Student:</span>' +
            '<span class="fw-700 text-sm">' + student.name + ' (' + student.roll + ')</span>' +
          '</div>' +
          '<div style="display:flex; justify-content:space-between; margin-bottom:6px;">' +
            '<span class="text-xs text-muted uppercase">Tuition Period:</span>' +
            '<span class="fw-700 text-sm">' + feeItem.month + '</span>' +
          '</div>' +
          '<div style="display:flex; justify-content:space-between; border-top:1px dashed var(--border); padding-top:8px;">' +
            '<span class="fw-700">Total Payable:</span>' +
            '<span class="text-xl fw-800" style="color:var(--primary);">₹' + feeItem.amount.toLocaleString() + '</span>' +
          '</div>' +
        '</div>' +
        '<div>' +
          '<label class="form-label">Select Simulated Payment Method:</label>' +
          '<div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:8px;">' +
            '<button type="button" class="btn btn-secondary pay-mode-choice selected" data-mode="UPI AutoPay">UPI / QR</button>' +
            '<button type="button" class="btn btn-secondary pay-mode-choice" data-mode="Net Banking">Net Banking</button>' +
            '<button type="button" class="btn btn-secondary pay-mode-choice" data-mode="Debit Card">Card</button>' +
          '</div>' +
        '</div>' +
        '<div class="text-xs text-muted text-center">' +
          'Note: This is a safe frontend prototype simulation. No real money is transferred.' +
        '</div>' +
      '</div>';

    openModal({
      title: 'Pay Tuition Fees — ' + centerObj.name,
      body: bodyHtml,
      footer:
        '<button type="button" class="btn btn-secondary" id="btnCancelPay">Cancel</button>' +
        '<button type="button" class="btn btn-primary" id="btnConfirmPay">Simulate Payment (₹' + feeItem.amount + ')</button>',
      onReady: function (overlay, closeModal) {
        var selectedMode = 'UPI AutoPay';
        var modeChoices = overlay.querySelectorAll('.pay-mode-choice');
        modeChoices.forEach(function (choice) {
          choice.addEventListener('click', function () {
            modeChoices.forEach(function (c) { c.classList.remove('selected'); });
            this.classList.add('selected');
            selectedMode = this.getAttribute('data-mode');
          });
        });

        var cancelBtn = overlay.querySelector('#btnCancelPay');
        if (cancelBtn) cancelBtn.onclick = closeModal;

        var confirmBtn = overlay.querySelector('#btnConfirmPay');
        if (confirmBtn) {
          confirmBtn.onclick = function () {
            confirmBtn.disabled = true;
            confirmBtn.textContent = 'Authorizing...';

            var nowStr = new Date().toISOString().split('T')[0];
            var receiptNo = (centerObj.code || 'RCP') + '-2025-' + Math.floor(100 + Math.random() * 900);

            feeItem.status = 'paid';
            feeItem.mode = selectedMode;
            feeItem.paid_date = nowStr;
            feeItem.receipt_no = receiptNo;

            STATE.points += 40;
            STATE.points_history.unshift({
              id: 'ph-fee-' + Date.now(),
              student_id: currentStudentId,
              date: nowStr,
              action: 'fee_payment',
              points: 40,
              description: 'Tuition fee cleared for ' + centerObj.name + ' (' + feeItem.month + ')'
            });

            Store.set('vs_fees', STATE.fees);
            Store.set('vs_points', STATE.points);
            Store.set('vs_points_history', STATE.points_history);

            closeModal();
            showToast('🎉 Fee payment of ₹' + feeItem.amount + ' cleared for ' + centerObj.name + '! (+40 pts)', 'success', 4000);
            renderFeesView();

            setTimeout(function () {
              showReceiptModal(feeItem);
            }, 300);
          };
        }
      }
    });
  }

  function showReceiptModal(feeItem) {
    var student = getActiveStudent();
    var centerObj = getCenterById(feeItem.center_id);

    var receiptBodyHtml =
      '<div style="background:#FFFFFF; color:#1F0D12; padding:22px; border-radius:var(--radius-md); border:1px solid #E8DDDD; font-family:var(--font-sans);">' +
        '<div style="text-align:center; border-bottom:1.5px dashed #C28828; padding-bottom:14px; margin-bottom:14px;">' +
          '<div style="font-weight:800; font-size:1.25rem; color:' + centerObj.color + ';">' + centerObj.name + '</div>' +
          '<div style="font-size:0.8rem; color:#7E636B;">Official Tuition Fee Receipt Voucher &bull; ' + centerObj.type + '</div>' +
          '<div style="font-size:0.75rem; color:#8E777D;">' + (centerObj.address || '') + '</div>' +
        '</div>' +
        '<table style="width:100%; font-size:0.85rem; margin-bottom:14px;">' +
          '<tr><td style="color:#7E636B; width:130px;">Receipt Voucher:</td><td class="fw-700"><code>' + feeItem.receipt_no + '</code></td></tr>' +
          '<tr><td style="color:#7E636B;">Payment Date:</td><td>' + (feeItem.paid_date || feeItem.due_date) + '</td></tr>' +
          '<tr><td style="color:#7E636B;">Candidate:</td><td class="fw-700">' + student.name + ' (' + student.roll + ')</td></tr>' +
          '<tr><td style="color:#7E636B;">Course / Batch:</td><td>' + (centerObj.active_batch || student.class) + '</td></tr>' +
          '<tr><td style="color:#7E636B;">Faculty Head:</td><td>' + centerObj.teacher_name + '</td></tr>' +
          '<tr><td style="color:#7E636B;">Tuition Month:</td><td>' + feeItem.month + '</td></tr>' +
          '<tr><td style="color:#7E636B;">Authorized Mode:</td><td>' + (feeItem.mode || 'Instant UPI') + '</td></tr>' +
          '<tr><td style="color:#7E636B; font-weight:700; border-top:1px solid #E8DDDD; padding-top:8px;">Amount Received:</td><td style="font-weight:800; color:var(--primary); font-size:1.15rem; border-top:1px solid #E8DDDD; padding-top:8px;">₹' + feeItem.amount.toLocaleString() + '</td></tr>' +
        '</table>' +
        '<div style="text-align:center; padding:8px; background:#ECFDF5; border-radius:4px; color:#065F46; font-size:0.75rem; font-weight:700;">' +
          'STATUS: PAYMENT VERIFIED &bull; OFFICIAL LEDGER STORED' +
        '</div>' +
        '<div style="text-align:center; font-size:0.65rem; color:#8E777D; margin-top:12px;">' +
          'Simulated digital fee voucher generated by Vilarci Study platform.' +
        '</div>' +
      '</div>';

    openModal({
      title: 'Fee Receipt Voucher — ' + centerObj.name,
      body: receiptBodyHtml,
      footer: '<button type="button" class="btn btn-secondary" onclick="window.print()">Print Voucher</button>'
    });
  }

  // ─── 14. PAGE: TIMETABLE & SYLLABUS TRACKER ────────────────────────────────
  function renderTimetableView() {
    var student = getActiveStudent();
    renderTeacherHeroCard('timetableTeacherHeroContainer');

    var tabBtnTT = document.getElementById('tabBtnTimetable');
    var tabBtnSyl = document.getElementById('tabBtnSyllabus');
    var panelTT = document.getElementById('panelTimetable');
    var panelSyl = document.getElementById('panelSyllabus');

    if (tabBtnTT && tabBtnSyl && panelTT && panelSyl) {
      tabBtnTT.onclick = function () {
        tabBtnTT.classList.add('active');
        tabBtnSyl.classList.remove('active');
        panelTT.classList.add('active');
        panelSyl.classList.remove('active');
      };
      tabBtnSyl.onclick = function () {
        tabBtnSyl.classList.add('active');
        tabBtnTT.classList.remove('active');
        panelSyl.classList.add('active');
        panelTT.classList.remove('active');
      };
    }

    // Weekly Timetable Grid
    var ttGrid = document.getElementById('timetableGrid');
    if (ttGrid) {
      var days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      ttGrid.innerHTML = days.map(function (day) {
        var slots = (DATA.timetable || []).filter(function (t) {
          var matchCenter = currentCenterId === 'all'
            ? (student.enrolled_centers || []).indexOf(t.center_id) !== -1
            : t.center_id === currentCenterId;
          return t.day_of_week === day && matchCenter;
        });

        var slotsHtml = slots.length === 0
          ? '<div class="text-xs text-muted" style="padding:10px;">Self-Study / Revision</div>'
          : slots.map(function (s) {
              var centerObj = getCenterById(s.center_id);
              return (
                '<div class="tt-slot">' +
                  '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2px;">' +
                    '<span class="tt-slot-time">' + s.start_time + '–' + s.end_time + '</span>' +
                    '<span class="center-tag" style="border-color:' + centerObj.color + '; color:' + centerObj.color + '; font-size:9px;">' + centerObj.logo_text + '</span>' +
                  '</div>' +
                  '<div class="tt-slot-subject">' + s.subject + '</div>' +
                  '<div class="tt-slot-teacher">' + s.teacher + '</div>' +
                  '<div class="tt-slot-room">' + s.room + '</div>' +
                '</div>'
              );
            }).join('');

        return (
          '<div class="tt-day-col">' +
            '<div class="tt-day-header">' + day + '</div>' +
            '<div class="tt-slots-list">' + slotsHtml + '</div>' +
          '</div>'
        );
      }).join('');
    }

    // Syllabus Tracker
    var sylContainer = document.getElementById('syllabusContainer');
    if (sylContainer) {
      var activeSyllabus = (STATE.syllabus || []).filter(function (s) {
        return currentCenterId === 'all'
          ? (student.enrolled_centers || []).indexOf(s.center_id) !== -1
          : s.center_id === currentCenterId;
      });

      var activeSubject = 'all';
      var chips = document.querySelectorAll('#syllabusSubjectFilter .chip');

      var renderSyllabusTopics = function (filterSubject) {
        var topics = activeSyllabus.filter(function (t) {
          return filterSubject === 'all' ? true : t.subject === filterSubject;
        });

        if (topics.length === 0) {
          sylContainer.innerHTML = '<div class="card text-center p-24 text-muted">No syllabus topics found for this subject and faculty selection.</div>';
          return;
        }

        sylContainer.innerHTML = topics.map(function (item) {
          var centerObj = getCenterById(item.center_id);
          var statusBadge = '';
          var statusClass = 'status-' + (item.status || 'upcoming');

          if (item.status === 'covered') {
            statusBadge = '<span class="badge badge-success text-xs">✓ Covered</span>';
          } else if (item.status === 'partial') {
            statusBadge = '<span class="badge badge-warning text-xs">⏳ In Progress</span>';
          } else if (item.status === 'skipped') {
            statusBadge = '<span class="badge badge-neutral text-xs">⏭️ Skipped</span>';
          } else {
            statusBadge = '<span class="badge badge-neutral text-xs">Upcoming</span>';
          }

          var subColor = getSubjectColor(item.subject);

          return (
            '<div class="syllabus-topic-card ' + statusClass + '">' +
              '<div style="flex:1; overflow:hidden;">' +
                '<div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:8px;">' +
                  '<span class="badge badge-neutral" style="font-size:11px; font-weight:700; color:' + subColor + '; background:var(--surface-muted); border:1px solid var(--border);">' + item.subject + '</span>' +
                  '<span class="center-tag" style="border-color:' + centerObj.color + '; color:' + centerObj.color + '; font-size:11px;">🏛️ ' + centerObj.name + '</span>' +
                  '<span class="text-xs text-muted" style="font-weight:500;">Chapter: <strong>' + item.chapter + '</strong></span>' +
                  statusBadge +
                '</div>' +
                '<h4 style="font-family:var(--font-sans); font-size:16px; font-weight:800; color:var(--text-main); margin-bottom:6px; letter-spacing:-0.2px;">' + item.topic + '</h4>' +
                '<div class="text-xs text-secondary" style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">' +
                  '<span>📅 Planned: <strong>' + item.planned_date + '</strong></span>' +
                  (item.covered_date ? '<span>&bull; 🎓 Taught: <strong style="color:var(--success);">' + item.covered_date + '</strong></span>' : '') +
                '</div>' +
              '</div>' +
              '<label class="syllabus-check-label' + (item.revised_by_student ? ' revised' : '') + '" title="Click to record revision and earn 15 points">' +
                '<input type="checkbox" class="syl-checkbox" data-syl-id="' + item.id + '" ' + (item.revised_by_student ? 'checked' : '') + '>' +
                '<span>' + (item.revised_by_student ? '✓ Revised (+15 pts)' : 'I revised this topic') + '</span>' +
              '</label>' +
            '</div>'
          );
        }).join('');

        var checkBoxes = sylContainer.querySelectorAll('.syl-checkbox');
        checkBoxes.forEach(function (cb) {
          cb.addEventListener('change', function () {
            var sid = this.getAttribute('data-syl-id');
            var rec = (STATE.syllabus || []).find(function (s) { return s.id === sid; });
            if (rec) {
              rec.revised_by_student = this.checked;
              if (this.checked) {
                STATE.points += 15;
                STATE.points_history.unshift({
                  id: 'ph-syl-' + Date.now(),
                  student_id: currentStudentId,
                  date: new Date().toISOString().split('T')[0],
                  action: 'topic_revised',
                  points: 15,
                  description: 'Self-revision confirmed: ' + rec.topic
                });
                Store.set('vs_points', STATE.points);
                Store.set('vs_points_history', STATE.points_history);
                showToast('Topic marked as revised! (+15 pts)', 'success', 2500);
              }
              Store.set('vs_syllabus', STATE.syllabus);
            }
          });
        });
      };

      chips.forEach(function (chip) {
        chip.onclick = function () {
          chips.forEach(function (c) { c.classList.remove('active'); });
          this.classList.add('active');
          activeSubject = this.getAttribute('data-subject');
          renderSyllabusTopics(activeSubject);
        };
      });

      renderSyllabusTopics(activeSubject);
    }
  }

  // ─── 15. PAGE: FOCUS STUDY ROOM ────────────────────────────────────────────
  function extractYouTubeId(url) {
    if (!url) return null;
    url = url.trim();
    var match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
    return match ? match[1] : null;
  }

  function renderFocusView() {
    var iframe = document.getElementById('focusVideoIframe');
    var form = document.getElementById('focusUrlForm');
    var input = document.getElementById('focusUrlInput');
    var errorEl = document.getElementById('focusUrlError');
    var sampleBtn = document.getElementById('btnFocusSampleVideo');
    var markDoneBtn = document.getElementById('btnFocusMarkTopicDone');
    var notesArea = document.getElementById('focusNotesArea');
    var notesStatus = document.getElementById('notesSaveStatus');

    var loadVideo = function (videoId) {
      currentFocusVideoId = videoId;
      if (iframe) {
        iframe.src = 'https://www.youtube-nocookie.com/embed/' + videoId + '?rel=0&modestbranding=1';
      }
      if (notesArea) {
        var allNotes = STATE.video_notes || {};
        notesArea.value = allNotes[videoId] || '';
      }
    };

    if (iframe && !iframe.src) {
      loadVideo(currentFocusVideoId);
    }

    if (form && input) {
      form.onsubmit = function (e) {
        e.preventDefault();
        var val = input.value.trim();
        var vid = extractYouTubeId(val);
        if (vid) {
          if (errorEl) errorEl.style.display = 'none';
          loadVideo(vid);
          showToast('Loaded YouTube lecture in distraction-free player!', 'success', 2500);
        } else {
          if (errorEl) errorEl.style.display = 'block';
          showToast('Invalid YouTube URL. Please check link format.', 'error', 3000);
        }
      };
    }

    if (sampleBtn) {
      sampleBtn.onclick = function () {
        if (input) input.value = 'https://www.youtube.com/watch?v=IWigcMGGMIs';
        if (errorEl) errorEl.style.display = 'none';
        loadVideo('IWigcMGGMIs');
        showToast('Sample Mathematics Masterclass loaded', 'info', 2000);
      };
    }

    if (notesArea) {
      var debounceTimer;
      notesArea.oninput = function () {
        if (notesStatus) notesStatus.textContent = 'Saving...';
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(function () {
          if (!STATE.video_notes) STATE.video_notes = {};
          STATE.video_notes[currentFocusVideoId] = notesArea.value;
          Store.set('vs_video_notes', STATE.video_notes);
          if (notesStatus) notesStatus.textContent = 'Autosaved';
        }, 500);
      };
    }

    if (markDoneBtn) {
      markDoneBtn.onclick = function () {
        STATE.points += 20;
        STATE.points_history.unshift({
          id: 'ph-vid-' + Date.now(),
          student_id: currentStudentId,
          date: new Date().toISOString().split('T')[0],
          action: 'video_mastery',
          points: 20,
          description: 'Lecture video completed & topic mastered'
        });
        Store.set('vs_points', STATE.points);
        Store.set('vs_points_history', STATE.points_history);
        showToast('Topic marked as mastered! (+20 pts awarded)', 'success', 3000);
      };
    }

    // Pomodoro Timer Controls
    var timerDisplay = document.getElementById('focusTimerDisplay');
    var btnStartPause = document.getElementById('btnStartPauseTimer');
    var btnReset = document.getElementById('btnResetTimer');
    var presetBtns = document.querySelectorAll('.timer-preset-btn');
    var customInput = document.getElementById('customTimerMin');
    var btnApplyCustom = document.getElementById('btnApplyCustomTimer');
    var completeMsg = document.getElementById('timerCompleteMsg');

    function updateTimerDisplay() {
      var mins = Math.floor(timerRemainingSeconds / 60);
      var secs = timerRemainingSeconds % 60;
      if (timerDisplay) {
        timerDisplay.textContent = String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
      }
    }

    presetBtns.forEach(function (btn) {
      btn.onclick = function () {
        presetBtns.forEach(function (b) { b.classList.remove('selected'); });
        this.classList.add('selected');
        var m = parseInt(this.getAttribute('data-mins'), 10);
        timerRemainingSeconds = m * 60;
        clearInterval(timerInterval);
        timerIsRunning = false;
        if (btnStartPause) btnStartPause.textContent = 'Start Timer';
        if (completeMsg) completeMsg.style.display = 'none';
        updateTimerDisplay();
      };
    });

    if (btnApplyCustom && customInput) {
      btnApplyCustom.onclick = function () {
        var m = parseInt(customInput.value, 10);
        if (m && m > 0 && m <= 180) {
          presetBtns.forEach(function (b) { b.classList.remove('selected'); });
          timerRemainingSeconds = m * 60;
          clearInterval(timerInterval);
          timerIsRunning = false;
          if (btnStartPause) btnStartPause.textContent = 'Start Timer';
          if (completeMsg) completeMsg.style.display = 'none';
          updateTimerDisplay();
          showToast('Focus countdown configured for ' + m + ' minutes', 'info', 2000);
        } else {
          showToast('Please enter minutes between 1 and 180', 'warning', 2500);
        }
      };
    }

    if (btnStartPause) {
      btnStartPause.onclick = function () {
        if (timerIsRunning) {
          clearInterval(timerInterval);
          timerIsRunning = false;
          btnStartPause.textContent = 'Resume Timer';
        } else {
          timerIsRunning = true;
          btnStartPause.textContent = 'Pause Timer';
          if (completeMsg) completeMsg.style.display = 'none';

          timerInterval = setInterval(function () {
            if (timerRemainingSeconds > 0) {
              timerRemainingSeconds--;
              updateTimerDisplay();
            } else {
              clearInterval(timerInterval);
              timerIsRunning = false;
              btnStartPause.textContent = 'Start Timer';
              if (completeMsg) completeMsg.style.display = 'block';

              STATE.points += 50;
              STATE.streak = (STATE.streak || 14) + 1;
              STATE.points_history.unshift({
                id: 'ph-pomodoro-' + Date.now(),
                student_id: currentStudentId,
                date: new Date().toISOString().split('T')[0],
                action: 'focus_session',
                points: 50,
                description: 'Focus timer sprint achieved (+50 pts & streak increased)'
              });

              Store.set('vs_points', STATE.points);
              Store.set('vs_streak', STATE.streak);
              Store.set('vs_points_history', STATE.points_history);
              showToast('🏆 Focus block complete! 50 points credited & study streak boosted!', 'success', 4500);
            }
          }, 1000);
        }
      };
    }

    if (btnReset) {
      btnReset.onclick = function () {
        clearInterval(timerInterval);
        timerIsRunning = false;
        timerRemainingSeconds = 25 * 60;
        if (btnStartPause) btnStartPause.textContent = 'Start Timer';
        if (completeMsg) completeMsg.style.display = 'none';
        updateTimerDisplay();
      };
    }

    updateTimerDisplay();
  }

  // ─── 16. PAGE: STEM LABS & SIMULATIONS (Generic for All Centers) ───────────
  function renderLabsView() {
    var grid = document.getElementById('simGrid');
    var viewer = document.getElementById('simViewer');
    var iframe = document.getElementById('simIframe');
    var titleEl = document.getElementById('simViewerTitle');
    var externalLink = document.getElementById('simExternalLink');
    var fallbackBtn = document.getElementById('simFallbackBtn');
    var backBtn = document.getElementById('btnBackFromSim');
    var chips = document.querySelectorAll('#labsSubjectFilter .chip');

    var allSims = DATA.simulations || [];
    var activeFilter = 'all';
    var activeGrade = 'all';
    var gradeSelect = document.getElementById('labsGradeFilter');

    var flaskIconSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:28px; height:28px;"><path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2"/><path d="M8.5 2h7"/><path d="M7 16h10"/></svg>';

    var renderGrid = function () {
      if (!grid) return;
      var filtered = allSims.filter(function (s) {
        var matchSub = activeFilter === 'all' ? true : s.subject.toLowerCase() === activeFilter.toLowerCase();
        var matchGrade = activeGrade === 'all' ? true : s.class === activeGrade;
        return matchSub && matchGrade;
      });

      if (filtered.length === 0) {
        grid.innerHTML = '<div class="card text-center p-24 text-muted" style="grid-column:1/-1;">No simulations found for the selected subject and class grade.</div>';
        return;
      }

      grid.innerHTML = filtered.map(function (sim) {
        return (
          '<div class="sim-card" data-sim-id="' + sim.id + '">' +
            '<div class="sim-card-banner">' +
              '<div class="sim-banner-flask">' + flaskIconSvg + '</div>' +
            '</div>' +
            '<div class="sim-card-content">' +
              '<span class="sim-tag-pill">' + sim.subject + '</span>' +
              '<h3 class="sim-title">' + sim.title + '</h3>' +
              '<p class="sim-desc">' + sim.description + '</p>' +
              '<button type="button" class="sim-launch-link" data-sim-id="' + sim.id + '">' +
                'Open simulation &rarr;' +
              '</button>' +
            '</div>' +
          '</div>'
        );
      }).join('');

      var launchBtns = grid.querySelectorAll('.sim-launch-link, .sim-card');
      launchBtns.forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          var sid = this.getAttribute('data-sim-id');
          var simObj = allSims.find(function (s) { return s.id === sid; });
          if (simObj) launchSim(simObj);
        });
      });
    };

    var launchSim = function (sim) {
      if (grid) grid.style.display = 'none';
      if (viewer) viewer.classList.add('active');
      if (titleEl) titleEl.textContent = sim.title + ' (' + sim.subject + ')';
      if (externalLink) externalLink.href = sim.phet_url;
      if (fallbackBtn) fallbackBtn.href = sim.phet_url;
      if (iframe) iframe.src = sim.phet_url;
      window.scrollTo(0, 0);
    };

    if (backBtn) {
      backBtn.onclick = function () {
        if (iframe) iframe.src = '';
        if (viewer) viewer.classList.remove('active');
        if (grid) grid.style.display = 'grid';
      };
    }

    chips.forEach(function (chip) {
      chip.onclick = function () {
        chips.forEach(function (c) { c.classList.remove('active'); });
        this.classList.add('active');
        activeFilter = this.getAttribute('data-subject');
        renderGrid();
      };
    });

    if (gradeSelect) {
      gradeSelect.onchange = function () {
        activeGrade = this.value;
        renderGrid();
      };
    }

    renderGrid();
  }

  // ─── 17. PAGE: CURATED VIDEO LESSONS ───────────────────────────────────────
  function renderVideosView() {
    var student = getActiveStudent();
    renderTeacherHeroCard('videosTeacherHeroContainer');

    var grid = document.getElementById('videoCardsGrid');
    var activePlayerContainer = document.getElementById('videoActivePlayerContainer');
    var activeIframe = document.getElementById('videoActiveIframe');
    var activeTitle = document.getElementById('videoActiveTitle');
    var closeActiveBtn = document.getElementById('btnCloseActiveVideo');
    var chips = document.querySelectorAll('#videoSubjectFilter .chip');

    var activeVideos = (STATE.videos || []).filter(function (v) {
      return currentCenterId === 'all'
        ? (student.enrolled_centers || []).indexOf(v.center_id) !== -1
        : v.center_id === currentCenterId;
    });

    var activeSubFilter = 'all';

    var renderGrid = function (sub) {
      if (!grid) return;
      var filtered = activeVideos.filter(function (v) {
        return sub === 'all' ? true : v.subject === sub;
      });

      if (filtered.length === 0) {
        grid.innerHTML = '<div class="card text-center p-24 text-muted" style="grid-column:1/-1;">No video lectures found for this subject and faculty selection.</div>';
        return;
      }

      grid.innerHTML = filtered.map(function (v) {
        var centerObj = getCenterById(v.center_id);
        return (
          '<div class="card" style="display:flex; flex-direction:column; overflow:hidden;">' +
            '<div style="background:linear-gradient(135deg, var(--surface-muted), var(--surface-alt)); padding:22px; text-align:center; position:relative;">' +
              '<span class="badge badge-neutral" style="position:absolute; top:10px; right:10px; font-size:10px;">' + v.duration + '</span>' +
              '<div style="font-size:36px; margin-bottom:4px;">▶️</div>' +
              '<span class="center-tag" style="border-color:' + centerObj.color + '; color:' + centerObj.color + '; font-size:10px;">' + centerObj.name + '</span>' +
            '</div>' +
            '<div class="card-body" style="flex:1; display:flex; flex-direction:column;">' +
              '<div style="display:flex; gap:6px; margin-bottom:6px;">' +
                '<span class="badge badge-primary text-xs">' + v.subject + '</span>' +
                '<span class="badge badge-neutral text-xs">' + v.chapter + '</span>' +
              '</div>' +
              '<h3 class="text-sm fw-700" style="color:var(--text-main); margin-bottom:6px;">' + v.title + '</h3>' +
              '<p class="text-xs text-muted mb-12" style="flex:1;">' + v.description + '</p>' +
              '<div class="text-xs text-secondary mb-12">Faculty: <strong>' + v.teacher_name + '</strong></div>' +
              '<button type="button" class="btn btn-primary btn-sm btn-play-lesson" data-yt="' + v.youtube_id + '" data-title="' + v.title + '">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px; height:14px;"><polygon points="5 3 19 12 5 21 5 3"/></svg>' +
                'Watch Masterclass' +
              '</button>' +
            '</div>' +
          '</div>'
        );
      }).join('');

      var playBtns = grid.querySelectorAll('.btn-play-lesson');
      playBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
          var ytid = this.getAttribute('data-yt');
          var t = this.getAttribute('data-title');
          if (activePlayerContainer && activeIframe) {
            activeTitle.textContent = t;
            activeIframe.src = 'https://www.youtube-nocookie.com/embed/' + ytid + '?rel=0&autoplay=1';
            activePlayerContainer.style.display = 'block';
            window.scrollTo({ top: activePlayerContainer.offsetTop - 80, behavior: 'smooth' });
          }
        });
      });
    };

    if (closeActiveBtn) {
      closeActiveBtn.onclick = function () {
        if (activeIframe) activeIframe.src = '';
        if (activePlayerContainer) activePlayerContainer.style.display = 'none';
      };
    }

    chips.forEach(function (chip) {
      chip.onclick = function () {
        chips.forEach(function (c) { c.classList.remove('active'); });
        this.classList.add('active');
        activeSubFilter = this.getAttribute('data-subject');
        renderGrid(activeSubFilter);
      };
    });

    renderGrid(activeSubFilter);
  }

  // ─── 18. PAGE: TESTS & ANALYTICS ───────────────────────────────────────────
  function renderTestsView() {
    var student = getActiveStudent();
    renderTeacherHeroCard('testsTeacherHeroContainer');

    var tabReports = document.getElementById('tabBtnTestReports');
    var tabQuiz = document.getElementById('tabBtnTakeQuiz');
    var panelReports = document.getElementById('panelTestReports');
    var panelQuiz = document.getElementById('panelTakeQuiz');

    if (tabReports && tabQuiz && panelReports && panelQuiz) {
      tabReports.onclick = function () {
        tabReports.classList.add('active');
        tabQuiz.classList.remove('active');
        panelReports.classList.add('active');
        panelQuiz.classList.remove('active');
      };
      tabQuiz.onclick = function () {
        tabQuiz.classList.add('active');
        tabReports.classList.remove('active');
        panelQuiz.classList.add('active');
        panelReports.classList.remove('active');
        startQuizFlow();
      };
    }

    // Assessments list
    var listContainer = document.getElementById('testsListContainer');
    if (listContainer) {
      var studentTests = (STATE.tests || []).filter(function (t) {
        var matchStudent = t.student_id === currentStudentId;
        var matchCenter = currentCenterId === 'all'
          ? (student.enrolled_centers || []).indexOf(t.center_id) !== -1
          : t.center_id === currentCenterId;
        return matchStudent && matchCenter;
      });

      if (studentTests.length === 0) {
        listContainer.innerHTML = '<div class="text-sm text-secondary">No assessments recorded for this faculty selection.</div>';
      } else {
        listContainer.innerHTML = studentTests.map(function (test) {
          var pct = Math.round((test.marks_obtained / test.total_marks) * 100);
          var centerObj = getCenterById(test.center_id);
          var subBadgeClass = getSubjectBadgeClass(test.subject);
          var pctBadgeClass = pct >= 85 ? 'badge-success' : pct >= 70 ? 'badge-accent' : 'badge-warning';
          return (
            '<div class="test-item">' +
              '<div class="test-score-box">' +
                '<span class="test-score-val">' + test.marks_obtained + '/' + test.total_marks + '</span>' +
                '<span class="test-score-pct ' + pctBadgeClass + '">' + pct + '%</span>' +
              '</div>' +
              '<div class="test-info">' +
                '<div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:4px;">' +
                  '<span class="test-name">' + test.name + '</span>' +
                  '<span class="badge ' + subBadgeClass + '" style="font-size:10px;">' + test.subject + '</span>' +
                  '<span class="center-tag" style="border-color:' + centerObj.color + '; color:' + centerObj.color + '; font-size:10px;">🏛️ ' + centerObj.name + '</span>' +
                '</div>' +
                '<div class="test-meta">' + test.date + ' &bull; Duration: ' + test.duration_min + 'm &bull; Topics: ' + test.topics_tested.join(', ') + '</div>' +
              '</div>' +
            '</div>'
          );
        }).join('');
      }
    }

    // Pure SVG Subject Score Chart (Diverse Academic Palette)
    var chartContainer = document.getElementById('testsChartContainer');
    if (chartContainer) {
      var sampleSubjects = [
        { name: 'Maths', score: 88, color: '#2563EB' },
        { name: 'Physics', score: 76, color: '#7C3AED' },
        { name: 'Chemistry', score: 92, color: '#0D9488' },
        { name: 'Biology', score: 90, color: '#16A34A' },
        { name: 'English', score: 80, color: '#EA580C' }
      ];

      var svgWidth = 320;
      var svgHeight = 180;
      var barWidth = 36;
      var gap = 24;

      var barsSvg = sampleSubjects.map(function (sub, idx) {
        var x = 20 + idx * (barWidth + gap);
        var barH = (sub.score / 100) * 130;
        var y = 145 - barH;
        return (
          '<g>' +
            '<rect x="' + x + '" y="' + y + '" width="' + barWidth + '" height="' + barH + '" rx="4" fill="' + sub.color + '"/>' +
            '<text x="' + (x + barWidth / 2) + '" y="' + (y - 5) + '" text-anchor="middle" font-size="11" font-weight="700" fill="var(--text-main)">' + sub.score + '%</text>' +
            '<text x="' + (x + barWidth / 2) + '" y="165" text-anchor="middle" font-size="10" font-weight="600" fill="var(--text-secondary)">' + sub.name.substring(0, 4) + '</text>' +
          '</g>'
        );
      }).join('');

      chartContainer.innerHTML =
        '<svg width="100%" height="180" viewBox="0 0 ' + svgWidth + ' ' + svgHeight + '">' +
          '<line x1="10" y1="145" x2="310" y2="145" stroke="var(--border)" stroke-width="1.5"/>' +
          barsSvg +
        '</svg>';
    }

    // Weak topics diagnostic
    var weakContainer = document.getElementById('testsWeakTopicsContainer');
    if (weakContainer) {
      var studentTests = (STATE.tests || []).filter(function (t) { return t.student_id === currentStudentId; });
      var weakList = [];
      studentTests.forEach(function (t) {
        (t.weak_topics || []).forEach(function (w) {
          if (weakList.indexOf(w) === -1) weakList.push(w);
        });
      });

      if (weakList.length === 0) {
        weakContainer.innerHTML = '<div class="text-sm text-secondary">Excellent! No recurring weak concepts detected.</div>';
      } else {
        weakContainer.innerHTML = weakList.map(function (w) {
          return '<div class="weak-topic-tag">⚠️ ' + w + '</div>';
        }).join('');
      }
    }
  }

  // ─── 19. INTERACTIVE 5-MCQ QUIZ FLOW ───────────────────────────────────────
  function startQuizFlow() {
    activeQuizIndex = 0;
    quizScore = 0;
    quizAnswered = false;
    renderCurrentQuestion();
  }

  function renderCurrentQuestion() {
    var quizBody = document.getElementById('quizQuestionsBody');
    var quizResult = document.getElementById('quizResultScreen');
    if (!quizBody) return;

    var mcqs = DATA.mcqs || [];
    if (activeQuizIndex >= mcqs.length) {
      // Show quiz results
      if (quizBody) quizBody.style.display = 'none';
      if (quizResult) {
        quizResult.style.display = 'block';
        var scoreVal = document.getElementById('quizFinalScore');
        if (scoreVal) scoreVal.textContent = quizScore + ' / ' + mcqs.length;

        STATE.points += quizScore * 10;
        STATE.points_history.unshift({
          id: 'ph-quiz-' + Date.now(),
          student_id: currentStudentId,
          date: new Date().toISOString().split('T')[0],
          action: 'quiz_completed',
          points: quizScore * 10,
          description: 'Practice MCQ Challenge score: ' + quizScore + '/' + mcqs.length
        });

        Store.set('vs_points', STATE.points);
        Store.set('vs_points_history', STATE.points_history);
        showToast('Quiz graded! +' + (quizScore * 10) + ' study points credited!', 'success', 3500);
      }
      return;
    }

    if (quizResult) quizResult.style.display = 'none';
    if (quizBody) quizBody.style.display = 'block';

    var q = mcqs[activeQuizIndex];
    quizAnswered = false;

    quizBody.innerHTML =
      '<div style="margin-bottom:14px;">' +
        '<span class="badge badge-primary text-xs mb-8">Question ' + (activeQuizIndex + 1) + ' of ' + mcqs.length + ' &bull; ' + q.subject + '</span>' +
        '<h3 class="text-base fw-700" style="color:var(--text-main); margin-top:6px;">' + q.question + '</h3>' +
      '</div>' +
      '<div class="mcq-options-grid" style="display:flex; flex-direction:column; gap:8px; margin-bottom:16px;">' +
        ['a', 'b', 'c', 'd'].map(function (optKey) {
          return (
            '<button type="button" class="btn btn-secondary mcq-choice-btn" data-opt="' + optKey + '" style="text-align:left; justify-content:flex-start; padding:10px 14px;">' +
              '<strong>' + optKey.toUpperCase() + '.</strong> &nbsp; ' + q.options[optKey] +
            '</button>'
          );
        }).join('') +
      '</div>' +
      '<div id="mcqExplanationBox" style="display:none; padding:12px; border-radius:var(--radius-sm); margin-bottom:16px; font-size:13px;"></div>' +
      '<button type="button" class="btn btn-primary" id="btnNextQuizQuestion" style="display:none;">Next Question &rarr;</button>';

    var choiceBtns = quizBody.querySelectorAll('.mcq-choice-btn');
    var explanationBox = quizBody.querySelector('#mcqExplanationBox');
    var nextBtn = quizBody.querySelector('#btnNextQuizQuestion');

    choiceBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (quizAnswered) return;
        quizAnswered = true;
        var chosen = this.getAttribute('data-opt');
        var isCorrect = chosen === q.correct;
        if (isCorrect) quizScore++;

        choiceBtns.forEach(function (b) {
          b.disabled = true;
          var k = b.getAttribute('data-opt');
          if (k === q.correct) {
            b.classList.add('mcq-correct');
            b.style.borderColor = 'var(--accent)';
            b.style.background = 'var(--accent-subtle)';
          } else if (k === chosen && !isCorrect) {
            b.classList.add('mcq-wrong');
            b.style.borderColor = 'var(--error)';
            b.style.background = 'var(--error-bg)';
          }
        });

        if (explanationBox) {
          explanationBox.style.display = 'block';
          explanationBox.style.background = isCorrect ? 'var(--accent-subtle)' : 'var(--error-bg)';
          explanationBox.style.border = '1px solid ' + (isCorrect ? 'var(--accent)' : 'var(--error)');
          explanationBox.innerHTML =
            '<strong>' + (isCorrect ? '✅ Correct!' : '❌ Incorrect.') + '</strong> ' + q.explanation;
        }

        if (nextBtn) {
          nextBtn.style.display = 'inline-flex';
          nextBtn.onclick = function () {
            activeQuizIndex++;
            renderCurrentQuestion();
          };
        }
      });
    });
  }

  // ─── 20. PAGE: POINTS, STREAKS & BADGES ────────────────────────────────────
  function renderPointsView() {
    var student = getActiveStudent();
    renderTeacherHeroCard('pointsTeacherHeroContainer');

    var ptsDisplay = document.getElementById('pointsTotalDisplay');
    var ptsBigTotal = document.getElementById('pointsBigTotal');
    var ptsBigStreak = document.getElementById('pointsBigStreak');
    var ptsTeacherGiven = document.getElementById('pointsTeacherGiven');
    var streakDisplay = document.getElementById('pointsStreakDisplay');
    var rankDisplay = document.getElementById('pointsRankDisplay');

    var allHist = STATE.points_history || DATA.points_history || [];
    var studentHist = allHist.filter(function (h) {
      var matchStudent = (h.student_id === currentStudentId || !h.student_id);
      var matchCenter = currentCenterId === 'all'
        ? (student.enrolled_centers || []).indexOf(h.center_id) !== -1 || !h.center_id
        : h.center_id === currentCenterId;
      return matchStudent && matchCenter;
    });

    var totalFilteredPoints = studentHist.reduce(function (sum, h) { return sum + (h.points || 0); }, 0);
    var teacherPoints = studentHist.filter(function (h) { return h.award_type === 'teacher'; })
      .reduce(function (sum, h) { return sum + (h.points || 0); }, 0);

    if (ptsDisplay) ptsDisplay.textContent = (currentCenterId === 'all' ? (student.points || STATE.points) : totalFilteredPoints).toLocaleString();
    if (ptsBigTotal) ptsBigTotal.textContent = (currentCenterId === 'all' ? (student.points || STATE.points) : totalFilteredPoints).toLocaleString();
    if (ptsBigStreak) ptsBigStreak.textContent = (student.streak || STATE.streak) + ' Days 🔥';
    if (ptsTeacherGiven) ptsTeacherGiven.textContent = teacherPoints + ' pts';
    if (streakDisplay) streakDisplay.textContent = (student.streak || STATE.streak) + ' Days';
    if (rankDisplay) rankDisplay.textContent = (currentCenterId === 'all' ? '#6' : '#2 in ' + (getActiveCenter() ? getActiveCenter().name.split(' ')[0] : 'Batch'));

    // Points Filter (All, Teacher Awards, System Milestones)
    var pointFilterChips = document.querySelectorAll('#pointsTypeFilter .chip');
    var activePointType = 'all';

    var renderHistoryList = function () {
      var histContainer = document.getElementById('pointsHistoryList');
      if (!histContainer) return;

      var displayedHist = studentHist.filter(function (h) {
        if (activePointType === 'all') return true;
        return h.award_type === activePointType;
      });

      if (displayedHist.length === 0) {
        histContainer.innerHTML = '<div class="text-sm text-muted p-16 text-center">No points events found for this filter selection.</div>';
        return;
      }

      histContainer.innerHTML = displayedHist.slice(0, 10).map(function (h) {
        var isTeacher = h.award_type === 'teacher';
        var awardBadge = isTeacher
          ? '<span class="badge badge-accent text-xs">🏅 Teacher Honor</span>'
          : '<span class="badge badge-neutral text-xs">⚙️ System Milestone</span>';

        return (
          '<div class="points-history-item" style="display:flex; align-items:center; gap:12px; padding:12px 14px; border-bottom:1px solid var(--border);">' +
            '<div style="flex:1;">' +
              '<div style="display:flex; align-items:center; gap:8px; margin-bottom:3px; flex-wrap:wrap;">' +
                '<span class="text-sm fw-700">' + h.description + '</span>' +
                awardBadge +
              '</div>' +
              '<div class="text-xs text-muted">' +
                h.date + (h.center_name ? ' &bull; 🏛️ ' + h.center_name : '') + (h.awarded_by ? ' &bull; Awarded by: <strong>' + h.awarded_by + '</strong>' : '') +
              '</div>' +
            '</div>' +
            '<span class="badge badge-accent" style="font-size:12px; font-weight:800;">+' + h.points + ' pts</span>' +
          '</div>'
        );
      }).join('');
    };

    pointFilterChips.forEach(function (chip) {
      chip.onclick = function () {
        pointFilterChips.forEach(function (c) { c.classList.remove('active'); });
        this.classList.add('active');
        activePointType = this.getAttribute('data-point-filter');
        renderHistoryList();
      };
    });

    renderHistoryList();

    // Leaderboard
    var lbContainer = document.getElementById('leaderboardList');
    var showRankToggle = document.getElementById('toggleShowRank');
    if (lbContainer) {
      var fullBoard = DATA.leaderboard || [];
      var top5 = fullBoard.slice(0, 5);
      var showSelf = showRankToggle ? showRankToggle.checked : true;

      var rows = top5.slice();
      if (showSelf) {
        var selfEntry = fullBoard.find(function (e) { return e.is_self; });
        if (selfEntry && top5.indexOf(selfEntry) === -1) {
          rows.push(selfEntry);
        }
      }

      lbContainer.innerHTML = rows.map(function (row) {
        return (
          '<div class="leaderboard-row ' + (row.is_self ? 'self-highlight' : '') + '">' +
            '<span class="lb-rank">' + row.badge + ' #' + row.rank + '</span>' +
            '<span class="lb-name">' + row.student_name + (row.is_self ? ' <strong>(You)</strong>' : '') + '</span>' +
            '<span class="text-xs text-muted" style="margin-left:auto; margin-right:12px;">' + (row.center || 'Stellar Academy') + '</span>' +
            '<span class="lb-pts">' + row.points.toLocaleString() + ' pts</span>' +
          '</div>'
        );
      }).join('');

      if (showRankToggle) {
        showRankToggle.onchange = function () { renderPointsView(); };
      }
    }

    // Badges Grid
    var badgesContainer = document.getElementById('badgesContainer');
    if (badgesContainer) {
      var badges = STATE.badges || DATA.badges || [];
      badgesContainer.innerHTML = badges.map(function (b) {
        return (
          '<div class="badge-card ' + (b.earned ? 'earned' : 'locked') + '">' +
            '<div class="badge-icon-emoji">' + b.icon_emoji + '</div>' +
            '<h4 class="text-sm fw-700">' + b.name + '</h4>' +
            '<p class="text-xs text-muted">' + b.description + '</p>' +
            '<span class="badge ' + (b.earned ? 'badge-accent' : 'badge-neutral') + ' text-xs" style="margin-top:8px;">' +
              (b.earned ? 'Unlocked on ' + b.earned_date : '🔒 Locked') +
            '</span>' +
          '</div>'
        );
      }).join('');
    }
  }

  // ─── 21. PAGE: MARKSHEETS & CERTIFICATES ───────────────────────────────────
  function renderMarksheetView() {
    var student = getActiveStudent();
    renderTeacherHeroCard('marksheetTeacherHeroContainer');

    var listContainer = document.getElementById('docsCardsList');
    var listView = document.getElementById('docsListView');
    var docViewer = document.getElementById('docViewer');
    var backBtn = document.getElementById('btnBackToDocsList');
    var printBtn = document.getElementById('btnPrintDocument');

    var activeDocs = (STATE.documents || []).filter(function (d) {
      var matchStudent = d.student_id === currentStudentId;
      var matchCenter = currentCenterId === 'all'
        ? (student.enrolled_centers || []).indexOf(d.center_id) !== -1
        : d.center_id === currentCenterId;
      return matchStudent && matchCenter;
    });

    if (listContainer) {
      if (activeDocs.length === 0) {
        listContainer.innerHTML = '<div class="card text-center p-24 text-muted">No academic documents issued by this faculty selection.</div>';
      } else {
        listContainer.innerHTML = activeDocs.map(function (doc) {
          var centerObj = getCenterById(doc.center_id);
          var isValid = doc.status === 'valid';
          var subPills = (doc.subject_marks || []).map(function (sm) {
            var sClass = getSubjectBadgeClass(sm.subject);
            var sPct = Math.round((sm.obtained / sm.max) * 100);
            return '<span class="badge ' + sClass + '" style="font-size:10px;">' + sm.subject + ': ' + sm.obtained + '/' + sm.max + ' (' + sPct + '%)</span>';
          }).join(' ');

          return (
            '<div class="doc-item-card">' +
              '<div>' +
                '<div class="doc-card-top">' +
                  '<div class="doc-card-icon">' + (doc.type === 'marksheet' ? '📜' : '🎖️') + '</div>' +
                  '<div class="doc-card-badges">' +
                    '<span class="badge badge-primary">' + doc.type.toUpperCase() + '</span>' +
                    '<span class="center-tag" style="border-color:' + centerObj.color + '; color:' + centerObj.color + ';">🏛️ ' + centerObj.name + '</span>' +
                    '<span class="badge ' + (isValid ? 'badge-success' : 'badge-error') + '">' + (isValid ? '✅ VALID' : '❌ REVOKED') + '</span>' +
                  '</div>' +
                '</div>' +
                '<h3 class="doc-card-title">' + doc.title + '</h3>' +
                '<div class="doc-card-meta">' +
                  '<span>Issued: <strong>' + doc.issue_date + '</strong></span> &bull; ' +
                  '<span>Ref: <code>' + doc.code + '</code></span>' +
                '</div>' +
                '<div class="doc-card-subs-preview">' + subPills + '</div>' +
                '<div class="doc-card-scores">' +
                  '<div class="doc-card-score-metric">' +
                    '<span class="doc-card-score-label">Aggregate Marks</span>' +
                    '<span class="doc-card-score-value">' + doc.total_obtained + '/' + doc.total_max + ' (' + doc.percentage + '%)</span>' +
                  '</div>' +
                  '<div class="badge badge-accent doc-card-grade-badge">Grade ' + doc.grade + '</div>' +
                '</div>' +
              '</div>' +
              '<div style="display:flex; gap:10px; margin-top:14px;">' +
                '<button type="button" class="btn btn-primary btn-sm btn-view-doc" data-doc-id="' + doc.id + '" style="flex:1;">' +
                  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px; height:14px;"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>' +
                  'View &amp; Print Marksheet' +
                '</button>' +
                '<a href="#verify/' + doc.code + '" class="btn btn-secondary btn-sm" title="Verify Document Authenticity">' +
                  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px; height:14px;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' +
                  'Verify' +
                '</a>' +
              '</div>' +
            '</div>'
          );
        }).join('');

        var viewBtns = listContainer.querySelectorAll('.btn-view-doc');
        viewBtns.forEach(function (btn) {
          btn.addEventListener('click', function () {
            var docId = this.getAttribute('data-doc-id');
            var doc = activeDocs.find(function (d) { return d.id === docId; });
            if (doc) displayPrintableDoc(doc);
          });
        });
      }
    }

    function displayPrintableDoc(doc) {
      currentDocViewing = doc;
      if (listView) listView.style.display = 'none';
      if (docViewer) docViewer.classList.add('active');

      var container = document.getElementById('printableDocContent');
      if (!container) return;

      var centerObj = getCenterById(doc.center_id);
      var isValid = doc.status === 'valid';

      var marksRowsHtml = (doc.subject_marks || []).map(function (m) {
        var pct = Math.round((m.obtained / m.max) * 100);
        var subBadge = getSubjectBadgeClass(m.subject);
        var perfGrade = pct >= 90 ? 'Outstanding (O)' : pct >= 80 ? 'Distinction (A+)' : pct >= 70 ? 'Merit (A)' : 'Pass (B)';
        return (
          '<tr>' +
            '<td><span class="badge ' + subBadge + '" style="font-size:11.5px; padding:3px 10px;">' + m.subject + '</span></td>' +
            '<td class="text-center fw-600">' + m.max + '</td>' +
            '<td class="text-center fw-800" style="color:var(--text-main);">' + m.obtained + '</td>' +
            '<td class="text-center fw-700">' + pct + '%</td>' +
            '<td class="text-right fw-600 text-sm" style="color:var(--text-secondary);">' + perfGrade + '</td>' +
          '</tr>'
        );
      }).join('');

      var qrSvg = generateQrSvg(doc.code);

      container.innerHTML =
        '<div class="doc-header">' +
          '<div class="doc-logo-box" style="background: linear-gradient(135deg, ' + centerObj.color + ', #2A0812);">' + centerObj.logo_text + '</div>' +
          '<div class="doc-center-name">' + (doc.center_name || centerObj.name) + '</div>' +
          '<div class="doc-center-addr">' + (centerObj.address || '42, Science Nagar, Pune – 411021') + ' &bull; Phone: ' + centerObj.phone + '</div>' +
          '<div class="doc-affiliation-tag">Accredited Academic Coaching Partner &bull; Est. ' + (centerObj.established || 2018) + '</div>' +
          '<div class="doc-exam-banner">' + doc.exam_name + '</div>' +
        '</div>' +

        '<table class="doc-student-table">' +
          '<tr>' +
            '<td>Candidate Name:</td><td class="fw-800" style="font-size:15px;">' + student.name + '</td>' +
            '<td>Roll Registration:</td><td class="fw-800" style="font-family:var(--font-mono);">' + student.roll + '</td>' +
          '</tr>' +
          '<tr>' +
            '<td>Academic Class:</td><td>' + student.class + ' (' + (student.board || 'CBSE') + ')</td>' +
            '<td>Date of Issue:</td><td>' + doc.issue_date + '</td>' +
          '</tr>' +
          '<tr>' +
            '<td>Verification Ref:</td><td><code style="font-size:13px; font-weight:700; color:#800020;">' + doc.code + '</code></td>' +
            '<td>Credential Status:</td><td><span class="badge ' + (isValid ? 'badge-success' : 'badge-error') + '" style="font-size:11px;">' + (isValid ? '✅ VALID &amp; AUTHENTIC' : '❌ REVOKED / EXPIRED') + '</span></td>' +
          '</tr>' +
        '</table>' +

        '<table class="doc-marks-table">' +
          '<thead>' +
            '<tr>' +
              '<th>Curriculum Discipline</th>' +
              '<th style="text-align:center;">Maximum Marks</th>' +
              '<th style="text-align:center;">Marks Obtained</th>' +
              '<th style="text-align:center;">Percentage</th>' +
              '<th style="text-align:right;">Performance Classification</th>' +
            '</tr>' +
          '</thead>' +
          '<tbody>' +
            marksRowsHtml +
            '<tr class="doc-total-row">' +
              '<td>GRAND AGGREGATE EVALUATION</td>' +
              '<td style="text-align:center;">' + doc.total_max + '</td>' +
              '<td style="text-align:center;">' + doc.total_obtained + '</td>' +
              '<td style="text-align:center;">' + doc.percentage + '%</td>' +
              '<td style="text-align:right; font-weight:800; color:var(--accent);">GRADE ' + doc.grade + '</td>' +
            '</tr>' +
          '</tbody>' +
        '</table>' +

        '<div class="doc-summary">' +
          '<div class="doc-summary-item">' +
            '<div class="doc-summary-value">' + doc.grade + '</div>' +
            '<div class="doc-summary-label">Final Letter Grade</div>' +
          '</div>' +
          '<div class="doc-summary-item">' +
            '<div class="doc-summary-value">' + doc.percentage + '%</div>' +
            '<div class="doc-summary-label">Aggregate Percentage</div>' +
          '</div>' +
          '<div class="doc-summary-item">' +
            '<div class="doc-summary-value">' + doc.attendance_percent + '%</div>' +
            '<div class="doc-summary-label">Academic Attendance</div>' +
          '</div>' +
          '<div class="doc-summary-item">' +
            '<div class="doc-summary-value" style="color:var(--accent); font-size:18px;">DISTINCTION</div>' +
            '<div class="doc-summary-label">Result Classification</div>' +
          '</div>' +
        '</div>' +

        '<div class="doc-auth-block">' +
          '<div class="doc-qr-area">' +
            qrSvg +
            '<div>' +
              '<div class="text-xs fw-800" style="color:#800020; letter-spacing:0.5px;">DIGITAL AUTHENTICATION RECORD</div>' +
              '<div class="text-xs text-secondary" style="margin-top:2px;">Scan QR to verify credential registry ref: <strong style="font-family:var(--font-mono);">' + doc.code + '</strong></div>' +
              '<div class="text-xs text-muted" style="margin-top:2px;">Online portal: index.html#verify/' + doc.code + '</div>' +
            '</div>' +
          '</div>' +
          '<div class="doc-seal-graphic">' +
            '<div class="doc-seal-text">VILARCI NETWORK</div>' +
            '<div class="doc-seal-star">★ ★ ★</div>' +
            '<div class="doc-seal-text" style="color:#C28828;">OFFICIAL SEAL</div>' +
            '<div class="doc-seal-star">★</div>' +
            '<div class="doc-seal-text">' + centerObj.logo_text + ' CERTIFIED</div>' +
          '</div>' +
        '</div>' +

        '<div class="doc-signatures">' +
          '<div class="doc-sig-box">' +
            '<div class="doc-sig-line">Alok Sharma</div>' +
            '<div class="doc-sig-title">Academic Coordinator</div>' +
            '<div class="doc-sig-sub">Department of Science &amp; STEM Curriculum</div>' +
          '</div>' +
          '<div class="doc-sig-box">' +
            '<div class="doc-sig-line">' + (doc.director_name || centerObj.teacher_name).split('(')[0] + '</div>' +
            '<div class="doc-sig-title">' + (doc.director_name || centerObj.teacher_name) + '</div>' +
            '<div class="doc-sig-sub">Director / Head of Center, ' + (doc.center_name || centerObj.name) + '</div>' +
          '</div>' +
        '</div>' +

        '<div class="doc-disclaimer">' +
          'Issued by ' + (doc.center_name || centerObj.name) + ' for internal academic coaching records and continuous student assessment. Not a state board or statutory university examination certificate.' +
        '</div>';

      window.scrollTo(0, 0);
    }

    if (backBtn) {
      backBtn.onclick = function () {
        if (docViewer) docViewer.classList.remove('active');
        if (listView) listView.style.display = 'block';
      };
    }

    if (printBtn) {
      printBtn.onclick = function () {
        window.print();
      };
    }
  }

  // ─── 22. PAGE: VERIFY CREDENTIAL ───────────────────────────────────────────
  function renderVerifyView(presetCode) {
    var form = document.getElementById('verifyForm');
    var input = document.getElementById('verifyCodeInput');
    var resContainer = document.getElementById('verifyResultContainer');

    function executeVerification(code) {
      var trimmed = (code || '').trim().toUpperCase();
      if (!trimmed) return;

      var allDocs = STATE.documents || DATA.documents || [];
      var found = allDocs.find(function (d) { return d.code.toUpperCase() === trimmed; });

      if (found) {
        var student = (STATE.students || []).find(function (s) { return s.id === found.student_id; }) || { name: 'Aryan Mehta' };
        var centerObj = getCenterById(found.center_id);
        var isValid = found.status === 'valid';

        resContainer.innerHTML =
          '<div class="card p-24" style="border-left: 4px solid ' + (isValid ? 'var(--accent)' : 'var(--error)') + ';">' +
            '<div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:14px;">' +
              '<div>' +
                '<h3 class="text-lg fw-800">' + (found.center_name || centerObj.name) + '</h3>' +
                '<p class="text-xs text-muted">Official Coaching Certificate Registry</p>' +
              '</div>' +
              '<span class="badge ' + (isValid ? 'badge-success' : 'badge-error') + ' text-sm">' + (isValid ? '✅ VALID CREDENTIAL' : '❌ REVOKED / EXPIRED') + '</span>' +
            '</div>' +
            '<div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; font-size:13px;">' +
              '<div><span class="text-muted">Student Name:</span> <strong>' + student.name + '</strong></div>' +
              '<div><span class="text-muted">Evaluation Exam:</span> <strong>' + found.exam_name + '</strong></div>' +
              '<div><span class="text-muted">Issue Date:</span> <strong>' + found.issue_date + '</strong></div>' +
              '<div><span class="text-muted">Verification Ref:</span> <code>' + found.code + '</code></div>' +
            '</div>' +
          '</div>';

        showToast(isValid ? 'Document authenticated successfully!' : 'Record found: Status is REVOKED', isValid ? 'success' : 'error', 3000);
      } else {
        resContainer.innerHTML =
          '<div class="card text-center p-24" style="border-color:var(--error);">' +
            '<div style="font-size:36px; margin-bottom:8px;">❌</div>' +
            '<h3 class="text-base fw-700" style="color:var(--error);">Document Record Not Found</h3>' +
            '<p class="text-sm text-secondary">The verification code <code>' + trimmed + '</code> does not correspond to any issued credential in our registry.</p>' +
          '</div>';
        showToast('Document code not found in registry', 'error', 3000);
      }
    }

    if (form && input) {
      form.onsubmit = function (e) {
        e.preventDefault();
        executeVerification(input.value);
      };
    }

    if (presetCode) {
      if (input) input.value = presetCode;
      executeVerification(presetCode);
    }
  }

  // ─── 23. PAGE: SETTINGS & HOUSEHOLD PROFILES ───────────────────────────────
  // ─── 23. PAGE: SETTINGS & HOUSEHOLD PROFILES ───────────────────────────────
  function openEditStudentContactsModal() {
    var student = getActiveStudent();

    var modalHtml =
      '<form id="formEditStudentContacts" style="display:flex; flex-direction:column; gap:16px;">' +
        '<div style="background:var(--surface-muted); padding:10px 14px; border-radius:var(--radius-sm); border:1px solid var(--border); font-size:12.5px; color:var(--text-secondary);">' +
          'All guardian and parent mobile numbers must be verified for two-factor login and academic alerts.' +
        '</div>' +
        '<div>' +
          '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">' +
            '<label class="form-label" style="margin:0;">Father\'s Full Name &bull; Mobile No.</label>' +
            '<span class="badge badge-success text-xs">✓ Verified</span>' +
          '</div>' +
          '<div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">' +
            '<input type="text" id="editFatherName" class="form-input" value="' + (student.father_name || 'Rajesh Mehta') + '" required placeholder="Father Name">' +
            '<input type="text" id="editFatherPhone" class="form-input" value="' + (student.father_phone || '+91 98111 22334') + '" required placeholder="Father Phone">' +
          '</div>' +
        '</div>' +
        '<div>' +
          '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">' +
            '<label class="form-label" style="margin:0;">Mother\'s Full Name &bull; Mobile No.</label>' +
            '<span class="badge badge-success text-xs">✓ Verified</span>' +
          '</div>' +
          '<div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">' +
            '<input type="text" id="editMotherName" class="form-input" value="' + (student.mother_name || 'Sunita Mehta') + '" required placeholder="Mother Name">' +
            '<input type="text" id="editMotherPhone" class="form-input" value="' + (student.mother_phone || '+91 98765 11223') + '" required placeholder="Mother Phone">' +
          '</div>' +
        '</div>' +
        '<div>' +
          '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">' +
            '<label class="form-label" style="margin:0;">Guardian\'s Name &bull; Mobile No.</label>' +
            '<span class="badge badge-success text-xs">✓ Verified</span>' +
          '</div>' +
          '<div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">' +
            '<input type="text" id="editGuardianName" class="form-input" value="' + (student.guardian_name || 'Dr. Rameshwar Mehta') + '" required placeholder="Guardian Name">' +
            '<input type="text" id="editGuardianPhone" class="form-input" value="' + (student.guardian_phone || '+91 97123 44556') + '" required placeholder="Guardian Phone">' +
          '</div>' +
        '</div>' +
        '<div style="display:flex; justify-content:flex-end; gap:10px; margin-top:8px;">' +
          '<button type="button" class="btn btn-secondary" id="btnCancelEditContacts">Cancel</button>' +
          '<button type="submit" class="btn btn-primary">Save &amp; Verify Contacts</button>' +
        '</div>' +
      '</form>';

    var closeModal = openModal({
      title: 'Edit Parent & Guardian Verified Contacts',
      body: modalHtml,
      onReady: function (overlay) {
        var form = overlay.querySelector('#formEditStudentContacts');
        var cancel = overlay.querySelector('#btnCancelEditContacts');
        if (cancel) cancel.onclick = closeModal;

        if (form) {
          form.onsubmit = function (e) {
            e.preventDefault();
            var fName = document.getElementById('editFatherName').value.trim();
            var fPhone = document.getElementById('editFatherPhone').value.trim();
            var mName = document.getElementById('editMotherName').value.trim();
            var mPhone = document.getElementById('editMotherPhone').value.trim();
            var gName = document.getElementById('editGuardianName').value.trim();
            var gPhone = document.getElementById('editGuardianPhone').value.trim();

            student.father_name = fName;
            student.father_phone = fPhone;
            student.father_phone_verified = true;
            student.mother_name = mName;
            student.mother_phone = mPhone;
            student.mother_phone_verified = true;
            student.guardian_name = gName;
            student.guardian_phone = gPhone;
            student.guardian_phone_verified = true;

            // Sync legacy parent_name/phone with mother/father
            student.parent_name = mName || fName;
            student.parent_phone = mPhone || fPhone;

            Store.set('vs_students', STATE.students);
            closeModal();
            showToast('✅ Parent & Guardian contacts successfully verified and updated!', 'success', 3500);
            renderSettingsView();
          };
        }
      }
    });
  }

  function renderSettingsView() {
    var student = getActiveStudent();
    var allStudents = STATE.students || DATA.students || [];

    var avatar = document.getElementById('settingsAvatar');
    var nameEl = document.getElementById('settingsName');
    var rollEl = document.getElementById('settingsRoll');
    var fatherEl = document.getElementById('settingsFather');
    var motherEl = document.getElementById('settingsMother');
    var guardianEl = document.getElementById('settingsGuardian');
    var dobEl = document.getElementById('settingsDob');
    var themeToggle = document.getElementById('settingsThemeToggle');
    var resetBtn = document.getElementById('btnResetDemoData');
    var editContactsBtn = document.getElementById('btnEditStudentContacts');

    if (avatar) avatar.textContent = student.photo_initials || 'ST';
    if (nameEl) nameEl.textContent = student.name;
    if (rollEl) rollEl.textContent = 'Roll No: ' + student.roll + ' • ' + (student.class || 'Class 10') + ' (' + (student.board || 'CBSE') + ')';
    
    if (fatherEl) {
      fatherEl.innerHTML = '<span>' + (student.father_name || 'Rajesh Mehta') + ' (' + (student.father_phone || '+91 98111 22334') + ')</span>' +
        '<span class="badge badge-success text-xs">✓ Verified</span>';
    }
    if (motherEl) {
      motherEl.innerHTML = '<span>' + (student.mother_name || 'Sunita Mehta') + ' (' + (student.mother_phone || '+91 98765 11223') + ')</span>' +
        '<span class="badge badge-success text-xs">✓ Verified</span>';
    }
    if (guardianEl) {
      guardianEl.innerHTML = '<span>' + (student.guardian_name || 'Dr. Rameshwar Mehta') + ' (' + (student.guardian_phone || '+91 97123 44556') + ')</span>' +
        '<span class="badge badge-success text-xs">✓ Verified</span>';
    }

    if (dobEl) dobEl.textContent = student.dob;

    if (editContactsBtn) {
      editContactsBtn.onclick = openEditStudentContactsModal;
    }

    if (themeToggle) {
      themeToggle.checked = STATE.theme === 'dark';
      themeToggle.onchange = function () {
        applyTheme(this.checked ? 'dark' : 'light');
      };
    }

    if (resetBtn) {
      resetBtn.onclick = function () {
        if (confirm('Are you sure you want to restore all prototype demo data to defaults?\nAll created student profiles, newly joined tuitions, and mock fee vouchers will reset.')) {
          Store.reset();
          showToast('Demo data restored to initial factory defaults!', 'info', 2000);
          setTimeout(function () {
            window.location.reload();
          }, 600);
        }
      };
    }
  }

  // ─── 24. APP INITIALIZATION & BOOTSTRAP ─────────────────────────────────────
  function initApp() {
    initState();
    applyTheme(STATE.theme);
    updateSidebarProfile();
    renderStudentSelector();
    renderCenterSelector();

    // Global modal triggers
    window.VS_openJoinCenterModal = openJoinCenterModal;
    window.VS_openAddStudentModal = openAddStudentModal;
    window.VS_openSwitchProfileModal = openSwitchProfileModal;
    window.VS_switchCenter = function (centerId) {
      currentCenterId = centerId;
      renderCenterSelector();
      handleRouting();
    };
    window.VS_setStudent = setStudent;

    var sidebarProfileCard = document.getElementById('sidebarProfileCard');
    if (sidebarProfileCard) {
      sidebarProfileCard.onclick = function (e) {
        // If clicked directly on + Add Profile button, do not trigger switcher
        if (e.target && e.target.closest('#btnAddStudentSidebar')) return;
        openSwitchProfileModal();
      };
      sidebarProfileCard.onkeydown = function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openSwitchProfileModal();
        }
      };
    }

    var btnAddStudentSidebar = document.getElementById('btnAddStudentSidebar');
    if (btnAddStudentSidebar) {
      btnAddStudentSidebar.onclick = function (e) {
        if (e && e.stopPropagation) e.stopPropagation();
        openAddStudentModal();
      };
    }

    var btnJoinCenterSidebar = document.getElementById('btnJoinCenterSidebar');
    if (btnJoinCenterSidebar) {
      btnJoinCenterSidebar.onclick = openJoinCenterModal;
    }

    // Sidebar drawer toggle on mobile
    var hamburger = document.getElementById('hamburger');
    var appSidebar = document.getElementById('appSidebar');
    var sidebarBackdrop = document.getElementById('sidebarBackdrop');
    var sidebarCloseBtn = document.getElementById('sidebarCloseBtn');

    function closeSidebar() {
      if (appSidebar) appSidebar.classList.remove('open');
      if (sidebarBackdrop) sidebarBackdrop.classList.remove('active');
      if (hamburger) hamburger.setAttribute('aria-expanded', 'false');
    }

    function openSidebar() {
      if (appSidebar) appSidebar.classList.add('open');
      if (sidebarBackdrop) sidebarBackdrop.classList.add('active');
      if (hamburger) hamburger.setAttribute('aria-expanded', 'true');
    }

    if (hamburger) {
      hamburger.addEventListener('click', function () {
        if (appSidebar && appSidebar.classList.contains('open')) {
          closeSidebar();
        } else {
          openSidebar();
        }
      });
    }

    if (sidebarCloseBtn) sidebarCloseBtn.addEventListener('click', closeSidebar);
    if (sidebarBackdrop) sidebarBackdrop.addEventListener('click', closeSidebar);

    var sidebarNavItems = document.querySelectorAll('.sidebar-nav-item');
    sidebarNavItems.forEach(function (item) {
      item.addEventListener('click', function () {
        if (window.innerWidth < 960) closeSidebar();
      });
    });

    var themeToggleBtn = document.getElementById('themeToggle');
    if (themeToggleBtn) themeToggleBtn.addEventListener('click', toggleTheme);

    var themeToggleMobile = document.getElementById('themeToggleMobile');
    if (themeToggleMobile) themeToggleMobile.addEventListener('click', toggleTheme);

    var modeToggleBtn = document.getElementById('modeToggle');
    if (modeToggleBtn) modeToggleBtn.addEventListener('click', toggleParentMode);

    window.addEventListener('hashchange', handleRouting);
    handleRouting();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }

})();

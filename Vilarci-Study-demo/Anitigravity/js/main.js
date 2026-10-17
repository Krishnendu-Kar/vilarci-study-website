// ============================================================================
// js/main.js — Vilarci Study Student & Parent Portal
// Full vanilla JavaScript application logic (Router, State, UI Controllers)
// Compatible with file:// protocol — No ES modules or external libraries.
// ============================================================================

(function () {
  'use strict';

  // ─── 1. GLOBAL STATE & CONFIGURATION ───────────────────────────────────────
  var DATA = window.DATA || {};
  var currentStudentId = 'student-1';
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

  // ─── 2. STORAGE HELPERS (TRY/CATCH WRAPPED) ─────────────────────────────────
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

  // Mutable Application State (persisted to localStorage)
  var STATE = {};

  function initState() {
    STATE = {
      attendance: Store.get('vs_attendance', DATA.attendance || []),
      fees: Store.get('vs_fees', DATA.fees || []),
      syllabus: Store.get('vs_syllabus', DATA.syllabus || []),
      tests: Store.get('vs_tests', DATA.tests || []),
      points: Store.get('vs_points', 1240),
      streak: Store.get('vs_streak', 12),
      focus_sessions: Store.get('vs_focus_sessions', []),
      video_notes: Store.get('vs_video_notes', {}),
      theme: Store.get('vs_theme', 'light'),
      leaderboard: Store.get('vs_leaderboard', DATA.leaderboard || []),
      points_history: Store.get('vs_points_history', DATA.points_history || []),
      badges: Store.get('vs_badges', DATA.badges || [])
    };
  }

  function getActiveStudent() {
    return (DATA.students || []).find(function (s) {
      return s.id === currentStudentId;
    }) || {
      id: 'student-1',
      name: 'Aryan Mehta',
      roll: 'SA-101',
      batch_id: 'batch-1',
      parent_name: 'Sunita Mehta',
      photo_initials: 'AM',
      points: STATE.points,
      streak: STATE.streak
    };
  }

  // ─── 3. TOAST NOTIFICATION SYSTEM ──────────────────────────────────────────
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
    }

    toast.innerHTML =
      '<div class="toast-icon">' + iconSvg + '</div>' +
      '<div class="toast-msg">' + message + '</div>' +
      '<button type="button" class="toast-close" aria-label="Close notification">' +
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

  // ─── 4. MODAL SYSTEM ───────────────────────────────────────────────────────
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

  // ─── 5. THEME & HEADER CONTROLS ───────────────────────────────────────────
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
    showToast('Switched to ' + newTheme + ' theme', 'info', 2000);
  }

  function toggleParentMode() {
    isParentMode = !isParentMode;
    var toggleBtn = document.getElementById('modeToggle');
    var toggleLabel = document.getElementById('modeToggleLabel');

    if (isParentMode) {
      if (toggleBtn) toggleBtn.classList.add('parent-active');
      if (toggleLabel) toggleLabel.textContent = 'Parent Mode';
      showToast('Switched to Parent View', 'info', 2500);
    } else {
      if (toggleBtn) toggleBtn.classList.remove('parent-active');
      if (toggleLabel) toggleLabel.textContent = 'Student';
      showToast('Switched to Student View', 'info', 2500);
    }

    handleRouting();
  }

  // ─── 6. ROUTER & NAVIGATION ────────────────────────────────────────────────
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

    // Close mobile sidebar if open
    var appSidebar = document.getElementById('appSidebar');
    var sidebarBackdrop = document.getElementById('sidebarBackdrop');
    var hamburger = document.getElementById('hamburger');
    if (appSidebar) appSidebar.classList.remove('open');
    if (sidebarBackdrop) sidebarBackdrop.classList.remove('active');
    if (hamburger) hamburger.setAttribute('aria-expanded', 'false');

    // Hide all views
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

    // Call page-specific render controller
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
    if (roll) {
      var batchName = student.batch_id === 'batch-2' ? 'Class 9 Foundation' : 'Class 10 Board Prep';
      roll.textContent = 'Roll: ' + student.roll + ' • ' + batchName;
    }

    if (feeBadge) {
      var studentFees = (STATE.fees || []).filter(function (f) {
        return f.student_id === currentStudentId;
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

  // ─── 7. PAGE: HOME / DASHBOARD ─────────────────────────────────────────────
  function renderHomeView() {
    var student = getActiveStudent();
    updateSidebarProfile();
    var parentBanner = document.getElementById('parentBanner');
    var studentHeader = document.getElementById('studentHeader');
    var homeStatsGrid = document.getElementById('homeStatsGrid');
    var homeDashboardGrid = document.getElementById('homeDashboardGrid');
    var homeParentChildrenView = document.getElementById('homeParentChildrenView');
    var childSelect = document.getElementById('childSelect');

    // Populate Parent Child Selector
    if (childSelect && childSelect.options.length === 0) {
      childSelect.innerHTML = (DATA.students || []).map(function (s) {
        return '<option value="' + s.id + '"' + (s.id === currentStudentId ? ' selected' : '') + '>' + s.name + ' (' + s.roll + ')</option>';
      }).join('');

      childSelect.addEventListener('change', function () {
        currentStudentId = this.value;
        updateSidebarProfile();
        showToast('Switched profile to ' + getActiveStudent().name, 'info', 2000);
        renderHomeView();
      });
    }

    if (isParentMode) {
      if (parentBanner) parentBanner.style.display = 'flex';
      var parentBannerText = document.getElementById('parentBannerText');
      if (parentBannerText) {
        parentBannerText.textContent = 'Welcome, ' + student.parent_name + '. Monitoring academic growth for Class 10.';
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
      dateSubtitleEl.textContent = dateStr + ' • Class 10 Morning Batch • ' + (DATA.center ? DATA.center.name : 'Stellar Academy');
    }

    // Calculate Attendance % this month (October 2025)
    var studentAtt = (STATE.attendance || []).filter(function (a) {
      return a.student_id === currentStudentId && a.date.indexOf('2025-10') === 0;
    });
    var presentCount = studentAtt.filter(function (a) { return a.status === 'present' || a.status === 'late'; }).length;
    var attPct = studentAtt.length > 0 ? Math.round((presentCount / studentAtt.length) * 100) : 88;

    var attPctEl = document.getElementById('homeAttPct');
    var attBarEl = document.getElementById('homeAttBar');
    if (attPctEl) attPctEl.textContent = attPct + '%';
    if (attBarEl) attBarEl.style.width = attPct + '%';

    // Fee Status
    var pendingFee = (STATE.fees || []).find(function (f) {
      return f.student_id === currentStudentId && f.status === 'pending';
    });
    var homeFeeStatus = document.getElementById('homeFeeStatus');
    var homeFeeLabel = document.getElementById('homeFeeLabel');
    var homeFeeBadge = document.getElementById('homeFeeBadge');

    if (pendingFee) {
      if (homeFeeStatus) homeFeeStatus.textContent = '₹' + pendingFee.amount.toLocaleString();
      if (homeFeeLabel) homeFeeLabel.textContent = pendingFee.month + ' Due';
      if (homeFeeBadge) {
        homeFeeBadge.className = 'badge badge-warning';
        homeFeeBadge.textContent = 'Due ' + pendingFee.due_date;
      }
    } else {
      if (homeFeeStatus) homeFeeStatus.textContent = '₹0';
      if (homeFeeLabel) homeFeeLabel.textContent = 'All Fees Cleared';
      if (homeFeeBadge) {
        homeFeeBadge.className = 'badge badge-success';
        homeFeeBadge.textContent = 'Fully Paid';
      }
    }

    // Streak & Points
    var streakEl = document.getElementById('homeStreak');
    if (streakEl) streakEl.textContent = STATE.streak + ' Days';
    var pointsEl = document.getElementById('homePoints');
    if (pointsEl) pointsEl.textContent = STATE.points.toLocaleString();

    // Today's classes from timetable
    var classesList = document.getElementById('homeClassesList');
    if (classesList) {
      var dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      var todayDay = dayNames[new Date().getDay()];
      if (todayDay === 'Sun') todayDay = 'Mon'; // Sunday fallback for demo

      var todayBadge = document.getElementById('homeTodayDayBadge');
      if (todayBadge) todayBadge.textContent = todayDay + ' Schedule';

      var todaysSchedule = (DATA.timetable || []).filter(function (t) {
        return t.day_of_week === todayDay;
      });

      if (todaysSchedule.length === 0) {
        classesList.innerHTML = '<div class="text-sm text-secondary p-12">No classes scheduled for today. Take time to revise!</div>';
      } else {
        classesList.innerHTML = todaysSchedule.map(function (item, idx) {
          var isDone = idx === 0;
          return (
            '<div style="display:flex; align-items:center; gap:14px; padding:12px 14px; background:var(--surface-muted); border-radius:var(--radius-sm); border-left:3px solid ' + (isDone ? 'var(--accent)' : 'var(--primary)') + '; margin-bottom:8px;">' +
              '<div style="font-size:12px; font-weight:700; color:var(--text-secondary); width:85px; flex-shrink:0;">' + item.start_time + ' - ' + item.end_time + '</div>' +
              '<div style="flex:1;">' +
                '<div style="font-size:14px; font-weight:700; color:var(--text-main);">' + item.subject + ' ' + (isDone ? '<span class="badge badge-success">Completed</span>' : '<span class="badge badge-primary">Next Up</span>') + '</div>' +
                '<div style="font-size:12px; color:var(--text-secondary); margin-top:2px;">' + item.teacher + ' &bull; ' + (item.room || 'Room 101') + '</div>' +
              '</div>' +
            '</div>'
          );
        }).join('');
      }
    }

    // Upcoming Next Test Card
    var nextTestContainer = document.getElementById('homeNextTestContainer');
    if (nextTestContainer) {
      var upcomingTest = (DATA.tests || [])[0] || {
        name: 'Unit Assessment 3',
        subject: 'Maths & Physics',
        date: '2025-10-25',
        total_marks: 50,
        duration_min: 90
      };
      nextTestContainer.innerHTML =
        '<div style="display:flex; justify-content:space-between; align-items:center;">' +
          '<div>' +
            '<h3 class="text-base fw-700">' + upcomingTest.name + '</h3>' +
            '<p class="text-sm text-secondary">' + upcomingTest.subject + ' • ' + upcomingTest.duration_min + ' mins</p>' +
            '<div class="text-xs text-muted" style="margin-top:4px;">Scheduled Date: ' + upcomingTest.date + '</div>' +
          '</div>' +
          '<div style="text-align:right;">' +
            '<span class="badge badge-warning">Max ' + upcomingTest.total_marks + ' Marks</span>' +
          '</div>' +
        '</div>';
    }

    // Subject Syllabus Rings
    var ringsContainer = document.getElementById('homeSubjectRings');
    if (ringsContainer) {
      var subjects = ['Maths', 'Physics', 'Chemistry', 'Biology', 'English'];
      var ringColors = {
        'Maths': '#4F46E5',
        'Physics': '#3B82F6',
        'Chemistry': '#F59E0B',
        'Biology': '#10B981',
        'English': '#EC4899'
      };

      ringsContainer.innerHTML = subjects.map(function (subj) {
        var sylTopics = (STATE.syllabus || []).filter(function (s) { return s.subject === subj; });
        var coveredCount = sylTopics.filter(function (s) { return s.status === 'covered'; }).length;
        var pct = sylTopics.length > 0 ? Math.round((coveredCount / sylTopics.length) * 100) : 60;
        var color = ringColors[subj] || '#4F46E5';

        var radius = 28;
        var circumference = 2 * Math.PI * radius;
        var offset = circumference - (pct / 100) * circumference;

        return (
          '<div class="progress-ring-container">' +
            '<svg width="72" height="72" class="progress-ring" viewBox="0 0 72 72">' +
              '<circle class="progress-ring-bg" cx="36" cy="36" r="' + radius + '" stroke-width="6"/>' +
              '<circle class="progress-ring-fill" cx="36" cy="36" r="' + radius + '" stroke-width="6" ' +
                'stroke="' + color + '" stroke-dasharray="' + circumference + '" stroke-dashoffset="' + offset + '"/>' +
              '<text x="36" y="40" text-anchor="middle" font-size="12" font-weight="700" fill="currentColor" transform="rotate(90 36 36)">' + pct + '%</text>' +
            '</svg>' +
            '<div class="progress-ring-label">' + subj + '</div>' +
          '</div>'
        );
      }).join('');
    }

    // Parent Multi-Child View Render
    if (homeParentChildrenView) {
      if (isParentMode) {
        homeParentChildrenView.classList.add('visible');
        homeParentChildrenView.innerHTML = (DATA.students || []).map(function (child) {
          var isCurrent = child.id === currentStudentId;
          var childFees = (STATE.fees || []).filter(function (f) { return f.student_id === child.id && f.status === 'pending'; });
          var childPending = childFees.length > 0 ? '₹' + childFees[0].amount : 'Paid';

          return (
            '<div class="child-summary-card' + (isCurrent ? ' selected' : '') + '" data-student-id="' + child.id + '" style="' + (isCurrent ? 'border-color:var(--primary); background:var(--primary-subtle);' : '') + '">' +
              '<div style="display:flex; justify-content:space-between; align-items:flex-start;">' +
                '<div class="child-avatar" style="background:' + (child.avatar_bg || 'var(--primary)') + '">' + child.photo_initials + '</div>' +
                (isCurrent ? '<span class="badge badge-primary">Active Profile</span>' : '<span class="badge badge-neutral">Switch</span>') +
              '</div>' +
              '<div class="child-name" style="font-size:16px; font-weight:700; margin-top:8px;">' + child.name + '</div>' +
              '<div class="child-stat-row">' +
                '<span class="text-secondary">Roll Number:</span>' +
                '<span class="fw-700">' + child.roll + '</span>' +
              '</div>' +
              '<div class="child-stat-row">' +
                '<span class="text-secondary">Attendance:</span>' +
                '<span class="fw-700" style="color:var(--accent);">' + (child.id === 'student-1' ? '88%' : '82%') + '</span>' +
              '</div>' +
              '<div class="child-stat-row">' +
                '<span class="text-secondary">Fee Status:</span>' +
                '<span class="fw-700" style="color:' + (childFees.length > 0 ? 'var(--error)' : 'var(--accent)') + ';">' + childPending + '</span>' +
              '</div>' +
              '<div class="child-stat-row">' +
                '<span class="text-secondary">Study Points:</span>' +
                '<span class="fw-700">' + child.points + ' pts</span>' +
              '</div>' +
            '</div>'
          );
        }).join('');

        var cards = homeParentChildrenView.querySelectorAll('.child-summary-card');
        cards.forEach(function (card) {
          card.addEventListener('click', function () {
            var sid = this.getAttribute('data-student-id');
            if (sid) {
              currentStudentId = sid;
              if (childSelect) childSelect.value = sid;
              showToast('Switched view to ' + getActiveStudent().name, 'info', 2000);
              renderHomeView();
            }
          });
        });
      } else {
        homeParentChildrenView.classList.remove('visible');
      }
    }
  }

  // ─── 8. PAGE: ATTENDANCE ───────────────────────────────────────────────────
  function renderAttendanceView() {
    var student = getActiveStudent();
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
    var totalSchoolDays = 0;

    for (var d = 1; d <= daysInMonth; d++) {
      var dateKey = currentYear + '-' + monthStr + '-' + String(d).padStart(2, '0');
      var checkDate = new Date(currentYear, currentMonthIndex, d);
      var isSunday = checkDate.getDay() === 0;

      var dayRecords = (STATE.attendance || []).filter(function (a) {
        return a.student_id === currentStudentId && a.date === dateKey;
      });

      var dayClass = 'cal-day';

      if (isSunday) {
        dayClass += ' cal-day-noclass';
      } else if (dayRecords.length > 0) {
        totalSchoolDays++;
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

    var totalAttended = presentCount + lateCount;
    var monthPct = totalSchoolDays > 0 ? Math.round((totalAttended / totalSchoolDays) * 100) : 0;

    var calSummaryBadge = document.getElementById('calSummaryBadge');
    if (calSummaryBadge) {
      calSummaryBadge.textContent = monthPct + '% Attendance';
    }

    var metricsContainer = document.getElementById('attendanceSummaryMetrics');
    if (metricsContainer) {
      metricsContainer.innerHTML =
        '<h3 class="card-title mb-16">Monthly Statistics</h3>' +
        '<div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:10px; text-align:center;">' +
          '<div style="padding:12px; background:var(--accent-subtle); border-radius:var(--radius-sm); border:1px solid rgba(16,185,129,0.2);">' +
            '<div class="text-2xl fw-800" style="color:var(--accent);">' + presentCount + '</div>' +
            '<div class="text-xs text-muted">Present</div>' +
          '</div>' +
          '<div style="padding:12px; background:var(--warning-bg); border-radius:var(--radius-sm); border:1px solid rgba(245,158,11,0.2);">' +
            '<div class="text-2xl fw-800" style="color:var(--warning);">' + lateCount + '</div>' +
            '<div class="text-xs text-muted">Late</div>' +
          '</div>' +
          '<div style="padding:12px; background:var(--error-bg); border-radius:var(--radius-sm); border:1px solid rgba(239,68,68,0.2);">' +
            '<div class="text-2xl fw-800" style="color:var(--error);">' + absentCount + '</div>' +
            '<div class="text-xs text-muted">Absent</div>' +
          '</div>' +
        '</div>' +
        '<div class="text-xs text-secondary" style="margin-top:14px; text-align:center;">Academic sessions evaluated: ' + totalSchoolDays + '</div>';
    }

    var subjectAttList = document.getElementById('subjectAttList');
    if (subjectAttList) {
      var subjects = ['Maths', 'Physics', 'Chemistry', 'Biology', 'English'];
      subjectAttList.innerHTML = subjects.map(function (subj) {
        var recs = (STATE.attendance || []).filter(function (a) {
          return a.student_id === currentStudentId && a.subject === subj;
        });
        var p = recs.filter(function (a) { return a.status === 'present' || a.status === 'late'; }).length;
        var sPct = recs.length > 0 ? Math.round((p / recs.length) * 100) : 85;

        return (
          '<div class="subject-att-row">' +
            '<div class="subject-att-name">' + subj + '</div>' +
            '<div class="subject-att-bar">' +
              '<div class="progress-bar-track">' +
                '<div class="progress-bar-fill' + (sPct < 75 ? ' error' : sPct < 85 ? ' warning' : ' accent') + '" style="width:' + sPct + '%;"></div>' +
              '</div>' +
            '</div>' +
            '<div class="subject-att-pct">' + sPct + '%</div>' +
          '</div>'
        );
      }).join('');
    }

    var prevBtn = document.getElementById('calPrevMonth');
    var nextBtn = document.getElementById('calNextMonth');

    if (prevBtn) {
      prevBtn.onclick = function () {
        if (currentMonthIndex > 7) {
          currentMonthIndex--;
          renderAttendanceView();
        } else {
          showToast('Demo data covers August to October 2025', 'info', 2000);
        }
      };
    }

    if (nextBtn) {
      nextBtn.onclick = function () {
        if (currentMonthIndex < 9) {
          currentMonthIndex++;
          renderAttendanceView();
        } else {
          showToast('Upcoming November records not yet finalized', 'info', 2000);
        }
      };
    }

    // Simulate QR Scan Check-In
    var qrBtn = document.getElementById('btnQrScan');
    if (qrBtn) {
      qrBtn.onclick = function () {
        var todayStr = currentYear + '-10-17';
        var existing = (STATE.attendance || []).find(function (a) {
          return a.student_id === currentStudentId && a.date === todayStr;
        });

        if (existing) {
          existing.status = 'present';
        } else {
          STATE.attendance.push({
            id: 'att-qr-' + Date.now(),
            student_id: currentStudentId,
            date: todayStr,
            status: 'present',
            subject: 'Maths'
          });
        }

        STATE.points += 10;
        STATE.points_history.unshift({
          id: 'ph-qr-' + Date.now(),
          student_id: currentStudentId,
          date: todayStr,
          action: 'attendance_qr',
          points: 10,
          description: 'QR Code attendance verified on arrival'
        });

        Store.set('vs_attendance', STATE.attendance);
        Store.set('vs_points', STATE.points);
        Store.set('vs_points_history', STATE.points_history);

        showToast('✅ QR Attendance Confirmed! (+10 pts)', 'success', 3500);
        renderAttendanceView();
      };
    }
  }

  // ─── 9. PAGE: FEES & PAYMENTS ──────────────────────────────────────────────
  function renderFeesView() {
    var student = getActiveStudent();
    var tbody = document.getElementById('feesTableBody');
    var pendingDisplay = document.getElementById('feesPendingAmount');
    var pendingNotice = document.getElementById('feesPendingNotice');
    var btnPayPending = document.getElementById('btnPayPending');

    var studentFees = (STATE.fees || []).filter(function (f) {
      return f.student_id === currentStudentId;
    });

    var pendingItem = studentFees.find(function (f) { return f.status === 'pending'; });

    if (pendingDisplay) {
      pendingDisplay.textContent = pendingItem ? '₹' + pendingItem.amount.toLocaleString() : '₹0';
      pendingDisplay.style.color = pendingItem ? 'var(--error)' : 'var(--accent)';
    }

    if (pendingNotice) {
      pendingNotice.textContent = pendingItem
        ? 'Pending for ' + pendingItem.month + ' due by ' + pendingItem.due_date
        : 'All tuition installments are fully settled. No pending dues!';
    }

    if (btnPayPending) {
      if (pendingItem) {
        btnPayPending.disabled = false;
        btnPayPending.onclick = function () {
          openPaymentModal(pendingItem);
        };
      } else {
        btnPayPending.disabled = true;
      }
    }

    if (!tbody) return;

    if (studentFees.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted p-24">No fee records found for this student profile.</td></tr>';
      return;
    }

    tbody.innerHTML = studentFees.map(function (fee) {
      var isPending = fee.status === 'pending';
      var statusBadge = isPending
        ? '<span class="badge badge-error">Pending</span>'
        : '<span class="badge badge-success">Settled</span>';

      return (
        '<tr class="' + (isPending ? 'table-row-highlight' : '') + '">' +
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
    var modalBodyHtml =
      '<div style="text-align:center; padding:10px 0;">' +
        '<div class="badge badge-warning mb-12">Simulated Gateway &bull; Demo Prototype</div>' +
        '<div class="text-xs text-muted uppercase fw-700">Amount Due</div>' +
        '<div class="text-4xl fw-800 mb-16" style="color:var(--primary);">₹' + feeItem.amount.toLocaleString() + '</div>' +
        '<div class="text-sm text-secondary mb-16">Payment for: <strong>' + feeItem.month + '</strong><br>Candidate: ' + student.name + ' (' + student.roll + ')</div>' +
        '<div style="background:var(--surface-muted); border-radius:var(--radius-md); padding:16px; margin-bottom:16px; text-align:left; border:1px solid var(--border);">' +
          '<div class="text-xs fw-700 text-muted uppercase mb-8">Choose Simulated Payment Mode:</div>' +
          '<label style="display:flex; align-items:center; gap:10px; margin-bottom:10px; cursor:pointer; font-size:14px; font-weight:600;">' +
            '<input type="radio" name="mockPayMode" value="Instant UPI" checked> Instant UPI (Google Pay / PhonePe / Paytm)' +
          '</label>' +
          '<label style="display:flex; align-items:center; gap:10px; margin-bottom:10px; cursor:pointer; font-size:14px; font-weight:600;">' +
            '<input type="radio" name="mockPayMode" value="Net Banking"> Net Banking / IMPS Direct' +
          '</label>' +
          '<label style="display:flex; align-items:center; gap:10px; cursor:pointer; font-size:14px; font-weight:600;">' +
            '<input type="radio" name="mockPayMode" value="Credit/Debit Card"> Debit / Credit Card' +
          '</label>' +
        '</div>' +
        '<p class="text-xs text-muted">Clicking "Authorize Payment" will immediately update the local fee ledger and generate an official coaching receipt voucher.</p>' +
      '</div>';

    var modalFooterHtml =
      '<button type="button" class="btn btn-secondary" id="btnCancelModal">Cancel</button>' +
      '<button type="button" class="btn btn-accent btn-lg" id="btnConfirmMockPay">Authorize Payment (₹' + feeItem.amount.toLocaleString() + ')</button>';

    openModal({
      title: 'Tuition Fee Settlement',
      body: modalBodyHtml,
      footer: modalFooterHtml,
      onReady: function (overlay, closeModal) {
        var cancelBtn = overlay.querySelector('#btnCancelModal');
        if (cancelBtn) cancelBtn.onclick = closeModal;

        var confirmBtn = overlay.querySelector('#btnConfirmMockPay');
        if (confirmBtn) {
          confirmBtn.onclick = function () {
            var selectedMode = 'Instant UPI';
            var checkedRadio = overlay.querySelector('input[name="mockPayMode"]:checked');
            if (checkedRadio) selectedMode = checkedRadio.value;

            var receiptNo = 'RCP-2025-' + Math.floor(100 + Math.random() * 900);
            var nowStr = new Date().toISOString().split('T')[0];

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
              description: 'Tuition fee cleared for ' + feeItem.month
            });

            Store.set('vs_fees', STATE.fees);
            Store.set('vs_points', STATE.points);
            Store.set('vs_points_history', STATE.points_history);

            closeModal();
            showToast('🎉 Fee payment of ₹' + feeItem.amount + ' verified! (+40 pts)', 'success', 4000);
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
    var receiptBodyHtml =
      '<div style="background:#FFFFFF; color:#0F172A; padding:22px; border-radius:var(--radius-md); border:1px solid #CBD5E1; font-family:var(--font-sans);">' +
        '<div style="text-align:center; border-bottom:1.5px dashed #94A3B8; padding-bottom:14px; margin-bottom:14px;">' +
          '<div style="font-weight:800; font-size:1.2rem; color:var(--primary);">' + (DATA.center ? DATA.center.name : 'Stellar Academy') + '</div>' +
          '<div style="font-size:0.8rem; color:#64748B;">Official Coaching Fee Receipt Voucher</div>' +
          '<div style="font-size:0.75rem; color:#64748B;">' + (DATA.center ? DATA.center.address : '') + '</div>' +
        '</div>' +
        '<table style="width:100%; font-size:0.85rem; margin-bottom:14px;">' +
          '<tr><td style="color:#64748B; width:130px;">Receipt Voucher:</td><td class="fw-700"><code>' + feeItem.receipt_no + '</code></td></tr>' +
          '<tr><td style="color:#64748B;">Payment Date:</td><td>' + (feeItem.paid_date || feeItem.due_date) + '</td></tr>' +
          '<tr><td style="color:#64748B;">Candidate:</td><td class="fw-700">' + student.name + ' (' + student.roll + ')</td></tr>' +
          '<tr><td style="color:#64748B;">Course/Batch:</td><td>Class 10 Morning Batch</td></tr>' +
          '<tr><td style="color:#64748B;">Tuition Month:</td><td>' + feeItem.month + '</td></tr>' +
          '<tr><td style="color:#64748B;">Authorized Mode:</td><td>' + (feeItem.mode || 'Instant UPI') + '</td></tr>' +
          '<tr><td style="color:#64748B; font-weight:700; border-top:1px solid #E2E8F0; padding-top:8px;">Amount Received:</td><td style="font-weight:800; color:#10B981; font-size:1.15rem; border-top:1px solid #E2E8F0; padding-top:8px;">₹' + feeItem.amount.toLocaleString() + '</td></tr>' +
        '</table>' +
        '<div style="text-align:center; padding:8px; background:#ECFDF5; border-radius:4px; color:#065F46; font-size:0.75rem; font-weight:700;">' +
          'STATUS: PAYMENT VERIFIED &bull; OFFICIAL LEDGER STORED' +
        '</div>' +
        '<div style="text-align:center; font-size:0.65rem; color:#94A3B8; margin-top:12px;">' +
          'Simulated digital fee voucher generated by Vilarci Study portal.' +
        '</div>' +
      '</div>';

    openModal({
      title: 'Fee Receipt Voucher',
      body: receiptBodyHtml,
      footer: '<button type="button" class="btn btn-secondary" onclick="window.print()">Print Voucher</button>'
    });
  }

  // ─── 10. PAGE: TIMETABLE & SYLLABUS ────────────────────────────────────────
  function renderTimetableView() {
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

    var ttBody = document.getElementById('timetableGridBody');
    if (ttBody) {
      var timeSlots = [
        { label: '09:00 - 10:00 AM', slot: '09:00' },
        { label: '10:00 - 11:00 AM', slot: '10:00' }
      ];
      var days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

      ttBody.innerHTML = timeSlots.map(function (ts) {
        var rowHtml = '<tr><td class="fw-700 text-xs">' + ts.label + '</td>';
        days.forEach(function (day) {
          var entry = (DATA.timetable || []).find(function (t) {
            return t.day_of_week === day && t.start_time === ts.slot;
          });

          if (entry) {
            var sClass = 'tt-' + entry.subject.toLowerCase();
            rowHtml +=
              '<td>' +
                '<span class="tt-cell ' + sClass + '">' + entry.subject + '</span>' +
                '<div class="text-xs text-muted" style="margin-top:4px;">' + entry.teacher.split(' ').pop() + '</div>' +
              '</td>';
          } else {
            rowHtml += '<td><span class="tt-empty">—</span></td>';
          }
        });
        rowHtml += '</tr>';
        return rowHtml;
      }).join('');
    }

    renderSyllabusSection('all');

    var filterContainer = document.getElementById('syllabusSubjectFilter');
    if (filterContainer) {
      var chips = filterContainer.querySelectorAll('.chip');
      chips.forEach(function (chip) {
        chip.onclick = function () {
          chips.forEach(function (c) { c.classList.remove('active'); });
          this.classList.add('active');
          var subj = this.getAttribute('data-subject');
          renderSyllabusSection(subj);
        };
      });
    }
  }

  function renderSyllabusSection(selectedSubject) {
    var container = document.getElementById('syllabusContainer');
    if (!container) return;

    var subjects = ['Maths', 'Physics', 'Chemistry', 'Biology', 'English'];
    if (selectedSubject !== 'all') {
      subjects = [selectedSubject];
    }

    container.innerHTML = subjects.map(function (subj) {
      var topics = (STATE.syllabus || []).filter(function (s) { return s.subject === subj; });
      var coveredCount = topics.filter(function (s) { return s.status === 'covered'; }).length;
      var completionPct = topics.length > 0 ? Math.round((coveredCount / topics.length) * 100) : 0;

      return (
        '<div class="syllabus-subject-section card mb-20">' +
          '<div class="card-header">' +
            '<div>' +
              '<h3 class="card-title">' + subj + '</h3>' +
              '<span class="text-xs text-muted">' + coveredCount + ' of ' + topics.length + ' syllabus modules completed</span>' +
            '</div>' +
            '<span class="badge badge-primary">' + completionPct + '% Done</span>' +
          '</div>' +
          '<div class="card-body">' +
            '<div class="progress-bar-track mb-16">' +
              '<div class="progress-bar-fill accent" style="width:' + completionPct + '%;"></div>' +
            '</div>' +
            '<div class="syllabus-topics-list">' +
              topics.map(function (t) {
                var statusBadge = '';
                if (t.status === 'covered') statusBadge = '<span class="badge badge-success">Covered</span>';
                else if (t.status === 'partial') statusBadge = '<span class="badge badge-warning">Partial</span>';
                else if (t.status === 'skipped') statusBadge = '<span class="badge badge-error">Skipped</span>';
                else statusBadge = '<span class="badge badge-neutral">Upcoming</span>';

                var revisedClass = t.revised_by_student ? ' revised' : '';
                var revisedText = t.revised_by_student ? '✓ Revised' : 'Mark Revised';

                return (
                  '<div class="syllabus-topic-item ' + t.status + '">' +
                    '<div style="flex:1;">' +
                      '<div class="fw-700 text-sm">' + t.topic + ' ' + statusBadge + '</div>' +
                      '<div class="text-xs text-muted" style="margin-top:2px;">' + t.chapter + ' &bull; Scheduled: ' + t.planned_date + '</div>' +
                    '</div>' +
                    '<button type="button" class="revise-btn' + revisedClass + '" data-topic-id="' + t.id + '">' +
                      revisedText +
                    '</button>' +
                  '</div>'
                );
              }).join('') +
            '</div>' +
          '</div>' +
        '</div>'
      );
    }).join('');

    var reviseBtns = container.querySelectorAll('.revise-btn');
    reviseBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var tid = this.getAttribute('data-topic-id');
        var topic = (STATE.syllabus || []).find(function (s) { return s.id === tid; });
        if (topic) {
          topic.revised_by_student = !topic.revised_by_student;
          if (topic.revised_by_student) {
            STATE.points += 15;
            STATE.points_history.unshift({
              id: 'ph-rev-' + Date.now(),
              student_id: currentStudentId,
              date: new Date().toISOString().split('T')[0],
              action: 'topic_revised',
              points: 15,
              description: 'Self-revision confirmed: ' + topic.topic
            });
            showToast('Self-revision marked! (+15 pts)', 'success', 2500);
          } else {
            showToast('Revision checkmark removed', 'info', 1800);
          }

          Store.set('vs_syllabus', STATE.syllabus);
          Store.set('vs_points', STATE.points);
          Store.set('vs_points_history', STATE.points_history);
          renderSyllabusSection(selectedSubject);
        }
      });
    });
  }

  // ─── 11. PAGE: FOCUS STUDY ─────────────────────────────────────────────────
  function extractYouTubeId(url) {
    if (!url) return null;
    var trimmed = url.trim();
    var match = trimmed.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
    return (match && match[1]) ? match[1] : null;
  }

  function renderFocusView() {
    var form = document.getElementById('focusUrlForm');
    var input = document.getElementById('focusUrlInput');
    var errorSpan = document.getElementById('focusUrlError');
    var layout = document.getElementById('focusMainLayout');
    var iframe = document.getElementById('focusVideoIframe');
    var sampleBtn = document.getElementById('btnFocusSampleVideo');
    var notesArea = document.getElementById('focusNotesArea');
    var notesSaved = document.getElementById('notesSavedIndicator');

    if (notesArea) {
      var savedNote = (STATE.video_notes || {})[currentFocusVideoId] || '';
      notesArea.value = savedNote;

      var debounceTimer = null;
      notesArea.oninput = function () {
        if (notesSaved) {
          notesSaved.textContent = 'Saving...';
          notesSaved.classList.remove('saved');
        }
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(function () {
          STATE.video_notes = STATE.video_notes || {};
          STATE.video_notes[currentFocusVideoId] = notesArea.value;
          Store.set('vs_video_notes', STATE.video_notes);
          if (notesSaved) {
            notesSaved.textContent = 'Autosaved';
            notesSaved.classList.add('saved');
          }
        }, 500);
      };
    }

    function loadVideoById(vid) {
      currentFocusVideoId = vid;
      if (iframe) {
        iframe.src = 'https://www.youtube-nocookie.com/embed/' + vid + '?rel=0&autoplay=0';
      }
      if (layout) layout.classList.add('visible');
      if (errorSpan) errorSpan.classList.remove('visible');
      if (notesArea) {
        notesArea.value = (STATE.video_notes || {})[vid] || '';
      }
      showToast('Loaded distraction-free lecture player', 'info', 2000);
    }

    if (form) {
      form.onsubmit = function (e) {
        e.preventDefault();
        var val = input ? input.value : '';
        var vid = extractYouTubeId(val);
        if (vid) {
          loadVideoById(vid);
        } else {
          if (errorSpan) errorSpan.classList.add('visible');
          showToast('Invalid YouTube URL format.', 'error', 3000);
        }
      };
    }

    if (sampleBtn) {
      sampleBtn.onclick = function () {
        if (input) input.value = 'https://www.youtube.com/watch?v=IWigcMGGMIs';
        loadVideoById('IWigcMGGMIs');
      };
    }

    if (layout && !iframe.src && currentFocusVideoId) {
      iframe.src = 'https://www.youtube-nocookie.com/embed/' + currentFocusVideoId + '?rel=0&autoplay=0';
      layout.classList.add('visible');
    }

    var markDoneBtn = document.getElementById('btnFocusMarkTopicDone');
    if (markDoneBtn) {
      markDoneBtn.onclick = function () {
        STATE.points += 20;
        STATE.points_history.unshift({
          id: 'ph-foc-' + Date.now(),
          student_id: currentStudentId,
          date: new Date().toISOString().split('T')[0],
          action: 'focus_study',
          points: 20,
          description: 'Focus lecture topic completed'
        });
        Store.set('vs_points', STATE.points);
        Store.set('vs_points_history', STATE.points_history);
        showToast('🎯 Focus Topic Marked Done! (+20 pts)', 'success', 3000);
      };
    }

    setupFocusTimer();
  }

  function setupFocusTimer() {
    var display = document.getElementById('focusTimerDisplay');
    var startBtn = document.getElementById('btnStartPauseTimer');
    var resetBtn = document.getElementById('btnResetTimer');
    var completeMsg = document.getElementById('timerCompleteMsg');
    var presetBtns = document.querySelectorAll('.timer-preset-btn');
    var customMinInput = document.getElementById('customTimerMin');
    var applyCustomBtn = document.getElementById('btnApplyCustomTimer');

    function updateDisplay() {
      if (!display) return;
      var m = Math.floor(timerRemainingSeconds / 60);
      var s = timerRemainingSeconds % 60;
      display.textContent = String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
    }

    updateDisplay();

    presetBtns.forEach(function (btn) {
      btn.onclick = function () {
        presetBtns.forEach(function (b) { b.classList.remove('selected'); });
        this.classList.add('selected');
        var mins = parseInt(this.getAttribute('data-mins'), 10) || 25;
        clearInterval(timerInterval);
        timerIsRunning = false;
        timerRemainingSeconds = mins * 60;
        if (startBtn) startBtn.textContent = 'Start Timer';
        if (display) display.classList.remove('running', 'done');
        if (completeMsg) completeMsg.classList.remove('visible');
        updateDisplay();
      };
    });

    if (applyCustomBtn && customMinInput) {
      applyCustomBtn.onclick = function () {
        var val = parseInt(customMinInput.value, 10);
        if (val && val > 0 && val <= 180) {
          presetBtns.forEach(function (b) { b.classList.remove('selected'); });
          clearInterval(timerInterval);
          timerIsRunning = false;
          timerRemainingSeconds = val * 60;
          if (startBtn) startBtn.textContent = 'Start Timer';
          if (display) display.classList.remove('running', 'done');
          if (completeMsg) completeMsg.classList.remove('visible');
          updateDisplay();
          showToast('Focus timer set to ' + val + ' minutes', 'info', 2000);
        } else {
          showToast('Enter valid minutes between 1 and 180', 'error', 2500);
        }
      };
    }

    if (startBtn) {
      startBtn.onclick = function () {
        if (timerIsRunning) {
          clearInterval(timerInterval);
          timerIsRunning = false;
          startBtn.textContent = 'Resume';
          if (display) display.classList.remove('running');
        } else {
          timerIsRunning = true;
          startBtn.textContent = 'Pause';
          if (display) display.classList.add('running');
          if (completeMsg) completeMsg.classList.remove('visible');

          timerInterval = setInterval(function () {
            if (timerRemainingSeconds > 0) {
              timerRemainingSeconds--;
              updateDisplay();
            } else {
              clearInterval(timerInterval);
              timerIsRunning = false;
              startBtn.textContent = 'Start Timer';
              if (display) {
                display.classList.remove('running');
                display.classList.add('done');
              }
              if (completeMsg) completeMsg.classList.add('visible');

              STATE.points += 50;
              STATE.streak += 1;
              STATE.focus_sessions.push({
                id: 'fs-' + Date.now(),
                student_id: currentStudentId,
                date: new Date().toISOString(),
                duration_mins: 25
              });
              STATE.points_history.unshift({
                id: 'ph-foc-comp-' + Date.now(),
                student_id: currentStudentId,
                date: new Date().toISOString().split('T')[0],
                action: 'focus_completed',
                points: 50,
                description: 'Full focus timer study sprint completed'
              });

              Store.set('vs_points', STATE.points);
              Store.set('vs_streak', STATE.streak);
              Store.set('vs_focus_sessions', STATE.focus_sessions);
              Store.set('vs_points_history', STATE.points_history);

              showToast('🏆 Focus session complete! +50 Points awarded!', 'success', 5000);
            }
          }, 1000);
        }
      };
    }

    if (resetBtn) {
      resetBtn.onclick = function () {
        clearInterval(timerInterval);
        timerIsRunning = false;
        timerRemainingSeconds = 25 * 60;
        if (startBtn) startBtn.textContent = 'Start Timer';
        if (display) display.classList.remove('running', 'done');
        if (completeMsg) completeMsg.classList.remove('visible');
        updateDisplay();
      };
    }
  }

  // ─── 12. PAGE: LABS & SIMULATIONS ──────────────────────────────────────────
  function renderLabsView() {
    var grid = document.getElementById('simGrid');
    var viewer = document.getElementById('simViewer');
    var iframe = document.getElementById('simIframe');
    var fallback = document.getElementById('simFallback');
    var backBtn = document.getElementById('btnBackFromSim');
    var viewerTitle = document.getElementById('simViewerTitle');
    var externalLink = document.getElementById('simExternalLink');
    var fallbackBtn = document.getElementById('simFallbackBtn');
    var filterContainer = document.getElementById('labsSubjectFilter');

    function renderSimCards(filterSubject) {
      if (!grid) return;
      var sims = (DATA.simulations || []);
      if (filterSubject && filterSubject !== 'all') {
        sims = sims.filter(function (s) { return s.subject === filterSubject; });
      }

      grid.innerHTML = sims.map(function (s) {
        return (
          '<div class="sim-card" data-sim-id="' + s.id + '">' +
            '<div class="sim-emoji">' + s.thumbnail_emoji + '</div>' +
            '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">' +
              '<span class="badge badge-primary">' + s.subject + '</span>' +
              '<span class="text-xs text-muted">Class ' + s.class + '</span>' +
            '</div>' +
            '<h3 class="sim-title">' + s.title + '</h3>' +
            '<p class="sim-desc">' + s.description + '</p>' +
            '<button type="button" class="btn btn-sm btn-secondary w-full">Launch Simulation &rarr;</button>' +
          '</div>'
        );
      }).join('');

      var cards = grid.querySelectorAll('.sim-card');
      cards.forEach(function (card) {
        card.addEventListener('click', function () {
          var sid = this.getAttribute('data-sim-id');
          var sim = (DATA.simulations || []).find(function (s) { return s.id === sid; });
          if (sim) launchSim(sim);
        });
      });
    }

    function launchSim(sim) {
      if (grid) grid.style.display = 'none';
      if (viewer) viewer.classList.add('active');
      if (viewerTitle) viewerTitle.textContent = sim.title + ' (' + sim.subject + ')';
      if (externalLink) externalLink.href = sim.phet_url;
      if (fallbackBtn) fallbackBtn.href = sim.phet_url;
      if (fallback) fallback.classList.remove('visible');

      if (iframe) {
        iframe.src = sim.phet_url;

        var loadTimeout = setTimeout(function () {
          try {
            if (!iframe.contentWindow || iframe.contentWindow.location.href === 'about:blank') {
              if (fallback) fallback.classList.add('visible');
            }
          } catch (e) {}
        }, 6000);

        iframe.onload = function () {
          clearTimeout(loadTimeout);
        };

        iframe.onerror = function () {
          clearTimeout(loadTimeout);
          if (fallback) fallback.classList.add('visible');
        };
      }
    }

    if (backBtn) {
      backBtn.onclick = function () {
        if (viewer) viewer.classList.remove('active');
        if (grid) grid.style.display = 'grid';
        if (iframe) iframe.src = '';
      };
    }

    if (filterContainer) {
      var chips = filterContainer.querySelectorAll('.chip');
      chips.forEach(function (chip) {
        chip.onclick = function () {
          chips.forEach(function (c) { c.classList.remove('active'); });
          this.classList.add('active');
          var subj = this.getAttribute('data-subject');
          renderSimCards(subj);
        };
      });
    }

    renderSimCards('all');
  }

  // ─── 13. PAGE: VIDEO LIBRARY ───────────────────────────────────────────────
  function renderVideosView() {
    var grid = document.getElementById('videoCardsGrid');
    var activeContainer = document.getElementById('videoActivePlayerContainer');
    var activeIframe = document.getElementById('videoActiveIframe');
    var activeTitle = document.getElementById('videoActiveTitle');
    var closeActiveBtn = document.getElementById('btnCloseActiveVideo');
    var filterContainer = document.getElementById('videoSubjectFilter');

    function renderVideoList(subjectFilter) {
      if (!grid) return;
      var vids = DATA.videos || [];
      if (subjectFilter && subjectFilter !== 'all') {
        vids = vids.filter(function (v) { return v.subject === subjectFilter; });
      }

      var subjectEmojis = {
        'Maths': '📐',
        'Physics': '⚡',
        'Chemistry': '🧪',
        'Biology': '🧬',
        'English': '📖'
      };

      grid.innerHTML = vids.map(function (v) {
        var emoji = subjectEmojis[v.subject] || '🎓';
        return (
          '<div class="video-card" data-video-id="' + v.youtube_id + '" data-video-title="' + v.title + '">' +
            '<div class="video-thumb">' +
              emoji +
              '<div class="video-play-btn">' +
                '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>' +
              '</div>' +
            '</div>' +
            '<div class="video-info">' +
              '<div style="display:flex; justify-content:space-between; margin-bottom:4px;">' +
                '<span class="badge badge-primary">' + v.subject + '</span>' +
                '<span class="text-xs text-muted">' + v.duration + '</span>' +
              '</div>' +
              '<h3 class="video-title">' + v.title + '</h3>' +
              '<div class="video-meta">' + v.chapter + '</div>' +
            '</div>' +
          '</div>'
        );
      }).join('');

      var cards = grid.querySelectorAll('.video-card');
      cards.forEach(function (card) {
        card.addEventListener('click', function () {
          var yid = this.getAttribute('data-video-id');
          var title = this.getAttribute('data-video-title');
          if (activeContainer && activeIframe) {
            activeIframe.src = 'https://www.youtube-nocookie.com/embed/' + yid + '?rel=0&autoplay=1';
            if (activeTitle) activeTitle.textContent = title;
            activeContainer.style.display = 'block';
            window.scrollTo({ top: activeContainer.offsetTop - 80, behavior: 'smooth' });
          }
        });
      });
    }

    if (closeActiveBtn && activeContainer && activeIframe) {
      closeActiveBtn.onclick = function () {
        activeIframe.src = '';
        activeContainer.style.display = 'none';
      };
    }

    if (filterContainer) {
      var chips = filterContainer.querySelectorAll('.chip');
      chips.forEach(function (chip) {
        chip.onclick = function () {
          chips.forEach(function (c) { c.classList.remove('active'); });
          this.classList.add('active');
          var subj = this.getAttribute('data-subject');
          renderVideoList(subj);
        };
      });
    }

    renderVideoList('all');
  }

  // ─── 14. PAGE: TESTS & SCORES ──────────────────────────────────────────────
  function renderTestsView() {
    var tabBtnReports = document.getElementById('tabBtnTestReports');
    var tabBtnQuiz = document.getElementById('tabBtnTakeQuiz');
    var panelReports = document.getElementById('panelTestReports');
    var panelQuiz = document.getElementById('panelTakeQuiz');

    if (tabBtnReports && tabBtnQuiz && panelReports && panelQuiz) {
      tabBtnReports.onclick = function () {
        tabBtnReports.classList.add('active');
        tabBtnQuiz.classList.remove('active');
        panelReports.classList.add('active');
        panelQuiz.classList.remove('active');
      };
      tabBtnQuiz.onclick = function () {
        tabBtnQuiz.classList.add('active');
        tabBtnReports.classList.remove('active');
        panelQuiz.classList.add('active');
        panelReports.classList.remove('active');
      };
    }

    var listContainer = document.getElementById('testsListContainer');
    if (listContainer) {
      var tests = (STATE.tests || []).filter(function (t) {
        return t.student_id === currentStudentId;
      });

      if (tests.length === 0) {
        listContainer.innerHTML = '<div class="text-sm text-secondary p-12">No assessment scores recorded yet.</div>';
      } else {
        listContainer.innerHTML = tests.map(function (test) {
          var pct = Math.round((test.marks_obtained / test.total_marks) * 100);
          var badgeClass = pct >= 80 ? 'badge-success' : pct >= 60 ? 'badge-warning' : 'badge-error';
          var grade = pct >= 85 ? 'A+' : pct >= 75 ? 'A' : pct >= 60 ? 'B' : 'C';

          return (
            '<div class="test-card">' +
              '<div class="test-card-info">' +
                '<div class="test-card-name">' + test.name + ' <span class="badge ' + badgeClass + '">' + grade + '</span></div>' +
                '<div class="test-card-meta">' + test.subject + ' &bull; ' + test.date + ' &bull; ' + test.duration_min + ' mins</div>' +
              '</div>' +
              '<div class="test-card-score">' +
                '<div class="test-score-value">' + test.marks_obtained + ' <span class="text-xs text-muted">/ ' + test.total_marks + '</span></div>' +
                '<div class="text-xs fw-700" style="color:var(--primary);">' + pct + '% Score</div>' +
              '</div>' +
            '</div>'
          );
        }).join('');
      }
    }

    var weakContainer = document.getElementById('weakTopicsList');
    if (weakContainer) {
      var allWeak = [];
      (STATE.tests || []).forEach(function (t) {
        if (t.student_id === currentStudentId && t.weak_topics) {
          allWeak = allWeak.concat(t.weak_topics);
        }
      });
      var uniqueWeak = allWeak.filter(function (item, pos) { return allWeak.indexOf(item) === pos; });
      if (uniqueWeak.length === 0) uniqueWeak = ['Snell\'s Law', 'Division Algorithm', 'pH Scale Calculations', 'Precipitation Balancing'];

      weakContainer.innerHTML = uniqueWeak.map(function (topic) {
        return '<span class="weak-topic-chip">⚠️ ' + topic + '</span>';
      }).join('');
    }

    drawScoresChart();
    setupQuizFlow();
  }

  function drawScoresChart() {
    var chartContainer = document.getElementById('chartContainer');
    if (!chartContainer) return;

    var subjects = ['Maths', 'Physics', 'Chemistry', 'Biology', 'English'];
    var scores = [88, 72, 85, 87, 80];

    var svgWidth = 460;
    var svgHeight = 220;
    var paddingLeft = 45;
    var paddingBottom = 35;
    var chartW = svgWidth - paddingLeft - 20;
    var chartH = svgHeight - paddingBottom - 20;

    var barWidth = 44;
    var barGap = (chartW - (barWidth * subjects.length)) / (subjects.length + 1);

    var barsHtml = '';
    [0, 50, 100].forEach(function (yVal) {
      var yPos = chartH - (yVal / 100 * chartH) + 15;
      barsHtml +=
        '<line x1="' + paddingLeft + '" y1="' + yPos + '" x2="' + (svgWidth - 20) + '" y2="' + yPos + '" stroke="var(--border)" stroke-dasharray="3,3" />' +
        '<text x="' + (paddingLeft - 8) + '" y="' + (yPos + 4) + '" text-anchor="end" font-size="10" fill="var(--text-muted)">' + yVal + '%</text>';
    });

    subjects.forEach(function (subj, i) {
      var score = scores[i] || 75;
      var h = (score / 100) * chartH;
      var x = paddingLeft + barGap + i * (barWidth + barGap);
      var y = chartH - h + 15;
      var barColor = score >= 85 ? 'var(--accent)' : score >= 75 ? 'var(--primary)' : 'var(--warning)';

      barsHtml +=
        '<rect x="' + x + '" y="' + y + '" width="' + barWidth + '" height="' + h + '" rx="5" fill="' + barColor + '"/>' +
        '<text x="' + (x + barWidth / 2) + '" y="' + (y - 6) + '" text-anchor="middle" font-size="11" font-weight="800" fill="var(--text-main)">' + score + '%</text>' +
        '<text x="' + (x + barWidth / 2) + '" y="' + (svgHeight - 10) + '" text-anchor="middle" font-size="11" font-weight="600" fill="var(--text-secondary)">' + subj.substring(0, 4) + '</text>';
    });

    chartContainer.innerHTML =
      '<svg viewBox="0 0 ' + svgWidth + ' ' + svgHeight + '" preserveAspectRatio="xMidYMid meet" style="width:100%; height:auto;">' +
        barsHtml +
      '</svg>';
  }

  function setupQuizFlow() {
    var mcqs = DATA.mcqs || [];
    var qNum = document.getElementById('quizQuestionNum');
    var pBar = document.getElementById('quizProgressBar');
    var badge = document.getElementById('quizSubjectBadge');
    var qText = document.getElementById('quizQuestionText');
    var optContainer = document.getElementById('quizOptionsContainer');
    var explBox = document.getElementById('quizExplanation');
    var nextBtn = document.getElementById('btnNextQuizQuestion');
    var activeView = document.getElementById('quizActiveView');
    var resultView = document.getElementById('quizResultView');
    var resultScore = document.getElementById('quizResultScore');
    var restartBtn = document.getElementById('btnRestartQuiz');

    if (!qText || mcqs.length === 0) return;

    function renderQuestion(index) {
      activeQuizIndex = index;
      quizAnswered = false;
      var q = mcqs[index];

      if (qNum) qNum.textContent = 'Question ' + (index + 1) + ' of ' + mcqs.length;
      if (pBar) pBar.style.width = (((index + 1) / mcqs.length) * 100) + '%';
      if (badge) badge.textContent = q.subject;
      if (qText) qText.textContent = q.question;
      if (explBox) explBox.classList.remove('visible');
      if (nextBtn) nextBtn.disabled = true;

      if (optContainer) {
        optContainer.innerHTML = Object.keys(q.options).map(function (key) {
          return (
            '<button type="button" class="quiz-option" data-opt-key="' + key + '">' +
              '<span class="fw-800" style="width:22px; text-transform:uppercase;">' + key + '.</span> ' +
              q.options[key] +
            '</button>'
          );
        }).join('');

        var optBtns = optContainer.querySelectorAll('.quiz-option');
        optBtns.forEach(function (btn) {
          btn.addEventListener('click', function () {
            if (quizAnswered) return;
            quizAnswered = true;
            var chosenKey = this.getAttribute('data-opt-key');
            var isCorrect = chosenKey === q.correct;

            if (isCorrect) {
              this.classList.add('correct');
              quizScore++;
              showToast('Correct answer! 🌟', 'success', 1500);
            } else {
              this.classList.add('wrong');
              var correctBtn = optContainer.querySelector('.quiz-option[data-opt-key="' + q.correct + '"]');
              if (correctBtn) correctBtn.classList.add('correct');
              showToast('Incorrect', 'error', 1500);
            }

            if (explBox) {
              explBox.textContent = 'Explanation: ' + q.explanation;
              explBox.classList.add('visible');
            }

            if (nextBtn) nextBtn.disabled = false;
          });
        });
      }
    }

    if (nextBtn) {
      nextBtn.onclick = function () {
        if (activeQuizIndex < mcqs.length - 1) {
          renderQuestion(activeQuizIndex + 1);
        } else {
          if (activeView) activeView.style.display = 'none';
          if (resultView) resultView.classList.add('visible');
          if (resultScore) resultScore.textContent = quizScore + ' / ' + mcqs.length;

          var ptsAwarded = quizScore * 10 + 10;
          STATE.points += ptsAwarded;
          STATE.points_history.unshift({
            id: 'ph-quiz-' + Date.now(),
            student_id: currentStudentId,
            date: new Date().toISOString().split('T')[0],
            action: 'quiz_completed',
            points: ptsAwarded,
            description: 'Practice quiz completed: ' + quizScore + '/' + mcqs.length + ' correct'
          });

          Store.set('vs_points', STATE.points);
          Store.set('vs_points_history', STATE.points_history);
          showToast('Assessment results recorded! (+' + ptsAwarded + ' pts)', 'success', 3500);
        }
      };
    }

    if (restartBtn) {
      restartBtn.onclick = function () {
        quizScore = 0;
        if (resultView) resultView.classList.remove('visible');
        if (activeView) activeView.style.display = 'block';
        renderQuestion(0);
      };
    }

    renderQuestion(0);
  }

  // ─── 15. PAGE: POINTS & REWARDS ────────────────────────────────────────────
  function renderPointsView() {
    var bigTotal = document.getElementById('pointsBigTotal');
    var bigStreak = document.getElementById('pointsBigStreak');
    var rankDisp = document.getElementById('pointsRankDisplay');
    var badgesGrid = document.getElementById('badgesContainer');
    var lbList = document.getElementById('leaderboardList');
    var phList = document.getElementById('pointsHistoryList');
    var toggleRank = document.getElementById('toggleShowRank');

    if (bigTotal) bigTotal.textContent = STATE.points.toLocaleString();
    if (bigStreak) bigStreak.textContent = STATE.streak + ' Days 🔥';
    if (rankDisp) rankDisp.textContent = '#7';

    if (badgesGrid) {
      badgesGrid.innerHTML = (STATE.badges || []).map(function (b) {
        var cls = b.earned ? 'badge-award-card earned' : 'badge-award-card unearned';
        return (
          '<div class="' + cls + '">' +
            '<div class="badge-award-emoji">' + b.icon_emoji + '</div>' +
            '<div class="badge-award-name">' + b.name + '</div>' +
            '<div class="badge-award-desc">' + b.description + '</div>' +
            (b.earned ? '<span class="badge badge-accent mt-8" style="font-size:9px;">Unlocked</span>' : '<span class="badge badge-neutral mt-8" style="font-size:9px;">Locked</span>') +
          '</div>'
        );
      }).join('');
    }

    function renderLeaderboard(showSelf) {
      if (!lbList) return;
      var raw = STATE.leaderboard || [];
      var top5 = raw.slice(0, 5);
      var selfEntry = raw.find(function (item) { return item.is_self; }) || {
        rank: 7, student_name: getActiveStudent().name, points: STATE.points, badge: '⭐', is_self: true
      };

      var entriesToDisplay = [].concat(top5);
      if (showSelf && selfEntry.rank > 5) {
        entriesToDisplay.push(selfEntry);
      }

      lbList.innerHTML = entriesToDisplay.map(function (entry) {
        var rClass = entry.rank === 1 ? 'rank-1' : entry.rank === 2 ? 'rank-2' : entry.rank === 3 ? 'rank-3' : 'rank-other';
        var isSelf = entry.is_self;

        return (
          '<div class="leaderboard-item' + (isSelf ? ' self' : '') + '">' +
            '<div class="rank-badge ' + rClass + '">' + entry.rank + '</div>' +
            '<div class="leaderboard-name">' +
              entry.student_name + ' ' + (isSelf ? '<span class="badge badge-primary">You</span>' : '') +
            '</div>' +
            '<div class="leaderboard-points">' + (isSelf ? STATE.points : entry.points).toLocaleString() + ' pts</div>' +
          '</div>'
        );
      }).join('');
    }

    renderLeaderboard(toggleRank ? toggleRank.checked : true);

    if (toggleRank) {
      toggleRank.onchange = function () {
        renderLeaderboard(this.checked);
      };
    }

    if (phList) {
      var history = STATE.points_history || [];
      if (history.length === 0) {
        phList.innerHTML = '<div class="text-sm text-secondary p-12">No point activities recorded yet.</div>';
      } else {
        phList.innerHTML = history.slice(0, 8).map(function (h) {
          return (
            '<div class="ph-item">' +
              '<div class="ph-icon" style="background:var(--primary-subtle); color:var(--primary);">⭐</div>' +
              '<div class="ph-desc">' +
                '<div>' + h.description + '</div>' +
                '<div class="ph-date">' + h.date + '</div>' +
              '</div>' +
              '<div class="ph-pts">+' + h.points + '</div>' +
            '</div>'
          );
        }).join('');
      }
    }
  }

  // ─── 16. PAGE: MARKSHEETS & CERTIFICATES ───────────────────────────────────
  function generateQrPattern(code) {
    var hash = 0;
    for (var i = 0; i < code.length; i++) {
      hash = ((hash << 5) - hash) + code.charCodeAt(i);
      hash |= 0;
    }

    var cellsHtml = '';
    for (var r = 0; r < 9; r++) {
      for (var c = 0; c < 9; c++) {
        var isCorner = (r < 3 && c < 3) || (r < 3 && c > 5) || (r > 5 && c < 3);
        var bit = isCorner || (((hash >> ((r * 9 + c) % 31)) & 1) === 1);
        var cellColor = bit ? '#0F172A' : '#FFFFFF';
        cellsHtml += '<div class="doc-qr-cell" style="background:' + cellColor + ';"></div>';
      }
    }
    return cellsHtml;
  }

  function renderMarksheetView() {
    var listView = document.getElementById('docsListView');
    var docViewer = document.getElementById('docViewer');
    var cardsContainer = document.getElementById('docsCardsList');
    var backBtn = document.getElementById('btnBackToDocsList');
    var printBtn = document.getElementById('btnPrintDocument');

    var docs = (DATA.documents || []).filter(function (d) {
      return d.student_id === currentStudentId;
    });

    if (cardsContainer) {
      cardsContainer.innerHTML = docs.map(function (doc) {
        var isCert = doc.type === 'certificate';
        var iconSvg = isCert
          ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>'
          : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>';

        var statusBadge = doc.status === 'valid'
          ? '<span class="badge badge-success">VALID</span>'
          : '<span class="badge badge-error">REVOKED</span>';

        return (
          '<div class="doc-list-card">' +
            '<div class="doc-list-icon">' + iconSvg + '</div>' +
            '<div class="doc-list-info">' +
              '<div class="doc-list-title">' + doc.title + ' ' + statusBadge + '</div>' +
              '<div class="doc-list-meta">Issue Date: ' + doc.issue_date + ' &bull; Verification Code: <code>' + doc.code + '</code></div>' +
            '</div>' +
            '<button type="button" class="btn btn-sm btn-primary btn-view-doc" data-doc-id="' + doc.id + '">View &amp; Print</button>' +
          '</div>'
        );
      }).join('');

      var viewBtns = cardsContainer.querySelectorAll('.btn-view-doc');
      viewBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
          var did = this.getAttribute('data-doc-id');
          var doc = docs.find(function (d) { return d.id === did; });
          if (doc) showDocument(doc);
        });
      });
    }

    function showDocument(doc) {
      currentDocViewing = doc;
      var student = getActiveStudent();

      if (listView) listView.style.display = 'none';
      if (docViewer) docViewer.classList.add('active');

      var examEl = document.getElementById('docRenderExamName');
      var nameEl = document.getElementById('docRenderStudentName');
      var rollEl = document.getElementById('docRenderRoll');
      var dateEl = document.getElementById('docRenderIssueDate');
      var codeEl = document.getElementById('docRenderCode');
      var statusEl = document.getElementById('docRenderStatus');
      var marksTbody = document.getElementById('docMarksTableBody');
      var totalMarksEl = document.getElementById('docRenderTotalMarks');
      var pctEl = document.getElementById('docRenderPercentage');
      var gradeEl = document.getElementById('docRenderGrade');
      var attEl = document.getElementById('docRenderAttendance');
      var qrBox = document.getElementById('docQrGraphic');

      if (examEl) examEl.textContent = doc.exam_name || doc.title;
      if (nameEl) nameEl.textContent = student.name;
      if (rollEl) rollEl.textContent = student.roll;
      if (dateEl) dateEl.textContent = doc.issue_date;
      if (codeEl) codeEl.textContent = doc.code;
      if (statusEl) {
        statusEl.innerHTML = doc.status === 'valid'
          ? '<span class="badge badge-success">VALID &amp; AUTHENTIC</span>'
          : '<span class="badge badge-error">REVOKED RECORD</span>';
      }

      if (marksTbody && doc.subject_marks) {
        marksTbody.innerHTML = doc.subject_marks.map(function (sm) {
          var sPct = Math.round((sm.obtained / sm.max) * 100);
          return (
            '<tr>' +
              '<td class="fw-700">' + sm.subject + '</td>' +
              '<td>' + sm.max + '</td>' +
              '<td>' + sm.obtained + '</td>' +
              '<td>' + sPct + '%</td>' +
            '</tr>'
          );
        }).join('') +
        '<tr class="doc-total-row">' +
          '<td>TOTAL SCORE</td>' +
          '<td>' + doc.total_max + '</td>' +
          '<td>' + doc.total_obtained + '</td>' +
          '<td>' + doc.percentage + '%</td>' +
        '</tr>';
      }

      if (totalMarksEl) totalMarksEl.textContent = doc.total_obtained + ' / ' + doc.total_max;
      if (pctEl) pctEl.textContent = doc.percentage + '%';
      if (gradeEl) gradeEl.textContent = doc.grade;
      if (attEl) attEl.textContent = doc.attendance_percent + '%';
      if (qrBox) qrBox.innerHTML = generateQrPattern(doc.code);

      window.scrollTo({ top: 0, behavior: 'smooth' });
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

  // ─── 17. PAGE: VERIFY ──────────────────────────────────────────────────────
  function renderVerifyView(presetCode) {
    var form = document.getElementById('verifyForm');
    var input = document.getElementById('verifyCodeInput');
    var resContainer = document.getElementById('verifyResultContainer');

    function executeVerification(code) {
      var trimmed = (code || '').trim().toUpperCase();
      if (!trimmed) return;

      var match = (DATA.documents || []).find(function (d) {
        return d.code.toUpperCase() === trimmed;
      });

      if (!resContainer) return;
      resContainer.style.display = 'block';

      if (match) {
        var student = (DATA.students || []).find(function (s) { return s.id === match.student_id; }) || { name: 'Aryan Mehta' };
        var isValid = match.status === 'valid';
        var cardClass = isValid ? 'verify-result-card valid' : 'verify-result-card revoked';
        var statusBadge = isValid
          ? '<span class="badge badge-success">AUTHENTIC &amp; ACTIVE</span>'
          : '<span class="badge badge-error">REVOKED / CANCELLED</span>';

        resContainer.innerHTML =
          '<div class="' + cardClass + '">' +
            '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">' +
              '<div>' +
                '<span class="text-xs text-muted uppercase fw-700">Verification Confirmation</span>' +
                '<h3 class="text-lg fw-800" style="color:var(--text-main); margin-top:2px;">' + match.title + '</h3>' +
              '</div>' +
              statusBadge +
            '</div>' +
            '<table style="width:100%; font-size:var(--text-sm);">' +
              '<tr><td style="color:var(--text-secondary); width:130px; padding:4px 0;">Issuing Center:</td><td class="fw-700">' + (DATA.center ? DATA.center.name : 'Stellar Academy') + '</td></tr>' +
              '<tr><td style="color:var(--text-secondary); padding:4px 0;">Candidate Name:</td><td class="fw-700">' + student.name + '</td></tr>' +
              '<tr><td style="color:var(--text-secondary); padding:4px 0;">Examination:</td><td>' + match.exam_name + '</td></tr>' +
              '<tr><td style="color:var(--text-secondary); padding:4px 0;">Date of Issue:</td><td>' + match.issue_date + '</td></tr>' +
              '<tr><td style="color:var(--text-secondary); padding:4px 0;">Document Code:</td><td><code>' + match.code + '</code></td></tr>' +
            '</table>' +
            '<div class="text-xs text-muted" style="margin-top:14px; border-top:1px solid var(--border); padding-top:8px;">' +
              'Protected credential lookup &bull; No sensitive contact details exposed.' +
            '</div>' +
          '</div>';

        showToast(isValid ? 'Document authenticated successfully!' : 'Record identified: status is REVOKED', isValid ? 'success' : 'error', 3000);
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

  // ─── 18. PAGE: SETTINGS ────────────────────────────────────────────────────
  function renderSettingsView() {
    var student = getActiveStudent();

    var avatar = document.getElementById('settingsAvatar');
    var nameEl = document.getElementById('settingsName');
    var rollEl = document.getElementById('settingsRoll');
    var parentEl = document.getElementById('settingsParent');
    var dobEl = document.getElementById('settingsDob');
    var themeToggle = document.getElementById('settingsThemeToggle');
    var resetBtn = document.getElementById('btnResetDemoData');

    if (avatar) avatar.textContent = student.photo_initials;
    if (nameEl) nameEl.textContent = student.name;
    if (rollEl) rollEl.textContent = 'Roll No: ' + student.roll + ' • Class 10 Morning Batch';
    if (parentEl) parentEl.textContent = student.parent_name + ' (' + student.parent_phone + ')';
    if (dobEl) dobEl.textContent = student.dob;

    if (themeToggle) {
      themeToggle.checked = STATE.theme === 'dark';
      themeToggle.onchange = function () {
        applyTheme(this.checked ? 'dark' : 'light');
      };
    }

    if (resetBtn) {
      resetBtn.onclick = function () {
        if (confirm('Are you sure you want to reset all prototype demo data?\nAll recorded fee settlements, attendance check-ins, and study notes will revert to fresh defaults.')) {
          Store.reset();
          showToast('Demo data restored to initial state!', 'info', 2000);
          setTimeout(function () {
            window.location.reload();
          }, 600);
        }
      };
    }
  }

  // ─── 19. APP INITIALIZATION & BOOTSTRAP ───────────────────────────────────
  function initApp() {
    initState();
    applyTheme(STATE.theme);
    updateSidebarProfile();

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

    if (sidebarCloseBtn) {
      sidebarCloseBtn.addEventListener('click', closeSidebar);
    }

    if (sidebarBackdrop) {
      sidebarBackdrop.addEventListener('click', closeSidebar);
    }

    var sidebarNavItems = document.querySelectorAll('.sidebar-nav-item');
    sidebarNavItems.forEach(function (item) {
      item.addEventListener('click', function () {
        if (window.innerWidth < 960) {
          closeSidebar();
        }
      });
    });

    var themeToggleBtn = document.getElementById('themeToggle');
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', toggleTheme);
    }

    var themeToggleMobile = document.getElementById('themeToggleMobile');
    if (themeToggleMobile) {
      themeToggleMobile.addEventListener('click', toggleTheme);
    }

    var modeToggleBtn = document.getElementById('modeToggle');
    if (modeToggleBtn) {
      modeToggleBtn.addEventListener('click', toggleParentMode);
    }

    window.addEventListener('hashchange', handleRouting);
    handleRouting();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }

})();

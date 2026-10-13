const $ = (id) => document.getElementById(id);
const ATTENDANCE_TARGET = 75;

const state = {
  profile: { name: "DINESH", className: "CSE (AIML) BTech" },
  subjects: ["MATHS", "AEP", "BEE", "PYTHON", "CHEMISTRY"],
  marks: [
    { id: 1, subject: "CHEMISTRY", exam: "SEMESTER 1", obtained: 45, max: 100 },
    { id: 2, subject: "PYTHON", exam: "SEMESTER 1", obtained: 90, max: 100 },
    { id: 3, subject: "BEE", exam: "SEMESTER 1", obtained: 40, max: 100 },
    { id: 4, subject: "AEP", exam: "SEMESTER 1", obtained: 90, max: 100 },
    { id: 5, subject: "MATHS", exam: "SEMESTER 1", obtained: 69, max: 100 }
  ],
  attendance: [],
  study: { level: "Beginner", topics: 0, hours: 0, dailyGoal: 2 }
};

let nextId = 6;

const pct = (a, b) => b > 0 ? (a / b) * 100 : 0;

const safe = (value) =>
  String(value).replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));

function setMessage(id, text, kind = "success") {
  const el = $(id);
  el.textContent = text;
  el.className = `message ${kind}`;
}


function renderSubjectOptions() {
  const options =
    '<option value="">Choose subject</option>' +
    state.subjects.map(s =>
      `<option value="${safe(s)}">${safe(s)}</option>`
    ).join("");

  $("marksSubject").innerHTML = options;
}


function renderSubjects() {
  $("subjectList").innerHTML = state.subjects.length
    ? state.subjects.map(s => `
        <div class="chip">
          <span>${safe(s)}</span>
          <button type="button"
            data-remove-subject="${safe(s)}"
            aria-label="Remove ${safe(s)}">×</button>
        </div>
      `).join("")
    : '<p class="empty-note">No subjects added yet.</p>';

  $("subjectCount").textContent = state.subjects.length;
  renderSubjectOptions();
}

function renderMarks() {
  $("marksTable").innerHTML = state.marks.length
    ? state.marks.map(m => {
        const p = pct(m.obtained, m.max);

        return `
          <tr>
            <td>${safe(m.subject)}</td>
            <td>${safe(m.exam)}</td>
            <td>${m.obtained} / ${m.max}</td>
            <td>${p.toFixed(1)}%</td>
            <td>
              <span class="pill ${p < 40 ? "bad" : ""}">
                ${p < 40 ? "Needs work" : "Recorded"}
              </span>
            </td>
            <td>
              <button class="delete-btn" type="button"
                data-delete-mark="${m.id}">Delete</button>
            </td>
          </tr>
        `;
      }).join("")
    : '<tr><td colspan="6" class="empty-cell">No exam results recorded yet.</td></tr>';
}


function renderAttendance() {
  const table = $("attendanceTable");

  if (!state.attendance.length) {
    table.innerHTML =
      '<tr><td colspan="5">No attendance records yet.</td></tr>';
    return;
  }

  table.innerHTML = state.attendance.map(a => {
    const absent = a.held - a.attended;
    const percentage = a.held > 0
      ? (a.attended / a.held) * 100
      : 0;

    return `
      <tr>
        <td>${a.subject}</td>
        <td>${a.attended}</td>
        <td>${a.held}</td>
        <td>${absent}</td>
        <td>${percentage.toFixed(1)}%</td>
      </tr>
    `;
  }).join("");
}

// Draw the subject marks chart without an external chart library.
function drawChart() {
  const canvas = $("marksChart");
  const ctx = canvas.getContext("2d");

  const width = Math.max(canvas.clientWidth, 280);
  const height = 240;
  const dpr = window.devicePixelRatio || 1;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const averages = state.subjects.map(subject => {
    const rows = state.marks.filter(m => m.subject === subject);
    return {
      subject,
      value: rows.length
        ? rows.reduce((sum, m) =>
            sum + pct(m.obtained, m.max), 0) / rows.length
        : 0,
      has: rows.length > 0
    };
  }).filter(x => x.has);

  $("chartMessage").hidden = averages.length > 0;

  if (!averages.length) return;

  const left = 36;
  const right = 12;
  const top = 16;
  const bottom = 48;
  const plotW = width - left - right;
  const plotH = height - top - bottom;

  ctx.font = "11px Arial";
  ctx.textAlign = "right";

  for (let tick = 0; tick <= 100; tick += 25) {
    const y = top + plotH - (tick / 100) * plotH;

    ctx.strokeStyle = "#e8eaf2";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(left, y);
    ctx.lineTo(width - right, y);
    ctx.stroke();

    ctx.fillStyle = "#7b8194";
    ctx.fillText(`${tick}%`, left - 7, y + 4);
  }

  const slot = plotW / averages.length;

  averages.forEach((item, i) => {
    const barW = Math.min(42, slot * 0.55);
    const x = left + i * slot + (slot - barW) / 2;
    const barH = (item.value / 100) * plotH;
    const y = top + plotH - barH;

    ctx.fillStyle = "#6d5ce8";
    ctx.beginPath();

    const radius = Math.min(6, barW / 2);

    if (ctx.roundRect) {
      ctx.roundRect(x, y, barW, barH, [radius, radius, 0, 0]);
    } else {
      ctx.rect(x, y, barW, barH);
    }

    ctx.fill();

    ctx.fillStyle = "#35394a";
    ctx.textAlign = "center";
    ctx.font = "11px Arial";
    ctx.fillText(
      `${item.value.toFixed(0)}%`,
      x + barW / 2,
      Math.max(top + 10, y - 6)
    );

    ctx.fillStyle = "#70768b";
    ctx.font = "10px Arial";

    const label = item.subject.length > 9
      ? item.subject.slice(0, 8) + "…"
      : item.subject;

    ctx.fillText(label, x + barW / 2, height - 22);
  });
}

// Generate improvement suggestions from the student's data.
function renderInsights() {
  const avg = state.marks.length
    ? state.marks.reduce(
        (sum, m) => sum + pct(m.obtained, m.max), 0
      ) / state.marks.length
    : 0;

  const weakSubjects = state.subjects.map(subject => {
    const rows = state.marks.filter(m => m.subject === subject);

    return {
      subject,
      average: rows.length
        ? rows.reduce(
            (sum, m) => sum + pct(m.obtained, m.max), 0
          ) / rows.length
        : null
    };
  })
  .filter(s => s.average !== null && s.average < 60)
  .sort((a, b) => a.average - b.average);

  $("weakCount").textContent = weakSubjects.length;
  $("examAverage").textContent = `${avg.toFixed(1)}%`;

  $("performanceLevel").textContent = state.marks.length
    ? avg >= 80 ? "Excellent"
    : avg >= 60 ? "Progressing"
    : "Needs focus"
    : "Getting started";

  const low = [...state.attendance].sort(
    (a, b) => pct(a.attended, a.held) -
              pct(b.attended, b.held)
  )[0];

  let classesNeeded = "—";

  if (low) {
    const p = pct(low.attended, low.held);

    classesNeeded = p >= low.target
      ? "0"
      : low.target === 100
        ? "All"
        : String(Math.ceil(
            (low.target * low.held - 100 * low.attended) /
            (100 - low.target)
          ));
  }

  $("classesNeeded").textContent = classesNeeded;

  const cards = [];

  weakSubjects.forEach(s => {
    cards.push(`
      <article class="insight-card">
        <div class="insight-icon">↗</div>
        <h3>Focus on ${safe(s.subject)}</h3>
        <p>Your average is ${s.average.toFixed(1)}%.
        Aim toward the 60% practice goal with regular revision,
        worked examples, and practice questions.</p>
      </article>
    `);
  });

  if (low) {
    const p = pct(low.attended, low.held);

    const needed = p >= low.target
      ? 0
      : low.target === 100
        ? "every future class"
        : `${Math.ceil(
            (low.target * low.held - 100 * low.attended) /
            (100 - low.target)
          )} consecutive classes`;

    cards.push(`
      <article class="insight-card">
        <div class="insight-icon">◷</div>
        <h3>${safe(low.subject)}: attendance plan</h3>
        <p>Your attendance is ${p.toFixed(1)}% against a
        ${low.target}% target.
        ${p >= low.target
          ? "You currently meet your target; keep attending."
          : `Attend the next ${needed} without missing a class to reach the target.`}
        </p>
      </article>
    `);
  }

  if (state.marks.length) {
    const best = state.subjects.map(subject => {
      const rows = state.marks.filter(m => m.subject === subject);

      return {
        subject,
        avg: rows.length
          ? rows.reduce(
              (sum, m) => sum + pct(m.obtained, m.max), 0
            ) / rows.length
          : -1
      };
    }).sort((a, b) => b.avg - a.avg)[0];

    if (best && best.avg >= 0) {
      cards.push(`
        <article class="insight-card">
          <div class="insight-icon">✓</div>
          <h3>Build on your strengths</h3>
          <p>${safe(best.subject)} is your strongest recorded
          subject at ${best.avg.toFixed(1)}%.
          Keep revising to maintain your progress.</p>
        </article>
      `);
    }
  }

  cards.push(`
    <article class="insight-card">
      <div class="insight-icon">◉</div>
      <h3>Suggested study routine</h3>
      <p>Your weekly study time is ${state.study.hours} hours
      and your daily goal is ${state.study.dailyGoal} hours.
      Break your goal into focused sessions and leave time for revision.</p>
    </article>
  `);

  $("insightsList").innerHTML = cards.join("");
}

// Update dashboard statistics and profile information.
function updateDashboard() {
  const totalObtained = state.marks.reduce(
    (sum, m) => sum + m.obtained, 0
  );

  const totalMax = state.marks.reduce(
    (sum, m) => sum + m.max, 0
  );

  const overall = pct(totalObtained, totalMax);

  $("totalMarks").textContent =
    `${totalObtained} / ${totalMax}`;

  $("totalMarksNote").textContent =
    `${state.marks.length} exam result${state.marks.length === 1 ? "" : "s"} recorded`;

  $("overallPercent").textContent = `${overall.toFixed(1)}%`;
  $("overallBar").style.width = `${Math.min(100, overall)}%`;

  
const totalAttended = state.attendance.reduce(
  (sum, a) => sum + a.attended, 0
);

const totalHeld = state.attendance.reduce(
  (sum, a) => sum + a.held, 0
);

const attendancePct = pct(totalAttended, totalHeld);

$("attendancePercent").textContent =
  totalHeld > 0 ? `${attendancePct.toFixed(1)}%` : "—";

$("attendanceBar").style.width =
  `${Math.min(100, attendancePct)}%`;

$("attendanceNote").textContent =
  totalHeld > 0
    ? attendancePct >= ATTENDANCE_TARGET
      ? "At or above the 75% target"
      : "Below the 75% target"
    : "Waiting for official college data";

  $("studyPercent").textContent = `${state.study.topics}%`;
  $("studyBar").style.width = `${state.study.topics}%`;
  
  // CALCULATE YOUR SCORE OUT OF 100
  const scoreParts = [];

  // Academic performance: 70%
  if (totalMax > 0) {
    scoreParts.push({
      value: overall,
      weight: 70
    });
  }

  // Attendance: 20%
  if (totalHeld > 0) {
    scoreParts.push({
      value: attendancePct,
      weight: 20
    });
  }

  // Study progress: 10%
  const studyProgress = Number(state.study.topics);

  if (Number.isFinite(studyProgress)) {
    scoreParts.push({
      value: Math.max(0, Math.min(100, studyProgress)),
      weight: 10
    });
  }

  const totalWeight = scoreParts.reduce(
  (sum, part) => sum + part.weight, 0
);

const yourScore = totalWeight > 0
  ? scoreParts.reduce(
      (sum, part) => sum + part.value * part.weight, 0
    ) / totalWeight
  : 0;

$("overallScore").innerHTML =
  `${Math.round(yourScore)}<span>/100</span>`;

if (totalWeight === 0) {
  $("scoreMessage").textContent =
    "Add your marks, attendance, or study progress to see your score.";
} else {
  $("scoreMessage").textContent =
    yourScore >= 85 ? "Excellent progress! Keep it up!"
    : yourScore >= 70 ? "Good progress! Keep improving!"
    : yourScore >= 50 ? "You're progressing. Stay consistent!"
    : "Keep learning and work toward your goals!";
}

  $("welcomeName").textContent = state.profile.name;
  $("profileName").textContent = state.profile.name;
  $("profileClass").textContent = state.profile.className || "Not set";
  $("profileLevel").textContent = state.study.level;

  $("avatar").textContent =
    (state.profile.name.trim()[0] || "S").toUpperCase();

  renderInsights();
  drawChart();
}

function refreshAll() {
  renderSubjects();
  renderMarks();
  renderAttendance();
  updateDashboard();
}

function openProfile() {
  $("studentName").value = state.profile.name;
  $("studentClass").value = state.profile.className;
  $("profileDialog").showModal();
}

// ADD SUBJECT
$("subjectForm").addEventListener("submit", e => {
  e.preventDefault();

  const subject = $("subjectName").value.trim().toUpperCase();

  if (!subject) return;

  if (state.subjects.some(
    s => s.toLowerCase() === subject.toLowerCase()
  )) {
    alert("This subject already exists.");
    return;
  }

  state.subjects.push(subject);
  $("subjectName").value = "";
  refreshAll();
});

// REMOVE SUBJECT
$("subjectList").addEventListener("click", e => {
  const button = e.target.closest("[data-remove-subject]");
  if (!button) return;

  const subject = button.dataset.removeSubject;

  if (!confirm(`Remove ${subject} and its marks/attendance records?`)) {
    return;
  }

  state.subjects = state.subjects.filter(s => s !== subject);
  state.marks = state.marks.filter(m => m.subject !== subject);
  state.attendance = state.attendance.filter(a => a.subject !== subject);

  refreshAll();
});

// SAVE EXAM RESULT
$("marksForm").addEventListener("submit", e => {
  e.preventDefault();

  const subject = $("marksSubject").value;
  const exam = $("examName").value.trim();
  const obtained = Number($("marksObtained").value);
  const max = Number($("maxMarks").value);

  if (
    !state.subjects.includes(subject) ||
    !exam ||
    !Number.isFinite(obtained) ||
    !Number.isFinite(max) ||
    max <= 0 ||
    obtained < 0 ||
    obtained > max
  ) {
    setMessage(
      "marksMessage",
      "Check your subject and marks. Obtained marks must be between 0 and maximum marks.",
      "error"
    );
    return;
  }

  state.marks.unshift({
    id: nextId++,
    subject,
    exam,
    obtained,
    max,
    date: $("examDate").value
  });

  setMessage("marksMessage", "Exam result saved successfully.");
  e.target.reset();
  refreshAll();
});

// DELETE EXAM RESULT
$("marksTable").addEventListener("click", e => {
  const button = e.target.closest("[data-delete-mark]");
  if (!button) return;

  state.marks = state.marks.filter(
    m => String(m.id) !== button.dataset.deleteMark
  );

  refreshAll();
});

// SAVE STUDY PLAN
$("studyForm").addEventListener("submit", e => {
  e.preventDefault();

  const level = $("studyLevel").value;
  const topics = Number($("topics").value);
  const hours = Number($("hours").value);
  const dailyGoal = Number($("dailyGoal").value);

  if (
    topics < 0 || topics > 100 ||
    hours < 0 || hours > 168 ||
    dailyGoal < 0.5 || dailyGoal > 24
  ) {
    setMessage("studyMessage", "Please enter valid study values.", "error");
    return;
  }

  state.study = { level, topics, hours, dailyGoal };

  setMessage("studyMessage", "Study plan saved successfully.");
  updateDashboard();
});

// EDIT STUDENT PROFILE
$("profileBtn").addEventListener("click", openProfile);
$("profileBtn2").addEventListener("click", openProfile);

$("cancelProfile").addEventListener("click", () => {
  $("profileDialog").close();
});

$("profileForm").addEventListener("submit", e => {
  e.preventDefault();

  state.profile.name =
    $("studentName").value.trim() || "Student";

  state.profile.className =
    $("studentClass").value.trim();

  $("profileDialog").close();
  updateDashboard();
});

// EXPORT STUDENT REPORT AS CSV
$("exportBtn").addEventListener("click", () => {
  const lines = [
    "EduPulse AI - Student Report",
    `Student: ${state.profile.name}`,
    `Class: ${state.profile.className}`,
    "",
    "EXAM MARKS",
    "Subject,Exam,Obtained,Maximum,Percentage",

    ...state.marks.map(m =>
      `${m.subject},"${m.exam.replace(/"/g, '""')}",${m.obtained},${m.max},${pct(m.obtained, m.max).toFixed(1)}%`
    ),

    "",
    "ATTENDANCE",
    "Subject,Attended,Conducted,Percentage,Target",

    ...state.attendance.map(a =>
      `${a.subject},${a.attended},${a.held},${pct(a.attended, a.held).toFixed(1)}%,${a.target}%`
    ),

    "",
    `Study level,${state.study.level}`,
    `Topics completed,${state.study.topics}%`,
    `Study hours per week,${state.study.hours}`
  ];

  const blob = new Blob(
    [lines.join("\r\n")],
    { type: "text/csv;charset=utf-8;" }
  );

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = "edupulse-student-report.csv";
  a.click();

  URL.revokeObjectURL(url);
});

// HIGHLIGHT SELECTED NAVIGATION LINK

document.querySelectorAll(".nav-link").forEach(link => {
  link.addEventListener("click", event => {
    const targetId = link.getAttribute("href");

    if (!targetId || !targetId.startsWith("#")) return;

    const target = document.querySelector(targetId);

    if (!target) return;

    event.preventDefault();

    document.querySelectorAll(".nav-link").forEach(item => {
      item.classList.remove("active");
    });

    link.classList.add("active");

    target.scrollIntoView({ behavior: "smooth" });
  });
});


 // AUTO-HIGHLIGHT NAVIGATION WHILE SCROLLING
const navLinks = document.querySelectorAll(".nav-link");

const sections = [...navLinks]
  .map(link => {
    const href = link.getAttribute("href");
    return href && href.startsWith("#")
      ? document.querySelector(href)
      : null;
  })
  .filter(Boolean);


function updateActiveNavOnScroll() {
  const links = document.querySelectorAll(".nav-link");

  let activeSection = null;
  let closestTop = -Infinity;

  links.forEach(link => {
    const href = link.getAttribute("href");

    if (!href || !href.startsWith("#")) return;

    const section = document.querySelector(href);

    if (!section) return;

    const top = section.getBoundingClientRect().top;

    if (top <= 180 && top > closestTop) {
      closestTop = top;
      activeSection = section;
    }
  });

  if (!activeSection) {
    activeSection = document.querySelector("#dashboard");
  }

  links.forEach(link => {
    link.classList.toggle(
      "active",
      link.getAttribute("href") === `#${activeSection?.id}`
    );
  });
}

window.addEventListener("scroll", updateActiveNavOnScroll, {
  passive: true
});

updateActiveNavOnScroll();

// REDRAW CHART WHEN WINDOW SIZE CHANGES
window.addEventListener("resize", drawChart);

// INITIALIZE DASHBOARD
refreshAll();

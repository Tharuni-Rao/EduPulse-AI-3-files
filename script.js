/* SAMPLE DATA: replace with the authenticated student's verified records. */
const student = {
  id: "ST001",
  firstName: "Arjun",
  surname: "Kumar",
  present: 45,
  total: 50,
  marks: { Maths: 92, BEE: 58, AEP: 76, Python: 88, Java: 67 }
};

const pageTitles = {
  dashboard: ["Student Dashboard", "Your personal academic overview."],
  attendance: ["Attendance", "Attendance percentage and target."],
  marks: ["Subjects Marks", "Compare your marks and improve weak subjects."],
  notes: ["Subject Notes", "Learn with diagrams, examples and key points."],
  placement: ["Placement Preparation", "Build coding and interview skills."],
  feedback: ["Student Feedback", "Share feedback for each subject."],
  profile: ["My Profile", "Your student profile and achievements."]
};

const $ = id => document.getElementById(id);

function showPage(id, button) {
  document.querySelectorAll(".page").forEach(page => page.classList.remove("open"));
  $(id).classList.add("open");
  document.querySelectorAll(".menu-btn").forEach(btn => btn.classList.remove("active"));
  if (button) button.classList.add("active");
  else {
    const navButton = document.querySelector(`.menu-btn[data-page="${id}"]`);
    if (navButton) navButton.classList.add("active");
  }
  $("pageTitle").textContent = pageTitles[id][0];
  $("pageSubtitle").textContent = pageTitles[id][1];
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function navigate(id) { showPage(id); }
function fullName() { return (student.firstName + " " + student.surname).trim(); }

function analysis() {
  const entries = Object.entries(student.marks);
  const sorted = [...entries].sort((a, b) => b[1] - a[1]);
  return {
    average: Math.round(entries.reduce((sum, item) => sum + item[1], 0) / entries.length),
    highest: sorted[0],
    lowest: sorted[sorted.length - 1]
  };
}

function renderAttendance() {
  const percent = student.total ? Math.round(student.present / student.total * 100) : 0;
  const absent = student.total - student.present;
  $("attPercent").textContent = percent + "%";
  $("attBar").style.width = percent + "%";
  $("attPresent").textContent = student.present;
  $("attAbsent").textContent = absent;
  $("attTotal").textContent = student.total;

  const status = $("attStatus");
  status.className = "notice";
  status.textContent = percent >= 75
    ? "✓ Attendance meets the 75% target. Continue attending regularly."
    : "⚠ Attendance is below 75%. Attend upcoming classes and speak to faculty about your attendance record.";
  if (percent < 75) status.classList.add("warning");

  const needed = percent >= 75 ? 0 : Math.max(0, Math.ceil((0.75 * student.total - student.present) / 0.25));
  $("attTarget").textContent = needed === 0
    ? "You have already reached the 75% target based on this record."
    : `You need to attend at least ${needed} consecutive classes without missing any to reach 75%, assuming no other attendance changes.`;
}

function renderDashboard() {
  const a = analysis();
  const percent = student.total ? Math.round(student.present / student.total * 100) : 0;
  $("headerName").textContent = fullName();
  $("headerId").textContent = student.id;
  $("welcomeName").textContent = `Welcome, ${student.firstName}! 👋`;
  $("dashAttendance").textContent = percent + "%";
  $("dashAverage").textContent = a.average + "%";
  $("dashHighest").textContent = a.highest[0];
  $("dashHighestNote").textContent = a.highest[1] + "/100 marks";
}

function renderMarks() {
  const a = analysis();
  $("marksAverage").textContent = a.average + "%";
  $("marksHighest").textContent = a.highest[0];
  $("marksHighestNote").textContent = a.highest[1] + "/100";
  $("marksLowest").textContent = a.lowest[0];
  $("marksLowestNote").textContent = a.lowest[1] + "/100";

  const list = $("subjectMarks");
  list.replaceChildren();
  Object.entries(student.marks).forEach(([name, mark]) => {
    const status = mark >= 85 ? ["HIGH", "good"] : mark >= 70 ? ["GOOD", ""] : ["NEEDS FOCUS", "low"];
    const card = document.createElement("div");
    card.className = "subject-card";
    card.innerHTML = `<div class="row"><h3></h3><strong>${mark}/100</strong></div>
      <div class="track"><div class="fill" style="width:${mark}%;background:${mark >= 85 ? "#159568" : mark >= 70 ? "#3478f6" : "#df5363"}"></div></div>
      <span class="pill ${status[1]}">${status[0]}</span>`;
    card.querySelector("h3").textContent = name;
    list.appendChild(card);
  });

  const graph = $("marksGraph");
  graph.replaceChildren();
  Object.entries(student.marks).forEach(([name, mark]) => {
    const stat = document.createElement("div");
    stat.className = "stat";
    stat.innerHTML = `<div class="row"><span class="stat-label"></span><strong>${mark}%</strong></div>
      <div class="track"><div class="fill" style="width:${mark}%;background:${mark >= 85 ? "#159568" : mark >= 70 ? "#3478f6" : "#df5363"}"></div></div>`;
    stat.querySelector(".stat-label").textContent = name;
    graph.appendChild(stat);
  });

  $("improvementPlan").textContent =
    `${a.lowest[0]} is the lowest-scoring subject at ${a.lowest[1]}/100. Review its fundamentals, practise questions regularly, note mistakes and ask faculty for help with difficult topics. Continue revising ${a.highest[0]} to maintain your strong performance.`;
}

const noteData = {
  Maths: {
    "Linear Equations": {
      intro: "A linear equation has a variable with highest power 1.",
      formula: "ax + b = 0  ⇒  x = -b/a (a ≠ 0)",
      example: "2x + 6 = 0 ⇒ 2x = -6 ⇒ x = -3",
      points: ["Perform the same operation on both sides.", "Keep the variable on one side.", "Substitute the answer to check it."],
      quiz: ["Solve x + 5 = 9", ["x = 4", "x = 14", "x = -4"], 0], diagram: "balance"
    },
    Trigonometry: {
      intro: "Trigonometry relates angles and sides of triangles.",
      formula: "sin θ = O/H · cos θ = A/H · tan θ = O/A",
      example: "If opposite = 3 and hypotenuse = 5, sin θ = 3/5.",
      points: ["H is the hypotenuse.", "O is the opposite side; A is the adjacent side.", "sin²θ + cos²θ = 1."],
      quiz: ["Opposite / hypotenuse is:", ["sin θ", "cos θ", "tan θ"], 0], diagram: "triangle"
    }
  },
  BEE: {
    "Ohm's Law": {
      intro: "Ohm's Law relates voltage, current and resistance under constant physical conditions.",
      formula: "V = I × R", example: "V = 12 V and R = 4 Ω, so I = V/R = 3 A.",
      points: ["Voltage is measured in volts.", "Current is measured in amperes.", "Resistance is measured in ohms."],
      quiz: ["V = 10 V and R = 5 Ω. Find current.", ["2 A", "50 A", "5 A"], 0], diagram: "circuit"
    },
    "Electrical Power": {
      intro: "Electrical power is the rate at which electrical energy is transferred.",
      formula: "P = VI · P = I²R · P = V²/R", example: "V = 10 V and I = 2 A, so P = 20 W.",
      points: ["Power is measured in watts.", "Select a formula that matches the given values.", "Keep units consistent."],
      quiz: ["V = 5 V, I = 2 A. Power is:", ["10 W", "2.5 W", "7 W"], 0], diagram: "power"
    }
  },
  AEP: {
    "Engineering Materials": {
      intro: "Engineering materials are chosen according to their properties and intended use.",
      formula: "Material selection = properties + application + cost + safety",
      example: "Copper is often used in wiring because it conducts electricity well.",
      points: ["Metals often conduct heat and electricity.", "Polymers are often lightweight.", "Ceramics can resist heat and wear."],
      quiz: ["Which material is commonly used in electrical wiring?", ["Copper", "Dry wood", "Paper"], 0], diagram: "materials"
    },
    "Workshop Safety": {
      intro: "Safety procedures help prevent accidents in practical workshops.",
      formula: "Safe work = training + correct protection + safe procedures",
      example: "Get proper instruction before operating unfamiliar equipment.",
      points: ["Follow faculty instructions.", "Use appropriate protective equipment.", "Report hazards and follow emergency procedures."],
      quiz: ["Before using unfamiliar equipment:", ["Start immediately", "Get instruction", "Ignore safety"], 1], diagram: "safety"
    }
  },
  Python: {
    Variables: {
      intro: "A variable is a name that refers to a value.", formula: "name = value",
      example: "age = 18\nname = 'Ravi'\nprint(name)",
      points: ["int stores whole numbers.", "float stores decimal numbers.", "str stores text; bool stores True or False."],
      quiz: ["Which type stores text?", ["int", "str", "bool"], 1], diagram: "variable"
    },
    "If-Else": {
      intro: "If-else lets a program choose actions based on a condition.",
      formula: "if condition: action; else: alternative",
      example: "marks = 65\nif marks >= 40:\n    print('Pass')\nelse:\n    print('Try again')",
      points: ["Use == to compare equality.", "Indentation matters in Python.", "Conditions evaluate to True or False."],
      quiz: ["Which keyword starts the alternative branch?", ["else", "repeat", "define"], 0], diagram: "decision"
    }
  },
  Java: {
    "Classes and Objects": {
      intro: "A class defines a type; an object is an instance of that class.",
      formula: "Class = blueprint; Object = instance", example: "class Student { String name; }",
      points: ["Classes can contain fields and methods.", "Objects represent instances.", "Methods define behaviour."],
      quiz: ["An object is:", ["An instance of a class", "A comment", "A package only"], 0], diagram: "class"
    },
    "Variables and Types": {
      intro: "Java variables have declared types that determine the values they can store.",
      formula: "type variableName = value;",
      example: 'int age = 18;\nString name = "Ravi";\nSystem.out.println(name);',
      points: ["int stores whole numbers.", "double stores decimal values.", "boolean stores true/false; String stores text."],
      quiz: ["Which type stores true or false?", ["int", "boolean", "double"], 1], diagram: "variable"
    }
  }
};

const svgDiagrams = {
  triangle: `<svg viewBox="0 0 300 190" role="img" aria-label="Right triangle with labelled sides"><polygon points="35,155 235,155 235,25" fill="#e4efff" stroke="#3478f6" stroke-width="3"/><text x="105" y="176" fill="#159568" font-size="12">Adjacent (A)</text><text x="240" y="90" fill="#df5363" font-size="12">O</text><text x="95" y="80" fill="#245fc9" font-size="12" transform="rotate(-33 95 80)">Hypotenuse</text><text x="52" y="145" font-size="14">θ</text></svg>`,
  balance: `<svg viewBox="0 0 300 190" role="img" aria-label="Equation balance diagram"><line x1="35" y1="80" x2="265" y2="80" stroke="#3478f6" stroke-width="5"/><path d="M150 80 L125 140 L175 140 Z" fill="#e4efff" stroke="#3478f6" stroke-width="2"/><rect x="35" y="94" width="85" height="35" rx="6" fill="#e4efff" stroke="#3478f6"/><rect x="180" y="94" width="85" height="35" rx="6" fill="#d9f7e9" stroke="#159568"/><text x="77" y="116" text-anchor="middle" font-size="12">2x + 6</text><text x="222" y="116" text-anchor="middle" font-size="12">0</text><text x="150" y="30" text-anchor="middle" fill="#245fc9" font-size="14">Keep both sides balanced</text></svg>`,
  circuit: `<svg viewBox="0 0 300 190" role="img" aria-label="Simple electrical circuit"><path d="M50 45 H130 M175 45 H250 V145 H50 V45" fill="none" stroke="#3478f6" stroke-width="3"/><rect x="130" y="32" width="45" height="26" rx="3" fill="#fff0b8" stroke="#e99a32" stroke-width="2"/><text x="152" y="49" text-anchor="middle" font-size="12">R</text><line x1="50" y1="85" x2="50" y2="115" stroke="#159568" stroke-width="4"/><line x1="38" y1="92" x2="62" y2="92" stroke="#159568" stroke-width="3"/><line x1="42" y1="106" x2="58" y2="106" stroke="#159568" stroke-width="3"/><text x="95" y="170" font-size="12" fill="#245fc9">Closed circuit</text></svg>`,
  power: `<svg viewBox="0 0 300 190" role="img" aria-label="Voltage and current calculate power"><rect x="20" y="30" width="100" height="48" rx="8" fill="#e4efff" stroke="#3478f6"/><rect x="180" y="30" width="100" height="48" rx="8" fill="#d9f7e9" stroke="#159568"/><text x="70" y="59" text-anchor="middle">Voltage V</text><text x="230" y="59" text-anchor="middle">Current I</text><rect x="75" y="112" width="150" height="45" rx="8" fill="#fff0b8" stroke="#e99a32"/><text x="150" y="140" text-anchor="middle" font-size="17">P = V × I</text></svg>`,
  materials: `<svg viewBox="0 0 300 170" role="img" aria-label="Material families"><rect x="5" y="25" width="90" height="100" rx="8" fill="#e4efff" stroke="#3478f6"/><rect x="105" y="25" width="90" height="100" rx="8" fill="#d9f7e9" stroke="#159568"/><rect x="205" y="25" width="90" height="100" rx="8" fill="#fff0b8" stroke="#e99a32"/><text x="50" y="55" text-anchor="middle" font-size="12">Metals</text><text x="50" y="80" text-anchor="middle" font-size="11">Copper</text><text x="150" y="55" text-anchor="middle" font-size="12">Polymers</text><text x="150" y="80" text-anchor="middle" font-size="11">Plastic</text><text x="250" y="55" text-anchor="middle" font-size="12">Ceramics</text><text x="250" y="80" text-anchor="middle" font-size="11">Glass</text></svg>`,
  safety: `<svg viewBox="0 0 300 190" role="img" aria-label="Workshop safety sequence"><rect x="35" y="10" width="230" height="40" rx="8" fill="#e4efff" stroke="#3478f6"/><text x="150" y="35" text-anchor="middle">1. Get trained</text><text x="150" y="75" text-anchor="middle">↓</text><rect x="35" y="85" width="230" height="40" rx="8" fill="#d9f7e9" stroke="#159568"/><text x="150" y="110" text-anchor="middle">2. Use protection</text><text x="150" y="150" text-anchor="middle">↓</text><rect x="35" y="155" width="230" height="30" rx="8" fill="#fff0b8" stroke="#e99a32"/><text x="150" y="175" text-anchor="middle">3. Follow procedures</text></svg>`,
  variable: `<svg viewBox="0 0 300 160" role="img" aria-label="Variable name refers to a value"><rect x="15" y="40" width="110" height="65" rx="10" fill="#e4efff" stroke="#3478f6" stroke-width="2"/><rect x="175" y="40" width="110" height="65" rx="10" fill="#d9f7e9" stroke="#159568" stroke-width="2"/><text x="70" y="66" text-anchor="middle">Variable</text><text x="70" y="87" text-anchor="middle">age</text><path d="M127 72 H172" stroke="#64748b" stroke-width="3"/><text x="230" y="79" text-anchor="middle" font-size="20">18</text><text x="150" y="135" text-anchor="middle" font-size="12">age = 18</text></svg>`,
  decision: `<svg viewBox="0 0 300 180" role="img" aria-label="Conditional flowchart"><rect x="90" y="5" width="120" height="32" rx="7" fill="#e4efff" stroke="#3478f6"/><text x="150" y="25" text-anchor="middle">Start</text><path d="M150 37 V53" stroke="#64748b" stroke-width="2"/><path d="M150 53 L205 85 L150 117 L95 85 Z" fill="#fff0b8" stroke="#e99a32"/><text x="150" y="89" text-anchor="middle" font-size="12">Condition?</text><path d="M95 85 H40 V135 M205 85 H260 V135" stroke="#64748b" stroke-width="2" fill="none"/><rect x="5" y="135" width="70" height="32" rx="6" fill="#d9f7e9" stroke="#159568"/><rect x="225" y="135" width="70" height="32" rx="6" fill="#ffe4e7" stroke="#df5363"/><text x="40" y="155" text-anchor="middle">If</text><text x="260" y="155" text-anchor="middle">Else</text></svg>`,
  class: `<svg viewBox="0 0 300 160" role="img" aria-label="Class and object"><rect x="10" y="30" width="110" height="95" rx="8" fill="#e4efff" stroke="#3478f6"/><text x="65" y="58" text-anchor="middle">Class</text><text x="65" y="83" text-anchor="middle" font-size="12">Fields</text><text x="65" y="102" text-anchor="middle" font-size="12">Methods</text><path d="M123 78 H174" stroke="#64748b" stroke-width="3"/><rect x="180" y="40" width="110" height="75" rx="8" fill="#d9f7e9" stroke="#159568"/><text x="235" y="72" text-anchor="middle">Object</text><text x="235" y="94" text-anchor="middle" font-size="12">Instance</text></svg>`
};

let currentSubject = "Maths";

function initNotes() {
  const tabs = $("noteTabs");
  tabs.replaceChildren();
  Object.keys(noteData).forEach(subject => {
    const button = document.createElement("button");
    button.className = "tab" + (subject === currentSubject ? " active" : "");
    button.textContent = subject;
    button.addEventListener("click", () => selectNoteSubject(subject));
    tabs.appendChild(button);
  });
  fillTopics();
}

function selectNoteSubject(subject) {
  currentSubject = subject;
  document.querySelectorAll("#noteTabs .tab").forEach(button => button.classList.toggle("active", button.textContent === subject));
  fillTopics();
}

function fillTopics() {
  const select = $("topicSelect");
  select.replaceChildren();
  Object.keys(noteData[currentSubject]).forEach(topic => {
    const option = document.createElement("option");
    option.value = topic;
    option.textContent = topic;
    select.appendChild(option);
  });
  renderNote();
}

function escapeHTML(value) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function renderNote() {
  const topic = $("topicSelect").value;
  const note = noteData[currentSubject][topic];
  if (!note) return;
  const points = note.points.map(point => `<li>${escapeHTML(point)}</li>`).join("");
  $("notesContent").innerHTML = `
    <article class="note-box"><div class="note-heading">📘 ${currentSubject}: ${escapeHTML(topic)}</div>
      <div class="note-body"><p>${escapeHTML(note.intro)}</p>
      <div class="formula">⭐ Important Formula / Rule<br>${escapeHTML(note.formula).replace(/\n/g, "<br>")}</div>
      <strong>Example</strong><p>${escapeHTML(note.example).replace(/\n/g, "<br>")}</p></div>
    </article>
    <article class="note-box"><div class="note-heading">🧩 Concept Diagram</div><div class="diagram">${svgDiagrams[note.diagram]}</div>
      <div class="note-body">Visual aid to help you understand the concept.</div></article>
    <article class="note-box"><div class="note-heading">✨ Highlighted Key Points</div>
      <div class="note-body"><p><span class="highlight">Remember these points</span></p><ul>${points}</ul></div></article>
    <article class="note-box"><div class="note-heading">🎯 Study Tip</div>
      <div class="note-body">Read the concept, explain it in your own words, solve practice questions and revise your mistakes before the exam.</div></article>`;
  $("quizContent").innerHTML = `<p><strong>${escapeHTML(note.quiz[0])}</strong></p>` +
    note.quiz[1].map((choice, index) => `<label class="quiz-option"><input type="radio" name="quiz" value="${index}"> ${escapeHTML(choice)}</label>`).join("");
  $("quizResult").textContent = "";
}

function checkQuiz() {
  const note = noteData[currentSubject][$("topicSelect").value];
  const chosen = document.querySelector('input[name="quiz"]:checked');
  if (!chosen) { $("quizResult").textContent = "Choose an answer first."; return; }
  $("quizResult").textContent = Number(chosen.value) === note.quiz[2]
    ? "Correct! Well done." : "Not quite. Review the highlighted notes and try again.";
}

function renderPlacement() {
  const java = student.marks.Java, python = student.marks.Python;
  const average = Math.round((java + python) / 2);
  $("placeJava").textContent = java + "/100";
  $("placePython").textContent = python + "/100";
  $("placeAverage").textContent = average + "%";
  $("readinessLabel").textContent = average >= 85 ? "Strong academic indicator" : average >= 70 ? "Developing academic indicator" : "More coding practice recommended";
  $("readinessBar").style.width = average + "%";
  $("readinessExplanation").textContent = "This score is calculated only from Java and Python marks. It does not estimate the probability of getting hired.";
  const plan = [];
  plan.push(java < 75 ? "Java: revise OOP, classes, collections and exception handling." : "Java: continue practising data structures and interview problems.");
  plan.push(python < 75 ? "Python: revise functions, lists, dictionaries, loops and problem solving." : "Python: practise algorithms and build small projects.");
  plan.push("Build at least one project, practise aptitude and communication, and prepare to explain your code.");
  $("placementPlan").replaceChildren();
  plan.forEach(item => { const p = document.createElement("p"); p.style.margin = "10px 0"; p.textContent = "• " + item; $("placementPlan").appendChild(p); });
}

const FEEDBACK_KEY = "edupulse_demo_feedback_v1";
function loadFeedback() {
  try { return JSON.parse(localStorage.getItem(FEEDBACK_KEY) || "[]"); }
  catch { return []; }
}

function renderFeedback() {
  const history = loadFeedback();
  const target = $("feedbackHistory");
  target.replaceChildren();
  if (!history.length) { target.textContent = "No feedback submitted yet."; return; }
  history.slice().reverse().forEach(item => {
    const card = document.createElement("div");
    card.className = "achievement";
    const title = document.createElement("strong");
    title.textContent = `${item.subject} · ${item.rating}/5`;
    const body = document.createElement("p");
    body.textContent = item.text;
    const date = document.createElement("p");
    date.className = "muted";
    date.textContent = item.date;
    card.append(title, body, date);
    target.appendChild(card);
  });
}

function updateProfileDisplay() {
  const name = fullName();
  $("headerName").textContent = name;
  $("headerId").textContent = student.id;
  $("welcomeName").textContent = `Welcome, ${student.firstName}! 👋`;
  $("profileDisplayName").textContent = name;
  $("profileDisplayId").textContent = student.id;
  const avatar = $("avatar");
  if (!avatar.querySelector("img")) avatar.textContent = (student.firstName.charAt(0) + student.surname.charAt(0)).toUpperCase();
}

document.querySelectorAll(".menu-btn[data-page]").forEach(button => {
  button.addEventListener("click", () => showPage(button.dataset.page, button));
});
document.querySelectorAll("[data-go]").forEach(button => button.addEventListener("click", () => navigate(button.dataset.go)));
$("logoutBtn").addEventListener("click", () => {
  if (confirm("Return to the dashboard? This demo does not have a real login session.")) navigate("dashboard");
});
$("topicSelect").addEventListener("change", renderNote);
$("checkQuizBtn").addEventListener("click", checkQuiz);
$("printNotesBtn").addEventListener("click", () => window.print());
$("printProfileBtn").addEventListener("click", () => window.print());

$("feedbackForm").addEventListener("submit", event => {
  event.preventDefault();
  const rating = document.querySelector('input[name="rating"]:checked');
  if (!rating) return;
  const history = loadFeedback();
  history.push({
    subject: $("feedbackSubject").value,
    rating: Number(rating.value),
    text: $("feedbackText").value.trim(),
    date: new Date().toLocaleString()
  });
  try {
    localStorage.setItem(FEEDBACK_KEY, JSON.stringify(history));
    $("feedbackMessage").classList.remove("hidden");
    $("feedbackMessage").textContent = "Feedback saved in this browser demo.";
    $("feedbackText").value = "";
    rating.checked = false;
    renderFeedback();
  } catch {
    $("feedbackMessage").classList.remove("hidden");
    $("feedbackMessage").textContent = "Could not save feedback in this browser.";
  }
});

$("profileForm").addEventListener("submit", event => {
  event.preventDefault();
  student.firstName = $("firstName").value.trim();
  student.surname = $("surname").value.trim();
  $("profileMessage").textContent = "Profile updated in this page demo.";
  updateProfileDisplay();
});

$("photoUpload").addEventListener("change", event => {
  const file = event.target.files[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) { alert("Please select an image."); return; }
  if (file.size > 3 * 1024 * 1024) { alert("Please choose an image under 3 MB."); return; }
  const reader = new FileReader();
  reader.onload = () => {
    const img = document.createElement("img");
    img.alt = "Student profile photo";
    img.src = reader.result;
    $("avatar").replaceChildren(img);
  };
  reader.readAsDataURL(file);
});

/* Initialize the student portal demo. */
renderDashboard();
renderAttendance();
renderMarks();
initNotes();
renderPlacement();
renderFeedback();
updateProfileDisplay();

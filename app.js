// =====================================================
//  app.js — طريقة عمل التطبيق (الصفحات، الاختبار، الحفظ)
//  المحتوى يأتي من Firebase بعد تسجيل الدخول (انظر auth.js)
// =====================================================

const app   = document.getElementById("app");
const title = document.getElementById("title");
const back  = document.getElementById("back");

// الوحدات — يملؤها auth.js بعد موافقة الأستاذ على الطالب
let UNITS = [];

// ---------- حفظ تقدّم الطالب ----------
// progress.quiz[رقم الوحدة] = أعلى درجة (نسبة مئوية)
// progress.known[الكلمة]    = true إذا قال الطالب إنه يعرفها
// يُحفظ على الجهاز، ويُرسل أيضاً إلى حساب الطالب ليراه الأستاذ
const SAVE_KEY = "english-book-progress";
let progress = JSON.parse(localStorage.getItem(SAVE_KEY) || '{"quiz":{},"known":{}}');
function save() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(progress));
  if (EB.onProgressSave) EB.onProgressSave(progress);
}

const openUnits = () => UNITS.filter(u => !u.locked);

// نسبة إنجاز وحدة واحدة = متوسط (درجة الاختبار + نسبة الكلمات المحفوظة)
function unitPercent(u) {
  const quiz  = progress.quiz[u.number] || 0;
  const known = u.words.filter(w => progress.known[w.en]).length;
  const words = u.words.length ? known / u.words.length * 100 : 0;
  return Math.round((quiz + words) / 2);
}
function totalPercent() {
  const list = openUnits();
  if (!list.length) return 0;
  return Math.round(list.reduce((s, u) => s + unitPercent(u), 0) / list.length);
}

// ---------- أدوات صغيرة ----------
function speak(text) {
  speechSynthesis.cancel();
  const s = new SpeechSynthesisUtterance(text);
  s.lang = "en-US";
  s.rate = 0.9; // أبطأ قليلاً ليفهم الطالب
  speechSynthesis.speak(s);
}
// النسبة المئوية تُكتب من اليسار حتى تظهر 50% وليس %50
function pct(n) { return `<bdi dir="ltr">${n}%</bdi>`; }
function bar(p) { return `<div class="bar"><span style="width:${p}%"></span></div>`; }

// إعداد رأس الصفحة وتمييز زر الشريط السفلي
function setPage(text, navPage, backTo) {
  title.textContent = text;
  back.style.display = backTo ? "block" : "none";
  back.onclick = backTo;
  document.querySelectorAll("nav button").forEach(b =>
    b.classList.toggle("active", b.dataset.page === navPage));
  window.scrollTo(0, 0);
}

// =====================================================
//  الصفحة الرئيسية
// =====================================================
function showHome() {
  setPage("English Book · 6th Science", "home");
  const p = totalPercent();
  if (!UNITS.length) {
    app.innerHTML = `<div class="card">لم يُرفع محتوى الكتاب بعد. سيظهر هنا عندما يرفعه الأستاذ.</div>`;
    return;
  }
  app.innerHTML = `
    <div class="card hero">
      <h2>أهلاً بك 👋</h2>
      <div class="muted">إنجازك في الكتاب: ${pct(p)}</div>
      ${bar(p)}
    </div>
    <div id="install"></div>
    <h2>الوحدات</h2>`;

  UNITS.forEach(u => {
    const btn = document.createElement("button");
    btn.className = "card unit" + (u.locked ? " locked" : "");
    btn.innerHTML = `
      <span class="num">${u.number}</span>
      <span class="info">
        <b>Unit ${u.number}</b> ${u.demo ? '<span class="badge">تجريبي</span>' : ""}
        <div class="muted en">${u.name}</div>
        ${u.locked ? '<div class="muted">🔒 قريباً</div>' : bar(unitPercent(u))}
      </span>`;
    if (!u.locked) btn.onclick = () => showUnit(u, "reading");
    app.appendChild(btn);
  });
  showInstallButton();
}

// =====================================================
//  صفحة الوحدة مع التبويبات
// =====================================================
const TABS = [
  ["reading", "📖 قراءة"], ["words", "🔤 كلمات"], ["video", "🎬 فيديو"],
  ["quiz", "✅ اختبار"], ["summary", "📝 ملخص"]
];

function showUnit(u, tab) {
  setPage("Unit " + u.number, "home", showHome);
  app.innerHTML = '<div class="tabs">' + TABS.map(([id, label]) =>
    `<button class="${id === tab ? "active" : ""}" data-tab="${id}">${label}</button>`
  ).join("") + '</div><div id="content"></div>';
  app.querySelectorAll(".tabs button").forEach(b =>
    b.onclick = () => showUnit(u, b.dataset.tab));

  const content = document.getElementById("content");
  if (tab === "reading") showReading(u, content);
  if (tab === "words")   showWords(u, content);
  if (tab === "video")   showVideo(u, content);
  if (tab === "quiz")    startQuiz(u, content);
  if (tab === "summary") showSummary(u, content);
}

// القراءة: نصوص الوحدة، كل نص له عنوان، وكل فقرة معها زر استماع
function showReading(u, content) {
  content.innerHTML = "";
  u.reading.forEach(part => {
    // نقبل الشكل القديم (فقرة واحدة نصّية) والشكل الجديد { title, lesson, text: [...] }
    if (typeof part === "string") part = { title: u.name, text: [part] };
    const head = document.createElement("h2");
    head.className = "en";
    head.innerHTML = part.title + (part.lesson ? ` <span class="muted">· Lesson ${part.lesson}</span>` : "");
    content.appendChild(head);
    part.text.forEach(text => {
      const div = document.createElement("div");
      div.className = "card row reading";
      div.innerHTML = `<p class="en">${text}</p><button class="speak" title="استمع">🔊</button>`;
      div.querySelector(".speak").onclick = () => speak(text);
      content.appendChild(div);
    });
  });
}

// الكلمات مع المعنى والنطق
function showWords(u, content) {
  u.words.forEach(w => {
    const div = document.createElement("div");
    div.className = "card row";
    div.innerHTML = `
      <button class="speak" title="استمع">🔊</button>
      <div class="en" style="flex:1"><b>${w.en}</b> ${progress.known[w.en] ? "✅" : ""}</div>
      <div class="muted">${w.ar}</div>`;
    div.querySelector(".speak").onclick = () => speak(w.en);
    content.appendChild(div);
  });
}

// الفيديو: يقبل رابط يوتيوب أو ملف mp4
function showVideo(u, content) {
  if (!u.video) {
    content.innerHTML = `<div class="card" style="text-align:center">
      <div style="font-size:40px">🎬</div><p>فيديو شرح هذه الوحدة سيُضاف قريباً</p></div>`;
    return;
  }
  const yt = u.video.match(/(?:youtu\.be\/|v=|shorts\/)([\w-]{11})/);
  content.innerHTML = `<div class="card">` + (yt
    ? `<iframe class="video" src="https://www.youtube.com/embed/${yt[1]}" allowfullscreen></iframe>`
    : `<video class="video" src="${u.video}" controls></video>`) + `</div>`;
}

function showSummary(u, content) {
  content.innerHTML = `<div class="card en"><h2>Summary</h2>
    <ul>${u.summary.map(s => `<li style="margin-bottom:10px;line-height:1.6">${s}</li>`).join("")}</ul></div>`;
}

// =====================================================
//  الاختبار
// =====================================================
function startQuiz(u, content) {
  let i = 0, score = 0;
  const mistakes = [];

  function next() {
    if (i === u.quiz.length) return finish();
    const item = u.quiz[i];
    content.innerHTML = `<div class="card">
      <div class="muted">السؤال ${i + 1} من ${u.quiz.length}</div>
      ${bar(i / u.quiz.length * 100)}
      <h3 class="en">${item.q}</h3></div>`;
    const card = content.querySelector(".card");
    item.options.forEach((opt, k) => {
      const b = document.createElement("button");
      b.className = "option";
      b.textContent = opt;
      b.onclick = () => {
        card.querySelectorAll(".option").forEach(o => o.disabled = true);
        card.querySelectorAll(".option")[item.answer].classList.add("correct");
        if (k === item.answer) score++;
        else { b.classList.add("wrong"); mistakes.push(item); }
        setTimeout(() => { i++; next(); }, 900);
      };
      card.appendChild(b);
    });
  }

  function finish() {
    const percent = Math.round(score / u.quiz.length * 100);
    if (percent > (progress.quiz[u.number] || 0)) { progress.quiz[u.number] = percent; save(); }
    const msg = percent === 100 ? "ممتاز! 🌟" : percent >= 50 ? "أحسنت، استمر 👍" : "راجع الدرس وحاول مرة أخرى 💪";
    content.innerHTML = `<div class="card" style="text-align:center">
      <div class="score">${score} / ${u.quiz.length}</div><p>${msg}</p></div>` +
      (mistakes.length ? `<h2>الأسئلة التي أخطأت فيها</h2>` + mistakes.map(m =>
        `<div class="card en"><div>${m.q}</div><b style="color:var(--good)">✔ ${m.options[m.answer]}</b></div>`
      ).join("") : "") +
      `<button class="primary">أعد الاختبار</button>`;
    content.querySelector(".primary").onclick = () => startQuiz(u, content);
  }

  next();
}

// =====================================================
//  المراجعة: بطاقات كلمات من كل الوحدات
// =====================================================
function showReview() {
  setPage("مراجعة الكلمات", "review");
  // الكلمات التي لم يحفظها الطالب بعد تأتي أولاً
  const all = openUnits().flatMap(u => u.words);
  const deck = [...all.filter(w => !progress.known[w.en]), ...all.filter(w => progress.known[w.en])];
  let i = 0, flipped = false;

  function draw() {
    if (!deck.length) { app.innerHTML = `<div class="card">لا توجد كلمات بعد.</div>`; return; }
    if (i === deck.length) {
      app.innerHTML = `<div class="card" style="text-align:center"><div class="score">🎉</div>
        <p>أنهيت المراجعة! تحفظ الآن ${all.filter(w => progress.known[w.en]).length} من ${all.length} كلمة.</p></div>
        <button class="primary">راجع من جديد</button>`;
      app.querySelector(".primary").onclick = showReview;
      return;
    }
    const w = deck[i];
    app.innerHTML = `
      <div class="muted">البطاقة ${i + 1} من ${deck.length} · المس البطاقة لترى المعنى</div>
      ${bar(i / deck.length * 100)}<br>
      <button class="card flash">${flipped ? w.ar : `<span class="en">${w.en}</span>`}
        <small>${flipped ? w.en : "المس للقلب"}</small></button>
      <button class="secondary" id="say">🔊 استمع</button>
      <div class="two">
        <button class="secondary" id="no">لا أعرفها ❌</button>
        <button class="primary" id="yes">أعرفها ✅</button>
      </div>`;
    app.querySelector(".flash").onclick = () => { flipped = !flipped; draw(); };
    app.querySelector("#say").onclick = () => speak(w.en);
    app.querySelector("#yes").onclick = () => mark(w, true);
    app.querySelector("#no").onclick  = () => mark(w, false);
  }
  function mark(w, known) {
    if (known) progress.known[w.en] = true; else delete progress.known[w.en];
    save(); i++; flipped = false; draw();
  }
  draw();
}

// =====================================================
//  صفحة التقدّم
// =====================================================
function showProgress() {
  setPage("تقدّمي", "progress");
  app.innerHTML = `<div class="card hero"><h2>إنجازك الكلي: ${pct(totalPercent())}</h2>${bar(totalPercent())}</div>` +
    openUnits().map(u => {
      const known = u.words.filter(w => progress.known[w.en]).length;
      const quiz = progress.quiz[u.number];
      return `<div class="card">
        <b>Unit ${u.number}</b> <span class="muted en">· ${u.name}</span>
        <div class="muted">أعلى درجة في الاختبار: ${quiz === undefined ? "لم يُحل بعد" : pct(quiz)}</div>
        <div class="muted">الكلمات المحفوظة: ${known} من ${u.words.length}</div>
        ${bar(unitPercent(u))}</div>`;
    }).join("") +
    `<button class="secondary" id="reset">مسح التقدّم والبدء من جديد</button>
     <button class="secondary" id="logout">🚪 تسجيل الخروج</button>`;
  app.querySelector("#logout").onclick = () => EB.logout && EB.logout();
  app.querySelector("#reset").onclick = () => {
    if (confirm("هل تريد مسح كل تقدّمك؟")) {
      progress = { quiz: {}, known: {} }; save(); showProgress();
    }
  };
}

// =====================================================
//  تثبيت التطبيق على الهاتف
// =====================================================
let installEvent = null;
window.addEventListener("beforeinstallprompt", e => {
  e.preventDefault();
  installEvent = e;
  showInstallButton();
});
function showInstallButton() {
  const box = document.getElementById("install");
  if (!box || !installEvent) return;
  box.innerHTML = `<button class="primary">📲 ثبّت التطبيق على هاتفك</button><br><br>`;
  box.querySelector("button").onclick = async () => {
    installEvent.prompt();
    await installEvent.userChoice;
    installEvent = null;
    box.innerHTML = "";
  };
}

// يجعل التطبيق يعمل بدون إنترنت (يعمل فقط عند رفعه على موقع، وليس عند فتح الملف مباشرة)
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  navigator.serviceWorker.register("sw.js");
}

// ---------- الشريط السفلي ----------
const PAGES = { home: showHome, review: showReview, progress: showProgress,
                teacher: () => EB.showTeacher() };
document.querySelectorAll("nav button").forEach(b => b.onclick = () => PAGES[b.dataset.page]());

// ---------- ما يحتاجه auth.js من هذا الملف ----------
// التطبيق لا يبدأ هنا؛ يبدأ من auth.js بعد تسجيل الدخول والموافقة
const EB = window.EB = {
  setPage, bar, pct, showHome,
  setUnits(list) { UNITS = list; },
  // يدمج تقدّم الطالب المحفوظ في حسابه مع المحفوظ على الجهاز (يأخذ الأفضل)
  loadProgress(remote) {
    if (!remote) return;
    for (const [n, score] of Object.entries(remote.quiz || {}))
      progress.quiz[n] = Math.max(score, progress.quiz[n] || 0);
    Object.assign(progress.known, remote.known || {});
    localStorage.setItem(SAVE_KEY, JSON.stringify(progress));
  },
  resetLocal() {
    progress = { quiz: {}, known: {} };
    localStorage.removeItem(SAVE_KEY);
  }
};

// =====================================================
//  auth.js — تسجيل الدخول، موافقة الأستاذ، ولوحة الطلاب
//
//  كيف يعمل:
//  1) الطالب يدخل بحساب Google ويكتب اسمه وشعبته → حالته "pending" (بانتظار الموافقة)
//  2) الأستاذ يقبله من صفحة "الطلاب" → حالته "approved" فيظهر له الكتاب
//  3) الأستاذ يستطيع إيقافه "blocked" في أي وقت
//  الأستاذ = من له مستند باسم رقم حسابه في مجموعة admins داخل Firebase
// =====================================================

import { firebaseConfig } from "./firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup,
         signInWithRedirect, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { initializeFirestore, persistentLocalCache, doc, getDoc, setDoc, updateDoc,
         deleteDoc, onSnapshot, collection, getDocs, serverTimestamp }
         from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const app = document.getElementById("app");

// إذا لم تُكتب إعدادات Firebase بعد، نُظهر رسالة واضحة بدل التعليق على "جارٍ التحميل"
if (firebaseConfig.apiKey.includes("ضع")) {
  app.innerHTML = `<div class="card error">لم تُضبط إعدادات Firebase بعد (الملف firebase-config.js).</div>`;
  throw new Error("firebase-config.js not filled in");
}

const fb   = initializeApp(firebaseConfig);
const auth = getAuth(fb);
// persistentLocalCache = يحفظ البيانات على الجهاز ليعمل التطبيق بدون إنترنت
const db   = initializeFirestore(fb, { localCache: persistentLocalCache() });

const nav = document.querySelector("nav");
const teacherBtn = document.querySelector('nav [data-page="teacher"]');
const SECTIONS = ["أ", "ب", "ج", "د"];
const CACHE_KEY = "english-book-units";   // نسخة من المحتوى للعمل بدون إنترنت

let stopWatching = null;  // لإيقاف مراقبة حالة الطالب عند الخروج
let entered = false;      // هل دخل الطالب إلى الكتاب؟

// يمنع أي نص يكتبه الطالب (مثل اسمه) من أن يُقرأ كأوامر HTML
const esc = s => String(s ?? "").replace(/[&<>"']/g, c =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// شاشة بدون الشريط السفلي (للدخول والانتظار)
function screen(html) {
  nav.style.display = "none";
  EB.setPage("English Book · 6th Science", null);
  app.innerHTML = html;
}

EB.logout = async () => {
  EB.resetLocal();
  localStorage.removeItem(CACHE_KEY);
  await signOut(auth);
};

// =====================================================
//  المتابعة: كلما تغيّر الحساب (دخول / خروج)
// =====================================================
onAuthStateChanged(auth, async user => {
  if (stopWatching) { stopWatching(); stopWatching = null; }
  entered = false;
  teacherBtn.style.display = "none";
  EB.onProgressSave = null;
  if (!user) return showLogin();

  screen(`<div class="card center">⏳ جارٍ التحقق…</div>`);

  // هل هذا الأستاذ؟
  try {
    const admin = await getDoc(doc(db, "admins", user.uid));
    if (admin.exists()) {
      teacherBtn.style.display = "";
      return enterBook(user, null);
    }
  } catch (e) { /* ليس أستاذاً أو لا يوجد إنترنت */ }

  // طالب: نراقب حالته، فإذا قبله الأستاذ يدخل فوراً دون إعادة فتح التطبيق
  stopWatching = onSnapshot(doc(db, "users", user.uid), snap => {
    if (!snap.exists()) return showRegister(user);
    const d = snap.data();
    if (d.status === "approved") {
      if (!entered) enterBook(user, d);
    } else if (d.status === "blocked") {
      entered = false;
      localStorage.removeItem(CACHE_KEY);
      showMessage("⛔", "تم إيقاف حسابك. راجع الأستاذ.", user);
    } else {
      showMessage("⏳", "تم إرسال طلبك. انتظر موافقة الأستاذ، وسيُفتح الكتاب تلقائياً.", user);
    }
  }, err => showMessage("⚠️", "تعذّر الاتصال. تأكد من الإنترنت ثم أعد فتح التطبيق.<br><small>" + esc(err.code) + "</small>", user));
});

// =====================================================
//  الشاشات
// =====================================================
function showLogin() {
  screen(`
    <div class="card center">
      <div class="big">📘</div>
      <h2>English Book · 6th Science</h2>
      <p class="muted">سجّل دخولك بحساب Google. سيصل طلبك إلى الأستاذ، وبعد موافقته يُفتح لك الكتاب.</p>
      <button class="primary" id="google">الدخول بحساب Google</button>
      <p id="err"></p>
    </div>`);
  app.querySelector("#google").onclick = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (e) {
      // بعض الهواتف تمنع النوافذ المنبثقة؛ نجرّب طريقة التحويل
      if (["auth/popup-blocked", "auth/operation-not-supported-in-this-environment",
           "auth/cancelled-popup-request"].includes(e.code)) {
        return signInWithRedirect(auth, provider);
      }
      if (e.code !== "auth/popup-closed-by-user")
        app.querySelector("#err").innerHTML = `<div class="error">تعذّر الدخول: ${esc(e.code)}</div>`;
    }
  };
}

function showRegister(user) {
  screen(`
    <div class="card">
      <h2>طلب الانضمام</h2>
      <p class="muted">اكتب اسمك الثلاثي واختر شعبتك، ثم أرسل الطلب إلى الأستاذ.</p>
      <label>الاسم الثلاثي</label>
      <input class="field" id="name" value="${esc(user.displayName || "")}" maxlength="60">
      <label>الشعبة</label>
      <select class="field" id="section">
        <option value="">— اختر —</option>
        ${SECTIONS.map(s => `<option value="${s}">${s}</option>`).join("")}
      </select>
      <button class="primary" id="send">إرسال الطلب</button>
      <button class="secondary" id="out">الدخول بحساب آخر</button>
      <p id="err"></p>
    </div>`);
  app.querySelector("#out").onclick = EB.logout;
  app.querySelector("#send").onclick = async () => {
    const name = app.querySelector("#name").value.trim();
    const section = app.querySelector("#section").value;
    const err = app.querySelector("#err");
    if (name.split(/\s+/).length < 2) return err.innerHTML = `<div class="error">اكتب اسمك كاملاً.</div>`;
    if (!section) return err.innerHTML = `<div class="error">اختر شعبتك.</div>`;
    try {
      await setDoc(doc(db, "users", user.uid), {
        name, section, email: user.email || "", status: "pending",
        createdAt: serverTimestamp()
      });
    } catch (e) {
      err.innerHTML = `<div class="error">تعذّر الإرسال: ${esc(e.code)}</div>`;
    }
  };
}

function showMessage(icon, text, user) {
  screen(`
    <div class="card center">
      <div class="big">${icon}</div>
      <p>${text}</p>
      <p class="muted en">${esc(user.email)}</p>
      <button class="secondary" id="out">تسجيل الخروج</button>
      <p class="muted" style="font-size:11px;margin-top:16px">رقم الحساب: <bdi>${esc(user.uid)}</bdi></p>
    </div>`);
  app.querySelector("#out").onclick = EB.logout;
}

// =====================================================
//  الدخول إلى الكتاب (بعد الموافقة)
// =====================================================
async function enterBook(user, data) {
  entered = true;
  screen(`<div class="card center">⏳ جارٍ تحميل الكتاب…</div>`);
  EB.setUnits(await loadUnits());

  if (data) { // طالب (وليس الأستاذ): نحفظ تقدّمه في حسابه ليراه الأستاذ
    EB.loadProgress(data.progress);
    let timer;
    EB.onProgressSave = p => {
      clearTimeout(timer);
      timer = setTimeout(() => updateDoc(doc(db, "users", user.uid),
        { progress: p, lastSeen: serverTimestamp() }).catch(() => {}), 1500);
    };
    updateDoc(doc(db, "users", user.uid), { lastSeen: serverTimestamp() }).catch(() => {});
  }
  nav.style.display = "";
  EB.showHome();
}

// الوحدات محفوظة في Firebase: مجموعة content، مستند لكل وحدة
async function loadUnits() {
  try {
    const snap = await getDocs(collection(db, "content"));
    const units = snap.docs.map(d => JSON.parse(d.data().data))
                           .sort((a, b) => a.number - b.number);
    if (units.length) localStorage.setItem(CACHE_KEY, JSON.stringify(units));
    return units;
  } catch (e) {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || "[]");
  }
}

// =====================================================
//  صفحة الأستاذ: الطلاب + رفع المحتوى
// =====================================================
let filter = "pending", sectionFilter = "";
const STATUS = { pending: "بانتظار الموافقة", approved: "المقبولون", blocked: "الموقوفون" };

EB.showTeacher = async function showTeacher() {
  EB.setPage("الطلاب", "teacher");
  app.innerHTML = `<div class="card center">⏳ جارٍ التحميل…</div>`;
  let students;
  try {
    students = (await getDocs(collection(db, "users"))).docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    app.innerHTML = `<div class="error">تعذّر تحميل الطلاب: ${esc(e.code)}</div>`;
    return;
  }
  const count = s => students.filter(x => x.status === s).length;
  const list = students
    .filter(x => x.status === filter && (!sectionFilter || x.section === sectionFilter))
    .sort((a, b) => (a.section + a.name).localeCompare(b.section + b.name, "ar"));

  app.innerHTML = `
    <div class="tabs">
      ${Object.entries(STATUS).map(([k, label]) =>
        `<button data-f="${k}" class="${k === filter ? "active" : ""}">${label} (${count(k)})</button>`).join("")}
    </div>
    <select class="field" id="sec">
      <option value="">كل الشعب</option>
      ${SECTIONS.map(s => `<option value="${s}" ${s === sectionFilter ? "selected" : ""}>شعبة ${s}</option>`).join("")}
    </select>
    <div id="list">${list.length ? "" : `<div class="card muted center">لا يوجد طلاب هنا.</div>`}</div>
    <div class="card">
      <h2>📤 رفع محتوى الكتاب</h2>
      <p class="muted">اختر ملف <b>units.js</b> من حاسوبك. سيصل المحتوى الجديد لكل الطلاب المقبولين.</p>
      <input type="file" id="file" accept=".js,.txt" class="field">
      <p id="upmsg"></p>
    </div>
    <button class="secondary" id="out">🚪 تسجيل الخروج</button>`;

  app.querySelectorAll("[data-f]").forEach(b => b.onclick = () => { filter = b.dataset.f; showTeacher(); });
  app.querySelector("#sec").onchange = e => { sectionFilter = e.target.value; showTeacher(); };
  app.querySelector("#out").onclick = EB.logout;
  app.querySelector("#file").onchange = e => uploadUnits(e.target.files[0]);

  const box = app.querySelector("#list");
  list.forEach(s => {
    const scores = Object.entries(s.progress?.quiz || {})
      .map(([n, v]) => `Unit ${esc(n)}: ${EB.pct(v)}`).join(" · ") || "لم يحل اختباراً بعد";
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <b>${esc(s.name)}</b> <span class="muted">· شعبة ${esc(s.section)}</span>
      <div class="muted en">${esc(s.email)}</div>
      ${s.status === "approved" ? `<div class="muted">الدرجات: ${scores}</div>` : ""}
      <div class="small-btns">
        ${s.status !== "approved" ? `<button class="ok" data-a="approved">✅ قبول</button>` : ""}
        ${s.status !== "blocked"  ? `<button class="stop" data-a="blocked">⛔ إيقاف</button>` : ""}
        <button class="grey" data-a="delete">🗑 حذف</button>
      </div>`;
    div.querySelectorAll("[data-a]").forEach(b => b.onclick = async () => {
      const a = b.dataset.a;
      if (a === "delete" && !confirm(`حذف ${s.name}؟ سيحتاج إلى إرسال طلب جديد.`)) return;
      b.disabled = true;
      try {
        if (a === "delete") await deleteDoc(doc(db, "users", s.id));
        else await updateDoc(doc(db, "users", s.id), { status: a });
        showTeacher();
      } catch (e) { alert("تعذّر التنفيذ: " + e.code); b.disabled = false; }
    });
    box.appendChild(div);
  });
};

// يقرأ ملف units.js ويرفع كل وحدة كمستند في Firebase
async function uploadUnits(file) {
  const msg = app.querySelector("#upmsg");
  if (!file) return;
  try {
    const text = await file.text();
    const units = new Function(text + "\n;return UNITS;")();
    if (!Array.isArray(units) || !units.length) throw new Error("لم أجد UNITS في الملف");
    msg.textContent = "⏳ جارٍ الرفع…";
    for (const u of units) {
      await setDoc(doc(db, "content", "unit-" + u.number), { number: u.number, data: JSON.stringify(u) });
    }
    EB.setUnits(units);
    localStorage.setItem(CACHE_KEY, JSON.stringify(units));
    msg.innerHTML = `<div class="ok" style="padding:10px;border-radius:10px">✅ تم رفع ${units.length} وحدات.</div>`;
  } catch (e) {
    msg.innerHTML = `<div class="error">تعذّر الرفع: ${esc(e.message || e.code)}</div>`;
  }
}

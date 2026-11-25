// =====================================================
//  sw.js — يحفظ ملفات التطبيق في الهاتف ليعمل بدون إنترنت
//  مهم: كلما عدّلت ملفات التطبيق غيّر رقم النسخة (v3 → v4) ليصل التحديث للطلاب
//  (محتوى الكتاب لا يحتاج ذلك؛ يأتي من Firebase)
// =====================================================
const VERSION = "english-book-v3";
const FILES = ["./", "index.html", "app.js", "auth.js", "firebase-config.js",
               "manifest.json", "icon-192.png", "icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)));
  self.skipWaiting();
});

// حذف النسخ القديمة
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))));
  self.clients.claim();
});

// نحفظ فقط ملفات التطبيق ومكتبة Firebase، ولا نتدخل في اتصالات Firebase نفسها
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  const ours = url.origin === location.origin || url.hostname === "www.gstatic.com";
  if (e.request.method !== "GET" || !ours) return;
  // جرّب الإنترنت أولاً (لأحدث نسخة)، وإذا لم يتوفر استعمل النسخة المحفوظة
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const copy = res.clone();
        caches.open(VERSION).then(c => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

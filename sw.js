// =====================================================
//  sw.js — يحفظ ملفات التطبيق في الهاتف ليعمل بدون إنترنت
//  مهم: كلما عدّلت المحتوى غيّر رقم النسخة (v1 → v2) ليصل التحديث للطلاب
// =====================================================
const VERSION = "english-book-v2";
const FILES = ["./", "index.html", "app.js", "units.js", "manifest.json",
               "icons/icon-192.png", "icons/icon-512.png"];

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

// جرّب الإنترنت أولاً (لأحدث محتوى)، وإذا لم يتوفر استعمل النسخة المحفوظة
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
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

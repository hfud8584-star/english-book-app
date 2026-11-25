// =====================================================
//  محتوى الكتاب — هذا هو الملف الوحيد الذي تعدّله لإضافة الدروس
// =====================================================
//  كل وحدة = كائن بين { } داخل القائمة UNITS.
//  لإضافة وحدة: انسخ الوحدة 1 كاملة، الصقها مكان وحدة مقفلة، وغيّر المحتوى.
//
//  الحقول:
//    number   رقم الوحدة
//    name     اسم الوحدة
//    reading  نصوص القراءة: كل نص = { title: العنوان، lesson: رقم الدرس، text: [ الفقرات ] }
//    words    الكلمات: en = الإنكليزي، ar = المعنى
//    quiz     الأسئلة: q = السؤال، options = الخيارات، answer = رقم الجواب الصحيح (يبدأ العد من 0)
//    summary  الملخص (كل نقطة سطر)
//    video    رابط فيديو الشرح (يوتيوب أو ملف mp4) — اتركه "" إذا لم يجهز بعد
//    locked   true = الوحدة مقفلة (لم تُضف بعد)
// =====================================================

const UNITS = [
  // ---------------- الوحدة الأولى (Student's Book ص 5–15) ----------------
  {
    number: 1,
    name: "Health",
    // القراءة: نصوص الوحدة. title = العنوان، lesson = رقم الدرس، text = الفقرات
    reading: [
      {
        title: "My friends were all watching, so I didn't want to give up", lesson: 3,
        text: [
          "When I was 16, life was great! I was finally part of the school basketball team and had loads of friends. But one day, everything changed. I was swimming in a river with my friends. It was a sunny day, and we were all having lots of fun. I decided to jump off a bridge above us. I climbed up carefully and looked down. It seemed a lot higher than when looking up from the water. It was a bit scary, but my friends were all watching, so I couldn't give up now. I closed my eyes and jumped. That was the last thing I remember.",
          "I woke up in hospital. My parents were sitting next to me. My father told me what happened: the river wasn't deep enough, and I hit the bottom when I dived.",
          "I hurt my back very seriously. Luckily, I was alive, but the doctors said I might not walk again. While my father was talking to me, I was thinking about that moment and how one decision changed my whole life. I decided then to do everything I could to walk again.",
          "After a few days, I started doing physical therapy. The days turned into weeks, the weeks into months, and I was feeling very upset because I wasn't making enough progress. I could have a regular life with my wheelchair: go to school, hang out with friends, that kind of thing. But I wanted to stand up, walk and, more than anything, go back to playing basketball.",
          "That was when the doctors told me they were trying a new technology for patients like me: an exoskeleton. It is a machine that needs to be worn and would help me to not only stand up but also to walk. I couldn't believe it! The week after, we tried it out. The feeling was absolutely amazing: after nearly six months, I was walking again!",
          "I continued my treatment, even more motivated than before. Now I'm completely recovered thanks to the amazing technology and medical professionals. They believe one day exoskeletons will replace wheelchairs completely. And yes, I'm back to playing basketball."
        ]
      },
      {
        title: "Top tips for keeping healthy", lesson: 5,
        text: [
          "1. Get enough sleep. An average of eight hours a night is about right.",
          "2. Eat a balanced diet. Make sure you eat plenty of fresh fruit and vegetables. Avoid excessive amounts of salt, sugar and animal fat.",
          "3. Never miss breakfast. It's the most important meal of the day.",
          "4. Take some exercise every day. Ideally, do sport three times a week for an hour. If you hate sport, go for a 20-minute walk every day.",
          "5. Drink plenty of water – at least a litre and a half every day. Tea, coffee and soft drinks are NOT water.",
          "6. See the dentist for regular check-ups. And brush your teeth three times a day.",
          "7. Don't drink too much coffee. Tea is better for your heart and can even lower your blood pressure.",
          "8. Don't smoke. If you do, ask a doctor for help with giving it up.",
          "9. Look after your eyes. Get them tested once a year.",
          "10. Be safe when you travel. Make sure you are up to date with vaccinations and take malaria medication if necessary."
        ]
      },
      {
        title: "Using your phone behind the wheel", lesson: 8,
        text: [
          "A: It could be argued that we shouldn't be allowed to use our phones under any circumstance when driving, but, in my opinion, when used correctly, they can be extremely useful and even prevent accidents from happening. Of course, we should never take our eyes off the road to text or check our emails, and people who break the law and do that should be punished, even by losing their licence. However, hands-free phones can be safely used to talk to people without them having to look at the phone. Naturally, you may get a little distracted, but surely the same can be said of someone talking to the driver in the car. In addition, map apps on mobile phones can help people drive in areas they don't know well if their cars don't have a satnav. Consequently, they are less likely to cause an accident as a result of not knowing where they are going.",
          "B: In my point of view, mobile phones and cars don't go together at all. Some people claim that hands-free phones are a good solution, but many accidents are caused by lack of attention, and even if you're not holding your phone, you're still distracted and more prone to causing an accident. Even navigation apps are risky because looking at the map could be enough to cause an accident. For many people, it is also true that, if the phone is at their reach, they might find it too difficult not to check it from time to time, and most people don't realize the risk in taking their eyes off the road even for a couple of seconds. Consequently, to my mind, drivers should definitely put their phones away before they go behind the wheel. Those who are caught texting while driving should be permanently banned from driving."
        ]
      },
      {
        title: "Against all odds", lesson: 9,
        text: [
          "Najla Imad Lafta was a happy little Iraqi girl who waited patiently at her doorstep for her father, Mr Imad Lafta, to come home from work. One day, however, when Najla was only three years old, disaster struck: a bomb attached to her father's car went off when Najla Imad Lafta was nearby. She was rushed to hospital and survived the shameless attack, but she lost much of her right arm and both legs.",
          "With the love of her parents and siblings and the support of the Iraqi healthcare system, which provided the necessary treatments and medication to help her, Najla Imad Lafta grew up and adjusted to life in a wheelchair. She went to school and did most things other girls her age did but still longed to run around like the other children.",
          "At the age of ten, her life would change a second time: she discovered table tennis. Even though she had to train to use her left hand to hold the racket (she was born right-handed), she practised tirelessly and soon became very skilled at the sport.",
          "Najla started taking part in competitions, and with hard daily practice, she continued improving her game. She earned a place in the Iraqi Paralympic team aged only 12, when she started receiving support like a small salary and equipment, including prostheses. These proved useful for her because she was able to play standing, which made a big difference to her game. At the age of 16, Najla became the youngest table tennis player to qualify for the Tokyo 2020 Paralympics and won gold at the 2022 Asian Para Games.",
          "In 2024, at just 19 years old, she faced her biggest sporting moment: the Paris 2024 Paralympics. She played skillfully, defeating the main names in the sport and reaching the final against Tokyo 2020 champion Maryna Lytovchenko from Ukraine. In an exciting match, Najla successfully beat her opponent by three sets to one, winning the gold medal she wanted so much and writing her name in history books.",
          "In an interview before setting off to Paris, Najla said 'Never stop, nothing is impossible. With our determination and resolve, we can achieve what we want and make our dreams a reality.'"
        ]
      }
    ],
    words: [
      // مشاكل صحية (الدرس 1 و 2)
      { en: "headache",          ar: "صداع" },
      { en: "sore throat",       ar: "التهاب / ألم الحلق" },
      { en: "temperature",       ar: "حرارة (حمّى)" },
      { en: "cold",              ar: "زكام" },
      { en: "sneeze",            ar: "يعطس" },
      { en: "swallow",           ar: "يبلع" },
      { en: "dizzy",             ar: "دائخ" },
      { en: "swollen",           ar: "متورّم" },
      { en: "bleeding",          ar: "ينزف" },
      { en: "burn",              ar: "يحرق" },
      { en: "sprain",            ar: "التواء / يلتوي (المفصل)" },
      { en: "twist your ankle",  ar: "يلوي كاحله" },
      { en: "fracture",          ar: "كسر / يكسر (عظم)" },
      { en: "wrist",             ar: "الرسغ / المعصم" },
      { en: "ankle",             ar: "الكاحل" },
      { en: "painkiller",        ar: "مسكّن ألم" },
      { en: "X-ray",             ar: "صورة أشعة" },
      { en: "plaster",           ar: "جبس" },
      // قصة عمّار (الدرس 3)
      { en: "physical therapy",  ar: "علاج طبيعي" },
      { en: "wheelchair",        ar: "كرسي متحرّك" },
      { en: "exoskeleton",       ar: "هيكل خارجي آلي (يساعد على المشي)" },
      { en: "recover",           ar: "يتعافى / يُشفى" },
      { en: "give up",           ar: "يستسلم / يترك" },
      // التدخين والصحة (الدرس 4 و 5)
      { en: "take up",           ar: "يبدأ (عادة أو هواية)" },
      { en: "habit",             ar: "عادة" },
      { en: "balanced diet",     ar: "نظام غذائي متوازن" },
      { en: "check-up",          ar: "فحص دوري" },
      { en: "blood pressure",    ar: "ضغط الدم" },
      // الهاتف والقيادة (الدرس 8)
      { en: "distracted",        ar: "مشتّت الانتباه" },
      { en: "hands-free",        ar: "بدون استخدام اليدين" },
      { en: "licence",           ar: "إجازة (سوق)" },
      { en: "banned",            ar: "ممنوع" },
      // نجلة عماد (الدرس 9)
      { en: "determination",     ar: "عزيمة / إصرار" },
      { en: "prostheses",        ar: "أطراف صناعية" },
      { en: "achieve",           ar: "يحقّق" }
    ],
    quiz: [
      // القواعد
      { q: "I ___ to school when a car nearly hit me.",
        options: ["cycled", "was cycling", "am cycling"], answer: 1 },
      { q: "Samira got hurt because she ___ a seat belt.",
        options: ["wasn't wearing", "doesn't wear", "isn't wearing"], answer: 0 },
      { q: "I was ice skating, and I ___ over.",
        options: ["was falling", "fall", "fell"], answer: 2 },
      { q: "Most smokers ___ the habit when they are teenagers.",
        options: ["give up", "take up", "look after"], answer: 1 },
      { q: "You should really ___ vaping. It's a terrible habit!",
        options: ["give up", "take up", "pick up"], answer: 0 },
      { q: "Films ___ black and white. Now they are usually in colour.",
        options: ["use to be", "are used to", "used to be"], answer: 2 },
      { q: "People ___ computers, but now everyone has them.",
        options: ["didn't use to have", "didn't used to have", "don't use to have"], answer: 0 },
      { q: "Which phrase do we use to give an opinion?",
        options: ["As a result", "In my opinion", "Firstly"], answer: 1 },
      { q: "Which phrase do we use to talk about results?",
        options: ["Consequently", "Personally, I think", "Last but not least"], answer: 0 },
      // المفردات
      { q: "I've got a sore throat. It hurts so much that I can't ___.",
        options: ["sneeze", "swallow", "walk"], answer: 1 },
      { q: "I ___ my ankle playing football.",
        options: ["twisted", "burnt", "bled"], answer: 0 },
      // الاستيعاب
      { q: "Why did Ammar hurt his back?",
        options: ["He fell off his bike.", "He was playing basketball.", "The river wasn't deep enough."], answer: 2 },
      { q: "What helped Ammar to walk again?",
        options: ["An exoskeleton", "A wheelchair", "Painkillers"], answer: 0 },
      { q: "Which sport does Najla Imad Lafta play?",
        options: ["Swimming", "Table tennis", "Basketball"], answer: 1 },
      { q: "Najla won the gold medal at the ___.",
        options: ["Tokyo 2020 Paralympics", "Paris 2024 Paralympics", "Olympic Games"], answer: 1 },
      { q: "Writer B thinks drivers should ___.",
        options: ["use hands-free phones", "use navigation apps", "put their phones away before driving"], answer: 2 }
    ],
    summary: [
      "Minor health problems: I've got a sore throat / a headache. I twisted my ankle. I sprained my wrist.",
      "Past continuous + past simple: I was cycling to school when a car nearly hit me. (was/were + -ing for the long action, past simple for the short action)",
      "Phrasal verbs = verb + preposition, often with a new meaning: take up (start a habit), give up (stop), pick up.",
      "used to + verb = things that were true in the past but are not true now: Films used to be black and white.",
      "Negative: didn't use to: People didn't use to have mobile phones.",
      "Giving opinions: In my opinion, … / I feel that … / Personally, I think …",
      "Listing points: Firstly, … / Let's start with … / Next, … / Furthermore, … / Finally, … / Last but not least, …",
      "Causes: One reason is that … / Because of … / This is caused by …",
      "Results: As a result, … / Consequently, … / Therefore, …"
    ],
    video: ""
  },
  { number: 2, name: "Coming soon", locked: true },
  { number: 3, name: "Coming soon", locked: true },
  { number: 4, name: "Coming soon", locked: true },
  { number: 5, name: "Coming soon", locked: true },
  { number: 6, name: "Coming soon", locked: true },
  { number: 7, name: "Coming soon", locked: true },
  { number: 8, name: "Coming soon", locked: true }
];

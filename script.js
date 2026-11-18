(function () {
  "use strict";
  /* ===== إعدادات قابلة للتعديل ===== */
  var CONFIG = {
    openDate: "2026-11-22T00:00:00+03:00", // 22 نوفمبر 2026 – 00:00 بتوقيت الرياض
    destinationTitle: "تفاصيل الوجهة",
    // ضع الإعلان الرسمي هنا لاحقًا (يظهر عند الضغط على «اكتشف الوجهة» بعد الموعد)
    destinationBody: "سيُضاف الإعلان الرسمي هنا.",
    championship: "أكبر بطولة ترافع جزائي في المملكة."
  };
  var $ = function (s) { return document.querySelector(s); };
  var log = $("#log"), wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  var target = new Date(CONFIG.openDate).getTime(), isOpen = function () { return Date.now() >= target; };
  var sound = false, ctx = null;

  function beep(f, d) {
    if (!sound) return;
    try { ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      var o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.value = f; g.gain.value = .06;
      o.connect(g); g.connect(ctx.destination); o.start(); g.gain.exponentialRampToValueAtTime(.0001, ctx.currentTime + (d || .3)); o.stop(ctx.currentTime + (d || .3)); } catch (e) {}
  }
  $("#soundBtn").onclick = function () { sound = !sound; this.textContent = sound ? "🔊" : "🔇"; beep(600); };

  function down() { log.scrollTo({ top: log.scrollHeight, behavior: "smooth" }); }
  function add(node) { log.appendChild(node); down(); return node; }
  function el(tag, cls, html) { var n = document.createElement(tag); if (cls) n.className = cls; if (html) n.innerHTML = html; return n; }
  async function say(text, cls) {
    var t = add(el("div", "msg typing", "<i></i><i></i><i></i>")); await wait(900 + Math.min(text.length * 15, 900));
    t.className = "msg " + (cls || ""); t.textContent = text; beep(cls ? 300 : 520, .15); down();
  }
  function card(html, cls) { return add(el("div", "tcard " + (cls || ""), html)); }
  function btnWait(label, host) { return new Promise(function (res) {
    var b = el("button", "pill line", label); host.appendChild(b); b.onclick = function () { b.disabled = true; res(); }; }); }

  /* العداد */
  function pad(n) { return String(n).padStart(2, "0"); }
  function startCountdown(box) {
    function tick() {
      var d = Math.max(0, target - Date.now()), s = Math.floor(d / 1000);
      var v = [Math.floor(s / 86400), Math.floor(s % 86400 / 3600), Math.floor(s % 3600 / 60), s % 60];
      box.querySelectorAll("[data-v]").forEach(function (n, i) { n.textContent = pad(v[i]); });
      var open = isOpen();
      box.querySelector(".status").textContent = open ? "المسار متاح" : "مسار مغلق مؤقتًا";
      box.querySelector(".status").className = "status st" + (open ? " live" : "");
      box.querySelector("[data-go]").textContent = open ? "اكتشف الوجهة" : "فتح المسار — 22 نوفمبر";
      box.querySelector("[data-lock]").style.opacity = open ? 0 : 1;
    }
    tick(); setInterval(tick, 1000);
  }

  async function story() {
    await say("حياك الله! أنا مُعين، مساعد نادي العدالة.\n\nيبدو أن النظام واجه مسارًا غير مألوف، وأنا أحاول الآن فهم ما حدث.");
    await say("خلني أراجع سجلات النادي وأشوف وين وصلنا…");
    await wait(500);
    /* المشهد الثالث */
    var tr = card('<div class="trk"><span class="no">01</span><span class="badge on"><i></i>الحالة: مسار قائم</span></div><h3>البطولة النيابية</h3><p>أكبر بطولة ترافع جزائي في المملكة.</p><button class="pill line" data-a>استكشاف المشروع</button>', "known");
    var un = card('<div class="trk"><span class="no q">؟</span><span class="badge"><i></i>الحالة: غير مكتشف</span></div><h3>مسار مجهول</h3><p>لا توجد بيانات مسجلة لهذا المسار.</p><button class="pill fill" data-b>اكتشاف المسار</button>', "unknown");
    tr.querySelector("[data-a]").onclick = function () {
      var c = card('<h3>البطولة النيابية</h3><p>' + CONFIG.championship + '</p><button class="pill line">عودة</button>');
      c.querySelector("button").onclick = function () { c.remove(); down(); }; beep(500);
    };
    un.querySelector("[data-b]").onclick = function () { un.querySelector("[data-b]").disabled = true; tr.querySelector("[data-a]").disabled = true; discover(); beep(440); };
  }

  async function discover() {
    var s = card('<p>جارٍ البحث في سجلات النادي…</p><div class="bar"><i></i></div>'); await wait(2400);
    s.innerHTML = "<p>تعذّر العثور على بيانات لهذا المسار.</p><p class='st'>لم يتم تسجيل هذا المسار ضمن المشاريع السابقة للنادي.</p>"; beep(250, .4);
    await wait(900);
    await say("لحظة… هذا المسار جديد تمامًا!\n\nما سبق رصدناه ضمن مشاريع النادي، ويبدو أننا أمام وجهة مختلفة.");
    await say("تم اكتشاف مشروع جديد.\n\nلكن تفاصيل هذه الوجهة لم تُفتح بعد.", "sys");
    await wait(500); gate();
  }

  function gate() {
    var g = card('<div class="gate"><p class="kick">مسار جديد قيد الاكتشاف</p>' +
      '<svg viewBox="0 0 320 205" role="img" aria-label="بوابة مغلقة في نهاية مسار"><defs><radialGradient id="gl"><stop offset="0" stop-color="#d9c3a0" stop-opacity=".55"/><stop offset="1" stop-color="#d9c3a0" stop-opacity="0"/></radialGradient></defs>' +
      '<circle cx="160" cy="105" r="100" fill="url(#gl)"/>' +
      '<path class="path" d="M20 198C110 198 40 174 120 172S232 170 202 160S160 158 160 152" fill="none" stroke="#967852" stroke-width="2.5" stroke-linecap="round"/>' +
      '<g fill="#967852"><circle cx="20" cy="198" r="4"/><circle cx="120" cy="172" r="3"/><circle cx="202" cy="160" r="3"/></g>' +
      '<rect x="100" y="84" width="14" height="68" rx="2" fill="#E7DFD3" stroke="#967852" stroke-width="2"/><rect x="206" y="84" width="14" height="68" rx="2" fill="#E7DFD3" stroke="#967852" stroke-width="2"/>' +
      '<circle cx="107" cy="78" r="5" fill="#967852"/><circle cx="213" cy="78" r="5" fill="#967852"/>' +
      '<path d="M114 152V92a46 46 0 0 1 92 0v60z" fill="#F8F5F0" stroke="#967852" stroke-width="2.5"/><path d="M160 46v106" stroke="#967852" stroke-width="2"/>' +
      '<path d="M124 152V94a36 36 0 0 1 72 0v58" fill="none" stroke="#E0D3BF" stroke-width="1.5"/>' +
      '<g data-lock><circle cx="160" cy="112" r="17" fill="#fff" stroke="#967852" stroke-width="2"/><rect x="149" y="110" width="22" height="17" rx="3.5" fill="#967852"/><path d="M153 110v-6a7 7 0 0 1 14 0v6" fill="none" stroke="#967852" stroke-width="3" stroke-linecap="round"/><circle cx="160" cy="118" r="2.2" fill="#fff"/></g></svg>' +
      '<span class="status st">مسار مغلق مؤقتًا</span><p class="lbl">موعد فتح المسار</p><div class="date">22 نوفمبر 2026</div><p class="note">تفاصيل الوجهة ستُكشف عند فتح المسار.</p>' +
      '<div class="cd"><div><b data-v>00</b><small>يوم</small></div><div><b data-v>00</b><small>ساعة</small></div><div><b data-v>00</b><small>دقيقة</small></div><div><b data-v>00</b><small>ثانية</small></div></div>' +
      '<button class="pill fill" data-go></button></div>', "gatec");
    startCountdown(g);
    g.querySelector("[data-go]").onclick = async function () {
      var b = this; b.disabled = true;
      if (!isOpen()) { beep(300); await say("على مهلك! باقي على فتح المسار موعد محدد…\n\nنلتقي في 22 نوفمبر، وقتها بتكتشف وش ينتظرك."); }
      else { beep(700); card("<h3>" + CONFIG.destinationTitle + "</h3><p>" + CONFIG.destinationBody + "</p>", "known"); }
      b.disabled = false; next(g);
    };
  }
  var nextShown = false;
  function next(host) {
    if (nextShown) return; nextShown = true;
    var c = card('<button class="pill line">متابعة</button>'); c.querySelector("button").onclick = finale;
  }

  /* النهاية */
  var T = ["تم تغيير وجهتك!", "تعددت الطرق… والوجهة واحدة.", "هل أنت مستعد لما هو قادم؟", "22 نوفمبر", "قريبًا."];
  function finale() {
    ["e1", "e2", "e3", "e4", "e5"].forEach(function (id, i) { document.getElementById(id).textContent = T[i]; });
    $("#chat").hidden = true; $("#end").classList.add("on"); beep(660, .6); drawGrid();
  }
  function drawGrid() {
    var c = $("#grid"), x = c.getContext("2d"); c.width = innerWidth; c.height = innerHeight; var t = 0;
    (function f() { if (!$("#end").classList.contains("on")) return; x.clearRect(0, 0, c.width, c.height); x.strokeStyle = "rgba(139,224,168,.18)"; x.lineWidth = 1;
      for (var i = 0; i < c.width; i += 48) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, c.height); x.stroke(); }
      for (var j = 0; j < c.height; j += 48) { x.beginPath(); x.moveTo(0, j); x.lineTo(c.width, j); x.stroke(); }
      x.strokeStyle = "rgba(139,224,168,.7)"; x.lineWidth = 3; x.setLineDash([14, 14]); x.lineDashOffset = -t; t += .6;
      x.beginPath(); x.moveTo(0, c.height * .85); x.bezierCurveTo(c.width * .3, c.height * .6, c.width * .6, c.height * .95, c.width, c.height * .55); x.stroke(); x.setLineDash([]);
      requestAnimationFrame(f); })();
  }
  $("#again").onclick = function () { location.reload(); };

  /* الخلل التمثيلي */
  var started = false;
  async function glitch() {
    if (started) return; started = true;
    document.body.classList.add("glitch"); beep(180, .5);
    await wait(900); $("#sys").hidden = false;
    await wait(2000); $("#sys").hidden = true;
    document.body.classList.remove("glitch"); document.body.classList.add("dim");
    $("#chat").hidden = false; story();
  }
  document.querySelectorAll("[data-fake]").forEach(function (b) { b.onclick = glitch; });
  setTimeout(glitch, 3500 + Math.random() * 1500);
})();

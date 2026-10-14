/* PPTX Native · site interactions */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGsap = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";
  var desktop = window.matchMedia("(min-width: 981px)");
  var REPO = "siddharthrath1999/pptx-native";

  /* ---------- smooth scroll ---------- */
  var lenis = null;
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);
  if (!reduce && typeof window.Lenis !== "undefined") {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    if (hasGsap) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(0);
    }
  }
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      var el = id.length > 1 ? $(id) : document.body;
      if (!el) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(el, { offset: -20 }); else el.scrollIntoView({ behavior: "smooth" });
    });
  });
  var nav = $(".nav");
  window.addEventListener("scroll", function () { nav.classList.toggle("scrolled", window.scrollY > 40); }, { passive: true });

  /* ---------- reveal ---------- */
  if (hasGsap && !reduce) {
    ScrollTrigger.batch(".rv", {
      start: "top 88%",
      onEnter: function (els) { gsap.to(els, { opacity: 1, y: 0, duration: 1.1, ease: "expo.out", stagger: 0.08, overwrite: true }); }
    });
  } else {
    document.documentElement.classList.remove("js");
  }

  /* ---------- hero: typing prompt ---------- */
  var prompts = [
    "Make a fun learning deck that teaches how UPI payments work.",
    "Make a 45-slide market analysis of India's credit card issuers.",
    "Benchmark India's six quick commerce apps for our strategy team.",
    "Turn the attached sheet into a quarterly review with charts."
  ];
  var typed = $("#typed");
  (function typeLoop(pi) {
    var text = prompts[pi % prompts.length], i = 0;
    if (reduce) { typed.textContent = prompts[0]; return; }
    (function step() {
      typed.textContent = text.slice(0, i++);
      if (i <= text.length) setTimeout(step, 28 + Math.random() * 40);
      else setTimeout(function () { erase(text.length); }, 2600);
    })();
    function erase(n) {
      typed.textContent = text.slice(0, n);
      if (n > 0) setTimeout(function () { erase(n - 2); }, 14);
      else setTimeout(function () { typeLoop(pi + 1); }, 300);
    }
  })(0);

  /* ---------- hero: slides fan out of the prompt ---------- */
  var cards = $$(".fan-card");
  if (hasGsap && !reduce) {
    var n = cards.length, mid = (n - 1) / 2;
    var spread = function () { return Math.min(window.innerWidth * 0.17, 230); };
    gsap.set(cards, { opacity: 0, yPercent: 40, z: -500, rotateX: 50, scale: 0.5 });
    var tl = gsap.timeline({ scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom bottom", scrub: 1 } });
    tl.to(".hero-copy", { y: function () { return -window.innerHeight * 0.3; }, scale: 0.82, duration: 1, ease: "none" }, 0)
      .to(".hero-copy .lead, .hero-copy h1, .hero-copy .eyebrow", { opacity: 0, duration: 0.6 }, 0)
      .to("#scrollHint", { opacity: 0, duration: 0.2 }, 0);
    cards.forEach(function (c, i) {
      var o = i - mid;
      tl.to(c, {
        opacity: 1, scale: 1, z: function () { return -Math.abs(o) * 90; },
        x: function () { return o * spread(); },
        y: function () { return window.innerHeight * 0.12 + Math.abs(o) * Math.abs(o) * 10; },
        yPercent: 0, rotateY: -o * 13, rotateZ: o * 2.5, rotateX: 6,
        duration: 1, ease: "power2.out"
      }, 0.25 + Math.abs(o) * 0.06);
    });
    tl.to("#heroStats", { opacity: 1, y: -10, duration: 0.4 }, 1.1);
  } else {
    $("#heroStats").style.opacity = 1;
  }

  /* ---------- 3D tilt + cursor glow ---------- */
  function tilt(el, max) {
    if (reduce) return;
    el.addEventListener("mousemove", function (e) {
      var r = el.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      el.style.setProperty("--mx", px * 100 + "%");
      el.style.setProperty("--my", py * 100 + "%");
      el.style.transform = "rotateX(" + ((0.5 - py) * max) + "deg) rotateY(" + ((px - 0.5) * max) + "deg) translateZ(0)";
    });
    el.addEventListener("mouseleave", function () { el.style.transform = ""; });
  }
  $$(".tilt").forEach(function (el) { tilt(el, 14); });

  /* ---------- how it works: pinned steps ---------- */
  var steps = $$(".step"), scenes = $$(".scene"), bar = $("#stepsBar");
  function setStep(i) {
    steps.forEach(function (s, k) { s.classList.toggle("active", k === i); });
    scenes.forEach(function (s, k) { s.classList.toggle("active", k === i); });
    var a = steps[i], list = $("#stepsList");
    if (a && bar) bar.style.height = (a.offsetTop + a.offsetHeight / 2 - 18) + "px";
    if (list) list.dataset.i = i;
  }
  var makingST = null;
  if (hasGsap && !reduce) {
    ScrollTrigger.matchMedia({
      "(min-width: 981px)": function () {
        makingST = ScrollTrigger.create({
          trigger: "#makingPin", start: "top top", end: "+=" + (steps.length * 70) + "%", pin: true, scrub: true,
          onUpdate: function (self) { setStep(Math.min(steps.length - 1, Math.floor(self.progress * steps.length))); }
        });
        return function () { makingST = null; };
      }
    });
  }
  var autoStep = null;
  function startAuto() {
    if (makingST || autoStep) return;
    autoStep = setInterval(function () {
      var cur = steps.findIndex(function (s) { return s.classList.contains("active"); });
      setStep((cur + 1) % steps.length);
    }, 3200);
  }
  steps.forEach(function (s, i) {
    s.addEventListener("click", function () {
      if (makingST) {
        var y = makingST.start + (i + 0.5) / steps.length * (makingST.end - makingST.start);
        if (lenis) lenis.scrollTo(y); else window.scrollTo({ top: y, behavior: "smooth" });
      } else { clearInterval(autoStep); autoStep = null; setStep(i); }
    });
  });
  setStep(0);
  setTimeout(function () { if (!makingST) startAuto(); }, 800);

  /* ---------- looks ---------- */
  var looks = [
    ["editorial-warm", "Editorial warm", "Warm paper, soft cards, quiet confidence.", ["#f6f5f1", "#141414", "#ffd43b", "#c6e8cf"]],
    ["boardroom-navy", "Boardroom navy", "Serif headlines and one strong blue for board papers.", ["#ffffff", "#0f1b2d", "#1f5eff", "#00a389"]],
    ["executive-slate", "Executive slate", "Cool slate and deep green for strategy and operations.", ["#f2f4f5", "#1f2933", "#0b6e4f", "#c2410c"]],
    ["mono-minimal", "Mono minimal", "Greyscale with one sharp accent, for product readouts.", ["#fafafa", "#111111", "#e4572e", "#bdbdbd"]],
    ["classic-serif", "Classic serif", "Cream, brick and forest, for reports that read like books.", ["#fbf8f3", "#2b2118", "#9c3d2a", "#2f5d50"]],
    ["dark-tech", "Dark tech", "Near-black with cyan light, for engineering and launches.", ["#0e1116", "#f2f4f8", "#5eead4", "#7c9cff"]],
    ["playful-bright", "Playful bright", "Round shapes and happy colour, for workshops and teaching.", ["#fff9ef", "#1d1b3a", "#ff5c7a", "#3d5afe"]],
    ["soft-pastel", "Soft pastel", "Lilac and mint, for people and culture topics.", ["#f7f5fb", "#2a2540", "#8b7cf6", "#7fd1c7"]],
    ["bold-contrast", "Bold contrast", "Black, white and red, for manifestos and launches.", ["#ffffff", "#000000", "#ff3b1d", "#0047ff"]]
  ];
  var lookList = $("#lookList"), lookFrame = $("#lookFrame"), lookDesc = $("#lookDesc"), lookTimer = null, lookIdx = 0;
  looks.forEach(function (l, i) {
    var img = new Image(); img.src = "assets/looks/" + l[0] + ".jpg"; img.alt = l[1] + " look applied to a comparison slide"; if (i === 0) img.className = "on";
    lookFrame.appendChild(img);
    var b = document.createElement("button");
    b.className = "look-btn" + (i === 0 ? " active" : "");
    b.innerHTML = '<span class="sw">' + l[3].map(function (c) { return '<i style="background:' + c + '"></i>'; }).join("") + '</span><span class="name">' + l[1] + "</span>";
    b.setAttribute("aria-label", l[1]);
    b.addEventListener("click", function () { stopLooks(); showLook(i); });
    lookList.appendChild(b);
  });
  function showLook(i) {
    lookIdx = i;
    $$("img", lookFrame).forEach(function (im, k) { im.classList.toggle("on", k === i); });
    $$(".look-btn", lookList).forEach(function (b, k) { b.classList.toggle("active", k === i); });
    lookDesc.innerHTML = "<b>" + looks[i][1] + ".</b> " + looks[i][2];
  }
  function stopLooks() { clearInterval(lookTimer); lookTimer = null; }
  showLook(0);
  if (!reduce && "IntersectionObserver" in window) {
    new IntersectionObserver(function (ents) {
      ents.forEach(function (e) {
        if (e.isIntersecting && !lookTimer && !lookFrame.dataset.touched) lookTimer = setInterval(function () { showLook((lookIdx + 1) % looks.length); }, 2600);
        if (!e.isIntersecting) stopLooks();
      });
    }, { threshold: 0.4 }).observe(lookFrame);
    lookList.addEventListener("click", function () { lookFrame.dataset.touched = "1"; });
  }

  /* ---------- backdrop crossfade (Gemini-style) ---------- */
  function backdrop(el) {
    var a = new Image(), b = new Image(), front = a;
    a.alt = b.alt = ""; el.appendChild(a); el.appendChild(b);
    return function (src) {
      if (!src || front.getAttribute("src") === src) return;
      var back = front === a ? b : a;
      back.onload = function () { back.classList.add("on"); front.classList.remove("on"); front = back; };
      back.src = src;
    };
  }

  /* ---------- layouts ---------- */
  var L = [
    ["Cover", "Title, subtitle, tags and your palette.", "story", 1], ["Agenda", "Numbered parts as cards.", "story", 2],
    ["Section divider", "Big number, part title, new tone.", "story", 3], ["Statement", "One sentence that deserves the room.", "story", 4],
    ["Big number", "One figure, what it means, side stats.", "data", 5], ["KPI tiles", "Two to five headline metrics with deltas.", "data", 6],
    ["Chart", "Native chart with a takeaway panel.", "data", 7], ["Chart pair", "Two charts side by side.", "data", 9],
    ["Waterfall", "Bridge from one total to another.", "data", 10], ["Bar list", "Ranked bars for benchmarks.", "data", 11],
    ["Split bar", "Where a total goes, piece by piece.", "data", 12], ["Table", "Native table with a highlighted row.", "data", 13],
    ["Heatmap", "Values shaded by size.", "data", 14], ["Scorecard", "Entities scored on criteria.", "data", 15],
    ["Timeline", "Milestones in order.", "flow", 17], ["Process", "Steps with icons and arrows.", "flow", 18],
    ["Funnel", "Stages with conversion.", "flow", 19], ["2x2 matrix", "Positions on two axes.", "flow", 20],
    ["Layers", "Stacks and architectures.", "flow", 21], ["Roadmap", "Lanes of work across quarters.", "flow", 22],
    ["Cards", "Parallel ideas with icons and stats.", "story", 24], ["Comparison", "Options side by side.", "story", 26],
    ["Two column", "Two halves of an argument.", "story", 27], ["Bullets", "A short list, used sparingly.", "story", 28],
    ["Quiz question", "Lettered options for the room.", "teach", 29], ["Pros and cons", "For and against.", "story", 30],
    ["Before and after", "What changed.", "story", 31], ["Quote", "A real voice, credited.", "story", 32],
    ["Runbook steps", "Owner, time and command per step.", "teach", 33], ["Code", "Monospace panel with notes.", "teach", 34],
    ["Free canvas", "Anything the others don't cover.", "flow", 35], ["Recap", "What to remember from a part.", "teach", 36],
    ["Next steps", "Actions with owners and dates.", "story", 37], ["Sources", "Numbered references.", "story", 38]
  ];
  var grid = $("#posterGrid"), showAll = false, filter = "all";
  var setLayoutBg = backdrop($("#layoutBackdrop"));
  L.forEach(function (l, i) {
    var src = "assets/layouts/l" + String(l[3]).padStart(2, "0") + ".jpg";
    var el = document.createElement("article");
    el.className = "poster"; el.dataset.cat = l[2]; el.dataset.i = i;
    el.innerHTML = '<img loading="lazy" src="' + src + '" alt="' + l[0] + ' layout"><h4>' + l[0] + "</h4><p>" + l[1] + "</p>";
    el.addEventListener("mouseenter", function () { setLayoutBg(src); });
    tilt(el, 8);
    grid.appendChild(el);
  });
  function applyFilter() {
    var shown = 0;
    $$(".poster", grid).forEach(function (p) {
      var ok = filter === "all" || p.dataset.cat === filter;
      var vis = ok && (showAll || filter !== "all" || shown < 12);
      p.classList.toggle("hide", !vis);
      if (vis) shown++;
    });
    $("#showAll").parentNode.style.display = (filter === "all" && !showAll) ? "" : "none";
    if (hasGsap) ScrollTrigger.refresh();
  }
  $$("#layoutFilters button").forEach(function (b) {
    b.addEventListener("click", function () {
      $$("#layoutFilters button").forEach(function (x) { x.classList.toggle("active", x === b); });
      filter = b.dataset.f; applyFilter();
    });
  });
  $("#showAll").addEventListener("click", function () { showAll = true; applyFilter(); });
  applyFilter();
  setLayoutBg("assets/layouts/l06.jpg");

  /* ---------- examples + lightbox ---------- */
  var EX = [
    ["upi", "How UPI works", "Learning deck · cream, saffron and navy", ["60 slides", "6 quizzes", "Notes on every slide"], [1, 6, 9, 12, 31, 36, 52, 55]],
    ["cards", "India's credit card market", "Market analysis · boardroom navy", ["45 slides", "5 parts", "40 issuers"], [1, 3, 6, 14, 16, 20, 36, 40]],
    ["qc", "Quick commerce benchmark", "Competitive benchmark · editorial slate", ["47 slides", "11 charts", "6 platforms"], [1, 4, 6, 17, 22, 28, 34, 41]]
  ];
  var exRow = $("#exRow"), setExBg = backdrop($("#exBackdrop"));
  var lb = $("#lightbox"), lbImg = $("#lbImg"), lbStrip = $("#lbStrip"), lbTitle = $("#lbTitle"), lbList = [], lbI = 0;
  function src(key, p) { return "assets/examples/" + key + "-" + String(p).padStart(2, "0") + ".jpg"; }
  EX.forEach(function (e) {
    var b = document.createElement("button");
    b.className = "ex-card";
    b.innerHTML = '<div class="cover"><img loading="lazy" src="' + src(e[0], e[4][0]) + '" alt="Cover of the ' + e[1] + ' deck"></div><div class="meta"><h3>' + e[1] + "</h3><p>" + e[2] + '</p><div class="stats">' + e[3].map(function (s) { return '<span class="chip">' + s + "</span>"; }).join("") + "</div></div>";
    b.addEventListener("mouseenter", function () { setExBg(src(e[0], e[4][1])); });
    b.addEventListener("click", function () { openLb(e); });
    tilt(b, 7);
    exRow.appendChild(b);
  });
  setExBg(src("upi", 6));
  function openLb(e) {
    lbList = e[4].map(function (p) { return src(e[0], p); }); lbTitle.textContent = e[1];
    lbStrip.innerHTML = "";
    lbList.forEach(function (s, i) { var t = new Image(); t.src = s; t.alt = "Slide " + (i + 1); t.addEventListener("click", function () { showLb(i); }); lbStrip.appendChild(t); });
    showLb(0); lb.classList.add("open"); if (lenis) lenis.stop();
  }
  function showLb(i) { lbI = (i + lbList.length) % lbList.length; lbImg.src = lbList[lbI]; $$("img", lbStrip).forEach(function (t, k) { t.classList.toggle("on", k === lbI); }); }
  function closeLb() { lb.classList.remove("open"); if (lenis) lenis.start(); }
  $("#lbClose").addEventListener("click", closeLb);
  lb.addEventListener("click", function (e) { if (e.target === lb || e.target.classList.contains("lb-main")) closeLb(); });
  document.addEventListener("keydown", function (e) {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") closeLb(); if (e.key === "ArrowRight") showLb(lbI + 1); if (e.key === "ArrowLeft") showLb(lbI - 1);
  });

  /* ---------- setup: tabs ---------- */
  $$(".tabs button").forEach(function (b) {
    b.addEventListener("click", function () {
      $$(".tabs button").forEach(function (x) { x.classList.toggle("active", x === b); });
      $$(".setup-panel").forEach(function (p) { p.classList.toggle("active", p.id === "tab-" + b.dataset.tab); p.style.opacity = 1; p.style.transform = "none"; });
      if (b.dataset.tab === "agy") playTerm();
      if (hasGsap) ScrollTrigger.refresh();
    });
  });

  /* ---------- setup: Gemini app walkthrough ---------- */
  var W = [
    ["Download the skill", "Get pptx-native.zip from this page. Keep it zipped.", "github.com/" + REPO, [20, 22], false],
    ["Open Customise, then Skills", "In Gemini's left menu, click Customise and open the Skills tab.", "gemini.google.com/customize", [42, 24], true],
    ["Click Create, then Upload", "The Create button sits at the top right of your skills.", "gemini.google.com/customize/skills", [74, 45], true],
    ["Choose the zip and click Create", "Gemini scans it, shows the skill, and you confirm.", "gemini.google.com/customize/skills", [88, 82], true],
    ["Start a Task and ask", "New chat, switch on Task, type @pptx-native and describe your deck.", "gemini.google.com/app", [50, 62], false]
  ];
  var walk = $("#walk"), wi = 0, hot = $("#hotspot"), mscreens = $$(".m-screen");
  W.forEach(function (w, i) {
    var b = document.createElement("button");
    b.innerHTML = '<span class="n">' + (i + 1) + "</span><span><b>" + w[0] + '</b><span class="d">' + w[1] + "</span></span>";
    b.addEventListener("click", function () { showWalk(i); });
    walk.appendChild(b);
  });
  function showWalk(i) {
    wi = Math.max(0, Math.min(W.length - 1, i));
    $$("button", walk).forEach(function (b, k) { b.classList.toggle("active", k === wi); });
    mscreens.forEach(function (s, k) { s.classList.toggle("active", k === wi); });
    $("#mockUrl").textContent = W[wi][2];
    $("#sideCustom").classList.toggle("hl", W[wi][4]);
    hot.style.left = W[wi][3][0] + "%"; hot.style.top = W[wi][3][1] + "%";
    $("#walkNext").textContent = wi === W.length - 1 ? "Start over" : "Next step";
  }
  $("#walkNext").addEventListener("click", function () { showWalk(wi === W.length - 1 ? 0 : wi + 1); });
  $("#walkPrev").addEventListener("click", function () { showWalk(wi - 1); });
  showWalk(0);

  /* ---------- setup: Antigravity terminal ---------- */
  var CMD = {
    mac: "curl -fsSL https://raw.githubusercontent.com/" + REPO + "/main/install.sh | bash",
    win: "irm https://raw.githubusercontent.com/" + REPO + "/main/install.ps1 | iex",
    npx: "npx github:" + REPO
  };
  var termCmd = $("#termCmd"), osNow = "mac", termTimer = [];
  function playTerm() {
    termTimer.forEach(clearTimeout); termTimer = [];
    var lines = $$("#termOut div");
    lines.forEach(function (d) { d.classList.remove("in"); });
    var full = CMD[osNow], i = 0;
    termCmd.textContent = "";
    (function typeCmd() {
      termCmd.textContent = full.slice(0, i++);
      if (i <= full.length) termTimer.push(setTimeout(typeCmd, reduce ? 0 : 14));
      else lines.forEach(function (d, k) { termTimer.push(setTimeout(function () { d.classList.add("in"); }, 300 + k * 260)); });
    })();
  }
  $$("#osTabs button").forEach(function (b) {
    b.addEventListener("click", function () {
      $$("#osTabs button").forEach(function (x) { x.classList.toggle("active", x === b); });
      osNow = b.dataset.os; playTerm();
    });
  });
  function copy(text, btn, label) {
    var done = function () { btn.textContent = "Copied"; setTimeout(function () { btn.textContent = label; }, 1600); };
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, done); else done();
  }
  $("#copyCmd").addEventListener("click", function () { copy(CMD[osNow], this, "Copy"); });
  termCmd.textContent = CMD.mac;

  /* ---------- prompt builder ---------- */
  var built = $("#builtText"), topic = $("#topic");
  function pick(key) { return $$('[data-key="' + key + '"] button.active').map(function (b) { return b.textContent; }); }
  function compose() {
    var deck = pick("deck")[0], aud = pick("aud")[0], len = pick("len")[0], style = pick("style")[0], extra = pick("extra");
    var t = "Make a " + len + "-slide " + deck + " on " + (topic.value.trim() || "your topic") + " for " + aud + ". Style: " + style + ".";
    if (extra.length) t += " Include " + extra.join(", ").replace(/, ([^,]*)$/, " and $1") + ".";
    built.textContent = t;
  }
  $$("#builderOpts .opt-group[data-key]").forEach(function (g) {
    var multi = g.dataset.multi === "1";
    $$("button", g).forEach(function (b) {
      b.addEventListener("click", function () {
        if (multi) b.classList.toggle("active");
        else $$("button", g).forEach(function (x) { x.classList.toggle("active", x === b); });
        compose();
      });
    });
  });
  topic.addEventListener("input", compose);
  $("#copyPrompt").addEventListener("click", function () { copy(built.textContent, this, "Copy prompt"); });
  compose();

  /* ---------- counters + bars ---------- */
  var bento = $("#bento");
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (ents, obs) {
      ents.forEach(function (e) {
        if (!e.isIntersecting) return;
        bento.classList.add("in-view");
        $$(".counter", bento).forEach(function (c) {
          var to = +c.dataset.to, t0 = performance.now();
          (function tick(t) { var p = Math.min(1, (t - t0) / 1400); c.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(tick); })(t0);
        });
        obs.disconnect();
      });
    }, { threshold: 0.3 }).observe(bento);
  } else { bento.classList.add("in-view"); }

  window.addEventListener("load", function () { if (hasGsap) ScrollTrigger.refresh(); });
})();

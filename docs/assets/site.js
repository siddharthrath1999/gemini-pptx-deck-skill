/* PPTX Native · site interactions */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGsap = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";
  var REPO = "siddharthrath1999/pptx-native";
  var navH = function () { return parseInt(getComputedStyle(document.documentElement).getPropertyValue("--nav-h"), 10) || 64; };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };

  /* ---------- smooth scroll ---------- */
  var lenis = null;
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);
  if (!reduce && typeof window.Lenis !== "undefined") {
    lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    if (hasGsap) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(0);
    }
  }
  function goTo(el) {
    var off = -(navH() + 28);
    if (lenis) lenis.scrollTo(el, { offset: off });
    else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + off, behavior: reduce ? "auto" : "smooth" });
  }

  /* ---------- nav ---------- */
  var nav = $("#nav"), menuBtn = $("#menuBtn");
  function closeMenu() { nav.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false"); $(".ms", menuBtn).textContent = "menu"; }
  menuBtn.addEventListener("click", function () {
    var open = !nav.classList.contains("open");
    nav.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    $(".ms", menuBtn).textContent = open ? "close" : "menu";
  });
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      var el = id.length > 1 ? $(id) : document.body;
      if (!el) return;
      e.preventDefault();
      closeMenu();
      if (a.dataset.agy) showSetup("agy");
      if (id === "#top") { if (lenis) lenis.scrollTo(0); else window.scrollTo({ top: 0, behavior: "smooth" }); return; }
      goTo(el);
    });
  });
  var navLinks = $$(".nav-links a");
  var tracked = navLinks.map(function (a) { return $(a.getAttribute("href")); });
  function onScroll() {
    nav.classList.toggle("scrolled", window.scrollY > 40);
    var y = window.innerHeight * 0.4, cur = -1;
    tracked.forEach(function (s, i) { if (!s) return; var r = s.getBoundingClientRect(); if (r.top <= y && r.bottom > y) cur = i; });
    navLinks.forEach(function (a, i) { a.classList.toggle("active", i === cur); });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* GitHub stars, shown only when there are some */
  var stars = $("#stars");
  stars.style.display = "none";
  if (window.fetch) {
    fetch("https://api.github.com/repos/" + REPO).then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
      if (d && d.stargazers_count > 0) { stars.innerHTML = '<span class="ms fill" style="font-size:13px">star</span>' + d.stargazers_count; stars.style.display = ""; }
    }).catch(function () {});
  }

  /* ---------- reveal ---------- */
  if (hasGsap && !reduce) {
    ScrollTrigger.batch(".rv", {
      start: "top 90%",
      onEnter: function (els) { gsap.to(els, { opacity: 1, y: 0, duration: 1, ease: "expo.out", stagger: 0.07, overwrite: true }); }
    });
  } else {
    document.documentElement.classList.remove("js");
  }

  /* ---------- hero: typing prompt ---------- */
  var prompts = [
    "Make a 15-slide analysis of India's electric two-wheeler market for our leadership team.",
    "Make a fun learning deck that teaches how UPI payments work.",
    "Turn the attached sheet into a quarterly review with charts.",
    "Redesign slides 4 to 9 of the attached deck. Keep our colours."
  ];
  var typed = $("#typed");
  (function typeLoop(pi) {
    var text = prompts[pi % prompts.length], i = 0;
    if (reduce) { typed.textContent = prompts[0]; return; }
    (function step() {
      typed.textContent = text.slice(0, i++);
      if (i <= text.length) setTimeout(step, 24 + Math.random() * 36);
      else setTimeout(function () { erase(text.length); }, 2600);
    })();
    function erase(n) {
      typed.textContent = text.slice(0, Math.max(0, n));
      if (n > 0) setTimeout(function () { erase(n - 2); }, 14);
      else setTimeout(function () { typeLoop(pi + 1); }, 300);
    }
  })(0);

  /* ---------- hero: slides fan out of the prompt ---------- */
  var cards = $$(".fan-card");
  if (hasGsap && !reduce) {
    var n = cards.length, mid = (n - 1) / 2;
    var spread = function () { return Math.min(window.innerWidth * 0.12, 175); };
    gsap.set(cards, { opacity: 0, yPercent: 40, z: -500, rotateX: 50, scale: 0.5 });
    var tl = gsap.timeline({ scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom bottom", scrub: 1 } });
    var heroCopy = $(".hero-copy"), heroPrompt = $("#heroPrompt");
    gsap.set(heroCopy, { transformOrigin: "50% 0%" });
    /* lift the copy so the prompt ends just under the nav, never behind it */
    var lift = function () { return Math.min(0, navH() + 40 - heroCopy.offsetTop - heroPrompt.offsetTop * 0.82); };
    tl.to(heroCopy, { y: lift, scale: 0.82, duration: 1, ease: "none" }, 0)
      .to(".hero-copy .lead, .hero-copy h1, .hero-copy .brandline", { opacity: 0, duration: 0.6 }, 0)
      .to("#scrollHint", { opacity: 0, duration: 0.2 }, 0);
    cards.forEach(function (c, i) {
      var o = i - mid;
      tl.to(c, {
        opacity: 1, scale: 1, z: function () { return -Math.abs(o) * 90; },
        x: function () { return o * spread(); },
        y: function () { return window.innerHeight * 0.1 + Math.abs(o) * Math.abs(o) * 10; },
        yPercent: 0, rotateY: -o * 13, rotateZ: o * 2.5, rotateX: 6,
        duration: 1, ease: "power2.out"
      }, 0.2 + Math.abs(o) * 0.06);
    });
    tl.to("#heroStats", { opacity: 1, y: -10, duration: 0.35 }, 1.05);
  } else {
    $("#heroStats").style.opacity = 1;
  }

  /* ---------- gentle tilt + cursor light ---------- */
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  function tilt(el, max) {
    if (reduce || !fine) return;
    el.addEventListener("mousemove", function (e) {
      var r = el.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      el.style.setProperty("--mx", px * 100 + "%");
      el.style.setProperty("--my", py * 100 + "%");
      el.style.transform = "perspective(900px) rotateX(" + ((0.5 - py) * max) + "deg) rotateY(" + ((px - 0.5) * max) + "deg)";
    });
    el.addEventListener("mouseleave", function () { el.style.transform = ""; });
  }
  $$(".tilt").forEach(function (el) { tilt(el, 6); });

  /* ---------- how it works: a real Task run, replayed ---------- */
  var RUN = {
    thread: [
      { user: true, html: "<b>@pptx-native</b> Make a 15-slide analysis of India's electric two-wheeler market for our leadership team, who must decide whether to enter in 2027." },
      { icon: "travel_explore", title: "Searched India's electric two-wheeler market data", sub: "Vahan, FADA, CRISIL, EVreporter, PM E-DRIVE notices" },
      { icon: "account_tree", title: "Planned a five-part story", sub: "thesis, demand, competition, economics, 2027 entry" },
      { icon: "palette", title: "Made a custom executive-slate theme", sub: "Georgia headlines, Arial body, emerald and copper" },
      { icon: "dashboard", title: "Built 15 slides and ran the checker", sub: "native charts, a table, a scorecard and a roadmap" },
      { icon: "rule", title: "Fixed text overflow on slides 3, 5, 6, 7 and 8", sub: "then rendered every slide and refined 9, 10 and 13" },
      { icon: "task_alt", title: "Presented the deck", sub: "15 slides, 12 sources, nothing left to fill in" }
    ],
    labels: ["your request", "research", "storyline", "design", "slides", "checks and fixes", "delivery"],
    research: [["account_balance", "Vahan dashboard · registrations, Jan to Sep 2026", "primary"], ["receipt_long", "FADA · monthly retail sales", "primary"], ["gavel", "Ministry of Heavy Industries · PM E-DRIVE", "primary"], ["query_stats", "CRISIL Intelligence · FY31 outlook", "industry"], ["request_quote", "Company results · TVS, Bajaj, Ather, Ola", "filings"]],
    outline: ["Executive thesis: four makers hold 76% of sales", "Market demand: retail volumes up 5.5x in four years", "Competition: TVS and Bajaj overtook Ola in FY26", "Economics: e-scooters cost 40% less per km to run", "2027 entry: commuter e-motorcycles and B2B fleets"],
    palette: ["#13242b", "#f3f5f3", "#1f7a52", "#c96a2b", "#2f5d9e"],
    font: "Georgia headlines, Arial body. Chosen by Gemini for a board audience.",
    thumbs: ["run/s01.jpg", "run/s02.jpg", "run/s03.jpg", "run/s04.jpg", "run/s05.jpg", "run/s06.jpg", "run/s09.jpg", "run/s12.jpg", "run/s14.jpg"],
    checks: [["check", "Text overflow on slides 3, 5, 6, 7 and 8", "fixed"], ["check", "Overlap on slide 14", "fixed"], ["check", "Lint rerun after the fixes", "0 issues"], ["visibility", "Rendered 15 slides and looked at each sheet", "done"], ["auto_fix_high", "Refined slides 9, 10 and 13 after looking", "done"]]
  };
  var thread = $("#thread");
  thread.innerHTML = RUN.thread.map(function (m) {
    if (m.user) return '<div class="msg user">' + m.html + "</div>";
    return '<div class="msg"><div class="step"><span class="ic"><span class="ms">' + m.icon + "</span></span><div><b>" + esc(m.title) + "</b>" + (m.sub ? "<small>" + esc(m.sub) + "</small>" : "") + "</div></div></div>";
  }).join("");
  $("#sceneResearch").innerHTML = RUN.research.map(function (r) { return '<div class="row"><span class="well sm"><span class="ms">' + r[0] + "</span></span>" + esc(r[1]) + '<span class="r' + (r[2] === "set aside" ? "" : " ok") + '">' + esc(r[2]) + "</span></div>"; }).join("");
  $("#sceneOutline").innerHTML = RUN.outline.map(function (t, i) { return "<div><span>0" + (i + 1) + "</span>" + esc(t) + "</div>"; }).join("");
  $("#scenePalette").innerHTML = RUN.palette.map(function (c) { return '<i style="background:' + c + '"></i>'; }).join("");
  $("#sceneFontNote").textContent = RUN.font;
  $("#sceneThumbs").innerHTML = RUN.thumbs.map(function (s) { return '<img src="assets/' + s + '" alt="" loading="lazy">'; }).join("");
  $("#sceneChecks").innerHTML = RUN.checks.map(function (r) { return '<div class="row"><span class="well sm"><span class="ms" style="color:var(--ok)">' + r[0] + "</span></span>" + esc(r[1]) + '<span class="r ok">' + esc(r[2]) + "</span></div>"; }).join("");

  var msgs = $$("#thread .msg"), scenes = $$("#board .scene");
  var stepNow = -1;
  function setStep(i) {
    if (i === stepNow) return;
    stepNow = i;
    var last = i === msgs.length - 1;
    msgs.forEach(function (m, k) {
      m.classList.toggle("shown", k <= i);
      m.classList.toggle("current", k === i && k > 0 && !last);
      m.classList.toggle("done", k > 0 && (k < i || last));
      var ic = $(".ic .ms", m);
      if (ic && k > 0) ic.textContent = (k < i || last) ? "check_circle" : (k === i ? "progress_activity" : RUN.thread[k].icon);
    });
    scenes.forEach(function (s, k) { s.classList.toggle("active", k === i); });
    $("#boardLabel").textContent = RUN.labels[i];
    $("#replayBar").style.width = ((i + 1) / scenes.length * 100) + "%";
    var target = msgs[i];
    if (target) {
      var top = target.offsetTop - thread.offsetTop + target.offsetHeight - thread.clientHeight + 24;
      thread.scrollTo({ top: Math.max(0, top), behavior: reduce ? "auto" : "smooth" });
    }
  }
  var replayST = null, replayTimer = null;
  if (hasGsap && !reduce) {
    ScrollTrigger.matchMedia({
      "(min-width: 981px)": function () {
        replayST = ScrollTrigger.create({
          trigger: "#replay", start: function () { return "top " + (navH() + 24) + "px"; }, end: "+=" + (scenes.length * 42) + "%", pin: true,
          onUpdate: function (self) { setStep(Math.min(scenes.length - 1, Math.floor(self.progress * scenes.length))); }
        });
        return function () { replayST = null; };
      }
    });
  }
  msgs.forEach(function (m, i) {
    m.style.cursor = "pointer";
    m.addEventListener("click", function () {
      if (replayST) {
        var y = replayST.start + (i + 0.5) / scenes.length * (replayST.end - replayST.start);
        if (lenis) lenis.scrollTo(y); else window.scrollTo({ top: y, behavior: "smooth" });
      } else { stopReplay(); setStep(i); }
    });
  });
  function stopReplay() { clearInterval(replayTimer); replayTimer = null; }
  setStep(0);
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (ents) {
      ents.forEach(function (e) {
        if (replayST || reduce) return;
        if (e.isIntersecting && !replayTimer) replayTimer = setInterval(function () { setStep((stepNow + 1) % scenes.length); }, 2600);
        if (!e.isIntersecting) stopReplay();
      });
    }, { threshold: 0.35 }).observe($("#board"));
  }
  if (reduce) setStep(scenes.length - 1);

  /* ---------- same topic, different decks · plus editing ---------- */
  var AUD = [
    ["board", "Board update", "groups",
      "Make a short board update on Lumen Bikes' Q3 for our board. Calm and factual; they need to approve three decisions.",
      [["Structure", "Result first, then evidence, then the decisions to approve"], ["Slides", "Metric tiles, a city table with one row highlighted, a decisions list"], ["Tone", "Sentence headlines that state the result"], ["Look", "Executive slate: quiet greys, one deep green"]]],
    ["pitch", "Investor pitch", "rocket_launch",
      "Make a short investor pitch for Lumen Bikes' seed round. Bold and simple; investors decide whether to take a meeting.",
      [["Structure", "The idea, the proof, the growth, the ask"], ["Slides", "A one-line statement, one big number, a growth chart"], ["Tone", "Short, confident claims backed by one figure each"], ["Look", "Bold contrast: black, white and one red"]]],
    ["workshop", "Team workshop", "school",
      "Make a short workshop deck for our support team on why Lumen riders cancel. Fun and interactive.",
      [["Structure", "Question first, then the answer, then a recap"], ["Slides", "A quiz for the room, cards with icons, a recap"], ["Tone", "Friendly, plain words, questions to the room"], ["Look", "Playful bright: rounded cards and warm colour"]]],
    ["launch", "Product launch", "campaign",
      "Make a short launch deck for Lumen Cargo, our new cargo bike plan, for the city teams who will roll it out.",
      [["Structure", "What it is, how it works, when it arrives"], ["Slides", "A statement, a four-step process, a city timeline"], ["Tone", "Clear steps and dates, written for doers"], ["Look", "Dark tech: near-black with cyan light"]]]
  ];
  var EDITS = [["dashboard", "“Turn slide 2 into something better than bullets”", "Rebuilt as cards, in the deck's theme"], ["find_replace", "“Change every FY25 to FY26”", "Every slide, formatting kept"], ["insert_chart", "“Update the chart with Q3 numbers”", "Same chart, new data"], ["add_box", "“Add a decisions slide after the table”", "A new slide that matches the rest"]];
  var aud = $("#aud"), audTabs = $("#audTabs"), audMain = $("#audMain"), audThumbs = $("#audThumbs"), audIdx = -1, slideIdx = 0, audTimer = null;
  AUD.concat([["edit", "Edit your deck", "edit_document"]]).forEach(function (a, i) {
    if (a[0] === "edit") { var sep = document.createElement("span"); sep.className = "sep"; audTabs.appendChild(sep); }
    var b = document.createElement("button");
    b.innerHTML = '<span class="ms">' + a[2] + "</span>" + a[1];
    b.setAttribute("role", "tab");
    if (a[0] === "edit") b.className = "edit-tab";
    b.addEventListener("click", function () { stopAud(); showAud(i, 0); });
    audTabs.appendChild(b);
  });
  for (var s = 0; s < 4; s++) {
    var im = new Image(); im.alt = ""; audMain.appendChild(im);
    var tb = document.createElement("button"); tb.setAttribute("aria-label", "Slide " + (s + 1));
    tb.innerHTML = '<img alt="">';
    (function (k) { tb.addEventListener("click", function () { stopAud(); showAud(audIdx, k); }); })(s);
    audThumbs.appendChild(tb);
  }
  function audSrc(key, k) { return "assets/audiences/" + key + "-" + (k + 1) + ".jpg"; }
  function showAud(i, k) {
    var editing = i === AUD.length, changed = i !== audIdx;
    audIdx = i; slideIdx = k;
    $$("button", audTabs).forEach(function (b, j) { b.classList.toggle("active", j === i); b.setAttribute("aria-selected", String(j === i)); });
    aud.classList.toggle("editing", editing);
    if (editing) {
      if (changed) {
        $("#audQLabel").textContent = "You attach a deck and ask";
        $("#audPrompt").textContent = "Turn slide 2 into something better than bullets. Keep our fonts and colours.";
        $("#audDiff").innerHTML = EDITS.map(function (e) { return '<div class="row"><span class="well sm"><span class="ms">' + e[0] + "</span></span><div>" + esc(e[1]) + "<em>" + esc(e[2]) + "</em></div></div>"; }).join("");
        nudgeBa();
      }
      return;
    }
    var a = AUD[i], imgs = $$(":scope > img", audMain);
    if (changed) {
      imgs.forEach(function (im, j) { im.src = audSrc(a[0], j); im.alt = a[1] + " deck, slide " + (j + 1); });
      $$("button img", audThumbs).forEach(function (im, j) { im.src = audSrc(a[0], j); });
      $("#audQLabel").textContent = "The request";
      $("#audPrompt").textContent = a[3];
      $("#audDiff").innerHTML = a[4].map(function (d) { return "<div><span>" + d[0] + "</span>" + d[1] + "</div>"; }).join("");
    }
    imgs.forEach(function (im, j) { im.classList.toggle("on", j === k); });
    $$("button", audThumbs).forEach(function (b, j) { b.classList.toggle("on", j === k); });
  }
  function stopAud() { clearInterval(audTimer); audTimer = null; audMain.dataset.touched = "1"; }
  showAud(0, 0);
  if (!reduce && "IntersectionObserver" in window) {
    new IntersectionObserver(function (ents) {
      ents.forEach(function (e) {
        if (e.isIntersecting && !audTimer && !audMain.dataset.touched) {
          audTimer = setInterval(function () {
            if (audIdx < AUD.length && slideIdx < 3) showAud(audIdx, slideIdx + 1);
            else showAud((audIdx + 1) % (AUD.length + 1), 0);
          }, 2400);
        }
        if (!e.isIntersecting) { clearInterval(audTimer); audTimer = null; }
      });
    }, { threshold: 0.4 }).observe(audMain);
  }

  /* before/after slider (inside the edit tab) */
  var ba = $("#ba"), dragging = false;
  function setPos(clientX) {
    var r = ba.getBoundingClientRect();
    ba.style.setProperty("--pos", Math.max(0, Math.min(100, (clientX - r.left) / r.width * 100)) + "%");
  }
  ba.addEventListener("pointerdown", function (e) { dragging = true; ba.dataset.touched = "1"; stopAud(); if (ba.setPointerCapture) ba.setPointerCapture(e.pointerId); setPos(e.clientX); });
  ba.addEventListener("pointermove", function (e) { if (dragging) setPos(e.clientX); });
  ba.addEventListener("pointerup", function () { dragging = false; });
  ba.addEventListener("pointercancel", function () { dragging = false; });
  ba.setAttribute("tabindex", "0");
  ba.setAttribute("role", "slider");
  ba.setAttribute("aria-label", "Compare before and after");
  ba.addEventListener("keydown", function (e) {
    var cur = parseFloat(ba.style.getPropertyValue("--pos")) || 50;
    if (e.key === "ArrowLeft") ba.style.setProperty("--pos", Math.max(0, cur - 5) + "%");
    if (e.key === "ArrowRight") ba.style.setProperty("--pos", Math.min(100, cur + 5) + "%");
  });
  function nudgeBa() {
    if (!hasGsap || reduce || ba.dataset.touched) { ba.style.setProperty("--pos", "50%"); return; }
    var st = { p: 50 };
    gsap.killTweensOf(st);
    gsap.timeline({ onUpdate: function () { if (!ba.dataset.touched) ba.style.setProperty("--pos", st.p + "%"); } })
      .to(st, { p: 20, duration: 0.9, ease: "power2.inOut" })
      .to(st, { p: 80, duration: 1.2, ease: "power2.inOut" })
      .to(st, { p: 50, duration: 0.8, ease: "power2.inOut" });
  }

  /* ---------- backdrop crossfade ---------- */
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

  /* ---------- layouts: 8 first, expand and collapse ---------- */
  var L = [
    ["Cover", "Title, subtitle, tags and your palette.", "story", 1], ["KPI tiles", "Two to five headline metrics with deltas.", "data", 6],
    ["Chart", "Native chart with a takeaway panel.", "data", 7], ["Scorecard", "Entities scored on criteria.", "data", 15],
    ["Process", "Steps with icons and arrows.", "flow", 18], ["Roadmap", "Lanes of work across quarters.", "flow", 22],
    ["Cards", "Parallel ideas with icons and stats.", "story", 24], ["Quiz question", "Lettered options for the room.", "teach", 29],
    ["Agenda", "Numbered parts as cards.", "story", 2], ["Section divider", "Big number, part title, new tone.", "story", 3],
    ["Statement", "One sentence that deserves the room.", "story", 4], ["Big number", "One figure, what it means, side stats.", "data", 5],
    ["Chart pair", "Two charts side by side.", "data", 9], ["Waterfall", "Bridge from one total to another.", "data", 10],
    ["Bar list", "Ranked bars for benchmarks.", "data", 11], ["Split bar", "Where a total goes, piece by piece.", "data", 12],
    ["Table", "Native table with a highlighted row.", "data", 13], ["Heatmap", "Values shaded by size.", "data", 14],
    ["Timeline", "Milestones in order.", "flow", 17], ["Funnel", "Stages with conversion.", "flow", 19],
    ["2x2 matrix", "Positions on two axes.", "flow", 20], ["Layers", "Stacks and architectures.", "flow", 21],
    ["Comparison", "Options side by side.", "story", 26], ["Two column", "Two halves of an argument.", "story", 27],
    ["Bullets", "A short list, used sparingly.", "story", 28], ["Pros and cons", "For and against.", "story", 30],
    ["Before and after", "What changed.", "story", 31], ["Quote", "A real voice, credited.", "story", 32],
    ["Runbook steps", "Owner, time and command per step.", "teach", 33], ["Code", "Monospace panel with notes.", "teach", 34],
    ["Free canvas", "Anything the others don't cover.", "flow", 35], ["Recap", "What to remember from a part.", "teach", 36],
    ["Next steps", "Actions with owners and dates.", "story", 37], ["Sources", "Numbered references.", "story", 38]
  ];
  var grid = $("#posterGrid"), expanded = false, filter = "all", showBtn = $("#showAll");
  var setLayoutBg = backdrop($("#layoutBackdrop"));
  L.forEach(function (l, i) {
    var src = "assets/layouts/l" + String(l[3]).padStart(2, "0") + ".jpg";
    var el = document.createElement("article");
    el.className = "poster"; el.dataset.cat = l[2]; el.dataset.i = i;
    el.innerHTML = '<img loading="lazy" src="' + src + '" alt="' + l[0] + ' layout"><h4>' + l[0] + "</h4><p>" + l[1] + "</p>";
    el.addEventListener("mouseenter", function () { setLayoutBg(src); });
    tilt(el, 6);
    grid.appendChild(el);
  });
  function applyFilter() {
    var shown = 0, total = 0;
    $$(".poster", grid).forEach(function (p) {
      var ok = filter === "all" || p.dataset.cat === filter;
      if (ok) total++;
      var vis = ok && (expanded || shown < 8);
      p.classList.toggle("hide", !vis);
      if (vis) shown++;
    });
    showBtn.parentNode.style.display = total > 8 ? "" : "none";
    showBtn.innerHTML = expanded ? '<span class="ms">expand_less</span><span>Show fewer</span>' : '<span class="ms">expand_more</span><span>Show all ' + total + " layouts</span>";
    if (hasGsap) ScrollTrigger.refresh();
  }
  $$("#layoutFilters button").forEach(function (b) {
    b.addEventListener("click", function () {
      $$("#layoutFilters button").forEach(function (x) { x.classList.toggle("active", x === b); });
      filter = b.dataset.f; applyFilter();
    });
  });
  showBtn.addEventListener("click", function () {
    expanded = !expanded; applyFilter();
    if (!expanded) goTo($("#layouts"));
  });
  applyFilter();
  setLayoutBg("assets/layouts/l06.jpg");

  /* ---------- examples + lightbox ---------- */
  var EX = [
    ["upi", "How UPI works", "Learning deck · cream, saffron and navy", ["60 slides", "6 quizzes", "Notes on every slide"], [1, 6, 9, 12, 31, 36, 52, 55]],
    ["cards", "India's credit card market", "Market analysis · boardroom navy", ["45 slides", "5 parts", "40 issuers"], [1, 3, 6, 14, 16, 20, 36, 40]],
    ["qc", "Quick commerce benchmark", "Competitive benchmark · editorial slate", ["47 slides", "11 charts", "6 platforms"], [1, 4, 6, 17, 22, 28, 34, 41]]
  ];
  var exRow = $("#exRow"), setExBg = backdrop($("#exBackdrop"));
  var lb = $("#lightbox"), lbImg = $("#lbImg"), lbStrip = $("#lbStrip"), lbTitle = $("#lbTitle"), lbList = [], lbI = 0, lbFrom = null;
  function src(key, p) { return "assets/examples/" + key + "-" + String(p).padStart(2, "0") + ".jpg"; }
  EX.forEach(function (e) {
    var b = document.createElement("button");
    b.className = "ex-card rv";
    b.innerHTML = '<div class="cover"><img loading="lazy" src="' + src(e[0], e[4][0]) + '" alt="Cover of the ' + e[1] + ' deck"></div><div class="meta"><h3>' + e[1] + "</h3><p>" + e[2] + '</p><div class="stats">' + e[3].map(function (s) { return '<span class="chip">' + s + "</span>"; }).join("") + '</div><span class="open"><span class="ms">slideshow</span>Page through ' + e[4].length + " slides</span></div>";
    b.addEventListener("mouseenter", function () { setExBg(src(e[0], e[4][1])); });
    b.addEventListener("click", function () { lbFrom = b; openLb(e); });
    tilt(b, 5);
    exRow.appendChild(b);
  });
  if (hasGsap && !reduce) ScrollTrigger.batch($$(".ex-card"), { start: "top 90%", onEnter: function (els) { gsap.to(els, { opacity: 1, y: 0, duration: 1, ease: "expo.out", stagger: 0.1, overwrite: true }); } });
  setExBg(src("upi", 6));
  function openLb(e) {
    lbList = e[4].map(function (p) { return src(e[0], p); }); lbTitle.textContent = e[1];
    lbStrip.innerHTML = "";
    lbList.forEach(function (s, i) { var t = new Image(); t.src = s; t.alt = "Slide " + (i + 1); t.addEventListener("click", function () { showLb(i); }); lbStrip.appendChild(t); });
    showLb(0); lb.classList.add("open"); if (lenis) lenis.stop();
    $("#lbClose").focus();
  }
  function showLb(i) {
    lbI = (i + lbList.length) % lbList.length; lbImg.src = lbList[lbI];
    lbImg.alt = lbTitle.textContent + ", slide " + (lbI + 1) + " of " + lbList.length;
    $$("img", lbStrip).forEach(function (t, k) { t.classList.toggle("on", k === lbI); });
  }
  function closeLb() { lb.classList.remove("open"); if (lenis) lenis.start(); if (lbFrom) lbFrom.focus(); }
  $("#lbClose").addEventListener("click", closeLb);
  $("#lbPrev").addEventListener("click", function () { showLb(lbI - 1); });
  $("#lbNext").addEventListener("click", function () { showLb(lbI + 1); });
  lb.addEventListener("click", function (e) { if (e.target === lb || e.target.classList.contains("lb-main")) closeLb(); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMenu();
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") closeLb();
    if (e.key === "ArrowRight") showLb(lbI + 1);
    if (e.key === "ArrowLeft") showLb(lbI - 1);
  });

  /* ---------- setup: tabs ---------- */
  function showSetup(tab) {
    $$("#setupTabs button").forEach(function (x) { x.classList.toggle("active", x.dataset.tab === tab); });
    $$(".setup-panel").forEach(function (p) {
      p.classList.toggle("active", p.id === "tab-" + tab);
      p.style.opacity = 1; p.style.transform = "none";
    });
    if (tab === "agy") playTerm(); else placeHot();
    if (hasGsap) ScrollTrigger.refresh();
  }
  $$("#setupTabs button").forEach(function (b) { b.addEventListener("click", function () { showSetup(b.dataset.tab); }); });

  /* ---------- setup: Gemini app walkthrough ---------- */
  var W = [
    ["Download the skill", "Use the Download button below. Keep the file zipped.", "github.com/" + REPO, ".m-screen:nth-of-type(1) .m-file", false],
    ["Open Customise, then Skills", "In Gemini's left menu, click Customise and open the Skills tab.", "gemini.google.com/customize", ".m-screen:nth-of-type(2) .m-tabs .hl", true],
    ["Click Create, then Upload", "The Create button sits at the top right of your skills.", "gemini.google.com/customize/skills", ".m-screen:nth-of-type(3) .m-menu .hl", true],
    ["Choose the zip and click Create", "Gemini scans it, shows the skill, and you confirm.", "gemini.google.com/customize/skills", ".m-screen:nth-of-type(4) .m-pill", true],
    ["Switch to Task and ask", "New chat, pick Task under the box, type @pptx-native and describe your deck.", "gemini.google.com/app", ".m-screen:nth-of-type(5) .m-modes .hl", false]
  ];
  var walk = $("#walk"), wi = 0, hot = $("#hotspot"), mscreens = $$(".m-screen"), mockMain = $(".mock-main");
  W.forEach(function (w, i) {
    var b = document.createElement("button");
    b.innerHTML = '<span class="n">' + (i + 1) + "</span><span><b>" + w[0] + '</b><span class="d">' + w[1] + "</span></span>";
    b.addEventListener("click", function () { showWalk(i); });
    walk.appendChild(b);
  });
  function placeHot() {
    var t = $(W[wi][3], mockMain);
    if (!t || !mockMain.offsetWidth) return;
    var r = t.getBoundingClientRect(), m = mockMain.getBoundingClientRect();
    hot.style.left = (r.left - m.left + r.width / 2) + "px";
    hot.style.top = (r.top - m.top + r.height / 2) + "px";
  }
  function showWalk(i) {
    wi = Math.max(0, Math.min(W.length - 1, i));
    $$("button", walk).forEach(function (b, k) { b.classList.toggle("active", k === wi); });
    mscreens.forEach(function (s, k) { s.classList.toggle("active", k === wi); });
    $("#mockUrl").textContent = W[wi][2];
    $("#sideCustom").classList.toggle("hl", W[wi][4]);
    placeHot();
    var last = wi === W.length - 1;
    $("#walkNext").innerHTML = last ? '<span class="ms">restart_alt</span>Start over' : 'Next step<span class="ms">arrow_forward</span>';
    $("#walkPrev").disabled = wi === 0;
  }
  $("#walkNext").addEventListener("click", function () { showWalk(wi === W.length - 1 ? 0 : wi + 1); });
  $("#walkPrev").addEventListener("click", function () { showWalk(wi - 1); });
  showWalk(0);
  window.addEventListener("resize", placeHot);
  window.addEventListener("load", placeHot);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(placeHot);

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
    var full = CMD[osNow], i = 0;
    if (reduce) { termCmd.textContent = full; lines.forEach(function (d) { d.classList.add("in"); }); return; }
    lines.forEach(function (d) { d.classList.remove("in"); });
    termCmd.textContent = "";
    (function typeCmd() {
      termCmd.textContent = full.slice(0, i++);
      if (i <= full.length) termTimer.push(setTimeout(typeCmd, 14));
      else lines.forEach(function (d, k) { termTimer.push(setTimeout(function () { d.classList.add("in"); }, 300 + k * 260)); });
    })();
  }
  $$("#osTabs button").forEach(function (b) {
    b.addEventListener("click", function () {
      $$("#osTabs button").forEach(function (x) { x.classList.toggle("active", x === b); });
      osNow = b.dataset.os; playTerm();
    });
  });
  function copy(text, btn) {
    var label = btn.innerHTML;
    var done = function () { btn.innerHTML = '<span class="ms">check</span><span>Copied</span>'; setTimeout(function () { btn.innerHTML = label; }, 1600); };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, fallback); else fallback();
    function fallback() {
      var ta = document.createElement("textarea"); ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); } catch (err) {}
      document.body.removeChild(ta); done();
    }
  }
  $("#copyCmd").addEventListener("click", function () { copy(CMD[osNow], this); });
  termCmd.textContent = CMD.mac;
  $$("#termOut div").forEach(function (d) { d.classList.add("in"); });

  /* ---------- prompt builder ---------- */
  var built = $("#builtText"), topic = $("#topic");
  function pick(key) { return $$('[data-key="' + key + '"] button.active').map(function (b) { return b.textContent; }); }
  function list(a) { return a.length < 2 ? a.join("") : a.slice(0, -1).join(", ") + " and " + a[a.length - 1]; }
  function compose() {
    var deck = pick("deck")[0], audv = pick("aud")[0], len = pick("len")[0], extra = pick("extra");
    var t = "Make a " + len + "-slide " + deck + " on " + (topic.value.trim() || "your topic") + " for " + audv + ".";
    var useFiles = extra.filter(function (x) { return /^use /.test(x); });
    var rest = extra.filter(function (x) { return !/^use /.test(x); });
    if (useFiles.length) t += " " + useFiles[0].charAt(0).toUpperCase() + useFiles[0].slice(1) + ".";
    if (rest.length) t += " Include " + list(rest) + ".";
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
  $("#copyPrompt").addEventListener("click", function () { copy("@pptx-native " + built.textContent, this); });
  compose();

  /* ---------- what's inside: demos run only while on screen ---------- */
  function typeNotes(tile) {
    var el = $(".d-notes .tw", tile);
    if (!el || el.dataset.busy) return;
    var full = el.dataset.text || el.textContent;
    el.dataset.text = full; el.dataset.busy = "1";
    if (reduce) { el.textContent = full; return; }
    var i = 0;
    (function step() {
      if (!tile.classList.contains("live")) { el.textContent = full; delete el.dataset.busy; return; }
      el.textContent = full.slice(0, i++);
      if (i <= full.length) setTimeout(step, 38);
      else setTimeout(function () { i = 0; step(); }, 2600);
    })();
  }
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (e) { e.target.classList.toggle("live", e.isIntersecting); if (e.isIntersecting) typeNotes(e.target); });
    }, { threshold: 0.25 });
    $$(".tile").forEach(function (t) { io.observe(t); });
  } else {
    $$(".tile").forEach(function (t) { t.classList.add("live"); });
  }

  window.addEventListener("load", function () { if (hasGsap) ScrollTrigger.refresh(); });
})();

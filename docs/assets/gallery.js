/* PPTX Native · prompt gallery. Parts in [brackets] become editable fields. */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };

  var CATS = [
    ["all", "All", "apps"],
    ["biz", "Business & strategy", "trending_up"],
    ["learn", "Learning & training", "school"],
    ["tech", "Product & tech", "rocket_launch"],
    ["edit", "Editing decks", "edit_document"]
  ];

  var P = [
    ["biz", "Market analysis", "run/m/s03.jpg", "analysis",
      "Make a [30]-slide analysis of [India's electric two-wheeler market] for [our leadership team], who must decide [whether to enter in 2027]. End with a clear recommendation.",
      "Naming the decision gives the deck a destination, so every slide builds towards it."],
    ["biz", "Board update", "audiences/board-2.jpg", "board",
      "Make a [12]-slide board update on [our Q3 results] for [our board]. Lead with the result, show the evidence, and end with [the three decisions we need approved].",
      "Result first and decisions last is how boards read. The skill picks metric tiles and tables to match."],
    ["biz", "Investor pitch", "audiences/pitch-3.jpg", "pitch",
      "Make a [12]-slide seed pitch for [Lumen Bikes, a bike subscription startup] for [early-stage investors]. Cover the problem, the proof, growth, the team and the ask of [$500,000].",
      "Listing the beats keeps it tight. The look turns bold on its own because the audience is investors."],
    ["biz", "Competitor benchmark", "run/m/s06.jpg", "benchmark",
      "Benchmark [India's six quick commerce apps] for [our strategy team] in [40] slides. One profile slide per company, a scorecard across [delivery speed, assortment, pricing and profitability], and what it means for us.",
      "Fixed criteria make companies comparable, and “what it means for us” forces a point of view."],
    ["biz", "Quarterly business review", "layouts/l06.jpg", "review",
      "Turn the attached [sales sheet] into a [20]-slide quarterly review for [the sales leadership team]. Show results against target, what drove the gap, and next quarter's plan.",
      "The attached sheet becomes the source of truth, so numbers come from your data, not the web."],
    ["biz", "Strategy options", "run/m/s12.jpg", "options",
      "Make a [15]-slide deck comparing [three ways to enter the Middle East market] for [our executive committee]. Score each option on [cost, speed, risk and upside] and recommend one.",
      "Asking for scores and a pick avoids a neutral list of pros and cons."],

    ["learn", "Explainer with quizzes", "examples/upi-01.jpg", "learning",
      "Make a fun [30]-slide learning deck that teaches [college students] how [UPI payments work]. Use one running story, a quiz question every few slides, and plain words.",
      "A running story and regular quizzes keep a learning deck from turning into a lecture."],
    ["learn", "New joiner onboarding", "layouts/l18.jpg", "onboarding",
      "Make a [20]-slide onboarding deck for [new joiners in our support team]. Cover [our product, our customers, the tools we use and their first-week checklist].",
      "Listing the topics sets the parts; the skill adds recaps between them."],
    ["learn", "Team workshop", "audiences/workshop-2.jpg", "workshop",
      "Make a [15]-slide workshop deck for [our support team] on [why customers cancel]. Start with a question to the room, answer it with data from the attached file, and end with a recap.",
      "A question first gets the room talking before the answer lands."],
    ["learn", "Lecture with notes", "layouts/l36.jpg", "lecture",
      "Make a [40]-slide lecture on [the basics of monetary policy] for [first-year economics students]. Split it into [four] parts with a recap after each, and write speaker notes I can read from.",
      "Asking for readable notes makes the notes full sentences, not reminders."],
    ["learn", "Process training", "layouts/l33.jpg", "training",
      "Make a [12]-slide training deck on [how to handle a refund request] for [new support agents]. Show each step, who owns it, and the common mistakes.",
      "Owners and mistakes turn a process diagram into something people can follow on day one."],
    ["learn", "Report summary", "layouts/l24.jpg", "summary",
      "Summarise the attached [report] in [15] slides for [our team, who haven't read it]. One slide per key idea, with the page number it comes from.",
      "Page numbers keep the summary honest and easy to check."],

    ["tech", "Product launch", "audiences/launch-3.jpg", "launch",
      "Make a [15]-slide launch deck for [Lumen Cargo, our new cargo bike plan] for [the city teams who will roll it out]. Cover what it is, how it works, the timeline and what each team must do.",
      "Writing for the people who roll it out makes the deck about actions and dates, not hype."],
    ["tech", "Product roadmap", "run/m/s14.jpg", "roadmap",
      "Make a [12]-slide roadmap for [our mobile app] over [the next four quarters] for [engineering and design leads]. Group the work into [growth, reliability and platform].",
      "Named lanes give the roadmap slide its structure."],
    ["tech", "Incident review", "layouts/l17.jpg", "incident",
      "Make a [10]-slide review of [the 14 October checkout outage] for [engineering leadership] from the attached timeline. Show what happened, the impact, the root cause, and the fixes with owners and dates.",
      "Owners and dates on every fix is what makes a review useful a month later."],
    ["tech", "Runbook", "layouts/l34.jpg", "runbook",
      "Make a [20]-slide runbook for [deploying our API to production] for [on-call engineers]. One step per slide with the owner, the time it takes and the exact command.",
      "Exact commands in a code panel mean nobody has to retype from memory at 3 a.m."],
    ["tech", "Architecture overview", "layouts/l21.jpg", "architecture",
      "Make a [12]-slide architecture overview of [our payments system] for [new engineers]. Show the layers, how a request flows through them, and where it can fail.",
      "“Where it can fail” adds the part new engineers need most."],
    ["tech", "Monthly product review", "layouts/l19.jpg", "metrics",
      "Make a [15]-slide monthly product review for [our product team] from the attached [metrics export]. Lead with what changed, show the funnel, and list three experiments for next month.",
      "Leading with change, not totals, keeps the review short."],

    ["edit", "Redesign weak slides", "gallery/redesign.jpg", "redesign",
      "Redesign slides [4 to 9] of the attached deck. Keep our fonts, colours and wording, and replace bullet lists with better layouts.",
      "Naming the slides and what to keep means only those slides change."],
    ["edit", "Update the numbers", "run/m/s04.jpg", "update",
      "Update every figure in the attached deck for [Q3 FY27] using the attached sheet. Change [FY26] to [FY27] everywhere, and list anything you couldn't update.",
      "Asking for a list of misses tells you exactly what to check by hand."],
    ["edit", "Cut it down", "layouts/l02.jpg", "shorten",
      "Cut the attached deck from [40] to [15] slides for [a 10-minute board slot]. Keep the story, merge where you can, and move the detail to an appendix.",
      "Saying how long you have to present sets the right length better than a slide count alone."],
    ["edit", "Add a section", "edit/after-new.jpg", "add",
      "Add a [5]-slide section on [competitor pricing] after slide [12] of the attached deck, in the same style as the rest.",
      "New slides take the deck's own theme colours and fonts."],
    ["edit", "Rewrite the notes", "gallery/notes.jpg|bottom", "notes",
      "Rewrite the speaker notes in the attached deck for [investors]. Keep the slides as they are. Each note should say the one point to land and lead into the next slide.",
      "“Keep the slides as they are” limits the edit to notes only."],
    ["edit", "Reorder for the answer first", "run/m/s02.jpg", "reorder",
      "Reorder the attached deck so [the recommendation] comes first, then the evidence. Delete slides that repeat a point, and tell me which ones you removed.",
      "A change log of removed slides makes the cut easy to review."]
  ];

  var grid = $("#gGrid"), tabs = $("#gTabs"), search = $("#gSearch"), filesBtn = $("#gFiles"), toast = $("#toast");
  var cat = "all", addFiles = false;
  try { addFiles = localStorage.getItem("pn-files") === "1"; } catch (e) {}
  filesBtn.setAttribute("aria-pressed", String(addFiles));

  function render(t) {
    return esc(t).replace(/\[([^\]]+)\]/g, function (_, v) { return '<span class="f" contenteditable="true" spellcheck="false" role="textbox" aria-label="Edit: ' + v + '">' + v + "</span>"; });
  }
  P.forEach(function (p, i) {
    var c = CATS.filter(function (x) { return x[0] === p[0]; })[0];
    var card = document.createElement("article");
    card.className = "p-card"; card.dataset.cat = p[0];
    card.dataset.search = (p[1] + " " + p[4] + " " + c[1]).toLowerCase();
    card.innerHTML =
      '<div class="p-prev"><img loading="lazy" src="assets/' + p[2].split("|")[0] + '" alt="Example ' + esc(p[3]) + ' slide"' + (p[2].split("|")[1] ? ' style="object-position:center ' + p[2].split("|")[1] + '"' : "") + '></div>' +
      '<div class="p-body"><div class="p-head"><span class="p-cat"><span class="ms">' + c[2] + "</span>" + esc(c[1]) + '</span><h3>' + esc(p[1]) + '</h3></div><div class="p-text"><span class="at">@pptx-native</span> <span class="body">' + render(p[4]) + "</span></div>" +
      '<div class="p-why"><span class="ms">lightbulb</span><span>' + esc(p[5]) + "</span></div>" +
      '<div class="p-act"><button class="btn sm" data-act="copy"><span class="ms">content_copy</span><span>Copy</span></button><button class="btn sm light" data-act="open"><img src="assets/logos/gemini-2025.svg" alt="" width="16" height="16"><span>Copy &amp; open Gemini</span></button></div></div>';
    grid.appendChild(card);
  });

  function promptOf(card) {
    var t = "@pptx-native " + $(".body", card).textContent.replace(/\s+/g, " ").trim();
    if (addFiles && card.dataset.cat !== "edit" && !/attached/i.test(t)) t += " Use my attached files first.";
    return t;
  }
  function showToast(msg) {
    toast.innerHTML = '<span class="ms">check_circle</span>' + esc(msg);
    toast.classList.add("on");
    clearTimeout(showToast.t); showToast.t = setTimeout(function () { toast.classList.remove("on"); }, 2200);
  }
  function copy(text, done) {
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, fallback); else fallback();
    function fallback() {
      var ta = document.createElement("textarea"); ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); } catch (e) {}
      document.body.removeChild(ta); done();
    }
  }
  grid.addEventListener("click", function (e) {
    var b = e.target.closest("button[data-act]"); if (!b) return;
    var card = b.closest(".p-card"), text = promptOf(card);
    if (b.dataset.act === "open") {
      var w = window.open("https://gemini.google.com/app", "_blank", "noopener");
      copy(text, function () { showToast("Copied. In Gemini, pick Task, then paste."); });
      if (!w) showToast("Copied. Open gemini.google.com and paste.");
    } else {
      copy(text, function () { showToast("Prompt copied"); });
    }
  });
  grid.addEventListener("keydown", function (e) {
    if (e.target.classList.contains("f") && e.key === "Enter") { e.preventDefault(); e.target.blur(); }
  });
  grid.addEventListener("paste", function (e) {
    if (!e.target.classList.contains("f")) return;
    e.preventDefault();
    var t = (e.clipboardData || window.clipboardData).getData("text").replace(/\s+/g, " ");
    document.execCommand("insertText", false, t);
  });
  grid.addEventListener("focusout", function (e) {
    if (e.target.classList.contains("f") && !e.target.textContent.trim()) e.target.textContent = "…";
  });

  CATS.forEach(function (c) {
    var n = c[0] === "all" ? P.length : P.filter(function (p) { return p[0] === c[0]; }).length;
    var b = document.createElement("button");
    b.dataset.cat = c[0];
    b.setAttribute("role", "tab");
    b.innerHTML = '<span class="ms">' + c[2] + "</span>" + c[1] + '<span class="count">' + n + "</span>";
    b.addEventListener("click", function () { cat = c[0]; apply(); });
    tabs.appendChild(b);
  });
  function apply() {
    var q = search.value.trim().toLowerCase(), shown = 0;
    $$("button", tabs).forEach(function (b) { b.classList.toggle("active", b.dataset.cat === cat); b.setAttribute("aria-selected", String(b.dataset.cat === cat)); });
    $$(".p-card", grid).forEach(function (c) {
      var ok = (cat === "all" || c.dataset.cat === cat) && (!q || c.dataset.search.indexOf(q) > -1);
      c.classList.toggle("hide", !ok);
      if (ok) shown++;
    });
    $("#gEmpty").hidden = shown > 0;
  }
  search.addEventListener("input", apply);
  $("#gReset").addEventListener("click", function () { search.value = ""; cat = "all"; apply(); });
  filesBtn.addEventListener("click", function () {
    addFiles = !addFiles;
    filesBtn.setAttribute("aria-pressed", String(addFiles));
    try { localStorage.setItem("pn-files", addFiles ? "1" : "0"); } catch (e) {}
    showToast(addFiles ? "Copied prompts will ask Gemini to use your files first" : "Turned off");
  });
  var hashCat = location.hash.replace("#", "");
  if (CATS.some(function (c) { return c[0] === hashCat; })) cat = hashCat;
  apply();

  var bar = $("#gBar");
  function stuck() { var top = parseFloat(getComputedStyle(bar).top) || 0; bar.classList.toggle("stuck", getComputedStyle(bar).position === "sticky" && bar.getBoundingClientRect().top <= top + 1); }
  window.addEventListener("scroll", stuck, { passive: true }); stuck();
  var nav = $("#nav"), menuBtn = $("#menuBtn");
  menuBtn.addEventListener("click", function () {
    var open = !nav.classList.contains("open");
    nav.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    $(".ms", menuBtn).textContent = open ? "close" : "menu";
  });
})();

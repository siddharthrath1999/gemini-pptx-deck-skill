// All site copy and data lives here. Image paths are relative to src/assets/.

export const REPO = "siddharthrath1999/pptx-native";
export const GITHUB = `https://github.com/${REPO}`;
export const ZIP_URL = `${GITHUB}/releases/latest/download/pptx-native.zip`;

export const NAV = [
  { href: "#how", label: "How it works" },
  { href: "#examples", label: "Examples" },
  { href: "#features", label: "What you get" },
  { href: "#setup", label: "Set up" },
  { href: "#faq", label: "FAQ" },
];

export const HERO_PROMPT = "Make a 15-slide analysis of India's electric two-wheeler market for our leadership team.";
export const HERO_FAN = ["examples/upi-01.jpg", "run/s03.jpg", "audiences/board-2.jpg", "run/s01.jpg", "audiences/pitch-3.jpg", "run/s12.jpg", "examples/upi-31.jpg"];
// value: "yes" | "no" | "part", with an optional note
type Cell = [string, string?];
export const COMPARE: { cols: string[]; rows: { label: string; cells: Cell[] }[] } = {
  cols: ["Chat answer", "Image-based tools", "Quick exports", "PPTX Native"],
  rows: [
    { label: "A real .pptx file", cells: [["no"], ["part", "images inside"], ["part", "via conversion"], ["yes"]] },
    { label: "Every text box, shape and icon editable", cells: [["no"], ["no"], ["yes"], ["yes"]] },
    { label: "Native charts with the data inside", cells: [["no"], ["no"], ["part"], ["yes"]] },
    { label: "Researched, with sources on the slide", cells: [["part"], ["part"], ["part"], ["yes"]] },
    { label: "Checks and looks at its own slides", cells: [["no"], ["no"], ["no"], ["yes"]] },
    { label: "Edits your existing deck, slide by slide", cells: [["no"], ["no"], ["no"], ["yes"]] },
  ],
};

// How it works: the real run, as five linked steps. `art` is the small proof shown in each step.
export const HOW = {
  request: "Make a 15-slide analysis of India's electric two-wheeler market for our leadership team.",
  steps: [
    { icon: "chat", title: "Ask", text: "One line in Task mode. Attach your files if you have them." },
    { icon: "travel_explore", title: "Research", text: "Reads your files first, then searches primary sources." },
    { icon: "palette", title: "Plan and design", text: "Plans the story, then picks a look for the room." },
    { icon: "rule", title: "Check", text: "Renders every slide, looks at it, and fixes what's off." },
    { icon: "task_alt", title: "Deliver", text: "A .pptx where every chart, table and word is editable." },
  ],
  sources: ["Vahan", "FADA", "CRISIL", "PM E-DRIVE"],
  palette: ["#13242b", "#f3f5f3", "#1f7a52", "#c96a2b", "#2f5d9e"],
  checks: ["Overflow fixed on 5 slides", "All 15 slides reviewed"],
};

export const AUDIENCES = [
  {
    key: "board", label: "Board update", icon: "groups",
    prompt: "Make a short board update on Lumen Bikes' Q3 for our board. Calm and factual; they need to approve three decisions.",
    diff: [["Structure", "Result first, then evidence, then the decisions to approve"], ["Slides", "Metric tiles, a city table with one row highlighted, a decisions list"], ["Tone", "Sentence headlines that state the result"], ["Look", "Executive slate: quiet greys, one deep green"]],
  },
  {
    key: "pitch", label: "Investor pitch", icon: "rocket_launch",
    prompt: "Make a short investor pitch for Lumen Bikes' seed round. Bold and simple; investors decide whether to take a meeting.",
    diff: [["Structure", "The idea, the proof, the growth, the ask"], ["Slides", "A one-line statement, one big number, a growth chart"], ["Tone", "Short, confident claims backed by one figure each"], ["Look", "Bold contrast: black, white and one red"]],
  },
  {
    key: "workshop", label: "Team workshop", icon: "school",
    prompt: "Make a short workshop deck for our support team on why Lumen riders cancel. Fun and interactive.",
    diff: [["Structure", "Question first, then the answer, then a recap"], ["Slides", "A quiz for the room, cards with icons, a recap"], ["Tone", "Friendly, plain words, questions to the room"], ["Look", "Playful bright: rounded cards and warm colour"]],
  },
  {
    key: "launch", label: "Product launch", icon: "campaign",
    prompt: "Make a short launch deck for Lumen Cargo, our new cargo bike plan, for the city teams who will roll it out.",
    diff: [["Structure", "What it is, how it works, when it arrives"], ["Slides", "A statement, a four-step process, a city timeline"], ["Tone", "Clear steps and dates, written for doers"], ["Look", "Dark tech: near-black with cyan light"]],
  },
];

export const EDITS = [
  ["dashboard", "“Turn slide 2 into something better than bullets”", "Rebuilt as cards, in the deck's theme"],
  ["find_replace", "“Change every FY25 to FY26”", "Every slide, formatting kept"],
  ["insert_chart", "“Update the chart with Q3 numbers”", "Same chart, new data"],
  ["add_box", "“Add a decisions slide after the table”", "A new slide that matches the rest"],
];

export const LAYOUT_FILTERS = [
  { key: "all", label: "All", icon: "apps" },
  { key: "data", label: "Data", icon: "bar_chart" },
  { key: "story", label: "Story", icon: "auto_stories" },
  { key: "flow", label: "Flow", icon: "account_tree" },
  { key: "teach", label: "Teaching", icon: "school" },
];
// [name, description, category, image number]
export const LAYOUTS: [string, string, string, number][] = [
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
  ["Next steps", "Actions with owners and dates.", "story", 37], ["Sources", "Numbered references.", "story", 38],
];

export const EXAMPLES = [
  { title: "India's electric two-wheeler market", sub: "Market entry analysis · executive slate · the run above", stats: ["15 slides", "12 sources", "Native charts"], slides: [1, 2, 3, 4, 6, 9, 12, 14].map((n) => `run/s${String(n).padStart(2, "0")}.jpg`) },
  { title: "How UPI works", sub: "Learning deck · cream, saffron and navy", stats: ["60 slides", "6 quizzes", "Notes on every slide"], slides: [1, 6, 9, 12, 31, 36, 52, 55].map((n) => `examples/upi-${String(n).padStart(2, "0")}.jpg`) },
  { title: "India's credit card market", sub: "Market analysis · boardroom navy", stats: ["45 slides", "5 parts", "40 issuers"], slides: [1, 3, 6, 14, 16, 20, 36, 40].map((n) => `examples/cards-${String(n).padStart(2, "0")}.jpg`) },
  { title: "Quick commerce benchmark", sub: "Competitive benchmark · editorial slate", stats: ["47 slides", "11 charts", "6 platforms"], slides: [1, 4, 6, 17, 22, 28, 34, 41].map((n) => `examples/qc-${String(n).padStart(2, "0")}.jpg`) },
];

export const INSTALL = {
  mac: `curl -fsSL https://raw.githubusercontent.com/${REPO}/main/install.sh | bash`,
  win: `irm https://raw.githubusercontent.com/${REPO}/main/install.ps1 | iex`,
  npx: `npx github:${REPO}`,
};

export const PRINCIPLES = [
  { icon: "groups", title: "Say the job", text: "Who it's for and what they should decide or learn. That one line shapes the structure more than anything else." },
  { icon: "verified", title: "Give the source of truth", text: "Attach the files that matter. One right document beats ten loosely related ones, and it outranks the web." },
  { icon: "checklist", title: "Name the must-haves", text: "Length, sections you need, things to avoid. Skip adjectives like \"amazing\"; they don't change the result." },
];

export const BUILDER = {
  topic: "India's EV market",
  groups: [
    { key: "deck", label: "Kind of deck", options: ["market analysis", "investor pitch", "learning deck", "quarterly review", "competitor benchmark", "step-by-step runbook"], active: [0] },
    { key: "aud", label: "Who it's for, and the decision", options: ["our leadership team, deciding whether to invest", "investors, deciding whether to fund us", "college students learning the basics", "new joiners in their first week"], active: [0] },
    { key: "len", label: "Length", options: ["15", "30", "50", "100"], active: [1] },
    { key: "extra", label: "Must-haves", multi: true, options: ["use the attached files first", "one slide per company", "quiz questions for the room", "an appendix with full tables", "a clear recommendation at the end"], active: [0] },
  ],
};

export const FAQ = [
  ["Is it really free?", "Yes. PPTX Native is open source under the MIT licence. To use it in the Gemini app you need a Google AI Pro or Ultra plan, because it runs in Task mode. In Antigravity, your usual Antigravity plan applies."],
  ["Why does it need Task mode in Gemini?", "Task mode gives Gemini a small computer where it can run the skill's tools. In normal chat it can't, so you'd get text, HTML or a Google Slides export instead of a .pptx."],
  ["Can it edit a deck I already have?", "Yes. Attach the .pptx and say what to change. It can rewrite text, update tables and chart data, replace notes, reorder or delete slides, and redesign or add slides in your deck's own fonts and colours. New and redesigned slides need a 16:9 deck."],
  ["Are the numbers right?", "It researches and cites sources, but it can still pick a weak source or misread one. Check figures before you present. The handoff note lists every source."],
  ["Can it use my brand?", "Give your colours as hex codes in the prompt. Fonts default to ones every device has; ask for a brand font only if everyone presenting has it installed."],
  ["Does it add photos?", "No. Visuals come from charts, tables, shapes and icons. Add your own photos afterwards."],
];

export const PROMPT_CATS = [
  { key: "all", label: "All", icon: "apps" },
  { key: "biz", label: "Business & strategy", icon: "trending_up" },
  { key: "learn", label: "Learning & training", icon: "school" },
  { key: "tech", label: "Product & tech", icon: "rocket_launch" },
  { key: "edit", label: "Editing decks", icon: "edit_document" },
];

// Parts in [brackets] become editable fields. pos sets the preview crop.
export const PROMPTS: { cat: string; title: string; img: string; pos?: string; text: string; why: string }[] = [
  { cat: "biz", title: "Market analysis", img: "run/s03.jpg", text: "Make a [30]-slide analysis of [India's electric two-wheeler market] for [our leadership team], who must decide [whether to enter in 2027]. End with a clear recommendation.", why: "Naming the decision gives the deck a destination, so every slide builds towards it." },
  { cat: "biz", title: "Board update", img: "audiences/board-2.jpg", text: "Make a [12]-slide board update on [our Q3 results] for [our board]. Lead with the result, show the evidence, and end with [the three decisions we need approved].", why: "Result first and decisions last is how boards read. The skill picks metric tiles and tables to match." },
  { cat: "biz", title: "Investor pitch", img: "audiences/pitch-3.jpg", text: "Make a [12]-slide seed pitch for [Lumen Bikes, a bike subscription startup] for [early-stage investors]. Cover the problem, the proof, growth, the team and the ask of [$500,000].", why: "Listing the beats keeps it tight. The look turns bold on its own because the audience is investors." },
  { cat: "biz", title: "Competitor benchmark", img: "run/s06.jpg", text: "Benchmark [India's six quick commerce apps] for [our strategy team] in [40] slides. One profile slide per company, a scorecard across [delivery speed, assortment, pricing and profitability], and what it means for us.", why: "Fixed criteria make companies comparable, and “what it means for us” forces a point of view." },
  { cat: "biz", title: "Quarterly business review", img: "layouts/l06.jpg", text: "Turn the attached [sales sheet] into a [20]-slide quarterly review for [the sales leadership team]. Show results against target, what drove the gap, and next quarter's plan.", why: "The attached sheet becomes the source of truth, so numbers come from your data, not the web." },
  { cat: "biz", title: "Strategy options", img: "run/s12.jpg", text: "Make a [15]-slide deck comparing [three ways to enter the Middle East market] for [our executive committee]. Score each option on [cost, speed, risk and upside] and recommend one.", why: "Asking for scores and a pick avoids a neutral list of pros and cons." },
  { cat: "learn", title: "Explainer with quizzes", img: "examples/upi-01.jpg", text: "Make a fun [30]-slide learning deck that teaches [college students] how [UPI payments work]. Use one running story, a quiz question every few slides, and plain words.", why: "A running story and regular quizzes keep a learning deck from turning into a lecture." },
  { cat: "learn", title: "New joiner onboarding", img: "layouts/l18.jpg", text: "Make a [20]-slide onboarding deck for [new joiners in our support team]. Cover [our product, our customers, the tools we use and their first-week checklist].", why: "Listing the topics sets the parts; the skill adds recaps between them." },
  { cat: "learn", title: "Team workshop", img: "audiences/workshop-2.jpg", text: "Make a [15]-slide workshop deck for [our support team] on [why customers cancel]. Start with a question to the room, answer it with data from the attached file, and end with a recap.", why: "A question first gets the room talking before the answer lands." },
  { cat: "learn", title: "Lecture with notes", img: "layouts/l36.jpg", text: "Make a [40]-slide lecture on [the basics of monetary policy] for [first-year economics students]. Split it into [four] parts with a recap after each, and write speaker notes I can read from.", why: "Asking for readable notes makes the notes full sentences, not reminders." },
  { cat: "learn", title: "Process training", img: "layouts/l33.jpg", text: "Make a [12]-slide training deck on [how to handle a refund request] for [new support agents]. Show each step, who owns it, and the common mistakes.", why: "Owners and mistakes turn a process diagram into something people can follow on day one." },
  { cat: "learn", title: "Report summary", img: "layouts/l24.jpg", text: "Summarise the attached [report] in [15] slides for [our team, who haven't read it]. One slide per key idea, with the page number it comes from.", why: "Page numbers keep the summary honest and easy to check." },
  { cat: "tech", title: "Product launch", img: "audiences/launch-3.jpg", text: "Make a [15]-slide launch deck for [Lumen Cargo, our new cargo bike plan] for [the city teams who will roll it out]. Cover what it is, how it works, the timeline and what each team must do.", why: "Writing for the people who roll it out makes the deck about actions and dates, not hype." },
  { cat: "tech", title: "Product roadmap", img: "run/s14.jpg", text: "Make a [12]-slide roadmap for [our mobile app] over [the next four quarters] for [engineering and design leads]. Group the work into [growth, reliability and platform].", why: "Named lanes give the roadmap slide its structure." },
  { cat: "tech", title: "Incident review", img: "layouts/l17.jpg", text: "Make a [10]-slide review of [the 14 October checkout outage] for [engineering leadership] from the attached timeline. Show what happened, the impact, the root cause, and the fixes with owners and dates.", why: "Owners and dates on every fix is what makes a review useful a month later." },
  { cat: "tech", title: "Runbook", img: "layouts/l34.jpg", text: "Make a [20]-slide runbook for [deploying our API to production] for [on-call engineers]. One step per slide with the owner, the time it takes and the exact command.", why: "Exact commands in a code panel mean nobody has to retype from memory at 3 a.m." },
  { cat: "tech", title: "Architecture overview", img: "layouts/l21.jpg", text: "Make a [12]-slide architecture overview of [our payments system] for [new engineers]. Show the layers, how a request flows through them, and where it can fail.", why: "“Where it can fail” adds the part new engineers need most." },
  { cat: "tech", title: "Monthly product review", img: "layouts/l19.jpg", text: "Make a [15]-slide monthly product review for [our product team] from the attached [metrics export]. Lead with what changed, show the funnel, and list three experiments for next month.", why: "Leading with change, not totals, keeps the review short." },
  { cat: "edit", title: "Redesign weak slides", img: "gallery/redesign.jpg", text: "Redesign slides [4 to 9] of the attached deck. Keep our fonts, colours and wording, and replace bullet lists with better layouts.", why: "Naming the slides and what to keep means only those slides change." },
  { cat: "edit", title: "Update the numbers", img: "run/s04.jpg", text: "Update every figure in the attached deck for [Q3 FY27] using the attached sheet. Change [FY26] to [FY27] everywhere, and list anything you couldn't update.", why: "Asking for a list of misses tells you exactly what to check by hand." },
  { cat: "edit", title: "Cut it down", img: "layouts/l02.jpg", text: "Cut the attached deck from [40] to [15] slides for [a 10-minute board slot]. Keep the story, merge where you can, and move the detail to an appendix.", why: "Saying how long you have to present sets the right length better than a slide count alone." },
  { cat: "edit", title: "Add a section", img: "edit/after-new.jpg", text: "Add a [5]-slide section on [competitor pricing] after slide [12] of the attached deck, in the same style as the rest.", why: "New slides take the deck's own theme colours and fonts." },
  { cat: "edit", title: "Rewrite the notes", img: "gallery/notes.jpg", pos: "bottom", text: "Rewrite the speaker notes in the attached deck for [investors]. Keep the slides as they are. Each note should say the one point to land and lead into the next slide.", why: "“Keep the slides as they are” limits the edit to notes only." },
  { cat: "edit", title: "Reorder for the answer first", img: "run/s02.jpg", text: "Reorder the attached deck so [the recommendation] comes first, then the evidence. Delete slides that repeat a point, and tell me which ones you removed.", why: "A change log of removed slides makes the cut easy to review." },
];

// Release notes, newest first. Add a new entry at the top for each release.
// Keep it plain: one-line summary, then short items. Types: new, improved, fixed.

export type Change = { type: "new" | "improved" | "fixed"; title: string; text: string };
export type Release = { version: string; date: string; title: string; summary: string; changes: Change[] };

export const RELEASES: Release[] = [
  {
    version: "1.2.1",
    date: "2026-10-14",
    title: "Steadier slide previews",
    summary: "A small fix for Gemini's Task mode: previews of your slides no longer stall.",
    changes: [
      { type: "fixed", title: "Slide previews no longer stall", text: "In Task mode, turning the deck into a PDF could hang. The skill now gives LibreOffice a folder it can write to and checks the PDF is there before making previews." },
      { type: "improved", title: "A clear message if previews fail", text: "If previews still can't be made, the skill finishes its other checks and tells you the exact error instead of stopping." },
    ],
  },
  {
    version: "1.2.0",
    date: "2026-10-14",
    title: "Edit your existing decks",
    summary: "Hand it a deck you already have and say what to change.",
    changes: [
      { type: "new", title: "Edit a deck you already have", text: "Attach a .pptx and say what to change. It rewrites text, updates tables and chart data, changes speaker notes, and reorders or deletes slides." },
      { type: "new", title: "Redesign slides in your deck's own style", text: "New and redesigned slides use your deck's fonts and colours, so they match the rest." },
      { type: "improved", title: "Any widescreen slide size", text: "Works with any 16:9 deck, not just PowerPoint's default 13.33 × 7.5 in." },
      { type: "fixed", title: "Small layout fixes", text: "KPI tiles with icons, and rotated labels on chart axes." },
    ],
  },
  {
    version: "1.1.0",
    date: "2026-10-14",
    title: "Now called PPTX Native",
    summary: "A new name, and a one-line install for Google Antigravity.",
    changes: [
      { type: "new", title: "New name", text: "build-pptx-deck is now PPTX Native. In Gemini, upload pptx-native.zip as a new skill, then delete the old one." },
      { type: "new", title: "Works in Google Antigravity", text: "Install with one line on macOS, Linux or Windows, or with npx." },
    ],
  },
  {
    version: "1.0.0",
    date: "2026-10-14",
    title: "First release",
    summary: "The first public version, as build-pptx-deck for the Gemini app.",
    changes: [
      { type: "new", title: "Real PowerPoint from one line", text: "Researched, designed .pptx decks with native charts, tables and icons, where every element stays editable." },
      { type: "new", title: "Checks its own work", text: "A built-in checker catches text overflow and overlapping shapes before you see the deck." },
    ],
  },
];

export const LATEST = RELEASES[0];
export const anchor = (v: string) => `v${v.replace(/\./g, "-")}`;
export const niceDate = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

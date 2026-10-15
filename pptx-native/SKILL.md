---
name: pptx-native
description: Researches, structures, writes and builds presentation decks as native, fully editable PowerPoint (.pptx) files with real charts, tables, vector icons and speaker notes, and edits existing .pptx decks slide by slide while keeping their theme. Use when asked for a deck, slides, a presentation, a pitch, a benchmark, an analysis, a review, a walkthrough, a runbook, training material or a report in slide form, including long decks of 100 or more slides, or when a .pptx is attached with changes to make, even when the request is brief or does not mention PowerPoint. Can build inside the user's own company template and place their photos, screenshots and logo. Runs in Gemini app Task mode, Google Antigravity, or any agent that can run Python. Never substitutes Google Slides, HTML, Canvas or images for the .pptx file.
---

# PPTX Native: build a PowerPoint deck

The deliverable is one `.pptx` file the user can open and edit in PowerPoint, Keynote or Google Slides. Every text box, shape, chart and table in it is a native object. You write a deck spec in JSON, and the bundled scripts turn it into slides and check them. You then render the slides to images and look at them before you deliver.

## Hard rules

- The output is a `.pptx` built with `scripts/build_deck.py`. Do not answer with Google Slides, HTML, Canvas, a PDF, images of slides, or a script for the user to run.
- This skill needs Python code execution. In the Gemini app that means Task mode: if you cannot run code in this conversation, say so in one sentence and ask the user to switch to Task mode. Do not pretend, and do not fall back to another format.
- On a user's own computer (Antigravity, Gemini CLI or another agent), check once that `python3 -c "import pptx, PIL"` works. If it fails, install the two packages with `python3 -m pip install --user python-pptx pillow`, then continue.
- Never invent a number, quote, name or source. A missing fact becomes a bracketed placeholder such as `[2025 revenue]`, and you list every placeholder in the handoff.
- No pictures of text and no generated or downloaded images. Visuals come from layouts, native charts, tables, the bundled icons, and pictures the user supplied (photos, screenshots, logos), placed with the picture layouts.

## Workflow

If the user attached a `.pptx` and wants it changed rather than replaced, follow `references/editing.md` instead of the steps below.

Work through these in order. Tick each off before moving on.

1. **Read the brief and decide the deck.** Infer the deck type, audience, purpose, length and tone from what you were given. When no length is given, fit the request: `references/storylines.md` gives default ranges by deck type. Go longer when the brief asks for depth (detailed, comprehensive, full) or covers many companies, markets or topics; go shorter when it asks for a summary or a quick deck. State your assumptions and the planned slide count in one or two lines and keep going. Ask a question only when the topic itself is unclear or a wrong guess would waste the whole deck, and ask at most two.
2. **Gather the material.** Use what the user gave you first (files, Connected Apps, the conversation). Copy any attached pictures, logo or template into the `deck/` folder so the spec can name them. Then search the web for anything factual the deck needs. Keep a source log as you go: claim, figure, source name, date. Prefer primary sources and recent data.
3. **Build the storyline.** Open `references/storylines.md` and pick the pattern that fits. Write an outline: sections, then one headline sentence per slide that states that slide's point. Read only the headlines in order; they should tell the whole story. Fix the outline until they do.
4. **Choose the design direction.** If the user attached a company template (`.pptx` or `.potx`) for a new deck, build inside it (`meta.template`, see "Building in a template" in `references/layout-catalog.md`) and skip choosing a look. Otherwise open `references/design-directions.md` and decide palette, fonts, card style and how slide tones will be used, to suit this audience and subject. Do not default to the same look every time. If the user gave a logo, set `meta.logo`.
5. **Write the spec.** Open `references/layout-catalog.md`. Pick each slide's layout from the shape of its content, not from habit. Write `deck/deck.json` (meta and theme) and `deck/slides-01.json`, `deck/slides-02.json` and so on, with at most 25 slides per file. Add speaker notes to every slide and a source line to every slide that shows data. Give every picture `alt` text that says what it shows.
6. **Build and fix.** Run `python3 <skill folder>/scripts/build_deck.py deck -o <short-name>.pptx`. Read the lint output. Fix every error and every warning, then rebuild. Repeat until there are no errors and any remaining warning is one you can justify.
7. **Render and look.** Turn the deck into images with the tools on the task computer, then make contact sheets:
   ```
   mkdir -p render1
   HOME=/tmp soffice --headless --convert-to pdf --outdir render1 <short-name>.pptx
   ls -l render1/<short-name>.pdf
   pdftoppm -png -r 50 render1/<short-name>.pdf render1/s
   python3 <skill folder>/scripts/sheet_deck.py render1
   ```
   Open every `sheet-NN.png` and check each slide against the list below. For a closer look at one slide, run `pdftoppm -png -r 110 -f 12 -l 12` on the PDF. Fix the spec, rebuild, and render again into a new folder (`render2`, and so on). Run one conversion at a time and check that the PDF exists before running `pdftoppm`; if it is missing, wait a few seconds and look again before converting a second time. If LibreOffice will not start, try once with `libreoffice` in place of `soffice`. If the working folder's path has spaces or unusual characters, copy the `.pptx` to `/tmp` and render there. Rendering is part of the job: do not skip it to save time. If it still cannot render, continue on lint alone and quote the exact error text in the handoff so it can be fixed.
8. **Deliver.** Attach the `.pptx` (in an IDE agent such as Antigravity, save it in the workspace and give its path). If the user asked for a PDF, convert the final `.pptx` once more and attach that PDF too; otherwise deliver only the `.pptx`. Follow it with a short handoff note (format below). Do not paste the slide contents into the chat.

Find this skill's folder once and reuse the path. In the Gemini app it is usually `skills/user/pptx-native` under the working directory. In Antigravity it is `~/.gemini/antigravity/skills/pptx-native`, `~/.gemini/config/skills/pptx-native`, or `.agents/skills/pptx-native` in the project. Use `python` if `python3` is not available.

## What to look for in the render

- Text that is cut off, overlaps something, or is much smaller than on neighbouring slides.
- A slide that is mostly empty, or one so full it has no air. Rebalance by moving content or changing layout. Lint flags slides that use less than 40% of their height.
- A picture that is blurry, cropped badly (a head cut off, the key part of a screenshot missing) or the wrong way up. Change `focus` or `fit`.
- A chart whose labels collide or whose point is not visible within three seconds.
- Three or more slides in a row that look the same.
- A headline that wraps to three lines. Shorten it.
- Anything that looks like a default template. Change the layout or the content until it looks designed.

## Long decks (60 to 150 slides)

- Depth comes from more evidence and more angles, not from spreading thin content over more slides. Every slide needs its own point.
- Use `section` dividers, a `recap` at the end of each part, and an appendix for method, definitions and sources.
- Write and build in parts. Build after each part file so problems surface early. All part files merge into one deck.
- Keep a running example, case or character through the deck where it helps, so the audience has something to hold on to.

## Built in

Every deck the kit builds already has, without any spec fields: real slide titles (navigation, outline view and screen readers), a PowerPoint section for each `section` divider, alt text on charts and tables, decorative marks on purely visual shapes, and a header row on tables. Do not add these by hand.

## Revisions

When the user asks for changes, edit the affected slides in the spec files, rebuild to the same file name, re-render those slides, and deliver the updated file. Do not rewrite slides they did not mention.

## Common mistakes

- Titles that are labels ("Market overview"). Write the finding ("The market doubled in three years, and two firms took most of it").
- Bullet lists where a table, chart, cards or a comparison would show the structure.
- Em dashes, exclamation marks, and stock phrases. `references/writing-rules.md` has the list, and lint enforces it.
- The same layout many times in a row, or the same theme for every deck.
- Charts with no source line, or numbers with no unit or date. Source lines and captions that show file names.
- Reading more into a picture than it shows, or presenting a one-moment comparison across cities or companies as a trend over time.
- Cramming: more than six bullets, more than eight cards, more than ten table rows. Split the slide.
- Long text in small places: KPI values over about 7 characters, table cells over a few words, notes inside bars. Put the detail in the label, a takeaway or the speaker notes.
- Stopping at a summary when the brief asked for depth. In a detailed benchmark or analysis, each entity and each dimension deserves its own evidence slides, not one row in a table.
- Delivering without opening the render.

## Handoff note format

```
<File name>, <N> slides, <sections in a few words>.
Assumed: <audience, purpose, anything you inferred>.
Placeholders to fill: <list, or "none">.
Sources: <count>, listed on the Sources slide.
Not checked: <"nothing", or what was skipped and the exact error, e.g. "render failed: soffice: <error text>">.
```

## Reference files

- `references/storylines.md`: story patterns by deck type, headline rules, devices for long decks.
- `references/design-directions.md`: theme tokens, presets, how to design a look for a brief.
- `references/layout-catalog.md`: the spec format, every layout and its fields, charts, tables, icons.
- `references/writing-rules.md`: how slide copy and speaker notes should read.
- `references/editing.md`: inspecting and editing an attached deck, section by section.
- `examples/gallery.json`: a working spec that uses every layout. Build and render it once if you want to see them.

---
name: pptx-native
description: Researches, structures, writes and builds presentation decks as native, fully editable PowerPoint (.pptx) files with real charts, tables, vector icons and speaker notes, using the bundled Python deck kit. Use when asked for a deck, slides, a presentation, a pitch, a benchmark, an analysis, a review, a walkthrough, a runbook, training material or a report in slide form, including long decks of 100 or more slides, even when the request is brief or does not mention PowerPoint. Runs in Gemini app Task mode, Google Antigravity, or any agent that can run Python. Never substitutes Google Slides, HTML, Canvas or images for the .pptx file.
---

# PPTX Native: build a PowerPoint deck

The deliverable is one `.pptx` file the user can open and edit in PowerPoint, Keynote or Google Slides. Every text box, shape, chart and table in it is a native object. You write a deck spec in JSON, and the bundled scripts turn it into slides and check them. You then render the slides to images and look at them before you deliver.

## Hard rules

- The output is a `.pptx` built with `scripts/build_deck.py`. Do not answer with Google Slides, HTML, Canvas, a PDF, images of slides, or a script for the user to run.
- This skill needs Python code execution. In the Gemini app that means Task mode: if you cannot run code in this conversation, say so in one sentence and ask the user to switch to Task mode. Do not pretend, and do not fall back to another format.
- On a user's own computer (Antigravity, Gemini CLI or another agent), check once that `python3 -c "import pptx, PIL"` works. If it fails, install the two packages with `python3 -m pip install --user python-pptx pillow`, then continue.
- Never invent a number, quote, name or source. A missing fact becomes a bracketed placeholder such as `[2025 revenue]`, and you list every placeholder in the handoff.
- No pictures of text and no generated images. Visuals come from layouts, native charts, tables and the bundled icons.

## Workflow

Work through these in order. Tick each off before moving on.

1. **Read the brief and decide the deck.** Infer the deck type, audience, purpose, length and tone from what you were given. When no length is given, plan a thorough deck, not a summary: `references/storylines.md` gives the default ranges, and this user prefers depth. State your assumptions and the planned slide count in one or two lines and keep going. Ask a question only when the topic itself is unclear or a wrong guess would waste the whole deck, and ask at most two.
2. **Gather the material.** Use what the user gave you first (files, Connected Apps, the conversation). Then search the web for anything factual the deck needs. Keep a source log as you go: claim, figure, source name, date. Prefer primary sources and recent data.
3. **Build the storyline.** Open `references/storylines.md` and pick the pattern that fits. Write an outline: sections, then one headline sentence per slide that states that slide's point. Read only the headlines in order; they should tell the whole story. Fix the outline until they do.
4. **Choose the design direction.** Open `references/design-directions.md`. Decide palette, fonts, card style and how slide tones will be used, to suit this audience and subject. Do not default to the same look every time.
5. **Write the spec.** Open `references/layout-catalog.md`. Pick each slide's layout from the shape of its content, not from habit. Write `deck/deck.json` (meta and theme) and `deck/slides-01.json`, `deck/slides-02.json` and so on, with at most 25 slides per file. Add speaker notes to every slide and a source line to every slide that shows data.
6. **Build and fix.** Run `python3 <skill folder>/scripts/build_deck.py deck -o <short-name>.pptx`. Read the lint output. Fix every error and every warning, then rebuild. Repeat until there are no errors and any remaining warning is one you can justify.
7. **Render and look.** Turn the deck into images with the tools on the task computer, then make contact sheets:
   ```
   mkdir -p render1
   soffice --headless --convert-to pdf --outdir render1 <short-name>.pptx
   pdftoppm -png -r 50 render1/<short-name>.pdf render1/s
   python3 <skill folder>/scripts/sheet_deck.py render1
   ```
   Open every `sheet-NN.png` and check each slide against the list below. For a closer look at one slide, run `pdftoppm -png -r 110 -f 12 -l 12` on the PDF. Fix the spec, rebuild, and render again into a new folder (`render2`, and so on). If LibreOffice will not start, try once more with `HOME=/tmp` in front of the command, and once with `libreoffice` in place of `soffice`. Rendering is part of the job: do not skip it to save time. If it still cannot render, continue on lint alone and quote the exact error text in the handoff so it can be fixed.
8. **Deliver.** Attach the `.pptx` (in an IDE agent such as Antigravity, save it in the workspace and give its path). Follow it with a short handoff note (format below). Do not paste the slide contents into the chat.

Find this skill's folder once and reuse the path. In the Gemini app it is usually `skills/user/pptx-native` under the working directory. In Antigravity it is `~/.gemini/antigravity/skills/pptx-native`, `~/.gemini/config/skills/pptx-native`, or `.agents/skills/pptx-native` in the project. Use `python` if `python3` is not available.

## What to look for in the render

- Text that is cut off, overlaps something, or is much smaller than on neighbouring slides.
- A slide that is mostly empty, or one so full it has no air. Rebalance by moving content or changing layout.
- A chart whose labels collide or whose point is not visible within three seconds.
- Three or more slides in a row that look the same.
- A headline that wraps to three lines. Shorten it.
- Anything that looks like a default template. Change the layout or the content until it looks designed.

## Long decks (60 to 150 slides)

- Depth comes from more evidence and more angles, not from spreading thin content over more slides. Every slide needs its own point.
- Use `section` dividers, a `recap` at the end of each part, and an appendix for method, definitions and sources.
- Write and build in parts. Build after each part file so problems surface early. All part files merge into one deck.
- Keep a running example, case or character through the deck where it helps, so the audience has something to hold on to.

## Revisions

When the user asks for changes, edit the affected slides in the spec files, rebuild to the same file name, re-render those slides, and deliver the updated file. Do not rewrite slides they did not mention.

## Common mistakes

- Titles that are labels ("Market overview"). Write the finding ("The market doubled in three years, and two firms took most of it").
- Bullet lists where a table, chart, cards or a comparison would show the structure.
- Em dashes, exclamation marks, and stock phrases. `references/writing-rules.md` has the list, and lint enforces it.
- The same layout many times in a row, or the same theme for every deck.
- Charts with no source line, or numbers with no unit or date.
- Cramming: more than six bullets, more than eight cards, more than ten table rows. Split the slide.
- Long text in small places: KPI values over about 7 characters, table cells over a few words, notes inside bars. Put the detail in the label, a takeaway or the speaker notes.
- Stopping at a summary. For a benchmark or analysis, each entity and each dimension deserves its own evidence slides, not one row in a table.
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
- `examples/gallery.json`: a working spec that uses every layout. Build and render it once if you want to see them.

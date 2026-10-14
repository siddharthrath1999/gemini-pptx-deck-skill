# Deck Builder for Gemini

**Ask Gemini for a deck. Get a real PowerPoint.**

`build-pptx-deck` is a skill for the Gemini app. You type one line, and Gemini researches, writes, designs and checks a full presentation, then gives you a `.pptx` file you can edit in PowerPoint, Keynote or Google Slides. Charts, tables, icons and speaker notes are all native and editable.

**Website and full guide:** https://siddharthrath1999.github.io/gemini-pptx-deck-skill/

![Cover slide of a learning deck made with this skill](docs/img/upi-01.jpg)

## What you need

- A personal Google account (not work or school), age 18+
- A Google AI Pro or Ultra plan (the skill runs in **Task** mode)
- Keep Activity on, and Personal Intelligence on for tasks
- The Gemini website or Mac app to upload the skill

Task mode is not offered in the EEA, the UK, Switzerland or Nigeria.

## Set up

1. Download [`build-pptx-deck.zip`](https://github.com/siddharthrath1999/gemini-pptx-deck-skill/releases/latest/download/build-pptx-deck.zip). Don't unzip it.
2. In Gemini, click **Customise** in the left menu, then **Skills**.
3. Click **Create**, then **Upload**, and choose the zip.
4. Check the name says `build-pptx-deck`, then click **Create**.

To update later: open the skill, click **More**, then **Replace skill**, and upload the new zip.

## Make a deck

1. Start a new chat. Pick **4 Argon** if you have it.
2. Click **Task** under the message box. (In normal Chat mode you'll get text or Google Slides, not a `.pptx`.)
3. Describe the deck. Gemini picks the skill itself, or type `@` and choose `build-pptx-deck`.
4. Wait for the file, then download it.
5. Ask for changes in the same chat: "Make slide 12 a chart", "Use our brand colours".

## Prompting tips

Give it: **topic**, **who it's for**, **what they should know or do after**, **length**, **style**, and **your files or data**.

> Make a 40-slide market analysis of India's credit card market for our product leadership team. Compare the top 10 issuers on cards, spend and spend per card, and end with three opportunities for a new co-brand card. Serious, clean style.

> Make a fun 30-slide learning deck that teaches college students how UPI payments work. Use one running story, quiz questions for the room, and simple language.

- **Attach files** (PDFs, spreadsheets, notes) to the same message. Gemini uses them first.
- **Say the length.** Without one, it plans a thorough deck (about 40 to 80 slides for an analysis).
- **Set the look** with a mood ("calm and premium") or hex colours.
- **Read the handoff note.** It lists assumptions, gaps like `[2025 revenue]`, and sources.

## What it can make

- 34 layouts: KPI tiles, cards, comparisons, scorecards, heatmaps, timelines, roadmaps, funnels, 2x2 matrices, runbook steps, quiz slides and more
- Native charts: column, bar, stacked, line, area, pie, doughnut, scatter, waterfall
- Nine starting styles plus custom colours
- Speaker notes on every slide, sources on data slides, decks of 100+ slides

## Good to know

- **Check the numbers.** Gemini cites sources but can still pick a weak one. Verify figures before you present.
- **Fonts work everywhere** (Arial, Georgia, Calibri and similar), so the deck looks the same on every device.
- **No photos.** Add your own images in PowerPoint afterwards.

## How it works inside

```
build-pptx-deck/
  SKILL.md                 the workflow Gemini follows
  references/              storylines, design directions, layout catalog, writing rules
  scripts/build_deck.py    turns a JSON deck spec into a .pptx and checks it
  scripts/dk_*.py          layouts, themes, charts, tables, icons, text measuring, checks
  scripts/sheet_deck.py    makes contact sheets of rendered slides for visual review
  scripts/icons.json       152 Lucide icons as vector point lists
  examples/gallery.json    a spec that uses every layout
```

Gemini writes a deck spec (JSON), runs `build_deck.py` to build the `.pptx` with `python-pptx`, fixes everything the checks report, renders the slides with LibreOffice to look at them, and delivers the file.

To try the kit on your own computer (Python 3.9+, `pip install python-pptx pillow`):

```
python3 build-pptx-deck/scripts/build_deck.py build-pptx-deck/examples/gallery.json -o gallery.pptx
```

## Licence

MIT. Icons are from [Lucide](https://lucide.dev) under the ISC licence; see `THIRD_PARTY_NOTICES.md`. Not affiliated with Google or Microsoft.

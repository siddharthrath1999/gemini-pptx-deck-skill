# Design directions

The look of a deck is a decision about its audience and subject. Make that decision for each deck. A board paper for a bank, a workshop for new joiners and a pitch for a consumer brand should not look alike.

## How to decide

1. Who is in the room, and what do they expect a serious document to look like?
2. What is the subject's own character: technical, financial, playful, crafted, urgent?
3. Does the user or their organisation have brand colours or fonts? If they gave any, use them. If a brand is named but no colours were given, ask once or choose a neutral look; do not guess a brand's colours.
4. Pick a base (light, warm, dark), one or two accent colours with a job each, a type pairing, and a card style. Say what you chose in one line of the handoff.

## Theme tokens

Set these in `deck.json` under `theme`. Start from a preset and override, or define every token yourself.

| Token | Meaning |
|---|---|
| `bg` | Slide background |
| `surface` | Card and panel fill |
| `ink` | Main text |
| `muted` | Secondary text (derived if absent) |
| `line` | Rules and card outlines (derived if absent) |
| `dark` | Background for `dark` tone slides (defaults to ink) |
| `accents` | 1 to 4 colours. The first is the main accent; `accent2` to `accent4` tones use the others |
| `series` | Chart colours in order. Put the colour for the main series first |
| `display`, `body`, `mono` | Fonts for headlines, text, and code or labels |
| `radius` | Corner radius in inches: 0 is square, 0.08 soft, 0.2 round |
| `card` | `outline`, `fill`, `bold` (heavy outline), `rule` (top rule, no box) |
| `header` | `kicker` (label above headline), `rule` (line under the header), `block` (accent bar beside the headline) |
| `kicker` | `caps`, `mono`, `pill` |
| `tracking` | Headline letter spacing in thousandths of an em; -20 is tight, 0 is normal |
| `title_size` | Headline size in points (default 30) |

```json
"theme": {"bg": "FBFAF7", "surface": "FFFFFF", "ink": "1B1F23", "dark": "12301F",
          "accents": ["1F7A4D", "E9C46A", "C8553D"], "series": ["1F7A4D", "1B1F23", "E9C46A", "C8553D", "9AA5A0"],
          "display": "Georgia", "body": "Arial", "mono": "Courier New",
          "radius": 0.06, "card": "outline", "header": "rule", "kicker": "caps", "tracking": 0}
```

The build warns when text contrast is too low and adjusts muted colours and accent backgrounds to stay legible.

## Presets (starting points, not answers)

| Preset | Character | Suits |
|---|---|---|
| `editorial-warm` | Warm off-white, near-black, pale yellow, green and lilac accents, soft cards | Explainers, case studies, learning decks |
| `boardroom-navy` | White, navy, one strong blue, serif headlines, ruled header | Board and executive papers, finance |
| `executive-slate` | Cool grey, slate, deep green, serif headlines | Strategy, operations reviews |
| `mono-minimal` | Greyscale with one orange accent, square corners | Product, design, research readouts |
| `classic-serif` | Cream, brown-black, brick and forest accents, all serif, ruled | Reports, heritage brands, long reads |
| `dark-tech` | Near-black, cyan and blue accents, mono labels | Engineering, security, product launches |
| `playful-bright` | Cream, navy ink, pink, blue and yellow, round corners, heavy outlines | Workshops, education, consumer brands |
| `soft-pastel` | Lilac white, violet and pink accents, round cards | Wellbeing, people and culture, lifestyle |
| `bold-contrast` | Black and white with red, heavy headlines, square | Manifestos, launches, short punchy pitches |

Change at least the accents when you start from a preset, unless the preset already fits the brief exactly. Two decks for different subjects should be distinguishable at a glance.

## Fonts

Decks get opened on Windows, Mac, phones and in Google Slides. Use only fonts that exist everywhere:

Arial, Arial Black, Georgia, Times New Roman, Trebuchet MS, Verdana, Courier New, Calibri, Cambria.

Pairings that work: Georgia headlines with Arial text (considered, editorial); Arial throughout with tight tracking (modern, neutral); Trebuchet MS throughout (friendly); Cambria with Calibri (corporate, at home in Office); Arial Black headlines with Arial text (loud; use tracking -20).

Use another font only when the user names it and confirms it is installed where the deck will be shown. The build warns about fonts outside the list.

## Colour

- One dark, one light, one or two accents. More colours need a reason, such as one per category that runs through the whole deck.
- Give each accent a job and keep it: the main series in charts, the highlight in tables, the question slides.
- Pale accents are for fills and backgrounds. The kit uses ink for text when an accent is too pale to read.
- Avoid pure white on pure black; toned neutrals look more deliberate.
- Do not rely on red against green to carry meaning. Pair colour with position, labels or icons.
- In charts, grey out everything that is context and colour only what the headline is about (`highlight`).

## Tones and rhythm

Tones change a slide's background and every colour on it. Use them to mark roles so the audience learns the pattern:

- `light`: the default for evidence and explanation.
- `dark`: section dividers, closing, and slides about how something works underneath.
- `accent`: statements and questions for the room.
- `alt`: quotes, asides, appendix.
- `accent2` to `accent4`: one per part or category, when the deck has that structure.

Decide the pattern once and apply it throughout. A 60-slide deck in a single tone is tiring; one that changes tone at random is confusing.

Vary layouts for rhythm: after two dense slides, place a statement, a big number or a question. Avoid three slides in a row with the same layout unless they are a deliberate series (for example one timeline per market).

## What makes a slide look designed

- A headline that says something, set large, with air around it.
- One focal point: the number, the highlighted bar, the emphasised card.
- Alignment to the same margins on every slide. The layouts do this; `custom` slides must respect x 0.75 to 12.58.
- Consistent structure for repeated content: the same card anatomy, the same position for sources.
- Restraint. Icons where they label something, not on every line. Colour where it means something.
- Enough text to be understood without the presenter, and no more.

## Worked examples

| Brief | Direction |
|---|---|
| Quarterly business review for a logistics firm's leadership | `executive-slate`, accents deep green and amber, tables and waterfalls, dark dividers per region |
| Seed pitch for a climate data startup | Custom: `bg` F7FAF8, `ink` 10231C, accents 0E9F6E and FFB703, Arial tight tracking, `card` fill, big numbers and one chart per slide |
| Training deck on prompt writing for new analysts | `playful-bright` with accents changed to the firm's blue, question and answer pairs, numbered cards, a recap per part |
| Competitive benchmark of five payment apps | `mono-minimal` with one accent per app in `series`, scorecards, heatmaps, bar lists, one profile slide per app |
| Incident runbook for an on-call team | `dark-tech`, `steps` and `code` layouts, accent slides only for warnings |
| Annual report summary for a museum | `classic-serif`, brick accent, quotes on `alt` tone, timelines |

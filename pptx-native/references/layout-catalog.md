# Layout catalog and spec format

## The spec

A deck is a folder:

```
deck/
  deck.json        meta and theme (and optionally the first slides)
  slides-01.json   a JSON array of slide objects, at most 25
  slides-02.json   more slides; files merge in name order
```

`deck.json`:

```json
{
  "meta": {"title": "Deck title", "author": "Name or team", "date": "October 2026",
           "footer": "Short label shown beside page numbers", "page_numbers": true},
  "theme": {"preset": "editorial-warm", "overrides": {"accents": ["0B6E4F", "F2A900"]}},
  "slides": []
}
```

A single `.json` file with `meta`, `theme` and `slides` also works for short decks.

Build: `python3 scripts/build_deck.py deck -o name.pptx`. Lists: `--layouts`, `--presets`, `--icons`.

## Fields every slide accepts

| Field | Meaning |
|---|---|
| `layout` | One of the layouts below. Required. |
| `tone` | `light` (default), `alt`, `dark`, `accent`, `accent2`, `accent3`, `accent4`. Sets the slide background and all colours on it. |
| `kicker` | Small label above the headline, such as the part and topic: "Part 2 · Revenue". |
| `title` | The headline. A sentence that states the point. |
| `subtitle` | One line under the headline. Optional; most slides do not need it. |
| `takeaway` | A bold closing sentence at the bottom of the body. Use it when the slide needs a "so what". |
| `source` | Source line in the footer. Required on data slides, or set `"no_source": true` for the user's own data. |
| `notes` | Speaker notes. |

Text fields accept `**bold**` for emphasis and `\n` for a new paragraph. Colours are six hex digits without `#`. Sizes and positions are automatic except in `custom`.

Slide size is 13.333 x 7.5 in. Body content sits between x 0.75 and 12.58, and from just under the header (about y 1.75 after a one-line headline, 2.2 after two lines) down to y 6.72.

## Choosing a layout

| The content is... | Use |
|---|---|
| One sentence that matters | `statement` |
| One number that matters | `big_number` |
| A few headline metrics | `kpis` |
| A trend, comparison of sizes, or composition | `chart`, `charts`, `bar_list`, `split_bar` |
| Rows and columns of facts | `table` |
| Entities scored on criteria | `scorecard`, `heatmap` |
| Options or products side by side | `comparison`, `two_column`, `pros_cons` |
| Parallel ideas, reasons, features | `cards` |
| A sequence in time | `timeline`, `roadmap` |
| A sequence of actions | `process`, `steps`, `funnel` |
| Positions on two axes | `matrix` |
| A stack or hierarchy | `layers` |
| A change | `before_after` |
| A voice | `quote` |
| Audience participation | `question`, followed by an answer slide |
| A short list with no better structure | `bullets` (sparingly) |
| Something none of these fit | `custom` |

## Openers, dividers, closers

**cover**: `kicker`, `title` (up to three lines), `subtitle` (one or two lines, about 25 words), `author`, `date`, `note`, `tags` (up to 5 short labels).

**section**: `number` ("1", "Part 2"), `title`, `subtitle`, `kicker`. Defaults to tone `dark`.

**agenda**: `items` (up to 6) of `{"title", "text"}`.

**statement**: `text` (the sentence), `support` (one line under it), `kicker`. Defaults to tone `accent`.

**closing**: `title`, `subtitle`, `contact`, `kicker`. Defaults to tone `dark`.

## Numbers

**big_number**: `value`, `label`, `text`, `side` (up to 4 of `{"value", "label"}`).

**kpis**: `items` (2 to 5) of `{"value", "label", "delta", "note", "icon"}`; `emphasis` (index of the tile to invert). Keep each `value` to about 7 to 9 characters ("7.8M", "97%", "2,443", "92,000 Cr") so all tiles share one number size, and put the period in the label. Never make a figure ambiguous to save space: write "17,132 Cr", not "17.1k" with the unit hidden in the label.

```json
{"layout": "kpis", "title": "Four numbers describe the quarter",
 "items": [{"value": "42.1k", "label": "Active subscribers", "delta": "+9% QoQ", "note": "Net of 3.2k cancellations.", "icon": "users"}],
 "source": "Source: company data, Q3 2026"}
```

## Charts (native, editable)

**chart**: `chart` (spec below), `chart_title` (units and axis, small, above the chart), and optionally a side panel: `insights` (list of strings or `{"title", "text"}`) and/or `callout` `{"value", "label", "text"}`.

**charts**: `charts`, a list of 2 or 3 chart specs, each with its own `title` and `subtitle`.

Chart spec:

| Field | Meaning |
|---|---|
| `type` | `column`, `bar`, `stacked_column`, `stacked_bar`, `stacked100_column`, `stacked100_bar`, `line`, `area`, `stacked_area`, `pie`, `doughnut`, `scatter`, `waterfall` |
| `categories` | List of category labels |
| `series` | List of `{"name", "values"}`; for `scatter`, `{"name", "points": [[x, y], ...]}`; optional `color` |
| `number_format` | Excel format: `"0"`, `"0.0"`, `"#,##0"`, `"0%"`, `"\"$\"#,##0"`, `"0.0\"x\""` |
| `labels` | Data labels on or off (default on; turn off for dense lines) |
| `highlight` | Single-series bars: the category to colour while the rest go grey. Lines: the series name to emphasise |
| `legend` | `"auto"` (default), `true`, `false`, `"right"` |
| `min`, `max` | Value axis bounds |
| `totals` | Waterfall only: indexes or names of the bars that are totals |
| `percent`, `hole` | Pie and doughnut: show percentages (default true); doughnut hole size |

```json
{"layout": "chart", "kicker": "Part 2 · Revenue", "title": "Revenue passed £3.9m in the third quarter",
 "chart_title": "Quarterly revenue, £m",
 "chart": {"type": "column", "categories": ["Q4 2025", "Q1 2026", "Q2 2026", "Q3 2026"],
           "series": [{"name": "Revenue", "values": [2.8, 3.1, 3.5, 3.9]}], "number_format": "0.0", "highlight": "Q3 2026"},
 "insights": [{"title": "Three straight quarters of growth", "text": "Each added £0.3m to £0.4m."}],
 "source": "Source: company accounts"}
```

Waterfall: give the deltas as one series and mark totals: `"values": [59, 2.6, -0.9, 61], "totals": [0, 3]`. A total is the level at that point, not a change; intermediate subtotals are totals too. Steps and totals may go below zero. Set `min` when the deltas are small next to the totals.

Category labels on column, line and waterfall charts should be two or three words; long labels get drawn at an angle. Use a bar chart when labels need to be long.

Chart choice: change over time is a line or column; ranking is a bar or `bar_list`; parts of a whole are a stacked bar, `split_bar`, or a doughnut with five slices or fewer; a bridge between two totals is a waterfall; a relationship is a scatter. One message per chart.

**bar_list** (shapes, not a chart; good for ranked benchmarks): `items` (up to 10) of `{"label", "value", "display", "note"}` (a `note` is a few words shown inside the bar; longer context goes in `insights`), `unit`, `format` (Python format, default `"{:,.0f}"`), `max`, `highlight` (label, index or list), plus optional `insights` / `callout`.

**split_bar**: `bars` (1 to 3) of `{"label", "segments": [{"label", "value", "display"}], "highlight"}`. Put the figure in the segment label ("Rider ₹60").

**heatmap**: `columns`, `rows` of `{"name", "values": [numbers]}`, `format` (default `"{:,.0f}"`), `color`, `reverse` (true when low is good).

**scorecard**: `columns` (criteria), `rows` of `{"name", "scores": [0 to scale, or text], "note"}`, `scale` (default 5), `highlight` (row name or index), `note_title`.

## Tables

**table**: `columns`, `rows` (list of lists), and optional `highlight_row`, `highlight_col` (indexes), `widths` (relative), `align` (`"l"`, `"c"`, `"r"` per column; numbers align right automatically), `zebra`, `header` (`"rule"` or `"fill"`), `size`, `width` (fraction of the slide width).

Keep to 10 rows and 6 columns, and cells to a few words or one figure. A table that shrinks below 11 pt gets a lint warning: split it, or move detail to the notes. Split longer tables across slides.

## Text and comparison

**cards**: `items` (2 to 8) of `{"title", "text", "icon", "stat", "tag", "items": [sub-bullets]}`; `numbered`, `tabs` (coloured tab per card), `emphasis` (index), `columns`.

**comparison**: `columns` (2 to 4) of `{"title", "icon", "tag", "text", "items", "stat", "stat_label", "highlight"}`. Items are strings or `{"title", "text", "icon"}`.

**two_column**: `left` and `right`, each `{"title", "text", "items"}`; `split` (left share, default 0.5); `cards` (true to box each side).

**pros_cons**: `left` and `right`, each `{"title", "items"}`.

**before_after**: `before` and `after`, each `{"label", "title", "text", "items"}`.

**bullets**: `items` (up to 6) of strings or `{"title", "text"}`; optional `aside` `{"value", "title", "text"}`.

**quote**: `quote`, `by`, `role`. Real quotes only.

**question**: `title` (the question), `context`, `options` (2 to 6), `icon`. Defaults to tone `accent`. Follow it with a slide whose headline gives the answer.

**recap**: `items` (up to 5) of strings or `{"title", "text"}`.

**next_steps**: `items` (up to 6) of `{"action", "text", "owner", "when"}`.

**sources**: `items` (strings), `columns`, `numbered`.

## Flows and structures

**timeline**: `items` (up to 7) of `{"date", "title", "text"}`; `highlight`.

**process**: `steps` (3 to 6) of `{"title", "text", "icon"}`; `emphasis`.

**funnel**: `stages` (up to 6) of `{"label", "value", "display", "note"}`; `format`. Conversion notes are computed when `note` is absent.

**matrix**: `x_axis`, `y_axis` (labels), `quadrants` (four of `{"title", "text", "items"}` in order top-left, top-right, bottom-left, bottom-right), `highlight` (index).

**layers**: `layers` (up to 6) of `{"title", "text"}`; `pyramid` (true to taper).

**roadmap**: `periods` (labels), `lanes` of `{"name", "items": [{"label", "start", "end", "milestone"}]}`. `start` and `end` are period positions, zero-based, end exclusive; halves are allowed (1.5).

**steps** (runbooks and walkthroughs): `steps` (up to 6) of `{"title", "text", "code", "owner", "time", "check"}`; `start` (first step number, for continuation slides).

**code**: `code`, `caption`, optional `insights`.

## custom

`elements` is a list placed by position in inches. Add `title` and `kicker` for the standard header.

| type | Fields |
|---|---|
| `text` | `x, y, w`, optional `h`; `text`, `size`, `color`, `bold`, `italic`, `align` (l, c, r), `valign` (t, m, b), `font` (display, body, mono), `caps`, `bullets`, `on` (the fill behind it, for contrast checks) |
| `rect`, `oval`, `chevron`, `pentagon`, `arrow`, `triangle`, `diamond`, `hexagon` | `x, y, w, h`, `fill`, `line`, `line_w`, `radius`, `alpha`, `rotation` |
| `line` | `x, y, x2, y2`, `color`, `line_w`, `dash`, `arrow` |
| `icon` | `name`, `x, y, w`, `color` |
| `icon_badge` | `name`, `x, y, w`, `fill`, `color`, `round` |
| `pill`, `badge` | `x, y`, `text`, `fill`, `color` (`w` for badge) |
| `stat` | `x, y, w`, `value`, `label`, `size` |
| `card` | `x, y, w, h`, `title`, `text`, `items`, `emphasis`, `tab` |
| `chart`, `table` | `x, y, w, h`, and `chart` or `table` spec |

Colours take a hex value or a token: `ink`, `muted`, `surface`, `line`, `bg`, `accent`, `accent2`, `accent3`, `accent4`. Elements draw in list order, so put backgrounds first. Lint checks custom slides for bounds, overflow, overlap and contrast.

## Icons

Icons are native vector shapes. Use them to label, not to decorate. Names:

activity, alarm-clock, archive, arrow-down, arrow-down-right, arrow-left, arrow-right, arrow-up, arrow-up-right, award, badge-check, banknote, battery, bell, bike, book-open, bookmark, bot, box, brain, briefcase, building-2, calculator, calendar, camera, chart-column, chart-line, chart-pie, check, chevron-right, circle-alert, circle-check, circle-dollar-sign, circle-help, circle-x, clipboard-check, clipboard-list, clock, cloud, code, coins, compass, cpu, credit-card, crown, database, dollar-sign, download, eye, factory, file-text, filter, flag, flame, flask-conical, folder, gauge, gem, gift, git-branch, globe, graduation-cap, hammer, hand-coins, handshake, heart, heart-pulse, hourglass, image, inbox, indian-rupee, info, key, landmark, laptop, layers, layout-dashboard, leaf, lightbulb, link, list-checks, lock, mail, map, map-pin, megaphone, message-circle, message-square, mic, monitor, moon, mountain, network, package, palette, pen-line, percent, phone, piggy-bank, play, plug, puzzle, receipt, recycle, refresh-cw, repeat, rocket, route, ruler, scale, search, send, server, settings, shield, shield-check, ship, shopping-bag, shopping-basket, shopping-cart, shuffle, signal, smartphone, smile, sparkles, star, store, sun, table, target, terminal, thumbs-down, thumbs-up, timer, trending-down, trending-up, triangle-alert, trophy, truck, umbrella, user, user-check, users, utensils, wallet, wand-sparkles, wifi, workflow, wrench, x, zap, zoom-in.

Icons are from Lucide (ISC licence).

## Reading lint output

- `ERROR` must be fixed: overflow, off-slide shapes, overlap, very low contrast, dashes, emoji, unknown layouts.
- `WARN` should be fixed: weak or duplicate headlines, stock phrasing, missing sources, over-capacity layouts, repeated layouts.
- `INFO` goes into the handoff: placeholders, missing notes.
- "Text overflows" means the content is too long for its layout. Shorten it, remove an item, or split the slide. Do not reach for `custom` to squeeze it in.

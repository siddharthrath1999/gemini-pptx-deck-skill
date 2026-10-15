# Editing an existing deck

Use this when the user attaches a `.pptx` and asks for changes: rewrite, update figures, redesign some slides, add a section, reorder, or tidy up. The deck keeps its own theme, masters, fonts and formatting. Only what you touch changes.

## Workflow

1. **Inspect.** `python3 <skill folder>/scripts/edit_deck.py inspect deck.pptx` prints an outline and writes `deck.outline.json` with every slide's `id`, layout, title, shapes (with `id` and `name`), text, tables, chart data, notes, and the deck's theme colours and fonts. Read it before planning.
2. **Map the request to slides.** Write down which slide ids and shapes each part of the request touches. When the user names a section ("the market part", "slides 8 to 12"), list the ids in it. Ask only if the request is genuinely ambiguous.
3. **Choose the lightest edit that does the job.**
   - Wording, numbers or notes change: `set_text`, `replace_text`, `set_table_cell`, `set_chart_data`, `set_notes`.
   - A slide is weak (a wall of bullets, a cluttered table): `replace_slide` with a kit layout. The new slide takes the deck's theme colours and fonts.
   - New material: `insert_slides` after the right slide.
   - Structure: `move_slide`, `delete_slides`.
4. **Write `edits.json`** as a list of operations (below), in the order they should run.
5. **Apply.** `python3 <skill folder>/scripts/edit_deck.py apply deck.pptx edits.json -o deck_edited.pptx`. Fix every error, rerun until clean.
6. **Render and look** at the changed slides and their neighbours (same commands as for a new deck). Check new slides sit well beside the original ones.
7. **Deliver** the edited file with a change log: which slides changed and how, anything you could not do, and any figure you could not verify.

Rules: never rebuild the whole deck when the user asked for targeted changes. Keep the user's wording where they did not ask for a rewrite. Keep slide ids from `inspect`; they stay valid while you edit. You can also refer to a slide by its original position with `{"n": 4}`.

## Operations

```json
[
  {"op": "set_text", "slide": 257, "shape": "Title 1", "text": "Riders grew 59% in a year"},
  {"op": "set_text", "slide": 257, "shape": 3, "text": ["First paragraph", "Second paragraph"]},
  {"op": "replace_text", "find": "FY25", "with": "FY26"},
  {"op": "replace_text", "find": "Pune", "with": "Pune (launch city)", "slides": [259]},
  {"op": "set_notes", "slide": 258, "text": "What to say on this slide."},
  {"op": "set_table_cell", "slide": 259, "shape": "Table 2", "row": 2, "col": 1, "text": "2,450"},
  {"op": "set_chart_data", "slide": 258, "shape": "Chart 2", "categories": ["Q1", "Q2", "Q3"], "series": [{"name": "Riders", "values": [9.4, 11.2, 12.9]}]},
  {"op": "delete_shape", "slide": 258, "shape": "TextBox 7"},
  {"op": "replace_slide", "slide": 257, "with": {"layout": "cards", "title": "...", "items": []}},
  {"op": "insert_slides", "after": 259, "slides": [{"layout": "next_steps", "title": "...", "items": []}]},
  {"op": "move_slide", "slide": 259, "after": 256},
  {"op": "delete_slides", "slides": [262, 263]}
]
```

| Op | What it does |
|---|---|
| `set_text` | Replaces a shape's text. Keeps the font, size, colour and bullet style of the first run and paragraph. `text` is a string (`\n` for new paragraphs) or a list of paragraphs. |
| `replace_text` | Finds and replaces across the deck, or only in `slides`. Text split across differently formatted runs is not matched; use `set_text` for those. |
| `set_notes` | Replaces the speaker notes. |
| `set_table_cell` | Sets one cell, keeping its formatting. Rows and columns count from 0, header included. |
| `set_chart_data` | Replaces a native chart's categories and series. The chart keeps its type and styling. |
| `delete_shape` | Removes one shape. |
| `replace_slide` | Builds a new slide from a kit layout spec (see `layout-catalog.md`) in the deck's theme, puts it where the old one was, and deletes the old one. |
| `insert_slides` | Builds kit slides and places them after slide `after` (`0` for the start). Add `"theme": {...}` tokens to override the matched theme. |
| `move_slide` | Moves a slide after another (`0` for the start). |
| `delete_slides` | Deletes slides. |

`shape` is the shape `id` or `name` from the outline.

## Limits

- `replace_slide` and `insert_slides` need a 16:9 deck. On 4:3 or other sizes, edit text, tables, charts and notes instead, and say so.
- New slides match the deck's theme colours and fonts. On light slides the deck's own master background, logo and brand graphics show through, and content keeps clear of them; dark and accent slides use a solid colour. Check new slides beside the originals in the render.
- Pictures can be deleted but not replaced. SmartArt and embedded objects are read-only.
- Fonts in an uploaded deck may not be installed where you render; measured sizes are then estimates. Check the render.

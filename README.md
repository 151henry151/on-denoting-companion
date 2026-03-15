# On Denoting: An Interactive Companion to Russell's 1905 Paper

A single-page web application that accompanies Bertrand Russell’s 1905 paper “On Denoting.” It includes the full text of the paper and an interactive companion with:

- **Expansion Engine** — Russell’s logical expansions of denoting phrases (a/some/every/all/no/the) with step-by-step mode
- **Theory Comparator** — Compare Russell, Frege, and Meinong on the same propositions
- **Primary vs Secondary Occurrence** — Scope and truth-value for the King of France and George IV / Waverley cases
- **Three Puzzles** — George IV & identity, excluded middle, and the difference puzzle with Russell’s solutions
- **Acquaintance & Description** — Drag-and-drop illustration of knowledge by acquaintance vs description

## Tech

- Vanilla HTML, CSS, and JavaScript (single-page companion plus separate `companion.js`)
- Google Fonts (Libre Baskerville, Source Sans 3)
- No build step; can be served as static files

## Usage

Serve the files from any static host. The main entry is `index.html`, which shows the paper on the left and the interactive companion on the right. For the companion only, open `companion.html`.

## Citation

Russell, B. (1905). “On Denoting.” *Mind*, 14(56), 479–493.

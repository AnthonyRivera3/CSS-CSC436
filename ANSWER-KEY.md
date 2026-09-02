# Answer key — Exercises

Instructor reference for the ten labs in [`exercises.html`](exercises.html).

Every solution below is copied verbatim from the `data-lab-solution` template
in the page itself, so this file and the labs cannot drift apart. Each lab's
answer is also revealable by students via **Reveal one working answer** —
nothing here is secret. The value of this sheet is the commentary: what each
check is really testing, and what to say when someone gets it wrong.

---

## At a glance

| # | Lab | Module | Concept | Blanks | Checks |
| --- | --- | --- | --- | --- | --- |
| 01 | [Build the calling card](#lab-01--build-the-calling-card) | Module 1 | Box model | 5 | 7 |
| 02 | [Highlight the current page](#lab-02--highlight-the-current-page) | Module 1 | Selectors | 2 | 3 |
| 03 | [One token, two variants](#lab-03--one-token-two-variants) | Module 1 | Tokens | 3 | 4 |
| 04 | [Fluid heading, readable paragraph](#lab-04--fluid-heading-readable-paragraph) | Module 1 | Typography | 5 | 5 |
| 05 | [The bridge toolbar](#lab-05--the-bridge-toolbar) | Module 2 | Flexbox | 5 | 5 |
| 06 | [A gallery with no media queries](#lab-06--a-gallery-with-no-media-queries) | Module 2 | Grid | 3 | 4 |
| 07 | [The console shell](#lab-07--the-console-shell) | Module 2 | Grid areas | 4 | 5 |
| 08 | [Pin the badge](#lab-08--pin-the-badge) | Module 2 | Position | 2 | 4 |
| 09 | [Style a parent by what's inside it](#lab-09--style-a-parent-by-whats-inside-it) | Module 3 | :has() | 1 | 3 |
| 10 | [Motion that stays cheap](#lab-10--motion-that-stays-cheap) | Module 3 | Motion | 4 | 5 |

**45 checks total.** All ten solutions pass every check; every starter fails
every check, with one deliberate exception noted in Lab 09.

> **A check grades the result, not the technique.** A student can pass a lab
> with a clumsy answer that happens to compute to the right value. The brief
> states the approach being practised — that is the thing to mark by eye.

---

## Lab 01 — Build the calling card

`01-box-model` · Module 1 · Box model · 5 blanks · 7 checks

**What it's actually testing.** Whether they understand that `width` measures a *different box* depending on `box-sizing`. Everything else in the lab is scaffolding around that one idea.

**Solution**

```css
.card {
  background: #151515;
  color: #f5f5f5;
  box-sizing: border-box;
  width: 260px;
  padding: 24px;
  border: 2px solid #e60012;
  border-radius: 12px;
}
.card h2 { margin: 0 0 8px; font-size: 1.25rem; }
.card p  { margin: 0; color: #9a9a9a; }
```

**What the checks read**

- box-sizing is border-box → `.card` — `box-sizing` is `border-box`
- The card is 260px wide → `.card` — `width` is `260px`
- 24px of padding on every side → `.card` — `padding-top` is `24px`
- …including the left side → `.card` — `padding-left` is `24px`
- A 2px border → `.card` — `border-top-width` is `2px`
- …in #e60012 → `.card` — `border-top-color` is `#e60012`
- 12px rounded corners → `.card` — `border-top-left-radius` is `12px`

**Common wrong answers**

- **Sets `width: 260px` but forgets `box-sizing`.** The width check still **passes** — computed `width` reports the content box, which really is 260px. Only the `box-sizing` check fails. Have them select the card in DevTools and read the box model diagram: the element is 308px on screen. This is the whole lesson in one screenshot.
- **Writes `border: 2px #e60012` without `solid`.** `border-width` computes to `0px` and the border vanishes. Border **style** is what switches a border on; width and colour do nothing without it.
- **Puts `box-sizing` only on `.card`.** Passes, and is fine here. Mention that the universal `*, *::before, *::after` reset is the habit, and show them the version in `base.css`.

> **Say this:** `width` is a promise about *some* box. `box-sizing` decides which one.

---

## Lab 02 — Highlight the current page

`02-selectors` · Module 1 · Selectors · 2 blanks · 3 checks

**What it's actually testing.** Styling from state that already exists in the markup, and winning on specificity instead of force.

**Solution**

```css
.nav {
  display: flex;
  gap: 14px;
}
.nav a {
  text-decoration: none;
  color: #8a8f98;
}
.nav a[aria-current="page"] {
  color: #e60012;
  font-weight: 700;
}
```

**What the checks read**

- Ordinary links are #8a8f98 → `.nav a:not([aria-current])` — `color` is `#8a8f98`
- The current link is #e60012 → `.nav a[aria-current='page']` — `color` is `#e60012`
- The current link is bold → `.nav a[aria-current='page']` — `font-weight` is `700`

**Common wrong answers**

- **Invents a class like `.current` or `.active`.** There is no such class in the HTML, so nothing matches. Point out that `aria-current` is already there, already correct, and already read by screen readers — a second source of truth can only drift.
- **Writes `a[aria-current]` with no value.** Passes. Acceptable, but note that `aria-current` also takes `step`, `page`, `location`, `true` — matching the value is more precise.
- **Reaches for `!important`.** Ask them to compute the two specificities instead: `.nav a` is 0,1,1 and `.nav a[aria-current="page"]` is 0,2,1. The attribute selector already wins, in any source order.

> **Say this:** If the state is already in your HTML, style *that*. Don't add a class that means the same thing.

---

## Lab 03 — One token, two variants

`03-custom-properties` · Module 1 · Tokens · 3 blanks · 4 checks

**What it's actually testing.** That custom properties **inherit** and can be re-declared on a narrower scope — the mechanism the whole theme system runs on.

**Solution**

```css
:root {
  --chip-bg: #e60012;
}
.chip {
  padding: 6px 14px;
  border-radius: 999px;
  color: #fff;
  font-size: 14px;
  background-color: var(--chip-bg);
}
.chip--gold {
  --chip-bg: #a67c22;
}
```

**What the checks read**

- --chip-bg is declared on :root → `:root` — `--chip-bg` contains `#e60012`
- Chips use it as their background → `.chip` — `background-color` is `#e60012`
- The gold variant re-declares the token → `.chip--gold` — `--chip-bg` contains `#a67c22`
- …so its background is gold → `.chip--gold` — `background-color` is `#a67c22`

**Common wrong answers**

- **Sets `background-color: #a67c22` on `.chip--gold`.** The page looks **identical** and the `--chip-bg` check fails. This is the most valuable failure in the set: the visual result is not the thing being graded. Ask what happens when a border and a shadow also need to be gold.
- **Declares `--chip-bg` on `.chip` instead of `:root`.** The chips render correctly but the `:root` check fails. Good moment to explain that where you declare a token decides who can see it.
- **Writes `background-color: --chip-bg`.** Missing `var()`. Invalid, silently dropped — a very common typo. Show it greyed out in DevTools.

> **Say this:** `var()` resolves where it's *used*, not where it's written. That's why one rule can produce two results.

---

## Lab 04 — Fluid heading, readable paragraph

`04-typography` · Module 1 · Typography · 5 blanks · 5 checks

**What it's actually testing.** Fluid sizing without breakpoints, and a reading measure.

**Solution**

```css
h1 {
  margin: 0 0 12px;
  line-height: 1.05;
  font-size: clamp(2.5rem, 1.5rem + 3vw, 3.5rem);
  text-transform: uppercase;
  text-wrap: balance;
}
p {
  color: #444;
  max-width: 60ch;
  line-height: 1.6;
}
```

**What the checks read**

- The heading is uppercase → `h1` — `text-transform` is `uppercase`
- The heading font-size lands in the clamp range → `h1` — `font-size` is between 40 and 58
- The heading balances its line breaks → `h1` — `text-wrap` contains `balance`
- The paragraph has a reading measure → `p` — `max-width` is between 300 and 800
- Body line-height is around 1.6 → `p` — `line-height` is between 25 and 27

**Common wrong answers**

- **Writes `clamp(2.5rem, 3vw, 3.5rem)` — pure `vw` in the middle.** Passes the check, but is an accessibility bug: a viewport unit ignores the reader's browser font size, so the heading won't grow when they zoom text. The `1.5rem + 3vw` idiom keeps a `rem` component so it still responds. Worth 60 seconds.
- **Uses `width: 60ch` instead of `max-width`.** Passes the numeric range but breaks below 60ch — the paragraph can no longer shrink. Catch this by eye, or by narrowing the pane.
- **Thinks `text-wrap: balance` did nothing.** It only visibly changes multi-line headings. Have them narrow the preview until the heading wraps to three lines, then toggle it in DevTools.

> **Say this:** Fluid type means no breakpoints. But never build one out of `vw` alone.

---

## Lab 05 — The bridge toolbar

`05-flexbox` · Module 2 · Flexbox · 5 blanks · 5 checks

**What it's actually testing.** That an auto margin absorbs free space, which is a different tool from distributing it.

**Solution**

```css
.bar {
  padding: 10px 14px;
  background: #0b1020;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.logo { color: #4cc9f0; letter-spacing: .12em; font-size: 13px; }
.bar a { color: #7d90ab; text-decoration: none; font-size: 14px; }
.cta {
  font: inherit;
  padding: 6px 14px;
  border: 0;
  border-radius: 4px;
  background: #4cc9f0;
  cursor: pointer;
  margin-inline-start: auto;
}
```

**What the checks read**

- The bar is a flex container → `.bar` — `display` is `flex`
- Items are centred on the cross axis → `.bar` — `align-items` is `center`
- 12px gap between items → `.bar` — `column-gap` is `12px`
- Items are allowed to wrap → `.bar` — `flex-wrap` is `wrap`
- An auto margin pushes the button to the end → `.cta` — `margin-left` is at least 1

**Common wrong answers**

- **Uses `justify-content: space-between`.** Looks close with four items, and the check fails. Best demo in the lab: add a fifth item live. `space-between` spreads *everything*; the auto margin moves *one* item and leaves the rest packed.
- **Writes `margin-left: auto` rather than `margin-inline-start: auto`.** Both pass — the check reads the computed physical property. Mention the logical version flips correctly in right-to-left languages.
- **Puts the auto margin on the last link instead of `.cta`.** The button still ends up on the right, but the gap lands in the wrong place. Look at the rendered result, not just the score.

> **Say this:** `margin: auto` eats all the free space on that side. One item moves; nothing else changes.

---

## Lab 06 — A gallery with no media queries

`06-grid-autofit` · Module 2 · Grid · 3 blanks · 4 checks

**What it's actually testing.** `auto-fit` + `minmax()`, and the `min()` guard that stops the track overflowing.

**Solution**

```css
.gallery {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(min(140px, 100%), 1fr));
}
.tile {
  display: grid;
  place-items: center;
  min-height: 70px;
  background: #111a2e;
  color: #4cc9f0;
  border: 1px solid #1d2b44;
  border-radius: 6px;
  font-family: monospace;
}
```

**What the checks read**

- The gallery is a grid → `.gallery` — `display` is `grid`
- 16px gap between tiles → `.gallery` — `column-gap` is `16px`
- …in both directions → `.gallery` — `row-gap` is `16px`
- Tiles share the row instead of stacking one per line → `.tile` — `width` is between 90 and 230

**Common wrong answers**

- **Uses `auto-fill` instead of `auto-fit`.** Often passes with six tiles. Delete four of them live: `auto-fill` keeps the empty tracks and the two survivors stay narrow; `auto-fit` collapses them so the tiles stretch. That is the entire difference and it is invisible until the grid is under-filled.
- **Writes `minmax(140px, 1fr)` without `min()`.** Passes every check, and overflows below a 140px viewport. The check can't see it — the mobile test can. Narrow the preview to 320px and show the horizontal scrollbar.
- **Sets a fixed column count like `repeat(3, 1fr)`.** Passes the tile-width check at desktop size. Resize the window: it never reflows. The point of the lab is the *absence* of a media query.

> **Say this:** `auto-fit` + `minmax(min(X, 100%), 1fr)` is the responsive grid. Learn it as one phrase.

---

## Lab 07 — The console shell

`07-grid-areas` · Module 2 · Grid areas · 4 blanks · 5 checks

**What it's actually testing.** Named areas, and the fact that an invalid `grid-template-areas` fails **silently**.

**Solution**

```css
.shell {
  display: grid;
  grid-template-columns: 120px 1fr;
  grid-template-areas:
    "nav header"
    "nav main"
    "nav footer";
  gap: 8px;
}
.sidebar { grid-area: nav; }
.head    { grid-area: header; }
.main    { grid-area: main; }
.foot    { grid-area: footer; }

.shell > * {
  display: grid;
  place-items: center;
  padding: 12px;
  background: #111a2e;
  color: #4cc9f0;
  border: 1px solid #1d2b44;
  border-radius: 6px;
  font-family: monospace;
  font-size: 13px;
}
.main { min-height: 90px; }
```

**What the checks read**

- The shell is a grid → `.shell` — `display` is `grid`
- Named areas are defined → `.shell` — `grid-template-areas` contains `nav`
- The sidebar is placed in the nav area → `.sidebar` — `grid-column-start` contains `nav`
- The first column is 120px wide → `.shell` — `grid-template-columns` contains `120px`
- Main is placed in the main area → `.main` — `grid-column-start` contains `main`

**Common wrong answers**

- **Rows with different column counts.** The entire declaration is invalid and is dropped — the layout degrades to a plain two-column grid with no error anywhere. This is the single most confusing failure mode in grid. Teach them to check the **Grid** badge in DevTools, which lists the parsed area names.
- **Forgets the quotes, or quotes the whole block once.** Each *row* is its own quoted string. `"nav header"` then `"nav main"`, not `"nav header nav main"`.
- **Writes `grid-area: "nav"` with quotes.** Area names are identifiers, not strings. Quotes only appear in the template, never in `grid-area`.
- **Confused that the class is `.head` but the area is `header`.** Deliberate. Area names are invented by you and have nothing to do with class names.

> **Say this:** If a named-area layout silently isn't working, count the columns in every row string.

---

## Lab 08 — Pin the badge

`08-positioning` · Module 2 · Position · 2 blanks · 4 checks

**What it's actually testing.** Positioning context. The badge is the excuse.

**Solution**

```css
.product {
  padding: 18px;
  background: #0b1020;
  border: 1px solid #1d2b44;
  border-radius: 8px;
  color: #dbe7f5;
  position: relative;
}
.badge {
  background: #ffb703;
  color: #05070d;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 999px;
  position: absolute;
  inset-block-start: 8px;
  inset-inline-end: 8px;
}
.product h3 { margin: 0 0 6px; font-size: 1rem; }
.product p  { margin: 0; font-size: 14px; color: #7d90ab; }
```

**What the checks read**

- The card is a positioning context → `.product` — `position` is `relative`
- The badge is out of normal flow → `.badge` — `position` is `absolute`
- 8px from the top → `.badge` — `top` is `8px`
- 8px from the right → `.badge` — `right` is `8px`

**Common wrong answers**

- **Forgets `position: relative` on `.product`.** The badge flies to the top-right of the *page*. The most instructive failure in the whole set — have them do it on purpose, then add the one line and watch it snap back. That is what "nearest positioned ancestor" means, made visible.
- **Uses `inset-block-start` / `inset-inline-end`.** Both pass; the computed values are physical. This is the modern form and worth praising.
- **Reaches for `float: right`.** Floats stay in flow and will push the heading around. Good contrast with `absolute`, which leaves flow entirely.

> **Say this:** `absolute` positions against the nearest *positioned* ancestor. If you didn't position one, that's the page.

---

## Lab 09 — Style a parent by what's inside it

`09-has` · Module 3 · :has() · 1 blanks · 3 checks

**What it's actually testing.** Selecting a parent by what it contains — the thing CSS could not do until recently.

**Solution**

```css
.log { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
.entry {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-left: 4px solid transparent;
  border-radius: 4px;
  font-family: Georgia, serif;
}
.entry p { margin: 0; }
.tag {
  font-family: monospace;
  font-size: 11px;
  background: #a67c22;
  color: #fff;
  padding: 2px 8px;
  border-radius: 999px;
}
.entry:has(.tag) {
  background: #f3e6c8;
  border-left-color: #a67c22;
}
```

**What the checks read**

- A tagged entry gets the parchment background → `.entry:has(.tag)` — `background-color` is `#f3e6c8`
- …and a gold left border → `.entry:has(.tag)` — `border-left-color` is `#a67c22`
- Untagged entries are left alone → `.entry:not(:has(.tag))` — `background-color` is `transparent`

**Common wrong answers**

- **Writes `.entry .tag { ... }`.** The universal first attempt: it styles the tag, not the row. Ask which element needs the background, then which selector actually selects it.
- **Styles `.entry` directly.** Every row lights up. The third check — *untagged entries are left alone* — exists exactly to catch this. **Note:** that check passes on the starter code by design; it is a guard against over-applying, not a goal to reach.
- **Uses `.entry:has(> .tag)`.** Also correct, and stricter — direct children only. Worth showing as a refinement.

> **Say this:** `:has()` is the only selector that looks up the tree. Also: notice the starter already reserves a 4px transparent border, so adding the colour doesn't shift the layout. Steal that trick.

---

## Lab 10 — Motion that stays cheap

`10-motion` · Module 3 · Motion · 4 blanks · 5 checks

**What it's actually testing.** Naming transitioned properties, and animating only the two cheap ones.

**Solution**

```css
.rune {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 20px;
  background: #f7efdd;
  border: 2px solid #a67c22;
  border-radius: 6px;
  font-family: Georgia, serif;
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.rune:hover {
  transform: translateY(-6px);
}
.glow {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #8a1c1c;
  animation: pulse 1.2s ease-in-out infinite alternate;
}
@keyframes pulse {
  from { opacity: 1; }
  to   { opacity: 0.25; }
}
```

**What the checks read**

- Only transform and opacity transition → `.rune` — `transition-property` is `transform, opacity`
- The transition lasts 0.3s → `.rune` — `transition-duration` is between 0.29 and 0.31
- An animation named pulse runs on .glow → `.glow` — `animation-name` is `pulse`
- The animation actually has a duration → `.glow` — `animation-duration` is at least 0.1
- It repeats → `.glow` — `animation-iteration-count` is `infinite`

**Common wrong answers**

- **Writes `transition: all`.** Fails by design. `all` animates properties you never intended, including ones a teammate adds later, and is a classic cause of elements sliding around on page load.
- **Writes the properties in the other order.** Accepted — the check takes either order.
- **Uses `300ms` instead of `0.3s`.** Identical. Both compute to `0.3s`.
- **Never writes the `@keyframes pulse` block.** ⚠️ **The checks cannot catch this.** `animation-name` computes to `pulse` whether or not the keyframes exist. Check by eye that the dot actually pulses — this is the one place in the set where the score can lie to you.

> **Say this:** `transform` and `opacity` are composited. Everything else costs you a layout or a paint on every frame.

---

## If a lab misbehaves

| Symptom | Cause |
| --- | --- |
| Checklist never updates | JavaScript blocked, or a syntax error in the student's CSS. An unclosed `{` swallows every rule after it. |
| Score says passing, result looks wrong | Expected. Checks read computed styles; mark the approach by eye. |
| Student lost their work | It is in `localStorage` under `css-course:lab:<id>`, per browser. **Reset** wipes that lab — there is a confirm prompt. |
| A check looks unfair | Every check option is documented at the bottom of `exercises.html`. Edit the JSON block in place; nothing else needs rewiring. |

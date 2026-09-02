# CSS Fundamentals — Student Walk-Alongs

A hands-on CSS course you build alongside the instructor. Three lessons, three
video-game-inspired themes, a live code-review page, and ten self-checking
exercises.

**No build step. No `npm install`. No dependencies.** Clone it, open
`index.html`, and everything works.

---

## Table of contents

1. [What's in here](#whats-in-here)
2. [Getting the repo](#getting-the-repo)
3. [Running it](#running-it)
4. [How the CSS is organised](#how-the-css-is-organised)
5. [The three themes](#the-three-themes)
6. [The Code Review page](#the-code-review-page)
7. [The Exercises page](#the-exercises-page)
8. [Working during class — the git loop](#working-during-class--the-git-loop)
9. [Handing work in](#handing-work-in)
10. [Troubleshooting](#troubleshooting)
11. [Notes on the themes and licensing](#notes-on-the-themes-and-licensing)

---

## What's in here

| File | What it is |
| --- | --- |
| `index.html` | Course home: modules, syllabus, house rules |
| `lesson-1-persona.html` | **Module 1 · Foundations** — selectors, cascade, box model, colour, type, custom properties |
| `lesson-2-starwars.html` | **Module 2 · Layout** — flexbox, grid, positioning, responsive, container queries |
| `lesson-3-baldursgate.html` | **Module 3 · Modern CSS** — nesting, `:has()`, `@layer`, `color-mix()`, motion |
| `code-review.html` | Five case studies rendered **before and after**, with a real line diff |
| `exercises.html` | Ten fill-in-the-blank labs that check your work automatically |
| `resources.html` | Where to get fonts, premade CSS, practice sites, references, tools |
| `assets/css/base.css` | The reset, the design tokens, and every shared component |
| `assets/css/theme-*.css` | One file per theme. Almost entirely custom-property re-declarations |
| `assets/css/lab.css` | Styles for the two interactive widgets |
| `assets/js/sandbox.js` | Builds the sandboxed `<iframe>` previews and runs the checks |
| `assets/js/compare.js` | The before/after viewer and the LCS line diff |
| `assets/js/exercises.js` | The lab editor, live preview, and grading |

```
css-fundamentals/
├── index.html
├── lesson-1-persona.html
├── lesson-2-starwars.html
├── lesson-3-baldursgate.html
├── code-review.html
├── exercises.html
├── resources.html
├── README.md
└── assets/
    ├── css/
    │   ├── base.css
    │   ├── lab.css
    │   ├── theme-persona.css
    │   ├── theme-starwars.css
    │   └── theme-baldursgate.css
    └── js/
        ├── sandbox.js
        ├── compare.js
        └── exercises.js
```

---

## Getting the repo

### Step 0 — do you have git?

Open a terminal (**Terminal** on macOS, **PowerShell** or **Git Bash** on
Windows) and run:

```bash
git --version
```

If you get a version number, you're set. If you get "command not found",
install it:

- **Windows** — download from <https://git-scm.com/download/win>. Accept every
  default; it installs Git Bash too, which is the terminal to use for this
  course.
- **macOS** — run `xcode-select --install`, or install [Homebrew](https://brew.sh)
  and run `brew install git`.
- **Linux** — `sudo apt install git` (Debian/Ubuntu) or your distro's equivalent.

Then tell git who you are. This is stamped on every commit you make, forever:

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

### Step 1 — clone it

Go to the folder where you keep your projects, then:

```bash
git clone https://github.com/<your-org>/css-fundamentals.git
```

> Replace `<your-org>/css-fundamentals` with the URL from the green
> **Code** button on the repository page. Choose **HTTPS** unless you have
> already set up SSH keys.

That creates a `css-fundamentals` folder containing everything. Move into it:

```bash
cd css-fundamentals
```

### Step 2 — check it worked

```bash
ls          # macOS / Linux / Git Bash
dir         # Windows PowerShell
```

You should see `index.html`, `assets`, and the lesson pages.

### Alternative: no terminal at all

You can also download the repo as a ZIP from the **Code** button on GitHub and
unzip it. It works — but you get no version history, no way to pull updates
when I push a fix, and no way to hand work in. Use `git clone` if you possibly
can.

---

## Running it

### The quick way

Double-click `index.html`. It opens in your browser and everything works,
including the exercises.

Or from the terminal:

```bash
open index.html      # macOS
start index.html     # Windows
xdg-open index.html  # Linux
```

### The way you should actually work — Live Server

1. Open the folder in **VS Code** (`File → Open Folder…`, or run `code .`).
2. Install the **Live Server** extension by Ritwick Dey.
3. Right-click `index.html` → **Open with Live Server**.

Now the page reloads the instant you save. Over an hour of class this saves a
genuinely surprising amount of time.

### Or any static server you like

```bash
python3 -m http.server 8000     # then visit http://localhost:8000
npx serve                       # if you have Node installed
php -S localhost:8000           # if you have PHP
```

> **Why a server is better than `file://`:** the pages work either way, but a
> real server matches how the site behaves when deployed, and avoids the
> file-protocol quirks you'll hit the moment you add `fetch()` or ES modules to
> a project.

---

## How the CSS is organised

Every page loads exactly two stylesheets, in this order:

```html
<link rel="stylesheet" href="assets/css/base.css">
<link rel="stylesheet" href="assets/css/theme-persona.css">
```

- **`base.css`** owns the reset, the **design tokens**, and every component
  (`.card`, `.btn`, `.nav`, `.tag`, `.note`, `pre.code`, `table.data`…). No
  colour or font is hardcoded in a component — they all read a token.
- **`theme-*.css`** re-declares those tokens on `:root`, plus a handful of
  signature flourishes unique to that theme.

```css
/* base.css defines the contract */
:root  { --accent: #6ea8fe; --radius: 10px; }
.btn   { background-color: var(--accent); border-radius: var(--radius); }

/* theme-persona.css changes the values, and nothing else */
:root  { --accent: #e60012; --radius: 2px; }
```

That's the whole system. Swap the second `<link>` and the page becomes a
different site without touching a single component rule. This is the habit the
course is really teaching.

### The token vocabulary

| Group | Tokens |
| --- | --- |
| Colour | `--bg` `--bg-2` `--surface` `--surface-2` `--border` `--text` `--text-dim` `--accent` `--accent-2` `--ok` `--warn` `--err` |
| Type | `--font-display` `--font-body` `--font-mono` `--display-weight` `--display-transform` `--display-spacing` |
| Scale | `--step--1` … `--step-5` (fluid, built with `clamp()`) |
| Space | `--space-3xs` … `--space-2xl` |
| Shape | `--radius` `--radius-lg` `--border-w` `--shadow` `--ring` |
| Motion | `--ease` `--dur` |
| Layout | `--measure` `--page-max` |

---

## The three themes

Each theme is an **original CSS homage** — an interpretation of a visual
language, built from scratch with gradients, borders, `clip-path` and
transforms.

| Theme | Inspired by | The CSS techniques it exists to teach |
| --- | --- | --- |
| **Phantom** (`theme-persona.css`) | Persona 5 | `clip-path` polygons, `skew()`, `mask-image` zig-zags, layered `text-shadow`, hard offset shadows, halftone via `radial-gradient` |
| **Outer Rim** (`theme-starwars.css`) | Star Wars | Starfields from stacked `radial-gradient`s, CRT scanlines with `repeating-linear-gradient` + `mix-blend-mode`, corner brackets from four gradients, a `perspective` + `rotateX` crawl |
| **Faerûn** (`theme-baldursgate.css`) | Baldur's Gate 3 | `::first-letter` drop caps, ornate rules from `::before`/`::after`, `conic-gradient` + `clip-path` dice, parchment grain from repeating gradients, and a **light** palette to prove the components survive inversion |

---

## The Code Review page

`code-review.html` is where we spend the most class time. Each case study
renders the **same markup twice** — once with the CSS as it's usually first
written, once after review — plus a real line-by-line diff.

Three views, via the buttons in each case's header:

- **Before** — that version alone, with its full stylesheet.
- **Diff** — both versions side by side, with `+`/`−` changes between the two
  stylesheets and unchanged runs folded away.
- **After** — the reviewed version alone.

### Adding your own case study

Copy any `<article class="compare">` block and change the three templates.
Nothing else needs wiring — the previews and the diff generate themselves.

```html
<article class="compare" data-compare="diff">
  <header class="compare__head">…title, blurb, Before/Diff/After buttons…</header>

  <template data-html>       <!-- markup, shared by both versions -->
    <div class="thing">Hello</div>
  </template>

  <template data-css-before> /* the first draft */
    .thing { float: left; }
  </template>

  <template data-css-after>  /* after review */
    .thing { display: grid; }
  </template>

  <div class="compare__stage" data-stage></div>  <!-- previews land here -->
  <div class="compare__code"  data-code></div>   <!-- the diff lands here -->
</article>
```

---

## The Exercises page

`exercises.html` has ten labs. Each gives you fixed HTML and a stylesheet with
the interesting parts missing. Type CSS, watch the preview update, then press
**Check my work** — the page reads the *computed styles* of the result and
tells you which requirements you met and what the actual value was.

- Work is saved in your browser (`localStorage`, key `css-course:lab:*`) as you
  type. It never leaves your machine.
- **Tab** indents inside the editor. **Escape** then **Tab** moves to the next
  control.
- **Reset** wipes that lab back to the starter. There's a confirm prompt.

### Writing a new lab

```html
<div class="lab" data-lab="11-my-lab">
  <div class="lab__head">…title and brief…</div>

  <template data-lab-html>      <!-- the fixed markup -->
    <div class="thing">Hello</div>
  </template>

  <template data-lab-start>     /* what the student begins with */
    .thing { /* TODO: make it red */ }
  </template>

  <template data-lab-solution>  /* revealed on request */
    .thing { color: red; }
  </template>

  <script type="application/json" data-lab-checks>
    [{ "label": "It is red", "selector": ".thing", "prop": "color", "equals": "red" }]
  </script>

  <div data-lab-mount></div>
</div>
```

Check options: `label` (required), `selector`, `prop`, `pseudo`, `equals`
(value or array), `notEquals`, `contains`, `min`/`max` (numeric range), `count`,
`exists`. Expected values are normalised through the browser, so `"#e60012"`,
`"rgb(230 0 18)"` and `"rgb(230, 0, 18)"` all match the same computed colour.

> Computed styles grade the **result**, not the technique. A lab can pass with
> a clumsy solution — the brief says which approach we're practising, and
> that's the one to use.

---

## Working during class — the git loop

Work on a branch of your own so your experiments never collide with mine.

```bash
# once, at the start of the course
git checkout -b my-name/walkalong
```

Then, at the end of every session:

```bash
git status                       # what did I change?
git diff                         # ...and what exactly changed in it?
git add .                        # stage everything
git commit -m "Session 3: flexbox toolbar"
git push -u origin my-name/walkalong   # first push on this branch
git push                                # every push after that
```

Pull my updates before each class:

```bash
git checkout main
git pull
git checkout my-name/walkalong
git merge main                   # bring my changes into your branch
```

### Commit messages

Say what changed and why, in the imperative:

```
Good:  Replace float grid with auto-fit grid in card deck
Good:  Fix badge overflow on narrow viewports
Bad:   update
Bad:   asdfgh
Bad:   fixed stuff
```

---

## Handing work in

1. Push your branch: `git push -u origin my-name/walkalong`
2. On GitHub, open a **Pull Request** into `main`.
3. In the description, list which labs you completed and anything you got
   stuck on. Being specific about what confused you is worth marks.
4. I review it as a pull request and leave comments inline — the same way it
   works on a real team.

Found a dead link or a typo in the course material? Same process. A merged
fix counts toward participation.

---

## Troubleshooting

| Symptom | Cause | Fix |
| --- | --- | --- |
| Page has no styling at all | Wrong path in the `<link>` | It's `assets/css/base.css`, relative to the HTML file. Check DevTools → Network for a 404 |
| Fonts look like Times New Roman | Offline, or the Google Fonts `<link>` is missing | Fine offline — the fallback stack takes over. Check the `<link>` is above your own stylesheet |
| Exercise previews are blank | JavaScript blocked | Check the DevTools Console. The labs need JS; the lesson pages don't |
| "Check my work" never responds | A syntax error in your CSS | An unclosed `{` swallows every rule after it. Look for the first rule that stopped applying |
| My change doesn't show up | Cached file, or a losing rule | Hard-reload (`Ctrl/⌘ + Shift + R`). Then check DevTools → Styles for a struck-through declaration |
| `git clone` asks for a password | GitHub dropped password auth | Use a [personal access token](https://github.com/settings/tokens) as the password, or set up SSH keys |
| `fatal: not a git repository` | You're in the wrong folder | `cd` into the cloned folder first |
| Merge conflict on `git merge main` | We both edited the same lines | Open the file, keep the right version, delete the `<<<<<<<` markers, then `git add` and `git commit` |

---

## Notes on the themes and licensing

The three themes are **original CSS interpretations** of visual styles, created
for teaching. No game assets, logos, screenshots, official fonts, or
trademarked material are included or redistributed. Every shape on these pages
is drawn by a gradient, a border, a `clip-path`, or a transform — which is
precisely why they make good teaching material.

Persona 5, Star Wars, and Baldur's Gate 3 are the property of their respective
owners. Nothing here is affiliated with or endorsed by them.

Webfonts are loaded from Google Fonts under the SIL Open Font License. If you
swap in a different font, check its licence before shipping — see the
[Resources page](resources.html#fonts) for what the common licence terms
actually mean.

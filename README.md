# A p5.js Textbook

A self-contained, seven-chapter HTML textbook for teaching creative coding with **p5.js** to high-school students. Heavily inspired by Dan Shiffman's [Coding Train](https://thecodingtrain.com/) and his book *Code! Programming with p5.js*, with embedded Coding Train videos throughout.

Built by a high-school Director of Instructional Technology / AP CSA teacher, intended for classroom use and hosted on GitHub Pages.

---

## Chapters

1. **Getting Started** — canvas, shapes, color, coordinates, `setup()` / `draw()`
2. **Variables** — `mouseX/Y`, `let`, animation, `random()`, `map()`
3. **Conditionals** — `if` / `else`, bouncing ball, booleans, logical operators
4. **Loops** — `while`, `for`, nested loops, grids
5. **Functions** — parameters, return values, scope
6. **Objects** — ES6 classes (`constructor`, methods, `this`)
7. **Arrays** — arrays of objects, mouse interaction, `splice()` with backward loops

Each chapter is a single, self-contained HTML file with all CSS inlined. No build step is required to view it — just open the file in a browser, or host the folder on any static web host.

---

## Quick Start (local viewing)

```bash
# unzip the textbook, then
cd p5js-textbook
open index.html        # macOS
xdg-open index.html    # Linux
start index.html       # Windows
```

That's it. No server required.

---

## Hosting on GitHub Pages

1. **Create a new repository** on GitHub. Name it whatever you want — for example, `p5js-textbook`.

2. **Upload the files.** Drop the contents of this folder (every `.html` file, plus this `README.md`) into the root of the repository. The structure should look like:
   ```
   your-repo/
   ├── index.html
   ├── chapter01.html
   ├── chapter02.html
   ├── chapter03.html
   ├── chapter04.html
   ├── chapter05.html
   ├── chapter06.html
   ├── chapter07.html
   └── README.md
   ```

3. **Turn on GitHub Pages.** In your repo, go to **Settings → Pages**, set the source to **Deploy from a branch**, pick the `main` branch and the `/ (root)` folder, then **Save**.

4. **Wait ~1 minute,** then visit `https://<your-username>.github.io/<your-repo>/`. Your textbook is live.

5. **Share with students** by sending them that URL. Each chapter is independently linkable — for example, `https://<your-username>.github.io/<your-repo>/chapter03.html#bouncing-ball` jumps directly to the bouncing-ball section of Chapter 3. Useful for linking from Schoology / Canvas / etc.

### Hosting on a custom domain

If you want to host on something like `textbook.yourschool.org`, see GitHub's [custom-domain docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site).

---

## Hosting in Schoology (or any LMS)

If your LMS strips inline `<style>` (Schoology is known to do this with HTML-text content), don't paste the chapter HTML in directly. Instead:

- **Upload the .html files to GitHub Pages first** (instructions above), and
- **Link to them from Schoology** as external resources.

That keeps all your styling and video embeds intact.

---

## File Structure

```
p5js-textbook/
├── index.html         # landing page / table of contents
├── chapter01.html     # Chapter 1: Getting Started
├── chapter02.html     # Chapter 2: Variables
├── chapter03.html     # Chapter 3: Conditionals
├── chapter04.html     # Chapter 4: Loops
├── chapter05.html     # Chapter 5: Functions
├── chapter06.html     # Chapter 6: Objects
├── chapter07.html     # Chapter 7: Arrays
├── README.md          # this file
└── build.sh           # script used to regenerate the .zip package
```

Each chapter file is fully self-contained — no external CSS, no external JavaScript (apart from YouTube iframe embeds for the videos). You can drop any single chapter into any other web context and it will render correctly on its own.

---

## Design conventions

These are the consistent CSS classes used across every chapter, in case you want to extend the textbook with your own additional content:

### Syntax highlighting (inside `<pre><code>`)
- `.keyword` — purple (for `let`, `const`, `function`, `if`, `else`, `class`, `new`, `return`…)
- `.function` — blue (for function names, both calls and definitions)
- `.number` — orange (for numeric literals)
- `.comment` — gray italic (for `// comments`)
- `.string` — green (for `"strings"`)
- `.class-name` — yellow (for class names like `Ball`, `Particle`)

### Callout boxes
- `.tip` — green, 💡 icon (helpful aside)
- `.alert` — yellow, ⚠️ icon (heads up / important point)
- `.error-example` — red, 🐛 icon (common bug)
- `.exercise` — blue, ✏️ icon (practice problem)

### Layout
- `.video-container` — wraps an `<iframe>` for a responsive 16:9 YouTube embed
- `.chapter-nav` — sticky header nav (prev / contents / next)
- `.chapter-footer` — large prev / next cards at the bottom of each chapter
- `.toc-grid` / `.toc-card` — used on `index.html`

All chapters use the same fonts (Iowan Old Style / Palatino for body, Helvetica Neue / Inter for sans, JetBrains Mono / Fira Code for code) and a shared p5-pink (`#ed225d`) accent color.

---

## Coding Train video credits

Every embedded video is the work of **Daniel Shiffman** and the Coding Train. Embedded under YouTube's standard embed terms; please visit [thecodingtrain.com](https://thecodingtrain.com/) and the [Coding Train YouTube channel](https://www.youtube.com/@TheCodingTrain) for the full curriculum, code examples, and Dan's enthusiasm in its native habitat.

Video IDs used:

| Ch. | Video IDs |
|-----|-----------|
| 1 | yPWkPOfnGsw, MXs1cOlidWs, c3TeLi6Ns1E, riiJTF5-N7c |
| 2 | 7A5tKW9HGoM, dRhXIIFp-ys, T26OJGjI8qI, POn4cZ0jL-o, nicMAoW6u1g |
| 3 | 1Osb_iGDdjk, LO3Awjn_gyU, r2S7j54I68c, Rk-_syQluvc |
| 4 | cnRD9o6odjk, 1c1_TMdf8b8 |
| 5 | wRHAitGzBrg, zkc417YapfE, qRnUBiTJ66Y |
| 6 | xG2Vbnv0wvg, T-HGdc8L-7w, rHiSsgFRgx4 |
| 7 | VIQoUghHSxU, RXWO3mFuW-I, fBqaA7zRO58, TaN5At5RWH8, tA_ZgruFF9k |

---

## Licensing

This project uses a **dual license**:

### Prose, exercises, and design — CC BY-SA 4.0

All the *written content* of this textbook (the chapter prose, exercises, beginner-mistake explanations, and overall pedagogical structure) is licensed under the **[Creative Commons Attribution–ShareAlike 4.0 International License](https://creativecommons.org/licenses/by-sa/4.0/)**.

You are free to:
- **Share** — copy and redistribute the material in any medium or format
- **Adapt** — remix, transform, and build upon the material for any purpose, even commercially

Under the following terms:
- **Attribution** — You must give appropriate credit and link to the license.
- **ShareAlike** — If you remix, transform, or build upon the material, you must distribute your contributions under the same license.

### Code samples — MIT License

All **code samples** within the textbook (the p5.js code snippets shown in `<pre><code>` blocks, the example sketches, and the exercise starter code) are released under the **MIT License**:

```
MIT License

Copyright (c) 2026 the textbook author(s)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

Students copying snippets from this book into their own sketches do **not** need to include any attribution — code samples are MIT, copy freely.

### Embedded video content

Embedded Coding Train videos remain the property of Daniel Shiffman / the Coding Train and are *not* covered by this textbook's license. They are embedded via YouTube under YouTube's standard terms.

### p5.js itself

[p5.js](https://p5js.org/) is its own project, separately licensed under the LGPL 2.1. Nothing in this textbook redistributes p5.js — students load it from the p5.js Web Editor or via CDN as they normally would.

---

## Rebuilding the zip

If you've edited any of the chapter files and want to repackage everything:

```bash
./build.sh
```

This produces `p5js-textbook.zip` in the parent directory, with everything under a top-level `p5js-textbook/` folder for clean extraction.

---

## Feedback / contributions

This is a teaching artifact, not a polished product. If you spot a typo, a confusing explanation, a broken video link, or a bug in a code sample, open an issue or a pull request on the repo — your students (and mine) will thank you.

Happy teaching. May your students discover that code is one of the most beautiful ways to think.

🚂✨

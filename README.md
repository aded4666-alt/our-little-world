# Our Little World ❤️ — For Divine

A little place on the internet made especially for Divine.

This repository is a **backup of the live site** so the source code is safely
stored in version control. It mirrors the deployed page exactly, with one
improvement applied (see below).

## Contents

- `index.html` — the single-page site (hero, about, reasons, memories,
  our-time counter, love letter, surprise)
- `styles.css` — all styling (typography, gradients, animations, responsive)
- `images/divine-main.jpg` — portrait used in the "About You" section

## Improvement applied in this backup

**Fixed the "Our Time Together" live counter.**

The original counter anchored to July 7th of the *current* year, which meant
it reset every year and contradicted the "since everything started" story.
It now uses a **fixed start date — July 7th, 2026, 00:00:01** — so the counter
grows cumulatively forever and never wraps back around. Before that date it
clamps to zeros instead of showing a negative countdown.

## Note on the platform script

The live page includes a hosting-provider script:

```html
<script src="https://sites.super.myninja.ai/_assets/ninja-daytona-script.js"></script>
```

This is injected by the hosting platform (analytics/tracking) and is **not**
part of the site's own code. It is left in place so this backup mirrors the
live page exactly. If you redeploy elsewhere, that line can be safely removed.

---

Made with love. 💕

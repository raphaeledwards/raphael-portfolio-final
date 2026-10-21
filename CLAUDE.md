# Project notes for Claude Code

## AI Lab copy style guide

`AI_LAB_ITEMS` in `src/data/portfolioData.js` are personal-build writeups for a technology-executive audience, not a developer one. When writing or revising an entry:

- **Audience**: assume the reader is a tech exec skimming a portfolio, not an engineer reading a design doc. They care about judgment, trade-offs, and outcomes — not implementation trivia.
- **Keep jargon in the tag chips only.** Framework/library/version names (ctypes, mypy, numpy, Node 22, line counts, specific SDK method names, etc.) belong in `tags`, not in `description` or `content`. If a stack detail doesn't change the reader's understanding of a *decision*, cut it.
- **Structure each `content` field as a short narrative, not a spec:**
  1. Open with the real problem the project solves, framed as a gap in what already exists — not "here's what I built."
  2. 2-4 middle paragraphs, each naming one hard problem encountered and the non-obvious judgment call made to solve it (not just what was built, but why that choice over the obvious one).
  3. Close with a one-line "lesson" — the generalizable insight, not a recap.
- **No stack dumps.** Don't open a paragraph with "Stack: X, Y, Z." Mention a technology only inline, in service of explaining a decision.
- **Don't name third-party products/IP the project depends on if asked not to** — check with the user per-project; some entries deliberately keep the underlying platform generic (e.g. "a racing simulator," not a specific game title).
- **Length**: roughly 4-6 short paragraphs, similar to the existing entries — long enough to carry a real narrative, short enough to read in a minute.

See `src/data/portfolioData.js` → `AI_LAB_ITEMS` for the current reference examples of this style.

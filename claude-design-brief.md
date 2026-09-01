# Using Claude Design on ONCourse

## Workflow

1. Publish the site first (GitHub Pages). Claude Design works best from a live URL or a linked repo.
2. In Claude Design (claude.ai/design), start a project and either **link the GitHub repository** or use **web capture** on the live landing page so it inherits the real typography, colors, and components.
3. Paste the prompt below. Iterate with comments and sliders on the landing and about pages first.
4. Export as HTML and hand the files back to me (or to Claude Code) to integrate. **Do not let Claude Design regenerate `app.html`** — the timeline engine, print fitting, and share links live there, and a redesign that rewrites the markup will break them. If you want app-side changes, ask it for a design system (tokens, spacing, component styles) and I will apply them.

## Prompt to paste

> You are refining the visual design of ONCourse, a free tool that lets oncologists turn a cancer treatment plan into a one-page "map" for patients (the whole course of treatment, its decision points, and what comes next). Audience: people living with cancer and their families first; physicians second. The feeling to hit: quiet, premium, trustworthy, and personal — like a beautifully typeset letter from your doctor, not a SaaS dashboard.
>
> Keep the existing design system: Source Serif 4 for headlines and the wordmark, Atkinson Hyperlegible (a typeface designed for low-vision readers) for everything else; deep navy ink (#172033) on white with one cobalt accent (#2F55D4); treatment-type colors are semantic and must not change (chemotherapy #3457D5, immunotherapy #0E9F8E, targeted #7A4FD6, hormone #C48A16, radiation #E0603C, surgery #172033, surveillance #4C9A5B). Generous whitespace, left-aligned, restrained. No gradients on text, no glassmorphism, no stock-photo hero, no emoji icons (replace the three feature icons with simple line icons in the ink color).
>
> **Logo, first.** The wordmark is ONCourse, set in Source Serif 4 with ONC in the same weight as the rest. The O is a globe: a circle with meridians and parallels drawn as fine lines, so it reads as a globe (and as a map) at 24 px and at 200 px. Explore the globe on its own, with no route line through it; then, as an alternative, explore a single quiet great-circle arc across it with a small destination marker. The ring should be the heaviest line so the letterform still reads as an O inside the word. Show it as the O in the wordmark, as a standalone mark, and as a favicon at 16 px. Deliver SVGs: mark alone at 32 px and 64 px, and mark-plus-wordmark. Reference: `logo-options.html`, option B, is the current direction; keep its spirit and make it cleaner.
>
> Then, in order: (1) Landing page: make the treatment map itself the hero image — large, cropped with intent, perhaps at a slight angle with a subtle paper shadow; tighten spacing; design a distinctive "what's inside" section. (2) About page: give the mission text an editorial layout with a pull quote, and design the team section for two to three people with optional photos. (3) Disclaimer page: keep it plain and readable; no design flourishes, just excellent typography. (4) Deliver a short style sheet of tokens and component styles (buttons, cards, section headers, tables) that a developer can apply to the app without changing its structure.
>
> Export everything as standalone HTML plus SVG assets.

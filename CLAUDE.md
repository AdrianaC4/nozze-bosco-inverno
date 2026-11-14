# CLAUDE.md — Nozze nel Bosco d'Inverno

This file is the project memory for Claude Code. Read it fully at the start of every session.
Full details live in `docs/game-design.md` (game design) and `docs/art-guide.md` (art workflow and prompts).

## What this project is

- A very simple **cooperative 2-player mini-game collection** for **one iPhone**, played in landscape.
- It is a **wedding gift** for a couple, **Silvia** and **Francesco**, who will play it together. Their cat **Mario** appears as a forest spirit guide.
- Theme: **Christmas + Ghibli-inspired look** (soft watercolour, cozy forest spirits) — but **original characters only**, no Studio Ghibli characters or assets, and never write "Studio Ghibli" in image prompts.
- Built by Adri, who has **never built a game before** and builds with AI help. There is **no deadline**.

## Hard rules

1. **All in-game text is in Italian.** Docs, code comments and conversation with Adri are in English.
2. **Same phone, split screen:** Silvia owns the **left half**, Francesco the **right half**. Both play at the same time (multi-touch).
3. **Gesture rule:** each player may use any one gesture family **at most twice** across the whole game (finale included). Families: Tap (single or rapid tapping count as the same family), Hold, Drag, Swipe, Circle. See the matrix in `docs/game-design.md`.
4. **Abilities:** Silvia = precision and organisation (timing, aiming, matching). Francesco = strength (power, holding, pushing, cranking).
5. **Forgiving game:** no game over. Failing restarts the mini game instantly. Stars are only for replay value.
6. **The ending** is an animated scene with all three characters (Silvia, Francesco, Mario) under the lit tree — **no real photo**. Final text: "Appena Sposati! Silvia & Francesco" and "Buon Natale". No wedding date shown.

## Tech stack

- **Phaser 3** (JavaScript), static web game, no build step needed at first.
- Target: **iPhone Safari**, added to the Home Screen for full screen.
- Hosting: **GitHub Pages** (repo kept private while building; made public when publishing, because free Pages needs a public repo).
- Fixed design size 1280×720, `Phaser.Scale.FIT`, landscape only, with a "Ruota il telefono in orizzontale" screen in portrait (Safari can't lock orientation).
- Audio only starts after the first tap ("Tocca per iniziare"). No vibration (iPhone Safari doesn't support it) — use sound, sparkles and screen shake.
- Progress saved in localStorage, wrapped in try/catch.
- All Italian strings live in one file: `src/testi.js`.

## Folder structure (create folders as needed)

```
CLAUDE.md            this file
README.md
docs/
  game-design.md     the one-pager
  art-guide.md       art tools, workflow, prompts, asset checklist
assets/
  raw/               original AI images exactly as downloaded (never edited)
  game/              cut-out (transparent PNG), resized, renamed — used by the game
  audio/             music and sound effects
src/                 game code (later)
index.html           (later)
```

## How Adri likes to work

- **Align on the approach before implementing anything.** Explain the plan in plain words first, then wait for her OK.
- Give **complete file replacements**, not partial snippets.
- Give **step-by-step terminal guidance**, explained simply (she is new to games and to git).
- Keep steps small; every step should end with something that works on the iPhone.
- **Commit and push to GitHub after each meaningful step** (for example after each new image), with a clear commit message.

## Art workflow (summary — details in docs/art-guide.md)

- Images are generated in **Google Gemini** (free) by Adri, using the prompts in `docs/art-guide.md`.
- When Adri adds a new image: save the original in `assets/raw/` with the agreed file name, review it against the style (soft watercolour, warm lantern light vs blue snow, simple round shapes, no text or watermark), give honest feedback, and commit it.
- Later, for game use: remove the background (transparent PNG), resize, and save into `assets/game/`. Set up a local tool for this (for example Python + `rembg`) when the time comes, after agreeing the approach with Adri.
- Animation is done in code with Phaser tweens (bounce, wobble, breathe), not frame-by-frame drawings.

## Current status (update this section as work progresses)

- [x] Game idea, story, characters and mini games agreed (`docs/game-design.md`)
- [x] Art tools and workflow agreed (`docs/art-guide.md`)
- [x] Prompt 1 (style anchor) written and given to Adri
- [x] Style anchor saved: `assets/raw/style_anchor.jpg` (lanterns unlit — title / "before") and `assets/raw/style_anchor_lit.jpg` (lanterns lit — ceremony / ending reference)
- [x] Prompt 2 (Silvia character sheet) written in `docs/art-guide.md` and given to Adri
- [x] Silvia saved: `assets/raw/silvia_sheet.jpg` (second try — first came out looking like a child; the fix was the "young adult woman, about 4 heads tall, longer coat" follow-up)
- [x] Prompt 3 (Francesco character sheet) written in `docs/art-guide.md` and given to Adri (attaches style anchor + Silvia; asks for an adult man from the start)
- [x] Francesco saved: `assets/raw/francesco_sheet.jpg` (Adri's choice; slightly more realistic proportions than Silvia — keep attaching Silvia's sheet in his pose prompts, balance sizes in code)
- [ ] Prompt 4: Mario character sheet (uses the real photo of Mario as reference — ask Adri for it)
- [ ] Remaining art (see the checklist in `docs/art-guide.md`)
- [ ] Code build plan steps 1–10 (see `docs/game-design.md`)

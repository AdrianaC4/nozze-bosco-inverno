# CLAUDE.md — Nozze a Natale

(The game's title was "Nozze nel Bosco d'Inverno" until Adri renamed it; the folder, the GitHub repo and the save key keep the old name.)

This file is the project memory for Claude Code. Read it fully at the start of every session.
Full details live in `docs/game-design.md` (game design) and `docs/art-guide.md` (art workflow and prompts).

## What this project is

- A very simple **cooperative 2-player mini-game collection** for **one iPhone**, played in landscape.
- It is a **wedding gift** for a couple, **Silvia** and **Francesco**, who will play it together. Their cat **Mario** appears as a forest spirit guide. Mario has **a very short stub tail** (cut when he was little): every picture of him must show it.
- Theme: **Christmas + Ghibli-inspired look** (soft watercolour, cozy forest spirits) — but **original characters only**, no Studio Ghibli characters or assets, and never write "Studio Ghibli" in image prompts.
- Built by Adri, who has **never built a game before** and builds with AI help. There is **no deadline**.

## Hard rules

1. **All in-game text is in Italian.** Docs, code comments and conversation with Adri are in English.
2. **Same phone, split screen:** Silvia owns the **left half**, Francesco the **right half**. Both play at the same time (multi-touch). *Agreed exception:* in La Torta Nuziale Francesco's two controls are strips at the far left and far right edges of the screen (awkward on purpose); Silvia taps anywhere in the top part of the screen between the strips, or on her left half.
3. **Gesture rule:** each player may use any one gesture family **at most twice** across the whole game (finale included). Families: Tap (single or rapid tapping count as the same family), Hold, Drag, Swipe, Circle. See the matrix in `docs/game-design.md`.
4. **Abilities:** Silvia = precision and organisation (timing, aiming, matching). Francesco = strength (power, holding, pushing, cranking).
5. **Forgiving game:** no game over. Failing restarts the mini game instantly. Stars are only for replay value.
6. **The ending** is an animated scene with all three characters (Silvia, Francesco, Mario) under the lit tree — **no real photo**. Final text: "AUGURI", "Silvia & Francesco" and "Buon Natale" (Adri's choice; it was "Appena Sposati!" before). No wedding date shown.

## Tech stack

- **Phaser 3** (JavaScript), static web game, no build step needed at first.
- Target: **any phone browser** (iPhone Safari and Android Chrome). iPhone: added to the Home Screen for full screen. Android: installable thanks to `manifest.webmanifest` (Mario's icon, full screen, landscape); in the browser it goes full screen and locks landscape at the title's start (`schermoIntero` in `src/effetti.js`).
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

## Testing on the iPhone (while the repo is private)

- Start the local server from the project folder: `python3 tools/server.py` (port 8000; tells Safari not to cache, so a reload always gets the latest files — the plain `python3 -m http.server` let Safari run stale code)
- Find the Mac's Wi-Fi address: `ipconfig getifaddr en0` (was `192.168.0.174`; it can change)
- On the iPhone (same Wi-Fi), open `http://<that address>:8000` in Safari. **Adri now uses only the secure address `https://<address>:8443`** (see the microphone note below); port 8000 is kept for Claude's automatic tests.
- **Microphone (blowing in Il Dirigibile) needs https:** run `python3 tools/server.py 8443 --https` and open `https://<address>:8443` on the iPhone, accepting the certificate warning once. The self-made certificate is in `.cert/` (not committed; the command to make it is in `tools/server.py`; remake it if the Mac's address changes). On the plain http address the game falls back to circles. To tune blowing: `MICROFONO.SOGLIA` / `PIENO` in `src/microfono.js`, `GIRI_SOFFIO` in `src/scenes/Dirigibile.js`.
- No build step: plain `<script>` files loaded in order from `index.html` (Phaser, `src/testi.js`, scenes, `src/main.js`).

## Before giving the gift (checklist)

- [ ] ~~Set `MODALITA_PROVA = false`~~ — Adri decided to KEEP the "Salta ›" button in the gift.
- [x] Publish on GitHub Pages (real https: no certificate warning, the icon and the microphone work).
- [ ] Open the published link once with `?reset=1` on the gift phone if it was used for testing.
- [x] Published on GitHub Pages: **https://adrianac4.github.io/nozze-bosco-inverno/** (public repo, history rewritten to GitHub's anonymous address; Adri kept the "Salta ›" button on purpose).
- [x] Italian texts reviewed by Adri (all 74, including Mario's lines), 2026-11. A last read by a native speaker is still a good idea.

## The gift box: Mario ornament (3D print)

- The gift is delivered as a **3D-printed Mario Christmas ornament** with an **NFC tag** (25 mm round plastic) in a recess under his base; the tag holds the game's link. Printer: Bambu Lab P2S with AMS (multicolour).
- Model built from scratch in code: `tools/mario_ornamento.py` (trimesh + manifold3d + matplotlib in `.venv`). It writes four STL parts in `assets/3d/` (grey, white, red, black), loaded in Bambu Studio as ONE object with four parts, and a preview `assets/3d/anteprima.png`. Tag thickness is an argument (default 1.2 mm): `.venv/bin/python tools/mario_ornamento.py 1.2`.

## How Adri likes to work

- **Align on the approach before implementing anything.** Explain the plan in plain words first, then wait for her OK.
- Give **complete file replacements**, not partial snippets.
- Give **step-by-step terminal guidance**, explained simply (she is new to games and to git).
- Keep steps small; every step should end with something that works on the iPhone.
- **Commit and push to GitHub after each meaningful step** (for example after each new image), with a clear commit message.

## Art workflow (summary — details in docs/art-guide.md)

- Images are generated in **Google Gemini** (free) by Adri, using the prompts in `docs/art-guide.md`.
- When Adri adds a new image: save the original in `assets/raw/` with the agreed file name, review it against the style (soft watercolour, warm lantern light vs blue snow, simple round shapes, no text or watermark), give honest feedback, and commit it.
- For game use: run `.venv/bin/python tools/ritaglia.py <name>` (removes the background, trims, resizes, saves a transparent PNG in `assets/game/`). If `.venv/` is missing: `python3 -m venv .venv && .venv/bin/pip install "rembg[cpu]" pillow`. Always check cut-outs on a dark background (white fur can come out see-through). Backgrounds are only resized (e.g. with `sips`), not cut out.
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
- [x] Prompt 4 (Mario character sheet) written in `docs/art-guide.md` and given to Adri (attaches real Mario photo + style anchor + Silvia; no glow — the spirit glow is done in code)
- [x] Mario saved: `assets/raw/mario_sheet.jpg` (first try; lighter grey than the real cat, by Adri's choice). The real photos of Mario are NOT in the repo.
- [x] Prompt 5 (pose template + pose lines) written in `docs/art-guide.md` and given to Adri
- [x] `silvia_cheer.jpg`, `silvia_oops.jpg`, `francesco_cheer.jpg`, `francesco_oops.jpg`, `mario_proud.jpg`, `mario_guilty.jpg`, `mario_rings.jpg` saved — all emotion poses done (Francesco poses: attach his sheet + Silvia's sheet)
- [x] Code step 1: Phaser 3.90.0 (saved in `src/lib/`), split-screen touch test (`src/scenes/ProvaTocco.js`), rotate screen — tested and working on Adri's iPhone
- [x] Code step 2: title screen (`src/scenes/Titolo.js`): style anchor background, falling snow and code-made chime (`src/effetti.js`), starts only when both halves are touched, then on lift. Tested on the iPhone.
- [x] Step 2b: cut-out tool `tools/ritaglia.py` (rembg, model birefnet-general, in `.venv/`, not committed) → 10 transparent character PNGs in `assets/game/` (max 600px tall). Characters on the title screen: breathing, hop + coloured glow when their player touches. Tested on the iPhone.
- [x] Code step 3: mini game 1 (La Slitta, `src/scenes/Slitta.js`) with plain shapes. After Adri's playtests: uphill removed, 35 s countdown, finish line, reusable start card where petting Mario (swipe) starts every mini game (`src/cartaInizio.js`). Tested on the iPhone.
- Claude's test helper: `tools/prova.py` (drives the game in hidden Chrome with iPhone-style touches; `.venv/bin/python tools/prova.py schermate <folder>` takes screenshots of title, story and ending). Keep test scripts here, not in the scratchpad: it is wiped on restart. The two test servers stop when a session ends: restart both (8000 and 8443 `--https`) at the start of a session.
- Testing: `?scena=Slitta` in the address starts straight from that scene; `?reset=1` clears the saved progress (do it before gifting). Claude can also play-test in headless Chrome (Chrome DevTools + synthetic iPhone-style TouchEvents with pageX/pageY set).
- [x] Step 3b: story intro (`src/scenes/Intro.js`), 4 scenes with Adri's texts (lit village; gust of wind, oops poses; Mario guilty; Mario cheers up). Title screen without characters (finger glows). Bell chime only at: title start, end of intro, mini game win. Background music in code (`src/musica.js`: 'neve' waltz, 'corsa' bouncy; La Slitta's tempo follows the sled). No-cache test server `tools/server.py`. Tested on the iPhone.
- [x] Code step 4: finale (`src/scenes/Cerimonia.js`): triple-stroke Mario card (`mostraCartaCarezze` in `src/cartaInizio.js`), dark night before / warm gold after, both hold → lit village rises bottom-up behind a golden light line with sparkles, flash + star on the tree, wedding animation (Mario with rings, cheer poses, heart), ending screen with total stars and "Gioca ancora". Music: 'cerimonia' (card + lighting, full only while both hold) then 'festa' wedding waltz. La Slitta leads straight to the finale for now. Tested on the iPhone.
- [x] Code step 5: mini game 2 La Torta Nuziale (`src/scenes/Torta.js`) with plain shapes: Silvia taps to drop layers (anywhere in the top part between the strips, or her left half; trimmed overhang, smaller + faster each layer), two nutcracker toppers (second touching first knocks it off), Francesco balances the cake with ONE finger on ◀/▶ strips at the screen edges (both pressed = neither works; drift, directional push at every drop, Mario's licks; full tilt for 0.7 s with a flashing warning = top piece falls + life lost), no timer. Flow: Slitta → Torta → Cerimonia. Tested on the iPhone ("hard enough").
- [x] Code step 6: mini game 3 Gli Anelli Perduti (`src/scenes/Anelli.js`): Silvia chooses ice blocks (max 2 uncovered) and taps matching pairs to confirm (green), Francesco joins 3 random points one after another without lifting his finger (Drag) to break the ice, mismatches refreeze after 2 s, 60 s countdown, no lives, Mario guilty → proud. Flow: Slitta → Torta → Anelli → Cerimonia. Tested on the iPhone.
- [x] Code step 7: mini game 4 Il Dirigibile delle Lanterne (`src/scenes/Dirigibile.js`): Francesco circles to crank (height), Silvia drags (left/right); 16 shrinking rings appear around the sky (far apart sideways, 4.5 s each), gusts, drifting dark clouds (lose a lantern), ≥10 lanterns to win. Both players needed (tests: both 12–14, alone 0–3). Flow: Slitta → Torta → Anelli → Dirigibile → Cerimonia. Tested on the iPhone.
- [x] Code step 8: result card (`src/risultato.js`: stars one by one, Mario's line per game, record, Riprova/Avanti), saving (`src/salvataggio.js`: best stars + furthest scene, localStorage with try/catch), title "Bentornati!" with Dall'inizio/Continua, ending shows ★ n / 12, `?reset=1` clears the save. Tested on the iPhone. To review later: Mario's result lines (`src/testi.js`). Later idea: a map of the mini games.
- [ ] **NEXT:** code step 9: art pass. Prioritised list agreed and written in `docs/art-guide.md` (A: 3 backgrounds; B: airship, 2 nutcrackers, sled, 6-icon sheet; C: small objects + app icon; D: optional). Things that change shape stay in code (cake layers, ice, rings, snow). Done: all 3 backgrounds — `bg_torta.jpg` (La Torta), `bg_dirigibile.jpg` (Il Dirigibile; code forest layer removed), `bg_anelli.jpg` (Gli Anelli). Priority B: `airship.png` done (split into body + spinning propeller, Mario in the gondola), both nutcrackers done (in La Torta). `sled.png` done (La Slitta, with Mario's real picture running beside it). `icone_anelli.png` done (cut into 6 tiles with `tools/dividi_icone.py`). Priority B complete. Priority C: gift, tree, lantern, dark cloud done (one sheet `oggetti.jpg`, cut with `tools/dividi_icone.py`). Table (La Torta) and app icon (`assets/icone/`, linked in index.html) done: Priorities A, B, C complete. Code restyle done: frosted cake layers (`creaStrato`), painted ice blocks (`creaGhiaccio`), watercolour snow ground in La Slitta, softer rings of light. Code review done (see commit): finger glows left on the title, music catch-up burst after the phone was locked, sound not waking after a lock, game running behind the rotate screen (now paused), lantern growing when collected, cake able to get too narrow for the nutcrackers (min width 80), 'Un dito solo!' flag not reset. Il Dirigibile: Francesco now BLOWS into the microphone (`src/microfono.js`), with circles as fallback; waiting for Adri's iPhone test over https to tune the sensitivity. Priority D done: Francesco with the pickaxe (Gli Anelli), the couple waving in the gondola (Il Dirigibile), painted ending postcard (La Cerimonia). **Art pass (step 9) complete.** Mario now takes part in every mini game (zigzag dash in La Slitta, jumping on the table in La Torta, swapping ice blocks and getting in Francesco's way in Gli Anelli, making the airship dip in Il Dirigibile; La Cerimonia unchanged) — waiting for Adri's iPhone test. Changes after publishing (22 Nov): title text "Tieni premuto per iniziare"; La Slitta touch zones (Francesco's box top right, Silvia's band along the bottom); La Torta drops no longer push the cake, first Mario hint stays until tapped; Gli Anelli pairs turn green by themselves, wrong pairs hide after 1 s, Silvia's instruction updated; Il Dirigibile airship faces left + ↕/↔ arrows; Android support (manifest, full screen, landscape lock). Sounds reviewed by Adri: real meow, tree shimmer (stretched to 8 s, follows the light) and victory stars (files in `assets/audio/`, loaded by `caricaSuoni` in every scene's preload); no meow with the rings; music volume restored after the microphone (iPhone 'call mode'). Checks: `tools/prova_suoni.py`. Then: Francesco's button became a snowball (text on two lines), "Trascina per guidare" back at the bottom (no band); microphone asked at flight start again, with a readable diagnosis note in test mode. Adri reported the game only opening with the laptop on: that is the old test address (192.168.0.174:8443) on her Home Screen — she must use the github.io link. Earlier (23 Nov): La Slitta — Silvia drags from anywhere below Francesco's button (yellow band removed), Francesco's button is a soft frosted pane; microphone asked during Mario's stroke, with a retry button and the failure reason in test mode (Adri's iPhone had fallen back to circles without being asked). Checks: `tools/prova_modifiche.py`. Next: step 10 (real sounds, playtest with friends, publish on GitHub Pages, `?reset=1`).
- [ ] Remaining art (see the checklist in `docs/art-guide.md`)
- [ ] Code build plan steps 2–10 (see `docs/game-design.md`) — only the playtest with friends is left

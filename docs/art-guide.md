# Art Guide — Nozze nel Bosco d'Inverno

## Tools (all free)

| What it's for | Tool | Notes |
| --- | --- | --- |
| Drawing everything (characters, backgrounds, objects) | Google Gemini — gemini.google.com | Free with a Google account, about 20 images per day. Best free option for keeping characters consistent: attach earlier images as references. |
| Removing backgrounds, resizing, naming | Claude Code (this project) | Will be set up locally when needed (for example Python + rembg). |
| Small fixes (crop, colour touch-ups) | Photopea — photopea.com | Free browser editor, rarely needed. |
| Music and sounds | Pixabay Music and Sound Effects | Free piano / music-box Christmas music, chimes, a meow. |

## Workflow

1. **Style anchor first** — one scene that defines the look. Attach it to later prompts.
2. **One character sheet each** — Silvia, Francesco, Mario (attach Mario's real photo). Front view, full body, plain white background.
3. **Poses** — attach the character sheet every time; one pose per image.
4. **Backgrounds** — 16:9 landscape, one per mini game plus title and ceremony.
5. **Objects** — one object per image, plain white background.
6. **Clean-up** — save originals in `assets/raw/`, then cut out (transparent PNG), resize and save in `assets/game/`.
7. **Animation in code** — Phaser tweens (bounce, wobble, breathe). No frame-by-frame drawings.

## Rules for every prompt

- Never write "Studio Ghibli" — describe the style instead (soft watercolour, hand-painted, warm cozy light).
- One Gemini chat per character, always attach the reference sheet.
- Plain white background for characters and objects.
- Check every image for watermarks, logos or text. Regenerate or crop if needed.
- Save with the agreed file name straight away.

## Asset checklist

Adjust as we go. File names are for `assets/raw/` (same name in `assets/game/` after clean-up). Gemini downloads are `.jpg`: keep raw files as `.jpg` exactly as downloaded; the cut-out versions in `assets/game/` become `.png`.

### Style and screens
- [x] `style_anchor.jpg` — snowy forest village at dusk, lanterns unlit (also the title background)
- [x] `style_anchor_lit.jpg` — same scene with the lanterns lit (reference for ceremony / ending)
- [ ] `intro_1.png`, `intro_2.png`, `intro_3.png` — story panels

### Character sheets
- [x] `silvia_sheet.jpg`
- [ ] `francesco_sheet.jpg`
- [ ] `mario_sheet.png` (reference: real photo of Mario)

### Poses
- [ ] `silvia_steer.png`, `silvia_cheer.png`, `silvia_oops.png`
- [ ] `francesco_push.png`, `francesco_hold.png`, `francesco_dig.png`, `francesco_crank.png`, `francesco_cheer.png`
- [ ] `mario_run.png`, `mario_lick.png`, `mario_guilty.png`, `mario_proud.png`, `mario_rings.png`

### Backgrounds (16:9)
- [ ] `bg_slitta.png` — snowy hill slope with pine trees
- [ ] `bg_torta.png` — cozy cottage kitchen at night
- [ ] `bg_anelli.png` — snowy clearing (grid area in the middle)
- [ ] `bg_dirigibile.png` — night sky above the forest
- [ ] `bg_cerimonia.png` — the great tree clearing, ceremony set-up
- [ ] `ending_scene.png` — Silvia, Francesco and Mario together under the lit tree

### Objects
- [ ] `sled.png`, `gift_1.png`, `gift_2.png`, `gift_3.png`, `tree_obstacle.png`
- [ ] `cake_layer.png`, `cake_topper.png`, `table.png`
- [ ] `snow_block.png`, tile icons: `tile_bell.png`, `tile_star.png`, `tile_ornament.png`, `tile_candycane.png`, `tile_mitten.png`, `tile_rings.png`
- [ ] `airship.png`, `light_ring.png`, `lantern_light.png`
- [ ] UI: `snowflake_life.png`, `star_rating.png`

## Prompts

### Prompt 1 — Style anchor (`style_anchor.jpg`) — done

Start a new Gemini chat called "Winter Wood – Style" and paste:

```
Create a wide landscape illustration in 16:9 format.

Scene: a small snowy forest village at dusk on Christmas Eve. In the centre of a clearing stands one giant old fir tree, decorated with ornaments and paper lanterns, but its lights are not lit yet. Around the clearing there are a few small wooden cottages with round windows glowing warm orange, little paper lanterns hanging between the trees, a winding snowy path, and soft snow gently falling. Tall pine forest and soft blue hills in the background.

Style: hand-painted watercolour and gouache storybook illustration, gentle anime-inspired, soft edges, no hard black outlines, painterly texture, cozy and magical, calm and nostalgic mood. Colour palette: cool blue and white snow contrasted with warm orange and golden lantern light, with small red accents. Simple shapes, not too detailed, so that cute round cartoon characters could be placed in it later.

Composition: keep the upper area of the sky fairly empty and calm (space for a title), and keep the snowy ground in the foreground open and uncluttered.

No people, no animals, no text, no letters, no logos, no watermark.
```

Check: cozy and soft (not realistic), warm orange vs blue snow, empty sky at top and open ground at bottom, no text or watermark.

Follow-ups (one change at a time, same chat):
- Too detailed: `Make it simpler and softer, more like a watercolour children's book illustration, with fewer details.`
- Too dark: `Make it a bit brighter, early evening with a soft pink and blue sky.`
- Not warm enough: `Make the lantern and window light warmer and more glowing.`
- Too busy: `Remove some cottages and trees so the clearing feels more open and calm.`

### Prompt 2 — Silvia character sheet (`silvia_sheet.jpg`)

Start a new Gemini chat called "Winter Wood – Silvia". Attach `assets/raw/style_anchor.jpg`, then paste:

```
The attached image is the style reference for a cozy Christmas storybook game. Match its painting style exactly: hand-painted watercolour and gouache, soft edges, no hard black outlines, gentle painterly texture. Do not copy the scene, only the style.

Create a character sheet of one original cartoon character: Silvia, a young woman, the bride of the story.

Look:
- Cute, round, simple shapes: big head, small body (about 3 heads tall), like a character in a children's picture book.
- Big curly brown hair, voluminous and soft, tied with one bright red ribbon bow.
- Warm, kind face with big friendly eyes, rosy cheeks and a gentle smile.
- A cozy knee-length winter coat in warm mustard yellow, with big round buttons.
- Red mittens, dark brown winter boots, warm light brown tights.

Pose: standing, full body, facing the viewer, arms relaxed and slightly out from the body, feet slightly apart, cheerful and calm.

Lighting: soft, warm, cozy light, a little warmer and more inviting than the reference image.

Background: plain pure white, no ground, no shadow on the floor, no snow, no scenery. Only one character, shown once, fully visible from head to toe with some empty space around her.

No text, no letters, no labels, no logos, no watermark.
```

Check:
- Same soft watercolour style as the style anchor, no black outlines.
- Cute and round (big head, small body), not realistic or tall.
- Curly brown hair with a red ribbon, mustard coat, red mittens.
- Full body visible, plain white background, only one Silvia, no text.
- She feels like Silvia to you — the real couple will recognise themselves only through small details (hair, ribbon), so trust your instinct here.

Follow-ups (one change at a time, same chat):
- Too realistic / too tall: `Make her cuter and rounder, with a bigger head and a smaller body, like a children's picture book character.`
- Has outlines or looks like a digital cartoon: `Paint her in soft watercolour like the reference image, with no black outlines.`
- Background not white: `Put her on a plain pure white background with nothing else.`
- Several Silvias on the image: `Show only one Silvia, front view, full body.`
- Hair not right: `Make her hair bigger, curlier and a warm medium brown, with the red ribbon clearly visible.`
- Looks like a child (this happened on the first try — the one used): `Keep everything the same: the painting style, the curly brown hair, the red ribbon bow, the mustard coat, the red mittens and the boots. But make her clearly a young adult woman in her late twenties, not a child: a slightly more grown-up face, a slightly taller and more womanly figure (about 4 heads tall), and a longer coat that reaches below the knee. She should still be cute, soft and round, in the same picture-book style. Plain pure white background, full body, only one character.`

Save the best one as `silvia_sheet.jpg` and send it to Claude. **Done** — the chosen version is the one from the "looks like a child" follow-up. This image becomes the reference for all her poses.

### Prompt 3 — Francesco character sheet (`francesco_sheet.jpg`)

Start a new Gemini chat called "Winter Wood – Francesco". Attach **two** images in this order: `assets/raw/style_anchor.jpg`, then `assets/raw/silvia_sheet.jpg`. Then paste:

```
The first attached image is the style reference for a cozy Christmas storybook game. The second image is Silvia, the bride, already drawn in the final style. Match her painting style and proportions exactly: hand-painted watercolour and gouache, soft edges, no hard black outlines, gentle painterly texture, same paper-white background. Do not draw Silvia and do not copy the scene.

Create a character sheet of one original cartoon character: Francesco, the groom, a young adult man about thirty years old (clearly an adult, not a boy).

Look:
- Same cute picture-book proportions as Silvia (about 4 heads tall), but a little taller than her, with broad shoulders and a strong, sturdy build.
- Very short black hair, neatly buzzed.
- Friendly, confident face with a big warm grin, kind dark eyes and rosy cheeks.
- A cozy red Christmas knitted sweater with a cream snowflake pattern and a green band across the chest, with the sleeves pushed up to the elbows, showing strong muscular forearms (funny, because it is snowing).
- Dark blue trousers and sturdy brown winter boots. No coat, no gloves, no hat.

Pose: standing, full body, facing the viewer, cheerful and proud, one arm flexed showing his biceps through the sweater, the other hand on his hip, feet slightly apart.

Lighting: soft, warm, cozy light, same as Silvia's image.

Background: plain pure white, no ground, no shadow on the floor, no snow, no scenery. Only one character, shown once, fully visible from head to toe with some empty space around him.

No text, no letters, no labels, no logos, no watermark.
```

Check:
- Same soft watercolour style as Silvia, no black outlines. Put both images side by side: do they look like they come from the same book?
- Clearly a young adult man, not a boy, and not a realistic bodybuilder either.
- Very short black hair, red Christmas sweater with sleeves pushed up, visible strong arms.
- Full body visible, plain white background, only one Francesco, no text.
- He feels like Francesco to you.

Follow-ups (one change at a time, same chat):
- Looks like a boy: `Make him clearly a young adult man about thirty: a more grown-up face with a defined jaw, a slightly taller and broader figure. Keep everything else the same.`
- Too realistic or too muscly: `Make him cuter and softer, in the same picture-book style as Silvia. Strong but round and friendly, not a realistic bodybuilder.`
- Not strong enough: `Make him look stronger: broader shoulders and bigger, clearly muscular forearms and arms, still cute and picture-book style.`
- Style doesn't match Silvia: `Paint him in exactly the same soft watercolour style as the second reference image (Silvia), with no black outlines.`
- Background not white: `Put him on a plain pure white background with nothing else.`
- Sleeves not pushed up: `Push his sweater sleeves up to the elbows so his strong forearms are clearly visible.`

Save the best one as `francesco_sheet.jpg` and send it to Claude. This image becomes the reference for all his poses.

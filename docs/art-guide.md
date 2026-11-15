# Art Guide — Nozze nel Bosco d'Inverno

## Tools (all free)

| What it's for | Tool | Notes |
| --- | --- | --- |
| Drawing everything (characters, backgrounds, objects) | Google Gemini — gemini.google.com | Free with a Google account, about 20 images per day. Best free option for keeping characters consistent: attach earlier images as references. |
| Removing backgrounds, resizing, naming | Claude Code (this project) | `tools/ritaglia.py` (Python + rembg, model birefnet-general); `tools/dividi_icone.py` cuts one image with several objects in a row into separate pictures. |
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
- [x] `style_anchor.jpg` — snowy forest village at dusk, lanterns unlit (title, intro, ceremony "before")
- [x] `style_anchor_lit.jpg` — same scene with the lanterns lit (intro scene 1, ceremony "after")
- [ ] (optional) `intro_1–3.jpg` — painted story panels; the current intro already works with the art we have

### Character sheets
- [x] `silvia_sheet.jpg`
- [x] `francesco_sheet.jpg`
- [x] `mario_sheet.jpg` (reference: real photo of Mario — not stored in the repo)

### Poses
Made with Prompt 5 (pose template).
- Emotion (all done): [x] `silvia_cheer.jpg`, [x] `silvia_oops.jpg`, [x] `francesco_cheer.jpg`, [x] `francesco_oops.jpg`, [x] `mario_proud.jpg`, [x] `mario_guilty.jpg`, [x] `mario_rings.jpg`
- The planned action poses (steer, push, hold, dig, crank, run, lick) are **no longer needed**: after playtesting, Silvia and Francesco don't appear inside the mini games (they are the hands playing). Optional extras are in Priority D below.

### Art pass (step 9) — prioritised list agreed with Adri

Not drawn in Gemini, restyled in code instead (they change shape while playing): cake layers, ice blocks, rings of light, snow, cracks, stars, lives, buttons. La Slitta's scrolling snowy ground also stays in code (seen from above and endless: very hard to draw seamlessly).

**Priority A — backgrounds (16:9)**
- [x] `bg_torta.jpg` — cozy cottage kitchen at night (Prompt 6) — first try, in the game
- [x] `bg_dirigibile.jpg` — wide night sky over a snowy forest (Prompt 7) — first try, in the game
- [x] `bg_anelli.jpg` — a frozen clearing in the snow, simple and calm (Prompt 8) — first try, in the game

**Priority B — the "star" of each game**
- [x] `airship.png` — the little airship, side view (Prompt 9) — in the game; split by Claude into `airship_corpo.png` + `airship_elica.png` so the propeller spins in code; Mario added in the gondola
- [x] `schiaccianoci_1.png` — navy coat, red trousers, gold crown, sceptre (Prompt 10) — in the game
- [x] `schiaccianoci_2.png` — white and pink coat, light blue details, tall gold hat, lollipop (Prompt 11) — in the game
- [x] `sled.png` — wooden sled seen from above/behind, piled with wrapped gifts (Prompt 12) — in La Slitta (Mario now uses his real picture beside it)
- [x] `icone_anelli.png` — ONE image with the 6 hidden pictures (Prompt 13) — cut into `tile_campana/stella/pallina/bastoncino/guanto/anelli.png` with `tools/dividi_icone.py`, in Gli Anelli

**Priority C — small objects**
- [x] `gift.png` — one wrapped gift, tinted in code (Prompt 14 sheet `oggetti.jpg`) — in La Slitta
- [x] `tree_obstacle.png` — small snowy pine tree (Prompt 14 sheet) — in La Slitta
- [x] `lantern.png` — glowing paper lantern (Prompt 14 sheet) — in Il Dirigibile
- [x] `dark_cloud.png` — grumpy dark snow cloud (Prompt 14 sheet) — in Il Dirigibile
- [x] `table.png` — wooden kitchen table (Prompt 15) — in La Torta
- [x] `icon.png` — Home Screen app icon (Prompt 16) — corners filled with gold, sizes in `assets/icone/` (apple-touch-icon 180, 192, 512, favicon 32), linked in `index.html`

**Priority D — optional**
- [x] `francesco_piccone.jpg` — Francesco with the ice pickaxe (Prompt 17) — standing on his side in Gli Anelli
- [x] `coppia_gondola.jpg` — Silvia and Francesco waving, waist up (Prompt 18) — in the airship's gondola, behind its rim
- [x] `ending_scene.jpg` — all three under the lit tree (Prompt 19) — fades in as a postcard behind the final texts (zoomed 1.14 from the bottom)

Suggested order: day 1 = the 3 backgrounds + airship + 2 nutcrackers; day 2 = sled, icon sheet and the small objects; day 3 = optional.

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

- Proportions don't match Silvia (happened on the first try): `Keep his face, short black hair, red Christmas sweater, rolled-up sleeves, flexing pose and boots. But redraw him in exactly the same cute picture-book proportions and soft style as Silvia in the second reference image: a much bigger, rounder head compared to his body (about 4 heads tall in total, only a little taller than Silvia), simpler softer shapes, rounder chunky arms that still look strong, softer watercolour edges with no outlines, and a simpler, gentler smile. He should look like he belongs in the same storybook as Silvia. Plain pure white background, full body, only one character.`

Save the best one as `francesco_sheet.jpg` and send it to Claude. This image becomes the reference for all his poses. **Done** — Adri chose the version from the "proportions" follow-up. He is still a bit taller-proportioned and crisper than Silvia; when writing his pose prompts, keep attaching Silvia's sheet and asking for her soft style, and balance their sizes in code if needed.

### Prompt 4 — Mario character sheet (`mario_sheet.jpg`)

Start a new Gemini chat called "Winter Wood – Mario". Attach **three** images in this order: a clear real photo of Mario (whole cat visible, good light, markings easy to see), `assets/raw/style_anchor.jpg`, then `assets/raw/silvia_sheet.jpg`. Then paste:

```
The first attached image is a photo of a real cat called Mario. Use it ONLY for his colours and markings. The second image is the style reference for a cozy Christmas storybook game. The third image is Silvia, a character already drawn in the final style. Match her painting style exactly: hand-painted watercolour and gouache, soft edges, no hard black outlines, gentle painterly texture, same paper-white background. Do not draw Silvia and do not copy the scene.

Create a character sheet of one original cartoon cat: Mario, a friendly forest spirit cat who guides the heroes.

Look:
- A cute, round, soft cartoon cat in the same picture-book style as Silvia: a big round head, a small chubby body, short legs, a fluffy tail.
- Exactly the same colours and markings as the cat in the photo: grey head and back, a white blaze on his face, white chest and white paws, a pink nose, pale green eyes.
- A tiny red knitted scarf around his neck, the same red as Silvia's ribbon.
- A cheeky, curious, slightly mischievous expression, with a small smile.

Pose: sitting upright, full body, facing the viewer, tail curled around his front paws.

Lighting: soft, warm, cozy light, same as Silvia's image. Do not add any glow, sparkles or magic light around him.

Background: plain pure white, no ground, no shadow on the floor, no snow, no scenery. Only one cat, shown once, fully visible with some empty space around him.

No text, no letters, no labels, no logos, no watermark.
```

Why no glow: a glow painted on a white background is very hard to cut out cleanly. Mario's spirit glow is added later in code (a soft light behind him that gently pulses).

Check:
- His markings match the real Mario (grey head and back, white blaze, white chest and paws, pink nose, pale green eyes). Would Silvia and Francesco recognise him?
- Same soft watercolour style as Silvia, no black outlines, cute and round, not a realistic cat.
- Red scarf, sitting pose, plain white background, only one cat, no glow, no text.

Follow-ups (one change at a time, same chat):
- Markings wrong: `Look again at the photo of the real cat and copy his markings exactly: grey head and back, white blaze on the face, white chest and white paws.`
- Too realistic: `Make him cuter and rounder, a picture-book cartoon cat in the same soft style as Silvia, with a bigger head and a chubby body.`
- Has a glow or sparkles: `Remove all glow, sparkles and light effects around him. Plain pure white background only.`
- Scarf missing or too big: `Give him a tiny red knitted scarf, small and simple, the same red as Silvia's ribbon.`
- Looks too serious: `Give him a cheekier, friendlier expression with a small smile, like a playful cat who knows he did something naughty.`

Save the best one as `mario_sheet.jpg` and send it to Claude. This image becomes the reference for all his poses. **Done** — first try, kept as is (lighter grey than the real Mario, by choice). The real photo of Mario is only a reference: keep it outside the repo (the repo will become public when the game is published).

### Prompt 5 — Poses (one template for all poses)

Use the **same Gemini chat as the character sheet** ("Winter Wood – Silvia", "– Francesco" or "– Mario"), and **attach the character sheet again every time** (`silvia_sheet.jpg`, `francesco_sheet.jpg` or `mario_sheet.jpg`). One pose per image. Paste the template with the character block and the pose line filled in.

Template:

```
The attached image is the character sheet. Draw the same character again in a new pose, keeping everything exactly the same: [CHARACTER BLOCK]. Same proportions, same soft hand-painted watercolour style with no black outlines, same paper-white background.

New pose: [POSE LINE]

Full body, fully visible with some empty space around, plain pure white background, no ground, no shadow on the floor, no snow, no scenery. Do not draw any objects except the ones mentioned in the pose. Only one character, shown once. No text, no letters, no logos, no watermark.
```

Character blocks:
- Silvia: `same face, same big curly brown hair with the red ribbon bow, same mustard yellow coat with round buttons, same red mittens, light brown tights and dark brown boots`
- Francesco: `same face, same very short black hair, same red Christmas sweater with cream snowflakes and a green band, sleeves pushed up showing strong forearms, same dark blue trousers and brown boots`
- Mario: `same grey and white markings (grey head and back, white blaze, white chest and white paws), same pink nose, same pale green eyes, same tiny red knitted scarf, same very short fluffy stub tail, same round chubby cartoon cat shape`

Pose lines — emotion poses (do these first):

| File | Pose line |
| --- | --- |
| `silvia_cheer.jpg` | `jumping happily with both arms raised in the air, eyes closed, big joyful smile, curls bouncing` |
| `silvia_oops.jpg` | `a funny "oops" moment: shoulders up, both hands over her mouth, eyes wide, a little embarrassed smile` |
| `francesco_cheer.jpg` | `celebrating with both fists raised high, big open happy grin, one knee slightly lifted` |
| `francesco_oops.jpg` | `a funny "oops" moment: scratching the back of his head with one hand, shoulders up, eyes squeezed, a sheepish embarrassed grin` |
| `mario_proud.jpg` | `sitting tall and very proud, chest puffed out, chin up, eyes closed, a smug little smile, tail straight up` |
| `mario_guilty.jpg` | `sitting, looking guilty: ears flat back, eyes looking sideways, a sheepish smile, one front paw slightly raised` |
| `mario_rings.jpg` | `sitting proudly, holding in his mouth a tiny red velvet cushion with two small shiny golden wedding rings on it` |

Pose lines — action poses (wait until the mini game is prototyped; adjust if the gameplay changed):

| File | Pose line |
| --- | --- |
| `silvia_steer.jpg` | `sitting as if on a sled, seen from the side facing right, leaning to one side, holding a short rope with both hands, focused face. Do not draw the sled` |
| `francesco_push.jpg` | `seen from the side facing right, leaning far forward with both arms stretched out, pushing something very heavy with all his strength, cheeks puffed. Do not draw the object` |
| `francesco_hold.jpg` | `standing with legs apart, both arms forward at waist height gripping something firmly, teeth clenched in effort. Do not draw the object` |
| `francesco_dig.jpg` | `kneeling, digging with both hands like a dog, energetic and happy` |
| `francesco_crank.jpg` | `seen from the side facing right, turning a big crank handle with one strong arm, the other hand on his hip, determined grin. Draw only the small crank handle in his hand` |
| `mario_run.jpg` | `running fast, seen from the side facing right, all four paws stretched, scarf flying behind him` |
| `mario_lick.jpg` | `standing on his hind legs, front paws up, tongue out, trying to lick something above him, eyes half closed with delight` |

Check every pose: same face, hair, clothes and colours as the sheet (compare side by side); same size proportions; plain white background; only the objects mentioned; no text. If the character drifts, send: `Keep the character exactly like the attached character sheet: same face, same clothes, same colours, same proportions.`

### Prompt 6 — Kitchen background (`bg_torta.jpg`)

Start a new Gemini chat called "Winter Wood – Backgrounds" (use the same chat for all backgrounds). Attach `assets/raw/style_anchor.jpg`, then paste:

```
The attached image is the style reference for a cozy Christmas storybook game. Match its painting style exactly: hand-painted watercolour and gouache, soft edges, no hard black outlines, gentle painterly texture, the same warm and cold colours. Do not copy the scene, only the style.

Create a wide landscape background illustration in 16:9 format: the inside of a small cozy wooden cottage kitchen at night on Christmas Eve, seen straight from the front.

- Warm golden light from a hanging oil lamp and a few candles, soft shadows.
- On the right side of the back wall, a small window with wooden frames showing the dark blue night and gently falling snow outside.
- On the left side, a simple wooden shelf with a few jars, cups and a small Christmas garland. Maybe a few pine branches and red ribbons on the walls.
- A wooden floor in the bottom part of the picture.
- IMPORTANT: keep the whole middle of the picture calm and empty, with a plain softly lit wall and an empty floor, because a table and a wedding cake will be placed there later. No table, no furniture, no objects in the middle.
- Keep the details soft and simple, not busy, so that the game pieces stay easy to see on top.

No people, no animals, no text, no letters, no logos, no watermark.
```

Check:
- Same soft watercolour style as the style anchor, warm and cozy.
- The middle (wall and floor) is calm and empty: no table, no furniture there.
- The window with snow is on the right, the details are at the sides.
- No people, animals, text or watermark.

Follow-ups (one change at a time, same chat):
- Middle too busy: `Make the middle of the wall and the floor completely plain and empty, and move all objects to the far left and far right edges.`
- Too dark: `Make the kitchen a bit brighter and warmer, with more golden lamp light, but keep it night outside the window.`
- Too detailed: `Make it simpler and softer, more like a watercolour children's book illustration, with fewer details.`
- A table appeared: `Remove the table and any furniture from the middle; the floor in the middle must be empty.`

Save the best one as `bg_torta.jpg` and send it to Claude.

### Prompt 7 — Night sky background (`bg_dirigibile.jpg`) — done

Same "Winter Wood – Backgrounds" chat, attach `style_anchor.jpg`, paste:

```
Using the same painting style as before (the attached style reference), create a wide landscape background illustration in 16:9 format: a calm, magical night sky above a snowy forest on Christmas Eve.

- A deep blue night sky with soft painted clouds and many small twinkling stars.
- A soft glowing moon in the top right corner.
- At the very bottom, a band of snowy pine treetops seen from above, dark blue-green with white snow on the branches, and far away a few tiny warm cottage windows glowing orange between the trees.
- IMPORTANT: keep the whole middle and the upper-middle of the sky open and calm, with no big clouds, no moon and no objects there, because a little airship and rings of light will fly there later.
- Soft, simple, dreamy, not busy.

No people, no animals, no airship, no text, no letters, no logos, no watermark.
```

### Prompt 8 — Frozen clearing background (`bg_anelli.jpg`)

Same "Winter Wood – Backgrounds" chat, attach `style_anchor.jpg`, paste:

```
Using the same painting style as before (the attached style reference), create a wide landscape background illustration in 16:9 format: a quiet snowy clearing in the forest at blue hour on Christmas Eve, with a large frozen pond.

- The ground is soft white snow with gentle blue shadows.
- A large, smooth frozen pond with pale blue ice covers most of the left half of the picture.
- The right half is open, smooth, untouched snow.
- A few snowy pine trees only along the very top edge and in the far corners, small and soft, plus a few gently falling snowflakes.
- IMPORTANT: the whole picture must be very calm, pale and low in detail, with no objects in the middle of the left half or the right half, because game pieces (a grid of ice tiles on the left, glowing points on the right) will be placed on top and must stay easy to see.

No people, no animals, no footprints, no text, no letters, no logos, no watermark.
```

Check: pale and calm, the frozen pond on the left, open snow on the right, trees only at the edges, nothing in the middle of either half. If it's too busy: `Make it paler and simpler, with fewer trees, and keep both halves completely empty in the middle.`

### Prompt 9 — The airship (`airship.png`)

New Gemini chat called "Winter Wood – Objects" (use it for all objects). Attach `assets/raw/style_anchor.jpg` and `assets/raw/mario_sheet.jpg` (for the style only), then paste:

```
The attached images are the style reference for a cozy Christmas storybook game. Match their painting style exactly: hand-painted watercolour and gouache, soft edges, no hard black outlines, gentle painterly texture. Do not draw the scene or the cat, only use the style.

Draw one object: a small, cute, round airship (a little dirigible) seen exactly from the side, facing right.
- A soft cream-coloured balloon shaped like a plump egg, with one red stripe along the middle and a few patches and stitches, like it was hand-made.
- Below it, hanging from thin ropes, a small wooden gondola like a little boat, with a tiny lantern at the front.
- At the back (left side), a small wooden propeller.
- Warm, friendly and simple, like a toy from a picture book.

Only the airship, shown once, fully visible, on a plain pure white background. No people, no animals, no sky, no text, no letters, no logos, no watermark.
```

Check: side view facing right, propeller on the left, empty gondola (Mario is added in code), plain white background.

### Prompt 10 and 11 — The two nutcrackers (`schiaccianoci_1.jpg`, `schiaccianoci_2.jpg`)

Same "Winter Wood – Objects" chat. **One nutcracker per image.** Attach Adri's photo of the two ornaments (the photo stays out of the repo) and `assets/raw/mario_sheet.jpg` (for the style only), then paste — first for nutcracker 1:

```
The first attached photo shows two real wooden nutcracker Christmas ornaments. The second image is the style reference for a cozy Christmas storybook game: match its painting style exactly (hand-painted watercolour and gouache, soft edges, no hard black outlines, gentle painterly texture). Do not draw the cat.

Draw ONE cute nutcracker figure, based on the LEFT ornament in the photo: navy blue coat with gold buttons and gold shoulder pieces, red trousers, black boots, a gold crown with a red top and a small gold ball, a white beard and white hair, a black moustache, a round gold base, holding a gold sceptre. Make it a little rounder and cuter, like a picture-book toy, standing straight, facing the viewer.

Only the nutcracker, shown once, fully visible, on a plain pure white background. No text, no labels, no logos, no watermark.
```

Then, for nutcracker 2, the same prompt but replace the description with: `based on the RIGHT ornament in the photo: white coat with a pink front and light blue shoulder pieces and cuffs, white trousers, pink shoes, a tall gold hat with a white snowflake and a light blue band, a white beard and white hair, a black moustache, a round light blue base, holding a red-and-white swirl lollipop.`

Check: same size and style for both, standing straight, plain white background, the colours match the photo.

### Prompt 12 — The sled (`sled.jpg`)

Same "Winter Wood – Objects" chat. Attach `assets/raw/mario_sheet.jpg` (style only), paste:

```
Using the same painting style as the attached reference (hand-painted watercolour and gouache, soft edges, no hard black outlines, gentle painterly texture; do not draw the cat), draw one object: a small wooden Christmas sled seen from above and slightly from behind, as if we were flying just above it, pointing straight up (away from the viewer).
- Two curved wooden runners on the sides, a warm wooden seat.
- Piled on the sled, a small heap of wrapped wedding gifts in red, gold, cream and soft blue paper with ribbons and bows, tied down with a rope.
- A small red blanket hanging over the back.
Only the sled, shown once, fully visible, on a plain pure white background. No people, no animals, no snow, no text, no letters, no logos, no watermark.
```

Check: seen from above, pointing up (the sled travels up the screen in the game), gifts on it, plain white background.

### Prompt 13 — The 6 hidden pictures in one image (`icone_anelli.jpg`)

Same chat, attach `assets/raw/mario_sheet.jpg` (style only), paste:

```
Using the same painting style as the attached reference (hand-painted watercolour and gouache, soft edges, no hard black outlines; do not draw the cat), draw six separate small Christmas objects in one single row from left to right, all the same size, evenly spaced with plenty of empty white space between them, none touching:
1. a golden bell with a small red bow,
2. a golden five-pointed star,
3. a round red Christmas ornament ball with a gold cap,
4. a red-and-white striped candy cane,
5. a red knitted mitten with a white cuff,
6. two gold wedding rings interlocked, sparkling.
Plain pure white background. No text, no numbers, no labels, no logos, no watermark.
```

Check: exactly 6 objects, one row, well separated (Claude cuts them apart automatically), plain white background.

### Prompt 14 — Four small objects in one image (`oggetti.jpg`) — done

Cut with `tools/dividi_icone.py oggetti gift tree_obstacle lantern dark_cloud`.

### Prompt 15 — The kitchen table (`table.jpg`)

Same "Winter Wood – Objects" chat, attach `assets/raw/bg_torta.jpg` (so it matches the kitchen), paste:

```
Using the same painting style and the same warm wood colours as the attached kitchen (hand-painted watercolour and gouache, soft edges, no hard black outlines), draw one object: a simple, sturdy wooden kitchen table seen exactly from the front, at eye level, so we see only the front edge of the table top and its four legs. A wide, long table, about three times wider than it is tall, warm honey-coloured wood with soft grain. Nothing on the table.
Only the table, shown once, fully visible, on a plain pure white background. No tablecloth, no objects, no people, no animals, no text, no logos, no watermark.
```

Check: front view, nothing on it, wide and low, plain white background.

### Prompt 16 — App icon (`icon.jpg`)

Same chat, attach `assets/raw/mario_sheet.jpg`, paste:

```
Using exactly the same cat and painting style as the attached character sheet (same grey and white markings, pink nose, pale green eyes, red knitted scarf, soft watercolour, no hard black outlines), draw a square app icon: Mario's head and shoulders, smiling, looking at the viewer, filling most of the square, on a round soft background in warm golden lantern light with a few tiny snowflakes. Square format, the circle touching the edges. No text, no letters, no logos, no watermark.
```

Check: square, Mario recognisable, readable when very small. It is NOT cut out: Claude resizes it to the icon sizes iPhone needs.

### Mario's tail fix (done)

The real Mario has **a very short stub tail** (a few centimetres; it was cut when he was little). The first Mario pictures had a long tail, so all four (`mario_sheet`, `mario_proud`, `mario_guilty`, `mario_rings`) were edited in Gemini (chat "Winter Wood – Mario tail"), attaching each picture plus Adri's photo of Mario walking:

```
The first attached image is a finished illustration of Mario, a cartoon cat. The second image is a photo of the real Mario: look at his tail, it is a very short stub, only a few centimetres long, because it was cut when he was little.

Edit the first image: keep EVERYTHING exactly the same (the pose, the face, the expression, the scarf, the colours, the size, the watercolour style, the plain white background), and change ONLY the tail. Replace the long tail with a very short, fluffy grey stub tail, just a little round tuft, like in the photo. Remove the long tail completely and paint the white background or his body where it used to be.

No text, no logos, no watermark.
```

**Every new picture of Mario must have the short stub tail.** (The app icon shows only his head and shoulders.)

### Prompts 17–19 — Priority D pictures (done)

- **17 `francesco_piccone.jpg`** ("Winter Wood – Francesco" chat; attach `francesco_sheet.jpg` + `silvia_sheet.jpg`): the pose template for Francesco with the pose line `standing proudly, holding a small ice pickaxe with a wooden handle in both hands, raised and ready to strike, with a determined, cheerful grin` and "Do not draw any objects except the pickaxe".
- **18 `coppia_gondola.jpg`** (chat "Winter Wood – Couple"; attach both character sheets): both together, waist up, side by side, Silvia left and Francesco right, smiling and waving, plain white background, no boat.
- **19 `ending_scene.jpg`** (same chat; attach `style_anchor_lit.jpg` + the three character sheets): 16:9, the village at night with the tree fully lit and a gold star on top; Silvia and Francesco holding hands in front of the tree, Mario (short stub tail) at their feet; upper third calm for the title; characters fairly small in the lower part.

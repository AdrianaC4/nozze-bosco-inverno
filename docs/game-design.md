# Nozze a Natale — Game Design One-Pager

(Formerly "Nozze nel Bosco d'Inverno". **The Italian texts in the table below are first drafts: the current, reviewed texts are in `src/testi.js`.**)

## Overview

A short, cozy co-op game for two players on one iPhone. It is a wedding gift for Silvia and Francesco, who play it together.

| Item | Decision |
| --- | --- |
| Players | 2, same phone, landscape. Silvia owns the left half of the screen, Francesco the right half |
| Platform | iPhone, Safari web game (added to the Home Screen) |
| Engine | Phaser 3 (JavaScript) |
| Theme | Christmas plus a Ghibli-inspired look: original characters, soft watercolour, cozy forest spirits |
| Length | 4 mini games of 60–90 s each plus a finale, about 6–8 minutes in total |
| Language | All in-game text is in Italian |
| Deadline | None |

## Story

It is Christmas Eve, and Silvia and Francesco are getting married at midnight under the great tree of the snowy forest village. A winter wind has scattered everything the wedding needs: the gifts, the cake, the rings and the lantern lights.

Mario, their cat, appears as a glowing forest spirit to guide them. Each mini game brings one thing back. In the finale they light the great tree together and get married.

The humour comes from Mario being a real cat: he helps, but he is also the one who batted the rings into the snow.

## Characters

The two players have opposite strengths, so every mini game needs both of them.

| Character | Look | Ability | Controls |
| --- | --- | --- | --- |
| Silvia (left player) | Curly brown hair with a red ribbon, warm winter coat | Precision and organisation | Timing, aiming, matching, placing things exactly |
| Francesco (right player) | Very short black hair, visible muscles, Christmas sweater with the sleeves pushed up even in the snow | Strength | Power: tapping fast, holding, pushing, cranking |
| Mario (guide, not playable) | Grey-and-white cat: grey head and back, white face blaze, chest and paws, pink nose, pale green eyes, **a very short stub tail** (only a few centimetres: it was cut when he was little) (the real Mario is a darker charcoal grey with yellow-green eyes; the drawn version is softer and lighter, chosen by Adri). As a spirit he glows softly and wears a tiny red scarf | Forest spirit cat | Appears at the start of each mini game with a short tip, reacts to wins and fails, carries the rings in the finale |

Use the real photo of Mario as the art reference for his colours and markings.

## Controls and gesture rule

Rule: each player uses any one gesture family at most twice across the whole game, finale included. Each player only touches their own half of the screen.

Gesture families (one finger):

- **Tap**: a single timed tap, or rapid repeated tapping (counted as the same family)
- **Hold**: press and keep the finger down
- **Drag**: keep the finger down and move it to steer or position
- **Swipe**: a quick flick in one direction
- **Circle**: draw circles with the finger, like turning a crank

| Mini game | Silvia (left) | Francesco (right) |
| --- | --- | --- |
| 1. La Slitta dei Regali | Drag: steer the sled | Tap (rapid): push the sled uphill |
| 2. La Torta Nuziale | Tap (timed): drop each cake layer | Hold (◀ / ▶ strips at the screen edges): keep the cake balanced |
| 3. Gli Anelli Perduti | Tap: choose blocks and confirm pairs | Drag: join the points to break the ice |
| 4. Il Dirigibile delle Lanterne | Drag: fly left/right to the rings of light | Blow into the microphone: spin the propeller (height). Fallback: Circle |
| Finale: La Cerimonia | Hold | Hold |

Check: Silvia uses Drag 2, Tap 2, Hold 1. Francesco uses Tap 1, Hold 2, Drag 1, Circle 1. Both stay within the limit.

## Mini games

There are four mini games, each bringing back one thing for the wedding, and then the ceremony. They are played in this order and get slightly harder each time.

### 1. La Slitta dei Regali (the sled with the gifts)

- **Goal:** bring the sled full of wedding gifts down to the village before time runs out.
- **Francesco:** taps fast **on a big snowball at the top right** ("Tocca veloce / per spingere" on two lines) to push the sled. It slowly loses speed on its own, so his taps keep it fast. Faster means reaching the village sooner, but harder for Silvia to dodge.
- **Silvia:** drags to steer down the slope; her drag can **start anywhere below Francesco's snowball** (about the lower half of the screen, not marked; "Trascina per guidare" is written at the bottom), then the finger can move anywhere. (A yellow band along the bottom was tried first: too low, fingers hit the iPhone's home bar.) dodging trees and catching gifts.
- **Countdown:** 35 seconds to reach the village, otherwise try again. A chequered finish line ("Traguardo") scrolls in near the end.
- **Win:** reach the village in time with at least 5 gifts. Stars: 5–9 gifts = 1 star, 10–14 = 2 stars, 15+ = 3 stars.
- **Mario:** runs beside the sled. Every 8–10 seconds he dashes off and comes zigzagging down the slope from the top, chasing a snowflake ("Miao!"). Hitting him counts like hitting a tree (a life lost, the sled slows), but it's comic: he tumbles into a snowball and shakes the snow off ("Miaaao!!"). He no longer meows to warn about trees: his meow now means "Mario is coming".
- (The uphill push at the start was removed after the first iPhone playtest.)

### 2. La Torta Nuziale (the wedding cake)

- **Goal:** build a 5-layer cake and put the two nutcrackers on top.
- **Silvia:** a piece slides back and forth above the cake, and she taps to drop it (anywhere in the top part of the screen between Francesco's strips, or on her left half). Any overhang is cut off, so a bad drop makes the cake narrower. Each layer is smaller and slides faster than the one before.
- **The nutcrackers:** the last two pieces, like Adri's two ornaments (navy coat, red trousers, gold crown and sceptre; white and pink coat with light blue details, tall gold hat, lollipop). They go side by side on the top layer: if the second touches the first, the first falls off and both must be placed again. Very close without touching = "Perfetto!" with a little heart.
- **Francesco:** keeps the cake **balanced**, with his two controls on the **two edges of the screen**: a ◀ strip on the far left and a ▶ strip on the far right (awkward on purpose; an agreed exception to the left-half/right-half rule). A balance bar with a bubble and a green zone sits at the bottom in the middle. The cake keeps drifting to one side on its own (more as it grows); Mario's licks push it too. (Drops no longer push it: switched off after the November playtest to make Francesco's job easier; `COLPO` in the code.) **One finger only:** holding ◀ pushes the bubble left, ▶ right; holding both does nothing (the strips turn grey and "Un dito solo!" appears), so he has to move his finger back and forth between the two edges. Outside the green zone the cake leans, pieces slide faster, and a dropped piece slides with the tilt. **If the bubble stays at the end of the bar for a moment** (it flashes red as a warning, about 0.7 seconds), **the top piece falls off** (a nutcracker if there is one) and a life is lost, so the cake can't be finished without Francesco. Nothing can fall while the cake is still empty, and Silvia's next piece slides in straight away. (Earlier ideas, two-finger hold and ◀/▶ zones on his own half, were too easy.)
- **No timer.** 3 lives: a missed piece costs one.
- **Win:** the cake with both nutcrackers. Stars by "Perfetto!" drops (out of 6): 0–1 = 1 star, 2–3 = 2 stars, 4+ = 3 stars.
- **Mario:** sits next to the table. Every 7–11 seconds he either stretches to lick the frosting ("Slurp!", a small wobble) or jumps on the table ("Gioco anch'io!") and bats at the sliding piece about once a second, making it change direction, until someone taps him to shoo him off (or he gets bored after 5 swipes). The first time, he stays until tapped, and the hint "Toccate Mario per mandarlo via!" stays on screen until then. A tap on Mario doesn't count in the gesture rule and doesn't drop a piece.

### 3. Gli Anelli Perduti (the lost rings)

- **Goal:** find the two wedding rings that Mario batted into the snow, by finding all 6 pairs.
- **The grid (Silvia's half):** 12 ice blocks hiding 6 pairs: bell, star, ornament, candy cane, mitten, rings.
- **Silvia:** taps an ice block to choose it. **At most 2 pictures can be uncovered at a time.** A matching pair **turns green by itself** and stays open; a different pair freezes over again after **1 second**, so they must remember them.
- **Francesco (ice pickaxe):** as soon as a block is chosen, 3 numbered points appear on his half, one after another, in random places (different every time). He touches the first and **drags his finger through the others without lifting it**; a crack follows his finger. Lifting the finger early: "Non staccare il dito!" and new points. At the third point the ice shatters and the picture appears. (A finger already down that slides onto point 1 also counts.)
- **Countdown:** 60 seconds (a fair test robot needs about 31–42 s; the first idea, 40 s, would be too tight for people). No lives. **Stars** by time left: 15+ s = 3 stars, 7+ s = 2 stars.
- **Mario:** looks guilty on the start card and during the game, proud at the end. Every 9–13 seconds he gets up to mischief, alternating: (1) he walks onto the ice and swaps two frozen blocks with his paw ("Mario ha scambiato due tessere!"; the two blocks slide across each other, so the players can follow it); (2) he wanders around Francesco's side: if Francesco's finger runs into him while joining the points, Francesco starts again from point 1 (same points).
- (First version, replaced: Francesco swiped to dig snow layers.)

### 4. Il Dirigibile delle Lanterne (the lantern airship)

- **The airship faces left**, so its propeller is on the right, next to Francesco's breath gauge: he blows on it. A fixed ↕ arrow next to his gauge and a fixed ↔ arrow at the bottom middle remind each player of their job.
- **Goal:** bring the lantern lights back from the night sky: reach rings of light, each with a lantern inside. Each ring **appears somewhere in the sky** (far from the previous one sideways) and **stays about 5.5 seconds**, then fades away.
- **Francesco controls the height by blowing into the microphone** (`src/microfono.js`): the harder he blows, the faster the propeller spins and the higher the airship climbs; if he stops, it slowly sinks. A wind gauge on his side shows his breath. the phone asks for microphone permission when the flight starts (as in the version that always worked on the iPhone; asking during Mario's stroke was tried and reverted); if it fails, a "🎤 Prova il microfono" button lets them try again (in test mode a note shows the reason, the address, browser or Home Screen app, and the permission state); nothing is recorded, only the loudness of the low rumble (below 250 Hz) is read. **Fallback:** if the microphone isn't available (it needs https), isn't allowed, or gives no answer within 12 seconds, he draws circles on his half instead (a crank wheel appears), and circles always work too. The microphone goes off when the mini game is won.
- **Silvia controls left/right:** she drags to fly the airship across the sky towards each ring. While Francesco blows (he doesn't need the screen) she can drag **anywhere on the screen**; in the circles fallback, only on her left half.
- To get a lantern they must reach the right height and the right place before the ring fades, so they talk all the time. **Neither can do it alone** (tests: only Francesco = 0 lanterns, only Silvia = 3, both = 12–14). (First version, replaced: rings flew in from the right, so Francesco could win alone.)
- **Harder as it goes:** rings get smaller; gusts of wind ("Vento!") push the airship sideways; dark snow clouds drift across the sky from either side and make a lantern fall out if they fly into one.
- **Win:** 16 rings, at least 10 lanterns. Stars: 10–12 = 1, 13–14 = 2, 15–16 = 3. Fewer than 10: "Poche lanterne… Riproviamo!".
- **Mario:** rides in the gondola with Silvia and Francesco, but can't sit still: every 9–13 seconds he leans out to bat at a snowflake and his weight makes the airship dip suddenly ("Mario, stai fermo!"), so Francesco has to blow harder.
- **Music:** "corsa", its speed follows the propeller.

### Finale: La Cerimonia (the ceremony)

- Starts with a special card: only the title and Mario, who wants three strokes. Each stroke changes his pose and line: normal ("Accarezzami per continuare"), proud ("Un'altra carezza, già che ci siamo, dai!"), guilty ("L'ultima coccola, lo prometto!").
- Before: the village is dark, like night, with the characters in shadow. Both players press and hold their half at the same time. The lit, warm village appears from the bottom up behind a bright golden line with rising sparkles (about 8 seconds of holding together) until the great tree is fully lit. The tender "cerimonia" music plays loudly only while both are holding.
- If either player lets go, the lights flicker and slip down a little. You can't lose, it just takes longer.
- When the tree is fully lit: a golden flash, a burst of sparkles and a shining star on top of the tree; snow falls, bells ring, Mario brings the rings, Silvia and Francesco face each other, and a heart rises.
- The final screen reads "Appena Sposati! Silvia & Francesco" and "Buon Natale", with all three characters together in an animated scene (no real photo). After the animation, a painted postcard of the three under the lit tree fades in behind the texts.

## Game flow and rules

The game is forgiving: it's a gift, so the couple should always reach the ending.

1. Rotate screen: shown while the phone is in portrait ("Ruota il telefono").
2. Title screen: the title over the snowy village (no characters: they appear in the intro), and "Tocca per iniziare". Each finger makes a soft glow in that player's colour. The game only starts when **both** players touch their half at the same time (the text doesn't say so on purpose: a first small co-op discovery). It starts when they lift their fingers, which also unlocks sound on iPhone.
3. Intro: 4 short story scenes with the texts below, written letter by letter (tap to show the whole sentence, tap again to continue): the lit village with Silvia and Francesco; a sudden gust blowing the lanterns out and the wedding things away; Mario appearing as a glowing spirit with his guilty face; Mario cheering up and offering to help. These taps are menu taps and don't count in the gesture rule.
4. Mini games 1–4, each starting with a **start card**: the mini game's name, each player's instruction on their own half, and Mario in the middle with his tip. The game begins when someone **pets Mario** (a little swipe across him). Petting Mario is a start button, so it does **not** count in the gesture rule.
5. Result card after each mini game (`src/risultato.js`): "Bravissimi!", the stars popping in one by one, Mario (proud) with a line for that game, the couple's record if they did better before, then "Riprova" (play it again for more stars, straight in) or "Avanti". Losing never shows a result card: just a short message and an instant retry.
6. Finale and the "Appena Sposati!" ending.
7. Ending screen: total stars and a "Gioca ancora" button.

Rules:

- **Shared lives:** 3 snowflakes per mini game for the team. Losing all 3 restarts that mini game instantly, with no game over.
- **Stars:** 1 star for finishing, 2–3 for doing it well. Stars only add replay value, they never block progress.
- **Progress:** saved on the phone (`src/salvataggio.js`, localStorage with try/catch): the furthest mini game reached and the best stars of each. Coming back, after the two-finger start the title shows "Bentornati!" with the stars and two buttons: "Dall'inizio" (story and everything again, best stars kept) or "Continua" (straight to the mini game they'd reached). `?reset=1` in the address clears everything (do this before giving the gift). A map of the mini games may come later.

## Art and audio direction

The look is soft, warm and hand-made: Ghibli-inspired in mood, with no Ghibli characters or assets.

- **Palette:** cold blue and white snow against warm orange and gold lantern light, with red accents (Silvia's ribbon, Mario's scarf, ornaments).
- **Shapes:** round, simple characters with soft edges and no hard black outlines. Big heads and small bodies keep them cute even when the drawing is basic.
- **Effects:** gentle falling snow on every screen, sparkles on success, and a light screen shake on mistakes (iPhone web games can't vibrate).
- **Music:** original music composed in code (`src/musica.js`): music box, soft warm pads and a gentle bass, in the spirit of hand-made animated films (no copyrighted melodies). Tracks by mood: "neve" (slow dreamy waltz: title, story, start cards, after a win), "corsa" (bouncy: mini games; in La Slitta its speed follows the sled, 100–160 bpm, without changing pitch), "cerimonia" (tender: finale card and tree lighting, full volume only while both hold) and "festa" (joyful wedding waltz with little bells: wedding and ending).
- **Bell chime:** only at three moments: the two-player start on the title, leaving the story intro, and winning a mini game.
- **Sounds:** chimes for success, a soft thud for mistakes, a sleigh bell on the title screen, and a meow from Mario.
- **Prototype first:** build each mini game with plain shapes, and add the real art only once it's fun.

## In-game Italian text

These are the first-draft strings. Keep them all in one file (`src/testi.js`) so they're easy to edit later. Have a native speaker proofread before gifting.

| Where | Italian | Meaning |
| --- | --- | --- |
| Title | Nozze a Natale | A Wedding at Christmas |
| Title | Tocca per iniziare | Tap to begin |
| Portrait warning | Ruota il telefono in orizzontale | Turn your phone sideways |
| Intro 1 | È un bellissimo giorno d'inverno. Tra non molto Silvia e Francesco si sposano sotto il grande albero del paese. | It's a beautiful winter day. Soon Silvia and Francesco will marry under the village's great tree. |
| Intro 2 | Ma un ventaccio improvviso ha portato via tutto: i regali, la torta, gli anelli e le luci! | But a sudden nasty gust of wind blew everything away. |
| Intro 3 (Mario, guilty) | Miao! Prometto che non è colpa mia… | Meow! I promise it's not my fault… |
| Intro 4 (Mario) | Miao! Seguitemi, vi aiuto io! | Meow! Follow me, I'll help! |
| Start card | Accarezza Mario per iniziare | Pet Mario to start |
| Game 1 | Silvia: Trascina per guidare · Francesco: Tocca veloce per spingere! | Drag to steer · Tap fast to push |
| Game 1 | Tempo scaduto! Riproviamo! · Oh no! Riproviamo! · Pochi regali… Riproviamo! | Time's up! · Oh no! · Too few gifts… Let's try again! |
| Game 1 (Mario) | Attenti agli alberi! | Watch out for the trees! |
| Mario's mischief | Miaaao!! · Gioco anch'io! · Toccate Mario per mandarlo via! · Mario ha scambiato due tessere! · Attento a Mario! Ricomincia dal punto 1 · Mario, stai fermo! | (offended meow) · I'm playing too! · Tap Mario to shoo him away! · Mario swapped two tiles! · Watch out for Mario! Start again from point 1 · Mario, sit still! |
| Game 2 | Silvia: Tocca al momento giusto · Francesco: Tieni la torta dritta con un dito solo, premendo ◀ o ▶ ai bordi | Tap at the right moment · Keep the cake straight with one finger, pressing ◀ or ▶ at the edges |
| Game 2 | Perfetto! · Slurp! · Oh no, è caduto! · Attenzione! La torta pende troppo! · Un dito solo! | Perfect! · Slurp! · Oh no, it fell! · Careful! The cake leans too much! |
| Game 2 (Mario) | Mmm… posso assaggiare? | Mmm… can I have a taste? |
| Game 3 | Silvia: Scegli una tessera di ghiaccio, poi tocca le due uguali · Francesco: Rompi il ghiaccio unendo i punti senza staccare il dito! | Choose an ice tile, then tap the two matching ones · Break the ice joining the points without lifting your finger |
| Game 3 | Silvia, scegli una tessera! · Non staccare il dito! · Massimo due tessere alla volta! · Uguali! Silvia, toccale! · Gli anelli! | Choose a tile! · Don't lift your finger! · Max two tiles at a time! · Same! Silvia, tap them! · The rings! |
| Game 3 (Mario) | Ehm… forse ci ho giocato un po' io… | Um… I may have played with them a bit… |
| Game 4 | Silvia: Trascina per guidare il dirigibile · Francesco: Soffia nel microfono per far girare l'elica! | Drag to steer the airship · Blow into the microphone to spin the propeller |
| Game 4 | Consentite il microfono… · Niente microfono: Francesco, disegna cerchi! | Allow the microphone… · No microphone: Francesco, draw circles! |
| Game 4 | Vento! · Poche lanterne… Riproviamo! | Wind! · Too few lanterns… Let's try again! |
| Game 4 (Mario) | Che vista da quassù! | What a view from up here! |
| Finale | Tenete premuto insieme! | Hold together! |
| Result | Bravissimi! · Avanti · Riprova · Il vostro record: | Well done! · Next · Try again · Your record: |
| Result (Mario) | Che corsa! I regali sono tutti salvi! · Che torta meravigliosa… ora posso assaggiarla? · Visto? Li avete trovati! Non era poi colpa mia… · Le lanterne sono tornate! Che luce! | (one line per mini game, to review) |
| Title (coming back) | Bentornati! · Continua · Dall'inizio | Welcome back! · Continue · From the start |
| Ending | AUGURI · Silvia & Francesco · Buon Natale | Best wishes · Merry Christmas |
| Ending | Gioca ancora | Play again |

## Tech notes and build plan

It's a static Phaser 3 web game hosted for free on GitHub Pages. The couple gets one link and adds it to their iPhone Home Screen.

Tech notes:

- **Structure:** one Phaser scene per screen (Title, Intro, Slitta, Torta, Anelli, Dirigibile, Cerimonia, Fine), plus a shared `testi.js` for all the Italian text.
- **Screen:** landscape with a fixed design size (1280×720), scaled to fit (`Phaser.Scale.FIT`). Show the rotate message in portrait, because Safari can't lock the orientation.
- **Touch:** split the input by screen half: x < middle belongs to Silvia, x ≥ middle to Francesco. Enable multi-touch (at least 2 active pointers), because both play at the same time.
- **iPhone:** start audio only after the first tap. Add Home Screen meta tags and an icon so it opens full screen. Test on the real iPhone after every step.
- **Saving:** keep progress in localStorage, wrapped in try/catch.
- **Portrait:** while the phone is upright the game and the music are paused (countdowns don't run behind the rotate screen). The sound is woken up again at the next touch after the phone was locked.

Build plan (each step ends with a version that works on the phone):

1. Project setup: Phaser running on GitHub Pages, the split-screen touch test, and the rotate screen.
2. Title screen with "Tocca per iniziare" and sound.
3. Mini game 1 (La Slitta) with plain shapes.
4. Finale (La Cerimonia) with plain shapes. At this point you already have a complete, playable game.
5. Mini game 2 (La Torta).
6. Mini game 3 (Gli Anelli).
7. Mini game 4 (Il Dirigibile).
8. Intro panels, result cards, stars and saving.
9. Art pass: characters, Mario, backgrounds and snow.
10. Sound pass, playtest with friends, then give it to Silvia and Francesco.

Decisions:

- All art is generated with AI tools.
- No real photo at the end: the ending is an animated scene showing all three characters (Silvia, Francesco and Mario) under the lit tree.

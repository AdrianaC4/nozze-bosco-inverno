# Nozze nel Bosco d'Inverno — Game Design One-Pager

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
| Mario (guide, not playable) | Grey-and-white cat: grey head and back, white face blaze, chest and paws, pink nose, pale green eyes (the real Mario is a darker charcoal grey with yellow-green eyes; the drawn version is softer and lighter, chosen by Adri). As a spirit he glows softly and wears a tiny red scarf | Forest spirit cat | Appears at the start of each mini game with a short tip, reacts to wins and fails, carries the rings in the finale |

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
| 2. La Torta Nuziale | Tap (timed): drop each cake layer | Hold: keep the table steady |
| 3. Gli Anelli Perduti | Tap: pick matching pairs | Swipe: dig through the snow |
| 4. Il Dirigibile delle Lanterne | Drag: steer through the rings of light | Circle: crank the propeller |
| Finale: La Cerimonia | Hold | Hold |

Check: Silvia uses Drag 2, Tap 2, Hold 1. Francesco uses Tap 1, Hold 2, Swipe 1, Circle 1. Both stay within the limit.

## Mini games

There are four mini games, each bringing back one thing for the wedding, and then the ceremony. They are played in this order and get slightly harder each time.

### 1. La Slitta dei Regali (the sled with the gifts)

- **Goal:** bring the sled full of wedding gifts down to the village.
- **Francesco:** taps fast to push the heavy sled up the hill. A strength bar fills, and at the top the sled tips over the edge.
- **Silvia:** drags to steer down the slope, dodging trees and catching falling gifts.
- **Win:** reach the bottom with at least 5 gifts. More gifts mean more stars.
- **Mario:** runs alongside the sled and meows before a tree comes up.

### 2. La Torta Nuziale (the wedding cake)

- **Goal:** build a 5-layer cake.
- **Silvia:** a layer slides back and forth, and she taps to drop it exactly on the one below. Any overhang is trimmed off, so a bad drop makes the next layer smaller.
- **Francesco:** holds his side to keep the wobbly table steady. If he lets go, the table shakes and the sliding layer speeds up.
- **Win:** 5 layers plus the topper. Neater stacking means more stars.
- **Mario:** sits next to the table and tries to lick the frosting (a funny animation).

### 3. Gli Anelli Perduti (the lost rings)

- **Goal:** find the two wedding rings that Mario batted into the snow.
- **Francesco:** swipes to dig through snow blocks on a grid, which uncovers hidden tiles.
- **Silvia:** taps two uncovered tiles to match pairs (bell with bell, star with star). The rings are the last pair.
- **Co-op tension:** tiles freeze again after a few seconds, so Francesco must not dig faster than Silvia can match.
- **Win:** find the rings before time runs out.
- **Mario:** looks guilty at the start and proud at the end.

### 4. Il Dirigibile delle Lanterne (the lantern airship)

- **Goal:** bring the lantern lights back from the sky.
- **Francesco:** draws circles to crank the propeller. Faster cranking means more lift.
- **Silvia:** drags to steer left and right through rings of floating light.
- **Win:** collect 10 lights. Missing a ring costs nothing except the light.
- **Mario:** rides on the airship's bow with his scarf blowing in the wind.

### Finale: La Cerimonia (the ceremony)

- Both players press and hold their half at the same time. The great tree lights up from the bottom.
- If either player lets go, the lights flicker and slip down a little. You can't lose, it just takes longer.
- When the tree is fully lit: snow falls, bells ring, Mario brings the rings, Silvia and Francesco face each other, and a heart rises.
- The final screen reads "Appena Sposati! Silvia & Francesco" and "Buon Natale", with all three characters together in an animated scene (no real photo).

## Game flow and rules

The game is forgiving: it's a gift, so the couple should always reach the ending.

1. Rotate screen: shown while the phone is in portrait ("Ruota il telefono").
2. Title screen: the title, Silvia, Francesco and Mario in the snow, and "Tocca per iniziare" (this tap also unlocks sound on iPhone).
3. Intro: 3–4 short story panels with Mario's lines.
4. Mini games 1–4, each starting with a 3-second card showing both players' gestures.
5. Result card after each mini game: 1–3 stars, then "Avanti" or "Riprova".
6. Finale and the "Appena Sposati!" ending.
7. Ending screen: total stars and a "Gioca ancora" button.

Rules:

- **Shared lives:** 3 snowflakes per mini game for the team. Losing all 3 restarts that mini game instantly, with no game over.
- **Stars:** 1 star for finishing, 2–3 for doing it well. Stars only add replay value, they never block progress.
- **Progress:** saved on the phone, so closing Safari doesn't lose the mini games already finished.

## Art and audio direction

The look is soft, warm and hand-made: Ghibli-inspired in mood, with no Ghibli characters or assets.

- **Palette:** cold blue and white snow against warm orange and gold lantern light, with red accents (Silvia's ribbon, Mario's scarf, ornaments).
- **Shapes:** round, simple characters with soft edges and no hard black outlines. Big heads and small bodies keep them cute even when the drawing is basic.
- **Effects:** gentle falling snow on every screen, sparkles on success, and a light screen shake on mistakes (iPhone web games can't vibrate).
- **Music:** soft piano or music-box Christmas tunes from a royalty-free source, one looping track per scene.
- **Sounds:** chimes for success, a soft thud for mistakes, a sleigh bell on the title screen, and a meow from Mario.
- **Prototype first:** build each mini game with plain shapes, and add the real art only once it's fun.

## In-game Italian text

These are the first-draft strings. Keep them all in one file (`src/testi.js`) so they're easy to edit later. Have a native speaker proofread before gifting.

| Where | Italian | Meaning |
| --- | --- | --- |
| Title | Nozze nel Bosco d'Inverno | A Wedding in Winter Wood |
| Title | Tocca per iniziare | Tap to begin |
| Portrait warning | Ruota il telefono in orizzontale | Turn your phone sideways |
| Intro 1 | È la Vigilia di Natale. A mezzanotte Silvia e Francesco si sposano sotto il grande albero del bosco. | It's Christmas Eve. At midnight Silvia and Francesco marry under the great tree. |
| Intro 2 | Ma il vento d'inverno ha portato via tutto: i regali, la torta, gli anelli e le luci! | But the winter wind blew everything away. |
| Intro 3 (Mario) | Miao! Seguitemi, vi aiuto io! | Meow! Follow me, I'll help! |
| Game 1 | Silvia: Trascina per guidare · Francesco: Tocca veloce per spingere! | Drag to steer · Tap fast to push |
| Game 1 (Mario) | Attenti agli alberi! | Watch out for the trees! |
| Game 2 | Silvia: Tocca al momento giusto · Francesco: Tieni premuto per tenere fermo il tavolo | Tap at the right moment · Hold to keep the table still |
| Game 2 (Mario) | Mmm… posso assaggiare? | Mmm… can I have a taste? |
| Game 3 | Silvia: Tocca due tessere uguali · Francesco: Scorri per scavare | Tap two matching tiles · Swipe to dig |
| Game 3 (Mario) | Ehm… forse ci ho giocato un po' io… | Um… I may have played with them a bit… |
| Game 4 | Silvia: Trascina per guidare · Francesco: Disegna cerchi per far girare l'elica | Drag to steer · Draw circles to spin the propeller |
| Game 4 (Mario) | Che vista da quassù! | What a view from up here! |
| Finale | Tenete premuto insieme! | Hold together! |
| Result | Bravissimi! · Avanti · Riprova | Well done! · Next · Try again |
| Ending | Appena Sposati! Silvia & Francesco · Buon Natale | Just married! · Merry Christmas |
| Ending | Gioca ancora | Play again |

## Tech notes and build plan

It's a static Phaser 3 web game hosted for free on GitHub Pages. The couple gets one link and adds it to their iPhone Home Screen.

Tech notes:

- **Structure:** one Phaser scene per screen (Title, Intro, Slitta, Torta, Anelli, Dirigibile, Cerimonia, Fine), plus a shared `testi.js` for all the Italian text.
- **Screen:** landscape with a fixed design size (1280×720), scaled to fit (`Phaser.Scale.FIT`). Show the rotate message in portrait, because Safari can't lock the orientation.
- **Touch:** split the input by screen half: x < middle belongs to Silvia, x ≥ middle to Francesco. Enable multi-touch (at least 2 active pointers), because both play at the same time.
- **iPhone:** start audio only after the first tap. Add Home Screen meta tags and an icon so it opens full screen. Test on the real iPhone after every step.
- **Saving:** keep progress in localStorage, wrapped in try/catch.

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

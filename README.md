# Nozze a Natale

A small cooperative Christmas game for two players on one iPhone — a wedding gift for Silvia & Francesco (with Mario the cat).

- Game design: `docs/game-design.md`
- Art workflow and prompts: `docs/art-guide.md`
- Project notes for Claude Code: `CLAUDE.md`

Built with Phaser 3. Played in iPhone Safari, added to the Home Screen.

## Try it on an iPhone (local)

1. In the project folder run `python3 tools/server.py` (a no-cache server, so the iPhone always gets the latest files).
2. Find the Mac's Wi-Fi address with `ipconfig getifaddr en0`.
3. On the iPhone, on the same Wi-Fi, open `http://<address>:8000` in Safari.

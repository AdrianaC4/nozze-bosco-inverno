"""
Small local web server for testing the game on the iPhone over home Wi-Fi.

It works like `python3 -m http.server`, but tells Safari never to keep old copies
of the files, so the iPhone always gets the latest version after a reload.

How to run (from the project folder):
    python3 tools/server.py            # port 8000
Then on the iPhone (same Wi-Fi) open http://<the Mac's address>:8000
(find the address with: ipconfig getifaddr en0)
"""

import functools
import http.server
import sys
from pathlib import Path

CARTELLA_PROGETTO = Path(__file__).resolve().parent.parent


class SenzaCopie(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        self.send_header("Expires", "0")
        super().end_headers()


def main():
    porta = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    gestore = functools.partial(SenzaCopie, directory=str(CARTELLA_PROGETTO))
    with http.server.ThreadingHTTPServer(("0.0.0.0", porta), gestore) as server:
        print(f"Serving the game on port {porta} (no caching). Stop with Ctrl+C.")
        server.serve_forever()


if __name__ == "__main__":
    main()

"""
Small local web server for testing the game on the iPhone over home Wi-Fi.

It works like `python3 -m http.server`, but tells Safari never to keep old copies
of the files, so the iPhone always gets the latest version after a reload.

How to run (from the project folder):
    python3 tools/server.py            # port 8000
Then on the iPhone (same Wi-Fi) open http://<the Mac's address>:8000
(find the address with: ipconfig getifaddr en0)

Secure version, needed for the MICROPHONE (blowing in Il Dirigibile), which iPhone only allows on https:
    python3 tools/server.py 8443 --https
Then open https://<the Mac's address>:8443 and accept the certificate warning once
("Mostra dettagli" -> "visita questo sito web"). It uses the self-made certificate in .cert/
(make it with: openssl req -x509 -newkey rsa:2048 -nodes -keyout .cert/key.pem -out .cert/cert.pem
 -days 365 -subj "/CN=Nozze nel Bosco (test)" -addext "subjectAltName=IP:<the Mac's address>,DNS:localhost").
"""

import functools
import http.server
import ssl
import sys
from pathlib import Path

CARTELLA_PROGETTO = Path(__file__).resolve().parent.parent


class SenzaCopie(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        self.send_header("Expires", "0")
        super().end_headers()


def main():
    argomenti = [a for a in sys.argv[1:] if a != "--https"]
    sicuro = "--https" in sys.argv
    porta = int(argomenti[0]) if argomenti else 8000
    gestore = functools.partial(SenzaCopie, directory=str(CARTELLA_PROGETTO))
    with http.server.ThreadingHTTPServer(("0.0.0.0", porta), gestore) as server:
        if sicuro:
            contesto = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
            contesto.load_cert_chain(CARTELLA_PROGETTO / ".cert" / "cert.pem", CARTELLA_PROGETTO / ".cert" / "key.pem")
            server.socket = contesto.wrap_socket(server.socket, server_side=True)
        print(f"Serving the game on port {porta} ({'https' if sicuro else 'http'}, no caching). Stop with Ctrl+C.")
        server.serve_forever()


if __name__ == "__main__":
    main()

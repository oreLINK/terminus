# Serveur local de développement (npm run serve) : comme `python3 -m http.server`, mais sans cache.
# Sans en-tête Cache-Control, le navigateur garde les modules JS plusieurs heures et exécute
# l'ancien code après une modification.

import http.server
import sys


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    http.server.test(HandlerClass=NoCacheHandler, port=port)

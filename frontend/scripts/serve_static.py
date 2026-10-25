"""Quiet loopback-only static export server for browser tests."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


class Handler(SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

    def copyfile(self, source, outputfile):
        try:
            super().copyfile(source, outputfile)
        except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError):
            # Browser navigation can cancel asset prefetches. Other failures
            # still propagate; this does not hide HTTP errors or test assertions.
            pass


ThreadingHTTPServer(("127.0.0.1", 3011), partial(Handler, directory="out")).serve_forever()

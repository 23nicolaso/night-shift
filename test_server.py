import unittest
import server
import json
import threading
from urllib.request import urlopen, Request
from urllib.error import HTTPError

class Decisions(unittest.TestCase):
    def test_fallback(self):
        original = server.router
        server.router = None
        try:
            self.assertEqual(server.decide({'answer': 'I am repairing the network'})['choice'], 'question')
            self.assertEqual(server.decide({'answer': 'I am here to steal'})['choice'], 'alert')
            self.assertEqual(server.decide({'answer': 'Just hanging out'})['choice'], 'question')
            self.assertEqual(server.decide({'answer': 'hacking the network', 'severity': 2})['choice'], 'question')
            valid = {'answer': 'IVES sent me for network diagnostics under work order N-123', 'ticket': 'N-123', 'supervisor': 'IVES', 'badge': True}
            self.assertEqual(server.decide(valid)['choice'], 'release')
            self.assertEqual(server.decide(dict(valid, strikes=2))['choice'], 'release')
            self.assertEqual(server.decide({'answer': 'maintenance', 'attempt': 1})['choice'], 'alert')
        finally:
            server.router = original

    def test_http(self):
        host = server.ThreadingHTTPServer(('127.0.0.1', 0), server.Handler)
        worker = threading.Thread(target=host.serve_forever, daemon=True)
        worker.start()
        base = f'http://127.0.0.1:{host.server_port}'
        try:
            with urlopen(base + '/health') as response:
                self.assertIn('engine', json.load(response))
            with urlopen(base + '/') as response:
                self.assertIn(b'NIGHT SHIFT', response.read())
            # Every script referenced by the page must be served for startup to complete.
            import re
            with urlopen(base + '/') as response:
                scripts = re.findall(rb'<script src="([^"]+)"', response.read())
            for script in scripts:
                with self.subTest(script=script):
                    with urlopen(base + '/' + script.decode()) as response:
                        self.assertEqual(response.status, 200)
                        self.assertTrue(response.read())
            request = Request(base + '/decision', data=json.dumps({'answer': 'network maintenance'}).encode(), headers={'Content-Type': 'application/json'})
            with urlopen(request) as response:
                self.assertEqual(json.load(response)['choice'], 'question')
            request = Request(base + '/decision', data=json.dumps({'answer': 'IVES asked me to repair the network switch.', 'supervisor': 'IVES', 'ticket': 'N-123', 'badge': True, 'strikes': 12}).encode(), headers={'Content-Type': 'application/json'})
            with urlopen(request) as response:
                self.assertEqual(json.load(response)['choice'], 'release')
            with self.assertRaises(HTTPError) as error:
                urlopen(base + '/server.py')
            self.assertEqual(error.exception.code, 404)
            with self.assertRaises(HTTPError) as error:
                urlopen(Request(base + '/decision', data=b'{"answer": 12}'))
            self.assertEqual(error.exception.code, 400)
        finally:
            host.shutdown()
            host.server_close()

if __name__ == '__main__':
    unittest.main()

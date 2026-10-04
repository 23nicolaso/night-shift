import json
from pathlib import Path
import unittest
import server
from security_policy import policy

BASE = {'ticket': 'N-123', 'supervisor': 'IVES', 'badge': False, 'severity': 1, 'attempt': 0, 'strikes': 0}
CASES = json.loads((Path(__file__).parent / 'guard_cases.json').read_text(encoding='utf-8'))

class GuardStories(unittest.TestCase):
    def test_fair_stories_and_hard_evidence(self):
        for case in CASES:
            with self.subTest(case=case['name']):
                data = dict(BASE, **case['data'])
                # Model uncertainty or a false-negative must not veto corroborated cover.
                for model_choice in ('release', 'question', 'alert'):
                    self.assertEqual(policy(data, model_choice), case['expected'])

    def test_actual_server_decisions(self):
        for case in CASES:
            with self.subTest(case=case['name']):
                self.assertEqual(server.decide(dict(BASE, **case['data']))['choice'], case['expected'])

if __name__ == '__main__':
    import sys
    if '--live' in sys.argv:
        sys.argv.remove('--live')
        server.load_model()
        if server.router is None:
            raise RuntimeError('Live Laya verification could not load the model')
    unittest.main()

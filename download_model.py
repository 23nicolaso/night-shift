import os
from pathlib import Path
os.environ['HF_HOME'] = str(Path(__file__).resolve().parent / 'models')
from laya import Router
from server import QUESTIONS
router = Router(device='cpu', max_loaded=1)
result = router.predict('An IT contractor is repairing the network under a scheduled work order.', QUESTIONS, model='english')
print(result)

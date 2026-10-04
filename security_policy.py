"""A fair explanation can pass; actual contradictions and restricted evidence cannot."""
import re

def policy(data, model_choice='question'):
    text = (str(data.get('previous', '')) + ' ' + data.get('answer', '')).lower()
    ticket = str(data.get('ticket', '___')).lower()
    supervisor = str(data.get('supervisor', '___')).lower()
    task = re.search(r'network|switch|maintenance|repair|diagnostic|work order|inspection|wifi|wi-fi|router|reboot|printer|cable|computer', text)
    detail = re.search(r'switch|diagnostic|inspection|wifi|wi-fi|router|reboot|printer|cable|computer|repair', text)
    authority = re.search(r'reception|help\s?desk|assigned|authorized|authorised|sent me|asked me|supervisor|ticket|work order', text)
    verified = ticket in text or supervisor in text
    both = ticket in text and supervisor in text
    lost = re.search(r'lost|wrong (floor|room)|looking for|trying to find', text) and re.search(r'lift|elevator|exit|reception|bathroom|restroom', text)
    admitted = re.sub(r"\b(not|never|no|didn't|did not|am not|wasn't)\s+(here to\s+)?(steal\w*|spy\w*|kill\w*|shoot\w*|bomb\w*)", '', text)
    admitted = re.sub(r'\bkill(?:ing)?\s+(?:(?:a|the)\s+)?(?:stuck\s+)?(?:printer\s+(?:job|queue)|process|task|job|service|thread|app)\b', '', admitted)
    crime = re.search(r'\b(steal|stealing|stole|spy|spying|kill|killing|shoot|shooting|bomb)\b', admitted)
    wrong_ticket = any(t != ticket for t in re.findall(r'\bn-\d{3}\b', text))
    wrong_boss = any(n != supervisor and re.search(r'\b' + n + r'\b', text) for n in ('mercer', 'ives', 'sato'))
    if crime or wrong_ticket or wrong_boss or data.get('severity', 1) >= 3:
        return 'alert'
    if data.get('severity', 1) >= 2:
        if task and verified and (data.get('badge', False) or both):
            return 'release'
        return 'alert' if data.get('attempt', 0) >= 1 else 'question'
    if lost or task and (verified or data.get('badge', False) and detail or detail and authority or model_choice == 'release' and authority):
        return 'release'
    return 'alert' if data.get('attempt', 0) >= 1 else 'question'

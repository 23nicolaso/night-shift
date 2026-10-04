// Matching JS/Python evidence rules. The model advises; corroborated stories have a fair pass path.
const Security={
 policy(data,modelChoice='question'){
  const text=[data.previous||'',data.answer||''].join(' ').toLowerCase(),ticket=(data.ticket||'___').toLowerCase(),supervisor=(data.supervisor||'___').toLowerCase();
  const task=/network|switch|maintenance|repair|diagnostic|work order|inspection|wifi|wi-fi|router|reboot|printer|cable|computer/.test(text),detail=/switch|diagnostic|inspection|wifi|wi-fi|router|reboot|printer|cable|computer|repair/.test(text),authority=/reception|help\s?desk|assigned|authorized|authorised|sent me|asked me|supervisor|ticket|work order/.test(text),verified=text.includes(ticket)||text.includes(supervisor),both=text.includes(ticket)&&text.includes(supervisor);
  const lost=/lost|wrong (floor|room)|looking for|trying to find/.test(text)&&/lift|elevator|exit|reception|bathroom|restroom/.test(text);
  const admitted=text.replace(/\b(not|never|no|didn't|did not|am not|wasn't)\s+(here to\s+)?(steal\w*|spy\w*|kill\w*|shoot\w*|bomb\w*)/g,'').replace(/\bkill(?:ing)?\s+(?:(?:a|the)\s+)?(?:stuck\s+)?(?:printer\s+(?:job|queue)|process|task|job|service|thread|app)\b/g,'');
  const crime=/\b(steal|stealing|stole|spy|spying|kill|killing|shoot|shooting|bomb)\b/.test(admitted);
  const namedTickets=text.match(/\bn-\d{3}\b/g)||[],wrongTicket=namedTickets.some(t=>t!==ticket),wrongBoss=['mercer','ives','sato'].some(n=>n!==supervisor&&new RegExp('\\b'+n+'\\b').test(text));
  if(crime||wrongTicket||wrongBoss||(data.severity||1)>=3)return 'alert';
  if((data.severity||1)>=2){if(task&&verified&&(data.badge||both))return 'release';return data.attempt>=1?'alert':'question'}
  if(lost||task&&(verified||data.badge&&detail||detail&&authority||modelChoice==='release'&&authority))return 'release';
  // An uncertain model cannot veto an observed match; vague stories need a follow-up.
  return data.attempt>=1?'alert':'question';
 }
};
if(typeof module!=='undefined')module.exports=Security;

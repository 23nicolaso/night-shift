from pathlib import Path
p=Path('game.js');s=p.read_text(encoding='utf-8').replace("if(near(world.target)){if(!firewall){log('Firewall locked. Override the green power-control console first.');return}hack('archive');return}", "if(near(world.target)){hack('archive');return}")
s=s.replace("log('RESTRICTED ARCHIVE / cyan keycard required. Being caught inside triggers lockdown.');return", "RoomActions.notice('KEYCARD REQUIRED','Restricted archive door','Find the cyan access card to open this door. The room is off limits: being caught inside causes lockdown.');return")
s=s.replace("else log('Complete your assigned objectives before extracting.')", "else RoomActions.notice('MISSION INCOMPLETE','Service lift','Next objective: '+missionLabel(world.missionSteps.find(step=>!missionStepDone(step)))+'. Complete your assignment, then return to this lift.')")
p.write_text(s,encoding='utf-8')
p=Path('test_game.js');s=p.read_text(encoding='utf-8').replace("if(mode==='hack')throw Error('firewall was bypassed without power console');firewall=true;", "if(mode!=='inspect'||!$('modalText').textContent.includes('POWER CONTROL'))throw Error('archive lock feedback missing');dialog.close();mode='play';firewall=true;")
# Early lift now opens feedback rather than silently logging.
s=s.replace("if(mode==='end')throw Error('early extraction');", "if(mode==='end')throw Error('early extraction');dialog.close();mode='play';")
# Door key test must close the new feedback panel before trying again.
s=s.replace("card=true;interact();", "dialog.close();mode='play';card=true;interact();")
p.write_text(s,encoding='utf-8')
p=Path('browser_smoke.py');s=p.read_text(encoding='utf-8').replace("assert page.evaluate(\"mode==='play' && !firewall\")", "assert page.evaluate(\"mode==='inspect' && !firewall\")\n        assert 'POWER CONTROL' in page.locator('#modalText').inner_text()\n        page.get_by_role('button',name='Continue',exact=True).click()")
p.write_text(s,encoding='utf-8')

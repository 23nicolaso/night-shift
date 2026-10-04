import threading
from playwright.sync_api import sync_playwright
import server

host=server.ThreadingHTTPServer(('127.0.0.1',0),server.Handler)
threading.Thread(target=host.serve_forever,daemon=True).start()
try:
 with sync_playwright() as pw:
  browser=pw.chromium.launch(channel='msedge',headless=True)
  page=browser.new_page(viewport={'width':1440,'height':1080})
  errors=[]
  page.on('pageerror',lambda error:errors.append(str(error)))
  page.add_init_script("localStorage.setItem('night-shift-tutorial-seen','1');window.voiceCalls=[];window.voiceCancels=0;Object.defineProperty(window,'speechSynthesis',{value:{speak(u){voiceCalls.push(u.text)},cancel(){voiceCancels++}}})")
  page.goto(f'http://127.0.0.1:{host.server_port}')
  page.locator('#briefing').wait_for(state='visible')
  assert page.evaluate("mode==='briefing' && getComputedStyle(document.getElementById('briefing')).animationName==='briefingFade'")
  page.locator('#briefingVoice').click()
  assert page.evaluate('voiceCalls.length>0 && voiceCalls.at(-1).includes(world.missionTitle.toLowerCase())')
  page.screenshot(path='briefing-preview.png')
  page.locator('#briefingBegin').click()
  assert page.evaluate("mode==='play' && document.getElementById('briefing').hidden && voiceCancels>0")
  page.locator('#new').click()
  assert page.evaluate("mode==='briefing' && document.getElementById('briefingText').textContent===Briefing.text()")
  page.locator('#briefingMute').click()
  assert page.evaluate('!AudioFX.enabled')
  count=page.evaluate('voiceCalls.length')
  page.locator('#briefingVoice').click()
  assert page.evaluate('voiceCalls.length')==count
  page.locator('#briefingVoice').focus()
  page.keyboard.press('Enter')
  assert page.evaluate("mode==='briefing'")
  page.locator('#briefingBegin').focus()
  page.keyboard.press('Enter')
  assert page.evaluate("mode==='play'")
  page.evaluate('''() => {
   const sheet=document.createElement('canvas');sheet.width=800;sheet.height=360;sheet.id='spriteSheet';sheet.style.cssText='position:fixed;left:0;top:0;z-index:100';document.body.append(sheet);
   const c=sheet.getContext('2d');c.fillStyle='#172633';c.fillRect(0,0,800,360);c.imageSmoothingEnabled=false;
   for(let row=0;row<2;row++)for(let direction=0;direction<4;direction++)for(let frame=0;frame<4;frame++){
    c.save();c.translate(direction*200+frame*46+25,row*170+75);c.scale(3,3);Art.person(c,{x:0,y:0,angle:direction*Math.PI/2},!!row,(frame+.1)/12,true);c.restore();
   }
   c.fillStyle='#bce8d9';c.font='14px monospace';for(let d=0;d<4;d++){c.fillText(['RIGHT','DOWN','LEFT','UP'][d],d*200+12,135);c.fillText(['ROBOT RIGHT','ROBOT DOWN','ROBOT LEFT','ROBOT UP'][d],d*200+12,305)}
  }''')
  page.locator('#spriteSheet').screenshot(path='sprites-preview.png')
  assert not errors,errors
  browser.close()
 print('PASS: Edge fade-in, accurate mission text, browser speech wiring, cancellation, mute, retry briefing and keyboard start.')
finally:
 host.shutdown()

import threading
from pathlib import Path
from playwright.sync_api import sync_playwright
import server

host=server.ThreadingHTTPServer(('127.0.0.1',0),server.Handler)
threading.Thread(target=host.serve_forever,daemon=True).start()
try:
 with sync_playwright() as pw:
  browser=pw.chromium.launch(channel='msedge',headless=True)
  page=browser.new_page(viewport={'width':1440,'height':1000})
  errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto(f'http://127.0.0.1:{host.server_port}')
  page.locator('#briefingBegin').click()
  page.locator('#tutorialSkip').click()
  for layout in ['winding','branches','loops','courtyards','switchbacks']:
   page.evaluate("layout=>{reset('browser-'+layout,false);world=World.generate('browser-'+layout,layout);p={...world.start,angle:0};world.guards=[];world.cameras=[];mode='play';draw()}",layout)
   page.wait_for_timeout(100)
   assert page.evaluate("Textures.ready && Number.isFinite(p.x)")
  page.evaluate("()=>{reset('password-ui',false);card=true;const gate=world.doors.find(d=>d.keyRequired);gate.password='1234';world.notes=[{read:true,code:'1234'}];passwordDoor(gate)}")
  page.locator('#modal input').fill('9999')
  page.get_by_role('button',name='Unlock',exact=True).click()
  assert 'Incorrect code' in page.locator('#modalText').inner_text()
  page.locator('#modal input').fill('1234')
  page.get_by_role('button',name='Unlock',exact=True).click()
  assert page.evaluate("mode==='play' && world.doors.find(d=>d.keyRequired).authorized")
  page.evaluate("()=>{reset('preview-variation',false);world=World.generate('preview-variation','courtyards');const r=world.rooms.find(r=>r.laserHall)||world.rooms[0];p={x:r.cx,y:r.cy,angle:0};world.guards=[];world.cameras=[];mode='play';draw()}")
  Path('test-artifacts').mkdir(exist_ok=True)
  page.screenshot(path='test-artifacts/variation-preview.png')
  page.locator('#new').click()
  assert page.evaluate("mode==='briefing'")
  assert not errors,errors
  browser.close()
 print('PASS: Edge renders five topology families with loaded textures, password UI rejects/accepts codes, New assignment works, no JavaScript errors.')
finally:
 host.shutdown()
 host.server_close()

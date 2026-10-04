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
  page.goto(f'http://127.0.0.1:{host.server_port}')
  page.evaluate("reset('compact-preview',false);world.guards=[];world.lasers=[];const corridor=world.cameras.find(c=>c.corridor);p={...corridor.safeSpot,angle:0}")
  page.wait_for_function('Textures.ready')
  page.evaluate("RoomActions.reward(world.stations.find(s=>s.effect==='map'));draw()")
  assert page.evaluate('directoryKnown && !currentRoom')
  page.screenshot(path='directory-preview.png')
  page.evaluate('''() => {
   const sheet=document.createElement('canvas');sheet.id='layoutSheet';sheet.width=world.w*12;sheet.height=world.h*12;sheet.style.cssText='position:fixed;left:0;top:0;z-index:100';document.body.append(sheet);
   const c=sheet.getContext('2d');c.imageSmoothingEnabled=false;c.fillStyle='#091520';c.fillRect(0,0,sheet.width,sheet.height);c.scale(.6,.6);
   for(let y=0;y<world.h;y++)for(let x=0;x<world.w;x++)if(world.grid[y][x])Art.tile(c,x*20,y*20,world.grid[y][x],x*7+y*13,World.roomAt(world,{x:x+.5,y:y+.5})?.type||'corridor');
   for(const room of world.rooms){Art.room(c,room);Art.roomIcon(c,roomIconType(room),room.cx*20,room.cy*20,24,room.restricted)}
   for(const o of world.cover)Art.cover(c,o);for(const camera of world.cameras)Art.object(c,camera,'camera',true);
  }''')
  page.locator('#layoutSheet').screenshot(path='layout-preview.png')
  assert not errors,errors
  browser.close()
 print('PASS: real Edge directory room icons, wide compact layout and camera cover render without JS errors.')
finally:
 host.shutdown()

from pathlib import Path
import threading
from playwright.sync_api import sync_playwright
import server

host = server.ThreadingHTTPServer(('127.0.0.1', 0), server.Handler)
threading.Thread(target=host.serve_forever, daemon=True).start()
errors = []

def match_circuits(page):
    kind = page.evaluate('MiniGames.active.state.type')
    board = page.locator('.puzzle-board').bounding_box()
    def point(x, y):
        return board['x'] + x * board['width'] / 360, board['y'] + y * board['height'] / 340
    if kind == 'cables':
        order = page.evaluate('MiniGames.active.state.order')
        for index in range(4):
            page.mouse.move(*point(65, 65 + index * 65))
            page.mouse.down()
            page.mouse.move(*point(295, 65 + order.index(index) * 65), steps=12)
            page.mouse.up()
    elif kind == 'breaker':
        for stage in range(3):
            page.wait_for_function('MiniGames.active && Math.abs(MiniGames.active.state.needle-MiniGames.active.state.center)<MiniGames.active.state.width*.18 && MiniGames.active.state.time-MiniGames.active.state.lastHit>.3', timeout=10000)
            page.keyboard.press('Space')
    elif kind == 'route':
        solution = page.evaluate('MiniGames.active.state.solution')
        for index, mask in solution.items():
            index = int(index)
            for turn in range(4):
                if page.evaluate('mode!=="hack"'):
                    return
                if page.evaluate(f'MiniGames.active.state.masks[{index}]') == mask:
                    break
                page.mouse.click(*point(84 + index % 4 * 64, 70 + index // 4 * 64))
    else:
        target = page.evaluate('MiniGames.active.state.target')
        page.mouse.move(*point(160, 65 + target * 66))
        page.mouse.down()
        page.mouse.move(*point(275, 65 + target * 66), steps=15)
        page.mouse.up()
    page.wait_for_function('mode!=="hack"')

try:
    with sync_playwright() as pw:
        browser = pw.chromium.launch(channel='msedge', headless=True)
        page = browser.new_page(viewport={'width': 1440, 'height': 1080})
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.goto(f'http://127.0.0.1:{host.server_port}')
        page.evaluate("const originalReset=reset; reset=(seed)=>{originalReset(seed,false); world.missionType='archive'; world.missionSteps=['card','power','archive']; hud()}")
        page.evaluate("reset('class-demo'); world.guards=[]; world.cameras=[]; world.lasers=[]; p={...world.card}; interact(); p={...world.target}; interact()")
        assert page.evaluate("mode==='inspect' && !firewall")
        assert 'POWER CONTROL' in page.locator('#modalText').inner_text()
        page.get_by_role('button',name='Continue',exact=True).click()
        page.evaluate('p={...world.power}; interact()')
        # Hack panel stays outside the center of the playfield on desktop.
        panel = page.locator('#modal').bounding_box()
        field = page.locator('#game').bounding_box()
        assert panel['x'] > field['x'] + field['width'] * .7
        assert '25 seconds' in page.locator('#modalText').inner_text()
        match_circuits(page)
        assert page.evaluate('firewall && powerUntil>clock')
        page.evaluate('p={...world.target}; interact()')
        match_circuits(page)
        assert page.evaluate('stolen')
        page.evaluate('p={...world.start}; interact()')
        assert page.get_by_text('Clean exit.', exact=True).is_visible()
        page.get_by_role('button', name='Retry floor').click()
        page.evaluate('world.guards=[]; world.cameras=[]; world.lasers=[]; question()')
        page.get_by_placeholder('Give a convincing explanation…').fill('I am doing maintenance.')
        page.get_by_role('button', name='Answer guard').click()
        page.get_by_text('SECURITY CHECK / 2 OF 2', exact=True).wait_for()
        page.get_by_placeholder('Give a convincing explanation…').fill('I am doing maintenance.')
        page.get_by_role('button', name='Answer guard').click()
        page.get_by_text('Your cover is blown.', exact=True).wait_for()
        page.evaluate("reset('class-demo'); world.guards=[]; world.cameras=[]; world.lasers=[]; p={...world.badge}; interact(); question()")
        valid = page.evaluate('`Supervisor ${world.supervisor} authorized network diagnostics under work order ${world.ticket}.`')
        page.get_by_placeholder('Give a convincing explanation…').fill(valid)
        page.get_by_role('button', name='Answer guard').click()
        page.wait_for_function("mode==='play' && strikes===1")
        page.evaluate('question("Caught breaching the archive",3)')
        page.get_by_placeholder('Give a convincing explanation…').fill(valid)
        page.get_by_role('button', name='Answer guard').click()
        page.get_by_text('Your cover is blown.', exact=True).wait_for()
        page.evaluate("reset('class-demo'); world.cameras=[]; world.lasers=[]; world.guards=[]")
        page.keyboard.press('q')
        assert page.evaluate('charges===2')
        page.keyboard.press('Space')
        assert page.evaluate('dashReady>clock')
        page.evaluate("p={...world.power}; const r=World.roomAt(world,p); world.guards=[{x:r.x+1.5,y:r.cy,angle:Math.PI,meter:0,cool:99,route:[],routeIndex:0,pause:0,patrolSeed:5,lastSeen:null,search:0}]; hack('power')")
        guard_start = page.evaluate('world.guards[0].x')
        page.wait_for_timeout(2000)
        assert page.evaluate('clock>1 && mode==="hack"')
        assert abs(page.evaluate('world.guards[0].x') - guard_start) > .05
        page.keyboard.press('Escape')
        assert page.evaluate('mode==="play"')
        # A real guard stop can be passed naturally without a work order, with breathing room afterward.
        page.evaluate("reset('class-demo'); p={...world.power}; world.lasers=[]; world.cameras=[]; world.guards=[{...p,angle:0,meter:.999,cool:0,pause:0,route:[],routeIndex:0,patrolSeed:3,search:0}]; update(.05)")
        assert page.evaluate('mode==="question"')
        page.get_by_placeholder('Give a convincing explanation…').fill('Reception sent me upstairs to inspect the network switch.')
        page.get_by_role('button', name='Answer guard').click()
        page.wait_for_function("mode==='play' && strikes===1")
        assert page.evaluate('world.guards.every(g=>g.meter===0 && g.cool>10) && severity===0')
        page.wait_for_timeout(1000)
        assert page.evaluate('mode==="play"')
        # Restricted-room catches bypass questioning even during post-release grace.
        page.evaluate("const lab=world.rooms.find(r=>r.restricted&&!r.archive); p={x:lab.cx,y:lab.cy}; world.guards=[{...p,angle:0,meter:.999,cool:99,pause:0,route:[],routeIndex:0,patrolSeed:3,search:0}]; update(.05)")
        assert page.get_by_text('Your cover is blown.', exact=True).is_visible()
        # Explicit warning door, key requirement and open/close controls.
        page.evaluate("reset('class-demo'); world.guards=[]; world.cameras=[]; world.lasers=[]; const door=world.doors.find(d=>d.keyRequired); p={x:door.x+.5+door.dx*.95,y:door.y+.5+door.dy*.95}; interact()")
        assert page.evaluate('world.doors.every(d=>!d.open)')
        page.evaluate('card=true; interact()')
        assert page.evaluate('world.doors.find(d=>d.keyRequired).open')
        page.evaluate('interact()')
        assert page.evaluate('!world.doors.find(d=>d.keyRequired).open')
        # Synthesized audio activates after gestures and mute prevents new sound scheduling.
        page.keyboard.press('q')
        assert page.evaluate("AudioFX.ctx && AudioFX.ctx.state==='running' && AudioFX.events>0")
        page.get_by_role('button', name='Sound on').click()
        sound_count = page.evaluate('AudioFX.events')
        page.evaluate("AudioFX.cue('alarm')")
        assert page.evaluate('!AudioFX.enabled && AudioFX.master.gain.value===0 && AudioFX.events') == sound_count
        page.get_by_role('button', name='Sound off').click()
        assert page.evaluate('AudioFX.enabled && AudioFX.master.gain.value>0')
        page.evaluate("reset('room-purpose'); world.guards=[]; world.cameras=[]; world.lasers=[]")
        page.wait_for_function('Textures.ready')
        for effect in ['cameras', 'intel']:
            page.evaluate(f"const station=world.stations.find(s=>s.effect==='{effect}'); p={{x:station.x,y:station.y}}; interact()")
            assert page.evaluate('mode==="hack"')
            match_circuits(page)
            assert page.evaluate(f"world.stations.find(s=>s.effect==='{effect}').used")
        for effect in ['supplies', 'tools', 'map']:
            if page.evaluate(f"world.stations.some(s=>s.effect==='{effect}')"):
                page.evaluate(f"const station=world.stations.find(s=>s.effect==='{effect}'); p={{x:station.x,y:station.y}}; interact()")
                assert page.evaluate(f"world.stations.find(s=>s.effect==='{effect}').used")
                assert page.locator('#modalText').is_visible()
                if effect=='tools':
                    assert '+10 seconds' in page.locator('#modalText').inner_text()
                page.get_by_role('button',name='Continue',exact=True).click()
        page.evaluate("reset('class-demo'); world.guards=[]; world.cameras=[]; world.lasers=[]; const station=world.stations.find(s=>s.type==='route'); p={x:station.x,y:station.y}; RoomActions.use(station)")
        page.screenshot(path=str(Path(__file__).parent / 'puzzle-preview.png'))
        page.keyboard.press('Escape')
        page.evaluate("reset('class-demo'); p={...world.card}; fog()")
        page.wait_for_timeout(100)
        page.screenshot(path=str(Path(__file__).parent / 'preview.png'))
        assert not errors, errors
        browser.close()
        print('PASS: Edge browser — firewall prerequisite, full extraction, strict guards, cover identity, tools, real-time patrols during hacking, side panel and Escape cancel; no JS errors.')
finally:
    host.shutdown()
    host.server_close()

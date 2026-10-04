// Headless runtime smoke: real game logic with a minimal DOM/canvas adapter.
const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
class Element{constructor(){this.children=[];this.style={};this.classList={remove(){},add(){}};this.value='';this.open=false}append(...items){this.children.push(...items)}replaceChildren(){this.children=[]}showModal(){this.open=true}close(){this.open=false}addEventListener(){}focus(){}getContext(){return new Proxy({},{get:()=>()=>{}})}}
const elements=new Map(),context={console,Math,Set,AbortSignal,setTimeout(){},document:{getElementById(id){if(!elements.has(id))elements.set(id,new Element());return elements.get(id)},createElement(){return new Element()}},window:{addEventListener(){}},requestAnimationFrame(){},fetch:async()=>({ok:true,json:async()=>({engine:'test',ready:false,choice:'release'})})};vm.createContext(context);for(const f of['world.js','textures.js','art.js','security.js','audio.js','puzzles.js','minigames.js','room_actions.js','game.js'])vm.runInContext(fs.readFileSync(f,'utf8'),context);
vm.runInContext(`const originalReset=reset;reset=(seed)=>{originalReset(seed,false);world.missionType='archive';world.missionSteps=['card','power','archive'];hud()};`,context);
vm.runInContext(`reset('smoke');draw();update(.016);p={...world.card};interact();if(!card)throw Error('card pickup failed');p={...world.target};interact();if(mode!=='inspect'||!$('modalText').textContent.includes('POWER CONTROL'))throw Error('archive lock feedback missing');dialog.close();mode='play';firewall=true;interact();if(mode!=='hack')throw Error('hacking did not open');`,context);
vm.runInContext(`const cables=MiniGames.active.state;for(let i=0;i<4;i++){Puzzles.cable(cables,i,cables.order.indexOf(i));MiniGames.check()}`,context);
vm.runInContext(`if(!stolen||mode!=='play')throw Error('hacking completion failed');p={...world.start};interact();if(mode!=='end')throw Error('extraction failed');reset('smoke');question();`,context);
assert(elements.get('modal').open);console.log('PASS: game initializes, draws, moves, collects card, completes hacking, extracts, and opens questioning.');
vm.runInContext(`
const missionTypes=new Set();
for(let seed=0;seed<100;seed++){
 originalReset('mission-'+seed,false);missionTypes.add(world.missionType);
 if(missionComplete())throw Error('mission starts completed');
 p={...world.start};interact();if(mode==='end')throw Error('early extraction');dialog.close();mode='play';
 for(const step of world.missionSteps){const point=missionPoint(step);if(!point||!World.path(world,world.start,point,true,false).length)throw Error('unreachable mission');if(step==='card')card=true;else RoomActions.reward(point)}
 if(!missionComplete())throw Error('objectives did not complete');p={...world.start};interact();if(mode!=='end')throw Error('mission extraction failed');
}
if(missionTypes.size!==7)throw Error('missing mission variety');
originalReset('briefing-test');if(mode!=='briefing')throw Error('briefing missing');const pausedClock=clock;update(2);if(clock!==pausedClock)throw Error('security advanced during briefing');Briefing.begin();if(mode!=='play'||!$('briefing').hidden)throw Error('briefing did not dismiss');
`,context);console.log('PASS: seven mission types over 100 seeds, reachable objectives, completion/extraction gates and paused briefing.');
vm.runInContext(`
for(let seed=0;seed<20;seed++){
 reset('patrol-'+seed);fog();
 if(inView.size>=world.w*world.h/2)throw Error('fog reveals too much');
 if(inView.has(Math.floor(world.target.x)+','+Math.floor(world.target.y)))throw Error('archive revealed at spawn');
 for(let tick=0;tick<1600;tick++)for(const g of world.guards){patrol(g,.05,false);if(world.grid[Math.floor(g.y)]?.[Math.floor(g.x)]!==1)throw Error('guard crossed a wall/door');if(!Number.isFinite(g.x)||!Number.isFinite(g.y))throw Error('invalid patrol position')}
 const g=world.guards.find(g=>Math.hypot(g.x-p.x,g.y-p.y)>8);if(g){g.meter=.5;update(.1);if(g.meter<.49)throw Error('guard suspicion decays too quickly')}
}
reset('fog');fog();const remembered=explored.size;p={...world.card};fog();if(explored.size<remembered)throw Error('fog forgot explored cells');
card=true;world.doors.forEach(d=>d.open=true);const guard=world.guards[0];guard.pause=0;guard.lastSeen={...world.target};guard.search=5;guard.route=[];patrol(guard,.05,false);if(!guard.route.length)throw Error('guard cannot investigate opened archive');
`,context);
console.log('PASS: 20 maze patrol simulations (80 seconds each), walls respected, slow suspicion decay and fog memory.');
vm.runInContext(`
reset('tactics');fog();const r=World.roomAt(world,p);
for(let y=r.y;y<r.y+r.h;y++)for(let x=r.x;x<r.x+r.w;x++)if(!inView.has(x+','+y))throw Error('current room not fully revealed');
const d=r.doors[0];if(d&&world.grid[Math.floor(d.y+d.dy)]?.[Math.floor(d.x+d.dx)]===1&&!inView.has(Math.floor(d.x+d.dx)+','+Math.floor(d.y+d.dy)))throw Error('no doorway peek');
const beforeX=p.x;dash();update(.05);if(Math.hypot(p.x-beforeX,p.y-world.start.y)<.4)throw Error('dash failed');
const chargeBefore=charges;decoy();if(charges!==chargeBefore-1||!noiseMarks.length)throw Error('decoy failed');
world.guards=[];world.cameras=[];world.lasers=[];p={...world.power};hack('power');const time=clock;update(.2);if(clock<=time)throw Error('hacking paused the world');update(hackDeadline-clock+1);if(mode!=='play')throw Error('trace timer did not disconnect');
const generic={answer:'maintenance',ticket:'N-123',supervisor:'IVES',attempt:0,severity:1,strikes:0};if(Security.policy(generic,'release')!=='question')throw Error('generic excuse accepted');if(Security.policy({...generic,attempt:1},'release')!=='alert')throw Error('repeat vague excuse accepted');
const valid={...generic,badge:true,answer:'IVES sent me for network diagnostics, work order N-123'};if(Security.policy(valid,'release')!=='release')throw Error('valid work order rejected');if(Security.policy({...valid,strikes:2},'release')!=='release')throw Error('reasonable repeated stop automatically failed');if(Security.policy({...valid,severity:3},'release')!=='alert')throw Error('restricted evidence ignored');
for(const r of world.rooms.filter(r=>r.restricted)){reset('tactics');const restricted=world.rooms.find(o=>o.id===r.id);p={x:restricted.cx,y:restricted.cy,angle:0};world.cameras=[];world.lasers=[];world.guards=[{...p,meter:.999,cool:99,pause:0,route:[],routeIndex:0,patrolSeed:1,search:0}];update(.05);if(mode!=='end')throw Error('restricted room catch allowed explanation during grace')}
reset('tactics');const normal=world.rooms.find(r=>!r.restricted);p={x:normal.cx,y:normal.cy,angle:0};world.cameras=[];world.lasers=[];world.guards=[{...p,meter:.999,cool:0,pause:0,route:[],routeIndex:0,patrolSeed:1,search:0}];update(.05);if(mode!=='question')throw Error('ordinary room catch did not permit explanation');
`,context);
console.log('PASS: full room visibility, doorway peek, dash, decoy, live hacking trace and strict evidence-based guard decisions.');
vm.runInContext(`
reset('doors');const door=world.doors.find(d=>d.keyRequired);world.guards=[];p={x:door.x+.5+door.dx*.95,y:door.y+.5+door.dy*.95,angle:0};interact();if(door.open)throw Error('keyed door opened without card');dialog.close();mode='play';card=true;interact();if(!door.open||solid(door.x+.5,door.y+.5))throw Error('E did not open restricted door');interact();if(door.open||!solid(door.x+.5,door.y+.5))throw Error('E did not close restricted door');fog();if(!inView.has(door.x+','+door.y))throw Error('closed warning door is invisible');if(inView.has((door.x-door.dx)+','+(door.y-door.dy)))throw Error('closed door reveals restricted interior');
reset('vision');world.rooms=[];world.doors=[];world.grid=Array.from({length:world.h},()=>Array(world.w).fill(0));for(let x=1;x<35;x++)world.grid[10][x]=1;p={x:5.5,y:10.5};fog();if(!inView.has('20,10'))throw Error('long corridor vision not extended');world.grid[10][12]=0;fog();if(inView.has('13,10'))throw Error('long vision sees through walls');
`,context);
console.log('PASS: restricted door key/open/close controls and 15-tile corridor vision respecting walls.');
vm.runInContext(`
reset('boundary');card=true;world.doors.forEach(d=>d.open=true);const entry=world.doors.find(d=>d.keyRequired);p={x:entry.x+.5-entry.dx*.4,y:entry.y+.5-entry.dy*.4,angle:0};world.cameras=[];world.lasers=[];world.guards=[{x:entry.x+.5-entry.dx,y:entry.y+.5-entry.dy,angle:Math.atan2(entry.dy,entry.dx),meter:.999,cool:0,pause:0,route:[],routeIndex:0,patrolSeed:3,search:0}];keys.clear();keys.add(entry.dx===-1?'d':entry.dx===1?'a':entry.dy===-1?'s':'w');update(.05);keys.clear();if(!World.roomAt(world,p)?.restricted||mode!=='end')throw Error('restricted boundary crossing allowed questioning');
`,context);
console.log('PASS: crossing into a restricted room on the detection frame causes immediate lockdown.');

vm.runInContext(`
reset('rooms');world.guards=[];world.cameras=[];world.lasers=[];
if(world.stations.length!==world.rooms.length)throw Error('room lacks purpose');
for(const station of world.stations){if(world.grid[Math.floor(station.y)]?.[Math.floor(station.x)]!==1)throw Error('station blocked by cover')}
const supplies=world.stations.find(s=>s.effect==='supplies');if(supplies){charges=0;RoomActions.use(supplies);if(charges!==2)throw Error('supplies did not replenish');RoomActions.use(supplies);if(charges!==2)throw Error('supplies farmed repeatedly')}
const tools=world.stations.find(s=>s.effect==='tools');if(tools){RoomActions.use(tools);if(!toolUpgrade)throw Error('tool upgrade missing')}
p={...world.power};hack('power');const breaker=MiniGames.active.state;for(let i=0;i<3;i++){let n=0;while((Math.abs(breaker.needle-breaker.center)>breaker.width/4||breaker.time-breaker.lastHit<.3)&&n++<1000)Puzzles.tick(breaker,.01);Puzzles.strike(breaker);MiniGames.check()}if(!firewall||powerUntil<=clock)throw Error('breaker did not power down security');
const station=world.stations.find(s=>s.effect==='cameras');if(station){RoomActions.use(station);const old=MiniGames.active;reset('new-run');old.onwin();if(world.stations.some(s=>s.used))throw Error('stale puzzle granted reward on new run')}
`,context);
console.log('PASS: every room has a reachable station; rewards, live breaker completion and stale-session protection.');
vm.runInContext(`
originalReset('directory-security',false);const hallwayCamera=world.cameras.find(c=>c.corridor);p={...hallwayCamera.safeSpot,angle:0};world.guards=[];world.lasers=[];world.cameras=[hallwayCamera];for(let i=0;i<200;i++)update(.05);if(hallwayCamera.meter!==0||mode!=='play')throw Error('corridor cover fails camera sweep');
let icons=0;const originalIcon=Art.roomIcon;Art.roomIcon=(...args)=>{icons++;originalIcon(...args)};draw();if(icons)throw Error('icons shown before directory');const directory=world.stations.find(s=>s.effect==='map');RoomActions.reward(directory);draw();if(!directoryKnown||icons<world.rooms.length)throw Error('directory room icons missing');icons=0;p={...world.start};draw();if(icons)throw Error('directory icons shown inside a room');originalReset('directory-reset',false);if(directoryKnown)throw Error('directory knowledge leaked between runs');Art.roomIcon=originalIcon;
`,context);console.log('PASS: hallway camera cover protects against a full sweep; custom directory icons are gated by discovery and hallway position.');
vm.runInContext(`
const tested=new Set();
for(let seed=0;seed<200&&tested.size<7;seed++){
 originalReset('mission-play-'+seed,false);if(tested.has(world.missionType))continue;tested.add(world.missionType);world.guards=[];world.cameras=[];world.lasers=[];
 const prerequisite=world.stations.find(s=>s.requires!==undefined);if(prerequisite){p={...prerequisite};interact();if(mode!=='inspect'||prerequisite.used||MiniGames.active)throw Error('missing prerequisite was bypassed');dialog.close();mode='play';RoomActions.reward(prerequisite);if(prerequisite.used)throw Error('reward bypassed prerequisite')}
 for(const step of world.missionSteps){p={...missionPoint(step)};interact();if(step==='card'){if(!card)throw Error('card mission failed');continue}if(mode!=='hack')throw Error('mission did not open puzzle: '+world.missionType+' '+step);const state=MiniGames.active.state;
  if(state.type==='cables'){for(let i=0;i<4;i++){Puzzles.cable(state,i,state.order.indexOf(i));MiniGames.check()}}
  else if(state.type==='drawers'){Puzzles.drawer(state,state.target,1);MiniGames.check()}
  else if(state.type==='route'){for(const[index,mask]of Object.entries(state.solution)){for(let i=0;i<4&&state.masks[index]!==mask;i++)Puzzles.rotate(state,+index);MiniGames.check();if(!MiniGames.active)break}}
  else{for(let i=0;i<3;i++){let tries=0;while((Math.abs(state.needle-state.center)>state.width/4||state.time-state.lastHit<.3)&&tries++<1000)Puzzles.tick(state,.01);Puzzles.strike(state);MiniGames.check()}}
  if(!missionStepDone(step)||mode!=='play')throw Error('puzzle did not advance mission: '+world.missionType+' '+step);
 }
 if(world.missionType==='wipe'&&!world.hotExtraction)throw Error('erasure did not trigger hunt');p={...world.start};interact();if(mode!=='end')throw Error('mission failed extraction');
}
if(tested.size!==7)throw Error('mission types untested');let previous=world.missionType;for(let i=0;i<20;i++){originalReset(undefined,false);if(world.missionType===previous)throw Error('new assignment repeated type');previous=world.missionType}
`,context);console.log('PASS: all seven mission types complete through actual interactions and puzzle callbacks; prerequisites and consecutive assignment variety enforced.');

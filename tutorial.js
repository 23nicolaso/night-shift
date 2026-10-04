// First-run training. Cards run in mode 'tutorial', which update() skips, so security stays frozen.
// The controls card shows each move as a looping animation; E is taught hands-on at the floor directory,
// where the player may walk around the lift room (still paused). After the last card a live banner points at R.
const Tutorial={
 // 'cards' gives each objective its own card; 'list' puts every objective on one card.
 objectiveLayout:'cards',
 storageKey:'night-shift-tutorial-seen',
 // TEMPORARY for playtesting: show training after every briefing. Set back to false for first-run only.
 alwaysShow:true,
 shownThisSession:false,steps:[],index:0,pressed:new Set(),caps:[],tiles:[],scenes:[],guide:null,nudge:false,
 controls:[
  {scene:'move',caps:['W','A','S','D'],label:'Move',caption:'or arrow keys'},
  {scene:'sneak',caps:['Shift'],label:'Sneak',caption:'hold · harder to spot'},
  {scene:'dash',caps:['Space'],label:'Dash',caption:'fast · makes noise'},
  {scene:'decoy',caps:['Q'],label:'Decoy',caption:'lures guards away'},
  {scene:'scan',caps:['R'],label:'Scan',caption:'points to your goal'}
 ],
 arrows:{arrowup:'w',arrowleft:'a',arrowdown:'s',arrowright:'d',' ':'space'},
 seen(){try{return localStorage.getItem(this.storageKey)==='1'}catch{return false}},
 markSeen(){try{localStorage.setItem(this.storageKey,'1')}catch{}},
 pending(){return this.alwaysShow||!this.shownThisSession&&!this.seen()},
 lobby(){return World.roomAt(world,world.start)},
 directory(){const lobby=this.lobby();return world.stations.find(s=>s.effect==='map'&&s.roomId===lobby?.id)},
 step(){return mode==='tutorial'?this.steps[this.index]:null},
 practicing(){return !!this.step()?.practice},
 start(){Briefing.stop();if(dialog.open)dialog.close();this.shownThisSession=true;mode='tutorial';keys.clear();this.pressed.clear();this.guide=null;this.steps=this.build();this.index=0;$('tutorial').hidden=false;this.render()},
 stop(){this.guide=null;this.scenes=[];const panel=$('tutorial');if(panel)panel.hidden=true},
 finish(){this.markSeen();this.scenes=[];$('tutorial').hidden=true;mode='play';keys.clear();p.moving=false;const directory=this.directory();this.guide=directory&&!directory.used?{stage:'directory',station:directory,roomId:directory.roomId}:{stage:'scan',until:clock+7}},
 skip(){this.finish()},
 go(index){keys.clear();p.moving=false;this.nudge=false;this.index=index;this.render()},
 next(){if(this.index>=this.steps.length-1)this.finish();else this.go(this.index+1)},
 back(){if(this.index>0)this.go(this.index-1)},
 key(e){
  if(e.repeat)return;if(e.key==='Enter'){if(!['BUTTON','INPUT','TEXTAREA','A'].includes(e.target?.tagName))this.next();return}if(e.key==='Escape'){this.skip();return}
  const k=e.key.toLowerCase();this.pressed.add(this.arrows[k]||k);this.light();
  if(this.practicing()){if(k==='e')this.use();else keys.add(e.key.length===1?k:e.key)}
 },
 light(){for(const cap of this.caps){if(this.pressed.has(cap.key))cap.el.classList.add('lit');else cap.el.classList.remove('lit')}for(const t of this.tiles){if(t.caps.some(c=>this.pressed.has(c)))t.el.classList.add('lit');else t.el.classList.remove('lit')}},
 // Practice step: walk inside the lift room only, then press E at the directory for real.
 practice(dt){
  if(!this.practicing())return;
  const dx=(keys.has('d')||keys.has('ArrowRight')?1:0)-(keys.has('a')||keys.has('ArrowLeft')?1:0),dy=(keys.has('s')||keys.has('ArrowDown')?1:0)-(keys.has('w')||keys.has('ArrowUp')?1:0);
  p.sneaking=keys.has('Shift');p.moving=!!(dx||dy);if(!p.moving)return;
  p.angle=Math.atan2(dy,dx);const speed=(p.sneaking?2:3.5)*dt/Math.hypot(dx,dy),before={x:p.x,y:p.y};move(dx*speed,dy*speed);
  if(World.roomAt(world,p)?.id!==this.lobby()?.id){p.x=before.x;p.y=before.y}
 },
 use(){const d=this.directory();if(!d||d.used)return;if(reachTarget()===d){RoomActions.reward(d);this.nudge=false}else this.nudge=true;this.render()},
 build(){
  const steps=[{tag:'CONTROLS',title:'Your kit',controls:true}];
  const directory=this.directory();
  if(directory)steps.push({tag:'INTERACTING',title:'Press E to use things',spot:[directory],practice:true});
  steps.push({tag:'EXTRACTION',title:'Service lift',spot:[world.start],points:['This lift is your way out. Once every objective is done, come back here and press E to extract.','If you try to leave early, the lift reminds you what is still left.']});
  const objectives=world.missionSteps.map(step=>this.objective(step));
  if(this.objectiveLayout==='list')steps.push({tag:'MISSION',title:world.missionTitle,list:objectives});
  else objectives.forEach((o,i)=>steps.push({tag:'OBJECTIVE '+(i+1)+' OF '+objectives.length,title:o.title,objective:o}));
  steps.push({tag:'THREATS',title:'Staying unseen',points:[
   'Guards: red vision cones. While a guard can see you, the bar above their head fills. When it is full, they stop you for questioning.',
   'Rooms hide you: guards in the hallway cannot see in. But if one spots you in the hallway, it follows you into the room.',
   'Questioning: type a specific, believable reason for being there. Picking up the optional work order makes your story stronger.',
   'Cameras: amber cones that sweep back and forth. A full camera bar also gets you questioned. Press E beside a camera to short it for 12 seconds, but the spark makes noise.',
   'Laser gates: cross only while the beam is off. Each trip records an alarm, and two alarms lock the floor down.',
   'OFF LIMITS rooms have striped doors. Being seen inside one, or seen anywhere after you have stolen files, ends the mission instantly. No explanation will save you.',
   'Noise: dashing, decoys and shorted cameras all make noise that draws guards. Hold Shift to sneak past instead.']});
  steps.push({tag:'READY',title:'Deploy',points:()=>['Security starts moving as soon as you press Start mission.',directory&&!directory.used?'First step: walk to the FLOOR DIRECTORY in this room and press E.':'Press R any time to point toward your next objective.']});
  return steps;
 },
 objective(step){
  const point=missionPoint(step),room=point&&World.roomAt(world,point),notes=[];
  const where=room?room.name+' (room '+(room.id+1)+')':'somewhere on this floor';
  if(step==='card')return{title:'Cyan access card',summary:missionLabel(step),where,icon:'card',restricted:false,how:'The card is labelled ACCESS. Walk up to it and press E to take it. There is no puzzle.',brief:'Press E to take it. No puzzle.',notes:['It opens the striped OFF LIMITS archive door. The archive is still a restricted room.']};
  const names={route:'circuit',cables:'cable',breaker:'breaker',drawers:'filing cabinet'};
  const how=point.type?'Press E to start a '+names[point.type]+' puzzle. '+RoomActions.describe(point)+' You have '+RoomActions.timeLimit(point)+' seconds, and security keeps moving while you work. Press Escape to disconnect.':'Press E to use it. No puzzle. '+RoomActions.describe(point);
  if(point.requires!==undefined)notes.push('Needs the '+world.stations.find(s=>s.id===point.requires).label+' first.');
  if(step==='archive')notes.push('Needs the cyan access card to open the door, and the POWER BREAKER override to unlock the firewall.');
  if(step==='power'&&world.missionSteps.includes('archive'))notes.push('This unlocks the archive firewall. The 25-second blackout is your best window to move.');
  if(room?.restricted)notes.push('This room is OFF LIMITS. If anyone sees you inside, the mission ends immediately.');
  const brief=(point.type?'Press E: '+names[point.type]+' puzzle, '+RoomActions.timeLimit(point)+' seconds.':'Press E. No puzzle.')+(notes.length?' '+notes[0]:'');
  return{title:point.label,summary:missionLabel(step),where,icon:point.effect,restricted:!!room?.restricted,how,brief,notes};
 },
 render(){
  const step=this.steps[this.index],panel=$('tutorial'),body=$('tutorialBody'),el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n};
  panel.className='tutorial'+(step.spot?' docked':'');
  $('tutorialTag').textContent='TRAINING '+(this.index+1)+' / '+this.steps.length+' · '+step.tag;$('tutorialTitle').textContent=step.title;
  body.replaceChildren();this.caps=[];this.tiles=[];this.scenes=[];
  if(step.controls){
   body.append(el('p','Press a key to try it.','tutorial-lead'));const grid=el('div',undefined,'tutorial-tiles');
   for(const c of this.controls){const tile=el('div',undefined,'tutorial-tile'),keysRow=el('div',undefined,'tutorial-keys');tile.append(this.sceneCanvas(c.scene));for(const cap of c.caps){const k=el('kbd',cap);this.caps.push({key:cap.toLowerCase(),el:k});keysRow.append(k)}tile.append(keysRow,el('b',c.label),el('span',c.caption));this.tiles.push({el:tile,caps:c.caps.map(cap=>cap.toLowerCase())});grid.append(tile)}
   body.append(grid);this.light();
  }
  if(step.practice){
   const done=this.directory().used,demo=el('div',undefined,'tutorial-demo');demo.append(this.sceneCanvas('interact'));body.append(demo);
   if(done){body.append(el('p','✓ Floor plan scanned. Each room now shows its symbol on your map.','tutorial-done'));const legend=el('div',undefined,'tutorial-legend');legend.append(el('i',undefined,'diamond goal'),el('span','Objective'),el('i',undefined,'diamond'),el('span','Optional'));body.append(legend)}
   else body.append(el('p',this.nudge?'Get closer — walk until the [E] appears above it.':'Walk to the glowing terminal and press E.','tutorial-lead'));
  }
  const points=typeof step.points==='function'?step.points():step.points;
  if(points){const list=el('ul');points.forEach(t=>list.append(el('li',t)));body.append(list)}
  if(step.objective)body.append(this.objectiveBlock(step.objective,el,true));
  if(step.list){const list=el('ol',undefined,'tutorial-list');step.list.forEach(o=>{const item=el('li');item.append(this.objectiveBlock(o,el,false));list.append(item)});body.append(list)}
  $('tutorialBack').disabled=this.index===0;$('tutorialNext').textContent=this.index===this.steps.length-1?'Start mission':'Next';
 },
 sceneCanvas(name){const c=document.createElement('canvas');c.className='tutorial-scene';c.width=168;c.height=96;this.scenes.push({name,ctx:c.getContext('2d')});return c},
 objectiveBlock(o,el,full){
  const block=el('div',undefined,'tutorial-objective'),icon=el('canvas',undefined,'tutorial-icon');icon.width=icon.height=40;Art.roomIcon(icon.getContext('2d'),o.icon,20,20,36,o.restricted);
  const head=el('div');head.append(el('b',o.summary),el('small',o.where.toUpperCase()));block.append(icon,head);
  if(full){block.append(el('p',o.how));if(o.notes.length){const list=el('ul');o.notes.forEach(t=>list.append(el('li',t)));block.append(list)}block.append(el('p','Once you have scanned the floor directory, this room shows the symbol on the left.','tutorial-note'))}else block.append(el('p',o.brief,'tutorial-brief'))
  return block;
 },
 // Looping control demos, drawn in tile units (20px) on a 4.2 × 2.4 tile stage at 2× zoom.
 animate(t){
  for(const{name,ctx:c}of this.scenes){
   c.setTransform(2,0,0,2,0,0);c.imageSmoothingEnabled=false;c.fillStyle='#2c3d4c';c.fillRect(0,0,84,48);c.fillStyle='#33475a';for(let x=0;x<5;x++)for(let y=0;y<3;y++)if((x+y)%2)c.fillRect(x*20,y*20,20,20);
   this.draw[name](c,t,this);
  }
 },
 cone(c,x,y,angle,spread,range,color){c.fillStyle=color;c.beginPath();c.moveTo(x*20,y*20);c.arc(x*20,y*20,range*20,angle-spread,angle+spread);c.closePath();c.fill()},
 ring(c,x,y,r){c.strokeStyle='#9ee4d7';c.lineWidth=.8;c.beginPath();c.arc(x*20,y*20,r,0,Math.PI*2);c.stroke()},
 draw:{
  move(c,t){const k=t*1.3;Art.person(c,{x:2.1+Math.sin(k)*1.3,y:1.25,angle:Math.cos(k)>=0?0:Math.PI},false,t,true)},
  sneak(c,t,T){T.cone(c,3.6,.7,Math.PI,.45,2.6,'#ff8a6c40');Art.person(c,{x:3.6,y:.7,angle:Math.PI},true,t,false);Art.person(c,{x:.3+(t*.45)%3.4,y:1.8,angle:0,sneaking:true},false,t,true)},
  dash(c,t,T){const p=t%2.4,x=p<1?.6:p<1.3?.6+(p-1)/.3*2.7:3.3;if(p>1&&p<1.9)T.ring(c,.6,1.3,(p-1)*16+3);if(p>1&&p<1.45)for(let i=3;i>0;i--){c.globalAlpha=.12*i;c.fillStyle='#94f3dc';c.fillRect((x-.3*i)*20-5,1.3*20-4,10,12)}c.globalAlpha=1;Art.person(c,{x,y:1.3,angle:0},false,t,p>=1&&p<1.3)},
  decoy(c,t,T){const p=t%3.2,ix=2.3,iy=1.1,k=Math.min(p/.7,1);Art.person(c,{x:.6,y:1.4,angle:0},false,t,false);if(p<.7){c.fillStyle='#9ef0d9';c.fillRect((.9+(ix-.9)*k)*20-1.5,(1.2+(iy-1.2)*k-Math.sin(Math.PI*k)*.7)*20-1.5,3,3)}else if(p<1.8)T.ring(c,ix,iy,(p-.7)*16+2);const walk=p>.9&&p<2,gx=3.6-Math.max(0,Math.min(p,2)-.9)*.6;Art.person(c,{x:gx,y:iy,angle:p<.7?0:Math.PI},true,t,walk)},
  scan(c,t){const a={x:1,y:1.3},g={x:3.5,y:.65},angle=Math.atan2(g.y-a.y,g.x-a.x);Art.marker(c,g.x*20,g.y*20,t,true);Art.person(c,{...a,angle:0},false,t,false);if(t%4<3){const dx=Math.cos(angle),dy=Math.sin(angle),x=a.x*20+dx*17,y=a.y*20+dy*17;c.fillStyle='#9ef0d9';c.beginPath();c.moveTo(x+dx*7,y+dy*7);c.lineTo(x-dx*4-dy*5,y-dy*4+dx*5);c.lineTo(x-dx*4+dy*5,y-dy*4-dx*5);c.closePath();c.fill()}},
  interact(c,t){const p=t%3.4,x=p<1.2?.5+p/1.2*1.9:2.4,term={x:3.2,y:1.25};Art.object(c,term,'terminal',true);Art.person(c,{x,y:1.35,angle:0},false,t,p<1.2);if(p>1.3)Art.reach(c,term.x*20,term.y*20,4,t);if(p>2&&p<2.6){c.fillStyle='#9ef0d988';c.fillRect(term.x*20-9,term.y*20-9,18,14)}}
 },
 // Called inside the world transform: dims everything except spotlit objects (and you, while practising).
 drawWorld(ctx){
  if(mode!=='tutorial')return;const step=this.steps[this.index],t=last/1000;this.animate(t);
  const spots=(step?.spot||[]).filter(o=>onScreen(o)).map(o=>({o,r:38}));if(step?.practice)spots.push({o:p,r:24});
  // Dim on a separate layer and erase the spots from it, so overlapping spots stay lit.
  const layer=this.layer||=document.createElement('canvas');layer.width=canvas.width;layer.height=canvas.height;const lc=layer.getContext('2d');
  lc.fillStyle='#050c15c7';lc.fillRect(0,0,layer.width,layer.height);lc.setTransform(ctx.getTransform());lc.globalCompositeOperation='destination-out';for(const{o,r}of spots){lc.beginPath();lc.arc(o.x*20,o.y*20-10,r,0,Math.PI*2);lc.fill()}
  ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.drawImage(layer,0,0);ctx.restore();
  ctx.save();for(const{o,r}of spots){if(o===p)continue;ctx.strokeStyle='#9ef0d9';ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(o.x*20,o.y*20-10,r+Math.sin(t*3)*2,0,Math.PI*2);ctx.stroke()}ctx.restore();
 },
 // Called in screen space during play: a one-line guide for the first moves after training.
 drawScreen(ctx){
  const g=this.guide;if(!g||mode!=='play')return;
  if(g.stage==='directory'&&(g.station.used||currentRoom?.id!==g.roomId)){this.guide={stage:'scan',until:clock+7};return}
  if(g.stage==='scan'&&clock>g.until){this.guide=null;return}
  const text=g.stage==='directory'?'Walk to the FLOOR DIRECTORY and press E':'Press R any time to point toward your next objective';ctx.font='12px monospace';const w=(ctx.measureText(text)?.width||text.length*7.2)+118;
  ctx.fillStyle='#0b1420e6';ctx.fillRect(500-w/2,62,w,32);ctx.strokeStyle='#84cdb7';ctx.lineWidth=1;ctx.strokeRect(500-w/2+.5,62.5,w-1,31);ctx.fillStyle='#87d9c1';ctx.font='bold 10px monospace';ctx.fillText('TRAINING',500-w/2+14,82);ctx.fillStyle='#e7f6ee';ctx.font='12px monospace';ctx.fillText(text,500-w/2+100,82);
 }
};

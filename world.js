(function(root){
function rng(seed){let h=2166136261;for(const c of String(seed))h=Math.imul(h^c.charCodeAt(0),16777619);return()=>{h+=0x6D2B79F5;let t=h;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
const dirs=[[1,0],[-1,0],[0,1],[0,-1]];
function path(world,from,to,unlocked=false,respectDoors=false){const key=(x,y)=>x+','+y,start=[Math.floor(from.x),Math.floor(from.y)],goal=key(Math.floor(to.x),Math.floor(to.y)),queue=[start],parents=new Map([[key(...start),null]]);for(let i=0;i<queue.length;i++){const[x,y]=queue[i],k=key(x,y);if(k===goal){const result=[];for(let at=k;at!==null;at=parents.get(at)){const[xx,yy]=at.split(',').map(Number);result.push({x:xx+.5,y:yy+.5})}return result.reverse()}for(const[dx,dy]of dirs){const xx=x+dx,yy=y+dy,t=world.grid[yy]?.[xx],next=key(xx,yy),door=world.doors?.find(d=>d.x===xx&&d.y===yy);if((t===1||t===2&&unlocked||t===4)&&(!respectDoors||!door||door.open)&&!parents.has(next)){parents.set(next,k);queue.push([xx,yy])}}}return[]}
function reachable(world,card){const seen=new Set(),queue=[[Math.floor(world.start.x),Math.floor(world.start.y)]];for(let i=0;i<queue.length;i++){const[x,y]=queue[i],k=x+','+y;if(seen.has(k))continue;seen.add(k);for(const[dx,dy]of dirs){const xx=x+dx,yy=y+dy,t=world.grid[yy]?.[xx];if((t===1||t===2&&card||t===4)&&!seen.has(xx+','+yy))queue.push([xx,yy])}}return seen}
function roomAt(world,o){return world.rooms.find(r=>o.x>=r.x&&o.x<r.x+r.w&&o.y>=r.y&&o.y<r.y+r.h)}
function generate(seed){
 const random=rng(seed),sizePresets=[{name:'small',cols:2,bands:2},{name:'medium',cols:3,bands:2},{name:'large',cols:3,bands:3},{name:'wide',cols:4,bands:2}],size=sizePresets[Math.floor(random()*sizePresets.length)],{cols,bands}=size,perBand=cols*2,count=perBand*bands,archive=Math.floor(random()*count),rooms=[],edges=[];
 const types=['office','records','server','lounge','workshop','office','records','lounge','server','workshop','office','records'];
 const specs=Array.from({length:count},()=>({w:6+Math.floor(random()*6),h:5+Math.floor(random()*5)}));
 const widths=Array.from({length:cols},(_,col)=>Math.max(...specs.filter((_,i)=>Math.floor(i/2)%cols===col).map(s=>s.w))+5),xs=widths.map((_,i)=>5+widths.slice(0,i).reduce((a,b)=>a+b,0)),w=widths.reduce((a,b)=>a+b,0)+10;
 const radii=Array.from({length:bands},()=>2+Math.floor(random()*2)),lanes=[];let bottom=3;
 for(let band=0;band<bands;band++){const group=specs.slice(band*perBand,(band+1)*perBand),topDepth=Math.max(...group.filter((_,i)=>i%2===0).map(s=>s.h)),base=bottom+topDepth+radii[band]+5,wave=random()<.5?-1:1;lanes.push(Array.from({length:cols},(_,col)=>base+(col%2?-wave:wave)*(1+Math.floor(random()*3))));bottom=Math.max(...lanes[band])+radii[band]+2+Math.max(...group.filter((_,i)=>i%2===1).map(s=>s.h))+3}
 const centers=xs.map((x,col)=>x+Math.floor(widths[col]/2)),laneAt=(band,x)=>{if(x<=centers[0])return lanes[band][0];for(let col=1;col<cols;col++)if(x<=centers[col]){const ratio=(x-centers[col-1])/(centers[col]-centers[col-1]);return lanes[band][col-1]+ratio*(lanes[band][col]-lanes[band][col-1])}return lanes[band][cols-1]};
 const h=bottom+3,grid=Array.from({length:h},()=>Array(w).fill(0));
 for(let n=0;n<count;n++){
  const band=Math.floor(n/perBand),col=Math.floor(n/2)%cols,side=n%2===0?-1:1,{w:rw,h:rh}=specs[n],x=xs[col]+2+Math.floor(random()*(widths[col]-rw-3)),laneSpan=Array.from({length:rw},(_,i)=>laneAt(band,x+i)),low=Math.min(...laneSpan),high=Math.max(...laneSpan),edge=side<0?Math.floor(low)-radii[band]-1:Math.ceil(high)+radii[band]+1,y=side<0?edge-rh:edge+1,type=n===archive?'archive':types[n%types.length];
  rooms.push({id:n,x,y,w:rw,h:rh,cx:x+Math.floor(rw/2)+.5,cy:y+Math.floor(rh/2)+.5,type,name:type.toUpperCase(),archive:n===archive,restricted:n===archive,doors:[],hallSide:side,band,col});
  for(let yy=y;yy<y+rh;yy++)for(let xx=x;xx<x+rw;xx++)grid[yy][xx]=1;
 }
 const center=n=>({x:Math.floor(rooms[n].cx),y:Math.floor(rooms[n].cy)}),hallway=new Set(),corridors=[],hallSegments=[],spine=[];
 // Bresenham centerlines make broad diagonal passages on the tile collision grid.
 const carve=(points,radius=0)=>{corridors.push(points);for(let i=1;i<points.length;i++){let{x,y}=points[i-1],end=points[i],dx=Math.abs(end.x-x),dy=-Math.abs(end.y-y),sx=x<end.x?1:-1,sy=y<end.y?1:-1,error=dx+dy;const stamp=()=>{for(let yy=y-radius;yy<=y+radius;yy++)for(let xx=x-radius;xx<=x+radius;xx++){if(xx<1||yy<1||xx>=w-1||yy>=h-1)continue;if(rooms.some(r=>xx>=r.x-1&&xx<=r.x+r.w&&yy>=r.y-1&&yy<=r.y+r.h))continue;grid[yy][xx]=1;hallway.add(xx+','+yy)}};while(true){stamp();if(x===end.x&&y===end.y)break;const doubled=2*error;if(doubled>=dy){error+=dy;x+=sx}if(doubled<=dx){error+=dx;y+=sy}}}};
 for(let band=0;band<bands;band++){
  const order=Array.from({length:cols},(_,i)=>band%2?cols-1-i:i),points=[{x:band%2?w-4:3,y:lanes[band][order[0]]}];
  for(const col of order){const x=centers[col],y=lanes[band][col];points.push({x,y});hallSegments.push({x,y,width:radii[band]*2+1,band,col})}
  points.push({x:band%2?3:w-4,y:lanes[band][order.at(-1)]});carve(points,radii[band]);spine.push(...points);
 }
 for(let band=0;band<bands-1;band++){const x=band%2?3:w-4,col=band%2?0:cols-1;carve([{x,y:lanes[band][col]},{x,y:lanes[band+1][col]}],Math.min(radii[band],radii[band+1]));if(random()<.35){const otherX=band%2?w-4:3,otherCol=band%2?cols-1:0;carve([{x:otherX,y:lanes[band][otherCol]},{x:otherX,y:lanes[band+1][otherCol]}],Math.min(radii[band],radii[band+1]))}}
 for(const r of rooms){const x=Math.floor(r.cx),y=r.hallSide<0?r.y+r.h:r.y-1,dy=-r.hallSide;r.doors.push({x:x+.5,y:y+.5,dx:0,dy});for(let yy=y;yy!==Math.round(laneAt(r.band,x))+dy;yy+=dy){grid[yy][x]=1;hallway.add(x+','+yy)}}
 const archiveRoom=rooms[archive],entrance=archiveRoom.doors[0],door={x:Math.floor(entrance.x),y:Math.floor(entrance.y)};grid[door.y][door.x]=2;
 const world={seed,w,h,size:size.name,grid,rooms,door,doors:[],corridors,hallway:[...hallway],spine,hallSegments,guards:[],cameras:[],lasers:[],cover:[],decor:[],mission:['ORCHID employee records','GLASSHOUSE research files','NIGHTJAR financial ledger'][Math.floor(random()*3)],ticket:'N-'+(100+Math.floor(random()*900)),supervisor:['MERCER','IVES','SATO'][Math.floor(random()*3)]};
 const point=n=>({x:center(n).x+.5,y:center(n).y+.5}),publicRooms=rooms.filter(r=>!r.archive),other=archiveRoom.doors[0];
 const startRoom=publicRooms.reduce((best,r)=>path(world,point(r.id),other,true).length>path(world,point(best.id),other,true).length?r:best,publicRooms[0]);world.start=point(startRoom.id);startRoom.type='lobby';startRoom.name='SERVICE LIFT';
 const choices=publicRooms.filter(r=>r.id!==startRoom.id).sort(()=>random()-.5),cardRoom=choices[0],powerRoom=choices[1],badgeRoom=choices[2];world.card=point(cardRoom.id);world.power=point(powerRoom.id);world.badge=point(badgeRoom.id);world.target=point(archive);cardRoom.name='ACCESS CONTROL';powerRoom.name='POWER CONTROL';badgeRoom.name='CONTRACTOR OFFICE';
 choices[3].restricted=true;choices[3].name='RESTRICTED LAB';
 for(const r of rooms.filter(r=>r.restricted))for(const entry of r.doors){const d={x:Math.floor(entry.x),y:Math.floor(entry.y),dx:entry.dx,dy:entry.dy,roomId:r.id,keyRequired:r.archive,open:false};world.doors.push(d);grid[d.y][d.x]=r.archive?2:4}
 // Cover lives off the central cross so every doorway and objective remains connected.
 const blocksDoor=(r,x,y,ww)=>r.doors.some(d=>d.dx&&Math.floor(d.y)===y||d.dy&&Math.floor(d.x)>=x&&Math.floor(d.x)<x+ww);
 for(const r of rooms){for(const side of[-1,1]){const xx=side<0?r.x+1:r.x+r.w-3,yy=side<0?r.y+1:r.y+r.h-2;const kind=r.type==='server'?'rack':r.type==='lounge'?'sofa':'desk';if(blocksDoor(r,xx,yy,2)||Math.abs(yy-Math.floor(r.cy))<1||xx<=Math.floor(r.cx)&&xx+1>=Math.floor(r.cx))continue;world.cover.push({x:xx,y:yy,w:2,h:1,kind});grid[yy][xx]=grid[yy][xx+1]=3}world.decor.push({x:r.x+.7,y:r.y+r.h-.7,kind:'plant'})}
 for(const r of rooms.filter(r=>r.w>=9&&r.h>=7&&r.type!=='lobby')){const cx=Math.floor(r.cx),cy=Math.floor(r.cy);for(const o of[{x:cx-3,y:cy-2,w:3,h:1},{x:cx+1,y:cy+2,w:3,h:1}]){if(blocksDoor(r,o.x,o.y,o.w)||o.x<r.x+1||o.x+o.w>r.x+r.w-1||o.y<=r.y||o.y>=r.y+r.h-1)continue;world.cover.push({...o,kind:r.type==='server'?'rack':'desk'});for(let x=o.x;x<o.x+o.w;x++)grid[o.y][x]=3}}
 world.patrolPoints=publicRooms.map(r=>point(r.id));
 const guardSpawns=publicRooms.filter(r=>r.id!==startRoom.id&&r.id!==badgeRoom.id).sort(()=>random()-.5);
 for(let i=0;i<4;i++){const spawn=point(guardSpawns[i].id);world.guards.push({...spawn,angle:random()*Math.PI*2,meter:0,cool:0,route:[],routeIndex:0,pause:random()*2,patrolSeed:Math.floor(random()*1e9),lastSeen:null,search:0})}
 for(const r of [cardRoom,archiveRoom,...choices.slice(3,5)]){const x=r.cx,y=r.y+.6;world.cameras.push({x,y,angle:Math.PI/2,baseAngle:Math.PI/2,phase:random()*6.28,meter:0,disabledUntil:0});r.security=true}
 // Waist-high equipment islands block camera sight, with routes on both sides.
 for(const segment of hallSegments.filter(s=>(s.col+s.band)%2===0||s.band===0&&s.col===1)){
  const obstacleX=[0,-2,2,-3,3].map(offset=>segment.x+offset).find(x=>!rooms.some(r=>r.band===segment.band&&Math.floor(r.doors[0].x)===x)&&grid[Math.round(laneAt(segment.band,x))]?.[x]===1&&grid[Math.round(laneAt(segment.band,x))]?.[x+1]===1);
  if(obstacleX===undefined)continue;
  const obstacle={x:obstacleX,y:Math.round(laneAt(segment.band,obstacleX)),w:1,h:1,kind:'rack',corridor:true};
  let cameraX=obstacle.x-2;if(grid[obstacle.y][cameraX]!==1)cameraX=obstacle.x-1;
  const camera={x:cameraX+.5,y:obstacle.y+.5,angle:0,baseAngle:0,phase:random()*6.28,meter:0,disabledUntil:0,corridor:true};
  if(grid[obstacle.y][obstacle.x]!==1||grid[obstacle.y][obstacle.x+1]!==1||grid[obstacle.y][cameraX]!==1)continue;
  grid[obstacle.y][obstacle.x]=3;world.cover.push(obstacle);camera.safeSpot={x:obstacle.x+1.5,y:obstacle.y+.5};world.cameras.push(camera);
 }
 // Hide-behind crates: set one row in from a hallway wall, leaving a pocket behind them and the lane centre clear.
 // A crate is kept only if the hallway floor stays one connected piece; door stubs and corridor cameras get a margin.
 const hallConnected=()=>{const floor=[...hallway].filter(k=>{const[x,y]=k.split(',').map(Number);return grid[y][x]!==3}),open=new Set(floor),seen=new Set([floor[0]]),queue=[floor[0]];for(let i=0;i<queue.length;i++){const[x,y]=queue[i].split(',').map(Number);for(const[dx,dy]of dirs){const next=(x+dx)+','+(y+dy);if(open.has(next)&&!seen.has(next)){seen.add(next);queue.push(next)}}}return seen.size===open.size};
 for(let band=0;band<bands;band++){
  let side=random()<.5?-1:1;
  for(let x=7+Math.floor(random()*4);x<w-9;x+=5+Math.floor(random()*4)){
   const lane=Math.round(laneAt(band,x));
   for(const trySide of[side,-side]){
    const y=lane+trySide*(radii[band]-1),tiles=[[x,y],[x+1,y]];
    const fits=tiles.every(([tx,ty])=>grid[ty]?.[tx]===1&&hallway.has(tx+','+ty)&&hallway.has(tx+','+(ty+trySide))&&hallway.has(tx+','+(ty-trySide)));
    const clear=!rooms.some(r=>r.band===band&&Math.sign(r.doors[0].y-lane)===trySide&&Math.abs(Math.floor(r.doors[0].x)-x-.5)<3)&&!world.cover.some(o=>x<o.x+o.w+2&&x+2>o.x-2&&y<o.y+o.h+2&&y+1>o.y-2)&&!world.cameras.some(c=>Math.hypot(c.x-x-1,c.y-y-.5)<3);
    if(!fits||!clear)continue;
    tiles.forEach(([tx,ty])=>grid[ty][tx]=3);
    if(!hallConnected()){tiles.forEach(([tx,ty])=>grid[ty][tx]=1);continue}
    world.cover.push({x,y,w:2,h:1,kind:'crate',hall:true});side=-trySide;break;
   }
  }
 }
 for(const r of choices.slice(3,6)){const entry=r.doors[0];if(!entry)continue;world.lasers.push({...entry,phase:random()*5,period:5,onTime:2.8})}
 world.edges=edges;
 world.stations=rooms.map(r=>{
  let effect=r.archive?'archive':r.id===powerRoom.id?'power':r.restricted?'lasers':r.type==='lobby'?'map':r.type==='office'?'cameras':r.type==='records'?'intel':r.type==='server'?'cameras':r.type==='lounge'?'supplies':'tools';
  const type=effect==='archive'?'cables':effect==='power'||effect==='lasers'?'breaker':effect==='intel'?'drawers':effect==='cameras'?(r.type==='server'?'cables':'route'):null;
  const primary=effect==='archive'||effect==='power',names={archive:'ENCRYPTED ARCHIVE',power:'POWER BREAKER',lasers:'LASER RELAY',map:'FLOOR DIRECTORY',cameras:r.type==='server'?'CAMERA PATCH BAY':'SECURITY LAPTOP',intel:'PATROL RECORDS',supplies:'DECOY SUPPLIES',tools:'TOOL BENCH'};
  return{id:r.id,roomId:r.id,x:r.cx+(primary?0:2),y:r.cy,effect,type,label:names[effect],sprite:effect==='intel'?'cabinet':effect==='supplies'?'supplies':effect==='tools'?'tools':effect==='power'||effect==='lasers'?'relay':'terminal',used:false,repeat:effect==='power'};
 });
 // Mission selection uses its own random stream so geometry stays reproducible.
 const missionRandom=rng(seed+':mission'),catalog=['archive','sabotage','intel','surveillance','wiretap','wipe','courier'];
 world.missionType=catalog[Math.floor(missionRandom()*catalog.length)];world.hotExtraction=false;
 const intel=world.stations.filter(s=>s.effect==='intel');
 if(intel.length<2){for(const s of world.stations.filter(s=>!['archive','power','lasers','map','intel'].includes(s.effect)).slice(0,2-intel.length)){s.effect='intel';s.type='drawers';s.label='PATROL RECORDS';s.sprite='cabinet'}}
 const shuffled=items=>{const copy=[...items];for(let i=copy.length-1;i>0;i--){const j=Math.floor(missionRandom()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]]}return copy};
 const files=shuffled(world.stations.filter(s=>s.effect==='intel')),candidates=shuffled(world.stations.filter(s=>!['archive','power','lasers','map','intel'].includes(s.effect))),step=s=>'station:'+s.id;
 const convert=(station,effect,type,label)=>{station.effect=effect;station.type=type;station.label=label;station.sprite=type==='drawers'?'cabinet':'terminal';station.assignment=true;rooms[station.roomId].name=label;return station};
 if(world.missionType==='archive')world.missionSteps=['card','power','archive'];
 if(world.missionType==='sabotage')world.missionSteps=['power','lasers'];
 if(world.missionType==='intel')world.missionSteps=files.slice(0,2).map(step);
 if(world.missionType==='surveillance'){
  let nodes=shuffled(world.stations.filter(s=>s.effect==='cameras'));
  for(const candidate of candidates){if(nodes.length>=2)break;if(!nodes.includes(candidate))nodes.push(convert(candidate,'cameras','route','SECURITY NETWORK NODE'))}
  nodes.slice(0,2).forEach(s=>{s.assignment=true;s.permanentLoop=true});world.missionSteps=nodes.slice(0,2).map(step);
 }
 if(world.missionType==='wiretap')world.missionSteps=candidates.slice(0,2).map((s,i)=>step(convert(s,'wiretap','cables','COMMS UPLINK '+(i+1))));
 if(world.missionType==='wipe'){
  const authorization=files[0],terminal=convert(candidates[0],'wipe','route','RESEARCH ERASURE TERMINAL');authorization.label='ERASURE AUTHORIZATION FILE';terminal.requires=authorization.id;
  world.missionSteps=[step(authorization),step(terminal)];
 }
 if(world.missionType==='courier'){
  const pickup=convert(candidates[0],'drive','drawers','ENCRYPTED DRIVE CABINET'),receiver=convert(candidates[1],'upload','cables','DEAD-DROP TRANSMITTER');receiver.requires=pickup.id;
  world.missionSteps=[step(pickup),step(receiver)];
 }
 world.missionTitle={archive:'Recover classified files',sabotage:'Sabotage building security',intel:'Gather patrol intelligence',surveillance:'Blind the surveillance network',wiretap:'Plant communications wiretaps',wipe:'Erase the research evidence',courier:'Deliver an encrypted dead drop'}[world.missionType];
 return world;
}
root.World={generate,rng,reachable,path,roomAt};if(typeof module!=='undefined')module.exports=root.World;
})(typeof globalThis!=='undefined'?globalThis:this);

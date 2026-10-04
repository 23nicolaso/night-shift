from pathlib import Path
p=Path('world.js');s=p.read_text(encoding='utf-8');a=s.index(' const random=rng(seed)');b=s.index(' const archiveRoom=',a)
s=s[:a]+''' const random=rng(seed),sizePresets=[{name:'small',cols:2,bands:2},{name:'medium',cols:3,bands:2},{name:'large',cols:3,bands:3},{name:'wide',cols:4,bands:2}],size=sizePresets[Math.floor(random()*sizePresets.length)],{cols,bands}=size,perBand=cols*2,count=perBand*bands,archive=Math.floor(random()*count),rooms=[],edges=[];
 const types=['office','records','server','lounge','workshop','office','records','lounge','server','workshop','office','records'];
 const specs=Array.from({length:count},()=>({w:6+Math.floor(random()*6),h:5+Math.floor(random()*5)}));
 const widths=Array.from({length:cols},(_,col)=>Math.max(...specs.filter((_,i)=>Math.floor(i/2)%cols===col).map(s=>s.w))+5),xs=widths.map((_,i)=>5+widths.slice(0,i).reduce((a,b)=>a+b,0)),w=widths.reduce((a,b)=>a+b,0)+10;
 const radii=Array.from({length:bands},()=>1+Math.floor(random()*2)),lanes=[];let bottom=3;
 for(let band=0;band<bands;band++){const group=specs.slice(band*perBand,(band+1)*perBand),topDepth=Math.max(...group.filter((_,i)=>i%2===0).map(s=>s.h)),base=bottom+topDepth+radii[band]+5,wave=random()<.5?-1:1;lanes.push(Array.from({length:cols},(_,col)=>base+(col%2?-wave:wave)*(1+Math.floor(random()*3))));bottom=Math.max(...lanes[band])+radii[band]+2+Math.max(...group.filter((_,i)=>i%2===1).map(s=>s.h))+3}
 const centers=xs.map((x,col)=>x+Math.floor(widths[col]/2)),laneAt=(band,x)=>{if(x<=centers[0])return lanes[band][0];for(let col=1;col<cols;col++)if(x<=centers[col]){const ratio=(x-centers[col-1])/(centers[col]-centers[col-1]);return lanes[band][col-1]+ratio*(lanes[band][col]-lanes[band][col-1])}return lanes[band][cols-1]};
 const h=bottom+3,grid=Array.from({length:h},()=>Array(w).fill(0));
 for(let n=0;n<count;n++){
  const band=Math.floor(n/perBand),col=Math.floor(n/2)%cols,side=n%2===0?-1:1,{w:rw,h:rh}=specs[n],x=xs[col]+2+Math.floor(random()*(widths[col]-rw-3)),low=Math.min(laneAt(band,x),laneAt(band,x+rw-1)),high=Math.max(laneAt(band,x),laneAt(band,x+rw-1)),edge=side<0?Math.floor(low)-radii[band]-1:Math.ceil(high)+radii[band]+1,y=side<0?edge-rh:edge+1,type=n===archive?'archive':types[n%types.length];
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
'''+s[b:]
s=s.replace('const world={seed,w,h,grid,', 'const world={seed,w,h,size:size.name,grid,')
a=s.index(' for(const segment of hallSegments.filter');b=s.index(' for(const r of choices.slice(3,6))',a)
s=s[:a]+''' for(const segment of hallSegments.filter(s=>(s.col+s.band)%2===0||s.band===0&&s.col===1)){
  const obstacle={x:segment.x,y:segment.y,w:1,h:1,kind:'rack',corridor:true};
  let cameraX=obstacle.x-2;if(grid[obstacle.y][cameraX]!==1)cameraX=obstacle.x-1;
  const camera={x:cameraX+.5,y:segment.y+.5,angle:0,baseAngle:0,phase:random()*6.28,meter:0,disabledUntil:0,corridor:true};
  if(grid[obstacle.y][obstacle.x]!==1||grid[obstacle.y][obstacle.x+1]!==1||grid[obstacle.y][cameraX]!==1)continue;
  grid[obstacle.y][obstacle.x]=3;world.cover.push(obstacle);camera.safeSpot={x:obstacle.x+1.5,y:segment.y+.5};world.cameras.push(camera);
 }
'''+s[b:]
s=s.replace("world.missionSteps=nodes.slice(0,2).map(step);", "nodes.slice(0,2).forEach(s=>{s.assignment=true;s.permanentLoop=true});world.missionSteps=nodes.slice(0,2).map(step);")
p.write_text(s,encoding='utf-8')

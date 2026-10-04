// Original offline pixel art. 20px tiles, displayed at 1.8x zoom.
const Art={
 roomIcon(ctx,type,x,y,size=26,restricted=false){
  ctx.save();ctx.translate(Math.round(x),Math.round(y));ctx.scale(size/24,size/24);
  ctx.fillStyle='#102632';ctx.fillRect(-12,-12,24,24);ctx.strokeStyle=restricted?'#f1ac78':'#78c9b7';ctx.lineWidth=1;ctx.strokeRect(-11.5,-11.5,23,23);ctx.fillStyle=restricted?'#ffc08b':'#baf4df';ctx.strokeStyle=ctx.fillStyle;ctx.lineWidth=2;
  const stroke=points=>{ctx.beginPath();points.forEach(([xx,yy],i)=>i?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy));ctx.stroke()},polygon=points=>{ctx.beginPath();points.forEach(([xx,yy],i)=>i?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy));ctx.closePath();ctx.fill()};
  if(type==='power'||type==='lasers'){polygon([[1,-9],[-6,1],[-1,1],[-3,9],[7,-2],[2,-2],[5,-9]]);if(type==='lasers'){ctx.fillRect(-9,-6,2,12);ctx.fillRect(8,-6,2,12)}}
  else if(type==='wiretap'){ctx.strokeRect(-5,-1,10,9);stroke([[0,-1],[0,-7]]);stroke([[-5,-7],[-7,-4],[-7,0]]);stroke([[5,-7],[7,-4],[7,0]]);ctx.fillRect(-2,3,4,2)}
  else if(type==='upload'){ctx.strokeRect(-8,-3,16,11);stroke([[-7,-2],[0,4],[7,-2]]);stroke([[0,-4],[0,-9],[-3,-6]]);stroke([[0,-9],[3,-6]])}
  else if(type==='drive'){ctx.strokeRect(-4,-3,8,11);ctx.strokeRect(-3,-8,6,5);ctx.fillRect(-1,-7,2,2);ctx.fillRect(-1,3,2,2)}
  else if(type==='cameras'){ctx.strokeRect(-8,-4,11,8);polygon([[3,-3],[8,-6],[8,6],[3,3]]);ctx.fillRect(-4,5,3,3)}
  else if(type==='archive'||type==='intel'||type==='wipe'){ctx.strokeRect(-8,-4,16,12);stroke([[-8,-4],[-8,-7],[-2,-7],[1,-4]]);if(type==='archive'){ctx.fillRect(-2,0,4,5);ctx.strokeRect(-2,-2,4,4)}else if(type==='wipe'){stroke([[-4,-1],[4,5]]);stroke([[4,-1],[-4,5]])}else{ctx.fillRect(-5,0,10,1);ctx.fillRect(-5,3,7,1)}}
  else if(type==='tools'){stroke([[-5,7],[4,-2]]);stroke([[3,-2],[0,-4],[1,-8],[3,-4],[6,-4],[8,-6],[8,-2],[4,0]]);ctx.strokeRect(-7,5,3,3)}
  else if(type==='supplies'){ctx.strokeRect(-5,-5,10,12);ctx.fillRect(-2,-8,4,3);stroke([[6,-4],[8,-2],[8,2],[6,4]]);ctx.fillRect(-2,-1,4,3)}
  else if(type==='card'){ctx.strokeRect(-8,-5,16,11);ctx.fillRect(-7,-2,14,2);ctx.fillRect(3,3,3,2)}
  else{ctx.strokeRect(-8,-8,16,16);stroke([[-4,3],[-4,-3],[-7,0]]);stroke([[4,-3],[4,3],[7,0]])}
  ctx.restore();
 },
 tile(ctx,x,y,t,n,type){
  const palette={office:['#33475a','#3a5065'],records:['#534c45','#5d564b'],lounge:['#514c60','#5d556b'],server:['#34434b','#3b4d55'],workshop:['#4b5356','#555d60'],archive:['#30514d','#385c56'],lobby:['#536569','#5f7275'],corridor:['#384451','#404e5a']}[type]||['#384451','#404e5a'];
  if(!t){ctx.fillStyle='#1c2937';ctx.fillRect(x,y,20,20);ctx.fillStyle='#344656';ctx.fillRect(x,y,20,3);ctx.fillStyle='#263847';ctx.fillRect(x+1,y+4,18,13);ctx.fillStyle='#425463';ctx.fillRect(x+2,y+4,16,1);ctx.fillStyle='#101c29';ctx.fillRect(x,y+17,20,3);if(n%4===0){ctx.fillStyle='#1b2937';ctx.fillRect(x+8,y+4,1,13)}return}
  ctx.fillStyle=palette[n%2];ctx.fillRect(x,y,20,20);if(type==='office')Textures.fill(ctx,'carpet',x,y,20,20);if(type==='records'||type==='lounge')Textures.fill(ctx,'wood',x,y,20,20);if(type==='server'||type==='workshop')Textures.fill(ctx,'brushed-metal',x,y,20,20);
  if(type==='records'||type==='lounge'){ctx.fillStyle='#222b3144';for(let i=0;i<3;i++){ctx.fillRect(x,y+6+i*6,20,1);ctx.fillRect(x+(n%2?5:13),y+i*6,1,6)}ctx.fillStyle='#b7a08022';ctx.fillRect(x+2,y+2,12,1)}
  else if(type==='office'){ctx.fillStyle='#526c7a55';for(let i=2;i<20;i+=4)ctx.fillRect(x+i,y,1,20);ctx.fillStyle='#132a3b33';for(let i=1;i<20;i+=3)ctx.fillRect(x,y+i,20,1)}
  else{ctx.fillStyle='#a6c2c020';ctx.fillRect(x+1,y+1,18,1);ctx.fillRect(x+1,y+1,1,18);ctx.fillStyle='#0e20344a';ctx.fillRect(x+19,y,1,20);ctx.fillRect(x,y+19,20,1)}
  if(type==='workshop'&&n%5===0){ctx.fillStyle='#9ba7a326';ctx.fillRect(x+3,y+7,9,1);ctx.fillRect(x+8,y+11,5,1)}
  if(type==='server'&&n%4===0){ctx.fillStyle='#789caa55';ctx.fillRect(x+4,y+5,12,1);ctx.fillRect(x+4,y+9,12,1);ctx.fillRect(x+4,y+13,12,1)}
 },
 room(ctx,r){const x=r.x*20,y=r.y*20,w=r.w*20,h=r.h*20;ctx.strokeStyle=r.archive?'#75d7b777':'#88a6b43a';ctx.lineWidth=1;ctx.strokeRect(x+2,y+2,w-4,h-4);for(let i=1;i<r.w;i+=4){ctx.fillStyle='#172636';ctx.fillRect(x+i*20,y+1,20,4);ctx.fillStyle=r.archive?'#96e6c9':'#b8d6cb';ctx.fillRect(x+i*20+2,y+1,16,2)}ctx.fillStyle='#172636bb';ctx.fillRect(x+5,y+8,Math.min(w-10,r.name.length*4+8),12);ctx.font='7px monospace';ctx.fillStyle=r.archive?'#a4efd7':'#c2d4d4';ctx.fillText(r.name,x+9,y+17);if(r.restricted){ctx.strokeStyle='#e1b677';ctx.setLineDash([4,3]);ctx.strokeRect(x+12,y+22,w-24,h-34);ctx.setLineDash([])}if(r.type==='lounge'){ctx.fillStyle='#766777';ctx.fillRect(x+w/2-23,y+h/2-20,46,40);ctx.strokeStyle='#a58c96';ctx.strokeRect(x+w/2-20,y+h/2-17,40,34)}},
 door(ctx,x,y,open){ctx.fillStyle='#10232e';ctx.fillRect(x,y,20,20);ctx.fillStyle=open?'#4b6868':'#779caa';ctx.fillRect(x+1,y+1,7,18);ctx.fillRect(x+12,y+1,7,18);ctx.fillStyle=open?'#93e4bd':'#67dbda';ctx.fillRect(x+3,y+4,2,12);ctx.fillRect(x+15,y+4,2,12);if(!open){ctx.fillStyle='#304451';ctx.fillRect(x+8,y,4,20);ctx.fillStyle='#eab871';ctx.fillRect(x+9,y+8,2,3)}ctx.fillStyle='#f0bd75';for(let i=0;i<20;i+=4){ctx.fillRect(x+i,y,2,2);ctx.fillRect(x+i,y+18,2,2)}},
 person(ctx,o,guard,time,moving){
  const facing=((Math.round(o.angle/(Math.PI/2))%4)+4)%4,side=facing===0||facing===2,back=facing===3,sign=facing===2?-1:1;
  const frame=moving?Math.floor(time*(o.sneaking?7:12))%4:0,stride=moving?[0,2,0,-2][frame]:0,bob=moving&&frame%2?1:0;
  ctx.save();ctx.translate(Math.round(o.x*20),Math.round(o.y*20));
  ctx.fillStyle='#060e19aa';ctx.fillRect(-7,9,14,3);
  // Direction is expressed by the pose; the body stays upright on screen.
  ctx.fillStyle=guard?'#3c4654':'#203544';
  if(side){ctx.fillRect(-2-stride,4,4,7);ctx.fillRect(-2+stride,4,4,7)}else{ctx.fillRect(-5,4+stride,4,6);ctx.fillRect(1,4-stride,4,6)}
  ctx.fillStyle=guard?'#a0abb5':'#6c9c9b';
  if(side){ctx.fillRect(-2-stride,10,5,2);ctx.fillRect(-2+stride,10,5,2)}else{ctx.fillRect(-5,9+stride,4,2);ctx.fillRect(1,9-stride,4,2)}
  ctx.translate(0,bob);
  ctx.fillStyle=guard?'#a06f55':'#3f8e86';ctx.fillRect(side?-4:-6,-4,side?8:12,9);
  ctx.fillStyle=guard?'#d6aa76':'#83c8b1';ctx.fillRect(side?-3:-4,-4,side?5:8,3);
  ctx.fillStyle=guard?'#596477':'#294f60';
  if(back){ctx.fillRect(-4,-3,8,7);ctx.fillStyle=guard?'#9fabb5':'#6bb2a8';ctx.fillRect(-3,-2,6,1)}
  else{ctx.fillStyle='#213442';ctx.fillRect(side?-3:-5,3,side?6:10,2);ctx.fillStyle=guard?'#f1c384':'#c2eee0';ctx.fillRect(side?sign*2:-3,-1,2,2)}
  ctx.fillStyle=guard?'#566170':'#2a6264';
  if(side){ctx.fillRect(-2,-2-stride,4,7);ctx.fillStyle=guard?'#bdc7c8':'#a3d6bf';ctx.fillRect(-2,4-stride,3,2)}
  else{ctx.fillRect(-7,-2+stride,3,6);ctx.fillRect(4,-2-stride,3,6);ctx.fillStyle=guard?'#bdc7c8':'#a3d6bf';ctx.fillRect(-7,4+stride,3,2);ctx.fillRect(4,4-stride,3,2)}
  // Robot guards have an angular sensor housing; the agent has hair and a face.
  ctx.fillStyle=guard?'#8e9da9':'#e1c3a0';ctx.fillRect(side?-3:-4,-11,side?6:8,7);
  ctx.fillStyle=guard?'#3a4c5e':'#233c4c';ctx.fillRect(side?-4:-5,-12,side?8:10,3);
  if(back){ctx.fillStyle=guard?'#c2cdd0':'#314957';ctx.fillRect(-3,-9,6,4);if(guard){ctx.fillStyle='#ffb277';ctx.fillRect(-1,-8,2,2)}}
  else if(side){ctx.fillStyle=guard?'#263d4f':'#c9a381';ctx.fillRect(sign>0?1:-4,-9,3,4);ctx.fillStyle=guard?'#ff966d':'#b5ffe7';ctx.fillRect(sign>0?2:-4,-8,2,2)}
  else{ctx.fillStyle=guard?'#213649':'#304c53';ctx.fillRect(-4,-9,8,3);ctx.fillStyle=guard?'#ff966d':'#a7ffe0';ctx.fillRect(-3,-8,6,1)}
  ctx.restore();
 },
 object(ctx,o,kind,active=true){if((kind==='power'||kind==='terminal')&&Textures.prop(ctx,kind==='power'?'relay':'terminal',o,!active))return;ctx.save();ctx.translate(o.x*20,o.y*20);ctx.fillStyle='#0a162a99';ctx.fillRect(-10,-5,21,18);
  if(kind==='paper'){ctx.fillStyle='#a68a66';ctx.fillRect(-8,-8,16,18);ctx.fillStyle='#efead5';ctx.fillRect(-6,-9,12,16);ctx.fillStyle='#779294';ctx.fillRect(-3,-6,7,1);ctx.fillRect(-3,-3,6,1);ctx.fillRect(-3,0,8,1);ctx.fillStyle='#dc9c68';ctx.fillRect(-3,3,4,2)}
  else if(kind==='card'){ctx.fillStyle='#70efe0';ctx.fillRect(-8,-5,16,10);ctx.fillStyle='#253b50';ctx.fillRect(-7,-4,14,2);ctx.fillStyle='#d8e3d2';ctx.fillRect(-6,0,4,3);ctx.fillStyle='#258b91';ctx.fillRect(1,-1,5,1);ctx.fillRect(1,2,5,1)}
  else if(kind==='elevator'){ctx.fillStyle='#91a5ac';ctx.fillRect(-15,-16,30,32);ctx.fillStyle='#304759';ctx.fillRect(-12,-13,11,25);ctx.fillRect(1,-13,11,25);ctx.fillStyle='#688898';ctx.fillRect(-10,-11,2,21);ctx.fillRect(3,-11,2,21);ctx.fillStyle='#b5f0ce';ctx.fillRect(15,-5,3,7);ctx.fillStyle='#263b4d';ctx.fillRect(-15,13,30,4);ctx.fillStyle='#c2be8b';ctx.fillRect(-13,14,26,1)}
  else if(kind==='camera'){ctx.rotate(o.angle);ctx.fillStyle='#708b9c';ctx.fillRect(-7,-5,13,10);ctx.fillStyle='#c5d4d0';ctx.fillRect(-7,-5,11,2);ctx.fillStyle='#21394e';ctx.fillRect(4,-4,5,8);ctx.fillStyle=active?'#ffc886':'#628784';ctx.fillRect(6,-2,3,4);ctx.fillStyle=active?'#fe856f':'#3a555e';ctx.fillRect(-4,2,2,2)}
  else if(kind==='power'){ctx.fillStyle='#768b96';ctx.fillRect(-10,-13,20,26);ctx.fillStyle='#263e51';ctx.fillRect(-8,-11,16,9);ctx.fillStyle='#9cf0bd';ctx.fillRect(-6,-9,12,4);ctx.fillStyle='#edc979';ctx.fillRect(-6,-3,4,2);ctx.fillStyle='#273f50';for(let i=0;i<3;i++)ctx.fillRect(-6,3+i*3,12,1);ctx.fillStyle='#d0d6bc';ctx.fillRect(7,3,1,4)}
  else{ctx.fillStyle='#647f8c';ctx.fillRect(-12,-12,24,17);ctx.fillStyle='#192c42';ctx.fillRect(-10,-10,20,12);ctx.fillStyle=active?'#d4ad73':'#76d9bf';for(let i=0;i<4;i++)ctx.fillRect(-7,-7+i*2,8+(i%2)*4,1);ctx.fillStyle='#344b5d';ctx.fillRect(-2,5,4,4);ctx.fillStyle='#93a9ac';ctx.fillRect(-12,9,24,3);ctx.fillStyle='#415969';for(let i=0;i<6;i++)ctx.fillRect(-10+i*3,10,2,1)}ctx.restore()},
 cover(ctx,o){const x=o.x*20,y=o.y*20,w=o.w*20,h=o.h*20;ctx.fillStyle='#0a142a90';ctx.fillRect(x+2,y+4,w,h);if(o.kind==='crate'){for(let i=0;i<o.w;i++){const cx=x+i*20;ctx.fillStyle='#5a4632';ctx.fillRect(cx+1,y+1,18,18);ctx.fillStyle='#8a6a45';ctx.fillRect(cx+2,y+2,16,16);ctx.fillStyle='#a8845a';ctx.fillRect(cx+2,y+2,16,2);ctx.fillStyle='#5a4632';ctx.fillRect(cx+2,y+9,16,2);ctx.fillRect(cx+9,y+2,2,16);ctx.fillStyle='#c9a978';ctx.fillRect(cx+4,y+5,3,1)}}else if(o.kind==='rack'){ctx.fillStyle='#192d41';ctx.fillRect(x,y,w,h);ctx.fillStyle='#718592';ctx.fillRect(x,y,w,2);for(let i=3;i<h;i+=4){ctx.fillStyle='#324f62';ctx.fillRect(x+2,y+i,w-4,2);ctx.fillStyle='#94e5c3';ctx.fillRect(x+4,y+i,2,1);ctx.fillStyle='#e5b775';ctx.fillRect(x+8,y+i,2,1)}}else if(o.kind==='sofa'){ctx.fillStyle='#705c71';ctx.fillRect(x,y,w,h);ctx.fillStyle='#aa8090';ctx.fillRect(x+3,y+3,w-6,h-5);ctx.fillStyle='#4b445d';ctx.fillRect(x,y,4,h);ctx.fillRect(x+w-4,y,4,h);ctx.fillRect(x+w/2,y+3,1,h-5)}else{ctx.fillStyle='#564939';ctx.fillRect(x,y,w,h);ctx.fillStyle='#a78e69';ctx.fillRect(x+1,y+1,w-2,h-4);ctx.fillStyle='#c5ac7e';ctx.fillRect(x+2,y+2,w-4,1);ctx.fillStyle='#263d50';ctx.fillRect(x+4,y+4,11,7);ctx.fillStyle='#8de1cd';ctx.fillRect(x+6,y+5,7,3);ctx.fillStyle='#dedac0';ctx.fillRect(x+w-12,y+5,7,9);ctx.fillStyle='#789399';ctx.fillRect(x+w-10,y+7,3,1);ctx.fillRect(x+w-10,y+10,3,1)}},
 decor(ctx,o){const x=o.x*20,y=o.y*20;ctx.fillStyle='#725d4c';ctx.fillRect(x-4,y,8,7);ctx.fillStyle='#405f55';ctx.fillRect(x-7,y-7,14,8);ctx.fillStyle='#88b88c';ctx.fillRect(x-3,y-11,5,10);ctx.fillStyle='#5d9775';ctx.fillRect(x-7,y-6,4,3);ctx.fillRect(x+3,y-8,4,4)},
 laser(ctx,l,on,time){const x=l.x*20,y=l.y*20;ctx.fillStyle='#607886';if(l.dx){ctx.fillRect(x-3,y-10,6,4);ctx.fillRect(x-3,y+6,6,4)}else{ctx.fillRect(x-10,y-3,4,6);ctx.fillRect(x+6,y-3,4,6)}ctx.strokeStyle=on?'#ff7669':'#4f8879';ctx.lineWidth=on?1.5:.5;ctx.beginPath();if(l.dx){ctx.moveTo(x,y-7);ctx.lineTo(x,y+7)}else{ctx.moveTo(x-7,y);ctx.lineTo(x+7,y)}ctx.stroke();if(on){ctx.strokeStyle='#ffc2a277';ctx.lineWidth=4;ctx.stroke()}else{ctx.fillStyle='#83eac2';ctx.fillRect(x-2,y-2,4,4)}},
 // Interactable cues: a bobbing diamond over usable things, and an [E] keycap plus ring on whatever is in reach.
 marker(ctx,x,y,time,goal){const bob=Math.sin(time*4)*1.5;ctx.save();ctx.translate(x,y+bob);ctx.globalAlpha=.7+.3*Math.sin(time*4);ctx.fillStyle=goal?'#f3bc6c':'#9ef0d9';ctx.strokeStyle='#0b1420';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,-4.5);ctx.lineTo(3.5,0);ctx.lineTo(0,4.5);ctx.lineTo(-3.5,0);ctx.closePath();ctx.stroke();ctx.fill();ctx.restore()},
 reach(ctx,x,y,lift,time){ctx.save();ctx.strokeStyle='#9ef0d9';ctx.lineWidth=1;ctx.globalAlpha=.65+.35*Math.sin(time*5);ctx.beginPath();ctx.arc(x,y,11+Math.sin(time*5),0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;const top=y-lift-21+Math.sin(time*4);ctx.fillStyle='#0b1420';ctx.fillRect(x-6,top-1,12,13);ctx.fillStyle='#e7f6ee';ctx.fillRect(x-5,top,10,10);ctx.fillStyle='#9fb6bc';ctx.fillRect(x-5,top+10,10,1.5);ctx.fillStyle='#0b1420';ctx.font='bold 8px monospace';ctx.textAlign='center';ctx.fillText('E',x,top+8);ctx.restore()}
};

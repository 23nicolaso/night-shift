// Pure minigame rules, independently testable without rendering or a browser.
const Puzzles={
 rotateMask(mask){return ((mask<<1)&15)|((mask>>3)&1)},
 make(type,seed){const random=World.rng(seed),s={type,time:0,won:false,faults:0};
  if(type==='route'){
   s.startRow=random()<.5?1:2;s.endRow=3-s.startRow;
   let points=[[0,1],[1,1],[1,0],[2,0],[2,1],[2,2],[3,2]];if(s.startRow===2)points=points.map(([x,y])=>[x,3-y]);
   s.masks=Array.from({length:16},()=>random()<.5?5:3);s.solution={};
   const side=(a,b)=>b[0]>a[0]?2:b[0]<a[0]?8:b[1]>a[1]?4:1;
   points.forEach((p,i)=>{s.solution[p[1]*4+p[0]]=side(p,i?points[i-1]:[-1,s.startRow])|side(p,i<points.length-1?points[i+1]:[4,s.endRow])});
   for(const[k,v]of Object.entries(s.solution)){s.masks[k]=v;for(let n=0;n<1+Math.floor(random()*3);n++)s.masks[k]=this.rotateMask(s.masks[k])}
   if(this.connected(s))s.masks[s.startRow*4]=this.rotateMask(s.masks[s.startRow*4]);
  }else if(type==='cables'){s.order=[0,1,2,3];for(let i=3;i>0;i--){const j=Math.floor(random()*(i+1));[s.order[i],s.order[j]]=[s.order[j],s.order[i]]}s.links={};s.drag=null}
  else if(type==='breaker'){s.hits=0;s.center=.35+random()*.3;s.width=.25;s.needle=.05;s.speed=.68;s.lastHit=-1}
  else if(type==='drawers'){s.target=Math.floor(random()*4);s.open=[0,0,0,0];s.drag=null}
  return s;
 },
 connected(s){const start=s.startRow*4;if(!(s.masks[start]&8)){s.live=new Set();return false}const queue=[start],live=new Set([start]),dirs=[[0,-1,1,4],[1,0,2,8],[0,1,4,1],[-1,0,8,2]];for(let i=0;i<queue.length;i++){const n=queue[i],x=n%4,y=Math.floor(n/4);for(const[dx,dy,bit,other]of dirs){const xx=x+dx,yy=y+dy,k=yy*4+xx;if(xx<0||xx>3||yy<0||yy>3||!(s.masks[n]&bit)||!(s.masks[k]&other)||live.has(k))continue;live.add(k);queue.push(k)}}s.live=live;return live.has(s.endRow*4+3)&&!!(s.masks[s.endRow*4+3]&2)},
 rotate(s,index){if(s.won||index<0||index>=16)return;s.masks[index]=this.rotateMask(s.masks[index]);s.won=this.connected(s)},
 cable(s,source,destination){if(s.won||source<0||source>3||destination<0||destination>3||source in s.links)return false;if(s.order[destination]!==source){s.faults++;return false}s.links[source]=destination;s.won=Object.keys(s.links).length===4;return true},
 tick(s,dt){s.time+=dt;if(s.type==='breaker'){const phase=(s.time*s.speed)%2;s.needle=phase<=1?phase:2-phase}},
 strike(s){if(s.won||s.time-s.lastHit<.25)return false;s.lastHit=s.time;if(Math.abs(s.needle-s.center)>s.width/2){s.faults++;return false}s.hits++;s.won=s.hits>=3;s.width=Math.max(.14,s.width-.04);s.center=.3+((s.hits*37)%40)/100;return true},
 drawer(s,index,amount){s.open[index]=Math.max(0,Math.min(1,amount));if(index===s.target&&s.open[index]>.9)s.won=true}
};
if(typeof module!=='undefined')module.exports=Puzzles;

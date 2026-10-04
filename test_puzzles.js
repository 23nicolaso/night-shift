const assert=require('node:assert/strict');global.World=require('./world.js');const P=require('./puzzles.js');
for(let seed=0;seed<500;seed++){
 const s=P.make('route',seed);assert(!s.won);assert(!P.connected(s),'route starts solved');
 for(const[index,mask]of Object.entries(s.solution)){let count=0;while(s.masks[index]!==mask&&count++<4)P.rotate(s,Number(index));assert(count<=4)}assert(P.connected(s),'route cannot be solved');
 const cables=P.make('cables',seed);assert.equal(new Set(cables.order).size,4);for(let i=0;i<4;i++)assert(P.cable(cables,i,cables.order.indexOf(i)));assert(cables.won);assert(!P.cable(cables,0,cables.order.indexOf(0)));
 const b=P.make('breaker',seed);for(let stage=0;stage<3;stage++){let steps=0;while((Math.abs(b.needle-b.center)>b.width/4||b.time-b.lastHit<.3)&&steps++<1000)P.tick(b,.01);assert(P.strike(b),'green-zone hit rejected')}assert(b.won);
 const d=P.make('drawers',seed);for(let i=0;i<4;i++){P.drawer(d,i,.8);assert(!d.won)}P.drawer(d,d.target,1);assert(d.won);
}
const bad=P.make('cables','fault');for(let i=0;i<3;i++)assert(!P.cable(bad,0,(bad.order.indexOf(0)+1)%4));assert.equal(bad.faults,3);assert(!bad.won);
console.log('PASS: 500 seeds × 4 visual puzzles; circuit solvability, cable matching/faults, breaker timing, drawer retrieval and no duplicate credit.');

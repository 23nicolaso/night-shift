const assert=require('node:assert/strict'),World=require('./world.js');
const layouts=new Set(),guards=new Set(),furniture=new Set(),security=new Set();let largeLasers=0,pushables=0;
for(let i=0;i<250;i++){
 const w=World.generate('variation-'+i),before=World.reachable(w,false),after=World.reachable(w,true),key=o=>Math.floor(o.x)+','+Math.floor(o.y);
 layouts.add(w.layout);security.add(w.securityVariant);
 for(const o of [w.card,w.badge,w.power,...w.extraCards,...w.notes])assert(before.has(key(o)),`prerequisite unreachable ${i}`);
 for(const o of [w.target,w.start,...w.stations])assert(after.has(key(o)),`station unreachable ${i}`);
 assert(!before.has(key(w.target)),`vault bypass ${i}`);
 for(const g of w.guards){guards.add(g.profile);assert(after.has(key(g)));assert(g.speed>0&&g.hearing>0)}
 for(const o of w.cover.filter(o=>o.hall)){furniture.add(o.kind);if(o.pushable)pushables++}
 for(const l of w.lasers.filter(l=>l.length)){largeLasers++;assert(l.onTime<l.period*.6);assert(l.length>=11)}
 assert.deepEqual(w,World.generate('variation-'+i));
}
assert.equal(layouts.size,5);assert.equal(guards.size,4);assert.equal(furniture.size,7);assert.equal(security.size,3);assert(pushables>50);assert(largeLasers>50);
console.log('PASS: 250 deterministic varied floors; all prerequisites and stations reachable, five layouts, four guard profiles, seven furniture types, dual cards/passwords, pushable crates and timed laser banks.');

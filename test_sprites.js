const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const context={};vm.createContext(context);vm.runInContext(fs.readFileSync('art.js','utf8'),context);
vm.runInContext(`
const poses=[];
for(const guard of [false,true])for(let direction=0;direction<4;direction++){
 const frames=[];
 for(let frame=0;frame<4;frame++){
  const calls=[],ctx={save(){},restore(){},translate(){},rotate(){throw Error('body rotated')},fillRect(...args){calls.push([this.fillStyle,...args])}};
  Art.person(ctx,{x:1,y:1,angle:direction*Math.PI/2},guard,(frame+.1)/12,true);frames.push(JSON.stringify(calls));
 }
 if(new Set(frames).size<3)throw Error('missing walk frames');poses.push(frames[0]);
 const idle=[];for(const time of [0,1]){const calls=[],ctx={save(){},restore(){},translate(){},fillRect(...args){calls.push(args)}};Art.person(ctx,{x:1,y:1,angle:direction*Math.PI/2},guard,time,false);idle.push(JSON.stringify(calls))}if(idle[0]!==idle[1])throw Error('idle feet moving');
}
if(new Set(poses).size!==8)throw Error('missing distinct directional or robot poses');
`,context);
console.log('PASS: eight upright directional poses, walking frames and stable idle poses.');

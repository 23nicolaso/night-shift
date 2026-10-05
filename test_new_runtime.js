// Extend the real runtime adapter without duplicating its setup.
const fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('test_game.js','utf8');
const checks=`
vm.runInContext(\`{
originalReset('new-runtime',false);world.guards=[];world.cameras=[];world.lasers=[];mode='play';keys.clear();p={...world.start,angle:0};const sx=p.x;keys.add('d');update(.05);keys.clear();if(p.x-sx<.25||!noiseMarks.some(n=>n.kind==='footstep'))throw Error('faster noisy running failed');
noiseMarks=[];p={...world.start,angle:0};keys.add('d');keys.add('Shift');update(.05);keys.clear();if(noiseMarks.length)throw Error('sneaking made noise');
const listener={x:p.x+3,y:p.y,angle:0,hearing:19,cool:10,meter:0,pause:0,route:[],routeIndex:0,patrolSeed:1};world.guards=[listener];makeNoise(p,10,'footstep');if(!listener.lastSeen||Math.abs(listener.angle)<.1)throw Error('guard did not turn/investigate running noise');world.guards=[];
card=true;const d=world.doors.find(d=>d.keyRequired);d.cardsRequired=0;d.password=null;p={x:d.x+.5,y:d.y+.5-d.dy,angle:0};interact();if(!d.open||!noiseMarks.some(n=>n.kind==='door'))throw Error('door noise missing');
noiseMarks=[];interact();if(d.open||!noiseMarks.some(n=>n.kind==='door'))throw Error('closing door noise missing');
const tiles=Array.from({length:12},(_,y)=>Array.from({length:12},(_,x)=>x&&y&&x<11&&y<11?1:0));world.grid=tiles;world.w=world.h=12;world.doors=[];world.stations=[];world.extraCards=[];world.notes=[];world.guards=[];world.cover=[{x:5,y:5,w:1,h:1,kind:'crate',pushable:true}];tiles[5][5]=3;world.start={x:2.5,y:2.5};world.card=world.badge={x:3.5,y:3.5};p={x:4.5,y:5.5,angle:0};pushBlock();if(world.cover[0].x!==6||tiles[5][5]!==1||tiles[5][6]!==3)throw Error('crate push failed');
mode='play';world.missionSteps=[];p={x:4.5,y:5.5};world.lasers=[{x:8,y:5.5,dx:0,length:8,period:8,onTime:3,phase:0}];clock=0;powerUntil=lasersUntil=0;alarms=0;update(.01);if(alarms!==1)throw Error('long laser collision missed away from emitter');
originalReset('keypad',false);card=true;const gate=world.doors.find(d=>d.keyRequired);gate.password='1234';gate.cardsRequired=0;world.notes=[{read:true,code:'1234'}];passwordDoor(gate);const form=$('modalBody').children[0];form.children[0].value='9999';form.onsubmit({preventDefault(){}});if(gate.open)throw Error('wrong password unlocked vault');form.children[0].value='1234';form.onsubmit({preventDefault(){}});if(!gate.open||!gate.authorized||mode!=='play')throw Error('correct password failed');
originalReset('dual-card',false);card=true;const dual=world.doors.find(d=>d.keyRequired);dual.password=null;dual.cardsRequired=2;world.extraCards=[{collected:false}];p={x:dual.x+.5,y:dual.y+.5-dual.dy,angle:0};interact();if(dual.open)throw Error('dual vault opened with one card');dialog.close();mode='play';world.extraCards[0].collected=true;interact();if(!dual.open)throw Error('dual vault failed with both cards');
}\`,context);
console.log('PASS: faster noisy running, silent sneaking, door noise, crate movement, long beam collision, password and dual-card gates.');
`;
vm.runInThisContext('(function(require){'+source+checks+'})')(require);

const RoomActions={
 describe(station){
  const instructions={route:'Rotate the circuit tiles to connect IN to OUT.',cables:'Drag each cable into its matching socket.',breaker:'Press Space or click the switch in the green zone three times.',drawers:'Pull the drawers right to find the amber file.'};
  const effects={archive:'Download the classified files. Patrols speed up after the download.',power:'Override the archive firewall and disable all cameras and lasers for 25 seconds.',cameras:'Disable the two nearest cameras for 35 seconds.',lasers:'Disable every laser trap for 50 seconds.',intel:world.missionType==='wipe'&&station.label==='ERASURE AUTHORIZATION FILE'?'Retrieve the authorization needed to erase the research database.':'Reveal the room map and track guards on the minimap for 45 seconds.',map:'Reveal the entire floor layout and custom room symbols while you are in a hallway, without revealing hidden enemies.',supplies:'Collect two noise decoys, up to a maximum of five.',tools:'Upgrade your toolkit: +10 seconds per hacking attempt, dash cooldown reduced from 3.2 to 2 seconds, and one extra decoy.',wiretap:'Plant a listening device on this communications uplink. Wiretap both assigned nodes, then extract.',wipe:'Erase the research database using the authorization file. This triggers a security hunt: avoid every sighting on your way out.',drive:'Retrieve the encrypted drive, then take it to the assigned dead-drop transmitter.',upload:'Transmit the encrypted drive to your handler. The drive must be collected first.'};
  const effect=station.effect==='cameras'&&station.permanentLoop?'Permanently loop the two nearest cameras on this floor. Disable both assigned network nodes, then extract.':effects[station.effect];
  return (instructions[station.type]||'Press E to use this station.')+' '+effect+(station.used&&!station.repeat?' Already serviced.':'');
 },
 use(station){if(station.used&&!station.repeat){this.notice('ALREADY SERVICED',station.label,station.effect==='archive'?'The archive files have already been downloaded. Return to the service lift when your mission is complete.':'This station has already been collected or serviced. '+this.describe(station));return}if(station.requires!==undefined&&!world.stations.find(s=>s.id===station.requires)?.used){this.notice('MISSION PREREQUISITE',station.label,'First retrieve '+world.stations.find(s=>s.id===station.requires).label.toLowerCase()+'.');return}if(station.effect==='archive'&&!firewall){this.notice('FIREWALL LOCKED',station.label,'The encrypted archive is locked. Find POWER CONTROL and complete its breaker puzzle to override the firewall. Then return here and press E to download the files. The cyan card opens the archive door; it does not bypass this firewall.');return}if(station.type){this.puzzle(station);return}const description=this.describe(station);this.reward(station);this.notice('EQUIPMENT ACQUIRED',station.label,description)},
 timeLimit(station){return (station.type==='route'?40:station.type==='breaker'?26:30)+(toolUpgrade?10:0)},
 notice(tag,title,text){mode='inspect';modal(tag,title,text);this.continueButton()},
 continueButton(){const close=document.createElement('button');close.textContent='Continue';close.onclick=()=>{dialog.close();mode='play'};$('modalBody').append(close)},
 puzzle(station){
  if(!station)return;if(station.used&&!station.repeat){log(station.label+' / already serviced.');return}
  mode='hack';AudioFX.cue('hack');hackDeadline=clock+this.timeLimit(station);const token=run;
  modal('LIVE '+(station.type==='drawers'?'SEARCH':'BREACH')+' / SECURITY STILL MOVING',station.label,this.describe(station));
  MiniGames.start({type:station.type,seed:world.seed+':'+station.id,parent:$('modalBody'),alive:()=>run===token&&mode==='hack',onwin:()=>{if(run!==token||mode!=='hack')return;dialog.close();mode='play';this.reward(station)},onfail:()=>{if(run!==token||mode!=='hack')return;dialog.close();mode='play';severity=2;evidence='A failed circuit override left tampering evidence';makeNoise(p,20);world.guards.forEach(g=>g.meter=Math.max(g.meter,.35));log('Circuit tripped. Security heard the short. Move behind cover.')}});
  const cancel=document.createElement('button');cancel.textContent='Disconnect';cancel.onclick=()=>{MiniGames.stop();dialog.close();mode='play'};$('modalBody').append(cancel);
 },
 reward(station){
  if(station.requires!==undefined&&!world.stations.find(s=>s.id===station.requires)?.used)return;
  if(station.used&&!station.repeat)return;station.used=true;AudioFX.cue('pickup');
  switch(station.effect){
   case'archive':stolen=true;log('Archive extracted. Patrols are speeding up. Return to the service lift.');break;
   case'power':firewall=true;powerUntil=clock+25;log('Firewall overridden. Cameras and laser circuits off for 25 seconds.');break;
   case'cameras':{const closest=[...world.cameras].sort((a,b)=>Math.hypot(a.x-station.x,a.y-station.y)-Math.hypot(b.x-station.x,b.y-station.y)).slice(0,2);closest.forEach(c=>{c.disabledUntil=station.permanentLoop?Infinity:Math.max(c.disabledUntil,clock+35);c.meter=0});log(station.permanentLoop?'Camera network node looped for the rest of this floor.':'Two nearest cameras looped for 35 seconds. Time your route.');break}
   case'lasers':lasersUntil=clock+50;log('Laser relay bypassed. All beam traps disabled for 50 seconds.');break;
   case'intel':radarUntil=clock+45;world.rooms.forEach(r=>{for(let y=r.y;y<r.y+r.h;y++)for(let x=r.x;x<r.x+r.w;x++)explored.add(x+','+y)});log('Patrol file acquired. Room map revealed; guards tracked on the minimap for 45 seconds.');break;
   case'map':directoryKnown=true;for(let y=0;y<world.h;y++)for(let x=0;x<world.w;x++)if(world.grid[y][x])explored.add(x+','+y);log('Floor directory scanned. Layout and discovered objective positions now appear on your minimap.');break;
   case'supplies':charges=Math.min(5,charges+2);log('Supply cabinet searched. Two noise decoys added (capacity five).');break;
   case'tools':toolUpgrade=true;charges=Math.min(5,charges+1);log('Toolkit upgraded: 10 extra hacking seconds, a faster dash recharge, and one decoy.');break;
   case'wiretap':radarUntil=Math.max(radarUntil,clock+45);log('Listening device planted. Intercepted patrol traffic reveals guards for 45 seconds.');break;
   case'wipe':world.hotExtraction=true;world.guards.forEach(g=>{g.cool=0;g.lastSeen={...station};g.search=15;g.route=[]});log('Research erased. Security is hunting you: avoid being caught and return to the lift.');break;
   case'drive':log('Encrypted drive recovered. Take it to the dead-drop transmitter.');break;
   case'upload':log('Dead drop transmitted. Return to the service lift.');break;
  }hud();
 }
};

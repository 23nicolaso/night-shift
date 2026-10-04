from pathlib import Path
p=Path('world.js');s=p.read_text(encoding='utf-8');a=s.index(' const missionRoll=');b=s.index(' return world;',a)
s=s[:a]+''' // Mission selection uses its own random stream so geometry stays reproducible.
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
  world.missionSteps=nodes.slice(0,2).map(step);
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
'''+s[b:];p.write_text(s,encoding='utf-8')
p=Path('game.js');s=p.read_text(encoding='utf-8');a=s.index('function missionLabel(');b=s.index('function objective()',a)
s=s[:a]+'''function missionLabel(step){
 if(step==='card')return 'Steal the cyan access card';if(step==='power')return 'Override the power breaker';if(step==='archive')return 'Download classified archive';if(step==='lasers')return 'Sabotage the restricted lab relay';
 const station=missionPoint(step),room=station?world.rooms[station.roomId]:null,location=' in '+(room?.name.toLowerCase()||'the target room')+' (room '+(station?.roomId+1)+')';
 if(station?.effect==='intel')return (world.missionType==='wipe'?'Retrieve the erasure authorization file':'Retrieve a patrol file')+location;
 const verbs={cameras:'Disable the camera network node',wiretap:'Plant a listening device',wipe:'Erase the research database',drive:'Retrieve the encrypted drive',upload:'Transmit the encrypted drive'};
 return (verbs[station?.effect]||'Service the mission station')+location;
}
'''+s[b:]
s=s.replace("run++;world=World.generate(seed||String(Math.floor(Math.random()*999999)));", "run++;const previousMission=world?.missionType;world=World.generate(seed||String(Math.floor(Math.random()*999999)));for(let i=0;!seed&&world.missionType===previousMission&&i<20;i++)world=World.generate(String(Math.floor(Math.random()*999999))+':'+i);")
s=s.replace("g.lastSeen?2:stolen?1.9:1.5", "g.lastSeen?2:stolen||world.hotExtraction?1.9:1.5")
s=s.replace("currentRoom?.restricted||stolen", "currentRoom?.restricted||stolen||world.hotExtraction")
p.write_text(s,encoding='utf-8')
p=Path('art.js');s=p.read_text(encoding='utf-8').replace("if(type==='power'||type==='lasers')", "if(type==='power'||type==='lasers')").replace("else if(type==='cameras')", "else if(type==='cameras'||type==='wiretap'||type==='upload')").replace("else if(type==='archive'||type==='intel')", "else if(type==='archive'||type==='intel'||type==='drive'||type==='wipe')");p.write_text(s,encoding='utf-8')

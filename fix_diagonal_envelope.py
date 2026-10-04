from pathlib import Path
p=Path('world.js');s=p.read_text(encoding='utf-8').replace('low=Math.min(laneAt(band,x),laneAt(band,x+rw-1)),high=Math.max(laneAt(band,x),laneAt(band,x+rw-1))','laneSpan=Array.from({length:rw},(_,i)=>laneAt(band,x+i)),low=Math.min(...laneSpan),high=Math.max(...laneSpan)');p.write_text(s,encoding='utf-8')

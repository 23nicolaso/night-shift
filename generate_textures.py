"""Original pixel textures and prop sprites; rerunnable, no downloaded assets."""
from pathlib import Path
import random
from PIL import Image, ImageDraw

OUT = Path(__file__).parent / 'assets'
OUT.mkdir(exist_ok=True)
random.seed(31415)

def material(name, base, mode):
    im = Image.new('RGB', (64, 64), base)
    px = im.load()
    for y in range(64):
        for x in range(64):
            n = random.randint(-5, 5)
            if mode == 'metal': n += (y % 3 == 0) * 7
            if mode == 'wood': n += (y % 8 in (0, 1)) * -18 + (x % 19 == 0) * -8
            if mode == 'carpet': n += ((x + y) % 3 == 0) * 9
            px[x,y] = tuple(max(0, min(255, c+n)) for c in base)
    d=ImageDraw.Draw(im)
    if mode == 'pcb':
        for i in range(8):
            x,y=random.randrange(4,58,4),random.randrange(4,58,4)
            d.line([(x,0),(x,y),(63,y)],fill=(61,114,91),width=1)
            d.ellipse((x-2,y-2,x+2,y+2),outline=(115,151,106))
        for x,y in [(10,15),(35,30),(20,48)]:
            d.rectangle((x,y,x+9,y+5),fill=(21,38,43),outline=(99,115,110))
    im.save(OUT / (name+'.png'))

for args in [('brushed-metal',(58,76,85),'metal'),('circuit-board',(28,62,54),'pcb'),('rubber',(28,32,43),'rubber'),('wood',(120,97,68),'wood'),('carpet',(49,68,88),'carpet')]: material(*args)

def prop(kind):
    im=Image.new('RGBA',(48,56),(0,0,0,0));d=ImageDraw.Draw(im)
    d.rectangle((4,5,45,54),fill=(8,17,30,120))
    if kind in ('cabinet','supplies','tools'):
        base=(100,118,122) if kind=='cabinet' else (133,110,73)
        d.rectangle((2,2,43,51),fill=base,outline=(26,42,52),width=2)
        d.line((4,3,41,3),fill=(177,190,173),width=2)
        for y in range(10,45,11):
            d.rectangle((6,y,39,y+8),fill=(63,82,93),outline=(28,46,61))
            d.rectangle((20,y+3,27,y+4),fill=(173,189,179))
        if kind!='cabinet':
            d.rectangle((8,18,36,35),fill=(38,57,70));d.rectangle((10,20,34,33),outline=(197,172,113),width=2)
            d.line((15,28,30,24),fill=(177,222,192),width=3)
            if kind=='tools':d.rectangle((22,19,25,32),fill=(177,222,192))
    elif kind=='relay':
        d.rectangle((3,2,42,50),fill=(85,105,110),outline=(22,38,51),width=2)
        d.rectangle((8,7,37,21),fill=(18,39,42),outline=(168,186,168))
        d.line((10,14,17,14,19,10,22,18,27,12,34,12),fill=(139,239,184),width=2)
        for x in (10,24):
            for y in (27,38):
                d.rectangle((x,y,x+10,y+7),fill=(28,44,59),outline=(148,160,149))
                d.rectangle((x+3,y+1,x+6,y+5),fill=(218,178,109))
    else:
        d.rectangle((3,2,44,35),fill=(105,126,134),outline=(27,42,54),width=2)
        d.rectangle((7,6,40,30),fill=(21,43,45),outline=(180,200,185))
        for y in range(11,26,5):d.line((12,y,32+(y%3),y),fill=(135,229,194),width=2)
        d.rectangle((20,35,26,41),fill=(84,107,120))
        d.polygon([(8,41),(37,41),(44,50),(2,50)],fill=(121,139,140),outline=(25,44,57))
        for y in (44,47):
            for x in range(8,36,5):d.rectangle((x,y,x+3,y+1),fill=(55,79,92))
    im.save(OUT / (kind+'.png'))

for name in ('cabinet','supplies','tools','relay','terminal'):prop(name)
print('Created 10 original texture/sprite PNG assets in assets/.')

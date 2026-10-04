const Textures={images:{},ready:false,
 load(){if(typeof Image==='undefined')return;const names=['brushed-metal','circuit-board','rubber','wood','carpet','cabinet','supplies','tools','relay','terminal'];let count=0;for(const name of names){const im=new Image();im.onload=()=>{if(++count===names.length)this.ready=true};im.src='assets/'+name+'.png';this.images[name]=im}},
 fill(ctx,name,x,y,w,h){const im=this.images[name];if(!im?.complete||!im.naturalWidth)return false;const pattern=ctx.createPattern(im,'repeat');if(!pattern)return false;ctx.fillStyle=pattern;ctx.fillRect(x,y,w,h);return true},
 prop(ctx,name,o,used=false){const im=this.images[name];if(!im?.complete||!im.naturalWidth)return false;ctx.save();if(used)ctx.globalAlpha=.5;ctx.drawImage(im,o.x*20-12,o.y*20-16,24,28);ctx.restore();return true}
};Textures.load();

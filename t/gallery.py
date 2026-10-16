from harness import *
import sys
with sync_playwright() as p:
    b,ctx,pg,errs=open_page(p,dict(viewport={'width':1400,'height':900},device_scale_factor=1))
    pg.evaluate('''()=>{const c=document.createElement('canvas');c.id='gal';c.width=1400;c.height=900;c.style.cssText='position:fixed;inset:0;z-index:99;background:#6b9746';document.body.appendChild(c);
      const g=c.getContext('2d');g.fillStyle='#6b9746';g.fillRect(0,0,1400,900);
      const ids=['kiem','cung','giao','dao','con','phap'];const poses=[[-1,0,0],[0.15,0,0],[0.4,0,0],[-1,1.2,1]];
      ids.forEach((id,i)=>{poses.forEach((ps,j)=>{drawHuman(g,{x:70+j*58+i*230,y:200,f:1,look:LOOKS[id],atk:ps[0],walk:ps[1],moving:!!ps[2],t:1,glow:j==0?2:0,sc:1.6})})});
      const facs=[['phi','sword'],['trieu','spear'],['trieu','bow'],['han','shield'],['nguyen','sword'],['minh','bomb'],['thanh','sword'],['thanh','bow']];
      facs.forEach((f,i)=>drawHuman(g,{x:80+i*120,y:420,f:1,look:factionLook(f[0],f[1]),atk:i%2?0.35:-1,t:1,sc:1.6}));
      ['smith','merchant','elder','driver'].forEach((n,i)=>drawHuman(g,{x:1060+i*80,y:420,f:-1,look:LOOKS[n],t:1,sc:1.6}));
      // phóng to 1 nhân vật
      ids.forEach((id,i)=>drawHuman(g,{x:110+i*230,y:820,f:1,look:LOOKS[id],atk:-1,t:1,sc:4,glow:i==0?3:0}));
    }''')
    pg.wait_for_timeout(200)
    pg.screenshot(path='shots/gallery.png')
    print(errs)

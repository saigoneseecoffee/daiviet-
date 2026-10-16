from harness import *
with sync_playwright() as p:
    b,ctx,pg,errs=open_page(p,dict(viewport={'width':1400,'height':980},device_scale_factor=1))
    pg.click('#tNew');pg.click('[data-c="giao"]');pg.click('#goBtn');pg.wait_for_timeout(300);pg.click('#stGo')
    pg.evaluate('''()=>{const c=document.createElement('canvas');c.width=1400;c.height=980;c.style.cssText='position:fixed;inset:0;z-index:99';document.body.appendChild(c);const g=c.getContext('2d');
      g.fillStyle='#6b9746';g.fillRect(0,0,1400,980);
      // trang bị bậc 0..5 cho 6 phái
      const ids=['kiem','cung','giao','dao','con','phap'];
      ids.forEach((id,r)=>{G.save.cls=id;for(let t=0;t<6;t++){G.save.equip={};for(const sl of SLOTS){const it=genItem(t*6+2,3,sl);it.cls=id;it.enh=t*3;G.save.equip[sl]=it}
        G.p.cls=CLASS_BY_ID[id];updateLook();drawHuman(g,{x:60+t*90,y:110+r*140,f:1,look:G.p.look,t:1,glow:G.p.glow,sc:1.5,atk:-1})}});
      // thú cưỡi
      G.save.cls='giao';G.save.equip={};for(const sl of SLOTS){const it=genItem(32,4,sl);it.cls='giao';G.save.equip[sl]=it}updateLook();
      MOUNTS.forEach((m,i)=>{const x=680+(i%3)*240,y=300+Math.floor(i/3)*330;g.save();g.translate(x,y);g.scale(1.9,1.9);const seat=drawMount(g,m,{x:0,y:0,f:1,t:1,walk:1.3,moving:true});
        drawHuman(g,{x:seat.x,y:seat.y+17*1.08,f:1,look:G.p.look,t:1,ride:1,sc:1.08});g.restore();g.fillStyle='#fff';g.font='bold 16px sans-serif';g.fillText(m.name,x-60,y+30)});
    }''')
    pg.wait_for_timeout(200);pg.screenshot(path='shots/gal2.png');print(errs)

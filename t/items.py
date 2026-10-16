from harness import *
with sync_playwright() as p:
    b,ctx,pg,errs=open_page(p,dict(viewport={'width':1300,'height':1150},device_scale_factor=1))
    pg.click('#tNew');pg.click('[data-c="kiem"]');pg.click('#goBtn');pg.wait_for_timeout(300);pg.click('#stGo')
    pg.evaluate('''()=>{const c=document.createElement('canvas');c.width=1300;c.height=1150;c.style.cssText='position:fixed;inset:0;z-index:99';document.body.appendChild(c);const g=c.getContext('2d');
      g.fillStyle='#1a120c';g.fillRect(0,0,1300,1150);const rows=[['vk','kiem'],['vk','cung'],['vk','giao'],['vk','dao'],['vk','con'],['vk','phap'],['mu'],['ao'],['dai'],['giay'],['boi']];
      rows.forEach((r,i)=>{for(let t=0;t<6;t++){const it={slot:r[0],cls:r[1],ilvl:t*6+1,rar:Math.min(4,t),enh:t===5?13:0};const cv=itemArtCanvas(it);const x=20+t*210,y=10+i*103;
        g.fillStyle='#2e211a';g.fillRect(x,y,100,100);g.drawImage(cv,x,y,100,100);g.fillStyle='#d8c8a8';g.font='12px sans-serif';g.fillText(it.slot==='vk'?TIER_NAMES[r[1]][t]:TIER_NAMES[r[0]][t],x+104,y+50)}})}''')
    pg.wait_for_timeout(200);pg.screenshot(path='shots/items.png');print(errs)

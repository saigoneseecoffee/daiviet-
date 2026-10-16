from harness import *
with sync_playwright() as p:
    b,ctx,pg,errs=open_page(p,DESK)
    pg.click('#tNew');pg.click('[data-c="cung"]');pg.click('#goBtn');pg.wait_for_timeout(300);pg.click('#stGo')
    r=pg.evaluate('''()=>{travel(1,false);document.getElementById('story').hidden=true;G.paused=false;G.enemies=[];const p=G.p,W=G.W;p.x=2632;p.y=1851;const out=[];
      const tx=Math.floor(p.x/T),ty=Math.floor(p.y/T);const tiles=[];for(let y=-1;y<=1;y++){let row='';for(let x=-1;x<=1;x++){const i=(ty+y)*MW+tx+x;row+=W.tile[i]+'/'+W.walk[i]+'/'+(W.ogrid[i]?W.ogrid[i].map(o=>o.k+o.cr).join('+'):'-')+'  '}tiles.push(row)}
      for(let k=0;k<20;k++){const d=navTo(2225,2365);moveEnt(W,p,d[0]*150/30,d[1]*150/30);G.t+=1/30;out.push([Math.round(p.x),Math.round(p.y),d.map(v=>+v.toFixed(2))])}
      return {tiles,out}}''')
    print(r['tiles']);print(r['out'])

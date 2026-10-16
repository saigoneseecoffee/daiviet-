from harness import *
with sync_playwright() as p:
    b,ctx,pg,errs=open_page(p,DESK)
    r=pg.evaluate('''()=>{const out=[];for(let mi=0;mi<6;mi++){const W=makeWorld(mi);const a=Math.floor(W.arena.y/T)*MW+Math.floor(W.arena.x/T);
      const f=bfsField(W,Math.floor(W.arena.x/T),Math.floor(W.arena.y/T));const c=Math.floor(W.camp.y/T)*MW+Math.floor(W.camp.x/T);
      out.push({mi,reachArena:W.reach[a],distCampToArena:f[c],spawn:W.spawnTiles.length,objs:W.objs.length})}return out}''')
    for x in r: print(x)
    print(errs)

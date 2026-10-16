from harness import *
with sync_playwright() as p:
    b,ctx,pg,errs=open_page(p,DESK)
    print(pg.evaluate("""()=>{const out=[];for(let mi=0;mi<6;mi++){const W=makeWorld(mi);const A=W.arena;const ai=Math.floor(A.y/T)*MW+Math.floor(A.x/T);
      const f=bfsField(W,Math.floor(W.camp.x/T),Math.floor(W.camp.y/T));const fl=bfsField(W,Math.floor(W.camp.x/T),Math.floor(W.camp.y/T),W.walkLocked);
      let reachN=0;for(let i=0;i<MW*MH;i++)if(W.walk[i])reachN++;out.push({mi,arenaWalk:W.walk[ai],dist:f[ai],reachN,spawn:W.spawnTiles.length,gateN:W.walk[41*MW+12],gateE:W.walk[52*MW+22]})}return out}"""))
    b.close()

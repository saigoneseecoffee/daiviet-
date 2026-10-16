import sys,json
from harness import *
exec(open('bot.py').read().split("with sync_playwright")[0].split("cls = ")[0])
SIM=open('bot.py').read().split("SIM = '''")[1].split("'''")[0]
with sync_playwright() as p:
    b,ctx,pg,errs=open_page(p,DESK)
    pg.click('#tNew');pg.click('[data-c="kiem"]');pg.click('#goBtn');pg.wait_for_timeout(300);pg.click('#stGo')
    pg.evaluate("G.save.set.auto=true")
    for k in range(10):
        r=pg.evaluate(SIM,30)
        d=pg.evaluate('''()=>{const p=G.p,W=G.W;const ai=autoPlay(0.016);const q=questTarget();const tx=Math.floor(p.x/T),ty=Math.floor(p.y/T);
          const ne=G.enemies.filter(e=>!e.dead).map(e=>[e.type,Math.round(dist(e.x,e.y,p.x,p.y)),e.state,W.walk[Math.floor(e.y/T)*MW+Math.floor(e.x/T)]]).sort((a,b)=>a[1]-b[1]).slice(0,5);
          return{p:[Math.round(p.x),Math.round(p.y),tx,ty,W.walk[ty*MW+tx]],ai,q:q&&[Math.round(q.x),Math.round(q.y),q.label],autoAtk:G.autoAtk,appr:!!p.approach,lt:G.lastTarget&&[G.lastTarget.type,G.lastTarget.dead],ne,inCamp:p.inCamp,nav:G.nav&&G.nav.key}}''')
        print(r['kills'],r['qs'],json.dumps(d,ensure_ascii=False))
    pg.screenshot(path='shots/dbg.png')

import sys,json
from harness import *
SIM=open('bot.py').read().split("SIM = '''")[1].split("'''")[0]
with sync_playwright() as p:
    b,ctx,pg,errs=open_page(p,DESK)
    pg.click('#tNew');pg.click('[data-c="kiem"]');pg.click('#goBtn');pg.wait_for_timeout(300);pg.click('#stGo')
    pg.evaluate("G.save.set.auto=true")
    for k in range(12):
        r=pg.evaluate(SIM,30)
        if r['qs']==3 and r['map']>=1: break
    for k in range(4):
        r=pg.evaluate(SIM,10)
        d=pg.evaluate('''()=>{const p=G.p,W=G.W;const ai=autoPlay(0.016);const q=questTarget();
          return{st:G.state,paused:G.paused,slow:G.slow,hs:G.hitstop,p:[Math.round(p.x),Math.round(p.y)],arena:[W.arena.x,W.arena.y,W.arena.r],dA:Math.round(dist(p.x,p.y,W.arena.x,W.arena.y)),ai,q:q&&[Math.round(q.x),Math.round(q.y),q.label],boss:!!G.boss,timers:G.timers.length,nav:G.nav&&G.nav.key,dash:!!p.dash}}''')
        print(r['kills'],r['qs'],json.dumps(d,ensure_ascii=False))
    pg.screenshot(path='shots/dbg2.png')
    print(errs[:3])

from harness import *
with sync_playwright() as p:
    b,ctx,pg,errs=open_page(p,PHONE);ev=pg.evaluate
    pg.click('#tNew');pg.click('[data-c="cung"]');pg.click('#goBtn');pg.wait_for_timeout(500);pg.click('#stGo')
    ev("G.save.qs[0]=3;G.save.qp=0;G.p.x=G.W.arena.x;G.p.y=G.W.arena.y+60")
    pg.wait_for_timeout(2500); print('boss',ev("!!G.boss"))
    ev("hurtEnemy(G.boss,1e9,{})")
    for i in range(10):
        pg.wait_for_timeout(400); print(i, pg.is_visible('#clear'), ev("[G.slow,G.hitstop,G.timers.length,G.state,G.paused,G.t]"))
    print(ev("JSON.stringify([G.save.bag.filter(i=>i.leg).map(i=>i.name),G.save.leg])"));print(errs)

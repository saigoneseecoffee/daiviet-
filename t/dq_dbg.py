from harness import *
with sync_playwright() as p:
    b,ctx,pg,errs=open_page(p,PHONE)
    pg.click('#tNew');pg.click('[data-c="kiem"]');pg.click('#goBtn');pg.wait_for_timeout(400);pg.click('#stGo');pg.wait_for_timeout(500)
    pg.evaluate("G.save.lvl=12;recalc()")
    pg.evaluate("DAILY.dev.shift(86400000)");pg.wait_for_timeout(300)
    print(pg.evaluate("JSON.stringify({d:DAILY.state().day,ap:DAILY.state().ap,q:DAILY.state().q.map(q=>[q.k,q.p,q.n,q.c])})"))
    pg.wait_for_timeout(1500)
    print(pg.evaluate("JSON.stringify({q:DAILY.state().q.map(q=>[q.k,q.p,q.n,q.c])})"))
    b.close()

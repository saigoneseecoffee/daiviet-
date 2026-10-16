from harness import *
with sync_playwright() as p:
    for name,opts in [('phone',PHONE),('se',SE)]:
        b,ctx,pg,errs=open_page(p,opts)
        pg.click('#tNew');pg.click('[data-c="giao"]');pg.click('#goBtn');pg.wait_for_timeout(400);pg.click('#stGo');pg.wait_for_timeout(500)
        pg.evaluate("G.save.tut={move:1,atk:1,equip:1,skill:1,forge:1};gainExp(need(1)+need(2)+5)");pg.wait_for_timeout(1800)
        pg.screenshot(path=f'shots/int_{name}_perk.png')
        pg.evaluate("(()=>{let n=0;while(PERKS.offerPending()&&n++<40)PERKS.pickAuto()})()")
        pg.evaluate("G.save.lvl=30;recalc();G.p.hp=G.p.maxhp;travel(4,false);G.save.qs[4]=3;G.p.x=G.W.arena.x;G.p.y=G.W.arena.y+60");pg.wait_for_timeout(2500)
        pg.evaluate("G.boss&&(G.boss.hp=G.boss.max*0.6)");pg.wait_for_timeout(900)
        pg.screenshot(path=f'shots/int_{name}_phase.png')
        print(name,[e for e in errs if 'GPU' not in e[1]][:4],overflow(pg))
        b.close()

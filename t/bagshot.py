from harness import *
with sync_playwright() as p:
    for name,opts in [('phone',PHONE),('desk',DESK)]:
        b,ctx,pg,errs=open_page(p,opts)
        pg.click('#tNew');pg.click('[data-c="giao"]');pg.click('#goBtn');pg.wait_for_timeout(300);pg.click('#stGo')
        pg.evaluate("G.save.tut={move:1,atk:1,equip:1,skill:1,forge:1};for(const sl of SLOTS){const it=genItem(randi(8,20),randi(1,3),sl);it.enh=randi(0,9);G.save.equip[sl]=it};for(let i=0;i<18;i++)G.save.bag.push(genItem(randi(1,36),randi(0,4)));recalc();updateLook()")
        pg.evaluate("UI.open('bag')");pg.wait_for_timeout(500)
        pg.click('#shBody .bag .cell >> nth=3');pg.wait_for_timeout(400)
        pg.screenshot(path=f'shots/{name}_bagart.png')
        pg.evaluate("UI.open('forge')");pg.wait_for_timeout(400);pg.screenshot(path=f'shots/{name}_forgeart.png')
        pg.evaluate("UI.close();for(let i=0;i<4;i++)dropAt(G.p.x+40+i*25,G.p.y+30,'item',genItem(randi(5,30),i+1))");pg.wait_for_timeout(1200)
        pg.evaluate("G.paused=true");pg.screenshot(path=f'shots/{name}_dropart.png')
        print(name,errs);b.close()

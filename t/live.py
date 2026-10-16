from harness import *
with sync_playwright() as p:
    b,ctx,pg,errs=open_page(p,PHONE)
    pg.click('#tNew');pg.click('[data-c="dao"]');pg.click('#goBtn');pg.wait_for_timeout(300);pg.click('#stGo')
    for mi,lv in [(2,16),(3,22),(4,28),(5,34)]:
        pg.evaluate(f"G.save.lvl={lv};G.save.skl=[4,4,4];for(const sl of SLOTS){{const it=genItem({lv},3,sl);it.enh=8;G.save.equip[sl]=it}};recalc();updateLook();G.p.hp=G.p.maxhp;G.save.unlocked=6;travel({mi},false);G.save.set.auto=true;G.save.tut={{move:1,atk:1,equip:1,skill:1,forge:1}}")
        pg.evaluate("G.p.x=G.W.pathPts[Math.floor(G.W.pathPts.length*0.5)].x;G.p.y=G.W.pathPts[Math.floor(G.W.pathPts.length*0.5)].y;for(let k=0;k<4;k++)trySpawnPack(150,400)")
        pg.wait_for_timeout(5000)
        pg.screenshot(path=f'shots/live_{mi}.png')
    print(errs)

from harness import *
with sync_playwright() as p:
    b,ctx,pg,errs=open_page(p,DESK)
    pg.screenshot(path='shots/title_town.png')
    pg.click('#tNew');pg.click('[data-c="giao"]');pg.click('#goBtn');pg.wait_for_timeout(400);pg.click('#stGo');pg.wait_for_timeout(500)
    for mi in [2,4]:
        pg.evaluate(f"G.save.tut={{move:1,atk:1,equip:1,skill:1,forge:1}};travel({mi},false);G.cam.z=0.5;G.p.x=12*T;G.p.y=49*T;G.cam.x=G.p.x;G.cam.y=G.p.y;G.W.chunks.clear()")
        pg.wait_for_timeout(900);pg.screenshot(path=f'shots/town_map{mi}.png')
    print([e for e in errs if 'GPU' not in e[1]][:5])
    b.close()

from harness import *
import sys
with sync_playwright() as p:
    for name,opts,z,pts in [('desk',DESK,0.62,[(11,52)]),('phone',PHONE,None,[(9,49),(5,52),(17,52),(11,58),(13,44)])]:
        b,ctx,pg,errs=open_page(p,opts)
        pg.click('#tNew');pg.click('[data-c="kiem"]');pg.click('#goBtn');pg.wait_for_timeout(400);pg.click('#stGo');pg.wait_for_timeout(600)
        pg.evaluate("G.save.tut={move:1,atk:1,equip:1,skill:1,forge:1};document.querySelectorAll('.hint,#hint').forEach(e=>e.hidden=true)")
        for i,(x,y) in enumerate(pts):
            zz=f"G.cam.z={z};" if z else ""
            pg.evaluate(f"{zz}G.p.x={x}*T;G.p.y={y}*T;G.cam.x=G.p.x;G.cam.y=G.p.y-20;G.W.chunks.clear()")
            pg.wait_for_timeout(700)
            pg.screenshot(path=f'shots/town_{name}_{i}.png')
        print(name,[e for e in errs if 'GPU' not in e[1] and 'WebGL' not in e[1]][:6])
        b.close()

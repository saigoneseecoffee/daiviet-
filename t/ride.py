from harness import *
with sync_playwright() as p:
    b,ctx,pg,errs=open_page(p,PHONE)
    pg.click('#tNew');pg.click('[data-c="kiem"]');pg.click('#goBtn');pg.wait_for_timeout(300);pg.click('#stGo');pg.wait_for_timeout(500)
    pg.evaluate("""()=>{G.save.mounts=G.save.mounts||{};const m=MOUNTS[0];G.save.mounts[m.id]=1;G.save.mount=m.id;G.save.riding=1;G.save.tut={move:1,atk:1,equip:1,skill:1,forge:1};
      const e=spawnEnemy(Object.keys(ET).find(k=>ET[k].body==='cav')||'linhtrieu',G.p.x+90,G.p.y+10,1,false);e.max=e.hp=1e7;e.state='idle'; G.cam.x=G.p.x+30;G.cam.y=G.p.y-20}""")
    pg.wait_for_timeout(700);pg.screenshot(path='shots/ride.png')
    print(errs)
    b.close()

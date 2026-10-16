from harness import *
import sys
cls=sys.argv[1:] or ['kiem','cung','giao','dao','con','phap']
with sync_playwright() as p:
    b,ctx,pg,errs=open_page(p,DESK)
    pg.click('#tNew');pg.click('[data-c="kiem"]');pg.click('#goBtn');pg.wait_for_timeout(300);pg.click('#stGo')
    for c in cls:
        for sk in [0,1,2]:
            pg.evaluate(f"""()=>{{G.save.cls='{c}';G.p=null;makePlayer(G.W.camp.x+400,G.W.camp.y-250);G.p.look=Object.assign({{}},LOOKS['{c}']);G.save.lvl=8;G.save.skl=[3,3,3];recalc();G.p.hp=G.p.maxhp;G.p.mp=999;G.p.maxmp=999;
              G.save.equip.vk=genItem(8,3,'vk');G.save.equip.vk.enh=11;updateLook();G.save.tut={{move:1,atk:1,equip:1,skill:1,forge:1}};
              G.enemies=[];G.fx=[];G.zones=[];G.projs=[];for(let k=0;k<6;k++){{const a=k/6*TAU;const e=spawnEnemy('linhtrieu',G.p.x+80+Math.cos(a)*60,G.p.y+Math.sin(a)*50,1,false);e.max=e.hp=1e7;e.state='idle'}}
              G.p.aim=0;G.p.f=1;G.cam.x=G.p.x+40;G.cam.y=G.p.y-20;castSkill({sk})}}""")
            pg.evaluate('setInterval(()=>{G.floats=G.floats.filter(f=>f.skill)},16)') if sk==0 and c==cls[0] else None;pg.wait_for_timeout(240 if sk!=2 else 420)
            pg.screenshot(path=f'shots/fx_{c}_{sk}.png')
    print(errs)

from harness import *
with sync_playwright() as p:
    b,ctx,pg,errs=open_page(p,DESK)
    pg.click('#tNew');pg.click('[data-c="kiem"]');pg.click('#goBtn');pg.wait_for_timeout(300);pg.click('#stGo')
    pg.evaluate("setInterval(()=>{G.floats=G.floats.filter(f=>f.skill)},16)")
    shots=[('kiem','atk',0.1),('giao','atk',0.12),('dao','atk',0.08),('con','atk',0.14),('kiem',2,0.55),('giao',2,0.5),('phap',1,0.6),('cung',0,0.08),('con',1,0.3)]
    for i,(c,what,wt) in enumerate(shots):
        pg.evaluate(f"""()=>{{G.save.cls='{c}';G.p=null;makePlayer(G.W.camp.x+400,G.W.camp.y-250);G.p.look=Object.assign({{}},LOOKS['{c}']);G.save.lvl=8;G.save.skl=[3,3,3];recalc();G.p.mp=999;G.p.maxmp=999;
          G.save.equip.vk=genItem(8,3,'vk');G.save.equip.vk.enh={i%4*4};updateLook();G.save.tut={{move:1,atk:1,equip:1,skill:1,forge:1}};
          G.enemies=[];G.fx=[];G.zones=[];G.projs=[];G.parts=[];for(let k=0;k<4;k++){{const e=spawnEnemy('linhhan',G.p.x+55+k*18,G.p.y-30+k*22,1,false);e.max=e.hp=1e7;e.state='idle'}}
          G.p.aim=0;G.p.f=1;G.cam.z=2.3;G.cam.x=G.p.x+30;G.cam.y=G.p.y-30;G.lastTarget=null;
          if('{what}'==='atk'){{G.p.atkCd=0;basicAttack()}}else castSkill({what if what!='atk' else 0})}}""")
        pg.wait_for_timeout(int(wt*1000))
        pg.evaluate("G.paused=true")
        pg.wait_for_timeout(50)
        pg.screenshot(path=f'shots/close_{i}.png',clip={'x':350,'y':150,'width':600,'height':450})
        pg.evaluate("G.paused=false")
    print(errs)

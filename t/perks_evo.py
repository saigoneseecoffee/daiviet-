import os,sys
os.environ.setdefault('DVHK_HTML','/home/claude/dvhk/dist/agent_perks.html')
from harness import *
cls=sys.argv[1] if len(sys.argv)>1 else 'kiem'
evos=sys.argv[2].split(',') if len(sys.argv)>2 else ['kiemtran','loihoa','songlong']
with sync_playwright() as p:
    b,ctx,pg,errs=open_page(p,DESK)
    pg.click('#tNew');pg.click(f'[data-c="{cls}"]');pg.click('#goBtn');pg.wait_for_timeout(400);pg.click('#stGo');pg.wait_for_timeout(300)
    ev=pg.evaluate
    ev("G.save.lvl=20;recalc();G.p.hp=G.p.maxhp;G.p.x=G.W.out.x+200;G.p.y=G.W.out.y;G.cam.x=G.p.x;G.cam.y=G.p.y;G.p.ifr=999")
    for e in evos:
        ev(f"(()=>{{const E={{kiemtran:['kiemluan','kkpq'],loihoa:['loi','liethoa'],songlong:['hanbang','hoa'],huyetma:['huyet','haptinh'],kimcang:['kimchung','batdong'],phongthan:['langba','thanhanh'],truyhon:['linhphu','doathon']}}['{e}'];PERKS.grant(E[0],5);PERKS.grant(E[1],5);G.save.perks.r['{e}']=1;recalc()}})()")
    ev("G.save.set.auto=true;G.enemies=[];")
    for i in range(6):
        ev("for(let k=0;k<10;k++)spawnEnemy('soi',G.p.x+rand(-300,300),G.p.y+rand(-220,220),12,false).state='chase'")
        pg.wait_for_timeout(900)
        pg.screenshot(path=f'shots/perks_evo_{cls}_{i}.png')
    print(ev("({fps:0,owned:PERKS.owned(),kills:G.save.kills,parts:G.parts.length,fx:G.fx.length})"))
    print('ERR',errs[:5])
    b.close()

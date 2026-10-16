import os
from harness import *
JS='''(on)=>{G.save.lvl=25;G.p.x=G.W.out.x+200;G.p.y=G.W.out.y;G.p.ifr=1e9;G.save.set.auto=true;
 if(on==1){for(const id of PERKS.list())PERKS.grant(id,5);for(const e of PERKS.evos())G.save.perks.r[e]=1;}if(on==2){for(const id of ['kiemluan','kkpq','loi','liethoa','huyet','bao','lien','kimchung'])PERKS.grant(id,5);G.save.perks.r.kiemtran=1;G.save.perks.r.loihoa=1;}{if(G.save.perks)G.save.perks.pend=0;recalc()}
 G.enemies=[];const fill=()=>{while(G.enemies.filter(e=>!e.dead).length<40){const e=spawnEnemy('soi',G.p.x+rand(-350,350),G.p.y+rand(-260,260),25,false);e.state='chase'}};
 let tu=0,tr=0;for(let i=0;i<600;i++){fill();let t0=performance.now();update(1/60);let t1=performance.now();if(window.NOF)G.floats.length=0;if(window.NOP)G.parts.length=0;render(1/60);tr+=performance.now()-t1;tu+=t1-t0}
 return{upd:(tu/600).toFixed(2),ren:(tr/600).toFixed(2),parts:G.parts.length,fx:G.fx.length,floats:G.floats.length}}'''
with sync_playwright() as p:
  for html,on in [('agent_base.html',0),('agent_perks.html',2)]:
    os.environ['DVHK_HTML']='/home/claude/dvhk/dist/'+html
    import harness;harness.HTML=os.environ['DVHK_HTML']
    b,ctx,pg,errs=open_page(p,DESK)
    pg.click('#tNew');pg.click('[data-c="kiem"]');pg.click('#goBtn');pg.wait_for_timeout(300);pg.click('#stGo')
    print(html,on,pg.evaluate(JS,on));pg.evaluate('window.NOF=1');print('nof',pg.evaluate(JS,on));pg.evaluate('window.NOP=1');print('nop',pg.evaluate(JS,on));b.close()

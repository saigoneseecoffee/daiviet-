from harness import *
import json
with sync_playwright() as p:
    b,ctx,pg,errs=open_page(p,PHONE)
    pg.click('#tNew');pg.click('[data-c="phap"]');pg.click('#goBtn');pg.wait_for_timeout(300);pg.click('#stGo')
    pg.evaluate("G.save.set.auto=true;G.save.lvl=12;G.save.skl=[3,3,3];recalc();G.p.hp=G.p.maxhp;for(let k=0;k<25;k++){const a=k/25*TAU;spawnEnemy(pick(Object.keys(ET).filter(k=>ET[k].body==='human')),G.p.x+Math.cos(a)*220,G.p.y+Math.sin(a)*220,3,k%8==0)}")
    r=pg.evaluate('''()=>new Promise(res=>{
      const T={};const wrap=(obj,name,key)=>{const f=obj[name];obj[name]=function(...a){const t=performance.now();const r=f.apply(this,a);T[key]=(T[key]||0)+performance.now()-t;return r}};
      wrap(window,'render','render');wrap(window,'update','update');wrap(UI,'hud','hud');wrap(UI,'minimap','minimap');wrap(window,'drawAmbient','amb');wrap(window,'drawHuman','human');wrap(window,'drawBeast','beast');wrap(window,'getChunk','chunk');wrap(window,'drawQuestArrow','qa');wrap(window,'drawFx','fx');wrap(window,'drawArena','arena');wrap(window,'getSprite','sprite');wrap(window,'drawPortrait','portrait');
      let n=0;function f(){n++;if(n<180)requestAnimationFrame(f);else{for(const k in T)T[k]=(T[k]/180).toFixed(2);res(T)}}requestAnimationFrame(f)})''')
    print(json.dumps(r))

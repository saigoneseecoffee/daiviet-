import sys, json
from harness import *
cls = sys.argv[1] if len(sys.argv)>1 else 'kiem'
mins = float(sys.argv[2]) if len(sys.argv)>2 else 20
SIM = '''(secs)=>{
 const S=G.save;let deaths=0;const dt=1/60;
 for(let i=0;i<secs*60;i++){
   if(G.state==='dead'){deaths++;while(G.state==='dead'){update(dt)};}
   if(!document.getElementById('clear').hidden){const b=document.getElementById('clNext')||document.getElementById('clNg');b.click();document.getElementById('stGo')&&document.getElementById('stGo').click();}
   if(!document.getElementById('story').hidden){document.getElementById('stGo').click()}
   G.paused=false;if(UI.panel)UI.close();
   if(G.hitstop>0)G.hitstop-=dt;else update(dt*G.slow);
   if(i%300===0){
     // người chơi hợp lý: mặc đồ tốt, nâng kỹ năng, rèn, mua thuốc
     for(const it of [...S.bag])if(itemPower(it)>itemPower(S.equip[it.slot]))equipItem(it);
     while(S.sp>0){const C=CLASS_BY_ID[S.cls];let k=-1;for(let j=2;j>=0;j--)if(S.lvl>=C.skills[j].un&&S.skl[j]<10){k=j;break}if(k<0)break;S.sp--;S.skl[k]++}
     for(const it of [...S.bag])if(it.rar<=1)salvage(it);
     for(const sl of ['vk','ao','mu','dai','giay','boi']){const it=S.equip[sl];if(!it)continue;let n=0;while(n++<3&&it.enh<12){const c=forgeCost(it);if(S.ore<c.ore||S.gold<c.gold+200)break;doForge(it,S.charm>0)}}
     ensureMountSave();for(const m of [...MOUNTS].reverse()){if(m.frag){if(S.frag>=8&&!S.mounts[m.id]){S.frag-=8;giveMount(m.id);S.riding=m.id;recalc()}continue}if(!S.mounts[m.id]&&S.gold>m.price+500&&S.lvl>=m.lv){S.gold-=m.price;giveMount(m.id);S.riding=m.id;recalc();break}}if(!S.riding&&Object.keys(S.mounts).length){S.riding=Object.keys(S.mounts).pop();recalc()}
     const L=S.lvl;while(S.potHP<10&&S.gold>SHOP[0].price(L)+300){S.gold-=SHOP[0].price(L);S.potHP++}
     while(S.potMP<6&&S.gold>SHOP[1].price(L)+300){S.gold-=SHOP[1].price(L);S.potMP++}
   }
 }
 const p=G.p;return{lvl:S.lvl,map:S.map,qs:S.qs[S.map],qp:S.qp,deaths,hp:Math.round(p.hp)+'/'+p.maxhp,pow:p.power,atk:p.atk,def:p.def,gold:S.gold,ore:S.ore,kills:S.kills,score:S.score,ng:S.ng,
   ride:S.riding,camps:G.W.camps.filter(c=>c.alive).length,en2:G.enemies.filter(e=>!e.dead&&dist(e.x,e.y,G.p.x,G.p.y)<700).length,en:G.enemies.length,boss:G.boss?Math.round(G.boss.hp/G.boss.max*100):null,pots:S.potHP}
}'''
DBG='''()=>{const p=G.p,W=G.W;const ai=autoPlay(0.016);const q=questTarget();const tx=Math.floor(p.x/T),ty=Math.floor(p.y/T);
  return{st:G.state,paused:G.paused,slow:G.slow,p:[Math.round(p.x),Math.round(p.y),W.walk[ty*MW+tx]],dA:Math.round(dist(p.x,p.y,W.arena.x,W.arena.y)),ar:Math.round(W.arena.r),fv:(()=>{if(!q)return null;const f=bfsField(W,Math.floor(q.x/T),Math.floor(q.y/T));return [f[ty*MW+tx],W.walk[Math.floor(q.y/T)*MW+Math.floor(q.x/T)],fieldDir(W,f,p.x,p.y),G.nav&&G.nav.key,G.nav&&G.nav.f[ty*MW+tx]]})(),ai,q:q&&[Math.round(q.x),Math.round(q.y),q.label],boss:G.boss&&[G.boss.state,Math.round(G.boss.x),Math.round(G.boss.y),G.boss.dead],nen:G.enemies.length,clearHidden:document.getElementById('clear').hidden,storyHidden:document.getElementById('story').hidden,timers:G.timers.length}}'''
with sync_playwright() as p:
    b,ctx,pg,errs=open_page(p,DESK)
    pg.click('#tNew');pg.click(f'[data-c="{cls}"]');pg.click('#goBtn');pg.wait_for_timeout(300);pg.click('#stGo')
    pg.evaluate("G.save.set.auto=true;G.save.set.sfx=false;G.save.set.music=false")
    t=0;prev=None
    while t<mins:
        r=pg.evaluate(SIM,60); t+=1
        print(f"{t:4.0f}m",json.dumps(r,ensure_ascii=False),flush=True)
        if prev is not None and prev==r['kills']:
            d=pg.evaluate(DBG);print('   STALL',json.dumps(d,ensure_ascii=False))
        prev=r['kills']
        if r['ng']>0: break
    print('errors',errs[:5])
    pg.screenshot(path=f'shots/bot_{cls}.png')
    b.close()

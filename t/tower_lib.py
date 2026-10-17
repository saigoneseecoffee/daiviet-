"""Tiện ích chung cho các bài thử Vượt Tháp."""
import os
os.environ.setdefault('DVHK_HTML', '/home/claude/wt_tower/dist/agent_tower.html')
from harness import *

# tạo nhân vật cấp L với đồ Hiếm cấp L, rèn +enh, kỹ năng đầy, thuốc
MKCHAR = '''([L,enh,rar])=>{const S=G.save;S.lvl=L;S.exp=0;S.sp=0;S.potHP=20;S.potMP=12;S.gold=Math.max(S.gold,5000);
  const C=CLASS_BY_ID[S.cls];C.skills.forEach((sk,i)=>{S.skl[i]=L>=sk.un?Math.min(10,1+Math.floor(L/6)):0});
  for(const sl of SLOTS){const it=genItem(L,rar,sl);it.enh=enh;S.equip[sl]=it}
  recalc();updateLook();G.p.hp=G.p.maxhp;G.p.mp=G.p.maxmp;
  if(S.perks)S.perks.pend=0;
  S.set.auto=false;S.set.sfx=false;S.set.music=false;return{lvl:S.lvl,pow:G.p.power,hp:G.p.maxhp,atk:G.p.atk}}'''

# chạy mô phỏng trong tháp; tự lên tầng tiếp khi thắng; dừng khi rời tháp hoặc đạt maxFloor
CLIMB = '''([secs,maxFloor])=>{const dt=1/60;const log=[];let deaths=0;const S=G.save;
  let fStart=G.t,cur=VT.on?VT.P.n:null;
  for(let i=0;i<secs*60;i++){
    if(G.state==='dead'){deaths++;while(G.state==='dead')update(dt)}
    if(!VT.on){if(VT.last&&!VT.last.win)log.push({f:VT.last.n,win:false,why:VT.last.why,t:VT.last.t,lvl:S.lvl});break}
    if(VT.P.n!==cur){cur=VT.P.n;fStart=G.t}
    if(VT.ph==='done'){log.push({f:VT.P.n,win:true,t:VT.last.t,sim:+(G.t-fStart).toFixed(1),hp:Math.round(G.p.hp/G.p.maxhp*100),lvl:S.lvl});
      if(VT.P.n>=maxFloor){break}VT.next();continue}
    G.paused=false;if(UI.panel&&UI.panel!=='tower')UI.close();
    if(G.hitstop>0)G.hitstop-=dt;else update(dt*G.slow);
    if(!VT.on&&VT.last&&!VT.last.win){log.push({f:VT.last.n,win:false,why:VT.last.why,t:VT.last.t,lvl:S.lvl});break}
  }
  return{log,deaths,on:VT.on,best:S.tower.best,lvl:S.lvl,cq:S.cq||0,tq:S.tq||0,gold:S.gold}}'''

def new_game(pg, cls='kiem'):
    pg.click('#tNew'); pg.click(f'[data-c="{cls}"]'); pg.click('#goBtn'); pg.wait_for_timeout(400); pg.click('#stGo'); pg.wait_for_timeout(300)

def goto_npc(pg):
    pg.evaluate("(()=>{const n=G.W.npcs.find(n=>n.act==='tower');G.p.x=n.x+10;G.p.y=n.y+34;G.cam.x=G.p.x;G.cam.y=G.p.y})()")
    pg.wait_for_timeout(400)

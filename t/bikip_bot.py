"""Cân bằng Bí Tịch: đánh boss chương (tự đánh) có và không có Bí Tịch, so thời gian trận.
   python3 bikip_bot.py <lớp> [chỉ số chương...]   (DVHK_HTML trỏ tới dist/agent_bikip.html)"""
import sys, json, os
from harness import *
cls = sys.argv[1] if len(sys.argv) > 1 else 'kiem'
idx = [int(a) for a in sys.argv[2:]] or [2, 5, 8]
SIM = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'bot.py')).read().split("SIM = '''")[1].split("'''")[0]
SIM = SIM.replace("if(!document.getElementById('clear').hidden){const b=document.getElementById('clNext')||document.getElementById('clNg');b.click();document.getElementById('stGo')&&document.getElementById('stGo').click();}",
  "if(!document.getElementById('clear').hidden){document.getElementById('clStay').click();window.__done=1;break}")
SIM = SIM.replace("if(G.hitstop>0)G.hitstop-=dt;else update(dt*G.slow);", "if(G.hitstop>0)G.hitstop-=dt;else update(dt*G.slow);if(document.getElementById('btDao')&&!document.getElementById('btDao').hidden)document.getElementById('btDao').hidden=true;")
SETUP = '''([mi,books])=>{const S=G.save,M=MAPS[mi];S.lvl=M.lv[1]-2;S.exp=0;S.unlocked=12;S.qs[mi]=M.quest.length-1;S.qp=0;S.b2qt={};S.cleared=S.cleared.filter(x=>x!==mi);
  S.potHP=12;S.potMP=6;S.bag=[];S.riding=null;S.gold=1e5;
  for(const sl of SLOTS){const it=genItem(S.lvl,1,sl);it.enh=4;S.equip[sl]=it}
  const C=CLASS_BY_ID[S.cls];S.skl=[Math.min(10,1+Math.floor(S.lvl/6)),Math.min(10,Math.floor(S.lvl/7)),Math.min(10,Math.floor(S.lvl/9))].map((v,i)=>S.lvl>=C.skills[i].un?Math.max(1,v):0);S.sp=0;
  S.perks={r:{},pend:Math.min(Math.floor(S.lvl/2),20),rr:0,picks:0};
  progEnsure();let r=0;for(let i=1;i<PROG.REALMS.length&&i<=6;i++)if(S.lvl>=PROG.REALMS[i].lv)r=i;S.prog.realm=r;
  delete S.bikip;const s=BT.st();s.offer=1;s.first=1;
  if(books){const L=Math.min(10,2+mi);const pick=BT.BOOKS.filter(B=>B.t==='a'&&!B.side&&B.rq<=r).sort((a,b)=>b.rar-a.rar||b.m*10/b.cd-a.m*10/a.cd);
    const ids=[pick[0].id,pick[1].id];for(const id of ids)s.own[id]={lv:L,pg:0};const ps=BT.BOOKS.filter(B=>B.t==='p').slice(0,2);for(const B of ps)s.own[B.id]={lv:L,pg:0};
    BT.equip(ids[0],0);BT.equip(ids[1],1);BT.equip(ps[0].id,0);BT.equip(ps[1].id,1)}
  window.__done=0;B2.stats.fights=[];B2.stats.hits=[];document.getElementById('clear').hidden=true;G.timers=[];
  while(window.PERKS&&PERKS.offerPending()>0&&PERKS.pickAuto());recalc();travel(mi,false);G.p.hp=G.p.maxhp;G.p.mp=G.p.maxmp;BT._s.casts=0;
  const a=G.W.arena;G.p.x=a.x-a.r*0.4;G.p.y=a.y+a.r*0.5;G.cam.x=G.p.x;G.cam.y=G.p.y;return{lvl:S.lvl,realm:r,pow:G.p.power,eq:BT.st().eq,ps:BT.st().ps}}'''
res = []
with sync_playwright() as p:
    b, ctx, pg, errs = open_page(p, DESK)
    pg.click('#tNew'); pg.click(f'[data-c="{cls}"]'); pg.click('#goBtn'); pg.wait_for_timeout(300); pg.click('#stGo')
    pg.evaluate("G.save.set.auto=true;G.save.set.sfx=false;G.save.set.music=false")
    for mi in idx:
        for books in (0, 1):
            st = pg.evaluate(SETUP, [mi, books]); g0 = pg.evaluate('G.t'); deaths = 0
            while pg.evaluate('G.t') - g0 < 420:
                r = pg.evaluate(SIM, 15); deaths += r['deaths']
                if pg.evaluate("window.__done===1||G.save.cleared.includes(%d)" % mi): break
            fs = pg.evaluate("B2.stats.fights"); casts = pg.evaluate("BT._s.casts||0")
            win = pg.evaluate('G.save.cleared.includes(%d)' % mi)
            line = f"ch{mi+1:2d} {cls} books={books} {'WIN' if win else 'NO WIN'} lvl {st['lvl']} realm {st['realm']} pow {st['pow']} deaths {deaths} fights [{' '.join(('W' if f['win'] else 'L')+str(f['t'])+'s' for f in fs)}] book-casts {casts} eq {st['eq']}"
            print(line, flush=True); res.append(line)
    print('SUMMARY'); [print(' ', l) for l in res]
    print('errors', errs[:8]); b.close()

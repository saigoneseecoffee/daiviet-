"""Bot chạy riêng từng chương tới khi qua chương: cấp = cấp đầu chương, đồ Tinh Xảo +4 cùng cấp (GR/GE), tối đa 20 bí kíp (PK).
   python3 chapters_bot.py <lớp> <phút tối đa mỗi chương> [chỉ số chương...]   -> in thời gian, số lần chết, số lượt đánh boss"""
import sys, json, os
os.environ.setdefault('DVHK_HTML', '/home/claude/wt_chapters/dist/agent_chapters.html')
from harness import *
cls = sys.argv[1] if len(sys.argv) > 1 else 'kiem'
mins = float(sys.argv[2]) if len(sys.argv) > 2 else 25
idx = [int(a) for a in sys.argv[3:]] or list(range(12))
GR,GE,PK = int(os.environ.get('GR','1')),int(os.environ.get('GE','4')),int(os.environ.get('PK','20'))  # độ hiếm, cấp rèn, số bí kíp
SIM = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'bot.py')).read().split("SIM = '''")[1].split("'''")[0]
SIM = SIM.replace("if(!document.getElementById('clear').hidden){const b=document.getElementById('clNext')||document.getElementById('clNg');b.click();document.getElementById('stGo')&&document.getElementById('stGo').click();}",
  "if(!document.getElementById('clear').hidden){document.getElementById('clStay').click();window.__done=1;break}")
SIM = SIM.replace("if(G.state==='dead'){deaths++;", "const TR=window.__tr;if(G.state==='dead'){deaths++;TR.d++;if(B2&&B2.diedInFight)TR.bd++;")
SIM = SIM.replace("if(G.hitstop>0)G.hitstop-=dt;else update(dt*G.slow);",
  "if(G.hitstop>0)G.hitstop-=dt;else update(dt*G.slow);TR.t+=dt;if(G.boss&&G.boss.b2&&G.boss.b2.engaged)TR.bt+=dt;if(i%600===0)while(window.PERKS&&PERKS.offerPending()>0&&PERKS.pickAuto());")
assert 'window.__done' in SIM and 'TR.bt' in SIM
SETUP = '''([mi,cls,GR,GE,PK])=>{const S=G.save,M=MAPS[mi];S.lvl=M.lv[0];S.exp=0;S.unlocked=12;S.qs[mi]=0;S.qp=0;S.cleared=S.cleared.filter(x=>x!==mi);S.b2qt={};
  S.gold=500*(mi+1)*(mi+1);S.ore=20;S.potHP=10;S.potMP=6;S.charm=2;S.bag=[];
  for(const sl of SLOTS){const it=genItem(M.lv[0],GR,sl);it.enh=GE;S.equip[sl]=it}
  const C=CLASS_BY_ID[S.cls];S.skl=[Math.min(10,1+Math.floor(M.lv[0]/6)),Math.min(10,Math.floor(M.lv[0]/7)),Math.min(10,Math.floor(M.lv[0]/9))].map((v,i)=>S.lvl>=C.skills[i].un?Math.max(1,v):0);S.sp=0;
  S.perks={r:{},pend:Math.min(Math.floor(S.lvl/2),PK),rr:0,picks:0};
  window.__tr={t:0,d:0,bd:0,bt:0};document.getElementById('clear').hidden=true;G.timers=[];G.paused=false;window.__done=0;B2.stats.fights=[];B2.stats.hits=[];B2.stats.imp=0;
  recalc();travel(mi,false);G.p.hp=G.p.maxhp;G.p.mp=G.p.maxmp;
  while(window.PERKS&&PERKS.offerPending()>0&&PERKS.pickAuto());recalc();G.p.hp=G.p.maxhp;
  return{lvl:S.lvl,pow:G.p.power,atk:G.p.atk,hp:G.p.maxhp}}'''
res = []
with sync_playwright() as p:
    b, ctx, pg, errs = open_page(p, DESK)
    pg.click('#tNew'); pg.click(f'[data-c="{cls}"]'); pg.click('#goBtn'); pg.wait_for_timeout(300); pg.click('#stGo')
    pg.evaluate("G.save.set.auto=true;G.save.set.sfx=false;G.save.set.music=false")
    for mi in idx:
        st = pg.evaluate(SETUP, [mi, cls, GR, GE, PK])
        name = pg.evaluate(f"MAPS[{mi}].name")
        print(f"== ch{mi+1} {name}", json.dumps(st, ensure_ascii=False), flush=True)
        t = 0; done = False
        while t < mins:
            r = pg.evaluate(SIM, 60); t += 1
            done = pg.evaluate("window.__done===1||G.save.cleared.includes(%d)" % mi)
            if int(t) % 3 == 0 or done: print(f"   {t:3.0f}m lvl {r['lvl']} step {r['qs']} qp {r['qp']} deaths {r['deaths']} boss {r['boss']} hp {r['hp']}", flush=True)
            if done: break
        tr = pg.evaluate("window.__tr"); fs = pg.evaluate("B2.stats.fights"); imp = pg.evaluate("B2.stats.imp||0")
        hits = pg.evaluate("(()=>{const o={};for(const[m,k,d]of B2.stats.hits){o[k]=(o[k]||0)+1}return o})()")
        line = f"ch{mi+1:2d} {name:<11} {'CLEAR' if done else 'NOT CLEARED'} {tr['t']/60:5.1f} min, deaths {tr['d']} (boss {tr['bd']}), boss attempts {len(fs)} [{' '.join(('W' if f['win'] else 'L')+str(f['t'])+'s' for f in fs)}], boss time {tr['bt']/60:.1f} min, mech-procs {imp}, hits {json.dumps(hits,ensure_ascii=False)}"
        print(line, flush=True); res.append(line)
        pg.screenshot(path=f'shots/ch/bot_{cls}_{mi:02d}.png')
    print('SUMMARY'); [print(' ', l) for l in res]
    print('errors', errs[:8])
    b.close()

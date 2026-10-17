"""Thử riêng boss các chương: người chơi yếu (đồ thường, không bí kíp) để trận kéo dài qua đủ 3 giai đoạn;
   chụp ảnh mỗi giai đoạn, đếm số lần cơ chế vị trí kích hoạt. python3 chapters_boss.py <lớp> [chỉ số chương...]"""
import sys, json, os
os.environ.setdefault('DVHK_HTML', '/home/claude/wt_chapters/dist/agent_chapters.html')
from harness import *
cls = sys.argv[1] if len(sys.argv) > 1 else 'kiem'
idx = [int(a) for a in sys.argv[2:]] or [2,3,5,6,8,10]
SIM = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'bot.py')).read().split("SIM = '''")[1].split("'''")[0]
SIM = SIM.replace("if(!document.getElementById('clear').hidden){const b=document.getElementById('clNext')||document.getElementById('clNg');b.click();document.getElementById('stGo')&&document.getElementById('stGo').click();}",
  "if(!document.getElementById('clear').hidden){document.getElementById('clStay').click();window.__done=1;break}")
SIM = SIM.replace("if(G.hitstop>0)G.hitstop-=dt;else update(dt*G.slow);","if(G.hitstop>0)G.hitstop-=dt;else update(dt*G.slow);const b=G.boss;if(b&&b.b2&&b.b2.ph!==window.__ph){window.__ph=b.b2.ph;break}if(window.__snap&&b&&b.b2&&b.b2.engaged&&!b.b2.trans&&B2.hz.some(h=>!h.fired&&h.t>h.dur*0.45&&!h.noBot)){window.__snap=0;break}")
SETUP = '''([mi,GR,GE])=>{const S=G.save,M=MAPS[mi];S.lvl=M.lv[0]+Math.round((M.lv[1]-M.lv[0])/2);S.exp=0;S.unlocked=12;S.qs[mi]=M.quest.length-1;S.qp=0;S.b2qt={};
  S.potHP=12;S.potMP=6;S.bag=[];S.perks={r:{},pend:0,rr:0,picks:0};S.riding=null;
  for(const sl of SLOTS){const it=genItem(S.lvl,GR,sl);it.enh=GE;S.equip[sl]=it}
  const C=CLASS_BY_ID[S.cls];S.skl=[5,4,3];S.sp=0;window.__done=0;window.__ph=0;window.__snap=0;B2.stats.fights=[];B2.stats.hits=[];B2.stats.imp=0;
  document.getElementById('clear').hidden=true;G.timers=[];recalc();travel(mi,false);G.p.hp=G.p.maxhp;G.p.mp=G.p.maxmp;
  const a=G.W.arena;G.p.x=a.x-a.r*0.4;G.p.y=a.y+a.r*0.5;G.cam.x=G.p.x;G.cam.y=G.p.y;return{lvl:S.lvl,pow:G.p.power}}'''
res=[]
with sync_playwright() as p:
    b, ctx, pg, errs = open_page(p, PHONE)
    pg.click('#tNew'); pg.click(f'[data-c="{cls}"]'); pg.click('#goBtn'); pg.wait_for_timeout(300); pg.click('#stGo')
    pg.evaluate("G.save.set.auto=true;G.save.set.sfx=false;G.save.set.music=false")
    for mi in idx:
        GR,GE=int(os.environ.get('GR','0')),int(os.environ.get('GE','2'))
        st=pg.evaluate(SETUP,[mi,GR,GE]); name=pg.evaluate(f"MAPS[{mi}].name"); boss=pg.evaluate(f"ET[MAPS[{mi}].boss].name")
        print(f"== ch{mi+1} {name} / {boss}", st, flush=True)
        t=0; shots=0; last_ph=0; deaths=0; g0=pg.evaluate('G.t')
        while t<480:
            r=pg.evaluate(SIM,10); t=round(pg.evaluate('G.t')-g0); deaths+=r['deaths']
            ph=pg.evaluate("G.boss&&G.boss.b2?G.boss.b2.ph:0")
            if ph!=last_ph and ph>0:
                last_ph=ph; pg.evaluate("window.__snap=1")
            if pg.evaluate("window.__snap===0&&!!G.boss") and shots<last_ph:
                shots=last_ph; pg.wait_for_timeout(250); pg.screenshot(path=f'shots/ch/boss{mi:02d}_ph{last_ph}.png')
            if pg.evaluate("window.__done===1||G.save.cleared.includes(%d)"%mi): break
        fs=pg.evaluate("B2.stats.fights"); imp=pg.evaluate("B2.stats.imp||0")
        hits=pg.evaluate("(()=>{const o={};for(const[m,k,d]of B2.stats.hits){o[k]=(o[k]||0)+1}return o})()")
        line=f"ch{mi+1:2d} {boss:<12} {'WIN' if pg.evaluate('G.save.cleared.includes(%d)'%mi) else 'NO WIN'} sim {t}s deaths {deaths} attempts {len(fs)} [{' '.join(('W' if f['win'] else 'L')+str(f['t'])+'s'+('/p'+str(f.get('ph','')) if not f['win'] else '') for f in fs)}] max-phase-shot {shots} mech-procs {imp} hits {json.dumps(hits,ensure_ascii=False)}"
        print(line,flush=True); res.append(line)
    print('SUMMARY'); [print(' ',l) for l in res]
    print('errors',errs[:8]); b.close()

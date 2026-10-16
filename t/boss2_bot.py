"""Bot chạy hết 6 chương như bot.py, nhưng ghi thêm thời gian/số lần chết theo từng chương và số lượt đánh boss.
   python3 boss2_bot.py <lớp> <số phút mô phỏng tối đa> [nhãn]"""
import sys, json, os, re
os.environ.setdefault('DVHK_HTML', '/home/claude/dvhk/dist/agent_boss2.html')
from harness import *
cls = sys.argv[1] if len(sys.argv) > 1 else 'kiem'
mins = float(sys.argv[2]) if len(sys.argv) > 2 else 40
tag = sys.argv[3] if len(sys.argv) > 3 else ''
SIM = open(os.path.join(T, 'bot.py')).read().split("SIM = '''")[1].split("'''")[0]
# chèn bộ đếm theo chương: sau mỗi bước update ghi lại chương hiện tại, chết ở chương nào, có đang đánh boss không
SIM = SIM.replace("if(G.state==='dead'){deaths++;",
  "const TR=window.__tr||(window.__tr={t:0,ch:{}});const ck=S.ng?'ng':S.map;const C=TR.ch[ck]||(TR.ch[ck]={t:0,d:0,bd:0,bt:0});"
  "if(G.state==='dead'){deaths++;C.d++;if(B2&&B2.diedInFight)C.bd++;")
SIM = SIM.replace("if(G.hitstop>0)G.hitstop-=dt;else update(dt*G.slow);",
  "if(G.hitstop>0)G.hitstop-=dt;else update(dt*G.slow);TR.t+=dt;C.t+=dt;if(G.boss&&G.boss.b2&&G.boss.b2.engaged)C.bt+=dt;")
assert 'TR.t+=dt' in SIM and 'C.bd++' in SIM
with sync_playwright() as p:
    b, ctx, pg, errs = open_page(p, DESK)
    pg.click('#tNew'); pg.click(f'[data-c="{cls}"]'); pg.click('#goBtn'); pg.wait_for_timeout(300); pg.click('#stGo')
    pg.evaluate("G.save.set.auto=true;G.save.set.sfx=false;G.save.set.music=false")
    t = 0
    while t < mins:
        r = pg.evaluate(SIM, 60); t += 1
        print(f"{t:4.0f}m", json.dumps(r, ensure_ascii=False), flush=True)
        if r['ng'] > 0: break
    tr = pg.evaluate("window.__tr")
    st = pg.evaluate("({fights:B2.stats.fights,hits:B2.stats.hits.length})")
    print('CHAPTERS')
    tot_d = 0
    for k in sorted(tr['ch'].keys()):
        c = tr['ch'][k]; tot_d += c['d']
        print(f"  ch{k if k=='ng' else int(k)+1}: {c['t']/60:5.1f} min, deaths {c['d']} (boss {c['bd']}), boss-fight time {c['bt']/60:4.1f} min")
    print(f"TOTAL {tr['t']/60:.1f} sim-min, deaths {tot_d}, ng={r['ng']}")
    fights = st['fights']
    for mi in range(6):
        fs = [f for f in fights if f['map'] == mi]
        if fs: print(f"  boss ch{mi+1}: attempts {len(fs)} " + ' '.join(('W' if f['win'] else 'L') + str(f['t']) + 's' + (('/min'+str(f.get('mh','?'))+'%') if f['win'] else '/p' + str(f.get('ph', '?'))) for f in fs))
    hits = pg.evaluate("(()=>{const o={};for(const[m,k,d]of B2.stats.hits){const key=m+':'+k;o[key]=(o[key]||0)+1}return o})()")
    print('HITS', json.dumps(hits, ensure_ascii=False))
    print('errors', errs[:5])
    pg.screenshot(path=f'shots/boss2bot_{cls}{tag}.png')
    b.close()

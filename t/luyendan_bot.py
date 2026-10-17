"""Bot chơi chiến dịch từ đầu với Luyện Đan: so nhịp lên Cảnh Giới khi có cổng đan dược (LD.bot lo hái thuốc, làm vườn, luyện đan, đột phá)
   với khi tắt cổng (LD.gate=false, như trước). Dựa trên SIM của bot.py, thêm PROG.autoSpend như prog_bot.py.
   python3 luyendan_bot.py <lớp> <phút mô phỏng> <ld|off>   → mỗi phút một dòng, cuối cùng bảng mốc Cảnh Giới (phút, cấp, chương)"""
import sys, json, os
os.environ.setdefault('DVHK_HTML', os.path.abspath(os.path.join(os.path.dirname(__file__), '../dist/agent_luyendan.html')))
from harness import *
cls = sys.argv[1] if len(sys.argv) > 1 else 'kiem'
mins = float(sys.argv[2]) if len(sys.argv) > 2 else 30
mode = sys.argv[3] if len(sys.argv) > 3 else 'ld'
SIM = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'bot.py')).read().split("SIM = '''")[1].split("'''")[0]
# mỗi 5 giây game: tiêu Chân Khí như prog_bot, rồi để LD.bot làm phần luyện đan (cộng 5 giây vào đồng hồ ảo của vườn)
SIM = SIM.replace("const L=S.lvl;while(S.potHP<10",
  "if(window.LD&&LD.gate)LD.bot(5);PROG.autoSpend();const ov=document.getElementById('rgOv');if(ov)ov.hidden=true;const R_=realmIdx();if(R_>(window.__rm||0)){window.__rm=R_;(window.__rl||(window.__rl=[])).push({r:R_,min:+(window.__t/60).toFixed(1),lvl:S.lvl,ch:S.map+1,cq:S.cq})}\n     const L=S.lvl;while(S.potHP<10")
SIM = SIM.replace("if(G.hitstop>0)G.hitstop-=dt;else update(dt*G.slow);", "if(G.hitstop>0)G.hitstop-=dt;else update(dt*G.slow);window.__t=(window.__t||0)+dt;")
assert 'LD.bot(5)' in SIM and '__t=' in SIM
with sync_playwright() as p:
    b, ctx, pg, errs = open_page(p, DESK)
    pg.click('#tNew'); pg.click(f'[data-c="{cls}"]'); pg.click('#goBtn'); pg.wait_for_timeout(300); pg.click('#stGo')
    pg.evaluate("G.save.set.auto=true;G.save.set.sfx=false;G.save.set.music=false")
    if mode == 'off': pg.evaluate("LD.gate=false")
    t = 0
    while t < mins:
        r = pg.evaluate(SIM, 60); t += 1
        x = pg.evaluate("(()=>{const d=G.save.ld||{};return{realm:realmIdx(),cq:G.save.cq|0,herb:Object.values(d.h||{}).reduce((a,b)=>a+b,0),ldd:d.m&&d.m.ldd,hmp:d.m&&d.m.hmp,st:d.st}})()")
        print(f"{t:4.0f}m lvl {r['lvl']:3d} ch {r['map']+1:2d} step {r['qs']} realm {x['realm']} cq {x['cq']} herbs {x['herb']} ldd {x['ldd']} hmp {x['hmp']} st {json.dumps(x['st'])}", flush=True)
    print('REALMS', mode, json.dumps(pg.evaluate("window.__rl||[]")))
    print('errors', errs[:5])
    b.close()

"""Ảnh chụp bảng Kỹ năng / Cảnh Giới / Kinh Mạch và màn đột phá trên mọi khổ màn hình.
   DVHK_HTML=... python3 prog_shots.py [PHONE,SE,LAND,DESK]"""
import sys, os
os.environ.setdefault('DVHK_HTML', '/home/claude/wt_prog/dist/agent_prog.html')
from harness import *
os.makedirs('shots', exist_ok=True)
names = (sys.argv[1] if len(sys.argv) > 1 else 'PHONE,SE,LAND,DESK').split(',')
SETUP = """()=>{const S=G.save;S.lvl=52;S.exp=0;S.sp=6;S.skl=[10,9,7];S.tq=40;S.gold=900000;S.cq=5200;progEnsure(S);
  S.prog.realm=3;S.prog.mer=[12,9,7,4,2,0,0,0];recalc();UI.cache={}}"""
bad = 0
with sync_playwright() as p:
    for nm in names:
        b, ctx, pg, errs = open_page(p, globals()[nm])
        pg.click('#tNew'); pg.click('[data-c="kiem"]'); pg.click('#goBtn'); pg.wait_for_timeout(400); pg.click('#stGo'); pg.wait_for_timeout(300)
        pg.evaluate(SETUP)
        pg.evaluate("UI.open('skill')"); pg.wait_for_timeout(500)
        pg.screenshot(path=f'shots/prog_{nm}_skill.png')
        o = overflow(pg); print(nm, 'skill overflow', o)
        if o['sw'] > o['cw']: bad += 1
        # cuộn xuống phần kỹ năng để thấy giá
        pg.evaluate("document.querySelector('#shBody').scrollTop=200"); pg.wait_for_timeout(200)
        pg.screenshot(path=f'shots/prog_{nm}_skill2.png')
        pg.click('[data-t="cg"]'); pg.wait_for_timeout(400)
        pg.screenshot(path=f'shots/prog_{nm}_realm.png')
        o = overflow(pg); print(nm, 'realm overflow', o)
        pg.click('[data-t="km"]'); pg.wait_for_timeout(700)
        pg.screenshot(path=f'shots/prog_{nm}_mer.png')
        o = overflow(pg); print(nm, 'mer overflow', o)
        # chạm vào hình để chọn mạch khác, khai một huyệt
        pg.click('[data-m="3"]'); pg.wait_for_timeout(300)
        cq0 = pg.evaluate('G.save.cq'); pg.click('#kmOpen'); pg.wait_for_timeout(400)
        print(nm, 'khai huyệt', cq0, '->', pg.evaluate('G.save.cq'), pg.evaluate('G.save.prog.mer'))
        pg.screenshot(path=f'shots/prog_{nm}_mer2.png')
        # kích thước nút chạm
        small = pg.evaluate("""[...document.querySelectorAll('#shBody button, #shTabs button')].filter(b=>b.offsetParent).map(b=>{const r=b.getBoundingClientRect();return [b.textContent.trim().slice(0,18),Math.round(r.width),Math.round(r.height)]}).filter(x=>x[2]<44)""")
        print(nm, 'nút thấp hơn 44px', small)
        # đột phá
        pg.click('[data-t="cg"]'); pg.wait_for_timeout(300)
        pg.click('#rgGo'); pg.wait_for_timeout(1300)
        pg.screenshot(path=f'shots/prog_{nm}_break.png')
        print(nm, 'realm', pg.evaluate('G.save.prog.realm'), 'rank', pg.inner_text('#pRank'))
        pg.wait_for_timeout(3000)
        pg.screenshot(path=f'shots/prog_{nm}_aura.png')
        print(nm, 'errors', errs)
        if errs: bad += 1
        b.close()
print('BAD', bad)

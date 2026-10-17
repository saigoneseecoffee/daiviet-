# Kiểm thử outfit.js (Y Phục, hào quang Cảnh Giới, bảng danh hiệu, đại chiêu)
# chạy: DVHK_HTML=$(pwd)/../dist/agent_outfit.html python3 outfit_test.py [phone|land|desk|se|all]
import sys, os
from harness import *
from tower_lib import new_game
os.makedirs('shots', exist_ok=True)
MODES = sys.argv[1:] or ['phone']
if MODES == ['all']: MODES = ['phone', 'land', 'desk', 'se']
R = []
def ok(n, c, x=''):
    R.append(bool(c)); print(('PASS ' if c else 'FAIL ') + n, x, flush=True)

def run(p, mode):
    OPTS = {'phone': PHONE, 'land': LAND, 'desk': DESK, 'se': SE}[mode]
    touch = mode != 'desk'
    b, ctx, pg, errs = open_page(p, OPTS)
    ev = pg.evaluate
    pg.set_default_timeout(120000)
    def tap(sel):
        ev("(()=>{let n=0;while(window.PERKS&&PERKS.offerPending&&(PERKS.offerPending()||PERKS.showing())&&n++<60)PERKS.pickAuto()})()")
        el = pg.locator(sel).first
        try: el.scroll_into_view_if_needed(timeout=30000)
        except Exception:
            pg.screenshot(path=f'shots/outfit_{mode}_FAIL.png'); print('TAPFAIL', sel, ev("[G.state,G.paused,UI.panel,[...document.querySelectorAll('section.screen')].filter(e=>!e.hidden).map(e=>e.id)]")); raise
        bb = el.bounding_box()
        x, y = bb['x'] + bb['width'] / 2, bb['y'] + bb['height'] / 2
        if touch: pg.touchscreen.tap(x, y)
        else: pg.mouse.click(x, y)
        pg.wait_for_timeout(300)
    shot = lambda n: pg.screenshot(path=f'shots/outfit_{mode}_{n}.png', timeout=120000)
    new_game(pg, 'kiem')
    ev("G.save.tut={move:true,atk:true,skill:true,equip:true,forge:true,mount:true};document.getElementById('offer').hidden=true")
    # ---- save mới ----
    st = ev("OF.state()")
    ok(f'[{mode}] save mới có G.save.outfit', st and st['cur'] == 'mac' and st['own'].get('aonau') == 1, str(st))
    ok(f'[{mode}] 16 bộ y phục', ev("OF.OUTFITS.length") == 16)
    ok(f'[{mode}] mặc định giữ nguyên LOOKS phái', ev("G.p.look.hat===LOOKS.kiem.hat&&G.p.look.robe===LOOKS.kiem.robe"))
    # ---- mở thẻ Y Phục qua nút Võ Đạo ----
    tap('#bHub'); pg.wait_for_timeout(300)
    if pg.locator('#shTabs [data-t="yphuc"]').count(): tap('#shTabs [data-t="yphuc"]')
    ok(f'[{mode}] thẻ Y Phục mở', pg.locator('#ofPrev').count() == 1 and ev("HUB.cur") == 'yphuc')
    ok(f'[{mode}] 16 thẻ y phục trong tủ', pg.locator('.ofCard').count() == 16)
    small = ev("[...document.querySelectorAll('.ofCard,.ofBtns .btn')].filter(e=>e.offsetParent&&e.getBoundingClientRect().height<44).length")
    ok(f'[{mode}] nút >= 44px', small == 0, str(small))
    o = overflow(pg); ok(f'[{mode}] không tràn ngang', o['sw'] <= o['cw'] and ev("document.getElementById('shBody').scrollWidth<=document.getElementById('shBody').clientWidth+1"), str(o))
    px = ev("(()=>{const c=document.getElementById('ofPrev');const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let n=0;for(let i=3;i<d.length;i+=16)if(d[i]>0)n++;return n})()")
    ok(f'[{mode}] khung xem trước có vẽ nhân vật', px > 200, str(px))
    shot('panel')
    # ---- mua áo the (vàng) rồi mặc ----
    tap('[data-of="aothe"]')
    ok(f'[{mode}] chọn áo the, chưa đủ vàng thì nút mua khóa', ev("document.getElementById('ofBuy')&&document.getElementById('ofBuy').disabled"))
    ev("G.save.gold=5000;HUB.refresh()"); pg.wait_for_timeout(200)
    tap('#ofBuy')
    ok(f'[{mode}] mua áo the trừ 3000 vàng', ev("G.save.gold") == 2000 and ev("OF.state().own.aothe") == 1)
    ok(f'[{mode}] mặc áo the: ngoại hình đổi', ev("G.p.look.hat==='khanxep'&&G.p.look.armor==='aodai'&&G.p.look.wp==='sword'"))
    ok(f'[{mode}] cộng +1% sinh lực khi mặc', ev("(()=>{const a=G.p.maxhp;OF.wear('mac');const b0=G.p.maxhp;OF.wear('aothe');return a>b0})()"))
    shot('aothe')
    tap('#shClose')
    # ---- mở khóa theo Cảnh Giới / chương / thành tựu ----
    ev("G.save.lvl=60;progEnsure(G.save);G.save.prog.realm=5;G.save.cleared=[0,2];recalc();OF.checkUnlocks()")
    own = ev("OF.state().own")
    ok(f'[{mode}] Cảnh Giới 5 mở Tăng Bào + Đạo Bào', own.get('truclam') == 1 and own.get('daobao') == 1, str(own))
    ok(f'[{mode}] chương 1, 3 mở Lông Chim Lạc, Chiến Y Mê Linh', own.get('lacviet') == 1 and own.get('haiba') == 1)
    ok(f'[{mode}] chưa mở Hoàng Bào (cần Võ Thần)', not own.get('hoangbao'))
    ok(f'[{mode}] chấm đỏ khi có y phục mới', ev("HUB.tabs.find(t=>t.id==='yphuc').dot()"))
    ev("G.save.daily&&(G.save.daily.ach.k1k=1);OF.checkUnlocks()")
    ok(f'[{mode}] thành tựu Bách Chiến mở Bạch Y', ev("!!OF.state().own.bachy") or not ev("!!G.save.daily"))
    # ---- boss rơi y phục (bảo hiểm 30 boss) ----
    got = ev("(()=>{const st=OF.state();let n=0;while(!st.own.hacy&&!st.own.tuongquan&&n<40){HK.ev('kill',{boss:true,x:G.p.x,y:G.p.y,def:{name:'Thử'}});n++}return n})()")
    ok(f'[{mode}] boss rơi y phục hiếm trong <=30 boss', got <= 30, str(got))
    # ---- hào quang: bậc 0, 4, 8 không lỗi; prog.js không vẽ chồng ----
    for ri in [0, 4, 8, 12]:
        ev(f"G.save.prog.realm={ri};G.save.lvl=Math.max(G.save.lvl,{[1,1,1,1,45,1,1,1,126,1,1,1,300][ri]});recalc();OF.wear('{ 'mac' if ri<8 else 'hoangbao'}')")
        if ri >= 8: ev("OF.dev.unlockAll();OF.wear('hoangbao')")
        ev("const q=G.W.pathPts[Math.floor(G.W.pathPts.length*0.35)];G.p.x=q.x;G.p.y=q.y;G.enemies.length=0")
        pg.wait_for_timeout(500)
        shot(f'realm{ri}')
    ok(f'[{mode}] OF.aura tắt phần vẽ trùng của prog.js', ev("OF.aura===true"))
    # ---- đại chiêu: vòng ấn dưới đất ----
    for cls_i in range(1):
        ev("G.save.skl=[12,12,12];G.save.lvl=Math.max(G.save.lvl,60);G.p.mp=G.p.maxmp=9999;G.p.skCd=[0,0,0];G.paused=false")
        ev("spawnEnemy('linh',G.p.x+80,G.p.y,10)") if ev("typeof ET!=='undefined'&&!!ET.linh") else None
        g2 = ev("(()=>{const r=castSkill(2);return[r,OF.glyphs.some(g=>g.big)]})()"); pg.wait_for_timeout(150)
        ok(f'[{mode}] đại chiêu tạo vòng ấn', g2[1], str(g2))
        shot('ult')
        r1 = ev("(()=>{G.p.skCd=[0,0,0];G.p.dash=null;G.p.mp=G.p.maxmp;const r=castSkill(1);return[r,OF.glyphs.some(g=>!g.big)]})()")
        ok(f'[{mode}] chiêu 2 tạo vòng ấn nhỏ', r1[1], str(r1))
    # ---- bảng danh hiệu bật/tắt ----
    ok(f'[{mode}] bảng danh hiệu mặc định bật', ev("OF.state().plate") == 1)
    # ---- save cũ không có khóa outfit ----
    ev("delete G.save.outfit;saveGame()")
    pg.reload(); pg.wait_for_timeout(1200)
    tap('#tCont'); pg.wait_for_timeout(800)
    ok(f'[{mode}] save cũ nạp được, tự tạo outfit', ev("!!G.save.outfit&&G.save.outfit.cur==='mac'") and ev("G.state") == 'play')
    ok(f'[{mode}] save cũ: mở khóa lại theo tiến trình', ev("(OF.checkUnlocks(),!!OF.state().own.truclam)"))
    # ---- lưu và nạp giữ bộ đang mặc ----
    ev("OF.wear('truclam');saveGame()"); pg.reload(); pg.wait_for_timeout(1200); tap('#tCont'); pg.wait_for_timeout(800)
    ok(f'[{mode}] nạp lại vẫn mặc Tăng Bào', ev("G.p.look.hat==='bald'&&G.p.look.armor==='monk'&&OF.state().cur==='truclam'"))
    # ---- hiệu năng: thời gian vẽ khung hình bậc 0 vs bậc 12 ----
    perf = ev("""(()=>{const S=G.save,m=(ri)=>{S.prog.realm=ri;const t0=performance.now();cx.save();for(let i=0;i<300;i++){G.t+=1/60;drawAura(G.p)}cx.restore();G.parts.length=0;return (performance.now()-t0)/300};
      m(0);const a=Math.min(m(0),m(0),m(0)),b=Math.min(m(12),m(12),m(12));S.prog.realm=5;return[a,b]})()""")
    ok(f'[{mode}] hào quang bậc cao rẻ (<1 ms/khung cho drawAura)', perf[1] < 1.0, f'{perf[0]:.2f}ms -> {perf[1]:.2f}ms')
    real = [e for e in errs if 'favicon' not in e[1]]
    ok(f'[{mode}] không lỗi JS', not real, str(real[:5]))
    b.close()

with sync_playwright() as p:
    for m in MODES: run(p, m)
print(f'{sum(R)}/{len(R)} passed')

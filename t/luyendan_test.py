"""Luyện Đan & Đột Phá (src/luyendan.js): bản lưu mới, bản lưu cũ ở Cảnh Giới 5, hái cây thuốc, Linh Thú, vườn thuốc (giả Date.now),
   luyện đan, đột phá thành công / thất bại, đan tăng lực + biểu tượng HUD, ảnh chụp phone / landscape / SE / desktop, tràn ngang, lỗi JS.
   Chạy: cd t && DVHK_HTML=$(pwd)/../dist/agent_luyendan.html python3 luyendan_test.py"""
import os, sys, json
os.environ.setdefault('DVHK_HTML', os.path.abspath(os.path.join(os.path.dirname(__file__), '../dist/agent_luyendan.html')))
from harness import *
from tower_lib import new_game
SH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'shots')
os.makedirs(SH, exist_ok=True)
# đồng hồ giả: Date.now() = giờ thật + window.__off (ms)
CLOCK = "(()=>{const dn=Date.now.bind(Date);window.__off=0;Date.now=()=>dn()+window.__off})()"
ok_n = 0; bad = []
def check(cond, name, extra=''):
    global ok_n
    if cond: ok_n += 1; print('  ok  ', name, extra)
    else: bad.append(name); print('  FAIL', name, extra)
def step(pg, secs):
    pg.evaluate(f"(()=>{{for(let i=0;i<{int(secs*60)};i++){{if(G.state==='dead'){{G.p.deadT=0}}G.paused=false;update(1/60)}}}})()")
def quiet(pg):
    pg.evaluate("G.save.tut={move:1,atk:1,equip:1,skill:1,forge:1,mount:1};G.save.set.sfx=false;G.save.set.music=false;document.querySelectorAll('#hint').forEach(e=>e.hidden=true)")
def tap(pg, sel):
    # nhấp qua DOM: trình duyệt headless vẽ game rất chậm (3–6 khung/giây) nên kiểm tra "ổn định" của Playwright hay treo
    for _ in range(40):
        if pg.evaluate("s=>{const b=document.querySelector(s);if(b){b.click();return 1}return 0}", sel): return
        pg.wait_for_timeout(250)
    raise Exception('không thấy ' + sel)
def ovf(pg):
    o = overflow(pg); return o['sw'] <= o['cw'] and o['bw'] <= o['cw'], o
def shot(pg, name):
    pg.set_default_timeout(120000)
    pg.screenshot(path=f'{SH}/luyendan_{name}.png')

with sync_playwright() as p:
    # ================= PHONE: vòng chơi chính =================
    b, ctx, pg, errs = open_page(p, PHONE, init=CLOCK)
    new_game(pg, 'kiem'); quiet(pg)
    print('[bản lưu mới]')
    r = pg.evaluate("({ld:!!G.save.ld,gift:G.save.ld&&G.save.ld.gift,realm:realmIdx(),hub:HUB.tabs.some(t=>t.id==='luyendan'),nodes:LD.nodes().length,plots:G.W.ldPlots.length,npc:G.W.npcs.some(n=>n.id==='luongy')&&G.W.npcs.some(n=>n.id==='danlo')})")
    check(r['hub'] and r['nodes'] >= 10 and r['plots'] == 6 and r['npc'], 'thẻ HUB, cây thuốc, 6 luống, Lương Y + Đan Lô', json.dumps(r))
    check(r['gift'] == 0, 'chưa tặng quà khi cấp 1')
    pg.evaluate("G.save.lvl=8;recalc()"); step(pg, 1.2)
    check(pg.evaluate("G.save.ld.gift") == 1, 'cấp 8: Lương Y báo có quà')
    check(pg.evaluate("HUB.tabs.find(t=>t.id==='luyendan').dot()"), 'chấm đỏ khi có quà')
    # Lương Y mở đúng thẻ
    pg.evaluate("(()=>{const n=G.W.npcs.find(n=>n.id==='luongy');G.p.x=n.x;G.p.y=n.y+30;G.cam.x=G.p.x;G.cam.y=G.p.y})()"); step(pg, 0.2)
    check('Lương Y' in pg.evaluate("document.getElementById('npcBtn').textContent"), 'nút NPC Lương Y')
    tap(pg, '#npcBtn'); pg.wait_for_timeout(400)
    check(pg.evaluate("UI.panel==='vodao'&&HUB.cur==='luyendan'&&!!document.getElementById('ldGift')"), 'NPC mở thẻ Luyện Đan với quà')
    shot(pg, 'phone_gift')
    tap(pg, '#ldGift'); pg.wait_for_timeout(300)
    r = pg.evaluate("({tk:LD.pill('tk'),ct:LD.data().h.ct,ldd:LD.data().m.ldd,gift:LD.data().gift})")
    check(r['tk'][2] == 1 and r['ct'] == 4 and r['ldd'] == 1 and r['gift'] == 2, 'nhận quà: Tụ Khí Đan Thượng phẩm + dược liệu', json.dumps(r))
    pg.evaluate("UI.close()")

    print('[cổng đột phá trong prog.js]')
    pg.evaluate("G.save.lvl=10;G.save.cq=500;recalc();LD.pill('tk')[2]=0")
    check(pg.evaluate("PROG.canBreak()") is False, 'đủ cấp + Chân Khí nhưng thiếu đan: canBreak false')
    check('Tụ Khí Đan' in pg.evaluate("PROG.breakthrough()"), 'PROG.breakthrough đòi đan')
    pg.evaluate("UI.open('skill','cg')"); pg.wait_for_timeout(300)
    check(pg.evaluate("!!document.querySelector('.ldReq')"), 'thẻ Cảnh Giới hiện dòng đan dược')
    tap(pg, '#rgGo'); pg.wait_for_timeout(300)
    check(pg.evaluate("UI.panel==='vodao'&&HUB.cur==='luyendan'"), 'nút đột phá ở thẻ Cảnh Giới mở Luyện Đan')
    pg.evaluate("UI.close()")

    print('[hái cây thuốc ngoài bản đồ]')
    r = pg.evaluate("""(()=>{const n=LD.nodes().find(n=>!n.g&&LD.nodeReady(n));const id=LD.HERBS[n.h].id;const c0=LD.data().h[id]||0;
      G.enemies.length=0;G.p.x=n.x+8;G.p.y=n.y+4;G.cam.x=G.p.x;G.cam.y=G.p.y;return{i:n.i,id,c0}})()""")
    step(pg, 0.35); pg.wait_for_timeout(250); shot(pg, 'phone_harvest')
    step(pg, 0.6)
    r2 = pg.evaluate(f"({{c:LD.data().h['{r['id']}']||0,ready:LD.nodeReady(LD.nodes()[{r['i']}])}})")
    check(r2['c'] > r['c0'] and not r2['ready'], 'đứng cạnh 0,7 giây thì hái được, cây chuyển sang gốc trơ', f"{r['c0']}->{r2['c']}")
    pg.evaluate("G.p.x+=400;window.__off+=301e3"); step(pg, 0.6)
    check(pg.evaluate(f"LD.nodeReady(LD.nodes()[{r['i']}])"), 'cây mọc lại sau 5 phút (Date.now giả)')
    # chạm để tự đi tới
    pg.evaluate("G.paused=false")
    r = pg.evaluate("""(()=>{const n=LD.nodes().find(n=>!n.g&&LD.nodeReady(n)&&n.i!==%d);G.p.x=n.x+160;G.p.y=n.y;G.cam.x=G.p.x;G.cam.y=G.p.y-20;G.enemies.length=0;
      const z=G.cam.z;return{i:n.i,sx:(n.x-G.cam.x)*z+VW/2,sy:(n.y-14-G.cam.y)*z+VH/2}})()""" % r['i'])
    pg.mouse.click(r['sx'], r['sy'])
    check(pg.evaluate("LD.LS.walkTo") == r['i'], 'chạm vào cây: tự đi tới')
    step(pg, 3)
    check(not pg.evaluate(f"LD.nodeReady(LD.nodes()[{r['i']}])"), 'đi tới nơi và hái')

    print('[vườn thuốc, giờ thật]')
    pg.evaluate("G.save.gold=5000")
    check(pg.evaluate("LD.plant(0,'ct')") == '', 'gieo Cam Thảo ô 1')
    check(pg.evaluate("LD.plant(4,'ct')") != '', 'ô 5 khóa khi chưa Cảnh Giới 2')
    pg.evaluate("window.__off+=60e3")
    r = pg.evaluate("LD.plotState(0)")
    check(not r.get('ready') and 0.45 < r['k'] < 0.55, 'nửa đường sau 1 phút', json.dumps(r))
    pg.evaluate("(()=>{G.p.x=4*T;G.p.y=55.2*T;G.cam.x=G.p.x;G.cam.y=G.p.y-20})()"); step(pg, 1.1); pg.wait_for_timeout(300)
    pg.evaluate("LD.plant(1,'nc');LD.plant(2,'ct');LD.plant(3,'ct');window.__off+=60e3;LD.data().plots[2].t0-=40e3;LD.data().plots[3].t0-=200e3"); step(pg, 1.1); pg.wait_for_timeout(300)
    shot(pg, 'phone_garden_world')
    r = pg.evaluate("LD.plotState(0)")
    check(r.get('ready'), 'chín sau 2 phút (tắt máy vẫn lớn)')
    pg.evaluate("LD.open('vuon')"); pg.wait_for_timeout(400); shot(pg, 'phone_vuon')
    c0 = pg.evaluate("LD.data().h.ct||0")
    tap(pg, '#ldHarvAll'); pg.wait_for_timeout(300)
    check(pg.evaluate("LD.data().h.ct||0") >= c0 + 6, 'thu hoạch tất cả (2 ô Cam Thảo)')
    check(pg.evaluate("LD.plotState(0).empty===1"), 'ô trống lại sau thu hoạch')
    tap(pg, '[data-plot="0"]'); tap(pg, '[data-seed="nc"]'); pg.wait_for_timeout(200)
    check(pg.evaluate("LD.plotState(0).h===1"), 'chọn ô và gieo bằng giao diện')
    o, info = ovf(pg); check(o, 'không tràn ngang (Vườn)', json.dumps(info))

    print('[đan lô]')
    pg.evaluate("LD.give('ct',20);LD.give('nc',20);LD.give('hto',5);LD.give('tt',5);LD.give('ldd',3);G.save.gold=99999")
    pg.evaluate("LD.open('dan')"); pg.wait_for_timeout(400)
    pg.evaluate("Math.__r=Math.random;Math.random=()=>0.01")  # Thượng phẩm
    tap(pg, '[data-brew="tk"]'); pg.wait_for_timeout(1300); shot(pg, 'phone_brewing')
    pg.wait_for_timeout(1500); shot(pg, 'phone_brew_done')
    pg.evaluate("Math.random=Math.__r")
    r = pg.evaluate("({tk:LD.pill('tk'),ldd:LD.data().m.ldd,brew:LD.data().st.brew})")
    check(r['tk'][2] == 1 and r['ldd'] == 3, 'luyện Tụ Khí Đan: trừ dược liệu, ra Thượng phẩm', json.dumps(r))
    q = pg.evaluate("[0,0,0].map((_,i)=>{const r=LD.brew('holuc',{q:i});return r.q})")
    check(q == [0, 1, 2], 'ba phẩm chất Hạ/Trung/Thượng')
    atk0 = pg.evaluate("G.p.atk")
    pg.evaluate("LD.open('dan')"); pg.wait_for_timeout(300)
    tap(pg, '[data-use="holuc"]'); pg.wait_for_timeout(300)
    atk1 = pg.evaluate("G.p.atk")
    check(atk1 >= round(atk0 * 1.17), 'uống Hổ Lực Đan (Thượng) +18% công', f'{atk0}->{atk1}')
    hp0 = pg.evaluate("G.save.potHP"); pg.evaluate("LD.brew('hh',{q:1})")
    check(pg.evaluate("G.save.potHP") == hp0 + 5, 'Hoạt Huyết Tán Trung phẩm: +5 Bình Kim Sang')
    pg.evaluate("UI.close()"); step(pg, 1.2); pg.wait_for_timeout(200)
    check(pg.evaluate("!!document.querySelector('#ldBuf div')"), 'biểu tượng đan tăng lực trên HUD')
    shot(pg, 'phone_hud_buff')
    step(pg, 1); pg.evaluate("LD.data().buf.atk.t=0.5"); step(pg, 1.2)
    check(pg.evaluate("G.p.atk") < atk1, 'hết 30 phút thì mất hiệu lực')

    print('[đột phá thành công / thất bại]')
    pg.evaluate("G.save.lvl=10;G.save.cq=500;recalc();LD.data().fb=0")
    check(pg.evaluate("PROG.canBreak()") is True, 'có đan: canBreak true')
    o0 = pg.evaluate("LD.odds(1,0).tot"); check(o0 == 80, 'Thượng phẩm: 70% +10%', str(o0))
    # thất bại
    pg.evaluate("LD.give('tk',1)")
    r = pg.evaluate("LD.attempt({instant:true,force:false})")
    st = pg.evaluate("({realm:realmIdx(),cq:G.save.cq,fb:LD.data().fb,n:LD.pillN('tk')})")
    check(not r['ok'] and st['realm'] == 0 and st['cq'] == 500 - 30 and st['fb'] == 1 and st['n'] == 1, 'thất bại: mất đan, −25% Chân Khí, +10% lần sau', json.dumps([r, st]))
    check(pg.evaluate("LD.give('tk',1),LD.odds(1,0).tot") == 80, 'lần sau: Hạ phẩm 70% + kinh nghiệm thất bại 10% = 80%')
    # thất bại có cảnh diễn
    pg.evaluate("LD.open('dot')"); pg.wait_for_timeout(300); shot(pg, 'phone_dot')
    o, info = ovf(pg); check(o, 'không tràn ngang (Đột phá)', json.dumps(info))
    pg.evaluate("Math.__r=Math.random;Math.random=()=>0.995"); pg.evaluate("LD.open('dot')"); pg.wait_for_timeout(200)
    tap(pg, '#ldGo'); pg.evaluate("Math.random=Math.__r"); pg.wait_for_function("(LD.LS.cine&&LD.LS.cine.t>1.3)||LD.data().st.fail>=2", polling=100, timeout=60000); shot(pg, 'phone_cine')
    pg.wait_for_function("(LD.LS.cine&&LD.LS.cine.fail)||!LD.LS.cine", polling=100, timeout=60000); shot(pg, 'phone_fail')
    check(pg.evaluate("!document.getElementById('ldOv').hidden&&realmIdx()===0&&LD.data().fb===2"), 'cảnh đột phá thất bại + bảng Khí Nghịch')
    pg.wait_for_function("!LD.LS.cine", polling=100, timeout=60000)
    pg.wait_for_timeout(1500); pg.evaluate("document.getElementById('ldOv').hidden=true")
    # thành công với 1 Hộ Mệnh Phù qua giao diện (100%)
    pg.evaluate("LD.give('hmp',2);LD.open('dot')"); pg.wait_for_timeout(200)
    check(pg.evaluate("LD.odds(1,0).tot") >= 90, 'kinh nghiệm thất bại cộng dồn')
    tap(pg, '#ldTp'); pg.wait_for_timeout(150)
    check('100%' in pg.evaluate("document.querySelector('.ldOdds').textContent"), 'thêm bùa: 100%')
    tap(pg, '#ldGo'); pg.wait_for_function("!LD.LS.cine", polling=100, timeout=60000); pg.wait_for_timeout(300); shot(pg, 'phone_success')
    st = pg.evaluate("({realm:realmIdx(),fb:LD.data().fb,hmp:LD.data().m.hmp,ok:LD.data().st.ok,paused:G.paused})")
    check(st['realm'] == 1 and st['fb'] == 0 and st['hmp'] == 1 and not st['paused'], 'đột phá Sơ Nhập thành công, đốt 1 bùa', json.dumps(st))
    pg.evaluate("document.getElementById('rgOv')&&(document.getElementById('rgOv').hidden=true)")

    print('[Linh Thú canh cây quý]')
    pg.evaluate("G.save.unlocked=Math.max(G.save.unlocked,3);travel(2,false)"); pg.wait_for_timeout(300); quiet(pg)
    for _ in range(3):
        if pg.evaluate("document.getElementById('story')&&!document.getElementById('story').hidden"): pg.click('#stGo'); pg.wait_for_timeout(200)
    r = pg.evaluate("(()=>{const n=LD.nodes().find(n=>n.g);G.enemies.length=0;G.p.x=n.x+380;G.p.y=n.y;G.cam.x=G.p.x;G.cam.y=G.p.y;return n.i})()")
    step(pg, 0.6)
    g = pg.evaluate(f"(()=>{{const e=LD.LS.gd[{r}];return e?{{n:e.name,el:e.elite}}:null}})()")
    check(g and g['el'], 'Linh Thú xuất hiện khi lại gần cây quý', json.dumps(g, ensure_ascii=False))
    pg.evaluate(f"(()=>{{const e=LD.LS.gd[{r}];G.p.x=e.x-60;G.p.y=e.y;G.cam.x=G.p.x;G.cam.y=G.p.y}})()"); pg.wait_for_timeout(400); shot(pg, 'phone_guardian')
    d0 = pg.evaluate("LD.data().m.ldd")
    pg.evaluate(f"(()=>{{const e=LD.LS.gd[{r}];G.p.ifr=99;hurtEnemy(e,e.hp*50,{{}})}})()"); step(pg, 0.3)
    check(pg.evaluate("LD.data().m.ldd") > d0, 'hạ Linh Thú: rơi Linh Đan Dẫn')
    pg.evaluate(f"(()=>{{const n=LD.nodes()[{r}];G.p.x=n.x+6;G.p.y=n.y;G.enemies.length=0}})()"); step(pg, 1)
    check(not pg.evaluate(f"LD.nodeReady(LD.nodes()[{r}])"), 'hái cây quý sau khi hạ Linh Thú')

    print('[cảnh Thiên Kiếp ở Cảnh Giới cao]')
    pg.evaluate("(()=>{G.save.prog.realm=6;G.save.lvl=100;G.save.cq=20000;recalc();LD.give('kt',1);G.enemies.length=0})()")
    pg.evaluate("LD.attempt({talis:0})"); pg.wait_for_function("LD.LS.cine&&LD.LS.cine.bolt", polling=50, timeout=60000); pg.evaluate("(()=>{const c=LD.LS.cine;if(c){c.bolt=c.bolt||{t:99,seed:7};c.bolt.t=99}G.flash=null})()")
    pg.wait_for_timeout(600); shot(pg, 'phone_thienkiep'); pg.evaluate("LD.LS.cine&&LD.LS.cine.bolt&&(LD.LS.cine.bolt.t=0)")
    pg.wait_for_function("!LD.LS.cine", polling=100, timeout=60000)
    pg.evaluate("['rgOv','ldOv'].forEach(i=>{const e=document.getElementById(i);if(e)e.hidden=true})")
    check(pg.evaluate("!LD.LS.cine&&!G.paused"), 'cảnh Thiên Kiếp kết thúc, game chạy lại')
    for sec in ['dan', 'kho']:
        pg.evaluate(f"LD.open('{sec}')"); pg.wait_for_timeout(350); shot(pg, 'phone_' + sec)
        o, info = ovf(pg); check(o, f'không tràn ngang ({sec})', json.dumps(info))
    pg.evaluate("UI.close()")
    e1 = [e for e in errs if 'GPU' not in e[1] and 'WebGL' not in e[1]]
    check(not e1, 'không lỗi JS (phone)', str(e1[:5]))
    b.close()

    # ================= BẢN LƯU CŨ ở Cảnh Giới 5, chưa có G.save.ld =================
    print('[bản lưu cũ Cảnh Giới 5]')
    b, ctx, pg, errs = open_page(p, DESK, init=CLOCK)
    new_game(pg, 'cung')
    pg.evaluate("(()=>{const S=G.save;S.lvl=62;S.cq=9999;S.prog.realm=5;delete S.ld;S.unlocked=6;saveGame()})()")
    pg.reload(); pg.wait_for_timeout(1200); pg.click('#tCont'); pg.wait_for_timeout(500)
    if pg.evaluate("!document.getElementById('story').hidden"): pg.click('#stGo')
    quiet(pg); step(pg, 1.5)
    r = pg.evaluate("({realm:realmIdx(),cq:G.save.cq,ld:!!G.save.ld,gift:G.save.ld&&G.save.ld.gift,can:PROG.canBreak(),need:LD.reqs().P.n})")
    check(r['realm'] == 5 and r['cq'] == 9999 and r['ld'] and r['gift'] == 2, 'giữ Cảnh Giới 5 và Chân Khí, tạo G.save.ld lười, không tặng quà', json.dumps(r, ensure_ascii=False))
    check(r['can'] is False and r['need'] == 'Phá Cảnh Đan', 'Cảnh Giới 6 cần Phá Cảnh Đan')
    check(pg.evaluate("LD.plotState(4).lock===undefined&&LD.plotState(5).lock===undefined"), 'Cảnh Giới 5: mở đủ 6 luống')
    pg.evaluate("LD.open('dot')"); pg.wait_for_timeout(400); shot(pg, 'desk_dot')
    pg.evaluate("LD.open('dan')"); pg.wait_for_timeout(400); shot(pg, 'desk_dan')
    pg.evaluate("UI.close();(()=>{const o=G.W.ldLo;G.p.x=o.x-30;G.p.y=o.y+60;G.cam.x=G.p.x;G.cam.y=G.p.y-40})()"); step(pg, 0.3); pg.wait_for_timeout(500); shot(pg, 'desk_furnace')
    check('Đan Lô' in pg.evaluate("document.getElementById('npcBtn').textContent"), 'đi tới Đan Lô hiện nút')
    e1 = [e for e in errs if 'GPU' not in e[1] and 'WebGL' not in e[1]]
    check(not e1, 'không lỗi JS (desktop)', str(e1[:5]))
    b.close()

    # ================= LANDSCAPE + SE: bố cục =================
    for nm, opts in [('land', LAND), ('se', SE)]:
        b, ctx, pg, errs = open_page(p, opts, init=CLOCK)
        new_game(pg, 'phap'); quiet(pg)
        pg.evaluate("G.save.lvl=12;G.save.cq=300;recalc();LD.give('tk',1);LD.brew('ngodao',{q:2,free:1});LD.usePill('ngodao');LD.brew('holuc',{q:0,free:1});LD.usePill('holuc');LD.plant(0,'ct');LD.plant(1,'nc')")
        step(pg, 1.2); pg.wait_for_timeout(300); shot(pg, nm + '_hud')
        for sec in ['dot', 'vuon']:
            pg.evaluate(f"LD.open('{sec}')"); pg.wait_for_timeout(400); shot(pg, f'{nm}_{sec}')
            o, info = ovf(pg); check(o, f'{nm}: không tràn ngang ({sec})', json.dumps(info))
            small = pg.evaluate("[...document.querySelectorAll('#shBody button')].filter(b=>b.offsetParent&&(b.getBoundingClientRect().height<40)).map(b=>b.textContent.trim().slice(0,20))")
            check(not small, f'{nm}: nút ≥ 40px ({sec})', str(small[:4]))
        e1 = [e for e in errs if 'GPU' not in e[1] and 'WebGL' not in e[1]]
        check(not e1, f'không lỗi JS ({nm})', str(e1[:5]))
        b.close()

print(f'\n{ok_n} ok, {len(bad)} fail', bad)
sys.exit(1 if bad else 0)

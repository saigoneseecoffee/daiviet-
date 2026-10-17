# Kiểm thử mô-đun Hoạt động (daily.js): python3 daily_test.py [phone|se|land|desk]
import sys, json
from harness import *
mode = sys.argv[1] if len(sys.argv) > 1 else 'phone'
OPTS = {'phone': PHONE, 'se': SE, 'land': LAND, 'desk': DESK}[mode]
touch = mode != 'desk'
R = []
def ok(n, c, x=''):
    R.append(bool(c)); print(('PASS ' if c else 'FAIL ') + n, x, flush=True)
DAY = 86400000
with sync_playwright() as p:
    b, ctx, pg, errs = open_page(p, OPTS)
    ev = pg.evaluate
    W, H = OPTS['viewport']['width'], OPTS['viewport']['height']
    shot = lambda n: pg.screenshot(path=f'shots/daily_{mode}_{n}.png')
    def tap(sel):
        el = pg.locator(sel).first; el.scroll_into_view_if_needed(timeout=8000); bb = el.bounding_box()
        x, y = bb['x'] + bb['width'] / 2, bb['y'] + bb['height'] / 2
        if touch: pg.touchscreen.tap(x, y)
        else: pg.mouse.click(x, y)
        pg.wait_for_timeout(250)
    def perks(): ev("(()=>{let n=0;while(window.PERKS&&(PERKS.offerPending()||PERKS.showing())&&n++<60)PERKS.pickAuto()})()")
    _tap=tap
    def tap(sel):
        perks()
        try: _tap(sel)
        except Exception:
            pg.screenshot(path=f'shots/daily_{mode}_FAIL.png'); print('TAPFAIL',sel,ev("[G.state,G.paused,UI.panel,document.getElementById('hud').hidden,[...document.querySelectorAll('section.screen')].filter(e=>!e.hidden).map(e=>e.id)]")); raise
    def box(sel): return pg.locator(sel).first.bounding_box()
    def inter(a, b): return not (a['x'] + a['width'] <= b['x'] or b['x'] + b['width'] <= a['x'] or a['y'] + a['height'] <= b['y'] or b['y'] + b['height'] <= a['y'])
    pg.click('#tNew'); pg.click('[data-c="kiem"]'); pg.fill('#heroName', 'Bảo Thử'); pg.click('#goBtn'); pg.wait_for_timeout(600); pg.click('#stGo'); pg.wait_for_timeout(500)
    ev("G.save.lvl=12;G.save.tut={move:true,atk:true,skill:true,equip:true,forge:true,mount:true};recalc();document.getElementById('offer').hidden=true")
    # ---- nút HUD ----
    bd = box('#bDaily'); ok('nút Hoạt động hiện', bd and bd['width'] >= 44 and bd['height'] >= 44, str(bd))
    over = [s for s in ['#miniWrap', '#plate', '#qt', '#act', '#s2', '#s1', '#bAuto', '#bAtk'] + [f'[data-p="{k}"]' for k in ['bag', 'forge', 'shop', 'skill', 'mount', 'gear']] if box(s) and inter(bd, box(s))]
    ok('nút không đè HUD khác', not over, str(over))
    gear = box('[data-p="gear"]'); s2 = box('#s2')
    ok('cột nút phải không đè cụm kỹ năng', not inter(gear, s2), f'gear {gear} s2 {s2}')
    ok('huy hiệu báo điểm danh', pg.is_visible('#bDaily .dot'), pg.inner_text('#bDaily .dot') if pg.is_visible('#bDaily .dot') else '')
    shot('hud')
    # ---- mở bảng ----
    tap('#bDaily'); ok('mở bảng Hoạt động', pg.inner_text('#shTitle') == 'Hoạt động' and ev('G.paused'))
    ok('6 thẻ', pg.locator('#shTabs .tab').count() == 6)
    tabs_ok = all(box(f'#shTabs [data-t="{t}"]')['height'] >= 44 for t in ['day', 'login', 'ach', 'ev', 'off', 'bak'])
    ok('thẻ cao >= 44px', tabs_ok)
    tap('#shClose')
    if not touch:
        pg.keyboard.press('KeyN'); pg.wait_for_timeout(200); ok('phím N mở Hoạt động', pg.inner_text('#shTitle') == 'Hoạt động' and pg.is_visible('#panel'))
        pg.keyboard.press('KeyN'); pg.wait_for_timeout(200); ok('phím N đóng', not pg.is_visible('#panel'))
    # ---- nhiệm vụ ngày: chơi thật bằng tự đánh ----
    q = ev("DAILY.state().q.map(q=>q.k)"); ok('5 nhiệm vụ ngày', len(q) == 5 and q[0] == 'kill', str(q))
    ok('nhiệm vụ tuần 5', ev("DAILY.state().wq.length") == 5, str(ev("DAILY.state().wq.map(q=>q.k+':'+q.n)")))
    ev("const q=DAILY.state().q[0];q.n=6;G.p.x=G.W.out.x;G.p.y=G.W.out.y;G.save.set.auto=true")
    for i in range(40):
        pg.wait_for_timeout(500)
        if ev("DAILY.state().q[0].p>=6"): break
    ok('tự đánh hoàn thành nhiệm vụ Hạ quái', ev("DAILY.state().q[0].p>=6"), str(ev("DAILY.state().q[0].p")))
    ev("G.save.set.auto=false")
    # các loại còn lại qua sự kiện thật của game
    ev("""(()=>{const S=G.save;const it=genItem(5,1,'vk');S.equip.vk=it;S.ore=999;S.gold=1e6;for(let i=0;i<3;i++)doForge(it,false);
      for(let i=0;i<60;i++){G.p.mp=G.p.maxmp;G.p.skCd=[0,0,0];castSkill(0)}
      sideEvent('gold',50000);for(let i=0;i<5;i++)sideEvent('loot',1);for(let i=0;i<3;i++){S.side.p=S.side.n-1;sideEvent(S.side.t,S.side.t==='gold'?S.side.n:1)}
      for(let i=0;i<3;i++){const e=spawnEnemy('soi',G.p.x+40,G.p.y,5,true);hurtEnemy(e,1e9,{})}
      dropChest(G.p.x,G.p.y,0.7,'Phá ổ quái');dropChest(G.p.x,G.p.y,0.7,'Phá ổ quái');dropChest(G.p.x,G.p.y,1,'Đẩy lùi quái triều');
      openChest({x:G.p.x,y:G.p.y,val:{bonus:1}});openChest({x:G.p.x,y:G.p.y,val:{bonus:1}});
      G.combo=60;bump=DAILY.bump;bump('combo',60,1);
      const st=MAPS[S.map].quest[S.qs[S.map]];if(st&&st.t!=='boss')completeStep();})()""")
    st = ev("DAILY.state().q.map(q=>q.k+':'+q.p+'/'+q.n)"); ok('mọi nhiệm vụ ngày hoàn thành', ev("DAILY.state().q.every(q=>q.p>=q.n)"), str(st))
    tap('#bDaily'); shot('day_done')
    g0 = ev('G.save.gold'); cq0 = ev('G.save.cq||0')
    n = 0
    while pg.locator('[data-dq]').count() and n < 6: tap('[data-dq]'); n += 1
    ok('nhận 5 thưởng ngày', n == 5 and ev("DAILY.state().ap") == 100, f'n={n} ap={ev("DAILY.state().ap")}')
    ok('thưởng cộng vàng và Chân Khí', ev('G.save.gold') > g0 and ev('G.save.cq') > cq0)
    b0 = ev('G.save.bag.length')
    for i in range(3): tap(f'[data-ch="{i}"]')
    ok('mở 3 rương năng động', ev("DAILY.state().chest.join()") == '1,1,1' and ev('G.save.bag.length') > b0)
    shot('day_claimed')
    tap('#shClose')
    # ---- đổi ngày ----
    k0 = ev("DAILY.state().day"); ev(f"DAILY.dev.shift({DAY})"); pg.wait_for_timeout(300)
    ok('sang ngày mới làm mới nhiệm vụ', ev("DAILY.state().day") != k0 and ev("DAILY.state().ap") == 0 and ev("DAILY.state().q.every(q=>q.p===0&&!q.c)"), f'{k0}->{ev("DAILY.state().day")}')
    # bỏ sót: hoàn thành rồi qua ngày -> tự gửi thưởng
    ev("DAILY.state().q[0].p=DAILY.state().q[0].n"); g1 = ev('G.save.gold'); ev(f"DAILY.dev.shift({DAY})")
    ok('thưởng còn sót tự gửi khi qua ngày', ev('G.save.gold') > g1)
    # tuần
    ev("DAILY.state().wq.forEach(q=>q.p=q.n)"); tap('#bDaily')
    nw = 0
    while pg.locator('[data-wq]').count() and nw < 6: tap('[data-wq]'); nw += 1
    c0 = ev('G.save.charm'); tap('#dlWc'); ok('nhận 5 nhiệm vụ tuần và rương tuần', nw == 5 and ev("DAILY.state().wc") == 1 and ev('G.save.charm') >= c0 + 3)
    tap('#shClose')
    # ---- điểm danh 7 ngày + bỏ lỡ ----
    tap('#bDaily'); tap('#shTabs [data-t="login"]'); shot('login')
    tq0 = ev('G.save.tq||0'); tap('#dlIn'); ok('điểm danh ngày 1', ev("DAILY.state().login.streak") == 1 and ev("DAILY.state().login.book") == 1)
    ok('không điểm danh 2 lần trong ngày', pg.locator('#dlIn').count() == 0 and ev("DAILY.checkIn()") is None)
    tap('#shClose')
    for d in range(2, 8):
        ev(f"DAILY.dev.shift({DAY})"); r = ev("DAILY.checkIn()")
    ok('chuỗi đủ 7 ngày', ev("DAILY.state().login.streak") == 7, str(r))
    ok('ngày 7 tặng Tàn Quyển và Bùa', ev('G.save.tq') >= tq0 + 4)
    ev(f"DAILY.dev.shift({DAY})"); ev("DAILY.checkIn()"); ok('sau ngày 7 quay vòng về ngày 1', ev("DAILY.state().login.streak") == 1)
    ev(f"DAILY.dev.shift({DAY})"); ev("DAILY.checkIn()")
    ev(f"DAILY.dev.shift({2*DAY})"); r = ev("DAILY.checkIn()")
    ok('bỏ lỡ 1 ngày: chuỗi về ngày 1, sổ 30 ngày giữ nguyên', r['day'] == 1 and ev("DAILY.state().login.book") == 10, json.dumps(r, ensure_ascii=False))
    ev(f"DAILY.dev.shift({DAY})")
    tap('#bDaily'); tap('#shTabs [data-t="login"]'); shot('login_streak'); tap('#shClose')
    # ---- thành tựu & danh hiệu ----
    atk0 = ev('G.p.atk')
    ev("G.save.kills=1200;DAILY.checkAch()"); pg.wait_for_timeout(500)
    ok('mở thành tựu Bách Chiến', ev("DAILY.state().ach.k1k") == 1 and ev("DAILY.state().ach.k100") == 1)
    vis=False
    for i in range(30):
        if pg.is_visible('#dlyPop'): vis=True; break
        pg.wait_for_timeout(200)
    ok('popup thành tựu', vis); shot('ach_popup')
    ok('danh hiệu tự đeo, hiện trên HUD', pg.is_visible('#pTitle') and len(pg.inner_text('#pTitle'))>3, pg.inner_text('#pTitle'))
    ok('danh hiệu cộng công', ev('G.p.atk') > atk0, f'{atk0}->{ev("G.p.atk")}')
    ev("G.save.lvl=31;G.save.kills=10500;DAILY.checkAch()"); pg.wait_for_timeout(300)
    tap('#bDaily'); tap('#shTabs [data-t="ach"]'); shot('ach')
    tap('[data-title="k10k"]'); ok('đeo danh hiệu Vạn Nhân Địch', ev("DAILY.state().title") == 'k10k' and 'Vạn Nhân Địch' in pg.inner_text('#pTitle'))
    ch0 = ev('G.save.charm'); tap('#dlAchAll'); ok('nhận tất cả thưởng thành tựu', ev("Object.values(DAILY.state().ach).every(v=>v===2)") and ev('G.save.charm') > ch0)
    tap('#shClose'); pg.wait_for_timeout(300); shot('title_world')
    # ---- lễ hội ----
    ev("DAILY.dev.forceEvent('tet');G.p.x=G.W.camp.x+20;G.p.y=G.W.camp.y-120;G.enemies=[]"); pg.wait_for_timeout(700); shot('event_tet_town')
    ev("G.p.x=11*T;G.p.y=47.5*T"); pg.wait_for_timeout(500); shot('event_tet_town2')
    for e_ in ['trungthu', 'giogo', 'quockhanh']:
        ev(f"DAILY.dev.forceEvent('{e_}')"); pg.wait_for_timeout(400); shot(f'event_{e_}_town')
    ev("DAILY.dev.forceEvent('tet');G.p.x=G.W.out.x;G.p.y=G.W.out.y;G.p.ifr=999;G.enemies=[]")
    ev("for(let i=0;i<45;i++){const e=spawnEnemy('soi',G.p.x+30,G.p.y,5,true);hurtEnemy(e,1e9,{})}"); pg.wait_for_timeout(1000); shot('event_drops'); pg.wait_for_timeout(2000)
    tok = ev("(DAILY.state().ev[DAILY.activeEvent().key]||{tok:0}).tok"); ok('nhặt Bánh Chưng', tok >= 40, str(tok))
    tap('#bDaily'); tap('#shTabs [data-t="ev"]'); shot('event_tab')
    tq1 = ev('G.save.tq'); tap('[data-evb="tq"]'); ok('đổi Tàn Quyển bằng Bánh Chưng', ev('G.save.tq') == tq1 + 2)
    ev("DAILY.state().ev[DAILY.activeEvent().key].tok+=200;UI.render()"); tap('[data-evb="title"]')
    ok('đổi danh hiệu lễ hội', ev("DAILY.titles().some(t=>t.id==='ev_tet')"))
    tap('#shClose'); ev("DAILY.dev.forceEvent(null)")
    ok('lịch lễ hội có sắp tới', len(ev("DAILY.upcoming(4)")) == 4)
    # ---- bế quan ----
    g2 = ev('G.save.gold'); e2 = ev('G.save.exp+G.save.lvl*1e9')
    ev(f"DAILY.dev.away({5*3600000})"); pg.wait_for_timeout(500)
    ok('thẻ Xuất quan sau 5 giờ', pg.is_visible('#dlyOff') and ev('G.paused'))
    pd = ev("DAILY.state().pend"); ok('thưởng tính đủ 5 giờ', abs(pd['ms'] - 5 * 3600000) < 5000, str(pd))
    shot('offline')
    tap('#dlyOffGo'); ok('nhận thưởng bế quan', ev('G.save.gold') > g2 and ev('G.save.exp+G.save.lvl*1e9') > e2 and not pg.is_visible('#dlyOff') and not ev('G.paused'))
    ev(f"DAILY.dev.away({30*3600000})"); ok('trần 12 giờ', ev("DAILY.state().pend.ms") == 12 * 3600000); ev("document.getElementById('dlyOffGo').click()")
    ev("DAILY.state().seen=DAILY.dev.now()+3600000*5;DAILY.state().pend=null"); ev("DAILY.dev.shift(0)")
    ev("document.dispatchEvent(new Event('visibilitychange'))"); pg.wait_for_timeout(200)
    ok('lùi đồng hồ không tạo thưởng', ev("!DAILY.state().pend") and not pg.is_visible('#dlyOff'), str(ev("[DAILY.state().pend,DAILY.state().seen-Date.now()]"))+str(pg.is_visible('#dlyOff')))
    ev("DAILY.state().seen=DAILY.dev.now()")
    tap('#bDaily'); tap('#shTabs [data-t="off"]'); shot('off'); tap('#shClose')
    # ---- sao lưu ----
    ev("G.save.gold=123456;G.save.bag.push(genItem(20,3));saveGame()")
    tap('#bDaily'); tap('#shTabs [data-t="bak"]'); pg.wait_for_timeout(500); shot('bak')
    before = ev("JSON.stringify(G.save)")  # bảng đang mở: game dừng, đúng trạng thái của mã
    code = ev("document.getElementById('dlExp').value"); ok('tạo mã sao lưu', code.startswith('DVHK1.z.'), code[:30] + '... len ' + str(len(code)))
    fj = ev("DAILY.fileJson()"); ok('tệp .json có mã kiểm tra', json.loads(fj)['sum'] == ev(f"DAILY.crc32(JSON.stringify(JSON.parse({json.dumps(fj)}).save))"))
    bad = code[:-12] + ('A' if code[-12] != 'A' else 'B') + code[-11:]
    pg.fill('#dlImp', bad); tap('#dlImpGo'); pg.wait_for_timeout(300)
    ok('từ chối mã bị sửa', 'kiểm tra' in pg.inner_text('#dlImpMsg') or 'hỏng' in pg.inner_text('#dlImpMsg'), pg.inner_text('#dlImpMsg'))
    pg.fill('#dlImp', 'xin chào'); tap('#dlImpGo'); pg.wait_for_timeout(200); ok('từ chối mã sai định dạng', 'định dạng' in pg.inner_text('#dlImpMsg'))
    tap('#shClose')
    # xóa sạch rồi khôi phục
    ev("localStorage.clear();G.save.gold=0;G.save.bag=[];G.save.lvl=1")
    tap('#bDaily'); tap('#shTabs [data-t="bak"]'); pg.wait_for_timeout(300)
    pg.fill('#dlImp', code); tap('#dlImpGo'); pg.wait_for_timeout(400)
    ok('hỏi xác nhận khôi phục', pg.is_visible('#confirm'), pg.inner_text('#cfMsg')); shot('import_confirm')
    tap('#cfYes'); pg.wait_for_timeout(800)
    after = ev("JSON.stringify(G.save)")
    def norm(s):
        o = json.loads(s); [o['daily'].pop(k, None) for k in ('seen','pend','lastOff')]; o['daily']['cnt'].pop('play', None); return o
    a, bb_ = norm(before), norm(after)
    diff = [k for k in set(a) | set(bb_) if a.get(k) != bb_.get(k)]
    ok('khôi phục đúng dữ liệu', not diff, str(diff)+str([k for k in set(a['daily'])|set(bb_['daily']) if a['daily'].get(k)!=bb_['daily'].get(k)])); ok('khôi phục vào game', ev("G.state==='play'&&G.save.gold===123456"))
    ok('đã ghi localStorage', ev("JSON.parse(localStorage.getItem('dvhk_save_v1')).gold") == 123456)
    # khôi phục từ tệp
    tap('#bDaily'); tap('#shTabs [data-t="bak"]')
    pg.set_input_files('#dlFile', files=[{'name': 'bak.json', 'mimeType': 'application/json', 'buffer': fj.encode()}]); pg.wait_for_timeout(500)
    ok('khôi phục từ tệp .json', pg.is_visible('#confirm')); tap('#cfNo')
    # ---- save cũ không có daily ----
    ev("delete G.save.daily;saveGame()"); tap('#shClose') if pg.is_visible('#panel') else None
    ev("UI.open('gear')"); tap('#gTitle'); pg.wait_for_timeout(1500); tap('#tCont'); pg.wait_for_timeout(1500)
    ok('save cũ vào được, tạo daily', ev("G.state==='play'&&!!G.save.daily&&DAILY.state().q.length===5") and not pg.is_visible('#dlyOff'))
    # ---- ảnh mọi thẻ ----
    ev("G.save.lvl=40;G.save.kills=1500;DAILY.checkAch();DAILY.dev.forceEvent('trungthu');DAILY.state().ev[DAILY.activeEvent().key]||0")
    tap('#bDaily')
    for t in ['day', 'login', 'ach', 'ev', 'off', 'bak']:
        tap(f'#shTabs [data-t="{t}"]'); pg.wait_for_timeout(300); shot('tab_' + t)
        ok(f'thẻ {t} không tràn ngang', ev("document.getElementById('shBody').scrollWidth<=document.getElementById('shBody').clientWidth+1") and overflow(pg)['sw'] <= W)
    tap('#shClose')
    perf = ev("""(()=>{const t0=performance.now();for(let i=0;i<200;i++){HK.ev('drawWorld',G.cam.x-400,G.cam.y-400,800,800)}return (performance.now()-t0)/200})()""")
    ok('vẽ trang trí lễ hội nhẹ (<1.5ms/khung)', perf < 1.5, f'{perf:.3f}ms')
    ok('không tràn ngang', overflow(pg)['sw'] <= W)
    print('ERRORS', errs)
    print('SUMMARY', sum(R), '/', len(R))
    b.close()

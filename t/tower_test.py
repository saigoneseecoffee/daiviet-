"""Bài thử Vượt Tháp. python3 tower_test.py <phone|desk|se|land> [full|layout]
   full (mặc định cho phone/desk): vào qua NPC, tự đánh tầng 1–12, chết một lần, ra tháp, kiểm tra thế giới/nhiệm vụ chương được trả lại,
   quét tháp một lần mỗi ngày (giả dayKey), thưởng, lưu/đọc lại, lưu cũ không có trường tower, đi chương khác khi đang trong tháp.
   layout: chỉ kiểm tra bố cục và chụp màn (bảng, tầng thường, biến thể, boss, thắng, thua)."""
import sys, json
from tower_lib import *
mode = sys.argv[1] if len(sys.argv) > 1 else 'desk'
kind = sys.argv[2] if len(sys.argv) > 2 else ('full' if mode in ('phone', 'desk') else 'layout')
OPTS = {'phone': PHONE, 'se': SE, 'land': LAND, 'desk': DESK}[mode]
touch = mode != 'desk'
R = []
def ok(name, cond, extra=''):
    R.append((name, bool(cond))); print(('PASS ' if cond else 'FAIL ') + name, extra, flush=True)
RUN = '''([secs,stopOn])=>{const dt=1/60;for(let i=0;i<secs*60;i++){
   if(G.state==='dead'){while(G.state==='dead')update(dt);return 'dead'}
   if(!VT.on)return 'off';if(stopOn==='done'&&VT.ph==='done')return 'done';if(stopOn==='fight'&&VT.ph==='fight'&&VT.t>2)return 'fight';
   G.paused=false;if(G.hitstop>0)G.hitstop-=dt;else update(dt*G.slow)}return 'time'}'''
with sync_playwright() as p:
    b, ctx, pg, errs = open_page(p, OPTS)
    ev = pg.evaluate
    W_, H_ = OPTS['viewport']['width'], OPTS['viewport']['height']
    shot = lambda n: pg.screenshot(path=f'shots/tower_{mode}_{n}.png')
    def tap(sel):
        el = pg.locator(sel).first; el.scroll_into_view_if_needed(timeout=3000); bb = el.bounding_box()
        x, y = bb['x'] + bb['width'] / 2, bb['y'] + bb['height'] / 2
        if touch: pg.touchscreen.tap(x, y)
        else: pg.mouse.click(x, y)
        pg.wait_for_timeout(300)
    def no_overflow(tag):
        o = overflow(pg); ok(f'không tràn ngang ({tag})', o['sw'] <= o['cw'] + 1 and o['bw'] <= o['cw'] + 1, str(o))
    def min_size(sel):
        return ev(f"(()=>{{const b=document.querySelector('{sel}');if(!b)return null;const r=b.getBoundingClientRect();return [Math.round(r.width),Math.round(r.height)]}})()")
    new_game(pg, 'giao' if mode in ('phone', 'se') else 'phap')
    # ---- khóa: cấp 1 chưa qua chương 1 ----
    goto_npc(pg)
    ok('NPC Tháp Chủ trước Bảo Tháp', ev("(()=>{const n=G.W.npcs.find(n=>n.act==='tower');return !!n&&n.name==='Tháp Chủ'&&Math.abs(n.x/T-9)<1&&Math.abs(n.y/T-61)<1})()"))
    ok('nút NPC hiện', pg.is_visible('#npcBtn'), pg.inner_text('#npcBtn') if pg.is_visible('#npcBtn') else '')
    tap('#npcBtn')
    ok('bảng Vượt Tháp mở', pg.is_visible('#panel') and pg.inner_text('#shTitle') == 'Vượt Tháp')
    ok('chưa mở khi cấp 1', pg.is_visible('.twlock') and not pg.is_visible('#twGo'))
    ok('VT.enter bị từ chối khi khóa', ev("VT.enter()") is False and not ev("VT.on"))
    shot('locked'); ev("UI.close()")
    # ---- mở khóa: nhân vật cấp 26 ----
    print('char', ev(MKCHAR, [26, 7, 2]))
    ev("G.save.kills=50;G.save.tut={move:true,atk:true,skill:true,equip:true,forge:true,mount:true}")
    before = ev("(()=>{window.__W0=G.W;const S=G.save;return{map:S.map,qs:S.qs.slice(),qp:S.qp,gold:S.gold,mi:G.W.mi,en:G.enemies.length,cq:S.cq||0,tq:S.tq||0,charm:S.charm,ore:S.ore,qt:document.getElementById('qt').innerText}})()")
    goto_npc(pg); before['px'] = ev("[Math.round(G.p.x),Math.round(G.p.y)]")
    tap('#npcBtn')
    ok('đã mở khi cấp 26', pg.is_visible('#twGo'))
    gs = min_size('#twGo'); sw = min_size('#twSw')
    ok('nút Leo tháp ≥44px', gs and gs[1] >= 44 and gs[0] >= 44, str(gs)); ok('nút Quét tháp ≥44px', sw and sw[1] >= 44, str(sw))
    ok('quét tháp khóa khi chưa vượt tầng', ev("document.getElementById('twSw').disabled"))
    txt = pg.inner_text('#shBody')
    ok('xem trước tầng 1 có thưởng, quái, giờ', 'Tầng 1' in txt and 'Chân Khí' in txt and '90 giây' in txt and 'Quái:' in txt)
    ok('bảng kỷ lục đủ 6 phái', ev("document.querySelectorAll('.twrec tbody tr').length") == 6)
    no_overflow('bảng'); shot('panel')
    ev("document.getElementById('shBody').scrollTop=9999"); pg.wait_for_timeout(150); shot('panel_bottom'); ev("document.getElementById('shBody').scrollTop=0")
    tap('#twGo'); pg.wait_for_timeout(500)
    ok('vào tháp', ev("VT.on&&G.W.tower===1&&!UI.panel"))
    ok('HUD đổi sang tầng', 'VƯỢT THÁP' in pg.inner_text('#qt'), pg.inner_text('#qt').replace('\n', ' | '))
    ok('băng rôn tầng hiện', pg.is_visible('#twBan'))
    no_overflow('tầng'); shot('floor1_intro')
    # tạm dừng: mở cài đặt -> giờ không chạy
    ev(RUN, [3, 'fight'])
    pg.keyboard.press('Escape') if not touch else ev("UI.open('gear')"); pg.wait_for_timeout(150); t0 = ev("VT.left"); pg.wait_for_timeout(900)
    ok('mở bảng khi trong tháp làm dừng giờ', ev("G.paused") and abs(ev("VT.left") - t0) < 0.05, f'{t0} -> {ev("VT.left")}')
    ev("UI.close()"); pg.wait_for_timeout(100)
    ok('bấm khung nhiệm vụ mở bảng tháp', (tap('#qt') or True) and pg.inner_text('#shTitle') == 'Vượt Tháp' and pg.is_visible('#twCont'))
    shot('panel_inside'); tap('#twCont')
    if kind == 'full':
        ev("G.save.set.auto=true")
        r = ev(CLIMB, [900, 12])
        for x in r['log']: print('   ', json.dumps(x, ensure_ascii=False))
        wins = [x['f'] for x in r['log'] if x['win']]
        ok('tự đánh vượt tầng 1–12', wins == list(range(1, 13)) and r['best'] == 12, f"best {r['best']} deaths {r['deaths']}")
        ok('thời gian mỗi tầng trong giới hạn', all(x['t'] <= (180 if x['f'] % 10 == 0 else 120 if x['f'] % 5 == 0 else 90) for x in r['log'] if x['win']),
           ' '.join(f"{x['f']}:{x['t']}s" for x in r['log'] if x['win']))
        exp = ev("(()=>{let cq=0,tq=0,charm=0;for(let n=1;n<=12;n++){const r=VT.rewardsFor(VT.plan(n));cq+=r.cq;tq+=r.tq;charm+=r.charm}return{cq,tq,charm}})()")
        got = ev("({cq:G.save.cq||0,tq:G.save.tq||0})")
        ok('Chân Khí đúng tổng thưởng lần đầu', got['cq'] - before['cq'] == exp['cq'], f"{got['cq']-before['cq']} vs {exp['cq']}")
        ok('Tàn Quyển đúng (1 mỗi 5 tầng, +1 tầng 10)', got['tq'] - before['tq'] == exp['tq'] == 3, f"{got['tq']-before['tq']} vs {exp['tq']}")
        ok('kỷ lục phái được ghi', ev("JSON.parse(localStorage.getItem('dvhk_tower_rec'))[G.save.cls].f") == 12)
        # bảng thắng (setTimeout thật)
        pg.wait_for_timeout(900)
        ok('bảng thắng hiện', pg.is_visible('#twRes') and 'Vượt Tầng 12' in pg.inner_text('#twRes'))
        nb = min_size('#twNext'); ok('nút Lên tầng ≥44px', nb and nb[1] >= 44, str(nb))
        no_overflow('bảng thắng'); shot('victory')
    else:
        ev("G.save.set.auto=true")
        r = ev(RUN, [120, 'done']); ok('vượt tầng 1', r == 'done' and ev("G.save.tower.best") == 1, r)
        pg.wait_for_timeout(900); ok('bảng thắng hiện', pg.is_visible('#twRes')); no_overflow('bảng thắng'); shot('victory')
        nb = min_size('#twNext'); ok('nút Lên tầng ≥44px', nb and nb[1] >= 44, str(nb))
    # ---- tầng biến thể, tầng boss (chụp màn) ----
    ev("document.getElementById('twRes').hidden=true;G.paused=false")
    mf = ev("(()=>{for(let n=13;n<200;n++){const P=VT.plan(n);if(P.mods.includes('suongmu')&&!P.boss)return n}return 0})()")
    hf = ev("(()=>{for(let n=13;n<200;n++){const P=VT.plan(n);if(P.mods.includes('hoanguc')&&!P.boss)return n}return 0})()")
    for n, tag in ((mf, 'mod_suongmu'), (hf, 'mod_hoanguc')):
        ev(f"VT.startFloor({n})"); ev(RUN, [6, 'none']); pg.wait_for_timeout(300)
        ok(f'tầng biến thể {n} chạy', ev("VT.on&&VT.ph==='fight'"), ev("VT.P.mods.join(',')")); shot(tag)
    ev("VT.startFloor(20)"); ev(RUN, [5, 'none']); pg.wait_for_timeout(300)
    ok('tầng 20 có boss ba giai đoạn', ev("!!(G.boss&&G.boss.b2&&G.boss.tw&&G.W.arena===G.W.floor)"), ev("G.boss&&G.boss.name"))
    no_overflow('boss'); shot('boss')
    # ---- chết có chủ ý ----
    g0 = ev("G.save.gold"); best0 = ev("G.save.tower.best")
    ev("G.p.ifr=0;G.p.hp=1;hurtPlayer(1e9,1,null)"); pg.wait_for_timeout(500)
    ok('màn trọng thương trong tháp', pg.is_visible('#dead') and 'Không mất vàng' in pg.inner_text('#deadMsg') and not pg.is_visible('#b2Dead'), pg.inner_text('#deadMsg'))
    shot('dead')
    pg.wait_for_timeout(2600)
    ok('thua tầng: ra tháp, mở bảng', not ev("VT.on") and pg.is_visible('#panel') and pg.inner_text('#shTitle') == 'Vượt Tháp')
    ok('bảng báo thua', pg.is_visible('.twlast.l'), pg.inner_text('.twlast.l') if pg.is_visible('.twlast.l') else '')
    shot('fail')
    after = ev("(()=>{const S=G.save;return{map:S.map,qs:S.qs.slice(),qp:S.qp,gold:S.gold,mi:G.W.mi,same:G.W===window.__W0,px:[Math.round(G.p.x),Math.round(G.p.y)],state:G.state,hp:G.p.hp===G.p.maxhp}})()")
    ok('không mất vàng khi chết', after['gold'] >= g0, f"{g0} -> {after['gold']}")
    ok('kỷ lục giữ nguyên', ev("G.save.tower.best") == best0)
    ok('thế giới chương trả lại nguyên vẹn', after['same'] and after['mi'] == before['mi'] and after['map'] == before['map'])
    ok('nhiệm vụ chương không đổi', after['qs'] == before['qs'] and after['qp'] == before['qp'], f"{before['qs']}/{before['qp']} -> {after['qs']}/{after['qp']}")
    ok('về đúng chỗ Tháp Chủ', abs(after['px'][0] - before['px'][0]) < 2 and abs(after['px'][1] - before['px'][1]) < 2 and after['state'] == 'play')
    ev("UI.close()"); pg.wait_for_timeout(300)
    ok('khung nhiệm vụ chương trở lại', 'NHIỆM VỤ' in pg.inner_text('#qt') or 'HOÀN THÀNH' in pg.inner_text('#qt'), pg.inner_text('#qt').replace('\n', ' | '))
    ok('không còn quái tháp ngoài chương', ev("!G.enemies.some(e=>e.tw)"))
    shot('back_town')
    if kind == 'full':
        # ---- quét tháp ----
        res0 = ev("({g:G.save.gold,cq:G.save.cq,tq:G.save.tq,ore:G.save.ore})")
        sr = ev("VT.sweepRew(G.save.tower.best)")
        ok('quét tháp lần 1', ev("VT.sweep()") is True)
        res1 = ev("({g:G.save.gold,cq:G.save.cq,tq:G.save.tq,ore:G.save.ore})")
        ok('thưởng quét đúng', res1['cq'] - res0['cq'] == sr['cq'] and res1['tq'] - res0['tq'] == sr['tq'] and res1['g'] - res0['g'] == sr['gold'], json.dumps(sr))
        ok('quét lần 2 cùng ngày bị từ chối', ev("VT.sweep()") is False and ev("G.save.cq") == res1['cq'])
        ev("UI.open('tower')"); pg.wait_for_timeout(200)
        ok('nút quét tắt sau khi quét', ev("document.getElementById('twSw').disabled")); shot('panel_swept'); ev("UI.close()")
        ev("window.__dk=dayKey;dayKey=function(d){return d?window.__dk(d):window.__dk()+1}")
        ok('ngày mới quét được', ev("VT.sweep()") is True)
        ok('ngày mới quét lần 2 bị từ chối', ev("VT.sweep()") is False)
        ev("dayKey=window.__dk")
        # ---- bỏ cuộc qua bảng, rời tháp qua bảng thắng, đi chương khác khi trong tháp ----
        ok('vào lại', ev("VT.enter()") and ev("VT.P.n") == 13)
        ev("UI.open('tower')"); pg.wait_for_timeout(200); tap('#twQuit')
        ok('bỏ cuộc về thành', not ev("VT.on") and ev("G.W===window.__W0") and ev("G.save.tower.fails") >= 2)
        ev("UI.close();VT.enter()"); ev("travel(0,false)"); pg.wait_for_timeout(200)
        ok('đi chương khác khi trong tháp: tháp đóng sạch', not ev("VT.on") and not ev("!!G.W.tower") and ev("G.save.map") == 0)
        # ---- lưu / đọc lại ----
        ev("saveGame()")
        pg.reload(); pg.wait_for_timeout(1500); tap('#tCont'); pg.wait_for_timeout(500)
        if pg.is_visible('#stGo'): tap('#stGo')
        ok('đọc lại giữ tầng cao nhất', ev("G.save.tower.best") == 12 and ev("G.save.tower.sweepDay") > 0)
        ev("delete G.save.tower;saveGame()")
        pg.reload(); pg.wait_for_timeout(1500); tap('#tCont'); pg.wait_for_timeout(500)
        if pg.is_visible('#stGo'): tap('#stGo')
        ok('lưu cũ không có tower vẫn chạy', ev("G.state==='play'&&!!G.save.tower&&G.save.tower.best===0&&G.save.tower.cur===1"))
        ev("UI.open('tower')"); pg.wait_for_timeout(200)
        ok('bảng mở với lưu cũ', pg.is_visible('#twGo') and 'Tầng 1' in pg.inner_text('#shBody'))
        ev("UI.close()")
    print('ERRORS', [e for e in errs][:10])
    ok('không lỗi JS', not [e for e in errs if e[0] == 'pageerror' or 'Error' in e[1]])
    print('SUMMARY', sum(1 for r in R if r[1]), '/', len(R))
    b.close()

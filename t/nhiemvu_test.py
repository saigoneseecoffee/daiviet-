# Kiểm thử Kỳ Ngộ (nhiemvu.js): python3 nhiemvu_test.py [phone|desk|se|land]
import sys, os
os.environ.setdefault('DVHK_HTML', os.path.abspath(os.path.join(os.path.dirname(__file__), '../dist/agent_nhiemvu.html')))
from harness import *
from tower_lib import MKCHAR
mode = sys.argv[1] if len(sys.argv) > 1 else 'phone'
OPTS = {'phone': PHONE, 'se': SE, 'land': LAND, 'desk': DESK}[mode]
touch = mode != 'desk'
R = []
def ok(n, c, x=''):
    R.append(bool(c)); print(('PASS ' if c else 'FAIL ') + n, x, flush=True)
DAY = 86400000
os.makedirs('shots', exist_ok=True)
with sync_playwright() as p:
    b, ctx, pg, errs = open_page(p, OPTS)
    pg.set_default_timeout(180000)
    ev = pg.evaluate
    shot = lambda n: pg.screenshot(path=f'shots/nhiemvu_{mode}_{n}.png')
    def tap(sel):
        el = pg.locator(sel).first
        try: el.scroll_into_view_if_needed(timeout=5000)
        except Exception as e: print('  (scroll skip', sel, ev("(()=>{const e=document.querySelector(%r);const r=e&&e.getBoundingClientRect();return e?[r.x,r.y,r.width,r.height,getComputedStyle(e).visibility]:null})()" % sel), ')')
        bb = el.bounding_box()
        x, y = bb['x'] + bb['width'] / 2, bb['y'] + bb['height'] / 2
        if touch: pg.touchscreen.tap(x, y)
        else: pg.mouse.click(x, y)
        pg.wait_for_timeout(200)
    def perks(): ev("(()=>{let n=0;while(window.PERKS&&PERKS.offerPending&&(PERKS.offerPending()||PERKS.showing())&&n++<60)PERKS.pickAuto()})()")
    def goto(nv, k=0, dx=0, dy=30):
        ev(f"(()=>{{const n=G.W.npcs.filter(n=>n.nv==='{nv}')[{k}];G.p.x=n.x+{dx};G.p.y=n.y+{dy};G.cam.x=G.p.x;G.cam.y=G.p.y-20;G.enemies=[];update(0.016)}})()")
        pg.wait_for_timeout(250)
    def overflow_ok():
        o = overflow(pg); return o['sw'] <= o['cw'] + 1, str(o)
    # ---------- nhân vật mới ----------
    pg.click('#tNew'); pg.click('[data-c="kiem"]'); pg.fill('#heroName', 'Bảo Thử'); pg.click('#goBtn'); pg.wait_for_timeout(600); pg.click('#stGo'); pg.wait_for_timeout(400)
    ev("G.save.tut={move:true,atk:true,skill:true,equip:true,forge:true,mount:true};document.getElementById('offer').hidden=true;G.save.set.sfx=false")
    ok('lưu mới có G.save.nv', ev("!!NV.state()&&G.save.nv.v===1"))
    ok('NPC Kỳ Ngộ đặt đủ', ev("['ongdo','fish','tieu'].every(k=>G.W.npcs.some(n=>n.nv===k))&&G.W.npcs.filter(n=>n.nv==='bia').length===2&&G.W.npcs.filter(n=>n.nv==='chest').length===3"),
       str(ev("G.W.npcs.filter(n=>n.nv).map(n=>n.nv)")))
    ok('bia/rương đặt trên ô đi được', ev("G.W.npcs.filter(n=>n.nv==='bia'||n.nv==='chest').every(n=>G.W.walk[Math.floor(n.y/T)*MW+Math.floor(n.x/T)])"))
    ok('mọi chương đặt đủ bia, rương', ev("MAPS.every((m,i)=>{const W=makeWorld(i);return W.npcs.filter(n=>n.nv==='bia').length===2&&W.npcs.filter(n=>n.nv==='chest').length===3})"))
    ok('>=80 câu đố, 24 bia, 10 loài cá', ev("NV.QZ.length>=80&&NV.BIA.length===12&&NV.BIA.every(p=>p.length===2)&&NV.FISH.length===10"), str(ev("NV.QZ.length")))
    ok('dữ liệu đố hợp lệ', ev("NV.QZ.every(q=>NV.ERA[q[0]]&&q[2].length===4&&new Set(q[2]).size===4&&q[3].length>10)&&NV.BIA.flat().every(b=>b[3].length===4&&new Set(b[3]).size===4)"))
    # ---------- lưu cũ ----------
    ev("delete G.save.nv;saveGame()")
    pg.reload(); pg.wait_for_timeout(1500); pg.click('#tCont'); pg.wait_for_timeout(600)
    if pg.is_visible('#stGo'): pg.click('#stGo')
    ev("document.getElementById('offer').hidden=true;G.save.set.sfx=false")
    ok('lưu cũ (không có nv) vẫn chơi được', ev("G.state==='play'&&!!NV.state()&&NV.state().keys===0"))
    # ---------- Đố Sử: Ông Đồ ----------
    goto('ongdo')
    ok('nút NPC Ông Đồ', pg.is_visible('#npcBtn') and 'Đố Sử' in pg.inner_text('#npcBtn'), pg.inner_text('#npcBtn'))
    shot('ongdo')
    tap('#npcBtn')
    ok('mở cuộn đố', ev("NV.ov==='quiz'&&G.paused") and pg.is_visible('.nvOpt'))
    g0 = ev("G.save.gold")
    a = ev("NV.Q.items[NV.Q.i].ans")
    shot('quiz')
    tap(f'.nvOpt[data-o="{a}"]')
    ok('trả lời đúng: thưởng + đếm', ev("NV.state().qz===1&&NV.state().qc===1") and ev("G.save.gold") > g0, str(ev("[NV.state().qz,NV.state().qc]")))
    ok('hiện dấu Đúng + giải thích', pg.is_visible('.nvStamp.ok') and len(pg.inner_text('.nvEx')) > 10)
    shot('quiz_ok')
    tap('#nvNav .btn:last-child')
    a = ev("NV.Q.items[NV.Q.i].ans"); wrong = (a + 1) % 4
    if touch: tap(f'.nvOpt[data-o="{wrong}"]')
    else: pg.keyboard.press('Digit%d' % (wrong + 1)); pg.wait_for_timeout(200)
    ok('trả lời sai: không thưởng, hiện đáp án', ev("NV.state().qz===2&&NV.state().qc===1") and pg.is_visible('.nvOpt.bad') and pg.is_visible('.nvOpt.ok'))
    shot('quiz_bad')
    ok('cuộn đố không tràn ngang', *overflow_ok())
    # hết giờ = sai
    tap('#nvNav .btn:last-child')
    ev("NV.dev.manual=true;NV.dev.tick(31)")
    ok('hết giờ tính sai', ev("NV.Q.done&&NV.state().qz===3&&NV.Q.res[2]===false"))
    ev("NV.dev.manual=false")
    for i in range(2):
        tap('#nvNav .btn:last-child'); a = ev("NV.Q.items[NV.Q.i].ans"); tap(f'.nvOpt[data-o="{a}"]')
    ok('đủ 5 câu', ev("NV.state().qz===5&&NV.state().qc===3"))
    tq0 = ev("G.save.ore")
    tap('#nvNav .btn:last-child')
    ok('tổng kết + thưởng 3/5', pg.is_visible('.nvSum') and ev("G.save.ore") > tq0 and ev("NV.state().qBonus===NV.state().day"))
    tap('#nvBox .nvRow .btn:last-child')
    ok('đóng cuộn, game chạy lại', ev("!NV.ov&&!G.paused"))
    ev("UI.open('nv_quiz')")
    ok('giới hạn 5 câu/ngày', ev("NV.ov==='card'&&!NV.Q") and 'Hẹn ngày mai' in pg.inner_text('#nvBox'))
    ev("NV.close()")
    ok('câu đã hỏi không lặp trong ngày', ev("new Set(NV.state().qseen).size===NV.state().qseen.length"))
    ev(f"NV.dev.shift({DAY})")
    ok('sang ngày mới (dayKey giả) reset', ev("NV.state().qz===0&&NV.state().cast===0&&NV.state().esc===0&&NV.state().day===NV.dev.today()"))
    ev("UI.open('nv_quiz')"); ok('ngày mới đố lại được', ev("NV.ov==='quiz'&&NV.Q.items.length===5")); ev("NV.close()")
    # ---------- Bia đá ----------
    goto('bia', 0)
    ok('nút đọc bia', 'Đọc bia' in pg.inner_text('#npcBtn'), ev("[G.nearNpc&&G.nearNpc.name,document.getElementById('npcBtn').textContent,G.paused,NV.ov]"))
    tap('#npcBtn')
    ok('bia hỏi 1 câu', ev("NV.ov==='quiz'&&NV.Q.src==='bia'"))
    a = ev("NV.Q.items[0].ans"); tap(f'.nvOpt[data-o="{(a+1)%4}"]')
    ok('bia sai: chưa mở trang', ev("Object.keys(NV.state().bia).length===0"))
    tap('#nvNav .btn'); ev("UI.open('nv_bia')")
    ok('bia sai phải chờ', ev("!NV.ov"))
    ev("NV.dev.shift(61000)"); ev("UI.open('nv_bia')")
    tq0 = ev("G.save.tq||0"); a = ev("NV.Q.items[0].ans"); tap(f'.nvOpt[data-o="{a}"]')
    ok('bia đúng: trang Sử Ký + thưởng một lần', ev("Object.keys(NV.state().bia).length===1") and ev("G.save.tq||0") == tq0 + 1 and pg.is_visible('.nvLore'))
    shot('bia_ok')
    tap('#nvNav .btn'); ev("UI.open('nv_bia')")
    ok('đọc lại bia không thưởng thêm', ev("NV.ov==='card'") and ev("G.save.tq||0") == tq0 + 1); ev("NV.close()")
    # ---------- Câu cá ----------
    ev("""(()=>{const Q=DAILY.state().q;Q.push({k:'nvfish',n:3,p:0,c:0,rw:{gold:1}},{k:'nvquiz',n:3,p:0,c:0,rw:{gold:1}},{k:'nvesc',n:1,p:0,c:0,rw:{gold:1}})})()""")
    ok('daily có loại việc Kỳ Ngộ', ev("['nvfish','nvquiz','nvesc'].every(k=>DAILY.QD[k]&&DAILY.QD[k].nm(3).length>5)"))
    goto('fish')
    ok('nút câu cá', 'Câu cá' in pg.inner_text('#npcBtn'))
    tap('#npcBtn'); ev("NV.dev.manual=true;NV.dev.forceFish='chep'")
    ok('mở bến câu', ev("NV.ov==='fish'&&NV.F.ph==='aim'") and pg.is_visible('#nvCv'))
    ev("NV.dev.tick(0.4)")
    shot('fish_aim')
    if touch: tap('#nvFBtn'); ev("NV.fish.press(false)")
    else: pg.keyboard.press('Space'); pg.wait_for_timeout(100)
    ok('quăng cần (input thật)', ev("NV.F.ph==='fly'&&NV.state().cast===1"), ev("NV.F.ph"))
    ev("for(let i=0;i<200&&NV.F.ph!=='bite';i++)NV.dev.tick(0.05)")
    ok('phao chìm', ev("NV.F.ph==='bite'"))
    if touch:
        bb = pg.locator('#nvFBtn').bounding_box(); x, y = bb['x'] + bb['width'] / 2, bb['y'] + bb['height'] / 2
        pg.mouse.move(x, y); ev("NV.fish.press(true)")
    else: pg.keyboard.down('Space')
    ok('giật trúng -> kéo', ev("NV.F.ph==='reel'"))
    ev("for(let i=0;i<10;i++)NV.dev.tick(0.05)")
    shot('fish_reel')
    if not touch: pg.keyboard.up('Space')
    res = ev("""(()=>{let n=0;while(NV.F.ph==='reel'&&n++<1500){const F=NV.F;NV.fish.press(F.ten<F.z);NV.dev.tick(0.03)}return [NV.F.ph,n]})()""")
    ok('giữ dây trong vùng xanh -> câu được', ev("NV.state().rec.chep&&NV.state().basket.chep.n===1") and pg.is_visible('.nvCatch canvas'), str(res))
    ok('daily nvfish tăng', ev("DAILY.state().q.find(q=>q.k==='nvfish').p===1"))
    shot('fish_catch')
    ok('bến câu không tràn ngang', *overflow_ok())
    # thất bại: giật sớm
    tap('#nvRes .btn')
    ev("NV.fish.press(true);NV.fish.press(false);for(let i=0;i<12;i++)NV.dev.tick(0.05)")
    ok('đang chờ cá', ev("NV.F.ph==='wait'"))
    ev("NV.fish.press(true);NV.fish.press(false)")
    ok('giật sớm -> cá chạy', ev("NV.F.ph==='res'") and 'sớm' in pg.inner_text('#nvRes'))
    # thất bại: chậm tay
    tap('#nvRes .btn'); ev("NV.fish.press(true);NV.fish.press(false);for(let i=0;i<300&&NV.F.ph!=='res';i++)NV.dev.tick(0.05)")
    ok('không giật -> mất mồi', 'Chậm tay' in pg.inner_text('#nvRes'))
    # thất bại: dây chùng
    tap('#nvRes .btn'); ev("NV.fish.press(true);NV.fish.press(false);for(let i=0;i<300&&NV.F.ph!=='bite';i++)NV.dev.tick(0.05);NV.fish.press(true);NV.fish.press(false);for(let i=0;i<200&&NV.F.ph==='reel';i++)NV.dev.tick(0.05)")
    ok('thả dây -> cá thoát', 'chùng' in pg.inner_text('#nvRes'))
    # đứt dây
    tap('#nvRes .btn'); ev("NV.fish.press(true);NV.fish.press(false);for(let i=0;i<300&&NV.F.ph!=='bite';i++)NV.dev.tick(0.05);NV.fish.press(true);for(let i=0;i<200&&NV.F.ph==='reel';i++){NV.F.jerkT=9;NV.dev.tick(0.05)}NV.fish.press(false)")
    ok('giữ mãi -> đứt dây', 'đứt' in pg.inner_text('#nvRes'))
    ok('đếm mồi', ev("NV.state().cast===5"))
    ev("NV.state().cast=NV.CASTS;NV.close();UI.open('nv_fish')")
    ok('hết mồi thì báo', ev("NV.ov==='card'") and 'Hết mồi' in pg.inner_text('#nvBox'))
    ev("NV.close();NV.dev.manual=false;NV.dev.forceFish=null")
    # bán, giao đơn
    ev("const s=NV.state();s.ord={sp:'ro',n:2,done:0};s.basket.ro={n:3,v:30}")
    g0 = ev("G.save.gold"); ev("NV.turnIn()")
    ok('giao đơn cá', ev("NV.state().ord.done===1&&NV.state().basket.ro.n===1"))
    ev("NV.sell('all')"); ok('bán cá', ev("G.save.gold") > g0 and ev("Object.keys(NV.state().basket).length===0"))
    # ---------- Hub Kỳ Ngộ ----------
    ev("HUB.show('kyngo')"); pg.wait_for_timeout(300)
    ok('thẻ Kỳ Ngộ trong Võ Đạo', pg.is_visible('.nvCard') and ev("UI.panel==='vodao'"))
    ok('nút >=44px', all(pg.locator(s).first.bounding_box()['height'] >= 44 for s in ['.nvSegs button', '.nvBtns .btn']))
    shot('hub')
    ok('hub không tràn ngang', *overflow_ok())
    tap('.nvSegs [data-v="fish"]'); ok('Ngư Phổ', pg.is_visible('.nvCodex') and pg.locator('.nvFc').count() == 10); shot('hub_fish')
    tap('.nvSegs [data-v="su"]'); ok('Sử Ký', pg.locator('.nvSu').count() == 24 and pg.locator('.nvSu:not(.lk)').count() == 1); shot('hub_su')
    tap('.nvSegs [data-v="act"]'); tap('[data-go="ongdo"]')
    ok('chỉ đường: mũi tên vàng tới Ông Đồ', ev("!UI.panel&&NV.guide&&NV.guide.label==='Ông Đồ'"))
    ev("update(0.016);render(0.016)")
    ok('questTarget dùng chỉ đường', ev("G.questArrow&&G.questArrow.label==='Ông Đồ'"))
    goto('ongdo'); ev("update(0.016)"); ok('tới nơi thì tắt chỉ đường', ev("!NV.guide"))
    # ---------- Chìa khóa & rương ----------
    ev(MKCHAR, [30, 8, 3])
    ev("NV.dev.keyRate=1;const p=G.p;G.p.x=G.W.out.x;G.p.y=G.W.out.y-200;const e=spawnEnemy(pickType(),p.x+60,p.y,5,true);hurtEnemy(e,1e9,{});NV.dev.keyRate=null")
    ok('tinh anh rơi chìa khóa', ev("G.drops.some(d=>d.kind==='nvkey')"))
    ev("const d=G.drops.find(d=>d.kind==='nvkey');for(let i=0;i<60;i++){G.p.x=d.x;G.p.y=d.y;update(0.05)}")
    ok('nhặt chìa khóa', ev("NV.state().keys===1&&!G.drops.some(d=>d.kind==='nvkey')"))
    goto('chest', 0, 0, 40)
    ok('nút mở rương', 'Mở rương' in pg.inner_text('#npcBtn'))
    shot('chest')
    tq0 = ev("G.save.tq||0"); nd = ev("G.drops.length")
    tap('#npcBtn')
    ok('mở rương: tốn chìa, rơi đồ, thưởng lần đầu', ev("NV.state().keys===0&&Object.keys(NV.state().chest).length===1") and ev("G.drops.length") > nd and ev("G.save.tq||0") == tq0 + 1)
    ev("NV.state().keys=1;UI.open('nv_chest')")
    ok('rương đã mở hôm nay thì khóa', ev("NV.state().keys===1"))
    # ---------- Áp tiêu: thành công ----------
    ev(MKCHAR, [30, 8, 3])
    goto('tieu')
    ok('nút áp tiêu', 'Áp tiêu' in pg.inner_text('#npcBtn'))
    tap('#npcBtn'); ok('thẻ nhận tiêu', ev("NV.ov==='card'") and pg.is_visible('[data-a="go"]'))
    shot('esc_card')
    tap('[data-a="go"]')
    ok('xe lên đường', ev("!!NV.Esc&&NV.state().esc===1&&!G.paused"))
    ev("G.save.set.auto=true")
    for i in range(12):
        ev("""(()=>{const dt=1/30;for(let i=0;i<300;i++){if(!NV.Esc)break;const p=G.p;p.hp=p.maxhp;p.mp=p.maxmp;if(G.state==='dead')update(dt);
          if(UI.panel)UI.close();G.paused=false;if(G.hitstop>0)G.hitstop-=dt;else update(dt)}})()""")
        if i == 1 or (ev("NV.Esc&&!!NV.Esc.wave") and not os.path.exists(f'shots/nhiemvu_{mode}_esc_wave.png')):
            ev("(()=>{const E=NV.Esc;G.p.x=E.x-E.f*70;G.p.y=E.y+50;G.cam.x=G.p.x;G.cam.y=G.p.y-20})()"); pg.wait_for_timeout(300); shot('esc_wave' if ev("NV.Esc&&!!NV.Esc.wave") else 'esc_run')
        if not ev("!!NV.Esc"): break
    ok('áp tiêu tới trạm (vòng update thật)', ev("!NV.Esc&&(NV.state().cnt.escOk||0)===1"), str(ev("NV.state().cnt")))
    ok('đủ 3 đợt cướp', ev("NV.state().cnt.escWave===3"), str(ev("NV.state().cnt.escWave")))
    pg.wait_for_timeout(1200); ev("for(let i=0;i<30;i++)update(0.05)")
    ok('thẻ thưởng áp tiêu', ev("NV.ov==='card'") and 'thành công' in pg.inner_text('#nvBox'), ev("NV.ov"))
    shot('esc_win'); ev("NV.close();G.save.set.auto=false")
    ok('daily nvesc tăng', ev("DAILY.state().q.find(q=>q.k==='nvesc').p===1"))
    # ---------- Áp tiêu: xe vỡ ----------
    goto('tieu'); ev("NV.esc.start()")
    r = ev("""(()=>{const dt=1/30;let t=0;for(let i=0;i<9000;i++){if(!NV.Esc)break;const E=NV.Esc,p=G.p;p.hp=p.maxhp;p.ifr=9;G.input.atk=false;p.x=E.x-E.f*50;p.y=E.y+40;
        G.paused=false;if(G.hitstop>0)G.hitstop-=dt;else update(dt);t+=dt}return [!!NV.Esc,Math.round(t),NV.state().cnt.escFail||0]})()""")
    ok('bỏ mặc cướp -> xe vỡ', r[0] is False and r[2] == 1, str(r))
    ev("for(let i=0;i<30;i++)update(0.05)")
    ok('thẻ mất hàng', ev("NV.ov==='card'") and 'Mất hàng' in pg.inner_text('#nvBox')); ev("NV.close()")
    ev("NV.esc.start()"); ok('giới hạn 3 chuyến/ngày', ev("NV.state().esc===3") and not ev("NV.esc.start()"))
    ev("NV.esc.end(false,'',true)")
    # ---------- chung ----------
    ev("travel(1,false)")
    ok('sang chương khác vẫn đủ NPC', ev("G.W.npcs.filter(n=>n.nv).length===8"))
    ok('lưu được', ev("saveGame();JSON.parse(localStorage.getItem(SAVE_KEY)).nv.v===1"))
    bad = [e for e in errs if 'favicon' not in e[1]]
    ok('không lỗi JS', not bad, str(bad[:5]))
    b.close()
print(f'\n{sum(R)}/{len(R)} PASS ({mode})')

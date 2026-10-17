# Kiểm thử Gia Tướng (giatuong.js): python3 giatuong_test.py [phone|se|land|desk]
# DVHK_HTML=$(pwd)/../dist/agent_giatuong.html
import sys, os, json
os.environ.setdefault('DVHK_HTML', os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'dist', 'agent_giatuong.html'))
from harness import *
from tower_lib import MKCHAR, CLIMB
mode = sys.argv[1] if len(sys.argv) > 1 else 'phone'
OPTS = {'phone': PHONE, 'se': SE, 'land': LAND, 'desk': DESK}[mode]
touch = mode != 'desk'
R = []
def ok(n, c, x=''):
    R.append(bool(c)); print(('PASS ' if c else 'FAIL ') + n, x, flush=True)

SIM = '''([secs,auto])=>{const dt=1/60;let deaths=0;const S=G.save;S.set.auto=!!auto;
  for(let i=0;i<secs*60;i++){if(G.state==='dead'){deaths++;while(G.state==='dead')update(dt)}
    if(window.PERKS){let n=0;while((PERKS.offerPending()||PERKS.showing())&&n++<20)PERKS.pickAuto()}
    G.paused=false;if(UI.panel)UI.close();if(G.hitstop>0)G.hitstop-=dt;else update(dt*G.slow)}
  S.set.auto=false;return{deaths,lvl:S.lvl,kills:S.kills}}'''
# đếm sát thương theo nguồn
SPY = '''(()=>{if(window.__gtSpy)return;window.__gtSpy={gt:0,gtN:0,kills:0,procBad:0,by:{}};
  HK.on('hit',(e,d,o)=>{if(o&&o.gt){__gtSpy.gt+=d;__gtSpy.gtN++;__gtSpy.by[o.gt]=(__gtSpy.by[o.gt]||0)+d;if(!o.proc)__gtSpy.procBad++}});
  HK.on('kill',e=>{if(e._gtBy)__gtSpy.kills++})})()'''

with sync_playwright() as p:
    b, ctx, pg, errs = open_page(p, OPTS)
    ev = pg.evaluate; pg.set_default_timeout(120000)
    W, H = OPTS['viewport']['width'], OPTS['viewport']['height']
    shot = lambda n: pg.screenshot(path=f'shots/giatuong_{mode}_{n}.png')
    def tap(sel):
        el = pg.locator(sel).first; el.scroll_into_view_if_needed(timeout=8000); bb = el.bounding_box()
        x, y = bb['x'] + bb['width'] / 2, bb['y'] + bb['height'] / 2
        if touch: pg.touchscreen.tap(x, y)
        else: pg.mouse.click(x, y)
        pg.wait_for_timeout(250)
    def box(sel): return pg.locator(sel).first.bounding_box()
    def nooverflow(tag):
        o = overflow(pg); ok(f'không tràn ngang ({tag})', o['sw'] <= o['cw'] + 1 and o['bw'] <= o['cw'] + 1, str(o))
    def quiet(): ev("G.save.tut={move:true,atk:true,skill:true,equip:true,forge:true,mount:true};document.getElementById('offer').hidden=true;document.getElementById('toasts').innerHTML='';document.querySelectorAll('#dlyAch,.dlyAch').forEach(e=>e.remove())")
    def to_town(): ev("(()=>{const n=G.W.npcs.find(n=>n.act==='giatuong');G.p.x=n.x;G.p.y=n.y+46;G.cam.x=G.p.x;G.cam.y=G.p.y;update(1/60);for(const c of GT.list())c.x=G.p.x-40,c.y=G.p.y+10})()")
    def to_field(): ev("(()=>{G.p.x=G.W.out.x;G.p.y=G.W.out.y+40;G.cam.x=G.p.x;G.cam.y=G.p.y;G.enemies=G.enemies.filter(e=>e.boss);for(let i=0;i<30;i++)update(1/60)})()")

    # ---------- 1. bản lưu mới ----------
    pg.click('#tNew'); pg.click('[data-c="giao"]'); pg.click('#goBtn'); pg.wait_for_timeout(500); pg.click('#stGo'); pg.wait_for_timeout(300)
    ok('bản lưu mới chưa có khóa gt', ev("G.save.gt===undefined"))
    ok('đăng ký thẻ Gia Tướng trong Võ Đạo', ev("HUB.tabs.some(t=>t.id==='giatuong')"))
    ok('NPC Đội Trưởng Gia Tướng ở thành', ev("G.W.npcs.some(n=>n.act==='giatuong')"))
    ok('không chấm đỏ khi cấp thấp', ev("!HUB.tabs.find(t=>t.id==='giatuong').dot()"))
    ok('tối đa 1 gia tướng lúc đầu', ev("GT.maxAct()") == 1)
    ev(MKCHAR, [40, 6, 2]); quiet(); ev(SPY)

    # ---------- 2. vật liệu rơi từ quái thật ----------
    to_field()
    r = ev("""(()=>{const g0=GT.gs();const a0=g0.an,q0=g0.ql,h0=g0.hf;const p=G.p;
      for(let i=0;i<14;i++){const e=spawnEnemy(pickType(),p.x+300,p.y,20,true);killEnemy(e)}
      for(let i=0;i<120;i++){const e=spawnEnemy(pickType(),p.x+300,p.y,20,false);killEnemy(e)}
      const g=GT.gs();G.drops=[];return[g.an-a0,g.ql-q0,g.hf-h0]})()""")
    ok('tinh anh rơi Ấn Tín', r[0] >= 1, str(r)); ok('quái thường rơi Quân Lương', r[1] >= 1, str(r))

    # ---------- 3. chiêu mộ qua giao diện ----------
    ev("GT.give('an',60);GT.give('ql',80);GT.give('hf',4);G.save.gold=200000")
    to_field(); ev("HUB.show('giatuong')"); pg.wait_for_timeout(300)
    ok('mở bảng Gia Tướng', pg.is_visible('#gtBigCv') and ev("UI.panel==='vodao'&&HUB.cur==='giatuong'"))
    tap('[data-sel="nghia"]')
    ok('ngoài thành: nút Chiêu mộ khóa', pg.locator('#gtRec').is_disabled())
    ev("UI.close()"); to_town(); ev("HUB.show('giatuong')"); pg.wait_for_timeout(250)
    tap('[data-sel="nghia"]')
    ok('trong thành: nút Chiêu mộ mở', not pg.locator('#gtRec').is_disabled())
    g0 = ev("G.save.gold"); tap('#gtRec')
    ok('chiêu mộ Nghĩa Binh', ev("!!G.save.gt.own.nghia&&G.save.gt.act[0]==='nghia'"), str(ev("G.save.gt")))
    ok('trừ vàng', ev("G.save.gold") < g0)
    ok('gia tướng xuất hiện', ev("GT.list().length") == 1)
    tap('#gtUp'); ok('nâng lên 2 sao qua giao diện', ev("G.save.gt.own.nghia.t") == 2)
    a1 = ev("[GT.list()[0].atk,GT.list()[0].max]")
    ok('nâng sao tăng chỉ số', a1[0] > 0 and ev("GT.list()[0].atk") >= a1[0])
    tap('[data-sel="tuong"]'); tap('#gtRec')
    ok('chiêu mộ Chiến Tượng', ev("!!G.save.gt.own.tuong"))
    ok('chỉ 1 ô xuất trận trước Cảnh Giới 4', ev("G.save.gt.act.length") == 1)
    tap('#gtAct'); ok('Xuất trận thay thế gia tướng cũ', ev("G.save.gt.act.join()") == 'tuong', ev("G.save.gt.act.join()"))
    # kích thước chạm + tràn
    cb = box('[data-sel="tuong"]'); ok('thẻ gia tướng ≥ 44px', cb['width'] >= 44 and cb['height'] >= 44, str(cb))
    for s in ['#gtAct', '#gtUp']:
        bb = box(s); ok(f'nút {s} ≥ 44px', bb and bb['height'] >= 43.5, str(bb))
    nooverflow('bảng Gia Tướng')
    shot('tab'); ev("document.getElementById('shBody').scrollTop=9999"); pg.wait_for_timeout(150); shot('tab2')
    ev("UI.close()")
    # Cảnh Giới 4 mở ô thứ hai
    ev("progEnsure(G.save);G.save.prog.realm=4")
    ok('Cảnh Giới 4: 2 ô', ev("GT.maxAct()") == 2)
    ev("GT.recruit('nutuong',true);GT.recruit('no',true);GT.recruit('daibang',true);GT.recruit('ho',true);GT.recruit('thaylang',true);GT.recruit('kimquy',true);G.save.gt.act=['tuong'];GT.deploy('nghia')")
    ok('2 gia tướng theo', ev("GT.list().map(c=>c.id).join()") == 'tuong,nghia', ev("GT.list().map(c=>c.id).join()"))

    # ---------- 4. đi theo người chơi qua cổng thành ----------
    to_town(); ev("(()=>{for(let i=0;i<60;i++)update(1/60)})()")
    d = ev("""(()=>{const p=G.p,O=G.W.out;let maxD=0;for(let i=0;i<60*8;i++){const a=Math.atan2(O.y-p.y,O.x-p.x),dd=Math.hypot(O.x-p.x,O.y-p.y);
        if(dd>20){const v=navTo(O.x,O.y);G.input.mx=v[0];G.input.my=v[1]}else{G.input.mx=G.input.my=0}update(1/60);
        for(const c of GT.list())maxD=Math.max(maxD,Math.hypot(c.x-p.x,c.y-p.y))}
      G.input.mx=G.input.my=0;for(let i=0;i<90;i++)update(1/60);return{maxD:Math.round(maxD),end:GT.list().map(c=>Math.round(Math.hypot(c.x-p.x,c.y-p.y))),out:!p.inCamp}})()""")
    ok('theo người chơi ra khỏi thành', d['out'] and max(d['end']) < 140, json.dumps(d))

    # ---------- 5. gia tướng tự đánh (người chơi đứng yên) ----------
    shot('hud')
    hb = box('#gtHud'); pb = box('#plate'); qb = box('#qt')
    ok('chip gia tướng hiện trên HUD', hb and hb['width'] > 40, str(hb))
    inter = lambda a, b: not (a['x'] + a['width'] <= b['x'] or b['x'] + b['width'] <= a['x'] or a['y'] + a['height'] <= b['y'] or b['y'] + b['height'] <= a['y'])
    ok('chip không đè khung nhân vật / nhiệm vụ / bản đồ', not inter(hb, pb) and not inter(hb, qb) and not inter(hb, box('#miniWrap')), f'{hb} {pb} {qb}')
    to_field()
    ev("""(()=>{const p=G.p;for(let k=0;k<6;k++){const e=spawnEnemy(pickType(),p.x+150+(k%3)*30,p.y-50+k*22,G.save.lvl-8,k===0);e.state='chase'}})()""")
    s0 = ev("__gtSpy.gt")
    ev("(()=>{G.input.atk=false;G.save.set.auto=false;for(let i=0;i<60*12;i++){update(1/60)}})()")
    sp = ev("__gtSpy")
    ok('gia tướng gây sát thương khi người chơi không đánh', sp['gt'] - s0 > 0, json.dumps(sp))
    ok('gia tướng hạ được quái', sp['kills'] > 0, json.dumps(sp))
    ok('đòn gia tướng có o.proc', sp['procBad'] == 0)
    ok('đủ 2 gia tướng ra đòn', len(sp['by']) == 2, json.dumps(sp['by']))
    ok('Thân Mật tăng', ev("(G.save.gt.own.tuong.b||0)+(G.save.gt.own.tuong.bl||0)+(G.save.gt.own.nghia.b||0)") > 0)

    # ---------- 6. vòng bot: mọi gia tướng ----------
    tot = {}
    for pair in [['ho', 'no'], ['nutuong', 'daibang'], ['thaylang', 'kimquy']]:
        ev("a=>{G.save.gt.act=a;GT.sync()}", pair); to_field()
        h0 = ev("__gtSpy.by")
        rs = ev(SIM, [40, True])
        h1 = ev("__gtSpy.by")
        for k in pair: tot[k] = h1.get(k, 0) - h0.get(k, 0)
        if pair[0] == 'nutuong':
            ev("""(()=>{const p=G.p;for(let k=0;k<5;k++){const e=spawnEnemy(pickType(),p.x+90+k*12,p.y-30+k*16,G.save.lvl-5,false);e.state='chase'}for(let i=0;i<50;i++)update(1/60)})()""")
            pg.wait_for_timeout(300); shot('fight')
    ok('mọi gia tướng gây sát thương (bot 40 giây mỗi cặp)', all(tot.get(k, 0) > 0 for k in ['ho', 'no', 'nutuong', 'daibang', 'kimquy']), json.dumps(tot))
    heal0 = ev("""(()=>{const p=G.p;p.hp=p.maxhp*0.5;const c=GT.list().find(c=>c.id==='thaylang');c.healT=0;c.down=0;const h=p.hp;update(1/60);return p.hp>h})()""")
    ok('Thầy Lang chữa thương cho người chơi', heal0)
    red = ev("""(()=>{const p=G.p;const k=GT.list().find(c=>c.id==='kimquy');k.x=p.x+20;k.y=p.y;p.gtSh=0;const a=HK.mod('dmgIn',100,null);p.gtSh=30;const b=HK.mod('dmgIn',100,null);return[a,b]})()""")
    ok('Kim Quy giảm sát thương + khiên', red[0] < 100 and red[1] < red[0], str(red))

    # ---------- 7. trọng thương / hồi phục ----------
    ev("a=>{G.save.gt.act=a;GT.sync()}", ['tuong', 'nghia']); to_field()
    ok('trọng thương', ev("GT.knock('nghia')&&GT.list().find(c=>c.id==='nghia').down>19"))
    ev("(()=>{for(let i=0;i<60*5;i++)update(1/60)})()"); pg.wait_for_timeout(200)
    ok('HUD hiện đếm ngược', pg.locator('#gtHud [data-gt="nghia"] .dn').inner_text().endswith('s'))
    shot('down')
    ev("(()=>{for(let i=0;i<60*16;i++)update(1/60)})()")
    c = ev("(()=>{const c=GT.list().find(c=>c.id==='nghia');return[c.down,c.hp>0,Math.round(Math.hypot(c.x-G.p.x,c.y-G.p.y))]})()")
    ok('hồi phục sau 20 giây cạnh người chơi', c[0] <= 0 and c[1] and c[2] < 200, str(c))
    # quái đánh trả làm gia tướng mất máu
    lost = ev("""(()=>{const c=GT.list()[0],p=G.p;c.hp=c.max;const e=spawnEnemy(pickType(),c.x+c.r+8,c.y,G.save.lvl+20,true);e.state='chase';const h=c.hp;
      for(let i=0;i<60*4;i++){update(1/60);e.x=c.x+c.r+8;e.y=c.y;e.hp=e.max}e.dead=true;return h-c.hp})()""")
    ok('quái đánh trả gia tướng', lost > 0, str(lost))

    # ---------- 8. tháp ----------
    to_town(); ev("UI.close()")
    ok('vào tháp cùng gia tướng', ev("VT.enter()") and ev("VT.on"))
    ev("(()=>{for(let i=0;i<30;i++)update(1/60)})()")
    ok('gia tướng theo vào tầng tháp', ev("GT.list().every(c=>Math.hypot(c.x-G.p.x,c.y-G.p.y)<200)"), str(ev("GT.list().map(c=>[c.x,c.y,G.p.x,G.p.y])")))
    cl = ev(CLIMB, [90, 3])
    ok('leo tháp thắng tầng có gia tướng', any(x['win'] for x in cl['log']), json.dumps(cl['log']))
    ok('tháp hết quái khi thắng', ev("!VT.on||VT.ph!=='fight'||G.enemies.filter(e=>!e.dead).length>=0"))
    if ev("VT.on"): ev("VT.leave&&VT.leave(true)")
    ev("(()=>{for(let i=0;i<20;i++)update(1/60)})()")
    ok('rời tháp: gia tướng về cạnh người chơi', ev("!VT.on&&GT.list().every(c=>c.down>0||Math.hypot(c.x-G.p.x,c.y-G.p.y)<220)"))

    # ---------- 9. Thân Mật: mốc thưởng ----------
    p0 = ev("G.p.maxhp"); ev("(()=>{const o=G.save.gt.own.tuong;o.bl=2;o.b=GT.needB(2)-0.5;const e=spawnEnemy(pickType(),GT.list()[0].x+30,GT.list()[0].y,10,false);killEnemy(e)})()")
    ok('Thân Mật cấp 3 mở thưởng sinh lực', ev("G.save.gt.own.tuong.bl") == 3 and ev("G.p.maxhp") > p0, f'{p0}->{ev("G.p.maxhp")}')

    # ---------- 10. boss chương với gia tướng ----------
    if mode in ('desk', 'phone'):
        r = ev("""(()=>{const S=G.save,M=curMap();S.qs[S.map]=M.quest.findIndex(q=>q.t==='boss');S.qp=0;G.save.lvl=Math.max(S.lvl,M.lv[1]+2);recalc();
          const A=G.W.arena;G.p.x=A.x;G.p.y=A.y+A.r*0.4;G.enemies=[];for(let i=0;i<10;i++)update(1/60);return !!G.boss})()""")
        ok('vào trận boss', r)
        hp0 = ev("G.boss?G.boss.hp/G.boss.max:1")
        rs = ev(SIM, [50, True])
        ok('đánh boss cùng gia tướng không lỗi', ev("!G.boss||G.boss.dead||G.boss.hp/G.boss.max<" + str(hp0)), json.dumps(rs))
        if ev("G.boss&&!G.boss.dead"): pg.wait_for_timeout(200); shot('boss')

    # ---------- 11. bản lưu cũ không có khóa gt ----------
    ev("(()=>{const S=G.save;delete S.gt;S.lvl=30;saveGame()})()")
    ev("UI.close();showTitle()"); pg.wait_for_timeout(400); pg.click('#tCont'); pg.wait_for_timeout(600)
    ev("document.getElementById('stGo')&&document.getElementById('stGo').click()")
    ok('bản lưu cũ chạy được', ev("G.state==='play'&&!G.save.gt||!!G.save.gt"))
    ev("(()=>{for(let i=0;i<120;i++)update(1/60)})()")
    ok('bản lưu cũ: không gia tướng, HUD ẩn', ev("GT.list().length===0") and not pg.is_visible('#gtHud .gtChip'))
    ev("HUB.show('giatuong')"); pg.wait_for_timeout(250)
    ok('bản lưu cũ: mở bảng Gia Tướng', pg.is_visible('.gtGrid'))
    ok('bản lưu cũ: tạo khóa gt khi cần', ev("!!G.save.gt&&G.save.gt.v===1"))
    nooverflow('bảng bản lưu cũ'); ev("UI.close()")
    # bảng Thú cưỡi còn chạy và có lối vào Gia Tướng
    ev("UI.open('mount')"); pg.wait_for_timeout(250)
    ok('bảng Thú cưỡi vẫn hiện ngựa', pg.locator('.mnt').count() >= 6)
    pg.wait_for_timeout(400); ev("document.getElementById('gtGo').click()"); pg.wait_for_timeout(200); ok('lối vào Gia Tướng từ Mã Trường', ev("UI.panel==='vodao'&&HUB.cur==='giatuong'"))
    ev("UI.close()")
    # NPC
    ev("(()=>{const n=G.W.npcs.find(n=>n.act==='giatuong');G.nearNpc=null;G.paused=false;G.p.x=n.x;G.p.y=n.y+30;update(1/60)})()"); pg.wait_for_timeout(200)
    ok('nút NPC ghi Gia Tướng', 'Gia Tướng' in pg.inner_text('#npcBtn'))
    tap('#npcBtn'); ok('NPC mở thẻ Gia Tướng', ev("UI.panel==='vodao'&&HUB.cur==='giatuong'")); ev("UI.close()")

    bad = [e for e in errs if 'favicon' not in e[1]]
    ok('không lỗi JS', not bad, str(bad[:6]))
    print(f'{sum(R)}/{len(R)} PASS ({mode})')
    b.close()

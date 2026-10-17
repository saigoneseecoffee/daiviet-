"""Bài thử Bí Tịch Võ Công (bikip.js): lưu mới/cũ, rơi sách, tháp, Thư Quán, nâng cấp, trang bị, tung chiêu, Ngộ Đạo, ảnh chụp, tràn ngang, lỗi JS.
   DVHK_HTML=$(pwd)/../dist/agent_bikip.html python3 bikip_test.py"""
import os, json
from harness import *
from tower_lib import new_game, MKCHAR
ok = []; bad = []
# DPR 3 làm headless rất chậm (mỗi ảnh 12–25 giây), nên dùng DPR 2 cho điện thoại
PHONE2 = dict(PHONE, device_scale_factor=2); LAND2 = dict(LAND, device_scale_factor=2)
def chk(name, cond, info=''):
    (ok if cond else bad).append(name); print(('PASS ' if cond else 'FAIL ') + name, info if not cond else '', flush=True)
def shot(pg, n): pg.wait_for_timeout(350); pg.screenshot(path=f'shots/bikip_{n}.png', timeout=120000)
def tab(pg, v):
    pg.evaluate(f"()=>{{BT._s.view='{v}';HUB.show('bitich')}}"); pg.wait_for_timeout(250)

with sync_playwright() as p:
    # ---------- điện thoại dọc: luồng chính ----------
    b, ctx, pg, errs = open_page(p, PHONE2)
    new_game(pg, 'giao')
    r = pg.evaluate("()=>{const s=BT.st();return{own:Object.keys(s.own).length,eq:s.eq,phe:BT.phe(),s3:document.querySelector('#s3').hidden}}")
    chk('lưu mới: tạo khóa rỗng, ô ẩn', r['own'] == 0 and r['phe'] is None and r['s3'], r)
    # boss chương 1 -> sách đầu chắc chắn
    r = pg.evaluate("""()=>{const S=G.save;S.lvl=10;recalc();const e=spawnEnemy(MAPS[0].boss,G.p.x+60,G.p.y,8,false);e.hp=1;hurtEnemy(e,99999,{});
      for(let i=0;i<90;i++)update(1/60);const s=BT.st();return{own:Object.keys(s.own),eq:s.eq,wp:s.wp}}""")
    chk('boss chương 1 cho sách khởi đầu hợp phái (Thủy Long Ngâm)', r['own'] == ['thuylong'] and r['eq'][0] == 'thuylong' and r['wp'] >= 3, r)
    pg.evaluate("()=>{document.getElementById('clear').hidden=true;G.paused=false;UI.close()}")
    pg.wait_for_timeout(300)
    chk('ô 1 hiện trên HUD ở cấp 10', pg.evaluate("!document.querySelector('#s3').hidden&&document.querySelector('#s4').hidden"))
    # tinh anh rơi Tàn Trang
    r = pg.evaluate("""()=>{const s=BT.st(),w=s.wp;for(let k=0;k<30;k++){const e=spawnEnemy('soi',G.p.x+40,G.p.y,8,true);hurtEnemy(e,1e9,{})}G.drops=[];return s.wp-w}""")
    chk('tinh anh rơi Tàn Trang', r > 0, r)
    # bảo hiểm boss: tối đa 3 boss một sách
    r = pg.evaluate("""()=>{const s=BT.st();let got=0;const n0=()=>Object.keys(s.own).length+Object.values(s.own).reduce((a,o)=>a+o.pg,0);
      for(let k=0;k<9;k++){const a=n0();const e=spawnEnemy(MAPS[0].boss,G.p.x+60,G.p.y,8,false);hurtEnemy(e,1e9,{});if(n0()>a)got++;document.getElementById('clear').hidden=true}G.boss=null;G.timers=[];for(let i=0;i<30;i++)update(1/60);G.timers=[];document.getElementById('clear').hidden=true;G.paused=false;G.enemies=[];G.drops=[];return got}""")
    chk('boss rơi sách (có bảo hiểm, ≥3/9)', r >= 3, r)
    # dùng phím U, tốn nội lực, hồi chiêu
    pg.evaluate("()=>{G.p.x=G.W.out.x;G.p.y=G.W.out.y-200;for(let k=0;k<4;k++)spawnEnemy('soi',G.p.x+90,G.p.y+k*20,9,false);G.p.mp=G.p.maxmp;G.p.skCd[3]=0;G.state='play';G.paused=false}")
    pg.wait_for_timeout(200); mp0 = pg.evaluate("G.p.mp")
    pg.keyboard.press('u'); pg.wait_for_timeout(250)
    r = pg.evaluate("({mp:G.p.mp,cd:G.p.skCd[3],ents:BT.dev.ents()})")
    chk('phím U tung Bí Tịch ô 1', r['mp'] < mp0 and r['cd'] > 0, r)
    pg.wait_for_timeout(500); shot(pg, 'phone_cast')
    # chạm nút #s3 khi đang hồi -> không lỗi
    pg.evaluate("document.getElementById('clear').hidden=true"); pg.tap('#s3'); pg.wait_for_timeout(100)
    # Vượt Tháp: mốc 5 tầng
    r = pg.evaluate("""()=>{const S=G.save;S.tower=S.tower||{};S.tower.best=10;const n=Object.keys(BT.st().own).length,pg=Object.values(BT.st().own).reduce((a,o)=>a+o.pg,0);
      for(let i=0;i<200;i++)update(1/60);return{tw:BT.st().tw,gain:Object.keys(BT.st().own).length-n+Object.values(BT.st().own).reduce((a,o)=>a+o.pg,0)-pg}}""")
    chk('Vượt Tháp tầng 5 và 10 cho 2 sách', r['tw'] == 2 and r['gain'] > 0, r)
    # Thư Quán qua NPC Thủ Thư
    pg.evaluate("()=>{const n=G.W.npcs.find(n=>n.act==='bikip');G.p.x=n.x+10;G.p.y=n.y+30;G.save.gold=200000;G.enemies=[];for(let i=0;i<20;i++)update(1/60)}")
    pg.wait_for_timeout(300)
    chk('NPC Thủ Thư hiện nút', 'Tàng Kinh Các' in pg.evaluate("document.querySelector('#npcBtn').textContent"))
    pg.tap('#npcBtn'); pg.wait_for_timeout(400)
    chk('NPC mở thẻ Bí Tịch ở Thư Quán', pg.evaluate("UI.panel==='vodao'&&HUB.cur==='bitich'&&BT._s.view==='shop'&&!!document.querySelector('[data-buy]')"))
    shot(pg, 'phone_shop')
    o = overflow(pg); chk('Thư Quán không tràn ngang', o['sw'] <= o['cw'], o)
    g0 = pg.evaluate("G.save.gold"); n0 = pg.evaluate("Object.keys(BT.st().own).length+Object.values(BT.st().own).reduce((a,o)=>a+o.pg,0)")
    pg.click('[data-buy]:not([disabled])'); pg.wait_for_timeout(200)
    r = pg.evaluate("({g:G.save.gold,n:Object.keys(BT.st().own).length+Object.values(BT.st().own).reduce((a,o)=>a+o.pg,0)})")
    chk('mua sách ở Thư Quán', r['g'] < g0 and r['n'] > n0, r)
    pg.click('[data-wp]'); pg.wait_for_timeout(150)
    # Tàng Thư: chọn sách, đặt ô, nâng cấp
    pg.click('[data-btv="lib"]'); pg.wait_for_timeout(200)
    pg.evaluate("()=>{BT.st().wp+=40}"); pg.evaluate("HUB.refresh()")
    pg.click('[data-bk="thuylong"]'); pg.wait_for_timeout(200)
    shot(pg, 'phone_lib')
    o = overflow(pg); chk('Tàng Thư không tràn ngang', o['sw'] <= o['cw'], o)
    lv0 = pg.evaluate("BT.st().own.thuylong.lv")
    pg.click('[data-up="thuylong"]'); pg.wait_for_timeout(200)
    chk('nâng cấp sách bằng trang', pg.evaluate("BT.st().own.thuylong.lv") == lv0 + 1)
    r = pg.evaluate("""()=>{const t=document.querySelectorAll('.btSlot,.btCell,.btSeg button,.btDet .btn');let small=0;t.forEach(e=>{const r=e.getBoundingClientRect();if(r.width&&(r.height<36||r.width<36))small++});return small}""")
    chk('vùng chạm đủ lớn', r == 0, r)
    pg.evaluate("UI.close()")
    # Ngộ Đạo: tự hiện ở thành khi cấp 30
    pg.evaluate(MKCHAR, [32, 4, 2])
    pg.evaluate("()=>{progEnsure();G.save.prog.realm=3;recalc();G.state='play';G.paused=false;for(let i=0;i<90;i++)update(1/60)}")
    pg.wait_for_timeout(500)
    chk('Ẩn Sĩ mời Ngộ Đạo khi đủ điều kiện', pg.evaluate("!document.getElementById('btDao').hidden"))
    shot(pg, 'phone_dao')
    pg.click('[data-dao="ta"]'); pg.wait_for_timeout(300)
    r = pg.evaluate("({phe:BT.phe(),own:!!BT.st().own.huyetma,hid:document.getElementById('btDao').hidden,ls:G.p.ls})")
    chk('chọn Tà Đạo: BT.phe(), sách Huyết Ma, hội thoại đóng', r['phe'] == 'ta' and r['own'] and r['hid'], r)
    chk('ô 2 mở ở Cảnh Giới 3', pg.evaluate("!document.querySelector('#s4').hidden"))
    # đổi đạo tốn vàng
    pg.evaluate("()=>{G.save.gold=10}"); tab(pg, 'dao'); shot(pg, 'phone_daotab')
    pg.click('.btw [data-dao]'); pg.wait_for_timeout(300); pg.click('[data-dao="chinh"]'); pg.wait_for_timeout(200)
    chk('đổi đạo thiếu vàng bị chặn', pg.evaluate("BT.phe()") == 'ta')
    pg.evaluate("()=>{G.save.gold=1e7}"); pg.click('[data-dao="chinh"]'); pg.wait_for_timeout(200); pg.click('#cfYes'); pg.wait_for_timeout(300)
    r = pg.evaluate("({phe:BT.phe(),g:G.save.gold})")
    chk('đổi sang Chính Đạo tốn vàng', r['phe'] == 'chinh' and r['g'] < 1e7, r)
    # mọi sách: tung chiêu không lỗi; Tâm Pháp cộng chỉ số
    r = pg.evaluate("""()=>{BT.dev.all();G.save.prog.realm=5;recalc();G.state='play';G.paused=false;UI.close();G.p.x=G.W.out.x;G.p.y=G.W.out.y-220;const out=[];
      const d0=G.p.def;BT.equip('kimcuong',0);const d1=G.p.def;
      for(const B of BT.BOOKS){if(B.t!=='a')continue;BT.st().phe=B.side||BT.st().phe;BT.equip(B.id,1);for(let k=0;k<3;k++)spawnEnemy('linhtrieu',G.p.x+100+k*30,G.p.y+k*20,30,k===0);
        G.p.mp=G.p.maxmp;G.p.skCd[4]=0;G.p.hp=G.p.maxhp;if(!BT.cast(1,true))out.push(B.id);for(let i=0;i<200;i++)update(1/60)}
      BT.st().phe='chinh';return{fail:out,def:[d0,d1],ents:BT.dev.ents()}}""")
    chk('cả 22 Bí Tịch chủ động tung được', not r['fail'], r)
    chk('Tâm Pháp Kim Cương tăng thủ', r['def'][1] > r['def'][0], r)
    # khiên và cộng hưởng (giả TB)
    r = pg.evaluate("""()=>{BT.equip('kimchung',0);G.p.mp=G.p.maxmp;G.p.skCd[3]=0;BT.cast(0,true);const h=G.p.hp;hurtPlayer(G.p.maxhp*0.1,1,null);const blocked=G.p.hp>=h-2;
      window.TB={elemOf:()=> 'kim'};const a=BT.dev.reso(BT.BY.kimchung),b=BT.dev.reso(BT.BY.thuylong);delete window.TB;const c=BT.dev.reso(BT.BY.kimchung);return{blocked,a,b,c}}""")
    chk('Kim Chung Tráo đỡ sát thương', r['blocked'], r)
    chk('cộng hưởng vũ khí cùng hệ, an toàn khi thiếu TB', r['a'] and not r['b'] and not r['c'], r)
    pg.wait_for_timeout(300)
    chk('ô 1 sáng cộng hưởng khi TB cùng hệ', pg.evaluate("window.TB={elemOf:()=> 'kim'};BT.equip('kimchung',0);new Promise(r=>setTimeout(()=>{const v=document.querySelector('#s3').classList.contains('reso');delete window.TB;r(v)},1500))"))
    shot(pg, 'phone_hud')
    tab(pg, 'lib'); pg.evaluate("()=>{BT._s.sel='namquoc';HUB.refresh()}"); shot(pg, 'phone_lib_full')
    chk('chấm đỏ HUB không lỗi', pg.evaluate("typeof HUB.tabs.find(t=>t.id==='bitich').dot()==='boolean'"))
    print('phone errors', errs[:6]); E1 = list(errs)
    b.close()

    # ---------- lưu cũ không có khóa bikip ----------
    b, ctx, pg, errs = open_page(p, LAND2)
    new_game(pg, 'kiem')
    pg.evaluate("()=>{const S=G.save;delete S.bikip;S.cleared=[0,1];S.lvl=20;S.tower={best:23};saveGame()}")
    pg.reload(); pg.wait_for_timeout(1200); pg.click('#tCont'); pg.wait_for_timeout(600)
    pg.evaluate("()=>{const b=document.getElementById('stGo');if(b&&!document.getElementById('story').hidden)b.click()}")
    pg.evaluate("()=>{for(let i=0;i<120;i++)update(1/60)}"); pg.wait_for_timeout(400)
    r = pg.evaluate("()=>{const s=G.save.bikip;return{v:s&&s.v,own:s&&Object.keys(s.own),tw:s&&s.tw,first:s&&s.first}}")
    chk('lưu cũ: khóa tạo lười, sách bù, không dồn thưởng tháp', r['v'] == 1 and r['own'] == ['loidinh'] and r['tw'] == 4, r)
    shot(pg, 'land_hud')
    tab(pg, 'lib'); shot(pg, 'land_lib')
    o = overflow(pg); chk('ngang: không tràn', o['sw'] <= o['cw'], o)
    print('land errors', errs[:6]); E2 = list(errs)
    b.close()

    # ---------- máy tính ----------
    b, ctx, pg, errs = open_page(p, DESK)
    new_game(pg, 'phap')
    pg.evaluate(MKCHAR, [60, 8, 3])
    pg.evaluate("()=>{progEnsure();G.save.prog.realm=5;recalc();BT.st().offer=1;BT.dev.all();BT.st().phe='ta';BT.equip('trieudang',0);BT.equip('huyetma',1);BT.equip('lietduong',0);BT.equip('thuynguyet',1)}")
    tab(pg, 'lib'); pg.evaluate("()=>{BT._s.sel='trieudang';HUB.refresh()}"); shot(pg, 'desk_lib')
    tab(pg, 'shop'); shot(pg, 'desk_shop')
    pg.evaluate("UI.close()")
    pg.evaluate("()=>{G.p.x=G.W.out.x;G.p.y=G.W.out.y-220;for(let k=0;k<8;k++)spawnEnemy('linhtrieu',G.p.x+110+(k%4)*30,G.p.y-40+Math.floor(k/4)*70,30,false);G.lastTarget=G.enemies[2];G.p.skCd[3]=G.p.skCd[4]=0;G.p.mp=G.p.maxmp}")
    pg.keyboard.press('u'); pg.wait_for_timeout(700); shot(pg, 'desk_whirl')
    pg.keyboard.press('o'); pg.wait_for_timeout(450); shot(pg, 'desk_blood')
    chk('phím O tung ô 2', pg.evaluate("G.p.skCd[4]>0"))
    print('desk errors', errs[:6]); E3 = list(errs)
    b.close()

allerr = [e for e in E1 + E2 + E3 if e[0] == 'pageerror' or e[0] == 'console.error']
chk('không có lỗi JS', not allerr, allerr[:5])
print(f'\n{len(ok)} pass, {len(bad)} fail', bad)

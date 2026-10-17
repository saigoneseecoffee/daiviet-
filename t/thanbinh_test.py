# Kiểm thử Thần Binh (thanbinh.js): python3 thanbinh_test.py [phone|se|land|desk]
# DVHK_HTML=$(pwd)/../dist/agent_thanbinh.html
import sys, json, os
from harness import *
mode = sys.argv[1] if len(sys.argv) > 1 else 'phone'
OPTS = {'phone': PHONE, 'se': SE, 'land': LAND, 'desk': DESK}[mode]
touch = mode != 'desk'
full = mode in ('phone', 'desk')
R = []
def ok(n, c, x=''):
    R.append(bool(c)); print(('PASS ' if c else 'FAIL ') + n, x, flush=True)
os.makedirs('shots', exist_ok=True)

OLD = """()=>{const s=newSave('dao','Bảo Cũ');Object.assign(s,{lvl:30,gold:90000,ore:300,map:2,unlocked:3,cleared:[0,1],qs:[4,4,0,0,0,0]});
  s.equip.vk={id:s.iid++,slot:'vk',ilvl:30,rar:3,st:{atk:150},aff:[['crit',4]],enh:5,name:'Song Đao Thép',cls:'dao'};
  for(const sl of ['mu','ao','dai','giay','boi'])s.equip[sl]={id:s.iid++,slot:sl,ilvl:30,rar:1,st:{hp:200,def:30},aff:[],enh:3,name:'Đồ cũ'};
  s.bag=[{id:s.iid++,slot:'vk',ilvl:28,rar:2,st:{atk:120},aff:[],enh:0,name:'Song Đao Sắt',cls:'dao'}];
  localStorage.setItem(SAVE_KEY,JSON.stringify(s));return 1}"""

# chạy một trận mô phỏng có Thần Tính k, trả về số lần kích hoạt
PROC = """([k,secs,boss])=>{const S=G.save,p=G.p,W=G.W;window.TB.set(k,5,1);const st0=(window.TB.stats[k]||{n:0}).n;
  const ti=W.spawnTiles[(W.spawnTiles.length*0.5)|0];p.x=(ti%MW+0.5)*T;p.y=(((ti/MW)|0)+0.5)*T;G.enemies=[];G.projs=[];G.timers=[];p.hp=p.maxhp*0.6;
  const es=[];for(let i=0;i<4;i++){const a=i/4*TAU;const e=spawnEnemy(curMap().enemies[0][0],p.x+50+Math.cos(a)*30,p.y+Math.sin(a)*30,S.lvl,false);e.max=e.hp=1e9;if(boss&&i===0)e.boss=true;es.push(e)}
  const dt=1/60;G.input.atk=true;let frozen=0,vul=0,burn=0,shred=0;
  for(let i=0;i<secs*60;i++){G.spawnT=99;p.ifr=9;p.mp=p.maxmp;G.state='play';G.paused=false;for(const e of es){if(e.hp<1e8)e.hp=1e9;if(dist(e.x,e.y,p.x,p.y)>80){e.x=p.x+rand(30,55);e.y=p.y+rand(-25,25)}}
    update(dt);for(const e of es){const s=e._tb;if(!s)continue;if(s.frz>0)frozen=1;if(s.vul>0)vul=1;if(s.bu>0)burn=1;if(s.sh>0)shred=1}
    if(i>120&&(window.TB.stats[k]||{n:0}).n-st0>=3&&!boss)break}
  G.input.atk=false;for(const e of es)e.boss=false;G.enemies=[];
  return{n:(window.TB.stats[k]||{n:0}).n-st0,frozen,vul,burn,shred,hp:Math.round(p.hp/p.maxhp*100)}}"""

with sync_playwright() as p:
    b, ctx, pg, errs = open_page(p, OPTS)
    ev = pg.evaluate
    W, H = OPTS['viewport']['width'], OPTS['viewport']['height']
    shot = lambda n: pg.screenshot(path=f'shots/thanbinh_{mode}_{n}.png', timeout=90000)
    pg.set_default_timeout(60000)
    def tap(sel):
        el = pg.locator(sel).first; el.wait_for(state='visible', timeout=30000)
        el.evaluate("e=>e.scrollIntoView({block:'center'})"); pg.wait_for_timeout(150)
        bb = el.bounding_box()
        x, y = bb['x'] + bb['width'] / 2, bb['y'] + bb['height'] / 2
        if touch: pg.touchscreen.tap(x, y)
        else: pg.mouse.click(x, y)
        pg.wait_for_timeout(250)
    def perks(): ev("(()=>{let n=0;while(window.PERKS&&(PERKS.offerPending()||PERKS.showing())&&n++<60)PERKS.pickAuto()})()")
    def noover(tag):
        o = overflow(pg); ok(f'không tràn ngang ({tag})', o['sw'] <= o['cw'] + 1 and o['bw'] <= o['cw'] + 1, str(o))
        sh = ev("(()=>{const b=document.getElementById('shBody');return b?[b.scrollWidth,b.clientWidth]:[0,0]})()")
        ok(f'bảng không tràn ngang ({tag})', sh[0] <= sh[1] + 1, str(sh))

    # ---------- 1. bản lưu cũ: không có G.save.tb, vũ khí Truyền Thuyết chưa có Thần Tính ----------
    ev(OLD); pg.reload(); pg.wait_for_timeout(1200)
    pg.click('#tCont'); pg.wait_for_timeout(600)
    if pg.is_visible('#stGo'): pg.click('#stGo')
    pg.wait_for_timeout(800); perks()
    s = ev("({tb:G.save.tb,tt:G.save.equip.vk.tt||null,el:window.TB.elemOf(G.save.equip.vk),tr:window.TB.traitOf(G.save.equip.vk),n:window.TB.elemOf(null),hp:G.p.hp>0})")
    ok('bản lưu cũ nạp được, vũ khí cũ không có Thần Tính', s['tt'] is None and s['el'] is None and s['tr'] is None and s['n'] is None and s['hp'], json.dumps(s, ensure_ascii=False))
    ev("G.save.set.sfx=false;G.save.set.music=false;G.save.tut={move:true,atk:true,skill:true,equip:true,forge:true,mount:true};document.getElementById('offer').hidden=true")
    ok('chấm đỏ Võ Đạo báo vũ khí chưa khai mở', ev("window.HUB.tabs.find(t=>t.id==='thanbinh').dot()"))
    # mở Lò Rèn, khai mở bằng giao diện
    ev("UI.forgeSel=G.save.equip.vk.id;UI.open('forge')"); pg.wait_for_timeout(400)
    ok('Lò Rèn có mục Rèn Thần Tính (khai mở)', pg.is_visible('#tbRe') and 'Khai mở' in pg.inner_text('#tbRe'))
    ore0, gold0 = ev("[G.save.ore,G.save.gold]")
    tap('#tbRe'); ok('hỏi xác nhận trước khi khai mở', pg.is_visible('#confirm'))
    tap('#cfYes'); pg.wait_for_timeout(500)
    s = ev("({tt:G.save.equip.vk.tt,ore:G.save.ore,gold:G.save.gold})")
    ok('khai mở xong có Thần Tính và trừ tài nguyên', s['tt'] and s['ore'] < ore0 and s['gold'] < gold0, json.dumps(s))
    ok('mục rèn hiện thẻ Thần Tính và 2 nút', pg.is_visible('#tbBox .tbmini') and pg.is_visible('#tbUp'))
    if full: noover('forge'); pg.locator('#tbBox').scroll_into_view_if_needed(); pg.wait_for_timeout(700); shot('forge')
    # tẩy Thần Tính
    k0 = s['tt']['k']; lv0 = s['tt']['lv']
    tap('#tbRe'); ok('tẩy có bước xác nhận', pg.is_visible('#confirm'))
    tap('#cfNo'); ok('hủy thì không đổi', ev("G.save.equip.vk.tt.k") == k0)
    tap('#tbRe'); tap('#cfYes'); pg.wait_for_timeout(400)
    s = ev("G.save.equip.vk.tt")
    ok('tẩy ra Thần Tính khác, giữ cấp', s['k'] != k0 and s['lv'] == lv0, f'{k0} -> {s}')
    # thăng cấp
    tap('#tbUp'); tap('#cfYes'); pg.wait_for_timeout(400)
    ok('thăng cấp +1', ev("G.save.equip.vk.tt.lv") == lv0 + 1)
    ev("G.save.ore=0"); ev("UI.render()"); tap('#tbUp')
    ok('thiếu Huyền Thiết thì báo, không mở xác nhận', not pg.is_visible('#confirm'))
    ev("G.save.ore=300;UI.close()")
    # lưu rồi nạp lại giữ Thần Tính
    tt = ev("G.save.equip.vk.tt"); ev("saveGame()"); pg.reload(); pg.wait_for_timeout(1200); pg.click('#tCont'); pg.wait_for_timeout(600)
    if pg.is_visible('#stGo'): pg.click('#stGo')
    pg.wait_for_timeout(500); perks()
    ok('nạp lại giữ Thần Tính', ev("G.save.equip.vk.tt") == tt and isinstance(ev("G.save.tb.seen"), list))
    ev("G.save.set.sfx=false;G.save.set.music=false;document.getElementById('offer').hidden=true")

    # ---------- 2. đồ rơi có Thần Tính ----------
    d = ev("""(()=>{const out={byR:{},keys:{},q2:{},bad:0,arm:0};for(let r=0;r<=5;r++){let n=0,q=0;for(let i=0;i<200;i++){const it=genItem(randi(1,120),r,'vk');if(it.tt){n++;out.keys[it.tt.k]=1;if(it.tt.q>1)q++;
        if(it.tt.lv<1||it.tt.lv>window.TB.lvCap(it))out.bad++;if(!window.TB.elemOf(it))out.bad++}}out.byR[r]=n;out.q2[r]=q}
      for(let i=0;i<100;i++)if(genItem(50,4,'ao').tt)out.arm++;out.leg=!!(LEGEND.make('thuanthien',40).tt);return out})()""")
    ok('Thường/Tinh Xảo không có Thần Tính', d['byR']['0'] == 0 and d['byR']['1'] == 0, json.dumps(d['byR']))
    ok('Hiếm trở lên luôn có Thần Tính', all(d['byR'][str(r)] == 200 for r in (2, 3, 4, 5)))
    ok('chỉ Truyền Thuyết trở lên ra Thượng Thần Tính', d['q2']['2'] == 0 and d['q2']['3'] > 30 and d['q2']['4'] > 80, json.dumps(d['q2']))
    ok('ra đủ 11 loại, cấp và hệ hợp lệ', len(d['keys']) >= 11 and d['bad'] == 0, str(len(d['keys'])))
    ok('giáp không có Thần Tính', d['arm'] == 0)
    ok('đồ Huyền Thoại cũng có Thần Tính (cộng dồn hiệu ứng riêng)', d['leg'])

    # ---------- 3. mọi Thần Tính đều kích hoạt trong trận ----------
    ev("G.save.lvl=40;for(const sl of SLOTS){const it=genItem(40,3,sl);it.enh=5;G.save.equip[sl]=it}recalc();updateLook()")
    keys = ev("Object.keys(window.TB.TRAITS)")
    ne = len(errs)
    for k in keys:
        r = ev(PROC, [k, 25, False])
        extra = {'liethoa': r['burn'], 'hanbang': r['frozen'], 'xuyengiap': r['shred']}.get(k, 1)
        ok(f'Thần Tính {k} kích hoạt', r['n'] > 0 and extra, json.dumps(r))
    r = ev(PROC, ['hanbang', 8, True]); ok('Hàn Băng lên boss: không đóng băng mà Băng Phá', r['vul'] == 1, json.dumps(r))
    ok('không lỗi JS khi đánh', len(errs) == ne, str(errs[ne:ne + 3]))
    ok('Thần Tính khác lớp (o.proc) không đệ quy', ev("Object.values(window.TB.stats).every(s=>s.n<5000)"))

    # ---------- 4. thẻ vật phẩm, ô vật phẩm, bảng gợi ý ----------
    ev("window.TB.set('phikiem',7,2);G.save.bag=[];for(let i=0;i<6;i++){const it=genItem(40,2+(i%3),'vk');G.save.bag.push(it)}G.save.bag.push(genItem(40,1,'mu'));UI.sel=G.save.bag[0].id;UI.open('bag')")
    pg.wait_for_timeout(400)
    ok('ô vật phẩm có huy hiệu hệ', pg.locator('.bag .cell .tbel').count() >= 6)
    ok('thẻ vật phẩm hiện Thần Tính', pg.locator('.detail .tbfx').count() >= 1)
    if full:
        noover('bag'); pg.locator('.detail').scroll_into_view_if_needed(); pg.wait_for_timeout(300); shot('bag')
    ev("UI.close()")
    ev("UI.offerEquip(genItem(45,3,'vk'))"); pg.wait_for_timeout(400)
    try: pg.wait_for_selector('#offer .tbov', state='visible', timeout=8000)
    except Exception: pass
    ok('bảng gợi ý trang bị có dòng Thần Tính', ev("!!document.querySelector('#offer .tbov')&&!document.getElementById('offer').hidden"))
    if full: shot('offer')
    ev("document.getElementById('offer').hidden=true")

    # ---------- 5. thẻ Thần Binh trong Võ Đạo ----------
    ev("window.HUB.show('thanbinh')"); pg.wait_for_timeout(500)
    ok('thẻ Thần Binh mở', pg.is_visible('.tbhero') and 'Phi Kiếm' in pg.inner_text('.tbhero'))
    ok('sổ Thần Tính có 11 mục', pg.locator('.tbcodex .tbc').count() == 11)
    ok('sổ có mục đã gặp và chưa gặp', pg.locator('.tbcodex .tbc.on').count() >= 1)
    noover('hub'); shot('hub')
    pg.locator('.tbcodex').scroll_into_view_if_needed(); pg.wait_for_timeout(300); shot('codex')
    ev("G.p.hp=G.p.maxhp;window.HUB.show('thanbinh')"); pg.wait_for_timeout(400); tap('#tbGo'); ok('nút Rèn chuyển sang Lò Rèn', ev("UI.panel") == 'forge')
    ev("UI.close()")
    # thẻ khi chưa có vũ khí Hiếm
    ev("const w=genItem(40,1,'vk');G.save.equip.vk=w;recalc();window.HUB.show('thanbinh')"); pg.wait_for_timeout(300)
    ok('thẻ Thần Binh khi chưa có', pg.is_visible('.tbhero.none'))
    ev("UI.close()")

    # ---------- 6. ảnh trận đánh ----------
    if full:
        SCN = """(k)=>{const S=G.save,p=G.p,W=G.W;const w=genItem(40,4,'vk');S.equip.vk=w;w.tt={k,lv:Math.min(8,window.TB.lvCap(w)),q:2};recalc();
          const ti=W.spawnTiles[(W.spawnTiles.length*0.5)|0];p.x=(ti%MW+0.5)*T;p.y=(((ti/MW)|0)+0.5)*T;G.cam.x=p.x;G.cam.y=p.y;G.enemies=[];G.projs=[];
          for(let i=0;i<5;i++){const a=i/5*TAU;const e=spawnEnemy(curMap().enemies[0][0],p.x+70+Math.cos(a)*45,p.y+Math.sin(a)*40,S.lvl,false);e.max=e.hp=1e9}
          if(!window.__inv){window.__inv=1;HK.on('tick',()=>{if(window.__god){const p=G.p;p.ifr=1;G.spawnT=99;p.hp=Math.max(p.hp,p.maxhp*0.5);for(const e of G.enemies)if(dist(e.x,e.y,p.x,p.y)>110){e.x=p.x+rand(40,70);e.y=p.y+rand(-30,30)}}})}window.__god=1;G.input.atk=true;return 1}"""
        for k, t in [('phikiem', 1500), ('loian', 2600), ('hanbang', 3000), ('liethoa', 1800), ('truyhon', 2300), ('xuyengiap', 2500), ('moclinh', 1600), ('chandia', 2700)]:
            ev(SCN, k); pg.wait_for_timeout(t); shot('fx_' + k)
        ev("G.input.atk=false;window.__god=0")
    ok('không lỗi JS', not errs, str(errs[:5]))
    print(f'{sum(R)}/{len(R)} PASS', flush=True)
    b.close()

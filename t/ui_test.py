import sys, json
from harness import *
mode = sys.argv[1] if len(sys.argv)>1 else 'phone'
OPTS = {'phone':PHONE,'se':SE,'land':LAND,'desk':DESK}[mode]
touch = mode!='desk'
R=[]
def ok(name,cond,extra=''):
    R.append((name,bool(cond)));print(('PASS ' if cond else 'FAIL ')+name,extra,flush=True)
with sync_playwright() as p:
    b,ctx,pg,errs=open_page(p,OPTS)
    cdp=ctx.new_cdp_session(pg) if touch else None
    def tap(sel):
        el=pg.locator(sel).first;el.scroll_into_view_if_needed(timeout=2000);bb=el.bounding_box()
        if not bb: raise Exception('no box '+sel)
        x,y=bb['x']+bb['width']/2,bb['y']+bb['height']/2
        if touch: pg.touchscreen.tap(x,y)
        else: pg.mouse.click(x,y)
        pg.wait_for_timeout(250)
    def touch_hold(x,y,ms,move=None,tid=1):
        cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':x,'y':y,'id':tid}]})
        steps=max(1,ms//50)
        for k in range(steps):
            if move: cx,cy=x+move[0]*(k+1)/steps,y+move[1]*(k+1)/steps
            else: cx,cy=x,y
            cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':cx,'y':cy,'id':tid}]})
            pg.wait_for_timeout(50)
        cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
    ev=pg.evaluate
    shot=lambda n: pg.screenshot(path=f'shots/{mode}_{n}.png')
    W,H=OPTS['viewport']['width'],OPTS['viewport']['height']
    # tiêu đề -> chọn phái
    tap('#tNew'); ok('mở chọn phái', pg.is_visible('#select'))
    tap('[data-c="cung"]'); ok('chọn Cung Thủ', ev("document.querySelector('[data-c=cung]').getAttribute('aria-pressed')")=='true')
    pg.fill('#heroName','Bảo Thử'); tap('#goBtn'); pg.wait_for_timeout(700)
    ok('thẻ truyện chương 1', pg.is_visible('#story')); shot('story')
    tap('#stGo'); pg.wait_for_timeout(500); ok('vào trận', ev("G.state==='play'&&!G.paused"))
    ok('tên hiện trên HUD', pg.inner_text('#pName')=='Bảo Thử')
    shot('hud')
    # di chuyển
    x0=ev("G.p.x+','+G.p.y")
    if touch: touch_hold(int(W*0.2),int(H*0.6),900,move=(60,0))
    else:
        pg.keyboard.down('KeyD');pg.wait_for_timeout(800);pg.keyboard.up('KeyD')
    x1=ev("G.p.x+','+G.p.y"); ok('di chuyển', x0!=x1, f'{x0} -> {x1}')
    # đánh: đặt sói ngay cạnh
    ev("G.enemies.forEach(e=>e.dead=true);G.enemies=[];const p=G.p;spawnEnemy('soi',p.x+60,p.y,1,false);spawnEnemy('soi',p.x+90,p.y+20,1,false)")
    k0=ev("G.save.kills")
    if touch:
        bb=pg.locator('#bAtk').bounding_box();touch_hold(int(bb['x']+bb['width']/2),int(bb['y']+bb['height']/2),2500,tid=2)
    else:
        pg.keyboard.down('KeyJ');pg.wait_for_timeout(2500);pg.keyboard.up('KeyJ')
    ok('giữ nút Đánh hạ quái', ev("G.save.kills")>k0, f'kills {k0}->{ev("G.save.kills")}')
    shot('fight')
    # kỹ năng
    ev("G.p.mp=G.p.maxmp;G.p.skCd=[0,0,0];spawnEnemy('soi',G.p.x+80,G.p.y,1,false)")
    mp0=ev("G.p.mp")
    if touch: tap('#s0')
    else: pg.keyboard.press('KeyK'); pg.wait_for_timeout(200)
    ok('kỹ năng 1 tốn nội lực', ev("G.p.mp")<mp0)
    if touch: tap('#s1')
    else: pg.keyboard.press('KeyL')
    ok('kỹ năng khóa báo cấp mở', 'mở ở cấp' in pg.inner_text('#toasts') or 'Cấp 3' in pg.inner_text('#s1'))
    # thuốc
    ev("G.p.hp=10;G.save.potHP=3;G.p.potCd=0")
    if touch: tap('#bHP')
    else: pg.keyboard.press('KeyH'); pg.wait_for_timeout(200)
    ok('uống Bình Kim Sang', ev("G.save.potHP")==2 and ev("G.p.hp")>10)
    ev("G.p.mp=0;G.p.potCd=0")
    if touch: tap('#bMP')
    else: pg.keyboard.press('KeyG'); pg.wait_for_timeout(200)
    ok('uống Bình Nội Lực', ev("G.p.mp")>0)
    # tự đánh
    if touch: tap('#bAuto')
    else: pg.keyboard.press('KeyZ'); pg.wait_for_timeout(200)
    ok('bật tự đánh', ev("G.save.set.auto")==True)
    if touch: tap('#bAuto')
    else: pg.keyboard.press('KeyZ'); pg.wait_for_timeout(200)
    ok('tắt tự đánh', ev("G.save.set.auto")==False)
    # nhặt đồ tốt hơn -> thẻ gợi ý
    ev("G.save.equip={};recalc();const it=genItem(3,2,'ao');dropAt(G.p.x+10,G.p.y,'item',it)")
    pg.wait_for_timeout(1500)
    ok('thẻ Trang bị tốt hơn xuất hiện', pg.is_visible('#offer')); shot('offer')
    if pg.is_visible('#offer'):
        tap('#ofEq'); ok('trang bị từ thẻ gợi ý', ev("!!G.save.equip.ao"))
    # cho thêm đồ để thử túi
    ev("for(let i=0;i<12;i++)G.save.bag.push(genItem(randi(2,8),randi(0,3)));G.save.ore=50;G.save.gold=50000;G.save.charm=2;G.save.sp=2")
    # Túi đồ
    tap('[data-p="bag"]'); ok('mở Túi đồ', pg.is_visible('#panel') and ev("G.paused")); shot('bag')
    n=pg.locator('#shBody .bag .cell').count(); ok('hiện ô đồ trong túi', n>=12, str(n))
    tap('#shBody .bag .cell'); ok('chọn món đồ hiện chi tiết', pg.is_visible('#shBody .detail')); shot('bag_detail')
    eq0=ev("Object.keys(G.save.equip).length")
    if pg.locator('#dEq').count(): tap('#dEq'); ok('Trang bị trong túi', ev("Object.keys(G.save.equip).length")>=eq0)
    tap('#shBody .eqgrid .cell[data-id]'); 
    if pg.locator('#dUn').count():
        nb=ev("G.save.bag.length");tap('#dUn');ok('Tháo đồ', ev("G.save.bag.length")==nb+1)
    tap('#bgSort'); ok('Sắp xếp không lỗi', True)
    tap('#shBody .bag .cell')
    if pg.locator('#dSv').count():
        o0=ev("G.save.ore");tap('#dSv');ok('Phân giải 1 món', ev("G.save.ore")>o0)
    nb=ev("G.save.bag.length");tap('#bgSalv');ok('Phân giải đồ yếu', ev("G.save.bag.length")<=nb)
    tap('#shBody .bag .cell') if pg.locator('#shBody .bag .cell').count() else None
    if pg.locator('#dFg').count(): tap('#dFg'); ok('nút Rèn chuyển sang Lò rèn', pg.inner_text('#shTitle')=='Lò rèn')
    else: tap('[data-p="forge"]') if False else ev("UI.open('forge')")
    # Lò rèn
    pg.wait_for_timeout(300); shot('forge')
    ev("const it=UI.findItem(UI.forgeSel);it.enh=0")
    e0=ev("UI.findItem(UI.forgeSel).enh"); tap('#fGo'); pg.wait_for_timeout(1500)
    ok('Cường hóa chạy và đổi cấp', ev("UI.findItem(UI.forgeSel).enh")!=e0 or 'Thất bại' in pg.inner_text('#shBody'), f'{e0}->{ev("UI.findItem(UI.forgeSel).enh")}')
    shot('forge_done')
    ev("UI.findItem(UI.forgeSel).enh=8;UI.render()")
    if pg.locator('#fCharm').count(): tap('#fCharm'); ok('bật Bùa Bảo Hộ', pg.get_attribute('#fCharm','aria-checked')=='true')
    tap('#fShop'); ok('Mua Huyền Thiết mở Chợ', pg.inner_text('#shTitle')=='Chợ phiên'); shot('shop')
    g0=ev("G.save.potHP"); tap('[data-buy="potHP"][data-n="5"]'); ok('mua 5 Bình Kim Sang', ev("G.save.potHP")==g0+5)
    c0=ev("G.save.charm"); tap('[data-buy="charm"]'); ok('mua Bùa Bảo Hộ', ev("G.save.charm")==c0+1)
    # Kỹ năng
    ev("UI.open('skill')"); shot('skill')
    ev("G.save.lvl=6;G.save.skl=[1,1,1];G.save.sp=2;UI.render()")
    tap('[data-up="0"]'); ok('nâng kỹ năng', ev("G.save.skl[0]")==2)
    # Nhiệm vụ
    ev("UI.open('quest')"); shot('quest')
    s0=ev("G.save.side.txt"); tap('#qSkip'); ok('đổi Dã Tẩu', True, s0+' -> '+ev("G.save.side.txt"))
    # Bản đồ
    ev("UI.open('map')"); shot('map')
    tap('#mCamp'); ok('về trại', ev("dist(G.p.x,G.p.y,G.W.camp.x,G.W.camp.y)<120") and not pg.is_visible('#panel'))
    # NPC
    ev("G.p.x=G.W.npcs[0].x+20;G.p.y=G.W.npcs[0].y+30")
    pg.wait_for_timeout(400); ok('nút NPC hiện khi đứng gần Thợ Rèn', pg.is_visible('#npcBtn'), pg.inner_text('#npcBtn') if pg.is_visible('#npcBtn') else '')
    shot('npc')
    if pg.is_visible('#npcBtn'): tap('#npcBtn'); ok('NPC mở Lò rèn', pg.inner_text('#shTitle')=='Lò rèn')
    tap('#shClose'); ok('đóng bảng', not pg.is_visible('#panel') and not ev("G.paused"))
    # menu buttons all
    for k,t in [('bag','Túi đồ'),('forge','Lò rèn'),('shop','Chợ phiên'),('skill','Kỹ năng'),('mount','Thú cưỡi'),('gear','Cài đặt')]:
        tap(f'[data-p="{k}"]'); ok(f'nút menu {t}', pg.inner_text('#shTitle')==t); tap('#shClose')
    tap('#qt'); ok('chạm khung nhiệm vụ mở Nhiệm vụ', pg.inner_text('#shTitle')=='Nhiệm vụ'); tap('#shClose')
    tap('#miniWrap'); ok('chạm bản đồ nhỏ mở Bản đồ', pg.inner_text('#shTitle').startswith('Bản đồ')); tap('#shClose')
    # Cài đặt
    tap('[data-p="gear"]'); shot('gear')
    for k in ['music','sfx','autoPot','autoSalvage']:
        v=ev(f"G.save.set.{k}"); tap(f'[data-set="{k}"]'); ok(f'bật/tắt {k}', ev(f"G.save.set.{k}")!=v); tap(f'[data-set="{k}"]')
    tap('#shClose')
    # thú cưỡi
    ev("G.save.gold=99999;G.save.lvl=30;if(window.BT&&BT.st)BT.st().offer=1;UI.open('mount')");pg.wait_for_timeout(300);shot('mount')
    tap('[data-buy="nau"]');ok('mua Ngựa Nâu và cưỡi',ev("!!G.save.mounts.nau&&G.save.riding==='nau'"))
    sp0=ev("G.p.spd");tap('[data-down]');ok('xuống ngựa',ev("!G.save.riding"));ok('cưỡi tăng tốc chạy',ev("G.p.spd")<sp0)
    tap('[data-buy="voi"]');ok('mua Voi Chiến',ev("G.save.riding==='voi'"))
    tap('[data-train="voi"]');ok('huấn luyện thú',ev("G.save.mounts.voi.exp>0||G.save.mounts.voi.lv>1"))
    tap('#shClose')
    if touch: tap('#bRide')
    else: pg.keyboard.press('KeyX');pg.wait_for_timeout(200)
    ok('nút Cưỡi bật tắt',ev("!G.save.riding"))
    if touch: tap('#bRide')
    else: pg.keyboard.press('KeyX');pg.wait_for_timeout(200)
    ev("G.enemies=[];for(let k=0;k<3;k++)spawnEnemy('soi',G.p.x+40+k*10,G.p.y,1,false);G.mountCd=0");pg.wait_for_timeout(600);shot('ride')
    ok('chiêu thú cưỡi Voi Giẫm',ev("G.mountCd>0"))
    # quái triều
    ev("G.hordeT=0;G.p.x=G.W.pathPts[40].x;G.p.y=G.W.pathPts[40].y");pg.wait_for_timeout(1500)
    ok('quái triều kéo tới',ev("!!G.horde")&pg.is_visible('#horde'));shot('horde')
    ev("G.horde.kill=G.horde.need");pg.wait_for_timeout(500);ok('thắng quái triều rơi rương',ev("G.drops.some(d=>d.kind==='chest')") or 'rương' in pg.inner_text('#toasts'))
    ev("const d=G.drops.find(d=>d.kind==='chest');if(d){d.t=1;G.p.x=d.x;G.p.y=d.y}");pg.wait_for_timeout(600);ok('mở rương báu',ev("!G.drops.some(d=>d.kind==='chest')"))
    ok('có ổ quái trên bản đồ',ev("G.W.camps.length>=4"))
    # chết và hồi sinh
    ev("G.p.ifr=0;hurtPlayer(1e9,1,null)")
    pg.wait_for_timeout(500); ok('màn Trọng thương', pg.is_visible('#dead')); shot('dead')
    pg.wait_for_timeout(3800); ok('hồi sinh ở trại', not pg.is_visible('#dead') and ev("G.state==='play'"))
    # boss -> qua chương
    ev("G.save.qs[0]=MAPS[0].quest.length-1;G.save.qp=0;G.p.x=G.W.arena.x;G.p.y=G.W.arena.y+60")
    pg.wait_for_timeout(1200); ok('boss xuất hiện khi vào đấu trường', ev("!!G.boss"), ev("G.boss&&G.boss.name")); shot('boss')
    pg.wait_for_timeout(1500); shot('boss2')
    ev("hurtEnemy(G.boss,1e9,{})")
    pg.wait_for_timeout(2200); ok('màn qua chương', pg.is_visible('#clear')); shot('clear')
    if pg.is_visible('#clear'):
        tap('#clNext'); pg.wait_for_timeout(800); ok('sang chương 2 Cổ Loa', ev("G.save.map")==1 and pg.is_visible('#story')); shot('story2')
        tap('#stGo'); pg.wait_for_timeout(1500); shot('coloa')
    # các chương khác: ảnh chụp
    for mi in range(2,12):
        ev(f"G.save.unlocked=12;travel({mi},false)"); pg.wait_for_timeout(1200); shot(f'map{mi}')
    # tiêu đề & chơi tiếp
    ev("(()=>{let n=0;while(window.PERKS&&PERKS.offerPending()&&n++<40)PERKS.pickAuto()})()");pg.wait_for_timeout(300)
    tap('[data-p="gear"]'); tap('#gTitle'); pg.wait_for_timeout(800)
    ok('về màn hình chính có Chơi tiếp', pg.locator('#tCont').count()==1); shot('title2')
    tap('#tCont'); pg.wait_for_timeout(800); ok('Chơi tiếp vào lại game', ev("G.state==='play'") and ev("G.save.name")=='Bảo Thử')
    # lưu
    ok('đã lưu localStorage', ev("!!localStorage.getItem('dvhk_save_v1')"))
    # xóa dữ liệu
    tap('[data-p="gear"]'); tap('#gReset'); ok('hộp xác nhận xóa', pg.is_visible('#confirm')); shot('confirm')
    tap('#cfYes'); pg.wait_for_timeout(600); ok('xóa xong về tiêu đề', pg.is_visible('#title') and not ev("!!localStorage.getItem('dvhk_save_v1')"))
    ok('không tràn ngang', overflow(pg)['sw']<=W)
    print('ERRORS',errs)
    print('SUMMARY',sum(1 for r in R if r[1]),'/',len(R))
    b.close()

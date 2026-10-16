import sys
from harness import *
# Ảnh chụp kiểm tra Đồ Huyền Thoại và Ép đồ. Chạy: DVHK_HTML=.../agent_legend.html python3 legend_shots.py [phone|desk|se|land]
modes = sys.argv[1:] or ['phone', 'desk']
OPT = {'phone': PHONE, 'desk': DESK, 'se': SE, 'land': LAND}
START = "G.save.tut={move:1,atk:1,equip:1,skill:1,forge:1};G.save.lvl=14;G.save.gold=99999;G.save.ore=500;G.save.charm=0;recalc();"
with sync_playwright() as p:
    for m in modes:
        b, ctx, pg, errs = open_page(p, OPT[m])
        ev = pg.evaluate
        shot = lambda n: pg.screenshot(path=f'shots/legend_{m}_{n}.png')
        pg.click('#tNew'); pg.click('[data-c="kiem"]'); pg.click('#goBtn'); pg.wait_for_timeout(300); pg.click('#stGo')
        ev(START)
        # đồ trên đất
        ev("""const p=G.p;p.x=G.W.camp.x+700;p.y=G.W.camp.y;resolve(G.W,p);G.enemies.length=0;LEGEND.drop(p.x+20,p.y-150,14,'thuanthien');dropAt(p.x-110,p.y-120,'item',genItem(14,3));dropAt(p.x+130,p.y-110,'item',genItem(14,4))""")
        pg.wait_for_timeout(700); ev("G.paused=true"); shot('drop')
        ev("G.drops.length=0;G.paused=false")
        # túi đồ: một món huyền thoại được chọn
        ev("""const S=G.save;for(const sl of SLOTS)S.equip[sl]=genItem(14,2,sl);
          const a=LEGEND.make('thuanthien',14),b=LEGEND.make('longquan',14),c=LEGEND.make('hungdao',14);S.bag.push(a,b,c);for(let i=0;i<6;i++)S.bag.push(genItem(randi(8,16),randi(0,4)));
          recalc();updateLook();UI.sel=a.id;UI.open('bag')""")
        pg.wait_for_timeout(600)
        ev("document.querySelector('#shBody .detail').scrollIntoView()"); pg.wait_for_timeout(200)
        shot('bag')
        ok_over = overflow(pg); print(m, 'overflow bag', ok_over)
        # trang bị rồi chụp ô đang mặc + sổ
        ev("const it=UI.findItem(UI.sel);equipItem(it);UI.render()"); pg.wait_for_timeout(300)
        ev("document.querySelector('#shBody').scrollTop=0"); shot('bag_top')
        # lò rèn: trước khi rèn (+11, rủi ro vỡ)
        ev("const S=G.save;const w=S.equip.ao;w.enh=11;UI.forgeSel=w.id;UI.useCharm=false;UI.open('forge')"); pg.wait_for_timeout(500)
        shot('forge_before'); print(m, 'overflow forge', overflow(pg))
        # thành công
        ev("Math._r=Math.random;Math.random=()=>0.01")
        pg.click('#fGo'); pg.wait_for_timeout(250); shot('forge_armed'); pg.click('#fGo'); pg.wait_for_timeout(1300); shot('forge_success')
        # thất bại tụt cấp
        ev("Math.random=()=>0.99;UI.findItem(UI.forgeSel).enh=8;UI.render()"); pg.wait_for_timeout(200)
        pg.click('#fGo'); pg.wait_for_timeout(1250); shot('forge_fail')
        # vỡ đồ
        ev("Math.random=Math._r;LEGEND.rng=(()=>{const q=[0.99,0.01];return()=>q.length?q.shift():0.5})();UI.findItem(UI.forgeSel).enh=12;UI.render()"); pg.wait_for_timeout(200)
        n0 = ev("G.save.bag.length+Object.keys(G.save.equip).length")
        pg.click('#fGo'); pg.wait_for_timeout(200); pg.click('#fGo'); pg.wait_for_timeout(980); shot('forge_break')
        n1 = ev("G.save.bag.length+Object.keys(G.save.equip).length")
        print(m, 'break removed item:', n0 - n1 == 1)
        # huyền thoại không vỡ
        ev("LEGEND.rng=(()=>{const q=[0.99,0.01];return()=>q.length?q.shift():0.5})();const it=G.save.equip.vk;it.enh=12;UI.forgeSel=it.id;UI.render()"); pg.wait_for_timeout(200)
        pg.click('#fGo'); pg.wait_for_timeout(1300); print(m, 'leg after fail', ev("G.save.equip.vk.enh")); shot('forge_legcrack')
        ev("LEGEND.rng=null;UI.close()")
        # hiệu ứng chiến đấu: kiếm khí, rồng nước, vệt lửa, ngọc lam
        ev("""const S=G.save,p=G.p;S.equip.boi=LEGEND.make('longquan',14);S.equip.giay=LEGEND.make('phudong',14);S.equip.dai=LEGEND.make('lamson',14);S.equip.vk.enh=15;recalc();updateLook();
          const A=G.W.arena;p.x=A.x-A.r-120;p.y=A.y;resolve(G.W,p);G.enemies.length=0;for(let i=0;i<10;i++){const e=spawnEnemy('soi',p.x+rand(60,200),p.y+rand(-90,90),5,false);e.state='chase';e.max=e.hp=1e6}
          LEGEND.LS.lqT=0;LEGEND.LS.stacks=6;p.hp=p.maxhp*5;""")
        ev("G.input.atk=true;G.input.my=0.5")
        pg.wait_for_timeout(700); ev("G.paused=true"); shot('combat1'); ev("G.paused=false")
        pg.wait_for_timeout(900); ev("G.paused=true"); shot('combat2'); ev("G.paused=false")
        ev("const S=G.save;S.equip.ao=LEGEND.make('hungdao',14);S.equip.dai=LEGEND.make('batrieu',14);recalc();G.p.hp=G.p.maxhp*0.2;for(let i=0;i<6;i++){const e=spawnEnemy('soi',G.p.x+rand(-80,80),G.p.y+rand(-60,60),5,false);e.max=e.hp=1e6}")
        pg.wait_for_timeout(350); ev("G.paused=true"); shot('combat3'); ev("G.paused=false")
        ev("G.input.atk=false;G.input.my=0")
        print(m, 'errors', errs)
        b.close()

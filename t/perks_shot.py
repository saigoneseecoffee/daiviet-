import sys, os
os.environ.setdefault('DVHK_HTML','/home/claude/dvhk/dist/agent_perks.html')
from harness import *
R=[]
def ok(n,c,x=''):R.append(bool(c));print(('PASS ' if c else 'FAIL ')+n,x,flush=True)
devs={'phone':PHONE,'se':SE,'land':LAND,'desk':DESK}
only=sys.argv[1:] or list(devs)
with sync_playwright() as p:
    for name in only:
        o=devs[name]
        b,ctx,pg,errs=open_page(p,o)
        pg.click('#tNew');pg.click('[data-c="kiem"]');pg.click('#goBtn');pg.wait_for_timeout(400);pg.click('#stGo');pg.wait_for_timeout(300)
        ev=pg.evaluate
        # có bí kíp sẵn để thẻ ghép hiện gợi ý
        ev("PERKS.grant('kiemluan',3);PERKS.grant('loi',2);G.save.lvl=9")
        ev("gainExp(need(G.save.lvl)+5)")
        pg.wait_for_timeout(1800)
        ok(name+' hiện bảng bí kíp',pg.is_visible('#pkOv'))
        ok(name+' tạm dừng',ev('G.paused'))
        pg.screenshot(path=f'shots/perks_{name}.png')
        ov=overflow(pg);ok(name+' không tràn ngang',ov['sw']<=o['viewport']['width'],str(ov))
        # thẻ nằm gọn trong màn hình
        boxes=[pg.locator('.pkCard').nth(i).bounding_box() for i in range(3)]
        H=o['viewport']['height'];W=o['viewport']['width']
        ok(name+' thẻ trong khung',all(bb and bb['y']>=0 and bb['y']+bb['height']<=H+1 and bb['x']>=0 and bb['x']+bb['width']<=W+1 for bb in boxes),str([(round(bb['y']),round(bb['height'])) for bb in boxes]))
        ok(name+' thẻ cao >=44',all(bb['height']>=44 for bb in boxes))
        n0=ev("Object.values(PERKS.owned()).reduce((a,b)=>a+b,0)")
        if name=='desk':
            pg.keyboard.press('Digit2');pg.wait_for_timeout(700)
        else:
            bb=boxes[0];pg.touchscreen.tap(bb['x']+bb['width']/2,bb['y']+bb['height']/2);pg.wait_for_timeout(700)
        ok(name+' chọn thẻ',ev("Object.values(PERKS.owned()).reduce((a,b)=>a+b,0)")==n0+1 and not pg.is_visible('#pkOv') and not ev('G.paused'))
        # tuyệt kỹ
        ev("PERKS.grant('kkpq',3);PERKS.grant('kiemluan',2);gainExp(need(G.save.lvl)+5)");pg.wait_for_timeout(1600)
        ok(name+' thẻ Tuyệt kỹ xuất hiện',pg.locator('.pkCard.evo').count()>=1)
        pg.screenshot(path=f'shots/perks_{name}_evo.png')
        pg.locator('.pkCard.evo').first.click();pg.wait_for_timeout(700)
        ok(name+' lĩnh Tuyệt kỹ',ev("PERKS.owned().kiemtran")==1)
        if name in ('phone','desk'):
            ev("G.enemies=[];for(let k=0;k<14;k++)spawnEnemy('soi',G.p.x+rand(-260,260),G.p.y+rand(-200,200),8,false);G.p.ifr=99;G.save.set.auto=true")
            ev("PERKS.grant('hanbang',3);PERKS.grant('hoa',3);PERKS.grant('linhphu',4);PERKS.grant('kimchung',3);_P=PERKS._P;G.save.perks.r.songlong=1")
            pg.wait_for_timeout(5600)
            pg.screenshot(path=f'shots/perks_{name}_storm.png')
            ok(name+' hàng icon HUD',pg.locator('#pkRow canvas').count()>=4)
            # auto mode offer
            ev("gainExp(need(G.save.lvl)+5)");pg.wait_for_timeout(1800)
            ok(name+' tự đánh: không tạm dừng',pg.is_visible('#pkOv') and not ev('G.paused'))
            pg.screenshot(path=f'shots/perks_{name}_auto.png')
            pg.wait_for_timeout(6500)
            ok(name+' tự chọn sau 6 giây',not pg.is_visible('#pkOv'))
            ev("G.save.set.auto=false;UI.open('skill')");pg.wait_for_timeout(400)
            pg.screenshot(path=f'shots/perks_{name}_panel.png')
        print(name,'ERR',errs[:5]);ok(name+' không lỗi JS',not [e for e in errs if e[0]!='console.warning'])
        b.close()
print(sum(R),'/',len(R))

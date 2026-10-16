from harness import *
R=[]
def ok(n,c,x=''):R.append(c);print(('PASS ' if c else 'FAIL ')+n,x)
with sync_playwright() as p:
    b,ctx,pg,errs=open_page(p,DESK)
    pg.click('#tNew');pg.click('[data-c="con"]');pg.click('#goBtn');pg.wait_for_timeout(400);pg.keyboard.press('Enter');pg.wait_for_timeout(400)
    ok('Enter đóng thẻ truyện',not pg.is_visible('#story'))
    for k,t in [('KeyB','Túi đồ'),('KeyR','Lò rèn'),('KeyC','Chợ phiên'),('KeyT','Kỹ năng'),('KeyQ','Nhiệm vụ'),('KeyM','Bản đồ & Xa phu')]:
        pg.keyboard.press(k);pg.wait_for_timeout(200);ok('phím '+k,pg.is_visible('#panel') and pg.inner_text('#shTitle')==t)
        pg.keyboard.press('Escape');pg.wait_for_timeout(200);ok('Esc đóng',not pg.is_visible('#panel'))
    pg.keyboard.press('Escape');pg.wait_for_timeout(200);ok('Esc mở Cài đặt',pg.inner_text('#shTitle')=='Cài đặt');pg.keyboard.press('Escape')
    # chuột: giữ để chạy theo con trỏ
    x0=pg.evaluate('G.p.x');pg.mouse.move(1000,400);pg.mouse.down();pg.wait_for_timeout(700);pg.mouse.up()
    ok('giữ chuột chạy theo con trỏ',pg.evaluate('G.p.x')>x0+40)
    pg.evaluate("G.p.x=G.W.out.x;G.p.y=G.W.out.y;G.enemies=[];spawnEnemy('soi',G.p.x+150,G.p.y,1,false)");pg.wait_for_timeout(400)
    sx,sy=pg.evaluate("worldToScreen(G.enemies[0].x,G.enemies[0].y-10)")
    k0=pg.evaluate('G.save.kills');pg.mouse.move(sx,sy);pg.mouse.down();pg.wait_for_timeout(2500);pg.mouse.up()
    ok('bấm giữ chuột vào quái để đánh',pg.evaluate('G.save.kills')>k0)
    # E nói chuyện NPC
    pg.evaluate("G.p.x=G.W.npcs[1].x+10;G.p.y=G.W.npcs[1].y+30");pg.wait_for_timeout(300);pg.keyboard.press('KeyE');pg.wait_for_timeout(200)
    ok('phím E mở Chợ ở Thương Nhân',pg.is_visible('#panel') and pg.inner_text('#shTitle')=='Chợ phiên');pg.keyboard.press('Escape')
    # liên trảm
    pg.evaluate("document.getElementById('offer').hidden=true");pg.evaluate("for(let i=0;i<5;i++){const e=spawnEnemy('soi',G.p.x+30,G.p.y,1,false);hurtEnemy(e,1e6,{})}");pg.wait_for_timeout(200)
    ok('hiện liên trảm',pg.is_visible('#combo'),pg.inner_text('#comboN'))
    pg.screenshot(path='shots/desk_combo.png')
    print('ERR',errs);print(sum(R),'/',len(R))

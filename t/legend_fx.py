import json
from harness import *
# Kiểm tra từng món Huyền Thoại: trang bị, mô phỏng 6 giây giao chiến, đếm hiệu ứng + lỗi JS.
SIM = '''(key)=>{const S=G.save,p=G.p,D=LEGEND.LEGENDS[key];for(const sl of SLOTS)delete S.equip[sl];
 G.state='play';p.hp=p.maxhp=99999;S.equip.vk=genItem(20,2,'vk');S.equip[D.slot]=LEGEND.make(key,20);recalc();updateLook();
 const A=G.W.arena;p.x=A.x-A.r-140;p.y=A.y;resolve(G.W,p);G.enemies.length=0;G.projs.length=0;G.fx.length=0;
 for(let i=0;i<14;i++){const e=spawnEnemy('soi',p.x+rand(-110,110),p.y+rand(-90,90),20,false);e.state='chase';e.atk=0.001;e.max=e.hp=key==='thanhgiong'&&i%2?50:1e6}
 Object.assign(LEGEND.LS,{lqT:0,shellT:6.9,hdCd:0,btCd:0,aucoCd:0});
 let maxProj=0,fxK={},hits=0,hp0=p.hp,dead=0;const dt=1/60;G.input.atk=true;
 for(let i=0;i<360;i++){if(key==='hungdao'&&i===30)p.hp=p.maxhp*0.2;if(key==='auco'&&i===60){p.ifr=0;hurtPlayer(1e9,1,null)}
   if(key==='quangtrung'&&i%40===0){p.skCd=[0,0,0];p.mp=p.maxmp;castSkill(0)}
   if(key==='phudong')G.input.mx=Math.sin(i/30);
   if(G.state==='dead'){dead=1;break}
   if(i%20===0&&key==='kimquy'){const e=G.enemies.find(e=>!e.dead);p.ifr=0;hurtPlayer(10,1,e)}
   update(dt);maxProj=Math.max(maxProj,G.projs.length);for(const f of G.fx)fxK[f.k]=(fxK[f.k]||0)+1;
   if(i%30===0)render(dt)}
 G.input.atk=false;G.input.mx=0;const L=LEGEND.LS;
 return{key,maxProj,fx:fxK,kills:S.kills,stacks:L.stacks,shield:Math.round(L.shield),shell:L.shell,fire:L.fire.length,drag:L.drag>0,aucoCd:L.aucoCd>0,state:G.state,dead}}'''
with sync_playwright() as p:
    for cls, keys in [('kiem', ['thuanthien', 'hungdao', 'kimquy', 'quangtrung', 'lamson', 'batrieu', 'phudong', 'longquan', 'auco']),
                      ('cung', ['linhquang']), ('giao', ['ngovuong']), ('dao', ['phuonghoang']), ('con', ['thanhgiong']), ('phap', ['thienthu'])]:
        b, ctx, pg, errs = open_page(p, DESK)
        pg.click('#tNew'); pg.click(f'[data-c="{cls}"]'); pg.click('#goBtn'); pg.wait_for_timeout(300); pg.click('#stGo')
        pg.evaluate("G.save.lvl=20;G.save.skl=[3,1,1];G.save.set.autoPot=false;G.paused=true;recalc()")
        for k in keys:
            r = pg.evaluate(SIM, k)
            fx = {a: r['fx'].get(a, 0) for a in ['stake', 'bolt', 'xslash', 'ring', 'pillar', 'streak'] if r['fx'].get(a)}
            print(cls, k, 'proj', r['maxProj'], 'fx', fx, {x: r[x] for x in ['kills', 'stacks', 'shield', 'shell', 'fire', 'drag', 'aucoCd', 'state']})
        print(cls, 'errors', errs)
        b.close()

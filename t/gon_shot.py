import sys
from harness import *
from tower_lib import new_game, MKCHAR
R=[]
def ok(n,c,x=''):R.append(bool(c));print(('PASS ' if c else 'FAIL ')+n,x,flush=True)
with sync_playwright() as p:
  for mode,O in [('phone',PHONE),('desk',DESK)]:
    for gon in [False,True]:
        b,ctx,pg,errs=open_page(p,O);ev=pg.evaluate
        new_game(pg,'dao');ev(MKCHAR,[132,10,4])
        ev(f"""(()=>{{const S=G.save;S.set.gon={'true' if gon else 'false'};PERKS.list().slice(0,9).forEach(k=>PERKS.grant(k,2));
          if(window.PROG){{S.prog=S.prog||{{}};S.prog.realm=8;}}recalc();
          if(window.DAILY&&DAILY.titles){{const t=DAILY.titles()[0];if(t&&S.daily){{S.daily.title=t.id}}}}
          if(window.BT)BT.dev&&BT.dev.unlockSlots&&BT.dev.unlockSlots();
          G.p.x=W_out=G.W.out.x;G.p.y=G.W.out.y+200;G.cam.x=G.p.x;G.cam.y=G.p.y;S.set.auto=true;
          for(let k=0;k<14;k++)spawnEnemy('soi',G.p.x+rand(-200,200),G.p.y+rand(-200,200),130,k%5==0);}})()""")
        for i in range(6):
            ev("(()=>{for(let i=0;i<20;i++){G.p.hp=G.p.maxhp;G.p.mp=G.p.maxmp;G.p.skCd=[0,0,0];update(1/60)}})()")
            ev("(()=>{for(let i=0;i<3;i++)castSkill(i)})()")
            for k in range(3): ev("UI.loot('+1 Huyền Thiết','#9fd8ff');UI.loot('+59 vàng','#ffd23a',true);UI.toast('Phá ổ quái: mở rương báu!','quest')")
        pg.wait_for_timeout(500)
        ev("G.paused=true");pg.wait_for_timeout(100)
        pg.screenshot(path=f'shots/gon_{mode}_{"on" if gon else "off"}.png')
        st=ev("({floats:G.floats.length,skill:G.floats.filter(f=>f.skill).length,feed:document.getElementById('feed').children.length,toasts:document.getElementById('toasts').children.length})")
        print(mode,gon,st)
        if gon: ok(f'{mode} gọn: ≤1 tên chiêu, feed ≤3',st['skill']<=1 and st['feed']<=3,str(st))
        ok(f'{mode} không lỗi JS',not errs,str(errs[:2]));b.close()
print('SUMMARY',sum(R),'/',len(R))

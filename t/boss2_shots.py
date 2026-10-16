"""Chụp ảnh từng boss / giai đoạn / đòn đặc trưng của mô-đun boss2.
   python3 boss2_shots.py [desk|phone] [boss_index ...]"""
import sys, json, os
os.environ.setdefault('DVHK_HTML', '/home/claude/dvhk/dist/agent_boss2.html')
from harness import *
mode = sys.argv[1] if len(sys.argv) > 1 else 'desk'
only = [int(x) for x in sys.argv[2:]]
OPTS = {'desk': DESK, 'phone': PHONE, 'land': LAND, 'se': SE}[mode]
# (chương, lớp, [(giai đoạn, đòn, thời gian chờ ms trước khi chụp)])
PLAN = [
    (0, 'kiem', [(1, 'jet', 500), (1, 'whirl', 700), (2, 'tide', 900), (3, 'jet', 900)]),
    (1, 'dao', [(1, 'feather', 500), (1, 'dive', 950), (2, 'crow', 1200), (3, 'fan4', 600)]),
    (2, 'giao', [(1, 'thrust', 900), (1, 'sweep', 500), (2, 'amb', 1000), (3, 'tide', 900)]),
    (3, 'cung', [(1, 'charge', 450), (2, 'riders', 1000), (3, 'riders', 1900), (3, 'firearrow', 600)]),
    (4, 'con', [(1, 'cannon', 700), (2, 'rain', 1300), (3, 'mud', 650), (2, 'amb', 900)]),
    (5, 'phap', [(1, 'cross', 600), (2, 'meteor', 700), (3, 'inferno', 1500), (2, 'cross', 1500)]),
]
SETUP = '''([mi,cls])=>{const S=G.save;S.cls=cls;G.p=null;S.lvl=MAPS[mi].lv[1]+1;S.unlocked=6;travel(mi,false);G.p=null;makePlayer(G.W.camp.x,G.W.camp.y);
  S.skl=[3,3,3];recalc();updateLook();G.p.hp=G.p.maxhp;G.p.ifr=1e9;G.p.mp=G.p.maxmp;S.tut={move:1,atk:1,equip:1,skill:1,forge:1,b2k:1,b2b:1};S.set.auto=false;
  S.qs[mi]=3;S.qp=0;const a=G.W.arena;G.p.x=a.x+40;G.p.y=a.y+120;G.cam.x=G.p.x;G.cam.y=G.p.y-20;
  document.getElementById('story').hidden=true;G.paused=false;return true}'''
with sync_playwright() as p:
    b, ctx, pg, errs = open_page(p, OPTS)
    pg.click('#tNew'); pg.click('[data-c="kiem"]'); pg.click('#goBtn'); pg.wait_for_timeout(300); pg.click('#stGo')
    ev = pg.evaluate
    for mi, cls, shots in PLAN:
        if only and mi not in only: continue
        ev(SETUP, [mi, cls])
        pg.wait_for_timeout(600)
        ev("()=>{if(!G.boss){const a=G.W.arena;G.p.x=a.x;G.p.y=a.y+60;startBoss()}}")
        ok = ev("!!G.boss&&!!G.boss.b2")
        print('boss', mi, ev("G.boss&&G.boss.name"), 'b2' if ok else 'NO B2', flush=True)
        pg.wait_for_timeout(1500)
        ev("B2.pause(true);G.p.ifr=1e9")
        for k, (ph, ab, wait) in enumerate(shots):
            ev(f"""()=>{{const e=G.boss;if(e.b2.ph!=={ph}){{if({ph}<e.b2.ph){{e.b2.ph=1;e.hp=e.max}}B2.setPhase({ph})}}}}""")
            pg.wait_for_timeout(250)
            ev("()=>{const e=G.boss,a=G.W.arena;G.boss.x=a.x;G.boss.y=a.y-50;G.p.x=a.x+50;G.p.y=a.y+50;G.cam.x=G.p.x;G.cam.y=G.p.y-50;G.boss.state='chase';G.boss.b2.busy=0;G.boss.b2.stun=0;B2.hz=B2.hz.filter(h=>h.fired&&h.linger>100);B2.tm=[];G.projs=[]}")
            if ab == 'amb':
                ev("B2.amb()")
            else:
                r = ev(f"B2.force('{ab}')")
                if not r: print('  force failed', ab)
            pg.wait_for_timeout(wait)
            fn = f'shots/boss2_{mode}_{mi}_{k}_p{ph}_{ab}.png'
            pg.screenshot(path=fn)
            info = ev("({ph:G.boss&&G.boss.b2.ph,hz:B2.hz.length,st:G.boss&&G.boss.state,txt:document.getElementById('bossTxt').textContent})")
            print('  ', fn, json.dumps(info, ensure_ascii=False), flush=True)
            pg.wait_for_timeout(1800)
        ev("G.p.ifr=0")
    # biểu tượng hệ trên quái thường + tinh anh có hậu tố
    ev("""()=>{const S=G.save;travel(3,false);const p=G.p;p.x=G.W.out.x;p.y=G.W.out.y;G.enemies=[];G.cam.x=p.x;G.cam.y=p.y-20;
      const t=['linhnguyen','kybinh','cungky','soithao'];for(let k=0;k<4;k++){const e=spawnEnemy(t[k],p.x-150+k*95,p.y-90,22,k===1);e.state='idle';e.hp=e.max*0.6}
      const el=spawnEnemy('linhnguyen',p.x+40,p.y+90,22,true);el.state='idle';G.lastTarget=el;G.p.ifr=1e9}""")
    pg.wait_for_timeout(400)
    pg.screenshot(path=f'shots/boss2_{mode}_elements.png')
    print('elite names', ev("G.enemies.filter(e=>e.elite).map(e=>e.name)"))
    # thẻ chương + bảng nhiệm vụ
    ev("showStoryCard(4)"); pg.wait_for_timeout(900); pg.screenshot(path=f'shots/boss2_{mode}_story.png')
    ev("document.getElementById('story').hidden=true;G.paused=false;UI.open('quest')"); pg.wait_for_timeout(600)
    pg.evaluate("document.querySelector('#shBody').scrollTop=9999"); pg.wait_for_timeout(200)
    pg.screenshot(path=f'shots/boss2_{mode}_quest.png')
    print('ERR', errs[:8])
    b.close()

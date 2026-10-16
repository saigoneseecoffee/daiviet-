"""Đo khả năng né của bot với từng đòn boss: tung đòn N lần khi bot tự đánh, đếm số lần trúng.
   python3 boss2_dodge.py [lớp] [chương...]   (người chơi bất tử: máu được hồi đầy mỗi khung)"""
import sys, json, os
os.environ.setdefault('DVHK_HTML', '/home/claude/dvhk/dist/agent_boss2.html')
from harness import *
cls = sys.argv[1] if len(sys.argv) > 1 else 'kiem'
only = [int(x) for x in sys.argv[2:]]
N = 6
SETUP = '''([mi,cls])=>{const S=G.save;S.cls=cls;G.p=null;S.lvl=MAPS[mi].lv[1]+2;S.unlocked=6;travel(mi,false);G.p=null;makePlayer(G.W.camp.x,G.W.camp.y);
  S.skl=[3,3,3];recalc();updateLook();S.tut={move:1,atk:1,equip:1,skill:1,forge:1,b2k:1,b2b:1};S.set.auto=true;S.set.sfx=false;S.set.music=false;S.riding=null;
  ensureMountSave();S.mounts.bach={lv:1,exp:0};S.riding=mi>0?'bach':null;recalc();
  S.qs[mi]=3;S.qp=0;const a=G.W.arena;G.p.x=a.x+40;G.p.y=a.y+100;document.getElementById('story').hidden=true;G.paused=false;return true}'''
RUN = '''([ph,ab,secs])=>{const e=G.boss,dt=1/60;let n0=B2.stats.hits.length;const B=e.b2;
  if(B.ph!==ph){B2.setPhase(ph)}
  for(let i=0;i<120;i++){G.p.hp=G.p.maxhp;update(dt)}
  B.next=1e9;let casts=0,hits=0;const kinds={};
  for(let c=0;c<%d;c++){
    // đặt lại vị trí ngẫu nhiên hợp lý
    e.state='chase';B.busy=0;B.stun=0;B.chan=null;B.cds={};B2.hz=B2.hz.filter(h=>h.fired&&h.linger>100);B2.tm=[];G.projs=[];G.enemies=G.enemies.filter(x=>x===e||x.dead);
    const a=G.W.arena,an=Math.random()*6.28;G.p.x=a.x+Math.cos(an)*rand(60,200);G.p.y=a.y+Math.sin(an)*rand(40,150);
    const h0=B2.stats.hits.length;
    if(ab==='amb')B2.amb();else B2.force(ab);casts++;
    for(let i=0;i<secs*60;i++){G.p.hp=G.p.maxhp;G.p.ifr=0;if(G.state!=='play'){G.state='play'}update(dt);B.next=1e9;if(B.trans){B.transT=0}}
    const h1=B2.stats.hits.length;hits+=h1-h0;for(const x of B2.stats.hits.slice(h0))kinds[x[1]]=(kinds[x[1]]||0)+1}
  return{casts,hits,kinds,imp:B2.stats.imp||0}}''' % N
PLAN = [
    (0, [(1, 'jet', 2), (1, 'whirl', 3), (1, 'slam', 2), (2, 'tide', 4), (2, 'charge', 2), (3, 'jet', 3), (3, 'tide', 4)]),
    (1, [(1, 'feather', 2), (1, 'dive', 3), (1, 'peck', 2), (2, 'feather', 3), (2, 'dive', 5), (3, 'fan4', 3), (3, 'dive', 6)]),
    (2, [(1, 'thrust', 3), (1, 'sweep', 2), (1, 'arrows', 2.5), (2, 'amb', 5), (3, 'tide', 4), (3, 'thrust', 3)]),
    (3, [(1, 'charge', 4), (1, 'firearrow', 3.5), (2, 'riders', 3), (3, 'riders', 4.5), (3, 'charge', 5)]),
    (4, [(1, 'cannon', 3), (1, 'pierce', 2), (2, 'rain', 3.5), (2, 'amb', 2.5), (3, 'mud', 3), (3, 'rain', 3.5)]),
    (5, [(1, 'cross', 2.5), (1, 'meteor', 3), (2, 'cross', 3), (2, 'amb', 3), (3, 'meteor', 3)]),
]
with sync_playwright() as p:
    b, ctx, pg, errs = open_page(p, DESK)
    pg.click('#tNew'); pg.click('[data-c="kiem"]'); pg.click('#goBtn'); pg.wait_for_timeout(300); pg.click('#stGo')
    ev = pg.evaluate
    ev("G.paused=true")  # tự chạy update bằng tay
    for mi, tests in PLAN:
        if only and mi not in only: continue
        ev(SETUP, [mi, cls]); ev("G.paused=true")
        ev("()=>{for(let i=0;i<200;i++){G.p.hp=G.p.maxhp;update(1/60)}}")
        if not ev("!!G.boss"): print('no boss', mi); continue
        ev("()=>{for(let i=0;i<120;i++){G.p.hp=G.p.maxhp;update(1/60)}}")
        for ph, ab, secs in tests:
            r = ev(RUN, [ph, ab, secs])
            print(f"ch{mi+1} p{ph} {ab:10s} hit {r['hits']}/{r['casts']}  {json.dumps(r['kinds'], ensure_ascii=False)} imp={r['imp']}", flush=True)
    print('ERR', errs[:5])
    b.close()

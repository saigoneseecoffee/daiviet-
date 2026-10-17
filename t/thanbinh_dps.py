# Đo sát thương Thần Tính trên hình nộm: python3 thanbinh_dps.py [lớp...]
# DVHK_HTML=$(pwd)/../dist/agent_thanbinh.html
import sys, json
from harness import *
classes = sys.argv[1:] or ['kiem', 'cung', 'giao', 'dao', 'con', 'phap']
SETUP = '''([L])=>{const S=G.save;S.lvl=L;S.exp=0;S.sp=0;S.potHP=0;
  for(const sl of SLOTS){const it=genItem(L,2,sl);it.enh=4;S.equip[sl]=it}S.perks=undefined;
  S.set.auto=false;S.set.sfx=false;S.set.music=false;recalc();updateLook();return G.p.atk}'''
RUN = '''([k,lv,q,n,secs])=>{const S=G.save,p=G.p;if(k)window.TB.set(k,lv,q);else{delete S.equip.vk.tt;recalc()}
  const W=G.W;p.x=W.arena.x+W.arena.r+400;p.y=W.arena.y;G.enemies=[];G.projs=[];G.timers=[];G.zones=[];
  const es=[];for(let i=0;i<n;i++){const a=i/n*TAU;const e=spawnEnemy(curMap().enemies[0][0],p.x+60+Math.cos(a)*(i?30:0),p.y+Math.sin(a)*(i?30:0),S.lvl,false);e.max=e.hp=1e12;es.push(e)}
  let tot=0;const h=(e,d,o)=>{tot+=d};HK.on('hit',h);const dt=1/60;G.input.atk=true;
  for(let i=0;i<secs*60;i++){G.spawnT=99;p.ifr=9;p.hp=p.maxhp;p.mp=p.maxmp;for(const e of es){e.hp=e.max;e.x=Math.max(e.x,p.x+20);if(e.stun<0.5)e.stun=0.5;e.kbx=e.kby=0}G.state='play';G.paused=false;update(dt)}
  G.input.atk=false;HK._h.hit.splice(HK._h.hit.indexOf(h),1);return Math.round(tot/secs)}'''
with sync_playwright() as p:
    for cls in classes:
        b, ctx, pg, errs = open_page(p, DESK)
        pg.click('#tNew'); pg.click(f'[data-c="{cls}"]'); pg.click('#goBtn'); pg.wait_for_timeout(300); pg.click('#stGo'); pg.wait_for_timeout(300)
        atk = pg.evaluate(SETUP, [40])
        for n in (1, 4):
            base = pg.evaluate(RUN, [None, 1, 1, n, 45])
            row = []
            for k in pg.evaluate('Object.keys(window.TB.TRAITS)'):
                a = pg.evaluate(RUN, [k, 1, 1, n, 45]); c = pg.evaluate(RUN, [k, 10, 2, n, 45])
                row.append(f"{k} {100*(a/base-1):+.0f}%/{100*(c/base-1):+.0f}%")
            print(f"{cls} atk {atk} targets {n} base {base}/s :: " + ', '.join(row), flush=True)
        print('errors', errs[:5])
        b.close()

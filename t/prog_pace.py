"""Đo tốc độ luyện công ở từng chương của kế hoạch 12 chương rồi tính bảng thời gian dự kiến.
   Mỗi chương: dựng nhân vật "điển hình" ở cấp giữa chương (trang bị Hiếm theo cấp, rèn theo cấp, kỹ năng theo luật điểm,
   Cảnh Giới, Kinh Mạch, bí kíp theo nhịp mới), giữ nhiệm vụ chính không xong để bot chỉ luyện công (tự đánh), đo
   quái hạ/phút, kinh nghiệm/phút, số lần chết. Chương c dùng bản đồ c%6 với khoảng cấp quái mới.
   python3 prog_pace.py [lớp] [phút mô phỏng mỗi chương]"""
import sys, json, os, math
os.environ.setdefault('DVHK_HTML', '/home/claude/wt_prog/dist/agent_prog.html')
from harness import *
cls = sys.argv[1] if len(sys.argv) > 1 else 'kiem'
smin = float(sys.argv[2]) if len(sys.argv) > 2 else 3
HUMAN = 1.6   # người chơi thật chậm hơn bot tự đánh ~1,6 lần (đọc truyện, menu, đi lại, không tối ưu)
BOSS_MIN = 3  # phút đánh boss mỗi chương (người chơi)
RANGES = [[1,8],[8,16],[16,25],[25,34],[34,44],[44,54],[54,65],[65,76],[76,88],[88,100],[100,113],[113,126]]
SETUP = """([c,R,L])=>{const S=G.save,mi=c%6;MAPS[mi].lv=R;S.lvl=L;S.exp=0;S.ng=0;progEnsure(S);
  // trang bị Hiếm (vũ khí Truyền Thuyết) đúng cấp, rèn theo cấp
  const enh=Math.max(0,Math.min(13,Math.round(L/7)));S.equip={};
  for(const sl of SLOTS){const it=genItem(L,sl==='vk'?3:2,sl);it.enh=enh;S.equip[sl]=it}
  // kỹ năng theo luật điểm (điểm từ cấp + boss các chương trước), giới hạn theo Cảnh Giới
  let ri=0;for(let i=1;i<PROG.REALMS.length&&i<=7;i++)if(PROG.REALMS[i].lv<=L-2)ri=i;S.prog.realm=ri;
  let sp=c;for(let l=2;l<=L;l++)sp+=spAt(l);const cap=PROG.REALMS[ri].sk;const C=CLASS_BY_ID[S.cls];
  S.skl=[0,0,0];C.skills.forEach((k,i)=>{if(L>=k.un)S.skl[i]=1});for(let g=0;g<sp;g++){let j=-1,lo=99;for(let i=0;i<3;i++)if(S.skl[i]>0&&S.skl[i]<cap&&S.skl[i]<lo){lo=S.skl[i];j=i}if(j<0)break;S.skl[j]++}
  // Kinh Mạch: khoảng 0,5 huyệt mỗi cấp, trải đều các mạch đã mở
  let pts=Math.min(96,Math.round(L*0.5));S.prog.mer=[0,0,0,0,0,0,0,0];for(let g=0;g<pts;g++){let j=-1,lo=99;for(let m=0;m<8;m++)if(PROG.MER[m].r<=ri&&S.prog.mer[m]<12&&S.prog.mer[m]<lo){lo=S.prog.mer[m];j=m}if(j<0)break;S.prog.mer[j]++}
  // bí kíp theo nhịp mới
  S.perks={r:{},pend:PERKS.offersUpTo(L),rr:0,picks:0};while(S.perks.pend>0)PERKS.pickAuto();
  ensureMountSave();S.mounts={};let best=null;for(const m of MOUNTS)if(!m.frag&&m.lv<=L)best=m;if(best){S.mounts[best.id]={lv:Math.min(10,1+Math.floor(L/12)),exp:0};S.riding=best.id}
  S.potHP=10;S.potMP=6;S.qs[mi]=0;S.qp=0;
  travel(mi,false);recalc();G.p.hp=G.p.maxhp;G.p.mp=G.p.maxmp;
  window.__x={xp:0,k0:S.kills,d:0,t:0,cq0:S.cq||0,tq0:S.tq||0};
  if(!window.__wrapped){window.__wrapped=1;const g0=gainExp;gainExp=function(x){window.__x.xp+=Math.round(x);return g0.apply(this,arguments)}}
  return{atk:G.p.atk,hp:G.p.maxhp,def:G.p.def,pow:G.p.power,skl:S.skl.join('/'),realm:ri,mer:pts,perks:S.perks.picks,enh}}"""
RUN = """(secs)=>{const S=G.save,dt=1/60,X=window.__x;const L0=S.lvl;
  for(let i=0;i<secs*60;i++){
    if(G.state==='dead'){X.d++;while(G.state==='dead')update(dt)}
    if(!document.getElementById('story').hidden)document.getElementById('stGo').click();
    const ov=document.getElementById('rgOv');if(ov&&!ov.hidden)ov.hidden=true;
    G.paused=false;if(UI.panel)UI.close();S.qp=0;S.qs[S.map]=0;
    if(i%120===0){S.lvl=L0;S.exp=0;S.potHP=Math.max(S.potHP,6);S.potMP=Math.max(S.potMP,4);if(window.PERKS)PERKS.pickAuto()}
    if(G.hitstop>0)G.hitstop-=dt;else update(dt*G.slow);X.t+=dt}
  S.lvl=L0;
  return{min:X.t/60,kills:S.kills-X.k0,xp:X.xp,d:X.d,cq:(S.cq||0)-X.cq0,tq:(S.tq||0)-X.tq0}}"""
rows = []
with sync_playwright() as p:
    b, ctx, pg, errs = open_page(p, DESK)
    pg.click('#tNew'); pg.click(f'[data-c="{cls}"]'); pg.click('#goBtn'); pg.wait_for_timeout(300); pg.click('#stGo')
    pg.evaluate("G.save.set.auto=true;G.save.set.sfx=false;G.save.set.music=false")
    for c, (lo, hi) in enumerate(RANGES):
        L = (lo + hi) // 2
        st = pg.evaluate(SETUP, [c, [lo, hi], L])
        r = pg.evaluate(RUN, int(smin * 60))
        kpm = r['kills'] / r['min']; xpm = r['xp'] / r['min']
        rows.append(dict(c=c+1, L=L, kpm=kpm, xpm=xpm, dpm=r['d'] / r['min'], st=st, cqm=r['cq']/r['min'], tqm=r['tq']/r['min']))
        print(f"ch{c+1:2d} L{L:3d} kpm {kpm:5.1f} xp/min {xpm:9.0f} deaths/min {r['d']/r['min']:.2f} cq/min {r['cq']/r['min']:.1f} tq/min {r['tq']/r['min']:.2f} {json.dumps(st, ensure_ascii=False)}", flush=True)
    NEED = pg.evaluate("Array.from({length:301},(_,L)=>L?need(L):0)")
    EK = pg.evaluate("Array.from({length:301},(_,L)=>expKill(L))")
    print('errors', errs[:5])
    b.close()
# bảng: thời gian bot = Σ need(L) / (xp/phút đo được, quy theo expKill); người chơi = ×HUMAN + boss
print('\nBẢNG NHỊP CHIẾN DỊCH (người chơi = bot × %.1f + %d phút boss mỗi chương)' % (HUMAN, BOSS_MIN))
print(' Ch  cấp      quái/ph  KN/ph(bot)  bot ph   người (ph)  luỹ kế (giờ)')
cum = 0
for r, (lo, hi) in zip(rows, RANGES):
    t = 0
    cu = lambda L: min(2, 1 + 0.12 * max(0, hi - 1 - L))
    for L in range(lo, hi):
        t += NEED[L] / max(1, r['xpm'] / cu(r['L']) * cu(L) * EK[L] / EK[r['L']])
    human = t * HUMAN + BOSS_MIN; cum += human
    print(f"{r['c']:3d}  {lo:3d}-{hi:<3d}  {r['kpm']:7.1f}  {r['xpm']:10.0f}  {t:7.1f}   {human:8.1f}    {cum/60:7.2f}")
print(f'TỔNG {cum/60:.1f} giờ')

# bảng làm mượt: KN/phút khớp theo luỹ thừa của cấp (bớt nhiễu do bố cục bản đồ)
import numpy as np
Ls = np.array([r['L'] for r in rows]); Xs = np.array([r['xpm'] for r in rows])
bb, aa = np.polyfit(np.log(Ls), np.log(Xs), 1)
cqc = tqc = 0
print('\nBẢNG LÀM MƯỢT (KN/phút ≈ %.0f·L^%.2f)' % (math.exp(aa), bb))
cum = 0
for r, (lo, hi) in zip(rows, RANGES):
    cu = lambda L: min(2, 1 + 0.12 * max(0, hi - 1 - L)); x = math.exp(aa) * r['L'] ** bb
    t = sum(NEED[L] / (x / cu(r['L']) * cu(L) * EK[L] / EK[r['L']]) for L in range(lo, hi))
    human = t * HUMAN + BOSS_MIN; cum += human
    cqc += r['cqm'] * t; tqc += r['tqm'] * t
    print(f"{r['c']:3d}  {lo:3d}-{hi:<3d}  bot {t:6.1f} ph   người {human:6.1f} ph   luỹ kế {cum/60:5.2f} giờ   Chân Khí luỹ kế ~{cqc:7.0f}  Tàn Quyển ~{tqc:5.0f}")
print(f'TỔNG (làm mượt) {cum/60:.1f} giờ')

/* ============ TIẾN TRÌNH DÀI HẠN: CẢNH GIỚI, KINH MẠCH, LUÂN HỒI, CHÂN KHÍ, SỨC MẠNH QUÁI THEO CẤP ============
   Lưu ở G.save.prog = {v, realm, mer:[8 số huyệt đã khai ở tầng hiện tại], ml:tầng kinh mạch, lh:số Luân Hồi đã nhận thưởng, ngSeen, bsp:[chương đã nhận điểm kỹ năng boss]}
   Tài nguyên: G.save.cq (Chân Khí), G.save.tq (Tàn Quyển) qua giveRes (core.js).
   Hàm toàn cục cho mô-đun khác: progEnsure, skillCap, skillUpCost, skillUp, progPerkCap, progPerkCapNote, progReward(kind,n), realmIdx.
   Móc: stats, spawn, kill, tick. Bọc: startGame, completeStep, bossDefeated, sideEvent, openChest, drawAura, UI.hud, UI.p_skill/b_skill, UI.chapterClear. */

/* ---------- 13 bậc Cảnh Giới (bậc 0 là khởi đầu) ----------
   lv: cấp nhân vật cần, cq: Chân Khí cần, b: thưởng vĩnh viễn của riêng bậc đó (cộng dồn), sk: cấp kỹ năng tối đa, pk: cấp bí kíp tối đa */
const REALMS=[
 {n:'Phàm Nhân',lv:1,cq:0,b:{},sk:10,pk:3,c:'#bba98a'},
 {n:'Sơ Nhập',lv:10,cq:120,b:{atk:5,hp:5},sk:10,pk:3,c:'#9fe0a0'},
 {n:'Tiểu Thành',lv:20,cq:400,b:{atk:5,hp:5,def:5,crit:1},sk:10,pk:3,c:'#7fe8dc'},
 {n:'Đại Thành',lv:32,cq:1000,b:{atk:8,hp:8,def:5},sk:11,pk:4,c:'#62b4ff'},
 {n:'Viên Mãn',lv:45,cq:2000,b:{atk:10,hp:10,def:8,cdmg:10},sk:12,pk:4,c:'#9f8bff'},
 {n:'Tông Sư',lv:60,cq:3500,b:{atk:12,hp:12,def:10,crit:2},sk:13,pk:5,c:'#c58bff'},
 {n:'Đại Tông Sư',lv:80,cq:6000,b:{atk:15,hp:15,def:10,aspd:5},sk:14,pk:5,c:'#ff8adf'},
 {n:'Võ Thánh',lv:100,cq:10000,b:{atk:20,hp:20,def:12,cdmg:15},sk:15,pk:5,c:'#ffc53d'},
 {n:'Võ Thần',lv:126,cq:20000,b:{atk:25,hp:25,def:15,crit:2},sk:16,pk:5,c:'#ff9a3d'},
 {n:'Phá Hư',lv:160,cq:40000,b:{atk:30,hp:30,def:15,spd:5},sk:17,pk:5,c:'#ff5b3d'},
 {n:'Thiên Nhân',lv:200,cq:80000,b:{atk:35,hp:35,def:20,cdmg:20},sk:18,pk:5,c:'#fff1a8'},
 {n:'Hư Không',lv:250,cq:150000,b:{atk:40,hp:40,def:20,aspd:5},sk:19,pk:5,c:'#bfe8ff'},
 {n:'Phản Phác Quy Chân',lv:300,cq:300000,b:{atk:50,hp:50,def:25,crit:3,cdmg:25},sk:20,pk:5,c:'#ffffff'},
];
const BON_NAME={atk:['công','%'],hp:['sinh lực','%'],def:['thủ','%'],mp:['nội lực','%'],crit:['chí mạng','%'],cdmg:['ST chí mạng','%'],aspd:['tốc đánh','%'],spd:['tốc chạy','%'],ls:['hút máu','%'],exp:['kinh nghiệm','%'],cdr:['giảm hồi chiêu','%']};

/* ---------- Kỳ Kinh Bát Mạch: 8 mạch × 12 huyệt mỗi tầng, tầng vô hạn ----------
   u: thưởng mỗi huyệt (huyệt chủ thứ 12 tính gấp 3), r: Cảnh Giới cần để khai mạch ở tầng 1 */
const MER=[
 {n:'Nhâm Mạch',key:'Đản Trung',u:{hp:1.5},r:0,c:'#ff7a6a',d:'Biển của các mạch âm, chạy dọc giữa bụng và ngực. Tăng sinh lực.'},
 {n:'Đốc Mạch',key:'Bách Hội',u:{atk:1.5},r:0,c:'#ffb347',d:'Biển của các mạch dương, dọc sống lưng lên đỉnh đầu. Tăng công.'},
 {n:'Đới Mạch',key:'Đới Mạch',u:{def:1.5},r:1,c:'#d8c08a',d:'Vòng quanh eo như dải đai, bó các mạch lại. Tăng thủ.'},
 {n:'Xung Mạch',key:'Khí Xung',u:{crit:0.25},r:2,c:'#ffd23a',d:'Biển của mười hai kinh, khí huyết dồn lên ngực. Tăng chí mạng.'},
 {n:'Âm Duy Mạch',key:'Thiên Đột',u:{mp:3,cdr:0.4},r:3,c:'#7fb2ff',d:'Nối các kinh âm từ cẳng chân lên cổ. Tăng nội lực, giảm hồi chiêu.'},
 {n:'Dương Duy Mạch',key:'Phong Trì',u:{cdmg:2},r:4,c:'#ff6a4a',d:'Nối các kinh dương từ mắt cá lên gáy. Tăng sát thương chí mạng.'},
 {n:'Âm Kiểu Mạch',key:'Chiếu Hải',u:{ls:0.06,exp:0.6},r:5,c:'#c58bff',d:'Từ mắt cá trong lên mắt. Tăng hút máu và kinh nghiệm.'},
 {n:'Dương Kiểu Mạch',key:'Thân Mạch',u:{aspd:0.5,spd:0.3},r:6,c:'#8fe07a',d:'Từ mắt cá ngoài lên mắt. Tăng tốc đánh và tốc chạy.'},
];
const MER_N=12;
const FIG_DY=0.07;   // dời hình người xuống giữa khung
const LAYER_REALM=L=>L<=1?0:L===2?7:L===3?9:L===4?11:12;
const merCost=(m,k,L)=>Math.round(10*Math.pow(1.3,k)*(1+0.45*m)*Math.pow(3.5,L-1));
/* đường kinh mạch trên hình người ngồi thiền (toạ độ 0..1 theo chiều rộng, chiều cao = 1.12 lần rộng) */
const MER_PATH=[
 [[0.5,0.615],[0.5,0.45],[0.5,0.33],[0.5,0.27]],
 [[0.43,0.63],[0.425,0.5],[0.435,0.36],[0.455,0.27],[0.435,0.19],[0.455,0.105],[0.5,0.082],[0.545,0.1]],
 [[0.345,0.545],[0.4,0.58],[0.5,0.598],[0.6,0.58],[0.655,0.545]],
 [[0.57,0.62],[0.572,0.5],[0.575,0.38],[0.54,0.29]],
 [[0.14,0.79],[0.27,0.745],[0.355,0.66],[0.36,0.52],[0.37,0.39],[0.41,0.315],[0.47,0.275]],
 [[0.86,0.79],[0.73,0.745],[0.645,0.66],[0.64,0.52],[0.64,0.39],[0.6,0.3],[0.585,0.205],[0.565,0.145]],
 [[0.22,0.7],[0.21,0.6],[0.235,0.5],[0.27,0.4],[0.325,0.32],[0.41,0.25],[0.465,0.155]],
 [[0.78,0.7],[0.79,0.6],[0.765,0.5],[0.73,0.4],[0.675,0.32],[0.59,0.25],[0.535,0.155]],
];
function resample(path,n){const seg=[];let tot=0;for(let i=1;i<path.length;i++){const l=Math.hypot(path[i][0]-path[i-1][0],path[i][1]-path[i-1][1]);seg.push(l);tot+=l}
  const out=[];for(let k=0;k<n;k++){let d=tot*k/(n-1),i=0;while(i<seg.length-1&&d>seg[i]){d-=seg[i];i++}const t=seg[i]?Math.min(1,d/seg[i]):0;
    out.push([lerp(path[i][0],path[i+1][0],t),lerp(path[i][1],path[i+1][1],t)])}return out}
const MER_PTS=MER_PATH.map(p=>resample(p,MER_N));

/* ---------- Luân Hồi ---------- */
const LHN=['','Nhất','Nhị','Tam','Tứ','Ngũ','Lục','Thất','Bát','Cửu','Thập'];
const lhTitle=n=>n<=0?'':(n<=10?LHN[n]:n)+' Chuyển';
const lhGain=n=>8+2*n;                                  // % công & sinh lực nhân thêm khi hoàn thành Luân Hồi thứ n
const lhMul=n=>{let m=1;for(let k=1;k<=n;k++)m*=1+lhGain(k)/100;return m};
const lhReward=n=>({cq:1500*n*(n+1),tq:30*n,gold:200000*n});

/* ---------- sức mạnh quái theo cấp ----------
   Gốc: máu ×1.06^cấp, công ×1.05^cấp (hợp với 37 cấp cũ, nhưng vỡ khi lên 126–300+).
   Mới: cùng độ dốc đến cấp 20, sau đó dốc giảm dần để bám theo đà tăng sức mạnh nhân lần của người chơi (rèn, Cảnh Giới, Kinh Mạch, kỹ năng 20, Luân Hồi). */
const EK_HP=[[0,0],[20,1.166],[40,1.906],[80,2.786],[126,3.522],[300,4.566]],EK_HP_T=0.0025;
const EK_AT=[[0,0],[20,0.976],[40,1.616],[80,2.256],[126,2.762],[300,3.632]],EK_AT_T=0.002;
function knot(K,lv,tail){if(lv<=0)return 0;for(let i=1;i<K.length;i++)if(lv<=K[i][0]){const a=K[i-1],b=K[i];return a[1]+(b[1]-a[1])*(lv-a[0])/(b[0]-a[0])}const l=K[K.length-1];return l[1]+(lv-l[0])*tail}
const enemyHpK=lv=>Math.exp(knot(EK_HP,lv,EK_HP_T)-lv*Math.log(1.06));
const enemyAtkK=lv=>Math.exp(knot(EK_AT,lv,EK_AT_T)-lv*Math.log(1.05));

/* ---------- gợi ý phần thưởng cho tháp, nhiệm vụ ngày, bế quan (tower.js, daily.js gọi) ----------
   progReward('tower',tầng) · ('daily',0) · ('login',ngày) · ('bequan',giờ) · ('achv',bậc) → {cq,tq,gold} */
function progReward(kind,n){const S=G.save,R=S&&S.prog?S.prog.realm:0,L=S?S.lvl:1;n=Math.max(1,n||1);
  switch(kind){
    case'tower':return{cq:Math.round(20+3*n+20*Math.pow(1.045,n)),tq:n%5===0?1+Math.floor(n/25):0,gold:Math.round(80*n*(1+n/20))};
    case'daily':return{cq:Math.round(60*Math.pow(1.35,R)),tq:1+Math.floor(R/3),gold:40*L};
    case'login':return{cq:Math.round(30*Math.pow(1.3,R))*(n%7===0?3:1),tq:n%7===0?2+Math.floor(R/3):0,gold:30*L};
    case'bequan':return{cq:Math.round(Math.min(12,n)*8*Math.pow(1.3,R)),tq:0,gold:Math.round(Math.min(12,n)*10*L)};
    case'achv':return{cq:Math.round(50*Math.pow(1.6,n)),tq:2*n,gold:0};
  }return{cq:0,tq:0,gold:0}}

(function(){
const P={cqAcc:0,cqT:0,tqAcc:0,raf:0,sel:0,hudKey:'',bk:null,dom:null};
const ps=()=>{const S=G.save;return S&&S.prog};

/* ---------- lưu & chuyển đổi bản lưu cũ ---------- */
function progEnsure(S){
  S=S||G.save;if(!S)return null;if(S.sp<0)S.sp=0;if(S.prog)return S.prog;
  if(S.cq==null)S.cq=0;if(S.tq==null)S.tq=0;
  const old=(S.lvl||1)>1||S.kills>0;
  const pr=S.prog={v:1,realm:0,mer:[0,0,0,0,0,0,0,0],ml:1,lh:0,ngSeen:S.ng||0,bsp:[],mig:0};
  if(old){
    // kinh nghiệm: giữ tỉ lệ thanh kinh nghiệm theo đường cong mới
    const L=Math.min(S.lvl,LV_CAP);S.exp=Math.floor(clamp(S.exp/Math.max(1,needOld(L)),0,0.999)*need(L));
    // Luân Hồi cũ (+30 cấp mỗi vòng) đổi sang hệ mới: giữ thưởng và danh hiệu, quái về cấp gốc của chiến dịch 12 chương
    if(S.ng>0){pr.lh=S.ng;pr.mig=S.ng;S.ng=0;pr.ngSeen=0}
    // điểm kỹ năng hồi tố: chỉ bù khi hệ mới cho nhiều hơn số đã có
    pr.bsp=(S.cleared||[]).slice();let tot=pr.bsp.length;for(let l=2;l<=L;l++)tot+=spAt(l);
    let spent=0;for(const v of S.skl)spent+=Math.max(0,v-1);
    S.skl=S.skl.map(v=>Math.min(v,10));
    const add=Math.max(0,tot-spent-S.sp);S.sp+=add;
    // Chân Khí hồi tố theo công đã bỏ ra
    const cq=Math.round((S.kills||0)*0.15+(S.cleared||[]).length*60+L*12+pr.lh*3000);S.cq+=cq;S.tq+=Math.round((S.cleared||[]).length*4+pr.lh*20);
    pr.retro={sp:add,cq,tq:S.tq};
  }
  return pr}
window.progEnsure=progEnsure;

/* ---------- thưởng cộng dồn ---------- */
function realmIdx(){const p=ps();return p?p.realm:0}
window.realmIdx=realmIdx;
function merUnits(m){const p=ps();if(!p)return 0;const k=p.mer[m];return(p.ml-1)*14+k+(k>=MER_N?2:0)}
function progBonus(){const p=ps(),o={atk:0,hp:0,def:0,mp:0,crit:0,cdmg:0,aspd:0,spd:0,ls:0,exp:0,cdr:0};if(!p)return o;
  for(let i=1;i<=p.realm;i++){const b=REALMS[i].b;for(const k in b)o[k]+=b[k]}
  MER.forEach((m,i)=>{const u=merUnits(i);for(const k in m.u)o[k]+=m.u[k]*u});
  o.cdr=Math.min(30,o.cdr);o.lh=lhMul(p.lh);return o}
HK.on('stats',st=>{const S=G.save;if(!S||!S.prog)return;const b=progBonus();
  st.atk*=(1+b.atk/100)*b.lh;st.hp*=(1+b.hp/100)*b.lh;st.def*=1+b.def/100;st.mp*=1+b.mp/100;
  st.crit+=b.crit;st.cdmg+=b.cdmg;st.aspd+=b.aspd;st.spd+=b.spd;st.ls+=b.ls;st.exp+=b.exp;if(G.p)G.p.cdr=b.cdr});

/* ---------- quái theo cấp ---------- */
HK.on('spawn',e=>{const k=enemyHpK(e.lv),a=enemyAtkK(e.lv);e.max=e.hp=Math.max(1,Math.round(e.max*k));e.atk*=a});

/* ---------- kỹ năng: giới hạn và giá ---------- */
function skillCap(){return REALMS[realmIdx()].sk}
function skillUpCost(i){const S=G.save,lv=S.skl[i],nx=lv+1,sk=CLASS_BY_ID[S.cls].skills[i];const o={sp:1,tq:0,gold:0,realm:-1,can:false};
  if(lv<1||lv>=SKILL_MAX)return o;
  if(nx>skillCap()){o.realm=REALMS.findIndex(r=>r.sk>=nx);return o}
  if(nx>10){const k=nx-10;o.tq=Math.round(2*Math.pow(k,1.45));o.gold=Math.round(120*Math.pow(k,1.7))*100}
  o.can=S.lvl>=sk.un&&S.sp>=o.sp&&(S.tq||0)>=o.tq&&S.gold>=o.gold;return o}
function skillUp(i){const S=G.save,c=skillUpCost(i),lv=S.skl[i];
  if(lv<1)return'Kỹ năng chưa mở';if(lv>=SKILL_MAX)return'Đã đạt cấp tối đa';
  if(c.realm>=0)return'Cần Cảnh Giới '+REALMS[c.realm].n;
  if(S.sp<c.sp)return'Không đủ điểm kỹ năng';if((S.tq||0)<c.tq)return`Thiếu Tàn Quyển (cần ${c.tq})`;if(S.gold<c.gold)return`Thiếu vàng (cần ${fmt(c.gold)})`;
  S.sp-=c.sp;S.tq-=c.tq;S.gold-=c.gold;S.skl[i]++;saveGame();return''}
window.skillCap=skillCap;window.skillUpCost=skillUpCost;window.skillUp=skillUp;
/* bí kíp cấp 4 cần Đại Thành, cấp 5 cần Tông Sư */
window.progPerkCap=()=>REALMS[realmIdx()].pk;
window.progPerkCapNote=()=>{const c=REALMS[realmIdx()].pk;if(c>=5)return'';const nx=REALMS.findIndex(r=>r.pk>c);
  return`<p class="hist" style="color:var(--dim);margin-top:6px">Bí kíp hiện tối đa <b style="color:var(--vang2)">cấp ${c}</b>. Đột phá <b style="color:var(--vang2)">${esc(REALMS[nx].n)}</b> để mở cấp ${c+1}.</p>`};

/* ---------- nguồn Chân Khí & Tàn Quyển trong lúc chơi ---------- */
const cqMul=()=>1+0.5*(G.save.ng||0);
function cqGain(n,why,quiet){if(n<=0)return;giveRes('cq',n,why);if(!quiet)P.cqAcc+=n}
function tqGain(n,why){if(n<=0)return;giveRes('tq',n,why);P.tqAcc+=n}
HK.on('kill',e=>{const S=G.save;if(!S||!S.prog||e.boss||e.clone)return;
  if(e.elite){cqGain(Math.round((2+Math.floor(S.map/3))*cqMul()),'elite');if(Math.random()<0.04)tqGain(1,'elite')}
  else if(Math.random()<0.1)cqGain(Math.round(cqMul()),'kill')});
HK.on('tick',dt=>{P.cqT+=dt;if(P.cqT<1.2)return;P.cqT=0;
  if(P.cqAcc){UI.loot(`+${fmt(P.cqAcc)} Chân Khí`,'#8ff0ff');P.cqAcc=0}
  if(P.tqAcc){UI.loot(`+${P.tqAcc} Tàn Quyển`,'#ffcf8a');P.tqAcc=0}
  checkLH();checkReady();bossHint()});
/* nhắc cấp khuyên dùng khi bước boss mở mà nhân vật còn yếu */
function bossHint(){const S=G.save,M=curMap();if(!S||!M||G.state!=='play')return;const st=M.quest[S.qs[S.map]];const key=S.map+':'+S.ng;
  if(!st||st.t!=='boss'||P.hintK===key)return;P.hintK=key;const bl=M.lv[1]+lvOffset();
  if(S.lvl<bl-2)UI.toast(`Boss cấp ${bl}. Khuyên luyện tới cấp ${bl-2} (ổ quái, Dã Tẩu, quái triều cho thêm kinh nghiệm khi bạn thấp cấp).`,'warn')}
const _cs=completeStep;completeStep=function(){const S=G.save,mi=S.map;const r=_cs.apply(this,arguments);if(S.prog)cqGain(Math.round((3+2*mi)*cqMul()),'quest');return r};
const _bd=bossDefeated;bossDefeated=function(e){const S=G.save,mi=S.map;progEnsure(S);const first=!S.prog.bsp.includes(mi);
  const r=_bd.apply(this,arguments);
  const cq=Math.round((20+10*mi)*cqMul()),tq=first?3+mi:Math.ceil((3+mi)/2);cqGain(cq,'boss',true);tqGain(tq,'boss');
  let msg=`Boss: +${fmt(cq)} Chân Khí, +${tq} Tàn Quyển`;
  if(first){S.prog.bsp.push(mi);S.sp++;msg+=', +1 điểm kỹ năng'}
  setTimeout(()=>UI.toast(msg,'skill'),700);saveGame();return r};
const _se=sideEvent;sideEvent=function(){const S=G.save,c0=S.sideChain;const r=_se.apply(this,arguments);if(S.prog&&S.sideChain>c0)cqGain(Math.round((2+Math.floor(S.lvl/25))*cqMul()),'side');return r};
/* quái triều (systems.js) thưởng need×0,18: đổi sang bonusExp để không bị khai thác khi đường cong dốc */
const _uh=updateHorde;updateHorde=function(){const g0=gainExp;gainExp=function(x){const S=G.save;return g0.call(this,x>=need(S.lvl)*0.17&&x<=need(S.lvl)*0.19?bonusExp(0.18):x)};try{return _uh.apply(this,arguments)}finally{gainExp=g0}};
const _oc=openChest;openChest=function(){const r=_oc.apply(this,arguments);if(G.save.prog)cqGain(Math.round(3*cqMul()),'chest');return r};

/* ---------- Cảnh Giới: đột phá ---------- */
function canBreak(){const S=G.save,p=ps();if(!p||p.realm>=REALMS.length-1)return false;const R=REALMS[p.realm+1];return S.lvl>=R.lv&&(S.cq||0)>=R.cq&&HK.mod('canBreak',true,p.realm+1)!==false}
function breakthrough(){const S=G.save,p=ps();if(!p||p.realm>=REALMS.length-1)return'Đã đạt Cảnh Giới cao nhất';const R=REALMS[p.realm+1];
  if(S.lvl<R.lv)return`Cần đạt cấp ${R.lv}`;if((S.cq||0)<R.cq)return`Thiếu Chân Khí (cần ${fmtFull(R.cq)})`;
  const gate=HK.mod('breakGate','',p.realm+1);if(gate)return gate; // luyendan.js: đan dược và tỉ lệ thành công
  S.cq-=R.cq;p.realm++;const pl=G.p;const hpR=pl.hp/pl.maxhp;recalc();pl.hp=pl.maxhp;pl.mp=pl.maxmp;
  S.score+=2000*p.realm*p.realm;saveGame();HK.ev('realm',p.realm);
  breakFx(p.realm);return''}
function checkReady(){const S=G.save,p=ps();if(!p||G.state!=='play')return;const k=p.realm+':'+(canBreak()?1:0);if(k===P.readyK)return;
  const was=P.readyK;P.readyK=k;if(was!=null&&canBreak())UI.toast(`Đủ điều kiện đột phá ${REALMS[p.realm+1].n}! Mở Kỹ năng → Cảnh Giới.`,'skill')}

/* ---------- âm thanh ---------- */
function gong(big){if(!Audio_.on)return;Audio_.tone(62,2.8,'sine',0.38,55);[1,2.4,3.9,5.3,6.8].forEach((m,i)=>Audio_.tone(124*m,2.4-i*0.35,'sine',0.09/(i+1)));Audio_.noise(0.6,260,0.6,0.22);
  const sc=[392,440,523,587,659,784,880,1047,1175,1319];sc.forEach((f,i)=>Audio_.tone(f,0.8,'triangle',0.07,0,0.4+i*0.065));
  Audio_.tone(1568,1.6,'sine',0.06,0,1.1);if(big)Audio_.tone(196,1.8,'sawtooth',0.05,392,0.2)}
function chime(k){if(!Audio_.on)return;const f=[523,587,659,784,880,1047,1175,1319,1568,1760,2093,2349][k%12];Audio_.tone(f,0.5,'sine',0.11);Audio_.tone(f*1.5,0.35,'sine',0.04,0,0.05)}

/* ---------- giao diện ---------- */
const CSS=`
.skRes{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:10px}
.skRes>div{display:flex;flex-direction:column;align-items:center;gap:3px;padding:8px 4px;border-radius:10px;background:rgba(0,0,0,.28);border:1px solid rgba(226,178,74,.2);min-width:0}
.skRes b{font:800 17px/1 var(--f-ui);color:var(--vang2)}.skRes span{font:600 11px/1.1 var(--f-ui);color:var(--dim);text-align:center}
.skRule{margin:0 0 12px;font-size:12.5px}
#shTabs{flex-shrink:0}#shTabs .tab{min-height:44px}
.skCost{display:flex;flex-wrap:wrap;align-items:center;gap:4px 5px;margin-top:7px;font:600 12px/1.3 var(--f-ui);color:var(--ink)}
.skCost em{font-style:normal;color:var(--dim);margin-right:2px}.skCost em.g{color:var(--vang2);margin-left:2px}
.skCost span{padding:2px 7px;border-radius:999px;background:rgba(127,232,160,.12);border:1px solid rgba(127,232,160,.35);color:#9ff0c0;white-space:nowrap}
.skCost span.no{background:rgba(255,120,100,.12);border-color:rgba(255,120,100,.4);color:#ff9a8a}
.skCost.lockd{color:#ffb38a}.skCost.max{color:var(--vang2)}
.skc .skUp{min-height:44px;min-width:76px}
.rgHero{display:grid;grid-template-columns:84px 1fr;gap:14px;align-items:center;padding:14px;border-radius:14px;margin-bottom:12px;
  background:radial-gradient(ellipse at 15% 40%,color-mix(in srgb,var(--rc) 28%,transparent),transparent 65%),linear-gradient(160deg,#3a2619,#1a110c);border:1px solid color-mix(in srgb,var(--rc) 55%,#5a4020)}
.rgHero canvas{width:84px;height:84px}
.rgHero .k{font:700 11px/1 var(--f-ui);letter-spacing:.16em;color:var(--dim)}
.rgHero h3{margin:5px 0 4px;font:400 clamp(24px,6vw,32px)/1.05 var(--f-display);color:var(--rc);text-shadow:0 0 18px color-mix(in srgb,var(--rc) 45%,transparent)}
.rgHero p{margin:0;font:600 12.5px/1.45 var(--f-ui);color:var(--ink)}
.rgNext{padding:14px;border-radius:12px;background:rgba(0,0,0,.28);border:1px solid rgba(226,178,74,.25);margin-bottom:14px}
.rgNext h5{margin:0 0 8px;font:700 15px var(--f-ui)}.rgNext h5 em{font-style:normal;color:var(--rc)}
.rgBar{position:relative;height:22px;border-radius:11px;background:rgba(0,0,0,.45);border:1px solid rgba(226,178,74,.25);overflow:hidden;margin:6px 0}
.rgBar i{position:absolute;inset:0;transform-origin:0 50%;background:linear-gradient(90deg,#2a8a9a,#8ff0ff)}.rgBar.lv i{background:linear-gradient(90deg,#a8741a,#ffd98a)}
.rgBar b{position:absolute;inset:0;display:grid;place-items:center;font:700 11.5px var(--f-ui);color:#fff;text-shadow:0 1px 2px #000}
.rgGain{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0 12px}.rgGain span{padding:4px 9px;border-radius:999px;background:rgba(226,178,74,.12);border:1px solid rgba(226,178,74,.3);font:600 12px var(--f-ui);color:var(--vang2)}
.rgGo{min-height:52px;width:100%}
.rgList{display:flex;flex-direction:column;gap:6px}
.rgRow{display:grid;grid-template-columns:28px 1fr auto;gap:10px;align-items:center;padding:9px 11px;border-radius:10px;background:rgba(0,0,0,.2);border:1px solid rgba(226,178,74,.12);min-height:44px}
.rgRow i{width:26px;height:26px;border-radius:50%;display:grid;place-items:center;font:800 12px var(--f-ui);font-style:normal;color:#1a110c;background:var(--rc);opacity:.35}
.rgRow.done i,.rgRow.cur i{opacity:1}.rgRow.cur{border-color:var(--rc);background:color-mix(in srgb,var(--rc) 12%,rgba(0,0,0,.3))}
.rgRow b{display:block;font:700 14px var(--f-ui);color:var(--ink)}.rgRow.done b,.rgRow.cur b{color:var(--rc)}
.rgRow small{display:block;font:500 11.5px/1.35 var(--f-ui);color:var(--dim)}
.rgRow em{font:700 11.5px var(--f-ui);font-style:normal;color:var(--dim);text-align:right;white-space:nowrap}
.kmWrap{display:grid;gap:12px;grid-template-columns:minmax(0,1fr)}
.kmFig{position:relative;justify-self:center;width:min(100%,310px)}
.kmFig canvas{display:block;width:100%;aspect-ratio:1/1.12;border-radius:14px;background:radial-gradient(ellipse at 50% 40%,#2e2030,#120b0a 72%);border:1px solid rgba(226,178,74,.25);touch-action:manipulation}
.kmFig .lay{position:absolute;left:10px;top:8px;font:700 11px var(--f-ui);letter-spacing:.1em;color:var(--dim)}
.kmFig .cq{position:absolute;right:10px;top:8px;font:800 13px var(--f-ui);color:#8ff0ff}
.kmChips{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px}
.kmChip{display:flex;align-items:center;gap:8px;min-height:46px;padding:6px 10px;border-radius:10px;text-align:left;background:rgba(0,0,0,.25);border:1px solid rgba(226,178,74,.15);color:var(--ink);min-width:0}
.kmChip i{flex:none;width:12px;height:12px;border-radius:50%;background:var(--mc);box-shadow:0 0 8px var(--mc)}
.kmChip span{min-width:0;flex:1;font:700 12.5px/1.15 var(--f-ui);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.kmChip em{font:700 11.5px var(--f-ui);font-style:normal;color:var(--dim)}
.kmChip[aria-pressed="true"]{border-color:var(--mc);background:color-mix(in srgb,var(--mc) 16%,rgba(0,0,0,.3))}
.kmChip.lk{opacity:.5}
.kmCard{padding:12px 14px;border-radius:12px;background:rgba(0,0,0,.28);border:1px solid color-mix(in srgb,var(--mc) 45%,transparent)}
.kmCard h5{margin:0 0 4px;font:700 16px var(--f-ui);color:var(--mc)}.kmCard p{margin:0 0 6px;font:500 12.5px/1.45 var(--f-ui);color:var(--dim)}
.kmCard .ln{display:flex;justify-content:space-between;gap:10px;font:600 12.5px/1.6 var(--f-ui)}.kmCard .ln b{color:var(--vang2)}
.kmPips{display:flex;gap:3px;margin:6px 0 8px}.kmPips i{flex:1;height:7px;border-radius:4px;background:rgba(255,255,255,.1)}.kmPips i.f{background:var(--mc);box-shadow:0 0 6px var(--mc)}
.kmBtns{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}.kmBtns .btn{min-height:48px}
@media (min-width:640px),(max-height:500px){.kmWrap{grid-template-columns:minmax(220px,320px) minmax(0,1fr);align-items:start}.kmSide{display:flex;flex-direction:column;gap:10px}}
@media (max-height:500px){.kmFig{width:min(100%,250px)}.rgHero{grid-template-columns:64px 1fr}.rgHero canvas{width:64px;height:64px}}
#rgOv{position:absolute;inset:0;z-index:8;display:grid;place-items:center;overflow:hidden;pointer-events:auto;background:radial-gradient(ellipse at 50% 46%,color-mix(in srgb,var(--rc) 30%,rgba(20,10,5,.82)),rgba(8,4,2,.94) 65%)}
#rgOv .ray{position:absolute;left:50%;top:46%;width:180vmax;height:180vmax;margin:-90vmax 0 0 -90vmax;border-radius:50%;opacity:.22;
  background:repeating-conic-gradient(from 0deg,color-mix(in srgb,var(--rc) 70%,transparent) 0deg 2deg,transparent 2deg 12deg);animation:rgSpin 14s linear infinite;
  -webkit-mask:radial-gradient(circle,#000 0,#000 6%,transparent 30%);mask:radial-gradient(circle,#000 0,#000 6%,transparent 30%)}
@keyframes rgSpin{to{transform:rotate(360deg)}}
#rgOv .in{position:relative;text-align:center;padding:24px;max-width:min(92vw,560px)}
#rgOv .k{font:800 13px/1 var(--f-ui);letter-spacing:.32em;color:var(--vang2)}
#rgOv h2{margin:10px 0 8px;font:400 clamp(40px,11vw,76px)/1.02 var(--f-display);color:var(--rc);text-shadow:0 4px 0 #3a1a08,0 0 40px var(--rc)}
#rgOv p{margin:0 0 6px;font:600 14px/1.5 var(--f-ui);color:var(--ink)}
#rgOv .tap{margin-top:14px;font:600 12px var(--f-ui);color:var(--dim)}
@media (prefers-reduced-motion:reduce){#rgOv .ray{animation:none}}
`;
function dom(){if(P.dom)return P.dom;const st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
  const ov=document.createElement('div');ov.id='rgOv';ov.hidden=true;ov.setAttribute('role','alert');ov.innerHTML='<div class="ray"></div><div class="in"><div class="k" id="rgOvK"></div><h2 id="rgOvN"></h2><div id="rgOvB"></div><div class="tap">Chạm để tiếp tục</div></div>';
  $('#app').appendChild(ov);ov.addEventListener('click',()=>hideOv());P.dom={ov};return P.dom}
function hideOv(){const d=dom();if(d.ov.hidden)return;clearTimeout(P.ovT);if(anim&&!REDUCED)anim.to(d.ov,{autoAlpha:0,duration:.35,onComplete:()=>{d.ov.hidden=true;anim.set(d.ov,{autoAlpha:1})}});else d.ov.hidden=true}
function showOv(k,name,col,lines){const d=dom();d.ov.style.setProperty('--rc',col);$('#rgOvK').textContent=k;$('#rgOvN').textContent=name;
  $('#rgOvB').innerHTML=lines.map(l=>`<p>${l}</p>`).join('');d.ov.hidden=false;
  if(anim&&!REDUCED){anim.fromTo(d.ov,{autoAlpha:0},{autoAlpha:1,duration:.25});anim.fromTo('#rgOvN',{scale:2.4,autoAlpha:0,letterSpacing:'0.3em'},{scale:1,autoAlpha:1,letterSpacing:'0em',duration:.8,ease:'power4.out',delay:.15});
    anim.fromTo('#rgOvK',{y:-14,autoAlpha:0},{y:0,autoAlpha:1,duration:.4});anim.fromTo('#rgOvB p',{y:14,autoAlpha:0},{y:0,autoAlpha:1,duration:.35,stagger:.1,delay:.6})}
  clearTimeout(P.ovT);P.ovT=setTimeout(hideOv,3600)}
function bonusTxt(b){return Object.keys(b).map(k=>`+${String(b[k]).replace('.',',')}${BON_NAME[k][1]} ${BON_NAME[k][0]}`)}
function breakFx(ri){const R=REALMS[ri],p=G.p;UI.close();
  if(p){p.ifr=Math.max(p.ifr,2.5);G.fx.push({k:'pillar',x:p.x,y:p.y,w:80,h:640,col:R.c,life:1.8,max:1.8},{k:'ring',x:p.x,y:p.y,r:10,r2:320,life:0.9,max:0.9,col:R.c},{k:'ring',x:p.x,y:p.y,r:10,r2:200,life:0.6,max:0.6,col:'#fff4d0'},{k:'flash',x:p.x,y:p.y-20,r:260,col:R.c,life:0.7,max:0.7});
    for(let k=0;k<60;k++){const a=k/60*TAU;addPart(p.x+Math.cos(a)*24,p.y-20,Math.cos(a)*300,Math.sin(a)*170-80,1.2,k%2?R.c:'#fff4d0',3.5,0,'c',1)}
    enemiesIn(p.x,p.y,300).forEach(e=>{if(e.boss)return;const a=Math.atan2(e.y-p.y,e.x-p.x);e.kbx+=Math.cos(a)*420;e.kby+=Math.sin(a)*420;e.stun=Math.max(e.stun||0,0.8)});
    G.shake=Math.max(G.shake,14);G.slow=0.35;G.timers.push({t:0.5,fn:()=>{G.slow=1}})}
  gong(ri>=7);
  const lines=[bonusTxt(R.b).join(' · ')];const prev=REALMS[ri-1];
  if(R.sk>prev.sk)lines.push(`Kỹ năng tối đa cấp ${R.sk}`);if(R.pk>prev.pk)lines.push(`Bí kíp tối đa cấp ${R.pk}`);
  const mo=MER.filter(m=>m.r===ri);if(mo.length)lines.push('Mở '+mo.map(m=>m.n).join(', '));
  showOv('ĐỘT PHÁ CẢNH GIỚI',R.n,R.c,lines.map(esc));UI.toast(`Đột phá thành công: ${R.n}!`,'quest');postApp({type:'realm',realm:ri})}

/* ---------- Luân Hồi ---------- */
function checkLH(){const S=G.save,p=ps();if(!p)return;if(S.ng>p.ngSeen){const steps=S.ng-p.ngSeen;p.ngSeen=S.ng;
  for(let k=0;k<steps;k++){p.lh++;const r=lhReward(p.lh);giveRes('cq',r.cq,'luanhoi');giveRes('tq',r.tq,'luanhoi');S.gold+=r.gold}
  recalc();saveGame();const n=p.lh,r=lhReward(n);gong(true);
  showOv('LUÂN HỒI',lhTitle(n),'#ff7a3a',[`Vĩnh viễn ×${(1+lhGain(n)/100).toFixed(2).replace('.',',')} công và sinh lực`,`+${fmtFull(r.cq)} Chân Khí · +${r.tq} Tàn Quyển · +${fmt(r.gold)} vàng`,`Quái mạnh hơn ${LH_STEP*S.ng} cấp. Giữ cấp, trang bị, Cảnh Giới và Kinh Mạch.`]);
  HK.ev('luanhoi',n)}}
const _cc=UI.chapterClear;UI.chapterClear=function(){const r=_cc.apply(this,arguments);const el=$('#clearPaper');
  if(el)for(const pp of el.querySelectorAll('p'))if(/Luân Hồi/.test(pp.textContent)){const n=(ps()?ps().lh:0)+1,rw=lhReward(n);
    pp.textContent=`${pp.textContent.split('.')[0]}. Có thể Luân Hồi ${lhTitle(n)}: quái mạnh hơn ${LH_STEP} cấp mỗi vòng; nhận vĩnh viễn ×${(1+lhGain(n)/100).toFixed(2).replace('.',',')} công và sinh lực, ${fmtFull(rw.cq)} Chân Khí, ${rw.tq} Tàn Quyển. Giữ cấp, trang bị, Cảnh Giới và Kinh Mạch.`}
  return r};

/* ---------- Kinh Mạch: khai huyệt ---------- */
function merLock(m){const p=ps();if(p.ml===1)return MER[m].r>p.realm?MER[m].r:-1;const need=LAYER_REALM(p.ml);return need>p.realm?need:-1}
function merNext(m){const p=ps();const k=p.mer[m];if(k>=MER_N)return null;return{k,cost:merCost(m,k,p.ml),lock:merLock(m)}}
function openPoint(m){const S=G.save,p=ps(),nx=merNext(m);if(!nx)return'Mạch này đã khai đủ 12 huyệt ở tầng này';
  if(nx.lock>=0)return'Cần Cảnh Giới '+REALMS[nx.lock].n;if((S.cq||0)<nx.cost)return`Thiếu Chân Khí (cần ${fmtFull(nx.cost)})`;
  S.cq-=nx.cost;p.mer[m]++;const pl=G.p;const hpR=pl.hp/pl.maxhp;recalc();pl.hp=Math.round(pl.maxhp*hpR);
  P.flashPt={m,k:nx.k,t:performance.now()};chime(nx.k);if(nx.k===MER_N-1){Audio_.play('quest');UI.toast(`Thông ${MER[m].n}! Huyệt chủ ${MER[m].key} khai mở.`,'quest')}
  HK.ev('meridian',m,p.mer[m]);return''}
function allFull(){return ps().mer.every(k=>k>=MER_N)}
function nextLayer(){const p=ps();if(!allFull())return'Chưa khai đủ 96 huyệt';const need=LAYER_REALM(p.ml+1);if(p.realm<need)return'Cần Cảnh Giới '+REALMS[need].n;
  p.ml++;p.mer=[0,0,0,0,0,0,0,0];recalc();saveGame();gong(true);
  showOv('ĐẠI CHU THIÊN',`Kinh Mạch tầng ${p.ml}`,'#8ff0ff',['Toàn bộ thưởng tầng trước được giữ nguyên.','Khai lại 96 huyệt ở tầng mới để nhận thêm một lần nữa.']);return''}

/* vẽ hình người ngồi thiền và kinh mạch */
function figPath(g,W,H){const X=v=>v*W,Y=v=>(v+FIG_DY)*H;g.beginPath();
  g.ellipse(X(0.5),Y(0.75),X(0.37),Y(0.085),0,0,TAU);              // chân xếp bằng
  g.moveTo(X(0.36),Y(0.62));g.quadraticCurveTo(X(0.33),Y(0.45),X(0.36),Y(0.33));g.quadraticCurveTo(X(0.42),Y(0.29),X(0.47),Y(0.27));
  g.lineTo(X(0.47),Y(0.23));g.lineTo(X(0.53),Y(0.23));g.lineTo(X(0.53),Y(0.27));g.quadraticCurveTo(X(0.58),Y(0.29),X(0.64),Y(0.33));
  g.quadraticCurveTo(X(0.67),Y(0.45),X(0.64),Y(0.62));g.closePath();
  g.moveTo(X(0.5)+X(0.07),Y(0.155));g.ellipse(X(0.5),Y(0.155),X(0.07),Y(0.072),0,0,TAU)}
function drawFig(c,t){const S=G.save,p=ps();if(!p)return;const dpr=Math.min(2.5,window.devicePixelRatio||1);const r=c.getBoundingClientRect();if(!r.width)return;
  const W=Math.round(r.width*dpr),H=Math.round(r.height*dpr);if(c.width!==W||c.height!==H){c.width=W;c.height=H}
  const g=c.getContext('2d');g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,W,H);const X=v=>v*W,Y=v=>(v+FIG_DY)*H,u=W/320;
  // hào quang sau lưng
  const gr=g.createRadialGradient(X(0.5),Y(0.42),4,X(0.5),Y(0.42),X(0.55));const lc=REALMS[p.realm].c;gr.addColorStop(0,'rgba(255,220,150,.16)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,W,H);
  g.save();g.globalAlpha=0.25+0.05*Math.sin(t*1.3);g.strokeStyle=lc;g.lineWidth=1.5*u;g.beginPath();g.arc(X(0.5),Y(0.155),X(0.12),0,TAU);g.stroke();g.restore();
  // thân
  const bg=g.createLinearGradient(0,Y(0.08),0,Y(0.85));bg.addColorStop(0,'#5a4134');bg.addColorStop(1,'#2a1c16');
  figPath(g,W,H);g.fillStyle=bg;g.fill();g.strokeStyle='rgba(255,217,138,.35)';g.lineWidth=1.4*u;g.stroke();
  // tay đặt trên gối
  g.lineCap='round';g.lineJoin='round';g.strokeStyle='#45322a';g.lineWidth=X(0.055);
  for(const s of[-1,1]){g.beginPath();g.moveTo(X(0.5+s*0.15),Y(0.32));g.quadraticCurveTo(X(0.5+s*0.25),Y(0.45),X(0.5+s*0.27),Y(0.53));g.quadraticCurveTo(X(0.5+s*0.29),Y(0.63),X(0.5+s*0.28),Y(0.7));g.stroke()}
  g.strokeStyle='rgba(255,217,138,.22)';g.lineWidth=1.2*u;for(const s of[-1,1]){g.beginPath();g.moveTo(X(0.5+s*0.15),Y(0.32));g.quadraticCurveTo(X(0.5+s*0.25),Y(0.45),X(0.5+s*0.27),Y(0.53));g.quadraticCurveTo(X(0.5+s*0.29),Y(0.63),X(0.5+s*0.28),Y(0.7));g.stroke()}
  // đan điền
  const dg=g.createRadialGradient(X(0.5),Y(0.56),1,X(0.5),Y(0.56),X(0.08));dg.addColorStop(0,`rgba(255,230,160,${0.35+0.15*Math.sin(t*2)})`);dg.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=dg;g.beginPath();g.arc(X(0.5),Y(0.56),X(0.08),0,TAU);g.fill();
  // mạch
  const fl=P.flashPt,now=performance.now();
  MER.forEach((m,i)=>{const pts=MER_PTS[i],k=p.mer[i],sel=i===P.sel,lock=merLock(i)>=0;const path=MER_PATH[i];
    g.globalAlpha=lock?0.25:sel?0.95:0.5;g.strokeStyle=m.c;g.lineWidth=(sel?2.6:1.4)*u;g.setLineDash(lock?[3*u,4*u]:[]);
    g.beginPath();path.forEach(([x,y],j)=>j?g.lineTo(X(x),Y(y)):g.moveTo(X(x),Y(y)));g.stroke();g.setLineDash([]);
    if(k>0&&!lock){g.globalAlpha=sel?0.9:0.6;g.lineWidth=(sel?4:2.6)*u;g.shadowColor=m.c;g.shadowBlur=10*u;g.beginPath();for(let j=0;j<k;j++){const q=pts[j];j?g.lineTo(X(q[0]),Y(q[1])):g.moveTo(X(q[0]),Y(q[1]))}g.stroke();g.shadowBlur=0}
    pts.forEach((q,j)=>{const on=j<k,key=j===MER_N-1,nxt=j===k&&!lock;let rr=(key?5.2:3.4)*u*(sel?1.2:1);
      g.globalAlpha=lock?0.35:1;
      if(on){g.shadowColor=m.c;g.shadowBlur=(key?16:10)*u;g.fillStyle=m.c;g.beginPath();g.arc(X(q[0]),Y(q[1]),rr,0,TAU);g.fill();g.shadowBlur=0;g.fillStyle='#fff8e6';g.beginPath();g.arc(X(q[0]),Y(q[1]),rr*0.45,0,TAU);g.fill()}
      else{g.fillStyle='#1a120e';g.strokeStyle=m.c;g.lineWidth=1.3*u;g.beginPath();g.arc(X(q[0]),Y(q[1]),rr,0,TAU);g.fill();g.stroke()}
      if(nxt&&sel){const pu=(Math.sin(t*5)+1)/2;g.globalAlpha=0.35+0.4*pu;g.strokeStyle=m.c;g.lineWidth=2*u;g.beginPath();g.arc(X(q[0]),Y(q[1]),rr+4*u+3*u*pu,0,TAU);g.stroke()}
      if(fl&&fl.m===i&&fl.k===j){const a=(now-fl.t)/700;if(a<1){g.globalAlpha=1-a;g.strokeStyle='#fff4d0';g.lineWidth=3*u;g.beginPath();g.arc(X(q[0]),Y(q[1]),rr+a*26*u,0,TAU);g.stroke()}}});
    g.globalAlpha=1});
  // khí chạy dọc mạch đã khai
  MER.forEach((m,i)=>{const k=p.mer[i];if(k<2||merLock(i)>=0)return;const pts=MER_PTS[i];const f=((t*0.35+i*0.13)%1)*(k-1),j=Math.floor(f),a=f-j;const A=pts[j],B=pts[Math.min(j+1,k-1)];
    const x=X(lerp(A[0],B[0],a)),y=Y(lerp(A[1],B[1],a));g.globalCompositeOperation='lighter';const q=g.createRadialGradient(x,y,0,x,y,9*u);q.addColorStop(0,m.c);q.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=q;g.beginPath();g.arc(x,y,9*u,0,TAU);g.fill();g.globalCompositeOperation='source-over'})}
function animFig(){cancelAnimationFrame(P.raf);let last=0;const loop=ts=>{const c=document.getElementById('kmCv');if(!c||!c.isConnected||UI.panel!=='skill'){P.raf=0;return}
    if(ts-last>32){last=ts;drawFig(c,ts/1000)}P.raf=requestAnimationFrame(loop)};P.raf=requestAnimationFrame(loop)}
function pickPt(c,ev){const r=c.getBoundingClientRect(),x=(ev.clientX-r.left)/r.width,y=(ev.clientY-r.top)/r.height;let best=-1,bd=1e9;
  MER_PTS.forEach((pts,i)=>pts.forEach(q=>{const d=Math.hypot((q[0]-x)*r.width,(q[1]+FIG_DY-y)*r.height);if(d<bd){bd=d;best=i}}));return bd<30?best:-1}

/* vẽ ấn Cảnh Giới */
function drawSeal(c,ri){const g=c.getContext('2d'),S=c.width,R=REALMS[ri],col=R.c;g.clearRect(0,0,S,S);g.save();g.scale(S/100,S/100);
  const gr=g.createRadialGradient(50,45,4,50,50,48);gr.addColorStop(0,shade(col,-0.1));gr.addColorStop(0.6,shade(col,0.55));gr.addColorStop(1,'#140b07');g.fillStyle=gr;g.beginPath();g.arc(50,50,47,0,TAU);g.fill();
  g.strokeStyle=col;g.lineWidth=2.5;g.beginPath();g.arc(50,50,45,0,TAU);g.stroke();g.lineWidth=1.2;g.beginPath();g.arc(50,50,38,0,TAU);g.stroke();
  // bát quái: 8 quẻ quanh vòng
  g.fillStyle=col;for(let k=0;k<8;k++){g.save();g.translate(50,50);g.rotate(k/8*TAU);for(let j=0;j<3;j++){const y=-41+j*3.6,bk=((k>>j)&1);if(bk){g.fillRect(-6,y,5,2.2);g.fillRect(1,y,5,2.2)}else g.fillRect(-6,y,12,2.2)}g.restore()}
  // ngọn khí giữa
  g.shadowColor=col;g.shadowBlur=12;g.fillStyle='#fff6e0';g.beginPath();g.moveTo(50,22);g.bezierCurveTo(66,40,68,54,58,66);g.quadraticCurveTo(50,74,42,66);g.bezierCurveTo(32,54,36,42,44,36);g.quadraticCurveTo(44,48,50,50);g.quadraticCurveTo(44,36,50,22);g.fill();
  g.shadowBlur=0;g.fillStyle=col;g.font='800 13px "Be Vietnam Pro",sans-serif';g.textAlign='center';g.fillText(ri,50,86);g.restore()}

/* ---- thẻ Cảnh Giới ---- */
function realmHtml(){const S=G.save,p=ps(),R=REALMS[p.realm],nx=REALMS[p.realm+1],b=progBonus();
  const tot=['atk','hp','def','crit','cdmg','aspd','spd'].filter(k=>{let v=0;for(let i=1;i<=p.realm;i++)v+=REALMS[i].b[k]||0;return v}).map(k=>{let v=0;for(let i=1;i<=p.realm;i++)v+=REALMS[i].b[k]||0;return`+${v}${BON_NAME[k][1]} ${BON_NAME[k][0]}`});
  let h=`<div class="rgHero" style="--rc:${R.c}"><canvas id="rgSeal" width="168" height="168"></canvas><div><div class="k">CẢNH GIỚI ${p.realm}/${REALMS.length-1}${p.lh?' · '+esc(lhTitle(p.lh).toUpperCase()):''}</div><h3>${esc(R.n)}</h3><p>${tot.length?esc(tot.join(' · ')):'Chưa có thưởng. Tích Chân Khí để đột phá Sơ Nhập ở cấp 10.'}</p>
    <p style="color:var(--dim);font-weight:500">Kỹ năng tối đa cấp ${R.sk} · Bí kíp tối đa cấp ${R.pk}${p.lh?` · Luân Hồi ×${b.lh.toFixed(2).replace('.',',')} công, sinh lực`:''}</p></div></div>`;
  if(nx){const lvOk=S.lvl>=nx.lv,cqOk=(S.cq||0)>=nx.cq;const gain=bonusTxt(nx.b);if(nx.sk>R.sk)gain.push(`Kỹ năng cấp ${nx.sk}`);if(nx.pk>R.pk)gain.push(`Bí kíp cấp ${nx.pk}`);MER.filter(m=>m.r===p.realm+1).forEach(m=>gain.push('Mở '+m.n));
    h+=`<div class="rgNext" style="--rc:${nx.c}"><h5>Đột phá: <em>${esc(nx.n)}</em></h5>
      <div class="rgBar lv"><i style="transform:scaleX(${Math.min(1,S.lvl/nx.lv)})"></i><b>Cấp ${S.lvl} / ${nx.lv}${lvOk?' ✓':''}</b></div>
      <div class="rgBar"><i style="transform:scaleX(${Math.min(1,(S.cq||0)/nx.cq)})"></i><b>Chân Khí ${fmtFull(S.cq||0)} / ${fmtFull(nx.cq)}${cqOk?' ✓':''}</b></div>
      ${HK.mod('realmExtra','',p.realm+1)}<div class="rgGain">${gain.map(x=>`<span>${esc(x)}</span>`).join('')}</div>
      <button class="btn gold rgGo" id="rgGo" ${lvOk&&cqOk?'':'disabled'}>${lvOk&&cqOk?'Đột phá '+esc(nx.n):!lvOk?'Cần cấp '+nx.lv:'Cần thêm '+fmtFull(nx.cq-(S.cq||0))+' Chân Khí'}</button></div>`}
  else h+=`<div class="rgNext"><h5>Đã đạt cảnh giới cao nhất. Tiếp tục khai Kinh Mạch và Luân Hồi.</h5></div>`;
  h+=`<div class="sec"><h4>CON ĐƯỜNG VÕ ĐẠO</h4><div class="rgList">${REALMS.slice(1).map((r,j)=>{const i=j+1,st=i<=p.realm?(i===p.realm?'cur':'done'):'';
    return`<div class="rgRow ${st}" style="--rc:${r.c}"><i>${i}</i><div><b>${esc(r.n)}</b><small>${esc(bonusTxt(r.b).join(' · '))}${r.sk>REALMS[i-1].sk?' · kỹ năng '+r.sk:''}${r.pk>REALMS[i-1].pk?' · bí kíp '+r.pk:''}</small></div><em>cấp ${r.lv}<br>${fmt(r.cq)} CK</em></div>`}).join('')}</div></div>`;
  const n=p.lh+1,rw=lhReward(n);
  h+=`<div class="sec"><h4>LUÂN HỒI${p.lh?' · '+esc(lhTitle(p.lh).toUpperCase()):''}</h4><p class="hist">Hạ boss chương cuối để Luân Hồi: quái mạnh hơn ${LH_STEP} cấp mỗi vòng, vô hạn vòng. Lần tới (${esc(lhTitle(n))}): vĩnh viễn ×${(1+lhGain(n)/100).toFixed(2).replace('.',',')} công và sinh lực, ${fmtFull(rw.cq)} Chân Khí, ${rw.tq} Tàn Quyển, ${fmt(rw.gold)} vàng. Giữ cấp, trang bị, Cảnh Giới, Kinh Mạch.${p.mig?` Đã ghi nhận ${p.mig} lần Luân Hồi từ bản cũ.`:''}</p></div>
    <div class="sec"><h4>NGUỒN CHÂN KHÍ</h4><p class="hist" style="color:var(--dim)">Quái thường thỉnh thoảng rơi, quái tinh anh, nhiệm vụ, rương báu và boss đều cho Chân Khí. Vượt Tháp, nhiệm vụ hằng ngày và Bế quan cho nhiều nhất. Tàn Quyển rơi từ boss và tinh anh, dùng nâng kỹ năng trên cấp 10.</p></div>`;
  return h}
function bindRealm(body){const c=body.querySelector('#rgSeal');if(c)drawSeal(c,realmIdx());const b=body.querySelector('#rgGo');if(b)b.onclick=()=>{if(HK.mod('realmGo',false,realmIdx()+1))return;const e=breakthrough();if(e)UI.toast(e,'warn')}}

/* ---- thẻ Kinh Mạch ---- */
function merHtml(){const S=G.save,p=ps();if(P.sel==null)P.sel=0;const i=P.sel,m=MER[i],k=p.mer[i],nx=merNext(i),u=merUnits(i);
  const cur=Object.keys(m.u).map(x=>`+${String(Math.round(m.u[x]*u*100)/100).replace('.',',')}${BON_NAME[x][1]} ${BON_NAME[x][0]}`).join(', ');
  const step=nx?Object.keys(m.u).map(x=>`+${String(Math.round(m.u[x]*(nx.k===MER_N-1?3:1)*100)/100).replace('.',',')}${BON_NAME[x][1]} ${BON_NAME[x][0]}`).join(', '):'';
  const full=allFull(),opened=p.mer.reduce((a,b)=>a+b,0);
  let card=`<div class="kmCard" style="--mc:${m.c}"><h5>${esc(m.n)}</h5><p>${esc(m.d)}</p><div class="kmPips">${Array.from({length:MER_N},(_,j)=>`<i class="${j<k?'f':''}"></i>`).join('')}</div>
    <div class="ln"><span>Huyệt đã khai</span><b>${k}/${MER_N}</b></div><div class="ln"><span>Thưởng mạch này (mọi tầng)</span><b>${cur||'Chưa có'}</b></div>`;
  if(nx){card+=`<div class="ln"><span>${nx.k===MER_N-1?'Huyệt chủ '+esc(m.key):'Huyệt thứ '+(nx.k+1)}</span><b>${step}</b></div><div class="ln"><span>Giá</span><b style="color:${(S.cq||0)>=nx.cost?'#8ff0ff':'#ff8a7a'}">${fmtFull(nx.cost)} Chân Khí</b></div>`;
    if(nx.lock>=0)card+=`<p style="color:#ffb38a;margin-top:6px">Cần Cảnh Giới <b>${esc(REALMS[nx.lock].n)}</b> để khai mạch này${p.ml>1?' ở tầng '+p.ml:''}.</p>`;
    card+=`<div class="kmBtns"><button class="btn" id="kmOpen" ${nx.lock<0&&(S.cq||0)>=nx.cost?'':'disabled'}>Khai huyệt</button><button class="btn sec" id="kmMax" ${nx.lock<0&&(S.cq||0)>=nx.cost?'':'disabled'}>Khai tối đa</button></div>`}
  else if(full){const need=LAYER_REALM(p.ml+1);card+=`<p style="margin-top:8px;color:var(--vang2)">Đã khai đủ 96 huyệt tầng ${p.ml}. Đại Chu Thiên để sang tầng ${p.ml+1} (giá huyệt ×3,5, thưởng cộng thêm).</p><div class="kmBtns" style="grid-template-columns:1fr"><button class="btn gold" id="kmLayer" ${p.realm>=need?'':'disabled'}>${p.realm>=need?'Đại Chu Thiên':'Cần Cảnh Giới '+esc(REALMS[need].n)}</button></div>`}
  else card+=`<p style="margin-top:8px;color:var(--vang2)">Mạch đã thông. Khai đủ cả 8 mạch để Đại Chu Thiên sang tầng ${p.ml+1}.</p>`;
  card+='</div>';
  const chips=MER.map((x,j)=>`<button class="kmChip${merLock(j)>=0?' lk':''}" style="--mc:${x.c}" data-m="${j}" aria-pressed="${j===i}"><i></i><span>${esc(x.n)}</span><em>${p.mer[j]}/${MER_N}</em></button>`).join('');
  return`<div class="kmWrap"><div class="kmFig"><canvas id="kmCv" aria-label="Kinh mạch: ${opened} trên 96 huyệt đã khai"></canvas><span class="lay">TẦNG ${p.ml} · ${opened}/96</span><span class="cq">${fmtFull(S.cq||0)} CK</span></div>
    <div class="kmSide"><div class="kmChips">${chips}</div>${card}<p class="hist" style="color:var(--dim);margin:0">Kỳ Kinh Bát Mạch: 8 mạch, mỗi mạch 12 huyệt, khai theo thứ tự. Huyệt chủ thứ 12 cho thưởng gấp 3. Khai đủ 96 huyệt thì Đại Chu Thiên lên tầng mới, giữ mọi thưởng cũ.</p></div></div>`}
function bindMer(body){const c=body.querySelector('#kmCv');
  body.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{P.sel=+b.dataset.m;Audio_.play('ui');UI.render()});
  if(c){c.addEventListener('click',ev=>{const m=pickPt(c,ev);if(m>=0&&m!==P.sel){P.sel=m;Audio_.play('ui');UI.render()}});drawFig(c,performance.now()/1000);animFig()}
  const o=body.querySelector('#kmOpen');if(o)o.onclick=()=>{const e=openPoint(P.sel);if(e)UI.toast(e,'warn');saveGame();UI.render()};
  const mx=body.querySelector('#kmMax');if(mx)mx.onclick=()=>{let n=0;for(let g=0;g<MER_N;g++){const nx=merNext(P.sel);if(!nx||nx.lock>=0||(G.save.cq||0)<nx.cost)break;openPoint(P.sel);n++}if(n)UI.toast(`Khai ${n} huyệt ${MER[P.sel].n}`,'skill');saveGame();UI.render()};
  const ly=body.querySelector('#kmLayer');if(ly)ly.onclick=()=>{const e=nextLayer();if(e)UI.toast(e,'warn');else UI.render()}}

/* ---- gắn thẻ vào bảng Kỹ năng ---- */
const TABS=[['vc','Võ công'],['cg','Cảnh Giới'],['km','Kinh Mạch']];
const _ps=UI.p_skill;UI.p_skill=function(){progEnsure();const t=this.tab&&TABS.some(x=>x[0]===this.tab)?this.tab:'vc';this.tab=t;dom();if(P.lastTab!==t){if(P.lastTab)queueMicrotask(()=>{const b=$('#shBody');if(b)b.scrollTop=0});P.lastTab=t}
  this.setTabs(TABS.map(([k,l])=>[k,l+(k==='cg'&&canBreak()?' •':'')]),t);
  if(t==='cg')return realmHtml();if(t==='km')return merHtml();return _ps.apply(this,arguments)};
const _cl=UI.close;UI.close=function(){P.lastTab=null;return _cl.apply(this,arguments)};
const _bs=UI.b_skill;UI.b_skill=function(body){const t=this.tab;if(t==='cg')return bindRealm(body);if(t==='km')return bindMer(body);return _bs.apply(this,arguments)};

/* ---------- danh hiệu trên HUD, chấm báo đột phá ---------- */
const _hud=UI.hud;UI.hud=function(){const r=_hud.apply(this,arguments);const S=G.save,p=ps();if(!S||!p)return r;
  const br=canBreak(),key=p.realm+'|'+this.cache.lv+'|'+br+'|'+S.sp;if(key!==P.hudKey){P.hudKey=key;const el=$('#pRank');
    if(el&&p.realm>0){el.textContent=REALMS[p.realm].n;el.style.color=REALMS[p.realm].c}else if(el)el.style.color='';
    if(br&&!S.sp){const d=document.querySelector('[data-p="skill"] .dot');if(d){d.hidden=false;d.textContent='!'}}}
  return r};

/* ---------- hào quang Cảnh Giới dưới chân và danh hiệu trên đầu ---------- */
const _da=drawAura;drawAura=function(pl){const p=ps();if(p&&p.realm>0&&G.state!=='title'&&!(window.OF&&OF.aura))realmAura(pl,p.realm,p.lh);return _da.apply(this,arguments)};
function realmAura(pl,ri,lh){const col=REALMS[ri].c,t=G.t,tier=ri>=9?3:ri>=6?2:ri>=3?1:0;
  cx.save();cx.translate(pl.x,pl.y);
  additive(()=>{cx.save();cx.scale(1,0.38);const R=36+tier*6;cx.globalAlpha=0.45;cx.strokeStyle=col;cx.lineWidth=1.6;cx.beginPath();cx.arc(0,0,R,0,TAU);cx.stroke();
    if(tier>=1){cx.rotate(-t*0.6);cx.globalAlpha=0.7;cx.fillStyle=col;for(let k=0;k<8;k++){cx.rotate(TAU/8);const bk=k&1;for(let j=0;j<3;j++){const y=R-4-j*3.4;if((k>>j)&1){cx.fillRect(-6,y,4.5,1.8);cx.fillRect(1.5,y,4.5,1.8)}else cx.fillRect(-6,y,12,1.8)}}}
    glow(0,0,R+12,col,0.22+0.06*Math.sin(t*2));cx.restore();
    if(tier>=2){cx.globalAlpha=0.13+0.04*Math.sin(t*1.7);const gr=cx.createLinearGradient(0,-150,0,0);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,col);cx.fillStyle=gr;cx.fillRect(-20,-150,40,150)}
    if(tier>=3){for(let k=0;k<3;k++){const a=t*1.6+k*TAU/3;glow(Math.cos(a)*30,-30+Math.sin(a)*10,9,col,0.85)}}
  },'lighter');
  if(Math.random()<0.12+0.08*tier)addPart(pl.x+rand(-18,18),pl.y-rand(0,6),rand(-5,5),rand(-80,-50),rand(0.7,1.1),col,rand(1.4,2.4),-30,'c',1);
  cx.globalAlpha=0.92;cx.font='400 12px "Yeseva One",serif';cx.textAlign='center';const ty=ridingMount()?-112:-92;const txt=REALMS[ri].n+(lh?' · '+lhTitle(lh):'');
  cx.lineWidth=3;cx.strokeStyle='rgba(20,10,5,.75)';cx.strokeText(txt,0,ty);cx.fillStyle=col;cx.fillText(txt,0,ty);
  cx.restore();cx.globalAlpha=1}

/* ---------- khởi động ---------- */
const _tv=travel;travel=function(){const r=_tv.apply(this,arguments);if(G.save&&G.save.prog)setTimeout(checkLH,300);return r};
const _sg=startGame;startGame=function(){const S=G.save;const fresh=S&&!S.prog;const pr=progEnsure(S);P.hudKey='';P.readyK=null;
  const r=_sg.apply(this,arguments);dom();
  if(fresh&&pr&&pr.retro){const x=pr.retro;setTimeout(()=>UI.toast(`Hành trình mở rộng 12 chương! Bù ${x.sp} điểm kỹ năng, ${fmtFull(x.cq)} Chân Khí. Xem Kỹ năng → Cảnh Giới.`,'quest'),1600);
    if(pr.mig)setTimeout(()=>UI.toast(`Ghi nhận ${pr.mig} lần Luân Hồi cũ: giữ thưởng vĩnh viễn, quái trở về cấp gốc.`,'quest'),3200)}
  recalc();return r};

/* ---------- cho bot và mô-đun khác ---------- */
window.PROG={REALMS,MER,MER_N,bonus:progBonus,breakthrough,canBreak,openPoint,merNext,nextLayer,allFull,merCost,lhMul,lhReward,lhTitle,enemyHpK,enemyAtkK,reward:progReward,
  units:merUnits,_P:P,
  /* bot: tiêu Chân Khí như người chơi hợp lý (đột phá trước, sau đó khai huyệt rẻ nhất) */
  autoSpend(){const S=G.save;let n=0;while(canBreak()){breakthrough();hideOv();n++}
    for(let g=0;g<200;g++){let bi=-1,bc=1e18;for(let m=0;m<8;m++){const nx=merNext(m);if(nx&&nx.lock<0&&nx.cost<bc){bc=nx.cost;bi=m}}
      const nxR=REALMS[realmIdx()+1];const reserve=nxR&&S.lvl>=nxR.lv-8?nxR.cq:0;
      if(bi<0||(S.cq||0)-bc<reserve)break;openPoint(bi);n++}
    if(allFull())nextLayer();return n}};
})();

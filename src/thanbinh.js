/* ============ THẦN BINH: Thần Tính vũ khí (thanbinh.js) ============
   - Vũ khí phẩm Hiếm trở lên khi rơi/tạo ra mang một Thần Tính (it.tt={k,lv,q}): đổi cách đánh thường.
     q=2 "Thượng phẩm" chỉ có ở Truyền Thuyết, Thần Khí, Huyền Thoại. Cấp Thần Tính 1..trần (trần theo cấp đồ, tối đa 10).
   - Mỗi Thần Tính thuộc một hệ Ngũ Hành; hệ khắc hệ của quái thì sát thương Thần Tính +15%.
   - Chỉ đòn đánh thường (o.basic, gắn ở game.js) mới kích hoạt; đòn do Thần Tính gây ra mang o.proc=1 nên không đệ quy.
   - Lò Rèn: tẩy (đổi) Thần Tính, thăng cấp, khai mở cho vũ khí cũ chưa có. Thẻ "Thần Binh" trong bảng Võ Đạo.
   - Lưu: G.save.tb={seen:[...]} (tạo lười).  Xuất: window.TB */
(function(){
const EL={kim:{n:'Kim',c:'#f2d675',d:'#5e4a12'},moc:{n:'Mộc',c:'#7fd85e',d:'#1d4a17'},thuy:{n:'Thủy',c:'#5cb8ff',d:'#10305a'},
  hoa:{n:'Hỏa',c:'#ff6b3d',d:'#5e1406'},tho:{n:'Thổ',c:'#d9a463',d:'#4e3210'}};
const KHAC={kim:'moc',moc:'tho',tho:'thuy',thuy:'hoa',hoa:'kim'};
const EGLY={kim:'M12 4.2L17.6 12 12 19.8 6.4 12Z',moc:'M12 4C17.5 7 18.6 14.6 12 20 5.4 14.6 6.5 7 12 4Z',
  thuy:'M12 4C14.6 8.4 17.6 11.4 17.6 14.6A5.6 5.6 0 0 1 6.4 14.6C6.4 11.4 9.4 8.4 12 4Z',
  hoa:'M12 3.4C13.8 7 17.6 9 17 14 16.5 18 14 20 12 20 9 20 6.6 18 7 14 7.3 11.4 8.7 10.3 9.8 8.4 10.4 10.4 11 11.2 12 11.4 12.6 9.2 12.6 6.4 12 3.4Z',
  tho:'M4.2 18.4L9.8 8.2 12.8 12.8 15 9.6 19.8 18.4Z'};

/* ---------- định nghĩa Thần Tính ----------
   Mục tiêu cân bằng: S=1 (cấp 1, thường phẩm) ≈ +10% sát thương đánh thường một mục tiêu; S≈2 (cấp 10 Thượng phẩm) ≈ +20–25%.
   Ib = khoảng đánh gốc của phái, để hiệu ứng theo thời gian công bằng giữa phái đánh nhanh và chậm. */
const pc=v=>Math.round(v*100);
const TRAITS={
 phikiem:{n:'Phi Kiếm Hộ Thân',el:'kim',col:'#dff2ff',tx:'Phi Kiếm',fl:'Kiếm khách Đông A luyện kiếm theo ý, kiếm rời tay mà vẫn giữ chủ.',
  P:(S,q,lv,Ib)=>{const n=Math.min(4,2+(q>1?1:0)+(lv>=6?1:0)),cd=1.8;return{n,cd,m:0.11*S/Ib*(cd+0.4)/n}},
  d:P=>`${P.n} thanh tiểu kiếm bay quanh người, tự lao vào kẻ địch trong tầm (mỗi nhát ${pc(P.m)}% công, mỗi kiếm ${P.cd} giây một lần).`},
 loian:{n:'Lôi Ấn',el:'moc',col:'#cfe4ff',tx:'Lôi Ấn!',fl:'Ấn sấm của thầy Từ Đạo Hạnh, gọi sét như gọi gió.',
  P:S=>({ch:0.2,m:0.5*S,r:62}),d:P=>`Đòn đánh thường có ${pc(P.ch)}% gọi sét đánh xuống mục tiêu: ${pc(P.m)}% công lên kẻ địch quanh đó, làm choáng thoáng chốc.`},
 huyetam:{n:'Huyết Ẩm',el:'hoa',col:'#ff6a7a',tx:'Huyết Ẩm',fl:'Lưỡi đao uống máu giặc, người cầm càng đánh càng hăng.',
  P:S=>({every:4,m:0.4*S,heal:0.015*S,r:90}),d:P=>`Mỗi ${P.every} đòn đánh trúng nổ một vòng huyết khí ở mục tiêu (${pc(P.m)}% công lên kẻ địch quanh đó), máu bay về hồi ${(P.heal*100).toFixed(1)}% sinh lực tối đa.`},
 liethoa:{n:'Liệt Hỏa',el:'hoa',col:'#ff9a3a',tx:'Liệt Hỏa',fl:'Lửa Phù Đổng còn âm ỉ trong lưỡi thép.',
  P:(S,q,lv,Ib)=>({dur:3,tick:0.5,m:0.05*S/Ib}),d:P=>`Đòn đánh thường đốt cháy kẻ địch ${P.dur} giây, mỗi ${P.tick} giây mất ${pc(P.m)}% công (đánh lại thì cháy lại từ đầu).`},
 hanbang:{n:'Hàn Băng Phách',el:'thuy',col:'#bfeeff',tx:'Băng Phong!',fl:'Hơi lạnh đáy sông Bạch Đằng đọng thành phách băng.',
  P:(S,q)=>({n:q>1?4:5,slow:2,frz:1.2,m:0.5*S,vul:0.15}),d:P=>`Đòn đánh thường làm chậm kẻ địch. Đủ ${P.n} tầng thì đóng băng ${P.frz} giây và vỡ băng (${pc(P.m)}% công). Boss không bị đóng băng mà chịu thêm ${pc(P.vul)}% sát thương trong 3 giây.`},
 xuyengiap:{n:'Xuyên Giáp',el:'tho',col:'#e8c88a',tx:'Phá Giáp',fl:'Mũi thép tôi trong lò Cổ Loa, xuyên cả giáp da tê.',
  P:S=>({max:5,per:0.022*S,dur:4}),d:P=>`Mỗi đòn đánh thường rạch giáp kẻ địch: chịu thêm ${(P.per*100).toFixed(1)}% sát thương mỗi tầng, tối đa ${P.max} tầng (${(P.per*P.max*100).toFixed(0)}%), giữ ${P.dur} giây.`},
 chandia:{n:'Chấn Địa',el:'tho',col:'#e0b070',tx:'Chấn Địa!',fl:'Một nhát dậm chân làm rung cả thành đất Cổ Loa.',
  P:(S,q)=>({every:q>1?4:5,m:0.5*S*(q>1?0.8:1),r:100}),d:P=>`Mỗi đòn đánh trúng thứ ${P.every} làm nứt đất ở mục tiêu: sóng chấn ${pc(P.m)}% công lên kẻ địch quanh đó, choáng ngắn.`},
 phananh:{n:'Phân Ảnh',el:'thuy',col:'#b8c8ff',tx:'Phân Ảnh',fl:'Bóng in mặt nước cũng biết vung kiếm.',
  P:S=>({ch:Math.min(0.5,0.25*S),m:0.4}),d:P=>`Đòn đánh thường có ${pc(P.ch)}% để lại một ảnh phân thân lặp lại đòn đó (${pc(P.m)}% công).`},
 truyhon:{n:'Truy Hồn Tiêu',el:'kim',col:'#e8e0ff',tx:'Truy Hồn',fl:'Phi tiêu của thích khách Tây Sơn, đã phóng là không trượt.',
  P:(S,q,lv,Ib)=>{const cd=q>1?1.6:2;return{cd,m:0.1*S/Ib*cd,r:380}},d:P=>`Cứ ${P.cd} giây tự phóng một phi tiêu đuổi theo kẻ địch gần nhất (${pc(P.m)}% công).`},
 thanhlong:{n:'Thanh Long Hống',el:'moc',col:'#5fe8a0',tx:'Thanh Long Hống!',fl:'Tiếng rồng xanh gầm trên sông Thăng Long.',
  P:S=>({m:0.45*S,cd:0.7}),d:P=>`Đòn đánh thường chí mạng phóng một sóng rồng xanh xuyên thấu (${pc(P.m)}% công).`},
 moclinh:{n:'Mộc Linh',el:'moc',col:'#9ff07a',tx:'Mộc Linh',fl:'Linh khí rừng Lam Sơn nuôi người nghĩa sĩ.',
  P:(S,q,lv,Ib)=>({hit:0.003*S,reg:0.008*S,m:0.1*S/Ib,r:90}),d:P=>`Đòn đánh trúng hồi ${(P.hit*100).toFixed(1)}% sinh lực. Khi giao chiến, vòng mộc khí hồi ${(P.reg*100).toFixed(1)}% sinh lực mỗi giây và quất gai (${pc(P.m)}% công) kẻ địch sát bên.`},
};
const KEYS=Object.keys(TRAITS);
const QN=['','Thần Tính','Thượng Thần Tính'];
const scaleOf=(lv,q)=>(1+0.06*(lv-1))*(q>1?1.3:1);
const lvCap=it=>clamp(3+Math.floor((it.ilvl||1)/15),3,10);
const baseIb=()=>{const S=G.save,C=S&&CLASS_BY_ID[S.cls];return C?C.atk.interval:0.5};
function params(tt){const T=TRAITS[tt.k];return T.P(scaleOf(tt.lv,tt.q),tt.q,tt.lv,baseIb())}
function traitOf(it){if(!it||!it.tt||!TRAITS[it.tt.k])return null;const T=TRAITS[it.tt.k];return Object.assign({key:it.tt.k,name:T.n,el:T.el,lv:it.tt.lv,q:it.tt.q,cap:lvCap(it),col:T.col},{desc:T.d(params(it.tt))})}
function elemOf(it){return it&&it.tt&&TRAITS[it.tt.k]?TRAITS[it.tt.k].el:null}
function rollTrait(it,exclude,keepLv){const ks=KEYS.filter(k=>k!==exclude);const k=pick(ks);const cap=lvCap(it);
  const lv=keepLv?Math.min(cap,keepLv):randi(1,Math.max(1,Math.ceil(cap/2)));const qc=it.rar>=4?0.6:it.rar>=3?0.35:0;return{k,lv,q:Math.random()<qc?2:1}}
const eligible=it=>!!it&&it.slot==='vk'&&it.rar>=2;

/* rơi đồ / tạo đồ */
HK.on('item',it=>{if(eligible(it)&&!it.tt)it.tt=rollTrait(it)});
const _ip=itemPower;itemPower=function(it){const v=_ip(it);return it&&it.tt&&TRAITS[it.tt.k]?Math.round(v*(1+0.05*scaleOf(it.tt.lv,it.tt.q))):v};

/* ---------- lưu & sổ khám phá ---------- */
function TS(){const S=G.save;if(!S)return{seen:[]};if(!S.tb||typeof S.tb!=='object')S.tb={seen:[]};if(!Array.isArray(S.tb.seen))S.tb.seen=[];return S.tb}
function scanSeen(quiet){const S=G.save;if(!S)return;const s=TS();const see=it=>{if(it&&it.tt&&TRAITS[it.tt.k]&&!s.seen.includes(it.tt.k)){s.seen.push(it.tt.k);
    if(!quiet&&G.state==='play')UI.toast('Khám phá Thần Tính: '+TRAITS[it.tt.k].n+' (hệ '+EL[TRAITS[it.tt.k].el].n+')','legend')}};
  for(const sl of SLOTS)see(S.equip[sl]);for(const it of S.bag)see(it)}

/* ================= CHIẾN ĐẤU ================= */
const C={k:null,tt:null,P:null,T:null};                 // Thần Tính đang dùng (vũ khí đang mặc)
const ST={};                                            // thống kê kích hoạt trong phiên: ST[k]={n,dmg}
let AFF=[],lastSwing=-1,swN=0,swords=[],darts=[],dartT=0.6,auraT=0,mlT=0,thT=0,lsT=0,pruneT=0,seenT=0;
const callT={};
function stat(k,d){const s=ST[k]||(ST[k]={n:0,dmg:0});s.n++;s.dmg+=d||0}
function call(txt,col,x,y,k,gap){if(k){if(G.t<(callT[k]||0))return;callT[k]=G.t+(gap||0.8)}if(G.floats.length>80)G.floats.shift();G.floats.push({x,y,txt,col,size:18,life:1.05,vy:-34,skill:1})}
function pd(e,mult,o){if(!e||e.dead||!G.p)return 0;let d=G.p.atk*mult;if(window.B2&&B2.elOf&&C.T&&KHAC[C.T.el]===B2.elOf(e))d*=1.15;
  o=o||{};o.proc=1;o.tb=C.k;const r=hurtEnemy(e,d,o)||0;stat(C.k,r);return r}
function heal(n){const p=G.p;if(!p||p.hp<=0)return;const h=Math.min(n,p.maxhp-p.hp);if(h<1)return;p.hp+=h;if(G.floats.length<80)addFloat(p.x+rand(-10,10),p.y-62,'+'+fmt(h),'#7dff8a',14)}
function sx(e){if(!e._tb){e._tb={bu:0,bt:0,bd:0,fr:0,frT:0,fz:0,sh:0,shT:0,vul:0};AFF.push(e)}return e._tb}
const later=(t,fn)=>G.timers.push({t,fn});

HK.on('stats',()=>{const S=G.save,w=S&&S.equip.vk;const tt=w&&w.tt&&TRAITS[w.tt.k]?w.tt:null;
  const ch=!tt||!C.tt||tt.k!==C.tt.k;C.tt=tt;C.k=tt?tt.k:null;C.T=tt?TRAITS[tt.k]:null;C.P=tt?params(tt):null;
  if(ch){swords=[];darts=[]}
  if(C.k==='phikiem'){const n=C.P.n;while(swords.length<n)swords.push({st:0,t:0,cd:0.4+swords.length*0.45,x:0,y:0,tg:null,sx:0,sy:0});swords.length=n}});

/* đòn đánh thường trúng mục tiêu */
HK.on('hit',(e,dmg,o)=>{if(!o||o.proc||!o.basic||!C.k||!G.p)return;const p=G.p,P=C.P,k=C.k,first=o.basic!==lastSwing;if(first)lastSwing=o.basic;
  switch(k){
    case'loian':if(first&&Math.random()<P.ch){const x=e.x,y=e.y;G.fx.push({k:'bolt',x1:x+rand(-30,30),y1:y-420,x2:x,y2:y-10,life:0.26,max:0.26,col:'#cfe4ff',w:4},{k:'flash',x,y:y-10,r:70,col:'#9fc4ff',life:0.22,max:0.22},{k:'ring',x,y,r:8,r2:P.r,life:0.28,max:0.28,col:'#9fc4ff'});
      for(const en of enemiesIn(x,y,P.r))pd(en,P.m*(en===e?1:0.6),{stun:0.25,noStagger:1});Audio_.play('zap');G.shake=Math.max(G.shake,3);call('Lôi Ấn!','#cfe4ff',x,y-70,k,0.5)}break;
    case'huyetam':if(first&&++swN>=P.every){swN=0;const x=e.x,y=e.y;let tot=0;
      G.fx.push({k:'ring',x,y,r:10,r2:P.r,life:0.32,max:0.32,col:'#d0203a'},{k:'flash',x,y:y-14,r:60,col:'#ff3050',life:0.22,max:0.22});
      for(const en of enemiesIn(x,y,P.r))tot+=pd(en,P.m*(en===e?1:0.6),{noStagger:1});
      for(let i=0;i<8;i++){const a=i/8*TAU;addPart(x+Math.cos(a)*10,y-16,Math.cos(a)*120,Math.sin(a)*60-60,0.5,i%2?'#c8102a':'#ff6a7a',3,200,'c',1)}
      for(let i=0;i<4;i++)later(0.08+i*0.06,()=>{if(!G.p)return;G.fx.push({k:'streak',x1:x,y1:y-16,x2:G.p.x+rand(-8,8),y2:G.p.y-28,w:5,col:'#ff4060',life:0.22,max:0.22})});
      later(0.3,()=>{if(G.p)heal(G.p.maxhp*P.heal+tot*0.1)});call('Huyết Ẩm','#ff6a7a',x,y-70,k,0.4)}break;
    case'liethoa':if(!e.dead){const s=sx(e),fresh=s.bu<=0;s.bu=P.dur;s.bd=P.m;if(fresh){s.bt=P.tick;call('Liệt Hỏa','#ffa24a',e.x,e.y-60,k,1.2);sparks(e.x,e.y-16,6,'#ff9a3a',160)}}break;
    case'hanbang':if(!e.dead){const s=sx(e);s.frT=P.slow;if(e.slow<0.05)e.slow=0.05;if(++s.fr>=P.n){s.fr=0;const cc=s.fz<=G.t;if(cc)s.fz=G.t+2.5;
      if(!cc){call('Vỡ Băng','#bfeeff',e.x,e.y-70,k,0.6)}else if(e.boss){s.vul=3;call('Băng Phá!','#bfeeff',e.x,e.y-80,k,0.3)}else{e.stun=Math.max(e.stun||0,P.frz*(e.elite?0.6:1));s.frz=P.frz*(e.elite?0.6:1);call('Băng Phong!','#bfeeff',e.x,e.y-70,k,0.3)}
      pd(e,P.m,{noStagger:1});G.fx.push({k:'ring',x:e.x,y:e.y,r:44,r2:12,life:0.3,max:0.3,col:'#bfeeff'},{k:'flash',x:e.x,y:e.y-20,r:56,col:'#9fe0ff',life:0.25,max:0.25});
      for(let i=0;i<10;i++){const a=Math.random()*TAU,v=rand(80,200);addPart(e.x,e.y-20,Math.cos(a)*v,Math.sin(a)*v*0.6-90,rand(0.4,0.7),i%2?'#e8fbff':'#7fd0ff',rand(2,3.4),420,'s',1)}Audio_.play('clang')}}break;
    case'xuyengiap':if(!e.dead){const s=sx(e);s.shT=P.dur;if(s.sh<P.max){s.sh++;stat(k,0);if(s.sh===P.max){call('Phá Giáp','#ffd98a',e.x,e.y-70,k,0.8);sparks(e.x,e.y-20,8,'#e8c88a',220)}}}break;
    case'chandia':if(first&&++swN>=P.every){swN=0;const x=e.x,y=e.y;later(0.06,()=>{G.fx.push({k:'ring',x,y,r:12,r2:P.r,life:0.4,max:0.4,col:'#d9a463'},{k:'ring',x,y,r:6,r2:P.r*0.6,life:0.3,max:0.3,col:'#fff0c8'});
        pushCrack(x,y,P.r*0.8,7);pushDust(x,y,8,P.r);for(const en of enemiesIn(x,y,P.r))pd(en,P.m*(en===e?1:0.6),{stun:0.4,noStagger:1});
        G.shake=Math.max(G.shake,5);Audio_.play('slam');call('Chấn Địa!','#f0c890',x,y-70,k,0.3)})}break;
    case'phananh':if(first&&Math.random()<P.ch)echo(e);break;
    case'thanhlong':if(o.crit&&G.t>thT){thT=G.t+P.cd;const a=Math.atan2(e.y-p.y,e.x-p.x);
      G.projs.push({x:p.x+Math.cos(a)*16,y:p.y-18,vx:Math.cos(a)*620,vy:Math.sin(a)*620,r:30,dmg:p.atk*P.m*1,from:'p',pierce:99,life:0.6,kind:'wave',ang:a,hit:new Set(),col:'#3fd890',proc:1,tbDragon:1});
      G.fx.push({k:'flash',x:p.x+Math.cos(a)*30,y:p.y-20,r:60,col:'#5fe8a0',life:0.25,max:0.25});Audio_.play('magic');call('Thanh Long Hống!','#7dffb8',p.x,p.y-92,k,0.5);stat(k,0)}break;
    case'moclinh':if(G.t>mlT){mlT=G.t+0.25;heal(p.maxhp*P.hit);if(Math.random()<0.5)addPart(p.x+rand(-10,10),p.y-20,rand(-20,20),rand(-70,-40),0.6,'#9ff07a',2.6,-20,'c',1);stat(k,0);call('Mộc Linh','#b8ff98',p.x,p.y-88,k,3)}break;
  }});
/* Phân Ảnh: bóng phân thân lặp lại đòn đánh thường */
function echo(e){const p=G.p,A=p.cls.atk,P=C.P,aim=Math.atan2(e.y-p.y,e.x-p.x),ox=p.x-Math.cos(aim)*22,oy=p.y-Math.sin(aim)*10;
  pushGhost(ox,oy,Math.cos(aim)>=0?1:-1,'#9fb0ff',0.4);call('Phân Ảnh','#c8d4ff',ox,oy-90,'phananh',0.5);
  later(0.14,()=>{if(!G.p)return;const p=G.p;
    if(A.type==='shot'){G.projs.push({x:ox+Math.cos(aim)*14,y:oy-24,vx:Math.cos(aim)*A.speed,vy:Math.sin(aim)*A.speed,r:8,dmg:p.atk*P.m*tbK(e),from:'p',pierce:0,life:0.8,kind:A.proj,hit:new Set(),home:e.dead?null:e,proc:1,col:'#b8c8ff'});stat('phananh',0)}
    else{for(const en of G.enemies){if(en.dead)continue;const d=dist(ox,oy,en.x,en.y);if(d>A.range+en.r+8)continue;const a=Math.atan2(en.y-oy,en.x-ox);if(Math.abs(angDiff(aim,a))>A.arc/2+0.3&&d>en.r+10)continue;pd(en,P.m,{kb:60,ang:a})}
      G.fx.push({k:'slash',x:ox,y:oy-18,a:aim,arc:A.type==='thrust'?0.5:A.arc,r:A.range,life:0.2,max:0.2,col:'#9fb0ff',thrust:A.type==='thrust',flip:1})}
    Audio_.play('swing')})}
const tbK=e=>window.B2&&B2.elOf&&C.T&&KHAC[C.T.el]===B2.elOf(e)?1.15:1;

/* trạng thái lên kẻ địch */
HK.on('dmgOut',(d,e)=>{const s=e&&e._tb;if(!s||!C.k)return;let m=1;if(s.sh>0&&C.k==='xuyengiap')m*=1+C.P.per*s.sh;if(s.vul>0)m*=1+0.15;return m===1?undefined:d*m});

HK.on('tick',dt=>{const p=G.p,S=G.save;if(!p||!S)return;
  seenT-=dt;if(seenT<=0){seenT=1;scanSeen(false)}
  // trạng thái trên quái
  pruneT-=dt;if(pruneT<=0){pruneT=0.5;AFF=AFF.filter(e=>{const keep=!e.dead&&G.enemies.includes(e);if(!keep&&e._tb){if(e._tb.frT>0&&e.slow<=0.05)e.slow=0;e._tb=null}return keep})}
  for(const e of AFF){const s=e._tb;if(!s||e.dead)continue;
    if(s.bu>0){s.bu-=dt;s.bt-=dt;if(s.bt<=0){s.bt=0.5;if(C.k==='liethoa')pd(e,s.bd,{noStagger:1,dot:1})}
      if(Math.random()<dt*10&&G.parts.length<440)addPart(e.x+rand(-9,9),e.y-rand(8,30)*e.sc,rand(-8,8),rand(-60,-30),0.45,Math.random()<0.5?'#ff7a2a':'#ffd060',rand(2,3.4),-40,'c',1)}
    if(s.frT>0){s.frT-=dt;if(e.slow<0.05)e.slow=0.05;if(s.frT<=0){s.fr=0;if(e.slow<=0.05)e.slow=0}}
    if(s.frz>0)s.frz-=dt;if(s.vul>0)s.vul-=dt;
    if(s.shT>0){s.shT-=dt;if(s.shT<=0)s.sh=0}}
  if(!C.k||G.state!=='play')return;const P=C.P;
  const fight=!p.inCamp&&p.hp>0;
  // Phi Kiếm Hộ Thân
  if(C.k==='phikiem'){const n=swords.length;
    for(let i=0;i<n;i++){const w=swords[i],a=G.t*2.6+i*TAU/n,hx=p.x+Math.cos(a)*44,hy=p.y-30+Math.sin(a)*16;w.hx=hx;w.hy=hy;
      if(w.st===0){w.x=hx;w.y=hy;w.cd-=dt;if(w.cd<=0&&fight){const tg=nearestEnemy(p.x,p.y,190,e=>!e._tbPk||e._tbPk<G.t);if(tg){w.st=1;w.t=0;w.tg=tg;w.sx=w.x;w.sy=w.y;tg._tbPk=G.t+0.12;call('Phi Kiếm','#dff2ff',p.x,p.y-92,'phikiem',5)}else w.cd=0.2}}
      else if(w.st===1){w.t+=dt/0.16;const tg=w.tg;if(!tg||tg.dead){w.st=2;w.t=0;w.sx=w.x;w.sy=w.y;continue}
        w.x=lerp(w.sx,tg.x,Math.min(1,w.t));w.y=lerp(w.sy,tg.y-18*tg.sc,Math.min(1,w.t));
        if(w.t>=1){pd(tg,P.m,{noStagger:1});G.fx.push({k:'glint',x:w.x,y:w.y,s:26,a:rand(-0.5,0.5),col:'#bfe0ff',life:0.18,max:0.18});sparks(w.x,w.y,4,'#dff2ff',160);Audio_.play('hit');w.st=2;w.t=0;w.sx=w.x;w.sy=w.y}}
      else{w.t+=dt/0.24;w.x=lerp(w.sx,hx,Math.min(1,w.t));w.y=lerp(w.sy,hy,Math.min(1,w.t));if(w.t>=1){w.st=0;w.cd=P.cd}}}}
  // Truy Hồn Tiêu
  if(C.k==='truyhon'){dartT-=dt;if(dartT<=0){const tg=fight&&nearestEnemy(p.x,p.y,P.r);if(tg){dartT=P.cd;const a=Math.atan2(tg.y-p.y,tg.x-p.x)+rand(-0.8,0.8);
      darts.push({x:p.x,y:p.y-30,vx:Math.cos(a)*420,vy:Math.sin(a)*420,tg,life:1.6,r:0});Audio_.play('bow');call('Truy Hồn','#e8e0ff',p.x,p.y-92,'truyhon',4)}else dartT=0.25}}
  for(let i=darts.length-1;i>=0;i--){const d=darts[i];d.life-=dt;d.r+=dt*22;const tg=d.tg;
    if(tg&&!tg.dead){const a=Math.atan2(tg.y-18*tg.sc-d.y,tg.x-d.x),sp=Math.min(760,Math.hypot(d.vx,d.vy)+900*dt),cur=Math.atan2(d.vy,d.vx),na=cur+clamp(angDiff(cur,a),-9*dt,9*dt);d.vx=Math.cos(na)*sp;d.vy=Math.sin(na)*sp}
    d.x+=d.vx*dt;d.y+=d.vy*dt;
    if(tg&&!tg.dead&&dist(d.x,d.y,tg.x,tg.y-18*tg.sc)<tg.r+10){if(C.k==='truyhon')pd(tg,P.m,{noStagger:1});G.fx.push({k:'glint',x:d.x,y:d.y,s:22,a:0.6,col:'#c8b8ff',life:0.16,max:0.16});darts.splice(i,1);continue}
    if(d.life<=0||!tg||tg.dead)darts.splice(i,1)}
  // Mộc Linh: vòng hồi phục
  if(C.k==='moclinh'){auraT-=dt;if(auraT<=0){auraT=1;if(fight&&nearestEnemy(p.x,p.y,300)){heal(p.maxhp*P.reg);let n=0;
      for(const e of enemiesIn(p.x,p.y,P.r)){pd(e,P.m,{noStagger:1});n++;G.fx.push({k:'streak',x1:p.x,y1:p.y-6,x2:e.x,y2:e.y-12,w:4,col:'#7fd85e',life:0.2,max:0.2})}
      stat('moclinh',0);if(n)call('Mộc Linh','#b8ff98',p.x,p.y-88,'moclinh',3);
      for(let i=0;i<5;i++){const a=Math.random()*TAU;addPart(p.x+Math.cos(a)*30,p.y+Math.sin(a)*10,0,rand(-50,-25),0.8,i%2?'#9ff07a':'#d8ffb0',2.4,-10,'c',1)}}}}
});

/* ---------- vẽ (rẻ: chấm sáng đệm sẵn, vài đường) ---------- */
function drawSword(x,y,a,s){cx.save();cx.translate(x,y);cx.rotate(a);cx.scale(s,s);cx.fillStyle='#eef8ff';cx.strokeStyle='#2a3a4a';cx.lineWidth=1;
  cx.beginPath();cx.moveTo(13,0);cx.lineTo(2,-2.2);cx.lineTo(2,2.2);cx.closePath();cx.fill();cx.stroke();cx.fillStyle='#d6ac4e';cx.fillRect(0,-4,2,8);cx.fillStyle='#5a3a20';cx.fillRect(-6,-1.3,6,2.6);cx.restore()}
HK.on('drawWorld',()=>{const p=G.p;if(!p||G.state==='title'||G.state==='select')return;const t=G.t;
  // trạng thái trên quái
  for(const e of AFF){const s=e._tb;if(!s||e.dead)continue;const hy=e.y-36*e.sc-8;
    if(s.bu>0)additive(()=>{glow(e.x,e.y-14*e.sc,22*e.sc,'#ff6a1a',0.45+0.15*Math.sin(t*14+e.id));glow(e.x+3*Math.sin(t*9+e.id),e.y-28*e.sc,9,'#ffd060',0.7)},'lighter');
    if(s.frT>0||s.frz>0){if(s.frz>0){cx.save();cx.globalAlpha=0.5;cx.fillStyle='#bfeeff';cx.strokeStyle='#ffffff';cx.lineWidth=1.4;const w=e.r*1.3+6,h=38*e.sc;
        cx.beginPath();cx.moveTo(e.x-w,e.y+2);cx.lineTo(e.x-w*0.8,e.y-h);cx.lineTo(e.x+w*0.2,e.y-h-8);cx.lineTo(e.x+w,e.y-h*0.7);cx.lineTo(e.x+w*0.9,e.y+2);cx.closePath();cx.fill();cx.globalAlpha=0.9;cx.stroke();cx.restore()}
      else additive(()=>glow(e.x,e.y-14*e.sc,18*e.sc,'#7fd0ff',0.35),'lighter');
      if(s.fr>0){cx.fillStyle='#bfeeff';cx.strokeStyle='#123a5a';cx.lineWidth=1;const n=C.P&&C.P.n||5;for(let i=0;i<n;i++){const x=e.x+(i-(n-1)/2)*8,y=hy;cx.globalAlpha=i<s.fr?1:0.3;cx.beginPath();cx.moveTo(x,y-4);cx.lineTo(x+3,y);cx.lineTo(x,y+4);cx.lineTo(x-3,y);cx.closePath();cx.fill();cx.stroke()}cx.globalAlpha=1}}
    if(s.vul>0)additive(()=>{for(let i=0;i<3;i++){const a=t*3+i*TAU/3;glow(e.x+Math.cos(a)*e.r,e.y-20*e.sc+Math.sin(a)*8,8,'#9fe0ff',0.8)}},'lighter');
    if(s.sh>0){const x=e.x,y=hy-(s.fr>0?10:0);cx.save();cx.translate(x,y);cx.fillStyle=s.sh>=5?'#ffd98a':'#c8a870';cx.strokeStyle='#3a2410';cx.lineWidth=1.2;
      cx.beginPath();cx.moveTo(-6,-6);cx.lineTo(6,-6);cx.lineTo(6,0);cx.quadraticCurveTo(6,5,0,8);cx.quadraticCurveTo(-6,5,-6,0);cx.closePath();cx.fill();cx.stroke();
      cx.strokeStyle='#5a1a08';cx.beginPath();cx.moveTo(-1,-6);cx.lineTo(1,-1);cx.lineTo(-1,2);cx.lineTo(1,7);cx.stroke();
      cx.fillStyle='#fff0c8';for(let i=0;i<s.sh;i++)cx.fillRect(9+i*4,-2,2.6,5);cx.restore()}}
  if(!C.k)return;
  if(C.k==='phikiem')for(let i=0;i<swords.length;i++){const w=swords[i];let a;
    if(w.st===1&&w.tg)a=Math.atan2(w.tg.y-w.sy,w.tg.x-w.sx);else if(w.st===2)a=Math.atan2(w.hy-w.y,w.hx-w.x);else a=G.t*2.6+i*TAU/swords.length+Math.PI/2;
    additive(()=>glow(w.x,w.y,w.st===1?24:16,'#9fd0ff',w.st===1?0.9:0.6),'lighter');drawSword(w.x,w.y,w.st===0?-Math.PI/2+Math.sin(G.t*3+i)*0.2:a,w.st===1?1.9:1.5)}
  for(const d of darts){cx.save();cx.translate(d.x,d.y);cx.rotate(d.r);cx.fillStyle='#e8e0ff';cx.strokeStyle='#2a2040';cx.lineWidth=1;cx.beginPath();
    for(let i=0;i<8;i++){const r=i%2?2.2:8,a=i*Math.PI/4;cx.lineTo(Math.cos(a)*r,Math.sin(a)*r)}cx.closePath();cx.fill();cx.stroke();cx.restore();
    additive(()=>{glow(d.x,d.y,12,'#a890ff',0.7);glow(d.x-d.vx*0.025,d.y-d.vy*0.025,8,'#a890ff',0.35)},'lighter')}
  if(C.k==='moclinh'&&!p.inCamp){cx.save();cx.globalAlpha=0.35+0.1*Math.sin(t*2);cx.strokeStyle='#7fd85e';cx.lineWidth=2;cx.setLineDash([10,8]);cx.lineDashOffset=-t*20;
    cx.beginPath();cx.ellipse(p.x,p.y,C.P.r,C.P.r*0.38,0,0,TAU);cx.stroke();cx.setLineDash([]);cx.restore();
    for(let i=0;i<3;i++){const a=t*1.4+i*TAU/3,x=p.x+Math.cos(a)*C.P.r,y=p.y+Math.sin(a)*C.P.r*0.38;cx.save();cx.translate(x,y);cx.rotate(a+1.2);cx.fillStyle='#8fe066';cx.globalAlpha=0.85;
      cx.beginPath();cx.ellipse(0,0,6,2.6,0,0,TAU);cx.fill();cx.restore()}}
  if(C.k==='thanhlong')for(const b of G.projs)if(b.tbDragon){const a=Math.atan2(b.vy,b.vx);additive(()=>{glow(b.x,b.y,34,'#3fd890',0.55);glow(b.x+Math.cos(a)*10,b.y+Math.sin(a)*10,14,'#e0ffe8',0.9)},'lighter');
    cx.save();cx.translate(b.x,b.y);cx.rotate(a);cx.strokeStyle='#e8fff0';cx.lineWidth=1.6;cx.globalAlpha=0.9;cx.beginPath();cx.moveTo(8,-6);cx.lineTo(20,-14);cx.moveTo(8,6);cx.lineTo(20,14);cx.stroke();cx.restore()}
});

/* ================= GIAO DIỆN ================= */
const TICO={
 phikiem:'<path d="M5 19L15 9M15 9l3-5-5 3M7 15l2 2" /><path d="M19 19L9 9M9 9L6 4l5 3M17 15l-2 2"/>',
 loian:'<path d="M13.5 2.5L6 13h5l-1.5 8.5L18 10h-5.5z" fill="currentColor" stroke="none"/>',
 huyetam:'<path d="M12 3C15 8 18 11 18 15a6 6 0 0 1-12 0c0-4 3-7 6-12z"/><path d="M9.5 15.5a2.5 2.5 0 0 0 2.5 2.5"/>',
 liethoa:'<path d="M12 3c2 4 6 6 5.5 11A5.5 5.5 0 0 1 6.5 14c0-3 2-4 3-6 .8 2 1.5 3 2.5 3 .5-2 .5-5 0-8z" fill="currentColor" fill-opacity=".35"/>',
 hanbang:'<path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9M10 4.5l2 2 2-2M10 19.5l2-2 2 2"/>',
 xuyengiap:'<path d="M5 4h14v7c0 5-4 8-7 9-3-1-7-4-7-9z"/><path d="M12 4l-1.5 5 3 3-2 4 1 3"/>',
 chandia:'<path d="M3 19h18M5 15c2-3 4-3 7-3s5 0 7 3M8 11l1-4M16 11l-1-4M12 10V5"/>',
 phananh:'<circle cx="9" cy="7" r="2.6"/><path d="M5 20l1-7h6l1 7"/><circle cx="15.5" cy="8" r="2.4" stroke-opacity=".5"/><path d="M12.5 20l.8-6h4.6l.8 6" stroke-opacity=".5"/>',
 truyhon:'<path d="M12 2l2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2z" fill="currentColor" fill-opacity=".3"/><circle cx="12" cy="12" r="1.6"/>',
 thanhlong:'<path d="M3 15c3-6 6 2 9-3s5-6 9-4"/><path d="M17 5l4 3-4 2M3 15l2 3M7 12.5l1 3.5"/>',
 moclinh:'<path d="M12 21V10M12 13c-5 0-7-3-7-8 5 0 7 3 7 8zM12 11c0-5 3-7 7-7 0 5-2 7-7 7z"/>',
};
function tIcon(k,sz,cls){const T=TRAITS[k];return`<svg class="tbico${cls?' '+cls:''}" viewBox="0 0 24 24" width="${sz}" height="${sz}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="color:${T?T.col:'#8a7a6a'}" aria-hidden="true">${T?TICO[k]:'<path d="M9 9a3 3 0 1 1 4 2.8c-.7.3-1 .8-1 1.5V14M12 17.5v.5"/>'}</svg>`}
function eBadge(el,sz){const E=EL[el];sz=sz||16;return`<svg class="tbeb" viewBox="0 0 24 24" width="${sz}" height="${sz}" aria-label="Hệ ${E.n}"><circle cx="12" cy="12" r="11" fill="${E.d}" stroke="${E.c}" stroke-width="1.8"/><path d="${EGLY[el]}" fill="${E.c}"/></svg>`}
function traitBlock(it,big){const t=traitOf(it);if(!t)return'';const E=EL[t.el];
  return`<div class="tbfx${t.q>1?' q2':''}" style="--tc:${t.col};--ec:${E.c}"><div class="th">${tIcon(t.key,big?26:20)}<span class="tn">${esc(t.name)}</span>${eBadge(t.el,16)}<span class="tl">Cấp ${t.lv}/${t.cap}</span></div>
    <p>${esc(t.desc)}</p><small>${QN[t.q]} · hệ ${E.n} (khắc ${EL[KHAC[t.el]].n}: +15% sát thương Thần Tính)</small></div>`}

/* thẻ vật phẩm & ô vật phẩm & bảng gợi ý trang bị */
const _card=UI.itemCard;UI.itemCard=function(it,cmp){const h=_card.call(this,it,cmp);if(!it||!it.tt||!TRAITS[it.tt.k])return h;return h.slice(0,-6)+traitBlock(it)+'</div>'};
const _cell=UI.cellHtml;UI.cellHtml=function(it,opt){const h=_cell.call(this,it,opt);const el=elemOf(it);if(!el)return h;const i=h.lastIndexOf('</button>');return i<0?h:h.slice(0,i)+`<span class="tbel${it.tt.q>1?' q2':''}">${eBadge(el,15)}</span>`+h.slice(i)};
const _offer=UI.offerEquip;UI.offerEquip=function(it){_offer.call(this,it);const t=traitOf(it);const el=document.getElementById('offer');if(!t||!el)return;
  const ov=el.querySelector('.ov');if(ov)ov.insertAdjacentHTML('afterend',`<div class="tbov" style="color:${t.col}">${tIcon(t.key,14)} ${esc(t.name)} · cấp ${t.lv}</div>`)};

/* ---------- Lò Rèn: tẩy / thăng cấp / khai mở Thần Tính ---------- */
function costRe(it){return{ore:5+Math.floor(it.ilvl/10)+(it.tt&&it.tt.q>1?3:0),gold:Math.round(250*(1+it.ilvl/10))}}
function costUp(it){const lv=it.tt.lv;return{ore:3+lv*2+Math.floor(it.ilvl/12),gold:Math.round(120*lv*(1+it.ilvl/12))}}
function canPay(c){const S=G.save;return S.ore>=c.ore&&S.gold>=c.gold}
function pay(c){const S=G.save;S.ore-=c.ore;S.gold-=c.gold}
function reroll(it){if(!eligible(it))return{err:'Chỉ vũ khí phẩm Hiếm trở lên mới có Thần Tính'};const c=costRe(it);if(!canPay(c))return{err:G.save.ore<c.ore?`Thiếu Huyền Thiết (cần ${c.ore})`:`Thiếu vàng (cần ${fmt(c.gold)})`};
  pay(c);const old=it.tt?it.tt.k:null;it.tt=rollTrait(it,old,it.tt?it.tt.lv:0);scanSeen(true);recalc();G.dirty.bag=1;saveGame();return{ok:1,old,k:it.tt.k,q:it.tt.q}}
function upgrade(it){if(!it||!it.tt)return{err:'Vũ khí chưa có Thần Tính'};if(it.tt.lv>=lvCap(it))return{err:`Đã đạt trần cấp ${lvCap(it)} (cấp đồ càng cao trần càng cao)`};const c=costUp(it);
  if(!canPay(c))return{err:G.save.ore<c.ore?`Thiếu Huyền Thiết (cần ${c.ore})`:`Thiếu vàng (cần ${fmt(c.gold)})`};pay(c);it.tt.lv++;recalc();G.dirty.bag=1;saveGame();return{ok:1,lv:it.tt.lv}}
function costHtml(c){const S=G.save;return`<span class="${S.ore<c.ore?'bad':''}">${ICO_ORE} ${c.ore}</span> <span class="${S.gold<c.gold?'bad':''}">${ICO_GOLD} ${fmt(c.gold)}</span>`}
function forgeSec(it){if(!it||it.slot!=='vk')return'';
  if(it.rar<2)return`<div class="sec tbforge"><h4>RÈN THẦN TÍNH</h4><p class="hist tbdim">Chỉ vũ khí phẩm <b style="color:${RARITY[2].color}">Hiếm</b> trở lên mới mang Thần Tính. Truyền Thuyết và Thần Khí có thể ra Thượng Thần Tính.</p></div>`;
  const t=it.tt&&TRAITS[it.tt.k];const cr=costRe(it);
  if(!t)return`<div class="sec tbforge"><h4>RÈN THẦN TÍNH</h4><p class="hist tbdim">Món này rèn từ trước khi Thần Tính thức tỉnh. Khai mở để nhận một Thần Tính ngẫu nhiên.</p>
    <div class="row"><button class="btn gold" id="tbRe">Khai mở Thần Tính<small>${costHtml(cr)}</small></button></div></div>`;
  const cap=lvCap(it),max=it.tt.lv>=cap,cu=max?null:costUp(it);
  const T=TRAITS[it.tt.k],E=EL[T.el];
  return`<div class="sec tbforge" id="tbBox"><h4>RÈN THẦN TÍNH</h4><div class="tbfx tbmini${it.tt.q>1?' q2':''}" style="--tc:${T.col};--ec:${E.c}"><div class="th">${tIcon(it.tt.k,24)}<span class="tn">${esc(T.n)}</span>${eBadge(T.el,16)}<span class="tl">Cấp ${it.tt.lv}/${cap}</span></div><div class="tbbar"><i style="width:${it.tt.lv/10*100}%"></i><b style="left:${cap/10*100}%"></b></div><small>Trần cấp ${cap} theo cấp đồ ${it.ilvl}. Mỗi cấp tăng sức mạnh Thần Tính 6%.</small></div>
    <div class="row tbrow"><button class="btn sec" id="tbRe">Tẩy Thần Tính<small>Đổi ngẫu nhiên, giữ cấp · ${costHtml(cr)}</small></button>
    <button class="btn gold" id="tbUp" ${max?'disabled':''}>${max?`Đạt trần cấp ${cap}`:`Thăng cấp ${it.tt.lv} → ${it.tt.lv+1}`}<small>${max?'Cấp đồ cao hơn mở trần cao hơn':costHtml(cu)}</small></button></div></div>`}
const _pf=UI.p_forge;UI.p_forge=function(){const h=_pf.call(this);const it=this.findItem(this.forgeSel);return h+forgeSec(it)};
const _bf=UI.b_forge;UI.b_forge=function(body){_bf.call(this,body);const self=this,it=this.findItem(this.forgeSel);if(!it)return;
  const fx=()=>{const b=document.getElementById('tbBox');if(b&&anim&&!REDUCED){anim.fromTo(b,{scale:1.04,filter:'brightness(1.8)'},{scale:1,filter:'brightness(1)',duration:0.6,ease:'power2.out'})}};
  const re=body.querySelector('#tbRe');if(re)re.onclick=()=>{const c=costRe(it);if(!canPay(c)){self.toast(G.save.ore<c.ore?`Thiếu Huyền Thiết (cần ${c.ore}). Phân giải đồ hoặc mua ở Chợ.`:`Thiếu vàng (cần ${fmt(c.gold)})`,'warn');return}
    const t=it.tt&&TRAITS[it.tt.k];
    self.confirm(t?`Tẩy Thần Tính ${t.n} của ${itemName(it)}? Tốn ${c.ore} Huyền Thiết và ${fmt(c.gold)} vàng. Thần Tính mới ngẫu nhiên (khác cái cũ), giữ cấp ${it.tt.lv}.`:`Khai mở Thần Tính cho ${itemName(it)}? Tốn ${c.ore} Huyền Thiết và ${fmt(c.gold)} vàng.`,()=>{
      const r=reroll(it);if(r.err){self.toast(r.err,'warn');return}Audio_.play('forgeok');self.render();fx();const T=TRAITS[r.k];
      self.toast(`${r.q>1?'Thượng ':''}Thần Tính mới: ${T.n} (hệ ${EL[T.el].n})`,'legend')})};
  const up=body.querySelector('#tbUp');if(up)up.onclick=()=>{if(!it.tt)return;const c=costUp(it);if(!canPay(c)){self.toast(G.save.ore<c.ore?`Thiếu Huyền Thiết (cần ${c.ore})`:`Thiếu vàng (cần ${fmt(c.gold)})`,'warn');return}
    self.confirm(`Thăng cấp ${TRAITS[it.tt.k].n} lên cấp ${it.tt.lv+1}? Tốn ${c.ore} Huyền Thiết và ${fmt(c.gold)} vàng. Chắc chắn thành công.`,()=>{
      const r=upgrade(it);if(r.err){self.toast(r.err,'warn');return}Audio_.play('forgeok');self.render();fx();self.toast(`${TRAITS[it.tt.k].n} đạt cấp ${r.lv}`,'quest')})};
};

/* ---------- thẻ "Thần Binh" trong bảng Võ Đạo ---------- */
const ANI={phikiem:'spin',loian:'flick',liethoa:'flick',hanbang:'spin2',truyhon:'spin',phananh:'blink'};
function hubHtml(){const S=G.save,w=S.equip.vk,t=traitOf(w),s=TS();scanSeen(true);
  let h=`<div class="sec tbhub">`;
  if(t){const E=EL[t.el],st=ST[t.key];
    h+=`<div class="tbhero" style="--tc:${t.col};--ec:${E.c}"><div class="tbbig ${ANI[t.key]||'pulse'}">${tIcon(t.key,64)}</div><div class="tbht"><div class="tbq">${QN[t.q].toUpperCase()} · HỆ ${E.n.toUpperCase()}</div>
      <div class="tbnm">${esc(t.name)}</div><div class="tbw">${esc(itemName(w))} · cấp ${t.lv}/${t.cap}</div></div></div>
      <p class="tbd">${esc(t.desc)}</p><p class="tbfl">${esc(TRAITS[t.key].fl)}</p>
      <div class="tbstat">${st?`Trận này đã kích hoạt ${fmtFull(st.n)} lần${st.dmg?`, gây ${fmt(st.dmg)} sát thương`:''}.`:'Chưa kích hoạt trong phiên này. Ra trận và đánh thường để thấy hiệu ứng.'}</div>
      <div class="row"><button class="btn gold sm" id="tbGo">Rèn Thần Tính ở Lò Rèn</button></div>`}
  else if(eligible(w))h+=`<div class="tbhero none"><div class="tbbig">${tIcon('?',56)}</div><div class="tbht"><div class="tbnm">Thần Tính chưa thức tỉnh</div><div class="tbw">${esc(itemName(w))}</div></div></div>
      <p class="tbd">Vũ khí này đủ phẩm Hiếm nhưng chưa có Thần Tính. Mang đến Lò Rèn để khai mở.</p><div class="row"><button class="btn gold sm" id="tbGo">Đến Lò Rèn khai mở</button></div>`;
  else h+=`<div class="tbhero none"><div class="tbbig">${tIcon('?',56)}</div><div class="tbht"><div class="tbnm">Chưa có Thần Binh</div><div class="tbw">${w?esc(itemName(w)):'Chưa cầm vũ khí'}</div></div></div>
      <p class="tbd">Vũ khí phẩm <b style="color:${RARITY[2].color}">Hiếm</b> trở lên khi rơi ra mang một Thần Tính: kiếm bay hộ thân, sét giáng, lửa thiêu, băng phong… làm đòn đánh thường đổi hẳn cách đánh. Boss và tinh anh rơi đồ Hiếm nhiều nhất.</p>`;
  h+=`</div><div class="sec"><h4>SỔ THẦN TÍNH · ${s.seen.filter(k=>TRAITS[k]).length}/${KEYS.length}</h4><div class="tbcodex">${KEYS.map(k=>{const T=TRAITS[k],on=s.seen.includes(k),E=EL[T.el];
    return on?`<div class="tbc on${t&&t.key===k?' cur':''}" style="--tc:${T.col};--ec:${E.c}"><div class="tbch">${tIcon(k,24)}<b>${esc(T.n)}</b>${eBadge(T.el,14)}</div><p>${esc(T.d(T.P(1,1,1,baseIb())))}</p></div>`
      :`<div class="tbc"><div class="tbch">${tIcon('?',24)}<b>???</b></div><p>Chưa gặp. Hệ ${E.n}.</p></div>`}).join('')}</div>
    <p class="hist tbdim">Mô tả trong sổ ghi chỉ số ở cấp 1. Thần Tính hệ khắc hệ quái gây thêm 15% sát thương: Kim khắc Mộc, Mộc khắc Thổ, Thổ khắc Thủy, Thủy khắc Hỏa, Hỏa khắc Kim.</p></div>`;
  return h}
function hubBind(body){const b=body.querySelector('#tbGo');if(b)b.onclick=()=>{const w=G.save.equip.vk;if(w)UI.forgeSel=w.id;UI.open('forge')}}
if(window.HUB)HUB.add({id:'thanbinh',name:'Thần Binh',order:30,html:hubHtml,bind:hubBind,dot:()=>{const w=G.save&&G.save.equip.vk;return eligible(w)&&!w.tt}});

/* ---------- CSS ---------- */
const css=`
.cell .tbel{position:absolute;right:2px;bottom:2px;width:15px;height:15px;line-height:0;filter:drop-shadow(0 1px 1px #000)}
.cell .tbel.q2{filter:drop-shadow(0 0 3px #fff2b0) drop-shadow(0 1px 1px #000)}
.tbfx{margin-top:6px;padding:8px 10px;border-radius:10px;border:1px solid color-mix(in srgb,var(--ec) 55%,transparent);background:linear-gradient(135deg,color-mix(in srgb,var(--ec) 16%,transparent),rgba(0,0,0,.3));box-shadow:inset 3px 0 0 var(--ec)}
.tbfx.q2{border-color:#ffe08a;box-shadow:inset 3px 0 0 var(--ec),0 0 10px rgba(255,214,120,.35)}
.tbfx .th{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.tbfx .tn{font:400 15px/1.2 var(--f-display);color:var(--tc)}
.tbfx .tl{margin-left:auto;font:800 11.5px var(--f-ui);color:var(--vang2);white-space:nowrap}
.tbfx p{margin:4px 0 0;font:600 12.5px/1.45 var(--f-ui);color:var(--ink)}
.tbfx small{display:block;margin-top:4px;font:600 11px/1.3 var(--f-ui);color:var(--dim)}
.tbico{flex:none;vertical-align:middle}
.tbeb{flex:none;vertical-align:middle}
.tbov{font:700 12px var(--f-ui);margin-top:2px;display:flex;align-items:center;gap:4px}
.tbforge{margin-top:14px}
.tbforge .tbrow{margin-top:8px}
.tbbar{position:relative;height:8px;margin-top:7px;border-radius:4px;background:#0e0a08;border:1px solid var(--line)}.tbbar i{display:block;height:100%;border-radius:4px;background:linear-gradient(90deg,var(--ec),var(--tc))}.tbbar b{position:absolute;top:-3px;width:2px;height:12px;background:#fff;margin-left:-1px}
.tbforge .btn{flex:1 1 0;min-width:0;flex-direction:column;line-height:1.2}
.tbforge .btn small{display:block;margin-top:2px}
.tbforge .bad{color:#ff8a6a}
.tbdim{font-size:12.5px;color:var(--dim)}
.tbhero{display:flex;gap:12px;align-items:center;padding:10px;border-radius:12px;border:1px solid color-mix(in srgb,var(--ec,#8a7a6a) 50%,transparent);background:radial-gradient(circle at 15% 50%,color-mix(in srgb,var(--ec,#5a4a3a) 26%,transparent),rgba(0,0,0,.25) 70%)}
.tbhero.none{--ec:#8a7a6a}
.tbbig{flex:none;width:80px;height:80px;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle,rgba(255,255,255,.08),rgba(0,0,0,.5) 70%);border:2px solid color-mix(in srgb,var(--ec,#8a7a6a) 70%,transparent);box-shadow:0 0 18px color-mix(in srgb,var(--tc,#000) 45%,transparent)}
.tbbig.spin svg{animation:tbSpin 3s linear infinite}.tbbig.spin2 svg{animation:tbSpin 8s linear infinite}
.tbbig.flick svg{animation:tbFlick 1.1s steps(2) infinite}.tbbig.blink svg{animation:tbBlink 1.6s ease-in-out infinite}.tbbig.pulse svg{animation:tbPulse 1.8s ease-in-out infinite}
@keyframes tbSpin{to{transform:rotate(360deg)}}@keyframes tbFlick{50%{filter:drop-shadow(0 0 8px currentColor) brightness(1.5)}}
@keyframes tbBlink{50%{transform:translateX(4px);opacity:.6}}@keyframes tbPulse{50%{transform:scale(1.1);filter:drop-shadow(0 0 6px currentColor)}}
.tbht{min-width:0}
.tbq{font:800 11px var(--f-ui);letter-spacing:.06em;color:var(--ec,#bba98a)}
.tbnm{font:400 20px/1.2 var(--f-display);color:var(--tc,var(--ink))}
.tbw{font:600 12px var(--f-ui);color:var(--dim);margin-top:2px}
.tbd{margin:10px 0 0;font:600 13.5px/1.5 var(--f-ui);color:var(--ink)}
.tbfl{margin:6px 0 0;font:italic 500 12.5px/1.45 var(--f-ui);color:#d9b98a}
.tbstat{margin-top:8px;padding:7px 10px;border-radius:9px;background:rgba(0,0,0,.25);font:600 12px/1.4 var(--f-ui);color:var(--vang2)}
.tbcodex{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px}
.tbc{padding:8px;border-radius:10px;border:1px dashed rgba(255,255,255,.14);background:rgba(0,0,0,.18);min-width:0}
.tbc.on{border:1px solid color-mix(in srgb,var(--ec) 55%,transparent);box-shadow:inset 3px 0 0 var(--ec)}
.tbc.cur{box-shadow:inset 3px 0 0 var(--ec),0 0 0 2px var(--tc)}
.tbch{display:flex;align-items:center;gap:6px}
.tbch b{font:700 13px/1.2 var(--f-ui);color:var(--ink);flex:1;min-width:0}
.tbc:not(.on) b{color:var(--dim)}
.tbc p{margin:5px 0 0;font:500 11.5px/1.4 var(--f-ui);color:var(--dim)}
@media (max-width:420px){.tbcodex{grid-template-columns:1fr 1fr}.tbc p{font-size:11px}}
@media (prefers-reduced-motion:reduce){.tbbig svg{animation:none!important}}
`;
const stEl=document.createElement('style');stEl.id='thanbinhCss';stEl.textContent=css;document.head.appendChild(stEl);

/* Lưu ý: trong mã game, tên trần TB là hằng ô cầu (world.js), nên luôn gọi window.TB (hoặc window.THANBINH). */
window.TB=window.THANBINH={TRAITS,EL,elemOf,traitOf,roll:rollTrait,reroll,upgrade,lvCap,costRe,costUp,params,scaleOf,stats:ST,cur:C,save:TS,
  /* thử nghiệm: gắn Thần Tính cho vũ khí đang cầm */
  set(k,lv,q){const w=G.save.equip.vk;if(!w)return false;w.tt={k,lv:Math.min(lvCap(w),lv||1),q:q||1};recalc();return true}};
})();

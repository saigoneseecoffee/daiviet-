/* ============ HOẠT ĐỘNG (daily.js) ============
   Lý do quay lại mỗi ngày: nhiệm vụ ngày/tuần + điểm năng động, điểm danh 7 ngày và sổ 30 ngày,
   thành tựu và danh hiệu (cộng chỉ số qua móc 'stats'), lễ hội theo âm lịch thật, bế quan (thưởng khi vắng mặt), sao lưu dữ liệu.
   Lưu trong G.save.daily. Không sửa tệp khác: chỉ bọc hàm (sideEvent, doForge, die, openChest, dropChest, completeStep, saveGame, startGame, UI.open, UI.render).
   Móc thử nghiệm: window.DAILY.dev (shift thời gian, ép lễ hội, giả vắng mặt). */
(function(){
'use strict';
const DV={off:0,force:null,drops:[],deco:null,popQ:[],popOn:false,achDirty:1,badgeT:0,slowT:0,achT:0,lastW:null,badge:-1};
const now=()=>Date.now()+DV.off;
const nowD=()=>new Date(now());
const today=()=>dayKey(nowD());
const thisWeek=()=>weekKey(nowD());
const $q=s=>document.querySelector(s);
const r10=v=>Math.max(10,Math.round(v/10)*10),r50=v=>Math.max(50,Math.round(v/50)*50),r100=v=>Math.max(100,Math.round(v/100)*100);
const keyToDate=k=>new Date(Math.floor(k/10000),Math.floor(k/100)%100-1,k%100);
const prevKey=k=>{const d=keyToDate(k);d.setDate(d.getDate()-1);return dayKey(d)};
function fmtDur(ms){ms=Math.max(0,ms);const m=Math.floor(ms/60000),d=Math.floor(m/1440),h=Math.floor(m%1440/60),mm=m%60;
  if(d)return d+' ngày '+h+' giờ';if(h)return h+' giờ '+mm+' phút';return mm+' phút'}

/* ---------------- LƯU ---------------- */
function D(){const S=G.save;if(!S)return null;let d=S.daily;
  if(!d||typeof d!=='object'||Array.isArray(d))d=S.daily={};
  if(!d.v){d.v=1}
  if(!d.cnt||typeof d.cnt!=='object')d.cnt={};
  if(!d.ach||typeof d.ach!=='object')d.ach={};
  if(!d.login||typeof d.login!=='object')d.login={last:0,streak:0,book:0,books:0,total:0};
  if(!d.ev||typeof d.ev!=='object')d.ev={};
  if(!d.et||typeof d.et!=='object')d.et={};
  if(!Array.isArray(d.q))d.q=[];if(!Array.isArray(d.wq))d.wq=[];
  if(!Array.isArray(d.chest))d.chest=[0,0,0];
  if(typeof d.ap!=='number')d.ap=0;
  return d}

/* ---------------- PHẦN THƯỞNG ---------------- */
const SVG={
  gold:typeof ICO_GOLD!=='undefined'?ICO_GOLD:'',ore:typeof ICO_ORE!=='undefined'?ICO_ORE:'',
  cq:'<svg viewBox="0 0 16 16" width="14" height="14"><circle cx="8" cy="8" r="6.5" fill="#3a2a6a"/><path d="M8 2.5a5.5 5.5 0 015.2 4C11 4.6 8.2 6 8 8s2.4 3.6 4.6 2.2A5.5 5.5 0 118 2.5z" fill="#9f8cff"/><circle cx="8" cy="8" r="1.6" fill="#e6dcff"/></svg>',
  tq:'<svg viewBox="0 0 16 16" width="14" height="14"><rect x="2" y="3" width="12" height="10" rx="1.5" fill="#d8c08a"/><rect x="1" y="2.5" width="2.4" height="11" rx="1.2" fill="#8a5a2a"/><rect x="12.6" y="2.5" width="2.4" height="11" rx="1.2" fill="#8a5a2a"/><path d="M5 6h6M5 8.5h6M5 11h4" stroke="#6a3a1a" stroke-width="1"/></svg>',
  charm:'<svg viewBox="0 0 16 16" width="14" height="14"><rect x="4" y="1.5" width="8" height="13" rx="1" fill="#efe0b0"/><path d="M6 4.5h4M8 4.5v7M6 8h4M6 11l2-1.4 2 1.4" stroke="#c8361f" stroke-width="1.2" fill="none"/></svg>',
  potHP:'<svg viewBox="0 0 16 16" width="14" height="14"><path d="M6 1.5h4v2l2 3v6.5a1.5 1.5 0 01-1.5 1.5h-5A1.5 1.5 0 014 13V6.5l2-3z" fill="#d93a2a"/></svg>',
  potMP:'<svg viewBox="0 0 16 16" width="14" height="14"><path d="M6 1.5h4v2l2 3v6.5a1.5 1.5 0 01-1.5 1.5h-5A1.5 1.5 0 014 13V6.5l2-3z" fill="#3a6ad9"/></svg>',
  item:'<svg viewBox="0 0 16 16" width="14" height="14"><rect x="1.5" y="6" width="13" height="8" rx="1" fill="#8a4a1a"/><path d="M1.5 6.5C1.5 3 4 2 8 2s6.5 1 6.5 4.5z" fill="#b8642a"/><rect x="1.5" y="6" width="13" height="1.6" fill="#ffd23a"/><rect x="7" y="6.5" width="2" height="3" fill="#ffd23a"/></svg>',
  leg:'<svg viewBox="0 0 16 16" width="14" height="14"><path d="M8 1l2 4.6 5 .5-3.8 3.3 1.1 4.9L8 11.8 3.7 14.3l1.1-4.9L1 6.1l5-.5z" fill="#ff9d2e" stroke="#fff2cc" stroke-width=".6"/></svg>',
  exp:'<svg viewBox="0 0 16 16" width="14" height="14"><circle cx="8" cy="8" r="6.5" fill="#6a4a10"/><text x="8" y="11" font-size="7.5" font-weight="800" text-anchor="middle" fill="#ffd98a" font-family="sans-serif">KN</text></svg>',
};
const RW_NAME=Object.assign({},RES_NAME,{exp:'kinh nghiệm'});
function rwChips(rw){if(!rw)return'';const o=[];
  for(const k of ['gold','exp','ore','cq','tq','charm','potHP','potMP'])if(rw[k])o.push(`<span class="dlRw">${SVG[k]||''}${k==='gold'||k==='exp'||k==='cq'?fmt(rw[k]):rw[k]} ${esc(RW_NAME[k]||k)}</span>`);
  if(rw.item!=null)o.push(`<span class="dlRw" style="color:${RARITY[rw.item].color}">${SVG.item}Trang bị ${esc(RARITY[rw.item].name)}</span>`);
  if(rw.leg)o.push(`<span class="dlRw" style="color:#ffb347">${SVG.leg}${Math.round(rw.leg*100)}% Huyền Thoại</span>`);
  if(rw.tok)o.push(`<span class="dlRw">${evIcon(rw.tokEv)} ${rw.tok} ${esc(rw.tokName||'')}</span>`);
  return o.join('')}
function giveRw(rw,why){const S=G.save;if(!S||!rw)return'';const parts=[];
  for(const k of ['gold','ore','cq','tq','charm','potHP','potMP'])if(rw[k]){giveRes(k,rw[k],why||'daily');parts.push('+'+(k==='gold'||k==='cq'?fmt(rw[k]):rw[k])+' '+RW_NAME[k])}
  if(rw.potHP||rw.potMP)G.dirty.pot=1;
  if(rw.exp&&G.p){gainExp(rw.exp);parts.push('+'+fmt(rw.exp)+' kinh nghiệm')}
  let legGot=false;
  if(rw.leg&&window.LEGEND&&typeof LEGEND.drop==='function'&&Math.random()<rw.leg&&G.p){try{const it=LEGEND.drop(G.p.x,G.p.y,S.lvl,null,true);if(it){legGot=true;parts.push(it.name)}}catch(e){console.error(e)}}
  const ir=rw.item!=null?rw.item:(rw.leg&&!legGot&&rw.legFb!=null?rw.legFb:null);
  if(ir!=null){const it=genItem(S.lvl+(rw.ilv||1),Math.min(ir,4));addToBag(it,true);parts.push(itemName(it))}
  G.dirty.stats=1;return parts.join(', ')}
const g0=L=>50*L+200;

/* ---------------- NHIỆM VỤ NGÀY / TUẦN ---------------- */
const hasTower=()=>{if(window.VT&&typeof VT.unlocked==='function')return VT.unlocked();return !!(G.save&&G.save.tower&&typeof G.save.tower==='object')||!!window.TOWER};
function curStep(){try{const S=G.save,M=MAPS[S.map];return M&&M.quest?M.quest[S.qs[S.map]]:null}catch(e){return null}}
const QD={
  kill:{nm:n=>`Hạ ${n} quái`,n:L=>Math.min(400,r10(80+L*2.2)),w:0,wn:L=>Math.min(3000,r50(800+L*14))},
  elite:{nm:n=>`Hạ ${n} quái tinh anh`,n:L=>2+Math.floor(L/40),ok:L=>L>=3,w:3,wn:L=>12+Math.floor(L/15)},
  skill:{nm:n=>`Tung kỹ năng ${n} lần`,n:L=>r10(40+L/2),w:3,wn:L=>r50(300+L*2)},
  forge:{nm:n=>`Cường hóa trang bị ${n} lần`,n:()=>3,ok:L=>L>=3,w:3,wn:()=>15},
  gold:{nm:n=>`Nhặt ${fmt(n)} vàng`,n:L=>r100(45*(2*L+4)),w:3,wn:L=>r100(300*(2*L+4))},
  loot:{nm:n=>`Nhặt ${n} trang bị Tinh Xảo trở lên`,n:()=>4,w:2,wn:()=>25},
  combo:{nm:n=>`Đạt ${n} liên trảm`,n:L=>15+Math.min(25,Math.floor(L/4)),w:2,max:1},
  camp:{nm:n=>`Phá ${n} ổ quái`,n:()=>2,ok:L=>L>=2,w:2,wn:()=>12},
  horde:{nm:n=>`Đẩy lùi ${n} quái triều`,n:()=>1,ok:L=>L>=4,w:2,wn:()=>5},
  chest:{nm:n=>`Mở ${n} rương báu`,n:()=>2,ok:L=>L>=2,w:2,wn:()=>10},
  side:{nm:n=>`Hoàn thành ${n} nhiệm vụ Dã Tẩu`,n:()=>3,w:2,wn:()=>15},
  main:{nm:n=>`Hoàn thành ${n} bước nhiệm vụ chính`,n:()=>1,ok:()=>{const s=curStep();return!!s&&s.t!=='boss'},w:2},
  boss:{nm:n=>`Đánh bại ${n} boss`,n:()=>1,ok:()=>{const s=curStep();return!!s&&s.t==='boss'},w:3},
  tower:{nm:n=>`Vượt ${n} tầng Vượt Tháp`,n:()=>3,ok:()=>hasTower(),w:3,wn:()=>20},
  dq:{nm:n=>`Hoàn thành ${n} nhiệm vụ hằng ngày`,wn:()=>20},
  login:{nm:n=>`Điểm danh ${n} ngày`,wn:()=>5},
};
function seedOf(k){const S=G.save;let h=k|0;const s=(S&&S.name||'')+(S&&S.cls||'');for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619);return h}
function wpick(list,rng){let t=0;for(const[,w]of list)t+=w;let r=rng()*t;for(const it of list){r-=it[1];if(r<=0)return it[0]}return list[list.length-1][0]}
function genDaily(dk){const S=G.save,L=S.lvl,rng=mulberry32(seedOf(dk));
  const keys=['kill'];const pool=Object.keys(QD).filter(k=>QD[k].w&&(!QD[k].ok||QD[k].ok(L)));
  while(keys.length<5&&pool.length){const k=wpick(pool.map(k=>[k,QD[k].w]),rng);keys.push(k);pool.splice(pool.indexOf(k),1)}
  const tqI=L>=10?1+Math.floor(rng()*(keys.length-1)):-1;
  return keys.map((k,i)=>{const rw={gold:g0(L),ore:2+Math.floor(L/20),cq:Math.round(15+L*1.5)};if(k==='forge')rw.charm=1;if(i===tqI)rw.tq=1;
    return{k,n:QD[k].n(L),p:0,c:0,rw}})}
function genWeekly(wk){const S=G.save,L=S.lvl,rng=mulberry32(seedOf(wk)^0x5bd1e995);
  const keys=['kill','dq'];const pool=['elite','forge','gold','chest','horde','side','login','skill','loot'].concat(hasTower()?['tower']:[]).filter(k=>!QD[k].ok||QD[k].ok(L)||k==='tower');
  while(keys.length<5&&pool.length){const k=pool[Math.floor(rng()*pool.length)];keys.push(k);pool.splice(pool.indexOf(k),1)}
  return keys.map((k,i)=>{const rw={gold:4*g0(L),ore:8+Math.floor(L/10),cq:150+8*L};if(i%2===1)rw.tq=2;return{k,n:QD[k].wn(L),p:0,c:0,rw}})}
const AP_EACH=20,CHEST_AT=[40,80,100];
function chestRw(i,L){return i===0?{gold:2*g0(L),potHP:5,potMP:5}:i===1?{cq:60+4*L,charm:1,ore:5}:{tq:2,cq:100+6*L,item:3,ilv:1}}
function weekChestRw(L){return{charm:3,tq:5,cq:500+20*L,leg:0.25,legFb:4,ilv:2}}
function questDone(q){return q.p>=q.n}
function roll(silent){const d=D();if(!d)return;const k=today();
  if(d.day!==k){const had=!!d.day;let left='';
    if(had){for(const q of d.q)if(questDone(q)&&!q.c){q.c=1;left+=giveRw(q.rw,'daily_auto')+' ';d.ap+=AP_EACH}
      CHEST_AT.forEach((t,i)=>{if(d.ap>=t&&!d.chest[i]){d.chest[i]=1;left+=giveRw(chestRw(i,G.save.lvl),'daily_auto')}})}
    d.day=k;d.q=genDaily(k);d.ap=0;d.chest=[0,0,0];
    if(had&&!silent){UI.toast('Ngày mới: nhiệm vụ hằng ngày đã làm mới','quest');if(left.trim())setTimeout(()=>UI.toast('Thưởng còn sót hôm qua đã gửi vào túi','quest'),500)}}
  const w=thisWeek();if(d.wk!==w){const had=!!d.wk;
    if(had)for(const q of d.wq)if(questDone(q)&&!q.c){q.c=1;giveRw(q.rw,'weekly_auto')}
    d.wk=w;d.wq=genWeekly(w);d.wc=0}
  DV.badgeDirty=1}
function bump(k,v,mx){const d=D();if(!d)return;if(v==null)v=1;if(!v)return;const c=d.cnt;
  if(mx){if(v>(c[k]||0))c[k]=v}else c[k]=(c[k]||0)+v;
  if(d.day&&d.day!==today())roll();
  for(const q of d.q)if(q.k===k&&!questDone(q)){q.p=mx?Math.max(q.p,Math.min(q.n,v)):Math.min(q.n,q.p+v);if(questDone(q)){UI.toast('Hoạt động: xong "'+QD[k].nm(q.n)+'"','quest');bump('dq')}}
  for(const q of d.wq)if(q.k===k&&!questDone(q)){q.p=mx?Math.max(q.p,Math.min(q.n,v)):Math.min(q.n,q.p+v);if(questDone(q))UI.toast('Nhiệm vụ tuần: xong "'+QD[k].nm(q.n)+'"','quest')}
  DV.achDirty=1;DV.badgeDirty=1}

/* ---------------- ĐIỂM DANH ---------------- */
function loginDayRw(day,L){switch(day){
  case 1:return{gold:2*g0(L),potHP:5};case 2:return{ore:5+Math.floor(L/10),potMP:5};case 3:return{cq:40+3*L};
  case 4:return{charm:1,gold:2*g0(L)};case 5:return{tq:1,ore:8+Math.floor(L/10)};case 6:return{cq:80+5*L,potHP:10};
  default:return{charm:2,tq:3,cq:150+8*L,leg:0.2,legFb:3,ilv:2}}}
function bookRw(i,L){if(i===30)return{tq:5,charm:3,cq:400+15*L,leg:0.35,legFb:4,ilv:2};if(i%7===0)return{charm:1,tq:2};
  if(i%5===0)return{cq:60+4*L,ore:10};return i%2?{gold:3*g0(L),potHP:3}:{ore:4+Math.floor(L/15),potMP:3}}
function loginState(){const d=D(),Lg=d.login,k=today();const claimed=Lg.last===k;
  const chain=claimed||Lg.last===prevKey(k);const nextDay=claimed?Lg.streak:(chain?Lg.streak%7+1:1);
  const filled=claimed?Lg.streak:(chain&&Lg.streak<7?Lg.streak:0);const bookNext=Lg.book>=30?1:Lg.book+1;
  return{claimed,chain,broken:!claimed&&Lg.last&&!chain,nextDay,filled,bookNext,bookFilled:claimed?Lg.book:(Lg.book>=30?0:Lg.book)}}
function checkIn(){const d=D();if(!d)return null;const Lg=d.login,st=loginState();if(st.claimed)return null;const L=G.save.lvl;
  const day=st.nextDay;Lg.streak=day;if(Lg.book>=30){Lg.book=0;Lg.books=(Lg.books||0)+1}Lg.book++;Lg.total++;Lg.last=today();
  let txt=giveRw(loginDayRw(day,L),'login');const bt=giveRw(bookRw(Lg.book,L),'login_book');
  const ev=activeEvent();let tok=0;if(ev){tok=10;evSave(ev).tok+=tok}
  bump('login');DV.achDirty=1;DV.badgeDirty=1;Audio_.play('win');saveGame();
  return{day,book:Lg.book,txt:[txt,bt,tok?('+'+tok+' '+ev.tok):''].filter(Boolean).join(', ')}}

/* ---------------- THÀNH TỰU & DANH HIỆU ---------------- */
const cnt=k=>{const d=D();return d?(d.cnt[k]||0):0};
function realmLv(){const S=G.save;try{if(window.PROG&&typeof PROG.realm==='function')return+PROG.realm()||0;
  let r=S.realm!=null?S.realm:S.prog&&typeof S.prog==='object'?(S.prog.realm!=null?S.prog.realm:S.prog.r):null;if(r&&typeof r==='object')r=r.lv!=null?r.lv:r.level!=null?r.level:r.i;return+r||0}catch(e){return 0}}
const realmOn=()=>!!(window.PROG||(G.save&&(G.save.realm!=null||G.save.prog)));
const chapters=()=>{const S=G.save;return S.ng>0?MAPS.length:(S.cleared||[]).length};
const maxEnh=()=>{const S=G.save;let m=0;for(const sl of SLOTS){const it=S.equip[sl];if(it)m=Math.max(m,it.enh||0)}for(const it of S.bag)m=Math.max(m,it.enh||0);return Math.max(m,cnt('enhMax'))};
const towerBest=()=>{const t=G.save.tower;return t&&typeof t==='object'?(+t.best||+t.max||0):0};
const legCount=()=>{const L=G.save.leg;return L&&Array.isArray(L.got)?L.got.length:0};
const mountCount=()=>G.save.mounts?Object.keys(G.save.mounts).length:0;
const ACAT=[['chien','Chiến đấu'],['tien','Tiến trình'],['suu','Sưu tầm & rèn'],['thap','Vượt Tháp'],['chuyen','Chuyên cần']];
const A=(id,cat,nm,ds,get,goal,tier,title,need)=>({id,cat,nm,ds,get,goal,tier,title,need});
const ACH=[
  A('k100','chien','Xuất Sơn','Hạ 100 quái',()=>G.save.kills,100,1),
  A('k1k','chien','Bách Chiến','Hạ 1.000 quái',()=>G.save.kills,1000,2,{nm:'Bách Chiến',b:{atkp:1}}),
  A('k10k','chien','Vạn Nhân Địch','Hạ 10.000 quái',()=>G.save.kills,10000,3,{nm:'Vạn Nhân Địch',b:{atkp:2,crit:0.5}}),
  A('k50k','chien','Sát Thần','Hạ 50.000 quái',()=>G.save.kills,50000,4,{nm:'Chiến Thần',b:{atkp:3,cdmg:10}}),
  A('e50','chien','Săn Tinh Anh','Hạ 50 quái tinh anh',()=>cnt('elite'),50,1),
  A('e500','chien','Khắc Tinh Tinh Anh','Hạ 500 quái tinh anh',()=>cnt('elite'),500,3,{nm:'Thợ Săn Tinh Anh',b:{crit:1}}),
  A('b1','chien','Trảm Tướng','Đánh bại boss đầu tiên',()=>cnt('boss'),1,1),
  A('b25','chien','Đoạt Kỳ','Đánh bại 25 boss',()=>cnt('boss'),25,3,{nm:'Trảm Tướng Đoạt Kỳ',b:{cdmg:8}}),
  A('c50','chien','Liên Hoàn','Đạt 50 liên trảm',()=>cnt('combo'),50,2,{nm:'Liên Hoàn Trảm',b:{aspd:2}}),
  A('c150','chien','Phong Ba Bão Táp','Đạt 150 liên trảm',()=>cnt('combo'),150,3),
  A('s1k','chien','Võ Công Thuần Thục','Tung kỹ năng 1.000 lần',()=>cnt('skill'),1000,2,{nm:'Kỳ Tài Võ Học',b:{exp:3}}),
  A('h10','chien','Trấn Thủ Biên Cương','Đẩy lùi 10 quái triều',()=>cnt('horde'),10,2,{nm:'Trấn Thủ',b:{hpp:3}}),
  A('cp20','chien','Phá Trại','Phá 20 ổ quái',()=>cnt('camp'),20,2),
  A('d10','chien','Bất Khuất','Trọng thương 10 lần mà vẫn đứng dậy',()=>cnt('death'),10,1,{nm:'Bất Khuất',b:{hpp:2}}),
  A('l10','tien','Tráng Niên','Đạt cấp 10',()=>G.save.lvl,10,1),
  A('l30','tien','Tráng Sĩ','Đạt cấp 30',()=>G.save.lvl,30,2,{nm:'Tráng Sĩ Đất Việt',b:{hpp:2}}),
  A('l60','tien','Đại Hiệp','Đạt cấp 60',()=>G.save.lvl,60,3,{nm:'Đại Hiệp',b:{atkp:2,hpp:2}}),
  A('l100','tien','Tông Sư','Đạt cấp 100',()=>G.save.lvl,100,4,{nm:'Tông Sư',b:{atkp:3,hpp:3}}),
  A('l126','tien','Chí Tôn','Đạt cấp 126',()=>G.save.lvl,126,4,{nm:'Võ Lâm Chí Tôn',b:{atkp:4,hpp:4,crit:1}}),
  A('ch3','tien','Mở Cõi','Chinh phục 3 chương',chapters,3,2),
  A('ch6','tien','Anh Hùng','Chinh phục 6 chương',chapters,6,3,{nm:'Anh Hùng Đại Việt',b:{atkp:2}}),
  A('ch12','tien','Hộ Quốc','Chinh phục 12 chương',chapters,12,4,{nm:'Hộ Quốc Công Thần',b:{atkp:3,hpp:3}},()=>MAPS.length>=12),
  A('ng1','tien','Luân Hồi','Luân Hồi lần đầu',()=>G.save.ng||0,1,3,{nm:'Luân Hồi Giả',b:{exp:5}}),
  A('r1','tien','Nhập Môn Cảnh Giới','Đột phá Cảnh Giới đầu tiên',realmLv,1,2,null,realmOn),
  A('r5','tien','Chân Nhân','Đạt Cảnh Giới thứ 5',realmLv,5,4,{nm:'Chân Nhân',b:{hpp:3,crit:0.5}},realmOn),
  A('sk20','tien','Tuyệt Học','Nâng một kỹ năng lên cấp 20',()=>Math.max.apply(null,G.save.skl),20,4,{nm:'Tuyệt Học',b:{cdmg:6}},()=>realmOn()||Math.max.apply(null,G.save.skl)>10),
  A('lg1','suu','Thần Binh Hiện Thế','Tìm được 1 món Huyền Thoại',legCount,1,2,null,()=>!!window.LEGEND),
  A('lg5','suu','Thần Binh Chủ','Tìm được 5 món Huyền Thoại khác nhau',legCount,5,4,{nm:'Thần Binh Chủ',b:{atkp:2}},()=>!!window.LEGEND),
  A('m3','suu','Mã Đáo Thành Công','Sở hữu 3 thú cưỡi',mountCount,3,2),
  A('mall','suu','Kỵ Tướng','Sở hữu mọi thú cưỡi',mountCount,typeof MOUNTS!=='undefined'?MOUNTS.length:6,3,{nm:'Kỵ Tướng',b:{spd:3}}),
  A('f1','suu','Lửa Lò Đầu','Cường hóa thành công lần đầu',()=>cnt('forgeOk'),1,1),
  A('f200','suu','Đe Mòn Búa','Cường hóa 200 lần',()=>cnt('forge'),200,3),
  A('en10','suu','Thiết Thủ','Có trang bị +10',maxEnh,10,3,{nm:'Thiết Thủ',b:{hpp:2}}),
  A('en15','suu','Đúc Kiếm Đại Sư','Có trang bị +15',maxEnh,15,4,{nm:'Đúc Kiếm Đại Sư',b:{atkp:2,crit:0.5}}),
  A('t10','thap','Leo Tháp','Vượt tầng 10 Vượt Tháp',towerBest,10,2,null,hasTower),
  A('t50','thap','Vượt Tháp Giả','Vượt tầng 50',towerBest,50,3,{nm:'Vượt Tháp Giả',b:{atkp:1,hpp:1}},hasTower),
  A('t100','thap','Thiên Tháp Chi Chủ','Vượt tầng 100',towerBest,100,4,{nm:'Thiên Tháp Chi Chủ',b:{atkp:3}},hasTower),
  A('li7','chuyen','Ghé Thăm','Điểm danh 7 ngày',()=>D().login.total,7,1),
  A('li30','chuyen','Trung Kiên','Điểm danh 30 ngày',()=>D().login.total,30,3,{nm:'Trung Kiên',b:{gold:5}}),
  A('li100','chuyen','Lão Làng','Điểm danh 100 ngày',()=>D().login.total,100,4,{nm:'Lão Làng Giang Hồ',b:{exp:5,gold:5}}),
  A('dq100','chuyen','Cần Mẫn','Hoàn thành 100 nhiệm vụ hằng ngày',()=>cnt('dq'),100,3,{nm:'Cần Mẫn',b:{exp:3}}),
  A('pt10','chuyen','Lữ Khách','Chơi 10 giờ',()=>Math.floor(cnt('play')/3600),10,2),
  A('pt100','chuyen','Lãng Khách','Chơi 100 giờ',()=>Math.floor(cnt('play')/3600),100,4,{nm:'Lãng Khách',b:{spd:2}}),
  A('off24','chuyen','Bế Quan','Bế quan tổng cộng 24 giờ',()=>Math.floor(cnt('offl')/3600),24,2,{nm:'Bế Quan Tu Luyện',b:{exp:3}}),
  A('g1m','chuyen','Phú Hộ','Nhặt tổng cộng 1.000.000 vàng',()=>cnt('gold'),1e6,3,{nm:'Phú Hộ',b:{gold:8}}),
  A('ev1','chuyen','Vui Hội','Đổi quà lễ hội lần đầu',()=>cnt('evx'),1,1),
];
const ACH_BY={};ACH.forEach(a=>ACH_BY[a.id]=a);
function achRw(t,L){return t===1?{gold:2*g0(L),ore:5}:t===2?{cq:100+5*L,charm:1}:t===3?{tq:2,charm:2,cq:200+8*L}:{tq:5,charm:3,cq:500+20*L,leg:0.3,legFb:4,ilv:2}}
const BON_NM={atkp:'% công',hpp:'% sinh lực',crit:'% chí mạng',cdmg:'% ST chí mạng',aspd:'% tốc đánh',spd:'% tốc chạy',exp:'% kinh nghiệm',gold:'% vàng'};
const bonTxt=b=>Object.keys(b).map(k=>'+'+b[k]+BON_NM[k]).join(', ');
/* danh hiệu lễ hội */
const EV_TITLE={tet:{nm:'Xuân Như Ý',b:{gold:5,exp:2}},giogo:{nm:'Con Rồng Cháu Tiên',b:{hpp:3}},trungthu:{nm:'Rước Đèn Trăng Rằm',b:{exp:5}},quockhanh:{nm:'Độc Lập Tự Do',b:{atkp:2}}};
function titleList(){const d=D();if(!d)return[];const o=[];
  for(const a of ACH)if(a.title&&d.ach[a.id])o.push({id:a.id,nm:a.title.nm,b:a.title.b,src:a.nm});
  for(const k in EV_TITLE)if(d.et[k])o.push({id:'ev_'+k,nm:EV_TITLE[k].nm,b:EV_TITLE[k].b,src:'Lễ hội'});
  return o}
function titleById(id){if(!id)return null;if(id.startsWith('ev_')){const k=id.slice(3);return EV_TITLE[k]&&D().et[k]?{id,nm:EV_TITLE[k].nm,b:EV_TITLE[k].b}:null}
  const a=ACH_BY[id];return a&&a.title&&D().ach[id]?{id,nm:a.title.nm,b:a.title.b}:null}
function curTitle(){const d=D();return d?titleById(d.title):null}
function setTitle(id){const d=D();d.title=id||null;if(G.p)recalc();updPlate();saveGame()}
HK.on('stats',st=>{const S=G.save;if(!S||!S.daily)return;const L=titleList();const eq=S.daily.title;
  for(const t of L){const m=t.id===eq?2:1;for(const k in t.b)st[k]=(st[k]||0)+t.b[k]*m}});
function checkAch(){const d=D();if(!d||!G.p)return;let n=0;
  for(const a of ACH){if(d.ach[a.id])continue;if(a.need&&!a.need())continue;let v=0;try{v=a.get()}catch(e){continue}
    if(v>=a.goal){d.ach[a.id]=1;n++;DV.popQ.push(a);if(a.title&&!d.title)d.title=a.id}}
  if(n){recalc();updPlate();showPop();DV.badgeDirty=1}DV.achDirty=0}
function claimAch(id){const d=D(),a=ACH_BY[id];if(!a||d.ach[id]!==1)return'';d.ach[id]=2;const t=giveRw(achRw(a.tier,G.save.lvl),'ach');DV.badgeDirty=1;return t}

/* ---------------- ÂM LỊCH (thuật toán Hồ Ngọc Đức, múi giờ +7) ---------------- */
const INT=Math.floor,TZ=7;
function jdFromDate(dd,mm,yy){const a=INT((14-mm)/12),y=yy+4800-a,m=mm+12*a-3;let jd=dd+INT((153*m+2)/5)+365*y+INT(y/4)-INT(y/100)+INT(y/400)-32045;if(jd<2299161)jd=dd+INT((153*m+2)/5)+365*y+INT(y/4)-32083;return jd}
function jdToDate(jd){let a,b,c;if(jd>2299160){a=jd+32044;b=INT((4*a+3)/146097);c=a-INT(b*146097/4)}else{b=0;c=jd+32082}const d=INT((4*c+3)/1461),e=c-INT(1461*d/4),m=INT((5*e+2)/153);return[e-INT((153*m+2)/5)+1,m+3-12*INT(m/10),b*100+d-4800+INT(m/10)]}
function newMoon(k){const T=k/1236.85,T2=T*T,T3=T2*T,dr=Math.PI/180;let Jd1=2415020.75933+29.53058868*k+0.0001178*T2-0.000000155*T3;Jd1+=0.00033*Math.sin((166.56+132.87*T-0.009173*T2)*dr);
  const M=359.2242+29.10535608*k-0.0000333*T2-0.00000347*T3,Mpr=306.0253+385.81691806*k+0.0107306*T2+0.00001236*T3,F=21.2964+390.67050646*k-0.0016528*T2-0.00000239*T3;
  let C1=(0.1734-0.000393*T)*Math.sin(M*dr)+0.0021*Math.sin(2*dr*M);C1=C1-0.4068*Math.sin(Mpr*dr)+0.0161*Math.sin(dr*2*Mpr);C1=C1-0.0004*Math.sin(dr*3*Mpr);
  C1=C1+0.0104*Math.sin(dr*2*F)-0.0051*Math.sin(dr*(M+Mpr));C1=C1-0.0074*Math.sin(dr*(M-Mpr))+0.0004*Math.sin(dr*(2*F+M));C1=C1-0.0004*Math.sin(dr*(2*F-M))-0.0006*Math.sin(dr*(2*F+Mpr));
  C1=C1+0.0010*Math.sin(dr*(2*F-Mpr))+0.0005*Math.sin(dr*(2*Mpr+M));const dt=T<-11?0.001+0.000839*T+0.0002261*T2-0.00000845*T3-0.000000081*T*T3:-0.000278+0.000265*T+0.000262*T2;return Jd1+C1-dt}
function sunLong(jdn){const T=(jdn-2451545.0)/36525,T2=T*T,dr=Math.PI/180;const M=357.52910+35999.05030*T-0.0001559*T2-0.00000048*T*T2,L0=280.46645+36000.76983*T+0.0003032*T2;
  let DL=(1.914600-0.004817*T-0.000014*T2)*Math.sin(dr*M);DL=DL+(0.019993-0.000101*T)*Math.sin(dr*2*M)+0.000290*Math.sin(dr*3*M);let L=(L0+DL)*dr;L=L-Math.PI*2*INT(L/(Math.PI*2));return L}
const sunLongDay=(d)=>INT(sunLong(d-0.5-TZ/24)/Math.PI*6);
const newMoonDay=k=>INT(newMoon(k)+0.5+TZ/24);
function lunarMonth11(yy){const off=jdFromDate(31,12,yy)-2415021,k=INT(off/29.530588853);let nm=newMoonDay(k);if(sunLongDay(nm)>=9)nm=newMoonDay(k-1);return nm}
function leapOffset(a11){const k=INT((a11-2415021.076998695)/29.530588853+0.5);let last=0,i=1,arc=sunLongDay(newMoonDay(k+i));do{last=arc;i++;arc=sunLongDay(newMoonDay(k+i))}while(arc!==last&&i<14);return i-1}
function lunarToJd(ld,lm,ly){let a11,b11;if(lm<11){a11=lunarMonth11(ly-1);b11=lunarMonth11(ly)}else{a11=lunarMonth11(ly);b11=lunarMonth11(ly+1)}
  const k=INT(0.5+(a11-2415021.076998695)/29.530588853);let off=lm-11;if(off<0)off+=12;
  if(b11-a11>365){const lo=leapOffset(a11);if(off>=lo)off+=1}
  return newMoonDay(k+off)+ld-1}
const jdToday=()=>{const d=nowD(),k=d.getFullYear()*10000+d.getMonth()*100+d.getDate();if(DV.jk!==k){DV.jk=k;DV.jd=jdFromDate(d.getDate(),d.getMonth()+1,d.getFullYear())}return DV.jd};
const jdStr=jd=>{const[d,m,y]=jdToDate(jd);return d+'/'+m+'/'+y};

/* ---------------- LỄ HỘI ---------------- */
const EVD={
  tet:{nm:'Tết Nguyên Đán',tok:'Bánh Chưng',col:'#4f9a3a',at:y=>lunarToJd(1,1,y),from:-7,to:9,
    ds:'Mừng xuân mới: phố trại treo đèn lồng đỏ, cây mai vàng, hoa đào. Quái rơi Bánh Chưng, đổi lấy lộc đầu năm.'},
  giogo:{nm:'Giỗ Tổ Hùng Vương',tok:'Bánh Giầy',col:'#e8e0c8',at:y=>lunarToJd(10,3,y),from:-4,to:3,
    ds:'Mùng 10 tháng 3 âm lịch, nhớ công dựng nước của các Vua Hùng. Cờ hội ngũ sắc tung bay, quái rơi Bánh Giầy.'},
  trungthu:{nm:'Tết Trung Thu',tok:'Lồng Đèn',col:'#ffb52e',at:y=>lunarToJd(15,8,y),from:-7,to:3,
    ds:'Rằm tháng Tám, đèn ông sao sáng khắp trại. Quái rơi Lồng Đèn, đổi quà phá cỗ trông trăng.'},
  quockhanh:{nm:'Quốc Khánh 2/9',tok:'Cờ Hội',col:'#da251d',at:y=>jdFromDate(2,9,y),from:-4,to:3,
    ds:'Mừng ngày Độc Lập 2/9/1945. Cờ đỏ sao vàng rợp trại, quái rơi Cờ Hội.'},
};
function evInst(id,y){const E=EVD[id],c=E.at(y);return{id,y,key:id+y,nm:E.nm,tok:E.tok,col:E.col,ds:E.ds,day:c,start:c+E.from,end:c+E.to}}
const EVC={};
function eventsAround(){const Y=nowD().getFullYear();if(EVC.y===Y)return EVC.l;const o=[];for(let y=Y-1;y<=Y+1;y++)for(const id in EVD)o.push(evInst(id,y));EVC.y=Y;EVC.l=o.sort((a,b)=>a.start-b.start);return EVC.l}
function activeEvent(){const j=jdToday(),k=j+'|'+DV.force;if(DV.aek!==k){DV.aek=k;DV.ae=activeEvent0()}return DV.ae}
function activeEvent0(){if(DV.force){const j=jdToday();return Object.assign(evInst(DV.force,nowD().getFullYear()),{start:j-1,end:j+5,key:DV.force+'dev'})}
  const j=jdToday();return eventsAround().find(e=>j>=e.start&&j<=e.end)||null}
function upcoming(n){const j=jdToday();return eventsAround().filter(e=>e.start>j).slice(0,n||4)}
function evSave(ev){const d=D();let s=d.ev[ev.key];if(!s){s=d.ev[ev.key]={tok:0,buy:{}};
  for(const k in d.ev)if(k!==ev.key&&!d.ev[k].keep)delete d.ev[k]}return s}
function evShop(ev,L){return[
  {id:'gold',nm:'Túi lộc vàng',c:5,lim:10,rw:{gold:3*g0(L)}},
  {id:'ore',nm:'Huyền Thiết',c:8,lim:5,rw:{ore:10}},
  {id:'cq',nm:'Đan Chân Khí',c:15,lim:5,rw:{cq:150+6*L}},
  {id:'tq',nm:'Tàn Quyển võ học',c:25,lim:4,rw:{tq:2}},
  {id:'charm',nm:'Bùa Bảo Hộ',c:30,lim:3,rw:{charm:2}},
  {id:'item',nm:'Rương Thần Khí',c:60,lim:1,rw:{item:4,ilv:1}},
  {id:'title',nm:'Danh hiệu: '+EV_TITLE[ev.id].nm,c:100,lim:1,title:ev.id}]}
function evBuy(id){const ev=activeEvent();if(!ev)return;const s=evSave(ev),it=evShop(ev,G.save.lvl).find(x=>x.id===id);if(!it)return;
  const b=s.buy[id]||0;if(b>=it.lim||s.tok<it.c)return;if(it.title&&D().et[it.title])return;
  s.tok-=it.c;s.buy[id]=b+1;let t;if(it.title){D().et[it.title]=1;t='Danh hiệu '+EV_TITLE[it.title].nm;if(G.p)recalc()}else t=giveRw(it.rw,'event');
  bump('evx');Audio_.play('coin');UI.toast('Đổi quà lễ hội: '+t,'quest');saveGame()}
function evIcon(id,sz){sz=sz||14;const s=`width="${sz}" height="${sz}" viewBox="0 0 16 16"`;
  if(id==='tet')return`<svg ${s}><rect x="2" y="2" width="12" height="12" rx="1.5" fill="#3f8a2e"/><path d="M2 8h12M8 2v12" stroke="#d8392a" stroke-width="1.4"/><path d="M4 4l3 3M12 4l-3 3" stroke="#7fc25a" stroke-width=".8"/></svg>`;
  if(id==='giogo')return`<svg ${s}><ellipse cx="8" cy="9" rx="6.5" ry="5" fill="#f4eedc"/><ellipse cx="8" cy="7.8" rx="5" ry="3" fill="#fffaf0"/><circle cx="8" cy="8" r="1.4" fill="#c9a24e"/></svg>`;
  if(id==='trungthu')return`<svg ${s}><path d="M8 1.5l1.9 4.1 4.5.5-3.4 3 1 4.4L8 11.3 4 13.5l1-4.4-3.4-3 4.5-.5z" fill="#ff4a2a" stroke="#ffd23a" stroke-width="1"/></svg>`;
  return`<svg ${s}><rect x="1.5" y="3" width="13" height="9" fill="#da251d"/><path d="M8 4.6l.9 2 2.1.2-1.6 1.4.5 2.1L8 9.2l-1.9 1.1.5-2.1L5 6.8l2.1-.2z" fill="#ffde00"/></svg>`}

/* ---------------- BẾ QUAN ---------------- */
const OFF_MIN=10*60000,OFF_CAP=12*3600000;
function offRate(L){return{exp:need(L)*0.06,gold:150*L+300,cq:6+L*0.4,ore:1+L/30}}
function offCalc(ms){const S=G.save,L=S.lvl,h=Math.min(ms,OFF_CAP)/3600000,r=offRate(L);
  return{ms:Math.min(ms,OFF_CAP),real:ms,exp:Math.round(r.exp*h),gold:Math.round(r.gold*h),cq:Math.round(r.cq*h),ore:Math.floor(r.ore*h)}}
function touchSeen(){const d=D();if(!d)return;const t=now();if(!d.seen||t>d.seen)d.seen=t}
function checkOffline(){const d=D();if(!d)return;const t=now();
  if(!d.seen){d.seen=t;return}
  const away=t-d.seen;if(away<0){return}/* đồng hồ bị lùi: bỏ qua, giữ mốc lớn nhất */
  if(away>=OFF_MIN&&!d.pend){d.pend=offCalc(away)}
  d.seen=Math.max(d.seen,t);if(d.pend)showOffCard()}
function claimOff(){const d=D();const p=d&&d.pend;if(!p)return;d.pend=null;
  const t=giveRw({gold:p.gold,cq:p.cq,ore:p.ore,exp:p.exp},'offline');d.cnt.offl=(d.cnt.offl||0)+Math.round(p.ms/1000);d.lastOff={t:now(),ms:p.ms};
  DV.achDirty=1;saveGame();return t}
function showOffCard(){const d=D(),p=d&&d.pend;if(!p||G.state!=='play')return;ensureDom();const el=$q('#dlyOff');
  $q('#dlyOffP').innerHTML=`<div class="stamp">Xuất<br>Quan</div><div class="era">BẾ QUAN TU LUYỆN</div><h3>Xuất quan</h3>
    <p>${esc(G.save.name)} đã bế quan <b>${fmtDur(p.real)}</b>${p.real>OFF_CAP?' (tính tối đa 12 giờ)':''}. Chân khí vận chuyển đủ chu thiên, công lực tăng tiến:</p>
    <div class="dlOffRw">${rwChips({exp:p.exp,gold:p.gold,cq:p.cq,ore:p.ore})}</div>
    <button class="btn" id="dlyOffGo">Nhận và tiếp tục</button>`;
  el.hidden=false;G.paused=true;
  if(anim)anim.fromTo('#dlyOffP',{y:30,autoAlpha:0},{y:0,autoAlpha:1,duration:.5,ease:'power3.out'});
  $q('#dlyOffGo').onclick=()=>{const t=claimOff();el.hidden=true;if(!UI.panel&&$q('#story').hidden)G.paused=false;Audio_.play('win');if(t)UI.toast('Xuất quan: '+t,'quest');DV.badgeDirty=1}}

/* ---------------- SAO LƯU ---------------- */
const CRC_T=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0}return t})();
function crc32(str){const b=new TextEncoder().encode(str);let c=0xFFFFFFFF;for(let i=0;i<b.length;i++)c=CRC_T[(c^b[i])&255]^(c>>>8);return((c^0xFFFFFFFF)>>>0).toString(16).padStart(8,'0')}
function b64(bytes){let s='';for(let i=0;i<bytes.length;i+=0x8000)s+=String.fromCharCode.apply(null,bytes.subarray(i,i+0x8000));return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
function unb64(s){s=s.replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';const bin=atob(s),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return u}
async function pipe(bytes,T){const st=new Blob([bytes]).stream().pipeThrough(T);return new Uint8Array(await new Response(st).arrayBuffer())}
async function exportCode(){const json=JSON.stringify(G.save);const sum=crc32(json);const raw=new TextEncoder().encode(json);
  if(typeof CompressionStream!=='undefined'){try{return'DVHK1.z.'+b64(await pipe(raw,new CompressionStream('deflate-raw')))+'.'+sum}catch(e){}}
  return'DVHK1.j.'+b64(raw)+'.'+sum}
function validSave(o){return!!(o&&typeof o==='object'&&o.ver===1&&typeof o.cls==='string'&&CLASS_BY_ID[o.cls]&&typeof o.name==='string'&&Number.isFinite(o.lvl)&&o.lvl>=1&&o.lvl<10000&&
  Number.isFinite(o.gold)&&Array.isArray(o.bag)&&o.equip&&typeof o.equip==='object'&&Array.isArray(o.skl)&&Array.isArray(o.qs)&&o.set&&typeof o.set==='object'&&Number.isFinite(o.map)&&o.map>=0&&o.map<MAPS.length)}
async function parseCode(txt){txt=String(txt||'').trim();if(!txt)throw new Error('Chưa có mã sao lưu');
  if(txt[0]==='{'){let o;try{o=JSON.parse(txt)}catch(e){throw new Error('Tệp không phải JSON hợp lệ')}
    if(o&&o.game==='dvhk'&&o.save){const js=JSON.stringify(o.save);if(o.sum&&crc32(js)!==o.sum)throw new Error('Sai mã kiểm tra: tệp đã bị sửa hoặc hỏng');o=o.save}
    if(!validSave(o))throw new Error('Dữ liệu không phải nhân vật Đại Việt Hiệp Khách');return o}
  txt=txt.replace(/\s+/g,'');const m=/^DVHK1\.([zj])\.([A-Za-z0-9_-]+)\.([0-9a-f]{8})$/.exec(txt);if(!m)throw new Error('Mã không đúng định dạng (phải bắt đầu bằng DVHK1.)');
  let bytes;try{bytes=unb64(m[2])}catch(e){throw new Error('Mã bị thiếu hoặc lỗi ký tự')}
  if(m[1]==='z'){if(typeof DecompressionStream==='undefined')throw new Error('Trình duyệt không hỗ trợ giải nén mã này');try{bytes=await pipe(bytes,new DecompressionStream('deflate-raw'))}catch(e){throw new Error('Mã bị hỏng, không giải nén được')}}
  const json=new TextDecoder().decode(bytes);if(crc32(json)!==m[3])throw new Error('Sai mã kiểm tra: mã bị chép thiếu hoặc bị sửa');
  let o;try{o=JSON.parse(json)}catch(e){throw new Error('Mã bị hỏng')}if(!validSave(o))throw new Error('Dữ liệu không phải nhân vật hợp lệ');return o}
function applyImport(o){const base=newSave(o.cls,o.name);const s=Object.assign(base,o);s.set=Object.assign(base.set,o.set||{});s.tut=Object.assign({move:true,atk:true,skill:true,equip:true,forge:true},o.tut||{});
  if(s.daily&&typeof s.daily==='object'){s.daily.seen=now();s.daily.pend=null}/* không cho nhận lại bế quan bằng mã cũ */
  store.set(SAVE_KEY,JSON.stringify(s));if(UI.panel){UI.panel=null;$q('#panel').hidden=true}G.save=loadSave()||s;startGame();UI.toast('Đã khôi phục nhân vật '+s.name,'quest')}
function fileJson(){const s=G.save,js=JSON.stringify(s);return JSON.stringify({game:'dvhk',v:1,t:new Date(now()).toISOString(),name:s.name,cls:s.cls,lvl:s.lvl,sum:crc32(js),save:s})}
function download(){const s=G.save;const blob=new Blob([fileJson()],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);
  const dk=today();a.download=`dai-viet-hiep-khach-${(s.name||'hiepkhach').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').replace(/[^A-Za-z0-9]+/g,'-').toLowerCase()}-${dk}.json`;
  document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1000);D().bak=now();saveGame()}
async function copyText(t){try{await navigator.clipboard.writeText(t);return true}catch(e){const ta=$q('#dlExp');if(ta){ta.focus();ta.select();try{return document.execCommand('copy')}catch(_){}}return false}}

/* ---------------- DOM & CSS ---------------- */
const CSS=`
#menu{position:relative}#menu>#bDaily{position:absolute;right:50px;top:0}
#bDaily svg{width:23px;height:23px}
#bDaily.glow{box-shadow:0 0 0 2px rgba(255,210,100,.55),0 3px 10px rgba(0,0,0,.4)}
#pTitle{flex:0 1 auto;min-width:0;padding:0 7px;border-radius:999px;background:linear-gradient(#a32616,#6a1a10);border:1px solid var(--vang2);
  font:700 10px/14px var(--f-ui);color:#ffe7b0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;pointer-events:none}
.pname.hasT #pRank{display:none}.pname.hasT #pName{min-width:0;overflow:hidden;text-overflow:ellipsis}
#shTabs.dlTabs{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:4px;padding:8px 12px 0;overflow:visible}
#shTabs.dlTabs .tab{position:relative;min-height:44px;padding:6px 4px;font-size:12.5px;white-space:nowrap;border-radius:9px 9px 0 0}
#shTabs.dlTabs .tab i{position:absolute;top:3px;right:3px;min-width:15px;height:15px;padding:0 3px;border-radius:8px;background:var(--son);border:1px solid var(--vang2);font:800 9px/13px var(--f-ui);font-style:normal;color:#fff}
@media(max-width:560px){#shTabs.dlTabs{grid-template-columns:repeat(3,minmax(0,1fr))}#shTabs.dlTabs .tab{border-radius:9px;min-height:44px}}
.dlRw{display:inline-flex;align-items:center;gap:3px;padding:2px 7px 2px 4px;border-radius:999px;background:rgba(0,0,0,.35);border:1px solid rgba(226,178,74,.22);font:600 11.5px/1.4 var(--f-ui);white-space:nowrap;font-variant-numeric:tabular-nums}
.dlRw svg{flex:none}
.dlRws{display:flex;flex-wrap:wrap;gap:4px;margin-top:5px}
.dlNote{font:500 12px/1.45 var(--f-ui);color:var(--dim);margin:6px 0 0}
.dlCard{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:6px 10px;align-items:center;padding:10px 12px;border-radius:12px;background:rgba(0,0,0,.25);border:1px solid rgba(226,178,74,.18);margin-bottom:8px}
.dlCard.ok{border-color:var(--vang)}.dlCard.done{opacity:.55}
.dlCard h5{margin:0;font:700 14px/1.3 var(--f-ui)}
.dlCard h5 small{font-weight:600;color:var(--dim);font-size:11.5px}
.dlProg{display:flex;align-items:center;gap:8px;margin-top:5px;font:700 11.5px var(--f-ui);color:var(--vang2);font-variant-numeric:tabular-nums}
.dlProg div{flex:1;height:6px;border-radius:3px;background:rgba(255,255,255,.1);overflow:hidden}.dlProg i{display:block;height:100%;background:linear-gradient(90deg,#c08a2a,#ffd98a)}
.dlCard .btn{min-width:84px}
.dlAp{padding:12px;border-radius:12px;background:rgba(0,0,0,.28);border:1px solid var(--line)}
.dlApTop{display:flex;justify-content:space-between;align-items:baseline;font:700 13px var(--f-ui)}.dlApTop b{font:400 22px/1 var(--f-display);color:var(--vang2)}
.dlBar{position:relative;height:10px;border-radius:5px;background:rgba(0,0,0,.5);border:1px solid rgba(0,0,0,.6);margin:8px 0 10px;overflow:hidden}
.dlBar i{position:absolute;left:0;top:0;bottom:0;background:linear-gradient(90deg,#c8361f,#ffd98a)}
.dlBar b{position:absolute;top:0;bottom:0;width:2px;background:rgba(255,240,200,.6)}
.dlChests{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}
.dlChest{display:flex;flex-direction:column;align-items:center;gap:3px;min-height:64px;padding:7px 4px;border-radius:10px;background:linear-gradient(160deg,#3a271c,#21160f);border:1px solid rgba(226,178,74,.25);font:700 11.5px/1.2 var(--f-ui);color:var(--dim);text-align:center}
.dlChest svg{width:28px;height:28px}.dlChest.ok{border-color:var(--vang2);color:var(--vang2);box-shadow:0 0 12px rgba(255,210,100,.35)}.dlChest.got{opacity:.5}
.dlWeek{display:flex;align-items:center;gap:10px;justify-content:space-between;flex-wrap:wrap}
.dl7{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:5px}
.dl7 div{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;min-height:62px;padding:5px 2px;border-radius:10px;background:rgba(0,0,0,.3);border:1px solid rgba(226,178,74,.2);font:700 10.5px/1.15 var(--f-ui);color:var(--dim);text-align:center}
.dl7 div svg{width:20px;height:20px}
.dl7 .f{background:linear-gradient(160deg,#5a3a1a,#2a1a0e);color:var(--vang2);border-color:var(--vang)}
.dl7 .f::after,.dlBook .f::after{content:"✓";position:absolute;right:3px;top:1px;font:800 11px var(--f-ui);color:#9fe89a}
.dl7 .nx{border:2px solid var(--vang2);color:var(--ink);box-shadow:0 0 10px rgba(255,210,100,.35)}
.dl7 .big{background:linear-gradient(160deg,#6a1a10,#2a0e08)}
.dlBook{display:grid;grid-template-columns:repeat(auto-fill,minmax(44px,1fr));gap:5px}
.dlBook div{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:46px;border-radius:9px;background:rgba(0,0,0,.3);border:1px solid rgba(226,178,74,.16);font:700 10px/1.1 var(--f-ui);color:var(--dim)}
.dlBook div svg{width:17px;height:17px}.dlBook .f{background:rgba(127,174,85,.18);border-color:rgba(127,174,85,.6);color:#cfe8b0}.dlBook .nx{border:2px solid var(--vang2);color:var(--ink)}
.dlBook .sp{background:linear-gradient(160deg,#4a2a14,#1d1410)}
.dlTitles{display:flex;flex-wrap:wrap;gap:6px}
.dlTitle{min-height:44px;padding:6px 12px;border-radius:10px;background:linear-gradient(160deg,#4a2f22,#22160f);border:1px solid var(--line);text-align:left;font:700 13px/1.2 var(--f-ui)}
.dlTitle small{display:block;font:600 11px/1.3 var(--f-ui);color:#cfe8b0}
.dlTitle[aria-pressed="true"]{border:2px solid var(--vang2);background:linear-gradient(160deg,#7a2a14,#3a140a);color:#ffe7b0}
.dlAch .badge{display:inline-block;margin-left:4px;padding:0 6px;border-radius:6px;background:#6a1a10;border:1px solid var(--vang);font:700 10.5px/16px var(--f-ui);color:#ffe7b0;vertical-align:1px}
.dlAch.lock{opacity:.45}
.dlEv{position:relative;padding:14px;border-radius:14px;border:1.5px solid var(--vang);background:radial-gradient(circle at 85% 20%,rgba(255,180,60,.25),transparent 50%),linear-gradient(160deg,#5a1a10,#22100a);overflow:hidden}
.dlEv h3{margin:0 0 4px;font:400 26px/1.1 var(--f-display);color:var(--vang2)}
.dlEv p{margin:0;font:500 13px/1.5 var(--f-ui);color:var(--diep)}
.dlEv .tk{display:inline-flex;align-items:center;gap:6px;margin-top:10px;padding:5px 12px;border-radius:999px;background:rgba(0,0,0,.4);border:1px solid var(--line);font:700 14px var(--f-ui)}
.dlUp{display:flex;justify-content:space-between;gap:10px;padding:10px 0;border-bottom:1px dashed rgba(255,255,255,.08);font:600 13px/1.4 var(--f-ui)}.dlUp span{color:var(--dim);text-align:right}
.dlBak textarea{width:100%;min-height:84px;padding:8px 10px;border-radius:10px;border:1px solid var(--line);background:#0e0a08;color:var(--ink);font:500 11.5px/1.35 ui-monospace,Menlo,monospace;word-break:break-all;resize:vertical;-webkit-user-select:text;user-select:text;touch-action:auto}
.dlBak .row{margin-top:8px}
.dlMsg{font:600 12.5px/1.4 var(--f-ui);margin-top:6px}.dlMsg.bad{color:#ff9a7a}.dlMsg.good{color:#9fe89a}
.dlOffRw{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 16px}.dlOffRw .dlRw{background:#2a1d16;color:var(--diep);font-size:13px;padding:4px 10px 4px 6px}
#dlyOff{background:rgba(14,9,6,.72);z-index:7}
#dlyPop{position:absolute;left:calc(12px + var(--sl));top:calc(200px + var(--st));width:min(320px,calc(100vw - 84px));padding:12px 14px;display:flex;gap:12px;align-items:center;pointer-events:none;z-index:4;border:1.5px solid var(--vang2);
  background:radial-gradient(circle at 15% 50%,rgba(255,200,90,.25),transparent 55%),linear-gradient(160deg,rgba(90,30,16,.96),rgba(29,20,16,.96));box-shadow:0 0 30px rgba(255,190,80,.35),0 10px 30px rgba(0,0,0,.6)}
#dlyPop .sl{flex:none;width:46px;height:46px;display:grid;place-items:center;border-radius:6px;background:var(--son);color:var(--diep);font:400 13px/1 var(--f-display);transform:rotate(-5deg);box-shadow:inset 0 0 0 2px rgba(255,230,200,.5);text-align:center}
#dlyPop .t1{font:700 10.5px/1 var(--f-ui);color:var(--vang);letter-spacing:.1em}
#dlyPop .t2{font:400 20px/1.15 var(--f-display);color:#fff2dc;margin:3px 0}
#dlyPop .t3{font:600 12px/1.3 var(--f-ui);color:#cfe8b0}
@media (max-height:500px){#menu>#bDaily{position:relative;right:auto;top:auto;order:-1}#dlyPop{top:calc(60px + var(--st));left:50%;transform:translateX(-50%)}}
`;
const ICO_DAILY='<svg viewBox="0 0 24 24" fill="none" stroke="#ffd98a" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"><rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/><path d="M8.5 14.5l2.3 2.2 4.7-4.7"/></svg>';
const ICO_CHEST='<svg viewBox="0 0 32 32"><rect x="4" y="13" width="24" height="15" rx="2" fill="#7a3a14"/><path d="M4 14c0-6 5-9 12-9s12 3 12 9z" fill="#b8642a"/><rect x="4" y="13" width="24" height="3" fill="#ffd23a"/><rect x="14" y="13" width="4" height="7" rx="1" fill="#ffd23a"/><path d="M8 6l1 3M24 6l-1 3M16 2v3" stroke="#ffd98a" stroke-width="1.5" stroke-linecap="round"/></svg>';
let domOk=false;
function ensureDom(){if(domOk)return;domOk=true;
  const st=document.createElement('style');st.id='dlyCss';st.textContent=CSS;document.head.appendChild(st);
  const menu=$q('#menu');menu.insertAdjacentHTML('afterbegin',`<button class="mbtn" id="bDaily" aria-label="Hoạt động">${ICO_DAILY}<span class="dot" hidden></span><span class="kc">N</span></button>`);
  $q('#bDaily').addEventListener('click',()=>{Audio_.play('ui');if(UI.panel==='daily')UI.close();else UI.open('daily')});
  const pt=document.createElement('span');pt.id='pTitle';pt.hidden=true;const pn=$q('.pname');pn.insertBefore(pt,$q('#pRank'));
  const pop=document.createElement('div');pop.id='dlyPop';pop.className='lac ghost';pop.hidden=true;$q('#hud').appendChild(pop);
  const off=document.createElement('section');off.id='dlyOff';off.className='screen';off.hidden=true;off.innerHTML='<div class="paper" id="dlyOffP"></div>';$q('#app').appendChild(off);
}
function updPlate(){if(!domOk)return;const t=G.save&&G.save.daily?curTitle():null;const el=$q('#pTitle');if(!el)return;
  if(t){el.textContent='✦ '+t.nm;el.title='Danh hiệu: '+t.nm;el.hidden=false}else el.hidden=true;el.parentNode.classList.toggle('hasT',!!t)}
function showPop(){if(DV.popOn||!DV.popQ.length||!domOk)return;const a=DV.popQ.shift();DV.popOn=true;const el=$q('#dlyPop');
  el.innerHTML=`<div class="sl">Thành<br>Tựu</div><div><div class="t1">THÀNH TỰU MỚI</div><div class="t2">${esc(a.nm)}</div><div class="t3">${a.title?'Danh hiệu: '+esc(a.title.nm)+' ('+esc(bonTxt(a.title.b))+')':esc(a.ds)+'. Nhận thưởng ở Hoạt động.'}</div></div>`;
  el.hidden=false;Audio_.play('quest');UI.toast('Thành tựu: '+a.nm+(a.title?' · danh hiệu '+a.title.nm:''),'quest');
  const done=()=>{el.hidden=true;DV.popOn=false;if(DV.popQ.length)setTimeout(showPop,250)};
  if(anim){anim.killTweensOf(el);anim.fromTo(el,{y:-16,autoAlpha:0,scale:.9},{y:0,autoAlpha:1,scale:1,duration:.4,ease:'back.out(2)'});anim.to(el,{autoAlpha:0,y:-10,delay:3,duration:.4,onComplete:done})}
  else setTimeout(done,3200)}

/* ---------------- ĐẾM HUY HIỆU ---------------- */
function counts(){const d=D();if(!d)return{};const o={day:0,login:0,ach:0,ev:0,off:0,bak:0};
  for(const q of d.q)if(questDone(q)&&!q.c)o.day++;CHEST_AT.forEach((t,i)=>{if(d.ap>=t&&!d.chest[i])o.day++});
  for(const q of d.wq)if(questDone(q)&&!q.c)o.day++;if(d.wq.length&&d.wq.every(q=>q.c)&&!d.wc)o.day++;
  if(!loginState().claimed)o.login=1;for(const id in d.ach)if(d.ach[id]===1)o.ach++;
  const ev=activeEvent();if(ev){const s=d.ev[ev.key];const tk=s?s.tok:0;if(evShop(ev,G.save.lvl).some(it=>tk>=it.c&&(s?s.buy[it.id]||0:0)<it.lim&&!(it.title&&d.et[it.title])))o.ev=1}
  if(d.pend)o.off=1;return o}
function updBadge(){if(!domOk)return;const c=counts();let n=0;for(const k in c)n+=c[k];const b=$q('#bDaily .dot');if(!b)return;
  if(n!==DV.badge){DV.badge=n;b.hidden=!n;b.textContent=n>9?'9+':n;$q('#bDaily').classList.toggle('glow',n>0)}DV.badgeDirty=0}

/* ---------------- BẢNG HOẠT ĐỘNG ---------------- */
const TABS=[['day','Hằng ngày'],['login','Điểm danh'],['ach','Thành tựu'],['ev','Sự kiện'],['off','Bế quan'],['bak','Sao lưu']];
function nextMidnight(){const d=nowD();const t=new Date(d.getFullYear(),d.getMonth(),d.getDate()+1);return t.getTime()-d.getTime()}
function nextMonday(){const d=nowD();const t=new Date(d.getFullYear(),d.getMonth(),d.getDate()+(8-((d.getDay()+6)%7+1)));return t.getTime()-d.getTime()}
function qCard(q,i,w){const done=questDone(q),pct=Math.min(100,q.p/q.n*100);const nm=QD[q.k].nm(q.n);
  const pv=q.k==='gold'?fmt(q.p)+'/'+fmt(q.n):q.p+'/'+q.n;
  const btn=q.c?'<button class="btn sec sm" disabled>Đã nhận</button>':done?`<button class="btn gold sm" data-${w?'wq':'dq'}="${i}">Nhận</button>`:`<button class="btn sec sm" disabled>Đang làm</button>`;
  return`<div class="dlCard${q.c?' done':done?' ok':''}"><div><h5>${esc(nm)}${!w?' <small>· +'+AP_EACH+' năng động</small>':''}</h5><div class="dlProg"><div><i style="width:${pct}%"></i></div>${pv}</div><div class="dlRws">${rwChips(q.rw)}</div></div>${btn}</div>`}
const P={
  day(){const d=D(),L=G.save.lvl;let h=`<div class="sec"><div class="dlAp"><div class="dlApTop"><span>Năng động hôm nay</span><b>${d.ap}/100</b></div>
    <div class="dlBar"><i style="width:${Math.min(100,d.ap)}%"></i>${CHEST_AT.slice(0,2).map(t=>`<b style="left:${t}%"></b>`).join('')}</div>
    <div class="dlChests">${CHEST_AT.map((t,i)=>{const ok=d.ap>=t&&!d.chest[i];return`<button class="dlChest${ok?' ok':''}${d.chest[i]?' got':''}" data-ch="${i}" aria-label="Rương ${t} điểm">${ICO_CHEST}<span>${d.chest[i]?'Đã mở':t+' điểm'}</span></button>`}).join('')}</div>
    <p class="dlNote">Nhận thưởng nhiệm vụ để tích điểm năng động. Rương 100 điểm có trang bị Truyền Thuyết. Làm mới sau ${fmtDur(nextMidnight())}.</p></div></div>
    <div class="sec"><h4>NHIỆM VỤ HẰNG NGÀY</h4>${d.q.map((q,i)=>qCard(q,i,0)).join('')}</div>`;
    const allW=d.wq.length&&d.wq.every(q=>q.c);
    h+=`<div class="sec"><h4>NHIỆM VỤ TUẦN · LÀM MỚI SAU ${fmtDur(nextMonday()).toUpperCase()}</h4>${d.wq.map((q,i)=>qCard(q,i,1)).join('')}
      <div class="dlCard${allW&&!d.wc?' ok':d.wc?' done':''}"><div><h5>Rương tuần: hoàn thành cả 5 nhiệm vụ tuần</h5><div class="dlRws">${rwChips(weekChestRw(L))}</div></div>
      ${d.wc?'<button class="btn sec sm" disabled>Đã nhận</button>':`<button class="btn gold sm" id="dlWc" ${allW?'':'disabled'}>Mở rương</button>`}</div></div>`;
    return h},
  login(){const d=D(),Lg=d.login,s=loginState(),L=G.save.lvl;
    let h=`<div class="sec"><h4>ĐIỂM DANH 7 NGÀY${s.broken?' · CHUỖI ĐÃ BỊ GIÁN ĐOẠN':''}</h4><div class="dl7">`;
    for(let i=1;i<=7;i++){const rw=loginDayRw(i,L);const k=i===7?'leg':Object.keys(rw)[0];const f=i<=s.filled,nx=!s.claimed&&i===s.nextDay;
      h+=`<div class="${f?'f':''}${nx?' nx':''}${i===7?' big':''}">${SVG[k]||''}Ngày ${i}</div>`}
    h+=`</div><p class="dlNote">Điểm danh liên tục để nhận quà lớn dần. Bỏ lỡ một ngày, chuỗi 7 ngày quay về Ngày 1 (sổ 30 ngày vẫn giữ nguyên).</p></div>`;
    const bk=s.claimed?Lg.book:s.bookNext;
    h+=`<div class="sec"><div class="dlCard ${s.claimed?'done':'ok'}"><div><h5>${s.claimed?'Hôm nay đã điểm danh':'Điểm danh hôm nay: Ngày '+s.nextDay+' · ô '+bk+' sổ 30 ngày'}</h5>
      ${s.claimed?`<p class="dlNote">Quay lại sau ${fmtDur(nextMidnight())} để nhận Ngày ${Lg.streak%7+1}.</p>`:`<div class="dlRws">${rwChips(loginDayRw(s.nextDay,L))}${rwChips(bookRw(bk,L))}${activeEvent()?`<span class="dlRw">${evIcon(activeEvent().id)} 10 ${esc(activeEvent().tok)}</span>`:''}</div>`}</div>
      ${s.claimed?'<button class="btn sec sm" disabled>Đã nhận</button>':'<button class="btn gold" id="dlIn">Điểm danh</button>'}</div></div>`;
    h+=`<div class="sec"><h4>SỔ 30 NGÀY · ĐÃ ĐIỂM ${s.bookFilled}/30${Lg.books?' · ĐÃ XONG '+Lg.books+' SỔ':''}</h4><div class="dlBook">`;
    for(let i=1;i<=30;i++){const rw=bookRw(i,L);const k=i===30?'leg':Object.keys(rw)[0];const sp=i===30||i%7===0;
      h+=`<div class="${i<=s.bookFilled?'f':''}${!s.claimed&&i===s.bookNext?' nx':''}${sp?' sp':''}">${SVG[k]||''}${i}</div>`}
    h+=`</div><p class="dlNote">Mỗi ngày điểm danh lấp một ô, không cần liên tục. Ô 7, 14, 21, 28 tặng Bùa Bảo Hộ và Tàn Quyển; ô 30 có cơ hội đồ Huyền Thoại. Tổng số ngày đã điểm danh: <b>${Lg.total}</b>.</p></div>`;
    return h},
  ach(){const d=D(),L=G.save.lvl,tl=titleList(),cur=d.title;let unc=0;for(const id in d.ach)if(d.ach[id]===1)unc++;
    const done=ACH.filter(a=>d.ach[a.id]).length;
    let h=`<div class="sec"><h4>DANH HIỆU · ${tl.length} ĐÃ CÓ</h4>`;
    if(!tl.length)h+=`<p class="dlNote">Chưa có danh hiệu. Hoàn thành thành tựu có biểu tượng <span class="badge" style="padding:0 6px;border-radius:6px;background:#6a1a10;border:1px solid var(--vang);color:#ffe7b0">Danh hiệu</span> để nhận.</p>`;
    else{h+=`<div class="dlTitles"><button class="dlTitle" data-title="" aria-pressed="${!cur}">Không đeo<small>Ẩn danh hiệu</small></button>${tl.map(t=>`<button class="dlTitle" data-title="${t.id}" aria-pressed="${t.id===cur}">${esc(t.nm)}<small>${esc(bonTxt(t.b))}</small></button>`).join('')}</div>`;
      const tot={};for(const t of tl)for(const k in t.b)tot[k]=(tot[k]||0)+t.b[k]*(t.id===cur?2:1);
      h+=`<p class="dlNote">Mỗi danh hiệu đã có cộng chỉ số vĩnh viễn; danh hiệu đang đeo được gấp đôi và hiện trên đầu nhân vật. Tổng: <b style="color:#cfe8b0">${esc(bonTxt(Object.fromEntries(Object.entries(tot).map(([k,v])=>[k,Math.round(v*10)/10]))))}</b>.</p>`}
    h+=`</div><div class="sec"><div class="dlWeek"><h4 style="margin:0">THÀNH TỰU ${done}/${ACH.length}</h4>${unc?`<button class="btn gold sm" id="dlAchAll">Nhận tất cả (${unc})</button>`:''}</div></div>`;
    for(const[c,cn]of ACAT){h+=`<div class="sec"><h4>${cn.toUpperCase()}</h4>`;
      for(const a of ACH.filter(x=>x.cat===c)){const st=d.ach[a.id]||0,avail=!a.need||a.need();let v=0;try{v=avail?a.get():0}catch(e){}const pct=Math.min(100,v/a.goal*100);
        const btn=st===2?'<button class="btn sec sm" disabled>Đã nhận</button>':st===1?`<button class="btn gold sm" data-ach="${a.id}">Nhận</button>`:`<button class="btn sec sm" disabled>${avail?'Chưa đạt':'Chưa mở'}</button>`;
        h+=`<div class="dlCard dlAch${st===1?' ok':st===2?' done':''}${avail?'':' lock'}"><div><h5>${esc(a.nm)}${a.title?`<span class="badge">Danh hiệu: ${esc(a.title.nm)}</span>`:''}</h5><p class="dlNote" style="margin:2px 0 0">${esc(a.ds)}${a.title?' · '+esc(bonTxt(a.title.b)):''}${avail?'':' · mở khi có tính năng này'}</p>
          ${st?'':`<div class="dlProg"><div><i style="width:${pct}%"></i></div>${fmt(Math.min(v,a.goal))}/${fmt(a.goal)}</div>`}<div class="dlRws">${rwChips(achRw(a.tier,L))}</div></div>${btn}</div>`}
      h+='</div>'}
    return h},
  ev(){const ev=activeEvent(),L=G.save.lvl,d=D();let h='';
    if(ev){const s=evSave(ev);const left=ev.end-jdToday();
      h+=`<div class="sec"><div class="dlEv"><h4 style="margin:0 0 4px">ĐANG DIỄN RA · CÒN ${left+1} NGÀY</h4><h3>${esc(ev.nm)}</h3><p>${esc(ev.ds)}</p>
        <p style="margin-top:6px;color:var(--dim);font-size:12px">Từ ${jdStr(ev.start)} đến ${jdStr(ev.end)}${ev.id!=='quockhanh'?' · chính lễ '+jdStr(ev.day):''}. Quái thường rơi 5%, tinh anh 60%, boss rơi 10 ${esc(ev.tok)}. Điểm danh trong dịp lễ tặng thêm 10.</p>
        <div class="tk">${evIcon(ev.id,20)} ${s.tok} ${esc(ev.tok)}</div></div></div><div class="sec"><h4>ĐỔI QUÀ LỄ HỘI</h4>`;
      for(const it of evShop(ev,L)){const b=s.buy[it.id]||0,own=it.title&&d.et[it.title],can=s.tok>=it.c&&b<it.lim&&!own;
        h+=`<div class="dlCard${can?' ok':''}${b>=it.lim||own?' done':''}"><div><h5>${esc(it.nm)} <small>· còn ${own?0:it.lim-b}/${it.lim} lượt</small></h5><div class="dlRws">${it.title?`<span class="dlRw">${esc(bonTxt(EV_TITLE[it.title].b))}</span>`:rwChips(it.rw)}</div></div>
          <button class="btn ${can?'gold':'sec'} sm" data-evb="${it.id}" ${can?'':'disabled'}>${evIcon(ev.id)} ${it.c}</button></div>`}
      h+='</div>'}
    else h+=`<div class="sec"><div class="dlEv"><h3>Chưa tới mùa lễ hội</h3><p>Lễ hội theo lịch thật (âm lịch Việt Nam): trại được trang hoàng, quái rơi vật phẩm lễ hội để đổi Tàn Quyển, Bùa Bảo Hộ, Rương Thần Khí và danh hiệu riêng.</p></div></div>`;
    h+=`<div class="sec"><h4>SẮP TỚI</h4>${upcoming(4).map(e=>`<div class="dlUp"><b>${evIcon(e.id)} ${esc(e.nm)}</b><span>${jdStr(e.start)} – ${jdStr(e.end)}<br>còn ${e.start-jdToday()} ngày</span></div>`).join('')}</div>`;
    return h},
  off(){const d=D(),L=G.save.lvl,r=offRate(L);const tot=cnt('offl');
    return`<div class="sec"><div class="dlEv"><h3>Bế quan tu luyện</h3><p>Khi bạn rời game, hiệp khách tự bế quan. Lần sau quay lại (sau ít nhất 10 phút), nhận kinh nghiệm, vàng, Chân Khí và Huyền Thiết theo thời gian vắng mặt, tối đa 12 giờ mỗi lần.</p></div></div>
      <div class="sec"><h4>MỖI GIỜ BẾ QUAN Ở CẤP ${L}</h4><div class="dlRws">${rwChips({exp:Math.round(r.exp),gold:Math.round(r.gold),cq:Math.round(r.cq),ore:Math.floor(r.ore)||0})}</div>
      <p class="dlNote">Tối đa 12 giờ: ${rwChips({exp:Math.round(r.exp*12),gold:Math.round(r.gold*12),cq:Math.round(r.cq*12),ore:Math.floor(r.ore*12)})}</p></div>
      <div class="sec"><h4>NHẬT KÝ</h4><p class="hist">Tổng thời gian bế quan: <b>${fmtDur(tot*1000)}</b>${d.lastOff?'<br>Lần xuất quan gần nhất: '+fmtDur(d.lastOff.ms)+' ('+new Date(d.lastOff.t).toLocaleString('vi-VN')+')':''}</p>
      ${d.pend?'<div class="row"><button class="btn gold" id="dlOffNow">Nhận thưởng bế quan đang chờ</button></div>':''}
      <p class="dlNote">Chỉnh lùi đồng hồ máy không tạo thêm thưởng: game nhớ thời điểm muộn nhất đã thấy.</p></div>`},
  bak(){const d=D();return`<div class="sec dlBak"><h4>XUẤT DỮ LIỆU</h4><p class="dlNote" style="margin:0 0 8px">Dữ liệu chỉ lưu trên trình duyệt này. Hãy sao lưu thường xuyên để không mất ${esc(G.save.name)} khi xóa dữ liệu trình duyệt hay đổi máy.${d.bak?' Lần tải tệp gần nhất: '+new Date(d.bak).toLocaleDateString('vi-VN')+'.':''}</p>
      <textarea id="dlExp" readonly aria-label="Mã sao lưu">Đang tạo mã…</textarea>
      <div class="row"><button class="btn gold sm" id="dlCopy">Sao chép mã</button><button class="btn sec sm" id="dlDown">Tải tệp .json</button></div><div class="dlMsg" id="dlExpMsg"></div></div>
      <div class="sec dlBak"><h4>KHÔI PHỤC</h4><textarea id="dlImp" aria-label="Dán mã sao lưu" placeholder="Dán mã DVHK1… vào đây" spellcheck="false" autocomplete="off"></textarea>
      <div class="row"><button class="btn sm" id="dlImpGo">Nhập mã</button><label class="btn sec sm" for="dlFile" style="cursor:pointer">Chọn tệp .json</label><input type="file" id="dlFile" accept=".json,.txt,application/json,text/plain" hidden></div>
      <div class="dlMsg" id="dlImpMsg"></div><p class="dlNote">Khôi phục sẽ thay nhân vật hiện tại. Mã có mã kiểm tra, mã chép thiếu hoặc bị sửa sẽ bị từ chối.</p></div>`},
};
const B={
  day(body){const d=D();
    body.querySelectorAll('[data-dq]').forEach(b=>b.onclick=()=>{const q=d.q[+b.dataset.dq];if(!q||!questDone(q)||q.c)return;q.c=1;d.ap=Math.min(100,d.ap+AP_EACH);const t=giveRw(q.rw,'daily');Audio_.play('coin');UI.toast('+'+AP_EACH+' năng động · '+t,'quest');rerender()});
    body.querySelectorAll('[data-wq]').forEach(b=>b.onclick=()=>{const q=d.wq[+b.dataset.wq];if(!q||!questDone(q)||q.c)return;q.c=1;const t=giveRw(q.rw,'weekly');Audio_.play('coin');UI.toast(t,'quest');rerender()});
    body.querySelectorAll('[data-ch]').forEach(b=>b.onclick=()=>{const i=+b.dataset.ch;if(d.chest[i])return;if(d.ap<CHEST_AT[i]){UI.toast('Cần '+CHEST_AT[i]+' điểm năng động');return}
      d.chest[i]=1;const t=giveRw(chestRw(i,G.save.lvl),'daily_chest');Audio_.play('loot',3);UI.toast('Mở rương: '+t,'quest');rerender()});
    const wc=body.querySelector('#dlWc');if(wc)wc.onclick=()=>{if(d.wc||!d.wq.every(q=>q.c))return;d.wc=1;const t=giveRw(weekChestRw(G.save.lvl),'weekly_chest');Audio_.play('win');UI.toast('Rương tuần: '+t,'quest');rerender()}},
  login(body){const b=body.querySelector('#dlIn');if(b)b.onclick=()=>{const r=checkIn();if(r)UI.toast('Điểm danh Ngày '+r.day+': '+r.txt,'quest');rerender()}},
  ach(body){body.querySelectorAll('[data-ach]').forEach(b=>b.onclick=()=>{const t=claimAch(b.dataset.ach);if(t){Audio_.play('coin');UI.toast(t,'quest')}rerender()});
    const all=body.querySelector('#dlAchAll');if(all)all.onclick=()=>{const d=D();const ts=[];for(const id in d.ach)if(d.ach[id]===1)ts.push(claimAch(id));Audio_.play('win');UI.toast('Đã nhận '+ts.length+' phần thưởng thành tựu','quest');rerender()};
    body.querySelectorAll('[data-title]').forEach(b=>b.onclick=()=>{setTitle(b.dataset.title||null);Audio_.play('ui');rerender()})},
  ev(body){body.querySelectorAll('[data-evb]').forEach(b=>b.onclick=()=>{evBuy(b.dataset.evb);rerender()})},
  off(body){const b=body.querySelector('#dlOffNow');if(b)b.onclick=()=>{UI.close();showOffCard()}},
  bak(body){const ta=body.querySelector('#dlExp'),msg=body.querySelector('#dlExpMsg'),im=body.querySelector('#dlImpMsg');
    exportCode().then(c=>{ta.value=c;ta.dataset.ok=1;msg.className='dlMsg';msg.textContent='Mã dài '+c.length.toLocaleString('vi-VN')+' ký tự.'}).catch(e=>{ta.value='';msg.className='dlMsg bad';msg.textContent='Không tạo được mã: '+e.message});
    body.querySelector('#dlCopy').onclick=async()=>{if(!ta.dataset.ok)return;const ok=await copyText(ta.value);msg.className='dlMsg '+(ok?'good':'bad');msg.textContent=ok?'Đã sao chép. Dán vào Ghi chú hoặc gửi cho chính mình.':'Không sao chép tự động được, hãy chọn và sao chép thủ công.'};
    body.querySelector('#dlDown').onclick=()=>{try{download();msg.className='dlMsg good';msg.textContent='Đã tải tệp sao lưu.'}catch(e){msg.className='dlMsg bad';msg.textContent='Không tải được tệp: '+e.message}};
    const go=txt=>parseCode(txt).then(o=>{im.className='dlMsg good';im.textContent='Mã hợp lệ: '+o.name+' · '+CLASS_BY_ID[o.cls].name+' cấp '+o.lvl;
        UI.confirm(`Khôi phục ${o.name} (${CLASS_BY_ID[o.cls].name} cấp ${o.lvl})? Nhân vật hiện tại (${G.save.name} cấp ${G.save.lvl}) sẽ bị ghi đè.`,()=>applyImport(o))})
      .catch(e=>{im.className='dlMsg bad';im.textContent=e.message});
    body.querySelector('#dlImpGo').onclick=()=>go(body.querySelector('#dlImp').value);
    body.querySelector('#dlFile').onchange=e=>{const f=e.target.files&&e.target.files[0];if(!f)return;if(f.size>5e6){im.className='dlMsg bad';im.textContent='Tệp quá lớn';return}
      f.text().then(go).catch(()=>{im.className='dlMsg bad';im.textContent='Không đọc được tệp'});e.target.value=''}},
};
function rerender(){DV.badgeDirty=1;updBadge();UI.render();saveGame()}
UI.p_daily=function(){roll();if(DV.achDirty)checkAch();const c=counts();const cur=this.tab&&P[this.tab]?this.tab:'day';this.tab=cur;
  this.setTabs(TABS,cur);const tabs=$q('#shTabs');tabs.classList.add('dlTabs');
  tabs.querySelectorAll('.tab').forEach(t=>{const n=c[t.dataset.t];if(n)t.insertAdjacentHTML('beforeend',`<i>${n>9?'9+':n}</i>`)});
  return P[cur]()};
UI.b_daily=function(body){B[this.tab]&&B[this.tab](body)};
const _render=UI.render;UI.render=function(){const t=document.getElementById('shTabs');if(t)t.classList.remove('dlTabs');return _render.apply(this,arguments)};
const _open=UI.open;UI.open=function(k){const r=_open.apply(this,arguments);if(k==='daily'&&this.panel==='daily')$q('#shTitle').textContent='Hoạt động';return r};
const _close=UI.close;UI.close=function(){const r=_close.apply(this,arguments);DV.badgeDirty=1;updBadge();return r};

/* ---------------- BỌC HÀM GAME ---------------- */
const _side=sideEvent;sideEvent=function(t,v){const S=G.save,c0=S&&S.sideChain;const r=_side.apply(this,arguments);
  try{if(t==='gold')bump('gold',v);else if(t==='loot')bump('loot',v);if(S&&S.sideChain>c0)bump('side',S.sideChain-c0)}catch(e){console.error(e)}return r};
const _forge=doForge;doForge=function(it){const e0=it&&it.enh;const r=_forge.apply(this,arguments);try{if(r&&!r.err){bump('forge');if(r.ok){bump('forgeOk');bump('enhMax',it.enh,1)}}}catch(e){console.error(e)}return r};
const _die=die;die=function(){const r=_die.apply(this,arguments);try{bump('death')}catch(e){}return r};
if(typeof openChest==='function'){const _oc=openChest;openChest=function(){const r=_oc.apply(this,arguments);try{bump('chest')}catch(e){}return r}}
if(typeof dropChest==='function'){const _dc=dropChest;dropChest=function(x,y,b,why){const r=_dc.apply(this,arguments);try{const w=String(why||'');if(w.includes('ổ quái'))bump('camp');else if(w.includes('quái triều'))bump('horde')}catch(e){}return r}}
const _cs=completeStep;completeStep=function(){const r=_cs.apply(this,arguments);try{bump('main')}catch(e){}return r};
const _save=saveGame;saveGame=function(){try{if(G.save&&G.save.daily&&G.state!=='title')touchSeen()}catch(e){}return _save.apply(this,arguments)};
const _start=startGame;startGame=function(){ensureDom();const S=G.save;const fresh=S&&!S.daily;const d=D();
  /* đọc mốc lần cuối trước khi startGame lưu lại */
  const seen=d&&d.seen;const r=_start.apply(this,arguments);
  try{const d2=D();if(fresh){d2.seen=now()}else{d2.seen=seen||now();checkOffline()}
    roll(true);DV.drops=[];DV.badge=-1;DV.achDirty=1;updPlate();updBadge();
    if(!loginState().claimed&&d2.login.total>0)setTimeout(()=>{if(G.state==='play'&&!loginState().claimed)UI.toast('Điểm danh hôm nay đang chờ: bấm Hoạt động'+(FINE?' (N)':''),'quest')},1800)}catch(e){console.error(e)}
  return r};

/* ---------------- MÓC SỰ KIỆN ---------------- */
HK.on('kill',e=>{if(!G.save||!G.save.daily)return;bump('kill');if(e.elite)bump('elite');if(e.boss)bump('boss');if(G.combo>=10)bump('combo',G.combo,1);
  const ev=activeEvent();if(!ev)return;const n=e.boss?10:e.elite?(Math.random()<0.6?2:0):(Math.random()<0.05?1:0);
  for(let i=0;i<n;i++){const a=Math.random()*TAU,v=rand(40,120);DV.drops.push({x:e.x,y:e.y,vx:Math.cos(a)*v,vy:Math.sin(a)*v*0.6,z:0,vz:rand(160,240),t:0,ev:ev.id,key:ev.key})}});
HK.on('cast',()=>{if(G.save&&G.save.daily)bump('skill')});
HK.on('lvl',()=>{DV.achDirty=1});
HK.on('tick',dt=>{const S=G.save;if(!S||G.state!=='play')return;const d=D();d.cnt.play=(d.cnt.play||0)+dt;
  if(G.W!==DV.lastW){DV.lastW=G.W;DV.drops=[];DV.deco=null}
  // vật phẩm lễ hội
  if(DV.drops.length){const p=G.p;for(let i=DV.drops.length-1;i>=0;i--){const t=DV.drops[i];t.t+=dt;
    if(t.z>0||t.vz>0){t.vz-=700*dt;t.z+=t.vz*dt;t.x+=t.vx*dt;t.y+=t.vy*dt;if(t.z<=0){t.z=0;t.vz=t.vz<-120?-t.vz*0.35:0;t.vx*=0.5;t.vy*=0.5}}
    if(t.t<0.45)continue;const dd=dist(t.x,t.y,p.x,p.y);
    if(dd<160){const a=Math.atan2(p.y-t.y,p.x-t.x),sp=lerp(520,200,dd/160);t.x+=Math.cos(a)*sp*dt;t.y+=Math.sin(a)*sp*dt}
    if(dd<24){const ev=activeEvent();if(ev&&ev.key===t.key){evSave(ev).tok++;UI.loot('+1 '+ev.tok,ev.id==='giogo'?'#fff2dc':ev.col==='#da251d'?'#ff8a6a':ev.col);Audio_.play('coin');DV.badgeDirty=1}DV.drops.splice(i,1)}
    else if(t.t>90)DV.drops.splice(i,1)}}
  DV.slowT+=dt;if(DV.slowT>=1){DV.slowT=0;roll();
    const tw=S.tower;if(tw&&typeof tw==='object'){const v=+tw.best||0;if(d.twLast==null)d.twLast=v;else if(v>d.twLast){bump('tower',v-d.twLast);d.twLast=v}}
    if(DV.achDirty||(DV.achT+=1)>=30){DV.achT=0;checkAch()}
    if(Math.floor(d.cnt.play)%5===0)touchSeen()}
  DV.badgeT+=dt;if(DV.badgeDirty&&DV.badgeT>0.4){DV.badgeT=0;updBadge()}});

/* ---------------- VẼ: TRANG TRÍ LỄ HỘI, VẬT PHẨM, DANH HIỆU ---------------- */
function star(g,x,y,R,r){g.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?r:R;g.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr)}g.closePath()}
function lantern(g,x,y,s,col,t){const sw=Math.sin(t*1.8+x*0.05)*0.08;g.save();g.translate(x,y);g.rotate(sw);
  g.strokeStyle='#3a2414';g.lineWidth=1;g.beginPath();g.moveTo(0,-4*s);g.lineTo(0,0);g.stroke();
  g.fillStyle=col;g.beginPath();g.ellipse(0,7*s,6*s,7*s,0,0,TAU);g.fill();g.fillStyle='rgba(255,230,150,.35)';g.beginPath();g.ellipse(-1.5*s,6*s,2.2*s,5*s,0,0,TAU);g.fill();
  g.fillStyle='#e2b24a';g.fillRect(-3.5*s,-0.5*s,7*s,2*s);g.fillRect(-3.5*s,13*s,7*s,2*s);g.strokeStyle='#ffd23a';g.beginPath();g.moveTo(0,15*s);g.lineTo(0,21*s);g.stroke();g.restore()}
function starLantern(g,x,y,s,t){const sw=Math.sin(t*1.5+x*0.03)*0.12;g.save();g.translate(x,y);g.rotate(sw);
  g.strokeStyle='#6a4426';g.lineWidth=1.4*s;g.beginPath();g.moveTo(0,0);g.lineTo(0,-16*s);g.stroke();
  g.fillStyle='#ff3a24';star(g,0,10*s,10*s,4.2*s);g.fill();g.strokeStyle='#ffd23a';g.lineWidth=1.2;g.stroke();
  g.fillStyle='rgba(255,240,180,.55)';star(g,0,10*s,4*s,1.8*s);g.fill();
  g.strokeStyle='#ffd23a';g.beginPath();g.moveTo(-3*s,19*s);g.lineTo(-4*s,25*s);g.moveTo(3*s,19*s);g.lineTo(4*s,25*s);g.stroke();g.restore()}
function flag(g,x,y,s,t,vn){g.fillStyle='#5a3a20';g.fillRect(x-1.2*s,y-46*s,2.4*s,46*s);g.fillStyle='#e2b24a';g.beginPath();g.arc(x,y-47*s,2.4*s,0,TAU);g.fill();
  const w=22*s,h=15*s,x0=x+1*s,y0=y-45*s;g.fillStyle=vn?'#da251d':['#d8392a','#2f7ad8','#3a9a3a','#e2b24a','#f3e9d4'][Math.floor(x)%5];
  g.beginPath();g.moveTo(x0,y0);for(let i=0;i<=6;i++){const k=i/6;g.lineTo(x0+w*k,y0+Math.sin(t*4+k*3+x)*2*s*k)}for(let i=6;i>=0;i--){const k=i/6;g.lineTo(x0+w*k,y0+h+Math.sin(t*4+k*3+x)*2*s*k)}g.closePath();g.fill();
  if(vn){g.fillStyle='#ffde00';star(g,x0+w*0.5,y0+h*0.5+Math.sin(t*4+1.5+x)*s,5*s,2*s);g.fill()}}
function blossomTree(g,x,y,s,col,seed){g.fillStyle='#7a3a1a';g.beginPath();g.moveTo(x-9*s,y);g.lineTo(x+9*s,y);g.lineTo(x+7*s,y-10*s);g.lineTo(x-7*s,y-10*s);g.closePath();g.fill();
  g.fillStyle='#e2b24a';g.fillRect(x-8*s,y-10*s,16*s,2*s);
  g.strokeStyle='#4a2a14';g.lineWidth=2.2*s;g.lineCap='round';g.beginPath();g.moveTo(x,y-10*s);g.lineTo(x-2*s,y-26*s);g.lineTo(x-10*s,y-36*s);g.moveTo(x-2*s,y-26*s);g.lineTo(x+8*s,y-38*s);g.moveTo(x-1*s,y-20*s);g.lineTo(x+11*s,y-25*s);g.stroke();
  g.fillStyle=col;for(let i=0;i<22;i++){const a=hash2(i,seed,3)*TAU,r=hash2(i,seed,7)*14*s;const cx_=x+[-10,8,11,-2][i%4]*s+Math.cos(a)*r*0.7,cy_=y-[36,38,25,28][i%4]*s+Math.sin(a)*r*0.5;g.beginPath();g.arc(cx_,cy_,2.1*s,0,TAU);g.fill()}
  g.fillStyle='#fff6d0';for(let i=0;i<6;i++){g.beginPath();g.arc(x+(hash2(i,seed,9)-0.5)*26*s,y-(22+hash2(i,seed,11)*18)*s,0.9*s,0,TAU);g.fill()}}
function bunting(g,x1,y1,x2,y2,cols,t){const n=Math.max(3,Math.floor(Math.hypot(x2-x1,y2-y1)/16)),sag=14;
  g.strokeStyle='rgba(60,30,10,.8)';g.lineWidth=1;g.beginPath();g.moveTo(x1,y1);g.quadraticCurveTo((x1+x2)/2,(y1+y2)/2+sag*2,x2,y2);g.stroke();
  for(let i=1;i<n;i++){const k=i/n,x=lerp(x1,x2,k),y=lerp(y1,y2,k)+sag*4*k*(1-k);g.fillStyle=cols[i%cols.length];g.beginPath();g.moveTo(x-5,y);g.lineTo(x+5,y);g.lineTo(x+Math.sin(t*3+i)*1.5,y+11);g.closePath();g.fill()}}
function decoLayout(W){const L=W.lights||[];const o={str:[],pond:[],gate:[]};
  for(let i=0;i<L.length;i++){const l=L[i];if(l.forge)continue;
    if(l.col==='#ff8a3a'&&L[i+1]&&L[i+1].col==='#ff8a3a'&&Math.abs(L[i+1].y-l.y)<2){o.str.push([l.x,l.y-4,L[i+1].x,L[i+1].y-4]);i++}
    else if(l.col==='#ffd27a')o.pond.push([l.x,l.y+34]);else if(l.col==='#ff5a3a')o.gate.push([l.x,l.y])}
  return o}
function drawDeco(ev,left,top,vw,vh){const W=G.W;if(!W||!W.lights)return;if(!DV.deco||DV.deco.w!==W){DV.deco={w:W,L:decoLayout(W)}}const L=DV.deco.L,g=cx,t=G.t;
  const inV=(x,y,m)=>x>left-m&&x<left+vw+m&&y>top-m&&y<top+vh+m+60;g.save();
  for(const[x1,y1,x2,y2]of L.str){if(!inV((x1+x2)/2,y1,Math.abs(x2-x1)/2+40))continue;
    if(ev==='tet'){g.strokeStyle='rgba(60,30,10,.8)';g.lineWidth=1;g.beginPath();g.moveTo(x1,y1);g.quadraticCurveTo((x1+x2)/2,y1+24,x2,y2);g.stroke();
      const n=Math.max(2,Math.floor((x2-x1)/38));for(let i=1;i<n;i++){const k=i/n;lantern(g,lerp(x1,x2,k),y1+24*2*k*(1-k)*1.0,1,'#d8261a',t)}}
    else if(ev==='trungthu'){const n=Math.max(2,Math.floor((x2-x1)/46));g.strokeStyle='rgba(60,30,10,.7)';g.lineWidth=1;g.beginPath();g.moveTo(x1,y1);g.quadraticCurveTo((x1+x2)/2,y1+20,x2,y2);g.stroke();
      for(let i=1;i<n;i++){const k=i/n;const x=lerp(x1,x2,k),y=y1+20*2*k*(1-k);if(i%2){g.save();g.translate(x,y+16);g.scale(0.7,0.7);starLantern(g,0,0,1,t);g.restore()}else lantern(g,x,y,0.9,i%4?'#ffb52e':'#7fd0ff',t)}}
    else if(ev==='giogo')bunting(g,x1,y1,x2,y2,['#d8392a','#2f7ad8','#3a9a3a','#e2b24a','#f3e9d4'],t);
    else bunting(g,x1,y1,x2,y2,['#da251d','#ffde00'],t)}
  L.pond.forEach(([x,y],i)=>{if(!inV(x,y,80))return;
    if(ev==='tet')blossomTree(g,x+24,y+4,1,i%2?'#ffd23a':'#ff8fb0',i+1);
    else if(ev==='trungthu'){g.strokeStyle='#6a4426';g.lineWidth=2;g.beginPath();g.moveTo(x+22,y+4);g.lineTo(x+22,y-30);g.stroke();starLantern(g,x+22,y-24,1.15,t)}
    else flag(g,x+22,y+4,1,t,ev==='quockhanh')});
  for(const[x,y]of L.gate){if(!inV(x,y,60))continue;
    if(ev==='tet')lantern(g,x,y+4,1.7,'#d8261a',t);else if(ev==='trungthu')starLantern(g,x,y+16,1.3,t);else flag(g,x,y+60,1.1,t,ev==='quockhanh'||ev==='giogo')}
  g.restore()}
function drawTok(t){const g=cx,y=t.y-t.z-8+Math.sin(G.t*4+t.x)*2;g.save();
  g.globalCompositeOperation='lighter';const gr=g.createRadialGradient(t.x,y,0,t.x,y,18);gr.addColorStop(0,'rgba(255,220,120,.55)');gr.addColorStop(1,'rgba(255,200,80,0)');g.fillStyle=gr;g.beginPath();g.arc(t.x,y,18,0,TAU);g.fill();g.globalCompositeOperation='source-over';
  g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.ellipse(t.x,t.y,8,3,0,0,TAU);g.fill();
  if(t.ev==='tet'){g.fillStyle='#3f8a2e';g.fillRect(t.x-7,y-7,14,14);g.strokeStyle='#d8392a';g.lineWidth=1.6;g.beginPath();g.moveTo(t.x-7,y);g.lineTo(t.x+7,y);g.moveTo(t.x,y-7);g.lineTo(t.x,y+7);g.stroke()}
  else if(t.ev==='giogo'){g.fillStyle='#f4eedc';g.beginPath();g.ellipse(t.x,y,8,6,0,0,TAU);g.fill();g.fillStyle='#c9a24e';g.beginPath();g.arc(t.x,y-1,1.6,0,TAU);g.fill()}
  else if(t.ev==='trungthu'){g.fillStyle='#ff3a24';star(g,t.x,y,8,3.4);g.fill();g.strokeStyle='#ffd23a';g.lineWidth=1;g.stroke()}
  else{g.fillStyle='#da251d';g.fillRect(t.x-8,y-5.5,16,11);g.fillStyle='#ffde00';star(g,t.x,y,4,1.6);g.fill()}
  g.restore()}
HK.on('drawWorld',(left,top,vw,vh)=>{if(!G.save||!G.save.daily||(G.state!=='play'&&G.state!=='dead'))return;
  const ev=activeEvent();if(ev)drawDeco(ev.id,left,top,vw,vh);
  for(const t of DV.drops)drawTok(t);
  const tl=curTitle(),p=G.p;if(tl&&p&&G.state==='play'){const y=p.y-(G.save.riding?118:96);cx.save();cx.font='700 11px "Be Vietnam Pro",system-ui,sans-serif';cx.textAlign='center';cx.textBaseline='middle';
    const w=cx.measureText(tl.nm).width+14;cx.fillStyle='rgba(106,26,16,.82)';cx.beginPath();cx.roundRect(p.x-w/2,y-8,w,16,8);cx.fill();cx.strokeStyle='rgba(255,217,138,.8)';cx.lineWidth=1;cx.stroke();
    cx.fillStyle='#ffe7b0';cx.fillText(tl.nm,p.x,y+0.5);cx.restore()}});

/* ---------------- PHÍM TẮT, VÒNG ĐỜI TRANG ---------------- */
window.addEventListener('keydown',e=>{const tg=e.target&&e.target.tagName;if(tg==='TEXTAREA'&&e.code!=='Escape'){e.stopImmediatePropagation();return}},true);
window.addEventListener('keydown',e=>{const tg=e.target&&e.target.tagName;if(tg==='INPUT'||tg==='TEXTAREA')return;if(e.code!=='KeyN'||e.repeat||G.state!=='play')return;
  if(!$q('#story').hidden||!$q('#clear').hidden||!$q('#confirm').hidden)return;const off=$q('#dlyOff');if(off&&!off.hidden)return;
  if(UI.panel==='daily')UI.close();else UI.open('daily')});
document.addEventListener('visibilitychange',()=>{try{if(!G.save||!G.save.daily||G.state==='title')return;if(document.hidden){touchSeen();return}
  checkOffline();DV.badgeDirty=1}catch(e){console.error(e)}});

/* ---------------- MÓC THỬ NGHIỆM ---------------- */
window.DAILY={
  state:()=>D(),roll,bump,checkAch,counts,checkIn,claimAch,activeEvent,upcoming,eventsAround,lunarToDate:(d,m,y)=>jdStr(lunarToJd(d,m,y)),
  exportCode,parseCode,applyImport,fileJson,crc32,titles:titleList,setTitle,ACH,QD,offCalc,
  dev:{shift(ms){DV.off+=ms;roll();DV.badgeDirty=1},setOffset(ms){DV.off=ms;roll()},forceEvent(id){DV.force=id&&EVD[id]?id:null;DV.badgeDirty=1},
    now,away(ms){const d=D();d.seen=now()-ms;d.pend=null;checkOffline()},drops:()=>DV.drops,_DV:DV},
};
})();

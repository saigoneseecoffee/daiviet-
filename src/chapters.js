/* ============ CHAPTERS: chiến dịch 12 chương theo dòng lịch sử ============
   Mô-đun độc lập, chỉ bọc hàm toàn cục và dùng điểm nối HK (không sửa game.js / ui.js).
   - Chuyển đổi lưu cũ (6 chương, ver 1) sang 12 chương: chỉ số chương, nhiệm vụ, chương đã mở / đã qua, cấp nhân vật và cấp đồ.
   - Tiến trình 12 chương: số bước nhiệm vụ theo từng chương, mở chương kế, màn qua chương, Luân Hồi sau chương 12, thú cưỡi thưởng.
   - Cân bằng cấp: dải cấp mới tới 126 nhưng độ khó tương đương bản cũ (máu/công quái chuẩn hóa theo cấp).
   - Môi trường mới: lá rơi (Mê Linh), mây trôi (Hoa Lư), tàn lửa (Như Nguyệt).
   Bọc: loadSave, newSave, startGame, bossDefeated, questTarget, gainExp, UI.renderTracker, UI.chapterClear. Móc: spawn, drawWorld. */
(function(){
const CH=window.CH={};
const NCH=MAPS.length,LAST=NCH-1;
/* Thêm 4 bước nhiệm vụ trước trận boss cho mỗi chương (tổng 10 bước): lúc nào cũng có mục tiêu khi luyện cấp chờ mở đấu trường. */
MAPS.forEach((M,mi)=>{if(M.quest.length!==6||M._x)return;M._x=1;const en=M.enemies.map(e=>e[0]).filter(k=>ET[k]&&ET[k].body!=='boss');const a=en[0],b=en[1]||a,c=en[2]||b;
  const nm=k=>ET[k].name,n=14+mi*2;
  M.quest.splice(5,0,
    {t:'kill',e:a,n:n,txt:'Truy quét tàn quân '+nm(a)},
    {t:'elite',n:3+Math.floor(mi/3),txt:'Hạ tinh anh canh giữ đường vào đấu trường'},
    {t:'collect',e:c,n:4+Math.floor(mi/4),item:'Mật Thư',txt:'Thu Mật Thư từ '+nm(c)},
    {t:'kill',e:b,n:n+4,txt:'Phá vòng vây '+nm(b)})});
const nSteps=mi=>MAPS[mi].quest.length;
/* Boss dày máu hơn để đủ thời gian cho ba giai đoạn khi người chơi đã có bí kíp, đồ huyền thoại, Cảnh Giới (trận ~1 phút với bot). */
CH.BOSS_HP=mi=>mi===0?1.6:2.6;CH.BOSS_ATK=mi=>mi===0?1:1.3;
HK.on('spawn',e=>{if(!e||!e.boss||e.chB||(window.VT&&VT.on))return;e.chB=1;const mi=G.save?G.save.map:0;e.max=e.hp=Math.round(e.max*CH.BOSS_HP(mi));e.atk*=CH.BOSS_ATK(mi)});
CH.NCH=NCH;

/* ================= CÂN BẰNG CẤP =================
   Quái cấp L có máu/công như quái cấp tương đương gEq(L) của bản 6 chương (tới cấp 16 giữ nguyên),
   nhân thêm theo sức mạnh người chơi (gần như tuyến tính theo cấp). Chương 12 (cấp 113–126) ≈ cấp 35–38 bản cũ. */
const gEq=L=>L<=16?L:16+(L-16)*0.2;
const hpB=l=>(26+12*l)*Math.pow(1.06,l),atkB=l=>(7+3.9*l)*Math.pow(1.05,l),pw=L=>3+L;
const hpN=L=>{const g=gEq(L);return hpB(g)*pw(L)/pw(g)/hpB(L)},atkN=L=>{const g=gEq(L);return atkB(g)*pw(L)/pw(g)/atkB(L)};
CH.gEq=gEq;CH.hpN=hpN;CH.atkN=atkN;
/* Khi có prog.js (đường cong quái và kinh nghiệm riêng) thì tắt cân bằng của chương để không nhân hai lần. */
CH.NORM=!window.PROG;
HK.on('spawn',e=>{if(!CH.NORM||!e||e.lv<=16||e.chN)return;e.chN=1;e.max=Math.max(1,Math.round(e.max*hpN(e.lv)));e.hp=e.max;e.atk*=atkN(e.lv)});

/* kinh nghiệm: số quái cần hạ mỗi cấp tăng chậm hơn khi cấp vượt 36 (dải cấp mới dài gấp ba) */
CH.XP_CATCHUP=!window.PROG;
const kpl=L=>(40+30*Math.pow(L,1.7))/(4.2+2.3*L);
const xpMul=L=>L<=36?1:Math.pow(kpl(L)/kpl(36),0.6);CH.xpMul=xpMul;
const _gainExp=gainExp;
gainExp=function(x){const S=G.save;if(CH.XP_CATCHUP&&S&&x>0)x*=xpMul(S.lvl);return _gainExp(x)};

/* ================= CHUYỂN ĐỔI LƯU CŨ =================
   Bản 6 chương: 0 Phong Châu, 1 Cổ Loa, 2 Bạch Đằng, 3 Tây Kết, 4 Chi Lăng, 5 Đống Đa; 4 bước nhiệm vụ (bước 4 = xong).
   Bản 12 chương: các chương cũ nằm ở 0, 1, 4, 7, 9, 11; 6 bước nhiệm vụ (bước 6 = xong). */
const OLD2NEW=[0,1,4,7,9,11];
const STEP_O2N=[0,1,3,5,6]; // giết, thu thập, tinh anh, boss, xong -> cùng loại bước ở bản mới
CH.OLD2NEW=OLD2NEW;CH.STEP_O2N=STEP_O2N;
/* cấp cũ -> cấp mới: mỗi dải cấp của chương cũ ánh xạ vào dải cấp mới của chính chương đó */
const OLD_LO=[1,7,13,19,25,31],NEW_BAND=[[1,8],[8,16],[34,44],[65,76],[88,100],[113,126]];
function lvMap(l){l=Math.max(1,l|0);if(l>=37)return Math.round(126+(l-37)*2.2);const k=clamp(Math.floor((l-1)/6),0,5),[a,b]=NEW_BAND[k];return Math.max(1,Math.round(a+(l-OLD_LO[k])*(b-a)/6))}
CH.lvMap=lvMap;
const SLOT_F={vk:{atk:[6,3.3]},mu:{def:[2,1],hp:[8,5]},ao:{def:[4,1.8],hp:[16,8]},dai:{hp:[14,8],atk:[1,0.6]},giay:{def:[1,0.7],spd:[4,0.08]},boi:{mp:[10,3],crit:[2,0.08]}};
function rescaleItem(it){if(!it||!it.ilvl||!it.st)return;const L0=it.ilvl,L1=lvMap(L0);if(L1<=L0)return;const f=SLOT_F[it.slot]||{};
  for(const k in it.st){const ab=f[k];if(!ab)continue;const v=it.st[k]*(ab[0]+ab[1]*L1)/(ab[0]+ab[1]*L0);it.st[k]=k==='crit'?Math.round(v*10)/10:Math.round(v)}
  if(Array.isArray(it.aff))it.aff=it.aff.map(([k,v])=>{const A=AFFIX[k];if(!A)return[k,v];let nv=v*A.roll(L1)/A.roll(L0);if(AFFIX_CAP[k])nv=Math.min(nv,Math.max(v,AFFIX_CAP[k]));return[k,A.u==='%'?Math.round(nv*10)/10:Math.round(nv)]});
  it.ilvl=L1}
CH.rescaleItem=rescaleItem;
function migrate(S){
  if(!S||typeof S!=='object')return S;
  if(S.chv>=2){fixShape(S);return S}
  const oq=Array.isArray(S.qs)?S.qs.slice(0,6):[];
  const qs=new Array(NCH).fill(0);
  oq.forEach((v,i)=>{const L=MAPS[OLD2NEW[i]].quest.length;qs[OLD2NEW[i]]=[0,1,3,L-1,L][clamp(v|0,0,4)]});
  const om=clamp(S.map|0,0,5),nm=OLD2NEW[om];
  // tiến độ bước đang làm: giữ lại vì bước mới cùng loại, cùng mục tiêu
  const st=MAPS[nm].quest[qs[nm]];S.qp=st&&st.n?Math.min(S.qp|0,st.n-1):0;
  S.qs=qs;S.map=nm;
  S.cleared=[...new Set((Array.isArray(S.cleared)?S.cleared:[]).map(i=>OLD2NEW[i]).filter(i=>i!=null))].sort((a,b)=>a-b);
  // các chương mới chèn vào trước chương xa nhất đã mở đều được mở
  const u=clamp(S.unlocked|0,1,6);S.unlocked=Math.min(NCH,OLD2NEW[u-1]+1);
  if(S.b2qt&&typeof S.b2qt==='object'){const o={};for(const k in S.b2qt){const ni=OLD2NEW[+k];if(ni!=null)o[ni]=S.b2qt[k]}S.b2qt=o}
  // cấp nhân vật và cấp đồ theo dải cấp mới
  const L0=Math.max(1,S.lvl|0),L1=lvMap(L0);
  if(L1>L0){const fr=clamp((S.exp||0)/need(L0),0,0.99);S.lvl=L1;S.exp=Math.floor(fr*need(L1));
    const used=(S.skl||[]).reduce((a,b)=>a+(b|0),0);S.sp=(S.sp|0)+Math.max(0,Math.min(L1-L0,30-used-(S.sp|0)));
    if(S.perks&&typeof S.perks==='object')S.perks.pend=(S.perks.pend|0)+Math.min(12,L1-L0)}
  if(S.equip)for(const sl in S.equip)rescaleItem(S.equip[sl]);
  if(Array.isArray(S.bag))S.bag.forEach(rescaleItem);
  S.chMig={from:1,lv:[L0,L1],map:[om,nm]};S.chv=2;fixShape(S);return S}
function fixShape(S){if(!Array.isArray(S.qs))S.qs=[];while(S.qs.length<NCH)S.qs.push(0);if(S.qs.length>NCH)S.qs.length=NCH;
  for(let i=0;i<NCH;i++)S.qs[i]=clamp(S.qs[i]|0,0,nSteps(i));
  S.map=clamp(S.map|0,0,LAST);S.unlocked=clamp(Math.max(S.unlocked|0,S.map+1),1,NCH);if(!Array.isArray(S.cleared))S.cleared=[]}
CH.migrate=migrate;
const _loadSave=loadSave;
loadSave=function(){const s=_loadSave();try{if(s)migrate(s)}catch(err){console.error(err)}return s};
const _newSave=newSave;
newSave=function(cls,name){const s=_newSave(cls,name);s.qs=new Array(NCH).fill(0);s.chv=2;return s};
const _startGame=startGame;
startGame=function(){try{if(G.save)migrate(G.save)}catch(err){console.error(err)}return _startGame.apply(this,arguments)};

/* ================= TIẾN TRÌNH 12 CHƯƠNG ================= */
/* thú cưỡi thưởng khi hạ boss (chương 1 đã có Ngựa Ô ở game.js) */
MOUNTS.push({id:'tia',name:'Ngựa Tía Tây Sơn',body:'horse',c:{coat:'#8a3a22',dark:'#4a1a10',mane:'#1a0e08',blaze:'#f2e8d6',tack:'#c9a24e',trim:'#ffd36b'},spd:42,bon:{atkp:12,hpp:10},price:180000,lv:100,d:'Chiến mã đỏ tía của nghĩa quân Tây Sơn. Tặng khi đại phá quân Thanh ở Đống Đa.'});
MOUNT_BY.tia=MOUNTS[MOUNTS.length-1];
const MOUNT_REWARD={2:'voi',5:'bach',8:'ho',11:'tia'};CH.MOUNT_REWARD=MOUNT_REWARD;
const _bossDefeated=bossDefeated;
bossDefeated=function(e){const S=G.save,mi=S.map,B=MAPS[mi];
  _bossDefeated(e);
  S.qs[mi]=nSteps(mi);S.qp=0;S.unlocked=Math.max(S.unlocked,Math.min(NCH,mi+2));
  const mr=MOUNT_REWARD[mi];if(mr&&MOUNT_BY[mr])setTimeout(()=>{if(!G.save)return;if(!giveMount(mr,'Phần thưởng hạ '+ET[B.boss].name+': ')){ensureMountSave();G.save.frag+=2;UI.toast('Đã có '+MOUNT_BY[mr].name+': nhận 2 Mảnh Ngựa Sắt','quest')}},1800);
  saveGame()};
const _questTarget=questTarget;
questTarget=function(){const q=_questTarget();try{const S=G.save,st=curMap().quest[S.qs[S.map]];if(q&&st&&st.t==='boss')q.label=st.txt}catch(err){}return q};
/* bảng theo dõi nhiệm vụ: x/6 thay cho x/4, gợi ý chương kế */
const _rt=UI.renderTracker;
UI.renderTracker=function(){const r=_rt.apply(this,arguments);try{const S=G.save,M=curMap(),si=S.qs[S.map],st=M.quest[si],q=document.getElementById('qt');
  const h=q&&q.querySelector('.qh');if(h&&st)h.textContent=`${M.name.toUpperCase()} · NHIỆM VỤ ${si+1}/${M.quest.length}`;
  if(q&&!st){const m=q.querySelector('.qm');if(m)m.textContent=S.map<LAST?'Gặp Xa Phu ở trại để tới '+MAPS[S.map+1].name:'Luân Hồi để thử thách cao hơn'}}catch(err){console.error(err)}return r};
/* màn qua chương: chương 12 là chương cuối, Luân Hồi sau đó */
UI.chapterClear=function(mi,r){
  const S=G.save,last=mi===LAST,next=MAPS[mi+1];G.paused=true;const mr=MOUNT_REWARD[mi]&&MOUNT_BY[MOUNT_REWARD[mi]];
  $('#clearPaper').innerHTML=`<div class="stamp">Đại<br>Thắng</div><div class="era">CHƯƠNG ${mi+1}/${NCH} · ${esc(MAPS[mi].era.toUpperCase())}</div><h3>${esc(MAPS[mi].name)}</h3>
    <p>${esc(ET[MAPS[mi].boss].name)} đã bị đánh bại.${last?' Đại Việt sạch bóng quân thù. Bạn có thể Luân Hồi: quái mạnh hơn 30 cấp, điểm thưởng tăng, giữ nguyên cấp và trang bị.':' Con đường tới '+esc(next.name)+' ('+esc(next.era)+') đã mở.'}</p>
    <div class="rewards"><div>${ICO_GOLD} +${fmtFull(r.gold)} vàng</div><div>${ICO_ORE} +${r.ore} Huyền Thiết, +1 Bùa Bảo Hộ</div>${mr?`<div>Thú cưỡi: ${esc(mr.name)}</div>`:''}<div class="ihead" style="justify-content:center"><span class="iframe sm" style="--rc:${RARITY[r.item.rar].color}">${itemImg(r.item)}</span><span class="loot" style="color:${RARITY[r.item.rar].color}">${esc(itemName(r.item))}</span></div><div>Điểm: ${fmtFull(S.score)}</div></div>
    <div class="row" style="justify-content:center">${last?'<button class="btn" id="clNg">Luân Hồi</button>':'<button class="btn" id="clNext">Tới '+esc(next.name)+'</button>'}<button class="btn sec" id="clStay">Ở lại luyện công</button></div>`;
  $('#clear').hidden=false;anim&&anim.fromTo('#clearPaper',{y:40,rotation:-2,autoAlpha:0},{y:0,rotation:0,autoAlpha:1,duration:.6,ease:'back.out(1.4)'});
  const close=()=>{$('#clear').hidden=true;G.paused=false};
  $('#clStay').onclick=close;
  if(last)$('#clNg').onclick=()=>{close();S.ng++;S.qs=new Array(NCH).fill(0);S.qp=0;S.cleared=[];travel(0,true)};
  else $('#clNext').onclick=()=>{close();travel(mi+1,true)};
  postApp({type:'chapterClear',map:mi});
};

/* ================= MÔI TRƯỜNG MỚI ================= */
const AMB=[];let ambLast=0,ambKind=null,cloudC=null;
function cloudSprite(){if(cloudC)return cloudC;const c=cloudC=document.createElement('canvas');c.width=256;c.height=128;const g=c.getContext('2d');
  for(let i=0;i<6;i++){const x=50+i*30+Math.sin(i*2)*10,y=64+Math.cos(i*1.7)*14,r=34+((i*13)%17);const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,'rgba(20,30,30,0.16)');gr.addColorStop(1,'rgba(20,30,30,0)');g.fillStyle=gr;g.beginPath();g.arc(x,y,r,0,TAU);g.fill()}return c}
HK.on('drawWorld',(left,top,vw,vh)=>{const W=G.W;if(!W)return;const k=W.M.amb;if(k!=='leaf'&&k!=='cloud'&&k!=='ember'){AMB.length=0;return}
  const now=G.t,dt=Math.min(0.05,Math.max(0,now-ambLast));ambLast=now;if(ambKind!==k){AMB.length=0;ambKind=k}
  const want=k==='cloud'?5:k==='leaf'?26:36;
  while(AMB.length<want)AMB.push({x:left+Math.random()*vw,y:top+Math.random()*vh,s:Math.random(),ph:Math.random()*TAU});
  cx.save();
  for(const a of AMB){
    const pad=k==='cloud'?260:60;if(a.x<left-pad)a.x+=vw+pad*2-20;if(a.x>left+vw+pad)a.x-=vw+pad*2-20;if(a.y<top-pad)a.y+=vh+pad*2-20;if(a.y>top+vh+pad)a.y-=vh+pad*2-20;
    if(k==='leaf'){a.ph+=dt*(1.5+a.s);a.y+=(26+a.s*22)*dt;a.x+=Math.sin(a.ph)*26*dt+12*dt;cx.save();cx.translate(a.x,a.y);cx.rotate(a.ph);cx.fillStyle=a.s>0.6?'#d8a032':a.s>0.3?'#b8862a':'#8aa040';cx.beginPath();cx.ellipse(0,0,5,2.4,0,0,TAU);cx.fill();cx.restore()}
    else if(k==='cloud'){a.x+=(14+a.s*8)*dt;a.y+=4*dt;cx.drawImage(cloudSprite(),a.x-256*(1+a.s),a.y-128*(1+a.s),512*(1+a.s),256*(1+a.s))}
    else{a.ph+=dt*3;a.y-=(30+a.s*40)*dt;a.x+=Math.sin(a.ph)*14*dt;const al=0.35+Math.sin(a.ph*2)*0.3;cx.fillStyle=a.s>0.5?`rgba(255,170,70,${al})`:`rgba(255,110,40,${al})`;cx.beginPath();cx.arc(a.x,a.y,1.3+a.s*1.6,0,TAU);cx.fill()}
  }
  cx.restore()});
})();

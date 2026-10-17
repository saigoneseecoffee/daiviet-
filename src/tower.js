/* ============ VƯỢT THÁP (tower.js) ============
   Tháp vô tận: hoạt động lặp lại cuối game, nguồn Chân Khí (cq), Tàn Quyển (tq), vàng, Huyền Thiết, Bùa Bảo Hộ.
   - NPC "Tháp Chủ" đứng trước Bảo Tháp trong thành (act 'tower'). Mở sau khi hạ boss chương 1 hoặc đạt cấp 8.
   - Mỗi tầng là một sàn đá tròn riêng (thế giới nhỏ dùng chung hệ ô/khối với renderer). Khi vào tháp, G.W được đổi,
     khi ra (thắng/thua/bỏ cuộc/đi chương khác/về tiêu đề) mọi thứ của chương được trả lại nguyên vẹn.
   - Tầng N: quái cấp 9+1,25N (không giới hạn), lấy từ mọi chương. Tầng chia hết cho 5: Thủ Lĩnh tinh anh nhiều hậu tố.
     Tầng chia hết cho 10: Ảo Ảnh boss (boss2 ba giai đoạn). Mỗi tầng có giới hạn giờ và có thể có biến thể (Sương Mù, Hỏa Ngục...).
     Biến thể và loại quái được gieo theo (tầng, tuần) nên xem trước khớp với trận thật và đổi mỗi tuần.
   - Thắng = hạ hết quái. Chết hoặc hết giờ = thua tầng (không mất vàng), về lại Bảo Tháp.
   - Lưu: G.save.tower {best,cur,records,sweepDay,sweeps,runs,wins,fails,lastT,bestT}; kỷ lục theo phái: localStorage 'dvhk_tower_rec'.
   Ghi đè (bọc hàm gốc): townNpcs, drawTerrain, drawArena, questTarget, trySpawnPack, spawnElite, startBoss, bossDefeated,
     questEvent, dropAt, updateHorde, respawn, travel, showTitle, UI.open, UI.npcPrompt, UI.dead, UI.renderTracker, UI.b_map.
   Gỡ lỗi / kiểm thử: window.VT (enter, next, leave, sweep, plan, rewardsFor, sweepRew, lvAt). */
(function(){
const VT=window.VT={on:false,P:null,ph:null,t:0,left:0,wave:0,waveT:0,last:null};
const REC_KEY='dvhk_tower_rec';
const BAN_TIERS=['Ngọc Lâu','Son Lâu','Lam Lâu','Tử Lâu','Kim Lâu','Huyết Lâu'];
const TIERC=[
  {s:'#7a877a',s2:'#4e5a50',g:'#36403a',rim:'#8f8a7c',rim2:'#4a463e',a:'#8fe0b0',ab:'#0e1512',tint:'rgba(140,230,180,0.05)'},
  {s:'#86685a',s2:'#563c32',g:'#3e2a22',rim:'#9a7a5a',rim2:'#4e3424',a:'#ff8a5a',ab:'#170c09',tint:'rgba(255,140,90,0.06)'},
  {s:'#6c788a',s2:'#424c5e',g:'#2e3644',rim:'#8a92a0',rim2:'#3a404c',a:'#8ab8ff',ab:'#0a0e16',tint:'rgba(140,180,255,0.06)'},
  {s:'#786a86',s2:'#4a405a',g:'#342c40',rim:'#968aa2',rim2:'#40364c',a:'#c58bff',ab:'#100b16',tint:'rgba(200,140,255,0.06)'},
  {s:'#8e7c5c',s2:'#5c4f38',g:'#40362a',rim:'#b09a6a',rim2:'#54462e',a:'#ffd36a',ab:'#130f08',tint:'rgba(255,215,120,0.06)'},
  {s:'#7a5052',s2:'#4a2c2e',g:'#361e20',rim:'#9a6a6a',rim2:'#4a2a2a',a:'#ff5a5a',ab:'#160809',tint:'rgba(255,90,90,0.07)'}];
const MODS={
  suongmu:{n:'Sương Mù',d:'Tầm nhìn chỉ còn quanh người.',c:'#c4d0d8',r:1.15},
  hoanguc:{n:'Hỏa Ngục',d:'Lửa phun từ sàn đá. Tránh vòng đỏ.',c:'#ff7a3a',r:1.2},
  cuongphong:{n:'Cuồng Phong',d:'Quái chạy nhanh hơn 35%, ra đòn dồn dập hơn.',c:'#9fe0c8',r:1.15},
  linhkhi:{n:'Linh Khí',d:'Chân Khí nhận được gấp đôi. Quái thêm 15% máu.',c:'#8ab8ff',r:1,cq:2},
  thietbich:{n:'Thiết Bích',d:'Quái mặc giáp: thủ cao, thêm 20% máu.',c:'#d8d0bc',r:1.2},
  huyetnguyet:{n:'Huyết Nguyệt',d:'Quái thêm 25% công. Vàng nhận gấp rưỡi.',c:'#ff5a6a',r:1.15},
  baothi:{n:'Bạo Thi',d:'Quái chết phát nổ sau một giây.',c:'#ffb347',r:1.15}};
const MOD_IDS=Object.keys(MODS);

/* ---------------- lưu ---------------- */
function TS(){const S=G.save;if(!S)return null;
  if(!S.tower||typeof S.tower!=='object')S.tower={};const t=S.tower;
  for(const[k,v]of Object.entries({best:0,records:{},sweepDay:0,sweeps:0,runs:0,wins:0,fails:0,lastT:0,bestT:0}))if(t[k]==null)t[k]=v;
  t.cur=t.best+1;return t}
function recAll(){try{return JSON.parse(store.get(REC_KEY)||'{}')||{}}catch(e){return{}}}
function recSave(f){const S=G.save,all=recAll(),r=all[S.cls];if(!r||f>r.f){all[S.cls]={f,name:S.name,lvl:S.lvl,d:dayKey()};store.set(REC_KEY,JSON.stringify(all))}
  const t=TS();if(!t.records[S.cls]||f>t.records[S.cls].f)t.records[S.cls]={f,lvl:S.lvl,d:dayKey()}}
function unlocked(){const S=G.save;return !!S&&((S.cleared&&S.cleared.length>0)||S.lvl>=8||S.ng>0||(S.tower&&S.tower.best>0))}
VT.unlocked=unlocked;VT.TS=TS;

/* ---------------- kế hoạch tầng (tất định theo tầng + tuần) ---------------- */
const lvAt=n=>9+Math.round(n*1.25);
function mobTypes(){return Object.keys(ET).filter(k=>{const d=ET[k];return d.ai!=='boss'&&!d.b2obj&&k.indexOf('b2_')!==0})}
function bossTypes(){return Object.keys(ET).filter(k=>ET[k].ai==='boss'&&!ET[k].b2obj)}
function shuf(a,R){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function plan(n){
  const R=mulberry32(n*7919+(weekKey()%100000)*31+7);const boss=n%10===0,mini=!boss&&n%5===0,lv=lvAt(n);
  const ci=Math.floor((n-1)/3)%MAPS.length;const ch=(MAPS[ci].enemies||[]).map(a=>a[0]).filter(k=>ET[k]);
  const all=mobTypes();let types=shuf(ch.length?ch:all,R).slice(0,3);const wild=all[Math.floor(R()*all.length)];if(!types.includes(wild))types.push(wild);
  let nm=n<3?0:boss?(R()<0.45?1:0):n<15?(R()<0.65?1:0):(R()<0.35?2:1);
  const pool=MOD_IDS.filter(k=>!(boss&&(k==='baothi'||k==='suongmu')));const mods=shuf(pool,R).slice(0,nm);
  const BT=bossTypes();const bt=boss&&BT.length?BT[(n/10-1)%BT.length]:null;
  const waves=boss?0:2+(n>=10?1:0)+(n>=30?1:0),per=5+Math.min(7,Math.floor(n/6));
  return{n,lv,boss,mini,types,mods,bt,waves,per,time:boss?180:mini?120:90,ci,tier:Math.floor((n-1)/10)%TIERC.length}}
function rewardsFor(P){const n=P.n;let mr=1;for(const m of P.mods)mr*=MODS[m].r;
  const cqm=P.mods.includes('linhkhi')?2:1,gm=P.mods.includes('huyetnguyet')?1.5:1,big=n%10===0,mid=!big&&n%5===0;
  return{gold:Math.round((80+n*40+Math.pow(n,1.5)*6)*mr*gm*(big?3:mid?1.6:1)),ore:(2+Math.floor(n/4))*(big?2:1),
    cq:Math.round((20+n*6)*cqm*mr*(big?2:1)),tq:(n%5===0?1:0)+(big?1:0),charm:(big?1:0)+(n%25===0?1:0),item:big?3:mid?2:0}}
function sweepRew(B){if(B<1)return null;return{gold:Math.round(100+B*60+Math.pow(B,1.5)*4),ore:3+Math.floor(B/3),cq:Math.round(30+B*12),tq:Math.floor(B/10)+(B>=5?1:0),charm:B>=30?1:0,potHP:3}}
Object.assign(VT,{plan,rewardsFor,sweepRew,lvAt,MODS});

/* ---------------- thế giới tầng tháp ---------------- */
const FCX=34,FCY=24,FR=7.6*T;
function makeTowerWorld(P){
  const C=TIERC[P.tier],n=P.n;
  const W={mi:1000+n,tower:1,tc:C,P,tile:new Uint8Array(MW*MH),solid:new Uint8Array(MW*MH),objs:[],ogrid:Array(MW*MH).fill(null),reach:new Uint8Array(MW*MH),npcs:[],pathPts:[],chunks:new Map(),lights:[]};
  W.M={name:'Vượt Tháp · Tầng '+n,era:BAN_TIERS[P.tier],seed:n*13+5,lv:[P.lv,P.lv],enemies:[],quest:[],deco:[],feat:'tower',amb:P.mods.includes('suongmu')?'mist':'dust',
    pal:{g:[C.ab,C.ab,C.ab],path:C.s,water:'#1b2a30',water2:'#2a4048',shore:C.s2,field:C.s,field2:C.s2,tree:'#3c6b2c',tree2:'#2a4f20',trunk:'#5b4026',accent:C.a,tint:C.tint,cliff:C.rim,cliff2:C.rim2,wall:C.rim,wall2:C.rim2}};
  const F={x:(FCX+0.5)*T,y:(FCY+0.5)*T,r:FR};W.floor=F;W.far={x:-9000,y:-9000,r:10};W.arena=W.far;
  W.camp={x:F.x,y:F.y+F.r*0.82*0.62};W.out=W.camp;W.start={x:W.camp.x,y:W.camp.y};
  const inF=(px,py,pad)=>{const dx=(px-F.x)/(F.r-(pad||0)),dy=(py-F.y)/((F.r-(pad||0))*0.82);return dx*dx+dy*dy<=1};
  for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){const i=y*MW+x,inside=inF((x+.5)*T,(y+.5)*T,0);W.tile[i]=inside?TP:TC;W.solid[i]=inside?0:1}
  const addObj=o=>{W.objs.push(o);const k=Math.floor(o.y/T)*MW+Math.floor(o.x/T);(W.ogrid[k]||(W.ogrid[k]=[])).push(o)};
  // cột đá
  const np=P.boss?4:6,a0=(n*0.61)%TAU;
  for(let k=0;k<np;k++){const a=a0+k/np*TAU,rr=P.boss?0.74:0.58;addObj({x:F.x+Math.cos(a)*F.r*rr,y:F.y+Math.sin(a)*F.r*rr*0.82,k:'pillar',v:k,cr:16,s:1})}
  // đèn lồng quanh vành
  for(let k=0;k<10;k++){const a=k/10*TAU+0.31,x=F.x+Math.cos(a)*(F.r+T*0.85),y=F.y+Math.sin(a)*(F.r+T*0.85)*0.82;if(Math.sin(a)>0.55&&Math.abs(Math.cos(a))<0.5)continue;
    addObj({x,y,k:'lantern',v:k,cr:0,s:1});W.lights.push({x:x+16,y:y-64,r:26,col:'#ff8a3a'})}
  // vùng đi được: BFS từ tâm, bỏ ô có cột
  const blocked=i=>{if(W.solid[i])return true;const o=W.ogrid[i];if(o)for(const q of o)if(q.cr>0)return true;return false};
  const s0=FCY*MW+FCX;const q=[s0];W.reach[s0]=1;
  while(q.length){const i=q.pop(),x=i%MW,y=(i/MW)|0;for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=MW||ny>=MH)continue;const j=ny*MW+nx;if(W.reach[j]||blocked(j))continue;W.reach[j]=1;q.push(j)}}
  W.walk=W.reach.slice();W.walkLocked=W.walk;
  W.spawnTiles=[];for(let i=0;i<MW*MH;i++)if(W.walk[i]){const px=(i%MW+.5)*T,py=(((i/MW)|0)+.5)*T;if(!inF(px,py,F.r*0.5)&&inF(px,py,40))W.spawnTiles.push(i)}
  W.campToArena=F.r;W.inF=inF;
  // bản đồ nhỏ
  const c=document.createElement('canvas');c.width=MW;c.height=MH;const g=c.getContext('2d');g.fillStyle=C.ab;g.fillRect(0,0,MW,MH);
  g.fillStyle=C.s;g.beginPath();g.ellipse(F.x/T,F.y/T,F.r/T+0.5,(F.r/T+0.5)*0.82,0,0,TAU);g.fill();g.fillStyle=C.rim2;for(const o of W.objs)if(o.k==='pillar')g.fillRect(o.x/T-0.6,o.y/T-0.6,1.2,1.2);W.mini=c;
  return W}

/* vẽ sàn tháp (lưu đệm theo khối như địa hình thường) */
function drawTowerTerrain(W,g,x0,y0,x1,y1){
  const C=W.tc,F=W.floor,R=F.r,s=W.M.seed;
  g.fillStyle=C.ab;g.fillRect(x0*T,y0*T,(x1-x0+1)*T,(y1-y0+1)*T);
  // mây vực thẳm
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const h=hash2(x,y,s);if(h<0.78)continue;g.fillStyle=`rgba(255,255,255,${0.018+0.02*hash2(y,x,s+3)})`;g.beginPath();g.ellipse(x*T+hash2(x,y,s+1)*T,y*T+hash2(x,y,s+2)*T,T*(0.8+h),T*0.35,0,0,TAU);g.fill()}
  const bx0=x0*T-T,by0=y0*T-T,bx1=(x1+2)*T,by1=(y1+2)*T;if(F.x+R+3*T<bx0||F.x-R-3*T>bx1||F.y+R+3*T<by0||F.y-R-3*T>by1)return;
  g.save();g.translate(F.x,F.y);g.scale(1,0.82);
  // bóng + thân tháp bên dưới
  g.fillStyle='rgba(0,0,0,0.55)';g.beginPath();g.arc(0,40,R+T*1.5,0,TAU);g.fill();
  g.fillStyle=shade(C.rim2,-0.25);g.beginPath();g.arc(0,30,R+T*1.25,0,TAU);g.fill();
  // vành tường đá
  g.fillStyle=C.rim2;g.beginPath();g.arc(0,0,R+T*1.25,0,TAU);g.fill();
  g.fillStyle=C.rim;g.beginPath();g.arc(0,-4,R+T*1.12,0,TAU);g.fill();
  g.strokeStyle='rgba(0,0,0,0.35)';g.lineWidth=2;for(let k=0;k<40;k++){const a=k/40*TAU;g.beginPath();g.moveTo(Math.cos(a)*(R+T*0.6),Math.sin(a)*(R+T*0.6)-4);g.lineTo(Math.cos(a)*(R+T*1.12),Math.sin(a)*(R+T*1.12)-4);g.stroke()}
  g.strokeStyle='rgba(255,255,255,0.14)';g.lineWidth=3;g.beginPath();g.arc(0,-6,R+T*1.06,Math.PI*1.08,Math.PI*1.92);g.stroke();
  // sàn
  const gr=g.createRadialGradient(0,-R*0.2,R*0.1,0,0,R+T*0.6);gr.addColorStop(0,shade(C.s,0.12));gr.addColorStop(0.7,C.s);gr.addColorStop(1,C.s2);
  g.fillStyle=gr;g.beginPath();g.arc(0,0,R+T*0.6,0,TAU);g.fill();
  // đá lát: vành đồng tâm + đường nối
  const rings=[0.24,0.46,0.68,0.88,1.06];g.lineWidth=2.2;g.strokeStyle=C.g;
  for(const k of rings){g.beginPath();g.arc(0,0,R*k,0,TAU);g.stroke()}
  for(let r=0;r<rings.length-1;r++){const n=8+r*6,off=hash2(r,1,s)*TAU;g.beginPath();
    for(let i=0;i<n;i++){const a=off+i/n*TAU;g.moveTo(Math.cos(a)*R*rings[r],Math.sin(a)*R*rings[r]);g.lineTo(Math.cos(a)*R*rings[r+1],Math.sin(a)*R*rings[r+1])}g.stroke()}
  g.strokeStyle='rgba(255,255,240,0.08)';g.lineWidth=1.4;for(const k of rings){g.beginPath();g.arc(0,2,R*k,Math.PI*0.1,Math.PI*0.9);g.stroke()}
  // vết nứt, rêu
  for(let i=0;i<26;i++){const a=hash2(i,2,s)*TAU,rr=Math.sqrt(hash2(i,3,s))*R*0.98;const x=Math.cos(a)*rr,y=Math.sin(a)*rr;
    if(i%3===0){g.fillStyle='rgba(80,110,60,0.22)';g.beginPath();g.ellipse(x,y,10+hash2(i,4,s)*14,6,a,0,TAU);g.fill()}
    else{g.strokeStyle='rgba(0,0,0,0.22)';g.lineWidth=1.2;g.beginPath();g.moveTo(x,y);g.lineTo(x+(hash2(i,5,s)-0.5)*28,y+(hash2(i,6,s)-0.5)*28);g.lineTo(x+(hash2(i,7,s)-0.5)*40,y+(hash2(i,8,s)-0.5)*40);g.stroke()}}
  // mặt trống đồng ở tâm
  g.globalAlpha=0.5;g.strokeStyle=C.a;g.lineWidth=2;g.beginPath();g.arc(0,0,R*0.2,0,TAU);g.stroke();g.beginPath();g.arc(0,0,R*0.42,0,TAU);g.stroke();
  g.fillStyle=C.a;g.beginPath();for(let i=0;i<14;i++){const a=i/14*TAU,a2=a+TAU/28;g.lineTo(Math.cos(a)*R*0.19,Math.sin(a)*R*0.19);g.lineTo(Math.cos(a2)*R*0.07,Math.sin(a2)*R*0.07)}g.closePath();g.globalAlpha=0.32;g.fill();
  g.globalAlpha=0.35;for(let i=0;i<16;i++){const a=i/16*TAU;g.save();g.rotate(a);g.translate(R*0.31,0);g.rotate(Math.PI/2);g.beginPath();g.moveTo(-8,3);g.quadraticCurveTo(0,-7,10,-1);g.lineTo(3,2);g.lineTo(-1,7);g.closePath();g.fill();g.restore()}
  // số tầng sơn trên sàn
  g.globalAlpha=0.3;g.textAlign='center';g.textBaseline='middle';g.fillStyle=C.a;g.font='400 '+Math.round(R*0.3)+'px "Yeseva One",Georgia,serif';g.fillText(String(W.P.n),0,-R*0.56);
  g.font='800 '+Math.round(R*0.075)+'px "Be Vietnam Pro",system-ui,sans-serif';g.fillText('TẦNG',0,-R*0.77);
  g.globalAlpha=1;g.textBaseline='alphabetic';
  g.restore()}

/* ---------------- trạng thái chương được cất khi vào tháp ---------------- */
const keep={};
function stash(){const S=G.save,p=G.p;Object.assign(keep,{W:G.W,en:G.enemies,drops:G.drops,projs:G.projs,zones:G.zones,tele:G.tele,fx:G.fx,boss:G.boss,horde:G.horde,hordeT:G.hordeT,elT:G.eliteTimer,px:p.x,py:p.y,
  qt:S.b2qt?S.b2qt[S.map]:undefined})}
function clearWorldState(){G.enemies=[];G.projs=[];G.drops=[];G.zones=[];G.tele=[];G.fx=[];G.parts=[];G.amb=[];G.floats=[];G.boss=null;G.lastTarget=null;
  G.nav=null;G.pf=null;G.navS=null;G.wander=null;G.nearNpc=null;G.horde=null;
  if(window.B2){B2.hz=[];B2.tm=[];B2.fx=[];B2.diedInFight=false}const ph=document.getElementById('b2ph');if(ph)ph.hidden=true;UI.npcPrompt(null)}
function restore(){const S=G.save,p=G.p;
  clearWorldState();G.W=keep.W;G.enemies=(keep.en||[]).filter(e=>!e.dead);G.drops=keep.drops||[];G.boss=keep.boss&&!keep.boss.dead?keep.boss:null;G.horde=keep.horde;G.hordeT=keep.hordeT;G.eliteTimer=keep.elT||0;
  p.x=keep.px;p.y=keep.py;p.dash=null;p.approach=null;G.cam.x=p.x;G.cam.y=p.y-20;
  if(S.b2qt){if(keep.qt===undefined)delete S.b2qt[S.map];else S.b2qt[S.map]=keep.qt}
  UI.cache.mn=null;G.dirty.quest=1;keep.W=null}

/* ---------------- vào / ra ---------------- */
function enter(){const t=TS();if(!t||VT.on||G.state!=='play')return false;
  if(!unlocked()){UI.toast('Vượt Tháp mở sau khi hạ boss chương 1 hoặc đạt cấp 8.','warn');return false}
  if(UI.panel)UI.close();stash();const S=G.save;if(S.b2qt)S.b2qt[S.map]=0;VT.on=true;t.runs++;startFloor(t.best+1);return true}
function startFloor(n){
  const P=plan(n),p=G.p;VT.P=P;VT.ph='intro';VT.t=0;VT.left=P.time;VT.wave=0;VT.waveT=0;VT.fireT=2;VT.bossSpawned=false;VT.kills=0;VT.trk=null;
  clearWorldState();G.W=makeTowerWorld(P);
  p.x=G.W.start.x;p.y=G.W.start.y;p.dash=null;p.approach=null;p.hp=p.maxhp;p.mp=p.maxmp;p.ifr=1.5;p.aim=-Math.PI/2;
  for(let i=0;i<3;i++)p.skCd[i]=0;G.cam.x=p.x;G.cam.y=p.y-20;G.state='play';G.paused=false;G.slow=1;
  resHide();UI.cache.mn=null;G.dirty.quest=1;banner(P);Audio_.play('roar');saveGame()}
function leave(silent){if(!VT.on)return;VT.on=false;VT.ph=null;resHide();restore();
  const t=TS();if(t)t.cur=t.best+1;if(!silent)saveGame()}
function abandon(){if(!VT.on)return;const n=VT.P.n;TS().fails++;VT.last={win:false,n,why:'quit'};leave();UI.toast('Đã rời Vượt Tháp. Tầng '+n+' chưa vượt qua.','warn');UI.open('tower')}
function fail(why){if(!VT.on)return;const n=VT.P.n,S=G.save,p=G.p;TS().fails++;VT.last={win:false,n,why,t:Math.round(VT.P.time-VT.left)};
  G.state='play';p.hp=p.maxhp;p.mp=p.maxmp;p.ifr=1.5;p.deadT=0;const dd=document.getElementById('dead');if(dd)dd.hidden=true;const bd=document.getElementById('b2Dead');if(bd)bd.hidden=true;
  if(window.B2)B2.diedInFight=false;leave();Audio_.play('fail');UI.toast(why==='time'?`Hết giờ ở Tầng ${n}. Không mất vàng.`:`Thất bại ở Tầng ${n}. Không mất vàng.`,'warn');UI.open('tower')}
function win(){const P=VT.P,n=P.n,S=G.save,t=TS(),p=G.p;VT.ph='done';
  const r=rewardsFor(P),used=Math.round(P.time-VT.left);const got=[];
  if(n>t.best){
    giveRes('gold',r.gold,'tower');giveRes('ore',r.ore,'tower');giveRes('cq',r.cq,'tower');if(r.tq)giveRes('tq',r.tq,'tower');if(r.charm)giveRes('charm',r.charm,'tower');
    let it=null;if(r.item){it=genItem(P.lv+(r.item>=3?2:1),r.item>=3?Math.max(3,rollRarity(3)):Math.max(2,rollRarity(1)));addToBag(it,true)}
    got.push(['gold',r.gold],['ore',r.ore],['cq',r.cq]);if(r.tq)got.push(['tq',r.tq]);if(r.charm)got.push(['charm',r.charm]);if(it)got.push(['item',it]);
    t.best=n;t.bestT=used;recSave(n)}
  t.wins++;t.lastT=used;t.cur=t.best+1;S.score+=Math.round(400*n*(1+S.ng*0.5));
  VT.last={win:true,n,t:used,got};saveGame();Audio_.play('win');G.shake=8;
  for(let i=0;i<30;i++){const a=i/30*TAU;addPart(p.x+Math.cos(a)*20,p.y-20,Math.cos(a)*200,Math.sin(a)*100-60,0.9,i%2?'#ffd23a':'#fff4d0',3,0)}
  G.fx.push({k:'pillar',x:p.x,y:p.y,w:40,h:420,col:TIERC[P.tier].a,life:1.2,max:1.2});
  setTimeout(()=>{if(VT.on&&VT.ph==='done')showRes()},650)}
function next(){if(!VT.on)return;resHide();startFloor(TS().best+1)}
Object.assign(VT,{enter,leave,abandon,next,fail,win,startFloor});

/* ---------------- sinh quái ---------------- */
function modOn(k){return VT.on&&VT.P&&VT.P.mods.includes(k)}
function applyStats(e,kind){const lv=e.lv,D=e.def;const hpB=(26+12*lv)*Math.pow(1.06,lv),atkB=(7+3.9*lv)*Math.pow(1.05,lv);
  let hm=1.1,am=1.1;if(kind==='elite'){hm*=4.2;am*=1.5}else if(kind==='mini'){hm*=9;am*=1.7}else if(kind==='boss'){hm=2.2;am=0.85}
  if(modOn('linhkhi'))hm*=1.15;if(modOn('thietbich')){hm*=1.2;e.edef=lv*1.2*1.8}else e.edef=lv*1.2*(kind==='boss'?1.5:1);if(modOn('huyetnguyet'))am*=1.25;
  e.max=e.hp=Math.max(1,Math.round(hpB*D.hp*hm));e.atk=atkB*D.atk*am;
  if(modOn('cuongphong')&&kind!=='boss'){e.spd*=1.35;e.cdM=(e.cdM||1)*0.8}}
function ringPt(minFromP){const W=G.W,F=W.floor,p=G.p;
  for(let k=0;k<40;k++){const a=Math.random()*TAU,rr=F.r*rand(0.42,0.86),x=F.x+Math.cos(a)*rr,y=F.y+Math.sin(a)*rr*0.82;
    const i=Math.floor(y/T)*MW+Math.floor(x/T);if(!W.walk[i])continue;if(dist(x,y,p.x,p.y)<minFromP)continue;return{x,y}}
  return{x:F.x,y:F.y-F.r*0.5}}
function puff(x,y,col){for(let j=0;j<10;j++)addPart(x+rand(-14,14),y-10,rand(-70,70),rand(-110,-30),0.6,col||'#c58bff',3,120);G.fx.push({k:'ring',x,y,r:6,r2:46,life:0.4,max:0.4,col:col||'#c58bff'})}
function spawnMob(type,x,y,kind){
  const e=spawnEnemy(type,x,y,VT.P.lv,false);e.tw=1;applyStats(e,kind);
  if(kind==='elite'||kind==='mini'){const mini=kind==='mini';e.elite=true;e.r*=mini?1.4:1.2;e.sc=mini?1.5:1.25;e.name=(mini?'Thủ Lĩnh ':'Tinh Anh ')+e.def.name;
    if(window.B2&&B2.applyAffix&&B2.AFX){const ids=Object.keys(B2.AFX),want=mini?(VT.P.n>=25?3:2):(VT.P.n>=20?2:1),got=[];while(got.length<want&&got.length<ids.length){const k=pick(ids);if(!got.includes(k))got.push(k)}B2.applyAffix(e,got)}}
  e.state='chase';e.hx=x;e.hy=y;e.st=0.3;resolve(G.W,e);puff(e.x,e.y,kind==='mini'?'#ffd23a':kind==='elite'?'#ffb32a':'#c58bff');return e}
function spawnWave(){const P=VT.P;VT.wave++;VT.waveT=0;const last=VT.wave===P.waves;
  const n=P.per+(last&&!P.mini?1:0);const eC=Math.min(0.25,0.05+P.n*0.004);
  for(let k=0;k<n;k++){const q=ringPt(230);spawnMob(pick(P.types),q.x,q.y,Math.random()<eC?'elite':'mob')}
  if(last&&P.mini){const q=ringPt(260);const m=spawnMob(P.types[0],q.x,q.y,'mini');VT.mini=m;UI.toast(m.name+' xuất hiện!','boss');Audio_.play('roar');G.shake=8}
  else if(VT.wave>1)UI.toast(`Đợt ${VT.wave}/${P.waves}`,'quest');Audio_.play('magic')}
function spawnBoss(){const P=VT.P,W=G.W,F=W.floor;W.arena=F;VT.bossSpawned=true;
  const e=spawnEnemy(P.bt,F.x,F.y-60,P.lv,false);e.tw=1;applyStats(e,'boss');e.name='Ảo Ảnh '+e.def.name;e.state='intro';e.st=1.6;G.boss=e;VT.boss=e;
  UI.bossIntro(e);Audio_.play('roar');G.shake=10;puff(e.x,e.y,'#ff5b3d')}
function alive(){let n=0;for(const e of G.enemies)if(!e.dead&&!e.def.b2obj)n++;return n}

/* ---------------- vòng cập nhật trong tháp ---------------- */
HK.on('tick',dt=>{if(!VT.on)return;const P=VT.P,p=G.p,W=G.W;VT.t+=dt;
  if(VT.ph==='intro'){if(VT.t>=1.5){VT.ph='fight';VT.t=0;if(P.boss)spawnBoss();else spawnWave()}}
  else if(VT.ph==='fight'){VT.left-=dt;VT.waveT+=dt;
    if(P.boss){if(G.boss&&!G.boss.dead)W.arena=W.floor;else W.arena=W.far}
    if(!P.boss&&VT.wave<P.waves){const a=alive();if(a<=Math.max(1,Math.floor(P.per*0.25))||VT.waveT>=22)spawnWave()}
    if(modOn('hoanguc')){VT.fireT-=dt;if(VT.fireT<=0){VT.fireT=Math.max(2.2,3.4-P.n*0.01);const atkB=(7+3.9*P.lv)*Math.pow(1.05,P.lv)*0.9;
      for(let k=0;k<2;k++){let x=p.x,y=p.y;if(k){const q=ringPt(0);x=q.x;y=q.y}else{x+=rand(-40,40);y+=rand(-30,30)}
        G.tele.push({k:'circle',x,y,r:72,t:0,dur:1.35,col:'#ff5b3d',boom:{dmg:atkB,lv:P.lv}})}}}
    const done=P.boss?(VT.bossSpawned&&(!G.boss||G.boss.dead)&&alive()===0):(VT.wave>=P.waves&&alive()===0);
    if(done){VT.ph='won';VT.t=0;W.arena=W.far;G.tele=[];if(window.B2){B2.hz=[];B2.tm=[]}UI.toast(`Vượt qua Tầng ${P.n}!`,'quest')}
    else if(VT.left<=0){fail('time');return}}
  else if(VT.ph==='won'){// hút đồ rơi về người chơi
    for(const d of G.drops){if(d.t<0.45)d.t=0.45;const a=Math.atan2(p.y-d.y,p.x-d.x),dd=dist(d.x,d.y,p.x,p.y),sp=Math.max(400,dd*6);if(dd>4){d.x+=Math.cos(a)*Math.min(dd,sp*dt);d.y+=Math.sin(a)*Math.min(dd,sp*dt)}}
    if(VT.t>1.1||(VT.t>0.5&&!G.drops.length)){for(const d of G.drops)if(d.kind==='item')addToBag(d.val,true);G.drops=[];win()}}
  trackerTick()});
HK.on('kill',e=>{if(!VT.on||!e.tw)return;VT.kills++;
  if(modOn('baothi')&&!e.boss)G.tele.push({k:'circle',x:e.x,y:e.y,r:80,t:0,dur:1.0,col:'#ffb347',boom:{dmg:e.atk*0.9,lv:e.lv}});
  if(modOn('huyetnguyet')&&Math.random()<0.6)dropAt(e.x,e.y,'gold',Math.round(e.lv*2+randi(1,6)))});

/* ---------------- chặn các cơ chế của chương khi đang trong tháp ---------------- */
// các hàm toàn cục khai báo bằng function nằm trên window (cùng một thẻ script)
const _tsp=trySpawnPack;trySpawnPack=function(){if(VT.on)return false;return _tsp.apply(this,arguments)};
const _se=spawnElite;spawnElite=function(){if(VT.on)return null;return _se.apply(this,arguments)};
const _sb=startBoss;startBoss=function(){if(VT.on)return;return _sb.apply(this,arguments)};
const _bd=bossDefeated;bossDefeated=function(e){if(VT.on&&e&&e.tw){G.boss=null;if(G.W&&G.W.far)G.W.arena=G.W.far;G.shake=14;Audio_.play('win');return}return _bd.apply(this,arguments)};
const _qe=questEvent;questEvent=function(){if(VT.on)return;return _qe.apply(this,arguments)};
const _drop=dropAt;dropAt=function(x,y,kind){if(VT.on&&kind==='qitem')return;return _drop.apply(this,arguments)};
const _uh=updateHorde;updateHorde=function(){if(VT.on)return;return _uh.apply(this,arguments)};
const _qt=questTarget;questTarget=function(){if(!VT.on)return _qt.apply(this,arguments);const p=G.p;let b=null,bd=1e18;
  for(const e of G.enemies){if(e.dead||e.def.b2obj)continue;const d=dist2(e.x,e.y,p.x,p.y);if(d<bd){bd=d;b=e}}
  return b?{x:b.x,y:b.y,label:b.name,e:b}:null};
const _dt=drawTerrain;drawTerrain=function(W,g,x0,y0,x1,y1){if(W&&W.tower)return drawTowerTerrain(W,g,x0,y0,x1,y1);return _dt.apply(this,arguments)};
const _da=drawArena;drawArena=function(W){if(W&&W.tower)return drawTowerFloorFx(W);return _da.apply(this,arguments)};
const _resp=respawn;respawn=function(){if(VT.on){fail('dead');return}return _resp.apply(this,arguments)};
const _tr=travel;travel=function(){if(VT.on)leave(true);return _tr.apply(this,arguments)};
const _st=showTitle;showTitle=function(){if(VT.on)leave(true);resHide();return _st.apply(this,arguments)};
const _tn=townNpcs;townNpcs=function(W){const L=_tn.apply(this,arguments);L.push({id:'thap',name:'Tháp Chủ',x:9*T,y:60.95*T,look:'thapchu',act:'tower'});return L};
if(typeof LOOKS==='object'&&!LOOKS.thapchu)LOOKS.thapchu=Object.assign({},LOOKS.elder,{robe:'#d98a2a',robe2:'#7a2a1a',pants:'#8a4a1a',sash:'#7a2a1a',wc:'#3a2414'});

/* hiệu ứng động trên sàn: vòng ấn phát sáng, khe lửa khi Hỏa Ngục */
function drawTowerFloorFx(W){const F=W.floor,C=W.tc;
  cx.save();cx.translate(F.x,F.y);cx.scale(1,0.82);
  const pu=0.25+Math.sin(G.t*2)*0.1;cx.strokeStyle=C.a;cx.globalAlpha=pu;cx.lineWidth=3;cx.setLineDash([18,14]);cx.lineDashOffset=-G.t*20;cx.beginPath();cx.arc(0,0,F.r+T*0.45,0,TAU);cx.stroke();cx.setLineDash([]);
  if(G.boss&&!G.boss.dead){cx.globalAlpha=0.3+Math.sin(G.t*4)*0.12;cx.strokeStyle='#ff5b3d';cx.lineWidth=4;cx.beginPath();cx.arc(0,0,F.r+T*0.2,0,TAU);cx.stroke()}
  if(W.P.mods.includes('hoanguc')){cx.globalAlpha=0.5+Math.sin(G.t*5)*0.15;cx.strokeStyle='#ff6a1a';cx.lineWidth=3;cx.lineCap='round';
    for(let i=0;i<9;i++){const a=i/9*TAU+0.3,r0=F.r*(0.3+(i%3)*0.18);cx.beginPath();cx.moveTo(Math.cos(a)*r0,Math.sin(a)*r0);cx.lineTo(Math.cos(a+0.12)*(r0+40),Math.sin(a+0.12)*(r0+40));cx.lineTo(Math.cos(a-0.05)*(r0+70),Math.sin(a-0.05)*(r0+70));cx.stroke()}}
  cx.restore();cx.globalAlpha=1}

/* Sương Mù: phủ tối quanh người chơi */
let fogC=null;function fogCanvas(){if(fogC)return fogC;const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');const gr=g.createRadialGradient(64,64,64*125/300,64,64,64);
  gr.addColorStop(0,'rgba(12,16,20,0)');gr.addColorStop(1,'rgba(12,16,20,0.93)');g.fillStyle=gr;g.fillRect(0,0,128,128);return fogC=c}
HK.on('drawScreen',()=>{if(!VT.on||!modOn('suongmu')||!G.p)return;const[sx,sy]=worldToScreen(G.p.x,G.p.y-20);const k=G.cam.z*DPR,X=Math.round(sx*DPR),Y=Math.round(sy*DPR),r=Math.round(300*k);
  cx.drawImage(fogCanvas(),X-r,Y-r,r*2,r*2);cx.fillStyle='rgba(12,16,20,0.93)';const W=cv.width,H=cv.height;
  cx.fillRect(0,0,W,Math.max(0,Y-r));cx.fillRect(0,Y+r,W,Math.max(0,H-Y-r));cx.fillRect(0,Y-r,Math.max(0,X-r),r*2);cx.fillRect(X+r,Y-r,Math.max(0,W-X-r),r*2)});

/* ---------------- DOM: CSS, băng rôn, bảng kết quả ---------------- */
function css(){if(document.getElementById('twcss'))return;const s=document.createElement('style');s.id='twcss';s.textContent=`
#twBan{position:absolute;left:0;right:0;top:22%;display:flex;flex-direction:column;align-items:center;pointer-events:none;z-index:4}
#twBan .band{width:100%;padding:10px 16px 12px;background:linear-gradient(90deg,transparent,rgba(26,14,8,.9) 18%,rgba(26,14,8,.9) 82%,transparent);text-align:center;border-top:1px solid rgba(201,162,78,.55);border-bottom:1px solid rgba(201,162,78,.55)}
#twBan .t1{font:800 12px/1.2 var(--f-ui);color:var(--vang2);letter-spacing:.24em}
#twBan .t2{font:400 clamp(30px,8vw,46px)/1.1 var(--f-display);color:#fff2dc;text-shadow:0 3px 10px #000;margin-top:2px}
#twBan .t3{font:600 13px/1.45 var(--f-ui);color:#ffd9b8;max-width:min(86vw,480px);margin:6px auto 0}
#qt.twq .qh{color:var(--vang2)}
#qt .twrow{display:flex;align-items:baseline;justify-content:space-between;gap:8px}
#qt .twtime{font:400 22px/1 var(--f-display);color:#fff2dc;font-variant-numeric:tabular-nums}
#qt .twtime.low{color:#ff8a6a}
#qt .twm{display:flex;flex-wrap:wrap;gap:4px}
.twchip{display:inline-flex;align-items:center;gap:5px;padding:3px 8px;border-radius:999px;font:700 11.5px/1.2 var(--f-ui);background:rgba(0,0,0,.35);border:1px solid currentColor;white-space:nowrap}
#twRes{background:rgba(14,6,4,.72);z-index:6}
#twRes .twcard{width:min(440px,100%);padding:20px 18px 18px;text-align:center;position:relative}
#twRes .seal{width:86px;height:86px;margin:0 auto 8px;border-radius:10px;border:2.5px solid var(--vang);background:radial-gradient(circle at 40% 30%,#e5532f,#7a1f14);display:grid;place-items:center;transform:rotate(-4deg);box-shadow:0 6px 18px rgba(0,0,0,.5)}
#twRes .seal b{font:400 34px/1 var(--f-display);color:#fff2dc}
#twRes .seal small{display:block;font:800 10px/1 var(--f-ui);letter-spacing:.14em;color:var(--vang2);margin-bottom:2px}
#twRes h3{margin:4px 0 2px;font:400 clamp(26px,7vw,34px)/1.1 var(--f-display);color:var(--vang2)}
#twRes .sub{margin:0 0 12px;font:600 13px/1.5 var(--f-ui);color:var(--dim)}
.twrew{display:grid;grid-template-columns:repeat(auto-fit,minmax(148px,1fr));gap:6px;margin:8px 0 4px;text-align:left}
.twrew>div{display:flex;align-items:center;gap:8px;padding:7px 9px;border-radius:9px;background:rgba(0,0,0,.28);border:1px solid rgba(226,178,74,.18);font:700 13px/1.2 var(--f-ui);min-width:0}
.twrew>div span{min-width:0;overflow-wrap:anywhere}
.twrew svg{width:20px;height:20px;flex:none}
.twrew .wide{grid-column:1/-1}
#twRes .row{justify-content:center}
.twhead{display:grid;grid-template-columns:auto 1fr;gap:14px;align-items:center;padding:12px;border-radius:12px;background:linear-gradient(160deg,rgba(90,40,24,.35),rgba(0,0,0,.25));border:1px solid var(--line);margin-bottom:12px}
.twhead svg{width:64px;height:86px;display:block}@media(max-width:420px){.twhead{gap:10px;padding:10px}.twhead svg{width:44px;height:60px}.twstat b{font-size:19px}}
.twstat{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}
.twstat>div{padding:6px 8px;border-radius:9px;background:rgba(0,0,0,.3);min-width:0}
.twstat span{display:block;font:600 11px/1.2 var(--f-ui);color:var(--dim);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.twstat b{display:block;font:400 22px/1.1 var(--f-display);color:var(--vang2);font-variant-numeric:tabular-nums}
.twnext{padding:12px;border-radius:12px;background:rgba(0,0,0,.25);border:1px solid rgba(226,178,74,.22)}
.twnext h5{margin:0 0 6px;font:400 20px/1.1 var(--f-display);display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.twbadge{display:inline-block;padding:3px 8px;border-radius:6px;font:800 11px/1.2 var(--f-ui);letter-spacing:.05em;background:#3a2a20;color:var(--diep);border:1px solid var(--line)}
.twbadge.mini{background:#5a3a10;color:#ffd98a;border-color:#ffb32a}.twbadge.boss{background:#6a1a12;color:#ffd0c0;border-color:#ff6a4a}
.twnext p{margin:4px 0;font:500 13px/1.5 var(--f-ui);color:var(--diep)}
.twnext p b{color:var(--vang2)}
.twmods{display:flex;flex-direction:column;gap:6px;margin:8px 0 2px}
.twmods>div{display:grid;grid-template-columns:auto 1fr;gap:8px;align-items:center;font:500 12.5px/1.4 var(--f-ui);color:var(--diep)}
.twact{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.twact .btn{flex:1 1 150px}
.twact .btn{flex-direction:column;gap:2px}.twact .btn small{display:block;font-weight:600;font-size:11px;opacity:.85}
.twlast{padding:9px 12px;border-radius:10px;margin-bottom:10px;font:600 13px/1.45 var(--f-ui);border:1px solid}
.twlast.w{background:rgba(60,110,50,.25);border-color:rgba(140,230,140,.4);color:#d6f5c8}.twlast.l{background:rgba(120,30,20,.3);border-color:rgba(255,120,90,.45);color:#ffd6c8}
.twrec{width:100%;border-collapse:collapse;font:600 13px/1.3 var(--f-ui)}
.twrec th{font:700 11px var(--f-ui);color:var(--dim);text-align:left;padding:4px 6px;letter-spacing:.04em}
.twrec td{padding:7px 6px;border-top:1px solid rgba(226,178,74,.14)}
.twrec td:last-child,.twrec th:last-child{text-align:right;font-variant-numeric:tabular-nums}
.twrec tr.me td{color:var(--vang2)}
.twrec .dot{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:7px;vertical-align:0}
@media(max-height:500px){#twBan{top:30%}#twBan .t2{font-size:28px}#twBan .band{padding:6px 16px 8px}#twRes .twcard{padding:12px 16px}#twRes .seal{width:56px;height:56px;margin-bottom:4px}#twRes .seal b{font-size:24px}#twRes h3{font-size:22px}#twRes .sub{margin-bottom:6px}}
.twlock{padding:14px;border-radius:12px;background:rgba(0,0,0,.3);border:1px dashed var(--line);font:600 14px/1.55 var(--f-ui);color:var(--diep)}
`;document.head.appendChild(s)}
function dom(){css();const hud=document.getElementById('hud'),app=document.getElementById('app');
  if(!document.getElementById('twBan')&&hud){const d=document.createElement('div');d.id='twBan';d.className='ghost';d.hidden=true;d.innerHTML='<div class="band"><div class="t1" id="twB1"></div><div class="t2" id="twB2"></div><div class="t3" id="twB3"></div></div>';hud.appendChild(d)}
  if(!document.getElementById('twRes')&&app){const s=document.createElement('section');s.id='twRes';s.className='screen';s.hidden=true;s.setAttribute('role','dialog');s.setAttribute('aria-modal','true');s.innerHTML='<div class="twcard lac" id="twCard"></div>';app.appendChild(s)}}
let banT=null;
function banner(P){dom();const el=document.getElementById('twBan');
  document.getElementById('twB1').textContent='VƯỢT THÁP · '+BAN_TIERS[P.tier].toUpperCase();
  document.getElementById('twB2').textContent='Tầng '+P.n;
  const goal=P.boss?`Hạ Ảo Ảnh ${ET[P.bt].name}`:P.mini?`Hạ ${P.waves} đợt quái và Thủ Lĩnh`:`Hạ ${P.waves} đợt quái`;
  document.getElementById('twB3').textContent=goal+` trong ${P.time} giây`+(P.mods.length?' · '+P.mods.map(m=>MODS[m].n).join(' · '):'');
  el.hidden=false;clearTimeout(banT);
  if(anim&&!REDUCED){anim.killTweensOf(el);anim.fromTo(el,{autoAlpha:0,scaleY:0.3},{autoAlpha:1,scaleY:1,duration:0.3,ease:'power3.out'});anim.fromTo('#twB2',{letterSpacing:'0.3em'},{letterSpacing:'0.02em',duration:0.9,ease:'power2.out'});anim.to(el,{autoAlpha:0,delay:2.2,duration:0.35,onComplete:()=>el.hidden=true})}
  else banT=setTimeout(()=>el.hidden=true,2600)}

/* biểu tượng tài nguyên */
const ICO={
  gold:'<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="6.5" fill="#c08a2a"/><circle cx="7.4" cy="7.4" r="4.8" fill="#ffd23a"/></svg>',
  ore:'<svg viewBox="0 0 16 16"><path d="M8 1l6 6-3 7H5L2 7z" fill="#4a6a8a"/><path d="M8 2l4 5-4 2z" fill="#9fd8ff"/></svg>',
  cq:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#1d2f5a"/><path d="M12 4c3 3 5 5 5 8a5 5 0 01-10 0c0-1.6.8-3 2-4 0 2 1 3 2 3 0-3-1-5 1-7z" fill="#8ab8ff"/><circle cx="12" cy="13" r="2" fill="#e8f2ff"/></svg>',
  tq:'<svg viewBox="0 0 24 24"><path d="M4 5h11a3 3 0 013 3v11H7a3 3 0 01-3-3z" fill="#e8d8a8"/><path d="M18 8h2v9a3 3 0 01-3 3" fill="none" stroke="#8a6a3a" stroke-width="1.6"/><path d="M7 9h8M7 12h8M7 15h5" stroke="#7a2a1a" stroke-width="1.5"/></svg>',
  charm:'<svg viewBox="0 0 24 24"><rect x="6" y="3" width="12" height="18" rx="1" fill="#e8d8a8"/><path d="M9 7h6M12 7v10M9 12h6M9 16l3-2 3 2" stroke="#c8361f" stroke-width="1.6" fill="none"/></svg>',
  potHP:'<svg viewBox="0 0 24 24"><path d="M9 3h6v3l3 4v9a2 2 0 01-2 2H8a2 2 0 01-2-2v-9l3-4z" fill="#d93a2a"/></svg>',
  tower:'<svg viewBox="0 0 64 86" aria-hidden="true"><ellipse cx="32" cy="82" rx="26" ry="4" fill="rgba(0,0,0,.4)"/><rect x="10" y="72" width="44" height="9" fill="#8a8272"/><g fill="#e3c88a"><rect x="16" y="58" width="32" height="14"/><rect x="19" y="44" width="26" height="12"/><rect x="22" y="31" width="20" height="11"/><rect x="25" y="19" width="14" height="10"/></g><g fill="#2f6a5a"><path d="M8 60h48l-6-6H14z"/><path d="M11 46h42l-5-5H16z"/><path d="M14 33h36l-5-5H19z"/><path d="M17 21h30l-4-5H21z"/></g><g fill="#3a2416"><rect x="29" y="63" width="6" height="9" rx="3"/><rect x="29.5" y="48" width="5" height="8" rx="2.5"/><rect x="30" y="34" width="4" height="7" rx="2"/></g><path d="M32 16V3" stroke="#e8c35a" stroke-width="2.4"/><circle cx="32" cy="3" r="2.6" fill="#ffd96a"/><g fill="#ffd96a"><circle cx="32" cy="8" r="2.2"/><circle cx="32" cy="12" r="1.6"/></g></svg>'};
const RES_LABEL={gold:'vàng',ore:'Huyền Thiết',cq:'Chân Khí',tq:'Tàn Quyển',charm:'Bùa Bảo Hộ',potHP:'Bình Kim Sang'};
function rewHtml(list){return list.map(([k,v])=>{if(k==='item'){if(typeof v==='number')return`<div class="wide">${itemSvg('vk',RARITY[v].color)}<span style="color:${RARITY[v].color}">Trang bị ${RARITY[v].name} trở lên</span></div>`;
    return`<div class="wide"><span class="iframe sm" style="--rc:${RARITY[v.rar].color};flex:none">${itemImg(v)}</span><span style="color:${RARITY[v.rar].color}">${esc(itemName(v))}</span></div>`}
  return`<div>${ICO[k]}<span>+${fmtFull(v)} ${RES_LABEL[k]}</span></div>`}).join('')}
function rewList(r){const L=[['gold',r.gold],['ore',r.ore],['cq',r.cq]];if(r.tq)L.push(['tq',r.tq]);if(r.charm)L.push(['charm',r.charm]);if(r.potHP)L.push(['potHP',r.potHP]);if(r.item)L.push(['item',r.item]);return L}
const fmtT=s=>{s=Math.max(0,Math.ceil(s));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};

function showRes(){dom();for(const id of['twBan','bossIntro','b2ph']){const x=document.getElementById(id);if(x){if(anim)anim.killTweensOf(x);x.hidden=true}}const L=VT.last,el=document.getElementById('twRes'),card=document.getElementById('twCard'),t=TS(),nx=t.best+1,np=plan(nx);
  G.paused=true;G.input.atk=false;
  const ms=L.n%10===0?'Mốc boss vượt qua!':L.n%5===0?'Hạ được Thủ Lĩnh!':'';
  card.innerHTML=`<div class="seal"><div><small>TẦNG</small><b>${L.n}</b></div></div><h3>Vượt Tầng ${L.n}</h3>
    <p class="sub">${ms?ms+' · ':''}Thời gian ${fmtT(L.t)} · Cao nhất: Tầng ${t.best}</p>
    ${L.got&&L.got.length?`<div class="twrew">${rewHtml(L.got)}</div>`:''}
    <p class="sub" style="margin-top:10px">Kế tiếp: Tầng ${nx}${np.boss?' · Boss '+esc(ET[np.bt].name):np.mini?' · Thủ Lĩnh':''}${np.mods.length?' · '+np.mods.map(m=>MODS[m].n).join(', '):''}</p>
    <div class="row"><button class="btn gold" id="twNext">Lên Tầng ${nx}</button><button class="btn sec" id="twOut">Rời tháp</button></div>`;
  el.hidden=false;document.getElementById('twNext').onclick=()=>{Audio_.play('ui');next()};document.getElementById('twOut').onclick=()=>{Audio_.play('ui');resHide();leave();UI.open('tower')};
  if(anim&&!REDUCED)anim.fromTo(card,{y:30,autoAlpha:0,scale:.96},{y:0,autoAlpha:1,scale:1,duration:.45,ease:'back.out(1.4)'});
  setTimeout(()=>{const b=document.getElementById('twNext');b&&b.focus({preventScroll:true})},60)}
function resHide(){const el=document.getElementById('twRes');if(el&&!el.hidden){el.hidden=true;if(!UI.panel)G.paused=false}}
VT.showRes=showRes;
// phím khi bảng kết quả đang mở: Enter = lên tầng, Esc = rời tháp; chặn các phím khác
document.addEventListener('keydown',e=>{const el=document.getElementById('twRes');if(!el||el.hidden)return;
  if(e.code==='Enter'||e.code==='Space'){e.preventDefault();const b=document.activeElement&&document.activeElement.closest&&document.activeElement.closest('#twRes button');(b||document.getElementById('twNext')).click()}
  else if(e.code==='Escape')document.getElementById('twOut').click();
  e.stopPropagation()},true);

/* ---------------- HUD: thay khung nhiệm vụ bằng thông tin tầng ---------------- */
const _rt=UI.renderTracker;UI.renderTracker=function(){const r=_rt.apply(this,arguments);const q=document.getElementById('qt');if(q)q.classList.toggle('twq',VT.on);if(VT.on){VT.trk=null;trackerTick(true)}return r};
function trackerTick(force){if(!VT.on)return;const P=VT.P,q=document.getElementById('qt');if(!q)return;
  let goal;if(VT.ph==='intro')goal='Chuẩn bị...';else if(VT.ph==='won'||VT.ph==='done')goal='Đã vượt qua!';
  else if(P.boss){const b=G.boss;goal=b&&!b.dead?'Hạ '+b.name:'Dọn sạch quái còn lại'}else{goal=`Đợt ${VT.wave}/${P.waves} · còn ${alive()} quái`}
  const tm=fmtT(VT.left),low=VT.left<=15&&VT.ph==='fight';
  const key=goal+tm+low;if(!force&&key===VT.trk)return;VT.trk=key;
  q.innerHTML=`<div class="qh">VƯỢT THÁP · TẦNG ${P.n}</div><div class="twrow"><div class="qm">${esc(goal)}</div><div class="twtime${low?' low':''}" aria-label="Thời gian còn lại">${tm}</div></div>`+
    (P.mods.length?`<div class="twm">${P.mods.map(m=>`<span class="twchip" style="color:${MODS[m].c}">${MODS[m].n}</span>`).join('')}</div>`:'');}

/* ---------------- bảng Vượt Tháp ---------------- */
const _open=UI.open;UI.open=function(k){if(VT.on&&k==='quest')k='tower';const r=_open.apply(this,[k].concat([].slice.call(arguments,1)));if(k==='tower'&&this.panel==='tower')document.getElementById('shTitle').textContent='Vượt Tháp';return r};
const _np=UI.npcPrompt;UI.npcPrompt=function(n){const r=_np.apply(this,arguments);if(n&&n.act==='tower'){const b=document.getElementById('npcBtn');b.textContent=`${n.name}: Vượt Tháp${FINE?' (E)':''}`}return r};
const _bm=UI.b_map;UI.b_map=function(body){const r=_bm.apply(this,arguments);if(VT.on){const b=body.querySelector('#mCamp');if(b){b.textContent='Rời tháp về thành';b.onclick=()=>{this.close();abandon()}}}return r};
const _dead=UI.dead;UI.dead=function(){const r=_dead.apply(this,arguments);if(VT.on){const m=document.getElementById('deadMsg');if(m)m.textContent=`Thất bại ở Tầng ${VT.P.n}. Không mất vàng, trở về Bảo Tháp.`;
  const bd=document.getElementById('b2Dead');if(bd)bd.hidden=true;if(window.B2)B2.diedInFight=false;if(G.p)G.p.deadT=Math.min(G.p.deadT,2)}return r};

UI.p_tower=function(){const S=G.save,t=TS();
  if(!unlocked())return`<div class="twhead">${ICO.tower}<div><p class="hist"><b style="color:var(--vang2)">Bảo Tháp</b> chứa ảo ảnh của mọi kẻ thù trong sử Việt. Mỗi tầng một trận, càng lên cao càng mạnh, không có đỉnh.</p></div></div>
    <div class="twlock">Tháp Chủ chưa cho vào. Hạ boss chương 1 (Ngư Tinh) hoặc đạt cấp 8 để mở Vượt Tháp. Cấp hiện tại: ${S.lvl}.</div>`;
  let h='';const L=VT.last;
  if(L&&!VT.on){h+=L.win?`<div class="twlast w">Vừa vượt Tầng ${L.n} trong ${fmtT(L.t)}.</div>`:`<div class="twlast l">${L.why==='time'?'Hết giờ':L.why==='quit'?'Bỏ cuộc':'Trọng thương'} ở Tầng ${L.n}. Không mất vàng. Rèn đồ, nâng kỹ năng rồi thử lại.</div>`}
  const day=dayKey(),swept=t.sweepDay===day,sw=sweepRew(t.best);
  h+=`<div class="twhead">${ICO.tower}<div class="twstat"><div><span>Kế tiếp</span><b>${t.best+1}</b></div><div><span>Cao nhất</span><b>${t.best}</b></div><div><span>Quét tháp</span><b style="font-size:15px;font-family:var(--f-ui);font-weight:700;color:${swept?'var(--dim)':'#9fe89a'}">${t.best<1?'Chưa mở':swept?'Đã quét':'Sẵn sàng'}</b></div></div></div>`;
  if(VT.on){const P=VT.P;h+=`<div class="twnext"><h5>Đang leo Tầng ${P.n}</h5><p>Còn ${fmtT(VT.left)}. Bỏ cuộc sẽ tính là thua tầng này (không mất vàng).</p>
    <div class="twact"><button class="btn" id="twCont">Tiếp tục chiến đấu</button><button class="btn sec" id="twQuit">Bỏ cuộc, rời tháp</button></div></div>`;return h}
  const P=plan(t.best+1),r=rewardsFor(P);
  const badge=P.boss?'<span class="twbadge boss">BOSS</span>':P.mini?'<span class="twbadge mini">THỦ LĨNH</span>':'<span class="twbadge">THƯỜNG</span>';
  h+=`<div class="sec"><h4>TẦNG ${P.n} · ${BAN_TIERS[P.tier].toUpperCase()}</h4><div class="twnext"><h5>Tầng ${P.n} ${badge}</h5>
    <p>Quái cấp <b>${P.lv}</b> · ${P.boss?'Ảo Ảnh <b>'+esc(ET[P.bt].name)+'</b> ba giai đoạn':`${P.waves} đợt, mỗi đợt ${P.per} quái${P.mini?', đợt cuối có Thủ Lĩnh':''}`} · giới hạn <b>${P.time} giây</b></p>
    <p>${P.boss?'Thuộc hạ của boss: '+esc((ET[ET[P.bt].minion]||ET[P.types[0]]).name):'Quái: '+P.types.map(k=>esc(ET[k].name)).join(', ')}</p>
    ${P.mods.length?`<div class="twmods">${P.mods.map(m=>`<div><span class="twchip" style="color:${MODS[m].c}">${MODS[m].n}</span><span>${esc(MODS[m].d)}</span></div>`).join('')}</div>`:'<p style="color:var(--dim)">Không có biến thể. Biến thể đổi mỗi tuần.</p>'}
    <h4 style="margin:12px 0 6px;font:700 12px/1 var(--f-ui);color:var(--vang);letter-spacing:.06em">THƯỞNG LẦN ĐẦU</h4><div class="twrew">${rewHtml(rewList(r))}</div>
    <div class="twact"><button class="btn gold" id="twGo">Leo tháp</button>
      <button class="btn sec" id="twSw" ${!sw||swept?'disabled':''}>Quét tháp<small>${!sw?'Vượt ít nhất 1 tầng':swept?'Mai quay lại':'Mỗi ngày một lần'}</small></button></div></div></div>`;
  if(sw)h+=`<div class="sec"><h4>QUÉT THÁP HÔM NAY · THEO TẦNG CAO NHẤT ${t.best}</h4><div class="twrew">${rewHtml(rewList(sw))}</div></div>`;
  // mốc kế tiếp
  const nb=Math.ceil((t.best+1)/10)*10,nr=rewardsFor(plan(nb));
  h+=`<div class="sec"><h4>MỐC KẾ TIẾP · TẦNG ${nb}</h4><p class="hist">Boss Ảo Ảnh ${esc(ET[plan(nb).bt]?ET[plan(nb).bt].name:'')}: +${nr.tq} Tàn Quyển, +${fmtFull(nr.cq)} Chân Khí, +${nr.charm} Bùa Bảo Hộ, trang bị Truyền Thuyết. Mỗi 5 tầng thêm 1 Tàn Quyển.</p></div>`;
  // bảng kỷ lục theo phái
  const all=recAll();if(t.best>0){const cur=all[S.cls];if(!cur||cur.f<t.best)all[S.cls]={f:t.best,name:S.name,lvl:S.lvl}}
  h+=`<div class="sec"><h4>KỶ LỤC THEO PHÁI (MÁY NÀY)</h4><table class="twrec"><thead><tr><th>Phái</th><th>Hiệp khách</th><th>Tầng</th></tr></thead><tbody>${CLASSES.map(c=>{const r=all[c.id];
    return`<tr class="${c.id===S.cls?'me':''}"><td><span class="dot" style="background:${c.color}"></span>${esc(c.name)}</td><td>${r?esc(r.name)+' · cấp '+r.lvl:'<span style="color:var(--dim)">Chưa có</span>'}</td><td>${r?r.f:'–'}</td></tr>`}).join('')}</tbody></table></div>`;
  h+=`<p class="hist" style="color:var(--dim)">Chết hoặc hết giờ chỉ thua tầng, không mất vàng. Mỗi tầng hồi đầy máu khi vào. Tự đánh vẫn hoạt động trong tháp.</p>`;
  return h};
UI.b_tower=function(body){const on=(id,fn)=>{const b=body.querySelector(id);if(b)b.onclick=fn};
  on('#twGo',()=>{Audio_.play('ui');enter()});
  on('#twSw',()=>{if(sweep())this.render()});
  on('#twCont',()=>this.close());on('#twQuit',()=>{this.close();abandon()})};
function sweep(){const t=TS();if(!t)return false;const d=dayKey();
  if(t.best<1){UI.toast('Vượt ít nhất một tầng để mở Quét tháp.','warn');return false}
  if(t.sweepDay===d){UI.toast('Hôm nay đã quét tháp. Ngày mai quay lại.','warn');return false}
  const r=sweepRew(t.best);t.sweepDay=d;t.sweeps++;
  giveRes('gold',r.gold,'tower_sweep');giveRes('ore',r.ore,'tower_sweep');giveRes('cq',r.cq,'tower_sweep');if(r.tq)giveRes('tq',r.tq,'tower_sweep');if(r.charm)giveRes('charm',r.charm,'tower_sweep');giveRes('potHP',r.potHP,'tower_sweep');G.dirty.pot=1;
  UI.toast(`Quét tháp: +${fmt(r.gold)} vàng, +${r.ore} Huyền Thiết, +${fmt(r.cq)} Chân Khí${r.tq?', +'+r.tq+' Tàn Quyển':''}`,'quest');Audio_.play('loot',3);saveGame();return true}
VT.sweep=sweep;

/* khởi tạo lưu khi vào game (lưu cũ không có trường tower vẫn chạy) */
const _sg=startGame;startGame=function(){const r=_sg.apply(this,arguments);TS();return r};
setTimeout(()=>{try{dom()}catch(e){}},0);
})();

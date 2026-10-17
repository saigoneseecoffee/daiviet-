/* ============ BOSS2: boss ba giai đoạn, Ngũ Hành, độ khó ============
   Mô-đun độc lập, chỉ dùng điểm nối HK và ghi đè hàm toàn cục (bọc hàm gốc).
   Ghi đè: updateBoss, updateEnemies, enemyAct, respawn, autoPlay, drawZones, drawEnemy, drawEnemyTele,
           showStoryCard, UI.p_quest, UI.bossIntro, UI.dead */
(function(){
const B2=window.B2={hz:[],tm:[],fx:[],stats:{hits:[],fights:[]},dl:[]};

/* ================= NGŨ HÀNH ================= */
const NH={
  kim:{n:'Kim',c:'#f2d675',d:'#5e4a12'},
  moc:{n:'Mộc',c:'#7fd85e',d:'#1d4a17'},
  thuy:{n:'Thủy',c:'#5cb8ff',d:'#10305a'},
  hoa:{n:'Hỏa',c:'#ff6b3d',d:'#5e1406'},
  tho:{n:'Thổ',c:'#d9a463',d:'#4e3210'}};
const NH_ORD=['kim','thuy','moc','hoa','tho'];
const KHAC={kim:'moc',moc:'tho',tho:'thuy',thuy:'hoa',hoa:'kim'};
const BIKHAC={};for(const k in KHAC)BIKHAC[KHAC[k]]=k;
const CLS_EL={kiem:'kim',cung:'moc',giao:'thuy',dao:'hoa',con:'tho',phap:'moc'};
const FAC_EL={phi:'tho',trieu:'kim',han:'thuy',nguyen:'hoa',minh:'kim',thanh:'hoa',donghan:'tho',luong:'kim',suquan:'moc',tong:'kim',nguyenthuy:'thuy',xiem:'moc'};
const ET_EL={soi:'moc',ran:'moc',lon:'tho',khi:'tho',ho:'moc',cungtrieu:'moc',linhtrieu:'kim',casau:'thuy',cunghan:'moc',linhhan:'kim',thuybinh:'thuy',
  linhnguyen:'kim',soithao:'moc',kybinh:'hoa',cungky:'hoa',linhminh:'kim',cungminh:'moc',phaominh:'hoa',baoden:'thuy',linhthanh:'kim',cungthanh:'moc',kythanh:'hoa',hoathanh:'hoa',
  ngutinh:'thuy',bachke:'kim',hoangthao:'thuy',toado:'hoa',lieuthang:'moc',samnghidong:'hoa',b2_hoadan:'hoa',
  linhdh:'kim',nodh:'moc',khiendh:'tho',linhluong:'kim',cungluong:'moc',kyluong:'hoa',linhsq:'tho',giaosq:'kim',cungsq:'moc',
  linhtong:'kim',notong:'moc',kytong:'hoa',phaotong:'hoa',thuynguyen:'thuy',cungthuy:'moc',linhxiem:'kim',giaoxiem:'thuy',cungxiem:'moc',phaoxiem:'hoa',
  todinh:'tho',tranbatien:'kim',docanhthac:'tho',quachquy:'kim',omanhi:'thuy',chieutang:'moc'};
const ADV_OUT=1.25,DIS_OUT=0.8,ADV_IN=0.82,DIS_IN=1.2;
function elOf(e){return e.el||(e.el=ET_EL[e.type]||(e.def.fac&&FAC_EL[e.def.fac])||'tho')}
function pEl(){return G.p&&G.p.cls?CLS_EL[G.p.cls.id]:null}
function rel(a,b){if(!a||!b)return 0;if(KHAC[a]===b)return 1;if(KHAC[b]===a)return -1;return 0}
/* ký hiệu (khung 24x24) dùng chung cho canvas (Path2D) và SVG */
const GLYPH={
  kim:'M12 4.2L17.6 12 12 19.8 6.4 12Z',
  moc:'M12 4C17.5 7 18.6 14.6 12 20 5.4 14.6 6.5 7 12 4Z',
  thuy:'M12 4C14.6 8.4 17.6 11.4 17.6 14.6A5.6 5.6 0 0 1 6.4 14.6C6.4 11.4 9.4 8.4 12 4Z',
  hoa:'M12 3.4C13.8 7 17.6 9 17 14 16.5 18 14 20 12 20 9 20 6.6 18 7 14 7.3 11.4 8.7 10.3 9.8 8.4 10.4 10.4 11 11.2 12 11.4 12.6 9.2 12.6 6.4 12 3.4Z',
  tho:'M4.2 18.4L9.8 8.2 12.8 12.8 15 9.6 19.8 18.4Z'};
const GLYPH2={kim:'M12 4.2V19.8M6.4 12H17.6',moc:'M12 6.5V19',thuy:'',hoa:'',tho:''};
function elSvg(el,sz){const E=NH[el];sz=sz||18;
  return `<svg class="b2ico" viewBox="0 0 24 24" width="${sz}" height="${sz}" aria-label="Hệ ${E.n}"><circle cx="12" cy="12" r="11" fill="${E.d}" stroke="${E.c}" stroke-width="1.6"/><path d="${GLYPH[el]}" fill="${E.c}"/>${GLYPH2[el]?`<path d="${GLYPH2[el]}" stroke="${E.d}" stroke-width="1.1" fill="none" opacity=".7"/>`:''}</svg>`}
const _ico={};
function elIcon(el){let c=_ico[el];if(c)return c;c=_ico[el]=document.createElement('canvas');c.width=c.height=72;const g=c.getContext('2d');g.scale(3,3);const E=NH[el];
  g.fillStyle='rgba(0,0,0,0.45)';g.beginPath();g.arc(12,12.8,11.6,0,TAU);g.fill();
  g.fillStyle=E.d;g.strokeStyle=E.c;g.lineWidth=1.6;g.beginPath();g.arc(12,12,10.8,0,TAU);g.fill();g.stroke();
  g.fillStyle=E.c;g.fill(new Path2D(GLYPH[el]));if(GLYPH2[el]){g.strokeStyle=E.d;g.globalAlpha=0.7;g.lineWidth=1.1;g.stroke(new Path2D(GLYPH2[el]))}return c}
B2.NH=NH;B2.elOf=elOf;B2.CLS_EL=CLS_EL;

/* ================= HẰNG SỐ ĐỘ KHÓ ================= */
/* 12 chương. Máu/công quái đã chuẩn hóa theo cấp ở chapters.js (gEq); các hệ số dưới giữ độ khó từng boss
   bằng bản 6 chương ở cùng vị trí, chương chèn vào được nội suy giữa hai chương cũ kề bên. */
const BOSS_HP=[4.7,3.35,3.0,2.7,2.4,2.5,2.55,2.5,2.6,2.6,2.65,2.65];   // nhân máu boss theo chương
const BOSS_ATK=[1.08,0.9,0.9,0.89,0.88,0.84,0.8,0.76,0.72,0.69,0.65,0.62];  // nhân công boss theo chương (1x ≈ 10–14% máu người chơi)
const MOB_ATKS=[1.21,1.16,1.0,0.99,0.99,0.98,0.96,0.93,0.94,0.94,0.93,0.91],MOB_ATK=mi=>MOB_ATKS[Math.min(mi,MOB_ATKS.length-1)];                 // quái thường cào máu
const PH_T=[1,0.66,0.33];
const REACT=0.3;                               // bot phản xạ sau 30% thời gian cảnh báo

/* ================= TIỆN ÍCH ================= */
const AR=()=>G.W.arena;
const hexA=(h,a)=>{const n=parseInt(h.slice(1,7),16);return`rgba(${n>>16},${(n>>8)&255},${n&255},${a})`};
const ellIn=(dx,dy,r)=>r>0&&(dx*dx+dy*dy/0.6724)<r*r;
const ellD=(dx,dy)=>Math.sqrt(dx*dx+dy*dy/0.6724);
function inArena(x,y,pad){const a=AR();return ellIn(x-a.x,y-a.y,a.r-(pad||0))}
function rpt(frac){const a=AR(),ang=Math.random()*TAU,r=Math.sqrt(Math.random())*a.r*(frac||0.8);return{x:a.x+Math.cos(ang)*r,y:a.y+Math.sin(ang)*r*0.82}}
function clampArena(o,pad){const a=AR(),dx=o.x-a.x,dy=(o.y-a.y)/0.82,d=Math.hypot(dx,dy),R=a.r-(pad||0);if(d>R){o.x=a.x+dx/d*R;o.y=a.y+dy/d*R*0.82}return o}
const angTo=(a,b)=>Math.atan2(b.y-a.y,b.x-a.x);
function later(t,fn){B2.tm.push({t,fn})}
function tone(f,d,ty,v,sl,dl){try{Audio_.tone(f,d,ty,v,sl,dl)}catch(e){}}
function snd(n){try{Audio_.play(n)}catch(e){}}
function warnSnd(big){tone(big?330:520,big?0.5:0.25,'sawtooth',big?0.07:0.05,big?250:430)}
function hornSnd(){tone(147,1.0,'sawtooth',0.09,165);tone(220,0.9,'triangle',0.06,247,0.1)}

/* ================= DẤU HIỆU NGUY HIỂM (hazard) =================
   sh: circle|ring|rect|cone|allbut · t/dur: cảnh báo · dmg: sát thương khi nổ · linger: vùng tồn tại sau khi nổ */
function hz(o){o.t=0;if(o.src&&!o.lv)o.lv=o.src.lv;o.lv=o.lv||1;B2.hz.push(o);return o}
function inHz(h,x,y,pad){
  switch(h.sh){
    case'circle':return ellIn(x-h.x,y-h.y,h.r+pad);
    case'ring':{const d=ellD(x-h.x,y-h.y);return d>h.r-pad&&d<h.r2+pad}
    case'rect':{const c=Math.cos(h.a),s=Math.sin(h.a),dx=x-h.x,dy=y-h.y,u=dx*c+dy*s,v=-dx*s+dy*c;return u>-pad-4&&u<h.len+pad&&Math.abs(v)<h.w/2+pad}
    case'cone':{const d=Math.hypot(x-h.x,y-h.y);if(d>h.r+pad)return false;if(d<pad+12)return true;return Math.abs(angDiff(h.a,Math.atan2(y-h.y,x-h.x)))<h.arc/2+pad/d}
    case'cones':return h.as.some(a=>{const d=Math.hypot(x-h.x,y-h.y);if(d>h.r+pad)return false;if(d<pad+12)return true;return Math.abs(angDiff(a,Math.atan2(y-h.y,x-h.x)))<h.arc/2+pad/d});
    case'allbut':{const a=AR();if(!ellIn(x-a.x,y-a.y,a.r+220))return false;for(const s of h.safe)if(ellIn(x-s.x,y-s.y,s.r-pad))return false;return true}
  }return false}
function fireHz(h){const p=G.p;
  if(h.dmg&&!h.lateHit&&G.state==='play'&&p.hp>0&&inHz(h,p.x,p.y,6)){hurtPlayer(h.dmg,h.lv,h.src);B2.stats.hits.push([G.save.map,h.kind||h.sh,Math.round(h.dmg)]);if(h.onHit)h.onHit(h)}
  if(h.onFire)h.onFire(h);
  boomVis(h)}
function updHz(dt){
  const p=G.p;
  for(let i=B2.hz.length-1;i>=0;i--){const h=B2.hz[i];
    if(h.delay>0){h.delay-=dt;continue}
    h.t+=dt;if(h.upd)h.upd(h,dt);
    if(!h.fired&&h.t>=h.dur){h.fired=true;fireHz(h);h.lt=0}
    if(h.fired){
      if(h.linger>0){h.lt+=dt;
        if(G.state==='play'&&p.hp>0&&inHz(h,p.x,p.y,4)){
          if(h.tdmg){h.tt=(h.tt||0)-dt;if(h.tt<=0){h.tt=0.5;hurtPlayer(h.tdmg,h.lv,h.src)}}
          if(h.pull){const a=Math.atan2(h.y-p.y,h.x-p.x),d=Math.hypot(h.y-p.y,h.x-p.x);if(d>8&&!p.dash)moveEnt(G.W,p,Math.cos(a)*h.pull*dt,Math.sin(a)*h.pull*dt)}
          if(h.slow)B2.slowNow=Math.max(B2.slowNow,h.slow)}
        if(h.lt>=h.linger)B2.hz.splice(i,1)}
      else B2.hz.splice(i,1)}
  }}
function clearHz(keepPersistent){B2.hz=keepPersistent?B2.hz.filter(h=>h.keep&&h.fired):[];B2.tm=[];B2.fx=[]}

/* --------- vẽ cảnh báo --------- */
function hzPath(h,k){cx.beginPath();
  switch(h.sh){
    case'circle':cx.ellipse(h.x,h.y,Math.max(0.1,h.r*k),Math.max(0.1,h.r*0.82*k),0,0,TAU);break;
    case'ring':{const r2=h.r+(h.r2-h.r)*k;cx.ellipse(h.x,h.y,r2,r2*0.82,0,0,TAU);cx.ellipse(h.x,h.y,h.r,h.r*0.82,0,0,TAU);break}
    case'rect':{const c=Math.cos(h.a),s=Math.sin(h.a),L=h.len*k,w=h.w/2;cx.moveTo(h.x-s*w,h.y+c*w);cx.lineTo(h.x+c*L-s*w,h.y+s*L+c*w);cx.lineTo(h.x+c*L+s*w,h.y+s*L-c*w);cx.lineTo(h.x+s*w,h.y-c*w);cx.closePath();break}
    case'cone':cx.moveTo(h.x,h.y);cx.arc(h.x,h.y,Math.max(0.1,h.r*k),h.a-h.arc/2,h.a+h.arc/2);cx.closePath();break;
    case'cones':for(const a of h.as){cx.moveTo(h.x,h.y);cx.arc(h.x,h.y,Math.max(0.1,h.r*k),a-h.arc/2,a+h.arc/2);cx.closePath()}break;
  }}
function drawHz(h){
  if(h.delay>0)return;
  if(h.fired){if(h.linger)drawLinger(h);return}
  if(h.hidden)return;
  const k=clamp(h.t/h.dur,0,1),col=h.col||'#ff4a2a',late=h.dur-h.t<0.28,blink=late&&((G.t*16)%1<0.5);
  cx.save();cx.lineJoin='round';
  if(h.sh==='allbut'){const a=AR();
    cx.beginPath();cx.ellipse(a.x,a.y,a.r+40,(a.r+40)*0.82,0,0,TAU);for(const s of h.safe)cx.ellipse(s.x,s.y,s.r,s.r*0.82,0,0,TAU);
    cx.fillStyle=hexA(col,0.12+0.3*k);cx.fill('evenodd');cx.strokeStyle=blink?'#fff':hexA(col,0.8);cx.lineWidth=2;cx.stroke();
    for(const s of h.safe){const pu=1+Math.sin(G.t*6)*0.06;
      cx.fillStyle='rgba(120,255,170,0.22)';cx.beginPath();cx.ellipse(s.x,s.y,s.r,s.r*0.82,0,0,TAU);cx.fill();
      cx.strokeStyle='#8affc0';cx.lineWidth=3.5;cx.stroke();cx.strokeStyle='rgba(140,255,190,0.5)';cx.lineWidth=2;cx.beginPath();cx.ellipse(s.x,s.y,s.r*pu+8,(s.r*pu+8)*0.82,0,0,TAU);cx.stroke();
      if(s.label){cx.font='800 12px "Be Vietnam Pro",system-ui,sans-serif';cx.textAlign='center';cx.lineWidth=3;cx.strokeStyle='rgba(10,30,15,0.9)';cx.strokeText(s.label,s.x,s.y-s.r*0.82-8);cx.fillStyle='#b8ffd6';cx.fillText(s.label,s.x,s.y-s.r*0.82-8)}}
    cx.restore();return}
  if(h.draw0)h.draw0(h,k);
  hzPath(h,1);cx.fillStyle=hexA(col,0.1+0.14*k);cx.fill('evenodd');cx.strokeStyle=blink?'#ffffff':hexA(col,0.95);cx.lineWidth=late?3.2:2.4;cx.stroke();
  hzPath(h,k);cx.fillStyle=hexA(col,0.22+0.12*k);cx.fill('evenodd');
  if(h.draw)h.draw(h,k);
  cx.restore()}
function drawLinger(h){const a=Math.min(1,h.lt*4,(h.linger-h.lt)*2);cx.save();
  switch(h.kind){
    case'whirl':{cx.translate(h.x,h.y);cx.scale(1,0.82);const gr=cx.createRadialGradient(0,0,4,0,0,h.r);gr.addColorStop(0,`rgba(10,40,70,${0.55*a})`);gr.addColorStop(1,`rgba(40,140,200,${0.12*a})`);
      cx.fillStyle=gr;cx.beginPath();cx.arc(0,0,h.r,0,TAU);cx.fill();cx.lineCap='round';
      for(let j=0;j<4;j++){const st=-G.t*3+j*TAU/4;cx.strokeStyle=`rgba(190,240,255,${0.55*a})`;cx.lineWidth=2.5;cx.beginPath();cx.arc(0,0,h.r*(0.35+j*0.15),st,st+2.2);cx.stroke()}
      cx.strokeStyle=`rgba(120,210,255,${0.6*a})`;cx.lineWidth=2;cx.beginPath();cx.arc(0,0,h.r,0,TAU);cx.stroke();break}
    case'fire':{cx.globalAlpha=a;const gr=cx.createRadialGradient(h.x,h.y,h.r*0.1,h.x,h.y,h.r);gr.addColorStop(0,'rgba(255,170,60,0.32)');gr.addColorStop(0.8,'rgba(220,60,10,0.3)');gr.addColorStop(1,'rgba(150,30,0,0)');
      cx.fillStyle=gr;cx.beginPath();cx.ellipse(h.x,h.y,h.r,h.r*0.82,0,0,TAU);cx.fill();
      for(let i=0;i<9;i++){const an=i/9*TAU+h.x,rr=h.r*(0.25+((i*37)%10)/14),px=h.x+Math.cos(an)*rr,py=h.y+Math.sin(an)*rr*0.8,fh=10+Math.sin(G.t*11+i*2)*4;
        cx.fillStyle=i%2?'#ffb347':'#ff6a1a';cx.beginPath();cx.moveTo(px-4,py);cx.quadraticCurveTo(px-3,py-fh,px,py-fh-5);cx.quadraticCurveTo(px+3,py-fh,px+4,py);cx.fill()}
      if(Math.random()<0.3)addPart(h.x+rand(-h.r,h.r)*0.7,h.y+rand(-h.r,h.r)*0.5,0,rand(-70,-30),0.5,'#ffb347',3,-30);break}
    case'mud':{cx.globalAlpha=a;cx.fillStyle='rgba(70,48,24,0.7)';cx.beginPath();cx.ellipse(h.x,h.y,h.r,h.r*0.82,0,0,TAU);cx.fill();
      cx.fillStyle='rgba(110,80,44,0.6)';cx.beginPath();cx.ellipse(h.x-h.r*0.2,h.y-h.r*0.12,h.r*0.6,h.r*0.4,0.3,0,TAU);cx.fill();
      cx.strokeStyle='rgba(160,120,70,0.8)';cx.lineWidth=2;cx.setLineDash([7,6]);cx.beginPath();cx.ellipse(h.x,h.y,h.r,h.r*0.82,0,0,TAU);cx.stroke();cx.setLineDash([]);
      for(let i=0;i<4;i++){const ph=(G.t*0.8+i*0.27)%1,bx=h.x+Math.cos(i*2.3+h.x)*h.r*0.5,by=h.y+Math.sin(i*1.7)*h.r*0.35;cx.strokeStyle=`rgba(200,170,120,${0.6*(1-ph)})`;cx.lineWidth=1.5;cx.beginPath();cx.ellipse(bx,by,3+ph*8,(3+ph*8)*0.6,0,0,TAU);cx.stroke()}
      cx.font='700 11px "Be Vietnam Pro",system-ui,sans-serif';cx.textAlign='center';cx.fillStyle='rgba(240,210,160,0.85)';cx.fillText('Bùn lầy',h.x,h.y+4);break}
    case'stakefield':{cx.globalAlpha=a;cx.fillStyle='rgba(20,60,80,0.35)';cx.beginPath();cx.ellipse(h.x,h.y,h.r,h.r*0.82,0,0,TAU);cx.fill();
      cx.strokeStyle='rgba(160,220,230,0.55)';cx.lineWidth=2;cx.setLineDash([5,7]);cx.stroke();cx.setLineDash([]);
      for(let i=0;i<9;i++){const an=i*2.39996,rr=h.r*0.75*Math.sqrt((i+0.5)/9),px=h.x+Math.cos(an)*rr,py=h.y+Math.sin(an)*rr*0.8;cx.fillStyle='#4a3020';cx.fillRect(px-1.5,py-5,3,5);cx.fillStyle='#cfd8dc';cx.beginPath();cx.moveTo(px-2,py-5);cx.lineTo(px,py-9);cx.lineTo(px+2,py-5);cx.fill()}
      break}
    case'stakes':{for(let i=0;i<16;i++){const an=i*2.39996,rr=h.r*0.85*Math.sqrt((i+0.5)/16),px=h.x+Math.cos(an)*rr,py=h.y+Math.sin(an)*rr*0.8;G.fx.length<160&&0;
        const hh=Math.min(1,h.lt*8)*30;cx.globalAlpha=a;const gr=cx.createLinearGradient(px-4,0,px+4,0);gr.addColorStop(0,'#3e2614');gr.addColorStop(0.5,'#8a5a30');gr.addColorStop(1,'#4a2e18');
        cx.fillStyle=gr;cx.beginPath();cx.moveTo(px-4,py);cx.lineTo(px-2.6,py-hh*0.72);cx.lineTo(px+2.6,py-hh*0.72);cx.lineTo(px+4,py);cx.closePath();cx.fill();cx.fillStyle='#d8e2e6';cx.beginPath();cx.moveTo(px-2.6,py-hh*0.72);cx.lineTo(px,py-hh);cx.lineTo(px+2.6,py-hh*0.72);cx.fill()}break}
    case'chain':{cx.globalAlpha=a;cx.fillStyle='rgba(40,40,52,0.35)';cx.beginPath();cx.ellipse(h.x,h.y,h.r,h.r*0.82,0,0,TAU);cx.fill();cx.strokeStyle='rgba(170,170,190,0.85)';cx.lineWidth=2.5;
      for(let i=0;i<10;i++){const an=i/10*TAU+G.t*0.4;cx.beginPath();cx.ellipse(h.x+Math.cos(an)*h.r*0.86,h.y+Math.sin(an)*h.r*0.7,6,3.5,an+Math.PI/2,0,TAU);cx.stroke()}
      cx.font='700 11px "Be Vietnam Pro",system-ui,sans-serif';cx.textAlign='center';cx.fillStyle='rgba(220,220,235,0.9)';cx.fillText('Gông xiềng',h.x,h.y+4);break}
    case'drum':{const rd=h.cdT<=0,pu=1+Math.sin(G.t*5)*0.05;cx.fillStyle=rd?'rgba(120,255,170,0.16)':'rgba(120,120,120,0.12)';cx.beginPath();cx.ellipse(h.x,h.y,h.r*pu,h.r*0.82*pu,0,0,TAU);cx.fill();
      cx.strokeStyle=rd?'#8affc0':'rgba(180,180,170,0.6)';cx.lineWidth=3;cx.stroke();
      if(h.prog>0){cx.strokeStyle='#ffe08a';cx.lineWidth=5;cx.beginPath();cx.ellipse(h.x,h.y,h.r+6,(h.r+6)*0.82,0,-Math.PI/2,-Math.PI/2+TAU*Math.min(1,h.prog/1.1));cx.stroke()}
      cx.fillStyle='#6a4a1a';cx.beginPath();cx.ellipse(h.x,h.y-4,26,10,0,0,Math.PI);cx.fill();cx.fillRect(h.x-26,h.y-16,52,12);cx.fillStyle='#c9a24e';cx.beginPath();cx.ellipse(h.x,h.y-16,26,10,0,0,TAU);cx.fill();
      cx.strokeStyle='#7a5a1a';cx.lineWidth=1.2;for(let r=5;r<26;r+=6){cx.beginPath();cx.ellipse(h.x,h.y-16,r,r*0.38,0,0,TAU);cx.stroke()}cx.fillStyle='#ffe08a';cx.beginPath();cx.arc(h.x,h.y-16,3,0,TAU);cx.fill();
      cx.font='800 12px "Be Vietnam Pro",system-ui,sans-serif';cx.textAlign='center';cx.lineWidth=3;cx.strokeStyle='rgba(10,30,15,0.9)';const lb=rd?'Trống Đồng':'Trống Đồng · '+Math.ceil(h.cdT);cx.strokeText(lb,h.x,h.y-h.r*0.82-14);cx.fillStyle=rd?'#b8ffd6':'#d8d0c0';cx.fillText(lb,h.x,h.y-h.r*0.82-14);break}
    case'mound':{cx.fillStyle='rgba(0,0,0,0.25)';cx.beginPath();cx.ellipse(h.x+4,h.y+8,h.r,h.r*0.78,0,0,TAU);cx.fill();cx.fillStyle='#8a7048';cx.beginPath();cx.ellipse(h.x,h.y,h.r,h.r*0.8,0,0,TAU);cx.fill();
      cx.fillStyle='#6f8a48';cx.beginPath();cx.ellipse(h.x-4,h.y-6,h.r*0.82,h.r*0.62,0,0,TAU);cx.fill();cx.strokeStyle='rgba(140,255,190,0.55)';cx.lineWidth=2;cx.setLineDash([8,6]);cx.beginPath();cx.ellipse(h.x,h.y,h.r,h.r*0.8,0,0,TAU);cx.stroke();cx.setLineDash([]);
      cx.strokeStyle='rgba(30,60,20,0.6)';cx.lineWidth=1.5;for(let i=0;i<8;i++){const an=i*2.39996,rr=h.r*0.6*Math.sqrt((i+0.5)/8),px=h.x+Math.cos(an)*rr,py=h.y-6+Math.sin(an)*rr*0.7;cx.beginPath();cx.moveTo(px,py);cx.lineTo(px-2,py-7);cx.moveTo(px,py);cx.lineTo(px+3,py-6);cx.stroke()}break}
    case'pillar':{cx.fillStyle='rgba(0,0,0,0.3)';cx.beginPath();cx.ellipse(h.x+6,h.y+4,h.r*1.1,h.r*0.45,0,0,TAU);cx.fill();cx.fillStyle='#5e625c';cx.beginPath();cx.moveTo(h.x-30,h.y);cx.quadraticCurveTo(h.x-36,h.y-70,h.x-12,h.y-120);cx.quadraticCurveTo(h.x+10,h.y-130,h.x+20,h.y-100);cx.quadraticCurveTo(h.x+36,h.y-50,h.x+30,h.y);cx.closePath();cx.fill();
      cx.fillStyle='#8a8e86';cx.beginPath();cx.moveTo(h.x-24,h.y-4);cx.quadraticCurveTo(h.x-28,h.y-70,h.x-10,h.y-112);cx.quadraticCurveTo(h.x+4,h.y-118,h.x+10,h.y-98);cx.quadraticCurveTo(h.x+14,h.y-50,h.x+8,h.y-4);cx.closePath();cx.fill();
      blob(cx,h.x-4,h.y-110,10,'#3b6436');blob(cx,h.x+12,h.y-80,7,'#3b6436');break}
    case'flag':{const cap=h.cap;cx.fillStyle=cap?'rgba(255,230,140,0.14)':'rgba(120,255,170,0.15)';cx.beginPath();cx.ellipse(h.x,h.y,h.r,h.r*0.82,0,0,TAU);cx.fill();cx.strokeStyle=cap?'#ffd23a':'#8affc0';cx.lineWidth=3;cx.stroke();
      if(h.prog>0&&!cap){cx.strokeStyle='#ffe08a';cx.lineWidth=5;cx.beginPath();cx.ellipse(h.x,h.y,h.r+6,(h.r+6)*0.82,0,-Math.PI/2,-Math.PI/2+TAU*Math.min(1,h.prog/2));cx.stroke()}
      cx.strokeStyle='#6a5a3a';cx.lineWidth=2.5;cx.beginPath();cx.moveTo(h.x,h.y);cx.lineTo(h.x,h.y-74);cx.stroke();const wv=Math.sin(G.t*4)*3;
      cx.fillStyle=cap?'#c8361f':'#f4f0e0';cx.beginPath();cx.moveTo(h.x,h.y-74);cx.quadraticCurveTo(h.x+16,h.y-70+wv,h.x+30,h.y-72);cx.lineTo(h.x+30,h.y-52);cx.quadraticCurveTo(h.x+16,h.y-50+wv,h.x,h.y-54);cx.closePath();cx.fill();
      cx.fillStyle='rgba(250,248,236,0.9)';for(let i=0;i<3;i++){cx.beginPath();cx.ellipse(h.x-5+i*4,h.y-80-i*2,2.5,7,0.3,0,TAU);cx.fill()}
      cx.font='800 12px "Be Vietnam Pro",system-ui,sans-serif';cx.textAlign='center';cx.lineWidth=3;cx.strokeStyle='rgba(10,30,15,0.9)';const lb=cap?'Đã chiếm':'Cờ Lau';cx.strokeText(lb,h.x,h.y+h.r*0.82+16);cx.fillStyle=cap?'#ffe08a':'#b8ffd6';cx.fillText(lb,h.x,h.y+h.r*0.82+16);break}
    case'stele':{const e0=G.boss,B=e0&&e0.b2,on=B&&B.poemI===h.idx,done=B&&B.poemI>h.idx;const pu=on?1+Math.sin(G.t*6)*0.08:1;
      if(on){cx.fillStyle='rgba(255,220,100,0.2)';cx.beginPath();cx.ellipse(h.x,h.y,h.r*1.5*pu,h.r*1.2*pu,0,0,TAU);cx.fill();cx.strokeStyle='#ffd23a';cx.lineWidth=3;cx.stroke()}
      cx.fillStyle='rgba(0,0,0,0.3)';cx.beginPath();cx.ellipse(h.x+3,h.y+3,26,9,0,0,TAU);cx.fill();cx.fillStyle='#5e5a52';cx.beginPath();cx.ellipse(h.x,h.y-4,24,9,0,0,TAU);cx.fill();
      cx.fillStyle=on?'#c8b88a':done?'#a8a08a':'#7e7a70';cx.fillRect(h.x-13,h.y-70,26,64);cx.fillStyle='rgba(255,255,255,0.18)';cx.fillRect(h.x-13,h.y-70,8,64);cx.fillStyle='#5a564c';cx.beginPath();cx.moveTo(h.x-16,h.y-68);cx.quadraticCurveTo(h.x,h.y-86,h.x+16,h.y-68);cx.closePath();cx.fill();
      cx.font='800 15px "Be Vietnam Pro",system-ui,sans-serif';cx.textAlign='center';cx.lineWidth=3;cx.strokeStyle='rgba(20,10,5,0.9)';const lb=done?'✓':String(h.idx+1);cx.strokeText(lb,h.x,h.y-34);cx.fillStyle=on?'#fff2b0':'#e8e0c8';cx.fillText(lb,h.x,h.y-34);
      if(on){cx.font='800 12px "Be Vietnam Pro",system-ui,sans-serif';cx.strokeText('Chạm bia',h.x,h.y-94);cx.fillStyle='#ffe08a';cx.fillText('Chạm bia',h.x,h.y-94)}break}
    case'block':{const pu=1+Math.sin(G.t*7)*0.07;cx.fillStyle='rgba(120,255,170,0.22)';cx.beginPath();cx.ellipse(h.x,h.y,h.r*pu,h.r*0.82*pu,0,0,TAU);cx.fill();cx.strokeStyle='#8affc0';cx.lineWidth=3.5;cx.stroke();
      cx.font='800 12px "Be Vietnam Pro",system-ui,sans-serif';cx.textAlign='center';cx.lineWidth=3;cx.strokeStyle='rgba(10,30,15,0.9)';cx.strokeText('Chặn đường',h.x,h.y-h.r*0.82-8);cx.fillStyle='#b8ffd6';cx.fillText('Chặn đường',h.x,h.y-h.r*0.82-8);break}
    default:{cx.globalAlpha=a*0.5;cx.fillStyle=hexA(h.col||'#ff4a2a',0.3);hzPath(h,1);cx.fill()}
  }cx.restore()}
function boomVis(h){
  const col=h.col||'#ff7a3a';
  switch(h.kind){
    case'water':case'wave':{const n=h.sh==='rect'?10:8;for(let i=0;i<n;i++){let x=h.x,y=h.y;if(h.sh==='rect'){const u=Math.random()*h.len,v=rand(-h.w/2,h.w/2);x+=Math.cos(h.a)*u-Math.sin(h.a)*v;y+=Math.sin(h.a)*u+Math.cos(h.a)*v}else{const a=Math.random()*TAU,r=Math.random()*h.r;x+=Math.cos(a)*r;y+=Math.sin(a)*r*0.8}
        for(let j=0;j<3;j++)addPart(x,y,rand(-60,60),rand(-260,-120),rand(0.4,0.7),j?'#bfefff':'#5cc8ff',rand(2.5,4.5),700)}
      if(h.sh==='circle')G.fx.push({k:'ring',x:h.x,y:h.y,r:10,r2:h.r+8,life:0.35,max:0.35,col:'#7fdcff'});G.shake=Math.max(G.shake,5);snd('slam');break}
    case'feather':break;
    case'stakes':break;
    case'riders':break;
    case'shock':G.fx.push({k:'ring',x:h.x,y:h.y,r:h.r,r2:h.r2||h.r+40,life:0.35,max:0.35,col:'#fff0c8'});G.shake=Math.max(G.shake,7);break;
    case'allbut':break;
    default:
      if(h.sh==='circle'){boomFx(h.x,h.y,h.r);if(h.r>100)pushCrack(h.x,h.y,h.r*0.8,7)}
      else if(h.sh==='rect'){for(let i=0;i<6;i++){const u=(i+0.5)/6*h.len;addPart(h.x+Math.cos(h.a)*u,h.y+Math.sin(h.a)*u,rand(-80,80),rand(-160,-60),0.5,col,4,300)}G.shake=Math.max(G.shake,5);snd('boom')}
      else if(h.sh==='cone'||h.sh==='cones'){const as=h.as||[h.a];for(const a0 of as)for(let i=0;i<7;i++){const a=a0+rand(-h.arc/2,h.arc/2),r=rand(30,h.r);addPart(h.x+Math.cos(a)*r,h.y+Math.sin(a)*r,Math.cos(a)*140,Math.sin(a)*140-60,0.45,col,3.5,200)}G.shake=Math.max(G.shake,5);snd('swing')}
      else if(h.sh==='ring'){G.fx.push({k:'ring',x:h.x,y:h.y,r:h.r,r2:h.r2,life:0.35,max:0.35,col});G.shake=Math.max(G.shake,6);snd('slam')}
  }}

/* ================= HIỆU ỨNG RIÊNG (vẽ trên thực thể) ================= */
function fxAdd(o){o.t=0;B2.fx.push(o);return o}
function updFx(dt){for(let i=B2.fx.length-1;i>=0;i--){const f=B2.fx[i];f.t+=dt;if(f.t>=f.life)B2.fx.splice(i,1)}}
function drawB2Fx(){for(const f of B2.fx){const k=f.t/f.life;cx.save();
  if(f.k==='rider'){const x=lerp(f.x0,f.x1,k),y=lerp(f.y0,f.y1,k);const fe={def:ET[f.type],x,y,f:Math.cos(f.a)>=0?1:-1,sc:1,walk:G.t*18+f.seed,moving:true,state:'dash',id:f.seed};
    cx.globalAlpha=Math.min(1,(1-k)*6,k*8);drawBeast(cx,fe,G.t+f.seed);if(Math.random()<0.5)addPart(x,y,rand(-30,30),rand(-40,-10),0.5,'rgba(200,180,140,0.6)',5,0)}
  else if(f.k==='feather'){const x=lerp(f.x0,f.x1,k),y=lerp(f.y0,f.y1,k),a=Math.atan2(f.y1-f.y0,f.x1-f.x0);cx.globalAlpha=Math.min(1,(1-k)*4);cx.translate(x,y-20);cx.rotate(a);
    cx.fillStyle='#f6f1e6';cx.beginPath();cx.ellipse(0,0,13,4,0,0,TAU);cx.fill();cx.strokeStyle='#c9a24e';cx.lineWidth=1.2;cx.beginPath();cx.moveTo(-13,0);cx.lineTo(13,0);cx.stroke()}
  else if(f.k==='arrowrain'){const y=f.y-(1-k)*220;cx.globalAlpha=Math.min(1,(1-k)*3);cx.strokeStyle='#8a6a44';cx.lineWidth=2;cx.beginPath();cx.moveTo(f.x+(1-k)*30,y-22);cx.lineTo(f.x+(1-k)*30-4,y);cx.stroke();cx.fillStyle='#e8e8e0';cx.beginPath();cx.arc(f.x+(1-k)*30-4,y,2,0,TAU);cx.fill()}
  else if(f.k==='dart'){const x=lerp(f.x0,f.x1,k),y=lerp(f.y0,f.y1,k),a=Math.atan2(f.y1-f.y0,f.x1-f.x0);cx.globalAlpha=Math.min(1,(1-k)*4);cx.translate(x,y-22);cx.rotate(a);
    cx.strokeStyle='#5a3a20';cx.lineWidth=2;cx.beginPath();cx.moveTo(-12,0);cx.lineTo(10,0);cx.stroke();cx.fillStyle='#d8e0e4';cx.beginPath();cx.moveTo(10,-3);cx.lineTo(16,0);cx.lineTo(10,3);cx.fill()}
  else if(f.k==='eleph'){const x=lerp(f.x0,f.x1,k),y=lerp(f.y0,f.y1,k);cx.globalAlpha=Math.min(1,(1-k)*6,k*8);cx.save();cx.translate(x,y);cx.scale(1.15,1.15);
    drawMount(cx,MOUNT_BY.voi,{x:0,y:0,f:Math.cos(f.a)>=0?1:-1,t:G.t,walk:G.t*14,moving:true});cx.restore();if(Math.random()<0.6)addPart(x+rand(-30,30),y,rand(-40,40),rand(-60,-20),0.6,'rgba(200,180,140,0.6)',6,0)}
  else if(f.k==='text'){cx.globalAlpha=Math.min(1,(1-k)*3);cx.font=`800 ${f.size||16}px "Be Vietnam Pro",system-ui,sans-serif`;cx.textAlign='center';cx.lineWidth=4;cx.strokeStyle='rgba(20,8,4,0.9)';cx.strokeText(f.txt,f.x,f.y-k*20);cx.fillStyle=f.col;cx.fillText(f.txt,f.x,f.y-k*20)}
  cx.restore()}}

/* ================= BOSS: KHUNG CHUNG ================= */
const PHM=[1,1,1.15,1.4];const D=(e,x)=>e.atk*x*(e.b2?PHM[e.b2.ph]:1);
function B_(e){return e&&e.b2}
function quyetTam(){const S=G.save;return S&&S.b2qt?(S.b2qt[S.map]||0):0}
function bossInit(e){const mi=G.save.map;
  e.max=e.hp=Math.round(e.max*BOSS_HP[Math.min(mi,11)]);e.atk*=BOSS_ATK[Math.min(mi,11)];
  const cfg=BOSSES[e.type];if(!cfg)return;
  e.b2={cfg,ph:1,engaged:true,next:1.4,busy:0,mcd:1,cds:{},last:null,inv:0,shield:0,vuln:0,stun:0,air:0,airH:0,dash:null,ambT:3,adds:[],start:G.t,tries:quyetTam()+1};
  e.el=elOf(e);B2.dl=[];B2.tm=[];later(1.7,()=>{if(!e.dead&&e.b2.ph===1)UI.toast(cfg.ph[1].tip,'boss')});
}
function nextTh(e){const B=e.b2;return B.ph<3?e.max*PH_T[B.ph]:0}
function checkPhase(e){const B=e.b2;if(!B||e.dead||B.trans)return;
  if(B.ph<3&&e.hp<=e.max*PH_T[B.ph]+0.5)startTrans(e,B.ph+1)}
function startTrans(e,ph){const B=e.b2,p=G.p,cfg=B.cfg;
  B.ph=ph;B.trans=1;B.transT=2.0;B.inv=1;B.busy=0;B.esc=null;B.stun=0;B.vuln=0;B.immune=0;B.actUpd=null;B.chan=null;B.dash=null;B.air=0;B.airH=0;e.tele=null;e.state='trans';
  clearHz(false);B2.hz=B2.hz.filter(h=>h.keep&&h.keep>=ph);
  snd('roar');G.shake=14;G.hitstop=Math.max(G.hitstop,0.12);
  G.fx.push({k:'ring',x:e.x,y:e.y,r:20,r2:300,life:0.7,max:0.7,col:cfg.col},{k:'flash',x:e.x,y:e.y-30,r:200,col:cfg.col,life:0.5,max:0.5},{k:'pillar',x:e.x,y:e.y,w:60,h:420,col:cfg.col,life:1.2,max:1.2});
  // đẩy người chơi ra
  const d=dist(p.x,p.y,e.x,e.y);if(d<200&&G.state==='play'){const a=d>1?angTo(e,p):Math.random()*TAU;p.dash={vx:Math.cos(a)*700,vy:Math.sin(a)*700,t:0.22,dmg:0,hit:new Set()}}
  const P=cfg.ph[ph];phaseBanner(ph,P.name,P.tip);
  B.ambT=P.ambT0!=null?P.ambT0:3;B.next=0.8;
}
function endTrans(e){const B=e.b2;B.trans=0;B.inv=0;e.state='chase';const P=B.cfg.ph[B.ph];if(P.enter)P.enter(e,B)}
function resetBoss(e,why){const B=e.b2;if(!B)return;const a=AR();
  for(const m of B.adds)if(!m.dead){m.dead=true}B.adds=[];G.enemies=G.enemies.filter(x=>!x.dead||x===e);
  Object.assign(B,{ph:1,engaged:false,next:1.4,busy:0,actUpd:null,mcd:1,cds:{},inv:0,shield:0,vuln:0,stun:0,air:0,airH:0,dash:null,trans:0,chan:null,ambT:3,
    esc:null,drums:null,mounds:null,pillars:null,flagHz:null,flagsOn:0,steles:null,poemI:0,banner:null,stakes:null});
  e.hp=e.max;e.x=a.x;e.y=a.y-40;e.state='b2idle';e.tele=null;e.enraged=false;clearHz(false);G.tele=G.tele.filter(t=>!t.boss);
  G.projs=G.projs.filter(b=>b.from==='p');B2.dl=[]}
function engage(e){const B=e.b2;B.engaged=true;B.tries=quyetTam()+1;e.state='intro';e.st=1.3;B.start=G.t;
  UI.bossIntro(e);snd('roar');G.shake=10;const P=B.cfg.ph[1];later(1.4,()=>UI.toast(P.tip,'boss'))}
function bossAdd(e,type,x,y,lvOff){const m=spawnEnemy(type,x,y,Math.max(1,e.lv-(lvOff==null?2:lvOff)),false);m.state='chase';m.b2owner=e;resolve(G.W,m);clampArena(m,20);e.b2.adds.push(m);
  for(let j=0;j<10;j++)addPart(m.x,m.y-14,rand(-80,80),rand(-120,-20),0.6,'#c58bff',3,200);return m}
function summon(e,type,n,lvOff){const a0=Math.random()*TAU;for(let k=0;k<n;k++){const a=a0+k/n*TAU;bossAdd(e,type,e.x+Math.cos(a)*90,e.y+Math.sin(a)*72,lvOff)}snd('roar');
  G.fx.push({k:'ring',x:e.x,y:e.y,r:200,r2:20,life:0.8,max:0.8,col:'#c58bff'})}
function busy(e,B,t,upd){B.busy=t;B.actUpd=upd||null;e.state='act';e.atkAnim=0;e.tele=null}
function windGlow(e,col,t){G.fx.push({k:'flash',x:e.x,y:e.y-e.r,r:e.r*2.2,col,life:t||0.5,max:t||0.5})}
function dashTo(e,x,y,t,cb){const B=e.b2;B.dash={x0:e.x,y0:e.y,x1:x,y1:y,t:0,dur:t,cb};e.f=x>=e.x?1:-1;snd('dash')}
function b2dps(){const t0=G.t-8;B2.dl=B2.dl.filter(d=>d[0]>t0);let s=0;for(const d of B2.dl)s+=d[1];return s/8}

/* ---------- vòng cập nhật boss (thay thế updateBoss gốc) ---------- */
const _updateBoss=updateBoss;
updateBoss=function(e,dt){
  const B=e.b2;if(!B)return _updateBoss(e,dt);
  const p=G.p,a=AR(),dp=dist(e.x,e.y,p.x,p.y),ang=Math.atan2(p.y-e.y,p.x-e.x);e.moving=false;
  if(!B.engaged||e.state==='idle'){ // chờ ở giữa đấu trường, hồi máu
    if(e.state!=='b2idle'){e.state='b2idle'}
    const d=dist(e.x,e.y,a.x,a.y-40);if(d>8){moveEnt(G.W,e,(a.x-e.x)/d*e.spd*dt,(a.y-40-e.y)/d*e.spd*dt);e.moving=true}
    e.hp=Math.min(e.max,e.hp+e.max*0.05*dt);e.walk+=e.moving?dt*8:0;
    if(G.state==='play'&&!p.inCamp&&ellIn(p.x-a.x,p.y-a.y,a.r-30)&&step_boss())engage(e);
    return}
  if(G.state==='dead')return;
  // rời đấu trường quá xa (dịch chuyển): đặt lại trận
  if(!ellIn(p.x-a.x,p.y-a.y,a.r+300)){resetBoss(e);return}
  // dịch chuyển (lao, nhảy)
  if(B.dash){const d=B.dash;d.t+=dt;const k=Math.min(1,d.t/d.dur);const nx=lerp(d.x0,d.x1,k),ny=lerp(d.y0,d.y1,k);e.x=nx;e.y=ny;e.moving=true;
    if(G.t%0.04<dt)G.fx.push({k:'ghostB',x:e.x,y:e.y,life:0.3,max:0.3,e});if(k>=1){B.dash=null;if(d.cb)d.cb()}}
  B.vuln=Math.max(0,B.vuln-dt);
  if(B.trans&&e.state!=='trans'){e.state='trans';B.stun=0}
  if(B.stun>0){B.stun-=dt;e.state='b2stun';e.tele=null;if(B.stun<=0){e.state='chase';B.next=Math.max(B.next,0.8)}e.walk+=0;return}
  // vùng nguy hiểm theo giai đoạn
  const P=B.cfg.ph[B.ph];
  if(!B.trans&&e.state!=='intro'&&P.amb){B.ambT-=dt;if(B.ambT<=0){B.ambT=P.ambP||5;P.amb(e,B)}}
  // kênh (gáy, hỏa thiêu)
  if(B.chan){const c=B.chan;c.t+=dt;if(c.upd)c.upd(e,B,c,dt);
    if(c.need&&c.got>=c.need){B.chan=null;c.onBreak(e,B,c)}else if(c.t>=c.dur){B.chan=null;c.onDone(e,B,c)}}
  switch(e.state){
    case'intro':e.st-=dt;if(e.st<=0){e.state='chase';B.next=0.8}break;
    case'trans':B.transT-=dt;e.atkAnim=(G.t*2)%1;if(B.transT<=0)endTrans(e);break;
    case'act':B.busy-=dt;if(B.actUpd)B.actUpd(e,B,dt);if(B.busy<=0&&!B.dash&&!B.air){e.state='chase';B.actUpd=null;B.next=P.gap||2}break;
    case'wind':e.st-=dt;if(e.st>0.22){e.lock=ang;if(e.tele)e.tele.a=ang}e.f=Math.cos(e.lock)>=0?1:-1;
      if(e.st<=0){e.tele=null;const a2=Math.atan2(p.y-e.y,p.x-e.x);if(dp<e.r+95&&Math.abs(angDiff(e.lock,a2))<1.2)hurtPlayer(D(e,1.6),e.lv,e);
        G.fx.push({k:'slash',x:e.x,y:e.y-30,a:e.lock,arc:2.2,r:e.r+85,life:0.2,max:0.2,col:'#ff6a4a',enemy:1});snd('swing');e.state='recover';e.st=0.35;B.mcd=B.ph>=3?1.0:1.4}break;
    case'recover':e.st-=dt;if(e.st<=0)e.state='chase';break;
    case'b2stun':e.state='chase';break;
    default:e.state='chase';
    case'chase':{e.f=Math.cos(ang)>=0?1:-1;B.next-=dt;B.mcd-=dt;
      const keep=(B.cfg.keep||0)+e.r+46;
      if(dp>keep&&!B.chan){const sp=e.spd*(1+0.12*(B.ph-1))*(B.chan?0:1);moveEnt(G.W,e,Math.cos(ang)*sp*dt,Math.sin(ang)*sp*dt);e.moving=true}
      if(B.chan)break;
      if(B.next<=0){const ab=pickAbil(e,B);if(ab){B.last=ab.id;B.cds[ab.id]=G.t+(ab.cd||0);ab.fn(e,B,dp,ang);break}B.next=0.5}
      if(dp<e.r+80&&B.mcd<=0){e.state='wind';e.st=B.ph>=2?0.52:0.6;e.lock=ang;e.tele={k:'arc',r:e.r+85,a:ang,arc:2.2};e.atkAnim=0}
      break}
  }
  clampArena(e,10);
  e.walk+=e.moving?dt*8:0;
};
function step_boss(){const S=G.save,st=curMap().quest[S.qs[S.map]];return st&&st.t==='boss'}
function pickAbil(e,B){const L=B.cfg.ph[B.ph].ab;const ok=L.filter(a=>(B.cds[a.id]||0)<=G.t&&a.id!==B.last&&(!a.cond||a.cond(e,B)));const pool=ok.length?ok:L.filter(a=>(B.cds[a.id]||0)<=G.t&&(!a.cond||a.cond(e,B)));
  if(!pool.length)return null;let tot=0;for(const a of pool)tot+=a.w||1;let r=Math.random()*tot;for(const a of pool){r-=a.w||1;if(r<=0)return a}return pool[0]}

/* ---------- các đòn dùng chung ---------- */
function aRects(e,B,o){ // n luồng thẳng lần lượt, mỗi luồng nhắm lại
  const n=o.n||1,gap=o.gap||0.55;busy(e,B,(n-1)*gap+o.dur+0.15);windGlow(e,o.col,0.4);warnSnd();
  for(let i=0;i<n;i++)later(i*gap,()=>{if(e.dead||!B.engaged)return;const p=G.p;const a=o.aim?o.aim(i):angTo(e,p)+(o.spread?(i-(n-1)/2)*o.spread:0);e.lock=a;e.f=Math.cos(a)>=0?1:-1;e.atkAnim=0;
    hz({sh:'rect',x:e.x-Math.cos(a)*e.r*0.5,y:e.y-Math.sin(a)*e.r*0.5,a,len:o.len,w:o.w,dur:o.dur,dmg:D(e,o.dmg),col:o.col,src:e,kind:o.kind,onFire:o.onFire,draw:o.draw});if(i)warnSnd()})}
function aCircles(e,B,o){const p=G.p,n=o.n;busy(e,B,o.busy||0.9);windGlow(e,o.col,0.5);warnSnd();
  for(let i=0;i<n;i++){let x=p.x,y=p.y;if(i){const a=Math.random()*TAU,r=rand(o.sp*0.4,o.sp);x+=Math.cos(a)*r;y+=Math.sin(a)*r*0.82}const q=clampArena({x,y},o.r*0.4);
    hz({sh:'circle',x:q.x,y:q.y,r:o.r,dur:o.dur+i*(o.stag||0),dmg:D(e,o.dmg),col:o.col,src:e,kind:o.kind,linger:o.linger,tdmg:o.tdmg?D(e,o.tdmg):0,pull:o.pull,slow:o.slow,keep:o.keep,draw:o.draw})}}
function aSlam(e,B,o){busy(e,B,o.dur+0.3);windGlow(e,o.col,o.dur);snd('roar');hz({sh:'circle',x:e.x,y:e.y,r:o.r,dur:o.dur,dmg:D(e,o.dmg),col:o.col,src:e,kind:o.kind||'slam'})}
function aCharge(e,B,o){const n=o.n||1;busy(e,B,n*(o.dur+0.45)+0.2);
  const one=i=>{if(e.dead||!B.engaged||B.stun>0)return;const p=G.p,a=angTo(e,p);e.lock=a;e.f=Math.cos(a)>=0?1:-1;e.atkAnim=0;warnSnd(true);
    const h=hz({sh:'rect',x:e.x,y:e.y,a,len:o.len,w:e.r*2+16,dur:o.dur,dmg:D(e,o.dmg),col:o.col,src:e,kind:'charge',lateHit:1,
      onFire:h=>{let L=h.len-e.r;if(o.stopAt){const s=o.stopAt(h);if(s!=null)L=s}
        const p=G.p,hh=Object.assign({},h,{len:L+e.r});if(G.state==='play'&&p.hp>0&&inHz(hh,p.x,p.y,6)){hurtPlayer(h.dmg,h.lv,e);B2.stats.hits.push([G.save.map,'charge',Math.round(h.dmg)])}const q=clampArena({x:e.x+Math.cos(a)*L,y:e.y+Math.sin(a)*L},e.r);dashTo(e,q.x,q.y,0.22,()=>{if(o.after)o.after(e,B,h);G.shake=Math.max(G.shake,8);pushDust(e.x,e.y,8,40)})},
      upd:h=>{h.x=e.x;h.y=e.y}});
    if(i<n-1)later(o.dur+0.45,()=>one(i+1))};
  one(0)}
function laneRects(ang,n){const a0=AR(),c=Math.cos(ang),s=Math.sin(ang),ext=a0.r*Math.hypot(c,0.82*s),W2=ext*2+30,w=W2/n,ra=ang+Math.PI/2,L=(a0.r+70)*2,out=[];
  for(let i=0;i<n;i++){const off=-W2/2+(i+0.5)*w,mx=a0.x+c*off,my=a0.y+s*off;out.push({x:mx-Math.cos(ra)*L/2,y:my-Math.sin(ra)*L/2,a:ra,len:L,w,i})}return out}
function aLanes(e,B,o){ // các dải song song quét lần lượt (sóng triều)
  busy(e,B,0.8);snd('roar');
  for(const r of laneRects(o.ang!=null?o.ang:Math.random()*TAU,o.n))hz({sh:'rect',x:r.x,y:r.y,a:r.a,len:r.len,w:r.w-4,dur:o.dur0+r.i*o.step,dmg:D(e,o.dmg),col:o.col,src:e,kind:o.kind||'wave',draw:o.draw})}
function aRiders(e,B,o){const n=o.n;
  // chọn dải trống: o.gaps dải, không kề nhau
  const gaps=new Set();let tries=0;while(gaps.size<o.gaps&&tries++<60){const g=randi(1,n-2);if(!gaps.has(g-1)&&!gaps.has(g+1))gaps.add(g)}
  for(const r of laneRects(o.ang,n)){if(gaps.has(r.i))continue;
    hz({sh:'rect',x:r.x,y:r.y,a:r.a,len:r.len,w:r.w-6,dur:o.dur,delay:o.delay||0,dmg:D(e,o.dmg),col:'#ff8a3a',src:e,kind:'riders',draw:drawRiderLane,
      onFire:h=>{fxAdd({k:'rider',type:o.type||'kybinh',x0:h.x,y0:h.y,x1:h.x+Math.cos(h.a)*h.len,y1:h.y+Math.sin(h.a)*h.len,a:h.a,life:0.55,seed:Math.random()*100});G.shake=Math.max(G.shake,6);if(Math.random()<0.4)snd('dash')}})}}
function drawRiderLane(h,k){const c=Math.cos(h.a),s=Math.sin(h.a);cx.strokeStyle=hexA('#ffd2a0',0.5+0.4*k);cx.lineWidth=2.5;
  for(let u=40;u<h.len-20;u+=70){const x=h.x+c*u,y=h.y+s*u;cx.beginPath();cx.moveTo(x-c*10-s*10,y-s*10+c*10);cx.lineTo(x+c*6,y+s*6);cx.lineTo(x-c*10+s*10,y-s*10-c*10);cx.stroke()}}
function aAllbut(e,B,o){busy(e,B,0.8);snd('roar');hornSnd();
  hz({sh:'allbut',safe:o.safe,dur:o.dur,dmg:D(e,o.dmg),col:o.col,src:e,kind:'allbut',onFire:o.onFire})}
function aChannel(e,B,o){B.chan=Object.assign({t:0,got:0},o);e.state='chase';busy(e,B,0);e.state='chase';snd('magic');windGlow(e,o.col,0.8)}
function aVolley(e,B,o){busy(e,B,0.9);windGlow(e,o.col,0.6);G.tele.push({k:'circle',x:e.x,y:e.y,r:56,t:0,dur:0.6,col:o.col,boss:1});
  later(0.6,()=>{if(e.dead||!B.engaged)return;const p=G.p;const n=o.n;for(let k=0;k<n;k++){const a=k/n*TAU+G.t;G.projs.push({x:e.x,y:e.y-30,vx:Math.cos(a)*250,vy:Math.sin(a)*250,r:10,dmg:D(e,o.dmg),lv:e.lv,from:'e',life:2.3,kind:o.proj,hit:new Set()})}
    const a0=angTo(e,p);for(let k=-1;k<=1;k++){const a=a0+k*0.16;G.projs.push({x:e.x,y:e.y-30,vx:Math.cos(a)*380,vy:Math.sin(a)*380,r:10,dmg:D(e,o.dmg),lv:e.lv,from:'e',life:2,kind:o.proj,hit:new Set()})}snd('magic')})}
function triPts(r,a0){const a=AR();return[0,1,2].map(k=>({x:a.x+Math.cos(a0+k*TAU/3)*a.r*r,y:a.y+Math.sin(a0+k*TAU/3)*a.r*r*0.82}))}
function safeNear(p,dmin,dmax,r){for(let k=0;k<40;k++){const a=Math.random()*TAU,d=rand(dmin,dmax),q={x:p.x+Math.cos(a)*d,y:p.y+Math.sin(a)*d*0.82};if(inArena(q.x,q.y,r+10)&&!isSolidPt(G.W,q.x,q.y))return q}return clampArena({x:p.x,y:p.y},r+10)}
function stuck(e,B,t,msg){if(B.trans)return;B.stun=t;B.vuln=t+2.5;B.busy=0;B.dash=null;B.chan=null;e.tele=null;e.state='b2stun';UI.toast(msg,'quest');snd('clang');G.shake=12;G.hitstop=Math.max(G.hitstop,0.1);
  fxAdd({k:'text',txt:'Sơ hở!',x:e.x,y:e.y-e.r*2.6,col:'#8affc0',size:20,life:1.4})}

/* ================= SÁU BOSS ================= */
const C_NT='#45c8f0',C_BK='#ff9a2a',C_HT='#4fb0d8',C_TD='#ff8a3a',C_LT='#ff5a3a',C_SN='#ff5a2a';
const BOSSES={
 /* ---- Ngư Tinh: xoáy nước, vòi nước, sóng triều ---- */
 ngutinh:{col:C_NT,ph:[null,
  {name:'Yêu Cá Thức Giấc',tip:'Né vòi nước và xoáy nước. Đứng trong xoáy sẽ bị hút vào giữa.',gap:2.2,ab:[
    {id:'jet',w:3,fn:(e,B)=>aRects(e,B,{n:1,len:400,w:58,dur:0.9,dmg:2.2,col:C_NT,kind:'water'})},
    {id:'whirl',w:2,cd:6,fn:(e,B)=>aCircles(e,B,{n:3,r:80,sp:190,dur:1.3,dmg:1.6,col:C_NT,kind:'whirl',linger:5,tdmg:0.3,pull:70})},
    {id:'slam',w:2,fn:(e,B)=>aSlam(e,B,{r:150,dur:1.0,dmg:2.2,col:C_NT,kind:'water'})}]},
  {name:'Triều Dâng',tip:'Sóng triều vỡ lần lượt từng dải. Đi theo sau con sóng vừa vỡ.',gap:1.7,
   enter:(e,B)=>{const a=AR();for(const s of[-1,1])hz({sh:'circle',x:a.x+s*a.r*0.62,y:a.y+30,r:62,dur:0.9,dmg:0,col:C_NT,kind:'whirl',linger:1e9,tdmg:0.25,pull:55,keep:2,src:e})},ab:[
    {id:'tide',w:3,cd:7,fn:(e,B)=>aLanes(e,B,{n:4,dur0:1.55,step:0.6,dmg:2.6,col:C_NT,kind:'wave',draw:drawWaveCrest})},
    {id:'jet',w:2,fn:(e,B)=>aRects(e,B,{n:2,gap:0.6,len:420,w:58,dur:0.8,dmg:2.2,col:C_NT,kind:'water'})},
    {id:'whirl',w:2,cd:7,fn:(e,B)=>aCircles(e,B,{n:3,r:80,sp:200,dur:1.25,dmg:1.6,col:C_NT,kind:'whirl',linger:5,tdmg:0.3,pull:70})},
    {id:'charge',w:2,fn:(e,B)=>aCharge(e,B,{n:1,len:400,dur:0.9,dmg:2.4,col:C_NT})}]},
  {name:'Biển Động',tip:'Xoáy nước vây quanh mép đấu trường. Giữ ở giữa, né sóng và vòi nước.',gap:1.3,
   enter:(e,B)=>{const a=AR();for(let k=0;k<6;k++){const an=k/6*TAU+0.3;hz({sh:'circle',x:a.x+Math.cos(an)*a.r*0.8,y:a.y+Math.sin(an)*a.r*0.8*0.82,r:58,dur:1.0,dmg:0,col:C_NT,kind:'whirl',linger:1e9,tdmg:0.3,pull:60,keep:3,src:e})}summon(e,'ran',3)},ab:[
    {id:'tide',w:3,cd:6,fn:(e,B)=>aLanes(e,B,{n:4,dur0:1.45,step:0.5,dmg:2.6,col:C_NT,kind:'wave',draw:drawWaveCrest})},
    {id:'jet',w:2,fn:(e,B)=>aRects(e,B,{n:3,gap:0.5,len:420,w:56,dur:0.75,dmg:2.2,col:C_NT,kind:'water'})},
    {id:'bubble',w:1,fn:(e,B)=>aVolley(e,B,{n:14,dmg:1.0,proj:'water',col:C_NT})},
    {id:'whirl',w:2,cd:6,fn:(e,B)=>aCircles(e,B,{n:4,r:78,sp:220,dur:1.2,dmg:1.6,col:C_NT,kind:'whirl',linger:5,tdmg:0.3,pull:75})}]}]},
 /* ---- Bạch Kê Tinh: bão lông vũ, bổ nhào, tiếng gáy phá thành ---- */
 bachke:{col:C_BK,ph:[null,
  {name:'Gà Yêu Phá Lũy',tip:'Bổ nhào: chạy khỏi vòng đỏ, rồi quay vào giữa để né sóng chấn.',gap:2.1,ab:[
    {id:'feather',w:3,fn:(e,B)=>aFeather(e,B,{n:1})},
    {id:'dive',w:2,cd:5,fn:(e,B)=>aDive(e,B,1)},
    {id:'peck',w:2,fn:(e,B)=>aRects(e,B,{n:2,gap:0.45,len:200,w:70,dur:0.6,dmg:1.6,col:'#ff6a4a'})}]},
  {name:'Gáy Phá Thành',tip:'Khi Bạch Kê vươn cổ gáy, dồn sát thương để ngắt tiếng gáy!',gap:1.6,ambP:3.4,amb:(e,B)=>debris(e,2),
   enter:(e,B)=>{B.cds.crow=G.t+2.5;summon(e,'thophi',2)},ab:[
    {id:'crow',w:4,cd:16,fn:(e,B)=>aCrow(e,B)},
    {id:'feather',w:2,fn:(e,B)=>aFeather(e,B,{n:2})},
    {id:'dive',w:2,cd:5,fn:(e,B)=>aDive(e,B,2)}]},
  {name:'Bạch Kê Hóa Cuồng',tip:'Lông vũ quét bốn hướng rồi xoay chéo. Đứng vào khe hở giữa các luồng.',gap:1.2,ambP:2.8,amb:(e,B)=>debris(e,2),
   enter:(e,B)=>{B.cds.crow=G.t+8;summon(e,'thophi',3)},ab:[
    {id:'fan4',w:3,cd:5,fn:(e,B)=>aFan4(e,B)},
    {id:'dive',w:2,cd:6,fn:(e,B)=>aDive(e,B,3)},
    {id:'crow',w:3,cd:18,fn:(e,B)=>aCrow(e,B)},
    {id:'feather',w:1,fn:(e,B)=>aFeather(e,B,{n:2})}]}]},
 /* ---- Hoằng Tháo: thương liên hoàn, bãi cọc Bạch Đằng ---- */
 hoangthao:{col:C_HT,ph:[null,
  {name:'Thái Tử Nam Hán',tip:'Ba đường thương liên hoàn. Lách ngang, đừng lùi thẳng.',gap:2.0,ab:[
    {id:'thrust',w:3,fn:(e,B)=>aRects(e,B,{n:3,gap:0.55,len:330,w:64,dur:0.7,dmg:1.9,col:'#ff5a3a'})},
    {id:'sweep',w:2,cd:5,fn:(e,B)=>aSweep(e,B)},
    {id:'summon',w:1,cd:20,fn:(e,B)=>{busy(e,B,0.8);summon(e,'thuybinh',2)}},
    {id:'arrows',w:2,fn:(e,B)=>aCircles(e,B,{n:4,r:70,sp:170,dur:1.0,stag:0.15,dmg:1.6,col:'#ff7a3a',busy:0.8})}]},
  {name:'Triều Lên',tip:'Khiên Lâu Thuyền giảm 70% sát thương. Dụ Hoằng Tháo vào bãi cọc khi triều rút!',gap:1.7,ambP:8,ambT0:5,amb:(e,B)=>stakeRise(e,B),
   enter:(e,B)=>{B.shield=0.7;stakeFields(e,B,2)},ab:[
    {id:'thrust',w:3,fn:(e,B)=>aRects(e,B,{n:3,gap:0.5,len:330,w:64,dur:0.65,dmg:1.9,col:'#ff5a3a'})},
    {id:'sweep',w:2,cd:5,fn:(e,B)=>aSweep(e,B)},
    {id:'arrows',w:2,fn:(e,B)=>aCircles(e,B,{n:4,r:70,sp:170,dur:1.0,stag:0.15,dmg:1.6,col:'#ff7a3a',busy:0.8})}]},
  {name:'Bạch Đằng Giang Khẩu',tip:'Khiên dựng lại (−50%). Cọc trồi dày hơn, sóng sông quét qua. Lại dụ hắn vào cọc!',gap:1.4,ambP:6.5,ambT0:4,amb:(e,B)=>stakeRise(e,B),
   enter:(e,B)=>{B.shield=0.5;stakeFields(e,B,3);summon(e,'thuybinh',2)},ab:[
    {id:'thrust',w:3,fn:(e,B)=>aRects(e,B,{n:3,gap:0.45,len:340,w:64,dur:0.6,dmg:1.9,col:'#ff5a3a'})},
    {id:'tide',w:2,cd:9,fn:(e,B)=>aLanes(e,B,{n:4,dur0:1.5,step:0.55,dmg:2.4,col:C_HT,kind:'wave',draw:drawWaveCrest})},
    {id:'sweep',w:2,cd:5,fn:(e,B)=>aSweep(e,B)}]}]},
 /* ---- Toa Đô: xung phong liên hoàn, kỵ binh đột kích ---- */
 toado:{col:C_TD,keep:10,ph:[null,
  {name:'Thiết Kỵ Nguyên Mông',tip:'Toa Đô xung phong ba lượt liền. Lách ngang mỗi lượt.',gap:2.0,ab:[
    {id:'charge',w:3,cd:4,fn:(e,B)=>aCharge(e,B,{n:3,len:470,dur:0.8,dmg:2.4,col:C_TD})},
    {id:'firearrow',w:2,fn:(e,B)=>aCircles(e,B,{n:5,r:66,sp:200,dur:1.0,stag:0.13,dmg:1.7,col:'#ff6a2a',kind:'fire',linger:2.5,tdmg:0.3,busy:0.8})},
    {id:'stomp',w:1,fn:(e,B)=>aSlam(e,B,{r:140,dur:0.85,dmg:2.0,col:C_TD})}]},
  {name:'Kỵ Binh Đột Kích',tip:'Nghe tù và: kỵ binh phi qua từng dải. Đứng vào khe trống!',gap:1.6,
   enter:(e,B)=>{summon(e,'kybinh',2);B.cds.riders=G.t+1},ab:[
    {id:'riders',w:4,cd:7,fn:(e,B)=>{busy(e,B,0.8);hornSnd();aRiders(e,B,{ang:Math.random()*TAU,n:8,gaps:3,dur:1.75,dmg:3.0})}},
    {id:'charge',w:2,cd:4,fn:(e,B)=>aCharge(e,B,{n:3,len:470,dur:0.75,dmg:2.4,col:C_TD})},
    {id:'firearrow',w:2,fn:(e,B)=>aCircles(e,B,{n:5,r:66,sp:200,dur:1.0,stag:0.13,dmg:1.7,col:'#ff6a2a',kind:'fire',linger:2.5,tdmg:0.3,busy:0.8})}]},
  {name:'Liều Chết Tây Kết',tip:'Kỵ binh tràn hai hướng. Tìm ô trống giữa hai đợt.',gap:1.3,
   enter:(e,B)=>{summon(e,'kybinh',2);B.cds.riders=G.t+1},ab:[
    {id:'riders',w:4,cd:7,fn:(e,B)=>{busy(e,B,0.9);hornSnd();const a=Math.random()*TAU;aRiders(e,B,{ang:a,n:8,gaps:3,dur:1.75,dmg:3.0});aRiders(e,B,{ang:a+Math.PI/2,n:8,gaps:3,dur:1.0,delay:1.3,dmg:3.0})}},
    {id:'charge',w:2,cd:4,fn:(e,B)=>aCharge(e,B,{n:4,len:470,dur:0.7,dmg:2.4,col:C_TD})},
    {id:'stomp',w:1,fn:(e,B)=>aSlam(e,B,{r:150,dur:0.8,dmg:2.2,col:C_TD})},
    {id:'firearrow',w:1,fn:(e,B)=>aCircles(e,B,{n:6,r:66,sp:220,dur:1.0,stag:0.12,dmg:1.7,col:'#ff6a2a',kind:'fire',linger:2.5,tdmg:0.3,busy:0.8})}]}]},
 /* ---- Liễu Thăng: hỏa pháo, mưa tên Chi Lăng, sa lầy Mã Yên ---- */
 lieuthang:{col:C_LT,ph:[null,
  {name:'Tổng Binh Nhà Minh',tip:'Hỏa pháo nổ thành chuỗi về phía bạn. Lách ngang khỏi đường đạn.',gap:2.0,ab:[
    {id:'cannon',w:3,fn:(e,B)=>aCannon(e,B)},
    {id:'pierce',w:2,fn:(e,B)=>aRects(e,B,{n:1,len:440,w:72,dur:0.85,dmg:2.5,col:'#ff5a3a'})},
    {id:'summon',w:1,cd:20,fn:(e,B)=>{busy(e,B,0.8);summon(e,'phaominh',2)}}]},
  {name:'Phục Binh Chi Lăng',tip:'Mưa tên phủ kín đấu trường. Chạy vào Hốc Đá màu xanh để nấp!',gap:1.6,ambP:4,amb:(e,B)=>rockfall(e),
   enter:(e,B)=>{B.cds.rain=G.t+1.5},ab:[
    {id:'rain',w:4,cd:11,fn:(e,B)=>aRain(e,B,2.4)},
    {id:'cannon',w:2,fn:(e,B)=>aCannon(e,B)},
    {id:'pierce',w:2,fn:(e,B)=>aRects(e,B,{n:2,gap:0.5,len:440,w:72,dur:0.8,dmg:2.5,col:'#ff5a3a'})}]},
  {name:'Sa Lầy Mã Yên',tip:'Dụ Liễu Thăng xung phong qua bùn lầy: hắn sẽ sa lầy và hở sườn!',gap:1.3,
   enter:(e,B)=>{const pts=triPts(0.52,Math.random()*TAU);for(const q of pts)hz({sh:'circle',x:q.x,y:q.y,r:70,dur:0.8,dmg:0,col:'#a07040',kind:'mud',linger:1e9,slow:0.45,keep:3,src:e});B.cds.mud=G.t+1.5;B.cds.rain=G.t+9;summon(e,'linhminh',2)},ab:[
    {id:'mud',w:4,cd:6,fn:(e,B)=>aCharge(e,B,{n:1,len:540,dur:1.05,dmg:2.8,col:C_LT,stopAt:mudStop,after:mudAfter})},
    {id:'rain',w:3,cd:12,fn:(e,B)=>aRain(e,B,2.2)},
    {id:'cannon',w:2,fn:(e,B)=>aCannon(e,B)}]}]},
 /* ---- Sầm Nghi Đống: Hỏa Hổ chữ thập, đồn bốc cháy, Hỏa Thiêu Đống Đa ---- */
 samnghidong:{col:C_SN,ph:[null,
  {name:'Thái Thú Điền Châu',tip:'Hỏa Hổ phun lửa thành chữ thập. Đứng chéo góc rồi đổi chỗ.',gap:2.0,ab:[
    {id:'cross',w:3,cd:4,fn:(e,B)=>aCross(e,B,false)},
    {id:'meteor',w:2,fn:(e,B)=>aCircles(e,B,{n:4,r:70,sp:170,dur:1.1,stag:0.2,dmg:1.8,col:'#ff5a2a',kind:'fire',linger:2,tdmg:0.3,busy:0.9})},
    {id:'volley',w:1,fn:(e,B)=>aVolley(e,B,{n:16,dmg:0.9,proj:'fire',col:C_SN})},
    {id:'summon',w:1,cd:20,fn:(e,B)=>{busy(e,B,0.8);summon(e,'linhthanh',2)}}]},
  {name:'Đồn Ngọc Hồi Bốc Cháy',tip:'Lửa lan khắp đồn. Đừng đứng trong vùng cháy, né Hỏa Hổ.',gap:1.6,ambP:4.5,amb:(e,B)=>ignite(e),ab:[
    {id:'cross',w:3,cd:4,fn:(e,B)=>aCross(e,B,true)},
    {id:'meteor',w:2,fn:(e,B)=>aCircles(e,B,{n:5,r:70,sp:190,dur:1.05,stag:0.18,dmg:1.8,col:'#ff5a2a',kind:'fire',linger:2,tdmg:0.3,busy:0.9})},
    {id:'volley',w:1,fn:(e,B)=>aVolley(e,B,{n:18,dmg:0.9,proj:'fire',col:C_SN})}]},
  {name:'Gò Đống Đa',tip:'Phá ba Hỏa Đàn trước khi Hỏa Thiêu Đống Đa bùng lên!',gap:1.3,ambP:5.5,amb:(e,B)=>ignite(e),
   enter:(e,B)=>{B.cds.inferno=G.t+0.2;summon(e,'linhthanh',2)},ab:[
    {id:'inferno',w:9,cd:32,fn:(e,B)=>aInferno(e,B)},
    {id:'cross',w:3,cd:4,fn:(e,B)=>aCross(e,B,true)},
    {id:'meteor',w:2,fn:(e,B)=>aCircles(e,B,{n:5,r:70,sp:190,dur:1.0,stag:0.16,dmg:1.8,col:'#ff5a2a',kind:'fire',linger:2,tdmg:0.3,busy:0.9})}]}]},
};
B2.BOSSES=BOSSES;
function drawWaveCrest(h,k){const c=Math.cos(h.a),s=Math.sin(h.a),L=h.len,w=h.w/2;cx.strokeStyle=`rgba(220,250,255,${0.35+0.5*k})`;cx.lineWidth=3;cx.beginPath();
  for(let u=0;u<=L;u+=16){const v=-w+Math.sin(u*0.08+G.t*8)*5+w*2*k*0.98;const x=h.x+c*u-s*v,y=h.y+s*u+c*v;u?cx.lineTo(x,y):cx.moveTo(x,y)}cx.stroke()}
/* -- Bạch Kê -- */
function aFeather(e,B,o){const n=o.n;busy(e,B,n*0.75+0.5);
  for(let i=0;i<n;i++)later(i*0.75,()=>{if(e.dead||!B.engaged)return;const a=angTo(e,G.p)+(i?rand(-0.4,0.4):0);e.f=Math.cos(a)>=0?1:-1;e.atkAnim=0;warnSnd();
    hz({sh:'cone',x:e.x,y:e.y,a,arc:1.05,r:380,dur:0.85,dmg:D(e,2.2),col:'#ff9a2a',src:e,kind:'feather',onFire:featherBurst})})}
function aDive(e,B,n){busy(e,B,n*1.75+0.3);
  const one=i=>{if(e.dead||!B.engaged||B.stun>0)return;B.air=1;e.tele=null;snd('dash');G.fx.push({k:'flash',x:e.x,y:e.y-20,r:80,col:'#fff4d0',life:0.3,max:0.3});
    const h=hz({sh:'circle',x:G.p.x,y:G.p.y,r:105,dur:1.45,dmg:D(e,3.0),col:'#ff4a2a',src:e,kind:'dive',
      upd:(h,dt)=>{B.airH=Math.min(170,h.t/0.35*170);if(h.t<0.6){const p=G.p;h.x=lerp(h.x,p.x,Math.min(1,dt*4));h.y=lerp(h.y,p.y,Math.min(1,dt*4));clampArena(h,40)}
        if(h.t>1.15)B.airH=170*(1-(h.t-1.15)/0.3);e.x=lerp(e.x,h.x,Math.min(1,dt*3));e.y=lerp(e.y,h.y,Math.min(1,dt*3))},
      onFire:h=>{e.x=h.x;e.y=h.y;B.air=0;B.airH=0;G.shake=12;pushCrack(h.x,h.y,90,8);pushDust(h.x,h.y,12,80);
        hz({sh:'ring',x:h.x,y:h.y,r:110,r2:225,dur:0.5,dmg:D(e,1.4),col:'#ffb347',src:e,kind:'shock'});
        if(i<n-1)later(0.45,()=>one(i+1))}})};
  one(0)}
function aCrow(e,B){const a=AR();busy(e,B,0.2);e.state='chase';
  const need=Math.max(e.max*0.025,Math.min(e.max*0.09,b2dps()*1.9));
  const big=hz({sh:'circle',x:e.x,y:e.y,r:a.r*1.6,dur:3.4,dmg:D(e,3.4),col:'#ffe08a',src:e,kind:'shock',noBot:1,hidden:1});
  aChannel(e,B,{dur:3.4,need,col:'#ffe08a',label:'Gáy Phá Thành',
    upd:(e,B,c)=>{e.atkAnim=0.3;if(Math.random()<0.3)addPart(e.x+rand(-20,20),e.y-70,rand(-40,40),rand(-90,-40),0.5,'#fff4d0',3,0)},
    onBreak:(e,B)=>{B2.hz=B2.hz.filter(h=>h!==big);stuck(e,B,3.5,'Ngắt được tiếng gáy! Bạch Kê choáng váng.')},
    onDone:(e,B)=>{G.flash={col:'#fff0c0',t:0.5,d:0.5};snd('roar');for(let k=0;k<3;k++)G.fx.push({k:'ring',x:e.x,y:e.y,r:30,r2:a.r*1.3,life:0.5+k*0.15,max:0.5+k*0.15,col:'#ffe08a'})}})}
function featherBurst(h){for(const a0 of(h.as||[h.a]))for(let j=0;j<(h.as?5:12);j++){const aa=a0+rand(-h.arc/2,h.arc/2);fxAdd({k:'feather',x0:h.x,y0:h.y,x1:h.x+Math.cos(aa)*h.r,y1:h.y+Math.sin(aa)*h.r,life:0.35+Math.random()*0.15})}snd('swing')}
function aFan4(e,B){busy(e,B,2.2);const a0=Math.random()*TAU;warnSnd(true);
  hz({sh:'cones',x:e.x,y:e.y,as:[0,1,2,3].map(k=>a0+k*Math.PI/2),arc:0.8,r:420,dur:1.05,dmg:D(e,2.4),col:'#ff9a2a',src:e,kind:'feather',onFire:featherBurst});
  hz({sh:'cones',x:e.x,y:e.y,as:[0,1,2,3].map(k=>a0+Math.PI/4+k*Math.PI/2),arc:0.8,r:420,dur:2.0,dmg:D(e,2.4),col:'#ff9a2a',src:e,kind:'feather',onFire:featherBurst})}
function debris(e,n){const p=G.p;for(let i=0;i<n;i++){const q=i?rpt(0.85):safeNear(p,30,140,60);hz({sh:'circle',x:q.x,y:q.y,r:62,dur:1.35,dmg:D(e,1.5),col:'#d9a463',src:e,kind:'rock',draw:drawRockShadow})}}
function drawRockShadow(h,k){const y=h.y-(1-k)*260;cx.fillStyle=`rgba(0,0,0,${0.25*k})`;cx.beginPath();cx.ellipse(h.x,h.y,20*k+6,(20*k+6)*0.6,0,0,TAU);cx.fill();
  cx.fillStyle='#8a7a66';cx.strokeStyle='rgba(30,20,10,0.8)';cx.lineWidth=1.5;cx.beginPath();cx.moveTo(h.x-14,y-6);cx.lineTo(h.x-4,y-18);cx.lineTo(h.x+12,y-12);cx.lineTo(h.x+14,y+4);cx.lineTo(h.x-8,y+8);cx.closePath();cx.fill();cx.stroke()}
/* -- Hoằng Tháo -- */
function aSweep(e,B){busy(e,B,1.2);const a=angTo(e,G.p);e.atkAnim=0;warnSnd(true);
  hz({sh:'cone',x:e.x,y:e.y,a,arc:3.7,r:205,dur:0.95,dmg:D(e,2.4),col:'#ff5a3a',src:e,kind:'sweep'})}
function stakeFields(e,B,ph){B2.hz=B2.hz.filter(h=>h.kind!=='stakefield');B.stakes=triPts(0.56,Math.random()*TAU).map(q=>hz({sh:'circle',x:q.x,y:q.y,r:86,dur:0.6,dmg:0,col:C_HT,kind:'stakefield',linger:1e9,keep:ph,src:e,noBot:1}))}
function stakeRise(e,B){if(!B.stakes)return;warnSnd(true);B.stakeN=(B.stakeN||0)+1;if(B.stakeN<=2)UI.toast('Triều rút! Cọc sắp trồi lên.','warn');
  const imp=h=>{if(!e.dead&&B.engaged&&B.stun<=0&&!B.trans&&G.t-(B.impT||-99)>8&&ellIn(e.x-h.x,e.y-h.y,h.r+e.r*0.3)){B.impT=G.t;B.shield=0;e.x=lerp(e.x,h.x,0.3);B2.stats.imp=(B2.stats.imp||0)+1;stuck(e,B,4,'Hoằng Tháo mắc cọc Bạch Đằng! Khiên Lâu Thuyền vỡ.')}};
  later(1.8+2.7,()=>{if(!e.dead&&B.engaged&&B.shield>0&&G.t-(B.impT||-99)>5){B.shield=Math.max(0,+(B.shield-0.15).toFixed(2));UI.toast(B.shield>0?'Khiên Lâu Thuyền rạn nứt ('+Math.round(B.shield*100)+'%).':'Khiên Lâu Thuyền vỡ vụn!','warn')}});
  for(const f of B.stakes){hz({sh:'circle',x:f.x,y:f.y,r:f.r,dur:1.8,dmg:D(e,2.2),col:'#ff5a3a',src:e,kind:'stakes',linger:2.6,draw:drawStakeTips,
    upd:h=>{if(h.fired)imp(h)},onFire:h=>{snd('slam');G.shake=Math.max(G.shake,6);pushDust(h.x,h.y,10,h.r);imp(h)}})}}
function drawStakeTips(h,k){for(let i=0;i<9;i++){const an=i*2.39996,rr=h.r*0.75*Math.sqrt((i+0.5)/9),px=h.x+Math.cos(an)*rr,py=h.y+Math.sin(an)*rr*0.8,hh=4+k*8;cx.fillStyle='#d8e2e6';cx.beginPath();cx.moveTo(px-2.5,py);cx.lineTo(px,py-hh);cx.lineTo(px+2.5,py);cx.fill()}}
/* -- Liễu Thăng -- */
function aCannon(e,B){busy(e,B,1.0);const p=G.p,a=angTo(e,p),d=Math.max(160,dist(e.x,e.y,p.x,p.y)+90);windGlow(e,'#ff7a3a',0.5);warnSnd();
  const n=Math.min(8,Math.ceil(d/70));for(let i=0;i<n;i++){const u=60+i*(d-40)/n;const q={x:e.x+Math.cos(a)*u,y:e.y+Math.sin(a)*u};if(!inArena(q.x,q.y,-40))continue;
    hz({sh:'circle',x:q.x,y:q.y,r:62,dur:1.0+i*0.16,dmg:D(e,2.0),col:'#ff6a2a',src:e,kind:'cannon'})}}
function aRain(e,B,dur){const p=G.p;const s1=safeNear(p,110,210,74);let s2=null;for(let k=0;k<30;k++){const q=rpt(0.75);if(dist(q.x,q.y,s1.x,s1.y)>220){s2=q;break}}s2=s2||rpt(0.7);
  aAllbut(e,B,{safe:[{x:s1.x,y:s1.y,r:74,label:'Hốc Đá'},{x:s2.x,y:s2.y,r:74,label:'Hốc Đá'}],dur,dmg:3.6,col:'#ff4a2a',
    onFire:h=>{for(let i=0;i<40;i++){const q=rpt(1);let safe=false;for(const s of h.safe)if(ellIn(q.x-s.x,q.y-s.y,s.r))safe=true;if(!safe)fxAdd({k:'arrowrain',x:q.x,y:q.y,life:0.25+Math.random()*0.25})}G.shake=Math.max(G.shake,8);snd('bow');snd('boom')}})}
function rockfall(e){const a=AR();for(let i=0;i<2;i++){const an=Math.random()*TAU;const q={x:a.x+Math.cos(an)*a.r*rand(0.55,0.85),y:a.y+Math.sin(an)*a.r*rand(0.55,0.85)*0.82};
  hz({sh:'circle',x:q.x,y:q.y,r:70,dur:1.35,dmg:D(e,1.6),col:'#c9b08a',src:e,kind:'rock',draw:drawRockShadow})}}
function mudStop(h){const e=G.boss;if(!e)return null;let best=null;for(const m of B2.hz){if(m.kind!=='mud'||!m.fired)continue;
  // điểm đầu tiên trên đường lao rơi vào bùn
  for(let u=e.r;u<h.len;u+=12){const x=h.x+Math.cos(h.a)*u,y=h.y+Math.sin(h.a)*u;if(ellIn(x-m.x,y-m.y,m.r*0.8)){if(best==null||u<best){best=u;h.mud=m}break}}}
  return best==null?null:best+20}
function mudAfter(e,B,h){if(h.mud){B2.stats.imp=(B2.stats.imp||0)+1;e.x=h.mud.x;e.y=h.mud.y;stuck(e,B,4,'Liễu Thăng sa lầy ở Mã Yên! Đánh mạnh vào!');for(let i=0;i<14;i++)addPart(e.x,e.y,rand(-120,120),rand(-200,-60),0.7,'#6a4a2a',5,600)}}
/* -- Sầm Nghi Đống -- */
function aCross(e,B,dbl){busy(e,B,dbl?2.3:1.4);const a0=Math.random()<0.5?0:Math.PI/4;windGlow(e,'#ff7a3a',0.6);warnSnd(true);
  const mk=(a,dur)=>{for(let k=0;k<4;k++){const an=a+k*Math.PI/2;hz({sh:'rect',x:e.x,y:e.y,a:an,len:420,w:64,dur,dmg:D(e,2.4),col:'#ff5a2a',src:e,kind:'flame',upd:h=>{h.x=e.x;h.y=e.y},
    onFire:h=>{for(let i=0;i<10;i++){const u=Math.random()*h.len;addPart(h.x+Math.cos(h.a)*u,h.y+Math.sin(h.a)*u-10,rand(-30,30),rand(-120,-40),0.6,i%2?'#ffd23a':'#ff6a1a',5,-60,'c',1)}snd('boom')}})}};
  mk(a0,1.0);if(dbl)mk(a0+Math.PI/4,1.8)}
function ignite(e){const n=B2.hz.filter(h=>h.kind==='fire'&&h.linger>5).length;if(n>=5)return;let q=null;for(let k=0;k<20;k++){const c=rpt(0.85);if(dist(c.x,c.y,e.x,e.y)>110){q=c;break}}if(!q)return;
  hz({sh:'circle',x:q.x,y:q.y,r:72,dur:1.25,dmg:D(e,1.5),col:'#ff5a2a',src:e,kind:'fire',linger:12,tdmg:D(e,0.35)})}
function aInferno(e,B){const a=AR();busy(e,B,0.6);snd('roar');hornSnd();
  dashTo(e,a.x,a.y-30,0.4,()=>{});B.immune=1;
  B.braz=[];for(let k=0;k<3;k++){const an=-Math.PI/2+k*TAU/3+0.5;const m=bossAdd(e,'b2_hoadan',a.x+Math.cos(an)*a.r*0.66,a.y+Math.sin(an)*a.r*0.66*0.82,0);
    m.max=m.hp=Math.round(e.max*0.016);m.atk=0;m.b2kbImm=1;B.braz.push(m)}
  const big=hz({sh:'circle',x:a.x,y:a.y,r:a.r*1.6,dur:10,dmg:0,col:'#ff3a1a',src:e,kind:'inferno',noBot:1,hidden:1});
  aChannel(e,B,{dur:10,col:'#ff5a2a',label:'Hỏa Thiêu Đống Đa',
    upd:(e,B,c)=>{e.atkAnim=0.2;const left=B.braz.filter(m=>!m.dead).length;c.left=left;if(!left){c.got=c.need=1}
      if(Math.random()<0.5)addPart(e.x+rand(-40,40),e.y+rand(-20,10),rand(-20,20),rand(-140,-60),0.6,Math.random()<0.5?'#ff7a2a':'#ffd23a',5,-40,'c',1)},
    onBreak:(e,B)=>{B.immune=0;B2.hz=B2.hz.filter(h=>h!==big);stuck(e,B,4.5,'Ba Hỏa Đàn đã tắt! Sầm Nghi Đống mất Hỏa Giáp.')},
    onDone:(e,B)=>{B.immune=0;B2.hz=B2.hz.filter(h=>h!==big);const left=B.braz.filter(m=>!m.dead);for(const m of left){m.dead=true;boomFx(m.x,m.y,90)}
      const p=G.p;if(left.length&&G.state==='play'){hurtPlayer(D(e,1.6*left.length),e.lv,e);B2.stats.hits.push([G.save.map,'inferno',0])}
      G.flash={col:'#ff5a1a',t:0.6,d:0.6};G.shake=16;snd('boom');for(let k=0;k<3;k++)G.fx.push({k:'ring',x:a.x,y:a.y,r:30,r2:a.r*1.3,life:0.5+k*0.15,max:0.5+k*0.15,col:'#ff7a2a'})}});
  B.chan.need=999}
/* ================= SÁU BOSS CHƯƠNG MỚI =================
   Mỗi boss: một đòn đặc trưng có cảnh báo và một cơ chế vị trí (đứng đúng chỗ để làm boss lộ sơ hở). */
const C_TO='#e8b04a',C_TB='#a8c0e8',C_DC='#c09050',C_QQ='#e0503a',C_OM='#3aa0d0',C_CT='#e8b830',C_ALLY='#8affc0';
/* -- dùng chung -- */
function aFanX(e,B,o){busy(e,B,o.n2?1.95:1.15);windGlow(e,o.col,0.5);warnSnd(true);const a=angTo(e,G.p);
  const mk=(off,dur)=>hz({sh:'cones',x:e.x,y:e.y,as:[-2,-1,0,1,2].map(k=>a+off+k*0.48),arc:0.24,r:o.r||400,dur,dmg:D(e,o.dmg),col:o.col,src:e,kind:'xbow',onFire:dartBurst});
  mk(0,0.95);if(o.n2)mk(0.24,1.7)}
function dartBurst(h){for(const a0 of h.as)for(let j=0;j<3;j++){const aa=a0+rand(-h.arc/2,h.arc/2);fxAdd({k:'dart',x0:h.x,y0:h.y,x1:h.x+Math.cos(aa)*h.r,y1:h.y+Math.sin(aa)*h.r,life:0.25+Math.random()*0.12})}snd('bow')}
function aRings(e,B,o){busy(e,B,1.0);windGlow(e,o.col,0.6);snd('roar');const x=e.x,y=e.y;
  hz({sh:'circle',x,y,r:125,dur:1.0,dmg:D(e,o.dmg),col:o.col,src:e,kind:'shock'});
  hz({sh:'ring',x,y,r:125,r2:250,dur:1.75,dmg:D(e,o.dmg),col:o.col,src:e,kind:'shock'});
  hz({sh:'ring',x,y,r:250,r2:420,dur:2.5,dmg:D(e,o.dmg),col:o.col,src:e,kind:'shock'})}
function lanePick(n,k){const all=[...Array(n).keys()],off=randi(0,1);return all.filter(i=>(i+off)%2===0).slice(0,k)}
function shieldDecay(B,by,msg){if(B.shield>0){B.shield=Math.max(0,+(B.shield-by).toFixed(2));if(msg)UI.toast(B.shield>0?msg+' ('+Math.round(B.shield*100)+'%)':msg.split(' ')[0]+' vỡ hẳn!','warn')}}
function objHz(e,o){return hz(Object.assign({sh:'circle',dur:0.6,dmg:0,col:C_ALLY,linger:1e9,src:e,noBot:1},o))}
function hasEngaged(e,B){return !e.dead&&B.engaged&&!B.trans}

/* -- Tô Định: nỏ quạt, gông xiềng, trống đồng gọi voi, cạo râu trốn chạy -- */
function drums(e,B,keep){B2.hz=B2.hz.filter(h=>h.kind!=='drum');B.drums=[];const a=AR(),an=Math.random()*TAU;
  for(const s of[0,Math.PI]){const x=a.x+Math.cos(an+s)*a.r*0.7,y=a.y+Math.sin(an+s)*a.r*0.7*0.82;
    B.drums.push(objHz(e,{x,y,r:52,kind:'drum',keep,prog:0,cdT:0,
      upd:(h,dt)=>{if(!h.fired||!hasEngaged(e,B))return;h.cdT=Math.max(0,h.cdT-dt);const p=G.p;
        if(h.cdT<=0&&B.stun<=0&&G.state==='play'&&ellIn(p.x-h.x,p.y-h.y,h.r)){h.prog+=dt;if(h.prog>=1.1){h.prog=0;h.cdT=9;elephantLane(e,B,h)}}else h.prog=Math.max(0,h.prog-dt*2)}}))}}
function elephantLane(e,B,dr){const a=AR(),ang=Math.atan2(a.y-dr.y,a.x-dr.x),len=a.r*2+60;snd('roar');hornSnd();
  if(!B.eleTip){B.eleTip=1;UI.toast('Trống đồng vang! Voi chiến của Hai Bà Trưng xung trận.','quest')}
  hz({sh:'rect',x:dr.x-Math.cos(ang)*50,y:dr.y-Math.sin(ang)*50,a:ang,len,w:124,dur:1.25,dmg:0,col:C_ALLY,src:e,kind:'eleph',noBot:1,draw:drawRiderLane,
    onFire:h=>{fxAdd({k:'eleph',x0:h.x,y0:h.y,x1:h.x+Math.cos(h.a)*h.len,y1:h.y+Math.sin(h.a)*h.len,a:h.a,life:0.75});G.shake=Math.max(G.shake,9);snd('slam');
      if(hasEngaged(e,B)&&B.stun<=0&&inHz(h,e.x,e.y,e.r*0.5)){B.shield=0;B2.stats.imp=(B2.stats.imp||0)+1;stuck(e,B,4,'Voi chiến húc ngã Tô Định! Giáp sắt vỡ.')}
      else shieldDecay(B,0.1,'Giáp sắt rạn nứt')}})}
function aFlee(e,B){const a=AR(),p=G.p,an=Math.atan2(e.y-p.y,e.x-p.x)+rand(-0.5,0.5);
  const q=clampArena({x:a.x+Math.cos(an)*a.r*0.8,y:a.y+Math.sin(an)*a.r*0.8*0.82},e.r);busy(e,B,0.6);dashTo(e,q.x,q.y,0.5,()=>{});
  const need=Math.max(e.max*0.03,Math.min(e.max*0.08,b2dps()*1.8));
  later(0.55,()=>{if(!hasEngaged(e,B)||B.stun>0)return;
    aChannel(e,B,{dur:4,need,col:C_TO,label:'Cạo râu trốn chạy',
      upd:(e,B,c)=>{e.atkAnim=0.25;if(Math.random()<0.25)addPart(e.x+rand(-14,14),e.y-60,rand(-50,50),rand(-60,-20),0.6,'#1a1410',2.5,300)},
      onBreak:(e,B)=>stuck(e,B,3.5,'Chặn được Tô Định! Hắn ngã sõng soài.'),
      onDone:(e,B)=>{e.hp=Math.min(e.max*PH_T[2],e.hp+e.max*0.06);snd('roar');UI.toast('Tô Định chạy thoát một quãng, hồi sức!','warn');
        hz({sh:'circle',x:e.x,y:e.y,r:150,dur:0.7,dmg:D(e,1.8),col:C_TO,src:e,kind:'shock'})}})})}
/* -- Trần Bá Tiên: thương dài, lũ hồ Điển Triệt (lên gò), Cờ Vạn Xuân (vùng khí thế) -- */
function mounds(e,B,keep){B2.hz=B2.hz.filter(h=>h.kind!=='mound');B.mounds=triPts(0.55,Math.random()*TAU).map(q=>objHz(e,{x:q.x,y:q.y,r:80,kind:'mound',keep}))}
function aFlood(e,B){const p=G.p,ms=B.mounds||[];if(!ms.length)return;let sunk=ms[0];for(const m of ms)if(dist2(m.x,m.y,p.x,p.y)<dist2(sunk.x,sunk.y,p.x,p.y))sunk=m;
  const safe=ms.filter(m=>m!==sunk).map(m=>({x:m.x,y:m.y,r:m.r-6,label:'Gò Đất'}));UI.toast('Nước lũ dâng! Lên Gò Đất khác, gò dưới chân bạn sắp sụt.','warn');
  aAllbut(e,B,{safe,dur:2.8,dmg:3.4,col:'#3a8ad8',onFire:h=>{for(let i=0;i<30;i++){const q=rpt(1);addPart(q.x,q.y,rand(-40,40),rand(-200,-80),0.6,i%2?'#bfefff':'#5cc8ff',4,600)}G.shake=Math.max(G.shake,8);snd('slam')}});
  hz({sh:'circle',x:sunk.x,y:sunk.y,r:sunk.r,dur:2.8,dmg:D(e,1.2),col:'#a07040',src:e,kind:'mud'});busy(e,B,1.4)}
function moveBanner(e,B,first){const a=AR();let q=null;for(let k=0;k<20;k++){const c=rpt(0.62);if(!B.banner||dist(c.x,c.y,B.banner.x,B.banner.y)>200){q=c;break}}q=q||rpt(0.5);
  if(first){B.banner={x:q.x,y:q.y,r:90};return}
  hz({sh:'circle',x:q.x,y:q.y,r:90,dur:1.6,dmg:0,col:C_ALLY,src:e,kind:'bannerNext',noBot:1,onFire:()=>{if(hasEngaged(e,B))B.banner={x:q.x,y:q.y,r:90}}})}
function inBanner(){const e=G.boss,p=G.p;if(!e||e.dead||!e.b2||!e.b2.banner||!p)return false;const b=e.b2.banner;return ellIn(p.x-b.x,p.y-b.y,b.r)}
B2.inBanner=inBanner;
/* -- Đỗ Cảnh Thạc: kích quét đôi, đá lăn, Nỏ Liên Châu (nấp sau trụ đá), Cờ Lau (chiếm cờ) -- */
function aHalberd(e,B){busy(e,B,1.8);const a=angTo(e,G.p);e.atkAnim=0;warnSnd(true);
  hz({sh:'cone',x:e.x,y:e.y,a,arc:2.3,r:215,dur:0.9,dmg:D(e,2.3),col:'#ff5a3a',src:e,kind:'sweep'});
  hz({sh:'cone',x:e.x,y:e.y,a:a+Math.PI,arc:2.3,r:215,dur:1.6,dmg:D(e,2.3),col:'#ff5a3a',src:e,kind:'sweep'})}
function aBoulders(e,B,k){busy(e,B,0.8);snd('roar');const ls=laneRects(Math.random()*TAU,6),pk=lanePick(6,k);
  for(const r of ls)if(pk.includes(r.i))hz({sh:'rect',x:r.x,y:r.y,a:r.a,len:r.len,w:r.w-8,dur:1.6+(r.i%3)*0.12,dmg:D(e,2.4),col:'#c09050',src:e,kind:'boulder',draw:drawBoulder})}
function drawBoulder(h,k){const u=h.len*k,x=h.x+Math.cos(h.a)*u,y=h.y+Math.sin(h.a)*u;cx.fillStyle='rgba(0,0,0,0.3)';cx.beginPath();cx.ellipse(x,y+6,26,9,0,0,TAU);cx.fill();
  cx.save();cx.translate(x,y-18);cx.rotate(k*12);cx.fillStyle='#8a7a66';cx.strokeStyle='rgba(30,20,10,0.85)';cx.lineWidth=2;cx.beginPath();cx.moveTo(-22,-4);cx.lineTo(-10,-20);cx.lineTo(12,-18);cx.lineTo(22,0);cx.lineTo(10,18);cx.lineTo(-14,16);cx.closePath();cx.fill();cx.stroke();
  cx.fillStyle='rgba(255,255,255,0.18)';cx.beginPath();cx.arc(-6,-8,6,0,TAU);cx.fill();cx.restore()}
function pillars(e,B,keep){B2.hz=B2.hz.filter(h=>h.kind!=='pillar');B.pillars=triPts(0.42,Math.random()*TAU).map(q=>objHz(e,{x:q.x,y:q.y,r:34,kind:'pillar',keep}))}
function aLienChau(e,B){const ps=B.pillars||[];if(!ps.length)return;
  const safe=ps.map(q=>{const an=Math.atan2(q.y-e.y,q.x-e.x);return{x:q.x+Math.cos(an)*76,y:q.y+Math.sin(an)*76*0.82,r:58,label:'Nấp'}}).map(s=>clampArena(s,40));
  aAllbut(e,B,{safe,dur:2.7,dmg:3.4,col:'#ff4a2a',onFire:h=>{for(let i=0;i<36;i++){const q=rpt(1);let ok=false;for(const s of h.safe)if(ellIn(q.x-s.x,q.y-s.y,s.r))ok=true;if(!ok)fxAdd({k:'arrowrain',x:q.x,y:q.y,life:0.25+Math.random()*0.25})}G.shake=Math.max(G.shake,8);snd('bow');snd('boom')}});
  busy(e,B,2.9);UI.toast('Nỏ Liên Châu! Nấp sau trụ đá, phía khuất tầm boss.','warn')}
function flags(e,B){B2.hz=B2.hz.filter(h=>h.kind!=='flag');B.flagsOn=1;B.shield=0.75;
  B.flagHz=triPts(0.6,Math.random()*TAU).map(q=>objHz(e,{x:q.x,y:q.y,r:58,kind:'flag',keep:3,prog:0,cap:0,
    upd:(h,dt)=>{if(!h.fired||h.cap||!hasEngaged(e,B))return;const p=G.p;if(G.state==='play'&&ellIn(p.x-h.x,p.y-h.y,h.r)){h.prog+=dt;if(h.prog>=2){h.cap=1;flagTaken(e,B)}}else h.prog=Math.max(0,h.prog-dt*0.5)}}))}
function flagTaken(e,B){const left=B.flagHz.filter(f=>!f.cap).length;snd('quest');B.shield=Math.max(0,+(B.shield-0.25).toFixed(2));
  if(left>0){UI.toast(`Chiếm được Cờ Lau! Thành lũy còn ${Math.round(B.shield*100)}%. Còn ${left} cờ.`,'quest');return}
  B.flagsOn=0;B.shield=0;B2.stats.imp=(B2.stats.imp||0)+1;stuck(e,B,4.5,'Ba Cờ Lau tung bay! Thành lũy Đỗ Cảnh Thạc sụp đổ.');
  later(16,()=>{if(hasEngaged(e,B)&&B.ph===3){flags(e,B);B.shield=0.5;UI.toast('Đỗ Cảnh Thạc dựng lại thành lũy. Chiếm lại Cờ Lau!','warn')}})}
/* -- Quách Quỳ: máy bắn đá, xung phong, kỵ binh vượt sông, bia Nam quốc sơn hà -- */
const POEM=['Nam quốc sơn hà Nam đế cư','Tiệt nhiên định phận tại thiên thư','Như hà nghịch lỗ lai xâm phạm','Nhữ đẳng hành khan thủ bại hư'];
B2.POEM=POEM;
function aTrebuchet(e,B,n){aCircles(e,B,{n,r:92,sp:175,dur:1.5,stag:0.3,dmg:2.4,col:'#c9a070',kind:'rock',draw:drawRockShadow,busy:1.0})}
function poem(e,B,sh){B2.hz=B2.hz.filter(h=>h.kind!=='stele');B.shield=sh;B.poemI=0;const a=AR(),a0=Math.random()*TAU;
  B.steles=[0,1,2,3].map(k=>{const an=a0+k*TAU/4;return objHz(e,{x:a.x+Math.cos(an)*a.r*0.66,y:a.y+Math.sin(an)*a.r*0.66*0.82,r:46,kind:'stele',idx:k,keep:3,col:'#ffd23a',
    upd:(h,dt)=>{if(!h.fired||!hasEngaged(e,B)||B.poemI!==h.idx||G.state!=='play')return;const p=G.p;if(ellIn(p.x-h.x,p.y-h.y,h.r+10))verse(e,B,h)}})})}
function verse(e,B,h){h.done=1;B.poemI++;const i=h.idx;snd('quest');G.fx.push({k:'pillar',x:h.x,y:h.y,w:30,h:260,col:'#ffd23a',life:0.9,max:0.9});
  fxAdd({k:'text',txt:POEM[i],x:h.x,y:h.y-90,col:'#ffe08a',size:17,life:2.6});UI.toast(`Câu ${i+1}/4: ${POEM[i]}`,'quest');
  if(B.poemI<4){shieldDecay(B,0.1);return}
  B.shield=0;B2.stats.imp=(B2.stats.imp||0)+1;stuck(e,B,5,'Nam quốc sơn hà vang dậy! Quân Tống khiếp vía, Quách Quỳ mất tinh thần.');G.flash={col:'#fff0c0',t:0.5,d:0.5};
  later(17,()=>{if(hasEngaged(e,B)&&B.ph>=2){poem(e,B,B.ph>=3?0.45:0.4);UI.toast('Quách Quỳ chấn chỉnh quân ngũ. Đọc lại bài thơ thần!','warn')}})}
/* -- Ô Mã Nhi: thuyền húc, tên lửa, bè lửa trôi theo dòng, bắt sống khi tháo chạy -- */
function rafts(e,B,k){if(B.raftDir==null)B.raftDir=Math.random()*TAU;const ls=laneRects(B.raftDir,6),pk=lanePick(6,k);warnSnd(true);B.raftHit=0;
  for(const r of ls){if(!pk.includes(r.i))continue;
    hz({sh:'rect',x:r.x,y:r.y,a:r.a,len:r.len,w:r.w-8,dur:1.2,dmg:0,col:'#ff8a3a',src:e,kind:'raftlane',noBot:1,draw:drawRiderLane,
      onFire:h=>{const c=Math.cos(h.a),s=Math.sin(h.a),sp=270;
        hz({sh:'circle',x:h.x,y:h.y,r:50,dur:h.len/sp,dmg:D(e,2.0),lateHit:1,col:'#ff7a2a',src:e,kind:'raft',mv:[c,s],sp,draw:drawRaft,
          upd:(q,dt)=>{if(q.fired)return;q.x+=c*sp*dt;q.y+=s*sp*dt;const p=G.p;
            if(!q.hitP&&G.state==='play'&&p.hp>0&&ellIn(p.x-q.x,p.y-q.y,q.r+p.r*0.5)){q.hitP=1;hurtPlayer(q.dmg,q.lv,e);B2.stats.hits.push([G.save.map,'raft',Math.round(q.dmg)])}
            if(!q.hitB&&hasEngaged(e,B)&&B.stun<=0&&!B.esc&&ellIn(e.x-q.x,e.y-q.y,q.r+e.r*0.6)){q.hitB=1;B.raftHit=1;B.shield=0;B2.stats.imp=(B2.stats.imp||0)+1;
              for(let j=0;j<16;j++)addPart(e.x,e.y-30,rand(-120,120),rand(-220,-60),0.7,j%2?'#ffd23a':'#ff6a1a',5,300);stuck(e,B,4,'Bè lửa đâm trúng! Thuyền Ô Mã Nhi bốc cháy.')}
            if(Math.random()<0.35)addPart(q.x+rand(-20,20),q.y-10,rand(-15,15),rand(-90,-40),0.5,Math.random()<0.5?'#ff7a2a':'#ffd23a',4,-30,'c',1)}})}})}
  later(5.5,()=>{if(hasEngaged(e,B)&&!B.raftHit)shieldDecay(B,0.12,'Giáp thuyền cháy sém')})}
function drawRaft(h,k){cx.save();cx.translate(h.x,h.y);cx.rotate(h.a||Math.atan2(h.mv[1],h.mv[0]));cx.fillStyle='#5a3a1e';cx.strokeStyle='rgba(20,10,4,0.85)';cx.lineWidth=1.5;
  for(let i=-2;i<=2;i++){cx.beginPath();cx.roundRect(-30,i*9-4,60,8,3);cx.fill();cx.stroke()}cx.restore();
  for(let i=0;i<5;i++){const fx=h.x-20+i*10,fh=16+Math.sin(G.t*12+i*1.7)*6;cx.fillStyle=i%2?'#ffd23a':'#ff6a1a';cx.beginPath();cx.moveTo(fx-6,h.y-4);cx.quadraticCurveTo(fx-4,h.y-4-fh,fx,h.y-10-fh);cx.quadraticCurveTo(fx+4,h.y-4-fh,fx+6,h.y-4);cx.fill()}}
function aEscape(e,B){const a=AR(),an=Math.atan2(e.y-a.y,e.x-a.x)+rand(-0.6,0.6);
  const ex=clampArena({x:a.x+Math.cos(an)*a.r,y:a.y+Math.sin(an)*a.r*0.82},14),d=dist(e.x,e.y,ex.x,ex.y);if(d<170)return aCharge(e,B,{n:1,len:480,dur:0.85,dmg:2.4,col:C_OM});
  const bx=lerp(e.x,ex.x,0.55),by=lerp(e.y,ex.y,0.55),x0=e.x,y0=e.y;
  const blk=objHz(e,{x:bx,y:by,r:72,kind:'block',dur:0.4});B.esc={x0,y0,x1:ex.x,y1:ex.y,bx,by,t:0,blk,passed:0};
  hz({sh:'rect',x:x0,y:y0,a:Math.atan2(ex.y-y0,ex.x-x0),len:d,w:40,dur:1.0,dmg:0,col:C_ALLY,src:e,kind:'escpath',noBot:1,draw:drawRiderLane});
  UI.toast('Ô Mã Nhi bỏ thuyền tháo chạy! Đứng vào vòng xanh chặn đường hắn.','warn');snd('roar');
  const end=()=>{B2.hz=B2.hz.filter(h=>h!==blk);B.esc=null;B.busy=0;B.actUpd=null};
  busy(e,B,99,(e,B,dt)=>{const s=B.esc;if(!s){B.busy=0;return}s.t+=dt;if(s.t<1.0)return;
    const tx=s.passed?s.x1:s.bx,ty=s.passed?s.y1:s.by,dd=dist(e.x,e.y,tx,ty);
    if(dd>8){const sp=125;e.x+=(tx-e.x)/dd*Math.min(dd,sp*dt);e.y+=(ty-e.y)/dd*Math.min(dd,sp*dt);e.moving=true;e.f=tx>=e.x?1:-1;return}
    if(!s.passed){const p=G.p;if(G.state==='play'&&ellIn(p.x-s.bx,p.y-s.by,s.blk.r+6)){end();B2.stats.imp=(B2.stats.imp||0)+1;stuck(e,B,4.5,'Bắt sống Ô Mã Nhi! Hắn bị trói giữa vòng vây.');return}s.passed=1;return}
    end();e.hp=Math.min(e.max*PH_T[2],e.hp+e.max*0.05);UI.toast('Ô Mã Nhi thoát ra mép sông, hồi sức!','warn');
    hz({sh:'circle',x:e.x,y:e.y,r:160,dur:0.7,dmg:D(e,1.8),col:C_OM,src:e,kind:'water'})})}
/* -- Chiêu Tăng: voi giẫm, súng thần công, làn pháo phục binh Tây Sơn -- */
function ambush(e,B,dbl){const a0=AR(),L=(a0.r+90)*2;warnSnd(true);hornSnd();
  const mk=(a,dur,delay)=>{const c=Math.cos(a),s=Math.sin(a);
    hz({sh:'rect',x:e.x-c*L/2,y:e.y-s*L/2,a,len:L,w:140,dur,delay,br:dur-0.78,dmg:D(e,2.4),col:'#ffd23a',src:e,kind:'ambush',draw:drawAmbush,
      upd:h=>{if(h.fired||h.t>dur-0.9)return;h.x=e.x-c*L/2;h.y=e.y-s*L/2},
      onFire:h=>{for(let u=40;u<h.len;u+=60){const x=h.x+Math.cos(h.a)*u,y=h.y+Math.sin(h.a)*u;addPart(x,y-10,rand(-60,60),rand(-160,-60),0.5,Math.random()<0.5?'#ffd23a':'#5a4a3a',5,300)}G.shake=Math.max(G.shake,9);snd('boom');
        if(hasEngaged(e,B)&&B.stun<=0&&inHz(h,e.x,e.y,0)){B.shield=0;B2.stats.imp=(B2.stats.imp||0)+1;stuck(e,B,4,'Pháo phục binh Tây Sơn bắn trúng Chiêu Tăng!')}
        else shieldDecay(B,0.1,'Giáp voi sứt mẻ')}})};
  const a=angTo(e,G.p);mk(a,2.3,0);if(dbl)mk(a+Math.PI/2,2.0,1.1)}
function drawAmbush(h,k){const c=Math.cos(h.a),s=Math.sin(h.a);cx.strokeStyle=hexA('#fff2b0',0.35+0.5*k);cx.lineWidth=2;cx.setLineDash([10,10]);cx.lineDashOffset=-G.t*60;
  cx.beginPath();cx.moveTo(h.x,h.y);cx.lineTo(h.x+c*h.len,h.y+s*h.len);cx.stroke();cx.setLineDash([]);
  for(const u of[16,h.len-16]){const x=h.x+c*u,y=h.y+s*u;cx.save();cx.translate(x,y);cx.rotate(h.a+(u>20?Math.PI:0));
    cx.fillStyle='#5a3a1e';cx.beginPath();cx.ellipse(0,0,14,26,0,0,TAU);cx.fill();cx.fillStyle='#2a2a30';cx.fillRect(6,-4,20,8);cx.fillStyle='#c8361f';cx.fillRect(-4,-14,6,6);cx.restore()}}

Object.assign(BOSSES,{
 /* ---- Tô Định (Mê Linh, năm 40) ---- */
 todinh:{col:C_TO,ph:[null,
  {name:'Thái Thú Giao Chỉ',tip:'Nỏ bắn thành nan quạt. Đứng vào khe giữa hai nan, rồi né gông xiềng.',gap:2.0,ab:[
    {id:'xbow',w:3,fn:(e,B)=>aFanX(e,B,{dmg:2.0,col:'#ff7a3a'})},
    {id:'whip',w:2,fn:(e,B)=>aRects(e,B,{n:2,gap:0.55,len:270,w:66,dur:0.8,dmg:1.6,col:'#ff5a3a'})},
    {id:'chain',w:2,cd:6,fn:(e,B)=>aCircles(e,B,{n:4,r:68,sp:180,dur:1.1,stag:0.12,dmg:1.6,col:'#9a9aa8',kind:'chain',linger:3,slow:0.4,busy:0.8})}]},
  {name:'Voi Trận Mê Linh',tip:'Đứng trên Trống Đồng xanh để gọi voi chiến. Để Tô Định đuổi theo vào đường voi phi: giáp sắt sẽ vỡ!',gap:1.7,
   enter:(e,B)=>{B.shield=0.6;drums(e,B,3);summon(e,'khiendh',2)},ab:[
    {id:'xbow',w:3,fn:(e,B)=>aFanX(e,B,{dmg:2.0,col:'#ff7a3a',n2:1})},
    {id:'whip',w:2,fn:(e,B)=>aRects(e,B,{n:3,gap:0.5,len:270,w:66,dur:0.75,dmg:1.6,col:'#ff5a3a'})},
    {id:'chain',w:2,cd:6,fn:(e,B)=>aCircles(e,B,{n:4,r:68,sp:190,dur:1.05,stag:0.12,dmg:1.6,col:'#9a9aa8',kind:'chain',linger:3,slow:0.4,busy:0.8})},
    {id:'summon',w:1,cd:20,fn:(e,B)=>{busy(e,B,0.8);summon(e,'linhdh',2)}}]},
  {name:'Tô Định Tháo Chạy',tip:'Tô Định cạo râu định trốn: dồn sát thương để giữ hắn lại! Sóng gông lan ba vòng, chạy vào trong rồi ra ngoài.',gap:1.3,
   enter:(e,B)=>{B.shield=0.4;B.cds.flee=G.t+2.5;summon(e,'linhdh',2);if(!B.drums||!B.drums.length)drums(e,B,3)},ab:[
    {id:'flee',w:5,cd:17,fn:(e,B)=>aFlee(e,B)},
    {id:'rings',w:3,cd:6,fn:(e,B)=>aRings(e,B,{dmg:2.2,col:C_TO})},
    {id:'xbow',w:2,fn:(e,B)=>aFanX(e,B,{dmg:2.0,col:'#ff7a3a',n2:1})},
    {id:'chain',w:1,cd:7,fn:(e,B)=>aCircles(e,B,{n:5,r:68,sp:200,dur:1.0,stag:0.1,dmg:1.6,col:'#9a9aa8',kind:'chain',linger:3,slow:0.4,busy:0.8})}]}]},
 /* ---- Trần Bá Tiên (Vạn Xuân, năm 545) ---- */
 tranbatien:{col:C_TB,ph:[null,
  {name:'Tướng Nhà Lương',tip:'Thương dài đâm ba nhát rồi quét nửa vòng. Lách ngang, đừng lùi thẳng.',gap:2.0,ab:[
    {id:'thrust',w:3,fn:(e,B)=>aRects(e,B,{n:3,gap:0.5,len:350,w:62,dur:0.7,dmg:1.9,col:'#ff5a3a'})},
    {id:'sweep',w:2,cd:5,fn:(e,B)=>aSweep(e,B)},
    {id:'arrows',w:2,fn:(e,B)=>aCircles(e,B,{n:4,r:70,sp:180,dur:1.0,stag:0.15,dmg:1.6,col:'#ff7a3a',busy:0.8})}]},
  {name:'Lũ Hồ Điển Triệt',tip:'Nước lũ tràn khắp hồ! Chạy lên một Gò Đất khác trước khi sóng tới. Gò bạn đang đứng sẽ sụt.',gap:1.7,
   enter:(e,B)=>{mounds(e,B,3);B.cds.flood=G.t+2;summon(e,'cungluong',2)},ab:[
    {id:'flood',w:5,cd:12,fn:(e,B)=>aFlood(e,B)},
    {id:'thrust',w:3,fn:(e,B)=>aRects(e,B,{n:3,gap:0.45,len:350,w:62,dur:0.65,dmg:1.9,col:'#ff5a3a'})},
    {id:'sweep',w:2,cd:5,fn:(e,B)=>aSweep(e,B)}]},
  {name:'Cờ Vạn Xuân',tip:'Đứng trong vòng Cờ Vạn Xuân để có khí thế: +30% sát thương, giảm 25% sát thương nhận. Cờ dời chỗ liên tục.',gap:1.3,ambP:9,ambT0:9,amb:(e,B)=>moveBanner(e,B),
   enter:(e,B)=>{moveBanner(e,B,true);B.cds.flood=G.t+7;summon(e,'linhluong',2)},ab:[
    {id:'flood',w:4,cd:14,fn:(e,B)=>aFlood(e,B)},
    {id:'fan',w:3,fn:(e,B)=>aFanX(e,B,{dmg:2.1,col:'#ff7a3a',n2:1})},
    {id:'thrust',w:2,fn:(e,B)=>aRects(e,B,{n:3,gap:0.42,len:360,w:62,dur:0.6,dmg:1.9,col:'#ff5a3a'})},
    {id:'sweep',w:2,cd:5,fn:(e,B)=>aSweep(e,B)}]}]},
 /* ---- Đỗ Cảnh Thạc (Hoa Lư, loạn 12 sứ quân) ---- */
 docanhthac:{col:C_DC,ph:[null,
  {name:'Sứ Quân Đỗ Động',tip:'Kích lớn quét trước rồi quét sau. Đá lăn theo từng làn: đứng vào làn trống.',gap:2.0,ab:[
    {id:'halberd',w:3,cd:3,fn:(e,B)=>aHalberd(e,B)},
    {id:'boulder',w:3,cd:6,fn:(e,B)=>aBoulders(e,B,3)},
    {id:'charge',w:2,fn:(e,B)=>aCharge(e,B,{n:2,len:430,dur:0.8,dmg:2.4,col:C_DC})}]},
  {name:'Thành Đá Hoa Lư',tip:'Nỏ Liên Châu bắn phủ đấu trường! Nấp sau trụ đá, ở phía khuất tầm Đỗ Cảnh Thạc.',gap:1.6,
   enter:(e,B)=>{pillars(e,B,3);B.cds.lienchau=G.t+2;summon(e,'giaosq',2)},ab:[
    {id:'lienchau',w:5,cd:11,fn:(e,B)=>aLienChau(e,B)},
    {id:'halberd',w:3,cd:3,fn:(e,B)=>aHalberd(e,B)},
    {id:'boulder',w:2,cd:6,fn:(e,B)=>aBoulders(e,B,3)}]},
  {name:'Cờ Lau Tập Trận',tip:'Đứng hai giây trong vòng Cờ Lau để chiếm cờ. Mỗi cờ phá 25% thành lũy, đủ ba cờ thì Đỗ Cảnh Thạc hở sườn!',gap:1.3,
   enter:(e,B)=>{flags(e,B);B.cds.lienchau=G.t+9;summon(e,'linhsq',2)},ab:[
    {id:'halberd',w:3,cd:3,fn:(e,B)=>aHalberd(e,B)},
    {id:'boulder',w:3,cd:5,fn:(e,B)=>aBoulders(e,B,3)},
    {id:'lienchau',w:3,cd:14,fn:(e,B)=>aLienChau(e,B)},
    {id:'charge',w:2,fn:(e,B)=>aCharge(e,B,{n:3,len:430,dur:0.75,dmg:2.4,col:C_DC})}]}]},
 /* ---- Quách Quỳ (Như Nguyệt, 1077) ---- */
 quachquy:{col:C_QQ,keep:10,ph:[null,
  {name:'Chủ Tướng Nhà Tống',tip:'Máy bắn đá ném đá tảng theo bạn: rời bóng đá rơi. Xung phong hai lượt, lách ngang.',gap:2.0,ab:[
    {id:'treb',w:3,fn:(e,B)=>aTrebuchet(e,B,3)},
    {id:'charge',w:3,cd:4,fn:(e,B)=>aCharge(e,B,{n:2,len:460,dur:0.8,dmg:2.4,col:C_QQ})},
    {id:'xbow',w:2,fn:(e,B)=>aFanX(e,B,{dmg:2.0,col:'#ff7a3a'})}]},
  {name:'Nam Quốc Sơn Hà',tip:'Bốn tấm bia sáng lần lượt. Chạm bia đang sáng theo thứ tự để đọc bài thơ thần: quân Tống sẽ mất tinh thần!',gap:1.6,
   enter:(e,B)=>{poem(e,B,0.6);summon(e,'notong',2)},ab:[
    {id:'treb',w:3,fn:(e,B)=>aTrebuchet(e,B,3)},
    {id:'riders',w:3,cd:9,fn:(e,B)=>{busy(e,B,0.8);hornSnd();aRiders(e,B,{ang:Math.random()*TAU,n:8,gaps:3,dur:1.75,dmg:2.8,type:'kytong'})}},
    {id:'charge',w:2,cd:4,fn:(e,B)=>aCharge(e,B,{n:2,len:460,dur:0.75,dmg:2.4,col:C_QQ})}]},
  {name:'Phòng Tuyến Như Nguyệt',tip:'Kỵ binh Tống vượt sông hai hướng. Đứng vào khe trống và tiếp tục đọc thơ trên bia!',gap:1.3,
   enter:(e,B)=>{poem(e,B,0.45);B.cds.riders=G.t+2;summon(e,'kytong',2)},ab:[
    {id:'riders',w:4,cd:8,fn:(e,B)=>{busy(e,B,0.9);hornSnd();const a=Math.random()*TAU;aRiders(e,B,{ang:a,n:8,gaps:3,dur:1.75,dmg:2.8,type:'kytong'});aRiders(e,B,{ang:a+Math.PI/2,n:8,gaps:3,dur:1.0,delay:1.3,dmg:2.8,type:'kytong'})}},
    {id:'treb',w:3,fn:(e,B)=>aTrebuchet(e,B,4)},
    {id:'charge',w:2,cd:4,fn:(e,B)=>aCharge(e,B,{n:3,len:460,dur:0.7,dmg:2.4,col:C_QQ})}]}]},
 /* ---- Ô Mã Nhi (Bạch Đằng 1288) ---- */
 omanhi:{col:C_OM,ph:[null,
  {name:'Thủy Quân Nguyên',tip:'Thuyền chiến húc thẳng, tên lửa rơi thành đám cháy. Lách ngang khỏi đường húc.',gap:2.0,ab:[
    {id:'ram',w:3,cd:4,fn:(e,B)=>aCharge(e,B,{n:2,len:480,dur:0.85,dmg:2.5,col:C_OM})},
    {id:'firearrow',w:3,fn:(e,B)=>aCircles(e,B,{n:5,r:66,sp:200,dur:1.0,stag:0.13,dmg:1.7,col:'#ff6a2a',kind:'fire',linger:2.5,tdmg:0.3,busy:0.8})},
    {id:'volley',w:1,fn:(e,B)=>aVolley(e,B,{n:14,dmg:0.9,proj:'fire',col:C_OM})}]},
  {name:'Bè Lửa Bạch Đằng',tip:'Bè lửa trôi theo dòng từng làn. Né bè, và dụ thuyền Ô Mã Nhi vào đường bè để đốt cháy!',gap:1.7,ambP:6.5,ambT0:2.5,amb:(e,B)=>rafts(e,B,3),
   enter:(e,B)=>{B.shield=0.65;summon(e,'thuynguyen',2)},ab:[
    {id:'ram',w:3,cd:4,fn:(e,B)=>aCharge(e,B,{n:2,len:480,dur:0.8,dmg:2.5,col:C_OM})},
    {id:'firearrow',w:2,fn:(e,B)=>aCircles(e,B,{n:5,r:66,sp:210,dur:1.0,stag:0.12,dmg:1.7,col:'#ff6a2a',kind:'fire',linger:2.5,tdmg:0.3,busy:0.8})},
    {id:'volley',w:1,fn:(e,B)=>aVolley(e,B,{n:16,dmg:0.9,proj:'fire',col:C_OM})}]},
  {name:'Bắt Sống Ô Mã Nhi',tip:'Ô Mã Nhi bỏ thuyền tháo chạy! Đứng vào vòng xanh giữa đường thoát trước khi hắn tới để bắt sống.',gap:1.3,ambP:8,ambT0:5,amb:(e,B)=>{if(!B.esc)rafts(e,B,2)},
   enter:(e,B)=>{B.shield=0.4;B.cds.escape=G.t+2;summon(e,'cungthuy',2)},ab:[
    {id:'escape',w:6,cd:15,fn:(e,B)=>aEscape(e,B)},
    {id:'ram',w:3,cd:4,fn:(e,B)=>aCharge(e,B,{n:3,len:480,dur:0.75,dmg:2.5,col:C_OM})},
    {id:'firearrow',w:2,fn:(e,B)=>aCircles(e,B,{n:6,r:66,sp:220,dur:1.0,stag:0.1,dmg:1.7,col:'#ff6a2a',kind:'fire',linger:2.5,tdmg:0.3,busy:0.8})}]}]},
 /* ---- Chiêu Tăng (Rạch Gầm – Xoài Mút, 1785) ---- */
 chieutang:{col:C_CT,keep:6,ph:[null,
  {name:'Thủy Binh Xiêm',tip:'Voi chiến giẫm đất làm rung cả vòng lớn. Súng thần công bắn thành chuỗi về phía bạn.',gap:2.0,ab:[
    {id:'stomp',w:2,fn:(e,B)=>aSlam(e,B,{r:155,dur:1.3,dmg:2.1,col:C_CT})},
    {id:'cannon',w:3,fn:(e,B)=>aCannon(e,B)},
    {id:'trample',w:2,cd:5,fn:(e,B)=>aCharge(e,B,{n:1,len:520,dur:1.0,dmg:2.8,col:C_CT})}]},
  {name:'Phục Kích Rạch Gầm',tip:'Thuyền phục binh nã pháo dọc làn vàng giữa bạn và Chiêu Tăng. Giữ hắn trong làn, chỉ bước ra vào giây cuối!',gap:1.7,ambP:7,ambT0:2,amb:(e,B)=>ambush(e,B,false),
   enter:(e,B)=>{B.shield=0.65;summon(e,'giaoxiem',2)},ab:[
    {id:'stomp',w:2,fn:(e,B)=>aSlam(e,B,{r:155,dur:1.25,dmg:2.1,col:C_CT})},
    {id:'cannon',w:3,fn:(e,B)=>aCannon(e,B)},
    {id:'trample',w:2,cd:5,fn:(e,B)=>aCharge(e,B,{n:2,len:520,dur:0.9,dmg:2.8,col:C_CT})}]},
  {name:'Xoài Mút Tan Vỡ',tip:'Hai bờ cùng nã pháo thành chữ thập. Né làn thứ hai, tiếp tục giữ Chiêu Tăng trong làn pháo.',gap:1.3,ambP:6,ambT0:2,amb:(e,B)=>ambush(e,B,true),
   enter:(e,B)=>{B.shield=0.35;summon(e,'linhxiem',2)},ab:[
    {id:'stomp',w:2,fn:(e,B)=>aSlam(e,B,{r:160,dur:1.2,dmg:2.1,col:C_CT})},
    {id:'fireboat',w:2,fn:(e,B)=>aCircles(e,B,{n:5,r:70,sp:200,dur:1.05,stag:0.14,dmg:1.8,col:'#ff5a2a',kind:'fire',linger:2.5,tdmg:0.3,busy:0.9})},
    {id:'cannon',w:2,fn:(e,B)=>aCannon(e,B)},
    {id:'trample',w:2,cd:5,fn:(e,B)=>aCharge(e,B,{n:2,len:520,dur:0.85,dmg:2.8,col:C_CT})}]}]},
});

/* vật thể: Hỏa Đàn (lò lửa) */
ET.b2_hoadan={name:'Hỏa Đàn',body:'b2obj',ai:'none',hp:1,atk:0,spd:0,r:22,range:0,wind:1,cd:99,c:['#ff6a2a','#5a1a0a','#ffd23a'],b2obj:1};

/* ================= GIAO DIỆN ================= */
function css(){if(document.getElementById('b2css'))return;const s=document.createElement('style');s.id='b2css';s.textContent=`
#b2ph{position:absolute;left:0;right:0;top:23%;display:flex;flex-direction:column;align-items:center;pointer-events:none;z-index:30}
#b2ph .band{width:100%;padding:10px 16px 12px;background:linear-gradient(90deg,transparent,rgba(26,14,8,.88) 18%,rgba(26,14,8,.88) 82%,transparent);text-align:center;border-top:1px solid rgba(201,162,78,.55);border-bottom:1px solid rgba(201,162,78,.55)}
#b2ph .t1{font:800 12px/1.2 var(--f-ui);color:var(--vang2,#ffd98a);letter-spacing:.24em}
#b2ph .t2{font:400 clamp(26px,7.4vw,42px)/1.1 var(--f-display);color:#fff2dc;text-shadow:0 3px 10px #000;margin-top:2px}
#b2ph .t3{font:600 13px/1.45 var(--f-ui);color:#ffd0b8;max-width:min(80vw,460px);margin:6px auto 0}
#b2El{position:absolute;left:-27px;bottom:-4px;width:22px;height:22px;pointer-events:none}
#b2El svg{display:block;width:22px;height:22px;filter:drop-shadow(0 1px 2px #000)}
.b2tick{position:absolute;top:0;bottom:0;width:2px;margin-left:-1px;background:rgba(255,236,190,.9);box-shadow:0 0 3px #000;z-index:1}
#bossbar .bar>b{z-index:2}
#bossbar.b2inv .bar{border-color:#fff0c0;box-shadow:0 0 10px rgba(255,220,140,.8)}
#bossbar.b2vuln .bar{border-color:#8affc0;box-shadow:0 0 10px rgba(120,255,170,.7)}
#b2Chan{position:relative;height:7px;margin:4px auto 0;width:78%;border-radius:4px;background:rgba(0,0,0,.6);border:1px solid #ffe08a;overflow:hidden}
#b2Chan>i{position:absolute;inset:0;transform-origin:left;background:linear-gradient(#ffe9a0,#d9902a)}
#b2Dead{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:18px}
.b2nh{display:flex;gap:8px;align-items:flex-start;font:600 13px/1.5 var(--f-ui)!important;color:#5a3a20;background:rgba(122,31,20,.07);border-left:3px solid #b8321f;padding:7px 10px;border-radius:4px;margin:0 0 14px!important}
.b2nh .b2ico{flex:none;margin-top:1px}
.b2ico{vertical-align:-4px}
.b2cyc{display:flex;justify-content:center;margin:2px 0 8px}
.b2you{display:flex;gap:8px;align-items:flex-start;font:600 13.5px/1.55 var(--f-ui);color:var(--diep);margin:8px 0 0}.b2you .b2ico{flex:none;margin-top:2px}
`;document.head.appendChild(s)}
function ensureDom(){css();
  if(!document.getElementById('b2ph')){const d=document.createElement('div');d.id='b2ph';d.hidden=true;d.innerHTML='<div class="band"><div class="t1" id="b2t1"></div><div class="t2" id="b2t2"></div><div class="t3" id="b2t3"></div></div>';
    const bi=document.getElementById('bossIntro');(bi?bi.parentNode:document.body).appendChild(d)}
  const bb=document.getElementById('bossbar');
  if(bb&&!document.getElementById('b2El')){const s=document.createElement('span');s.id='b2El';bb.appendChild(s);
    const bar=bb.querySelector('.bar');for(const f of[66,33]){const u=document.createElement('u');u.className='b2tick';u.style.left=f+'%';bar.appendChild(u)}
    const ch=document.createElement('div');ch.id='b2Chan';ch.hidden=true;ch.innerHTML='<i></i>';bb.appendChild(ch)}
  const dd=document.getElementById('dead');
  if(dd&&!document.getElementById('b2Dead')){const r=document.createElement('div');r.id='b2Dead';r.hidden=true;
    r.innerHTML='<button class="btn" id="b2Retry">Thử lại ngay</button><button class="btn sec" id="b2Camp">Về trại</button>';dd.appendChild(r);
    document.getElementById('b2Retry').onclick=()=>{B2.choice='retry';if(G.p)G.p.deadT=Math.min(G.p.deadT,0.05)};
    document.getElementById('b2Camp').onclick=()=>{B2.choice='camp';if(G.p)G.p.deadT=Math.min(G.p.deadT,0.05)}}}
function phaseBanner(ph,name,tip){ensureDom();const el=document.getElementById('b2ph');
  document.getElementById('b2t1').textContent='GIAI ĐOẠN '+ph+' / 3';document.getElementById('b2t2').textContent=name;document.getElementById('b2t3').textContent=tip;el.hidden=false;
  clearTimeout(B2.phT);
  if(typeof anim!=='undefined'&&anim){anim.killTweensOf(el);anim.fromTo(el,{autoAlpha:0,scaleY:0.3},{autoAlpha:1,scaleY:1,duration:0.3,ease:'power3.out'});anim.fromTo('#b2t2',{letterSpacing:'0.3em'},{letterSpacing:'0.02em',duration:0.9,ease:'power2.out'});anim.to(el,{autoAlpha:0,delay:2.3,duration:0.35,onComplete:()=>el.hidden=true})}
  else B2.phT=setTimeout(()=>el.hidden=true,3000)}
const bbCache={};
function bossBarUpd(){const e=G.boss;if(!e||e.dead||!e.b2){bbCache.k=null;return}ensureDom();const B=e.b2,el=elOf(e);
  if(bbCache.el!==el){bbCache.el=el;document.getElementById('b2El').innerHTML=elSvg(el,22)}
  const qt=quyetTam();let txt='Giai đoạn '+B.ph+'/3';
  if(B.trans)txt='Chuyển giai đoạn';else if(B.immune)txt+=' · Hỏa Giáp: phá Hỏa Đàn';else if(B.stun>0)txt+=' · Sơ hở +50%';else if(B.shield)txt+=' · Khiên −'+Math.round(B.shield*100)+'%';
  if(qt)txt+=' · Quyết Tâm '+qt;
  const r=rel(pEl(),el);if(r>0&&!B.trans)txt+=' · Khắc';
  if(bbCache.t!==txt){bbCache.t=txt;document.getElementById('bossTxt').textContent=txt}
  const bb=document.getElementById('bossbar');const inv=!!(B.trans||B.immune||B.air),vu=B.stun>0;if(bbCache.inv!==inv){bbCache.inv=inv;bb.classList.toggle('b2inv',inv)}if(bbCache.vu!==vu){bbCache.vu=vu;bb.classList.toggle('b2vuln',vu)}
  const ch=document.getElementById('b2Chan');const c=B.chan;if(!!c!==!ch.hidden)ch.hidden=!c;
  if(c){const f=c.need&&c.need<900?Math.min(1,c.got/c.need):c.left!=null?(3-c.left)/3:0;ch.firstChild.style.transform=`scaleX(${f})`}}
/* chết khi đánh boss: hồi sinh cạnh đấu trường */
const _dead=UI.dead.bind(UI);
UI.dead=function(){_dead();ensureDom();const e=G.boss,fight=e&&!e.dead&&e.b2&&e.b2.engaged;B2.choice=null;B2.diedInFight=!!fight;
  document.getElementById('b2Dead').hidden=!fight;
  if(fight){const qt=quyetTam()+1;document.getElementById('deadMsg').textContent=`Thử lại cạnh đấu trường sau 3 giây. Quyết Tâm ${Math.min(5,qt)}: +${Math.min(5,qt)*10}% sát thương lên boss, nhận ít hơn ${Math.min(5,qt)*8}%.`}};
const _respawn=respawn;
respawn=function(){const S=G.save,e=G.boss,fight=B2.diedInFight&&e&&!e.dead&&e.b2;const choice=B2.choice;
  const g0=S.gold;_respawn();B2.diedInFight=false;const db=document.getElementById('b2Dead');if(db)db.hidden=true;
  if(fight){resetBoss(e);S.b2qt=S.b2qt||{};S.b2qt[S.map]=Math.min(5,(S.b2qt[S.map]||0)+1);
    S.gold+=Math.floor((g0-S.gold)/2); // hoàn nửa số vàng mất
    B2.stats.fights.push({map:S.map,win:false,t:Math.round(G.t-e.b2.start),ph:B2.lastPh||1});
    if(choice!=='camp'){const a=AR(),W=G.W,ang=Math.atan2(W.camp.y-a.y,W.camp.x-a.x);let q=null;
      for(let d=a.r+70;d<a.r+400&&!q;d+=24)for(const da of[0,0.25,-0.25,0.5,-0.5,0.9,-0.9]){const x=a.x+Math.cos(ang+da)*d,y=a.y+Math.sin(ang+da)*d;if(!isSolidPt(W,x,y)&&W.walk[Math.floor(y/T)*MW+Math.floor(x/T)]){q={x,y};break}}
      if(q){const p=G.p;p.x=q.x;p.y=q.y;G.cam.x=p.x;G.cam.y=p.y-20}}
    UI.toast(`Quyết Tâm ${S.b2qt[S.map]}: sát thương lên boss +${S.b2qt[S.map]*10}%, nhận ít hơn ${S.b2qt[S.map]*8}%.`,'quest');saveGame()}};
const _bossIntro=UI.bossIntro.bind(UI);
UI.bossIntro=function(e){_bossIntro(e);try{const el=elOf(e),t=document.getElementById('biT1');const tries=e.b2&&e.b2.tries>1?' · Lần '+e.b2.tries:'';t.textContent=(e.def.title||'')+' · Hệ '+NH[el].n+tries}catch(_){}};
/* thẻ chương & bảng nhiệm vụ: giải thích Ngũ Hành */
function nhLine(mi){const pe=pEl()||CLS_EL[G.save.cls],be=ET_EL[MAPS[mi].boss],C=CLASS_BY_ID[G.save.cls],bn=ET[MAPS[mi].boss].name;const r=rel(pe,be);
  return `${elSvg(pe,18)}<span><b>Ngũ Hành:</b> ${esc(C.name)} hệ ${NH[pe].n}, khắc ${NH[KHAC[pe]].n}, bị ${NH[BIKHAC[pe]].n} khắc. Boss ${esc(bn)} hệ ${NH[be].n}${r>0?' (bạn khắc: +25% sát thương)':r<0?' (khắc bạn: cẩn thận!)':''}.</span>`}
const _story=showStoryCard;
showStoryCard=function(mi){_story(mi);try{const lv=document.querySelector('#paper .lv');if(lv){const d=document.createElement('p');d.className='b2nh';d.innerHTML=nhLine(mi);lv.after(d)}}catch(err){console.error(err)}};
function cycleSvg(){const pos={},R=60,cxp=100,cyp=94;NH_ORD.forEach((k,i)=>{const a=-Math.PI/2+i*TAU/5;pos[k]=[cxp+Math.cos(a)*R,cyp+Math.sin(a)*R]});
  let s=`<svg viewBox="0 0 200 184" width="200" height="184" role="img" aria-label="Vòng tương khắc Ngũ Hành"><defs><marker id="b2ar" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5 0 10z" fill="#ff8a6a"/></marker></defs>`;
  for(const k in KHAC){const[a,b]=[pos[k],pos[KHAC[k]]];const dx=b[0]-a[0],dy=b[1]-a[1],d=Math.hypot(dx,dy);s+=`<line x1="${a[0]+dx/d*17}" y1="${a[1]+dy/d*17}" x2="${b[0]-dx/d*19}" y2="${b[1]-dy/d*19}" stroke="#ff8a6a" stroke-width="1.8" marker-end="url(#b2ar)" opacity=".9"/>`}
  NH_ORD.forEach(k=>{const[x,y]=pos[k],E=NH[k];s+=`<g transform="translate(${x-14} ${y-14})"><circle cx="14" cy="14" r="14" fill="${E.d}" stroke="${E.c}" stroke-width="2"/><g transform="translate(2 2)"><path d="${GLYPH[k]}" fill="${E.c}"/></g></g><text x="${x}" y="${y+(y>cyp?28:-19)}" text-anchor="middle" font-size="11.5" font-weight="700" fill="${E.c}" font-family="Be Vietnam Pro,system-ui,sans-serif">${E.n}</text>`});
  return s+'</svg>'}
const _pq=UI.p_quest;
UI.p_quest=function(){let h=_pq.apply(this,arguments);try{const S=G.save,pe=pEl()||CLS_EL[S.cls];
  h+=`<div class="sec"><h4>NGŨ HÀNH TƯƠNG KHẮC</h4><div class="b2cyc">${cycleSvg()}</div>
   <p class="hist">Mũi tên chỉ hệ bị khắc: Kim khắc Mộc, Mộc khắc Thổ, Thổ khắc Thủy, Thủy khắc Hỏa, Hỏa khắc Kim. Đánh kẻ bị mình khắc: <b style="color:#8affc0">+25% sát thương</b>, chịu ít hơn 18%. Gặp kẻ khắc mình: <b style="color:#ff9a7a">−20% sát thương</b>, chịu thêm 20%. Biểu tượng hệ hiện cạnh thanh máu quái và boss.</p>
   <p class="b2you">${nhLine(S.map)}</p></div>`}catch(err){console.error(err)}return h};

/* ================= SÁT THƯƠNG ================= */
HK.on('dmgOut',(d,e,o)=>{if(!e||!G.p)return;
  let m=1;const r=rel(pEl(),elOf(e));if(r>0){m*=ADV_OUT;o.khac=1}else if(r<0){m*=DIS_OUT;o.bikhac=1}
  const B=e.b2;
  if(B){if(B.inv||B.immune||B.air||!B.engaged){o.b2inv=1;return 0.0001}if(B.shield)m*=1-B.shield;if(B.stun>0||B.vuln>0)m*=1.5;m*=1+0.1*quyetTam()}
  if(e.b2owner&&e.b2owner.b2&&e.type==='b2_hoadan')m*=1+0.1*quyetTam();
  if(inBanner())m*=1.3;
  d*=m;
  if(e.sh>0){const a=Math.min(e.sh,d);e.sh-=a;d-=a;e.shHit=G.t;o.b2sh=1;if(e.sh<=0){G.fx.push({k:'ring',x:e.x,y:e.y-14,r:10,r2:60,life:0.35,max:0.35,col:'#ffd23a'});snd('clang')}if(d<=0)return 0.0001}
  if(B){if(B.chan&&B.chan.need)B.chan.got+=d;
    if(d<e.max*0.9&&B.ph<3){const th=nextTh(e);if(e.hp-d<th)d=Math.max(0.0001,e.hp-th)}
    B2.dl.push([G.t,d]);B2.bossHitT=G.t}
  return d});
HK.on('dmgIn',(d,src)=>{if(!src||!G.p||!src.def)return;let m=1;const r=rel(elOf(src),pEl());if(r>0)m*=DIS_IN;else if(r<0)m*=ADV_IN;
  const bo=src.b2?src:src.b2owner;if(bo&&bo.b2)m*=Math.max(0.6,1-0.08*quyetTam());if(inBanner())m*=0.75;return d*m});
let khacT=0;
function findFloat(e,dmg){const s=fmt(dmg);for(let i=G.floats.length-1;i>=Math.max(0,G.floats.length-5);i--){const f=G.floats[i];if(f.txt===s||f.txt===s+'!')return f}return null}
HK.on('hit',(e,dmg,o)=>{
  const f=findFloat(e,dmg),pe=pEl();
  if(o.b2inv){if(f){f.txt=G.t-(B2.invT||0)>0.4?'Miễn':'';f.col='#d8d0c0';f.size=14;B2.invT=G.t}}
  else if(o.b2sh&&dmg<=1){if(f){f.txt='Hộ Thể';f.col='#ffd23a';f.size=13}}
  else if(o.khac){if(f&&!o.crit)f.col=NH[pe].c;
    if(G.t-khacT>0.55){khacT=G.t;addFloat(e.x+rand(-6,6),e.y-30*e.sc-34,'Khắc!',NH[pe].c,15)}
    const S=G.save;if(S&&!S.tut.b2k){S.tut.b2k=1;UI.toast(`Ngũ Hành: ${G.p.cls.name} hệ ${NH[pe].n} khắc ${NH[elOf(e)].n} (+25% sát thương). Xem bảng Nhiệm vụ.`,'quest')}}
  else if(o.bikhac){if(f&&!o.crit)f.col='#b8b0a4';
    const S=G.save;if(S&&!S.tut.b2b){S.tut.b2b=1;UI.toast(`${e.def.name} hệ ${NH[elOf(e)].n} khắc hệ ${NH[pe].n} của bạn: −20% sát thương, chịu thêm 20%.`,'warn')}}
  if(e.b2kbImm){e.kbx=e.kby=0}
  if(e.b2&&!e.dead)checkPhase(e);
  if(e.afx&&!e.dead)affixHit(e);
});

/* ================= QUÁI: SCALING, TINH ANH, AI ================= */
const AFX={cuong:{n:'Cuồng Nộ',c:'#ff5a3a'},hothe:{n:'Hộ Thể',c:'#ffd23a'},phan:{n:'Phân Thân',c:'#c58bff'},bao:{n:'Bạo Liệt',c:'#ff9a3a'}};
B2.AFX=AFX;
HK.on('spawn',e=>{
  if(!G.save||(G.state!=='play'&&G.state!=='dead'))return;
  elOf(e);if(e.def.b2obj)return;
  if(e.boss){bossInit(e);return}
  const S=G.save,mi=S.map,early=mi===0&&S.lvl<4&&!S.ng;
  if(!early){e.atk*=MOB_ATK(mi);e.max=e.hp=Math.round(e.max*1.12)}
  if(e.elite&&!e.clone){e.atk*=1.15;e.max=e.hp=Math.round(e.max*1.2);
    const ids=Object.keys(AFX),n=mi>=3?2:1,got=[];while(got.length<n){const k=pick(ids);if(!got.includes(k))got.push(k)}
    applyAffix(e,got)}});
function applyAffix(e,ids){e.afx=ids;for(const k of ids){
    if(k==='cuong'){e.spd*=1.3;e.cdM=0.6}
    if(k==='hothe'){e.shMax=e.max*0.4;e.sh=e.shMax;e.shHit=-99}
    if(k==='phan'){e.phanN=0}
    if(k==='bao'){e.boT=rand(2,4)}}
  e.name=e.name+' '+ids.map(k=>AFX[k].n).join(' ')}
B2.applyAffix=applyAffix;
function affixHit(e){
  if(e.afx.includes('phan')&&e.phanN<2&&e.hp<e.max*(e.phanN?0.3:0.6)){e.phanN++;
    for(let k=0;k<2;k++){const a=Math.random()*TAU;const c=spawnEnemy(e.type,e.x+Math.cos(a)*40,e.y+Math.sin(a)*30,e.lv,false);c.clone=1;c.max=c.hp=Math.round(e.max*0.22);c.atk=e.atk*0.55;c.name='Phân Thân '+e.def.name;c.state='chase';resolve(G.W,c);
      for(let j=0;j<8;j++)addPart(c.x,c.y-14,rand(-80,80),rand(-120,-20),0.5,'#c58bff',3,200)}snd('magic')}}
HK.on('kill',e=>{
  if(e.afx&&e.afx.includes('bao')){G.tele.push({k:'circle',x:e.x,y:e.y,r:90,t:0,dur:1.0,col:'#ff9a3a',boom:{dmg:e.atk*1.3,lv:e.lv}})}
  if(e.b2){const B=e.b2;for(const m of B.adds)if(!m.dead)m.dead=true;clearHz(false);
    B2.stats.fights.push({map:G.save.map,win:true,t:Math.round(G.t-B.start),mh:Math.round((B.minHp||0)*100)});
    const S=G.save;if(S.b2qt)S.b2qt[S.map]=0;const ph=document.getElementById('b2ph');if(ph)ph.hidden=true}
  if(e.b2owner&&e.b2owner.b2){const B=e.b2owner.b2;B.adds=B.adds.filter(m=>m!==e)}});
const _enemyAct=enemyAct;
enemyAct=function(e,dp){
  if(e.b2lunge){e.b2lunge=0;e.b2wind=0;e.tele=null;e.atkAnim=0;e.state='dash';e.dashT=0.32;e.hitP=false;snd('dash');e.cd=e.def.cd*rand(1.3,1.7)*(e.cdM||1);return}
  _enemyAct(e,dp);if(e.cdM)e.cd*=e.cdM};
const _drawTele=drawEnemyTele;
drawEnemyTele=function(e){if(e.b2wind){const st=e.st;e.st=st*e.def.wind/e.b2wind;_drawTele(e);e.st=st;return}_drawTele(e)};
const _updEnemies=updateEnemies;
updateEnemies=function(dt){
  _updEnemies(dt);
  const p=G.p,S=G.save;if(!p||!S)return;const mi=S.map,early=mi===0&&S.lvl<4&&!S.ng;let crowd=0;
  for(const e of G.enemies)if(!e.dead&&!e.boss&&e.state==='chase'&&e.def.ai==='melee'&&dist2(e.x,e.y,p.x,p.y)<170*170)crowd++;
  for(const e of G.enemies){if(e.dead||e.boss||e.def.b2obj)continue;
    const D=e.def;
    if(e.b2lunge){if(e.state==='wind'){e.lock=e.b2la;if(e.tele)e.tele.a=e.b2la}else{e.b2lunge=0;e.b2wind=0}}
    if(e.stun>0||e.hitstun>0)continue;
    if(e.state==='chase'&&D.ai==='melee'&&G.state==='play'&&!p.inCamp){const dp=dist(e.x,e.y,p.x,p.y);
      // vây ép: tản ra hai bên thay vì xếp hàng
      if(crowd>=2&&dp>e.r+p.r+20&&dp<230){const slot=((e.id*2.39996)%TAU),a=Math.atan2(e.y-p.y,e.x-p.x),da=angDiff(a,slot);if(Math.abs(da)>0.35){const s=da>0?1:-1;const tx=-Math.sin(a)*s,ty=Math.cos(a)*s;moveEnt(G.W,e,tx*e.spd*0.45*dt,ty*e.spd*0.45*dt)}}
      // vồ tới có cảnh báo
      if(!early&&e.cd<=0&&dp>D.range+e.r+20&&dp<D.range+e.r+120&&(e.lungeT||0)<G.t){e.lungeT=G.t+rand(2.5,5);
        if(Math.random()<(e.elite?0.6:0.35)){const a=Math.atan2(p.y-e.y,p.x-e.x);e.state='wind';e.b2wind=0.62;e.st=0.62;e.b2lunge=1;e.b2la=a;e.lock=a;e.atkAnim=0;e.tele={k:'line',len:Math.min(190,dp+50),w:e.r*2+6,a}}}}
    if(e.afx){
      if(e.sh!=null&&e.sh<=0&&G.t-e.shHit>5){e.sh=e.shMax;G.fx.push({k:'ring',x:e.x,y:e.y-14,r:60,r2:10,life:0.35,max:0.35,col:'#ffd23a'})}
      if(e.boT!=null&&e.state!=='idle'&&G.state==='play'&&!p.inCamp&&dist2(e.x,e.y,p.x,p.y)<380*380){e.boT-=dt;if(e.boT<=0){e.boT=rand(4.5,6);G.tele.push({k:'circle',x:p.x,y:p.y,r:72,t:0,dur:1.15,col:'#ff9a3a',boom:{dmg:e.atk*1.15,lv:e.lv}});snd('magic')}}
      if(e.cdM&&Math.random()<0.15)addPart(e.x+rand(-10,10),e.y-rand(10,30),0,rand(-50,-20),0.4,'#ff5a3a',3,0,'c',1)}}};

/* ================= BOT (tự đánh) né đòn boss và làm cơ chế ================= */
// chi phí khi đi thẳng từ (x0,y0) tới (x,y) mất tt giây rồi đứng đó: đòn nổ giữa đường xét vị trí lúc nổ, đòn nổ sau xét điểm đến
function botCost(x0,y0,x,y,tt){let c=0;const P=G.p,mh=P.maxhp||1;
  for(const h of B2.hz){if(h.delay>0||h.noBot)continue;
    if(h.mv&&!h.fired){if(h.hitP)continue;let hit=false;for(let f=0;f<=1.0001&&!hit;f+=0.25){const dt2=Math.max(tt,0.25)*f+0.15,qx=h.x+h.mv[0]*h.sp*dt2,qy=h.y+h.mv[1]*h.sp*dt2;
        const px=tt>0?x0+(x-x0)*Math.min(1,dt2/tt):x,py=tt>0?y0+(y-y0)*Math.min(1,dt2/tt):y;if(ellIn(px-qx,py-qy,h.r+P.r+10))hit=true}
      for(let f=1.25;f<=2.6&&!hit;f+=0.45){const qx=h.x+h.mv[0]*h.sp*f,qy=h.y+h.mv[1]*h.sp*f;if(ellIn(x-qx,y-qy,h.r+P.r+6))hit=true}
      if(hit)c+=1+(h.dmg/mh)*3;continue}
    if(h.fired){if(h.linger&&(h.tdmg||h.pull)){if(inHz(h,x,y,10))c+=0.7;else if(tt>0&&inHz(h,(x0+x)/2,(y0+y)/2,4))c+=0.25}else if(h.linger&&h.slow&&inHz(h,x,y,6))c+=0.15;continue}
    if(!h.dmg)continue;if(h.br==null)h.br=Math.min(h.dur*rand(REACT,REACT+0.35),rand(0.45,0.85));if(h.t<h.br)continue;
    const rem=h.dur-h.t,w=1+(h.dmg/mh)*3;
    if(rem<tt){const f=Math.max(0,rem)/tt;if(inHz(h,x0+(x-x0)*f,y0+(y-y0)*f,12))c+=w}
    else if(inHz(h,x,y,15))c+=(rem<tt+0.6?1:0.7)*w}
  for(const t of G.tele){if(t.t/t.dur<0.25)continue;const rem=t.dur-t.t;if(rem<tt){const f=Math.max(0,rem)/tt;if(dist(t.x,t.y,x0+(x-x0)*f,y0+(y-y0)*f)<t.r+P.r+6)c+=1}else if(rem<tt+1.2&&dist(t.x,t.y,x,y)<t.r+P.r+8)c+=1}
  return c}
function botDodge(){const p=G.p,W=G.W;if(!B2.hz.length)return null;const c0=botCost(p.x,p.y,p.x,p.y,0);if(c0<=0)return null;
  const spd=Math.max(80,p.spd*(B2.slowNow?1-B2.slowNow:1))*0.95;const a=AR();let best=null,bc=c0,bd=0;
  const cand=[];for(let i=0;i<16;i++){const an=i/16*TAU;for(const d of[45,95,155,235])cand.push([p.x+Math.cos(an)*d,p.y+Math.sin(an)*d*0.85])}
  for(const h of B2.hz)if(h.sh==='allbut'&&!h.fired)for(const s of h.safe)cand.push([s.x,s.y]);
  for(const[x,y]of cand){if(isSolidPt(W,x,y))continue;if(G.boss&&G.boss.b2&&G.boss.b2.engaged&&!ellIn(x-a.x,y-a.y,a.r+10))continue;
    const d=Math.hypot(x-p.x,y-p.y),tt=d/spd,c=botCost(p.x,p.y,x,y,tt)+d*0.0006;
    if(c<bc-0.01||(best&&Math.abs(c-bc)<0.01&&d<bd)){bc=c;best=[x,y];bd=d}}
  if(!best)return{mx:0,my:0};const an=Math.atan2(best[1]-p.y,best[0]-p.x);return{mx:Math.cos(an),my:Math.sin(an)}}
function botSkills(t){const p=G.p;for(let i=2;i>=0;i--){if(!canCast(i))continue;const sk=p.cls.skills[i];if(sk.id==='guard'&&p.hp>p.maxhp*0.7)continue;castSkill(i);break}}
function botGoal(){const e=G.boss,p=G.p;if(!e||e.dead||!e.b2)return null;const B=e.b2;
  if(!B.engaged){if(!step_boss())return null;const a=AR();G.autoAtk=false;const nd=navTo(a.x,a.y+40);return{mx:nd[0],my:nd[1]}}
  if(e.state==='intro')return null;
  // phá Hỏa Đàn
  if(B.braz){const bz=B.braz.filter(m=>!m.dead);if(bz.length&&B.chan){let t=bz[0];for(const m of bz)if(dist2(m.x,m.y,p.x,p.y)<dist2(t.x,t.y,p.x,p.y))t=m;
    G.autoAtk=true;G.lastTarget=t;botSkills(t);const C=p.cls.atk,d=dist(p.x,p.y,t.x,t.y);if(d>C.range+t.r-4){const nd=navTo(t.x,t.y);return{mx:nd[0],my:nd[1]}}return{mx:0,my:0}}}
  // mục tiêu vị trí của các boss chương mới
  const goTo=(x,y,r)=>{const C=p.cls.atk;G.lastTarget=e;G.autoAtk=C.type==='shot'||dist(p.x,p.y,e.x,e.y)<C.range+e.r;if(G.autoAtk)botSkills(e);
    if(dist(p.x,p.y,x,y)>r){const an=Math.atan2(y-p.y,x-p.x);return{mx:Math.cos(an),my:Math.sin(an)}}return{mx:0,my:0}};
  const live=h=>h&&h.fired&&B2.hz.includes(h);
  if(B.esc&&B.esc.blk&&!B.esc.passed)return goTo(B.esc.bx,B.esc.by,26);
  if(B.stun<=0&&!B.trans){
    if(B.steles&&B.poemI<4){const s=B.steles[B.poemI];if(live(s))return goTo(s.x,s.y,18)}
    if(B.flagsOn&&B.flagHz){let f=null;for(const q of B.flagHz)if(live(q)&&!q.cap&&(!f||dist2(q.x,q.y,p.x,p.y)<dist2(f.x,f.y,p.x,p.y)))f=q;if(f)return goTo(f.x,f.y,22)}
    if(B.drums&&B.shield>0){let d=null;for(const q of B.drums)if(live(q)&&q.cdT<=0&&(!d||dist2(q.x,q.y,p.x,p.y)<dist2(d.x,d.y,p.x,p.y)))d=q;if(d)return goTo(d.x,d.y,18)}
    if(B.banner&&!inBanner())return goTo(B.banner.x,B.banner.y,40)}
  // dụ boss vào bãi cọc / bùn lầy
  let zones=null;if(G.t-(B2.bossHitT||0)>12)B2.lureOff=G.t+8;const lureOk=G.t>(B2.lureOff||0);
  if(lureOk&&B.stakes&&B.shield&&B.stun<=0)zones=B.stakes;
  if(lureOk&&B.cfg===BOSSES.lieuthang&&B.ph===3&&B.stun<=0)zones=B2.hz.filter(h=>h.kind==='mud'&&h.fired);
  if(zones&&zones.length){let z=null,bd=1e9;for(const q of zones){const d=dist(p.x,p.y,q.x,q.y)+dist(e.x,e.y,q.x,q.y)*0.5;if(d<bd){bd=d;z=q}}
    const an=Math.atan2(z.y-e.y,z.x-e.x),g=clampArena({x:z.x+Math.cos(an)*(z.r+58),y:z.y+Math.sin(an)*(z.r+58)*0.82},18);
    if(dist(p.x,p.y,g.x,g.y)>30){G.autoAtk=p.cls.atk.type==='shot';G.lastTarget=e;const an2=Math.atan2(g.y-p.y,g.x-p.x);return{mx:Math.cos(an2),my:Math.sin(an2)}}
    const C=p.cls.atk;G.autoAtk=C.type==='shot'||dist(p.x,p.y,e.x,e.y)<C.range+e.r;G.lastTarget=e;if(G.autoAtk)botSkills(e);return{mx:0,my:0}}
  return null}
const _autoPlay=autoPlay;
autoPlay=function(dt){
  const dm=B2.dm||(B2.dm={d:0,n:0,a:0});dm.n++;if(G.autoAtk)dm.a++;
  const r=botDodge();if(r)dm.d++;if(r){const t=G.boss&&!G.boss.dead?G.boss:null,p=G.p,C=p.cls.atk;G.autoAtk=!!(t&&(C.type==='shot'||dist(p.x,p.y,t.x,t.y)<C.range+t.r+6));if(t){G.lastTarget=t;if(G.autoAtk&&Math.random()<0.1)botSkills(t)}return r}
  const g=botGoal();if(g)return guardMove(g);
  return guardMove(_autoPlay(dt))};
function guardMove(m){ // đừng tự bước vào vùng sắp nổ khi đang đuổi theo mục tiêu
  if(!B2.hz.length||!m||(!m.mx&&!m.my))return m;const p=G.p,l=Math.hypot(m.mx,m.my)||1,x=p.x+m.mx/l*34,y=p.y+m.my/l*34;
  if(botCost(p.x,p.y,x,y,0.17)>botCost(p.x,p.y,p.x,p.y,0)+0.05)return{mx:0,my:0};return m}

/* bình máu hồi chậm hơn khi đang đánh boss: mỗi đòn trúng có giá */
const POT_CD_BOSS=3.5;
const _usePot=usePot;
usePot=function(k){const r=_usePot(k);const e=G.boss;if(r&&k==='potHP'&&e&&!e.dead&&e.b2&&e.b2.engaged){G.p.potCd=POT_CD_BOSS;
  const S=G.save;if(S&&!S.tut.b2pot){S.tut.b2pot=1;UI.toast('Trong trận boss, Bình Kim Sang cần '+POT_CD_BOSS+' giây để dùng lại.','warn')}}return r};
/* ================= CẬP NHẬT & VẼ ================= */
let prevX=null,prevY=null;
HK.on('tick',dt=>{
  const p=G.p;if(!p)return;
  // chậm trong bùn: kéo lùi một phần quãng vừa đi
  if(B2.slowNow&&prevX!=null&&!p.dash){p.x=lerp(p.x,prevX,B2.slowNow);p.y=lerp(p.y,prevY,B2.slowNow)}
  B2.slowNow=0;
  const e=G.boss;
  if(B2.hz.length||B2.tm.length){
    for(let i=B2.tm.length-1;i>=0;i--){const t=B2.tm[i];t.t-=dt;if(t.t<=0){B2.tm.splice(i,1);try{t.fn()}catch(err){console.error(err)}}}
    updHz(dt)}
  updFx(dt);
  if(e&&!e.dead&&e.b2){const B=e.b2;B2.lastPh=B.ph;if(B.engaged&&G.state==='play')B.minHp=Math.min(B.minHp==null?1:B.minHp,p.hp/p.maxhp);
    // kết giới đấu trường
    if(B.engaged&&G.state==='play'){const a=AR(),dx=p.x-a.x,dy=(p.y-a.y)/0.82,d=Math.hypot(dx,dy),R=a.r+18;if(d>R){p.x=a.x+dx/d*R;p.y=a.y+dy/d*R*0.82;if(!B2.wallT||G.t-B2.wallT>4){B2.wallT=G.t;UI.toast('Kết giới đấu trường: không thể chạy khỏi trận. Mở Bản đồ để về trại.','warn')}}}
    // kiểm tra máu qua ngưỡng (phòng khi mô-đun khác trừ máu trực tiếp)
    if(B.engaged&&!B.trans&&B.ph<3&&e.hp<=e.max*PH_T[B.ph])checkPhase(e)}
  else if(B2.hz.length&&!e){clearHz(false)}
  prevX=p.x;prevY=p.y;
  bossBarUpd()});
const _drawZones=drawZones;
drawZones=function(){_drawZones();if(!B2.hz.length)return;
  // vùng tồn tại vẽ trước, cảnh báo vẽ sau
  for(const h of B2.hz)if(h.fired)drawHz(h);for(const h of B2.hz)if(!h.fired)drawHz(h)};
const _drawEnemy=drawEnemy;
drawEnemy=function(e){
  if(e.def.b2obj){drawBrazier(e);return}
  if(e.clone){cx.save();cx.globalAlpha=0.62;_drawEnemy(e);cx.restore();return}
  const B=e.b2;
  if(B&&B.airH>0){cx.fillStyle='rgba(0,0,0,0.35)';cx.beginPath();cx.ellipse(e.x,e.y,e.r*1.2*(1-B.airH/400),e.r*0.4,0,0,TAU);cx.fill();const y=e.y;e.y-=B.airH;_drawEnemy(e);e.y=y;return}
  if(e.sh>0){const r=e.r*1.6;cx.save();cx.globalAlpha=0.5+Math.sin(G.t*4)*0.1;cx.strokeStyle='#ffd23a';cx.lineWidth=2;cx.fillStyle='rgba(255,210,60,0.12)';cx.beginPath();cx.ellipse(e.x,e.y-18*e.sc,r,r*1.1,0,0,TAU);cx.fill();cx.stroke();cx.restore()}
  _drawEnemy(e)};
function drawBrazier(e){const x=e.x,y=e.y;cx.save();
  cx.fillStyle='rgba(0,0,0,0.35)';cx.beginPath();cx.ellipse(x,y,24,8,0,0,TAU);cx.fill();
  cx.fillStyle='#3a2416';cx.strokeStyle='rgba(20,10,5,0.9)';cx.lineWidth=1.5;for(const s of[-1,1]){cx.beginPath();cx.moveTo(x+s*6,y-20);cx.lineTo(x+s*16,y);cx.lineTo(x+s*12,y);cx.lineTo(x+s*3,y-20);cx.fill();cx.stroke()}
  const gr=cx.createLinearGradient(x-20,0,x+20,0);gr.addColorStop(0,'#5a3418');gr.addColorStop(0.5,'#b8873a');gr.addColorStop(1,'#4a2a12');cx.fillStyle=gr;cx.beginPath();cx.moveTo(x-22,y-34);cx.lineTo(x+22,y-34);cx.lineTo(x+14,y-18);cx.lineTo(x-14,y-18);cx.closePath();cx.fill();cx.stroke();
  for(let i=0;i<5;i++){const fh=18+Math.sin(G.t*12+i*1.7)*6,fx=x-14+i*7;cx.fillStyle=i%2?'#ffd23a':'#ff6a1a';cx.beginPath();cx.moveTo(fx-5,y-34);cx.quadraticCurveTo(fx-3,y-34-fh,fx,y-38-fh);cx.quadraticCurveTo(fx+3,y-34-fh,fx+5,y-34);cx.fill()}
  additive(()=>glow(x,y-44,40,'#ff7a2a',0.55));if(e.flash>0){cx.globalAlpha=Math.min(1,e.flash*8)*0.6;additive(()=>glow(x,y-26,30,'#ffffff',1))}
  cx.restore();if(Math.random()<0.3)addPart(x+rand(-10,10),y-50,rand(-10,10),rand(-90,-50),0.6,'#ffb347',2.5,-20);
  const w=44,by=y-66;cx.fillStyle='rgba(20,10,5,0.75)';cx.fillRect(x-w/2-1,by-1,w+2,6);cx.fillStyle='#ff8a2a';cx.fillRect(x-w/2,by,w*Math.max(0,e.hp/e.max),4);
  cx.font='700 11px "Be Vietnam Pro",system-ui,sans-serif';cx.textAlign='center';cx.lineWidth=3;cx.strokeStyle='rgba(20,10,5,0.85)';cx.strokeText('Hỏa Đàn',x,by-5);cx.fillStyle='#ffd23a';cx.fillText('Hỏa Đàn',x,by-5)}
HK.on('drawWorld',(left,top,vw,vh)=>{
  const p=G.p;if(!G.W)return;
  drawB2Fx();
  // biểu tượng hệ cạnh thanh máu
  for(const e of G.enemies){if(e.dead||e.boss||e.def.b2obj)continue;if(e.x<left-60||e.x>left+vw+60||e.y<top-40||e.y>top+vh+120)continue;
    if(!(e.hp<e.max||e.elite||G.lastTarget===e))continue;const w=e.elite?48:36,y=e.y-(e.def.body==='cav'?64:e.def.body==='human'?68:46)*e.sc;
    const ic=elIcon(elOf(e)),s=e.elite||G.lastTarget===e?15:12;cx.drawImage(ic,e.x-w/2-s-2,y+2-s/2,s,s);
    if(e.sh>0){cx.fillStyle='#ffd23a';cx.fillRect(e.x-w/2,y+5,w*e.sh/e.shMax,2)}
    if(e.afx&&e.afx.length>1&&(e.elite)){/* tên đã có hậu tố tinh anh */}}
  const e=G.boss;
  if(e&&!e.dead&&e.b2){const B=e.b2,a=AR();
    if(B.banner&&B.engaged){const b=B.banner,inb=inBanner(),pu=1+Math.sin(G.t*3)*0.04;cx.save();cx.fillStyle=inb?'rgba(255,215,90,0.22)':'rgba(120,255,170,0.14)';cx.beginPath();cx.ellipse(b.x,b.y,b.r*pu,b.r*0.82*pu,0,0,TAU);cx.fill();
      cx.strokeStyle=inb?'#ffd23a':'#8affc0';cx.lineWidth=3;cx.stroke();cx.strokeStyle='#4a3020';cx.lineWidth=3;cx.beginPath();cx.moveTo(b.x,b.y);cx.lineTo(b.x,b.y-96);cx.stroke();const wv=Math.sin(G.t*4)*4;
      cx.fillStyle='#c8361f';cx.beginPath();cx.moveTo(b.x,b.y-96);cx.quadraticCurveTo(b.x+20,b.y-92+wv,b.x+40,b.y-94);cx.lineTo(b.x+40,b.y-66);cx.quadraticCurveTo(b.x+20,b.y-64+wv,b.x,b.y-68);cx.closePath();cx.fill();blob(cx,b.x+20,b.y-81,6,'#ffd23a');
      cx.font='800 12px "Be Vietnam Pro",system-ui,sans-serif';cx.textAlign='center';cx.lineWidth=3;cx.strokeStyle='rgba(10,30,15,0.9)';const lb=inb?'Khí thế Vạn Xuân!':'Cờ Vạn Xuân';cx.strokeText(lb,b.x,b.y+b.r*0.82+16);cx.fillStyle=inb?'#ffe08a':'#b8ffd6';cx.fillText(lb,b.x,b.y+b.r*0.82+16);cx.restore()}
    if(B.engaged){cx.save();const pu=0.35+Math.sin(G.t*3)*0.12;cx.strokeStyle=hexA(B.cfg.col,pu);cx.lineWidth=4;cx.setLineDash([14,10]);cx.lineDashOffset=-G.t*30;cx.beginPath();cx.ellipse(a.x,a.y,a.r+30,(a.r+30)*0.82,0,0,TAU);cx.stroke();cx.restore()}
    const hy=e.y-(B.airH||0)-(e.def.body==='general'?e.r*3.2:e.r*2.4)-(e.def.body==='rooster'?40:0);
    // biểu tượng hệ trên đầu boss
    cx.drawImage(elIcon(elOf(e)),e.x-10,hy-30,20,20);
    if(B.trans||B.immune){cx.save();cx.globalAlpha=0.35+Math.sin(G.t*10)*0.15;cx.strokeStyle=B.immune?'#ff7a2a':'#fff0c0';cx.lineWidth=3;cx.beginPath();cx.ellipse(e.x,e.y-e.r*1.2,e.r*1.9,e.r*2.3,0,0,TAU);cx.stroke();cx.fillStyle=B.immune?'rgba(255,120,40,0.12)':'rgba(255,240,200,0.12)';cx.fill();cx.restore()}
    if(B.shield&&!B.trans){cx.save();cx.globalAlpha=0.55;cx.strokeStyle='#7fd0ff';cx.lineWidth=2.5;cx.setLineDash([8,6]);cx.beginPath();cx.ellipse(e.x,e.y-e.r*1.1,e.r*1.8,e.r*2.1,0,0,TAU);cx.stroke();cx.restore()}
    if(B.stun>0){for(let k=0;k<4;k++){const an=G.t*5+k*TAU/4;cx.fillStyle='#ffd23a';cx.beginPath();cx.arc(e.x+Math.cos(an)*24,hy+4+Math.sin(an)*6,3.5,0,TAU);cx.fill()}}
    if(B.chan){const c=B.chan,w=90,f=c.need&&c.need<900?Math.min(1,c.got/c.need):c.left!=null?(3-c.left)/3:0;
      cx.fillStyle='rgba(20,10,5,0.85)';cx.fillRect(e.x-w/2-2,hy-46,w+4,10);cx.fillStyle='#ffe08a';cx.fillRect(e.x-w/2,hy-44,w*f,6);
      cx.fillStyle='rgba(255,90,40,0.9)';cx.fillRect(e.x-w/2,hy-36,w*(1-c.t/c.dur),2);
      cx.font='800 12px "Be Vietnam Pro",system-ui,sans-serif';cx.textAlign='center';cx.lineWidth=3;cx.strokeStyle='rgba(20,10,5,0.9)';const tl=c.label+(c.left!=null?' · còn '+c.left+' Hỏa Đàn':' · ngắt!');cx.strokeText(tl,e.x,hy-50);cx.fillStyle='#ffe08a';cx.fillText(tl,e.x,hy-50)}}});

/* ================= GỠ LỖI / KIỂM THỬ ================= */
B2.inHz=inHz;B2.dbgCost=()=>botCost(G.p.x,G.p.y,G.p.x,G.p.y,0).toFixed(2);
B2.setPhase=function(ph){const e=G.boss;if(!e||!e.b2)return;e.hp=e.max*PH_T[ph-1]-1;startTrans(e,ph);e.b2.transT=0.05};
B2.force=function(id){const e=G.boss;if(!e||!e.b2)return false;const B=e.b2;const L=B.cfg.ph[B.ph].ab;const a=L.find(x=>x.id===id);if(!a)return false;B.cds[a.id]=G.t+(a.cd||0);B.last=a.id;a.fn(e,B,dist(e.x,e.y,G.p.x,G.p.y),angTo(e,G.p));return true};
B2.amb=function(){const e=G.boss;if(!e||!e.b2)return;const P=e.b2.cfg.ph[e.b2.ph];if(P.amb)P.amb(e,e.b2)};
B2.pause=function(on){const e=G.boss;if(e&&e.b2)e.b2.next=on?1e9:1};
setTimeout(()=>{try{ensureDom()}catch(e){}},0);
})();

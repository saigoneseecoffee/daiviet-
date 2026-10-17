/* ============ LUYỆN ĐAN & ĐỘT PHÁ ============
   Vòng phát triển Cảnh Giới kiểu Đông y / thuốc Nam:
     hái cây thuốc ngoài bản đồ (Linh Thú canh cây quý) → trồng ở Vườn Thuốc (giờ thật, lớn cả khi tắt máy)
     → luyện đan ở Đan Lô (Hạ / Trung / Thượng phẩm) → uống đan để Đột Phá (có thể thất bại).
   Lưu ở G.save.ld (tạo lười): {v,h:{dược liệu},m:{ldd,hc,hmp},p:{đan:[hạ,trung,thượng]},plots:[{h,t0,d}],nd:{chương:{nút:mốc ms}},buf:{atk|def|exp:{v,t}},fb,gift,pend,day,buy,st}
   Móc prog.js (HK.mod): canBreak, breakGate, realmExtra, realmGo. Bọc: townNpcs, townObjs, drawTownObj, drawNpc, drawPlayer, UI.open, UI.npcPrompt, startGame.
   Móc HK: tick, kill, stats, drawWorld, drawScreen. Xuất: window.LD */
(function(){
const LD={gate:true};window.LD=LD;
const LS={W:null,nodes:[],gd:{},gk:{},gather:null,walkTo:-1,off:0,acc:0,acc2:0,cine:null,sec:'dot',brew:null,talis:0,pick:-1,readyK:'',ico:{},lastMsg:0,raw:0,tUi:0};
const now=()=>Date.now()+LS.off;

/* ---------- dữ liệu ---------- */
/* mi: chương (chỉ số bản đồ) bắt đầu mọc ngoài tự nhiên · g: giá hạt giống · t: giây lớn trong vườn · y: sản lượng · rare: chỉ có ở chỗ Linh Thú canh */
const HERBS=[
 {id:'ct',n:'Cam Thảo Nam',c:'#a8cc5a',mi:0,g:30,t:120,y:[3,5],d:'Rễ ngọt, điều hòa trăm vị thuốc.'},
 {id:'nc',n:'Ngải Cứu',c:'#9cbc8a',mi:0,g:45,t:180,y:[3,5],d:'Lá đắng thơm, ôn kinh, cầm máu.'},
 {id:'hto',n:'Hà Thủ Ô',c:'#b4583a',mi:1,g:150,t:600,y:[2,4],d:'Củ đỏ bổ huyết, đen râu tóc.'},
 {id:'tt',n:'Tam Thất',c:'#d8463a',mi:2,g:300,t:1200,y:[2,4],d:'Kim bất hoán: thánh dược trị thương.'},
 {id:'lc',n:'Linh Chi',c:'#c2452e',mi:3,g:700,t:2400,y:[2,3],d:'Nấm lim quý, an thần, dưỡng khí.'},
 {id:'ns',n:'Nhân Sâm',c:'#e8c27a',mi:5,g:1600,t:5400,y:[2,3],d:'Đại bổ nguyên khí.'},
 {id:'qtm',n:'Quế Trà My',c:'#a5643a',mi:5,g:2000,t:7200,y:[2,3],d:'Vỏ quế xứ Quảng, ôn dương, thông mạch.'},
 {id:'snl',n:'Sâm Ngọc Linh',c:'#f2d27a',mi:7,g:9000,t:14400,y:[1,2],rare:1,rl:7,d:'Sâm núi Ngọc Linh, quốc bảo.'},
 {id:'lkt',n:'Lan Kim Tuyến',c:'#e8c35a',mi:9,g:12000,t:14400,y:[1,2],rare:1,rl:9,d:'Lan lá nhung gân vàng, cực hiếm.'},
];
const HB={};HERBS.forEach((h,i)=>{h.i=i;HB[h.id]=h});
const MATS={ldd:{n:'Linh Đan Dẫn',c:'#ffd98a',d:'Dẫn dược khí vào đan. Linh Thú, tinh anh, boss rơi; Lương Y bán mỗi ngày 1 viên.'},
  hc:{n:'Cao Hổ Cốt',c:'#8a5a2a',d:'Cao nấu từ xương Linh Hổ. Linh Thú từ chương 5 rơi.'},
  hmp:{n:'Hộ Mệnh Phù',c:'#e8402a',d:'Đốt khi đột phá, mỗi lá +10% thành công.'}};
const QN=['Hạ phẩm','Trung phẩm','Thượng phẩm'],QC=['#cfc3a2','#7fd0ff','#ffc53d'];
const PILLS=[
 {id:'tk',n:'Tụ Khí Đan',k:'bt',band:[1,3],c:'#8fe0a0',need:{ct:4,nc:3},mat:{ldd:1},gold:()=>150,d:'Gom khí về đan điền. Đột phá Cảnh Giới 1–3.'},
 {id:'pc',n:'Phá Cảnh Đan',k:'bt',band:[4,6],c:'#62b4ff',need:{hto:4,tt:3,lc:2},mat:{ldd:2},gold:()=>4000,d:'Phá vỡ bình cảnh. Đột phá Cảnh Giới 4–6.'},
 {id:'kt',n:'Kim Thân Đan',k:'bt',band:[7,9],c:'#ffc53d',need:{lc:3,ns:3,qtm:2},mat:{ldd:3,hc:1},gold:()=>40000,d:'Rèn thân như đồng. Đột phá Cảnh Giới 7–9.'},
 {id:'hl',n:'Hồng Lạc Đan',k:'bt',band:[10,12],c:'#ff7a5a',need:{ns:4,snl:2,lkt:2},mat:{ldd:4,hc:2},gold:()=>250000,d:'Khí thiêng giống nòi Lạc Hồng. Đột phá Cảnh Giới 10–12.'},
 {id:'holuc',n:'Hổ Lực Đan',k:'buff',stat:'atk',val:[8,12,18],c:'#ff8a4a',need:{nc:3,hto:1},mat:{},gold:L=>40*L,d:'30 phút tăng công.'},
 {id:'thietbi',n:'Thiết Bì Đan',k:'buff',stat:'def',val:[10,15,22],c:'#9fb8d8',need:{ct:3,tt:1},mat:{},gold:L=>40*L,d:'30 phút tăng thủ.'},
 {id:'ngodao',n:'Ngộ Đạo Đan',k:'buff',stat:'exp',val:[20,30,50],c:'#c58bff',need:{ct:2,nc:2,lc:1},mat:{},gold:L=>60*L,d:'30 phút tăng kinh nghiệm.'},
 {id:'hh',n:'Hoạt Huyết Tán',k:'heal',val:[[3,2],[5,3],[8,5]],c:'#ff6a6a',need:{ct:2,nc:1},mat:{},gold:L=>15*L,d:'Sắc ngay thành Bình Kim Sang và Bình Nội Lực.'},
];
const PB={};PILLS.forEach(p=>PB[p.id]=p);
const BUF_T=1800,BUF_N={atk:'công',def:'thủ',exp:'kinh nghiệm'};
const PLOT_N=6,plotOpen=i=>i<4?0:i===4?2:4;   // ô 5 mở ở Cảnh Giới 2, ô 6 ở Cảnh Giới 4
const NODE_RESP=300e3,GUARD_RESP=480e3;
const R=()=>window.PROG?PROG.REALMS:[];

/* ---------- lưu ---------- */
function ld(){const S=G.save;if(!S)return null;let d=S.ld;
  if(!d)d=S.ld={v:1,h:{},m:{ldd:0,hc:0,hmp:0},p:{},plots:[],nd:{},buf:{},fb:0,gift:0,pend:null,day:0,buy:{},st:{bt:0,ok:0,fail:0,brew:0,harv:0}};
  if(!Array.isArray(d.plots))d.plots=[];while(d.plots.length<PLOT_N)d.plots.push({h:-1,t0:0,d:0});
  for(const k of['ldd','hc','hmp'])if(d.m[k]==null)d.m[k]=0;if(!d.st)d.st={bt:0,ok:0,fail:0,brew:0,harv:0};if(!d.buy)d.buy={};
  return d}
const realm=()=>window.realmIdx?realmIdx():0;
const hcount=id=>{const d=ld();return d?(d.h[id]||0):0};
function addHerb(id,n){const d=ld();d.h[id]=(d.h[id]||0)+n;HK.ev('res','herb_'+id,n,'luyendan')}
function addMat(k,n){const d=ld();d.m[k]=(d.m[k]||0)+n;HK.ev('res','ld_'+k,n,'luyendan')}
function pillArr(id){const d=ld();return d.p[id]||(d.p[id]=[0,0,0])}
const pillN=id=>{const d=ld();const a=d&&d.p[id];return a?a[0]+a[1]+a[2]:0};
function bestQ(id){const a=pillArr(id);for(let q=2;q>=0;q--)if(a[q]>0)return q;return-1}
const btPill=r=>PILLS.find(p=>p.k==='bt'&&r>=p.band[0]&&r<=p.band[1]);
function dayRoll(d){const k=dayKey();if(d.day!==k){d.day=k;d.buy={}}}

/* ---------- định dạng ---------- */
function fmtDur(s){s=Math.max(0,Math.ceil(s));if(s>=3600){const h=Math.floor(s/3600),m=Math.floor(s%3600/60);return h+' giờ'+(m?' '+m+' phút':'')}
  if(s>=60){const m=Math.floor(s/60),x=s%60;return m+' phút'+(x?' '+String(x).padStart(2,'0')+' giây':'')}return s+' giây'}
const fmtShort=s=>{s=Math.max(0,Math.ceil(s));if(s>=3600)return Math.floor(s/3600)+'g'+String(Math.floor(s%3600/60)).padStart(2,'0');if(s>=60)return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');return s+'s'};

/* =================== VẼ (phong cách vector của game) =================== */
function lf(g,x,y,a,l,w,col){g.save();g.translate(x,y);g.rotate(a);g.fillStyle=col;g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(l*0.5,-w,l,0);g.quadraticCurveTo(l*0.5,w,0,0);g.fill();g.restore()}
function stem(g,x0,y0,x1,y1,c,w,bend){g.strokeStyle=c;g.lineWidth=w;g.lineCap='round';g.beginPath();g.moveTo(x0,y0);g.quadraticCurveTo((x0+x1)/2+(bend||0),(y0+y1)/2,x1,y1);g.stroke()}
function dot(g,x,y,r,c){g.fillStyle=c;g.beginPath();g.arc(x,y,r,0,TAU);g.fill()}
/* lá kép chân vịt (sâm, tam thất): n lá chét xòe quanh đầu cuống */
function palm(g,x,y,a,n,l,col,col2){for(let k=0;k<n;k++){const b=a+(k-(n-1)/2)*0.42,ll=l*(1-Math.abs(k-(n-1)/2)*0.16);lf(g,x,y,b,ll,ll*0.3,k%2?col:col2)}}
/* cây thuốc tại gốc (0,0), cao ~34 khi s=1 */
function drawHerb(g,i,s){g.save();g.scale(s,s);g.lineJoin='round';
  g.fillStyle='rgba(0,0,0,0.25)';g.beginPath();g.ellipse(0,0,13,4,0,0,TAU);g.fill();
  switch(HERBS[i].id){
  case'ct':for(let k=0;k<5;k++){const a=-Math.PI/2+(k-2)*0.32,L=22+(k%2)*6,ex=Math.cos(a)*L,ey=Math.sin(a)*L;stem(g,0,0,ex,ey,'#6a8a34',1.4,(k-2)*2);
      for(let j=1;j<5;j++){const t=j/5,px=ex*t,py=ey*t;lf(g,px,py,a-1.1,6,2.4,'#9cc25a');lf(g,px,py,a+1.1,6,2.4,'#88b04a')}
      dot(g,ex,ey,2.4,'#8a7ad8');dot(g,ex-1,ey-1,1,'#d8d0ff')}break;
  case'nc':for(let k=0;k<9;k++){const a=-Math.PI/2+(k-4)*0.3,L=10+((k*7)%5)*2.5;lf(g,0,-2,a,L+6,5,k%2?'#8fae7a':'#a9c496');lf(g,0,-2,a,L,2,'#d0dcc0')}
    for(let k=0;k<5;k++){const a=-Math.PI/2+(k-2)*0.45;lf(g,0,-10,a,12,4,k%2?'#7d9c68':'#94b47e')}break;
  case'hto':{g.fillStyle='#7a4a2a';g.beginPath();g.ellipse(-4,-1,7,4,0.3,0,TAU);g.fill();g.fillStyle='#9a5a34';g.beginPath();g.ellipse(4,0,6,3.4,-0.2,0,TAU);g.fill();
    g.strokeStyle='#8a6a3a';g.lineWidth=2.4;g.beginPath();g.moveTo(1,0);g.lineTo(1,-34);g.stroke();
    g.strokeStyle='#8a2a3a';g.lineWidth=1.4;g.beginPath();for(let y=0;y>-32;y-=2){const x=1+Math.sin(y*0.35)*5;y===0?g.moveTo(x,y):g.lineTo(x,y)}g.stroke();
    for(let k=0;k<7;k++){const y=-6-k*4,sd=k%2?1:-1,x=1+Math.sin(y*0.35)*5;g.save();g.translate(x,y);g.rotate(sd*0.9);g.fillStyle=k%3?'#5f9a3a':'#4a8430';
      g.beginPath();g.moveTo(0,0);g.bezierCurveTo(sd*3,-5,sd*9,-2,sd*8,2);g.bezierCurveTo(sd*7,5,sd*2,4,0,0);g.fill();g.restore()}break}
  case'tt':stem(g,0,0,0,-20,'#5a6a2a',1.8);for(let k=0;k<3;k++){const a=-Math.PI/2+(k-1)*1.25;palm(g,0,-18,a,5,11,'#3f7a3a','#4f8a44')}
    stem(g,0,-18,0,-30,'#5a6a2a',1.2);for(let k=0;k<8;k++){const a=k/8*TAU;dot(g,Math.cos(a)*2.6,-31+Math.sin(a)*2.2,1.7,'#d8322a')}dot(g,0,-31,1.6,'#ff6a4a');break;
  case'lc':{g.fillStyle='#4a3020';g.beginPath();g.moveTo(-11,0);g.lineTo(-9,-12);g.quadraticCurveTo(0,-15,9,-12);g.lineTo(11,0);g.closePath();g.fill();g.fillStyle='#6a4a30';g.beginPath();g.ellipse(0,-12,9,3,0,0,TAU);g.fill();
    const cap=(x,y,r,a)=>{g.save();g.translate(x,y);g.rotate(a);const gr=g.createLinearGradient(0,-r*0.5,0,r*0.5);gr.addColorStop(0,'#c8582a');gr.addColorStop(0.6,'#8a1f14');gr.addColorStop(1,'#5a140c');g.fillStyle=gr;
      g.beginPath();g.ellipse(0,0,r,r*0.55,0,Math.PI,TAU);g.quadraticCurveTo(r*0.4,r*0.32,0,r*0.22);g.quadraticCurveTo(-r*0.4,r*0.32,-r,0);g.fill();g.strokeStyle='#f0c070';g.lineWidth=1.2;g.beginPath();g.ellipse(0,0,r,r*0.55,0,Math.PI,TAU);g.stroke();
      g.strokeStyle='rgba(255,220,160,0.35)';g.lineWidth=0.7;for(let j=1;j<3;j++){g.beginPath();g.ellipse(0,0,r*j/3,r*0.55*j/3,0,Math.PI,TAU);g.stroke()}g.restore()};
    cap(-5,-14,9,-0.25);cap(6,-19,8,0.2);cap(0,-25,6.5,0);break}
  case'ns':{g.fillStyle='#e8d2a0';g.beginPath();g.moveTo(-2,0);g.quadraticCurveTo(-7,4,-9,8);g.lineTo(-6,7);g.quadraticCurveTo(-2,4,0,3);g.quadraticCurveTo(3,6,7,8);g.lineTo(5,4);g.quadraticCurveTo(3,0,2,0);g.fill();
    stem(g,0,0,0,-24,'#6a7a3a',1.8);for(let k=0;k<4;k++){const a=-Math.PI/2+(k-1.5)*0.95;palm(g,0,-22,a,5,12,'#4f8a3a','#62a046')}
    stem(g,0,-22,0,-38,'#6a7a3a',1.2);for(let k=0;k<10;k++){const a=k/10*TAU;dot(g,Math.cos(a)*3,-39+Math.sin(a)*2.6,1.9,'#e8402a')}dot(g,-0.6,-39.6,1.4,'#ff8a6a');break}
  case'qtm':{g.fillStyle='#8a5a32';for(let k=0;k<3;k++){g.save();g.translate(-8+k*5,-2);g.rotate(-0.5+k*0.2);g.fillRect(-1.6,-9,3.2,10);g.fillStyle='#b0703c';g.fillRect(-1.6,-9,1.2,10);g.fillStyle='#8a5a32';g.restore()}
    g.strokeStyle='#6a3a1e';g.lineWidth=3;g.beginPath();g.moveTo(3,0);g.quadraticCurveTo(5,-16,3,-30);g.stroke();
    for(let k=0;k<11;k++){const y=-12-k*2.4,sd=k%2?1:-1;lf(g,3+sd*1,y,sd>0?-0.35:-2.8,10-k*0.3,3.2,k<3?'#b0583a':k%3?'#4f8a3a':'#3f7a30')}break}
  case'snl':{g.fillStyle='#5a6a5a';g.beginPath();g.ellipse(0,-2,14,5,0,0,TAU);g.fill();g.fillStyle='#6f8a4a';g.beginPath();g.ellipse(-3,-4,9,3,0,0,TAU);g.fill();
    g.fillStyle='#f0e0b0';g.beginPath();g.moveTo(-1,-3);g.quadraticCurveTo(-6,1,-8,4);g.lineTo(-5,3);g.quadraticCurveTo(-1,0,1,-1);g.quadraticCurveTo(4,2,7,3);g.lineTo(5,0);g.fill();
    stem(g,0,-3,0,-26,'#7a6a2a',1.8);for(let k=0;k<5;k++){const a=-Math.PI/2+(k-2)*0.78;palm(g,0,-24,a,5,12,'#7ab04a','#c8c25a')}
    stem(g,0,-24,0,-40,'#7a6a2a',1.2);for(let k=0;k<12;k++){const a=k/12*TAU;dot(g,Math.cos(a)*3.4,-41+Math.sin(a)*3,2,'#ff3a2a')}dot(g,-0.6,-41.6,1.6,'#ffb08a');break}
  case'lkt':{for(let k=0;k<5;k++){const a=-Math.PI/2+(k-2)*0.62;g.save();g.translate(0,-2);g.rotate(a);g.fillStyle=k%2?'#24302a':'#2e3a30';g.beginPath();g.ellipse(9,0,9,5,0,0,TAU);g.fill();
      g.strokeStyle='#e8c35a';g.lineWidth=0.8;g.beginPath();g.moveTo(1,0);g.lineTo(17,0);for(let j=0;j<3;j++){g.moveTo(5+j*4,0);g.lineTo(8+j*4,-3.4);g.moveTo(5+j*4,0);g.lineTo(8+j*4,3.4)}g.stroke();g.restore()}
    stem(g,0,-4,1,-32,'#7a5a6a',1.4);for(let k=0;k<5;k++)dot(g,1+(k%2?2:-2),-18-k*3.2,2,'#fff8f0');dot(g,1,-33,1.6,'#fff');break}
  }g.restore()}
function drawStub(g){g.fillStyle='rgba(0,0,0,0.22)';g.beginPath();g.ellipse(0,0,12,3.5,0,0,TAU);g.fill();g.fillStyle='#6a4a2a';g.beginPath();g.ellipse(0,-1,9,3.5,0,0,TAU);g.fill();
  g.strokeStyle='#7a8a4a';g.lineWidth=1.6;g.lineCap='round';for(let k=0;k<4;k++){g.beginPath();g.moveTo(-5+k*3.4,-1);g.lineTo(-5.6+k*3.6,-5-(k%2)*2);g.stroke()}}
/* luống thuốc: v = 999 khóa; 1+herb*4+giai đoạn (0 đất trống, 1 mầm, 2 đang lớn, 3 chín) */
function drawPlot(g,v){const W=33,H=20;
  g.fillStyle='rgba(0,0,0,0.28)';g.beginPath();g.ellipse(3,4,W+5,H*0.55,0,0,TAU);g.fill();
  // bờ luống: nẹp tre chẻ, cọc ở góc
  g.fillStyle='#6a4a26';g.beginPath();g.roundRect(-W,-H,W*2,H+5,7);g.fill();
  g.fillStyle=v===999?'#6e5a3c':'#3e2616';g.beginPath();g.roundRect(-W+4,-H+3,W*2-8,H-4,6);g.fill();
  // ba luống đất vun
  for(let k=0;k<3;k++){const y=-H+6+k*5;g.fillStyle=v===999?'#7a6644':'#5a3822';g.beginPath();g.ellipse(0,y,W-8,2.6,0,0,TAU);g.fill();g.fillStyle=v===999?'rgba(200,180,120,0.25)':'rgba(150,100,60,0.55)';g.beginPath();g.ellipse(0,y-1,W-10,1.1,0,0,TAU);g.fill()}
  g.fillStyle='#b08a4a';g.fillRect(-W+1,-1,W*2-2,5);g.strokeStyle='#5a3c1c';g.lineWidth=1;for(let x=-W+7;x<W;x+=8){g.beginPath();g.moveTo(x,-1);g.lineTo(x,4);g.stroke()}
  g.fillStyle='#d8b878';g.fillRect(-W+1,-1,W*2-2,1.4);
  for(const x of[-W+1,W-4]){g.fillStyle='#5a3a1c';g.fillRect(x,-H-4,4,H+9);g.fillStyle='#8a6a3a';g.fillRect(x,-H-4,4,2)}
  if(v===999){g.fillStyle='#7a9a4a';for(let k=0;k<9;k++){const x=-W+6+k*6.4;g.beginPath();g.moveTo(x,-3);g.lineTo(x+2,-10-(k%3)*2);g.lineTo(x+4,-3);g.fill()}
    g.fillStyle='#5a3a20';g.fillRect(-2,-26,3,22);g.fillStyle='#c9a24e';g.fillRect(-9,-28,17,10);g.strokeStyle='#5a3a20';g.lineWidth=1.4;g.strokeRect(-9,-28,17,10);
    g.fillStyle='#5a3a20';g.fillRect(-3,-25,6,5);g.strokeStyle='#5a3a20';g.lineWidth=1.2;g.beginPath();g.arc(0,-25,2.3,Math.PI,TAU);g.stroke();return}
  if(v<1)return;const hi=Math.floor((v-1)/4),st=(v-1)%4;if(st===0)return;
  const xs=[-19,0,19];
  for(const x of xs){g.save();g.translate(x,-H/2+(x?2:-1));
    if(st===1){g.strokeStyle='#7aa04a';g.lineWidth=1.4;g.beginPath();g.moveTo(0,0);g.lineTo(0,-6);g.stroke();lf(g,0,-6,-2.4,5,2,'#8cc05a');lf(g,0,-6,-0.7,5,2,'#9ccc6a')}
    else drawHerb(g,hi,st===2?0.42:0.62);g.restore()}}
/* đỉnh luyện đan bằng đồng ba chân, hoa văn trống đồng */
function drawCauldron(g,fire){
  g.fillStyle='rgba(0,0,0,0.3)';g.beginPath();g.ellipse(0,0,40,10,0,0,TAU);g.fill();
  g.fillStyle='#7d786c';g.beginPath();g.ellipse(0,-3,36,9,0,0,TAU);g.fill();g.fillStyle='#9a958a';g.beginPath();g.ellipse(0,-6,33,8,0,0,TAU);g.fill();
  if(fire){g.fillStyle='#3a2a1e';g.beginPath();g.ellipse(0,-8,18,4.5,0,0,TAU);g.fill();
    for(let k=0;k<5;k++){const x=-12+k*6,h=10+(k%2)*6;g.fillStyle=k%2?'#ffd23a':'#ff6a2a';g.beginPath();g.moveTo(x-4,-8);g.quadraticCurveTo(x-3,-8-h,x,-10-h);g.quadraticCurveTo(x+3,-8-h,x+4,-8);g.fill()}}
  const leg=(x,s)=>{g.fillStyle='#5a3a1e';g.beginPath();g.moveTo(x-4,-4);g.quadraticCurveTo(x+s*2,-16,x+s*1,-26);g.lineTo(x+s*9,-26);g.quadraticCurveTo(x+s*5,-14,x+4,-4);g.closePath();g.fill();
    g.fillStyle='#8a6a3a';g.beginPath();g.ellipse(x,-4,5,2.2,0,0,TAU);g.fill()};
  leg(-22,1);leg(22,-1);leg(0,0);
  // thân
  const gr=g.createLinearGradient(-30,0,30,0);gr.addColorStop(0,'#4a3018');gr.addColorStop(0.35,'#a87a3a');gr.addColorStop(0.55,'#c8964a');gr.addColorStop(1,'#3a2410');
  g.fillStyle=gr;g.beginPath();g.moveTo(-28,-58);g.quadraticCurveTo(-36,-38,-24,-24);g.quadraticCurveTo(0,-16,24,-24);g.quadraticCurveTo(36,-38,28,-58);g.closePath();g.fill();
  g.strokeStyle='#2a1a0c';g.lineWidth=1.4;g.stroke();
  // hoa văn: vành, răng cưa, chim Lạc cách điệu
  g.strokeStyle='rgba(255,220,140,0.55)';g.lineWidth=1.2;g.beginPath();g.moveTo(-31,-48);g.quadraticCurveTo(0,-42,31,-48);g.stroke();g.beginPath();g.moveTo(-30,-34);g.quadraticCurveTo(0,-27,30,-34);g.stroke();
  g.fillStyle='rgba(255,220,140,0.5)';for(let k=0;k<7;k++){const x=-24+k*8,y=-41+Math.abs(k-3)*0.4;g.beginPath();g.moveTo(x-2.5,y+2);g.quadraticCurveTo(x,y-3,x+3.5,y-1);g.lineTo(x+1,y+0.5);g.lineTo(x-0.5,y+3);g.closePath();g.fill()}
  // quai
  for(const s of[-1,1]){g.strokeStyle='#6a4a22';g.lineWidth=4;g.beginPath();g.moveTo(s*24,-58);g.quadraticCurveTo(s*26,-72,s*16,-70);g.stroke();g.strokeStyle='#c8964a';g.lineWidth=1.4;g.stroke()}
  // miệng & nắp
  g.fillStyle='#3a2410';g.beginPath();g.ellipse(0,-58,29,6.5,0,0,TAU);g.fill();g.fillStyle='#b8863e';g.beginPath();g.ellipse(0,-60,27,6,0,0,TAU);g.fill();
  const lg=g.createLinearGradient(0,-78,0,-60);lg.addColorStop(0,'#d8a858');lg.addColorStop(1,'#7a5226');g.fillStyle=lg;g.beginPath();g.moveTo(-24,-60);g.quadraticCurveTo(-18,-76,0,-77);g.quadraticCurveTo(18,-76,24,-60);g.closePath();g.fill();
  g.strokeStyle='rgba(255,230,170,0.6)';g.lineWidth=1;for(let r=6;r<22;r+=6){g.beginPath();g.ellipse(0,-64,r,r*0.28,0,Math.PI,TAU);g.stroke()}
  g.fillStyle='#ffd98a';g.beginPath();g.moveTo(0,-90);g.quadraticCurveTo(6,-82,4,-77);g.lineTo(-4,-77);g.quadraticCurveTo(-6,-82,0,-90);g.fill();g.fillStyle='#8a5a2a';g.beginPath();g.ellipse(0,-77,6,2,0,0,TAU);g.fill()}
/* biểu tượng viên đan */
function drawPill(g,x,y,r,col,q){const gr=g.createRadialGradient(x-r*0.35,y-r*0.4,r*0.1,x,y,r);gr.addColorStop(0,'#fffaf0');gr.addColorStop(0.35,col);gr.addColorStop(1,shade(col,-0.45));
  if(q>=0){g.save();g.globalAlpha=0.55;g.fillStyle=QC[q];g.beginPath();g.arc(x,y,r*1.32,0,TAU);g.fill();g.restore()}
  g.fillStyle=gr;g.beginPath();g.arc(x,y,r,0,TAU);g.fill();g.strokeStyle='rgba(40,20,5,0.6)';g.lineWidth=r*0.08;g.stroke();
  g.strokeStyle='rgba(255,255,255,0.5)';g.lineWidth=r*0.1;g.beginPath();g.arc(x,y,r*0.62,-2.6,-1.4);g.stroke()}
function drawMat(g,k){g.lineJoin='round';
  if(k==='ldd'){g.fillStyle='rgba(255,210,120,0.25)';g.beginPath();g.arc(0,-14,15,0,TAU);g.fill();g.fillStyle='#e8d8b0';g.beginPath();g.moveTo(-3,-30);g.lineTo(3,-30);g.lineTo(3,-24);g.quadraticCurveTo(11,-20,10,-10);g.quadraticCurveTo(9,-1,0,-1);g.quadraticCurveTo(-9,-1,-10,-10);g.quadraticCurveTo(-11,-20,-3,-24);g.closePath();g.fill();
    g.fillStyle='#ffc53d';g.beginPath();g.ellipse(0,-10,8,7,0,0,TAU);g.fill();g.fillStyle='#fff3c0';g.beginPath();g.arc(-3,-13,2.4,0,TAU);g.fill();g.fillStyle='#c8361f';g.fillRect(-3.5,-33,7,4)}
  else if(k==='hc'){g.fillStyle='#3a2210';g.beginPath();g.roundRect(-12,-18,24,15,3);g.fill();g.fillStyle='#6a3a1a';g.beginPath();g.roundRect(-11,-21,22,13,3);g.fill();
    g.fillStyle='rgba(255,200,140,0.35)';g.fillRect(-9,-19,12,2.5);g.fillStyle='#c9a24e';g.fillRect(-11,-14,22,2);g.fillStyle='#e8d8b0';g.font='700 8px serif';g.textAlign='center';g.fillText('虎',0,-11.5)}
  else{g.save();g.rotate(-0.12);g.fillStyle='#f2d260';g.fillRect(-8,-30,16,28);g.strokeStyle='#c8361f';g.lineWidth=1.2;g.strokeRect(-6.5,-28.5,13,25);
    g.strokeStyle='#c8361f';g.lineWidth=1.6;g.beginPath();g.moveTo(0,-26);g.lineTo(0,-8);g.moveTo(-4,-22);g.lineTo(4,-22);g.moveTo(-4,-15);g.quadraticCurveTo(0,-11,4,-15);g.stroke();
    g.fillStyle='#c8361f';g.beginPath();g.arc(0,-6,2.4,0,TAU);g.fill();g.restore()}}
/* ảnh nhỏ cho bảng: lưu đệm dạng dataURL */
function icon(kind,id,q){const key=kind+id+(q==null?'':q);let u=LS.ico[key];if(u)return u;const c=document.createElement('canvas');c.width=c.height=72;const g=c.getContext('2d');g.translate(36,62);
  if(kind==='h')drawHerb(g,HB[id].i,1.35);else if(kind==='m'){g.scale(1.6,1.6);drawMat(g,id)}else{const P=PB[id];drawPill(g,0,-26,15,P.c,q==null?-1:q)}
  try{u=c.toDataURL()}catch(e){u=''}LS.ico[key]=u;return u}
const img=(kind,id,q,cls)=>`<img class="ldI${cls?' '+cls:''}" src="${icon(kind,id,q)}" alt="" draggable="false">`;

/* ---------- sprite trong thế giới (getSprite → drawObj → drawTownObj) ---------- */
Object.assign(OBJ,{ldherb:{solid:0,w:60,h:64},ldplot:{solid:0,w:84,h:76},ldlo:{solid:1,w:110,h:120}});
const _dto=drawTownObj;drawTownObj=function(g,k,v,P){
  if(k==='ldherb'){const hi=v>>1;if(v&1)drawStub(g);else drawHerb(g,hi,1.05);return}
  if(k==='ldplot'){drawPlot(g,v);return}
  if(k==='ldlo'){drawCauldron(g,1);return}
  return _dto.apply(this,arguments)};

/* ---------- thành: vườn thuốc, đan lô, Lương Y ---------- */
const GARDEN=[[2.75,53.25],[3.95,53.25],[5.15,53.25],[2.75,54.5],[3.95,54.5],[5.15,54.5]];
const LO={x:18.9,y:54.6};
if(typeof LOOKS==='object'&&!LOOKS.luongy)LOOKS.luongy={skin:'#e3c2a0',hair:'#d8d2c6',robe:'#5f7d4e',robe2:'#d8c48a',pants:'#3e4a32',boots:'#2a2018',sash:'#b8862a',armor:'robe',hat:'conical',hatC:'#d9c79a',wp:'none',beard:'full'};
const _to=townObjs;townObjs=function(W,addObj){
  // dọn chỗ cho vườn: bỏ cây liễu và bụi cây trong khoảnh đất trống dưới Mã Trường
  const skip=(o)=>(o.k==='willow'||o.k==='bush'||o.k==='pot')&&o.x>1.8*T&&o.x<6*T&&o.y>52*T&&o.y<55.4*T;
  const r=_to.call(this,W,o=>{if(!skip(o))addObj(o)});
  W.ldPlots=GARDEN.map(([x,y],i)=>{const o={x:x*T,y:y*T,k:'ldplot',v:0,cr:0,s:1,ldp:i};addObj(o);return o});
  const lo={x:LO.x*T,y:LO.y*T,k:'ldlo',v:0,cr:20,s:1};addObj(lo);W.ldLo=lo;
  if(W.labels)W.labels.push({x:3.95*T,y:52.55*T,txt:'Vườn Thuốc'});
  return r};
const _tn=townNpcs;townNpcs=function(W){const L=_tn.apply(this,arguments);
  L.push({id:'luongy',name:'Lương Y',x:6.35*T,y:53.75*T,look:'luongy',act:'ld:vuon'});
  L.push({id:'danlo',name:'Đan Lô',x:LO.x*T,y:(LO.y+0.55)*T,look:'luongy',act:'ld:dan',noBody:1});return L};
const _dn=drawNpc;drawNpc=function(n){if(!n.noBody)return _dn.apply(this,arguments);
  const near=G.nearNpc===n,y=n.y-112;cx.font='700 12px "Be Vietnam Pro",system-ui,sans-serif';cx.textAlign='center';cx.lineWidth=3;cx.strokeStyle='rgba(20,10,5,0.85)';cx.strokeText(n.name,n.x,y);cx.fillStyle='#ffe2a0';cx.fillText(n.name,n.x,y);
  if(near){const b=Math.sin(G.t*3)*3;cx.fillStyle='#ffd23a';cx.beginPath();cx.moveTo(n.x,y-8+b);cx.lineTo(n.x-6,y-18+b);cx.lineTo(n.x+6,y-18+b);cx.fill()}};
const _np=UI.npcPrompt;UI.npcPrompt=function(n){const r=_np.apply(this,arguments);if(n&&String(n.act).startsWith('ld:')){const b=document.getElementById('npcBtn');
  b.textContent=`${n.name}: ${n.act==='ld:dan'?'Luyện đan':'Vườn thuốc, đột phá'}${FINE?' (E)':''}`}return r};
const _op=UI.open;UI.open=function(k,tab){if(typeof k==='string'&&k.startsWith('ld:')){LS.sec=k==='ld:dan'?'dan':(dotGift()||dotBreak())?'dot':'vuon';return HUB.show('luyendan')}return _op.apply(this,arguments)};

/* =================== CÂY THUỐC NGOÀI BẢN ĐỒ =================== */
function genNodes(W){LS.W=W;LS.nodes=[];LS.gd={};LS.gk={};LS.gather=null;LS.walkTo=-1;if(!W||!W.spawnTiles||(window.VT&&VT.on))return;
  const mi=Math.min(W.mi,11),M=W.M,rnd=mulberry32((M.seed||1)*977+mi*13+5);
  const pool=HERBS.filter(h=>!h.rare&&h.mi<=mi);const wt=h=>(h.id==='ct'||h.id==='nc'?1.2:1.5)*(h.mi>=mi-1?2:1);
  let tot=0;pool.forEach(h=>tot+=wt(h));
  const used=[];const okTile=i=>{const t=W.tile[i];if(t!==TG&&t!==TS&&t!==TF)return false;if(W.ogrid[i]&&W.ogrid[i].some(o=>o.cr>0))return false;
    const x=i%MW,y=(i/MW)|0;for(const u of used)if(Math.abs(u%MW-x)+Math.abs(((u/MW)|0)-y)<6)return false;return true};
  const pickTile=(f)=>{for(let k=0;k<200;k++){const i=W.spawnTiles[Math.floor(rnd()*W.spawnTiles.length)];if(okTile(i)&&(!f||f(i))){used.push(i);return i}}return-1};
  const C=W.camp,far=i=>dist((i%MW+.5)*T,(((i/MW)|0)+.5)*T,C.x,C.y)/W.campToArena;
  const nG=mi===0?0:mi===1?1:2;
  for(let k=0;k<nG;k++){const i=pickTile(i=>far(i)>0.42);if(i<0)continue;
    let h;if(mi>=9)h=k%2?HB.lkt:HB.snl;else if(mi>=7)h=HB.snl;else h=pool.slice().sort((a,b)=>b.mi-a.mi)[k%Math.min(2,pool.length)];
    LS.nodes.push({i:LS.nodes.length,x:(i%MW+.5)*T,y:(((i/MW)|0)+.7)*T,h:h.i,g:1})}
  for(let k=0;k<14;k++){const i=pickTile();if(i<0)continue;let r=rnd()*tot,h=pool[0];for(const q of pool){r-=wt(q);if(r<=0){h=q;break}}
    LS.nodes.push({i:LS.nodes.length,x:(i%MW+.5)*T+(rnd()-.5)*20,y:(((i/MW)|0)+.7)*T,h:h.i,g:0})}
  const id=(x,y)=>Math.floor(y/T)*MW+Math.floor(x/T);
  for(const n of LS.nodes){const o={x:n.x,y:n.y,k:'ldherb',v:n.h*2,cr:0,s:n.g?1.2:1};n.o=o;W.objs.push(o);const k=id(n.x,n.y);(W.ogrid[k]||(W.ogrid[k]=[])).push(o)}
  syncNodes()}
function nodeReady(n){const d=ld();const m=d.nd[LS.W.mi];return!m||!m[n.i]||m[n.i]<=now()}
function syncNodes(){if(!G.save)return;for(const n of LS.nodes){n.o.v=n.h*2+(nodeReady(n)?0:1)}}
function guardAlive(n){const e=LS.gd[n.i];return e&&!e.dead&&G.enemies.includes(e)}
function harvestNode(n,quiet){const d=ld(),S=G.save,h=HERBS[n.h];if(!nodeReady(n))return 0;
  const k=n.g?randi(2,3):randi(1,2)+(S.ng?1:0);addHerb(h.id,k);(d.nd[LS.W.mi]||(d.nd[LS.W.mi]={}))[n.i]=now()+(n.g?GUARD_RESP:NODE_RESP);d.st.harv++;
  delete LS.gk[n.i];n.o.v=n.h*2+1;
  if(!quiet){for(let j=0;j<16;j++){const a=Math.random()*TAU,v=rand(40,150);addPart(n.x,n.y-14,Math.cos(a)*v,Math.sin(a)*v*0.6-90,rand(0.5,0.9),j%3?h.c:'#d8f0a0',rand(2,3.6),260)}
    G.fx.push({k:'ring',x:n.x,y:n.y,r:6,r2:46,life:0.4,max:0.4,col:h.c});
    G.floats.push({x:n.x,y:n.y-50,txt:`+${k} ${h.n}`,col:'#cff5a0',size:15,life:1.2,vy:-46});UI.loot(`+${k} ${h.n}`,'#cff5a0');Audio_.play('loot',n.g?3:1)}
  HK.ev('herb',h.id,k);return k}
/* hái: đứng gần cây 0,7 giây (hoặc chạm vào cây để tự đi tới) */
function tickNodes(dt){const W=G.W,p=G.p;if(!W||!p||!G.save)return;if(W!==LS.W)genNodes(W);if(!LS.nodes.length)return;
  LS.acc+=dt;if(LS.acc>0.5){LS.acc=0;syncNodes();
    for(const n of LS.nodes){if(!n.g||!nodeReady(n)||LS.gk[n.i]||guardAlive(n))continue;
      if(dist(p.x,p.y,n.x,n.y)<560&&dist(p.x,p.y,n.x,n.y)>200){const lv=enemyLevelAt(n.x,n.y)+2;const e=spawnEnemy(W.mi%2?'baoden':'ho',n.x+40,n.y+10,lv,true);
        e.max=e.hp=Math.round(e.max*1.4);e.name=(W.mi%2?'Hắc Báo':'Linh Hổ')+' canh dược';e.ldG=n.i;e.hx=n.x;e.hy=n.y;LS.gd[n.i]=e}}}
  // tự đi tới cây đã chạm
  if(LS.walkTo>=0){const n=LS.nodes[LS.walkTo];if(!n||G.input.mx||G.input.my||!nodeReady(n)||G.state!=='play')LS.walkTo=-1;
    else{const d=dist(p.x,p.y,n.x,n.y);if(d<30)LS.walkTo=-1;else{const v=navTo(n.x,n.y);moveEnt(W,p,v[0]*p.spd*dt,v[1]*p.spd*dt);p.moving=true;p.walk+=dt*11;p.f=v[0]>=0.05?1:v[0]<=-0.05?-1:p.f}}}
  let best=null,bd=46;for(const n of LS.nodes){const d=dist(p.x,p.y,n.x,n.y);if(d<bd&&nodeReady(n)){bd=d;best=n}}
  if(!best){LS.gather=null;return}
  if(best.g&&guardAlive(best)&&dist(LS.gd[best.i].x,LS.gd[best.i].y,best.x,best.y)<420){LS.gather=null;if(G.t-LS.lastMsg>3){LS.lastMsg=G.t;G.floats.push({x:best.x,y:best.y-50,txt:'Linh Thú canh giữ!',col:'#ffb38a',size:14,life:1.1,vy:-40})}return}
  if(!LS.gather||LS.gather.n!==best)LS.gather={n:best,t:0};LS.gather.t+=dt;
  if(LS.gather.t>=0.7){harvestNode(best);LS.gather=null}}
HK.on('kill',e=>{if(!G.save||!e||(window.VT&&VT.on&&e.ldG==null))return;
  if(e.ldG!=null){LS.gk[e.ldG]=1;const mi=G.W?G.W.mi:0;const n1=1+(mi>=6?1:0);addMat('ldd',n1);let t=`+${n1} Linh Đan Dẫn`;
    if(mi>=4&&Math.random()<0.6){addMat('hc',1);t+=', +1 Cao Hổ Cốt'}if(Math.random()<0.2){addMat('hmp',1);t+=', +1 Hộ Mệnh Phù'}
    UI.loot(t,'#ffd98a');UI.toast('Hạ Linh Thú! '+t+'. Cây thuốc quý đã có thể hái.','quest');G.fx.push({k:'pillar',x:e.x,y:e.y,w:24,h:220,col:'#ffd98a',life:1,max:1});return}
  if(e.boss){addMat('ldd',1);setTimeout(()=>UI.loot('+1 Linh Đan Dẫn','#ffd98a'),900);return}
  if(e.elite&&Math.random()<0.06){addMat('ldd',1);UI.loot('+1 Linh Đan Dẫn','#ffd98a')}});
/* chạm vào cây thuốc trên màn hình để tự đi tới hái */
function bindTap(){const c=document.getElementById('cv');if(!c||c._ld)return;c._ld=1;
  c.addEventListener('pointerdown',e=>{if(G.state!=='play'||G.paused||!LS.nodes.length||typeof screenToWorld!=='function')return;const[wx,wy]=screenToWorld(e.clientX,e.clientY);
    let best=-1,bd=40;for(const n of LS.nodes){const d=dist(wx,wy,n.x,n.y-14);if(d<bd&&nodeReady(n)){bd=d;best=n.i}}if(best>=0&&dist(G.p.x,G.p.y,LS.nodes[best].x,LS.nodes[best].y)<520)LS.walkTo=best},true)}

/* =================== VƯỜN THUỐC (giờ thật) =================== */
function plotState(i){const d=ld(),pl=d.plots[i];if(realm()<plotOpen(i))return{lock:plotOpen(i)};if(pl.h<0)return{empty:1};
  const el=(now()-pl.t0)/1000,k=Math.min(1,el/pl.d);return{h:pl.h,k,left:Math.max(0,pl.d-el),ready:k>=1,st:k>=1?3:k>=0.4?2:1}}
function syncPlots(){const W=G.W;if(!W||!W.ldPlots||!G.save)return;W.ldPlots.forEach((o,i)=>{const s=plotState(i);o.v=s.lock?999:s.empty?0:1+s.h*4+s.st})}
function seedOk(h){const S=G.save;return h.mi<=Math.max(0,(S.unlocked||1)-1)+(S.ng?11:0)&&(!h.rl||realm()>=h.rl)}
function plant(i,hid,free){const d=ld(),S=G.save,h=HB[hid],s=plotState(i);if(!h)return'Không có hạt này';if(s.lock)return'Ô đất chưa mở';if(!s.empty)return'Ô đất đang trồng';
  if(!free&&!seedOk(h))return'Hạt giống chưa mở';if(!free&&S.gold<h.g)return`Thiếu vàng (cần ${fmtFull(h.g)})`;if(!free)S.gold-=h.g;
  d.plots[i]={h:h.i,t0:now(),d:h.t};syncPlots();saveGame();return''}
function harvestPlot(i){const d=ld(),s=plotState(i);if(!s.ready)return 0;const h=HERBS[s.h],n=randi(h.y[0],h.y[1]);addHerb(h.id,n);d.plots[i]={h:-1,t0:0,d:0};d.st.harv++;syncPlots();saveGame();return{h,n}}
function harvestAll(){let out=[];for(let i=0;i<PLOT_N;i++){const r=harvestPlot(i);if(r)out.push(`+${r.n} ${r.h.n}`)}return out}
const plotsReady=()=>{if(!G.save)return 0;let n=0;for(let i=0;i<PLOT_N;i++)if(plotState(i).ready)n++;return n};

/* =================== ĐAN LÔ =================== */
function lack(P){const d=ld(),S=G.save,o=[];for(const k in P.need)if(hcount(k)<P.need[k])o.push(HB[k].n);for(const k in P.mat)if((d.m[k]||0)<P.mat[k])o.push(MATS[k].n);
  if(S.gold<P.gold(S.lvl))o.push('vàng');return o}
function rollQ(){const d=ld();const th=10+Math.min(15,(d.st.brew||0)*0.5),tr=30;const r=Math.random()*100;return r<th?2:r<th+tr?1:0}
function brew(id,opt){opt=opt||{};const P=PB[id],d=ld(),S=G.save;if(!P)return{err:'Không có đan này'};
  if(!opt.free){const l=lack(P);if(l.length)return{err:'Thiếu '+l.join(', ')};for(const k in P.need)d.h[k]-=P.need[k];for(const k in P.mat)d.m[k]-=P.mat[k];S.gold-=P.gold(S.lvl)}
  const q=opt.q!=null?opt.q:rollQ();d.st.brew=(d.st.brew||0)+1;
  if(P.k==='heal'){const v=P.val[q];S.potHP+=v[0];S.potMP+=v[1];G.dirty.pot=1;if(G.p){G.p.hp=G.p.maxhp;G.p.mp=G.p.maxmp}}
  else pillArr(id)[q]++;
  saveGame();HK.ev('brew',id,q);return{q,P}}
function usePill(id){const P=PB[id],d=ld();if(!P||P.k!=='buff')return'Không dùng được';const q=bestQ(id);if(q<0)return'Chưa có '+P.n;
  pillArr(id)[q]--;const cur=d.buf[P.stat];const v=P.val[q];
  d.buf[P.stat]={v:cur&&cur.v>v&&cur.t>0?cur.v:v,t:BUF_T,id};recalc();saveGame();Audio_.play('magic');
  if(G.p){const p=G.p;G.fx.push({k:'ring',x:p.x,y:p.y,r:8,r2:70,life:0.5,max:0.5,col:P.c});for(let j=0;j<14;j++)addPart(p.x+rand(-14,14),p.y-rand(0,30),0,rand(-110,-50),0.8,P.c,3,0,'c',1)}
  return''}
HK.on('stats',st=>{const S=G.save;if(!S||!S.ld)return;const b=S.ld.buf;if(!b)return;
  if(b.atk&&b.atk.t>0)st.atkp=(st.atkp||0)+b.atk.v;if(b.def&&b.def.t>0)st.def*=1+b.def.v/100;if(b.exp&&b.exp.t>0)st.exp+=b.exp.v});
function tickBuf(dt){const d=G.save&&G.save.ld;if(!d||!d.buf)return;let ch=false;for(const k in d.buf){const b=d.buf[k];if(!b||b.t<=0)continue;b.t-=dt;if(b.t<=0){b.t=0;ch=true;UI.toast(`${PB[b.id]?PB[b.id].n:'Đan'} hết hiệu lực`,'warn')}}if(ch)recalc()}

/* =================== ĐỘT PHÁ =================== */
const nextR=()=>realm()+1;
function talisPrice(){const S=G.save,r=nextR();return 30*S.lvl+100*r*r}
function odds(r,t){const d=ld(),P=btPill(r);const q=P?bestQ(P.id):-1;const qb=q<0?0:[0,5,10][q],fb=Math.min(3,d.fb||0)*10,tb=(t||0)*10;return{base:70,qb,fb,tb,q,tot:Math.min(100,70+qb+fb+tb)}}
function reqs(){const S=G.save,r=nextR(),RR=R()[r];if(!RR)return null;const P=btPill(r);return{r,RR,P,lv:S.lvl>=RR.lv,cq:(S.cq||0)>=RR.cq,pill:P?pillN(P.id)>0:true}}
function dotBreak(){if(!G.save||!G.save.prog||!LD.gate)return false;const q=reqs();return!!q&&q.lv&&q.cq&&q.pill}
function dotGift(){const d=G.save&&G.save.ld;return!!d&&d.gift===1}
/* đổ xúc xắc: tiêu đan và bùa, ghi kết quả treo (pend) để không mất nếu tắt máy giữa chừng */
function roll(talis,force){const S=G.save,d=ld(),q=reqs();if(!q)return{err:'Đã đạt Cảnh Giới cao nhất'};if(!q.lv)return{err:`Cần đạt cấp ${q.RR.lv}`};
  if(!q.cq)return{err:`Thiếu Chân Khí (cần ${fmtFull(q.RR.cq)})`};if(!q.pill)return{err:`Cần ${q.P.n}. Luyện ở Đan Lô.`};
  talis=Math.max(0,Math.min(3,talis|0,d.m.hmp||0));const o=odds(q.r,talis);pillArr(q.P.id)[o.q]--;d.m.hmp-=talis;
  const ok=force!=null?!!force:Math.random()*100<o.tot;d.st.bt++;d.pend={r:q.r,ok,chance:o.tot,talis,q:o.q};saveGame();return{ok,o,q,talis}}
function resolve(){const S=G.save,d=ld(),pd=d&&d.pend;if(!pd)return null;d.pend=null;
  if(realm()+1!==pd.r){saveGame();return null}
  if(pd.ok){LS.raw=1;let e='';try{e=PROG.breakthrough()}finally{LS.raw=0}if(e){d.pend=null;saveGame();return{ok:false,err:e}}d.fb=0;d.st.ok++;saveGame();return{ok:true}}
  const RR=R()[pd.r],loss=Math.min(S.cq||0,Math.round(RR.cq*0.25));S.cq=(S.cq||0)-loss;d.fb=Math.min(3,(d.fb||0)+1);d.st.fail++;saveGame();HK.ev('breakFail',pd.r);return{ok:false,loss,fb:d.fb}}
/* móc vào prog.js */
HK.on('canBreak',(v,r)=>{if(!LD.gate||LS.raw||!G.save)return;const P=btPill(r);return P?pillN(P.id)>0:true});
HK.on('breakGate',(v,r)=>{if(!LD.gate||LS.raw||v)return;const x=roll(0);if(x.err)return x.err;const res=resolve();if(res&&res.ok)return'·';return res?`Đột phá thất bại: mất đan và ${fmtFull(res.loss)} Chân Khí`:'Đột phá thất bại'});
HK.on('realmExtra',(v,r)=>{if(!LD.gate)return;const P=btPill(r);if(!P)return;const n=pillN(P.id),d=ld();
  return v+`<div class="ldReq${n?' ok':''}">${img('p',P.id,n?bestQ(P.id):null)}<div><b>${esc(P.n)} ${n?'×'+n+' ✓':''}</b><small>${n?'Tỉ lệ cơ bản 70%, thêm Hộ Mệnh Phù để chắc chắn hơn.':d.gift===1?'Lương Y ở Phong Châu tặng viên đầu tiên.':'Luyện ở Đan Lô (Phong Châu) hoặc mở Võ Đạo → Luyện Đan.'}</small></div></div>`});
HK.on('realmGo',(v,r)=>{if(!LD.gate)return;LS.sec='dot';HUB.show('luyendan');return true});

/* ---------- cảnh đột phá: ngồi thiền, khí tụ, Thiên Kiếp, vỡ hoặc thành ---------- */
function startCine(talis){const x=roll(talis);if(x.err){UI.toast(x.err,'warn');return false}
  const r=x.q.r,hi=r>=4,bolts=hi?(r>=10?[1.3,1.8,2.2,2.55,2.8]:r>=7?[1.5,2.1,2.6]:[1.9,2.6]):[];
  LS.cine={t:0,last:performance.now(),dur:hi?3.6:3.0,r,ok:x.ok,bolts,hit:0,col:x.q.RR.c,chance:x.o.tot,done:false,name:x.q.RR.n};
  UI.close();G.paused=true;if(G.p)G.p.ifr=Math.max(G.p.ifr,6);Audio_.play('magic');HUB.dots();return true}
function cineDt(){const c=LS.cine;const t=performance.now();const dt=Math.min(0.1,(t-c.last)/1000);c.last=t;return dt}
function tickCine(){const c=LS.cine;if(!c)return;const dt=cineDt();c.t+=dt;updateFx(dt);const p=G.p;
  // khí tụ về đan điền
  if(c.t<c.dur-0.6&&p){for(let k=0;k<3;k++){const a=Math.random()*TAU,rr=rand(90,170);const x=p.x+Math.cos(a)*rr,y=p.y-30+Math.sin(a)*rr*0.6;addPart(x,y,(p.x-x)*1.6,(p.y-34-y)*1.6,0.6,Math.random()<0.5?c.col:'#fff4d0',rand(1.6,3),0,'c',1)}}
  if(c.t>0.6&&Math.floor(c.t*1.6)!==Math.floor((c.t-dt)*1.6))Audio_.tone&&Audio_.tone(80,0.25,'sine',0.25,50);
  while(c.hit<c.bolts.length&&c.t>=c.bolts[c.hit]){c.hit++;c.bolt={t:0.22,seed:Math.random()*1000};G.flash={col:'#cfe8ff',t:0.3,d:0.3};G.shake=Math.max(G.shake,12);Audio_.play('zap');Audio_.play('boom');
    if(p)for(let j=0;j<18;j++){const a=Math.random()*TAU,v=rand(80,240);addPart(p.x,p.y-30,Math.cos(a)*v,Math.sin(a)*v*0.6,0.4,'#d8f0ff',2.6,300,'s',1)}}
  if(c.bolt){c.bolt.t-=dt;if(c.bolt.t<=0)c.bolt=null}
  if(!c.done&&c.t>=c.dur-0.6){c.done=true;const res=resolve();
    if(res&&res.ok){/* prog.js tự diễn hiệu ứng thành công và bảng chúc mừng */}
    else{c.fail=1;G.shake=Math.max(G.shake,16);Audio_.play('fail');if(p){for(let j=0;j<40;j++){const a=Math.random()*TAU,v=rand(120,320);addPart(p.x,p.y-30,Math.cos(a)*v,Math.sin(a)*v*0.7-60,rand(0.6,1.1),j%2?'#5a5a5a':'#ff5a3a',rand(2.5,4.5),420)}
        G.fx.push({k:'ring',x:p.x,y:p.y,r:10,r2:160,life:0.6,max:0.6,col:'#ff5a3a'})}
      const d=ld();failOv(c.name,res?res.loss:0,d.fb)}}
  if(c.t>=c.dur){LS.cine=null;G.paused=!!UI.panel;HUB.dots()}}
function bolt(x0,y0,x1,y1,seed){const R=mulberry32(seed|0);cx.beginPath();cx.moveTo(x0,y0);const n=9;for(let k=1;k<=n;k++){const t=k/n;cx.lineTo(lerp(x0,x1,t)+(k<n?(R()-0.5)*50:0),lerp(y0,y1,t))}cx.stroke()}
HK.on('drawWorld',(left,top,vw,vh)=>{const S=G.save;if(!S)return;
  // cây thuốc chín: ánh sáng nhẹ, vòng hái
  for(const n of LS.nodes){if(n.x<left-40||n.x>left+vw+40||n.y<top-40||n.y>top+vh+80||!nodeReady(n))continue;const h=HERBS[n.h];
    additive(()=>glow(n.x,n.y-14,n.g?34:24,h.c,(n.g?0.32:0.2)+0.08*Math.sin(G.t*3+n.i)));
    if(Math.random()<0.03)addPart(n.x+rand(-10,10),n.y-rand(4,24),0,rand(-30,-14),0.9,'#f8ffd0',1.6,0,'c',1)}
  const gt=LS.gather;if(gt){const n=gt.n,k=Math.min(1,gt.t/0.7);cx.lineWidth=4;cx.strokeStyle='rgba(20,10,5,0.6)';cx.beginPath();cx.arc(n.x,n.y-52,11,0,TAU);cx.stroke();
    cx.strokeStyle='#cff5a0';cx.beginPath();cx.arc(n.x,n.y-52,11,-Math.PI/2,-Math.PI/2+k*TAU);cx.stroke()}
  // vườn: luống chín lấp lánh; đan lô: ánh lửa, khói
  const W=G.W;if(W&&W.ldPlots)for(const o of W.ldPlots){if(o.v>0&&o.v!==999&&(o.v-1)%4===3&&o.x>left-60&&o.x<left+vw+60&&o.y>top-60&&o.y<top+vh+60){additive(()=>glow(o.x,o.y-14,40,'#d8ff9a',0.18+0.08*Math.sin(G.t*3)));if(Math.random()<0.04)addPart(o.x+rand(-24,24),o.y-rand(4,20),0,-26,0.9,'#f8ffd0',1.6,0,'c',1)}}
  if(W&&W.ldLo){const o=W.ldLo;if(o.x>left-80&&o.x<left+vw+80&&o.y>top-140&&o.y<top+vh+40){additive(()=>glow(o.x,o.y-14,50,'#ff8a2a',0.35+0.12*Math.sin(G.t*9)+0.06*Math.sin(G.t*23)));
    if(Math.random()<0.12)addPart(o.x+rand(-6,6),o.y-92,rand(-6,6),rand(-40,-24),1.6,'rgba(230,230,230,0.5)',rand(4,7),-6);if(Math.random()<0.1)addPart(o.x+rand(-14,14),o.y-12,rand(-10,10),rand(-90,-50),0.6,'#ffb347',1.8,0,'c',1)}}
  // cảnh đột phá
  const c=LS.cine,p=G.p;if(c&&p){const k=Math.min(1,c.t/0.5);
    cx.save();cx.translate(p.x,p.y);cx.scale(1,0.38);cx.rotate(c.t*1.2);cx.globalAlpha=0.75*k;cx.strokeStyle=c.col;cx.lineWidth=2.4;const rr=40+30*k;cx.beginPath();cx.arc(0,0,rr,0,TAU);cx.stroke();cx.beginPath();cx.arc(0,0,rr*0.72,0,TAU);cx.stroke();
    cx.fillStyle=c.col;for(let i=0;i<8;i++){cx.rotate(TAU/8);for(let j=0;j<3;j++){const y=rr*0.78+j*3.6;if((i>>j)&1){cx.fillRect(-7,y,5.5,2.2);cx.fillRect(1.5,y,5.5,2.2)}else cx.fillRect(-7,y,14,2.2)}}cx.restore();
    if(c.bolt){cx.save();cx.globalCompositeOperation='lighter';cx.strokeStyle='#e8f6ff';cx.lineWidth=5;cx.shadowColor='#8fd0ff';cx.shadowBlur=20;bolt(p.x+rand(-30,30),top-20,p.x,p.y-40,c.bolt.seed);cx.lineWidth=2;cx.strokeStyle='#fff';bolt(p.x+rand(-60,60),top-20,p.x,p.y-40,c.bolt.seed+7);cx.restore()}}});
HK.on('drawScreen',()=>{const c=LS.cine;if(!c)return;tickCine();if(!LS.cine)return;const p=G.p;const z=G.cam.z;const sx=((p.x-G.cam.x)*z+VW/2)*DPR,sy=((p.y-40-G.cam.y)*z+VH/2)*DPR;
  const a=Math.min(1,c.t/0.4)*(c.t>c.dur-0.4?Math.max(0,(c.dur-c.t)/0.4):1);const gr=cx.createRadialGradient(sx,sy,60*DPR,sx,sy,Math.max(cv.width,cv.height)*0.7);
  gr.addColorStop(0,'rgba(8,4,2,0)');gr.addColorStop(1,`rgba(8,4,2,${0.72*a})`);cx.fillStyle=gr;cx.fillRect(0,0,cv.width,cv.height);
  cx.globalAlpha=a;cx.textAlign='center';cx.font=`800 ${12*DPR}px "Be Vietnam Pro",sans-serif`;cx.fillStyle='#ffd98a';cx.fillText(c.bolts.length?'THIÊN KIẾP · ĐỘT PHÁ':'ĐỘT PHÁ CẢNH GIỚI',cv.width/2,sy-110*DPR);
  cx.font=`400 ${28*DPR}px "Yeseva One",serif`;cx.lineWidth=5*DPR;cx.strokeStyle='rgba(30,10,4,.85)';cx.strokeText(c.name,cv.width/2,sy-80*DPR);cx.fillStyle=c.col;cx.fillText(c.name,cv.width/2,sy-80*DPR);
  cx.font=`700 ${12*DPR}px "Be Vietnam Pro",sans-serif`;cx.fillStyle='#f3e9d4';cx.fillText(`Tỉ lệ thành công ${c.chance}%`,cv.width/2,sy-62*DPR);cx.globalAlpha=1});
/* ngồi thiền lơ lửng trong lúc đột phá */
const _dp=drawPlayer;drawPlayer=function(){const c=LS.cine,p=G.p;if(!c||!p)return _dp.apply(this,arguments);
  const lift=Math.min(1,c.t/0.6)*16+Math.sin(c.t*3)*2;additive(()=>{glow(p.x,p.y-30-lift,60+20*Math.sin(c.t*6),c.col,0.45);glow(p.x,p.y,40,c.col,0.3)});
  cx.fillStyle='rgba(0,0,0,0.25)';cx.beginPath();cx.ellipse(p.x,p.y,14,4.5,0,0,TAU);cx.fill();
  drawHuman(cx,{x:p.x,y:p.y-lift-6,f:p.f,look:p.look,t:G.t,ride:true,walk:0,moving:false});
  if(c.fail&&c.t>c.dur-0.6){cx.globalAlpha=0.5;cx.fillStyle='#3a1a10';cx.beginPath();cx.ellipse(p.x,p.y-30,22,30,0,0,TAU);cx.fill();cx.globalAlpha=1}};
/* bảng thất bại */
function failOv(name,loss,fb){let ov=document.getElementById('ldOv');if(!ov){ov=document.createElement('div');ov.id='ldOv';ov.setAttribute('role','alert');ov.innerHTML='<div class="in"><div class="k">ĐỘT PHÁ THẤT BẠI</div><h2></h2><div class="b"></div><div class="tap">Chạm để tiếp tục</div></div>';
    document.getElementById('app').appendChild(ov);ov.addEventListener('click',()=>{ov.hidden=true})}
  ov.querySelector('h2').textContent='Khí Nghịch';ov.querySelector('.b').innerHTML=`<p>Chưa phá được ${esc(name)}. Viên đan đã tan.</p><p>−${fmtFull(loss)} Chân Khí</p><p class="g">Kinh nghiệm thất bại: lần sau +${fb*10}% thành công</p>`;
  ov.hidden=false;if(anim&&!REDUCED){anim.fromTo(ov,{autoAlpha:0},{autoAlpha:1,duration:.25});anim.fromTo('#ldOv h2',{scale:1.8,autoAlpha:0},{scale:1,autoAlpha:1,duration:.6,ease:'power4.out'})}
  clearTimeout(LS.ovT);LS.ovT=setTimeout(()=>{ov.hidden=true},3800)}

/* =================== BẢNG LUYỆN ĐAN (thẻ trong Võ Đạo) =================== */
const CSS=`
.ldI{width:34px;height:34px;flex:none;object-fit:contain}.ldI.sm{width:24px;height:24px}.ldI.lg{width:44px;height:44px}
.ldSeg{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:4px;margin:0 0 12px;padding:4px;border-radius:12px;background:rgba(0,0,0,.3);border:1px solid rgba(226,178,74,.18)}
.ldSeg button{position:relative;min-height:44px;border-radius:9px;font:700 12.5px/1.15 var(--f-ui);color:var(--dim);background:none;border:0;padding:4px 2px}
.ldSeg button[aria-pressed="true"]{background:linear-gradient(160deg,#6a2a14,#3a160a);color:var(--vang2);box-shadow:inset 0 0 0 1px var(--vang)}
.ldSeg i{position:absolute;top:5px;right:6px;width:8px;height:8px;border-radius:50%;background:var(--son2);box-shadow:0 0 6px var(--son2)}
.ldCard{padding:12px;border-radius:12px;background:rgba(0,0,0,.26);border:1px solid rgba(226,178,74,.18);margin-bottom:10px}
.ldCard h5{margin:0 0 6px;font:700 15px/1.25 var(--f-ui)}.ldCard p{margin:0 0 6px;font:500 12.5px/1.45 var(--f-ui);color:var(--dim)}
.ldGift{border-color:var(--vang);background:radial-gradient(circle at 90% 10%,rgba(255,190,80,.22),transparent 55%),linear-gradient(160deg,#4a2414,#1e110a)}
.ldGr{display:flex;gap:10px;align-items:flex-start;margin-bottom:8px}.ldGr p{margin:0}
.ldHero{padding:14px;border-radius:14px;margin-bottom:10px;background:radial-gradient(ellipse at 50% 0%,color-mix(in srgb,var(--rc) 30%,transparent),transparent 70%),linear-gradient(170deg,#3a2619,#160e09);border:1px solid color-mix(in srgb,var(--rc) 55%,#5a4020);text-align:center}
.ldHero .k{font:700 11px/1 var(--f-ui);letter-spacing:.16em;color:var(--dim)}
.ldHero h3{margin:6px 0 2px;font:400 clamp(24px,7vw,32px)/1.05 var(--f-display);color:var(--rc);text-shadow:0 0 16px color-mix(in srgb,var(--rc) 45%,transparent)}
.ldOdds{font:400 44px/1 var(--f-display);color:var(--vang2);margin:10px 0 4px;font-variant-numeric:tabular-nums}.ldOdds small{font:700 13px var(--f-ui);color:var(--dim);margin-left:4px}
.ldChk{display:grid;gap:6px;margin:10px 0}
.ldChk div{display:flex;align-items:center;gap:8px;min-height:40px;padding:5px 10px;border-radius:10px;background:rgba(0,0,0,.28);border:1px solid rgba(255,120,100,.35);text-align:left;font:600 12.5px/1.3 var(--f-ui)}
.ldChk div.ok{border-color:rgba(127,232,160,.4)}.ldChk div span{flex:1;min-width:0}.ldChk em{font-style:normal;font-weight:800;color:#ff9a8a;white-space:nowrap}.ldChk .ok em{color:#9ff0c0}
.ldChips{display:flex;flex-wrap:wrap;gap:5px;justify-content:center;margin:6px 0}
.ldChips span{padding:3px 9px;border-radius:999px;background:rgba(226,178,74,.12);border:1px solid rgba(226,178,74,.3);font:600 11.5px var(--f-ui);color:var(--vang2);white-space:nowrap}
.ldTal{display:grid;grid-template-columns:44px 1fr 44px;gap:8px;align-items:center;margin:10px 0}
.ldTal button{min-height:44px;border-radius:10px;font:800 20px var(--f-ui)}.ldTal div{display:flex;align-items:center;justify-content:center;gap:6px;font:700 13px/1.3 var(--f-ui);text-align:center}
.ldGo{width:100%;min-height:54px;font-size:17px}
.ldWarn{font:500 12px/1.45 var(--f-ui);color:#ffb38a;margin:8px 0 0}
.ldFur{position:relative;display:block;margin-bottom:10px;border-radius:14px;overflow:hidden;background:radial-gradient(ellipse at 50% 80%,#4a2410,#120b07 70%);border:1px solid rgba(226,178,74,.25)}
.ldFur canvas{display:block;width:100%;height:170px}
.ldFur .cap{position:absolute;left:10px;top:8px;font:700 11px var(--f-ui);letter-spacing:.08em;color:var(--dim)}
.ldFur .res{position:absolute;left:0;right:0;bottom:10px;text-align:center;font:700 14px var(--f-ui);text-shadow:0 1px 3px #000}
.ldRec{display:grid;grid-template-columns:44px minmax(0,1fr);gap:4px 10px;align-items:start;padding:10px;border-radius:12px;background:rgba(0,0,0,.24);border:1px solid rgba(226,178,74,.16);margin-bottom:8px}
.ldRec h5{margin:0;font:700 14px/1.3 var(--f-ui)}.ldRec h5 small{font-weight:600;color:var(--dim);font-size:11.5px}.ldRec p{margin:2px 0 4px;font:500 12px/1.4 var(--f-ui);color:var(--dim)}
.ldRec .act{grid-column:1/-1;display:flex;gap:8px;flex-wrap:wrap}.ldRec .act .btn{min-height:44px;flex:1;min-width:110px}
.ldIng{display:flex;flex-wrap:wrap;gap:4px}.ldIng span{display:inline-flex;align-items:center;gap:2px;padding:1px 7px 1px 2px;border-radius:999px;background:rgba(127,232,160,.1);border:1px solid rgba(127,232,160,.35);font:600 11.5px/1.5 var(--f-ui);color:#bff0cf;white-space:nowrap;font-variant-numeric:tabular-nums}
.ldIng span.no{background:rgba(255,120,100,.1);border-color:rgba(255,120,100,.4);color:#ffab9a}.ldIng img{width:20px;height:20px}
.ldQ{display:flex;gap:4px;margin-top:4px}.ldQ b{padding:1px 7px;border-radius:6px;font:700 11px/1.5 var(--f-ui);background:rgba(0,0,0,.35);border:1px solid}
.ldPlots{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-bottom:10px}
.ldPlot{display:flex;flex-direction:column;align-items:center;gap:3px;min-height:128px;padding:8px 4px;border-radius:12px;background:linear-gradient(170deg,#3a2616,#1a110a);border:1px solid rgba(226,178,74,.18);font:600 11.5px/1.25 var(--f-ui);color:var(--dim);text-align:center;min-width:0}
.ldPlot b{color:var(--ink);font-size:12.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%}
.ldPlot.rdy{border-color:#bfe88a;box-shadow:0 0 12px rgba(190,240,130,.35)}.ldPlot.rdy b{color:#d8ff9a}.ldPlot.sel{border:2px solid var(--vang2)}
.ldPlot .bar{width:86%;height:6px;border-radius:3px;background:rgba(255,255,255,.1);overflow:hidden;margin-top:2px}.ldPlot .bar i{display:block;height:100%;background:linear-gradient(90deg,#4a8a2a,#bfe88a)}
.ldPlot .btn{min-height:40px;width:92%;padding:4px;font-size:12.5px;margin-top:auto}
.ldPlot.lk{opacity:.6}
.ldSeeds{display:grid;gap:6px}
.ldSeed{display:grid;grid-template-columns:36px minmax(0,1fr) auto;gap:8px;align-items:center;min-height:52px;padding:6px 10px;border-radius:10px;background:rgba(0,0,0,.28);border:1px solid rgba(226,178,74,.18);text-align:left;color:var(--ink)}
.ldSeed b{display:block;font:700 13px/1.25 var(--f-ui)}.ldSeed small{display:block;font:500 11.5px/1.3 var(--f-ui);color:var(--dim)}.ldSeed em{font:700 12px var(--f-ui);font-style:normal;color:var(--vang2);white-space:nowrap}
.ldSeed[disabled]{opacity:.45}
.ldInv{display:grid;grid-template-columns:repeat(auto-fill,minmax(98px,1fr));gap:6px}
.ldInv div{display:flex;align-items:center;gap:6px;min-height:52px;padding:5px 8px;border-radius:10px;background:rgba(0,0,0,.28);border:1px solid rgba(226,178,74,.16);min-width:0}
.ldInv span{min-width:0;font:600 11px/1.2 var(--f-ui);color:var(--dim)}.ldInv b{display:block;font:800 15px/1.1 var(--f-ui);color:var(--ink);font-variant-numeric:tabular-nums}
.ldInv .z{opacity:.45}
.ldBuy{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;align-items:center;padding:8px 10px;border-radius:10px;background:rgba(0,0,0,.24);border:1px solid rgba(226,178,74,.16);margin-bottom:6px}
.ldBuy b{font:700 13px var(--f-ui)}.ldBuy small{display:block;font:500 11.5px/1.35 var(--f-ui);color:var(--dim)}.ldBuy .btn{min-height:44px;min-width:96px}
.ldReq{display:flex;align-items:center;gap:8px;margin:6px 0;padding:6px 10px;border-radius:10px;background:rgba(0,0,0,.3);border:1px solid rgba(255,120,100,.4)}.ldReq.ok{border-color:rgba(127,232,160,.45)}
.ldReq b{display:block;font:700 13px var(--f-ui)}.ldReq small{display:block;font:500 11.5px/1.35 var(--f-ui);color:var(--dim)}
.ldBufs{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 10px}.ldBufs span{display:inline-flex;align-items:center;gap:4px;padding:3px 9px 3px 3px;border-radius:999px;background:rgba(0,0,0,.35);border:1px solid rgba(226,178,74,.3);font:700 12px var(--f-ui)}
#ldBuf{position:absolute;left:calc(18px + var(--sl) + min(250px,56vw));top:calc(92px + var(--st));display:flex;flex-direction:column;gap:5px;pointer-events:none}
#ldBuf div{position:relative;width:34px;height:34px;border-radius:50%;background:rgba(20,12,8,.8);border:1.5px solid var(--bc);box-shadow:0 0 8px color-mix(in srgb,var(--bc) 50%,transparent)}
#ldBuf img{width:30px;height:30px;margin:0}#ldBuf b{position:absolute;left:50%;bottom:-6px;transform:translateX(-50%);padding:0 3px;border-radius:5px;background:#0e0a08;font:800 9px/12px var(--f-ui);color:var(--ink);white-space:nowrap;font-variant-numeric:tabular-nums}
@media (max-height:500px){#ldBuf{left:calc(18px + var(--sl) + min(220px,40vw));top:calc(78px + var(--st));flex-direction:row}}
#ldOv{position:absolute;inset:0;z-index:8;display:grid;place-items:center;background:radial-gradient(ellipse at 50% 46%,rgba(90,20,10,.75),rgba(8,4,2,.94) 65%)}
#ldOv .in{text-align:center;padding:24px;max-width:min(92vw,520px)}#ldOv .k{font:800 13px/1 var(--f-ui);letter-spacing:.3em;color:#ff9a7a}
#ldOv h2{margin:10px 0 8px;font:400 clamp(40px,11vw,72px)/1.02 var(--f-display);color:#ff6a4a;text-shadow:0 4px 0 #2a0a04,0 0 36px #ff3a1a}
#ldOv p{margin:0 0 6px;font:600 14px/1.5 var(--f-ui);color:var(--ink)}#ldOv p.g{color:#9ff0c0}#ldOv .tap{margin-top:14px;font:600 12px var(--f-ui);color:var(--dim)}
`;
function css(){if(LS.css)return;LS.css=1;const s=document.createElement('style');s.textContent=CSS;document.head.appendChild(s)}
const SEC=[['dot','Đột phá'],['dan','Đan lô'],['vuon','Vườn'],['kho','Dược liệu']];
function secDot(k){if(k==='dot')return dotBreak()||dotGift();if(k==='vuon')return plotsReady()>0;return false}
function ingHtml(P){const d=ld(),S=G.save;let h='';for(const k in P.need){const n=hcount(k),q=P.need[k];h+=`<span class="${n>=q?'':'no'}">${img('h',k,null,'sm')}${esc(HB[k].n)} ${n}/${q}</span>`}
  for(const k in P.mat){const n=d.m[k]||0,q=P.mat[k];h+=`<span class="${n>=q?'':'no'}">${img('m',k,null,'sm')}${esc(MATS[k].n)} ${n}/${q}</span>`}
  const g=P.gold(S.lvl);h+=`<span class="${S.gold>=g?'':'no'}">${ICO_GOLD} ${fmt(g)}</span>`;return`<div class="ldIng">${h}</div>`}
function htmlDot(){const S=G.save,d=ld();let h='';
  if(d.gift===1)h+=`<div class="ldCard ldGift"><div class="ldGr">${img('p','tk',2,'lg')}<div><h5>Quà của Lương Y</h5><p>“Khí đã đầy mà chưa có đan dẫn thì khó phá ải. Lão tặng con một viên Tụ Khí Đan Thượng phẩm, kèm ít Cam Thảo, Ngải Cứu và Linh Đan Dẫn để tự luyện viên sau.”</p></div></div><button class="btn gold" id="ldGift" style="width:100%;min-height:48px">Nhận quà</button></div>`;
  const q=reqs();if(!q)return h+`<div class="ldCard"><h5>Đã đạt Cảnh Giới cao nhất</h5><p>Tiếp tục luyện đan tăng lực để săn boss và vượt tháp.</p></div>`;
  const tal=Math.max(0,Math.min(LS.talis,3,d.m.hmp||0));LS.talis=tal;const o=odds(q.r,tal);const ok=q.lv&&q.cq&&q.pill;
  const chips=[`Gốc ${o.base}%`];if(o.qb)chips.push(`${QN[o.q]} +${o.qb}%`);if(o.fb)chips.push(`Kinh nghiệm thất bại +${o.fb}%`);if(o.tb)chips.push(`${tal} Hộ Mệnh Phù +${o.tb}%`);
  h+=`<div class="ldHero" style="--rc:${q.RR.c}"><div class="k">ĐỘT PHÁ CẢNH GIỚI ${q.r}/${R().length-1}</div><h3>${esc(q.RR.n)}</h3>
    <div class="ldOdds">${o.tot}%<small>thành công</small></div><div class="ldChips">${chips.map(c=>`<span>${esc(c)}</span>`).join('')}</div>
    <div class="ldChk"><div class="${q.lv?'ok':''}"><span>Cấp nhân vật</span><em>${S.lvl}/${q.RR.lv}</em></div>
      <div class="${q.cq?'ok':''}"><span>Chân Khí</span><em>${fmt(S.cq||0)}/${fmt(q.RR.cq)}</em></div>
      <div class="${q.pill?'ok':''}">${img('p',q.P.id,q.pill?o.q:null,'sm')}<span>${esc(q.P.n)}${q.pill&&o.q>=0?' · '+QN[o.q]:''}</span><em>${pillN(q.P.id)}/1</em></div></div>
    <div class="ldTal"><button class="btn sec" id="ldTm" aria-label="Bớt Hộ Mệnh Phù" ${tal>0?'':'disabled'}>−</button><div>${img('m','hmp',null,'sm')}<span>Đốt ${tal} Hộ Mệnh Phù<br><small style="color:var(--dim);font-weight:600">Có ${d.m.hmp||0} lá · mỗi lá +10%</small></span></div><button class="btn sec" id="ldTp" aria-label="Thêm Hộ Mệnh Phù" ${tal<3&&tal<(d.m.hmp||0)&&o.tot<100?'':'disabled'}>+</button></div>
    <button class="btn gold ldGo" id="ldGo" ${ok?'':'disabled'}>${ok?'Đột phá '+esc(q.RR.n):!q.lv?'Cần cấp '+q.RR.lv:!q.cq?'Cần thêm '+fmt(q.RR.cq-(S.cq||0))+' Chân Khí':'Cần '+esc(q.P.n)}</button>
    <p class="ldWarn">${o.tot>=100?'Chắc chắn thành công.':`Thất bại: viên đan tan, mất ${fmtFull(Math.round(q.RR.cq*0.25))} Chân Khí, lần sau +10% (tối đa +30%).`}</p></div>`;
  if(!q.pill)h+=`<div class="ldCard"><h5>Cách có ${esc(q.P.n)}</h5><p>Luyện ở Đan Lô: cần ${Object.keys(q.P.need).map(k=>HB[k].n+' ×'+q.P.need[k]).join(', ')}, ${Object.keys(q.P.mat).map(k=>MATS[k].n+' ×'+q.P.mat[k]).join(', ')}. Hái cây thuốc phát sáng ngoài bản đồ, trồng ở Vườn Thuốc, hạ Linh Thú để lấy Linh Đan Dẫn.</p><button class="btn" data-sec="dan" style="min-height:44px">Tới Đan Lô</button></div>`;
  h+=`<div class="ldBuy"><div><b>${img('m','hmp',null,'sm')} Hộ Mệnh Phù</b><small>Lương Y bán 3 lá mỗi ngày (còn ${3-(d.buy.hmp||0)})</small></div><button class="btn sec" id="ldBuyT" ${S.gold>=talisPrice()&&(d.buy.hmp||0)<3?'':'disabled'}>${ICO_GOLD} ${fmt(talisPrice())}</button></div>`;
  h+=`<p class="hist" style="color:var(--dim);font-size:12px">Đã đột phá ${d.st.ok} lần, thất bại ${d.st.fail} lần.</p>`;return h}
function htmlDan(){const S=G.save,d=ld();const b=LS.brew;let h=`<div class="ldFur"><canvas id="ldFurC" aria-label="Đan lô"></canvas><span class="cap">ĐAN LÔ · HỎA HẦU ${d.st.brew||0}</span><div class="res" id="ldRes">${b&&b.done?`<span style="color:${QC[b.q]}">${esc(b.P.n)} · ${QN[b.q]}</span>`:''}</div></div>`;
  const th=Math.round(10+Math.min(15,(d.st.brew||0)*0.5));
  h+=`<p class="hist" style="color:var(--dim);font-size:12px;margin:0 0 10px">Phẩm chất: Hạ 60% · Trung 30% · Thượng ${th}%, luyện càng nhiều Thượng phẩm càng dễ ra (tối đa 25%).</p>`;
  const act=Object.keys(d.buf).filter(k=>d.buf[k]&&d.buf[k].t>0);
  if(act.length)h+=`<div class="ldBufs">${act.map(k=>{const x=d.buf[k];return`<span>${img('p',x.id,null,'sm')}+${x.v}% ${BUF_N[k]} · <i data-ldb="${k}">${fmtShort(x.t)}</i></span>`}).join('')}</div>`;
  const grp=[['bt','ĐAN ĐỘT PHÁ'],['buff','ĐAN TĂNG LỰC (30 PHÚT)'],['heal','THUỐC TRỊ THƯƠNG']];
  for(const[k,t]of grp){h+=`<div class="sec"><h4>${t}</h4>`;for(const P of PILLS.filter(p=>p.k===k)){
    if(k==='bt'&&P.band[0]>nextR()+3&&!pillN(P.id))continue;
    const a=pillArr(P.id),l=lack(P),busy=b&&!b.done;
    const eff=P.k==='buff'?`+${P.val.join('/')}% ${BUF_N[P.stat]} theo phẩm`:P.k==='heal'?`+${P.val.map(v=>v[0]).join('/')} Bình Kim Sang, +${P.val.map(v=>v[1]).join('/')} Bình Nội Lực`:`Thành công +0/5/10% theo phẩm`;
    h+=`<div class="ldRec">${img('p',P.id,null,'lg')}<div><h5>${esc(P.n)} <small>${esc(P.d)}</small></h5><p>${esc(eff)}</p>${ingHtml(P)}
      ${P.k!=='heal'?`<div class="ldQ">${a.map((n,q)=>`<b style="border-color:${QC[q]};color:${QC[q]}">${QN[q].split(' ')[0]} ${n}</b>`).join('')}</div>`:''}</div>
      <div class="act"><button class="btn" data-brew="${P.id}" ${l.length||busy?'disabled':''}>Luyện</button>${P.k==='buff'?`<button class="btn sec" data-use="${P.id}" ${pillN(P.id)?'':'disabled'}>Uống</button>`:''}</div></div>`}h+='</div>'}
  return h}
function htmlVuon(){const S=G.save,d=ld();let h=`<p class="hist" style="color:var(--dim);font-size:12.5px;margin:0 0 10px">Vườn Thuốc của Lương Y ở góc tây thành Phong Châu. Cây lớn theo giờ thật, cả khi bạn rời game.</p><div class="ldPlots">`;
  for(let i=0;i<PLOT_N;i++){const s=plotState(i);
    if(s.lock){h+=`<div class="ldPlot lk"><span style="font-size:22px">🔒</span><b>Ô ${i+1}</b><span>Mở ở Cảnh Giới<br>${esc(R()[s.lock].n)}</span></div>`;continue}
    if(s.empty){h+=`<div class="ldPlot${LS.pick===i?' sel':''}"><span style="height:34px;display:grid;place-items:center;color:#8a6a4a">· · ·</span><b>Đất trống</b><span>Ô ${i+1}</span><button class="btn sec" data-plot="${i}">Gieo hạt</button></div>`;continue}
    const H=HERBS[s.h];h+=`<div class="ldPlot${s.ready?' rdy':''}">${img('h',H.id)}<b>${esc(H.n)}</b>${s.ready?'<span>Đã chín</span>':`<span data-ldt="${i}">${fmtShort(s.left)}</span>`}<div class="bar"><i style="width:${Math.round(s.k*100)}%"></i></div>
      ${s.ready?`<button class="btn" data-harv="${i}">Thu hoạch</button>`:''}</div>`}
  h+='</div>';
  if(plotsReady())h+=`<button class="btn gold" id="ldHarvAll" style="width:100%;min-height:48px;margin-bottom:10px">Thu hoạch tất cả (${plotsReady()})</button>`;
  const empty=[];for(let i=0;i<PLOT_N;i++)if(plotState(i).empty)empty.push(i);
  if(empty.length){if(LS.pick<0||!plotState(LS.pick).empty)LS.pick=empty[0];
    h+=`<div class="sec"><h4>HẠT GIỐNG · GIEO VÀO Ô ${LS.pick+1}</h4><div class="ldSeeds">${HERBS.map(H=>{const ok=seedOk(H);const lk=!ok?(H.rl&&realm()<H.rl?'Cần Cảnh Giới '+R()[H.rl].n:'Mở ở chương '+(H.mi+1)):'';
      return`<button class="ldSeed" data-seed="${H.id}" ${ok&&S.gold>=H.g?'':'disabled'}>${img('h',H.id)}<span><b>${esc(H.n)}</b><small>${lk?esc(lk):`${fmtDur(H.t)} · thu ${H.y[0]}–${H.y[1]} · có ${hcount(H.id)}`}</small></span><em>${ICO_GOLD} ${fmt(H.g)}</em></button>`}).join('')}</div></div>`}
  return h}
function htmlKho(){const S=G.save,d=ld();dayRoll(d);let h=`<div class="sec"><h4>DƯỢC LIỆU</h4><div class="ldInv">${HERBS.map(H=>`<div class="${hcount(H.id)?'':'z'}">${img('h',H.id)}<span><b>${hcount(H.id)}</b>${esc(H.n)}</span></div>`).join('')}</div></div>
    <div class="sec"><h4>DẪN DƯỢC & BÙA</h4><div class="ldInv">${Object.keys(MATS).map(k=>`<div class="${d.m[k]?'':'z'}">${img('m',k)}<span><b>${d.m[k]||0}</b>${esc(MATS[k].n)}</span></div>`).join('')}</div>
    <p class="hist" style="color:var(--dim);font-size:12px">${Object.keys(MATS).map(k=>`<b>${esc(MATS[k].n)}</b>: ${esc(MATS[k].d)}`).join('<br>')}</p></div>`;
  const ready=LS.nodes.filter(n=>nodeReady(n)).length;
  h+=`<div class="sec"><h4>NGOÀI BẢN ĐỒ · ${esc(G.W?G.W.M.name.toUpperCase():'')}</h4><p class="hist" style="color:var(--dim);font-size:12.5px">${ready}/${LS.nodes.length} cây thuốc đang chín (phát sáng, chạm hoặc đứng cạnh để hái). Cây quý có Linh Thú canh: hạ nó để lấy Linh Đan Dẫn. Cây mọc lại sau 5–8 phút.</p>
    <div class="ldChips" style="justify-content:flex-start">${HERBS.map(H=>`<span>${esc(H.n)}: ${H.rare?'Linh Thú, chương '+(H.mi+1)+'+':'chương '+(H.mi+1)+'+'}</span>`).join('')}</div></div>`;
  const pL=50*S.lvl;h+=`<div class="sec"><h4>LƯƠNG Y BÁN</h4><div class="ldBuy"><div><b>${img('m','ldd',null,'sm')} Linh Đan Dẫn</b><small>1 viên mỗi ngày (còn ${1-(d.buy.ldd||0)})</small></div><button class="btn sec" id="ldBuyD" ${S.gold>=pL&&!(d.buy.ldd)?'':'disabled'}>${ICO_GOLD} ${fmt(pL)}</button></div>
    <div class="ldBuy"><div><b>${img('m','hmp',null,'sm')} Hộ Mệnh Phù</b><small>3 lá mỗi ngày (còn ${3-(d.buy.hmp||0)})</small></div><button class="btn sec" id="ldBuyT" ${S.gold>=talisPrice()&&(d.buy.hmp||0)<3?'':'disabled'}>${ICO_GOLD} ${fmt(talisPrice())}</button></div></div>`;
  return h}
function buy(k){const S=G.save,d=ld();dayRoll(d);if(k==='hmp'){const p=talisPrice();if((d.buy.hmp||0)>=3)return'Hết hàng hôm nay';if(S.gold<p)return'Thiếu vàng';S.gold-=p;d.buy.hmp=(d.buy.hmp||0)+1;addMat('hmp',1);return''}
  if(k==='ldd'){const p=50*S.lvl;if(d.buy.ldd)return'Hết hàng hôm nay';if(S.gold<p)return'Thiếu vàng';S.gold-=p;d.buy.ldd=1;addMat('ldd',1);return''}return'?'}
function claimGift(){const d=ld();if(d.gift!==1)return false;d.gift=2;pillArr('tk')[2]++;addHerb('ct',4);addHerb('nc',3);addMat('ldd',1);saveGame();return true}
function html(){css();const d=ld();if(!d)return'';dayRoll(d);if(!SEC.some(s=>s[0]===LS.sec))LS.sec='dot';
  let h=`<div class="ldSeg" role="tablist">${SEC.map(([k,l])=>`<button data-sec="${k}" aria-pressed="${k===LS.sec}">${l}${secDot(k)?'<i></i>':''}</button>`).join('')}</div>`;
  h+=LS.sec==='dot'?htmlDot():LS.sec==='dan'?htmlDan():LS.sec==='vuon'?htmlVuon():htmlKho();return h}
const rerender=()=>HUB.refresh();
function bind(body){const d=ld();
  body.querySelectorAll('[data-sec]').forEach(b=>b.onclick=()=>{LS.sec=b.dataset.sec;Audio_.play('ui');rerender();const sb=document.getElementById('shBody');if(sb)sb.scrollTop=0});
  const on=(id,f)=>{const b=body.querySelector('#'+id);if(b)b.onclick=f};
  on('ldGift',()=>{if(claimGift()){Audio_.play('quest');UI.toast('Nhận Tụ Khí Đan Thượng phẩm, 4 Cam Thảo, 3 Ngải Cứu, 1 Linh Đan Dẫn','quest');rerender()}});
  on('ldTm',()=>{LS.talis=Math.max(0,LS.talis-1);Audio_.play('ui');rerender()});on('ldTp',()=>{LS.talis++;Audio_.play('ui');rerender()});
  on('ldGo',()=>{const t=LS.talis;LS.talis=0;startCine(t)});
  on('ldBuyT',()=>{const e=buy('hmp');if(e)UI.toast(e,'warn');else{Audio_.play('coin');UI.toast('Mua 1 Hộ Mệnh Phù')}rerender()});
  on('ldBuyD',()=>{const e=buy('ldd');if(e)UI.toast(e,'warn');else{Audio_.play('coin');UI.toast('Mua 1 Linh Đan Dẫn')}rerender()});
  on('ldHarvAll',()=>{const r=harvestAll();if(r.length){Audio_.play('loot',2);UI.toast('Thu hoạch: '+r.join(', '),'quest')}rerender()});
  body.querySelectorAll('[data-harv]').forEach(b=>b.onclick=()=>{const r=harvestPlot(+b.dataset.harv);if(r){Audio_.play('loot',2);UI.toast(`Thu hoạch +${r.n} ${r.h.n}`)}rerender()});
  body.querySelectorAll('[data-plot]').forEach(b=>b.onclick=()=>{LS.pick=+b.dataset.plot;Audio_.play('ui');rerender()});
  body.querySelectorAll('[data-seed]').forEach(b=>b.onclick=()=>{const e=plant(LS.pick,b.dataset.seed);if(e)UI.toast(e,'warn');else{Audio_.play('coin');UI.toast(`Gieo ${HB[b.dataset.seed].n} vào ô ${LS.pick+1}`)}rerender()});
  body.querySelectorAll('[data-use]').forEach(b=>b.onclick=()=>{const e=usePill(b.dataset.use);if(e)UI.toast(e,'warn');else UI.toast(`Uống ${PB[b.dataset.use].n}: 30 phút`,'skill');rerender()});
  body.querySelectorAll('[data-brew]').forEach(b=>b.onclick=()=>{if(LS.brew&&!LS.brew.done)return;const r=brew(b.dataset.brew);if(r.err){UI.toast(r.err,'warn');return}
    LS.brew={P:r.P,q:r.q,t0:performance.now(),done:false};Audio_.play('magic');rerender()});
  const c=body.querySelector('#ldFurC');if(c)animFur(c)}
/* đan lô trong bảng: lửa, sủi bọt, nắp rung, viên đan bay lên */
function animFur(c){cancelAnimationFrame(LS.raf);const loop=()=>{if(!c.isConnected){LS.raf=0;return}drawFur(c);LS.raf=requestAnimationFrame(loop)};LS.raf=requestAnimationFrame(loop)}
function drawFur(c){const dpr=Math.min(2,window.devicePixelRatio||1),r=c.getBoundingClientRect();if(!r.width)return;const W=Math.round(r.width*dpr),H=Math.round(r.height*dpr);if(c.width!==W||c.height!==H){c.width=W;c.height=H}
  const g=c.getContext('2d'),t=performance.now()/1000,b=LS.brew;let k=-1;if(b&&!b.done){k=(performance.now()-b.t0)/2400;if(k>=1){b.done=true;b.tEnd=performance.now();Audio_.play(b.q===2?'win':'loot',b.q+1);const el=document.getElementById('ldRes');if(el)el.innerHTML=`<span style="color:${QC[b.q]}">${esc(b.P.n)} · ${QN[b.q]}</span>`;
      UI.toast(`Luyện thành ${b.P.n} · ${QN[b.q]}`,b.q===2?'quest':'skill');setTimeout(()=>{if(UI.panel==='vodao'&&HUB.cur==='luyendan'&&LS.sec==='dan')rerender()},900)}}
  g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,W,H);const s=H/170;g.translate(W/2,H-12*s);g.scale(s*1.02,s*1.02);
  const heat=k>=0?0.6+k*1.2:0.5;const shake=k>0.55&&k<1?Math.sin(t*60)*1.5*(k-0.55)*4:0;
  // lửa dưới đỉnh
  for(let i=0;i<7;i++){const x=-15+i*5,h=(10+Math.sin(t*12+i*1.7)*4+(i%2)*5)*heat;g.fillStyle=i%2?'#ffd23a':'#ff6a2a';g.globalAlpha=0.9;g.beginPath();g.moveTo(x-4,-6);g.quadraticCurveTo(x-3,-6-h,x,-8-h);g.quadraticCurveTo(x+3,-6-h,x+4,-6);g.fill()}
  g.globalAlpha=1;g.save();g.translate(shake,0);drawCauldron(g,0);g.restore();
  // hơi bốc
  for(let i=0;i<5;i++){const ph=(t*0.5+i*0.21)%1;g.globalAlpha=(1-ph)*0.35*(k>=0?1.6:1);g.fillStyle='#e8e0d0';g.beginPath();g.arc(Math.sin(i*2+t)*10+shake,-92-ph*60,4+ph*10,0,TAU);g.fill()}g.globalAlpha=1;
  if(k>=0&&k<1){for(let i=0;i<6;i++){const ph=(t*1.6+i*0.17)%1;g.fillStyle='rgba(255,240,180,0.8)';g.beginPath();g.arc(-16+i*6.4,-62-ph*14,1.6+ph*2,0,TAU);g.fill()}}
  if(b&&b.done){const e=Math.min(1,(performance.now()-b.tEnd)/700),y=-98-e*14,col=b.P.c;
    g.globalCompositeOperation='lighter';const gr=g.createRadialGradient(0,y,2,0,y,60);gr.addColorStop(0,QC[b.q]);gr.addColorStop(1,'rgba(0,0,0,0)');g.globalAlpha=0.6*(1-e*0.4);g.fillStyle=gr;g.beginPath();g.arc(0,y,60,0,TAU);g.fill();
    g.globalAlpha=0.5;g.strokeStyle=QC[b.q];g.lineWidth=1.4;for(let i=0;i<12;i++){const a=i/12*TAU+t*0.6;g.beginPath();g.moveTo(Math.cos(a)*14,y+Math.sin(a)*14);g.lineTo(Math.cos(a)*(30+e*14),y+Math.sin(a)*(30+e*14));g.stroke()}
    g.globalCompositeOperation='source-over';g.globalAlpha=1;drawPill(g,0,y,9,col,b.q)}}
setInterval(()=>{if(UI.panel!=='vodao'||HUB.cur!=='luyendan'||!G.save)return;const body=document.getElementById('shBody');if(!body)return;
  let re=false;body.querySelectorAll('[data-ldt]').forEach(el=>{const s=plotState(+el.dataset.ldt);if(s.ready)re=true;else el.textContent=fmtShort(s.left)});
  const d=ld();body.querySelectorAll('[data-ldb]').forEach(el=>{const x=d.buf[el.dataset.ldb];if(x)el.textContent=fmtShort(x.t)});if(re&&!(LS.brew&&!LS.brew.done))rerender()},1000);
HUB.add({id:'luyendan',name:'Luyện Đan',order:40,html,bind,dot:()=>!!G.save&&(dotBreak()||dotGift()||plotsReady()>0)});

/* ---------- HUD: biểu tượng đan tăng lực ---------- */
function hudBuf(){let el=document.getElementById('ldBuf');const d=G.save&&G.save.ld;const act=d&&d.buf?Object.keys(d.buf).filter(k=>d.buf[k]&&d.buf[k].t>0):[];
  if(!el){if(!act.length)return;css();el=document.createElement('div');el.id='ldBuf';const hud=document.getElementById('hud');if(!hud)return;hud.appendChild(el)}
  const key=act.map(k=>k+d.buf[k].id+Math.ceil(d.buf[k].t/60)).join('|');if(key===LS.bk)return;LS.bk=key;
  el.innerHTML=act.map(k=>{const x=d.buf[k],P=PB[x.id];return`<div style="--bc:${P?P.c:'#ffd98a'}" title="${esc((P?P.n:'')+': +'+x.v+'% '+BUF_N[k])}">${img('p',x.id)}<b>${Math.ceil(x.t/60)}′</b></div>`}).join('')}

/* ---------- vòng chính ---------- */
HK.on('tick',dt=>{const S=G.save;if(!S)return;tickNodes(dt);tickBuf(dt);LS.acc2+=dt;if(LS.acc2<1)return;LS.acc2=0;
  const d=ld();syncPlots();hudBuf();bindTap();
  if(d.pend&&!LS.cine){const r=resolve();if(r)UI.toast(r.ok?'Đột phá thành công!':'Đột phá thất bại (kết quả lần trước)',r.ok?'quest':'warn')}
  if(d.gift===0&&S.prog&&(S.lvl>=8||realm()>=1)){if(realm()>=1||pillN('tk'))d.gift=2;else{d.gift=1;UI.toast('Lương Y ở Phong Châu (cạnh Vườn Thuốc) có quà: Tụ Khí Đan để đột phá Cảnh Giới. Mở Võ Đạo → Luyện Đan.','quest');saveGame()}}
  const q=S.prog&&reqs();const k=q?q.r+':'+(q.lv&&q.cq?1:0)+(q.pill?1:0):'';
  if(k!==LS.readyK){const was=LS.readyK;LS.readyK=k;if(was&&q&&q.lv&&q.cq&&!q.pill&&LD.gate)UI.toast(`Đủ cấp và Chân Khí để đột phá ${q.RR.n}, nhưng cần ${q.P.n}. Luyện ở Đan Lô (Phong Châu).`,'skill');}});
const _sg=startGame;startGame=function(){LS.W=null;LS.cine=null;LS.readyK='';LS.bk=null;const r=_sg.apply(this,arguments);if(G.save){ld();syncPlots()}return r};

/* =================== CHO BOT VÀ BÀI THỬ =================== */
/* bot: người chơi hợp lý. Hái cây trong tầm (như đi vòng qua), làm vườn, luyện đan đột phá, mua bùa nếu dư vàng, rồi đột phá (không cảnh diễn).
   simSec: số giây game đã trôi, cộng vào đồng hồ ảo để vườn và cây mọc lại khớp với thời gian mô phỏng. */
LD.bot=function(simSec,opt){opt=opt||{};const S=G.save;if(!S||!S.prog)return null;const d=ld();if(simSec)LS.off+=simSec*1000;const out={h:0,br:0,bt:0,fail:0};
  if(d.gift===1)claimGift();
  const p=G.p;for(const n of LS.nodes){if(!nodeReady(n))continue;if(n.g&&!LS.gk[n.i])continue;if(dist(p.x,p.y,n.x,n.y)<(opt.range||700))out.h+=harvestNode(n,true)}
  for(let i=0;i<PLOT_N;i++)harvestPlot(i);
  const q=reqs();const P=q&&q.P;
  // gieo: ưu tiên vị thuốc còn thiếu cho viên đan kế tiếp
  for(let i=0;i<PLOT_N;i++){if(!plotState(i).empty)continue;let want=null;if(P)for(const k in P.need)if(hcount(k)<P.need[k]*2&&seedOk(HB[k])){want=k;break}
    if(!want)want=HERBS.filter(h=>seedOk(h)&&!h.rare).sort((a,b)=>b.mi-a.mi)[0].id;if(S.gold>HB[want].g*3)plant(i,want)}
  if(P&&!pillN(P.id)){if((d.m.ldd||0)<(P.mat.ldd||0))buy('ldd');const r=brew(P.id);if(!r.err)out.br++}
  if(q&&q.lv&&q.cq&&pillN(P.id)){while((d.m.hmp||0)<3&&S.gold>talisPrice()*4&&!buy('hmp'));
    const t=Math.min(3,d.m.hmp||0,Math.max(0,Math.ceil((100-odds(q.r,0).tot)/10)));const x=roll(t);if(!x.err){const r=resolve();out.bt++;if(!r||!r.ok)out.fail++}
    const ov=document.getElementById('rgOv');if(ov)ov.hidden=true}
  return out};
Object.assign(LD,{HERBS,PILLS,MATS,HB,PB,LS,now,data:ld,nodes:()=>LS.nodes,nodeReady,harvestNode,plant,harvestPlot,harvestAll,plotState,brew,usePill,odds,reqs,roll,resolve,startCine,
  claimGift,buy,addHerb,addMat,pill:pillArr,pillN,btPill,talisPrice,dotBreak,
  give(id,n){if(HB[id])addHerb(id,n);else if(MATS[id])addMat(id,n);else if(PB[id])pillArr(id)[0]+=n},
  open(sec){LS.sec=sec||'dot';HUB.show('luyendan')},
  attempt(o){o=o||{};if(!o.instant)return startCine(o.talis||0);const x=roll(o.talis||0,o.force);if(x.err)return x;const r=resolve();const ov=document.getElementById('rgOv');if(ov&&o.hideOv)ov.hidden=true;return Object.assign({chance:x.o.tot},r)}});
})();

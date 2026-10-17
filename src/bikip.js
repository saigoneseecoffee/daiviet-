/* ============ BÍ TỊCH VÕ CÔNG (bikip.js) ============
   Võ học ngoài môn phái: sách võ công theo Ngũ Hành, phái nào cũng luyện được (dựng lối chơi chéo phái).
   - 16 Bí Tịch chủ động + 5 Tâm Pháp (bị động) + 3 cặp sách Chính Đạo / Tà Đạo đối xứng.
   - Hai ô chủ động trên HUD (#s3 phím U, #s4 phím O) cạnh ba kỹ năng phái, hai ô Tâm Pháp.
   - Cấp 1–10 bằng Trang Bí Tịch (trang riêng từng sách khi trùng, hoặc Tàn Trang dùng chung).
   - Nguồn: boss chương (có bảo hiểm), tinh anh rơi Tàn Trang, mốc Vượt Tháp, Thư Quán của Thủ Thư ở thành.
   - Cộng hưởng vũ khí cùng hệ (window.TB.elemOf) +25%, khắc hệ quái (boss2) +15%.
   - Ngộ Đạo ở cấp 30 hoặc khi qua chương 4: Chính (thủ/hồi/khiên) hay Tà (hút máu/chí mạng/bộc phát). BT.phe().
   Lưu ở G.save.bikip = {v, own:{id:{lv,pg}}, eq:[a,b], ps:[a,b], wp, pity, first, tw, shop, phe, pheN, offer, nw}
   Móc: stats, tick, kill, dmgIn, drawWorld. Bọc: drawZones, townNpcs, startGame, UI.init, UI.hud, UI.open, UI.npcPrompt, UI.chapterClear.
   Thử: window.BT (give, equip, cast, choose, st, BOOKS, dev). */
(function(){
'use strict';
const BT=window.BT={};
const $q=s=>document.querySelector(s);

/* ================= NGŨ HÀNH ================= */
const EL={
  kim:{n:'Kim',c:'#f2d675',d:'#5e4a12',l:'#fff6cf'},
  moc:{n:'Mộc',c:'#7fd85e',d:'#1d4a17',l:'#dcffc8'},
  thuy:{n:'Thủy',c:'#5cb8ff',d:'#10305a',l:'#dcf2ff'},
  hoa:{n:'Hỏa',c:'#ff6b3d',d:'#5e1406',l:'#ffe0a8'},
  tho:{n:'Thổ',c:'#d9a463',d:'#4e3210',l:'#f6e2bd'}};
const EL_ORD=['kim','moc','thuy','hoa','tho'];
const KH={kim:'moc',moc:'tho',tho:'thuy',thuy:'hoa',hoa:'kim'};
const GLY={
  kim:'M12 4.2L17.6 12 12 19.8 6.4 12Z',
  moc:'M12 4C17.5 7 18.6 14.6 12 20 5.4 14.6 6.5 7 12 4Z',
  thuy:'M12 4C14.6 8.4 17.6 11.4 17.6 14.6A5.6 5.6 0 0 1 6.4 14.6C6.4 11.4 9.4 8.4 12 4Z',
  hoa:'M12 3.4C13.8 7 17.6 9 17 14 16.5 18 14 20 12 20 9 20 6.6 18 7 14 7.3 11.4 8.7 10.3 9.8 8.4 10.4 10.4 11 11.2 12 11.4 12.6 9.2 12.6 6.4 12 3.4Z',
  tho:'M4.2 18.4L9.8 8.2 12.8 12.8 15 9.6 19.8 18.4Z'};
const SIDE={chinh:{n:'Chính Đạo',c:'#ffe7a0',d:'#7a5a12'},ta:{n:'Tà Đạo',c:'#ff5a7a',d:'#4a0a1e'}};

/* ================= DANH MỤC SÁCH =================
   t:'p' là Tâm Pháp (bị động). rar: bậc RARITY. rq: Cảnh Giới cần. mp, cd (giây), m: hệ số công mỗi đòn.
   big: có pháp trận dưới đất. Số liệu: một sách cùng cấp ≈ 0,4–0,8 lần công mỗi giây lên một mục tiêu (kỹ năng phái 3 cấp 1 ≈ 1,2). */
const BOOKS=[
 {id:'loidinh',n:'Lôi Đình Chưởng',el:'kim',rar:1,rq:0,mp:14,cd:6,m:2.4,ic:'bolt',d:'Chưởng sét đánh trúng mục tiêu rồi nhảy qua sáu kẻ địch, mỗi lần làm khựng.'},
 {id:'kimchung',n:'Kim Chung Tráo',el:'kim',rar:1,rq:0,mp:18,cd:16,m:1.4,ic:'bell',d:'Chuông vàng bao thân, đỡ sát thương bằng 22% sinh lực trong sáu giây và chấn văng kẻ địch quanh mình.'},
 {id:'vantien',n:'Vạn Tiễn Xuyên Vân',el:'kim',rar:2,rq:1,mp:26,cd:13,m:0.7,ic:'arrows',big:1,d:'Mưa tên trút xuống một vùng quanh mục tiêu trong 2,4 giây.'},
 {id:'dongakiem',n:'Đông A Kiếm Trận',el:'kim',rar:3,rq:2,mp:28,cd:15,m:0.42,ic:'blades',big:1,d:'Sáu thanh kiếm hào khí Đông A xoay quanh thân trong năm giây, chém mọi kẻ áp sát.'},
 {id:'hoixuan',n:'Mộc Hồi Xuân',el:'moc',rar:1,rq:0,mp:20,cd:18,m:0,ic:'sprout',big:1,d:'Hồi ngay 16% sinh lực, rồi hồi thêm 2,5% mỗi giây trong năm giây.'},
 {id:'phongquyen',n:'Phong Quyển Tàn Vân',el:'moc',rar:1,rq:0,mp:12,cd:5,m:0.6,ic:'wind',d:'Ba loạt phong nhận tỏa hình quạt, mỗi lưỡi gió xuyên qua hai kẻ địch.'},
 {id:'dangla',n:'Đằng La Triền Thân',el:'moc',rar:2,rq:1,mp:18,cd:9,m:2.2,ic:'vine',big:1,d:'Dây leo trồi lên quanh mục tiêu, trói chân 2,5 giây và đâm gai liên tục.'},
 {id:'thuylong',n:'Thủy Long Ngâm',el:'thuy',rar:1,rq:0,mp:16,cd:7,m:3.0,ic:'dragon',d:'Rồng nước gầm lên lao thẳng, xuyên mọi kẻ địch và làm chậm 2,5 giây.'},
 {id:'hanbang',n:'Hàn Băng Chưởng',el:'thuy',rar:2,rq:2,mp:22,cd:11,m:2.6,ic:'flake',big:1,d:'Hàn khí tỏa quanh thân, đóng băng kẻ địch 1,8 giây (boss chỉ bị chậm).'},
 {id:'trieudang',n:'Bạch Đằng Triều Dâng',el:'thuy',rar:3,rq:3,mp:26,cd:13,m:0.5,ic:'wave',big:1,d:'Xoáy nước cuốn kẻ địch vào giữa trong hai giây, rồi nước triều dâng nổ tung.'},
 {id:'hoaho',n:'Hỏa Hổ Phá Trận',el:'hoa',rar:1,rq:0,mp:16,cd:7,m:2.8,ic:'tiger',d:'Hổ lửa phóng thẳng phá trận, xuyên thấu và thiêu đốt kẻ trúng đòn bốn giây.'},
 {id:'thanco',n:'Thần Cơ Hỏa Pháo',el:'hoa',rar:2,rq:1,mp:24,cd:12,m:1.1,ic:'rocket',d:'Tám quả hỏa pháo kiểu Hồ Nguyên Trừng nã vào kẻ địch gần nhất, nổ lan và gây cháy.'},
 {id:'lietthieu',n:'Liệt Hỏa Thiêu Doanh',el:'hoa',rar:3,rq:2,mp:28,cd:14,m:0.45,ic:'fire',big:1,d:'Nổ lửa ở mục tiêu rồi để lại biển lửa bốn giây, như trận đốt doanh trại giặc.'},
 {id:'phason',n:'Phá Sơn Quyền',el:'tho',rar:1,rq:0,mp:16,cd:8,m:3.0,ic:'fist',big:1,d:'Một quyền chấn đất phía trước, làm choáng 1,2 giây và hất văng.'},
 {id:'thientru',n:'Thiên Trụ Giáng',el:'tho',rar:3,rq:2,mp:26,cd:13,m:0.9,ic:'pillar',big:1,d:'Chín cột đá từ trời giáng xuống kẻ địch xung quanh, mỗi cột làm choáng.'},
 {id:'coloa',n:'Cổ Loa Thạch Thành',el:'tho',rar:4,rq:4,mp:30,cd:15,m:2.4,ic:'spiral',big:1,d:'Ba vòng thành đá xoắn ốc trồi lên như thành Cổ Loa, trói chân kẻ địch và tăng 25% thủ trong sáu giây.'},
 /* Tâm Pháp: hiệu lực theo cấp sách */
 {id:'kimcuong',t:'p',n:'Kim Cương Bất Hoại Thể',el:'kim',rar:2,rq:1,ic:'shieldp',pv:L=>({def:10+1.2*(L-1)}),d:'Luyện thân như kim cương.'},
 {id:'truongsinh',t:'p',n:'Thanh Mộc Trường Sinh Quyết',el:'moc',rar:2,rq:1,ic:'sprout',pv:L=>({hpp:5+0.6*(L-1),reg:0.4+0.05*(L-1)}),d:'Khí xuân nuôi dưỡng huyết mạch.'},
 {id:'thuynguyet',t:'p',n:'Thủy Nguyệt Tâm Kinh',el:'thuy',rar:2,rq:1,ic:'moon',pv:L=>({mpp:10+1.2*(L-1),cdr:6+0.6*(L-1)}),d:'Tâm tĩnh như trăng soi đáy nước.'},
 {id:'lietduong',t:'p',n:'Liệt Dương Tâm Pháp',el:'hoa',rar:2,rq:1,ic:'sun',pv:L=>({crit:3+0.3*(L-1),cdmg:8+1.2*(L-1)}),d:'Nội lực nóng rực như mặt trời giữa trưa.'},
 {id:'hautho',t:'p',n:'Hậu Thổ Hộ Thân Công',el:'tho',rar:2,rq:1,ic:'mountain',pv:L=>({hpp:6+0.7*(L-1),dr:3+0.3*(L-1)}),d:'Vững như đất, dày như núi.'},
 /* Chính / Tà: ba cặp đối xứng */
 {id:'thienloi',n:'Thiên Lôi Chính Khí',el:'kim',side:'chinh',pair:'huyetma',rar:4,rq:3,mp:30,cd:14,m:1.9,ic:'heaven',big:1,d:'Năm tia thiên lôi giáng xuống kẻ địch, chính khí hóa khiên đỡ 12% sinh lực.'},
 {id:'huyetma',n:'Huyết Ma Phệ Hồn',el:'hoa',side:'ta',pair:'thienloi',rar:4,rq:3,mp:30,cd:14,m:1.9,ic:'blood',big:1,d:'Năm luồng huyết ma cắn xé kẻ địch, hút lại 30% sát thương gây ra thành sinh lực.'},
 {id:'haokhi',n:'Hào Khí Đông A',el:'hoa',side:'chinh',pair:'maanh',rar:4,rq:3,mp:30,cd:20,m:2.0,ic:'banner',big:1,d:'Tiếng hô Sát Thát chấn văng kẻ địch, tám giây tăng 20% công và 20% thủ.'},
 {id:'maanh',n:'Ma Ảnh Truy Hồn',el:'thuy',side:'ta',pair:'haokhi',rar:4,rq:3,mp:30,cd:20,m:2.0,ic:'shadow',big:1,d:'Bóng ma xé gió quanh thân, tám giây tăng 15% chí mạng và 30% sát thương chí mạng.'},
 {id:'namquoc',n:'Nam Quốc Sơn Hà',el:'tho',side:'chinh',pair:'amphong',rar:4,rq:4,mp:34,cd:16,m:7.0,ic:'seal',big:1,d:'Ấn "Nam quốc sơn hà Nam đế cư" giáng xuống mục tiêu, làm choáng 1,5 giây và hồi 15% sinh lực.'},
 {id:'amphong',n:'Âm Phong Liệt Hồn',el:'moc',side:'ta',pair:'namquoc',rar:4,rq:4,mp:34,cd:16,m:8.4,ic:'vortex',big:1,d:'Âm phong xoáy nát mục tiêu trong chớp mắt, thêm 30% tỉ lệ chí mạng cho đòn này.'},
];
const BY={};BOOKS.forEach(B=>{B.t=B.t||'a';BY[B.id]=B});
BT.BOOKS=BOOKS;BT.BY=BY;BT.EL=EL;
const PV_TXT={def:['thủ','%'],hpp:['sinh lực','%'],reg:['hồi sinh lực mỗi giây','%'],mpp:['nội lực','%'],cdr:['giảm hồi chiêu Bí Tịch','%'],crit:['chí mạng','%'],cdmg:['ST chí mạng','%'],dr:['giảm sát thương nhận','%']};
const pvTxt=(B,L)=>{const o=B.pv(L);return Object.keys(o).map(k=>`+${(Math.round(o[k]*10)/10).toString().replace('.',',')}${PV_TXT[k][1]} ${PV_TXT[k][0]}`).join(', ')};
const MAXLV=10;
const lvMult=L=>1+0.1*(L-1);
const PG_COST=[0,2,3,4,5,7,9,11,14,18];             // trang cần để lên cấp L+1
const goldCost=(B,L)=>Math.round(150*L*L*(1+B.rar*0.5));
const dupPages=B=>4+B.rar*2;
const SIDE_PASS={chinh:'+15% thủ, +10% sinh lực, hồi máu và khiên mạnh hơn 30%',ta:'+3% hút máu, +5% chí mạng, Bí Tịch gây thêm 12% sát thương'};

/* ================= LƯU ================= */
function rIdx(){try{return window.realmIdx?realmIdx():0}catch(e){return 0}}
function realmName(i){try{return window.PROG?PROG.REALMS[i].n:'bậc '+i}catch(e){return 'bậc '+i}}
function st(){const S=G.save;if(!S)return null;let s=S.bikip;
  if(!s||typeof s!=='object'||Array.isArray(s)){s=S.bikip={v:1};fresh(s)}
  if(!s.own||typeof s.own!=='object')s.own={};for(const k in s.own){if(!BY[k]){delete s.own[k];continue}const o=s.own[k];o.lv=clamp(o.lv|0||1,1,MAXLV);o.pg=Math.max(0,o.pg|0)}
  if(!Array.isArray(s.eq))s.eq=[null,null];if(!Array.isArray(s.ps))s.ps=[null,null];
  for(let i=0;i<2;i++){if(s.eq[i]&&(!s.own[s.eq[i]]||BY[s.eq[i]].t!=='a'))s.eq[i]=null;if(s.ps[i]&&(!s.own[s.ps[i]]||BY[s.ps[i]].t!=='p'))s.ps[i]=null}
  if(typeof s.wp!=='number')s.wp=0;if(typeof s.pity!=='number')s.pity=0;if(typeof s.tw!=='number')s.tw=0;
  if(s.phe!=='chinh'&&s.phe!=='ta')s.phe=null;if(!s.nw||typeof s.nw!=='object')s.nw={};
  if(!s.shop||typeof s.shop!=='object')s.shop={day:0,ids:[],sold:[],wp:0,rr:0};
  return s}
/* lần đầu tạo khóa trên lưu cũ: không dồn thưởng tháp cũ; đã qua chương 1 thì nhận cuốn khởi đầu (luật "cuốn đầu sau boss chương 1") */
function fresh(s){const S=G.save;s.own={};s.eq=[null,null];s.ps=[null,null];s.wp=0;s.pity=0;s.first=0;s.phe=null;s.pheN=0;s.offer=0;s.nw={};
  s.tw=Math.floor(((S.tower&&S.tower.best)||0)/5);s.shop={day:0,ids:[],sold:[],wp:0,rr:0};
  if(S.cleared&&S.cleared.length)BTS.retro=1}
BT.st=st;

/* ================= Ô ================= */
const SLOT_KEY=['U','O'];
function slotOpen(i){const S=G.save;if(!S)return false;const r=rIdx();return i===0?(S.lvl>=10||r>=1):r>=3}
function pslotOpen(i){const S=G.save;if(!S)return false;const r=rIdx();return i===0?(S.lvl>=20||r>=2):r>=4}
function slotLock(i){return i===0?`Mở ở cấp 10 hoặc Cảnh Giới ${realmName(1)}`:`Mở ở Cảnh Giới ${realmName(3)}`}
function pslotLock(i){return i===0?`Mở ở cấp 20 hoặc Cảnh Giới ${realmName(2)}`:`Mở ở Cảnh Giới ${realmName(4)}`}
function usable(B){const s=st();if(!s||!B)return false;if(B.rq>rIdx())return false;if(B.side&&B.side!==s.phe)return false;return true}
function whyNot(B){const s=st();if(B.rq>rIdx())return'Cần Cảnh Giới '+realmName(B.rq);if(B.side&&B.side!==s.phe)return'Chỉ người theo '+SIDE[B.side].n+' luyện được';return''}

/* cộng hưởng vũ khí: một đội khác làm window.TB; thiếu TB thì không thưởng, không phạt.
   Lưu ý: world.js có hằng toàn cục TB=7 (ô cầu) che window.TB, nên luôn gọi qua window.TB. */
function weaponEl(){try{const tb=window.TB;if(tb&&typeof tb==='object'&&typeof tb.elemOf==='function'){const v=tb.elemOf(G.save.equip.vk);return EL[v]?v:null}}catch(e){}return null}
function reso(B){return!!B&&weaponEl()===B.el}
function healK(L){const s=st();return(1+0.08*(L-1))*(s&&s.phe==='chinh'?1.3:1)}
function cdrBooks(){const s=st();let c=0;for(const id of s.ps)if(id&&usable(BY[id])&&BY[id].pv(s.own[id].lv).cdr)c+=BY[id].pv(s.own[id].lv).cdr;return c}
function bookCd(B,L){const p=G.p;return B.cd*(1-0.015*(L-1))*(1-((p&&p.cdr)||0)/100)*(1-cdrBooks()/100)}
BT.bookCd=bookCd;

/* ================= TRẠNG THÁI CHẠY ================= */
const BTS={ents:[],st:new Set(),sh:null,buf:{},hot:null,W:null,view:'lib',sel:null,twT:0,autoT:0,retro:0,daoT:0};
BT._s=BTS;
const later=(t,fn)=>G.timers.push({t,fn});
function ensureCd(p){if(p.skCd.length<5){p.skCd[3]=p.skCd[3]||0;p.skCd[4]=p.skCd[4]||0}}

/* ================= SPRITE (vẽ một lần, lưu đệm) ================= */
const SPR={};
function spr(key,w,h,fn){let c=SPR[key];if(c)return c;c=SPR[key]=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');g.lineCap='round';g.lineJoin='round';fn(g,w,h);return c}
function rune(el){return spr('rune'+el,256,256,g=>{const E=EL[el];g.translate(128,128);g.strokeStyle=E.c;g.fillStyle=E.c;
  g.lineWidth=5;g.beginPath();g.arc(0,0,121,0,TAU);g.stroke();g.lineWidth=2;g.beginPath();g.arc(0,0,109,0,TAU);g.stroke();
  g.globalAlpha=0.85;for(let i=0;i<48;i++){const a=i/48*TAU,big=i%6===0,r2=big?96:103;g.lineWidth=big?3:1.4;g.beginPath();g.moveTo(Math.cos(a)*109,Math.sin(a)*109);g.lineTo(Math.cos(a)*r2,Math.sin(a)*r2);g.stroke()}
  for(let k=0;k<8;k++){g.save();g.rotate(k/8*TAU+TAU/16);for(let j=0;j<3;j++){const y=-88+j*8.5;g.lineWidth=4.5;g.beginPath();if((k>>j)&1){g.moveTo(-13,y);g.lineTo(-3.5,y);g.moveTo(3.5,y);g.lineTo(13,y)}else{g.moveTo(-13,y);g.lineTo(13,y)}g.stroke()}g.restore()}
  g.globalAlpha=0.7;g.lineWidth=2.5;g.beginPath();g.arc(0,0,60,0,TAU);g.stroke();
  g.lineWidth=2;g.beginPath();for(let i=0;i<=5;i++){const a=-Math.PI/2+i*2*TAU/5,x=Math.cos(a)*60,y=Math.sin(a)*60;i?g.lineTo(x,y):g.moveTo(x,y)}g.stroke();
  g.globalAlpha=0.95;g.save();g.scale(2.1,2.1);g.translate(-12,-12);g.fill(new Path2D(GLY[el]));g.restore()})}
function spDragon(){return spr('dragon',128,96,g=>{g.translate(70,52);
  g.fillStyle='#bfe8ff';g.globalAlpha=0.8;for(let i=0;i<5;i++){g.beginPath();g.moveTo(-14+i*3,-10+i*3);g.quadraticCurveTo(-44-i*2,-34+i*12,-64,-24+i*10);g.quadraticCurveTo(-36,-6+i*4,-12+i*3,0+i*2);g.fill()}
  g.globalAlpha=1;const gr=g.createLinearGradient(0,-26,0,22);gr.addColorStop(0,'#e6f6ff');gr.addColorStop(0.5,'#5cb8ff');gr.addColorStop(1,'#1d5a9a');g.fillStyle=gr;g.strokeStyle='#0c2440';g.lineWidth=2.2;
  g.beginPath();g.moveTo(-24,-12);g.quadraticCurveTo(-2,-28,24,-14);g.lineTo(52,-8);g.quadraticCurveTo(57,-1,50,3);g.lineTo(28,4);g.lineTo(46,13);g.quadraticCurveTo(30,22,10,17);g.quadraticCurveTo(-12,24,-24,12);g.closePath();g.fill();g.stroke();
  g.fillStyle='#fff';[[48,-5],[40,7],[33,8]].forEach(([x,y])=>{g.beginPath();g.moveTo(x,y);g.lineTo(x-3,y+(y<0?-5:5));g.lineTo(x-6,y);g.fill()});
  g.strokeStyle='#fff6cf';g.lineWidth=3.2;g.beginPath();g.moveTo(-4,-20);g.quadraticCurveTo(-18,-36,-38,-40);g.moveTo(6,-21);g.quadraticCurveTo(-2,-40,-16,-46);g.stroke();
  g.fillStyle='#fff';g.beginPath();g.ellipse(14,-9,5.5,3.8,0,0,TAU);g.fill();g.fillStyle='#ff4a2a';g.beginPath();g.arc(15.5,-9,2.2,0,TAU);g.fill();
  g.strokeStyle='#dcf2ff';g.lineWidth=1.8;g.beginPath();g.moveTo(44,0);g.bezierCurveTo(52,12,40,24,54,34);g.moveTo(40,-8);g.bezierCurveTo(48,-22,38,-30,52,-42);g.stroke()})}
function spTiger(){return spr('tiger',128,104,g=>{g.translate(66,54);
  for(let i=0;i<7;i++){const a=Math.PI*0.62+i/6*Math.PI*0.76;g.fillStyle=i%2?'#ff9a3a':'#ffd23a';g.beginPath();g.moveTo(Math.cos(a)*18,Math.sin(a)*18);g.quadraticCurveTo(Math.cos(a)*40-10,Math.sin(a)*40,Math.cos(a)*56-22,Math.sin(a)*52);g.quadraticCurveTo(Math.cos(a+0.25)*36,Math.sin(a+0.25)*36,Math.cos(a+0.4)*18,Math.sin(a+0.4)*18);g.fill()}
  const gr=g.createRadialGradient(4,-4,4,0,0,34);gr.addColorStop(0,'#ffe6a0');gr.addColorStop(0.6,'#ff9a2a');gr.addColorStop(1,'#c8361f');g.fillStyle=gr;g.strokeStyle='#4a1006';g.lineWidth=2.4;
  g.beginPath();g.ellipse(0,0,30,27,0,0,TAU);g.fill();g.stroke();
  g.beginPath();g.moveTo(-12,-22);g.lineTo(-20,-38);g.lineTo(-2,-27);g.closePath();g.fill();g.stroke();g.beginPath();g.moveTo(8,-25);g.lineTo(8,-42);g.lineTo(20,-22);g.closePath();g.fill();g.stroke();
  g.fillStyle='#fff3d8';g.beginPath();g.ellipse(22,6,20,13,0,0,TAU);g.fill();g.stroke();
  g.fillStyle='#5e1406';g.beginPath();g.moveTo(26,10);g.quadraticCurveTo(38,14,44,8);g.quadraticCurveTo(38,22,24,18);g.fill();
  g.fillStyle='#fff';g.beginPath();g.moveTo(30,10);g.lineTo(32,16);g.lineTo(34,10);g.moveTo(38,10);g.lineTo(39,15);g.lineTo(41,9);g.fill();
  g.fillStyle='#2a0a04';g.beginPath();g.ellipse(38,-1,4,3,0,0,TAU);g.fill();
  g.strokeStyle='#3a0a04';g.lineWidth=3;[[-18,-10,-6,-6],[-22,2,-8,2],[-18,14,-6,10],[0,-22,4,-12],[-6,-24,-4,-14]].forEach(([a,b,c,d])=>{g.beginPath();g.moveTo(a,b);g.lineTo(c,d);g.stroke()});
  g.fillStyle='#ffe25a';g.beginPath();g.ellipse(12,-8,5,3.4,-0.2,0,TAU);g.fill();g.fillStyle='#000';g.beginPath();g.ellipse(13,-8,1.4,3,0,0,TAU);g.fill()})}
function spLeaf(){return spr('leaf',64,64,g=>{g.translate(32,32);g.fillStyle='#dcffc8';g.beginPath();g.arc(0,0,27,-1.35,1.35);g.arc(-12,0,23,1.05,-1.05,true);g.closePath();g.fill();
  g.fillStyle='#7fd85e';g.beginPath();g.arc(0,0,21,-1.2,1.2);g.arc(-10,0,19,1.0,-1.0,true);g.closePath();g.fill()})}
function spBlade(){return spr('blade',84,22,g=>{g.translate(4,11);const gr=g.createLinearGradient(0,-6,0,6);gr.addColorStop(0,'#ffffff');gr.addColorStop(0.5,'#f2d675');gr.addColorStop(1,'#8a6a1a');
  g.fillStyle='#5e1406';g.fillRect(0,-3,16,6);g.fillStyle='#f2d675';g.fillRect(15,-8,4,16);g.fillStyle=gr;g.beginPath();g.moveTo(19,-4.5);g.lineTo(72,-3);g.lineTo(80,0);g.lineTo(72,3);g.lineTo(19,4.5);g.closePath();g.fill();
  g.strokeStyle='rgba(90,60,10,.6)';g.lineWidth=1;g.beginPath();g.moveTo(20,0);g.lineTo(72,0);g.stroke()})}
function spPillar(){return spr('pillar',52,156,g=>{g.translate(26,0);const gr=g.createLinearGradient(-20,0,20,0);gr.addColorStop(0,'#5a4028');gr.addColorStop(0.45,'#d9a463');gr.addColorStop(1,'#4e3210');
  g.fillStyle=gr;g.strokeStyle='#2a1a0a';g.lineWidth=2.2;g.beginPath();g.moveTo(-20,4);g.lineTo(20,4);g.lineTo(18,128);g.lineTo(0,152);g.lineTo(-18,128);g.closePath();g.fill();g.stroke();
  g.fillStyle='#f6e2bd';g.globalAlpha=0.55;for(let y=20;y<120;y+=26){g.fillRect(-19,y,38,4)}g.globalAlpha=1;g.strokeStyle='rgba(40,20,5,.6)';g.lineWidth=1.4;g.beginPath();g.moveTo(-6,30);g.lineTo(2,48);g.lineTo(-4,70);g.moveTo(8,80);g.lineTo(4,100);g.stroke()})}
function spSpike(){return spr('spike',40,52,g=>{g.fillStyle='#b8874a';g.strokeStyle='#2a1a0a';g.lineWidth=2;g.beginPath();g.moveTo(3,50);g.lineTo(12,14);g.lineTo(18,22);g.lineTo(24,2);g.lineTo(31,24);g.lineTo(37,50);g.closePath();g.fill();g.stroke();
  g.fillStyle='#f6e2bd';g.globalAlpha=0.5;g.beginPath();g.moveTo(22,8);g.lineTo(26,26);g.lineTo(20,40);g.closePath();g.fill()})}
function spFlake(){return spr('flake',56,56,g=>{g.translate(28,28);g.strokeStyle='#e8f8ff';g.lineWidth=3;for(let k=0;k<6;k++){g.save();g.rotate(k/6*TAU);g.beginPath();g.moveTo(0,0);g.lineTo(0,-24);g.moveTo(0,-12);g.lineTo(-7,-18);g.moveTo(0,-12);g.lineTo(7,-18);g.moveTo(0,-19);g.lineTo(-4,-23);g.moveTo(0,-19);g.lineTo(4,-23);g.stroke();g.restore()}
  g.fillStyle='#5cb8ff';g.beginPath();g.arc(0,0,4,0,TAU);g.fill()})}
function spFlame(el){return spr('flame'+el,36,48,g=>{const E=EL[el];g.translate(18,46);g.fillStyle=E.c;g.beginPath();g.moveTo(0,0);g.bezierCurveTo(-16,-4,-14,-24,-4,-34);g.bezierCurveTo(-4,-24,4,-26,2,-44);g.bezierCurveTo(14,-30,18,-6,0,0);g.fill();
  g.fillStyle=E.l;g.beginPath();g.moveTo(0,-2);g.bezierCurveTo(-8,-4,-7,-16,-1,-22);g.bezierCurveTo(0,-16,6,-16,4,-26);g.bezierCurveTo(10,-14,8,-4,0,-2);g.fill()})}
function spVine(){return spr('vine',84,44,g=>{g.translate(42,24);g.strokeStyle='#2f7a22';g.lineWidth=5;g.beginPath();g.ellipse(0,0,30,12,0,0.2,TAU-0.2);g.stroke();g.strokeStyle='#7fd85e';g.lineWidth=2.4;g.beginPath();g.ellipse(0,-1,30,12,0,0.4,TAU-0.4);g.stroke();
  g.fillStyle='#9ff07a';for(let k=0;k<6;k++){const a=k/6*TAU+0.4,x=Math.cos(a)*30,y=Math.sin(a)*12;g.save();g.translate(x,y);g.rotate(a+1);g.beginPath();g.ellipse(0,-5,3,6,0,0,TAU);g.fill();g.restore()}
  g.strokeStyle='#4a9a32';g.lineWidth=2.4;g.beginPath();g.moveTo(-26,-4);g.quadraticCurveTo(-30,-18,-20,-22);g.moveTo(24,-6);g.quadraticCurveTo(30,-20,20,-24);g.stroke()})}
function spBell(){return spr('bell',172,196,g=>{g.translate(86,0);const gr=g.createLinearGradient(-70,0,70,0);gr.addColorStop(0,'rgba(242,214,117,.55)');gr.addColorStop(0.5,'rgba(255,246,207,.12)');gr.addColorStop(1,'rgba(242,214,117,.55)');
  g.fillStyle=gr;g.strokeStyle='rgba(255,236,170,.95)';g.lineWidth=3;g.beginPath();g.moveTo(-10,8);g.lineTo(10,8);g.quadraticCurveTo(54,14,58,70);g.lineTo(62,150);g.quadraticCurveTo(80,166,82,178);g.lineTo(-82,178);g.quadraticCurveTo(-80,166,-62,150);g.lineTo(-58,70);g.quadraticCurveTo(-54,14,-10,8);g.closePath();g.fill();g.stroke();
  g.lineWidth=2;g.strokeStyle='rgba(255,236,170,.7)';[60,100,140].forEach(y=>{g.beginPath();g.moveTo(-60,y);g.quadraticCurveTo(0,y+8,60,y);g.stroke()});
  g.fillStyle='rgba(255,236,170,.6)';for(let r=0;r<3;r++)for(let c=-2;c<=2;c++){g.beginPath();g.arc(c*16,74+r*12,2.6,0,TAU);g.fill()}
  g.strokeStyle='rgba(255,236,170,.95)';g.lineWidth=5;g.beginPath();g.arc(0,8,9,Math.PI,0);g.stroke()})}
function spSeal(){return spr('seal',168,168,g=>{g.translate(84,84);g.fillStyle='rgba(200,54,31,.92)';g.strokeStyle='#ffd98a';g.lineWidth=5;g.beginPath();g.roundRect(-74,-74,148,148,10);g.fill();g.stroke();
  g.lineWidth=2;g.strokeStyle='rgba(255,236,190,.8)';g.beginPath();g.roundRect(-64,-64,128,128,6);g.stroke();
  g.fillStyle='#ffe9b8';g.textAlign='center';g.textBaseline='middle';g.font='400 30px "Yeseva One",Georgia,serif';g.fillText('Nam Quốc',0,-22);g.fillText('Sơn Hà',0,22)})}
function spRocket(){return spr('rocket',48,16,g=>{g.translate(6,8);g.fillStyle='#8a2a14';g.fillRect(0,-4,30,8);g.fillStyle='#ffd23a';g.beginPath();g.moveTo(30,-5);g.lineTo(40,0);g.lineTo(30,5);g.fill();g.fillStyle='#3a1a0a';g.fillRect(6,-4,3,8);g.fillRect(18,-4,3,8)})}
function spBook(el,rar){return spr('book'+el+(rar|0),40,48,g=>{const E=EL[el],rc=RARITY[rar|0].color;g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.roundRect(7,6,30,40,3);g.fill();
  g.fillStyle=E.d;g.strokeStyle=rc;g.lineWidth=2.4;g.beginPath();g.roundRect(5,3,30,40,3);g.fill();g.stroke();g.fillStyle=shade(E.d,-0.35);g.fillRect(6,4,5,38);
  g.strokeStyle=rc;g.lineWidth=1;for(let y=8;y<42;y+=8){g.beginPath();g.moveTo(6,y);g.lineTo(11,y);g.stroke()}
  g.save();g.translate(12,8);g.scale(0.82,0.82);g.fillStyle=E.c;g.fill(new Path2D(GLY[el]));g.restore();g.fillStyle='#f0e2bc';g.fillRect(15,32,15,6)})}
function spPage(){return spr('page',28,32,g=>{g.fillStyle='#efe4cc';g.strokeStyle='#8a6a3a';g.lineWidth=1.5;g.beginPath();g.moveTo(4,3);g.lineTo(20,3);g.lineTo(25,8);g.lineTo(25,29);g.lineTo(4,29);g.closePath();g.fill();g.stroke();
  g.strokeStyle='#7a4a2a';g.lineWidth=1.3;for(let y=10;y<27;y+=5){g.beginPath();g.moveTo(8,y);g.lineTo(21,y);g.stroke()}})}
BT.SPR=SPR;

/* ================= GÂY SÁT THƯƠNG & HIỆU ỨNG LÊN QUÁI ================= */
let khacT=0;
function hitE(e,raw,o,B){if(!e||e.dead)return 0;o=o||{};let m=1;
  try{if(window.B2&&B2.elOf&&KH[B.el]===B2.elOf(e)){m=1.15;if(G.t-khacT>0.7){khacT=G.t;addFloat(e.x+rand(-6,6),e.y-30*(e.sc||1)-46,'Khắc '+EL[B.el].n,EL[B.el].c,14)}}}catch(err){}
  o.bt=B.id;return hurtEnemy(e,raw*m,o)}
function stOf(e){let s=e.btSt;if(!s)s=e.btSt={b:0,bd:0,bk:0,bel:'hoa',r:0,rx:0,ry:0,f:0};BTS.st.add(e);return s}
function burn(e,t,dps,el){if(e.dead)return;const s=stOf(e);s.bd=s.b>0?Math.max(s.bd,dps):dps;s.b=Math.max(s.b,t);s.bel=el||'hoa';if(s.bk<=0)s.bk=0.5}
function root(e,t){if(e.dead||e.boss)return;const s=stOf(e);if(s.r<=0){s.rx=e.x;s.ry=e.y}s.r=Math.max(s.r,t*(e.elite?0.6:1))}
function freeze(e,t){if(e.dead)return;if(e.boss){e.slow=Math.max(e.slow||0,t*1.6);return}const k=e.elite?0.6:1;e.stun=Math.max(e.stun||0,t*k);const s=stOf(e);s.f=Math.max(s.f,t*k)}
function slowE(e,t){if(!e.dead)e.slow=Math.max(e.slow||0,t)}
function heal(v){const p=G.p;if(!p||p.hp<=0)return;const a=Math.min(p.maxhp-p.hp,v);p.hp+=a;if(a>=1)addFloat(p.x,p.y-60,'+'+fmt(a),'#7dff8a',16)}
function ringFx(el,x,y,r,T,o){BTS.ents.push(Object.assign({k:'rune',el,x,y,r,t:T,T,rot:Math.random()*TAU},o||{}))}
function shake(v){G.shake=Math.max(G.shake,v)}
function puff(x,y,el,n,sp){const E=EL[el];for(let i=0;i<n;i++){const a=Math.random()*TAU,v=rand(sp*0.3,sp);addPart(x,y,Math.cos(a)*v,Math.sin(a)*v*0.6-40,rand(0.35,0.7),i%3?E.c:E.l,rand(2,4.5),120,'c',1)}}

/* ================= CHIÊU THỨC ================= */
function zone(c,o){BTS.ents.push(Object.assign({k:'zone',tt:0,B:c.B,D:c.D,t:o.T,el:c.B.el},o))}
function proj(c,o){BTS.ents.push(Object.assign({k:'proj',B:c.B,D:c.D,hit:new Set(),trail:[]},o))}
function nearList(x,y,r,n){return G.enemies.filter(e=>!e.dead&&dist2(x,y,e.x,e.y)<r*r).sort((a,b)=>dist2(x,y,a.x,a.y)-dist2(x,y,b.x,b.y)).slice(0,n)}
function strikes(c,n,col,r,m,o,cb){const p=c.p,ts=nearList(p.x,p.y,380,n);
  for(let k=0;k<n;k++){const e=ts.length?ts[k%ts.length]:null;later(0.08+k*0.12,()=>{const x=e&&!e.dead?e.x:p.x+rand(-200,200),y=e&&!e.dead?e.y:p.y+rand(-170,170);cb(x,y,k)})}}
const CAST={
  loidinh(c){const{p,B,E}=c;let cur=c.t||nearestEnemy(p.x,p.y,380);let px=p.x+Math.cos(c.aim)*20,py=p.y-30;
    if(!cur){G.fx.push({k:'bolt',x1:px,y1:py,x2:c.tx,y2:c.ty-18,life:0.24,max:0.24,col:E.l,w:3.5});Audio_.play('zap');return}
    const hs=new Set();for(let k=0;k<7&&cur;k++){hs.add(cur);G.fx.push({k:'bolt',x1:px,y1:py,x2:cur.x,y2:cur.y-18,life:0.28,max:0.28,col:k?E.c:E.l,w:k?2.6:4.5});
      hitE(cur,c.D*B.m*(1-k*0.08),{stun:0.3},B);G.fx.push({k:'flash',x:cur.x,y:cur.y-18,r:46,col:E.c,life:0.2,max:0.2});px=cur.x;py=cur.y-18;const c0=cur;cur=nearestEnemy(c0.x,c0.y,230,e=>!hs.has(e))}
    Audio_.play('zap')},
  kimchung(c){const{p,B,E}=c;const amt=p.maxhp*0.22*healK(c.lv);BTS.sh={amt,max:amt,t:6,T:6,el:'kim',bell:1};
    enemiesIn(p.x,p.y,130).forEach(e=>hitE(e,c.D*B.m,{kb:220,ang:Math.atan2(e.y-p.y,e.x-p.x)},B));
    ringFx('kim',p.x,p.y,150,0.7,{follow:1});G.fx.push({k:'ring',x:p.x,y:p.y,r:20,r2:160,life:0.4,max:0.4,col:E.c});Audio_.play('clang');shake(5)},
  vantien(c){zone(c,{kind:'arrows',x:c.tx,y:c.ty,r:130,T:2.4,tick:0.2,m:c.B.m});ringFx('kim',c.tx,c.ty,138,2.6);Audio_.play('bow')},
  dongakiem(c){BTS.ents.push({k:'orbit',B:c.B,D:c.D,t:5,T:5,n:6,r:92,tick:0.25,tt:0.1,a:0,m:c.B.m});Audio_.play('clang');Audio_.play('magic')},
  hoixuan(c){const{p}=c;const K=healK(c.lv);heal(p.maxhp*0.16*K);BTS.hot={t:5,per:p.maxhp*0.025*K,acc:0};ringFx('moc',p.x,p.y,110,5,{follow:1,soft:1});
    for(let i=0;i<18;i++)addPart(p.x+rand(-30,30),p.y-rand(0,40),rand(-20,20),rand(-110,-50),rand(0.7,1.2),i%2?'#9ff07a':'#dcffc8',rand(2.5,4),-30,'c',1);Audio_.play('magic')},
  phongquyen(c){const{p,B}=c;for(let v=0;v<3;v++)later(v*0.12,()=>{const t=aimTarget(420),a0=t?Math.atan2(t.y-p.y,t.x-p.x):c.aim;p.aim=a0;
      for(let k=-1;k<=1;k++){const a=a0+k*0.2+(v-1)*0.05;proj(c,{spr:'leaf',x:p.x+Math.cos(a)*16,y:p.y-22,vx:Math.cos(a)*840,vy:Math.sin(a)*840,r:18,life:0.5,pierce:2,m:B.m,kb:50,spin:1})}Audio_.play('swing')});Audio_.play('dash')},
  dangla(c){const{B}=c,x=c.tx,y=c.ty;ringFx('moc',x,y,120,2.8);later(0.22,()=>{enemiesIn(x,y,118).forEach(e=>{hitE(e,c.D*B.m,{noStagger:1},B);root(e,2.5);burn(e,2.5,c.D*0.6,'moc')});
      for(let i=0;i<10;i++){const a=i/10*TAU;addPart(x+Math.cos(a)*50,y+Math.sin(a)*40,Math.cos(a)*40,-120,0.6,'#7fd85e',4,260)}pushDust(x,y,8,80);Audio_.play('slam')})},
  thuylong(c){const{p,B}=c,a=c.aim;proj(c,{spr:'dragon',x:p.x+Math.cos(a)*20,y:p.y-26,vx:Math.cos(a)*560,vy:Math.sin(a)*560,r:34,life:0.95,pierce:99,m:B.m,slow:2.5,kb:90,ang:a});Audio_.play('magic');Audio_.play('roar')},
  hanbang(c){const{p,B,E}=c;enemiesIn(p.x,p.y,150).forEach(e=>{hitE(e,c.D*B.m,{noStagger:1},B);freeze(e,1.8)});ringFx('thuy',p.x,p.y,160,0.9);
    G.fx.push({k:'ring',x:p.x,y:p.y,r:20,r2:170,life:0.45,max:0.45,col:E.l},{k:'flash',x:p.x,y:p.y-10,r:150,col:E.c,life:0.35,max:0.35});
    for(let i=0;i<10;i++){const a=i/10*TAU;BTS.ents.push({k:'flake',x:p.x+Math.cos(a)*40,y:p.y-20+Math.sin(a)*30,vx:Math.cos(a)*260,vy:Math.sin(a)*190,t:0.6,T:0.6,a})}Audio_.play('clang');shake(6)},
  trieudang(c){zone(c,{kind:'whirl',x:c.tx,y:c.ty,r:150,T:2.0,tick:0.25,m:c.B.m,end:z=>{enemiesIn(z.x,z.y,170).forEach(e=>hitE(e,z.D*3,{kb:200,ang:Math.atan2(e.y-z.y,e.x-z.x)},z.B));
      G.fx.push({k:'ring',x:z.x,y:z.y,r:20,r2:190,life:0.5,max:0.5,col:'#dcf2ff'},{k:'flash',x:z.x,y:z.y,r:170,col:'#5cb8ff',life:0.4,max:0.4});puff(z.x,z.y,'thuy',24,260);shake(8);Audio_.play('boom')}});
    ringFx('thuy',c.tx,c.ty,160,2.3);Audio_.play('magic')},
  hoaho(c){const{p,B}=c,a=c.aim;proj(c,{spr:'tiger',x:p.x+Math.cos(a)*20,y:p.y-26,vx:Math.cos(a)*640,vy:Math.sin(a)*640,r:32,life:0.75,pierce:99,m:B.m,burn:4,kb:120,ang:a});Audio_.play('boom');Audio_.play('roar')},
  thanco(c){const{p,B}=c,ts=nearList(p.x,p.y,420,8);for(let k=0;k<8;k++){const e=ts.length?ts[k%ts.length]:null;
      later(k*0.07,()=>{const tx=e&&!e.dead?e.x+rand(-14,14):c.tx+rand(-90,90),ty=e&&!e.dead?e.y+rand(-10,10):c.ty+rand(-70,70);
        BTS.ents.push({k:'shell',B,D:c.D,sx:p.x,sy:p.y-30,tx,ty,t:0,T:0.5+rand(0,0.12),m:B.m,x:p.x,y:p.y,z:0});Audio_.play('bow')})}},
  lietthieu(c){const{B,E}=c,x=c.tx,y=c.ty;enemiesIn(x,y,140).forEach(e=>{hitE(e,c.D*2,{kb:80,ang:Math.atan2(e.y-y,e.x-x)},B);burn(e,3,c.D*0.3,'hoa')});
    G.fx.push({k:'flash',x,y,r:150,col:E.c,life:0.4,max:0.4},{k:'ring',x,y,r:20,r2:150,life:0.4,max:0.4,col:'#ffd23a'});pushCrack(x,y,100,8);
    zone(c,{kind:'fire',x,y,r:140,T:4,tick:0.3,m:B.m,fl:Array.from({length:9},(_,i)=>{const a=i/9*TAU+rand(-.3,.3),r=rand(20,120);return[x+Math.cos(a)*r,y+Math.sin(a)*r*0.8,rand(0,6)]})});
    ringFx('hoa',x,y,148,4.2);Audio_.play('boom');shake(7)},
  phason(c){const{p,B,E}=c,a=c.aim,x=p.x+Math.cos(a)*55,y=p.y+Math.sin(a)*45;enemiesIn(x,y,140).forEach(e=>hitE(e,c.D*B.m,{stun:1.2,kb:200,ang:Math.atan2(e.y-p.y,e.x-p.x)},B));
    ringFx('tho',x,y,145,0.8);G.fx.push({k:'ring',x,y,r:20,r2:150,life:0.4,max:0.4,col:E.c},{k:'flash',x,y,r:110,col:E.c,life:0.3,max:0.3});pushCrack(x,y,120,10);pushDust(x,y,14,110);
    for(let j=0;j<5;j++){const b=a+(j-2)*0.32;BTS.ents.push({k:'spk',x:p.x+Math.cos(b)*(60+j%2*30),y:p.y+Math.sin(b)*(50+j%2*24),t:0.7,T:0.7,s:0.9})}
    G.hitstop=Math.max(G.hitstop,0.06);shake(10);Audio_.play('slam')},
  thientru(c){const{p,B}=c,cnt=new Map();ringFx('tho',p.x,p.y,200,1.6,{follow:1});const ts=nearList(p.x,p.y,360,9);
    for(let k=0;k<9;k++){const e=ts.length?ts[k%ts.length]:null;const x=e?e.x+rand(-16,16):p.x+rand(-220,220),y=e?e.y+rand(-12,12):p.y+rand(-180,180);
      BTS.ents.push({k:'drop',kind:'pillar',x,y,r:58,t:0.45+k*0.09,T:0.45+k*0.09,el:'tho',fn:()=>{enemiesIn(x,y,58).forEach(en=>{const n=cnt.get(en)||0;if(n>=4)return;cnt.set(en,n+1);hitE(en,c.D*B.m,{stun:0.6,kb:60},B)});
        pushCrack(x,y,50,6);pushDust(x,y,6,50);BTS.ents.push({k:'spk',x,y,t:1.0,T:1.0,s:1.5,pil:1});shake(5);Audio_.play('slam')}})}},
  coloa(c){const{p,B}=c,hs=new Set();BTS.buf.coloa=6;recalc();[80,150,220].forEach((rr,k)=>later(k*0.18,()=>{for(const e of G.enemies){if(e.dead||hs.has(e))continue;const d=dist(p.x,p.y,e.x,e.y);if(d<rr+e.r&&d>rr-75-e.r){hs.add(e);hitE(e,c.D*B.m,{noStagger:1},B);root(e,1.5)}}
      const n=10+k*6;for(let j=0;j<n;j++){const a=j/n*TAU+k*0.3;BTS.ents.push({k:'spk',x:p.x+Math.cos(a)*rr,y:p.y+Math.sin(a)*rr*0.85,t:1.3,T:1.3,s:0.8+k*0.15})}pushCrack(p.x,p.y,rr,5);shake(6);Audio_.play('slam')}));
    ringFx('tho',p.x,p.y,230,1.4)},
  thienloi(c){const{p,B,E}=c;BTS.sh={amt:p.maxhp*0.12*healK(c.lv),max:p.maxhp*0.12*healK(c.lv),t:8,T:8,el:'kim'};ringFx('kim',p.x,p.y,190,1.6,{follow:1});
    strikes(c,5,E.l,70,B.m,{},(x,y)=>{G.fx.push({k:'bolt',x1:x+rand(-30,30),y1:y-460,x2:x,y2:y,life:0.3,max:0.3,col:'#fffbe0',w:6},{k:'flash',x,y,r:90,col:E.c,life:0.3,max:0.3},{k:'ring',x,y,r:10,r2:80,life:0.35,max:0.35,col:E.l});
      enemiesIn(x,y,70).forEach(e=>hitE(e,c.D*B.m,{stun:0.4},B));pushCrack(x,y,52,6);shake(6);Audio_.play('zap')})},
  huyetma(c){const{p,B}=c;ringFx('hoa',p.x,p.y,190,1.6,{follow:1,ta:1});
    strikes(c,5,'#ff3a5a',70,B.m,{},(x,y)=>{let got=0;enemiesIn(x,y,70).forEach(e=>{got+=hitE(e,c.D*B.m,{critB:10},B)||0});if(got)heal(got*0.3);
      G.fx.push({k:'xslash',x,y:y-18,life:0.32,max:0.32,col:'#ff3a5a'},{k:'flash',x,y,r:80,col:'#c8102e',life:0.3,max:0.3});
      for(let i=0;i<8;i++)addPart(x+rand(-14,14),y-18,rand(-60,60),rand(-80,-20),0.5,i%2?'#ff3a5a':'#5a0a1e',3,200);shake(4);Audio_.play('dash')})},
  haokhi(c){const{p,B,E}=c;BTS.buf.haokhi=8;recalc();enemiesIn(p.x,p.y,160).forEach(e=>hitE(e,c.D*B.m,{kb:260,ang:Math.atan2(e.y-p.y,e.x-p.x)},B));
    ringFx('hoa',p.x,p.y,170,1.2,{follow:1});G.fx.push({k:'ring',x:p.x,y:p.y,r:20,r2:180,life:0.45,max:0.45,col:'#ffd23a'},{k:'pillar',x:p.x,y:p.y,w:44,h:300,col:'#ff9a3a',life:0.8,max:0.8});
    callout('Sát Thát!','#ffd98a');Audio_.play('roar');shake(8)},
  maanh(c){const{p,B}=c;BTS.buf.maanh=8;recalc();enemiesIn(p.x,p.y,160).forEach(e=>hitE(e,c.D*B.m,{critB:20},B));ringFx('thuy',p.x,p.y,170,1.2,{follow:1,ta:1});
    for(let k=0;k<6;k++)later(k*0.05,()=>pushGhost(p.x+rand(-40,40),p.y+rand(-30,30),Math.random()<0.5?1:-1,'#5a3aa0',0.5));
    G.fx.push({k:'ring',x:p.x,y:p.y,r:180,r2:20,life:0.45,max:0.45,col:'#a066e0'});Audio_.play('dash');Audio_.play('magic')},
  namquoc(c){const{p,B}=c,x=c.tx,y=c.ty;ringFx('tho',x,y,175,1.3);heal(p.maxhp*0.15*healK(c.lv));
    BTS.ents.push({k:'drop',kind:'seal',x,y,r:170,t:0.55,T:0.55,el:'tho',fn:()=>{enemiesIn(x,y,170).forEach(e=>hitE(e,c.D*B.m,{stun:1.5,kb:120,ang:Math.atan2(e.y-y,e.x-x)},B));
      G.fx.push({k:'ring',x,y,r:30,r2:200,life:0.55,max:0.55,col:'#ffd98a'},{k:'flash',x,y,r:190,col:'#ff6a3a',life:0.4,max:0.4});pushCrack(x,y,150,12);pushDust(x,y,18,150);
      BTS.ents.push({k:'sealg',x,y,t:1.2,T:1.2});G.hitstop=Math.max(G.hitstop,0.08);shake(12);Audio_.play('slam');Audio_.play('boom')}})},
  amphong(c){const{B}=c,x=c.tx,y=c.ty;ringFx('moc',x,y,165,1.0,{ta:1});BTS.ents.push({k:'drop',kind:'vortex',x,y,r:160,t:0.4,T:0.4,el:'moc',fn:()=>{enemiesIn(x,y,160).forEach(e=>hitE(e,c.D*B.m,{critB:30,kb:-120,ang:Math.atan2(e.y-y,e.x-x)},B));
      G.fx.push({k:'flash',x,y,r:170,col:'#3a6a2a',life:0.4,max:0.4},{k:'ring',x,y,r:170,r2:10,life:0.4,max:0.4,col:'#9ff07a'});puff(x,y,'moc',22,280);shake(9);Audio_.play('boom')}});Audio_.play('dash')},
};

function castFx(B,c){const p=G.p,E=EL[B.el];
  G.floats.push({x:p.x,y:p.y-98,txt:B.n,col:B.side?SIDE[B.side].c:E.l,size:B.big?22:18,life:1.15,vy:-26,skill:1});
  G.fx.push({k:'flash',x:p.x,y:p.y-24,r:B.big?90:54,col:E.c,life:0.3,max:0.3});
  if(B.big){G.fx.push({k:'pillar',x:p.x,y:p.y,w:24,h:260,col:E.c,life:0.6,max:0.6});shake(4)}
  if(c.res)for(let i=0;i<10;i++){const a=i/10*TAU;addPart(p.x+Math.cos(a)*22,p.y-24+Math.sin(a)*16,Math.cos(a)*120,Math.sin(a)*80-40,0.5,E.l,3,0,'c',1)}}

/* ================= TUNG CHIÊU ================= */
function canCastBook(i){const S=G.save,p=G.p,s=st();if(!S||!p||!s||G.state!=='play')return false;if(!slotOpen(i))return false;const id=s.eq[i];if(!id)return false;const B=BY[id];
  ensureCd(p);return usable(B)&&p.skCd[3+i]<=0&&p.mp>=B.mp&&!p.dash}
function castBook(i,quiet){const S=G.save,p=G.p,s=st();if(!S||!p||!s||G.state!=='play')return false;
  if(!slotOpen(i)){if(!quiet)UI.toast('Ô Bí Tịch '+(i+1)+': '+slotLock(i).toLowerCase());return false}
  const id=s.eq[i];if(!id){if(!quiet)UI.toast('Ô Bí Tịch '+(i+1)+' trống. Mở Võ Đạo → Bí Tịch để trang bị.');return false}
  const B=BY[id],o=s.own[id];if(!B||!o)return false;const why=whyNot(B);if(why){if(!quiet)UI.toast(B.n+': '+why);return false}
  ensureCd(p);const ci=3+i;if(p.skCd[ci]>0||p.dash)return false;
  if(p.mp<B.mp){if(!quiet){UI.toast('Không đủ nội lực');UI.pulse&&UI.pulse('#mpBar')}return false}
  p.mp-=B.mp;p.skCd[ci]=bookCd(B,o.lv);S.tut.skill=true;try{sideEvent('skill',1)}catch(e){}
  const t=aimTarget(420);const aim=t?Math.atan2(t.y-p.y,t.x-p.x):p.aim;p.aim=aim;p.f=Math.cos(aim)>=0?1:-1;p.atkAnim=0;
  const tx=t?t.x:p.x+Math.cos(aim)*160,ty=t?t.y:p.y+Math.sin(aim)*160,res=reso(B);
  const D=p.atk*lvMult(o.lv)*(res?1.25:1)*(s.phe==='ta'?1.12:1);
  const c={p,B,lv:o.lv,D,aim,t,tx,ty,E:EL[B.el],res};
  CAST[B.id](c);castFx(B,c);UI.castFx&&UI.castFx(ci);
  HK.ev('cast',ci,{id:'bt_'+B.id,name:B.n,mult:B.m,mp:B.mp,cd:B.cd,bt:1});
  BTS.casts=(BTS.casts||0)+1;return true}
BT.cast=castBook;BT.canCast=canCastBook;

/* ================= CẬP NHẬT THỰC THỂ ================= */
function updEnts(dt){const p=G.p,L=BTS.ents;
  for(let i=L.length-1;i>=0;i--){const n=L[i];n.t-=dt;
    switch(n.k){
      case'proj':{n.x+=n.vx*dt;n.y+=n.vy*dt;n.life-=dt;if(n.trail){n.trail.push(n.x,n.y);if(n.trail.length>28)n.trail.splice(0,2)}
        for(const e of G.enemies){if(e.dead||n.hit.has(e))continue;if(dist(n.x,n.y,e.x,e.y-14*e.sc)<n.r+e.r){n.hit.add(e);
          hitE(e,n.D*n.m,{kb:n.kb||50,ang:Math.atan2(n.vy,n.vx)},n.B);if(n.slow)slowE(e,n.slow);if(n.burn)burn(e,n.burn,n.D*0.35,'hoa');
          if(n.pierce--<=0){n.life=0;break}}}
        if(n.spr==='tiger'&&Math.random()<0.9)addPart(n.x-n.vx*0.03+rand(-10,10),n.y+rand(-12,12),rand(-30,30),rand(-80,-20),0.45,Math.random()<0.5?'#ff7a2a':'#ffd23a',rand(3,6),-30,'c',1);
        if(n.spr==='dragon'&&Math.random()<0.7)addPart(n.x+rand(-14,14),n.y+rand(-10,10),rand(-30,30),rand(-30,30),0.5,'#dcf2ff',rand(2,3.5),60,'c',1);
        if(n.life<=0)L.splice(i,1);break}
      case'shell':{n.t=1;n.z=(n.z||0);n.p=(n.p||0)+dt/n.T;const k=Math.min(1,n.p);n.x=lerp(n.sx,n.tx,k);n.y=lerp(n.sy+30,n.ty,k);n.z=Math.sin(k*Math.PI)*110+(1-k)*30;
        if(Math.random()<0.8)addPart(n.x,n.y-n.z,rand(-20,20),rand(-20,10),0.35,Math.random()<0.5?'#ff9a3a':'#8a8070',rand(2.5,4.5),-20,'c',Math.random()<0.5?1:0);
        if(k>=1){enemiesIn(n.tx,n.ty,58).forEach(e=>{hitE(e,n.D*n.m,{kb:60,ang:Math.atan2(e.y-n.ty,e.x-n.tx)},n.B);burn(e,2,n.D*0.25,'hoa')});
          G.fx.push({k:'ring',x:n.tx,y:n.ty,r:8,r2:62,life:0.3,max:0.3,col:'#ff8a3a'},{k:'flash',x:n.tx,y:n.ty,r:64,col:'#ff6b3d',life:0.25,max:0.25});puff(n.tx,n.ty,'hoa',8,180);shake(3);Audio_.play('boom');L.splice(i,1)}break}
      case'zone':{n.tt-=dt;if(n.tt<=0){n.tt=n.tick;const es=enemiesIn(n.x,n.y,n.r);
          for(const e of es){hitE(e,n.D*n.m,{noStagger:1},n.B);if(n.kind==='fire')burn(e,1.5,n.D*0.2,'hoa')}
          if(n.kind==='arrows'){for(let k=0;k<6;k++){const a=Math.random()*TAU,r=Math.sqrt(Math.random())*n.r;G.fx.push({k:'arrowfall',x:n.x+Math.cos(a)*r,y:n.y+Math.sin(a)*r*0.8,life:0.2,max:0.2})}Audio_.play('bow')}}
        if(n.kind==='whirl'){n.rot=(n.rot||0)+dt*5;for(const e of G.enemies){if(e.dead||e.boss)continue;const d=dist(n.x,n.y,e.x,e.y);if(d>n.r+40||d<12)continue;const a=Math.atan2(n.y-e.y,n.x-e.x),k=(e.elite?120:240)*dt;moveEnt(G.W,e,Math.cos(a)*k+Math.cos(a+1.57)*k*0.5,Math.sin(a)*k+Math.sin(a+1.57)*k*0.5)}
          if(Math.random()<0.8){const a=Math.random()*TAU,r=n.r*rand(0.3,1);addPart(n.x+Math.cos(a)*r,n.y+Math.sin(a)*r*0.8,-Math.sin(a)*160,Math.cos(a)*120-30,0.45,Math.random()<0.5?'#dcf2ff':'#5cb8ff',rand(2.5,4),0,'c',1)}}
        if(n.kind==='fire'&&Math.random()<0.7){const a=Math.random()*TAU,r=Math.sqrt(Math.random())*n.r;addPart(n.x+Math.cos(a)*r,n.y+Math.sin(a)*r*0.8,0,rand(-90,-40),0.5,Math.random()<0.5?'#ff7a2a':'#ffd23a',rand(3,6),-40,'c',1)}
        if(n.t<=0){if(n.end)n.end(n);L.splice(i,1)}break}
      case'orbit':{n.a+=dt*5.2;n.tt-=dt;if(n.tt<=0){n.tt=n.tick;enemiesIn(p.x,p.y,n.r+26).forEach(e=>hitE(e,n.D*n.m,{kb:40,noStagger:1},n.B));if(Math.random()<0.5)Audio_.play('swing')}
        if(n.t<=0){G.fx.push({k:'ring',x:p.x,y:p.y,r:n.r,r2:n.r+60,life:0.3,max:0.3,col:EL.kim.c});L.splice(i,1)}break}
      case'drop':if(n.t<=0){n.fn&&n.fn();L.splice(i,1)}break;
      case'flake':n.x+=n.vx*dt;n.y+=n.vy*dt;n.vx*=0.9;n.vy*=0.9;if(n.t<=0)L.splice(i,1);break;
      case'fly':{n.p=Math.min(1,(n.p||0)+dt/n.T);if(n.p>=1){if(p)puff(p.x,p.y-30,n.el,10,140);L.splice(i,1)}break}
      default:if(n.t<=0)L.splice(i,1);
    }}}
function updStatus(dt){for(const e of BTS.st){const s=e.btSt;if(e.dead||!s){BTS.st.delete(e);continue}
    if(s.b>0){s.b-=dt;s.bk-=dt;if(s.bk<=0){s.bk=0.5;hurtEnemy(e,s.bd*0.5,{noStagger:1,proc:1,bt:'burn'});if(e.dead){BTS.st.delete(e);continue}}}
    if(s.r>0){s.r-=dt;e.x=s.rx;e.y=s.ry;e.kbx=0;e.kby=0}
    if(s.f>0)s.f-=dt;
    if(s.b<=0&&s.r<=0&&s.f<=0)BTS.st.delete(e)}}

/* ================= VẼ ================= */
function drawRune(el,x,y,r,rot,al){const c=rune(el);cx.save();cx.globalCompositeOperation='lighter';cx.translate(x,y);cx.scale(1,0.8);glow(0,0,r*1.05,EL[el].c,al*0.32);cx.globalAlpha=al;cx.rotate(rot);cx.drawImage(c,-r,-r,r*2,r*2);cx.restore()}
function drawGround(){if(!BTS.ents.length&&!BTS.hot)return;const p=G.p;
  for(const n of BTS.ents){
    if(n.k==='rune'){const k=n.t/n.T,inA=Math.min(1,(1-k)*n.T*6),al=Math.min(inA,Math.min(1,n.t*3))*(n.soft?0.5:0.85);const x=n.follow&&p?p.x:n.x,y=n.follow&&p?p.y:n.y;
      drawRune(n.el,x,y,n.r*(0.85+0.15*Math.min(1,inA)),n.rot+G.t*(n.ta?-0.9:0.6),al);if(n.ta){cx.save();cx.globalAlpha=al*0.5;cx.strokeStyle='#ff3a5a';cx.lineWidth=3;cx.beginPath();cx.ellipse(x,y,n.r*0.98,n.r*0.78,0,0,TAU);cx.stroke();cx.restore()}}
    else if(n.k==='drop'){const k=1-n.t/n.T;cx.save();cx.globalAlpha=0.25+0.35*k;cx.fillStyle=EL[n.el].d;cx.beginPath();cx.ellipse(n.x,n.y,n.r,n.r*0.8,0,0,TAU);cx.fill();
      cx.globalAlpha=0.8;cx.strokeStyle=EL[n.el].c;cx.lineWidth=2.5;cx.stroke();cx.fillStyle=EL[n.el].c;cx.globalAlpha=0.35;cx.beginPath();cx.ellipse(n.x,n.y,n.r*k,n.r*0.8*k,0,0,TAU);cx.fill();cx.restore()}
    else if(n.k==='zone'&&n.kind==='fire'){const al=Math.min(1,n.t*2);cx.save();cx.globalCompositeOperation='lighter';for(const f of n.fl){const s=1+0.18*Math.sin(G.t*12+f[2]);cx.globalAlpha=al*0.9;glow(f[0],f[1]-14,26,'#ff6b3d',al*0.6);cx.globalAlpha=al;const im=spFlame('hoa');cx.drawImage(im,f[0]-18*s,f[1]-46*s,36*s,48*s)}cx.restore()}
    else if(n.k==='zone'&&n.kind==='whirl'){const al=Math.min(1,n.t*3,(n.T-n.t)*4);cx.save();cx.globalCompositeOperation='lighter';cx.translate(n.x,n.y);cx.scale(1,0.8);cx.strokeStyle='#dcf2ff';cx.lineWidth=4;
      for(let k=0;k<4;k++){cx.globalAlpha=al*(0.75-k*0.15);cx.beginPath();cx.arc(0,0,n.r*(0.3+k*0.22),n.rot+k*1.3,n.rot+k*1.3+2.4);cx.stroke()}cx.restore()}
    else if(n.k==='sealg'){const k=n.t/n.T;cx.save();cx.globalAlpha=k*0.85;cx.translate(n.x,n.y);cx.scale(1,0.55);const im=spSeal();cx.drawImage(im,-84,-84,168,168);cx.restore()}
  }
  const s=BTS.sh,o=BTS.ents.find(n=>n.k==='orbit');
  if(o&&p)drawRune('kim',p.x,p.y,o.r+24,G.t*1.4,Math.min(1,o.t*2)*0.6);
}
function drawTop(){const p=G.p;
  for(const n of BTS.ents){
    if(n.k==='proj'){const a=Math.atan2(n.vy,n.vx),al=Math.min(1,n.life*4);
      if(n.spr==='dragon'){cx.save();cx.globalCompositeOperation='lighter';const tr=n.trail;for(let j=0;j<tr.length;j+=2){const q=j/tr.length,w=Math.sin(G.t*14-j*0.5)*8*q;glow(tr[j]-Math.sin(a)*w,tr[j+1]+Math.cos(a)*w,10+q*22,'#5cb8ff',al*q*0.7)}glow(n.x,n.y,54,'#5cb8ff',al*0.55);cx.restore();
        cx.save();cx.globalAlpha=al;cx.translate(n.x,n.y);cx.rotate(a);if(Math.cos(a)<0)cx.scale(1,-1);cx.drawImage(spDragon(),-70,-52,128,96);cx.restore()}
      else if(n.spr==='tiger'){cx.save();cx.globalCompositeOperation='lighter';glow(n.x-Math.cos(a)*30,n.y-Math.sin(a)*30,60,'#ff6b3d',al*0.6);glow(n.x,n.y,40,'#ffd23a',al*0.5);cx.restore();
        cx.save();cx.globalAlpha=al;cx.translate(n.x,n.y);cx.rotate(a);if(Math.cos(a)<0)cx.scale(1,-1);cx.drawImage(spTiger(),-66,-54,128,104);cx.restore()}
      else{cx.save();cx.globalCompositeOperation='lighter';glow(n.x,n.y,26,'#7fd85e',al*0.6);cx.globalAlpha=al;cx.translate(n.x,n.y);cx.rotate(a+(n.spin?G.t*0:0));cx.scale(1.1,0.8);cx.drawImage(spLeaf(),-32,-32,64,64);cx.restore()}}
    else if(n.k==='shell'){cx.save();cx.globalCompositeOperation='lighter';glow(n.x,n.y-n.z,22,'#ff8a3a',0.8);cx.restore();const a=Math.atan2((n.ty-n.sy),(n.tx-n.sx))-Math.cos(n.p*Math.PI)*0.9*(n.tx>n.sx?1:-1);
      cx.save();cx.translate(n.x,n.y-n.z);cx.rotate(a);cx.drawImage(spRocket(),-24,-8,48,16);cx.restore();cx.fillStyle='rgba(0,0,0,.25)';cx.beginPath();cx.ellipse(n.x,n.y,10,4,0,0,TAU);cx.fill()}
    else if(n.k==='orbit'&&p){const al=Math.min(1,n.t*3,(n.T-n.t)*6);for(let j=0;j<n.n;j++){const a=n.a+j/n.n*TAU,x=p.x+Math.cos(a)*n.r,y=p.y-18+Math.sin(a)*n.r*0.75;
        cx.save();cx.globalCompositeOperation='lighter';glow(x,y,26,'#f2d675',al*0.55);cx.restore();cx.save();cx.globalAlpha=al;cx.translate(x,y);cx.rotate(a+Math.PI/2);cx.drawImage(spBlade(),-42,-11,84,22);cx.restore()}}
    else if(n.k==='drop'){const k=1-n.t/n.T;
      if(n.kind==='pillar'){const h=(1-k)*360;cx.save();cx.globalAlpha=Math.min(1,k*3);cx.drawImage(spPillar(),n.x-26,n.y-156-h,52,156);cx.restore()}
      else if(n.kind==='seal'){const h=(1-k)*420,s=0.7+k*0.5;cx.save();cx.globalAlpha=Math.min(1,k*2.5);cx.translate(n.x,n.y-120-h);cx.scale(s,s);cx.drawImage(spSeal(),-84,-84,168,168);cx.restore();
        cx.save();cx.globalCompositeOperation='lighter';glow(n.x,n.y-120-h,110*s,'#ff6a3a',k*0.6);cx.restore()}
      else if(n.kind==='vortex'){cx.save();cx.globalCompositeOperation='lighter';cx.translate(n.x,n.y-10);cx.scale(1,0.7);cx.strokeStyle='#9ff07a';cx.lineWidth=5;for(let j=0;j<5;j++){cx.globalAlpha=k*(0.9-j*0.15);cx.beginPath();cx.arc(0,0,n.r*(1-k*0.7)*(0.4+j*0.15),G.t*-9+j,G.t*-9+j+2.2);cx.stroke()}glow(0,0,n.r*0.6,'#2a4a1a',k*0.6);cx.restore()}}
    else if(n.k==='spk'){const k=n.t/n.T,rise=Math.min(1,(1-k)*7),fade=Math.min(1,k*3);cx.save();cx.globalAlpha=fade;
      if(n.pil){cx.drawImage(spPillar(),n.x-26,n.y-150,52,156*Math.max(0.001,rise))}else{const s=n.s;cx.drawImage(spSpike(),n.x-20*s,n.y-50*s*rise,40*s,52*s*rise)}cx.restore()}
    else if(n.k==='flake'){const k=n.t/n.T;cx.save();cx.globalAlpha=k;cx.translate(n.x,n.y);cx.rotate(n.a+G.t*3);cx.drawImage(spFlake(),-16,-16,32,32);cx.restore()}
    else if(n.k==='fly'){const k=n.p||0,e=1-Math.pow(1-k,3);const tx=p?p.x:n.x,ty=p?p.y-40:n.y;const x=lerp(n.x,tx,e),y=lerp(n.y-20,ty,e)-Math.sin(k*Math.PI)*120;
      cx.save();cx.globalCompositeOperation='lighter';glow(x,y,34,EL[n.el].c,0.8);cx.restore();cx.save();cx.translate(x,y);cx.rotate(Math.sin(G.t*8)*0.2);const im=n.page?spPage():spBook(n.el,n.rar);cx.drawImage(im,-im.width/2,-im.height/2);cx.restore()}
  }
  // trạng thái trên quái
  for(const e of BTS.st){const s=e.btSt;if(!s||e.dead)continue;
    if(s.b>0){const f=1+0.15*Math.sin(G.t*16+e.id),sc=e.sc||1;cx.save();cx.globalCompositeOperation='lighter';glow(e.x,e.y-18*sc,22*sc,EL[s.bel].c,0.5);cx.globalAlpha=0.9;const im=spFlame(s.bel);cx.drawImage(im,e.x-12*f*sc,e.y-30*sc-24*f*sc,24*f*sc,32*f*sc);cx.restore()}
    if(s.f>0){const sc=e.sc||1;cx.save();cx.globalCompositeOperation='lighter';glow(e.x,e.y-18*sc,30*sc,'#5cb8ff',0.65);cx.restore();cx.save();cx.globalAlpha=0.9;cx.translate(e.x,e.y-34*sc);cx.rotate(G.t);cx.drawImage(spFlake(),-14,-14,28,28);cx.restore()}
    if(s.r>0){const sc=e.sc||1;cx.save();cx.globalAlpha=Math.min(1,s.r*3);cx.drawImage(spVine(),e.x-42*sc*1.1,e.y-26*sc,84*sc*1.1,44*sc);cx.restore()}}
  // khiên
  const sh=BTS.sh;if(sh&&p&&sh.amt>0){const k=sh.amt/sh.max,al=Math.min(1,sh.t*2)*(0.45+0.4*k);
    if(sh.bell){cx.save();cx.globalAlpha=al;const s=0.62+0.03*Math.sin(G.t*6);cx.drawImage(spBell(),p.x-86*s,p.y-182*s+6,172*s,196*s);cx.restore()}
    else{cx.save();cx.globalCompositeOperation='lighter';cx.globalAlpha=al;cx.strokeStyle=EL[sh.el].l;cx.lineWidth=3;cx.beginPath();cx.ellipse(p.x,p.y-30,44,56,0,0,TAU);cx.stroke();glow(p.x,p.y-30,60,EL[sh.el].c,al*0.4);cx.restore()}}
  // khí tức Chính / Tà và bùa tăng lực
  if(p&&(BTS.buf.haokhi>0||BTS.buf.maanh>0||BTS.buf.coloa>0)){cx.save();cx.globalCompositeOperation='lighter';const col=BTS.buf.maanh>0?'#a066e0':BTS.buf.haokhi>0?'#ff9a3a':'#d9a463';glow(p.x,p.y-30,70+6*Math.sin(G.t*5),col,0.35);cx.restore()}
}

/* ================= HUD: hai ô Bí Tịch ================= */
const CSS=`
#act .bts{width:52px;height:52px;--rc:var(--vang)}
#s3{right:4px;bottom:180px}#s4{right:64px;bottom:170px}
.bts.empty{border-style:dashed;border-color:rgba(226,178,74,.55);background:rgba(20,12,8,.5)}
.bts .pl{position:absolute;inset:0;z-index:3;display:grid;place-items:center;font:800 22px/1 var(--f-ui);color:rgba(255,217,138,.75);pointer-events:none}
.bts.reso{border-color:var(--rc);box-shadow:0 0 0 2px rgba(0,0,0,.35),0 0 14px var(--rc),0 5px 12px rgba(0,0,0,.5)}
.bts.reso::after{content:"";position:absolute;inset:-2px;border-radius:50%;z-index:0;background:radial-gradient(circle,transparent 55%,var(--rc) 100%);opacity:.55;animation:btPulse 1.6s ease-in-out infinite;pointer-events:none}
@keyframes btPulse{50%{opacity:.15}}
.bts .cdt{font-size:14px}
/* màn dọc thấp (iPhone SE, cửa sổ nhỏ): cột menu bên phải chạm xuống, nên dời hai ô sang trái cụm nút */
@media (min-height:501px) and (max-height:760px){#s3{right:186px;bottom:156px}#s4{right:226px;bottom:98px}}
/* bảng Bí Tịch */
.btw{max-width:720px;margin:0 auto}
.btSeg{display:flex;gap:6px;margin-bottom:12px}
.btSeg button{flex:1;min-width:0;min-height:44px;border-radius:10px;border:1px solid var(--line);background:rgba(0,0,0,.25);font:700 13px var(--f-ui);color:var(--dim)}
.btSeg button[aria-selected="true"]{color:var(--vang2);border-color:var(--vang);background:rgba(226,178,74,.12)}
.btSlots{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}
.btSlot{position:relative;min-height:104px;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:3px;padding:8px 3px 6px;border-radius:12px;border:1.5px dashed rgba(255,255,255,.18);background:rgba(0,0,0,.22);font:600 10.5px/1.25 var(--f-ui);color:var(--dim);text-align:center;overflow:hidden}
.btSlot.on{border-style:solid;border-color:var(--rc,var(--vang))}
.btSlot.lock{opacity:.6}
.btSlot.tgt{outline:2px solid var(--vang2);outline-offset:1px;animation:btTgt 1.2s ease-in-out infinite}
@keyframes btTgt{50%{outline-color:rgba(255,217,138,.15)}}
.btSlot svg{width:36px;height:44px;flex:none}
.btSlot b{color:var(--ink);font-size:11px;font-weight:700;overflow-wrap:anywhere}
.btSlot .k{font:800 9.5px var(--f-ui);color:var(--vang)}
.btRes{display:flex;flex-wrap:wrap;gap:6px 14px;font:600 12.5px var(--f-ui);color:var(--dim);margin:10px 0 0}
.btRes b{color:var(--ink)}
.btGh{display:flex;align-items:center;gap:8px;margin:14px 0 7px;font:700 12px/1.2 var(--f-ui);letter-spacing:.04em}
.btGh small{font-weight:600;color:var(--dim);letter-spacing:0}
.btGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(70px,1fr));gap:8px}
.btCell{position:relative;min-height:92px;min-width:0;padding:6px 2px 5px;border-radius:10px;border:1.5px solid var(--rc,#555);display:flex;flex-direction:column;align-items:center;gap:3px;
  background:radial-gradient(circle at 50% 35%,color-mix(in srgb,var(--ec,#555) 26%,#2a1d16),#120b07 80%);font:600 10px/1.15 var(--f-ui);color:var(--ink);text-align:center}
.btCell svg{width:34px;height:41px;flex:none}
.btCell span.nm{overflow-wrap:anywhere}
.btCell.no{opacity:.42;filter:grayscale(.85);border-style:dashed}
.btCell.cant{opacity:.7}
.btCell[aria-pressed="true"]{outline:2px solid #fff;outline-offset:2px}
.btCell .lv{position:absolute;top:2px;right:4px;font:800 10px var(--f-ui);color:var(--vang2);text-shadow:0 1px 2px #000}
.btCell .eqm{position:absolute;top:3px;left:4px;font:800 9px var(--f-ui);color:#1a1008;background:var(--vang2);border-radius:4px;padding:1px 3px}
.btCell .nw{position:absolute;top:-3px;right:-3px;width:10px;height:10px;border-radius:50%;background:var(--son);border:1px solid var(--vang2)}
.btCell .up{position:absolute;bottom:2px;right:4px;font:800 11px var(--f-ui);color:#7dff8a}
.btDet .nm{font:700 16px/1.2 var(--f-ui)}
.btDet .meta{font:600 11.5px/1.45 var(--f-ui);color:var(--dim)}
.btDet p{margin:8px 0 4px;font:500 13px/1.5 var(--f-ui)}
.btDet .tags{display:flex;flex-wrap:wrap;gap:5px;margin-top:6px}
.btDet .tags span{padding:3px 8px;border-radius:999px;font:700 11px var(--f-ui);background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12)}
.btDet .tags .g{color:#9affb8;border-color:rgba(120,255,160,.35)}.btDet .tags .w{color:#ffb8a0;border-color:rgba(255,140,110,.35)}
.btBig{flex:none;display:grid;place-items:center;width:70px;height:78px;border-radius:12px;border:2px solid var(--rc);background:radial-gradient(circle at 50% 40%,color-mix(in srgb,var(--ec) 30%,#2e211a),#120b07 80%)}
.btBig svg{width:46px;height:56px}
.btShop{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,300px),1fr));gap:8px}
.btSc{display:grid;grid-template-columns:auto 1fr auto;gap:10px;align-items:center;padding:10px;border-radius:12px;border:1px solid var(--rc,var(--line));background:rgba(0,0,0,.25)}
.btSc svg{width:36px;height:44px}
.btSc h5{margin:0 0 2px;font:700 14px/1.2 var(--f-ui)}.btSc p{margin:0;font:600 11.5px/1.4 var(--f-ui);color:var(--dim)}
.btSc .pr{font:800 12.5px var(--f-ui);color:var(--vang2);white-space:nowrap}
.btSc.sold{opacity:.45}
.btDao{display:grid;grid-template-columns:1fr;gap:10px}
@media(min-width:560px){.btDao{grid-template-columns:1fr 1fr}}
.btPath{padding:12px;border-radius:12px;border:1.5px solid var(--pc);background:linear-gradient(160deg,color-mix(in srgb,var(--pd) 55%,#1d1410),#140d09)}
.btPath h5{margin:0 0 4px;font:400 20px/1.1 var(--f-display);color:var(--pc)}
.btPath p,.btPath li{font:500 12.5px/1.5 var(--f-ui);color:var(--ink);margin:0}
.btPath ul{margin:6px 0 0;padding-left:1.1em}
.btPath.cur{box-shadow:0 0 0 2px var(--pc),0 0 18px color-mix(in srgb,var(--pc) 40%,transparent)}
/* hội thoại Ngộ Đạo */
#btDao{background:rgba(14,9,6,.78)}
#btDao .paper{width:min(560px,100%)}
#btDao .who{display:flex;gap:12px;align-items:center;margin-bottom:8px}
#btDao canvas{width:84px;height:100px;flex:none;border-radius:8px;background:radial-gradient(circle at 50% 70%,rgba(122,31,20,.18),transparent 70%)}
#btDao .ch{display:grid;grid-template-columns:1fr;gap:10px;margin:10px 0 12px}
@media(min-width:520px){#btDao .ch{grid-template-columns:1fr 1fr}}
#btDao .ch button{text-align:left;padding:12px;border-radius:10px;border:2px solid var(--pc);background:linear-gradient(160deg,var(--pd),#1d1410);color:#f3e9d4;min-height:44px;font:500 12.5px/1.45 var(--f-ui)}
#btDao .ch button b{display:block;font:400 19px/1.1 var(--f-display);color:var(--pc);margin-bottom:4px}
#btDao .row{justify-content:center}
`;
function css(){if(document.getElementById('btCss'))return;const s=document.createElement('style');s.id='btCss';s.textContent=CSS;document.head.appendChild(s)}
function hudDom(){if($q('#s3'))return;const act=$q('#act');if(!act)return;css();
  for(let i=0;i<2;i++){const b=document.createElement('button');b.className='abtn sk bts';b.id='s'+(3+i);b.hidden=true;b.setAttribute('aria-label','Bí Tịch ô '+(i+1));
    b.innerHTML=`<canvas width="120" height="120"></canvas><div class="cd"></div><div class="cdt"></div><span class="pl" hidden>+</span><span class="kc">${SLOT_KEY[i]}</span>`;
    act.insertBefore(b,act.firstChild);
    b.addEventListener('pointerdown',e=>{e.preventDefault();try{Audio_.unlock()}catch(_){}if(G.state!=='play'||G.paused)return;const s=st();
      if(s&&!s.eq[i]){BTS.view='lib';BTS.tgt=i;HUB.show('bitich');return}castBook(i)})}}
const hc={};
function hudUpd(){const S=G.save,p=G.p,s=st();if(!S||!p||!s)return;const b3=$q('#s3');if(!b3)return;ensureCd(p);
  for(let i=0;i<2;i++){const el=i?$q('#s4'):b3,open=slotOpen(i),id=s.eq[i],B=id&&BY[id];
    if(hc['o'+i]!==open){hc['o'+i]=open;el.hidden=!open;if(open&&hc['seen'+i]!==undefined){UI.flashSkill&&UI.flashSkill(3+i)}hc['seen'+i]=1}
    if(!open)continue;const rs=B&&reso(B);
    const key=(id||'')+'|'+rs+'|'+(B&&usable(B));
    if(hc['k'+i]!==key){hc['k'+i]=key;const g=el.querySelector('canvas').getContext('2d');g.clearRect(0,0,120,120);
      el.classList.toggle('empty',!B);el.querySelector('.pl').hidden=!!B;el.classList.toggle('reso',!!rs);
      if(B){el.style.setProperty('--rc',EL[B.el].c);drawBookIcon(g,B,120);el.setAttribute('aria-label',`${B.n} (Bí Tịch ô ${i+1})${rs?', cộng hưởng vũ khí':''}`);el.title=B.n+(rs?' · Cộng hưởng vũ khí +25%':'')}
      else{el.style.removeProperty('--rc');el.setAttribute('aria-label','Ô Bí Tịch '+(i+1)+' trống: chạm để trang bị');el.title='Ô Bí Tịch trống'}}
    const cd=p.skCd[3+i]||0,mx=B?bookCd(B,s.own[id].lv):1;const stt=!B?'e':!usable(B)?'lock':cd>0?'cd':p.mp<B.mp?'mp':'ok';
    const a=cd>0?Math.round(cd/mx*360):0;if(hc['a'+i]!==a){hc['a'+i]=a;el.querySelector('.cd').style.setProperty('--a',a+'deg')}
    const txt=stt==='cd'?(cd<1?cd.toFixed(1):Math.ceil(cd)):'';if(hc['t'+i]!==txt+stt){hc['t'+i]=txt+stt;el.querySelector('.cdt').textContent=txt;el.classList.toggle('nomp',stt==='mp');el.classList.toggle('lock',stt==='lock')}}}
/* biểu tượng canvas cho nút HUD (khung 48) */
function drawBookIcon(g,B,size){const E=EL[B.el],s=size/48;g.save();g.scale(s,s);
  const gr=g.createRadialGradient(24,20,2,24,24,26);gr.addColorStop(0,shade(E.d,0.25));gr.addColorStop(1,'#120b07');g.fillStyle=gr;g.fillRect(0,0,48,48);
  g.translate(24,24);g.strokeStyle=E.l;g.fillStyle=E.l;g.lineWidth=3;g.lineCap='round';g.lineJoin='round';const P=()=>g.beginPath();
  g.save();g.globalAlpha=0.22;g.scale(1.7,1.7);g.translate(-12,-12);g.fillStyle=E.c;g.fill(new Path2D(GLY[B.el]));g.restore();
  switch(B.ic){
    case'bolt':P();g.moveTo(4,-16);g.lineTo(-6,0);g.lineTo(3,0);g.lineTo(-5,16);g.lineTo(9,-3);g.lineTo(0,-3);g.lineTo(8,-16);g.closePath();g.fill();break;
    case'bell':P();g.moveTo(-3,-14);g.quadraticCurveTo(-11,-12,-11,0);g.lineTo(-14,10);g.lineTo(14,10);g.lineTo(11,0);g.quadraticCurveTo(11,-12,3,-14);g.closePath();g.stroke();P();g.arc(0,13,3,0,TAU);g.fill();break;
    case'arrows':for(let k=-1;k<=1;k++){P();g.moveTo(k*9,-15);g.lineTo(k*9-4,12);g.stroke();P();g.moveTo(k*9-8,7);g.lineTo(k*9-4,14);g.lineTo(k*9+1,8);g.stroke()}break;
    case'blades':for(let k=0;k<6;k++){g.save();g.rotate(k/6*TAU);P();g.moveTo(0,-6);g.lineTo(0,-17);g.stroke();g.restore()}P();g.arc(0,0,4,0,TAU);g.stroke();break;
    case'sprout':P();g.moveTo(0,15);g.lineTo(0,-4);g.stroke();P();g.moveTo(0,-2);g.quadraticCurveTo(-14,-4,-12,-15);g.quadraticCurveTo(-2,-12,0,-2);g.fill();P();g.moveTo(0,4);g.quadraticCurveTo(14,2,13,-9);g.quadraticCurveTo(2,-7,0,4);g.fill();break;
    case'wind':for(let k=0;k<3;k++){P();g.arc(-4+k*3,-8+k*8,9-k,-1.2,1.4);g.stroke()}break;
    case'vine':P();g.moveTo(-14,14);g.bezierCurveTo(-14,-2,10,4,6,-8);g.bezierCurveTo(3,-16,-8,-14,-6,-8);g.stroke();P();g.moveTo(4,8);g.quadraticCurveTo(14,6,14,-2);g.stroke();break;
    case'dragon':P();g.moveTo(-16,8);g.bezierCurveTo(-8,-6,0,14,8,0);g.quadraticCurveTo(12,-8,16,-6);g.stroke();P();g.moveTo(10,-4);g.lineTo(6,-14);g.moveTo(14,-6);g.lineTo(14,-15);g.stroke();break;
    case'flake':for(let k=0;k<6;k++){g.save();g.rotate(k/6*TAU);P();g.moveTo(0,0);g.lineTo(0,-16);g.moveTo(0,-9);g.lineTo(-5,-13);g.moveTo(0,-9);g.lineTo(5,-13);g.stroke();g.restore()}break;
    case'wave':P();g.moveTo(-17,8);g.quadraticCurveTo(-10,-14,2,-6);g.quadraticCurveTo(-6,-4,-4,4);g.quadraticCurveTo(4,-4,17,4);g.stroke();P();g.moveTo(-17,15);g.quadraticCurveTo(0,8,17,13);g.stroke();break;
    case'tiger':P();g.ellipse(0,2,12,11,0,0,TAU);g.stroke();P();g.moveTo(-9,-6);g.lineTo(-11,-15);g.lineTo(-3,-9);g.moveTo(9,-6);g.lineTo(11,-15);g.lineTo(3,-9);g.stroke();P();g.moveTo(-5,8);g.lineTo(0,5);g.lineTo(5,8);g.stroke();P();g.arc(-4,0,1.5,0,TAU);g.arc(4,0,1.5,0,TAU);g.fill();break;
    case'rocket':g.rotate(-0.7);P();g.rect(-12,-4,20,8);g.stroke();P();g.moveTo(8,-5);g.lineTo(16,0);g.lineTo(8,5);g.fill();P();g.moveTo(-12,0);g.lineTo(-18,-4);g.moveTo(-12,0);g.lineTo(-19,3);g.stroke();break;
    case'fire':P();g.moveTo(0,16);g.bezierCurveTo(-14,12,-12,-4,-3,-10);g.bezierCurveTo(-3,-4,3,-6,1,-17);g.bezierCurveTo(13,-6,15,10,0,16);g.fill();break;
    case'fist':P();g.roundRect(-11,-9,22,16,5);g.stroke();P();g.moveTo(-4,-9);g.lineTo(-4,-2);g.moveTo(3,-9);g.lineTo(3,-2);g.stroke();P();g.moveTo(-14,13);g.lineTo(14,13);g.stroke();break;
    case'pillar':P();g.moveTo(-6,-16);g.lineTo(6,-16);g.lineTo(5,8);g.lineTo(0,15);g.lineTo(-5,8);g.closePath();g.stroke();P();g.moveTo(-14,-10);g.lineTo(-10,-4);g.moveTo(14,-10);g.lineTo(10,-4);g.stroke();break;
    case'spiral':P();for(let a=0;a<4.2*Math.PI;a+=0.25){const r=2+a*1.1;g.lineTo(Math.cos(a)*r,Math.sin(a)*r)}g.stroke();break;
    case'heaven':P();g.moveTo(-14,-12);g.quadraticCurveTo(0,-20,14,-12);g.stroke();P();g.moveTo(2,-12);g.lineTo(-6,2);g.lineTo(2,2);g.lineTo(-4,16);g.stroke();break;
    case'blood':P();g.moveTo(0,-16);g.bezierCurveTo(10,-2,12,6,0,14);g.bezierCurveTo(-12,6,-10,-2,0,-16);g.fillStyle='#ff3a5a';g.fill();g.stroke();break;
    case'banner':P();g.moveTo(-10,16);g.lineTo(-10,-16);g.stroke();P();g.moveTo(-10,-15);g.lineTo(14,-11);g.lineTo(8,-4);g.lineTo(14,3);g.lineTo(-10,0);g.closePath();g.fill();break;
    case'shadow':P();g.arc(0,-6,7,0,TAU);g.stroke();P();g.moveTo(-12,16);g.quadraticCurveTo(-8,0,0,2);g.quadraticCurveTo(8,0,12,16);g.stroke();P();g.moveTo(-17,6);g.lineTo(-11,4);g.moveTo(17,6);g.lineTo(11,4);g.stroke();break;
    case'seal':P();g.roundRect(-13,-13,26,26,3);g.stroke();P();g.moveTo(-6,-6);g.lineTo(6,-6);g.moveTo(0,-6);g.lineTo(0,7);g.moveTo(-6,7);g.lineTo(6,7);g.stroke();break;
    case'vortex':for(let k=0;k<3;k++){P();g.arc(0,0,5+k*5,k*2,k*2+3.8);g.stroke()}break;
    case'shieldp':P();g.moveTo(0,-15);g.lineTo(12,-9);g.quadraticCurveTo(12,8,0,16);g.quadraticCurveTo(-12,8,-12,-9);g.closePath();g.stroke();break;
    case'moon':P();g.arc(0,0,13,0.6,TAU-0.6);g.arc(6,0,10,TAU-0.9,0.9,true);g.closePath();g.fill();break;
    case'sun':P();g.arc(0,0,7,0,TAU);g.fill();for(let k=0;k<8;k++){g.save();g.rotate(k/8*TAU);P();g.moveTo(0,-10);g.lineTo(0,-16);g.stroke();g.restore()}break;
    case'mountain':P();g.moveTo(-16,13);g.lineTo(-5,-10);g.lineTo(1,-1);g.lineTo(6,-7);g.lineTo(16,13);g.closePath();g.stroke();break;
  }
  g.restore()}

/* ================= SVG bìa sách cho bảng ================= */
function coverSvg(B,dim){const E=EL[B.el],rc=RARITY[B.rar].color;const f=dim?'#2a2420':E.d,c=dim?'#6a6056':E.c;
  return`<svg viewBox="0 0 40 48" aria-hidden="true"><rect x="7" y="6" width="30" height="40" rx="3" fill="rgba(0,0,0,.35)"/><rect x="5" y="3" width="30" height="40" rx="3" fill="${f}" stroke="${dim?'#5a5048':rc}" stroke-width="2.2"/>
  <rect x="6" y="4" width="5" height="38" fill="rgba(0,0,0,.35)"/><path d="M6 10h5M6 18h5M6 26h5M6 34h5" stroke="${dim?'#5a5048':rc}" stroke-width="1"/>
  <g transform="translate(12 7) scale(.82)"><path d="${GLY[B.el]}" fill="${c}"/></g>${B.side?`<circle cx="30" cy="9" r="3.4" fill="${SIDE[B.side].c}" stroke="#1d1410" stroke-width="1"/>`:''}
  <rect x="15" y="32" width="15" height="6" rx="1" fill="${dim?'#6a6056':'#f0e2bc'}"/>${B.t==='p'?`<path d="M17 35h11" stroke="${E.d}" stroke-width="1.3"/>`:''}</svg>`}
function elSvg(el,sz){const E=EL[el];return`<svg class="btEl" viewBox="0 0 24 24" width="${sz||16}" height="${sz||16}" style="width:${sz||16}px;height:${sz||16}px;vertical-align:-3px;flex:none" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="${E.d}" stroke="${E.c}" stroke-width="1.6"/><path d="${GLY[el]}" fill="${E.c}"/></svg>`}

/* ================= NHẬN SÁCH ================= */
function giveBook(id,why,from){const s=st(),B=BY[id];if(!s||!B)return null;let r;
  if(s.own[id]){const n=dupPages(B);s.own[id].pg+=n;r={id,dup:1,n};UI.loot(`+${n} Trang ${B.n}`,EL[B.el].c)}
  else{s.own[id]={lv:1,pg:0};s.nw[id]=1;r={id,dup:0};UI.toast(`${why?why+': ':''}lĩnh hội Bí Tịch ${B.n}`,'skill');try{Audio_.play('loot',Math.min(4,B.rar+1))}catch(e){}autoEquip(id)}
  if(from&&G.p)BTS.ents.push({k:'fly',x:from.x,y:from.y,el:B.el,rar:B.rar,t:1,T:0.9,p:0});
  G.dirty.stats=1;HUB.refresh&&HUB.refresh();return r}
function givePages(n,from){const s=st();if(!s||!n)return;s.wp+=n;UI.loot(`+${n} Tàn Trang Bí Tịch`,'#efe4cc');if(from&&G.p)BTS.ents.push({k:'fly',x:from.x,y:from.y,el:'tho',page:1,t:1,T:0.8,p:0})}
function autoEquip(id){const s=st(),B=BY[id];if(!usable(B))return;
  if(B.t==='a'){for(let i=0;i<2;i++)if(slotOpen(i)&&!s.eq[i]&&!s.eq.includes(id)){s.eq[i]=id;UI.toast(`Đã đặt ${B.n} vào ô Bí Tịch ${i+1} (phím ${SLOT_KEY[i]})`,'skill');return}}
  else{for(let i=0;i<2;i++)if(pslotOpen(i)&&!s.ps[i]&&!s.ps.includes(id)){s.ps[i]=id;recalc();return}}}
/* bốc sách: thiên về bậc thấp; bonus nâng bậc. Sách cao hơn Cảnh Giới hiện tại tối đa một bậc */
function rollBook(bonus){const s=st(),r=rIdx();bonus=bonus||0;
  const w={1:50,2:32,3:13+bonus*6,4:3+bonus*4};if(bonus>=2)w[1]=25;
  const pool=BOOKS.filter(B=>B.rq<=r+1&&(!B.side||B.side===s.phe));let tot=0;const ws=pool.map(B=>{const v=(w[B.rar]||10)*(B.side?0.5:1)*(s.own[B.id]?0.7:1);tot+=v;return v});
  let x=Math.random()*tot;for(let i=0;i<pool.length;i++){x-=ws[i];if(x<=0)return pool[i].id}return pool[0].id}
BT.give=giveBook;BT.roll=rollBook;
const STARTER={kiem:'loidinh',cung:'phongquyen',giao:'thuylong',dao:'hoaho',con:'phason',phap:'loidinh'};

/* ================= CẤP SÁCH ================= */
function upCost(id){const s=st(),B=BY[id],o=s.own[id];if(!o||o.lv>=MAXLV)return null;return{pg:PG_COST[o.lv],gold:goldCost(B,o.lv)}}
function canUp(id){const c=upCost(id),s=st();if(!c)return false;const o=s.own[id];return o.pg+s.wp>=c.pg&&G.save.gold>=c.gold}
function lvUp(id){const s=st(),B=BY[id],o=s.own[id],c=upCost(id);if(!c)return'Đã đạt cấp tối đa';
  if(o.pg+s.wp<c.pg)return`Thiếu Trang Bí Tịch (cần ${c.pg})`;if(G.save.gold<c.gold)return`Thiếu vàng (cần ${fmt(c.gold)})`;
  const a=Math.min(o.pg,c.pg);o.pg-=a;s.wp-=c.pg-a;G.save.gold-=c.gold;o.lv++;recalc();saveGame();
  const p=G.p;if(p){G.fx.push({k:'pillar',x:p.x,y:p.y,w:26,h:220,col:EL[B.el].c,life:0.8,max:0.8});puff(p.x,p.y-30,B.el,16,180)}Audio_.play('level');return null}
BT.lvUp=lvUp;BT.upCost=upCost;

/* ================= CHỈ SỐ: Tâm Pháp, đạo, bùa ================= */
HK.on('stats',st_=>{const s=G.save&&G.save.bikip;if(!s||!s.own)return;
  for(const id of (s.ps||[])){const B=id&&BY[id];if(!B||B.t!=='p'||!s.own[id]||B.rq>rIdx())continue;const v=B.pv(s.own[id].lv);
    if(v.def)st_.def*=1+v.def/100;if(v.hpp)st_.hpp+=v.hpp;if(v.mpp)st_.mp*=1+v.mpp/100;if(v.crit)st_.crit+=v.crit;if(v.cdmg)st_.cdmg+=v.cdmg}
  if(s.phe==='chinh'){st_.def*=1.15;st_.hpp+=10}else if(s.phe==='ta'){st_.ls+=3;st_.crit+=5}
  const b=BTS.buf;if(b.haokhi>0){st_.atk*=1.2;st_.def*=1.2}if(b.maanh>0){st_.crit+=15;st_.cdmg+=30}if(b.coloa>0)st_.def*=1.25});
function passiveV(k){const s=st();let v=0;for(const id of s.ps){const B=id&&BY[id];if(!B||B.rq>rIdx())continue;const o=B.pv(s.own[id].lv);if(o[k])v+=o[k]}return v}
HK.on('dmgIn',(d,src)=>{const s=G.save&&G.save.bikip;if(!s||!G.p)return;const dr=passiveV('dr');if(dr)d*=1-dr/100;
  const sh=BTS.sh;if(sh&&sh.amt>0&&d>0){const a=Math.min(sh.amt,d);sh.amt-=a;d-=a;if(G.t-(BTS.shT||0)>0.4){BTS.shT=G.t;addFloat(G.p.x,G.p.y-80,'Hộ Thể',EL[sh.el].l,13)}
    if(sh.amt<=0){G.fx.push({k:'ring',x:G.p.x,y:G.p.y,r:20,r2:90,life:0.35,max:0.35,col:EL[sh.el].c});Audio_.play('clang');BTS.sh=null}
    if(d<=0)return 0.0001}
  return d});

/* ================= VÒNG LẶP ================= */
let regT=0,pkT=0;
HK.on('tick',dt=>{const S=G.save,p=G.p;if(!S||!p)return;const s=st();ensureCd(p);
  if(G.W!==BTS.W){BTS.W=G.W;BTS.ents.length=0;BTS.st.clear()}
  for(let i=3;i<5;i++)p.skCd[i]=Math.max(0,(p.skCd[i]||0)-dt);
  updEnts(dt);updStatus(dt);
  if(!window.PERKS)for(const e of BTS.st)if(e.slow>0)e.slow-=dt;
  // khiên, hồi máu, bùa
  if(BTS.sh){BTS.sh.t-=dt;if(BTS.sh.t<=0)BTS.sh=null}
  if(BTS.hot){const h=BTS.hot;h.t-=dt;h.acc+=dt;if(h.acc>=0.5){h.acc-=0.5;heal(h.per*0.5);if(Math.random()<0.8)addPart(p.x+rand(-18,18),p.y-rand(0,30),0,rand(-90,-40),0.7,'#9ff07a',3,-20,'c',1)}if(h.t<=0)BTS.hot=null}
  let rc=false;for(const k in BTS.buf){if(BTS.buf[k]>0){BTS.buf[k]-=dt;if(BTS.buf[k]<=0){BTS.buf[k]=0;rc=true}}}if(rc)recalc();
  regT+=dt;if(regT>=1){regT=0;const rg=passiveV('reg');if(rg&&p.hp>0&&p.hp<p.maxhp&&G.state==='play')p.hp=Math.min(p.maxhp,p.hp+p.maxhp*rg/100)}
  // sách khởi đầu cho lưu cũ đã qua chương 1
  if(BTS.retro&&G.state==='play'){BTS.retro=0;if(!s.first){s.first=1;giveBook(STARTER[S.cls]||'loidinh','Tàng Kinh Các gửi tặng');saveGame()}}
  // mốc Vượt Tháp: mỗi 5 tầng một cuốn, mỗi 10 tầng bậc cao hơn
  pkT+=dt;if(pkT>1){pkT=0;const tw=S.tower;if(tw&&tw.best>=(s.tw+1)*5){s.tw++;const n=s.tw*5;giveBook(rollBook(n%10===0?2:1),'Vượt Tháp tầng '+n);saveGame()}
    if(G.state==='play')daoCheck()}
  autoCast(dt)});
function autoCast(dt){const S=G.save,p=G.p;if(!S.set.auto||!G.autoAtk||G.state!=='play')return;BTS.autoT-=dt;if(BTS.autoT>0)return;BTS.autoT=0.25;
  const t=G.lastTarget;if(!t||t.dead||dist(p.x,p.y,t.x,t.y)>420)return;const s=st();const near=enemiesIn(p.x,p.y,170).length;
  for(let i=0;i<2;i++){if(!canCastBook(i))continue;const B=BY[s.eq[i]];
    if(B.id==='hoixuan'&&p.hp>p.maxhp*0.6)continue;if((B.id==='kimchung'||B.id==='coloa')&&p.hp>p.maxhp*0.75&&near<3&&!t.boss)continue;
    if(!t.boss&&!t.elite&&near<2&&B.cd>7)continue;
    if(castBook(i,true))break}}
BT.autoCast=autoCast;

/* ================= NGUỒN SÁCH: boss, tinh anh ================= */
HK.on('kill',e=>{const S=G.save,s=st();if(!S||!s||!e)return;const inTw=!!(e.tw||(window.VT&&VT.on));
  if(e.elite&&!e.boss&&Math.random()<0.3)givePages(e.lv>=60?2:1,e);
  if(!e.boss||inTw)return;
  givePages(randi(3,5),e);
  let id=null;if(!s.first){s.first=1;id=STARTER[S.cls]||'loidinh'}
  else if(s.pity>=2||Math.random()<0.5){s.pity=0;id=rollBook(S.map>=6?1:0)}else s.pity++;
  if(id){const r=giveBook(id,'Hạ '+e.def.name,e);BTS.lastBoss={id,dup:r&&r.dup,n:r&&r.n,t:G.t}}saveGame()});

/* ================= NGỘ ĐẠO: CHÍNH / TÀ ================= */
function daoOk(){const S=G.save;return S.lvl>=30||(S.cleared||[]).includes(3)}
function daoCost(){const S=G.save;return 20000+1500*S.lvl}
function daoCheck(){const s=st(),p=G.p;if(window.__DVHK_NODAO)return;if(s.phe||s.offer||!daoOk())return;if(!p.inCamp||UI.panel||G.paused)return;
  if(!$q('#story').hidden||!$q('#clear').hidden||!$q('#dead').hidden)return;s.offer=1;saveGame();showDao()}
function daoDom(){let d=$q('#btDao');if(d)return d;css();d=document.createElement('section');d.id='btDao';d.className='screen';d.hidden=true;d.innerHTML='<div class="paper" role="dialog" aria-modal="true" aria-labelledby="btDaoH"></div>';
  const ref=$q('#confirm');if(ref&&ref.parentNode)ref.parentNode.insertBefore(d,ref);else document.body.appendChild(d);return d}
function showDao(){const d=daoDom(),s=st(),S=G.save;G.paused=true;if(UI.panel){UI.panel=null;$q('#panel').hidden=true}
  const re=!!s.phe,cost=daoCost();
  d.querySelector('.paper').innerHTML=`<div class="stamp">Ngộ<br>Đạo</div><div class="era">ẨN SĨ CHU VĂN AN · NÚI PHƯỢNG HOÀNG</div><h3 id="btDaoH">${re?'Đổi Đạo?':'Chính hay Tà?'}</h3>
   <div class="who"><canvas width="168" height="200"></canvas><p style="margin:0">${re?`Ngươi đang theo <b>${SIDE[s.phe].n}</b>. Bỏ đạo cũ phải tán đi nội công đã luyện: tốn <b>${fmt(cost)} vàng</b>. Sách của đạo cũ vẫn giữ nhưng không dùng được.`
     :`"Võ công của ngươi đã đến lúc phải chọn đường. Chính khí giữ nước như Hưng Đạo Vương, hay tà công đổi máu lấy sức mạnh? Một khi đã chọn, quay đầu rất đắt."`}</p></div>
   <div class="ch">
    <button data-dao="chinh" style="--pc:${SIDE.chinh.c};--pd:${SIDE.chinh.d}" ${s.phe==='chinh'?'disabled':''}><b>Chính Đạo</b>${SIDE_PASS.chinh}. Mở sách Thiên Lôi Chính Khí, Hào Khí Đông A, Nam Quốc Sơn Hà.</button>
    <button data-dao="ta" style="--pc:${SIDE.ta.c};--pd:${SIDE.ta.d}" ${s.phe==='ta'?'disabled':''}><b>Tà Đạo</b>${SIDE_PASS.ta}. Mở sách Huyết Ma Phệ Hồn, Ma Ảnh Truy Hồn, Âm Phong Liệt Hồn.</button>
   </div><div class="row"><button class="btn sec" id="btDaoNo">${re?'Giữ đạo cũ':'Để sau'}</button></div>`;
  d.hidden=false;const cv_=d.querySelector('canvas'),g=cv_.getContext('2d');g.save();g.translate(84,196);g.scale(2.3,2.3);try{drawHuman(g,{x:0,y:0,f:1,look:LOOKS.thuthu||LOOKS.elder,t:G.t,atk:-1,walk:0,moving:false})}catch(e){}g.restore();
  d.querySelectorAll('[data-dao]').forEach(b=>b.onclick=()=>{const k=b.dataset.dao;if(re){if(G.save.gold<cost){UI.toast(`Thiếu vàng: cần ${fmt(cost)}`,'warn');return}UI.confirm(`Đổi sang ${SIDE[k].n} với giá ${fmt(cost)} vàng?`,()=>{G.save.gold-=cost;choose(k);hideDao()})}else{choose(k);hideDao()}});
  $q('#btDaoNo').onclick=()=>{hideDao()};
  if(window.gsap&&!REDUCED)gsap.fromTo(d.querySelector('.paper'),{y:30,autoAlpha:0},{y:0,autoAlpha:1,duration:.5,ease:'power3.out'});
  setTimeout(()=>{const b=d.querySelector('[data-dao]:not([disabled])');b&&b.focus({preventScroll:true})},60)}
function hideDao(){const d=$q('#btDao');if(d)d.hidden=true;if(!UI.panel)G.paused=false}
function choose(k){const s=st(),p=G.p;if(k!=='chinh'&&k!=='ta')return false;s.phe=k;s.pheN=(s.pheN||0)+1;s.offer=1;
  for(let i=0;i<2;i++){const B=s.eq[i]&&BY[s.eq[i]];if(B&&B.side&&B.side!==k)s.eq[i]=null}
  const first=k==='chinh'?'thienloi':'huyetma';if(!s.own[first])giveBook(first,SIDE[k].n);
  recalc();saveGame();Audio_.play('win');UI.toast(`Đã nhập ${SIDE[k].n}: ${SIDE_PASS[k]}`,'quest');
  if(p){G.fx.push({k:'pillar',x:p.x,y:p.y,w:46,h:420,col:k==='chinh'?'#ffe7a0':'#ff3a5a',life:1.3,max:1.3},{k:'ring',x:p.x,y:p.y,r:10,r2:200,life:0.7,max:0.7,col:SIDE[k].c});ringFx(k==='chinh'?'kim':'hoa',p.x,p.y,200,1.6,{follow:1,ta:k==='ta'})}
  try{HK.ev('phe',k)}catch(e){}HUB.refresh&&HUB.refresh();return true}
BT.phe=()=>{const s=G.save&&G.save.bikip;return s&&(s.phe==='chinh'||s.phe==='ta')?s.phe:null};
BT.choose=choose;BT.showDao=showDao;

/* ================= THƯ QUÁN ================= */
const PRICE=[0,1200,3200,8000,20000];
function price(B){return Math.round(PRICE[B.rar]*(1+G.save.lvl/25)/50)*50}
function wpPrice(){return Math.round(250*(1+G.save.lvl/25)/10)*10}
function shop(){const s=st(),d=dayKey();const sh=s.shop;if(sh.day!==d||!sh.ids.length){sh.day=d;sh.sold=[];sh.wp=0;sh.rr=0;sh.ids=stock()}return sh}
function stock(){const s=st(),r=rIdx();const pool=BOOKS.filter(B=>B.rq<=r+1&&(!B.side||B.side===s.phe));const ids=[];
  for(let k=0;k<30&&ids.length<4;k++){const B=pick(pool);if(B.rar===4&&Math.random()<0.6)continue;if(!ids.includes(B.id))ids.push(B.id)}return ids}
function buy(id){const sh=shop(),B=BY[id];if(!G.p.inCamp)return'Hãy đến Thư Quán trong thành để mua';if(sh.sold.includes(id))return'Đã bán hết';const c=price(B);if(G.save.gold<c)return`Thiếu vàng (cần ${fmt(c)})`;
  G.save.gold-=c;sh.sold.push(id);giveBook(id,'Thư Quán');saveGame();Audio_.play('coin');return null}
function buyWp(){const sh=shop(),c=wpPrice();if(!G.p.inCamp)return'Hãy đến Thư Quán trong thành để mua';if(sh.wp>=5)return'Hôm nay đã hết Tàn Trang';if(G.save.gold<c)return`Thiếu vàng (cần ${fmt(c)})`;G.save.gold-=c;sh.wp++;st().wp++;saveGame();Audio_.play('coin');return null}
function reroll(){const sh=shop(),c=500*(sh.rr+1);if(!G.p.inCamp)return'Hãy đến Thư Quán trong thành';if(G.save.gold<c)return`Thiếu vàng (cần ${fmt(c)})`;G.save.gold-=c;sh.rr++;sh.ids=stock();sh.sold=[];saveGame();Audio_.play('ui');return null}
BT.shop=shop;BT.buy=buy;

/* ================= BẢNG "BÍ TỊCH" TRONG VÕ ĐẠO ================= */
function hasDot(){const S=G.save,s=S&&S.bikip;if(!s||!s.own)return false;
  if(Object.keys(s.nw||{}).length)return true;
  for(let i=0;i<2;i++)if(slotOpen(i)&&!s.eq[i]&&Object.keys(s.own).some(id=>BY[id].t==='a'&&usable(BY[id])&&!s.eq.includes(id)))return true;
  for(let i=0;i<2;i++)if(pslotOpen(i)&&!s.ps[i]&&Object.keys(s.own).some(id=>BY[id].t==='p'&&usable(BY[id])&&!s.ps.includes(id)))return true;
  if(!s.phe&&daoOk())return true;return false}
function slotHtml(kind,i){const s=st(),ids=kind==='a'?s.eq:s.ps,open=kind==='a'?slotOpen(i):pslotOpen(i),id=ids[i],B=id&&BY[id];
  const lab=kind==='a'?`Ô ${i+1}`:`Tâm Pháp ${i+1}`,key=kind==='a'?`<span class="k">${FINE?'Phím '+SLOT_KEY[i]:'Nút HUD'}</span>`:'';
  const tgt=BTS.sel&&BY[BTS.sel]&&BY[BTS.sel].t===kind&&open&&s.own[BTS.sel]&&usable(BY[BTS.sel]);
  if(!open)return`<button class="btSlot lock" data-slot="${kind}${i}" title="${esc(kind==='a'?slotLock(i):pslotLock(i))}" aria-label="${lab}: ${esc(kind==='a'?slotLock(i):pslotLock(i))}"><svg viewBox="0 0 40 48"><rect x="8" y="6" width="24" height="34" rx="3" fill="none" stroke="#6a6056" stroke-width="2" stroke-dasharray="4 3"/><path d="M15 22v-3a5 5 0 0110 0v3M14 22h12v9H14z" fill="none" stroke="#8a7a66" stroke-width="2"/></svg><b>${lab}</b><span>${esc(kind==='a'?slotLock(i):pslotLock(i))}</span></button>`;
  if(!B)return`<button class="btSlot${tgt?' tgt':''}" data-slot="${kind}${i}" aria-label="${lab} trống"><svg viewBox="0 0 40 48"><rect x="8" y="6" width="24" height="34" rx="3" fill="none" stroke="#bba98a" stroke-width="2" stroke-dasharray="4 3"/><path d="M20 16v14M13 23h14" stroke="#ffd98a" stroke-width="2.4"/></svg><b>${lab}</b><span>Trống</span>${key}</button>`;
  return`<button class="btSlot on${tgt?' tgt':''}" data-slot="${kind}${i}" style="--rc:${EL[B.el].c}" title="${esc(B.n)}" aria-label="${lab}: ${esc(B.n)}">${coverSvg(B,!usable(B))}<b>${esc(B.n)}</b><span>Cấp ${s.own[id].lv}${reso(B)?' · Cộng hưởng':''}</span>${key}</button>`}
function cellHtml(B){const s=st(),o=s.own[B.id],E=EL[B.el],eq=s.eq.includes(B.id)||s.ps.includes(B.id);
  const tip=o?`${B.n} · cấp ${o.lv} · ${RARITY[B.rar].name}`:`${B.n} · chưa có · ${RARITY[B.rar].name}`;
  return`<button class="btCell${o?'':' no'}${o&&!usable(B)?' cant':''}" data-bk="${B.id}" style="--rc:${o?RARITY[B.rar].color:'#555'};--ec:${E.c}" aria-pressed="${BTS.sel===B.id}" title="${esc(tip)}" aria-label="${esc(tip)}">
    ${coverSvg(B,!o)}<span class="nm">${esc(B.n)}</span>${o?`<span class="lv">${o.lv}</span>`:''}${eq?'<span class="eqm">Dùng</span>':''}${s.nw[B.id]?'<span class="nw"></span>':''}${o&&canUp(B.id)?'<span class="up">▲</span>':''}</button>`}
function detHtml(){const id=BTS.sel,B=BY[id];if(!B)return'';const s=st(),o=s.own[id],E=EL[B.el],R=RARITY[B.rar],L=o?o.lv:1,why=whyNot(B);
  const tags=[];if(o)tags.push(`<span>Cấp ${L}/${MAXLV}</span>`);
  if(B.t==='a'){tags.push(`<span>${B.m?Math.round(B.m*lvMult(L)*100)+'% công mỗi đòn':'Hỗ trợ'}</span>`,`<span>${B.mp} nội lực</span>`,`<span>Hồi ${bookCd(B,L).toFixed(1).replace('.',',')} giây</span>`)}
  else tags.push(`<span class="g">${pvTxt(B,L)}</span>`);
  if(reso(B))tags.push('<span class="g">Cộng hưởng vũ khí +25%</span>');else tags.push(`<span title="Vũ khí cùng hệ ${E.n} cho +25% sát thương">Vũ khí hệ ${E.n}: +25%</span>`);
  if(B.t==='a')tags.push(`<span title="Đánh quái hệ ${EL[KH[B.el]].n} được +15% sát thương">Khắc ${EL[KH[B.el]].n} +15%</span>`);
  if(why)tags.push(`<span class="w">${esc(why)}</span>`);
  let btns='';
  if(o&&!why){if(B.t==='a'){for(let i=0;i<2;i++)btns+=`<button class="btn sm${s.eq[i]===id?' sec':''}" data-eq="a${i}" ${slotOpen(i)?'':'disabled'} title="${slotOpen(i)?'Đặt vào ô '+(i+1):esc(slotLock(i))}">${s.eq[i]===id?'Gỡ khỏi':'Đặt vào'} ô ${i+1}${FINE?' ('+SLOT_KEY[i]+')':''}</button>`}
    else for(let i=0;i<2;i++)btns+=`<button class="btn sm${s.ps[i]===id?' sec':''}" data-eq="p${i}" ${pslotOpen(i)?'':'disabled'} title="${pslotOpen(i)?'Đặt vào Tâm Pháp '+(i+1):esc(pslotLock(i))}">${s.ps[i]===id?'Gỡ khỏi':'Đặt vào'} Tâm Pháp ${i+1}</button>`}
  if(o){const c=upCost(id);if(c){const ok=canUp(id);btns+=`<button class="btn sm gold" data-up="${id}" ${ok?'':'disabled'} title="Dùng trang riêng của sách trước, thiếu thì lấy Tàn Trang">Nâng cấp ${L+1}: ${c.pg} trang · ${fmt(c.gold)} vàng</button>`}else btns+='<span class="meta">Đã đạt cấp tối đa</span>'}
  const src=B.side?`Chỉ ${SIDE[B.side].n}. Rơi từ boss, Vượt Tháp hoặc Thư Quán sau khi Ngộ Đạo.`:'Rơi từ boss chương, mốc Vượt Tháp (mỗi 5 tầng), hoặc mua ở Thư Quán.';
  return`<div class="detail btDet"><div class="ihead"><span class="btBig" style="--rc:${R.color};--ec:${E.c}">${coverSvg(B,!o)}</span><div><div class="nm" style="color:${R.color}">${esc(B.n)}</div>
    <div class="meta">${elSvg(B.el,13)} Hệ ${E.n} · ${R.name} · ${B.t==='a'?'Chủ động':'Tâm Pháp (bị động)'} · cần ${esc(realmName(B.rq))}${B.side?' · '+SIDE[B.side].n:''}</div>
    ${o?`<div class="meta">Trang riêng: <b style="color:var(--ink)">${o.pg}</b> · Tàn Trang: <b style="color:var(--ink)">${s.wp}</b></div>`:''}</div></div>
    <p>${esc(B.t==='p'?B.d+' '+pvTxt(B,L)+'.':B.d)}</p><div class="tags">${tags.join('')}</div>${o?'':`<p class="meta">${src}</p>`}<div class="row">${btns}</div></div>`}
function libHtml(){const s=st(),S=G.save;const n=Object.keys(s.own).length;
  let h=`<div class="sec"><h4>Ô VÕ CÔNG</h4><div class="btSlots">${slotHtml('a',0)}${slotHtml('a',1)}${slotHtml('p',0)}${slotHtml('p',1)}</div>
    <div class="btRes"><span>Tàn Trang: <b>${s.wp}</b></span><span>Vàng: <b>${fmt(S.gold)}</b></span><span>Đạo: <b style="color:${s.phe?SIDE[s.phe].c:'var(--dim)'}">${s.phe?SIDE[s.phe].n:'chưa chọn'}</b></span>${weaponEl()?`<span>Vũ khí hệ <b style="color:${EL[weaponEl()].c}">${EL[weaponEl()].n}</b></span>`:''}</div>
    <p class="hist" style="color:var(--dim);margin-top:8px">Bí Tịch là võ học ngoài môn phái: phái nào cũng luyện được. Chọn sách rồi chạm ô để đặt. Sách trùng hóa thành trang để nâng cấp.</p></div>
    <div class="sec"><h4>TÀNG THƯ · ${n}/${BOOKS.length} CUỐN</h4>`;
  for(const el of EL_ORD){const L=BOOKS.filter(B=>B.el===el&&!B.side);h+=`<div class="btGh" style="color:${EL[el].c}">${elSvg(el,18)} Hệ ${EL[el].n} <small>khắc ${EL[KH[el]].n}</small></div><div class="btGrid">${L.map(cellHtml).join('')}</div>`}
  h+=`<div class="btGh" style="color:${SIDE.chinh.c}">☯ Chính · Tà <small>${s.phe?'đang theo '+SIDE[s.phe].n:'Ngộ Đạo để mở'}</small></div><div class="btGrid">${BOOKS.filter(B=>B.side).map(cellHtml).join('')}</div></div>`;
  return h+detHtml()}
function shopHtml(){const sh=shop(),inC=G.p&&G.p.inCamp;
  let h=`<div class="sec"><h4>THƯ QUÁN TÀNG KINH CÁC</h4><p class="hist" style="color:var(--dim)">${inC?'Thủ Thư mở hàng mỗi ngày. Sách đã có sẽ hóa thành trang.':'Đến <b>Thủ Thư</b> cạnh Từ Đường trong thành để mua. Hàng đổi mỗi ngày.'}</p></div><div class="btShop">`;
  for(const id of sh.ids){const B=BY[id],sold=sh.sold.includes(id),own=st().own[id],c=price(B);
    h+=`<div class="btSc${sold?' sold':''}" style="--rc:${RARITY[B.rar].color}">${coverSvg(B)}<div><h5 style="color:${RARITY[B.rar].color}">${esc(B.n)}</h5><p>${elSvg(B.el,12)} ${EL[B.el].n} · ${RARITY[B.rar].name} · ${B.t==='a'?'Chủ động':'Tâm Pháp'}${own?' · đã có (+'+dupPages(B)+' trang)':''}</p></div>
      <button class="btn sm" data-buy="${id}" ${sold||!inC?'disabled':''} aria-label="Mua ${esc(B.n)} giá ${fmt(c)} vàng">${sold?'Đã bán':fmt(c)+' vàng'}</button></div>`}
  h+=`<div class="btSc">${'<svg viewBox="0 0 28 32"><path d="M4 3h16l5 5v21H4z" fill="#efe4cc" stroke="#8a6a3a" stroke-width="1.5"/><path d="M8 11h13M8 16h13M8 21h13" stroke="#7a4a2a" stroke-width="1.3"/></svg>'}<div><h5>Tàn Trang Bí Tịch</h5><p>Dùng thay trang riêng của bất kỳ sách nào. Còn ${5-sh.wp}/5 hôm nay.</p></div>
    <button class="btn sm" data-wp="1" ${sh.wp>=5||!inC?'disabled':''}>${fmt(wpPrice())} vàng</button></div></div>
    <div class="row"><button class="btn sec sm" data-rr="1" ${inC?'':'disabled'}>Đổi hàng: ${fmt(500*(sh.rr+1))} vàng</button></div>`;
  return h}
function daoHtml(){const s=st(),S=G.save,ok=daoOk();
  let h=`<div class="sec"><h4>CHÍNH ĐẠO · TÀ ĐẠO</h4><p class="hist" style="color:var(--dim)">${s.phe?`Đang theo <b style="color:${SIDE[s.phe].c}">${SIDE[s.phe].n}</b>. Đổi đạo tốn ${fmt(daoCost())} vàng.`:ok?'Đã đủ điều kiện Ngộ Đạo. Gặp Ẩn Sĩ để chọn.':`Ngộ Đạo khi đạt cấp 30 hoặc qua chương 4 (hiện cấp ${S.lvl}).`}</p></div><div class="btDao">`;
  for(const k of['chinh','ta']){const L=BOOKS.filter(B=>B.side===k);
    h+=`<div class="btPath${s.phe===k?' cur':''}" style="--pc:${SIDE[k].c};--pd:${SIDE[k].d}"><h5>${SIDE[k].n}</h5><p>${SIDE_PASS[k]}.</p><ul>${L.map(B=>`<li><b>${esc(B.n)}</b> ↔ ${esc(BY[B.pair].n)}</li>`).join('')}</ul></div>`}
  h+=`</div><div class="row"><button class="btn${s.phe?' sec':''}" data-dao="1" ${ok?'':'disabled'}>${s.phe?'Đổi đạo':'Gặp Ẩn Sĩ Ngộ Đạo'}</button></div>`;return h}
function tabHtml(){if(!st())return'';const v=BTS.view||'lib';
  return`<div class="btw"><div class="btSeg" role="tablist" aria-label="Bí Tịch">${[['lib','Tàng Thư'],['shop','Thư Quán'],['dao','Chính · Tà']].map(([k,l])=>`<button role="tab" data-btv="${k}" aria-selected="${v===k}">${l}${k==='dao'&&!st().phe&&daoOk()?' •':''}</button>`).join('')}</div>
    ${v==='lib'?libHtml():v==='shop'?shopHtml():daoHtml()}</div>`}
function tabBind(body){const s=st();
  body.querySelectorAll('[data-btv]').forEach(b=>b.onclick=()=>{BTS.view=b.dataset.btv;Audio_.play('ui');HUB.refresh()});
  body.querySelectorAll('[data-bk]').forEach(b=>b.onclick=()=>{const id=b.dataset.bk;BTS.sel=BTS.sel===id?null:id;delete s.nw[id];Audio_.play('ui');HUB.refresh()});
  body.querySelectorAll('[data-slot]').forEach(b=>b.onclick=()=>{const k=b.dataset.slot[0],i=+b.dataset.slot[1],B=BY[BTS.sel];
    if(B&&s.own[B.id]&&B.t===k&&usable(B)&&(k==='a'?slotOpen(i):pslotOpen(i))){equip(B.id,k,i);return}
    const id=(k==='a'?s.eq:s.ps)[i];if(id){BTS.sel=id;HUB.refresh()}else UI.toast(k==='a'&&!slotOpen(i)?slotLock(i):k==='p'&&!pslotOpen(i)?pslotLock(i):'Chọn một cuốn trong Tàng Thư rồi chạm ô này')});
  body.querySelectorAll('[data-eq]').forEach(b=>b.onclick=()=>{const k=b.dataset.eq[0],i=+b.dataset.eq[1];const arr=k==='a'?s.eq:s.ps;if(arr[i]===BTS.sel){arr[i]=null;if(k==='p')recalc();saveGame();Audio_.play('ui');HUB.refresh()}else equip(BTS.sel,k,i)});
  body.querySelectorAll('[data-up]').forEach(b=>b.onclick=()=>{const e=lvUp(b.dataset.up);if(e)UI.toast(e,'warn');HUB.refresh()});
  body.querySelectorAll('[data-buy]').forEach(b=>b.onclick=()=>{const e=buy(b.dataset.buy);if(e)UI.toast(e,'warn');HUB.refresh()});
  const wp=body.querySelector('[data-wp]');if(wp)wp.onclick=()=>{const e=buyWp();if(e)UI.toast(e,'warn');else UI.loot('+1 Tàn Trang Bí Tịch','#efe4cc');HUB.refresh()};
  const rr=body.querySelector('[data-rr]');if(rr)rr.onclick=()=>{const e=reroll();if(e)UI.toast(e,'warn');HUB.refresh()};
  const dd=body.querySelector('[data-dao]');if(dd)dd.onclick=()=>{if(!daoOk())return;showDao()};
  if(BTS.tgt!=null){const t=body.querySelector(`[data-slot="a${BTS.tgt}"]`);BTS.tgt=null;t&&t.scrollIntoView({block:'nearest'})}}
function equip(id,k,i){const s=st(),B=BY[id];if(!B||!s.own[id])return;const why=whyNot(B);if(why){UI.toast(why,'warn');return}
  const arr=k==='a'?s.eq:s.ps;const j=arr.indexOf(id);if(j>=0)arr[j]=arr[i]&&j!==i?arr[i]:null;arr[i]=id;
  if(k==='a'&&G.p){ensureCd(G.p);if(j<0)G.p.skCd[3+i]=Math.max(G.p.skCd[3+i],1.5)}
  if(k==='p')recalc();saveGame();Audio_.play('ui');UI.toast(`${B.n} → ${k==='a'?'ô '+(i+1):'Tâm Pháp '+(i+1)}`,'skill');HUB.refresh()}
BT.equip=(id,slot)=>{const B=BY[id];if(!B)return false;equip(id,B.t,slot|0);const s=st();return(B.t==='a'?s.eq:s.ps)[slot|0]===id};
HUB.add({id:'bitich',name:'Bí Tịch',order:30,html:tabHtml,bind:tabBind,dot:hasDot});

/* ================= THÀNH: Thủ Thư ở Tàng Kinh Các ================= */
if(typeof LOOKS==='object'&&!LOOKS.thuthu)LOOKS.thuthu=Object.assign({},LOOKS.elder,{robe:'#3a4f6a',robe2:'#e2c88a',pants:'#2a3446',sash:'#c8361f',hair:'#d8d2c4',wc:'#5a3a1a'});
const _tn=townNpcs;townNpcs=function(W){const L=_tn.apply(this,arguments);L.push({id:'thuthu',name:'Thủ Thư',x:6.45*T,y:46.8*T,look:'thuthu',act:'bikip'});return L};
const _np=UI.npcPrompt;UI.npcPrompt=function(n){const r=_np.apply(this,arguments);if(n&&n.act==='bikip'){const b=$q('#npcBtn');b.textContent=`${n.name}: Tàng Kinh Các${FINE?' (E)':''}`}return r};
const _open=UI.open;UI.open=function(k){if(k==='bikip'){BTS.view='shop';shop();return HUB.show('bitich')}return _open.apply(this,arguments)};

/* ================= BỌC CHUNG ================= */
const _dz=drawZones;drawZones=function(){const r=_dz.apply(this,arguments);try{drawGround()}catch(e){console.error(e)}return r};
HK.on('drawWorld',()=>{if(!G.p||G.state==='title'||G.state==='select')return;drawTop()});
const _init=UI.init;UI.init=function(){const r=_init.apply(this,arguments);hudDom();return r};
const _hud=UI.hud;UI.hud=function(){const r=_hud.apply(this,arguments);try{hudUpd()}catch(e){console.error(e)}return r};
const _sg=startGame;startGame=function(){BTS.ents.length=0;BTS.st.clear();BTS.sh=null;BTS.hot=null;BTS.buf={};for(const k in hc)delete hc[k];hudDom();const r=_sg.apply(this,arguments);st();return r};
const _cc=UI.chapterClear;UI.chapterClear=function(mi,r){const out=_cc.apply(this,arguments);try{const lb=BTS.lastBoss;if(lb&&G.t-lb.t<6){const B=BY[lb.id],box=$q('#clearPaper .rewards');
    if(box&&B){const d=document.createElement('div');d.innerHTML=`${elSvg(B.el,16)} <span style="color:${RARITY[B.rar].color}">${lb.dup?'+'+lb.n+' Trang ':'Bí Tịch '}${esc(B.n)}</span>`;d.style.display='flex';d.style.alignItems='center';d.style.gap='6px';box.insertBefore(d,box.lastChild)}}BTS.lastBoss=null}catch(e){console.error(e)}return out};
HK.on('lvl',L=>{const s=G.save&&G.save.bikip;if(!s)return;if(L===10||L===20){const own=Object.keys(s.own);own.forEach(autoEquip);
  UI.toast(L===10?'Mở ô Bí Tịch 1! Mở Võ Đạo (Y) → Bí Tịch.':'Mở ô Tâm Pháp 1 trong Bí Tịch.','skill')}});
window.addEventListener('keydown',e=>{const tg=e.target&&e.target.tagName;if(tg==='INPUT'||tg==='TEXTAREA')return;if(e.repeat||G.state!=='play'||UI.panel||G.paused)return;
  const d=$q('#btDao');if(d&&!d.hidden)return;if(e.code==='KeyU')castBook(0);else if(e.code==='KeyO')castBook(1)});

/* ================= GỠ LỖI / THỬ ================= */
BT.dev={all(){for(const B of BOOKS)if(!st().own[B.id])st().own[B.id]={lv:1,pg:0}},maxAll(){for(const id in st().own)st().own[id].lv=MAXLV;recalc()},
  ents:()=>BTS.ents.length,stat:()=>BTS.st.size,reso,weaponEl,daoOk,slotOpen,pslotOpen,price,hasDot,lvMult};
})();

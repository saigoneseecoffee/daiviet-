/* ============ BÍ KÍP (chọn 1 trong 3 khi thăng cấp) & TUYỆT KỸ (ghép hai bí kíp) ============
   Lưu ở G.save.perks = {r:{id:cấp}, pend:số lượt chờ chọn, rr:số lần đã đổi, picks}
   Móc: lvl, stats, hit, kill, attack, cast, tick, dmgOut, dmgIn, drawWorld. Bọc: hurtPlayer (né), startGame, travel, UI.open, UI.renderTracker, UI.p_skill/b_skill. */
(function(){
const f1=v=>String(Math.round(v*10)/10).replace('.',',');
const TAG={proc:'Kích phát',stat:'Tâm pháp',def:'Hộ thể',move:'Thân pháp',weap:'Pháp khí',cls:'Môn phái',evo:'Tuyệt kỹ',dan:'Linh đan'};
/* ---------- danh sách bí kíp: d(r) mô tả hiệu quả ở cấp r ---------- */
const PKS=[
 {id:'loi',n:'Lôi Điện Chưởng',t:'proc',ic:'bolt',c:'#9fc4ff',max:5,d:r=>`Đòn trúng có ${5+3*r}% phóng sét lan sang ${1+Math.ceil(r/2)} kẻ địch, mỗi tia ${20+6*r}% công.`},
 {id:'huyet',n:'Huyết Ấn Chỉ',t:'proc',ic:'drop',c:'#ff5a5a',max:5,d:r=>`Đòn trúng gây chảy máu 4 giây, mỗi giây mất ${8+5*r}% công.`},
 {id:'hoa',n:'Hỏa Long Bộ',t:'move',ic:'flame',c:'#ff8a3a',max:5,d:r=>`Khi chạy để lại vệt lửa ${f1(1.6+0.2*r)} giây, thiêu ${10+5*r}% công mỗi 0,5 giây.`},
 {id:'kkpq',n:'Kiếm Khí Phân Quang',t:'proc',ic:'wave',c:'#7fe8dc',max:5,d:r=>`Mỗi ${r>=3?3:4} đòn đánh thường phóng ${1+Math.floor(r/2)} vệt kiếm khí xuyên thấu, mỗi vệt ${40+12*r}% công.`},
 {id:'bao',n:'Bạo Kích Tâm Pháp',t:'stat',ic:'crit',c:'#ffd23a',max:5,d:r=>`+${3*r}% chí mạng, +${10*r}% sát thương chí mạng.`},
 {id:'lien',n:'Liên Hoàn Thủ',t:'stat',ic:'claw',c:'#ffb36a',max:5,d:r=>`+${7*r}% tốc đánh.`},
 {id:'thiet',n:'Thiết Bố Sam',t:'stat',ic:'armor',c:'#c9b48a',max:5,d:r=>`+${8*r}% sinh lực, +${5*r}% thủ.`},
 {id:'kimchung',n:'Kim Chung Tráo',t:'def',ic:'bell',c:'#ffc53d',max:5,d:r=>`Mỗi lần hạ địch nhận khiên ${f1(1+0.6*r)}% sinh lực, tối đa ${8+4*r}%.`},
 {id:'langba',n:'Lăng Ba Vi Bộ',t:'move',ic:'feather',c:'#bfe8ff',max:5,d:r=>`${4*r}% né hoàn toàn đòn đánh, +${4*r}% tốc chạy.`},
 {id:'haptinh',n:'Hấp Tinh Đại Pháp',t:'def',ic:'heart',c:'#ff7a9a',max:5,d:r=>`+${f1(0.8*r)}% hút máu. Mỗi lần hạ địch hồi ${f1(0.4*r)}% sinh lực.`},
 {id:'cuuduong',n:'Cửu Dương Thần Công',t:'stat',ic:'sun',c:'#ffdf6a',max:5,d:r=>`Hồi chiêu kỹ năng giảm ${5*r}%, +${8*r}% nội lực.`},
 {id:'liethoa',n:'Liệt Hỏa Bạo Thể',t:'proc',ic:'burst',c:'#ff6a2a',max:5,d:r=>`Kẻ địch bị hạ có ${20+8*r}% phát nổ, gây ${40+15*r}% công trong bán kính ${80+5*r}.`},
 {id:'hanbang',n:'Hàn Băng Chưởng',t:'proc',ic:'snow',c:'#8fe0ff',max:5,d:r=>`Đòn trúng làm chậm 1,5 giây. Địch bị chậm nhận thêm ${4*r}% sát thương, ${2*r}% bị đóng băng 1 giây.`},
 {id:'kiemluan',n:'Hộ Thể Kiếm Luân',t:'weap',ic:'orbit',c:'#a8f0ff',max:5,d:r=>`${[0,2,2,3,3,4][r]} thanh kiếm xoay quanh người, mỗi lần chạm ${30+8*r}% công.`},
 {id:'linhphu',n:'Linh Phù Truy Hồn',t:'weap',ic:'talisman',c:'#ffe08a',max:5,d:r=>`Mỗi ${f1(2.6-0.25*r)} giây phóng ${r>=4?2:1} lá bùa đuổi theo địch, ${70+15*r}% công, nổ lan.`},
 {id:'batdong',n:'Bất Động Minh Vương',t:'def',ic:'lotus',c:'#ffb070',max:5,d:r=>`Dưới 40% sinh lực: giảm ${6*r}% sát thương nhận vào, hồi ${f1(0.4*r)}% sinh lực mỗi giây.`},
 {id:'thanhanh',n:'Thần Hành Bộ',t:'move',ic:'wind',c:'#d0ffb0',max:5,d:r=>`+${6*r}% tốc chạy. Mỗi ${f1(6-0.6*r)} giây tích Thần Lực: đòn kế tiếp thêm ${100+20*r}% công và hất văng.`},
 {id:'doathon',n:'Đoạt Hồn Trảm',t:'proc',ic:'skull',c:'#c58bff',max:5,d:r=>`+${6*r}% sát thương lên địch dưới 35% sinh lực. Quái thường dưới ${3*r}% sinh lực bị kết liễu.`},
 // môn phái
 {id:'kiemy',n:'Thuận Thiên Kiếm Ý',t:'cls',cls:'kiem',ic:'sword',c:'#4fd1c5',max:5,d:r=>`Kiếm Khí phóng thêm ${Math.ceil(r/2)} vệt tỏa quạt, mỗi vệt ${60+10*r}% sát thương chiêu.`},
 {id:'lienchau',n:'Liên Châu Tiễn',t:'cls',cls:'cung',ic:'arrows',c:'#8fd16a',max:5,d:r=>`Đánh thường bắn thêm ${r>=4?2:1} mũi tên tỏa quạt, mỗi mũi ${25+5*r}% công.`},
 {id:'cotran',n:'Bạch Đằng Cọc Trận',t:'cls',cls:'giao',ic:'stakes',c:'#ff6f5e',max:5,d:r=>`Mỗi 3 đòn đâm trồi một hàng cọc phía trước, ${50+12*r}% công, choáng ${f1(0.3+0.1*r)} giây.`},
 {id:'anhsat',n:'Tây Sơn Ảnh Sát',t:'cls',cls:'dao',ic:'daggers',c:'#c58bff',max:5,d:r=>`Đòn chí mạng có ${20+8*r}% gọi bóng đao chém một kẻ địch khác, ${60+15*r}% công.`},
 {id:'chancon',n:'Bình Định Chấn Côn',t:'cls',cls:'con',ic:'staff',c:'#ffb347',max:5,d:r=>`Đánh thường có ${12+4*r}% nện đất, ${50+15*r}% công quanh người, choáng 0,4 giây.`},
 {id:'loian',n:'Huyền Phù Lôi Ấn',t:'cls',cls:'phap',ic:'rune',c:'#7fb2ff',max:5,d:r=>`Cầu phép nổ lan ${20+8*r}% công. Lôi Phù phóng thêm ${r} tia sét phụ.`},
];
const EVO=[
 {id:'kiemtran',n:'Vạn Kiếm Thiên La',a:'kiemluan',b:'kkpq',ic:'swordrain',c:'#a8f0ff',d:'Mỗi 5 giây, 12 thanh kiếm từ trời giáng xuống kẻ địch, mỗi thanh 90% công. Kiếm luân thêm 2 thanh, quay rộng hơn.'},
 {id:'loihoa',n:'Lôi Hỏa Thiên Phạt',a:'loi',b:'liethoa',ic:'storm',c:'#ffd27a',d:'Mỗi 4 giây, 6 tia thiên lôi giáng xuống, mỗi tia 110% công và để lại biển lửa.'},
 {id:'songlong',n:'Băng Hỏa Song Long',a:'hanbang',b:'hoa',ic:'dragon',c:'#ff9a6a',d:'Rồng băng và rồng lửa bay vòng quanh người, chạm gây 80% công. Rồng băng đóng băng, rồng lửa thiêu đốt.'},
 {id:'huyetma',n:'Huyết Ma Đại Pháp',a:'huyet',b:'haptinh',ic:'moon',c:'#ff4a5a',d:'Chảy máu hồi cho bạn 20% sát thương gây ra. Địch đang chảy máu bị hạ sẽ nổ máu 80% công, lan chảy máu.'},
 {id:'kimcang',n:'Kim Cang Bất Hoại',a:'kimchung',b:'batdong',ic:'bell2',c:'#ffd23a',d:'Khiên tối đa gấp đôi. Mỗi 9 giây nhận khiên 15% sinh lực và phát sóng vàng 150% công, hất văng.'},
 {id:'phongthan',n:'Phong Thần Huyễn Ảnh',a:'langba',b:'thanhanh',ic:'phantom',c:'#d0ffb0',d:'Né thêm 8%. Khi chạy mỗi 2,5 giây (và mỗi lần né) tung ảo ảnh lao chém 3 kẻ địch, mỗi nhát 100% công.'},
 {id:'truyhon',n:'Bách Phù Đoạt Mệnh',a:'linhphu',b:'doathon',ic:'fan',c:'#ffe08a',d:'Bùa truy hồn bắn thành chùm 5 lá. Ngưỡng kết liễu tăng thêm 5% và áp dụng cả lên tinh anh.'},
];
const DAN={id:'dan',n:'Đại Hoàn Đan',t:'dan',ic:'pill',c:'#e8c27a',max:999,d:r=>`Vĩnh viễn +2% công và +2% sinh lực (đang có +${2*(r-1)}%).`};
const PK={};PKS.forEach(p=>PK[p.id]=p);EVO.forEach(e=>{e.t='evo';e.max=1;PK[e.id]=e});PK.dan=DAN;
const NEED=3;
/* nhịp bí kíp: mỗi lần thăng cấp đến cấp 10, sau đó mỗi 3 cấp. Cấp bí kíp 4 và 5 cần Cảnh Giới (prog.js). */
const offerAt=L=>L<=10||L%3===0;
const offersUpTo=L=>{let n=0;for(let l=2;l<=L;l++)if(offerAt(l))n++;return n};
const rankCap=p=>Math.min(p.max,p.t==='evo'||p.id==='dan'||typeof progPerkCap!=='function'?p.max:progPerkCap());

/* ---------- trạng thái ---------- */
const P={act:false,busy:false,cards:null,autoT:0,lastLvl:-9,shield:0,fl:[],sh:[],flT:0,phT:0,chg:false,chgT:0,atkN:0,loiCd:0,anCd:0,boom:0,snd:{},ev:{},rowKey:'',dom:null};
const ps=()=>{const S=G.save;if(!S)return null;if(!S.perks)S.perks={r:{},pend:0,rr:0,picks:0};return S.perks};
const R=id=>{const S=G.save;return S&&S.perks&&S.perks.r[id]||0};
const atk=()=>G.p.atk;
const cls=()=>G.p.cls.id;
function snd(n,gap){const t=G.t;if(t-(P.snd[n]||-9)<(gap||0.08))return;P.snd[n]=t;Audio_.play(n)}
function owned(){const s=ps();return s?s.r:{}}
function avail(p){return p.t!=='evo'&&p.id!=='dan'&&(!p.cls||p.cls===cls())}
function evoReady(ev){return !R(ev.id)&&R(ev.a)>=NEED&&R(ev.b)>=NEED}
function evoFor(id){return EVO.filter(e=>(e.a===id||e.b===id)&&!R(e.id)&&(!PK[e.a===id?e.b:e.a].cls||PK[e.a===id?e.b:e.a].cls===cls()))}

/* ---------- rút thẻ ---------- */
function roll(exclude){
  exclude=exclude||[];const out=[];
  const evs=EVO.filter(evoReady).filter(e=>!exclude.includes(e.id));
  for(const e of evs.slice(0,2))out.push(e.id);
  const own=owned();const distinct=Object.keys(own).filter(k=>own[k]>0&&PK[k]&&PK[k].t!=='evo'&&k!=='dan').length;
  let pool=PKS.filter(p=>avail(p)&&R(p.id)<rankCap(p)&&!exclude.includes(p.id));
  if(distinct>=8){const o=pool.filter(p=>R(p.id)>0);if(o.length)pool=o}
  if(pool.length+out.length<3&&exclude.length){pool=PKS.filter(p=>avail(p)&&R(p.id)<rankCap(p)&&!out.includes(p.id))}
  const w=p=>{let v=10;const r=R(p.id);if(r>0)v*=1.8;if(p.cls)v*=1.5;for(const e of evoFor(p.id)){const o=e.a===p.id?e.b:e.a;if(R(o)>0)v*=1.35}return v};
  while(out.length<3&&pool.length){let tot=0;for(const p of pool)tot+=w(p);let x=Math.random()*tot,k=0;for(;k<pool.length-1;k++){x-=w(pool[k]);if(x<=0)break}
    out.push(pool[k].id);pool.splice(k,1)}
  while(out.length<3&&!out.includes('dan'))out.push('dan');
  return out.slice(0,3);
}
function score(id){const p=PK[id];if(p.t==='evo')return 1000;if(id==='dan')return 1;const r=R(id);let s=20+(r>0?40:0)+(p.cls?12:0)+Math.random()*5;
  for(const e of evoFor(id)){const o=e.a===id?e.b:e.a;if(R(o)>0)s+=25;if(r+1>=NEED&&R(o)>=NEED)s+=100}return s}
function best(){let bi=0,bs=-1;P.cards.forEach((id,i)=>{const s=score(id);if(s>bs){bs=s;bi=i}});return bi}

/* ---------- biểu tượng vẽ tay ---------- */
function drawPkIcon(g,ic,S,col,evo){
  g.save();g.clearRect(0,0,S,S);g.scale(S/100,S/100);
  const gr=g.createRadialGradient(50,42,4,50,50,50);gr.addColorStop(0,shade(col,-0.25));gr.addColorStop(0.55,shade(col,0.45));gr.addColorStop(1,'#140b07');
  g.fillStyle=gr;g.beginPath();g.arc(50,50,47,0,TAU);g.fill();
  g.lineWidth=evo?4:3;g.strokeStyle=evo?'#ffd98a':'#c9963a';g.beginPath();g.arc(50,50,46,0,TAU);g.stroke();
  if(evo){g.strokeStyle='#c8361f';g.lineWidth=2;g.beginPath();g.arc(50,50,40,0,TAU);g.stroke()}
  g.lineCap='round';g.lineJoin='round';g.strokeStyle='#fff6e0';g.fillStyle='#fff6e0';g.lineWidth=5;g.shadowColor=col;g.shadowBlur=10;
  const P_=(pts,close,fill)=>{g.beginPath();g.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=2)g.lineTo(pts[i],pts[i+1]);if(close)g.closePath();fill?g.fill():g.stroke()};
  const blade=(x,y,a,l,w)=>{g.save();g.translate(x,y);g.rotate(a);P_([0,-l/2,w,-l/2+w*2,w*0.7,l/2-6,0,l/2,-w*0.7,l/2-6,-w,-l/2+w*2],1,1);g.fillRect(-w*2.2,l/2-8,w*4.4,3);g.restore()};
  switch(ic){
    case'bolt':P_([56,16,34,52,50,52,40,84,68,44,52,44,62,16],1,1);break;
    case'drop':g.beginPath();g.moveTo(50,16);g.bezierCurveTo(66,40,74,52,74,62);g.arc(50,62,24,0,Math.PI);g.bezierCurveTo(26,52,34,40,50,16);g.fill();g.fillStyle=shade(col,0.3);g.beginPath();g.arc(43,62,6,0,TAU);g.fill();break;
    case'flame':g.beginPath();g.moveTo(50,14);g.bezierCurveTo(74,38,78,58,66,76);g.quadraticCurveTo(50,90,34,76);g.bezierCurveTo(22,60,30,44,40,36);g.quadraticCurveTo(40,50,48,54);g.quadraticCurveTo(40,34,50,14);g.fill();break;
    case'wave':g.lineWidth=7;g.beginPath();g.arc(36,50,30,-1.1,1.1);g.stroke();g.lineWidth=4;g.beginPath();g.arc(48,50,28,-1,1);g.stroke();g.beginPath();g.arc(60,50,24,-0.9,0.9);g.stroke();break;
    case'crit':P_([50,12,58,42,88,50,58,58,50,88,42,58,12,50,42,42],1,1);g.fillStyle=shade(col,0.2);g.beginPath();g.arc(50,50,7,0,TAU);g.fill();break;
    case'claw':for(let k=0;k<3;k++){g.beginPath();g.moveTo(28+k*14,22);g.quadraticCurveTo(50+k*8,50,34+k*14,80);g.stroke()}break;
    case'armor':P_([50,14,78,24,76,52,50,86,24,52,22,24],1,0);P_([50,26,50,74]);P_([34,40,66,40]);break;
    case'bell':g.beginPath();g.moveTo(30,70);g.quadraticCurveTo(30,28,50,24);g.quadraticCurveTo(70,28,70,70);g.closePath();g.fill();g.fillRect(24,68,52,6);g.beginPath();g.arc(50,80,6,0,TAU);g.fill();g.fillRect(46,16,8,9);break;
    case'feather':g.beginPath();g.moveTo(24,80);g.quadraticCurveTo(40,30,78,18);g.quadraticCurveTo(70,58,24,80);g.fill();g.strokeStyle=shade(col,0.5);g.lineWidth=2.5;P_([26,78,66,30]);break;
    case'heart':g.beginPath();g.moveTo(50,82);g.bezierCurveTo(14,58,18,24,40,26);g.quadraticCurveTo(48,28,50,36);g.quadraticCurveTo(52,28,60,26);g.bezierCurveTo(82,24,86,58,50,82);g.fill();g.fillStyle=shade(col,0.4);P_([42,40,48,52,40,52,46,66],0,0);break;
    case'sun':g.beginPath();g.arc(50,50,15,0,TAU);g.fill();for(let k=0;k<9;k++){const a=k/9*TAU;P_([50+Math.cos(a)*22,50+Math.sin(a)*22,50+Math.cos(a)*34,50+Math.sin(a)*34])}break;
    case'burst':{const pts=[];for(let k=0;k<16;k++){const a=k/16*TAU,r=k%2?16:36;pts.push(50+Math.cos(a)*r,50+Math.sin(a)*r)}P_(pts,1,1);g.fillStyle=shade(col,0.2);g.beginPath();g.arc(50,50,9,0,TAU);g.fill();break}
    case'snow':for(let k=0;k<3;k++){const a=k/3*Math.PI;g.save();g.translate(50,50);g.rotate(a);P_([0,-32,0,32]);P_([-8,-24,0,-16,8,-24]);P_([-8,24,0,16,8,24]);g.restore()}break;
    case'orbit':g.lineWidth=2.5;g.setLineDash([5,6]);g.beginPath();g.arc(50,50,28,0,TAU);g.stroke();g.setLineDash([]);for(let k=0;k<3;k++){const a=k/3*TAU-0.5;blade(50+Math.cos(a)*28,50+Math.sin(a)*28,a,30,3.2)}g.beginPath();g.arc(50,50,6,0,TAU);g.fill();break;
    case'talisman':g.save();g.translate(50,50);g.rotate(-0.25);g.fillRect(-15,-30,30,60);g.strokeStyle='#c8361f';g.lineWidth=3.5;g.shadowBlur=0;P_([0,-20,0,20]);P_([-8,-10,8,-10]);P_([-8,2,8,2]);P_([-8,14,0,8,8,14]);g.restore();break;
    case'lotus':for(const[a,s]of[[0,1],[-0.7,0.85],[0.7,0.85],[-1.3,0.7],[1.3,0.7]]){g.save();g.translate(50,70);g.rotate(a);g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(12*s,-26*s,0,-46*s);g.quadraticCurveTo(-12*s,-26*s,0,0);g.fill();g.restore()}g.fillRect(28,72,44,4);break;
    case'wind':for(let k=0;k<3;k++){g.beginPath();g.moveTo(18,34+k*16);g.lineTo(60-k*6,34+k*16);g.arc(60-k*6,26+k*16,8,Math.PI/2,-Math.PI*0.9,true);g.stroke()}break;
    case'skull':g.beginPath();g.arc(50,44,24,Math.PI*0.85,Math.PI*0.15);g.lineTo(64,72);g.lineTo(36,72);g.closePath();g.fill();g.fillStyle=shade(col,0.55);g.shadowBlur=0;g.beginPath();g.arc(41,46,6,0,TAU);g.arc(59,46,6,0,TAU);g.fill();P_([46,58,50,52,54,58],1,1);break;
    case'sword':blade(50,52,0.785,70,5);break;
    case'arrows':for(const a of[-0.35,0,0.35]){g.save();g.translate(50,58);g.rotate(a-0.785);P_([-28,0,24,0]);P_([16,-8,28,0,16,8],1,1);g.restore()}break;
    case'stakes':for(let k=0;k<4;k++){const x=22+k*18,h=26+((k*7)%3)*10;P_([x-5,80,x,80-h-14,x+5,80],1,1)}g.fillRect(14,80,72,4);break;
    case'daggers':blade(40,50,0.6,56,4);blade(60,50,-0.6,56,4);break;
    case'staff':P_([24,78,76,22]);g.lineWidth=10;P_([20,82,27,75]);P_([73,25,80,18]);g.lineWidth=3;g.beginPath();g.arc(50,50,30,-2.5,-0.6);g.stroke();break;
    case'rune':g.beginPath();g.arc(50,50,30,0,TAU);g.stroke();P_([50,20,76,66,24,66],1,0);g.beginPath();g.arc(50,52,6,0,TAU);g.fill();break;
    case'swordrain':for(let k=0;k<5;k++)blade(22+k*14,30+((k*13)%3)*12,Math.PI,40,3.2);g.fillRect(16,84,68,3);break;
    case'storm':g.beginPath();g.arc(36,34,14,Math.PI,0);g.arc(56,30,16,Math.PI,0);g.arc(72,38,10,-Math.PI/2,Math.PI/2);g.lineTo(28,48);g.arc(28,40,8,Math.PI/2,-Math.PI/2);g.fill();g.fillStyle='#ffd27a';P_([50,48,38,70,50,70,42,90,66,62,54,62,60,48],1,1);break;
    case'dragon':for(const[c,ph]of[['#8fe0ff',0],['#ff8a3a',Math.PI]]){g.strokeStyle=c;g.shadowColor=c;g.lineWidth=7;g.beginPath();for(let i=0;i<=16;i++){const a=ph+i/16*Math.PI*1.4;const x=50+Math.cos(a)*30,y=50+Math.sin(a)*24;i?g.lineTo(x,y):g.moveTo(x,y)}g.stroke();g.fillStyle=c;const a=ph+Math.PI*1.4;g.beginPath();g.arc(50+Math.cos(a)*30,50+Math.sin(a)*24,8,0,TAU);g.fill()}break;
    case'moon':g.beginPath();g.arc(50,50,30,0,TAU);g.fill();g.fillStyle=shade(col,0.5);g.shadowBlur=0;g.beginPath();g.arc(62,42,26,0,TAU);g.fill();g.fillStyle='#ff5a5a';g.beginPath();g.moveTo(40,58);g.quadraticCurveTo(48,70,40,78);g.quadraticCurveTo(32,70,40,58);g.fill();break;
    case'bell2':g.lineWidth=3;for(let k=0;k<12;k++){const a=k/12*TAU;P_([50+Math.cos(a)*30,50+Math.sin(a)*30,50+Math.cos(a)*40,50+Math.sin(a)*40])}g.beginPath();g.moveTo(34,66);g.quadraticCurveTo(34,32,50,28);g.quadraticCurveTo(66,32,66,66);g.closePath();g.fill();g.fillRect(30,64,40,5);break;
    case'phantom':for(const[x,al]of[[30,0.35],[42,0.6],[56,1]]){g.globalAlpha=al;g.beginPath();g.arc(x,32,8,0,TAU);g.fill();P_([x,40,x-10,62,x-4,62,x-12,84,x+2,66,x+8,84,x+6,62,x+12,62],1,1)}g.globalAlpha=1;break;
    case'fan':for(let k=0;k<5;k++){g.save();g.translate(50,82);g.rotate(-0.8+k*0.4);g.fillRect(-6,-62,12,30);g.restore()}g.beginPath();g.arc(50,82,6,0,TAU);g.fill();break;
    case'pill':g.beginPath();g.arc(50,52,24,0,TAU);g.fill();g.fillStyle=shade(col,0.35);g.shadowBlur=0;g.beginPath();g.arc(50,52,24,Math.PI*0.1,Math.PI*0.9);g.fill();g.fillStyle='#fff';g.beginPath();g.arc(42,42,5,0,TAU);g.fill();break;
  }
  g.restore();
}

/* ---------- giao diện ---------- */
const CSS=`
#pkOv{position:absolute;inset:0;z-index:4;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:12px;
  padding:calc(14px + env(safe-area-inset-top,0px)) max(14px,env(safe-area-inset-right,0px)) calc(14px + env(safe-area-inset-bottom,0px)) max(14px,env(safe-area-inset-left,0px));
  background:radial-gradient(ellipse at 50% 45%,rgba(60,24,10,.93),rgba(10,6,4,.97));overflow-y:auto;overflow-x:hidden;touch-action:pan-y}
#pkOv>*{flex-shrink:0}#pkOv>:first-child{margin-top:auto}#pkOv>:last-child{margin-bottom:auto}
#pkOv.auto{background:radial-gradient(ellipse at 50% 45%,rgba(60,24,10,.9),rgba(10,6,4,.95))}
.pkHead{text-align:center}
.pkHead .k{font:700 11px/1 var(--f-ui);letter-spacing:.22em;color:var(--vang)}
.pkHead h2{margin:4px 0 0;font:400 clamp(26px,6vw,40px)/1.05 var(--f-display);color:var(--vang2);text-shadow:0 3px 0 #5a2a0a,0 0 26px rgba(255,180,60,.35)}
.pkHead .s{margin:4px 0 0;font:500 12.5px/1.3 var(--f-ui);color:var(--dim)}
.pkCards{display:grid;grid-template-columns:repeat(3,minmax(0,256px));gap:14px;width:100%;justify-content:center;perspective:900px}
.pkCard{position:relative;display:flex;flex-direction:column;align-items:center;gap:7px;padding:18px 14px 14px;min-height:310px;border-radius:14px;text-align:center;width:100%;
  background:radial-gradient(ellipse at 50% 18%,color-mix(in srgb,var(--pc) 22%,transparent),transparent 60%),linear-gradient(170deg,#3e281c,#1b120d);
  border:1.5px solid color-mix(in srgb,var(--pc) 55%,#5a4020);box-shadow:0 10px 26px rgba(0,0,0,.55);transition:transform .12s,border-color .12s,box-shadow .12s}
.pkCard::before{content:"";position:absolute;inset:5px;border:1px solid rgba(255,220,150,.09);border-radius:10px;pointer-events:none}
.pkCard:hover,.pkCard:focus-visible{border-color:var(--pc);transform:translateY(-4px);box-shadow:0 14px 30px rgba(0,0,0,.6),0 0 22px color-mix(in srgb,var(--pc) 35%,transparent)}
.pkCard canvas{width:84px;height:84px;flex:none;display:block}
.pkCard .tx{display:flex;flex-direction:column;align-items:center;gap:5px;flex:1;min-width:0;width:100%}
.pkCard .tg{font:700 10.5px/1 var(--f-ui);letter-spacing:.12em;color:var(--dim);text-transform:uppercase}
.pkCard .nm{font:400 21px/1.1 var(--f-display);color:var(--pc);text-wrap:balance}
.pkCard .pp{display:flex;gap:4px;align-items:center;font:700 11px/1 var(--f-ui);color:var(--dim)}
.pkCard .pp i{width:13px;height:5px;border-radius:2px;background:rgba(255,255,255,.14)}.pkCard .pp i.f{background:var(--pc)}.pkCard .pp i.n{background:#fff6dc;box-shadow:0 0 6px var(--pc)}
.pkCard .ds{font:500 13.5px/1.45 var(--f-ui);color:var(--ink)}
.pkCard .ds b{color:var(--vang2)}
.pkCard .rc{margin-top:auto;padding-top:7px;border-top:1px dashed rgba(226,178,74,.28);width:100%;font:600 11.5px/1.35 var(--f-ui);color:#e6c27a}
.pkCard .rc em{font-style:normal;color:#ffb8a0}
.pkCard .nw{position:absolute;right:9px;top:9px;padding:3px 7px;border-radius:6px;background:var(--son);border:1px solid var(--vang2);font:800 10px/1 var(--f-ui);color:#fff;letter-spacing:.05em}
.pkCard .ky{position:absolute;left:9px;top:9px;width:22px;height:22px;border-radius:6px;background:#0e0a08;border:1px solid rgba(255,255,255,.25);font:800 11px/20px var(--f-ui);color:var(--dim);display:none}
.fine .pkCard .ky{display:block}
.pkCard.evo{background:radial-gradient(ellipse at 50% 20%,rgba(255,190,80,.35),transparent 60%),linear-gradient(170deg,#7a2a14,#2a100a);border:2px solid #ffd98a;
  box-shadow:0 0 0 3px rgba(200,54,31,.55),0 0 34px rgba(255,150,40,.45)}
.pkCard.evo .tg{color:#ffd98a}.pkCard.evo .nm{color:#fff1c8;text-shadow:0 0 14px rgba(255,190,80,.7)}
.pkFoot{display:flex;gap:12px;align-items:center;justify-content:center;flex-wrap:wrap;width:min(780px,100%)}
.pkFoot .q{font:600 12.5px var(--f-ui);color:var(--dim)}
.pkAuto{display:flex;flex-direction:column;gap:4px;min-width:170px;font:700 12.5px var(--f-ui);color:var(--vang2);text-align:center}
.pkAuto i{display:block;height:4px;border-radius:2px;background:linear-gradient(90deg,#c08a2a,#ffd98a);transform-origin:left}
#pkRow{position:absolute;left:calc(10px + var(--sl));top:calc(190px + var(--st));display:flex;gap:4px;flex-wrap:wrap;max-width:min(250px,56vw);pointer-events:none}
#pkRow span{position:relative;width:26px;height:26px;display:block}
#pkRow canvas{width:26px;height:26px;display:block}
#pkRow b{position:absolute;right:-3px;bottom:-3px;min-width:13px;height:13px;padding:0 2px;border-radius:7px;background:#0e0a08;border:1px solid var(--line);font:800 8.5px/11px var(--f-ui);color:var(--vang2);text-align:center}
.pkList .skc canvas{border:0;background:none}
.pkList .skc .rc{font:600 11.5px/1.35 var(--f-ui);color:#e6c27a;margin-top:3px}
@media (max-width:760px) and (min-height:501px){
  .pkCards{grid-template-columns:minmax(0,460px);gap:10px}
  .pkCard{flex-direction:row;align-items:flex-start;text-align:left;min-height:0;padding:13px 12px 12px;gap:12px}
  .pkCard canvas{width:60px;height:60px}
  .pkCard .tx{align-items:flex-start;gap:4px}
  .pkCard .nm{font-size:19px;padding-right:44px}
  .pkCard .ds{font-size:13px;line-height:1.4}
  .pkCard .rc{margin-top:3px;padding-top:5px}
  .pkHead h2{font-size:30px}
}
@media (max-height:500px){
  #pkOv{gap:8px}
  .pkHead .k,.pkHead .s{display:none}
  .pkHead h2{font-size:24px}
  .pkCards{gap:10px}
  .pkCard{min-height:0;padding:10px 10px 10px;gap:4px}
  .pkCard canvas{width:46px;height:46px}
  .pkCard .nm{font-size:17px}
  .pkCard .ds{font-size:12px;line-height:1.35}
  .pkCard .rc{font-size:11px;padding-top:4px}
  .pkFoot .btn{min-height:44px}
}
@media (max-height:700px) and (max-width:760px) and (min-height:501px){
  #pkOv{gap:8px}.pkHead .s{display:none}.pkHead h2{font-size:26px}
  .pkCard{padding:10px 11px;gap:10px}.pkCard canvas{width:50px;height:50px}.pkCard .ds{font-size:12.5px}.pkCard .rc{font-size:11px}
}
`;
function dom(){
  if(P.dom)return P.dom;
  const st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
  const ov=document.createElement('section');ov.id='pkOv';ov.hidden=true;ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');ov.setAttribute('aria-labelledby','pkTitle');
  ov.innerHTML=`<div class="pkHead"><div class="k">THĂNG CẤP <span id="pkLv"></span></div><h2 id="pkTitle">Lĩnh ngộ Bí kíp</h2><p class="s">Chọn một bí kíp. Hai bí kíp cùng đạt cấp 3 sẽ hợp thành Tuyệt kỹ.</p></div>
    <div class="pkCards" id="pkCards"></div>
    <div class="pkFoot"><button class="btn sec" id="pkRe"></button><div class="pkAuto" id="pkAuto" hidden><span id="pkAutoT"></span><i id="pkAutoB"></i></div><span class="q" id="pkQ"></span></div>`;
  $('#app').appendChild(ov);
  const row=document.createElement('div');row.id='pkRow';row.className='ghost';row.setAttribute('aria-label','Bí kíp đã lĩnh ngộ');$('#hud').appendChild(row);
  ov.addEventListener('click',e=>{const b=e.target.closest('.pkCard');if(b){choose(+b.dataset.i);return}if(e.target.closest('#pkRe'))reroll()});
  P.dom={ov,row,cards:ov.querySelector('#pkCards')};
  window.addEventListener('resize',placeRow);
  return P.dom;
}
function rerollsLeft(){const s=ps();return Math.max(0,1+Math.floor(G.save.lvl/5)-s.rr)}
function cardHtml(id,i){
  const p=PK[id],r=R(id),nr=r+1,evo=p.t==='evo';
  let pips='';if(evo)pips='';else if(id==='dan')pips=`<span>Đã dùng ${r}</span>`;else{for(let k=1;k<=p.max;k++)pips+=`<i class="${k<=r?'f':k===nr?'n':''}"></i>`;pips+=`<span>&nbsp;Cấp ${nr}/${p.max}</span>`}
  let rc='';
  if(evo)rc=`Hợp thành từ <em>${esc(PK[p.a].n)}</em> + <em>${esc(PK[p.b].n)}</em>`;
  else{const e=evoFor(id)[0];if(e){const o=PK[e.a===id?e.b:e.a];rc=`Ghép với <em>${esc(o.n)}</em>${R(o.id)?` (đang cấp ${R(o.id)})`:''} → Tuyệt kỹ <em>${esc(e.n)}</em> khi cả hai cấp ${NEED}`}}
  const ds=evo?esc(p.d):esc(p.d(nr)).replace(/(\+?\d+(?:,\d+)?%?)/g,'<b>$1</b>');
  return`<button class="pkCard${evo?' evo':''}" data-i="${i}" style="--pc:${p.c}" aria-label="${esc(p.n)}"><span class="ky">${i+1}</span>${!evo&&!r&&id!=='dan'?'<span class="nw">MỚI</span>':''}
    <canvas width="168" height="168"></canvas><div class="tx"><div class="tg">${TAG[p.t]}</div><div class="nm">${esc(p.n)}</div>${pips?`<div class="pp">${pips}</div>`:''}<div class="ds">${ds}</div>${rc?`<div class="rc">${rc}</div>`:''}</div></button>`;
}
function render(){
  const d=dom(),s=ps();
  d.cards.innerHTML=P.cards.map(cardHtml).join('');
  d.cards.querySelectorAll('.pkCard').forEach((b,i)=>{const p=PK[P.cards[i]];drawPkIcon(b.querySelector('canvas').getContext('2d'),p.ic,168,p.c,p.t==='evo')});
  $('#pkLv').textContent=G.save.lvl;
  const rl=rerollsLeft(),re=$('#pkRe');re.textContent=`Đổi bí kíp (${rl})${FINE?' · R':''}`;re.disabled=rl<=0;
  $('#pkQ').textContent=s.pend>1?`Còn ${s.pend-1} lượt chọn sau`:'';
  const auto=!!G.save.set.auto;d.ov.classList.toggle('auto',auto);$('#pkAuto').hidden=!auto;
}
function show(){
  const d=dom();if(!P.cards)P.cards=roll();P.act=true;P.busy=false;P.autoT=6;P.autoShown=-1;
  render();d.ov.hidden=false;if(!G.save.set.auto)G.paused=true;
  G.input.atk=false;G.input.mx=G.input.my=0;
  if(anim&&!REDUCED){anim.fromTo(d.ov,{autoAlpha:0},{autoAlpha:1,duration:.2});anim.fromTo(d.cards.children,{y:40,rotationX:-25,autoAlpha:0},{y:0,rotationX:0,autoAlpha:1,duration:.45,stagger:.08,ease:'back.out(1.5)'});
    anim.fromTo('#pkTitle',{scale:1.3,autoAlpha:0},{scale:1,autoAlpha:1,duration:.4,ease:'power3.out'})}
  Audio_.play('quest');
  setTimeout(()=>{const b=d.cards.querySelector('.pkCard');if(b&&P.act&&FINE)b.focus({preventScroll:true})},60);
}
function hide(){const d=dom();P.act=false;P.busy=false;d.ov.hidden=true;if(anim)anim.killTweensOf(d.cards.children)}
function reroll(){if(!P.act||P.busy||rerollsLeft()<=0)return;ps().rr++;const old=P.cards;P.cards=roll(old.filter(id=>PK[id].t!=='evo'));Audio_.play('ui');render();
  const d=dom();if(anim&&!REDUCED)anim.fromTo(d.cards.children,{rotationY:90,autoAlpha:0},{rotationY:0,autoAlpha:1,duration:.35,stagger:.06,ease:'power2.out'})}
function choose(i,instant){
  if(!P.act||P.busy||!P.cards||!P.cards[i])return;const id=P.cards[i];
  const fin=()=>{apply(id);P.cards=null;hide();if(!UI.panel&&$('#story').hidden&&$('#clear').hidden)G.paused=false;P.lastLvl=G.t-0.6};
  if(instant||!anim||REDUCED){fin();return}
  P.busy=true;const d=dom(),cs=[...d.cards.children];Audio_.play('ui');
  cs.forEach((c,k)=>{if(k===i)anim.to(c,{scale:1.07,duration:.18,ease:'power2.out'});else anim.to(c,{autoAlpha:0,y:20,duration:.2})});
  anim.to(d.ov,{autoAlpha:0,duration:.18,delay:.2,onComplete:fin});
}
function apply(id){
  const s=ps(),p=PK[id],G_=G.p;s.r[id]=(s.r[id]||0)+1;s.pend=Math.max(0,s.pend-1);s.picks++;
  const hpR=G_.hp/G_.maxhp;recalc();G_.hp=Math.max(G_.hp,Math.round(G_.maxhp*hpR));
  const pl=G_;
  if(p.t==='evo'){G.flash={col:p.c,t:0.6,d:0.6};G.shake=Math.max(G.shake,12);Audio_.play('win');Audio_.play('roar');
    G.floats.push({x:pl.x,y:pl.y-110,txt:p.n,col:'#fff1c8',size:30,life:1.6,vy:-20,skill:1});
    G.fx.push({k:'pillar',x:pl.x,y:pl.y,w:60,h:520,col:p.c,life:1.4,max:1.4},{k:'ring',x:pl.x,y:pl.y,r:10,r2:260,life:0.8,max:0.8,col:p.c},{k:'flash',x:pl.x,y:pl.y-20,r:220,col:p.c,life:0.6,max:0.6});
    for(let k=0;k<36;k++){const a=k/36*TAU;addPart(pl.x+Math.cos(a)*20,pl.y-20,Math.cos(a)*260,Math.sin(a)*150-60,1,k%2?p.c:'#fff4d0',3.5,0,'c',1)}
    UI.toast('Tuyệt kỹ: '+p.n,'quest');
  }else{
    G.floats.push({x:pl.x,y:pl.y-96,txt:p.n+(p.max>1&&id!=='dan'?' '+s.r[id]:''),col:'#ffe7a8',size:20,life:1.2,vy:-26,skill:1});
    G.fx.push({k:'pillar',x:pl.x,y:pl.y,w:30,h:300,col:p.c,life:0.8,max:0.8},{k:'ring',x:pl.x,y:pl.y,r:10,r2:110,life:0.5,max:0.5,col:p.c});
    const e=EVO.find(evoReady);if(e)UI.toast(`Đủ điều kiện Tuyệt kỹ ${e.n}! Xuất hiện ở lần thăng cấp tới.`,'skill');
  }
  P.rowKey='';updRow();saveGame();
}

/* ---------- hàng biểu tượng trên HUD ---------- */
function placeRow(){const d=P.dom,qt=$('#qt');if(!d||!qt||!qt.offsetHeight)return;d.row.style.top=(qt.offsetTop+qt.offsetHeight+6)+'px'}
function updRow(){
  const d=dom(),o=owned();const ids=Object.keys(o).filter(k=>o[k]>0&&PK[k]).sort((a,b)=>(PK[b].t==='evo')-(PK[a].t==='evo')||o[b]-o[a]);
  const key=ids.map(k=>k+o[k]).join(',');if(key===P.rowKey)return;P.rowKey=key;
  const show=ids.slice(0,10);
  d.row.innerHTML=show.map(k=>`<span title="${esc(PK[k].n)}"><canvas width="52" height="52"></canvas>${PK[k].t!=='evo'?`<b>${o[k]}</b>`:''}</span>`).join('')+(ids.length>10?`<span><b style="position:static;display:block;width:26px;height:26px;line-height:24px;font-size:10px;border-radius:13px">+${ids.length-10}</b></span>`:'');
  d.row.querySelectorAll('canvas').forEach((c,i)=>{const p=PK[show[i]];drawPkIcon(c.getContext('2d'),p.ic,52,p.c,p.t==='evo')});
  placeRow();
}

/* ---------- vũ khí, hiệu ứng ---------- */
function applyDot(e,dur,dmg){if(e.dead)return;e._bl=Math.max(e._bl||0,dur);e._bd=Math.max(e._bl>dur?(e._bd||0):0,dmg);if(e._bt==null||e._bt<=0)e._bt=1}
function chain(from,n,dmg){const hit=new Set([from]);let cur=from;for(let k=0;k<n;k++){const nx=nearestEnemy(cur.x,cur.y,210,e=>!hit.has(e));if(!nx)break;hit.add(nx);
    if(G.fx.length<150)G.fx.push({k:'bolt',x1:cur.x,y1:cur.y-18,x2:nx.x,y2:nx.y-18,life:0.2,max:0.2,col:'#bcd8ff',w:2.2});hurtEnemy(nx,dmg,{proc:1,stun:0.1,noStagger:1});cur=nx}
  if(hit.size>1)snd('zap',0.12)}
function boom(x,y,r,dmg,col,kb){if(P.boom>=4)return;P.boom++;enemiesIn(x,y,r).forEach(e=>hurtEnemy(e,dmg,{proc:1,kb:kb||100,ang:Math.atan2(e.y-y,e.x-x)}));
  if(G.fx.length<150)G.fx.push({k:'flash',x,y:y-10,r:r*1.1,col,life:0.3,max:0.3},{k:'ring',x,y,r:10,r2:r,life:0.35,max:0.35,col});
  for(let i=0;i<10;i++){const a=Math.random()*TAU,v=rand(80,240);addPart(x,y-10,Math.cos(a)*v,Math.sin(a)*v*0.6-60,rand(0.3,0.6),i%2?col:'#fff0c8',rand(2.5,4.5),300,'c',1)}
  G.shake=Math.max(G.shake,4);snd('boom',0.15)}
function nova(x,y){if(P.boom>=4)return;P.boom++;const d=atk()*0.8;enemiesIn(x,y,110).forEach(e=>{hurtEnemy(e,d,{proc:1,kb:80,ang:Math.atan2(e.y-y,e.x-x)});applyDot(e,4,atk()*(0.08+0.05*R('huyet')))});
  G.fx.push({k:'ring',x,y,r:10,r2:115,life:0.4,max:0.4,col:'#ff2a3a'},{k:'flash',x,y:y-10,r:110,col:'#c8102a',life:0.35,max:0.35});
  for(let i=0;i<14;i++){const a=i/14*TAU;addPart(x,y-10,Math.cos(a)*220,Math.sin(a)*130-40,0.6,i%2?'#ff2a3a':'#7a0a14',4,300)}snd('crit',0.1)}
function shockwave(r,mult){const p=G.p,d=atk()*mult;enemiesIn(p.x,p.y,r).forEach(e=>hurtEnemy(e,d,{proc:1,kb:240,ang:Math.atan2(e.y-p.y,e.x-p.x)}));
  G.fx.push({k:'ring',x:p.x,y:p.y,r:20,r2:r,life:0.5,max:0.5,col:'#ffd23a'},{k:'pillar',x:p.x,y:p.y,w:40,h:260,col:'#ffd23a',life:0.6,max:0.6},{k:'flash',x:p.x,y:p.y-20,r:r*0.8,col:'#ffc53d',life:0.35,max:0.35});
  pushCrack(p.x,p.y,r*0.7,8);G.shake=Math.max(G.shake,8);snd('clang',0.2)}
function shieldCap(){const r=R('kimchung');return G.p.maxhp*(r?(8+4*r)/100:0.15)*(R('kimcang')?2:1)}
function addShield(v){P.shield=Math.min(shieldCap(),P.shield+v)}
function phantom(){const p=G.p;const ts=G.enemies.filter(e=>!e.dead&&dist2(p.x,p.y,e.x,e.y)<260*260).sort((a,b)=>dist2(p.x,p.y,a.x,a.y)-dist2(p.x,p.y,b.x,b.y)).slice(0,3);if(!ts.length)return;
  let px=p.x,py=p.y;pushGhost(p.x,p.y,p.f,'#b8ffd0',0.45);
  ts.forEach((e,k)=>{const x0=px,y0=py;px=e.x;py=e.y;G.timers.push({t:k*0.07,fn:()=>{if(e.dead)return;G.fx.push({k:'streak',x1:x0,y1:y0-24,x2:e.x,y2:e.y-24,w:10,col:'#b8ffd0',life:0.25,max:0.25},{k:'xslash',x:e.x,y:e.y-20,life:0.28,max:0.28,col:'#7dffb0'});
    pushGhost(e.x-20*Math.sign(e.x-x0||1),e.y,e.x>x0?1:-1,'#b8ffd0',0.35);hurtEnemy(e,atk(),{proc:1,kb:90,critB:10});snd('dash',0.1)}})})}
function storm(){const p=G.p;const ts=G.enemies.filter(e=>!e.dead&&dist2(p.x,p.y,e.x,e.y)<380*380);if(!ts.length)return false;const col='#a8f0ff';
  for(let k=0;k<12;k++){const e=ts[k%ts.length];const x=e.x+rand(-24,24),y=e.y+rand(-16,16);G.fx.push({k:'fallsword',x,y,life:0.3,max:0.3,delay:k*0.06,col});
    G.timers.push({t:k*0.06+0.3,fn:()=>{enemiesIn(x,y,55).forEach(en=>hurtEnemy(en,atk()*0.9,{proc:1,kb:60}));sparks(x,y,6,col,200);if(G.fx.length<150)G.fx.push({k:'ring',x,y,r:8,r2:52,life:0.28,max:0.28,col});if(k%4===0){pushCrack(x,y,36,4);snd('clang',0.25)}G.shake=Math.max(G.shake,3)}})}
  G.floats.push({x:p.x,y:p.y-100,txt:'Vạn Kiếm Thiên La',col:'#d8fbff',size:20,life:1,vy:-24,skill:1});return true}
function thunder(){const p=G.p;const ts=G.enemies.filter(e=>!e.dead&&dist2(p.x,p.y,e.x,e.y)<400*400);if(!ts.length)return false;
  for(let k=0;k<6;k++){const e=ts[(Math.random()*ts.length)|0];G.timers.push({t:k*0.09,fn:()=>{const x=e.dead?e.x+rand(-30,30):e.x,y=e.y;
    G.fx.push({k:'bolt',x1:x+rand(-40,40),y1:y-440,x2:x,y2:y,life:0.28,max:0.28,col:'#ffe7a0',w:4.5},{k:'flash',x,y,r:80,col:'#ffd27a',life:0.25,max:0.25},{k:'ring',x,y,r:10,r2:66,life:0.3,max:0.3,col:'#ffb347'});
    enemiesIn(x,y,62).forEach(en=>hurtEnemy(en,atk()*1.1,{proc:1,stun:0.3}));if(P.fl.length<18)P.fl.push({x,y,t:1.6,max:1.6,tt:0.25,big:1});pushCrack(x,y,40,5);G.shake=Math.max(G.shake,5);snd('zap',0.07)}})}
  return true}
function fireShot(n){const p=G.p;const ts=G.enemies.filter(e=>!e.dead&&dist2(p.x,p.y,e.x,e.y)<430*430).sort((a,b)=>dist2(p.x,p.y,a.x,a.y)-dist2(p.x,p.y,b.x,b.y));if(!ts.length)return false;
  const dmg=atk()*(0.7+0.15*R('linhphu'));
  for(let k=0;k<n;k++){if(P.sh.length>=16)break;const tg=ts[k%ts.length];const a=Math.atan2(tg.y-p.y,tg.x-p.x)+(k-(n-1)/2)*0.45+Math.PI*(n>2?0:0);
    P.sh.push({x:p.x,y:p.y-34,vx:Math.cos(a)*300,vy:Math.sin(a)*300-120,tg,dmg,life:2.2,rot:0})}
  snd('magic',0.2);return true}

/* ---------- móc sự kiện ---------- */
HK.on('lvl',L=>{const s=ps();if(!s||!offerAt(L))return;s.pend++;P.lastLvl=G.t});
HK.on('stats',st=>{if(!G.save||!G.save.perks)return;const r=R;
  st.crit+=3*r('bao');st.cdmg+=10*r('bao');st.aspd+=7*r('lien');st.hpp+=8*r('thiet');st.def*=1+0.05*r('thiet');
  st.spd+=4*r('langba')+6*r('thanhanh');st.ls+=0.8*r('haptinh');st.mp*=1+0.08*r('cuuduong');
  const dn=r('dan');st.atkp+=2*dn;st.hpp+=2*dn});
HK.on('dmgOut',(d,e,o)=>{if(!G.save.perks)return;let m=1;const hb=R('hanbang');if(hb&&e.slow>0)m+=0.04*hb;const dh=R('doathon');if(dh&&e.hp<e.max*0.35)m+=0.06*dh;return d*m});
HK.on('dmgIn',(d,src)=>{if(!G.save.perks)return;const p=G.p;const bd=R('batdong');if(bd&&p.hp<p.maxhp*0.4)d*=1-0.06*bd;
  if(P.shield>0){const a=Math.min(P.shield,d);P.shield-=a;d-=a;if(a>=1)addFloat(p.x+14,p.y-74,'-'+fmt(a),'#ffe08a',14);
    if(P.shield<=0.5&&R('kimcang')&&G.t-(P.ev.kcBreak||-9)>3){P.ev.kcBreak=G.t;shockwave(170,1.5)}}
  return d});
HK.on('hit',(e,dmg,o)=>{
  if(o.proc||!G.save.perks)return;const p=G.p,mul=o.noStagger?0.4:1;let r;
  if((r=R('loi'))&&G.t>P.loiCd&&Math.random()*100<(5+3*r)*mul){P.loiCd=G.t+0.3;chain(e,1+Math.ceil(r/2),atk()*(0.2+0.06*r))}
  if(e.dead)return;
  if((r=R('huyet')))applyDot(e,4,atk()*(0.08+0.05*r));
  if((r=R('hanbang'))){e.slow=Math.max(e.slow||0,1.5);if(!e.boss&&Math.random()*100<2*r*mul&&e.stun<=0.2){e.stun=Math.max(e.stun||0,e.elite?0.6:1);addFloat(e.x,e.y-44*e.sc,'Đóng băng','#bfeeff',13);sparks(e.x,e.y-14,6,'#bfeeff',160)}}
  if((r=R('anhsat'))&&o.crit&&G.t>P.anCd&&Math.random()*100<20+8*r){P.anCd=G.t+0.15;const t=nearestEnemy(e.x,e.y,220,x=>x!==e);if(t){
      pushGhost(t.x-18,t.y,1,'#a066e0',0.35);G.fx.push({k:'xslash',x:t.x,y:t.y-20,life:0.3,max:0.3,col:'#c58bff'});hurtEnemy(t,atk()*(0.6+0.15*r),{proc:1,critB:10});snd('dash',0.1)}}
  if((r=R('loian'))&&cls()==='phap'&&o.kb===50&&o.ang!=null){const d=atk()*(0.2+0.08*r);enemiesIn(e.x,e.y,55).forEach(x=>{if(x!==e)hurtEnemy(x,d,{proc:1})});
    if(G.fx.length<150)G.fx.push({k:'ring',x:e.x,y:e.y,r:8,r2:58,life:0.28,max:0.28,col:'#9fc4ff'})}
  if(!e.dead&&(r=R('doathon'))&&!e.boss){const th=(3*r+(R('truyhon')?5:0))/100;if((!e.elite||R('truyhon'))&&e.hp<e.max*th){addFloat(e.x,e.y-50*e.sc,'Đoạt Hồn','#e0b8ff',16);
    G.fx.push({k:'xslash',x:e.x,y:e.y-20,life:0.3,max:0.3,col:'#c58bff'});hurtEnemy(e,e.max*3,{proc:1})}}
});
HK.on('kill',e=>{if(!G.save.perks)return;const p=G.p;let r;
  if((r=R('kimchung')))addShield(p.maxhp*(1+0.6*r)/100);
  if((r=R('haptinh'))){p.hp=Math.min(p.maxhp,p.hp+p.maxhp*0.004*r)}
  if(R('huyetma')&&e._bl>0)nova(e.x,e.y);
  else if((r=R('liethoa'))&&Math.random()*100<20+8*r)boom(e.x,e.y,80+5*r,atk()*(0.4+0.15*r),'#ff7a2a',140);
});
HK.on('attack',t=>{if(!G.save.perks)return;const p=G.p,C=p.cls;P.atkN++;let r;
  if((r=R('kkpq'))&&P.atkN%(r>=3?3:4)===0){const n=1+Math.floor(r/2),d=atk()*(0.4+0.12*r);for(let k=0;k<n;k++){const a=p.aim+(k-(n-1)/2)*0.28;
      G.projs.push({x:p.x,y:p.y-18,vx:Math.cos(a)*640,vy:Math.sin(a)*640,r:24,dmg:d,from:'p',pierce:99,life:0.5,kind:'wave',ang:a,hit:new Set(),col:'#7fe8dc'})}snd('swing',0.1)}
  if((r=R('lienchau'))&&C.id==='cung'){const n=r>=4?2:1,d=atk()*(0.25+0.05*r);const sx=p.x+Math.cos(p.aim)*14,sy=p.y-24+Math.sin(p.aim)*8;
    for(let k=0;k<n;k++){const A=p.aim+(k%2?-1:1)*0.17;
      G.projs.push({x:sx,y:sy,vx:Math.cos(A)*620,vy:Math.sin(A)*620,r:8,dmg:d,from:'p',pierce:0,life:0.75,kind:'arrow',hit:new Set(),col:'#c8ff9a'})}}
  if((r=R('cotran'))&&C.id==='giao'&&P.atkN%3===0){const a=p.aim,d=atk()*(0.5+0.12*r),sn=0.3+0.1*r;
    for(let k=0;k<4;k++){const x=p.x+Math.cos(a)*(56+k*36),y=p.y+Math.sin(a)*(56+k*36)*0.9;G.timers.push({t:k*0.05,fn:()=>{for(let j=0;j<3;j++)if(G.fx.length<160)G.fx.push({k:'stake',x:x+rand(-12,12),y:y+rand(-8,8),life:0.6,max:0.6});
      enemiesIn(x,y,36).forEach(e=>hurtEnemy(e,d,{proc:1,stun:sn}));pushDust(x,y,3,20);if(k===0)snd('slam',0.2)}})}}
  if((r=R('chancon'))&&C.id==='con'&&Math.random()*100<12+4*r){const d=atk()*(0.5+0.15*r);enemiesIn(p.x,p.y,95).forEach(e=>hurtEnemy(e,d,{proc:1,stun:0.4,kb:90}));
    G.fx.push({k:'ring',x:p.x,y:p.y,r:16,r2:100,life:0.35,max:0.35,col:'#ffb347'});pushCrack(p.x,p.y,80,6);G.shake=Math.max(G.shake,5);snd('slam',0.15)}
  if(P.chg&&t&&!t.dead){P.chg=false;P.chgT=0;const d=atk()*(1+0.2*R('thanhanh'));hurtEnemy(t,d,{proc:1,kb:260,ang:Math.atan2(t.y-p.y,t.x-p.x)});
    G.fx.push({k:'xslash',x:t.x,y:t.y-20,life:0.35,max:0.35,col:'#d0ffb0'},{k:'ring',x:t.x,y:t.y,r:10,r2:80,life:0.3,max:0.3,col:'#d0ffb0'});G.shake=Math.max(G.shake,6);G.hitstop=Math.max(G.hitstop,0.05);snd('crit',0.1)}
});
HK.on('cast',(i,sk)=>{if(!G.save.perks)return;const p=G.p,S=G.save;let r;
  if((r=R('cuuduong')))p.skCd[i]*=1-0.05*r;
  const lv=S.skl[i],sd=p.atk*sk.mult*(1+0.13*(lv-1));
  if((r=R('kiemy'))&&sk.id==='wave'){const n=Math.ceil(r/2);for(let k=0;k<n;k++){const a=p.aim+(k%2?-1:1)*(Math.floor(k/2)+1)*0.22;
      G.projs.push({x:p.x,y:p.y-18,vx:Math.cos(a)*700,vy:Math.sin(a)*700,r:26,dmg:sd*(0.6+0.1*r),from:'p',pierce:99,life:0.55,kind:'wave',ang:a,hit:new Set(),col:'#4fd1c5'})}}
  if((r=R('loian'))&&sk.id==='chain'){const ts=G.enemies.filter(e=>!e.dead&&dist2(p.x,p.y,e.x,e.y)<320*320);for(let k=0;k<r&&ts.length;k++){const e=ts.splice((Math.random()*ts.length)|0,1)[0];
      G.fx.push({k:'bolt',x1:p.x,y1:p.y-40,x2:e.x,y2:e.y-18,life:0.22,max:0.22,col:'#bcd8ff',w:2.5});hurtEnemy(e,sd*0.7,{proc:1,stun:0.25})}}
});
HK.on('tick',dt=>{
  const S=G.save,s=ps();if(!s||!G.p)return;const p=G.p;P.boom=0;
  // luồng chọn bí kíp
  if(P.act){if(!P.busy){if(!S.set.auto){if(!G.paused)G.paused=true;dom().ov.classList.remove('auto');$('#pkAuto').hidden=true}
      else{dom().ov.classList.add('auto');$('#pkAuto').hidden=false;P.autoT-=dt;const c=Math.max(0,Math.ceil(P.autoT));if(c!==P.autoShown){P.autoShown=c;$('#pkAutoT').textContent=`Tự chọn sau ${c} giây`}
        $('#pkAutoB').style.transform=`scaleX(${Math.max(0,P.autoT/6)})`;if(P.autoT<=0)choose(best(),true)}}}
  else if(s.pend>0&&G.state==='play'&&!UI.panel&&G.t-P.lastLvl>0.9&&G.slow===1&&$('#story').hidden&&$('#clear').hidden&&$('#dead').hidden&&$('#confirm').hidden)show();
  if(!s.picks&&!P.dom)return;
  updRow();
  // địch: chậm, chảy máu
  const hm=R('huyetma');
  for(const e of G.enemies){if(e.dead)continue;if(e.slow>0)e.slow-=dt;
    if(e._bl>0){e._bl-=dt;e._bt-=dt;if(e._bt<=0){e._bt=1;P.quiet=Math.random()<0.6;const d=hurtEnemy(e,e._bd,{proc:1,noStagger:1,dot:1});P.quiet=false;if(hm&&d)p.hp=Math.min(p.maxhp,p.hp+d*0.2)}
      if(Math.random()<dt*4&&G.parts.length<420)addPart(e.x+rand(-8,8),e.y-20*e.sc,rand(-10,10),rand(10,40),0.5,'#c8102a',2.5,300)}}
  let r;
  // vệt lửa
  if((r=R('hoa'))&&p.moving&&G.state==='play'){P.flT-=dt;if(P.flT<=0){P.flT=0.3;if(P.fl.length>=18)P.fl.shift();P.fl.push({x:p.x+rand(-4,4),y:p.y+rand(-3,3),t:1.6+0.2*r,max:1.6+0.2*r,tt:0.2})}}
  const fd=atk()*(0.1+0.05*Math.max(1,R('hoa')));
  for(let i=P.fl.length-1;i>=0;i--){const f=P.fl[i];f.t-=dt;f.tt-=dt;if(f.tt<=0){f.tt=0.5;P.quiet=true;enemiesIn(f.x,f.y,f.big?52:34).forEach(e=>hurtEnemy(e,f.big?atk()*0.3:fd,{proc:1,noStagger:1}));P.quiet=false}if(f.t<=0)P.fl.splice(i,1)}
  // kiếm luân
  if((r=R('kiemluan'))){const kt=R('kiemtran'),n=[0,2,2,3,3,4][r]+(kt?2:0),Rr=kt?96:74,d=atk()*(0.3+0.08*r);
    for(let k=0;k<n;k++){const a=G.t*3.4+k*TAU/n,x=p.x+Math.cos(a)*Rr,y=p.y-14+Math.sin(a)*Rr*0.8;
      for(const e of G.enemies){if(e.dead||(e._kl||0)>G.t)continue;const rr=e.r+18;if(dist2(x,y,e.x,e.y-12)<rr*rr){e._kl=G.t+0.45;hurtEnemy(e,d,{proc:1,kb:70,ang:a+Math.PI/2,noStagger:1});sparks(x,y,3,'#d8fbff',160)}}}}
  // bùa truy hồn
  if((r=R('linhphu'))){P.ev.lp=(P.ev.lp||0)+dt;if(P.ev.lp>=2.6-0.25*r){if(fireShot(R('truyhon')?5:r>=4?2:1))P.ev.lp=0;else P.ev.lp-=0.3}}
  for(let i=P.sh.length-1;i>=0;i--){const b=P.sh[i];b.life-=dt;let tg=b.tg;if(!tg||tg.dead){tg=b.tg=nearestEnemy(b.x,b.y,360)}
    if(tg){const a=Math.atan2(tg.y-18-b.y,tg.x-b.x),sp=Math.min(620,Math.hypot(b.vx,b.vy)+700*dt),cur=Math.atan2(b.vy,b.vx),na=cur+clamp(angDiff(cur,a),-7*dt,7*dt);b.vx=Math.cos(na)*sp;b.vy=Math.sin(na)*sp}
    b.x+=b.vx*dt;b.y+=b.vy*dt;b.rot+=dt*9;
    if(tg&&dist2(b.x,b.y,tg.x,tg.y-18)<(tg.r+12)*(tg.r+12)){hurtEnemy(tg,b.dmg,{proc:1,kb:60});enemiesIn(tg.x,tg.y,46).forEach(e=>{if(e!==tg)hurtEnemy(e,b.dmg*0.4,{proc:1})});
      if(G.fx.length<150)G.fx.push({k:'flash',x:b.x,y:b.y,r:44,col:'#ffd96a',life:0.22,max:0.22},{k:'ring',x:tg.x,y:tg.y,r:6,r2:46,life:0.25,max:0.25,col:'#ffe08a'});b.life=0}
    if(b.life<=0)P.sh.splice(i,1)}
  // Thần Lực
  if((r=R('thanhanh'))&&!P.chg){P.chgT+=dt;if(P.chgT>=6-0.6*r){P.chg=true;G.fx.push({k:'ring',x:p.x,y:p.y,r:50,r2:14,life:0.3,max:0.3,col:'#d0ffb0'})}}
  // Bất Động hồi máu
  if((r=R('batdong'))&&p.hp<p.maxhp*0.4&&p.hp>0)p.hp=Math.min(p.maxhp,p.hp+p.maxhp*0.004*r*dt);
  // tuyệt kỹ
  if(R('kiemtran')){P.ev.kt=(P.ev.kt||0)+dt;if(P.ev.kt>=5){if(storm())P.ev.kt=0;else P.ev.kt=4.5}}
  if(R('loihoa')){P.ev.lh=(P.ev.lh||0)+dt;if(P.ev.lh>=4){if(thunder())P.ev.lh=0;else P.ev.lh=3.5}}
  if(R('kimcang')){P.ev.kc=(P.ev.kc||0)+dt;if(P.ev.kc>=9&&G.enemies.some(e=>!e.dead&&dist2(p.x,p.y,e.x,e.y)<260*260)){P.ev.kc=0;addShield(p.maxhp*0.15);shockwave(170,1.5)}}
  if(R('phongthan')&&p.moving){P.ev.pt=(P.ev.pt||0)+dt;if(P.ev.pt>=2.5){P.ev.pt=0;phantom()}}
  if(R('songlong')){const d=atk()*0.8;for(let k=0;k<2;k++){const a=G.t*2.3+k*Math.PI,x=p.x+Math.cos(a)*140,y=p.y-14+Math.sin(a)*112;const key=k?'_sl1':'_sl0';
      for(const e of G.enemies){if(e.dead||(e[key]||0)>G.t)continue;const rr=e.r+26;if(dist2(x,y,e.x,e.y-14)<rr*rr){e[key]=G.t+0.5;hurtEnemy(e,d,{proc:1,kb:60});
        if(k===0){if(!e.boss&&!e.dead){e.stun=Math.max(e.stun||0,0.6);e.slow=2}sparks(e.x,e.y-14,6,'#bfeeff',180)}else{applyDot(e,3,atk()*0.25);sparks(e.x,e.y-14,6,'#ffb347',180)}}}}}
});
/* sát thương theo thời gian không hiện số/tia lửa để đỡ tốn khung hình */
const _addFloat=addFloat;addFloat=function(){if(P.quiet)return;return _addFloat.apply(this,arguments)};
const _sparks=sparks;sparks=function(){if(P.quiet)return;return _sparks.apply(this,arguments)};
/* né đòn: bọc hurtPlayer */
const _hurtPlayer=hurtPlayer;
hurtPlayer=function(raw,elv,src){const p=G.p;
  if(p&&G.save&&G.save.perks&&p.ifr<=0&&G.state==='play'&&p.hp>0){const dg=4*R('langba')+(R('phongthan')?8:0);
    if(dg>0&&Math.random()*100<dg){addFloat(p.x,p.y-68,'Né','#bfe8ff',16);p.ifr=0.2;pushGhost(p.x-p.f*14,p.y,p.f,'#bfe8ff',0.3);if(R('phongthan')&&G.t-(P.ev.ptd||-9)>0.8){P.ev.ptd=G.t;phantom()}return}}
  return _hurtPlayer.apply(this,arguments)};
/* vẽ trong thế giới */
HK.on('drawWorld',()=>{
  const p=G.p,S=G.save;if(!p||!S||!S.perks||G.state==='title'||G.state==='select')return;let r;
  if(P.fl.length)additive(()=>{for(const f of P.fl){const k=Math.min(1,f.t/f.max*1.5),fl=Math.sin(G.t*20+f.x)*0.15;const R_=(f.big?40:24)*(0.7+0.3*k);
      glow(f.x,f.y-6,R_*(1.1+fl),'#ff6a1a',0.55*k);glow(f.x,f.y-12-R_*0.2,R_*0.6,'#ffd23a',0.7*k)}
    if(Math.random()<0.5&&G.parts.length<450){const f=P.fl[(Math.random()*P.fl.length)|0];addPart(f.x+rand(-10,10),f.y-6,rand(-10,10),rand(-90,-40),0.45,Math.random()<0.5?'#ff7a2a':'#ffd23a',rand(2,4),-40,'c',1)}},'lighter');
  if((r=R('kiemluan'))){const kt=R('kiemtran'),n=[0,2,2,3,3,4][r]+(kt?2:0),Rr=kt?96:74;
    additive(()=>{for(let k=0;k<n;k++){const a=G.t*3.4+k*TAU/n;glow(p.x+Math.cos(a)*Rr,p.y-14+Math.sin(a)*Rr*0.8,22,'#7fe8ff',0.55);for(let j=1;j<4;j++){const b=a-j*0.12;glow(p.x+Math.cos(b)*Rr,p.y-14+Math.sin(b)*Rr*0.8,12-j*2,'#a8f0ff',0.35-j*0.08)}}},'lighter');
    cx.fillStyle='#eafcff';cx.strokeStyle=OL;cx.lineWidth=1;
    for(let k=0;k<n;k++){const a=G.t*3.4+k*TAU/n,x=p.x+Math.cos(a)*Rr,y=p.y-14+Math.sin(a)*Rr*0.8;
      cx.save();cx.translate(x,y);cx.rotate(a+Math.PI);cx.fillStyle='#eafcff';cx.beginPath();cx.moveTo(-15,0);cx.lineTo(10,-2.6);cx.lineTo(16,0);cx.lineTo(10,2.6);cx.closePath();cx.fill();cx.stroke();
      cx.fillStyle='#d6ac4e';cx.fillRect(-16,-5,3,10);cx.restore()}}
  if(P.sh.length)additive(()=>{for(const b of P.sh)glow(b.x,b.y,18,'#ffd96a',0.7)},'lighter');
  for(const b of P.sh){cx.save();cx.translate(b.x,b.y);cx.rotate(Math.sin(b.rot)*0.5+Math.atan2(b.vy,b.vx));cx.fillStyle='#f4e6b8';cx.fillRect(-8,-4.5,16,9);cx.strokeStyle='#c8361f';cx.lineWidth=1.3;cx.beginPath();cx.moveTo(-5,0);cx.lineTo(5,0);cx.moveTo(0,-3);cx.lineTo(0,3);cx.stroke();cx.restore()}
  if(R('songlong')){for(let k=0;k<2;k++){const c1=k?'#ff7a2a':'#7fd8ff',c2=k?'#ffe08a':'#e8fbff';additive(()=>{for(let j=13;j>=0;j--){const a=G.t*2.3+k*Math.PI-j*0.1,x=p.x+Math.cos(a)*140,y=p.y-14+Math.sin(a)*112+Math.sin(G.t*8-j*0.8)*5;
      const s=j?(16-j)*1.3:24;glow(x,y,s,c1,0.75-j*0.04);if(!j)glow(x,y,10,c2,1)}},'lighter');
      if(Math.random()<0.5&&G.parts.length<450){const a=G.t*2.3+k*Math.PI;addPart(p.x+Math.cos(a)*140,p.y-14+Math.sin(a)*112,rand(-20,20),rand(-30,10),0.5,k?'#ffb347':'#bfeeff',rand(2,3.5),0,'c',1)}}}
  if(P.shield>1){const k=Math.min(1,P.shield/Math.max(1,shieldCap())),kc=R('kimcang');additive(()=>{cx.globalAlpha=0.25+0.35*k;cx.strokeStyle=kc?'#ffd23a':'#ffe08a';cx.lineWidth=2+2*k;cx.beginPath();cx.ellipse(p.x,p.y-28,30,44,0,0,TAU);cx.stroke();
    glow(p.x,p.y-28,40,'#ffc53d',0.12+0.15*k)},'lighter')}
  if(P.chg)additive(()=>{const pu=0.6+Math.sin(G.t*10)*0.25;glow(p.x+p.f*10,p.y-34,18,'#d0ffb0',pu);cx.globalAlpha=pu*0.6;cx.strokeStyle='#d0ffb0';cx.lineWidth=2;cx.beginPath();cx.ellipse(p.x,p.y,24,8,0,0,TAU);cx.stroke()},'lighter');
});
/* ---------- bàn phím: 1/2/3 chọn thẻ, R đổi ---------- */
window.addEventListener('keydown',e=>{if(!P.act)return;const c=e.code;
  const k={Digit1:0,Digit2:1,Digit3:2,Numpad1:0,Numpad2:1,Numpad3:2}[c];
  if(k!=null){choose(k)}else if(c==='KeyR')reroll();else if(c==='Enter'||c==='Space'){const a=document.activeElement;if(a&&a.classList&&a.classList.contains('pkCard'))choose(+a.dataset.i);else return}
  else if(c==='ArrowLeft'||c==='ArrowRight'||c==='ArrowUp'||c==='ArrowDown'||c==='Tab'){const cs=[...dom().cards.children];let i=cs.indexOf(document.activeElement);const d=(c==='ArrowLeft'||c==='ArrowUp'||(c==='Tab'&&e.shiftKey))?-1:1;i=i<0?0:(i+d+cs.length)%cs.length;cs[i]&&cs[i].focus({preventScroll:true})}
  else if(G.save.set.auto&&(KEYMAP[c]))return;
  e.preventDefault();e.stopImmediatePropagation()},true);

/* ---------- bọc hàm dùng chung ---------- */
const _startGame=startGame;
startGame=function(){const S=G.save;if(S&&!S.perks)S.perks={r:{},pend:Math.min(offersUpTo(S.lvl||1),15),rr:0,picks:0};
  P.shield=0;P.fl=[];P.sh=[];P.chg=false;P.chgT=0;P.ev={};P.act=false;P.cards=null;P.rowKey='';if(P.dom){P.dom.ov.hidden=true;P.dom.row.innerHTML=''}
  const r=_startGame.apply(this,arguments);dom();updRow();return r};
const _travel=travel;travel=function(){P.fl=[];P.sh=[];return _travel.apply(this,arguments)};
const _open=UI.open;UI.open=function(){if(P.act&&!P.busy){P.dom.ov.hidden=true;P.act=false}return _open.apply(this,arguments)};
const _rt=UI.renderTracker;UI.renderTracker=function(){const r=_rt.apply(this,arguments);placeRow();return r};
const _ps=UI.p_skill;UI.p_skill=function(){let h=_ps.apply(this,arguments);const o=owned();const ids=Object.keys(o).filter(k=>o[k]>0&&PK[k]).sort((a,b)=>(PK[b].t==='evo')-(PK[a].t==='evo')||o[b]-o[a]);
  h+=`<div class="sec pkList" style="margin-top:14px"><h4>BÍ KÍP ĐÃ LĨNH NGỘ · ${ids.length}</h4>`;
  if(!ids.length)h+=`<p class="hist" style="color:var(--dim)">Đến cấp 10 mỗi lần thăng cấp, sau đó cứ 3 cấp được chọn một trong ba bí kíp. Hai bí kíp cùng đạt cấp 3 sẽ hợp thành Tuyệt kỹ.</p>`;
  for(const k of ids){const p=PK[k],evo=p.t==='evo';let rc='';if(!evo){const e=evoFor(k)[0];if(e){const ot=PK[e.a===k?e.b:e.a];rc=`Ghép với ${esc(ot.n)} → Tuyệt kỹ ${esc(e.n)} (cả hai cấp ${NEED})`}}
    h+=`<div class="skc"><canvas data-pk="${k}" width="128" height="128"></canvas><div><h5>${esc(p.n)} <span style="color:var(--dim);font-weight:600">· ${evo?'Tuyệt kỹ':k==='dan'?'đã dùng '+o[k]:'cấp '+o[k]+'/'+p.max}</span></h5><p>${esc(evo?p.d:p.d(o[k]))}</p>${rc?`<div class="rc">${rc}</div>`:''}</div><span></span></div>`}
  if(typeof progPerkCapNote==='function')h+=progPerkCapNote();
  const rd=EVO.filter(e=>!R(e.id)&&(!PK[e.a].cls||PK[e.a].cls===cls()));
  if(rd.length)h+=`<p class="hist" style="color:var(--dim);margin-top:6px">Tuyệt kỹ chưa mở: ${rd.map(e=>`<b style="color:var(--vang2)">${esc(e.n)}</b> (${esc(PK[e.a].n)} + ${esc(PK[e.b].n)})`).join(', ')}.</p>`;
  return h+'</div>'};
const _bs=UI.b_skill;UI.b_skill=function(body){const r=_bs.apply(this,arguments);body.querySelectorAll('canvas[data-pk]').forEach(c=>{const p=PK[c.dataset.pk];drawPkIcon(c.getContext('2d'),p.ic,128,p.c,p.t==='evo')});return r};

/* ---------- cho bot thử nghiệm ---------- */
window.PERKS={
  pickAuto(){const s=ps();if(!s)return false;if(P.act){choose(best(),true);return true}if(s.pend>0){P.cards=roll();P.act=true;choose(best(),true);return true}return false},
  owned(){return Object.assign({},owned())},
  offerPending(){const s=ps();return s?s.pend+(P.act?0:0):0},
  showing(){return P.act},
  grant(id,n){const s=ps();if(!s||!PK[id])return;s.r[id]=Math.min(PK[id].max,(s.r[id]||0)+(n||1));recalc();P.rowKey='';updRow()},
  offerAt,offersUpTo,
  list:()=>PKS.map(p=>p.id),evos:()=>EVO.map(e=>e.id),_P:P,_icon:drawPkIcon,
};
})();

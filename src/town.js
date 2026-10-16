/* ============ THÀNH CHÍNH ============
   Khu phố có tường bao ở góc dưới trái mỗi bản đồ: sân lát đá, hồ sen có lôi đài trống đồng ở giữa,
   tám công trình mái cong. Mỗi nhà có người đứng trước cửa, đi tới là mở đúng chức năng.
   Nhà vẽ theo phép chiếu xiên: mặt tiền thẳng đứng, mặt bên phải lộ ra, mái phủ toàn bộ chiều sâu nền.
   Sprite vẽ một lần rồi lưu đệm như các vật thể khác. */
const TQ=8,TV=9;
const TOWN={x0:1,y0:42,x1:21,y1:62,gN:[12,13],gE:[52,53]};
const POND={x:11,y:51,rx:3.35,ry:2.65,st:1.42};
const BLD=[
  {k:'forge',x:2,y:43,w:4,h:3,name:'Lò Rèn',H:76},
  {k:'hall',x:7,y:43,w:4,h:3,name:'Từ Đường',H:88},
  {k:'dojo',x:15,y:43,w:4,h:3,name:'Võ Quán',H:82},
  {k:'stable',x:2,y:48,w:3,h:3,name:'Mã Trường',H:66},
  {k:'market',x:16,y:48,w:4,h:2,name:'Chợ Phiên',H:62},
  {k:'vault',x:2,y:57,w:4,h:3,name:'Ngân Khố',H:78},
  {k:'pagoda',x:8,y:58,w:2,h:2,name:'Bảo Tháp',H:0},
  {k:'post',x:15,y:57,w:4,h:3,name:'Dịch Trạm',H:72},
];
const BLD_BY={};BLD.forEach(b=>BLD_BY[b.k]=b);
const BK=0.22,BPL=12; // độ xiên chiều sâu, chiều cao nền đá
const ROOFC=['#3d4756','#4b3d33','#33504c','#5b3029','#3c4150','#34495b'];
const inTownT=(x,y)=>x>=TOWN.x0&&x<=TOWN.x1&&y>=TOWN.y0&&y<=TOWN.y1;
const inTownPt=(px,py)=>inTownT(Math.floor(px/T),Math.floor(py/T));
// kích thước sprite cho từng loại
(function(){for(const b of BLD){const fw=b.w*T,fd=b.h*T;OBJ['b_'+b.k]=b.k==='pagoda'?{solid:1,w:200,h:330}:{solid:1,w:Math.ceil(fw+fd*BK*2+110),h:Math.ceil(BPL+b.H+fd+96)}}
  Object.assign(OBJ,{twN:{solid:1,w:52,h:120},twS:{solid:1,w:52,h:84},twV:{solid:1,w:56,h:128},twC:{solid:1,w:84,h:190},tgN:{solid:1,w:250,h:250},tgE:{solid:1,w:84,h:200},
    willow:{solid:1,w:130,h:150},slamp:{solid:1,w:30,h:60},board:{solid:1,w:70,h:84},well:{solid:1,w:64,h:84},rockery:{solid:1,w:90,h:96},dummy:{solid:1,w:40,h:66},
    censer:{solid:1,w:48,h:56},lion:{solid:1,w:40,h:50},crate:{solid:1,w:44,h:40},bush:{solid:0,w:56,h:40},pot:{solid:0,w:30,h:40},chestD:{solid:1,w:40,h:34},sign:{solid:1,w:56,h:84}})})();

/* ---------- ô địa hình của thành ---------- */
function townTiles(W){const id=(x,y)=>y*MW+x;
  for(let y=TOWN.y0;y<=TOWN.y1;y++)for(let x=TOWN.x0;x<=TOWN.x1;x++){
    const edge=x===TOWN.x0||x===TOWN.x1||y===TOWN.y0||y===TOWN.y1;let t=edge?TV:TQ;
    if(y===TOWN.y0&&TOWN.gN.includes(x))t=TQ;if(x===TOWN.x1&&TOWN.gE.includes(y))t=TQ;
    if(!edge){const px=x+.5,py=y+.5,e=((px-POND.x)/POND.rx)**2+((py-POND.y)/POND.ry)**2;
      if(e<1){t=TW;if(Math.hypot(px-POND.x,py-POND.y)<POND.st||y===50||y===51||x===10||x===11)t=TB}}
    W.tile[id(x,y)]=t}
  // lối ra ngoài cổng
  for(const[x,y]of[[12,41],[13,41],[12,40],[13,40],[11,40],[14,40],[22,52],[22,53],[23,52],[23,53],[23,51],[23,54]]){const i=id(x,y);W.tile[i]=W.tile[i]===TW?TB:TP}
}
function townSolid(W){W.bfoot=new Uint8Array(MW*MH);
  for(const b of BLD)for(let y=b.y;y<b.y+b.h;y++)for(let x=b.x;x<b.x+b.w;x++){W.solid[y*MW+x]=1;W.bfoot[y*MW+x]=1}}
function townObjs(W,addObj){
  const o=(k,x,y,v)=>addObj({x:x*T,y:y*T,k,v:v||0,cr:0,s:1});
  const skipN=[11,14],skipE=[51,54];
  for(let y=TOWN.y0;y<=TOWN.y1;y++)for(let x=TOWN.x0;x<=TOWN.x1;x++){if(W.tile[y*MW+x]!==TV)continue;
    const corner=(x===TOWN.x0||x===TOWN.x1)&&(y===TOWN.y0||y===TOWN.y1);
    if(corner){o('twC',x+.5,y+1,W.mi);continue}
    if(y===TOWN.y0){if(!skipN.includes(x))o('twN',x+.5,y+1,x);continue}
    if(y===TOWN.y1){o('twS',x+.5,y+1,x);continue}
    if(x===TOWN.x1&&skipE.includes(y))continue;
    o('twV',x+.5,y+1,x===TOWN.x0?0:1)}
  o('tgN',13,TOWN.y0+1,W.mi);o('tgE',TOWN.x1+.5,52,W.mi);o('tgE',TOWN.x1+.5,55,W.mi+10);
  for(const b of BLD)o('b_'+b.k,b.x+b.w/2,b.y+b.h,W.mi);
  // trang trí
  [[6.4,47.4],[14.8,47.3],[20.3,52.4],[6.3,55.6],[15.7,55.9],[20.2,61.2],[2.4,54.8]].forEach(([x,y],i)=>o('willow',x,y,i));
  for(let k=0;k<6;k++){const a=k/6*TAU+0.52;o('slamp',POND.x+Math.cos(a)*(POND.rx*1.48),POND.y+Math.sin(a)*(POND.ry*1.48)+0.25,k)}
  o('lantern',11.15,45.7);o('lantern',14.85,45.7);o('flag',11.2,43.6,W.mi);o('flag',14.8,43.6,(W.mi+1)%6);
  o('board',14.7,49.5);o('well',19.4,56.4);o('rockery',13.9,49.15);o('censer',9,47.5);
  o('dummy',19.7,47.1);o('dummy',20.4,47.9,1);o('drum',15.4,47.6,W.mi);o('anvil',5.7,47.1);
  o('haystack',5.4,49.8);o('haystack',5.6,50.6,1);o('cart',19.8,61.1);o('crate',14.4,60.6);o('crate',14.0,61.2,1);o('sign',19.6,59.3);
  o('lion',2.9,60.9);o('lion',5.1,60.9,1);o('chestD',6.4,60.4);o('chestD',6.9,61.1,1);
  [[2.5,46.5],[6.6,46.3],[11.2,47.7],[14.6,52.8],[7.3,53.7],[19.8,50.6],[2.6,52.3],[7.2,60.8],[13.8,57.4],[10.7,61.0],[19.9,44.0],[20.5,55.2]].forEach(([x,y],i)=>o(i%3===1?'pot':'bush',x,y,i));
  // ánh đèn, nhãn tên, cá chép
  W.lights=[];W.labels=[];W.koi=[];
  for(const b of BLD){const fx=(b.x+b.w/2)*T,fy=(b.y+b.h)*T;W.labels.push({x:fx+b.h*T*BK*0.5,y:fy-(b.k==='pagoda'?262:BPL+b.H+b.h*T*0.5+52),txt:b.name});
    if(b.k!=='pagoda'){const hw=b.w*T/2+12,ly=fy-BPL-b.H+20;W.lights.push({x:fx-hw,y:ly,r:26,col:'#ff8a3a'},{x:fx+hw,y:ly,r:26,col:'#ff8a3a'})}}
  const fg=BLD_BY.forge;W.lights.push({x:(fg.x+fg.w/2)*T,y:(fg.y+fg.h)*T-BPL-24,r:60,col:'#ff6a1a',forge:1});
  W.lights.push({x:11.15*T+16,y:45.7*T-64,r:22,col:'#ff5a3a'},{x:14.85*T+16,y:45.7*T-64,r:22,col:'#ff5a3a'});
  for(let k=0;k<6;k++){const a=k/6*TAU+0.52;W.lights.push({x:(POND.x+Math.cos(a)*POND.rx*1.48)*T,y:(POND.y+Math.sin(a)*POND.ry*1.48+0.25)*T-34,r:18,col:'#ffd27a'})}
  for(let k=0;k<6;k++)W.koi.push({a:k*1.1,r:0.35+(k%3)*0.17,sp:(k%2?1:-1)*(0.25+k*0.04),col:['#ff7a2a','#fff2e0','#ff5a3a','#ffd27a','#fff2e0','#ff8a3a'][k]});
}
function townNpcs(W){const n=(id,name,x,y,look,act,ex)=>Object.assign({id,name,x:x*T,y:y*T,look,act},ex||{});
  return[n('ren','Thợ Rèn',4,46.75,'smith','forge'),n('cho','Thương Nhân',17.8,50.8,'merchant','shop'),n('lao','Lão Trượng',9,46.6,'elder','quest'),
    n('xa','Xa Phu',17,60.75,'driver','map'),n('ma','Mã Phu',3.9,51.8,'merchant','mount',{horse:1}),n('vo','Sư Phụ',17,46.75,'master','skill'),n('kho','Thủ Khố',4,60.75,'banker','bag')]}

/* ---------- mặt đất thành ---------- */
function drawTownGround(W,g,x0,y0,x1,y1){
  const s=W.M.seed,X0=TOWN.x0*T,Y0=TOWN.y0*T,X1=(TOWN.x1+1)*T,Y1=(TOWN.y1+1)*T;
  const cx0=Math.max(X0,x0*T),cy0=Math.max(Y0,y0*T),cx1=Math.min(X1,(x1+1)*T),cy1=Math.min(Y1,(y1+1)*T);if(cx0>=cx1||cy0>=cy1)return;
  g.save();g.beginPath();g.rect(cx0,cy0,cx1-cx0,cy1-cy0);g.clip();
  // vữa nền
  g.fillStyle='#9d916f';g.fillRect(X0,Y0,X1-X0,Y1-Y0);
  // đá lát hàng so le
  const ST=['#cfc3a2','#c6b996','#d6cbae','#bdb08c','#cbbd97','#d2c6a6'];
  let y=Y0+T,row=0;while(y<Y1-T){const rh=22+Math.floor(hash2(row,3,s)*6);
    if(y+rh>=cy0&&y<=cy1){let x=X0+T-hash2(row,7,s)*30,c=0;while(x<X1-T){const w=26+Math.floor(hash2(row,c,s+2)*22);
        if(x+w>=cx0&&x<=cx1){const h=hash2(c,row,s+5);g.fillStyle=ST[Math.floor(h*ST.length)];g.beginPath();g.roundRect(x+1,y+1,w-2,rh-2,3);g.fill();
          g.fillStyle='rgba(255,255,240,0.2)';g.fillRect(x+3,y+2,w-6,1.5);g.fillStyle='rgba(60,45,20,0.14)';g.fillRect(x+3,y+rh-3.5,w-6,1.5);
          if(h>0.9){g.strokeStyle='rgba(70,55,30,0.35)';g.lineWidth=0.8;g.beginPath();g.moveTo(x+w*0.3,y+3);g.lineTo(x+w*0.45,y+rh*0.5);g.lineTo(x+w*0.4,y+rh-3);g.stroke()}
          if(h<0.06){g.fillStyle='rgba(90,120,50,0.45)';g.beginPath();g.ellipse(x+w/2,y+rh/2,w*0.3,rh*0.25,0,0,TAU);g.fill()}}
        x+=w;c++}}
    y+=rh;row++}
  // cỏ chân tường
  g.fillStyle='#6f8f46';const gi=(TOWN.x0+1)*T,gj=(TOWN.y0+1)*T,ge=TOWN.x1*T,gk=TOWN.y1*T;
  g.fillRect(gi,gk-10,ge-gi,10);g.fillRect(gi,gj,8,gk-gj);g.fillRect(ge-8,gj,8,gk-gj);
  g.fillStyle='#86a854';for(let i=0;i<60;i++){const h=hash2(i,1,s+70);const px=gi+h*(ge-gi),py=gk-6;g.beginPath();g.arc(px,py,3+hash2(i,2,s)*3,0,TAU);g.fill()}
  // sân tròn quanh hồ
  const px=POND.x*T,py=POND.y*T,rx=POND.rx*T,ry=POND.ry*T;
  g.fillStyle='#8e8166';g.beginPath();g.ellipse(px,py,rx*1.5+3,ry*1.5+3,0,0,TAU);g.fill();
  g.fillStyle='#ddd3b9';g.beginPath();g.ellipse(px,py,rx*1.5,ry*1.5,0,0,TAU);g.fill();
  g.strokeStyle='rgba(120,105,75,0.55)';g.lineWidth=1.2;for(let k=0;k<64;k++){const a=k/64*TAU;g.beginPath();g.moveTo(px+Math.cos(a)*rx*1.08,py+Math.sin(a)*ry*1.08);g.lineTo(px+Math.cos(a)*rx*1.5,py+Math.sin(a)*ry*1.5);g.stroke()}
  g.beginPath();g.ellipse(px,py,rx*1.29,ry*1.29,0,0,TAU);g.stroke();
  g.strokeStyle='rgba(255,255,240,0.35)';g.beginPath();g.ellipse(px,py,rx*1.47,ry*1.47,0,0,TAU);g.stroke();
  // nước
  g.fillStyle='#7d7568';g.beginPath();g.ellipse(px,py,rx+8,ry+8,0,0,TAU);g.fill();
  const wg=g.createRadialGradient(px-rx*0.2,py-ry*0.3,10,px,py,rx);wg.addColorStop(0,'#55c7b8');wg.addColorStop(0.7,'#2d9c96');wg.addColorStop(1,'#1b6c6e');
  g.fillStyle=wg;g.beginPath();g.ellipse(px,py,rx,ry,0,0,TAU);g.fill();
  g.strokeStyle='rgba(10,50,50,0.35)';g.lineWidth=6;g.beginPath();g.ellipse(px,py+2,rx-4,ry-4,0,Math.PI*1.05,Math.PI*1.95);g.stroke();
  // lá sen, hoa sen
  for(let i=0;i<26;i++){const a=hash2(i,4,s)*TAU,r=0.45+hash2(i,5,s)*0.48,lx=px+Math.cos(a)*rx*r,ly=py+Math.sin(a)*ry*r;
    if(Math.abs(ly-py)<T*1.05||Math.abs(lx-px)<T*1.05||Math.hypot(lx-px,ly-py)<POND.st*T+10)continue;
    const lr=7+hash2(i,6,s)*6,rot=hash2(i,7,s)*TAU;g.fillStyle=i%3?'#4e8f3a':'#5fa344';g.beginPath();g.ellipse(lx,ly,lr,lr*0.7,0,rot,rot+TAU-0.6);g.lineTo(lx,ly);g.closePath();g.fill();
    g.strokeStyle='rgba(20,60,20,0.4)';g.lineWidth=0.8;g.beginPath();g.moveTo(lx,ly);g.lineTo(lx+Math.cos(rot+1.5)*lr*0.8,ly+Math.sin(rot+1.5)*lr*0.55);g.stroke();
    if(i%4===0){g.fillStyle='#f7a6bf';for(let p=0;p<5;p++){const pa=p/5*TAU;g.beginPath();g.ellipse(lx+Math.cos(pa)*2.6,ly-3+Math.sin(pa)*1.6,2.6,1.6,pa,0,TAU);g.fill()}g.fillStyle='#ffe28a';g.beginPath();g.arc(lx,ly-3,1.4,0,TAU);g.fill()}}
  // đá viền hồ
  for(let k=0;k<70;k++){const a=k/70*TAU,j=hash2(k,9,s);const bx=px+Math.cos(a)*(rx+4),by=py+Math.sin(a)*(ry+4);
    if(Math.abs(by-py)<T*0.95||Math.abs(bx-px)<T*0.95)continue;
    g.fillStyle=j>0.5?'#9a958a':'#868175';g.beginPath();g.ellipse(bx,by,7+j*4,5+j*2,a,0,TAU);g.fill();g.fillStyle='rgba(255,255,255,0.22)';g.beginPath();g.ellipse(bx-2,by-2,3,2,a,0,TAU);g.fill()}
  // cầu gỗ bốn hướng
  const deck=(x,y,w,h,horiz)=>{g.fillStyle='rgba(0,0,0,0.25)';g.fillRect(x+3,y+5,w,h);g.fillStyle='#9a6c42';g.fillRect(x,y,w,h);
    g.strokeStyle='#6c4528';g.lineWidth=1.4;g.beginPath();if(horiz){for(let i=x+6;i<x+w;i+=8){g.moveTo(i,y+3);g.lineTo(i,y+h-3)}}else{for(let i=y+6;i<y+h;i+=8){g.moveTo(x+3,i);g.lineTo(x+w-3,i)}}g.stroke();
    g.fillStyle='#5a3a20';if(horiz){g.fillRect(x,y,w,5);g.fillRect(x,y+h-5,w,5)}else{g.fillRect(x,y,5,h);g.fillRect(x+w-5,y,5,h)}
    g.fillStyle='#c24a32';const step=26;if(horiz){for(let i=x+4;i<x+w;i+=step){g.fillRect(i,y-2,5,7);g.fillRect(i,y+h-5,5,7)}}else{for(let i=y+4;i<y+h;i+=step){g.fillRect(x-2,i,7,5);g.fillRect(x+w-5,i,7,5)}}
    g.fillStyle='rgba(255,230,190,0.18)';if(horiz)g.fillRect(x,y+5,w,4);else g.fillRect(x+5,y,4,h)};
  deck(px-rx-14,py-T*0.85,rx*2+28,T*1.7,1);deck(px-T*0.85,py-ry-14,T*1.7,ry*2+28,0);
  // lôi đài trống đồng
  const sr=POND.st*T;g.fillStyle='rgba(0,0,0,0.3)';g.beginPath();g.ellipse(px+4,py+7,sr,sr*0.92,0,0,TAU);g.fill();
  g.fillStyle='#6a4426';g.beginPath();g.arc(px,py,sr,0,TAU);g.fill();g.fillStyle='#b0824f';g.beginPath();g.arc(px,py,sr-6,0,TAU);g.fill();
  g.strokeStyle='rgba(90,55,25,0.55)';g.lineWidth=1.2;for(let r=sr-14;r>8;r-=9){g.beginPath();g.arc(px,py,r,0,TAU);g.stroke()}
  g.strokeStyle='rgba(201,162,78,0.75)';g.lineWidth=1.6;g.beginPath();g.arc(px,py,sr*0.36,0,TAU);g.stroke();g.beginPath();g.arc(px,py,sr*0.7,0,TAU);g.stroke();
  g.fillStyle='rgba(225,180,80,0.85)';g.beginPath();for(let i=0;i<14;i++){const a=i/14*TAU,a2=a+TAU/28;g.lineTo(px+Math.cos(a)*sr*0.33,py+Math.sin(a)*sr*0.33);g.lineTo(px+Math.cos(a2)*sr*0.1,py+Math.sin(a2)*sr*0.1)}g.closePath();g.fill();
  g.fillStyle='rgba(225,180,80,0.6)';for(let i=0;i<10;i++){const a=i/10*TAU;g.save();g.translate(px+Math.cos(a)*sr*0.53,py+Math.sin(a)*sr*0.53);g.rotate(a+Math.PI/2);g.beginPath();g.moveTo(-6,2);g.quadraticCurveTo(0,-5,7,-1);g.lineTo(2,1);g.lineTo(-1,5);g.closePath();g.fill();g.restore()}
  g.fillStyle='#e8c35a';for(let i=0;i<20;i++){const a=i/20*TAU;g.beginPath();g.arc(px+Math.cos(a)*(sr-3),py+Math.sin(a)*(sr-3),1.6,0,TAU);g.fill()}
  // sân trước cổng: đường đá lớn
  g.fillStyle='#b5a785';g.fillRect(12*T+4,(TOWN.y0)*T,2*T-8,T);g.fillRect(TOWN.x1*T,52*T+4,T,2*T-8);
  g.restore();
}

/* ---------- mái cong: dốc trước, dốc sau, hai hồi, bờ nóc, đầu đao ---------- */
function bRoof(g,x0,x1,yE,dep,rise,col,o){o=o||{};
  const dx=dep*BK,yB=yE-dep,yR=yE-dep*0.5-rise,ins=Math.min(dep*0.42,(x1-x0)*0.3),rL=x0+ins+dx*0.5,rR=x1-ins+dx*0.5,cu=o.curl||12,dk=shade(col,-0.5);
  g.lineJoin='round';
  g.fillStyle=shade(col,-0.3);g.beginPath();g.moveTo(x0+dx,yB);g.lineTo(x1+dx,yB);g.lineTo(rR,yR);g.lineTo(rL,yR);g.closePath();g.fill();
  g.fillStyle=shade(col,-0.14);g.beginPath();g.moveTo(x0,yE);g.lineTo(x0+dx,yB);g.lineTo(rL,yR);g.closePath();g.fill();
  g.fillStyle=shade(col,-0.36);g.beginPath();g.moveTo(x1+2,yE-cu*0.5);g.lineTo(x1+dx,yB);g.lineTo(rR,yR);g.closePath();g.fill();
  // dốc trước
  const front=()=>{g.beginPath();g.moveTo(x0-6,yE-cu);g.quadraticCurveTo(x0+8,yE+3,x0+26,yE+1);g.lineTo(x1-26,yE+1);g.quadraticCurveTo(x1-8,yE+3,x1+6,yE-cu);g.lineTo(rR,yR);g.lineTo(rL,yR);g.closePath()};
  const gr=g.createLinearGradient(0,yR,0,yE);gr.addColorStop(0,shade(col,0.16));gr.addColorStop(1,shade(col,-0.1));
  front();g.fillStyle=gr;g.fill();
  g.save();front();g.clip();
  if(o.thatch){g.strokeStyle=shade(col,-0.3);g.lineWidth=1;g.beginPath();for(let i=0;i<=40;i++){const t=i/40;g.moveTo(lerp(rL,rR,t),yR);g.lineTo(lerp(x0-6,x1+6,t)+(hash2(i,1,3)-0.5)*4,yE+2)}g.stroke();
    g.strokeStyle='rgba(255,240,190,0.35)';g.beginPath();for(let r=1;r<5;r++){const yy=lerp(yR,yE,r/5);g.moveTo(x0-10,yy);g.lineTo(x1+10,yy)}g.stroke()}
  else if(o.scale){// ngói vảy cá
    const rows=Math.ceil((yE-yR)/6)+1;for(let r=0;r<rows;r++){const yy=yR+r*6+4;const t=(yy-yR)/(yE-yR),xa=lerp(rL,x0-6,t),xb=lerp(rR,x1+6,t);
      g.fillStyle=r%2?shade(col,0.06):shade(col,-0.02);g.strokeStyle=shade(col,-0.42);g.lineWidth=0.8;for(let x=xa+(r%2)*3.5;x<xb;x+=7){g.beginPath();g.arc(x,yy,3.6,0,Math.PI);g.fill();g.stroke()}}}
  else{g.lineWidth=1.3;const n=Math.round((x1-x0)/7);g.strokeStyle=shade(col,-0.38);g.beginPath();for(let i=0;i<=n;i++){const t=i/n;g.moveTo(lerp(rL,rR,t),yR);g.quadraticCurveTo(lerp(lerp(rL,rR,t),lerp(x0,x1,t),0.5)+(t-0.5)*4,lerp(yR,yE,0.55),lerp(x0-4,x1+4,t),yE+2)}g.stroke();
    g.strokeStyle='rgba(255,255,255,0.12)';g.lineWidth=1;g.beginPath();for(let i=0;i<=n;i++){const t=(i+0.4)/n;g.moveTo(lerp(rL,rR,t),yR+2);g.lineTo(lerp(x0-4,x1+4,t),yE)}g.stroke();
    g.strokeStyle='rgba(0,0,0,0.12)';g.beginPath();for(let r=1;r<6;r++){const yy=lerp(yR,yE,r/6);g.moveTo(x0-10,yy);g.lineTo(x1+10,yy)}g.stroke()}
  g.restore();
  // mép mái, đầu ngói
  g.strokeStyle=dk;g.lineWidth=3.4;g.lineCap='round';g.beginPath();g.moveTo(x0-6,yE-cu);g.quadraticCurveTo(x0+8,yE+3,x0+26,yE+1);g.lineTo(x1-26,yE+1);g.quadraticCurveTo(x1-8,yE+3,x1+6,yE-cu);g.stroke();
  if(!o.thatch){g.fillStyle=shade(col,0.22);for(let x=x0+22;x<x1-22;x+=6.5){g.beginPath();g.arc(x,yE+2,1.8,0,TAU);g.fill()}}
  // bờ nóc, bờ dải
  g.strokeStyle=dk;g.lineWidth=3;g.beginPath();g.moveTo(rR,yR);g.lineTo(x1+4,yE-cu+2);g.moveTo(rL,yR);g.lineTo(x0-4,yE-cu+2);g.moveTo(rR,yR);g.lineTo(x1+dx,yB+2);g.stroke();
  g.lineWidth=6;g.beginPath();g.moveTo(rL-4,yR);g.lineTo(rR+4,yR);g.stroke();g.strokeStyle=shade(col,0.25);g.lineWidth=1.4;g.beginPath();g.moveTo(rL-2,yR-2);g.lineTo(rR+2,yR-2);g.stroke();
  // đầu đao cong vút ở góc
  const tip=(x,y,s)=>{g.fillStyle=dk;g.beginPath();g.moveTo(x,y+3);g.quadraticCurveTo(x+s*7,y-2,x+s*10,y-14);g.quadraticCurveTo(x+s*6,y-6,x-s*2,y-2);g.closePath();g.fill()};
  tip(x0-6,yE-cu,-1);tip(x1+6,yE-cu,1);
  // linh vật hai đầu nóc
  const orn=(x,s)=>{g.fillStyle=o.orn||'#2f5a4a';g.beginPath();g.moveTo(x,yR+2);g.quadraticCurveTo(x+s*2,yR-14,x+s*11,yR-15);g.quadraticCurveTo(x+s*5,yR-9,x+s*6,yR-4);g.lineTo(x+s*2,yR+2);g.closePath();g.fill();
    g.fillStyle='rgba(255,255,255,0.25)';g.beginPath();g.arc(x+s*7,yR-12,1.6,0,TAU);g.fill()};
  orn(rL-4,-1);orn(rR+4,1);
  if(o.pearl){g.fillStyle='#e8c35a';g.beginPath();g.arc((rL+rR)/2,yR-6,4,0,TAU);g.fill();g.fillStyle='#d4322a';g.beginPath();g.moveTo((rL+rR)/2,yR-16);g.lineTo((rL+rR)/2-3,yR-8);g.lineTo((rL+rR)/2+3,yR-8);g.fill()}
  return{yR,rL,rR}
}
/* đèn lồng treo */
function hLantern(g,x,y,c){g.strokeStyle='#3a2414';g.lineWidth=1;g.beginPath();g.moveTo(x,y-8);g.lineTo(x,y);g.stroke();
  g.fillStyle=c||'#d4322a';g.beginPath();g.ellipse(x,y+7,5.5,7.5,0,0,TAU);g.fill();g.fillStyle='rgba(255,220,140,0.45)';g.beginPath();g.ellipse(x-1.5,y+6,2,4.5,0,0,TAU);g.fill();
  g.fillStyle='#e8c35a';g.fillRect(x-3.5,y-1,7,2);g.fillRect(x-3.5,y+13,7,2);g.strokeStyle='#e8c35a';g.beginPath();g.moveTo(x,y+15);g.lineTo(x,y+21);g.stroke()}
/* biển hiệu sơn mài chữ vàng */
function plaque(g,x,y,txt,w){w=w||Math.max(54,txt.length*9.5+16);g.fillStyle='#2a1810';g.beginPath();g.roundRect(x-w/2-3,y-11,w+6,22,3);g.fill();g.strokeStyle='#c9a24e';g.lineWidth=1.6;g.beginPath();g.roundRect(x-w/2,y-8.5,w,17,2);g.stroke();
  g.fillStyle='#f0cf6a';g.font='400 12px "Yeseva One",Georgia,serif';g.textAlign='center';g.textBaseline='middle';g.fillText(txt,x,y+0.5);g.textBaseline='alphabetic'}
/* thân nhà: nền đá, mặt bên, mặt tiền với cột, khung, cửa, cửa sổ chấn song */
function bBody(g,fw,fd,H,o){
  const hw=fw/2,dx=fd*BK,top=-BPL-H;
  // bóng đổ
  g.fillStyle='rgba(20,15,5,0.28)';g.beginPath();g.moveTo(-hw-10,4);g.lineTo(hw+dx+26,4);g.lineTo(hw+dx+16,-fd*0.4);g.lineTo(-hw,-fd*0.2);g.closePath();g.fill();
  // nền đá
  g.fillStyle='#8a8272';g.beginPath();g.moveTo(hw+8,0);g.lineTo(hw+8+dx,-fd);g.lineTo(hw+8+dx,-fd-BPL);g.lineTo(hw+8,-BPL);g.closePath();g.fill();
  g.fillStyle='#d2c8b0';g.beginPath();g.moveTo(-hw-8,-BPL);g.lineTo(hw+8,-BPL);g.lineTo(hw+8+dx,-fd-BPL);g.lineTo(-hw-8+dx,-fd-BPL);g.closePath();g.fill();
  g.fillStyle='#aaa190';g.fillRect(-hw-8,-BPL,fw+16,BPL);g.strokeStyle='rgba(60,50,35,0.45)';g.lineWidth=1;g.beginPath();g.moveTo(-hw-8,-BPL/2);g.lineTo(hw+8,-BPL/2);
  for(let x=-hw-8;x<hw+8;x+=18){g.moveTo(x+((x/18|0)%2)*9,-BPL);g.lineTo(x+((x/18|0)%2)*9,-BPL/2);g.moveTo(x+9,-BPL/2);g.lineTo(x+9,0)}g.stroke();
  g.fillStyle='rgba(255,255,255,0.3)';g.fillRect(-hw-8,-BPL,fw+16,1.5);
  if(!o.noSteps){g.fillStyle='#bdb39c';for(let i=0;i<3;i++){g.fillRect(-26+i*3,-BPL+i*4,52-i*6,4)}g.fillStyle='#d8cfb8';g.fillRect(-30,2,60,4);g.fillStyle='rgba(0,0,0,0.15)';g.fillRect(-30,5,60,1)}
  // mặt bên
  const wall=o.wall||'#e2cf9c',wallD=shade(wall,-0.28),col=o.col||'#8e2a1e';
  g.fillStyle=wallD;g.beginPath();g.moveTo(hw,-BPL);g.lineTo(hw+dx,-BPL-fd);g.lineTo(hw+dx,top-fd);g.lineTo(hw,top);g.closePath();g.fill();
  g.strokeStyle=shade(col,-0.25);g.lineWidth=4;g.beginPath();g.moveTo(hw+dx*0.5,-BPL-fd*0.5);g.lineTo(hw+dx*0.5,top-fd*0.5);g.stroke();
  if(o.sideWin!==false){g.fillStyle='#4a3020';g.beginPath();g.moveTo(hw+dx*0.2,top+H*0.35-fd*0.2);g.lineTo(hw+dx*0.4,top+H*0.35-fd*0.4);g.lineTo(hw+dx*0.4,top+H*0.7-fd*0.4);g.lineTo(hw+dx*0.2,top+H*0.7-fd*0.2);g.closePath();g.fill()}
  // mặt tiền
  if(o.stone){g.fillStyle=wall;g.fillRect(-hw,top,fw,H);g.strokeStyle='rgba(50,45,35,0.4)';g.lineWidth=1;g.beginPath();for(let y=top+10,r=0;y<-BPL;y+=10,r++){g.moveTo(-hw,y);g.lineTo(hw,y);for(let x=-hw+(r%2)*11;x<hw;x+=22){g.moveTo(x,y-10);g.lineTo(x,y)}}g.stroke();
    g.fillStyle='rgba(255,255,255,0.12)';g.fillRect(-hw,top,fw,3)}
  else{const wg=g.createLinearGradient(0,top,0,-BPL);wg.addColorStop(0,shade(wall,-0.12));wg.addColorStop(0.3,wall);wg.addColorStop(1,shade(wall,-0.06));g.fillStyle=wg;g.fillRect(-hw,top,fw,H)}
  // cột
  const n=o.cols||Math.max(3,Math.round(fw/46)+1),xs=[];for(let i=0;i<n;i++)xs.push(lerp(-hw+5,hw-5,i/(n-1)));
  // gian giữa: cửa; gian bên: cửa sổ
  for(let i=0;i<n-1;i++){const a=xs[i]+5,b=xs[i+1]-5,mid=(n-1)%2?(i===((n-1)>>1)):(i===((n-1)>>1)||i===((n-1)>>1)-1);const bw=b-a;
    if(o.open&&mid){g.fillStyle='#1d140d';g.fillRect(a,top+14,bw,H-14);if(o.inGlow){const ig=g.createRadialGradient((a+b)/2,-BPL-10,2,(a+b)/2,-BPL-10,bw*0.8);ig.addColorStop(0,o.inGlow);ig.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=ig;g.fillRect(a,top+14,bw,H-14)}continue}
    if(mid){g.fillStyle=o.door||'#7a2418';g.fillRect(a,top+16,bw,H-16);g.strokeStyle='rgba(0,0,0,0.4)';g.lineWidth=1.2;g.strokeRect(a+2,top+18,bw/2-3,H-20);g.strokeRect(a+bw/2+1,top+18,bw/2-3,H-20);
      g.fillStyle='#e8c35a';for(let r=0;r<4;r++)for(let c=0;c<2;c++){g.beginPath();g.arc(a+bw*(0.25+c*0.5),top+26+r*(H-30)/4,1.5,0,TAU);g.fill()}
      g.fillStyle='#c9a24e';g.beginPath();g.arc(a+bw/2-4,top+H*0.6,2,0,TAU);g.arc(a+bw/2+4,top+H*0.6,2,0,TAU);g.fill();continue}
    if(o.stone){g.fillStyle='#2a2420';g.fillRect(a+bw*0.25,top+H*0.32,bw*0.5,H*0.3);g.strokeStyle='#5a5048';g.lineWidth=2;g.beginPath();for(let k=1;k<4;k++){const x=a+bw*0.25+bw*0.5*k/4;g.moveTo(x,top+H*0.32);g.lineTo(x,top+H*0.62)}g.stroke();continue}
    // cửa sổ chấn song
    const wy=top+18,wh=H*0.5;g.fillStyle='#3a2416';g.fillRect(a+3,wy,bw-6,wh);g.fillStyle='#efe0bc';g.fillRect(a+5,wy+2,bw-10,wh-4);
    g.strokeStyle='#5a3420';g.lineWidth=1.3;g.beginPath();for(let x=a+5;x<b-5;x+=5){g.moveTo(x,wy+2);g.lineTo(x,wy+wh-2)}for(let y=wy+2;y<wy+wh-2;y+=6){g.moveTo(a+5,y);g.lineTo(b-5,y)}g.stroke();
    g.fillStyle='rgba(255,200,120,0.25)';g.fillRect(a+5,wy+2,bw-10,wh-4);
    g.fillStyle=shade(wall,-0.2);g.fillRect(a,wy+wh+6,bw,H-wh-24)}
  // cột son
  for(const x of xs){g.fillStyle=col;g.fillRect(x-4,top+6,8,H-6);g.fillStyle=shade(col,0.22);g.fillRect(x-4,top+6,2.5,H-6);g.fillStyle=shade(col,-0.35);g.fillRect(x+2,top+6,2,H-6);
    g.fillStyle='#8a8272';g.fillRect(x-6,-BPL-4,12,4);g.fillStyle='#c9a24e';g.fillRect(x-5,top+10,10,2)}
  // xà ngang + đấu củng
  g.fillStyle=shade(col,-0.2);g.fillRect(-hw-4,top,fw+8,12);g.fillStyle='#c9a24e';g.fillRect(-hw-4,top+4,fw+8,2);
  g.fillStyle=shade(col,0.1);for(let i=0;i<n;i++){g.fillRect(xs[i]-7,top-6,14,6)}
  if(o.band){g.fillStyle=o.band;g.fillRect(-hw-4,top+7,fw+8,4)}
  return{xs,top}
}
/* ---------- sprite các công trình và vật trang trí ---------- */
function drawTownObj(g,k,v,P){
  const roofC=ROOFC[v%6]||ROOFC[0];
  if(k.startsWith('b_')){const b=BLD_BY[k.slice(2)],fw=b.w*T,fd=b.h*T,H=b.H,hw=fw/2,top=-BPL-H,ov=20,yE=top+10;
    switch(b.k){
      case'forge':{bBody(g,fw,fd,H,{open:1,inGlow:'rgba(255,120,40,0.75)',wall:'#cdb98c',col:'#6e2a1a'});
        // lò lửa bên trong
        g.fillStyle='#4a3a30';g.beginPath();g.roundRect(-18,-BPL-30,36,26,6);g.fill();g.fillStyle='#ff8a2a';g.beginPath();g.ellipse(0,-BPL-14,11,7,0,0,TAU);g.fill();g.fillStyle='#ffd060';g.beginPath();g.ellipse(0,-BPL-14,6,4,0,0,TAU);g.fill();
        const r=bRoof(g,-hw-ov,hw+ov,yE,fd+18,30,roofC);
        // ống khói gạch
        const cxm=hw*0.45+fd*BK*0.5;g.fillStyle='#7a4a34';g.fillRect(cxm-8,r.yR-46,16,52);g.fillStyle='#5a3424';g.fillRect(cxm+3,r.yR-46,5,52);g.fillStyle='#3a2a20';g.fillRect(cxm-10,r.yR-50,20,6);
        g.strokeStyle='rgba(0,0,0,0.3)';g.lineWidth=1;g.beginPath();for(let y=r.yR-40;y<r.yR+4;y+=6){g.moveTo(cxm-8,y);g.lineTo(cxm+8,y)}g.stroke();
        // giá vũ khí bên trái
        g.save();g.translate(-hw-2,-2);g.fillStyle='#5a3a22';g.fillRect(-26,-34,4,34);g.fillRect(-2,-34,4,34);g.fillRect(-28,-30,32,3);g.fillRect(-28,-12,32,3);
        for(let i=0;i<4;i++){const x=-22+i*6;g.strokeStyle='#cfd5da';g.lineWidth=2;g.beginPath();g.moveTo(x,-2);g.lineTo(x+2,-46);g.stroke();g.fillStyle='#3a2414';g.fillRect(x-1,-8,4,8)}g.restore();
        plaque(g,0,top-2,b.name);hLantern(g,-hw-12,yE+4);hLantern(g,hw+12,yE+4);break}
      case'hall':{const bo=bBody(g,fw,fd,H,{wall:'#e3c88a',col:'#9a2a1c',door:'#8a2416',band:'#2f5a4a'});
        const r=bRoof(g,-hw-ov,hw+ov,yE,fd+18,24,'#8a4a30',{scale:1,orn:'#2f6a5a'});
        // tầng mái trên
        const uw=fw*0.36,uy=r.yR+2;g.fillStyle='#7a2418';g.fillRect(-uw+fd*BK*0.5,uy-20,uw*2,20);g.strokeStyle='#e8c35a';g.lineWidth=1;g.beginPath();for(let x=-uw+4;x<uw;x+=6){g.moveTo(x+fd*BK*0.5,uy-18);g.lineTo(x+fd*BK*0.5,uy-2)}g.stroke();
        bRoof(g,-uw-14+fd*BK*0.5,uw+14+fd*BK*0.5,uy-16,fd*0.5,22,'#8a4a30',{scale:1,orn:'#2f6a5a',pearl:1,curl:14});
        plaque(g,0,top-2,b.name);hLantern(g,-hw-12,yE+4);hLantern(g,hw+12,yE+4);break}
      case'dojo':{bBody(g,fw,fd,H,{wall:'#d8c49a',col:'#5a2a1a',open:1,inGlow:'rgba(255,200,120,0.25)'});
        // bên trong: giá binh khí
        g.strokeStyle='#cfd5da';g.lineWidth=1.6;for(let i=0;i<5;i++){g.beginPath();g.moveTo(-14+i*7,-BPL-4);g.lineTo(-12+i*7,top+20);g.stroke()}
        bRoof(g,-hw-ov,hw+ov,yE,fd+18,30,roofC);
        // cờ dài đỏ hai bên
        for(const s of[-1,1]){const x=s*(hw-16);g.fillStyle='#b8322a';g.beginPath();g.moveTo(x-7,top+10);g.lineTo(x+7,top+10);g.lineTo(x+7,top+56);g.lineTo(x,top+50);g.lineTo(x-7,top+56);g.closePath();g.fill();
          g.fillStyle='#f0cf6a';for(let i=0;i<3;i++){g.fillRect(x-2.5,top+18+i*10,5,5)}}
        plaque(g,0,top-2,b.name);hLantern(g,-hw-12,yE+4);hLantern(g,hw+12,yE+4);break}
      case'stable':{bBody(g,fw,fd,H,{wall:'#9a6c42',col:'#5a3a22',open:1,sideWin:false,cols:3,inGlow:'rgba(200,160,80,0.25)'});
        g.strokeStyle='rgba(60,35,15,0.55)';g.lineWidth=1;g.beginPath();for(let y=top+16;y<-BPL;y+=7){g.moveTo(-hw,y);g.lineTo(-hw+20,y);g.moveTo(hw-20,y);g.lineTo(hw,y)}g.stroke();
        g.fillStyle='#d7b25a';g.beginPath();g.ellipse(-hw*0.3,-BPL-6,18,8,0,Math.PI,TAU);g.fill();g.beginPath();g.ellipse(hw*0.35,-BPL-6,16,7,0,Math.PI,TAU);g.fill();
        bRoof(g,-hw-ov,hw+ov,yE,fd+18,26,'#b88a44',{thatch:1,orn:'#7a5a2a',curl:6});
        plaque(g,0,top-2,b.name);hLantern(g,hw+12,yE+4);
        // hàng rào trước
        g.fillStyle='#7a5432';for(let i=0;i<4;i++)g.fillRect(-hw-30+i*9,-22,4,22);g.fillRect(-hw-32,-17,34,3);g.fillRect(-hw-32,-8,34,3);break}
      case'market':{bBody(g,fw,fd,H,{wall:'#cdb88e',col:'#6a3a22',open:0,sideWin:false,cols:5});
        // quầy hàng thay cho cửa
        const n=4;for(let i=0;i<n;i++){const a=-hw+6+i*(fw-12)/n,w=(fw-12)/n-4;g.fillStyle='#1d140d';g.fillRect(a,top+14,w,H-14);
          const aw=['#c8361f','#2a8a80','#e2b24a','#5a7a2a'][i];g.fillStyle=aw;g.beginPath();g.moveTo(a-3,top+14);g.lineTo(a+w+3,top+14);g.lineTo(a+w+6,top+28);g.lineTo(a-6,top+28);g.closePath();g.fill();
          g.fillStyle='rgba(255,255,255,0.35)';for(let s=0;s<4;s++)g.fillRect(a+s*w/4,top+14,w/8,14);
          g.fillStyle='#8a6038';g.fillRect(a-2,-BPL-16,w+4,8);
          const goods=[['#d4322a','#f0a020','#7aa04a'],['#e8e0c8','#c9a24e','#3a6ad9'],['#a0522d','#cd853f','#deb887'],['#ff6a8a','#ffd23a','#9a5ad0']][i];
          for(let gI=0;gI<5;gI++){g.fillStyle=goods[gI%3];g.beginPath();g.arc(a+5+gI*(w-10)/4,-BPL-19,3.4,0,TAU);g.fill()}}
        bRoof(g,-hw-ov,hw+ov,yE,fd+18,22,roofC);plaque(g,0,top-2,b.name);hLantern(g,-hw-12,yE+4,'#e2b24a');hLantern(g,hw+12,yE+4,'#e2b24a');break}
      case'vault':{bBody(g,fw,fd,H,{wall:'#9c978c',col:'#4a4a4e',stone:1,door:'#3a2a1c'});
        bRoof(g,-hw-ov,hw+ov,yE,fd+18,28,roofC,{orn:'#c9a24e'});
        // biểu tượng đồng tiền
        g.fillStyle='#e8c35a';g.beginPath();g.arc(0,top-24,9,0,TAU);g.fill();g.fillStyle='#2a1810';g.fillRect(-3,top-27,6,6);
        plaque(g,0,top-2,b.name);hLantern(g,-hw-12,yE+4);hLantern(g,hw+12,yE+4);break}
      case'post':{bBody(g,fw,fd,H,{wall:'#d9c79e',col:'#6a3420',open:1,inGlow:'rgba(255,190,110,0.3)'});
        bRoof(g,-hw-ov,hw+ov,yE,fd+18,26,roofC);plaque(g,0,top-2,b.name);hLantern(g,-hw-12,yE+4);hLantern(g,hw+12,yE+4);
        g.fillStyle='#e8dcc0';g.beginPath();g.roundRect(-hw+8,top+20,22,30,2);g.fill();g.strokeStyle='#5a3a20';g.lineWidth=1;for(let i=0;i<4;i++){g.beginPath();g.moveTo(-hw+11,top+26+i*6);g.lineTo(-hw+27,top+26+i*6);g.stroke()}break}
      case'pagoda':{g.fillStyle='rgba(20,15,5,0.3)';g.beginPath();g.ellipse(14,0,70,14,0,0,TAU);g.fill();
        g.fillStyle='#aaa190';g.fillRect(-52,-14,104,14);g.fillStyle='#d2c8b0';g.fillRect(-52,-16,104,3);
        let y=-14,w=84;const rc='#2f6a5a';
        for(let i=0;i<5;i++){const h=28-i*2.5;g.fillStyle=i%2?'#e3c88a':'#d8bd80';g.fillRect(-w/2+6,y-h,w-12,h);g.fillStyle=shade('#e3c88a',-0.3);g.beginPath();g.moveTo(w/2-6,y);g.lineTo(w/2-6+14,y-14);g.lineTo(w/2-6+14,y-h-14);g.lineTo(w/2-6,y-h);g.closePath();g.fill();
          g.fillStyle='#8e2a1e';for(const x of[-w/2+6,0,w/2-6]){g.fillRect(x-2.5,y-h,5,h)}g.fillStyle='#3a2416';g.beginPath();g.roundRect(-7,y-h+6,14,h-6,[6,6,0,0]);g.fill();g.fillStyle='rgba(255,190,90,0.6)';g.fillRect(-4,y-h+10,8,h-12);
          y-=h;bRoof(g,-w/2-8,w/2+8,y+4,26,8+i,rc,{curl:12+i,orn:'#e8c35a'});y-=14;w-=11}
        g.strokeStyle='#e8c35a';g.lineWidth=3;g.beginPath();g.moveTo(6,y);g.lineTo(6,y-46);g.stroke();for(let i=0;i<5;i++){g.fillStyle='#e8c35a';g.beginPath();g.ellipse(6,y-8-i*7,6-i*0.8,2,0,0,TAU);g.fill()}
        g.fillStyle='#ffd96a';g.beginPath();g.arc(6,y-50,4,0,TAU);g.fill();break}
    }
    return}
  switch(k){
    case'twN':case'twS':{const WH=k==='twN'?58:26,tdp=30;const st=k==='twN'?'#8e8676':'#958d7d';
      g.fillStyle=st;g.fillRect(-25,-WH,50,WH);g.strokeStyle='rgba(40,35,28,0.45)';g.lineWidth=1;g.beginPath();for(let y=-WH+9,r=0;y<0;y+=9,r++){g.moveTo(-25,y);g.lineTo(25,y);for(let x=-25+(r%2)*8;x<25;x+=16){g.moveTo(x,y-9);g.lineTo(x,y)}}g.stroke();
      g.fillStyle='rgba(255,255,255,0.08)';for(let i=0;i<4;i++){const h=hash2(v,i,7);g.fillRect(-24+h*40,-WH+hash2(i,v,8)*(WH-8),10,8)}
      g.fillStyle='rgba(70,100,40,0.35)';g.beginPath();g.ellipse(-10+hash2(v,1,9)*20,-3,10,4,0,0,TAU);g.fill();
      g.fillStyle='#bdb5a2';g.fillRect(-25,-WH-tdp,50,tdp);g.fillStyle='rgba(0,0,0,0.12)';g.fillRect(-25,-WH-4,50,4);
      const my=k==='twN'?-WH-tdp:-WH;g.fillStyle='#a49c8a';g.fillRect(-25,my-4,50,5);g.fillStyle='#9a927f';for(const x of[-22,2]){g.fillRect(x,my-16,18,13)}g.fillStyle='#c9c1ad';for(const x of[-22,2])g.fillRect(x,my-16,18,2.5);break}
    case'twV':{const WH=58;g.fillStyle='#7d7666';g.fillRect(-15,-WH,30,WH);g.strokeStyle='rgba(40,35,28,0.45)';g.lineWidth=1;g.beginPath();for(let y=-WH+9;y<0;y+=9){g.moveTo(-15,y);g.lineTo(15,y)}g.stroke();
      g.fillStyle='#6a6456';g.beginPath();g.moveTo(15,0);g.lineTo(23,-6);g.lineTo(23,-WH-54);g.lineTo(15,-WH-48);g.closePath();g.fill();
      g.fillStyle='#bdb5a2';g.fillRect(-15,-WH-48,30,48);g.fillStyle='rgba(0,0,0,0.1)';g.fillRect(-15,-WH-48,30,2);
      const ex=v?11:-15;g.fillStyle='#9a927f';for(const y of[-WH-46,-WH-22]){g.fillRect(ex,y-12,4,12+0);g.fillRect(ex,y-12,4,16)}g.fillStyle='#a49c8a';g.fillRect(ex,-WH-48,4,48);break}
    case'twC':{const WH=82,w=36;g.fillStyle='rgba(0,0,0,0.25)';g.fillRect(-w,-6,w*2+14,8);g.fillStyle='#8a8272';g.fillRect(-w,-WH,w*2,WH);g.strokeStyle='rgba(40,35,28,0.45)';g.lineWidth=1;g.beginPath();for(let y=-WH+10,r=0;y<0;y+=10,r++){g.moveTo(-w,y);g.lineTo(w,y);for(let x=-w+(r%2)*9;x<w;x+=18){g.moveTo(x,y-10);g.lineTo(x,y)}}g.stroke();
      g.fillStyle='#6f685a';g.beginPath();g.moveTo(w,0);g.lineTo(w+12,-10);g.lineTo(w+12,-WH-10);g.lineTo(w,-WH);g.closePath();g.fill();
      g.fillStyle='#bdb5a2';g.fillRect(-w,-WH-40,w*2,40);g.fillStyle='#7a2418';g.fillRect(-w+8,-WH-34,w*2-16,26);g.fillStyle='#3a2416';g.fillRect(-8,-WH-30,16,22);
      bRoof(g,-w-10,w+10,-WH-30,44,16,ROOFC[v%6]||ROOFC[0],{curl:12});break}
    case'tgN':{const WH=58,hw=96;// hai khối tường + vòm cổng
      for(const s of[-1,1]){const x0=s<0?-hw-24:48;g.fillStyle='#8a8272';g.fillRect(x0,-WH-8,72,WH+8);g.strokeStyle='rgba(40,35,28,0.45)';g.lineWidth=1;g.beginPath();for(let y=-WH+2,r=0;y<0;y+=10,r++){g.moveTo(x0,y);g.lineTo(x0+72,y);for(let x=x0+(r%2)*9;x<x0+72;x+=18){g.moveTo(x,y-10);g.lineTo(x,y)}}g.stroke()}
      g.fillStyle='#8a8272';g.beginPath();g.moveTo(-48,-WH-8);g.lineTo(48,-WH-8);g.lineTo(48,-44);g.quadraticCurveTo(48,-74,0,-76);g.quadraticCurveTo(-48,-74,-48,-44);g.closePath();g.fill();
      g.strokeStyle='#5c564a';g.lineWidth=5;g.beginPath();g.moveTo(-48,0);g.lineTo(-48,-44);g.quadraticCurveTo(-48,-74,0,-76);g.quadraticCurveTo(48,-74,48,-44);g.lineTo(48,0);g.stroke();
      g.fillStyle='#bdb5a2';g.fillRect(-hw-24,-WH-40,hw*2+48,32);
      // lầu cổng
      const lw=70;g.fillStyle='#8e2a1e';for(const x of[-lw,-lw/3,lw/3,lw]){g.fillRect(x-4,-WH-86,8,48)}g.fillStyle='#e3c88a';g.fillRect(-lw,-WH-60,lw*2,20);
      g.strokeStyle='#5a3420';g.lineWidth=1.2;g.beginPath();for(let x=-lw+4;x<lw;x+=6){g.moveTo(x,-WH-58);g.lineTo(x,-WH-42)}g.stroke();g.fillStyle='#7a2418';g.fillRect(-lw-6,-WH-42,lw*2+12,5);
      const r=bRoof(g,-lw-28,lw+28,-WH-80,52,20,ROOFC[v%6]||ROOFC[0],{curl:14});
      bRoof(g,-lw*0.55,lw*0.55+10,r.yR-6,30,16,ROOFC[v%6]||ROOFC[0],{curl:12,pearl:1});
      plaque(g,0,-WH-18,'Đại Việt',74);hLantern(g,-36,-34);hLantern(g,36,-34);break}
    case'tgE':{const WH=74;g.fillStyle='#8a8272';g.fillRect(-20,-WH,40,WH);g.fillStyle='#6f685a';g.fillRect(20,-WH-6,8,WH+6);g.fillStyle='#bdb5a2';g.fillRect(-20,-WH-44,40,44);
      g.fillStyle='#8e2a1e';g.fillRect(-14,-WH-40,6,30);g.fillRect(8,-WH-40,6,30);bRoof(g,-30,30,-WH-36,50,14,ROOFC[v%6]||ROOFC[0],{curl:10});hLantern(g,-22,-WH+4);break}
    case'willow':{const R=mulberry32(v*31+7);shadowE(g,34,9);g.fillStyle='#5a4030';g.beginPath();g.moveTo(-7,0);g.quadraticCurveTo(-4,-30,-10,-58);g.lineTo(6,-60);g.quadraticCurveTo(2,-30,7,0);g.closePath();g.fill();
      blob(g,-2,-78,30,'#4f7a2e');blob(g,-24,-70,22,'#4a7329');blob(g,22,-72,22,'#52802f');
      g.lineCap='round';for(let i=0;i<34;i++){const x=-44+i*2.7+R()*3,y0=-90+Math.abs(x)*0.4+R()*8,len=40+R()*42;g.strokeStyle=i%3?'#6a9a3a':'#86b44a';g.lineWidth=2.4;g.beginPath();g.moveTo(x,y0);g.quadraticCurveTo(x+4,y0+len*0.5,x+2+R()*4,y0+len);g.stroke()}
      for(let i=0;i<14;i++){blob(g,-30+R()*60,-96+R()*26,4+R()*4,'rgba(200,240,140,0.35)')}break}
    case'slamp':{shadowE(g,10,4);g.fillStyle='#8f8a7e';g.fillRect(-6,-14,12,14);g.fillRect(-9,-4,18,4);g.fillStyle='#a49f92';g.fillRect(-8,-30,16,16);g.fillStyle='#ffd27a';g.fillRect(-4,-26,8,8);
      g.fillStyle='#7d786c';g.beginPath();g.moveTo(-12,-30);g.quadraticCurveTo(0,-40,12,-30);g.closePath();g.fill();g.beginPath();g.arc(0,-41,3,0,TAU);g.fill();break}
    case'board':{shadowE(g,24,6);g.fillStyle='#5a3a22';g.fillRect(-26,-56,5,56);g.fillRect(21,-56,5,56);g.fillStyle='#8a6038';g.fillRect(-24,-52,48,30);
      g.fillStyle='#efe2bf';[[-20,-49,14,18],[-3,-48,10,13],[10,-50,11,20],[-4,-33,12,9]].forEach(([x,y,w,h])=>{g.fillRect(x,y,w,h)});g.fillStyle='#c8361f';g.fillRect(-15,-47,4,4);g.fillRect(13,-48,4,4);
      g.strokeStyle='rgba(60,40,20,0.6)';g.lineWidth=0.7;g.beginPath();for(let i=0;i<4;i++){g.moveTo(-18,-42+i*3);g.lineTo(-8,-42+i*3)}g.stroke();
      bRoof(g,-32,32,-56,18,8,'#3d4756',{curl:6});break}
    case'well':{shadowE(g,24,7);g.fillStyle='#8f8a7e';g.beginPath();g.ellipse(0,-12,20,8,0,0,TAU);g.fill();g.fillRect(-20,-12,40,12);g.fillStyle='#1f4a4a';g.beginPath();g.ellipse(0,-12,14,5,0,0,TAU);g.fill();
      g.fillStyle='#5a3a22';g.fillRect(-20,-56,4,44);g.fillRect(16,-56,4,44);g.fillRect(-20,-48,40,3);g.strokeStyle='#3a2414';g.lineWidth=1;g.beginPath();g.moveTo(0,-46);g.lineTo(0,-30);g.stroke();g.fillStyle='#7a5432';g.fillRect(-4,-32,8,7);
      bRoof(g,-28,28,-56,18,10,'#4b3d33',{curl:6});break}
    case'rockery':{shadowE(g,36,8);[[-22,-10,16,'#8a8578'],[16,-12,18,'#7d786c'],[-4,-30,20,'#94907f'],[10,-46,13,'#8a8578'],[-14,-52,10,'#7d786c']].forEach(([x,y,r,c])=>{g.fillStyle=c;g.beginPath();g.ellipse(x,y,r,r*0.8,0.3,0,TAU);g.fill();g.fillStyle='rgba(255,255,255,0.18)';g.beginPath();g.ellipse(x-r*0.3,y-r*0.3,r*0.4,r*0.25,0.3,0,TAU);g.fill()});
      g.strokeStyle='#5a4030';g.lineWidth=3;g.beginPath();g.moveTo(-14,-60);g.quadraticCurveTo(-20,-70,-30,-72);g.stroke();blob(g,-32,-74,8,'#3f6a30');blob(g,-24,-78,7,'#4a7a36');blob(g,-12,-74,6,'#3f6a30');break}
    case'dummy':{shadowE(g,10,4);g.fillStyle='#7a5432';g.fillRect(-3,-50,6,50);g.fillRect(-14,-38,28,4);g.fillRect(-10,-26,20,4);g.fillStyle='#8a6038';g.beginPath();g.arc(0,-54,6,0,TAU);g.fill();g.fillStyle='#c8361f';g.fillRect(-4,-44,8,4);break}
    case'censer':{shadowE(g,16,5);g.fillStyle='#6a5a2a';g.fillRect(-12,-6,4,6);g.fillRect(8,-6,4,6);g.fillStyle='#8a7a3a';g.beginPath();g.ellipse(0,-12,15,9,0,0,Math.PI);g.fill();g.fillRect(-15,-20,30,8);
      g.fillStyle='#b0a050';g.beginPath();g.ellipse(0,-20,15,4,0,0,TAU);g.fill();g.strokeStyle='#8a7a3a';g.lineWidth=2.5;g.beginPath();g.arc(-15,-22,4,Math.PI*0.5,Math.PI*1.5);g.stroke();g.beginPath();g.arc(15,-22,4,-Math.PI*0.5,Math.PI*0.5);g.stroke();
      g.strokeStyle='#c8361f';g.lineWidth=1;for(let i=-1;i<=1;i++){g.beginPath();g.moveTo(i*4,-22);g.lineTo(i*4,-32);g.stroke()}break}
    case'lion':{shadowE(g,14,5);const s=v?-1:1;g.save();g.scale(s,1);g.fillStyle='#9a958a';g.fillRect(-12,-10,24,10);g.fillStyle='#8a857a';g.beginPath();g.ellipse(0,-20,10,11,0,0,TAU);g.fill();
      g.beginPath();g.arc(4,-32,8,0,TAU);g.fill();g.fillStyle='#7d786c';for(let i=0;i<5;i++){g.beginPath();g.arc(-2+i*2,-38+Math.abs(i-2),3,0,TAU);g.fill()}g.fillStyle='#2a2420';g.beginPath();g.arc(8,-33,1.3,0,TAU);g.fill();g.restore();break}
    case'crate':{shadowE(g,16,5);g.fillStyle='#8a6038';g.fillRect(-14,-24,28,24);g.fillStyle='#6a4426';g.beginPath();g.moveTo(14,0);g.lineTo(20,-5);g.lineTo(20,-29);g.lineTo(14,-24);g.closePath();g.fill();g.fillStyle='#a87848';g.beginPath();g.moveTo(-14,-24);g.lineTo(-8,-29);g.lineTo(20,-29);g.lineTo(14,-24);g.closePath();g.fill();
      g.strokeStyle='#4a2c16';g.lineWidth=1.4;g.strokeRect(-14,-24,28,24);g.beginPath();g.moveTo(-14,-24);g.lineTo(14,0);g.stroke();break}
    case'bush':{const R=mulberry32(v*17+3);for(let i=0;i<6;i++){blob(g,-16+R()*32,-8-R()*12,7+R()*5,i%2?'#4f7a2e':'#5d8a36')}for(let i=0;i<5;i++)blob(g,-14+R()*28,-12-R()*12,2.2,['#f6e27a','#ff9fb8','#ffffff','#e85a4a'][i%4]);break}
    case'pot':{shadowE(g,10,4);g.fillStyle='#3d6a8a';g.beginPath();g.moveTo(-10,-14);g.lineTo(10,-14);g.lineTo(7,0);g.lineTo(-7,0);g.closePath();g.fill();g.fillStyle='#e8e0cc';g.fillRect(-10,-14,20,3);
      g.strokeStyle='#5a4030';g.lineWidth=2;g.beginPath();g.moveTo(0,-14);g.quadraticCurveTo(-4,-24,-8,-28);g.stroke();blob(g,-9,-30,7,'#3f6a30');blob(g,2,-26,6,'#4a7a36');blob(g,6,-32,5,'#3f6a30');break}
    case'chestD':{shadowE(g,14,5);g.fillStyle='#7a3a1a';g.fillRect(-14,-18,28,18);g.fillStyle='#8a4a22';g.beginPath();g.moveTo(-14,-18);g.quadraticCurveTo(0,-28,14,-18);g.closePath();g.fill();g.fillStyle='#e8c35a';g.fillRect(-14,-12,28,3);g.fillRect(-2,-16,4,8);break}
    case'sign':{shadowE(g,10,4);g.fillStyle='#5a3a22';g.fillRect(-2,-70,4,70);g.fillStyle='#a87848';g.beginPath();g.moveTo(-4,-64);g.lineTo(22,-64);g.lineTo(28,-58);g.lineTo(22,-52);g.lineTo(-4,-52);g.closePath();g.fill();
      g.beginPath();g.moveTo(4,-46);g.lineTo(-20,-46);g.lineTo(-26,-40);g.lineTo(-20,-34);g.lineTo(4,-34);g.closePath();g.fill();g.fillStyle='#3a2414';g.fillRect(2,-59,16,2);g.fillRect(-18,-41,16,2);break}
  }
}
/* ---------- lớp động: cá chép, thác, khói, đèn, nhãn ---------- */
function drawTownUnder(left,top,vw,vh){const W=G.W;if(!W.koi)return;const px=POND.x*T,py=POND.y*T;if(px<left-200||px>left+vw+200||py<top-200||py>top+vh+200)return;
  for(const k of W.koi){const a=k.a+G.t*k.sp,rx=POND.rx*T*(0.55+k.r*0.6),ry=POND.ry*T*(0.55+k.r*0.6);let x=px+Math.cos(a)*rx,y=py+Math.sin(a)*ry;
    if(Math.hypot(x-px,y-py)<POND.st*T+6)continue;const dir=a+(k.sp>0?Math.PI/2:-Math.PI/2),dx=-Math.sin(a)*rx*Math.sign(k.sp),dy=Math.cos(a)*ry*Math.sign(k.sp),ang=Math.atan2(dy,dx);
    cx.save();cx.translate(x,y);cx.rotate(ang);cx.globalAlpha=0.85;cx.fillStyle='rgba(0,40,40,0.25)';cx.beginPath();cx.ellipse(-1,3,8,3,0,0,TAU);cx.fill();
    cx.fillStyle=k.col;cx.beginPath();cx.ellipse(0,0,7,2.8,0,0,TAU);cx.fill();const w=Math.sin(G.t*8+k.a)*0.5;cx.beginPath();cx.moveTo(-6,0);cx.lineTo(-11,-3+w*2);cx.lineTo(-11,3+w*2);cx.closePath();cx.fill();
    if(k.col==='#fff2e0'){cx.fillStyle='#ff6a2a';cx.beginPath();cx.arc(2,0,1.8,0,TAU);cx.fill()}cx.restore()}cx.globalAlpha=1}
function townDyn(o){
  if(o.k==='rockery'){const x=o.x+2,y0=o.y-40,y1=o.y-4;cx.strokeStyle='rgba(220,250,255,0.75)';cx.lineWidth=5;cx.beginPath();cx.moveTo(x,y0);cx.quadraticCurveTo(x+4,(y0+y1)/2,x+2,y1);cx.stroke();
    cx.strokeStyle='rgba(255,255,255,0.9)';cx.lineWidth=1.4;cx.beginPath();for(let i=0;i<3;i++){const ph=((G.t*1.6+i/3)%1);const yy=lerp(y0,y1,ph);cx.moveTo(x-1+i,yy);cx.lineTo(x-1+i,yy+6)}cx.stroke();
    if(Math.random()<0.2)addPart(x+rand(-5,5),y1,rand(-15,15),rand(-30,-10),0.4,'#e8fbff',2,120)}
  else if(o.k==='b_forge'&&Math.random()<0.12){const b=BLD_BY.forge;addPart(o.x+b.w*T*0.225+b.h*T*BK*0.5+rand(-3,3),o.y-BPL-b.H-b.h*T*0.5-60,rand(-8,8),rand(-40,-25),2.2,'#8f877a',rand(5,8),-6)}
}
function drawTownLights(left,top,vw,vh){const W=G.W;if(!W.lights)return;
  cx.save();cx.globalCompositeOperation='lighter';
  for(const l of W.lights){if(l.x<left-80||l.x>left+vw+80||l.y<top-80||l.y>top+vh+80)continue;const fl=l.forge?0.55+Math.sin(G.t*9)*0.15+Math.random()*0.1:0.42+Math.sin(G.t*2.5+l.x)*0.08;glow(l.x,l.y,l.r,l.col,fl)}
  cx.restore();cx.globalAlpha=1}
function drawTownLabels(left,top,vw,vh){const W=G.W;if(!W.labels)return;cx.font='700 12px "Be Vietnam Pro",system-ui,sans-serif';cx.textAlign='center';cx.textBaseline='middle';
  for(const l of W.labels){if(l.x<left-80||l.x>left+vw+80||l.y<top-30||l.y>top+vh+30)continue;const w=cx.measureText(l.txt).width+18;
    cx.fillStyle='rgba(28,20,14,0.78)';cx.beginPath();cx.roundRect(l.x-w/2,l.y-11,w,22,11);cx.fill();cx.strokeStyle='rgba(226,178,74,0.55)';cx.lineWidth=1.2;cx.stroke();
    cx.fillStyle='#f6ead2';cx.fillText(l.txt,l.x,l.y+0.5)}cx.textBaseline='alphabetic'}

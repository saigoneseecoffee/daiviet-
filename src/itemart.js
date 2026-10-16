/* ============ TRANH VẼ TRANG BỊ (vẽ thủ tục, có ánh kim, vân gỗ, ngọc) ============ */
/* 6 bậc chất liệu: đồng Đông Sơn, sắt, thép, thép mạ vàng, ngọc, rồng vàng */
const TIERMAT=[
  {m:'#b4874e',pat:'#5f8f74',trim:'#c99a4a',wood:'#7a5230',cloth:'#7a5a3a',cord:'#8a3a22'},
  {m:'#7f868c',trim:'#a08a62',wood:'#5e3c22',cloth:'#5a4a3a',cord:'#7a2a1e'},
  {m:'#b9c4cb',trim:'#c9a24e',wood:'#4a2e18',cloth:'#3a3a56',cord:'#a82a1e'},
  {m:'#d0dade',trim:'#dcb24a',wood:'#3a2414',cloth:'#8a1f18',cord:'#c8361f',gem:'#d4322a'},
  {m:'#e0e8ec',trim:'#e6bf58',wood:'#2c1a10',cloth:'#1f4f3c',cord:'#c8361f',gem:'#2fae7a',jade:'#5fc79a'},
  {m:'#f4e4b0',trim:'#f0c040',wood:'#2a120c',cloth:'#8a1a14',cord:'#e23a1a',gem:'#ff4a2a',glow:'#ffcf5a',jade:'#ff9a5a'},
];
function _lg(g,x0,y0,x1,y1,st){const gr=g.createLinearGradient(x0,y0,x1,y1);for(const[o,c]of st)gr.addColorStop(o,c);return gr}
function _rg(g,x,y,r0,r1,st,ox,oy){const gr=g.createRadialGradient(x+(ox||0),y+(oy||0),r0,x,y,r1);for(const[o,c]of st)gr.addColorStop(o,c);return gr}
const metalSt=b=>[[0,shade(b,-0.6)],[0.28,shade(b,-0.12)],[0.46,shade(b,0.62)],[0.6,b],[1,shade(b,-0.5)]];
const goldSt=b=>[[0,shade(b,-0.55)],[0.35,b],[0.5,shade(b,0.6)],[0.7,b],[1,shade(b,-0.45)]];
const woodSt=b=>[[0,shade(b,-0.45)],[0.4,shade(b,0.18)],[0.6,b],[1,shade(b,-0.5)]];
const IOL='rgba(20,10,4,0.9)';
function gem(g,x,y,r,col){g.fillStyle=_rg(g,x,y,0.5,r,[[0,shade(col,0.75)],[0.4,col],[1,shade(col,-0.55)]],-r*0.35,-r*0.35);g.strokeStyle=IOL;g.lineWidth=0.9;g.beginPath();g.arc(x,y,r,0,TAU);g.fill();g.stroke();
  g.fillStyle='rgba(255,255,255,0.85)';g.beginPath();g.arc(x-r*0.35,y-r*0.38,r*0.28,0,TAU);g.fill()}
function sparkle(g,x,y,s){g.save();g.globalCompositeOperation='lighter';g.fillStyle='#ffffff';g.beginPath();g.moveTo(x-s,y);g.lineTo(x,y-s*0.15);g.lineTo(x+s,y);g.lineTo(x,y+s*0.15);g.closePath();g.fill();
  g.beginPath();g.moveTo(x,y-s);g.lineTo(x+s*0.15,y);g.lineTo(x,y+s);g.lineTo(x-s*0.15,y);g.closePath();g.fill();g.restore()}
function cordWrap(g,x0,x1,h,base,line){g.fillStyle=_lg(g,0,-h,0,h,woodSt(base));g.strokeStyle=IOL;g.lineWidth=1;g.beginPath();g.roundRect(x0,-h,x1-x0,h*2,1.5);g.fill();g.stroke();
  g.strokeStyle=line;g.lineWidth=1.1;for(let x=x0+1;x<x1-1;x+=3){g.beginPath();g.moveTo(x,-h);g.lineTo(x+3,h);g.stroke();g.beginPath();g.moveTo(x+3,-h);g.lineTo(x,h);g.stroke()}}
function tassel(g,x,y,col,len,sway){g.strokeStyle=col;g.lineCap='round';for(let i=0;i<5;i++){g.lineWidth=1.3;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+(i-2)*1.5+(sway||0),y+len*0.5,x+(i-2)*2.6+(sway||0)*1.6,y+len);g.stroke()}
  g.fillStyle=shade(col,0.2);g.beginPath();g.arc(x,y,2.2,0,TAU);g.fill()}

/* ---------------- VŨ KHÍ ---------------- */
function artSword(g,M,tr){
  g.translate(50,52);g.rotate(-Math.PI/4);
  // dây tua ở chuôi
  g.save();g.translate(-36,0);g.rotate(Math.PI/4);tassel(g,0,0,M.cord,16,-3);g.restore();
  // chuôi
  cordWrap(g,-33,-15,3.2,tr>=4?'#2a1a10':'#3a2414',M.trim);
  g.fillStyle=_rg(g,-35,0,0.5,4.5,goldSt(M.trim),-1,-1);g.strokeStyle=IOL;g.lineWidth=1;g.beginPath();g.arc(-35,0,4.2,0,TAU);g.fill();g.stroke();
  g.fillStyle='#1a0e08';g.beginPath();g.arc(-35,0,1.6,0,TAU);g.fill();
  // lưỡi
  const L=tr===0?34:44,w=tr===0?6.5:5.2;
  g.save();g.shadowColor=M.glow||'transparent';g.shadowBlur=M.glow?6:0;
  g.fillStyle=_lg(g,0,-w,0,w,metalSt(M.m));g.strokeStyle=IOL;g.lineWidth=1.2;g.beginPath();
  if(tr===0){g.moveTo(-13,-w*0.6);g.quadraticCurveTo(8,-w*1.25,L-6,-w*0.45);g.lineTo(L,0);g.lineTo(L-6,w*0.45);g.quadraticCurveTo(8,w*1.25,-13,w*0.6)}
  else{g.moveTo(-13,-w*0.55);g.lineTo(L-8,-w*0.45);g.quadraticCurveTo(L-3,-w*0.4,L,0);g.quadraticCurveTo(L-3,w*0.4,L-8,w*0.45);g.lineTo(-13,w*0.55)}
  g.closePath();g.fill();g.stroke();g.restore();
  g.fillStyle='rgba(0,0,0,0.16)';g.beginPath();g.moveTo(-13,0);g.lineTo(L,0);g.lineTo(L-8,w*0.45);g.lineTo(-13,w*0.55);g.closePath();g.fill();
  g.strokeStyle='rgba(255,255,255,0.85)';g.lineWidth=0.8;g.beginPath();g.moveTo(-11,-w*0.42);g.lineTo(L-9,-w*0.34);g.stroke();
  g.strokeStyle=tr>=5?'#ff5a2a':'rgba(40,50,60,0.55)';g.lineWidth=tr>=5?1.4:0.9;g.beginPath();g.moveTo(-9,0);g.lineTo(L-12,0);g.stroke();
  if(tr===0){g.strokeStyle=M.pat;g.lineWidth=0.9;for(let i=0;i<4;i++){g.beginPath();g.moveTo(-8+i*4,-2.5);g.lineTo(-6+i*4,0);g.lineTo(-8+i*4,2.5);g.stroke()}}
  if(tr>=3){g.fillStyle=M.trim;g.beginPath();g.moveTo(-13,-w*0.55);g.lineTo(-6,-w*0.5);g.lineTo(-6,w*0.5);g.lineTo(-13,w*0.55);g.closePath();g.fill();g.strokeStyle=IOL;g.lineWidth=0.8;g.stroke()}
  // chắn kiếm
  g.fillStyle=_lg(g,-16,-12,-12,12,goldSt(tr<=1?shade(M.m,0.1):M.trim));g.strokeStyle=IOL;g.lineWidth=1.1;g.beginPath();
  if(tr<=1){g.ellipse(-14,0,2.6,7.5,0,0,TAU)}
  else if(tr<=3){g.moveTo(-16,-10);g.quadraticCurveTo(-11,-6,-12,0);g.quadraticCurveTo(-11,6,-16,10);g.lineTo(-13,10.5);g.quadraticCurveTo(-8,5,-9,0);g.quadraticCurveTo(-8,-5,-13,-10.5);g.closePath()}
  else{g.moveTo(-18,-13);g.quadraticCurveTo(-10,-8,-11,0);g.quadraticCurveTo(-10,8,-18,13);g.lineTo(-13,11);g.lineTo(-15,7);g.quadraticCurveTo(-7,4,-7,0);g.quadraticCurveTo(-7,-4,-15,-7);g.lineTo(-13,-11);g.closePath()}
  g.fill();g.stroke();if(M.gem)gem(g,-11.5,0,2.6,M.gem);
}
function artSaber(g,M,tr,flip){
  g.save();g.scale(1,flip?-1:1);
  cordWrap(g,-30,-15,2.8,'#2a1a10',M.trim);g.fillStyle=_rg(g,-31,0,0.5,3.6,goldSt(M.trim));g.beginPath();g.arc(-31.5,0,3.3,0,TAU);g.fill();
  g.fillStyle=_lg(g,-16,-8,-12,8,goldSt(M.trim));g.strokeStyle=IOL;g.lineWidth=1;g.beginPath();g.ellipse(-14,0,2.4,6.5,0,0,TAU);g.fill();g.stroke();
  g.fillStyle=_lg(g,0,-7,0,4,metalSt(M.m));g.beginPath();g.moveTo(-12,-2.6);g.quadraticCurveTo(12,-6,34,-14);g.quadraticCurveTo(30,-6,20,-1.5);g.quadraticCurveTo(6,2.8,-12,2.6);g.closePath();g.fill();g.stroke();
  g.strokeStyle='rgba(255,255,255,0.85)';g.lineWidth=0.8;g.beginPath();g.moveTo(-10,-1.8);g.quadraticCurveTo(12,-5,32,-13);g.stroke();
  if(tr>=5){g.strokeStyle='#ff4a2a';g.lineWidth=1.3;g.beginPath();g.moveTo(-8,0.4);g.quadraticCurveTo(10,-1,24,-6);g.stroke()}
  g.restore();
}
function artDual(g,M,tr){g.translate(50,52);g.save();g.rotate(-Math.PI/4);artSaber(g,M,tr,0);g.restore();g.save();g.rotate(-3*Math.PI/4);g.scale(1,-1);artSaber(g,M,tr,1);g.restore()}
function artSpear(g,M,tr){
  g.translate(50,50);g.rotate(-Math.PI/4);
  g.strokeStyle=IOL;g.lineWidth=6;g.lineCap='round';g.beginPath();g.moveTo(-50,0);g.lineTo(16,0);g.stroke();
  g.strokeStyle=_lg(g,0,-2.4,0,2.4,woodSt(M.wood));g.lineWidth=4.2;g.stroke();
  g.strokeStyle='rgba(0,0,0,0.25)';g.lineWidth=0.6;for(let x=-46;x<12;x+=7){g.beginPath();g.moveTo(x,-1);g.lineTo(x+5,-1.3);g.stroke()}
  g.strokeStyle=_lg(g,0,-3,0,3,goldSt(M.trim));g.lineWidth=5.4;g.lineCap='butt';for(const x of[-44,-20])g.beginPath(),g.moveTo(x,0),g.lineTo(x+3,0),g.stroke();
  // tua đỏ
  g.save();g.translate(17,0);for(let i=0;i<9;i++){g.strokeStyle=i%2?M.cord:shade(M.cord,-0.25);g.lineWidth=1.4;g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(-4,(i-4)*1.2,-14,(i-4)*2.4+4);g.stroke()}g.restore();
  // đốc
  g.fillStyle=_lg(g,0,-4,0,4,goldSt(tr>=3?M.trim:shade(M.m,-0.1)));g.strokeStyle=IOL;g.lineWidth=1;g.beginPath();g.moveTo(16,-3.4);g.lineTo(24,-2.6);g.lineTo(24,2.6);g.lineTo(16,3.4);g.closePath();g.fill();g.stroke();
  if(tr>=5){g.fillStyle=M.trim;g.beginPath();g.moveTo(18,-3.4);g.quadraticCurveTo(21,-8,25,-5);g.lineTo(23,-2.6);g.closePath();g.fill();g.stroke();gem(g,20,0,1.8,M.gem)}
  // lưỡi
  g.save();g.shadowColor=M.glow||'transparent';g.shadowBlur=M.glow?6:0;
  g.fillStyle=_lg(g,0,-7,0,7,metalSt(M.m));g.strokeStyle=IOL;g.lineWidth=1.2;g.beginPath();g.moveTo(24,-2.4);g.quadraticCurveTo(32,-7.5,40,-5);g.quadraticCurveTo(46,-2.5,52,0);g.quadraticCurveTo(46,2.5,40,5);g.quadraticCurveTo(32,7.5,24,2.4);g.closePath();g.fill();g.stroke();g.restore();
  g.fillStyle='rgba(0,0,0,0.16)';g.beginPath();g.moveTo(24,0);g.lineTo(52,0);g.quadraticCurveTo(46,2.5,40,5);g.quadraticCurveTo(32,7.5,24,2.4);g.closePath();g.fill();
  g.strokeStyle=tr>=5?'#ff5a2a':'rgba(50,60,70,0.6)';g.lineWidth=0.9;g.beginPath();g.moveTo(25,0);g.lineTo(49,0);g.stroke();
  if(tr>=3){g.fillStyle=_lg(g,0,-9,0,9,metalSt(M.m));g.strokeStyle=IOL;g.lineWidth=1;g.beginPath();g.moveTo(26,-3);g.quadraticCurveTo(26,-10,32,-12);g.quadraticCurveTo(29,-7,30,-4);g.closePath();g.fill();g.stroke();
    g.beginPath();g.moveTo(26,3);g.quadraticCurveTo(26,10,32,12);g.quadraticCurveTo(29,7,30,4);g.closePath();g.fill();g.stroke()}
}
function artStaff(g,M,tr){
  g.translate(50,50);g.rotate(-Math.PI/4);
  const wood=tr===0?'#b8a060':M.wood;
  g.strokeStyle=IOL;g.lineWidth=8.4;g.lineCap='round';g.beginPath();g.moveTo(-46,0);g.lineTo(46,0);g.stroke();
  g.strokeStyle=_lg(g,0,-3.5,0,3.5,woodSt(wood));g.lineWidth=6.2;g.stroke();
  if(tr===0){g.strokeStyle='rgba(60,50,20,0.7)';g.lineWidth=6.4;g.lineCap='butt';for(const x of[-30,-10,10,30]){g.beginPath();g.moveTo(x,0);g.lineTo(x+1.2,0);g.stroke()}}
  else{g.strokeStyle='rgba(0,0,0,0.25)';g.lineWidth=0.7;for(let x=-40;x<40;x+=6){g.beginPath();g.moveTo(x,-1.6+Math.sin(x)*0.6);g.lineTo(x+4,-1.2);g.stroke()}}
  g.lineCap='butt';
  const capC=tr>=3?M.trim:M.m;
  for(const[a,b]of[[-46,-37],[37,46]]){g.strokeStyle=IOL;g.lineWidth=8.8;g.beginPath();g.moveTo(a,0);g.lineTo(b,0);g.stroke();g.strokeStyle=_lg(g,0,-4,0,4,tr>=3?goldSt(capC):metalSt(capC));g.lineWidth=7;g.stroke()}
  if(tr>=2){g.strokeStyle=_lg(g,0,-4,0,4,goldSt(M.trim));g.lineWidth=7;for(const x of[-22,-3,18])g.beginPath(),g.moveTo(x,0),g.lineTo(x+2.4,0),g.stroke()}
  if(tr>=5){g.strokeStyle='#f0c040';g.lineWidth=2;g.beginPath();for(let x=-34;x<=34;x+=1){const y=Math.sin(x*0.35)*4.2;x===-34?g.moveTo(x,y):g.lineTo(x,y)}g.stroke();gem(g,-40,0,2.2,M.gem);gem(g,40,0,2.2,M.gem)}
}
function artBow(g,M,tr){
  const crossbow=tr===1||tr===5;g.translate(50,50);
  if(crossbow){g.rotate(-Math.PI/4);
    const stock=tr===5?M.trim:M.wood;
    g.fillStyle=_lg(g,0,-4,0,4,tr===5?goldSt(stock):woodSt(stock));g.strokeStyle=IOL;g.lineWidth=1.2;g.beginPath();g.moveTo(-40,-3);g.lineTo(26,-3);g.lineTo(30,0);g.lineTo(26,3);g.lineTo(-30,3);g.lineTo(-40,8);g.lineTo(-44,4);g.closePath();g.fill();g.stroke();
    g.fillStyle='#2a1a10';g.fillRect(-8,3,3,7);
    // cánh nỏ
    g.strokeStyle=IOL;g.lineWidth=5;g.beginPath();g.moveTo(18,-30);g.quadraticCurveTo(28,0,18,30);g.stroke();g.strokeStyle=_lg(g,10,0,30,0,tr===5?goldSt(M.trim):metalSt('#6a5a4a'));g.lineWidth=3.2;g.stroke();
    g.strokeStyle='#efe6d0';g.lineWidth=0.9;g.beginPath();g.moveTo(18,-30);g.lineTo(-6,0);g.lineTo(18,30);g.stroke();
    // tên nỏ
    g.strokeStyle='#5a3a20';g.lineWidth=1.6;g.beginPath();g.moveTo(-6,-1.2);g.lineTo(34,-1.2);g.stroke();g.fillStyle=_lg(g,0,-3,0,3,metalSt(M.m));g.beginPath();g.moveTo(40,-1.2);g.lineTo(33,-4);g.lineTo(33,1.6);g.closePath();g.fill();
    if(tr===5){// hoa văn mai rùa Kim Quy
      g.save();g.translate(-18,0);g.fillStyle=_rg(g,0,0,1,7,[[0,'#5fc79a'],[1,'#1f5a3a']]);g.strokeStyle=IOL;g.lineWidth=1;g.beginPath();g.ellipse(0,0,8,5.5,0,0,TAU);g.fill();g.stroke();
      g.strokeStyle='#f0c040';g.lineWidth=0.7;g.beginPath();for(let i=0;i<6;i++){const a=i/6*TAU;g.lineTo(Math.cos(a)*3.5,Math.sin(a)*2.4)}g.closePath();g.stroke();g.restore();gem(g,26,0,1.8,M.gem)}
    return}
  g.rotate(-Math.PI/4+Math.PI/2);
  const limbC=tr===0?'#b8a060':tr===2?'#4a3a2a':tr===3?'#8a1f18':'#2f5a3a';
  g.strokeStyle=IOL;g.lineWidth=6.4;g.lineCap='round';g.beginPath();g.moveTo(-36,-12);g.quadraticCurveTo(-22,6,-4,8);g.lineTo(4,8);g.quadraticCurveTo(22,6,36,-12);g.stroke();
  if(tr>=2){g.beginPath();g.moveTo(-36,-12);g.quadraticCurveTo(-40,-17,-43,-14);g.moveTo(36,-12);g.quadraticCurveTo(40,-17,43,-14);g.stroke()}
  g.strokeStyle=_lg(g,0,2,0,12,woodSt(limbC));g.lineWidth=4.4;g.beginPath();g.moveTo(-36,-12);g.quadraticCurveTo(-22,6,-4,8);g.lineTo(4,8);g.quadraticCurveTo(22,6,36,-12);g.stroke();
  if(tr>=2){g.beginPath();g.moveTo(-36,-12);g.quadraticCurveTo(-40,-17,-43,-14);g.moveTo(36,-12);g.quadraticCurveTo(40,-17,43,-14);g.stroke()}
  if(tr===0){g.strokeStyle='rgba(60,50,20,0.8)';g.lineWidth=4.6;g.lineCap='butt';for(const x of[-24,22]){g.beginPath();g.moveTo(x,0);g.lineTo(x+1,0.6);g.stroke()}}
  if(tr>=3){g.strokeStyle=M.trim;g.lineWidth=1.2;g.beginPath();g.moveTo(-30,-5);g.quadraticCurveTo(-18,7,-6,7.5);g.moveTo(30,-5);g.quadraticCurveTo(18,7,6,7.5);g.stroke()}
  g.strokeStyle=IOL;g.lineWidth=7.4;g.lineCap='butt';g.beginPath();g.moveTo(-5,8);g.lineTo(5,8);g.stroke();g.strokeStyle=_lg(g,0,5,0,11,goldSt(M.trim));g.lineWidth=5.6;g.stroke();
  // dây cung
  const ex=tr>=2?43:36,ey=tr>=2?-14:-12;g.strokeStyle='#f2ead6';g.lineWidth=0.9;g.beginPath();g.moveTo(-ex,ey);g.lineTo(0,-14);g.lineTo(ex,ey);g.stroke();
  // mũi tên
  g.strokeStyle='#6a4a2a';g.lineWidth=1.6;g.beginPath();g.moveTo(0,-14);g.lineTo(0,28);g.stroke();
  g.fillStyle=_lg(g,-3,0,3,0,metalSt(M.m));g.strokeStyle=IOL;g.lineWidth=0.8;g.beginPath();g.moveTo(0,34);g.lineTo(-3,26);g.lineTo(3,26);g.closePath();g.fill();g.stroke();
  g.fillStyle='#e8e0cc';g.beginPath();g.moveTo(0,-13);g.lineTo(-3.4,-18);g.lineTo(-3.4,-9);g.closePath();g.fill();g.fillStyle=M.cord;g.beginPath();g.moveTo(0,-13);g.lineTo(3.4,-18);g.lineTo(3.4,-9);g.closePath();g.fill();
}
function artTalisman(g,M,tr){
  g.translate(50,50);
  if(tr===0){g.rotate(-0.2);g.fillStyle=_lg(g,-12,0,12,0,[[0,'#d9c070'],[0.5,'#f2e29a'],[1,'#cfb05a']]);g.strokeStyle=IOL;g.lineWidth=1.2;g.beginPath();g.moveTo(-12,-30);g.lineTo(12,-30);g.quadraticCurveTo(14,0,12,30);g.lineTo(-12,30);g.quadraticCurveTo(-10,0,-12,-30);g.closePath();g.fill();g.stroke();
    g.strokeStyle='#c8361f';g.lineWidth=2;g.lineCap='round';g.beginPath();g.moveTo(-6,-22);g.lineTo(6,-22);g.moveTo(0,-26);g.lineTo(0,-6);g.moveTo(-7,-12);g.quadraticCurveTo(0,-4,7,-12);g.moveTo(-5,0);g.lineTo(5,2);g.moveTo(-6,8);g.quadraticCurveTo(4,10,-2,18);g.quadraticCurveTo(8,22,6,26);g.stroke();
    g.strokeStyle='#c8361f';g.lineWidth=1;g.strokeRect(-9,-28,18,56);return}
  if(tr===1){g.rotate(-0.5);for(let i=0;i<9;i++){const a=-1.25+i*0.31;g.fillStyle=i%2?'#f0e2b8':'#e0cc92';g.beginPath();g.moveTo(0,22);g.lineTo(Math.cos(a-Math.PI/2)*42,22+Math.sin(a-Math.PI/2)*42);g.lineTo(Math.cos(a+0.31-Math.PI/2)*42,22+Math.sin(a+0.31-Math.PI/2)*42);g.closePath();g.fill()}
    g.strokeStyle=IOL;g.lineWidth=1.2;g.beginPath();g.moveTo(0,22);for(let i=0;i<=9;i++){const a=-1.25+i*0.31-Math.PI/2;g.lineTo(Math.cos(a)*42,22+Math.sin(a)*42)}g.closePath();g.stroke();
    g.strokeStyle='#c8361f';g.lineWidth=1.2;g.beginPath();g.arc(0,22,32,-Math.PI/2-1.25,-Math.PI/2+1.54);g.stroke();g.beginPath();g.arc(0,22,20,-Math.PI/2-1.25,-Math.PI/2+1.54);g.stroke();
    g.fillStyle='#3a2414';g.beginPath();g.arc(0,22,3,0,TAU);g.fill();return}
  // ấn triện
  const base=tr===2?M.m:tr===3?'#c8d0d4':tr===4?M.jade:M.trim,st=tr===2||tr===5?goldSt(base):tr===4?[[0,shade(base,-0.5)],[0.4,base],[0.55,shade(base,0.5)],[1,shade(base,-0.45)]]:metalSt(base);
  // tua
  g.save();g.translate(14,-4);tassel(g,0,0,M.cord,24,4);g.restore();
  g.fillStyle=_lg(g,-22,0,22,0,st);g.strokeStyle=IOL;g.lineWidth=1.3;
  g.beginPath();g.moveTo(-22,8);g.lineTo(22,8);g.lineTo(24,28);g.lineTo(-24,28);g.closePath();g.fill();g.stroke();
  g.fillStyle=shade(base,-0.3);g.beginPath();g.moveTo(-24,28);g.lineTo(24,28);g.lineTo(24,32);g.lineTo(-24,32);g.closePath();g.fill();g.stroke();
  g.fillStyle='#c8361f';g.fillRect(-20,31,40,2);
  // núm ấn: rùa (bậc 2–3), rồng (bậc 4–5)
  g.fillStyle=_rg(g,0,0,1,22,st.map(([o,c])=>[o,c]),-6,-8);g.beginPath();
  if(tr<=3){g.ellipse(0,0,16,10,0,Math.PI,TAU);g.lineTo(16,8);g.lineTo(-16,8);g.closePath();g.fill();g.stroke();g.beginPath();g.ellipse(17,-1,5,4,0,0,TAU);g.fill();g.stroke();
    g.strokeStyle=shade(base,-0.45);g.lineWidth=0.8;g.beginPath();for(let i=0;i<6;i++){const a=Math.PI+i/5*Math.PI;g.lineTo(Math.cos(a)*9,Math.sin(a)*6)}g.stroke()}
  else{g.moveTo(-16,8);g.quadraticCurveTo(-18,-8,-6,-12);g.quadraticCurveTo(4,-22,12,-14);g.quadraticCurveTo(20,-12,16,-4);g.quadraticCurveTo(12,0,16,8);g.closePath();g.fill();g.stroke();
    g.strokeStyle=shade(base,-0.45);g.lineWidth=1;g.beginPath();g.moveTo(-10,0);g.quadraticCurveTo(-4,-8,4,-4);g.quadraticCurveTo(10,0,6,6);g.stroke();
    g.fillStyle=M.gem;g.beginPath();g.arc(10,-14,1.6,0,TAU);g.fill();g.strokeStyle=shade(base,0.4);g.lineWidth=1.2;g.beginPath();g.moveTo(8,-18);g.lineTo(4,-26);g.moveTo(12,-18);g.lineTo(14,-26);g.stroke()}
  g.fillStyle='rgba(255,255,255,0.35)';g.beginPath();g.ellipse(-8,-3,5,2,-0.4,0,TAU);g.fill();
}

/* ---------------- GIÁP & PHỤ KIỆN ---------------- */
function artHelm(g,M,tr){
  g.translate(50,56);
  if(tr===0){// khăn vấn
    for(let i=0;i<5;i++){g.fillStyle=i%2?shade(M.cloth,0.12):shade(M.cloth,-0.08);g.strokeStyle=IOL;g.lineWidth=1;g.beginPath();g.ellipse(0,-6-i*5,28-i*3,9-i*0.6,0,Math.PI*0.02,Math.PI*0.98,true);g.lineTo(-28+i*3,-6-i*5+3);g.ellipse(0,-3-i*5,28-i*3,9,0,Math.PI,0,true);g.closePath();g.fill();g.stroke()}
    g.fillStyle=_rg(g,0,-30,1,16,[[0,shade(M.cloth,0.3)],[1,M.cloth]]);g.beginPath();g.ellipse(0,-28,14,8,0,0,TAU);g.fill();g.stroke();return}
  if(tr===1){// nón lá sắt
    g.fillStyle=_lg(g,-36,0,36,0,metalSt(M.m));g.strokeStyle=IOL;g.lineWidth=1.3;g.beginPath();g.moveTo(-38,4);g.quadraticCurveTo(0,10,38,4);g.lineTo(0,-36);g.closePath();g.fill();g.stroke();
    g.strokeStyle='rgba(0,0,0,0.35)';g.lineWidth=0.8;for(let i=1;i<5;i++){const y=-36+i*8,w=i*7.6;g.beginPath();g.moveTo(-w,y);g.quadraticCurveTo(0,y+2,w,y);g.stroke()}
    g.fillStyle=M.trim;for(let i=-3;i<=3;i++){g.beginPath();g.arc(i*10,6+Math.abs(i)*-0.4,1.4,0,TAU);g.fill()}
    g.strokeStyle='#5a3a20';g.lineWidth=1.4;g.beginPath();g.moveTo(-14,6);g.quadraticCurveTo(0,26,14,6);g.stroke();return}
  // mũ trụ
  const tall=tr===4,base=tr===2?M.m:tr===5?M.trim:M.m,st=tr===2||tr===5?goldSt(base):metalSt(base);
  // tấm che cổ
  g.fillStyle=_lg(g,-30,0,30,0,st);g.strokeStyle=IOL;g.lineWidth=1.2;g.beginPath();g.moveTo(-28,-2);g.quadraticCurveTo(-34,14,-26,22);g.lineTo(-14,18);g.lineTo(-16,2);g.closePath();g.fill();g.stroke();
  g.beginPath();g.moveTo(28,-2);g.quadraticCurveTo(34,14,26,22);g.lineTo(14,18);g.lineTo(16,2);g.closePath();g.fill();g.stroke();
  if(tr>=3){g.strokeStyle=shade(base,-0.45);g.lineWidth=0.7;for(let y=4;y<20;y+=4){g.beginPath();g.moveTo(-30,y);g.lineTo(-16,y-1);g.moveTo(30,y);g.lineTo(16,y-1);g.stroke()}}
  // vòm
  g.fillStyle=_lg(g,-28,0,28,0,st);g.beginPath();
  if(tall){g.moveTo(-26,2);g.quadraticCurveTo(-26,-22,-8,-30);g.lineTo(0,-46);g.lineTo(8,-30);g.quadraticCurveTo(26,-22,26,2);g.closePath()}
  else{g.moveTo(-26,2);g.quadraticCurveTo(-27,-30,0,-32);g.quadraticCurveTo(27,-30,26,2);g.closePath()}
  g.fill();g.stroke();
  g.fillStyle='rgba(255,255,255,0.38)';g.beginPath();g.ellipse(-10,-16,4,10,0.35,0,TAU);g.fill();
  // vành
  g.fillStyle=_lg(g,0,-2,0,6,goldSt(tr===2?shade(M.m,0.1):M.trim));g.beginPath();g.roundRect(-30,-1,60,7,3);g.fill();g.stroke();
  for(let i=-2;i<=2;i++){g.fillStyle=shade(M.trim,0.4);g.beginPath();g.arc(i*11,2.5,1.4,0,TAU);g.fill()}
  // sống mũ
  g.strokeStyle=shade(base,-0.4);g.lineWidth=1.2;g.beginPath();g.moveTo(0,-1);g.lineTo(0,tall?-44:-31);g.stroke();
  if(tr===2){g.strokeStyle=M.pat;g.lineWidth=1;for(let i=0;i<5;i++){g.beginPath();g.arc(0,-14,6+i*0,0,TAU);g.stroke()}g.beginPath();g.arc(0,-14,9,0,TAU);g.stroke()}
  if(tr===3){g.fillStyle='#d4322a';g.beginPath();g.moveTo(0,-32);g.quadraticCurveTo(-18,-50,-30,-38);g.quadraticCurveTo(-16,-40,0,-28);g.fill();g.fillStyle=M.trim;g.fillRect(-1.6,-38,3.2,7)}
  if(tall){tassel(g,0,-46,M.cord,14,-3)}
  if(tr===5){g.fillStyle=_lg(g,0,-40,0,0,goldSt(M.trim));g.strokeStyle=IOL;g.lineWidth=1.1;
    g.beginPath();g.moveTo(-14,-24);g.quadraticCurveTo(-30,-40,-24,-52);g.quadraticCurveTo(-20,-38,-8,-28);g.closePath();g.fill();g.stroke();
    g.beginPath();g.moveTo(14,-24);g.quadraticCurveTo(30,-40,24,-52);g.quadraticCurveTo(20,-38,8,-28);g.closePath();g.fill();g.stroke()}
  if(M.gem)gem(g,0,-10,3.4,M.gem);
}
function artArmor(g,M,tr){
  g.translate(50,52);
  const body=tr===0?M.cloth:tr===1?'#7a5232':tr===2?M.m:tr===5?M.trim:M.m;
  // tay áo
  g.fillStyle=_lg(g,-40,0,-20,0,woodSt(tr<=1?body:M.cloth));g.strokeStyle=IOL;g.lineWidth=1.2;
  g.beginPath();g.moveTo(-18,-30);g.lineTo(-38,-14);g.lineTo(-32,6);g.lineTo(-20,-6);g.closePath();g.fill();g.stroke();
  g.beginPath();g.moveTo(18,-30);g.lineTo(38,-14);g.lineTo(32,6);g.lineTo(20,-6);g.closePath();g.fill();g.stroke();
  // thân
  const st=tr<=1?woodSt(body):tr===2||tr===5?goldSt(body):metalSt(body);
  g.fillStyle=_lg(g,-24,0,24,0,st);g.beginPath();g.moveTo(-18,-32);g.quadraticCurveTo(0,-26,18,-32);g.lineTo(22,-6);g.lineTo(26,30);g.quadraticCurveTo(0,36,-26,30);g.lineTo(-22,-6);g.closePath();g.fill();g.stroke();
  g.save();g.clip();
  if(tr===0){g.strokeStyle=shade(M.cloth,-0.3);g.lineWidth=3;g.beginPath();g.moveTo(-12,-30);g.lineTo(10,8);g.moveTo(12,-30);g.lineTo(3,-12);g.stroke();
    g.strokeStyle='rgba(0,0,0,0.18)';g.lineWidth=1;for(const x of[-14,-4,8,16]){g.beginPath();g.moveTo(x,6);g.quadraticCurveTo(x+2,18,x,32);g.stroke()}}
  if(tr===1){g.strokeStyle='rgba(240,220,180,0.6)';g.setLineDash([2,2]);g.lineWidth=0.9;g.beginPath();g.moveTo(-18,-26);g.lineTo(-20,26);g.moveTo(18,-26);g.lineTo(20,26);g.moveTo(-20,0);g.lineTo(20,0);g.stroke();g.setLineDash([]);
    g.strokeStyle='#3a2414';g.lineWidth=3;g.beginPath();g.moveTo(-18,-28);g.lineTo(18,10);g.stroke()}
  if(tr===3){g.strokeStyle=shade(body,-0.5);g.lineWidth=0.8;for(let r=0;r<10;r++){const y=-28+r*6.2;g.beginPath();g.moveTo(-28,y);g.lineTo(28,y);g.stroke();for(let c=-28;c<28;c+=5){g.beginPath();g.moveTo(c+(r%2)*2.5,y);g.lineTo(c+(r%2)*2.5,y+6.2);g.stroke()}}
    g.fillStyle='rgba(255,255,255,0.18)';for(let r=0;r<10;r++)g.fillRect(-28,-28+r*6.2,56,1.2)}
  if(tr===4||tr===5){const sc=tr===5?shade(M.trim,-0.15):shade(M.m,-0.1);for(let r=0;r<11;r++){for(let c=-30;c<32;c+=6){const x=c+(r%2)*3,y=-26+r*5.6;
      g.fillStyle=_lg(g,x,y-3,x,y+4,[[0,shade(sc,0.5)],[1,shade(sc,-0.35)]]);g.strokeStyle=IOL;g.lineWidth=0.6;g.beginPath();g.moveTo(x-3,y-2);g.lineTo(x+3,y-2);g.quadraticCurveTo(x+3,y+3,x,y+4.5);g.quadraticCurveTo(x-3,y+3,x-3,y-2);g.fill();g.stroke()}}}
  g.restore();
  // hộ tâm kính
  if(tr>=2){const r=tr===2?11:9;g.fillStyle=_rg(g,0,-10,1,r,goldSt(tr===2?shade(M.m,0.15):M.trim),-3,-3);g.strokeStyle=IOL;g.lineWidth=1.1;g.beginPath();g.arc(0,-10,r,0,TAU);g.fill();g.stroke();
    if(tr===2){g.strokeStyle=M.pat;g.lineWidth=0.8;for(let i=0;i<12;i++){g.save();g.translate(0,-10);g.rotate(i/12*TAU);g.beginPath();g.moveTo(0,-2);g.lineTo(0,-r+2);g.stroke();g.restore()}g.beginPath();g.arc(0,-10,3,0,TAU);g.stroke()}
    if(M.gem)gem(g,0,-10,3.4,M.gem)}
  // đai và vai
  g.fillStyle=_lg(g,0,10,0,17,goldSt(tr<=1?'#8a5a2a':M.trim));g.strokeStyle=IOL;g.lineWidth=1;g.beginPath();g.roundRect(-24,10,48,6,2);g.fill();g.stroke();
  if(tr>=3){for(const s of[-1,1]){g.fillStyle=_lg(g,s*24,-34,s*40,-12,st);g.beginPath();g.ellipse(s*27,-24,14,9,s*0.5,0,TAU);g.fill();g.stroke();
    g.strokeStyle=M.trim;g.lineWidth=1.4;g.beginPath();g.ellipse(s*27,-24,10,6,s*0.5,0,TAU);g.stroke();g.strokeStyle=IOL;g.lineWidth=1}}
  // cổ áo
  g.strokeStyle=tr<=1?M.trim:shade(M.cloth,0.2);g.lineWidth=2.4;g.beginPath();g.moveTo(-8,-29);g.lineTo(0,-20);g.lineTo(8,-29);g.stroke();
}
function artBelt(g,M,tr){
  g.translate(50,50);
  const band=tr===0?'#b8a060':tr===1?'#6a4426':tr===4?'#1f3a2c':tr===5?'#8a1a14':'#3a2a20';
  g.fillStyle=_lg(g,0,-8,0,8,woodSt(band));g.strokeStyle=IOL;g.lineWidth=1.2;g.beginPath();g.moveTo(-44,-4);g.quadraticCurveTo(0,10,44,-4);g.lineTo(44,8);g.quadraticCurveTo(0,22,-44,8);g.closePath();g.fill();g.stroke();
  if(tr===0){g.strokeStyle='rgba(80,60,20,0.8)';g.lineWidth=0.9;for(let x=-42;x<44;x+=4){const y=Math.pow(x/44,2)*-6+8;g.beginPath();g.moveTo(x,y-10);g.lineTo(x+3,y);g.stroke()}}
  if(tr===1){g.strokeStyle='rgba(240,220,180,0.55)';g.setLineDash([2,2]);g.lineWidth=0.8;g.beginPath();g.moveTo(-42,-1);g.quadraticCurveTo(0,13,42,-1);g.moveTo(-42,6);g.quadraticCurveTo(0,20,42,6);g.stroke();g.setLineDash([])}
  // miếng đai
  if(tr>=2){const pc=tr===2?M.m:tr===3?'#d8dee2':tr===4?M.jade:M.trim;const st=tr===4?[[0,shade(pc,-0.45)],[0.45,pc],[0.55,shade(pc,0.5)],[1,shade(pc,-0.4)]]:tr===3?metalSt(pc):goldSt(pc);
    for(const x of[-34,-22,22,34]){const y=Math.pow(x/44,2)*-7+9;g.fillStyle=_lg(g,x-4,y-6,x+4,y+6,st);g.beginPath();g.roundRect(x-4.5,y-7,9,12,2);g.fill();g.stroke();
      if(tr>=4){g.strokeStyle=shade(pc,-0.5);g.lineWidth=0.7;g.beginPath();g.arc(x,y-1,2.4,0,TAU);g.stroke();g.strokeStyle=IOL;g.lineWidth=1.2}}}
  // khóa
  const bc=tr<=1?'#a08a62':tr===2?M.m:M.trim;g.fillStyle=_lg(g,-12,0,12,0,goldSt(bc));g.beginPath();
  if(tr===5){g.moveTo(-14,0);g.quadraticCurveTo(-14,-10,0,-12);g.quadraticCurveTo(14,-10,14,0);g.quadraticCurveTo(14,18,0,20);g.quadraticCurveTo(-14,18,-14,0);g.closePath()}
  else g.roundRect(-11,-4,22,20,4);g.fill();g.stroke();
  g.fillStyle='rgba(0,0,0,0.35)';g.beginPath();g.roundRect(-6,1,12,10,2);g.fill();
  if(M.gem)gem(g,0,6,4,M.gem);else{g.fillStyle=shade(bc,0.5);g.fillRect(-5,2,10,2)}
}
function artBoots(g,M,tr){
  g.translate(48,52);
  if(tr===0){// dép cỏ
    g.fillStyle=_lg(g,0,10,0,22,woodSt('#b8a060'));g.strokeStyle=IOL;g.lineWidth=1.2;g.beginPath();g.ellipse(0,16,34,9,-0.1,0,TAU);g.fill();g.stroke();
    g.strokeStyle='rgba(80,60,20,0.7)';g.lineWidth=0.8;for(let x=-28;x<30;x+=5){g.beginPath();g.moveTo(x,10);g.lineTo(x+3,22);g.stroke()}
    g.strokeStyle='#6a4426';g.lineWidth=3;g.beginPath();g.moveTo(-16,12);g.quadraticCurveTo(-6,-4,8,12);g.moveTo(10,12);g.quadraticCurveTo(18,0,26,12);g.stroke();return}
  const up=tr===1?'#3a3a52':tr===2?'#6a4426':tr===3?'#4a3a2e':tr===4?'#1f3f5a':'#8a1a14';
  const toeUp=tr>=4;
  g.fillStyle=_lg(g,-20,0,20,0,woodSt(up));g.strokeStyle=IOL;g.lineWidth=1.3;g.beginPath();
  g.moveTo(-18,tr===1?-6:-36);g.lineTo(6,tr===1?-6:-36);g.lineTo(8,-2);g.quadraticCurveTo(26,0,toeUp?40:34,toeUp?2:12);
  if(toeUp)g.quadraticCurveTo(44,-6,38,-8);g.lineTo(toeUp?36:34,18);g.lineTo(-22,18);g.quadraticCurveTo(-24,6,-18,tr===1?-6:-36);g.closePath();g.fill();g.stroke();
  // đế
  g.fillStyle='#1a120c';g.beginPath();g.moveTo(-23,16);g.lineTo(36,16);g.lineTo(35,22);g.lineTo(-22,22);g.closePath();g.fill();
  if(tr===1){g.strokeStyle='rgba(255,255,255,0.3)';g.lineWidth=1;g.beginPath();g.moveTo(-14,4);g.quadraticCurveTo(8,0,24,8);g.stroke()}
  if(tr>=2){// cổ giày
    g.fillStyle=_lg(g,-20,-40,8,-30,goldSt(tr===2?'#8a5a2a':M.trim));g.beginPath();g.roundRect(-20,-40,28,7,2);g.fill();g.stroke()}
  if(tr===3){g.fillStyle=_lg(g,-16,-30,8,-4,metalSt(M.m));for(let i=0;i<3;i++){g.beginPath();g.roundRect(-16,-30+i*9,22,8,2);g.fill();g.stroke()}}
  if(tr===4||tr===5){// mây
    g.strokeStyle=tr===5?M.trim:'#e8e0cc';g.lineWidth=1.6;for(const[x,y]of[[-8,-18],[10,6],[24,10]]){g.beginPath();g.arc(x,y,4,Math.PI*0.5,Math.PI*2.2);g.stroke();g.beginPath();g.arc(x+6,y+1,3,Math.PI,Math.PI*2.3);g.stroke()}}
  if(tr===5){g.fillStyle=_lg(g,-30,-30,-10,-10,goldSt(M.trim));g.strokeStyle=IOL;g.lineWidth=1;for(let i=0;i<3;i++){g.beginPath();g.moveTo(-20,-30+i*7);g.quadraticCurveTo(-34-i*2,-36+i*7,-40-i*3,-28+i*8);g.quadraticCurveTo(-30,-28+i*7,-20,-24+i*7);g.closePath();g.fill();g.stroke()}}
}
function artAmulet(g,M,tr){
  g.translate(50,54);
  // dây đeo
  g.strokeStyle=tr>=3?M.trim:'#8a3a22';g.lineWidth=1.8;g.beginPath();g.moveTo(-22,-44);g.quadraticCurveTo(-18,-14,0,-12);g.quadraticCurveTo(18,-14,22,-44);g.stroke();
  if(tr===0){// vòng đá
    g.fillStyle=_rg(g,0,6,10,28,[[0,'#bdb8ac'],[0.5,'#8a867c'],[1,'#4a4740']],-6,-6);g.strokeStyle=IOL;g.lineWidth=1.3;g.beginPath();g.arc(0,6,24,0,TAU);g.arc(0,6,12,0,TAU,true);g.fill('evenodd');g.stroke();
    g.beginPath();g.arc(0,6,12,0,TAU);g.stroke();g.fillStyle='rgba(255,255,255,0.3)';g.beginPath();g.ellipse(-10,-6,6,3,-0.6,0,TAU);g.fill();return}
  if(tr===1){// ngọc bích
    g.fillStyle=_rg(g,0,6,4,26,[[0,'#8ae0b8'],[0.6,'#2f9a6a'],[1,'#164a32']],-6,-6);g.strokeStyle=IOL;g.lineWidth=1.3;g.beginPath();g.arc(0,6,24,0,TAU);g.arc(0,6,7,0,TAU,true);g.fill('evenodd');g.stroke();
    g.strokeStyle='rgba(255,255,255,0.25)';g.lineWidth=1;for(let i=0;i<8;i++){const a=i/8*TAU;g.beginPath();g.arc(Math.cos(a)*15,6+Math.sin(a)*15,2.5,0,TAU);g.stroke()}
    g.fillStyle='rgba(255,255,255,0.45)';g.beginPath();g.ellipse(-10,-6,6,3,-0.6,0,TAU);g.fill();return}
  if(tr===4){// ngọc tỷ nhỏ
    g.fillStyle=_lg(g,-16,0,16,0,[[0,'#1f6a48'],[0.5,'#7fe0b0'],[1,'#1a5a3c']]);g.strokeStyle=IOL;g.lineWidth=1.2;g.beginPath();g.roundRect(-16,4,32,26,2);g.fill();g.stroke();
    g.fillStyle=_rg(g,0,0,1,16,goldSt(M.trim),-4,-4);g.beginPath();g.moveTo(-12,4);g.quadraticCurveTo(-14,-10,0,-12);g.quadraticCurveTo(14,-10,12,4);g.closePath();g.fill();g.stroke();
    g.fillStyle='#c8361f';g.fillRect(-10,24,20,3);gem(g,0,-4,2.6,M.gem);return}
  // mặt dây: bọc vàng
  g.fillStyle=_lg(g,-8,-14,8,-4,goldSt(M.trim));g.strokeStyle=IOL;g.lineWidth=1;g.beginPath();g.moveTo(-8,-12);g.lineTo(8,-12);g.lineTo(10,-2);g.quadraticCurveTo(0,2,-10,-2);g.closePath();g.fill();g.stroke();
  const col=tr===2?'#f2efe6':tr===3?'#e89a2a':'#fff0c0';
  if(tr===5){g.save();g.globalCompositeOperation='lighter';g.fillStyle=_rg(g,0,14,2,34,[[0,'rgba(255,240,180,0.9)'],[0.4,'rgba(255,200,90,0.35)'],[1,'rgba(255,160,40,0)']]);g.beginPath();g.arc(0,14,34,0,TAU);g.fill();g.restore()}
  g.fillStyle=_rg(g,0,14,1,18,tr===2?[[0,'#ffffff'],[0.5,'#e8e2d6'],[1,'#a8a090']]:tr===3?[[0,'#ffe3a0'],[0.5,'#e88a1a'],[1,'#7a3a08']]:[[0,'#ffffff'],[0.5,'#ffe9a0'],[1,'#e8a83a']],-5,-5);
  g.beginPath();if(tr===3){g.moveTo(0,-2);g.quadraticCurveTo(18,14,0,32);g.quadraticCurveTo(-18,14,0,-2)}else g.arc(0,14,15,0,TAU);g.fill();g.stroke();
  if(tr===3){g.fillStyle='rgba(90,40,0,0.5)';g.beginPath();g.ellipse(3,18,2.4,1.4,0.6,0,TAU);g.fill()}
  g.fillStyle='rgba(255,255,255,0.75)';g.beginPath();g.ellipse(-5,7,4,2.4,-0.6,0,TAU);g.fill();
  if(tr===5){g.strokeStyle=_lg(g,-16,0,16,0,goldSt(M.trim));g.lineWidth=2.4;for(const s of[-1,1]){g.beginPath();g.moveTo(s*6,-2);g.quadraticCurveTo(s*20,8,s*10,26);g.stroke()}}
}

/* ---------------- BỘ ĐỆM ẢNH ---------------- */
const ITEM_ART={};
function itemTier(it){return clamp(Math.floor((it.ilvl-1)/6),0,5)}
function itemArtKey(it){return it.slot+'|'+(it.slot==='vk'?(it.cls||G.save.cls):'')+'|'+itemTier(it)+'|'+it.rar+'|'+(it.enh>=13?3:it.enh>=10?2:it.enh>=7?1:0)}
function itemArtCanvas(it){
  const key=itemArtKey(it);let e=ITEM_ART[key];if(e)return e.c;
  const S=160,tier=itemTier(it),M=TIERMAT[tier],cls=it.slot==='vk'?(it.cls||G.save.cls):null;
  const tmp=document.createElement('canvas');tmp.width=tmp.height=S;const g=tmp.getContext('2d');g.scale(S/100,S/100);g.lineJoin='round';g.lineCap='round';
  g.save();
  if(it.slot==='vk'){const sc=cls==='cung'?1.05:1.22;g.translate(50,50);g.scale(sc,sc);g.translate(-50,-50);({kiem:artSword,cung:artBow,giao:artSpear,dao:artDual,con:artStaff,phap:artTalisman})[cls](g,M,tier)}
  else ({mu:artHelm,ao:artArmor,dai:artBelt,giay:artBoots,boi:artAmulet})[it.slot](g,M,tier);
  g.restore();
  // ghép: bóng đổ + viền sáng theo phẩm chất/cường hóa
  const c=document.createElement('canvas');c.width=c.height=S;const o=c.getContext('2d');
  const enhLv=it.enh>=13?3:it.enh>=10?2:it.enh>=7?1:0;const aura=enhLv?['','#62b4ff','#ffc53d','#ff5b3d'][enhLv]:it.rar>=3?RARITY[it.rar].color:null;
  if(aura){o.shadowColor=aura;o.shadowBlur=S*0.09;o.drawImage(tmp,0,0);o.drawImage(tmp,0,0)}
  o.shadowColor='rgba(0,0,0,0.55)';o.shadowBlur=S*0.04;o.shadowOffsetX=S*0.015;o.shadowOffsetY=S*0.03;o.drawImage(tmp,0,0);
  o.shadowColor='transparent';
  if(it.rar>=3){sparkle(o,S*0.72,S*0.26,S*0.07);if(it.rar>=4)sparkle(o,S*0.3,S*0.7,S*0.05)}
  ITEM_ART[key]={c,url:null};return c;
}
function itemArtURL(it){const c=itemArtCanvas(it),e=ITEM_ART[itemArtKey(it)];if(!e.url){try{e.url=c.toDataURL('image/png')}catch(_){e.url=''}}return e.url}
function itemImg(it,cls){return`<img class="iart${cls?' '+cls:''}" src="${itemArtURL(it)}" alt="" draggable="false">`}

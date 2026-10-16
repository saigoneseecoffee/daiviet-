/* ============ VẼ NHÂN VẬT & QUÁI (thủ tục, không dùng ảnh) ============ */
/* ---- thú bốn chân ---- */
function drawBeast(g,e,t){
  const D=e.def,c=D.c,f=e.f,s=e.sc,w=e.walk,mv=e.moving?1:0;
  g.save();g.translate(e.x,e.y);g.scale(s,s);
  g.fillStyle='rgba(0,0,0,0.3)';g.beginPath();g.ellipse(0,0,D.r*1.1,D.r*0.35,0,0,TAU);g.fill();
  g.scale(f,1);g.lineJoin='round';g.lineCap='round';g.strokeStyle='rgba(18,12,8,0.7)';g.lineWidth=1.6;
  const crouch=e.state==='wind'?3:0;
  switch(D.body){
    case'wolf':case'tiger':{const big=D.body==='tiger'?1.25:1;
      g.scale(big,big);const lg=Math.sin(w)*6*mv;
      g.fillStyle=c[1];[[-10,lg],[10,-lg]].forEach(([x,o])=>{g.beginPath();g.roundRect(x+o*0.5-2,-12,4.5,12,2);g.fill()});
      // đuôi
      g.strokeStyle=c[0];g.lineWidth=D.body==='tiger'?3.5:6;g.beginPath();g.moveTo(-14,-16+crouch);g.quadraticCurveTo(-24,-20+Math.sin(t*6)*3,-26,-10);g.stroke();
      g.strokeStyle='rgba(18,12,8,0.7)';g.lineWidth=1.6;
      g.fillStyle=c[0];g.beginPath();g.ellipse(0,-15+crouch,16,8,0,0,TAU);g.fill();g.stroke();
      g.fillStyle=c[2];g.beginPath();g.ellipse(2,-11+crouch,11,3.5,0,0,TAU);g.fill();
      if(D.body==='tiger'&&!D.nostripe){g.strokeStyle=c[1];g.lineWidth=2.2;for(let i=-2;i<=2;i++){g.beginPath();g.moveTo(i*5,-22+crouch);g.lineTo(i*5+2,-15+crouch);g.stroke()}}
      g.strokeStyle='rgba(18,12,8,0.7)';g.lineWidth=1.6;
      [[-7,-lg],[12,lg]].forEach(([x,o])=>{g.fillStyle=c[0];g.beginPath();g.roundRect(x+o*0.5-2.5,-12+crouch*0.5,5,12-crouch*0.5,2);g.fill();g.stroke()});
      // đầu
      g.fillStyle=c[0];g.beginPath();g.ellipse(17,-20+crouch,8,7,0,0,TAU);g.fill();g.stroke();
      g.beginPath();g.moveTo(21,-19+crouch);g.lineTo(28,-16+crouch);g.lineTo(21,-13+crouch);g.fill();g.stroke();
      g.beginPath();g.moveTo(13,-25+crouch);g.lineTo(14,-33+crouch);g.lineTo(18,-26+crouch);g.fill();g.stroke();
      g.fillStyle=e.state==='wind'?'#ff3a2a':'#ffd36b';g.beginPath();g.arc(19,-21+crouch,1.6,0,TAU);g.fill();
      if(D.body==='tiger'&&!D.nostripe){g.strokeStyle=c[1];g.lineWidth=1.6;g.beginPath();g.moveTo(14,-27+crouch);g.lineTo(16,-22+crouch);g.stroke()}
      break}
    case'boar':{const lg=Math.sin(w)*5*mv;
      g.fillStyle=c[1];[[-9,lg],[9,-lg],[-5,-lg],[12,lg]].forEach(([x,o])=>{g.beginPath();g.roundRect(x+o*0.5-2.5,-10,5,10,2);g.fill()});
      g.fillStyle=c[0];g.beginPath();g.ellipse(0,-14+crouch,17,10,0,0,TAU);g.fill();g.stroke();
      g.fillStyle=c[1];for(let i=-3;i<4;i++){g.beginPath();g.moveTo(i*4,-23+crouch);g.lineTo(i*4+2,-28+crouch);g.lineTo(i*4+4,-23+crouch);g.fill()}
      g.fillStyle=c[0];g.beginPath();g.ellipse(17,-13+crouch,8,7,0.2,0,TAU);g.fill();g.stroke();
      g.fillStyle='#d8a890';g.beginPath();g.ellipse(24,-11+crouch,3,3.5,0,0,TAU);g.fill();
      g.fillStyle=c[2];g.beginPath();g.moveTo(20,-9+crouch);g.quadraticCurveTo(26,-12,25,-18+crouch);g.lineTo(22,-11+crouch);g.fill();
      g.fillStyle=e.state==='wind'?'#ff3a2a':'#1a1010';g.beginPath();g.arc(18,-16+crouch,1.6,0,TAU);g.fill();break}
    case'croc':{const lg=Math.sin(w)*4*mv;g.fillStyle=c[1];
      [[-12,lg],[10,-lg]].forEach(([x,o])=>{g.beginPath();g.ellipse(x+o,-3,5,3,0,0,TAU);g.fill()});
      g.fillStyle=c[0];g.beginPath();g.moveTo(-36,-6);g.quadraticCurveTo(-20,-14,0,-12);g.lineTo(26,-10);g.quadraticCurveTo(34,-8,36,-5);g.lineTo(26,-3);g.quadraticCurveTo(0,0,-36,-6);g.fill();g.stroke();
      g.fillStyle=c[1];for(let i=0;i<7;i++){g.beginPath();g.arc(-24+i*6,-11,1.8,0,TAU);g.fill()}
      if(e.state==='wind'){g.fillStyle='#8a2020';g.beginPath();g.moveTo(22,-8);g.lineTo(38,-14);g.lineTo(36,-5);g.fill()}
      g.fillStyle='#ffd36b';g.beginPath();g.arc(20,-12,1.6,0,TAU);g.fill();
      g.fillStyle=c[1];[[-6,-lg],[16,lg]].forEach(([x,o])=>{g.beginPath();g.ellipse(x+o,-2,5,3,0,0,TAU);g.fill()});break}
    case'snake':{g.strokeStyle=c[1];g.lineWidth=8;g.beginPath();for(let i=0;i<=10;i++){const x=-18+i*3,y=-4+Math.sin(i*0.9+t*8*(mv?1:0.3))*3;i?g.lineTo(x,y):g.moveTo(x,y)}g.stroke();
      g.strokeStyle=c[0];g.lineWidth=5.5;g.stroke();
      const rise=e.state==='wind'?-8:0;g.fillStyle=c[0];g.beginPath();g.moveTo(12,-4);g.quadraticCurveTo(14,-14+rise,16,-20+rise);g.lineTo(20,-20+rise);g.quadraticCurveTo(20,-10,16,-4);g.fill();
      g.fillStyle=c[2];g.beginPath();g.ellipse(18,-22+rise,7,5,0,0,TAU);g.fill();g.fillStyle=c[0];g.beginPath();g.ellipse(19,-23+rise,4.5,3.5,0,0,TAU);g.fill();
      g.fillStyle='#ff3a2a';g.beginPath();g.arc(21,-24+rise,1.2,0,TAU);g.fill();break}
    case'monkey':{const lg=Math.sin(w)*5*mv;g.strokeStyle=c[0];g.lineWidth=3;g.beginPath();g.moveTo(-6,-12);g.quadraticCurveTo(-18,-14,-16,-28+Math.sin(t*4)*3);g.stroke();
      g.strokeStyle='rgba(18,12,8,0.7)';g.lineWidth=1.6;g.fillStyle=c[1];g.beginPath();g.roundRect(-5+lg*0.4,-10,4,10,2);g.fill();g.beginPath();g.roundRect(1-lg*0.4,-10,4,10,2);g.fill();
      g.fillStyle=c[0];g.beginPath();g.ellipse(0,-17,8,10,0,0,TAU);g.fill();g.stroke();g.fillStyle=c[2];g.beginPath();g.ellipse(2,-15,4.5,6,0,0,TAU);g.fill();
      g.fillStyle=c[0];g.beginPath();g.arc(2,-30,7,0,TAU);g.fill();g.stroke();g.fillStyle=c[2];g.beginPath();g.ellipse(4,-29,4.5,4,0,0,TAU);g.fill();
      g.fillStyle='#1a1010';g.beginPath();g.arc(5,-30,1.2,0,TAU);g.fill();
      if(e.state==='wind'){g.fillStyle='#7a746a';g.beginPath();g.arc(8,-40,4,0,TAU);g.fill()}break}
    case'cav':{drawHorse(g,c,w,mv,crouch,1);
      const L=factionLook(D.fac,D.wp);drawHuman(g,{x:2,y:-26,f:1,look:L,ride:1,t,atk:e.state==='wind'?0.15:-1,sc:0.92});break}
  }
  g.restore();
}
function drawHorse(g,c,w,mv,crouch,sc){
  g.save();g.scale(sc,sc);const lg=Math.sin(w)*8*mv;g.strokeStyle='rgba(18,12,8,0.7)';g.lineWidth=1.6;
  g.fillStyle=c[1];[[-14,lg],[14,-lg]].forEach(([x,o])=>{g.beginPath();g.roundRect(x+o*0.5-2.5,-20,5,20,2);g.fill()});
  g.strokeStyle=c[1];g.lineWidth=5;g.beginPath();g.moveTo(-20,-30);g.quadraticCurveTo(-30,-28,-30,-14);g.stroke();g.strokeStyle='rgba(18,12,8,0.7)';g.lineWidth=1.6;
  g.fillStyle=c[0];g.beginPath();g.ellipse(0,-28+crouch,22,10,0,0,TAU);g.fill();g.stroke();
  [[-10,-lg],[17,lg]].forEach(([x,o])=>{g.fillStyle=c[0];g.beginPath();g.roundRect(x+o*0.5-2.5,-20,5,20,2);g.fill();g.stroke()});
  g.fillStyle=c[0];g.beginPath();g.moveTo(14,-32);g.lineTo(26,-50);g.lineTo(36,-46);g.lineTo(26,-30);g.closePath();g.fill();g.stroke();
  g.fillStyle=c[1];g.beginPath();g.moveTo(16,-36);g.lineTo(24,-52);g.lineTo(22,-36);g.fill();
  g.fillStyle='#1a1010';g.beginPath();g.arc(30,-46,1.4,0,TAU);g.fill();
  g.fillStyle='#8a2a22';g.fillRect(-10,-38,20,6);g.restore();
}

/* ---- boss ---- */
function drawBoss(g,e,t){
  const D=e.def,c=D.c,f=e.f;
  g.save();g.translate(e.x,e.y);
  // hào quang
  const pulse=0.5+Math.sin(t*3)*0.5;g.fillStyle=e.enraged?`rgba(255,60,40,${0.15+pulse*0.15})`:`rgba(255,200,80,${0.08+pulse*0.08})`;
  g.beginPath();g.ellipse(0,0,D.r*1.6,D.r*0.55,0,0,TAU);g.fill();
  if(D.body==='fish'){const hov=Math.sin(t*2)*5;
    g.fillStyle='rgba(0,0,0,0.3)';g.beginPath();g.ellipse(0,0,40,12,0,0,TAU);g.fill();g.scale(f,1);g.translate(0,-40+hov);
    g.lineWidth=2.5;g.strokeStyle='rgba(10,20,20,0.8)';
    g.fillStyle=c[1];g.beginPath();g.moveTo(-40,0);g.lineTo(-64,-24+Math.sin(t*5)*6);g.lineTo(-60,0);g.lineTo(-64,24+Math.sin(t*5)*6);g.closePath();g.fill();g.stroke();
    g.fillStyle=c[0];g.beginPath();g.ellipse(0,0,46,30,0,0,TAU);g.fill();g.stroke();
    g.fillStyle=c[1];for(let i=0;i<4;i++)for(let j=0;j<3;j++){g.beginPath();g.arc(-26+i*13,-12+j*12,5,Math.PI*0.2,Math.PI*0.8);g.stroke()}
    g.fillStyle=c[2];g.beginPath();g.moveTo(-10,-28);g.quadraticCurveTo(4,-56,20,-26);g.fill();g.stroke();
    g.fillStyle='#d9ecd0';g.beginPath();g.ellipse(8,14,30,12,0,0,Math.PI);g.fill();
    g.strokeStyle=c[2];g.lineWidth=2;g.beginPath();g.moveTo(40,6);g.quadraticCurveTo(64,20,58,40+Math.sin(t*3)*4);g.moveTo(40,10);g.quadraticCurveTo(56,30,46,46);g.stroke();
    g.fillStyle='#fff';g.beginPath();g.arc(28,-8,8,0,TAU);g.fill();g.fillStyle=e.enraged?'#ff2a1a':'#c2201a';g.shadowColor='#ff3a2a';g.shadowBlur=12;g.beginPath();g.arc(30,-8,4.5,0,TAU);g.fill();g.shadowBlur=0;
    g.fillStyle='#1a0a0a';g.beginPath();g.moveTo(42,4);g.lineTo(48,8);g.lineTo(40,12);g.fill();
  }else if(D.body==='rooster'){
    g.fillStyle='rgba(0,0,0,0.3)';g.beginPath();g.ellipse(0,0,36,11,0,0,TAU);g.fill();g.scale(f*1.2,1.2);g.lineWidth=2;g.strokeStyle='rgba(30,20,10,0.75)';
    const lg=Math.sin(e.walk)*6*(e.moving?1:0);g.strokeStyle='#d9a42a';g.lineWidth=4;g.beginPath();g.moveTo(-4,-24);g.lineTo(-6+lg,0);g.moveTo(6,-24);g.lineTo(8-lg,0);g.stroke();
    g.strokeStyle='rgba(30,20,10,0.75)';g.lineWidth=2;
    for(let i=0;i<5;i++){g.fillStyle=i%2?'#e8e0cc':'#c9a24e';g.beginPath();g.moveTo(-14,-40);g.quadraticCurveTo(-46-i*3,-80+i*10,-36+i*2,-30+i*4+Math.sin(t*3+i)*3);g.quadraticCurveTo(-30,-40,-14,-40);g.fill();g.stroke()}
    g.fillStyle=c[0];g.beginPath();g.ellipse(0,-42,26,20,0.1,0,TAU);g.fill();g.stroke();
    g.fillStyle=c[1];g.beginPath();g.ellipse(-4,-40,14,10,0.2,0,TAU);g.fill();
    g.fillStyle=c[0];g.beginPath();g.moveTo(10,-54);g.quadraticCurveTo(14,-74,22,-74);g.quadraticCurveTo(30,-70,26,-54);g.closePath();g.fill();g.stroke();
    g.fillStyle=c[2];for(let i=0;i<4;i++){g.beginPath();g.arc(16+i*4,-80+Math.abs(i-1.5)*2,4,0,TAU);g.fill()}
    g.beginPath();g.ellipse(28,-62,3,6,0,0,TAU);g.fill();
    g.fillStyle='#e3b24a';g.beginPath();g.moveTo(28,-70);g.lineTo(38,-67);g.lineTo(28,-64);g.fill();
    g.fillStyle=e.enraged?'#ff2a1a':'#1a0a0a';g.beginPath();g.arc(24,-70,2.2,0,TAU);g.fill();
  }else{ // tướng
    const L=factionLook(D.fac,D.wp);L.robe2='#1a1410';L.sash='#ffc53d';
    if(D.mount){g.scale(f*1.35,1.35);drawHorse(g,['#3a2a20','#1a120c','#e8dcc6'],e.walk,e.moving?1:0,0,1);
      drawBanner(g,-6,-58,D,t);drawHuman(g,{x:2,y:-28,f:1,look:L,ride:1,t,atk:e.atkAnim,sc:1.15});}
    else{g.scale(1.75,1.75);g.save();g.scale(f,1);drawBanner(g,-8,-30,D,t);g.restore();
      drawHuman(g,{x:0,y:0,f,look:L,t,walk:e.walk,moving:e.moving,atk:e.atkAnim,sc:1});}
  }
  g.restore();
}
function drawBanner(g,x,y,D,t){const col=FACTION[D.fac].hc==='#1c1c1c'?'#7a2f2a':FACTION[D.fac].hc;
  g.fillStyle='#3a2414';g.fillRect(x-1,y-34,2,40);g.fillStyle=col;g.beginPath();g.moveTo(x,y-34);
  g.quadraticCurveTo(x-12,y-30+Math.sin(t*4)*2,x-20,y-30);g.lineTo(x-20,y-12);g.quadraticCurveTo(x-10,y-14+Math.sin(t*4+1)*2,x,y-12);g.closePath();g.fill();
  g.fillStyle='#ffd36b';g.beginPath();g.arc(x-10,y-22,3.5,0,TAU);g.fill()}

/* ---- biểu tượng kỹ năng (vẽ canvas) ---- */
function drawSkillIcon(g,id,size,col){
  const s=size/48;g.save();g.scale(s,s);g.translate(24,24);
  g.strokeStyle='#fff6dc';g.fillStyle='#fff6dc';g.lineWidth=3;g.lineCap='round';g.lineJoin='round';
  const P=()=>g.beginPath();
  switch(id){
    case'wave':P();g.arc(-6,0,16,-1.1,1.1);g.stroke();P();g.arc(-12,0,12,-1,1);g.globalAlpha=0.5;g.stroke();g.globalAlpha=1;break;
    case'spin':for(let i=0;i<3;i++){P();g.arc(0,0,6+i*5,i,i+3.5);g.stroke()}break;
    case'swordrain':for(let i=-1;i<=1;i++){P();g.moveTo(i*10,-14+Math.abs(i)*4);g.lineTo(i*10,10+Math.abs(i)*-4);g.stroke();P();g.moveTo(i*10-4,-10+Math.abs(i)*4);g.lineTo(i*10+4,-10+Math.abs(i)*4);g.stroke()}break;
    case'tri':for(let i=-1;i<=1;i++){g.save();g.rotate(i*0.4);P();g.moveTo(-14,0);g.lineTo(14,0);g.stroke();P();g.moveTo(14,0);g.lineTo(8,-4);g.lineTo(8,4);g.closePath();g.fill();g.restore()}break;
    case'leap':P();g.arc(4,4,12,Math.PI,Math.PI*1.8);g.stroke();P();g.moveTo(-8,4);g.lineTo(-14,-2);g.moveTo(-8,4);g.lineTo(-2,0);g.stroke();P();g.moveTo(-2,12);g.lineTo(16,12);g.stroke();break;
    case'arrowrain':for(let i=0;i<4;i++){const x=-12+i*8,y=-12+(i%2)*6;P();g.moveTo(x,y);g.lineTo(x,y+18);g.stroke();P();g.moveTo(x-3,y+14);g.lineTo(x,y+19);g.lineTo(x+3,y+14);g.stroke()}break;
    case'lunge':P();g.moveTo(-16,6);g.lineTo(14,-6);g.stroke();P();g.moveTo(14,-6);g.lineTo(6,-6);g.lineTo(10,0);g.closePath();g.fill();g.globalAlpha=0.5;P();g.moveTo(-18,12);g.lineTo(-4,6);g.stroke();g.globalAlpha=1;break;
    case'sweep':P();g.arc(0,4,15,Math.PI*1.05,Math.PI*1.95);g.stroke();P();g.moveTo(-15,4);g.lineTo(-10,0);g.stroke();P();g.moveTo(15,4);g.lineTo(18,-2);g.stroke();break;
    case'stakes':for(let i=-1;i<=1;i++){P();g.moveTo(i*11-4,12);g.lineTo(i*11,-8-Math.abs(i)*-4);g.lineTo(i*11+4,12);g.closePath();g.fill()}break;
    case'shadow':for(let i=0;i<3;i++){g.globalAlpha=0.35+i*0.3;P();g.arc(-10+i*9,0,6,0,TAU);g.fill()}g.globalAlpha=1;break;
    case'flurry':for(let i=0;i<4;i++){P();g.moveTo(-12+i*6,-12);g.lineTo(-4+i*6,12);g.stroke()}break;
    case'blink':P();g.moveTo(0,-16);g.lineTo(5,-4);g.lineTo(16,0);g.lineTo(5,4);g.lineTo(0,16);g.lineTo(-5,4);g.lineTo(-16,0);g.lineTo(-5,-4);g.closePath();g.fill();break;
    case'slam':P();g.moveTo(0,-16);g.lineTo(0,4);g.stroke();P();g.ellipse(0,10,16,5,0,0,TAU);g.stroke();for(let i=-1;i<=1;i+=2){P();g.moveTo(i*8,4);g.lineTo(i*14,-4);g.stroke()}break;
    case'guard':P();g.moveTo(0,-16);g.lineTo(13,-10);g.lineTo(11,6);g.lineTo(0,16);g.lineTo(-11,6);g.lineTo(-13,-10);g.closePath();g.stroke();P();g.moveTo(0,-8);g.lineTo(0,8);g.moveTo(-6,0);g.lineTo(6,0);g.stroke();break;
    case'wheel':P();g.arc(0,0,13,0,TAU);g.stroke();for(let i=0;i<6;i++){const a=i/6*TAU;P();g.moveTo(Math.cos(a)*13,Math.sin(a)*13);g.lineTo(Math.cos(a+0.6)*18,Math.sin(a+0.6)*18);g.stroke()}break;
    case'chain':P();g.moveTo(-4,-16);g.lineTo(-10,0);g.lineTo(2,0);g.lineTo(-4,16);g.lineTo(12,-4);g.lineTo(0,-4);g.lineTo(6,-16);g.closePath();g.fill();break;
    case'firering':P();g.arc(0,2,13,0,TAU);g.stroke();for(let i=0;i<5;i++){const a=i/5*TAU-Math.PI/2;P();g.moveTo(Math.cos(a)*13-3,Math.sin(a)*13+2);g.quadraticCurveTo(Math.cos(a)*16,Math.sin(a)*16-6,Math.cos(a)*13+3,Math.sin(a)*13+2);g.fill()}break;
    case'thunder':P();g.moveTo(-14,-14);g.lineTo(14,-14);g.stroke();for(let i=-1;i<=1;i++){P();g.moveTo(i*10,-10);g.lineTo(i*10-4,2);g.lineTo(i*10+2,2);g.lineTo(i*10-2,14);g.stroke()}break;
    case'atk':P();g.moveTo(-12,12);g.lineTo(12,-12);g.stroke();P();g.moveTo(-6,0);g.lineTo(0,6);g.stroke();break;
  }
  g.restore();
}

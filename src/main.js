/* số phiên bản hiện ở màn hình tiêu đề để biết trình duyệt đã tải bản mới chưa */
const GAME_VER='17.10.26b';
/* ============ KHỞI ĐỘNG, NHẬP LIỆU, VÒNG LẶP ============ */
if(!CanvasRenderingContext2D.prototype.roundRect){CanvasRenderingContext2D.prototype.roundRect=function(x,y,w,h,r){r=Math.min(r,w/2,h/2);this.moveTo(x+r,y);this.arcTo(x+w,y,x+w,y+h,r);this.arcTo(x+w,y+h,x,y+h,r);this.arcTo(x,y+h,x,y,r);this.arcTo(x,y,x+w,y,r);this.closePath();return this}}
const keys={};
function travel(mi,showStory){
  const S=G.save;S.map=mi;G.W=makeWorld(mi);G.enemies=[];G.projs=[];G.drops=[];G.fx=[];G.zones=[];G.tele=[];G.parts=[];G.amb=[];G.boss=null;G.lastTarget=null;
  const C=G.W.camp;const firstEver=!S.ng&&S.lvl===1&&S.kills===0&&mi===0;
  if(!G.p)makePlayer(C.x+60,C.y-40);G.p.x=firstEver?12.9*T:C.x+60;G.p.y=firstEver?46.4*T:C.y-40;G.p.dash=null;G.p.approach=null;
  G.cam.x=G.p.x;G.cam.y=G.p.y-20;G.UIcache={};UI.cache={};
  Audio_.mode=mi;
  // quái đầu tiên ở gần để vào trận ngay
  if(firstEver){const O=G.W.out;for(let k=0;k<3;k++){const x=O.x-40+k*45,y=O.y-20-k*35;if(!isSolidPt(G.W,x,y))spawnEnemy('soi',x,y,1,false)}}
  for(let k=0;k<8;k++)trySpawnPack(420,900);initCamps();G.horde=null;G.hordeT=null;
  saveGame();
  if(showStory)showStoryCard(mi);
}
function showStoryCard(mi){
  const M=MAPS[mi],S=G.save;G.paused=true;
  $('#paper').innerHTML=`<div class="stamp">Chương<br>${mi+1}</div><div class="era">${esc(M.era.toUpperCase())}</div><h3>${esc(M.name)}</h3><div class="lv">Quái cấp ${M.lv[0]+lvOffset()} đến ${M.lv[1]+lvOffset()}${S.ng?' · Luân Hồi '+S.ng:''}</div>
    <p>${esc(M.story)}</p><ol>${M.quest.map(q=>`<li>${esc(q.t==='collect'?q.txt+' từ '+ET[q.e].name:q.txt)}</li>`).join('')}</ol><button class="btn" id="stGo">Lên đường</button>`;
  $('#story').hidden=false;
  if(anim)anim.fromTo('#paper',{y:30,autoAlpha:0,rotation:1.5},{y:0,autoAlpha:1,rotation:0,duration:.6,ease:'power3.out'});
  $('#stGo').onclick=()=>{Audio_.unlock();$('#story').hidden=true;G.paused=false;Audio_.play('ui')};
  setTimeout(()=>$('#stGo')&&$('#stGo').focus({preventScroll:true}),50);
}
function startGame(){
  G.state='play';G.paused=false;$('#title').hidden=true;$('#select').hidden=true;$('#hud').hidden=false;G.p=null;
  makePlayer(0,0);const S=G.save;travel(S.map,S.kills===0);
  UI.cache={};const C=CLASS_BY_ID[S.cls];$('#pName').textContent=S.name;
  for(let i=0;i<3;i++){const c=$('#s'+i+' canvas'),g=c.getContext('2d');g.clearRect(0,0,120,120);drawSkillIcon(g,C.skills[i].id,120)}
  updateLook();
}
/* ---------- màn hình tiêu đề ---------- */
function showTitle(){
  G.state='title';$('#hud').hidden=true;$('#panel').hidden=true;$('#select').hidden=true;$('#story').hidden=true;$('#dead').hidden=true;$('#clear').hidden=true;
  if(!G.W)G.W=makeWorld(0);G.enemies=[];G.drops=[];G.boss=null;
  if(!G.titleCam){G.titleCam=1}G.cam.x=12*T;G.cam.y=46*T;
  const sv=loadSave();G.save=sv;
  const b=$('#tBtns');
  if(sv){const C=CLASS_BY_ID[sv.cls];b.innerHTML=`<button class="btn" id="tCont">Chơi tiếp<small>${esc(sv.name)} · ${esc(C.name)} cấp ${sv.lvl} · ${esc(MAPS[sv.map].name)}</small></button><button class="btn sec" id="tNew">Hành trình mới</button>`}
  else b.innerHTML=`<button class="btn" id="tNew">Bắt đầu hành trình</button>`;
  $('#tFoot').textContent=(sv?`Kỷ lục ${fmtFull(Math.max(sv.best,sv.score))} điểm. `:'')+(FINE?'Chơi bằng bàn phím: WASD, J, K, L, I.':'Chơi bằng cảm ứng. Xoay ngang hoặc dọc đều được.')+' · Bản '+GAME_VER;
  $('#title').hidden=false;
  const tc=$('#tCont');if(tc)tc.onclick=()=>{Audio_.unlock();G.save=loadSave();startGame()};
  $('#tNew').onclick=()=>{Audio_.unlock();if(sv)UI.confirm('Bắt đầu hành trình mới sẽ xóa nhân vật hiện tại. Tiếp tục?',showSelect);else showSelect()};
  renderSoundBtn();
  if(anim&&!REDUCED){const tl=anim.timeline();tl.from('#title .seal',{scale:2.2,rotation:-30,autoAlpha:0,duration:.6,ease:'power4.in'})
    .from('#title .tTitle',{y:30,autoAlpha:0,duration:.7,ease:'power3.out'},'-=.1').from('#title .tLine, #title .tBtns, #title .tFoot',{y:16,autoAlpha:0,duration:.5,stagger:.08},'-=.3')}
}
function renderSoundBtn(){const on=!G.save||G.save.set.sfx;$('#tSound').innerHTML=on?ICON.sndOn:ICON.sndOff;
  $('#tSound').onclick=()=>{Audio_.unlock();if(G.save){G.save.set.sfx=!G.save.set.sfx;G.save.set.music=G.save.set.sfx;Audio_.applySettings();saveGame()}else{G.muteDefault=!G.muteDefault}renderSoundBtn()}}
/* ---------- chọn phái ---------- */
let selCls='kiem';
function showSelect(){
  $('#title').hidden=true;$('#select').hidden=false;G.state='select';
  $('#cgrid').innerHTML=CLASSES.map(c=>`<button class="card" data-c="${c.id}" aria-pressed="${c.id===selCls}" style="--cc:${c.color}"><canvas></canvas><div class="cn">${esc(c.name)}</div><div class="cp">${esc(c.phai)}</div></button>`).join('');
  $('#heroName').value=pick(NAMES_A)+' '+pick(NAMES_B);
  const upd=()=>{document.querySelectorAll('.card').forEach(b=>b.setAttribute('aria-pressed',b.dataset.c===selCls));const C=CLASS_BY_ID[selCls];const d=$('#cdet');d.style.setProperty('--cc',C.color);
    d.innerHTML=`<div><p class="dn">${esc(C.name)}</p><p class="dl">${esc(C.line)}</p></div><div class="rt">${['Công','Thủ','Tốc','Tầm xa'].map((l,i)=>`<span>${l}</span><span class="pips">${[1,2,3,4,5].map(k=>`<i class="${k<=C.ratings[i]?'f':''}"></i>`).join('')}</span>`).join('')}</div>
      <p class="sks">Kỹ năng: ${C.skills.map(s=>`<b>${esc(s.name)}</b> (cấp ${s.un})`).join(', ')}</p>`};
  $('#cgrid').onclick=e=>{const b=e.target.closest('[data-c]');if(!b)return;selCls=b.dataset.c;Audio_.unlock();Audio_.play('ui');upd();G.selAtk=G.t};
  upd();
  $('#goBtn').onclick=()=>{const nm=($('#heroName').value||'').trim()||'Vô Danh';G.save=newSave(selCls,nm.slice(0,16));if(G.muteDefault){G.save.set.sfx=false;G.save.set.music=false}
    saveGame();Audio_.unlock();Audio_.applySettings();Audio_.play('win');startGame()};
  $('#backBtn').onclick=()=>showTitle();
  if(anim&&!REDUCED)anim.from('.card',{y:20,autoAlpha:0,duration:.4,stagger:.05});
}
function animSelect(){document.querySelectorAll('.card').forEach((b,i)=>{const c=b.querySelector('canvas');const on=b.dataset.c===selCls;const t=G.t+i;const at=on?((G.t*0.9)%1.4<1?((G.t*0.9)%1.4):-1):-1;drawPortrait(c,b.dataset.c,t,at,true)})}

/* ---------- nhập liệu ---------- */
const KEYMAP={KeyW:'u',ArrowUp:'u',KeyS:'d',ArrowDown:'d',KeyA:'l',ArrowLeft:'l',KeyD:'r',ArrowRight:'r'};
function setupInput(){
  window.addEventListener('keydown',e=>{
    if(e.target&&e.target.tagName==='INPUT')return;
    const c=e.code;if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Tab'].includes(c)&&G.state==='play'&&!UI.panel)e.preventDefault();
    Audio_.unlock();
    if(c==='Escape'){if(!$('#confirm').hidden){$('#confirm').hidden=true;return}if(UI.panel)UI.close();else if(G.state==='play')UI.open('gear');return}
    if(G.state!=='play')return;
    if(UI.panel){const map={KeyB:'bag',KeyR:'forge',KeyC:'shop',KeyT:'skill',KeyQ:'quest',KeyM:'map',KeyV:'mount'};if(map[c]){if(UI.panel===map[c])UI.close();else UI.open(map[c])}return}
    if(!$('#story').hidden||!$('#clear').hidden){if(c==='Enter'||c==='Space'){const b=$('#stGo');if(!$('#story').hidden&&b)b.click()}return}
    if(e.repeat&&!KEYMAP[c]&&c!=='KeyJ'&&c!=='Space')return;
    keys[c]=true;
    if(c==='KeyK'||c==='Digit1')castSkill(0);if(c==='KeyL'||c==='Digit2')castSkill(1);if(c==='KeyI'||c==='Digit3')castSkill(2);
    if(c==='KeyH'||c==='Digit4')usePot('potHP');if(c==='KeyG'||c==='Digit5')usePot('potMP');
    if(c==='KeyZ'){toggleAuto()}
    if(c==='KeyX'){toggleRide()}
    if(c==='KeyE'&&G.nearNpc)UI.open(G.nearNpc.act);
    const pm={KeyB:'bag',KeyR:'forge',KeyC:'shop',KeyT:'skill',KeyQ:'quest',KeyM:'map',KeyV:'mount'};if(pm[c])UI.open(pm[c]);
  });
  window.addEventListener('keyup',e=>{keys[e.code]=false});
  window.addEventListener('blur',()=>{for(const k in keys)keys[k]=false;joy.id=null;G.input.atk=false;atkPtr=null;$('#bAtk').classList.remove('on')});
  // cần điều khiển ảo + chuột
  const cvEl=$('#cv');const joyEl=$('#joy'),knob=joyEl.querySelector('i');
  cvEl.addEventListener('pointerdown',e=>{Audio_.unlock();if(G.state!=='play'||G.paused)return;
    if(e.pointerType==='mouse'){mouse.down=true;mouse.x=e.clientX;mouse.y=e.clientY;
      const[wx,wy]=screenToWorld(e.clientX,e.clientY);const t=nearestEnemy(wx,wy+10,40);if(t){G.lastTarget=t;mouse.atk=true}else mouse.atk=false;return}
    if(joy.id==null&&e.clientX<window.innerWidth*0.55){joy.id=e.pointerId;joy.x0=e.clientX;joy.y0=e.clientY;joy.dx=joy.dy=0;joyEl.style.left=e.clientX+'px';joyEl.style.top=e.clientY+'px';joyEl.style.display='block';knob.style.transform='';
      try{cvEl.setPointerCapture(e.pointerId)}catch(_){}}
  });
  cvEl.addEventListener('pointermove',e=>{if(e.pointerType==='mouse'){mouse.x=e.clientX;mouse.y=e.clientY;return}
    if(e.pointerId!==joy.id)return;let dx=e.clientX-joy.x0,dy=e.clientY-joy.y0;const d=Math.hypot(dx,dy),max=52;
    if(d>max){joy.x0+=dx/d*(d-max);joy.y0+=dy/d*(d-max);dx=dx/d*max;dy=dy/d*max;joyEl.style.left=joy.x0+'px';joyEl.style.top=joy.y0+'px'}
    joy.dx=dx/max;joy.dy=dy/max;knob.style.transform=`translate(${dx}px,${dy}px)`});
  const endJ=e=>{if(e.pointerType==='mouse'){mouse.down=false;mouse.atk=false;return}if(e.pointerId!==joy.id)return;joy.id=null;joy.dx=joy.dy=0;joyEl.style.display='none'};
  cvEl.addEventListener('pointerup',endJ);cvEl.addEventListener('pointercancel',endJ);
  // nút đánh (giữ)
  const ba=$('#bAtk');
  ba.addEventListener('pointerdown',e=>{e.preventDefault();Audio_.unlock();atkPtr=e.pointerId;try{ba.setPointerCapture(e.pointerId)}catch(_){}ba.classList.add('on')});
  const endA=e=>{if(e.pointerId!==atkPtr)return;atkPtr=null;ba.classList.remove('on')};
  ba.addEventListener('pointerup',endA);ba.addEventListener('pointercancel',endA);ba.addEventListener('lostpointercapture',endA);
  ba.addEventListener('click',e=>e.preventDefault());
  for(let i=0;i<3;i++){$('#s'+i).addEventListener('pointerdown',e=>{e.preventDefault();Audio_.unlock();if(G.state==='play'&&!G.paused)castSkill(i)})}
  $('#bHP').addEventListener('pointerdown',e=>{e.preventDefault();if(G.state==='play'&&!G.paused)usePot('potHP')});
  $('#bMP').addEventListener('pointerdown',e=>{e.preventDefault();if(G.state==='play'&&!G.paused)usePot('potMP')});
  $('#bAuto').addEventListener('pointerdown',e=>{e.preventDefault();if(G.state==='play'&&!G.paused)toggleAuto()});
  $('#bRide').addEventListener('pointerdown',e=>{e.preventDefault();if(G.state==='play'&&!G.paused)toggleRide()});
  // chặn zoom iOS
  document.addEventListener('gesturestart',e=>e.preventDefault());
  document.addEventListener('dblclick',e=>e.preventDefault());
  document.addEventListener('visibilitychange',()=>{if(document.hidden){saveGame();if(G.state==='play'&&!UI.panel)UI.open('gear')}});
  /* mở khóa âm thanh ở mọi cử chỉ người dùng (iOS chỉ chấp nhận touchend/click, không nhận touchstart/pointerdown) */
  const unl=()=>Audio_.unlock();['touchend','click','keydown'].forEach(ev=>document.addEventListener(ev,unl,{capture:true,passive:true}));
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&Audio_.ctx)Audio_.kick()});
}
function toggleAuto(){const s=G.save.set;s.auto=!s.auto;UI.toast(s.auto?'Đã bật Tự đánh':'Đã tắt Tự đánh');Audio_.play('ui')}
const joy={id:null,dx:0,dy:0},mouse={down:false,x:0,y:0,atk:false};let atkPtr=null;
function screenToWorld(sx,sy){const z=G.cam.z;return[(sx-VW/2)/z+G.cam.x,(sy-VH/2)/z+G.cam.y]}
function readInput(){
  let mx=0,my=0;if(keys.KeyW||keys.ArrowUp)my-=1;if(keys.KeyS||keys.ArrowDown)my+=1;if(keys.KeyA||keys.ArrowLeft)mx-=1;if(keys.KeyD||keys.ArrowRight)mx+=1;
  if(joy.id!=null){const d=Math.hypot(joy.dx,joy.dy);if(d>0.15){mx=joy.dx;my=joy.dy}}
  let atk=!!(keys.KeyJ||keys.Space||atkPtr!=null);
  if(mouse.down&&!mx&&!my){const[wx,wy]=screenToWorld(mouse.x,mouse.y);const p=G.p;
    if(mouse.atk&&G.lastTarget&&!G.lastTarget.dead)atk=true;
    else{const dx=wx-p.x,dy=wy-(p.y-20),d=Math.hypot(dx,dy);if(d>18){mx=dx/d;my=dy/d}}}
  G.input.mx=mx;G.input.my=my;G.input.atk=atk;
  if(mx||my||atk){if(G.save.set.auto&&(mx||my)){/* người chơi tự điều khiển tạm thời */}}
}

/* ---------- vòng lặp ---------- */
let lastT=0;const perf={sum:0,n:0,up:0};
function frame(ts){
  requestAnimationFrame(frame);
  const raw=(ts-lastT)/1000||0.016;let dt=Math.min(0.05,raw);lastT=ts;
  // tự hạ độ phân giải nếu máy chậm (không tính lúc tab ẩn)
  if(raw<0.5&&!document.hidden){perf.sum+=raw;perf.n++;if(perf.n>=120){const avg=perf.sum/perf.n;perf.sum=0;perf.n=0;
    const cap=G.dprCap||2;if(avg>0.026&&cap>1){G.dprCap=cap>1.5?1.5:1;resize()}else if(avg<0.018&&cap<2&&perf.up++>4){G.dprCap=Math.min(2,cap+0.5);perf.up=0;resize()}}}
  try{
    if(!G.W)return;
    if(G.state==='title'){G.t+=dt;G.cam.x+=Math.cos(G.t*0.1)*12*dt;G.cam.y+=Math.sin(G.t*0.08)*8*dt;titleScene(dt);render(dt);return}
    if(G.state==='select'){G.t+=dt;animSelect();titleScene(dt);render(dt);return}
    if(G.state==='play'||G.state==='dead'){
      readInput();
      if(!G.paused){if(G.hitstop>0){G.hitstop-=dt}else update(dt*G.slow)}
      else updateFx(0);
      render(dt);UI.hud();
    }
  }catch(err){console.error(err);if(!G.errShown){G.errShown=1;UI.toast('Lỗi: '+err.message,'warn')}}
}
/* cảnh nền cho màn tiêu đề: vài con sói đi lang thang */
function titleScene(dt){
  if(!G.p){G.p=null}
  if(G.enemies.length<4){const W=G.W;for(let k=0;k<4;k++){const x=W.out.x+rand(-200,260),y=W.out.y+rand(-160,40);if(!isSolidPt(W,x,y))spawnEnemy(pick(['soi','lon','khi']),x,y,1,false)}}
  for(const e of G.enemies){e.st-=dt;if(e.st<=0){e.st=rand(2,4);const a=Math.random()*TAU;e.wx=e.hx+Math.cos(a)*120;e.wy=e.hy+Math.sin(a)*120}
    const d=dist(e.x,e.y,e.wx,e.wy);e.moving=d>8;if(e.moving){const a=Math.atan2(e.wy-e.y,e.wx-e.x);moveEnt(G.W,e,Math.cos(a)*40*dt,Math.sin(a)*40*dt);e.f=Math.cos(a)>=0?1:-1;e.walk+=dt*8}}
  updateFx(dt);
}

/* ---------- móc WebView & hot reload ---------- */
window.DVHK={pause(){G.paused=true},resume(){if(!UI.panel)G.paused=false},getState(){const S=G.save;return S?{cls:S.cls,lvl:S.lvl,map:S.map,score:S.score,best:S.best,gold:S.gold}:null}};
try{window.claude&&window.claude.hot&&window.claude.hot.snapshot&&window.claude.hot.snapshot(()=>({save:G.save}))}catch(e){}
window.__G=G;

function boot(){
  if(!window.gsap){/* dự phòng khi không tải được GSAP */}
  UI.init();setupCanvas();setupInput();
  requestAnimationFrame(frame);
  const go=()=>showTitle();
  if(document.fonts&&document.fonts.ready){Promise.race([document.fonts.ready,new Promise(r=>setTimeout(r,1500))]).then(go)}else go();
}
const bootFn=()=>boot();
try{if(window.claude&&window.claude.hot&&window.claude.hot.ready)window.claude.hot.ready(bootFn);else bootFn()}catch(e){bootFn()}

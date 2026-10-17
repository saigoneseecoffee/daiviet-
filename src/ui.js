/* ============ GIAO DIỆN ============ */
const $=s=>document.querySelector(s);
const ICON={
  bag:'<svg viewBox="0 0 24 24" fill="none" stroke="#ffd98a" stroke-width="1.8" stroke-linejoin="round"><path d="M6 8h12l1 12H5z"/><path d="M9 8V6a3 3 0 016 0v2"/><path d="M9 12h6"/></svg>',
  forge:'<svg viewBox="0 0 24 24" fill="none" stroke="#ffd98a" stroke-width="1.8" stroke-linejoin="round"><path d="M3 10h13c0 3-2 4-5 4v3h4v3H7v-3h4v-3C7 14 4 13 3 10z"/><path d="M15 3l5 5-2 2-5-5z"/></svg>',
  shop:'<svg viewBox="0 0 24 24" fill="none" stroke="#ffd98a" stroke-width="1.8" stroke-linejoin="round"><path d="M3 9l2-5h14l2 5"/><path d="M3 9h18v2a3 3 0 01-6 0 3 3 0 01-6 0 3 3 0 01-6 0z"/><path d="M5 13v7h14v-7"/></svg>',
  skill:'<svg viewBox="0 0 24 24" fill="none" stroke="#ffd98a" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 3a4.5 4.5 0 000 9 4.5 4.5 0 010 9"/><circle cx="12" cy="7.5" r="1.2" fill="#ffd98a"/><circle cx="12" cy="16.5" r="1.2"/></svg>',
  quest:'<svg viewBox="0 0 24 24" fill="none" stroke="#ffd98a" stroke-width="1.8" stroke-linejoin="round"><path d="M6 3h11a2 2 0 012 2v14a2 2 0 01-2 2H6"/><path d="M6 3a2 2 0 00-2 2v1h4V5a2 2 0 00-2-2zM6 21a2 2 0 01-2-2v-1h4v1a2 2 0 01-2 2z"/><path d="M10 9h6M10 13h6"/></svg>',
  map:'<svg viewBox="0 0 24 24" fill="none" stroke="#ffd98a" stroke-width="1.8" stroke-linejoin="round"><path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/></svg>',
  mount:'<svg viewBox="0 0 24 24" fill="none" stroke="#ffd98a" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round"><path d="M5 20l1.5-6 4-1.5 3-4 1.5-4 1.5 2.5 3 1.5-1 2.5-3-.8-1.8 3 .8 6.8"/><path d="M6.5 14L5 20M10.5 12.5l.8 7.5M16.5 12l1 8"/><circle cx="17.6" cy="6.2" r=".7" fill="#ffd98a"/></svg>',
  gear:'<svg viewBox="0 0 24 24" fill="none" stroke="#ffd98a" stroke-width="1.8"><circle cx="12" cy="12" r="3.2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/></svg>',
  sndOn:'<svg viewBox="0 0 24 24" fill="none" stroke="#ffd98a" stroke-width="1.8" stroke-linejoin="round"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16 9a4 4 0 010 6M18.5 6.5a7.5 7.5 0 010 11"/></svg>',
  sndOff:'<svg viewBox="0 0 24 24" fill="none" stroke="#bba98a" stroke-width="1.8" stroke-linejoin="round"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M17 9l5 6M22 9l-5 6"/></svg>',
};
/* biểu tượng vật phẩm theo ô */
function itemSvg(slot,col,cls){
  const s=`stroke="${col}" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"`;
  if(slot==='vk'){cls=cls||G.save.cls;
    if(cls==='kiem')return`<svg viewBox="0 0 24 24" ${s}><path d="M5 19L18 6l1-2-2 1L4 18"/><path d="M7 14l3 3M4 20l2-2"/></svg>`;
    if(cls==='cung')return`<svg viewBox="0 0 24 24" ${s}><path d="M6 3c8 3 8 15 0 18"/><path d="M6 3v18"/><path d="M4 12h16M17 9l3 3-3 3"/></svg>`;
    if(cls==='giao')return`<svg viewBox="0 0 24 24" ${s}><path d="M4 20L18 6"/><path d="M18 6l3-3-1 5-2-2z" fill="${col}"/><path d="M14 8l2 2"/></svg>`;
    if(cls==='dao')return`<svg viewBox="0 0 24 24" ${s}><path d="M5 20C9 14 13 9 19 4"/><path d="M8 20c2-6 6-11 12-13"/></svg>`;
    if(cls==='con')return`<svg viewBox="0 0 24 24" ${s}><path d="M4 21L20 3"/><path d="M5.5 19.5l-1.5 1.5M18.5 4.5L20 3" stroke-width="3.5"/></svg>`;
    return`<svg viewBox="0 0 24 24" ${s}><path d="M12 20L5 8a8 8 0 0114 0z"/><path d="M12 20V8M8.5 9.5L12 20l3.5-10.5"/></svg>`}
  if(slot==='mu')return`<svg viewBox="0 0 24 24" ${s}><path d="M4 15a8 8 0 0116 0z"/><path d="M3 15h18M12 7V3"/><circle cx="12" cy="3" r="1" fill="${col}"/></svg>`;
  if(slot==='ao')return`<svg viewBox="0 0 24 24" ${s}><path d="M8 3l4 2 4-2 4 4-3 3v11H7V10L4 7z"/><path d="M7 14h10"/></svg>`;
  if(slot==='dai')return`<svg viewBox="0 0 24 24" ${s}><rect x="3" y="9" width="18" height="6" rx="2"/><rect x="9.5" y="8" width="5" height="8" rx="1"/></svg>`;
  if(slot==='giay')return`<svg viewBox="0 0 24 24" ${s}><path d="M7 3v11l-3 3v3h15c1-2-1-4-4-4l-2-2V3z"/></svg>`;
  return`<svg viewBox="0 0 24 24" ${s}><circle cx="12" cy="14" r="6"/><circle cx="12" cy="14" r="2.5"/><path d="M12 8V3M9 4h6"/></svg>`;
}
const ICO_GOLD='<svg viewBox="0 0 16 16" width="14" height="14"><circle cx="8" cy="8" r="6.5" fill="#c08a2a"/><circle cx="7.4" cy="7.4" r="4.8" fill="#ffd23a"/></svg>';
const ICO_ORE='<svg viewBox="0 0 16 16" width="14" height="14"><path d="M8 1l6 6-3 7H5L2 7z" fill="#4a6a8a"/><path d="M8 2l4 5-4 2z" fill="#9fd8ff"/></svg>';

const anim=window.gsap||null;
const UI={
  cache:{},panel:null,sel:null,forgeSel:null,hintKey:null,
  init(){
    document.body.classList.toggle('fine',FINE);
    const M=[['bag','Túi đồ','B'],['forge','Lò rèn','R'],['shop','Chợ','C'],['skill','Kỹ năng','T'],['mount','Thú cưỡi','V'],['gear','Cài đặt','Esc']];
    $('#menu').innerHTML=M.map(([k,l,kc])=>`<button class="mbtn" data-p="${k}" aria-label="${l}">${ICON[k]}<span class="dot" hidden></span><span class="kc">${kc}</span></button>`).join('');
    $('#menu').addEventListener('click',e=>{const b=e.target.closest('[data-p]');if(b){Audio_.play('ui');UI.open(b.dataset.p)}});
    $('#qt').addEventListener('click',()=>UI.open('quest'));$('#miniWrap').addEventListener('click',()=>UI.open('map'));
    $('#shClose').addEventListener('click',()=>UI.close());
    $('#panel').addEventListener('pointerdown',e=>{if(e.target.id==='panel')UI.close()});
    $('#npcBtn').addEventListener('click',()=>{const n=G.nearNpc;if(n)UI.open(n.act)});
    $('#cfNo').addEventListener('click',()=>{$('#confirm').hidden=true});
  },
  /* ---- HUD mỗi khung ---- */
  hud(){
    const p=G.p,S=G.save,c=this.cache;if(!p)return;
    const hpR=p.hp/p.maxhp;$('#hpBar i').style.transform=`scaleX(${hpR})`;
    c.hpLag=c.hpLag==null?hpR:Math.max(hpR,c.hpLag-0.01);$('#hpBar em').style.transform=`scaleX(${c.hpLag})`;
    const ht=fmt(p.hp)+'/'+fmt(p.maxhp);if(c.ht!==ht){c.ht=ht;$('#hpBar b').textContent=ht}
    $('#mpBar i').style.transform=`scaleX(${p.mp/p.maxmp})`;const mt=fmt(p.mp)+'/'+fmt(p.maxmp);if(c.mt!==mt){c.mt=mt;$('#mpBar b').textContent=mt}
    $('#expFill').style.transform=`scaleX(${S.exp/need(S.lvl)})`;
    if(c.lv!==S.lvl){c.lv=S.lvl;$('#lvBadge').textContent=S.lvl;let r=RANKS[0][1];for(const[l,n]of RANKS)if(S.lvl>=l)r=n;$('#pRank').textContent=r}
    if(c.pow!==p.power){if(c.pow!=null&&anim&&p.power>c.pow){anim.fromTo('#pPow',{scale:1.4,color:'#7dff8a'},{scale:1,color:'#ffd98a',duration:.6})}c.pow=p.power;$('#pPow').textContent=fmtFull(p.power)}
    const gs=fmt(S.gold);if(c.g!==gs){c.g=gs;$('#gold').textContent=gs}
    if(c.o!==S.ore){c.o=S.ore;$('#ore').textContent=S.ore}
    const sc=fmt(S.score);if(c.sc!==sc){c.sc=sc;$('#score').textContent=sc}
    if(c.nh!==S.potHP){c.nh=S.potHP;$('#nHP').textContent=S.potHP}if(c.nm!==S.potMP){c.nm=S.potMP;$('#nMP').textContent=S.potMP}
    // kỹ năng
    for(let i=0;i<3;i++){const sk=p.cls.skills[i],el=$('#s'+i),un=S.lvl>=sk.un&&S.skl[i]>0;
      const st=un?(p.skCd[i]>0?'cd':p.mp<sk.mp?'mp':'ok'):'lock';
      el.classList.toggle('lock',!un);el.classList.toggle('nomp',st==='mp');
      const cdMax=skillCd(i);const a=p.skCd[i]>0?p.skCd[i]/cdMax*360:0;el.querySelector('.cd').style.setProperty('--a',a+'deg');
      const txt=!un?'':p.skCd[i]>0?(p.skCd[i]<1?p.skCd[i].toFixed(1):Math.ceil(p.skCd[i])):'';
      const key='sk'+i;if(c[key]!==txt+st){c[key]=txt+st;el.querySelector('.cdt').textContent=!un?'Cấp '+sk.un:txt}}
    // nhiệm vụ
    if(G.dirty.quest||c.qmap!==S.map){G.dirty.quest=0;c.qmap=S.map;this.renderTracker()}
    // boss
    const b=G.boss;$('#bossbar').hidden=!b||b.dead;if(b&&!b.dead){$('#bossHp').style.transform=`scaleX(${Math.max(0,b.hp/b.max)})`;const bn=b.name+' · cấp '+b.lv+(b.enraged?' · Nổi giận':'');if(c.bn!==bn){c.bn=bn;$('#bossName').textContent=bn}}
    // chấm đỏ menu
    const dots={bag:S.bag.filter(it=>itemPower(it)>itemPower(S.equip[it.slot])).length,skill:Math.max(0,S.sp|0),quest:0};
    for(const k in dots){const d=document.querySelector(`[data-p="${k}"] .dot`);if(!d)continue;const v=dots[k];if(c['d'+k]!==v){c['d'+k]=v;d.hidden=!v;d.textContent=v>9?'9+':v}}
    $('#bAuto').classList.toggle('on',!!S.set.auto);$('#bRide').classList.toggle('on',!!S.riding);
    const hz=$('#horde');if(G.horde){hz.hidden=false;const ht=`Quái triều ${G.horde.kill}/${G.horde.need} · ${Math.ceil(G.horde.t)} giây`;if(c.hz!==ht){c.hz=ht;hz.textContent=ht}}else hz.hidden=true;
    this.minimap();this.hint();
    if(G.t-(c.pt||0)>0.12){c.pt=G.t;drawPortrait($('#pcv'),S.cls,G.t,p.atkAnim)}
  },
  renderTracker(){
    const S=G.save,M=curMap(),step=M.quest[S.qs[S.map]];let h='';
    if(step){const n=step.t==='boss'?'':` <em>${S.qp}/${step.n}</em>`;h+=`<div class="qh">${esc(M.name.toUpperCase())} · NHIỆM VỤ ${S.qs[S.map]+1}/4</div><div class="qm">${esc(step.t==='collect'?step.txt+' từ '+ET[step.e].name:step.txt)}${n}</div>`;
      if(step.t!=='boss')h+=`<div class="qprog"><i style="transform:scaleX(${S.qp/step.n})"></i></div>`}
    else h+=`<div class="qh">${esc(M.name.toUpperCase())} · ĐÃ HOÀN THÀNH</div><div class="qm">${S.map<5?'Gặp Xa Phu ở trại để tới '+MAPS[S.map+1].name:'Luân Hồi để thử thách cao hơn'}</div>`;
    if(!S.side)newSide();h+=`<div class="qs">Dã Tẩu: ${esc(S.side.txt)} <em>${S.side.t==='gold'?fmt(S.side.p)+'/'+fmt(S.side.n):S.side.p+'/'+S.side.n}</em></div>`;
    $('#qt').innerHTML=h;
  },
  minimap(){
    const W=G.W,p=G.p,c=$('#mini'),g=c.getContext('2d');const d=Math.min(2,window.devicePixelRatio||1),sz=c.clientWidth||104;
    if(c.width!==Math.round(sz*d)){c.width=Math.round(sz*d);c.height=Math.round(sz*d)}
    const span=26,px=p.x/T,py=p.y/T,k=c.width/span;
    g.setTransform(1,0,0,1,0,0);g.fillStyle='#0e0a08';g.fillRect(0,0,c.width,c.height);g.imageSmoothingEnabled=false;
    g.drawImage(W.mini,px-span/2,py-span/2,span,span,0,0,c.width,c.height);
    const tp=(x,y)=>[(x/T-px+span/2)*k,(y/T-py+span/2)*k];
    if(W.camps)for(const c of W.camps){if(!c.alive)continue;const[x,y]=tp(c.x,c.y);if(x<0||y<0||x>c.width||y>c.height)continue;g.fillStyle='#ff9a3a';g.beginPath();g.moveTo(x,y-5*d);g.lineTo(x+5*d,y+4*d);g.lineTo(x-5*d,y+4*d);g.closePath();g.fill()}
    g.fillStyle='#ffd23a';let [cx_,cy_]=tp(W.camp.x,W.camp.y);g.beginPath();g.arc(cx_,cy_,4*d,0,TAU);g.fill();
    let [ax,ay]=tp(W.arena.x,W.arena.y);g.strokeStyle='#ff5b3d';g.lineWidth=2*d;g.beginPath();g.arc(ax,ay,6*d,0,TAU);g.stroke();
    for(const e of G.enemies){if(e.dead)continue;const[x,y]=tp(e.x,e.y);if(x<0||y<0||x>c.width||y>c.height)continue;g.fillStyle=e.boss?'#ff3a2a':e.elite?'#ffb32a':'#e86a5a';g.fillRect(x-1.5*d,y-1.5*d,(e.boss?5:3)*d,(e.boss?5:3)*d)}
    const q=G.questArrow;if(q){let[x,y]=tp(q.x,q.y);x=clamp(x,5*d,c.width-5*d);y=clamp(y,5*d,c.height-5*d);g.fillStyle='#ffd23a';g.beginPath();g.moveTo(x,y-5*d);g.lineTo(x+4*d,y);g.lineTo(x,y+5*d);g.lineTo(x-4*d,y);g.fill()}
    g.save();g.translate(c.width/2,c.height/2);g.rotate(p.aim);g.fillStyle='#fff';g.beginPath();g.moveTo(6*d,0);g.lineTo(-4*d,-4*d);g.lineTo(-4*d,4*d);g.fill();g.restore();
    if(this.cache.mn!==W.mi){this.cache.mn=W.mi;$('#mapName').textContent=W.M.name+(G.save.ng?' · Luân Hồi '+G.save.ng:'')}
  },
  hint(){
    const S=G.save,t=S.tut;let k=null,h='';
    if(G.state!=='play'||this.panel){k=null}
    else if(!t.move){k='move';h=FINE?'Dùng <b>W A S D</b> hoặc phím mũi tên để di chuyển. Nhấn giữ chuột để chạy theo con trỏ.':'Đặt ngón tay ở <b>nửa trái màn hình</b> rồi kéo để di chuyển.'}
    else if(!t.atk){k='atk';h=FINE?'Giữ <b>J</b> hoặc <b>Space</b> để đánh. Nhân vật tự nhắm quái gần nhất.':'Giữ nút <b>Đánh</b> màu đỏ. Nhân vật tự nhắm và tự tiến tới quái gần nhất.'}
    else if(!$('#offer').hidden){k=null}
    else if(!t.equip&&S.bag.length&&S.kills>0){k='eq';h='Bạn vừa nhặt trang bị. Bấm <b>Trang bị</b> trên thẻ bên phải, hoặc mở <b>Túi đồ</b>.'}
    else if(!t.skill&&S.kills>=3){k='sk';h=FINE?'Dùng kỹ năng bằng <b>K</b>, <b>L</b>, <b>I</b>. Kỹ năng tốn nội lực (thanh xanh).':'Bấm các <b>nút tròn nhỏ</b> quanh nút Đánh để tung kỹ năng.'}
    else if(S.mounts&&!Object.keys(S.mounts).length&&S.lvl>=2&&S.gold>=150&&!t.mount){k='mt';h='Đủ 150 vàng rồi. Gặp <b>Mã Phu</b> ở trại hoặc mở <b>Thú cưỡi</b> để mua ngựa, chạy nhanh hơn hẳn.'}
    else if(!t.forge&&S.ore>=4&&S.lvl>=3){k='fg';h='Đủ Huyền Thiết rồi. Mở <b>Lò rèn</b> để cường hóa vũ khí, mỗi cấp tăng 10% chỉ số.'}
    if(k&&k===this.hintKey&&(k==='mt'||k==='fg')&&G.t-this.hintT>12){if(k==='mt')t.mount=true;else t.forge=true}
    if(k!==this.hintKey){this.hintKey=k;this.hintT=G.t;const el=$('#hint');if(!k){el.hidden=true}else{el.innerHTML=h;el.hidden=false;anim&&anim.fromTo(el,{y:16,autoAlpha:0},{y:0,autoAlpha:1,duration:.4})}}
    $('#joyHint').hidden=FINE||t.move||G.state!=='play';
  },
  /* ---- thông báo ---- */
  toast(msg,type){const box=$('#toasts');const el=document.createElement('div');el.className='toast '+(type||'');el.textContent=msg;box.appendChild(el);
    while(box.children.length>3)box.firstChild.remove();
    if(anim){anim.fromTo(el,{y:-10,autoAlpha:0},{y:0,autoAlpha:1,duration:.25});anim.to(el,{autoAlpha:0,y:-8,delay:type==='quest'?3.6:2.4,duration:.4,onComplete:()=>el.remove()})}
    else setTimeout(()=>el.remove(),2800)},
  loot(txt,col,isGold){const box=$('#feed');if(isGold){const last=box.lastChild;if(last&&last.dataset.g&&Date.now()-last.dataset.t<900){const v=(+last.dataset.v)+parseInt(txt.replace(/\D/g,''));last.dataset.v=v;last.dataset.t=Date.now();last.textContent='+'+fmt(v)+' vàng';return}}
    const el=document.createElement('div');el.className='feed';el.style.color=col;el.textContent=txt;if(isGold){el.dataset.g=1;el.dataset.v=parseInt(txt.replace(/\D/g,''));el.dataset.t=Date.now()}
    box.appendChild(el);while(box.children.length>5)box.firstChild.remove();
    if(anim){anim.fromTo(el,{x:-14,autoAlpha:0},{x:0,autoAlpha:1,duration:.2});anim.to(el,{autoAlpha:0,delay:2.6,duration:.5,onComplete:()=>el.remove()})}else setTimeout(()=>el.remove(),3000)},
  levelUp(l){const el=$('#lvl');$('#lvlN').textContent=l;el.hidden=false;
    if(anim){anim.killTweensOf(el);anim.fromTo(el,{scale:.4,autoAlpha:0},{scale:1,autoAlpha:1,duration:.5,ease:'back.out(2)'});anim.to(el,{autoAlpha:0,y:-30,delay:1.2,duration:.5,onComplete:()=>{el.hidden=true;anim.set(el,{y:0})}})}
    else setTimeout(()=>el.hidden=true,1500);
    setTimeout(()=>{if(G.save&&G.save.sp>0)UI.toast(`Có ${G.save.sp} điểm kỹ năng. Mở Kỹ năng để nâng.`,'skill')},900);
    postApp({type:'levelup',lvl:l})},
  combo(n){const el=$('#combo');if(n<3||!$('#offer').hidden)return;$('#comboN').textContent=n;el.hidden=false;el.classList.toggle('hot',n>=15);
    if(anim){anim.killTweensOf(el);anim.fromTo('#comboN',{scale:1.5},{scale:1,duration:.25,ease:'back.out(3)'});anim.fromTo(el,{autoAlpha:1},{autoAlpha:0,delay:2.2,duration:.4,onComplete:()=>{el.hidden=true}})}
    if(n===10||n===25||n===50){this.toast(n+' liên trảm! Điểm thưởng tăng '+Math.min(n,50)*2+'%','quest')}},
  questDone(title,rew){this.toast('Hoàn thành: '+title,'quest');setTimeout(()=>this.toast(rew,'quest'),400)},
  flashSkill(i){const el=$('#s'+i);anim&&anim.fromTo(el,{scale:1.6},{scale:1,duration:.7,ease:'elastic.out(1,0.4)'})},
  castFx(i){const el=$('#s'+i);anim&&anim.fromTo(el,{scale:.86},{scale:1,duration:.3,ease:'back.out(3)'})},
  pulse(sel){const el=$(sel);anim&&anim.fromTo(el,{scale:1.25},{scale:1,duration:.4})},
  npcPrompt(n){const b=$('#npcBtn');if(!n){b.hidden=true;return}const L={mount:'Thú cưỡi',forge:'Rèn đồ',shop:'Mua hàng',quest:'Xem nhiệm vụ',map:'Đi chương khác',skill:'Học võ công',bag:'Mở kho đồ'};
    b.textContent=`${n.name}: ${L[n.act]}${FINE?' (E)':''}`;b.hidden=false;anim&&anim.fromTo(b,{y:10,autoAlpha:0},{y:0,autoAlpha:1,duration:.25})},
  offerEquip(it){const el=$('#offer');const cur=G.save.equip[it.slot];const d=itemPower(it)-itemPower(cur);
    el.innerHTML=`<div class="oh">TRANG BỊ TỐT HƠN</div><div class="ihead"><span class="iframe sm" style="--rc:${RARITY[it.rar].color}">${itemImg(it)}</span><div><div class="on" style="color:${RARITY[it.rar].color}">${esc(itemName(it))}</div><div class="ov">Lực chiến +${fmtFull(d)}</div></div></div>
      <div class="orow"><button class="btn sm" id="ofEq">Trang bị</button><button class="btn sec sm" id="ofNo">Để sau</button></div>`;
    el.hidden=false;el._it=it;$('#ofEq').onclick=()=>{if(G.save.bag.includes(it))equipItem(it);el.hidden=true;UI.toast('Đã trang bị '+itemName(it))};$('#ofNo').onclick=()=>el.hidden=true;
    anim&&anim.fromTo(el,{x:30,autoAlpha:0},{x:0,autoAlpha:1,duration:.3});clearTimeout(this.offT);this.offT=setTimeout(()=>{if(el._it===it)el.hidden=true},8000)},
  bossIntro(e){const el=$('#bossIntro');$('#biT1').textContent=e.def.title;$('#biT2').textContent=e.name;el.hidden=false;
    if(anim){anim.fromTo(el,{autoAlpha:0,scaleY:.2},{autoAlpha:1,scaleY:1,duration:.35,ease:'power3.out'});anim.fromTo('#biT2',{letterSpacing:'0.4em'},{letterSpacing:'0.02em',duration:1.2,ease:'power2.out'});anim.to(el,{autoAlpha:0,delay:1.9,duration:.4,onComplete:()=>el.hidden=true})}
    else setTimeout(()=>el.hidden=true,2200)},
  dead(){$('#dead').hidden=false;$('#deadMsg').textContent='Hồi phục ở trại sau 3 giây. Mất 10% vàng.';anim&&anim.fromTo('#dead .bigmsg',{scale:1.3,autoAlpha:0},{scale:1,autoAlpha:1,duration:.6});postApp({type:'death'})},
  respawned(lost){$('#dead').hidden=true;if(lost)this.toast(`Mất ${fmt(lost)} vàng. Hãy rèn đồ hoặc lên cấp rồi quay lại.`,'warn')},
  chapterClear(mi,r){
    const S=G.save,last=mi===5,next=MAPS[mi+1];G.paused=true;
    $('#clearPaper').innerHTML=`<div class="stamp">Đại<br>Thắng</div><div class="era">CHƯƠNG ${mi+1} · ${esc(MAPS[mi].era.toUpperCase())}</div><h3>${esc(MAPS[mi].name)}</h3>
      <p>${esc(ET[MAPS[mi].boss].name)} đã bị đánh bại.${last?' Đại Việt sạch bóng quân thù. Bạn có thể Luân Hồi: quái mạnh hơn 30 cấp, điểm thưởng tăng, giữ nguyên cấp và trang bị.':' Con đường tới '+esc(next.name)+' đã mở.'}</p>
      <div class="rewards"><div>${ICO_GOLD} +${fmtFull(r.gold)} vàng</div><div>${ICO_ORE} +${r.ore} Huyền Thiết, +1 Bùa Bảo Hộ</div><div class="ihead" style="justify-content:center"><span class="iframe sm" style="--rc:${RARITY[r.item.rar].color}">${itemImg(r.item)}</span><span class="loot" style="color:${RARITY[r.item.rar].color}">${esc(itemName(r.item))}</span></div><div>Điểm: ${fmtFull(S.score)}</div></div>
      <div class="row" style="justify-content:center">${last?'<button class="btn" id="clNg">Luân Hồi</button>':'<button class="btn" id="clNext">Tới '+esc(next.name)+'</button>'}<button class="btn sec" id="clStay">Ở lại luyện công</button></div>`;
    $('#clear').hidden=false;anim&&anim.fromTo('#clearPaper',{y:40,rotation:-2,autoAlpha:0},{y:0,rotation:0,autoAlpha:1,duration:.6,ease:'back.out(1.4)'});
    const close=()=>{$('#clear').hidden=true;G.paused=false};
    $('#clStay').onclick=close;
    if(last)$('#clNg').onclick=()=>{close();S.ng++;S.qs=[0,0,0,0,0,0];S.qp=0;S.cleared=[];travel(0,true)};
    else $('#clNext').onclick=()=>{close();travel(mi+1,true)};
    postApp({type:'chapterClear',map:mi});
  },
  confirm(msg,fn){$('#cfMsg').textContent=msg;$('#confirm').hidden=false;$('#cfYes').onclick=()=>{$('#confirm').hidden=true;fn()}},

  /* ---- bảng chức năng ---- */
  open(k,tab){
    if(G.state!=='play'&&G.state!=='dead')return;
    if(k==='gear'&&this.panel==='gear'){this.close();return}
    const titles={mount:'Thú cưỡi',bag:'Túi đồ',forge:'Lò rèn',shop:'Chợ phiên',skill:'Kỹ năng',quest:'Nhiệm vụ',map:'Bản đồ & Xa phu',gear:'Cài đặt'};
    const first=!this.panel;this.panel=k;this.tab=tab||null;G.paused=true;G.input.atk=false;G.input.mx=G.input.my=0;
    $('#shTitle').textContent=titles[k];$('#panel').hidden=false;this.render();
    if(first&&anim){const mob=window.innerWidth<820||window.innerHeight<560;anim.fromTo('#sheet',mob?{y:80,autoAlpha:0}:{scale:.96,autoAlpha:0},{y:0,scale:1,autoAlpha:1,duration:.28,ease:'power3.out'});anim.fromTo('#panel',{backgroundColor:'rgba(10,6,4,0)'},{backgroundColor:'rgba(10,6,4,.55)',duration:.25})}
    setTimeout(()=>$('#shClose').focus({preventScroll:true}),30);
  },
  close(){if(!this.panel)return;this.panel=null;$('#panel').hidden=true;G.paused=false;this.sel=null;saveGame()},
  render(){const k=this.panel;if(!k)return;const body=$('#shBody'),tabs=$('#shTabs');tabs.innerHTML='';tabs.hidden=true;const st=body.scrollTop;
    body.innerHTML=this['p_'+k]();this['b_'+k]&&this['b_'+k](body);body.scrollTop=st},
  setTabs(list,cur){const tabs=$('#shTabs');tabs.hidden=false;tabs.innerHTML=list.map(([k,l])=>`<button class="tab" role="tab" aria-selected="${k===cur}" data-t="${k}">${l}</button>`).join('');
    tabs.onclick=e=>{const b=e.target.closest('[data-t]');if(b){this.tab=b.dataset.t;this.render()}}},

  cellHtml(it,opt){opt=opt||{};if(!it)return`<div class="cell empty">${opt.slot?itemSvg(opt.slot,'#5a4a3a'):''}</div>`;
    const col=RARITY[it.rar].color,up=opt.cmp&&itemPower(it)>itemPower(G.save.equip[it.slot]);
    return`<button class="cell${opt.eq?' eqd':''}" style="--rc:${col}" data-id="${it.id}" aria-label="${esc(itemName(it))}" aria-pressed="${this.sel===it.id}">${itemImg(it)}${it.enh?`<span class="e">+${it.enh}</span>`:''}${up?'<span class="up">▲</span>':''}</button>`},
  itemCard(it,cmpTo){
    const s=itemStats(it),c=cmpTo?itemStats(cmpTo):{};const R=RARITY[it.rar];
    let h=`<div class="icard"><div class="ihead"><span class="iframe" style="--rc:${R.color}">${itemImg(it)}</span><div><div class="nm" style="color:${R.color}">${esc(itemName(it))}</div><div class="meta">${R.name} · ${SLOT_NAME[it.slot]} · cấp ${it.ilvl} · Lực chiến ${fmtFull(itemPower(it))}</div></div></div>`;
    for(const k in s){const v=s[k],u=(k==='crit'||k==='spd')?'%':'';let dl='';if(cmpTo){const d=Math.round((v-(c[k]||0))*10)/10;if(d)dl=` <span class="dlt ${d>0?'up':'dn'}">${d>0?'+':''}${d}</span>`}
      h+=`<div class="ln"><span>${STAT_NAME[k]}</span><b>+${v}${u}${dl}</b></div>`}
    for(const[k,v]of it.aff)h+=`<div class="ln af"><span>${AFFIX[k].name}</span><b>+${v}${AFFIX[k].u}</b></div>`;
    return h+'</div>'},

  /* Túi đồ */
  p_bag(){const S=G.save,p=G.p;
    let h=`<div class="sec"><div class="bigpow"><b>${fmtFull(p.power)}</b><span>Lực chiến · ${esc(S.name)} · ${esc(p.cls.name)} cấp ${S.lvl}</span></div>
      <div class="statgrid"><div><span>Công</span><b>${fmtFull(p.atk)}</b></div><div><span>Thủ</span><b>${fmtFull(p.def)}</b></div><div><span>Sinh lực</span><b>${fmtFull(p.maxhp)}</b></div><div><span>Nội lực</span><b>${fmtFull(p.maxmp)}</b></div>
      <div><span>Chí mạng</span><b>${p.crit.toFixed(1)}%</b></div><div><span>ST chí mạng</span><b>${Math.round(p.cdmg)}%</b></div><div><span>Tốc đánh</span><b>+${p.aspd.toFixed(0)}%</b></div><div><span>Tốc chạy</span><b>+${p.spdP.toFixed(0)}%</b></div>
      <div><span>Hút máu</span><b>${p.ls.toFixed(1)}%</b></div><div><span>Kinh nghiệm</span><b>+${p.expB.toFixed(0)}%</b></div></div></div>
      <div class="sec"><h4>BỘ TRANG BỊ</h4><p class="hist" style="color:${p.set?'var(--vang2)':'var(--dim)'}">${p.set?`${p.set.name}: +${p.set.atkp}% công, +${p.set.hpp}% sinh lực, +${p.set.def}% thủ. Hào quang dưới chân.`:'Mặc đủ 6 món cùng bậc (từ bậc Sắt, cấp đồ 7 trở lên) để kích hoạt thưởng bộ và hào quang. Tổng cấp rèn từ +24 cũng mở hào quang.'}</p></div>
      <div class="sec"><h4>ĐANG MẶC</h4><div class="eqgrid">${SLOTS.map(sl=>`<div class="eqs">${this.cellHtml(S.equip[sl],{slot:sl,eq:1})}${SLOT_NAME[sl]}</div>`).join('')}</div></div>
      <div class="sec"><h4>TÚI ${S.bag.length}/${BAG_MAX}</h4>`;
    if(!S.bag.length)h+=`<p class="hist" style="color:var(--dim)">Túi trống. Đánh quái và tinh anh để nhặt trang bị.</p>`;
    h+=`<div class="bag">${S.bag.map(it=>this.cellHtml(it,{cmp:1})).join('')}</div>
      <div class="row"><button class="btn sec sm" id="bgSort">Sắp xếp</button><button class="btn sec sm" id="bgSalv">Phân giải đồ yếu</button></div></div>`;
    const it=this.findItem(this.sel);
    if(it){const eq=S.equip[it.slot]===it,cur=S.equip[it.slot];
      h+=`<div class="detail"><div class="cmpcol">${this.itemCard(it,eq?null:cur)}${!eq&&cur?`<div class="old"><div class="meta" style="font:600 11px var(--f-ui);color:var(--dim);margin-bottom:4px">ĐANG MẶC</div>${this.itemCard(cur)}</div>`:''}</div>
        <div class="row">${eq?'<button class="btn sec sm" id="dUn">Tháo ra</button>':'<button class="btn sm" id="dEq">Trang bị</button>'}<button class="btn gold sm" id="dFg">Rèn</button>${eq?'':`<button class="btn sec sm" id="dSv">Phân giải (+${salvageValue(it).ore} Huyền Thiết)</button>`}</div></div>`}
    return h},
  findItem(id){if(id==null)return null;const S=G.save;for(const sl of SLOTS)if(S.equip[sl]&&S.equip[sl].id===id)return S.equip[sl];return S.bag.find(i=>i.id===id)||null},
  b_bag(body){const S=G.save;
    body.querySelectorAll('.cell[data-id]').forEach(b=>b.onclick=()=>{this.sel=+b.dataset.id;Audio_.play('ui');this.render();if(window.innerHeight<=500){const d=body.querySelector('.detail');d&&d.scrollIntoView({block:'nearest',behavior:'smooth'})}});
    const on=(id,fn)=>{const b=body.querySelector(id);if(b)b.onclick=fn};
    on('#bgSort',()=>{S.bag.sort((a,b)=>b.rar-a.rar||itemPower(b)-itemPower(a));this.render()});
    on('#bgSalv',()=>{const weak=S.bag.filter(it=>it.rar<=1&&it.enh===0&&itemPower(it)<=itemPower(S.equip[it.slot]));if(!weak.length){this.toast('Không có đồ yếu hơn đồ đang mặc');return}
      let o=0,g=0;weak.forEach(it=>{const v=salvage(it);o+=v.ore;g+=v.gold});this.toast(`Phân giải ${weak.length} món: +${o} Huyền Thiết, +${fmt(g)} vàng`);Audio_.play('clang');this.render()});
    const it=this.findItem(this.sel);if(!it)return;
    on('#dEq',()=>{equipItem(it);this.toast('Đã trang bị '+itemName(it));document.getElementById('offer').hidden=true;this.render()});
    on('#dUn',()=>{if(!unequip(it.slot))this.toast('Túi đầy');this.render()});
    on('#dFg',()=>{this.forgeSel=it.id;this.open('forge')});
    on('#dSv',()=>{const v=salvage(it);this.sel=null;this.toast(`+${v.ore} Huyền Thiết, +${fmt(v.gold)} vàng`);Audio_.play('clang');this.render()});
  },

  /* Lò rèn */
  p_forge(){const S=G.save;const list=[...SLOTS.map(s=>S.equip[s]).filter(Boolean),...S.bag.filter(i=>i.rar>=1).sort((a,b)=>itemPower(b)-itemPower(a))];
    if(!list.length)return`<p class="hist">Chưa có trang bị để rèn. Hãy đánh quái để nhặt đồ.</p>`;
    let it=this.findItem(this.forgeSel);if(!it||!list.includes(it)){it=list[0];this.forgeSel=it.id}
    const c=forgeCost(it),rate=it.enh>=15?0:FORGE_RATE[it.enh],risk=it.enh>=7;
    const nx=Object.assign({},it,{enh:Math.min(15,it.enh+1)});const s0=itemStats(it),s1=itemStats(nx);
    const rc=rate>=80?'#7dff8a':rate>=45?'#ffd23a':'#ff8a6a';
    let h=`<div class="chips">${list.map(x=>this.cellHtml(x,{eq:S.equip[x.slot]===x}).replace(`aria-pressed="${this.sel===x.id}"`,`aria-pressed="${x.id===it.id}"`)).join('')}</div>
      <div class="forge"><div><div class="anvil" id="anv"><div class="fres" id="fRes"></div>
        <svg viewBox="0 0 170 120"><g id="hammer" style="transform-origin:140px 20px"><rect x="96" y="14" width="56" height="7" rx="3" fill="#6a4426"/><rect x="84" y="4" width="20" height="26" rx="3" fill="#5a5d66"/><rect x="84" y="4" width="20" height="6" fill="#8a8e98"/></g>
        <path d="M30 70h92c0 10-8 16-26 16v14h12v8H52v-8h12V86C44 86 32 80 30 70z" fill="#3a3d44"/><rect x="40" y="66" width="76" height="6" fill="#6a6e78"/>
        <g id="blade"><rect x="56" y="58" width="50" height="7" rx="2" fill="#e86a2a"/><rect x="56" y="58" width="50" height="3" fill="#ffd060"/></g></svg></div></div>
      <div>${this.itemCard(it)}<div class="ln" style="font:700 13px var(--f-ui);margin-top:8px;display:block">Lên +${nx.enh}: ${Object.keys(s1).map(k=>`${STAT_NAME[k]} <span class="dlt up">+${Math.round((s1[k]-s0[k])*10)/10}</span>`).join(', ')}</div>
        <div class="rate" style="margin-top:10px"><div class="ring" style="--v:${rate};--rc:${rc}"><b>${it.enh>=15?'MAX':rate+'%'}</b></div>
          <div><div class="cost"><span class="${S.ore<c.ore?'bad':''}">${ICO_ORE} ${c.ore} (có ${S.ore})</span><span class="${S.gold<c.gold?'bad':''}">${ICO_GOLD} ${fmt(c.gold)} (có ${fmt(S.gold)})</span></div>
          <div style="font:500 12px/1.4 var(--f-ui);color:var(--dim);margin-top:4px">${risk?'Từ +7, thất bại sẽ tụt 1 cấp.':'Dưới +7, thất bại không mất cấp.'}</div></div></div>
        ${risk?`<button class="tog" role="switch" id="fCharm" aria-checked="${!!this.useCharm&&S.charm>0}"><span>Dùng Bùa Bảo Hộ<small>Còn ${S.charm} lá. Giữ cấp khi thất bại.</small></span><span class="sw"></span></button>`:''}
        <div class="row"><button class="btn gold" id="fGo" ${it.enh>=15?'disabled':''}>Cường hóa</button><button class="btn sec" id="fShop">Mua Huyền Thiết</button></div></div></div>`;
    return h},
  b_forge(body){const S=G.save;
    body.querySelectorAll('.cell[data-id]').forEach(b=>b.onclick=()=>{this.forgeSel=+b.dataset.id;this.render()});
    const ch=body.querySelector('#fCharm');if(ch)ch.onclick=()=>{if(S.charm<=0){this.toast('Không còn Bùa Bảo Hộ. Mua ở Chợ.');return}this.useCharm=!this.useCharm;this.render()};
    body.querySelector('#fShop')&&(body.querySelector('#fShop').onclick=()=>this.open('shop'));
    const go=body.querySelector('#fGo');if(!go)return;
    go.onclick=()=>{const it=this.findItem(this.forgeSel);if(!it||this.forging)return;const c=forgeCost(it);
      if(S.ore<c.ore||S.gold<c.gold){this.toast(S.ore<c.ore?`Thiếu Huyền Thiết (cần ${c.ore}). Phân giải đồ hoặc mua ở Chợ.`:`Thiếu vàng (cần ${fmt(c.gold)})`,'warn');return}
      this.forging=true;go.disabled=true;
      const finish=()=>{const r=doForge(it,this.useCharm);this.forging=false;
        if(r.err){this.toast(r.err,'warn');this.render();return}
        Audio_.play(r.ok?'win':'fail');this.render();const res=$('#fRes');
        res.textContent=r.ok?`Thành công! +${r.to}`:r.prot?'Thất bại, bùa giữ cấp':r.to<r.from?`Thất bại, tụt về +${r.to}`:'Thất bại';res.style.color=r.ok?'#ffd98a':'#ff8a6a';
        if(anim){anim.fromTo(res,{scale:.5,autoAlpha:0},{scale:1,autoAlpha:1,duration:.4,ease:'back.out(2)'});
          if(r.ok){const a=$('#anv');for(let i=0;i<22;i++){const s=document.createElement('i');s.className='spk';a.appendChild(s);const ang=Math.random()*Math.PI*2,d=40+Math.random()*90;
            anim.fromTo(s,{x:0,y:0,autoAlpha:1},{x:Math.cos(ang)*d,y:Math.sin(ang)*d-30,autoAlpha:0,duration:.7+Math.random()*.4,ease:'power2.out',onComplete:()=>s.remove()})}}}
        else{res.style.opacity=1}
        this.toast(r.ok?`${itemName(it)} cường hóa thành công`:`Rèn thất bại`,r.ok?'quest':'warn')};
      if(anim&&!REDUCED){const tl=anim.timeline({onComplete:finish});for(let k=0;k<3;k++){tl.to('#hammer',{rotation:-40,duration:.12,ease:'power2.in'}).to('#hammer',{rotation:0,duration:.1,onComplete:()=>{Audio_.play('clang');anim.fromTo('#anv',{x:-3},{x:0,duration:.15})}})}}
      else{Audio_.play('clang');finish()}};
  },

  /* Chợ */
  p_shop(){const S=G.save,L=S.lvl;const ic={potHP:'<svg viewBox="0 0 24 24"><path d="M9 3h6v3l3 4v9a2 2 0 01-2 2H8a2 2 0 01-2-2v-9l3-4z" fill="#d93a2a"/></svg>',potMP:'<svg viewBox="0 0 24 24"><path d="M9 3h6v3l3 4v9a2 2 0 01-2 2H8a2 2 0 01-2-2v-9l3-4z" fill="#3a6ad9"/></svg>',
      ore:ICO_ORE.replace('width="14" height="14"',''),charm:'<svg viewBox="0 0 24 24"><rect x="6" y="3" width="12" height="18" rx="1" fill="#e8d8a8"/><path d="M9 7h6M12 7v10M9 12h6M9 16l3-2 3 2" stroke="#c8361f" stroke-width="1.6" fill="none"/></svg>'};
    return`<p class="hist" style="margin-bottom:12px">Bạn có ${ICO_GOLD} <b>${fmtFull(S.gold)}</b> vàng. Giá tăng theo cấp nhân vật.</p>`+SHOP.map(s=>{const pr=s.price(L);const own=S[s.id];
      return`<div class="shopi"><div class="ic">${ic[s.id]}</div><div><h5>${s.name} <span style="color:var(--dim);font-weight:600">· có ${own}</span></h5><p>${s.d}</p><p style="color:var(--vang2);font-weight:700">${fmt(pr)} vàng</p></div>
        <div class="bb"><button class="btn sm" data-buy="${s.id}" data-n="1" ${S.gold<pr?'disabled':''}>Mua 1</button>${s.id!=='charm'?`<button class="btn sec sm" data-buy="${s.id}" data-n="5" ${S.gold<pr*5?'disabled':''}>×5</button>`:''}</div></div>`}).join('')},
  b_shop(body){body.querySelectorAll('[data-buy]').forEach(b=>b.onclick=()=>{const S=G.save,s=SHOP.find(x=>x.id===b.dataset.buy),n=+b.dataset.n,pr=s.price(S.lvl)*n;
    if(S.gold<pr)return;S.gold-=pr;S[s.id]+=n;Audio_.play('coin');this.toast(`Đã mua ${n} ${s.name}`);G.dirty.pot=1;this.render()})},

  /* Kỹ năng */
  p_skill(){const S=G.save,C=CLASS_BY_ID[S.cls],p=G.p;progEnsure(S);
    const cap=skillCap();
    let h=`<div class="skRes"><div><b>${S.sp}</b><span>Điểm kỹ năng</span></div><div><b>${fmt(S.tq||0)}</b><span>Tàn Quyển</span></div><div><b>${fmt(S.gold)}</b><span>Vàng</span></div></div>
      <p class="hist skRule">Cấp 1–10 chỉ tốn <b>điểm kỹ năng</b> (mỗi cấp chẵn đến cấp 10, sau đó mỗi 5 cấp, hạ boss chương lần đầu +1). Cấp 11–20 tốn thêm <b>Tàn Quyển</b> và <b>vàng</b>, cần Cảnh Giới đủ cao. Hiện tối đa <b>cấp ${cap}</b>.</p>`;
    h+=`<div class="skc"><canvas data-ic="atk" width="128" height="128"></canvas><div><h5>Đánh thường · ${esc(C.phai)}</h5><p>${C.atk.type==='shot'?'Bắn xa, tầm '+C.atk.range:'Cận chiến, tầm '+C.atk.range}. Giữ nút để đánh liên tục. Tự nhắm quái gần nhất.</p><div class="meta">${(1/p.interval).toFixed(2)} đòn/giây · ${fmtFull(p.atk)} sát thương</div></div><span></span></div>`;
    C.skills.forEach((sk,i)=>{const lv=S.skl[i],un=S.lvl>=sk.un,L=Math.max(1,lv),m=sk.mult*skillMult(L);const c=skillUpCost(i);
      let cost='';
      if(un&&lv<SKILL_MAX){
        if(c.realm>=0)cost=`<div class="skCost lockd">Cần Cảnh Giới <b>${esc(REALMS[c.realm].n)}</b> để lên cấp ${lv+1}</div>`;
        else{const ok=(k,v)=>k==='sp'?S.sp>=v:k==='tq'?(S.tq||0)>=v:S.gold>=v;
          const part=(k,v,l)=>`<span class="${ok(k,v)?'':'no'}">${k==='gold'?fmt(v):v} ${l}</span>`;
          cost=`<div class="skCost"><em>Lên cấp ${lv+1}</em>${part('sp',c.sp,'điểm')}${c.tq?part('tq',c.tq,'Tàn Quyển'):''}${c.gold?part('gold',c.gold,'vàng'):''}<em class="g">${sk.mult?'+'+Math.round((skillMult(lv+1)-skillMult(L))*sk.mult*100)+'% công':'hồi chiêu nhanh hơn'}</em></div>`}}
      else if(un)cost=`<div class="skCost max">Đã đạt cấp tối đa</div>`;
      h+=`<div class="skc${un?'':' lock'}"><canvas data-ic="${sk.id}" width="128" height="128"></canvas><div><h5>${esc(sk.name)} <span style="color:var(--dim);font-weight:600">· ${un?'cấp '+lv+'/'+cap:'mở ở cấp '+sk.un}</span></h5><p>${esc(sk.d)}</p>
        <div class="meta">${sk.mult?Math.round(m*100)+'% công':'Phòng thủ'} · ${sk.mp} nội lực · hồi ${(sk.cd*skillCdK(L)*(1-(p.cdr||0)/100)).toFixed(1)}s${FINE?' · phím '+['K','L','I'][i]:''}</div>${cost}</div>
        <button class="btn sm skUp" data-up="${i}" ${!un||!c.can?'disabled':''} aria-label="Nâng ${esc(sk.name)}">+ Nâng</button></div>`});
    return h},
  b_skill(body){body.querySelectorAll('canvas[data-ic]').forEach(c=>{const g=c.getContext('2d');drawSkillIcon(g,c.dataset.ic,128)});
    body.querySelectorAll('[data-up]').forEach(b=>b.onclick=()=>{const i=+b.dataset.up,err=skillUp(i);if(err){this.toast(err,'warn');return}Audio_.play('level');UI.flashSkill(i);this.render()})},

  /* Nhiệm vụ */
  p_quest(){const S=G.save,M=curMap(),si=S.qs[S.map];
    let h=`<div class="sec"><h4>CHƯƠNG ${S.map+1}: ${esc(M.name.toUpperCase())} · ${esc(M.era)}</h4>`;
    M.quest.forEach((q,i)=>{const st=i<si?'done':i===si?'cur':'';const txt=q.t==='collect'?q.txt+' từ '+ET[q.e].name:q.t==='kill'?q.txt+' ('+ET[q.e].name+')':q.txt;
      const pr=i===si&&q.t!=='boss'?`<em>${S.qp}/${q.n}</em>`:i<si?'<em>Xong</em>':q.t!=='boss'?`<em>0/${q.n}</em>`:'';
      h+=`<div class="qstep ${st}"><i>${i<si?'✓':i+1}</i><span>${esc(txt)}</span>${pr}</div>`});
    h+=`<p class="hist" style="margin-top:8px;color:var(--dim)">Thưởng mỗi bước: vàng, Huyền Thiết, kinh nghiệm. Bước 2 tặng trang bị Hiếm, đánh bại boss tặng đồ Truyền Thuyết.</p></div>`;
    if(!S.side)newSide();
    h+=`<div class="sec"><h4>DÃ TẨU · CHUỖI ${S.sideChain}</h4><div class="qstep cur"><i>!</i><span>${esc(S.side.txt)}</span><em>${S.side.t==='gold'?fmt(S.side.p)+'/'+fmt(S.side.n):S.side.p+'/'+S.side.n}</em></div>
      <p class="hist" style="margin-top:8px;color:var(--dim)">Nhiệm vụ lặp lại vô hạn. Mỗi 5 chuỗi tặng Bùa Bảo Hộ, mỗi 10 chuỗi tặng đồ Truyền Thuyết.</p>
      <div class="row"><button class="btn sec sm" id="qSkip">Đổi nhiệm vụ (${fmt(20*S.lvl)} vàng)</button></div></div>`;
    h+=`<div class="sec"><h4>SỬ VIỆT</h4><p class="hist">${esc(M.story)}</p></div>`;
    return h},
  b_quest(body){const b=body.querySelector('#qSkip');if(b)b.onclick=()=>{const S=G.save,c=20*S.lvl;if(S.gold<c){this.toast('Không đủ vàng');return}S.gold-=c;newSide();this.render()}},

  /* Bản đồ */
  p_map(){const S=G.save;
    let h=`<canvas id="ovMap" width="256" height="256" aria-label="Toàn cảnh ${esc(curMap().name)}"></canvas>`;
    h+=MAPS.map((m,i)=>{const lock=i>=S.unlocked,cur=i===S.map,done=S.cleared.includes(i);const lv=m.lv[0]+lvOffset()+'–'+(m.lv[1]+lvOffset());
      return`<div class="mapc${lock?' lock':''}${cur?' cur':''}"><div class="no">${i+1}</div><div><h5>${esc(m.name)}</h5><p>${esc(m.era)} · quái cấp ${lv}${done?' · đã chinh phục':''}</p></div>
        ${cur?'<span style="font:700 12px var(--f-ui);color:var(--vang2)">Đang ở</span>':lock?'<span style="font:600 12px var(--f-ui);color:var(--dim)">Chưa mở</span>':`<button class="btn sm" data-go="${i}">Đi</button>`}</div>`}).join('');
    h+=`<div class="row"><button class="btn sec sm" id="mCamp">Về trại (miễn phí)</button></div>`;
    return h},
  b_map(body){const W=G.W,c=body.querySelector('#ovMap'),g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(W.mini,0,0,256,256);const k=256/(MW*T);
    g.fillStyle='#ffd23a';g.beginPath();g.arc(W.camp.x*k,W.camp.y*k,6,0,TAU);g.fill();g.strokeStyle='#ff5b3d';g.lineWidth=3;g.beginPath();g.arc(W.arena.x*k,W.arena.y*k,10,0,TAU);g.stroke();
    g.fillStyle='#fff';g.beginPath();g.arc(G.p.x*k,G.p.y*k,5,0,TAU);g.fill();g.strokeStyle='#000';g.lineWidth=1.5;g.stroke();
    body.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>{this.close();travel(+b.dataset.go,true)});
    body.querySelector('#mCamp').onclick=()=>{this.close();G.p.x=W.camp.x+60;G.p.y=W.camp.y+40;G.cam.x=G.p.x;G.cam.y=G.p.y;this.toast('Đã về trại')}},

  /* Cài đặt */
  p_gear(){const s=G.save.set;const T=(k,l,d)=>`<button class="tog" role="switch" data-set="${k}" aria-checked="${!!s[k]}"><span>${l}<small>${d}</small></span><span class="sw"></span></button>`;
    return`<div class="sec">${T('music','Nhạc nền','Ngũ cung, trống và đàn bầu')}${T('sfx','Âm thanh','Tiếng đánh, nhặt đồ, rèn')}${T('auto','Tự đánh','Tự tìm quái, tự tung kỹ năng, né vùng đỏ')}${T('autoPot','Tự uống thuốc','Uống Bình Kim Sang khi máu dưới 30%')}${T('autoSalvage','Tự phân giải đồ Thường','Đồ trắng nhặt được đổi ngay thành Huyền Thiết')}</div>
      <div class="sec"><h4>ĐIỀU KHIỂN</h4><p class="hist">${FINE?'Di chuyển: W A S D hoặc mũi tên, hoặc giữ chuột trái. Đánh: J hoặc Space. Kỹ năng: K, L, I (hoặc 1, 2, 3). Thuốc: H, G. Tự đánh: Z. Nói chuyện với NPC: E. Túi B, Rèn R, Chợ C, Kỹ năng T, Nhiệm vụ Q, Bản đồ M, Đóng: Esc.':'Kéo ở nửa trái màn hình để di chuyển. Giữ nút Đánh màu đỏ để đánh liên tục, nhân vật tự tiến tới quái gần nhất. Ba nút tròn nhỏ là kỹ năng. Hai bình thuốc ở bên trái nút Đánh.'}</p></div>
      <div class="sec"><h4>HÀNH TRÌNH</h4><p class="hist" style="margin-bottom:8px">Điểm: <b>${fmtFull(G.save.score)}</b> · Kỷ lục: <b>${fmtFull(Math.max(G.save.best,G.save.score))}</b> · Đã hạ ${fmtFull(G.save.kills)} quái</p>
      <div class="row"><button class="btn sec sm" id="gTitle">Về màn hình chính</button><button class="btn sec sm" id="gReset" style="border-color:#ff8a6a;color:#ffcbb8">Xóa dữ liệu</button></div></div>`},
  b_gear(body){body.querySelectorAll('[data-set]').forEach(b=>b.onclick=()=>{const k=b.dataset.set;G.save.set[k]=!G.save.set[k];Audio_.applySettings();this.render()});
    body.querySelector('#gTitle').onclick=()=>{saveGame();this.close();showTitle()};
    body.querySelector('#gReset').onclick=()=>this.confirm('Xóa toàn bộ nhân vật, trang bị và điểm? Không thể hoàn tác.',()=>{store.del(SAVE_KEY);G.save=null;this.close();showTitle()})},
};
function postApp(m){try{window.webkit&&window.webkit.messageHandlers&&window.webkit.messageHandlers.dvhk&&window.webkit.messageHandlers.dvhk.postMessage(m)}catch(e){}}

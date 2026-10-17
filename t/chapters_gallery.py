"""Bảng vẽ boss & quái mới (kiểm tra sprite).  python3 chapters_gallery.py"""
import os, base64
os.environ.setdefault('DVHK_HTML', '/home/claude/wt_chapters/dist/agent_chapters.html')
from harness import *
JS='''()=>{const c=document.createElement('canvas');c.width=1500;c.height=900;const g=c.getContext('2d');g.fillStyle='#6a8a56';g.fillRect(0,0,1500,900);
 const mk=(type,x,y,ph)=>{const D=ET[type];return{def:D,type,x,y,f:1,sc:1,r:D.r,walk:0,moving:false,state:'chase',atkAnim:-1,id:7,b2:ph?{ph}:null,enraged:false}};
 const bosses=['todinh','tranbatien','docanhthac','quachquy','omanhi','chieutang'];
 bosses.forEach((b,i)=>{const e=mk(b,130+i*245,330,1);drawBoss(g,e,1.0);g.fillStyle='#fff';g.font='700 18px sans-serif';g.textAlign='center';g.fillText(ET[b].name,130+i*245,370)});
 const e3=mk('todinh',130,600,3);drawBoss(g,e3,1);g.fillStyle='#fff';g.fillText('Tô Định (gđ3)',130,640);
 const mobs=['linhdh','nodh','khiendh','linhluong','cungluong','kyluong','linhsq','giaosq','cungsq','linhtong','notong','kytong','phaotong','thuynguyen','cungthuy','linhxiem','giaoxiem','cungxiem','phaoxiem'];
 mobs.forEach((m,i)=>{const x=290+(i%10)*120,y=560+Math.floor(i/10)*200;const e=mk(m,x,y,0);e.sc=1.6;
   if(ET[m].body==='human')drawHuman(g,{x,y,f:1,look:factionLook(ET[m].fac,ET[m].wp),t:1,sc:1.6});else drawBeast(g,e,1);
   g.fillStyle='#fff';g.font='600 12px sans-serif';g.fillText(ET[m].name,x,y+22)});
 return c.toDataURL()}'''
with sync_playwright() as p:
    b,ctx,pg,errs=open_page(p,DESK)
    d=pg.evaluate(JS); open('shots/ch/gallery.png','wb').write(base64.b64decode(d.split(',')[1]))
    print('errors',errs[:5]); b.close()

'use strict';
const $=id=>document.getElementById(id), cv=$('game'), stage=$('stage'), look=$('look');
const TAU=2*Math.PI, clamp=(x,min,max)=>Math.max(min,Math.min(max,x)), mix=(a,b,f)=>a+(b-a)*f, sin=Math.sin, cos=Math.cos;
const lerpAngle=(a,b,f)=>a+Math.atan2(sin(b-a),cos(b-a))*f;
const pads=[
 {x:0,z:-3,w:16.5,d:10,y:.48,kind:'start'},
 {x:0,z:5.85,w:3.7,d:3.4,y:.42},
 {x:-.85,z:11.3,w:3.45,d:3.2,y:.64},
 {x:.66,z:16.65,w:3.9,d:3.3,y:.37},
 {x:1.4,z:22.13,w:3.47,d:3.33,y:.54},
 {x:0,z:28,w:5.1,d:4.3,y:.48,kind:'save'},
 {x:-1.23,z:33.8,w:3.65,d:3.2,y:.39},
 {x:-.6,z:39.2,w:3.55,d:3.35,y:.64},
 {x:.85,z:44.62,w:3.8,d:3.3,y:.44},
 {x:1.37,z:50.02,w:3.6,d:3.35,y:.40},
 {x:.35,z:55.39,w:3.55,d:3.25,y:.58},
 {x:0,z:65.1,w:16.5,d:6.2,y:.47,kind:'exit'}
];
// One last stepping stone keeps the final bank within reach.
pads.splice(11,0,{x:-.45,z:59.92,w:3.74,d:2.5,y:.39});
// Independent bounded paths: each moving pad stays in its own longitudinal lane.
for(const [i,a] of pads.entries()){
 a.homeX=a.x;a.homeZ=a.z;
 a.ax=a.kind?0:(i%2?1.15:.42);
 a.az=a.kind?0:(i%2?.12:.48);
 a.phase=i*1.7;a.rate=.65+(i%3)*.13;
}
function movePads(t,carry){
 for(const a of pads){
  const x=a.homeX+a.ax*sin(t*a.rate+a.phase),z=a.homeZ+a.az*sin(t*a.rate+a.phase+.8);
  if(carry&&p.ground&&p.land===a){p.x+=x-a.x;p.z+=z-a.z;}
  a.x=x;a.z=z;
 }
}
const scene=window.PumpkinScene(cv,pads);
const keys=new Set();let p,m,mode='menu',clock=0,played=0,last=0,scale=1,aspect=1,acc=0,checkpoint=false,best=0,hint='',hintLeft=0,jumpQueued=0,ui='',soundOn=false,audio=null,wasLocked=false;
let swipe=null,stick=null,jumpId=null,move={x:0,z:0},scare=null,lastBeat=0;
const coarse=()=>matchMedia('(pointer:coarse)').matches||navigator.maxTouchPoints>0&&window.innerWidth<=950;
const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
const boxes={
 menu:['Ночной заплыв · 3D','Тыква в <em>бассейне</em>','Прыгай по движущимся платформам. Осторожно: в воде прячется монстр! Есть внезапный скример. Звук можно выключить.','Начать игру'],
 paused:['Ночной заплыв','Пауза','Лучше не задерживаться. Он всё ещё там.','Продолжить'],
 caught:['В воде было что-то…','Он тебя <em>поймал!</em>','Если упадёшь в воду, подплыви к платформе и нажми «Прыжок», чтобы забраться на неё.','Попробовать снова'],
 win:['Побег удался','Ты <em>выбрался!</em>','Дверь позади захлопнулась. Тыква осталась в бассейне.','Сыграть ещё']
};
function reset(resume=false){
 if(!resume){checkpoint=false;best=0;played=0;} movePads(played,false);
 const a=resume?pads.find(a=>a.kind==='save'):pads[0],z=resume?a.z-.67:-1.25;
 p={x:0,y:a.y,z,yaw:0,pitch:-.17,vx:0,vz:0,vy:0,ground:true,land:a,wet:false,wetAge:0,coyote:.1,bob:0,climbDelay:0};
 m={x:2.52,y:-1.02,z:z+7.2,yaw:.38,chase:0,speed:0,side:1,kick:0};
 hintLeft=0;jumpQueued=0;scare=null;lastBeat=0;
}
reset();
function resize(){
 const r=cv.getBoundingClientRect();if(!r.width||!r.height)return;
 scale=Math.min(1.5,devicePixelRatio||1,1800/Math.max(r.width,r.height));aspect=r.width/r.height;
 cv.width=Math.round(r.width*scale);cv.height=Math.round(r.height*scale);
 $('touchControls').hidden=mode!=='play'||!coarse();
}
new ResizeObserver(resize).observe(stage);resize();
function say(str,age=3){hint=str;hintLeft=age}
function clearControls(){
 keys.clear();swipe=stick=jumpId=null;move={x:0,z:0};jumpQueued=0;
 $('stickBase').style.removeProperty('left');$('stickBase').style.removeProperty('top');$('stickBase').style.removeProperty('bottom');
 $('nub').style.transform='';$('jump').classList.remove('active');
}
function setMode(next){
 mode=next;ui='';clearControls();delete stage.dataset.scare;
 stage.dataset.mode=next; $('overlay').hidden=next==='play';$('touchControls').hidden=next!=='play'||!coarse();$('pause').disabled=next!=='play';
 if(next!=='play'){
  if(document.pointerLockElement===look&&document.exitPointerLock)document.exitPointerLock();
  const a=boxes[next];$('overline').textContent=a[0];$('title').innerHTML=a[1];$('message').textContent=next==='caught'&&checkpoint?'Следующая попытка начнётся со спасательного островка.':a[2];$('go').textContent=a[3];
 }
}
function enableMouse(){
 if(coarse()||!look.requestPointerLock)return;
 try{const request=look.requestPointerLock();if(request?.catch)request.catch(()=>{});}catch{}
}
$('go').onclick=()=>{
 const prev=mode;
 if(prev!=='paused')reset(prev==='caught'&&checkpoint);
 setMode('play');enableMouse();
 if(prev==='menu')say(coarse()?'Левой рукой двигайся, правой осматривайся. Жми кнопку со стрелкой, чтобы прыгнуть.':'W A S D — ходьба. Мышь — обзор. Пробел — прыжок.',3.4);
 if(prev==='caught'&&checkpoint)say('Спасательный островок. Продолжаем отсюда.',2.6);
};
$('pause').onclick=()=>{if(mode==='play')setMode('paused')};
document.addEventListener('visibilitychange',()=>{if(document.hidden&&mode==='play')setMode('paused')});
window.addEventListener('blur',clearControls);
document.addEventListener('pointerlockchange',()=>{
 const locked=document.pointerLockElement===look;
 if(wasLocked&&!locked&&mode==='play')setMode('paused');
 wasLocked=locked;
});
const codes=new Set(['KeyW','KeyA','KeyS','KeyD','Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight']);
document.addEventListener('keydown',e=>{
 if(e.code==='Escape'&&mode==='play'){e.preventDefault();setMode('paused');return;}
 if(mode!=='play'||!codes.has(e.code)||e.altKey||e.metaKey||e.ctrlKey)return;
 e.preventDefault();keys.add(e.code);if(!e.repeat&&e.code==='Space')jumpQueued=.16;
});
document.addEventListener('keyup',e=>keys.delete(e.code));
function rotate(dx,dy,k){
 p.yaw=(p.yaw+dx*k)%TAU;p.pitch=clamp(p.pitch-dy*k*.86,-1.26,1.16);
}
document.addEventListener('mousemove',e=>{if(mode==='play'&&document.pointerLockElement===look)rotate(e.movementX,e.movementY,.00265)});
look.addEventListener('pointerdown',e=>{
 if(mode!=='play'||(e.pointerType==='mouse'&&e.button!==0&&e.button!==2))return;
 if(swipe)return;e.preventDefault();look.setPointerCapture(e.pointerId);
 swipe={id:e.pointerId,x:e.clientX,y:e.clientY,touch:e.pointerType!=='mouse',button:e.button,travel:0};
});
look.addEventListener('pointermove',e=>{
 if(mode!=='play'||swipe?.id!==e.pointerId||document.pointerLockElement===look)return;
 const dx=e.clientX-swipe.x,dy=e.clientY-swipe.y;
 rotate(dx,dy,swipe.touch?.0054:.0048);swipe.x=e.clientX;swipe.y=e.clientY;swipe.travel+=Math.abs(dx)+Math.abs(dy);
});
for(const ev of ['pointerup','pointercancel','lostpointercapture'])look.addEventListener(ev,e=>{
 if(swipe?.id!==e.pointerId)return;
 const relock=ev==='pointerup'&&!swipe.touch&&swipe.button===0&&swipe.travel<4;
 swipe=null;if(relock)enableMouse();
});
stage.addEventListener('contextmenu',e=>e.preventDefault());
function stickMove(x,y){
 if(!stick)return;
 const dx=x-stick.x,dy=y-stick.y,rad=38,len=Math.hypot(dx,dy),f=len>rad?rad/len:1;
 move.x=dx*f/rad;move.z=-dy*f/rad;
 $('nub').style.transform='translate('+dx*f+'px,'+dy*f+'px)';
}
$('stick').addEventListener('pointerdown',e=>{
 if(mode!=='play'||stick)return;
 e.preventDefault();$('stick').setPointerCapture(e.pointerId);
 stick={id:e.pointerId,x:e.clientX,y:e.clientY};
 const b=$('stick').getBoundingClientRect();
 const left=clamp(e.clientX-b.left,45,Math.max(45,b.width-44)),top=clamp(e.clientY-b.top,44,Math.max(44,b.height-44));
 const s=$('stickBase').style;s.left=left+'px';s.top=top+'px';s.bottom='auto';
});
$('stick').addEventListener('pointermove',e=>{if(e.pointerId===stick?.id)stickMove(e.clientX,e.clientY)});
for(const ev of ['pointerup','pointercancel','lostpointercapture'])$('stick').addEventListener(ev,e=>{
 if(e.pointerId!==stick?.id)return;
 stickMove(stick.x,stick.y);stick=null;for(const prop of ['left','top','bottom'])$('stickBase').style.removeProperty(prop);
});
$('jump').addEventListener('pointerdown',e=>{
 if(mode!=='play'||jumpId!==null)return;
 e.preventDefault();$('jump').setPointerCapture(e.pointerId);jumpId=e.pointerId;jumpQueued=.16;$('jump').classList.add('active');
});
for(const ev of ['pointerup','pointercancel','lostpointercapture'])$('jump').addEventListener(ev,e=>{
 if(e.pointerId!==jumpId)return;jumpId=null;$('jump').classList.remove('active');
});
$('jump').addEventListener('click',e=>{if(e.detail===0&&mode==='play')jumpQueued=.16});
function soundIcon(){
 const label=soundOn?'Выключить звук':'Включить звук',d=soundOn?'M14 9a4 4 0 0 1 0 6m3-9a8 8 0 0 1 0 12':'M15 9l5 6m0-6-5 6';$('sound').innerHTML='<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 4V5L7 9H3Z '+d+'"/></svg>';
 $('sound').setAttribute('aria-pressed',String(soundOn));$('sound').setAttribute('aria-label',label);$('sound').title=label;
}
soundIcon();
function beep(kind){
 if(!soundOn)return;
 try{
  audio??=new (window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume().catch(()=>{});
  const table={jump:[225,377,.12,'sine',.10],step:[110,64,.095,'triangle',.032],splash:[180,42,.42,'triangle',.19],caught:[340,54,.85,'sawtooth',.13],pulse:[76,35,.20,'sine',.18],save:[480,770,.34,'sine',.16],win:[503,988,.62,'triangle',.14]};
  const [a,b,len,w,amp]=table[kind],t=audio.currentTime,o=audio.createOscillator(),g=audio.createGain();o.type=w;o.frequency.setValueAtTime(a,t);o.frequency.exponentialRampToValueAtTime(b,t+len);
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(amp,t+.014);g.gain.exponentialRampToValueAtTime(.0001,t+len);
  o.connect(g).connect(audio.destination);o.start(t);o.stop(t+len+.01);
 }catch{}
}
$('sound').onclick=()=>{soundOn=!soundOn;soundIcon();if(soundOn)beep('save')};
const hit=(a,x,z,r=0)=>Math.abs(x-a.x)<=a.w*.5+r&&Math.abs(z-a.z)<=a.d*.5+r;
function distPad(a,x,z){return Math.hypot(Math.max(0,Math.abs(x-a.x)-a.w*.5),Math.max(0,Math.abs(z-a.z)-a.d*.5))}
function wet(){
 p.wet=true;p.wetAge=0;p.y=-.67;p.vy=0;p.land=null;p.coyote=0;hintLeft=0;p.ground=false;lastBeat=0;
 const d=Math.hypot(m.x-p.x,m.z-p.z);
 if(d>6.35||d<2.8){
  m.x=clamp(p.x+(p.x>4?-4.4:4.4),-7.9,7.9);
  m.z=clamp(p.z+(p.z<15?2.8:-3.15),2.2,61.78);
 }
 m.kick=.19;m.speed=1.15;beep('splash');
}
function land(a){
 p.y=a.y;p.vy=0;p.ground=true;p.land=a;p.coyote=.1;
 if(a.kind==='save'&&!checkpoint){checkpoint=true;say('Спасательный островок! Прогресс сохранён.');beep('save')}
}
function caught(){
 const ang=Math.atan2(m.x-p.x,m.z-p.z),camY=p.y+1.57;
 scare={origin:{x:p.x,y:camY,z:p.z,yaw:p.yaw,pitch:p.pitch},t:0,target:{x:clamp(m.x-sin(ang)*1.18,-8,8),y:1.42,z:clamp(m.z-cos(ang)*1.18,1.9,62.2),yaw:ang,pitch:.32},m:{...m,y:-.46,threat:1}};
 beep('caught');setMode('caught');stage.dataset.scare='true';$('overlay').hidden=true;
}
function step(dt){
 played+=dt;movePads(played,true);hintLeft=Math.max(0,hintLeft-dt);jumpQueued=Math.max(0,jumpQueued-dt);p.climbDelay=Math.max(0,p.climbDelay-dt);
 const down=k=>keys.has(k)?1:0;
 const yawKeys=down('ArrowRight')-down('ArrowLeft');
 const pitchKeys=down('ArrowUp')-down('ArrowDown');
 rotate(yawKeys*dt*326,-pitchKeys*dt*350,.0044);
 const rx=move.x+down('KeyD')-down('KeyA'),rz=move.z+down('KeyW')-down('KeyS'),l=Math.max(1,Math.hypot(rx,rz)), s=sin(p.yaw),c=cos(p.yaw);
 const speed=p.wet?3.48:7.65, accel=p.wet?11:p.ground?17:10, f=Math.min(1,dt*accel);
 p.vx=mix(p.vx,(rx*c+rz*s)*speed/l,f);p.vz=mix(p.vz,(rz*c-rx*s)*speed/l,f);
 p.x=clamp(p.x+p.vx*dt,-8.05,8.05);p.z=clamp(p.z+p.vz*dt,-7.9,68.0);
 if(p.wet){
  p.wetAge+=dt;
  const jump=jumpQueued>0||jumpId!==null||keys.has('Space');
  if(jump&&p.climbDelay===0){
   const near=pads.map(a=>[distPad(a,p.x,p.z),a]).sort((a,b)=>a[0]-b[0])[0];
   if(near[0]<=1.02){
    const a=near[1];
    p.x=clamp(p.x,a.x-a.w*.5+.27,a.x+a.w*.5-.27);
    p.z=clamp(p.z,a.z-a.d*.5+.26,a.z+a.d*.5-.26);
    p.wet=false;p.climbDelay=.29;p.vx*=.23;p.vz*=.23;jumpQueued=0;land(a);say('Успели выбраться!',1.25);beep('jump');
   }
  }
  if(p.wet){
   const dx=p.x-m.x,dz=p.z-m.z,d=Math.hypot(dx,dz);
   m.kick=Math.max(0,m.kick-dt);m.speed=mix(m.speed,m.kick>0?1.0:9.25,Math.min(1,dt*3.5));
   const amount=Math.min(d,m.speed*dt)/Math.max(.001,d);
   m.x+=dx*amount;m.z+=dz*amount;m.y=mix(m.y,-.40,Math.min(1,dt*6.9));m.chase=mix(m.chase,1,Math.min(1,dt*7));
   if(p.wetAge-lastBeat>.46&&p.wetAge>.21){lastBeat=p.wetAge;beep('pulse')}
   if(d<.76&&p.wetAge>.62){caught();return;}
  }
 }else{
  if(p.ground&&(!p.land||!hit(p.land,p.x,p.z,.11))){p.ground=false;p.land=null}
  if(p.ground)p.coyote=.1;else p.coyote=Math.max(0,p.coyote-dt);
  if(jumpQueued>0&&(p.ground||p.coyote>0)&&p.climbDelay<=0){
   jumpQueued=0;p.ground=false;p.land=null;p.coyote=0;p.vy=7.24;beep('jump');
  }
  if(!p.ground){
   const prev=p.y;p.vy-=19.8*dt;p.y+=p.vy*dt;
   if(p.vy<=0){
    const a=pads.find(a=>prev>=a.y&&p.y<=a.y&&hit(a,p.x,p.z,.13));
    if(a){land(a);beep('step')}
   }
   if(!p.ground&&p.y<=-.035)wet();
  }
  if(!p.wet){
   const tx=2.45+sin(played*.58)*1.45,tz=clamp(p.z+7.75+sin(played*.44)*1.35,3.6,61.1),dx=tx-m.x,dz=tz-m.z,dist=Math.hypot(dx,dz),k=Math.min(1,dt*3.6/Math.max(.001,dist));
   m.x+=dx*k;m.z+=dz*k;m.y=mix(m.y,-1.78,Math.min(1,dt*2.8));m.chase=mix(m.chase,0,Math.min(1,dt*3));
  }
 }
 m.yaw=lerpAngle(m.yaw,Math.atan2(m.x-p.x,m.z-p.z),Math.min(1,dt*11));
 const moving=Math.hypot(p.vx,p.vz);
 if(p.ground&&moving>1.2){const prev=p.bob;p.bob+=moving*dt*1.65;if(Math.floor(prev/Math.PI)!==Math.floor(p.bob/Math.PI))beep('step')}
 else if(p.wet)p.bob+=dt*6;
 best=Math.max(best,Math.min(99,Math.floor((p.z+1.25)/68.75*100)));
 if(p.z>=67.0&&Math.abs(p.x)<1.8&&p.ground){best=100;beep('win');setMode('win')}
}
function updateHUD(){
 const danger=p.wet&&mode==='play', pos=mode==='win'?'Выход найден':mode==='menu'?'Берег безопасен':mode==='caught'?'Монстр догнал':p.wet?'Он идёт на всплеск!':p.ground?'На платформе':'В прыжке';
 const msg=mode==='play'?(danger?'К платформе! Нажми «Прыжок», чтобы вылезти.':hintLeft>0?hint:''):'';
 const str=[mode,pos,best,danger,msg].join('|');if(ui===str)return;ui=str;
 stage.dataset.wet=String(danger||mode==='caught');$('status').dataset.danger=String(danger);$('statusText').textContent=pos;
 $('progressText').textContent='Путь '+best+'%';$('bar').style.width=best+'%';$('hint').textContent=msg;$('hint').hidden=!msg;
}
function frame(ts){
 const ms=last?Math.min(.1,(ts-last)/1000):0;last=ts;
 if(mode!=='paused')clock+=ms;
 if(mode==='play'){acc+=ms;while(acc>=1/120&&mode==='play'){step(1/120);acc-=1/120}}else acc=0;
 const speed=Math.hypot(p.vx,p.vz),anim=reduced?0:p.wet?.042:p.ground?Math.min(.036,speed*.007):0;
 let cam={x:p.x,y:p.y+1.59+sin(p.bob)*anim,z:p.z,yaw:p.yaw,pitch:p.pitch},mm={...m,y:m.y+sin(clock*(p.wet?7.7:2.0))*(p.wet?.07:.06),threat:m.chase};
 if(mode==='menu'){
  cam={x:-.12,y:2.10,z:-1.15,yaw:aspect<.8?.24:.065,pitch:aspect<.8?-.065:-.125};
  mm={x:2.73,y:-.23+sin(clock*1.7)*.08,z:5.0,yaw:.36+sin(clock*1.75)*.04,threat:.28};
 }
 if(mode==='caught'&&scare){
  scare.t+=ms;if(scare.t>=1.15){delete stage.dataset.scare;$('overlay').hidden=false;} const t=reduced?1:1-Math.exp(-scare.t*19);
  cam={x:mix(scare.origin.x,scare.target.x,t),y:mix(scare.origin.y,scare.target.y,t),z:mix(scare.origin.z,scare.target.z,t),yaw:lerpAngle(scare.origin.yaw,scare.target.yaw,t),pitch:mix(scare.origin.pitch,scare.target.pitch,t)};
  mm={...scare.m,yaw:Math.atan2(scare.m.x-cam.x,scare.m.z-cam.z)};
 }
 if(cv.width&&cv.height)scene(cam,mm,clock,aspect);
 updateHUD();requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

'use strict';
(() => {
const PI=Math.PI,TAU=PI*2, sin=Math.sin,cos=Math.cos, abs=Math.abs;
const norm=(v)=>{const n=Math.hypot(...v)||1;return v.map(x=>x/n)};
const minus=(a,b)=>a.map((x,i)=>x-b[i]);
const color=(s)=>[0,2,4].map(i=>parseInt(s.slice(i,i+2),16)/255);
function builder(){
 const data=[];
 function tri(a,b,c,c0,mat=0,normal){
  const [x,y,z]=minus(b,a),[i,j,k]=minus(c,a);
  const n=normal||norm([y*k-z*j,z*i-x*k,x*j-y*i]);
  for(const p of [a,b,c])data.push(...p,...n,...c0,mat);
 }
 function quad(a,b,c,d,c0,m=0,n){tri(a,b,c,c0,m,n);tri(a,c,d,c0,m,n)}
 function box(x0,y0,z0,x1,y1,z1,tint,m=0){
  const c=typeof tint==='string'?color(tint):tint;
  const a=[x0,y0,z0],b=[x1,y0,z0],d=[x0,y0,z1],e=[x0,y1,z0],f=[x1,y1,z0],g=[x1,y1,z1],h=[x0,y1,z1],k=[x1,y0,z1];
  quad(e,h,g,f,c,m,[0,1,0]);quad(a,e,f,b,c,m,[0,0,-1]);quad(d,k,g,h,c,m,[0,0,1]);quad(a,d,h,e,c,m,[-1,0,0]);quad(b,f,g,k,c,m,[1,0,0]);quad(a,b,k,d,c,m,[0,-1,0]);
 }
 function oval(x,y,z,rx,ry,rz,tint,mat=0,angle=0,ns=14,nt=8){
  const c=color(tint), ca=cos(angle),sa=sin(angle);
  const point=(i,j)=>{
   const t=PI*i/nt,p=TAU*j/ns,ox=rx*sin(t)*cos(p),oy=ry*cos(t),oz=rz*sin(t)*sin(p);
   return [x+ca*ox-sa*oy,y+sa*ox+ca*oy,z+oz];
  };
  for(let i=0;i<nt;i++)for(let j=0;j<ns;j++){
   const a=point(i,j),b=point(i+1,j),d=point(i,j+1),k=point(i+1,j+1);
   const nx=(a[0]+b[0]+k[0]+d[0])/4-x,ny=(a[1]+b[1]+k[1]+d[1])/4-y,nz=(a[2]+b[2]+k[2]+d[2])/4-z;
   const u=(nx*ca+ny*sa)/(rx*rx), v=(ny*ca-nx*sa)/(ry*ry);
   quad(a,b,k,d,c,mat,norm([u*ca-v*sa,u*sa+v*ca,nz/(rz*rz)]));
  }
 }
 return {data,tri,quad,box,oval};
}
function seeded(k){return (sin(k*137.923+8.3)*43758.5453)%1+.5}
function hall(pads,onlyPads=false){
 const B=builder(), {box,quad,tri}=B;
 const floorTop=.47, wallStart=-9, wallEnd=70, poolBegin=2, poolEnd=62;
 if(!onlyPads){
 box(-11,-1.45,wallStart,11,-1.3,wallEnd,'0c2632');
 box(-11,7.3,wallStart,11,7.65,wallEnd,'1b303b');
 box(-11,.36,wallStart,-10.78,7.32,wallEnd,'193442');
 box(10.78,.36,wallStart,11,7.32,wallEnd,'203d47');
 box(-11,.36,wallStart,11,7.3,wallStart+.17,'203644');
 box(-11,.36,wallEnd-.2,11,7.3,wallEnd,'263f47');
 quad([-9,0,poolBegin],[-9,0,poolEnd],[9,0,poolEnd],[9,0,poolBegin],color('215b6d'),1,[0,1,0]);
 for(const s of [-1,1]){
  const lo=s<0?-11:8.25,hi=s<0?-8.25:11;
  box(lo,-.7,wallStart,hi,.61,wallEnd,'304e56');
  const edge=s*8.29;
  box(edge-.07,.63,poolBegin,edge+.07,.664,poolEnd,'80b3af',2);
  for(let z=-8;z<=68;z+=1.1){
   box(lo,.615,z,hi,.624,z+.024,'192f3b');
   box(s*9.5-.017,.615,z,s*9.5+.017,.624,z+1.1,'253e48');
  }
  for(let z=-7;z<69;z+=6.8){
   const xx=s*10.38;
   // Columns and lamp recesses.
   box(xx-.28,.62,z-.34,xx+.28,7.27,z+.34,'3a5358');
   box(xx-.38,.61,z-.46,xx+.38,.83,z+.46,'405b62');
   box(xx-.33,7.02,z-.43,xx+.33,7.31,z+.43,'527072');
   const lx=s*10.04;
   box(lx-.07,2.58,z-.18,lx+.07,3.2,z+.18,'20353d');
   box(lx-s*.086-.025,2.66,z-.08,lx-s*.086+.025,3.12,z+.08,'94ddd6',2);
   // Deep blue window panes.
   const wx=s*10.75;
   box(wx-.061,3.6,z+.75,wx+.061,6.1,z+5.97,'426471');
   box(wx-s*.072-.035,3.71,z+.86,wx-s*.072+.035,5.99,z+5.86,'12283a');
   for(let j=0;j<5;j++){
    const xlit=wx-s*.106, zz=z+.89+j*.995;
    const base=color(j%2?'284d61':'335a6d');
    quad([xlit,3.8,zz],[xlit,3.8,zz+.95],[xlit,5.91,zz+.95],[xlit,5.91,zz],base,0,[-s,0,0]);
    tri([xlit-s*.002,3.81,zz],[xlit-s*.002,3.81,zz+.95],[xlit-s*.002,4.49,zz+.9],color('29445a'),0,[-s,0,0]);
   }
   box(wx-s*.12-.03,4.84,z+.82,wx-s*.12+.03,4.89,z+5.9,'47707d');
  }
  for(let y=.76;y<3.5;y+=.32){
   const x=s*10.74;
   box(x-.03,y,wallStart,x+.03,y+.017,wallEnd,'30505b');
   for(let z=-8+(Math.round(y*4)%2)*.5;z<70;z+=1.14)box(x-.03,y,z,x+.03,y+.32,z+.014,'2b4754');
  }
 }
 for(let z=-4;z<70;z+=6.8){
  box(-11,6.91,z-.15,11,7.32,z+.15,'3b515a');
  for(const x of [-5.6,5.6]){
   box(x-1.12,6.8,z-.19,x+1.12,6.93,z+.19,'3b585d');
   box(x-1.04,6.775,z-.08,x+1.04,6.805,z+.08,'a4e4dd',2);
  }
 }
 for(let z=2.6;z<61.5;z+=.7){
  const i=Math.round(z/.7);
  for(const x of [-6.65,6.65])box(x-.095,.035,z,x+.095,.104,z+.37,i%8<5?'4daab3':'c6a869',2);
 }
 }
 for(const [i,a] of pads.entries()){
  const xl=a.x-a.w*.5,xr=a.x+a.w*.5,l=a.z-a.d*.5,r=a.z+a.d*.5,y=a.y, main=a.kind==='start'||a.kind==='exit';
  if(main||a.kind==='save'){
   box(xl,-1.1,l,xr,y-.09,r,main?'2b4a52':'33565d');
   for(let zz=l+.32;zz<r-.05;zz+=.67){
    box(xl-.008,-.99,zz,xl+.006,y-.1,zz+.017,'44666a');
    box(xr-.006,-.99,zz,xr+.008,y-.1,zz+.017,'44666a');
   }
  }else{
   for(const sx of [xl+.33,xr-.33])for(const sz of [l+.32,r-.32])box(sx-.13,-1.3,sz-.13,sx+.13,y-.08,sz+.13,'274953');
  }
  box(xl,y-.145,l,xr,y,r,main?'658789':'5e8486');
  for(let xx=xl+.4;xx<xr-.12;xx+=.57)box(xx,y+.003,l+.04,xx+.016,y+.008,r-.04,'3e656c');
  for(let zz=l+.41;zz<r-.12;zz+=.54)box(xl+.045,y+.004,zz,xr-.045,y+.008,zz+.016,'416772');
  const hue=a.kind==='exit'?'a0eac2':a.kind==='save'?'81dacc':'efba66';
  for(const zz of [l+.009,r-.065])box(xl+.02,y+.01,zz,xr-.02,y+.021,zz+.06,hue,2);
  for(const xx of [xl+.012,xr-.072])box(xx,y+.009,l+.07,xx+.057,y+.02,r-.07,hue,2);
  if(!main)for(let xx=xl+.13;xx<xr-.15;xx+=.27)quad([xx,y-.02,l-.004],[xx+.085,y-.02,l-.004],[xx+.022,y-.103,l-.004],[xx-.055,y-.103,l-.004],color('c99558'),0,[0,0,-1]);
  if(a.kind==='save'){
   box(xr-.27,y,r-.25,xr-.21,y+.76,r-.19,'507677');
   box(xr-.38,y+.75,r-.35,xr-.1,y+.96,r-.07,'8ff2d0',2);
  }
 }
 if(onlyPads)return B;
 // Door and a little sign with hand-built letters.
 box(-1.57,.45,68.37,1.57,4.13,68.9,'3e656d');
 box(-1.39,.5,68.24,1.39,3.96,68.45,'8edcb4',2);
 box(-1.27,.51,68.13,1.27,3.79,68.32,'16313b');
 box(-1.16,.62,68.079,1.16,3.66,68.2,'28515a');
 box(-.04,.64,68.06,.04,3.64,68.145,'0b2331');
 box(.14,1.76,68,.54,1.84,68.12,'9abeb3',2);
 box(-1.68,4.2,68.15,1.68,4.86,68.45,'89e8b9',2);
 const glyphs=[
  ['110','101','110','101','110'],['1001','1001','1101','1011','1101'],['101','101','010','101','101'],['111','101','101','101','111'],['0110','0100','0100','1111','1001']
 ];
 let left=-1.34;
 for(const arr of glyphs){
  for(let j=0;j<5;j++)for(let k=0;k<arr[j].length;k++)if(arr[j][k]==='1'){
   const x=left+k*.111,y=4.715-j*.085;
   box(x,y-.076,68.11,x+.101,y,68.16,'204b46');
  }
  left+=(arr[0].length+1)*.11;
 }
 return B;
}
function creature(){
 const B=builder(),{oval,tri,quad,box}=B;
 oval(0,.63,.08,.55,.93,.32,'633d2d',0,0,16,11);
 oval(0,1.18,.055,.73,.54,.39,'523128',0,0,17,11);
 oval(0,1.75,.04,.29,.38,.24,'5b392b');
 for(const s of [-1,1]){
  oval(s*.38,1.24,-.24,.43,.29,.24,s<0?'955d40':'a36a46',0,-s*.11);
  oval(s*.22,.9,-.27,.22,.135,.13,'855235',0,s*.07,12,8);
  oval(s*.20,.68,-.25,.21,.125,.125,'7b4933',0,-s*.14,12,8);
  oval(s*.18,.47,-.22,.175,.112,.12,'75462f',0,-s*.18,12,8);
  oval(s*.725,1.28,.015,.37,.40,.335,'8d553b',0,-s*.28);
  oval(s*.93,.94,-.06,.31,.46,.29,'9a5d3d',0,s*.47);
  oval(s*1.14,.59,-.21,.27,.36,.25,'725035',0,s*.67);
  oval(s*1.33,.4,-.39,.21,.22,.237,'6a4633',0,s*.37);
  for(let f=0;f<3;f++){
   oval(s*(1.24+.106*f),.34-.055*f,-.63+.05*f,.065,.202,.082,'6e4837',0,s*.37,10,7);
   tri([s*(1.24+.106*f),.17-.055*f,-.704+.05*f],[s*(1.27+.106*f),.243-.055*f,-.692+.05*f],[s*(1.21+.106*f),.24-.055*f,-.697+.05*f],color('c4a977'),0,[0,0,-1]);
  }
 }
 // Concave facial cuts made in the actual pumpkin mesh.
 const eye=[[.125,2.30],[.615,2.46],[.485,2.22],[.252,2.205]];
 const mouth=[[-.25,2.13],[.25,2.13],[.29,1.99],[.15,1.73],[0,1.65],[-.15,1.73],[-.29,1.99]];
 const inside=(x,y,poly)=>{let ok=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])ok=!ok;}return ok};
 const taper=t=>.92+.12*sin(t)-.16*cos(t);
 const head=(t,v)=>{
  const ridges=1+.058*cos(v*10)+.024*sin(v*17+t*2.3), w=.711*taper(t)*sin(t);
  return [w*sin(v)*ridges,2.325+.765*cos(t),-.072-.478*sin(t)*cos(v)*ridges];
 };
 const layers=54, wraps=76, palette=['925026','a75626','b76529','cf772e','e09241','b65d23'].map(color);
 for(let r=0;r<layers;r++)for(let j=0;j<wraps;j++){
  const t=PI*(r+.5)/layers,v=TAU*(j+.5)/wraps, ctr=head(t,v),[x,y,z]=ctr;
  const inc=z<-.18&&(inside(abs(x),y,eye)||inside(x,y,mouth));
  if(inc)continue;
  const a=head(PI*r/layers,TAU*j/wraps),b=head(PI*(r+1)/layers,TAU*j/wraps),c=head(PI*(r+1)/layers,TAU*(j+1)/wraps),d=head(PI*r/layers,TAU*(j+1)/wraps);
  const normal=norm([x/.51,(y-2.30)/.59,(z+.072)/.228]);
  const stripe=Math.max(0,Math.min(5,Math.floor(2.85+2.25*cos(v*10)+.85*cos(t*4-v*2)+.43*seeded(r*wraps+j))));
  const brow=z<-.18&&y>2.37&&y<2.53&&abs(x)>.19&&abs(x)<.68?.76:1;
  quad(a,b,c,d,palette[stripe].map((ch,i)=>ch*brow),0,normal);
 }
 oval(0,2.335,-.035,.659,.676,.347,'23181b',0,0,24,16);
 function tooth(x,y,z,w,h,hue){tri([x-w,y,z],[x+w,y,z],[x+.01,y-h,z-.037],color(hue),0,[0,0,-1]);}
 for(const s of [-1,1]){
  const p=(x,y,z)=>[s*x,y,z];
  quad(p(.187,2.289,-.381),p(.56,2.416,-.241),p(.447,2.271,-.31),p(.256,2.243,-.35),color('ff3420'),2,[0,0,-1]);
  tri(p(.262,2.279,-.394),p(.522,2.371,-.266),p(.409,2.277,-.335),color('fff2b0'),2,[0,0,-1]);
  oval(s*.365,2.304,-.364,.028,.04,.018,'61272a',0,0,9,6);
 }
 for(let f=0;f<7;f++)tooth(-.21+f*.07,2.105-.012*abs(f-3),-.45,.027,.13+.025*(f%2),'e4bd84');
 for(let f=0;f<5;f++)tooth(-.14+f*.07,1.81+.016*abs(f-2),-.36,.026,-.12,'cba76e');
 oval(-.039,3.107,.023,.109,.226,.113,'52563b',0,-.28,12,8);
 oval(.05,3.274,.031,.092,.134,.083,'696b44',0,-.49,12,8);
 for(const side of [-1,1]){for(let j=0;j<4;j++){const x=side*(1.23+j*.105);tri([x-.035,.25-j*.035,-.66],[x+.035,.25-j*.035,-.66],[x+side*.08,-.09-j*.035,-.84],color('e5d1a5'),0,[0,0,-1]);} for(let j=0;j<3;j++){const x=side*(.28+j*.11);tri([x,2.51,-.43],[x+side*.07,2.49,-.40],[x-side*.05,2.77,-.33],color('351e1a'),0,[0,0,-1]);}}
 for(let i=0;i<B.data.length;i+=10){if(B.data[i+1]>1.66){B.data[i]*=.94;B.data[i+1]=1.66+(B.data[i+1]-1.66)*1.12;}}
 return B;
}
const vs=`
attribute vec3 aPos,aNorm,aColor;
attribute float aMat;
uniform vec4 uCam;
uniform vec4 uView;
uniform vec4 uObj;
uniform vec3 uAnim;
varying vec3 vPos,vNorm,vColor;
varying float vDepth,vMat,vObj;
void main(){
 vec3 p=aPos;
 vec3 nn=aNorm;
 if(uAnim.y>0.5){
  float w=max(0.0,abs(p.x)-.6);
  float swing=sin(uAnim.x*11.0+sign(p.x)*1.2);
  p.z-=w*(.20+.26*swing)*uAnim.z;
  p.y+=w*(.18*swing+.18)*uAnim.z;
 }
 float c=cos(uObj.w),s=sin(uObj.w);
 p=vec3(c*p.x+s*p.z,p.y,-s*p.x+c*p.z)+uObj.xyz;
 vNorm=vec3(c*nn.x+s*nn.z,nn.y,-s*nn.x+c*nn.z);
 vec3 d=p-uCam.xyz;
 float sy=sin(uCam.w),cy=cos(uCam.w),sp=sin(uView.x),cp=cos(uView.x);
 float x=cy*d.x-sy*d.z, along=sy*d.x+cy*d.z;
 float y=cp*d.y-sp*along,z=sp*d.y+cp*along;
 gl_Position=vec4(x*uView.y,y*uView.z,1.0031*z-.163,z);
 vPos=p;vColor=aColor;vMat=aMat;vDepth=z;vObj=uAnim.y;
}`;
const fs=`
precision highp float;
uniform vec4 uCam;
uniform vec3 uAnim;
varying vec3 vPos,vNorm,vColor;
varying float vDepth,vMat,vObj;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*4375.545);}
void main(){
 vec3 n=normalize(vNorm);
 vec3 dir=normalize(uCam.xyz-vPos);
 float facing=max(0.0,dot(n,normalize(vec3(.34,.84,-.39))));
 float spot=exp(-.064*length(uCam.xyz-vPos));
 float z=mod(vPos.z+7.0,6.8);
 float lamp=exp(-.97*length(vec2(abs(vPos.x)-6.5,min(z,6.8-z)))*.63);
 float fog=1.0-exp(-.024*max(0.0,vDepth));
 vec3 lit=vColor*(.39+.49*facing+.24*spot+.33*lamp);
 if(vObj>.5){lit=vColor*(.54+.50*facing+.28*spot);}
 if(vMat>.5 && vMat<1.5){
  vec2 c=vPos.xz;
  float t=uAnim.x;
  float w0=sin(c.x*4.4+c.y*3.6+t*1.37+sin(c.y*2.4-t*1.15)*1.13);
  float w1=sin(c.y*5.2-c.x*1.5-t*1.63+sin(c.x*4.0+t*.68));
  float w2=sin(c.x*8.3+c.y*2.6+t*1.21);
  float wave=pow(max(0.0,w0*w1),4.2);
  float sheen=clamp(1.0-max(.0,dir.y),0.0,1.0);
  float flow=smoothstep(.28,.83,sin(c.x*.74+c.y*.36+w1*.06)*cos(c.y*.79-w2*.07));
  float reflectedLight=pow(max(0.0,cos((c.y+4.0)*.924+w0*.083)),12.0)*exp(-.74*abs(abs(c.x)-5.5+w1*.31));
  lit=vec3(.052,.187,.233)+vColor*.41*sheen+vec3(.074,.18,.182)*(wave*.7+flow*.37+lamp*.34);
  lit+=vec3(.21,.42,.40)*reflectedLight*.57+vec3(.056,.115,.126)*w2*.16;
 } else if(vMat>1.5){
  lit=mix(lit,vColor,.78)+vColor*.075;
 } else {
  float g=hash(floor((vPos.xz+vPos.y*.43)*55.0));
  lit*=.966+.068*g;
 }
 vec3 dim=vec3(.041,.108,.136);
 gl_FragColor=vec4(mix(lit,dim,fog*.88),1.0);
}`;
function glEngine(canvas,world,monster,padMeshes){
 const gl=canvas.getContext('webgl',{alpha:false,antialias:true,premultipliedAlpha:false,powerPreference:'high-performance'});
 if(!gl)return;
 function compile(type,src){const shader=gl.createShader(type);gl.shaderSource(shader,src);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(shader));return shader}
 const p=gl.createProgram();gl.attachShader(p,compile(gl.VERTEX_SHADER,vs));gl.attachShader(p,compile(gl.FRAGMENT_SHADER,fs));gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p));
 gl.useProgram(p);gl.enable(gl.DEPTH_TEST);gl.clearColor(.04,.102,.135,1);
 const attrs=['aPos','aNorm','aColor','aMat'].map(k=>gl.getAttribLocation(p,k));
 const u=Object.fromEntries(['uCam','uView','uObj','uAnim'].map(k=>[k,gl.getUniformLocation(p,k)]));
 function mesh(B){const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(B.data),gl.STATIC_DRAW);return [buf,B.data.length/10]}
 const A=mesh(world),M=mesh(monster),P=padMeshes.map(({a,b})=>({a,mesh:mesh(b)}));
 function render(obj){
  gl.bindBuffer(gl.ARRAY_BUFFER,obj[0]);
  for(let i=0;i<4;i++){gl.enableVertexAttribArray(attrs[i]);gl.vertexAttribPointer(attrs[i],i===3?1:3,gl.FLOAT,false,40,i*12)}
  gl.drawArrays(gl.TRIANGLES,0,obj[1]);
 }
 return (cam,m,t,aspect)=>{
  gl.viewport(0,0,canvas.width,canvas.height);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
  const sy=(aspect<.8?1.04:1.50),sx=sy/aspect;
  gl.uniform4f(u.uCam,cam.x,cam.y,cam.z,cam.yaw);gl.uniform4f(u.uView,cam.pitch,sx,sy,0);
  gl.uniform4f(u.uObj,0,0,0,0);gl.uniform3f(u.uAnim,t,0,0);render(A);
  for(const {a,mesh} of P){gl.uniform4f(u.uObj,a.x-a.homeX,0,a.z-a.homeZ,0);render(mesh);}
  gl.uniform4f(u.uObj,m.x,m.y,m.z,m.yaw);gl.uniform3f(u.uAnim,t,1,m.threat);render(M);
 };
}
function swEngine(canvas,world,monster,padMeshes){
 const c=canvas.getContext('2d',{alpha:false});
 if(!c)return ()=>{};
 const buffer=document.createElement('canvas'),out=buffer.getContext('2d',{alpha:false});
 let w=0,h=0,image,pixels,zbuf,cachePixels,cacheDepth,cacheCam;
 const pack=(r,g,b)=>(255<<24)|(Math.min(255,b)<<16)|(Math.min(255,g)<<8)|Math.min(255,r);
 const clearColor=pack(11,27,34);
 // Compact, flat-color triangles for browsers with no WebGL.
 function prep(obj){
  const v=obj.data, t=[];
  for(let i=0;i<v.length;i+=30){
   const ax=v[i],ay=v[i+1],az=v[i+2], bx=v[i+10],by=v[i+11],bz=v[i+12], cx=v[i+20],cy=v[i+21],cz=v[i+22];
   const u=bx-ax,j=by-ay,k=bz-az,l=cx-ax,m=cy-ay,n=cz-az;
   if(abs(j*n-k*m)+abs(k*l-u*n)+abs(u*m-j*l)<.000001)continue;
   const nx=v[i+3],ny=v[i+4],nz=v[i+5],mat=v[i+9];
   const directional=Math.max(0,nx*.39+ny*.78-nz*.36);
   t.push([ax,ay,az,bx,by,bz,cx,cy,cz,nx,ny,nz,(ax+bx+cx)/3,(ay+by+cy)/3,(az+bz+cz)/3,v[i+6],v[i+7],v[i+8],mat,directional]);
  }
  return t;
 }
 const a=prep(world),b=prep(monster),P=padMeshes.map(({a,b})=>({a,list:prep(b)})),near=.09;
 function paint(x0,y0,q0,x1,y1,q1,x2,y2,q2,col){
  const L=Math.max(0,Math.ceil(Math.min(x0,x1,x2)-.5)),R=Math.min(w-1,Math.floor(Math.max(x0,x1,x2)-.5));
  const T=Math.max(0,Math.ceil(Math.min(y0,y1,y2)-.5)),B=Math.min(h-1,Math.floor(Math.max(y0,y1,y2)-.5));
  if(L>R||T>B)return;
  const dx1=x1-x0,dy1=y1-y0,dx2=x2-x0,dy2=y2-y0;
  const sign=dx1*dy2-dx2*dy1;if(abs(sign)<.000001)return;
  const U=dy2/sign,V=-dx2/sign,X=-dy1/sign,Y=dx1/sign;
  const U0=(L+.5-x0)*U+(T+.5-y0)*V,X0=(L+.5-x0)*X+(T+.5-y0)*Y;
  const dz1=q1-q0,dz2=q2-q0;
  for(let iy=T;iy<=B;iy++){
   let u=U0+(iy-T)*V,v=X0+(iy-T)*Y,dep=q0+u*dz1+v*dz2;const ddep=U*dz1+X*dz2;
   let i=iy*w+L;
   for(let ix=L;ix<=R;ix++,i++,u+=U,v+=X,dep+=ddep){
    if(u>=-0.00015&&v>=-0.00015&&u+v<=1.00015&&dep>zbuf[i]){zbuf[i]=dep;pixels[i]=col;}
   }
  }
 }
 return (cam,obj,time,aspect)=>{
  const nh=Math.round(Math.min(340,canvas.height,650/aspect)),nw=Math.max(1,Math.round(nh*aspect));
  if(nw!==w||nh!==h){
   buffer.width=w=nw;buffer.height=h=nh;image=out.createImageData(w,h);pixels=new Uint32Array(image.data.buffer);
   zbuf=new Float32Array(w*h);cachePixels=new Uint32Array(w*h);cacheDepth=new Float32Array(w*h);cacheCam=null;
  }
  c.imageSmoothingEnabled=true;
  const sy=cos(cam.yaw),sx=sin(cam.yaw),cp=cos(cam.pitch),sp=sin(cam.pitch),f=h*(aspect<.8?.52:.75),cx=w*.5,cy=h*.5;
  const transform=(x,y,z)=>{
   x-=cam.x;y-=cam.y;z-=cam.z;const along=sx*x+sy*z;
   return [sy*x-sx*z,cp*y-sp*along,sp*y+cp*along];
  };
  const proj=p=>[cx+f*p[0]/p[2],cy-f*p[1]/p[2],1/p[2]];
  const render=(list,m)=>{
   const co=m?cos(m.yaw):1,si=m?sin(m.yaw):0;
   const localX=m?co*(cam.x-m.x)-si*(cam.z-m.z):cam.x;
   const localY=m?cam.y-m.y:cam.y;
   const localZ=m?si*(cam.x-m.x)+co*(cam.z-m.z):cam.z;
   const leftArm=m?sin(time*11-1.2):0,rightArm=m?sin(time*11+1.2):0;
   function point(x,y,z){
    if(m){
     const arm=Math.max(0,abs(x)-.60)*(m.threat||0),swing=x<0?leftArm:rightArm;
     z-=arm*(.2+.26*swing);y+=arm*(.18+.18*swing);
     const xx=co*x+si*z+m.x;z=-si*x+co*z+m.z;x=xx;y+=m.y;
    }
    return transform(x,y,z);
   }
   for(const t of list){
    if((localX-t[12])*t[9]+(localY-t[13])*t[10]+(localZ-t[14])*t[11]<-.025)continue;
    const A=point(t[0],t[1],t[2]),B=point(t[3],t[4],t[5]),C=point(t[6],t[7],t[8]);
    if(A[2]<near&&B[2]<near&&C[2]<near)continue;
    let col=0;
    if(t[18]!==1){
     const z=Math.max(0,(A[2]+B[2]+C[2])/3),fog=(1-Math.exp(-.022*z))*.86;
     let lit=t[18]>1.5?1.06:m?.62+.56*t[19]:.53+.56*t[19];
     if(!m&&t[18]===0){const r=((t[14]+7)%6.8+6.8)%6.8;lit+=.13*Math.exp(-.37*Math.min(r,6.8-r));}
     col=pack(Math.round(255*(t[15]*lit*(1-fog)+.045*fog)),Math.round(255*(t[16]*lit*(1-fog)+.112*fog)),Math.round(255*(t[17]*lit*(1-fog)+.139*fog)));
    }
    if(A[2]>=near&&B[2]>=near&&C[2]>=near){paint(...proj(A),...proj(B),...proj(C),col);continue;}
    const p=[A,B,C],clip=[];
    for(let i=0;i<3;i++){
     const u=p[i],v=p[(i+1)%3],s=u[2]>=near,t=v[2]>=near;
     if(s)clip.push(u);
     if(s!==t){const d=(near-u[2])/(v[2]-u[2]);clip.push([u[0]+d*(v[0]-u[0]),u[1]+d*(v[1]-u[1]),near]);}
    }
    for(let i=1;i<clip.length-1;i++)paint(...proj(clip[0]),...proj(clip[i]),...proj(clip[i+1]),col);
   }
  };
  if(cacheCam&&cacheCam.x===cam.x&&cacheCam.y===cam.y&&cacheCam.z===cam.z&&cacheCam.yaw===cam.yaw&&cacheCam.pitch===cam.pitch){pixels.set(cachePixels);zbuf.set(cacheDepth);}
  else{
   pixels.fill(clearColor);zbuf.fill(0);render(a,null);cacheCam={...cam};cachePixels.set(pixels);cacheDepth.set(zbuf);
  }
  for(const {a,list} of P)render(list,{x:a.x-a.homeX,y:0,z:a.z-a.homeZ,yaw:0,threat:0});
  render(b,obj);
  const du=1/f,fx=sx*cp,fz=sy*cp;
  for(let y=0;y<h;y++){
   const yy=(cy-y-.5)*du,x0=fx-sx*sp*yy,z0=fz-sy*sp*yy;
   for(let x=0,i=y*w;x<w;x++,i++)if(pixels[i]===0){
    const d=1/zbuf[i],xx=(x+.5-cx)*du,wx=cam.x+(x0+sy*xx)*d,wz=cam.z+(z0-sx*xx)*d;
    const t0=sin(wx*4.4+wz*3.9+time*1.47+sin(wz*2.3-time)*.78),t1=sin(wz*4.8-wx*2.2-time*1.88);
    const wv=Math.max(0,t0*t1),wavy=wv*wv*wv;
    const across=Math.max(0,1-abs(abs(wx)-5.5+t1*.23)*1.13),str=Math.max(0,cos((wz+4)*.924+t0*.07));
    const shine=across*str*str*str*str*(.55+.45*t1),dist=Math.min(.55,d*.013);
    pixels[i]=pack((21+wavy*27+shine*25-dist*15)|0,(60+wavy*54+shine*65-dist*44)|0,(75+wavy*59+shine*61-dist*53)|0);
   }
  }
  out.putImageData(image,0,0);c.drawImage(buffer,0,0,canvas.width,canvas.height);
 };
}
window.PumpkinScene=(canvas,pads)=>{const a=hall(pads.filter(p=>p.kind)),b=creature(),P=pads.filter(p=>!p.kind).map(a=>({a,b:hall([a],true)}));try{const draw=glEngine(canvas,a,b,P);if(draw)return draw;}catch(e){console.error('WebGL:',e.message)}return swEngine(canvas,a,b,P);};
})();

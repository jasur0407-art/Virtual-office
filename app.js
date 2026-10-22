(function(){
"use strict";
var NS="http://www.w3.org/2000/svg";
var svg=document.getElementById("office");
function el(t,a,p){var e=document.createElementNS(NS,t);for(var k in a)e.setAttribute(k,a[k]);(p||svg).appendChild(e);return e}

// Xonalar. Agent qo'shilganda o'sha xonaga "ready: true" qo'yiladi.
var ROOMS=[
 {id:"plan",name:"Rejalashtirish",sub:"Kunlik va haftalik reja",cmd:"kun · hafta",agent:"Rejachi",desc:"Kechki 3-4 soatingizni taqsimlaydi. Bugungi reja va haftalik xulosani tuzadi."},
 {id:"idea",name:"G'oyalar tahlili",sub:"G'oyalar",cmd:"g'oya: ...",agent:"Tahlilchi",desc:"Yangi g'oyani tekshiradi: kimga kerak, qancha vaqt oladi, qanday xavflari bor. Qilish yoki qilmaslik bo'yicha aniq xulosa beradi."},
 {id:"tech",name:"Texnik bo'lim",sub:"x900 server",cmd:"x900: ...",agent:"Server ustasi",ready:true,desc:"x900 serveri bo'yicha mutaxassis: custom item va ekipirovka balansi, config fayllar (rate, drop, enchant), haftalik eventlar, loglardagi xatolar, donat do'koni va o'zbek-rus tilidagi patch notes. Server fayllari bo'lmasa, faqat maslahat beradi."},
 {id:"studio",name:"Media studiya",sub:"Foto, video, dizayn",cmd:"studiya: ...",agent:"Rejissyor",ready:true,desc:"Foto, video, dizayn va montaj. G'oyangizdan ssenariy, rasm va tayyor video yasaydi, kerakli joyda maslahat beradi. Shaxsiy ma'lumot va tasdiq kerak bo'lgan joyda sizdan so'raydi."},
 {id:"recep",name:"Qabulxona",sub:"Kirish",cmd:"istalgan xabar",agent:"Administrator",ready:true,desc:"Ofisning kirishi. Siz shu yerga yozasiz, administrator topshiriqni kerakli bo'limga yuboradi va javobni sizga qaytaradi."},
 {id:"write",name:"Yozuv bo'limi",sub:"Instagram kontent",cmd:"insta: ...",agent:"SMM menejer",ready:true,desc:"Instagram sahifasini yuritadi: haftalik kontent reja, post matnlari va hashtaglar, Reels g'oyalari va ssenariylari, Stories, statistika tahlili. Rasm va videoni Rejissyorga topshiradi. O'zi hech narsa joylamaydi va parol so'ramaydi."},
 {id:"check",name:"Nazorat",sub:"Sifat tekshiruvi",cmd:"tekshir",agent:"Nazoratchi",desc:"Har qanday ishni tekshiradi va zaif joyni yumshatmasdan aytadi."},
 {id:"arch",name:"Arxiv",sub:"Xotira",cmd:"—",agent:null,desc:"Qarorlar, loyihalar ro'yxati va fayllar shu yerda saqlanadi. Bu yerda agent emas, xotira turadi."}
];



// ---------- Izometrik ofis ("Quyoshli studiya") ----------
// Dunyo 14x14 katak (avvalgidan 2 baravar katta). P() dunyo nuqtasini ekranga o'tkazadi.
var N=14, S=24, OX=360, OY=104, WH=3.3, VW=720, VH=500;
function P(x,y,z){return[OX+(x-y)*S*.866,OY+(x+y)*S*.5-z*S]}
function pts(a){return a.map(function(p){return p[0].toFixed(1)+","+p[1].toFixed(1)}).join(" ")}
function sh(hex,f){var n=parseInt(hex.slice(1),16),c=[n>>16,n>>8&255,n&255].map(function(v){return Math.max(0,Math.min(255,Math.round(f>1?v+(255-v)*(f-1):v*f)))});return"#"+c.map(function(v){return(v<16?"0":"")+v.toString(16)}).join("")}
function poly(g,a,fill,cls,extra){var o={points:pts(a),fill:fill};if(cls)o["class"]=cls;for(var k in extra)o[k]=extra[k];return el("polygon",o,g)}
function line(g,a,b,stroke,w,extra){var o={x1:a[0].toFixed(1),y1:a[1].toFixed(1),x2:b[0].toFixed(1),y2:b[1].toFixed(1),stroke:stroke,"stroke-width":w,"stroke-linecap":"round"};for(var k in extra)o[k]=extra[k];return el("line",o,g)}
function box(g,x,y,z,w,d,h,c){
  poly(g,[P(x,y+d,z),P(x+w,y+d,z),P(x+w,y+d,z+h),P(x,y+d,z+h)],sh(c,.86));
  poly(g,[P(x+w,y,z),P(x+w,y+d,z),P(x+w,y+d,z+h),P(x+w,y,z+h)],sh(c,.72));
  poly(g,[P(x,y,z+h),P(x+w,y,z+h),P(x+w,y+d,z+h),P(x,y+d,z+h)],c);
}
// ko'rinadigan old yuz: yo'nalish 0 = +x, 1 = +y (qolganlari orqa tomonda)
function face(x,y,w,d,dir,z0,z1,i){i=i||0;
  if(dir===0)return[P(x+w,y+i,z0),P(x+w,y+d-i,z0),P(x+w,y+d-i,z1),P(x+w,y+i,z1)];
  if(dir===1)return[P(x+i,y+d,z0),P(x+w-i,y+d,z0),P(x+w-i,y+d,z1),P(x+i,y+d,z1)];
  return null}
var DV=[[1,0],[0,1],[-1,0],[0,-1]];
function rotate(it,r){var o={};for(var k in it)o[k]=it[k];for(var i=0;i<r;i++){var nx=N-(o.y+o.d);o.y=o.x;o.x=nx;var t=o.w;o.w=o.d;o.d=t;if(o.dir!=null)o.dir=(o.dir+1)%4}return o}
function rotPt(p,r){var x=p[0],y=p[1];for(var i=0;i<r;i++){var t=x;x=N-y;y=t}return[x,y]}
function W(x,y,z){var q=rotPt([x,y],rot);return P(q[0],q[1],z||0)}  // aylantirilgan dunyo nuqtasi -> ekran
var PAL={
 day:{floor:"#e2b98d",floorLine:"#d3a677",wall:"#f2dccb",wall2:"#e9cbb5",part:"#efd5c1",desk:"#f6efe6",leg:"#4a4f6b",panel:"#2f3e6b",mon:"#2b2f45",screen:"#3a6fd8",screenInk:"#cfe3ff",key:"#d9d4ce",accent:"#f08a4b",chair:"#e9e3dc",skin:"#f1c7a3",rack:"#2f3e6b",led:"#7dffb0",led2:"#ffd36b",fridge:"#2f3e6b",fridgeGlow:"#8fd7ff",counter:"#f08a4b",counterTop:"#f6efe6",stool:"#2f3e6b",sofa:"#f39a7b",cushion:"#ffd2a6",rug:"#e9c9a0",pot:"#d9774a",leaf:"#5ea35a",fgSoft:"#8a7f78",bgTop:"#ffe7cf",bgBot:"#ffc9a0",sky:"#a9dcff",lamp:"#ffd9a0",shelf:"#c99a66"},
 night:{floor:"#9a7258",floorLine:"#8a644c",wall:"#8e7486",wall2:"#7a6274",part:"#86707f",desk:"#d9cfd8",leg:"#2a2d42",panel:"#26305a",mon:"#1c1f30",screen:"#4f8cff",screenInk:"#e3efff",key:"#a9a0aa",accent:"#ff9a55",chair:"#b8adb8",skin:"#d9ae8e",rack:"#26305a",led:"#7dffb0",led2:"#ffd36b",fridge:"#26305a",fridgeGlow:"#9fe4ff",counter:"#d9763f",counterTop:"#d9cfd8",stool:"#26305a",sofa:"#c9735c",cushion:"#e6b88a",rug:"#a8826a",pot:"#b5603c",leaf:"#4a8a4a",fgSoft:"#c9bccc",bgTop:"#3a3156",bgBot:"#16131f",sky:"#18204a",lamp:"#ffcf80",shelf:"#9a7350"}
};
var DRAW={
 desk:function(g,o,T){
   var x=o.x,y=o.y,w=o.w,d=o.d,dv=DV[o.dir];
   [[.06,.06],[w-.14,.06],[.06,d-.14],[w-.14,d-.14]].forEach(function(l){box(g,x+l[0],y+l[1],0,.08,.08,.72,T.leg)});
   box(g,x+.05,y+.05,.1,w-.1,d-.1,.55,T.panel);
   box(g,x,y,.72,w,d,.08,T.desk);
   var cx=x+w/2-dv[0]*.22,cy=y+d/2-dv[1]*.22,mw=dv[0]?.1:.9,md=dv[0]?.9:.1,mx=cx-mw/2,my=cy-md/2;
   box(g,cx-.06,cy-.06,.8,.12,.12,.2,T.leg);
   box(g,mx,my,1,mw,md,.58,T.mon);
   var f=face(mx,my,mw,md,o.dir,1.05,1.53,.05);
   if(f){var s=el("g",{"class":o.on?"scr":"scr off",style:"animation-delay:"+(o.x*.3)+"s"},g);poly(s,f,o.on?T.screen:sh(T.mon,1.3));
     if(o.on){var a=f[0],b=f[1],c=f[3];for(var i=0;i<3;i++){var t=.25+i*.2,u=.55+((i*37+Math.round(o.x*10))%30)/100;
       el("line",{x1:a[0]+(c[0]-a[0])*t+(b[0]-a[0])*.15,y1:a[1]+(c[1]-a[1])*t+(b[1]-a[1])*.15,x2:a[0]+(c[0]-a[0])*t+(b[0]-a[0])*u,y2:a[1]+(c[1]-a[1])*t+(b[1]-a[1])*u,stroke:T.screenInk,"stroke-width":1.3,"stroke-linecap":"round",opacity:.85},s)}}}
   var kx=x+w/2+dv[0]*.15-(dv[0]?.12:.35),ky=y+d/2+dv[1]*.15-(dv[0]?.35:.12);
   box(g,kx,ky,.8,dv[0]?.24:.7,dv[0]?.7:.24,.03,T.key);
   box(g,x+(dv[1]?w-.3:w/2+.25),y+(dv[0]?d-.3:d/2+.25),.8,.12,.12,.14,T.accent);
 },
 person:function(g,o,T){
   var dv=DV[o.dir],px=o.x,py=o.y,ghost=!o.on;
   var G=el("g",ghost?{"class":"seat-ghost"}:{},g);
   box(G,px-.3,py-.3,.42,.6,.6,.08,T.chair);
   box(G,px-.04,py-.04,0,.08,.08,.42,T.leg);
   var bx=px+dv[0]*.3-(dv[0]?.04:.3),by=py+dv[1]*.3-(dv[1]?.04:.3);
   box(G,bx,by,.5,dv[0]?.08:.6,dv[0]?.6:.08,.7,T.chair);
   if(ghost){var c0=P(px,py,1.15);el("circle",{"class":"summon",cx:c0[0],cy:c0[1]-6,r:6,fill:"rgba(91,140,255,.18)",stroke:"#5b8cff","stroke-dasharray":"2 2"},G);return}
   box(G,px-.2,py-.2,.5,.4,.4,.55,o.shirt);
   var arms=el("g",{"class":"type"},G);
   box(arms,px-dv[0]*.38-.16,py-dv[1]*.38-.16,.82,.32,.32,.08,o.shirt);
   var h=P(px,py,1.2),hd=el("g",{"class":"nod",style:"animation-delay:"+(px*.4)+"s"},G);
   el("circle",{cx:h[0],cy:h[1]-6,r:6.5,fill:T.skin},hd);
   el("path",{d:"M"+(h[0]-6.5)+" "+(h[1]-7)+" a6.5 6.5 0 0 1 13 0 q-6.5 -3 -13 0z",fill:o.hair},hd);
 },
 spot:function(g,o,T){poly(g,[P(o.x,o.y,.02),P(o.x+o.w,o.y,.02),P(o.x+o.w,o.y+o.d,.02),P(o.x,o.y+o.d,.02)],"rgba(0,0,0,0)","fl")},
 rack:function(g,o,T){box(g,o.x,o.y,0,o.w,o.d,2.1,T.rack);
   var f=face(o.x,o.y,o.w,o.d,o.dir,0,2.1);if(!f)return;
   for(var i=0;i<6;i++){var t=.12+i*.14,a=f[0],b=f[1],c=f[3],px=a[0]+(c[0]-a[0])*t,py=a[1]+(c[1]-a[1])*t;
     el("line",{x1:px+(b[0]-a[0])*.15,y1:py+(b[1]-a[1])*.15,x2:px+(b[0]-a[0])*.85,y2:py+(b[1]-a[1])*.85,stroke:sh(T.rack,.6),"stroke-width":3},g);
     el("circle",{"class":"led",cx:px+(b[0]-a[0])*.8,cy:py+(b[1]-a[1])*.8,r:1.6,fill:i%2?T.led2:T.led,style:"animation-delay:"+(i*.17)+"s"},g)}},
 fridge:function(g,o,T){box(g,o.x,o.y,0,o.w,o.d,1.9,T.fridge);var f=face(o.x,o.y,o.w,o.d,o.dir,.15,1.75,.08);if(f)poly(g,f,T.fridgeGlow,"scr")},
 counter:function(g,o,T){box(g,o.x,o.y,0,o.w,o.d,1,T.counter);box(g,o.x-.05,o.y-.05,1,o.w+.1,o.d+.1,.08,T.counterTop);
   var c=P(o.x+o.w*.3,o.y+o.d/2,1.08);box(g,o.x+o.w*.3-.07,o.y+o.d/2-.07,1.08,.14,.14,.16,T.panel);
   for(var i=0;i<2;i++)el("path",{"class":"steam",d:"M"+(c[0]+i*3-1)+" "+(c[1]-6)+" q3 -4 0 -8 q-3 -4 0 -8",fill:"none",stroke:T.fgSoft,"stroke-width":1.2,style:"animation-delay:"+(i*1.3)+"s"},g);
   var b=P(o.x+o.w*.75,o.y+o.d/2,1.08);el("path",{d:"M"+(b[0]-6)+" "+b[1]+" a6 5 0 0 1 12 0z",fill:T.leg},g);el("circle",{cx:b[0],cy:b[1]-6,r:1.6,fill:T.leg},g)},
 stool:function(g,o,T){box(g,o.x+.16,o.y+.16,0,.08,.08,.68,T.leg);box(g,o.x,o.y,.68,.4,.4,.08,T.stool)},
 sofa:function(g,o,T){var dv=DV[o.dir];box(g,o.x,o.y,0,o.w,o.d,.42,T.sofa);
   var bx=dv[0]===1?o.x:dv[0]===-1?o.x+o.w-.25:o.x, by=dv[1]===1?o.y:dv[1]===-1?o.y+o.d-.25:o.y;
   box(g,bx,by,.42,dv[0]?.25:o.w,dv[0]?o.d:.25,.45,sh(T.sofa,.92));
   box(g,o.x+.25+(dv[0]===-1?0:0),o.y+.25,.42,.5,.5,.18,T.cushion)},
 table:function(g,o,T){box(g,o.x+.1,o.y+.1,0,o.w-.2,o.d-.2,.35,T.leg);box(g,o.x,o.y,.35,o.w,o.d,.06,T.desk)},
 rug:function(g,o,T){poly(g,[P(o.x,o.y,.01),P(o.x+o.w,o.y,.01),P(o.x+o.w,o.y+o.d,.01),P(o.x,o.y+o.d,.01)],T.rug)},
 plant:function(g,o,T){box(g,o.x,o.y,0,o.w,o.d,.5,T.pot);var c=P(o.x+o.w/2,o.y+o.d/2,.5);
   [-22,0,22,-10,12].forEach(function(a,i){var lg=el("g",{"class":"leaf",style:"animation-delay:"+(i*.4+o.x*.2)+"s"},g);
     el("path",{d:"M"+c[0]+" "+c[1]+" q"+(a*.6)+" -14 "+(a*.9)+" -"+(26+(i%2)*8)+" q"+(-a*.2)+" 16 "+(-a*.9)+" "+(26+(i%2)*8)+"z",fill:i%2?T.leaf:sh(T.leaf,.8)},lg)})},
 partition:function(g,o,T){box(g,o.x,o.y,0,o.w,o.d,o.h,T.part)}
};
PAL.day.rug2="#f6dcc0";PAL.night.rug2="#a88a76";PAL.day.cage="#f4f1ea";PAL.night.cage="#b9b4ad";
PAL.day.wood="#9a6a3c";PAL.night.wood="#6e4c2c";PAL.day.rope="#d9bf8c";PAL.night.rope="#a8926a";

// --- o'simliklar ---
DRAW.flower=function(g,o,T){var z=o.z||0;box(g,o.x,o.y,z,o.w,o.d,.32,o.pot||T.pot);var c=P(o.x+o.w/2,o.y+o.d/2,z+.32);
  var lg=el("g",{"class":"leaf",style:"animation-delay:"+(o.x*.3)+"s"},g);
  [[-7,-14],[0,-19],[7,-13],[-3,-9],[4,-8]].forEach(function(b,i){line(lg,c,[c[0]+b[0]*.6,c[1]+b[1]*.7],"#4f8a3c",1.2);
    if(i<3){el("circle",{cx:c[0]+b[0],cy:c[1]+b[1],r:3.4,fill:o.c},lg);el("circle",{cx:c[0]+b[0],cy:c[1]+b[1],r:1.2,fill:"#ffe680"},lg)}
    else el("ellipse",{cx:c[0]+b[0],cy:c[1]+b[1],rx:3.2,ry:1.6,fill:"#5ea35a"},lg)})};
DRAW.lavender=function(g,o,T){box(g,o.x,o.y,0,o.w,o.d,.3,"#e9e3dc");var c=P(o.x+o.w/2,o.y+o.d/2,.3);
  var lg=el("g",{"class":"leaf",style:"animation-delay:"+(o.y*.3)+"s"},g);
  for(var i=0;i<9;i++){var dx=(i-4)*1.8,h=13+(i%3)*4;line(lg,c,[c[0]+dx,c[1]-h],"#6c8f5a",1);
    for(var k=0;k<3;k++)el("circle",{cx:c[0]+dx+(k%2?.6:-.6),cy:c[1]-h+k*2,r:1.3,fill:k?"#9b7fd4":"#b49be6"},lg)}};
DRAW.bonsai=function(g,o,T){box(g,o.x,o.y,0,o.w,o.d,.18,"#3b4a6b");var c=P(o.x+o.w/2,o.y+o.d/2,.18);
  el("path",{d:"M"+c[0]+" "+c[1]+" q-4 -7 2 -11 q5 -3 1 -9",fill:"none",stroke:"#6b4a2b","stroke-width":3,"stroke-linecap":"round"},g);
  var lg=el("g",{"class":"leaf",style:"animation-delay:"+(o.x*.2)+"s"},g);
  [[-6,-13,7,4],[5,-18,8,4.5],[1,-25,6,3.6]].forEach(function(e){el("ellipse",{cx:c[0]+e[0],cy:c[1]+e[1],rx:e[2],ry:e[3],fill:"#3f7a34"},lg);el("ellipse",{cx:c[0]+e[0]-1,cy:c[1]+e[1]-1.5,rx:e[2]*.6,ry:e[3]*.5,fill:"#5ea35a"},lg)})};
DRAW.minitree=function(g,o,T){var z=o.z||0;box(g,o.x,o.y,z,o.w,o.d,.42,o.pot||"#e9e3dc");var c=P(o.x+o.w/2,o.y+o.d/2,z+.42),t=P(o.x+o.w/2,o.y+o.d/2,z+1.35);
  line(g,c,t,"#6b4a2b",3);var lg=el("g",{"class":"leaf",style:"animation-delay:"+(o.y*.2)+"s"},g);
  [[-8,0,10],[8,-2,10],[0,-10,11],[-4,-18,8],[6,-15,8]].forEach(function(e,i){el("circle",{cx:t[0]+e[0],cy:t[1]+e[1],r:e[2],fill:i%2?"#4f8a3c":"#5ea35a"},lg)});
  if(o.fruit)[[-6,2],[7,-6],[1,-14]].forEach(function(f){el("circle",{cx:t[0]+f[0],cy:t[1]+f[1],r:2,fill:o.fruit},lg)})};

// --- mushuklar burchagi ---
DRAW.bowl=function(g,o,T){box(g,o.x,o.y,0,o.w,o.d,.1,o.c);var c=P(o.x+o.w/2,o.y+o.d/2,.1);el("ellipse",{cx:c[0],cy:c[1],rx:4,ry:2,fill:o.food||"#8a5a2a"},g)};
DRAW.catbed=function(g,o,T){box(g,o.x,o.y,0,o.w,o.d,.18,o.c);box(g,o.x+.12,o.y+.12,.18,o.w-.24,o.d-.24,.02,sh(o.c,1.25))};
DRAW.cattree=function(g,o,T){var x=o.x,y=o.y;
  box(g,x,y,0,1.1,1.1,.1,T.rope);
  box(g,x+.05,y+.05,.1,.75,.75,.75,"#c98f5a");var f=face(x+.05,y+.05,.75,.75,(o.dir===0||o.dir===1)?o.dir:1,.2,.65,.2);if(f)poly(g,f,"#4a3020");
  box(g,x+.85,y+.85,.1,.16,.16,2.4,T.rope);box(g,x+.15,y+.85,.1,.16,.16,1.7,T.rope);
  box(g,x,y,.85,1.1,1.1,.1,"#e2b98d");
  box(g,x+.15,y+.25,1.75,.8,.8,.08,"#e2b98d");
  box(g,x+.35,y+.3,2.5,.75,.75,.1,"#e2b98d");box(g,x+.42,y+.37,2.6,.6,.6,.06,"#f39a7b");
  var t=P(x+.6,y+1.0,1.75);el("path",{"class":"leaf",d:"M"+t[0]+" "+t[1]+" q2 6 0 12",stroke:"#e8644a","stroke-width":1.2,fill:"none"},g);el("circle",{cx:t[0],cy:t[1]+13,r:2.2,fill:"#ffd36b"},g)};
DRAW.scratch=function(g,o,T){box(g,o.x,o.y,0,.7,.7,.08,T.rope);box(g,o.x+.22,o.y+.22,.08,.26,.26,1.15,T.rope);
  for(var i=0;i<7;i++){var a=P(o.x+.22,o.y+.48,.2+i*.14),b=P(o.x+.48,o.y+.48,.25+i*.14);line(g,a,b,"#b89a68",1)}
  box(g,o.x+.1,o.y+.1,1.23,.5,.5,.07,"#e2b98d")};
DRAW.cathouse=function(g,o,T){box(g,o.x,o.y,0,o.w,o.d,.62,o.c);poly(g,[P(o.x,o.y,.62),P(o.x+o.w,o.y,.62),P(o.x+o.w/2,o.y+o.d/2,.95)],sh(o.c,.8));
  var f=face(o.x,o.y,o.w,o.d,1,.05,.45,.22)||face(o.x,o.y,o.w,o.d,0,.05,.45,.22);if(f)poly(g,f,"#3a2a20")};
DRAW.tunnel=function(g,o,T){box(g,o.x,o.y,0,o.w,o.d,.42,"#5b8cff");var f=face(o.x,o.y,o.w,o.d,o.w>o.d?0:1,.04,.38,.05);if(f){var c=[(f[0][0]+f[2][0])/2,(f[0][1]+f[2][1])/2];el("ellipse",{cx:c[0],cy:c[1],rx:4.5,ry:5,fill:"#1d2a55"},g)}};
DRAW.toy=function(g,o,T){var c=P(o.x,o.y,.1);el("ellipse",{cx:c[0],cy:c[1]+2,rx:3.5,ry:1.4,fill:"#000",opacity:.2},g);el("circle",{"class":"roll",cx:c[0],cy:c[1],r:3,fill:o.c},g);el("path",{d:"M"+(c[0]-3)+" "+c[1]+" h6",stroke:"#fff","stroke-width":.8},g)};
DRAW.litter=function(g,o,T){box(g,o.x,o.y,0,o.w,o.d,.28,"#c5ccd8");box(g,o.x+.08,o.y+.08,.28,o.w-.16,o.d-.16,.01,"#e9dcc0")};
DRAW.fence=function(g,o,T){box(g,o.x,o.y,0,o.w,o.d,.55,"#f6efe6")};

// --- qushxona: orqa qism, qushlar qatlami, old to'r ---
var BIRDLAYER=null;
DRAW.aviary=function(g,o,T){var x=o.x,y=o.y,w=o.w,d=o.d,h=2.7,fr="#9aa3b5";
  box(g,x,y,0,w,d,.22,T.cage);
  var bk=el("g",{opacity:.55},g);
  for(var i=0;i<=12;i++){line(bk,P(x+w*i/12,y,.22),P(x+w*i/12,y,h),fr,.6);line(bk,P(x,y+d*i/12,.22),P(x,y+d*i/12,h),fr,.6)}
  [[x,y],[x+w,y],[x,y+d]].forEach(function(p){line(g,P(p[0],p[1],0),P(p[0],p[1],h),"#6f7890",2)});
  // ichidagi daraxt, chiviqlar, ovqatdon, uycha
  PERCHES.forEach(function(p){var q=rotPt(p,rot);line(g,P(q[0]-.32,q[1],p[2]),P(q[0]+.32,q[1],p[2]),T.wood,2.2);line(g,P(q[0]-.32,q[1],p[2]),P(q[0]-.32,q[1],p[2]-.25),T.wood,1)});
  var tq=rotPt(BTREE,rot),tb=P(tq[0],tq[1],.22),tt=P(tq[0],tq[1],1.9);line(g,tb,tt,"#6b4a2b",3.5);
  var lg=el("g",{"class":"leaf"},g);[[-10,0,11],[9,-3,11],[0,-12,12],[-6,-20,8],[7,-19,8]].forEach(function(e,i){el("circle",{cx:tt[0]+e[0],cy:tt[1]+e[1],r:e[2],fill:i%2?"#4f8a3c":"#5ea35a",opacity:.95},lg)});
  var fq=rotPt(BFEED,rot);box(g,fq[0]-.35,fq[1]-.25,.22,.7,.5,.12,"#e8644a");var fc=P(fq[0],fq[1],.34);el("ellipse",{cx:fc[0],cy:fc[1],rx:7,ry:3,fill:"#e8c66a"},g);
  var hq=rotPt(BHOUSE,rot);line(g,P(hq[0],hq[1],.22),P(hq[0],hq[1],1.5),T.wood,2);box(g,hq[0]-.25,hq[1]-.25,1.5,.5,.5,.45,"#c98f5a");
  poly(g,[P(hq[0]-.3,hq[1]-.3,1.95),P(hq[0]+.3,hq[1]-.3,1.95),P(hq[0]+.3,hq[1]+.3,1.95),P(hq[0]-.3,hq[1]+.3,1.95)],"#8a4a2a");
  var hh=P(hq[0]+.25,hq[1],1.75);el("circle",{cx:hh[0],cy:hh[1],r:2.2,fill:"#3a2a20"},g);
  BIRDLAYER=el("g",{},g);
  var fg=el("g",{},g);
  line(fg,P(x+w,y+d,0),P(x+w,y+d,h),"#6f7890",2);
  poly(fg,[P(x,y,h),P(x+w,y,h),P(x+w,y+d,h),P(x,y+d,h)],"rgba(200,215,235,.18)",null,{stroke:"#6f7890","stroke-width":1.5});
  for(i=0;i<=12;i++){line(fg,P(x+w,y+d*i/12,.22),P(x+w,y+d*i/12,h),fr,.5,{opacity:.55});line(fg,P(x+w*i/12,y+d,.22),P(x+w*i/12,y+d,h),fr,.5,{opacity:.55})}
  poly(fg,[P(x+w,y,.22),P(x+w,y+d,.22),P(x+w,y+d,h),P(x+w,y,h)],"rgba(190,220,255,.08)");
  poly(fg,[P(x,y+d,.22),P(x+w,y+d,.22),P(x+w,y+d,h),P(x,y+d,h)],"rgba(190,220,255,.1)");
};
// ---------- Reja: ish zonasi, qabulxona, mushuklar burchagi, qushxona ----------
var DESK_W=1.6,DESK_D=.9;
var LAYOUT=[{t:"rug",x:.5,y:.9,w:6.6,d:6.4},{t:"rug",x:8.7,y:8.5,w:5.1,d:5.3,c:"rug2"}];
[["plan",.9,1.4],["idea",3.1,1.4],["studio",5.3,1.4],["write",.9,5.0],["check",3.1,5.0],["tech",5.3,5.0]].forEach(function(s){
  LAYOUT.push({t:"spot",rid:s[0],x:s[1]-.15,y:s[2]-.15,w:DESK_W+.3,d:DESK_D+1.15});
  LAYOUT.push({t:"desk",rid:s[0],x:s[1],y:s[2],w:DESK_W,d:DESK_D,dir:1});
  LAYOUT.push({t:"person",rid:s[0],x:s[1]+DESK_W/2,y:s[2]+DESK_D+.65,w:0,d:0,dir:1});
});
LAYOUT=LAYOUT.concat([
 // arxiv
 {t:"spot",rid:"arch",x:.1,y:7.6,w:1.9,d:1.2},
 {t:"rack",rid:"arch",x:.25,y:7.8,w:.75,d:.75,dir:0},{t:"rack",rid:"arch",x:1.1,y:7.8,w:.75,d:.75,dir:1},
 // qabulxona va oshxona
 {t:"partition",x:7.7,y:0,w:.2,d:3,h:2.4},
 {t:"spot",rid:"recep",x:8.9,y:3,w:3,d:1.6},
 {t:"counter",rid:"recep",x:9.1,y:3.2,w:2.6,d:.6},
 {t:"stool",x:9.3,y:4.05,w:.4,d:.4},{t:"stool",x:10.2,y:4.05,w:.4,d:.4},{t:"stool",x:11.1,y:4.05,w:.4,d:.4},
 {t:"fridge",x:13.1,y:.3,w:.7,d:.7,dir:1},
 // dam olish
 {t:"sofa",x:6.1,y:11.6,w:2.2,d:1,dir:3},{t:"table",x:6.5,y:10.2,w:1.4,d:.8},
 // mushuklar burchagi
 {t:"fence",x:8.6,y:8.35,w:5.3,d:.12},{t:"fence",x:8.6,y:8.35,w:.12,d:2.0},
 {t:"cattree",x:12.6,y:8.7,w:1.1,d:1.1,dir:1},
 {t:"scratch",x:9.1,y:8.7,w:.7,d:.7},
 {t:"tunnel",x:10.3,y:9.4,w:1.3,d:.45},
 {t:"bowl",x:8.9,y:10.7,w:.32,d:.32,c:"#e8644a"},{t:"bowl",x:8.9,y:11.15,w:.32,d:.32,c:"#5b8cff"},{t:"bowl",x:8.9,y:11.6,w:.32,d:.32,c:"#5ea35a"},{t:"bowl",x:8.9,y:12.05,w:.32,d:.32,c:"#e9f4ff",food:"#9fd8ff"},
 {t:"catbed",x:12.8,y:12.8,w:.85,d:.85,c:"#f39a7b"},{t:"catbed",x:9.3,y:12.95,w:.85,d:.85,c:"#9fb8e8"},
 {t:"cathouse",x:11.1,y:13.0,w:.8,d:.8,c:"#ffd2a6"},
 {t:"litter",x:13.2,y:11.0,w:.6,d:.8},
 {t:"toy",x:11.0,y:10.6,w:.01,d:.01,c:"#ff6b8a"},{t:"toy",x:10.2,y:11.9,w:.01,d:.01,c:"#ffd23f"},{t:"toy",x:12.1,y:11.7,w:.01,d:.01,c:"#5b8cff"},
 // qushxona (yopiq, mushuklar kira olmaydi)
 {t:"aviary",x:.6,y:9.4,w:4.2,d:4.0},
 // o'simliklar: havoni tozalaydigan gullar va miniatyur daraxtlar
 {t:"flower",x:.05,y:2.2,w:.35,d:.35,c:"#ff6b8a"},{t:"lavender",x:.05,y:3.3,w:.35,d:.35},{t:"flower",x:.05,y:5.0,w:.35,d:.35,c:"#ffd23f"},{t:"minitree",x:.02,y:6.3,w:.45,d:.45},
 {t:"bonsai",x:1.4,y:.2,w:.6,d:.4},{t:"flower",x:2.6,y:.15,w:.35,d:.35,c:"#c77dff"},{t:"bonsai",x:3.6,y:.2,w:.6,d:.4},{t:"minitree",x:6.6,y:.2,w:.45,d:.45,fruit:"#ffb347"},
 {t:"minitree",x:13.3,y:1.6,w:.45,d:.45,fruit:"#e8644a"},{t:"lavender",x:12.4,y:.25,w:.35,d:.35},
 {t:"plant",x:13.3,y:6.0,w:.5,d:.5},{t:"plant",x:.3,y:.2,w:.45,d:.45},{t:"plant",x:5.3,y:13.3,w:.55,d:.55},
 {t:"flower",x:7.0,y:10.45,w:.3,d:.3,c:"#ff6b8a",z:.41},{t:"bonsai",x:10.6,y:3.25,w:.5,d:.35,z:1.08},
 {t:"minitree",x:8.2,y:13.2,w:.45,d:.45},{t:"lavender",x:5.4,y:9.2,w:.35,d:.35}
]);
DRAW.bonsai=(function(f){return function(g,o,T){if(o.z){var oo={};for(var k in o)oo[k]=o[k];box(g,o.x,o.y,o.z,o.w,o.d,.15,"#3b4a6b");var c=P(o.x+o.w/2,o.y+o.d/2,o.z+.15);
  el("path",{d:"M"+c[0]+" "+c[1]+" q-3 -5 1 -8",fill:"none",stroke:"#6b4a2b","stroke-width":2.4},g);var lg=el("g",{"class":"leaf"},g);
  [[-4,-9,5,3],[4,-12,5.5,3],[0,-16,4,2.6]].forEach(function(e){el("ellipse",{cx:c[0]+e[0],cy:c[1]+e[1],rx:e[2],ry:e[3],fill:"#4f8a3c"},lg)});return}f(g,o,T)}})(DRAW.bonsai);
DRAW.rug=(function(f){return function(g,o,T){poly(g,[P(o.x,o.y,.01),P(o.x+o.w,o.y,.01),P(o.x+o.w,o.y+o.d,.01),P(o.x,o.y+o.d,.01)],o.c?T[o.c]:T.rug)}})();
var LOOK={studio:{shirt:"#e8644a",hair:"#2b1d14"},tech:{shirt:"#3f6fd8",hair:"#5a3a1c"},write:{shirt:"#c13584",hair:"#1a1a1a"}};
var WALK=[[7.3,13.4],[7.3,4.3],[.8,4.3],[7.3,4.3],[7.3,5.5],[10.4,5.5],[10.4,4.95],[10.4,5.5],[7.3,5.5],[7.3,7.9],[2.4,7.9],[7.3,7.9],[7.3,9.0],[5.3,9.0],[5.3,11.4],[5.3,9.0],[7.3,9.0]];
var ROOM_BY={};ROOMS.forEach(function(r){ROOM_BY[r.id]=r});

// ---------- Uy hayvonlari ----------
var PERCHES=[[1.2,9.9,1.6],[2.2,9.9,1.7],[3.4,9.9,2.1],[4.3,10.3,1.2],[1.0,11.0,2.2],[1.0,12.2,1.0],[2.3,11.5,1.4],[3.5,12.4,1.9],[4.3,12.9,1.0],[2.0,12.9,2.3],[3.0,10.7,.85],[1.8,10.4,2.45],[3.7,11.0,2.15],[4.1,11.5,1.55]];
var BTREE=[3.7,11.0], BFEED=[2.6,12.7], BHOUSE=[1.3,13.0];
var BFEEDSPOTS=[[2.3,12.7,.36],[2.6,12.55,.36],[2.9,12.7,.36],[2.45,12.95,.36],[2.8,12.95,.36],[1.6,12.6,.22],[3.3,12.4,.22],[2.0,12.2,.22],[3.0,13.1,.22],[1.9,13.2,.22]];
var BIRDS=[
 {name:"Kesha",kind:"To'lqinli to'tiqush",body:"#7ccf4a",head:"#f6e65a",wing:"#3f8a2a",tail:"#2f6fb8",beak:"#f2c27a",s:1},
 {name:"Moviy",kind:"To'lqinli to'tiqush",body:"#5aa8f0",head:"#f4f4f4",wing:"#2a5a9a",tail:"#1f3f8a",beak:"#f2c27a",s:1},
 {name:"Sariq",kind:"Kanareyka",body:"#ffd84a",head:"#ffd84a",wing:"#e8b52a",tail:"#e8b52a",beak:"#f2b07a",s:.85},
 {name:"Quyosh",kind:"Kanareyka",body:"#ffb84a",head:"#ffc65a",wing:"#e8962a",tail:"#e8962a",beak:"#f2b07a",s:.85},
 {name:"Lola",kind:"Sevgi qushi (agapornis)",body:"#5ec85a",head:"#ff7a4a",wing:"#3a9a3a",tail:"#3a7ad8",beak:"#e8423a",s:1.05},
 {name:"Gul",kind:"Sevgi qushi (agapornis)",body:"#6fd06a",head:"#ff9a5a",wing:"#3a9a3a",tail:"#3a7ad8",beak:"#e8423a",s:1.05},
 {name:"Korella",kind:"Korella (nimfa)",body:"#9a9aa4",head:"#ffe25a",wing:"#7a7a84",tail:"#6a6a74",beak:"#9a8a7a",s:1.25,crest:true,cheek:"#ff8a3a"},
 {name:"Zebra",kind:"Zebra amadinasi",body:"#b8b2a8",head:"#9a948a",wing:"#8a7a6a",tail:"#3a3a3a",beak:"#ff6a3a",s:.75,cheek:"#e8843a"},
 {name:"Chiqi",kind:"Zebra amadinasi",body:"#c4beb4",head:"#a49e94",wing:"#8a7a6a",tail:"#3a3a3a",beak:"#ff6a3a",s:.75,cheek:"#e8843a"},
 {name:"Ara",kind:"Ara to'tiqushi",body:"#e8302a",head:"#e8302a",wing:"#2a6ad8",tail:"#2a6ad8",beak:"#f4efe6",s:1.6,face:"#fff"}
];
BIRDS.forEach(function(b,i){var p=PERCHES[i];b.x=p[0];b.y=p[1];b.z=p[2];b.perch=i;b.state="perch";b.timer=1500+Math.random()*5000;b.face=i%2?1:-1});
var CATS=[
 {name:"Barsik",breed:"Britaniya ko'k mushugi",col:"#8a95a8",dark:"#6f7a8c",ear:"#8a95a8",eye:"#f2a93b",s:1.05,x:10.2,y:10.6},
 {name:"Laylo",breed:"Siam mushugi",col:"#efe2cc",dark:"#5a4636",ear:"#5a4636",eye:"#5ab4ff",s:.95,x:11.6,y:11.0,mask:true},
 {name:"Sher",breed:"Meyn-kun",col:"#a8743f",dark:"#6b4522",ear:"#a8743f",eye:"#9ad04a",s:1.25,x:12.0,y:12.0,stripes:true}
];
CATS.forEach(function(c,i){c.state="idle";c.timer=1200+i*900;c.z=0;c.face=1});
var CATNAPS=[[13.2,9.3,2.66],[13.3,13.25,.2],[9.75,13.4,.2]], CATSPOTS=[[10.0,10.0],[11.2,10.9],[12.2,10.2],[10.8,12.3],[12.3,12.1],[11.7,11.4],[10.1,11.6],[9.7,9.9]];
var TOYS=[[11.0,10.6],[10.2,11.9],[12.1,11.7]], SCRATCH=[9.95,9.4], BOWLS=[[9.45,10.86],[9.45,11.31],[9.45,11.76]];
var WK={x:WALK[0][0],y:WALK[0][1],seg:0,tt:0,task:null,hist:[],face:1,moving:false};
var CAT_FEED_PT=[9.7,12.4], BIRD_FEED_PT=[5.25,12.2], WIN_PT=[.9,4.6];

// Rejim (Toshkent vaqti, daqiqalarda)
function tkMin(){try{var p=new Intl.DateTimeFormat("en-GB",{timeZone:"Asia/Tashkent",hour:"2-digit",minute:"2-digit",hour12:false}).format(new Date()).split(":");return (+p[0]%24)*60+(+p[1])}catch(e){var d=new Date(Date.now()+(new Date().getTimezoneOffset()+300)*60000);return d.getHours()*60+d.getMinutes()}}
var SCHED={catFeed:[480,780,1140],catWalk:[600,1020],birdFeed:[510,1080]};
function inWin(t,list,len){for(var i=0;i<list.length;i++)if(t>=list[i]&&t<list[i]+len)return true;return false}
var FORCE={cat:null,catUntil:0,bird:0,win:null,winUntil:0};
function catMode(now){if(now<FORCE.catUntil)return FORCE.cat;var t=tkMin();if(inWin(t,SCHED.catFeed,20))return"feed";if(inWin(t,SCHED.catWalk,25))return"walk";if(t>=1380||t<420)return"sleep";return"free"}
function birdMode(now){if(now<FORCE.bird)return"feed";var t=tkMin();if(inWin(t,SCHED.birdFeed,20))return"feed";if(t>=1260||t<420)return"sleep";return"free"}
function winOpen(now){if(now<FORCE.winUntil)return FORCE.win;var t=tkMin();return t>=420&&t<1320&&(t%60)<10}

function wallQ(side,a0,a1,z0,z1){return side==="L"?[P(0,a0,z0),P(0,a1,z0),P(0,a1,z1),P(0,a0,z1)]:[P(a0,0,z0),P(a1,0,z0),P(a1,0,z1),P(a0,0,z1)]}
function at(side,a,z){return side==="L"?P(0,a,z):P(a,0,z)}
var WINREF=null;
function decorate(g,T,night){
  var defs=el("defs",{},g),Y0=2.6,Y1=6.6,YM=4.6,Z0=1.1,Z1=2.8,win=wallQ("L",Y0,Y1,Z0,Z1);
  var cp=el("clipPath",{id:"winclip"},defs);poly(cp,win,"#000");
  var wg=el("g",{"clip-path":"url(#winclip)"},g);poly(wg,win,T.sky);
  var b=P(0,Y0,Z0);
  if(!night){
    el("circle",{cx:b[0]-36,cy:b[1]-40,r:10,fill:"#fff2b3"},wg);
    for(var i=0;i<3;i++){var cg=el("g",{"class":"cloud",style:"animation-delay:"+(-i*6)+"s"},wg);el("ellipse",{cx:b[0]-60+i*30,cy:b[1]-10-i*12,rx:12,ry:4,fill:"#fff",opacity:.9},cg)}
    // tashqaridagi daraxtlar
    [[-20,10],[-55,22],[-80,36]].forEach(function(t){el("circle",{cx:b[0]+t[0],cy:b[1]+t[1]-4,r:9,fill:"#7cbf6a"},wg)});
    el("path",{d:"M"+P(0,Y0,Z0).join(" ")+" L"+P(0,Y1,Z0).join(" ")+" L"+P(3.6,Y1+1.6,0).join(" ")+" L"+P(3.6,Y0+1.6,0).join(" ")+"z",fill:"#fff4c8",opacity:.3,"class":"sunbeam","pointer-events":"none"},g);
  } else {
    el("circle",{cx:b[0]-38,cy:b[1]-42,r:8,fill:"#f3ecd2"},wg);el("circle",{cx:b[0]-34,cy:b[1]-45,r:7,fill:T.sky},wg);
    for(var s=0;s<11;s++)el("circle",{"class":"led",cx:b[0]-90+s*9,cy:b[1]-8-((s*23)%48),r:1,fill:"#fff",style:"animation-delay:"+(s*.37)+"s;animation-duration:2.2s"},wg);
  }
  poly(g,win,"none",null,{stroke:"#fff",opacity:.75,"stroke-width":3});
  line(g,P(0,YM,Z0),P(0,YM,Z1),"#fff",2,{opacity:.8});
  // yopiq oyna (shisha) va ochiq oyna (ichkariga ochilgan tabaqa, shamol)
  var closed=el("g",{},g);poly(closed,wallQ("L",YM,Y1,Z0,Z1),"rgba(255,255,255,.22)");line(closed,P(0,YM+.3,Z1-.2),P(0,YM+1.1,Z0+.5),"#fff",1.5,{opacity:.6});
  var open=el("g",{style:"display:none"},g);
  var hx=1.5,hy=Y1-.55;poly(open,[P(0,Y1,Z0),P(hx,hy,Z0),P(hx,hy,Z1),P(0,Y1,Z1)],"rgba(225,240,255,.35)",null,{stroke:"#fff","stroke-width":2.5});
  for(i=0;i<3;i++){var a=P(.3,Y0+.6+i*1.1,Z0+.4+i*.35);el("path",{"class":"wind",d:"M"+a[0]+" "+a[1]+" q18 2 30 10 t34 6",fill:"none",stroke:night?"#cfe3ff":"#9fd8ff","stroke-width":1.6,"stroke-linecap":"round","stroke-dasharray":"10 70",style:"animation-delay:"+(i*.5)+"s"},open)}
  // parda
  var c1=P(0,Y0-.35,Z1+.1),c2=P(0,Y0+.25,Z1+.1),c3=P(0,Y0+.2,Z0-.2),c4=P(0,Y0-.35,Z0-.2);
  var cur=el("path",{"class":"curtain",d:"M"+c1.join(" ")+" L"+c2.join(" ")+" Q"+(c2[0]+6)+" "+((c2[1]+c3[1])/2)+" "+c3.join(" ")+" L"+c4.join(" ")+"z",fill:"#f39a7b",opacity:.9},g);
  WINREF={closed:closed,open:open,cur:cur,state:null};
  // devordagi ekran: ofis holati
  poly(g,wallQ("R",1.2,5,1.5,2.9),"#24293f");
  poly(g,wallQ("R",1.3,4.9,1.58,2.82),"#3a6fd8","scr");
  var on=ROOMS.filter(function(r){return r.agent&&r.ready}).length;
  var t1=P(1.5,0,2.5);el("text",{x:t1[0],y:t1[1],"class":"wtxt","font-size":12,"font-weight":800,fill:"#fff",transform:"skewY(30)","transform-origin":t1[0]+" "+t1[1]},g).textContent="JASUR OFISI";
  var t2=P(1.5,0,2.12);el("text",{x:t2[0],y:t2[1],"font-size":8.5,fill:"#cfe3ff",transform:"skewY(30)","transform-origin":t2[0]+" "+t2[1]},g).textContent=on+" agent ishlayapti";
  [["R",.4,13.6],["L",.4,13.6]].forEach(function(s){line(g,at(s[0],s[1],3.05),at(s[0],s[2],3.05),T.lamp,3,{"class":night?"lamp on":"lamp"})});
  box(g,9.4,0,2.02,1.8,.35,.08,T.shelf);
  [9.6,10.1,10.7].forEach(function(x,i){box(g,x,.08,2.1,.22,.2,.3+i%2*.12,[T.accent,T.screen,T.leaf][i])});
  // qushxona yonidagi yozuv taxtasi
}

var rot=0, selId=null, drawnMode=null, LIVE=null;
function render(){
  var night=root.getAttribute("data-time")==="night", T=night?PAL.night:PAL.day;drawnMode=night?"night":"day";
  while(svg.firstChild)svg.removeChild(svg.firstChild);
  var defs=el("defs",{}),gr=el("radialGradient",{id:"bgg",cx:"50%",cy:"40%",r:"70%"},defs);
  el("stop",{offset:"0","stop-color":T.bgTop},gr);el("stop",{offset:"1","stop-color":T.bgBot},gr);
  el("rect",{width:VW,height:VH,fill:"url(#bgg)"});
  var sc=el("g",{"class":"scene"}),fl=el("g",{"class":"float"},sc);
  var s0=P(N/2,N/2,-.6);el("ellipse",{cx:s0[0],cy:s0[1]+22,rx:320,ry:48,fill:"#000",opacity:.2},fl);
  box(fl,0,0,-.35,N,N,.35,T.floor);
  for(var i=1;i<N/.8;i++){line(fl,P(i*.8,0,0),P(i*.8,N,0),T.floorLine,1)}
  box(fl,-.25,-.25,0,.25,.25,WH,T.wall2);
  box(fl,-.25,0,0,.25,N,WH,T.wall2);poly(fl,[P(0,0,0),P(0,N,0),P(0,N,WH),P(0,0,WH)],T.wall);
  box(fl,0,-.25,0,N,.25,WH,T.wall2);poly(fl,[P(0,0,0),P(N,0,0),P(N,0,WH),P(0,0,WH)],sh(T.wall,.94));
  decorate(fl,T,night);
  var items=LAYOUT.map(function(it){return rotate(it,rot)});
  function key(a){return a.t==="rug"?-99:a.t==="spot"?-98:a.t==="toy"?a.x+a.y-1:a.x+a.w/2+a.y+a.d/2+(a.t==="person"?.6:0)+(a.z||0)}
  items.sort(function(a,b){return key(a)-key(b)});
  var tags=[];
  items.forEach(function(it){
    var g, r=it.rid&&ROOM_BY[it.rid];
    if(r){
      g=el("g",{"class":"room","data-id":r.id,tabindex:it.t==="desk"||it.t==="counter"||(it.t==="rack"&&it.dir===0)?"0":"-1",role:"button","aria-label":r.name+", "+r.sub},fl);
      g.addEventListener("click",function(){select(r.id)});
      g.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();select(r.id)}});
      g=el("g",{"class":"lift"},g);
    } else g=el("g",{},fl);
    var o=it;
    if(it.t==="desk"||it.t==="person"){o={};for(var k in it)o[k]=it[k];o.on=!!(r&&r.ready);var L=LOOK[it.rid]||{shirt:"#7a8bb0",hair:"#3a2a1a"};o.shirt=L.shirt;o.hair=L.hair;
      if(it.t==="person"&&o.on)tags.push([P(it.x,it.y,1.9),r.agent])}
    DRAW[it.t](g,o,T);
  });
  var top=el("g",{},fl);
  // administrator ofis bo'ylab yuradi va hayvonlarga qaraydi
  var wk=el("g",{"pointer-events":"none"},top),body=el("g",{},wk);
  el("ellipse",{cx:0,cy:0,rx:7,ry:3,fill:"#000",opacity:.25},body);
  var lg1=el("rect",{x:-4,y:-14,width:3,height:14,fill:"#2b2f45"},body),lg2=el("rect",{x:1,y:-14,width:3,height:14,fill:"#2b2f45"},body);
  el("rect",{x:-6,y:-30,width:12,height:17,rx:3,fill:T.accent},body);
  el("rect",{x:-4,y:-26,width:8,height:6,rx:1,fill:"#fff",opacity:.9},body);
  el("circle",{cx:0,cy:-35,r:6,fill:T.skin},body);
  var catG=CATS.map(function(c){return catShape(top,c)});
  var birdG=BIRDS.map(function(b){return birdShape(BIRDLAYER,b)});
  tags.forEach(function(tg,i){var p=tg[0],w=tg[1].length*6.4+18,gg=el("g",{"class":"tagb",style:"animation-delay:"+i*.6+"s","pointer-events":"none"},fl);
    el("rect",{x:p[0]-w/2,y:p[1]-28,width:w,height:17,rx:8.5,fill:"#000",opacity:.72},gg);
    el("circle",{cx:p[0]-w/2+8,cy:p[1]-19.5,r:3,fill:"#7dffb0","class":"led"},gg);
    el("text",{x:p[0]+5,y:p[1]-15.5,"text-anchor":"middle","font-size":10.5,"font-weight":700,fill:"#fff"},gg).textContent=tg[1]});
  if(selId)Array.prototype.forEach.call(svg.querySelectorAll(".room"),function(g){g.classList.toggle("sel",g.getAttribute("data-id")===selId)});
  LIVE={body:body,lg1:lg1,lg2:lg2,cats:catG,birds:birdG};
  if(WINREF)WINREF.state=null;
  drawLive(performance.now());
}

function catShape(p,c){var g=el("g",{"class":"pet","data-cat":c.name},p),a=el("g",{},g),s=el("g",{style:"display:none"},g);
  var tailc=c.stripes||c.mask?c.dark:c.col;
  el("ellipse",{cx:0,cy:0,rx:8,ry:2.6,fill:"#000",opacity:.18},g);
  el("path",{"class":"tail",d:"M-8 -7 q-8 -3 -6 -13",stroke:tailc,"stroke-width":3.2,fill:"none","stroke-linecap":"round"},a);
  var l1=el("rect",{x:-6.5,y:-4,width:2.8,height:4,rx:1,fill:c.col},a),l2=el("rect",{x:3.8,y:-4,width:2.8,height:4,rx:1,fill:c.col},a);
  el("ellipse",{cx:0,cy:-7,rx:9,ry:5.2,fill:c.col},a);
  if(c.stripes)[-5,-1,3].forEach(function(x){el("path",{d:"M"+x+" -12 q1.5 4 0 7",stroke:c.dark,"stroke-width":1.4,fill:"none"},a)});
  var hd=el("g",{},a);
  el("polygon",{points:"5,-13 5.8,-19.5 9,-15",fill:c.ear},hd);el("polygon",{points:"9.5,-15.5 12,-19.5 12.8,-13",fill:c.ear},hd);
  if(c.stripes){el("path",{d:"M5.8 -19.5 l-.6 -2.4 M12 -19.5 l.6 -2.4",stroke:c.dark,"stroke-width":1},hd)}
  el("circle",{cx:9,cy:-11.5,r:5,fill:c.col},hd);
  if(c.mask)el("ellipse",{cx:10.8,cy:-10.6,rx:3.1,ry:2.8,fill:c.dark,opacity:.8},hd);
  if(c.stripes)el("path",{d:"M7 -15.5 l1 2 M9 -16.3 v2.4 M11 -15.5 l-1 2",stroke:c.dark,"stroke-width":1},hd);
  el("circle",{cx:11.4,cy:-12.4,r:1.25,fill:c.eye},hd);el("circle",{cx:11.6,cy:-12.4,r:.5,fill:"#111"},hd);
  el("circle",{cx:13.7,cy:-10.4,r:.8,fill:"#d77"},hd);
  el("path",{d:"M13 -9.6 l3 -.4 M13 -9 l3 .6",stroke:"#fff","stroke-width":.4,opacity:.8},hd);
  el("ellipse",{cx:0,cy:-5,rx:9,ry:5.5,fill:c.col},s);
  if(c.stripes)[-4,0,4].forEach(function(x){el("path",{d:"M"+x+" -10 q1.5 3 0 5",stroke:c.dark,"stroke-width":1.3,fill:"none"},s)});
  el("circle",{cx:5.5,cy:-6.5,r:4.4,fill:c.mask?c.dark:c.col},s);
  el("polygon",{points:"3,-9.5 3.8,-13 6,-10.4",fill:c.ear},s);el("polygon",{points:"6.5,-10.6 8.5,-13.2 9,-9.4",fill:c.ear},s);
  el("path",{d:"M-8 -2.5 q8 5 16 1",stroke:tailc,"stroke-width":3,fill:"none","stroke-linecap":"round"},s);
  el("text",{"class":"zz",x:9,y:-15,"font-size":8,"font-weight":800,fill:"#5b6b8c"},s).textContent="z";
  var heart=el("text",{x:2,y:-24,"font-size":11,fill:"#e8644a",opacity:0,"pointer-events":"none"},g);heart.textContent="♥";
  g.addEventListener("click",function(){petCat(c,heart)});
  return{g:g,a:a,s:s,hd:hd,l1:l1,l2:l2,heart:heart}}
function petCat(c,heart){c.purr=performance.now()+2500;if(heart.animate)try{heart.animate([{opacity:1,transform:"translateY(0)"},{opacity:0,transform:"translateY(-14px)"}],{duration:1400})}catch(e){}
  var info=document.getElementById("care-line");if(info)info.textContent=c.name+" erkalandi va xurillayapti. Stress ketdi.";}

function birdShape(p,b){var g=el("g",{},p),s=b.s;var inner=el("g",{transform:"scale("+s+")"},g);
  el("polygon",{points:b.face&&s>1.4?"-3,-3 -12,2 -11,4 -2,-1.5":"-3.5,-3 -8,-.5 -3,-1.5",fill:b.tail},inner);
  el("ellipse",{cx:0,cy:-4,rx:4.3,ry:3,fill:b.body,transform:"rotate(-20)"},inner);
  var wing=el("ellipse",{cx:-.6,cy:-4.4,rx:3.1,ry:1.8,fill:b.wing,transform:"rotate(-15)"},inner);
  var hd=el("g",{},inner);
  if(b.crest)el("path",{d:"M2.4 -9 q-1 -4 2 -5",stroke:b.head,"stroke-width":1.1,fill:"none"},hd);
  el("circle",{cx:3.2,cy:-7.2,r:2.5,fill:b.head},hd);
  if(b.face)el("circle",{cx:4,cy:-7.3,r:1.4,fill:b.face},hd);
  if(b.cheek)el("circle",{cx:3.4,cy:-6.4,r:.9,fill:b.cheek},hd);
  el("polygon",{points:"5.3,-7.8 7.3,-7 5.3,-6.2",fill:b.beak},hd);
  var eye=el("circle",{cx:4.1,cy:-7.7,r:.6,fill:"#111"},hd);
  return{g:g,wing:wing,hd:hd,eye:eye}}

// --- harakat ---
function moveTo(o,tx,ty,sp){var dx=tx-o.x,dy=ty-o.y,d=Math.hypot(dx,dy);if(d<.03){o.moving=false;return true}var k=Math.min(1,sp/d);o.x+=dx*k;o.y+=dy*k;o.moving=true;o.vx=dx;o.vy=dy;return false}
function stepWalker(dt,now){
  var tg=null,cm=catMode(now),bm=birdMode(now);
  if(WK.task&&now<WK.task.until)tg=WK.task.pt;else if(cm==="feed")tg=CAT_FEED_PT;else if(bm==="feed")tg=BIRD_FEED_PT;
  var sp=.0011*dt,px=WK.x,py=WK.y;
  if(!tg){var a=WALK[WK.seg],b=WALK[(WK.seg+1)%WALK.length],ox=a[0]+(b[0]-a[0])*WK.tt,oy=a[1]+(b[1]-a[1])*WK.tt;
    if(Math.hypot(ox-WK.x,oy-WK.y)>.06)tg=[ox,oy];
    else{var len=Math.hypot(b[0]-a[0],b[1]-a[1])||1;WK.tt+=sp/len;if(WK.tt>=1){WK.tt=0;WK.seg=(WK.seg+1)%WALK.length;a=WALK[WK.seg];b=WALK[(WK.seg+1)%WALK.length]}
      WK.x=a[0]+(b[0]-a[0])*WK.tt;WK.y=a[1]+(b[1]-a[1])*WK.tt}}
  if(tg)moveTo(WK,tg[0],tg[1],sp);
  WK.moving=Math.hypot(WK.x-px,WK.y-py)>1e-6;if(WK.moving){WK.vx=WK.x-px;WK.vy=WK.y-py;WK.hist.push([WK.x,WK.y]);if(WK.hist.length>240)WK.hist.shift()}
}
function stepCats(dt,now){var m=catMode(now),sp=.0009*dt;
  CATS.forEach(function(c,i){c.eat=false;c.sleep=false;c.play=false;
    if(m==="feed"){c.z=0;c.state="idle";c.timer=800;if(moveTo(c,BOWLS[i][0],BOWLS[i][1],sp)){c.eat=true;c.vx=-1;c.vy=0}c.status=c.eat?"Ovqatlanyapti":"Ovqatga yuguryapti";return}
    if(m==="walk"){c.z=0;c.state="idle";c.timer=800;var h=WK.hist[Math.max(0,WK.hist.length-1-26*(i+1))]||[WK.x,WK.y];moveTo(c,h[0],h[1],sp*1.5);c.status="Administrator bilan sayrda";return}
    if(m==="sleep"){var n=CATNAPS[i];if(moveTo(c,n[0],n[1],sp)){c.z=n[2];c.sleep=true}else c.z=0;c.state="idle";c.timer=800;c.status=c.sleep?"Uxlayapti":"Uyquga ketyapti";return}
    c.timer-=dt;
    if(c.state==="go"){if(moveTo(c,c.tx,c.ty,sp)){c.state=c.next;c.timer=c.state==="nap"?9000+Math.random()*9000:c.state==="play"||c.state==="scratch"?3500+Math.random()*3000:2000+Math.random()*3000;if(c.state==="nap")c.z=c.tz}}
    else if(c.timer<=0){c.z=0;var r=Math.random(),p;
      if(r<.28){p=CATNAPS[(i+Math.floor(Math.random()*3))%3];c.next="nap";c.tz=p[2]}
      else if(r<.55){p=TOYS[Math.floor(Math.random()*TOYS.length)];p=[p[0]-.35,p[1]];c.next="play"}
      else if(r<.68){p=SCRATCH;c.next="scratch"}
      else{p=CATSPOTS[Math.floor(Math.random()*CATSPOTS.length)];c.next="idle"}
      c.tx=p[0];c.ty=p[1];c.state="go"}
    else c.moving=false;
    c.sleep=c.state==="nap";c.play=c.state==="play"||c.state==="scratch";
    c.status=c.state==="go"?"Aylanib yuribdi":c.state==="nap"?(c.z>2?"Mushuk daraxtida mizg'iyapti":"To'shakda mizg'iyapti"):c.state==="play"?"O'yinchoq bilan o'ynayapti":c.state==="scratch"?"Tirnoq charxlayapti":"Dam olyapti";
    if(c.purr&&now<c.purr)c.status="Xurillayapti";
  })}
function stepBirds(dt,now){var m=birdMode(now);
  BIRDS.forEach(function(b,i){b.sleep=false;b.peck=false;
    if(b.state==="fly"){b.ft+=dt/b.fdur;var t=Math.min(1,b.ft);b.x=b.fx+(b.tx-b.fx)*t;b.y=b.fy+(b.ty-b.fy)*t;b.z=b.fz+(b.tz-b.fz)*t+Math.sin(t*Math.PI)*.45;if(t>=1){b.state="perch";b.timer=2500+Math.random()*6000}return}
    if(m==="sleep"){b.sleep=true;return}
    var want=m==="feed"?BFEEDSPOTS[i]:null;
    if(want&&(Math.abs(b.x-want[0])>.05||Math.abs(b.y-want[1])>.05)){fly(b,want);return}
    if(want){b.peck=true;return}
    b.timer-=dt;if(b.timer<=0){var p=PERCHES[Math.floor(Math.random()*PERCHES.length)];if(Math.random()<.15)p=BFEEDSPOTS[i];fly(b,p)}
    b.peck=Math.abs(b.z-.36)<.02||Math.abs(b.z-.22)<.02;
  })}
function fly(b,p){b.state="fly";b.fx=b.x;b.fy=b.y;b.fz=b.z;b.tx=p[0];b.ty=p[1];b.tz=p[2];b.ft=0;b.fdur=900+Math.hypot(p[0]-b.x,p[1]-b.y)*450;b.vx=p[0]-b.x;b.vy=p[1]-b.y}
function sdir(o){if(!o.vx&&!o.vy)return o.face||1;var a=rotPt([0,0],rot),b=rotPt([o.vx,o.vy],rot);var d=(b[0]-a[0])-(b[1]-a[1]);if(Math.abs(d)>1e-9)o.face=d<0?-1:1;return o.face}
function drawLive(now){if(!LIVE)return;var sw=Math.sin(now/120)*3;
  var p=W(WK.x,WK.y,0),f=sdir(WK);LIVE.body.setAttribute("transform","translate("+p[0].toFixed(1)+" "+p[1].toFixed(1)+") scale("+f+" 1)");
  LIVE.lg1.setAttribute("transform","translate(0 "+(WK.moving&&sw>0?-sw:0)+")");LIVE.lg2.setAttribute("transform","translate(0 "+(WK.moving&&sw<0?sw:0)+")");
  CATS.forEach(function(c,i){var G=LIVE.cats[i],q=W(c.x,c.y,c.z),fc=sdir(c);
    G.g.setAttribute("transform","translate("+q[0].toFixed(1)+" "+q[1].toFixed(1)+") scale("+(fc*c.s)+" "+c.s+")");
    G.a.style.display=c.sleep?"none":"";G.s.style.display=c.sleep?"":"none";
    var lw=c.moving?Math.sin(now/90+i)*1.6:0;G.l1.setAttribute("transform","translate(0 "+(lw>0?-lw:0)+")");G.l2.setAttribute("transform","translate(0 "+(lw<0?lw:0)+")");
    var hb=c.eat?(Math.sin(now/160)>0?3.5:2):c.play?Math.abs(Math.sin(now/180))*-3:0;G.hd.setAttribute("transform","translate("+(c.eat?1.5:0)+" "+hb+")");
    if(c.play&&!c.moving)G.a.setAttribute("transform","translate(0 "+(-Math.abs(Math.sin(now/220))*3).toFixed(1)+")");else G.a.removeAttribute("transform")});
  BIRDS.forEach(function(b,i){var G=LIVE.birds[i];if(!G)return;var q=W(b.x,b.y,b.z),fb=sdir(b);
    G.g.setAttribute("transform","translate("+q[0].toFixed(1)+" "+q[1].toFixed(1)+") scale("+fb+" 1)");
    var flap=b.state==="fly"?(Math.sin(now/40+i)>0?"rotate(-60) scale(1 1.5)":"rotate(30)"):"rotate(-15)";G.wing.setAttribute("transform",flap);
    G.hd.setAttribute("transform",b.peck?"translate(1 "+(Math.sin(now/130+i)>0?2.5:.5)+")":b.sleep?"translate(-1 1.5)":"");
    G.eye.setAttribute("r",b.sleep?"0":".6")});
  var wo=winOpen(now);if(WINREF&&WINREF.state!==wo){if(WINREF.state!==null)WK.task={pt:WIN_PT,until:now+6000};WINREF.state=wo;WINREF.closed.style.display=wo?"none":"";WINREF.open.style.display=wo?"":"none";WINREF.cur.setAttribute("class",wo?"curtain blow":"curtain")}
}
var lastLive=performance.now();
function live(now){var dt=Math.min(60,now-lastLive);lastLive=now;stepWalker(dt,now);stepCats(dt,now);stepBirds(dt,now);drawLive(now);requestAnimationFrame(live)}
requestAnimationFrame(live);
var reduceMotion=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
var root=document.documentElement;

// hisoblagich
var seats=ROOMS.filter(function(r){return r.agent}), on=seats.filter(function(r){return r.ready});
document.getElementById("agent-count").textContent=on.length+" / "+seats.length;
setTimeout(function(){document.getElementById("npc-fill").style.width=(on.length/seats.length*100)+"%"},200);

// Ish joyi haqida oyna
var card=document.getElementById("card");
function txt(tag,cls,t){var e=document.createElement(tag);if(cls)e.className=cls;if(t!=null)e.textContent=t;return e}
function agentLabel(r){return !r.agent?"kerak emas":r.ready?r.agent+" (ishlayapti)":r.agent+": bo'sh"}
function select(id){
  var r=ROOMS.filter(function(x){return x.id===id})[0]; if(!r)return;
  selId=id;
  Array.prototype.forEach.call(svg.querySelectorAll(".room"),function(g){g.classList.toggle("sel",g.getAttribute("data-id")===id)});
  card.innerHTML="";
  card.appendChild(txt("div","sub",r.sub));
  card.appendChild(txt("h3",null,r.name));
  card.appendChild(txt("p",null,r.desc));
  var r1=txt("div","row");r1.appendChild(txt("span",null,"Buyruq"));var s=txt("span");s.appendChild(txt("span","cmd",r.cmd));r1.appendChild(s);card.appendChild(r1);
  var r2=txt("div","row");r2.appendChild(txt("span",null,"Agent"));r2.appendChild(txt("span",r.agent&&!r.ready?"empty":null,agentLabel(r)));card.appendChild(r2);
  card.appendChild(txt("p","hint","Boshqa ish joyini ko'rish uchun ofisdagi stolni bosing."));
  if(typeof pluck==="function"&&sndOn)pluck(SCALE[7],.08,.9);
  try{localStorage.setItem("qala-room",id)}catch(e){}
}
var start="recep";try{start=localStorage.getItem("qala-room")||"recep"}catch(e){}
select(start);



// Ovoz: brauzerning o'zida sintez qilinadi (tashqi fayl yo'q)
var AC=null, master=null, sndOn=false, melodyTimer=null, crackTimer=null, sbtn=document.getElementById("sound");
var SCALE=[146.83,164.81,174.61,196,220,246.94,261.63,293.66,329.63,349.23]; // D dorian
function pluck(f,vol,len){
  if(!AC||!sndOn)return;
  var t=AC.currentTime, o=AC.createOscillator(), o2=AC.createOscillator(), g=AC.createGain(), lp=AC.createBiquadFilter();
  o.type="triangle";o.frequency.value=f;o2.type="sine";o2.frequency.value=f*2;
  lp.type="lowpass";lp.frequency.value=2200;
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+len);
  o.connect(lp);o2.connect(lp);lp.connect(g);g.connect(master);o.start(t);o2.start(t);o.stop(t+len+.05);o2.stop(t+len+.05);
}
function startAudio(){
  AC=new (window.AudioContext||window.webkitAudioContext)();
  master=AC.createGain();master.gain.value=.7;master.connect(AC.destination);
  // past bordun ovozi
  var lp=AC.createBiquadFilter();lp.type="lowpass";lp.frequency.value=380;var dg=AC.createGain();dg.gain.value=.035;lp.connect(dg);dg.connect(master);
  [73.42,110,146.83].forEach(function(f,i){var o=AC.createOscillator();o.type=i?"sine":"sawtooth";o.frequency.value=f;o.detune.value=(i-1)*4;o.connect(lp);o.start()});
  // yengil fon shovqini
  var buf=AC.createBuffer(1,AC.sampleRate*.05,AC.sampleRate),d=buf.getChannelData(0);for(var i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,3);
  function crack(){if(sndOn){var s=AC.createBufferSource();s.buffer=buf;var bp=AC.createBiquadFilter();bp.type="bandpass";bp.frequency.value=1500+Math.random()*2500;var g=AC.createGain();g.gain.value=.02+Math.random()*.05;s.connect(bp);bp.connect(g);g.connect(master);s.start()}crackTimer=setTimeout(crack,80+Math.random()*420)}
  crack();
  // sekin kuy
  var idx=4;
  function melody(){if(sndOn){idx=Math.max(0,Math.min(SCALE.length-1,idx+[-2,-1,-1,1,1,2,0][Math.floor(Math.random()*7)]));pluck(SCALE[idx],.07,1.6);if(Math.random()<.3)setTimeout(function(){pluck(SCALE[Math.max(0,idx-2)],.045,1.2)},260)}melodyTimer=setTimeout(melody,[520,520,780,1040][Math.floor(Math.random()*4)])}
  melody();
}
sbtn.addEventListener("click",function(){
  sndOn=!sndOn;
  if(sndOn&&typeof dionStop==="function"&&!document.getElementById("player").hidden)dionStop();
  try{ if(sndOn){ if(!AC)startAudio(); else AC.resume(); } else if(AC){ AC.suspend(); } }catch(e){sndOn=false}
  sbtn.setAttribute("aria-pressed",sndOn?"true":"false");sbtn.textContent=sndOn?"♪ Ovozni o'chirish":"♪ Ovozni yoqish";
});

// Dam olish burchagi paneli: mushuklar, qushlar, deraza
(function(){
  var box2=document.getElementById("cats"),birdsEl=document.getElementById("birds"),line2=document.getElementById("care-line"),airEl=document.getElementById("air");
  if(!box2)return;
  var catEls=CATS.map(function(c){var d=txt("div","pet-card");var sw=txt("span","pet-sw");sw.style.background=c.col;sw.style.boxShadow="inset -6px 0 0 "+c.dark;
    var tx=txt("div","pet-tx");tx.appendChild(txt("b",null,c.name));tx.appendChild(txt("small",null,c.breed));var st=txt("span","pet-st","");tx.appendChild(st);d.appendChild(sw);d.appendChild(tx);box2.appendChild(d);return st});
  var kinds={};BIRDS.forEach(function(b){kinds[b.kind]=(kinds[b.kind]||[]).concat(b)});
  Object.keys(kinds).forEach(function(k){var ch=txt("span","bird-chip");var dot=txt("i");dot.style.background=kinds[k][0].body;ch.appendChild(dot);ch.appendChild(document.createTextNode(k+" × "+kinds[k].length));birdsEl.appendChild(ch)});
  function hm(t){t=(t+1440)%1440;return("0"+Math.floor(t/60)).slice(-2)+":"+("0"+t%60).slice(-2)}
  function nextEv(t){var ev=[];SCHED.catFeed.forEach(function(x){ev.push([x,"mushuklarga ovqat"])});SCHED.catWalk.forEach(function(x){ev.push([x,"mushuklar sayri"])});SCHED.birdFeed.forEach(function(x){ev.push([x,"qushlarga ovqat"])});
    ev.sort(function(a,b){return((a[0]-t+1440)%1440)-((b[0]-t+1440)%1440)});var n=ev.filter(function(e){return e[0]!==t})[0];return"Keyingi: "+n[1]+" "+hm(n[0])}
  var BIRD_ST={feed:"Qushlar ovqatlanyapti",sleep:"Qushlar uxlayapti",free:"Qushlar sayrab, chiviqdan chiviqqa uchyapti"};
  function upd(){var now=performance.now(),t=tkMin();CATS.forEach(function(c,i){catEls[i].textContent=c.status||"Dam olyapti"});
    var cm=catMode(now),bm=birdMode(now),wo=winOpen(now);
    var who=cm==="feed"?"Administrator mushuklarga ovqat beryapti.":cm==="walk"?"Administrator mushuklarni ofis bo'ylab sayrga olib chiqdi.":bm==="feed"?"Administrator qushlarga don va suv beryapti.":"";
    if(who||!line2.dataset.manual)line2.textContent=(who?who+" ":"")+BIRD_ST[bm]+". "+nextEv(t)+".";
    airEl.textContent=wo?"Deraza ochiq: xona shamollatilyapti.":"Deraza yopiq. Keyingi shamollatish "+hm(t<420?420:t>=1320?1860:(Math.floor(t/60)+1)*60)+" da.";
    document.getElementById("c-win").textContent=wo?"Derazani yopish":"Derazani ochish"}
  document.getElementById("c-feed").addEventListener("click",function(){FORCE.cat="feed";FORCE.catUntil=performance.now()+25000;upd()});
  document.getElementById("c-walk").addEventListener("click",function(){FORCE.cat="walk";FORCE.catUntil=performance.now()+40000;upd()});
  document.getElementById("c-bird").addEventListener("click",function(){FORCE.bird=performance.now()+25000;upd()});
  document.getElementById("c-win").addEventListener("click",function(){var now=performance.now();FORCE.win=!winOpen(now);FORCE.winUntil=now+90000;upd()});
  upd();setInterval(upd,1000);
})();

// Burish: ofisni 90 gradusga aylantiradi
var isoBtn=document.getElementById("iso");
isoBtn.addEventListener("click",function(){var sc=svg.querySelector(".scene");if(sc)sc.classList.add("out");
  setTimeout(function(){rot=(rot+1)%4;render();var s2=svg.querySelector(".scene");s2.classList.add("out");requestAnimationFrame(function(){requestAnimationFrame(function(){s2.classList.remove("out")})})},reduceMotion?0:330)});

// Dion shahri musiqasi: YouTube pleyeri orqali (fayl saytga ko'chirilmaydi)
var dionBtn=document.getElementById("dion"), player=document.getElementById("player"), pframe=document.getElementById("player-frame");
function dionStop(){pframe.innerHTML="";player.hidden=true;dionBtn.setAttribute("aria-pressed","false")}
dionBtn.addEventListener("click",function(){
  if(!player.hidden){dionStop();return}
  if(sndOn)sbtn.click();
  var f=document.createElement("iframe");
  f.src="https://www.youtube-nocookie.com/embed/62Nl7CmdwUU?autoplay=1&loop=1&playlist=62Nl7CmdwUU&playsinline=1";
  f.title="Dion shahri musiqasi";f.allow="autoplay; encrypted-media";f.allowFullscreen=true;
  pframe.appendChild(f);player.hidden=false;dionBtn.setAttribute("aria-pressed","true");
});
document.getElementById("player-x").addEventListener("click",dionStop);
// Kun va tun: Toshkent vaqtiga qarab (07:00-19:00 kunduz)
var override=null, clk=document.getElementById("clock"), dnb=document.getElementById("daynight");
function tashkentTime(){
  try{var parts=new Intl.DateTimeFormat("en-GB",{timeZone:"Asia/Tashkent",hour:"2-digit",minute:"2-digit",hour12:false}).format(new Date());return parts}
  catch(e){var d=new Date(Date.now()+(new Date().getTimezoneOffset()+300)*60000);return ("0"+d.getHours()).slice(-2)+":"+("0"+d.getMinutes()).slice(-2)}
}
function tick(){
  var t=tashkentTime(), h=parseInt(t,10), real=(h>=7&&h<19)?"day":"night", mode=override||real;
  root.setAttribute("data-time",mode);
  clk.textContent=(mode==="day"?"☀ Kunduz":"☾ Tun")+" · Toshkent "+t+(override?" (sinov)":"");
  dnb.textContent=mode==="day"?"Kechni ko'rish":"Kunduzni ko'rish";
  if(drawnMode!==mode)render();
}
dnb.addEventListener("click",function(){var cur=root.getAttribute("data-time");override=cur==="day"?"night":"day";tick()});
tick();setInterval(tick,30000);

// Loyihalar. Holat: active (jarayonda), done (tugagan), stuck (to'xtagan).
// Qadam: [matn, "ok" | "now" | ""]
var QUESTS=[
 {id:"ofis",name:"Virtual ofis",state:"active",desc:"Agentlar joylashadigan shaxsiy virtual ofis: sayt, Telegram va izometrik ofis dizayni.",
  steps:[["Ofis rejasi va xonalar","ok"],["Saytni internetga chiqarish","ok"],["Telegram Mini App","ok"],["Ofis dizayni","ok"],["Agentlar uchun joylar","ok"],["Loyihalar ro'yxati","ok"],["Kun va tun","ok"],["Ovoz","ok"],["3D ko'rinish","ok"],["Birinchi agentni chaqirish: Rejissyor","ok"],["Rejissyorga birinchi vazifa","ok"],["Ikkinchi agent: Server ustasi (x900)","ok"],["Izometrik ofis: Quyoshli studiya","ok"],["L2 uslubidan oddiy uslubga o'tish","ok"],["Ofisni 2 baravar kattalashtirish","ok"],["Mushuklar burchagi va qushxona","ok"],["Shamollatish va gullar","ok"],["Uchinchi agent: SMM menejer (Instagram)","ok"]],
  reward:"Har kuni reja beradigan, agentlar ishlaydigan ofis"},
 {id:"l2",name:"L2 Interlude server",state:"stuck",desc:"O'z L2 Interlude serverini ishga tushirish. Oxirgi marta \"client topilmadi\" xatosida to'xtagan.",
  steps:[["Server fayllarini tayyorlash","ok"],["\"Client topilmadi\" xatosini tuzatish","now"],["Serverga kirib sinash",""]],
  reward:"O'yinga o'z serveringizdan kirish"},
 {id:"launcher",name:"Launcher fon videosi",state:"done",desc:"Launcher uchun fon video tayyorlandi va arxivga qo'yildi.",
  steps:[["Videoni tayyorlash","ok"],["Arxivga joylash","ok"]],
  reward:"Launcher uchun tayyor fon"}
];
var qlist=document.getElementById("qlist"), qdetail=document.getElementById("qdetail");
var TAG={active:"Jarayonda",done:"Tugagan",stuck:"To'xtagan"};
function qprog(q){var n=q.steps.filter(function(s){return s[1]==="ok"}).length;return Math.round(n/q.steps.length*100)}
function showQuest(id){
  var q=QUESTS.filter(function(x){return x.id===id})[0];if(!q)return;
  Array.prototype.forEach.call(qlist.querySelectorAll("button"),function(b){b.setAttribute("aria-current",b.getAttribute("data-q")===id?"true":"false")});
  qdetail.innerHTML="";
  qdetail.appendChild(txt("div","sub",TAG[q.state]+" · "+qprog(q)+"%"));
  qdetail.appendChild(txt("h3",null,q.name));
  qdetail.appendChild(txt("p",null,q.desc));
  var ul=txt("ul","qsteps");q.steps.forEach(function(s){ul.appendChild(txt("li",s[1],s[0]))});qdetail.appendChild(ul);
  qdetail.appendChild(txt("div","qreward","Natija: "+q.reward));
}
QUESTS.forEach(function(q){
  var li=txt("li");var b=txt("button");b.type="button";b.setAttribute("data-q",q.id);
  var nm=txt("span","qname");nm.appendChild(txt("span",null,q.name));nm.appendChild(txt("span","qtag "+q.state,TAG[q.state]));b.appendChild(nm);
  var bar=txt("span","qbar");var f=txt("i");f.style.width=qprog(q)+"%";bar.appendChild(f);b.appendChild(bar);
  b.addEventListener("click",function(){showQuest(q.id)});li.appendChild(b);qlist.appendChild(li);
});
showQuest("ofis");

// xonalar ro'yxati
var list=document.getElementById("rooms");
ROOMS.forEach(function(r){
  var b=txt("button","rc");b.type="button";
  var top=txt("div","rc-top");top.appendChild(txt("small",null,r.sub));top.appendChild(txt("b",null,r.name));b.appendChild(top);
  b.appendChild(txt("p",null,r.desc));
  var f=txt("div","rc-foot");f.appendChild(txt("span","cmd",r.cmd));
  f.appendChild(txt("span","badge"+(!r.agent?" na":r.ready?" on":""),!r.agent?"xotira":r.ready?"ishlayapti":"agent kutilmoqda"));
  b.appendChild(f);
  b.addEventListener("click",function(){select(r.id);document.getElementById("qala").scrollIntoView()});
  list.appendChild(b);
});
})();

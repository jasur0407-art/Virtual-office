(function(){
"use strict";
var NS="http://www.w3.org/2000/svg";
var svg=document.getElementById("office");
function el(t,a,p){var e=document.createElementNS(NS,t);for(var k in a)e.setAttribute(k,a[k]);(p||svg).appendChild(e);return e}

// Xonalar. Agent qo'shilganda o'sha xonaga "ready: true" qo'yiladi.
var ROOMS=[
 {id:"plan",name:"Urush xonasi",sub:"Rejalashtirish",x:20,y:20,w:215,h:230,door:"b",c:"--r1",prop:"wartable",cmd:"kun · hafta",agent:"Strateg",desc:"Kechki 3-4 soatingizni taqsimlaydi. Bugungi reja va haftalik xulosa shu stol ustidagi xaritada tuziladi."},
 {id:"idea",name:"Sehrgar minorasi",sub:"G'oyalar",x:235,y:20,w:215,h:230,door:"b",c:"--r2",prop:"orb",cmd:"g'oya: ...",agent:"Bashoratchi",desc:"Yangi g'oyani billur sharda ko'radi: kimga kerak, qancha vaqt oladi, qanday xavflari bor. Qilish yoki qilmaslik bo'yicha aniq xulosa beradi."},
 {id:"tech",name:"Gnomlar ustaxonasi",sub:"Texnik bo'lim",x:450,y:20,w:215,h:230,door:"b",c:"--r3",prop:"forge",cmd:"x900: ...",agent:"Server ustasi",ready:true,desc:"L2 x900 serverining ustasi: custom item va ekipirovka balansi, config fayllar (rate, drop, enchant), haftalik eventlar, loglardagi xatolar, donat do'koni va o'zbek-rus tilidagi patch notes. Server fayllari bo'lmasa, faqat maslahat beradi."},
 {id:"studio",name:"Ko'zgu zali",sub:"Media studiya",x:665,y:20,w:215,h:230,door:"b",c:"--r8",prop:"studio",cmd:"studiya: ...",agent:"Rejissyor",ready:true,desc:"Foto, video, dizayn va montaj. G'oyangizdan ssenariy, rasm va tayyor video yasaydi, kerakli joyda maslahat beradi. Shaxsiy ma'lumot va tasdiq kerak bo'lgan joyda sizdan so'raydi."},
 {id:"recep",name:"Qal'a zali",sub:"Qabulxona",x:20,y:310,w:250,h:230,door:"t",c:"--r7",prop:"throne",cmd:"istalgan xabar",agent:"Saroy boshlig'i",ready:true,desc:"Qal'aning kirishi. Siz shu yerga yozasiz, saroy boshlig'i topshiriqni kerakli xonaga yuboradi va javobni sizga qaytaradi."},
 {id:"write",name:"O'ramlar kutubxonasi",sub:"Yozuv",x:270,y:310,w:220,h:230,door:"t",c:"--r5",prop:"scrolls",cmd:"yoz: ...",agent:"Kotib",desc:"Matn, e'lon, post va hujjatlar. O'zbek, rus yoki ingliz tilida yozadi."},
 {id:"check",name:"Qorovul minorasi",sub:"Nazorat",x:490,y:310,w:200,h:230,door:"t",c:"--r6",prop:"watch",cmd:"tekshir",agent:"Qorovul",desc:"Har qanday ishni minoradan kuzatadi va zaif joyni yumshatmasdan aytadi."},
 {id:"arch",name:"Ombor",sub:"Arxiv",x:690,y:310,w:190,h:230,door:"t",c:"--r4",prop:"chests",cmd:"—",agent:null,desc:"Warehouse. Qarorlar, loyihalar ro'yxati va fayllar sandiqlarda saqlanadi. Bu yerda NPC emas, xotira turadi."}
];


// Har xonaning qahramoni (NPC). Agent qo'shilganda "ready: true" bo'ladi va qahramon jonlanadi.
var HEROES={
 plan:{type:"knight",cls:"Ritsar",lvl:1,hp:100,mp:30},
 idea:{type:"mage",cls:"Sehrgar",lvl:1,hp:60,mp:100},
 tech:{type:"dwarf",cls:"Gnom usta",lvl:1,hp:90,mp:40},
 recep:{type:"steward",cls:"Saroy boshlig'i",lvl:10,hp:100,mp:100},
 write:{type:"scribe",cls:"Kotib",lvl:1,hp:50,mp:80},
 check:{type:"archer",cls:"Kamonchi",lvl:1,hp:80,mp:50},
 studio:{type:"illusionist",cls:"Illyuzionist",lvl:1,hp:70,mp:100}
};
// ---------- Izometrik ofis ("Quyoshli studiya") ----------
// Dunyo 10x10 katak. P() dunyo nuqtasini ekranga o'tkazadi.
var N=10, S=25, OX=290, OY=112, WH=3.3;
function P(x,y,z){return[OX+(x-y)*S*.866,OY+(x+y)*S*.5-z*S]}
function pts(a){return a.map(function(p){return p[0].toFixed(1)+","+p[1].toFixed(1)}).join(" ")}
function sh(hex,f){var n=parseInt(hex.slice(1),16),c=[n>>16,n>>8&255,n&255].map(function(v){return Math.max(0,Math.min(255,Math.round(f>1?v+(255-v)*(f-1):v*f)))});return"#"+c.map(function(v){return(v<16?"0":"")+v.toString(16)}).join("")}
function poly(g,a,fill,cls,extra){var o={points:pts(a),fill:fill};if(cls)o["class"]=cls;for(var k in extra)o[k]=extra[k];return el("polygon",o,g)}
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

// Ish joylari: har bir stol ROOMS dagi xonaga bog'langan (rid)
var DESK_W=1.6,DESK_D=.9;
var LAYOUT=[{t:"rug",x:.3,y:.7,w:5.8,d:6.9}];
[["plan",.5,1.2],["idea",2.35,1.2],["studio",4.2,1.2],["write",.5,4.5],["check",2.35,4.5],["tech",4.2,4.5]].forEach(function(s){
  LAYOUT.push({t:"spot",rid:s[0],x:s[1]-.15,y:s[2]-.15,w:DESK_W+.3,d:DESK_D+1.15});
  LAYOUT.push({t:"desk",rid:s[0],x:s[1],y:s[2],w:DESK_W,d:DESK_D,dir:1});
  LAYOUT.push({t:"person",rid:s[0],x:s[1]+DESK_W/2,y:s[2]+DESK_D+.65,w:0,d:0,dir:1});
});
LAYOUT=LAYOUT.concat([
 {t:"spot",rid:"arch",x:.1,y:7.5,w:1.9,d:1.2},
 {t:"rack",rid:"arch",x:.25,y:7.7,w:.75,d:.75,dir:0},{t:"rack",rid:"arch",x:1.1,y:7.7,w:.75,d:.75,dir:1},
 {t:"partition",x:6.2,y:0,w:.2,d:2.4,h:2.4},
 {t:"spot",rid:"recep",x:6.8,y:2.7,w:2.8,d:1.6},
 {t:"counter",rid:"recep",x:7,y:2.9,w:2.4,d:.6},
 {t:"stool",x:7.2,y:3.75,w:.4,d:.4},{t:"stool",x:8,y:3.75,w:.4,d:.4},{t:"stool",x:8.8,y:3.75,w:.4,d:.4},
 {t:"fridge",x:9.1,y:.3,w:.7,d:.7,dir:1},
 {t:"plant",x:6.6,y:.3,w:.5,d:.5},
 {t:"sofa",x:6.9,y:7.9,w:2.4,d:1,dir:3},
 {t:"table",x:7.4,y:6.5,w:1.4,d:.8},
 {t:"plant",x:9.3,y:6.2,w:.5,d:.5},{t:"plant",x:.3,y:.2,w:.45,d:.45},{t:"plant",x:5.5,y:8.9,w:.55,d:.55}
]);
var LOOK={studio:{shirt:"#e8644a",hair:"#2b1d14"},tech:{shirt:"#3f6fd8",hair:"#5a3a1c"}};
var WALK=[[6.05,8.8],[6.05,3.75],[.6,3.75],[6.05,3.75],[6.05,5.2],[8.1,5.2],[8.1,4.45],[8.1,5.2],[6.05,5.2],[6.05,7.2],[2.3,7.2],[6.05,7.2]];
var ROOM_BY={};ROOMS.forEach(function(r){ROOM_BY[r.id]=r});

function wallQ(side,a0,a1,z0,z1){return side==="L"?[P(0,a0,z0),P(0,a1,z0),P(0,a1,z1),P(0,a0,z1)]:[P(a0,0,z0),P(a1,0,z0),P(a1,0,z1),P(a0,0,z1)]}
function at(side,a,z){return side==="L"?P(0,a,z):P(a,0,z)}

function decorate(g,T,night){
  var defs=el("defs",{},g),win=wallQ("L",2.2,5.6,1.1,2.8);
  var cp=el("clipPath",{id:"winclip"},defs);poly(cp,win,"#000");
  var wg=el("g",{"clip-path":"url(#winclip)"},g);poly(wg,win,T.sky);
  var b=P(0,2.2,1.1);
  if(!night){
    el("circle",{cx:b[0]-30,cy:b[1]-38,r:10,fill:"#fff2b3"},wg);
    for(var i=0;i<3;i++){var cg=el("g",{"class":"cloud",style:"animation-delay:"+(-i*6)+"s"},wg);el("ellipse",{cx:b[0]-50+i*28,cy:b[1]-12-i*12,rx:12,ry:4,fill:"#fff",opacity:.9},cg)}
    el("path",{d:"M"+P(0,2.2,1.1).join(" ")+" L"+P(0,5.6,1.1).join(" ")+" L"+P(3.4,7.4,0).join(" ")+" L"+P(3.4,4,0).join(" ")+"z",fill:"#fff4c8",opacity:.35,"class":"sunbeam","pointer-events":"none"},g);
  } else {
    el("circle",{cx:b[0]-32,cy:b[1]-40,r:8,fill:"#f3ecd2"},wg);el("circle",{cx:b[0]-28,cy:b[1]-43,r:7,fill:T.sky},wg);
    for(var s=0;s<9;s++)el("circle",{"class":"led",cx:b[0]-75+s*9,cy:b[1]-10-((s*23)%45),r:1,fill:"#fff",style:"animation-delay:"+(s*.37)+"s;animation-duration:2.2s"},wg);
  }
  poly(g,win,"none",null,{stroke:"#fff",opacity:.7,"stroke-width":3});
  var m1=P(0,3.9,1.1),m2=P(0,3.9,2.8);el("line",{x1:m1[0],y1:m1[1],x2:m2[0],y2:m2[1],stroke:"#fff","stroke-width":2,opacity:.8},g);
  // devordagi ekran: ofis holati
  poly(g,wallQ("R",1,4.6,1.5,2.9),"#24293f");
  poly(g,wallQ("R",1.1,4.5,1.58,2.82),"#3a6fd8","scr");
  var on=ROOMS.filter(function(r){return r.agent&&r.ready}).length;
  var a=P(1.3,0,2.5);el("text",{x:a[0],y:a[1],"class":"wtxt","font-size":12,"font-weight":800,fill:"#fff",transform:"skewY(30)","transform-origin":a[0]+" "+a[1]},g).textContent="JASUR OFISI";
  var a2=P(1.3,0,2.12);el("text",{x:a2[0],y:a2[1],"font-size":8.5,fill:"#cfe3ff",transform:"skewY(30)","transform-origin":a2[0]+" "+a2[1]},g).textContent=on+" agent ishlayapti";
  var c0=P(3.3,0,1.75);var pl=el("polyline",{points:"0,0 6,-3 12,-1 18,-6 24,-4 30,-9",fill:"none",stroke:"#7dffb0","stroke-width":1.6,transform:"translate("+c0[0].toFixed(1)+" "+c0[1].toFixed(1)+") skewY(30)","stroke-dasharray":"40"},g);
  if(pl.animate)try{pl.animate([{strokeDashoffset:40},{strokeDashoffset:0}],{duration:2600,iterations:Infinity})}catch(e){}
  [["R",.4,6],["L",.4,9.6]].forEach(function(s,i){var A=at(s[0],s[1],3.05),B=at(s[0],s[2],3.05);
    el("line",{"class":night?"lamp on":"lamp",x1:A[0],y1:A[1],x2:B[0],y2:B[1],stroke:T.lamp,"stroke-width":3,"stroke-linecap":"round"},g)});
  box(g,7.2,0,2.02,1.8,.35,.08,T.shelf);
  [7.4,7.9,8.5].forEach(function(x,i){box(g,x,.08,2.1,.22,.2,.3+i%2*.12,[T.accent,T.screen,T.leaf][i])});
}

var rot=0, selId=null, drawnMode=null;
function render(){
  var night=root.getAttribute("data-time")==="night", T=night?PAL.night:PAL.day;drawnMode=night?"night":"day";
  while(svg.firstChild)svg.removeChild(svg.firstChild);
  var defs=el("defs",{}),gr=el("radialGradient",{id:"bgg",cx:"50%",cy:"40%",r:"70%"},defs);
  el("stop",{offset:"0","stop-color":T.bgTop},gr);el("stop",{offset:"1","stop-color":T.bgBot},gr);
  el("rect",{width:580,height:420,fill:"url(#bgg)"});
  var sc=el("g",{"class":"scene"}),fl=el("g",{"class":"float"},sc);
  var s0=P(5,5,-.6);el("ellipse",{cx:s0[0],cy:s0[1]+20,rx:230,ry:40,fill:"#000",opacity:.22},fl);
  box(fl,0,0,-.35,N,N,.35,T.floor);
  for(var i=1;i<N/.8;i++){var a=P(i*.8,0,0),b=P(i*.8,N,0);el("line",{x1:a[0],y1:a[1],x2:b[0],y2:b[1],stroke:T.floorLine,"stroke-width":1},fl)}
  box(fl,-.25,-.25,0,.25,.25,WH,T.wall2);
  box(fl,-.25,0,0,.25,N,WH,T.wall2);poly(fl,[P(0,0,0),P(0,N,0),P(0,N,WH),P(0,0,WH)],T.wall);
  box(fl,0,-.25,0,N,.25,WH,T.wall2);poly(fl,[P(0,0,0),P(N,0,0),P(N,0,WH),P(0,0,WH)],sh(T.wall,.94));
  decorate(fl,T,night);
  var items=LAYOUT.map(function(it){return rotate(it,rot)});
  function key(a){return a.t==="rug"?-99:a.t==="spot"?-98:a.x+a.w/2+a.y+a.d/2+(a.t==="person"?.6:0)}
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
  // qabulxona xodimi (Saroy boshlig'i) ofis bo'ylab yuradi
  var wk=el("g",{"pointer-events":"none"},fl),body=el("g",{},wk);
  el("ellipse",{cx:0,cy:0,rx:7,ry:3,fill:"#000",opacity:.25},body);
  var lg1=el("rect",{x:-4,y:-14,width:3,height:14,fill:"#2b2f45"},body),lg2=el("rect",{x:1,y:-14,width:3,height:14,fill:"#2b2f45"},body);
  el("rect",{x:-6,y:-30,width:12,height:17,rx:3,fill:T.accent},body);
  el("rect",{x:-4,y:-26,width:8,height:6,rx:1,fill:"#fff",opacity:.9},body);
  el("circle",{cx:0,cy:-35,r:6,fill:T.skin},body);
  tags.forEach(function(tg,i){var p=tg[0],w=tg[1].length*6.4+18,gg=el("g",{"class":"tagb",style:"animation-delay:"+i*.6+"s","pointer-events":"none"},fl);
    el("rect",{x:p[0]-w/2,y:p[1]-28,width:w,height:17,rx:8.5,fill:"#000",opacity:.72},gg);
    el("circle",{cx:p[0]-w/2+8,cy:p[1]-19.5,r:3,fill:"#7dffb0","class":"led"},gg);
    el("text",{x:p[0]+5,y:p[1]-15.5,"text-anchor":"middle","font-size":10.5,"font-weight":700,fill:"#fff"},gg).textContent=tg[1]});
  if(selId)Array.prototype.forEach.call(svg.querySelectorAll(".room"),function(g){g.classList.toggle("sel",g.getAttribute("data-id")===selId)});
  var path=WALK.map(function(p){return rotPt(p,rot)}),seg=0,tt=0,last=performance.now(),myRot=rot+drawnMode;
  svg.setAttribute("data-r",myRot);
  function step(now){if(svg.getAttribute("data-r")!==myRot)return;var dt=Math.min(60,now-last);last=now;
    var a=path[seg],b=path[(seg+1)%path.length],len=Math.hypot(b[0]-a[0],b[1]-a[1])||1;tt+=dt*.0011/len;
    if(tt>=1){tt=0;seg=(seg+1)%path.length;a=path[seg];b=path[(seg+1)%path.length]}
    var x=a[0]+(b[0]-a[0])*tt,y=a[1]+(b[1]-a[1])*tt,p=P(x,y,0),sw=Math.sin(now/120)*3;
    body.setAttribute("transform","translate("+p[0].toFixed(1)+" "+p[1].toFixed(1)+") scale("+(((b[0]-a[0])-(b[1]-a[1]))<0?-1:1)+" 1)");
    lg1.setAttribute("transform","translate(0 "+(sw>0?-sw:0)+")");lg2.setAttribute("transform","translate(0 "+(sw<0?sw:0)+")");
    if(!reduceMotion)requestAnimationFrame(step)}
  requestAnimationFrame(step);
}
var reduceMotion=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
var root=document.documentElement;

// hisoblagich
var seats=ROOMS.filter(function(r){return r.agent}), on=seats.filter(function(r){return r.ready});
document.getElementById("agent-count").textContent=on.length+" / "+seats.length;
setTimeout(function(){document.getElementById("npc-fill").style.width=(on.length/seats.length*100)+"%"},200);

// NPC dialog oynasi
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
  var r2=txt("div","row");r2.appendChild(txt("span",null,"NPC"));r2.appendChild(txt("span",r.agent&&!r.ready?"empty":null,agentLabel(r)));card.appendChild(r2);
  var H=HEROES[r.id];
  if(H){
    var r3=txt("div","row");r3.appendChild(txt("span",null,"Klass"));r3.appendChild(txt("span",null,H.cls+(r.ready?" · Lv. "+H.lvl:" · chaqirilmagan")));card.appendChild(r3);
    [["HP",H.hp,"hp"],["MP",H.mp,"mp"]].forEach(function(b){
      var row=txt("div","stat");row.appendChild(txt("span",null,b[0]));
      var tr=txt("div","track");var f=txt("i",b[2]);f.style.width=(r.ready?b[1]:0)+"%";tr.appendChild(f);row.appendChild(tr);
      row.appendChild(txt("b",null,r.ready?b[1]+"%":"—"));card.appendChild(row);
    });
  }
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
  // mash'al chirsillashi uchun shovqin
  var buf=AC.createBuffer(1,AC.sampleRate*.05,AC.sampleRate),d=buf.getChannelData(0);for(var i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,3);
  function crack(){if(sndOn){var s=AC.createBufferSource();s.buffer=buf;var bp=AC.createBiquadFilter();bp.type="bandpass";bp.frequency.value=1500+Math.random()*2500;var g=AC.createGain();g.gain.value=.02+Math.random()*.05;s.connect(bp);bp.connect(g);g.connect(master);s.start()}crackTimer=setTimeout(crack,80+Math.random()*420)}
  crack();
  // sekin lyutnya kuyi
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

// Quest jurnali. Holat: active (jarayonda), done (tugagan), stuck (to'xtagan).
// Qadam: [matn, "ok" | "now" | ""]
var QUESTS=[
 {id:"ofis",name:"Virtual ofis",state:"active",desc:"Agentlar joylashadigan shaxsiy virtual ofis: sayt, Telegram va izometrik ofis dizayni.",
  steps:[["Ofis rejasi va xonalar","ok"],["Saytni internetga chiqarish","ok"],["Telegram Mini App","ok"],["Qal'a dizayni","ok"],["NPC qahramonlar","ok"],["Quest jurnali","ok"],["Kun va tun","ok"],["Ovoz","ok"],["3D ko'rinish","ok"],["Birinchi agentni chaqirish: Rejissyor","ok"],["Rejissyorga birinchi vazifa","ok"],["Ikkinchi agent: Server ustasi (x900)","ok"],["Izometrik ofis: Quyoshli studiya","ok"]],
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
  qdetail.appendChild(txt("div","qreward","Mukofot: "+q.reward));
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
  f.appendChild(txt("span","badge"+(!r.agent?" na":r.ready?" on":""),!r.agent?"xotira":r.ready?"ishlayapti":"NPC kutilmoqda"));
  b.appendChild(f);
  b.addEventListener("click",function(){select(r.id);document.getElementById("qala").scrollIntoView()});
  list.appendChild(b);
});
})();

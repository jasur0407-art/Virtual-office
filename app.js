(function(){
"use strict";
var NS="http://www.w3.org/2000/svg";
var svg=document.getElementById("office");
function el(t,a,p){var e=document.createElementNS(NS,t);for(var k in a)e.setAttribute(k,a[k]);(p||svg).appendChild(e);return e}

// Xonalar. Agent qo'shilganda o'sha xonaga "ready: true" qo'yiladi.
var ROOMS=[
 {id:"plan",name:"Urush xonasi",sub:"Rejalashtirish",x:20,y:20,w:290,h:230,door:"b",c:"--r1",prop:"wartable",cmd:"kun · hafta",agent:"Strateg",desc:"Kechki 3-4 soatingizni taqsimlaydi. Bugungi reja va haftalik xulosa shu stol ustidagi xaritada tuziladi."},
 {id:"idea",name:"Sehrgar minorasi",sub:"G'oyalar",x:310,y:20,w:290,h:230,door:"b",c:"--r2",prop:"orb",cmd:"g'oya: ...",agent:"Bashoratchi",desc:"Yangi g'oyani billur sharda ko'radi: kimga kerak, qancha vaqt oladi, qanday xavflari bor. Qilish yoki qilmaslik bo'yicha aniq xulosa beradi."},
 {id:"tech",name:"Gnomlar ustaxonasi",sub:"Texnik bo'lim",x:600,y:20,w:280,h:230,door:"b",c:"--r3",prop:"forge",cmd:"texnik: ...",agent:"Usta gnom",desc:"Server, kod va GitHub shu sandonda yasaladi. L2 server va launcher kabi texnik ishlar shu yerda."},
 {id:"recep",name:"Qal'a zali",sub:"Qabulxona",x:20,y:310,w:250,h:230,door:"t",c:"--r7",prop:"throne",cmd:"istalgan xabar",agent:"Saroy boshlig'i",ready:true,desc:"Qal'aning kirishi. Siz shu yerga yozasiz, saroy boshlig'i topshiriqni kerakli xonaga yuboradi va javobni sizga qaytaradi."},
 {id:"write",name:"O'ramlar kutubxonasi",sub:"Yozuv",x:270,y:310,w:220,h:230,door:"t",c:"--r5",prop:"scrolls",cmd:"yoz: ...",agent:"Kotib",desc:"Matn, e'lon, post va hujjatlar. O'zbek, rus yoki ingliz tilida yozadi."},
 {id:"check",name:"Qorovul minorasi",sub:"Nazorat",x:490,y:310,w:200,h:230,door:"t",c:"--r6",prop:"watch",cmd:"tekshir",agent:"Qorovul",desc:"Har qanday ishni minoradan kuzatadi va zaif joyni yumshatmasdan aytadi."},
 {id:"arch",name:"Ombor",sub:"Arxiv",x:690,y:310,w:190,h:230,door:"t",c:"--r4",prop:"chests",cmd:"—",agent:null,desc:"Warehouse. Qarorlar, loyihalar ro'yxati va fayllar sandiqlarda saqlanadi. Bu yerda NPC emas, xotira turadi."}
];

// naqshlar
var defs=el("defs",{});
var pat=el("pattern",{id:"tiles",width:36,height:24,patternUnits:"userSpaceOnUse"},defs);
el("rect",{width:36,height:24,fill:"none"},pat);
el("path",{d:"M0 0H36M0 12H36M0 0V12M18 12V24",stroke:"#000",opacity:.35,"stroke-width":1.2,fill:"none"},pat);
var rg=el("radialGradient",{id:"torchglow"},defs);
el("stop",{offset:"0%","stop-color":"var(--fire)","stop-opacity":.55},rg);
el("stop",{offset:"100%","stop-color":"var(--fire)","stop-opacity":0},rg);
var og=el("radialGradient",{id:"orbg",cx:"35%",cy:"35%"},defs);
el("stop",{offset:"0%","stop-color":"#d6ecff"},og);
el("stop",{offset:"60%","stop-color":"var(--mana)"},og);
el("stop",{offset:"100%","stop-color":"#123a66"},og);
var bg=el("radialGradient",{id:"beamg",cx:"0%",cy:"50%",r:"100%"},defs);
el("stop",{offset:"0%","stop-color":"var(--ember)","stop-opacity":.5},bg);
el("stop",{offset:"100%","stop-color":"var(--ember)","stop-opacity":0},bg);

// yo'lak va gilam
el("rect",{x:20,y:250,width:860,height:60,fill:"var(--stone2)"});
el("rect",{x:20,y:250,width:860,height:60,fill:"url(#tiles)"});
el("rect",{x:30,y:266,width:840,height:28,fill:"var(--blood)"});
el("path",{d:"M30 269H870M30 291H870",stroke:"var(--gold)","stroke-width":1.5,opacity:.8});
el("text",{x:450,y:285,"text-anchor":"middle","font-size":10,"letter-spacing":"4",opacity:.85}).textContent="QAL'A YO'LAGI";

function torch(x,y,p,delay){
  el("circle",{class:"glow",cx:x,cy:y-6,r:26,fill:"url(#torchglow)",style:"animation-delay:"+delay+"s"},p);
  el("rect",{x:x-2,y:y-2,width:4,height:10,fill:"var(--wood2)"},p);
  var f=el("path",{class:"flame",d:"M"+x+" "+(y-14)+" q6 8 0 12 q-6 -4 0 -12z",fill:"var(--fire)",style:"animation-delay:"+delay+"s"},p);
  el("path",{class:"flame",d:"M"+x+" "+(y-8)+" q3 4 0 6 q-3 -2 0 -6z",fill:"var(--ember)",style:"animation-delay:"+(delay+.1)+"s"},p);
}

var doors=[];
ROOMS.forEach(function(r,idx){
  var g=el("g",{class:"room",tabindex:"0",role:"button","aria-label":r.name+", "+r.sub,"data-id":r.id});
  el("rect",{class:"fl",x:r.x,y:r.y,width:r.w,height:r.h,fill:"var("+r.c+")",stroke:"var(--wall)","stroke-width":6},g);
  el("rect",{x:r.x+3,y:r.y+3,width:r.w-6,height:r.h-6,fill:"url(#tiles)","pointer-events":"none"},g);
  el("rect",{x:r.x+5,y:r.y+5,width:r.w-10,height:r.h-10,fill:"none",stroke:"var(--gold)","stroke-width":.8,opacity:.45,"pointer-events":"none"},g);
  // darvoza
  var dx=r.x+r.w/2-22, dy=r.door==="b"?r.y+r.h-4:r.y-4;
  el("rect",{x:dx,y:dy,width:44,height:8,fill:"var(--stone2)"},g);
  el("rect",{x:dx-4,y:dy-1,width:4,height:10,fill:"var(--gold)"},g);
  el("rect",{x:dx+44,y:dy-1,width:4,height:10,fill:"var(--gold)"},g);
  doors.push({x:dx+22,y:r.door==="b"?r.y+r.h-26:r.y+26});
  // nom
  el("text",{x:r.x+16,y:r.y+28,"font-size":14,"font-weight":800},g).textContent=r.name;
  el("text",{x:r.x+16,y:r.y+44,"font-size":10,"letter-spacing":"2",fill:"var(--muted)",style:"fill:var(--muted)"},g).textContent=r.sub.toUpperCase();
  // mash'allar
  var ty=r.door==="b"?r.y+r.h-14:r.y+r.h-14;
  torch(r.x+14,r.y+r.h/2+10,g,idx*.13);
  torch(r.x+r.w-14,r.y+r.h/2+10,g,idx*.17+.2);
  prop(r,g);
  // NPC joyi
  var cx=r.x+r.w/2, cy=r.y+r.h/2+18;
  if(r.agent){
    if(r.ready){
      el("ellipse",{cx:cx,cy:cy+16,rx:20,ry:6,fill:"#000",opacity:.4},g);
      el("path",{d:"M"+(cx-15)+" "+(cy+16)+" L"+cx+" "+(cy-14)+" L"+(cx+15)+" "+(cy+16)+"z",fill:"var(--gold)"},g);
      el("circle",{cx:cx,cy:cy-14,r:9,fill:"var(--wood)",stroke:"var(--gold)","stroke-width":2},g);
      el("circle",{class:"glow",cx:cx,cy:cy-14,r:3,fill:"var(--ember)"},g);
    }else{
      el("circle",{class:"summon",cx:cx,cy:cy,r:20,fill:"none",stroke:"var(--mana)"},g);
      el("circle",{cx:cx,cy:cy,r:20,fill:"rgba(74,163,255,.12)",stroke:"var(--mana)","stroke-width":1},g);
      el("circle",{class:"rune",cx:cx,cy:cy,r:15,fill:"none",stroke:"var(--mana)","stroke-dasharray":"3 4","stroke-width":1.5},g);
      el("text",{x:cx,y:cy+6,"text-anchor":"middle","font-size":18,"font-weight":800,style:"fill:var(--mana)"},g).textContent="+";
    }
    el("text",{x:cx,y:cy+40,"text-anchor":"middle","font-size":10,"letter-spacing":"1",style:"fill:var(--muted)"},g).textContent=r.ready?r.agent.toUpperCase()+" ISHLAYAPTI":"NPC JOYI BO'SH";
  }
  g.addEventListener("click",function(){select(r.id)});
  g.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();select(r.id)}});
});

function banner(x,y,col,g){
  el("rect",{x:x-2,y:y-2,width:24,height:3,fill:"var(--wood)"},g);
  el("path",{class:"banner",d:"M"+x+" "+y+" h20 v30 l-10 -7 l-10 7z",fill:col,stroke:"var(--gold)","stroke-width":1},g);
}

function prop(r,g){
  var i, R=r.x+r.w, B=r.y+r.h;
  if(r.prop==="wartable"){
    var tx=R-62, ty=r.y+72;
    el("circle",{cx:tx,cy:ty,r:32,fill:"var(--wood)",stroke:"var(--wood2)","stroke-width":4},g);
    el("rect",{x:tx-20,y:ty-14,width:40,height:28,fill:"var(--parch)",transform:"rotate(-8 "+tx+" "+ty+")"},g);
    el("path",{d:"M"+(tx-14)+" "+(ty+4)+" q8 -14 16 -2 t12 -6",fill:"none",stroke:"var(--wood2)","stroke-width":1.5},g);
    [["var(--blood)",-8,-4],["var(--mana)",8,4],["var(--gold)",2,-8]].forEach(function(m){el("circle",{class:"glow",cx:tx+m[1],cy:ty+m[2],r:2.5,fill:m[0]},g)});
    banner(r.x+40,r.y+58,"var(--blood)",g);banner(r.x+70,r.y+58,"var(--mana)",g);
  }
  if(r.prop==="orb"){
    var ox=R-60, oy=r.y+78;
    var c1=el("circle",{class:"rune",cx:ox,cy:oy,r:34,fill:"none",stroke:"var(--mana)","stroke-dasharray":"2 6","stroke-width":2,opacity:.7},g);
    el("circle",{class:"rune rev",cx:ox,cy:oy,r:26,fill:"none",stroke:"var(--mana)","stroke-dasharray":"10 4",opacity:.5},g);
    el("rect",{x:ox-8,y:oy+6,width:16,height:10,fill:"var(--wall-hi)"},g);
    el("circle",{class:"orb",cx:ox,cy:oy,r:13,fill:"url(#orbg)"},g);
    for(i=0;i<3;i++)el("rect",{x:r.x+22+i*16,y:B-58,width:12,height:34,fill:["var(--blood)","var(--moss)","var(--mana)"][i],stroke:"#000","stroke-width":.5},g);
    el("rect",{x:r.x+18,y:B-24,width:56,height:4,fill:"var(--wood)"},g);
  }
  if(r.prop==="forge"){
    var fx=R-70, fy=r.y+60;
    el("rect",{x:fx-4,y:fy-10,width:56,height:40,rx:3,fill:"var(--wall)",stroke:"#000"},g);
    el("rect",{x:fx+4,y:fy,width:40,height:20,fill:"#2a0f05"},g);
    [8,18,28,36].forEach(function(o,k){el("path",{class:"flame",d:"M"+(fx+o)+" "+(fy+20)+" q5 -10 0 -18 q-5 8 0 18z",fill:k%2?"var(--ember)":"var(--fire)",style:"animation-delay:"+(k*.09)+"s"},g)});
    var ax=r.x+62, ay=B-34;
    el("path",{d:"M"+(ax-26)+" "+ay+" h52 l-8 10 h-10 v12 h12 v6 h-36 v-6 h12 v-12 h-14z",fill:"#555b61",stroke:"#000"},g);
    for(i=0;i<5;i++)el("circle",{class:"spark",cx:ax+4,cy:ay-2,r:1.8,fill:"var(--ember)",style:"--dx:"+((i-2)*7)+"px;animation-delay:"+(i*.23)+"s"},g);
  }
  if(r.prop==="throne"){
    var cx=r.x+r.w/2;
    el("rect",{x:cx-14,y:r.y+4,width:28,height:r.h-60,fill:"var(--blood)",opacity:.8},g);
    el("path",{d:"M"+(cx-14)+" "+(r.y+4)+"v"+(r.h-60)+"M"+(cx+14)+" "+(r.y+4)+"v"+(r.h-60),stroke:"var(--gold)","stroke-width":1.2},g);
    el("path",{d:"M"+(cx-22)+" "+(B-14)+" v-36 l8 -8 l6 6 l8 -10 l8 10 l6 -6 l8 8 v36z",fill:"var(--gold)",stroke:"var(--wood2)","stroke-width":1.5},g);
    el("rect",{x:cx-12,y:B-40,width:24,height:18,fill:"var(--blood)"},g);
    banner(r.x+36,r.y+70,"var(--blood)",g);banner(R-56,r.y+70,"var(--blood)",g);
  }
  if(r.prop==="scrolls"){
    for(var s=0;s<2;s++){
      var sy=r.y+66+s*34;
      el("rect",{x:R-82,y:sy+16,width:62,height:4,fill:"var(--wood)"},g);
      for(i=0;i<4;i++){el("rect",{x:R-78+i*15,y:sy,width:10,height:16,fill:"var(--parch)"},g);el("circle",{cx:R-73+i*15,cy:sy,r:3,fill:"var(--wood)"},g)}
    }
    var px=r.x+24, py=B-42;
    el("rect",{x:px,y:py,width:40,height:30,fill:"var(--parch)",transform:"rotate(-6 "+px+" "+py+")"},g);
    for(i=0;i<3;i++)el("rect",{x:px+5,y:py+7+i*7,width:i===2?14:28,height:1.5,fill:"var(--wood2)"},g);
    var q=el("g",{class:"quill"},g);
    el("path",{d:"M"+(px+18)+" "+(py+22)+" l14 -24 q4 6 -10 24z",fill:"var(--ink)"},q);
    el("rect",{x:px+48,y:py+8,width:6,height:16,fill:"var(--parch)"},g);
    el("path",{class:"flame",d:"M"+(px+51)+" "+(py-2)+" q4 6 0 10 q-4 -4 0 -10z",fill:"var(--ember)"},g);
  }
  if(r.prop==="watch"){
    var wx=R-44, wy=r.y+76;
    var beam=el("path",{class:"beam",d:"M"+wx+" "+wy+" L"+(wx-110)+" "+(wy+40)+" L"+(wx-110)+" "+(wy+90)+"z",fill:"url(#beamg)"},g);
    beam.style.transformOrigin=wx+"px "+wy+"px";
    el("circle",{cx:wx,cy:wy,r:20,fill:"var(--wall)",stroke:"var(--wall-hi)","stroke-width":3},g);
    for(i=0;i<8;i++){var a=i*Math.PI/4;el("rect",{x:wx+Math.cos(a)*20-3,y:wy+Math.sin(a)*20-3,width:6,height:6,fill:"var(--wall-hi)"},g)}
    el("circle",{class:"glow",cx:wx,cy:wy,r:6,fill:"var(--ember)"},g);
  }
  if(r.prop==="chests"){
    function chest(x,y,s){
      el("rect",{x:x,y:y,width:34*s,height:22*s,rx:3,fill:"var(--wood)",stroke:"var(--wood2)","stroke-width":2},g);
      el("rect",{x:x,y:y+7*s,width:34*s,height:3,fill:"var(--gold)"},g);
      el("rect",{x:x+15*s,y:y+5*s,width:4*s,height:8*s,fill:"var(--gold-hi)"},g);
    }
    chest(r.x+24,r.y+62,1);chest(r.x+64,r.y+62,1);chest(R-62,r.y+60,1.1);
    chest(r.x+24,B-48,1);
    for(i=0;i<2;i++){el("rect",{x:R-56+i*22,y:B-52,width:20,height:20,fill:"var(--wood2)",stroke:"var(--wood)"},g);el("path",{d:"M"+(R-56+i*22)+" "+(B-52)+" l20 20 M"+(R-36+i*22)+" "+(B-52)+" l-20 20",stroke:"var(--wood)"},g)}
    el("circle",{class:"glow",cx:r.x+41,cy:r.y+70,r:3,fill:"var(--gold-hi)"},g);
  }
}

// Burgut: qal'a zalidan har bir xonaga xat olib boradi
var order=[0,1,2,6,5,4], home=doors[3];
var d="M"+home.x+" "+home.y+" L"+home.x+" 280"+order.map(function(i){return " L"+doors[i].x+" 280 L"+doors[i].x+" "+doors[i].y+" L"+doors[i].x+" 280"}).join("")+" L"+home.x+" 280 L"+home.x+" "+home.y;
el("path",{d:d,fill:"none",stroke:"var(--parch)","stroke-width":1,"stroke-dasharray":"1 7",opacity:.5});
var bird=el("g",{});
el("ellipse",{class:"wing",cx:0,cy:-8,rx:5,ry:9,fill:"var(--muted)"},bird);
el("ellipse",{class:"wing",cx:0,cy:8,rx:5,ry:9,fill:"var(--muted)"},bird);
el("ellipse",{cx:0,cy:0,rx:9,ry:4,fill:"var(--parch)"},bird);
el("path",{d:"M9 0 l5 -2 v4z",fill:"var(--gold)"},bird);
el("rect",{x:-4,y:-2,width:5,height:4,fill:"var(--blood)"},bird);
el("animateMotion",{dur:"26s",repeatCount:"indefinite",rotate:"auto",path:d},bird);
if(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches&&svg.pauseAnimations)svg.pauseAnimations();

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
  Array.prototype.forEach.call(svg.querySelectorAll(".room"),function(g){g.classList.toggle("sel",g.getAttribute("data-id")===id)});
  card.innerHTML="";
  card.appendChild(txt("div","sub",r.sub));
  card.appendChild(txt("h3",null,r.name));
  card.appendChild(txt("p",null,r.desc));
  var r1=txt("div","row");r1.appendChild(txt("span",null,"Buyruq"));var s=txt("span");s.appendChild(txt("span","cmd",r.cmd));r1.appendChild(s);card.appendChild(r1);
  var r2=txt("div","row");r2.appendChild(txt("span",null,"NPC"));r2.appendChild(txt("span",r.agent&&!r.ready?"empty":null,agentLabel(r)));card.appendChild(r2);
  card.appendChild(txt("p","hint","Boshqa xonani ko'rish uchun xaritadagi xonani bosing."));
  try{localStorage.setItem("qala-room",id)}catch(e){}
}
var start="recep";try{start=localStorage.getItem("qala-room")||"recep"}catch(e){}
select(start);
if(!svg.querySelector(".room.sel"))select("recep");

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

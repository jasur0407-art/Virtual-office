(function(){
"use strict";
var NS="http://www.w3.org/2000/svg";
var svg=document.getElementById("office");
function el(t,a,p){var e=document.createElementNS(NS,t);for(var k in a)e.setAttribute(k,a[k]);(p||svg).appendChild(e);return e}

// Xonalar ro'yxati. Agent qo'shilganda "ready: true" qilinadi.
var ROOMS=[
 {id:"plan",name:"Rejalashtirish",x:20,y:20,w:290,h:230,door:"b",c:"--c1",prop:"clock",cmd:"kun · hafta",agent:"Rejalashtiruvchi",desc:"Kechki 3-4 soatingizni taqsimlaydi. Bugungi reja va haftalik xulosa shu yerda tuziladi."},
 {id:"idea",name:"G'oyalar laboratoriyasi",x:310,y:20,w:290,h:230,door:"b",c:"--c2",prop:"bulb",cmd:"g'oya: ...",agent:"G'oya tahlilchisi",desc:"Yangi g'oyani baholaydi: kimga kerak, qancha vaqt oladi, xavflari qanday. Qilish yoki qilmaslik bo'yicha aniq xulosa beradi."},
 {id:"tech",name:"Texnik bo'lim",x:600,y:20,w:280,h:230,door:"b",c:"--c3",prop:"server",cmd:"texnik: ...",agent:"Texnik maslahatchi",desc:"Server, kod va GitHub. L2 server va launcher kabi texnik ishlar shu xonada."},
 {id:"recep",name:"Qabulxona",x:20,y:310,w:250,h:230,door:"t",c:"--c7",prop:"plant",cmd:"istalgan xabar",agent:"Koordinator",ready:true,desc:"Ofisning kirishi. Siz shu yerga yozasiz, koordinator vazifani kerakli xonaga yuboradi va javobni sizga qaytaradi."},
 {id:"write",name:"Yozuv bo'limi",x:270,y:310,w:220,h:230,door:"t",c:"--c4",prop:"paper",cmd:"yoz: ...",agent:"Yozuvchi",desc:"Matn, e'lon, post va hujjatlar. O'zbek, rus yoki ingliz tilida yozadi."},
 {id:"check",name:"Nazorat",x:490,y:310,w:200,h:230,door:"t",c:"--c5",prop:"lens",cmd:"tekshir",agent:"Tanqidchi",desc:"Har qanday ishni tanqidiy ko'radi va zaif joyni yumshatmasdan aytadi."},
 {id:"arch",name:"Arxiv",x:690,y:310,w:190,h:230,door:"t",c:"--c6",prop:"shelf",cmd:"—",agent:null,desc:"Qarorlar, loyihalar ro'yxati va fayllar saqlanadigan javon. Bu yerda agent emas, xotira turadi."}
];

// koridor
el("rect",{x:20,y:250,width:860,height:60,fill:"var(--corridor)"});
for(var x=40;x<880;x+=60)el("rect",{x:x,y:278,width:30,height:4,rx:2,fill:"var(--line)"});
el("text",{x:450,y:302,"text-anchor":"middle","font-size":11,fill:"var(--muted)","letter-spacing":"3"}).textContent="KORIDOR";

var doors=[];
ROOMS.forEach(function(r){
  var g=el("g",{class:"room",tabindex:"0",role:"button","aria-label":r.name,"data-id":r.id});
  el("rect",{class:"fl",x:r.x,y:r.y,width:r.w,height:r.h,fill:"var("+r.c+")",stroke:"var(--wall)","stroke-width":3},g);
  var dx=r.x+r.w/2-22, dy=r.door==="b"?r.y+r.h-3:r.y-2;
  el("rect",{x:dx,y:dy,width:44,height:5,fill:"var(--corridor)"},g);
  el("path",{d:r.door==="b"?"M"+dx+" "+(r.y+r.h)+" a44 44 0 0 1 44 -44":"M"+dx+" "+r.y+" a44 44 0 0 0 44 44",fill:"none",stroke:"var(--line)","stroke-dasharray":"3 3"},g);
  doors.push({x:dx+22,y:r.door==="b"?r.y+r.h-26:r.y+26});
  el("text",{x:r.x+14,y:r.y+26,"font-size":14,"font-weight":700},g).textContent=r.name;
  var cx=r.x+r.w/2, cy=r.y+r.h/2+4;
  if(r.agent){
    el("rect",{x:cx-50,y:cy-26,width:100,height:44,rx:4,fill:"var(--desk)",stroke:"var(--desk2)","stroke-width":2},g);
    el("rect",{x:cx-20,y:cy-22,width:40,height:6,rx:2,fill:"var(--wall)"},g);
    el("rect",{class:"scr",x:cx-17,y:cy-20,width:34,height:3,fill:"var(--screen)"},g);
    el("rect",{x:cx-14,y:cy-6,width:28,height:9,rx:2,fill:"var(--desk2)"},g);
    var sy=cy+42;
    if(r.ready){
      el("circle",{cx:cx,cy:sy,r:16,fill:"var(--accent)"},g);
      el("circle",{cx:cx,cy:sy-4,r:6,fill:"var(--paper)"},g);
      el("path",{d:"M"+(cx-9)+" "+(sy+9)+" q9 -9 18 0",fill:"var(--paper)"},g);
    }else{
      el("circle",{class:"slot-ring",cx:cx,cy:sy,r:16},g);
      el("circle",{class:"slot",cx:cx,cy:sy,r:16},g);
      el("text",{x:cx,y:sy+6,"text-anchor":"middle","font-size":18,"font-weight":700,fill:"var(--accent)"},g).textContent="+";
    }
    el("text",{x:cx,y:sy+34,"text-anchor":"middle","font-size":11,fill:"var(--muted)"},g).textContent=r.ready?"Claude ishlayapti":"agent joyi bo'sh";
  }
  prop(r,g);
  g.addEventListener("click",function(){select(r.id)});
  g.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();select(r.id)}});
});

function prop(r,g){
  var X=r.x+r.w-46, Y=r.y+48, i, j;
  if(r.prop==="clock"){
    el("circle",{cx:X,cy:Y,r:18,fill:"var(--paper)",stroke:"var(--wall)","stroke-width":2},g);
    var h=el("line",{class:"hand",x1:X,y1:Y,x2:X,y2:Y-13,stroke:"var(--accent)","stroke-width":2,"stroke-linecap":"round"},g);
    h.style.transformBox="view-box";h.style.transformOrigin=X+"px "+Y+"px";
    el("circle",{cx:X,cy:Y,r:2,fill:"var(--wall)"},g);
    el("rect",{x:r.x+16,y:r.y+r.h-62,width:44,height:40,rx:3,fill:"var(--paper)",stroke:"var(--wall)"},g);
    el("rect",{x:r.x+16,y:r.y+r.h-62,width:44,height:10,fill:"var(--accent)"},g);
    for(i=0;i<3;i++)for(j=0;j<4;j++)el("rect",{x:r.x+20+j*10,y:r.y+r.h-47+i*8,width:6,height:5,fill:(i===1&&j===2)?"var(--led)":"var(--line)"},g);
  }
  if(r.prop==="bulb"){
    el("circle",{class:"bulb",cx:X,cy:Y,r:14,fill:"var(--bulb)"},g);
    el("rect",{x:X-6,y:Y+12,width:12,height:8,rx:2,fill:"var(--wall)"},g);
    el("rect",{x:r.x+16,y:r.y+r.h-70,width:70,height:46,rx:3,fill:"var(--paper)",stroke:"var(--wall)"},g);
    [["var(--bulb)",22,-62],["var(--led)",44,-54],["var(--screen)",28,-44],["var(--bulb)",56,-40]].forEach(function(a){el("rect",{x:r.x+a[1],y:r.y+r.h+a[2],width:16,height:10,fill:a[0]},g)});
  }
  if(r.prop==="server"){
    el("rect",{x:X-16,y:Y-16,width:34,height:80,rx:3,fill:"var(--wall)"},g);
    for(i=0;i<5;i++){
      el("rect",{x:X-12,y:Y-12+i*15,width:26,height:10,rx:1,fill:"var(--chair)"},g);
      el("circle",{class:"led",cx:X+9,cy:Y-7+i*15,r:2,fill:i%2?"var(--screen)":"var(--led)"},g).style.animationDelay=(i*0.27)+"s";
    }
  }
  if(r.prop==="plant"){
    var px=r.x+34, py=r.y+r.h-30;
    [[-8,-18],[0,-26],[8,-18]].forEach(function(a,k){el("ellipse",{class:"leaf",cx:px+a[0],cy:py+a[1]/2,rx:5,ry:13,fill:"var(--plant)"},g).style.animationDelay=(k*0.5)+"s"});
    el("rect",{x:px-10,y:py,width:20,height:16,rx:3,fill:"var(--desk2)"},g);
    el("path",{d:"M"+(r.x+r.w-28)+" "+(r.y+r.h-20)+" v-56",fill:"none",stroke:"var(--desk2)","stroke-width":10,"stroke-linecap":"round"},g);
  }
  if(r.prop==="paper"){
    for(i=0;i<3;i++)el("rect",{x:X-14+i*3,y:Y-10-i*3,width:30,height:38,rx:2,fill:"var(--paper)",stroke:"var(--line)"},g);
    for(i=0;i<4;i++)el("rect",{x:X-6,y:Y-6+i*7,width:20,height:2,fill:"var(--line)"},g);
    var pg=el("g",{transform:"rotate(30 "+X+" "+Y+")"},g);
    el("rect",{class:"pen",x:X-8,y:Y+22,width:4,height:14,rx:2,fill:"var(--led)"},pg);
  }
  if(r.prop==="lens"){
    var lg=el("g",{class:"lens"},g);
    el("rect",{x:X-30,y:Y-16,width:40,height:50,rx:2,fill:"var(--paper)",stroke:"var(--line)"},g);
    for(i=0;i<4;i++)el("rect",{x:X-24,y:Y-8+i*9,width:28,height:2,fill:i===2?"var(--led)":"var(--line)"},g);
    el("circle",{cx:X-4,cy:Y+4,r:11,fill:"none",stroke:"var(--wall)","stroke-width":3},lg);
    el("line",{x1:X+4,y1:Y+12,x2:X+13,y2:Y+21,stroke:"var(--wall)","stroke-width":4,"stroke-linecap":"round"},lg);
  }
  if(r.prop==="shelf"){
    var sx=r.x+r.w/2-60, sy=r.y+76, cols=["var(--accent)","var(--bulb)","var(--led)","var(--screen)","var(--chair)","var(--plant)"];
    for(i=0;i<3;i++){
      el("rect",{x:sx,y:sy+i*54,width:120,height:6,fill:"var(--desk2)"},g);
      for(j=0;j<6;j++)el("rect",{x:sx+6+j*19,y:sy+i*54-30,width:14,height:30,rx:2,fill:cols[(i+j)%6]},g);
    }
  }
}

// Kuryer: qabulxonadan har bir xona eshigiga borib qaytadi
var order=[0,1,2,6,5,4], home=doors[3];
var d="M"+home.x+" "+home.y+" L"+home.x+" 280"+order.map(function(i){return " L"+doors[i].x+" 280 L"+doors[i].x+" "+doors[i].y+" L"+doors[i].x+" 280"}).join("")+" L"+home.x+" 280 L"+home.x+" "+home.y;
el("path",{d:d,fill:"none",stroke:"var(--bulb)","stroke-width":1.5,"stroke-dasharray":"2 6",opacity:.7});
var cour=el("g",{});
el("circle",{r:9,fill:"var(--bulb)",stroke:"var(--wall)","stroke-width":2},cour);
el("rect",{x:-4,y:-3,width:8,height:6,rx:1,fill:"var(--wall)"},cour);
el("animateMotion",{dur:"24s",repeatCount:"indefinite",path:d},cour);
if(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches&&svg.pauseAnimations)svg.pauseAnimations();

// Hisoblagich
var seats=ROOMS.filter(function(r){return r.agent}), on=seats.filter(function(r){return r.ready});
document.getElementById("agent-count").textContent=on.length+" / "+seats.length;

// Tanlangan xona kartasi
var card=document.getElementById("card");
function txt(tag,cls,t){var e=document.createElement(tag);if(cls)e.className=cls;if(t!=null)e.textContent=t;return e}
function agentLabel(r){return !r.agent?"kerak emas":r.ready?"Claude (ishlayapti)":r.agent+": bo'sh"}
function select(id){
  var r=ROOMS.filter(function(x){return x.id===id})[0]; if(!r)return;
  Array.prototype.forEach.call(svg.querySelectorAll(".room"),function(g){g.classList.toggle("sel",g.getAttribute("data-id")===id)});
  card.innerHTML="";
  card.appendChild(txt("div","eyebrow","Xona"));
  card.appendChild(txt("h3",null,r.name));
  card.appendChild(txt("p",null,r.desc));
  var r1=txt("div","row");r1.appendChild(txt("span",null,"Buyruq"));var s=txt("span");s.appendChild(txt("span","cmd",r.cmd));r1.appendChild(s);card.appendChild(r1);
  var r2=txt("div","row");r2.appendChild(txt("span",null,"Agent"));r2.appendChild(txt("span",r.agent&&!r.ready?"empty":null,agentLabel(r)));card.appendChild(r2);
  card.appendChild(txt("p","hint","Boshqa xonani ko'rish uchun xaritadagi xonani bosing."));
  try{localStorage.setItem("ofis-room",id)}catch(e){}
}
var start="recep";try{start=localStorage.getItem("ofis-room")||"recep"}catch(e){}
select(start);
if(!svg.querySelector(".room.sel"))select("recep");

// Xonalar bo'limi
var list=document.getElementById("rooms");
ROOMS.forEach(function(r){
  var b=txt("button","rc");b.type="button";
  var top=txt("div","rc-top");var sw=txt("span","rc-sw");sw.style.background="var("+r.c+")";top.appendChild(sw);top.appendChild(txt("b",null,r.name));b.appendChild(top);
  b.appendChild(txt("p",null,r.desc));
  var f=txt("div","rc-foot");f.appendChild(txt("span","cmd",r.cmd));
  f.appendChild(txt("span","badge"+(!r.agent?" na":r.ready?" on":""),!r.agent?"xotira":r.ready?"ishlayapti":"agent kutilmoqda"));
  b.appendChild(f);
  b.addEventListener("click",function(){select(r.id);document.getElementById("xarita").scrollIntoView()});
  list.appendChild(b);
});

// Kun / tun rejimi
var root=document.documentElement, btn=document.getElementById("theme");
try{var t=localStorage.getItem("ofis-theme");if(t)root.setAttribute("data-theme",t)}catch(e){}
btn.addEventListener("click",function(){
  var cur=root.getAttribute("data-theme")||(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");
  var next=cur==="dark"?"light":"dark";root.setAttribute("data-theme",next);
  try{localStorage.setItem("ofis-theme",next)}catch(e){}
});
})();

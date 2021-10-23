import{d as E,r as f,a as y,l as I,o as J,c as B,b as N,u as R,e as A,f as j,g as T,h as n,i as r,w as d,N as w,j as M,k as z,m as b,n as H,p as V,F as q,q as p,t as X,s as Y,v as K,x as G}from"./vendor.b25c92ac.js";const Q=function(){const s=document.createElement("link").relList;if(s&&s.supports&&s.supports("modulepreload"))return;for(const l of document.querySelectorAll('link[rel="modulepreload"]'))i(l);new MutationObserver(l=>{for(const u of l)if(u.type==="childList")for(const v of u.addedNodes)v.tagName==="LINK"&&v.rel==="modulepreload"&&i(v)}).observe(document,{childList:!0,subtree:!0});function e(l){const u={};return l.integrity&&(u.integrity=l.integrity),l.referrerpolicy&&(u.referrerPolicy=l.referrerpolicy),l.crossorigin==="use-credentials"?u.credentials="include":l.crossorigin==="anonymous"?u.credentials="omit":u.credentials="same-origin",u}function i(l){if(l.ep)return;l.ep=!0;const u=e(l);fetch(l.href,u)}};Q();function Z(m){var s=atob(m),e=decodeURI(s);return e}const ee=["width","height"],te={style:{position:"fixed",bottom:"0px",width:"100vw",backgroundColor:"#fff",paddingTop:"10px",paddingLeft:"5px",paddingBottom:"10px","box-shadow":"0px 0px 10px #ddd"}},oe=p("\u8BBE\u7F6E"),ne=p("\u64A4\u9500"),ae=p(" \u80CC\u666F\u989C\u8272 "),le=p("\u6E05\u7A7A"),ue=p("\u53D6\u6D88"),se=p("\u786E\u8BA4"),ie=E({setup(m){const s=f(null),e=f(),i=y({w:1e3,h:1e3}),l=f(!1),u=f([]),v=f({width:2,color:"#000000",points:[]}),c=y({color:"#000",width:3,background:"#fff"}),g=I.exports.throttle(()=>{!e.value||(e.value.fillStyle=c.background,e.value.fillRect(0,0,i.w,i.h),u.value.forEach(o=>{if(!(!e.value||o.points.length<=1)){e.value.beginPath(),e.value.strokeStyle=o.color,e.value.lineJoin="round",e.value.lineWidth=o.width,e.value.moveTo(o.points[0].x,o.points[0].y);for(let t=1;t<o.points.length;t++){const a=o.points[t];e.value.lineTo(a.x,a.y)}e.value.stroke(),e.value.closePath()}}))},500);J(async()=>{const o=B();if(s.value){if(e.value=s.value.getContext("2d"),!e.value)return;e.value.imageSmoothingEnabled=!0,i.w=s.value.clientWidth,i.h=s.value.clientHeight;const t=await N.getBlockAttr(o,"custom-data");if(t){const a=JSON.parse(Z(t.value));u.value=a.stokes,c.background=a.config.background,c.color=a.config.color,c.width=a.config.width}setTimeout(g,1)}window.onresize=()=>{i.w=s.value.clientWidth,i.h=s.value.clientHeight,e.value=s.value.getContext("2d"),setTimeout(g,1)}});const P=()=>s.value?{w:s.value.clientWidth,h:s.value.clientHeight}:null,_=o=>{const t=P();if(o instanceof TouchEvent){const a=o.changedTouches[0];return{x:Math.trunc(a.clientX/t.w*i.w),y:Math.trunc(a.clientY/t.h*i.h)}}else if(o instanceof MouseEvent)return{x:Math.trunc(o.clientX/t.w*i.w),y:Math.trunc(o.clientY/t.h*i.h)};throw new Error("unknown device!")},C=o=>{const t=_(o);l.value=!0,!!e.value&&(e.value.beginPath(),v.value={width:c.width,color:c.color,points:[t]},e.value.moveTo(t.x,t.y),e.value.strokeStyle=v.value.color,e.value.lineJoin="round",e.value.lineWidth=v.value.width)},S=o=>{!e.value||(v.value.points.push(o),e.value.lineTo(o.x,o.y),e.value.stroke())},F=o=>{if(l.value){const t=_(o);S(t)}},k=()=>{N.setBlockAttrs({id:B(),attrs:{"custom-data":btoa(encodeURI(JSON.stringify({version:1,stokes:X(u.value),config:c})))}})},x=o=>{if(l.value){if(l.value=!1,!e.value)return;const t=_(o);e.value.lineTo(t.x,t.y),e.value.stroke(),e.value.closePath(),u.value.push(v.value),v.value=null,k()}},D=o=>{c.color=o},O=f(["#FFFFFF","#000","#18A058","#2080F0","#F0A020","rgba(208, 48, 80, 1)"]),h=y({show:!1,background:"#fff",changeColor:o=>{h.background=o},ok:()=>{c.background=h.background,h.show=!1,k(),setTimeout(g,1)}}),W=()=>{u.value.splice(u.value.length-1,1),g(),k()},L=R(),U=()=>{L.warning({title:"\u8B66\u544A",content:"\u662F\u5426\u6E05\u7A7A\u6240\u6709\u5185\u5BB9\uFF1F\u8BE5\u64CD\u4F5C\u4E0D\u53EF\u64A4\u9500\uFF01",positiveText:"\u786E\u5B9A",negativeText:"\u4E0D\u786E\u5B9A",onPositiveClick:()=>{u.value=[],c.background="#fff",g(),k(),h.show=!1},onNegativeClick:()=>{}})};return(o,t)=>(A(),j(q,null,[T("canvas",{style:{width:"100vw",height:"100vh"},width:n(i).w,height:n(i).h,ref:(a,$)=>{$.canvas=a,s.value=a},ontouchstart:C,ontouchmove:F,ontouchend:x,ontouchcancel:x,onmousedown:C,onmousemove:F,onmouseleave:x,onmouseup:x},null,8,ee),T("div",te,[r(n(b),{align:"center",justify:"center"},{default:d(()=>[r(n(w),{onClick:t[0]||(t[0]=a=>n(h).show=!0)},{default:d(()=>[oe]),_:1}),r(n(w),{onClick:t[1]||(t[1]=a=>W()),disabled:u.value.length===0},{default:d(()=>[ne]),_:1},8,["disabled"]),r(n(M),{"on-update:value":D,style:{width:"40vw",minWidth:"300px",maxWidth:"500px",display:"block"},"show-alpha":!1,swatches:O.value},null,8,["swatches"]),r(n(z),{value:n(c).width,"onUpdate:value":t[2]||(t[2]=a=>n(c).width=a),step:1,min:1,max:20,style:{width:"40vw",minWidth:"300px",maxWidth:"500px","--rail-height":"10px"}},null,8,["value"])]),_:1})]),r(n(V),{show:n(h).show,"onUpdate:show":t[5]||(t[5]=a=>n(h).show=a),style:{position:"fixed",top:"10px"}},{default:d(()=>[r(n(H),{style:{width:"100vw"},title:"\u8BBE\u7F6E",bordered:!1,size:"huge"},{footer:d(()=>[r(n(b),null,{default:d(()=>[r(n(w),{onClick:t[3]||(t[3]=a=>n(h).show=!1)},{default:d(()=>[ue]),_:1}),r(n(w),{onClick:t[4]||(t[4]=a=>n(h).ok())},{default:d(()=>[se]),_:1})]),_:1})]),default:d(()=>[ae,r(n(M),{"show-alpha":!1,"on-update:value":n(h).changeColor,"default-value":n(c).background},null,8,["on-update:value","default-value"]),r(n(b),null,{default:d(()=>[r(n(w),{onClick:U},{default:d(()=>[le]),_:1})]),_:1})]),_:1})]),_:1},8,["show"])],64))}});const re=E({setup(m){return(s,e)=>(A(),Y(n(K),null,{default:d(()=>[r(ie)]),_:1}))}});G(re).mount("#app");
//# sourceMappingURL=index.7070f16f.js.map

// Chat da comunidade: ícone de balão no topo esquerdo, mensagens em tempo real.
import {getApp} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import {getAuth,onAuthStateChanged} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import {getFirestore,collection,doc,getDoc,addDoc,deleteDoc,query,where,orderBy,limit,onSnapshot,serverTimestamp} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
const app=getApp(),auth=getAuth(app),db=getFirestore(app),$$=id=>document.getElementById(id);
const E=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const st=document.createElement("style");st.textContent=`
#chb{background:none;border:0;color:#f4f4f4;padding:4px;display:grid;place-items:center;cursor:pointer;flex:none}#chb:hover{color:#00e05c}
#chat.on{display:flex;flex-direction:column;min-height:320px}
#chat .ch-t{margin:4px 0 8px;font-size:22px}
#chat .ch-l{flex:1;min-height:0;overflow-y:auto;display:flex;flex-direction:column;gap:12px;padding:6px 2px 10px;-webkit-overflow-scrolling:touch}
.ch-m{display:flex;gap:8px;align-items:flex-end;max-width:86%}
.ch-av{width:34px;height:34px;border-radius:50%;background:#1c1c1c center/cover no-repeat;flex:none;display:grid;place-items:center;font-weight:800;color:#00e05c;font-size:14px}
.ch-bb{background:#1c1c1c;color:#f4f4f4;border-radius:16px 16px 16px 4px;padding:8px 12px;overflow-wrap:anywhere;font-size:15px;line-height:1.35;min-width:0}
.ch-nm{font-size:12px;color:#00e05c;font-weight:700;margin-bottom:2px}.ch-tm{font-weight:400;opacity:.6;margin-left:6px;font-size:11px}
.ch-m.me{align-self:flex-end;flex-direction:row-reverse}.ch-m.me .ch-bb{background:#00e05c;color:#000;border-radius:16px 16px 4px 16px}.ch-m.me .ch-nm{display:none}.ch-m.me .ch-av{display:none}
.ch-x{background:none;border:0;color:inherit;opacity:.55;font-size:12px;padding:0 0 0 8px;cursor:pointer}
.ch-f{display:flex;gap:8px;padding-top:10px;border-top:1px solid #262626}
.ch-i{flex:1;min-width:0;background:#0e0e0e;border:1px solid #262626;border-radius:999px;color:#f4f4f4;padding:12px 16px;font:inherit;font-size:16px}
.ch-s{flex:none;border:0;border-radius:999px;background:#00e05c;color:#000;font:inherit;font-weight:800;padding:0 22px;min-height:44px;cursor:pointer}
.ch-e{color:#ff6b81;font-size:13px;min-height:16px;margin-top:4px}
body.chatting footer{display:none}body.kb .bot{display:none}.ch-p{display:none;position:relative;background:#0e0e0e;border:1px solid #00e05c;border-radius:14px;padding:10px 38px 10px 12px;margin-bottom:8px;font-size:14px;line-height:1.35;overflow-wrap:anywhere;max-height:28vh;overflow-y:auto;flex:none}.ch-p b{color:#00e05c;display:block;font-size:12px;margin-bottom:2px}.ch-p button{position:absolute;top:6px;right:8px;background:none;border:0;color:#b3b3b3;font-size:16px;cursor:pointer;padding:4px}.ch-m.av .ch-bb{border:1px solid #00e05c}.ch-tg{background:#00e05c;color:#000;border-radius:6px;padding:0 6px;font-size:10px;margin-left:6px;font-weight:800}.ch-v{color:#b3b3b3;text-align:center;margin:auto}`;
document.head.append(st);

const btn=Object.assign(document.createElement("button"),{id:"chb",title:"Chat da comunidade"});btn.setAttribute("aria-label","Chat da comunidade");
btn.innerHTML='<svg viewBox="0 0 24 24" style="width:26px;height:26px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round"><path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
btn.onclick=()=>{go("chat")};document.querySelector("header").prepend(btn);

const sec=document.createElement("section");sec.className="v";sec.id="chat";$$("adm").after(sec);
sec.innerHTML='<h2 class="ch-t">Comunidade</h2><div class="ch-p" id="chp"></div><div class="ch-l" id="chl"></div><form class="ch-f" id="chf"><input class="ch-i" id="chi" maxlength="500" autocomplete="off" placeholder="Escreva uma mensagem…"><button class="ch-s" type="submit">Enviar</button></form><div class="ch-e" id="che"></div>';
let un=null,unA=null,foto="",ult=0,av=null;
const AVX=()=>{try{return localStorage.getItem("chx")}catch(e){return null}};
function pin(){const p=$$("chp");if(!av||AVX()===av.id){p.style.display="none";p.innerHTML="";return}p.style.display="block";p.innerHTML=`<b>📢 Aviso</b>${E(av.texto)}<button data-f="${av.id}" aria-label="Fechar aviso">✕</button>`}
$$("chp").onclick=e=>{const id=e.target.dataset&&e.target.dataset.f;if(!id)return;try{localStorage.setItem("chx",id)}catch(x){}pin()};
const hora=t=>t?t.toDate().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit",timeZone:"America/Sao_Paulo"}):"";
const vv=()=>window.visualViewport?visualViewport.height:innerHeight;
function fit(){if(!sec.classList.contains("on"))return;const b=$$("bot"),bh=b&&getComputedStyle(b).display!=="none"?b.offsetHeight:0,top=sec.getBoundingClientRect().top+scrollY;sec.style.height=Math.max(240,vv()-top-bh-8)+"px";if(document.body.classList.contains("kb"))scrollTo(0,0)}
addEventListener("resize",fit);if(window.visualViewport)visualViewport.addEventListener("resize",fit);
$$("chi").addEventListener("focus",()=>{document.body.classList.add("kb");setTimeout(fit,60);setTimeout(fit,400)});
$$("chi").addEventListener("blur",()=>{document.body.classList.remove("kb");setTimeout(fit,60)});
function ouvirAviso(){if(unA)return;unA=onSnapshot(query(collection(db,"chat"),where("tipo","==","aviso"),limit(20)),s=>{const L=s.docs.map(d=>({id:d.id,...d.data({serverTimestamps:"estimate"})})).sort((a,b)=>(b.criado?b.criado.toMillis():0)-(a.criado?a.criado.toMillis():0));av=L[0]||null;pin()},()=>{})}
function ouvir(){ouvirAviso();if(un)return;
  un=onSnapshot(query(collection(db,"chat"),orderBy("criado","desc"),limit(60)),s=>{const box=$$("chl"),me=auth.currentUser&&auth.currentUser.uid,adm=window.isA&&isA();
    box.innerHTML=s.docs.map(d=>{const x=d.data({serverTimestamps:"estimate"}),mine=x.uid===me,nm=x.nome||"Leitor";
      return `<div class="ch-m${mine?" me":""}${x.tipo==="aviso"?" av":""}"><div class="ch-av"${x.foto?` style="background-image:url('${E(x.foto)}')"`:""}>${x.foto?"":E(nm[0].toUpperCase())}</div><div class="ch-bb"><div class="ch-nm">${E(nm)}${x.tipo==="aviso"?'<span class="ch-tg">AVISO</span>':""}<span class="ch-tm">${hora(x.criado)}</span>${mine||adm?`<button class="ch-x" data-d="${d.id}" aria-label="Apagar">✕</button>`:""}</div>${E(x.texto)}${mine?`<button class="ch-x" data-d="${d.id}" aria-label="Apagar">✕</button>`:""}</div></div>`}).reverse().join("")||'<p class="ch-v">Nenhuma mensagem ainda. Comece a conversa!</p>';
    box.scrollTop=box.scrollHeight},()=>{$$("che").textContent="Não foi possível carregar o chat."})}
new MutationObserver(()=>{const on=sec.classList.contains("on");document.body.classList.toggle("chatting",on);if(on){scrollTo(0,0);fit();ouvir()}else{document.body.classList.remove("kb");if(un){un();un=null}if(unA){unA();unA=null}}}).observe(sec,{attributes:true,attributeFilter:["class"]});
onAuthStateChanged(auth,async u=>{$$("chi").placeholder=u?"Escreva uma mensagem…":"Entre para participar do chat";foto="";
  if(u){const s=await getDoc(doc(db,"perfis",u.uid)).catch(()=>null);foto=s&&s.exists()?s.data().foto||"":""}});
$$("chf").onsubmit=async e=>{e.preventDefault();const u=auth.currentUser,t=$$("chi").value.trim(),er=$$("che");er.textContent="";
  if(!u)return go("login");if(!t)return;if(Date.now()-ult<3000)return er.textContent="Espere alguns segundos entre as mensagens.";ult=Date.now();
  try{await addDoc(collection(db,"chat"),{uid:u.uid,nome:(u.displayName||"Leitor").slice(0,40),foto:foto||"",texto:t.slice(0,500),criado:serverTimestamp()});$$("chi").value=""}
  catch(x){er.textContent="Não foi possível enviar ("+(x.code||x.message||"erro")+"). Confira se as regras do Firebase foram publicadas."}};
$$("chl").onclick=async e=>{const id=e.target.dataset&&e.target.dataset.d;if(!id||!confirm("Apagar esta mensagem?"))return;try{await deleteDoc(doc(db,"chat",id))}catch(x){$$("che").textContent="Não foi possível apagar."}};

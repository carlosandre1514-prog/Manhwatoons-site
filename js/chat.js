// Chat da comunidade: botão na barra de baixo; sino de notificações no topo esquerdo, mensagens em tempo real.
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
.ch-f{display:flex;gap:8px;padding-top:10px;border-top:1px solid #262626}
.ch-i{flex:1;min-width:0;background:#0e0e0e;border:1px solid #262626;border-radius:999px;color:#f4f4f4;padding:12px 16px;font:inherit;font-size:16px}
.ch-s{flex:none;border:0;border-radius:999px;background:#00e05c;color:#000;font:inherit;font-weight:800;padding:0 22px;min-height:44px;cursor:pointer}
.ch-e{color:#ff6b81;font-size:13px;min-height:16px;margin-top:4px}
body.chatting footer{display:none}body.kb .bot{display:none}.ch-p{display:none;position:relative;background:#0e0e0e;border:1px solid #00e05c;border-radius:14px;padding:10px 38px 10px 12px;margin-bottom:8px;font-size:14px;line-height:1.35;overflow-wrap:anywhere;max-height:28vh;overflow-y:auto;flex:none}.ch-p b{color:#00e05c;display:block;font-size:12px;margin-bottom:2px}.ch-p button{position:absolute;top:6px;right:8px;background:none;border:0;color:#b3b3b3;font-size:16px;cursor:pointer;padding:4px}.ch-v{color:#b3b3b3;text-align:center;margin:auto}`;
document.head.append(st);

const btn=Object.assign(document.createElement("button"),{id:"chb",title:"Notificações"});btn.setAttribute("aria-label","Notificações");
btn.innerHTML='<svg viewBox="0 0 24 24" style="width:26px;height:26px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/></svg>';
const nt=document.createElement("div");nt.id="ntp";nt.hidden=true;nt.style.cssText="position:fixed;left:12px;top:calc(env(safe-area-inset-top,0px) + 62px);z-index:20;background:#0e0e0e;border:1px solid #262626;border-radius:14px;padding:14px 16px;font-size:14px;color:#f4f4f4;max-width:calc(100vw - 24px)";nt.innerHTML="<b>Notificações</b><p style='margin:6px 0 0;color:#9a9a9a'>Nenhuma notificação nova.</p>";document.body.append(nt);
btn.onclick=e=>{e.stopPropagation();nt.hidden=!nt.hidden};document.addEventListener("click",e=>{if(!nt.hidden&&!nt.contains(e.target))nt.hidden=true});
document.querySelector("header").prepend(btn);

const sec=document.createElement("section");sec.className="v";sec.id="chat";$$("adm").after(sec);
sec.innerHTML='<h2 class="ch-t">Comunidade</h2><div class="ch-p" id="chp"></div><div class="ch-l" id="chl"></div><form class="ch-f" id="chf"><input class="ch-i" id="chi" maxlength="500" autocomplete="off" placeholder="Escreva uma mensagem…"><button class="ch-s" type="submit">Enviar</button></form><div class="ch-e" id="che"></div>';
let un=null,unA=null,foto="",ult=0,av=null;
const AVX=()=>{try{return localStorage.getItem("chx")}catch(e){return null}};
function pin(){const p=$$("chp");if(!av||AVX()===av.id){p.style.display="none";p.innerHTML="";return}p.style.display="block";p.innerHTML=`<b>📢 Aviso</b>${E(av.texto)}<button data-f="${av.id}" aria-label="Fechar aviso">✕</button>${window.isA&&isA()?`<button class="ch-ap" data-a="${av.id}" style="position:static;display:block;margin-top:6px;color:#ff6b81;font-size:12px;padding:0">Apagar aviso para todos</button>`:""}`}
$$("chp").onclick=async e=>{const d=e.target.dataset||{};if(d.a){if(!confirm("Apagar este aviso para todos?"))return;try{await deleteDoc(doc(db,"chat",d.a))}catch(x){$$("che").textContent="Não foi possível apagar o aviso."}return}if(!d.f)return;try{localStorage.setItem("chx",d.f)}catch(x){}pin()};
const hora=t=>t?t.toDate().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit",timeZone:"America/Sao_Paulo"}):"";
const vv=()=>window.visualViewport?visualViewport.height:innerHeight;
function fit(){if(!sec.classList.contains("on"))return;const b=$$("bot"),bh=b&&getComputedStyle(b).display!=="none"?b.offsetHeight:0,top=sec.getBoundingClientRect().top+scrollY;sec.style.height=Math.max(240,vv()-top-bh-8)+"px";if(document.body.classList.contains("kb"))scrollTo(0,0)}
addEventListener("resize",fit);if(window.visualViewport)visualViewport.addEventListener("resize",fit);
$$("chi").addEventListener("focus",()=>{document.body.classList.add("kb");setTimeout(fit,60);setTimeout(fit,400)});
$$("chi").addEventListener("blur",()=>{document.body.classList.remove("kb");setTimeout(fit,60)});
function ouvirAviso(){if(unA)return;unA=onSnapshot(query(collection(db,"chat"),where("tipo","==","aviso"),limit(20)),s=>{const L=s.docs.map(d=>({id:d.id,...d.data({serverTimestamps:"estimate"})})).sort((a,b)=>(b.criado?b.criado.toMillis():0)-(a.criado?a.criado.toMillis():0));av=L[0]||null;pin()},()=>{})}
function ouvir(){ouvirAviso();if(un)return;
  un=onSnapshot(query(collection(db,"chat"),orderBy("criado","desc"),limit(60)),s=>{const box=$$("chl"),me=auth.currentUser&&auth.currentUser.uid,adm=window.isA&&isA();
    box.innerHTML=s.docs.filter(d=>d.data().tipo!=="aviso").map(d=>{const x=d.data({serverTimestamps:"estimate"}),nm=x.nome||"Leitor",del=(x.uid===me||adm)?d.id:"";
      return window.XPX&&XPX.msg?XPX.msg(x.xp,nm,x.foto,x.texto,hora(x.criado),del):`<div class="ch-fb"><b>${E(nm)}</b> ${E(x.texto||"")}</div>`}).reverse().join("")||'<p class="ch-v">Nenhuma mensagem ainda. Comece a conversa!</p>';
    box.scrollTop=box.scrollHeight},()=>{$$("che").textContent="Não foi possível carregar o chat."})}
new MutationObserver(()=>{const on=sec.classList.contains("on");document.body.classList.toggle("chatting",on);if(on){scrollTo(0,0);fit();ouvir()}else{document.body.classList.remove("kb");if(un){un();un=null}if(unA){unA();unA=null}}}).observe(sec,{attributes:true,attributeFilter:["class"]});
onAuthStateChanged(auth,async u=>{$$("chi").placeholder=u?"Escreva uma mensagem…":"Entre para participar do chat";foto="";
  if(u){const s=await getDoc(doc(db,"perfis",u.uid)).catch(()=>null);foto=s&&s.exists()?s.data().foto||"":""}});
$$("chf").onsubmit=async e=>{e.preventDefault();const u=auth.currentUser,t=$$("chi").value.trim(),er=$$("che");er.textContent="";
  if(!u)return go("login");if(!t)return;if(Date.now()-ult<3000)return er.textContent="Espere alguns segundos entre as mensagens.";ult=Date.now();
  try{await addDoc(collection(db,"chat"),{uid:u.uid,nome:(u.displayName||"Leitor").slice(0,40),foto:foto||"",texto:t.slice(0,500),xp:window.XPX?XPX.xp():0,criado:serverTimestamp()});$$("chi").value=""}
  catch(x){er.textContent="Não foi possível enviar ("+(x.code||x.message||"erro")+"). Confira se as regras do Firebase foram publicadas."}};
$$("chl").onclick=async e=>{const id=e.target.dataset&&e.target.dataset.d;if(!id||!confirm("Apagar esta mensagem?"))return;try{await deleteDoc(doc(db,"chat",id))}catch(x){$$("che").textContent="Não foi possível apagar."}};

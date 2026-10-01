// Chat da comunidade: ícone de balão no topo esquerdo, mensagens em tempo real.
import {getApp} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import {getAuth,onAuthStateChanged} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import {getFirestore,collection,doc,getDoc,addDoc,deleteDoc,query,orderBy,limit,onSnapshot,serverTimestamp} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
const app=getApp(),auth=getAuth(app),db=getFirestore(app),$$=id=>document.getElementById(id);
const E=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const st=document.createElement("style");st.textContent=`#chb{background:none;border:0;color:var(--tx);padding:4px;display:grid;place-items:center;cursor:pointer}#chb:hover{color:var(--gold)}
#cm{display:flex;flex-direction:column;gap:12px;padding:6px 0 14px;min-height:50vh}
.cx{display:flex;gap:10px;max-width:88%}.cx .f{width:36px;height:36px;border-radius:50%;background:var(--sf2) center/cover;flex:none;display:grid;place-items:center;font-weight:800;color:var(--gold)}
.cx .b{background:var(--sf);border:1px solid var(--bd);border-radius:4px 16px 16px 16px;padding:8px 12px;min-width:0;overflow-wrap:anywhere}.cx .n{font-size:12px;color:var(--mu);margin-bottom:2px}.cx .n b{color:var(--gold)}
.cx.me{align-self:flex-end;flex-direction:row-reverse}.cx.me .b{background:var(--gold);color:var(--on);border-color:var(--gold);border-radius:16px 4px 16px 16px}.cx.me .n,.cx.me .f{display:none}
.cx .x{background:none;border:0;color:var(--mu);font-size:12px;padding:0 0 0 8px;cursor:pointer}.cx.me .x{color:var(--on)}
#cf{display:flex;gap:8px;position:sticky;bottom:0;background:var(--bg);padding:10px 0;border-top:1px solid var(--bd)}
#cf input{flex:1;min-width:0;background:var(--sf);border:1px solid var(--bd);border-radius:999px;color:var(--tx);padding:12px 16px;font:inherit}
#cf button{border:0;border-radius:999px;background:var(--gold);color:var(--on);font-weight:800;padding:0 20px;font:inherit;font-weight:800;cursor:pointer}`;
document.head.append(st);

const btn=Object.assign(document.createElement("button"),{id:"chb",title:"Chat da comunidade"});btn.setAttribute("aria-label","Chat da comunidade");
btn.innerHTML='<svg viewBox="0 0 24 24" style="width:26px;height:26px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round"><path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
btn.onclick=()=>{go("chat");window.scrollTo(0,0)};document.querySelector("header").prepend(btn);

const sec=document.createElement("section");sec.className="v";sec.id="chat";$$("adm").after(sec);
sec.innerHTML='<h2 style="margin-top:8px">Comunidade</h2><div id="cm"></div><form id="cf"><input id="ct" maxlength="500" autocomplete="off" placeholder="Escreva uma mensagem…"><button>Enviar</button></form><span class="er" id="ce"></span>';
let un=null,foto=null,ult=0;
const hora=t=>t?t.toDate().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit",timeZone:"America/Sao_Paulo"}):"";
function ouvir(){if(un)return;
  un=onSnapshot(query(collection(db,"chat"),orderBy("criado","desc"),limit(60)),s=>{const box=$$("cm"),perto=innerHeight+scrollY>document.body.scrollHeight-160,me=auth.currentUser&&auth.currentUser.uid,adm=window.isA&&isA();
    box.innerHTML=s.docs.map(d=>{const x=d.data({serverTimestamps:"estimate"}),mine=x.uid===me;
      return `<div class="cx${mine?" me":""}"><div class="f" style="background-image:url('${E(x.foto||"")}')">${x.foto?"":E((x.nome||"?")[0].toUpperCase())}</div><div class="b"><div class="n"><b>${E(x.nome||"Leitor")}</b> · ${hora(x.criado)}${mine||adm?`<button class="x" data-d="${d.id}">✕</button>`:""}</div>${E(x.texto)}${mine?`<button class="x" data-d="${d.id}">✕</button>`:""}</div></div>`}).reverse().join("")||'<p style="color:var(--mu)">Nenhuma mensagem ainda. Comece a conversa!</p>';
    if(perto)scrollTo(0,document.body.scrollHeight)},()=>{$$("ce").textContent="Não foi possível carregar o chat."})}
function parar(){if(un){un();un=null}}
new MutationObserver(()=>{if(sec.classList.contains("on")){const b=$$("bot");$$("cf").style.bottom=b&&getComputedStyle(b).display!=="none"?b.offsetHeight+"px":"0";ouvir()}else parar()}).observe(sec,{attributes:true,attributeFilter:["class"]});
onAuthStateChanged(auth,async u=>{$$("ct").placeholder=u?"Escreva uma mensagem…":"Entre para participar do chat";foto=null;
  if(u){const s=await getDoc(doc(db,"perfis",u.uid)).catch(()=>null);foto=s&&s.exists()?s.data().foto||"":""}});
$$("cf").onsubmit=async e=>{e.preventDefault();const u=auth.currentUser,t=$$("ct").value.trim(),er=$$("ce");er.textContent="";
  if(!u)return go("login");if(!t)return;if(Date.now()-ult<3000)return er.textContent="Calma, espere alguns segundos entre as mensagens.";ult=Date.now();
  try{await addDoc(collection(db,"chat"),{uid:u.uid,nome:(u.displayName||"Leitor").slice(0,40),foto:foto||"",texto:t.slice(0,500),criado:serverTimestamp()});$$("ct").value="";scrollTo(0,document.body.scrollHeight)}
  catch(x){er.textContent="Não foi possível enviar ("+(x.code||"erro")+")."}};
$$("cm").onclick=async e=>{const id=e.target.dataset.d;if(!id||!confirm("Apagar esta mensagem?"))return;try{await deleteDoc(doc(db,"chat",id))}catch(x){$$("ce").textContent="Não foi possível apagar."}};

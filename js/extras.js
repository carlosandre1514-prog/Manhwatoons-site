// Banners, trilhos da home, rankings, foto de perfil. Usa o mesmo Firebase do firebase.js.
import {getApp} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import {getAuth,onAuthStateChanged} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import {getFirestore,collection,doc,getDoc,getDocs,setDoc,addDoc,deleteDoc,writeBatch,query,where,orderBy,limit,increment,serverTimestamp} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
import {SIGNER_URL} from "./config.js";
const app=getApp(),auth=getAuth(app),db=getFirestore(app),$$=id=>document.getElementById(id);
const E=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const dia=(n=0)=>new Date(Date.now()-n*864e5).toLocaleDateString("sv-SE",{timeZone:"America/Sao_Paulo"});
const VER="v15";
const TIPOS={obras:"Obras que eu escolher",populares:"Obras populares da semana",lidas_dia:"Obras mais lidas do dia",favs_semana:"Mais favoritos da semana",leitores_dia:"Ranking de leitores do dia"};
let FOTO="";
const st=document.createElement("style");st.textContent=`#bnr{display:none;margin:0 0 14px}#bnr.on{display:block}
.bn{display:flex;gap:0;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none}.bn::-webkit-scrollbar{display:none}
.bn>*{flex:0 0 100%;scroll-snap-align:center;aspect-ratio:2/1;border:0;border-radius:16px;background:var(--sf2) center/cover no-repeat;cursor:pointer;position:relative;overflow:hidden}.bn>*::after{content:"";position:absolute;left:0;right:0;bottom:0;height:85%;background:linear-gradient(to top,rgba(0,0,0,.9),rgba(0,0,0,.55) 55%,transparent);pointer-events:none}
.bt{position:absolute;left:14px;right:14px;bottom:12px;z-index:1;display:flex;flex-direction:column;gap:5px;text-align:left}
.bt b{font:700 clamp(16px,4.6vw,24px)/1.15 "Poppins",system-ui,sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bt p{margin:0;font-size:12.5px;line-height:1.35;color:#d4d4d4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.bb{display:flex;gap:8px;margin-top:3px}
.bc,.bd{border-radius:999px;padding:8px 18px;font-weight:700;font-size:14px;font-family:"Poppins",system-ui,sans-serif}
.bc{background:#00e05c;color:#000}.bd{background:rgba(255,255,255,.16);color:#fff;border:1px solid rgba(255,255,255,.3)}
.nm,.li .t b,.hero h1,#cont .t b{font-family:"Poppins",system-ui,sans-serif;font-weight:600;letter-spacing:0}
.rl{display:grid;gap:8px;margin-bottom:8px}.rl>div{display:flex;align-items:center;gap:12px;background:var(--sf);border:1px solid var(--bd);border-radius:14px;padding:10px 12px}
.rl .n{width:22px;font-weight:800;color:var(--gold)}.rl .f{width:40px;height:40px;border-radius:50%;background:var(--sf2) center/cover;flex:none}.rl b{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.rl span{color:var(--mu);font-size:13px}
.dots{display:flex;justify-content:center;gap:6px;margin-top:10px}.dots i{width:8px;height:8px;border-radius:99px;background:#3a3a3a;cursor:pointer;transition:.25s}.dots i.a{background:#00e05c;width:22px}.cv b{display:none}.ck{display:flex;gap:10px;align-items:center;padding:6px 0}.ck input{width:20px;height:20px;accent-color:#00e05c}.ae{color:#ff6b81;font-size:14px;min-height:0}#adm2 .bx{display:grid;gap:10px;background:var(--sf);border:1px solid var(--bd);border-radius:14px;padding:14px;margin:10px 0}`;
document.head.append(st);

/* ---------- envio de imagem (ImageKit) ---------- */
async function upl(folder,name,f,scope){
  const ty=f.type||({jpg:"image/jpeg",jpeg:"image/jpeg",png:"image/png",webp:"image/webp",gif:"image/gif"})[(f.name.split(".").pop()||"").toLowerCase()]||"";if(!/^image\//.test(ty))throw new Error("so_imagens");if(f.size>5242880)throw new Error("maximo_5mb");
  const t=await auth.currentUser.getIdToken(),a=await fetch(SIGNER_URL+(scope?"?scope="+scope:""),{headers:{Authorization:"Bearer "+t},signal:AbortSignal.timeout(30000)}),k=await a.json().catch(()=>({}));
  if(!a.ok||!k.signature)throw new Error(k.error||"assinatura_"+a.status);
  const fd=new FormData();fd.append("file",f);fd.append("fileName",name);fd.append("folder","/"+folder);fd.append("useUniqueFileName","false");
  fd.append("publicKey",k.publicKey);fd.append("signature",k.signature);fd.append("expire",k.expire);fd.append("token",k.token);
  const r=await fetch("https://upload.imagekit.io/api/v1/files/upload",{method:"POST",body:fd,signal:AbortSignal.timeout(90000)}),j=await r.json().catch(()=>({}));
  if(!r.ok||!j.url)throw new Error(j.message||"upload_"+r.status);return j.url}

/* ---------- foto de perfil ---------- */
const pa=$$("pa"),inp=Object.assign(document.createElement("input"),{type:"file",accept:"image/*",hidden:true});document.body.append(inp);
function showFoto(u){FOTO=u||"";pa.style.background=u?`url(${u}) center/cover`:"";pa.style.color=u?"transparent":"";try{mostrarXP()}catch(e){}}
pa.style.cursor="pointer";pa.title="Trocar foto";
pa.onclick=()=>auth.currentUser?inp.click():alert("Entre na sua conta para colocar uma foto.");
inp.onchange=async()=>{const f=inp.files[0],u=auth.currentUser;inp.value="";if(!f||!u)return;
  try{const url=await upl("avatars",u.uid+"-"+Date.now(),f,"avatar");await setDoc(doc(db,"perfis",u.uid),{nome:u.displayName||"Leitor",foto:url});showFoto(url)}
  catch(x){alert(x.message==="maximo_5mb"?"A foto pode ter até 5 MB.":x.message==="muito_rapido"?"Espere alguns segundos e tente de novo.":"Não foi possível enviar a foto ("+x.message+").")}};
onAuthStateChanged(auth,async u=>{if(!u){showFoto("");XP={xp:0,dia:"",n:0,ld:""};return mostrarXP()}carregarXP(u);
  const s=await getDoc(doc(db,"perfis",u.uid)).catch(()=>null);
  if(s&&s.exists())showFoto(s.data().foto);else setDoc(doc(db,"perfis",u.uid),{nome:u.displayName||"Leitor",foto:""}).catch(()=>{})});


/* ---------- XP e níveis de cultivo (1 a 1000) ---------- */
const R=[
["Condensação de Qi",[["Inicial",1,15],["Intermediário",16,30],["Avançado",31,45],["Pico / Consumação",46,50]]],
["Estabelecimento de Fundação",[["Inicial",51,65],["Intermediário",66,80],["Avançado",81,95],["Pico",96,100]]],
["Formação do Núcleo Dourado",[["Inicial",101,118],["Intermediário",119,135],["Avançado",136,152],["Pico",153,160]]],
["Alma Nascente",[["Inicial",161,180],["Intermediário",181,200],["Avançado",201,220],["Pico",221,230]]],
["Formação da Alma",[["Inicial",231,250],["Intermediário",251,270],["Avançado",271,290],["Pico",291,300]]],
["Transformação Ying",[["Inicial",301,318],["Intermediário",319,335],["Avançado",336,352],["Pico",353,360]]],
["Estágio Ascendente",[["Inicial",361,372],["Intermediário",373,384],["Avançado",385,395],["Pico do Passo Mortal",396,400]]],
["Yin Ilusório",[["Abertura Incorpórea",401,412],["Consolidação da Ilusão",413,428],["Pico Yin",429,440]]],
["Yang Corpóreo",[["Materialização Divina",441,452],["Consolidação Yang",453,468],["Pico Yang / Imortalidade Divina",469,480]]],
["Visão do Nirvana",[["Inicial",481,495],["Intermediário",496,510],["Avançado",511,525],["Pico",526,530]]],
["Limpeza do Nirvana",[["Inicial",531,548],["Intermediário",549,565],["Avançado",566,582],["Pico",583,590]]],
["Vazio do Nirvana",[["Inicial",591,608],["Intermediário",609,625],["Avançado",626,642],["Pico",643,650]]],
["Tribulação Celestial",[["1ª à 3ª Tribulação",651,680],["4ª e 5ª Tribulação",681,699],["Quebra da Tribulação",700,700]]],
["Nirvana Vazio",[["Inicial",701,718],["Intermediário",719,735],["Avançado",736,752],["Pico",753,760]]],
["Vazio Arcano",[["Inicial",761,780],["Intermediário",781,800],["Avançado",801,820],["Pico",821,830]]],
["Tribulação do Vazio",[["Inicial",831,850],["Intermediário",851,870],["Avançado",871,890],["Pico",891,900]]],
["Transcendente",[["Inicial",901,925],["Intermediário",926,950],["Avançado",951,975],["Grande Perfeição Supremo",976,990]]],
["O Limiar do Absoluto",[["Preparação para o Ápice",991,999]]],
["Ápice Supremo",[["Lorde do Dao",1000,1000]]]];
const PASSO=L=>L<=400?"Primeiro Passo · Reino Mortal e Espiritual":L<=480?"Fronteira Espiritual":L<=700?"Segundo Passo · Reino do Vazio e Nirvana":L<=900?"Terceiro Passo · Origem do Dao":"Quarto Passo · O Ápice do Universo";
const xpPara=L=>Math.round(30*Math.pow(L-1,1.4));
function nivel(x){x=Math.max(0,x||0);let L=Math.min(1000,Math.floor(Math.pow(x/30,1/1.4))+1);while(L<1000&&x>=xpPara(L+1))L++;while(L>1&&x<xpPara(L))L--;return L}
function info(L){for(const r of R)for(const e of r[1])if(L>=e[1]&&L<=e[2])return{reino:r[0],estagio:e[0]};return{reino:"",estagio:""}}
const VIS=[["#7dd3a8","#12372c","mist"],["#d9a066","#3a2412","mist"],["#ffd24a","#4a2e08","orb"],["#8fd3ff","#14295e","orb"],["#b79cff","#2c1a66","rings"],["#6fe3e0","#0f3447","rings"],["#ffd27a","#5a2a0c","rings"],["#a9b6d8","#151a33","yin"],["#ffb45c","#5a1a0c","yang"],["#ff9ec7","#4a1440","lotus"],["#7be0ff","#1b2260","lotus"],["#d6c2ff","#0c0820","void"],["#e6f0ff","#16327a","bolt"],["#66ffd9","#06302d","dao"],["#c58bff","#210a4a","star"],["#ff7a7a","#35091a","bolt"],["#ffe9a8","#4a3606","dao"],["#ffffff","#10301f","halo"],["#ffd76a","#1a0f00","apex"]];
const escN=t=>String(t).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const urlOk=u=>/^https:\/\/[^\s'"()<>\\]+$/.test(u||"")?u:"";
const stV=(i,t,p,s)=>`--a:${VIS[i][0]};--b:${VIS[i][1]};--t:${t};--p:${p};--s:${(+s).toFixed(3)}`;
function rIdx(L){for(let a=0;a<R.length;a++)if(L<=R[a][1][R[a][1].length-1][2])return a;return R.length-1}
function nvA(L,prog,vi){let i=0,j=0;for(let a=0;a<R.length;a++)for(let b=0;b<R[a][1].length;b++){const e=R[a][1][b];if(L>=e[1]&&L<=e[2]){i=a;j=b}}
  const cur=vi==null||vi===i,st=R[i][1],n=st.length,pico=cur&&((j===n-1&&n>1)||L===1000),t=cur?(n>1?Math.round(j/(n-1)*3):3):2,sv=cur?Math.max(0,Math.min(1,prog||0)):1,k=cur?i:vi;
  return{fx:VIS[k][2],cls:(pico?" nc-pico":"")+(VIS[k][2]==="apex"?" nc-fa":" nc-f"+t),rk:R[i][0]+" · "+st[j][0],t,st:stV(k,t,pico?1:0,sv)}}
const avN=(nome,foto)=>{const f=urlOk(foto);return f?`<div class="nc-av" style="background-image:url('${f}')"></div>`:`<div class="nc-av">${escN((nome||"?")[0].toUpperCase())}</div>`};
function cardNivel(L,nome,foto,prog,vi){const k=nvA(L,prog,vi);
  return `<div class="nc${k.cls}" data-fx="${k.fx}" style="${k.st}">${avN(nome,foto)}<div class="nc-tx"><div class="nc-nm">${escN(nome||"Leitor")}</div><div class="nc-rk">${k.rk}</div><div class="nc-sb"><i></i></div></div><div class="nc-rt"><div class="nc-nv">Nv. ${L}</div><div class="nc-pp">${[0,1,2,3].map(q=>`<b class="${q<=k.t?"on":""}"></b>`).join("")}</div></div></div>`}
/* mensagem do chat: banner com foto, nick, nível + estágio ao lado do nick, texto, hora e (se puder) apagar */
function msgNivel(xp,nome,foto,texto,hora,delId){xp=Math.max(0,+xp||0);const L=nivel(xp),a=xpPara(L),b=L>=1000?a:xpPara(L+1),k=nvA(L,L>=1000?1:(xp-a)/(b-a));
  return `<div class="nc nc-ch${k.cls}" data-fx="${k.fx}" style="${k.st}">${avN(nome,foto)}<div class="nc-tx"><div class="nc-hd"><span class="nc-nm">${escN(nome||"Leitor")}</span><span class="nc-lv">Nv. ${L} · ${k.rk}</span></div><div class="nc-msg">${escN(texto||"")}</div><div class="nc-mt"><span>${escN(hora||"")}</span>${delId?`<button class="nc-x" data-d="${escN(delId)}" aria-label="Apagar">✕</button>`:""}</div></div></div>`}
let XP={xp:0,dia:"",n:0,ld:""};
window.XPX={nivel,info,xp:()=>XP.xp,msg:msgNivel};
function toast(t){let e=$$("xpt");if(!e){e=document.createElement("div");e.id="xpt";e.style.cssText="position:fixed;left:50%;transform:translateX(-50%);bottom:calc(84px + env(safe-area-inset-bottom));background:#0e0e0e;border:1px solid #00e05c;color:#f4f4f4;border-radius:999px;padding:10px 18px;font-weight:700;font-size:14px;z-index:30;opacity:0;transition:opacity .25s;pointer-events:none;white-space:nowrap;max-width:92vw;overflow:hidden;text-overflow:ellipsis";document.body.append(e)}e.textContent=t;e.style.opacity=1;clearTimeout(e._t);e._t=setTimeout(()=>e.style.opacity=0,3200)}
const xc=document.createElement("div");xc.id="xpc";xc.style.cssText="display:none;margin:14px 0";
xc.innerHTML='<div id="xcard"></div><div style="display:flex;justify-content:space-between;gap:8px;color:var(--mu);font-size:12px;margin-top:8px"><span id="xs"></span><span id="xe"></span></div>';
document.querySelector("#perfil .pf").after(xc);xc.addEventListener("click",e=>{if(e.target.closest(".nc-av"))pa.click()});
/* ---------- Jornada: login diário, nível e banners ---------- */
const RW=[10,10,15,15,20,20,50],DN=["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"],jr=$$("jornada");let J={dias:[],eq:-1};
const has=n=>J.dias.includes(dia(n)),unl=i=>R[i][1][0][1];
const seq=()=>{let n=0,i=has(0)?0:1;while(i<14&&has(i)){n++;i++}return n};
const eqAtual=L=>J.eq>=0&&unl(J.eq)<=L?J.eq:rIdx(L);
const salvarJ=()=>setDoc(doc(db,"jornada",auth.currentUser.uid),{dias:J.dias,eq:J.eq},{merge:true});
async function carregarJ(u){const s=await getDoc(doc(db,"jornada",u.uid)).catch(()=>null),d=s&&s.exists()?s.data():{};J={dias:Array.isArray(d.dias)?d.dias:[],eq:Number.isInteger(d.eq)?d.eq:-1};mostrarXP()}
async function receber(){const u=auth.currentUser;if(!u||has(0))return;const rw=RW[seq()%7],d=dia(),dias=[...J.dias.filter(x=>x>=dia(13)),d],ant=J.dias;J.dias=dias;
  try{await salvarJ()}catch(e){J.dias=ant;mostrarJ();return toast("Não foi possível receber agora. Tente de novo.")}
  await darXP(`x_${d}_${u.uid}`,rw,{ld:d},"Login diário");mostrarXP()}
function mostrarJ(){const u=auth.currentUser;
  if(!u){jr.innerHTML='<h1 class="jn-t">Jornada</h1><div class="jn-box"><p>Entre na sua conta para receber o login diário, ganhar XP e desbloquear banners.</p><button class="jn-btn" data-go="login">Entrar</button></div>';return}
  const x=XP.xp,L=nivel(x),a=xpPara(L),b=L>=1000?a:xpPara(L+1),pc=L>=1000?1:(x-a)/(b-a),eq=eqAtual(L),s=seq(),hj=has(0),idx=(new Date(dia()+"T12:00:00").getDay()+6)%7,rw=RW[s%7],i=info(L);
  let n=0;const bl=R.map((r,k)=>{const on=unl(k)<=L;n+=on;const e=k===eq;
    return `<button class="nc jn-mini${k===18?" nc-fa":" nc-f2"}${on?"":" lk"}${e?" eq":""}" ${on?`data-eq="${k}"`:"disabled"} data-fx="${VIS[k][2]}" style="${stV(k,2,0,1)}">${avN(u.displayName||"Leitor",FOTO)}<div class="nc-tx"><div class="nc-nm">${r[0]}</div><div class="nc-rk">${on?(e?"Equipado":"Toque para equipar"):"Desbloqueia no nível "+unl(k)}</div></div><div class="nc-rt"><div class="nc-nv">${on?(e?"✔":"Equipar"):"🔒 "+unl(k)}</div></div></button>`}).join("");
  jr.innerHTML=`<h1 class="jn-t">Jornada</h1><div class="jn-box"><div class="jn-hd"><b>Login diário</b><span class="jn-g">🔥 ${s} ${s===1?"dia":"dias"} seguidos</span></div><p class="jn-mu">Entre todo dia para manter a sequência. No 7º dia seguido o prêmio é maior.</p><div class="jn-wk">${DN.map((d,k)=>{const ok=J.dias.includes(dia(idx-k)),h=k===idx;return `<div class="jn-dy${ok?" ok":""}${h?" hj":""}${k>idx?" fu":""}">${d}<b>${ok?"✓":h?"+"+rw:"·"}</b></div>`}).join("")}</div><button class="jn-btn" id="jcl" ${hj?"disabled":""}>${hj?"Hoje já recebido ✓ · volte amanhã":"Receber login de hoje (+"+rw+" XP)"}</button></div>
<div class="jn-box"><div class="jn-hd"><span class="jn-mu">Seu nível</span><span class="jn-mu">${PASSO(L)}</span></div><div class="jn-big">Nível ${L}</div><div class="jn-g">${i.reino} · ${i.estagio}</div><div class="jn-bar"><i style="width:${pc*100}%"></i></div><div class="jn-hd jn-mu"><span>${L>=1000?x+" XP · máximo":(x-a)+" / "+(b-a)+" XP"}</span><span>Total ${x} XP</span></div></div>
<div class="jn-hd" style="margin-top:18px"><h2>Banners</h2><span class="jn-mu">${n}/${R.length} desbloqueados</span></div><p class="jn-mu" style="margin:2px 0 8px">Um banner por reino. Toque num desbloqueado para equipar; o anterior é desequipado.</p><div class="jn-bl">${bl}</div>`}
jr.addEventListener("click",async e=>{if(e.target.closest("#jcl"))return receber();const q=e.target.closest("[data-eq]");if(!q||!auth.currentUser)return;const k=+q.dataset.eq,ant=J.eq;J.eq=k;mostrarXP();try{await salvarJ()}catch(x){J.eq=ant;mostrarXP();toast("Não foi possível salvar o banner.")}});
new MutationObserver(()=>{if(jr.classList.contains("on"))mostrarJ()}).observe(jr,{attributes:true,attributeFilter:["class"]});
function mostrarXP(){const u=auth.currentUser;xc.style.display=u?"":"none";if(!u)return mostrarJ();const L=nivel(XP.xp),a=xpPara(L),b=L>=1000?a:xpPara(L+1);
  $$("xcard").innerHTML=cardNivel(L,u.displayName||"Leitor",FOTO,L>=1000?1:(XP.xp-a)/(b-a),eqAtual(L));$$("xe").textContent=L>=1000?XP.xp+" XP · máximo":(XP.xp-a)+" / "+(b-a)+" XP";$$("xs").textContent=PASSO(L);mostrarJ()}
async function darXP(mk,r,campos,txt){const u=auth.currentUser;if(!u||!r)return;const antes=nivel(XP.xp);
  try{const b=writeBatch(db);b.set(doc(db,"marcas",mk),{uid:u.uid});b.set(doc(db,"niveis",u.uid),{xp:increment(r),mk,...campos},{merge:true});await b.commit();
    Object.assign(XP,campos);XP.xp+=r;mostrarXP();const L=nivel(XP.xp);toast(L>antes?"Nível "+L+" · "+info(L).reino:"+"+r+" XP · "+txt)}catch(e){}}
async function carregarXP(u){const s=await getDoc(doc(db,"niveis",u.uid)).catch(()=>null);XP={xp:0,dia:"",n:0,ld:"",...(s&&s.exists()?s.data():{})};mostrarXP();await carregarJ(u)}

/* ---------- contagem de leituras e favoritos ---------- */
const seen=new Set();
async function marcar(mk,col,obra,extra){const u=auth.currentUser;if(!u||seen.has(mk))return;seen.add(mk);const d=dia();
  try{const b=writeBatch(db);b.set(doc(db,"marcas",mk),{uid:u.uid});b.set(doc(db,col,d+"_"+obra),{dia:d,obraId:obra,n:increment(1),mk},{merge:true});
    if(extra)b.set(doc(db,"leitores",d+"_"+u.uid),{dia:d,uid:u.uid,nome:u.displayName||"Leitor",foto:FOTO,xp:XP.xp,n:increment(1),mk},{merge:true});await b.commit()}catch(e){}}
addEventListener("capfim",e=>{const u=auth.currentUser,o=WID[e.detail.w];if(!u||!o)return;const cl=lb(e.detail.w,e.detail.c),d=dia(),n0=XP.dia===d?XP.n:0,mk=`p_${d}_${u.uid}_${o}_${cl}`;
  marcar(`l_${d}_${u.uid}_${o}_${cl}`,"leituras",o,1);if(seen.has(mk))return;seen.add(mk);darXP(mk,n0===0?50:25,{dia:d,n:n0+1},"Capítulo lido")});
$$("ofv").addEventListener("click",()=>{const u=auth.currentUser,o=WID[S.cur];if(u&&o&&P.fav.indexOf(S.cur)>-1)marcar(`f_${dia()}_${u.uid}_${o}`,"favs",o)});

/* ---------- home: banners e trilhos ---------- */
const cache={};
async function soma(col,n){const k=col+n;if(!cache[k]){const s=await getDocs(query(collection(db,col),where("dia",">=",dia(n-1)))),m={};s.forEach(x=>{const d=x.data();m[d.obraId]=(m[d.obraId]||0)+d.n});cache[k]=m}return cache[k]}
const card=(i,r,t)=>`<button class="card" data-go="obra" data-w="${i}"><div style="position:relative"><span class="rk">${r+1}</span>${cv(W[i],i)}</div><div class="nm">${E(W[i][0])}</div><div class="m">${t}</div></button>`;
async function trilho(t){let h=`<h2>${E(t.nome)}</h2>`;
  if(t.tipo==="obras"){const L=(t.obras||[]).map(id=>WID.indexOf(id)).filter(i=>i>-1&&W[i]&&!W[i][4]);
    return h+(L.length?`<div class="row">${L.map(i=>`<button class="card" data-go="obra" data-w="${i}"><div style="position:relative">${cv(W[i],i)}</div><div class="nm">${E(W[i][0])}</div><div class="m"><svg><use href="#i-star"/></svg>${W[i][2]}</div></button>`).join("")}</div>`:`<p style="color:var(--mu)">Este trilho ainda não tem obras.</p>`)}
  if(t.tipo==="leitores_dia"){const s=await getDocs(query(collection(db,"leitores"),where("dia","==",dia()))),L=s.docs.map(x=>x.data()).sort((a,b)=>b.n-a.n).slice(0,10);
    return h+(L.length?`<div class="rl">${L.map((x,r)=>`<div><span class="n">${r+1}</span><i class="f" style="background-image:url('${E(x.foto||"")}')"></i><b>${E(x.nome)}${x.xp>0?` <small style="color:var(--mu);font-weight:400">· Nv. ${nivel(x.xp)}</small>`:""}</b><span>${x.n} cap.</span></div>`).join("")}</div>`:`<p style="color:var(--mu)">Ninguém leu hoje ainda.</p>`)}
  const m=await soma(t.tipo==="favs_semana"?"favs":"leituras",t.tipo==="lidas_dia"?1:7),un=t.tipo==="favs_semana"?"fav.":"leituras";
  let L=WID.map((id,i)=>[i,m[id]||0]).filter(x=>!W[x[0]][4]).sort((a,b)=>b[1]-a[1]);if(L.some(x=>x[1]>0))L=L.filter(x=>x[1]>0);
  return h+`<div class="row">${L.slice(0,10).map((x,r)=>card(x[0],r,x[1]?x[1]+" "+un:"—")).join("")}</div>`}
let busy=0;
let last=0;
async function renderHome(f){if(busy||!$$("trilhos")||!window.WID||!WID.length||(!f&&Date.now()-last<20000))return;busy=1;last=Date.now();if(f)Object.keys(cache).forEach(k=>delete cache[k]);
  try{const [tr,bs]=await Promise.all([getDocs(query(collection(db,"trilhos"),orderBy("ordem"))),getDocs(query(collection(db,"banners"),orderBy("ordem")))]);
    $$("popold").hidden=!tr.empty;$$("trilhos").innerHTML=(await Promise.all(tr.docs.map(d=>trilho(d.data())))).join("");
    const B=bs.docs.map(d=>d.data()),bn=$$("bnr");bn.classList.toggle("on",!!B.length);$$("hero").style.display=B.length?"none":"";
    const capa=i=>i>-1&&W[i]?((W[i][1].match(/url\(['"]?(.*?)['"]?\)/)||[])[1]||""):"";
    const sl=b=>{const i=WID.indexOf(b.obraId),im=b.usaCapa?capa(i):b.img,w=i>-1?W[i]:null,sn=w?(SY[i]||""):"";
    return `<div ${w?`data-go="obra" data-w="${i}" role="button"`:""} aria-label="Destaque" style="background-image:url('${E(im||"")}');${b.usaCapa?"background-position:center 20%":""}">${w?`<div class="bt"><b>${E(w[0])}</b>${sn?`<p>${E(sn)}</p>`:""}<div class="bb">${w[3]>0?`<span class="bc" data-go="leitor" data-w="${i}" data-cap="1">Ler agora</span>`:""}<span class="bd" data-go="obra" data-w="${i}">Detalhes</span></div></div>`:""}</div>`};
    const L=B.length>1?[B[B.length-1],...B,B[0]]:B;
    bn.innerHTML=B.length?`<div class="bn">${L.map(sl).join("")}</div>${B.length>1?`<div class="dots">${B.map(()=>"<i></i>").join("")}</div>`:""}`:"";
    clearInterval(window._bt);const x=bn.firstElementChild;
    if(x&&B.length>1){const w=()=>x.clientWidth,pula=i=>{x.style.scrollSnapType="none";x.scrollLeft=i*w();requestAnimationFrame(()=>x.style.scrollSnapType="")};
      let tm,tc=0,ok=0;const dots=[...bn.querySelectorAll(".dots i")],mark=()=>{if(!w())return;const r=((Math.round(x.scrollLeft/w())-1)%B.length+B.length)%B.length;dots.forEach((d,k)=>d.classList.toggle("a",k===r))};
      dots[0].classList.add("a");dots.forEach((d,k)=>d.onclick=()=>x.scrollTo({left:(k+1)*w(),behavior:"smooth"}));
      x.addEventListener("scroll",()=>{mark();clearTimeout(tm);tm=setTimeout(()=>{if(!w())return;const i=Math.round(x.scrollLeft/w());if(i<=0)pula(B.length);else if(i>=B.length+1)pula(1)},120)});
      x.addEventListener("touchstart",()=>tc=1);x.addEventListener("touchend",()=>setTimeout(()=>tc=0,4000));
      if(w()){pula(1);ok=1;mark()}
      window._bt=setInterval(()=>{if(tc||!w()||!$$("home").classList.contains("on"))return;if(!ok){ok=1;pula(1);mark();return}x.scrollTo({left:(Math.round(x.scrollLeft/w())+1)*w(),behavior:"smooth"})},4000)}}
  catch(e){}busy=0}
const h0=window.home;window.home=function(){h0();renderHome()};
const t0=setInterval(()=>{if(window.WID&&WID.length){clearInterval(t0);renderHome()}},400);setTimeout(()=>clearInterval(t0),40000);
const g0=window.go;window.go=function(v,i){const r=g0(v,i);if(v==="home")renderHome();return r};

/* ---------- painel: banners e trilhos ---------- */
const sec=document.createElement("section");sec.className="v";sec.id="adm2";$$("adm").after(sec);
const ab=Object.assign(document.createElement("button"),{className:"pri",textContent:"Home e chat: banners, trilhos e avisos"});ab.style.cssText="justify-self:start;margin:8px 0;padding:9px 16px";
ab.onclick=()=>{if(!isA())return;go("adm2");painel()};$$("ast").before(ab);
async function painel(){
  const [b,t]=await Promise.all([getDocs(query(collection(db,"banners"),orderBy("ordem"))),getDocs(query(collection(db,"trilhos"),orderBy("ordem")))]);
  const li=(c,d,txt,ex="")=>`<div class="li"><div class="t"><b>${E(txt)}</b></div><div class="act"><button class="mini" data-m="${c}|${d.id}|-1">↑</button><button class="mini" data-m="${c}|${d.id}|1">↓</button>${ex}<button class="mini" data-x="${c}|${d.id}">Excluir</button></div></div>`;
  sec.innerHTML=`<h2 style="margin-top:8px">Banners do carrossel <small style="color:var(--mu);font-size:12px;font-weight:400">· painel ${VER}</small></h2><div class="list" style="grid-template-columns:1fr">${b.docs.map(d=>li("banners",d,"Banner · "+(WID.indexOf(d.data().obraId)>-1?W[WID.indexOf(d.data().obraId)][0]:"sem link")+(d.data().usaCapa?" · capa da obra":" · imagem"))).join("")||'<p style="color:var(--mu)">Nenhum banner.</p>'}</div>
  <div class="bx"><label>Obra do banner<select class="fi" id="xbo"><option value="">Nenhuma</option>${WID.map((id,i)=>`<option value="${id}">${E(W[i][0])}</option>`).join("")}</select></label><label>Imagem do banner (opcional, até 5 MB, proporção 2:1, ex.: 1600×800)<input class="fi" type="file" id="bi" accept="image/*"></label><div style="color:var(--mu);font-size:13px">Sem imagem, o banner usa a capa da obra escolhida.</div><button class="pri" id="xbs">Adicionar banner</button><div class="ae" id="ae1"></div></div>
  <h2>Trilhos da home</h2><div class="list" style="grid-template-columns:1fr">${t.docs.map(d=>li("trilhos",d,d.data().nome+" · "+(TIPOS[d.data().tipo]||"")+(d.data().tipo==="obras"?" ("+(d.data().obras||[]).length+")":""),`<button class="mini" data-e="${d.id}">Editar</button>`)).join("")||'<p style="color:var(--mu)">Nenhum trilho. A home mostra "Populares da semana" até você criar o primeiro.</p>'}</div>
  <div class="bx"><b id="tfh">Novo trilho</b><label>Nome do trilho<input class="fi" id="tn" placeholder="Ex.: Em alta hoje"></label><label>Tipo<select class="fi" id="tt"><option value="obras">Obras que eu escolher</option><option value="leitores_dia">Ranking de leitores do dia</option></select></label><div id="tob"><div style="color:var(--mu);font-size:14px;margin-bottom:4px">Marque as obras (aparecem na ordem em que você marcar):</div>${WID.map((id,i)=>`<label class="ck"><input type="checkbox" value="${id}"> ${E(W[i][0])}</label>`).join("")}</div><button class="pri" id="ts">Criar trilho</button><button class="mini" id="tc" style="display:none;justify-self:start">Cancelar edição</button><div class="ae" id="ae2"></div></div>
  <h2>Chat da comunidade</h2><div class="bx"><label>Aviso fixado no chat<textarea class="fi" id="av" rows="3" maxlength="500" placeholder="Escreva o aviso…"></textarea></label><button class="pri" id="avs">Enviar aviso</button><button class="mini" id="chr" style="color:#ff6b81;justify-self:start">Apagar todas as mensagens do chat</button><div class="ae" id="ae3"></div></div>`;
  let en=1;const er=(m,n)=>{const x=$$("ae"+(n||en));if(x)x.textContent=m;else alert(m)},prox=d=>d.docs.reduce((a,x)=>Math.max(a,x.data().ordem||0),0)+1;
  $$("xbs").onclick=async e=>{en=1;const bt=e.target,o=$$("xbo").value,f=$$("bi").files[0],modo=f?"img":"capa";er("");
    if(b.size>=7)return er("Máximo de 7 banners. Exclua um para adicionar outro.");
    if(modo==="capa"&&!o)return er("Escolha a obra (para usar a capa dela) ou selecione uma imagem de banner.");
        bt.disabled=true;bt.textContent="Enviando…";
    try{let img="";if(modo==="img")img=await upl("banners","b-"+Date.now(),f);await addDoc(collection(db,"banners"),{img,obraId:o,usaCapa:modo==="capa",ordem:prox(b)});painel();renderHome(1)}
    catch(x){const m="Não foi possível adicionar o banner: "+(x.code||x.name||x.message);er(m);alert(m);bt.disabled=false;bt.textContent="Adicionar banner"}};
  $$("avs").onclick=async()=>{en=3;const t=$$("av").value.trim();er("");if(t.length<2)return er("Escreva o aviso.");
    try{const u=auth.currentUser;await addDoc(collection(db,"chat"),{uid:u.uid,nome:(u.displayName||"Administração").slice(0,40),foto:FOTO,texto:t.slice(0,500),tipo:"aviso",criado:serverTimestamp()});$$("av").value="";er("Aviso enviado e fixado no chat.")}catch(x){er("Não foi possível enviar: "+(x.code||x.message))}};
  $$("chr").onclick=async()=>{en=3;if(!confirm("Apagar TODAS as mensagens e avisos do chat? Isso não pode ser desfeito."))return;er("Apagando…");
    try{let n=0;for(let r=0;r<400;r++){const q=await getDocs(query(collection(db,"chat"),limit(50)));if(q.empty)break;
      const res=await Promise.allSettled(q.docs.map(d=>deleteDoc(d.ref))),ok=res.filter(x=>x.status==="fulfilled").length;n+=ok;er("Apagando… "+n);
      if(!ok)throw res.find(x=>x.status==="rejected").reason}
      er("Chat limpo: "+n+" mensagens apagadas.")}catch(x){const m="Não foi possível apagar: "+(x.code||x.message);er(m);alert(m)}};
  let sel=[],edit=null;
  const ck=()=>[...sec.querySelectorAll("#tob input")];
  $$("tob").onchange=e=>{const v=e.target.value;sel=sel.filter(x=>x!==v);if(e.target.checked)sel.push(v)};
  $$("tt").onchange=()=>{$$("tob").style.display=$$("tt").value==="obras"?"":"none"};
  $$("tc").onclick=()=>painel();
  $$("ts").onclick=async()=>{en=2;const n=$$("tn").value.trim(),tp=$$("tt").value;er("");
    if(n.length<2)return er("Dê um nome ao trilho.");if(tp==="obras"&&!sel.length)return er("Marque pelo menos uma obra.");
    const d={nome:n,tipo:tp,obras:tp==="obras"?sel.slice():[]};
    try{if(edit)await setDoc(doc(db,"trilhos",edit),d,{merge:true});else await addDoc(collection(db,"trilhos"),{...d,ordem:prox(t)});painel();renderHome(1)}catch(x){er("Erro: "+(x.code||x.message))}};
  sec.onclick=async e=>{const d=e.target.dataset;try{
    if(d.x){const[c,id]=d.x.split("|");if(!confirm("Excluir?"))return;await deleteDoc(doc(db,c,id))}
    else if(d.m){const[c,id,s]=d.m.split("|"),L=(c==="banners"?b:t).docs,i=L.findIndex(x=>x.id===id),j=i+ +s;if(j<0||j>=L.length)return;
      const w=writeBatch(db);w.update(doc(db,c,L[i].id),{ordem:L[j].data().ordem});w.update(doc(db,c,L[j].id),{ordem:L[i].data().ordem});await w.commit()}
    else if(d.e){const x=t.docs.find(y=>y.id===d.e);if(!x)return;const v=x.data();edit=d.e;sel=(v.obras||[]).slice();$$("tfh").textContent="Editando: "+v.nome;$$("tn").value=v.nome;$$("tt").value=v.tipo==="leitores_dia"?"leitores_dia":"obras";
      ck().forEach(c=>c.checked=sel.includes(c.value));$$("tob").style.display=$$("tt").value==="obras"?"":"none";$$("ts").textContent="Salvar alterações";$$("tc").style.display="";$$("tn").scrollIntoView({behavior:"smooth",block:"center"});return}
    else return;painel();renderHome(1)}catch(x){er("Erro: "+(x.code||x.message),1)}}}

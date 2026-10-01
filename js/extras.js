// Banners, trilhos da home, rankings, foto de perfil. Usa o mesmo Firebase do firebase.js.
import {getApp} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import {getAuth,onAuthStateChanged} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import {getFirestore,collection,doc,getDoc,getDocs,setDoc,addDoc,deleteDoc,writeBatch,query,where,orderBy,limit,increment,serverTimestamp} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
import {SIGNER_URL} from "./config.js";
const app=getApp(),auth=getAuth(app),db=getFirestore(app),$$=id=>document.getElementById(id);
const E=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const dia=(n=0)=>new Date(Date.now()-n*864e5).toLocaleDateString("sv-SE",{timeZone:"America/Sao_Paulo"});
const TIPOS={populares:"Obras populares da semana",lidas_dia:"Obras mais lidas do dia",favs_semana:"Mais favoritos da semana",leitores_dia:"Ranking de leitores do dia"};
let FOTO="";
const st=document.createElement("style");st.textContent=`#bnr{display:none;margin:0 0 14px}#bnr.on{display:block}
.bn{display:flex;gap:0;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none}.bn::-webkit-scrollbar{display:none}
.bn>*{flex:0 0 100%;scroll-snap-align:center;aspect-ratio:16/8;border:0;border-radius:16px;background:var(--sf2) center/cover no-repeat;cursor:pointer}
.rl{display:grid;gap:8px;margin-bottom:8px}.rl>div{display:flex;align-items:center;gap:12px;background:var(--sf);border:1px solid var(--bd);border-radius:14px;padding:10px 12px}
.rl .n{width:22px;font-weight:800;color:var(--gold)}.rl .f{width:40px;height:40px;border-radius:50%;background:var(--sf2) center/cover;flex:none}.rl b{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.rl span{color:var(--mu);font-size:13px}
.cv b{display:none}.ae{color:#ff6b81;font-size:14px;min-height:0}#adm2 .bx{display:grid;gap:10px;background:var(--sf);border:1px solid var(--bd);border-radius:14px;padding:14px;margin:10px 0}`;
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
function showFoto(u){FOTO=u||"";pa.style.background=u?`url(${u}) center/cover`:"";pa.style.color=u?"transparent":""}
pa.style.cursor="pointer";pa.title="Trocar foto";
pa.onclick=()=>auth.currentUser?inp.click():alert("Entre na sua conta para colocar uma foto.");
inp.onchange=async()=>{const f=inp.files[0],u=auth.currentUser;inp.value="";if(!f||!u)return;
  try{const url=await upl("avatars",u.uid+"-"+Date.now(),f,"avatar");await setDoc(doc(db,"perfis",u.uid),{nome:u.displayName||"Leitor",foto:url});showFoto(url)}
  catch(x){alert(x.message==="maximo_5mb"?"A foto pode ter até 5 MB.":x.message==="muito_rapido"?"Espere alguns segundos e tente de novo.":"Não foi possível enviar a foto ("+x.message+").")}};
onAuthStateChanged(auth,async u=>{if(!u)return showFoto("");
  const s=await getDoc(doc(db,"perfis",u.uid)).catch(()=>null);
  if(s&&s.exists())showFoto(s.data().foto);else setDoc(doc(db,"perfis",u.uid),{nome:u.displayName||"Leitor",foto:""}).catch(()=>{})});

/* ---------- contagem de leituras e favoritos ---------- */
const seen=new Set();
async function marcar(mk,col,obra,extra){const u=auth.currentUser;if(!u||seen.has(mk))return;seen.add(mk);const d=dia();
  try{const b=writeBatch(db);b.set(doc(db,"marcas",mk),{uid:u.uid});b.set(doc(db,col,d+"_"+obra),{dia:d,obraId:obra,n:increment(1),mk},{merge:true});
    if(extra)b.set(doc(db,"leitores",d+"_"+u.uid),{dia:d,uid:u.uid,nome:u.displayName||"Leitor",foto:FOTO,n:increment(1),mk},{merge:true});await b.commit()}catch(e){}}
const rl0=window.rl;window.rl=async function(){await rl0();const o=WID[S.cur];if(o&&W[S.cur]&&W[S.cur][3]>0&&S.cap>=1){const u=auth.currentUser;if(u)marcar(`l_${dia()}_${u.uid}_${o}_${lb(S.cur,S.cap)}`,"leituras",o,1)}};
$$("ofv").addEventListener("click",()=>{const u=auth.currentUser,o=WID[S.cur];if(u&&o&&P.fav.indexOf(S.cur)>-1)marcar(`f_${dia()}_${u.uid}_${o}`,"favs",o)});

/* ---------- home: banners e trilhos ---------- */
const cache={};
async function soma(col,n){const k=col+n;if(!cache[k]){const s=await getDocs(query(collection(db,col),where("dia",">=",dia(n-1)))),m={};s.forEach(x=>{const d=x.data();m[d.obraId]=(m[d.obraId]||0)+d.n});cache[k]=m}return cache[k]}
const card=(i,r,t)=>`<button class="card" data-go="obra" data-w="${i}"><div style="position:relative"><span class="rk">${r+1}</span>${cv(W[i],i)}</div><div class="nm">${E(W[i][0])}</div><div class="m">${t}</div></button>`;
async function trilho(t){let h=`<h2>${E(t.nome)}</h2>`;
  if(t.tipo==="leitores_dia"){const s=await getDocs(query(collection(db,"leitores"),where("dia","==",dia()))),L=s.docs.map(x=>x.data()).sort((a,b)=>b.n-a.n).slice(0,10);
    return h+(L.length?`<div class="rl">${L.map((x,r)=>`<div><span class="n">${r+1}</span><i class="f" style="background-image:url('${E(x.foto||"")}')"></i><b>${E(x.nome)}</b><span>${x.n} cap.</span></div>`).join("")}</div>`:`<p style="color:var(--mu)">Ninguém leu hoje ainda.</p>`)}
  const m=await soma(t.tipo==="favs_semana"?"favs":"leituras",t.tipo==="lidas_dia"?1:7),un=t.tipo==="favs_semana"?"fav.":"leituras";
  let L=WID.map((id,i)=>[i,m[id]||0]).filter(x=>!W[x[0]][4]).sort((a,b)=>b[1]-a[1]);if(L.some(x=>x[1]>0))L=L.filter(x=>x[1]>0);
  return h+`<div class="row">${L.slice(0,10).map((x,r)=>card(x[0],r,x[1]?x[1]+" "+un:"—")).join("")}</div>`}
let busy=0;
async function renderHome(){if(busy||!$$("trilhos")||!WID.length)return;busy=1;
  try{const [tr,bs]=await Promise.all([getDocs(query(collection(db,"trilhos"),orderBy("ordem"))),getDocs(query(collection(db,"banners"),orderBy("ordem")))]);
    $$("popold").hidden=!tr.empty;$$("trilhos").innerHTML=(await Promise.all(tr.docs.map(d=>trilho(d.data())))).join("");
    const B=bs.docs.map(d=>d.data()),bn=$$("bnr");bn.classList.toggle("on",!!B.length);$$("hero").style.display=B.length?"none":"";
    const capa=i=>i>-1&&W[i]?((W[i][1].match(/url\(['"]?(.*?)['"]?\)/)||[])[1]||""):"";
    const sl=b=>{const i=WID.indexOf(b.obraId),im=b.usaCapa?capa(i):b.img;return `<button ${i>-1?`data-go="obra" data-w="${i}"`:""} aria-label="Destaque" style="background-image:url('${E(im||"")}');${b.usaCapa?"background-position:center 20%":""}"></button>`};
    const L=B.length>1?[B[B.length-1],...B,B[0]]:B;
    bn.innerHTML=B.length?`<div class="bn">${L.map(sl).join("")}</div>`:"";
    clearInterval(window._bt);const x=bn.firstElementChild;
    if(x&&B.length>1){const w=()=>x.clientWidth,pula=i=>{x.style.scrollSnapType="none";x.scrollLeft=i*w();requestAnimationFrame(()=>x.style.scrollSnapType="")};
      let tm,tc=0,ok=0;
      x.addEventListener("scroll",()=>{clearTimeout(tm);tm=setTimeout(()=>{if(!w())return;const i=Math.round(x.scrollLeft/w());if(i<=0)pula(B.length);else if(i>=B.length+1)pula(1)},120)});
      x.addEventListener("touchstart",()=>tc=1);x.addEventListener("touchend",()=>setTimeout(()=>tc=0,4000));
      window._bt=setInterval(()=>{if(tc||!w()||!$$("home").classList.contains("on"))return;if(!ok){ok=1;pula(1);return}x.scrollTo({left:(Math.round(x.scrollLeft/w())+1)*w(),behavior:"smooth"})},4000)}}
  catch(e){}busy=0}
const h0=window.home;window.home=function(){h0();renderHome()};setTimeout(()=>{Object.keys(cache).forEach(k=>delete cache[k]);renderHome()},1500);

/* ---------- painel: banners e trilhos ---------- */
const sec=document.createElement("section");sec.className="v";sec.id="adm2";$$("adm").after(sec);
const ab=Object.assign(document.createElement("button"),{className:"pri",textContent:"Home e chat: banners, trilhos e avisos"});ab.style.cssText="justify-self:start;margin:8px 0;padding:9px 16px";
ab.onclick=()=>{if(!isA())return;go("adm2");painel()};$$("ast").before(ab);
async function painel(){
  const [b,t]=await Promise.all([getDocs(query(collection(db,"banners"),orderBy("ordem"))),getDocs(query(collection(db,"trilhos"),orderBy("ordem")))]);
  const li=(c,d,txt,img)=>`<div class="li"><div class="t"><b>${E(txt)}</b></div><div class="act"><button class="mini" data-m="${c}|${d.id}|-1">↑</button><button class="mini" data-m="${c}|${d.id}|1">↓</button><button class="mini" data-x="${c}|${d.id}">Excluir</button></div></div>`;
  sec.innerHTML=`<h2 style="margin-top:8px">Banners do carrossel</h2><div class="list" style="grid-template-columns:1fr">${b.docs.map(d=>li("banners",d,"Banner · "+(WID.indexOf(d.data().obraId)>-1?W[WID.indexOf(d.data().obraId)][0]:"sem link")+(d.data().usaCapa?" · capa da obra":" · imagem"))).join("")||'<p style="color:var(--mu)">Nenhum banner.</p>'}</div>
  <div class="bx"><label>Obra<select class="fi" id="bo"><option value="">Nenhuma</option>${WID.map((id,i)=>`<option value="${id}">${E(W[i][0])}</option>`).join("")}</select></label><label>Imagem do banner<select class="fi" id="bm"><option value="capa">Usar a capa da obra</option><option value="img">Enviar uma imagem de banner</option></select></label><label id="bf" style="display:none">Imagem (até 5 MB)<input class="fi" type="file" id="bi" accept="image/*"></label><button class="pri" id="bs">Adicionar banner</button><div class="ae" id="ae1"></div></div>
  <h2>Trilhos da home</h2><div class="list" style="grid-template-columns:1fr">${t.docs.map(d=>li("trilhos",d,d.data().nome+" · "+TIPOS[d.data().tipo])).join("")||'<p style="color:var(--mu)">Nenhum trilho. A home mostra "Populares da semana" até você criar o primeiro.</p>'}</div>
  <div class="bx"><label>Nome do trilho<input class="fi" id="tn" placeholder="Ex.: Em alta hoje"></label><label>Tipo<select class="fi" id="tt">${Object.entries(TIPOS).map(([k,v])=>`<option value="${k}">${v}</option>`).join("")}</select></label><button class="pri" id="ts">Criar trilho</button><div class="ae" id="ae2"></div></div>
  <h2>Chat da comunidade</h2><div class="bx"><label>Aviso fixado no chat<textarea class="fi" id="av" rows="3" maxlength="500" placeholder="Escreva o aviso…"></textarea></label><button class="pri" id="avs">Enviar aviso</button><button class="mini" id="chr" style="color:#ff6b81;justify-self:start">Apagar todas as mensagens do chat</button><div class="ae" id="ae3"></div></div>`;
  let en=1;const er=m=>{const x=$$("ae"+en);if(x)x.textContent=m;else alert(m)},prox=d=>d.docs.reduce((a,x)=>Math.max(a,x.data().ordem||0),0)+1;
  $$("bm").onchange=()=>{$$("bf").style.display=$$("bm").value==="img"?"":"none"};
  $$("bs").onclick=async e=>{en=1;const bt=e.target,modo=$$("bm").value,o=$$("bo").value,f=$$("bi").files[0];er("");
    if(b.size>=7)return er("Máximo de 7 banners. Exclua um para adicionar outro.");
    if(modo==="capa"&&!o)return er("Escolha a obra para usar a capa dela.");
    if(modo==="img"&&!f)return er("Escolha a imagem do banner.");
    bt.disabled=true;bt.textContent="Enviando…";
    try{let img="";if(modo==="img")img=await upl("banners","b-"+Date.now(),f);await addDoc(collection(db,"banners"),{img,obraId:o,usaCapa:modo==="capa",ordem:prox(b)});painel();renderHome()}
    catch(x){const m="Não foi possível adicionar o banner: "+(x.code||x.name||x.message);er(m);alert(m);bt.disabled=false;bt.textContent="Adicionar banner"}};
  $$("avs").onclick=async()=>{en=3;const t=$$("av").value.trim();er("");if(t.length<2)return er("Escreva o aviso.");
    try{const u=auth.currentUser;await addDoc(collection(db,"chat"),{uid:u.uid,nome:(u.displayName||"Administração").slice(0,40),foto:FOTO,texto:t.slice(0,500),tipo:"aviso",criado:serverTimestamp()});$$("av").value="";er("Aviso enviado e fixado no chat.")}catch(x){er("Não foi possível enviar: "+(x.code||x.message))}};
  $$("chr").onclick=async()=>{en=3;if(!confirm("Apagar TODAS as mensagens e avisos do chat? Isso não pode ser desfeito."))return;er("Apagando…");
    try{let n=0;for(;;){const q=await getDocs(query(collection(db,"chat"),limit(100)));if(q.empty)break;const w=writeBatch(db);q.docs.forEach(d=>w.delete(d.ref));await w.commit();n+=q.size}er("Chat limpo: "+n+" mensagens apagadas.")}catch(x){er("Não foi possível apagar: "+(x.code||x.message))}};
  $$("ts").onclick=async()=>{en=2;const n=$$("tn").value.trim();if(n.length<2)return er("Dê um nome ao trilho.");
    try{await addDoc(collection(db,"trilhos"),{nome:n,tipo:$$("tt").value,ordem:prox(t)});painel();renderHome()}catch(x){er("Erro: "+(x.code||x.message))}};
  sec.onclick=async e=>{en=1;const d=e.target.dataset;try{
    if(d.x){const[c,id]=d.x.split("|");if(!confirm("Excluir?"))return;await deleteDoc(doc(db,c,id))}
    else if(d.m){const[c,id,s]=d.m.split("|"),L=(c==="banners"?b:t).docs,i=L.findIndex(x=>x.id===id),j=i+ +s;if(j<0||j>=L.length)return;
      const w=writeBatch(db);w.update(doc(db,c,L[i].id),{ordem:L[j].data().ordem});w.update(doc(db,c,L[j].id),{ordem:L[i].data().ordem});await w.commit()}
    else return;painel();renderHome()}catch(x){er("Erro: "+(x.code||x.message))}}}

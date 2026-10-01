import {initializeApp} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import {getAuth,onAuthStateChanged,signInWithEmailAndPassword,createUserWithEmailAndPassword,sendEmailVerification,updateProfile,sendPasswordResetEmail,signOut} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import {getFirestore,collection,doc,getDoc,getDocs,setDoc,addDoc,updateDoc,deleteDoc,query,where,orderBy,limit,serverTimestamp} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
import {SIGNER_URL,ADMIN_EMAIL} from "./config.js";

const firebaseConfig = {
  apiKey: "AIzaSyBesrTVJe5iOqc21bOOco6Cx91gmnt1qf4",
  authDomain: "manhwatoons-f384c.firebaseapp.com",
  databaseURL: "https://manhwatoons-f384c-default-rtdb.firebaseio.com",
  projectId: "manhwatoons-f384c",
  messagingSenderId: "518512384379",
  appId: "1:518512384379:web:33ebcf1a5e37b4d41e45de"
};
const app=initializeApp(firebaseConfig),auth=getAuth(app),db=getFirestore(app);

// Nomes das coleções (troque aqui se o seu projeto usa outros nomes)
const C={obras:"obras",users:"users",tickets:"tickets"};

let WID=[],UID=null,ROLE="user",SIGN=false,MYT=[],pt,cmt,mb=0;

/* ---------- utilidades ---------- */
const AE={"auth/invalid-credential":"E-mail ou senha incorretos.","auth/wrong-password":"E-mail ou senha incorretos.","auth/user-not-found":"E-mail ou senha incorretos.","auth/too-many-requests":"Muitas tentativas. Tente de novo em alguns minutos.","auth/network-request-failed":"Sem conexão com a internet.","auth/email-already-in-use":"Este e-mail já está em uso.","auth/weak-password":"Senha fraca. Use 6 caracteres ou mais.","auth/invalid-email":"E-mail inválido.","auth/operation-not-allowed":"O login por e-mail e senha não está ativado no Firebase."};
const am=e=>AE[e.code]||"Não foi possível concluir. Tente de novo.";
const isOwner=u=>!!u&&(u.email||"").toLowerCase()===ADMIN_EMAIL&&u.emailVerified;
const readLocal=()=>{try{return JSON.parse(localStorage.getItem("mt2"))||{}}catch(e){return {}}};

/* ---------- favoritos e progresso (guardados por id da obra) ---------- */
function stateIds(){
  const pr={};Object.keys(P.pr).forEach(i=>{if(WID[+i])pr[WID[+i]]=P.pr[i]});
  return {fav:P.fav.map(i=>WID[i]).filter(Boolean),pr,last:WID[P.last.w]?{id:WID[P.last.w],c:P.last.c}:null};
}
function applyState(st){
  st=st||{};
  P.fav=(st.fav||[]).map(id=>WID.indexOf(id)).filter(i=>i>-1);
  P.pr={};Object.keys(st.pr||{}).forEach(id=>{const i=WID.indexOf(id);if(i>-1)P.pr[i]=st.pr[id]});
  const l=st.last,i=l?WID.indexOf(l.id):-1;P.last=i>-1?{w:i,c:l.c}:{w:-1,c:1};
}
function persist(){
  const st=stateIds();
  try{localStorage.setItem("mt2",JSON.stringify(st))}catch(e){}
  if(UID){clearTimeout(pt);pt=setTimeout(()=>updateDoc(doc(db,C.users,UID),{fav:st.fav,pr:st.pr,last:st.last}).catch(()=>{}),1500)}
}
window.sv=persist;window.WID=WID;
window.isA=()=>!!UID&&ROLE==="admin";

/* ---------- obras e capítulos ---------- */
async function loadObras(){
  const cur=WID.length?stateIds():readLocal(),cid=WID[S.cur];
  const snap=await getDocs(query(collection(db,C.obras),orderBy("updatedAt","desc")));
  [W,G,ST,U,SY,WID,CL,TS].forEach(a=>{a.length=0});Object.keys(CP).forEach(k=>delete CP[k]);
  snap.docs.forEach((d,i)=>{const o=d.data();WID.push(d.id);
    const nums=Array.isArray(o.chNums)?o.chNums.slice().sort((a,b)=>a-b):Array.from({length:o.chapters||0},(_,k)=>k+1);CL.push(nums);
    W.push([o.title||"Sem título",o.cover?"url("+o.cover+") center/cover":GR[i%GR.length],o.rating||"—",nums.length]);
    G.push(o.genre||"Fantasia");ST.push(o.status||"Em lançamento");SY.push(o.synopsis||"");U.push(snap.size-i);TS.push(o.updatedAt&&o.updatedAt.toMillis?o.updatedAt.toMillis():0)});
  LN.length=0;for(let i=0;i<Math.min(4,W.length);i++)LN.push(i);
  applyState(cur);const k=WID.indexOf(cid);S.cur=k>-1?k:0;
}
async function loadCap(w,n){
  const k=w+"-"+n;if(CP[k]||!WID[w])return;
  try{const d=await getDoc(doc(db,C.obras,WID[w],"capitulos",String(lb(w,n))));const p=d.exists()?d.data().pages||[]:[];if(p.length)CP[k]=p}catch(e){}
}
const rl0=window.rl;
window.rl=async function(){
  const w=W[S.cur];
  if(w&&w[3]>0){S.cap=Math.min(Math.max(1,S.cap),w[3]);const a=S.cur,b=S.cap;await loadCap(a,b);if(a!==S.cur||b!==S.cap)return}
  rl0();
};
const more0=window.more;
window.more=async function(){
  if(S.md!=="r"||mb)return;mb=1;
  try{if(S.ld<W[S.cur][3])await loadCap(S.cur,S.ld+1)}finally{mb=0}
  more0();
};
const meta0=window.meta;
window.meta=function(){meta0();clearTimeout(cmt);cmt=setTimeout(loadCm,400)};

/* ---------- comentários ---------- */
async function loadCm(){
  CM.length=0;const id=WID[S.cur];
  if(id){try{const s=await getDocs(query(collection(db,C.obras,id,"capitulos",String(lb(S.cur,S.cap)),"comentarios"),orderBy("createdAt","desc"),limit(30)));s.forEach(d=>CM.push([d.data().name||"Leitor",d.data().text||""]))}catch(e){}}
  cr();
}
$("cs").onclick=async()=>{
  const v=$("ci").value.trim();if(v.length<2)return;if(!UID){go("login");return}
  try{await addDoc(collection(db,C.obras,WID[S.cur],"capitulos",String(lb(S.cur,S.cap)),"comentarios"),{uid:UID,name:$("pn").textContent,text:v.slice(0,500),createdAt:serverTimestamp()});$("ci").value="";await loadCm()}
  catch(x){alert("Não foi possível comentar agora.")}
};

/* ---------- login, cadastro, senha ---------- */
$("fl").onsubmit=async e=>{
  e.preventDefault();
  const a=er("le",RE.test($("le").value)?"":"Digite um e-mail válido."),b=er("lp",$("lp").value?"":"Digite sua senha.");
  if(!(a&&b))return;const btn=e.submitter;if(btn)btn.disabled=true;
  try{await signInWithEmailAndPassword(auth,$("le").value.trim(),$("lp").value);$("fl").reset();go("home")}
  catch(x){er("lp",am(x))}finally{if(btn)btn.disabled=false}
};
$("fc").onsubmit=async e=>{
  e.preventDefault();const n=$("cn").value.trim();
  const v=[er("cn",n.length>=3?"":"Use pelo menos 3 caracteres."),er("ce",RE.test($("ce").value)?"":"Digite um e-mail válido."),er("cp",$("cp").value.length>=6?"":"A senha precisa ter 6 caracteres ou mais."),er("cq",$("cq").value===$("cp").value&&$("cq").value?"":"As senhas não coincidem."),er("ct",$("ct").checked?"":"Aceite os termos para criar a conta.")];
  if(v.includes(false))return;const btn=e.submitter;if(btn)btn.disabled=true;
  try{
    SIGN=true;
    const c=await createUserWithEmailAndPassword(auth,$("ce").value.trim(),$("cp").value);
    await setDoc(doc(db,C.users,c.user.uid),{name:n,email:c.user.email,role:"user",createdAt:serverTimestamp(),fav:[],pr:{},last:null});
    await updateProfile(c.user,{displayName:n});
    if((c.user.email||"").toLowerCase()===ADMIN_EMAIL){
      await sendEmailVerification(c.user).catch(()=>{});
      alert("Enviamos um link de confirmação para o seu e-mail. Confirme e entre de novo para ativar o acesso de administrador.");
    }
    await onUser(c.user);$("fc").reset();go("home");
  }catch(x){er(x.code==="auth/email-already-in-use"||x.code==="auth/invalid-email"?"ce":"cp",am(x))}
  finally{SIGN=false;if(btn)btn.disabled=false}
};
$("fr").onsubmit=async e=>{
  e.preventDefault();if(!er("rem",RE.test($("rem").value)?"":"Digite um e-mail válido."))return;
  try{await sendPasswordResetEmail(auth,$("rem").value.trim())}catch(x){if(x.code==="auth/network-request-failed"){er("rem",am(x));return}}
  const o=$("rok");o.hidden=false;o.textContent="Se existir uma conta para "+$("rem").value+", o link chega em instantes.";
};
$("sair").onclick=async()=>{await signOut(auth);go("login")};

/* ---------- sessão ---------- */
async function onUser(u){
  await ready;
  const r=doc(db,C.users,u.uid);let s=await getDoc(r);
  if(!s.exists()){await setDoc(r,{name:u.displayName||u.email.split("@")[0],email:u.email,role:"user",createdAt:serverTimestamp(),fav:[],pr:{},last:null});s=await getDoc(r)}
  if((u.email||"").toLowerCase()===ADMIN_EMAIL&&!u.emailVerified){
    await u.reload().catch(()=>{});await u.getIdToken(true).catch(()=>{});
    if(!u.emailVerified&&!sessionStorage.getItem("mtv")){
      try{sessionStorage.setItem("mtv","1")}catch(e){}
      await sendEmailVerification(u).then(()=>alert("Enviamos um link de confirmação para "+u.email+". Abra o e-mail, confirme e entre de novo para virar administrador.")).catch(()=>{});
    }
  }
  let d=s.data();
  if(isOwner(auth.currentUser)&&d.role!=="admin"){try{await updateDoc(r,{role:"admin"});d={...d,role:"admin"}}catch(e){}}
  UID=u.uid;ROLE=d.role||"user";
  logged(d.name||u.email.split("@")[0],u.email);
  const loc=readLocal();
  applyState({fav:[...new Set([...(d.fav||[]),...(loc.fav||[])])],pr:{...(loc.pr||{}),...(d.pr||{})},last:d.last||loc.last||null});
  persist();refresh();
}
async function offUser(){
  await ready;UID=null;ROLE="user";S.email="";
  const b=$("ent");b.textContent="Entrar";b.dataset.go="login";
  $("pn").textContent="Visitante";$("pa").textContent="?";$("pe").textContent="Entre para salvar seu progresso";
  applyState(readLocal());refresh();
}

/* ---------- suporte ---------- */
window.sr=function(){
  $("sl").innerHTML=MYT.length?MYT.map(x=>'<div class="cmi"><b>'+(x.status==="resolvido"?"Resolvido":"Aberto")+'</b>'+esc(x.subject+": "+x.message.slice(0,60))+'</div>').join(""):'<div class="emp" style="margin-top:8px"><b>Nenhum ticket ainda</b>Os que você abrir aparecem aqui.</div>';
};
async function loadMyT(){
  if(!UID){MYT=[];return sr()}
  try{const s=await getDocs(query(collection(db,C.tickets),where("uid","==",UID)));MYT=s.docs.map(d=>d.data()).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0))}catch(e){MYT=[]}
  sr();
}
$("fs").onsubmit=async e=>{
  e.preventDefault();if(!UID){go("login");return}
  const m=$("sm").value.trim();if(!er("sm",m.length>=10?"":"Descreva com pelo menos 10 caracteres."))return;
  const btn=e.submitter;btn.disabled=true;
  try{await addDoc(collection(db,C.tickets),{uid:UID,name:$("pn").textContent,email:auth.currentUser.email,subject:$("sa").value,message:m.slice(0,1000),status:"aberto",createdAt:serverTimestamp()});$("sm").value="";await loadMyT()}
  catch(x){er("sm","Não foi possível enviar. Tente de novo.")}finally{btn.disabled=false}
};

/* ---------- painel ADM ---------- */
async function loadAdm(){
  if(!isA())return;
  try{
    const [t,u]=await Promise.all([getDocs(query(collection(db,C.tickets),orderBy("createdAt","desc"),limit(50))),getDocs(collection(db,C.users))]);
    AD.tickets=t.docs.map(d=>{const x=d.data();return [x.subject+": "+(x.message||"").slice(0,50),(x.name||"Usuário")+" · "+(x.status==="resolvido"?"Resolvido":"Aberto"),x.status==="resolvido"?0:1,d.id]});
    AD.users=u.docs.map(d=>{const x=d.data();return [x.name||"Sem nome",(x.email||"")+" · "+(x.role==="admin"?"Admin":"Leitor"),d.id,x.role||"user"]});
    const cs=await Promise.all(V().map(i=>getDocs(query(collection(db,C.obras,WID[i],"capitulos"),orderBy("number","desc"),limit(5))).then(s=>s.docs.map(d=>[W[i][0]+" · Cap. "+d.data().number,ST[i],i,d.data().number]))));
    AD.caps=cs.flat();
  }catch(e){}
  ar();
}
$("al").onclick=async e=>{
  const d=e.target.dataset;
  try{
    if(d.dl!==undefined){
      const i=+d.dl;
      if(AD.t===0){
        if(!confirm("Excluir esta obra e todos os capítulos?"))return;
        const id=WID[i],cs=await getDocs(collection(db,C.obras,id,"capitulos"));
        await Promise.all(cs.docs.map(x=>deleteDoc(x.ref)));await deleteDoc(doc(db,C.obras,id));
      }else if(AD.t===1){
        const r=AD.caps[i];if(!confirm("Excluir "+r[0]+"?"))return;
        const id=WID[r[2]];await deleteDoc(doc(db,C.obras,id,"capitulos",String(r[3])));
        const nums=(CL[r[2]]||[]).filter(x=>x!==r[3]);
        await updateDoc(doc(db,C.obras,id),{chNums:nums,chapters:nums.length});
      }
      await loadObras();refresh();await loadAdm();
    }
    if(d.rs!==undefined){const r=AD.tickets[+d.rs];await updateDoc(doc(db,C.tickets,r[3]),{status:"resolvido"});r[2]=0;r[1]=r[1].replace("Aberto","Resolvido");ar()}
    if(d.rl!==undefined){
      const r=AD.users[+d.rl],nr=r[3]==="admin"?"user":"admin";
      if(r[2]===UID&&nr==="user"&&!confirm("Você vai remover seu próprio acesso de administrador. Continuar?"))return;
      await updateDoc(doc(db,C.users,r[2]),{role:nr});if(r[2]===UID)ROLE=nr;await loadAdm();
    }
    if(d.ed!==undefined)fm("o",+d.ed);
    if(d.nw)fm(d.nw);
  }catch(x){alert("Não foi possível concluir: "+(x.code||x.message))}
};
async function up(path,f){
  if(f.size>5*1024*1024)throw new Error("maximo_5mb");
  const t=await auth.currentUser.getIdToken();
  const a=await fetch(SIGNER_URL,{headers:{Authorization:"Bearer "+t}});
  const k=await a.json().catch(()=>({}));
  if(!a.ok||!k.signature)throw new Error(k.error||"assinatura_"+a.status);
  const i=path.lastIndexOf("/"),fd=new FormData();
  fd.append("file",f);fd.append("fileName",path.slice(i+1));fd.append("folder","/"+path.slice(0,i));
  fd.append("useUniqueFileName","false");fd.append("publicKey",k.publicKey);
  fd.append("signature",k.signature);fd.append("expire",k.expire);fd.append("token",k.token);
  const r=await fetch("https://upload.imagekit.io/api/v1/files/upload",{method:"POST",body:fd});
  const j=await r.json().catch(()=>({}));
  if(!r.ok||!j.url)throw new Error(j.message||"upload_"+r.status);
  return j.url;
}
$("ff").onsubmit=async e=>{
  e.preventDefault();const b=e.submitter,t0=b.textContent,msg=m=>{$("fe").textContent=m};
  b.disabled=true;b.textContent="Salvando…";msg("");
  try{
    if(FD.k==="o"){
      const t=$("ft").value.trim();if(t.length<2)return msg("Digite o título da obra.");
      const ed=FD.ed>-1,id=ed?WID[FD.ed]:doc(collection(db,C.obras)).id;
      let cover;if(FD.files&&FD.files[0])cover=await up("capas/"+id+"-"+Date.now(),FD.files[0]);
      const o={title:t,genre:$("fgn").value,status:$("fst").value,synopsis:$("fsy").value.trim(),updatedAt:serverTimestamp()};
      if(cover)o.cover=cover;if(!ed){o.rating="—";o.chapters=0;o.createdAt=serverTimestamp()}
      await setDoc(doc(db,C.obras,id),o,{merge:true});at2(0);
    }else{
      const wi=+$("fw").value,txt=$("fn").value.trim().replace(",",".");
      if(!/^\d+(\.\d+)?$/.test(txt))return msg("Digite o número do capítulo (ex.: 0, 1, 1.5, 121).");
      const n=Number(txt);
      if(!FD.files||!FD.files.length)return msg("Envie pelo menos uma página.");
      const id=WID[wi],urls=[];
      for(let k=0;k<FD.files.length;k++){
        b.textContent="Enviando "+(k+1)+"/"+FD.files.length+"…";
        urls.push(await up("paginas/"+id+"/"+String(n).replace(".","_")+"/"+String(k).padStart(3,"0")+"-"+Date.now(),FD.files[k]));
      }
      await setDoc(doc(db,C.obras,id,"capitulos",String(n)),{number:n,pages:urls,createdAt:serverTimestamp()});
      const nums=Array.from(new Set([...(CL[wi]||[]),n])).sort((a,b)=>a-b);
      await updateDoc(doc(db,C.obras,id),{chNums:nums,chapters:nums.length,updatedAt:serverTimestamp()});
      at2(1);
    }
    await loadObras();refresh();go("adm");await loadAdm();
  }catch(x){msg("Não foi possível salvar: "+(x.code||x.message||"erro")+(x.code?"":" (envio da imagem). Confira o Worker assinador e as chaves do ImageKit."))}
  finally{b.disabled=false;b.textContent=t0}
};

/* ---------- telas ---------- */
function hero(){
  const h=$("hero");h.hidden=!W.length;if(!W.length)return;
  $("hh").textContent=W[0][0];$("hg").innerHTML='<span class="tag">'+esc(G[0])+'</span><span class="tag">'+ST[0]+'</span>';$("hp").textContent=(SY[0]||"").slice(0,160);
}
function stats(){
  $("s1").textContent=Object.keys(P.pr).length;
  $("s2").textContent=Object.keys(P.pr).reduce((a,k)=>a+P.pr[k],0);
  $("s3").textContent=auth.currentUser?new Date(auth.currentUser.metadata.creationTime).getFullYear():"—";
}
function refresh(){
  hero();home();
  if(!W.length){$("pop").innerHTML='<div class="emp" style="width:100%"><b>Nenhuma obra publicada ainda</b>Quando o administrador cadastrar obras, elas aparecem aqui.</div>';$("new").innerHTML=""}
  rs(false);
  const t=[].findIndex.call($("tabs").children,b=>b.classList.contains("on"));tab(t<0?0:t);
  stats();$("radm").hidden=!isA();
}
const go0=window.go;
window.go=function(v,i){go0(v,i);if(v==="suporte")loadMyT();if(v==="adm")loadAdm();if(v==="perfil"){stats();$("radm").hidden=!isA()}};

/* ---------- início ---------- */
AD.tickets=[];AD.users=[];AD.caps=[];CM.length=0;
const ready=loadObras().catch(x=>{fail("Não foi possível carregar","Verifique sua conexão e as regras do Firestore ("+(x.code||"erro")+").")});
ready.then(refresh);
onAuthStateChanged(auth,u=>{if(SIGN)return;u?onUser(u):offUser()});

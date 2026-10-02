// Painel ADM: buscar obras no MangaDex, importar e sincronizar a lista de capítulos.
// As páginas NÃO são copiadas: cada capítulo guarda o id do MangaDex e as imagens vêm de lá na leitura.
import {getApp} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import {getFirestore,collection,doc,getDoc,getDocs,setDoc,updateDoc,writeBatch,query,where,serverTimestamp} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
import {mdGet} from "./mdapi.js";
const db=getFirestore(getApp()),$$=id=>document.getElementById(id);
const E=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const GEN={Fantasy:"Fantasia",Action:"Ação",Adventure:"Aventura",Drama:"Drama",Romance:"Romance",Horror:"Terror"};
const STA={ongoing:"Em lançamento",completed:"Completo",hiatus:"Hiato",cancelled:"Hiato"};
let LANG="pt-br",BUSY=false,R=[];
const tit=a=>a.title.en||Object.values(a.title)[0]||"Sem título";
const capa=m=>{const c=m.relationships.find(r=>r.type==="cover_art");return c&&c.attributes?"https://uploads.mangadex.org/covers/"+m.id+"/"+c.attributes.fileName:""};
const msg=t=>{$$("mdm").textContent=t};

const st=document.createElement("style");
st.textContent="#mdp{position:fixed;inset:0;z-index:99;background:rgba(0,0,0,.85);display:none;overflow:auto;padding:16px}#mdp.on{display:block}#mdp .box{max-width:640px;margin:0 auto;background:var(--sf,#111);border:1px solid var(--bd,#333);border-radius:16px;padding:16px;display:grid;gap:12px}#mdp .row{display:flex;gap:8px}#mdp .row{flex-wrap:wrap}#mdp .row input{flex:1 1 100%;min-width:0}#mdp .row select{width:auto;flex:1}#mdm{color:var(--mu);font-size:13px;min-height:18px}";
document.head.append(st);
const p=document.createElement("div");p.id="mdp";
p.innerHTML='<div class="box"><div class="row" style="justify-content:space-between;align-items:center"><h2 style="margin:0">MangaDex</h2><button class="mini" id="mdx">Fechar</button></div><div class="row"><input class="fi" id="mdq" placeholder="Nome da obra"><select class="fi" id="mdl"><option value="pt-br">PT-BR</option><option value="en">Inglês</option></select><button class="pri" id="mdb" style="padding:9px 16px">Buscar</button></div><div id="mdm"></div><div class="list" id="mdr" style="grid-template-columns:1fr"></div><h3 style="margin:8px 0 0">Já importadas</h3><div class="list" id="mdi" style="grid-template-columns:1fr"></div></div>';
document.body.append(p);
const bt=document.createElement("button");bt.className="pri";bt.textContent="Importar do MangaDex";bt.style.cssText="display:block;justify-self:start;margin-bottom:10px;padding:9px 16px";
$$("al").before(bt);

async function lista(){
  const s=await getDocs(query(collection(db,"obras"),where("mdId",">","")));
  $$("mdi").innerHTML=s.docs.map(d=>{const o=d.data();return '<div class="li"><div class="t"><b>'+E(o.title||"")+'</b><span>'+(o.chapters||0)+' capítulos</span></div><div class="act"><button class="mini" data-sy="'+d.id+'" data-md="'+E(o.mdId)+'" data-lg="'+E(o.mdLang||"pt-br")+'">Sincronizar</button></div></div>'}).join("")||'<div class="emp"><b>Nada ainda</b></div>';
  return new Set(s.docs.map(d=>d.data().mdId));
}
async function buscar(){
  const q=$$("mdq").value.trim();if(q.length<2)return msg("Digite o nome da obra.");
  LANG=$$("mdl").value;msg("Buscando…");
  const [j,ja]=await Promise.all([mdGet("/manga?title="+encodeURIComponent(q)+"&limit=12&includes[]=cover_art&contentRating[]=safe&contentRating[]=suggestive&availableTranslatedLanguage[]="+LANG+"&order[relevance]=desc"),lista()]);
  R=j.data;msg(R.length?"":"Nenhuma obra encontrada neste idioma.");
  $$("mdr").innerHTML=R.map((m,i)=>{const a=m.attributes,c=capa(m);return '<div class="li"><div class="cv" style="--g:url('+(c?E(c)+".256.jpg":"")+') center/cover;width:48px;height:68px;flex:none"></div><div class="t"><b>'+E(tit(a))+'</b><span>'+E(STA[a.status]||a.status)+(a.year?" · "+a.year:"")+'</span></div><div class="act">'+(ja.has(m.id)?'<span class="stt">Importada</span>':'<button class="mini" data-im="'+i+'">Importar</button>')+'</div></div>'}).join("");
}
async function sync(id,mdId,lang){
  const ref=doc(db,"obras",id),ex=new Set(((await getDoc(ref)).data()||{}).chNums||[]),mp=new Map();
  let off=0,total=1;
  while(off<total){
    msg("Buscando capítulos… "+mp.size);
    const j=await mdGet("/manga/"+mdId+"/feed?translatedLanguage[]="+lang+"&order[chapter]=asc&limit=500&offset="+off+"&includeExternalUrl=0");
    total=j.total;off+=j.data.length;if(!j.data.length)break;
    for(const c of j.data){const a=c.attributes;if(!a.pages||a.externalUrl)continue;
      const n=a.chapter==null?0:Number(a.chapter);if(!isFinite(n))continue;
      const o=mp.get(n);if(!o||a.pages>o.pages)mp.set(n,{id:c.id,pages:a.pages,at:a.publishAt});}
  }
  const novos=[...mp.entries()].filter(([n])=>!ex.has(n));
  for(let i=0;i<novos.length;i+=400){
    msg("Salvando capítulos "+Math.min(i+400,novos.length)+"/"+novos.length+"…");
    const b=writeBatch(db);
    novos.slice(i,i+400).forEach(([n,c])=>b.set(doc(db,"obras",id,"capitulos",String(n)),{number:n,md:c.id,mdPages:c.pages,createdAt:new Date(c.at)},{merge:true}));
    await b.commit();
  }
  const nums=[...new Set([...ex,...mp.keys()])].sort((a,b)=>a-b);
  const ult=[...mp.values()].map(c=>+new Date(c.at)).sort((a,b)=>b-a)[0];
  await updateDoc(ref,{chNums:nums,chapters:nums.length,mdLang:lang,updatedAt:ult?new Date(ult):serverTimestamp()});
  msg(mp.size?"Pronto: "+novos.length+" capítulos novos.":"Nenhum capítulo disponível neste idioma.");
  if(window.recarregarObras)await window.recarregarObras();
  await lista();
}
async function importar(m){
  const a=m.attributes,id=doc(collection(db,"obras")).id,g=a.tags.map(t=>GEN[t.attributes.name.en]).filter(Boolean),c=capa(m);
  await setDoc(doc(db,"obras",id),{title:tit(a),genre:g[0]||"Fantasia",status:STA[a.status]||"Em lançamento",synopsis:((a.description["pt-br"]||a.description.en||"").split(/\n\s*---/)[0]).trim().slice(0,600),cover:c?c+".512.jpg":"",rating:"—",chapters:0,chNums:[],mdId:m.id,mdLang:LANG,createdAt:serverTimestamp(),updatedAt:serverTimestamp()});
  await sync(id,m.id,LANG);
}
const run=async f=>{if(BUSY)return;BUSY=true;try{await f()}catch(x){msg("Erro: "+(x.code||x.message))}finally{BUSY=false}};
bt.onclick=()=>{if(!window.isA||!window.isA())return;p.classList.add("on");msg("");run(lista)};
$$("mdx").onclick=()=>p.classList.remove("on");
$$("mdb").onclick=()=>run(buscar);
$$("mdq").onkeydown=e=>{if(e.key==="Enter")run(buscar)};
p.onclick=e=>{const d=e.target.dataset;
  if(d.im!==undefined)run(()=>importar(R[+d.im]));
  if(d.sy)run(()=>sync(d.sy,d.md,d.lg));
};

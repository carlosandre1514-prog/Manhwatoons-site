// Interface do Manhwa Toons (telas, leitor, painel ADM). Os dados vêm de js/firebase.js
var W=[],CL=[];function lb(w,i){var a=CL[w];return a&&a[i-1]!==undefined?a[i-1]:i}
var $=function(i){return document.getElementById(i)};
var NAV=[["home","Início","i-home"],["lib","Biblioteca","i-book"],["lib","Favoritos","i-heart"],["jornada","Jornada","i-star"],["perfil","Perfil","i-user"]];
function nav(){var t="",b="";NAV.forEach(function(n,i){t+='<button data-go="'+n[0]+'" data-i="'+i+'">'+n[1]+'</button>';b+='<button data-go="'+n[0]+'" data-i="'+i+'"><svg><use href="#'+n[2]+'"/></svg>'+n[1]+'</button>'});$("top").innerHTML=t+'<button data-go="busca">Explorar</button>';$("bot").innerHTML=b}

$("chips").innerHTML=["Todos","Fantasia","Ação","Romance","Terror","Isekai"].map(function(c,i){return '<button class="'+(i?'':'on')+'">'+c+'</button>'}).join("");
$("chips").onclick=function(e){if(e.target.tagName==="BUTTON"){[].forEach.call($("chips").children,function(b){b.classList.remove("on")});e.target.classList.add("on")}};
function er(i,m){var f=$(i),e=$(i+"e");if(e)e.textContent=m||"";if(f&&f.type!=="checkbox"){f.classList.toggle("bad",!!m);f.setAttribute("aria-invalid",m?"true":"false")}return !m}
var RE=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
$("fl").onsubmit=function(e){e.preventDefault();var a=er("le",RE.test($("le").value)?"":"Digite um e-mail válido."),b=er("lp",$("lp").value?"":"Digite sua senha.");if(a&&b){logged($("le").value.split("@")[0],$("le").value);go("home")}};
$("fc").onsubmit=function(e){e.preventDefault();var v=[er("cn",$("cn").value.trim().length>=3?"":"Use pelo menos 3 caracteres."),er("ce",RE.test($("ce").value)?"":"Digite um e-mail válido."),er("cp",$("cp").value.length>=6?"":"A senha precisa ter 6 caracteres ou mais."),er("cq",$("cq").value===$("cp").value&&$("cq").value?"":"As senhas não coincidem."),er("ct",$("ct").checked?"":"Aceite os termos para criar a conta.")];if(v.indexOf(false)<0){logged($("cn").value.trim(),$("ce").value);go("home")}};
var G=[],gf="Todos";
function esc(t){return t.replace(/[&<>]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;"}[c]})}
$("bf").innerHTML=["Todos","Fantasia","Ação","Aventura","Drama"].map(function(c,i){return '<button class="'+(i?'':'on')+'">'+c+'</button>'}).join("");
$("bf").onclick=function(e){if(e.target.tagName==="BUTTON"){[].forEach.call($("bf").children,function(b){b.classList.remove("on")});e.target.classList.add("on");gf=e.target.textContent;rs()}};
$("q").oninput=function(){if(!$("busca").classList.contains("on"))go("busca");rs()};
$("tabs").onclick=function(e){if(e.target.tagName==="BUTTON")tab([].indexOf.call($("tabs").children,e.target))};
var CM=[["Ana","Esse capítulo foi incrível!"],["Léo","Quando sai o próximo?"]];
function cr(){$("cl").innerHTML=CM.map(function(c){return '<div class="cmi"><b>'+esc(c[0])+'</b>'+esc(c[1])+'</div>'}).join("")}
$("cs").onclick=function(){var v=$("ci").value.trim();if(v.length<2)return;var n=$("ent").textContent;CM.unshift([n==="Entrar"?"Você":n,v]);$("ci").value="";cr()};
$("br").oninput=function(){document.querySelector(".pn").style.filter="brightness("+this.value+"%)"};
var AD={t:0,obras:W.map(function(w,i){return[w[0],"Cap. "+w[3]+" · "+G[i]]}),caps:[["O Cavaleiro das Estrelas · Cap. 120","hoje"],["Lorde das Cinzas · Cap. 86","ontem"],["A Lâmina Sem Nome · Cap. 64","2 dias"]],tickets:[["Capítulo 12 não carrega","Ana · Aberto",1],["Erro ao favoritar","Léo · Aberto",1],["Sugestão de gênero","Bia · Resolvido",0]],users:[["ana_leitora","ana@email.com · Leitor"],["admin","admin@toons.com · Admin"],["leo","leo@email.com · Leitor"]]};
var TK=["obras","caps","tickets","users"];
$("at").onclick=function(e){if(e.target.tagName==="BUTTON"){AD.t=[].indexOf.call($("at").children,e.target);[].forEach.call($("at").children,function(b){b.classList.toggle("on",b===e.target)});ar()}};
function sr(){var m=AD.tickets.filter(function(x){return x[1].indexOf("Você")===0});$("sl").innerHTML=m.length?m.map(function(x){return '<div class="cmi"><b>'+(x[2]?"Aberto":"Resolvido")+'</b>'+esc(x[0])+'</div>'}).join(""):'<div class="emp" style="margin-top:8px"><b>Nenhum ticket ainda</b>Os que você abrir aparecem aqui.</div>'}
$("fs").onsubmit=function(e){e.preventDefault();var m=$("sm").value.trim();if(!er("sm",m.length>=10?"":"Descreva com pelo menos 10 caracteres."))return;AD.tickets.unshift([$("sa").value+": "+m.slice(0,40),"Você · Aberto",1]);$("sm").value="";sr()};

var ST=[],U=[],UC=10,PS=4,BP=0,fs0=1,qt;
var S={cur:0,cap:12,pg:0,md:"r",email:""},LN=[0,1],CP={},FD={ed:-1,imgs:[],k:"o"};
var SY=[];
var GR=["linear-gradient(160deg,#3a3a3a,#050505)","linear-gradient(160deg,#0d4d2b,#020a05)","linear-gradient(160deg,#2b5d5a,#0a1a22)","linear-gradient(160deg,#5b2a4a,#150c1f)"];
var TX=["A espada não escolhe o forte.","Escolhe quem não desiste.","Levante. Mais uma vez.","O aço lembra cada golpe.","Ainda há estrelas no céu."];
var VS=["home","obra","leitor","lib","busca","perfil","jornada","suporte","adm","login","cadastro","recuperar","termos","aform","erro"];
function ld(){try{return JSON.parse(localStorage.getItem("mt"))||{}}catch(e){return {}}}
function sv(o){try{localStorage.setItem("mt",JSON.stringify(o))}catch(e){}}
var P=ld();P.fav=[];P.last={w:-1,c:1};P.pr={};P.pf={};
var TS=[],LM=0;
function ago(t){if(!t)return"";var s=Math.max(0,Math.floor((Date.now()-t)/1e3));if(s<60)return"agora";var m=Math.floor(s/60);if(m<60)return"há "+m+" min";var h=Math.floor(m/60);if(h<24)return"há "+h+" h";var d=Math.floor(h/24);if(d<7)return"há "+d+(d===1?" dia":" dias");var w=Math.floor(d/7);if(d<30)return"há "+w+(w===1?" semana":" semanas");var o=Math.floor(d/30);if(d<365)return"há "+o+(o===1?" mês":" meses");var y=Math.floor(d/365);return"há "+y+(y===1?" ano":" anos")}
setInterval(function(){[].forEach.call(document.querySelectorAll(".ago"),function(e){e.textContent=ago(+e.dataset.ts)})},15000);
function V(){return W.map(function(w,i){return i}).filter(function(i){return !W[i][4]})}
function isA(){return S.email==="admin@toons.com"}
function cv(w,x){return '<div class="cv" style="--g:'+w[1]+';--x:'+(x*14-30)+'px" aria-hidden="true"><b>'+esc(w[0])+'</b></div>'}
function cd(i,pg){var w=W[i];return '<button class="card" data-go="obra" data-w="'+i+'" style="width:auto">'+cv(w,i)+'<div class="nm">'+esc(w[0])+'</div>'+(pg!==undefined?'<div class="pg"><i style="width:'+pg+'%"></i></div>':'<div class="m"><svg><use href="#i-star"/></svg>'+w[2]+' · '+ST[i]+'</div>')+'</button>'}
function fail(t,m){$("et").textContent=t;$("em").textContent=m;go("erro")}
function go(v,i){
if((v==="adm"||v==="aform")&&!isA())return fail("Acesso restrito","Só administradores acessam o painel. Entre com uma conta de administrador.");
if(v==="leitor"&&!navigator.onLine)return fail("Sem conexão","Verifique sua internet e tente de novo.");
document.querySelectorAll(".v").forEach(function(x){x.classList.toggle("on",x.id===v)});
var k=v==="lib"?(i||1):0;if(v==="login"||v==="cadastro"||v==="busca"||v==="erro"||v==="termos"||v==="recuperar")k=-1;if(v==="jornada")k=3;if(v==="perfil"||v==="adm"||v==="suporte")k=4;
if(v==="lib"){LM=i==2?1:0;tab(LM?1:0)}if(v==="home")home();if(v==="obra")ob();if(v==="leitor")rl();if(v==="adm")ar();if(v==="perfil")$("radm").hidden=!isA();
document.querySelectorAll("#top button,#bot button").forEach(function(b){var on=+b.dataset.i===k;b.classList.toggle("on",on);if(on)b.setAttribute("aria-current","page");else b.removeAttribute("aria-current")});window.scrollTo(0,0);ap();if(fs0)fs0=0;else $("mn").focus({preventScroll:true})}
document.addEventListener("click",function(e){var b=e.target.closest("[data-go],[data-cap]");if(!b)return;var d=b.dataset;if(d.w!==undefined)S.cur=+d.w;if(d.cap!==undefined)S.cap=+d.cap;if(d.last){S.cur=P.last.w;S.cap=P.last.c}S.pg=0;go(d.go||"leitor",d.i)});
function home(){var v=V();
$("pop").innerHTML=v.slice(0,12).map(function(i,r){var w=W[i];return '<button class="card" data-go="obra" data-w="'+i+'"><div style="position:relative"><span class="rk">'+(r+1)+'</span>'+cv(w,i)+'</div><div class="nm">'+esc(w[0])+'</div><div class="m"><svg><use href="#i-star"/></svg>'+w[2]+'</div></button>'}).join("");
$("new").innerHTML=v.slice(0,NC()).map(function(i,r){var w=W[i];return '<button class="li" data-go="leitor" data-w="'+i+'" data-cap="'+Math.max(1,w[3])+'">'+cv(w,i)+'<div class="t"><b>'+esc(w[0])+'</b><span>Capítulo '+lb(i,Math.max(1,w[3]))+' · <span class="ago" data-ts="'+(TS[i]||0)+'">'+ago(TS[i])+'</span></span></div>'+(TS[i]&&Date.now()-TS[i]<864e5?'<span class="new">Novo</span>':'')+'</button>'}).join("");
var l=P.last,w=W[l.w],c=$("cont");c.hidden=!w||!!w[4];if(!c.hidden)c.innerHTML='<div class="cv" style="--g:'+w[1]+'"></div><div class="t"><b>'+esc(w[0])+'</b><span>Capítulo '+lb(l.w,l.c)+' · '+pcn(l.w)+'% lido</span><div class="pg"><i style="width:'+pcn(l.w)+'%"></i></div></div><svg><use href="#i-play"/></svg>'}
function ob(){var i=S.cur,w=W[i];if(!w||w[4])return fail("Obra não encontrada","Essa obra foi removida.");
$("oc").style.setProperty("--g",w[1]);$("oc").innerHTML='<b>'+esc(w[0])+'</b>';$("og").innerHTML='<span class="tag">'+esc(G[i])+'</span><span class="tag">'+ST[i]+'</span>';$("ot").textContent=w[0];$("os").textContent=SY[i]||"Sem sinopse ainda.";
$("ost").innerHTML='<div><b>'+w[2]+'</b>nota</div><div><b>'+w[3]+'</b>capítulos</div>';
var f=P.fav.indexOf(i)>-1,pr=P.pf[i];$("ofv").innerHTML='<svg><use href="#i-heart"/></svg>'+(f?"Favoritado":"Favoritar");$("ofv").style.color=f?"var(--gold)":"var(--tx)";
var cc=pr?Math.min(Math.max(1,W[i][3]),Math.floor(pr)+1):1;$("ol").dataset.cap=cc;$("ol").textContent=pr?"Continuar (cap. "+lb(i,cc)+")":"Começar a ler";
var n=w[3],h="";if(S.ob!==i){S.ob=i;S.cn=12}for(var c=n;c>Math.max(0,n-S.cn);c--)h+='<button class="ch" data-go="leitor" data-cap="'+c+'"><span>Capítulo '+lb(i,c)+'</span><small>'+(c===n?"mais recente":"")+'</small></button>';
$("caps").innerHTML=(h||'<div class="emp"><b>Ainda sem capítulos</b>Volte em breve.</div>')+(n>S.cn?'<button class="mini" id="cmore" style="margin-top:12px">Mostrar mais capítulos</button>':'')}
$("caps").onclick=function(e){if(e.target.id==="cmore"){S.cn+=12;ob()}};
$("ofv").onclick=function(){var i=S.cur,k=P.fav.indexOf(i);if(k>-1)P.fav.splice(k,1);else P.fav.push(i);sv(P);ob()};
function it(n){n=n||S.cap;var im=CP[S.cur+"-"+n];if(im)return im.map(function(u){return {u:u}});return [{g:GR[0],t:"Este capítulo ainda não tem páginas."}]}
function pgh(x,n,k){return x.u?'<img class="pi" loading="lazy" decoding="async" alt="Capítulo '+n+', página '+(k+1)+'" src="'+x.u+'">':'<div class="ph" style="--g:'+x.g+'"><span>'+x.t+'</span></div>'}
function blk(n){return '<section class="chb" data-c="'+n+'" aria-label="Capítulo '+lb(S.cur,n)+'"><h3 class="chh">Capítulo '+lb(S.cur,n)+'</h3>'+it(n).map(function(x,k){return pgh(x,n,k)}).join("")+'</section>'}
var so=null,co=null;
function stop(){if(so)so.disconnect();if(co)co.disconnect();so=co=null}
function meta(){var w=W[S.cur],a=it().length;$("rt").textContent="Cap. "+lb(S.cur,S.cap)+" · "+w[0];$("rc").textContent=(S.md==="p"?"pág. "+(S.pg+1)+"/"+a+" · ":"")+S.cap+" / "+w[3];P.last={w:S.cur,c:S.cap};sv(P)}
var TG=1.5,TMIN=8,T0={},DN={};
function pcn(i){return Math.min(100,Math.floor((P.pf[i]||0)/Math.max(1,W[i][3])*100))}
function setProg(i,c,f){var v=(c-1)+Math.max(0,Math.min(1,f)),m=W[i][3];if(v>(P.pf[i]||0)){P.pf[i]=Math.min(v,m);sv(P)}}
function chk(i,c,f,np,fim){var k=i+"-"+c;if(!T0[k])T0[k]=Date.now();if(fim&&Date.now()-T0[k]<Math.max(TMIN,np*TG)*1e3)fim=false;if(!fim)f=Math.min(f,.99);setProg(i,c,f);if(fim&&!DN[k]){DN[k]=1;window.dispatchEvent(new CustomEvent("capfim",{detail:{w:i,c:c}}))}}
function trk(){var w=W[S.cur];if(!$("leitor").classList.contains("on")||!w||w[3]<1)return;
if(S.md==="r"){[].forEach.call(document.querySelectorAll("#pnl .chb"),function(b){var r=b.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)return;var im=b.querySelectorAll("img.pi"),ok=true;[].forEach.call(im,function(x){if(!x.complete||!x.naturalHeight)ok=false});var f=Math.max(0,Math.min(1,(innerHeight-r.top)/Math.max(1,r.height))),fim=ok&&r.bottom<=innerHeight+8&&f>=1;chk(S.cur,+b.dataset.c,fim?1:f,im.length,fim)})}
else{var a=it();chk(S.cur,S.cap,(S.pg+1)/a.length,a.length,S.pg>=a.length-1)}}
var tk=0;addEventListener("scroll",function(){if(!tk)tk=setTimeout(function(){tk=0;trk()},250)},{passive:true});setInterval(trk,2000);
function more(){var w=W[S.cur],box=$("pnl");if(S.md!=="r")return;if(S.ld>=w[3]){if(!box.querySelector(".fim"))box.insertAdjacentHTML("beforeend",'<p class="fim">Você leu tudo por enquanto. Novos capítulos em breve.</p>');return}S.ld++;box.insertAdjacentHTML("beforeend",blk(S.ld));if(co)co.observe(box.lastElementChild);if(so){so.unobserve($("sent"));so.observe($("sent"))}}
function rl(){stop();var w=W[S.cur];if(!w||w[4])return fail("Obra não encontrada","Essa obra foi removida.");
if(w[3]<1){$("pnl").innerHTML='<div class="emp"><b>Sem capítulos ainda</b>Esta obra ainda não tem páginas.</div>';$("sent").hidden=true;$("rt").textContent=w[0];$("rc").textContent="";return}
S.cap=Math.min(Math.max(1,S.cap),w[3]);var box=$("pnl");$("pv").textContent=S.md==="p"?"Anterior":"Cap. anterior";$("nxb").textContent=S.md==="p"?"Próximo":"Próximo cap.";
if(S.md==="r"){S.ld=S.cap;box.innerHTML=blk(S.cap);
if(window.IntersectionObserver){co=new IntersectionObserver(function(es){es.forEach(function(e){var c=+e.target.dataset.c;if(e.isIntersecting&&c!==S.cap){S.cap=c;meta()}})},{rootMargin:"-45% 0px -54% 0px"});co.observe(box.firstElementChild);so=new IntersectionObserver(function(es){if(es[0].isIntersecting)more()},{rootMargin:"900px 0px"});so.observe($("sent"))}}
else{var a=it();S.pg=Math.min(S.pg,a.length-1);box.innerHTML=pgh(a[S.pg],S.cap,S.pg)}
$("sent").hidden=S.md!=="r";meta()}
$("nxb").onclick=function(){var a=it();if(S.md==="p"&&S.pg<a.length-1)S.pg++;else if(S.cap<W[S.cur][3]){S.cap++;S.pg=0}rl();window.scrollTo(0,0)};
$("pv").onclick=function(){if(S.md==="p"&&S.pg>0)S.pg--;else if(S.cap>1){S.cap--;S.pg=0}rl();window.scrollTo(0,0)};
document.querySelectorAll("[data-md]").forEach(function(b){b.onclick=function(){S.md=b.dataset.md;S.pg=0;document.querySelectorAll("[data-md]").forEach(function(x){x.classList.toggle("on",x===b)});rl()}});
$("rp").onclick=function(){var o=$("ro");o.hidden=false;o.textContent="Recebemos o aviso sobre o capítulo "+lb(S.cur,S.cap)+". Obrigado!"};
function rs(reset){if(reset!==false)BP=0;var q=$("q").value.trim().toLowerCase(),st=$("bs").value,o=$("bo").value,nt=function(i){return parseFloat(String(W[i][2]).replace(",","."))||0};
var L=V().filter(function(i){var ok=gf==="Todos"||(gf==="Lançamentos"?LN.indexOf(i)>-1:G[i]===gf);return ok&&(!st||ST[i]===st)&&W[i][0].toLowerCase().indexOf(q)>-1});
L.sort(function(a,b){return o==="n"?nt(b)-nt(a):o==="c"?W[b][3]-W[a][3]:o==="a"?W[a][0].localeCompare(W[b][0],"pt"):U[b]-U[a]});
var pgs=Math.max(1,Math.ceil(L.length/PS));BP=Math.min(BP,pgs-1);
$("bg").innerHTML=L.length?L.slice(BP*PS,BP*PS+PS).map(function(i){return cd(i)}).join(""):'<div class="emp" style="grid-column:1/-1"><b>Nenhuma obra encontrada</b>Tente outro nome ou limpe os filtros.</div>';
$("bc").textContent=L.length+(L.length===1?" resultado":" resultados");
$("bp").innerHTML=pgs>1?'<button class="mini" id="bpp"'+(BP?'':' disabled')+'>Anterior</button><span>Página '+(BP+1)+' de '+pgs+'</span><button class="mini" id="bpn"'+(BP<pgs-1?'':' disabled')+'>Próxima</button>':''}
$("bf").innerHTML=["Todos","Lançamentos","Fantasia","Ação","Aventura","Drama"].map(function(c,i){return '<button class="'+(i?'':'on')+'">'+c+'</button>'}).join("");
function tab(n){var t=$("tabs");t.style.display=LM?"":"none";document.querySelector("#lib h2").textContent=LM?"Favoritos":"Biblioteca";[].forEach.call(t.children,function(b,i){b.classList.toggle("on",i===n)});
var v=V(),fv=P.fav.filter(function(i){return v.indexOf(i)>-1}),pc=pcn;
var rd=v.filter(function(i){return(P.pf[i]||0)>0&&pc(i)<100}),dn=v.filter(function(i){return W[i][3]>0&&pc(i)>=100});
var em=function(b,m){return'<div class="emp" style="grid-column:1/-1"><b>'+b+'</b>'+m+'</div>'},L=function(a,e){return a.length?a.map(function(i){return cd(i,pc(i))}).join(""):e};
$("gr").innerHTML=!LM?L(v,em("Nenhuma obra ainda","As obras publicadas aparecem aqui.")):n===0?L(rd,em("Nada em leitura","Comece a ler uma obra e ela aparece aqui.")):n===1?L(fv,em("Nenhum favorito ainda","Toque no coração de uma obra para salvar aqui.")):L(dn,em("Nada concluído ainda","Termine uma obra e ela aparece aqui."));
$("sfv").textContent=fv.length;$("pfn").textContent=fv.length}
function logged(n,m){var b=$("ent");b.textContent=n;b.dataset.go="perfil";b.removeAttribute("data-i");S.email=(m||"").trim().toLowerCase();$("pn").textContent=n;$("pa").textContent=n.charAt(0).toUpperCase();$("pe").textContent=m}
$("sair").onclick=function(){var b=$("ent");b.textContent="Entrar";b.dataset.go="login";S.email="";$("pn").textContent="Visitante";$("pa").textContent="?";$("pe").textContent="Entre para salvar seu progresso";go("login")};
$("fg").onclick=function(){go("recuperar")};
$("fr").onsubmit=function(e){e.preventDefault();if(!er("rem",RE.test($("rem").value)?"":"Digite um e-mail válido."))return;var o=$("rok");o.hidden=false;o.textContent="Se existir uma conta para "+$("rem").value+", o link chega em instantes."};
function at2(n){AD.t=n;[].forEach.call($("at").children,function(b,i){b.classList.toggle("on",i===n)})}
function ar(){var k=TK[AD.t],ab=AD.tickets.filter(function(x){return x[2]}).length,v=V(),L=AD.t===0?v.map(function(i){return[W[i][0],"Cap. "+lb(i,W[i][3])+" · "+G[i]+" · "+ST[i],i]}):AD[k];
$("ast").innerHTML='<div><b>'+v.length+'</b>obras</div><div><b>'+v.reduce(function(t,i){return t+W[i][3]},0)+'</b>capítulos</div><div><b>'+ab+'</b>tickets abertos</div><div><b>'+AD.users.length+'</b>usuários</div>';
var h=AD.t===0?'<button class="pri" data-nw="o" style="justify-self:start;margin-bottom:4px;padding:9px 16px">+ Nova obra</button>':AD.t===1?'<button class="pri" data-nw="c" style="justify-self:start;margin-bottom:4px;padding:9px 16px">+ Novo capítulo</button>':'';
h+=L.map(function(r,i){var a=AD.t===2?'<span class="stt'+(r[2]?' a':'')+'">'+(r[2]?"Aberto":"Resolvido")+'</span>'+(r[2]?'<button class="mini" data-rs="'+i+'">Resolver</button>':''):(AD.t===0?'<button class="mini" data-ed="'+r[2]+'">Editar</button>':'')+(AD.t===3?'<button class="mini" data-rl="'+i+'">'+(r[3]==="admin"?"Remover admin":"Tornar admin")+'</button>':'<button class="mini" data-dl="'+(AD.t===0?r[2]:i)+'">Excluir</button>');return '<div class="li"><div class="t"><b>'+esc(r[0])+'</b><span>'+esc(AD.t===2?r[1].split(" · ")[0]:r[1])+'</span></div><div class="act">'+a+'</div></div>'}).join("");
$("al").innerHTML=h+(L.length?'':'<div class="emp"><b>Nada por aqui</b>Nenhum item cadastrado.</div>')}
$("al").onclick=function(e){var d=e.target.dataset;if(d.dl!==undefined){if(AD.t===0)W[+d.dl][4]=1;else AD[TK[AD.t]].splice(+d.dl,1);home();ar()}if(d.rs!==undefined){AD.tickets[+d.rs][2]=0;ar()}if(d.ed!==undefined)fm("o",+d.ed);if(d.nw)fm(d.nw)};
function fm(k,ed){FD={ed:ed===undefined?-1:ed,imgs:[],k:k};$("ff").reset();$("fe").textContent="";$("fp").innerHTML="";$("fo").hidden=k!=="o";$("fk").hidden=k!=="c";
if(k==="o"){$("fh").textContent=FD.ed>-1?"Editar obra":"Nova obra";if(FD.ed>-1){$("ft").value=W[ed][0];$("fgn").value=G[ed];$("fst").value=ST[ed];$("fsy").value=SY[ed]||""}}else{$("fh").textContent="Novo capítulo";$("fw").innerHTML=V().map(function(i){return '<option value="'+i+'">'+esc(W[i][0])+'</option>'}).join("")}
go("aform")}
function rf(f){return new Promise(function(ok,no){if(!/^image\//.test(f.type)||f.size>5242880)return no(f.name);var r=new FileReader();r.onload=function(){ok(r.result)};r.onerror=function(){no(f.name)};r.readAsDataURL(f)})}
function lf(inp){var fs=[].slice.call(inp.files).slice(0,20);Promise.all(fs.map(rf)).then(function(d){FD.imgs=d;FD.files=fs;$("fp").innerHTML=d.map(function(u){return '<div class="cv" style="--g:url('+u+') center/cover"></div>'}).join("");$("fe").textContent=""}).catch(function(n){FD.imgs=[];inp.value="";$("fp").innerHTML="";$("fe").textContent="Use imagens de até 5 MB. Problema em: "+n})}
$("fcv").onchange=function(){lf(this)};$("fpg").onchange=function(){lf(this)};
$("ff").onsubmit=function(e){e.preventDefault();var er2=function(m){$("fe").textContent=m};
if(FD.k==="o"){var t=$("ft").value.trim();if(t.length<2)return er2("Digite o título da obra.");var bg=FD.imgs[0]?'url('+FD.imgs[0]+') center/cover':null;
if(FD.ed>-1){var w=W[FD.ed];w[0]=t;G[FD.ed]=$("fgn").value;ST[FD.ed]=$("fst").value;SY[FD.ed]=$("fsy").value.trim();if(bg)w[1]=bg}else{W.push([t,bg||GR[W.length%GR.length],"—",0]);G.push($("fgn").value);ST.push($("fst").value);U.push(++UC);SY.push($("fsy").value.trim());LN.push(W.length-1)}at2(0)}
else{var wi=+$("fw").value,n=parseInt($("fn").value,10);if(!(n>=1))return er2("Digite o número do capítulo.");if(!FD.imgs.length)return er2("Envie pelo menos uma página.");CP[wi+"-"+n]=FD.imgs;U[wi]=++UC;W[wi][3]=Math.max(W[wi][3],n);AD.caps.unshift([W[wi][0]+" · Cap. "+n,"agora"]);at2(1)}
home();go("adm")};
$("etry").onclick=function(){if(navigator.onLine)go("home");else $("em").textContent="Ainda sem conexão. Tente novamente em instantes."};
function net(){$("off").hidden=navigator.onLine}
window.addEventListener("online",net);window.addEventListener("offline",net);
function hs(){var h=location.hash.slice(1);if(!h)return;if(VS.indexOf(h)<0)fail("Página não encontrada","Não existe uma página em #"+h+".");else go(h)}
window.addEventListener("hashchange",hs);
function ap(){document.querySelectorAll(".chips button,.tabs button,[data-md]").forEach(function(b){b.setAttribute("aria-pressed",b.classList.contains("on")?"true":"false")})}
document.addEventListener("click",function(){setTimeout(ap,0)});
$("bp").onclick=function(e){var id=e.target.id;if(id==="bpp"&&BP>0)BP--;else if(id==="bpn")BP++;else return;rs(false);$("bg").scrollIntoView({block:"start"})};
$("bs").onchange=function(){rs()};$("bo").onchange=function(){rs()};
$("q").oninput=function(){if(!$("busca").classList.contains("on"))go("busca");clearTimeout(qt);qt=setTimeout(rs,150)};
document.querySelectorAll(".er").forEach(function(x){var f=$(x.id.slice(0,-1));if(f)f.setAttribute("aria-describedby",x.id)});
function NC(){return innerWidth<700?4:innerWidth<1100?6:9}
function pz(){var w=Math.min(innerWidth,1680)-(innerWidth<700?32:48),c=Math.max(2,Math.floor((w+14)/164));PS=c*(innerWidth<700?3:2)}
var rz;window.addEventListener("resize",function(){clearTimeout(rz);rz=setTimeout(function(){pz();if($("busca").classList.contains("on"))rs(false);if($("home").classList.contains("on"))home()},150)});
pz();
cr();sr();rs();tab(0);net();ap();
nav();go("home");
$("pop").innerHTML=Array(5).join('<div class="sk" style="flex:none;width:132px;height:210px"></div>');$("new").innerHTML=Array(4).join('<div class="sk" style="height:76px"></div>');hs();

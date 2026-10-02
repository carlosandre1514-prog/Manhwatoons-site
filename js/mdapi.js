// Chamadas ao MangaDex. Tenta direto do navegador; se o CORS bloquear, usa o Worker (/md).
import {SIGNER_URL} from "./config.js";
const API="https://api.mangadex.org";
export async function mdGet(path){
  for(const base of [API,SIGNER_URL+"/md"]){
    try{const r=await fetch(base+path);if(r.ok)return await r.json()}catch(e){}
  }
  throw new Error("mangadex_indisponivel");
}
// Páginas do capítulo: o MangaDex entrega o servidor e a lista de arquivos na hora da leitura.
export async function mdPages(id){
  const j=await mdGet("/at-home/server/"+id);
  if(!j||!j.chapter)return [];
  return j.chapter.data.map(f=>j.baseUrl+"/data/"+j.chapter.hash+"/"+f);
}

# Manhwa Toons

Site de leitura de manhwas e webtoons (HTML, CSS e JavaScript puro) ligado ao Firebase.

## Estrutura

```
manhwa-toons-site/
├── index.html               Páginas do site (todas as telas)
├── manifest.webmanifest     Permite instalar o site como app
├── css/
│   └── style.css            Visual (preto + verde neon, responsivo)
├── js/
│   ├── app.js               Telas, leitor infinito, painel ADM (interface)
│   ├── config.js            Endereço do assinador e e-mail do admin
│   └── firebase.js          Login, banco de dados e envio de imagens
├── assets/
│   └── icons/               Ícone do app (favicon, iPhone, 192 e 512)
├── firestore.rules          Regras de segurança do banco
├── signer/worker.js         Assinador de envios (Cloudflare Worker gratuito) para o ImageKit
├── firestore.indexes.json   Índices do Firestore (vazio, não precisa de nenhum)
├── firebase.json            Configuração de hospedagem e regras
└── .firebaserc              Projeto: manhwatoons-f384c
```

## Configuração no console do Firebase (uma vez só)

1. **Authentication > Método de login:** ative **E-mail/senha**.
2. **Authentication > Configurações > Domínios autorizados:** adicione o domínio onde o site vai ficar (por exemplo `seuusuario.github.io`). `localhost` já vem liberado.
3. **Firestore Database:** crie o banco (modo produção).
4. **Regras:** copie o conteúdo de `firestore.rules` em Firestore > Regras e publique. Ou, com a Firebase CLI: `firebase deploy --only firestore:rules`.
5. **Imagens:** ficam no ImageKit (o Firebase Storage não é mais usado). Veja a seção abaixo.

## ImageKit (imagens)

1. Crie a conta em imagekit.io. Em **Developer options** copie: **URL endpoint**, **Public key** e **Private key**.
2. Cloudflare > Workers & Pages > Create > Worker: cole o conteúdo de `signer/worker.js` e faça o deploy.
3. No Worker > Settings > Variables: `IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_PRIVATE_KEY` (tipo Secret), `FIREBASE_PROJECT` = `manhwatoons-f384c`, `ADMIN_EMAIL` = `carlosandre.ad1514@gmail.com`.
4. Cole o endereço do Worker em `SIGNER_URL` no `js/config.js`.

A chave privada fica só no Worker. Só admins recebem assinatura de envio. Limite do formulário: 5 MB por imagem.

## Administrador e conta única

- O e-mail do dono está em `js/config.js`, em `firestore.rules` e em `worker/wrangler.toml` (`carlosandre.ad1514@gmail.com`). Crie a conta com ele, **confirme o e-mail** pelo link recebido e entre de novo: o Painel ADM aparece sozinho.
- Cada Gmail só cria uma conta: o Firebase já bloqueia e-mail idêntico (Authentication > Configurações > "Uma conta por endereço de e-mail"). Endereços parecidos são permitidos.


## Outros administradores (manual)

O dono já é admin automaticamente. Para promover outra pessoa, use a aba Usuários do painel, ou faça assim:

1. Abra o site e crie sua conta em "Criar conta".
2. No console, vá em Firestore > coleção `users` > seu documento.
3. Mude o campo `role` de `user` para `admin`.
4. Recarregue o site. Em **Perfil** vai aparecer o **Painel ADM**.

Depois, outros admins podem ser promovidos pelo próprio painel (aba Usuários).

## Coleções do Firestore

| Caminho | Campos |
|---|---|
| `users/{uid}` | `name`, `email`, `role` (`user` ou `admin`), `fav` (ids de obras), `pr` (progresso por obra), `last`, `createdAt` |
| `obras/{obraId}` | `title`, `genre`, `status`, `synopsis`, `cover` (URL), `rating`, `chapters`, `createdAt`, `updatedAt` |
| `obras/{obraId}/capitulos/{número}` | `number`, `pages` (lista de URLs), `createdAt` |
| `obras/{obraId}/capitulos/{número}/comentarios/{id}` | `uid`, `name`, `text`, `createdAt` |
| `tickets/{id}` | `uid`, `name`, `email`, `subject`, `message`, `status` (`aberto` ou `resolvido`), `createdAt` |

Se o seu projeto já usa outros nomes de coleção, troque o objeto `C` no começo de `js/firebase.js`.

## Publicar

- **Firebase Hosting:** `firebase deploy --only hosting`
- **GitHub Pages:** envie toda a pasta para o repositório e ative o Pages.

Abra sempre por um endereço `https://` (ou `localhost`). Abrir `index.html` direto do disco (`file://`) não funciona, porque o navegador bloqueia os módulos do Firebase.

## Limitações conhecidas

- Excluir uma obra apaga os capítulos, mas não remove as imagens do ImageKit nem os comentários antigos. Limpe manualmente pelo console se precisar.
- A nota (`rating`) das obras novas começa como "—" e ainda não há sistema de avaliação.
- As imagens têm limite de 2 MB cada no formulário e 5 MB nas regras.

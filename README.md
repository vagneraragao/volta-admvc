# VOLTA — ADMVC

Aplicação da campanha de retornáveis da **ADMVC** para a construção da **Nova Sede**.
São três telas no mesmo endereço:

| Tela | Onde roda | O que faz |
|---|---|---|
| **Mesa de coleta** | tablet na mesa | botões gigantes para registrar as garrafas entregues |
| **Telão** | máquina ligada no projetor | contador, Palavra e fotos da obra, alternando sozinho |
| **Administração** | qualquer aparelho | meta, frases de agradecimento e correção do contador |

Sem framework, sem passo de build, sem `npm install` para publicar. `git push` é o deploy.

## Identidade e Escrituras

A cara é a do **volta.com.pt** — amarelo `#F5E600` sobre quase-preto `#101211`, com ciano
`#0CC3D7` marcando a meta batida — e as fontes são as deles: **Albert Sans** na interface e
**Permanent Marker** na assinatura *"Toma lá, Dá cá"*. A igreja entra pelo conteúdo, não pela
cor: a **Fraunces** serifada é usada **só** nas passagens bíblicas, o que separa a Palavra do
resto da tela num piscar de olhos.

O eixo da campanha é **Lucas 6.38**: *"Deem aos outros, e Deus dará a vocês."* O bordão de
reciclagem português é, palavra por palavra, a economia do Reino. E **1 Crônicas 29.14** —
*"tudo vem de ti, e nós somente devolvemos o que já era teu"* — fala em **devolver** numa
campanha de **retornáveis**.

As treze passagens padrão estão na **NTLH** e foram conferidas no texto, não escritas de
memória. Cada mensagem tem três partes: o agradecimento (que se adapta à quantidade com `{n}`
e `{garrafas}`), a passagem e a referência. As passagens também entram no rodízio do telão.
Para trocar de tradução, edite pelo painel: *Admin → Banco de mensagens*.

---

## Rodar na sua máquina

Os arquivos em `src/` são módulos ES, e o navegador **não carrega módulos por `file://`** —
abrir o `index.html` com duplo clique mostra a tela em branco e um erro de CORS no console.
Use um servidor local, que é uma linha:

```bash
npx --yes serve .          # ou: npm run servir
```

Depois abra o endereço que ele imprimir (normalmente http://localhost:3000).

Assim você vê as três telas e a sincronia entre abas funcionando. A pasta `api/` **não roda**
desse jeito: o app detecta a ausência do servidor, mostra o selo `somente neste aparelho` e
continua funcionando no `localStorage`. Para testar a API junto, use `npx vercel dev`.

---

## Publicar na Vercel

1. Suba a pasta para um repositório no GitHub.
2. Em vercel.com → **Add New… → Project** → escolha o repositório.
3. Framework Preset: **Other**. Não preencha build command nem output directory.
4. **Deploy**.

Pronto — o site já está no ar e funcionando em modo local (cada aparelho com o seu próprio
contador). Os dois passos seguintes é que ligam a sincronia e a segurança.

### Passo 1 — ligar a sincronia entre aparelhos

Sem isto, o tablet e o telão **não conversam**: `localStorage` é uma caixa separada em cada
aparelho, e nenhum truque de front-end atravessa isso.

1. No projeto da Vercel → aba **Storage** → **Create Database** → **Upstash for Redis** →
   conecte ao projeto.
2. A integração cria sozinha as variáveis de ambiente. Confira em **Settings → Environment
   Variables** que apareceu um par `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`
   (ou `KV_REST_API_URL` / `KV_REST_API_TOKEN` — a aplicação aceita os dois nomes).
3. **Redeploy** para o site enxergar as variáveis novas.

O selo no canto da tela deve passar de `somente neste aparelho` para `sincronizado`.

### Passo 2 — fechar a porta

**A URL da Vercel é pública.** Sem estas duas variáveis, qualquer pessoa com o link consegue
inflar o contador ou abrir o painel de administração. Em **Settings → Environment
Variables**, crie:

| Variável | Para que serve |
|---|---|
| `SENHA_ADMIN` | senha do painel, conferida **no servidor**. Sem ela o padrão é `1234`. Use algo longo e aleatório. |
| `TOKEN_MESA` | segredo que autoriza um aparelho a registrar doações. Enquanto estiver vazia, o registro fica **aberto para qualquer um**. |

Depois de definir o `TOKEN_MESA`, vá uma vez em cada tablet de coleta:
**Admin → Este aparelho → Token da mesa**, cole o mesmo valor e toque em *Guardar*. Fica
salvo naquele navegador; não precisa repetir.

---

## Montar na igreja

Cada tela tem o seu próprio endereço — é só guardar nos favoritos do aparelho:

| Endereço | Tela |
|---|---|
| `seu-site.vercel.app/` | mesa de coleta |
| `seu-site.vercel.app/telao` | telão do projetor |
| `seu-site.vercel.app/admin` | administração |

**No tablet da mesa:** abra o endereço raiz. Coloque em tela cheia e deixe ligado na tomada.

**Na máquina do projetor:** abra `/telao` direto e salve nos favoritos. Os links dentro do app
são âncoras de verdade, então dá para clicar com o botão do meio e abrir o telão numa segunda
janela, para jogar no projetor sem perder a tela da mesa.

**Para entrar na administração:** `/admin`, ou a engrenagem discreta no rodapé da mesa.

Endereços antigos com `#/telao` e `#/admin` continuam funcionando.

O botão **−1 corrigir** desfaz um toque duplo acidental, e só funciona sobre a entrega que
está em andamento — para corrigir o total da campanha, use o painel de administração.

---

## Fotos do telão

Ficam em `fotos/`, como arquivos do projeto. Veja [`fotos/LEIA-ME.md`](fotos/LEIA-ME.md).
Resumo: copie o JPG para a pasta, acrescente uma linha em `fotos/lista.json` e dê `git push`.
Com a lista vazia, o telão mostra só o contador — o que já funciona bem.

---

## Como funciona por dentro

```
index.html          casca: fontes, Tailwind, React/htm por CDN
src/loja.js         estado, fila offline e conversa com a API
src/ui.js           peças compartilhadas (contador animado, barra, confete, link)
src/rotas.js        /, /telao e /admin
src/telas.js        Mesa, Telão e Admin
src/app.js          escolhe a tela pela URL e monta o React
api/estado.js       função serverless: lê e grava no Redis
```

**As rotas precisam do servidor.** Recarregar a página em `/telao` só funciona porque o
servidor devolve o `index.html` nesse caminho: no Vercel isso está em `vercel.json`
(`rewrites`) e localmente o `npm run servir` usa `serve -s`. Um `npx serve .` sem o `-s` dá
404 ao recarregar fora da raiz.

**Três camadas de sincronia, empilhadas.** O `localStorage` pinta a tela no primeiro quadro e
aguenta queda de rede. O `BroadcastChannel` atualiza janelas do mesmo navegador na hora, de
graça. A API é a verdade compartilhada entre aparelhos.

**O contador nunca perde uma garrafa.** Do lado do servidor, `INCRBY` do Redis é atômico:
duas mesas somando no mesmo instante não se atropelam. Do lado do tablet, cada toque entra
numa fila local e só sai dela quando o servidor confirma — se o wi-fi cair no meio do culto,
as doações ficam guardadas e sobem sozinhas quando a rede volta. O número na tela nunca anda
para trás.

**Chaves no Redis:** `volta:total` (inteiro), `volta:config` (JSON), `volta:versao` (inteiro).

---

## Quanto isso consome

Cada consulta ao servidor é **uma** operação de Redis (um `MGET` das três chaves). O ritmo se
ajusta ao movimento:

| Tela | Intervalo |
|---|---|
| Telão, com doação no último minuto | 3 s |
| Telão parado | 12 s |
| Mesa de coleta | 15 s |
| Administração aberta | 5 s |

Um culto de três horas com o telão ligado o tempo todo fica na casa de **3 mil operações** —
folgado em qualquer plano gratuito. Aba escondida não consulta nada. Para mudar o ritmo,
ajuste as chamadas de `useConsultaPeriodica` em `src/telas.js`.

---

## Melhoria opcional: Tailwind compilado

O `index.html` carrega o Tailwind pelo CDN de desenvolvimento. Funciona em produção, mas
imprime um aviso no console e compila no navegador a cada carregamento (~400 KB). Num tablet
antigo dá para notar. Para trocar:

```bash
npm i -D tailwindcss@3
npx tailwindcss -i src/tailwind-entrada.css -o src/tailwind.css --minify
```

Com `src/tailwind-entrada.css` contendo as três diretivas (`@tailwind base;`
`@tailwind components;` `@tailwind utilities;`) e um `tailwind.config.js` na raiz repetindo o
bloco `theme.extend` que hoje está dentro do `index.html`. Depois troque o `<script
src="https://cdn.tailwindcss.com">` e o bloco de configuração por
`<link rel="stylesheet" href="src/tailwind.css">`, e acrescente o comando acima como *Build
Command* na Vercel.

---

## Limitações conhecidas

- **A senha do admin é compartilhada**, não é login por pessoa. Quem sabe a senha entra.
  Como o endereço é público, use uma senha longa: `1234` numa URL pública é um convite.
- **Sem histórico por culto.** O app guarda o total corrente, não o registro de cada doação.
  Se um dia você quiser relatório por culto, aí sim vale trocar o Redis por um banco
  relacional.
- **Ligue o armazenamento antes do primeiro culto.** Enquanto não há servidor, cada aparelho
  conta no próprio navegador. Quando o Redis entra, o servidor passa a ser a verdade e esses
  números locais **não sobem sozinhos** — é proposital, porque somá-los contaria em dobro o
  que dois aparelhos registraram. Se acontecer, use *Admin → Redefinir o total exato* uma vez.
- **A fila de doações não enviadas é por aba.** Se a rede cair e você fechar a aba do tablet
  antes de ela voltar, o que estava na fila se perde. Manter a fila compartilhada entre abas
  seria pior: a janela do telão tentaria enviá-la também e o contador subiria em dobro.
- **Redefinir o total descarta a fila** do aparelho onde o botão foi apertado. É o
  comportamento certo (o número digitado é o total final), mas vale saber.
- **Os logos são placeholders.** O ícone da garrafa em `src/ui.js` (componente `Marca`) e o
  favicon no `index.html` esperam a arte real da ADMVC e do programa VOLTA.
- **Confira as passagens.** Extraí os textos da NTLH da fonte, mas quem responde pela Palavra
  no púlpito é você — vale conferir duas ou três contra a sua Bíblia antes do primeiro culto.
- **Uma frase sem passagem não entra no telão.** Ela continua aparecendo no agradecimento do
  tablet; só fica de fora do rodízio da Palavra, que precisa de um versículo para mostrar.
#   v o l t a - a d m v c  
 #   v o l t a - a d m v c  
 
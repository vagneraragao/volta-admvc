// Estado da campanha e sincronia.
//
// Três camadas, empilhadas de baixo para cima:
//   1. localStorage        — pinta a tela no primeiro quadro e sobrevive a quedas de rede.
//   2. BroadcastChannel    — janelas do MESMO navegador se atualizam na hora, de graça.
//   3. /api/estado         — a verdade compartilhada entre aparelhos, quando existe.
//
// ── Onde uma garrafa é contada, e por quê ───────────────────────────────
// Existem dois mundos, e confundi-los conta doação duas vezes ou perde doação:
//
//   SEM servidor (`armazenamento === false`): não há para onde enviar, então o
//   toque entra direto em `totalServidor`, que vira o total local. Fica no
//   localStorage e é transmitido às outras janelas — é o modo offline puro.
//
//   COM servidor: o toque entra em `pendentes`, uma fila que esta aba envia e
//   baixa quando o servidor confirma. A fila vive no sessionStorage, que é
//   **por aba**: se fosse compartilhada, a janela do telão adotaria a fila da
//   mesa e as duas tentariam enviá-la — o contador subiria em dobro na frente
//   da igreja. Por isso ela também nunca é transmitida pelo BroadcastChannel.
//
// Enquanto ainda não se sabe se há servidor (`armazenamento === null`), o toque
// espera na fila; quando a resposta chega dizendo que não há, a fila é dobrada
// dentro do total local. Nada se perde nos dois casos.

export const CONFIG_PADRAO = {
  igreja: 'ADMVC',
  titulo: 'VOLTA',
  subtitulo: 'Campanha dos Retornáveis',
  chamada: 'Cada garrafa conta para a construção da nossa Nova Sede!',
  meta: 5000,
  segundosSlide: 10,
  versiculo: 'Se o Senhor não edificar a casa, em vão trabalham os que a edificam.',
  versiculoRef: 'Salmos 127.1',
  mensagens: [
    'Obrigado por doar {n} {garrafas}! Cada uma vira tijolo da nossa Nova Sede.',
    'Que Deus abençoe sua oferta de {n} {garrafas}! A obra avança com você.',
    '{n} {garrafas} a mais para a Nova Sede. Deus honra quem semeia com alegria!',
    'Sua contribuição de {n} {garrafas} já está levantando paredes. Obrigado!',
    'Recebemos {n} {garrafas}! Juntos estamos construindo a casa do Senhor.',
    'Obrigado! Com {n} {garrafas} você plantou hoje na obra da Nova Sede.',
    'Deus abençoe! {n} {garrafas} entregues com amor pela nossa igreja.',
  ],
};

/** Só vale no modo sem servidor. Com o Redis ligado, quem confere a senha é a
 *  função em api/estado.js, usando a variável SENHA_ADMIN. */
export const SENHA_LOCAL = '1234';

const CHAVE_ESTADO = 'volta-admvc/estado/v2';
const CHAVE_FILA = 'volta-admvc/fila/v2';      // sessionStorage: por aba, de propósito
const CHAVE_TOKEN = 'volta-admvc/token-mesa/v1';
const CHAVE_MODO = 'volta-admvc/modo/v1';
const NOME_CANAL = 'volta-admvc';
const ROTA_API = '/api/estado';

/* ── Utilidades ────────────────────────────────────────────────────────── */

export const fmt = (n) => new Intl.NumberFormat('pt-BR').format(Math.round(Number(n) || 0));

export function aplicarMensagem(modelo, n) {
  return String(modelo || '')
    .replace(/\{n\}/g, fmt(n))
    .replace(/\{garrafas\}/g, n === 1 ? 'garrafa' : 'garrafas')
    .replace(/\{s\}/g, n === 1 ? '' : 's');
}

export function menosMovimento() {
  try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; }
}

function ler(deposito, chave, alternativa) {
  try {
    const cru = deposito.getItem(chave);
    return cru ? JSON.parse(cru) : alternativa;
  } catch (e) { return alternativa; }
}

function gravar(deposito, chave, valor) {
  try { deposito.setItem(chave, JSON.stringify(valor)); return true; } catch (e) { return false; }
}

export const lerLS = (chave, alternativa) => ler(localStorage, chave, alternativa);
export const gravarLS = (chave, valor) => gravar(localStorage, chave, valor);

/* ── Estado ────────────────────────────────────────────────────────────── */

const salvo = lerLS(CHAVE_ESTADO, null) || {};

let estado = {
  config: Object.assign({}, CONFIG_PADRAO, salvo.config || {}),
  totalServidor: Number(salvo.totalServidor) || 0,
  pendentes: Number(ler(sessionStorage, CHAVE_FILA, 0)) || 0,
  versao: Number(salvo.versao) || 0,
  // null = ainda não perguntei · false = não existe servidor · true = existe
  armazenamento: salvo.viuServidor ? true : null,
  sync: 'iniciando',          // iniciando · nuvem · local · offline
  fotos: [],
  ultimaMudancaEm: 0,
};

const ouvintes = new Set();
let canal = null;
try { canal = new BroadcastChannel(NOME_CANAL); } catch (e) { canal = null; }

function notificar() { ouvintes.forEach((fn) => fn()); }

function persistir() {
  gravarLS(CHAVE_ESTADO, {
    config: estado.config,
    totalServidor: estado.totalServidor,
    versao: estado.versao,
    viuServidor: estado.armazenamento === true,
  });
  gravar(sessionStorage, CHAVE_FILA, estado.pendentes);
}

/** Troca o estado por um objeto novo — é a identidade que o React observa. */
function aplicar(parcial, opcoes) {
  const o = opcoes || {};
  estado = Object.assign({}, estado, parcial);
  if (o.persistir !== false) persistir();
  if (o.transmitir !== false && canal) {
    try {
      // `pendentes` fica de fora: é fila desta aba, não estado compartilhado.
      canal.postMessage({
        tipo: 'estado',
        config: estado.config,
        totalServidor: estado.totalServidor,
        versao: estado.versao,
      });
    } catch (e) { /* canal fechado */ }
  }
  notificar();
}

function adotarDeOutraAba(c) {
  aplicar({
    config: Object.assign({}, CONFIG_PADRAO, c.config || {}),
    totalServidor: Number(c.totalServidor) || 0,
    versao: Number(c.versao) || 0,
    ultimaMudancaEm: Date.now(),
  }, { transmitir: false });
}

if (canal) {
  canal.onmessage = (ev) => {
    const m = ev && ev.data;
    if (!m || m.tipo !== 'estado') return;
    adotarDeOutraAba(m);
  };
}

// Navegadores sem BroadcastChannel ainda ouvem o evento storage entre abas.
window.addEventListener('storage', (ev) => {
  if (ev.key !== CHAVE_ESTADO || !ev.newValue) return;
  try { adotarDeOutraAba(JSON.parse(ev.newValue)); } catch (e) { /* conteúdo inválido */ }
});

/* ── Conversa com a API ────────────────────────────────────────────────── */

async function chamar(metodo, corpo) {
  const resposta = await fetch(ROTA_API, {
    method: metodo,
    headers: corpo ? { 'Content-Type': 'application/json' } : undefined,
    body: corpo ? JSON.stringify(corpo) : undefined,
    cache: 'no-store',
  });
  const dados = await resposta.json().catch(() => null);
  if (!resposta.ok) {
    const e = new Error((dados && dados.erro) || 'Falha ao falar com o servidor.');
    e.status = resposta.status;
    throw e;
  }
  return dados || {};
}

let enviando = false;
let timerEnvio = null;
let esperaErro = 1000;

/** Manda a fila inteira numa chamada só e reconcilia com o total do servidor. */
async function enviarFila() {
  if (enviando || estado.armazenamento !== true || estado.pendentes === 0) return;
  const emVoo = estado.pendentes;
  enviando = true;
  try {
    const r = await chamar('POST', { acao: 'somar', n: emVoo, token: Loja.tokenMesa() });
    esperaErro = 1000;
    aplicar({
      totalServidor: Number(r.total) || 0,
      pendentes: estado.pendentes - emVoo,   // toques feitos durante o envio continuam na fila
      versao: Number(r.versao) || 0,
      sync: 'nuvem',
      ultimaMudancaEm: Date.now(),
    });
    if (estado.pendentes !== 0) agendar(300);
  } catch (e) {
    // A fila fica intacta: nada se perde, tenta de novo com espera crescente.
    aplicar({ sync: 'offline' }, { transmitir: false });
    esperaErro = Math.min(esperaErro * 2, 30000);
    agendar(esperaErro);
  } finally {
    enviando = false;
  }
}

function agendar(atraso) {
  clearTimeout(timerEnvio);
  timerEnvio = setTimeout(enviarFila, atraso == null ? 700 : atraso);
}

/** Descobriu-se que não há servidor: o que estava na fila vira total local. */
function dobrarFilaNoTotal(parcial) {
  if (estado.pendentes === 0) return parcial;
  return Object.assign({}, parcial, {
    totalServidor: estado.totalServidor + estado.pendentes,
    pendentes: 0,
  });
}

/* ── API pública ───────────────────────────────────────────────────────── */

export const Loja = {
  obter: () => estado,
  assinar: (fn) => { ouvintes.add(fn); return () => ouvintes.delete(fn); },

  total: () => Math.max(0, estado.totalServidor + estado.pendentes),

  tokenMesa() {
    try { return localStorage.getItem(CHAVE_TOKEN) || ''; } catch (e) { return ''; }
  },
  definirTokenMesa(valor) {
    try { localStorage.setItem(CHAVE_TOKEN, String(valor || '')); } catch (e) { /* sem espaço */ }
  },

  modo: () => lerLS(CHAVE_MODO, null),
  definirModo(m) { gravarLS(CHAVE_MODO, m); },

  /** Registra a doação na hora. Para onde ela vai depende de haver servidor. */
  somar(n) {
    const atual = Loja.total();
    const passo = atual + n < 0 ? -atual : n;   // a campanha nunca fica negativa
    if (passo === 0) return;
    if (estado.armazenamento === false) {
      aplicar({ totalServidor: estado.totalServidor + passo, ultimaMudancaEm: Date.now() });
      return;
    }
    aplicar({ pendentes: estado.pendentes + passo, ultimaMudancaEm: Date.now() }, { transmitir: false });
    agendar();
  },

  /** Lê o estado compartilhado. Chamada periodicamente por cada tela. */
  async consultar() {
    try {
      const r = await chamar('GET');

      if (r.armazenamento === false) {
        if (estado.armazenamento !== false) {
          aplicar(dobrarFilaNoTotal({ armazenamento: false, sync: 'local' }));
        }
        return;
      }

      const parcial = { armazenamento: true, sync: 'nuvem' };
      if (r.config) parcial.config = Object.assign({}, CONFIG_PADRAO, r.config);
      // Enquanto uma remessa está no ar, o total do servidor já pode incluí-la
      // sem que a fila tenha sido baixada: ignorar evita contar duas vezes.
      if (!enviando) {
        const novoTotal = Number(r.total) || 0;
        if (novoTotal !== estado.totalServidor) parcial.ultimaMudancaEm = Date.now();
        parcial.totalServidor = novoTotal;
        parcial.versao = Number(r.versao) || 0;
      }
      aplicar(parcial, { transmitir: false });
      if (estado.pendentes !== 0) agendar(200);
    } catch (e) {
      // Nunca vi servidor nenhum (site estático, ou aberto fora de um servidor):
      // este é o modo local puro. Já vi antes: é queda passageira, a fila espera.
      if (estado.armazenamento === true) {
        if (estado.sync !== 'offline') aplicar({ sync: 'offline' }, { transmitir: false });
      } else if (estado.armazenamento !== false) {
        aplicar(dobrarFilaNoTotal({ armazenamento: false, sync: 'local' }));
      }
    }
  },

  async verificarSenha(senha) {
    if (estado.armazenamento !== true) return String(senha || '') === SENHA_LOCAL;
    try {
      await chamar('POST', { acao: 'verificarSenha', senha: senha });
      return true;
    } catch (e) {
      return false;
    }
  },

  async salvarConfig(parcial, senha) {
    const config = Object.assign({}, estado.config, parcial);
    aplicar({ config: config });
    if (estado.armazenamento !== true) return;
    // Se falhar, a próxima consulta traz a configuração do servidor de volta.
    await chamar('POST', { acao: 'config', config: config, senha: senha });
    aplicar({ ultimaMudancaEm: Date.now() }, { transmitir: false });
  },

  async redefinirTotal(valor, senha) {
    const alvo = Math.max(0, Math.round(Number(valor) || 0));
    if (estado.armazenamento !== true) {
      aplicar({ totalServidor: alvo, pendentes: 0, ultimaMudancaEm: Date.now() });
      return;
    }
    // A fila desta aba é descartada de propósito: o número digitado é o total final.
    const r = await chamar('POST', { acao: 'redefinir', valor: alvo, senha: senha });
    aplicar({
      totalServidor: Number(r.total) || 0,
      pendentes: 0,
      versao: Number(r.versao) || 0,
      sync: 'nuvem',
      ultimaMudancaEm: Date.now(),
    });
  },

  ajustarTotal(delta, senha) {
    return Loja.redefinirTotal(Loja.total() + Math.round(Number(delta) || 0), senha);
  },

  /** Fotos são arquivos versionados em fotos/, descritos em fotos/lista.json. */
  async carregarFotos() {
    try {
      const r = await fetch('fotos/lista.json', { cache: 'no-cache' });
      if (!r.ok) return;
      const bruto = await r.json();
      if (!Array.isArray(bruto)) return;
      const fotos = bruto
        .map((item) => (typeof item === 'string'
          ? { arquivo: item, legenda: '' }
          : { arquivo: String((item && item.arquivo) || ''), legenda: String((item && item.legenda) || '') }))
        .filter((f) => f.arquivo);
      aplicar({ fotos: fotos }, { persistir: false, transmitir: false });
    } catch (e) { /* lista ausente ou fora de um servidor — o telão fica só no contador */ }
  },
};

Loja.carregarFotos();
Loja.consultar();

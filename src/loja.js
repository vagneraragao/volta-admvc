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

// As passagens estão na NTLH e foram conferidas no texto, não escritas de
// memória. A assinatura da campanha — "Tudo vem dEle, tudo volta pra Ele" —
// é 1 Crônicas 29.14 em palavras de hoje, e traz o nome da campanha dentro
// dela: tudo VOLTA. Por isso essa passagem é o versículo fixo das telas.
import { MENSAGENS_PADRAO } from './mensagens.js';
import { CAMPANHAS } from './campanhas.js';

export const CONFIG_PADRAO = {
  igreja: 'Igreja ADMVC',
  cidade: 'Figueira da Foz',
  titulo: 'VOLTA',
  subtitulo: 'Campanha dos Retornáveis',
  tagline: 'Tudo vem dEle, tudo volta pra Ele.',
  chamada: 'Cada garrafa conta para a construção da nossa Nova Sede!',
  meta: 5000,
  segundosSlide: 10,
  segundosAgradecimento: 10,
  segundosRepouso: 30,
  traducao: 'NTLH',
  versiculo: 'Tudo vem de ti, e nós somente devolvemos o que já era teu.',
  versiculoRef: '1 Crônicas 29.14',
  mensagens: MENSAGENS_PADRAO,


};


/** Aceita o formato antigo (texto puro) sem quebrar o que já está gravado no
 *  Redis em produção — vira `{ texto }` e ganha os campos vazios. */
export function normalizarMensagens(lista) {
  if (!Array.isArray(lista)) return CONFIG_PADRAO.mensagens;
  const limpas = lista
    .map((m) => {
      if (typeof m === 'string') return { texto: m, versiculo: '', ref: '' };
      if (!m || typeof m !== 'object') return null;
      return {
        texto: String(m.texto || ''),
        versiculo: String(m.versiculo || ''),
        ref: String(m.ref || ''),
      };
    })
    .filter((m) => m && m.texto.trim());
  return limpas.length ? limpas : CONFIG_PADRAO.mensagens;
}

/** Ponto único de junção da configuração: tudo que chega de fora — do
 *  localStorage, de outra aba ou do servidor — passa por aqui. */
export function mesclarConfig(bruta) {
  const c = Object.assign({}, CONFIG_PADRAO, bruta || {});
  c.mensagens = normalizarMensagens(c.mensagens);
  return c;
}

/** Só vale no modo sem servidor. Com o Redis ligado, quem confere a senha é a
 *  função em api/estado.js, usando a variável SENHA_ADMIN. */
export const SENHA_LOCAL = '1234';

// A v2 guardava a assinatura antiga da campanha, e configuração salva vence o
// padrão do código — daí a v3. Mas o total coletado mora na MESMA chave, então
// trocar a versão sem mais nada joga a contagem fora junto. Por isso a v3 herda
// os números da v2 e descarta só a configuração.
const CHAVE_ESTADO = 'volta-admvc/estado/v3';
const CHAVE_ESTADO_V2 = 'volta-admvc/estado/v2';
const CHAVE_FILA = 'volta-admvc/fila/v2';      // sessionStorage: por aba, de propósito
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

/** Carrega o estado guardado. Na primeira abertura depois da subida para a v3,
 *  herda os NÚMEROS da v2 — o total coletado é dado do usuário, não pode ser
 *  descartado por uma troca de versão — e deixa a configuração antiga para trás,
 *  que era o motivo da subida. */
function carregarSalvo() {
  const v3 = lerLS(CHAVE_ESTADO, null);

  // `migradoV2` é a marca de que a herança já aconteceu. Sem ela, um contador
  // zerado de propósito pelo painel voltaria do túmulo a cada recarga.
  if (v3 && v3.migradoV2) return v3;

  const v2 = lerLS(CHAVE_ESTADO_V2, null);
  const totalAntigo = v2 ? Number(v2.totalServidor) || 0 : 0;

  if (!v3) {
    return {
      migradoV2: true,
      totalServidor: totalAntigo,
      versao: v2 ? Number(v2.versao) || 0 : 0,
      viuServidor: v2 ? v2.viuServidor : false,
      // `config` fica de fora de propósito: era o motivo da subida de versão.
    };
  }

  // A v3 já existia sem ter migrado — é o caso de quem abriu a página entre a
  // subida de versão e esta correção, e viu a contagem zerar.
  return Object.assign({}, v3, {
    migradoV2: true,
    totalServidor: Math.max(Number(v3.totalServidor) || 0, totalAntigo),
  });
}

const salvo = carregarSalvo();

/** Um campo de estado por campanha do registro, normalizado. */
function camposDasCampanhas(origem) {
  const out = {};
  CAMPANHAS.forEach((c) => { out[c.campo] = c.mesclar((origem || {})[c.campo]); });
  return out;
}

let estado = {
  config: mesclarConfig(salvo.config),
  ...camposDasCampanhas(salvo),
  totalServidor: Number(salvo.totalServidor) || 0,
  pendentes: Number(ler(sessionStorage, CHAVE_FILA, 0)) || 0,
  versao: Number(salvo.versao) || 0,
  // null = ainda não perguntei · false = não existe servidor · true = existe
  armazenamento: salvo.viuServidor ? true : null,
  sync: 'iniciando',          // iniciando · nuvem · local · offline
  fotos: [],
  fotosObra: [],
  ultimaMudancaEm: 0,
};

const ouvintes = new Set();
let canal = null;
try { canal = new BroadcastChannel(NOME_CANAL); } catch (e) { canal = null; }

function notificar() { ouvintes.forEach((fn) => fn()); }

function persistir() {
  gravarLS(CHAVE_ESTADO, {
    config: estado.config,
    ...camposDasCampanhas(estado),
    totalServidor: estado.totalServidor,
    versao: estado.versao,
    viuServidor: estado.armazenamento === true,
    migradoV2: true,
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
        ...camposDasCampanhas(estado),
        totalServidor: estado.totalServidor,
        versao: estado.versao,
      });
    } catch (e) { /* canal fechado */ }
  }
  notificar();
}

function adotarDeOutraAba(c) {
  aplicar({
    config: mesclarConfig(c.config),
    ...camposDasCampanhas(c),
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
    const r = await chamar('POST', { acao: 'somar', n: emVoo });
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
      if (r.config) parcial.config = mesclarConfig(r.config);
      CAMPANHAS.forEach((c) => { if (r[c.campo]) parcial[c.campo] = c.mesclar(r[c.campo]); });
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

  /** Grava uma campanha do registro. `campo` vem de CAMPANHAS, não do
   *  chamador, então não há como pedir a escrita de uma chave arbitrária. */
  async salvarCampanha(campo, parcial, senha) {
    const def = CAMPANHAS.find((c) => c.campo === campo);
    if (!def) throw new Error('Campanha desconhecida: ' + campo);

    const dados = def.mesclar(Object.assign({}, estado[campo], parcial));
    const parcialEstado = {};
    parcialEstado[campo] = dados;
    aplicar(parcialEstado);

    if (estado.armazenamento !== true) return;
    // Se falhar, a próxima consulta traz os dados do servidor de volta.
    await chamar('POST', { acao: 'guardar', campanha: campo, dados: dados, senha: senha });
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

  /** Fotos são arquivos versionados, descritos numa lista JSON ao lado delas.
   *  Duas campanhas, duas listas: fotos/ para o VOLTA e fotos/obra/ para a
   *  construção, que tem as imagens do projeto. */
  async carregarFotos() {
    await Promise.all([
      Loja._lerLista('fotos/lista.json', 'fotos', ''),
      Loja._lerLista('fotos/obra/lista.json', 'fotosObra', 'obra/'),
    ]);
  },

  async _lerLista(caminho, campo, prefixo) {
    try {
      const r = await fetch(caminho, { cache: 'no-cache' });
      if (!r.ok) return;
      const bruto = await r.json();
      if (!Array.isArray(bruto)) return;
      const fotos = bruto
        .map((item) => (typeof item === 'string'
          ? { arquivo: prefixo + item, legenda: '' }
          : { arquivo: prefixo + String((item && item.arquivo) || ''), legenda: String((item && item.legenda) || '') }))
        .filter((f) => f.arquivo !== prefixo);
      const parcial = {};
      parcial[campo] = fotos;
      aplicar(parcial, { persistir: false, transmitir: false });
    } catch (e) { /* lista ausente ou fora de um servidor — a tela fica só no contador */ }
  },
};

Loja.carregarFotos();
Loja.consultar();

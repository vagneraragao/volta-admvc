// Função serverless da Vercel — Node.js, CommonJS, sem nenhuma dependência.
//
// Guarda o estado da campanha no Upstash Redis pela API REST. Aceita tanto as
// variáveis do Upstash quanto as do Vercel KV, porque os dois falam o mesmo
// protocolo e a integração que você escolher define um par ou o outro.
//
// Sem as variáveis configuradas, responde `armazenamento: false` em vez de dar
// erro: o app entende isso e segue funcionando só com o localStorage.

const CHAVE_TOTAL = 'volta:total';
const CHAVE_CONFIG = 'volta:config';
const CHAVE_VERSAO = 'volta:versao';
// Lista branca das campanhas. Sem ela, um POST poderia mandar gravar em
// QUALQUER chave do banco — inclusive sobrescrever volta:total com lixo.
// O cliente manda o nome da campanha; quem escolhe a chave é este mapa.
const CAMPANHAS = {
  obra: 'volta:obra',
  carnes: 'volta:carnes',
  cofrinhos: 'volta:cofrinhos',
};
const CHAVES_CAMPANHAS = Object.keys(CAMPANHAS).map((k) => CAMPANHAS[k]);

const LIMITE_POR_TOQUE = 25;       // trava um POST absurdo vindo de fora
const LIMITE_CONFIG_BYTES = 32768; // a configuração é pequena; isso é folga

function credenciais() {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || '';
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || '';
  if (!url || !token) return null;
  return { url: url.replace(/\/+$/, ''), token: token };
}

/** Um comando: POST no endpoint raiz com o comando como array JSON. */
async function comando(cred, cmd) {
  const resposta = await fetch(cred.url, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + cred.token, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmd),
  });
  const corpo = await resposta.json().catch(() => null);
  if (!resposta.ok || !corpo || corpo.error) {
    throw new Error((corpo && corpo.error) || 'o armazenamento respondeu ' + resposta.status);
  }
  return corpo.result;
}

/** Vários comandos numa viagem só. Não é atômico — e não precisa ser aqui,
 *  porque o INCRBY do total já é indivisível por si. */
async function lote(cred, cmds) {
  const resposta = await fetch(cred.url + '/pipeline', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + cred.token, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmds),
  });
  const corpo = await resposta.json().catch(() => null);
  if (!resposta.ok || !Array.isArray(corpo)) {
    throw new Error('o armazenamento respondeu ' + resposta.status);
  }
  const falha = corpo.find((r) => r && r.error);
  if (falha) throw new Error(falha.error);
  return corpo.map((r) => r.result);
}

function lerCorpo(req) {
  // req.body é um getter que lança quando o JSON chega malformado.
  let c;
  try { c = req.body; } catch (e) { return {}; }
  if (typeof c === 'string') {
    try { c = JSON.parse(c); } catch (e) { c = null; }
  }
  return c && typeof c === 'object' && !Array.isArray(c) ? c : {};
}

function jsonOuNulo(texto) {
  if (typeof texto !== 'string') return null;
  try { return JSON.parse(texto); } catch (e) { return null; }
}

function senhaCorreta(enviada) {
  const esperada = process.env.SENHA_ADMIN || '1234';
  return String(enviada || '') === esperada;
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');

  const cred = credenciais();
  if (!cred) {
    // Nada configurado ainda. Não é erro: o app cai no modo local.
    return res.status(200).json({
      armazenamento: false,
      motivo: 'Nenhum armazenamento configurado. Defina UPSTASH_REDIS_REST_URL e UPSTASH_REDIS_REST_TOKEN (ou as equivalentes do Vercel KV).',
    });
  }

  try {
    if (req.method === 'GET') {
      // Um MGET só: uma operação de Redis por consulta, independente de
      // quantas campanhas existam.
      const nomes = Object.keys(CAMPANHAS);
      const valores = await comando(
        cred, ['MGET', CHAVE_TOTAL, CHAVE_CONFIG, CHAVE_VERSAO].concat(CHAVES_CAMPANHAS)
      );
      const resposta = {
        armazenamento: true,
        total: Number(valores[0]) || 0,
        config: jsonOuNulo(valores[1]),
        versao: Number(valores[2]) || 0,
      };
      nomes.forEach((nome, i) => { resposta[nome] = jsonOuNulo(valores[3 + i]); });
      return res.status(200).json(resposta);
    }

    if (req.method === 'POST') {
      const corpo = lerCorpo(req);
      const acao = String(corpo.acao || '');

      if (acao === 'somar') {
        // Sem token: o endpoint é aberto a quem tem o link. O limite baixo por
        // requisição é a defesa — inflar o contador de forma perceptível
        // exigiria milhares de chamadas, e o painel corrige o total em segundos.
        const n = Math.trunc(Number(corpo.n));
        if (!Number.isFinite(n) || n === 0 || Math.abs(n) > LIMITE_POR_TOQUE) {
          return res.status(400).json({ erro: 'Quantidade inválida.' });
        }
        let [total, versao] = await lote(cred, [['INCRBY', CHAVE_TOTAL, n], ['INCR', CHAVE_VERSAO]]);
        total = Number(total) || 0;
        if (total < 0) {
          // Correções manuais não podem deixar a campanha negativa.
          await comando(cred, ['SET', CHAVE_TOTAL, '0']);
          total = 0;
        }
        return res.status(200).json({ armazenamento: true, total: total, versao: Number(versao) || 0 });
      }

      if (acao === 'verificarSenha') {
        if (!senhaCorreta(corpo.senha)) return res.status(401).json({ erro: 'Senha incorreta.' });
        return res.status(200).json({ ok: true });
      }

      if (acao === 'redefinir') {
        if (!senhaCorreta(corpo.senha)) return res.status(401).json({ erro: 'Senha incorreta.' });
        const valor = Math.max(0, Math.trunc(Number(corpo.valor)));
        if (!Number.isFinite(valor)) return res.status(400).json({ erro: 'Valor inválido.' });
        const [, versao] = await lote(cred, [['SET', CHAVE_TOTAL, String(valor)], ['INCR', CHAVE_VERSAO]]);
        return res.status(200).json({ armazenamento: true, total: valor, versao: Number(versao) || 0 });
      }

      if (acao === 'guardar') {
        if (!senhaCorreta(corpo.senha)) return res.status(401).json({ erro: 'Senha incorreta.' });
        const chave = CAMPANHAS[String(corpo.campanha || '')];
        if (!chave) return res.status(400).json({ erro: 'Campanha desconhecida.' });

        const dados = corpo.dados;
        if (!dados || typeof dados !== 'object' || Array.isArray(dados)) {
          return res.status(400).json({ erro: 'Dados da campanha inválidos.' });
        }
        const texto = JSON.stringify(dados);
        if (texto.length > LIMITE_CONFIG_BYTES) {
          return res.status(413).json({ erro: 'Dados da campanha grandes demais.' });
        }
        const [, versao] = await lote(cred, [['SET', chave, texto], ['INCR', CHAVE_VERSAO]]);
        return res.status(200).json({ armazenamento: true, versao: Number(versao) || 0 });
      }

      if (acao === 'config') {
        if (!senhaCorreta(corpo.senha)) return res.status(401).json({ erro: 'Senha incorreta.' });
        const config = corpo.config;
        if (!config || typeof config !== 'object' || Array.isArray(config)) {
          return res.status(400).json({ erro: 'Configuração inválida.' });
        }
        const texto = JSON.stringify(config);
        if (texto.length > LIMITE_CONFIG_BYTES) {
          return res.status(413).json({ erro: 'Configuração grande demais.' });
        }
        const [, versao] = await lote(cred, [['SET', CHAVE_CONFIG, texto], ['INCR', CHAVE_VERSAO]]);
        return res.status(200).json({ armazenamento: true, versao: Number(versao) || 0 });
      }

      return res.status(400).json({ erro: 'Ação desconhecida.' });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ erro: 'Método não permitido.' });
  } catch (e) {
    return res.status(502).json({
      erro: 'Não consegui falar com o armazenamento.',
      detalhe: e && e.message ? e.message : String(e),
    });
  }
};

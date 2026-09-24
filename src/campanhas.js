// As quatro campanhas da obra, num registro só.
//
//   1. garrafas    retornáveis contados no tablet   (contador próprio, na loja.js)
//   2. obra        euros convertidos em tijolos      volta:obra
//   3. carnes      carnês retirados e valor pago     volta:carnes
//   4. cofrinhos   entregues, devolvidos e valor     volta:cofrinhos
//
// Cada campanha declara aqui a sua chave no Redis, os seus padrões e a sua
// normalização. Tudo o que precisa saber "quais campanhas existem" — a API, a
// loja, o painel — lê deste arquivo, e não de uma lista repetida em cinco
// lugares que uma hora sai do ar em um deles.
//
// As garrafas ficam de fora do registro de propósito: o contador delas é um
// inteiro com INCRBY atômico, não um documento JSON, e misturar as duas coisas
// tornaria o registro uma mentira conveniente.

/* ── 2. Tijolos ────────────────────────────────────────────────────────
   A contabilidade dos cartazes em img/: a obra é dividida em tijolos
   simbólicos de valor fixo, e cada valor arrecadado assenta um tijolo.

     200.000 € de obra ÷ 1.000 € por tijolo = 200 tijolos
     9.000 € arrecadados ÷ 1.000 €          = 9 assentados
     200 − 9                                 = 191 a faltar
     9.000 / 200.000                         = 4,5 %

   As três linhas do cartaz fecham exatamente com essa regra, por isso ela é a
   fonte única: o dinheiro é o dado real e os tijolos saem dele. Guardar as
   duas contas lado a lado seria convidá-las a discordar. */

export const OBRA_PADRAO = {
  titulo: 'Construção da nossa Igreja',
  subtitulo: 'Juntos por um grande propósito',
  moeda: '€',
  valorObra: 200000,
  valorTijolo: 1000,
  arrecadado: 9000,
  contribuintes: 9,
  chamada: 'Juntos, vamos construir um lugar de adoração, comunhão e alcance para a nossa cidade.',
  assinatura: 'Cada tijolo faz a diferença!',
  rodape: 'Mais do que uma igreja, uma família.',
  versiculo: 'Não nos cansemos de fazer o bem. Pois, se não desanimarmos, chegará o tempo certo em que faremos a colheita.',
  versiculoRef: 'Gálatas 6.9',
};

export function mesclarObra(bruta) {
  const o = Object.assign({}, OBRA_PADRAO, bruta || {});
  o.valorObra = Math.max(0, Number(o.valorObra) || 0);
  o.valorTijolo = Math.max(1, Number(o.valorTijolo) || 1);
  o.arrecadado = Math.max(0, Number(o.arrecadado) || 0);
  o.contribuintes = Math.max(0, Math.round(Number(o.contribuintes) || 0));
  return o;
}

/** Os números derivados do dinheiro. Um lugar só faz essa conta. */
export function contasDaObra(obra) {
  const o = mesclarObra(obra);
  const totalTijolos = Math.max(1, Math.round(o.valorObra / o.valorTijolo));
  // Piso: só conta tijolo inteiro. Meio tijolo não se assenta na parede.
  const colocados = Math.min(totalTijolos, Math.floor(o.arrecadado / o.valorTijolo));
  return {
    obra: o,
    totalTijolos: totalTijolos,
    colocados: colocados,
    faltam: Math.max(0, totalTijolos - colocados),
    pct: o.valorObra > 0 ? Math.min(100, (o.arrecadado / o.valorObra) * 100) : 0,
    falta: Math.max(0, o.valorObra - o.arrecadado),
  };
}

/* ── 3. Carnês ─────────────────────────────────────────────────────────
   Do cartaz img/img5.jpg. Quatro planos em cupons coloridos, dez parcelas
   cada. Os planos são ILUSTRAÇÃO: a contabilidade são dois números que a
   liderança lança à mão — quantos carnês saíram e quanto já entrou.

   Os valores de Propósito e Davi estavam ilegíveis no cartaz e ficam em zero
   até você preenchê-los no painel; um plano com valor zero aparece sem preço
   no cupom, em vez de anunciar "€ 0". */

export const CARNES_PADRAO = {
  titulo: 'Carnês ADMVC',
  guardaChuva: 'Estamos em uma grande obra e não podemos parar!',
  moeda: '€',
  parcelas: 10,
  retirados: 0,
  arrecadado: 0,
  planos: [
    { nome: 'Plano Salomão', valor: 50, cor: '#2B4C9B' },
    { nome: 'Plano Propósito', valor: 0, cor: '#C0392B' },
    { nome: 'Plano Davi', valor: 0, cor: '#27904A' },
    { nome: 'Plano Neemias', valor: 30, cor: '#D9A441' },
  ],
  passos: [
    'Informe a sua disponibilidade mensal para apoiar a obra',
    'Informe seu nome e retire o carnê no dia seguinte',
    'Você escolhe a data de pagamento de cada uma das 10 parcelas',
  ],
  versiculo: 'Que cada um dê a sua oferta conforme resolveu no seu coração.',
  versiculoRef: '2 Coríntios 9.7',
};

export function mesclarCarnes(bruta) {
  const c = Object.assign({}, CARNES_PADRAO, bruta || {});
  c.parcelas = Math.max(1, Math.round(Number(c.parcelas) || 10));
  c.retirados = Math.max(0, Math.round(Number(c.retirados) || 0));
  c.arrecadado = Math.max(0, Number(c.arrecadado) || 0);
  c.planos = (Array.isArray(c.planos) ? c.planos : CARNES_PADRAO.planos)
    .map((p, i) => ({
      nome: String((p && p.nome) || 'Plano ' + (i + 1)),
      valor: Math.max(0, Number(p && p.valor) || 0),
      cor: String((p && p.cor) || '#2B4C9B'),
    }));
  c.passos = (Array.isArray(c.passos) ? c.passos : CARNES_PADRAO.passos).map(String);
  return c;
}

export function contasDosCarnes(bruta) {
  const c = mesclarCarnes(bruta);
  // O compromisso é uma estimativa, não uma promessa: só faz sentido quando os
  // planos têm preço, e vale a média deles porque não guardamos quantos carnês
  // de cada plano saíram. Por isso a tela o rotula como "previsto".
  const comPreco = c.planos.filter((p) => p.valor > 0);
  const media = comPreco.length
    ? comPreco.reduce((s, p) => s + p.valor, 0) / comPreco.length
    : 0;
  const previsto = c.retirados * media * c.parcelas;
  return {
    carnes: c,
    mediaParcela: media,
    previsto: previsto,
    pct: previsto > 0 ? Math.min(100, (c.arrecadado / previsto) * 100) : 0,
    temPrevisao: previsto > 0,
  };
}

/* ── 4. Cofrinhos ──────────────────────────────────────────────────────
   Do cartaz img/img3.jpg. Caixinhas levadas para casa por três meses. Numa
   campanha de prazo, o número que conta não é só o dinheiro: é quantas ainda
   estão na rua, porque é isso que a equipe precisa ir buscar. */

export const COFRINHOS_PADRAO = {
  titulo: 'Escolha um cofrinho',
  guardaChuva: 'Estamos em uma grande obra e não podemos parar!',
  moeda: '€',
  meses: 3,
  entregues: 0,
  devolvidos: 0,
  arrecadado: 0,
  passos: [
    'Informe o seu nome',
    'Leve pra casa por 3 meses',
    'Devolva cheio até 3 meses',
  ],
  versiculo: 'Cada um deve dar conforme tiver decidido no coração.',
  versiculoRef: '2 Coríntios 9.7',
};

export function mesclarCofrinhos(bruta) {
  const c = Object.assign({}, COFRINHOS_PADRAO, bruta || {});
  c.meses = Math.max(1, Math.round(Number(c.meses) || 3));
  c.entregues = Math.max(0, Math.round(Number(c.entregues) || 0));
  // Não se devolve mais do que saiu: a trava evita um erro de digitação virar
  // "120 % de retorno" no telão, na frente da igreja.
  c.devolvidos = Math.min(c.entregues, Math.max(0, Math.round(Number(c.devolvidos) || 0)));
  c.arrecadado = Math.max(0, Number(c.arrecadado) || 0);
  c.passos = (Array.isArray(c.passos) ? c.passos : COFRINHOS_PADRAO.passos).map(String);
  return c;
}

export function contasDosCofrinhos(bruta) {
  const c = mesclarCofrinhos(bruta);
  return {
    cofrinhos: c,
    naRua: Math.max(0, c.entregues - c.devolvidos),
    pct: c.entregues > 0 ? Math.min(100, (c.devolvidos / c.entregues) * 100) : 0,
    mediaPorCofrinho: c.devolvidos > 0 ? c.arrecadado / c.devolvidos : 0,
  };
}

/* ── Registro ──────────────────────────────────────────────────────────
   A lista única. A API usa `chave` para montar o MGET e a lista branca de
   escrita; a loja usa `campo` e `mesclar` para guardar o estado; o painel usa
   `rotulo` e `rota`. Acrescentar uma quinta campanha é acrescentar uma linha
   aqui e escrever a tela dela. */

export const CAMPANHAS = [
  { campo: 'obra', chave: 'volta:obra', rota: 'obra', rotulo: 'Construção', mesclar: mesclarObra, padrao: OBRA_PADRAO },
  { campo: 'carnes', chave: 'volta:carnes', rota: 'carnes', rotulo: 'Carnês', mesclar: mesclarCarnes, padrao: CARNES_PADRAO },
  { campo: 'cofrinhos', chave: 'volta:cofrinhos', rota: 'cofrinhos', rotulo: 'Cofrinhos', mesclar: mesclarCofrinhos, padrao: COFRINHOS_PADRAO },
];

export function moeda(valor, simbolo) {
  const n = new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 0 }).format(Math.round(Number(valor) || 0));
  return (simbolo || '€') + ' ' + n;
}

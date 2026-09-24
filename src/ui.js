// Peças visuais compartilhadas pelas três telas.
// React, ReactDOM e htm chegam como globais pelos <script> do index.html.

import { Loja, fmt, menosMovimento } from './loja.js';
import { caminhoDe } from './rotas.js';

export const html = htm.bind(React.createElement);
export const { useState, useEffect, useRef, useCallback } = React;

/* ── Link de navegação ─────────────────────────────────────────────────
   É uma âncora de verdade, com href real: dá para passar o mouse e ver o
   endereço, abrir em nova janela com o botão do meio — útil para jogar o
   telão numa segunda tela — ou salvar nos favoritos. O clique normal é
   interceptado para trocar de tela sem recarregar. */

export function Link({ para, irPara, className, rotulo, children }) {
  return html`
    <a
      href=${caminhoDe(para)}
      className=${className}
      aria-label=${rotulo}
      onClick=${(ev) => {
        // Deixa o navegador cuidar de ctrl/cmd/shift-clique e do botão do meio.
        if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey || ev.button !== 0) return;
        ev.preventDefault();
        irPara(para);
      }}
    >${children}</a>
  `;
}

/* ── Contador que sobe animado ─────────────────────────────────────────── */

export function NumeroAnimado({ valor, className }) {
  const [mostrado, setMostrado] = useState(valor);
  const atual = useRef(valor);
  const raf = useRef(0);

  useEffect(() => {
    const de = atual.current;
    const para = Number(valor) || 0;
    if (de === para) return;
    if (menosMovimento()) { atual.current = para; setMostrado(para); return; }

    cancelAnimationFrame(raf.current);
    const t0 = performance.now();
    const duracao = Math.min(1100, 300 + Math.abs(para - de) * 18);
    const passo = (t) => {
      const p = Math.min(1, (t - t0) / duracao);
      const suave = 1 - Math.pow(1 - p, 3);
      const v = Math.round(de + (para - de) * suave);
      atual.current = v;
      setMostrado(v);
      if (p < 1) raf.current = requestAnimationFrame(passo);
    };
    raf.current = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(raf.current);
  }, [valor]);

  return html`<span className=${'num ' + (className || '')}>${fmt(mostrado)}</span>`;
}

/* ── Barra de progresso ────────────────────────────────────────────────── */

export function BarraProgresso({ pct, alto, escuro }) {
  const largura = Math.max(0, Math.min(100, pct));
  const batida = pct >= 100;
  return html`
    <div
      className=${'w-full overflow-hidden rounded-full ' + (alto ? 'h-8 md:h-12' : 'h-4') + ' ' + (escuro ? 'bg-noite-3' : 'bg-creme-2')}
      role="progressbar"
      aria-valuenow=${Math.round(pct)}
      aria-valuemin="0"
      aria-valuemax="100"
      aria-label="Progresso da meta"
    >
      <div
        className=${'h-full rounded-full barra-vidro transition-[width] duration-700 ease-out ' + (batida ? 'bg-white' : 'bg-ciano')}
        style=${{ width: largura + '%' }}
      ></div>
    </div>
  `;
}

/* ── Selo de sincronia ─────────────────────────────────────────────────── */

export function SeloSync({ sync, escuro }) {
  const mapa = {
    iniciando: { texto: 'conectando', ponto: 'bg-tinta-suave' },
    nuvem: { texto: 'sincronizado', ponto: 'bg-ciano' },
    local: { texto: 'somente neste aparelho', ponto: 'bg-tinta-suave' },
    offline: { texto: 'sem conexão', ponto: 'bg-ciano-2' },
  };
  const s = mapa[sync] || mapa.iniciando;
  return html`
    <span className=${'inline-flex items-center gap-2 text-[11px] rotulo ' + (escuro ? 'text-creme/60' : 'text-tinta-suave')}>
      <span className=${'inline-block w-2 h-2 rounded-full ' + s.ponto}></span>${s.texto}
    </span>
  `;
}

/* ── Relógio ───────────────────────────────────────────────────────────
   Bate de segundo em segundo mas só redesenha quando o texto muda, então
   custa quase nada e nunca mostra um minuto atrasado. */

export function Relogio({ className, escuro }) {
  const formata = () => new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
  const [hora, setHora] = useState(formata);

  useEffect(() => {
    const t = setInterval(() => {
      const agora = formata();
      setHora((anterior) => (anterior === agora ? anterior : agora));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  return html`
    <time className=${'num font-display font-black tabular-nums ' + (escuro ? 'text-white' : 'text-tinta') + ' ' + (className || '')}>
      ${hora}
    </time>
  `;
}

/* ── Fundo em movimento ──────────────────────────────────────────────── */

const BOLHAS = [
  { top: '-10%', left: '-8%', w: '46vw', h: '46vw', dur: '34s', atraso: '0s', op: 0.5 },
  { top: '35%', left: '62%', w: '38vw', h: '38vw', dur: '27s', atraso: '-6s', op: 0.42 },
  { top: '68%', left: '8%', w: '32vw', h: '32vw', dur: '31s', atraso: '-14s', op: 0.35 },
];

export function FundoMovimento({ escuro }) {
  if (menosMovimento()) return null;
  const cores = escuro
    ? ['#0CC3D7', '#14525C', '#7FE3EF']
    : ['#0CC3D7', '#7FE3EF', '#0AA6B7'];
  return html`
    <div className="fundo-movimento" aria-hidden="true">
      ${BOLHAS.map((b, i) => html`
        <span
          key=${i}
          className="bolha"
          style=${{
            top: b.top, left: b.left, width: b.w, height: b.h,
            background: cores[i % cores.length],
            opacity: escuro ? b.op * 0.55 : b.op * 0.3,
            animationDuration: b.dur,
            animationDelay: b.atraso,
          }}
        ></span>
      `)}
    </div>
  `;
}

/* ── Marca da campanha ─────────────────────────────────────────────────── */

/** Usa um arquivo de imagem quando ele existe; cai no desenho interno quando
 *  não existe ou falha. Assim a página nunca mostra um ícone quebrado, e basta
 *  largar o arquivo oficial na pasta marca/ para ele passar a valer. */
function ImagemComReserva({ src, alt, className, reserva }) {
  const [falhou, setFalhou] = useState(false);
  if (falhou || !src) return reserva;
  return html`<img src=${src} alt=${alt} className=${className} onError=${() => setFalhou(true)} />`;
}

/** Seta de retorno — o gesto central da marca VOLTA: a embalagem que volta.
 *  Desenho próprio; troque por marca/volta.svg para usar o oficial. */
function SetaRetorno({ className }) {
  return html`
    <svg viewBox="0 0 48 48" className=${className} fill="none" stroke="currentColor"
         stroke-width="7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M34 17a13 13 0 1 0 3.2 12.4"></path>
      <path d="M37.5 38.5 30 30.5h15Z" fill="currentColor" stroke="none"></path>
    </svg>
  `;
}

/** A marca do programa VOLTA. */
export function Marca({ escuro, compacto }) {
  const tile = compacto ? 'w-10 h-10' : 'w-12 h-12';
  const icone = compacto ? 'w-6 h-6' : 'w-8 h-8';

  return html`
    <div className="flex items-center gap-2.5">
      <${ImagemComReserva}
        src="marca/volta.svg"
        alt="VOLTA"
        className=${tile + ' object-contain'}
        reserva=${html`
          <div className=${'grid place-items-center rounded-2xl bg-ciano text-white ' + tile} aria-hidden="true">
            <${SetaRetorno} className=${icone} />
          </div>
        `}
      />
      <div className="leading-none">
        <div className=${'font-display font-black tracking-tight lowercase ' + (compacto ? 'text-xl' : 'text-2xl') + ' ' + (escuro ? 'text-white' : 'text-tinta')}>
          volta
        </div>
        <div className=${'rotulo text-[9px] mt-1 ' + (escuro ? 'text-white/60' : 'text-tinta-suave')}>Nova Sede</div>
      </div>
    </div>
  `;
}

/** A identidade da igreja: a pomba com o nome por extenso. É ela que os
 *  irmãos reconhecem, então vem maior e em primeiro lugar. */
export function MarcaIgreja({ igreja, cidade, escuro, tamanho }) {
  const t = tamanho || 'md';
  const pomba = { sm: 'w-12 h-12', md: 'w-16 h-16', lg: 'w-24 h-24' }[t];
  const nome = { sm: 'text-base', md: 'text-xl md:text-2xl', lg: 'text-3xl md:text-4xl' }[t];
  const local = { sm: 'text-[10px]', md: 'text-xs', lg: 'text-sm' }[t];

  return html`
    <div className="flex items-center gap-3">
      <${ImagemComReserva}
        src="marca/admvc.jpg"
        alt=${(igreja || '') + ' ' + (cidade || '')}
        className=${pomba + ' rounded-full object-cover shrink-0 ring-2 ring-ciano/30'}
        reserva=${null}
      />
      <div className="leading-tight min-w-0">
        <div className=${'font-display font-black tracking-tight ' + nome + ' ' + (escuro ? 'text-white' : 'text-tinta')}>
          ${igreja || 'Igreja ADMVC'}
        </div>
        ${cidade ? html`
          <div className=${'rotulo mt-0.5 ' + local + ' ' + (escuro ? 'text-ciano-claro' : 'text-ciano-2')}>${cidade}</div>
        ` : null}
      </div>
    </div>
  `;
}

/** A assinatura da campanha, na manuscrita da marca VOLTA. É o único lugar
 *  onde essa fonte aparece — em mais lugares viraria piada num culto.
 *  Quebra em mais de uma linha quando precisa: a frase é longa. */
export function Assinatura({ texto, escuro, className }) {
  if (!texto) return null;
  return html`
    <span className=${'marker leading-tight text-balance inline-block ' + (escuro ? 'text-ciano-claro' : 'text-ciano-2') + ' ' + (className || '')}>
      ${texto}
    </span>
  `;
}

/** Uma passagem bíblica. A serifada é exclusiva da Palavra.
 *  A referência NÃO pode se chamar `ref`: o React reserva esse nome e a prop
 *  nunca chegaria aqui — a referência simplesmente sumiria da tela. */
export function Escritura({ texto, referencia, className }) {
  if (!texto) return null;
  return html`
    <p className=${'escritura ' + (className || '')}>
      “${texto}”${referencia ? html` <span className="ref">${referencia}</span>` : null}
    </p>
  `;
}

/* ── Muro de tijolos ───────────────────────────────────────────────────
   A metáfora do cartaz, desenhada: os tijolos assentados aparecem cheios e
   os que faltam ficam como contorno. Com 200 tijolos ainda se enxerga um a
   um; acima disso o desenho vira ruído, então cada peça passa a valer um
   bloco e a legenda diz quanto vale cada uma. */

export function Muro({ colocados, total, className }) {
  const pct = total > 0 ? Math.max(0, Math.min(1, colocados / total)) : 0;

  // Geometria da igreja, em coordenadas do viewBox. O corpo vai de CHAO até
  // TOPO_PAREDE; o telhado é o triângulo acima; a cruz remata.
  const L = 200, A = 190;
  const CHAO = 170, TOPO_PAREDE = 95, CUMEEIRA = 34;
  const ESQ = 34, DIR = 166;

  const silhueta = `M${ESQ} ${CHAO} L${ESQ} ${TOPO_PAREDE} L100 ${CUMEEIRA} L${DIR} ${TOPO_PAREDE} L${DIR} ${CHAO} Z`;

  // Fiadas de tijolos do chão para cima, com a junta desencontrada a cada
  // fiada, como numa parede de verdade. O recorte descarta o que passa da
  // silhueta, então o telhado "corta" as fiadas de cima sozinho.
  const ALT = 9, LARG = 22, JUNTA = 2;
  const fiadas = [];
  for (let y = CHAO - ALT; y >= CUMEEIRA - ALT; y -= ALT + JUNTA) {
    const desloca = (fiadas.length % 2) ? -LARG / 2 : 0;
    const tijolos = [];
    for (let x = ESQ - LARG + desloca; x < DIR + LARG; x += LARG + JUNTA) tijolos.push(x);
    fiadas.push({ y: y, tijolos: tijolos });
  }

  // O preenchimento sobe do chão: a altura molhada é a fração da arrecadação.
  const alturaCheia = (CHAO - CUMEEIRA) * pct;
  const linhaDagua = CHAO - alturaCheia;

  const id = 'igreja-' + Math.round(pct * 1e6);

  return html`
    <div className=${className || ''}>
      <svg viewBox=${`0 0 ${L} ${A}`} className="w-full h-auto max-w-full" role="img"
           aria-label=${`${colocados} de ${total} tijolos assentados`}>
        <defs>
          <clipPath id=${id}><path d=${silhueta}></path></clipPath>
        </defs>

        <g clipPath=${`url(#${id})`}>
          ${fiadas.map((f, i) => html`
            <g key=${i}>
              ${f.tijolos.map((x, j) => html`
                <rect
                  key=${j} x=${x} y=${f.y} width=${LARG} height=${ALT} rx="1.5"
                  fill=${f.y >= linhaDagua ? '#C1663A' : 'none'}
                  stroke="#C1663A"
                  stroke-width="0.8"
                  stroke-opacity=${f.y >= linhaDagua ? '0' : '0.3'}
                ></rect>
              `)}
            </g>
          `)}
        </g>

        <path d=${silhueta} fill="none" stroke="#1B2A44" stroke-width="3.5" stroke-linejoin="round"></path>
        <path d=${`M100 ${CUMEEIRA} L100 12`} stroke="#1B2A44" stroke-width="3.5" stroke-linecap="round"></path>
        <path d=${`M91 20 L109 20`} stroke="#1B2A44" stroke-width="3.5" stroke-linecap="round"></path>
        <path d=${`M88 ${CHAO} L88 128 A12 12 0 0 1 112 128 L112 ${CHAO}`}
              fill="none" stroke="#1B2A44" stroke-width="3"></path>
      </svg>
    </div>
  `;
}

/* ── Confete, em canvas próprio ────────────────────────────────────────── */

export function Confete({ gatilho, forte }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!gatilho) return;
    const cv = ref.current;
    if (!cv || menosMovimento()) return;

    const ctx = cv.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const L = cv.clientWidth, A = cv.clientHeight;
    if (!L || !A) return;
    cv.width = L * dpr; cv.height = A * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cores = ['#0CC3D7', '#7FE3EF', '#FFFFFF', '#0AA6B7', '#E8FAFC'];
    const pecas = [];
    const quantas = forte ? 220 : 110;
    for (let i = 0; i < quantas; i++) {
      pecas.push({
        x: L * (0.15 + Math.random() * 0.7),
        y: A + Math.random() * 60,
        vx: (Math.random() - 0.5) * 7,
        vy: -(9 + Math.random() * (forte ? 12 : 8)),
        g: 0.22 + Math.random() * 0.12,
        l: 5 + Math.random() * 8,
        a: 3 + Math.random() * 7,
        rot: Math.random() * Math.PI,
        vrot: (Math.random() - 0.5) * 0.3,
        cor: cores[(Math.random() * cores.length) | 0],
      });
    }

    let raf = 0;
    const inicio = performance.now();
    const duracao = forte ? 3400 : 2400;

    function quadro(t) {
      const decorrido = t - inicio;
      ctx.clearRect(0, 0, L, A);
      let vivos = 0;
      const opacidade = Math.max(0, 1 - decorrido / duracao);
      for (const p of pecas) {
        p.vy += p.g; p.x += p.vx; p.y += p.vy; p.rot += p.vrot;
        if (p.y < A + 40) vivos++;
        ctx.save();
        ctx.globalAlpha = opacidade;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.cor;
        ctx.fillRect(-p.l / 2, -p.a / 2, p.l, p.a);
        ctx.restore();
      }
      if (decorrido < duracao && vivos > 0) raf = requestAnimationFrame(quadro);
      else ctx.clearRect(0, 0, L, A);
    }
    raf = requestAnimationFrame(quadro);
    return () => { cancelAnimationFrame(raf); ctx.clearRect(0, 0, L, A); };
  }, [gatilho, forte]);

  return html`<canvas ref=${ref} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[60] w-full h-full"></canvas>`;
}

/* ── Mantém a tela acesa durante o culto ───────────────────────────────── */

export function useTelaAcesa() {
  useEffect(() => {
    let trava = null;
    let cancelado = false;
    async function pedir() {
      try {
        if (!navigator.wakeLock) return;
        trava = await navigator.wakeLock.request('screen');
        if (cancelado && trava) { trava.release(); trava = null; }
      } catch (e) { /* o navegador pode recusar; não é motivo para falhar */ }
    }
    pedir();
    const aoVoltar = () => { if (document.visibilityState === 'visible') pedir(); };
    document.addEventListener('visibilitychange', aoVoltar);
    return () => {
      cancelado = true;
      document.removeEventListener('visibilitychange', aoVoltar);
      if (trava) { try { trava.release(); } catch (e) { /* já liberada */ } }
    };
  }, []);
}

/* ── Consulta periódica ao servidor ────────────────────────────────────
   `intervaloMs` é um número simples de propósito: cada tela decide o seu ritmo
   e mudá-lo reinicia o ciclo. Com a aba escondida nada é consultado — um telão
   minimizado não gasta operações do banco à toa. */

export function useConsultaPeriodica(intervaloMs) {
  useEffect(() => {
    let vivo = true;
    let timer = null;

    function agendar() {
      if (!vivo) return;
      clearTimeout(timer);
      timer = setTimeout(rodar, Math.max(1000, intervaloMs));
    }
    async function rodar() {
      if (!vivo) return;
      if (document.visibilityState === 'visible') await Loja.consultar();
      agendar();
    }

    agendar();
    const aoVoltar = () => { if (document.visibilityState === 'visible') rodar(); };
    document.addEventListener('visibilitychange', aoVoltar);
    return () => {
      vivo = false;
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', aoVoltar);
    };
  }, [intervaloMs]);
}

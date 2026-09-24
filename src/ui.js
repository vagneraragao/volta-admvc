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
      className=${'w-full overflow-hidden rounded-full ' + (alto ? 'h-8 md:h-12' : 'h-4') + ' ' + (escuro ? 'bg-carvao-2' : 'bg-creme-2')}
      role="progressbar"
      aria-valuenow=${Math.round(pct)}
      aria-valuemin="0"
      aria-valuemax="100"
      aria-label="Progresso da meta"
    >
      <div
        className=${'h-full rounded-full barra-vidro transition-[width] duration-700 ease-out ' + (batida ? 'bg-ciano' : 'bg-amarelo')}
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
    local: { texto: 'somente neste aparelho', ponto: 'bg-amarelo' },
    offline: { texto: 'sem conexão', ponto: 'bg-amarelo' },
  };
  const s = mapa[sync] || mapa.iniciando;
  return html`
    <span className=${'inline-flex items-center gap-2 text-[11px] rotulo ' + (escuro ? 'text-creme/60' : 'text-tinta-suave')}>
      <span className=${'inline-block w-2 h-2 rounded-full ' + s.ponto}></span>${s.texto}
    </span>
  `;
}

/* ── Marca da campanha ─────────────────────────────────────────────────── */

export function Marca({ escuro, compacto }) {
  return html`
    <div className="flex items-center gap-3">
      <div
        className=${'grid place-items-center rounded-2xl bg-amarelo ' + (compacto ? 'w-11 h-11' : 'w-14 h-14')}
        aria-hidden="true"
      >
        <svg viewBox="0 0 32 32" className=${compacto ? 'w-6 h-6' : 'w-8 h-8'} fill="none" stroke="#101211" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M13 3h6v3.2c0 1.2.5 2.3 1.4 3.1l1.2 1.1c1.2 1.1 1.9 2.7 1.9 4.3V27a2 2 0 0 1-2 2H10.5a2 2 0 0 1-2-2V14.7c0-1.6.7-3.2 1.9-4.3l1.2-1.1C12.5 8.5 13 7.4 13 6.2V3Z"></path>
          <path d="M9 19h14"></path>
        </svg>
      </div>
      <div className="leading-none">
        <div className=${'font-display font-black tracking-tight ' + (compacto ? 'text-2xl' : 'text-3xl') + ' ' + (escuro ? 'text-creme' : 'text-tinta')}>
          VOLTA
        </div>
        <div className=${'rotulo text-[10px] mt-1 ' + (escuro ? 'text-creme/60' : 'text-tinta-suave')}>ADMVC · Nova Sede</div>
      </div>
    </div>
  `;
}

/** "Toma lá, Dá cá" — o bordão do VOLTA, na manuscrita da marca deles.
 *  É o único lugar onde essa fonte aparece. */
export function Assinatura({ texto, escuro, className }) {
  if (!texto) return null;
  return html`
    <span className=${'marker leading-none ' + (escuro ? 'text-amarelo' : 'text-preto') + ' ' + (className || '')}>
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

    const cores = ['#F5E600', '#D9CC00', '#0CC3D7', '#F7F7F4', '#2A2D2B'];
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

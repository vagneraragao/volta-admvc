// O carrossel contador → Palavra → fotos, e o telão que o emoldura.

import { Loja, fmt } from '../loja.js';
import {
  html, useState, useEffect, useRef, useCallback,
  NumeroAnimado, BarraProgresso, SeloSync, Marca, MarcaIgreja, Confete, Link,
  Assinatura, Escritura, Relogio, FundoMovimento, Muro,
  useTelaAcesa, useConsultaPeriodica,
} from '../ui.js';

const MARCOS = [25, 50, 75, 100];

/* ── Apresentação ──────────────────────────────────────────────────────
   O carrossel contador → Palavra → fotos. Nasceu no telão e agora é também
   o estado de repouso do tablet: assim a mesa fica viva sozinha e só mostra
   os botões quando alguém chega. Uma peça só, usada nas duas telas, para
   não existirem duas versões do mesmo carrossel para manter.

   Não faz consulta ao servidor nem trava a tela: isso é decisão de cada
   tela, que tem ritmos diferentes. */

export function Apresentacao({ estado, dica }) {
  const total = Loja.total();
  const meta = Math.max(1, Number(estado.config.meta) || 1);
  const pct = (total / meta) * 100;
  const fotos = estado.fotos;

  const [slide, setSlide] = useState(0);
  const [voltas, setVoltas] = useState(0);
  const [festa, setFesta] = useState(0);
  const [forte, setForte] = useState(false);
  const totalAnterior = useRef(total);
  const marcoAnterior = useRef(-1);

  // Slides: 0 = contador, 1 = Palavra, 2.. = fotos.
  // A Palavra ganha um slide próprio porque o telão é onde a congregação
  // realmente lê — rodapé de contador ninguém alcança do fundo do salão.
  const passagens = (estado.config.mensagens || []).filter((m) => m && String(m.versiculo || '').trim());
  const temPalavra = passagens.length > 0;
  const quantidadeSlides = 1 + (temPalavra ? 1 : 0) + fotos.length;
  const segundos = Math.max(3, Number(estado.config.segundosSlide) || 10);

  useEffect(() => {
    if (quantidadeSlides <= 1) { setSlide(0); return; }
    const t = setInterval(() => setSlide((s) => (s + 1) % quantidadeSlides), segundos * 1000);
    return () => clearInterval(t);
  }, [quantidadeSlides, segundos]);

  // Voltar ao contador fecha uma volta do carrossel e troca a passagem.
  useEffect(() => {
    if (slide === 0) setVoltas((v) => v + 1);
  }, [slide]);

  // Doação nova comemora; marco batido comemora mais e volta para o contador.
  useEffect(() => {
    if (total <= totalAnterior.current) { totalAnterior.current = total; return; }
    const marcoAtingido = MARCOS.filter((m) => pct >= m).pop();
    const novoMarco = marcoAtingido !== undefined && marcoAtingido !== marcoAnterior.current;
    if (novoMarco) { marcoAnterior.current = marcoAtingido; setSlide(0); }
    setForte(!!novoMarco);
    setFesta((f) => f + 1);
    totalAnterior.current = total;
  }, [total, pct]);

  const indiceFoto = slide - 1 - (temPalavra ? 1 : 0);
  const foto = indiceFoto >= 0 ? fotos[indiceFoto] : null;
  const naPalavra = temPalavra && slide === 1;
  // Cada volta do carrossel mostra uma passagem diferente, sem repetir a
  // mesma o culto inteiro.
  const passagem = naPalavra ? passagens[voltas % passagens.length] : null;
  const batida = pct >= 100;

  return html`
    <div className="absolute inset-0 bg-noite text-creme overflow-hidden">
      <${FundoMovimento} escuro=${true} />

      ${foto ? html`
        <div className="absolute inset-0 entra-slide" key=${'f' + foto.arquivo}>
          <img src=${'fotos/' + foto.arquivo} alt=${foto.legenda || 'Foto da campanha'} className="kenburns w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-noite via-noite/40 to-noite/20"></div>
          ${foto.legenda ? html`
            <p className="absolute left-0 right-0 bottom-28 px-[6vw] font-display font-semibold text-[clamp(1.4rem,3.2vw,3rem)] text-creme/95 text-balance">
              ${foto.legenda}
            </p>
          ` : null}
        </div>
      ` : naPalavra ? html`
        <div className="absolute inset-0 entra-slide" key=${'p' + voltas}>
          <div className="absolute inset-0 bg-noite"></div>
          <div className="relative h-full flex flex-col justify-center px-[8vw] pb-24">
            <${Assinatura} texto=${estado.config.tagline} escuro=${true} className="text-[clamp(1.1rem,2.6vw,2.4rem)] -rotate-1 mb-[4vh] max-w-[24ch]" />
            <${Escritura}
              texto=${passagem.versiculo}
              referencia=${passagem.ref}
              className="text-[clamp(1.8rem,6vw,5.5rem)] leading-[1.25] text-creme max-w-[26ch] m-0"
            />
          </div>
        </div>
      ` : html`
        <div className="absolute inset-0 entra-slide" key="contador">
          <div className="absolute inset-0" style=${{ background: 'radial-gradient(120% 90% at 50% 8%, #14525C 0%, #0B3A42 45%, #062A30 100%)' }}></div>

          <div className="relative h-full flex flex-col justify-center px-[6vw] pb-24">
            <p className="rotulo text-[clamp(0.7rem,1.1vw,1.05rem)] text-ciano-claro">
              ${estado.config.igreja} · ${estado.config.subtitulo}
            </p>

            <div className="mt-[1.5vh] flex items-end gap-[2vw] flex-wrap">
              <${NumeroAnimado}
                valor=${total}
                className=${'font-display font-black leading-[0.8] text-[clamp(5rem,20vw,17rem)] ' + (batida ? 'text-ciano' : 'text-ciano-claro')}
              />
              <span className="rotulo text-[clamp(0.8rem,1.6vw,1.6rem)] text-creme/60 pb-[2.5vh]">garrafas</span>
            </div>

            <div className="mt-[4vh] max-w-[1400px]">
              <div className="flex items-baseline justify-between mb-[1.4vh] gap-4">
                <span className="rotulo text-[clamp(0.7rem,1.1vw,1.05rem)] text-creme/60">Meta ${fmt(meta)} garrafas</span>
                <span className=${'num font-display font-black text-[clamp(1.4rem,3.4vw,3.4rem)] leading-none ' + (batida ? 'text-ciano' : 'text-ciano-claro')}>
                  ${pct.toFixed(1).replace('.', ',')}%
                </span>
              </div>
              <${BarraProgresso} pct=${pct} alto=${true} escuro=${true} />
              <p className="mt-[2vh] font-display font-semibold text-[clamp(1rem,2.1vw,2.1rem)] text-creme/80 text-balance">
                ${batida
                  ? 'Meta alcançada! Toda honra e glória ao Senhor pela nossa Nova Sede.'
                  : 'Faltam ' + fmt(Math.max(0, meta - total)) + ' garrafas para a Nova Sede.'}
              </p>
            </div>

            <${Escritura}
              texto=${estado.config.versiculo}
              referencia=${estado.config.versiculoRef}
              className="mt-[4vh] text-[clamp(0.9rem,1.5vw,1.5rem)] text-creme/50 max-w-[55ch] m-0"
            />
          </div>
        </div>
      `}

      <div
        className="absolute left-0 right-0 bottom-0 z-20 px-[6vw] py-5 flex items-center justify-between gap-4 bg-gradient-to-t from-noite to-transparent"
        style=${{ paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="flex items-center gap-5 md:gap-8 min-w-0">
          <${MarcaIgreja}
            igreja=${estado.config.igreja}
            cidade=${estado.config.cidade}
            escuro=${true}
            tamanho="md"
          />
          <div className="hidden md:block"><${Marca} escuro=${true} compacto=${true} /></div>
        </div>
        ${foto || naPalavra ? html`
          <div className="flex items-baseline gap-3 shrink-0">
            <span className="rotulo text-[11px] text-creme/50">arrecadado</span>
            <span className=${'num font-display font-black text-3xl md:text-5xl ' + (batida ? 'text-white' : 'text-ciano-claro')}>${fmt(total)}</span>
          </div>
        ` : html`
          <${Assinatura}
            texto=${estado.config.tagline}
            escuro=${true}
            className="text-base md:text-2xl -rotate-1 hidden sm:inline-block text-right max-w-[22ch] shrink-0"
          />
        `}
      </div>

      <div className="absolute top-5 right-[6vw] z-20 flex items-center gap-5">
        ${quantidadeSlides > 1 ? html`
          <div className="flex gap-2" aria-hidden="true">
            ${Array.from({ length: quantidadeSlides }).map((_, i) => html`
              <span key=${i} className=${'block h-1.5 rounded-full transition-all duration-500 ' + (i === slide ? 'w-8 bg-ciano' : 'w-1.5 bg-creme/25')}></span>
            `)}
          </div>
        ` : null}
        <${Relogio} escuro=${true} className="text-[clamp(1.4rem,3vw,2.6rem)] leading-none" />
      </div>

      ${dica ? html`
        <div className="absolute left-0 right-0 bottom-28 z-20 flex justify-center px-6">
          <span className="rounded-full bg-ciano/90 text-white px-6 py-3 rotulo text-sm md:text-base respira">
            ${dica}
          </span>
        </div>
      ` : null}

      <${Confete} gatilho=${festa} forte=${forte} />
    </div>
  `;
}

/* ══════════════════════════════════════════════════════════════════════
   Módulo 3 — Telão / projetor
   ══════════════════════════════════════════════════════════════════════ */

export function Telao({ estado, irPara }) {
  const [barraVisivel, setBarraVisivel] = useState(false);
  const [agora, setAgora] = useState(() => Date.now());

  useTelaAcesa();

  // Ritmo que acompanha o movimento: rápido durante a coleta, econômico na pausa.
  const quente = agora - estado.ultimaMudancaEm < 60000;
  useConsultaPeriodica(quente ? 3000 : 12000);

  useEffect(() => {
    const t = setInterval(() => setAgora(Date.now()), 15000);
    return () => clearInterval(t);
  }, []);

  // A barra de controle só aparece quando alguém mexe no aparelho.
  useEffect(() => {
    let t = null;
    const mostrar = () => {
      setBarraVisivel(true);
      clearTimeout(t);
      t = setTimeout(() => setBarraVisivel(false), 3500);
    };
    window.addEventListener('mousemove', mostrar);
    window.addEventListener('touchstart', mostrar, { passive: true });
    return () => {
      clearTimeout(t);
      window.removeEventListener('mousemove', mostrar);
      window.removeEventListener('touchstart', mostrar);
    };
  }, []);

  return html`
    <div className="tela-cheia relative bg-noite text-creme overflow-hidden">
      <${Apresentacao} estado=${estado} />

      <div className=${'absolute top-5 left-[6vw] z-30 flex items-center gap-3 transition-opacity duration-300 ' + (barraVisivel ? 'opacity-100' : 'opacity-0 pointer-events-none')}>
        <${Link} para="mesa" irPara=${irPara} className="toque rounded-xl bg-noite-2/90 border border-creme/20 px-3 py-2 text-xs rotulo text-creme/80 no-underline">Mesa<//>
        <${Link} para="obra" irPara=${irPara} className="toque rounded-xl bg-noite-2/90 border border-creme/20 px-3 py-2 text-xs rotulo text-creme/80 no-underline">Obra<//>
        <${Link} para="admin" irPara=${irPara} className="toque rounded-xl bg-noite-2/90 border border-creme/20 px-3 py-2 text-xs rotulo text-creme/80 no-underline">Admin<//>
        <${SeloSync} sync=${estado.sync} escuro=${true} />
      </div>
    </div>
  `;
}

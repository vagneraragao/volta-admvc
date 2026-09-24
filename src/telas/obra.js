// Campanha 2 — os tijolos da construção.

import { Loja, fmt } from '../loja.js';
import { contasDaObra, moeda } from '../campanhas.js';
import {
  html, useState, useEffect, useRef, useCallback,
  NumeroAnimado, BarraProgresso, SeloSync, Marca, MarcaIgreja, Confete, Link,
  Assinatura, Escritura, Relogio, FundoMovimento, Muro,
  useTelaAcesa, useConsultaPeriodica,
} from '../ui.js';

/* ══════════════════════════════════════════════════════════════════════
   Campanha da construção — a contabilidade dos tijolos, em tela
   ══════════════════════════════════════════════════════════════════════ */

export function Obra({ estado, irPara }) {
  const c = contasDaObra(estado.obra);
  const o = c.obra;
  const fotos = estado.fotosObra.length ? estado.fotosObra : estado.fotos;

  const [slide, setSlide] = useState(0);
  const [barraVisivel, setBarraVisivel] = useState(false);

  const quantidadeSlides = 1 + (fotos.length ? 1 : 0);
  const segundos = Math.max(3, Number(estado.config.segundosSlide) || 10);

  useTelaAcesa();
  useConsultaPeriodica(20000);   // valores mudam por lançamento manual, não por toque

  useEffect(() => {
    if (quantidadeSlides <= 1) { setSlide(0); return; }
    const t = setInterval(() => setSlide((s) => (s + 1) % quantidadeSlides), segundos * 1000);
    return () => clearInterval(t);
  }, [quantidadeSlides, segundos]);

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

  const naGaleria = fotos.length > 0 && slide === 1;
  const concluida = c.pct >= 100;

  const cartao = 'rounded-2xl bg-white/80 backdrop-blur border border-areia px-4 py-3';

  return html`
    <div className="tela-cheia relative bg-areia text-marinho overflow-hidden">

      ${naGaleria ? html`
        <div className="absolute inset-0 entra-slide" key="galeria">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-1 h-full">
            ${fotos.slice(0, 6).map((f) => html`
              <div key=${f.arquivo} className="overflow-hidden">
                <img src=${'fotos/' + f.arquivo} alt=${f.legenda || 'Projeto da nova sede'} className="kenburns w-full h-full object-cover" />
              </div>
            `)}
          </div>
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-areia to-transparent"></div>
        </div>
      ` : html`
        <div className="absolute inset-0 entra-slide" key="contas">
          <div className="relative h-full flex flex-col justify-center px-[6vw] pb-28">

            <header className="flex items-start justify-between gap-6 flex-wrap">
              <div>
                <p className="rotulo text-[clamp(0.65rem,1vw,0.9rem)] text-tijolo">${o.subtitulo}</p>
                <h1 className="font-display font-black leading-[0.9] text-[clamp(2rem,6vw,5rem)] text-marinho text-balance max-w-[18ch] mt-1">
                  ${o.titulo}
                </h1>
              </div>
              <${Assinatura} texto=${o.assinatura} className="text-[clamp(1rem,2.4vw,2.2rem)] -rotate-2 text-right max-w-[16ch]" />
            </header>

            <div className="mt-[4vh] grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-[4vw] items-center">

              <div className="grid gap-3">
                <div className=${cartao}>
                  <span className="rotulo text-[10px] text-tinta-suave">Valor total da obra</span>
                  <div className="num font-display font-black text-[clamp(1.6rem,3.4vw,2.8rem)] leading-tight">${moeda(o.valorObra, o.moeda)}</div>
                </div>
                <div className=${cartao}>
                  <span className="rotulo text-[10px] text-tinta-suave">Já arrecadados</span>
                  <div className="num font-display font-black text-[clamp(1.6rem,3.4vw,2.8rem)] leading-tight text-tijolo">${moeda(o.arrecadado, o.moeda)}</div>
                </div>
                <div className=${cartao}>
                  <span className="rotulo text-[10px] text-tinta-suave">Contribuindo mensalmente</span>
                  <div className="num font-display font-black text-[clamp(1.6rem,3.4vw,2.8rem)] leading-tight">${fmt(o.contribuintes)}</div>
                </div>
              </div>

              <div>
                <${Muro} colocados=${c.colocados} total=${c.totalTijolos} className="mb-[3vh]" />

                <div className="flex items-end gap-[3vw] flex-wrap">
                  <div>
                    <${NumeroAnimado} valor=${c.colocados} className="font-display font-black text-[clamp(2.4rem,7vw,5.5rem)] leading-none text-tijolo" />
                    <div className="rotulo text-[clamp(0.6rem,0.95vw,0.85rem)] text-tinta-suave mt-1">Tijolos já colocados</div>
                  </div>
                  <div className="w-px self-stretch bg-marinho/20"></div>
                  <div>
                    <${NumeroAnimado} valor=${c.faltam} className="font-display font-black text-[clamp(2.4rem,7vw,5.5rem)] leading-none text-marinho" />
                    <div className="rotulo text-[clamp(0.6rem,0.95vw,0.85rem)] text-tinta-suave mt-1">Tijolos ainda faltam</div>
                  </div>
                </div>

                <div className="mt-[3vh]">
                  <${BarraProgresso} pct=${c.pct} alto=${true} />
                  <div className="flex items-baseline justify-between gap-4 mt-2">
                    <span className=${'num font-display font-black text-[clamp(1.4rem,3vw,2.6rem)] ' + (concluida ? 'text-tijolo' : 'text-marinho')}>
                      ${c.pct.toFixed(1).replace('.', ',')}% <span className="rotulo text-[0.4em] text-tinta-suave">do total</span>
                    </span>
                    <span className="rotulo text-[11px] text-tinta-suave text-right">
                      ${concluida ? 'Obra financiada!' : 'Faltam ' + moeda(c.falta, o.moeda)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-[4vh] font-display text-[clamp(0.85rem,1.5vw,1.4rem)] text-marinho/75 max-w-[60ch] text-balance">
              ${o.chamada}
            </p>
            <${Escritura}
              texto=${o.versiculo}
              referencia=${o.versiculoRef}
              className="mt-[2vh] text-[clamp(0.85rem,1.5vw,1.4rem)] text-tinta-suave max-w-[55ch] m-0"
            />
          </div>
        </div>
      `}

      <div
        className="absolute left-0 right-0 bottom-0 z-20 px-[6vw] py-5 flex items-center justify-between gap-4"
        style=${{ paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <${MarcaIgreja} igreja=${estado.config.igreja} cidade=${estado.config.cidade} tamanho="md" />
        <${Assinatura} texto=${o.rodape} className="text-[clamp(0.9rem,2vw,1.8rem)] -rotate-1 text-right max-w-[20ch] hidden sm:inline-block" />
      </div>

      <div className="absolute top-5 right-[6vw] z-20 flex items-center gap-5">
        ${quantidadeSlides > 1 ? html`
          <div className="flex gap-2" aria-hidden="true">
            ${Array.from({ length: quantidadeSlides }).map((_, i) => html`
              <span key=${i} className=${'block h-1.5 rounded-full transition-all duration-500 ' + (i === slide ? 'w-8 bg-tijolo' : 'w-1.5 bg-marinho/25')}></span>
            `)}
          </div>
        ` : null}
        <${Relogio} className="text-[clamp(1.2rem,2.6vw,2.2rem)] leading-none" />
      </div>

      <div className=${'absolute top-5 left-[6vw] z-30 flex items-center gap-3 transition-opacity duration-300 ' + (barraVisivel ? 'opacity-100' : 'opacity-0 pointer-events-none')}>
        <${Link} para="mesa" irPara=${irPara} className="toque rounded-xl bg-white/90 border border-areia px-3 py-2 text-xs rotulo text-marinho no-underline">Mesa<//>
        <${Link} para="telao" irPara=${irPara} className="toque rounded-xl bg-white/90 border border-areia px-3 py-2 text-xs rotulo text-marinho no-underline">Telão<//>
        <${Link} para="admin" irPara=${irPara} className="toque rounded-xl bg-white/90 border border-areia px-3 py-2 text-xs rotulo text-marinho no-underline">Admin<//>
        <${SeloSync} sync=${estado.sync} />
      </div>
    </div>
  `;
}

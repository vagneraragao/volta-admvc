// As três telas: mesa de coleta, telão do projetor e administração.

import { Loja, CONFIG_PADRAO, fmt, aplicarMensagem } from './loja.js';
import {
  html, useState, useEffect, useRef, useCallback,
  NumeroAnimado, BarraProgresso, SeloSync, Marca, Confete, Link, Assinatura, Escritura,
  useTelaAcesa, useConsultaPeriodica,
} from './ui.js';

const MARCOS = [25, 50, 75, 100];

// Zona de toque da mesa: cerca de um terço da tela. O clamp evita os dois
// extremos — um botão minúsculo num celular e um botão absurdo numa TV.
const ZONA_TOQUE = 'clamp(200px, 33vh, 320px)';

/* ══════════════════════════════════════════════════════════════════════
   Módulo 1 — Mesa de coleta (tablet)
   ══════════════════════════════════════════════════════════════════════ */

export function Mesa({ estado, irPara }) {
  const total = Loja.total();
  const meta = Math.max(1, Number(estado.config.meta) || 1);
  const pct = (total / meta) * 100;

  const [sessao, setSessao] = useState(0);
  const [modal, setModal] = useState(null);
  const [pulso, setPulso] = useState(0);
  const [festa, setFesta] = useState(0);
  const timerObrigado = useRef(null);
  const timerFechar = useRef(null);
  const sessaoRef = useRef(0);

  useTelaAcesa();
  useConsultaPeriodica(15000);   // a mesa quase só escreve; consulta só pega mudanças do admin

  useEffect(() => () => {
    clearTimeout(timerObrigado.current);
    clearTimeout(timerFechar.current);
  }, []);

  const fecharModal = useCallback(() => {
    clearTimeout(timerFechar.current);
    setModal(null);
    sessaoRef.current = 0;
    setSessao(0);
  }, []);

  const abrirAgradecimento = useCallback(() => {
    const n = sessaoRef.current;
    if (n <= 0) return;
    const lista = (estado.config.mensagens || []).filter((m) => m && String(m.texto || '').trim());
    const escolhida = lista.length
      ? lista[(Math.random() * lista.length) | 0]
      : { texto: 'Obrigado por doar {n} {garrafas}!', versiculo: '', ref: '' };
    setModal({
      n: n,
      texto: aplicarMensagem(escolhida.texto, n),
      versiculo: escolhida.versiculo || '',
      ref: escolhida.ref || '',
    });
    setFesta((f) => f + 1);
    clearTimeout(timerFechar.current);
    timerFechar.current = setTimeout(fecharModal, 6000);
  }, [estado.config.mensagens, fecharModal]);

  /** Cada toque soma na hora e reinicia os 3 s — ninguém é interrompido
   *  no meio de uma entrega de doze garrafas. */
  const registrar = useCallback((n) => {
    if (modal) fecharModal();
    if (n < 0 && sessaoRef.current <= 0) return;   // nada desta entrega para desfazer
    const proxima = Math.max(0, sessaoRef.current + n);
    Loja.somar(n);
    sessaoRef.current = proxima;
    setSessao(proxima);
    setPulso((p) => p + 1);
    try { if (navigator.vibrate) navigator.vibrate(n > 0 ? 18 : 8); } catch (e) { /* sem motor */ }
    clearTimeout(timerObrigado.current);
    if (proxima > 0) timerObrigado.current = setTimeout(abrirAgradecimento, 3000);
  }, [abrirAgradecimento, modal, fecharModal]);

  const botaoSec = 'toque rounded-2xl bg-preto text-amarelo font-display font-black text-3xl md:text-4xl active:scale-[0.97] transition-transform';

  return html`
    <div className="tela-cheia flex flex-col bg-creme" style=${{ paddingLeft: 'max(16px, env(safe-area-inset-left, 0px))', paddingRight: 'max(16px, env(safe-area-inset-right, 0px))' }}>
      <div className="flex-1 w-full max-w-[1500px] mx-auto py-4 md:py-6 flex flex-col gap-4 md:gap-6">

        <header className="flex items-center justify-between gap-4 flex-wrap">
          <${Marca} />
          <div className="flex items-center gap-4">
            <${Assinatura} texto=${estado.config.tagline} className="text-2xl md:text-4xl -rotate-2" />
            <${SeloSync} sync=${estado.sync} />
          </div>
        </header>

        <section className="flex-1 rounded-[2rem] bg-white border border-creme-2 p-5 md:p-8 flex flex-col justify-center min-h-0">
          <p className="rotulo text-xs text-tinta-suave">Total arrecadado</p>
          <div className="flex items-end gap-3 mt-1">
            <${NumeroAnimado} valor=${total} className="font-display font-black text-6xl md:text-[6.5rem] leading-[0.85] text-preto" />
            <span className="rotulo text-sm text-tinta-suave pb-2">garrafas</span>
          </div>

          <div className="mt-5 md:mt-7">
            <div className="flex items-baseline justify-between mb-2">
              <span className="rotulo text-xs text-tinta-suave">Meta ${fmt(meta)}</span>
              <span className=${'num font-display font-black text-2xl ' + (pct >= 100 ? 'text-ciano-2' : 'text-preto')}>
                ${pct.toFixed(1).replace('.', ',')}%
              </span>
            </div>
            <${BarraProgresso} pct=${pct} alto=${true} />
            <p className="mt-3 text-sm text-tinta-suave">
              ${pct >= 100
                ? 'Meta alcançada. Glória a Deus — e seguimos!'
                : 'Faltam ' + fmt(Math.max(0, meta - total)) + ' garrafas para a meta.'}
            </p>
          </div>

          ${estado.pendentes > 0 && estado.armazenamento !== false ? html`
            <p className="mt-3 text-xs text-tinta-suave">
              ${fmt(estado.pendentes)} ${estado.pendentes === 1 ? 'garrafa aguardando' : 'garrafas aguardando'} envio ao servidor. Nada se perde.
            </p>
          ` : null}
        </section>

        <section className="shrink-0 grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-3 md:gap-4" style=${{ height: ZONA_TOQUE }}>
          <button
            type="button"
            onClick=${() => registrar(1)}
            key=${'p' + pulso}
            className=${'toque h-full rounded-[2rem] bg-amarelo text-preto shadow-xl shadow-amarelo-2/40 active:scale-[0.98] transition-transform ' + (pulso ? 'pulso' : '')}
          >
            <span className="block font-display font-black text-5xl md:text-7xl leading-none">+1</span>
            <span className="block rotulo text-sm md:text-lg mt-2">Garrafa</span>
          </button>

          <div className="grid grid-rows-3 gap-3 md:gap-4 h-full">
            <button type="button" onClick=${() => registrar(2)} className=${botaoSec}>+2</button>
            <button type="button" onClick=${() => registrar(5)} className=${botaoSec}>+5</button>
            <button
              type="button"
              onClick=${() => registrar(-1)}
              disabled=${sessao <= 0}
              className="toque rounded-2xl border-2 border-creme-2 bg-white text-tinta-suave font-display font-bold text-lg disabled:opacity-35"
            >
              ${sessao > 0 ? html`−1 <span className="rotulo text-[10px]">(${fmt(sessao)} nesta entrega)</span>` : '−1 corrigir'}
            </button>
          </div>
        </section>

        <footer className="shrink-0 flex items-center justify-between gap-4 flex-wrap">
          <${Escritura}
            texto=${estado.config.versiculo}
            referencia=${estado.config.versiculoRef}
            className="text-base md:text-xl text-tinta-suave max-w-[60ch] m-0"
          />
          <div className="flex items-center gap-2 ml-auto">
            <${Link} para="telao" irPara=${irPara} className="toque rounded-xl px-3 py-2 text-xs rotulo text-tinta-suave/70 hover:text-tinta no-underline">Telão<//>
            <${Link} para="admin" irPara=${irPara} rotulo="Abrir administração" className="toque rounded-xl p-2 text-tinta-suave/50 hover:text-tinta inline-flex">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.9">
                <circle cx="12" cy="12" r="3.2"></circle>
                <path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 9 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 4.6 9a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z"></path>
              </svg>
            <//>
          </div>
        </footer>
      </div>

      ${modal ? html`
        <div className="fixed inset-0 z-50 grid place-items-center bg-preto/95 p-5" role="dialog" aria-modal="true" aria-label="Agradecimento" onClick=${fecharModal}>
          <div className="entra-modal max-w-4xl w-full text-center">
            <div className="mx-auto w-20 h-20 rounded-full bg-amarelo grid place-items-center mb-7" aria-hidden="true">
              <svg viewBox="0 0 24 24" className="w-10 h-10" fill="none" stroke="#101211" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <path d="m4.5 12.5 5 5 10-11"></path>
              </svg>
            </div>

            <p className="font-display font-black text-3xl md:text-5xl leading-[1.12] text-creme text-balance">
              ${modal.texto}
            </p>

            ${modal.versiculo ? html`
              <div className="mt-8 md:mt-10 pt-7 border-t border-creme/20">
                <${Escritura}
                  texto=${modal.versiculo}
                  referencia=${modal.ref}
                  className="text-2xl md:text-4xl leading-[1.3] text-amarelo m-0"
                />
              </div>
            ` : null}

            <p className="rotulo text-xs text-creme/50 mt-8">Toque na tela para continuar</p>
          </div>
        </div>
        <${Confete} gatilho=${festa} forte=${modal.n >= 5} />
      ` : null}
    </div>
  `;
}

/* ══════════════════════════════════════════════════════════════════════
   Módulo 3 — Telão / projetor
   ══════════════════════════════════════════════════════════════════════ */

export function Telao({ estado, irPara }) {
  const total = Loja.total();
  const meta = Math.max(1, Number(estado.config.meta) || 1);
  const pct = (total / meta) * 100;
  const fotos = estado.fotos;

  const [slide, setSlide] = useState(0);
  const [voltas, setVoltas] = useState(0);
  const [festa, setFesta] = useState(0);
  const [forte, setForte] = useState(false);
  const [barraVisivel, setBarraVisivel] = useState(false);
  const [agora, setAgora] = useState(() => Date.now());
  const totalAnterior = useRef(total);
  const marcoAnterior = useRef(-1);

  // Slides: 0 = contador, 1 = Palavra, 2.. = fotos.
  // A Palavra ganha um slide próprio porque o telão é onde a congregação
  // realmente lê — rodapé de contador ninguém alcança do fundo do salão.
  const passagens = (estado.config.mensagens || []).filter((m) => m && String(m.versiculo || '').trim());
  const temPalavra = passagens.length > 0;
  const quantidadeSlides = 1 + (temPalavra ? 1 : 0) + fotos.length;
  const segundos = Math.max(3, Number(estado.config.segundosSlide) || 10);

  useTelaAcesa();

  // Ritmo que acompanha o movimento: rápido durante a coleta, econômico na pausa.
  const quente = agora - estado.ultimaMudancaEm < 60000;
  useConsultaPeriodica(quente ? 3000 : 12000);

  useEffect(() => {
    const t = setInterval(() => setAgora(Date.now()), 15000);
    return () => clearInterval(t);
  }, []);

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

  const indiceFoto = slide - 1 - (temPalavra ? 1 : 0);
  const foto = indiceFoto >= 0 ? fotos[indiceFoto] : null;
  const naPalavra = temPalavra && slide === 1;
  // Cada volta do carrossel mostra uma passagem diferente, sem repetir a
  // mesma o culto inteiro.
  const passagem = naPalavra ? passagens[voltas % passagens.length] : null;
  const batida = pct >= 100;

  return html`
    <div className="tela-cheia relative bg-preto text-creme overflow-hidden">

      ${foto ? html`
        <div className="absolute inset-0 entra-slide" key=${'f' + foto.arquivo}>
          <img src=${'fotos/' + foto.arquivo} alt=${foto.legenda || 'Foto da campanha'} className="kenburns w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-preto via-preto/40 to-preto/20"></div>
          ${foto.legenda ? html`
            <p className="absolute left-0 right-0 bottom-28 px-[6vw] font-display font-semibold text-[clamp(1.4rem,3.2vw,3rem)] text-creme/95 text-balance">
              ${foto.legenda}
            </p>
          ` : null}
        </div>
      ` : naPalavra ? html`
        <div className="absolute inset-0 entra-slide" key=${'p' + voltas}>
          <div className="absolute inset-0 bg-preto"></div>
          <div className="relative h-full flex flex-col justify-center px-[8vw] pb-24">
            <${Assinatura} texto=${estado.config.tagline} escuro=${true} className="text-[clamp(1.6rem,4vw,3.6rem)] -rotate-2 mb-[4vh]" />
            <${Escritura}
              texto=${passagem.versiculo}
              referencia=${passagem.ref}
              className="text-[clamp(1.8rem,6vw,5.5rem)] leading-[1.25] text-creme max-w-[26ch] m-0"
            />
          </div>
        </div>
      ` : html`
        <div className="absolute inset-0 entra-slide" key="contador">
          <div className="absolute inset-0" style=${{ background: 'radial-gradient(120% 90% at 50% 8%, #2A2D2B 0%, #1A1C1B 45%, #101211 100%)' }}></div>

          <div className="relative h-full flex flex-col justify-center px-[6vw] pb-24">
            <p className="rotulo text-[clamp(0.7rem,1.1vw,1.05rem)] text-amarelo">
              ${estado.config.igreja} · ${estado.config.subtitulo}
            </p>

            <div className="mt-[1.5vh] flex items-end gap-[2vw] flex-wrap">
              <${NumeroAnimado}
                valor=${total}
                className=${'font-display font-black leading-[0.8] text-[clamp(5rem,20vw,17rem)] ' + (batida ? 'text-ciano' : 'text-amarelo')}
              />
              <span className="rotulo text-[clamp(0.8rem,1.6vw,1.6rem)] text-creme/60 pb-[2.5vh]">garrafas</span>
            </div>

            <div className="mt-[4vh] max-w-[1400px]">
              <div className="flex items-baseline justify-between mb-[1.4vh] gap-4">
                <span className="rotulo text-[clamp(0.7rem,1.1vw,1.05rem)] text-creme/60">Meta ${fmt(meta)} garrafas</span>
                <span className=${'num font-display font-black text-[clamp(1.4rem,3.4vw,3.4rem)] leading-none ' + (batida ? 'text-ciano' : 'text-amarelo')}>
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
        className="absolute left-0 right-0 bottom-0 z-20 px-[6vw] py-5 flex items-center justify-between gap-4 bg-gradient-to-t from-preto to-transparent"
        style=${{ paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <${Marca} escuro=${true} compacto=${true} />
        ${foto || naPalavra ? html`
          <div className="flex items-baseline gap-3">
            <span className="rotulo text-[11px] text-creme/50">arrecadado</span>
            <span className=${'num font-display font-black text-3xl md:text-5xl ' + (batida ? 'text-ciano' : 'text-amarelo')}>${fmt(total)}</span>
          </div>
        ` : html`
          <p className="font-display text-creme/50 text-sm md:text-lg hidden sm:block text-right max-w-md text-balance">
            ${estado.config.chamada}
          </p>
        `}
      </div>

      ${quantidadeSlides > 1 ? html`
        <div className="absolute top-6 right-[6vw] z-20 flex gap-2" aria-hidden="true">
          ${Array.from({ length: quantidadeSlides }).map((_, i) => html`
            <span key=${i} className=${'block h-1.5 rounded-full transition-all duration-500 ' + (i === slide ? 'w-8 bg-amarelo' : 'w-1.5 bg-creme/25')}></span>
          `)}
        </div>
      ` : null}

      <div className=${'absolute top-5 left-[6vw] z-30 flex items-center gap-3 transition-opacity duration-300 ' + (barraVisivel ? 'opacity-100' : 'opacity-0 pointer-events-none')}>
        <${Link} para="mesa" irPara=${irPara} className="toque rounded-xl bg-carvao/90 border border-creme/20 px-3 py-2 text-xs rotulo text-creme/80 no-underline">Mesa<//>
        <${Link} para="admin" irPara=${irPara} className="toque rounded-xl bg-carvao/90 border border-creme/20 px-3 py-2 text-xs rotulo text-creme/80 no-underline">Admin<//>
        <${SeloSync} sync=${estado.sync} escuro=${true} />
      </div>

      <${Confete} gatilho=${festa} forte=${forte} />
    </div>
  `;
}

/* ══════════════════════════════════════════════════════════════════════
   Módulo 2 — Administração
   ══════════════════════════════════════════════════════════════════════ */

const entrada = 'w-full rounded-xl border border-creme-2 bg-white px-3.5 py-2.5 text-tinta outline-none focus:border-ciano';
const botao = 'toque rounded-xl bg-preto text-creme px-4 py-2.5 font-semibold active:scale-[0.98] transition-transform disabled:opacity-50';
const botaoFraco = 'toque rounded-xl border border-creme-2 bg-white px-4 py-2.5 font-semibold text-tinta active:scale-[0.98] transition-transform';

function Campo({ rotulo, children, dica }) {
  return html`
    <label className="block">
      <span className="rotulo text-[11px] text-tinta-suave">${rotulo}</span>
      <div className="mt-1.5">${children}</div>
      ${dica ? html`<span className="block mt-1.5 text-xs text-tinta-suave">${dica}</span>` : null}
    </label>
  `;
}

function Secao({ titulo, descricao, children }) {
  return html`
    <section className="rounded-2xl bg-white border border-creme-2 p-5 md:p-6">
      <h2 className="font-display font-extrabold text-lg text-tinta">${titulo}</h2>
      ${descricao ? html`<p className="text-sm text-tinta-suave mt-1 max-w-[65ch]">${descricao}</p>` : null}
      <div className="mt-5">${children}</div>
    </section>
  `;
}

export function Admin({ estado, irPara }) {
  const [senha, setSenha] = useState('');
  const [autorizado, setAutorizado] = useState('');   // guarda a senha aceita, só na memória
  const [erro, setErro] = useState('');
  const [conferindo, setConferindo] = useState(false);

  async function entrar(ev) {
    ev.preventDefault();
    setConferindo(true);
    setErro('');
    const ok = await Loja.verificarSenha(senha);
    setConferindo(false);
    if (ok) { setAutorizado(senha); setSenha(''); }
    else setErro('Senha incorreta. Tente novamente.');
  }

  if (!autorizado) {
    return html`
      <div className="tela-cheia grid place-items-center bg-creme px-4 py-10">
        <form className="w-full max-w-sm rounded-2xl bg-white border border-creme-2 p-6" onSubmit=${entrar}>
          <${Marca} compacto=${true} />
          <h1 className="font-display font-extrabold text-xl mt-5">Administração da campanha</h1>
          <p className="text-sm text-tinta-suave mt-1">
            ${estado.armazenamento === true
              ? 'A senha é conferida no servidor.'
              : 'Sem servidor configurado — a senha padrão local é 1234.'}
          </p>
          <input
            id="senha-admin"
            type="password"
            autoComplete="current-password"
            value=${senha}
            onChange=${(e) => setSenha(e.target.value)}
            className=${entrada + ' mt-4 text-center text-2xl tracking-[0.4em]'}
            placeholder="••••"
          />
          ${erro ? html`<p className="text-sm text-red-700 mt-2">${erro}</p>` : null}
          <button type="submit" disabled=${conferindo} className=${botao + ' w-full mt-4'}>
            ${conferindo ? 'Conferindo…' : 'Entrar'}
          </button>
          <${Link} para="mesa" irPara=${irPara} className=${botaoFraco + ' w-full mt-2 block text-center no-underline'}>Voltar para a mesa<//>
        </form>
      </div>
    `;
  }

  return html`<${Painel} estado=${estado} irPara=${irPara} senha=${autorizado} />`;
}

function Painel({ estado, irPara, senha }) {
  const cfg = estado.config;
  const total = Loja.total();

  useConsultaPeriodica(5000);

  const doConfig = useCallback((c) => ({
    meta: String(c.meta),
    segundosSlide: String(c.segundosSlide),
    tagline: c.tagline,
    chamada: c.chamada,
    subtitulo: c.subtitulo,
    versiculo: c.versiculo,
    versiculoRef: c.versiculoRef,
  }), []);

  const [rascunho, setRascunho] = useState(() => doConfig(cfg));
  const [sujo, setSujo] = useState(false);
  const [ajusteValor, setAjusteValor] = useState('');
  const [alvoValor, setAlvoValor] = useState('');
  const [novaMensagem, setNovaMensagem] = useState('');
  const [token, setToken] = useState(() => Loja.tokenMesa());
  const [recado, setRecado] = useState(null);
  const [salvando, setSalvando] = useState(false);

  // A configuração do servidor chega depois da tela montar. Enquanto ninguém
  // digitou nada, o formulário acompanha — assim salvar nunca devolve um valor
  // velho por cima do atual.
  useEffect(() => {
    if (sujo) return;
    setRascunho(doConfig(cfg));
  }, [cfg, sujo, doConfig]);

  const editar = useCallback((campo, valor) => {
    setSujo(true);
    setRascunho((r) => Object.assign({}, r, { [campo]: valor }));
  }, []);

  const avisar = useCallback((tipo, texto) => {
    setRecado({ tipo: tipo, texto: texto });
    setTimeout(() => setRecado(null), 5000);
  }, []);

  async function comSalvamento(fn, mensagemOk) {
    setSalvando(true);
    try {
      await fn();
      avisar('ok', mensagemOk);
    } catch (e) {
      avisar('erro', (e && e.message) || 'Não consegui salvar.');
    } finally {
      setSalvando(false);
    }
  }

  function salvarCampanha(ev) {
    ev.preventDefault();
    comSalvamento(async () => {
      await Loja.salvarConfig({
        meta: Math.max(1, parseInt(rascunho.meta, 10) || 1),
        segundosSlide: Math.max(3, parseInt(rascunho.segundosSlide, 10) || 10),
        tagline: rascunho.tagline.trim(),
        chamada: rascunho.chamada.trim() || CONFIG_PADRAO.chamada,
        subtitulo: rascunho.subtitulo.trim() || CONFIG_PADRAO.subtitulo,
        versiculo: rascunho.versiculo.trim(),
        versiculoRef: rascunho.versiculoRef.trim(),
      }, senha);
      setSujo(false);
    }, 'Ajustes salvos. O telão já mostra os novos valores.');
  }

  function mexerNoTotal(sinal) {
    const n = parseInt(ajusteValor, 10);
    if (!n || n < 0) { avisar('erro', 'Informe um número maior que zero.'); return; }
    comSalvamento(async () => {
      await Loja.ajustarTotal(sinal * n, senha);
      setAjusteValor('');
    }, (sinal > 0 ? 'Somadas ' : 'Subtraídas ') + fmt(n) + ' garrafas.');
  }

  function redefinir() {
    const alvo = parseInt(alvoValor, 10);
    if (isNaN(alvo) || alvo < 0) { avisar('erro', 'Informe o total exato, um número igual ou maior que zero.'); return; }
    comSalvamento(async () => {
      await Loja.redefinirTotal(alvo, senha);
      setAlvoValor('');
    }, 'Total redefinido para ' + fmt(alvo) + ' garrafas.');
  }

  function adicionarMensagem(ev) {
    ev.preventDefault();
    const texto = novaMensagem.trim();
    if (!texto) return;
    comSalvamento(async () => {
      const nova = { texto: texto, versiculo: '', ref: '' };
      await Loja.salvarConfig({ mensagens: (cfg.mensagens || []).concat([nova]) }, senha);
      setNovaMensagem('');
    }, 'Frase adicionada. Agora acrescente a passagem bíblica nela.');
  }

  /** Grava um dos três campos de uma frase ao sair do campo. */
  function editarMensagem(i, campo, valor) {
    const lista = (cfg.mensagens || []).slice();
    const atual = lista[i];
    if (!atual || atual[campo] === valor) return;   // sair sem mudar nada não grava
    lista[i] = Object.assign({}, atual, { [campo]: valor });
    comSalvamento(() => Loja.salvarConfig({ mensagens: lista }, senha), 'Frase atualizada.');
  }

  function removerMensagem(i) {
    const lista = (cfg.mensagens || []).slice();
    lista.splice(i, 1);
    if (!lista.length) { avisar('erro', 'Mantenha ao menos uma frase de agradecimento.'); return; }
    comSalvamento(() => Loja.salvarConfig({ mensagens: lista }, senha), 'Frase removida.');
  }

  function copiarBackup() {
    const dados = JSON.stringify({ exportadoEm: new Date().toISOString(), total: total, config: cfg }, null, 2);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(dados).then(
        () => avisar('ok', 'Backup copiado. Cole num bloco de notas e guarde.'),
        () => avisar('erro', 'Não consegui copiar. Selecione o texto abaixo manualmente.')
      );
    } else {
      avisar('erro', 'Este navegador não permite copiar automaticamente. Use o texto abaixo.');
    }
  }

  const corRecado = { ok: 'bg-preto text-creme', erro: 'bg-red-800 text-white', aviso: 'bg-amarelo text-tinta' };

  return html`
    <div className="tela-cheia bg-creme pb-16" style=${{ paddingLeft: 'max(16px, env(safe-area-inset-left, 0px))', paddingRight: 'max(16px, env(safe-area-inset-right, 0px))' }}>
      <div className="max-w-5xl mx-auto py-6">

        <header className="flex flex-wrap items-center justify-between gap-4">
          <${Marca} compacto=${true} />
          <div className="flex items-center gap-2">
            <${SeloSync} sync=${estado.sync} />
            <${Link} para="mesa" irPara=${irPara} className=${botaoFraco + ' no-underline inline-block'}>Mesa<//>
            <${Link} para="telao" irPara=${irPara} className=${botaoFraco + ' no-underline inline-block'}>Telão<//>
          </div>
        </header>

        <h1 className="font-display font-black text-3xl mt-6">Administração</h1>
        <p className="text-tinta-suave mt-1 max-w-[65ch]">
          Tudo o que você mudar aqui aparece na mesa de coleta e no telão em poucos segundos.
        </p>

        ${estado.armazenamento === false ? html`
          <p className="mt-4 rounded-xl border border-ciano/60 bg-ciano/10 px-4 py-3 text-sm text-tinta">
            <strong>Sem sincronia entre aparelhos.</strong> Os dados estão salvos apenas neste navegador.
            Janelas deste mesmo aparelho continuam sincronizadas entre si. Configure o armazenamento na
            Vercel para ligar a sincronia — o README explica.
          </p>
        ` : null}
        ${estado.sync === 'offline' ? html`
          <p className="mt-4 rounded-xl border border-ciano/60 bg-ciano/10 px-4 py-3 text-sm text-tinta">
            <strong>Sem conexão com o servidor agora.</strong> As doações registradas neste aparelho estão
            guardadas e sobem sozinhas quando a rede voltar. Evite redefinir o total enquanto isso.
          </p>
        ` : null}

        <div className="mt-6 grid gap-5">

          <${Secao} titulo="Situação da campanha">
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="rounded-xl bg-creme p-4">
                <span className="rotulo text-[11px] text-tinta-suave">Total atual</span>
                <div className="num font-display font-black text-4xl text-preto leading-tight">${fmt(total)}</div>
              </div>
              <div className="rounded-xl bg-creme p-4">
                <span className="rotulo text-[11px] text-tinta-suave">Meta</span>
                <div className="num font-display font-black text-4xl text-tinta leading-tight">${fmt(cfg.meta)}</div>
              </div>
              <div className="rounded-xl bg-creme p-4">
                <span className="rotulo text-[11px] text-tinta-suave">Aguardando envio</span>
                <div className="num font-display font-black text-4xl text-tinta leading-tight">${fmt(estado.pendentes)}</div>
              </div>
            </div>

            <div className="mt-5 grid md:grid-cols-2 gap-5">
              <div className="rounded-xl border border-creme-2 p-4">
                <${Campo} rotulo="Somar ou subtrair garrafas" dica="Para lançamento retroativo ou correção de erro de digitação.">
                  <div className="flex gap-2">
                    <input id="ajuste-valor" type="number" min="1" value=${ajusteValor} onChange=${(e) => setAjusteValor(e.target.value)} className=${entrada} placeholder="0" />
                    <button type="button" disabled=${salvando} onClick=${() => mexerNoTotal(1)} className=${botao}>Somar</button>
                    <button type="button" disabled=${salvando} onClick=${() => mexerNoTotal(-1)} className=${botaoFraco}>Subtrair</button>
                  </div>
                <//>
              </div>
              <div className="rounded-xl border border-creme-2 p-4">
                <${Campo} rotulo="Redefinir o total exato" dica="Grava o número digitado como total da campanha. Doações ainda não enviadas por este aparelho são descartadas.">
                  <div className="flex gap-2">
                    <input id="alvo-valor" type="number" min="0" value=${alvoValor} onChange=${(e) => setAlvoValor(e.target.value)} className=${entrada} placeholder=${String(total)} />
                    <button type="button" disabled=${salvando} onClick=${redefinir} className=${botao}>Redefinir</button>
                  </div>
                <//>
              </div>
            </div>
          <//>

          <${Secao} titulo="Ajustes da campanha">
            <form onSubmit=${salvarCampanha} className="grid md:grid-cols-2 gap-4">
              <${Campo} rotulo="Meta total de garrafas">
                <input id="cfg-meta" type="number" min="1" value=${rascunho.meta} onChange=${(e) => editar('meta', e.target.value)} className=${entrada} />
              <//>
              <${Campo} rotulo="Segundos por slide no telão">
                <input id="cfg-slide" type="number" min="3" value=${rascunho.segundosSlide} onChange=${(e) => editar('segundosSlide', e.target.value)} className=${entrada} />
              <//>
              <div className="md:col-span-2">
                <${Campo} rotulo="Frase de chamada">
                  <input id="cfg-chamada" type="text" value=${rascunho.chamada} onChange=${(e) => editar('chamada', e.target.value)} className=${entrada} />
                <//>
              </div>
              <${Campo} rotulo="Subtítulo da campanha">
                <input id="cfg-sub" type="text" value=${rascunho.subtitulo} onChange=${(e) => editar('subtitulo', e.target.value)} className=${entrada} />
              <//>
              <${Campo} rotulo="Assinatura" dica="O bordão do VOLTA, escrito à mão na tela. Deixe vazio para não mostrar.">
                <input id="cfg-tagline" type="text" value=${rascunho.tagline} onChange=${(e) => editar('tagline', e.target.value)} className=${entrada} />
              <//>
              <${Campo} rotulo="Versículo do telão">
                <input id="cfg-vers" type="text" value=${rascunho.versiculo} onChange=${(e) => editar('versiculo', e.target.value)} className=${entrada} />
              <//>
              <${Campo} rotulo="Referência do versículo">
                <input id="cfg-versref" type="text" value=${rascunho.versiculoRef} onChange=${(e) => editar('versiculoRef', e.target.value)} className=${entrada} />
              <//>
              <div className="md:col-span-2">
                <button type="submit" disabled=${salvando} className=${botao}>Salvar ajustes</button>
              </div>
            </form>
          <//>

          <${Secao}
            titulo=${'Banco de mensagens · ' + (cfg.traducao || 'NTLH')}
            descricao=${'Cada frase tem duas partes: o agradecimento, que se adapta à quantidade, e a passagem bíblica. Escreva {n} onde entra o número e {garrafas} onde entra "garrafa" ou "garrafas" — o singular e o plural são acertados sozinhos. As passagens também entram no rodízio do telão.'}
          >
            <form onSubmit=${adicionarMensagem} className="flex flex-col sm:flex-row gap-2">
              <input
                id="nova-mensagem"
                type="text"
                value=${novaMensagem}
                onChange=${(e) => setNovaMensagem(e.target.value)}
                className=${entrada}
                placeholder="Obrigado por doar {n} {garrafas}! Deus abençoe."
              />
              <button type="submit" disabled=${salvando} className=${botao}>Adicionar</button>
            </form>

            <p className="mt-4 text-xs text-tinta-suave">A edição é gravada quando você sai do campo.</p>
            <ul className="mt-2 grid gap-4">
              ${(cfg.mensagens || []).map((m, i) => html`
                <li key=${'msg-' + i + '-' + (cfg.mensagens || []).length} className="rounded-xl border border-creme-2 p-4">
                  <${Campo} rotulo="Agradecimento">
                    <textarea
                      id=${'msg-texto-' + i}
                      defaultValue=${m.texto}
                      rows="2"
                      onBlur=${(e) => editarMensagem(i, 'texto', e.target.value)}
                      className=${entrada + ' resize-y'}
                    ></textarea>
                  <//>

                  <div className="grid md:grid-cols-[minmax(0,3fr)_minmax(0,1fr)] gap-3 mt-3">
                    <${Campo} rotulo="Passagem bíblica">
                      <textarea
                        id=${'msg-vers-' + i}
                        defaultValue=${m.versiculo}
                        rows="2"
                        onBlur=${(e) => editarMensagem(i, 'versiculo', e.target.value)}
                        className=${entrada + ' resize-y'}
                        placeholder="Deem aos outros, e Deus dará a vocês."
                      ></textarea>
                    <//>
                    <${Campo} rotulo="Referência">
                      <input
                        id=${'msg-ref-' + i}
                        type="text"
                        defaultValue=${m.ref}
                        onBlur=${(e) => editarMensagem(i, 'ref', e.target.value)}
                        className=${entrada}
                        placeholder="Lucas 6.38"
                      />
                    <//>
                  </div>

                  <div className="flex items-end justify-between gap-3 mt-3 pt-3 border-t border-creme-2">
                    <div className="min-w-0">
                      <span className="rotulo text-[10px] text-tinta-suave">Como aparece com 3 garrafas</span>
                      <p className="font-display font-bold text-sm truncate">${aplicarMensagem(m.texto, 3)}</p>
                      ${m.versiculo ? html`
                        <${Escritura} texto=${m.versiculo} referencia=${m.ref} className="text-sm text-tinta-suave mt-1 mb-0 truncate" />
                      ` : html`
                        <p className="text-xs text-tinta-suave mt-1">Sem passagem — esta frase não entra no rodízio do telão.</p>
                      `}
                    </div>
                    <button type="button" onClick=${() => removerMensagem(i)} className="toque text-sm font-semibold text-red-800 shrink-0">Remover</button>
                  </div>
                </li>
              `)}
            </ul>
          <//>

          <${Secao}
            titulo="Fotos do telão"
            descricao="As fotos são arquivos do projeto. Coloque os JPGs na pasta fotos/, registre cada um em fotos/lista.json com a legenda e publique — em cerca de trinta segundos o telão já mostra."
          >
            ${estado.fotos.length === 0
              ? html`<p className="text-sm text-tinta-suave">Nenhuma foto cadastrada. Sem fotos, o telão fica só no contador — o que já funciona bem.</p>`
              : html`
                <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  ${estado.fotos.map((f) => html`
                    <li key=${f.arquivo} className="rounded-xl overflow-hidden border border-creme-2 bg-white">
                      <img src=${'fotos/' + f.arquivo} alt=${f.legenda || f.arquivo} className="w-full aspect-video object-cover max-w-full" />
                      <div className="p-3">
                        <p className="text-sm truncate">${f.legenda || html`<span className="text-tinta-suave">Sem legenda</span>`}</p>
                        <p className="rotulo text-[10px] text-tinta-suave mt-1 truncate">${f.arquivo}</p>
                      </div>
                    </li>
                  `)}
                </ul>
              `}
            <pre className="mt-4 overflow-x-auto rounded-xl bg-preto text-creme p-4 text-xs leading-relaxed">${'[\n  { "arquivo": "maquete-01.jpg", "legenda": "Maquete da Nova Sede" }\n]'}</pre>
          <//>

          <${Secao} titulo="Este aparelho" descricao="Vale só para o navegador em que você está agora.">
            <${Campo}
              rotulo="Token da mesa"
              dica="Se você definiu a variável TOKEN_MESA na Vercel, cole aqui o mesmo valor — sem ele este aparelho não consegue registrar doações. Deixe vazio se não usa token."
            >
              <div className="flex gap-2">
                <input id="token-mesa" type="text" value=${token} onChange=${(e) => setToken(e.target.value)} className=${entrada} placeholder="cole o token aqui" />
                <button type="button" onClick=${() => { Loja.definirTokenMesa(token); avisar('ok', 'Token guardado neste aparelho.'); }} className=${botao}>Guardar</button>
              </div>
            <//>
          <//>

          <${Secao} titulo="Backup" descricao="Guarde uma cópia da meta, das frases e do total antes de um culto grande.">
            <button type="button" onClick=${copiarBackup} className=${botaoFraco}>Copiar backup</button>
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-tinta-suave">Ver o backup em texto</summary>
              <pre className="mt-2 overflow-x-auto rounded-xl bg-preto text-creme p-4 text-xs leading-relaxed">${JSON.stringify({ total: total, config: cfg }, null, 2)}</pre>
            </details>
          <//>

        </div>
      </div>

      ${recado ? html`
        <div className=${'fixed left-1/2 -translate-x-1/2 bottom-6 z-50 rounded-xl px-5 py-3 text-sm font-semibold shadow-lg max-w-[90vw] ' + corRecado[recado.tipo]} role="status">
          ${recado.texto}
        </div>
      ` : null}
    </div>
  `;
}

// As três telas: mesa de coleta, telão do projetor e administração.

import { Loja, CONFIG_PADRAO, fmt, aplicarMensagem } from './loja.js';
import {
  html, useState, useEffect, useRef, useCallback,
  NumeroAnimado, BarraProgresso, SeloSync, Marca, Confete,
  useTelaAcesa, useConsultaPeriodica,
} from './ui.js';

const MARCOS = [25, 50, 75, 100];

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
    const lista = (estado.config.mensagens || []).filter((m) => String(m).trim());
    const modelo = lista.length ? lista[(Math.random() * lista.length) | 0] : 'Obrigado por doar {n} {garrafas}!';
    setModal({ n: n, mensagem: aplicarMensagem(modelo, n) });
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

  const botaoSec = 'toque rounded-[1.75rem] bg-verde-fundo text-creme font-display font-black text-4xl md:text-5xl py-6 active:scale-[0.97] transition-transform shadow-lg shadow-verde-fundo/25';

  return html`
    <div className="min-h-full flex flex-col bg-creme" style=${{ paddingLeft: 'max(16px, env(safe-area-inset-left, 0px))', paddingRight: 'max(16px, env(safe-area-inset-right, 0px))' }}>
      <div className="flex-1 w-full max-w-[1500px] mx-auto py-5 md:py-7 flex flex-col">

        <header className="flex items-start justify-between gap-4">
          <${Marca} />
          <div className="text-right">
            <${SeloSync} sync=${estado.sync} />
            <p className="serifa text-base md:text-xl text-tinta-suave mt-1 max-w-sm text-balance">
              ${estado.config.chamada}
            </p>
          </div>
        </header>

        <div className="flex-1 grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] gap-6 md:gap-8 mt-5 md:mt-7 items-stretch">

          <section className="rounded-[2rem] bg-white border border-creme-2 p-6 md:p-8 flex flex-col justify-center">
            <p className="rotulo text-xs text-tinta-suave">Total arrecadado</p>
            <div className="flex items-end gap-3 mt-1">
              <${NumeroAnimado} valor=${total} className="font-display font-black text-7xl md:text-[7.5rem] leading-[0.85] text-verde-fundo" />
              <span className="rotulo text-sm text-tinta-suave pb-3">garrafas</span>
            </div>

            <div className="mt-7">
              <div className="flex items-baseline justify-between mb-2">
                <span className="rotulo text-xs text-tinta-suave">Meta ${fmt(meta)}</span>
                <span className=${'num font-display font-black text-2xl ' + (pct >= 100 ? 'text-dourado' : 'text-verde-fundo')}>
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
              <p className="mt-4 text-xs text-tinta-suave">
                ${fmt(estado.pendentes)} ${estado.pendentes === 1 ? 'garrafa aguardando' : 'garrafas aguardando'} envio ao servidor. Nada se perde.
              </p>
            ` : null}
          </section>

          <section className="flex flex-col gap-4">
            <button
              type="button"
              onClick=${() => registrar(1)}
              key=${'p' + pulso}
              className=${'toque flex-1 min-h-[210px] rounded-[2rem] bg-verde text-white shadow-xl shadow-verde/30 active:scale-[0.98] transition-transform ' + (pulso ? 'pulso' : '')}
            >
              <span className="block font-display font-black text-6xl md:text-8xl leading-none">+1</span>
              <span className="block rotulo text-base md:text-xl mt-3">Garrafa</span>
            </button>

            <div className="grid grid-cols-2 gap-4">
              <button type="button" onClick=${() => registrar(2)} className=${botaoSec}>+2</button>
              <button type="button" onClick=${() => registrar(5)} className=${botaoSec}>+5</button>
            </div>

            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick=${() => registrar(-1)}
                disabled=${sessao <= 0}
                className="toque rounded-2xl border border-creme-2 bg-white px-5 py-3 text-tinta-suave font-semibold disabled:opacity-35"
              >
                −1 corrigir
              </button>
              <div className="text-right min-h-[2.5rem]">
                ${sessao > 0 ? html`
                  <span className="rotulo text-xs text-tinta-suave">Nesta entrega</span>
                  <div className="num font-display font-black text-3xl text-verde-fundo leading-none">${fmt(sessao)}</div>
                ` : html`<span className="rotulo text-xs text-tinta-suave/70">Toque para registrar</span>`}
              </div>
            </div>
          </section>
        </div>

        <footer className="pt-4 pb-1 flex items-center justify-between gap-3">
          <p className="serifa text-sm text-tinta-suave italic hidden sm:block">
            “${estado.config.versiculo}” <span className="not-italic rotulo text-[10px]">${estado.config.versiculoRef}</span>
          </p>
          <div className="flex items-center gap-2 ml-auto">
            <button type="button" onClick=${() => irPara('telao')} className="toque rounded-xl px-3 py-2 text-xs rotulo text-tinta-suave/70 hover:text-tinta">Telão</button>
            <button type="button" onClick=${() => irPara('admin')} aria-label="Abrir administração" className="toque rounded-xl p-2 text-tinta-suave/50 hover:text-tinta">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.9">
                <circle cx="12" cy="12" r="3.2"></circle>
                <path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 9 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 4.6 9a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z"></path>
              </svg>
            </button>
          </div>
        </footer>
      </div>

      ${modal ? html`
        <div className="fixed inset-0 z-50 grid place-items-center bg-verde-noite/95 p-5" role="dialog" aria-modal="true" aria-label="Agradecimento" onClick=${fecharModal}>
          <div className="entra-modal max-w-3xl w-full text-center">
            <div className="mx-auto w-20 h-20 rounded-full bg-verde grid place-items-center mb-7" aria-hidden="true">
              <svg viewBox="0 0 24 24" className="w-10 h-10" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <path d="m4.5 12.5 5 5 10-11"></path>
              </svg>
            </div>
            <p className="serifa text-4xl md:text-6xl leading-[1.12] text-creme text-balance">${modal.mensagem}</p>
            <p className="rotulo text-xs text-verde-claro mt-8">Toque na tela para continuar</p>
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
  const [festa, setFesta] = useState(0);
  const [forte, setForte] = useState(false);
  const [barraVisivel, setBarraVisivel] = useState(false);
  const [agora, setAgora] = useState(() => Date.now());
  const totalAnterior = useRef(total);
  const marcoAnterior = useRef(-1);

  const quantidadeSlides = 1 + fotos.length;
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

  const foto = slide > 0 ? fotos[slide - 1] : null;
  const batida = pct >= 100;

  return html`
    <div className="relative min-h-full bg-grafite text-creme overflow-hidden">

      ${foto ? html`
        <div className="absolute inset-0 entra-slide" key=${'f' + foto.arquivo}>
          <img src=${'fotos/' + foto.arquivo} alt=${foto.legenda || 'Foto da campanha'} className="kenburns w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-grafite via-grafite/40 to-grafite/20"></div>
          ${foto.legenda ? html`
            <p className="absolute left-0 right-0 bottom-28 px-[6vw] serifa text-[clamp(1.4rem,3.2vw,3rem)] text-creme/95 text-balance">
              ${foto.legenda}
            </p>
          ` : null}
        </div>
      ` : html`
        <div className="absolute inset-0 entra-slide" key="contador">
          <div className="absolute inset-0" style=${{ background: 'radial-gradient(120% 90% at 50% 10%, #14663A 0%, #0C3A22 42%, #1B1D1A 100%)' }}></div>

          <div className="relative h-full flex flex-col justify-center px-[6vw] pb-24">
            <p className="rotulo text-[clamp(0.7rem,1.1vw,1.05rem)] text-verde-claro">
              ${estado.config.igreja} · ${estado.config.subtitulo}
            </p>

            <div className="mt-[1.5vh] flex items-end gap-[2vw] flex-wrap">
              <${NumeroAnimado}
                valor=${total}
                className=${'font-display font-black leading-[0.8] text-[clamp(5rem,20vw,17rem)] ' + (batida ? 'text-dourado' : 'text-creme')}
              />
              <span className="rotulo text-[clamp(0.8rem,1.6vw,1.6rem)] text-creme/60 pb-[2.5vh]">garrafas</span>
            </div>

            <div className="mt-[4vh] max-w-[1400px]">
              <div className="flex items-baseline justify-between mb-[1.4vh] gap-4">
                <span className="rotulo text-[clamp(0.7rem,1.1vw,1.05rem)] text-creme/60">Meta ${fmt(meta)} garrafas</span>
                <span className=${'num font-display font-black text-[clamp(1.4rem,3.4vw,3.4rem)] leading-none ' + (batida ? 'text-dourado' : 'text-verde-claro')}>
                  ${pct.toFixed(1).replace('.', ',')}%
                </span>
              </div>
              <${BarraProgresso} pct=${pct} alto=${true} escuro=${true} />
              <p className="mt-[2vh] serifa text-[clamp(1rem,2.1vw,2.1rem)] text-creme/80 text-balance">
                ${batida
                  ? 'Meta alcançada! Toda honra e glória ao Senhor pela nossa Nova Sede.'
                  : 'Faltam ' + fmt(Math.max(0, meta - total)) + ' garrafas para a Nova Sede.'}
              </p>
            </div>

            <p className="mt-[4vh] serifa italic text-[clamp(0.9rem,1.5vw,1.5rem)] text-creme/50 max-w-[55ch] text-balance">
              “${estado.config.versiculo}” <span className="not-italic rotulo text-[0.62em]">${estado.config.versiculoRef}</span>
            </p>
          </div>
        </div>
      `}

      <div
        className="absolute left-0 right-0 bottom-0 z-20 px-[6vw] py-5 flex items-center justify-between gap-4 bg-gradient-to-t from-grafite to-transparent"
        style=${{ paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <${Marca} escuro=${true} compacto=${true} />
        ${foto ? html`
          <div className="flex items-baseline gap-3">
            <span className="rotulo text-[11px] text-creme/50">arrecadado</span>
            <span className=${'num font-display font-black text-3xl md:text-5xl ' + (batida ? 'text-dourado' : 'text-verde-claro')}>${fmt(total)}</span>
          </div>
        ` : html`
          <p className="serifa text-creme/50 text-sm md:text-lg hidden sm:block text-right max-w-md text-balance">
            ${estado.config.chamada}
          </p>
        `}
      </div>

      ${quantidadeSlides > 1 ? html`
        <div className="absolute top-6 right-[6vw] z-20 flex gap-2" aria-hidden="true">
          ${Array.from({ length: quantidadeSlides }).map((_, i) => html`
            <span key=${i} className=${'block h-1.5 rounded-full transition-all duration-500 ' + (i === slide ? 'w-8 bg-verde-claro' : 'w-1.5 bg-creme/25')}></span>
          `)}
        </div>
      ` : null}

      <div className=${'absolute top-5 left-[6vw] z-30 flex items-center gap-3 transition-opacity duration-300 ' + (barraVisivel ? 'opacity-100' : 'opacity-0 pointer-events-none')}>
        <button type="button" onClick=${() => irPara('mesa')} className="toque rounded-xl bg-grafite-2/90 border border-creme/20 px-3 py-2 text-xs rotulo text-creme/80">Mesa</button>
        <button type="button" onClick=${() => irPara('admin')} className="toque rounded-xl bg-grafite-2/90 border border-creme/20 px-3 py-2 text-xs rotulo text-creme/80">Admin</button>
        <${SeloSync} sync=${estado.sync} escuro=${true} />
      </div>

      <${Confete} gatilho=${festa} forte=${forte} />
    </div>
  `;
}

/* ══════════════════════════════════════════════════════════════════════
   Módulo 2 — Administração
   ══════════════════════════════════════════════════════════════════════ */

const entrada = 'w-full rounded-xl border border-creme-2 bg-white px-3.5 py-2.5 text-tinta outline-none focus:border-verde';
const botao = 'toque rounded-xl bg-verde-fundo text-creme px-4 py-2.5 font-semibold active:scale-[0.98] transition-transform disabled:opacity-50';
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
      <div className="min-h-full grid place-items-center bg-creme px-4 py-10">
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
          <button type="button" onClick=${() => irPara('mesa')} className=${botaoFraco + ' w-full mt-2'}>Voltar para a mesa</button>
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
      await Loja.salvarConfig({ mensagens: (cfg.mensagens || []).concat([texto]) }, senha);
      setNovaMensagem('');
    }, 'Frase adicionada ao banco de mensagens.');
  }

  function editarMensagem(i, texto) {
    const lista = (cfg.mensagens || []).slice();
    if (lista[i] === texto) return;          // sair do campo sem mudar nada não grava
    lista[i] = texto;
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

  const corRecado = { ok: 'bg-verde-fundo text-creme', erro: 'bg-red-800 text-white', aviso: 'bg-dourado text-tinta' };

  return html`
    <div className="min-h-full bg-creme pb-16" style=${{ paddingLeft: 'max(16px, env(safe-area-inset-left, 0px))', paddingRight: 'max(16px, env(safe-area-inset-right, 0px))' }}>
      <div className="max-w-5xl mx-auto py-6">

        <header className="flex flex-wrap items-center justify-between gap-4">
          <${Marca} compacto=${true} />
          <div className="flex items-center gap-2">
            <${SeloSync} sync=${estado.sync} />
            <button type="button" onClick=${() => irPara('mesa')} className=${botaoFraco}>Mesa</button>
            <button type="button" onClick=${() => irPara('telao')} className=${botaoFraco}>Telão</button>
          </div>
        </header>

        <h1 className="font-display font-black text-3xl mt-6">Administração</h1>
        <p className="text-tinta-suave mt-1 max-w-[65ch]">
          Tudo o que você mudar aqui aparece na mesa de coleta e no telão em poucos segundos.
        </p>

        ${estado.armazenamento === false ? html`
          <p className="mt-4 rounded-xl border border-dourado/60 bg-dourado/10 px-4 py-3 text-sm text-tinta">
            <strong>Sem sincronia entre aparelhos.</strong> Os dados estão salvos apenas neste navegador.
            Janelas deste mesmo aparelho continuam sincronizadas entre si. Configure o armazenamento na
            Vercel para ligar a sincronia — o README explica.
          </p>
        ` : null}
        ${estado.sync === 'offline' ? html`
          <p className="mt-4 rounded-xl border border-dourado/60 bg-dourado/10 px-4 py-3 text-sm text-tinta">
            <strong>Sem conexão com o servidor agora.</strong> As doações registradas neste aparelho estão
            guardadas e sobem sozinhas quando a rede voltar. Evite redefinir o total enquanto isso.
          </p>
        ` : null}

        <div className="mt-6 grid gap-5">

          <${Secao} titulo="Situação da campanha">
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="rounded-xl bg-creme p-4">
                <span className="rotulo text-[11px] text-tinta-suave">Total atual</span>
                <div className="num font-display font-black text-4xl text-verde-fundo leading-tight">${fmt(total)}</div>
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
            titulo="Banco de mensagens"
            descricao=${'Escreva {n} onde entra a quantidade e {garrafas} onde entra "garrafa" ou "garrafas" — o singular e o plural são acertados sozinhos.'}
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
            <ul className="mt-2 grid gap-3">
              ${(cfg.mensagens || []).map((m, i) => html`
                <li key=${'msg-' + i + '-' + (cfg.mensagens || []).length} className="rounded-xl border border-creme-2 p-3">
                  <textarea
                    id=${'msg-' + i}
                    defaultValue=${m}
                    rows="2"
                    onBlur=${(e) => editarMensagem(i, e.target.value)}
                    className=${entrada + ' resize-y'}
                  ></textarea>
                  <div className="flex items-center justify-between gap-3 mt-2">
                    <p className="serifa text-sm text-tinta-suave italic truncate">${aplicarMensagem(m, 3)}</p>
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
            <pre className="mt-4 overflow-x-auto rounded-xl bg-grafite text-creme p-4 text-xs leading-relaxed">${'[\n  { "arquivo": "maquete-01.jpg", "legenda": "Maquete da Nova Sede" }\n]'}</pre>
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
              <pre className="mt-2 overflow-x-auto rounded-xl bg-grafite text-creme p-4 text-xs leading-relaxed">${JSON.stringify({ total: total, config: cfg }, null, 2)}</pre>
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

// Módulo 1 — Mesa de coleta: o tablet da campanha das garrafas.

import { Loja, fmt, aplicarMensagem } from '../loja.js';
import {
  html, useState, useEffect, useRef, useCallback,
  NumeroAnimado, BarraProgresso, SeloSync, Marca, MarcaIgreja, Confete, Link,
  Assinatura, Escritura, Relogio, FundoMovimento, Muro,
  useTelaAcesa, useConsultaPeriodica,
} from '../ui.js';
import { Apresentacao } from './apresentacao.js';

// Zona de toque da mesa: cerca de um quinto da tela. O clamp evita os dois
// extremos — um botão minúsculo num celular e um botão absurdo numa TV.
const ZONA_TOQUE = 'clamp(130px, 20vh, 195px)';

/* ══════════════════════════════════════════════════════════════════════
   Módulo 1 — Mesa de coleta (tablet)
   ══════════════════════════════════════════════════════════════════════ */

export function Mesa({ estado, irPara }) {
  const total = Loja.total();
  const meta = Math.max(1, Number(estado.config.meta) || 1);
  const pct = (total / meta) * 100;

  // Quanto tempo o agradecimento fica na tela. Um toque fecha antes disso.
  const segundosLeitura = Math.max(3, Number(estado.config.segundosAgradecimento) || 10);
  // Silêncio na mesa até ela voltar à apresentação.
  const segundosRepouso = Math.max(5, Number(estado.config.segundosRepouso) || 30);

  const [sessao, setSessao] = useState(0);
  const [modal, setModal] = useState(null);
  const [pulso, setPulso] = useState(0);
  const [festa, setFesta] = useState(0);
  // A mesa descansa mostrando a mesma apresentação do telão e só revela os
  // botões quando alguém toca. Assim ela fica viva no salão em vez de ser
  // uma tela parada, e quem chega entende que aquilo é um ponto de coleta.
  const [emRepouso, setEmRepouso] = useState(true);
  const timerObrigado = useRef(null);
  const timerFechar = useRef(null);
  const timerRepouso = useRef(null);
  const sessaoRef = useRef(0);

  useTelaAcesa();
  useConsultaPeriodica(15000);   // a mesa quase só escreve; consulta só pega mudanças do admin

  useEffect(() => () => {
    clearTimeout(timerObrigado.current);
    clearTimeout(timerFechar.current);
    clearTimeout(timerRepouso.current);
  }, []);

  const adiarRepouso = useCallback(() => {
    clearTimeout(timerRepouso.current);
    timerRepouso.current = setTimeout(() => setEmRepouso(true), segundosRepouso * 1000);
  }, [segundosRepouso]);

  const acordar = useCallback(() => {
    setEmRepouso(false);
    adiarRepouso();
  }, [adiarRepouso]);

  const fecharModal = useCallback(() => {
    clearTimeout(timerFechar.current);
    setModal(null);
    sessaoRef.current = 0;
    setSessao(0);
    // Entrega concluída: a mesa volta a se apresentar para o próximo irmão.
    clearTimeout(timerRepouso.current);
    setEmRepouso(true);
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
    timerFechar.current = setTimeout(fecharModal, segundosLeitura * 1000);
  }, [estado.config.mensagens, fecharModal, segundosLeitura]);

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
    adiarRepouso();
    try { if (navigator.vibrate) navigator.vibrate(n > 0 ? 18 : 8); } catch (e) { /* sem motor */ }
    clearTimeout(timerObrigado.current);
    if (proxima > 0) timerObrigado.current = setTimeout(abrirAgradecimento, 3000);
  }, [abrirAgradecimento, modal, fecharModal, adiarRepouso]);

  const botaoSec = 'toque brilha-borda rounded-2xl bg-white text-ciano-2 border-2 border-ciano font-display font-black text-2xl md:text-3xl active:scale-[0.97] transition-transform';

  return html`
    <div className="tela-cheia relative flex flex-col bg-creme overflow-hidden" style=${{ paddingLeft: 'max(16px, env(safe-area-inset-left, 0px))', paddingRight: 'max(16px, env(safe-area-inset-right, 0px))' }}>

      ${emRepouso && !modal ? html`
        <div
          className="absolute inset-0 z-40"
          onClick=${acordar}
          role="button"
          tabIndex="0"
          aria-label="Tocar para registrar garrafas"
          onKeyDown=${(ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); acordar(); } }}
        >
          <${Apresentacao} estado=${estado} dica="Toque para registrar garrafas" />
        </div>
      ` : null}

      <${FundoMovimento} />

      <div className="relative flex-1 w-full max-w-[1500px] mx-auto py-4 md:py-6 flex flex-col gap-4 md:gap-6">

        <header className="flex items-center justify-between gap-4 flex-wrap">
          <${MarcaIgreja} igreja=${estado.config.igreja} cidade=${estado.config.cidade} tamanho="md" />

          <div className="flex items-center gap-4 md:gap-6">
            <div className="hidden sm:block"><${Marca} compacto=${true} /></div>
            <div className="text-right">
              <${Relogio} className="text-2xl md:text-4xl leading-none" />
              <div className="mt-1"><${SeloSync} sync=${estado.sync} /></div>
            </div>
          </div>
        </header>

        <section className="flex-1 rounded-[2rem] bg-white/85 backdrop-blur border border-creme-2 p-5 md:p-8 flex flex-col justify-center min-h-0">
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
            className=${'toque respira h-full rounded-[2rem] bg-ciano text-white active:scale-[0.98] transition-transform ' + (pulso ? 'pulso' : '')}
          >
            <span className="block font-display font-black text-4xl md:text-5xl leading-none">+1</span>
            <span className="block rotulo text-xs md:text-sm mt-1">Garrafa</span>
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
          <div className="min-w-0">
            <${Assinatura} texto=${estado.config.tagline} className="text-lg md:text-2xl -rotate-1 max-w-[28ch]" />
            <${Escritura}
              texto=${estado.config.versiculo}
              referencia=${estado.config.versiculoRef}
              className="text-sm md:text-base text-tinta-suave max-w-[60ch] mt-1 mb-0"
            />
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <${Link} para="telao" irPara=${irPara} className="toque rounded-xl px-3 py-2 text-xs rotulo text-tinta-suave/70 hover:text-tinta no-underline">Telão<//>
            <${Link} para="obra" irPara=${irPara} className="toque rounded-xl px-3 py-2 text-xs rotulo text-tinta-suave/70 hover:text-tinta no-underline">Obra<//>
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
        <div className="fixed inset-0 z-50 grid place-items-center bg-noite/95 p-5" role="dialog" aria-modal="true" aria-label="Agradecimento" onClick=${fecharModal}>
          <div className="entra-modal max-w-4xl w-full text-center">
            <div className="mx-auto w-20 h-20 rounded-full bg-ciano grid place-items-center mb-7" aria-hidden="true">
              <svg viewBox="0 0 24 24" className="w-10 h-10" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
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
                  className="text-2xl md:text-4xl leading-[1.3] text-ciano-claro m-0"
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

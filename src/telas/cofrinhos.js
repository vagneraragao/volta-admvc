// Campanha 4 — Cofrinhos, do cartaz img/img3.jpg.
//
// Mesma identidade da marca-guarda-chuva dos carnês. A diferença de conteúdo é
// que aqui o número que a equipe precisa ver não é só o dinheiro: é quantos
// cofrinhos ainda estão na casa dos irmãos, porque é isso que se vai buscar.

import { Loja, fmt } from '../loja.js';
import { contasDosCofrinhos, moeda } from '../campanhas.js';
import {
  html, useState, useEffect, useCallback,
  NumeroAnimado, BarraProgresso, SeloSync, MarcaIgreja, Link,
  Escritura, Relogio, FundoMovimento,
  useTelaAcesa, useConsultaPeriodica,
} from '../ui.js';
import { Campo, Secao, entrada, botao } from './pecas.js';

/** A caixinha de papelão do cartaz, com a fenda no topo. */
function Cofrinho({ cheio, className }) {
  return html`
    <svg viewBox="0 0 60 66" className=${className} aria-hidden="true">
      <path d="M8 22 30 12l22 10v36a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2Z"
            fill=${cheio ? '#C89B4A' : 'none'} stroke="#C89B4A" stroke-width="2.5" stroke-linejoin="round"></path>
      <path d="M8 22 30 12l22 10-22 9Z" fill=${cheio ? '#A87F36' : 'none'} stroke="#C89B4A" stroke-width="2.5" stroke-linejoin="round"></path>
      <rect x="23" y="17" width="14" height="3" rx="1.5" fill=${cheio ? '#4A5D3A' : '#C89B4A'}></rect>
    </svg>
  `;
}

export function Cofrinhos({ estado, irPara }) {
  const c = contasDosCofrinhos(estado.cofrinhos);
  const k = c.cofrinhos;
  const [barraVisivel, setBarraVisivel] = useState(false);

  useTelaAcesa();
  useConsultaPeriodica(20000);

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

  // Até 24 caixinhas desenhadas; acima disso o desenho vira ruído e os números
  // ao lado continuam dizendo a verdade exata.
  const desenhados = Math.min(24, k.entregues);
  const cheiosDesenhados = k.entregues > 0
    ? Math.round((k.devolvidos / k.entregues) * desenhados)
    : 0;

  return html`
    <div className="tela-cheia relative bg-oliva text-white overflow-hidden">
      <${FundoMovimento} escuro=${true} />

      <div className="relative h-full flex flex-col justify-center px-[6vw] py-[10vh]">
        <p className="rotulo text-[clamp(0.6rem,1vw,0.9rem)] text-dourado text-balance max-w-[40ch]">
          ${k.guardaChuva}
        </p>
        <h1 className="font-display font-black leading-[0.9] text-[clamp(2rem,7vw,5.5rem)] mt-2 uppercase">
          ${k.titulo}
        </h1>

        <div className="mt-[4vh] grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-[4vw] items-start">

          <div>
            <ol className="grid gap-3">
              ${k.passos.map((passo, i) => html`
                <li key=${i} className="flex gap-3 items-start">
                  <span className="shrink-0 w-7 h-7 rounded-full bg-dourado text-oliva-2 grid place-items-center font-display font-black text-sm">
                    ${i + 1}
                  </span>
                  <span className="font-display font-semibold text-[clamp(0.9rem,1.7vw,1.5rem)] leading-snug text-white/90">
                    ${passo}
                  </span>
                </li>
              `)}
            </ol>

            ${desenhados > 0 ? html`
              <div className="mt-[4vh] flex flex-wrap gap-2">
                ${Array.from({ length: desenhados }).map((_, i) => html`
                  <${Cofrinho} key=${i} cheio=${i < cheiosDesenhados} className="w-8 h-9 md:w-10 md:h-11" />
                `)}
                ${k.entregues > desenhados ? html`
                  <span className="rotulo text-[10px] text-white/50 self-end pb-1">+${fmt(k.entregues - desenhados)}</span>
                ` : null}
              </div>
            ` : null}
          </div>

          <div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <${NumeroAnimado} valor=${k.entregues} className="font-display font-black text-[clamp(1.8rem,5vw,3.8rem)] leading-none text-white" />
                <div className="rotulo text-[clamp(0.5rem,0.85vw,0.75rem)] text-white/60 mt-1">Entregues</div>
              </div>
              <div>
                <${NumeroAnimado} valor=${k.devolvidos} className="font-display font-black text-[clamp(1.8rem,5vw,3.8rem)] leading-none text-dourado" />
                <div className="rotulo text-[clamp(0.5rem,0.85vw,0.75rem)] text-white/60 mt-1">Devolvidos</div>
              </div>
              <div>
                <${NumeroAnimado} valor=${c.naRua} className="font-display font-black text-[clamp(1.8rem,5vw,3.8rem)] leading-none text-white/70" />
                <div className="rotulo text-[clamp(0.5rem,0.85vw,0.75rem)] text-white/60 mt-1">Ainda na rua</div>
              </div>
            </div>

            <div className="mt-[3vh]">
              <${BarraProgresso} pct=${c.pct} alto=${true} escuro=${true} />
              <p className="rotulo text-[11px] text-white/55 mt-2">
                ${c.pct.toFixed(0)}% dos cofrinhos já voltaram · prazo de ${fmt(k.meses)} meses
              </p>
            </div>

            <div className="mt-[3vh]">
              <div className="num font-display font-black text-[clamp(1.8rem,5vw,3.6rem)] leading-none">${moeda(k.arrecadado, k.moeda)}</div>
              <div className="rotulo text-[clamp(0.55rem,0.9vw,0.8rem)] text-white/60 mt-1">
                Já arrecadado${c.mediaPorCofrinho > 0 ? ' · média de ' + moeda(c.mediaPorCofrinho, k.moeda) + ' por cofrinho' : ''}
              </div>
            </div>

            <${Escritura}
              texto=${k.versiculo}
              referencia=${k.versiculoRef}
              className="mt-[3vh] text-[clamp(0.85rem,1.5vw,1.3rem)] text-white/60 max-w-[50ch] m-0"
            />
          </div>
        </div>
      </div>

      <div
        className="absolute left-0 right-0 bottom-0 z-20 px-[6vw] py-5 bg-gradient-to-t from-oliva-2 to-transparent"
        style=${{ paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <${MarcaIgreja} igreja=${estado.config.igreja} cidade=${estado.config.cidade} escuro=${true} tamanho="md" />
      </div>

      <div className="absolute top-5 right-[6vw] z-20">
        <${Relogio} escuro=${true} className="text-[clamp(1.2rem,2.6vw,2.2rem)] leading-none" />
      </div>

      <div className=${'absolute top-5 left-[6vw] z-30 flex items-center gap-3 transition-opacity duration-300 ' + (barraVisivel ? 'opacity-100' : 'opacity-0 pointer-events-none')}>
        <${Link} para="mesa" irPara=${irPara} className="toque rounded-xl bg-oliva-2/90 border border-white/20 px-3 py-2 text-xs rotulo text-white/80 no-underline">Mesa<//>
        <${Link} para="carnes" irPara=${irPara} className="toque rounded-xl bg-oliva-2/90 border border-white/20 px-3 py-2 text-xs rotulo text-white/80 no-underline">Carnês<//>
        <${Link} para="admin" irPara=${irPara} className="toque rounded-xl bg-oliva-2/90 border border-white/20 px-3 py-2 text-xs rotulo text-white/80 no-underline">Admin<//>
        <${SeloSync} sync=${estado.sync} escuro=${true} />
      </div>
    </div>
  `;
}

/* ── A seção correspondente no painel ─────────────────────────────────── */

export function SecaoCofrinhos({ estado, senha, avisar }) {
  const c = contasDosCofrinhos(estado.cofrinhos);
  const k = c.cofrinhos;

  const doEstado = useCallback((x) => ({
    titulo: x.titulo,
    guardaChuva: x.guardaChuva,
    moeda: x.moeda,
    meses: String(x.meses),
    entregues: String(x.entregues),
    devolvidos: String(x.devolvidos),
    arrecadado: String(x.arrecadado),
  }), []);

  const [r, setR] = useState(() => doEstado(k));
  const [sujo, setSujo] = useState(false);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (sujo) return;
    setR(doEstado(k));
  }, [estado.cofrinhos, sujo, doEstado]);   // eslint-disable-line

  const mudar = useCallback((campo, valor) => {
    setSujo(true);
    setR((a) => Object.assign({}, a, { [campo]: valor }));
  }, []);

  const previa = contasDosCofrinhos({
    entregues: parseInt(r.entregues, 10) || 0,
    devolvidos: parseInt(r.devolvidos, 10) || 0,
    arrecadado: parseFloat(r.arrecadado) || 0,
  });

  function salvar(ev) {
    ev.preventDefault();
    setSalvando(true);
    Loja.salvarCampanha('cofrinhos', {
      titulo: r.titulo.trim(),
      guardaChuva: r.guardaChuva.trim(),
      moeda: r.moeda.trim() || '€',
      meses: parseInt(r.meses, 10) || 3,
      entregues: parseInt(r.entregues, 10) || 0,
      devolvidos: parseInt(r.devolvidos, 10) || 0,
      arrecadado: parseFloat(r.arrecadado) || 0,
    }, senha).then(
      () => { setSujo(false); avisar('ok', 'Campanha dos cofrinhos atualizada.'); },
      (e) => avisar('erro', (e && e.message) || 'Não consegui salvar.')
    ).then(() => setSalvando(false));
  }

  const excedeu = (parseInt(r.devolvidos, 10) || 0) > (parseInt(r.entregues, 10) || 0);

  return html`
    <${Secao}
      titulo="Campanha dos cofrinhos"
      descricao=${'Três números. O que mais interessa numa campanha de prazo é quantos ainda estão na rua — é essa a lista que a equipe vai buscar.'}
    >
      <div className="grid sm:grid-cols-3 gap-3">
        <div className="rounded-xl bg-creme p-4">
          <span className="rotulo text-[11px] text-tinta-suave">Ainda na rua</span>
          <div className="num font-display font-black text-3xl leading-tight">${fmt(previa.naRua)}</div>
        </div>
        <div className="rounded-xl bg-creme p-4">
          <span className="rotulo text-[11px] text-tinta-suave">Já voltaram</span>
          <div className="num font-display font-black text-3xl leading-tight">${previa.pct.toFixed(0)}%</div>
        </div>
        <div className="rounded-xl bg-creme p-4">
          <span className="rotulo text-[11px] text-tinta-suave">Média por cofrinho</span>
          <div className="num font-display font-black text-3xl leading-tight">${moeda(previa.mediaPorCofrinho, r.moeda)}</div>
        </div>
      </div>
      ${excedeu ? html`
        <p className="mt-2 text-xs text-red-800">
          Devolvidos não pode passar de entregues — ao salvar, o número será limitado, para o
          telão não anunciar mais de 100% de retorno.
        </p>
      ` : null}

      <form onSubmit=${salvar} className="grid md:grid-cols-3 gap-4 mt-5">
        <${Campo} rotulo="Cofrinhos entregues">
          <input id="cof-entregues" type="number" min="0" value=${r.entregues} onChange=${(e) => mudar('entregues', e.target.value)} className=${entrada} />
        <//>
        <${Campo} rotulo="Já devolvidos">
          <input id="cof-devolvidos" type="number" min="0" value=${r.devolvidos} onChange=${(e) => mudar('devolvidos', e.target.value)} className=${entrada} />
        <//>
        <${Campo} rotulo="Total arrecadado">
          <input id="cof-arrecadado" type="number" min="0" step="any" value=${r.arrecadado} onChange=${(e) => mudar('arrecadado', e.target.value)} className=${entrada} />
        <//>
        <${Campo} rotulo="Prazo em meses">
          <input id="cof-meses" type="number" min="1" value=${r.meses} onChange=${(e) => mudar('meses', e.target.value)} className=${entrada} />
        <//>
        <${Campo} rotulo="Título">
          <input id="cof-titulo" type="text" value=${r.titulo} onChange=${(e) => mudar('titulo', e.target.value)} className=${entrada} />
        <//>
        <${Campo} rotulo="Símbolo da moeda">
          <input id="cof-moeda" type="text" value=${r.moeda} onChange=${(e) => mudar('moeda', e.target.value)} className=${entrada} />
        <//>
        <div className="md:col-span-3">
          <button type="submit" disabled=${salvando} className=${botao}>Salvar campanha dos cofrinhos</button>
        </div>
      </form>
    <//>
  `;
}

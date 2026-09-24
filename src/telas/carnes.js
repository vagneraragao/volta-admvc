// Campanha 3 — Carnês ADMVC, do cartaz img/img5.jpg.
//
// Identidade da marca-guarda-chuva "Estamos em uma grande obra e não podemos
// parar!" (img/img4.png): verde-oliva com dourado, diferente do ciano do VOLTA
// e do terracota dos tijolos. Cada campanha tem a cara do seu próprio cartaz.

import { Loja, fmt } from '../loja.js';
import { contasDosCarnes, moeda } from '../campanhas.js';
import {
  html, useState, useEffect, useCallback,
  NumeroAnimado, BarraProgresso, SeloSync, MarcaIgreja, Link,
  Escritura, Relogio, FundoMovimento,
  useTelaAcesa, useConsultaPeriodica,
} from '../ui.js';
import { Campo, Secao, entrada, botao } from './pecas.js';

/** Um cupom do carnê, como no cartaz: a tarja colorida à direita e o canhoto
 *  separado por um picote. É ilustração — a contabilidade são dois números. */
function Cupom({ plano, parcelas, moedaSimbolo }) {
  return html`
    <li
      className="relative rounded-lg bg-white overflow-hidden flex shadow-sm"
      style=${{ borderLeft: '6px solid ' + plano.cor }}
    >
      <div className="flex-1 min-w-0 px-4 py-3">
        <div className="rotulo text-[9px] text-tinta-suave">Igreja ADMVC</div>
        <div className="font-display font-black text-[clamp(0.95rem,1.8vw,1.5rem)] leading-tight truncate" style=${{ color: plano.cor }}>
          ${plano.nome}
        </div>
        <div className="num text-xs text-tinta-suave mt-1">
          ${plano.valor > 0 ? moeda(plano.valor, moedaSimbolo) + ' · ' : ''}parcela 1/${fmt(parcelas)}
        </div>
      </div>
      <div
        className="w-12 shrink-0 grid place-items-center border-l border-dashed border-creme-2"
        style=${{ background: plano.cor }}
      >
        <span className="rotulo text-[8px] text-white -rotate-90 whitespace-nowrap">1/${fmt(parcelas)}</span>
      </div>
    </li>
  `;
}

export function Carnes({ estado, irPara }) {
  const c = contasDosCarnes(estado.carnes);
  const k = c.carnes;
  const [barraVisivel, setBarraVisivel] = useState(false);

  useTelaAcesa();
  useConsultaPeriodica(20000);   // lançamento manual; não precisa de ritmo de coleta

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
    <div className="tela-cheia relative bg-oliva text-white overflow-hidden">
      <${FundoMovimento} escuro=${true} />

      <div className="relative h-full flex flex-col justify-center px-[6vw] py-[10vh]">
        <p className="rotulo text-[clamp(0.6rem,1vw,0.9rem)] text-dourado text-balance max-w-[40ch]">
          ${k.guardaChuva}
        </p>
        <h1 className="font-display font-black leading-[0.9] text-[clamp(2rem,7vw,5.5rem)] mt-2">
          ${k.titulo}
        </h1>

        <div className="mt-[4vh] grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-[4vw] items-start">

          <ul className="grid gap-2.5">
            ${k.planos.map((p, i) => html`
              <${Cupom} key=${i} plano=${p} parcelas=${k.parcelas} moedaSimbolo=${k.moeda} />
            `)}
          </ul>

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

            <div className="mt-[4vh] grid grid-cols-2 gap-4">
              <div>
                <${NumeroAnimado} valor=${k.retirados} className="font-display font-black text-[clamp(2rem,6vw,4.5rem)] leading-none text-dourado" />
                <div className="rotulo text-[clamp(0.55rem,0.9vw,0.8rem)] text-white/60 mt-1">Carnês retirados</div>
              </div>
              <div>
                <div className="num font-display font-black text-[clamp(1.6rem,4.5vw,3.4rem)] leading-none">${moeda(k.arrecadado, k.moeda)}</div>
                <div className="rotulo text-[clamp(0.55rem,0.9vw,0.8rem)] text-white/60 mt-1">Já arrecadado</div>
              </div>
            </div>

            ${c.temPrevisao ? html`
              <div className="mt-[3vh]">
                <${BarraProgresso} pct=${c.pct} alto=${true} escuro=${true} />
                <p className="rotulo text-[11px] text-white/55 mt-2">
                  ${c.pct.toFixed(1).replace('.', ',')}% do previsto (${moeda(c.previsto, k.moeda)} em ${fmt(k.parcelas)} parcelas)
                </p>
              </div>
            ` : null}

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
        <${Link} para="cofrinhos" irPara=${irPara} className="toque rounded-xl bg-oliva-2/90 border border-white/20 px-3 py-2 text-xs rotulo text-white/80 no-underline">Cofrinhos<//>
        <${Link} para="admin" irPara=${irPara} className="toque rounded-xl bg-oliva-2/90 border border-white/20 px-3 py-2 text-xs rotulo text-white/80 no-underline">Admin<//>
        <${SeloSync} sync=${estado.sync} escuro=${true} />
      </div>
    </div>
  `;
}

/* ── A seção correspondente no painel ─────────────────────────────────── */

export function SecaoCarnes({ estado, senha, avisar }) {
  const c = contasDosCarnes(estado.carnes);
  const k = c.carnes;

  const doEstado = useCallback((x) => ({
    titulo: x.titulo,
    guardaChuva: x.guardaChuva,
    moeda: x.moeda,
    parcelas: String(x.parcelas),
    retirados: String(x.retirados),
    arrecadado: String(x.arrecadado),
    planos: x.planos.map((p) => ({ nome: p.nome, valor: String(p.valor), cor: p.cor })),
  }), []);

  const [r, setR] = useState(() => doEstado(k));
  const [sujo, setSujo] = useState(false);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (sujo) return;
    setR(doEstado(k));
  }, [estado.carnes, sujo, doEstado]);   // eslint-disable-line

  const mudar = useCallback((campo, valor) => {
    setSujo(true);
    setR((a) => Object.assign({}, a, { [campo]: valor }));
  }, []);

  const mudarPlano = useCallback((i, campo, valor) => {
    setSujo(true);
    setR((a) => {
      const planos = a.planos.slice();
      planos[i] = Object.assign({}, planos[i], { [campo]: valor });
      return Object.assign({}, a, { planos: planos });
    });
  }, []);

  function salvar(ev) {
    ev.preventDefault();
    setSalvando(true);
    Loja.salvarCampanha('carnes', {
      titulo: r.titulo.trim(),
      guardaChuva: r.guardaChuva.trim(),
      moeda: r.moeda.trim() || '€',
      parcelas: parseInt(r.parcelas, 10) || 10,
      retirados: parseInt(r.retirados, 10) || 0,
      arrecadado: parseFloat(r.arrecadado) || 0,
      planos: r.planos.map((p) => ({ nome: p.nome.trim(), valor: parseFloat(p.valor) || 0, cor: p.cor })),
    }, senha).then(
      () => { setSujo(false); avisar('ok', 'Campanha dos carnês atualizada.'); },
      (e) => avisar('erro', (e && e.message) || 'Não consegui salvar.')
    ).then(() => setSalvando(false));
  }

  return html`
    <${Secao}
      titulo="Campanha dos carnês"
      descricao=${'Dois números são a contabilidade: quantos carnês saíram e quanto já entrou. Os planos são ilustração do cartaz — um plano sem valor aparece no cupom sem preço, em vez de anunciar zero.'}
    >
      <form onSubmit=${salvar} className="grid md:grid-cols-3 gap-4">
        <${Campo} rotulo="Carnês retirados">
          <input id="carnes-retirados" type="number" min="0" value=${r.retirados} onChange=${(e) => mudar('retirados', e.target.value)} className=${entrada} />
        <//>
        <${Campo} rotulo="Já arrecadado">
          <input id="carnes-arrecadado" type="number" min="0" step="any" value=${r.arrecadado} onChange=${(e) => mudar('arrecadado', e.target.value)} className=${entrada} />
        <//>
        <${Campo} rotulo="Parcelas por carnê">
          <input id="carnes-parcelas" type="number" min="1" value=${r.parcelas} onChange=${(e) => mudar('parcelas', e.target.value)} className=${entrada} />
        <//>

        <div className="md:col-span-3">
          <span className="rotulo text-[11px] text-tinta-suave">Planos do cartaz</span>
          <ul className="grid sm:grid-cols-2 gap-3 mt-2">
            ${r.planos.map((p, i) => html`
              <li key=${i} className="flex gap-2 items-center rounded-xl border border-creme-2 p-2">
                <input
                  id=${'plano-cor-' + i}
                  type="color"
                  value=${p.cor}
                  onChange=${(e) => mudarPlano(i, 'cor', e.target.value)}
                  className="w-9 h-9 shrink-0 rounded cursor-pointer border border-creme-2"
                  aria-label="Cor do plano"
                />
                <input id=${'plano-nome-' + i} type="text" value=${p.nome} onChange=${(e) => mudarPlano(i, 'nome', e.target.value)} className=${entrada + ' text-sm'} />
                <input id=${'plano-valor-' + i} type="number" min="0" step="any" value=${p.valor} onChange=${(e) => mudarPlano(i, 'valor', e.target.value)} className=${entrada + ' text-sm w-24 shrink-0'} placeholder="0" />
              </li>
            `)}
          </ul>
          <p className="text-xs text-tinta-suave mt-2">
            Os valores de <strong>Propósito</strong> e <strong>Davi</strong> estavam ilegíveis no
            cartaz e ficaram em zero — preencha-os aqui.
          </p>
        </div>

        <div className="md:col-span-2">
          <${Campo} rotulo="Título">
            <input id="carnes-titulo" type="text" value=${r.titulo} onChange=${(e) => mudar('titulo', e.target.value)} className=${entrada} />
          <//>
        </div>
        <${Campo} rotulo="Símbolo da moeda">
          <input id="carnes-moeda" type="text" value=${r.moeda} onChange=${(e) => mudar('moeda', e.target.value)} className=${entrada} />
        <//>
        <div className="md:col-span-3">
          <${Campo} rotulo="Frase da marca">
            <input id="carnes-guarda" type="text" value=${r.guardaChuva} onChange=${(e) => mudar('guardaChuva', e.target.value)} className=${entrada} />
          <//>
        </div>
        <div className="md:col-span-3">
          <button type="submit" disabled=${salvando} className=${botao}>Salvar campanha dos carnês</button>
        </div>
      </form>
    <//>
  `;
}

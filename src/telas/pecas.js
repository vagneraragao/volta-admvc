// Peças de formulário do painel: os estilos e os dois invólucros que todas
// as seções usam. Ficam à parte porque são compartilhados pelas quatro
// campanhas — duplicá-los seria garantir que um dia divergiriam.

import { html } from '../ui.js';

const entrada = 'w-full rounded-xl border border-creme-2 bg-white px-3.5 py-2.5 text-tinta outline-none focus:border-ciano';
const botao = 'toque rounded-xl bg-noite text-creme px-4 py-2.5 font-semibold active:scale-[0.98] transition-transform disabled:opacity-50';
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

/** A campanha da construção dentro do mesmo painel. Fica num componente
 *  próprio para ter o seu rascunho isolado do resto dos ajustes: são dois

export { Campo, Secao, entrada, botao, botaoFraco };

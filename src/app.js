// Ponto de entrada: escolhe a tela e monta o React.
//
// Aqui, diferente do Artifact, a página é dona da própria URL — então
// `#/telao` e `#/admin` funcionam de verdade e podem ser salvos como
// favorito. O modo também fica guardado por aparelho: a máquina do projetor
// escolhe "Telão" uma vez e abre assim para sempre.

import { Loja } from './loja.js';
import { html, useState, useEffect, useCallback } from './ui.js';
import { Mesa, Telao, Admin } from './telas.js';

function modoInicial() {
  const daUrl = (location.hash || '').replace(/^#\/?/, '');
  if (daUrl === 'telao' || daUrl === 'admin' || daUrl === 'mesa') return daUrl;
  const salvo = Loja.modo();
  return salvo === 'telao' || salvo === 'admin' ? salvo : 'mesa';
}

function App() {
  const estado = React.useSyncExternalStore(Loja.assinar, Loja.obter);
  const [modo, setModo] = useState(modoInicial);

  const irPara = useCallback((m) => {
    setModo(m);
    // O admin não é lembrado de propósito: ninguém quer o tablet da mesa
    // abrindo na tela de configuração depois de uma queda de energia.
    if (m === 'telao' || m === 'mesa') Loja.definirModo(m);
    try { history.replaceState(null, '', '#/' + m); } catch (e) { /* aberto por file:// */ }
  }, []);

  useEffect(() => {
    document.body.setAttribute('data-modo', modo);
  }, [modo]);

  useEffect(() => {
    const aoTrocarHash = () => setModo(modoInicial());
    window.addEventListener('hashchange', aoTrocarHash);
    return () => window.removeEventListener('hashchange', aoTrocarHash);
  }, []);

  if (modo === 'telao') return html`<${Telao} estado=${estado} irPara=${irPara} />`;
  if (modo === 'admin') return html`<${Admin} estado=${estado} irPara=${irPara} />`;
  return html`<${Mesa} estado=${estado} irPara=${irPara} />`;
}

ReactDOM.createRoot(document.getElementById('raiz')).render(html`<${App} />`);

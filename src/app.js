// Ponto de entrada: escolhe a tela pela URL e monta o React.
//
//   /        mesa de coleta (tablet)
//   /telao   telão do projetor
//   /construcao  campanha dos tijolos
//   /carnes      campanha dos carnês
//   /cofrinhos   campanha dos cofrinhos
//   /admin   administração
//
// A URL manda. Quem já salvou #/telao nos favoritos continua funcionando.

import { Loja } from './loja.js';
import { html, useState, useEffect, useCallback } from './ui.js';
import { Mesa, Telao, Obra, Carnes, Cofrinhos, Admin } from './telas.js';
import { modoDaUrl, navegarPara } from './rotas.js';

function App() {
  const estado = React.useSyncExternalStore(Loja.assinar, Loja.obter);
  const [modo, setModo] = useState(modoDaUrl);

  const irPara = useCallback((m) => {
    navegarPara(m);
    setModo(m);
  }, []);

  useEffect(() => {
    document.body.setAttribute('data-modo', modo);
  }, [modo]);

  // Botão voltar do navegador e favoritos antigos com #/.
  useEffect(() => {
    const aoMudarUrl = () => setModo(modoDaUrl());
    window.addEventListener('popstate', aoMudarUrl);
    window.addEventListener('hashchange', aoMudarUrl);
    return () => {
      window.removeEventListener('popstate', aoMudarUrl);
      window.removeEventListener('hashchange', aoMudarUrl);
    };
  }, []);

  if (modo === 'telao') return html`<${Telao} estado=${estado} irPara=${irPara} />`;
  if (modo === 'obra') return html`<${Obra} estado=${estado} irPara=${irPara} />`;
  if (modo === 'carnes') return html`<${Carnes} estado=${estado} irPara=${irPara} />`;
  if (modo === 'cofrinhos') return html`<${Cofrinhos} estado=${estado} irPara=${irPara} />`;
  if (modo === 'admin') return html`<${Admin} estado=${estado} irPara=${irPara} />`;
  return html`<${Mesa} estado=${estado} irPara=${irPara} />`;
}

ReactDOM.createRoot(document.getElementById('raiz')).render(html`<${App} />`);

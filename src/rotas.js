// Rotas de verdade: /, /telao e /admin.
//
// A URL é a única fonte da verdade sobre qual tela mostrar. Antes o aparelho
// "lembrava" a escolha feita num botão, o que tornava impossível mandar alguém
// abrir o telão por link — e deixava o tablet abrindo na tela errada depois de
// uma queda de energia. Agora a máquina do projetor guarda /telao nos favoritos
// e pronto.
//
// Para que /telao funcione ao recarregar a página, o servidor precisa devolver
// o index.html nesses caminhos: no Vercel isso está em `vercel.json`
// (`rewrites`), e localmente o `npm run servir` usa `serve -s`.

export const CAMINHOS = {
  mesa: '/',
  telao: '/telao',
  admin: '/admin',
};

export function caminhoDe(modo) {
  return CAMINHOS[modo] || CAMINHOS.mesa;
}

/** Lê o modo a partir da URL. Aceita também o formato antigo com #/, para
 *  quem já salvou um favorito assim. */
export function modoDaUrl() {
  let caminho = (location.pathname || '/').replace(/\/index\.html$/i, '/');
  caminho = caminho.replace(/(.)\/+$/, '$1');   // tira a barra final, menos da raiz

  if (caminho === '/telao') return 'telao';
  if (caminho === '/admin') return 'admin';

  const doHash = (location.hash || '').replace(/^#\/?/, '');
  if (doHash === 'telao' || doHash === 'admin' || doHash === 'mesa') return doHash;

  return 'mesa';
}

/** Navega sem recarregar. Devolve false quando o navegador não deixa
 *  (página aberta por file://), e aí quem chamou decide o que fazer. */
export function navegarPara(modo) {
  try {
    history.pushState(null, '', caminhoDe(modo));
    return true;
  } catch (e) {
    return false;
  }
}

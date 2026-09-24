// Módulo de administração: um painel, uma seção por campanha.

import { Loja, CONFIG_PADRAO, fmt, aplicarMensagem } from '../loja.js';
import { contasDaObra, moeda } from '../campanhas.js';
import {
  html, useState, useEffect, useRef, useCallback,
  NumeroAnimado, BarraProgresso, SeloSync, Marca, MarcaIgreja, Confete, Link,
  Assinatura, Escritura, Relogio, FundoMovimento, Muro,
  useTelaAcesa, useConsultaPeriodica,
} from '../ui.js';
import { Campo, Secao, entrada, botao, botaoFraco } from './pecas.js';
import { SecaoCarnes } from './carnes.js';
import { SecaoCofrinhos } from './cofrinhos.js';

function SecaoObra({ estado, senha, avisar }) {
  const c = contasDaObra(estado.obra);
  const o = c.obra;

  const doObra = useCallback((x) => ({
    titulo: x.titulo,
    subtitulo: x.subtitulo,
    moeda: x.moeda,
    valorObra: String(x.valorObra),
    valorTijolo: String(x.valorTijolo),
    arrecadado: String(x.arrecadado),
    contribuintes: String(x.contribuintes),
    chamada: x.chamada,
    assinatura: x.assinatura,
    rodape: x.rodape,
    versiculo: x.versiculo,
    versiculoRef: x.versiculoRef,
  }), []);

  const [r, setR] = useState(() => doObra(o));
  const [sujo, setSujo] = useState(false);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (sujo) return;
    setR(doObra(o));
  }, [estado.obra, sujo, doObra]);   // eslint-disable-line

  const mudar = useCallback((campo, valor) => {
    setSujo(true);
    setR((atual) => Object.assign({}, atual, { [campo]: valor }));
  }, []);

  // A prévia usa o que está DIGITADO, não o que está salvo: assim dá para ver
  // quantos tijolos um valor novo assenta antes de gravar.
  const previa = contasDaObra({
    valorObra: parseFloat(r.valorObra) || 0,
    valorTijolo: parseFloat(r.valorTijolo) || 1,
    arrecadado: parseFloat(r.arrecadado) || 0,
  });

  function salvar(ev) {
    ev.preventDefault();
    setSalvando(true);
    Loja.salvarCampanha('obra', {
      titulo: r.titulo.trim(),
      subtitulo: r.subtitulo.trim(),
      moeda: r.moeda.trim() || '€',
      valorObra: parseFloat(r.valorObra) || 0,
      valorTijolo: parseFloat(r.valorTijolo) || 1,
      arrecadado: parseFloat(r.arrecadado) || 0,
      contribuintes: parseInt(r.contribuintes, 10) || 0,
      chamada: r.chamada.trim(),
      assinatura: r.assinatura.trim(),
      rodape: r.rodape.trim(),
      versiculo: r.versiculo.trim(),
      versiculoRef: r.versiculoRef.trim(),
    }, senha).then(
      () => { setSujo(false); avisar('ok', 'Campanha da construção atualizada.'); },
      (e) => avisar('erro', (e && e.message) || 'Não consegui salvar.')
    ).then(() => setSalvando(false));
  }

  return html`
    <${Secao}
      titulo="Campanha da construção"
      descricao=${'A obra é dividida em tijolos simbólicos. O dinheiro é o dado real; os tijolos são calculados a partir dele, para as duas contas nunca discordarem.'}
    >
      <div className="grid sm:grid-cols-4 gap-3">
        <div className="rounded-xl bg-creme p-4">
          <span className="rotulo text-[11px] text-tinta-suave">Tijolos colocados</span>
          <div className="num font-display font-black text-3xl text-tijolo leading-tight">${fmt(previa.colocados)}</div>
        </div>
        <div className="rounded-xl bg-creme p-4">
          <span className="rotulo text-[11px] text-tinta-suave">Ainda faltam</span>
          <div className="num font-display font-black text-3xl leading-tight">${fmt(previa.faltam)}</div>
        </div>
        <div className="rounded-xl bg-creme p-4">
          <span className="rotulo text-[11px] text-tinta-suave">Total de tijolos</span>
          <div className="num font-display font-black text-3xl leading-tight">${fmt(previa.totalTijolos)}</div>
        </div>
        <div className="rounded-xl bg-creme p-4">
          <span className="rotulo text-[11px] text-tinta-suave">Do total</span>
          <div className="num font-display font-black text-3xl leading-tight">${previa.pct.toFixed(1).replace('.', ',')}%</div>
        </div>
      </div>
      ${sujo ? html`<p className="mt-2 text-xs text-tijolo">Prévia do que você digitou — ainda não salvo.</p>` : null}

      <form onSubmit=${salvar} className="grid md:grid-cols-3 gap-4 mt-5">
        <${Campo} rotulo="Valor total da obra" dica="Só o número, sem símbolo.">
          <input id="obra-total" type="number" min="0" step="any" value=${r.valorObra} onChange=${(e) => mudar('valorObra', e.target.value)} className=${entrada} />
        <//>
        <${Campo} rotulo="Já arrecadado">
          <input id="obra-arrecadado" type="number" min="0" step="any" value=${r.arrecadado} onChange=${(e) => mudar('arrecadado', e.target.value)} className=${entrada} />
        <//>
        <${Campo} rotulo="Valor de cada tijolo" dica="Divide a obra: 200.000 ÷ 1.000 = 200 tijolos.">
          <input id="obra-tijolo" type="number" min="1" step="any" value=${r.valorTijolo} onChange=${(e) => mudar('valorTijolo', e.target.value)} className=${entrada} />
        <//>
        <${Campo} rotulo="Contribuindo mensalmente" dica="Quantas pessoas. Digitado à mão; não sai de nenhuma conta.">
          <input id="obra-contrib" type="number" min="0" value=${r.contribuintes} onChange=${(e) => mudar('contribuintes', e.target.value)} className=${entrada} />
        <//>
        <${Campo} rotulo="Símbolo da moeda">
          <input id="obra-moeda" type="text" value=${r.moeda} onChange=${(e) => mudar('moeda', e.target.value)} className=${entrada} />
        <//>
        <${Campo} rotulo="Título">
          <input id="obra-titulo" type="text" value=${r.titulo} onChange=${(e) => mudar('titulo', e.target.value)} className=${entrada} />
        <//>
        <div className="md:col-span-3">
          <${Campo} rotulo="Frase de chamada">
            <input id="obra-chamada" type="text" value=${r.chamada} onChange=${(e) => mudar('chamada', e.target.value)} className=${entrada} />
          <//>
        </div>
        <${Campo} rotulo="Subtítulo">
          <input id="obra-sub" type="text" value=${r.subtitulo} onChange=${(e) => mudar('subtitulo', e.target.value)} className=${entrada} />
        <//>
        <${Campo} rotulo="Assinatura de cima">
          <input id="obra-assin" type="text" value=${r.assinatura} onChange=${(e) => mudar('assinatura', e.target.value)} className=${entrada} />
        <//>
        <${Campo} rotulo="Assinatura do rodapé">
          <input id="obra-rodape" type="text" value=${r.rodape} onChange=${(e) => mudar('rodape', e.target.value)} className=${entrada} />
        <//>
        <div className="md:col-span-2">
          <${Campo} rotulo="Versículo">
            <input id="obra-vers" type="text" value=${r.versiculo} onChange=${(e) => mudar('versiculo', e.target.value)} className=${entrada} />
          <//>
        </div>
        <${Campo} rotulo="Referência">
          <input id="obra-versref" type="text" value=${r.versiculoRef} onChange=${(e) => mudar('versiculoRef', e.target.value)} className=${entrada} />
        <//>
        <div className="md:col-span-3">
          <button type="submit" disabled=${salvando} className=${botao}>Salvar campanha da construção</button>
        </div>
      </form>
    <//>
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
    igreja: c.igreja,
    cidade: c.cidade,
    meta: String(c.meta),
    segundosSlide: String(c.segundosSlide),
    segundosAgradecimento: String(c.segundosAgradecimento),
    segundosRepouso: String(c.segundosRepouso),
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
        igreja: rascunho.igreja.trim() || CONFIG_PADRAO.igreja,
        cidade: rascunho.cidade.trim(),
        meta: Math.max(1, parseInt(rascunho.meta, 10) || 1),
        segundosSlide: Math.max(3, parseInt(rascunho.segundosSlide, 10) || 10),
        segundosAgradecimento: Math.max(3, parseInt(rascunho.segundosAgradecimento, 10) || 10),
        segundosRepouso: Math.max(5, parseInt(rascunho.segundosRepouso, 10) || 30),
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

  const corRecado = { ok: 'bg-noite text-creme', erro: 'bg-red-800 text-white', aviso: 'bg-ciano text-tinta' };

  return html`
    <div className="tela-cheia bg-creme pb-16" style=${{ paddingLeft: 'max(16px, env(safe-area-inset-left, 0px))', paddingRight: 'max(16px, env(safe-area-inset-right, 0px))' }}>
      <div className="max-w-5xl mx-auto py-6">

        <header className="flex flex-wrap items-center justify-between gap-4">
          <${Marca} compacto=${true} />
          <div className="flex items-center gap-2">
            <${SeloSync} sync=${estado.sync} />
            <${Link} para="mesa" irPara=${irPara} className=${botaoFraco + ' no-underline inline-block'}>Mesa<//>
            <${Link} para="telao" irPara=${irPara} className=${botaoFraco + ' no-underline inline-block'}>Telão<//>
            <${Link} para="obra" irPara=${irPara} className=${botaoFraco + ' no-underline inline-block'}>Obra<//>
            <${Link} para="carnes" irPara=${irPara} className=${botaoFraco + ' no-underline inline-block'}>Carnês<//>
            <${Link} para="cofrinhos" irPara=${irPara} className=${botaoFraco + ' no-underline inline-block'}>Cofrinhos<//>
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
              <${Campo} rotulo="Nome da igreja">
                <input id="cfg-igreja" type="text" value=${rascunho.igreja} onChange=${(e) => editar('igreja', e.target.value)} className=${entrada} />
              <//>
              <${Campo} rotulo="Cidade">
                <input id="cfg-cidade" type="text" value=${rascunho.cidade} onChange=${(e) => editar('cidade', e.target.value)} className=${entrada} />
              <//>
              <${Campo} rotulo="Meta total de garrafas">
                <input id="cfg-meta" type="number" min="1" value=${rascunho.meta} onChange=${(e) => editar('meta', e.target.value)} className=${entrada} />
              <//>
              <${Campo} rotulo="Segundos do agradecimento" dica="Quanto tempo a mensagem fica na tela depois da doação. Um toque fecha antes.">
                <input id="cfg-obrigado" type="number" min="3" value=${rascunho.segundosAgradecimento} onChange=${(e) => editar('segundosAgradecimento', e.target.value)} className=${entrada} />
              <//>
              <${Campo} rotulo="Segundos até a mesa voltar à apresentação" dica="Sem toque nenhum por este tempo, o tablet volta a mostrar o contador e a Palavra, como o telão.">
                <input id="cfg-repouso" type="number" min="5" value=${rascunho.segundosRepouso} onChange=${(e) => editar('segundosRepouso', e.target.value)} className=${entrada} />
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
              <${Campo} rotulo="Assinatura" dica="A frase da campanha, escrita à mão na mesa e no telão. Deixe vazia para não mostrar.">
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

            <p className="mt-4 text-xs text-tinta-suave">
              ${fmt((cfg.mensagens || []).length)} frases. Toque numa delas para editar; a edição é
              gravada quando você sai do campo.
            </p>

            <ul className="mt-2 grid gap-2">
              ${(cfg.mensagens || []).map((m, i) => html`
                <li key=${'msg-' + i + '-' + (cfg.mensagens || []).length} className="rounded-xl border border-creme-2 bg-white overflow-hidden">
                  <details>
                    <summary className="cursor-pointer list-none px-3 py-2.5 flex items-center gap-3 hover:bg-agua">
                      <span className="rotulo text-[10px] text-tinta-suave w-5 shrink-0">${i + 1}</span>
                      <span className="flex-1 min-w-0">
                        <span className="block font-display font-semibold text-sm truncate">${aplicarMensagem(m.texto, 3)}</span>
                        <span className=${'block text-xs truncate ' + (m.ref ? 'text-ciano-2' : 'text-tinta-suave')}>
                          ${m.ref || 'sem passagem — fora do rodízio do telão'}
                        </span>
                      </span>
                      <span className="text-tinta-suave text-xs shrink-0" aria-hidden="true">editar</span>
                    </summary>

                    <div className="px-3 pb-3 pt-1 border-t border-creme-2">
                      <${Campo} rotulo="Agradecimento">
                        <textarea
                          id=${'msg-texto-' + i}
                          defaultValue=${m.texto}
                          rows="2"
                          onBlur=${(e) => editarMensagem(i, 'texto', e.target.value)}
                          className=${entrada + ' resize-y text-sm'}
                        ></textarea>
                      <//>

                      <div className="grid md:grid-cols-[minmax(0,3fr)_minmax(0,1fr)] gap-3 mt-3">
                        <${Campo} rotulo="Passagem bíblica">
                          <textarea
                            id=${'msg-vers-' + i}
                            defaultValue=${m.versiculo}
                            rows="2"
                            onBlur=${(e) => editarMensagem(i, 'versiculo', e.target.value)}
                            className=${entrada + ' resize-y text-sm'}
                            placeholder="Deem aos outros, e Deus dará a vocês."
                          ></textarea>
                        <//>
                        <${Campo} rotulo="Referência">
                          <input
                            id=${'msg-ref-' + i}
                            type="text"
                            defaultValue=${m.ref}
                            onBlur=${(e) => editarMensagem(i, 'ref', e.target.value)}
                            className=${entrada + ' text-sm'}
                            placeholder="Lucas 6.38"
                          />
                        <//>
                      </div>

                      <div className="flex justify-end mt-3">
                        <button type="button" onClick=${() => removerMensagem(i)} className="toque text-sm font-semibold text-red-800">Remover frase</button>
                      </div>
                    </div>
                  </details>
                </li>
              `)}
            </ul>
          <//>

          <${SecaoObra} estado=${estado} senha=${senha} avisar=${avisar} />

          <${SecaoCarnes} estado=${estado} senha=${senha} avisar=${avisar} />

          <${SecaoCofrinhos} estado=${estado} senha=${senha} avisar=${avisar} />

          <${Secao}
            titulo="Fotos do telão"
            descricao="As fotos são arquivos do projeto. Coloque os JPGs na pasta fotos/, registre cada um em fotos/lista.json com a legenda e publique — em cerca de trinta segundos o telão já mostra. As fotos do projeto da nova sede ficam em fotos/obra/."
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
            <pre className="mt-4 overflow-x-auto rounded-xl bg-noite text-creme p-4 text-xs leading-relaxed">${'[\n  { "arquivo": "maquete-01.jpg", "legenda": "Maquete da Nova Sede" }\n]'}</pre>
          <//>


          <${Secao} titulo="Backup" descricao="Guarde uma cópia da meta, das frases e do total antes de um culto grande.">
            <button type="button" onClick=${copiarBackup} className=${botaoFraco}>Copiar backup</button>
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-tinta-suave">Ver o backup em texto</summary>
              <pre className="mt-2 overflow-x-auto rounded-xl bg-noite text-creme p-4 text-xs leading-relaxed">${JSON.stringify({ total: total, config: cfg }, null, 2)}</pre>
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

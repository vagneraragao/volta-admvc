# Campanhas ADMVC

Aplicação das quatro campanhas da obra da **Igreja ADMVC — Figueira da Foz**:

1. **Garrafas** — retornáveis contados no tablet da mesa de coleta
2. **Tijolos** — a obra dividida em tijolos simbólicos
3. **Carnês** — carnês retirados e valor pago
4. **Cofrinhos** — entregues, devolvidos e valor

## Como usar

**Abra o `index.html`.** Duplo clique, de qualquer pasta ou de um pen drive.

Não precisa de internet, nem de servidor, nem de instalar nada. Tudo o que a página usa está
dentro do próprio arquivo — é por isso que ela não tem como "falhar ao carregar componentes".

As telas ficam no fim do endereço:

| | |
|---|---|
| `#mesa` | mesa de coleta (é a que abre por padrão) |
| `#telao` | telão do projetor |
| `#obra` | tijolos da construção |
| `#carnes` | carnês |
| `#cofrinhos` | cofrinhos |
| `#admin` | painel (senha inicial **1234**) |

No tablet da mesa, a tela fica em repouso mostrando a apresentação e revela os botões ao
primeiro toque — volta sozinha ao repouso depois de meio minuto parada.

## Onde ficam os dados

**No navegador do aparelho**, e só. Duas janelas do mesmo aparelho conversam entre si na
hora; **dois aparelhos diferentes têm cada um a sua contagem.**

Isso é uma escolha, não um descuido: sincronizar entre aparelhos exigiria servidor, conta num
serviço e configuração, e para uma igreja pequena o preço não compensava.

Para passar números de um aparelho a outro, use *Painel → Cópia de segurança*: copie o texto
e cole no outro aparelho.

## O painel

Tudo se ajusta ali: valores, metas, textos, logotipo da igreja, fotos do telão e o banco de
frases de agradecimento. Fotos e logotipo são guardados dentro do navegador, já reduzidos —
mas o espaço é pequeno, então use poucas e leves.

## A conta dos tijolos

Vem dos cartazes em `img/`. A obra é dividida em tijolos de valor fixo e cada valor
arrecadado assenta um tijolo:

| | |
|---|---|
| 200.000 € ÷ 1.000 € por tijolo | **200 tijolos** |
| 9.000 € ÷ 1.000 € | **9 assentados** |
| 200 − 9 | **191 a faltar** |
| 9.000 ÷ 200.000 | **4,5 %** |

**O dinheiro é o único número guardado; os tijolos saem dele.** Se as duas contas fossem
gravadas lado a lado, uma hora discordariam — alguém corrigiria os euros e esqueceria os
tijolos, e o cartaz da igreja passaria a mentir. Tijolo parcial não conta.

Os carnês seguem a mesma ideia: os planos do cartaz são ilustração, e a contabilidade são
dois números lançados à mão. Nos cofrinhos, *devolvidos* nunca passa de *entregues* — um erro
de digitação não vira "120 % de retorno" no telão, na frente da igreja.

## Publicar na internet (opcional)

Não é preciso, mas se quiser um endereço para abrir de casa: suba a pasta na Vercel, em
**Add New → Project**, com o preset **Other** e sem build command. O `index.html` é servido
como está. Continua sem sincronizar entre aparelhos — só fica acessível de qualquer lugar.

## O que está guardado no repositório

| | |
|---|---|
| `index.html` | **a aplicação**, inteira, num arquivo |
| `img/` | os cartazes originais das campanhas |
| `marca/`, `fotos/` | logotipo e fotos, se preferir versioná-los em vez do painel |
| `versao-vercel.html`, `src/`, `api/`, `servir.py` | a versão anterior, com sincronia por Redis |

A versão anterior está **preservada e intacta**. Ela sincroniza aparelhos de verdade, mas
exige internet, um banco Redis, variáveis de ambiente e deploy — e era essa complexidade que
estava atrapalhando. Se um dia a igreja precisar do tablet e do projetor com a mesma
contagem, ela está lá; para apagá-la, basta remover esses arquivos.

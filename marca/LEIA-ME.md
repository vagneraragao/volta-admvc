# Logotipos

Os dois logotipos que aparecem no cabeçalho da mesa, no rodapé do telão e no painel.

| Arquivo | O que é | Situação |
|---|---|---|
| `admvc.jpg` | Pomba da ADMVC Figueira da Foz | **presente**, mas com 92×92 px |
| `volta.svg` | Logotipo oficial do VOLTA | **ausente** — há um desenho de reserva no código |

## O que ainda falta

**Uma pomba maior.** O arquivo atual tem 92×92 pixels. Isso basta no cabeçalho do tablet
(onde ela aparece com cerca de 44 px), mas borra se for ampliada. Se quiser a pomba em
destaque no telão, substitua por um PNG de pelo menos 512×512 com fundo transparente, ou por
um SVG — que não borra em tamanho nenhum.

**O logotipo do VOLTA.** Baixe o oficial em volta.com.pt e salve aqui como `volta.svg`
(ou `volta.png`, mudando o nome no componente `Marca`, em `src/ui.js`). Enquanto o arquivo
não existir, a página desenha uma seta de retorno própria — parecida no gesto, mas não é a
marca deles.

## Como funciona a troca

Não é preciso mexer no código: o componente tenta carregar o arquivo e, se ele não existir,
cai no desenho de reserva sozinho. Basta colocar o arquivo aqui com o nome certo e publicar.

Nomes sem acento e sem espaço, sempre.

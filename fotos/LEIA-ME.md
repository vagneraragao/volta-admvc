# Fotos do telão

As fotos que passam no telão entre um slide do contador e outro ficam **nesta pasta**, como
arquivos do projeto. Não há upload pelo site: você coloca o arquivo aqui, registra na lista e
publica.

## Como adicionar uma foto

1. Copie o arquivo para esta pasta. Use nomes simples, sem acento e sem espaço:
   `maquete-01.jpg`, `obra-fundacao.jpg`, `mutirao-domingo.jpg`.
2. Abra `lista.json` e acrescente uma linha para cada foto, na ordem em que devem aparecer:

```json
[
  { "arquivo": "maquete-01.jpg", "legenda": "Maquete da Nova Sede" },
  { "arquivo": "obra-fundacao.jpg", "legenda": "Fundação concluída em agosto" },
  { "arquivo": "mutirao-domingo.jpg", "legenda": "" }
]
```

3. `git add . && git commit -m "fotos do culto" && git push` — a Vercel publica em cerca de
   trinta segundos e o telão passa a mostrar sozinho, sem reiniciar nada.

A `legenda` pode ficar vazia (`""`): a foto aparece em tela cheia, sem texto por cima.

## Cuidados que importam no telão

- **Deite a foto.** O telão é horizontal. Fotos em pé aparecem cortadas em cima e embaixo.
- **Reduza antes de subir.** Uma foto direto do celular tem 6 a 12 MB e deixa o carregamento
  lento no aparelho do projetor. Entre 1600 e 2000 pixels de largura já é mais do que
  suficiente para projeção, e o arquivo cai para menos de 500 KB.
- **Cuidado com rostos.** Se aparecerem irmãos identificáveis, peça autorização antes — a
  página é pública na internet.

## Se a lista estiver vazia

O telão fica só no slide do contador, que já funciona bem sozinho. Não é erro.

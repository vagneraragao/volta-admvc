# Fotos do projeto da nova sede

As imagens que aparecem na tela `/construcao` — renders da maquete, fotos do terreno,
registros do andamento da obra.

Funciona igual à pasta `fotos/`: copie os arquivos para cá e registre cada um em
`lista.json`, nesta mesma pasta:

```json
[
  { "arquivo": "maquete-frente.jpg", "legenda": "Fachada da nova sede" },
  { "arquivo": "maquete-interior.jpg", "legenda": "Interior do templo" }
]
```

A tela da construção mostra até seis imagens num mosaico. Com a lista vazia, ela fica só
no quadro da contabilidade — e cai automaticamente nas fotos de `fotos/` se elas existirem.

Nomes sem acento e sem espaço. Deite as fotos e reduza para ~1600px de largura antes de
subir, pelos mesmos motivos explicados em `../LEIA-ME.md`.

"""Servidor local para testar o site antes de publicar.

    python servir.py

Depois abra http://localhost:3000 no navegador.

Por que isto existe: abrir o index.html com duplo clique NÃO funciona — o
navegador bloqueia módulos ES em endereços `file://`. Qualquer servidor HTTP
resolve, e este aqui ainda imita duas coisas que a Vercel faz:

  1. Os rewrites de `/telao` e `/admin`, para que recarregar a página nesses
     endereços funcione igual à produção (e não devolva 404).
  2. A resposta de `/api/estado`. A função de verdade precisa de Node, que não
     roda aqui, então devolvemos o mesmo JSON que ela devolve quando não há
     Redis configurado. O app entende, mostra "somente neste aparelho" e segue
     funcionando no localStorage.

O que NÃO dá para testar assim: gravação no Redis e sincronia entre aparelhos.
Isso só no site publicado.
"""

import http.server
import json
import os
import socketserver

PORTA = 3000
ROTAS_DO_APP = {'/telao', '/obra', '/construcao', '/carnes', '/cofrinhos', '/admin'}

RESPOSTA_API = json.dumps({
    'armazenamento': False,
    'motivo': 'Servidor local de teste: sem Redis. O app segue em modo local.',
}).encode('utf-8')


class Manipulador(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self._tratou_api():
            return
        # Rewrite: /telao e /admin são telas do app, não arquivos no disco.
        if self.path.rstrip('/') in ROTAS_DO_APP:
            self.path = '/index.html'
        return super().do_GET()

    def do_POST(self):
        # Qualquer escrita cai aqui; o app trata como "sem armazenamento".
        self._tratou_api()

    def _tratou_api(self):
        if not self.path.startswith('/api/'):
            return False
        self.send_response(200)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(RESPOSTA_API)))
        self.end_headers()
        self.wfile.write(RESPOSTA_API)
        return True

    def end_headers(self):
        # Sem cache: recarregar tem que mostrar a última alteração.
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def log_message(self, formato, *args):
        pass   # o terminal fica limpo; erros de verdade continuam aparecendo


if __name__ == '__main__':
    os.chdir(os.path.dirname(os.path.abspath(__file__)))

    # allow_reuse_address fica DESLIGADO de propósito. No Windows ele deixa um
    # segundo processo sequestrar a porta, e aí os pedidos caem ora num
    # servidor ora no outro — normalmente um deles com o código antigo, o que
    # dá horas de confusão depurando uma alteração que "não pegou". Melhor
    # falhar alto dizendo que a porta está ocupada.
    try:
        servidor = socketserver.TCPServer(('127.0.0.1', PORTA), Manipulador)
    except OSError:
        print(f'A porta {PORTA} já está em uso. Feche o outro servidor (Ctrl+C na')
        print('janela onde ele está rodando) e tente de novo.')
        raise SystemExit(1)

    with servidor:
        print(f'VOLTA ADMVC rodando em http://localhost:{PORTA}')
        print(f'  mesa   http://localhost:{PORTA}/')
        print(f'  telão  http://localhost:{PORTA}/telao')
        print(f'  obra   http://localhost:{PORTA}/construcao')
        print(f'  carnês http://localhost:{PORTA}/carnes')
        print(f'  cofres http://localhost:{PORTA}/cofrinhos')
        print(f'  admin  http://localhost:{PORTA}/admin   (senha 1234 no modo local)')
        print('Ctrl+C para parar.')
        try:
            servidor.serve_forever()
        except KeyboardInterrupt:
            print('\nParado.')

# CS Web 1.6

Réplica multiplayer de Counter-Strike 1.6 no navegador.

## Estrutura

- `index.html` – página do jogo
- `css/style.css` – estilos
- `js/` – config, scene, player, net, host, ui, input, main (carregados nessa ordem)
- `server/` – servidor Node.js dedicado (opcional)

## Jogar (P2P, GitHub Pages)

Publique a raiz do repositório no Pages (Deploy from a branch). Um jogador clica em CRIAR PARTIDA e passa o código aos outros.

## Servidor dedicado (opcional)

```
cd server && npm install && node server.js
```

Abra http://localhost:3000 (ou o IP da LAN mostrado no terminal).

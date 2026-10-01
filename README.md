# veille-techno-frontend

## Lancer le front avec Docker

Prérequis : Docker Desktop, et le back [veille-techno-backend](https://github.com/BaptisteAPPRIOU/veille-techno-backend) lancé en local sur le port 3000 (voir son README).

Depuis le dossier de l'application, `veille-techno-frontend/` :

```bash
docker compose up -d --build   # construit l'image et sert l'application sur http://localhost:8080
```

L'image se construit en deux étapes : Node compile l'application, puis nginx sert uniquement les fichiers statiques de `dist/`. L'image finale ne contient ni Node ni `node_modules`.

nginx remplace aussi le proxy de Vite : les appels à `/api` partent vers l'adresse de la variable `API_URL`, par défaut `http://host.docker.internal:3000`, c'est-à-dire le back qui tourne sur la machine hôte. Si le back est arrêté, ces appels reçoivent une erreur 502. Pour le reste, nginx renvoie `index.html` sur les routes de l'application (un F5 sur `/login` fonctionne), met en cache les fichiers de `assets/` et compresse les réponses.

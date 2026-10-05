# veille-techno-frontend

## Lancer le front en développement

Prérequis : Node.js 24, et le back [veille-techno-backend](https://github.com/BaptisteAPPRIOU/veille-techno-backend) lancé en local sur le port 3000 (voir son README).

Depuis le dossier de l'application, `veille-techno-frontend/` :

```bash
npm install
npm run dev   # sert l'application sur http://localhost:5173
```

Le back n'active pas CORS : le navigateur appelle toujours `/api/...` sur le serveur de Vite, qui transmet à `http://localhost:3000` (proxy déclaré dans `vite.config.ts`). Le même code fonctionne derrière nginx dans Docker. Si le back est arrêté, les appels reçoivent une erreur 502, que le client traduit en « API injoignable ».

## Connexion et inscription

Sans connexion, le board (`/`) redirige vers `/login`. La page `/register` crée un compte puis le connecte automatiquement. Le mot de passe doit contenir au moins 6 caractères et le nom entre 1 et 32 caractères.

Le store Pinia `src/stores/auth.ts` conserve le JWT dans `localStorage` sous la clé `authToken`, puis le client HTTP l'envoie aux routes de l'API. La session est restaurée après un F5. Le bouton « Déconnexion » supprime ce token. Un **401** sur une ressource protégée renvoie vers `/login` avec « Session expirée » ; un **401** sur la connexion affiche « Email ou mot de passe incorrect ».

Les deux pages utilisent `src/components/AuthForm.vue` : `v-model` remplit les champs, `@submit.prevent` déclenche l'action du store et les erreurs sont affichées sous les champs ou dans le formulaire.

Pour vérifier : créer un compte, recharger le board, se déconnecter, puis se reconnecter. Essayer aussi un mauvais mot de passe, un email déjà utilisé et des champs invalides. Le back doit être démarré pour ces essais.

## Lancer le front avec Docker

Prérequis : Docker Desktop, et le back [veille-techno-backend](https://github.com/BaptisteAPPRIOU/veille-techno-backend) lancé en local sur le port 3000 (voir son README).

Depuis le dossier de l'application, `veille-techno-frontend/` :

```bash
docker compose up -d --build   # construit l'image et sert l'application sur http://localhost:8080
```

L'image se construit en deux étapes : Node compile l'application, puis nginx sert uniquement les fichiers statiques de `dist/`. L'image finale ne contient ni Node ni `node_modules`.

nginx remplace aussi le proxy de Vite : les appels à `/api` partent vers l'adresse de la variable `API_URL`, par défaut `http://host.docker.internal:3000`, c'est-à-dire le back qui tourne sur la machine hôte. Si le back est arrêté, ces appels reçoivent une erreur 502. Pour le reste, nginx renvoie `index.html` sur les routes de l'application (un F5 sur `/login` fonctionne), met en cache les fichiers de `assets/` et compresse les réponses.

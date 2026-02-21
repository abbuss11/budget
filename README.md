# Budget App - Documentation technique

Application mobile/web de gestion de budget construite avec Ionic React, Vite et TypeScript.

## 1. Objectif du projet

Cette application permet a un utilisateur de:

- creer un compte utilisateur (signup)
- se connecter (login)
- creer plusieurs comptes budget
- selectionner un compte actif
- enregistrer des transactions (depense/revenu)
- consulter un solde mis a jour en temps reel

Le backend est un `json-server` local (mock API) expose via un proxy Vite.

## 2. Stack technique

- Frontend: `React 19`, `TypeScript`, `Ionic React 8`
- Routing: `react-router-dom 5`
- Build/dev server: `Vite 5`
- HTTP client: `axios`
- Backend local: `json-server` (`db.json`)
- Tests unitaires: `Vitest` + `@testing-library/react`
- Tests E2E: `Cypress`
- Mobile shell: `Capacitor 8`
- Lint: `ESLint 9` + `typescript-eslint`

## 3. Architecture generale

Architecture frontend orientee composants + services:

- `pages/`: ecrans metier (Login, SignUp, Home, Budget, Compte)
- `contexts/`: etat global d authentification (`AuthContext`)
- `services/`: couche d acces API (`authService`, `accountService`, `transactionService`)
- `modules/`: logique locale reutilisable (`selectedAccountStorage`)
- `constants/`: constantes de routage (`ROUTES`)

Flux global:

1. L app charge `AuthProvider`.
2. `AuthProvider` restaure `authToken` + `user` depuis `localStorage`.
3. `AppRoutes` redirige:
   - vers `login/signup` si non authentifie
   - vers `TabsLayout` sinon
4. Les pages `Compte` et `Budget` manipulent comptes + transactions via les services.
5. Le compte selectionne est persiste dans `localStorage`.

## 4. Structure du projet

```text
Budget/
+-- src/
|   +-- App.tsx
|   +-- main.tsx
|   +-- constants/
|   |   +-- routes.ts
|   +-- contexts/
|   |   +-- AuthContext.tsx
|   +-- services/
|   |   +-- authService.ts
|   |   +-- accountService.ts
|   |   +-- transactionService.ts
|   +-- modules/accounts/
|   |   +-- selectedAccountStorage.ts
|   +-- pages/
|   |   +-- Login.tsx
|   |   +-- SignUp.tsx
|   |   +-- Home.tsx
|   |   +-- BudgetPage.tsx
|   |   +-- Compte.tsx
|   +-- setupTests.ts
|   +-- App.test.tsx
+-- cypress/
|   +-- e2e/test.cy.ts
+-- db.json
+-- json-server.json
+-- cors.js
+-- vite.config.ts
+-- capacitor.config.ts
+-- package.json
```

## 5. Prerequis

- Node.js `>= 18` recommande
- npm `>= 9`

## 6. Installation et lancement

### 6.1 Installation

```bash
npm install
```

### 6.2 Lancement de l API locale (terminal 1)

```bash
npm run db
```

- API json-server sur `http://localhost:3000`
- Fichier de donnees: `db.json`
- CORS active via `cors.js`

### 6.3 Lancement du frontend (terminal 2)

```bash
npm run dev
```

- Frontend Vite sur `http://localhost:5173`
- Les appels `/api/*` sont proxifies vers `http://localhost:3000/*`

## 7. Scripts npm

- `npm run dev`: demarre Vite en mode developpement
- `npm run build`: compile TypeScript puis build Vite (`dist/`)
- `npm run preview`: sert le build de production localement
- `npm run db`: demarre json-server avec `db.json`
- `npm run test.unit`: lance Vitest
- `npm run test.e2e`: lance Cypress en mode headless
- `npm run lint`: lance ESLint

## 8. Configuration importante

### 8.1 Vite proxy

`vite.config.ts`:

- route proxifiee: `/api`
- cible: `http://localhost:3000`
- rewrite: suppression du prefixe `/api`

Exemple:

- frontend appelle `/api/users?email=a@b.com`
- json-server recoit `/users?email=a@b.com`

### 8.2 Axios

`authService.ts` configure `axios.defaults.timeout = 10000` (10 secondes).  
Cette valeur est globale a axios.

### 8.3 TypeScript

- mode strict active (`"strict": true`)
- `noEmit: true` (la transpilation production est geree par Vite)

## 9. Routing

Routes definies dans `src/constants/routes.ts`:

- `/` (`ROOT`)
- `/home`
- `/budget`
- `/compte`
- `/login`
- `/signup`

Comportement:

- utilisateur non authentifie:
  - acces a `/login` et `/signup`
  - toute autre route redirige vers `/login`
- utilisateur authentifie:
  - acces a l interface onglets (`Home`, `Budget`, `Compte`)
  - acces a `/login` et `/signup` redirige vers `/home`

Note: `src/components/ProtectedRoute.tsx` existe mais n est pas utilise par `App.tsx` (la protection est geree directement dans `AppRoutes`).

## 10. Authentification

### 10.1 Contexte

`AuthContext` expose:

- `user`
- `token`
- `loading`
- `error`
- `login(payload)`
- `signUp(payload)`
- `logout()`
- `isAuthenticated`

### 10.2 Persistance locale

Cles `localStorage`:

- `authToken`
- `user`
- `selectedAccount`

### 10.3 Flux login

1. `Login.tsx` valide les champs non vides.
2. `authService.login` appelle `GET /api/users?email=...`.
3. Le mot de passe est compare cote client.
4. Un token local `token_<id>_<timestamp>` est genere.
5. Token + user sont stockes dans `localStorage`.
6. Redirection vers `/home`.

### 10.4 Flux signup

1. `SignUp.tsx` valide champs + format email.
2. `authService.signUp` verifie unicite email via `GET /api/users?email=...`.
3. Validation mot de passe (confirmation + longueur >= 6).
4. Creation utilisateur `POST /api/users`.
5. Stockage token + user.
6. Redirection vers `/home`.

### 10.5 Flux logout

1. `logout()` supprime `authToken` et `user`.
2. La page `Home` supprime aussi `selectedAccount`.
3. Redirection vers `/login`.

## 11. Module comptes et budgets

### 11.1 Gestion des comptes (`Compte.tsx`)

- chargement comptes utilisateur: `GET /api/accounts?userId=<id>`
- creation compte: `POST /api/accounts`
- selection d un compte:
  - sauvegarde dans `localStorage` (`selectedAccount`)
  - navigation vers `/budget`

### 11.2 Page budget (`BudgetPage.tsx`)

- recharge le compte selectionne et le synchronise avec la base
- charge les transactions du compte selectionne
- ajoute une transaction:
  1. `POST /api/transactions`
  2. calcul nouveau solde
  3. `PATCH /api/accounts/:id` avec le nouveau solde

### 11.3 Page home (`Home.tsx`)

- lit le compte selectionne depuis `localStorage`
- affiche le solde courant
- charge les 3 transactions les plus recentes

## 12. Couche API (services)

### 12.1 `authService.ts`

- `login(payload)`
- `signUp(payload)`
- `logout()`
- `getStoredUser()`
- `getStoredToken()`
- `setAuthData(token, user)`
- `isAuthenticated()`

### 12.2 `accountService.ts`

- `getAccountsByUser(userId)`
- `createAccount({ userId, name, balance })`
- `updateAccount(id, data)`
- `deleteAccount(id)`

### 12.3 `transactionService.ts`

- `getByAccount(accountId)` avec tri descendant par `createdAt`
- `create({ accountId, type, amount, description? })`

## 13. Modele de donnees (json-server)

Source: `db.json`

### 13.1 Collection `users`

- `id`
- `email`
- `password`
- `name`
- `createdAt`

### 13.2 Collection `accounts`

- `id`
- `userId`
- `name`
- `balance`
- `createdAt`

### 13.3 Collection `transactions`

Attendu dans le code:

- `id`
- `accountId`
- `type`: `income | expense`
- `amount`
- `description` (optionnel)
- `createdAt`

Remarque technique: le `db.json` courant contient des enregistrements heterogenes dans `transactions` (certains objets ressemblent a des comptes). Cela peut polluer les resultats si les IDs correspondent.

## 14. UX et interface

- Navigation principale par onglets Ionic (barre basse):
  - Home
  - Budget
  - Compte
- Ecrans auth dedies (`Login`, `SignUp`)
- Feedback utilisateur:
  - `IonSpinner` pendant chargements
  - `IonToast` pour actions compte/transaction
- Theme CSS:
  - styles globaux dans `src/theme/variables.css`
  - styles pages dans `src/pages/*.css`

## 15. Tests

### 15.1 Unit tests (Vitest)

- fichier present: `src/App.test.tsx`
- test actuel: rendu basique de `<App />`

### 15.2 E2E (Cypress)

- fichier present: `cypress/e2e/test.cy.ts`
- ce test est un template par defaut (non aligne avec les ecrans actuels)

Recommandation:

- ajouter des tests E2E reels:
  - signup/login
  - creation compte
  - ajout depense/revenu
  - verification mise a jour du solde

## 16. Build et deployment

### 16.1 Build web

```bash
npm run build
```

Artifacts dans `dist/`.

### 16.2 Preview locale du build

```bash
npm run preview
```

### 16.3 Mobile (Capacitor)

Config dans `capacitor.config.ts`:

- `appId: io.ionic.starter`
- `appName: Budget`
- `webDir: dist`

Flux general:

1. `npm run build`
2. `npx cap sync`
3. `npx cap open android` ou `npx cap open ios`

## 17. Qualite, limites et dette technique

### 17.1 Securite

Etat actuel (dev/demo):

- mot de passe stocke en clair dans `db.json`
- validation auth cote client
- token local non signe/non verifie serveur

A faire pour production:

- backend reel (API securisee)
- hash mot de passe (bcrypt/argon2)
- JWT/sessions avec expiration et refresh
- ACL/autorisation cote serveur
- HTTPS obligatoire

### 17.2 Fiabilite metier

- la mise a jour du solde apres transaction n est pas transactionnelle (2 appels reseau distincts)
- pas de mecanisme de retry/backoff
- pas de gestion offline

### 17.3 Tests

- couverture actuellement faible (unit + E2E)
- scenario critiques non couverts

## 18. Troubleshooting

### 18.1 "Impossible de se connecter au serveur"

- verifier que `npm run db` tourne bien sur le port `3000`
- verifier que `npm run dev` tourne sur `5173`
- verifier le proxy `/api` dans `vite.config.ts`

### 18.2 Login impossible

- verifier les credentials dans `db.json`
- verifier que l email existe dans `users`

### 18.3 Donnees incoherentes

- nettoyer `db.json` si des objets ont ete ecrits dans la mauvaise collection
- supprimer les donnees locales navigateur (`authToken`, `user`, `selectedAccount`)

## 19. Compte de test local

Selon `db.json` courant:

- email: `test@test.com`
- mot de passe: `2020`

## 20. Evolutions conseillees

1. Remplacer json-server par une API backend securisee.
2. Introduire une couche de state management de donnees (ex: React Query).
3. Ajouter validations schema (zod/yup) sur formulaires.
4. Ajouter tests E2E metier complets.
5. Ajouter i18n et formatage monetaire robuste.
#   b u d g e t  
 #   b u d g e t  
 
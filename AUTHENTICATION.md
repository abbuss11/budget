# Système d'Authentification - New App

## 📋 Configuration

Le système de login/signup a été complètement implémenté avec :

### 1. **Base de Données** (`db.json`)
- Structure avec collection `users`
- Champs: `id`, `email`, `password`, `name`, `createdAt`
- Utilisateur test: `test@example.com` / `password123`

### 2. **Service d'Authentification** (`src/services/authService.ts`)
- `login()` - Authentifie l'utilisateur
- `signUp()` - Crée un nouvel utilisateur
- `logout()` - Déconnecte l'utilisateur
- Validation des emails et mots de passe
- Stockage des données dans `localStorage`

### 3. **Contexte d'Authentification** (`src/contexts/AuthContext.tsx`)
- Gère l'état global de l'authentification
- Hook `useAuth()` pour accéder aux données
- États: `user`, `token`, `loading`, `error`

### 4. **Pages d'Authentification**
- **Login** (`src/pages/Login.tsx`) - Page de connexion
- **SignUp** (`src/pages/SignUp.tsx`) - Page d'inscription

### 5. **Routes Protégées** (`src/components/ProtectedRoute.tsx`)
- Redirige vers `/login` si non authentifié
- Affiche un loader pendant le chargement

## 🚀 Démarrage

### Terminal 1 - Base de Données
```bash
npm run db
```
Démarre le serveur JSON sur http://localhost:3000

### Terminal 2 - Application
```bash
npm run dev
```
Démarre l'application Vite sur http://localhost:5173

## 🔄 Flux d'Authentification

### Première Visite
1. Accès à `/` → Redirection vers `/login`
2. Option: Connexion ou Inscription

### Inscription (SignUp)
1. Remplir le formulaire
2. Validation des champs (email, mot de passe, confirmation)
3. POST vers `http://localhost:3000/users`
4. Enregistrement du token et utilisateur en localStorage
5. Redirection vers `/home`

### Connexion (Login)
1. Entrer email et mot de passe
2. Recherche dans la base de données
3. Validation du mot de passe
4. Enregistrement du token et utilisateur en localStorage
5. Redirection vers `/home`

### Pages Protégées
- `/home` - Page d'accueil (protégée)
- `/New` - Gestion du New (protégée)

### Déconnexion
- Clic sur "Déconnexion" → Suppression des données localStorage
- Redirection vers `/login`

## 🔐 Sécurité

⚠️ **Important pour la production:**
- Les mots de passe devraient être hashés (bcrypt)
- Utiliser HTTPS
- Implémenter des tokens JWT ou sessions
- Valider côté serveur

## 📝 Utilisation du Hook `useAuth()`

```tsx
import { useAuth } from '../contexts/AuthContext';

const MyComponent = () => {
  const { user, token, loading, error, login, signUp, logout, isAuthenticated } = useAuth();
  
  // user: données de l'utilisateur connecté
  // token: jeton d'authentification
  // isAuthenticated: booléen
  // loading: chargement en cours
  // error: message d'erreur
};
```

## 🧪 Test

1. Accédez à http://localhost:5173
2. Essayez de vous connecter avec:
   - Email: `test@example.com`
   - Mot de passe: `password123`
3. Ou créez un nouveau compte

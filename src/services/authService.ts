import axios from 'axios';

const API_URL = '/api';

// Configuration axios
axios.defaults.timeout = 10000;

export interface User {
  id: number;
  email: string;
  password: string;
  name: string;
  createdAt: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignUpPayload {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  token: string;
}

class AuthService {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    try {
      console.log('Tentative de connexion avec:', payload.email);
      console.log('URL API:', `${API_URL}/users`);
      
      const response = await axios.get(`${API_URL}/users?email=${payload.email}`);
      const users = response.data;

      console.log('Réponse du serveur:', users);

      if (users.length === 0) {
        throw new Error('Email ou mot de passe incorrect');
      }

      const user = users[0];

      if (user.password !== payload.password) {
        throw new Error('Email ou mot de passe incorrect');
      }

      const userWithoutPassword: Omit<User, 'password'> = {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      };

      return {
        user: userWithoutPassword,
        token: `token_${user.id}_${Date.now()}`,
      };
    } catch (error) {
      console.error('Erreur login:', error);
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED') {
          throw new Error('Impossible de se connecter au serveur. Assurez-vous que json-server est en cours d\'exécution (npm run db)');
        }
        throw new Error(`Erreur réseau: ${error.message}`);
      }
      throw error;
    }
  }

  async signUp(payload: SignUpPayload): Promise<AuthResponse> {
    try {
      console.log('Tentative d\'inscription:', payload.email);
      
      // Vérifier si l'email existe déjà
      const response = await axios.get(`${API_URL}/users?email=${payload.email}`);
      if (response.data.length > 0) {
        throw new Error('Cet email est déjà utilisé');
      }

      // Vérifier les mots de passe
      if (payload.password !== payload.confirmPassword) {
        throw new Error('Les mots de passe ne correspondent pas');
      }

      if (payload.password.length < 6) {
        throw new Error('Le mot de passe doit contenir au moins 6 caractères');
      }

      // Créer le nouvel utilisateur
      const NewUser: User = {
        id: Date.now(),
        email: payload.email,
        password: payload.password,
        name: payload.name,
        createdAt: new Date().toISOString(),
      };

      console.log('Création du nouvel utilisateur:', NewUser);
      await axios.post(`${API_URL}/users`, NewUser);

      const userWithoutPassword: Omit<User, 'password'> = {
        id: NewUser.id,
        email: NewUser.email,
        name: NewUser.name,
        createdAt: NewUser.createdAt,
      };

      return {
        user: userWithoutPassword,
        token: `token_${NewUser.id}_${Date.now()}`,
      };
    } catch (error) {
      console.error('Erreur signup:', error);
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED') {
          throw new Error('Impossible de se connecter au serveur. Assurez-vous que json-server est en cours d\'exécution (npm run db)');
        }
        throw new Error(`Erreur réseau: ${error.message}`);
      }
      throw error;
    }
  }

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }

  getStoredUser(): Omit<User, 'password'> | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  getStoredToken(): string | null {
    return localStorage.getItem('authToken');
  }

  setAuthData(token: string, user: Omit<User, 'password'>): void {
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
  }

  isAuthenticated(): boolean {
    return !!this.getStoredToken();
  }
}

export default new AuthService();

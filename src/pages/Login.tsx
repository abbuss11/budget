import React, { useState } from 'react';
import {
  IonPage,
  IonContent,
  IonButton,
  IonInput,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonSpinner,
  IonText,
} from '@ionic/react';
import { Link, useHistory } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ROUTES } from '../constants/routes';

import './Auth.css';

const Login: React.FC = () => {
  const history = useHistory();
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!email || !password) {
      setLocalError('Veuillez remplir tous les champs');
      return;
    }

    try {
      await login({ email, password });
      history.replace(ROUTES.HOME);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen className="auth-container">
        <div className="auth-content">
          <h1>MyPocket</h1>
          <IonCard className="auth-card">
            <IonCardHeader>
              <IonCardTitle className="auth-title">Connexion</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <form onSubmit={handleLogin}>
                {(localError || error) && (
                  <div className="error-message">
                    <IonText color="danger">{localError || error}</IonText>
                  </div>
                )}

                <IonInput
                  label="Email"
                  labelPlacement="stacked"
                  type="email"
                  value={email}
                  onIonChange={(e) => setEmail(e.detail.value || '')}
                  className="ion-margin-bottom"
                  placeholder="Entrez votre email"
                  disabled={loading}
                />

                <IonInput
                  label="Mot de passe"
                  labelPlacement="stacked"
                  type="password"
                  value={password}
                  onIonChange={(e) => setPassword(e.detail.value || '')}
                  className="ion-margin-bottom"
                  placeholder="Votre mot de passe"
                  disabled={loading}
                />

                <IonButton expand="block" type="submit" disabled={loading} className="ion-margin-top btt">
                  {loading ? <IonSpinner name="circles" /> : 'Se connecter'}
                </IonButton>
              </form>

              <div className="auth-footer">
                <IonText>
                  Pas encore inscrit?{' '}
                  <Link to={ROUTES.SIGNUP} style={{ textDecoration: 'none', color: '#3880ff' }}>
                    S'inscrire
                  </Link>
                </IonText>
              </div>
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;

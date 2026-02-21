import React, { useState } from 'react';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonInput,
  IonPage,
  IonSpinner,
  IonText,
} from '@ionic/react';
import { Link, useHistory } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ROUTES } from '../constants/routes';
import './Auth.css';

const SignUp: React.FC = () => {
  const history = useHistory();
  const { signUp, loading, error } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSignUp = async (event: React.FormEvent) => {
    event.preventDefault();
    setLocalError(null);

    if (!name || !email || !password || !confirmPassword) {
      setLocalError('Veuillez remplir tous les champs');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setLocalError('Veuillez entrer une adresse email valide');
      return;
    }

    try {
      await signUp({ name, email, password, confirmPassword });
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
              <IonCardTitle className="auth-title">Inscription</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <form onSubmit={handleSignUp}>
                {(localError || error) && (
                  <div className="error-message">
                    <IonText color="danger">{localError || error}</IonText>
                  </div>
                )}

                <IonInput
                  label="Nom complet"
                  labelPlacement="stacked"
                  type="text"
                  value={name}
                  onIonChange={(event) => setName(event.detail.value || '')}
                  className="ion-margin-bottom"
                  placeholder="Entrez votre nom"
                  disabled={loading}
                />

                <IonInput
                  label="Email"
                  labelPlacement="stacked"
                  type="email"
                  value={email}
                  onIonChange={(event) => setEmail(event.detail.value || '')}
                  className="ion-margin-bottom"
                  placeholder="Entrez votre email"
                  disabled={loading}
                />

                <IonInput
                  label="Mot de passe"
                  labelPlacement="stacked"
                  type="password"
                  value={password}
                  onIonChange={(event) => setPassword(event.detail.value || '')}
                  className="ion-margin-bottom"
                  placeholder="Au moins 6 caracteres"
                  disabled={loading}
                />

                <IonInput
                  label="Confirmer le mot de passe"
                  labelPlacement="stacked"
                  type="password"
                  value={confirmPassword}
                  onIonChange={(event) => setConfirmPassword(event.detail.value || '')}
                  className="ion-margin-bottom"
                  placeholder="Confirmez votre mot de passe"
                  disabled={loading}
                />

                <IonButton expand="block" type="submit" disabled={loading} className="ion-margin-top">
                  {loading ? <IonSpinner name="circles" /> : "S'inscrire"}
                </IonButton>
              </form>

              <div className="auth-footer">
                <IonText>
                  Deja inscrit?{' '}
                  <Link to={ROUTES.LOGIN} style={{ textDecoration: 'none', color: '#3880ff' }}>
                    Se connecter
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

export default SignUp;

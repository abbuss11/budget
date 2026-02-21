import React, { useEffect, useState } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonRouterOutlet,
  IonSpinner,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact,
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { albumsOutline, homeOutline, walletOutline } from 'ionicons/icons';
import Home from './pages/Home';
import BudgetPage from './pages/BudgetPage';
import Compte from './pages/Compte';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ROUTES } from './constants/routes';

import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

import './App.css';
import './theme/variables.css';

setupIonicReact();

const SPLASH_DURATION_MS = 1800;

const SplashScreen: React.FC = () => {
  return (
    <div className="splash-screen" role="status" aria-live="polite">
      <div className="splash-content">
        <p>Bienvenue sur</p>
        <h1 >MyPocket</h1>
        <IonSpinner name="crescent" className="splash-spinner" />
      </div>
    </div>
  );
};

const TabsLayout: React.FC = () => {
  return (
    <IonTabs>
      <IonRouterOutlet>
        <Route exact path={ROUTES.HOME} component={Home} />
        <Route exact path={ROUTES.BUDGET} component={BudgetPage} />
        <Route exact path={ROUTES.ACCOUNT} component={Compte} />
        <Redirect exact from={ROUTES.ROOT} to={ROUTES.HOME} />
        <Redirect to={ROUTES.HOME} />
      </IonRouterOutlet>

      <IonTabBar slot="bottom" className="custom-tabbar">
        <IonTabButton tab="home" href={ROUTES.HOME}>
          <IonIcon icon={homeOutline} />
        </IonTabButton>

        <IonTabButton tab="budget" href={ROUTES.BUDGET} className="center-tab">
          <IonIcon icon={walletOutline} />
        </IonTabButton>

        <IonTabButton tab="compte" href={ROUTES.ACCOUNT}>
          <IonIcon icon={albumsOutline} />
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
};

const AppRoutes: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
        <IonSpinner />
      </div>
    );
  }

  return (
    <Switch>
      <Route
        exact
        path={ROUTES.LOGIN}
        render={() => (isAuthenticated ? <Redirect to={ROUTES.HOME} /> : <Login />)}
      />
      <Route
        exact
        path={ROUTES.SIGNUP}
        render={() => (isAuthenticated ? <Redirect to={ROUTES.HOME} /> : <SignUp />)}
      />
      <Route
        path={ROUTES.ROOT}
        render={() => (isAuthenticated ? <TabsLayout /> : <Redirect to={ROUTES.LOGIN} />)}
      />
    </Switch>
  );
};

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowSplash(false);
    }, SPLASH_DURATION_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  if (showSplash) {
    return (
      <IonApp>
        <SplashScreen />
      </IonApp>
    );
  }

  return (
    <IonApp>
      <AuthProvider>
        <IonReactRouter>
          <AppRoutes />
        </IonReactRouter>
      </AuthProvider>
    </IonApp>
  );
};

export default App;

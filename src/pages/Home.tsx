import React, { useEffect, useState } from 'react';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonViewWillEnter,
} from '@ionic/react';
import { powerOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ROUTES } from '../constants/routes';
import { Account } from '../services/accountService';
import transactionService, { Transaction } from '../services/transactionService';
import {
  SELECTED_ACCOUNT_EVENT,
  clearSelectedAccount,
  getSelectedAccount,
} from '../modules/accounts/selectedAccountStorage';
import './Home.css';

const Home: React.FC = () => {
  const history = useHistory();
  const { user, logout } = useAuth();

  const [selectedAccount, setSelectedAccount] = useState<Account | null>(getSelectedAccount());
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const budgetAmount = selectedAccount ? Number(selectedAccount.balance) : 0;

  useIonViewWillEnter(() => {
    setSelectedAccount(getSelectedAccount());
  });

  useEffect(() => {
    const onSelectedAccountChange = (event: Event) => {
      const customEvent = event as CustomEvent<Account | null>;
      setSelectedAccount(customEvent.detail ?? null);
    };

    window.addEventListener(SELECTED_ACCOUNT_EVENT, onSelectedAccountChange as EventListener);
    return () => {
      window.removeEventListener(SELECTED_ACCOUNT_EVENT, onSelectedAccountChange as EventListener);
    };
  }, []);

  useEffect(() => {
    const loadRecentTransactions = async () => {
      if (!selectedAccount) {
        setRecentTransactions([]);
        return;
      }

      try {
        const transactions = await transactionService.getByAccount(selectedAccount.id);
        setRecentTransactions(transactions.slice(0, 3));
      } catch (error) {
        console.error('loadRecentTransactions error', error);
      }
    };

    void loadRecentTransactions();
  }, [selectedAccount]);

  const handleLogout = () => {
    logout();
    clearSelectedAccount();
    history.replace(ROUTES.LOGIN);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="home-toolbar">
          <IonTitle className="toolbar-title">Salut, {user?.name}</IonTitle>
          <IonButton
            slot="end"
            fill="clear"
            className="logout-icon-btn"
            onClick={handleLogout}
            aria-label="Se deconnecter"
          >
            <IonIcon icon={powerOutline} />
          </IonButton>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="home-content">
        <div className="top-section">
          <h1 className="budget-amount">{budgetAmount}</h1>
          <p className="budget-text">
            {budgetAmount === 0
              ? 'Aucun compte selectionne.'
              : `Solde du compte: ${budgetAmount} FCFA`}
          </p>
        </div>

        <div className="bottom-card">
          <div className="illustration">
            <img src="/assets/piggy.svg" alt="Budget" />
          </div>

          <p>Gerez vos finances simplement et suivez vos depenses en temps reel.</p>

          {recentTransactions.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <h4>Dernieres transactions</h4>
              <ul>
                {recentTransactions.map((transaction) => (
                  <li key={transaction.id}>
                    {transaction.description || transaction.type} - {transaction.amount} FCFA
                  </li>
                ))}
              </ul>
            </div>
          )}

          <IonButton routerLink={ROUTES.BUDGET} expand="block" className="add-button">
            {budgetAmount === 0 ? '+ Ajouter un budget' : 'Voir mon budget'}
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;

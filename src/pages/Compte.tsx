import React, { useCallback, useEffect, useState } from 'react';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonTitle,
  IonToast,
  IonToolbar,
  useIonViewWillEnter,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ROUTES } from '../constants/routes';
import accountService, { Account } from '../services/accountService';
import { getSelectedAccount, setSelectedAccount } from '../modules/accounts/selectedAccountStorage';

interface ToastState {
  isOpen: boolean;
  message: string;
}

const Compte: React.FC = () => {
  const history = useHistory();
  const { user } = useAuth();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState<string | number | null>(null);
  const [toast, setToast] = useState<ToastState>({ isOpen: false, message: '' });

  const loadAccounts = useCallback(async () => {
    if (!user) {
      setAccounts([]);
      setSelectedAccountId(null);
      return;
    }

    try {
      const fetchedAccounts = await accountService.getAccountsByUser(user.id);
      setAccounts(fetchedAccounts);

      const storedSelectedAccount = getSelectedAccount();
      if (!storedSelectedAccount) {
        setSelectedAccountId(null);
        return;
      }

      const matchingAccount = fetchedAccounts.find(
        (account) => String(account.id) === String(storedSelectedAccount.id),
      );

      if (!matchingAccount) {
        setSelectedAccountId(null);
        return;
      }

      setSelectedAccount(matchingAccount);
      setSelectedAccountId(matchingAccount.id);
    } catch (error) {
      console.error('loadAccounts error', error);
      setToast({ isOpen: true, message: 'Impossible de charger vos comptes.' });
    }
  }, [user]);

  useIonViewWillEnter(() => {
    void loadAccounts();
  });

  useEffect(() => {
    void loadAccounts();
  }, [loadAccounts]);

  const handleCreateAccount = async () => {
    if (!user) {
      return;
    }

    if (!name.trim()) {
      setToast({ isOpen: true, message: 'Entrez un nom de compte.' });
      return;
    }

    const initialAmount = Number(amount);
    if (Number.isNaN(initialAmount) || initialAmount < 0) {
      setToast({ isOpen: true, message: 'Entrez un montant initial valide.' });
      return;
    }

    try {
      const createdAccount = await accountService.createAccount({
        userId: user.id,
        name: name.trim(),
        balance: initialAmount,
      });

      setAccounts((previous) => [createdAccount, ...previous]);
      setSelectedAccount(createdAccount);
      setSelectedAccountId(createdAccount.id);
      setName('');
      setAmount('');
      setToast({ isOpen: true, message: 'Compte cree et selectionne.' });
      history.push(ROUTES.BUDGET);
    } catch (error) {
      console.error('handleCreateAccount error', error);
      setToast({ isOpen: true, message: 'Creation du compte impossible.' });
    }
  };

  const handleSelectAccount = (account: Account) => {
    setSelectedAccount(account);
    setSelectedAccountId(account.id);
    setToast({ isOpen: true, message: `Compte "${account.name}" selectionne.` });
    history.push(ROUTES.BUDGET);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Compte</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding">
        <IonCard className='cardd'>
          <IonCardContent>
            <h3>Creer un compte budget</h3>
            <IonItem>
              <IonLabel position="stacked">Nom du compte</IonLabel>
              <IonInput
                value={name}
                placeholder="Ex: Compte principal"
                onIonChange={(event) => setName(event.detail.value ?? '')}
              />
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">Montant initial</IonLabel>
              <IonInput
                value={amount}
                type="number"
                inputmode="decimal"
                placeholder="0"
                onIonChange={(event) => setAmount(event.detail.value ?? '')}
              />
            </IonItem>
            <IonButton expand="block" className="ion-margin-top" onClick={() => void handleCreateAccount()}>
              Creer et ouvrir mon budget
            </IonButton>
          </IonCardContent>
        </IonCard>

        <IonCard className='cardd'>
          <IonCardContent>
            <h3>Mes comptes</h3>
            <IonList>
              {accounts.map((account) => (
                <IonItem
                  key={account.id}
                  button
                  onClick={() => handleSelectAccount(account)}
                  color={
                    String(selectedAccountId) === String(account.id) ? 'light' : undefined
                  }
                >
                  <IonLabel>
                    <h2>{account.name}</h2>
                    <p>Solde: {account.balance} FCFA</p>
                  </IonLabel>
                </IonItem>
              ))}
            </IonList>
            {accounts.length === 0 && <p>Aucun compte disponible pour le moment.</p>}
          </IonCardContent>
        </IonCard>

        <IonToast
          isOpen={toast.isOpen}
          message={toast.message}
          duration={2200}
          onDidDismiss={() => setToast((previous) => ({ ...previous, isOpen: false }))}
        />
      </IonContent>
    </IonPage>
  );
};

export default Compte;

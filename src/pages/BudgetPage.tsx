import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  IonBadge,
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
  IonSegment,
  IonSegmentButton,
  IonText,
  IonTitle,
  IonToast,
  IonToolbar,
  useIonViewWillEnter,
} from '@ionic/react';
import { useAuth } from '../contexts/AuthContext';
import { ROUTES } from '../constants/routes';
import accountService, { Account } from '../services/accountService';
import transactionService, { Transaction } from '../services/transactionService';
import {
  SELECTED_ACCOUNT_EVENT,
  getSelectedAccount,
  setSelectedAccount as persistSelectedAccount,
} from '../modules/accounts/selectedAccountStorage';
import './BudgetPage.css';

interface ToastState {
  isOpen: boolean;
  message: string;
}

type TransactionFilter = 'all' | 'expense' | 'income';

const formatTransactionDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Date inconnue';
  }

  return date.toLocaleString();
};

const BudgetPage: React.FC = () => {
  const { user } = useAuth();

  const [selectedAccount, setSelectedAccountState] = useState<Account | null>(getSelectedAccount());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [historyFilter, setHistoryFilter] = useState<TransactionFilter>('all');
  const [amountInput, setAmountInput] = useState('');
  const [descriptionInput, setDescriptionInput] = useState('');
  const [budgetInput, setBudgetInput] = useState('');
  const [toast, setToast] = useState<ToastState>({ isOpen: false, message: '' });

  const selectedBudgetLimit = Number(selectedAccount?.budgetLimit ?? 0);
  const selectedAccountId = selectedAccount?.id ?? null;
  const selectedAccountBudgetLimit = Number(selectedAccount?.budgetLimit ?? 0);
  const expenseTransactions = useMemo(
    () => transactions.filter((transaction) => transaction.type === 'expense'),
    [transactions],
  );
  const incomeTransactions = useMemo(
    () => transactions.filter((transaction) => transaction.type === 'income'),
    [transactions],
  );
  const filteredTransactions = useMemo(() => {
    if (historyFilter === 'expense') {
      return expenseTransactions;
    }

    if (historyFilter === 'income') {
      return incomeTransactions;
    }

    return transactions;
  }, [historyFilter, expenseTransactions, incomeTransactions, transactions]);
  const totalExpenses = useMemo(
    () => expenseTransactions.reduce((sum, transaction) => sum + Number(transaction.amount), 0),
    [expenseTransactions],
  );
  const totalIncomes = useMemo(
    () => incomeTransactions.reduce((sum, transaction) => sum + Number(transaction.amount), 0),
    [incomeTransactions],
  );
  const budgetUsagePercent =
    selectedBudgetLimit > 0 ? Math.round((totalExpenses / selectedBudgetLimit) * 100) : 0;
  const remainingBudget = selectedBudgetLimit - totalExpenses;

  const syncSelectedAccount = useCallback(async () => {
    const storedAccount = getSelectedAccount();
    setSelectedAccountState(storedAccount);

    if (!user || !storedAccount) {
      return;
    }

    try {
      const accounts = await accountService.getAccountsByUser(user.id);
      const matchedAccount =
        accounts.find((account) => String(account.id) === String(storedAccount.id)) ?? null;

      if (matchedAccount) {
        setSelectedAccountState(matchedAccount);
        persistSelectedAccount(matchedAccount);
      }
    } catch (error) {
      console.error('syncSelectedAccount error', error);
      setToast({ isOpen: true, message: 'Impossible de charger le compte selectionne.' });
    }
  }, [user]);

  useIonViewWillEnter(() => {
    setSelectedAccountState(getSelectedAccount());
    void syncSelectedAccount();
  });

  useEffect(() => {
    void syncSelectedAccount();
  }, [syncSelectedAccount]);

  useEffect(() => {
    const onSelectedAccountChange = (event: Event) => {
      const customEvent = event as CustomEvent<Account | null>;
      setSelectedAccountState(customEvent.detail ?? null);
    };

    window.addEventListener(SELECTED_ACCOUNT_EVENT, onSelectedAccountChange as EventListener);
    return () => {
      window.removeEventListener(SELECTED_ACCOUNT_EVENT, onSelectedAccountChange as EventListener);
    };
  }, []);

  useEffect(() => {
    if (selectedAccountId === null) {
      setBudgetInput('');
      return;
    }

    setBudgetInput(
      selectedAccountBudgetLimit > 0
        ? String(selectedAccountBudgetLimit)
        : '',
    );
  }, [selectedAccountId, selectedAccountBudgetLimit]);

  useEffect(() => {
    const loadTransactions = async () => {
      if (!selectedAccount) {
        setTransactions([]);
        setHistoryFilter('all');
        return;
      }

      try {
        const fetchedTransactions = await transactionService.getByAccount(selectedAccount.id);
        setTransactions(fetchedTransactions);
      } catch (error) {
        console.error('loadTransactions error', error);
        setToast({ isOpen: true, message: 'Impossible de charger les transactions.' });
      }
    };

    void loadTransactions();
  }, [selectedAccount]);

  const defineBudget = async () => {
    if (!selectedAccount) {
      setToast({ isOpen: true, message: 'Selectionnez un compte avant de continuer.' });
      return;
    }

    const budgetLimit = Number(budgetInput);
    if (Number.isNaN(budgetLimit) || budgetLimit <= 0) {
      setToast({ isOpen: true, message: 'Entrez un budget valide.' });
      return;
    }

    try {
      const updatedAccount = await accountService.updateAccount(selectedAccount.id, {
        budgetLimit,
      });

      persistSelectedAccount(updatedAccount);
      setSelectedAccountState(updatedAccount);
      setToast({ isOpen: true, message: 'Budget enregistre avec succes.' });
    } catch (error) {
      console.error('defineBudget error', error);
      setToast({ isOpen: true, message: 'Impossible de definir le budget.' });
    }
  };

  const addTransaction = async (type: 'income' | 'expense') => {
    if (!selectedAccount) {
      setToast({ isOpen: true, message: 'Selectionnez un compte avant de continuer.' });
      return;
    }

    const amount = Number(amountInput);
    if (Number.isNaN(amount) || amount <= 0) {
      setToast({ isOpen: true, message: 'Entrez un montant valide.' });
      return;
    }

    try {
      const createdTransaction = await transactionService.create({
        accountId: selectedAccount.id,
        type,
        amount,
        description: descriptionInput.trim() || undefined,
      });

      const nextBalance =
        type === 'income'
          ? Number(selectedAccount.balance) + amount
          : Number(selectedAccount.balance) - amount;

      const updatedAccount = await accountService.updateAccount(selectedAccount.id, {
        balance: nextBalance,
      });

      persistSelectedAccount(updatedAccount);
      setSelectedAccountState(updatedAccount);
      setTransactions((previous) => [createdTransaction, ...previous]);
      setAmountInput('');
      setDescriptionInput('');
      setToast({ isOpen: true, message: 'Transaction ajoutee.' });
    } catch (error) {
      console.error('addTransaction error', error);
      setToast({ isOpen: true, message: 'Echec lors de la transaction.' });
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Mes budgets</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding">
        {!selectedAccount ? (
          <IonCard className="cardd">
            <IonCardContent>
              <h3>Aucun compte selectionne</h3>
              <p>Choisissez ou creez un compte depuis la page Compte pour commencer.</p>
              <IonButton expand="block" routerLink={ROUTES.ACCOUNT}>
                Aller vers Compte
              </IonButton>
            </IonCardContent>
          </IonCard>
        ) : (
          <>
            <IonCard className='cardd'>
              <IonCardContent>
                <h3>{selectedAccount.name}</h3>
                <p>Solde actuel: {selectedAccount.balance} FCFA</p>
              </IonCardContent>
            </IonCard>

            <IonCard className='cardd'>
              <IonCardContent>
                <h3>Budget du compte</h3>
                <p>
                  Budget defini:{' '}
                  {selectedBudgetLimit > 0 ? `${selectedBudgetLimit} FCFA` : 'Aucun budget defini'}
                </p>
                {selectedBudgetLimit > 0 && (
                  <>
                    <p>Depenses: {totalExpenses} FCFA</p>
                    <p>Reste: {remainingBudget} FCFA</p>
                    <p>Taux d utilisation: {budgetUsagePercent}%</p>
                  </>
                )}
                <IonItem>
                  <IonLabel position="stacked">Montant du budget</IonLabel>
                  <IonInput
                    value={budgetInput}
                    type="number"
                    inputmode="decimal"
                    placeholder="Ex: 150000"
                    onIonChange={(event) => setBudgetInput(event.detail.value ?? '')}
                  />
                </IonItem>
                <IonButton expand="block" className="ion-margin-top" onClick={() => void defineBudget()}>
                  {selectedBudgetLimit > 0 ? 'Mettre a jour le budget' : 'Definir le budget'}
                </IonButton>
              </IonCardContent>
            </IonCard>

            <IonCard className='cardd'>
              <IonCardContent>
                <h3>Nouvelle transaction</h3>
                <IonItem>
                  <IonLabel position="stacked">Montant</IonLabel>
                  <IonInput
                    value={amountInput}
                    type="number"
                    inputmode="decimal"
                    placeholder="0"
                    onIonChange={(event) => setAmountInput(event.detail.value ?? '')}
                  />
                </IonItem>
                <IonItem>
                  <IonLabel position="stacked">Description</IonLabel>
                  <IonInput
                    value={descriptionInput}
                    placeholder="Ex: Courses"
                    onIonChange={(event) => setDescriptionInput(event.detail.value ?? '')}
                  />
                </IonItem>
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <IonButton expand="block" onClick={() => void addTransaction('expense')}>
                    Ajouter depense
                  </IonButton>
                  <IonButton color="success" expand="block" onClick={() => void addTransaction('income')}>
                    Ajouter revenu
                  </IonButton>
                </div>
              </IonCardContent>
            </IonCard>

            <IonCard className='cardd'>
              <IonCardContent>
                <h3>Historique des transactions</h3>
                <div className="history-summary">
                  <p>Depenses: {totalExpenses} FCFA</p>
                  <p>Revenus: {totalIncomes} FCFA</p>
                </div>

                <IonSegment
                  value={historyFilter}
                  className="history-filter"
                  onIonChange={(event) =>
                    setHistoryFilter((event.detail.value as TransactionFilter) ?? 'all')
                  }
                >
                  <IonSegmentButton value="all">
                    <IonLabel>Tout</IonLabel>
                  </IonSegmentButton>
                  <IonSegmentButton value="expense">
                    <IonLabel>Depenses</IonLabel>
                  </IonSegmentButton>
                  <IonSegmentButton value="income">
                    <IonLabel>Revenus</IonLabel>
                  </IonSegmentButton>
                </IonSegment>

                {filteredTransactions.length === 0 ? (
                  <IonText color="medium">Aucune transaction pour ce compte.</IonText>
                ) : (
                  <IonList>
                    {filteredTransactions.map((transaction) => {
                      const isExpense = transaction.type === 'expense';
                      const amount = Number(transaction.amount);
                      return (
                        <IonItem key={transaction.id}>
                          <div className="transaction-row">
                            <IonLabel className="transaction-meta">
                              <h3>
                                {transaction.description || (isExpense ? 'Depense' : 'Revenu')}
                              </h3>
                              <p>{formatTransactionDate(transaction.createdAt)}</p>
                            </IonLabel>
                            <div className="transaction-side">
                              <IonBadge color={isExpense ? 'danger' : 'success'}>
                                {isExpense ? 'Depense' : 'Revenu'}
                              </IonBadge>
                              <strong className={isExpense ? 'tx-amount expense' : 'tx-amount income'}>
                                {isExpense ? '-' : '+'}
                                {amount} FCFA
                              </strong>
                            </div>
                          </div>
                        </IonItem>
                      );
                    })}
                  </IonList>
                )}
              </IonCardContent>
            </IonCard>
          </>
        )}

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

export default BudgetPage;

import { Account } from '../../services/accountService';

const STORAGE_KEY = 'selectedAccount';
export const SELECTED_ACCOUNT_EVENT = 'selected-account-changed';

const emitSelectedAccountChange = (account: Account | null): void => {
  window.dispatchEvent(
    new CustomEvent<Account | null>(SELECTED_ACCOUNT_EVENT, {
      detail: account,
    }),
  );
};

export const getSelectedAccount = (): Account | null => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as Account;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
};

export const setSelectedAccount = (account: Account): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(account));
  emitSelectedAccountChange(account);
};

export const clearSelectedAccount = (): void => {
  localStorage.removeItem(STORAGE_KEY);
  emitSelectedAccountChange(null);
};

export interface User {
  username: string;
}

export interface Account {
  username: string;
  password: string;
}

export interface ExchangeData {
  id: string;
  fromCurrency: string;
  fromAmount: number;
  toCurrency: string;
  exchangeRate: string;
  toAmount: number;
  date: string;
}

export interface AppData {
  accounts: Account[];
  exchanges: ExchangeData[];
}

export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (username: string) => void;
  logout: () => void;
}

export interface FormData {
  fromCurrency: string;
  fromAmount: string;
  toCurrency: string;
  exchangeRate: string;
  toAmount?: string;
}

export interface FormErrors {
  fromAmount?: string;
  toCurrency?: string;
}

export type Currency = 'VND' | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CNY';

export interface ExchangeRates {
  [key: string]: {
    [key: string]: number;
  };
}


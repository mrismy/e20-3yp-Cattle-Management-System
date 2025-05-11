import React from 'react';
import { Dispatch, SetStateAction } from 'react';

type AuthType = {
  email: string;
  password: string;
  accessToken: string;
};

interface GlobalContextType {
  showCattleAddForm: boolean;
  setShowCattleAddForm: Dispatch<SetStateAction<boolean>>;
  showCattleCard: boolean;
  setShowCattleCard: Dispatch<SetStateAction<boolean>>;
  auth: AuthType;
  setAuth: Dispatch<SetStateAction<AuthType>>;
}

const GlobalContext = React.createContext<GlobalContextType>({
  showCattleAddForm: false,
  setShowCattleAddForm: () => {},
  showCattleCard: false,
  setShowCattleCard: () => {},
  auth: {
    email: '',
    password: '',
    accessToken: '',
  },
  setAuth: () => {},
});

export default GlobalContext;

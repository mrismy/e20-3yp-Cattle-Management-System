import { ReactNode, useEffect, useState } from 'react';
import GlobalContext from './GlobalContext';
import axios from 'axios';

interface ContextWrapperProps {
  children: ReactNode;
}

type AuthType = {
  email: string;
  password: string;
  accessToken: string;
};

const ContextWrapper = ({ children }: ContextWrapperProps) => {
  const [showCattleAddForm, setShowCattleAddForm] = useState(false);
  const [showCattleCard, setShowCattleCard] = useState(false);
  const [auth, setAuth] = useState<AuthType>({
    email: '',
    password: '',
    accessToken: '',
  });

  return (
    <GlobalContext.Provider
      value={{
        showCattleAddForm,
        setShowCattleAddForm,
        showCattleCard,
        setShowCattleCard,
        auth,
        setAuth,
      }}>
      {children}
    </GlobalContext.Provider>
  );
};

export default ContextWrapper;

import { ReactNode, useState } from 'react';
import GlobalContext from './GlobalContext';

interface ContextWrapperProps {
  children: ReactNode;
}

const ContextWrapper = ({ children }: ContextWrapperProps) => {
  const [showCattleAddForm, setShowCattleAddForm] = useState(false);

  return (
    <GlobalContext.Provider
      value={{
        showCattleAddForm,
        setShowCattleAddForm,
      }}>
      {children}
    </GlobalContext.Provider>
  );
};

export default ContextWrapper;

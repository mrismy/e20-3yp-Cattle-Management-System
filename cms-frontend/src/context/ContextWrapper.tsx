import { ReactNode, useState } from 'react';
import GlobalContext from './GlobalContext';

interface ContextWrapperProps {
  children: ReactNode;
}

const ContextWrapper = ({ children }: ContextWrapperProps) => {
  const [showCattleAddForm, setShowCattleAddForm] = useState(false);
  const [showCattleCard, setShowCattleCard] = useState(false);

  return (
    <GlobalContext.Provider
      value={{
        showCattleAddForm,
        setShowCattleAddForm,
        showCattleCard,
        setShowCattleCard,
      }}>
      {children}
    </GlobalContext.Provider>
  );
};

export default ContextWrapper;

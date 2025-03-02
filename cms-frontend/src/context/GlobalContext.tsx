import React from 'react';
import { Dispatch, SetStateAction } from 'react';

interface GlobalContextType {
  showCattleAddForm: boolean;
  setShowCattleAddForm: Dispatch<SetStateAction<boolean>>;
}

const GlobalContext = React.createContext<GlobalContextType>({
  showCattleAddForm: false,
  setShowCattleAddForm: () => {},
});

export default GlobalContext;

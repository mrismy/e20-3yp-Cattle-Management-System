import React from 'react';
import { Dispatch, SetStateAction } from 'react';

interface GlobalContextType {
  showCattleAddForm: boolean;
  setShowCattleAddForm: Dispatch<SetStateAction<boolean>>;
  showCattleCard: boolean;
  setShowCattleCard: Dispatch<SetStateAction<boolean>>;
}

const GlobalContext = React.createContext<GlobalContextType>({
  showCattleAddForm: false,
  setShowCattleAddForm: () => {},
  showCattleCard: false,
  setShowCattleCard: () => {},
});

export default GlobalContext;

import { ReactNode, useEffect, useState } from "react";
import GlobalContext from "./GlobalContext";
import axios from "axios";

interface ContextWrapperProps {
  children: ReactNode;
}

type AuthType = {
  email: string;
  password: string;
  accessToken: string;
  firstName: string;
  lastName: string;
};

const ContextWrapper = ({ children }: ContextWrapperProps) => {
  const [showCattleAddForm, setShowCattleAddForm] = useState(false);
  const [showCattleCard, setShowCattleCard] = useState(false);
  const [auth, setAuth] = useState<AuthType>(() => {
    // Initialize auth state from localStorage if available
    const savedAuth = localStorage.getItem("auth");
    return savedAuth
      ? JSON.parse(savedAuth)
      : {
          email: "",
          password: "",
          accessToken: "",
          firstName: "",
          lastName: "",
        };
  });

  // Save auth state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("auth", JSON.stringify(auth));
  }, [auth]);

  return (
    <GlobalContext.Provider
      value={{
        showCattleAddForm,
        setShowCattleAddForm,
        showCattleCard,
        setShowCattleCard,
        auth,
        setAuth,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default ContextWrapper;

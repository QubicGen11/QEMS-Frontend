import React, { createContext, useContext, useState } from "react";

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [name, setName] = useState('');
  return (
    <UserContext.Provider value={{ name,setName }}>
      {children}
    </UserContext.Provider>
  );
};

import React, { createContext, useContext, useState } from "react";

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [name, setName] = useState('');

  // Example function to set the user's name
  const login = (username) => {
    setName(username);
  };

  return (
    <UserContext.Provider value={{ name, setName, login }}>
      {children}
    </UserContext.Provider>
  );
};

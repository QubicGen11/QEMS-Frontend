import React, { createContext, useState, useContext } from 'react';

// Create a context with a default value
const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [email, setEmail] = useState('');

  return (
    <UserContext.Provider value={{ email, setEmail }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use the UserContext
export const useUser = () => {
  return useContext(UserContext);
};

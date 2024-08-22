import { createContext, useState, useContext } from 'react';
import PropTypes from 'prop-types';


const UserContext = createContext(null);

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

UserProvider.propTypes = {
  children: PropTypes.node.isRequired // 'node' copre qualsiasi cosa che può essere renderizzata: numeri, stringhe, elementi o un array (o frammento) contenente questi tipi.
};
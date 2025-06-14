import { useContext } from 'react';
import { AuthContext } from '../App';

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    // Return empty object instead of throwing error to prevent crashes
    return {
      user: null,
      loading: false,
      login: () => {},
      register: () => {},
      logout: () => {}
    };
  }
  
  return context;
};
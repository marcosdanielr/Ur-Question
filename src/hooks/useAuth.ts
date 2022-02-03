import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export function useAuth() {
  const valueContext = useContext(AuthContext)

  return valueContext;
}
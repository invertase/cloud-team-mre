import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../firebase';

export const addAdminRole = async (email: string) => {
  const functions = getFunctions(app);
  const addAdminRoleFunc = httpsCallable(functions, 'addAdminRole');
  
  try {
    const result = await addAdminRoleFunc({ email });
    return result.data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}; 
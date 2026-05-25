import { useContext } from 'react';
import { AuthContext } from '../../hooks/useAuth';

export const useAdminAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AuthProvider');

  const isAdmin = ctx.user && ['admin', 'moderator'].includes(ctx.user.role);

  return {
    ...ctx,
    isAdmin,
  };
};

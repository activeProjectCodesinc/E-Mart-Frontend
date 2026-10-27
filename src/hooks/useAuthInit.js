import { useState, useEffect } from 'react';
import { getAccessToken, hasRefreshToken, clearAllAuth } from '@/services/tokenService';
import { refreshAccessToken } from '@/services/apiServices';

/**
 * Initializes authentication on application boot.
 * If access token is absent from memory but a refresh token exists in cookie,
 * silently restores the in-memory access token.
 */
export const useAuthInit = () => {
  const [isInitializing, setIsInitializing] = useState(() => {
    // Only initialize if access token is not yet in memory but a refresh token/session is present
    return !getAccessToken() && hasRefreshToken();
  });

  useEffect(() => {
    if (!isInitializing) return;

    let isMounted = true;
    refreshAccessToken()
      .catch(() => {
        clearAllAuth();
      })
      .finally(() => {
        if (isMounted) {
          setIsInitializing(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isInitializing]);

  return { isInitializing };
};

export default useAuthInit;

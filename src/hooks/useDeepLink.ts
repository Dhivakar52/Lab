import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const useDeepLink = (onPostFound: (postId: number) => void) => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const postId = params.get('postId');
    const scrollTo = params.get('scrollTo');

    if (postId && scrollTo === 'post') {
      // Clean URL after processing (prevents re-triggering)
      const cleanUrl = window.location.pathname;
      navigate(cleanUrl, { replace: true });
      
      // Trigger scroll to post
      const postIdNumber = parseInt(postId, 10);
      if (!isNaN(postIdNumber)) {
        // Small delay to ensure URL is cleaned
        setTimeout(() => {
          onPostFound(postIdNumber);
        }, 100);
      }
    }
  }, [location.search, navigate, onPostFound]);
};
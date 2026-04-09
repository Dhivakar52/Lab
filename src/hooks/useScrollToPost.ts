import { useRef } from 'react';

export const useScrollToPost = () => {
  const scrollTimeoutRef = useRef<number>(0);
  const retryCountRef = useRef(0);

  const scrollToPost = (postId: number) => {
    // Clear any existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Reset retry count
    retryCountRef.current = 0;

    const attemptScroll = () => {
      const postElement = document.querySelector(`[data-post-id="${postId}"]`);
      
      if (postElement) {
        console.log(`✅ Found post ${postId}, scrolling...`);
        
        // Smooth scroll to the post
        postElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
        
        // Add highlight effect
        postElement.classList.add('highlight-pulse');
        
        // Remove highlight after animation
        setTimeout(() => {
          postElement.classList.remove('highlight-pulse');
        }, 2000);
        
        // Reset retry count on success
        retryCountRef.current = 0;
      } else if (retryCountRef.current < 15) {
        // Retry with increasing delays (max 3 seconds)
        const delay = Math.min(200 * Math.pow(1.2, retryCountRef.current), 3000);
        console.log(`⏳ Post ${postId} not found, retry ${retryCountRef.current + 1} in ${delay}ms`);
        
        scrollTimeoutRef.current = setTimeout(attemptScroll, delay);
        retryCountRef.current++;
      } else {
        console.error(`❌ Failed to find post ${postId} after ${retryCountRef.current} attempts`);
      }
    };

    attemptScroll();
  };

  return { scrollToPost };
};
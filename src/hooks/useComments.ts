// src/hooks/useComments.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentService } from '../services/commentService';
import { useAuth } from '../components/ContextAPI/AuthContext';

// Query key for comments
const commentsKey = (nominationId: number) => ['comments', nominationId];

export const useComments = (nominationId: number) => {
  const { authToken } = useAuth();

  return useQuery({
    queryKey: commentsKey(nominationId),
    queryFn: () => commentService.getComments(nominationId, authToken!),
    enabled: !!authToken && !!nominationId,
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useAddComment = () => {
  const queryClient = useQueryClient();
  const { authToken, userId } = useAuth();

  return useMutation({
    mutationFn: ({ 
      nominationId, 
      text, 
      parentCommentId 
    }: { 
      nominationId: number; 
      text: string; 
      parentCommentId?: number;
    }) =>
      commentService.addComment({
        nominationID: nominationId,
        commentedBy: userId!,
        commentsText: text,
        parentCommentID: parentCommentId,
        token: authToken!,
      }),

    onSuccess: (_newComment, { nominationId }) => {
      // Invalidate and refetch comments for this post
      queryClient.invalidateQueries({ queryKey: commentsKey(nominationId) });
      
      // Also update the comment count in posts (optional)
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};
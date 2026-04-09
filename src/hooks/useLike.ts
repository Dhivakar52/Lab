// // src/hooks/useLike.ts
// import { useMutation, useQueryClient } from '@tanstack/react-query';
// import { likeService } from '../services/likeService';
// import { useAuth } from '../components/ContextAPI';

// // Query key for posts (to invalidate cache)
// const postsKey = ['posts'];

// export const useToggleLike = () => {
//   const queryClient = useQueryClient();
//   const { authToken, userId, username } = useAuth();

//   return useMutation({
//     mutationFn: ({ 
//       nominationId, 
//       likeId, 
//       isLiking 
//     }: { 
//       nominationId: number; 
//       likeId?: number; 
//       isLiking: boolean;
//     }) => {
//       if (isLiking) {
//         return likeService.addLike({
//           nominationId,
//           likedBy: userId!,
//           token: authToken!,
//           username: username!,
//         });
//       } else {
//         return likeService.removeLike({
//           likeId: likeId!,
//           nominationId,
//           likedBy: userId!,
//           token: authToken!,
//         });
//       }
//     },

//     onMutate: async ({ nominationId, isLiking }) => {
//       // Cancel ongoing refetches
//       await queryClient.cancelQueries({ queryKey: postsKey });

//       // Get current posts data
//       const previousPosts = queryClient.getQueryData(postsKey);

//       // Optimistically update the cache
//       queryClient.setQueryData(postsKey, (old: any) => {
//         if (!old) return old;
        
//         return old.map((post: any) => {
//           if (post.NominationID === nominationId) {
//             if (isLiking) {
//               // Add like optimistically
//               return {
//                 ...post,
//                 LikedBy: [
//                   ...(post.LikedBy || []),
//                   {
//                     NominationLikeID: Date.now(),
//                     UserID: userId,
//                     UserName: username,
//                   },
//                 ],
//               };
//             } else {
//               // Remove like optimistically
//               return {
//                 ...post,
//                 LikedBy: post.LikedBy?.filter((like: any) => like.UserID !== userId),
//               };
//             }
//           }
//           return post;
//         });
//       });

//       return { previousPosts };
//     },

//     onError: (err, variables, context) => {
//       // Rollback on error
//       queryClient.setQueryData(postsKey, context?.previousPosts);
//       console.error("Like mutation failed:", err);
//     },

//     onSettled: () => {
//       // Refetch to ensure consistency
//       queryClient.invalidateQueries({ queryKey: postsKey });
//     },
//   });
// };
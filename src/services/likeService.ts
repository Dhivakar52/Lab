// src/services/likeService.ts
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const likeService = {
  // Add like
  addLike: async (data: {
    nominationId: number;
    likedBy: number;
    token: string;
    username:string;
  }) => {
    const response = await axios.post(
      `${API_URL}/api/nominationlike`,
      null,
      {
        params: {
          NominationID: data.nominationId,
          LikedBy: data.likedBy,
          Active: true,
          SubmittedBy: data.likedBy,
        },
        headers: {
          Accept: "text/plain",
          Authorization: `Bearer ${data.token}`,
          "Content-Type": "application/json",
        },
      }
    );
    
    return {
      NominationLikeID: response?.data?.NominationLikeID || response?.data?.nominationLikeId || Date.now(),
      UserID: data.likedBy,
      UserName: data.username,
    };
  },

  // Remove like
  removeLike: async (data: {
    likeId: number;
    nominationId: number;
    likedBy: number;
    token: string;
  }) => {
    await axios.delete(
      `${API_URL}/api/nominationlike/${data.likeId}`,
      {
        headers: {
          Authorization: `Bearer ${data.token}`,
        },
        data: {
          nominationID: data.nominationId,
          likedBy: data.likedBy,
          active: false,
          submittedBy: data.likedBy,
        },
      }
    );
    return { deleted: true };
  },
};
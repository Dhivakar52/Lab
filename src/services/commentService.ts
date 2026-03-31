// src/services/commentService.ts
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const commentService = {
  // Get comments for a post
  getComments: async (nominationId: number, token: string) => {
    const response = await axios.get(`${API_URL}/api/nominationcomments`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    
    // Filter comments for specific post
    const allComments = response.data;
    return allComments.filter((c: any) => c.NominationID === nominationId);
  },

  // Add new comment
  addComment: async (data: {
    nominationID: number;
    commentedBy: number;
    commentsText: string;
    parentCommentID?: number;
    token: string;
  }) => {
    const response = await axios.post(
      `${API_URL}/api/nominationcomments`,
      {
        nominationID: data.nominationID,
        commentedBy: data.commentedBy,
        commentsText: data.commentsText,
        parentCommentID: data.parentCommentID,
        active: true,
        submittedBy: data.commentedBy,
      },
      {
        params: { id: data.nominationID },
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${data.token}`,
        },
      }
    );
    return response.data;
  },
};
import React from 'react';
import { Heart, MessageCircle } from 'lucide-react';
import { useAuth } from '../ContextAPI/AuthContext';

interface Feed {
  UserID: number;
  Nominee: string;
  Tenant: string;
  AwardCategory: string;
  NominatedCount: number;
  Description: string;
  Likes: number;
  Comments: number;
  Views: number;
}

interface PostCardProps {
  profile: Feed[];
//   setProfile: React.Dispatch<React.SetStateAction<Feed[]>>;
}

const ProfileCard: React.FC<PostCardProps> = ({ profile }) => {
  const { email } = useAuth();

  return (
    <div className="space-y-4">
      {profile.length === 0 ? (
        <p className="text-gray-500 text-center text-sm">No profiles found</p>
      ) : (
        profile.map((user, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm overflow-hidden"
          >
            <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-4 sm:px-6 py-4">
              <div className="text-center">
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face"
                  alt="Profile"
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-full mx-auto border-3 border-white"
                />
              </div>
            </div>

            <div className="px-4 sm:px-6 py-4 text-center">
              <h3 className="font-semibold text-gray-900 text-base sm:text-lg">
                {user.Nominee}
              </h3>
              <p className="text-sm text-gray-600">{user.Tenant}</p>
              <p className="text-xs sm:text-sm text-gray-500 break-all">{email}</p>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Category:</span>
                  <span className="font-medium text-gray-900">
                    {user.AwardCategory}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Nominated:</span>
                  <span className="font-medium text-gray-900">
                    {user.NominatedCount}
                  </span>
                </div>
              </div>

              <div className="flex justify-center mt-4 space-x-4">
                <div className="flex items-center space-x-1">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-medium">
                    {user.Likes} Likes
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <MessageCircle className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">
                    {user.Comments} Comments
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};


export default ProfileCard;

import React from 'react';
import { Heart, MessageCircle,Eye } from 'lucide-react';
import avatar from '../../assets/images/profile.png';

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

import { Swiper, SwiperSlide } from "swiper/react";
import { Keyboard, Pagination, Autoplay, Navigation } from "swiper/modules";

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

interface ProfileCardProps {
  profile: Feed[];
  userDetail: any; 
}

const ProfileCard: React.FC<ProfileCardProps> = ({ profile, userDetail }) => {

  const user = userDetail ? userDetail[0] : null; // user details from API

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">

      {/* Card Top: User Info */}
      <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-4 py-4">
        <div className="text-center">
          <img
            src={avatar}
            alt="Profile"
            className="w-16 h-16 rounded-full mx-auto border-4 border-white"
          />
        </div>
      </div>

      {/* User Details */}
      <div className="px-4 sm:px-6 py-4 text-center">
        <h3 className="font-semibold text-gray-900 text-lg">
          {user?.UserName}
        </h3>

        <p className="text-sm text-gray-600">
          {user?.TenantName}
        </p>

        <p className="text-xs sm:text-sm text-gray-500 break-all">
          {user?.Email}
        </p>

        {/* Category Slider */}
        {profile.length > 0 ? (
          <Swiper
            slidesPerView={1}
            spaceBetween={20}
            keyboard={{ enabled: true }}
            pagination={{ clickable: true }}
            navigation={true}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            modules={[Keyboard, Pagination, Autoplay, Navigation]}
            className="mySwiper mt-4"
          >
           {profile.map((cat: Feed, index) => (
              <SwiperSlide key={index}>
                <div className="p-4 bg-white rounded-xl border border-gray-200 shadow text-black my-3">
                  <div className="flex items-center justify-center space-x-3 mb-3 whitespace-nowrap overflow-hidden">
                    <span className="px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800 max-w-[200px]">
                      🏆 {cat.AwardCategory || "-"}
                    </span>

                    <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                      👥 {cat.NominatedCount || 0} Nominated
                    </span>
                  </div>

                  <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                    <span className="text-sm font-medium flex items-center space-x-1 text-gray-700">
                      <Heart className="w-4 h-4 text-red-500" /> 
                      <span>{cat.Likes || 0} Likes</span>
                    </span>

                    <span className="text-sm font-medium flex items-center space-x-1 text-gray-600">
                      <MessageCircle className="w-4 h-4 text-blue-500" /> 
                      <span>{cat.Comments || 0} Comments</span>
                    </span>

                    <span className="text-sm font-medium flex items-center space-x-1 text-gray-600">
                      <Eye className="w-4 h-4" /> 
                      <span>{cat.Views || 0} Views</span>
                    </span>
                  </div>
                </div>
              </SwiperSlide>
            ))}

          </Swiper>
        ) : (
          <p className="text-gray-500 text-sm mt-4">No nominations</p>
        )}

      </div>
    </div>
  );
};

export default ProfileCard;

import React from 'react';
import { Heart, MessageCircle,Eye, Trophy, UsersRound } from 'lucide-react';
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
                    
                     <span className="px-2 py-2 rounded-full text-xs bg-[#EDF4FF] text-[#213048] flex items-center">
                      <Trophy size={16}/>  <span className="ms-1">{cat.AwardCategory || "-"}</span>
                      </span>
                    <span className="px-2 py-2 rounded-full text-xs bg-[#EDF4FF] text-[#213048] flex items-center">
                    <UsersRound size={16}/>  <span className="ms-1"> {cat.NominatedCount || 0}</span>
                         </span>
                  </div>

               {/* <div className="flex justify-center items-center gap-2  py-2">


  <div
    className="flex items-center gap-1 px-2 py-0.5
               rounded-full border border-gray-300
               text-xs font-medium text-gray-700
               hover:bg-red-50 hover:border-red-300
               transition cursor-pointer"
  >
    <Heart className="w-3.5 h-3.5 text-red-500" />
    <span>{cat.Likes || 0} Likes</span>
  </div>


  <div
    className="flex  items-center gap-1 px-2 py-0.5
               rounded-full border border-gray-300
               text-xs font-medium text-gray-700
               hover:bg-blue-50 hover:border-blue-300
               transition cursor-pointer"
  >
    <MessageCircle className="w-3.5 h-3.5 text-blue-500" />
    <span>{cat.Comments || 0} Comments</span>
  </div>


  <span
    className="flex items-center gap-1 px-2 py-0.5
               rounded-full border border-gray-300
               text-xs font-medium text-gray-700
               hover:bg-gray-100 hover:border-gray-400
               transition cursor-pointer"
  >
    <Eye className="w-3.5 h-3.5 text-gray-600" />
    <span>{cat.Views || 0} Views</span>
  </span>

</div> */}



<div className="flex flex-col sm:flex-row justify-center items-center gap-2 py-2">

  {/* Likes */}
  <div
    className="w-full sm:w-auto
               flex items-center justify-center gap-1 px-2 py-0.5
               rounded-full border border-gray-300
               text-xs font-medium text-gray-700
               hover:bg-red-50 hover:border-red-300
               transition cursor-pointer"
  >
    <Heart className="w-3.5 h-3.5 text-red-500" />
    <span>{cat.Likes || 0} Likes</span>
  </div>

  {/* Comments */}
  <div
    className="w-full sm:w-auto
               flex items-center justify-center gap-1 px-2 py-0.5
               rounded-full border border-gray-300
               text-xs font-medium text-gray-700
               hover:bg-blue-50 hover:border-blue-300
               transition cursor-pointer"
  >
    <MessageCircle className="w-3.5 h-3.5 text-blue-500" />
    <span>{cat.Comments || 0} Comments</span>
  </div>

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

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

  return (<>
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
            spaceBetween={0}
            centeredSlides={true}
            pagination={{
              clickable: true,
              renderBullet: (index, className) => {
                return `<span class="${className} custom-dot"></span>`;
              },
            }}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}
            modules={[Pagination, Autoplay]}
            className="mt-4 exactSwiper pb-8">
           {profile.map((cat: Feed, index) => (
             <SwiperSlide>
              <div className="exact-card">

                {/* TOP PILLS */}
                <div className="pill-row">
                  <div className="pill">
                    <Trophy size={16} />
                    <span>{cat.AwardCategory}</span>
                  </div>

                  <div className="pill">
                    <UsersRound size={16} />
                    <span>{cat.NominatedCount}</span>
                  </div>
                </div>

                <div className="action-row">
                  <div className="action-pill">
                    <Heart className='text-red-500' size={14} />
                    <span>{cat.Likes} Likes</span>
                  </div>
                  <div className="action-pill">
                    <MessageCircle className='text-blue-500' size={14} />
                    <span>{cat.Comments} Comments</span>
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
          <style>{`
.exact-card {
  width: 100%;
  background: #ffffff;
  border-radius: 10px;        
  border: 1px solid #e6e9ef;
  padding: 16px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.04); 
}
.pill-row {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 14px;
}
.pill {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #edf4ff;
  color: #213048;
  font-size: 12px;
  padding: 5px 10px;    
  border-radius: 999px;
  font-weight: 500;
}
.action-row {
  display: flex;
  justify-content: center;
  gap: 12px;
}
.action-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  padding: 6px 12px;
  border-radius: 8px;       
  border: 1px solid #e5e7eb;
  background: #ffffff;
  color: #374151;
}
.exactSwiper .swiper-pagination {
  bottom: 0;
  position: relative;
  margin-top: 12px;
}
.exact-card {
  min-height: 110px;  
}
.custom-dot {
  width: 8px;
  height: 8px;
  background: #d1d5db;   
  border-radius: 999px;
  display: inline-block;
  margin: 0 4px;
  transition: all 0.35s ease;
}
.swiper-pagination-bullet-active.custom-dot {
  width: 26px;          
  background: #16a34a;  
}

 `}</style>
    </>
  );
};

export default ProfileCard;

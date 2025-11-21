import React from 'react';
import { Heart, MessageCircle } from 'lucide-react';
import { useAuth } from '../ContextAPI/AuthContext';
import avatar from '../../assets/images/profile.png'

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

 import { Swiper, SwiperSlide } from "swiper/react";

import { Keyboard, Pagination, Autoplay,Navigation } from "swiper/modules";


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


  const grouped = profile.reduce((acc: any, item) => {
    if (!acc[item.UserID]) {
      acc[item.UserID] = {
        Nominee: item.Nominee,
        Tenant: item.Tenant,
        categories: []
      };
    }

    acc[item.UserID].categories.push({
      AwardCategory: item.AwardCategory,
      NominatedCount: item.NominatedCount,
      Likes: item.Likes,
      Comments: item.Comments
    });

    return acc;
  }, {});

  const finalProfiles = Object.values(grouped);
  // console.log("Profiles", finalProfiles)
  

  return (
  <div className="space-y-4">
    {finalProfiles.length === 0 ? (
      <p className="bg-white p-4 rounded text-gray-500 text-center text-sm">No profiles found</p>
    ) : (
      finalProfiles.map((user: any, index: number) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-sm overflow-hidden"
        >
          <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-4 sm:px-6 py-4">
            <div className="text-center">
              <img
                src={avatar}
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

            {/* Category Blocks */}
            {/* <div className="mt-4 space-y-4">
              {user.categories.map((cat: any, i: number) => (
                <div key={i} className="p-3 ">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium text-gray-900">
                      {cat.AwardCategory || 0}
                    </span> 
                  </div>

                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-600">Nominated:</span>
                    <span className="font-medium text-gray-900">
                      {cat.NominatedCount || 0}
                    </span>
                  </div>

                  <div className="flex justify-center mt-3 space-x-4">
                    <div className="flex items-center space-x-1">
                      <Heart className="w-4 h-4 text-red-500" />
                      <span>{cat.Likes || 0} Likes</span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <MessageCircle className="w-4 h-4 text-blue-500" />
                      <span>{cat.Comments || 0} Comments</span>
                    </div>
                  </div>
                </div>
              ))}
            </div> */}
           

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
  modules={[Keyboard, Pagination, Autoplay,Navigation]}
  className="mySwiper"
>

  <div className="mt-4 space-y-4">
     {user.categories.map((cat: any, i: number) => (
    <SwiperSlide key={i}>
      <div className="p-3 bg-white rounded-xl border border-gray-200
       shadow text-black my-3">
        <div className='my-3'>
        <div className="flex justify-between text-sm ">
          <span className="text-gray-600">Category:</span>
          <span className="font-medium text-gray-900">
            {cat.AwardCategory || 0}
          </span>
        </div>

        <div className="flex justify-between text-sm mt-1">
          <span className="text-gray-600">Nominated:</span>
          <span className="font-medium text-gray-900">
            {cat.NominatedCount || 0}
          </span>
        </div>

        <div className="flex justify-center mt-3 space-x-4">
          <div className="flex items-center space-x-1">
            <Heart className="w-4 h-4 text-red-500" />
            <span>{cat.Likes || 0} Likes</span>
          </div>

          <div className="flex items-center space-x-1">
            <MessageCircle className="w-4 h-4 text-blue-500" />
            <span>{cat.Comments || 0} Comments</span>
          </div>
        </div>
        </div>
      </div>
    </SwiperSlide>
  ))}
  </div>
 
</Swiper>




          </div>
        </div>
      ))
    )}
  </div>
);

};


export default ProfileCard;

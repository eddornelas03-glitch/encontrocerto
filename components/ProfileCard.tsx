import React, { useState } from 'react';
import type { UserProfile } from '../types';

interface ProfileCardProps {
  profile: UserProfile;
  onSwipe: (direction: 'left' | 'right' | 'super') => void;
  isTopCard: boolean;
}

const InfoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A.75.75 0 0010.747 15l.293-.157a.75.75 0 00.53-1.027l-.459-2.066a.25.25 0 01.244-.304H11a.75.75 0 000-1.5H9z" clipRule="evenodd" />
    </svg>
);

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clipRule="evenodd" />
    </svg>
);

const HeartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
        <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-1.344-.905 60.46 60.46 0 01-4.432-4.162 16.32 16.32 0 01-.863-1.033 1.875 1.875 0 01.44-2.524l3.353-3.353a1.125 1.125 0 011.591 0l.044.044 1.06 1.06a.75.75 0 001.06-1.06l-1.06-1.06a2.625 2.625 0 00-3.712 0l-3.353 3.353a3.375 3.375 0 00-.986 4.475 61.954 61.954 0 004.755 4.502s.315.25.315.25l.008.006c.06.045.12.086.176.124a.75.75 0 001.12-1.022l-.178-.126a13.74 13.74 0 00-1.343-.904 45.36 45.36 0 00-4.432-4.162 14.82 14.82 0 00-.863-1.033 1.875 1.875 0 01.44-2.524l3.353-3.353a1.125 1.125 0 011.591 0l.044.044 1.06 1.06a.75.75 0 001.06-1.06l-1.06-1.06a2.625 2.625 0 00-3.712 0l-3.353 3.353a3.375 3.375 0 00-.986 4.475 61.954 61.954 0 004.755 4.502l.003.002a.75.75 0 001.12-1.022l-.003-.002z" />
    </svg>
);


const StarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.007z" clipRule="evenodd" />
    </svg>
);

const SparklesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
        <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.39-3.423 3.11a.75.75 0 00.44 1.337l6.458.992-2.903 6.04a.75.75 0 001.242.828l4.318-5.398 4.318 5.398a.75.75 0 001.242-.828l-2.903-6.04 6.458-.992a.75.75 0 00.44-1.337l-3.423-3.11-4.753-.39-1.83-4.401z" clipRule="evenodd" />
    </svg>
);

export const ProfileCard: React.FC<ProfileCardProps> = ({ profile, onSwipe, isTopCard }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="absolute inset-0 p-4">
      <div className="relative w-full h-full bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
        <img src={profile.images[0]} alt={profile.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20"></div>

        <div 
            onClick={() => setShowDetails(true)}
            className={`cursor-pointer absolute inset-0 p-5 flex flex-col justify-end text-white transition-opacity duration-300 ${showDetails ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        >
            <div>
                <h1 className="text-3xl font-bold">{profile.apelido}, <span className="font-light">{profile.age}</span></h1>
                <p className="text-gray-300 text-lg">{profile.tagline}</p>
                <div className="mt-2 inline-flex items-center gap-2 bg-green-500/20 text-green-300 text-sm font-semibold py-1 px-3 rounded-full">
                    <SparklesIcon />
                    {profile.compatibility}% Compatível
                </div>
            </div>
             <p className="mt-4 self-start flex items-center gap-2 text-white font-semibold text-sm">
                <InfoIcon />
                Toque para ver mais
            </p>
        </div>

        {/* Details View */}
        <div className={`absolute inset-0 bg-gray-900/90 backdrop-blur-sm text-white overflow-y-auto transition-opacity duration-300 ${showDetails ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
             <button onClick={() => setShowDetails(false)} className="sticky top-4 right-4 float-right text-white z-10 bg-black/20 rounded-full p-1">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-8 h-8"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg>
            </button>
            <div className="p-5 pt-16">
                <h1 className="text-3xl font-bold">{profile.apelido}, <span className="font-light">{profile.age}</span></h1>
                <p className="text-gray-300">{profile.city}, {profile.state}</p>
                
                <div className="mt-6">
                    <div className="flex overflow-x-auto space-x-2 pb-2 -mx-5 px-5 snap-x snap-mandatory">
                        {profile.images.map((img, index) => (
                            <img key={index} src={img} alt={`${profile.name} ${index+1}`} className="w-40 h-52 object-cover rounded-lg flex-shrink-0 snap-center"/>
                        ))}
                    </div>
                </div>

                <div className="mt-6 border-t border-gray-700 pt-4">
                    <h2 className="text-pink-400 font-bold">Bio</h2>
                    <p className="mt-1 text-gray-200">{profile.bio}</p>
                </div>
                <div className="mt-4">
                    <h2 className="text-pink-400 font-bold">Interesses</h2>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {profile.interests.map(interest => (
                            <span key={interest} className="bg-gray-700 text-gray-200 text-sm font-medium px-3 py-1 rounded-full">{interest}</span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
        
        {isTopCard && !showDetails && (
            <div className="absolute bottom-24 left-0 right-0 flex justify-center items-center gap-6">
                <button onClick={() => onSwipe('left')} className="p-4 bg-white/10 backdrop-blur-sm rounded-full text-red-500 hover:bg-white/20 transition-colors">
                    <CloseIcon />
                </button>
                 <button onClick={() => onSwipe('super')} className="p-4 bg-white/10 backdrop-blur-sm rounded-full text-blue-400 hover:bg-white/20 transition-colors">
                    <StarIcon />
                </button>
                <button onClick={() => onSwipe('right')} className="p-4 bg-white/10 backdrop-blur-sm rounded-full text-green-400 hover:bg-white/20 transition-colors">
                    <HeartIcon />
                </button>
            </div>
        )}

      </div>
    </div>
  );
};
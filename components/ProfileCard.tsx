import React, { useState, useEffect, useRef } from 'react';
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

const SparklesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
        <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.39-3.423 3.11a.75.75 0 00.44 1.337l6.458.992-2.903 6.04a.75.75 0 001.242.828l4.318-5.398 4.318 5.398a.75.75 0 001.242-.828l-2.903-6.04 6.458-.992a.75.75 0 00.44-1.337l-3.423-3.11-4.753-.39-1.83-4.401z" clipRule="evenodd" />
    </svg>
);

export const ProfileCard: React.FC<ProfileCardProps> = ({ profile, onSwipe, isTopCard }) => {
    const [showDetails, setShowDetails] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const [isDragging, setIsDragging] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [rotation, setRotation] = useState(0);
    const [transition, setTransition] = useState('transform 0.3s ease-out');
    const [actionOpacities, setActionOpacities] = useState({ like: 0, nope: 0, super: 0 });

    const SWIPE_THRESHOLD = 100;
    const SUPER_SWIPE_THRESHOLD = -120;

    const getPointerPosition = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
        return 'touches' in e ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : { x: e.clientX, y: e.clientY };
    };

    const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isTopCard || showDetails) return;
        e.preventDefault();
        setIsDragging(true);
        setStartPos(getPointerPosition(e));
        setTransition('none');
    };

    const handleDragMove = (e: MouseEvent | TouchEvent) => {
        if (!isDragging) return;

        const currentPos = getPointerPosition(e);
        const deltaX = currentPos.x - startPos.x;
        const deltaY = currentPos.y - startPos.y;
        
        setPosition({ x: deltaX, y: deltaY });
        setRotation(deltaX / 20);

        const likeOpacity = Math.min(1, Math.max(0, deltaX / SWIPE_THRESHOLD));
        const nopeOpacity = Math.min(1, Math.max(0, -deltaX / SWIPE_THRESHOLD));
        const superOpacity = Math.min(1, Math.max(0, deltaY / SUPER_SWIPE_THRESHOLD));
        setActionOpacities({ like: likeOpacity, nope: nopeOpacity, super: superOpacity });
    };

    const handleDragEnd = () => {
        if (!isDragging) return;

        setIsDragging(false);
        setActionOpacities({ like: 0, nope: 0, super: 0 });
        setTransition('transform 0.3s ease-out');
        
        // Check for swipe first
        if (position.x > SWIPE_THRESHOLD) {
            onSwipe('right');
        } else if (position.x < -SWIPE_THRESHOLD) {
            onSwipe('left');
        } else if (position.y < SUPER_SWIPE_THRESHOLD) {
            onSwipe('super');
        } else {
            // No swipe occurred. Check for click or snap back.
            const totalMovement = Math.sqrt(position.x ** 2 + position.y ** 2);
            const CLICK_THRESHOLD = 10;
            
            if (totalMovement < CLICK_THRESHOLD) {
                // It's a click, show details.
                setShowDetails(true);
            }
            
            // For both click and failed swipe, reset the card's position.
            setPosition({ x: 0, y: 0 });
            setRotation(0);
        }
    };

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleDragMove);
            window.addEventListener('touchmove', handleDragMove);
            window.addEventListener('mouseup', handleDragEnd);
            window.addEventListener('touchend', handleDragEnd);
        }
        return () => {
            window.removeEventListener('mousemove', handleDragMove);
            window.removeEventListener('touchmove', handleDragMove);
            window.removeEventListener('mouseup', handleDragEnd);
            window.removeEventListener('touchend', handleDragEnd);
        };
    }, [isDragging, startPos]);

    const cardStyle: React.CSSProperties = {
        transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg)`,
        transition: isDragging ? 'none' : 'transform 0.3s ease-out',
        touchAction: 'none',
    };

    return (
        <>
        <div 
            className={`absolute inset-0 p-4 ${isTopCard ? 'cursor-grab active:cursor-grabbing z-20' : ''}`}
            style={isTopCard ? cardStyle : {}}
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
        >
            <div className="relative w-full h-full bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
                <img src={profile.images[0]} alt={profile.name} className="w-full h-full object-cover" />
                
                {isTopCard && (
                    <>
                        <div style={{ opacity: actionOpacities.like }} className="absolute top-16 left-8 transform -rotate-12 transition-opacity duration-200 pointer-events-none">
                            <span className="text-4xl font-extrabold text-green-400 border-8 border-green-400 rounded-2xl px-6 py-2 tracking-wider">CURTIR</span>
                        </div>
                        <div style={{ opacity: actionOpacities.nope }} className="absolute top-16 right-8 transform rotate-12 transition-opacity duration-200 pointer-events-none">
                            <span className="text-4xl font-extrabold text-red-500 border-8 border-red-500 rounded-2xl px-6 py-2 tracking-wider">NÃO CURTIR</span>
                        </div>
                        <div style={{ opacity: actionOpacities.super }} className="absolute bottom-40 left-1/2 transform -translate-x-1/2 transition-opacity duration-200 pointer-events-none">
                            <span className="text-4xl font-extrabold text-blue-400 border-8 border-blue-400 rounded-2xl px-6 py-2 tracking-wider">AMEI!</span>
                        </div>
                    </>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20"></div>

                <div 
                    className={`absolute inset-0 p-5 flex flex-col justify-end text-white transition-opacity duration-300 ${showDetails || isDragging ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
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
                                    <img 
                                        key={index} 
                                        src={img} 
                                        alt={`${profile.name} ${index+1}`} 
                                        className="w-40 h-52 object-cover rounded-lg flex-shrink-0 snap-center cursor-pointer"
                                        onClick={() => setSelectedImage(img)}
                                    />
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

                        <div className="grid grid-cols-2 gap-x-4 gap-y-6 mt-6 border-t border-gray-700 pt-6">
                            <div>
                                <h2 className="text-pink-400 font-bold">Objetivo</h2>
                                <p className="mt-1 text-gray-200">{profile.relationshipGoal}</p>
                            </div>
                            <div>
                                <h2 className="text-pink-400 font-bold">Interesse em</h2>
                                <p className="mt-1 text-gray-200">{profile.interesseEm}</p>
                            </div>
                            <div>
                                <h2 className="text-pink-400 font-bold">Signo</h2>
                                <p className="mt-1 text-gray-200">{profile.signo}</p>
                            </div>
                            <div>
                                <h2 className="text-pink-400 font-bold">Religião</h2>
                                <p className="mt-1 text-gray-200">{profile.religiao}</p>
                            </div>
                            <div>
                                <h2 className="text-pink-400 font-bold">Altura</h2>
                                <p className="mt-1 text-gray-200">{profile.altura} cm</p>
                            </div>
                            <div>
                                <h2 className="text-pink-400 font-bold">Corpo</h2>
                                <p className="mt-1 text-gray-200">{profile.porteFisico}</p>
                            </div>
                            <div>
                                <h2 className="text-pink-400 font-bold">Bebidas</h2>
                                <p className="mt-1 text-gray-200">{profile.consumoAlcool}</p>
                            </div>
                            <div>
                                <h2 className="text-pink-400 font-bold">Fumo</h2>
                                <p className="mt-1 text-gray-200">{profile.fumante}</p>
                            </div>
                            <div>
                                <h2 className="text-pink-400 font-bold">Pets</h2>
                                <p className="mt-1 text-gray-200">{profile.pets}</p>
                            </div>
                            <div>
                                <h2 className="text-pink-400 font-bold">Idiomas</h2>
                                <p className="mt-1 text-gray-200">{profile.idiomas.join(', ')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        {/* Photo Viewer Modal */}
        {selectedImage && (
            <div 
                className="fixed inset-x-0 top-0 bg-black/90 z-40 flex items-center justify-center p-4"
                style={{ bottom: '80px' }} // 80px is h-20 of BottomNav
                onClick={() => setSelectedImage(null)}
            >
                <button 
                    onClick={() => setSelectedImage(null)} 
                    className="absolute top-4 right-4 text-white z-50 bg-black/50 rounded-full p-1"
                    aria-label="Fechar imagem"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-8 h-8"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg>
                </button>
                <img 
                    src={selectedImage} 
                    alt="Visualização ampliada" 
                    className="max-w-full max-h-full object-contain rounded-lg"
                    onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image itself
                />
            </div>
        )}
        </>
    );
};
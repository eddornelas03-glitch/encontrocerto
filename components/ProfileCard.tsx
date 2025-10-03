import React, { useState, useEffect, useRef } from 'react';
import type { UserProfile } from '../types';

interface ProfileCardProps {
  profile: UserProfile;
  onSwipe: (direction: 'left' | 'right' | 'super') => void;
  isTopCard: boolean;
  triggerSwipe?: 'left' | 'right' | 'super' | 'reset' | null;
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

const HeartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
        <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9-22.345 22.345 0 01-2.846-2.434c-.26-.323-.51-.653-.747-.991l-.255-.373a.85.85 0 01-.042-.105A3.01 3.01 0 012 10c0-1.657 1.343-3 3-3a3.01 3.01 0 012.25 1.007A3.01 3.01 0 0112.25 8 3 3 0 0115 11c0 .599-.155 1.164-.43 1.66l-.255.373a.85.85 0 01-.042-.105c-.237.338-.487.668-.747.991a22.345 22.345 0 01-2.846 2.434 22.045 22.045 0 01-2.582 1.9 20.759 20.759 0 01-1.162.682l-.019.01-.005.003h-.002z" />
    </svg>
);

const KeyboardHint = () => (
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-white z-10">
    {/* Left Arrow */}
    <div className="absolute top-1/2 left-4 -translate-y-1/2 bg-black/50 p-3 rounded-full animate-pulse">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
    </div>
    {/* Right Arrow */}
    <div className="absolute top-1/2 right-4 -translate-y-1/2 bg-black/50 p-3 rounded-full animate-pulse">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
    </div>
    {/* Up Arrow */}
    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 p-3 rounded-full animate-pulse">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
    </div>
  </div>
);

export const ProfileCard: React.FC<ProfileCardProps> = ({ profile, onSwipe, isTopCard, triggerSwipe }) => {
    const [showDetails, setShowDetails] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isTouchDevice, setIsTouchDevice] = useState(false);

    const [isDragging, setIsDragging] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [rotation, setRotation] = useState(0);
    const [transition, setTransition] = useState('transform 0.3s ease-out');
    const [actionOpacities, setActionOpacities] = useState({ like: 0, nope: 0, super: 0 });
    
    // This ref helps distinguish a true "click" from a "drag" action.
    const hasMovedRef = useRef(false);

    useEffect(() => {
        setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    }, []);

    const SWIPE_THRESHOLD = 80;
    const SUPER_SWIPE_THRESHOLD = -100;

    const getPointerPosition = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
        return 'touches' in e ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : { x: e.clientX, y: e.clientY };
    };

    const handleDragStart = (e: React.TouchEvent) => {
        if (!isTopCard || showDetails) return;
        e.preventDefault();
        hasMovedRef.current = false; // Reset movement tracker
        setIsDragging(true);
        setStartPos(getPointerPosition(e));
        setTransition('none');
    };

    const handleDragMove = (e: MouseEvent | TouchEvent) => {
        if (!isDragging) return;
        hasMovedRef.current = true; // Mark that movement has occurred
        
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
        
        if (position.x > SWIPE_THRESHOLD) {
            setPosition({ x: window.innerWidth, y: position.y });
            setRotation(30);
            onSwipe('right');
        } else if (position.x < -SWIPE_THRESHOLD) {
            setPosition({ x: -window.innerWidth, y: position.y });
            setRotation(-30);
            onSwipe('left');
        } else if (position.y < SUPER_SWIPE_THRESHOLD) {
            setPosition({ x: position.x, y: -window.innerHeight });
            onSwipe('super');
        } else {
            // Snap back if not a swipe
            setPosition({ x: 0, y: 0 });
            setRotation(0);
        }
    };
    
    // This handler now exclusively manages opening the details view.
    const handleClick = () => {
        // Only open details if the card wasn't dragged.
        if (!hasMovedRef.current) {
            setShowDetails(true);
        }
    };

    useEffect(() => {
        if (isDragging) {
            // Note: For touch devices, mouse events are simulated, but we only listen to touchmove.
            window.addEventListener('touchmove', handleDragMove);
            window.addEventListener('touchend', handleDragEnd);
        }
        return () => {
            window.removeEventListener('touchmove', handleDragMove);
            window.removeEventListener('touchend', handleDragEnd);
        };
    }, [isDragging, startPos]);

    useEffect(() => {
        if (!isTopCard || !triggerSwipe || isDragging) return;

        const animateOut = (direction: 'left' | 'right' | 'super') => {
            setTransition('transform 0.4s ease-out');
            if (direction === 'right') {
                setPosition({ x: window.innerWidth, y: 50 });
                setRotation(30);
            } else if (direction === 'left') {
                setPosition({ x: -window.innerWidth, y: 50 });
                setRotation(-30);
            } else if (direction === 'super') {
                setPosition({ x: 0, y: -window.innerHeight });
                setRotation(0);
            }
            onSwipe(direction);
        };

        const animateReset = () => {
            setTransition('transform 0.4s ease-out');
            setPosition({ x: 0, y: 0 });
            setRotation(0);
        };

        if (triggerSwipe === 'reset') {
            animateReset();
        } else {
            animateOut(triggerSwipe);
        }
    }, [triggerSwipe, isTopCard, isDragging, onSwipe]);

    const cardStyle: React.CSSProperties = {
        transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg)`,
        transition: isDragging ? 'none' : 'transform 0.4s ease-out',
        touchAction: 'none',
    };

    return (
        <>
        <div 
            className={`absolute inset-0 p-4 ${isTopCard ? 'cursor-pointer z-20' : ''}`}
            style={isTopCard ? cardStyle : {}}
            onTouchStart={handleDragStart}
            onClick={handleClick} // Use the dedicated click handler
        >
            <div className="relative w-full h-full bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
                <img src={profile.images[0]} alt={profile.name} className="w-full h-full object-cover" />

                {!isTouchDevice && isTopCard && !showDetails && <KeyboardHint />}
                
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
                    className={`absolute inset-0 p-5 flex flex-col justify-end text-white transition-opacity duration-300 ${isDragging ? 'opacity-0' : 'opacity-100'}`}
                >
                    <div>
                        <h1 className="text-3xl font-bold">{profile.apelido}, <span className="font-light">{profile.age}</span></h1>
                        <p className="text-gray-300 text-lg">{profile.tagline}</p>
                        <div className="mt-2 flex items-center flex-wrap gap-2">
                            <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-300 text-sm font-semibold py-1 px-3 rounded-full">
                                <SparklesIcon />
                                {profile.compatibility}% Compatível
                            </div>
                            {profile.showLikes && (
                                <div className="inline-flex items-center gap-2 bg-pink-500/20 text-pink-300 text-sm font-semibold py-1 px-3 rounded-full">
                                    <HeartIcon />
                                    {profile.numLikes}
                                </div>
                            )}
                        </div>
                    </div>
                    <p className="mt-4 self-start flex items-center gap-2 text-white font-semibold text-sm">
                        <InfoIcon />
                        {isTouchDevice ? 'Toque para ver mais' : 'Clique para ver mais'}
                    </p>
                </div>
            </div>
        </div>
        
        {/* Details View */}
        {showDetails && isTopCard && (
            <div className="absolute inset-0 z-40 bg-gray-900/90 backdrop-blur-sm text-white overflow-y-auto">
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
        )}
        
        {/* Photo Viewer Modal */}
        {selectedImage && (
            <div 
                className="fixed inset-x-0 top-0 bg-black/90 z-50 flex items-center justify-center p-4"
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
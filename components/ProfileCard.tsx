import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import type { UserProfile, UserPreferences } from '../types';
import { DefaultAvatar } from './DefaultAvatar';

interface ProfileCardProps {
  profile: UserProfile;
  onSwipe: (direction: 'left' | 'right' | 'super') => void;
  isTopCard: boolean;
  triggerSwipe?: 'left' | 'right' | 'super' | 'reset' | null;
  currentUserPreferences: UserPreferences;
}

const InfoIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className="w-5 h-5"
  >
    <path
      fillRule="evenodd"
      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A.75.75 0 0010.747 15l.293-.157a.75.75 0 00.53-1.027l-.459-2.066a.25.25 0 01.244-.304H11a.75.75 0 000-1.5H9z"
      clipRule="evenodd"
    />
  </svg>
);

const SparklesIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className="w-5 h-5"
  >
    <path
      fillRule="evenodd"
      d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.39-3.423 3.11a.75.75 0 00.44 1.337l6.458.992-2.903 6.04a.75.75 0 001.242.828l4.318-5.398 4.318 5.398a.75.75 0 001.242-.828l-2.903-6.04 6.458.992a.75.75 0 00.44-1.337l-3.423-3.11-4.753-.39-1.83-4.401z"
      clipRule="evenodd"
    />
  </svg>
);

const HeartIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className="w-5 h-5"
  >
    <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9-22.345 22.345 0 01-2.846-2.434c-.26-.323-.51-.653-.747-.991l-.255-.373a.85.85 0 01-.042-.105A3.01 3.01 0 012 10c0-1.657 1.343-3 3-3a3.01 3.01 0 012.25 1.007A3.01 3.01 0 0112.25 8 3 3 0 0115 11c0 .599-.155 1.164-.43 1.66l-.255.373a.85.85 0 01-.042-.105c-.237.338-.487.668-.747.991a22.345 22.345 0 01-2.846 2.434 22.045 22.045 0 01-2.582 1.9 20.759 20.759 0 01-1.162.682l-.019.01-.005.003h-.002z" />
  </svg>
);

type HintDirection = 'left' | 'right' | 'super';

const KeyboardHint: React.FC<{
  onHintClick: (direction: HintDirection) => void;
}> = ({ onHintClick }) => (
  <div className="hidden lg:flex absolute inset-0 items-center justify-center pointer-events-none text-white z-10">
    {/* Left Arrow */}
    <div
      onClick={(e) => {
        e.stopPropagation();
        onHintClick('left');
      }}
      className="absolute top-1/2 left-4 -translate-y-1/2 bg-black/50 p-3 rounded-full animate-pulse cursor-pointer pointer-events-auto"
      title="Não Curtir (←)"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 19l-7-7m0 0l7-7m-7 7h18"
        />
      </svg>
    </div>
    {/* Right Arrow */}
    <div
      onClick={(e) => {
        e.stopPropagation();
        onHintClick('right');
      }}
      className="absolute top-1/2 right-4 -translate-y-1/2 bg-black/50 p-3 rounded-full animate-pulse cursor-pointer pointer-events-auto"
      title="Curtir (→)"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M14 5l7 7m0 0l-7 7m7-7H3"
        />
      </svg>
    </div>
    {/* Up Arrow */}
    <div
      onClick={(e) => {
        e.stopPropagation();
        onHintClick('super');
      }}
      className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 p-3 rounded-full animate-pulse cursor-pointer pointer-events-auto"
      title="Amei! (↑)"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 10l7-7m0 0l7 7m-7-7v18"
        />
      </svg>
    </div>
  </div>
);

const CheckmarkIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className="w-5 h-5 text-green-400"
  >
    <path
      fillRule="evenodd"
      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.052-.143z"
      clipRule="evenodd"
    />
  </svg>
);

const DetailItem: React.FC<{
  label: string;
  value: React.ReactNode;
  isMatch: boolean;
}> = ({ label, value, isMatch }) => (
  <div>
    <h2 className="text-red-400 font-bold flex items-center gap-1">
      {label}
      {isMatch && <CheckmarkIcon />}
    </h2>
    <p className="mt-1 text-gray-200">{value}</p>
  </div>
);

const ProfileCardComponent: React.FC<ProfileCardProps> = ({
  profile,
  onSwipe,
  isTopCard,
  triggerSwipe,
  currentUserPreferences,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const positionRef = useRef({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [actionOpacities, setActionOpacities] = useState({
    like: 0,
    nope: 0,
    super: 0,
  });
  const hasMovedRef = useRef(false);

  const SWIPE_THRESHOLD = 80;
  const SUPER_SWIPE_THRESHOLD = -100;

  const getPointerPosition = (
    e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent,
  ) => {
    return 'touches' in e
      ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
      : { x: e.clientX, y: e.clientY };
  };

  const handlePointerDown = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isTopCard || showDetails) return;
    if ('touches' in e) {
      e.preventDefault();
    }
    hasMovedRef.current = false;
    setIsDragging(true);
    setStartPos(getPointerPosition(e));
  };

  const handlePointerMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      hasMovedRef.current = true;

      const currentPos = getPointerPosition(e);
      const deltaX = currentPos.x - startPos.x;
      const deltaY = currentPos.y - startPos.y;

      positionRef.current = { x: deltaX, y: deltaY };
      setPosition({ x: deltaX, y: deltaY });
      setRotation(deltaX / 20);

      const likeOpacity = Math.min(1, Math.max(0, deltaX / SWIPE_THRESHOLD));
      const nopeOpacity = Math.min(1, Math.max(0, -deltaX / SWIPE_THRESHOLD));
      const superOpacity = Math.min(1, Math.max(0, deltaY / SUPER_SWIPE_THRESHOLD));
      setActionOpacities({
        like: likeOpacity,
        nope: nopeOpacity,
        super: superOpacity,
      });
    },
    [isDragging, startPos.x, startPos.y],
  );

  const handlePointerUp = useCallback(() => {
    if (!isDragging) return;

    setIsDragging(false);
    setActionOpacities({ like: 0, nope: 0, super: 0 });

    const finalPosition = positionRef.current;

    if (finalPosition.x > SWIPE_THRESHOLD) {
      setPosition({ x: window.innerWidth, y: finalPosition.y });
      setRotation(30);
      onSwipe('right');
    } else if (finalPosition.x < -SWIPE_THRESHOLD) {
      setPosition({ x: -window.innerWidth, y: finalPosition.y });
      setRotation(-30);
      onSwipe('left');
    } else if (finalPosition.y < SUPER_SWIPE_THRESHOLD) {
      setPosition({ x: finalPosition.x, y: -window.innerHeight });
      onSwipe('super');
    } else {
      setPosition({ x: 0, y: 0 });
      setRotation(0);
    }
    positionRef.current = { x: 0, y: 0 };
  }, [isDragging, onSwipe]);

  const handleClick = () => {
    if (!hasMovedRef.current) {
      setShowDetails(true);
    }
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handlePointerMove);
      window.addEventListener('mouseup', handlePointerUp);
      window.addEventListener('touchmove', handlePointerMove);
      window.addEventListener('touchend', handlePointerUp);
    }
    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [isDragging, handlePointerMove, handlePointerUp]);

  const handleManualSwipe = useCallback(
    (direction: 'left' | 'right' | 'super') => {
      if (isDragging) return;
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
    },
    [isDragging, onSwipe],
  );

  useEffect(() => {
    if (!isTopCard || !triggerSwipe || isDragging) return;

    const animateReset = () => {
      setPosition({ x: 0, y: 0 });
      setRotation(0);
    };

    if (triggerSwipe === 'reset') {
      animateReset();
    } else {
      handleManualSwipe(triggerSwipe);
    }
  }, [triggerSwipe, isTopCard, isDragging, handleManualSwipe]);

  const cardStyle: React.CSSProperties = {
    transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg)`,
    transition: isDragging ? 'none' : 'transform 0.4s ease-out',
    touchAction: 'none',
  };

  // Calculate matches for details view
  const prefs = currentUserPreferences;
  const objetivoMatch =
    !prefs.objetivoDesejado ||
    prefs.objetivoDesejado.length === 0 ||
    prefs.objetivoDesejado.includes('Indiferente') ||
    prefs.objetivoDesejado.includes(profile.relationshipGoal);
  const ageMatch =
    profile.age >= prefs.idadeMinima && profile.age <= prefs.idadeMaxima;
  const signoMatch =
    prefs.signoDesejado.includes('Indiferente') ||
    prefs.signoDesejado.includes(profile.signo);
  const religiaoMatch =
    prefs.religiaoDesejada.includes('Indiferente') ||
    prefs.religiaoDesejada.includes(profile.religiao);
  const alturaMatch =
    profile.altura >= prefs.alturaMinima && profile.altura <= prefs.alturaMaxima;
  const corpoMatch =
    prefs.porteFisicoDesejado.includes('Indiferente') ||
    (profile.porteFisico !== 'Prefiro não dizer' &&
      prefs.porteFisicoDesejado.includes(profile.porteFisico));
  const bebidasMatch =
    prefs.consumoAlcoolDesejado.includes('Indiferente') ||
    (profile.consumoAlcool !== 'Prefiro não dizer' &&
      prefs.consumoAlcoolDesejado.includes(profile.consumoAlcool));
  const fumoMatch =
    prefs.fumanteDesejado.includes('Indiferente') ||
    (profile.fumante !== 'Prefiro não dizer' &&
      prefs.fumanteDesejado.includes(profile.fumante));
  const petsMatch =
    prefs.petsDesejado === 'Indiferente' || profile.pets === prefs.petsDesejado;
  const pcdMatch =
    prefs.pcdDesejado === 'Indiferente' ||
    (profile.pcd !== 'Prefiro não dizer' && profile.pcd === prefs.pcdDesejado);

  return (
    <>
      <div
        className={`absolute inset-0 p-4 ${
          isTopCard ? 'cursor-grab active:cursor-grabbing z-20' : ''
        }`}
        style={isTopCard ? cardStyle : {}}
        onMouseDown={handlePointerDown}
        onTouchStart={handlePointerDown}
        onClick={handleClick}
      >
        <div className="relative w-full h-full bg-gray-700 rounded-2xl shadow-xl overflow-hidden">
          {profile.images.length > 0 ? (
            <img
              src={profile.images[0]}
              alt={profile.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <DefaultAvatar />
          )}

          {isTopCard && !showDetails && (
            <KeyboardHint onHintClick={handleManualSwipe} />
          )}

          {isTopCard && (
            <>
              <div
                style={{ opacity: actionOpacities.like }}
                className="absolute top-16 left-8 transform -rotate-12 transition-opacity duration-200 pointer-events-none"
              >
                <span className="text-3xl sm:text-4xl font-extrabold text-green-400 border-8 border-green-400 rounded-2xl px-6 py-2 tracking-wider">
                  CURTIR
                </span>
              </div>
              <div
                style={{ opacity: actionOpacities.nope }}
                className="absolute top-16 right-8 transform rotate-12 transition-opacity duration-200 pointer-events-none"
              >
                <span className="text-3xl sm:text-4xl font-extrabold text-red-500 border-8 border-red-500 rounded-2xl px-6 py-2 tracking-wider">
                  NÃO CURTIR
                </span>
              </div>
              <div
                style={{ opacity: actionOpacities.super }}
                className="absolute bottom-40 left-1/2 transform -translate-x-1/2 transition-opacity duration-200 pointer-events-none"
              >
                <span className="text-3xl sm:text-4xl font-extrabold text-blue-400 border-8 border-blue-400 rounded-2xl px-6 py-2 tracking-wider">
                  AMEI!
                </span>
              </div>
            </>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20"></div>

          <div
            className={`absolute inset-0 p-5 flex flex-col justify-end text-white transition-opacity duration-300 ${
              isDragging ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <div>
              <h1 className="text-3xl font-bold">
                {profile.apelido}, <span className="font-light">{profile.age}</span>
              </h1>
              <p className="text-gray-300 text-lg">{profile.tagline}</p>
              <div className="mt-2 flex items-center flex-wrap gap-2">
                <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-300 text-sm font-semibold py-1 px-3 rounded-full">
                  <SparklesIcon />
                  {profile.compatibility}% Compatível
                </div>
                {profile.showLikes && (
                  <div className="inline-flex items-center gap-2 bg-red-500/20 text-red-300 text-sm font-semibold py-1 px-3 rounded-full">
                    <HeartIcon />
                    {profile.numLikes}
                  </div>
                )}
              </div>
            </div>
            <p className="mt-4 self-start flex items-center gap-2 text-white font-semibold text-sm">
              <InfoIcon />
              <span className="lg:hidden">Toque para ver mais</span>
              <span className="hidden lg:inline">Clique para ver mais</span>
            </p>
          </div>
        </div>
      </div>

      {/* Details View */}
      {showDetails && isTopCard && (
        <div className="absolute inset-0 z-40 bg-gray-900/90 backdrop-blur-sm text-white flex flex-col">
          <header className="p-5 pb-4 shrink-0 relative bg-gray-900/50 shadow-md">
            <h1 className="text-3xl font-bold">
              {profile.apelido}, <span className="font-light">{profile.age}</span>
            </h1>
            <p className="text-gray-300">
              {profile.city}, {profile.state}
            </p>
            <button
              onClick={() => setShowDetails(false)}
              className="absolute top-4 right-4 text-white z-10 bg-black/20 rounded-full p-1"
              aria-label="Fechar detalhes do perfil"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-8 h-8"
              >
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          </header>

          <div className="overflow-y-auto flex-1">
            <div className="p-5 pt-4 space-y-6">
              <div>
                <div className="flex overflow-x-auto space-x-2 pb-2 -mx-5 px-5 snap-x snap-mandatory">
                  {profile.images.length > 0 ? (
                    profile.images.map((img, index) => (
                      <img
                        key={index}
                        src={img}
                        alt={`${profile.name} ${index + 1}`}
                        className="w-40 h-52 object-cover rounded-lg flex-shrink-0 snap-center cursor-pointer"
                        onClick={() => setSelectedImage(img)}
                        loading="lazy"
                      />
                    ))
                  ) : (
                    <div className="w-40 h-52 rounded-lg flex-shrink-0 snap-center">
                      <DefaultAvatar className="rounded-lg" />
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-700 pt-4">
                <h2 className="text-red-400 font-bold">Bio</h2>
                <p className="mt-1 text-gray-200">{profile.bio}</p>
              </div>
              <div>
                <h2 className="text-red-400 font-bold">Interesses</h2>
                <div className="mt-2 flex flex-wrap gap-2">
                  {profile.interests.map((interest) => (
                    <span
                      key={interest}
                      className="bg-gray-600 text-gray-200 text-sm font-medium px-3 py-1 rounded-full"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-6 border-t border-gray-700 pt-6">
                <DetailItem
                  label="Objetivo"
                  value={profile.relationshipGoal}
                  isMatch={objetivoMatch}
                />
                <DetailItem
                  label="Idade"
                  value={`${profile.age} anos`}
                  isMatch={ageMatch}
                />
                <div>
                  <h2 className="text-red-400 font-bold">Interesse em</h2>
                  <p className="mt-1 text-gray-200">{profile.interesseEm}</p>
                </div>
                <DetailItem label="Signo" value={profile.signo} isMatch={signoMatch} />
                <DetailItem
                  label="Religião"
                  value={profile.religiao}
                  isMatch={religiaoMatch}
                />
                <DetailItem
                  label="Altura"
                  value={`${profile.altura} cm`}
                  isMatch={alturaMatch}
                />
                <DetailItem
                  label="Corpo"
                  value={profile.porteFisico}
                  isMatch={corpoMatch}
                />
                <DetailItem
                  label="Bebidas"
                  value={profile.consumoAlcool}
                  isMatch={bebidasMatch}
                />
                <DetailItem label="Fumo" value={profile.fumante} isMatch={fumoMatch} />
                <DetailItem label="Pets" value={profile.pets} isMatch={petsMatch} />
                <DetailItem
                  label="PCD"
                  value={
                    profile.pcd === 'Sim'
                      ? `Sim (${profile.pcdTipo || 'Não especificado'})`
                      : profile.pcd
                  }
                  isMatch={pcdMatch}
                />
                <div>
                  <h2 className="text-red-400 font-bold">Idiomas</h2>
                  <p className="mt-1 text-gray-200">{profile.idiomas.join(', ')}</p>
                </div>
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-8 h-8"
            >
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
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

export const ProfileCard = memo(ProfileCardComponent);
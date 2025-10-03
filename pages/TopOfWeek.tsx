import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseService';
import type { UserProfile } from '../types';

export const TopOfWeek: React.FC = () => {
    const [topProfiles, setTopProfiles] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTopProfiles = async () => {
            setLoading(true);
            const { data } = await supabase.getTopOfWeek();
            setTopProfiles(data || []);
            setLoading(false);
        };
        fetchTopProfiles();
    }, []);

    return (
        <div className="h-full w-full bg-white flex flex-col">
            <div className="p-4 border-b shrink-0 bg-gradient-to-r from-pink-500 to-yellow-400 text-white">
                <h1 className="text-2xl font-bold text-center">Top da Semana</h1>
                <p className="text-center text-sm opacity-90">Os perfis mais compatíveis para você!</p>
            </div>
            
            {loading ? (
                <div className="flex-grow flex justify-center items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
                </div>
            ) : (
                <div className="overflow-y-auto flex-grow p-4 space-y-4">
                    {topProfiles.map((profile, index) => (
                        <div key={profile.id} className="flex items-center p-3 bg-white border rounded-lg shadow-sm">
                            <div className="text-2xl font-bold text-yellow-500 w-10 text-center">#{index + 1}</div>
                            <img src={profile.images[0]} alt={profile.name} className="w-16 h-16 rounded-full object-cover mx-4" />
                            <div className="flex-grow">
                                <h3 className="text-lg font-semibold text-gray-800">{profile.name}, {profile.age}</h3>
                                <p className="text-sm text-gray-500">{profile.city}</p>
                            </div>
                             <div className="text-right">
                                <p className="font-bold text-green-500 text-lg">{profile.compatibility}%</p>
                                <p className="text-xs text-gray-400">Compatível</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
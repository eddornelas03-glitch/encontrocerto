import React, { useState } from 'react';

interface LandingHeaderProps {
    onShowPolicy: (policyKey: string) => void;
}

const InfoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.061-1.061 3 3 0 112.871 5.026v.345a.75.75 0 01-1.5 0v-.5c0-.72.57-1.172 1.081-1.287A1.5 1.5 0 108.94 6.94zM10 15a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
    </svg>
);

const NavItem: React.FC<{ title: string, items: { key: string; label: string }[], onShowPolicy: (key: string) => void }> = ({ title, items, onShowPolicy }) => {
    return (
        <div className="group relative">
            <button className="text-white font-semibold hover:text-pink-300 transition-colors py-2">
                {title}
            </button>
            <div className="absolute top-full -left-4 w-56 bg-gray-800/90 backdrop-blur-md rounded-md shadow-lg opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 -translate-y-2">
                <div className="p-2">
                    {items.map(item => (
                        <a key={item.key} href="#" onClick={(e) => { e.preventDefault(); onShowPolicy(item.key); }} className="block px-3 py-2 text-white hover:bg-pink-500/20 rounded-md">
                            {item.label}
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
};

const MobileMenu: React.FC<{ onClose: () => void, onShowPolicy: (key: string) => void, items: any[] }> = ({ onClose, onShowPolicy, items }) => (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col p-4">
        <div className="flex justify-end mb-4">
            <button onClick={onClose} className="text-white p-2">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 flex-grow overflow-y-auto">
            {items.map(section => (
                <div key={section.title} className="mb-6">
                    <h2 className="text-xl font-bold text-pink-400 mb-2">{section.title}</h2>
                    <ul>
                        {section.items.map(item => (
                             <li key={item.key}>
                                <a href="#" onClick={(e) => { e.preventDefault(); onShowPolicy(item.key); }} className="block py-3 text-lg text-white hover:bg-gray-800 rounded-md px-2">
                                    {item.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
             <div className="mb-6">
                <h2 className="text-xl font-bold text-pink-400 mb-2">Suporte</h2>
                <ul>
                    <li>
                        <a href="https://wa.me/5531985245546" target="_blank" rel="noopener noreferrer" className="block py-3 text-lg text-white hover:bg-gray-800 rounded-md px-2">
                            Fale Conosco via WhatsApp
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    </div>
);


export const LandingHeader: React.FC<LandingHeaderProps> = ({ onShowPolicy }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const menuItems = [
        {
            title: 'Segurança',
            items: [
                { key: 'community-guidelines', label: 'Regras da Comunidade' },
                { key: 'safety-tips', label: 'Dicas de Segurança' },
                { key: 'safety-policy', label: 'Segurança e Política' },
                { key: 'security', label: 'Segurança e Denúncia' }
            ]
        }
    ];

    return (
        <header className="absolute top-0 left-0 right-0 z-20 p-4">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#EC4899"/>
                        <path d="M10.0001 13.3L7.7001 11L6.3001 12.4L10.0001 16.1L18.0001 8.10001L16.6001 6.70001L10.0001 13.3Z" fill="white"/>
                    </svg>
                    <span className="text-xl font-bold text-white">Encontro Certo</span>
                </div>

                {/* Desktop Menu */}
                <nav className="hidden md:flex items-center gap-6">
                    {menuItems.map(section => (
                        section.items.length > 0 && <NavItem key={section.title} title={section.title} items={section.items} onShowPolicy={onShowPolicy} />
                    ))}
                    <a href="https://wa.me/5531985245546" target="_blank" rel="noopener noreferrer" className="text-white font-semibold hover:text-pink-300 transition-colors py-2">
                        Suporte
                    </a>
                </nav>

                {/* Mobile Menu Button */}
                <div className="md:hidden">
                    <button onClick={() => setIsMobileMenuOpen(true)} className="text-white bg-black/20 p-2 rounded-full backdrop-blur-sm">
                        <InfoIcon />
                    </button>
                </div>

                {isMobileMenuOpen && (
                    <MobileMenu onClose={() => setIsMobileMenuOpen(false)} onShowPolicy={(key) => { onShowPolicy(key); setIsMobileMenuOpen(false); }} items={menuItems} />
                )}
            </div>
        </header>
    );
};
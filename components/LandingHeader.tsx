import React, { useState } from 'react';

interface LandingHeaderProps {
    onShowPolicy: (policyKey: string) => void;
}

const QuestionMarkIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
    </svg>
);


const NavItem: React.FC<{ title: string, items: { key: string; label: string; href?: string }[], onShowPolicy: (key: string) => void }> = ({ title, items, onShowPolicy }) => {
    return (
        <div className="group relative">
            <button className="text-white font-semibold hover:text-red-300 transition-colors py-2">
                {title}
            </button>
            <div className="absolute top-full -left-4 w-56 bg-gray-700/90 backdrop-blur-md rounded-md shadow-lg opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 -translate-y-2">
                <div className="p-2">
                    {items.map(item => (
                        <a 
                            key={item.key} 
                            href={item.href || '#'} 
                            onClick={(e) => { 
                                if (!item.href) {
                                    e.preventDefault(); 
                                    onShowPolicy(item.key); 
                                }
                            }} 
                            className="block px-3 py-2 text-white hover:bg-red-500/20 rounded-md"
                        >
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
        <div className="bg-gray-900 rounded-lg p-4 flex-grow">
            {items.map(section => (
                <div key={section.title} className="mb-6">
                    <h2 className="text-xl font-bold text-red-400 mb-2">{section.title}</h2>
                    <ul>
                        {section.items.map(item => (
                             <li key={item.key}>
                                <a 
                                    href={item.href || '#'} 
                                    onClick={(e) => { 
                                        if (!item.href) {
                                            e.preventDefault();
                                            onShowPolicy(item.key); 
                                        }
                                        // No need to call onClose here as the parent component handles it.
                                    }} 
                                    className="block py-3 text-lg text-white hover:bg-gray-700 rounded-md px-2"
                                >
                                    {item.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
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
        },
        {
            title: 'Legal',
            items: [
                { key: 'privacy-policy', label: 'Política de Privacidade' }
            ]
        },
        {
            title: 'Contato',
            items: [
                { key: 'contact-email', label: 'contato@encontrocerto.com', href: 'mailto:contato@encontrocerto.com' }
            ]
        }
    ];

    return (
        <header className="absolute top-0 left-0 right-0 z-20 p-4">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#EF4444"/>
                        <path d="M8.5 12C9.87827 9.83333 10.5674 8.75 12 7C13.4326 8.75 14.1217 9.83333 15.5 12" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="12" cy="9" r="1.5" fill="white"/>
                    </svg>
                    <span className="text-xl font-bold text-white">Encontro Certo</span>
                </div>

                {/* Desktop Menu */}
                <nav className="hidden md:flex items-center gap-6">
                    {menuItems.map(section => (
                        section.items.length > 0 && <NavItem key={section.title} title={section.title} items={section.items} onShowPolicy={onShowPolicy} />
                    ))}
                </nav>

                {/* Mobile Menu Button */}
                <div className="md:hidden">
                    <button onClick={() => setIsMobileMenuOpen(true)} className="text-white bg-black/20 p-2 rounded-full backdrop-blur-sm animate-pulse-glow" aria-label="Abrir menu de informações">
                        <QuestionMarkIcon />
                    </button>
                </div>

                {isMobileMenuOpen && (
                    <MobileMenu onClose={() => setIsMobileMenuOpen(false)} onShowPolicy={(key) => { onShowPolicy(key); setIsMobileMenuOpen(false); }} items={menuItems} />
                )}
            </div>
        </header>
    );
};

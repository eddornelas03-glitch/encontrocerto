import React, { useState, useLayoutEffect, useCallback } from 'react';

const tourSteps = [
  {
    selector: null,
    title: 'Bem-vindo(a) ao Encontro Certo!',
    content:
      'Vamos fazer um tour rápido para você descobrir como encontrar seu par perfeito. Este guia vai te mostrar as principais funcionalidades.',
    position: 'center' as const,
  },
  {
    selector: '[data-tour-id="explore-card-stack"]',
    title: '1. O Coração do App: Explorar',
    content:
      'Aqui você descobre novos perfis. Deslize para a **direita** para curtir, para a **esquerda** para passar. Se *realmente* gostar, deslize para **cima** para um "Amei!" e se destacar!',
    position: 'bottom' as const,
  },
  {
    selector: '[data-tour-id="explore-card-stack"]',
    title: '1.1. Conheça os Detalhes',
    content:
      'Toque em um perfil para ver mais fotos e a bio completa. Fique de olho no **Índice de Compatibilidade** (✨)! Nossa IA o calcula com base nas **preferências que você define em "Meu Perfil"**, analisando o potencial de vocês darem certo.',
    position: 'bottom' as const,
  },
  {
    selector: '[data-tour-id="explore-filters-btn"]',
    title: '1.2. Busque o Par Perfeito',
    content:
      'Use os filtros para encontrar exatamente o que procura! Você também pode ser encontrado por nome se ativar a opção "Aparecer em buscas públicas" no seu perfil, uma de nossas ferramentas de privacidade.',
    position: 'bottom' as const,
  },
  {
    selector: '[data-tour-id="matches-nav"]',
    title: '2. Seus Matches',
    content:
      'Deu match? Ótimo! Todos os seus pares ficam aqui. É o lugar perfeito para iniciar uma conversa e ver a análise de compatibilidade que nossa IA preparou para vocês.',
    position: 'top' as const,
  },
  {
    selector: '[data-tour-id="my-profile-nav"]',
    title: '3. Seu Perfil, Suas Regras',
    content:
      'Este é o seu espaço. Edite suas informações, gerencie sua privacidade (como mostrar ou ocultar as curtidas ❤️) e, o mais importante, **defina as características do seu par perfeito**. Suas escolhas aqui são usadas pela nossa IA para calcular o **Índice de Compatibilidade** (✨) que você vê na tela Explorar.',
    position: 'top' as const,
  },
  {
    selector: null,
    title: 'Tudo Pronto!',
    content:
      'Agora você é um(a) expert no Encontro Certo. Explore, conecte-se e divirta-se. O seu par perfeito pode estar a um deslize de distância. Boa sorte!',
    position: 'center' as const,
  },
];

interface TourBox {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface AppTourProps {
  onClose: () => void;
}

export const AppTour: React.FC<AppTourProps> = ({ onClose }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [highlightBox, setHighlightBox] = useState<TourBox | null>(null);

  const currentStep = tourSteps[stepIndex];

  const updateHighlight = useCallback(() => {
    if (!currentStep.selector) {
      setHighlightBox(null);
      return;
    }
    const element = document.querySelector(currentStep.selector);
    if (element) {
      const rect = element.getBoundingClientRect();
      const padding = currentStep.selector.includes('nav') ? 8 : 4;
      setHighlightBox({
        top: rect.top - padding,
        left: rect.left - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
      });
    }
  }, [currentStep]);

  useLayoutEffect(() => {
    updateHighlight();
    window.addEventListener('resize', updateHighlight);
    return () => {
      window.removeEventListener('resize', updateHighlight);
    };
  }, [stepIndex, updateHighlight]);

  const handleNext = () => {
    if (stepIndex < tourSteps.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1);
    }
  };

  const highlightStyle: React.CSSProperties = highlightBox
    ? {
        position: 'absolute',
        top: `${highlightBox.top}px`,
        left: `${highlightBox.left}px`,
        width: `${highlightBox.width}px`,
        height: `${highlightBox.height}px`,
        boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)',
        border: '2px solid #EC4899', // pink-500
        borderRadius: '0.75rem',
        transition: 'all 0.3s ease-in-out',
        pointerEvents: 'none',
      }
    : {};

  const getTextBoxStyle = (): React.CSSProperties => {
    const PADDING = 16; // 1rem

    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      left: `${PADDING}px`,
      right: `${PADDING}px`,
      margin: '0 auto', // Center the element horizontally
    };

    if (currentStep.position === 'center' || !highlightBox) {
      return {
        ...baseStyle,
        top: '50%',
        transform: 'translateY(-50%)',
      };
    }

    if (currentStep.position === 'top') {
      return {
        ...baseStyle,
        bottom: `${window.innerHeight - highlightBox.top + PADDING}px`,
      };
    }

    if (currentStep.position === 'bottom') {
      const isCardStack =
        currentStep.selector === '[data-tour-id="explore-card-stack"]';

      if (isCardStack) {
        const bottomNavHeight = 80; // Corresponds to h-20 in BottomNav.tsx
        return {
          ...baseStyle,
          bottom: `${bottomNavHeight + PADDING}px`,
        };
      }

      return {
        ...baseStyle,
        top: `${highlightBox.top + highlightBox.height + PADDING}px`,
      };
    }

    return {}; // Fallback
  };

  const createMarkup = (htmlString: string) => {
    return { __html: htmlString.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') };
  };

  return (
    <div
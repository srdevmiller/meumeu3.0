import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

type TutorialStep = {
  id: string;
  title: string;
  content: string;
  element?: string; // CSS selector for target element
  placement?: 'top' | 'right' | 'bottom' | 'left';
};

type TutorialContextType = {
  isActive: boolean;
  currentStep: number;
  steps: TutorialStep[];
  startTutorial: () => void;
  endTutorial: () => void;
  nextStep: () => void;
  previousStep: () => void;
  skipTutorial: () => void;
};

const defaultSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Bem-vindo ao seu Cardápio Digital!',
    content: 'Vamos te mostrar como aproveitar ao máximo nossa plataforma.',
    placement: 'bottom'
  },
  {
    id: 'add-product',
    title: 'Adicione seus produtos',
    content: 'Clique aqui para começar a adicionar seus produtos ao cardápio.',
    element: '[data-tutorial="add-product"]',
    placement: 'right'
  },
  {
    id: 'categories',
    title: 'Organize em categorias',
    content: 'Organize seus produtos em categorias para facilitar a navegação.',
    element: '[data-tutorial="categories"]',
    placement: 'bottom'
  },
  {
    id: 'customize',
    title: 'Personalize seu cardápio',
    content: 'Altere cores, logo e estilo do seu cardápio.',
    element: '[data-tutorial="customize"]',
    placement: 'left'
  },
  {
    id: 'share',
    title: 'Compartilhe seu cardápio',
    content: 'Gere um QR Code ou link para compartilhar seu cardápio.',
    element: '[data-tutorial="share"]',
    placement: 'bottom'
  }
];

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

export function TutorialProvider({ children }: { children: ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps] = useState(defaultSteps);

  // Load tutorial state from localStorage
  useEffect(() => {
    const tutorialCompleted = localStorage.getItem('tutorialCompleted');
    if (!tutorialCompleted) {
      setIsActive(true);
    }
  }, []);

  const startTutorial = () => {
    setIsActive(true);
    setCurrentStep(0);
  };

  const endTutorial = () => {
    setIsActive(false);
    setCurrentStep(0);
    localStorage.setItem('tutorialCompleted', 'true');
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      endTutorial();
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const skipTutorial = () => {
    endTutorial();
  };

  return (
    <TutorialContext.Provider
      value={{
        isActive,
        currentStep,
        steps,
        startTutorial,
        endTutorial,
        nextStep,
        previousStep,
        skipTutorial,
      }}
    >
      {children}
    </TutorialContext.Provider>
  );
}

export function useTutorial() {
  const context = useContext(TutorialContext);
  if (context === undefined) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
}

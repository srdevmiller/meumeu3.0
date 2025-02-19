import { useEffect, useRef } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTutorial } from "./TutorialContext";
import { AnimatePresence, motion } from "framer-motion";

export function TutorialTooltip() {
  const {
    isActive,
    currentStep,
    steps,
    nextStep,
    previousStep,
    skipTutorial
  } = useTutorial();

  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive) return;

    const currentStepData = steps[currentStep];
    if (!currentStepData.element) return;

    const targetElement = document.querySelector(currentStepData.element);
    if (!targetElement || !tooltipRef.current) return;

    const targetRect = targetElement.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();

    let top = 0;
    let left = 0;

    switch (currentStepData.placement) {
      case 'top':
        top = targetRect.top - tooltipRect.height - 10;
        left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
        break;
      case 'right':
        top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
        left = targetRect.right + 10;
        break;
      case 'bottom':
        top = targetRect.bottom + 10;
        left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
        left = targetRect.left - tooltipRect.width - 10;
        break;
    }

    tooltipRef.current.style.top = `${top}px`;
    tooltipRef.current.style.left = `${left}px`;
  }, [isActive, currentStep, steps]);

  if (!isActive) return null;

  const currentStepData = steps[currentStep];

  return (
    <AnimatePresence>
      <motion.div
        ref={tooltipRef}
        className="fixed z-50"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <Card className="w-[320px] shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">{currentStepData.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {currentStepData.content}
            </p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={previousStep}
                >
                  Anterior
                </Button>
              )}
              <Button
                size="sm"
                onClick={nextStep}
              >
                {currentStep === steps.length - 1 ? 'Concluir' : 'Próximo'}
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={skipTutorial}
            >
              Pular
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}

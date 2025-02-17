import { useEffect, useRef } from 'react';
import { useAuth } from './use-auth';
import { useToast } from './use-toast';

const TIMEOUT_DURATION = 30 * 60 * 1000; // 30 minutos em milissegundos
const WARNING_THRESHOLD = 5 * 60 * 1000; // Aviso 5 minutos antes

export function useSessionTimeout() {
  const { logout, user } = useAuth();
  const { toast } = useToast();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const warningRef = useRef<NodeJS.Timeout>();

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningRef.current) {
      clearTimeout(warningRef.current);
    }

    // Configura o aviso para 5 minutos antes do timeout
    warningRef.current = setTimeout(() => {
      toast({
        title: "Aviso de Sessão",
        description: "Sua sessão irá expirar em 5 minutos. Faça alguma ação para continuar.",
        variant: "warning",
        duration: 10000, // 10 segundos
      });
    }, TIMEOUT_DURATION - WARNING_THRESHOLD);

    // Configura o timeout principal
    timeoutRef.current = setTimeout(() => {
      toast({
        title: "Sessão Expirada",
        description: "Sua sessão expirou por inatividade.",
        variant: "destructive",
      });
      logout();
    }, TIMEOUT_DURATION);
  };

  useEffect(() => {
    if (!user) return;

    // Lista de eventos para monitorar atividade do usuário
    const events = [
      'mousedown',
      'keydown',
      'scroll',
      'mousemove',
      'click',
      'touchstart'
    ];

    const handleActivity = () => {
      resetTimeout();
    };

    // Adiciona os listeners de eventos
    events.forEach(event => {
      document.addEventListener(event, handleActivity);
    });

    // Inicia o timeout
    resetTimeout();

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningRef.current) {
        clearTimeout(warningRef.current);
      }
    };
  }, [user, logout]);
}

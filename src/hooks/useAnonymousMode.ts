
import { useState, useEffect } from 'react';

export const useAnonymousMode = (chatId?: string) => {
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);

  // Initialize from localStorage if available, otherwise default to false
  useEffect(() => {
    if (chatId) {
      const storedValue = localStorage.getItem(`anonymous_mode_${chatId}`);
      setIsAnonymous(storedValue === 'true');
    } else {
      setIsAnonymous(false);
    }
  }, [chatId]);

  const toggleAnonymousMode = () => {
    const newValue = !isAnonymous;
    setIsAnonymous(newValue);
    
    if (chatId) {
      localStorage.setItem(`anonymous_mode_${chatId}`, String(newValue));
    }
  };

  // Reset anonymous mode when starting a new chat
  const resetAnonymousMode = () => {
    setIsAnonymous(false);
    if (chatId) {
      localStorage.removeItem(`anonymous_mode_${chatId}`);
    }
  };

  return {
    isAnonymous,
    toggleAnonymousMode,
    resetAnonymousMode
  };
};

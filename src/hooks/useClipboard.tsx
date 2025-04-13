import { useState, useCallback } from 'react';

interface UseClipboardOptions {
  successDuration?: number;
}

interface UseClipboardReturn {
  copied: boolean;
  copy: (text: string) => Promise<boolean>;
}

export function useClipboard(
  options: UseClipboardOptions = {}
): UseClipboardReturn {
  const { successDuration = 2000 } = options;
  const [copied, setCopied] = useState(false);

  const copy = useCallback(
    async (text: string) => {
      if (!navigator.clipboard) {
        console.warn('Clipboard not supported');
        return false;
      }

      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        
        setTimeout(() => {
          setCopied(false);
        }, successDuration);
        
        return true;
      } catch (error) {
        console.warn('Copy failed', error);
        setCopied(false);
        return false;
      }
    },
    [successDuration]
  );

  return { copied, copy };
}
import { useClipboard } from './useClipboard';

export function useCopyToClipboard(): [
  (text: string) => Promise<boolean>, 
  boolean
] {
  const { copied, copy } = useClipboard();
  
  return [copy, copied];
}
import { useState, useCallback, useRef } from 'react';

export function useToast() {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string, error = false) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setMessage(msg);
    setIsError(error);
    setVisible(true);
    timerRef.current = setTimeout(() => setVisible(false), 2500);
  }, []);

  return { visible, message, isError, showToast };
}

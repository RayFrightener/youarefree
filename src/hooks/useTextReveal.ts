import { useState, useEffect, useMemo, useRef } from "react";

interface UseTextRevealOptions {
  text: string;
  charsPerSecond?: number; // Characters per second (smooth pace)
  onComplete?: () => void;
}

export function useTextReveal({
  text,
  charsPerSecond = 15, // Adjust: 10-20 for different speeds (higher = faster)
  onComplete,
}: UseTextRevealOptions) {
  const [visibleChars, setVisibleChars] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Store onComplete in a ref so it doesn't trigger re-renders
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Calculate delay per character
  const charDelay = useMemo(() => {
    return 1000 / charsPerSecond; // milliseconds per character
  }, [charsPerSecond]);

  useEffect(() => {
    if (!text || text.length === 0) {
      setIsComplete(true);
      setVisibleChars(0);
      return;
    }

    // Reset state
    setVisibleChars(0);
    setIsComplete(false);

    let currentIndex = 0;

    const revealNextChar = () => {
      if (currentIndex >= text.length) {
        setIsComplete(true);
        if (onCompleteRef.current) {
          setTimeout(() => {
            onCompleteRef.current?.();
          }, 300);
        }
        return;
      }

      currentIndex += 1;
      setVisibleChars(currentIndex);

      // Continue revealing at steady pace
      timeoutRef.current = setTimeout(revealNextChar, charDelay);
    };

    // Start revealing
    timeoutRef.current = setTimeout(revealNextChar, charDelay);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [text, charDelay]);

  const skip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setVisibleChars(text.length);
    setIsComplete(true);
    if (onCompleteRef.current) {
      setTimeout(() => {
        onCompleteRef.current?.();
      }, 300);
    }
  };

  return {
    text,
    visibleChars,
    isComplete,
    skip,
    reset: () => {
      setVisibleChars(0);
      setIsComplete(false);
    },
  };
}

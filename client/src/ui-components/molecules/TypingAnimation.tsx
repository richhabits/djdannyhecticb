/**
 * TypingAnimation Component
 * Simulates typing effect character by character
 */

import { useState, useEffect } from 'react';

interface TypingAnimationProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
  className?: string;
  cursor?: boolean;
}

export function TypingAnimation({
  text,
  speed = 50,
  onComplete,
  className = '',
  cursor = true,
}: TypingAnimationProps) {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!text) {
      setDisplayText('');
      setIsComplete(false);
      return;
    }

    let index = 0;
    setIsComplete(false);

    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayText(text.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
        setIsComplete(true);
        onComplete?.();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, onComplete]);

  return (
    <span className={className}>
      {displayText}
      {cursor && !isComplete && <span className="animate-pulse ml-1">|</span>}
    </span>
  );
}

/**
 * Multi-line Typing Animation
 */
interface MultiLineTypingProps {
  lines: string[];
  speed?: number;
  lineDelay?: number;
  onComplete?: () => void;
  className?: string;
}

export function MultiLineTyping({
  lines,
  speed = 50,
  lineDelay = 500,
  onComplete,
  className = '',
}: MultiLineTypingProps) {
  const [displayLines, setDisplayLines] = useState<string[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    if (currentLineIndex >= lines.length) {
      onComplete?.();
      return;
    }

    const currentLine = lines[currentLineIndex];

    if (charIndex < currentLine.length) {
      const timeout = setTimeout(() => {
        setDisplayLines((prev) => {
          const updated = [...prev];
          updated[currentLineIndex] = currentLine.slice(0, charIndex + 1);
          return updated;
        });
        setCharIndex(charIndex + 1);
      }, speed);

      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => {
        setCurrentLineIndex(currentLineIndex + 1);
        setCharIndex(0);
      }, lineDelay);

      return () => clearTimeout(timeout);
    }
  }, [lines, speed, lineDelay, currentLineIndex, charIndex, onComplete]);

  return (
    <div className={className}>
      {displayLines.map((line, index) => (
        <div key={index}>{line}</div>
      ))}
      {currentLineIndex < lines.length && (
        <div>
          {lines[currentLineIndex].slice(0, charIndex)}
          <span className="animate-pulse">|</span>
        </div>
      )}
    </div>
  );
}

/**
 * Word-by-word Typing Animation
 */
interface WordTypingProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
  className?: string;
}

export function WordTyping({
  text,
  speed = 100,
  onComplete,
  className = '',
}: WordTypingProps) {
  const [displayText, setDisplayText] = useState('');
  const words = text.split(' ');

  useEffect(() => {
    let wordIndex = 0;

    const interval = setInterval(() => {
      if (wordIndex < words.length) {
        setDisplayText(words.slice(0, wordIndex + 1).join(' '));
        wordIndex++;
      } else {
        clearInterval(interval);
        onComplete?.();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, words, onComplete]);

  return <span className={className}>{displayText}</span>;
}

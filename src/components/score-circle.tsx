'use client';

import { useEffect, useState } from 'react';

interface ScoreCircleProps {
  score: number;
}

export function ScoreCircle({ score }: ScoreCircleProps) {
  const [displayScore, setDisplayScore] = useState(0);

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayScore / 100) * circumference;

  useEffect(() => {
    let animationFrameId: number;
    const animateScore = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const newDisplayScore = Math.min(score, Math.floor((progress / 1000) * score));
      setDisplayScore(newDisplayScore);
      if (newDisplayScore < score) {
        animationFrameId = requestAnimationFrame(animateScore);
      }
    };
    let startTime: number;
    requestAnimationFrame(animateScore);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [score]);


  return (
    <div
      className="relative flex items-center justify-center w-32 h-32"
      role="progressbar"
      aria-valuenow={displayScore}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <svg className="absolute w-full h-full" viewBox="0 0 100 100">
        <circle
          className="stroke-muted"
          strokeWidth="10"
          cx="50"
          cy="50"
          r={radius}
          fill="transparent"
        />
        <circle
          className="stroke-accent"
          strokeWidth="10"
          strokeLinecap="round"
          cx="50"
          cy="50"
          r={radius}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 50 50)"
          style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
        />
      </svg>
      <span className="text-3xl font-bold text-foreground" suppressHydrationWarning>{displayScore}</span>
    </div>
  );
}

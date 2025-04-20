
import React, { useState, useEffect } from 'react';
import { Crown, Star, Sparkles, Trophy, X } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface LevelUpProps {
  level: number;
  onComplete?: () => void;
}

const LevelUp: React.FC<LevelUpProps> = ({ level, onComplete }) => {
  const [visible, setVisible] = useState(true);
  const [phase, setPhase] = useState(0);
  
  useEffect(() => {
    // Animation phases
    const phaseTimer1 = setTimeout(() => setPhase(1), 400);
    const phaseTimer2 = setTimeout(() => setPhase(2), 1200);
    
    const timer = setTimeout(() => {
      setPhase(3);
      setTimeout(() => {
        setVisible(false);
        if (onComplete) onComplete();
      }, 800);
    }, 4000);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(phaseTimer1);
      clearTimeout(phaseTimer2);
    };
  }, [onComplete]);

  // Get level color based on level
  const getLevelColor = () => {
    if (level >= 30) return "from-epic-purple to-epic-blue";
    if (level >= 20) return "from-epic-blue to-epic-green";
    if (level >= 10) return "from-epic-yellow to-epic-green";
    return "from-epic-yellow to-amber-400";
  };
  
  const getStars = () => {
    const stars = [];
    for (let i = 0; i < 20; i++) {
      // Random position and animation delay
      const style = {
        position: 'absolute',
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 0.5}s`,
        opacity: 0,
        transform: 'scale(0)',
        animation: `${phase >= 1 ? 'starBurst 2s forwards' : 'none'}`,
        '--tx': `${(Math.random() * 200) - 100}px`,
        '--ty': `${(Math.random() * 200) - 100}px`,
      } as React.CSSProperties;
      
      stars.push(
        <div key={i} style={style} className="absolute">
          <Star className="fill-epic-yellow w-4 h-4 text-epic-yellow" />
        </div>
      );
    }
    return stars;
  };

  if (!visible) return null;
  
  return (
    <div className="z-50 fixed inset-0 flex justify-center items-center bg-black/70 backdrop-blur-lg">
      <Button
        className="top-5 right-5 z-[100] absolute text-white text-2xl hover:scale-110 transition-transform duration-200 cursor-pointer"
        onClick={() => setVisible(false)}
      >
        <X />
      </Button>

      <style>
        {`
          @keyframes starBurst {
            0% { opacity: 0; transform: scale(0) rotate(0deg); }
            20% { opacity: 1; transform: scale(1) rotate(20deg); }
            60% { opacity: 1; transform: scale(1) rotate(20deg) translate(0, 0); }
            100% { opacity: 0; transform: scale(0.5) rotate(45deg) translate(var(--tx), var(--ty)); }
          }
          
          @keyframes rotate-shine {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes pulse-scale {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
          
          .animate-rotate-shine {
            animation: rotate-shine 10s linear infinite;
          }
          
          .animate-pulse-scale {
            animation: pulse-scale 1.5s ease-in-out infinite;
          }
        `}
      </style>

      <div className="relative">
        {getStars()}
        <div
          className={`absolute -inset-20 bg-gradient-to-r ${getLevelColor()} opacity-20 blur-xl rounded-full ${
            phase >= 1 ? "animate-rotate-shine" : ""
          }`}
        ></div>
        <div
          className={`relative bg-background rounded-xl p-8 shadow-xl border-2 border-epic-yellow ${
            phase === 0
              ? "scale-0"
              : phase === 3
              ? "scale-150 opacity-0"
              : "scale-100"
          } transition-all duration-700`}
        >
          <div className="flex justify-center mb-2">
            <Crown
              className={`h-12 w-12 text-epic-yellow ${
                phase >= 2 ? "animate-bounce" : ""
              }`}
            />
          </div>
          <h2 className="flex justify-center items-center mb-2 font-bold text-3xl text-center">
            <Sparkles className="mr-2 w-5 h-5 text-epic-purple" />
            Level Up!
            <Sparkles className="ml-2 w-5 h-5 text-epic-purple" />
          </h2>
          <div className="flex justify-center mb-4">
            <span
              className={`text-7xl font-black bg-clip-text text-transparent bg-gradient-to-r ${getLevelColor()} ${
                phase >= 2 ? "animate-pulse-scale" : ""
              }`}
            >
              {level}
            </span>
          </div>
          <div className="flex justify-center mb-2">
            <Trophy
              className={`h-8 w-8 text-epic-purple ${
                phase >= 2 ? "animate-pulse" : ""
              }`}
            />
          </div>
          <p className="text-muted-foreground text-center">
            Congratulations! You've reached a new level!
          </p>
          <p className="mt-2 text-epic-yellow text-sm text-center">
            New powers and abilities unlocked!
          </p>
        </div>
      </div>
    </div>
  );
};

export default LevelUp;

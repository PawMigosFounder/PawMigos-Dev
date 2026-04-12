'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

export function SplashScreen() {
  const [phase, setPhase] = useState<'enter' | 'exit' | 'done'>('enter');

  useEffect(() => {
    // 0.25s delay + 0.75s enter animation + 0.5s hold = 1.5s before exit starts
    const exitTimer = setTimeout(() => {
      setPhase('exit');
    }, 1500);

    // 1.5s + 0.4s exit fade = 1.9s total splash duration
    const doneTimer = setTimeout(() => {
      setPhase('done');
    }, 1900);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  if (phase === 'done') return null;

  return (
    <>
      <style suppressHydrationWarning>{`
        @keyframes morph-blob {
          0% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; transform: translate(0, 0) rotate(0deg); }
          50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; transform: translate(-10px, 15px) rotate(5deg); }
          100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; transform: translate(0, 0) rotate(0deg); }
        }
        @keyframes morph-blob-alt {
          0% { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; transform: translate(0, 0) rotate(0deg); }
          50% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; transform: translate(15px, -10px) rotate(-5deg); }
          100% { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; transform: translate(0, 0) rotate(0deg); }
        }
        @keyframes logo-pop {
          0% { transform: scale(0.55); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        
        .blob-1 { animation: morph-blob 8s ease-in-out infinite; }
        .blob-2 { animation: morph-blob-alt 9s ease-in-out infinite; animation-delay: -2s; }
        .blob-3 { animation: morph-blob 10s ease-in-out infinite; animation-delay: -4s; }
        .blob-4 { animation: morph-blob-alt 11s ease-in-out infinite; animation-delay: -6s; }
        
        .logo-enter {
          animation: logo-pop 0.75s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          animation-delay: 0.25s;
          opacity: 0;
        }
      `}</style>
      
      <div
        className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#F26F28] overflow-hidden transition-all duration-400 ease-in
        ${phase === 'exit' ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'}`}
        style={{ transitionDuration: '400ms' }}
      >
        {/* Organic Background Blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-white/10 blob-1 blur-2xl" />
        <div className="absolute top-[-5%] right-[-15%] w-[50vw] h-[50vw] bg-white/10 blob-2 blur-2xl flex items-center justify-center" />
        <div className="absolute bottom-[-15%] left-[-5%] w-[45vw] h-[45vw] bg-white/10 blob-3 blur-2xl flex items-center justify-center" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-white/10 blob-4 blur-2xl flex items-center justify-center" />
        
        {/* Logo Container */}
        <div className="relative z-10 logo-enter flex flex-col items-center">
          <Image 
            src="/images/app-icon.png" 
            alt="PawMigos Icon Pattern" 
            width={120} 
            height={120} 
            priority
            className="brightness-0 invert drop-shadow-md" 
          />
        </div>
      </div>
    </>
  );
}

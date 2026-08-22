"use client";

import React, { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import TaskModal from './TaskModal';
import type { LocationId } from './VillageScene';

const PhaserGame = dynamic(() => import('./PhaserGame'), { ssr: false });

export default function VillageGame() {
  const [activeLocation, setActiveLocation] = useState<LocationId | null>(null);
  const [badges, setBadges] = useState<string[]>([]);

  const handleTrigger = useCallback((locId: LocationId) => {
    setActiveLocation(locId);
  }, []);

  const handleCloseModal = useCallback(() => {
    setActiveLocation(null);
  }, []);

  const handleCompleteTask = useCallback((badgeName: string) => {
    setBadges(prev => {
        if (!prev.includes(badgeName)) {
            return [...prev, badgeName];
        }
        return prev;
    });
  }, []);

  return (
    <div className="flex-1 flex flex-col w-full h-full relative" style={{ fontFamily: 'var(--font-pixel), monospace' }}>

      {/* HUD for Badges - Cozy Light Theme */}
      <div className="absolute top-4 left-4 right-4 z-10 bg-[#e0d6c8] p-3 rounded-sm shadow-[4px_4px_0_0_rgba(0,0,0,1)] border-4 border-[#8c7a6b] flex gap-4 overflow-x-auto items-center min-h-[60px] max-w-[800px] mx-auto text-xl">
         <span className="font-bold text-[#4a3b32] whitespace-nowrap">★ BADGES:</span>
         {badges.length === 0 && <span className="text-[#8c7a6b] italic">NONE YET. EXPLORE!</span>}
         {badges.map(b => (
            <span key={b} className="px-3 py-1 bg-[#d4c5b0] text-[#4a3b32] border-2 border-[#8c7a6b] rounded-sm font-bold whitespace-nowrap">
                ★ {b.toUpperCase()}
            </span>
         ))}
      </div>

      <div className="flex-1 w-full relative">
        <PhaserGame
            onTrigger={handleTrigger}
            isTaskOpen={activeLocation !== null}
        />

        {activeLocation && (
            <TaskModal
                locationId={activeLocation}
                onClose={handleCloseModal}
                onComplete={handleCompleteTask}
            />
        )}
      </div>
    </div>
  );
}

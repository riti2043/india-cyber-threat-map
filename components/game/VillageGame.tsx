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
    <div className="w-full max-w-[800px] mx-auto flex flex-col gap-4">
      {/* HUD for Badges */}
      <div className="bg-slate-900 p-4 rounded border border-slate-700 flex gap-4 overflow-x-auto items-center min-h-[80px]">
         <span className="font-bold text-slate-400 whitespace-nowrap">My Badges:</span>
         {badges.length === 0 && <span className="text-slate-600 italic">None yet. Explore the village!</span>}
         {badges.map(b => (
            <span key={b} className="px-3 py-1 bg-yellow-600/20 text-yellow-400 border border-yellow-600 rounded-full text-sm font-bold whitespace-nowrap">
                {b}
            </span>
         ))}
      </div>

      <div className="border rounded-lg overflow-hidden bg-slate-900 text-white relative h-[600px] shadow-lg">
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

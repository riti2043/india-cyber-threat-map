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
      {/* HUD for Badges - Cozy Light Theme */}
      <div className="bg-white p-4 rounded-xl shadow-md border border-slate-200 flex gap-4 overflow-x-auto items-center min-h-[80px]">
         <span className="font-bold text-slate-700 whitespace-nowrap">🏆 My Badges:</span>
         {badges.length === 0 && <span className="text-slate-400 italic">None yet. Explore the village!</span>}
         {badges.map(b => (
            <span key={b} className="px-4 py-2 bg-gradient-to-r from-yellow-100 to-amber-100 text-amber-700 border border-amber-300 rounded-full text-sm font-bold whitespace-nowrap shadow-sm">
                🏅 {b}
            </span>
         ))}
      </div>

      <div className="border-4 border-slate-300 rounded-2xl overflow-hidden bg-sky-50 text-white relative h-[600px] shadow-xl">
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

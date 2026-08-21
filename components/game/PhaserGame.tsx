"use client";

import React, { useEffect, useRef } from 'react';
import type { Game } from 'phaser';
import type { LocationId } from './VillageScene';

export default function PhaserGame({
  onTrigger,
  isTaskOpen,
}: {
  onTrigger: (locId: LocationId) => void;
  isTaskOpen: boolean;
}) {
  const gameRef = useRef<Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;

    const initPhaser = async () => {
      const Phaser = await import('phaser');
      const { VillageScene } = await import('./VillageScene');

      if (!isMounted || !containerRef.current) return;

      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        parent: containerRef.current,
        width: 800,
        height: 600,
        backgroundColor: '#4ade80',
        scene: [VillageScene],
        physics: {
          default: 'arcade',
          arcade: {
            debug: false,
          },
        },
      };

      gameRef.current = new Phaser.Game(config);

      gameRef.current.events.on('ready', () => {
        const scene = gameRef.current?.scene.getScene('VillageScene') as any;
        if (scene) {
          scene.setCallbacks(onTrigger);
          scene.setTaskOpen(isTaskOpen);
        }
      });
    };

    initPhaser();

    return () => {
      isMounted = false;
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  // Sync task open state to pause movement
  useEffect(() => {
    if (gameRef.current) {
      const scene = gameRef.current.scene.getScene('VillageScene') as any;
      if (scene && scene.setTaskOpen) {
         scene.setTaskOpen(isTaskOpen);
      }
    }
  }, [isTaskOpen]);

  return <div ref={containerRef} className="w-full h-full flex items-center justify-center bg-black" />;
}

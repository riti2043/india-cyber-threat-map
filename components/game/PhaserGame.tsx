"use client";

import React, { useEffect, useRef } from 'react';
import type { Game } from 'phaser';

export default function PhaserGame({
  levelConfig,
  onInteract,
  onExit,
  doorUnlocked,
}: {
  levelConfig: any;
  onInteract: () => void;
  onExit: () => void;
  doorUnlocked: boolean;
}) {
  const gameRef = useRef<Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;

    // We dynamically import Phaser and the Scene to avoid SSR issues
    const initPhaser = async () => {
      const Phaser = await import('phaser');
      const { DungeonScene } = await import('./DungeonScene');

      if (!isMounted || !containerRef.current) return;

      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        parent: containerRef.current,
        width: 800,
        height: 600,
        backgroundColor: '#1a1a1a',
        scene: [DungeonScene],
        physics: {
          default: 'arcade',
          arcade: {
            debug: false,
          },
        },
      };

      gameRef.current = new Phaser.Game(config);

      // Pass config and callbacks to the scene when it's ready
      gameRef.current.events.on('ready', () => {
        const scene = gameRef.current?.scene.getScene('DungeonScene') as any;
        if (scene) {
          scene.setLevel(levelConfig, onInteract, onExit, doorUnlocked);
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
  }, []); // Run once on mount

  // Update scene when level config or door state changes
  useEffect(() => {
    if (gameRef.current) {
      const scene = gameRef.current.scene.getScene('DungeonScene') as any;
      if (scene && scene.setLevel) {
         // Pause the scene slightly to reset if the level changed
         scene.setLevel(levelConfig, onInteract, onExit, doorUnlocked);
      }
    }
  }, [levelConfig, doorUnlocked, onInteract, onExit]);

  return <div ref={containerRef} className="w-full h-full flex items-center justify-center bg-black" />;
}

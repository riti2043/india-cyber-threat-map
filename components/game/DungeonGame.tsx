"use client";

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { LEVELS } from './levels';
import MCQPuzzle from './MCQPuzzle';
import SpotTheObjectPuzzle from './SpotTheObjectPuzzle';
import MatchPuzzle from './MatchPuzzle';
import SequencePuzzle from './SequencePuzzle';

const PhaserGame = dynamic(() => import('./PhaserGame'), { ssr: false });

export default function DungeonGame() {
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [doorUnlocked, setDoorUnlocked] = useState(false);
  const [isPuzzleOpen, setIsPuzzleOpen] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  const currentLevel = LEVELS[currentLevelIndex];

  const handleInteract = () => {
    if (!doorUnlocked && !isPuzzleOpen && !gameWon) {
      setIsPuzzleOpen(true);
    }
  };

  const handleExit = () => {
    if (doorUnlocked) {
      if (currentLevelIndex < LEVELS.length - 1) {
        setCurrentLevelIndex(prev => prev + 1);
        setDoorUnlocked(false);
      } else {
        setGameWon(true);
      }
    }
  };

  const handlePuzzleSolved = () => {
    setIsPuzzleOpen(false);
    setDoorUnlocked(true);
  };

  const renderPuzzle = () => {
    if (!currentLevel) return null;

    switch (currentLevel.puzzleType) {
      case 'MCQPuzzle':
        return <MCQPuzzle data={currentLevel.puzzleData} onSolve={handlePuzzleSolved} />;
      case 'SpotTheObjectPuzzle':
        return <SpotTheObjectPuzzle data={currentLevel.puzzleData} onSolve={handlePuzzleSolved} />;
      case 'MatchPuzzle':
        return <MatchPuzzle data={currentLevel.puzzleData} onSolve={handlePuzzleSolved} />;
      case 'SequencePuzzle':
        return <SequencePuzzle data={currentLevel.puzzleData} onSolve={handlePuzzleSolved} />;
      default:
        return <div>Unknown Puzzle Type</div>;
    }
  };

  return (
    <div className="w-full max-w-[800px] mx-auto flex flex-col items-center border rounded-lg overflow-hidden bg-slate-900 text-white relative h-[600px]">
      {!gameWon && (
        <div className="absolute top-4 left-4 z-10 bg-slate-800/80 p-2 rounded pointer-events-none">
          <h2 className="text-xl font-bold">Escape the Breach</h2>
          <p>Level {currentLevel.id}: {currentLevel.title}</p>
        </div>
      )}

      {gameWon ? (
        <div className="absolute inset-0 bg-slate-900 z-30 flex flex-col items-center justify-center">
          <h2 className="text-5xl font-bold text-green-500 mb-6">Breach Contained!</h2>
          <p className="text-xl mb-8">You have successfully navigated all threats.</p>
          <button
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded font-bold text-lg"
            onClick={() => {
              setGameWon(false);
              setCurrentLevelIndex(0);
              setDoorUnlocked(false);
            }}
          >
            Play Again
          </button>
        </div>
      ) : (
        <PhaserGame
          levelConfig={currentLevel}
          onInteract={handleInteract}
          onExit={handleExit}
          doorUnlocked={doorUnlocked}
        />
      )}

      {isPuzzleOpen && !gameWon && (
        <div className="absolute inset-0 bg-black/90 z-20 flex items-center justify-center p-4">
          <div className="bg-slate-800 p-8 rounded-lg w-full max-w-2xl shadow-2xl overflow-y-auto max-h-full">
            <h3 className="text-2xl font-bold mb-6 border-b border-slate-700 pb-2">Resolve the Threat</h3>
            {renderPuzzle()}
          </div>
        </div>
      )}
    </div>
  );
}

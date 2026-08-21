"use client";

import React, { useState } from 'react';

interface MatchPuzzleProps {
  data: {
    leftSide: { id: string; text: string }[];
    rightSide: { id: string; text: string }[];
    correctPairs: Record<string, string>;
  };
  onSolve: () => void;
}

export default function MatchPuzzle({ data, onSolve }: MatchPuzzleProps) {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [error, setError] = useState(false);

  const handleLeftClick = (id: string) => {
    setSelectedLeft(id);
    setError(false);
  };

  const handleRightClick = (id: string) => {
    if (!selectedLeft) return;

    if (data.correctPairs[selectedLeft] === id) {
      const newMatches = { ...matches, [selectedLeft]: id };
      setMatches(newMatches);
      setSelectedLeft(null);
      setError(false);

      if (Object.keys(newMatches).length === data.leftSide.length) {
        onSolve();
      }
    } else {
      setError(true);
      setSelectedLeft(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h4 className="text-xl font-medium">Match the concepts to their descriptions</h4>

      <div className="flex justify-between gap-8">
        <div className="flex flex-col gap-2 flex-1">
          {data.leftSide.map((item) => {
            const isMatched = !!matches[item.id];
            const isSelected = selectedLeft === item.id;
            return (
              <button
                key={item.id}
                disabled={isMatched}
                className={`p-3 rounded text-left ${
                  isMatched ? 'bg-green-700 opacity-50' : isSelected ? 'bg-blue-600' : 'bg-slate-700 hover:bg-slate-600'
                }`}
                onClick={() => handleLeftClick(item.id)}
              >
                {item.text}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-2 flex-1">
          {data.rightSide.map((item) => {
            const isMatched = Object.values(matches).includes(item.id);
            return (
              <button
                key={item.id}
                disabled={isMatched}
                className={`p-3 rounded text-left ${
                  isMatched ? 'bg-green-700 opacity-50' : 'bg-slate-700 hover:bg-slate-600'
                }`}
                onClick={() => handleRightClick(item.id)}
              >
                {item.text}
              </button>
            );
          })}
        </div>
      </div>

      {error && <p className="text-red-500 font-bold text-center">Incorrect match, try again!</p>}
    </div>
  );
}

"use client";

import React, { useState, useEffect } from 'react';

interface SequencePuzzleProps {
  data: {
    items: { id: string; text: string }[];
    correctOrder: string[];
  };
  onSolve: () => void;
}

export default function SequencePuzzle({ data, onSolve }: SequencePuzzleProps) {
  const [currentSequence, setCurrentSequence] = useState<{ id: string; text: string }[]>([]);
  const [availableItems, setAvailableItems] = useState<{ id: string; text: string }[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Basic shuffle for initial state
    const shuffled = [...data.items].sort(() => Math.random() - 0.5);
    setAvailableItems(shuffled);
    setCurrentSequence([]);
  }, [data]);

  const handleSelect = (item: { id: string; text: string }) => {
    const nextIndex = currentSequence.length;
    if (data.correctOrder[nextIndex] === item.id) {
      const newSequence = [...currentSequence, item];
      setCurrentSequence(newSequence);
      setAvailableItems(availableItems.filter(i => i.id !== item.id));
      setError(false);

      if (newSequence.length === data.correctOrder.length) {
        onSolve();
      }
    } else {
      setError(true);
      // Reset
      const shuffled = [...data.items].sort(() => Math.random() - 0.5);
      setAvailableItems(shuffled);
      setCurrentSequence([]);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <h4 className="text-xl font-medium">Select the steps in the correct order</h4>

      <div className="flex flex-col gap-2 min-h-[100px] bg-slate-900 p-4 rounded border border-slate-700">
        <h5 className="text-sm text-slate-400 mb-2">Your Sequence:</h5>
        {currentSequence.map((item, idx) => (
          <div key={item.id} className="p-2 bg-green-800 rounded">
            {idx + 1}. {item.text}
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <h5 className="text-sm text-slate-400">Available Choices:</h5>
        {availableItems.map((item) => (
          <button
            key={item.id}
            className="p-3 bg-slate-700 hover:bg-slate-600 rounded text-left"
            onClick={() => handleSelect(item)}
          >
            {item.text}
          </button>
        ))}
      </div>

      {error && <p className="text-red-500 font-bold">Incorrect step! Sequence reset.</p>}
    </div>
  );
}

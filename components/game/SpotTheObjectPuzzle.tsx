"use client";

import React, { useState } from 'react';

interface SpotTheObjectPuzzleProps {
  data: {
    items: { id: number; type: string; text: string }[];
    correctTargetId: number;
  };
  onSolve: () => void;
}

export default function SpotTheObjectPuzzle({ data, onSolve }: SpotTheObjectPuzzleProps) {
  const [error, setError] = useState(false);

  const handleSelect = (id: number) => {
    if (id === data.correctTargetId) {
      setError(false);
      onSolve();
    } else {
      setError(true);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h4 className="text-xl font-medium">Find the malicious item</h4>
      <div className="grid grid-cols-2 gap-4">
        {data.items.map((item) => (
          <button
            key={item.id}
            className="p-4 bg-slate-700 hover:bg-slate-600 rounded text-center"
            onClick={() => handleSelect(item.id)}
          >
            {item.text}
          </button>
        ))}
      </div>
      {error && <p className="text-red-500 font-bold">Incorrect, try again!</p>}
    </div>
  );
}

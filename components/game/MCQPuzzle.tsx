"use client";

import React, { useState } from 'react';

interface MCQPuzzleProps {
  data: {
    question: string;
    options: string[];
    correctAnswerIndex: number;
  };
  onSolve: () => void;
}

export default function MCQPuzzle({ data, onSolve }: MCQPuzzleProps) {
  const [error, setError] = useState(false);

  const handleSelect = (index: number) => {
    if (index === data.correctAnswerIndex) {
      setError(false);
      onSolve();
    } else {
      setError(true);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h4 className="text-xl font-medium">{data.question}</h4>
      <div className="flex flex-col gap-2">
        {data.options.map((option, idx) => (
          <button
            key={idx}
            className="w-full text-left px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded"
            onClick={() => handleSelect(idx)}
          >
            {option}
          </button>
        ))}
      </div>
      {error && <p className="text-red-500 font-bold">Incorrect, try again!</p>}
    </div>
  );
}

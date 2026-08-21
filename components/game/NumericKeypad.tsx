"use client";

import React from 'react';

interface NumericKeypadProps {
  onInput: (digit: string) => void;
  onBackspace?: () => void;
  value: string; // The current value to show dots
}

export default function NumericKeypad({ onInput, onBackspace, value }: NumericKeypadProps) {
  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Visual feedback dots */}
      <div className="flex gap-2 h-8 items-center bg-slate-800 px-4 rounded">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className={`w-3 h-3 rounded-full ${idx < value.length ? 'bg-white' : 'bg-slate-500'}`} />
        ))}
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-2 w-full max-w-[200px]">
        {digits.map((digit) => (
          <button
            key={digit}
            onClick={() => onInput(digit)}
            className={`p-4 bg-slate-700 hover:bg-slate-600 rounded text-xl font-bold ${digit === '0' ? 'col-start-2' : ''}`}
          >
            {digit}
          </button>
        ))}
        {onBackspace && (
          <button
            onClick={onBackspace}
            className="p-4 bg-slate-700 hover:bg-slate-600 rounded text-xl font-bold col-start-3"
          >
            ⌫
          </button>
        )}
      </div>
    </div>
  );
}

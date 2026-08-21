"use client";

import React from 'react';

interface ButtonSelectProps {
  options: { id: string; label: string; price?: number }[];
  onSelect: (id: string, label: string) => void;
  grid?: boolean;
}

export default function ButtonSelect({ options, onSelect, grid = false }: ButtonSelectProps) {
  return (
    <div className={`${grid ? 'grid grid-cols-2 gap-3' : 'flex flex-col gap-3'} w-full`}>
      {options.map((opt) => (
        <button
          key={opt.id}
          onClick={() => onSelect(opt.id, opt.label)}
          className="p-4 bg-blue-700 hover:bg-blue-600 rounded font-medium text-left flex justify-between"
        >
          <span>{opt.label}</span>
          {opt.price && <span>₹{opt.price}</span>}
        </button>
      ))}
    </div>
  );
}

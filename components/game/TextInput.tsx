"use client";

import React, { useState } from 'react';

interface TextInputProps {
  placeholder: string;
  onConfirm: (val: string) => void;
}

export default function TextInput({ placeholder, onConfirm }: TextInputProps) {
  const [val, setVal] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (val.trim()) {
      onConfirm(val.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
      <input
        type="text"
        placeholder={placeholder}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        className="w-full p-3 rounded bg-slate-800 border border-slate-600 text-white focus:outline-none focus:border-blue-500"
        autoFocus
      />
      <button
        type="submit"
        disabled={!val.trim()}
        className="w-full p-3 bg-green-600 hover:bg-green-500 disabled:opacity-50 rounded font-bold"
      >
        Confirm
      </button>
    </form>
  );
}

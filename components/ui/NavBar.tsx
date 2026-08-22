import React from 'react';
import { Settings, User } from 'lucide-react';

export function NavBar() {
  return (
    <nav className="flex items-center px-6 py-4 bg-[#111116] border-b border-[#222] text-white">
      <div className="flex items-center space-x-2 mr-8">
        <span className="text-2xl font-bold tracking-wider text-cyan-400">AURA</span>
        <span className="text-2xl font-bold tracking-wider text-fuchsia-600">SUITE</span>
      </div>

      <div className="flex flex-1 items-center space-x-6 text-sm font-semibold text-gray-300">
        <a href="#" className="hover:text-white transition-colors">Dashboard</a>
        <a href="#" className="hover:text-white transition-colors">Document Reader</a>
        <a href="#" className="hover:text-white transition-colors">Voice Suite</a>
        <a href="#" className="hover:text-white transition-colors">Inclusion Map</a>
        <a href="#" className="hover:text-white transition-colors">Simulators & Sign</a>
        <a href="#" className="text-cyan-400 border-b-2 border-cyan-400 pb-1">Digital Gully</a>
      </div>

      <div className="flex items-center space-x-4">
        <button className="flex items-center space-x-2 text-sm font-semibold hover:text-white text-gray-300">
          <span>🤟 Sign Digits</span>
        </button>
        <button className="p-2 rounded-full border border-gray-600 hover:bg-gray-800 transition-colors">
          <Settings size={18} className="text-cyan-400" />
        </button>
        <button className="p-2 rounded-full border border-gray-600 hover:bg-gray-800 transition-colors">
          <User size={18} className="text-white" />
        </button>
      </div>
    </nav>
  );
}

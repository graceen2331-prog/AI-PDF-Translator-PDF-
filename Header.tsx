import React from 'react';
import { Languages } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 no-print">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-brand-600 text-white p-2 rounded-lg">
            <Languages className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">PDF Translate Pro</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-xs font-medium px-2 py-1 bg-brand-50 text-brand-700 rounded border border-brand-100">
            Gemini 3 Flash
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
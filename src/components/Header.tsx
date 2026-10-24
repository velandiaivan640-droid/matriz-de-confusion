import React from 'react';
import { FileDown, GraduationCap } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenExport: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange, onOpenExport }) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <GraduationCap className="w-5 h-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap">
            ConfusioLab Analytics
          </span>
        </div>

        {/* Zone 2: 5 Concise Single-line Nav Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-400">
          <button
            onClick={() => onTabChange('matrix2x2')}
            className={`whitespace-nowrap transition-colors hover:text-white ${
              activeTab === 'matrix2x2' ? 'text-indigo-400 font-semibold' : ''
            }`}
          >
            Matriz Binaria (2x2)
          </button>
          <button
            onClick={() => onTabChange('threshold')}
            className={`whitespace-nowrap transition-colors hover:text-white ${
              activeTab === 'threshold' ? 'text-indigo-400 font-semibold' : ''
            }`}
          >
            Simulador de Umbral & ROC
          </button>
          <button
            onClick={() => onTabChange('business')}
            className={`whitespace-nowrap transition-colors hover:text-white ${
              activeTab === 'business' ? 'text-indigo-400 font-semibold' : ''
            }`}
          >
            Matriz de Costo y Negocio
          </button>
          <button
            onClick={() => onTabChange('multiclass')}
            className={`whitespace-nowrap transition-colors hover:text-white ${
              activeTab === 'multiclass' ? 'text-indigo-400 font-semibold' : ''
            }`}
          >
            Matriz Multiclase
          </button>
          <button
            onClick={() => onTabChange('quiz')}
            className={`whitespace-nowrap transition-colors hover:text-white ${
              activeTab === 'quiz' ? 'text-indigo-400 font-semibold' : ''
            }`}
          >
            Desafíos de Maestría
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenExport}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-sm whitespace-nowrap shrink-0"
          >
            <FileDown className="w-4 h-4" />
            <span>Exportar Informe</span>
          </button>
        </div>
      </div>
    </header>
  );
};

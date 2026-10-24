import React from 'react';
import { SCENARIO_PRESETS } from '../constants';
import { ScenarioPreset } from '../types';

interface HeroSectionProps {
  selectedPreset: ScenarioPreset | null;
  onSelectPreset: (preset: ScenarioPreset) => void;
  onSetCustom: () => void;
  isCustom: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  selectedPreset,
  onSelectPreset,
  onSetCustom,
  isCustom,
}) => {
  return (
    <section className="relative overflow-hidden border-b border-slate-800 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Pedagogical Framing & Intent */}
          <div className="lg:col-span-7 space-y-5">
            <div className="flex items-center gap-2 text-xs text-indigo-400 font-medium">
              <span>Maestría en Analítica de Datos</span>
              <span aria-hidden="true">·</span>
              <span>Evaluación de Modelos de Clasificación</span>
              <span aria-hidden="true">·</span>
              <span>Scikit-Learn Standard Convention</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight" style={{ textWrap: 'balance' }}>
              De la intuición a la métrica: Dominio de la Matriz de Confusión
            </h1>

            <p className="text-base text-slate-300 leading-relaxed max-w-2xl">
              Plataforma interactiva diseñada para posgrados en analítica, estadística y ciencia de datos.
              Comprende a fondo el impacto de los Errores Tipo I y II, la asimetría de costos de negocio,
              la dinámica del umbral de corte probabilístico y la falacia de la exactitud en clases desbalanceadas.
            </p>

            {/* Scenario Quick Selector (Interactive Tab Buttons) */}
            <div className="pt-2">
              <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Selecciona un Caso Práctico de Estudio:
              </span>
              <div className="flex flex-wrap gap-2">
                {SCENARIO_PRESETS.map((preset) => {
                  const isActive = !isCustom && selectedPreset?.id === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => onSelectPreset(preset)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all text-left whitespace-nowrap ${
                        isActive
                          ? 'bg-indigo-600/30 text-indigo-200 border-indigo-500 shadow-sm'
                          : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      {preset.title}
                    </button>
                  );
                })}
                <button
                  onClick={onSetCustom}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all whitespace-nowrap ${
                    isCustom
                      ? 'bg-indigo-600/30 text-indigo-200 border-indigo-500 shadow-sm'
                      : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  Modo Libre Personalizado
                </button>
              </div>
            </div>

            {/* Active Scenario Context Banner */}
            {selectedPreset && !isCustom && (
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-1">
                <div className="flex items-center gap-2 text-slate-400">
                  <span className="font-semibold text-slate-200">{selectedPreset.domain}</span>
                  <span aria-hidden="true">·</span>
                  <span>Métrica Crítica: <strong className="text-indigo-300 uppercase">{selectedPreset.keyMetric}</strong></span>
                </div>
                <p className="text-slate-300">{selectedPreset.description}</p>
                <p className="text-slate-400 italic text-[11px]">{selectedPreset.contextNote}</p>
              </div>
            )}
          </div>

          {/* Right Column: Visual Academic Graphic */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900">
              <img
                src="/src/assets/images/hero_analytics_matrix_1792856495174.jpg"
                alt="Visualización del hiperplano de decisión y métricas de confusión"
                className="w-full h-auto object-cover transform hover:scale-[1.01] transition-transform duration-300"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  // Fallback container if image fails
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="p-3 bg-slate-900/90 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Espacio de Probabilidades ℝᴰ</span>
                <span>Convención Filas: Real / Columnas: Predicho</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

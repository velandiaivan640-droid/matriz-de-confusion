import React, { useState } from 'react';
import { Matrix2x2Data, CostParameters, ScenarioPreset } from '../types';
import { calculateFinancialImpact } from '../utils/analytics';
import { DollarSign, TrendingUp, AlertOctagon, CheckCircle2 } from 'lucide-react';

interface BusinessCostMatrixProps {
  data: Matrix2x2Data;
  activePreset: ScenarioPreset | null;
}

export const BusinessCostMatrix: React.FC<BusinessCostMatrixProps> = ({
  data,
  activePreset,
}) => {
  const [costs, setCosts] = useState<CostParameters>(() => {
    return activePreset?.defaultCosts || {
      benefitTp: 3500,
      costFp: 25,
      costFn: 4200,
      benefitTn: 2,
      currency: 'USD',
    };
  });

  const impact = calculateFinancialImpact(data, costs);

  const handleCostChange = (field: keyof CostParameters, value: number) => {
    setCosts((prev) => ({
      ...prev,
      [field]: Math.max(0, value),
    }));
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <span>Matriz de Costo-Beneficio y Retorno Financiero</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Perspectiva ejecutiva: traducción directa de cada cuadrante de la matriz de confusión a valor monetario e impacto en PyG.
          </p>
        </div>

        <div className="text-xs text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
          Moneda: <strong className="text-indigo-400">{costs.currency}</strong>
        </div>
      </div>

      {/* Grid: Context visual and Cost Parameter Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Financial Impact Summary KPI Cards */}
        <div className="lg:col-span-7 space-y-5">
          {/* Main Net Profit Card */}
          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Utilidad Neta Generada por el Modelo
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                impact.netProfit >= 0 ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800' : 'bg-rose-950/80 text-rose-400 border border-rose-800'
              }`}>
                {impact.netProfit >= 0 ? 'Retorno Positivo' : 'Déficit Operativo'}
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="font-mono text-3xl sm:text-4xl font-extrabold text-white tabular-nums tracking-tight">
                ${impact.netProfit.toLocaleString()} {costs.currency}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block">Beneficio Bruto (TP + TN):</span>
                <span className="font-mono text-emerald-400 font-bold tabular-nums">
                  +${impact.grossBenefit.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Costo Total de Errores (FP + FN):</span>
                <span className="font-mono text-rose-400 font-bold tabular-nums">
                  -${impact.totalCost.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Comparison with Naive Baseline Strategy */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              <span>Comparación vs Estrategia Ingenua (Baseline Benchmark)</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              En maestría se exige demostrar si el modelo analítico supera una regla trivial sin modelo (predecir siempre legítimo o siempre positivo):
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Estrategia "Predecir Todo Negativo":</span>
                <span className="font-mono text-slate-200 font-semibold tabular-nums">
                  ${impact.naiveNegativeProfit.toLocaleString()}
                </span>
                <p className="text-[10px] text-slate-500 mt-1">
                  (Ningún FP, pero se absorbe el 100% de los FN)
                </p>
              </div>

              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Valor Agregado Neto de la Analítica:</span>
                <span className={`font-mono text-base font-bold tabular-nums ${
                  impact.valueAddedOverNaive > 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {impact.valueAddedOverNaive > 0 ? '+' : ''}${impact.valueAddedOverNaive.toLocaleString()}
                </span>
                <p className="text-[10px] text-slate-500 mt-1">
                  (Ganancia extra sobre el mejor baseline trivial)
                </p>
              </div>
            </div>
          </div>

          {/* Formula Callout */}
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <span className="font-semibold text-slate-300 block">Ecuación de Utilidad de Posgrado:</span>
            <code className="text-indigo-300 font-mono block">
              Beneficio Neto = (TP × B_TP) + (TN × B_TN) - (FP × C_FP) - (FN × C_FN)
            </code>
          </div>
        </div>

        {/* Right: Cost Function Inputs & Impact Diagram */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Parámetros de Costo Unitario
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-emerald-400 flex items-center justify-between mb-1">
                  <span>Beneficio por TP (Acierto Crítico):</span>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-mono text-slate-500">$</span>
                  <input
                    type="number"
                    min="0"
                    value={costs.benefitTp}
                    onChange={(e) => handleCostChange('benefitTp', parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-7 pr-3 py-1.5 text-xs font-mono text-white tabular-nums focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-amber-400 flex items-center justify-between mb-1">
                  <span>Costo por FP (Falsa Alarma / Fricción):</span>
                  <AlertOctagon className="w-3.5 h-3.5" />
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-mono text-slate-500">$</span>
                  <input
                    type="number"
                    min="0"
                    value={costs.costFp}
                    onChange={(e) => handleCostChange('costFp', parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-7 pr-3 py-1.5 text-xs font-mono text-white tabular-nums focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-rose-400 flex items-center justify-between mb-1">
                  <span>Costo por FN (Pérdida por Omisión):</span>
                  <AlertOctagon className="w-3.5 h-3.5" />
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-mono text-slate-500">$</span>
                  <input
                    type="number"
                    min="0"
                    value={costs.costFn}
                    onChange={(e) => handleCostChange('costFn', parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-7 pr-3 py-1.5 text-xs font-mono text-white tabular-nums focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-cyan-400 flex items-center justify-between mb-1">
                  <span>Beneficio por TN (Trámite Normal):</span>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-mono text-slate-500">$</span>
                  <input
                    type="number"
                    min="0"
                    value={costs.benefitTn}
                    onChange={(e) => handleCostChange('benefitTn', parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-7 pr-3 py-1.5 text-xs font-mono text-white tabular-nums focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Visual Asset */}
          <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
            <img
              src="/src/assets/images/scenario_analytics_impact_1792856495374.jpg"
              alt="Convergencia analítica de riesgo financiero y decisiones de modelo"
              className="w-full h-auto object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="p-2.5 text-[10px] text-slate-400 flex items-center justify-between border-t border-slate-800">
              <span>Optimización Sensible al Costo (Cost-Sensitive Learning)</span>
              <span>C_FN / C_FP = {(costs.costFn / Math.max(1, costs.costFp)).toFixed(1)}x</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

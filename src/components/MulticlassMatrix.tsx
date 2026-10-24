import React, { useState } from 'react';
import { INITIAL_MULTICLASS_DATA } from '../constants';
import { calculateMulticlass } from '../utils/analytics';
import { Grid3X3, Layers, Info, RotateCcw } from 'lucide-react';

export const MulticlassMatrix: React.FC = () => {
  const [classes] = useState<string[]>(INITIAL_MULTICLASS_DATA.classes);
  const [matrix, setMatrix] = useState<number[][]>(INITIAL_MULTICLASS_DATA.matrix);
  const [activeClassIndex, setActiveClassIndex] = useState<number>(0);

  const evaluation = calculateMulticlass(classes, matrix);

  const handleCellChange = (r: number, c: number, value: number) => {
    const val = Math.max(0, isNaN(value) ? 0 : value);
    const newMat = matrix.map((row, ri) =>
      row.map((col, ci) => (ri === r && ci === c ? val : col))
    );
    setMatrix(newMat);
  };

  const handleReset = () => {
    setMatrix(INITIAL_MULTICLASS_DATA.matrix);
  };

  const currentClassMetric = evaluation.classMetrics[activeClassIndex];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Grid3X3 className="w-5 h-5 text-indigo-400" />
            <span>Matriz Multiclase (3×3) y Agregación One-vs-Rest (OvR)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Evaluación avanzada para problemas con $N \ge 3$ clases: análisis de la diagonal principal, errores cruzados y métricas Macro vs Weighted.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700 self-start md:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restablecer Matriz 3×3</span>
        </button>
      </div>

      {/* Main 3x3 Table Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: 3x3 Heatmap */}
        <div className="lg:col-span-7 space-y-4">
          <div className="text-center">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
              Predicción del Modelo
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr>
                  <th className="p-2 text-slate-400 text-center font-bold">Real \ Pred</th>
                  {classes.map((cls, idx) => (
                    <th key={idx} className="p-2 text-center text-slate-300 font-semibold bg-slate-950/70 border border-slate-800">
                      {cls}
                    </th>
                  ))}
                  <th className="p-2 text-center text-slate-400 font-bold bg-slate-950 border border-slate-800">
                    Soporte (Real)
                  </th>
                </tr>
              </thead>
              <tbody>
                {classes.map((actualCls, r) => {
                  const rowSum = matrix[r].reduce((a, b) => a + b, 0);
                  return (
                    <tr key={r}>
                      <td className="p-2 font-semibold text-slate-300 bg-slate-950/70 border border-slate-800 text-center whitespace-nowrap">
                        {actualCls}
                      </td>
                      {classes.map((_, c) => {
                        const isDiagonal = r === c;
                        const cellVal = matrix[r][c];
                        return (
                          <td
                            key={c}
                            className={`p-2 border text-center transition-colors ${
                              isDiagonal
                                ? 'bg-indigo-950/40 border-indigo-700/60 font-bold text-white'
                                : 'bg-slate-950/90 border-slate-800 text-slate-300'
                            }`}
                          >
                            <input
                              type="number"
                              min="0"
                              value={cellVal}
                              onChange={(e) => handleCellChange(r, c, parseInt(e.target.value) || 0)}
                              className="w-16 text-center bg-transparent font-mono text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded py-0.5 tabular-nums"
                            />
                            {isDiagonal && (
                              <span className="block text-[10px] text-indigo-400 font-mono">
                                Acierto
                              </span>
                            )}
                          </td>
                        );
                      })}
                      <td className="p-2 text-center font-mono font-bold text-indigo-300 bg-slate-950 border border-slate-800 tabular-nums">
                        {rowSum.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
            <span>Diagonal Principal: Aciertos correctos por clase</span>
            <span className="font-mono text-white font-bold">
              Exactitud Global: {(evaluation.overallAccuracy * 100).toFixed(2)}%
            </span>
          </div>

          {/* Selector for Class OvR Drilldown */}
          <div className="pt-2">
            <span className="text-xs font-semibold text-slate-400 block mb-2">
              Explorar Descomposición One-vs-Rest (OvR):
            </span>
            <div className="flex gap-2">
              {classes.map((cls, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveClassIndex(idx)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap ${
                    activeClassIndex === idx
                      ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  Clase: {cls}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: One-vs-Rest (OvR) Transformation & Aggregation Metrics */}
        <div className="lg:col-span-5 space-y-4">
          {/* Active Class OvR 2x2 Virtual Matrix */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>One-vs-Rest: {currentClassMetric.className}</span>
              </span>
              <span className="text-[11px] font-mono text-indigo-300">
                Soporte: {currentClassMetric.support}
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              En OvR, la clase objetivo se trata como Positiva (1) y todas las demás clases restantes se unifican como Negativa (0):
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded bg-emerald-950/40 border border-emerald-900/60">
                <span className="text-[10px] text-emerald-400 font-semibold block">TP (Acierto Clase):</span>
                <span className="font-mono text-base font-bold text-white tabular-nums">
                  {currentClassMetric.tp}
                </span>
              </div>
              <div className="p-2 rounded bg-amber-950/40 border border-amber-900/60">
                <span className="text-[10px] text-amber-400 font-semibold block">FP (Otras confundidas con esta):</span>
                <span className="font-mono text-base font-bold text-white tabular-nums">
                  {currentClassMetric.fp}
                </span>
              </div>
              <div className="p-2 rounded bg-rose-950/40 border border-rose-900/60">
                <span className="text-[10px] text-rose-400 font-semibold block">FN (Esta confundida con otras):</span>
                <span className="font-mono text-base font-bold text-white tabular-nums">
                  {currentClassMetric.fn}
                </span>
              </div>
              <div className="p-2 rounded bg-cyan-950/40 border border-cyan-900/60">
                <span className="text-[10px] text-cyan-400 font-semibold block">TN (Resto correctamente excluido):</span>
                <span className="font-mono text-base font-bold text-white tabular-nums">
                  {currentClassMetric.tn}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-center font-mono text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block font-sans">Precisión</span>
                <span className="font-bold text-white tabular-nums">{(currentClassMetric.precision * 100).toFixed(1)}%</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-sans">Recall</span>
                <span className="font-bold text-white tabular-nums">{(currentClassMetric.recall * 100).toFixed(1)}%</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-sans">F1-Score</span>
                <span className="font-bold text-indigo-300 tabular-nums">{(currentClassMetric.f1 * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* Macro vs Weighted Comparison */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
            <span className="text-xs font-bold text-white uppercase tracking-wider block">
              Métricas Globales de Posgrado
            </span>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-xs">
                <div>
                  <span className="font-semibold text-slate-200 block">Macro-Average F1</span>
                  <span className="text-[10px] text-slate-400">Promedio simple no ponderado entre clases</span>
                </div>
                <span className="font-mono text-base font-bold text-indigo-400 tabular-nums">
                  {(evaluation.macroF1 * 100).toFixed(2)}%
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-xs">
                <div>
                  <span className="font-semibold text-slate-200 block">Weighted-Average F1</span>
                  <span className="text-[10px] text-slate-400">Ponderado por el soporte de cada clase</span>
                </div>
                <span className="font-mono text-base font-bold text-emerald-400 tabular-nums">
                  {(evaluation.weightedF1 * 100).toFixed(2)}%
                </span>
              </div>
            </div>

            <div className="p-2.5 bg-slate-900/60 rounded border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
              <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <span>
                <strong>Regla de oro de maestría:</strong> Si Macro-F1 es mucho menor que Weighted-F1, el modelo está fallando en las clases con menos datos.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

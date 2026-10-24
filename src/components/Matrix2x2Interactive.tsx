import React, { useState } from 'react';
import { Matrix2x2Data, MetricCalculations } from '../types';
import { HelpCircle, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface Matrix2x2InteractiveProps {
  data: Matrix2x2Data;
  onChange: (newData: Matrix2x2Data) => void;
  metrics: MetricCalculations;
  onReset: () => void;
}

type CellType = 'tp' | 'fp' | 'fn' | 'tn';

export const Matrix2x2Interactive: React.FC<Matrix2x2InteractiveProps> = ({
  data,
  onChange,
  metrics,
  onReset,
}) => {
  const [selectedCell, setSelectedCell] = useState<CellType>('tp');

  const total = Math.max(1, metrics.total);
  const tpPct = ((data.tp / total) * 100).toFixed(1);
  const fpPct = ((data.fp / total) * 100).toFixed(1);
  const fnPct = ((data.fn / total) * 100).toFixed(1);
  const tnPct = ((data.tn / total) * 100).toFixed(1);

  const handleCellChange = (field: CellType, value: number) => {
    const safeVal = Math.max(0, Math.min(1000000, isNaN(value) ? 0 : value));
    onChange({
      ...data,
      [field]: safeVal,
    });
  };

  const cellDetails = {
    tp: {
      title: 'Verdadero Positivo (True Positive - TP)',
      kicker: 'Acierto Crítico / Hit',
      desc: 'Casos reales positivos que el modelo predijo correctamente como positivos.',
      formula: 'TP en el numerador de Recall y Precision',
      impact: 'En detección de fraude: fraudes detenidos a tiempo. En medicina: pacientes enfermos diagnosticados.',
      colorClass: 'emerald',
      status: 'Acierto',
    },
    fp: {
      title: 'Falso Positivo (False Positive - FP)',
      kicker: 'Error Tipo I (α) / Falsa Alarma',
      desc: 'Casos reales negativos que el modelo clasificó erróneamente como positivos.',
      formula: 'Penaliza directamente la Precisión: TP / (TP + FP)',
      impact: 'En transacciones: cliente legítimo bloqueado en caja. En spam: correo importante enviado a correo no deseado.',
      colorClass: 'amber',
      status: 'Error Tipo I',
    },
    fn: {
      title: 'Falso Negativo (False Negative - FN)',
      kicker: 'Error Tipo II (β) / Omisión o Miss',
      desc: 'Casos reales positivos que el modelo omitió clasificándolos erróneamente como negativos.',
      formula: 'Penaliza directamente el Recall: TP / (TP + FN)',
      impact: 'En oncología: paciente con tumor dado de alta sin quimioterapia (riesgo mortal). En fraude: pérdida monetaria directa.',
      colorClass: 'rose',
      status: 'Error Tipo II',
    },
    tn: {
      title: 'Verdadero Negativo (True Negative - TN)',
      kicker: 'Rechazo Correcto / Normalidad',
      desc: 'Casos reales negativos que el modelo predijo correctamente como negativos.',
      formula: 'Fundamental en Especificidad: TN / (TN + FP)',
      impact: 'Transacciones comerciales normales procesadas sin demoras; pacientes sanos sin procedimientos invasivos.',
      colorClass: 'cyan',
      status: 'Acierto',
    },
  };

  const activeInfo = cellDetails[selectedCell];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Anatomía de la Matriz 2×2 (Clasificación Binaria)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Convención estándar Scikit-Learn: Filas representan la clase real (Ground Truth) y Columnas representan la predicción.
          </p>
        </div>
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Restablecer Valores</span>
        </button>
      </div>

      {/* Main Grid: Interactive Matrix Heatmap + Marginal Totals */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Heatmap Section */}
        <div className="xl:col-span-7 space-y-3">
          {/* Column Header Label */}
          <div className="text-center">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
              Predicción del Modelo (Ŷ)
            </span>
          </div>

          <div className="grid grid-cols-12 gap-2">
            {/* Row Label (Actual) */}
            <div className="col-span-2 flex items-center justify-center">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest -rotate-90 whitespace-nowrap">
                Real ($Y$)
              </span>
            </div>

            {/* Matrix Core + Marginals */}
            <div className="col-span-10 grid grid-cols-3 gap-2">
              {/* Header column tags */}
              <div className="text-center text-xs font-semibold text-slate-300 py-1">
                Predicho Positivo (1)
              </div>
              <div className="text-center text-xs font-semibold text-slate-300 py-1">
                Predicho Negativo (0)
              </div>
              <div className="text-center text-xs font-bold text-slate-400 py-1 border-b border-slate-800">
                Marginal Real
              </div>

              {/* Row 1: Real Positive */}
              {/* Cell 1: TP */}
              <div
                onClick={() => setSelectedCell('tp')}
                className={`cursor-pointer rounded-xl p-3 border transition-all relative ${
                  selectedCell === 'tp'
                    ? 'border-emerald-400 bg-emerald-950/40 ring-2 ring-emerald-500/20'
                    : 'border-slate-800 bg-slate-900/90 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-emerald-400">TP (Acierto)</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="font-mono text-2xl font-bold text-white tabular-nums">
                  {data.tp.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
                  <span>{tpPct}% del total</span>
                  <span className="text-emerald-400/80 font-mono">Sensibilidad</span>
                </div>
              </div>

              {/* Cell 2: FN */}
              <div
                onClick={() => setSelectedCell('fn')}
                className={`cursor-pointer rounded-xl p-3 border transition-all relative ${
                  selectedCell === 'fn'
                    ? 'border-rose-400 bg-rose-950/40 ring-2 ring-rose-500/20'
                    : 'border-slate-800 bg-slate-900/90 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-rose-400">FN (Error Tipo II)</span>
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                </div>
                <div className="font-mono text-2xl font-bold text-white tabular-nums">
                  {data.fn.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
                  <span>{fnPct}% del total</span>
                  <span className="text-rose-400/80 font-mono">β (Omisión)</span>
                </div>
              </div>

              {/* Marginal Row 1: Real Positives P */}
              <div className="rounded-xl p-3 bg-slate-950/80 border border-slate-800 flex flex-col justify-center">
                <span className="text-[11px] text-slate-400">Positivos Reales (P)</span>
                <span className="font-mono text-lg font-bold text-indigo-300 tabular-nums">
                  {metrics.actualPositive.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">P = TP + FN</span>
              </div>

              {/* Row 2: Real Negative */}
              {/* Cell 3: FP */}
              <div
                onClick={() => setSelectedCell('fp')}
                className={`cursor-pointer rounded-xl p-3 border transition-all relative ${
                  selectedCell === 'fp'
                    ? 'border-amber-400 bg-amber-950/40 ring-2 ring-amber-500/20'
                    : 'border-slate-800 bg-slate-900/90 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-amber-400">FP (Error Tipo I)</span>
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="font-mono text-2xl font-bold text-white tabular-nums">
                  {data.fp.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
                  <span>{fpPct}% del total</span>
                  <span className="text-amber-400/80 font-mono">α (Alarma)</span>
                </div>
              </div>

              {/* Cell 4: TN */}
              <div
                onClick={() => setSelectedCell('tn')}
                className={`cursor-pointer rounded-xl p-3 border transition-all relative ${
                  selectedCell === 'tn'
                    ? 'border-cyan-400 bg-cyan-950/40 ring-2 ring-cyan-500/20'
                    : 'border-slate-800 bg-slate-900/90 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-cyan-400">TN (Acierto)</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <div className="font-mono text-2xl font-bold text-white tabular-nums">
                  {data.tn.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
                  <span>{tnPct}% del total</span>
                  <span className="text-cyan-400/80 font-mono">Especificidad</span>
                </div>
              </div>

              {/* Marginal Row 2: Real Negatives N */}
              <div className="rounded-xl p-3 bg-slate-950/80 border border-slate-800 flex flex-col justify-center">
                <span className="text-[11px] text-slate-400">Negativos Reales (N)</span>
                <span className="font-mono text-lg font-bold text-indigo-300 tabular-nums">
                  {metrics.actualNegative.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">N = FP + TN</span>
              </div>

              {/* Row 3: Column Marginals (Predictions) */}
              <div className="rounded-xl p-2.5 bg-slate-950/80 border border-slate-800 flex flex-col justify-center">
                <span className="text-[11px] text-slate-400">Total Predichos Positivos</span>
                <span className="font-mono text-sm font-semibold text-slate-200 tabular-nums">
                  {metrics.predPositive.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">P* = TP + FP</span>
              </div>

              <div className="rounded-xl p-2.5 bg-slate-950/80 border border-slate-800 flex flex-col justify-center">
                <span className="text-[11px] text-slate-400">Total Predichos Negativos</span>
                <span className="font-mono text-sm font-semibold text-slate-200 tabular-nums">
                  {metrics.predNegative.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">N* = FN + TN</span>
              </div>

              <div className="rounded-xl p-2.5 bg-indigo-950/40 border border-indigo-900/60 flex flex-col justify-center">
                <span className="text-[11px] text-indigo-300 font-semibold">Total Muestras (N)</span>
                <span className="font-mono text-sm font-bold text-white tabular-nums">
                  {metrics.total.toLocaleString()}
                </span>
                <span className="text-[10px] text-indigo-400/80 font-mono">Prevalencia: {(metrics.prevalence * 100).toFixed(2)}%</span>
              </div>
            </div>
          </div>

          {/* Direct Cell Input Sliders / Adjusters */}
          <div className="pt-3 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-emerald-400 block mb-1">
                Editar TP:
              </label>
              <input
                type="number"
                min="0"
                value={data.tp}
                onChange={(e) => handleCellChange('tp', parseInt(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white tabular-nums focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-amber-400 block mb-1">
                Editar FP (Tipo I):
              </label>
              <input
                type="number"
                min="0"
                value={data.fp}
                onChange={(e) => handleCellChange('fp', parseInt(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white tabular-nums focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-rose-400 block mb-1">
                Editar FN (Tipo II):
              </label>
              <input
                type="number"
                min="0"
                value={data.fn}
                onChange={(e) => handleCellChange('fn', parseInt(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white tabular-nums focus:outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-cyan-400 block mb-1">
                Editar TN:
              </label>
              <input
                type="number"
                min="0"
                value={data.tn}
                onChange={(e) => handleCellChange('tn', parseInt(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white tabular-nums focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Right Detail Card for Selected Cell */}
        <div className="xl:col-span-5 bg-slate-950/90 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {activeInfo.kicker}
            </span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
              activeInfo.status === 'Acierto' ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800' : 'bg-rose-950/80 text-rose-400 border border-rose-800'
            }`}>
              {activeInfo.status}
            </span>
          </div>

          <h3 className="text-lg font-bold text-white">
            {activeInfo.title}
          </h3>

          <p className="text-xs text-slate-300 leading-relaxed">
            {activeInfo.desc}
          </p>

          <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 block">
              Fórmula y Rol Estadístico:
            </span>
            <code className="text-xs font-mono text-indigo-300 block">
              {activeInfo.formula}
            </code>
          </div>

          <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 block">
              Impacto en Análisis de Datos de Posgrado:
            </span>
            <p className="text-xs text-slate-300">
              {activeInfo.impact}
            </p>
          </div>

          {/* Quick Tip */}
          <div className="flex items-start gap-2 pt-1 text-[11px] text-slate-400">
            <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <span>
              Haz clic en cualquiera de las 4 celdas de la matriz para inspeccionar su interpretación matemática y consecuencias operativas.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

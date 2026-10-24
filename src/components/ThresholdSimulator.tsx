import React, { useState, useMemo } from 'react';
import {
  gaussianPdf,
  simulateThresholdMatrix,
  calculate2x2Metrics,
  generateRocCurvePoints,
} from '../utils/analytics';
import { Sliders, Activity, HelpCircle } from 'lucide-react';

export const ThresholdSimulator: React.FC = () => {
  const [threshold, setThreshold] = useState<number>(0.50);
  const [separability, setSeparability] = useState<number>(1.8); // d-prime distance
  const [nNegatives] = useState<number>(5000);
  const [nPositives] = useState<number>(500); // 10:1 imbalanced ratio

  // Means based on separability
  const mu0 = 0.35;
  const sigma0 = 0.12;
  const mu1 = Math.min(0.85, mu0 + separability * sigma0);
  const sigma1 = 0.14;

  // Real-time matrix and metrics
  const matrix = useMemo(() => {
    return simulateThresholdMatrix(threshold, nNegatives, nPositives, mu0, sigma0, mu1, sigma1);
  }, [threshold, nNegatives, nPositives, mu0, sigma0, mu1, sigma1]);

  const metrics = useMemo(() => calculate2x2Metrics(matrix), [matrix]);

  // ROC curve points & AUC
  const { points: rocPoints, auc } = useMemo(() => {
    return generateRocCurvePoints(nNegatives, nPositives, mu0, sigma0, mu1, sigma1, 80);
  }, [nNegatives, nPositives, mu0, sigma0, mu1, sigma1]);

  // SVG coordinate calculations for distributions
  const svgWidth = 520;
  const svgHeight = 220;
  const padding = { top: 20, right: 20, bottom: 35, left: 40 };
  const graphWidth = svgWidth - padding.left - padding.right;
  const graphHeight = svgHeight - padding.top - padding.bottom;

  // Sample points across x in [0, 1]
  const sampleSteps = 120;
  const maxPdf = Math.max(gaussianPdf(mu0, mu0, sigma0), gaussianPdf(mu1, mu1, sigma1)) * 1.1;

  const pointsClass0: { x: number; y: number }[] = [];
  const pointsClass1: { x: number; y: number }[] = [];

  for (let i = 0; i <= sampleSteps; i++) {
    const xVal = i / sampleSteps;
    const pdf0 = gaussianPdf(xVal, mu0, sigma0);
    const pdf1 = gaussianPdf(xVal, mu1, sigma1);

    const px = padding.left + xVal * graphWidth;
    const py0 = padding.top + graphHeight - (pdf0 / maxPdf) * graphHeight;
    const py1 = padding.top + graphHeight - (pdf1 / maxPdf) * graphHeight;

    pointsClass0.push({ x: px, y: py0 });
    pointsClass1.push({ x: px, y: py1 });
  }

  const pathClass0 = `M ${pointsClass0[0].x} ${pointsClass0[0].y} ` +
    pointsClass0.map((p) => `L ${p.x} ${p.y}`).join(' ');

  const pathClass1 = `M ${pointsClass1[0].x} ${pointsClass1[0].y} ` +
    pointsClass1.map((p) => `L ${p.x} ${p.y}`).join(' ');

  const thresholdSvgX = padding.left + threshold * graphWidth;

  // ROC SVG calculations
  const rocSvgSize = 240;
  const rocPad = 32;
  const rocPlotSize = rocSvgSize - 2 * rocPad;

  // Convert points to SVG path
  const rocPathD = rocPoints
    .map((p, idx) => {
      const sx = rocPad + p.fpr * rocPlotSize;
      const sy = rocPad + (1 - p.tpr) * rocPlotSize;
      return `${idx === 0 ? 'M' : 'L'} ${sx.toFixed(1)} ${sy.toFixed(1)}`;
    })
    .join(' ');

  // Current operating point on ROC
  const currentRocX = rocPad + metrics.fpr * rocPlotSize;
  const currentRocY = rocPad + (1 - metrics.recall) * rocPlotSize;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Title & Concept Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-400" />
            <span>Simulador de Umbral de Decisión (θ) y Curva ROC</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Visualiza cómo el umbral de corte divide las densidades de probabilidad y desplaza el punto de operación (FPR, TPR).
          </p>
        </div>

        {/* Separability Controller */}
        <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs">
          <span className="text-slate-400">Separabilidad ($d'$):</span>
          <input
            type="range"
            min="0.8"
            max="3.2"
            step="0.1"
            value={separability}
            onChange={(e) => setSeparability(parseFloat(e.target.value))}
            className="w-24 accent-indigo-500 cursor-pointer"
          />
          <span className="font-mono text-indigo-300 font-bold tabular-nums">
            {separability.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Threshold Slider Controller */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <span>Umbral de Corte de Probabilidad ($\theta$ Threshold):</span>
          </label>
          <span className="font-mono text-lg font-bold text-indigo-400 tabular-nums">
            θ = {threshold.toFixed(2)}
          </span>
        </div>

        <input
          type="range"
          min="0.05"
          max="0.95"
          step="0.01"
          value={threshold}
          onChange={(e) => setThreshold(parseFloat(e.target.value))}
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
        />

        <div className="flex justify-between text-[11px] text-slate-500 font-mono">
          <span>0.05 (Muy Agresivo: Alto Recall, Bajo Precision)</span>
          <span>0.50 (Estándar Balanceado)</span>
          <span>0.95 (Muy Conservador: Alta Precision, Bajo Recall)</span>
        </div>
      </div>

      {/* Main Dual Graphs: Probability Densities on Left, ROC on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: Continuous Gaussian Densities with Scrubber */}
        <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2 text-xs">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-cyan-400 font-medium">
                <span className="w-3 h-0.5 bg-cyan-400 inline-block" /> Clase Negativa $P(s|y=0)$
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <span className="w-3 h-0.5 bg-emerald-400 inline-block" /> Clase Positiva $P(s|y=1)$
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Corte actual: θ = {threshold.toFixed(2)}
            </span>
          </div>

          {/* SVG Canvas for PDF Distributions */}
          <div className="w-full overflow-hidden">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-auto"
            >
              {/* Grid Lines */}
              <line
                x1={padding.left}
                y1={padding.top + graphHeight}
                x2={padding.left + graphWidth}
                y2={padding.top + graphHeight}
                stroke="#334155"
                strokeWidth="1"
              />
              <line
                x1={padding.left}
                y1={padding.top}
                x2={padding.left}
                y2={padding.top + graphHeight}
                stroke="#334155"
                strokeWidth="1"
              />

              {/* Ticks on X */}
              {[0, 0.2, 0.4, 0.6, 0.8, 1.0].map((tick) => {
                const tx = padding.left + tick * graphWidth;
                return (
                  <g key={tick}>
                    <line x1={tx} y1={padding.top + graphHeight} x2={tx} y2={padding.top + graphHeight + 4} stroke="#475569" />
                    <text
                      x={tx}
                      y={padding.top + graphHeight + 16}
                      fill="#64748b"
                      fontSize="10"
                      textAnchor="middle"
                      fontFamily="monospace"
                    >
                      {tick.toFixed(1)}
                    </text>
                  </g>
                );
              })}

              {/* Curve 0 (Class 0: Negative) */}
              <path
                d={pathClass0}
                fill="none"
                stroke="#06b6d4"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Curve 1 (Class 1: Positive) */}
              <path
                d={pathClass1}
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Threshold Vertical Line */}
              <line
                x1={thresholdSvgX}
                y1={padding.top}
                x2={thresholdSvgX}
                y2={padding.top + graphHeight}
                stroke="#818cf8"
                strokeWidth="2.5"
                strokeDasharray="4 3"
              />

              {/* Scrubber Knob */}
              <circle
                cx={thresholdSvgX}
                cy={padding.top + 6}
                r="5"
                fill="#6366f1"
                stroke="#ffffff"
                strokeWidth="1.5"
              />

              {/* Regions annotation */}
              <text
                x={thresholdSvgX - 10}
                y={padding.top + 20}
                fill="#94a3b8"
                fontSize="10"
                textAnchor="end"
                fontFamily="sans-serif"
              >
                ← Predicción 0 (Negativo)
              </text>
              <text
                x={thresholdSvgX + 10}
                y={padding.top + 20}
                fill="#818cf8"
                fontSize="10"
                textAnchor="start"
                fontFamily="sans-serif"
              >
                Predicción 1 (Positivo) →
              </text>
            </svg>
          </div>

          <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-center text-xs">
            <div className="p-1.5 bg-cyan-950/40 rounded border border-cyan-900/50">
              <span className="text-[10px] text-cyan-400 block font-semibold">TN</span>
              <span className="font-mono text-white font-bold tabular-nums">{matrix.tn}</span>
            </div>
            <div className="p-1.5 bg-amber-950/40 rounded border border-amber-900/50">
              <span className="text-[10px] text-amber-400 block font-semibold">FP (Tipo I)</span>
              <span className="font-mono text-white font-bold tabular-nums">{matrix.fp}</span>
            </div>
            <div className="p-1.5 bg-rose-950/40 rounded border border-rose-900/50">
              <span className="text-[10px] text-rose-400 block font-semibold">FN (Tipo II)</span>
              <span className="font-mono text-white font-bold tabular-nums">{matrix.fn}</span>
            </div>
            <div className="p-1.5 bg-emerald-950/40 rounded border border-emerald-900/50">
              <span className="text-[10px] text-emerald-400 block font-semibold">TP</span>
              <span className="font-mono text-white font-bold tabular-nums">{matrix.tp}</span>
            </div>
          </div>
        </div>

        {/* Right: Dynamic ROC Curve */}
        <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-white">Curva ROC (Receiver Operating Characteristic)</span>
            <span className="text-xs font-mono font-bold text-indigo-400">
              AUC = {auc.toFixed(3)}
            </span>
          </div>

          <svg
            viewBox={`0 0 ${rocSvgSize} ${rocSvgSize}`}
            className="w-56 h-56"
          >
            {/* Coordinate Grid */}
            <rect
              x={rocPad}
              y={rocPad}
              width={rocPlotSize}
              height={rocPlotSize}
              fill="#020617"
              stroke="#1e293b"
              strokeWidth="1"
            />

            {/* Diagonal No-Skill Reference Line */}
            <line
              x1={rocPad}
              y1={rocPad + rocPlotSize}
              x2={rocPad + rocPlotSize}
              y2={rocPad}
              stroke="#475569"
              strokeWidth="1"
              strokeDasharray="4 3"
            />

            {/* ROC Curve Path */}
            <path
              d={rocPathD}
              fill="none"
              stroke="#6366f1"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Current Operating Point */}
            <circle
              cx={currentRocX}
              cy={currentRocY}
              r="6"
              fill="#ec4899"
              stroke="#ffffff"
              strokeWidth="2"
            />

            {/* Axis Labels */}
            <text
              x={rocPad + rocPlotSize / 2}
              y={rocSvgSize - 8}
              fill="#94a3b8"
              fontSize="10"
              textAnchor="middle"
              fontFamily="monospace"
            >
              FPR (1 - Especificidad)
            </text>
            <text
              x={12}
              y={rocPad + rocPlotSize / 2}
              fill="#94a3b8"
              fontSize="10"
              textAnchor="middle"
              transform={`rotate(-90 12 ${rocPad + rocPlotSize / 2})`}
              fontFamily="monospace"
            >
              TPR (Sensibilidad / Recall)
            </text>
          </svg>

          {/* Operating Point Values */}
          <div className="w-full mt-3 p-2 bg-slate-900 rounded-lg border border-slate-800 text-xs flex justify-between items-center font-mono">
            <div>
              <span className="text-slate-400">FPR: </span>
              <strong className="text-amber-400 tabular-nums">{(metrics.fpr * 100).toFixed(1)}%</strong>
            </div>
            <div>
              <span className="text-slate-400">TPR: </span>
              <strong className="text-emerald-400 tabular-nums">{(metrics.recall * 100).toFixed(1)}%</strong>
            </div>
            <div>
              <span className="text-slate-400">Prec: </span>
              <strong className="text-indigo-400 tabular-nums">{(metrics.precision * 100).toFixed(1)}%</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Graduate Note / Pedagogical takeaway */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 flex items-start gap-3">
        <HelpCircle className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold text-white block">
            Principio Teórico para Posgrado en Analítica:
          </span>
          <p className="leading-relaxed text-slate-400">
            El valor por defecto $\theta = 0.50$ solo es óptimo si los costos de error son simétricos y las clases están perfectamente equilibradas.
            En analítica de negocios reales (fraude, churn, crédito), el umbral debe ajustarse deliberadamente para maximizar el valor financiero neto, no una métrica abstracta.
          </p>
        </div>
      </div>
    </div>
  );
};

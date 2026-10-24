import React, { useState } from 'react';
import { MetricCalculations, Matrix2x2Data } from '../types';
import { Sliders, Calculator, Info, AlertCircle } from 'lucide-react';

interface MetricsDashboardProps {
  metrics: MetricCalculations;
  data: Matrix2x2Data;
}

export const MetricsDashboard: React.FC<MetricsDashboardProps> = ({ metrics, data }) => {
  const [beta, setBeta] = useState<number>(1.0);
  const [activeMetricDetail, setActiveMetricDetail] = useState<string>('accuracy');

  // Recalculate F-beta with current slider value
  const betaSq = beta * beta;
  const fBetaDenominator = betaSq * metrics.precision + metrics.recall;
  const currentFBeta = fBetaDenominator > 0 ? ((1 + betaSq) * metrics.precision * metrics.recall) / fBetaDenominator : 0;

  const cards = [
    {
      id: 'accuracy',
      name: 'Exactitud (Accuracy)',
      englishName: 'Accuracy',
      value: (metrics.accuracy * 100).toFixed(2) + '%',
      decimal: metrics.accuracy.toFixed(4),
      formula: '(TP + TN) / Total',
      calc: `(${data.tp} + ${data.tn}) / ${metrics.total}`,
      description: 'Proporción global de predicciones correctas sobre el total de observaciones.',
      warning: metrics.prevalence < 0.1 || metrics.prevalence > 0.9
        ? '¡Alerta de Paradoja! En datasets desbalanceados, predecir la clase mayoritaria infla artificialmente el Accuracy.'
        : undefined,
      meterColor: 'bg-indigo-500',
      meterWidth: metrics.accuracy * 100,
    },
    {
      id: 'recall',
      name: 'Sensibilidad / Exhaustividad (Recall)',
      englishName: 'True Positive Rate (TPR) / Sensitivity',
      value: (metrics.recall * 100).toFixed(2) + '%',
      decimal: metrics.recall.toFixed(4),
      formula: 'TP / (TP + FN)',
      calc: `${data.tp} / (${data.tp} + ${data.fn})`,
      description: 'De todos los casos que REALMENTE eran positivos, ¿cuántos logró capturar el modelo?',
      tip: 'Crucial cuando el costo del Falso Negativo (FN) es catastrófico (ej. oncología, fallas de turbinas).',
      meterColor: 'bg-emerald-500',
      meterWidth: metrics.recall * 100,
    },
    {
      id: 'precision',
      name: 'Precisión (Precision / VPP)',
      englishName: 'Positive Predictive Value (PPV)',
      value: (metrics.precision * 100).toFixed(2) + '%',
      decimal: metrics.precision.toFixed(4),
      formula: 'TP / (TP + FP)',
      calc: `${data.tp} / (${data.tp} + ${data.fp})`,
      description: 'De todos los casos que el modelo PREDÍJO como positivos, ¿cuántos eran verdaderamente positivos?',
      tip: 'Crucial cuando el costo del Falso Positivo (FP) es alto (ej. clasificador de spam bloqueando contratos legítimos).',
      meterColor: 'bg-amber-500',
      meterWidth: metrics.precision * 100,
    },
    {
      id: 'specificity',
      name: 'Especificidad (Specificity)',
      englishName: 'True Negative Rate (TNR)',
      value: (metrics.specificity * 100).toFixed(2) + '%',
      decimal: metrics.specificity.toFixed(4),
      formula: 'TN / (TN + FP)',
      calc: `${data.tn} / (${data.tn} + ${data.fp})`,
      description: 'Capacidad del modelo para rechazar correctamente los casos verdaderamente negativos.',
      tip: 'Complementario a la tasa de falsas alarmas (FPR = 1 - Especificidad).',
      meterColor: 'bg-cyan-500',
      meterWidth: metrics.specificity * 100,
    },
    {
      id: 'f1',
      name: 'F1-Score (Media Armónica)',
      englishName: 'F1-Score',
      value: (metrics.f1Score * 100).toFixed(2) + '%',
      decimal: metrics.f1Score.toFixed(4),
      formula: '2 × (Prec × Rec) / (Prec + Rec)',
      calc: `2 × (${metrics.precision.toFixed(3)} × ${metrics.recall.toFixed(3)}) / (${metrics.precision.toFixed(3)} + ${metrics.recall.toFixed(3)})`,
      description: 'Media armónica equilibrada entre Precisión y Recall. Penaliza severamente los desequilibrios extremos.',
      tip: 'Superior al Accuracy cuando las clases no están igualmente balanceadas.',
      meterColor: 'bg-purple-500',
      meterWidth: metrics.f1Score * 100,
    },
    {
      id: 'mcc',
      name: 'Coeficiente de Matthews (MCC)',
      englishName: 'Matthews Correlation Coefficient',
      value: metrics.mcc.toFixed(3),
      decimal: metrics.mcc.toFixed(4),
      formula: '(TP·TN - FP·FN) / √[(TP+FP)(TP+FN)(TN+FP)(TN+FN)]',
      calc: `(${data.tp}·${data.tn} - ${data.fp}·${data.fn}) / Denominador`,
      description: 'Coeficiente de correlación entre predicción y realidad (-1 a +1). Es el estándar de oro en bioinformática y analítica desbalanceada.',
      tip: '+1 indica predicción perfecta, 0 azar puro, -1 desacuerdo total.',
      meterColor: 'bg-rose-500',
      meterWidth: Math.max(0, ((metrics.mcc + 1) / 2) * 100),
    },
    {
      id: 'balancedAcc',
      name: 'Exactitud Balanceada',
      englishName: 'Balanced Accuracy',
      value: (metrics.balancedAccuracy * 100).toFixed(2) + '%',
      decimal: metrics.balancedAccuracy.toFixed(4),
      formula: '(Recall + Specificity) / 2',
      calc: `(${metrics.recall.toFixed(3)} + ${metrics.specificity.toFixed(3)}) / 2`,
      description: 'Promedio sin ponderar de la tasa de aciertos en positivos y en negativos. Inmune a la distribución de clases.',
      meterColor: 'bg-teal-500',
      meterWidth: metrics.balancedAccuracy * 100,
    },
    {
      id: 'fpr',
      name: 'Tasa de Falsos Positivos (FPR)',
      englishName: 'Fall-out / False Alarm Rate (1 - Specificity)',
      value: (metrics.fpr * 100).toFixed(2) + '%',
      decimal: metrics.fpr.toFixed(4),
      formula: 'FP / (TN + FP)',
      calc: `${data.fp} / (${data.tn} + ${data.fp})`,
      description: 'Eje horizontal de la Curva ROC. Proporción de negativos reales catalogados erróneamente como positivos.',
      meterColor: 'bg-red-500',
      meterWidth: metrics.fpr * 100,
    },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Calculator className="w-5 h-5 text-indigo-400" />
            <span>Métricas de Evaluación Derivadas</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Fórmulas rigurosas de posgrado con sustitución aritmética en tiempo real a partir de la matriz activa.
          </p>
        </div>

        {/* Interactive F-Beta Controller */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <span>Ponderación $F_\beta$:</span>
            <span className="font-mono font-bold text-indigo-300 tabular-nums">
              β = {beta.toFixed(1)}
            </span>
          </div>
          <input
            type="range"
            min="0.1"
            max="3.0"
            step="0.1"
            value={beta}
            onChange={(e) => setBeta(parseFloat(e.target.value))}
            className="w-24 accent-indigo-500 cursor-pointer"
          />
          <div className="font-mono text-indigo-200 font-bold tabular-nums">
            Score: {(currentFBeta * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Grid of Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => {
          const isSelected = activeMetricDetail === c.id;
          return (
            <div
              key={c.id}
              onClick={() => setActiveMetricDetail(c.id)}
              className={`cursor-pointer rounded-xl p-4 border transition-all relative flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-950 border-indigo-500 ring-2 ring-indigo-500/20 shadow-md'
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="text-xs font-semibold text-slate-200 line-clamp-1">
                    {c.name}
                  </span>
                  <Info className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                </div>
                <span className="text-[10px] text-slate-400 block font-mono mb-2">
                  {c.englishName}
                </span>

                <div className="flex items-baseline gap-2 my-2">
                  <span className="font-mono text-2xl font-bold text-white tabular-nums tracking-tight">
                    {c.value}
                  </span>
                  <span className="font-mono text-xs text-slate-400 tabular-nums">
                    ({c.decimal})
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-2 mt-2">
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${c.meterColor} rounded-full transition-all duration-300`}
                    style={{ width: `${Math.min(100, Math.max(0, c.meterWidth))}%` }}
                  />
                </div>
                <div className="text-[10px] text-indigo-300 font-mono flex items-center justify-between">
                  <span>{c.formula}</span>
                </div>
              </div>

              {c.warning && (
                <div className="mt-2 pt-2 border-t border-amber-900/40 text-[10px] text-amber-300 flex items-start gap-1">
                  <AlertCircle className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                  <span>Alerta de desbalance</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Metric Breakdown Strip */}
      {(() => {
        const detail = cards.find((c) => c.id === activeMetricDetail);
        if (!detail) return null;
        return (
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-sm">
                Desglose Aritmético: {detail.name}
              </span>
              <span className="font-mono text-indigo-400 font-bold">{detail.formula}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-slate-200">
              Valor Calculado = {detail.calc} = <strong className="text-indigo-300">{detail.value}</strong> ({detail.decimal})
            </div>
            <p className="text-slate-300">{detail.description}</p>
            {detail.tip && <p className="text-indigo-300/90 italic font-medium">{detail.tip}</p>}
            {detail.warning && (
              <p className="text-amber-300 bg-amber-950/30 p-2 rounded border border-amber-900/50">
                {detail.warning}
              </p>
            )}
          </div>
        );
      })()}
    </div>
  );
};

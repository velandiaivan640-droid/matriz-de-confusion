import { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { Matrix2x2Interactive } from './components/Matrix2x2Interactive';
import { MetricsDashboard } from './components/MetricsDashboard';
import { ThresholdSimulator } from './components/ThresholdSimulator';
import { BusinessCostMatrix } from './components/BusinessCostMatrix';
import { MulticlassMatrix } from './components/MulticlassMatrix';
import { MasteryQuiz } from './components/MasteryQuiz';
import { ExportModal } from './components/ExportModal';
import { SCENARIO_PRESETS } from './constants';
import { Matrix2x2Data, ScenarioPreset } from './types';
import { calculate2x2Metrics } from './utils/analytics';
import { BookOpen, Layers, BarChart3, HelpCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('matrix2x2');
  const [selectedPreset, setSelectedPreset] = useState<ScenarioPreset | null>(SCENARIO_PRESETS[0]);
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [data2x2, setData2x2] = useState<Matrix2x2Data>(SCENARIO_PRESETS[0].data);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);

  // Synchronized derived metrics
  const metrics = useMemo(() => calculate2x2Metrics(data2x2), [data2x2]);

  const handleSelectPreset = (preset: ScenarioPreset) => {
    setSelectedPreset(preset);
    setIsCustom(false);
    setData2x2({ ...preset.data });
  };

  const handleSetCustom = () => {
    setIsCustom(true);
    setSelectedPreset(null);
  };

  const handleResetData = () => {
    if (selectedPreset) {
      setData2x2({ ...selectedPreset.data });
    } else {
      setData2x2({ ...SCENARIO_PRESETS[0].data });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Bar adhering to the 3-Zone Contract */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenExport={() => setIsExportOpen(true)}
      />

      {/* Hero Section with Academic Intent & Scenario Selector */}
      <HeroSection
        selectedPreset={selectedPreset}
        onSelectPreset={handleSelectPreset}
        onSetCustom={handleSetCustom}
        isCustom={isCustom}
      />

      {/* Main Workspace Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Module Sub-Navigation Bar (Functional interactive buttons) */}
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto">
          <button
            onClick={() => setActiveTab('matrix2x2')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'matrix2x2'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>1. Matriz 2×2 & Fórmulas</span>
          </button>

          <button
            onClick={() => setActiveTab('threshold')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'threshold'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>2. Umbral de Decisión & Curva ROC</span>
          </button>

          <button
            onClick={() => setActiveTab('business')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'business'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>3. Costos de Negocio & PyG</span>
          </button>

          <button
            onClick={() => setActiveTab('multiclass')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'multiclass'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>4. Matriz Multiclase (3×3)</span>
          </button>

          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'quiz'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>5. Desafíos & Evaluación</span>
          </button>
        </div>

        {/* Dynamic Tab Views */}
        {activeTab === 'matrix2x2' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <Matrix2x2Interactive
              data={data2x2}
              onChange={setData2x2}
              metrics={metrics}
              onReset={handleResetData}
            />
            <MetricsDashboard metrics={metrics} data={data2x2} />
          </div>
        )}

        {activeTab === 'threshold' && (
          <div className="animate-in fade-in duration-200">
            <ThresholdSimulator />
          </div>
        )}

        {activeTab === 'business' && (
          <div className="animate-in fade-in duration-200">
            <BusinessCostMatrix data={data2x2} activePreset={selectedPreset} />
          </div>
        )}

        {activeTab === 'multiclass' && (
          <div className="animate-in fade-in duration-200">
            <MulticlassMatrix />
          </div>
        )}

        {activeTab === 'quiz' && (
          <div className="animate-in fade-in duration-200">
            <MasteryQuiz />
          </div>
        )}

        {/* Conceptual Synthesis Box: Master's Degree Reference Summary */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <span>Guía Rápida Metodológica</span>
            <span aria-hidden="true">·</span>
            <span>Maestría en Analítica de Datos</span>
            <span aria-hidden="true">·</span>
            <span>Reglas de Decisión</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <span className="font-bold text-white text-sm block">1. Cuándo priorizar Recall</span>
              <p className="text-slate-400 leading-relaxed">
                Cuando el Falso Negativo (omisión) tiene consecuencias severas o irreversibles: diagnóstico médico precoz, detección de intrusiones críticas, detección de fraude grave o fallas en turbinas.
              </p>
              <span className="text-emerald-400 font-mono text-[11px] block">Métrica: Recall (TPR) & F2-Score</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <span className="font-bold text-white text-sm block">2. Cuándo priorizar Precisión</span>
              <p className="text-slate-400 leading-relaxed">
                Cuando el Falso Positivo (falsa alarma) acarrea un alto costo operacional o daño reputacional: filtros de spam corporativo, descarte automático de candidatos, o decisiones judiciales automáticas.
              </p>
              <span className="text-amber-400 font-mono text-[11px] block">Métrica: Precision (PPV) & F0.5-Score</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <span className="font-bold text-white text-sm block">3. Clases Desbalanceadas</span>
              <p className="text-slate-400 leading-relaxed">
                Nunca reportes únicamente Accuracy cuando la prevalencia difiere de 50%. Emplea el Coeficiente de Matthews (MCC), Balanced Accuracy, o examina el área bajo la curva Precision-Recall (PR-AUC).
              </p>
              <span className="text-indigo-400 font-mono text-[11px] block">Métrica: MCC & PR-AUC</span>
            </div>
          </div>
        </div>
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">ConfusioLab Analytics</span>
            <span aria-hidden="true">·</span>
            <span>Entorno Didáctico para Maestría en Analítica de Datos</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>Convención Scikit-learn (ISO/IEC 25059)</span>
            <span aria-hidden="true">·</span>
            <span>Evaluación Rigurosa de Modelos</span>
          </div>
        </div>
      </footer>

      {/* Export Report Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        data={data2x2}
        metrics={metrics}
        preset={selectedPreset}
      />
    </div>
  );
}

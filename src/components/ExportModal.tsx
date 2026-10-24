import React, { useState } from 'react';
import { Matrix2x2Data, MetricCalculations, ScenarioPreset } from '../types';
import { X, Copy, Check, Download, FileText } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: Matrix2x2Data;
  metrics: MetricCalculations;
  preset: ScenarioPreset | null;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  data,
  metrics,
  preset,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const scenarioName = preset?.title || 'Modelo de Clasificación Personalizado';
  const domainName = preset?.domain || 'Analítica de Datos General';

  const reportMarkdown = `# INFORME TÉCNICO DE EVALUACIÓN DE MODELO
## Maestría en Analítica de Datos | ConfusioLab Analytics

### 1. Contexto del Problema
- Proyecto / Escenario: ${scenarioName}
- Dominio: ${domainName}
- Tamaño Muestral Total: ${metrics.total.toLocaleString()} observaciones
- Prevalencia de la Clase Positiva: ${(metrics.prevalence * 100).toFixed(2)}%

---

### 2. Matriz de Confusión (Convención Scikit-Learn)
| Real \\ Predicho | Positivo (1) | Negativo (0) | Total Real |
| :--- | :--- | :--- | :--- |
| **Positivo (1)** | **TP:** ${data.tp.toLocaleString()} | **FN (Tipo II):** ${data.fn.toLocaleString()} | **P:** ${metrics.actualPositive.toLocaleString()} |
| **Negativo (0)** | **FP (Tipo I):** ${data.fp.toLocaleString()} | **TN:** ${data.tn.toLocaleString()} | **N:** ${metrics.actualNegative.toLocaleString()} |
| **Total Predicho** | **P\*:** ${metrics.predPositive.toLocaleString()} | **N\*:** ${metrics.predNegative.toLocaleString()} | **N_Total:** ${metrics.total.toLocaleString()} |

---

### 3. Métricas Estadísticas de Desempeño
- **Exactitud (Accuracy):** ${(metrics.accuracy * 100).toFixed(2)}% (${metrics.accuracy.toFixed(4)})
- **Sensibilidad / Recall (TPR):** ${(metrics.recall * 100).toFixed(2)}% (${metrics.recall.toFixed(4)})
- **Precisión / VPP:** ${(metrics.precision * 100).toFixed(2)}% (${metrics.precision.toFixed(4)})
- **Especificidad (TNR):** ${(metrics.specificity * 100).toFixed(2)}% (${metrics.specificity.toFixed(4)})
- **Tasa de Falsos Positivos (FPR):** ${(metrics.fpr * 100).toFixed(2)}% (${metrics.fpr.toFixed(4)})
- **F1-Score:** ${(metrics.f1Score * 100).toFixed(2)}% (${metrics.f1Score.toFixed(4)})
- **Exactitud Balanceada:** ${(metrics.balancedAccuracy * 100).toFixed(2)}% (${metrics.balancedAccuracy.toFixed(4)})
- **Coeficiente de Matthews (MCC):** ${metrics.mcc.toFixed(4)}

---

### 4. Conclusión Metodológica y Recomendación
- ${
    metrics.prevalence < 0.1
      ? 'Debido al desbalance severo de clases, la exactitud NO es una métrica confiable. Se recomienda optimizar en base al MCC y Recall/F-beta según la función de pérdida del negocio.'
      : 'El balance relativo entre clases permite una interpretación armónica del F1-Score y Exactitud Balanceada.'
  }
- Generado automáticamente por ConfusioLab Analytics.
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(reportMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([reportMarkdown], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `reporte_matriz_confusion_${Date.now()}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">
              Exportar Informe Técnico de Evaluación
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Preview */}
        <div className="p-5 overflow-y-auto space-y-4">
          <p className="text-xs text-slate-400">
            Copia el informe en formato Markdown o descárgalo para adjuntarlo a tus entregables de maestría o presentaciones ejecutivas:
          </p>

          <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-96">
            {reportMarkdown}
          </pre>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-4 border-t border-slate-800 bg-slate-950">
          <span className="text-xs text-slate-500 font-mono">
            Formato: Markdown / Compatible con GitHub, Notion y LaTeX
          </span>

          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado' : 'Copiar Texto'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar .md</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

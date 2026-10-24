export interface Matrix2x2Data {
  tp: number;
  fp: number;
  fn: number;
  tn: number;
}

export interface MetricCalculations {
  total: number;
  actualPositive: number; // P = TP + FN
  actualNegative: number; // N = TN + FP
  predPositive: number;   // P* = TP + FP
  predNegative: number;   // N* = TN + FN
  prevalence: number;     // P / Total
  accuracy: number;       // (TP + TN) / Total
  errorRate: number;      // (FP + FN) / Total
  precision: number;      // TP / (TP + FP) (PPV)
  recall: number;         // TP / (TP + FN) (TPR, Sensitivity)
  specificity: number;    // TN / (TN + FP) (TNR)
  fpr: number;            // FP / (TN + FP) (Fall-out, 1 - Specificity)
  fnr: number;            // FN / (TP + FN) (Miss rate, 1 - Recall)
  f1Score: number;        // 2 * (P * R) / (P + R)
  fBetaScore: number;     // (1 + beta^2) * (P * R) / ((beta^2 * P) + R)
  balancedAccuracy: number; // (Recall + Specificity) / 2
  mcc: number;            // Matthews Correlation Coefficient
  npv: number;            // Negative Predictive Value: TN / (TN + FN)
}

export interface ScenarioPreset {
  id: string;
  title: string;
  domain: string;
  description: string;
  contextNote: string;
  data: Matrix2x2Data;
  keyMetric: 'recall' | 'precision' | 'f1Score' | 'mcc' | 'balancedAccuracy';
  keyMetricReason: string;
  defaultCosts: {
    benefitTp: number;
    costFp: number;
    costFn: number;
    benefitTn: number;
    currency: string;
  };
}

export interface CostParameters {
  benefitTp: number;
  costFp: number;
  costFn: number;
  benefitTn: number;
  currency: string;
}

export interface MulticlassClassMetrics {
  className: string;
  tp: number;
  fp: number;
  fn: number;
  tn: number;
  precision: number;
  recall: number;
  f1: number;
  support: number;
}

export interface MulticlassEvaluation {
  classes: string[];
  matrix: number[][]; // [real][pred]
  totalSamples: number;
  classMetrics: MulticlassClassMetrics[];
  macroPrecision: number;
  macroRecall: number;
  macroF1: number;
  weightedPrecision: number;
  weightedRecall: number;
  weightedF1: number;
  overallAccuracy: number;
}

export interface QuizQuestion {
  id: string;
  title: string;
  scenario: string;
  contextBadge: string;
  matrix: Matrix2x2Data;
  question: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
    explanation: string;
  }[];
}

import { Matrix2x2Data, MetricCalculations, MulticlassEvaluation, CostParameters } from '../types';

export function calculate2x2Metrics(data: Matrix2x2Data, beta: number = 1): MetricCalculations {
  const { tp, fp, fn, tn } = data;
  const total = Math.max(1, tp + fp + fn + tn);
  const actualPositive = tp + fn;
  const actualNegative = tn + fp;
  const predPositive = tp + fp;
  const predNegative = tn + fn;

  const prevalence = actualPositive / total;
  const accuracy = (tp + tn) / total;
  const errorRate = (fp + fn) / total;

  const precision = predPositive > 0 ? tp / predPositive : 0;
  const recall = actualPositive > 0 ? tp / actualPositive : 0;
  const specificity = actualNegative > 0 ? tn / actualNegative : 0;
  const npv = predNegative > 0 ? tn / predNegative : 0;

  const fpr = actualNegative > 0 ? fp / actualNegative : 0;
  const fnr = actualPositive > 0 ? fn / actualPositive : 0;

  const f1Denominator = precision + recall;
  const f1Score = f1Denominator > 0 ? (2 * precision * recall) / f1Denominator : 0;

  const betaSq = beta * beta;
  const fBetaDenominator = betaSq * precision + recall;
  const fBetaScore = fBetaDenominator > 0 ? ((1 + betaSq) * precision * recall) / fBetaDenominator : 0;

  const balancedAccuracy = (recall + specificity) / 2;

  // Matthews Correlation Coefficient
  const mccNumerator = tp * tn - fp * fn;
  const mccDenominator = Math.sqrt(
    (tp + fp) * (tp + fn) * (tn + fp) * (tn + fn)
  );
  const mcc = mccDenominator > 0 ? mccNumerator / mccDenominator : 0;

  return {
    total,
    actualPositive,
    actualNegative,
    predPositive,
    predNegative,
    prevalence,
    accuracy,
    errorRate,
    precision,
    recall,
    specificity,
    fpr,
    fnr,
    f1Score,
    fBetaScore,
    balancedAccuracy,
    mcc,
    npv,
  };
}

export function calculateFinancialImpact(data: Matrix2x2Data, costs: CostParameters) {
  const grossBenefit = data.tp * costs.benefitTp + data.tn * costs.benefitTn;
  const totalCost = data.fp * costs.costFp + data.fn * costs.costFn;
  const netProfit = grossBenefit - totalCost;

  // Baseline naive: predict everything negative
  // If model predicts 0 always: TP=0, FP=0, FN=actualPositive, TN=actualNegative
  const actualPositive = data.tp + data.fn;
  const actualNegative = data.tn + data.fp;
  const naiveNegativeProfit = (actualNegative * costs.benefitTn) - (actualPositive * costs.costFn);

  // Baseline naive: predict everything positive
  // If model predicts 1 always: TP=actualPositive, FP=actualNegative, FN=0, TN=0
  const naivePositiveProfit = (actualPositive * costs.benefitTp) - (actualNegative * costs.costFp);

  const bestNaive = Math.max(naiveNegativeProfit, naivePositiveProfit);
  const valueAddedOverNaive = netProfit - bestNaive;

  return {
    grossBenefit,
    totalCost,
    netProfit,
    naiveNegativeProfit,
    naivePositiveProfit,
    bestNaive,
    valueAddedOverNaive,
  };
}

// Gaussian probability density function
export function gaussianPdf(x: number, mean: number, std: number): number {
  const exponent = -0.5 * Math.pow((x - mean) / std, 2);
  return (1 / (std * Math.sqrt(2 * Math.PI))) * Math.exp(exponent);
}

// Approximation of standard normal CDF
export function standardNormalCdf(x: number): number {
  // Abramowitz and Stegun approximation
  const b1 = 0.319381530;
  const b2 = -0.356563782;
  const b3 = 1.781477937;
  const b4 = -1.821255978;
  const b5 = 1.330274429;
  const p = 0.2316419;
  const c = 0.39894228;

  if (x >= 0) {
    const t = 1.0 / (1.0 + p * x);
    return (
      1.0 -
      c *
        Math.exp((-x * x) / 2.0) *
        t *
        (t * (t * (t * (t * b5 + b4) + b3) + b2) + b1)
    );
  } else {
    const t = 1.0 / (1.0 - p * x);
    return (
      c *
      Math.exp((-x * x) / 2.0) *
      t *
      (t * (t * (t * (t * b5 + b4) + b3) + b2) + b1)
    );
  }
}

export function gaussianCdf(x: number, mean: number, std: number): number {
  return standardNormalCdf((x - mean) / std);
}

/**
 * Computes confusion matrix at a decision threshold for two Gaussian populations:
 * Class 0 (Negative): N samples, mean = mu0, std = sigma0
 * Class 1 (Positive): P samples, mean = mu1, std = sigma1
 * Decision rule: Predict 1 if score >= threshold, else 0
 */
export function simulateThresholdMatrix(
  threshold: number,
  nNegatives: number,
  nPositives: number,
  mu0: number = 0.35,
  sigma0: number = 0.12,
  mu1: number = 0.65,
  sigma1: number = 0.14
): Matrix2x2Data {
  // For negative class (real 0):
  // Score < threshold -> True Negative
  // Score >= threshold -> False Positive
  const probNegBelow = gaussianCdf(threshold, mu0, sigma0);
  const tn = Math.round(nNegatives * probNegBelow);
  const fp = nNegatives - tn;

  // For positive class (real 1):
  // Score >= threshold -> True Positive
  // Score < threshold -> False Negative
  const probPosBelow = gaussianCdf(threshold, mu1, sigma1);
  const fn = Math.round(nPositives * probPosBelow);
  const tp = nPositives - fn;

  return { tp, fp, fn, tn };
}

// Generate points for ROC curve and calculate approximate AUC
export function generateRocCurvePoints(
  nNegatives: number,
  nPositives: number,
  mu0: number = 0.35,
  sigma0: number = 0.12,
  mu1: number = 0.65,
  sigma1: number = 0.14,
  steps: number = 60
) {
  const points: { threshold: number; fpr: number; tpr: number; precision: number }[] = [];

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const matrix = simulateThresholdMatrix(t, nNegatives, nPositives, mu0, sigma0, mu1, sigma1);
    const m = calculate2x2Metrics(matrix);
    points.push({
      threshold: t,
      fpr: m.fpr,
      tpr: m.recall,
      precision: m.precision,
    });
  }

  // Sort by FPR ascending for trapezoidal integration
  const sortedPoints = [...points].sort((a, b) => a.fpr - b.fpr);
  let auc = 0;
  for (let i = 1; i < sortedPoints.length; i++) {
    const dx = sortedPoints[i].fpr - sortedPoints[i - 1].fpr;
    const avgY = (sortedPoints[i].tpr + sortedPoints[i - 1].tpr) / 2;
    auc += Math.max(0, dx * avgY);
  }

  return { points, auc: Math.min(1.0, Math.max(0.5, auc)) };
}

// Multiclass 3x3 calculations
export function calculateMulticlass(classes: string[], matrix: number[][]): MulticlassEvaluation {
  const numClasses = classes.length;
  let totalSamples = 0;
  for (let i = 0; i < numClasses; i++) {
    for (let j = 0; j < numClasses; j++) {
      totalSamples += matrix[i][j];
    }
  }

  let totalCorrect = 0;
  for (let i = 0; i < numClasses; i++) {
    totalCorrect += matrix[i][i];
  }
  const overallAccuracy = totalSamples > 0 ? totalCorrect / totalSamples : 0;

  const classMetrics: MulticlassEvaluation['classMetrics'] = [];

  for (let c = 0; c < numClasses; c++) {
    const tp = matrix[c][c];

    // FP: predicted as c, but actually was not c (sum of column c minus tp)
    let fp = 0;
    for (let r = 0; r < numClasses; r++) {
      if (r !== c) fp += matrix[r][c];
    }

    // FN: actually was c, but predicted as something else (sum of row c minus tp)
    let fn = 0;
    for (let col = 0; col < numClasses; col++) {
      if (col !== c) fn += matrix[c][col];
    }

    // TN: neither actually c nor predicted c
    const tn = totalSamples - (tp + fp + fn);

    const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
    const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
    const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;
    const support = tp + fn;

    classMetrics.push({
      className: classes[c],
      tp,
      fp,
      fn,
      tn,
      precision,
      recall,
      f1,
      support,
    });
  }

  // Macro averages
  const macroPrecision = classMetrics.reduce((sum, item) => sum + item.precision, 0) / numClasses;
  const macroRecall = classMetrics.reduce((sum, item) => sum + item.recall, 0) / numClasses;
  const macroF1 = classMetrics.reduce((sum, item) => sum + item.f1, 0) / numClasses;

  // Weighted averages
  const weightedPrecision = totalSamples > 0
    ? classMetrics.reduce((sum, item) => sum + item.precision * item.support, 0) / totalSamples
    : 0;
  const weightedRecall = totalSamples > 0
    ? classMetrics.reduce((sum, item) => sum + item.recall * item.support, 0) / totalSamples
    : 0;
  const weightedF1 = totalSamples > 0
    ? classMetrics.reduce((sum, item) => sum + item.f1 * item.support, 0) / totalSamples
    : 0;

  return {
    classes,
    matrix,
    totalSamples,
    classMetrics,
    macroPrecision,
    macroRecall,
    macroF1,
    weightedPrecision,
    weightedRecall,
    weightedF1,
    overallAccuracy,
  };
}

import { ScenarioPreset, QuizQuestion } from './types';

export const SCENARIO_PRESETS: ScenarioPreset[] = [
  {
    id: 'fraud',
    title: 'Detección de Fraude Bancario',
    domain: 'Fintech & Prevención de Delitos Financieros',
    description: 'Conjunto de 100,000 transacciones con desbalance severo (1% de fraude real). Ilustra la Paradoja de la Exactitud (Accuracy Paradox).',
    contextNote: 'En analítica de fraude, un modelo ingenuo que prediga "Siempre Legítimo" obtendría 99% de Accuracy pero 0% de efectividad operativa.',
    data: {
      tp: 820,
      fp: 240,
      fn: 180,
      tn: 98760,
    },
    keyMetric: 'recall',
    keyMetricReason: 'El costo de omitir un fraude (FN = $3,500) es muy superior al costo de una validación 2FA (FP = $15). Priorizamos Recall y MCC.',
    defaultCosts: {
      benefitTp: 3500, // Fraude detenido
      costFp: 20,      // Molestia de verificación SMS/Llamada
      costFn: 4200,    // Pérdida financiera por fraude consumado
      benefitTn: 2,    // Margen operativo normal
      currency: 'USD',
    },
  },
  {
    id: 'medical',
    title: 'Screening Oncológico Temprano',
    domain: 'Bioestadística & Salud Digital',
    description: 'Diagnóstico precoz en 5,000 pacientes evaluados con sospecha de nódulo pulmonar maligno. El Falso Negativo tiene costo vital.',
    contextNote: 'El Error Tipo II (Falso Negativo) envía a un paciente oncológico a casa sin tratamiento. El Falso Positivo solo genera una biopsia de confirmación.',
    data: {
      tp: 385,
      fp: 110,
      fn: 15,
      tn: 4490,
    },
    keyMetric: 'recall',
    keyMetricReason: 'La Sensibilidad (Recall = 96.2%) debe ser máxima para garantizar la supervivencia del paciente. Se utiliza la métrica F2-Score.',
    defaultCosts: {
      benefitTp: 15000, // Tratamiento precoz oportuno
      costFp: 600,     // Biopsia complementaria y ansiedad
      costFn: 80000,   // Deterioro clínico severo por diagnóstico tardío
      benefitTn: 100,  // Alta médica con tranquilidad
      currency: 'USD',
    },
  },
  {
    id: 'cybersecurity',
    title: 'Detección de Intrusiones en Servidores (SIEM)',
    domain: 'Ciberseguridad & SOC',
    description: 'Monitoreo de 25,000 paquetes de red. Demasiadas falsas alarmas (FP) saturan al equipo de analistas de seguridad (Alert Fatigue).',
    contextNote: 'Si la Precisión es baja, los analistas de ciberseguridad ignorarán las alarmas por fatiga operacional.',
    data: {
      tp: 640,
      fp: 85,
      fn: 60,
      tn: 24215,
    },
    keyMetric: 'precision',
    keyMetricReason: 'Alta Precisión (88.3%) evita la fatiga de alertas sin comprometer excesivamente la cobertura de detección.',
    defaultCosts: {
      benefitTp: 12000, // Incidente bloqueado antes de exfiltración
      costFp: 180,     // Horas hombre de análisis forense en falso positivo
      costFn: 50000,   // Brecha de seguridad consumada
      benefitTn: 10,   // Tráfico regular sin interrupciones
      currency: 'USD',
    },
  },
  {
    id: 'credit',
    title: 'Aprobación de Créditos de Consumo',
    domain: 'Riesgo Financiero & Credit Scoring',
    description: 'Evaluación de 10,000 solicitudes de crédito personal. El objetivo es maximizar la cartera minimizando la mora (Default).',
    contextNote: 'El negocio bancario vive del cobro de intereses (TN/TP), pero un cliente en mora no recuperable destruye el margen de 15 créditos cumplidos.',
    data: {
      tp: 1420,  // Buenos pagadores aprobados
      fp: 380,   // Clientes en mora aprobados por error (Default)
      fn: 210,   // Buenos pagadores rechazados erróneamente (Costo de oportunidad)
      tn: 7990,  // Clientes en mora correctamente rechazados
    },
    keyMetric: 'mcc',
    keyMetricReason: 'El Coeficiente de Correlación de Matthews (MCC) evalúa la calidad equilibrada del scoring crediticio considerando la matriz completa.',
    defaultCosts: {
      benefitTp: 850,   // Margen neto por intereses del préstamo
      costFp: 4500,     // Pérdida neta de capital por impago (Default)
      costFn: 400,      // Pérdida de oportunidad de venta cruzada
      benefitTn: 150,   // Ahorro en provisión de riesgo
      currency: 'USD',
    },
  },
];

export const INITIAL_MULTICLASS_DATA = {
  classes: ['Bajo Riesgo', 'Riesgo Medio', 'Alto Riesgo (SLA)'],
  matrix: [
    [1250, 110, 20],   // Real: Bajo Riesgo (Pred: Bajo, Medio, Alto)
    [95, 820, 65],     // Real: Medio Riesgo
    [15, 45, 480],     // Real: Alto Riesgo
  ],
};

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    title: '1. La Paradoja de la Exactitud en Clases Desbalanceadas',
    scenario: 'En un modelo de detección de fraude en tiempo real con 100,000 transacciones, se observa que el 99.5% de las transacciones son legítimas y solo el 0.5% (500) son fraude. Un analista junior propone un modelo trivial que predice sistemáticamente "Transacción Legítima" para el 100% de los casos.',
    contextBadge: 'Concepto Clave de Posgrado',
    matrix: {
      tp: 0,
      fp: 0,
      fn: 500,
      tn: 99500,
    },
    question: '¿Qué métricas reflejan adecuadamente el fracaso de este modelo para el área de analítica?',
    options: [
      {
        id: 'opt_a',
        text: 'La Exactitud (Accuracy) es del 99.5%, lo que demuestra que el modelo es óptimo para producción.',
        isCorrect: false,
        explanation: 'Incorrecto. La exactitud es engañosa: aunque es 99.5%, no detectó ningún caso de fraude. Es la clásica trampa del desbalance.',
      },
      {
        id: 'opt_b',
        text: 'El Recall / Sensibilidad es 0.0% y el MCC es 0.0, evidenciando que el modelo no detecta ningún evento de interés.',
        isCorrect: true,
        explanation: '¡Correcto! Recall = TP/(TP+FN) = 0/500 = 0%. El MCC da 0, demostrando que el clasificador no tiene poder predictivo superior al azar.',
      },
      {
        id: 'opt_c',
        text: 'La Especificidad es 0%, por lo que falló en predecir los negativos.',
        isCorrect: false,
        explanation: 'Incorrecto. La especificidad TN/(TN+FP) = 99500/99500 = 100%, ya que todos los negativos fueron catalogados como tales.',
      },
      {
        id: 'opt_d',
        text: 'El F1-score es 0.995 debido al alto volumen de verdaderos negativos.',
        isCorrect: false,
        explanation: 'Incorrecto. F1 depende de Precision y Recall. Al ser TP = 0, el F1-score es exactamente 0.0.',
      },
    ],
  },
  {
    id: 'q2',
    title: '2. Selección de Métrica en Diagnóstico Médico Oncológico',
    scenario: 'Un equipo de ciencia de datos hospitalario debe seleccionar entre dos algoritmos de IA para predecir malignidad en nódulos pulmonares. Modelo A tiene Precision = 92% y Recall = 78%. Modelo B tiene Precision = 75% y Recall = 98%.',
    contextBadge: 'Toma de Decisiones Clínicas',
    matrix: {
      tp: 98,
      fp: 33,
      fn: 2,
      tn: 867,
    },
    question: 'Bajo el criterio de minimización del riesgo vital y asimetría de costos, ¿cuál decisión es metodológicamente correcta?',
    options: [
      {
        id: 'opt_a',
        text: 'Elegir el Modelo A porque tiene mayor Precisión y generará menos llamadas innecesarias al paciente.',
        isCorrect: false,
        explanation: 'Peligroso en medicina: un Recall de 78% implica que el 22% de pacientes con cáncer no serán diagnosticados a tiempo.',
      },
      {
        id: 'opt_b',
        text: 'Elegir el Modelo B porque maximiza el Recall (Sensibilidad), minimizando los Falsos Negativos (Error Tipo II).',
        isCorrect: true,
        explanation: '¡Excelente! En screening oncológico, un Falso Positivo solo implica una biopsia o imagen adicional, mientras que un Falso Negativo puede resultar fatal.',
      },
      {
        id: 'opt_c',
        text: 'Elegir el modelo con mayor Exactitud global sin importar el Recall.',
        isCorrect: false,
        explanation: 'Incorrecto. En problemas con consecuencias asimétricas, el desglose de errores (Recall vs Precision) prima sobre la exactitud.',
      },
      {
        id: 'opt_d',
        text: 'Descartar ambos modelos porque la Precisión debe ser siempre igual al Recall.',
        isCorrect: false,
        explanation: 'Incorrecto. En clasificación real casi siempre existe un trade-off inherente entre Precisión y Recall.',
      },
    ],
  },
  {
    id: 'q3',
    title: '3. Efecto de Mover el Umbral de Decisión (Threshold Shifting)',
    scenario: 'Un modelo de scoring probabilístico emite $P(y=1|X) \\in [0, 1]$. Inicialmente el umbral de corte es $\\theta = 0.50$. Debido a nuevas regulaciones anti-fraude, la dirección de analítica decide bajar el umbral a $\\theta = 0.25$.',
    contextBadge: 'Dinámica de Umbrales & Curva ROC',
    matrix: {
      tp: 450,
      fp: 180,
      fn: 50,
      tn: 4320,
    },
    question: '¿Qué impacto directo tendrá esta reducción del umbral en los cuadrantes de la Matriz de Confusión?',
    options: [
      {
        id: 'opt_a',
        text: 'Aumentará la Sensibilidad (Recall) al capturar más positivos, pero aumentarán los Falsos Positivos reduciendo la Precisión.',
        isCorrect: true,
        explanation: '¡Correcto! Al ser más agresivo clasificando como positivo (bajar el umbral de 0.50 a 0.25), se reducen los Falsos Negativos (sube Recall), pero inevitablemente se etiquetan más negativos como positivos (sube FP, baja Precisión).',
      },
      {
        id: 'opt_b',
        text: 'Disminuirá el Recall y aumentará la Especificidad.',
        isCorrect: false,
        explanation: 'Incorrecto. Eso ocurriría si aumentáramos el umbral a 0.75, volviéndonos más estrictos.',
      },
      {
        id: 'opt_c',
        text: 'Tanto la Precisión como el Recall aumentarán simultáneamente de forma monótona.',
        isCorrect: false,
        explanation: 'Incorrecto. Hay un trade-off directo: bajar el umbral amplía la red de captura, sacrificando pureza en las alarmas.',
      },
      {
        id: 'opt_d',
        text: 'La matriz de confusión se mantiene constante porque el modelo subyacente no fue reentrenado.',
        isCorrect: false,
        explanation: 'Incorrecto. La matriz de confusión depende directamente del umbral de decisión aplicado a las probabilidades predichas.',
      },
    ],
  },
  {
    id: 'q4',
    title: '4. Agregación Multiclase: Macro-Average vs Weighted-Average',
    scenario: 'En un modelo de 3 clases donde la Clase A tiene 10,000 muestras ($F_1 = 0.95$), la Clase B tiene 1,000 muestras ($F_1 = 0.80$) y la Clase C (crítica pero rara) tiene solo 50 muestras ($F_1 = 0.20$).',
    contextBadge: 'Evaluación Multiclase Avanzada',
    matrix: {
      tp: 9500,
      fp: 300,
      fn: 500,
      tn: 700,
    },
    question: '¿Por qué un científico de datos de maestría debe examinar el Macro-F1 en lugar de conformarse con el Weighted-F1?',
    options: [
      {
        id: 'opt_a',
        text: 'Porque el Weighted-F1 pondera por soporte, ocultando el pésimo rendimiento del modelo en la clase minoritaria C.',
        isCorrect: true,
        explanation: '¡Exacto! El Weighted-F1 dará ~0.93 porque la Clase A absorbe el 90% del peso, dando una falsa sensación de éxito. El Macro-F1 (promedio simple: (0.95+0.80+0.20)/3 = 0.65) expone de inmediato el fallo en la clase crítica C.',
      },
      {
        id: 'opt_b',
        text: 'Porque el Macro-F1 siempre es matemáticamente mayor que el Weighted-F1.',
        isCorrect: false,
        explanation: 'Incorrecto. Cuando las clases minoritarias tienen peor rendimiento, el Macro-F1 es significativamente menor que el Weighted-F1.',
      },
      {
        id: 'opt_c',
        text: 'Porque el Macro-F1 no requiere calcular la matriz de confusión multiclase.',
        isCorrect: false,
        explanation: 'Incorrecto. Ambas métricas requieren el cómputo de la matriz multiclase y las métricas One-vs-Rest.',
      },
      {
        id: 'opt_d',
        text: 'Porque la Clase C al tener 50 muestras debe ser descartada del cálculo estadístico.',
        isCorrect: false,
        explanation: 'Incorrecto. En data analytics las clases raras suelen ser precisamente las de mayor valor estratégico o riesgo.',
      },
    ],
  },
];

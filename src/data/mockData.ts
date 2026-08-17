import { TranslationJob, LanguageOption, UserSettings } from '../types';

export const LANGUAGES: LanguageOption[] = [
  { code: 'auto', name: 'Auto-Detect' },
  { code: 'en', name: 'English (US)' },
  { code: 'es', name: 'Spanish (Español)' },
  { code: 'de', name: 'German (Deutsch)' },
  { code: 'fr', name: 'French (Français)' },
  { code: 'ja', name: 'Japanese (日本語)' },
  { code: 'pt', name: 'Portuguese (Português)' },
  { code: 'zh', name: 'Chinese (Simplified)' },
  { code: 'it', name: 'Italian (Italiano)' },
];

export const INITIAL_SETTINGS: UserSettings = {
  interfaceLanguage: 'en',
  appearance: 'light',
  defaultTargetLanguage: 'es',
  autoOcr: true,
  preserveLayout: true,
  defaultGlossary: 'Engineering Glossary V2',
  apiEndpoint: 'https://api.doctranslate.internal/v1',
  confidenceThreshold: 85,
  enableNotifications: true,
};

export const SAMPLE_PAGES_MANUAL_TECNICO = [
  {
    pageNumber: 1,
    originalText: `TECHNICAL OPERATION MANUAL: INDUSTRIAL HYDRAULIC VALVE SYSTEM
Model: HV-9000-X Pro Series
Rev: 4.2.1 | Build 2026

1. GENERAL SYSTEM SPECIFICATIONS
The HV-9000-X is an electro-proportional hydraulic flow control valve engineered for high-pressure industrial machinery. Operating at pressures up to 350 bar (5076 psi), the internal spool assembly utilizes active micro-positioning sensors with sub-millisecond response latency.

SAFETY MANDATE:
Disconnect all auxiliary power coupling and discharge line pressure before performing seal replacement or circuit board maintenance.`,
    translatedText: `MANUAL TÉCNICO DE OPERACIÓN: SISTEMA DE VÁLVULA HIDRÁULICA INDUSTRIAL
Modelo: Serie HV-9000-X Pro
Rev: 4.2.1 | Compilación 2026

1. ESPECIFICACIONES GENERALES DEL SISTEMA
La HV-9000-X es una válvula electroproporcional de control de flujo hidráulico diseñada para maquinaria industrial de alta presión. Operando a presiones de hasta 350 bar (5076 psi), el conjunto de carrete interno utiliza sensores de microposicionamiento activo con latencia de respuesta inferior al milisegundo.

MANDATO DE SEGURIDAD:
Desconecte todo acoplamiento de energía auxiliar y descargue la presión de la línea antes de realizar el reemplazo de sellos o el mantenimiento de la placa de circuitos.`,
    callouts: [
      'ADVERTENCIA: Usar solo fluidos hidráulicos homologados ISO VG 46.',
      'Calibración de cero requerida tras cada 5,000 ciclos operativos.'
    ],
    glossaryTerms: [
      { term: 'electro-proportional', translation: 'electroproporcional', definition: 'Control modulation via electrical input signal.' },
      { term: 'spool assembly', translation: 'conjunto de carrete', definition: 'Cylindrical sliding component regulating fluid channels.' },
      { term: 'seal replacement', translation: 'reemplazo de sellos', definition: 'Maintenance routine for elastomeric O-rings.' }
    ]
  },
  {
    pageNumber: 2,
    originalText: `2. HYDRAULIC PRESSURE CURVE AND FLOW CHARACTERISTICS

The proportional solenoid directly commands the metering orifice diameter through dual pulse-width modulation (PWM). As fluid temperature increases between 40°C and 75°C, thermal compensation logic maintains volumetric efficiency within ±0.8%.

OPERATING PARAMETERS:
• Maximum Operating Pressure: 350 bar
• Nominal Flow Rate: 120 L/min @ Δp = 10 bar
• Fluid Viscosity Range: 15 to 380 mm²/s (cSt)
• Ambient Temperature Envelope: -20°C to +80°C`,
    translatedText: `2. CURVA DE PRESIÓN HIDRÁULICA Y CARACTERÍSTICAS DE FLUJO

El solenoide proporcional controla directamente el diámetro del orificio de medición a través de modulación por ancho de pulsos (PWM) dual. A medida que la temperatura del fluido aumenta entre 40°C y 75°C, la lógica de compensación térmica mantiene la eficiencia volumétrica dentro de ±0.8%.

PARÁMETROS OPERATIVOS:
• Presión Máxima de Operación: 350 bar
• Caudal Nominal: 120 L/min @ Δp = 10 bar
• Rango de Viscosidad del Fluido: 15 a 380 mm²/s (cSt)
• Rango de Temperatura Ambiente: -20°C a +80°C`,
    tables: [
      {
        headers: ['Parámetro', 'Valor Nominal', 'Tolerancia', 'Unidad'],
        rows: [
          ['Presión de Prueba', '420', '±5%', 'bar'],
          ['Tensión de Bobina', '24', '±10%', 'VDC'],
          ['Frecuencia PWM', '200', '±2', 'Hz'],
          ['Grado de Filtración', 'NAS 1638 Clase 7', 'Máx', '-']
        ]
      }
    ],
    glossaryTerms: [
      { term: 'solenoid', translation: 'solenoide', definition: 'Electromagnetic coil converting electric current to mechanical motion.' },
      { term: 'metering orifice', translation: 'orificio de medición', definition: 'Precision machined opening governing rate of fluid transfer.' }
    ]
  },
  {
    pageNumber: 3,
    originalText: `3. DIGITAL BUS INTERFACE & CANOPEN COMMUNICATION

The internal controller board integrates CANopen (CiA 408 device profile for fluid power technology). Diagnostic telemetry broadcasts real-time spool displacement, coil temperature, and accumulated duty cycle.`,
    translatedText: `3. INTERFAZ DE BUS DIGITAL Y COMUNICACIÓN CANOPEN

La placa de control interna integra CANopen (perfil de dispositivo CiA 408 para tecnología de potencia fluida). La telemetría diagnóstica transmite en tiempo real el desplazamiento del carrete, la temperatura de la bobina y el ciclo de trabajo acumulado.`,
    callouts: [
      'Terminación de 120 ohmios requerida en ambos extremos de la línea física del bus CAN.'
    ]
  },
  {
    pageNumber: 4,
    hasOcrWarning: true,
    ocrConfidence: 74,
    originalText: `[SCANNED DIAGRAM NOTE]
Note from field engineer (handwritten / scanned):
Check bypass valve seal torque before final pressurization test. Minimum 28 N·m with Loctite 243 threadlocker applied.`,
    translatedText: `[NOTA DE DIAGRAMA ESCANEADO - OCR APROXIMADO]
Nota del ingeniero de campo (manuscrita / escaneada):
Verifique el torque del sello de la válvula de derivación antes de la prueba final de presurización. Mínimo 28 N·m con sellador de roscas Loctite 243 aplicado.`,
    callouts: [
      'Aviso OCR: Texto extraído con confianza del 74% debido a caligrafía manuscrita y baja resolución.'
    ]
  }
];

export const MOCK_JOBS: TranslationJob[] = [
  {
    id: 'job_7721',
    filename: 'Manual_Tecnico.pdf',
    fileSize: '4.2 MB',
    fileSizeBytes: 4404019,
    sourceLang: 'EN',
    targetLang: 'ES',
    status: 'analyzing',
    progress: 45,
    statusMessage: 'Analyzing context & terminology...',
    estimatedTimeRemaining: '~2 mins',
    createdAt: 'Today, 10:40 AM',
    totalPages: 42,
    preserveLayout: true,
    ocrEnabled: true,
    glossaryName: 'Engineering Glossary V2',
    eventLogs: [
      { id: '1', timestamp: '10:02:15', message: "Document 'Manual_Tecnico.pdf' validated.", type: 'info' },
      { id: '2', timestamp: '10:02:45', message: 'Text extraction completed (42 pages).', type: 'info', pageNumber: 42 },
      { id: '3', timestamp: '10:03:10', message: 'Detecting OCR necessity: 3 pages scanned.', type: 'warning', pageNumber: 4 },
      { id: '4', timestamp: '10:03:15', message: 'Analyzing terminology against custom glossary...', type: 'info' },
      { id: '5', timestamp: '10:03:22', message: 'Applied 15 custom glossary domain terms.', type: 'success' },
    ],
    warnings: [
      {
        id: 'w1',
        type: 'ocr_low_confidence',
        title: 'Low Confidence OCR',
        description: 'Pages 4 & 12 required approximation due to low-resolution handwritten annotations.',
        pages: [4, 12],
        severity: 'medium'
      },
      {
        id: 'w2',
        type: 'table_structure',
        title: 'Complex Table Grid',
        description: 'Page 2 contains a 4x4 matrix preserved with responsive borders.',
        pages: [2],
        severity: 'low'
      }
    ],
    qualityMetrics: {
      ocrConfidence: 89,
      glossaryTermsCount: 15,
      grammarStatus: 'Passed',
      layoutFidelity: 99.2,
      detectedLanguage: 'English (US)',
      translatedLanguage: 'Spanish (Español)',
      estimatedCost: '$0.042',
      modelUsed: 'OCI Generative AI / Translation Model',
      totalTokens: 14280,
      untranslatedFragments: 0
    },
    pages: SAMPLE_PAGES_MANUAL_TECNICO
  },
  {
    id: 'job_8910',
    filename: 'Q3_Financial_Report_EN.pdf',
    fileSize: '3.8 MB',
    fileSizeBytes: 3984588,
    sourceLang: 'EN',
    targetLang: 'ES',
    status: 'completed',
    progress: 100,
    statusMessage: 'Translation Complete! Document ready for review.',
    estimatedTimeRemaining: '0s',
    createdAt: 'OCT 24, 14:30',
    completedAt: 'OCT 24, 14:32',
    duration: '2m 15s',
    totalPages: 28,
    preserveLayout: true,
    ocrEnabled: true,
    glossaryName: 'Finance & Banking Master V4',
    eventLogs: [
      { id: '1', timestamp: '14:30:00', message: "Document 'Q3_Financial_Report_EN.pdf' queued.", type: 'info' },
      { id: '2', timestamp: '14:30:12', message: 'Extracted 28 pages of tabular balance sheets.', type: 'info' },
      { id: '3', timestamp: '14:30:40', message: 'Synthesizing fiscal year terms and currency markers.', type: 'info' },
      { id: '4', timestamp: '14:31:30', message: 'Neural translation of financial statements complete.', type: 'success' },
      { id: '5', timestamp: '14:32:15', message: 'Vector PDF reconstruction complete.', type: 'success' }
    ],
    warnings: [
      {
        id: 'w_fin',
        type: 'font_substitution',
        title: 'Minor Font Substitution',
        description: 'HelveticaNeueLTPro mapped to standard clean sans-serif for font embedding.',
        pages: [1, 2],
        severity: 'low'
      }
    ],
    qualityMetrics: {
      ocrConfidence: 98,
      glossaryTermsCount: 34,
      grammarStatus: 'Passed',
      layoutFidelity: 99.8,
      detectedLanguage: 'English (US)',
      translatedLanguage: 'Spanish (Español)',
      estimatedCost: '$0.038',
      modelUsed: 'OCI Generative AI / Translation Model',
      totalTokens: 22400,
      untranslatedFragments: 0
    },
    pages: SAMPLE_PAGES_MANUAL_TECNICO
  },
  {
    id: 'job_9021',
    filename: 'Legal_Contract_Draft_v2.docx',
    fileSize: '1.4 MB',
    fileSizeBytes: 1468006,
    sourceLang: 'DE',
    targetLang: 'EN',
    status: 'translating',
    progress: 45,
    statusMessage: 'Translating legal articles 4 to 12...',
    estimatedTimeRemaining: '~1 min',
    createdAt: 'OCT 24, 10:15',
    totalPages: 16,
    preserveLayout: true,
    ocrEnabled: false,
    glossaryName: 'German Civil Code Terminology',
    eventLogs: [
      { id: '1', timestamp: '10:15:02', message: 'Parsing docx XML structure and clause numbers.', type: 'info' },
      { id: '2', timestamp: '10:15:20', message: 'Clause alignment verified across 32 paragraphs.', type: 'info' },
      { id: '3', timestamp: '10:15:45', message: 'Applying German Legal Terminology glossary.', type: 'info' }
    ],
    warnings: [],
    qualityMetrics: {
      ocrConfidence: 100,
      glossaryTermsCount: 18,
      grammarStatus: 'Passed',
      layoutFidelity: 100,
      detectedLanguage: 'German (Deutsch)',
      translatedLanguage: 'English (US)',
      estimatedCost: '$0.015',
      modelUsed: 'OCI Generative AI / Review Model',
      totalTokens: 8900,
      untranslatedFragments: 0
    },
    pages: SAMPLE_PAGES_MANUAL_TECNICO
  },
  {
    id: 'job_6412',
    filename: 'Scanned_Invoice_FR.pdf',
    fileSize: '5.6 MB',
    fileSizeBytes: 5872025,
    sourceLang: 'FR',
    targetLang: 'EN',
    status: 'failed',
    progress: 18,
    statusMessage: 'Failed: OCR Engine timed out on skewed 300dpi scan.',
    errorMessage: 'Low contrast on receipt barcode prevented automated OCR alignment.',
    estimatedTimeRemaining: 'N/A',
    createdAt: 'OCT 23, 09:15',
    totalPages: 4,
    preserveLayout: true,
    ocrEnabled: true,
    eventLogs: [
      { id: '1', timestamp: '09:15:01', message: 'Received scanned raster PDF.', type: 'info' },
      { id: '2', timestamp: '09:15:10', message: 'Initiated OCR preprocessing.', type: 'info' },
      { id: '3', timestamp: '09:15:35', message: 'Error: OCR confidence 31% below strict safety threshold.', type: 'error' }
    ],
    warnings: [
      {
        id: 'w_fail',
        type: 'ocr_low_confidence',
        title: 'OCR Unreadable Segment',
        description: 'Page 1 thermal receipt text contrast was insufficient for reliable token generation.',
        pages: [1],
        severity: 'high'
      }
    ],
    qualityMetrics: {
      ocrConfidence: 31,
      glossaryTermsCount: 0,
      grammarStatus: 'Failed',
      layoutFidelity: 40,
      detectedLanguage: 'French (Français)',
      translatedLanguage: 'English (US)',
      estimatedCost: '$0.005',
      modelUsed: 'Oracle AI OCR Pipeline',
      totalTokens: 1200,
      untranslatedFragments: 14
    },
    pages: []
  },
  {
    id: 'job_5541',
    filename: 'Marketing_Brochure_Draft.pdf',
    fileSize: '8.2 MB',
    fileSizeBytes: 8598323,
    sourceLang: 'FR',
    targetLang: 'EN',
    status: 'failed',
    progress: 30,
    statusMessage: 'Failed: Corrupted embedded EPS graphic.',
    errorMessage: 'Corrupted EPS stream on page 3. File validation stopped.',
    estimatedTimeRemaining: 'N/A',
    createdAt: 'OCT 23, 16:45',
    totalPages: 8,
    preserveLayout: true,
    ocrEnabled: false,
    eventLogs: [
      { id: '1', timestamp: '16:45:00', message: 'Validating PDF dictionary stream.', type: 'info' },
      { id: '2', timestamp: '16:45:18', message: 'Error: Invalid trailer stream offset.', type: 'error' }
    ],
    warnings: [],
    qualityMetrics: {
      ocrConfidence: 0,
      glossaryTermsCount: 0,
      grammarStatus: 'Failed',
      layoutFidelity: 0,
      detectedLanguage: 'French (Français)',
      translatedLanguage: 'English (US)',
      estimatedCost: '$0.00',
      modelUsed: 'OCI Generative AI / Review Model',
      totalTokens: 0,
      untranslatedFragments: 0
    },
    pages: []
  },
  {
    id: 'job_4310',
    filename: 'Architecture_Specs.docx',
    fileSize: '2.1 MB',
    fileSizeBytes: 2202009,
    sourceLang: 'EN',
    targetLang: 'JA',
    status: 'translating',
    progress: 45,
    statusMessage: 'Translating diagrams and microservice taxonomy...',
    estimatedTimeRemaining: '~1 min',
    createdAt: 'OCT 24, 11:05',
    totalPages: 12,
    preserveLayout: true,
    ocrEnabled: false,
    glossaryName: 'Cloud Infrastructure & Kubernetes Glossary',
    eventLogs: [
      { id: '1', timestamp: '11:05:00', message: 'Uploaded cloud architecture blueprint document.', type: 'info' },
      { id: '2', timestamp: '11:05:15', message: 'Extracting vector topologies and ASCII flowcharts.', type: 'info' },
      { id: '3', timestamp: '11:05:40', message: 'Applying Japanese technical honorific conventions.', type: 'info' }
    ],
    warnings: [],
    qualityMetrics: {
      ocrConfidence: 100,
      glossaryTermsCount: 22,
      grammarStatus: 'Passed',
      layoutFidelity: 99.5,
      detectedLanguage: 'English (US)',
      translatedLanguage: 'Japanese (日本語)',
      estimatedCost: '$0.024',
      modelUsed: 'OCI Generative AI / Translation Model',
      totalTokens: 11200,
      untranslatedFragments: 0
    },
    pages: SAMPLE_PAGES_MANUAL_TECNICO
  }
];

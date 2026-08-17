import React, { useState } from 'react';
import { X, Workflow, CheckCircle2, AlertTriangle, RefreshCw, XCircle, ArrowRight, ShieldCheck } from 'lucide-react';

interface FlowDiagramModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FlowDiagramModal: React.FC<FlowDiagramModalProps> = ({ isOpen, onClose }) => {
  const [activeFlowTab, setActiveFlowTab] = useState<'main' | 'ocr' | 'retry' | 'permanent' | 'cancel'>('main');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-6 border border-slate-200 relative max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Workflow className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">System Architecture & User Flows</h3>
              <p className="text-xs text-slate-500">Pipeline specification implemented across DocTranslate AI</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Flow Tabs */}
        <div className="flex flex-wrap gap-1.5 pt-4 pb-2 border-b border-slate-100">
          <button
            onClick={() => setActiveFlowTab('main')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeFlowTab === 'main' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            1. Flujo Principal (Éxito)
          </button>

          <button
            onClick={() => setActiveFlowTab('ocr')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeFlowTab === 'ocr' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            2. Flujo con OCR
          </button>

          <button
            onClick={() => setActiveFlowTab('retry')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeFlowTab === 'retry' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            3. Error Recuperable (Backoff)
          </button>

          <button
            onClick={() => setActiveFlowTab('permanent')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeFlowTab === 'permanent' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            4. Error Permanente
          </button>

          <button
            onClick={() => setActiveFlowTab('cancel')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeFlowTab === 'cancel' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            5. Cancelación
          </button>
        </div>

        {/* Tab Content */}
        <div className="py-4 overflow-y-auto flex-1 space-y-4 text-xs">
          
          {activeFlowTab === 'main' && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 text-sm">Flujo Principal: Traducción Exitosa</h4>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 font-mono text-[11px]">
                <div className="flex items-center space-x-2 text-slate-700">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px]">1</span>
                  <span>Usuario abre la app → Selecciona PDF & Idioma destino</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-700">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px]">2</span>
                  <span>Backend valida archivo (tamaño, formato) → Crea Job asíncrono</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-700">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px]">3</span>
                  <span>Usuario consulta progreso vía SSE/Polling en vivo</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-700">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px]">4</span>
                  <span>Trabajo finalizado → Usuario revisa advertencias & glosario</span>
                </div>
                <div className="flex items-center space-x-2 text-emerald-700 font-semibold">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px]">5</span>
                  <span>Previsualiza resultado interactivo → Descarga PDF traducido</span>
                </div>
              </div>
            </div>
          )}

          {activeFlowTab === 'ocr' && (
            <div className="space-y-4">
              <h4 className="font-bold text-amber-900 text-sm">Flujo con OCR Inteligente</h4>
              <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200 space-y-3 font-mono text-[11px]">
                <p className="text-amber-900">Subir PDF → Detectar ausencia de texto vectorial</p>
                <p className="text-amber-900">→ Ejecutar motor OCR neuronal (300dpi)</p>
                <p className="text-amber-900">→ Calcular score de confianza por página (ej. 74%)</p>
                <p className="text-amber-900">→ Mostrar advertencias al usuario en panel de calidad</p>
                <p className="text-amber-900">→ Extraer estructura y continuar traducción conservando bounding boxes</p>
              </div>
            </div>
          )}

          {activeFlowTab === 'retry' && (
            <div className="space-y-4">
              <h4 className="font-bold text-indigo-900 text-sm">Flujo con Error Recuperable (Self-Healing)</h4>
              <div className="bg-indigo-50/60 p-4 rounded-xl border border-indigo-200 space-y-3 font-mono text-[11px]">
                <p className="text-indigo-900">Llamada OCI / AI falla (ej. 429 RateLimit o timeout de red)</p>
                <p className="text-indigo-900">→ Clasificar error como transitorio</p>
                <p className="text-indigo-900">→ Guardar evento en log de auditoría</p>
                <p className="text-indigo-900">→ Aplicar backoff exponencial (1s, 2s, 4s)</p>
                <p className="text-indigo-900">→ Reintentar y continuar desde el último fragmento válido sin reiniciar</p>
              </div>
            </div>
          )}

          {activeFlowTab === 'permanent' && (
            <div className="space-y-4">
              <h4 className="font-bold text-rose-900 text-sm">Flujo con Error Permanente</h4>
              <div className="bg-rose-50/60 p-4 rounded-xl border border-rose-200 space-y-3 font-mono text-[11px]">
                <p className="text-rose-900">Credencial inválida o archivo PDF corrupto/protegido</p>
                <p className="text-rose-900">→ Detener pipeline inmediatamente</p>
                <p className="text-rose-900">→ Marcar estado como 'FAILED'</p>
                <p className="text-rose-900">→ Emitir notificación clara con causa raíz</p>
                <p className="text-rose-900">→ Permitir reintentar con archivo corregido</p>
              </div>
            </div>
          )}

          {activeFlowTab === 'cancel' && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 text-sm">Flujo de Cancelación Controlada</h4>
              <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 space-y-3 font-mono text-[11px]">
                <p className="text-slate-800">Usuario presiona botón 'Cancel Translation'</p>
                <p className="text-slate-800">→ Worker finaliza fragmento atómico actual</p>
                <p className="text-slate-800">→ Limpia almacenamiento temporal y memoria</p>
                <p className="text-slate-800">→ Actualiza estado del Job a 'CANCELLED'</p>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold"
          >
            Close Inspector
          </button>
        </div>

      </div>
    </div>
  );
};

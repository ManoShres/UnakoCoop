import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useLanguageStore } from '../../store/useLanguageStore';
import {
  StrokePath,
  BiometricCaptureMode,
  BiometricSpecimen,
  createBiometricSpecimen,
  calculateStrokeHash,
  getStrokesBoundingBox,
} from '../../utils/signatureCanvas';
import {
  X,
  PenTool,
  Fingerprint,
  RotateCcw,
  Trash2,
  Download,
  CheckCircle2,
  ShieldCheck,
  Hash,
} from 'lucide-react';

interface BiometricSignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberId?: string;
  memberNo?: string;
  memberName?: string;
  defaultMode?: BiometricCaptureMode;
  onSave?: (specimen: BiometricSpecimen) => void;
}

export const BiometricSignatureModal: React.FC<BiometricSignatureModalProps> = ({
  isOpen,
  onClose,
  memberId = 'M-GUEST',
  memberNo = 'UKO-0000',
  memberName = 'सदस्य',
  defaultMode = 'SIGNATURE',
  onSave,
}) => {
  const { t } = useLanguageStore();

  const [mode, setMode] = useState<BiometricCaptureMode>(defaultMode);
  const [inkColor, setInkColor] = useState<string>('#1d4ed8'); // Banking Royal Blue default
  const [strokeWidth, setStrokeWidth] = useState<number>(2.5);
  const [strokes, setStrokes] = useState<StrokePath[]>([]);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [currentStroke, setCurrentStroke] = useState<StrokePath | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Redraw canvas whenever strokes change or current drawing update
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw baseline watermark guide
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(30, canvas.height - 40);
    ctx.lineTo(canvas.width - 30, canvas.height - 40);
    ctx.stroke();
    ctx.setLineDash([]);

    // Watermark text in background
    ctx.font = 'bold 11px sans-serif';
    ctx.fillStyle = '#cbd5e1';
    ctx.textAlign = 'center';
    ctx.fillText(
      mode === 'SIGNATURE'
        ? t('यहाँ हस्ताक्षर गर्नुहोस्', 'Sign inside the box')
        : t('यहाँ ल्याप्चे लगाउनुहोस्', 'Stamp thumbprint here'),
      canvas.width / 2,
      canvas.height / 2
    );

    // Helper to draw a single stroke
    const drawStroke = (stroke: StrokePath) => {
      if (stroke.points.length < 1) return;
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
    };

    // Draw completed strokes
    strokes.forEach(drawStroke);

    // Draw in-progress stroke
    if (currentStroke) {
      drawStroke(currentStroke);
    }
  }, [strokes, currentStroke, mode, t]);

  useEffect(() => {
    if (isOpen) {
      renderCanvas();
    }
  }, [isOpen, renderCanvas]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Pointer event handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setCurrentStroke({
      points: [{ x, y, time: Date.now() }],
      color: inkColor,
      width: strokeWidth,
    });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentStroke) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCurrentStroke((prev) =>
      prev
        ? {
            ...prev,
            points: [...prev.points, { x, y, time: Date.now() }],
          }
        : null
    );
  };

  const handlePointerUp = () => {
    if (isDrawing && currentStroke && currentStroke.points.length > 0) {
      setStrokes((prev) => [...prev, currentStroke]);
    }
    setIsDrawing(false);
    setCurrentStroke(null);
  };

  const handleClear = () => {
    setStrokes([]);
    setCurrentStroke(null);
  };

  const handleUndo = () => {
    setStrokes((prev) => prev.slice(0, -1));
  };

  const strokeHash = useMemo(() => {
    return calculateStrokeHash(strokes);
  }, [strokes]);

  const boundingBox = useMemo(() => {
    return getStrokesBoundingBox(strokes);
  }, [strokes]);

  const handleSave = () => {
    if (strokes.length === 0) return;
    const specimen = createBiometricSpecimen(memberId, memberNo, mode, strokes, 500, 240);
    if (onSave) {
      onSave(specimen);
    }
    onClose();
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas || strokes.length === 0) return;
    const link = document.createElement('a');
    link.download = `UNAKO-${memberNo}-${mode}-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-xl w-full p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              {mode === 'SIGNATURE' ? <PenTool className="size-5" /> : <Fingerprint className="size-5" />}
            </div>
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-base">
                {mode === 'SIGNATURE'
                  ? t('डिजिटल हस्ताक्षर क्यानभास', 'Digital Signature Pad')
                  : t('औंठाछाप (ल्याप्चे) डिजिटल संकलन', 'Digital Thumbprint Capture')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {memberName} ({memberNo}) • {t('काउन्टर केवाईसी प्रमाणीकरण', 'Counter KYC Verification')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="grid grid-cols-3 gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => setMode('SIGNATURE')}
            className={`py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
              mode === 'SIGNATURE'
                ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <PenTool className="size-3.5" />
            <span>{t('हस्ताक्षर', 'Signature')}</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('THUMBPRINT_LEFT')}
            className={`py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
              mode === 'THUMBPRINT_LEFT'
                ? 'bg-white dark:bg-slate-900 text-purple-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Fingerprint className="size-3.5" />
            <span>{t('बायाँ ल्याप्चे', 'Left Thumb')}</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('THUMBPRINT_RIGHT')}
            className={`py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
              mode === 'THUMBPRINT_RIGHT'
                ? 'bg-white dark:bg-slate-900 text-purple-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Fingerprint className="size-3.5" />
            <span>{t('दायाँ ल्याप्चे', 'Right Thumb')}</span>
          </button>
        </div>

        {/* Interactive Drawing Canvas */}
        <div className="rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 overflow-hidden shadow-inner bg-white">
          <canvas
            ref={canvasRef}
            width={500}
            height={220}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            style={{ touchAction: 'none' }}
            className="w-full h-52 cursor-crosshair block"
          />
        </div>

        {/* Controls Toolbar: Ink, Stroke Width, Undo, Clear */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400">{t('मसी:', 'Ink:')}</span>
            <div className="flex gap-1.5">
              {[
                { color: '#1d4ed8', label: 'Royal Blue' },
                { color: '#0f172a', label: 'Formal Black' },
                { color: '#4338ca', label: 'Stamp Violet' },
              ].map((c) => (
                <button
                  key={c.color}
                  type="button"
                  onClick={() => setInkColor(c.color)}
                  className={`size-6 rounded-full border-2 transition ${
                    inkColor === c.color ? 'border-slate-900 dark:border-white scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c.color }}
                  title={c.label}
                />
              ))}
            </div>

            <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

            <span className="text-[11px] font-bold text-slate-400">{t('मोटाइ:', 'Width:')}</span>
            <div className="flex gap-1">
              {[
                { w: 1.5, label: 'Thin' },
                { w: 2.5, label: 'Med' },
                { w: 4.0, label: 'Bold' },
              ].map((sw) => (
                <button
                  key={sw.w}
                  type="button"
                  onClick={() => setStrokeWidth(sw.w)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                    strokeWidth === sw.w
                      ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                  }`}
                >
                  {sw.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleUndo}
              disabled={strokes.length === 0}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 transition"
              title={t('अघिल्लो स्ट्रोक हटाउनुहोस्', 'Undo last stroke')}
            >
              <RotateCcw className="size-4" />
            </button>
            <button
              type="button"
              onClick={handleClear}
              disabled={strokes.length === 0}
              className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 dark:bg-slate-800 dark:hover:bg-rose-950/40 disabled:opacity-40 transition"
              title={t('सबै मेटाउनुहोस्', 'Clear all')}
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        </div>

        {/* Biometric Metadata & Tamper-Proof Stamp */}
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-emerald-500" />
            <span>
              {t('स्ट्रोक संख्या:', 'Strokes:')} <strong>{strokes.length}</strong>
            </span>
            <span>•</span>
            <span>
              {boundingBox.width > 0 ? `${boundingBox.width}×${boundingBox.height}px` : t('खाली', 'Empty')}
            </span>
          </div>

          <div className="flex items-center gap-1 font-mono text-[10px] text-slate-400">
            <Hash className="size-3" />
            <span>{strokeHash}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={handleDownload}
            disabled={strokes.length === 0}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 hover:bg-slate-50 disabled:opacity-40 transition"
          >
            <Download className="size-4" />
            <span>{t('डाउनलोड', 'Download')}</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={strokes.length === 0}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 disabled:opacity-50 transition"
          >
            <CheckCircle2 className="size-4" />
            <span>{t('प्रमाणित गरी सुरक्षित गर्नुहोस्', 'Verify & Save Specimen')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

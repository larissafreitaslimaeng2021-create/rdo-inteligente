import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Square,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  X,
  FileCheck,
  Edit3,
  HardHat,
  Volume2,
  Copy,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import type { StructuredAiExtraction, MaoDeObraItem, EquipamentoItem, MaterialItem } from '../types';

interface VoiceRdoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyExtraction: (data: StructuredAiExtraction) => void;
}

type Step = 'idle' | 'recording' | 'processing' | 'review';

export const VoiceRdoModal: React.FC<VoiceRdoModalProps> = ({ isOpen, onClose, onApplyExtraction }) => {
  const [step, setStep] = useState<Step>('idle');
  const [recordingTime, setRecordingTime] = useState(0);
  const [rawText, setRawText] = useState('');
  const [useTextInput, setUseTextInput] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Extracted data state for human review
  const [extraction, setExtraction] = useState<StructuredAiExtraction | null>(null);

  // MediaRecorder refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen) {
      // Reset state on close
      stopRecordingCleanup();
      setStep('idle');
      setRecordingTime(0);
      setErrorMsg(null);
    }
  }, [isOpen]);

  const stopRecordingCleanup = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }
  };

  const startRecording = async () => {
    setErrorMsg(null);
    audioChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processAudioWithAi(audioBlob);
      };

      mediaRecorder.start(250);
      setStep('recording');
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.warn('Erro ao acessar microfone:', err);
      setErrorMsg(
        'Não foi possível acessar o microfone. Verifique as permissões do navegador ou utilize a opção de digitar/colar o relato abaixo.'
      );
      setUseTextInput(true);
      setStep('idle');
    }
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setStep('processing');
    }
  };

  // Convert blob to base64 and call server API
  const processAudioWithAi = async (audioBlob: Blob) => {
    setStep('processing');
    setErrorMsg(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        await sendPayloadToServer({ audioBase64: base64Data, mimeType: audioBlob.type || 'audio/webm' });
      };
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Falha ao preparar o áudio para análise.');
      setStep('idle');
    }
  };

  const processTextWithAi = async () => {
    if (!rawText.trim()) {
      setErrorMsg('Digite ou cole o relato de campo antes de processar.');
      return;
    }
    setStep('processing');
    setErrorMsg(null);
    await sendPayloadToServer({ text: rawText.trim() });
  };

  const sendPayloadToServer = async (payload: { text?: string; audioBase64?: string; mimeType?: string }) => {
    try {
      const res = await fetch('/api/extract-rdo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Erro no processamento da IA.');
      }

      const result: StructuredAiExtraction = await res.json();
      setExtraction(result);
      setStep('review');
    } catch (err: any) {
      console.error('Erro na extração:', err);
      setErrorMsg(err.message || 'Falha ao processar relato com Gemini.');
      setStep('idle');
    }
  };

  const handleApply = () => {
    if (extraction) {
      onApplyExtraction(extraction);
      onClose();
    }
  };

  const insertPromptExample = () => {
    setUseTextInput(true);
    setRawText(
      'Hoje trabalhamos na concretagem das vigas do segundo pavimento. Foram 12 funcionários, sendo 4 pedreiros, 6 serventes e 2 carpinteiros. A concretagem chegou a aproximadamente 80%. Pela manhã tivemos chuva e o serviço ficou parado por cerca de uma hora. Recebemos 50 sacos de cimento. Não houve acidente.'
    );
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Gravar RDO com Inteligência Artificial
              </h3>
              <p className="text-[11px] text-slate-400">
                Transforme relatos falados de campo em dados estruturados com Gemini
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Workflow State Tracker */}
        <div className="px-5 py-2.5 bg-slate-950/90 border-b border-slate-800/80 flex items-center justify-between text-[11px] font-medium text-slate-400 overflow-x-auto">
          <div className={`flex items-center gap-1.5 ${step === 'recording' ? 'text-amber-400 font-bold' : step !== 'idle' ? 'text-blue-400' : ''}`}>
            <span className="w-4 h-4 rounded-full border flex items-center justify-center text-[10px]">1</span>
            <span>Gravação</span>
          </div>
          <ChevronRight className="w-3 h-3 text-slate-600" />
          <div className={`flex items-center gap-1.5 ${step === 'processing' ? 'text-amber-400 font-bold animate-pulse' : step === 'review' ? 'text-blue-400' : ''}`}>
            <span className="w-4 h-4 rounded-full border flex items-center justify-center text-[10px]">2</span>
            <span>Processando IA</span>
          </div>
          <ChevronRight className="w-3 h-3 text-slate-600" />
          <div className={`flex items-center gap-1.5 ${step === 'review' ? 'text-amber-400 font-bold' : ''}`}>
            <span className="w-4 h-4 rounded-full border flex items-center justify-center text-[10px]">3</span>
            <span>Rascunho e Revisão</span>
          </div>
          <ChevronRight className="w-3 h-3 text-slate-600" />
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full border flex items-center justify-center text-[10px]">4</span>
            <span>Confirmar</span>
          </div>
        </div>

        {/* Content Body based on step */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-800/80 text-red-200 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: IDLE / RECORDING */}
          {(step === 'idle' || step === 'recording') && (
            <div className="space-y-6">
              {!useTextInput ? (
                <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
                  {step === 'idle' ? (
                    <>
                      <button
                        type="button"
                        onClick={startRecording}
                        className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 flex items-center justify-center shadow-xl shadow-amber-950/60 transition-all hover:scale-105 active:scale-95 group"
                      >
                        <Mic className="w-8 h-8 group-hover:scale-110 transition-transform" />
                      </button>
                      <div>
                        <h4 className="text-sm font-bold text-white">Toque no microfone para falar</h4>
                        <p className="text-xs text-slate-400 mt-1 max-w-sm">
                          Fale naturalmente sobre os serviços, clima, funcionários presentes, máquinas, materiais recebidos e imprevistos.
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Pulsing Recording State */}
                      <div className="relative flex items-center justify-center">
                        <div className="absolute w-28 h-28 rounded-full bg-red-500/20 animate-ping" />
                        <button
                          type="button"
                          onClick={stopRecording}
                          className="relative w-20 h-20 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-xl shadow-red-950/60 transition-all active:scale-95"
                        >
                          <Square className="w-7 h-7 fill-white" />
                        </button>
                      </div>
                      <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-800 text-red-300 text-xs font-mono font-bold animate-pulse">
                          <span className="w-2 h-2 rounded-full bg-red-500" />
                          Gravando: {formatTimer(recordingTime)}
                        </div>
                        <p className="text-xs text-slate-300 mt-2 font-medium">Toque no botão para finalizar o relato e processar</p>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                /* Manual Text input for noisy environment */
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300">
                      Relato Bruto de Campo (Voz transcrita ou digitada)
                    </label>
                    <button
                      type="button"
                      onClick={insertPromptExample}
                      className="text-[11px] text-amber-400 hover:text-amber-300 font-medium underline flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" /> Usar relato de exemplo da obra
                    </button>
                  </div>
                  <textarea
                    rows={5}
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder="Ex: Hoje trabalhamos na concretagem das vigas do segundo pavimento. Foram 12 funcionários, sendo 4 pedreiros, 6 serventes e 2 carpinteiros..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={processTextWithAi}
                      className="py-2 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold shadow-md shadow-amber-950/30 flex items-center gap-1.5 transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Processar Relato com Gemini
                    </button>
                  </div>
                </div>
              )}

              {/* Toggle text vs voice */}
              {step === 'idle' && (
                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <button
                    type="button"
                    onClick={() => setUseTextInput(!useTextInput)}
                    className="text-blue-400 hover:text-blue-300 flex items-center gap-1.5"
                  >
                    {useTextInput ? <Mic className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
                    {useTextInput ? 'Alternar para Gravação por Voz' : 'Ambiente ruidoso? Digite ou cole o relato'}
                  </button>

                  <button
                    type="button"
                    onClick={insertPromptExample}
                    className="text-amber-400/90 hover:text-amber-300 text-[11px] font-medium"
                  >
                    Testar exemplo prático
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: PROCESSING WITH AI */}
          {step === 'processing' && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative flex items-center justify-center">
                <div className="w-16 h-16 rounded-full border-4 border-amber-500/20 border-t-amber-400 animate-spin" />
                <Sparkles className="w-6 h-6 text-amber-400 absolute" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Processando relato com Gemini...</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  Identificando atividades, efetivo de mão de obra, materiais, clima e ocorrências de segurança sem inventar informações.
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: REVIEW EXTRACTED DRAFT */}
          {step === 'review' && extraction && (
            <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-1">
              {/* Warnings / Requer confirmação banner */}
              {extraction.avisos && extraction.avisos.length > 0 && (
                <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/80 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>Atenção: Informações que requerem confirmação do engenheiro</span>
                  </div>
                  <ul className="list-disc list-inside text-[11px] text-amber-200/90 space-y-0.5">
                    {extraction.avisos.map((aviso, idx) => (
                      <li key={idx}>{aviso}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Human confirmation disclaimer */}
              <div className="p-2.5 rounded-lg bg-blue-950/40 border border-blue-900/60 flex items-center gap-2 text-[11px] text-blue-200">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                <span>
                  <strong>Validação obrigatória:</strong> A IA estruturou somente o que foi relatado. Revise os campos antes de aplicar ao RDO.
                </span>
              </div>

              {/* Grid of Extracted Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Clima */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Condições Climáticas
                  </span>
                  <div className="text-slate-200 space-y-0.5">
                    <p>
                      <strong>Manhã:</strong> {extraction.climaManha || 'Bom'}
                    </p>
                    <p>
                      <strong>Tarde:</strong> {extraction.climaTarde || 'Bom'}
                    </p>
                  </div>
                </div>

                {/* Avanço Físico */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Avanço Informado
                  </span>
                  <p className="text-lg font-bold text-emerald-400">
                    {extraction.percentualAvanco !== null && extraction.percentualAvanco !== undefined
                      ? `${extraction.percentualAvanco}%`
                      : 'Não especificado no relato'}
                  </p>
                  {extraction.etapasFrentes && (
                    <p className="text-[11px] text-slate-400 mt-1">
                      <strong>Frente:</strong> {extraction.etapasFrentes}
                    </p>
                  )}
                </div>
              </div>

              {/* Atividades Executadas */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Atividades Executadas Identificadas
                </span>
                <p className="text-slate-200 text-xs leading-relaxed">
                  {extraction.atividadesExecutadas || 'Nenhuma atividade explícita identificada.'}
                </p>
              </div>

              {/* Mão de Obra */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Efetivo de Mão de Obra ({extraction.maoDeObra?.length || 0} funções)
                  </span>
                </div>
                {extraction.maoDeObra && extraction.maoDeObra.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {extraction.maoDeObra.map((item, idx) => (
                      <div key={idx} className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                        <p className="font-semibold text-slate-200">{item.funcao}</p>
                        <p className="text-[11px] text-blue-400 font-bold">{item.quantidade} colaboradores</p>
                        {item.empresa && <p className="text-[10px] text-slate-500 truncate">{item.empresa}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 italic text-[11px]">Nenhum efetivo citado no relato.</p>
                )}
              </div>

              {/* Materiais e Suprimentos */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Materiais Recebidos ou Utilizados
                </span>
                {extraction.materiais && extraction.materiais.length > 0 ? (
                  <div className="space-y-1.5">
                    {extraction.materiais.map((mat, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs"
                      >
                        <span className="text-slate-200">{mat.descricao}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-amber-400">{mat.quantidade}</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                              mat.tipo === 'Recebido' ? 'bg-emerald-950 text-emerald-300' : 'bg-blue-950 text-blue-300'
                            }`}
                          >
                            {mat.tipo}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 italic text-[11px]">Nenhum material citado no relato.</p>
                )}
              </div>

              {/* Ocorrências e Segurança */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Ocorrências / Imprevistos
                  </span>
                  <p className="text-slate-200">
                    {extraction.ocorrencias || 'Sem ocorrências anormais citadas.'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Segurança do Trabalho
                  </span>
                  <p className="text-slate-200">
                    {extraction.seguranca || 'Nenhum acidente relatado.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions Footer */}
        <div className="px-5 py-3.5 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between">
          {step === 'review' ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setStep('idle');
                  setExtraction(null);
                }}
                className="py-2 px-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Gravar Novamente
              </button>

              <button
                type="button"
                onClick={handleApply}
                className="py-2 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold text-xs shadow-lg shadow-blue-900/40 flex items-center gap-2 transition-all active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" /> Confirmar e Aplicar ao RDO
              </button>
            </>
          ) : (
            <div className="flex justify-end w-full">
              <button
                type="button"
                onClick={onClose}
                className="py-2 px-4 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-semibold"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  MinusIcon,
  SparklesIcon, 
  PrinterIcon, 
  ArrowDownTrayIcon, 
  TrashIcon,
  ChevronDoubleRightIcon,
  AcademicCapIcon,
  ClipboardDocumentCheckIcon,
  ViewColumnsIcon,
  Squares2X2Icon,
  CheckBadgeIcon,
  BookOpenIcon,
  CalculatorIcon,
  BeakerIcon,
  GlobeEuropeAfricaIcon,
  LanguageIcon,
  PaintBrushIcon,
  MusicalNoteIcon,
  SunIcon,
  HeartIcon,
  CpuChipIcon,
  MagnifyingGlassIcon,
  ChatBubbleLeftRightIcon,
  FireIcon,
  DocumentTextIcon,
  StarIcon,
  UserIcon,
  PuzzlePieceIcon,
  RectangleGroupIcon,
  GlobeAltIcon,
  MegaphoneIcon,
  CheckIcon,
  ArrowRightIcon,
  XMarkIcon,
  AdjustmentsVerticalIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { LearningSituation, INITIAL_STATE, Activity, CurricularElement } from './types';
import { generateLearningSituation, getCurricularElements } from './services/geminiService';

const LOGO_URL = "https://colegiosanjosehijascaridad.es/home/wp-content/uploads/2018/04/circular-San-Jose-Alicante-PNG_Mesa-de-trabajo-1-2-e1676302507283.png";

const ASIGNATURA_ICONS: Record<string, React.ReactNode> = {
  "Crecimiento en Armonía": <HeartIcon className="w-4 h-4" />,
  "Descubrimiento y Exploración del Entorno": <MagnifyingGlassIcon className="w-4 h-4" />,
  "Comunicación y Representación de la Realidad": <MegaphoneIcon className="w-4 h-4" />,
  "Lengua Castellana y Literatura": <DocumentTextIcon className="w-4 h-4" />,
  "Matemáticas": <CalculatorIcon className="w-4 h-4" />,
  "Ciencias de la Naturaleza": <BeakerIcon className="w-4 h-4" />,
  "Biología y Geología": <BeakerIcon className="w-4 h-4" />,
  "Física y Química": <FireIcon className="w-4 h-4" />,
  "Ciencias Sociales": <GlobeAltIcon className="w-4 h-4" />,
  "Geografía e Historia": <GlobeEuropeAfricaIcon className="w-4 h-4" />,
  "Inglés": <LanguageIcon className="w-4 h-4" />,
  "Francés": <LanguageIcon className="w-4 h-4" />,
  "Educación Física": <FireIcon className="w-4 h-4" />,
  "Educación Artística": <PaintBrushIcon className="w-4 h-4" />,
  "Educación Plástica": <PaintBrushIcon className="w-4 h-4" />,
  "Música": <MusicalNoteIcon className="w-4 h-4" />,
  "Religión": <SunIcon className="w-4 h-4" />,
  "Valores Cívicos": <CheckBadgeIcon className="w-4 h-4" />,
  "Valores Éticos": <CheckBadgeIcon className="w-4 h-4" />,
  "Tecnología y Digitalización": <CpuChipIcon className="w-4 h-4" />
};

const ETAPAS_DATA = {
  "Infantil": {
    color: "rose",
    icon: <PuzzlePieceIcon className="w-5 h-5" />,
    cursos: ["3 años", "4 años", "5 años"],
    asignaturas: [
      "Crecimiento en Armonía",
      "Descubrimiento y Exploración del Entorno",
      "Comunicación y Representación de la Realidad"
    ]
  },
  "Primaria": {
    color: "sky",
    icon: <BookOpenIcon className="w-5 h-5" />,
    cursos: ["1º Primaria", "2º Primaria", "3º Primaria", "4º Primaria", "5º Primaria", "6º Primaria"],
    asignaturas: [
      "Lengua Castellana y Literatura",
      "Matemáticas",
      "Ciencias de la Naturaleza",
      "Ciencias Sociales",
      "Inglés",
      "Educación Física",
      "Educación Artística",
      "Religión",
      "Valores Cívicos"
    ]
  },
  "ESO": {
    color: "indigo",
    icon: <RectangleGroupIcon className="w-5 h-5" />,
    cursos: ["1º ESO", "2º ESO", "3º ESO", "4º ESO"],
    asignaturas: [
      "Geografía e Historia",
      "Lengua Castellana y Literatura",
      "Matemáticas",
      "Biología y Geología",
      "Física y Química",
      "Inglés",
      "Francés",
      "Educación Física",
      "Tecnología y Digitalización",
      "Educación Plástica",
      "Música",
      "Religión",
      "Valores Éticos"
    ]
  }
};

type EtapaKey = keyof typeof ETAPAS_DATA;

const App: React.FC = () => {
  const [data, setData] = useState<LearningSituation>(INITIAL_STATE);
  const [loading, setLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [selectedEtapa, setSelectedEtapa] = useState<EtapaKey | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);

  // Estados para el panel de selección curricular
  const [availableElements, setAvailableElements] = useState<CurricularElement[]>([]);
  const [selectedElementIds, setSelectedElementIds] = useState<Set<string>>(new Set());
  const [showCurriculumPanel, setShowCurriculumPanel] = useState(false);
  const [loadingElements, setLoadingElements] = useState(false);
  const [autoSelectIA, setAutoSelectIA] = useState(true);

  const updateField = (section: keyof LearningSituation, field: string, value: any) => {
    setData(prev => {
      if (typeof prev[section] === 'object' && !Array.isArray(prev[section])) {
        return {
          ...prev,
          [section]: { ...(prev[section] as any), [field]: value }
        };
      }
      return { ...prev, [section]: value };
    });
  };

  const selectQuickInfo = (type: 'curso' | 'area', value: string) => {
    if (type === 'curso') {
      updateField('identificacion', 'curso', value);
    } else {
      const newCc = [...data.concrecionCurricular];
      if (newCc.length > 0) {
        newCc[0].area = value;
      } else {
        newCc.push({ area: value, criteriosEvaluacion: '', saberesBasicos: '', competenciasEspecificas: [], competenciasClave: [] });
      }
      setData(prev => ({ ...prev, concrecionCurricular: newCc }));
    }
  };

  // Efecto para cargar elementos cuando la información básica esté completa
  useEffect(() => {
    const checkAndFetch = async () => {
      const curso = data.identificacion.curso;
      const area = data.concrecionCurricular[0]?.area;
      
      if (selectedEtapa && curso && area && !hasGenerated) {
        setLoadingElements(true);
        setAvailableElements([]);
        setSelectedElementIds(new Set());
        setAutoSelectIA(true);
        setShowCurriculumPanel(true);
        
        try {
          const elements = await getCurricularElements(selectedEtapa, curso, area);
          setAvailableElements(elements);
        } catch (err) {
          console.error("Fallo al obtener elementos curriculares");
        } finally {
          setLoadingElements(false);
        }
      }
    };
    checkAndFetch();
  }, [selectedEtapa, data.identificacion.curso, data.concrecionCurricular[0]?.area]);

  const toggleElement = (id: string) => {
    const newSet = new Set(selectedElementIds);
    if (newSet.has(id)) {
        newSet.delete(id);
    } else {
        newSet.add(id);
    }
    setSelectedElementIds(newSet);
    
    // Si el usuario selecciona algo, desactivamos la IA automáticamente de forma intuitiva
    if (newSet.size > 0) {
      setAutoSelectIA(false);
    } else {
      setAutoSelectIA(true);
    }
  };

  const handleAiGenerate = async () => {
    if (!selectedEtapa || !data.identificacion.curso || !data.concrecionCurricular[0].area) {
      alert("Por favor, selecciona etapa, curso y asignatura antes de generar.");
      return;
    }
    setLoading(true);
    try {
      const effectivePrompt = aiPrompt.trim() || `Genera una situación de aprendizaje adecuada para ${data.identificacion.curso} de la etapa ${selectedEtapa} en el área de ${data.concrecionCurricular[0].area}.`;
      
      const selectedTexts = autoSelectIA 
        ? "" 
        : Array.from(selectedElementIds)
            .map(id => availableElements.find(e => e.id === id)?.text)
            .filter(Boolean)
            .join(" | ");

      const generated = await generateLearningSituation(
        effectivePrompt, 
        data.identificacion.idioma,
        data.identificacion.sesiones,
        '',
        selectedTexts
      );
      setData(prev => ({
        ...prev,
        ...generated,
        identificacion: { 
          ...prev.identificacion, 
          ...generated.identificacion, 
          idioma: prev.identificacion.idioma, 
          sesiones: prev.identificacion.sesiones 
        },
        justificacion: { ...prev.justificacion, ...generated.justificacion },
        secuenciaDidactica: generated.secuenciaDidactica || prev.secuenciaDidactica
      }));
      setHasGenerated(true);
      setShowCurriculumPanel(false);
    } catch (err) {
      alert("Hubo un error generando la situación de aprendizaje.");
    } finally {
      setLoading(false);
    }
  };

  const exportToJson = () => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SA-${data.identificacion.titulo || 'nueva'}.json`;
    a.click();
  };

  const printDocument = () => { window.print(); };

  const languages: ('Castellano' | 'Valenciano' | 'Inglés')[] = ['Castellano', 'Valenciano', 'Inglés'];

  return (
    <div className="min-h-screen bg-[#F0F7F8] flex flex-col md:flex-row relative overflow-hidden">
      {/* Sidebar - Panel de Configuración */}
      <aside className="w-full md:w-96 bg-white border-r border-[#CCE2E5] h-screen sticky top-0 overflow-y-auto no-print flex flex-col shadow-2xl z-50">
        <div className="p-8 border-b border-[#CCE2E5] bg-[#006D7B] text-white">
          <div className="flex items-center gap-4 mb-2">
            <div className="bg-white p-1 rounded-lg">
              <img src={LOGO_URL} alt="Colegio San José" className="w-10 h-10 object-contain" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter leading-none uppercase">Generador SA</h1>
              <p className="text-[10px] text-[#CCE2E5] font-bold uppercase tracking-[0.2em]">Colegio San José</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-8 flex-1">
          {/* 1. Idioma de salida */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <LanguageIcon className="w-4 h-4" /> 1. Idioma de salida
            </label>
            <div className="grid grid-cols-3 gap-2">
              {languages.map(lang => (
                <button
                  key={lang}
                  onClick={() => updateField('identificacion', 'idioma', lang)}
                  className={`py-2 rounded-xl text-[9px] font-black transition-all border-2 ${data.identificacion.idioma === lang ? 'bg-[#006D7B] border-[#006D7B] text-white shadow-md' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-[#CCE2E5]'}`}
                >
                  {lang.substring(0, 3).toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Selección de Etapa */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Squares2X2Icon className="w-4 h-4" /> 2. Etapa Educativa
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(ETAPAS_DATA) as EtapaKey[]).map(etapa => {
                const config = ETAPAS_DATA[etapa];
                const isActive = selectedEtapa === etapa;
                return (
                  <button
                    key={etapa}
                    onClick={() => { setSelectedEtapa(etapa); updateField('identificacion', 'curso', ''); }}
                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${isActive ? `bg-[#CCE2E5]/30 border-[#006D7B] text-[#006D7B] shadow-lg` : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-[#CCE2E5]'}`}
                  >
                    {config.icon}
                    <span className="text-[8px] font-black uppercase tracking-tighter">{etapa}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3 y 4. Cursos y Áreas */}
          {selectedEtapa && (
            <div className="space-y-8 animate-in fade-in slide-in-from-left-4">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <StarIcon className="w-4 h-4" /> 3. Curso
                </label>
                <div className="flex flex-wrap gap-2">
                  {ETAPAS_DATA[selectedEtapa].cursos.map(c => (
                    <button
                      key={c}
                      onClick={() => selectQuickInfo('curso', c)}
                      className={`px-3 py-2 rounded-xl text-[9px] font-black border-2 transition-all ${data.identificacion.curso === c ? 'bg-[#006D7B] border-[#006D7B] text-white shadow-md' : 'bg-white border-slate-100 text-slate-500 hover:border-[#CCE2E5]'}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <BookOpenIcon className="w-4 h-4" /> 4. Asignatura
                </label>
                <div className="grid grid-cols-1 gap-1.5">
                  {ETAPAS_DATA[selectedEtapa].asignaturas.map(a => (
                    <button
                      key={a}
                      onClick={() => selectQuickInfo('area', a)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left text-[9px] font-black transition-all ${data.concrecionCurricular[0]?.area === a ? 'bg-[#5FB3C5] border-[#5FB3C5] text-white shadow-md' : 'bg-white border-slate-100 text-slate-500 hover:border-[#CCE2E5]'}`}
                    >
                      <div className={`p-1.5 rounded-lg ${data.concrecionCurricular[0]?.area === a ? 'bg-white/20' : 'bg-slate-50'}`}>
                        {ASIGNATURA_ICONS[a] || <BookOpenIcon className="w-3.5 h-3.5" />}
                      </div>
                      <span className="uppercase tracking-tight flex-1 truncate">{a}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 5. Temporalización */}
          <div className="space-y-3 pt-4 border-t border-[#CCE2E5]">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <ClipboardDocumentCheckIcon className="w-4 h-4" /> 5. Temporalización
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <span className="text-[8px] font-bold text-slate-400 uppercase ml-1">Trimestre</span>
                <select 
                  value={data.identificacion.trimestre}
                  onChange={(e) => updateField('identificacion', 'trimestre', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#CCE2E5] text-xs font-bold text-slate-700 bg-slate-50 outline-none focus:ring-2 focus:ring-[#CCE2E5] transition-all appearance-none"
                >
                  <option value="1º Trimestre">1º Trim.</option>
                  <option value="2º Trimestre">2º Trim.</option>
                  <option value="3º Trimestre">3º Trim.</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <span className="text-[8px] font-bold text-slate-400 uppercase ml-1">Nº Sesiones</span>
                <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50 border border-[#CCE2E5] rounded-xl">
                  <button onClick={() => updateField('identificacion', 'sesiones', Math.max(1, data.identificacion.sesiones - 1))} className="text-slate-400 hover:text-[#5FB3C5] transition-colors"><MinusIcon className="w-3.5 h-3.5" /></button>
                  <span className="font-black text-xs text-[#006D7B]">{data.identificacion.sesiones}</span>
                  <button onClick={() => updateField('identificacion', 'sesiones', data.identificacion.sesiones + 1)} className="text-slate-400 hover:text-[#5FB3C5] transition-colors"><PlusIcon className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
          </div>

          {/* 6. Objetivo / Especificaciones (Opcional) */}
          <div className="space-y-3 pt-4 border-t border-[#CCE2E5]">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <ChatBubbleLeftRightIcon className="w-4 h-4 text-[#5FB3C5]" /> 6. Indicaciones (Opcional)
            </label>
            <textarea
              placeholder="Escribe algo concreto que quieras para esta SA..."
              className="w-full p-4 rounded-2xl border-2 border-[#CCE2E5] h-28 text-xs font-bold text-slate-700 bg-slate-50 outline-none focus:ring-4 focus:ring-[#CCE2E5] focus:border-[#5FB3C5] resize-none transition-all shadow-inner placeholder:text-slate-300"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
            />
            <button
              onClick={handleAiGenerate}
              disabled={loading || !selectedEtapa || !data.identificacion.curso || !data.concrecionCurricular[0].area}
              className="w-full bg-[#006D7B] text-white py-4 rounded-[1.25rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-[#005a66] disabled:opacity-50 transition-all shadow-xl active:scale-95 mt-2"
            >
              {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" /> : <SparklesIcon className="w-4 h-4" />}
              {loading ? 'Redactando...' : 'Generar con IA'}
            </button>
          </div>
          
          <div className="pt-4 text-center">
            <p className="text-[9px] font-bold text-[#5FB3C5] uppercase tracking-widest opacity-80">(creado por Estefanía Hita)</p>
          </div>
        </div>

        <div className="p-5 bg-[#F0F7F8] border-t border-[#CCE2E5] flex gap-3">
           <button onClick={exportToJson} className="p-3 bg-white rounded-xl border border-[#CCE2E5] text-slate-400 hover:text-[#5FB3C5] hover:border-[#5FB3C5] transition-all shadow-sm" title="Exportar JSON">
              <ArrowDownTrayIcon className="w-5 h-5" />
           </button>
           <button onClick={printDocument} className="flex-1 bg-white border-2 border-[#006D7B] text-[#006D7B] px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-all font-black text-[9px] uppercase tracking-widest hover:bg-[#006D7B] hover:text-white shadow-sm">
              <PrinterIcon className="w-4 h-4" /> Imprimir Documento
           </button>
        </div>
      </aside>

      {/* --- PANEL CURRICULAR DESPLEGABLE --- */}
      <div 
        className={`fixed top-0 bottom-0 left-0 md:left-96 w-full md:w-96 bg-[#F8FDFF] border-r border-[#CCE2E5] shadow-2xl z-40 transition-transform duration-500 ease-in-out no-print flex flex-col ${showCurriculumPanel ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-8 bg-[#5FB3C5] text-white shrink-0">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <AdjustmentsVerticalIcon className="w-5 h-5" /> Diseño Curricular
            </h3>
            <button onClick={() => setShowCurriculumPanel(false)} className="hover:bg-white/20 p-1 rounded-lg transition-colors">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          <p className="text-[10px] font-bold opacity-90 uppercase leading-tight">Extrae y elige los elementos oficiales LOMLOE para tu Situación de Aprendizaje.</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Interruptor de Selección Automática */}
          <div className="p-4 rounded-2xl border-2 border-[#5FB3C5]/20 bg-[#5FB3C5]/5 space-y-3 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-[#006D7B] uppercase tracking-widest">IA Selecciona por mí</span>
              <button 
                onClick={() => {
                   const newValue = !autoSelectIA;
                   setAutoSelectIA(newValue);
                   if (newValue) setSelectedElementIds(new Set());
                }}
                className={`w-12 h-6 rounded-full relative transition-colors ${autoSelectIA ? 'bg-[#006D7B]' : 'bg-slate-300'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${autoSelectIA ? 'right-1' : 'left-1'}`} />
              </button>
            </div>
            <p className="text-[9px] font-medium text-slate-500 italic">
              {autoSelectIA 
                ? "La IA seleccionará los criterios (1.1, 2.1...) y saberes oficiales automáticamente." 
                : "Selección manual: Elige los elementos que desees integrar."}
            </p>
          </div>

          <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            {loadingElements ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <ArrowPathIcon className="w-8 h-8 text-[#5FB3C5] animate-spin" />
                <p className="text-[9px] font-black text-[#5FB3C5] uppercase animate-pulse">Consultando Decretos LOMLOE...</p>
              </div>
            ) : availableElements.length === 0 ? (
                <div className="text-center py-10 opacity-50">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Selecciona curso y asignatura para cargar elementos.</p>
                </div>
            ) : (
              <>
                {/* Criterios de Evaluación */}
                <div className={`space-y-4 transition-all duration-300 ${autoSelectIA ? 'opacity-40' : 'opacity-100'}`}>
                  <h4 className="text-[10px] font-black text-[#006D7B] uppercase tracking-[0.2em] border-b border-[#CCE2E5] pb-2 flex items-center gap-2">
                    <CheckBadgeIcon className="w-4 h-4" /> Criterios de Evaluación
                  </h4>
                  <div className="space-y-2">
                    {availableElements.filter(e => e.type === 'criterio').map(e => (
                      <button
                        key={e.id}
                        onClick={() => toggleElement(e.id)}
                        className={`w-full p-4 rounded-xl text-left text-[10px] font-medium transition-all border-2 flex items-start gap-3 group ${selectedElementIds.has(e.id) ? 'bg-[#006D7B] border-[#006D7B] text-white shadow-md scale-[1.02]' : 'bg-white border-slate-100 text-slate-600 hover:border-[#CCE2E5]'}`}
                      >
                        <div className={`mt-0.5 min-w-[14px] h-[14px] rounded border flex items-center justify-center transition-colors ${selectedElementIds.has(e.id) ? 'bg-white' : 'border-[#CCE2E5] group-hover:border-[#5FB3C5]'}`}>
                          {selectedElementIds.has(e.id) && <CheckIcon className="w-3 h-3 text-[#006D7B] stroke-[4]" />}
                        </div>
                        <span className="leading-relaxed">{e.text}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Saberes Básicos */}
                <div className={`space-y-4 transition-all duration-300 ${autoSelectIA ? 'opacity-40' : 'opacity-100'}`}>
                  <h4 className="text-[10px] font-black text-[#006D7B] uppercase tracking-[0.2em] border-b border-[#CCE2E5] pb-2 flex items-center gap-2">
                    <BookOpenIcon className="w-4 h-4" /> Saberes Básicos
                  </h4>
                  <div className="space-y-2">
                    {availableElements.filter(e => e.type === 'saber').map(e => (
                      <button
                        key={e.id}
                        onClick={() => toggleElement(e.id)}
                        className={`w-full p-4 rounded-xl text-left text-[10px] font-medium transition-all border-2 flex items-start gap-3 group ${selectedElementIds.has(e.id) ? 'bg-[#5FB3C5] border-[#5FB3C5] text-white shadow-md scale-[1.02]' : 'bg-white border-slate-100 text-slate-600 hover:border-[#CCE2E5]'}`}
                      >
                        <div className={`mt-0.5 min-w-[14px] h-[14px] rounded border flex items-center justify-center transition-colors ${selectedElementIds.has(e.id) ? 'bg-white' : 'border-[#CCE2E5] group-hover:border-[#5FB3C5]'}`}>
                          {selectedElementIds.has(e.id) && <CheckIcon className="w-3 h-3 text-[#5FB3C5] stroke-[4]" />}
                        </div>
                        <span className="leading-relaxed">{e.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-[#CCE2E5] shrink-0">
          <button 
            onClick={() => setShowCurriculumPanel(false)}
            className="w-full bg-[#006D7B] text-white py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:bg-[#005a66] transition-all active:scale-95"
          >
            Confirmar Selección
          </button>
        </div>
      </div>

      {/* Main Content - Visualización de la SA */}
      <main className={`flex-1 overflow-y-auto bg-[#CCE2E5]/30 p-4 md:p-12 min-h-screen transition-all duration-500 ${showCurriculumPanel ? 'blur-sm md:blur-none pointer-events-none md:pointer-events-auto' : ''}`}>
        {!hasGenerated && !loading ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-8 animate-in fade-in duration-700">
            <div className="bg-white p-10 rounded-[3rem] shadow-2xl border-4 border-[#CCE2E5]">
               <div className="bg-[#F0F7F8] p-6 rounded-full inline-block mb-6 shadow-inner">
                  <img src={LOGO_URL} alt="Colegio San José" className="w-20 h-20 object-contain" />
               </div>
               <h2 className="text-3xl font-black text-[#006D7B] mb-4 tracking-tighter uppercase">Panel de Diseño</h2>
               <p className="text-slate-400 font-medium max-w-sm mx-auto text-lg leading-relaxed">Configura los parámetros en el panel izquierdo y pulsa generar para crear tu Situación de Aprendizaje.</p>
            </div>
            <div className="flex gap-4 opacity-30">
               <div className="w-3 h-3 bg-[#5FB3C5] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
               <div className="w-3 h-3 bg-[#5FB3C5] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
               <div className="w-3 h-3 bg-[#5FB3C5] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        ) : loading ? (
          <div className="h-full flex flex-col items-center justify-center p-12 text-center animate-in fade-in">
             <div className="relative mb-10">
                <div className="w-28 h-28 border-[6px] border-[#CCE2E5] border-t-[#006D7B] animate-spin rounded-full shadow-2xl" />
                <SparklesIcon className="w-10 h-10 text-[#006D7B] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
             </div>
             <h3 className="text-2xl font-black text-[#006D7B] tracking-tighter uppercase mb-4">Generando Contenido</h3>
             <div className="space-y-2 max-w-xs mx-auto">
                <p className="text-[#5FB3C5] font-bold text-xs uppercase tracking-widest animate-pulse">Alineando con LOMLOE</p>
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest animate-pulse delay-75">Creando actividades motivadoras</p>
                <p className="text-[#CCE2E5] font-bold text-[10px] uppercase tracking-widest animate-pulse delay-150">Personalizando para {data.identificacion.idioma}</p>
             </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
             <Preview data={data} />
          </div>
        )}
      </main>
    </div>
  );
};

const Preview: React.FC<{ data: LearningSituation }> = ({ data }) => {
  return (
    <div className="bg-white p-12 md:p-16 shadow-[0_45px_100px_-20px_rgba(0,0,0,0.15)] rounded-sm border-t-[20px] border-[#006D7B] min-h-[1600px] text-[11px] leading-relaxed text-slate-800 mb-20 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-20 opacity-[0.05] pointer-events-none rotate-12 select-none">
         <img src={LOGO_URL} alt="" className="w-[700px] h-[700px] object-contain" />
      </div>

      <div className="border-b-[8px] border-[#006D7B] pb-10 mb-14 flex justify-between items-end relative z-10">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-4">
             <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg border-2 border-[#CCE2E5]">
                <img src={LOGO_URL} alt="Colegio San José" className="w-12 h-12 object-contain" />
             </div>
             <h1 className="text-5xl font-black text-[#006D7B] uppercase leading-none tracking-tighter text-balance">SITUACIÓN DE APRENDIZAJE</h1>
          </div>
          <p className="text-[#5FB3C5] font-black mt-1 tracking-[0.5em] uppercase text-lg">Colegio San José</p>
        </div>
        <div className="text-right">
          <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px] mb-2">Doc. Oficial Curricular</p>
          <div className="bg-[#006D7B] text-white px-6 py-3 font-black inline-block rounded-sm text-base shadow-sm uppercase">
             {data.identificacion.idioma}
          </div>
        </div>
      </div>

      <div className="space-y-16 relative z-10">
        <section className="print-break-inside-avoid">
          <h4 className="bg-[#006D7B] text-white px-6 py-4 font-black border-l-[14px] border-[#5FB3C5] uppercase mb-6 tracking-[0.3em] text-[12px] shadow-sm">1. Identificación del Diseño</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 border-2 border-[#CCE2E5]/30 p-10 rounded-sm bg-[#CCE2E5]/10">
            <div className="md:col-span-4 border-b-2 border-[#CCE2E5]/50 pb-6 mb-2">
               <span className="block font-black text-[9px] text-[#5FB3C5] uppercase tracking-widest mb-2">Título de la SA</span>
               <span className="font-black text-3xl text-[#006D7B] leading-tight uppercase">{data.identificacion.titulo || 'SIN TÍTULO'}</span>
            </div>
            <div><span className="block font-black text-[9px] text-slate-400 uppercase tracking-widest mb-2">Etapa y Curso</span><span className="font-black text-lg text-[#006D7B]">{data.identificacion.curso || '---'}</span></div>
            <div><span className="block font-black text-[9px] text-slate-400 uppercase tracking-widest mb-2">Temporalización</span><span className="font-black text-lg text-[#006D7B]">{data.identificacion.trimestre}</span></div>
            <div><span className="block font-black text-[9px] text-slate-400 uppercase tracking-widest mb-2">Nº Sesiones</span><span className="font-black text-lg text-[#006D7B]">{data.identificacion.sesiones} sesiones</span></div>
            <div><span className="block font-black text-[9px] text-slate-400 uppercase tracking-widest mb-2">Especialidad</span><span className="font-black text-lg text-[#006D7B]">{data.concrecionCurricular[0]?.area || '---'}</span></div>
          </div>
        </section>

        <section className="print-break-inside-avoid">
          <h4 className="bg-[#006D7B] text-white px-6 py-4 font-black border-l-[14px] border-[#5FB3C5] uppercase mb-6 tracking-[0.3em] text-[12px] shadow-sm">2. Marco de Contextualización</h4>
          <div className="border-2 border-[#CCE2E5]/30 divide-y-2 divide-[#CCE2E5]/30 rounded-sm overflow-hidden shadow-sm">
            <div className="p-8 bg-white">
               <span className="block font-black text-[9px] text-[#5FB3C5] uppercase tracking-widest mb-4 border-b border-slate-50 pb-1">Contextualización Educativa</span>
               <p className="font-medium text-[13px] leading-relaxed text-justify">{data.justificacion.contextualizacion || '---'}</p>
            </div>
            <div className="p-8 bg-[#CCE2E5]/5">
               <span className="block font-black text-[9px] text-[#5FB3C5] uppercase tracking-widest mb-4 border-b border-slate-50 pb-1">Justificación Pedagógica</span>
               <p className="font-medium text-[13px] leading-relaxed text-justify">{data.justificacion.justificacion || '---'}</p>
            </div>
          </div>
        </section>

        <section className="print-break-inside-avoid">
          <h4 className="bg-[#006D7B] text-white px-6 py-4 font-black border-l-[14px] border-[#5FB3C5] uppercase mb-6 tracking-[0.3em] text-[12px] shadow-sm">3. Meta: Producto Final</h4>
          <div className="border-4 border-[#CCE2E5] p-12 italic font-black text-[#006D7B] bg-[#CCE2E5]/20 rounded-sm border-l-[20px] shadow-sm text-xl text-center leading-relaxed uppercase tracking-tight">
            "{data.productoFinal || '---'}"
          </div>
        </section>

        <section className="print-break-inside-avoid">
          <h4 className="bg-[#006D7B] text-white px-6 py-4 font-black border-l-[14px] border-[#5FB3C5] uppercase mb-6 tracking-[0.3em] text-[12px] shadow-sm">4. Concreción Curricular LOMLOE</h4>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border-2 border-[#CCE2E5]/30 shadow-lg rounded-sm overflow-hidden text-[10px]">
              <thead>
                <tr className="bg-[#006D7B] text-white text-[10px] uppercase font-black text-center tracking-[0.2em] border-b-2 border-[#006D7B]">
                  <th className="p-6 w-1/4">Área / Materia</th>
                  <th className="p-6 w-1/3 border-x border-[#005a66]">Criterios de Evaluación</th>
                  <th className="p-6 w-1/3">Saberes Básicos</th>
                </tr>
              </thead>
              <tbody>
                {data.concrecionCurricular.map((cc, i) => (
                  <tr key={i} className="border-b border-[#CCE2E5]/30 last:border-0 hover:bg-[#CCE2E5]/5 transition-colors">
                    <td className="p-8 font-black uppercase text-[12px] text-[#006D7B] align-top leading-tight bg-[#CCE2E5]/10">{cc.area || '---'}</td>
                    <td className="p-8 align-top font-medium text-[11px] whitespace-pre-wrap leading-relaxed border-x border-[#CCE2E5]/30">{cc.criteriosEvaluacion || '---'}</td>
                    <td className="p-8 align-top font-medium text-[11px] whitespace-pre-wrap leading-relaxed">{cc.saberesBasicos || '---'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <section className="print-break-inside-avoid">
            <h4 className="bg-[#006D7B] text-white px-6 py-4 font-black border-l-[14px] border-[#5FB3C5] uppercase mb-6 tracking-[0.3em] text-[11px] shadow-sm">5. Elementos Transversales</h4>
            <div className="border-2 border-[#CCE2E5]/30 p-8 flex flex-wrap gap-3 rounded-sm min-h-[100px] bg-[#CCE2E5]/5 shadow-sm">
              {data.elementosTrasversales.length > 0 ? data.elementosTrasversales.map(it => <span key={it} className="bg-white px-4 py-2 border border-[#CCE2E5]/50 rounded-sm font-black text-[9px] uppercase tracking-tighter text-[#006D7B] shadow-sm">{it}</span>) : '---'}
            </div>
          </section>
          <section className="print-break-inside-avoid">
            <h4 className="bg-[#006D7B] text-white px-6 py-4 font-black border-l-[14px] border-[#5FB3C5] uppercase mb-6 tracking-[0.3em] text-[11px] shadow-sm">6. Metodologías</h4>
            <div className="border-2 border-[#CCE2E5]/30 p-8 flex flex-wrap gap-3 rounded-sm min-h-[100px] bg-[#CCE2E5]/5 shadow-sm">
              {data.metodologia.length > 0 ? data.metodologia.map(it => <span key={it} className="bg-[#5FB3C5] text-white px-4 py-2 rounded-sm font-black text-[9px] uppercase tracking-tighter shadow-md">{it}</span>) : '---'}
            </div>
          </section>
        </div>

        <section className="print-break-inside-avoid pt-14">
          <h4 className="bg-[#006D7B] text-white px-8 py-6 font-black border-l-[16px] border-[#5FB3C5] uppercase mb-12 tracking-[0.5em] text-[13px] shadow-lg text-center">ANEXO: SECUENCIA DIDÁCTICA DETALLADA</h4>
          <div className="space-y-20">
            {['fase1Inicio', 'fase2Desarrollo', 'fase3Cierre'].map((fase, i) => (
              <div key={fase} className="overflow-x-auto">
                <h5 className="font-black text-[#006D7B] uppercase mb-8 border-b-[8px] border-[#CCE2E5]/30 pb-6 flex items-center gap-6 text-2xl tracking-tighter">
                  <span className="bg-[#5FB3C5] text-white w-12 h-12 flex items-center justify-center rounded-2xl text-xl shadow-xl">{i+1}</span>
                  {fase === 'fase1Inicio' ? 'MOTIVACIÓN' : fase === 'fase2Desarrollo' ? 'DESARROLLO' : 'CIERRE'}
                </h5>
                <table className="w-full text-[9px] border-2 border-[#CCE2E5]/30 shadow-xl min-w-[600px]">
                  <thead className="bg-[#006D7B] text-white font-black uppercase tracking-[0.2em] text-center">
                    <tr>
                      <th className="p-4 w-2/5">ACTIVIDAD</th>
                      <th className="p-4 border-x border-[#005a66]">TAREA</th>
                      <th className="p-4 border-x border-[#005a66]">AGRUP.</th>
                      <th className="p-4 border-x border-[#005a66]">MAT.</th>
                      <th className="p-4 border-x border-[#005a66]">EVAL.</th>
                      <th className="p-4">INSTR.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.secuenciaDidactica as any)[fase].length > 0 ? (data.secuenciaDidactica as any)[fase].map((act: any) => (
                      <tr key={act.id} className="border-b border-[#CCE2E5]/30 last:border-0 hover:bg-[#CCE2E5]/5 transition-colors">
                        <td className="p-6 align-top font-medium text-[11px] leading-relaxed text-justify">{act.descripcion}</td>
                        <td className="p-6 align-top font-black text-[#5FB3C5] uppercase text-center border-x border-[#CCE2E5]/10">{act.tarea}</td>
                        <td className="p-6 align-top text-center font-bold border-x border-[#CCE2E5]/10 uppercase tracking-tighter text-[9px]">{act.agrupamiento}</td>
                        <td className="p-6 align-top font-medium text-center border-x border-[#CCE2E5]/10 text-[9px] text-slate-500">{act.materiales}</td>
                        <td className="p-6 align-top text-center font-black border-x border-[#CCE2E5]/10 uppercase text-[9px]">{act.evaluador}</td>
                        <td className="p-6 align-top text-center font-black uppercase text-[9px]">{act.instrumento}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={6} className="p-16 text-center text-[#CCE2E5] font-black uppercase tracking-[0.4em] text-lg">Sin actividades registradas</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-20 pt-10 border-t border-[#CCE2E5]/30 flex flex-col md:flex-row justify-between items-center text-[9px] font-black text-[#5FB3C5] uppercase tracking-widest relative z-10 gap-4">
         <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt="Colegio San José" className="w-6 h-6 object-contain" />
            <p>SISTEMA DE DISEÑO CURRICULAR IA - COLEGIO SAN JOSÉ</p>
         </div>
         <p>CREADO POR ESTEFANÍA HITA &copy; {new Date().getFullYear()}</p>
      </div>
    </div>
  );
};

export default App;

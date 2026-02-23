
export interface Activity {
  id: string;
  descripcion: string;
  tarea: string;
  agrupamiento: string;
  materiales: string;
  evaluador: string;
  instrumento: string;
  criterioId?: string;
}

export interface DidacticSequence {
  fase1Inicio: Activity[];
  fase2Desarrollo: Activity[];
  fase3Cierre: Activity[];
}

export interface CurricularSpecification {
  area: string;
  criteriosEvaluacion: string;
  saberesBasicos: string;
  competenciasEspecificas: string[];
  competenciasClave: string[];
}

export interface CurricularElement {
  id: string;
  text: string;
  type: 'criterio' | 'saber';
}

export interface LearningSituation {
  identificacion: {
    titulo: string;
    curso: string;
    temporalizacion: string;
    trimestre: string;
    sesiones: number;
    idioma: 'Castellano' | 'Valenciano' | 'Inglés';
  };
  justificacion: {
    contextualizacion: string;
    justificacion: string;
  };
  productoFinal: string;
  concrecionCurricular: CurricularSpecification[];
  elementosTrasversales: string[];
  metodologia: string[];
  inclusionDUA: string[];
  atencionDiversidad: {
    medidasAprendizaje: string[];
    medidasParticipacion: string[];
    medidasAcceso: string[];
  };
  lineasTesela: string[];
  competenciaEspiritual: string[];
  secuenciaDidactica: DidacticSequence;
}

export const INITIAL_STATE: LearningSituation = {
  identificacion: { 
    titulo: '', 
    curso: '', 
    temporalizacion: '', 
    trimestre: '1º Trimestre',
    sesiones: 8,
    idioma: 'Castellano'
  },
  justificacion: { contextualizacion: '', justificacion: '' },
  productoFinal: '',
  concrecionCurricular: [{ area: '', criteriosEvaluacion: '', saberesBasicos: '', competenciasEspecificas: [], competenciasClave: [] }],
  elementosTrasversales: [],
  metodologia: [],
  inclusionDUA: [],
  atencionDiversidad: { medidasAprendizaje: [], medidasParticipacion: [], medidasAcceso: [] },
  lineasTesela: [],
  competenciaEspiritual: [],
  secuenciaDidactica: {
    fase1Inicio: [],
    fase2Desarrollo: [],
    fase3Cierre: []
  }
};

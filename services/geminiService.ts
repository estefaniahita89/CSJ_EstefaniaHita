
import { GoogleGenAI, Type } from "@google/genai";
import { LearningSituation, CurricularElement } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const schema = {
  type: Type.OBJECT,
  properties: {
    identificacion: {
      type: Type.OBJECT,
      properties: {
        titulo: { type: Type.STRING },
        curso: { type: Type.STRING },
        temporalizacion: { type: Type.STRING },
        trimestre: { type: Type.STRING },
      },
    },
    justificacion: {
      type: Type.OBJECT,
      properties: {
        contextualizacion: { type: Type.STRING },
        justificacion: { type: Type.STRING },
      },
    },
    productoFinal: { type: Type.STRING },
    concrecionCurricular: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          area: { type: Type.STRING },
          criteriosEvaluacion: { type: Type.STRING },
          saberesBasicos: { type: Type.STRING },
          competenciasEspecificas: { type: Type.ARRAY, items: { type: Type.STRING } },
          competenciasClave: { type: Type.ARRAY, items: { type: Type.STRING } },
        }
      }
    },
    elementosTrasversales: { type: Type.ARRAY, items: { type: Type.STRING } },
    metodologia: { type: Type.ARRAY, items: { type: Type.STRING } },
    inclusionDUA: { type: Type.ARRAY, items: { type: Type.STRING } },
    secuenciaDidactica: {
      type: Type.OBJECT,
      properties: {
        fase1Inicio: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              descripcion: { type: Type.STRING },
              tarea: { type: Type.STRING },
              agrupamiento: { type: Type.STRING },
              materiales: { type: Type.STRING },
              evaluador: { type: Type.STRING },
              instrumento: { type: Type.STRING },
            }
          }
        },
        fase2Desarrollo: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              descripcion: { type: Type.STRING },
              tarea: { type: Type.STRING },
              agrupamiento: { type: Type.STRING },
              materiales: { type: Type.STRING },
              evaluador: { type: Type.STRING },
              instrumento: { type: Type.STRING },
            }
          }
        },
        fase3Cierre: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              descripcion: { type: Type.STRING },
              tarea: { type: Type.STRING },
              agrupamiento: { type: Type.STRING },
              materiales: { type: Type.STRING },
              evaluador: { type: Type.STRING },
              instrumento: { type: Type.STRING },
            }
          }
        }
      }
    }
  },
  required: ["identificacion", "justificacion", "productoFinal", "secuenciaDidactica"]
};

export async function getCurricularElements(
  etapa: string,
  curso: string,
  area: string
): Promise<CurricularElement[]> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Extrae de los Reales Decretos y Decretos de Currículo LOMLOE (España) los elementos curriculares oficiales para: 
      ETAPA: ${etapa}, CURSO: ${curso}, ÁREA: ${area}.
      
      ES CRÍTICO:
      - Incluye obligatoriamente la numeración oficial de los criterios de evaluación (ej. "1.1. Identificar...", "2.3. Analizar...") tal y como aparecen en el decreto.
      - Necesito una lista de 8 criterios de evaluación y 8 saberes básicos.
      - Los saberes deben ser técnicos y ajustados a la normativa.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              text: { type: Type.STRING },
              type: { type: Type.STRING, description: 'Debe ser "criterio" o "saber"' }
            },
            required: ["id", "text", "type"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);
  } catch (error) {
    console.error("Error fetching elements:", error);
    return [];
  }
}

export async function generateLearningSituation(
  prompt: string, 
  language: string = 'Castellano',
  sessions: number = 8,
  fixedTitle: string = '',
  selectedElements: string = ''
): Promise<Partial<LearningSituation>> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Genera una Situación de Aprendizaje (SA) completa para el Colegio San José.
      
      IDIOMA DE SALIDA: ${language}.
      DURACIÓN: Exactamente ${sessions} sesiones.
      
      CONTEXTO: "${prompt}". 
      ${selectedElements ? `DEBES INTEGRAR OBLIGATORIAMENTE ESTOS ELEMENTOS SELECCIONADOS POR EL PROFESOR (MANTENIENDO SU NUMERACIÓN): ${selectedElements}.` : "Como el profesor ha optado por selección automática, tú debes elegir los criterios de evaluación (con su numeración oficial) y saberes básicos de la LOMLOE que mejor encajen."}
      
      REQUISITOS:
      - Título motivador.
      - Coherencia total entre criterios, saberes y actividades.
      - Estructura profesional LOMLOE.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        thinkingConfig: { thinkingBudget: 4000 }
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating SA:", error);
    throw error;
  }
}

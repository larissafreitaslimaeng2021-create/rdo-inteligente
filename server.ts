import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const ALT_PORT = process.env.PORT && process.env.PORT !== '3000' ? parseInt(process.env.PORT, 10) : null;

app.use(express.json({ limit: '25mb' }));

// Initialize GoogleGenAI server-side with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// API endpoint for structuring RDO notes using Gemini
app.post('/api/extract-rdo', async (req, res) => {
  try {
    const { text, audioBase64, mimeType } = req.body;

    if (!text && !audioBase64) {
      return res.status(400).json({ error: 'Nenhum texto ou áudio fornecido para análise.' });
    }

    const systemInstruction = `Você é um engenheiro civil especialista em Relatórios Diários de Obra (RDO) e diários de obra segundo as melhores práticas da engenharia brasileira.
Sua missão é transformar relatos de campo (falados ou escritos) em um rascunho estruturado de RDO.

REGRAS OBRIGATÓRIAS:
1. NUNCA invente informações ausentes. Se não foi falado, deixe o campo vazio ou array vazio.
2. Identifique somente o que foi efetivamente relatado:
   - Clima (Manhã, Tarde, Noite, ou geral)
   - Atividades executadas
   - Etapas e frentes de serviço
   - Avanço informado em percentual (número de 0 a 100, ou null se não informado)
   - Mão de obra (função, quantidade aproximada ou exata, e empresa ou subempreiteiro se citado)
   - Equipamentos e maquinários (nome, quantidade, status se citado)
   - Materiais recebidos ou utilizados (descrição, quantidade, tipo)
   - Ocorrências e imprevistos (paralisações, chuvas, atrasos, vistorias)
   - Segurança do trabalho (DDS realizado, uso de EPIs, ocorrência ou ausência explícita de acidentes)
   - Observações gerais adicionais
3. Quando alguma informação estiver incerta ou dúbia no áudio/relato, sinalize explicitamente no array "avisos" que ela "Requer confirmação" e explique o motivo.
4. Responda ESTRITAMENTE em formato JSON com o schema solicitado.`;

    const contents: any[] = [];

    if (audioBase64) {
      contents.push({
        inlineData: {
          mimeType: mimeType || 'audio/webm',
          data: audioBase64,
        },
      });
      contents.push({
        text: 'Transcreva e processe o relato de campo acima para estruturar os dados do RDO diário.',
      });
    } else {
      contents.push({
        text: `Processe o seguinte relato de campo bruto e estruture os dados do RDO:\n"""\n${text}\n"""`,
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts: contents },
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            transcricao: {
              type: Type.STRING,
              description: 'Transcrição fiel ou resumo do relato de campo',
            },
            climaManha: {
              type: Type.STRING,
              description: 'Condição climática manhã (ex: Bom, Chuvoso, Nublado, Impraticável)',
            },
            climaTarde: {
              type: Type.STRING,
              description: 'Condição climática tarde (ex: Bom, Chuvoso, Nublado, Impraticável)',
            },
            climaNoite: {
              type: Type.STRING,
              description: 'Condição climática noite (ex: Bom, Chuvoso, Nublado, Impraticável)',
            },
            etapasFrentes: {
              type: Type.STRING,
              description: 'Frentes de trabalho ou pavimentos citados',
            },
            atividadesExecutadas: {
              type: Type.STRING,
              description: 'Descrição detalhada e clara das atividades executadas',
            },
            percentualAvanco: {
              type: Type.NUMBER,
              description: 'Percentual de avanço informado (0-100) ou null',
            },
            maoDeObra: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  funcao: { type: Type.STRING },
                  quantidade: { type: Type.NUMBER },
                  empresa: { type: Type.STRING },
                  requerConfirmacao: { type: Type.BOOLEAN },
                },
                required: ['funcao', 'quantidade'],
              },
            },
            equipamentos: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  nome: { type: Type.STRING },
                  quantidade: { type: Type.NUMBER },
                  status: { type: Type.STRING },
                  requerConfirmacao: { type: Type.BOOLEAN },
                },
                required: ['nome', 'quantidade'],
              },
            },
            materiais: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  descricao: { type: Type.STRING },
                  quantidade: { type: Type.STRING },
                  tipo: { type: Type.STRING }, // 'Recebido' ou 'Utilizado'
                  requerConfirmacao: { type: Type.BOOLEAN },
                },
                required: ['descricao', 'quantidade', 'tipo'],
              },
            },
            ocorrencias: {
              type: Type.STRING,
              description: 'Ocorrências e imprevistos citados (paradas, chuvas, etc)',
            },
            seguranca: {
              type: Type.STRING,
              description: 'Aspectos de segurança, acidentes (se houve ou se não houve), DDS',
            },
            observacoes: {
              type: Type.STRING,
              description: 'Outras notas ou observações pertinentes',
            },
            avisos: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Lista de pontos incertos que requerem confirmação do engenheiro',
            },
          },
          required: [
            'transcricao',
            'atividadesExecutadas',
            'maoDeObra',
            'equipamentos',
            'materiais',
            'ocorrencias',
            'seguranca',
            'avisos',
          ],
        },
      },
    });

    const outputText = response.text || '{}';
    const parsed = JSON.parse(outputText);
    return res.json(parsed);
  } catch (err: any) {
    console.error('Erro na extração com Gemini:', err);
    return res.status(500).json({
      error: 'Falha ao processar relato com inteligência artificial.',
      details: err?.message || String(err),
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'RDO Inteligente', time: new Date().toISOString() });
});

// Setup Vite middleware for development or serve dist for production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      root: path.resolve(__dirname),
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[RDO Inteligente] Servidor ativo em http://0.0.0.0:${PORT}`);
  });

  let altServer: any = null;
  if (ALT_PORT && !isNaN(ALT_PORT)) {
    try {
      altServer = app.listen(ALT_PORT, '0.0.0.0', () => {
        console.log(`[RDO Inteligente] Servidor escutando também na porta ${ALT_PORT}`);
      });
    } catch (err) {
      console.warn(`[RDO Inteligente] Não foi possível vincular porta alternativa ${ALT_PORT}:`, err);
    }
  }

  const shutdown = () => {
    if (altServer) {
      try { altServer.close(); } catch (_) {}
    }
    server.close(() => {
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

startServer();

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Lazy initialize Gemini client using process.env.GEMINI_API_KEY
  let aiClient: GoogleGenAI | null = null;
  function getAI(): GoogleGenAI | null {
    if (!aiClient && process.env.GEMINI_API_KEY) {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
    return aiClient;
  }

  // API health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'fitness-ai-rag' });
  });

  // Embeddings endpoint for RAG chunks
  app.post('/api/rag/embed', async (req, res) => {
    try {
      const { text } = req.body;
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: 'Missing text property in request body' });
      }

      const ai = getAI();
      if (!ai) {
        return res.json({ embedding: [] });
      }

      const response = await ai.models.embedContent({
        model: 'gemini-embedding-2-preview',
        contents: text,
      });

      const embedding =
        response.embeddings?.[0]?.values ||
        (response as any).embedding?.values ||
        [];
      return res.json({ embedding });
    } catch {
      // Graceful fallback to local vector generation
      return res.json({ embedding: [] });
    }
  });

  // RAG Query & Answer Generation endpoint
  app.post('/api/rag/query', async (req, res) => {
    try {
      const { query, contextChunks } = req.body;
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'Missing query property in request body' });
      }

      if (!Array.isArray(contextChunks) || contextChunks.length === 0) {
        return res.json({
          answer: "I couldn't find this information in the knowledge base.",
          hasKnowledge: false,
          citedSources: [],
        });
      }

      const ai = getAI();
      if (!ai) {
        // Fallback if no Gemini API key configured
        const docNames = Array.from(new Set(contextChunks.map((c: any) => c.docName))).join(', ');
        const textExcerpt = contextChunks
          .slice(0, 3)
          .map((c: any) => c.text)
          .join('\n\n');
        return res.json({
          answer: `Based on the knowledge base (${docNames}):\n\n${textExcerpt}`,
          hasKnowledge: true,
          citedSources: Array.from(new Set(contextChunks.map((c: any) => c.docName))),
          modelUsed: 'Local Knowledge Base',
        });
      }

      // Format context chunks for Gemini prompt
      const formattedContext = contextChunks
        .map((chunk: any, index: number) => {
          return `--- [SOURCE DOCUMENT ${index + 1}: ${chunk.docName}] ---\n${chunk.text}`;
        })
        .join('\n\n');

      const prompt = `You are the Fitness AI Assistant utilizing a Retrieval-Augmented Generation (RAG) pipeline.
Your task is to answer the user's question strictly and exclusively using the provided knowledge base context chunks below.

STRICT SAFETY & CLINICAL GUARDRAILS:
1. Do NOT diagnose medical conditions or prescribe medication under any circumstances.
2. Do NOT give dangerous, reckless, or injurious exercise instructions.
3. For potentially medical questions, acute pain, injuries, or clinical conditions, provide a general safety message and recommend consulting a qualified healthcare professional.

STRICT KNOWLEDGE BASE INSTRUCTIONS:
1. Base your answer directly on the retrieved context chunks below.
2. Do NOT invent, assume, or extrapolate facts that are not explicitly stated in the retrieved context.
3. If the knowledge base does not contain the answer, or if the retrieved context is insufficient to answer the user's question accurately, you MUST return EXACTLY:
"I couldn't find enough information about this in the Fitness AI knowledge base."
4. If the retrieved context DOES answer the question, formulate a clear, precise, and practical fitness response. Mention which document(s) provided the insights.

RETRIEVED KNOWLEDGE BASE CONTEXT:
${formattedContext}

USER QUESTION:
${query}

YOUR ANSWER:`;

      let responseText = '';
      let modelUsed = 'gemini-3.8-flash';

      const candidateModels = ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash'];

      for (const modelCandidate of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model: modelCandidate,
            contents: prompt,
          });
          const text = response.text?.trim();
          if (text) {
            responseText = text;
            modelUsed = modelCandidate;
            break;
          }
        } catch {
          // Continue to next available model or synthesizer
          continue;
        }
      }

      // If AI model returned valid text
      if (responseText) {
        const isNotFound =
          responseText.toLowerCase().includes("couldn't find enough information") ||
          responseText.toLowerCase().includes("could not find enough information") ||
          responseText.toLowerCase().includes("couldn't find this information") ||
          responseText.toLowerCase().includes("could not find this information");

        const citedSources = Array.from(new Set(contextChunks.map((c: any) => c.docName)));
        return res.json({
          answer: isNotFound
            ? "I couldn't find enough information about this in the Fitness AI knowledge base."
            : responseText,
          hasKnowledge: !isNotFound,
          citedSources: isNotFound ? [] : citedSources,
          modelUsed,
        });
      }

      // Fallback: Deterministic context synthesis when AI API is unavailable
      const queryWords = query
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter((w: string) => w.length > 3);

      const bestChunk = contextChunks[0];
      const hasOverlap = queryWords.some((w: string) => bestChunk.text.toLowerCase().includes(w));

      if (hasOverlap) {
        const docNames = Array.from(new Set(contextChunks.map((c: any) => c.docName))).join(', ');
        const matchingSentences: string[] = [];
        for (const c of contextChunks) {
          const sentences = c.text.split(/(?<=[.?!])\s+/);
          for (const s of sentences) {
            if (s.length > 15 && queryWords.some((w: string) => s.toLowerCase().includes(w))) {
              matchingSentences.push(s.trim());
            }
          }
        }

        const answer =
          matchingSentences.length > 0
            ? `Based on the knowledge base (${docNames}):\n\n${matchingSentences.slice(0, 3).join('\n\n')}`
            : `Based on the knowledge base (${docNames}):\n\n${bestChunk.text.slice(0, 450)}`;

        return res.json({
          answer,
          hasKnowledge: true,
          citedSources: Array.from(new Set(contextChunks.map((c: any) => c.docName))),
          modelUsed: 'RAG Knowledge Base Synthesizer',
        });
      }

      return res.json({
        answer: "I couldn't find enough information about this in the Fitness AI knowledge base.",
        hasKnowledge: false,
        citedSources: [],
      });
    } catch {
      return res.json({
        answer: "I couldn't find enough information about this in the Fitness AI knowledge base.",
        hasKnowledge: false,
      });
    }
  });

  // Vite middleware for development vs static build for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Fitness AI server running on http://localhost:${PORT}`);
  });
}

startServer();

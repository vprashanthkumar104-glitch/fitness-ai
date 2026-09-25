import { KnowledgeChunk, RAGChunkMatch, RAGQueryResult } from '../types';

/**
 * Text Splitting Utility
 * Splits document text into small, searchable chunks with contextual overlap.
 * Uses paragraph and sentence boundaries where possible.
 */
export function splitIntoChunks(
  text: string,
  docId: string,
  docName: string,
  targetWordCount: number = 200,
  overlapWordCount: number = 35
): KnowledgeChunk[] {
  if (!text || text.trim().length === 0) return [];

  // Normalize line breaks
  const cleaned = text.replace(/\r\n/g, '\n').replace(/\t/g, ' ').trim();

  // Split into paragraphs first
  const paragraphs = cleaned.split(/\n\s*\n/).filter((p) => p.trim().length > 0);

  const wordsWithMeta: string[] = [];
  for (const para of paragraphs) {
    const pWords = para.split(/\s+/).filter(Boolean);
    wordsWithMeta.push(...pWords);
    // Add paragraph break sentinel
    wordsWithMeta.push('__P_BREAK__');
  }

  const rawWords = wordsWithMeta.filter((w) => w !== '__P_BREAK__');
  if (rawWords.length === 0) return [];

  const chunks: KnowledgeChunk[] = [];
  let startIndex = 0;
  let chunkIndex = 0;

  while (startIndex < rawWords.length) {
    const endIndex = Math.min(startIndex + targetWordCount, rawWords.length);
    const chunkWords = rawWords.slice(startIndex, endIndex);
    const chunkText = chunkWords.join(' ').trim();

    if (chunkText.length > 20) {
      chunks.push({
        id: `chunk_${docId}_${chunkIndex}`,
        docId,
        docName,
        chunkIndex,
        text: chunkText,
        charCount: chunkText.length,
        wordCount: chunkWords.length,
        createdAt: new Date().toISOString(),
      });
      chunkIndex++;
    }

    if (endIndex >= rawWords.length) break;
    // Advance with overlap
    startIndex += Math.max(1, targetWordCount - overlapWordCount);
  }

  return chunks;
}

/**
 * Compute Deterministic Local Vector Embedding (128-dimensions)
 * Used as a fast, reliable local embedding or fallback for semantic similarity
 */
export function generateLocalEmbedding(text: string): number[] {
  const DIM = 128;
  const vector = new Array(DIM).fill(0);
  const normalized = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  const words = normalized.split(/\s+/).filter((w) => w.length > 1);

  if (words.length === 0) return vector;

  // Hash each word and 2-gram into the vector space with TF weighting
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    let hash = 0;
    for (let c = 0; c < word.length; c++) {
      hash = (hash * 31 + word.charCodeAt(c)) & 0xffffffff;
    }
    const idx = Math.abs(hash) % DIM;
    vector[idx] += 1;

    // Bigram for phrase context
    if (i < words.length - 1) {
      const bigram = `${word}_${words[i + 1]}`;
      let bHash = 0;
      for (let c = 0; c < bigram.length; c++) {
        bHash = (bHash * 37 + bigram.charCodeAt(c)) & 0xffffffff;
      }
      const bIdx = Math.abs(bHash) % DIM;
      vector[bIdx] += 1.5;
    }
  }

  // L2 Normalize
  let sumSq = 0;
  for (let i = 0; i < DIM; i++) {
    sumSq += vector[i] * vector[i];
  }
  const magnitude = Math.sqrt(sumSq) || 1;
  for (let i = 0; i < DIM; i++) {
    vector[i] /= magnitude;
  }

  return vector;
}

/**
 * Fetch vector embedding from server (Gemini embedContent) with local fallback
 */
export async function createEmbedding(text: string): Promise<number[]> {
  try {
    const res = await fetch('/api/rag/embed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.embedding) && data.embedding.length > 0) {
        return data.embedding;
      }
    }
  } catch {
    // Network or server not ready, continue to local embedding
  }

  // Graceful deterministic fallback
  return generateLocalEmbedding(text);
}

/**
 * Cosine Similarity between two numeric vectors
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (!a || !b || a.length === 0 || b.length === 0) return 0;
  const len = Math.min(a.length, b.length);

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < len; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) return 0;
  const sim = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  return Math.max(0, Math.min(1, sim));
}

/**
 * Keyword overlap / BM25-inspired lexical score
 */
function keywordRelevanceScore(query: string, text: string): number {
  const normalizedQuery = query.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').trim();
  const targetLower = text.toLowerCase();

  // Full exact query or key phrase bonus
  if (targetLower.includes(normalizedQuery)) {
    return 1.0;
  }

  const stopWords = new Set(['what', 'is', 'are', 'the', 'and', 'for', 'in', 'on', 'at', 'to', 'a', 'an', 'of', 'how', 'do', 'does']);
  const allTokens = normalizedQuery.split(/\s+/).filter((w) => w.length >= 2);
  const meaningfulTokens = allTokens.filter((w) => !stopWords.has(w));
  const queryTokens = meaningfulTokens.length > 0 ? meaningfulTokens : allTokens;

  if (queryTokens.length === 0) return 0;

  let matchedTokens = 0;
  for (const token of queryTokens) {
    // Word boundary or inclusion match
    if (targetLower.includes(token)) {
      matchedTokens++;
    }
  }

  // Check 2-word phrase matches
  let phraseMatches = 0;
  for (let i = 0; i < allTokens.length - 1; i++) {
    const pair = `${allTokens[i]} ${allTokens[i + 1]}`;
    if (targetLower.includes(pair)) {
      phraseMatches++;
    }
  }

  const tokenRatio = matchedTokens / queryTokens.length;
  const phraseBonus = Math.min(0.5, phraseMatches * 0.25);
  return Math.min(1.0, tokenRatio + phraseBonus);
}

/**
 * Search the most relevant chunks in the knowledge base
 */
export async function searchRelevantChunks(
  query: string,
  chunks: KnowledgeChunk[],
  topK: number = 6,
  minThreshold: number = 0.18
): Promise<RAGChunkMatch[]> {
  if (!chunks || chunks.length === 0 || !query.trim()) {
    return [];
  }

  // Obtain query embedding
  const queryEmbedding = await createEmbedding(query);

  const scoredChunks: RAGChunkMatch[] = [];

  for (const chunk of chunks) {
    // If chunk doesn't have an embedding cached, generate on the fly
    let chunkVec = chunk.embedding;
    if (!chunkVec || chunkVec.length === 0) {
      chunkVec = generateLocalEmbedding(chunk.text);
    }

    let semanticScore = 0;
    if (queryEmbedding.length === chunkVec.length) {
      semanticScore = cosineSimilarity(queryEmbedding, chunkVec);
    } else {
      // Dimension mismatch (e.g. Gemini 3072d vs local 128d), recompute with local
      const localQueryVec = generateLocalEmbedding(query);
      const localChunkVec = generateLocalEmbedding(chunk.text);
      semanticScore = cosineSimilarity(localQueryVec, localChunkVec);
    }

    const lexicalScore = keywordRelevanceScore(query, chunk.text);

    // Hybrid relevance weighting
    const combinedScore = semanticScore * 0.65 + lexicalScore * 0.35;

    if (combinedScore >= minThreshold) {
      scoredChunks.push({
        chunk,
        similarity: Math.round(combinedScore * 100) / 100,
      });
    }
  }

  // Sort descending by similarity
  scoredChunks.sort((a, b) => b.similarity - a.similarity);

  return scoredChunks.slice(0, topK);
}

/**
 * Safety & Clinical Guardrail Checker
 * Prevents medical diagnosis, prescriptions, or dangerous workout instructions.
 */
export function checkMedicalSafety(query: string): string | null {
  const q = query.toLowerCase();

  const medicalPatterns = [
    /\b(diagnos(e|is|ing)|do i have|disease|syndrome|pathology)\b/i,
    /\b(prescri(be|ption)|medication|drug|steroid|anabolic|pharmaceutical|antibiotic|ibuprofen dose|painkiller)\b/i,
    /\b(chest pain|heart attack|stroke|broken bone|fracture|torn acl|torn ligament|concussion|hernia|severe shortness of breath)\b/i,
    /\b(train through (sharp|severe) pain|workout with concussion|ignore chest pain|starve myself|dry fast)\b/i
  ];

  for (const pattern of medicalPatterns) {
    if (pattern.test(q)) {
      return "I cannot diagnose medical conditions, prescribe medication, or provide clinical advice. For medical concerns, symptoms, pain, injuries, or health diagnosis, please consult a qualified physician or healthcare professional promptly.";
    }
  }

  return null;
}

/**
 * Primary RAG Q&A Execution
 * Queries the Knowledge Base chunks and generates an AI answer based strictly on retrieved context.
 */
export async function askKnowledgeBase(
  userQuery: string,
  availableChunks: KnowledgeChunk[]
): Promise<RAGQueryResult> {
  const startTime = Date.now();
  const trimmed = userQuery.trim();

  if (!trimmed) {
    return {
      answer: 'Please enter a fitness or training question to search your knowledge base.',
      hasKnowledge: false,
      retrievedChunks: [],
      queryTimeMs: 0,
    };
  }

  // Safety check before processing
  const safetyWarning = checkMedicalSafety(trimmed);
  if (safetyWarning) {
    return {
      answer: safetyWarning,
      hasKnowledge: true,
      retrievedChunks: [],
      queryTimeMs: Date.now() - startTime,
      modelUsed: 'Fitness AI Safety Guardrail',
    };
  }

  if (!availableChunks || availableChunks.length === 0) {
    return {
      answer: "I couldn't find enough information about this in the Fitness AI knowledge base.",
      hasKnowledge: false,
      retrievedChunks: [],
      queryTimeMs: Date.now() - startTime,
    };
  }

  // 1. Search for most relevant chunks
  const matches = await searchRelevantChunks(trimmed, availableChunks, 6, 0.18);

  // If no chunks matched or relevance is very weak
  if (matches.length === 0) {
    return {
      answer: "I couldn't find enough information about this in the Fitness AI knowledge base.",
      hasKnowledge: false,
      retrievedChunks: [],
      queryTimeMs: Date.now() - startTime,
    };
  }

  // 2. Prepare context payload
  const contextChunksPayload = matches.map((m) => ({
    id: m.chunk.id,
    docName: m.chunk.docName,
    text: m.chunk.text,
    similarity: m.similarity,
  }));

  // 3. Send query + retrieved context to server-side Gemini API
  try {
    const res = await fetch('/api/rag/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: trimmed,
        contextChunks: contextChunksPayload,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const answer = data.answer || "I couldn't find enough information about this in the Fitness AI knowledge base.";
      const isNotFound =
        !data.hasKnowledge ||
        answer.toLowerCase().includes("couldn't find enough information") ||
        answer.toLowerCase().includes("could not find enough information") ||
        answer.toLowerCase().includes("couldn't find this information") ||
        answer.toLowerCase().includes("could not find this information");

      return {
        answer: isNotFound
          ? "I couldn't find enough information about this in the Fitness AI knowledge base."
          : answer,
        hasKnowledge: !isNotFound,
        retrievedChunks: matches,
        queryTimeMs: Date.now() - startTime,
        modelUsed: data.modelUsed || 'gemini-3.8-flash',
      };
    }
  } catch {
    // Graceful fallback to local synthesis
  }

  // 4. Local synthesis fallback (strictly follows knowledge base constraints)
  return fallbackLocalSynthesis(trimmed, matches, startTime);
}

/**
 * High-quality deterministic local fallback synthesis if server is unreachable
 */
function fallbackLocalSynthesis(
  query: string,
  matches: RAGChunkMatch[],
  startTime: number
): RAGQueryResult {
  const queryWords = query.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
  const bestMatch = matches[0];

  // Verify if best match contains keyword overlap with user's question
  const hasSubstantialOverlap = queryWords.some((w) =>
    bestMatch.chunk.text.toLowerCase().includes(w)
  );

  if (!hasSubstantialOverlap && bestMatch.similarity < 0.35) {
    return {
      answer: "I couldn't find enough information about this in the Fitness AI knowledge base.",
      hasKnowledge: false,
      retrievedChunks: matches,
      queryTimeMs: Date.now() - startTime,
    };
  }

  // Extract key sentences matching query words from the retrieved chunks
  const extractedSnippets: string[] = [];
  const sourcesSet = new Set<string>();

  for (const match of matches) {
    sourcesSet.add(match.chunk.docName);
    const sentences = match.chunk.text.split(/(?<=[.?!])\s+/);
    for (const sentence of sentences) {
      if (
        sentence.length > 20 &&
        queryWords.some((w) => sentence.toLowerCase().includes(w))
      ) {
        if (!extractedSnippets.includes(sentence.trim())) {
          extractedSnippets.push(sentence.trim());
        }
      }
    }
  }

  if (extractedSnippets.length === 0) {
    // If no specific sentence matched, provide summary of top chunk
    const firstSentences = bestMatch.chunk.text.split(/(?<=[.?!])\s+/).slice(0, 3).join(' ');
    extractedSnippets.push(firstSentences);
  }

  const citedDocs = Array.from(sourcesSet).join(', ');
  const answer = `Based on the knowledge base (${citedDocs}):\n\n${extractedSnippets.slice(0, 4).join('\n\n')}`;

  return {
    answer,
    hasKnowledge: true,
    retrievedChunks: matches,
    queryTimeMs: Date.now() - startTime,
    modelUsed: 'RAG Context Synthesizer',
  };
}

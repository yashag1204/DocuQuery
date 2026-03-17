import { GoogleGenAI } from "@google/genai";

// Use the Endee package for structure if available
// In a real scenario, this would connect to the Endee C++ backend
export interface DocumentChunk {
  text: string;
  embedding?: number[];
  metadata: {
    source: string;
    index: number;
    id: string;
  };
}

const getApiKey = () => {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    console.error("GEMINI_API_KEY is missing from environment.");
    return null;
  }
  return key;
};

export const getAI = () => {
  const apiKey = getApiKey();
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const generateEmbedding = async (text: string) => {
  try {
    const ai = getAI();
    if (!ai) throw new Error("AI client not initialized");
    
    const result = await ai.models.embedContent({
      model: "gemini-embedding-2-preview",
      contents: [text]
    });
    return result.embeddings[0].values;
  } catch (error) {
    console.error("Embedding generation failed:", error);
    return null;
  }
};

export const cosineSimilarity = (vecA: number[], vecB: number[]) => {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dotProduct / denominator;
};

export const searchChunks = async (query: string, chunks: DocumentChunk[], topK = 3) => {
  const queryEmbedding = await generateEmbedding(query);
  if (!queryEmbedding) return [];
  
  const scoredChunks = chunks.map(chunk => ({
    ...chunk,
    score: chunk.embedding ? cosineSimilarity(queryEmbedding, chunk.embedding) : 0
  }));

  return scoredChunks
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
};

export const generateAnswer = async (query: string, context: string) => {
  try {
    const ai = getAI();
    if (!ai) return "AI service is currently unavailable. Please check your API key.";
    
    const prompt = `
      You are DocuQuery, a professional document analysis assistant.
      Use the following context to answer the user's question.
      If the answer is not in the context, say you don't know based on the provided documents.
      
      CONTEXT:
      ${context}
      
      QUESTION:
      ${query}
      
      ANSWER:
    `;

    const result = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt
    });
    return result.text || "I couldn't generate an answer based on the provided documents.";
  } catch (error) {
    console.error("Answer generation failed:", error);
    return "An error occurred while generating the answer.";
  }
};

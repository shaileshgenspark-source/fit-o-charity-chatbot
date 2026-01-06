/**
 * Gemini AI Service with Secure API Key & Persistent Knowledgebase
 * @license SPDX-License-Identifier: Apache-2.0
 */
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { QueryResult } from '../types';

let ai: GoogleGenAI | null = null;
let currentApiKey: string | null = null;

// Storage keys
const API_KEY_STORAGE = 'foc_gemini_api_key';
const RAG_STORE_STORAGE = 'foc_rag_store_name';
const UPLOADED_DOCS_STORAGE = 'foc_uploaded_docs';

// ==================== API Key Management ====================

/**
 * Get stored API key from localStorage
 */
export function getStoredApiKey(): string | null {
    try {
        return localStorage.getItem(API_KEY_STORAGE);
    } catch {
        return null;
    }
}

/**
 * Save API key to localStorage
 */
export function saveApiKey(apiKey: string): void {
    try {
        localStorage.setItem(API_KEY_STORAGE, apiKey);
    } catch (e) {
        console.error("Failed to save API key to localStorage:", e);
    }
}

/**
 * Clear stored API key
 */
export function clearApiKey(): void {
    try {
        localStorage.removeItem(API_KEY_STORAGE);
        ai = null;
        currentApiKey = null;
    } catch (e) {
        console.error("Failed to clear API key:", e);
    }
}

/**
 * Check if an API key is configured (either stored or from env)
 */
export function hasApiKey(): boolean {
    return !!(getStoredApiKey() || import.meta.env.VITE_GEMINI_API_KEY);
}

/**
 * Get the configured API key (stored takes precedence over env)
 */
function getApiKey(): string | null {
    const storedKey = getStoredApiKey();
    if (storedKey) return storedKey;

    const envKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (envKey) return envKey;

    return null;
}

/**
 * Initialize the Gemini AI client
 */
export function initialize(customApiKey?: string): boolean {
    const apiKey = customApiKey || getApiKey();

    if (!apiKey) {
        throw new Error("No API key configured. Please add your Gemini API key in the Admin panel.");
    }

    if (ai && currentApiKey === apiKey) {
        return true;
    }

    try {
        ai = new GoogleGenAI({ apiKey });
        currentApiKey = apiKey;

        if (customApiKey) {
            saveApiKey(customApiKey);
        }

        return true;
    } catch (e) {
        console.error("Failed to initialize Gemini AI:", e);
        throw e;
    }
}

/**
 * Validate an API key by making a simple request
 */
export async function validateApiKey(apiKey: string): Promise<boolean> {
    try {
        const testAi = new GoogleGenAI({ apiKey });
        await testAi.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: 'Hi',
            config: { maxOutputTokens: 5 }
        });
        return true;
    } catch (e) {
        console.error("API key validation failed:", e);
        return false;
    }
}

// ==================== Knowledgebase Persistence ====================

/**
 * Get stored RAG store name from localStorage
 */
export function getStoredRagStore(): string | null {
    try {
        return localStorage.getItem(RAG_STORE_STORAGE);
    } catch {
        return null;
    }
}

/**
 * Save RAG store name to localStorage
 */
export function saveRagStore(ragStoreName: string): void {
    try {
        localStorage.setItem(RAG_STORE_STORAGE, ragStoreName);
    } catch (e) {
        console.error("Failed to save RAG store name:", e);
    }
}

/**
 * Clear stored RAG store
 */
export function clearStoredRagStore(): void {
    try {
        localStorage.removeItem(RAG_STORE_STORAGE);
        localStorage.removeItem(UPLOADED_DOCS_STORAGE);
    } catch (e) {
        console.error("Failed to clear RAG store:", e);
    }
}

/**
 * Get stored uploaded document names
 */
export function getStoredDocs(): string[] {
    try {
        const docs = localStorage.getItem(UPLOADED_DOCS_STORAGE);
        return docs ? JSON.parse(docs) : [];
    } catch {
        return [];
    }
}

/**
 * Save uploaded document names
 */
export function saveUploadedDocs(docs: string[]): void {
    try {
        localStorage.setItem(UPLOADED_DOCS_STORAGE, JSON.stringify(docs));
    } catch (e) {
        console.error("Failed to save uploaded docs:", e);
    }
}

/**
 * Check if knowledgebase is configured
 */
export function hasKnowledgebase(): boolean {
    return !!getStoredRagStore();
}

// ==================== RAG Operations ====================

async function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function createRagStore(displayName: string): Promise<string> {
    if (!ai) throw new Error("Gemini AI not initialized");
    const ragStore = await ai.fileSearchStores.create({ config: { displayName } });
    if (!ragStore.name) {
        throw new Error("Failed to create RAG store: name is missing.");
    }
    // Save the RAG store for persistence
    saveRagStore(ragStore.name);
    return ragStore.name;
}

export async function uploadToRagStore(ragStoreName: string, file: File): Promise<void> {
    if (!ai) throw new Error("Gemini AI not initialized");

    let op = await ai.fileSearchStores.uploadToFileSearchStore({
        fileSearchStoreName: ragStoreName,
        file: file
    });

    while (!op.done) {
        await delay(3000);
        op = await ai.operations.get({ operation: op });
    }
}

export async function fileSearch(ragStoreName: string, query: string): Promise<QueryResult> {
    if (!ai) throw new Error("Gemini AI not initialized");
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: query + " DO NOT ASK THE USER TO READ THE MANUAL, pinpoint the relevant sections in the response itself. Be helpful and provide detailed answers about the Fit-O-Charity event.",
        config: {
            tools: [
                {
                    fileSearch: {
                        fileSearchStoreNames: [ragStoreName],
                    }
                }
            ]
        }
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    return {
        text: response.text,
        groundingChunks: groundingChunks,
    };
}

export async function generateExampleQuestions(ragStoreName: string): Promise<string[]> {
    if (!ai) throw new Error("Gemini AI not initialized");
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: "You are provided documents about a fitness charity event called Fit-O-Charity. Generate 6 short and practical example questions a user might ask about the event in English. Focus on registration, activities, rules, prizes, and charity aspects. Return the questions as a JSON array of strings. Example: [\"How do I register?\", \"What activities are included?\"]",
            config: {
                tools: [
                    {
                        fileSearch: {
                            fileSearchStoreNames: [ragStoreName],
                        }
                    }
                ]
            }
        });

        let jsonText = response.text.trim();

        const jsonMatch = jsonText.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch && jsonMatch[1]) {
            jsonText = jsonMatch[1];
        } else {
            const firstBracket = jsonText.indexOf('[');
            const lastBracket = jsonText.lastIndexOf(']');
            if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
                jsonText = jsonText.substring(firstBracket, lastBracket + 1);
            }
        }

        const parsedData = JSON.parse(jsonText);

        if (Array.isArray(parsedData)) {
            if (parsedData.length === 0) {
                return getDefaultQuestions();
            }
            const firstItem = parsedData[0];

            if (typeof firstItem === 'object' && firstItem !== null && 'questions' in firstItem && Array.isArray(firstItem.questions)) {
                return parsedData.flatMap(item => (item.questions || [])).filter(q => typeof q === 'string');
            }

            if (typeof firstItem === 'string') {
                return parsedData.filter(q => typeof q === 'string');
            }
        }

        return getDefaultQuestions();
    } catch (error) {
        console.error("Failed to generate example questions:", error);
        return getDefaultQuestions();
    }
}

function getDefaultQuestions(): string[] {
    return [
        "How do I register for Fit-O-Charity?",
        "What activities can I participate in?",
        "How are fitness points calculated?",
        "What are the prizes for winners?",
        "How does the charity donation work?",
        "What is the age criteria for participation?"
    ];
}

export async function deleteRagStore(ragStoreName: string): Promise<void> {
    if (!ai) throw new Error("Gemini AI not initialized");
    try {
        await ai.fileSearchStores.delete({
            name: ragStoreName,
            config: { force: true },
        });
    } catch (e) {
        console.error("Failed to delete RAG store:", e);
    }
    // Clear from localStorage
    clearStoredRagStore();
}

/**
 * Delete current knowledgebase and clear storage
 */
export async function clearKnowledgebase(): Promise<void> {
    const ragStoreName = getStoredRagStore();
    if (ragStoreName) {
        try {
            if (ai) {
                await ai.fileSearchStores.delete({
                    name: ragStoreName,
                    config: { force: true },
                });
            }
        } catch (e) {
            console.error("Failed to delete RAG store from server:", e);
        }
    }
    clearStoredRagStore();
}
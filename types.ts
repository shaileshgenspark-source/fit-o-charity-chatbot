/**
 * Fit-O-Charity Chatbot Types
 * @license SPDX-License-Identifier: Apache-2.0
 */

export interface RagStore {
    name: string;
    displayName: string;
}

export interface CustomMetadata {
    key?: string;
    stringValue?: string;
    stringListValue?: string[];
    numericValue?: number;
}

export interface Document {
    name: string;
    displayName: string;
    customMetadata?: CustomMetadata[];
}

export interface GroundingChunk {
    retrievedContext?: {
        text?: string;
    };
}

export interface QueryResult {
    text: string;
    groundingChunks: GroundingChunk[];
}

export enum AppStatus {
    Initializing,
    Welcome,
    Uploading,
    Chatting,
    Admin,
    Error,
}

export enum AppMode {
    User = 'user',
    Admin = 'admin',
}

export interface ChatMessage {
    role: 'user' | 'model';
    parts: { text: string }[];
    groundingChunks?: GroundingChunk[];
}

export interface EventActivity {
    name: string;
    icon: string;
    color: string;
}

export interface KnowledgebaseFile {
    name: string;
    size: number;
    uploadedAt: Date;
}

/**
 * Fit-O-Charity Chatbot
 * Main Application Component with Persistent Knowledgebase
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { AppStatus, ChatMessage } from './types';
import * as geminiService from './services/geminiService';
import Spinner from './components/Spinner';
import WelcomeScreen from './components/WelcomeScreen';
import ProgressBar from './components/ProgressBar';
import ChatInterface from './components/ChatInterface';
import AdminPanel from './components/AdminPanel';

const App: React.FC = () => {
    const [status, setStatus] = useState<AppStatus>(AppStatus.Initializing);
    const [hasApiKey, setHasApiKey] = useState(false);
    const [hasKnowledgebase, setHasKnowledgebase] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeRagStoreName, setActiveRagStoreName] = useState<string | null>(null);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [isQueryLoading, setIsQueryLoading] = useState(false);
    const [exampleQuestions, setExampleQuestions] = useState<string[]>([]);
    const [documentName, setDocumentName] = useState<string>('');
    const [uploadedDocs, setUploadedDocs] = useState<string[]>([]);

    // Check for API key and knowledgebase on mount
    useEffect(() => {
        const initializeApp = async () => {
            // Check API key
            const hasKey = geminiService.hasApiKey();
            setHasApiKey(hasKey);

            // Check for existing knowledgebase
            const ragStore = geminiService.getStoredRagStore();
            const docs = geminiService.getStoredDocs();

            if (ragStore && hasKey) {
                setActiveRagStoreName(ragStore);
                setUploadedDocs(docs);
                setHasKnowledgebase(true);

                // Set document name
                if (docs.length === 1) {
                    setDocumentName(docs[0]);
                } else if (docs.length > 1) {
                    setDocumentName(`${docs.length} documents`);
                }

                // Generate example questions if we have a valid setup
                try {
                    geminiService.initialize();
                    const questions = await geminiService.generateExampleQuestions(ragStore);
                    setExampleQuestions(questions);
                } catch (e) {
                    console.error("Failed to generate questions:", e);
                    setExampleQuestions(geminiService.getStoredDocs().length > 0 ? [
                        "How do I register for Fit-O-Charity?",
                        "What activities can I participate in?",
                        "How are fitness points calculated?"
                    ] : []);
                }
            }

            setStatus(AppStatus.Welcome);
        };

        initializeApp();

        // Re-check when window gains focus
        const handleFocus = () => {
            const hasKey = geminiService.hasApiKey();
            setHasApiKey(hasKey);
            const hasKB = geminiService.hasKnowledgebase();
            setHasKnowledgebase(hasKB);
        };
        window.addEventListener('focus', handleFocus);

        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, []);

    const handleError = (message: string, err: any) => {
        console.error(message, err);
        setError(`${message}${err ? `: ${err instanceof Error ? err.message : String(err)}` : ''}`);
        setStatus(AppStatus.Error);
    };

    const clearError = () => {
        setError(null);
        setStatus(AppStatus.Welcome);
    };

    const handleAdminMode = () => {
        setStatus(AppStatus.Admin);
    };

    const handleBackFromAdmin = () => {
        // Refresh state from storage when leaving admin
        const hasKey = geminiService.hasApiKey();
        setHasApiKey(hasKey);

        const ragStore = geminiService.getStoredRagStore();
        const docs = geminiService.getStoredDocs();

        if (ragStore && hasKey) {
            setActiveRagStoreName(ragStore);
            setUploadedDocs(docs);
            setHasKnowledgebase(true);

            if (docs.length === 1) {
                setDocumentName(docs[0]);
            } else if (docs.length > 1) {
                setDocumentName(`${docs.length} documents`);
            }
        } else {
            setActiveRagStoreName(null);
            setUploadedDocs([]);
            setHasKnowledgebase(false);
            setDocumentName('');
        }

        setStatus(AppStatus.Welcome);
    };

    const handleKnowledgebaseChange = async () => {
        // Called when admin uploads/changes knowledgebase
        const ragStore = geminiService.getStoredRagStore();
        const docs = geminiService.getStoredDocs();

        if (ragStore) {
            setActiveRagStoreName(ragStore);
            setUploadedDocs(docs);
            setHasKnowledgebase(true);

            if (docs.length === 1) {
                setDocumentName(docs[0]);
            } else if (docs.length > 1) {
                setDocumentName(`${docs.length} documents`);
            }

            // Generate new example questions
            try {
                const questions = await geminiService.generateExampleQuestions(ragStore);
                setExampleQuestions(questions);
            } catch (e) {
                console.error("Failed to generate questions:", e);
            }
        } else {
            setActiveRagStoreName(null);
            setUploadedDocs([]);
            setHasKnowledgebase(false);
            setDocumentName('');
            setExampleQuestions([]);
        }
    };

    const handleStartChat = () => {
        if (activeRagStoreName && hasApiKey) {
            // Ensure Gemini is initialized
            try {
                geminiService.initialize();
                setChatHistory([]);
                setStatus(AppStatus.Chatting);
            } catch (err) {
                handleError("Failed to start chat", err);
            }
        }
    };

    const handleNewChat = () => {
        setChatHistory([]);
        setStatus(AppStatus.Welcome);
    };

    const handleSendMessage = async (message: string) => {
        if (!activeRagStoreName) return;

        const userMessage: ChatMessage = { role: 'user', parts: [{ text: message }] };
        setChatHistory(prev => [...prev, userMessage]);
        setIsQueryLoading(true);

        try {
            const result = await geminiService.fileSearch(activeRagStoreName, message);
            const modelMessage: ChatMessage = {
                role: 'model',
                parts: [{ text: result.text }],
                groundingChunks: result.groundingChunks
            };
            setChatHistory(prev => [...prev, modelMessage]);
        } catch (err) {
            const errorMessage: ChatMessage = {
                role: 'model',
                parts: [{ text: `Sorry, I encountered an error: ${err instanceof Error ? err.message : String(err)}. Please check the console for more details.` }]
            };
            setChatHistory(prev => [...prev, errorMessage]);
            console.error("Failed to get response", err);
        } finally {
            setIsQueryLoading(false);
        }
    };

    const renderContent = () => {
        switch (status) {
            case AppStatus.Initializing:
                return (
                    <div className="flex flex-col items-center justify-center h-screen">
                        <div className="text-6xl mb-4 animate-bounce">🏃</div>
                        <Spinner />
                        <span className="mt-4 text-xl text-white font-poppins">Initializing Fit-O-Charity...</span>
                    </div>
                );
            case AppStatus.Welcome:
                return (
                    <WelcomeScreen
                        onAdminMode={handleAdminMode}
                        hasApiKey={hasApiKey}
                        hasKnowledgebase={hasKnowledgebase}
                        onStartChat={handleStartChat}
                        uploadedDocs={uploadedDocs}
                    />
                );
            case AppStatus.Admin:
                return (
                    <AdminPanel
                        onBack={handleBackFromAdmin}
                        onKnowledgebaseChange={handleKnowledgebaseChange}
                    />
                );
            case AppStatus.Uploading:
                return (
                    <ProgressBar
                        progress={0}
                        total={1}
                        message="Processing..."
                    />
                );
            case AppStatus.Chatting:
                return (
                    <ChatInterface
                        documentName={documentName}
                        history={chatHistory}
                        isQueryLoading={isQueryLoading}
                        onSendMessage={handleSendMessage}
                        onNewChat={handleNewChat}
                        exampleQuestions={exampleQuestions}
                    />
                );
            case AppStatus.Error:
                return (
                    <div className="scrollable-page flex flex-col items-center justify-center p-4">
                        <div className="glass-card-strong p-8 max-w-md text-center">
                            <div className="text-6xl mb-4">😢</div>
                            <h1 className="font-poppins text-2xl font-bold text-white mb-4">Oops! Something went wrong</h1>
                            <p className="text-gray-400 mb-6">{error}</p>
                            <button
                                onClick={clearError}
                                className="btn-primary"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                );
            default:
                return (
                    <WelcomeScreen
                        onAdminMode={handleAdminMode}
                        hasApiKey={hasApiKey}
                        hasKnowledgebase={hasKnowledgebase}
                        onStartChat={handleStartChat}
                        uploadedDocs={uploadedDocs}
                    />
                );
        }
    };

    return (
        <main className="h-screen bg-foc-dark text-white overflow-auto">
            {renderContent()}
        </main>
    );
};

export default App;

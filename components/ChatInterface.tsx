/**
 * Fit-O-Charity ChatInterface
 * Beautiful chat interface with event branding
 * @license SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import Spinner from './Spinner';

interface ChatInterfaceProps {
    documentName: string;
    history: ChatMessage[];
    isQueryLoading: boolean;
    onSendMessage: (message: string) => void;
    onNewChat: () => void;
    exampleQuestions: string[];
}

// Quick action suggestions for Fit-O-Charity
const quickSuggestions = [
    "How do I register?",
    "What are the activities?",
    "How are points calculated?",
    "Prize details?",
];

const ChatInterface: React.FC<ChatInterfaceProps> = ({
    documentName,
    history,
    isQueryLoading,
    onSendMessage,
    onNewChat,
    exampleQuestions
}) => {
    const [query, setQuery] = useState('');
    const [currentSuggestion, setCurrentSuggestion] = useState('');
    const [modalContent, setModalContent] = useState<string | null>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (exampleQuestions.length === 0) {
            setCurrentSuggestion('');
            return;
        }

        setCurrentSuggestion(exampleQuestions[0]);
        let suggestionIndex = 0;
        const intervalId = setInterval(() => {
            suggestionIndex = (suggestionIndex + 1) % exampleQuestions.length;
            setCurrentSuggestion(exampleQuestions[suggestionIndex]);
        }, 5000);

        return () => clearInterval(intervalId);
    }, [exampleQuestions]);

    const renderMarkdown = (text: string) => {
        if (!text) return { __html: '' };

        const lines = text.split('\n');
        let html = '';
        let listType: 'ul' | 'ol' | null = null;
        let paraBuffer = '';

        function flushPara() {
            if (paraBuffer) {
                html += `<p class="my-2">${paraBuffer}</p>`;
                paraBuffer = '';
            }
        }

        function flushList() {
            if (listType) {
                html += `</${listType}>`;
                listType = null;
            }
        }

        for (const rawLine of lines) {
            const line = rawLine
                .replace(/\*\*(.*?)\*\*|__(.*?)__/g, '<strong class="text-foc-orange">$1$2</strong>')
                .replace(/\*(.*?)\*|_(.*?)_/g, '<em>$1$2</em>')
                .replace(/`([^`]+)`/g, '<code class="bg-white/10 px-1.5 py-0.5 rounded text-foc-blue font-mono text-sm">$1</code>');

            const isOl = line.match(/^\s*\d+\.\s(.*)/);
            const isUl = line.match(/^\s*[\*\-]\s(.*)/);

            if (isOl) {
                flushPara();
                if (listType !== 'ol') {
                    flushList();
                    html += '<ol class="list-decimal list-inside my-2 pl-5 space-y-1">';
                    listType = 'ol';
                }
                html += `<li>${isOl[1]}</li>`;
            } else if (isUl) {
                flushPara();
                if (listType !== 'ul') {
                    flushList();
                    html += '<ul class="list-disc list-inside my-2 pl-5 space-y-1">';
                    listType = 'ul';
                }
                html += `<li>${isUl[1]}</li>`;
            } else {
                flushList();
                if (line.trim() === '') {
                    flushPara();
                } else {
                    paraBuffer += (paraBuffer ? '<br/>' : '') + line;
                }
            }
        }

        flushPara();
        flushList();

        return { __html: html };
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            onSendMessage(query);
            setQuery('');
        }
    };

    const handleSourceClick = (text: string) => {
        setModalContent(text);
    };

    const closeModal = () => {
        setModalContent(null);
    };

    const handleQuickSuggestion = (suggestion: string) => {
        onSendMessage(suggestion);
    };

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history, isQueryLoading]);

    return (
        <div className="flex flex-col h-full relative">
            {/* Header */}
            <header className="absolute top-0 left-0 right-0 z-10">
                <div className="glass-card-strong mx-4 mt-4 p-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-foc-orange to-foc-pink flex items-center justify-center">
                            <span className="text-xl">🏃</span>
                        </div>
                        <div>
                            <h1 className="font-poppins font-bold text-white text-lg">Fit-O-Charity Assistant</h1>
                            <p className="text-gray-400 text-xs truncate max-w-[200px] md:max-w-none">
                                Powered by {documentName}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onNewChat}
                        className="btn-secondary text-sm flex items-center gap-2"
                    >
                        <span>🔄</span>
                        <span className="hidden sm:inline">New Chat</span>
                    </button>
                </div>
            </header>

            {/* Chat Messages */}
            <div className="flex-grow pt-28 pb-48 overflow-y-auto px-4">
                <div className="w-full max-w-4xl mx-auto space-y-4">
                    {/* Welcome message if no history */}
                    {history.length === 0 && (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4 animate-bounce">🏃</div>
                            <h2 className="font-poppins text-2xl font-bold text-white mb-2">
                                Welcome to Fit-O-Charity!
                            </h2>
                            <p className="text-gray-400 mb-6">
                                Ask me anything about the event
                            </p>

                            <div className="mb-8 max-w-xs mx-auto">
                                <a 
                                    href="https://fit-o-charity-dashboard.shailesh-genspark.workers.dev/" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="w-full btn-activity text-lg flex items-center justify-center gap-2 py-4"
                                >
                                    <span>🏆</span>
                                    <span>SUBMIT ACTIVITY</span>
                                </a>
                            </div>

                            {/* Quick Suggestions */}
                            <div className="flex flex-wrap justify-center gap-2">
                                {quickSuggestions.map((suggestion) => (
                                    <button
                                        key={suggestion}
                                        onClick={() => handleQuickSuggestion(suggestion)}
                                        className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-foc-orange/50 text-gray-300 px-4 py-2 rounded-full text-sm transition-all hover:scale-105"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Chat Messages */}
                    {history.map((message, index) => (
                        <div
                            key={index}
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
                        >
                            <div className={message.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-bot'}>
                                <div dangerouslySetInnerHTML={renderMarkdown(message.parts[0].text)} />

                                {/* Sources */}
                                {message.role === 'model' && message.groundingChunks && message.groundingChunks.length > 0 && (
                                    <div className="mt-4 pt-3 border-t border-white/10">
                                        <h4 className="text-xs font-semibold text-gray-400 mb-2">📚 Sources:</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {message.groundingChunks.map((chunk, chunkIndex) => (
                                                chunk.retrievedContext?.text && (
                                                    <button
                                                        key={chunkIndex}
                                                        onClick={() => handleSourceClick(chunk.retrievedContext!.text!)}
                                                        className="bg-foc-purple/20 hover:bg-foc-purple/30 text-foc-purple text-xs px-3 py-1 rounded-full transition-colors"
                                                    >
                                                        Source {chunkIndex + 1}
                                                    </button>
                                                )
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Loading Indicator */}
                    {isQueryLoading && (
                        <div className="flex justify-start animate-slide-up">
                            <div className="chat-bubble-bot flex items-center gap-3">
                                <div className="flex gap-1">
                                    <div className="typing-dot"></div>
                                    <div className="typing-dot"></div>
                                    <div className="typing-dot"></div>
                                </div>
                                <span className="text-gray-400 text-sm">Thinking...</span>
                            </div>
                        </div>
                    )}

                    <div ref={chatEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="max-w-4xl mx-auto">
                    {/* Rotating Suggestion */}
                    {!isQueryLoading && currentSuggestion && history.length > 0 && (
                        <div className="text-center mb-3">
                            <button
                                onClick={() => setQuery(currentSuggestion)}
                                className="text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full text-sm transition-all"
                            >
                                💡 Try: "{currentSuggestion}"
                            </button>
                        </div>
                    )}

                    {/* Input Form */}
                    <form onSubmit={handleSubmit} className="glass-card-strong p-3 flex items-center gap-3">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Ask about Fit-O-Charity..."
                            className="flex-grow bg-transparent text-white placeholder-gray-500 py-3 px-4 focus:outline-none"
                            disabled={isQueryLoading}
                        />
                        <button
                            type="submit"
                            disabled={isQueryLoading || !query.trim()}
                            className="btn-primary p-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </button>
                    </form>
                </div>
            </div>

            {/* Source Modal */}
            {modalContent !== null && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={closeModal}
                >
                    <div
                        className="glass-card-strong p-6 w-full max-w-2xl max-h-[80vh] flex flex-col animate-bounce-in"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-poppins font-bold text-white text-xl flex items-center gap-2">
                                <span>📄</span>
                                <span>Source Document</span>
                            </h3>
                            <button
                                onClick={closeModal}
                                className="text-gray-400 hover:text-white text-2xl"
                            >
                                ✕
                            </button>
                        </div>
                        <div
                            className="flex-grow overflow-y-auto text-gray-300 border-t border-b border-white/10 py-4"
                            dangerouslySetInnerHTML={renderMarkdown(modalContent || '')}
                        />
                        <div className="flex justify-end mt-4">
                            <button
                                onClick={closeModal}
                                className="btn-primary"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatInterface;

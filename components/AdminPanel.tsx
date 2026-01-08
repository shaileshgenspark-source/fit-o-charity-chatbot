/**
 * Fit-O-Charity Admin Panel
 * Knowledgebase management + API Key configuration for administrators
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useEffect } from 'react';
import Spinner from './Spinner';
import * as geminiService from '../services/geminiService';

// Check if using environment variables (production deployment)

interface AdminPanelProps {
    onBack: () => void;
    onKnowledgebaseChange: () => void;
}

const ADMIN_PIN = '9993';

const AdminPanel: React.FC<AdminPanelProps> = ({
    onBack,
    onKnowledgebaseChange
}) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [pin, setPin] = useState('');
    const [pinError, setPinError] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<string>('');

    // Files state
    const [files, setFiles] = useState<File[]>([]);

    // API Key state
    const [apiKey, setApiKey] = useState('');
    const [isApiKeySet, setIsApiKeySet] = useState(false);
    const [isValidatingKey, setIsValidatingKey] = useState(false);
    const [apiKeyError, setApiKeyError] = useState('');
    const [showApiKey, setShowApiKey] = useState(false);

    // Knowledgebase state
    const [uploadedDocs, setUploadedDocs] = useState<string[]>([]);

    // Environment variable detection (production mode)
    const isEnvApiKey = geminiService.isUsingEnvApiKey();
    const isEnvKnowledgebase = geminiService.isUsingGlobalKnowledgebase();
    const [hasKnowledgebase, setHasKnowledgebase] = useState(false);

    // Check for existing state on mount
    useEffect(() => {
        const hasKey = geminiService.hasApiKey();
        setIsApiKeySet(hasKey);
        const storedKey = geminiService.getStoredApiKey();
        if (storedKey) {
            setApiKey(storedKey);
        }

        const hasKB = geminiService.hasKnowledgebase();
        setHasKnowledgebase(hasKB);
        const docs = geminiService.getStoredDocs();
        setUploadedDocs(docs);
    }, []);

    const handlePinSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (pin === ADMIN_PIN) {
            setIsAuthenticated(true);
            setPinError('');
        } else {
            setPinError('Invalid PIN. Please try again.');
        }
    };

    const handleSaveApiKey = async () => {
        if (!apiKey.trim()) {
            setApiKeyError('Please enter an API key');
            return;
        }

        setIsValidatingKey(true);
        setApiKeyError('');

        try {
            const isValid = await geminiService.validateApiKey(apiKey.trim());
            if (isValid) {
                geminiService.saveApiKey(apiKey.trim());
                setIsApiKeySet(true);
                setApiKeyError('');
            } else {
                setApiKeyError('Invalid API key. Please check and try again.');
            }
        } catch (error) {
            setApiKeyError('Failed to validate API key. Please try again.');
        } finally {
            setIsValidatingKey(false);
        }
    };

    const handleClearApiKey = () => {
        geminiService.clearApiKey();
        setApiKey('');
        setIsApiKeySet(false);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setFiles(prev => [...prev, ...Array.from(event.target.files!)]);
        }
    };

    const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);
        if (event.dataTransfer.files) {
            setFiles(prev => [...prev, ...Array.from(event.dataTransfer.files)]);
        }
    }, []);

    const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        if (!isDragging) setIsDragging(true);
    }, [isDragging]);

    const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleRemoveFile = (indexToRemove: number) => {
        setFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
    };

    const handleUploadClick = async () => {
        if (!isApiKeySet) {
            setApiKeyError('Please configure your API key first');
            return;
        }

        if (files.length === 0) {
            return;
        }

        setIsUploading(true);
        setUploadProgress('Initializing...');

        try {
            // Initialize Gemini
            geminiService.initialize();

            // Clear existing knowledgebase if any
            if (hasKnowledgebase) {
                setUploadProgress('Clearing old knowledgebase...');
                await geminiService.clearKnowledgebase();
            }

            // Create new RAG store
            setUploadProgress('Creating knowledgebase...');
            const storeName = `fitocharity-${Date.now()}`;
            const ragStoreName = await geminiService.createRagStore(storeName);

            // Upload each file
            for (let i = 0; i < files.length; i++) {
                setUploadProgress(`Uploading ${files[i].name} (${i + 1}/${files.length})...`);
                await geminiService.uploadToRagStore(ragStoreName, files[i]);
            }

            // Save doc names
            const docNames = files.map(f => f.name);
            geminiService.saveUploadedDocs(docNames);

            setUploadProgress('Done! ✅');
            setUploadedDocs(docNames);
            setHasKnowledgebase(true);
            setFiles([]);

            // Notify parent
            onKnowledgebaseChange();

            // Reset progress after a moment
            setTimeout(() => {
                setUploadProgress('');
            }, 2000);

        } catch (error) {
            console.error("Upload failed:", error);
            setUploadProgress(`Error: ${error instanceof Error ? error.message : 'Upload failed'}`);
        } finally {
            setIsUploading(false);
        }
    };

    const handleClearKnowledgebase = async () => {
        if (!confirm('Are you sure you want to delete the knowledgebase? Users will not be able to chat until you upload new documents.')) {
            return;
        }

        setUploadProgress('Clearing knowledgebase...');
        try {
            geminiService.initialize();
            await geminiService.clearKnowledgebase();
            setHasKnowledgebase(false);
            setUploadedDocs([]);
            onKnowledgebaseChange();
            setUploadProgress('Knowledgebase cleared');
            setTimeout(() => setUploadProgress(''), 2000);
        } catch (error) {
            console.error("Failed to clear knowledgebase:", error);
            setUploadProgress('Error clearing knowledgebase');
        }
    };

    // PIN Entry Screen
    if (!isAuthenticated) {
        return (
            <div className="scrollable-page flex items-center justify-center p-4">
                <div className="glass-card-strong p-8 w-full max-w-md text-center">
                    <div className="text-6xl mb-4">🔐</div>
                    <h1 className="font-poppins text-2xl font-bold text-white mb-2">
                        Admin Access
                    </h1>
                    <p className="text-gray-400 mb-6">
                        Enter the admin PIN to manage knowledgebase
                    </p>

                    <form onSubmit={handlePinSubmit} className="space-y-4">
                        <input
                            type="password"
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            placeholder="Enter PIN"
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-center text-2xl tracking-widest focus:outline-none focus:border-foc-orange"
                            maxLength={4}
                        />
                        {pinError && (
                            <p className="text-red-400 text-sm">{pinError}</p>
                        )}
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={onBack}
                                className="flex-1 btn-secondary"
                            >
                                ← Back
                            </button>
                            <button
                                type="submit"
                                className="flex-1 btn-primary"
                            >
                                Unlock
                            </button>
                        </div>
                    </form>

                    <p className="text-gray-500 text-xs mt-6">
                        Demo PIN: 9993
                    </p>
                </div>
            </div>
        );
    }

    // Admin Dashboard
    return (
        <div className="scrollable-page p-4 md:p-8">
            {/* Header */}
            <div className="max-w-4xl mx-auto mb-8">
                <div className="flex justify-between items-center">
                    <button
                        onClick={onBack}
                        className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                    >
                        <span>←</span>
                        <span>Back to Dashboard</span>
                    </button>
                    <div className="admin-badge flex items-center gap-2">
                        <span>🔐</span>
                        <span>Admin Mode</span>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto pb-12">
                {/* Title */}
                <div className="text-center mb-8">
                    <h1 className="font-poppins text-3xl md:text-4xl font-bold text-white mb-2">
                        📚 Knowledgebase Manager
                    </h1>
                    <p className="text-gray-400">
                        Configure API key and manage documents for the Fit-O-Charity chatbot
                    </p>
                </div>

                {/* API Key Configuration */}
                <div className="glass-card-strong p-6 mb-6">
                    <h2 className="font-poppins font-bold text-white text-lg mb-4 flex items-center gap-2">
                        <span>🔑</span>
                        <span>Gemini API Key</span>
                        {isApiKeySet && <span className="text-foc-green text-sm ml-2">✓ Configured</span>}
                        {isEnvApiKey && <span className="text-foc-purple text-sm ml-2">🌐 Production</span>}
                    </h2>

                    {isEnvApiKey ? (
                        <div className="bg-foc-purple/10 border border-foc-purple/30 rounded-xl p-4">
                            <p className="text-foc-purple font-semibold mb-2">
                                ✓ API Key is pre-configured via Environment Variable
                            </p>
                            <p className="text-gray-400 text-sm">
                                The API key is securely set in Vercel/Netlify environment variables.
                                All users can use the chatbot without providing their own key.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="relative">
                                <input
                                    type={showApiKey ? "text" : "password"}
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    placeholder="Enter your Gemini API key (AIzaSy...)"
                                    className="api-key-input pr-24"
                                    disabled={isValidatingKey}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowApiKey(!showApiKey)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-sm"
                                >
                                    {showApiKey ? '🙈 Hide' : '👁 Show'}
                                </button>
                            </div>

                            {apiKeyError && (
                                <p className="text-red-400 text-sm">{apiKeyError}</p>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={handleSaveApiKey}
                                    disabled={isValidatingKey || !apiKey.trim()}
                                    className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isValidatingKey ? (
                                        <>
                                            <Spinner />
                                            <span>Validating...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>💾</span>
                                            <span>{isApiKeySet ? 'Update Key' : 'Save Key'}</span>
                                        </>
                                    )}
                                </button>
                                {isApiKeySet && (
                                    <button
                                        onClick={handleClearApiKey}
                                        className="btn-secondary text-red-400 hover:text-red-300"
                                    >
                                        🗑 Clear
                                    </button>
                                )}
                            </div>

                            <div className="bg-white/5 rounded-xl p-4 mt-4">
                                <h4 className="text-white font-semibold text-sm mb-2">💡 Get a Gemini API Key:</h4>
                                <ol className="text-gray-400 text-sm space-y-1 list-decimal list-inside">
                                    <li>Go to <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-foc-blue hover:underline">Google AI Studio</a></li>
                                    <li>Sign in with your Google account</li>
                                    <li>Click "Create API Key" and paste above</li>
                                </ol>
                            </div>
                        </div>
                    )}
                </div>

                {/* Current Knowledgebase Status */}
                <div className="glass-card-strong p-6 mb-6">
                    <h2 className="font-poppins font-bold text-white text-lg mb-4 flex items-center gap-2">
                        <span>📄</span>
                        <span>Current Knowledgebase</span>
                        {hasKnowledgebase && <span className="text-foc-green text-sm ml-2">✓ Active</span>}
                        {isEnvKnowledgebase && <span className="text-foc-purple text-sm ml-2">🌐 Production</span>}
                    </h2>

                    {hasKnowledgebase && uploadedDocs.length > 0 ? (
                        <div className="space-y-4">
                            <div className="bg-foc-green/10 border border-foc-green/30 rounded-xl p-4">
                                <p className="text-foc-green font-semibold mb-2">
                                    ✓ Knowledgebase is active with {uploadedDocs.length} document(s)
                                </p>
                                <p className="text-gray-400 text-sm">
                                    Users can now chat and ask questions about the event.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <h4 className="text-white font-semibold text-sm">Indexed Documents:</h4>
                                {uploadedDocs.map((doc, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-3 bg-white/5 p-3 rounded-xl"
                                    >
                                        <span className="text-xl">📄</span>
                                        <span className="text-white">{doc}</span>
                                    </div>
                                ))}
                            </div>

                            {isEnvKnowledgebase ? (
                                <div className="bg-foc-purple/10 border border-foc-purple/30 rounded-xl p-4 mt-4">
                                    <p className="text-foc-purple text-sm">
                                        ℹ️ This is a global permanent knowledgebase configured via environment variables.
                                        To change it, you must upload new documents, get the new ID, key update the environment variable in Vercel.
                                    </p>
                                </div>
                            ) : (
                                <button
                                    onClick={handleClearKnowledgebase}
                                    className="w-full btn-secondary text-red-400 hover:text-red-300 flex items-center justify-center gap-2"
                                >
                                    <span>🗑</span>
                                    <span>Clear Knowledgebase</span>
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                            <p className="text-yellow-400">
                                ⚠️ No knowledgebase configured. Please upload documents below.
                            </p>
                        </div>
                    )}
                </div>

                {/* Permanent Hosting Configuration */}
                {hasKnowledgebase && !isEnvKnowledgebase && (
                    <div className="glass-card-strong p-6 mb-6">
                        <h2 className="font-poppins font-bold text-white text-lg mb-4 flex items-center gap-2">
                            <span>🚀</span>
                            <span>Save for Everyone (Deployment)</span>
                        </h2>

                        <div className="bg-foc-blue/10 border border-foc-blue/30 rounded-xl p-4 mb-4">
                            <p className="text-gray-300 text-sm mb-3">
                                To make this knowledgebase permanent for <strong>ALL</strong> users on Vercel/Netlify,
                                copy this ID and save it as an Environment Variable.
                            </p>

                            <div className="flex items-center gap-2 mb-2">
                                <code className="flex-1 bg-black/30 p-3 rounded-lg text-foc-orange font-mono text-xs break-all">
                                    {geminiService.getStoredRagStore()}
                                </code>
                                <button
                                    onClick={() => {
                                        const store = geminiService.getStoredRagStore();
                                        if (store) navigator.clipboard.writeText(store);
                                        alert('ID Copied!');
                                    }}
                                    className="btn-secondary px-3 py-2 text-sm"
                                >
                                    📋 Copy
                                </button>
                            </div>

                            <div className="text-xs text-gray-400 mt-2">
                                <strong>Steps:</strong>
                                <ol className="list-decimal list-inside ml-2 mt-1 space-y-1">
                                    <li>Go to Vercel/Netlify Dashboard</li>
                                    <li>Go to <strong>Settings</strong> &rarr; <strong>Environment Variables</strong></li>
                                    <li>Add Key: <code className="text-white">VITE_RAG_STORE_NAME</code></li>
                                    <li>Paste Value: (The ID above)</li>
                                    <li>Redeploy your app or wait for auto-deploy</li>
                                </ol>
                            </div>
                        </div>
                    </div>
                )}

                {/* Upload New Documents */}
                {!isEnvKnowledgebase && (
                    <div className="glass-card p-6">
                        <h2 className="font-poppins font-bold text-white text-lg mb-4 flex items-center gap-2">
                            <span>⬆️</span>
                            <span>{hasKnowledgebase ? 'Replace Knowledgebase' : 'Upload Documents'}</span>
                        </h2>

                        {!isApiKeySet && (
                            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-4">
                                <p className="text-yellow-400 text-sm">
                                    ⚠️ Please configure your API key above before uploading documents.
                                </p>
                            </div>
                        )}

                        {hasKnowledgebase && (
                            <div className="bg-foc-blue/10 border border-foc-blue/30 rounded-xl p-4 mb-4">
                                <p className="text-foc-blue text-sm">
                                    ℹ️ Uploading new documents will replace the current knowledgebase.
                                </p>
                            </div>
                        )}

                        {/* Upload Progress */}
                        {uploadProgress && (
                            <div className="bg-foc-purple/10 border border-foc-purple/30 rounded-xl p-4 mb-4">
                                <p className="text-foc-purple text-sm flex items-center gap-2">
                                    {isUploading && <Spinner />}
                                    <span>{uploadProgress}</span>
                                </p>
                            </div>
                        )}

                        {/* Drag & Drop Area */}
                        <div
                            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all mb-4 ${isDragging
                                ? 'border-foc-orange bg-foc-orange/10'
                                : 'border-gray-600 hover:border-foc-orange/50'
                                } ${!isApiKeySet || isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                        >
                            <div className="text-5xl mb-4">📁</div>
                            <p className="text-gray-300 mb-3">
                                Drag & drop PDF, TXT, or MD files here
                            </p>
                            <input
                                id="admin-file-upload"
                                type="file"
                                multiple
                                className="hidden"
                                onChange={handleFileChange}
                                accept=".pdf,.txt,.md"
                                disabled={!isApiKeySet || isUploading}
                            />
                            <label
                                htmlFor="admin-file-upload"
                                className={`inline-block cursor-pointer px-6 py-2 bg-foc-blue text-white rounded-full font-semibold hover:bg-foc-blue-dark transition-all ${!isApiKeySet || isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                Browse Files
                            </label>
                        </div>

                        {/* Selected Files */}
                        {files.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="text-white font-semibold">
                                    Files to Upload ({files.length}):
                                </h3>
                                <div className="max-h-48 overflow-y-auto space-y-2">
                                    {files.map((file, index) => (
                                        <div
                                            key={`${file.name}-${index}`}
                                            className="flex items-center justify-between bg-white/5 p-3 rounded-xl"
                                        >
                                            <div className="flex items-center gap-3 truncate">
                                                <span className="text-xl">📄</span>
                                                <div className="truncate">
                                                    <p className="text-white truncate">{file.name}</p>
                                                    <p className="text-gray-500 text-xs">
                                                        {(file.size / 1024).toFixed(1)} KB
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveFile(index)}
                                                className="text-red-400 hover:text-red-300 p-2"
                                                disabled={isUploading}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={handleUploadClick}
                                    disabled={!isApiKeySet || isUploading}
                                    className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isUploading ? (
                                        <>
                                            <Spinner />
                                            <span>Uploading...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>🚀</span>
                                            <span>{hasKnowledgebase ? 'Replace & Index Documents' : 'Upload & Index Documents'}</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Security Note */}
                <div className="glass-card p-6 mt-6">
                    <div className="bg-foc-orange/10 border border-foc-orange/30 rounded-xl p-4">
                        <p className="text-foc-orange text-sm flex items-start gap-2">
                            <span>🔒</span>
                            <span>
                                <strong>Security:</strong> API key and knowledgebase can be stored in browser's localStorage (manual) or pre-configured via Environment Variables (recommended for production).
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default AdminPanel;

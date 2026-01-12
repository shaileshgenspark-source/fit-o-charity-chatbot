/**
 * Fit-O-Charity WelcomeScreen
 * Chat-only dashboard for users (no file upload)
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface WelcomeScreenProps {
    onAdminMode: () => void;
    hasApiKey: boolean;
    hasKnowledgebase: boolean;
    onStartChat: () => void;
    uploadedDocs: string[];
}

// Event activities with emoji icons
const activities = [
    { name: 'Gym', icon: '🏋️' },
    { name: 'Walking', icon: '🚶' },
    { name: 'Running', icon: '🏃' },
    { name: 'Cycling', icon: '🚴' },
    { name: 'Yoga', icon: '🧘' },
];

// Stats for the event
const eventStats = [
    { label: 'Duration', value: '21 Days', icon: '📅' },
    { label: 'Start Date', value: 'Jan 26, 2026', icon: '🚀' },
    { label: 'End Date', value: 'Feb 15, 2026', icon: '🏁' },
    { label: 'Registration', value: '₹349/-', icon: '💰' },
];

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
    onAdminMode,
    hasApiKey,
    hasKnowledgebase,
    onStartChat,
    uploadedDocs
}) => {
    return (
        <div className="scrollable-page">
            {/* Floating Background Elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-20 left-10 text-6xl opacity-20 float-icon-1">🏃</div>
                <div className="absolute top-40 right-20 text-5xl opacity-20 float-icon-2">🚴</div>
                <div className="absolute bottom-40 left-20 text-5xl opacity-20 float-icon-3">🧘</div>
                <div className="absolute bottom-20 right-10 text-6xl opacity-20 float-icon-4">🏋️</div>
                <div className="absolute top-1/2 left-1/4 text-4xl opacity-15 float-icon-5">💪</div>
                <div className="absolute top-1/3 right-1/3 text-4xl opacity-15 float-icon-1">❤️</div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 px-4 py-8 md:py-12">
                {/* Header with Admin Button */}
                <div className="max-w-6xl mx-auto mb-8 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-foc-orange to-foc-pink flex items-center justify-center text-2xl shadow-glow-orange">
                            🏃
                        </div>
                        <span className="font-poppins font-bold text-white text-xl">Fit-O-Charity</span>
                    </div>
                    <button
                        onClick={onAdminMode}
                        className="btn-secondary text-sm flex items-center gap-2"
                    >
                        <span>🔐</span>
                        <span className="hidden sm:inline">Admin</span>
                    </button>
                </div>

                {/* Hero Section */}
                <div className="max-w-6xl mx-auto text-center mb-12">
                    <div className="inline-block mb-4">
                        <span className="bg-foc-orange/20 text-foc-orange px-4 py-2 rounded-full text-sm font-semibold animate-pulse">
                            🎉 Season IV is Here!
                        </span>
                    </div>

                    <h1 className="font-poppins text-4xl md:text-6xl lg:text-7xl font-black text-white mb-4 leading-tight">
                        <span className="gradient-text">Sukrut Parivar</span>
                        <br />
                        <span className="text-white">Charitable Trust</span>
                    </h1>

                    <h2 className="font-poppins text-2xl md:text-4xl font-bold gradient-text-blue mb-6">
                        Fit-O-Charity 2026
                    </h2>

                    <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
                        <a 
                            href="https://pages.razorpay.com/SFOC4" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="btn-primary text-xl px-8 py-4 flex items-center justify-center gap-3 animate-glow-orange"
                        >
                            <span>📝</span>
                            <span>Register Now!</span>
                        </a>
                    </div>

                    <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-8">
                        A <span className="text-foc-orange font-semibold">21-day virtual fitness challenge</span> to make you a philanthropist!
                        Ask anything about the event below.
                    </p>

                    {/* Event Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-10">
                        {eventStats.map((stat, index) => (
                            <div
                                key={stat.label}
                                className="glass-card p-4 animate-slide-up"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className="text-2xl mb-2">{stat.icon}</div>
                                <div className="text-foc-orange font-bold text-lg">{stat.value}</div>
                                <div className="text-gray-400 text-sm">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Activities Section */}
                <div className="max-w-4xl mx-auto mb-12">
                    <h3 className="text-center text-white font-poppins font-bold text-2xl mb-6">
                        🏆 Participate in Any Activity
                    </h3>
                    <div className="flex flex-wrap justify-center gap-4">
                        {activities.map((activity, index) => (
                            <div
                                key={activity.name}
                                className={`activity-card flex items-center gap-3 cursor-default animate-bounce-in`}
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <span className="text-3xl">{activity.icon}</span>
                                <span className="text-white font-semibold">{activity.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Action Section - Chat Only */}
                <div className="max-w-2xl mx-auto">
                    <div className="glass-card-strong p-8">
                        <h3 className="text-center text-white font-poppins font-bold text-2xl mb-2">
                            💬 Ask Me Anything!
                        </h3>
                        <p className="text-center text-gray-400 mb-6">
                            Get instant answers about Fit-O-Charity event
                        </p>

                        {/* Status Checks */}
                        {!hasApiKey ? (
                            <div className="space-y-4">
                                <div className="w-full bg-yellow-500/10 border border-yellow-500/30 rounded-2xl py-4 px-5 text-center">
                                    <p className="text-yellow-400 mb-3">
                                        ⚠️ API Key not configured
                                    </p>
                                    <button
                                        onClick={onAdminMode}
                                        className="btn-primary text-sm"
                                    >
                                        🔐 Configure in Admin Panel
                                    </button>
                                </div>
                            </div>
                        ) : !hasKnowledgebase ? (
                            <div className="space-y-4">
                                <div className="w-full bg-foc-blue/10 border border-foc-blue/30 rounded-2xl py-4 px-5 text-center">
                                    <p className="text-foc-blue mb-3">
                                        📚 Knowledgebase not set up yet
                                    </p>
                                    <p className="text-gray-400 text-sm mb-4">
                                        Admin needs to upload event documents first
                                    </p>
                                    <button
                                        onClick={onAdminMode}
                                        className="btn-primary text-sm"
                                    >
                                        🔐 Go to Admin Panel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Ready to Chat */}
                                <div className="w-full bg-foc-green/10 border border-foc-green/30 rounded-2xl py-3 px-5 text-center text-foc-green font-semibold flex items-center justify-center gap-2">
                                    <span>✓</span>
                                    <span>Knowledgebase Ready ({uploadedDocs.length} documents)</span>
                                </div>

                                <button
                                    onClick={onStartChat}
                                    className="w-full btn-primary text-lg flex items-center justify-center gap-2 py-4"
                                >
                                    <span>🚀</span>
                                    <span>Start Chatting</span>
                                </button>

                                {/* Show uploaded docs */}
                                {uploadedDocs.length > 0 && (
                                    <div className="text-center">
                                        <p className="text-gray-500 text-xs">
                                            Loaded: {uploadedDocs.slice(0, 3).join(', ')}
                                            {uploadedDocs.length > 3 && ` +${uploadedDocs.length - 3} more`}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Charity Info */}
                <div className="max-w-4xl mx-auto mt-12 text-center">
                    <div className="glass-card p-6 inline-block">
                        <p className="text-gray-300">
                            <span className="text-foc-green font-bold">₹10</span> per fitness point goes to charity!
                            <span className="text-foc-orange font-semibold"> All surplus will be used for charity purpose only.</span>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <footer className="max-w-6xl mx-auto mt-16 pb-8 text-center text-gray-500 text-sm">
                    <p className="mb-2">
                        <span className="text-foc-orange">Sukrut Parivar Charitable Trust</span> |
                        <a href="https://www.sukrutparivar.org" target="_blank" rel="noopener noreferrer" className="text-foc-blue hover:underline ml-1">
                            www.sukrutparivar.org
                        </a>
                    </p>
                    <p>
                        For queries: 8905030507 | 9712191929 | 9898160843 | 8866102962 | 7567568003
                    </p>
                    <div className="flex justify-center gap-4 mt-4">
                        <span className="text-2xl hover:scale-125 transition-transform cursor-pointer">📷</span>
                        <span className="text-2xl hover:scale-125 transition-transform cursor-pointer">📘</span>
                        <span className="text-2xl hover:scale-125 transition-transform cursor-pointer">💼</span>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default WelcomeScreen;

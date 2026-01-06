/**
 * Fit-O-Charity ProgressBar
 * Animated progress bar with gradient and event theming
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface ProgressBarProps {
  progress: number;
  total: number;
  message?: string;
  fileName?: string;
  icon?: React.ReactNode;
}

const fitnessMessages = [
  "🏃 Getting ready for the challenge...",
  "💪 Building your fitness knowledge...",
  "🚴 Cycling through the documents...",
  "🧘 Finding inner peace with your data...",
  "🏋️ Lifting heavy files...",
];

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, total, message, fileName, icon }) => {
  const percentage = Math.min((progress / total) * 100, 100);
  const randomMessage = fitnessMessages[Math.floor(Math.random() * fitnessMessages.length)];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="glass-card-strong p-8 w-full max-w-md text-center">
        {/* Animated Icon */}
        <div className="mb-6">
          {icon || (
            <div className="text-6xl animate-bounce">
              {percentage < 30 ? '📄' : percentage < 70 ? '⚡' : percentage < 100 ? '🚀' : '✅'}
            </div>
          )}
        </div>

        {/* Progress Text */}
        <h2 className="font-poppins text-xl font-bold text-white mb-2">
          {message || randomMessage}
        </h2>

        {fileName && (
          <p className="text-foc-orange text-sm mb-4 truncate">
            {fileName}
          </p>
        )}

        {/* Progress Bar */}
        <div className="w-full bg-white/10 rounded-full h-4 mb-4 overflow-hidden">
          <div
            className="h-full progress-gradient rounded-full transition-all duration-500 ease-out relative"
            style={{ width: `${percentage}%` }}
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 shimmer"></div>
          </div>
        </div>

        {/* Percentage */}
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-400">
            Step {progress} of {total}
          </span>
          <span className="text-foc-orange font-bold">
            {Math.round(percentage)}%
          </span>
        </div>

        {/* Motivational text */}
        <p className="text-gray-500 text-xs mt-4">
          {percentage < 50
            ? "Just getting started! 💪"
            : percentage < 90
              ? "Almost there, keep going! 🏃"
              : "Finishing up! 🎉"
          }
        </p>
      </div>
    </div>
  );
};

export default ProgressBar;
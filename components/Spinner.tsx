/**
 * Fit-O-Charity Spinner
 * Animated loading spinner with gradient effect
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

const Spinner: React.FC = () => {
    return (
        <div className="relative">
            <div className="w-8 h-8 border-4 border-white/20 rounded-full animate-spin border-t-foc-orange"></div>
        </div>
    );
};

export default Spinner;

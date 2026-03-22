import React from 'react';
import { FractalMethod } from '../shared/types';

interface ControlPanelProps {
    selectedMethod: FractalMethod;
    onMethodChange: (method: FractalMethod) => void;
    onGenerate: () => void;
    onSurpriseMe: () => void;
    isGenerating: boolean;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
    selectedMethod,
    onMethodChange,
    onGenerate,
    onSurpriseMe,
    isGenerating,
}) => {
    return (
        <div className="control-panel">
            <div className="control-group">
                <label htmlFor="fractal-method">Fractal Method</label>
                <select
                    id="fractal-method"
                    value={selectedMethod}
                    onChange={(e) => onMethodChange(e.target.value as FractalMethod)}
                    disabled={isGenerating}
                >
                    {Object.values(FractalMethod).map((method) => (
                        <option key={method} value={method}>
                            {method}
                        </option>
                    ))}
                </select>
            </div>

            <div className="button-group">
                <button className="btn-primary" onClick={onGenerate} disabled={isGenerating}>
                    {isGenerating ? 'Generating...' : 'Go'}
                </button>
                <button className="btn-secondary" onClick={onSurpriseMe} disabled={isGenerating}>
                    Surprise Me
                </button>
            </div>
        </div>
    );
};

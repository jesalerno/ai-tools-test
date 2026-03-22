import React from 'react';

interface CardDisplayProps {
    imageSrc?: string;
    isLoading: boolean;
    error?: string;
}

export const CardDisplay: React.FC<CardDisplayProps> = ({ imageSrc, isLoading, error }) => {
    return (
        <div className="card-display-container">
            <div className="card-frame">
                {isLoading ? (
                    <div className="loading-spinner">Generating...</div>
                ) : error ? (
                    <div className="error-message">{error}</div>
                ) : imageSrc ? (
                    <img src={imageSrc} alt="Fractal Card Back" className="card-image" />
                ) : (
                    <div className="placeholder-text">Select a method and click Go to generate a card.</div>
                )}
            </div>
        </div>
    );
};

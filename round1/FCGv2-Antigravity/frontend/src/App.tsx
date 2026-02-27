import React, { useState } from 'react';
import './index.css';
import { ControlPanel } from './components/ControlPanel';
import { CardDisplay } from './components/CardDisplay';
import { FractalMethod } from './shared/types';
import { useFractalGeneration } from './hooks/useFractalGeneration';

function App() {
    const [selectedMethod, setSelectedMethod] = useState<FractalMethod>(FractalMethod.Mandelbrot);
    const { imageSrc, loading, error, generate, surpriseMe } = useFractalGeneration();

    const handleGenerate = () => {
        generate(selectedMethod);
    };

    return (
        <div className="app-container">
            <header className="app-header">
                <h1>Fractal Card Generator</h1>
            </header>
            <main className="main-content">
                <section className="controls-section">
                    <ControlPanel
                        selectedMethod={selectedMethod}
                        onMethodChange={setSelectedMethod}
                        onGenerate={handleGenerate}
                        onSurpriseMe={surpriseMe}
                        isGenerating={loading}
                    />
                </section>
                <section className="display-section">
                    <CardDisplay imageSrc={imageSrc} isLoading={loading} error={error} />
                </section>
            </main>
        </div>
    );
}

export default App;
